// 5. Obstacle Class (Military theme objects)
class Obstacle {
  constructor(type) {
    this.type = type; // 'sandbag', 'drum', 'helicopter'
    this.passed = false;
    this.rotorTick = 0;
    
    if (this.type === 'sandbag') {
      this.width = 65;
      this.height = 32;
      this.x = GAME_WIDTH;
      this.y = GROUND_Y - this.height;
    } else if (this.type === 'drum') {
      this.width = 40;
      this.height = 48;
      this.x = GAME_WIDTH;
      this.y = GROUND_Y - this.height;
    } else if (this.type === 'helicopter') {
      this.width = 70;
      this.height = 36;
      this.x = GAME_WIDTH;
      this.y = GROUND_Y - 80; // requires player to slide under
    }
  }

  update() {
    this.x -= gameSpeed;
    if (this.type === 'helicopter') {
      this.rotorTick++;
    }
  }

  draw() {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    const x = Math.round(this.x);
    const y = Math.round(this.y);
    const w = this.width;
    const h = this.height;

    if (this.type === 'drum') {
      // Steel Fuel Drum
      ctx.fillStyle = '#1e1a17'; // outline
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#cca810'; // yellow hazard body
      ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
      
      // hazard striped band
      ctx.fillStyle = '#1e1a17';
      ctx.fillRect(x + 2, y + 18, w - 4, 12);
      ctx.fillStyle = '#ffd530';
      // diagonal lines
      ctx.fillRect(x + 6, y + 18, 4, 12);
      ctx.fillRect(x + 18, y + 18, 4, 12);
      ctx.fillRect(x + 30, y + 18, 4, 12);

      // metal bands
      ctx.fillStyle = '#7a858f';
      ctx.fillRect(x + 1, y + 6, w - 2, 3);
      ctx.fillRect(x + 1, y + h - 9, w - 2, 3);

    } else if (this.type === 'sandbag') {
      // Sandbags pile
      ctx.fillStyle = '#1e1a17'; // outline
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#c5a075'; // sandbag khaki brown
      ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
      
      // Individual sandbag separations
      ctx.strokeStyle = '#685038';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + 2);
      ctx.lineTo(x + w / 2, y + h - 2);
      ctx.moveTo(x + w / 4, y + h / 2);
      ctx.lineTo(x + w * 0.75, y + h / 2);
      ctx.stroke();

    } else if (this.type === 'helicopter') {
      // Enemy Helicopter
      ctx.fillStyle = '#1e1a17'; // outline
      ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
      ctx.fillStyle = '#3a4f5d'; // army steel blue
      ctx.fillRect(x + 6, y + 6, w - 12, h - 12);

      // Windshield cockpit
      ctx.fillStyle = '#80e5ff';
      ctx.fillRect(x + 8, y + 8, 12, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 10, y + 8, 4, 3);

      // Tail boom
      ctx.fillStyle = '#3a4f5d';
      ctx.fillRect(x + w - 12, y + 14, 12, 4);
      // Tail fin
      ctx.fillStyle = '#1e1a17';
      ctx.fillRect(x + w - 4, y + 8, 4, 16);

      // Rotor Shaft
      ctx.fillStyle = '#1e1a17';
      ctx.fillRect(x + w / 2 - 2, y, 4, 6);

      // Rotor blades
      ctx.strokeStyle = '#d5dfe8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const frame = Math.floor(this.rotorTick / 2) % 2;
      if (frame === 0) {
        ctx.moveTo(x - 10, y);
        ctx.lineTo(x + w + 10, y);
      } else {
        ctx.moveTo(x + w/4, y - 1);
        ctx.lineTo(x + w * 0.75, y + 1);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  getHitbox() {
    if (this.type === 'sandbag') {
      return { x: this.x + 3, y: this.y + 2, width: this.width - 6, height: this.height - 2 };
    } else if (this.type === 'drum') {
      return { x: this.x + 3, y: this.y + 2, width: this.width - 6, height: this.height - 2 };
    } else if (this.type === 'helicopter') {
      // Hitbox extends to the top of the screen to block jumping over the aircraft
      return { x: this.x + 4, y: 0, width: this.width - 8, height: this.y + this.height - 4 };
    }
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}

let obstacles = [];
let nextSpawnTime = 0;

function spawnObstacle() {
  let type;
  const rand = Math.random();
  if (score > 35 && rand < 0.38) {
    type = 'helicopter';
  } else {
    type = (rand > 0.65) ? 'sandbag' : 'drum';
  }
  obstacles.push(new Obstacle(type));
}

function handleObstacles() {
  const now = Date.now();
  
  if (now > nextSpawnTime && gameState === 'PLAYING') {
    spawnObstacle();
    
    const safeDistance = gameSpeed * 40 + 130;
    const randomBonus = Math.random() * 260;
    const totalGap = safeDistance + randomBonus;
    const delayMs = (totalGap / gameSpeed) * 16.67;
    nextSpawnTime = now + delayMs;
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.update();
    obs.draw();

    if (!obs.passed && obs.x + obs.width < player.x) {
      obs.passed = true;
    }

    // Collision Check
    if (checkCollision(player.getHitbox(), obs.getHitbox())) {
      triggerGameOver();
    }

    // Clean up out of screen obstacles
    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
    }
  }
}

function checkCollision(r1, r2) {
  return (
    r1.x < r2.x + r2.width &&
    r1.x + r1.width > r2.x &&
    r1.y < r2.y + r2.height &&
    r1.y + r1.height > r2.y
  );
}
