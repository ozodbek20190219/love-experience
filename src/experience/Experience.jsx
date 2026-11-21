import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Music, VolumeX } from 'lucide-react';
import SceneCanvas from '../scenes/SceneCanvas.jsx';
import Confetti from '../components/Confetti.jsx';
import ContactButtons from '../components/ContactButtons.jsx';
import { rich } from '../components/Ph.jsx';
import { sendAnswers } from '../lib/api.js';

const newSid = () => (globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`).replace(/[^\w-]/g, '').slice(0, 64);
const STEPS = ['hello', 'proposal', 'letter', 'reasons', 'questions', 'dreams', 'secret', 'final'];
const NO_MSGS = ['', 'Yana bir o\'ylab ko\'ring 🥺', 'Balki menga imkon berarsiz? ❤️', 'Yana bir marta o\'ylang 🥹'];

export default function Experience({ tpl, c, site }) {
  const t = tpl.t, demo = !site;
  const [i, setI] = useState(0), [fire, setFire] = useState(0), [music, setMusic] = useState(false);
  const [name, setName] = useState(c.recipient || '');
  const [noN, setNoN] = useState(0), [yes, setYes] = useState(false), [declined, setDeclined] = useState(false);
  const [answers, setAnswers] = useState({}), [free, setFree] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | ok | error
  const audio = useRef(), sentFinal = useRef(false);
  // Har bir sahifa ochilishiga bitta ID: server shu orqali takroriy xabarni (qayta bosish, qayta urinish) o'tkazib yubormaydi.
  const sid = useRef(newSid());
  const step = STEPS[i], next = () => setI(n => Math.min(STEPS.length - 1, n + 1));
  const who = (name || '').trim();

  const post = payload => (demo ? Promise.resolve() : sendAnswers({ id: site.id, sid: sid.current, name: who, noClicks: noN, ...payload }));
  const sayYes = () => { setYes(true); setFire(f => f + 1); post({ kind: 'proposal', proposal: 'yes' }).catch(() => {}); };
  const decline = () => { setDeclined(true); post({ kind: 'proposal', proposal: 'declined' }).catch(() => {}); };

  const sendFinal = () => {
    if (demo) { setStatus('ok'); return; }
    setStatus('sending');
    post({ kind: 'final', proposal: yes ? 'yes' : '', message: free, answers: c.questions.map((q, k) => answers[k] ? { q: q.q, a: answers[k] } : null).filter(Boolean) })
      .then(() => setStatus('ok')).catch(() => setStatus('error'));
  };
  useEffect(() => { if (step === 'final' && !sentFinal.current) { sentFinal.current = true; sendFinal(); } }, [step]); // eslint-disable-line

  const toggleMusic = () => { if (!c.music || !audio.current) return; if (music) audio.current.pause(); else audio.current.play().catch(() => {}); setMusic(!music); };

  const btn = { background: t.accent, color: '#fff', borderRadius: 999, padding: '.8rem 1.5rem', fontWeight: 700, minHeight: 46 };
  const ghost = { border: `1px solid ${t.accent}`, color: t.fg, borderRadius: 999, padding: '.8rem 1.4rem', fontWeight: 600, minHeight: 46 };
  const cardS = { background: 'rgba(255,255,255,.08)', border: `1px solid ${t.accent}55`, borderRadius: 16, padding: '.9rem 1.1rem' };
  const H = ({ children }) => <h2 className="text-2xl sm:text-3xl mb-3" style={{ fontFamily: t.font }}>{children}</h2>;
  const Next = ({ label = 'Davom etish', onClick = next }) => <button onClick={onClick} style={btn} className="mt-5">{label}</button>;

  let body;
  if (step === 'hello') body = <>
    <H>Salom{who ? <>, {rich(who)}</> : ''} ❤️</H>
    <p className="text-lg opacity-90">Men, {rich(c.sender)}, siz uchun o'zgacha syurpriz tayyorladim…</p>
    {!c.recipient && <input value={name} onChange={e => setName(e.target.value)} maxLength={60} placeholder="Ismingiz (ixtiyoriy)" aria-label="Ismingiz" className="input mt-4 !bg-white/10 !text-inherit" style={{ color: t.fg, borderColor: t.accent + '66' }} />}
    <p className="text-xs opacity-70 mt-4">{demo ? 'Demo rejimi: javoblar hech kimga yuborilmaydi.' : 'Javoblaringiz sizga bu sahifani yuborgan insonga yetkaziladi.'}</p>
    <Next label="Boshlash" />
  </>;
  else if (step === 'proposal') body = <>
    <p className="text-lg">Mening ismim {rich(c.sender)}.</p><p className="text-2xl my-2">Sizni sevib qoldim ❤️</p>
    <p className="opacity-90 mb-4">{c.confession}</p>
    {declined ? <p className="text-lg">Javobingiz yuborildi. Vaqtingiz uchun rahmat. 🤍</p> : !yes ? <>
      <p className="font-semibold mb-3">{c.proposalQuestion}</p>
      <div className="flex justify-center items-center gap-4 flex-wrap min-h-[96px]">
        <button onClick={sayYes} style={{ ...btn, transform: `scale(${1 + noN * .18})` }}>Ha, albatta 🥹❤️</button>
        {noN < 3 && <motion.button animate={{ x: noN ? (noN % 2 ? 50 : -50) : 0, y: noN * 6, scale: 1 - noN * .15 }} onClick={() => setNoN(n => n + 1)} style={ghost}>Yo'q, aslo</motion.button>}
      </div>
      <p aria-live="polite" className="h-6 mt-2 text-center">{NO_MSGS[noN]}</p>
      <button onClick={decline} className="underline text-sm opacity-75 mt-3">Hozircha javob bermayman</button>
    </> : <><motion.p initial={{ scale: .85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-2xl">Rahmat! Bu yuragimni to'ldirdi 🥹❤️</motion.p><Next /></>}
  </>;
  else if (step === 'letter') body = <Letter {...{ t, c, who, cardS, Next, H }} />;
  else if (step === 'reasons') body = <Reasons {...{ t, c, cardS, Next, H, btn }} />;
  else if (step === 'questions') body = <Questions {...{ t, c, cardS, answers, setAnswers, free, setFree, Next, H, ghost }} />;
  else if (step === 'dreams') body = <><H>Orzular</H>{c.dreams.map((d, k) => <motion.p key={k} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3 + k * .35 }} className="text-lg my-3">{tpl.t.glyph} {d}</motion.p>)}<Next /></>;
  else if (step === 'secret') body = <Secret {...{ t, c, cardS, Next, H }} />;
  else body = <>
    <H>Yakuniy syurpriz</H><p className="text-lg mb-4">{c.final}</p>
    <button onClick={() => setFire(f => f + 1)} style={btn}>❤️ Syurprizni boshlash</button>
    <div aria-live="polite" className="mt-4 text-sm">
      {status === 'sending' && 'Yuborilmoqda…'}
      {status === 'ok' && (demo ? 'Demo rejimi: javoblar hech kimga yuborilmaydi.' : 'Javoblaringiz yuborildi ❤️')}
      {status === 'error' && <>Javobni yuborib bo'lmadi. <button className="underline font-semibold" onClick={sendFinal}>Qayta urinish</button></>}
    </div>
    {demo && <div className="mt-5 pt-4 border-t border-white/15"><p className="text-sm opacity-80 mb-3">Shu shablonni o'zingiz uchun buyurtma qilmoqchimisiz?</p><ContactButtons template={tpl} /></div>}
  </>;

  return <div className="fixed inset-0 overflow-hidden" style={{ background: t.bg, color: t.fg, fontFamily: `${t.font},serif` }}>
    <SceneCanvas id={tpl.id} celebrate={fire} progress={i / (STEPS.length - 1)} />
    <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 40%,transparent 45%,rgba(0,0,0,.28) 100%)' }} aria-hidden="true" />
    <Confetti fire={fire} />
    <div className="absolute top-0 inset-x-0 h-1 bg-white/10" aria-hidden="true"><div className="h-full transition-all duration-700" style={{ width: `${((i + 1) / STEPS.length) * 100}%`, background: t.accent }} /></div>
    <div className="absolute top-3 inset-x-3 flex justify-between text-sm z-10">
      {demo ? <Link to="/shablonlar" className="px-3 py-2 rounded-full bg-black/45 text-white backdrop-blur">← Shablonlar</Link> : <span />}
      {c.music && <><button onClick={toggleMusic} aria-pressed={music} aria-label="Musiqa" className="px-3 py-2 rounded-full bg-black/45 text-white backdrop-blur flex gap-2 items-center">{music ? <Music size={18} /> : <VolumeX size={18} />}Musiqa</button><audio ref={audio} src={c.music} loop /></>}
    </div>
    <div className="absolute inset-x-0 bottom-0 p-3 flex justify-center" style={{ paddingBottom: 'max(.75rem,env(safe-area-inset-bottom))' }}>
      <div className="w-full max-w-xl max-h-[56vh] overflow-y-auto rounded-3xl p-5 text-center" style={{ background: t.card, border: `1px solid ${t.accent}55`, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', boxShadow: '0 20px 60px rgba(0,0,0,.35)' }}>
        <AnimatePresence mode="wait"><motion.div key={step} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .35 }}>{body}</motion.div></AnimatePresence>
      </div>
    </div>
  </div>;
}

function Letter({ c, who, cardS, Next, H }) {
  const [open, setOpen] = useState(false);
  return <><H>Sevgi xati</H>
    <button onClick={() => setOpen(true)} aria-expanded={open} style={{ ...cardS, fontSize: '3rem' }} className="mx-auto block">{open ? '📖' : '✉️'}</button>
    {open ? <><motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="mt-4 text-lg leading-relaxed">{who ? <>Aziz {rich(who)}, </> : ''}{c.feelings}</motion.p><Next /></> : <p className="mt-3 text-sm opacity-80">Ochish uchun bosing</p>}
  </>;
}

function Reasons({ c, cardS, Next, H, btn }) {
  const [n, setN] = useState(1), all = n >= c.reasons.length;
  return <><H>Nega aynan siz?</H>
    <div className="grid gap-2 text-left">{c.reasons.slice(0, n).map((r, k) => <motion.div key={k} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={cardS}>💗 {r}</motion.div>)}</div>
    {all ? <Next /> : <button onClick={() => setN(n + 1)} style={btn} className="mt-4">Yana bir sabab</button>}
  </>;
}

function Questions({ c, t, cardS, answers, setAnswers, free, setFree, Next, H, ghost }) {
  const [qi, setQi] = useState(0), qs = c.questions;
  if (qi >= qs.length) return <><H>Oxirgi so'z</H><p className="mb-3 opacity-90">{c.freeQuestion}</p>
    <textarea value={free} onChange={e => setFree(e.target.value)} maxLength={1000} rows={3} aria-label="Xabaringiz" className="input !bg-white/10" style={{ color: t.fg, borderColor: t.accent + '66' }} /><Next /></>;
  const q = qs[qi], picked = answers[qi];
  return <><p className="text-sm opacity-70">Savol {qi + 1} / {qs.length}</p><H>{q.q}</H>
    <div className="grid gap-2">{q.options.map(o => <button key={o} disabled={!!picked} onClick={() => setAnswers({ ...answers, [qi]: o })} aria-pressed={picked === o}
      style={{ ...ghost, background: picked === o ? t.accent : 'transparent', color: picked === o ? '#fff' : t.fg, opacity: picked && picked !== o ? .45 : 1 }}>{o}</button>)}</div>
    {picked && <><p className="mt-3" style={cardS}>{q.reply || 'Rahmat ❤️'}</p><button className="mt-4" style={{ background: t.accent, color: '#fff', borderRadius: 999, padding: '.8rem 1.5rem', fontWeight: 700, minHeight: 46 }} onClick={() => setQi(qi + 1)}>{qi + 1 < qs.length ? 'Keyingi savol' : 'Davom etish'}</button></>}
  </>;
}

function Secret({ c, cardS, Next, H }) {
  const [s, setS] = useState(false);
  return <><H>Maxfiy xabar</H><button onClick={() => setS(true)} aria-expanded={s} style={{ ...cardS, fontSize: '3rem' }} className="mx-auto block">{s ? '💌' : '🔒'}</button>
    <p className="mt-4 text-lg">{s ? c.secret : 'Muhrni ochish uchun bosing'}</p>{s && <Next />}</>;
}
