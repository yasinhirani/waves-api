import { z } from 'zod';

const page = z.coerce.number().int().min(1).default(1);
const limit = (def = 20) => z.coerce.number().int().min(1).max(50).default(def);

export const tokenParams = z.object({
  token: z.string().trim().min(3).max(100).regex(/^[\w,-]+$/, 'Invalid token')
});

export const searchQuery = z.object({
  q: z.string().trim().min(1, 'q is required').max(100),
  page,
  limit: limit(20)
});

export const playlistQuery = z.object({ page, limit: limit(50) });

export const artistQuery = z.object({
  page: z.coerce.number().int().min(0).default(0),
  songCount: z.coerce.number().int().min(0).max(100).default(50),
  albumCount: z.coerce.number().int().min(0).max(100).default(50),
  subType: z.string().trim().max(30).default(''),
  category: z.string().trim().max(30).default(''),
  sortOrder: z.string().trim().max(10).default('')
});
