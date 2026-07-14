import type { VercelRequest, VercelResponse } from '@vercel/node';
import https from 'https';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const query = new URLSearchParams(req.query as Record<string, string>).toString();
  const url = `https://www.jiosaavn.com/api.php?${query}`;

  https.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }
  }, (proxyRes) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(proxyRes.statusCode || 200);
    proxyRes.pipe(res);
  }).on('error', (err) => {
    res.status(500).json({ error: err.message });
  });
}