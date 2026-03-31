function getQuality(name) {
  const n = name.toLowerCase();

  if (n.includes('2160') || n.includes('4k')) return '4K';
  if (n.includes('1080')) return '1080p';
  if (n.includes('720')) return '720p';

  return 'SD';
}

module.exports = { getQuality };
