const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('redis');

const REDIS_URL = process.env.REDIS_URL || process.env.REDIS || null;
const REDIS_KEY = process.env.REDIS_KEY || 'iptv:channels';
const FALLBACK_FILE = path.resolve(__dirname, '..', 'data.json');

let redisClient = null;
let redisAvailable = false;
// Parsed playlist kept in memory so requests don't re-read and re-parse ~3MB of JSON each time.
let memChannels = null;

async function initRedis() {
  if (!REDIS_URL) return;
  try {
    redisClient = createClient({ url: REDIS_URL });
    redisClient.on('error', (err) => console.error('Redis error', err));
    await redisClient.connect();
    redisAvailable = true;
    console.log('Connected to Redis');
  } catch (err) {
    console.warn('Could not connect to Redis, falling back to file storage', err.message);
    redisAvailable = false;
    redisClient = null;
  }
}

async function setChannels(channels) {
  memChannels = channels;
  const payload = JSON.stringify({ updated: Date.now(), channels });
  if (redisAvailable && redisClient) {
    await redisClient.set(REDIS_KEY, payload);
  }
  await fs.writeFile(FALLBACK_FILE, payload, 'utf8');
}

async function getChannels() {
  if (memChannels) return memChannels;
  if (redisAvailable && redisClient) {
    try {
      const v = await redisClient.get(REDIS_KEY);
      if (v) return (memChannels = JSON.parse(v).channels);
    } catch (err) {
      console.warn('Redis get failed, falling back to file', err.message);
    }
  }
  try {
    const content = await fs.readFile(FALLBACK_FILE, 'utf8');
    return (memChannels = JSON.parse(content).channels || []);
  } catch (err) {
    return [];
  }
}

module.exports = { initRedis, setChannels, getChannels };
