import { Router } from 'express';
import homeRoutes from './home.routes.js';
import songRoutes from './song.routes.js';
import albumRoutes from './album.routes.js';
import playlistRoutes from './playlist.routes.js';
import artistRoutes from './artist.routes.js';
import searchRoutes from './search.routes.js';
import podcastRoutes from './podcast.routes.js';
import radioRoutes from './radio.routes.js';

const router = Router();

router.use('/home', homeRoutes);
router.use('/songs', songRoutes);
router.use('/albums', albumRoutes);
router.use('/playlists', playlistRoutes);
router.use('/artists', artistRoutes);
router.use('/podcasts', podcastRoutes);
router.use('/radio', radioRoutes);
router.use('/search', searchRoutes);

export default router;
