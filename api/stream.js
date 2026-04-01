const { runSearch } = require('../src/core/engine');
const { getCacheKey, getCached, setCache } = require('../src/utils/cache');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
   const urlParts = req.url.split('/');

  // /api/stream/movie/tt0111161.json
   const type = urlParts[3];
   const idWithJson = urlParts[4];

  // remove .json
   const id = idWithJson?.replace('.json', '');

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
    if (cached) {
      return res.json({ streams: cached });
    }

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

    res.json({ streams });

  } catch (err) {
    console.error(err);
    res.json({ streams: [] });
  }
};
