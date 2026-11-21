// Minimal HTTP server (faqat Node, tashqi paketsiz): API + (mavjud bo'lsa) dist/ statik fayllari.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname, resolve, sep } from 'node:path';
import { loadSite, parseAnswerBody, buildMessage, dedupeKey } from './lib.js';
import { sendTelegram } from './telegram.js';

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };

function limiter(max, windowMs) {
  const m = new Map();
  return key => {
    const now = Date.now(); let e = m.get(key);
    if (!e || e.reset < now) { e = { n: 0, reset: now + windowMs }; m.set(key, e); }
    if (m.size > 5000) for (const [k, v] of m) if (v.reset < now) m.delete(k);
    return ++e.n <= max;
  };
}

export function createApp({ sitesDir, distDir, token, chatId, allowedOrigin = '', fetchImpl, log = console } = {}) {
  const perIp = limiter(40, 60_000);
  const perSite = limiter(60, 3_600_000);
  const sent = new Map();      // dedupe kaliti -> muddati (faqat muvaffaqiyatli yuborilganlar)
  const inflight = new Set();  // hozir yuborilayotganlar (bir vaqtda kelgan takror so'rovlar uchun)
  const isDup = key => { const e = sent.get(key); if (e && e > Date.now()) return true; if (e) sent.delete(key); return inflight.has(key); };
  const origins = allowedOrigin.split(',').map(s => s.trim()).filter(Boolean);

  const json = (res, code, obj, extra = {}) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra }); res.end(JSON.stringify(obj)); };

  async function body(req) {
    let size = 0; const chunks = [];
    for await (const c of req) { size += c.length; if (size > 20_000) throw new Error('too_large'); chunks.push(c); }
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  }

  async function serveStatic(req, res, url) {
    if (!distDir) return json(res, 404, { error: 'Topilmadi' });
    const root = resolve(distDir);
    let p = resolve(join(root, normalize(decodeURIComponent(url.pathname))));
    if (p !== root && !p.startsWith(root + sep)) return json(res, 403, { error: 'Ruxsat yo\'q' });
    let file = p;
    try { const s = await stat(file); if (s.isDirectory()) file = join(file, 'index.html'); } catch { file = join(root, 'index.html'); }
    try {
      const data = await readFile(file); const ext = extname(file);
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': file.includes(`${sep}assets${sep}`) ? 'public,max-age=31536000,immutable' : 'no-cache', 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch { json(res, 404, { error: 'Topilmadi' }); }
  }

  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://x');
      const origin = req.headers.origin;
      if (origin && origins.includes(origin)) { res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Vary', 'Origin'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS'); }
      if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
      const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim();

      if (url.pathname === '/api/health') return json(res, 200, { ok: true, telegram: !!(token && chatId) });

      const m = url.pathname.match(/^\/api\/sites\/([^/]+)$/);
      if (m && req.method === 'GET') {
        if (!perIp(ip)) return json(res, 429, { error: "Juda ko'p so'rov" });
        const s = await loadSite(sitesDir, decodeURIComponent(m[1]));
        if (!s) return json(res, 404, { error: 'Sayt topilmadi' });
        return json(res, 200, { id: s.id, template: s.template, sender: s.sender || '', recipient: s.recipient || '', config: s.config || {} });
      }

      if (url.pathname === '/api/answers' && req.method === 'POST') {
        if (!perIp(ip)) return json(res, 429, { error: "Juda ko'p so'rov" });
        let b; try { b = await body(req); } catch { return json(res, 400, { error: "So'rov noto'g'ri" }); }
        const p = parseAnswerBody(b);
        if (!p) return json(res, 400, { error: "Ma'lumotlar noto'g'ri" });
        const site = await loadSite(sitesDir, p.id);
        if (!site) return json(res, 404, { error: 'Sayt topilmadi' });
        const dk = dedupeKey(site, p);
        if (isDup(dk.key)) return json(res, 200, { ok: true, duplicate: true }); // takror: Telegram'ga qayta yuborilmaydi
        if (!perSite(site.id)) return json(res, 429, { error: "Juda ko'p yuborildi" });
        inflight.add(dk.key);
        let r; try { r = await sendTelegram({ token, chatId, text: buildMessage(site, p), fetchImpl }); } finally { inflight.delete(dk.key); }
        if (r.ok) {
          if (sent.size > 5000) for (const [k, v] of sent) if (v < Date.now()) sent.delete(k);
          sent.set(dk.key, Date.now() + dk.ttl);
        }
        if (!r.ok) { log.error?.(`[telegram] ${site.id} yuborilmadi: ${r.reason}`); return json(res, r.reason === 'not_configured' ? 503 : 502, { error: "Javobni yetkazib bo'lmadi" }); }
        return json(res, 200, { ok: true });
      }

      if (url.pathname.startsWith('/api/')) return json(res, 404, { error: 'Topilmadi' });
      if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'Ruxsat yo\'q' });
      return serveStatic(req, res, url);
    } catch (e) { log.error?.('[server]', e?.message); json(res, 500, { error: 'Server xatosi' }); }
  });
}
