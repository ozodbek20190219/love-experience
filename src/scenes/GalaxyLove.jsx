// Galaxy Love: spiral galaktika (zarrachalar), yurak shaklidagi yulduz turkumi, bir-biriga intilayotgan ikki orbita va uchar yulduz.
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Rig, Lift, useBurst, rng, damp, glowTexture } from './util.jsx';

const addMat = (extra = {}) => ({ map: glowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, ...extra });

function Galaxy({ n, burst }) {
  const ref = useRef();
  const { pos, col } = useMemo(() => {
    const r = rng(42), pos = new Float32Array(n * 3), col = new Float32Array(n * 3), R = 7.5;
    const c0 = new THREE.Color('#ffb0e0'), c1 = new THREE.Color('#b388ff'), c2 = new THREE.Color('#5c8bff'), c = new THREE.Color();
    const g = () => (r() + r() + r() - 1.5) / 1.5;
    for (let i = 0; i < n; i++) {
      const rad = Math.pow(r(), 1.5) * R, a = (i % 3) / 3 * Math.PI * 2 + rad * .85, spread = .15 + rad * .1;
      pos.set([Math.cos(a) * rad + g() * spread, g() * .3 * (1 - rad / R), Math.sin(a) * rad + g() * spread], i * 3);
      const f = rad / R; (f < .5 ? c.copy(c0).lerp(c1, f * 2) : c.copy(c1).lerp(c2, (f - .5) * 2)).multiplyScalar(.55 + r() * .6); col.set([c.r, c.g, c.b], i * 3);
    }
    return { pos, col };
  }, [n]);
  useFrame((_, d) => { ref.current.rotation.y += d * (.05 + burst.current * .6); });
  return <group rotation={[1.05, 0, .18]} position={[0, -.4, -3.5]}><points ref={ref}>
    <bufferGeometry><bufferAttribute attach="attributes-position" array={pos} count={n} itemSize={3} /><bufferAttribute attach="attributes-color" array={col} count={n} itemSize={3} /></bufferGeometry>
    <pointsMaterial size={.11} vertexColors {...addMat()} /></points></group>;
}

function Stars({ n }) {
  const ref = useRef();
  const pos = useMemo(() => { const r = rng(8), a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const u = r() * 2 - 1, th = r() * 6.283, s = Math.sqrt(1 - u * u), rad = 24 + r() * 16; a.set([s * Math.cos(th) * rad, u * rad, s * Math.sin(th) * rad], i * 3); } return a; }, [n]);
  useFrame((_, d) => { ref.current.rotation.y += d * .008; });
  return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" array={pos} count={n} itemSize={3} /></bufferGeometry><pointsMaterial size={.5} color="#dfe6ff" {...addMat({ opacity: .8 })} /></points>;
}

function HeartConstellation({ burst }) {
  const g = useRef();
  const pos = useMemo(() => { const N = 84, a = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const t = (i / N) * Math.PI * 2; a.set([.13 * 16 * Math.pow(Math.sin(t), 3), .13 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) + .3, 0], i * 3); } return a; }, []);
  useFrame(({ clock }, d) => { const t = clock.elapsedTime; g.current.scale.setScalar(1 + Math.sin(t * 2) * .025 + burst.current * .3); g.current.rotation.y = damp(g.current.rotation.y, Math.sin(t * .4) * .35, 2, d); });
  return <group ref={g} position={[0, 0, 1.2]}>
    <lineLoop><bufferGeometry><bufferAttribute attach="attributes-position" array={pos} count={pos.length / 3} itemSize={3} /></bufferGeometry><lineBasicMaterial color="#ff8ad8" transparent opacity={.45} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} /></lineLoop>
    <points><bufferGeometry><bufferAttribute attach="attributes-position" array={pos} count={pos.length / 3} itemSize={3} /></bufferGeometry><pointsMaterial size={.3} color="#ffd6f2" {...addMat()} /></points>
  </group>;
}

function Orbiters({ progress, burst }) {
  const a = useRef(), b = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime, rad = Math.max(.9, 3.1 - (progress ?? .3) * 1.7 - burst.current * .7);
    [[a, 0], [b, Math.PI]].forEach(([r, off]) => { const ang = t * .75 + off; r.current.position.set(Math.cos(ang) * rad, Math.sin(ang * 1.3) * .5 + .2, Math.sin(ang) * rad * .45 + 1.2); });
  });
  const orb = (ref, color) => <group ref={ref}><mesh><sphereGeometry args={[.1, 14, 10]} /><meshBasicMaterial color="#ffffff" fog={false} /></mesh>
    <sprite scale={[1.1, 1.1, 1]}><spriteMaterial {...addMat({ color })} /></sprite></group>;
  return <>{orb(a, '#ff5fc8')}{orb(b, '#5cc8ff')}</>;
}

function Shooter() {
  const ref = useRef();
  useFrame(({ clock }) => { const p = (clock.elapsedTime % 6) / 1.3; const m = ref.current; m.visible = p < 1; if (p < 1) m.position.set(-9 + p * 18, 5.5 - p * 6.5, -4); });
  return <mesh ref={ref} rotation={[0, 0, Math.atan2(-6.5, 18)]} visible={false}><planeGeometry args={[1.6, .035]} /><meshBasicMaterial color="#ffffff" transparent opacity={.9} blending={THREE.AdditiveBlending} fog={false} /></mesh>;
}

export default function GalaxyLove({ celebrate, progress, lite }) {
  const burst = useBurst(celebrate);
  return <>
    <Rig base={[0, 0, 9]} amp={.8} />
    <Stars n={lite ? 500 : 1500} />
    <Shooter />
    <Lift phone={1.3} wide={.35}>
      <Galaxy n={lite ? 2800 : 7000} burst={burst} />
      <HeartConstellation burst={burst} />
      <Orbiters progress={progress} burst={burst} />
    </Lift>
  </>;
}
