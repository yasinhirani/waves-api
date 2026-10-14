import { Router } from 'express';
import { startRadio, getMoreRadioSongs } from '../controllers/radio.controller.js';
import { validate } from '../middlewares/validate.js';
import { radioStationQuery, radioStationIdParams, radioSongsQuery } from '../validators/music.validator.js';

const router = Router();

// Radio songs are picked fresh/at random on every call: never let a browser or CDN cache these responses.
router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// One frontend call = create the station + fetch its first batch of songs.
router.get('/station', validate({ query: radioStationQuery }), startRadio);
// Called again once the player's queue for this station runs low.
router.get('/:stationId/songs', validate({ params: radioStationIdParams, query: radioSongsQuery }), getMoreRadioSongs);

export default router;
