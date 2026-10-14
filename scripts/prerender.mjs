// Post-build prerender for static top-level routes.
// Serves dist/ locally, loads each route in headless Chromium, writes the
// rendered HTML back as dist/<route>/index.html. Vercel then serves these
// files directly so social crawlers (Facebook, Twitter, Discord, WhatsApp)
// and search bots see real markup. The SPA still boots on top for users.
//
// Dynamic routes (/movie/:id, /tv/:id, /watch/:slug, /live/:slug, /search,
// /browse/:category) are NOT prerendered here — those need the dynamic
// sitemap + per-id pass (Step 2).

import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = join(__dirname, '..', 'dist')
const PORT = 4321
const PRERENDER_TIMEOUT_MS = 20000

const ROUTES = [
  '/',
  '/movies',
  '/tv-shows',
  '/anime',
  '/hindi-movies',
  '/live-tv',
  '/sports',
  '/providers',
  '/adult',
]

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
}

function serve() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        const urlPath = req.url.split('?')[0]
        const filePath = join(DIST, urlPath === '/' ? 'index.html' : urlPath)
        if (existsSync(filePath) && extname(filePath)) {
          const body = await readFile(filePath)
          res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' })
          res.end(body)
          return
        }
        const html = await readFile(join(DIST, 'index.html'))
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(html)
      } catch (err) {
        res.writeHead(500)
        res.end(String(err))
      }
    })
    server.listen(PORT, () => resolve(server))
  })
}

async function run() {
  if (!existsSync(DIST)) {
    console.error('[prerender] dist/ missing — run `vite build` first')
    process.exit(1)
  }
  const server = await serve()
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ userAgent: 'AuraScreen-Prerender/1.0' })

  let failed = 0
  for (const route of ROUTES) {
    try {
      const page = await ctx.newPage()
      // Block analytics + push + auth providers during prerender for speed
      // and to avoid flaky network. React still mounts + renders static shell.
      await page.route('**/*', (r) => {
        const url = r.request().url()
        if (/firebase|clerk|google-analytics|googletagmanager|fcm\.googleapis/.test(url)) {
          return r.abort()
        }
        r.continue()
      })
      await page.goto(`http://localhost:${PORT}${route}`, {
        waitUntil: 'networkidle',
        timeout: PRERENDER_TIMEOUT_MS,
      })
      // Give react-helmet-async one tick to flush <head> updates
      await page.waitForTimeout(300)
      const html = await page.content()
      const out = route === '/'
        ? join(DIST, 'index.html')
        : join(DIST, route.replace(/^\//, ''), 'index.html')
      await mkdir(dirname(out), { recursive: true })
      await writeFile(out, html)
      await page.close()
      console.log(`[prerender] ok  ${route}`)
    } catch (err) {
      failed++
      console.error(`[prerender] FAIL ${route}: ${err.message}`)
    }
  }
  await browser.close()
  server.close()
  if (failed) process.exit(1)
}

run().catch((e) => { console.error(e); process.exit(1) })
