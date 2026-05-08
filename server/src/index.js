const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const express = require('express');
const morgan = require('morgan');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const cors = require('cors');
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
  app.use(cors());
  app.use(morgan('tiny'));
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER || 'placeholder@gmail.com',
      pass: process.env.GMAIL_PASS || 'placeholder_pass',
    },
  });

  app.post('/api/email/watch-later-summary', async (req, res) => {
    try {
      const { email, watchLaterList } = req.body;
      
      if (!email || !watchLaterList || !Array.isArray(watchLaterList)) {
        return res.status(400).json({ error: 'Missing email or watchLaterList' });
      }

      const listHTML = watchLaterList.map(item => `<li><strong>${item.title}</strong> (${item.mediaType})</li>`).join('');

      const mailOptions = {
        from: process.env.GMAIL_USER || 'placeholder@gmail.com',
        to: email,
        subject: 'Your Watch Later List from StremeMe',
        html: `<h2>Your Watch Later List</h2><ul>${listHTML}</ul><p>Enjoy streaming!</p>`,
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: 'Email sent successfully!' });
    } catch (error) {
      console.error('Email error:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });

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
