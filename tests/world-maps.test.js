import {test} from 'node:test';
import assert from 'node:assert/strict';
import {tiledMaps,tileColors} from '../src/world/map-data.js';
import {city,cityWalkable} from '../src/city.js';
import {doorsFor} from '../src/urahara.js';

test('Both Tiled maps have valid dimensions, tiles and positioned atmosphere objects',()=>{
  for(const [location,map] of Object.entries(tiledMaps)){
    assert.equal(map.type,'map');assert.equal(map.orientation,'orthogonal');
    assert.equal(map.width*map.tilewidth,1120);assert.equal(map.height*map.tileheight,640);
    const ground=map.layers.find(layer=>layer.name==='Ground');assert.equal(ground.data.length,map.width*map.height);
    assert.ok(ground.data.every(gid=>Number.isInteger(gid)&&gid>=1&&gid<=tileColors.length));
    const objects=map.layers.find(layer=>layer.name==='Atmosphere').objects;
    assert.ok(objects.length>0);assert.ok(objects.every(object=>object.x>=0&&object.x<=1120&&object.y>=0&&object.y<=640));
    if(location==='shop')assert.deepEqual(objects.filter(object=>object.type==='door').map(({x,y})=>({x,y})),doorsFor('shop').map(({x,y})=>({x,y})));
  }
});

test('City spawn can still reach both entrances and cross the Onose bridges',()=>{
  const queue=[city.spawn],seen=new Set();
  for(let i=0;i<queue.length;i++){
    const {x,y}=queue[i];
    for(const [dx,dy] of [[8,0],[-8,0],[0,8],[0,-8]]){
      const next={x:x+dx,y:y+dy},key=`${next.x},${next.y}`;
      if(!seen.has(key)&&cityWalkable(next.x,next.y)){seen.add(key);queue.push(next);}
    }
  }
  for(const target of [...doorsFor('city'),{x:912,y:205},{x:912,y:430}])assert.ok(queue.some(point=>Math.hypot(point.x-target.x,point.y-target.y)<16),`Unreachable ${target.id??'river bank'}`);
});
