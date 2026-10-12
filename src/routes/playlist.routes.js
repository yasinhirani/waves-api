import { Router } from 'express';
import { getPlaylist } from '../controllers/playlist.controller.js';
import { validate } from '../middlewares/validate.js';
import { tokenParams, playlistQuery } from '../validators/music.validator.js';

const router = Router();
router.get('/:token', validate({ params: tokenParams, query: playlistQuery }), getPlaylist);
export default router;
