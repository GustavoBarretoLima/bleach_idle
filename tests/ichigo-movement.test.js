import {test} from 'node:test';
import assert from 'node:assert/strict';
import {originalFrames} from '../src/ichigo/frames.js';

globalThis.Image = class { complete = true; naturalWidth = 1060; };
const {drawOriginalIchigoMovement} = await import('../src/ichigo/movement.js');

test('Original Ichigo movement keeps sword and body together at a uniform scale in every direction', () => {
  for (const direction of ['down', 'left', 'up', 'right']) {
    for (const action of ['idle', 'walk', 'run']) {
      for (const elapsed of [0, .24, .49, .74, .99]) {
        const calls = [];
        assert.equal(drawOriginalIchigoMovement({drawImage: (...args) => calls.push(args)}, direction, action, elapsed), true);
        assert.equal(calls.length, 1);
        const [sheet, x, y, w, h, dx, dy, dw, dh] = calls[0];
        assert.match(sheet.src, /shikai-(walk|run)\.png$/);
        assert.ok(Math.abs(dw / w - dh / h) < 1e-12);
        assert.ok(x >= 0 && y >= 0 && x + w <= 1060 && y + h <= 1484);
        assert.ok(dx <= 0 && dy < 0);
      }
    }
  }
});

test('Walking plays all four original movement poses and idle uses the resting pose', () => {
  const seen = [];
  const ctx = {drawImage: (...args) => seen.push(args.slice(1, 5))};
  for (const elapsed of [0, .25, .5, .75]) drawOriginalIchigoMovement(ctx, 'right', 'walk', elapsed);
  assert.deepEqual(seen, originalFrames.walk.right.slice(1).map(frame => frame.slice(0, 4)));
  seen.length = 0;
  drawOriginalIchigoMovement(ctx, 'right', 'idle', .75);
  assert.deepEqual(seen[0], originalFrames.walk.right[0].slice(0, 4));
});
