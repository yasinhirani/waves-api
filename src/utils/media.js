import forge from 'node-forge';

const DOWNLOAD_QUALITIES = [
  { id: '_12', bitrate: '12kbps' },
  { id: '_48', bitrate: '48kbps' },
  { id: '_96', bitrate: '96kbps' },
  { id: '_160', bitrate: '160kbps' },
  { id: '_320', bitrate: '320kbps' }
];

const DES_KEY = '38346591';
const DES_IV = '00000000';

export const createDownloadLinks = (encryptedMediaUrl) => {
  if (!encryptedMediaUrl) return [];

  try {
    const encrypted = forge.util.decode64(encryptedMediaUrl);
    const decipher = forge.cipher.createDecipher('DES-ECB', forge.util.createBuffer(DES_KEY));
    decipher.start({ iv: forge.util.createBuffer(DES_IV) });
    decipher.update(forge.util.createBuffer(encrypted));
    decipher.finish();
    const decryptedLink = decipher.output.getBytes();

    return DOWNLOAD_QUALITIES.map((quality) => ({
      quality: quality.bitrate,
      url: decryptedLink.replace('_96', quality.id)
    }));
  } catch {
    return [];
  }
};

export const createImageLinks = (link) => {
  if (!link) return [];

  const qualities = ['50x50', '150x150', '500x500'];
  const qualityRegex = /150x150|50x50/;
  const protocolRegex = /^http:\/\//;

  return qualities.map((quality) => ({
    quality,
    url: link.replace(qualityRegex, quality).replace(protocolRegex, 'https://')
  }));
};

/** "https://www.jiosaavn.com/album/name/fzGxJ2eyORk_" -> "fzGxJ2eyORk_" */
export const extractToken = (permaUrl) => {
  if (typeof permaUrl !== 'string') return undefined;
  const segments = permaUrl.split('?')[0].split('/').filter(Boolean);
  return segments.at(-1);
};
