import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Experience from '../experience/Experience.jsx';
import { buildConfig } from '../experience/defaults.js';
import { fetchSite } from '../lib/api.js';
import { templateById } from '../config/site.js';

const Screen = ({ children }) => <div className="fixed inset-0 grid place-items-center text-center p-8 bg-ink text-white" role="status">{children}</div>;

// /demo/:id — ommaviy demo (hech narsa yuborilmaydi). /s/:code — mijozning noyob sayti (javoblar Telegram'ga ketadi).
export default function Demo() {
  const { id, code } = useParams();
  const [site, setSite] = useState(null), [state, setState] = useState(code ? 'loading' : 'ok'), [try_, setTry] = useState(0);

  useEffect(() => {
    if (!code) { setSite(null); setState('ok'); return; }
    let live = true; setState('loading');
    fetchSite(code).then(s => { if (live) { setSite(s); setState('ok'); } }).catch(e => live && setState(e.message === 'notfound' ? 'notfound' : 'error'));
    return () => { live = false; };
  }, [code, try_]);

  useEffect(() => { // mijoz sahifalari qidiruvga tushmasin
    if (!code) return; const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex,nofollow'; document.head.appendChild(m);
    const prev = document.title; document.title = 'Sizga maxsus ❤️'; return () => { m.remove(); document.title = prev; };
  }, [code]);

  if (state === 'loading') return <Screen><p className="text-5xl animate-pulse">❤️</p></Screen>;
  if (state === 'notfound') return <Screen><div><p className="text-xl mb-4">Bu sahifa topilmadi.</p><Link to="/" className="underline">Bosh sahifa</Link></div></Screen>;
  if (state === 'error') return <Screen><div><p className="text-xl mb-4">Serverga ulanib bo'lmadi.</p><button className="btn btn-p" onClick={() => setTry(n => n + 1)}>Qayta urinish</button></div></Screen>;

  const tpl = templateById(code ? site?.template : id);
  if (!tpl) return <Screen><div><p className="text-xl mb-4">Shablon topilmadi.</p><Link to="/shablonlar" className="underline">Shablonlar</Link></div></Screen>;
  return <Experience key={code || id} tpl={tpl} c={buildConfig(code ? site : null)} site={code ? site : null} />;
}
