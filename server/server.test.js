import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from './app.js';
import { generateId, ID_RE, parseAnswerBody, buildMessage } from './lib.js';

const SITE = id => ({ id, template: 'dark-romance', sender: '[Ismingiz]', recipient: '', createdAt: 'x', config: { secret: 'maxfiy' } });

async function setup(opts = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'le-'));
  const id = generateId('DR');
  await writeFile(join(dir, `${id}.json`), JSON.stringify(SITE(id)));
  const dist = await mkdtemp(join(tmpdir(), 'dist-'));
  await mkdir(join(dist, 'assets')); await writeFile(join(dist, 'index.html'), '<h1>spa</h1>'); await writeFile(join(dist, 'assets', 'a.js'), 'x');
  const sent = [];
  const fetchImpl = opts.fetchImpl || (async (url, init) => { sent.push({ url, body: JSON.parse(init.body) }); return { ok: true, status: 200 }; });
  const srv = createApp({ sitesDir: dir, distDir: dist, token: opts.token ?? 'TESTTOKEN', chatId: opts.chatId ?? '123', fetchImpl, log: { error() {} } });
  await new Promise(r => srv.listen(0, r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  return { id, base, sent, close: () => { srv.closeAllConnections?.(); srv.close(); } };
}
const post = (base, b) => fetch(base + '/api/answers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });

test('generateId: format va noyoblik', () => {
  const s = new Set(); for (let i = 0; i < 2000; i++) { const id = generateId('GL'); assert.match(id, ID_RE); s.add(id); }
  assert.equal(s.size, 2000);
});

test('GET /api/sites/:id — mavjud sayt, kichik harf ham ishlaydi, maxfiy maydon yo\'q', async () => {
  const t = await setup();
  const r = await fetch(`${t.base}/api/sites/${t.id.toLowerCase()}`); assert.equal(r.status, 200);
  const j = await r.json(); assert.equal(j.template, 'dark-romance'); assert.equal(j.sender, '[Ismingiz]'); assert.equal(j.config.secret, 'maxfiy'); assert.equal('createdAt' in j, false);
  t.close();
});

test('GET /api/sites — yo\'q ID va path traversal 404', async () => {
  const t = await setup();
  for (const bad of ['DR-AAAAAAAA', '..%2F..%2Fetc%2Fpasswd', 'x', 'DR-0O1IAAAA']) assert.equal((await fetch(`${t.base}/api/sites/${bad}`)).status, 404, bad);
  t.close();
});

test('POST /api/answers final: Telegram xabari to\'g\'ri tuzilgan va token faqat Telegram URLida', async () => {
  const t = await setup();
  const r = await post(t.base, { id: t.id, kind: 'final', proposal: 'yes', name: '[Uni ismi]', noClicks: 2, answers: [{ q: 'Fasl?', a: 'Bahor' }], message: 'Rahmat' });
  assert.equal(r.status, 200); assert.equal(t.sent.length, 1);
  const m = t.sent[0]; assert.match(m.url, /botTESTTOKEN\/sendMessage$/);
  assert.equal(m.body.chat_id, '123');
  for (const part of [t.id, 'Dark Romance', '[Ismingiz]', '[Uni ismi]', 'Fasl?', 'Bahor', 'Rahmat', 'Taklifga javob: Ha']) assert.ok(m.body.text.includes(part), part);
  assert.equal(JSON.stringify(await r.json()).includes('TESTTOKEN'), false);
  t.close();
});

test('POST /api/answers proposal: ha / hozircha emas', async () => {
  const t = await setup();
  assert.equal((await post(t.base, { id: t.id, kind: 'proposal', proposal: 'yes', noClicks: 3 })).status, 200);
  assert.match(t.sent[0].body.text, /HA!/); assert.match(t.sent[0].body.text, /3 marta/);
  assert.equal((await post(t.base, { id: t.id, kind: 'proposal', proposal: 'declined' })).status, 200);
  assert.match(t.sent[1].body.text, /hozircha javob bermaydi/);
  assert.equal((await post(t.base, { id: t.id, kind: 'proposal' })).status, 400);
  t.close();
});

test('POST /api/answers: noto\'g\'ri ID, noto\'g\'ri JSON, juda katta body', async () => {
  const t = await setup();
  assert.equal((await post(t.base, { id: 'DR-AAAAAAAA', kind: 'final' })).status, 404);
  assert.equal((await post(t.base, { id: 'bad', kind: 'final' })).status, 400);
  assert.equal((await fetch(t.base + '/api/answers', { method: 'POST', body: '{nope' })).status, 400);
  assert.equal((await post(t.base, { id: t.id, kind: 'final', message: 'x'.repeat(30000) })).status, 400);
  assert.equal(t.sent.length, 0); t.close();
});

test('Telegram sozlanmagan -> 503; Telegram xato -> 502 (mijozga sir chiqmaydi)', async () => {
  let t = await setup({ token: '' });
  let r = await post(t.base, { id: t.id, kind: 'final' }); assert.equal(r.status, 503); t.close();
  t = await setup({ fetchImpl: async () => ({ ok: false, status: 401 }) });
  r = await post(t.base, { id: t.id, kind: 'final' }); assert.equal(r.status, 502); assert.equal(JSON.stringify(await r.json()).includes('TESTTOKEN'), false); t.close();
});

test('Rate limit: bitta IP daqiqasiga 40 tadan ortiq so\'rov yubora olmaydi (429)', async () => {
  const t = await setup(); let last = 0;
  for (let i = 0; i < 41; i++) last = (await post(t.base, { id: t.id, kind: 'final' })).status;
  assert.equal(last, 429); t.close();
});

test('Statik fayllar: SPA fallback, assets cache, path traversal yopiq', async () => {
  const t = await setup();
  assert.match(await (await fetch(t.base + '/s/DR-XXXX')).text(), /spa/);
  const a = await fetch(t.base + '/assets/a.js'); assert.equal(a.status, 200); assert.match(a.headers.get('cache-control'), /immutable/);
  const r = await fetch(t.base + '/..%2F..%2Fpackage.json'); assert.notEqual((await r.text()).includes('"name"'), true);
  assert.equal((await fetch(t.base + '/api/health')).status, 200);
  t.close();
});

test('parseAnswerBody/buildMessage: uzun matn 4000 belgigacha kesiladi', () => {
  const p = parseAnswerBody({ id: generateId('FW'), kind: 'final', answers: Array.from({ length: 20 }, (_, i) => ({ q: 'q' + i, a: 'a'.repeat(1000) })) });
  assert.equal(p.answers.length, 20);
  assert.ok(buildMessage({ id: 'FW-AAAAAAAA', template: 'fantasy-world', sender: 's' }, p).length <= 4000);
});

test("O'chirilgan (active:false) va noto'g'ri shablonli sayt 404 beradi", async () => {
  const dir = await mkdtemp(join(tmpdir(), 'le-'));
  const off = generateId('DR'), bad = generateId('GL');
  await writeFile(join(dir, `${off}.json`), JSON.stringify({ ...SITE(off), active: false }));
  await writeFile(join(dir, `${bad}.json`), JSON.stringify({ ...SITE(bad), template: 'yoq-shablon' }));
  const srv = createApp({ sitesDir: dir, token: 't', chatId: '1', fetchImpl: async () => ({ ok: true }), log: { error() {} } });
  await new Promise(r => srv.listen(0, r)); const base = `http://127.0.0.1:${srv.address().port}`;
  assert.equal((await fetch(`${base}/api/sites/${off}`)).status, 404);
  assert.equal((await fetch(`${base}/api/sites/${bad}`)).status, 404);
  srv.closeAllConnections(); srv.close();
});

test('Takroriy xabar: bir xil sid ikki marta yuborilsa Telegram\'ga faqat bir marta boradi', async () => {
  const t = await setup();
  const b = { id: t.id, sid: 'abc12345-sid', kind: 'final', name: 'X', answers: [{ q: 'Q', a: 'A' }] };
  const r1 = await post(t.base, b), r2 = await post(t.base, b);
  assert.equal(r1.status, 200); assert.equal(r2.status, 200);
  assert.equal((await r2.json()).duplicate, true);
  assert.equal(t.sent.length, 1);
  // boshqa sid yoki boshqa tur — alohida xabar
  await post(t.base, { ...b, sid: 'other-sid-9999' }); await post(t.base, { ...b, kind: 'proposal', proposal: 'yes' });
  assert.equal(t.sent.length, 3); t.close();
});

test('Takroriy xabar: sid yo\'q bo\'lsa ham bir xil mazmun takror yuborilmaydi', async () => {
  const t = await setup();
  const b = { id: t.id, kind: 'proposal', proposal: 'yes', noClicks: 1 };
  await post(t.base, b); await post(t.base, b);
  assert.equal(t.sent.length, 1); t.close();
});

test('Takroriy xabar: bir vaqtda kelgan ikkita bir xil so\'rov — bitta xabar', async () => {
  let release; const gate = new Promise(r => { release = r; }); const sent = [];
  const t = await setup({ fetchImpl: async (url, init) => { sent.push(init.body); await gate; return { ok: true, status: 200 }; } });
  const b = { id: t.id, sid: 'race-sid-0001', kind: 'final' };
  const p1 = post(t.base, b); await new Promise(r => setTimeout(r, 50)); const p2 = post(t.base, b);
  await new Promise(r => setTimeout(r, 50)); release();
  const [a, c] = await Promise.all([p1, p2]); assert.equal(a.status, 200); assert.equal(c.status, 200);
  assert.equal(sent.length, 1); t.close();
});

test('Telegram xato bergan yuborish "yuborilgan" deb eslanmaydi: qayta urinish ishlaydi', async () => {
  let fail = true, calls = 0;
  const t = await setup({ fetchImpl: async () => { calls++; return fail ? { ok: false, status: 500 } : { ok: true, status: 200 }; } });
  const b = { id: t.id, sid: 'retry-sid-0001', kind: 'final' };
  assert.equal((await post(t.base, b)).status, 502); fail = false;
  const r = await post(t.base, b); assert.equal(r.status, 200); assert.equal((await r.json()).duplicate, undefined);
  assert.equal(calls, 2); t.close();
});

test('Telegram xabarida: sayt ID, shablon, ism, savol, javob va sana/vaqt bor', async () => {
  const t = await setup();
  await post(t.base, { id: t.id, kind: 'final', name: 'Sinov', answers: [{ q: 'Savol?', a: 'Javob' }] });
  const txt = t.sent[0].body.text;
  for (const part of [t.id, 'Dark Romance', 'Sinov', 'Savol?', 'Javob']) assert.ok(txt.includes(part), part);
  assert.match(txt, /\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2} \(Toshkent\)/); t.close();
});
