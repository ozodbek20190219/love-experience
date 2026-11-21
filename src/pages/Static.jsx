import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CONTACTS } from '../config/site.js';
import ContactButtons from '../components/ContactButtons.jsx';

const Page = ({ title, sub, children }) => <div className="max-w-6xl mx-auto px-5 py-14"><h1 className="font-display text-4xl">{title}</h1>{sub && <p className="text-mute mt-3 max-w-xl">{sub}</p>}<div className="mt-10">{children}</div></div>;

const STEPS = ['Shablonni tanlang va jonli demosini sinab ko\'ring', "Instagram yoki Telegram orqali menga yozing va shablon nomini ayting", 'Ismingizni (va xohlasangiz sevgan insoningiz ismini) yuborasiz', 'Men siz uchun alohida sayt yarataman va havolasini beraman', 'Havolani sevgan insoningizga yuborasiz — u savollarga javob beradi', "Javoblarini men sizga Instagram yoki Telegram orqali yetkazaman"];
export const HowItWorks = () => <Page title="Qanday ishlaydi" sub="Hech qanday ro'yxatdan o'tish va to'lov formasi yo'q — hammasi Instagram yoki Telegram orqali."><ol className="border-l border-white/15 ml-3 grid gap-8">{STEPS.map((s, i) => <motion.li key={s} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="pl-8 relative"><span className="absolute -left-[13px] top-0.5 w-6 h-6 rounded-full bg-crimson text-xs grid place-items-center">{i + 1}</span>{s}</motion.li>)}</ol><ContactButtons className="mt-12 !justify-start" /></Page>;

const QA = [
  ['Qanday buyurtma beraman?', "Shablonni tanlang va Instagram yoki Telegram orqali menga yozing. Boshqa forma yoki ro'yxatdan o'tish kerak emas."],
  ['Sayt qancha vaqtda tayyor bo\'ladi?', "Murakkablikka bog'liq; muddat yozishmada kelishiladi."],
  ['Narxi qancha?', "Narx yozishmada kelishiladi."],
  ['Shaxsiylashtirish mumkinmi?', "Ha: ismlar, asosiy matnlar, sabablar, savollar va javob variantlari, orzular, maxfiy xabar va musiqa sizning xohishingizga ko'ra."],
  ['Sevgan insonimning ismini bilishim shartmi?', "Yo'q. Ism ixtiyoriy: kiritmasangiz, sayt uning ismini o'zi so'raydi (u ham xohlamasa, ismsiz davom etadi)."],
  ["Javoblar qayerga boradi?", "Javoblar saytda saqlanmaydi: ular to'g'ridan-to'g'ri mening Telegram botimga yetkaziladi, men esa ularni sizga Instagram yoki Telegram orqali yuboraman."],
  ['Sevgan insonim javoblar yuborilishini biladimi?', "Ha. Sayt boshida «javoblaringiz sizga bu sahifani yuborgan insonga yetkaziladi» deb ochiq yozilgan."],
  ['Musiqa qo\'shiladimi?', "Ha, tashrifchi o'zi yoqadi (avtomatik chalinmaydi)."],
];
export const FAQ = () => <Page title="Ko'p so'raladigan savollar"><div className="grid gap-3 max-w-2xl">{QA.map(([q, a]) => <details key={q} className="rounded-xl bg-panel p-4 border border-white/10"><summary className="cursor-pointer font-semibold">{q}</summary><p className="text-mute mt-2">{a}</p></details>)}</div></Page>;

export const Contact = () => <Page title="Aloqa" sub="Buyurtma va savollar uchun Instagram yoki Telegram orqali yozing — qaysi biri qulay bo'lsa.">
  <ContactButtons className="!justify-start" />
  <p className="mt-5 text-sm text-mute">Instagram: <a className="underline" href={CONTACTS.instagram.profile} target="_blank" rel="noopener noreferrer">@{CONTACTS.instagram.user}</a> · Telegram: <a className="underline" href={CONTACTS.telegram.url} target="_blank" rel="noopener noreferrer">@{CONTACTS.telegram.user}</a></p></Page>;

export const NotFound = () => <Page title="404 — sahifa topilmadi" sub="Bu manzil mavjud emas."><Link to="/" className="btn btn-p">Bosh sahifaga qaytish</Link></Page>;
