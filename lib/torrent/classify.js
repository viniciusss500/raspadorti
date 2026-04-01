'use strict';

function classifyTorrent(t) {
  const count = t.files?.length || 1;

  if (count >= 3) return 'pack';
  if (count === 2) return 'multi';
  return 'single';
}

module.exports = { classifyTorrent };
