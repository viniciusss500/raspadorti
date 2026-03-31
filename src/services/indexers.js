const axios = require('axios');
const { log } = require('../core/logger');

const INDEXERS = [
  {
    name: 'jackett',
    url: process.env.JACKETT_URL,
    key: process.env.JACKETT_KEY
  },
  {
    name: 'fallback1',
    url: process.env.FALLBACK_URL
  }
];

async function searchJackett({ imdbId }) {
  try {
    const url = `${process.env.JACKETT_URL}/api/v2.0/indexers/all/results?apikey=${process.env.JACKETT_KEY}&imdbid=${imdbId}`;

    const res = await axios.get(url, { timeout: 8000 });

    return res.data.Results.map(r => ({
      name: r.Title,
      size: r.Size,
      seeders: r.Seeders,
      infoHash: r.InfoHash
    }));

  } catch (err) {
    log('JACKETT_FAIL', err.message);
    return [];
  }
}

async function searchFallback() {
  // 👉 você pode integrar outro scraper aqui depois
  return [];
}

async function searchAllIndexers(params) {
  const results = await Promise.allSettled([
    searchJackett(params),
    searchFallback(params)
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
