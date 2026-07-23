// 4. Player Class
class Player {
  constructor() {
    this.x = 120;
    this.y = GROUND_Y - 64;
    this.normalWidth = 42;
    this.normalHeight = 64;
    this.duckWidth = 56;
    this.duckHeight = 32;
    
    this.width = this.normalWidth;
    this.height = this.normalHeight;
    
    this.vy = 0;
    this.gravity = 0.65; // Comfortable gravity
    this.jumpForce = -13.5; // High jump for clearing ground obstacles
    this.isJumping = false;
    this.isDucking = false;
    
    this.particles = [];
    this.runPhase = 0;
    this.deathTick = 0;
  }

  reset() {
    this.y = GROUND_Y - this.normalHeight;
    this.width = this.normalWidth;
    this.height = this.normalHeight;
    this.vy = 0;
    this.isJumping = false;
    this.isDucking = false;
    this.particles = [];
    this.runPhase = 0;
    this.deathTick = 0;
  }

  jump() {
    if (!this.isJumping && !this.isDucking) {
      this.vy = this.jumpForce;
      this.isJumping = true;
      SFX.playJump();
    }
  }

  duck(isDucking) {
    if (this.isJumping) return;
    
    if (isDucking) {
      if (!this.isDucking) {
        SFX.playDuck();
      }
      this.isDucking = true;
      this.width = this.duckWidth;
      this.height = this.duckHeight;
      this.y = GROUND_Y - this.duckHeight;
    } else {
      this.isDucking = false;
      this.width = this.normalWidth;
      this.height = this.normalHeight;
      this.y = GROUND_Y - this.normalHeight;
    }
  }

  update() {
    if (gameState === 'PLAYING' || gameState === 'START') {
      this.runPhase += gameSpeed * 0.025;
    } else if (gameState === 'GAMEOVER') {
      this.deathTick++;
    }

    // Apply Gravity / Physics
    if (this.isJumping) {
      this.vy += this.gravity;
      this.y += this.vy;

      if (this.y >= GROUND_Y - this.height) {
        this.y = GROUND_Y - this.height;
        this.vy = 0;
        this.isJumping = false;
      }
    }

    // Spawn running feet dust / slide friction particles
    if (gameState === 'PLAYING') {
      if (this.isDucking) {
        const sparkX = this.x + 10;
        const sparkY = GROUND_Y - 2;
        for (let i = 0; i < 3; i++) {
          this.particles.push({
            x: sparkX + Math.random() * 15,
            y: sparkY,
            vx: -gameSpeed * 0.6 - Math.random() * 3,
            vy: -Math.random() * 2 - 0.5,
            size: Math.random() * 3 + 2,
            color: '#8b7a66', // sand/dust brown
            alpha: 1.0
          });
        }
      } else if (!this.isJumping) {
        const px = this.x + 6;
        const py = this.y + this.height - 4;
        if (Math.random() < 0.45) {
          this.particles.push({
            x: px + Math.random() * 12,
            y: py,
            vx: -gameSpeed * 0.4 - Math.random() * 2,
            vy: -Math.random() * 1.5 - 0.5,
            size: Math.random() * 3 + 2,
            color: '#9c8a78', // dust grey-brown
            alpha: 0.8
          });
        }
      }
    }

    // Update trail dust particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.045;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw() {
    // 1. Draw dust particles
    ctx.save();
    ctx.shadowBlur = 0;
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.restore();

    // 2. Draw Sprite Character frame
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    let row = 0;
    let col = 0;
    
    if (gameState === 'GAMEOVER') {
      row = 3;
      col = Math.min(5, Math.floor(this.deathTick / 6));
    } else if (this.isDucking) {
      row = 2;
      col = Math.floor(this.runPhase * 0.5) % 3;
    } else if (this.isJumping) {
      row = 1;
      const vy = this.vy;
      if (vy < -6) col = 0;
      else if (vy >= -6 && vy < 2) col = 1;
      else if (vy >= 2 && vy < 8) col = 2;
      else col = 3;
    } else {
      row = 0;
      col = Math.floor(this.runPhase) % 6;
    }

    // Draw stretched sprite frame centered slightly (32x32 mapped to 64x64)
    ctx.drawImage(
      soldierSheet,
      col * 32, row * 32, 32, 32,
      Math.round(this.x - 11), Math.round(this.isDucking ? GROUND_Y - 64 : this.y), 64, 64
    );
    
    ctx.restore();
  }

  getHitbox() {
    const paddingX = 6;
    const paddingY = 4;
    return {
      x: this.x + paddingX,
      y: this.y + paddingY,
      width: this.width - paddingX * 2,
      height: this.height - paddingY * 2
    };
  }
}

const player = new Player();
