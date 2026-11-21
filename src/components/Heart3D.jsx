import {Canvas,useFrame} from '@react-three/fiber';import {useMemo,useRef} from 'react';import * as THREE from 'three';
function Heart(){const g=useRef();const geo=useMemo(()=>{const s=new THREE.Shape();s.moveTo(0,-1.1);s.bezierCurveTo(-2.2,.3,-1.2,1.6,0,.7);s.bezierCurveTo(1.2,1.6,2.2,.3,0,-1.1);
return new THREE.ExtrudeGeometry(s,{depth:.7,bevelEnabled:true,bevelSize:.25,bevelThickness:.25,bevelSegments:6,curveSegments:24})},[]);
useFrame(({pointer,clock})=>{const t=clock.elapsedTime;g.current.rotation.y+=((pointer.x*.6+Math.sin(t*.4)*.3)-g.current.rotation.y)*.05;g.current.rotation.x+=((-pointer.y*.3)-g.current.rotation.x)*.05;g.current.scale.setScalar(1+Math.sin(t*2)*.03)});
return <group ref={g} position={[0,-.2,0]}><mesh geometry={geo} position={[0,0,-.35]}><meshPhysicalMaterial color="#d6153f" roughness={.25} clearcoat={1} emissive="#4a0618"/></mesh></group>}
function Dust({n}){const r=useRef();const p=useMemo(()=>{const a=new Float32Array(n*3);for(let i=0;i<a.length;i++)a[i]=(Math.random()-.5)*10;return a},[n]);
useFrame((_,d)=>{r.current.rotation.y+=d*.03});return <points ref={r}><bufferGeometry><bufferAttribute attach="attributes-position" array={p} count={n} itemSize={3}/></bufferGeometry><pointsMaterial size={.04} color="#ff7aa8" transparent opacity={.8}/></points>}
const webgl=()=>{try{return !!document.createElement('canvas').getContext('webgl')}catch{return false}};
export default function Heart3D(){const low=navigator.hardwareConcurrency<=4;const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
if(!webgl()||reduce)return <div className="text-[9rem] text-center select-none" role="img" aria-label="Yurak">❤️</div>;
return <Canvas dpr={[1,low?1:1.5]} camera={{position:[0,0,5],fov:50}} aria-hidden="true"><ambientLight intensity={.6}/><pointLight position={[3,3,4]} intensity={60} color="#ff4d8d"/><pointLight position={[-4,-2,2]} intensity={40} color="#8b5cf6"/><Heart/><Dust n={low?120:300}/></Canvas>}
