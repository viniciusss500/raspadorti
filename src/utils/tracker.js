const axios = require('axios');

async function checkTracker(url) {
  try {
    const res = await axios.get(url, { timeout: 5000 });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function filterWorkingTrackers(trackers) {
  const results = await Promise.all(
    trackers.map(async (t) => ({
      tracker: t,
      alive: await checkTracker(t.url)
    }))
  );

  return results.filter(t => t.alive).map(t => t.tracker);
}

module.exports = { filterWorkingTrackers };
