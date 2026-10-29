import { loadReportResources } from '../lib/report-resources.js';
let cache;
let pending;
const allowedOrigin = origin => origin === 'null' || ['https://kimjuncheol-ai.github.io', 'https://busan-slowwave.vercel.app'].includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '');
export default async function handler(req, res) {
  const origin = req.headers?.origin;
  res.setHeader('Vary', 'Origin');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (origin && !allowedOrigin(origin)) return res.status(403).json({ mode: 'offline' });
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(204).end();
  }
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET, OPTIONS'); return res.status(405).json({ mode: 'offline' }); }
  // A fixed, public selection only: never proxy caller-supplied URLs, keys or IDs.
  try {
    if (!cache || cache.expires < Date.now()) {
      pending ||= loadReportResources().then(value => {
        cache = { value, expires: Date.now() + (value.mode === 'live' ? 30 : 5) * 60_000 };
        return value;
      }).finally(() => { pending = undefined; });
      await pending;
    }
    return res.status(200).json(cache.value);
  } catch { return res.status(502).json({ mode: 'offline', message: '공공데이터 응답을 확인하지 못했습니다.' }); }
}
