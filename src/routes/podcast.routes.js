import { Router } from 'express';
import { getPodcast, getPodcastEpisodes } from '../controllers/podcast.controller.js';
import { validate } from '../middlewares/validate.js';
import { tokenParams, podcastQuery, showIdParams, podcastEpisodesQuery } from '../validators/music.validator.js';

const router = Router();
// more episodes: /podcasts/63565/episodes?season=1&sortOrder=desc&page=2   (numeric show id)
router.get('/:showId/episodes', validate({ params: showIdParams, query: podcastEpisodesQuery }), getPodcastEpisodes);
router.get('/:token', validate({ params: tokenParams, query: podcastQuery }), getPodcast);
export default router;
