import { ImageResponse } from '@vercel/og';

// Vercel Edge Function: generates a 1200x630 PNG OG image on demand.
// SEOHead on detail pages points at /api/og?t=<title>&y=<year>&r=<rating>&bg=<tmdb-backdrop-path>
// so Facebook, Twitter, Discord etc. see a branded preview per movie
// instead of the generic site logo.
//
// Edge runtime, no cold start, free tier. Vercel caches the result at the
// edge for ~1h, then regenerates. Request is a plain GET — crawlers don't
// need auth.

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const title = (url.searchParams.get('t') || 'AuraScreen').slice(0, 100);
  const year = (url.searchParams.get('y') || '').slice(0, 4);
  const rating = (url.searchParams.get('r') || '').slice(0, 4);
  const bg = url.searchParams.get('bg') || '';
  const backdropUrl = bg
    ? `https://image.tmdb.org/t/p/w1280${bg.startsWith('/') ? bg : `/${bg}`}`
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          height: '100%',
          background: '#030712',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {backdropUrl && (
          <img
            src={backdropUrl}
            alt=""
            width={1200}
            height={630}
            style={{ position: 'absolute', inset: 0, objectFit: 'cover', opacity: 0.55 }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(3,7,18,0.3) 0%, rgba(3,7,18,0.95) 85%)',
          }}
        />
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '72px 80px',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 20,
              color: '#e5e7eb',
              fontSize: 24,
              fontWeight: 600,
            }}
          >
            <div
              style={{
                background: '#e50914',
                color: 'white',
                padding: '6px 14px',
                borderRadius: 6,
                fontWeight: 800,
                letterSpacing: -0.5,
              }}
            >
              AURASCREEN
            </div>
            {year && <div>{year}</div>}
            {rating && <div>★ {rating}</div>}
          </div>
          <div
            style={{
              fontSize: title.length > 40 ? 72 : 92,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              textShadow: '0 4px 24px rgba(0,0,0,0.6)',
              maxWidth: 1040,
              display: 'flex',
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 28,
              color: '#9ca3af',
              display: 'flex',
            }}
          >
            Watch free in HD on aurascreen.me
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
