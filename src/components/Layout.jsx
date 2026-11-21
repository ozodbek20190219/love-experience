import { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';
import ContactButtons from './ContactButtons.jsx';
const L = [['/shablonlar', 'Shablonlar'], ['/jarayon', 'Jarayon'], ['/faq', 'FAQ'], ['/aloqa', 'Aloqa']];
const TITLES = { '/': 'Love Experience — romantik 3D veb-saytlar', '/shablonlar': 'Shablonlar — Love Experience', '/jarayon': 'Qanday ishlaydi — Love Experience', '/faq': 'FAQ — Love Experience', '/aloqa': 'Aloqa — Love Experience' };

export default function Layout() {
  const [o, setO] = useState(false), { pathname } = useLocation();
  useEffect(() => setO(false), [pathname]);
  useEffect(() => { document.title = TITLES[pathname] || 'Love Experience'; }, [pathname]);
  return <div className="min-h-screen flex flex-col">
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-white focus:text-black focus:p-2">Asosiy qismga o'tish</a>
    <header className="fixed top-0 inset-x-0 z-40 backdrop-blur bg-ink/70 border-b border-white/10"><nav className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between" aria-label="Asosiy menyu">
      <Link to="/" className="flex items-center gap-2 font-display text-xl"><Heart className="text-rose" size={20} fill="currentColor" />Love Experience</Link>
      <ul className="hidden md:flex gap-7 text-sm text-mute">{L.map(([t, n]) => <li key={t}><NavLink to={t} className={({ isActive }) => isActive ? 'text-white' : 'hover:text-white'}>{n}</NavLink></li>)}</ul>
      <ContactButtons variant="icons" className="hidden md:flex" />
      <button className="md:hidden p-2" aria-label="Menyu" aria-expanded={o} onClick={() => setO(!o)}>{o ? <X /> : <Menu />}</button></nav>
      {o && <div className="md:hidden bg-panel px-5 py-4 grid gap-3"><ul className="grid gap-1">{L.map(([t, n]) => <li key={t}><Link className="block py-2" to={t}>{n}</Link></li>)}</ul><ContactButtons variant="icons" /></div>}</header>
    <main id="main" className="flex-1 pt-16"><Outlet /></main>
    <footer className="border-t border-white/10 bg-panel mt-24"><div className="max-w-6xl mx-auto px-5 py-10 flex flex-wrap gap-6 justify-between text-sm text-mute"><p className="font-display text-white text-lg">Love Experience</p><p>Har bir sayt qo'lda, buyurtmangizga ko'ra yaratiladi.</p><div className="flex items-center gap-5"><Link to="/faq">FAQ</Link><Link to="/aloqa">Aloqa</Link><ContactButtons variant="icons" /></div></div></footer>
  </div>;
}
