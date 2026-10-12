import * as saavn from '../services/jiosaavn.service.js';
import { sendSuccess } from '../utils/response.js';

export const getPlaylist = async (req, res) =>
  sendSuccess(res, await saavn.getPlaylist(req.valid.params.token, req.valid.query));
