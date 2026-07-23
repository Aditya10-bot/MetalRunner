// 3. Procedural Pixel Art Generator
function generateSoldierSpriteSheet() {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = 32 * 6; // widened to 32px per column to prevent subpixel edge bleeding glitches
  tempCanvas.height = 32 * 4;
  const tCtx = tempCanvas.getContext('2d');
  
  tCtx.imageSmoothingEnabled = false;

  // Color Palette values
  const HELMET = '#556b2f'; // olive drab green
  const BAND = '#f5c53b';   // yellow strap
  const SKIN = '#ffd3a8';   // peach skin
  const VEST = '#b22222';   // red jacket
  const PANTS = '#556b2f';
  const BOOTS = '#111111';
  const GUN = '#708090';    // metal steel grey
  const OUTLINE = '#1e1a17';

  function drawHead(cx, hx, hy) {
    cx.fillStyle = OUTLINE;
    cx.fillRect(hx - 1, hy - 1, 9, 9);
    cx.fillStyle = HELMET;
    cx.fillRect(hx, hy, 7, 4); // helmet crown
    cx.fillStyle = BAND;
    cx.fillRect(hx, hy + 3, 7, 1); // yellow line
    cx.fillStyle = SKIN;
    cx.fillRect(hx + 1, hy + 4, 6, 3); // skin face
    cx.fillStyle = OUTLINE;
    cx.fillRect(hx + 4, hy + 5, 2, 2); // visor/eyes
  }

  function drawTorso(cx, tx, ty) {
    cx.fillStyle = OUTLINE;
    cx.fillRect(tx - 1, ty - 1, 8, 9);
    cx.fillStyle = VEST;
    cx.fillRect(tx, ty, 6, 7); // torso body
    cx.fillStyle = OUTLINE;
    cx.fillRect(tx - 1, ty + 6, 8, 2); // black belt line
  }

  function drawLine(cx, x1, y1, x2, y2, color, thickness) {
    cx.strokeStyle = color;
    cx.lineWidth = thickness;
    cx.lineCap = 'square';
    cx.beginPath();
    cx.moveTo(x1, y1);
    cx.lineTo(x2, y2);
    cx.stroke();
  }

  // Row 0: RUN (6 frames)
  for (let f = 0; f < 6; f++) {
    const ox = f * 32;
    const oy = 0;
    
    const legCycle = (f % 3);
    let legL_x, legR_x;
    if (legCycle === 0) { legL_x = 8; legR_x = 20; }
    else if (legCycle === 1) { legL_x = 12; legR_x = 16; }
    else { legL_x = 16; legR_x = 10; }

    // Back Leg (Far)
    drawLine(tCtx, ox + 13, oy + 24, ox + legL_x, oy + 30, OUTLINE, 3);
    drawLine(tCtx, ox + 13, oy + 24, ox + legL_x, oy + 30, PANTS, 1.5);
    tCtx.fillStyle = BOOTS;
    tCtx.fillRect(ox + legL_x - 1, oy + 29, 3, 2);

    // Body Torso
    drawTorso(tCtx, ox + 12, oy + 16);

    // Front Leg (Near)
    drawLine(tCtx, ox + 15, oy + 24, ox + legR_x, oy + 30, OUTLINE, 3);
    drawLine(tCtx, ox + 15, oy + 24, ox + legR_x, oy + 30, PANTS, 1.5);
    tCtx.fillStyle = BOOTS;
    tCtx.fillRect(ox + legR_x - 1, oy + 29, 3, 2);

    // Head
    drawHead(tCtx, ox + 11, oy + 9);

    // Heavy gun carry weapon
    drawLine(tCtx, ox + 15, oy + 19, ox + 26, oy + 19, OUTLINE, 3.5);
    drawLine(tCtx, ox + 15, oy + 19, ox + 26, oy + 19, GUN, 1.5);
    drawLine(tCtx, ox + 12, oy + 18, ox + 17, oy + 21, SKIN, 1.5);
  }

  // Row 1: JUMP (4 frames)
  for (let f = 0; f < 4; f++) {
    const ox = f * 32;
    const oy = 32;
    
    let legY = 24;
    if (f === 1) legY = 22; // peak pose
    if (f === 2) legY = 27; // downward pose
    const shiftedLegY = legY + 4;

    // Back leg
    drawLine(tCtx, ox + 13, oy + 24, ox + 10, oy + shiftedLegY, OUTLINE, 3);
    drawLine(tCtx, ox + 13, oy + 24, ox + 10, oy + shiftedLegY, PANTS, 1.5);
    tCtx.fillStyle = BOOTS;
    tCtx.fillRect(ox + 9, oy + shiftedLegY - 1, 3, 2);

    // Torso
    drawTorso(tCtx, ox + 12, oy + 15);

    // Front leg
    drawLine(tCtx, ox + 15, oy + 24, ox + 18, oy + shiftedLegY, OUTLINE, 3);
    drawLine(tCtx, ox + 15, oy + 24, ox + 18, oy + shiftedLegY, PANTS, 1.5);
    tCtx.fillStyle = BOOTS;
    tCtx.fillRect(ox + 17, oy + shiftedLegY - 1, 3, 2);

    // Head
    drawHead(tCtx, ox + 11, oy + 8);

    // Gun
    drawLine(tCtx, ox + 15, oy + 18, ox + 25, oy + 16, OUTLINE, 3.5);
    drawLine(tCtx, ox + 15, oy + 18, ox + 25, oy + 16, GUN, 1.5);
  }

  // Row 2: DUCK/SLIDE (3 frames)
  for (let f = 0; f < 3; f++) {
    const ox = f * 32;
    const oy = 64;

    // Slide pose
    drawLine(tCtx, ox + 12, oy + 26, ox + 24, oy + 26, OUTLINE, 4);
    drawLine(tCtx, ox + 12, oy + 26, ox + 24, oy + 26, PANTS, 2);
    tCtx.fillStyle = BOOTS;
    tCtx.fillRect(ox + 23, oy + 25, 3, 2);

    // Torso
    drawTorso(tCtx, ox + 10, oy + 18);

    // Head
    drawHead(tCtx, ox + 9, oy + 11);

    // Gun angled upwards
    drawLine(tCtx, ox + 14, oy + 19, ox + 22, oy + 13, OUTLINE, 3.5);
    drawLine(tCtx, ox + 14, oy + 19, ox + 22, oy + 13, GUN, 1.5);
  }

  // Row 3: DEATH (6 frames)
  for (let f = 0; f < 6; f++) {
    const ox = f * 32;
    const oy = 96;

    if (f < 3) {
      const angle = f * 0.4;
      tCtx.save();
      tCtx.translate(ox + 16, oy + 24);
      tCtx.rotate(-angle);
      
      tCtx.fillStyle = OUTLINE;
      tCtx.fillRect(-3, -8, 6, 8);
      tCtx.fillStyle = VEST;
      tCtx.fillRect(-2, -7, 4, 6);
      
      tCtx.fillStyle = OUTLINE;
      tCtx.fillRect(-4, -15, 7, 7);
      tCtx.fillStyle = HELMET;
      tCtx.fillRect(-3, -14, 5, 5);
      tCtx.restore();
    } else {
      const fade = Math.max(0.2, 1 - (f - 3) * 0.25);
      tCtx.globalAlpha = fade;
      tCtx.fillStyle = OUTLINE;
      tCtx.fillRect(ox + 6, oy + 26, 20, 6);
      tCtx.fillStyle = VEST;
      tCtx.fillRect(ox + 10, oy + 26, 10, 4);
      tCtx.fillStyle = HELMET;
      tCtx.fillRect(ox + 20, oy + 24, 5, 4);
    }
  }

  return tempCanvas;
}

function generateExplosionSpriteSheet() {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = 48 * 6;
  tempCanvas.height = 48;
  const tCtx = tempCanvas.getContext('2d');
  
  tCtx.imageSmoothingEnabled = false;
  const colors = ['#ffffff', '#ffeb3b', '#ff9800', '#f44336', '#4e0d00', '#1c1c1c'];

  for (let f = 0; f < 6; f++) {
    const ox = f * 48 + 24;
    const oy = 24;
    const radius = (f + 1) * 6.5;
    
    tCtx.save();
    for (let r = radius; r > 0; r -= 4) {
      const colorIdx = Math.min(5, Math.floor((r / radius) * 5) + (5 - f));
      tCtx.fillStyle = colors[colorIdx];
      
      tCtx.beginPath();
      tCtx.arc(ox, oy, r, 0, Math.PI * 2);
      tCtx.fill();
    }
    
    if (f < 4) {
      tCtx.fillStyle = '#ffeb3b';
      for (let s = 0; s < 8; s++) {
        const angle = (s * Math.PI) / 4 + f * 0.2;
        const dist = radius + 6;
        const sx = ox + Math.cos(angle) * dist;
        const sy = oy + Math.sin(angle) * dist;
        tCtx.fillRect(Math.round(sx) - 2, Math.round(sy) - 2, 4, 4);
      }
    }
    tCtx.restore();
  }

  return tempCanvas;
}

const soldierSheet = generateSoldierSpriteSheet();
const explosionSheet = generateExplosionSpriteSheet();
