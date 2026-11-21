import * as THREE from 'three';
import { createContext, useContext, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

export const webglOK = () => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } };
export const prefersReduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
// Telefon yoki kuchsiz qurilma: zarrachalar kam, antialias o'chiq, dpr past.
export const isLite = () => { const n = navigator; return /Android|iPhone|iPad|Mobile/i.test(n.userAgent) || (n.hardwareConcurrency || 8) <= 4 || (n.deviceMemory || 8) <= 4; };

export function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export const damp = (a, b, k, d) => a + (b - a) * (1 - Math.exp(-k * d));

export function heartShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -1.1); s.bezierCurveTo(-2.2, .3, -1.2, 1.6, 0, .7); s.bezierCurveTo(1.2, 1.6, 2.2, .3, 0, -1.1);
  return s;
}

let glow;
export function glowTexture() {
  if (glow) return glow;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  glow = new THREE.CanvasTexture(c); return glow;
}

// celebrate hisoblagichi oshganda 1 ga sakraydi va sekin 0 ga tushadi.
export function useBurst(celebrate) {
  const b = useRef(0), prev = useRef(celebrate);
  useFrame((_, d) => { if (celebrate !== prev.current) { prev.current = celebrate; b.current = 1; } b.current = Math.max(0, b.current - d * .6); });
  return b;
}

// Kamera sichqoncha/barmoq bo'yicha yumshoq siljiydi (parallaks).
export function Rig({ base = [0, 0, 7], amp = .6, look = [0, 0, 0] }) {
  useFrame(({ camera, pointer }, d) => {
    camera.position.x = damp(camera.position.x, base[0] + pointer.x * amp, 2, d);
    camera.position.y = damp(camera.position.y, base[1] + pointer.y * amp * .6, 2, d);
    camera.position.z = damp(camera.position.z, base[2], 2, d);
    camera.lookAt(look[0], look[1], look[2]);
  });
  return null;
}

// Sahna mazmunini telefonda panel ustida, kompyuterda markazga yaqin ushlab turadi.
export const LiftCtx = createContext(1); // 1 = pastda panel bor (tajriba); kichikroq = oldindan ko'rish (panel yo'q)
export function Lift({ children, phone = 1.15, wide = .3 }) {
  const { size } = useThree(), k = useContext(LiftCtx);
  return <group position={[0, (size.width / size.height < 1 ? phone : wide) * k, 0]}>{children}</group>;
}

export const dummy = new THREE.Object3D();
