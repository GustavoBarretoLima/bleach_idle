import { maps, worldSize, cameraFor, classPaths, mentors } from './data.js';
import { drawHeroPose } from './sprites.js';
import { city, cityCamera, cityProps, decodeCityPosition } from './city.js';
import groundUrl from './karakura/ground.webp';
import propsUrl from './karakura/props.webp';
import mentorsUrl from './karakura/mentors.png';

const loadTexture = url => {
  const image = new Image();
  image.src = url;
  return image;
};
const cityGround=loadTexture(groundUrl);
const propAtlas=loadTexture(propsUrl);
const mentorAtlas=loadTexture(mentorsUrl);
const mentorFrames={shinigami:0,sado:1,inoue:2,quincy:3};

export function createRenderer(world, reducedMotion) {
  const ctx = world.getContext('2d',{alpha:false});
  ctx.imageSmoothingEnabled = false;
  const { width, height } = world;
  const background = document.createElement('canvas');
  background.width = worldSize.width;
  background.height = worldSize.height;
  const bg = background.getContext('2d');
  function ink(c,color,x,y,w,h) { c.fillStyle=color;c.fillRect(Math.floor(x),Math.floor(y),w,h); }
  function shape(c,color,points) {
    c.fillStyle=color;
    c.beginPath();
    c.moveTo(...points[0]);
    for(const p of points.slice(1)) c.lineTo(...p);
    c.closePath();
    c.fill();
  }
  function ellipse(c,color,x,y,w,h) {
    c.fillStyle=color;
    c.beginPath();
    c.ellipse(x,y,w,h,0,0,Math.PI*2);
    c.fill();
  }
  function dice(n) { return ((Math.imul(n+81,2654435761)>>>11)%1000)/1000; }
  function tree(x,y,tint) {
    ellipse(bg,'#1b28256d',x+3,y+9,12,6);
    ink(bg,'#49382f',x-2,y-2,5,12);
    shape(bg,'#202e29',[[x-13,y+2],[x-16,y-7],[x-10,y-17],[x-3,y-20],[x+9,y-17],[x+15,y-9],[x+13,y+2],[x+2,y+7]]);
    shape(bg,tint,[[x-13,y-6],[x-8,y-15],[x+2,y-19],[x+11,y-14],[x+14,y-8],[x+8,y],[x-5,y+2]]);
    ink(bg,'#82866b60',x-7,y-13,9,3);
    ink(bg,'#a8a58055',x-10,y-7,5,2);
  }
  function building(x,y,w,h,id,palette) {
    ink(bg,'#17211e77',x+5,y+7,w+6,h+5);
    ink(bg,'#292a2c',x,y+h-22,w,23);
    ink(bg,'#847a67',x+2,y+h-20,w-4,16);
    for(let j=12;j<w-12;j+=25) {
      ink(bg,'#423b36',x+j,y+h-17,11,9);
      ink(bg,j%2===0?'#dfaf76':'#a5957e',x+j+2,y+h-15,7,5);
      ink(bg,'#675243',x+j+5,y+h-15,1,5);
    }
    ink(bg,'#3b3637',x+w/2-7,y+h-18,14,17);
    ink(bg,'#b1a184',x+w/2+3,y+h-10,2,2);
    shape(bg,'#252a32',[[x-3,y+h-19],[x-3,y+15],[x+12,y-1],[x+w-11,y-1],[x+w+4,y+15],[x+w+4,y+h-19]]);
    shape(bg,palette.roof,[[x,y+h-23],[x,y+16],[x+14,y+2],[x+w-13,y+2],[x+w,y+16],[x+w,y+h-23]]);
    const ridge=y+Math.floor((h-20)*.46);
    ink(bg,'#a2a7b54a',x+3,ridge,w-6,3);
    for(let j=8;j<w-7;j+=8) {
      ink(bg,'#161d2944',x+j,y+13,1,h-38);
      ink(bg,'#a6aec426',x+j+1,y+15,2,h-40);
    }
    for(let j=13;j<h-21;j+=7) ink(bg,'#20242f60',x+4,y+j,w-8,1);
    if(id%2===0) {
      ink(bg,'#302e33',x+w-27,y+10,10,15);
      ink(bg,'#807b75',x+w-25,y+9,9,5);
    }
  }
  function paintArena(map) {
    // Reuse the tile pattern drawn by the Godot Invasão scene (survivor.gd).
    const tile=80;
    for(let y=0;y<worldSize.height;y+=tile) {
      for(let x=0;x<worldSize.width;x+=tile) {
        const alternate=((x+y)/tile)%2;
        ink(bg,alternate?map.road:map.ground,x,y,tile-1,tile-1);
        if(x%400===0) ink(bg,'#3c5359',x+39,y+10,2,50);
      }
    }
    for(const [x,y,w,h] of map.walls) {
      ink(bg,'#11192080',x+5,y+6,w,h);
      ink(bg,'#283342',x,y,w,h);
      ink(bg,map.roof,x+2,y+2,w-4,h-13);
      ink(bg,'#647389',x+3,y+4,w-6,2);
      for(let seam=14;seam<w-8;seam+=22) ink(bg,'#303a4f',x+seam,y+7,1,h-20);
      ink(bg,'#263040',x+6,y+h-9,w-12,2);
    }
  }
  function paintCity(map, zone) {
    const {width:mapWidth,height:mapHeight}=worldSize;
    ink(bg,map.ground,0,0,mapWidth,mapHeight);
    for(let i=0;i<3200;i++) {
      const x=dice(i*6)*mapWidth,y=dice(i*6+1)*mapHeight;
      ink(bg,i%3===0?'#e0d8a526':'#181f2528',x,y,2+i%4,1+i%2);
    }

    const roadY=[156,450];
    for(const y of roadY) {
      ink(bg,'#202c29',0,y-46,mapWidth,96);
      ink(bg,'#969188',0,y-43,mapWidth,89);
      ink(bg,map.road,0,y-32,mapWidth,67);
    }
    for(const x of map.roadX) {
      ink(bg,'#949489',x-32,0,60,mapHeight);
      ink(bg,map.road,x-22,0,41,mapHeight);
      for(let y=10;y<mapHeight;y+=22) ink(bg,'#d1c6a067',x-3,y,2,8);
    }
    for(const y of roadY) {
      for(let x=5;x<mapWidth;x+=24) {
        if(map.roadX.some(road=>Math.abs(road-x)<36)) continue;
        ink(bg,'#d1c6a067',x,y,11,2);
        ink(bg,'#454b48',x,y-39,1,7);
        ink(bg,'#454b48',x,y+35,1,8);
      }
      for(const road of map.roadX) {
        for(let x=road-21;x<road+19;x+=6) {
          ink(bg,'#d6cfac78',x,y-29,3,9);
          ink(bg,'#d6cfac78',x,y+21,3,9);
        }
      }
    }

    const trees=[[19,99],[147,93],[213,95],[342,96],[513,104],[24,211],[162,221],[288,215],[378,215],[521,213],
      [540,106],[767,108],[1069,110],[556,363],[1074,375],[20,389],[239,498],[698,390],[864,500],[1080,504],[329,545]];
    for(const [x,y] of trees) tree(x,y,zone===1?'#586e58':'#4f6850');
    map.walls.forEach(([x,y,w,h],index)=>building(x,y,w,h,index,map));
    for(const x of [50,225,360,500,590,720,888,1060]) {
      for(const y of [115,195,408,491]) {
        if(map.roadX.some(road=>Math.abs(road-x)<28)) continue;
        ellipse(bg,'#f2ab4937',x,y+2,10,7);
        ink(bg,'#292d32',x,y-11,2,12);
        ink(bg,'#ffcf86',x-3,y-12,8,3);
      }
    }
  }
  function paintTerrain(zone, inPlaza) {
    if(inPlaza) return;
    const map=maps[zone];
    ink(bg,map.ground,0,0,worldSize.width,worldSize.height);
    if(map.arena) paintArena(map);
    else paintCity(map,zone);

    const [ax,ay]=map.altar;
    ellipse(bg,'#352c3c93',ax,ay,19,11);
    ellipse(bg,'#d6a4f28c',ax,ay,15,8);
    ellipse(bg,map.road,ax,ay,12,6);
    ink(bg,'#edc6ff',ax-1,ay-2,3,5);
    bg.strokeStyle='#12191c';
    bg.lineWidth=4;
    bg.strokeRect(0,0,worldSize.width,worldSize.height);
  }
  const outfits = {
    human: {hair:'#303447', cloth:'#687383', trim:'#c5c9d2'},
    shinigami: {hair:'#d6c29c', cloth:'#405f4f', trim:'#9dd4a0'},
    quincy: {hair:'#dad9e5', cloth:'#e5e6f2', trim:'#5a8ac7'},
    sado: {hair:'#30292f', cloth:'#886450', trim:'#e4916e', skin:'#bd8367'},
    inoue: {hair:'#c98850', cloth:'#8d627e', trim:'#ffc5a2'}
  };
  function civilian(actor, clock, fightAt, mentor) {
    const id=actor.classId??'human';
    const {hair,cloth,trim,skin='#e7b398'}=outfits[id]??outfits.human;
    const step=actor.moving&&!reducedMotion.matches ? Math.floor(actor.gaitTime*10)%2*2 : 0;
    const back=actor.direction==='up';
    const side=actor.direction==='left'||actor.direction==='right';
    if(side && actor.facing===-1) ctx.scale(-1,1);
    ink(ctx,'#262332',-6,-7,5,7-step);
    ink(ctx,'#262332',1,-7,5,5+step);
    ink(ctx,'#242632',-9,-19,18,12);
    ink(ctx,cloth,-7,-19,14,11);
    ink(ctx,trim,-6,-11,12,2);
    ink(ctx,trim,-7,-17,3,4);
    ink(ctx,hair,-7,-33,14,15);
    if(!back) {
      ink(ctx,skin,side?-2:-5,-28,side?8:10,9);
      ink(ctx,'#302833',side?4:-4,-25,2,1);
      if(!side) ink(ctx,'#302833',2,-25,2,1);
    }
    if(mentor && id==='shinigami') {
      ink(ctx,'#21332f',-10,-33,20,5);
      ink(ctx,'#68977a',-7,-38,14,6);
      ink(ctx,'#e1dfc4',-6,-36,12,2);
      ink(ctx,'#d5c99e',9,-19,2,20);
    }
    if(mentor && id==='quincy') ink(ctx,'#d8effd',-5,-26,10,2);
    if(id==='sado') {
      ink(ctx,'#553f5b',6,-18,6,13);
      ink(ctx,trim,8,-16,3,8);
    }
    if(id==='inoue') ink(ctx,'#fff1a8',5,-30,3,3);
    if(id==='quincy' && !mentor) {
      ctx.strokeStyle='#99dcff';
      ctx.lineWidth=1.5;
      ctx.beginPath();
      ctx.arc(8,-14,8,-1.25,1.25);
      ctx.stroke();
    }
    if(!reducedMotion.matches && fightAt>0 && clock-fightAt<.23) {
      const color=classPaths[id]?.color??'#fff0d7';
      const dx=actor.direction==='up'||actor.direction==='down'?0:1;
      const dy=actor.direction==='up'?-1:actor.direction==='down'?1:0;
      const reach=id==='quincy'?38:17;
      ctx.strokeStyle=color;
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(dx*7,-14+dy*7);
      ctx.lineTo(dx*reach,-14+dy*reach);
      ctx.stroke();
    }
  }
  function character(x,y,actor,form,clock,fightAt,mentor=false) {
    const step=actor.moving&&!reducedMotion.matches ? Math.floor(clock*12)%2 : 0;
    ctx.save();ctx.translate(Math.round(x),Math.round(y));
    ellipse(ctx,'#171a1bc2',0,2,11,4);
    const frame=mentor ? mentorFrames[actor.classId] : undefined;
    if(frame!==undefined && mentorAtlas.naturalWidth) {
      ctx.drawImage(mentorAtlas,frame*48,0,48,56,-19,-44,38,44);
      ctx.restore();
      return;
    }
    if(mentor || actor.classId !== 'shinigami') {
      civilian(actor,clock,fightAt,mentor);
      ctx.restore();
      return;
    }
    if(form) ellipse(ctx,form===2?'#ecaed04c':'#a69ae451',0,-9,13,15);
    if (drawHeroPose(ctx,actor,form,clock,fightAt,reducedMotion.matches)) {
      ctx.restore();
      return;
    }
    ctx.scale(actor.facing,1);
    ink(ctx,'#121722',-7,-12,14,13);
    ink(ctx,'#222836',-6,-12,12,8);
    ink(ctx,'#4a5069',-8,-14,6,10);
    ink(ctx,'#5d6179',-7,-14,4,3);
    ink(ctx,'#121722',-6,-4-step*2,5,8);
    ink(ctx,'#121722',2,-4+step*2,5,6);
    ink(ctx,'#d6cbd9',-5,-8,11,2);
    ink(ctx,'#242632',-6,-25,12,12);
    ink(ctx,'#6a6687',-5,-25,9,3);
    ink(ctx,'#efbd99',-3,-20,10,7);
    ink(ctx,'#242632',-5,-23,6,8);
    ink(ctx,'#333248',4,-18,2,1);
    ink(ctx,'#e6b69e',5,-12,4,5);
    shape(ctx,form===2?'#ffb8d9':form===1?'#ccbbff':'#edf3ee',[[7,-7],[20,-16],[23,-17],[21,-12],[9,-4]]);
    ink(ctx,'#cd9c6d',6,-9,3,7);
    if(!reducedMotion.matches && clock-fightAt<.18 && fightAt>0) {
      shape(ctx,'#fff1daaa',[[13,-25],[24,-18],[24,-9],[15,1],[19,-10],[19,-17]]);
    }
    ctx.restore();
  }
  const hollowPalettes = [
    {dark:'#251e32',mid:'#50375c',light:'#79537f',glow:'#ffb66c'},
    {dark:'#192d2c',mid:'#345955',light:'#54867b',glow:'#c5ffab'},
    {dark:'#28213f',mid:'#55447b',light:'#8979bd',glow:'#e2b4ff'}
  ];
  function demiHollow(sway, flash) {
    shape(ctx,'#1d2738',[[-5,-24],[-11,-18],[-12,-11],[-9,-9],[-8,-13],[-7,-5],[-9,-1],[-4,-3],[-1,1],[2,-4],[7,-1],[6,-8],[10+sway,-12],[10+sway,-17],[6,-21]]);
    shape(ctx,flash?'#e0b8ca':'#64738c',[[-5,-24],[-9,-17],[-6,-13],[-6,-7],[-2,-8],[-1,-3],[2,-8],[5,-6],[6,-14],[8+sway,-17],[5,-21]]);
    ink(ctx,'#90a5bf',-6,-18,3,5);
    shape(ctx,'#314156',[[-6,-32],[0,-34],[5,-31],[7,-26],[4,-20],[-2,-19],[-6,-23]]);
    shape(ctx,'#f4e9d3',[[-5,-30],[-1,-32],[1,-29],[-1,-27],[2,-25],[0,-23],[1,-20],[-4,-22],[-6,-26]]);
    ink(ctx,'#232138',-5,-27,3,2);
    ink(ctx,'#ffd9b6',-4,-27,1,1);
    ink(ctx,'#a9d7ee',3,-27,2,1);
    ink(ctx,'#2e2634',-3,-15,6,5);
    ink(ctx,'#e78b68',-2,-14,4,3);
    ink(ctx,'#ffe2a1',-1,-14,2,1);
    ink(ctx,'#ac9e9b',1,-10,3,2);
    ink(ctx,'#ddd1bb',3,-8,2,2);
    ink(ctx,'#ac9e9b',4+sway,-6,2,2);
  }
  function fullHollow(zone, boss, sway, flash) {
    const {dark,mid,light,glow}=hollowPalettes[zone];
    const hide=flash?'#db9ca5':mid;
    const edge=flash?'#ffd0cb':light;
    if(zone===0) {
      shape(ctx,dark,[[-7,-24],[-14,-19],[-17,-8+sway],[-14,-4+sway],[-10,-9],[-8,-3],[-6,1],[-2,1],[0,-4],[3,1],[8,1],[9,-9],[13,-5],[17,-10+sway],[14,-20],[7,-24]]);
      shape(ctx,hide,[[-7,-23],[-13,-17],[-14,-9+sway],[-10,-12],[-7,-16],[-7,-5],[-3,-9],[3,-9],[7,-5],[8,-17],[12,-10],[14,-12],[12,-18],[7,-22]]);
      ink(ctx,'#bfa99e',-16,-8+sway,3,2);
      ink(ctx,'#bfa99e',14,-10+sway,3,2);
    } else if(zone===1) {
      shape(ctx,dark,[[-6,-22],[-10,-23],[-16,-21],[-19,-16],[-18,-7+sway],[-15,-3+sway],[-10,-5],[-10,0],[-4,1],[-1,-3],[2,-3],[4,1],[10,0],[10,-5],[16,-4],[19,-8-sway],[18,-17],[13,-22],[7,-22]]);
      shape(ctx,hide,[[-16,-19],[-11,-21],[-6,-19],[5,-19],[12,-20],[16,-17],[17,-9-sway],[11,-9],[9,-5],[-8,-5],[-10,-11],[-16,-8+sway]]);
      ink(ctx,edge,-17,-15,6,3);
      ink(ctx,edge,12,-16,6,3);
      ink(ctx,'#bfa99e',-17,-7+sway,4,2);
      ink(ctx,'#bfa99e',14,-7-sway,4,2);
    } else {
      shape(ctx,dark,[[-5,-26],[-13,-23],[-18,-18+sway],[-22,-9+sway],[-14,-12],[-9,-7],[-6,1],[-2,-3],[2,2],[7,-4],[10,-10],[15,-8],[21,-14-sway],[14,-20],[7,-25]]);
      shape(ctx,hide,[[-5,-22],[-12,-20],[-17,-15+sway],[-11,-17],[-6,-12],[-4,-4],[0,-8],[4,-3],[8,-13],[13,-13],[17,-15-sway],[12,-17],[5,-22]]);
      shape(ctx,edge,[[-12,-20],[-17,-15+sway],[-8,-17],[-3,-19]]);
      shape(ctx,edge,[[6,-21],[17,-15-sway],[11,-17],[7,-17]]);
    }
    ink(ctx,edge,-7,-20,14,3);
    ellipse(ctx,'#1a1423',0,-12,4.5,4);
    ink(ctx,glow,-2,-15,4,1);
    if(boss) {
      shape(ctx,'#c6ab9b',[[-9,-25],[-14,-31],[-15,-36],[-10,-34],[-4,-29]]);
      shape(ctx,'#c6ab9b',[[5,-28],[12,-35],[15,-36],[14,-30],[9,-24]]);
      ink(ctx,glow,-11,-31,2,2);
      ink(ctx,glow,10,-32,2,2);
    } else if(zone===2) {
      shape(ctx,'#c4addd',[[-8,-27],[-10,-34],[-4,-29],[3,-29],[9,-34],[8,-26]]);
    }
    shape(ctx,'#a899a0',[[-9,-25],[-6,-30],[5,-30],[9,-26],[8,-21],[4,-17],[-4,-17],[-8,-21]]);
    shape(ctx,'#f3e7d1',[[-8,-25],[-5,-29],[4,-29],[8,-25],[5,-23],[4,-20],[-4,-20],[-5,-23]]);
    ink(ctx,'#282135',-6,-25,4,2);
    ink(ctx,'#282135',2,-25,4,2);
    ink(ctx,glow,-5,-25,2,1);
    ink(ctx,glow,3,-25,2,1);
    ink(ctx,'#453545',-3,-20,6,1);
    ink(ctx,'#e8d5bd',-2,-19,1,1);
    ink(ctx,'#e8d5bd',1,-19,1,1);
  }
  function monster(enemy,zone,clock,hero) {
    const {x,y,boss,demi,hp,max}=enemy;
    if(hp<=0) return;
    if(enemy.charge) {
      ellipse(ctx,'#eb725b6f',x,y,33,20);
      ellipse(ctx,'#ee9b7652',x,y,24,14);
    }
    if(enemy.strikeAt) ellipse(ctx,'#eb725b6f',x,y,19,9);
    const phase=Math.sin(clock*(enemy.alert?8:5)+enemy.index);
    const sway=reducedMotion.matches ? 0 : Math.round(phase*2);
    const hover=demi ? 4+sway : zone===2 ? 2+sway : Math.max(0,sway);
    const flash=enemy.hitAt>0 && clock-enemy.hitAt<.13;
    ctx.save();
    ctx.translate(Math.round(x),Math.round(y));
    ctx.scale(boss?1.45:1,boss?1.45:1);
    ellipse(ctx,'#151821b0',0,1,demi?8:14,4);
    const attackAge=clock-enemy.attackAt;
    const lunge=(!reducedMotion.matches && attackAge<.22) ? Math.sin(attackAge/.22*Math.PI)*5 : 0;
    const bearing=Math.atan2(hero.y-y,hero.x-x);
    ctx.translate(Math.round(Math.cos(bearing)*lunge),Math.round(Math.sin(bearing)*lunge)-hover);
    if(demi) demiHollow(sway,flash);
    else fullHollow(zone,boss,sway,flash);
    const barY=boss?-42:-39;
    ink(ctx,'#25202b',-12,barY,24,4);
    ink(ctx,boss?'#ffad8f':demi?'#b8cce7':'#d0808c',-11,barY+1,Math.ceil(22*hp/max),2);
    ctx.restore();
  }
  const remotePlayers=new Map();
  let lastDraw=0;
  function drawPlaza(hero,form,classId,online,clock) {
    const both=online.players.flatMap(player=>{
      const position=decodeCityPosition(player);
      return position ? [{...player,...position}] : [];
    });
    const present=new Set(both.map(player=>player.id));
    for(const id of remotePlayers.keys()) if(!present.has(id)) remotePlayers.delete(id);
    const elapsed=Math.max(0,Math.min(.06,clock-lastDraw));
    for(const player of both) {
      const actor=remotePlayers.get(player.id)??{x:player.x,y:player.y,gaitTime:0};
      const before={x:actor.x,y:actor.y};
      if(reducedMotion.matches || Math.hypot(player.x-actor.x,player.y-actor.y)>60) {
        actor.x=player.x;
        actor.y=player.y;
      } else {
        const rate=Math.min(1,elapsed*9);
        actor.x+=(player.x-actor.x)*rate;
        actor.y+=(player.y-actor.y)*rate;
      }
      actor.gaitTime+=Math.hypot(actor.x-before.x,actor.y-before.y)/82;
      actor.moving=player.moving;
      actor.running=player.running;
      actor.direction=player.direction;
      actor.facing=player.direction==='left' ? -1 : 1;
      actor.name=player.name;
      actor.form=player.form;
      actor.classId=player.classId===undefined ? 'shinigami' : player.classId;
      remotePlayers.set(player.id,actor);
    }
    const self={...hero,name:online.name??'Você',form,classId};
    const guides=mentors.map(mentor=>({...mentor,name:mentor.label,classId:mentor.id,mentor:true,direction:'down',facing:1}));
    const actors=[...remotePlayers.values(),self,...guides];
    for(const actor of [...cityProps,...actors].sort((a,b)=>(a.sortY??a.y)-(b.sortY??b.y))) {
      if(actor.region) {
        const [u,v,w,h]=actor.region;
        if(propAtlas.naturalWidth) ctx.drawImage(propAtlas,u,v,w,h,actor.x,actor.y,w,h);
        continue;
      }
      character(actor.x,actor.y,actor,actor.form,clock,0,actor.mentor);
      ctx.font='bold 10px monospace';
      ctx.textAlign='center';
      const labelWidth=ctx.measureText(actor.name).width;
      const x=Math.round(actor.x), y=Math.round(actor.y)-40;
      if(actor===self) {
        ctx.fillStyle='#ffe1a1';
        ctx.fillRect(x-2,y-17,4,3);
      }
      ink(ctx,'#141c24e0',x-labelWidth/2-3,y-10,labelWidth+6,13);
      ctx.fillStyle=actor.mentor ? classPaths[actor.classId].color : actor===self ? '#ffe1a1' : '#a4f0df';
      ctx.fillText(actor.name,x,y);
    }
  }
  function draw({zone,form,classId,hero,enemies,destination,effects,clock,fightAt,plazaView}) {
    const camera=(plazaView ? cityCamera : cameraFor)(hero,width,height);
    if(!plazaView) ctx.drawImage(background,camera.x,camera.y,width,height,0,0,width,height);
    else ink(ctx,'#30383b',0,0,width,height);
    ctx.save();
    ctx.translate(-camera.x,-camera.y);
    if(plazaView && cityGround.naturalWidth) {
      ctx.drawImage(cityGround,city.x,city.y,city.width,city.height);
    }
    if(destination && !destination.max) {
      ellipse(ctx,'#d9e5ce75',destination.x,destination.y,7,4);
      ellipse(ctx,'#233629',destination.x,destination.y,4,2);
    }
    if(plazaView) {
      drawPlaza(hero,form,classId,plazaView,clock);
      lastDraw=clock;
      ctx.restore();
      return;
    }
    lastDraw=clock;
    remotePlayers.clear();
    const living=enemies.filter(e=>e.hp>0 && e.x>=camera.x-42 && e.x<=camera.x+width+42 &&
      e.y>=camera.y-45 && e.y<=camera.y+height+75);
    for(const actor of [...living,hero].sort((a,b)=>a.y-b.y)) {
      if(actor===hero) character(hero.x,hero.y,{...hero,classId},form,clock,fightAt);
      else monster(actor,zone,clock,hero);
    }
    const targetEnemy=destination?.max && destination.hp>0 ? destination : null;
    if(targetEnemy && living.includes(targetEnemy)) {
      const label=targetEnemy.boss ? maps[zone].boss : targetEnemy.demi ? 'Demi-Hollow' : maps[zone].foe;
      ctx.font='bold 11px monospace';
      ctx.textAlign='center';
      const labelWidth=ctx.measureText(label).width;
      const margin=labelWidth/2+4;
      const x=Math.max(camera.x+margin,Math.min(camera.x+width-margin,targetEnemy.x));
      const y=Math.max(camera.y+12,targetEnemy.y-(targetEnemy.boss?67:50));
      ink(ctx,'#1e1e25dc',x-labelWidth/2-3,y-10,labelWidth+6,13);
      ctx.fillStyle='#f6e6d2';ctx.fillText(label,x,y);
    }
    ctx.font='bold 12px monospace';
    ctx.textAlign='center';
    for(const f of effects) {
      const dy=reducedMotion.matches ? 0 : Math.max(0,(.58-(f.until-clock))*22);
      ctx.strokeStyle='#272126';ctx.lineWidth=3;
      ctx.strokeText(f.text,f.x,f.y-dy);
      ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y-dy);
    }
    ctx.restore();
  }

  return { paintTerrain, draw };
}
