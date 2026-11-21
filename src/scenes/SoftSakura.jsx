// Soft Love: yorug' osmon, aylanuvchi 3D sakura guli, shamolda uchayotgan gulbarglar va bokeh nurlar.
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Rig, Lift, useBurst, rng, damp, dummy, glowTexture } from './util.jsx';

// Silliq egilgan gulbarg (plane'dan yasaladi) + uchidan tubigacha rang gradienti.
function makePetal() {
  const g = new THREE.PlaneGeometry(1, 1, 8, 8), p = g.attributes.position, col = [];
  const base = new THREE.Color('#ff86ad'), tip = new THREE.Color('#ffeaf1'), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const v = p.getY(i) + .5, w = Math.pow(Math.sin(Math.PI * Math.pow(v, .75)), .8) * .55 + .02, x = p.getX(i) * 2 * w;
    p.setXYZ(i, x, v, x * x * .9 + v * v * .25); c.copy(base).lerp(tip, v); col.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
}

function Blossom({ progress, burst }) {
  const g = useRef(), petals = useRef([]);
  const geo = useMemo(makePetal, []);
  const stamens = useMemo(() => { const r = rng(5); return Array.from({ length: 16 }, (_, i) => ({ a: (i / 16) * 6.28 + r() * .3, h: .28 + r() * .22 })); }, []);
  useFrame(({ clock, pointer }, d) => {
    const t = clock.elapsedTime, open = Math.min(1, .4 + (progress ?? .5) * .6 + burst.current * .25);
    g.current.rotation.z += d * .08;
    g.current.rotation.x = damp(g.current.rotation.x, -pointer.y * .45 - .25, 2, d);
    g.current.rotation.y = damp(g.current.rotation.y, pointer.x * .5 + Math.sin(t * .4) * .12, 2, d);
    g.current.scale.setScalar(1.7 + burst.current * .25 + Math.sin(t * 1.2) * .02);
    petals.current.forEach(p => { if (p) p.rotation.x = damp(p.rotation.x, (1 - open) * 1.0, 3, d); });
  });
  return <group ref={g}>
    {Array.from({ length: 5 }, (_, k) => <group key={k} rotation={[0, 0, (k / 5) * Math.PI * 2]}>
      <mesh ref={el => (petals.current[k] = el)} geometry={geo} scale={[1, 1.5, 1]}><meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={.6} emissive="#ff9db9" emissiveIntensity={.12} /></mesh>
    </group>)}
    <mesh><sphereGeometry args={[.13, 16, 12]} /><meshStandardMaterial color="#ff6f9c" roughness={.5} /></mesh>
    {stamens.map((s, i) => <group key={i} rotation={[0, 0, s.a]}>
      <mesh position={[0, s.h / 2, .08]} rotation={[.35, 0, 0]}><cylinderGeometry args={[.006, .006, s.h, 5]} /><meshBasicMaterial color="#ff9db9" /></mesh>
      <mesh position={[0, s.h, .08 + s.h * .35]}><sphereGeometry args={[.028, 8, 6]} /><meshBasicMaterial color="#ffd54a" /></mesh>
    </group>)}
  </group>;
}

function Storm({ n, burst }) {
  const ref = useRef(), geo = useMemo(makePetal, []);
  const P = useMemo(() => { const r = rng(3); return Array.from({ length: n }, () => ({ x: (r() - .5) * 18, y: (r() - .5) * 12, z: (r() - .5) * 9 - 1, v: .35 + r() * .5, ph: r() * 6.28, sp: .5 + r() * 1.5, s: .16 + r() * .2 })); }, [n]);
  useEffect(() => { const r = rng(9), c = new THREE.Color(); P.forEach((_, i) => { c.setHSL(.93 + r() * .05, .8, .8 + r() * .18); ref.current.setColorAt(i, c); }); ref.current.instanceColor.needsUpdate = true; }, [P]);
  useFrame(({ clock }, d) => {
    const t = clock.elapsedTime, k = 1 + burst.current * 3;
    P.forEach((p, i) => {
      p.y -= p.v * d * k; p.x += (.35 + Math.sin(t * .3 + p.ph) * .15) * d * k;
      if (p.y < -6) p.y = 6; if (p.x > 9) p.x = -9;
      dummy.position.set(p.x, p.y + Math.sin(t * .9 + p.ph) * .2, p.z);
      dummy.rotation.set(t * p.sp + p.ph, t * p.sp * .6, t * p.sp * .8); dummy.scale.setScalar(p.s); dummy.updateMatrix(); ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, undefined, n]} frustumCulled={false}><meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={.7} /></instancedMesh>;
}

function Bokeh({ n }) {
  const refs = useRef([]), tex = useMemo(glowTexture, []);
  const B = useMemo(() => { const r = rng(21); return Array.from({ length: n }, () => ({ x: (r() - .5) * 16, y: (r() - .5) * 9, z: -4 - r() * 6, s: 1.2 + r() * 2.2, ph: r() * 6.28, o: .25 + r() * .3 })); }, [n]);
  useFrame(({ clock }) => { const t = clock.elapsedTime; refs.current.forEach((s, i) => { if (s) s.position.y = B[i].y + Math.sin(t * .3 + B[i].ph) * .4; }); });
  return <>{B.map((b, i) => <sprite key={i} ref={el => (refs.current[i] = el)} position={[b.x, b.y, b.z]} scale={[b.s, b.s, 1]}><spriteMaterial map={tex} color={i % 2 ? '#ffc2d6' : '#ffffff'} transparent opacity={b.o} depthWrite={false} fog={false} /></sprite>)}</>;
}

export default function SoftSakura({ celebrate, progress, lite }) {
  const burst = useBurst(celebrate);
  return <>
    <Rig base={[0, 0, 8]} amp={.5} />
    <ambientLight intensity={1.5} color="#fff0f5" />
    <directionalLight position={[3, 5, 5]} intensity={2.2} color="#fff4e8" />
    <directionalLight position={[-4, -2, 3]} intensity={.8} color="#ffb3cc" />
    <sprite position={[4, 3.5, -7]} scale={[12, 12, 1]}><spriteMaterial map={glowTexture()} color="#ffffff" transparent opacity={.85} depthWrite={false} fog={false} /></sprite>
    <Bokeh n={lite ? 6 : 12} />
    <Lift phone={1.2} wide={.2}><Blossom progress={progress} burst={burst} /></Lift>
    <Storm n={lite ? 55 : 140} burst={burst} />
  </>;
}
