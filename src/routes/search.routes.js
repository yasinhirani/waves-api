import { Router } from 'express';
import * as ctrl from '../controllers/search.controller.js';
import { validate } from '../middlewares/validate.js';
import { searchQuery } from '../validators/music.validator.js';

const router = Router();
const v = validate({ query: searchQuery });

router.get('/songs', v, ctrl.searchSongs);
router.get('/albums', v, ctrl.searchAlbums);
router.get('/playlists', v, ctrl.searchPlaylists);
router.get('/artists', v, ctrl.searchArtists);

export default router;
