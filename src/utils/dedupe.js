function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/\W+/g, '');
}

function dedupeTorrents(torrents) {
  const seen = new Map();

  for (const t of torrents) {
    const key = normalizeName(t.name);

    if (!seen.has(key)) {
      seen.set(key, t);
    } else {
      const existing = seen.get(key);

      if ((t.seeders || 0) > (existing.seeders || 0)) {
        seen.set(key, t);
      }
    }
  }

  return Array.from(seen.values());
}

module.exports = { dedupeTorrents };
