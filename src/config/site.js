// Yagona sozlama fayli: aloqa havolalari va shablonlar.
// Aloqa havolalari shu yerda qat'iy yozilgan (env'dan olinmaydi) — eski/boshqa username qolib ketmasligi uchun.
export const CONTACTS = {
  instagram: { user: '_anora.010_', url: 'https://ig.me/m/_anora.010_', profile: 'https://instagram.com/_anora.010_' },
  telegram: { user: 'anora_dev', url: 'https://t.me/anora_dev' },
};

// Demo shablonlarda haqiqiy ism ishlatilmaydi: faqat shu placeholderlar.
export const PH_SENDER = '[Ismingiz]';
export const PH_RECIPIENT = '[Uni ismi]';

// code — noyob ID prefiksi (masalan DR-7K2M9Q4X). Telegram botda shablon shu orqali bir qarashda aniqlanadi.
export const TEMPLATES = [
  { id: 'dark-romance', code: 'DR', name: 'Dark Romance', tag: 'Atirgul',
    desc: "Qorong'u zalda sekin ochilayotgan 3D atirgul, uchib tushayotgan gulbarglar va qip-qizil yorug'lik.",
    features: ['3D atirgul', 'Tushayotgan gulbarglar', 'Dramatik yorug\'lik'],
    t: { bg: 'radial-gradient(ellipse at 50% 0%,#4a0618 0%,#0a0306 70%)', fg: '#fde8ee', accent: '#d6153f', card: 'rgba(30,6,14,.72)', font: 'Fraunces', glyph: '🌹' } },
  { id: 'soft-love', code: 'SL', name: 'Soft Sakura', tag: 'Sakura',
    desc: "Yorug' pushti osmon, aylanib turgan sakura guli va shamolda uchayotgan yuzlab gulbarglar.",
    features: ['3D sakura guli', 'Gulbarg bo\'roni', 'Yumshoq yorug\'lik'],
    t: { bg: 'linear-gradient(160deg,#fff7fa,#ffd9e6)', fg: '#4a1d31', accent: '#e0457b', card: 'rgba(255,255,255,.74)', font: 'Fraunces', glyph: '🌸' } },
  { id: 'galaxy-love', code: 'GL', name: 'Galaxy Love', tag: 'Galaktika',
    desc: "Yulduzlardan iborat spiral galaktika, yurak shaklidagi yulduz turkumi va bir-biriga intilayotgan ikki nur.",
    features: ['Spiral galaktika', 'Yurak yulduz turkumi', 'Ikki orbita'],
    t: { bg: 'radial-gradient(ellipse at 30% 10%,#2b1b6e 0%,#07061a 65%)', fg: '#ece9ff', accent: '#8b5cf6', card: 'rgba(14,10,44,.72)', font: 'Manrope', glyph: '✨' } },
  { id: 'vintage-romance', code: 'VR', name: 'Vintage Romance', tag: 'Muhrlangan xat',
    desc: "Mum muhrli 3D konvert: muhr sinadi, qopqoq ochiladi va xat sekin yuqoriga ko'tariladi.",
    features: ['3D konvert', 'Mum muhr', 'Sham yorug\'ligi'],
    t: { bg: 'linear-gradient(180deg,#e9d8b4,#b9955f)', fg: '#3b2a17', accent: '#8a1c2b', card: 'rgba(250,240,214,.82)', font: 'Fraunces', glyph: '💌' } },
  { id: 'fantasy-world', code: 'FW', name: 'Fantasy Garden', tag: "Sehrli bog'",
    desc: "Tungi sehrli bog': yonib turgan gullar, uchib yurgan o't pashshalari va shisha yurak.",
    features: ['Yonuvchi gullar', "O't pashshalari", 'Billur yurak'],
    t: { bg: 'radial-gradient(ellipse at 50% 100%,#0f5a45 0%,#071a22 70%)', fg: '#eafff5', accent: '#4ade80', card: 'rgba(7,30,34,.72)', font: 'Fraunces', glyph: '🧚' } },
];
export const templateById = id => TEMPLATES.find(t => t.id === id);
