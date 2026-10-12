import { Router } from 'express';
import { getArtist } from '../controllers/artist.controller.js';
import { validate } from '../middlewares/validate.js';
import { tokenParams, artistQuery } from '../validators/music.validator.js';

const router = Router();
router.get('/:token', validate({ params: tokenParams, query: artistQuery }), getArtist);
export default router;
