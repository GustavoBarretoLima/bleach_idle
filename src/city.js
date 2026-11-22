// Terrain and collision data from BleachSoulBreak-Godot/assets/wwa/karakura.json.
import { landmarks, riverBlocks } from './karakura/world.js';
import { cameraFor, plaza } from './data.js';

const radius = 6.5;
export const city = {x:160,y:40,width:800,height:560,spawn:{x:545,y:440}};

export function cityCamera(hero,width,height) {
  return cameraFor({x:hero.x,y:hero.y-36},width,height);
}

export function cityWalkable(x,y) {
  if(x<city.x+radius || y<city.y+radius || x>city.x+city.width-radius || y>city.y+city.height-radius) return false;
  if(riverBlocks(x,y,radius)) return false;
  return !landmarks.some(b=>x>b.x-radius && x<b.x+b.w+radius && y>b.y-radius && y<b.y+b.h+radius);
}

// Use the open strip below the old fountain for the presence service's existing coordinate range.
const wire = {
  x:plaza.bounds.left+4, y:plaza.fountain.bottom+7,
  width:plaza.bounds.right-plaza.bounds.left-8, height:plaza.bounds.bottom-plaza.fountain.bottom-11
};

export function encodeCityPosition({x,y}) {
  return {
    x:wire.x+(x-city.x)/city.width*wire.width,
    y:wire.y+(y-city.y)/city.height*wire.height
  };
}

export function decodeCityPosition({x,y}) {
  if(x<wire.x || x>wire.x+wire.width || y<wire.y || y>wire.y+wire.height) return null;
  return {
    x:city.x+(x-wire.x)/wire.width*city.width,
    y:city.y+(y-wire.y)/wire.height*city.height
  };
}
