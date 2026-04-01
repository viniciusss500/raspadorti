'use strict';

function getQualityScore(title) {
  if (/2160p|4k/i.test(title)) return 30;
  if (/1080p/i.test(title)) return 20;
  if (/720p/i.test(title)) return 10;
  return 0;
}

function scoreTorrent(t) {
  let s = 0;

  if (t.lang?.isPTBR) s += 50;
  if (t.lang?.isDual) s += 30;

  s += getQualityScore(t.title);

  s += Math.min(t.seeders || 0, 50);

  if (t.sizeBytes > 0) s += 5;

  return s;
}

function rankTorrents(arr) {
  return [...arr].sort((a, b) => scoreTorrent(b) - scoreTorrent(a));
}

module.exports = { rankTorrents };
