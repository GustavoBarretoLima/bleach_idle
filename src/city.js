// Terrain and collision data from BleachSoulBreak-Godot/assets/wwa/karakura.json.
import layout from './karakura/layout.json';
import { cameraFor, plaza } from './data.js';

const scale = .5;
const tile = layout.tile_size * scale;
const radius = 13 * scale;
const origin = {x:160,y:40};

export const city = {
  ...origin, width:layout.width*tile, height:layout.height*tile,
  spawn:{x:545,y:440}
};

export function cityCamera(hero,width,height) {
  return cameraFor({x:hero.x,y:hero.y-36},width,height);
}

export const cityProps = layout.visuals.map(({position,region,sort_y})=>({
  x:origin.x+position[0]*scale, y:origin.y+position[1]*scale,
  region:region.map(value=>value*scale), sortY:origin.y+sort_y*scale
}));

export function cityWalkable(x,y) {
  const localX=x-origin.x, localY=y-origin.y;
  if(localX<radius || localY<radius || localX>=city.width-radius || localY>=city.height-radius) return false;
  const left=Math.floor((localX-radius)/tile), right=Math.floor((localX+radius)/tile);
  const top=Math.floor((localY-radius)/tile), bottom=Math.floor((localY+radius)/tile);
  for(let row=top;row<=bottom;row++) {
    for(let col=left;col<=right;col++) {
      if(layout.blocked[row][col]!=='1') continue;
      const closestX=Math.max(col*tile,Math.min((col+1)*tile,localX));
      const closestY=Math.max(row*tile,Math.min((row+1)*tile,localY));
      if((localX-closestX)**2+(localY-closestY)**2<radius**2) return false;
    }
  }
  return true;
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
