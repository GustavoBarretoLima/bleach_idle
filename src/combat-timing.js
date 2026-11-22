export const combatTiming={attack:.59,parry:.18,defense:.65,guardCooldown:1.1,stun:.75,spellCooldown:5.8};
export function resolveDefense(damage,now,startedAt,until){
  if(now<startedAt||now>until)return {type:'hit',damage};
  if(now-startedAt<=combatTiming.parry+1e-9)return {type:'parry',damage:0};
  return {type:'block',damage:Math.ceil(damage*.25)};
}
