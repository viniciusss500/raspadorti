'use strict';

const { extractInfoHash } = require('../../utils/hash');

function normalizeTorrent(t) {
  return {
    raw: t,
    title: t.title || t.original_title || '',
    sizeRaw: t.size || null,
    sizeBytes: null,
    files: t.files || [],
    infoHash: extractInfoHash(t),
    magnet: t.magnet_link || null,
    seeders: t.seed_count ?? t.seeders ?? 0,
    indexer: t._label || 'Unknown',
  };
}

module.exports = { normalizeTorrent };
