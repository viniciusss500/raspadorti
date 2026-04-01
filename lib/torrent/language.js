'use strict';

function detectLanguage(title) {
  const t = title.toLowerCase();

  const isPTBR = /pt[-_. ]?br|portuguese|dublado|nacional/.test(t);
  const isDual = /dual|multi|2 audio|dual audio/.test(t);
  const isSub  = /legendado|sub/.test(t);

  const hasPT = /pt|portugu/.test(t);
  const hasEN = /eng|english/.test(t);

  const inferredDual = hasPT && hasEN;

  return {
    isPTBR,
    isDual: isDual || inferredDual,
    isSub,
  };
}

function allowLanguage(lang) {
  // bloqueia legendado puro
  if (lang.isSub && !lang.isDual && !lang.isPTBR) {
    return false;
  }

  return lang.isPTBR || lang.isDual;
}

module.exports = { detectLanguage, allowLanguage };
