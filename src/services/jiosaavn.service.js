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

async function call(params) {
  const cacheKey = JSON.stringify(params);
  const hit = cache.get(cacheKey);
  if (hit !== undefined) return hit;

  let lastError;
  for (let attempt = 0; attempt <= env.MAX_RETRIES; attempt++) {
    try {
      const res = await client.get('/api.php', { params: { ...BASE_PARAMS, ...params } });
      const data = parseBody(res.data);

      if (!data || data.status === 'failure' || data.error) {
        throw new ApiError(404, data?.error || 'Resource not found');
      }

      const result = transform(data);
      try {
        cache.set(cacheKey, result);
      } catch (e) {
        logger.warn({ err: e }, 'Cache set failed');
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

export const searchSongs = (q) => search('search.getResults', q);
export const searchAlbums = (q) => search('search.getAlbumResults', q);
export const searchPlaylists = (q) => search('search.getPlaylistResults', q);
export const searchArtists = (q) => search('search.getArtistResults', q);
