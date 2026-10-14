import * as saavn from '../services/jiosaavn.service.js';
import { sendSuccess } from '../utils/response.js';

export const startRadio = async (req, res) => {
  const { name, language } = req.valid.query;
  sendSuccess(res, await saavn.startRadioStation(name, language));
};

export const getMoreRadioSongs = async (req, res) => {
  const songs = await saavn.getMoreRadioSongs(req.valid.params.stationId, req.valid.query.count);
  sendSuccess(res, { songs });
};
