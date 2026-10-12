import * as saavn from '../services/jiosaavn.service.js';
import { sendSuccess } from '../utils/response.js';

export const getSong = async (req, res) => sendSuccess(res, await saavn.getSong(req.valid.params.token));
