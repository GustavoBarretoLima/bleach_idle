import {test} from 'node:test';
import assert from 'node:assert/strict';
import {shop,training,roomWalkable,doorsFor,locationFor} from '../src/urahara.js';
import {cityWalkable} from '../src/city.js';
import {mentors} from '../src/data.js';

function reachable(room,start,target) {
  const cells=[];
  for(let y=8;y<640;y+=16)for(let x=8;x<1120;x+=16)if(roomWalkable(room,x,y))cells.push({x,y});
  const nearest=p=>cells.reduce((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)<Math.hypot(b.x-p.x,b.y-p.y)?a:b);
  const a=nearest(start),b=nearest(target),seen=new Set([`${a.x},${a.y}`]),queue=[a];
  for(let i=0;i<queue.length;i++){const p=queue[i];if(p.x===b.x&&p.y===b.y)return true;
    for(const [dx,dy] of [[16,0],[-16,0],[0,16],[0,-16]]){const x=p.x+dx,y=p.y+dy,k=`${x},${y}`;if(!seen.has(k)&&roomWalkable(room,x,y)){seen.add(k);queue.push({x,y});}}}
  return false;
}
test('Shop and underground entrances, exits and Urahara are reachable on the game grid',()=>{
  for(const room of ['shop','training']) {
    const spawn=room==='shop'?shop.spawn:training.spawn;
    assert.ok(roomWalkable(room,spawn.x,spawn.y));
    for(const door of doorsFor(room)){assert.ok(roomWalkable(room,door.x,door.y));assert.ok(reachable(room,spawn,door));if(door.to==='shop')assert.ok(roomWalkable('shop',door.spawn.x,door.spawn.y));}
  }
  const urahara=mentors.find(m=>m.id==='shinigami');assert.equal(urahara.room,'shop');
  assert.ok(reachable('shop',shop.spawn,{x:urahara.x,y:urahara.approachY}));
  assert.ok(cityWalkable(shop.entrance.x,shop.entrance.y));
});
test('Furniture, canyon rocks and room boundaries block walking',()=>{
  for(const room of ['shop','training'])for(const b of room==='shop'?shop.furniture:training.rocks)assert.equal(roomWalkable(room,b.x+b.width/2,b.y+b.height/2),false);
  assert.equal(roomWalkable('shop',320,300),false);assert.equal(roomWalkable('training',50,300),false);
});
test('Location and doors isolate the shop, hospital, city and underground',()=>{
  assert.equal(locationFor({inPlaza:true,uraharaRoom:'shop'}),'shop');
  assert.equal(locationFor({inPlaza:true,uraharaRoom:'training'}),'training');
  assert.equal(locationFor({inPlaza:true,inHospital:true}),'hospital');
  assert.equal(locationFor({inPlaza:false}),'district');
  assert.deepEqual(doorsFor('shop').map(d=>d.to),['city','training']);
  assert.deepEqual(doorsFor('training').map(d=>d.to),['shop']);
  assert.deepEqual(doorsFor('district'),[]);
});
