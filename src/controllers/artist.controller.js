import * as saavn from '../services/jiosaavn.service.js';
import { sendSuccess } from '../utils/response.js';

export const getArtist = async (req, res) =>
  sendSuccess(res, await saavn.getArtist(req.valid.params.token, req.valid.query));
