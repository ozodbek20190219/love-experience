#!/usr/bin/env node
// Yangi mijoz uchun sayt yaratadi: noyob ID beradi va data/sites/<ID>.json yozadi.
//   npm run new-site -- --template dark-romance --name "Ozodbek" [--to "Madina"] [--base https://sayt.uz]
//   npm run new-site -- --list
import { writeFile, readdir, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { TEMPLATES } from '../src/config/site.js';
import { generateId } from '../server/lib.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
if (existsSync(join(root, '.env'))) process.loadEnvFile(join(root, '.env'));
const dir = process.env.SITES_DIR || join(root, 'data', 'sites');

const args = {}; const a = process.argv.slice(2);
for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { const k = a[i].slice(2); args[k] = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : true; }

const base = (args.base || process.env.PUBLIC_URL || 'http://localhost:8787').replace(/\/$/, '');

if (args.list) {
  await mkdir(dir, { recursive: true });
  const files = (await readdir(dir)).filter(f => f.endsWith('.json'));
  if (!files.length) console.log('Hozircha saytlar yo\'q.');
  for (const f of files) { const s = JSON.parse(await readFile(join(dir, f), 'utf8')); console.log(`${s.id}  ${s.template.padEnd(16)} ${s.sender}${s.recipient ? ' → ' + s.recipient : ''}  ${s.active === false ? '[o\'chirilgan]' : ''}`); }
  process.exit(0);
}

const tpl = TEMPLATES.find(t => t.id === args.template || t.code === String(args.template || '').toUpperCase());
if (!tpl || typeof args.name !== 'string' || !args.name.trim()) {
  console.error('Foydalanish: npm run new-site -- --template <id> --name "Mijoz ismi" [--to "Sevgan inson ismi"] [--base https://sayt.uz]');
  console.error('Shablonlar: ' + TEMPLATES.map(t => `${t.id} (${t.code})`).join(', '));
  process.exit(1);
}

const config = {};
for (const k of ['confession', 'feelings', 'secret', 'final', 'music', 'proposalQuestion']) if (typeof args[k] === 'string') config[k] = args[k];

await mkdir(dir, { recursive: true });
let id; do { id = generateId(tpl.code); } while (existsSync(join(dir, `${id}.json`)));
const site = { id, template: tpl.id, sender: args.name.trim(), recipient: typeof args.to === 'string' ? args.to.trim() : '', createdAt: new Date().toISOString(), active: true, config };
await writeFile(join(dir, `${id}.json`), JSON.stringify(site, null, 2) + '\n');

console.log(`\nSayt yaratildi: ${tpl.name}\nID:      ${id}\nHavola:  ${base}/s/${id}\nFayl:    data/sites/${id}.json  (matnlarni shu faylda tahrirlash mumkin)\n`);
console.log('Eslatma: yangi fayl serverga yetib borishi uchun deploy qiling (git push). Mahalliy: server qayta ishga tushirishsiz ham o\'qiydi.');
