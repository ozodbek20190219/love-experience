import { useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { TEMPLATES } from '../config/site.js';
import ContactButtons from '../components/ContactButtons.jsx';
// Three.js og'ir: faqat shu sahifa ochilganda yuklanadi (bosh sahifa yengil qoladi).
const SceneCanvas = lazy(() => import('../scenes/SceneCanvas.jsx'));

// Bir vaqtda faqat bitta jonli 3D kanvas (telefonda tezlik uchun).
export default function Templates() {
  const [a, setA] = useState(0), t = TEMPLATES[a];
  return <div className="max-w-6xl mx-auto px-5 py-10">
    <h1 className="font-display text-4xl">Shablonlar</h1>
    <p className="text-mute mt-3 max-w-xl">Beshta alohida 3D dunyo. Birini tanlang — pastdagi tugma orqali to'liq demoni sinab ko'ring.</p>
    <div className="mt-8 relative rounded-3xl overflow-hidden border border-white/10 h-[52vh] min-h-[340px]" style={{ background: t.t.bg }}>
      <Suspense fallback={<div className="absolute inset-0 grid place-items-center text-6xl animate-pulse" aria-hidden="true">{t.t.glyph}</div>}><SceneCanvas id={t.id} preview /></Suspense>
      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"><p className="text-xs uppercase tracking-widest text-white/70">{t.tag}</p><p className="font-display text-2xl text-white">{t.name}</p></div>
    </div>
    <div role="tablist" aria-label="Shablonlar" className="mt-4 grid grid-cols-5 gap-2">{TEMPLATES.map((x, i) => <button key={x.id} role="tab" aria-selected={i === a} onClick={() => setA(i)} className={`rounded-xl py-3 border text-center transition ${i === a ? 'border-rose bg-panel' : 'border-white/10 hover:border-white/30'}`}><span className="block text-2xl">{x.t.glyph}</span><span className="block text-[11px] mt-1 text-mute truncate px-1">{x.name}</span></button>)}</div>
    <div className="mt-6 grid md:grid-cols-2 gap-6 items-start">
      <div><p className="text-mute">{t.desc}</p><ul className="text-sm text-mute mt-3 list-disc pl-5">{t.features.map(f => <li key={f}>{f}</li>)}</ul></div>
      <div className="grid gap-3"><Link to={`/demo/${t.id}`} className="btn btn-p">Jonli demoni ochish</Link><ContactButtons template={t} /><p className="text-xs text-mute text-center">Instagram yoki Telegram'da shablon nomini yozing — men sayt yarataman.</p></div>
    </div>
  </div>;
}
