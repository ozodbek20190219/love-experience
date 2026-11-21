// Telegram'ga xabar yuborish. Token faqat serverda (env) turadi, hech qachon brauzerga chiqmaydi.
export async function sendTelegram({ token, chatId, text, fetchImpl = fetch }) {
  if (!token || !chatId) return { ok: false, reason: 'not_configured' };
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const r = await fetchImpl(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
        signal: AbortSignal.timeout(8000),
      });
      if (r.ok) return { ok: true };
      if (r.status === 429 && attempt === 0) { await new Promise(res => setTimeout(res, 1200)); continue; }
      return { ok: false, reason: `telegram_${r.status}` };
    } catch { if (attempt === 1) return { ok: false, reason: 'network' }; await new Promise(res => setTimeout(res, 600)); }
  }
  return { ok: false, reason: 'network' };
}
