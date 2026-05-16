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
const DEFAULT_ORIGINS = ['http://localhost:5173', 'http://localhost:4173'];
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
}

function createRateLimiter({ windowMs = 60_000, max = 120 } = {}) {
  const hits = new Map();

  return (req, res, next) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = hits.get(key) || { count: 0, resetAt: now + windowMs };

    if (record.resetAt <= now) {
      record.count = 0;
      record.resetAt = now + windowMs;
    }

    record.count += 1;
    hits.set(key, record);

    if (record.count > max) {
      return res.status(429).json({ error: 'Too many requests, please try again later' });
    }

    next();
  };
}

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
  app.use(cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const allowed = ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS : DEFAULT_ORIGINS;
      return callback(null, allowed.includes(origin));
    },
  }));
  app.use(securityHeaders);
  app.use(createRateLimiter());
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'tiny'));
  app.use(express.json({ limit: '100kb' }));

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

      if (!email || !isValidEmail(email) || !watchLaterList || !Array.isArray(watchLaterList)) {
        return res.status(400).json({ error: 'Missing or invalid email/watchLaterList' });
      }

      const safeItems = watchLaterList.slice(0, 100);
      const listHTML = safeItems
        .map(item => `<li><strong>${escapeHtml(item.title)}</strong> (${escapeHtml(item.mediaType)})</li>`)
        .join('');

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
    const lim = Math.min(1000, Math.max(1, parseInt(limit || '200', 10) || 200));
    res.json({ count: list.length, channels: list.slice(0, lim) });
  });

  app.get('/search', async (req, res) => {
    const q = String(req.query.q || '').toLowerCase().trim();
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

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.listen(PORT, () => console.log(`IPTV API listening on ${PORT}`));
}

start().catch(err => {
  console.error(err);
  process.exit(1);
});
