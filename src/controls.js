import {classPaths,powers,key} from './data.js';
export const controlsKey=key+'-controls-v1';
export const reservedKeys=new Set(['w','a','s','d','e','j','k']);
export const defaultKeys=['1','2','3','4','5','6','7','8','9','0'];
export const keyLabel=key=>key===' '?'Espaço':key.toUpperCase();
export function usableKey(value){return typeof value==='string' && !reservedKeys.has(value.toLowerCase()) && (/^[\p{L}\p{N}]$/u.test(value)||/^f(?:[1-4]|[6-9]|10)$/.test(value)||value===' ');}
export function learnedSpells(state){
  const path=classPaths[state.classId];if(!path)return [];
  if(state.classId==='shinigami')return powers.slice(0,Math.min(2,state.form??0)+1).map((name,form)=>({id:'shinigami-'+form,name,power:path.power+form*.55,recovery:0,icon:['斬','月','卍'][form]}));
  return [{id:state.classId+'-0',name:path.skill,power:path.power,recovery:path.recovery??0,icon:path.icon}];
}
export function normalizeHotbar(saved,spells){
  const used=new Set();
  return defaultKeys.map((fallback,index)=>{
    const item=Array.isArray(saved)?saved[index]:undefined;
    const preferred=typeof item?.key==='string'?item.key.toLowerCase():fallback;
    const key=usableKey(preferred)&&!used.has(preferred)?preferred:defaultKeys.find(candidate=>!used.has(candidate));
    used.add(key);
    const spellId=item ? (typeof item.spellId==='string'?item.spellId:null) : (index===0?spells.at(-1)?.id:index===1&&spells.length>1?spells[0].id:null);
    return {key,spellId:spellId??null};
  });
}
export function assignHotkey(slots,index,key){
  if(!Number.isInteger(index)||index<0||index>=10)return {error:'Slot inválido.'};
  key=key.toLowerCase();
  if(!usableKey(key))return {error:'Use uma letra, número, Espaço ou F1–F4/F6–F10. WASD, E, J e K são reservadas.'};
  const conflict=slots.findIndex((slot,i)=>i!==index&&slot.key===key);
  if(conflict>=0)return {error:`Essa tecla já está no slot ${conflict+1}.`};
  return {slots:slots.map((slot,i)=>i===index?{...slot,key}:slot)};
}
