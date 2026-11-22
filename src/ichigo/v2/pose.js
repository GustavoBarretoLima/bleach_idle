import {shikaiFrames} from './frames.js';
const facing={down:Math.PI/2,left:Math.PI,up:-Math.PI/2,right:0};
const idleAngles={down:.45,left:.45,up:2.7,right:2.7};
const guardAngles={down:-.75,left:-2.39,up:-2.39,right:-.75};
export const shikaiAttackDuration=.42;
const attackAngles={
  down:{windup:.7,contact:1.8,follow:2.0},
  left:{windup:4.05,contact:2.95,follow:2.65},
  up:{windup:3.8,contact:4.9,follow:5.2},
  right:{windup:-.9,contact:.2,follow:.5}
};
const mix=(a,b,t)=>a+(b-a)*t;
const ease=t=>t*t*(3-2*t);
export function shikaiAttackPose(direction,elapsed,reducedMotion=false){
  const angles=attackAngles[direction],idle=idleAngles[direction];
  if(reducedMotion)return {sheet:'body',frame:6,angle:angles.contact,attackPhase:'contact',behind:direction==='up'};
  if(elapsed<.07)return {sheet:'body',frame:5,angle:idle+shortestTurn(idle,angles.windup)*ease(elapsed/.07),attackPhase:'windup',behind:true};
  if(elapsed<.15)return {sheet:'body',frame:6,angle:mix(angles.windup,angles.contact,1-Math.pow(1-(elapsed-.07)/.08,3)),attackPhase:'contact',behind:direction==='up'};
  if(elapsed<.21)return {sheet:'body',frame:6,angle:mix(angles.contact,angles.follow,ease((elapsed-.15)/.06)),attackPhase:'follow',behind:direction==='up'};
  if(elapsed<.37)return {sheet:'body',frame:5,angle:angles.follow+shortestTurn(angles.follow,idle)*ease((elapsed-.21)/.16),attackPhase:'recover',behind:true};
  return {sheet:'body',frame:0,angle:idle,attackPhase:'settle',behind:true};
}
const cycle=(time,duration)=>(Math.max(0,time)%duration)/duration;

export function selectShikaiPose(actor,clock,fightAt,reducedMotion=false){
  const direction=Object.hasOwn(facing,actor.direction)?actor.direction:'down';
  const parryAge=clock-((actor.parryFlashUntil??-Infinity)-.35);
  const guarding=clock<(actor.defendingUntil??0);
  const guardAge=Math.max(0,clock-(actor.defenseStartedAt??((actor.defendingUntil??0)-.65)));
  const hitAge=clock-((actor.guardHitUntil??-Infinity)-.16);
  const releaseAge=clock-(actor.defenseReleasedAt??-Infinity);
  const attackAge=clock-fightAt;
  let sheet='body',frame=0,action='idle',angle=idleAngles[direction],attackPhase=null,attackBehind=null;
  if(parryAge>=0&&parryAge<.35){
    sheet='guard';action='parry';frame=reducedMotion||parryAge<.12?3:2;angle=guardAngles[direction]-(reducedMotion?0:Math.sin(parryAge/.35*Math.PI)*.09);
  }else if(hitAge>=0&&hitAge<.16){
    sheet='guard';action='block';frame=3;angle=guardAngles[direction];
  }else if(guarding){
    sheet='guard';action='guard';frame=reducedMotion?2:guardAge<.045?0:guardAge<.12?1:2;
    const progress=reducedMotion?1:Math.min(1,guardAge/.12);
    angle=idleAngles[direction]+shortestTurn(idleAngles[direction],guardAngles[direction])*progress;
  }else if(!reducedMotion&&((releaseAge>=0&&releaseAge<.1)||(parryAge>=.35&&parryAge<.45))){
    sheet='guard';action='release';frame=1;const progress=parryAge>=.35&&parryAge<.45?(parryAge-.35)/.1:releaseAge/.1;angle=guardAngles[direction]+shortestTurn(guardAngles[direction],idleAngles[direction])*progress;
  }else if(fightAt>0&&attackAge>=0&&attackAge<shikaiAttackDuration){
    action='attack';const attack=shikaiAttackPose(direction,attackAge,reducedMotion);
    sheet=attack.sheet;frame=attack.frame;angle=attack.angle;attackPhase=attack.attackPhase;attackBehind=attack.behind;
  }else if(actor.moving&&!reducedMotion){
    action=actor.running?'run':'walk';
    const step=cycle(actor.gaitTime,actor.running ? .38 : .56);
    frame=(actor.running?3:1)+(step<.5?0:1);
    angle=idleAngles[direction]+Math.sin(step*Math.PI*2)*.035;
  }
  return {sheet,frame,action,direction,angle,attackPhase,attackAge,behind:attackBehind??(direction==='up'||(sheet==='body'&&action!=='attack')||(sheet==='guard'&&frame===0)),parryAge};
}
export function shortestTurn(from,to){return Math.atan2(Math.sin(to-from),Math.cos(to-from));}
export function poseGeometry(pose){
  const strip=shikaiFrames[pose.sheet].directions[pose.direction],frame=strip.frames[pose.frame];
  const [x,y,w,h]=frame.rect,[fx,fy]=frame.foot;
  return {source:frame.rect,destination:[(x-fx)*strip.scale,(y-fy)*strip.scale,w*strip.scale,h*strip.scale],
    hand:[(frame.hand[0]-fx)*strip.scale,(frame.hand[1]-fy)*strip.scale],scale:strip.scale};
}
