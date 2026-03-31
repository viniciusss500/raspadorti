const { searchAllIndexers } = require('../services/indexers');
const { processTorrents } = require('../services/torrentService');
const { log } = require('./logger');

async function runSearch(params) {
  const start = Date.now();

  let torrents = await searchAllIndexers(params);

  log('TOTAL_ENCONTRADOS', torrents.length);

  torrents = processTorrents(torrents, params);

  log('TOTAL_PROCESSADOS', torrents.length);
  log('TEMPO_MS', Date.now() - start);

  return torrents;
}

module.exports = { runSearch };
