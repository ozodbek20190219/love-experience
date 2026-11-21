#!/usr/bin/env node
// OWNER_CHAT_ID ni topish: botingizga /start yozing, so'ng: npm run chat-id
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
if (existsSync(join(root, '.env'))) process.loadEnvFile(join(root, '.env'));
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) { console.error('TELEGRAM_BOT_TOKEN .env faylida yo\'q.'); process.exit(1); }
const r = await fetch(`https://api.telegram.org/bot${token}/getUpdates`).then(r => r.json()).catch(() => null);
if (!r?.ok) { console.error('Telegram javob bermadi yoki token noto\'g\'ri.'); process.exit(1); }
const seen = new Map();
for (const u of r.result) { const c = u.message?.chat; if (c) seen.set(c.id, `${c.first_name || ''} ${c.username ? '@' + c.username : ''}`.trim()); }
if (!seen.size) { console.log('Hali xabar yo\'q. Botga Telegramda /start yozing va qayta urinib ko\'ring.'); process.exit(0); }
for (const [id, n] of seen) console.log(`OWNER_CHAT_ID=${id}   (${n})`);
