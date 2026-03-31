function parseSize(size) {
  if (!size) return 0;

  if (typeof size === 'number') return size;

  const str = size.toLowerCase();

  const match = str.match(/([\d.]+)\s*(gb|mb|kb)/);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'gb': return value * 1024 ** 3;
    case 'mb': return value * 1024 ** 2;
    case 'kb': return value * 1024;
    default: return 0;
  }
}

function extractEpisodeInfo(name) {
  const n = name.toLowerCase();

  let match = n.match(/s(\d{1,2})e(\d{1,2})/);
  if (match) {
    return { season: +match[1], episode: +match[2], isPack: false };
  }

  match = n.match(/(\d{1,2})x(\d{1,2})/);
  if (match) {
    return { season: +match[1], episode: +match[2], isPack: false };
  }

  match = n.match(/season\s*(\d{1,2})|temporada\s*(\d{1,2})/);
  if (match) {
    return { season: +(match[1] || match[2]), episode: null, isPack: true };
  }

  return null;
}

module.exports = {
  parseSize,
  extractEpisodeInfo
};
