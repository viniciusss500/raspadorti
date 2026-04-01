const { parseSize, extractEpisodeInfo } = require('../utils/parser');
const { isBrazilianAudio } = require('../utils/filters');
const { dedupeTorrents } = require('../utils/dedupe');
const { getQuality } = require('../utils/quality');

function processTorrents(torrents, { season, episode }) {
  let results = torrents;

  results = results.filter(t => isBrazilianAudio(t.name));

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

  results = results.map(t => ({
    ...t,
    sizeBytes: parseSize(t.size),
    quality: getQuality(t.name)
  }));

  results = dedupeTorrents(results);

  return results.sort((a, b) =>
    (b.seeders || 0) - (a.seeders || 0)
  ).slice(0, 20);
}

module.exports = { processTorrents };
