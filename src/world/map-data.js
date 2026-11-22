import city from './maps/karakura.json' with {type:'json'};
import shop from './maps/urahara.json' with {type:'json'};
export const tiledMaps = {city, shop};
export const tileColors = ['#6b8759','#718e5e','#baac87','#c1bda5','#505961','#377d91','#aa8057','#b9b78a','#97856c','#233237'];
export function paintMapGround(ctx, location) {
  const map = tiledMaps[location];
  for (const layer of map.layers.filter(layer=>layer.type==='tilelayer' && layer.visible)) {
    layer.data.forEach((gid, i)=>{
      if (!gid) return;
      ctx.fillStyle=tileColors[gid-1];
      ctx.fillRect(i%map.width*map.tilewidth,Math.floor(i/map.width)*map.tileheight,map.tilewidth,map.tileheight);
    });
  }
}
