// Vintage Romance: mum muhrli 3D konvert. Muhr sinadi, qopqoq ochiladi, xat sekin ko'tariladi. Sham yorug'ligi va chang zarralari.
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Rig, Lift, useBurst, rng, damp, heartShape, glowTexture } from './util.jsx';

const W = 3.4, H = 2.2;

function letterTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 340; const x = c.getContext('2d');
  x.fillStyle = '#f8efd6'; x.fillRect(0, 0, 512, 340);
  x.strokeStyle = 'rgba(120,80,40,.28)'; x.lineWidth = 1.5; for (let y = 96; y < 320; y += 34) { x.beginPath(); x.moveTo(40, y); x.lineTo(472, y); x.stroke(); }
  x.fillStyle = '#6b1e2a'; x.textAlign = 'center'; x.font = 'italic 36px Georgia, serif'; x.fillText('Sevgi xati', 256, 62); x.font = '30px serif'; x.fillText('♥', 256, 304);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
const tri = pts => { const s = new THREE.Shape(); s.moveTo(...pts[0]); s.lineTo(...pts[1]); s.lineTo(...pts[2]); s.closePath(); return new THREE.ShapeGeometry(s); };
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function Envelope({ progress, burst }) {
  const grp = useRef(), flap = useRef(), letter = useRef(), seal = useRef();
  const st = useRef({ f: 0, l: 0 });
  const tex = useMemo(letterTexture, []);
  const geo = useMemo(() => ({
    flap: tri([[-W / 2, 0], [W / 2, 0], [0, -H * .58]]),
    left: tri([[-W / 2, H / 2], [-W / 2, -H / 2], [0, -.05]]), right: tri([[W / 2, H / 2], [W / 2, -H / 2], [0, -.05]]),
    bottom: tri([[-W / 2, -H / 2], [W / 2, -H / 2], [0, -.05]]),
    heart: new THREE.ExtrudeGeometry(heartShape(), { depth: .12, bevelEnabled: false }),
  }), []);
  useFrame(({ clock }, d) => {
    const t = clock.elapsedTime, c = t % 12;
    const fT = progress == null ? (c > 1.5 && c < 10.5 ? 1 : 0) : (progress > .1 ? 1 : 0);
    const lT = progress == null ? (c > 3.5 && c < 9 ? 1 : 0) : (progress > .3 ? 1 : 0);
    st.current.f = damp(st.current.f, fT, 2.2, d); st.current.l = damp(st.current.l, lT, 1.5, d);
    flap.current.rotation.x = st.current.f * Math.PI * .93;
    const lt = st.current.l; letter.current.position.set(0, lt * 1.25, .04 + ss(.45, .95, lt) * .4); letter.current.scale.setScalar(1 + lt * .1); letter.current.rotation.x = -lt * .06;
    grp.current.position.y = Math.sin(t * .9) * .06; grp.current.rotation.z = -.05 + Math.sin(t * .5) * .015; grp.current.scale.setScalar(1 + burst.current * .08);
    seal.current.emissiveIntensity = .25 + burst.current * 1.6;
  });
  const paper = c => <meshStandardMaterial color={c} roughness={.85} side={THREE.DoubleSide} />;
  return <group ref={grp} scale={1}>
    <mesh><boxGeometry args={[W, H, .05]} />{paper('#cfb27a')}</mesh>
    <mesh ref={letter} position={[0, 0, .04]}><planeGeometry args={[3, 2]} /><meshStandardMaterial map={tex} roughness={.9} side={THREE.DoubleSide} /></mesh>
    <mesh geometry={geo.left} position={[0, 0, .06]}>{paper('#e0c996')}</mesh>
    <mesh geometry={geo.right} position={[0, 0, .06]}>{paper('#e0c996')}</mesh>
    <mesh geometry={geo.bottom} position={[0, 0, .065]}>{paper('#eddab0')}</mesh>
    <group ref={flap} position={[0, H / 2, .08]}>
      <mesh geometry={geo.flap}>{paper('#e8d3a2')}</mesh>
      <group position={[0, -H * .58 + .3, .035]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.28, .3, .07, 28]} /><meshStandardMaterial ref={seal} color="#8a1520" roughness={.3} emissive="#ff3a4a" emissiveIntensity={.25} /></mesh>
        <mesh geometry={geo.heart} position={[0, -.02, .02]} scale={.1}><meshStandardMaterial color="#a3202e" roughness={.35} /></mesh>
      </group>
    </group>
  </group>;
}

function Dust({ n }) {
  const ref = useRef();
  const pos = useMemo(() => { const r = rng(4), a = new Float32Array(n * 3); for (let i = 0; i < n; i++) a.set([(r() - .5) * 9, (r() - .5) * 6, (r() - .5) * 5], i * 3); return a; }, [n]);
  useFrame(({ clock }, d) => { const a = ref.current.geometry.attributes.position, t = clock.elapsedTime; for (let i = 0; i < n; i++) { let y = a.getY(i) + d * .08; if (y > 3.2) y = -3.2; a.setY(i, y); a.setX(i, a.getX(i) + Math.sin(t * .4 + i) * d * .05); } a.needsUpdate = true; });
  return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" array={pos} count={n} itemSize={3} /></bufferGeometry>
    <pointsMaterial size={.09} map={glowTexture()} color="#ffd98a" transparent opacity={.7} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} /></points>;
}

export default function VintageLetter({ celebrate, progress, lite }) {
  const burst = useBurst(celebrate), lamp = useRef();
  useFrame(({ clock }) => { if (lamp.current) lamp.current.intensity = 34 + Math.sin(clock.elapsedTime * 7) * 2.5 + Math.sin(clock.elapsedTime * 13) * 1.5 + burst.current * 30; });
  return <>
    <Rig base={[0, 0, 7.5]} amp={.5} />
    <ambientLight intensity={.9} color="#ffe9c4" />
    <pointLight ref={lamp} position={[-2.5, 2.5, 3.5]} intensity={34} color="#ffb454" />
    <pointLight position={[3, -1, 3]} intensity={10} color="#ff9a6a" />
    <sprite position={[0, .4, -2]} scale={[10, 10, 1]}><spriteMaterial map={glowTexture()} color="#ffd48a" transparent opacity={.55} depthWrite={false} fog={false} /></sprite>
    <Lift phone={1.2} wide={.25}><Envelope progress={progress} burst={burst} /></Lift>
    <Dust n={lite ? 35 : 80} />
  </>;
}
