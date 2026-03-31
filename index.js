require('dotenv').config();

const { addonBuilder } = require('stremio-addon-sdk');
const express = require('express');

const { getCacheKey, getCached, setCache } = require('./utils/cache');
const { processTorrents } = require('./services/torrentService');

// 👉 você já deve ter algo assim (sua busca real)
const { searchTorrents } = require('./services/search'); 

const PORT = process.env.PORT || 7007;

const manifest = {
  id: 'org.indexabr.addon',
  version: '1.0.0',
  name: 'IndexaBR',
  description: 'Addon brasileiro de torrents (filmes e séries)',
  resources: ['stream'],
  types: ['movie', 'series'],
  idPrefixes: ['tt']
};

const builder = new addonBuilder(manifest);

/**
 * 🎬 STREAM HANDLER
 */
builder.defineStreamHandler(async (args) => {
  try {
    const { id, type } = args;

    let imdbId = id;
    let season = null;
    let episode = null;

    // 👉 séries vêm como: tt123456:1:2
    if (type === 'series') {
      const parts = id.split(':');
      imdbId = parts[0];
      season = Number(parts[1]);
      episode = Number(parts[2]);
    }

    const cacheKey = getCacheKey({ imdbId, season, episode });

    // ⚡ CACHE
    const cached = getCached(cacheKey);
    if (cached) {
      console.log('⚡ Cache hit:', cacheKey);
      return { streams: cached };
    }

    console.log('🔎 Buscando torrents:', imdbId);

    // 🔎 BUSCA
    let torrents = await searchTorrents({
      imdbId,
      season,
      episode,
      type
    });

    if (!torrents || torrents.length === 0) {
      return { streams: [] };
    }

    // 🧠 PROCESSAMENTO COMPLETO
    torrents = processTorrents(torrents, {
      season,
      episode
    });

    if (!torrents.length) {
      return { streams: [] };
    }

    // 🎥 STREAMS FORMATADOS
    const streams = torrents.map((t) => {
      const isPack = t.name.toLowerCase().includes('temporada') ||
                     t.name.toLowerCase().includes('season');

      return {
        name: `IndexaBR ${t.quality}`,
        title: isPack
          ? `📦 Temporada ${season} completa\n${t.name}`
          : t.name,
        infoHash: t.infoHash,
        fileIdx: 0,
        behaviorHints: {
          videoSize: t.sizeBytes
        }
      };
    });

    // 💾 SALVA CACHE
    setCache(cacheKey, streams);

    return { streams };

  } catch (err) {
    console.error('❌ Erro no streamHandler:', err);
    return { streams: [] };
  }
});

/**
 * 🚀 SERVIDOR EXPRESS
 */
const app = express();

app.get('/', (req, res) => {
  res.send('IndexaBR rodando 🚀');
});

app.get('/manifest.json', (req, res) => {
  res.json(builder.getManifest());
});

app.get('/stream/:type/:id.json', async (req, res) => {
  const result = await builder.getInterface().stream(req.params);
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`🚀 Server rodando na porta ${PORT}`);
});
