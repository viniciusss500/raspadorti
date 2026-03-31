function log(type, data) {
  console.log(`[${new Date().toISOString()}] ${type}:`, data);
}

module.exports = { log };
