# stremeMe IPTV API

Small Express API to fetch, parse and cache M3U playlists.

Features
- Fetch playlist (configurable) and parse channels
- Cache results in Redis with a file fallback
- Cron refresh every 6 hours
- Docker + docker-compose with Redis

Quick start (local)

1. Install dependencies

```bash
cd server
npm install
```

2. Run locally

```bash
PLAYLIST_URL=https://iptv-org.github.io/iptv/index.m3u npm start
```

Docker (recommended)

```bash
docker compose up --build -d
# API available at http://localhost:3001
```

Env vars
- `PLAYLIST_URL` — playlist to fetch (default: iptv-org index)
- `REDIS_URL` — when running outside compose, point to a Redis instance
