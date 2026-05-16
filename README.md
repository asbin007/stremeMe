# stremeMe

A React, TypeScript, and Vite streaming interface for movies, TV shows, anime, sports, and live TV, with a small Node/Express backend for IPTV-related APIs.

## Tech stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS
- State: Redux Toolkit
- Media: HLS.js, React YouTube
- Backend: Node.js, Express, Redis-ready IPTV cache

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

For the backend:

```bash
cd server
npm install
npm run dev
```

## Environment variables

Create `.env` from `.env.example`:

```env
VITE_TMDB_ACCESS_TOKEN=your_tmdb_v4_access_token_here
VITE_API_BASE_URL=https://backend-streame.onrender.com/api
```

## Scripts

```bash
npm run dev      # Start frontend dev server
npm run build    # Type-check and build production assets
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Production notes

- Pages are lazy-loaded to reduce initial bundle size.
- Vite manual chunks split large vendor libraries for better browser caching.
- Unknown routes render a dedicated 404 page.
- Keep secrets out of source control. Vite variables are still visible in the browser, so only use public/client-safe tokens there.
