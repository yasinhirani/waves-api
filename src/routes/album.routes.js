import { Router } from 'express';
import { getAlbum } from '../controllers/album.controller.js';
import { validate } from '../middlewares/validate.js';
import { tokenParams } from '../validators/music.validator.js';

const router = Router();
router.get('/:token', validate({ params: tokenParams }), getAlbum);
export default router;
