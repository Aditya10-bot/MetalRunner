// 6. Parallax Background Layers
class ParallaxLayer {
  constructor(depth, renderFunc, updateFunc) {
    this.depth = depth;
    this.render = renderFunc;
    this.update = updateFunc || function() {};
  }
}

// Parallax background items setup (Glitch-free self-scrolling coordinates)
const clouds = [];
for (let i = 0; i < 4; i++) {
  clouds.push({ x: i * 280 + Math.random() * 80, y: Math.random() * 80 + 20 });
}

const ruins = [];
let rX = 0;
for (let i = 0; i < 7; i++) {
  const w = Math.random() * 60 + 50;
  const h = Math.random() * 90 + 90;
  ruins.push({ x: rX, w: w, h: h });
  rX += w + 80 + Math.random() * 80;
}
const TOTAL_RUINS_WIDTH = rX;

const fortifications = [];
let fX = 0;
for (let i = 0; i < 8; i++) {
  const type = (Math.random() < 0.3) ? 'tower' : (Math.random() < 0.6 ? 'fence' : 'tree');
  fortifications.push({ x: fX, type: type });
  fX += 200 + Math.random() * 150;
}
const TOTAL_FORT_WIDTH = fX;

const parallaxBg = [
  // Layer 1 (Far): Warzone bright day skies with a sun and silhouettes of ruins
  new ParallaxLayer(0.2, function() {
    // Bright day sky blue gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    skyGrad.addColorStop(0, '#7ec0ee'); // Sky blue
    skyGrad.addColorStop(1, '#cce6ff'); // Light horizon blue
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, GAME_WIDTH, GROUND_Y);

    // Retro arcade sun in the top-left corner
    ctx.fillStyle = '#ffaa00'; // Sun outline/halo
    ctx.beginPath();
    ctx.arc(80, 70, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffee33'; // Sun core
    ctx.beginPath();
    ctx.arc(80, 70, 20, 0, Math.PI * 2);
    ctx.fill();

    // Retro sun rays
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(80 - 35, 70 - 2, 8, 4);
    ctx.fillRect(80 + 27, 70 - 2, 8, 4);
    ctx.fillRect(80 - 2, 70 - 35, 4, 8);
    ctx.fillRect(80 - 2, 70 + 27, 4, 8);
    ctx.fillRect(80 - 26, 70 - 26, 6, 6);
    ctx.fillRect(80 + 20, 70 - 26, 6, 6);
    ctx.fillRect(80 - 26, 70 + 20, 6, 6);
    ctx.fillRect(80 + 20, 70 + 20, 6, 6);

    // Clouds (Bright/semi-transparent white)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (const c of clouds) {
      ctx.fillRect(Math.round(c.x), c.y, 80, 16);
      ctx.fillRect(Math.round(c.x + 12), c.y - 6, 56, 6);
      ctx.fillRect(Math.round(c.x + 24), c.y + 16, 32, 6);
    }

    // Ruined tower blocks (Cool slate grey silhouette)
    ctx.fillStyle = '#5c6b73';
    for (const r of ruins) {
      ctx.fillRect(Math.round(r.x), GROUND_Y - r.h, r.w, r.h);
      ctx.clearRect(Math.round(r.x + r.w / 2 - 4), GROUND_Y - r.h, 8, 8); // crack
    }
  }, function() {
    // Update clouds (Slower parallax)
    for (const c of clouds) {
      c.x -= gameSpeed * 0.08;
      if (c.x < -100) c.x += GAME_WIDTH + 150;
    }
    // Update ruins (Standard layer 1 depth)
    for (const r of ruins) {
      r.x -= gameSpeed * 0.2;
      if (r.x < -150) r.x += TOTAL_RUINS_WIDTH;
    }
  }),

  // Layer 2 (Medium): Fortifications, fences, trees, watchtowers (Daytime colors)
  new ParallaxLayer(0.5, function() {
    ctx.save();
    ctx.fillStyle = '#2f3b28'; // Olive/forest charcoal
    ctx.strokeStyle = '#2f3b28';
    ctx.lineWidth = 2;

    for (const f of fortifications) {
      const fx = Math.round(f.x);

      if (f.type === 'tower') {
        ctx.fillRect(fx, GROUND_Y - 90, 12, 90);
        ctx.fillRect(fx - 10, GROUND_Y - 110, 32, 20);
        
        ctx.beginPath();
        ctx.moveTo(fx - 14, GROUND_Y - 110);
        ctx.lineTo(fx + 6, GROUND_Y - 124);
        ctx.lineTo(fx + 26, GROUND_Y - 110);
        ctx.closePath();
        ctx.fill();
      } else if (f.type === 'fence') {
        ctx.fillRect(fx, GROUND_Y - 26, 4, 26);
        ctx.fillRect(fx + 60, GROUND_Y - 26, 4, 26);
        
        ctx.beginPath();
        ctx.moveTo(fx, GROUND_Y - 20);
        ctx.lineTo(fx + 60, GROUND_Y - 16);
        ctx.moveTo(fx, GROUND_Y - 8);
        ctx.lineTo(fx + 60, GROUND_Y - 10);
        ctx.stroke();
      } else if (f.type === 'tree') {
        ctx.fillRect(fx, GROUND_Y - 55, 6, 55);
        ctx.fillRect(fx - 10, GROUND_Y - 40, 10, 4);
        ctx.fillRect(fx + 5, GROUND_Y - 48, 8, 4);
      }
    }
    ctx.restore();
  }, function() {
    // Update fortifications (Layer 2 depth)
    for (const f of fortifications) {
      f.x -= gameSpeed * 0.5;
      if (f.x < -200) f.x += TOTAL_FORT_WIDTH;
    }
  })
];

// Layer 3: Scrolling Pixel Art Tiled Ground (Speed 1.0)
let gridOffset = 0;
function drawGroundTiles() {
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  const tileSize = 32;
  const tilesCount = Math.ceil(GAME_WIDTH / tileSize) + 2;
  
  gridOffset = (gridOffset + gameSpeed) % tileSize;
  
  for (let i = 0; i < tilesCount; i++) {
    const tx = Math.round(i * tileSize - gridOffset);
    
    // Steel road plate border
    ctx.fillStyle = '#261b17'; 
    ctx.fillRect(tx, GROUND_Y, tileSize, 4);

    // Ground stone/plate deck
    ctx.fillStyle = '#7a6750'; 
    ctx.fillRect(tx, GROUND_Y + 4, tileSize, 12);
    
    // Highlights & bevels
    ctx.fillStyle = '#9e8c75';
    ctx.fillRect(tx + 1, GROUND_Y + 4, tileSize - 2, 2);
    ctx.fillStyle = '#514538';
    ctx.fillRect(tx, GROUND_Y + 15, tileSize, 1);

    // Rivets/Bolts
    ctx.fillStyle = '#261b17';
    ctx.fillRect(tx + 4, GROUND_Y + 8, 2, 2);
    ctx.fillRect(tx + tileSize - 6, GROUND_Y + 8, 2, 2);

    // Lower dirt subsoil
    ctx.fillStyle = '#3a2e24';
    ctx.fillRect(tx, GROUND_Y + 16, tileSize, GAME_HEIGHT - (GROUND_Y + 16));

    // Stone chips
    ctx.fillStyle = '#514538';
    if (i % 2 === 0) {
      ctx.fillRect(tx + 8, GROUND_Y + 30, 4, 4);
      ctx.fillRect(tx + 22, GROUND_Y + 65, 6, 4);
    } else {
      ctx.fillRect(tx + 16, GROUND_Y + 48, 4, 4);
      ctx.fillRect(tx + 4, GROUND_Y + 78, 4, 4);
    }
  }
  ctx.restore();
}
