import {shikaiFrames} from './frames.js';
import {selectShikaiPose,poseGeometry} from './pose.js';
const images={};
for(const [name,path] of Object.entries({body:new URL('./body.webp',import.meta.url).href,guard:new URL('./guard.webp',import.meta.url).href,weapon:new URL('./zangetsu.webp',import.meta.url).href})){
  const image=new Image();image.src=path;images[name]=image;
}

// The weapon is sampled exactly once and can only undergo a rigid translation
// and rotation plus ONE uniform scale. Hilt and blade can never bend apart.
export function drawRigidWeapon(ctx,image,hand,angle){
  const {rect,pivot,length}=shikaiFrames.weapon;
  const scale=length/rect[2];
  ctx.save();ctx.translate(...hand);ctx.rotate(angle);
  ctx.drawImage(image,...rect,(rect[0]-pivot[0])*scale,(rect[1]-pivot[1])*scale,rect[2]*scale,rect[3]*scale);
  ctx.restore();
}
export function drawShikaiLayers(ctx,textures,actor,clock,fightAt,reducedMotion=false){
  const pose=selectShikaiPose(actor,clock,fightAt,reducedMotion),geometry=poseGeometry(pose);
  const body=()=>ctx.drawImage(textures[pose.sheet],...geometry.source,...geometry.destination);
  const weapon=()=>drawRigidWeapon(ctx,textures.weapon,geometry.hand,pose.angle);
  if(pose.behind)weapon();
  body();
  if(!pose.behind){
    weapon();
    // Repaint the gripping fingers over the hilt using the exact same body frame.
    ctx.save();ctx.beginPath();ctx.ellipse(geometry.hand[0],geometry.hand[1],1.8,2.1,0,0,Math.PI*2);ctx.clip();body();ctx.restore();
  }
  if(pose.action==='parry'){
    const intensity=reducedMotion ? .65 : Math.max(0,1-pose.parryAge/.35);
    const x=geometry.hand[0]+Math.cos(pose.angle)*19,y=geometry.hand[1]+Math.sin(pose.angle)*19;
    ctx.save();ctx.globalAlpha=intensity;ctx.strokeStyle='#c1fff0';ctx.lineWidth=1.1;
    for(let i=0;i<6;i++){
      const bearing=i*Math.PI/3,inner=3,outer=reducedMotion?6:7+pose.parryAge*12;
      ctx.beginPath();ctx.moveTo(x+Math.cos(bearing)*inner,y+Math.sin(bearing)*inner);ctx.lineTo(x+Math.cos(bearing)*outer,y+Math.sin(bearing)*outer);ctx.stroke();
    }
    ctx.restore();
  }
  return pose;
}
export function drawImprovedShikai(ctx,actor,clock,fightAt,reducedMotion){
  if(!Object.values(images).every(image=>image.complete&&image.naturalWidth))return false;
  drawShikaiLayers(ctx,images,actor,clock,fightAt,reducedMotion);
  return true;
}
