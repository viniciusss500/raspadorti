function isBrazilianAudio(name) {
  const n = name.toLowerCase();

  const hasPTBR =
    n.includes('dublado') ||
    n.includes('pt-br') ||
    n.includes('dual') ||
    n.includes('multi') ||
    n.includes('portuguese');

  const isLegendado =
    n.includes('legendado') ||
    n.includes('sub') ||
    n.includes('subtitle');

  if (hasPTBR) return true;
  if (isLegendado && !hasPTBR) return false;

  return false;
}

module.exports = {
  isBrazilianAudio
};
