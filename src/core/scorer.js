function scoreTorrent(t) {
  let score = 0;

  // seeds
  score += (t.seeders || 0) * 2;

  // qualidade
  if (t.quality === '4K') score += 50;
  else if (t.quality === '1080p') score += 30;
  else if (t.quality === '720p') score += 15;

  // tamanho (evita fake pequeno)
  score += t.sizeBytes / 1e9;

  // penaliza CAM
  if (t.name.toLowerCase().includes('cam')) score -= 100;

  return score;
}

function sortTorrents(torrents) {
  return torrents.sort((a, b) => scoreTorrent(b) - scoreTorrent(a));
}

module.exports = { sortTorrents };
