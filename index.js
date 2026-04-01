'use strict';

const express   = require('express');
const fetch     = require('node-fetch');
const rateLimit = require('express-rate-limit');
const redis     = require('redis');

const {
  normalizeTorrent
} = require('./lib/torrent/normalize');

const {
  enrichBatch
} = require('./lib/torrent/enrich');

const {
  detectLanguage,
  allowLanguage
} = require('./lib/torrent/language');

const {
  classifyTorrent
} = require('./lib/torrent/classify');

const {
  resolveFileIdx
} = require('./lib/torrent/matcher');

const {
  rankTorrents
} = require('./lib/torrent/ranker');

// ================================================================
// APP
// ================================================================

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// ================================================================
// REDIS
// ================================================================

const CACHE_TTL = 3600;
let redisClient = null;

async function initRedis() {
  if (!process.env.REDIS_URL) return;
  redisClient = redis.createClient({ url: process.env.REDIS_URL });
  await redisClient.connect();
}

async function cacheGet(key) {
  if (!redisClient) return null;
  try {
    const v = await redisClient.get(key);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}

async function cacheSet(key, val) {
  if (!redisClient) return;
  try {
    await redisClient.set(key, JSON.stringify(val), { EX: CACHE_TTL });
  } catch {}
}

// ================================================================
// RATE LIMIT
// ================================================================

const limiter = rateLimit({ windowMs: 60000, max: 60 });
app.use(limiter);

// ================================================================
// HASH
// ================================================================

function extractInfoHash(t) {
  if (t.magnet_link) {
    const m = t.magnet_link.match(/btih:([A-Za-z0-9]+)/i);
    if (m) return m[1].toLowerCase();
  }
  return (t.info_hash || '').toLowerCase();
}

// ================================================================
// BUILD STREAM
// ================================================================

function buildStream(t, opts = {}) {
  const infoHash = extractInfoHash(t);
  if (!infoHash) return null;

  const stream = {
    name: `🇧🇷 ${t._label || 'TIndexer'}`,
    description: t.title,
    infoHash,
    behaviorHints: {
      notWebReady: true
    }
  };

  if (opts.fileIdx !== null && opts.fileIdx !== undefined) {
    stream.fileIdx = opts.fileIdx;
  }

  if (t.magnet_link) {
    stream.magnetUrl = t.magnet_link;
  }

  return stream;
}

// ================================================================
// FETCH INDEXERS
// ================================================================

async function fetchIndexer(baseUrl, name, query) {
  try {
    const url = `${baseUrl}/indexers/${name}?q=${encodeURIComponent(query)}`;
    const res = await fetch(url);

    if (!res.ok) return [];

    const data = await res.json();

    return (data.results || []).map(t => ({
      ...t,
      _label: name
    }));

  } catch {
    return [];
  }
}

async function fetchAll(cfg, query) {
  const tasks = cfg.indexers.map(n => fetchIndexer(cfg.indexerUrl, n, query));
  const res = await Promise.all(tasks);
  return res.flat();
}

// ================================================================
// CONFIG
// ================================================================

const DEFAULT_CONFIG = {
  indexerUrl: 'https://tindexer.onrender.com',
  indexers: ['bludv','comando_torrents','rede_torrent']
};

// ================================================================
// ROUTE
// ================================================================

app.get('/stream/:type/:id.json', async (req, res) => {
  const { type, id } = req.params;

  const parts = id.split(':');
  const imdb = parts[0];
  const season = parts[1] ? parseInt(parts[1]) : null;
  const episode = parts[2] ? parseInt(parts[2]) : null;

  const isSeries = type === 'series';

  const cacheKey = `${type}:${id}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return res.json({ streams: cached });

  const query = imdb;

  // ================================================================
  // PIPELINE NOVO
  // ================================================================

  let torrents = await fetchAll(DEFAULT_CONFIG, query);

  // normalize
  torrents = torrents.map(normalizeTorrent);

  // enrich
  torrents = enrichBatch(torrents);

  // language
  torrents = torrents.map(t => {
    t.lang = detectLanguage(t.title);
    return t;
  });

  torrents = torrents.filter(t => allowLanguage(t.lang));

  // classify
  torrents = torrents.map(t => {
    t.type = classifyTorrent(t);
    return t;
  });

  // rank
  torrents = rankTorrents(torrents);

  // ================================================================
  // STREAM BUILD
  // ================================================================

  const streams = [];

  for (const t of torrents) {
    let fileIdx = null;

    if (isSeries && season && episode) {
      fileIdx = resolveFileIdx(t.files, season, episode);
    }

    const s = buildStream(t.raw, {
      fileIdx,
      isPack: t.type === 'pack'
    });

    if (s) streams.push(s);
  }

  if (streams.length) {
    await cacheSet(cacheKey, streams);
  }

  res.json({ streams });
});

// ================================================================
// START
// ================================================================

if (require.main === module) {
  const PORT = process.env.PORT || 7001;
  initRedis().then(() => {
    app.listen(PORT, () => {
      console.log(`Running on http://localhost:${PORT}`);
    });
  });
}

module.exports = app;
