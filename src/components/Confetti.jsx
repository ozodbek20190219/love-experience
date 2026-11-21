import {useEffect,useRef} from 'react';
export default function Confetti({fire}){const c=useRef();useEffect(()=>{if(!fire||matchMedia('(prefers-reduced-motion:reduce)').matches)return;const cv=c.current,x=cv.getContext('2d');cv.width=innerWidth;cv.height=innerHeight;
const P=Array.from({length:70},()=>({x:innerWidth/2,y:innerHeight*.6,vx:(Math.random()-.5)*12,vy:-Math.random()*14-4,s:12+Math.random()*16,h:Math.random()<.6,c:`hsl(${330+Math.random()*60},90%,65%)`,l:1}));let id;
const f=()=>{x.clearRect(0,0,cv.width,cv.height);let a=0;P.forEach(p=>{p.vy+=.3;p.x+=p.vx;p.y+=p.vy;p.l-=.008;if(p.l>0){a=1;x.globalAlpha=p.l;x.fillStyle=p.c;x.font=p.s+'px serif';x.fillText(p.h?'❤':'●',p.x,p.y)}});if(a)id=requestAnimationFrame(f);else x.clearRect(0,0,cv.width,cv.height)};f();return()=>cancelAnimationFrame(id)},[fire]);
return <canvas ref={c} aria-hidden="true" className="fixed inset-0 pointer-events-none z-50"/>}
