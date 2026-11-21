// Dark Romance: qorong'u zalda 3D atirgul (qatlam-qatlam gulbarg), tushayotgan gulbarglar va cho'g' zarralari.
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Rig, Lift, useBurst, rng, damp, dummy, glowTexture } from './util.jsx';

// Sfera bo'lagi = egilgan gulbarg (tashqariga qavariq).
const petalGeo = (w, t0, tl) => new THREE.SphereGeometry(1, 20, 14, Math.PI / 2 - w / 2, w, Math.PI * t0, Math.PI * tl);
const RINGS = [
  { n: 3, r: .1, s: .5, tilt: .03, c: '#5e0a1d' }, { n: 4, r: .24, s: .62, tilt: .1, c: '#7d0c25' },
  { n: 5, r: .4, s: .78, tilt: .22, c: '#a10f2d' }, { n: 6, r: .58, s: .95, tilt: .38, c: '#c3123a' },
  { n: 7, r: .78, s: 1.1, tilt: .56, c: '#d6153f' }, { n: 8, r: .98, s: 1.25, tilt: .78, c: '#e8244d' },
];

function Rose({ progress, burst }) {
  const g = useRef(), rings = useRef([]);
  const geo = useMemo(() => petalGeo(1.5, .18, .62), []);
  const mats = useMemo(() => RINGS.map(r => new THREE.MeshStandardMaterial({ color: r.c, roughness: .5, side: THREE.DoubleSide, emissive: '#3a0412', emissiveIntensity: .55 })), []);
  useFrame(({ clock }, d) => {
    const t = clock.elapsedTime, b = burst.current;
    g.current.rotation.y = damp(g.current.rotation.y, t * .12 + (progress ?? 0) * 2.4, 1.5, d);
    g.current.position.y = Math.sin(t * .8) * .08;
    g.current.scale.setScalar(1.25 + b * .18);
    rings.current.forEach((r, i) => { if (r) { r.rotation.y = t * .03 * (i % 2 ? 1 : -1) * (i + 1); r.scale.setScalar(1 + b * .1 * (i + 1) / RINGS.length); } });
  });
  return <group ref={g}>
    {RINGS.map((r, i) => <group key={i} ref={el => (rings.current[i] = el)} position={[0, .15 - i * .045, 0]}>
      {Array.from({ length: r.n }, (_, k) => <group key={k} rotation={[0, (k / r.n) * Math.PI * 2 + i * .5, 0]}>
        <mesh geometry={geo} material={mats[i]} scale={r.s} position={[0, 0, r.r - r.s]} rotation={[r.tilt, 0, 0]} />
      </group>)}
    </group>)}
    <mesh position={[0, -1.9, 0]}><cylinderGeometry args={[.045, .06, 2.4, 8]} /><meshStandardMaterial color="#10301a" roughness={.7} /></mesh>
  </group>;
}

function Petals({ n }) {
  const ref = useRef();
  const geo = useMemo(() => petalGeo(1.2, .2, .55), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b3122f', roughness: .6, side: THREE.DoubleSide, emissive: '#2a030c' }), []);
  const P = useMemo(() => { const r = rng(7); return Array.from({ length: n }, () => ({ x: (r() - .5) * 11, y: r() * 11 - 5, z: (r() - .5) * 7 - 1, v: .25 + r() * .4, ph: r() * 6.28, sp: .4 + r() * 1.2, s: .1 + r() * .12 })); }, [n]);
  useFrame(({ clock }, d) => {
    const t = clock.elapsedTime;
    P.forEach((p, i) => {
      p.y -= p.v * d; if (p.y < -5) { p.y = 6; }
      dummy.position.set(p.x + Math.sin(t * .6 + p.ph) * .6, p.y, p.z);
      dummy.rotation.set(t * p.sp + p.ph, t * p.sp * .7, p.ph); dummy.scale.setScalar(p.s); dummy.updateMatrix(); ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, mat, n]} frustumCulled={false} />;
}

function Embers({ n }) {
  const ref = useRef();
  const pos = useMemo(() => { const r = rng(11), a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = (r() - .5) * 9; a[i * 3 + 1] = (r() - .5) * 9; a[i * 3 + 2] = (r() - .5) * 6; } return a; }, [n]);
  useFrame((_, d) => { const a = ref.current.geometry.attributes.position; for (let i = 0; i < n; i++) { let y = a.getY(i) + d * .25; if (y > 4.5) y = -4.5; a.setY(i, y); } a.needsUpdate = true; });
  return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" array={pos} count={n} itemSize={3} /></bufferGeometry>
    <pointsMaterial size={.12} map={glowTexture()} color="#ff7a45" transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={.8} /></points>;
}

export default function DarkRose({ celebrate, progress, lite }) {
  const burst = useBurst(celebrate);
  const key = useRef();
  useFrame(({ clock }) => { if (key.current) key.current.intensity = 55 + Math.sin(clock.elapsedTime * 3) * 6 + burst.current * 60; });
  return <>
    <Rig base={[0, 0, 7]} amp={.7} />
    <ambientLight intensity={.3} color="#ff9bb0" />
    <pointLight ref={key} position={[2.5, 3, 4]} intensity={55} color="#ff4d6d" />
    <pointLight position={[-3.5, 2, 3]} intensity={22} color="#ffd1a1" />
    <pointLight position={[0, -2, -3]} intensity={45} color="#8b0f2a" />
    <Lift phone={1.2} wide={.2}><Rose progress={progress} burst={burst} /></Lift>
    <Petals n={lite ? 28 : 70} />
    <Embers n={lite ? 40 : 90} />
  </>;
}
