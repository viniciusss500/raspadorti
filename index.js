require('dotenv').config();

const { addonBuilder } = require('stremio-addon-sdk');
const express = require('express');

const { getCacheKey, getCached, setCache } = require('./utils/cache');
const { runSearch } = require('./core/engine');

const PORT = process.env.PORT || 7007;

const manifest = {
  id: 'org.indexabr.pro',
  version: '2.0.0',
  name: 'IndexaBR PRO',
  description: 'Addon brasileiro PRO ⚡',
  resources: ['stream'],
  types: ['movie', 'series'],
  idPrefixes: ['tt']
};

const builder = new addonBuilder(manifest);

builder.defineStreamHandler(async (args) => {
  try {
    const { id, type } = args;

    let imdbId = id;
    let season = null;
    let episode = null;

    if (type === 'series') {
      const parts = id.split(':');
      imdbId = parts[0];
      season = Number(parts[1]);
      episode = Number(parts[2]);
    }

    const cacheKey = getCacheKey({ imdbId, season, episode });

    const cached = getCached(cacheKey);
    if (cached) return { streams: cached };

    const torrents = await runSearch({
      imdbId,
      season,
      episode,
      type
    });

    const streams = torrents.map(t => ({
      name: `⚡ ${t.quality}`,
      title: t.name,
      infoHash: t.infoHash,
      fileIdx: 0,
      behaviorHints: {
        videoSize: t.sizeBytes
      }
    }));

    setCache(cacheKey, streams);

    return { streams };

  } catch (err) {
    console.error(err);
    return { streams: [] };
  }
});

const app = express();

app.get('/', (req, res) => {
  res.send('IndexaBR PRO rodando 🚀');
});

app.get('/manifest.json', (req, res) => {
  res.json(builder.getManifest());
});

app.get('/stream/:type/:id.json', async (req, res) => {
  const result = await builder.getInterface().stream(req.params);
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`🚀 PRO Server na porta ${PORT}`);
});
