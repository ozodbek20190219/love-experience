import { Link } from 'react-router-dom';
export default function TemplateCard({ t }) {
  return <article className="tpl-card rounded-2xl overflow-hidden border border-white/10 bg-panel flex flex-col">
    <div className="h-40 grid place-items-center text-6xl overflow-hidden" style={{ background: t.t.bg }} role="img" aria-label={t.name}><span className="tpl-glyph drop-shadow-lg">{t.t.glyph}</span></div>
    <div className="p-5 flex-1 flex flex-col"><p className="text-xs text-rose uppercase tracking-widest">{t.tag}</p><h3 className="font-display text-xl mt-1">{t.name}</h3><p className="text-mute text-sm mt-2">{t.desc}</p>
      <Link className="btn btn-p mt-auto !py-2 w-full" style={{ marginTop: '1.25rem' }} to={`/demo/${t.id}`}>Jonli demo</Link></div></article>;
}
