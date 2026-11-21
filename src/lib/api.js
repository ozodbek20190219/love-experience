// Faqat ikkita so'rov: saytni o'qish va javobni Telegram'ga yetkazish. Hech qanday kalit brauzerda yo'q.
const BASE = import.meta.env.VITE_API_BASE || '';
export async function fetchSite(id) {
  let r; try { r = await fetch(`${BASE}/api/sites/${encodeURIComponent(id)}`); } catch { throw new Error('network'); }
  if (r.status === 404) throw new Error('notfound');
  if (!r.ok) throw new Error('server');
  return r.json();
}
export async function sendAnswers(payload) {
  const r = await fetch(`${BASE}/api/answers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!r.ok) throw new Error('send');
}
