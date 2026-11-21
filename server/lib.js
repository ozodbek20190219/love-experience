// Sof (bog'liqliksiz) yordamchi funksiyalar: ID, tekshiruv, sayt o'qish, Telegram xabari.
import { randomBytes, createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { TEMPLATES } from '../src/config/site.js';

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // O/0/I/1 yo'q
export const ID_RE = /^[A-Z]{2}-[2-9A-HJ-NP-Z]{8}$/;

export function generateId(code) {
  const b = randomBytes(8);
  let s = '';
  for (let i = 0; i < 8; i++) s += ALPHABET[b[i] % ALPHABET.length];
  return `${code}-${s}`;
}

const SID_RE = /^[\w-]{8,64}$/;
export const normalizeId = v => String(v || '').trim().toUpperCase();

export async function loadSite(dir, rawId) {
  const id = normalizeId(rawId);
  if (!ID_RE.test(id)) return null; // yo'l o'tish (path traversal) himoyasi
  let site;
  try { site = JSON.parse(await readFile(join(dir, `${id}.json`), 'utf8')); } catch { return null; }
  if (!site || site.active === false || site.id !== id) return null;
  if (!TEMPLATES.some(t => t.id === site.template)) return null;
  return site;
}

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Mijoz yuborgan javob tuzilmasini tekshiradi. Noto'g'ri bo'lsa null qaytaradi.
export function parseAnswerBody(b) {
  if (!b || typeof b !== 'object') return null;
  const kind = b.kind;
  if (kind !== 'proposal' && kind !== 'final') return null;
  const id = normalizeId(b.id);
  if (!ID_RE.test(id)) return null;
  const answers = Array.isArray(b.answers) ? b.answers.slice(0, 20).map(a => ({ q: str(a?.q, 200), a: str(a?.a, 1000) })).filter(a => a.q && a.a) : [];
  const noClicks = Number.isFinite(b.noClicks) ? Math.max(0, Math.min(99, Math.trunc(b.noClicks))) : 0;
  const proposal = ['yes', 'declined'].includes(b.proposal) ? b.proposal : '';
  if (kind === 'proposal' && !proposal) return null;
  const sid = typeof b.sid === 'string' && SID_RE.test(b.sid) ? b.sid : '';
  return { kind, id, sid, name: str(b.name, 80), proposal, noClicks, answers, message: str(b.message, 1500) };
}

const tashkent = d => d.toLocaleString('en-GB', { timeZone: 'Asia/Tashkent', hour12: false }) + ' (Toshkent)';

export function buildMessage(site, p, now = new Date()) {
  const tpl = TEMPLATES.find(t => t.id === site.template);
  const head = [
    p.kind === 'proposal'
      ? (p.proposal === 'yes' ? '❤️ TAKLIFGA JAVOB: HA!' : '⏳ TAKLIFGA JAVOB: hozircha javob bermaydi')
      : '💌 YANGI JAVOBLAR',
    '',
    `🆔 Sayt ID: ${site.id}`,
    `🎭 Shablon: ${tpl?.name || site.template}`,
    `👤 Buyurtmachi: ${site.sender || '-'}`,
    `💞 Qabul qiluvchi: ${p.name || site.recipient || '(ism kiritilmadi)'}`,
  ];
  if (p.kind === 'proposal') {
    head.push(`🙈 "Yo'q" bosildi: ${p.noClicks} marta`);
  } else {
    if (p.proposal) head.push(`💘 Taklifga javob: ${p.proposal === 'yes' ? 'Ha' : 'Hozircha emas'} ("Yo'q" bosildi: ${p.noClicks} marta)`);
    if (p.answers.length) { head.push('', '📝 Savollarga javoblar:'); p.answers.forEach((a, i) => head.push(`${i + 1}) ${a.q}`, `   ➜ ${a.a}`)); }
    if (p.message) head.push('', `💬 Erkin xabar:`, p.message);
  }
  head.push('', `🕒 ${tashkent(now)}`);
  return head.join('\n').slice(0, 4000); // Telegram limiti 4096
}

// Takroriy xabarni aniqlash kaliti. Brauzer yuborgan sid bo'lsa — aynan o'sha yuborish (qayta bosish/qayta urinish);
// bo'lmasa — mazmun xeshi (qisqa muddatga).
export function dedupeKey(site, p) {
  if (p.sid) return { key: `${site.id}|${p.kind}|${p.sid}`, ttl: 24 * 3_600_000 };
  const h = createHash('sha256').update(JSON.stringify([p.name, p.proposal, p.noClicks, p.answers, p.message])).digest('hex').slice(0, 32);
  return { key: `${site.id}|${p.kind}|h:${h}`, ttl: 10 * 60_000 };
}
