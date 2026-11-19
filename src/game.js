import { createRenderer } from './renderer.js';
import { createPresence } from './presence.js';
import { maps, loot, drops, forms, powers, key, initial, worldSize, cameraFor, plaza, plazaWalkable } from './data.js';

export function createGame(world) {
  let storageOK = true;
  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (data?.version === 2 && maps[data.zone] && maps[data.unlocked]) return data;
      if (data?.version === 1 && maps[data.zone] && maps[data.unlocked]) {
        const {level,xp,reishi,form,zone,unlocked,kills,cleared,savedAt} = data;
        return {...initial(),level,xp,reishi,form,zone,unlocked,kills,cleared,savedAt,auto:!data.paused,legacyBlade:data.blade,legacyArmor:data.armor};
      }
    } catch { storageOK = false; }
    return initial();
  }
  const saveNumber = new Intl.NumberFormat('pt-BR');
  const fmt = value => saveNumber.format(value);
  let offlineMessage = '';
  let state = load();
  const presence=createPresence();
  let hero, enemies, path = [], destination, clock = 0, previousFrame, manualUntil = 0, cooldown = 0, guard = 0,
      block = false, messages = [], effects = [], renderAt = 0, savedAt = 0, fightAt = 0, bossMode = false, hiddenSince = null;
  const keys = new Set();
  let plannedTarget, repathAt = 0;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const {paintTerrain, draw} = createRenderer(world, reducedMotion);
  const cell = 16;
  const nx = Math.ceil(worldSize.width/cell), ny = Math.ceil(worldSize.height/cell);
  let walkable;
  const nowMap = () => maps[state.zone];
  const attack = () => 13+(state.level-1)*3+state.str*4+state.form*8+state.legacyBlade*5+(state.gear.blade ? itemStat(state.gear.blade) : 0);
  const health = () => 80+(state.level-1)*10+state.vit*14+state.legacyArmor*24+(state.gear.armor ? itemStat(state.gear.armor) : 0);
  const need = () => 22+(state.level-1)*11;
  const far = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
  const xy = ([x,y]) => ({x,y});
  const unlockedBoss = () => state.kills[state.zone]>=nowMap().goal && !state.cleared[state.zone];
  function save() {
    state.savedAt = Date.now();
    try { localStorage.setItem(key, JSON.stringify(state)); }
    catch { storageOK = false; }
    savedAt = state.savedAt;
  }
  function log(message) {
    messages = [message,...messages].slice(0,4);

  }
  function grant(xp,cash,quiet=false) {
    state.xp += xp;
    state.reishi += cash;
    while (state.xp>=need()) {
      state.xp-=need();
      state.level++;
      state.points+=2;
      if (!quiet) log('Nível '+state.level+' · +2 pontos de atributo.');
    }
  }
  function dropItem(id,quiet=false) {
    if (state.bag.includes(id)) return;
    state.bag.push(id);
    if (!quiet) log('Item coletado: '+loot[id].name+'.');
  }
  function foe(point,index,boss=false) {
    const demi = !boss && state.zone === 0 && index % 2 === 0;
    const max = boss ? nowMap().bossHp : nowMap().hp;
    return {...xy(point),home:xy(point),index,boss,demi,hp:max,max,
      patrolDirection:index%2===0 ? 1 : -1, alert:false, recover:0,
      charge:0, strikeAt:0, swing:0, hitAt:0, attackAt:-Infinity };
  }
  function startPresence() {
    presence.start(()=>({
      x:hero.x,y:hero.y,direction:hero.direction,form:state.form,
      moving:hero.moving,running:hero.running
    }));
  }
  function enter(zone, inPlaza=false) {
    state.zone=zone;
    state.inPlaza=inPlaza;
    if(!inPlaza) presence.stop();
    const spawn=inPlaza ? {x:484+Math.floor(Math.random()*8)*22,y:plaza.spawnY} : xy(nowMap().rally);
    hero={...spawn,hp:health(),facing:1,direction:'down',gaitTime:0,moving:false,rest:0};
    enemies=inPlaza ? [] : nowMap().spawns.map((p,i)=>foe(p,i));
    destination=null;
    path=[];
    bossMode=false;
    block=false;
    effects=[];
    manualUntil=0;
    walkable=new Uint8Array(nx*ny);
    for(let i=0;i<walkable.length;i++) {
      const {x,y}=cellPoint(i);
      walkable[i]=Number(avoidWall(x,y));
    }
    paintTerrain(state.zone,inPlaza);
    if(inPlaza && !document.hidden) startPresence();
  }
  function finish(enemy) {
    const m=nowMap();
    enemy.hp=0;
    enemy.recover=clock+3.4;
    effects.push({x:enemy.x,y:enemy.y-12,text:'+'+m.cash+' ◇',color:'#ffce91',until:clock+1.1});
    if (enemy.boss) {
      bossMode=false;
      state.cleared[state.zone]=true;
      state.unlocked=Math.max(state.unlocked,Math.min(2,state.zone+1));
      grant(m.exp*5,m.cash*6);
      dropItem(drops[state.zone][1]);
      log(m.boss+' foi purificado.'+(state.zone<2?' Novo distrito disponível.':' Vigília concluída.'));
    } else {
      state.kills[state.zone]++;
      grant(m.exp,m.cash);
      if(state.kills[state.zone]%3===0) dropItem(drops[state.zone][0]);
      if(state.kills[state.zone]%5===0) dropItem(drops[state.zone][1]);
      if(state.kills[state.zone]===m.goal && unlockedBoss()) log('Rastro completo. Você já pode rastrear '+m.boss+'.');
    }
    if (destination===enemy) { destination=null; path=[]; }
    hero.hp=Math.min(health(),hero.hp+Math.ceil(health()*.2));
    save();
  }
  function strike(enemy,damage,special=false) {
    const dx=enemy.x-hero.x, dy=enemy.y-hero.y;
    face(dx,dy);
    fightAt=clock;
    enemy.hitAt=clock;
    enemy.hp -= damage;
    effects.push({x:enemy.x,y:enemy.y-24,text:String(damage),color:special?'#e2b4fe':'#fff0d7',until:clock+.65});
    if (enemy.hp<=0) finish(enemy);
  }
  function avoidWall(x,y) {
    if(state.inPlaza) return plazaWalkable(x,y);
    return x>=9 && x<=worldSize.width-9 && y>=12 && y<=worldSize.height-9 && !nowMap().walls.some(([l,t,w,h])=>x>l-6 && x<l+w+6 && y>t-4 && y<t+h+6);
  }
  function cellPoint(index) { return {x:index%nx*cell+8,y:Math.floor(index/nx)*cell+8}; }
  function closestCell(point) {
    let best=-1, distance=Infinity;
    for (let i=0;i<nx*ny;i++) {
      if (!walkable[i]) continue;
      const center=cellPoint(i);
      const d=far(point,center);
      if (d<distance) { best=i;distance=d; }
    }
    return best;
  }
  function route(point) {
    const start=closestCell(hero), end=closestCell(point);
    const parents=new Int16Array(nx*ny).fill(-1);
    const queue=[start];
    parents[start]=start;
    for (let i=0;i<queue.length && parents[end]===-1;i++) {
      const current=queue[i], x=current%nx;
      for(const next of [x>0?current-1:-1,x<nx-1?current+1:-1,current-nx,current+nx]) {
        if(next<0 || next>=parents.length || parents[next]!==-1) continue;
        if (!walkable[next]) continue;
        parents[next]=current;
        queue.push(next);
      }
    }
    if(parents[end]===-1) return [];
    const way=[];
    for(let node=end;node!==start;node=parents[node]) way.push(cellPoint(node));
    way.push(cellPoint(start));
    way.reverse();
    if (avoidWall(point.x,point.y)) way.push(point);
    return way;
  }
  function setDestination(next) {
    destination=next;
    plannedTarget=next?.max ? {x:next.x,y:next.y} : null;
    path=next ? route(plannedTarget??next) : [];
    repathAt=clock+.3;
  }
  function face(dx,dy) {
    if (Math.abs(dx)>=Math.abs(dy) && dx) {
      hero.facing=dx>0?1:-1;
      hero.direction=dx>0?'right':'left';
    } else if (dy) hero.direction=dy>0?'down':'up';
  }
  function move(x,y,step) {
    face(x,y);
    const d=Math.hypot(x,y);
    if(!d) return;
    const dx=x/d*Math.min(d,step),dy=y/d*Math.min(d,step);
    const oldX=hero.x, oldY=hero.y;
    if (avoidWall(hero.x+dx,hero.y)) hero.x+=dx;
    if (avoidWall(hero.x,hero.y+dy)) hero.y+=dy;
    hero.moving=hero.x!==oldX || hero.y!==oldY;
    if(hero.moving) hero.gaitTime += Math.hypot(hero.x-oldX,hero.y-oldY)/82;
  }
  function target() {
    return enemies.reduce((best,enemy)=>{
      if(enemy.hp<=0 || (bossMode && !enemy.boss)) return best;
      return !best || far(hero,enemy)<far(hero,best) ? enemy : best;
    },null);
  }
  function stepEnemy(enemy, point, maxStep) {
    const distance=far(enemy,point);
    if(distance<.25) return true;
    const step=Math.min(distance,maxStep);
    const dx=(point.x-enemy.x)*step/distance, dy=(point.y-enemy.y)*step/distance;
    if(avoidWall(enemy.x+dx,enemy.y+dy)) {
      enemy.x+=dx;
      enemy.y+=dy;
      return true;
    }
    if(dx && avoidWall(enemy.x+dx,enemy.y)) {
      enemy.x+=dx;
      return true;
    }
    if(dy && avoidWall(enemy.x,enemy.y+dy)) {
      enemy.y+=dy;
      return true;
    }
    return false;
  }
  function clearToHero(enemy) {
    for(const part of [.25,.5,.75]) {
      if(!avoidWall(enemy.x+(hero.x-enemy.x)*part,enemy.y+(hero.y-enemy.y)*part)) return false;
    }
    return true;
  }
  function moveEnemy(enemy, dt) {
    if(enemy.charge || enemy.strikeAt) return;
    const distance=far(hero,enemy), homeDistance=far(hero,enemy.home);
    const leash=enemy.boss ? 92 : 76;
    const canEngage=clock>=hero.rest && (!bossMode || enemy.boss);
    enemy.alert=canEngage && homeDistance<=leash &&
      (enemy.alert || (distance<=(enemy.boss?72:52) && clearToHero(enemy)));
    if(enemy.alert) {
      if(distance>(enemy.boss?30:21)) stepEnemy(enemy,hero,dt*(enemy.boss?35:enemy.demi?37:43));
      return;
    }

    const span=enemy.boss ? 12 : 16+enemy.index%3*4;
    const patrolPoint={
      x:enemy.home.x+enemy.patrolDirection*span,
      y:enemy.home.y+(enemy.index%3===0 ? enemy.patrolDirection*7 : 0)
    };
    if(far(enemy,patrolPoint)<1 || !stepEnemy(enemy,patrolPoint,dt*(enemy.demi?19:24))) {
      enemy.patrolDirection*=-1;
    }
  }
  function attackHero(enemy) {
    if(enemy.boss) {
      if(enemy.charge && clock>=enemy.charge) {
        enemy.charge=0;
        enemy.attackAt=clock;
        if(far(hero,enemy)<=36 && clearToHero(enemy)) hurt(block ? Math.ceil(nowMap().bossDmg/4) : nowMap().bossDmg);
        block=false;
      } else if(!enemy.charge && enemy.alert && far(hero,enemy)<=36 && clock>=enemy.swing && clearToHero(enemy)) {
        enemy.charge=clock+1.1;
        enemy.swing=clock+2.6;
      }
      return;
    }
    const inReach=far(hero,enemy)<=25 && clearToHero(enemy);
    if(enemy.strikeAt && clock>=enemy.strikeAt) {
      enemy.strikeAt=0;
      enemy.attackAt=clock;
      if(inReach) hurt(nowMap().dmg);
    } else if(!enemy.strikeAt && enemy.alert && inReach && clock>=enemy.swing) {
      enemy.strikeAt=clock+.3;
      enemy.swing=clock+.95;
    }
  }
  function simulate(dt) {
    clock+=dt;
    hero.moving=false;
    hero.running=false;
    effects=effects.filter(effect=>effect.until>clock);
    enemies.forEach(e=>{
      if (e.hp<=0 && !e.boss && clock>=e.recover) Object.assign(e,foe(nowMap().spawns[e.index],e.index));
      if (e.hp>0) moveEnemy(e,dt);
    });
    if (clock<hero.rest) return;
    const x=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
    const y=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
    if(x||y) {
      destination=null;
      path=[];
      manualUntil=clock+1.4;
      hero.running=true;
      move(x*100,y*100,dt*101);
    } else {
      if(!state.inPlaza && state.auto && clock>=manualUntil && !destination) setDestination(target());
      const chasing=destination?.max && (far(hero,destination)>25 || !clearToHero(destination));
      if(chasing && clock>=repathAt &&
          (!path.length || far(destination,plannedTarget)>=8)) setDestination(destination);
      if(path.length && (!destination?.max || chasing)) {
        const next=path[0];
        if(far(hero,next)<3) path.shift();
        else move(next.x-hero.x,next.y-hero.y,dt*82);
      } else if(destination && !destination.max && !path.length) destination=null;
    }
    const enemy=destination?.max && destination.hp>0 ? destination : null;
    if(enemy && far(hero,enemy)<=27 && clock-fightAt>=.59 && clearToHero(enemy)) strike(enemy,attack());
    for (const e of enemies) {
      if(e.hp<=0 || (bossMode && !e.boss)) continue;
      attackHero(e);
      if(clock<hero.rest) break;
    }
    if(!enemy && clock>=hero.rest) hero.hp=Math.min(health(),hero.hp+dt*(3+state.level*.4));
  }
  function hurt(damage) {
    hero.hp=Math.max(0,hero.hp-damage);
    effects.push({x:hero.x,y:hero.y-15,text:'−'+damage,color:'#ff9c92',until:clock+.6});
    if (hero.hp>0) return;
    const activeBoss=enemies.find(e=>e.boss && e.hp>0);
    if (activeBoss) enemies.splice(enemies.indexOf(activeBoss),1);
    bossMode=false;
    path=[];
    destination=null;
    block=false;
    for(const enemy of enemies) {
      enemy.alert=false;
      enemy.strikeAt=0;
    }
    Object.assign(hero,xy(nowMap().rally),{hp:health(),rest:clock+2.4});
    log('Ren recuou e voltou ao ponto seguro.');
  }
  function harvest(seconds) {
    if(state.inPlaza || !state.auto || seconds<12) return;
    const m=nowMap();
    const hits=Math.ceil(m.hp/attack());
    const takes=Math.max(0,Math.ceil((hits-1)*.59/.86)+1);
    if(hits>1 && takes*m.dmg>=health()) return;
    const cycle=2.5+hits*.59+Math.max(0,takes*m.dmg-health()*.2)/4;
    const wins=Math.floor(Math.min(seconds,28800)/cycle);
    if(wins<1) return;
    const previous=state.kills[state.zone];
    state.kills[state.zone]+=wins;
    grant(wins*m.exp,wins*m.cash,true);
    if(Math.floor((previous+wins)/3)>Math.floor(previous/3)) dropItem(drops[state.zone][0],true);
    if(Math.floor((previous+wins)/5)>Math.floor(previous/5)) dropItem(drops[state.zone][1],true);
    offlineMessage='Caça offline · '+fmt(wins)+' abates · +'+fmt(wins*m.cash)+' Reishi · +'+fmt(wins*m.exp)+' XP';
  }
  const itemStat=id=>loot[id].stat+(state.upgrades[id]??0)*(loot[id].slot==='blade'?3:10);
  const equipCost=id=>Math.round((loot[id].slot==='blade'?26:32)*1.65**(state.upgrades[id]??0));
  function setGear(id) {
    const item=loot[id];
    if(!state.bag.includes(id)) return;
    const old=health();
    state.gear[item.slot]=id;
    hero.hp=Math.max(1,Math.min(health(),hero.hp+health()-old));
    log(item.name+' equipado.');
    save();
    publish();
  }
  function reinforce(id) {
    const cost=equipCost(id);
    if (state.reishi<cost || (state.upgrades[id]??0)>=5) return;
    const old=health();
    state.reishi-=cost;
    state.upgrades[id]=(state.upgrades[id]??0)+1;
    hero.hp+=health()-old;
    log(loot[id].name+' aprimorado para +'+state.upgrades[id]+'.');
    save();
    publish();
  }
  function addPoint(attribute) {
    if(state.points<=0) return;
    const old=health();
    state.points--;
    state[attribute]++;
    hero.hp+=health()-old;
    save();
    publish();
  }
  const listeners = new Set();
  let snapshot;
  let animationId;
  const movement = new Set(['w','a','s','d','arrowleft','arrowright','arrowup','arrowdown']);

  function inDanger() {
    const boss = enemies.find(enemy => enemy.boss && enemy.hp > 0);
    return Boolean(boss && boss.charge > clock && far(hero,boss) <= 36);
  }
  function canUseSkill() {
    return clock >= cooldown && destination?.max && destination.hp > 0
      && far(hero,destination) <= 42 && clock >= hero.rest;
  }
  function canRelease() {
    return state.form < 2 && state.level >= (state.form === 0 ? 4 : 9) && state.cleared[state.form];
  }
  function publish() {
    const map = nowMap();
    const remaining = Math.max(0,Math.ceil(cooldown-clock));
    const danger = inDanger();
    snapshot = {
      inPlaza:state.inPlaza, plazaStatus:presence.status, plazaName:presence.name,
      plazaCount:presence.players.length+1,
      map, zone:state.zone, unlocked:state.unlocked, cleared:[...state.cleared],
      auto:state.auto, bossMode, bossReady:unlockedBoss(), trail:Math.min(state.kills[state.zone],map.goal),
      hp:Math.ceil(hero.hp), maxHp:health(), xp:state.xp, goalXp:need(), reishi:state.reishi,
      level:state.level, attack:attack(), str:state.str, vit:state.vit, points:state.points,
      form:forms[state.form], nextForm:['Shikai','Bankai','Liberado'][state.form],
      formHint:['Nível 4 e chefe de Karakura','Nível 9 e chefe do Distrito do Vapor','Liberação máxima'][state.form],
      releaseReady:canRelease(), skill:powers[state.form]+(remaining?' · '+remaining+'s':''),
      skillReady:Boolean(canUseSkill()), guardReady:danger && !block && clock>=guard,
      warning:danger?(block?'Defesa preparada':'Golpe espiritual! Defenda ou saia da área.'):'',
      equipped:{...state.gear}, inventory:state.bag.map(id=>({id,...loot[id],value:itemStat(id),cost:equipCost(id),upgrade:state.upgrades[id]??0})),
      messages, offlineMessage, storageOK,
    };
    listeners.forEach(notify=>notify());
  }
  function openDistrict(index) {
    if (!maps[index] || (!state.inPlaza && index === state.zone) || index > state.unlocked) return;
    enter(index);
    log('Patrulha em '+nowMap().name+'.');
    save();
    publish();
  }
  function openPlaza() {
    if(state.inPlaza) return;
    enter(state.zone,true);
    log('Você voltou à Praça Principal.');
    save();
    publish();
  }
  function toggleHunt() {
    state.auto=!state.auto;
    manualUntil=0;
    setDestination(null);
    save();
    publish();
  }
  function trackBoss() {
    if(state.inPlaza) return;
    if(bossMode) {
      enemies=enemies.filter(enemy=>!enemy.boss);
      setDestination(null);
      bossMode=false;
      block=false;
    } else if(unlockedBoss()) {
      bossMode=true;
      for(const enemy of enemies) {
        enemy.alert=false;
        enemy.strikeAt=0;
      }
      const boss=foe(nowMap().altar,-1,true);
      enemies.push(boss);
      setDestination(boss);
      log(nowMap().boss+' surgiu no círculo espiritual.');
    }
    publish();
  }
  function defend() {
    if (!inDanger() || block || clock < guard) return;
    block=true;
    guard=clock+1.6;
    publish();
  }
  function useSkill() {
    if (!canUseSkill()) return;
    cooldown=clock+5.8;
    strike(destination,Math.round(attack()*(2.2+state.form*.55)),true);
    publish();
  }
  function release() {
    if (!canRelease()) return;
    state.form++;
    log(forms[state.form]+' liberado.');
    save();
    publish();
  }
  function pointAt(event) {
    const bounds=world.getBoundingClientRect();
    if(!bounds.width || !bounds.height) return;
    const camera=cameraFor(state.inPlaza?plaza.center:hero,world.width,world.height);
    const point={
      x:camera.x+(event.clientX-bounds.left)*world.width/bounds.width,
      y:camera.y+(event.clientY-bounds.top)*world.height/bounds.height
    };
    const enemy=enemies.filter(e=>e.hp>0).reduce((best,e)=>{
      const headY=e.y-(e.boss?46:e.demi?34:27);
      const bodyY=e.y-(e.boss?17:9);
      const nearestY=Math.max(headY,Math.min(bodyY,point.y));
      const range=far(point,{x:e.x,y:nearestY});
      return range<(e.boss?24:19) && (!best || range<best.range) ? {e,range} : best;
    },null);
    manualUntil=clock+3;
    setDestination(enemy?.e??point);
  }
  function keydown(event) {
    const key=event.key.toLowerCase();
    if (!movement.has(key) || event.ctrlKey || event.metaKey || event.altKey || event.defaultPrevented) return;
    if (key.startsWith('arrow') && event.target.closest?.('[role="tablist"]')) return;
    keys.add(key);
    event.preventDefault();
  }
  function keyup(event) { keys.delete(event.key.toLowerCase()); }
  function blur() { keys.clear(); }
  function visibility() {
    if(document.hidden) {
      hiddenSince=Date.now();
      if(state.inPlaza) presence.stop();
      save();
    } else {
      if(hiddenSince!==null) harvest((Date.now()-hiddenSince)/1000);
      hiddenSince=null;
      previousFrame=null;
      if(state.inPlaza) startPresence();
      save();
      publish();
    }
  }
  function pagehide() {
    presence.stop();
    if(hiddenSince===null) save();
  }
  function pageshow() {
    if(state.inPlaza && !document.hidden) startPresence();
  }
  function frame(time) {
    if(!document.hidden) {
      simulate(Math.min(.055,Math.max(0,(time-(previousFrame??time))/1000)));
      draw({zone:state.zone,form:state.form,hero,enemies,destination,effects,clock,fightAt,
        plazaView:state.inPlaza ? presence : null});
      if(Date.now()-savedAt>=3500) save();
      if(time>=renderAt) {
        renderAt=time+100;
        publish();
      }
    }
    previousFrame=time;
    animationId=requestAnimationFrame(frame);
  }
  harvest((Date.now()-state.savedAt)/1000);
  enter(state.zone,state.inPlaza ?? true);
  log(state.inPlaza ? 'Você chegou à Praça Principal.' : 'Patrulha em '+nowMap().name+'.');
  save();
  publish();
  world.addEventListener('pointerdown',pointAt);
  document.addEventListener('keydown',keydown);
  document.addEventListener('keyup',keyup);
  document.addEventListener('visibilitychange',visibility);
  window.addEventListener('blur',blur);
  window.addEventListener('pagehide',pagehide);
  window.addEventListener('pageshow',pageshow);
  animationId=requestAnimationFrame(frame);
  return {
    getSnapshot:()=>snapshot,
    subscribe(notify) {
      listeners.add(notify);
      return ()=>listeners.delete(notify);
    },
    addPoint,setGear,reinforce,openDistrict,openPlaza,toggleHunt,trackBoss,defend,useSkill,release,
    dispose() {
      cancelAnimationFrame(animationId);
      world.removeEventListener('pointerdown',pointAt);
      document.removeEventListener('keydown',keydown);
      document.removeEventListener('keyup',keyup);
      document.removeEventListener('visibilitychange',visibility);
      window.removeEventListener('blur',blur);
      window.removeEventListener('pagehide',pagehide);
      window.removeEventListener('pageshow',pageshow);
      presence.stop();
      keys.clear();
      listeners.clear();
    }
  };
}
