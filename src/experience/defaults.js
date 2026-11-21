import { PH_SENDER, PH_RECIPIENT } from '../config/site.js';
// Standart matnlar (demo uchun). Haqiqiy mijoz saytida data/sites/<ID>.json ichidagi config shularni almashtiradi.
export const DEF = {
  sender: PH_SENDER, recipient: PH_RECIPIENT,
  proposalQuestion: 'Men bilan tanishasizmi?',
  confession: "Sen bilan o'tgan har bir kun menga yangi ma'no berdi. Shuni aytmasdan turolmadim.",
  reasons: ['Kulgingda quyosh bor', "Yoningda o'zimni xavfsiz his qilaman", "Sening e'tiboring juda samimiy", 'Hatto jim turganingda ham gaplashamiz', "Orzularingga ishonishing meni ilhomlantiradi"],
  feelings: "Birinchi marta ko'rganimdan beri yuragim boshqacha uradi. Bu his oddiy emas — u har kuni kuchayib boryapti. Sendan hech narsa talab qilmayman, faqat samimiyligimni bilishingni xohlayman.",
  questions: [
    { q: 'Sizga qaysi kechki reja yoqadi?', options: ['Kechki sayr 🌙', 'Kino kechasi 🎬', 'Sokin kafe ☕', 'Sayohat ✈️'], reply: 'Eng yaxshi damlar — yonimizda yaxshi inson bo\'lganda.' },
    { q: 'Sevimli faslingiz?', options: ['Bahor 🌸', 'Yoz ☀️', 'Kuz 🍂', 'Qish ❄️'], reply: "Siz bilan har fasl go'zal bo'lardi." },
    { q: 'Sizni nima xursand qiladi?', options: ["Samimiy so'z", 'Kichik syurpriz', "Birga o'tgan vaqt", "E'tibor va g'amxo'rlik"], reply: "Buni yodda tutaman." },
    { q: 'Keyingi uchrashuvga rozimisiz?', options: ['Ha, mamnuniyat bilan', "O'ylab ko'raman", 'Hozircha emas'], reply: "Javobingiz uchun rahmat." },
  ],
  freeQuestion: "Menga aytmoqchi bo'lgan so'zingiz bormi? (ixtiyoriy)",
  dreams: ['Birga sayohat qilish', 'Tinch uy, issiq choy', "Bir-birimizni doim qo'llab-quvvatlash"],
  secret: "Sen haqingda o'ylamagan kunim yo'q.",
  final: "Javobing nima bo'lishidan qat'i nazar, o'qiganing uchun rahmat. Sen bunga munosibsan ❤️",
  music: '',
};
const arr = (x, d) => (Array.isArray(x) && x.length ? x : d);
const normQ = x => (Array.isArray(x) ? { q: x[0], reply: x[1], options: ['Ha', 'Balki', "Yo'q"] } : x);

export function buildConfig(site) {
  const c = { ...DEF, ...(site?.config || {}) };
  c.sender = site ? site.sender : DEF.sender;
  c.recipient = site ? site.recipient || '' : DEF.recipient;
  c.reasons = arr(c.reasons, DEF.reasons); c.dreams = arr(c.dreams, DEF.dreams);
  c.questions = arr(c.questions, DEF.questions).map(normQ).filter(q => q?.q && Array.isArray(q.options) && q.options.length);
  return c;
}
