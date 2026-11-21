import { Component, Suspense, lazy, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { TEMPLATES } from '../config/site.js';
import { webglOK, prefersReduced, isLite, LiftCtx } from './util.jsx';

const SCENES = {
  'dark-romance': lazy(() => import('./DarkRose.jsx')),
  'soft-love': lazy(() => import('./SoftSakura.jsx')),
  'galaxy-love': lazy(() => import('./GalaxyLove.jsx')),
  'vintage-romance': lazy(() => import('./VintageLetter.jsx')),
  'fantasy-world': lazy(() => import('./FantasyGarden.jsx')),
};
// fog: [rang, yaqin, uzoq]
const CFG = {
  'dark-romance': { cam: [0, 0, 7], fov: 48, fog: ['#12040a', 7, 20] },
  'soft-love': { cam: [0, 0, 8], fov: 50, fog: ['#ffd9e6', 9, 24] },
  'galaxy-love': { cam: [0, 0, 9], fov: 55, fog: ['#07061a', 14, 40] },
  'vintage-romance': { cam: [0, 0, 7.5], fov: 45, fog: ['#c9a66e', 9, 22] },
  'fantasy-world': { cam: [0, 1, 8], fov: 50, fog: ['#071a22', 8, 22] },
};

function Fallback({ id }) {
  const t = TEMPLATES.find(x => x.id === id);
  return <div className="absolute inset-0 grid place-items-center text-[8rem] select-none" style={{ paddingBottom: '35vh' }} role="img" aria-label={t?.name}>{t?.t.glyph}</div>;
}

// 3D sahnada xato bo'lsa, butun sayt qulamasin: emoji zaxira ko'rinishi chiqadi.
class Boundary extends Component {
  state = { bad: false };
  static getDerivedStateFromError() { return { bad: true }; }
  componentDidCatch(e) { console.error('3D sahna xatosi:', e); }
  render() { return this.state.bad ? <Fallback id={this.props.id} /> : this.props.children; }
}

export default function SceneCanvas({ id, celebrate = 0, progress, preview = false }) {
  const [lost, setLost] = useState(false);
  const ok = useMemo(() => webglOK() && !prefersReduced(), []);
  const lite = useMemo(isLite, []);
  const Scene = SCENES[id]; const cfg = CFG[id];
  if (!ok || lost || !Scene) return <Fallback id={id} />;
  return <Boundary id={id}><Canvas key={id} className="!absolute inset-0" dpr={[1, lite ? 1.25 : 2]} gl={{ antialias: !lite, alpha: true, powerPreference: 'high-performance' }}
    camera={{ position: cfg.cam, fov: cfg.fov }}
    onCreated={({ scene, gl }) => { scene.fog = new THREE.Fog(cfg.fog[0], cfg.fog[1], cfg.fog[2]); gl.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); setLost(true); }); }}>
    <Suspense fallback={null}><LiftCtx.Provider value={preview ? .1 : 1}><Scene celebrate={celebrate} progress={progress} lite={lite} /></LiftCtx.Provider></Suspense>
  </Canvas></Boundary>;
}
