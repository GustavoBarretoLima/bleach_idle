import {originalFrames} from './frames.js';

const sheets = {};
for (const [action, url] of Object.entries({
  walk: new URL('./shikai-walk.png', import.meta.url).href,
  run: new URL('./shikai-run.png', import.meta.url).href
})) {
  sheets[action] = new Image();
  sheets[action].src = url;
}

// One scale for both axes and every frame preserves Zangetsu's original shape.
const scale = 0.14;
export function drawOriginalIchigoMovement(ctx, direction, action, elapsed) {
  const sheetAction = action === 'idle' ? 'walk' : action;
  const sheet = sheets[sheetAction];
  if (!sheet?.complete || !sheet.naturalWidth) return false;
  const strip = originalFrames[sheetAction][direction];
  const movingFrames = sheetAction === 'walk' ? strip.slice(1) : strip;
  const frame = action === 'idle' ? strip[0] : movingFrames[Math.floor(elapsed * movingFrames.length) % movingFrames.length];
  const [x, y, width, height, anchorX, anchorY] = frame;
  ctx.drawImage(sheet, x, y, width, height,
    -anchorX * scale, -anchorY * scale, width * scale, height * scale);
  return true;
}
