import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { CONTACTS } from '../config/site.js';

// lucide-react'da brend ikonkalari yo'q (Instagram eskirgan, Telegram umuman yo'q) — shuning uchun oddiy SVG.
export const InstagramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5.2" /><circle cx="12" cy="12" r="4.1" /><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);
export const TelegramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21.9 4.2 18.6 19.7c-.25 1.1-.9 1.4-1.8.87l-5-3.7-2.4 2.3c-.27.27-.5.5-1 .5l.36-5.1 9.3-8.4c.4-.36-.09-.56-.62-.2L6.9 12.9l-4.95-1.55c-1.07-.33-1.1-1.07.22-1.6L20.5 2.6c.9-.33 1.7.2 1.4 1.6Z" />
  </svg>
);

const ext = { target: '_blank', rel: 'noopener noreferrer' };

// Instagram DM + Telegram tugmalari. variant="icons" — sarlavha/footer uchun ixcham ikonkalar.
export default function ContactButtons({ template, variant = 'full', className = '' }) {
  const [ok, setOk] = useState(false);
  const { instagram: ig, telegram: tg } = CONTACTS;
  if (variant === 'icons') {
    return <div className={`flex items-center gap-2 ${className}`}>
      <a {...ext} href={ig.url} aria-label={`Instagram: @${ig.user}`} className="icon-btn ig"><InstagramIcon /></a>
      <a {...ext} href={tg.url} aria-label={`Telegram: @${tg.user}`} className="icon-btn tg"><TelegramIcon /></a>
    </div>;
  }
  const text = template ? `Salom! Men "${template.name}" shablonini tanladim.` : '';
  const copy = async () => { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); } catch { /* clipboard mavjud emas */ } };
  return <div className={`flex flex-wrap gap-3 justify-center ${className}`}>
    <a {...ext} href={ig.url} className="btn btn-ig"><InstagramIcon />Instagram <span className="opacity-80 font-semibold">@{ig.user}</span></a>
    <a {...ext} href={tg.url} className="btn btn-tg"><TelegramIcon />Telegram <span className="opacity-80 font-semibold">@{tg.user}</span></a>
    {template && <button type="button" onClick={copy} className="btn btn-g w-full sm:w-auto">{ok ? <Check size={18} /> : <Copy size={18} />}{ok ? 'Nusxalandi' : 'Xabarni nusxalash'}</button>}
  </div>;
}
