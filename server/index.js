import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createApp } from './app.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
if (existsSync(join(root, '.env'))) process.loadEnvFile(join(root, '.env')); // Node >= 20.12
const env = k => process.env[k] || '';

const token = env('TELEGRAM_BOT_TOKEN'), chatId = env('OWNER_CHAT_ID');
if (!token || !chatId) console.warn('OGOHLANTIRISH: TELEGRAM_BOT_TOKEN yoki OWNER_CHAT_ID sozlanmagan — javoblar yuborilmaydi (README → Telegram).');

const dist = join(root, 'dist');
createApp({
  sitesDir: env('SITES_DIR') || join(root, 'data', 'sites'),
  distDir: existsSync(dist) ? dist : null,
  token, chatId, allowedOrigin: env('ALLOWED_ORIGIN'),
}).listen(Number(env('PORT')) || 8787, () => console.log(`Love Experience server: http://localhost:${Number(env('PORT')) || 8787}`));
