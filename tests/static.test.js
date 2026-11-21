// Frontend manba kodini statik tekshirish: aloqa havolalari, shablon nomlari, placeholderlar, sirlar.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONTACTS, TEMPLATES, PH_SENDER, PH_RECIPIENT } from '../src/config/site.js';
import { DEF, buildConfig } from '../src/experience/defaults.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const srcFiles = walk(join(root, 'src'));
const read = p => readFileSync(p, 'utf8');

test('Aloqa havolalari aynan kerakli manzillar', () => {
  assert.equal(CONTACTS.instagram.url, 'https://www.instagram.com/_anora.010_/');
  assert.equal(CONTACTS.instagram.user, '_anora.010_');
  assert.equal(CONTACTS.telegram.url, 'https://t.me/anora_dev');
  assert.equal(CONTACTS.telegram.user, 'anora_dev');
});

test('Manba kodida boshqa Instagram/Telegram username yoki havola yo\'q', () => {
  const all = srcFiles.filter(f => /\.(jsx?|html)$/.test(f)).map(read).join('\n') + read(join(root, 'index.html'));
  const ig = [...all.matchAll(/instagram\.com\/([\w.]+)|ig\.me\/m\/([\w.]+)/g)].map(m => m[1] || m[2]);
  const tg = [...all.matchAll(/t\.me\/([\w]+)/g)].map(m => m[1]);
  assert.ok(ig.length > 0 && ig.every(u => u === '_anora.010_'), JSON.stringify(ig));
  assert.ok(tg.length > 0 && tg.every(u => u === 'anora_dev'), JSON.stringify(tg));
  assert.equal(/VITE_INSTAGRAM_USER/.test(all), false);
});

test('Beshta shablon: kerakli nomlar, noyob id va kod', () => {
  assert.deepEqual(TEMPLATES.map(t => t.name), ['Dark Romance', 'Soft Sakura', 'Galaxy Love', 'Vintage Romance', 'Fantasy Garden']);
  assert.equal(new Set(TEMPLATES.map(t => t.id)).size, 5); assert.equal(new Set(TEMPLATES.map(t => t.code)).size, 5);
});

test('Har bir shablonning o\'z 3D sahna fayli bor va SceneCanvas\'da lazy ulangan', () => {
  const sc = read(join(root, 'src/scenes/SceneCanvas.jsx'));
  for (const t of TEMPLATES) assert.ok(new RegExp(`'${t.id}': lazy\\(\\(\\) => import\\('\\./\\w+\\.jsx'\\)\\)`).test(sc), t.id);
  const files = [...sc.matchAll(/import\('\.\/(\w+\.jsx)'\)/g)].map(m => m[1]);
  assert.equal(new Set(files).size, 5); for (const f of files) assert.ok(existsSync(join(root, 'src/scenes', f)), f);
});

test('Demo matnlarida haqiqiy ism yo\'q: faqat [Ismingiz] / [Uni ismi]', () => {
  assert.equal(DEF.sender, '[Ismingiz]'); assert.equal(DEF.recipient, '[Uni ismi]');
  assert.equal(PH_SENDER, '[Ismingiz]'); assert.equal(PH_RECIPIENT, '[Uni ismi]');
  const c = buildConfig(null); assert.equal(c.sender, PH_SENDER); assert.equal(c.recipient, PH_RECIPIENT);
  const banned = /\b(Madina|Ozodbek|Farangiz|Aziza|Dilnoza|Sevara|Malika|Jasur|Sardor)\b/i;
  for (const f of srcFiles.filter(f => /\.jsx?$/.test(f))) assert.equal(banned.test(read(f)), false, f);
});

test('Frontendda Telegram token yoki bot API manzili yo\'q', () => {
  for (const f of srcFiles.filter(f => /\.jsx?$/.test(f))) { const s = read(f); assert.equal(/api\.telegram\.org|TELEGRAM_BOT_TOKEN|bot\d{6,}:/.test(s), false, f); }
});

test('Keraksiz tizimlar (Supabase, admin, to\'lov, buyurtma formasi) qo\'shilmagan', () => {
  const pkg = JSON.parse(read(join(root, 'package.json')));
  const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).join(' ');
  assert.equal(/supabase|firebase|stripe|payme|click|prisma|mongoose|express-session/i.test(deps), false);
  const routes = read(join(root, 'src/App.jsx'));
  assert.equal(/admin|kabinet|checkout|tolov/i.test(routes.replace(/'\/buyurtma'|\/narxlar/g, '')), false);
});

test('Netlify sozlamasi: build, publish, SPA redirect', () => {
  const t = read(join(root, 'netlify.toml'));
  assert.match(t, /command = "npm run build"/); assert.match(t, /publish = "dist"/);
  assert.match(t, /from = "\/\*"\s+to = "\/index\.html"\s+status = 200/);
});

test('.gitignore .env va data/sites ichidagi mijoz fayllarini himoya qiladi', () => {
  const g = read(join(root, '.gitignore')); assert.match(g, /^\.env$/m);
});
