const { parseSize, extractEpisodeInfo } = require('../utils/parser');
const { isBrazilianAudio } = require('../utils/filters');
const { dedupeTorrents } = require('../utils/dedupe');
const { getQuality } = require('../utils/quality');

function processTorrents(torrents, { season, episode }) {
  let results = torrents;

  // 🇧🇷 filtro idioma
  results = results.filter(t => isBrazilianAudio(t.name));

  // 📺 séries
  if (season && episode) {
    results = results.filter(t => {
      const info = extractEpisodeInfo(t.name);
      if (!info) return false;

      if (!info.isPack) {
        return info.season == season && info.episode == episode;
      }

      return info.season == season;
    });
  }

  // ♻️ dedupe
  results = dedupeTorrents(results);

  // 📊 enrich + ordenação
  results = results.map(t => {
    const size = parseSize(t.size);

    return {
      ...t,
      sizeBytes: size,
      quality: getQuality(t.name)
    };
  });

  results.sort((a, b) => {
    const scoreA = (a.seeders || 0) + (a.sizeBytes / 1e9);
    const scoreB = (b.seeders || 0) + (b.sizeBytes / 1e9);
    return scoreB - scoreA;
  });

  return results;
}

module.exports = { processTorrents };
