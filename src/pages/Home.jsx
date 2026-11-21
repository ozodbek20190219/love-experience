import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TEMPLATES } from '../config/site.js';
import TemplateCard from '../components/TemplateCard.jsx';
import ContactButtons from '../components/ContactButtons.jsx';
const Heart3D = lazy(() => import('../components/Heart3D.jsx'));
const W = ({ children, d = 0, g }) => <motion.span initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d, duration: .7 }} className={`inline-block mr-[.25em] ${g ? 'gradient-text' : ''}`}>{children}</motion.span>;
const STEPS = [['Tanlang', 'Beshta 3D shablondan o\'zingizga yoqqanini tanlang.'], ['Yozing', "Instagram yoki Telegram orqali menga yozing."], ['Tayyor sayt', 'Ismingiz bilan alohida sayt yarataman va havolasini beraman.'], ['Yuboring', "Havolani sevgan insoningizga yuboring — javoblarini sizga yetkazaman."]];

export default function Home() {
  const h = 'Hislaringizni unutilmas tarzda izhor qiling.'.split(' ');
  return <>
    <section className="relative min-h-[88vh] overflow-hidden grid md:grid-cols-2 items-center max-w-6xl mx-auto px-5 gap-6">
      <div className="relative z-10 py-10">
        <h1 className="font-display text-4xl sm:text-6xl leading-[1.05]">{h.map((w, i) => <W key={i} d={.2 + i * .12} g={i >= h.length - 2}>{w}</W>)}</h1>
        <p className="mt-6 text-mute text-lg max-w-md">Oddiy xabar emas. Sevgan insoningiz uchun maxsus yaratilgan 3D romantik sayt — u savollarga javob beradi, javoblari esa sizga keladi.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Link to="/shablonlar" className="btn btn-p">Shablonlarni ko'rish</Link><Link to="/jarayon" className="btn btn-g">Qanday ishlaydi</Link></div>
        <p className="mt-8 mb-3 text-xs uppercase tracking-widest text-mute">Buyurtma uchun yozing</p><ContactButtons className="!justify-start" />
      </div>
      <div className="h-[340px] md:h-[560px] -mx-5 md:mx-0"><Suspense fallback={<div className="h-full grid place-items-center text-6xl">❤️</div>}><Heart3D /></Suspense></div>
    </section>
    <section className="max-w-6xl mx-auto px-5 py-16"><h2 className="font-display text-3xl mb-8">Beshta shablon — beshta alohida dunyo</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{TEMPLATES.map(t => <TemplateCard key={t.id} t={t} />)}</div></section>
    <section className="bg-panel py-16"><div className="max-w-6xl mx-auto px-5"><h2 className="font-display text-3xl mb-10">Qanday ishlaydi</h2>
      <ol className="grid md:grid-cols-4 gap-8">{STEPS.map(([a, b], i) => <li key={a}><span className="w-9 h-9 rounded-full bg-crimson grid place-items-center text-sm mb-3">{i + 1}</span><h3 className="text-white text-xl font-display mb-1">{a}</h3><p className="text-mute">{b}</p></li>)}</ol></div></section>
    <section className="text-center py-24 px-5"><h2 className="font-display text-4xl max-w-2xl mx-auto">Yuragingizdagi so'zlarni eng chiroyli shaklda yetkazing.</h2><ContactButtons className="mt-8" /></section>
  </>;
}
