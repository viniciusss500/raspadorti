'use strict';

function parseSize(str) {
  if (!str) return 0;
  const m = String(str).match(/([\d.]+)\s*(GB|MB|KB|B)?/i);
  if (!m) return 0;

  const n = parseFloat(m[1]);
  const u = (m[2] || 'B').toUpperCase();

  return u === 'GB' ? n * 1e9 :
         u === 'MB' ? n * 1e6 :
         u === 'KB' ? n * 1e3 : n;
}

function enrichTorrent(t) {
  // 1. size direto
  if (t.sizeRaw) {
    t.sizeBytes = parseSize(t.sizeRaw);
  }

  // 2. fallback via files
  if ((!t.sizeBytes || t.sizeBytes === 0) && t.files?.length) {
    t.sizeBytes = t.files.reduce((acc, f) => acc + (f.length || 0), 0);
  }

  return t;
}

function enrichBatch(arr) {
  return arr.map(enrichTorrent);
}

module.exports = { enrichBatch };
