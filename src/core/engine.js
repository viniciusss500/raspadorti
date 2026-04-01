const { searchAllIndexers } = require('../services/indexers');
const { processTorrents } = require('../services/torrentService');

async function runSearch(params) {
  let torrents = await searchAllIndexers(params);
  torrents = processTorrents(torrents, params);
  return torrents;
}

module.exports = { runSearch };
