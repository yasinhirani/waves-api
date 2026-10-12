import { Router } from 'express';
import { getSong } from '../controllers/song.controller.js';
import { validate } from '../middlewares/validate.js';
import { tokenParams } from '../validators/music.validator.js';

const router = Router();
router.get('/:token', validate({ params: tokenParams }), getSong);
export default router;
