import he from 'he';
import { createDownloadLinks, createImageLinks, extractToken } from './media.js';

/**
 * Recursively walks a JioSaavn payload and:
 *  - converts every `image` string into 50/150/500 image links
 *  - converts `more_info.encrypted_media_url` into `downloadUrl` (5 qualities)
 *  - adds `token` (from perma_url) so the client can request details
 *  - decodes HTML entities (&quot; &amp; ...)
 */
export const transform = (node) => {
  if (Array.isArray(node)) return node.map(transform);

  if (node && typeof node === 'object') {
    const out = {};
    for (const [key, value] of Object.entries(node)) {
      if (key === 'encrypted_media_url') continue;
      if (key === 'image' && typeof value === 'string') out.image = createImageLinks(value);
      else out[key] = transform(value);
    }

    const encrypted = node.more_info?.encrypted_media_url;
    if (encrypted) out.downloadUrl = createDownloadLinks(encrypted);

    if (typeof node.perma_url === 'string') out.token = extractToken(node.perma_url);
    return out;
  }

  return typeof node === 'string' ? he.decode(node) : node;
};
