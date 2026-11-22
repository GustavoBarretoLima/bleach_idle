import Phaser from 'phaser';
import {createRenderer} from '../renderer.js';
import {tiledMaps} from './map-data.js';
import {cityTrees} from './scenery.js';

// Phaser owns terrain, camera, foreground and atmosphere. The existing character
// renderer is a transparent screen-space texture while combat is migrated later.
export function createWorldRenderer(world,reducedMotion) {
  let ready=false,disposed=false,terrainRevision=0,loadedRevision=-1,lastState=null;
  const legacy=createRenderer(world,reducedMotion,{separateGround:true,transparentActors:()=>ready});
  const output=document.createElement('canvas');
  output.className='phaser-world';
  output.setAttribute('aria-hidden','true');
  world.parentElement.append(output);
  let engine;
  const contextLost=()=>{ready=false;world.classList.remove('world-input');output.style.display='none';};
  output.addEventListener('webglcontextlost',contextLost);
  class KarakuraScene extends Phaser.Scene {
    constructor(){super('Karakura');}
    preload(){
      this.load.image('terrain-tiles',new URL('./terrain.svg',import.meta.url).href);
      this.load.image('godot-props',new URL('../karakura/props.webp',import.meta.url).href);
    }
    create(){
      if(disposed)return;
      if(!this.textures.exists('terrain-tiles') || !this.textures.exists('godot-props')) {
        output.remove();this.game.destroy(true);return;
      }
      this.cameras.main.setRoundPixels(true);
      this.layers=[];this.crowns=[];
      this.actorsTexture=this.textures.addCanvas('actors',world);
      this.actors=this.add.image(0,0,'actors').setOrigin(0).setScrollFactor(0).setDepth(10);
      this.textures.get('godot-props').add('tree',0,209,0,128,144);
      this.ambient=this.add.graphics().setDepth(25);
      this.water=this.add.graphics().setDepth(2);
      this.light=this.add.graphics().setDepth(15);
      ready=true;
      output.dataset.renderer='phaser';
      world.classList.add('world-input');
      this.rebuildTerrain();
    }
    rebuildTerrain(){
      for(const layer of this.layers)layer.destroy();
      this.layers=[];
      for(const crown of this.crowns)crown.destroy();
      this.crowns=[];
      this.tilemap?.destroy();this.tilemap=null;
      const location=legacy.getLocation();
      if(tiledMaps[location]){
        const key='tiled-'+location;
        if(!this.cache.tilemap.exists(key))this.cache.tilemap.add(key,{format:Phaser.Tilemaps.Formats.TILED_JSON,data:tiledMaps[location]});
        this.tilemap=this.make.tilemap({key});
        const tiles=this.tilemap.addTilesetImage('Karakura','terrain-tiles');
        this.layers.push(this.tilemap.createLayer('Ground',tiles,0,0).setDepth(0));
      }
      this.textures.remove('scenery');
      const scenery=this.textures.addCanvas('scenery',legacy.background);
      scenery.refresh();
      this.layers.push(this.add.image(0,0,'scenery').setOrigin(0).setDepth(3));
      if(location==='city')for(const [x,y] of cityTrees)this.crowns.push(this.add.image(x-24,y-51,'godot-props','tree').setOrigin(0).setDisplaySize(48,54).setData('base',{x,y}));
      loadedRevision=terrainRevision;
    }
    update(){
      if(!ready||disposed||!lastState)return;
      if(loadedRevision!==terrainRevision)this.rebuildTerrain();
      const camera=legacy.getCamera(),location=legacy.getLocation();
      this.cameras.main.setScroll(camera.x,camera.y);
      this.actorsTexture.refresh();
      const {hero,clock}=lastState;
      for(const crown of this.crowns){
        const {x,y}=crown.getData('base');
        crown.setDepth(hero.y<y?20:5);
        crown.setAlpha(hero.y<y&&hero.y>y-50&&Math.abs(hero.x-x)<26?.42:1);
      }
      this.water.clear();this.light.clear();this.ambient.clear();
      const time=reducedMotion.matches?0:clock;
      if(location==='city'){
        this.water.lineStyle(1,0xb0e2dc,.44);
        for(let i=0;i<28;i++){
          const y=48+(i*19+time*6)%543;
          if([205,430].some(bridge=>Math.abs(y-bridge)<23))continue;
          const x=821+(i*17)%48;
          this.water.lineBetween(x,y,x+5+Math.sin(i+time)*3,y);
        }
        this.light.fillStyle(0xffd99b,.12);
        for(const point of tiledMaps.city.layers.find(layer=>layer.name==='Atmosphere').objects.filter(point=>point.type==='lamp'))this.light.fillEllipse(point.x,point.y-5,24,18);
        this.ambient.fillStyle(0xf3dfb2,.035);this.ambient.fillRect(camera.x,camera.y,world.width,world.height);
        // A few drifting petals, bounded to the riverside rather than the whole screen.
        this.ambient.fillStyle(0xf1dfb9,.6);
        for(let i=0;i<10;i++)this.ambient.fillRect(894+Math.sin(time*.45+i)*17,65+(i*53+time*8)%510,2,1);
      }else if(location==='shop'){
        for(const point of tiledMaps.shop.layers.find(layer=>layer.name==='Atmosphere').objects.filter(point=>point.type==='lantern')){
          for(let radius=42;radius>0;radius-=10){this.light.fillStyle(0xffd091,.018);this.light.fillEllipse(point.x,point.y+10,radius*2,radius);}
        }
        this.ambient.fillStyle(0xffc477,.055);this.ambient.fillRect(328,180,464,280);
      }
    }
  }
  try{
    const webgl=output.getContext('webgl',{alpha:false,antialias:false});
    engine=new Phaser.Game({type:webgl?Phaser.WEBGL:Phaser.CANVAS,canvas:output,parent:world.parentElement,width:world.width,height:world.height,
      backgroundColor:'#233237',pixelArt:true,roundPixels:true,antialias:false,
      banner:false,audio:{noAudio:true},input:{keyboard:false,mouse:false,touch:false,gamepad:false},
      fps:{target:30,forceSetTimeOut:true},scene:[KarakuraScene]});
  }catch(error){
    output.remove();
    console.warn('Usando a apresentação Canvas do mapa.',error);
  }
  return {
    paintTerrain(...args){legacy.paintTerrain(...args);terrainRevision++;},
    draw(state){lastState=state;legacy.draw(state);},
    dispose(){disposed=true;ready=false;world.classList.remove('world-input');output.removeEventListener('webglcontextlost',contextLost);engine?.destroy(true);output.remove();}
  };
}
