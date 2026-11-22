import {test} from 'node:test';
import assert from 'node:assert/strict';
import {learnedSpells,normalizeHotbar,assignHotkey,usableKey} from '../src/controls.js';
import {resolveDefense,combatTiming} from '../src/combat-timing.js';
const spells=learnedSpells({classId:'shinigami',form:1});

test('Ten slots preserve chosen spells and repair corrupted or duplicate stored bindings',()=>{
  const slots=normalizeHotbar(null,spells);assert.equal(slots.length,10);
  assert.equal(slots[0].spellId,'shinigami-1');assert.equal(slots[1].spellId,'shinigami-0');
  const changed=assignHotkey(slots,0,'Q').slots;changed[9].spellId='shinigami-0';
  assert.deepEqual(normalizeHotbar(JSON.parse(JSON.stringify(changed)),spells),changed);
  const broken=normalizeHotbar([{key:'j'},{key:'1'},{key:'1'},{key:'control'}],spells);
  assert.equal(new Set(broken.map(slot=>slot.key)).size,10);assert.ok(broken.every(slot=>usableKey(slot.key)));
});
test('Reserved keys and conflicting hotkeys cannot replace combat and movement controls',()=>{
  const slots=normalizeHotbar(null,spells);
  for(const key of ['j','k','w','a','s','d','e','control','f5','f11','escape'])assert.ok(assignHotkey(slots,0,key).error,key);
  assert.ok(assignHotkey(slots,0,'2').error);
  assert.equal(assignHotkey(slots,0,'q').slots[0].key,'q');
  assert.equal(learnedSpells({classId:'shinigami',form:0}).length,1);
  assert.equal(learnedSpells({classId:'shinigami',form:2}).length,3);
});
test('Parry cancels damage only during the first 180ms, then guard reduces 75% until expiration',()=>{
  const start=12,until=start+combatTiming.defense;
  for(const now of [start,start+.1,start+.18])assert.deepEqual(resolveDefense(25,now,start,until),{type:'parry',damage:0});
  for(const now of [start+.181,start+.4,until])assert.deepEqual(resolveDefense(25,now,start,until),{type:'block',damage:7});
  for(const now of [start-.01,until+.001])assert.deepEqual(resolveDefense(25,now,start,until),{type:'hit',damage:25});
});
