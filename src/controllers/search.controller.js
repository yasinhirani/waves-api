import * as saavn from '../services/jiosaavn.service.js';
import { sendSuccess } from '../utils/response.js';

const handler = (fn) => async (req, res) => sendSuccess(res, await fn(req.valid.query));

export const searchSongs = handler(saavn.searchSongs);
export const searchAlbums = handler(saavn.searchAlbums);
export const searchPlaylists = handler(saavn.searchPlaylists);
export const searchArtists = handler(saavn.searchArtists);
