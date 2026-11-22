import {test} from 'node:test';
import assert from 'node:assert/strict';
import {shikaiFrames} from '../src/ichigo/v2/frames.js';
import {selectShikaiPose,poseGeometry,shikaiAttackPose,shikaiAttackDuration,shortestTurn} from '../src/ichigo/v2/pose.js';
globalThis.Image=class{};
const {drawShikaiLayers}=await import('../src/ichigo/v2/renderer.js');
const textures={body:{id:'body'},guard:{id:'guard'},weapon:{id:'weapon'}};
function context(){return {images:[],rotations:[],save(){},restore(){},translate(){},rotate(angle){this.rotations.push(angle);},drawImage(...args){this.images.push(args);},beginPath(){},arc(){},ellipse(){},clip(){},moveTo(){},lineTo(){},stroke(){}};}

test('Every body and guard pose has an in-bounds source rectangle and hand anchor',()=>{
  for(const sheet of ['body','guard'])for(const strip of Object.values(shikaiFrames[sheet].directions))for(const frame of strip.frames){
    const [x,y,w,h]=frame.rect;
    assert.ok(x>=0&&y>=0&&x+w<=shikaiFrames[sheet].width&&y+h<=shikaiFrames[sheet].height);
    assert.ok(frame.hand[0]>=x&&frame.hand[0]<=x+w&&frame.hand[1]>=y&&frame.hand[1]<=y+h);
  }
});
test('Guard animates raise, brace and hold; impacts and parry use distinct recoil poses',()=>{
  const actor={direction:'left',defenseStartedAt:10,defendingUntil:10.65};
  assert.equal(selectShikaiPose(actor,10.02,0).frame,0);
  assert.equal(selectShikaiPose(actor,10.08,0).frame,1);
  assert.equal(selectShikaiPose(actor,10.3,0).frame,2);
  const parry=selectShikaiPose({...actor,parryFlashUntil:10.75},10.42,0);
  assert.equal(parry.action,'parry');assert.equal(parry.frame,3);
  const block=selectShikaiPose({direction:'right',guardHitUntil:10.6},10.5,0);
  assert.equal(block.action,'block');assert.equal(block.frame,3);
});
test('Every direction uses one rigid sword texture with equal X/Y scale for movement, attack and guard',()=>{
  for(const direction of ['down','left','up','right'])for(const actor of [
    {direction,moving:false},
    {direction,moving:true,gaitTime:.2},
    {direction,moving:true,running:true,gaitTime:.1},
    {direction,defenseStartedAt:10,defendingUntil:10.65},
    {direction,parryFlashUntil:10.5}
  ]){
    const ctx=context();const pose=drawShikaiLayers(ctx,textures,actor,10.2,10.1);
    const weapon=ctx.images.filter(call=>call[0]===textures.weapon);
    assert.equal(weapon.length,1);
    const [,sx,sy,sw,sh,dx,dy,dw,dh]=weapon[0];
    assert.deepEqual([sx,sy,sw,sh],shikaiFrames.weapon.rect);
    assert.ok(Math.abs(dw/sw-dh/sh)<1e-12);
    assert.equal(ctx.rotations.length,1);
    const geo=poseGeometry(pose);assert.ok(Math.abs(geo.destination[2]/geo.source[2]-geo.destination[3]/geo.source[3])<1e-12);
  }
});
test('Reduced motion keeps a readable braced defense pose and stops gait oscillation',()=>{
  const actor={direction:'down',defenseStartedAt:10,defendingUntil:10.65};
  assert.equal(selectShikaiPose(actor,10.01,0,true).frame,2);
  assert.equal(selectShikaiPose({direction:'right',moving:true,gaitTime:.2},10,0,true).action,'idle');
});

test('Attack prepares, cuts, follows through and recovers without snapping back to idle',()=>{
  for(const direction of ['down','left','up','right']){
    const actor={direction};
    const phases=[.03,.1,.18,.28,.4].map(t=>selectShikaiPose(actor,10+t,10).attackPhase);
    assert.deepEqual(phases,['windup','contact','follow','recover','settle']);
    const ready=selectShikaiPose(actor,11,0);
    const first=shikaiAttackPose(direction,0),last=shikaiAttackPose(direction,shikaiAttackDuration-.001);
    assert.ok(Math.abs(shortestTurn(first.angle,ready.angle))<1e-9);
    assert.ok(Math.abs(shortestTurn(last.angle,ready.angle))<1e-9);
    assert.equal(last.frame,ready.frame);
    for(const boundary of [.07,.15,.21,.37])assert.ok(Math.abs(shortestTurn(shikaiAttackPose(direction,boundary-.00001).angle,shikaiAttackPose(direction,boundary+.00001).angle))<.002);
  }
});
test('The active slash has a compact arc and reduced motion uses one stable contact pose',()=>{
  for(const direction of ['down','left','up','right']){
    const start=shikaiAttackPose(direction,.07),end=shikaiAttackPose(direction,.209999);
    assert.ok(Math.abs(end.angle-start.angle)<1.6);
    assert.deepEqual(shikaiAttackPose(direction,.02,true),shikaiAttackPose(direction,.3,true));
  }
});
