import * as saavn from '../services/jiosaavn.service.js';
import { sendSuccess } from '../utils/response.js';

export const getAlbum = async (req, res) => sendSuccess(res, await saavn.getAlbum(req.valid.params.token));
