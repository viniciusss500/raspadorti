'use strict';

function matchEpisode(files, season, episode) {
  if (!files || !files.length) return null;

  const rx = new RegExp(`S?0?${season}E0?${episode}`, 'i');

  return files.find(f => rx.test(f.path || f.name || ''));
}

function resolveFileIdx(files, season, episode) {
  const match = matchEpisode(files, season, episode);

  if (match) {
    return files.indexOf(match);
  }

  // fallback → maior arquivo
  let max = 0;
  let idx = 0;

  files.forEach((f, i) => {
    if ((f.length || 0) > max) {
      max = f.length;
      idx = i;
    }
  });

  return idx;
}

module.exports = { resolveFileIdx };
