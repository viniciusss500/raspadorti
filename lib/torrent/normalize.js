'use strict';

// ================================================================
// HASH EXTRACTION (INLINE - SEM DEPENDÊNCIA EXTERNA)
// ================================================================

function base32ToHex(b) {
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';

  for (const c of b.toUpperCase()) {
    const v = alpha.indexOf(c);
    if (v !== -1) {
      bits += v.toString(2).padStart(5, '0');
    }
  }

  let hex = '';
  for (let i = 0; i + 4 <= bits.length; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  }

  return hex.slice(0, 40);
}

function extractInfoHash(t) {
  if (t.magnet_link) {
    const m = t.magnet_link.match(/urn:btih:([A-Za-z0-9]+)/i);

    if (m) {
      if (m[1].length === 40) {
        return m[1].toLowerCase();
      }

      if (m[1].length === 32) {
        return base32ToHex(m[1]);
      }
    }
  }

  const h = (t.info_hash || '').toLowerCase();
  return h.length === 40 ? h : null;
}

// ================================================================
// NORMALIZE
// ================================================================

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
