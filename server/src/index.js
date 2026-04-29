const express = require('express');
const morgan = require('morgan');
const cron = require('node-cron');
const { fetchAndParse } = require('./iptv');
const { initRedis, setChannels, getChannels } = require('./store');

const PLAYLIST_URL = process.env.PLAYLIST_URL || 'https://iptv-org.github.io/iptv/index.m3u';
const PORT = process.env.PORT || 3001;

async function refresh() {
  try {
    console.log('Fetching playlist', PLAYLIST_URL);
    const channels = await fetchAndParse(PLAYLIST_URL);
    console.log(`Parsed ${channels.length} channels`);
    await setChannels(channels);
  } catch (err) {
    console.error('Failed to refresh playlist', err.message);
  }
}

async function start() {
  await initRedis();
  // Kick off initial refresh
  await refresh();

  // Schedule cron job every 6 hours
  cron.schedule('0 */6 * * *', () => {
    console.log('Cron: refreshing playlist');
    refresh();
  });

  const app = express();
  app.use(morgan('tiny'));
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

  app.get('/channels', async (req, res) => {
    const { region, group, q, limit } = req.query;
    let list = await getChannels();
    if (q) {
      const ql = q.toLowerCase();
      list = list.filter(c => (c.name || '').toLowerCase().includes(ql));
    }
    if (region) {
      list = list.filter(c => (c.group || '').toLowerCase() === region.toLowerCase());
    }
    if (group) {
      list = list.filter(c => (c.group || '').toLowerCase() === group.toLowerCase());
    }
    const lim = Math.min(1000, parseInt(limit || '200', 10));
    res.json({ count: list.length, channels: list.slice(0, lim) });
  });

  app.get('/search', async (req, res) => {
    const q = (req.query.q || '').toLowerCase();
    if (!q) return res.json({ results: [] });
    const list = await getChannels();
    const results = list.filter(c => (c.name || '').toLowerCase().includes(q)).slice(0, 200);
    res.json({ count: results.length, results });
  });

  app.get('/regions', async (req, res) => {
    const list = await getChannels();
    const groups = Array.from(new Set(list.map(c => c.group).filter(Boolean))).sort();
    res.json({ regions: groups });
  });

  app.listen(PORT, () => console.log(`IPTV API listening on ${PORT}`));
}

start().catch(err => {
  console.error(err);
  process.exit(1);
});
