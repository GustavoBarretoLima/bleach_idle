import {test} from 'node:test';
import assert from 'node:assert/strict';
globalThis.Image=class {};
const {drawLobotsShikai}=await import('../src/ichigo/lobots/renderer.js');
const texture={complete:true,naturalWidth:128};
function context(){return {images:[],save(){},restore(){},translate(){},drawImage(...args){this.images.push(args);},beginPath(){},arc(){},stroke(){},moveTo(){},lineTo(){}};}

test('LOBOTS uses four distinct direction columns and all steps without bending the sword',()=>{
  for(const [column,direction] of ['up','right','down','left'].entries()){
    const rows=new Set();
    for(const gaitTime of [0,.15,.29,.43]){
      const ctx=context();
      assert.equal(drawLobotsShikai(ctx,{direction,moving:true,gaitTime},2,0,false,texture),true);
      const [,x,y,w,h,dx,dy,dw,dh]=ctx.images[0];
      assert.equal(x,column*32);rows.add(y);
      assert.deepEqual([w,h,dx,dy,dw,dh],[32,32,-20,-38.75,40,40]);
    }
    assert.deepEqual([...rows].sort((a,b)=>a-b),[0,32,64]);
  }
});

test('Combat and reduced motion keep the same sheet and foot anchor',()=>{
  for(const actor of [{},{defendingUntil:3,defenseStartedAt:1.9},{parryFlashUntil:2.3}]){
    const ctx=context();
    drawLobotsShikai(ctx,{direction:'right',moving:true,gaitTime:1,...actor},2,1.9,true,texture);
    assert.equal(ctx.images.length,1);
    assert.equal(ctx.images[0][0],texture);
    assert.equal(ctx.images[0][2],32);
    assert.deepEqual(ctx.images[0].slice(5),[-20,-38.75,40,40]);
  }
});

test('An unavailable LOBOTS texture leaves the existing fallback available',()=>{
  const ctx=context();
  assert.equal(drawLobotsShikai(ctx,{},1,0,false,{complete:false}),false);
  assert.equal(ctx.images.length,0);
});
