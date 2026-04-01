const { addonBuilder } = require('stremio-addon-sdk');

const manifest = {
  id: "org.raspadorti.addon",
  version: "1.0.0",
  name: "raspadorti",
  description: "Addon brasileiro de torrents ⚡",
  resources: ["stream"],
  types: ["movie", "series"],
  idPrefixes: ["tt"]
};

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(manifest);
};
