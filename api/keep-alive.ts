import type { VercelRequest, VercelResponse } from '@vercel/node';

const BACKEND_URL = 'https://backend-streame.onrender.com/health';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const response = await fetch(BACKEND_URL);
    const data = await response.json();
    res.status(200).json({ ok: true, backend: data, pingedAt: new Date().toISOString() });
  } catch (error) {
    res.status(502).json({ ok: false, error: String(error), pingedAt: new Date().toISOString() });
  }
}
