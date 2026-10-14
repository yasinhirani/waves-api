import axios from 'axios';
import NodeCache from 'node-cache';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { getRandomUserAgent } from '../utils/userAgent.js';
import { transform } from '../utils/transform.js';

const client = axios.create({
  baseURL: env.JIOSAAVN_BASE_URL,
  timeout: env.REQUEST_TIMEOUT_MS,
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9'
  }
});

// A fresh random user agent for every outgoing call (retries included).
client.interceptors.request.use((config) => {
  config.headers['User-Agent'] = getRandomUserAgent();
  return config;
});

const cache = new NodeCache({
  stdTTL: env.CACHE_TTL_SECONDS,
  checkperiod: 120,
  useClones: false,
  maxKeys: 2000
});

const BASE_PARAMS = { _format: 'json', _marker: 0, api_version: 4, ctx: 'web6dot0' };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryable = (err) =>
  !err.response || err.response.status >= 500 || err.response.status === 429;

const parseBody = (data) => {
  if (typeof data !== 'string') return data;
  try {
    return JSON.parse(data);
  } catch {
    throw new ApiError(502, 'Invalid response from upstream service');
  }
};

async function call(params, { cache: shouldCache = true } = {}) {
  const cacheKey = JSON.stringify(params);
  if (shouldCache) {
    const hit = cache.get(cacheKey);
    if (hit !== undefined) return hit;
  }

  let lastError;
  for (let attempt = 0; attempt <= env.MAX_RETRIES; attempt++) {
    try {
      const res = await client.get('/api.php', { params: { ...BASE_PARAMS, ...params } });
      const data = parseBody(res.data);

      if (!data || data.status === 'failure' || data.error) {
        throw new ApiError(404, data?.error || 'Resource not found');
      }

      const result = transform(data);
      if (shouldCache) {
        try {
          cache.set(cacheKey, result);
        } catch (e) {
          logger.warn({ err: e }, 'Cache set failed');
        }
      }
      return result;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      lastError = err;
      if (!isRetryable(err) || attempt === env.MAX_RETRIES) break;
      await sleep(300 * 2 ** attempt);
    }
  }

  logger.error({ err: lastError?.message, status: lastError?.response?.status }, 'Upstream request failed');
  throw new ApiError(502, 'Upstream music service is unavailable');
}

const detail = (type, token, extra = {}) =>
  call({ __call: 'webapi.get', token, type, includeMetaTags: 0, ...extra });

const search = (__call, { q, page, limit }) => call({ __call, q, p: page, n: limit });

export const getLaunchData = () => call({ __call: 'webapi.getLaunchData' });

export const getAlbum = (token) => detail('album', token);

export const getPlaylist = (token, { page, limit }) => detail('playlist', token, { p: page, n: limit });

export const getSong = async (token) => {
  const data = await detail('song', token);
  const song = data?.songs?.[0];
  if (!song) throw new ApiError(404, 'Song not found');
  return song;
};

export const getArtist = (token, q) =>
  detail('artist', token, {
    p: q.page,
    n_song: q.songCount,
    n_album: q.albumCount,
    sub_type: q.subType,
    category: q.category,
    sort_order: q.sortOrder
  });

// Podcast ("show") details: show info + seasons + episodes (each episode gets downloadUrl[] like songs)
export const getShow = (token, { season, sortOrder }) =>
  detail('show', token, { season_number: season, sort_order: sortOrder });

// More episodes of a show (the show details call only returns the first page).
// The response shape isn't documented: accept a bare array or an object wrapping the list.
const extractEpisodes = (data) => {
  if (Array.isArray(data)) return data;
  for (const key of ['episodes', 'list', 'results', 'data']) if (Array.isArray(data?.[key])) return data[key];
  return [];
};

/** showId is the numeric id (show_details.id), NOT the url token. */
export const getShowEpisodes = async (showId, { season, sortOrder, page }) => {
  const data = await call({
    __call: 'show.getAllEpisodes',
    show_id: showId,
    season_number: season,
    sort_order: sortOrder,
    p: page
  });
  return { page, episodes: extractEpisodes(data) };
};

// Radio: create a featured station by name, then fetch a batch of (effectively random) songs for it.
// The "next songs" call must never be cached, or the radio would just repeat the same batch forever.
const createRadioStation = (name, language) =>
  call({ __call: 'webradio.createFeaturedStation', name, language, pid: '', query: '', mode: '', artistid: '' }).then(
    (d) => d.stationid
  );

const extractStationSongs = (data) =>
  Object.entries(data ?? {})
    .filter(([key, value]) => key !== 'stationid' && value?.song)
    .map(([, value]) => value.song);

const getStationSongs = (stationId, count) =>
  call({ __call: 'webradio.getSong', stationid: stationId, k: count, next: 1 }, { cache: false }).then(
    extractStationSongs
  );

/** One call for the frontend: creates the station and returns its id plus the first batch of songs. */
export const startRadioStation = async (name, language) => {
  const stationId = await createRadioStation(name, language);
  const songs = await getStationSongs(stationId, 20);
  return { stationId, songs };
};

/** Called again by the player once the queued songs for a station run low. */
export const getMoreRadioSongs = (stationId, count) => getStationSongs(stationId, count);

export const searchSongs = (q) => search('search.getResults', q);
export const searchAlbums = (q) => search('search.getAlbumResults', q);
export const searchPlaylists = (q) => search('search.getPlaylistResults', q);
export const searchArtists = (q) => search('search.getArtistResults', q);
