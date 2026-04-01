const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 1800 });

function getCacheKey({ imdbId, season, episode }) {
  return `${imdbId}:${season || 0}:${episode || 0}`;
}

function getCached(key) {
  return cache.get(key);
}

function setCache(key, data) {
  cache.set(key, data);
}

module.exports = { getCacheKey, getCached, setCache };
