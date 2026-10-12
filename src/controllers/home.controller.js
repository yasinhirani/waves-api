import * as saavn from '../services/jiosaavn.service.js';
import { sendSuccess } from '../utils/response.js';

export const getHome = async (_req, res) => sendSuccess(res, await saavn.getLaunchData());
