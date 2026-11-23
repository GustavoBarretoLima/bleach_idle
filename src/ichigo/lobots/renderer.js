import {selectShikaiPose} from '../v2/pose.js';

const sheet = new Image();
sheet.src = new URL('./shikai.png', import.meta.url).href;
const columns = {down:0, left:1, up:2, right:3};
const bearings = {down:Math.PI/2, left:Math.PI, up:-Math.PI/2, right:0};

export function drawLobotsShikai(ctx, actor, clock, fightAt, reducedMotion=false, texture=sheet) {
  if (!texture.complete || !texture.naturalWidth) return false;
  const pose = selectShikaiPose(actor, clock, fightAt, reducedMotion);
  const bearing = bearings[pose.direction];
  const combat = ['attack','guard','block','parry','release'].includes(pose.action);
  // The middle row is the resting stance. Alternate both steps through it;
  // direction columns are authored separately and never mirrored.
  const steps = [1,0,1,2];
  const phase = Math.floor(Math.max(0,actor.gaitTime ?? 0)/(actor.running ? .095 : .14)) % 4;
  let row = !reducedMotion && actor.moving && !combat ? steps[phase] : 1;
  if (pose.action==='attack' && !reducedMotion) row = pose.attackAge < .15 ? 0 : pose.attackAge < .21 ? 2 : 1;
  const reach = pose.action==='attack' && !reducedMotion ? Math.sin(Math.min(1,pose.attackAge/.42)*Math.PI)*3 : 0;
  ctx.save();
  ctx.imageSmoothingEnabled=false;
  ctx.translate(Math.round(Math.cos(bearing)*reach),Math.round(Math.sin(bearing)*reach));
  // Uniform scale, full frame, shared foot anchor: the baked-in blade and hilt
  // remain a single rigid image, including during attack and defense.
  ctx.drawImage(texture,columns[pose.direction]*32,row*32,32,32,-20,-38.75,40,40);
  if (pose.action==='attack' && pose.attackAge>=.08 && pose.attackAge<.21 && !reducedMotion) {
    ctx.globalAlpha=(1-(pose.attackAge-.08)/.13)*.7;
    ctx.strokeStyle='#edf6ff';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(0,-15,22,bearing-.55,bearing+.55);ctx.stroke();
  }
  if (['guard','block','parry'].includes(pose.action)) {
    ctx.globalAlpha=pose.action==='parry' ? .95 : .7;
    ctx.strokeStyle=pose.action==='parry' ? '#b6fff1' : '#e6d29b';
    ctx.lineWidth=pose.action==='parry' ? 2 : 1.5;
    ctx.beginPath();ctx.arc(0,-15,23,bearing-.65,bearing+.65);ctx.stroke();
    if (pose.action==='parry') {
      const x=Math.cos(bearing)*22,y=-15+Math.sin(bearing)*22;
      for(let i=0;i<6;i++) {
        const angle=i*Math.PI/3;
        ctx.beginPath();ctx.moveTo(x+Math.cos(angle)*3,y+Math.sin(angle)*3);
        ctx.lineTo(x+Math.cos(angle)*7,y+Math.sin(angle)*7);ctx.stroke();
      }
    }
  }
  ctx.restore();
  return true;
}
