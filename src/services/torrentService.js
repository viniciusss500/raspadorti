const { parseSize, extractEpisodeInfo } = require('../utils/parser');
const { isBrazilianAudio } = require('../utils/filters');
const { dedupeTorrents } = require('../utils/dedupe');
const { getQuality } = require('../utils/quality');
const { sortTorrents } = require('../core/scorer');

function processTorrents(torrents, { season, episode }) {
  let results = torrents;

  // 🇧🇷 idioma
  results = results.filter(t => isBrazilianAudio(t.name));

  // 📺 séries avançado
  if (season && episode) {
    results = results.filter(t => {
      const info = extractEpisodeInfo(t.name);
      if (!info) return false;

      if (!info.isPack) {
        return info.season == season && info.episode == episode;
      }

      // pack com múltiplos arquivos
      return info.season == season;
    });
  }

  // enrich
  results = results.map(t => ({
    ...t,
    sizeBytes: parseSize(t.size),
    quality: getQuality(t.name)
  }));

  // dedupe
  results = dedupeTorrents(results);

  // score + ordenação
  results = sortTorrents(results);

  return results.slice(0, 20); // limite inteligente
}

module.exports = { processTorrents };
