const axios = require('axios');

async function searchJackett({ imdbId }) {
  try {
    const url = `${process.env.JACKETT_URL}/api/v2.0/indexers/all/results?apikey=${process.env.JACKETT_KEY}&imdbid=${imdbId}`;

    const res = await axios.get(url, { timeout: 8000 });

return res.data.Results
  .filter(r => r.InfoHash && r.InfoHash.length > 10) // 🔥 FILTRO CRÍTICO
  .map(r => ({
    name: r.Title,
    size: r.Size,
    seeders: r.Seeders,
    infoHash: r.InfoHash
  }));

  } catch {
    return [];
  }
}

async function searchAllIndexers(params) {
  const results = await Promise.allSettled([
    searchJackett(params)
  ]);

  let torrents = [];

  for (const r of results) {
    if (r.status === 'fulfilled') {
      torrents.push(...r.value);
    }
  }

  return torrents;
}

module.exports = { searchAllIndexers };
