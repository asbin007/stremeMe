// Build-time sitemap generator.
// Fetches popular + top-rated movies and TV shows from TMDB, writes:
//   dist/sitemap.xml           — sitemap index
//   dist/sitemap-static.xml    — homepage + category routes
//   dist/sitemap-movies.xml    — up to ~400 movie detail pages
//   dist/sitemap-tv.xml        — up to ~400 TV detail pages
//
// Needs VITE_TMDB_ACCESS_TOKEN in the environment (same var Vite reads).
// Runs after `vite build`, before prerender. Fails soft: if TMDB is down a
// static-only sitemap is still written so builds never break.

import { writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = join(__dirname, '..', 'dist')
const BASE = 'https://www.aurascreen.me'
const TOKEN = process.env.VITE_TMDB_ACCESS_TOKEN
const PAGES_PER_LIST = 10

const STATIC_ROUTES = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/movies', priority: 0.9, changefreq: 'daily' },
  { path: '/tv-shows', priority: 0.9, changefreq: 'daily' },
  { path: '/anime', priority: 0.9, changefreq: 'daily' },
  { path: '/hindi-movies', priority: 0.8, changefreq: 'daily' },
  { path: '/live-tv', priority: 0.8, changefreq: 'daily' },
  { path: '/sports', priority: 0.8, changefreq: 'daily' },
  { path: '/providers', priority: 0.7, changefreq: 'weekly' },
]

async function tmdb(path) {
  if (!TOKEN) throw new Error('VITE_TMDB_ACCESS_TOKEN missing')
  const res = await fetch(`https://api.themoviedb.org/3${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`TMDB ${path} -> ${res.status}`)
  return res.json()
}

async function collectIds(mediaType) {
  const seen = new Map()
  for (const list of ['popular', 'top_rated']) {
    for (let page = 1; page <= PAGES_PER_LIST; page++) {
      try {
        const data = await tmdb(`/${mediaType}/${list}?language=en-US&page=${page}`)
        for (const item of data.results || []) {
          if (!item.id) continue
          const key = String(item.id)
          if (seen.has(key)) continue
          seen.set(key, {
            id: item.id,
            lastmod: (item.release_date || item.first_air_date || '').slice(0, 10) || null,
          })
        }
      } catch (err) {
        console.warn(`[sitemap] ${mediaType}/${list} page ${page}: ${err.message}`)
        break
      }
    }
  }
  return [...seen.values()]
}

function urlset(urls) {
  const body = urls
    .map((u) => {
      const lines = [`    <loc>${u.loc}</loc>`]
      if (u.lastmod) lines.push(`    <lastmod>${u.lastmod}</lastmod>`)
      if (u.changefreq) lines.push(`    <changefreq>${u.changefreq}</changefreq>`)
      if (u.priority != null) lines.push(`    <priority>${u.priority}</priority>`)
      return `  <url>\n${lines.join('\n')}\n  </url>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}

function sitemapIndex(names) {
  const now = new Date().toISOString().slice(0, 10)
  const body = names
    .map((n) => `  <sitemap>\n    <loc>${BASE}/${n}</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`
}

async function run() {
  if (!existsSync(DIST)) {
    console.error('[sitemap] dist/ missing — run `vite build` first')
    process.exit(1)
  }

  await writeFile(
    join(DIST, 'sitemap-static.xml'),
    urlset(STATIC_ROUTES.map((r) => ({ loc: `${BASE}${r.path}`, ...r })))
  )

  const sitemaps = ['sitemap-static.xml']

  if (!TOKEN) {
    console.warn('[sitemap] VITE_TMDB_ACCESS_TOKEN missing — only static sitemap written')
  } else {
    for (const [mediaType, file, route] of [
      ['movie', 'sitemap-movies.xml', 'movie'],
      ['tv', 'sitemap-tv.xml', 'tv'],
    ]) {
      try {
        const ids = await collectIds(mediaType)
        await writeFile(
          join(DIST, file),
          urlset(
            ids.map((it) => ({
              loc: `${BASE}/${route}/${it.id}`,
              lastmod: it.lastmod || undefined,
              changefreq: 'weekly',
              priority: 0.6,
            }))
          )
        )
        sitemaps.push(file)
        console.log(`[sitemap] ${file}: ${ids.length} urls`)
      } catch (err) {
        console.warn(`[sitemap] ${file} skipped: ${err.message}`)
      }
    }
  }

  await writeFile(join(DIST, 'sitemap.xml'), sitemapIndex(sitemaps))
  console.log(`[sitemap] sitemap.xml index with ${sitemaps.length} files`)
}

await mkdir(DIST, { recursive: true })
run().catch((e) => { console.error(e); process.exit(1) })
