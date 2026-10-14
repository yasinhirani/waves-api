import * as saavn from '../services/jiosaavn.service.js';
import { sendSuccess } from '../utils/response.js';

export const getPodcastEpisodes = async (req, res) =>
  sendSuccess(res, await saavn.getShowEpisodes(req.valid.params.showId, req.valid.query));

export const getPodcast = async (req, res) =>
  sendSuccess(res, await saavn.getShow(req.valid.params.token, req.valid.query));
