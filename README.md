# LOVE EXPERIENCE

Romantik 3D saytlar xizmatining **reklama va demo platformasi** (React + Vite + Tailwind + Three.js, backend — Express/Node). Interfeys tili — o'zbek (lotin).

Siz sayt havolasini Instagram bio'ga qo'yasiz → mijoz 5 ta 3D shablonni ko'radi → yoqsa **Instagram** (`@_anora.010_`) yoki **Telegram** (`@anora_dev`) orqali yozadi → siz unga alohida sayt yaratib, havola berasiz → sevgilisi javob berganda javoblar **sizning Telegram botingizga** keladi.

Supabase, admin panel, mijozlar kabineti, buyurtma formasi va to'lov tizimi **yo'q** — ular kerak emas.

## Aloqa havolalari
`src/config/site.js` ichida qat'iy yozilgan (env'dan olinmaydi):
- Instagram: https://ig.me/m/_anora.010_
- Telegram: https://t.me/anora_dev

Tugmalar bosh sahifa, sarlavha, footer, "Aloqa", "Shablonlar" sahifalari va demo yakunida bor. Username o'zgarsa, faqat shu faylni tahrirlang (`tests/static.test.js` boshqa username qolmaganini tekshiradi).

## Ismlar tizimi (placeholderlar)
Demo'larda haqiqiy ism yo'q. Hamma 5 shablonda bir xil: **[Ismingiz]** va **[Uni ismi]** — dizayndagi yorug' "chip" ko'rinishida (`src/components/Ph.jsx`).
> Salom, [Uni ismi] ❤️ — Men, [Ismingiz], siz uchun o'zgacha syurpriz tayyorladim…

Mijoz saytida haqiqiy ismlar `new-site` orqali beriladi (pastda). Qizning ismi **majburiy emas**: `--to` berilmasa, sayt uning ismini ixtiyoriy so'raydi; xohlamasa, ismsiz davom etadi.

## 5 ta shablon (har biri alohida 3D sahna, lazy-load)
| Kod | Shablon | Sahna (`src/scenes/`) |
|---|---|---|
| DR | Dark Romance | `DarkRose.jsx` — qatlam-qatlam 3D atirgul, tushayotgan gulbarglar, cho'g' zarralari |
| SL | Soft Sakura | `SoftSakura.jsx` — aylanuvchi sakura guli, gulbarg bo'roni, bokeh nurlar |
| GL | Galaxy Love | `GalaxyLove.jsx` — spiral galaktika, yurak yulduz turkumi, ikki orbita, uchar yulduz |
| VR | Vintage Romance | `VintageLetter.jsx` — mum muhrli 3D konvert, ochiladigan qopqoq, xat |
| FW | Fantasy Garden | `FantasyGarden.jsx` — yonuvchi gullar, o't pashshalari, oy, billur yurak |

Telefonda zarrachalar kamayadi, antialias o'chadi, DPR pasayadi. WebGL yo'q / "harakatni kamaytirish" yoqilgan / sahna xato bersa — emoji zaxira ko'rinishi (sayt qulamaydi). Three.js alohida `three-*.js` faylida: bosh sahifa yengil, 3D faqat kerak bo'lganda yuklanadi.

> Eslatma: shablon **ID**lari (`soft-love`, `fantasy-world`) o'zgarmadi (havolalar buzilmasin), faqat ko'rinadigan **nomlari** Soft Sakura va Fantasy Garden bo'ldi.

## O'rnatish va ishga tushirish
Node **>= 20.12** kerak.

    npm install
    cp .env.example .env      # qiymatlarni to'ldiring
    npm run build             # frontend -> dist/
    npm start                 # backend: API + dist/  (http://localhost:8787)

Ishlab chiqish: bir terminalda `npm start`, ikkinchisida `npm run dev` (Vite `/api` ni 8787-portga yo'naltiradi).

## Telegram bot
1. @BotFather → `/newbot` → tokenni `.env` dagi `TELEGRAM_BOT_TOKEN` ga yozing.
2. Botingizga Telegramda `/start` yozing.
3. `npm run chat-id` → chiqqan `OWNER_CHAT_ID=...` ni `.env` ga yozing.
4. `npm start` → `http://localhost:8787/api/health` → `{"ok":true,"telegram":true}` bo'lishi kerak.

**Token faqat backend env'ida** — frontend kodida va `dist/` da yo'q (tekshirilgan).

Botga keladigan xabar: **Sayt ID**, **shablon nomi**, buyurtmachi, javob beruvchining kiritgan ismi (bo'lsa), har bir **savol va javob**, erkin xabar, **sana va vaqt** (Toshkent). Taklifga javob ("Ha" / "hozircha javob bermayman") darhol alohida xabar bo'lib keladi.

**Takroriy xabar himoyasi:** brauzer har sahifa ochilishiga noyob `sid` yuboradi; server o'sha `sid` bilan kelgan takror so'rovni (ikki marta bosish, qayta urinish, bir vaqtdagi ikki so'rov) Telegram'ga qayta yubormaydi. Telegram xato bergan yuborish "yuborilgan" deb hisoblanmaydi — qayta urinish ishlaydi.

**Qaysi sahifalar yuboradi:** faqat `/s/<ID>` (noyob ID'li sayt). Ommaviy `/demo/<shablon>` sahifalari **hech narsa yubormaydi** — Instagram bio'dan kirgan har bir tomoshabin botingizni to'ldirib yubormasligi uchun. Demo'ni Telegram bilan sinamoqchi bo'lsangiz yoki kimgadir "demo" havolasi bermoqchi bo'lsangiz, `new-site` bilan ID'li sayt yarating.

## Mijoz uchun sayt yaratish
    npm run new-site -- --template dark-romance --name "Mijoz ismi" --to "Uning ismi" --base https://sizning-sayt.netlify.app
    npm run new-site -- --list

- `--template`: `dark-romance | soft-love | galaxy-love | vintage-romance | fantasy-world` (yoki DR/SL/GL/VR/FW)
- `--name`: mijozingiz ismi (majburiy) — "Men, ___" shu bo'ladi
- `--to`: sevgan insonning ismi (ixtiyoriy)
- ixtiyoriy matnlar: `--confession`, `--feelings`, `--secret`, `--final`, `--music`, `--proposalQuestion`

Natija: `data/sites/<ID>.json` (masalan `DR-7K2M9Q4X`), havola: `<base>/s/<ID>`. To'liq shaxsiylashtirish uchun shu faylni tahrirlang (`config` ichida: `confession, feelings, reasons[], dreams[], secret, final, proposalQuestion, freeQuestion, music, questions[{q, options[], reply}]`). Saytni o'chirish: faylda `"active": false`. Fayl yaratilgach, **backend'ga yetib borishi kerak** (git push → qayta deploy, yoki doimiy disk + `SITES_DIR`).

`data/sites` ichida mijoz matnlari bo'ladi — repo'ni **private** qiling.

## Deploy
Loyiha ikki qismdan iborat: **frontend** (statik) va **backend** (Node, Telegram tokeni shu yerda). Netlify statik saytni joylaydi; `server/` esa doimiy ishlaydigan oddiy Node server, shuning uchun **backend Netlify'ga emas, alohida joyga** qo'yiladi.

### 1) Backend (Telegram) — Render / Railway / Fly.io / VPS
Misol (Render → New → Web Service, repo'ni ulang):
- Build: `npm install` · Start: `npm start`
- Environment: `TELEGRAM_BOT_TOKEN`, `OWNER_CHAT_ID`, `ALLOWED_ORIGIN=https://sizning-sayt.netlify.app`, `PUBLIC_URL=https://sizning-sayt.netlify.app`
- Tekshirish: `https://<backend>/api/health` → `{"ok":true,"telegram":true}`
- Bepul tariflarda server uxlab qolishi (birinchi javob sekin) va diski vaqtinchalik bo'lishi mumkin — mijoz saytlari `data/sites` da repo bilan birga deploy bo'ladi, shuning uchun yangi sayt = `git push`.

### 2) Frontend — Netlify
`netlify.toml` tayyor (build: `npm run build`, publish: `dist`, SPA redirect, kesh sarlavhalari). Netlify → Add new site → Import from Git, so'ng **Site settings → Environment variables**:
- `VITE_API_BASE=https://<backend-manzili>` (**build'dan oldin** kiriting, keyin qayta deploy qiling)

Frontend va backend bitta serverda (masalan Render) ishlasa, `VITE_API_BASE` ni bo'sh qoldiring.

## Tekshiruv
    npm test     # server + statik tekshiruvlar (25 ta)
    npm run build

## Halol holat: nima tekshirilgan, nima yo'q
**Haqiqatan tekshirilgan (yaratuvchi muhitda):**
- `npm test` — 25/25 o'tdi: server API, ID generatsiyasi, Telegram xabari mazmuni (ID, shablon, ism, savol, javob, sana/vaqt), takroriy xabar himoyasi (sid, mazmun, bir vaqtdagi so'rovlar, xatodan keyin qayta urinish), rate limit, path traversal, aloqa havolalari, shablon nomlari, placeholderlar, frontendda token yo'qligi.
- `npm run build` muvaffaqiyatli; `dist/` ichida bot tokeni/Telegram API manzili yo'q, faqat `ig.me/m/_anora.010_` va `t.me/anora_dev` bor.
- Haqiqiy server ishga tushirilib: `/api/health`, `new-site` skripti, `/api/sites/<ID>`, `/s/<ID>` va `/demo/...` javoblari tekshirilgan; Telegram sozlanmaganda yuborish 503 qaytargan.

**Tekshirilmagan (o'zingiz sinab ko'ring):**
- **3D sahnalarning ko'rinishi.** Bu muhitda brauzer/GPU yo'q: sahnalar build'dan o'tgan, lekin ekranda qanday ko'rinishi, kadr tezligi, Android'dagi ishlashi ko'rilmagan. Ranglar, kamera va o'lchamlar har bir sahna faylining boshida sozlanadi.
- Sahifalar dizayni, hover effektlari va mobil ko'rinishi (faqat kod darajasida yozilgan).
- **Haqiqiy Telegram bot bilan yuborish** — token yo'q edi. Mantiq soxta Telegram bilan sinalgan.
- Netlify va Render'ga haqiqiy deploy (sozlamalar tayyor, bajarilmagan).
- Instagram/Telegram havolalarining telefonda ilovani ochishi (manzillar to'g'ri, qurilmada bosib ko'rilmagan).

**Ma'lum cheklovlar:** `npm audit` da `vite/esbuild` (faqat `npm run dev` serveri) bo'yicha ogohlantirish qoldi — uni yopish Vite'ning katta versiyasiga o'tishni talab qiladi, production build'ga ta'sir qilmaydi. Takroriy xabar xotirasi server qayta ishga tushganda tozalanadi. Telegram javobi kechiksa server bir marta qayta urinadi — juda kam holatda xabar ikki marta kelishi mumkin.
