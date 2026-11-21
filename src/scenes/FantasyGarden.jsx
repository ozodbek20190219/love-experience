// Fantasy World: tungi sehrli bog' — yonib turgan 3D gullar, o't pashshalari, oy va havoda suzuvchi billur yurak.
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Rig, Lift, useBurst, rng, damp, heartShape, glowTexture } from './util.jsx';

const COLORS = ['#ff6fb5', '#5cf2ff', '#b388ff', '#ffd166', '#7dffb3'];
const glowMat = (color, opacity) => <spriteMaterial map={glowTexture()} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />;

function Flower({ x, z, h, bend, color, ph, progress, burst }) {
  const sway = useRef(), bloom = useRef();
  const stem = useMemo(() => new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(bend * .5, h * .55, 0), new THREE.Vector3(bend, h, 0)), 12, .035, 5), [h, bend]);
  useFrame(({ clock }, d) => {
    const t = clock.elapsedTime, open = Math.min(1, .3 + (progress ?? .5) * .7 + burst.current * .3);
    sway.current.rotation.z = Math.sin(t * .8 + ph) * .05;
    bloom.current.scale.setScalar(damp(bloom.current.scale.x, (.75 + open * .5) * (1 + Math.sin(t * 1.5 + ph) * .05) * (1 + burst.current * .35), 4, d));
  });
  return <group position={[x, -2, z]}><group ref={sway}>
    <mesh geometry={stem}><meshStandardMaterial color="#1c6b4a" roughness={.7} emissive="#0a3b28" emissiveIntensity={.5} /></mesh>
    <group ref={bloom} position={[bend, h, 0]} rotation={[-.35, 0, 0]}>
      {Array.from({ length: 6 }, (_, k) => <group key={k} rotation={[0, 0, (k / 6) * Math.PI * 2]}>
        <mesh position={[0, .3, .04]} rotation={[.5, 0, 0]} scale={[.26, .62, .08]}><sphereGeometry args={[.5, 10, 8]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.9} roughness={.4} /></mesh>
      </group>)}
      <mesh position={[0, 0, .08]}><sphereGeometry args={[.13, 12, 10]} /><meshBasicMaterial color="#fff6c8" /></mesh>
      <sprite scale={[1.9, 1.9, 1]}>{glowMat(color, .5)}</sprite>
    </group>
  </group></group>;
}

function Flowers({ n, progress, burst }) {
  const list = useMemo(() => { const r = rng(17); return Array.from({ length: n }, (_, i) => { const u = n === 1 ? 0 : i / (n - 1) * 2 - 1; return { x: u * 3.6 + (r() - .5) * .4, z: -.8 - Math.abs(u) * .8 - r() * 1.4, h: 1.5 + r() * 1.5, bend: (r() - .5) * .8, color: COLORS[i % COLORS.length], ph: r() * 6.28 }; }); }, [n]);
  return <>{list.map((f, i) => <Flower key={i} {...f} progress={progress} burst={burst} />)}</>;
}

function Fireflies({ n }) {
  const ref = useRef();
  const base = useMemo(() => { const r = rng(2); return Array.from({ length: n }, () => ({ x: (r() - .5) * 9, y: -1.8 + r() * 4.5, z: (r() - .5) * 5 - 1, s: .3 + r() * .6, ph: r() * 6.28 })); }, [n]);
  const pos = useMemo(() => new Float32Array(n * 3), [n]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime, a = ref.current.geometry.attributes.position;
    base.forEach((b, i) => a.setXYZ(i, b.x + Math.sin(t * b.s + b.ph) * .9, b.y + Math.sin(t * b.s * 1.3 + b.ph) * .5, b.z + Math.cos(t * b.s + b.ph) * .9));
    a.needsUpdate = true;
  });
  return <points ref={ref} frustumCulled={false}><bufferGeometry><bufferAttribute attach="attributes-position" array={pos} count={n} itemSize={3} /></bufferGeometry>
    <pointsMaterial size={.2} map={glowTexture()} color="#d8ff7a" transparent depthWrite={false} blending={THREE.AdditiveBlending} fog={false} /></points>;
}

function CrystalHeart({ burst }) {
  const g = useRef(), light = useRef();
  const geo = useMemo(() => new THREE.ExtrudeGeometry(heartShape(), { depth: .4, bevelEnabled: true, bevelSize: .12, bevelThickness: .12, bevelSegments: 3, curveSegments: 16 }), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime, b = burst.current;
    g.current.position.y = 1.9 + Math.sin(t * .9) * .18; g.current.rotation.y = t * .5; g.current.scale.setScalar(.5 + b * .2 + Math.sin(t * 2) * .015);
    light.current.intensity = 26 + b * 50;
  });
  return <group ref={g} position={[0, 1.9, -.4]}>
    <mesh geometry={geo} position={[0, 0, -.2]}><meshStandardMaterial color="#ff9ad5" emissive="#ff4fb0" emissiveIntensity={.7} roughness={.15} metalness={.1} transparent opacity={.9} /></mesh>
    <sprite scale={[5, 5, 1]}>{glowMat('#ff6fc8', .55)}</sprite>
    <pointLight ref={light} intensity={26} color="#ff7ad0" distance={14} />
  </group>;
}

export default function FantasyGarden({ celebrate, progress, lite }) {
  const burst = useBurst(celebrate);
  return <>
    <Rig base={[0, 1, 8]} amp={.6} look={[0, .3, 0]} />
    <ambientLight intensity={.45} color="#5fd4b0" />
    <directionalLight position={[-3, 5, 3]} intensity={1.1} color="#bfe8ff" />
    <mesh position={[-4.5, 4.2, -9]}><sphereGeometry args={[1.1, 24, 18]} /><meshBasicMaterial color="#e8fff6" fog={false} /></mesh>
    <sprite position={[-4.5, 4.2, -9]} scale={[10, 10, 1]}>{glowMat('#bfffe6', .45)}</sprite>
    <Lift phone={1.0} wide={.1}>
      <mesh position={[0, -2, -2]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[13, 40]} /><meshStandardMaterial color="#0b3b3a" roughness={1} /></mesh>
      <Flowers n={lite ? 5 : 8} progress={progress} burst={burst} />
      <Fireflies n={lite ? 45 : 110} />
      <CrystalHeart burst={burst} />
    </Lift>
  </>;
}
