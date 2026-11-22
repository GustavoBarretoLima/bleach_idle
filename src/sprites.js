import {drawImprovedShikai} from './ichigo/v2/renderer.js';
import atlasUrl from './gait-atlas.webp';
import frames from './gait-frames.json';
import {drawOriginalIchigoMovement} from './ichigo/movement.js';

// Frames authored for BleachSoulBreak-Godot, packed with their original foot anchors.
const atlas = new Image();
atlas.src = atlasUrl;
const cycle = 0.56;
const swingDuration = 0.24;

function drawBankaiBlade(ctx, frame, direction, action, phase) {
  const side = direction === 'left' || direction === 'down' ? -1 : 1;
  const axes = [[-side*.35,-.94],[side*.55,-.84],[side*.98,.20],[side*.2,-.98]];
  const [dx,dy] = action === 'attack' ? axes[phase] : action === 'run' ? [-side*.96,.28] : [side*.91,.41];
  const [gx,gy] = frame.slice(6);
  ctx.save();
  ctx.translate(gx,gy);
  ctx.rotate(Math.atan2(dy,dx));
  ctx.fillStyle='#1d1720';
  ctx.fillRect(-4,-1,26,2);
  ctx.fillStyle='#8e8795';
  ctx.fillRect(1,-1,19,1);
  ctx.fillStyle='#982f3e';
  ctx.fillRect(-4,0,3,1);
  ctx.fillStyle='#2b2332';
  ctx.fillRect(0,-3,2,6);
  ctx.restore();
}

export function drawHeroPose(ctx, actor, form, clock, fightAt, reducedMotion) {
  if(form===1&&drawImprovedShikai(ctx,actor,clock,fightAt,reducedMotion))return true;
  const attackElapsed = clock - fightAt;
  const attacking = fightAt > 0 && attackElapsed >= 0 && attackElapsed < swingDuration;
  const action = reducedMotion ? 'idle' : attacking ? 'attack' : actor.moving ? actor.running ? 'run' : 'walk' : 'idle';
  if (form === 1 && action !== 'attack' && drawOriginalIchigoMovement(ctx, actor.direction, action, (actor.gaitTime % cycle) / cycle)) return true;
  if (!atlas.complete || !atlas.naturalWidth) return false;
  const strip = frames[form][actor.direction][action];
  const elapsed = attacking ? attackElapsed / swingDuration : (actor.gaitTime % cycle) / cycle;
  const phase = Math.min(strip.length - 1, Math.floor(elapsed * strip.length));
  const frame = strip[phase];
  const [x,y,width,height,anchorX,anchorY] = frame;
  const hasBlade = form === 2 && frame.length === 8;
  if (hasBlade && actor.direction === 'up') drawBankaiBlade(ctx,frame,actor.direction,action,phase);
  ctx.drawImage(atlas,x,y,width,height,Math.round(-anchorX/2),Math.round(-anchorY/2),Math.round(width/2),Math.round(height/2));
  if (hasBlade && actor.direction !== 'up') drawBankaiBlade(ctx,frame,actor.direction,action,phase);
  if (attacking && !reducedMotion) {
    const bearing = {right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2}[actor.direction];
    ctx.globalAlpha = Math.min(1,(1 - attackElapsed/swingDuration)*1.5);
    ctx.strokeStyle = form === 2 ? '#f4aacc' : '#eee3ff';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0,-11,26,bearing-.48,bearing+.48);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  return true;
}

