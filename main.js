// 7. Collision and Game Over triggers
function triggerGameOver() {
  gameState = 'GAMEOVER';
  SFX.playCrash();
  
  // Screen Shake
  triggerScreenShake(30, 12);
  
  // CSS screen container shake
  container.classList.add('shake-anim');
  setTimeout(() => {
    container.classList.remove('shake-anim');
  }, 400);

  // Play explosion
  explosion = {
    x: player.x + player.width / 2,
    y: player.y + player.height / 2,
    frame: 0,
    tick: 0
  };

  if (score > highscore) {
    highscore = score;
    localStorage.setItem('neon_runner_highscore', highscore);
    document.getElementById('hud-highscore').innerText = highscore + 'm';
    document.getElementById('start-highscore').innerText = highscore + 'm';
  }

  document.getElementById('gameover-score').innerText = score + 'm';
  document.getElementById('gameover-highscore').innerText = highscore + 'm';
  document.getElementById('gameover-screen').classList.remove('hidden');
}

// 8. Inputs & Controls System
const keys = {};

function initInput() {
  // Keyboard listeners
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'Space', ' ', 'w', 's', 'W', 'S'].includes(e.key)) {
      e.preventDefault();
    }
    keys[e.key] = true;

    if (gameState === 'PLAYING') {
      if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') {
        player.jump();
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        player.duck(true);
      }
    } else if (gameState === 'START') {
      if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') {
        SFX.playSelect();
        startGame();
      }
    } else if (gameState === 'GAMEOVER') {
      if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') {
        SFX.playSelect();
        restartGame();
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    if (gameState === 'PLAYING') {
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        player.duck(false);
      }
    }
  });

  // Mobile Touch Action Overrides
  const touchJump = document.getElementById('touch-jump-btn');
  const touchDuck = document.getElementById('touch-duck-btn');
  
  touchJump.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState === 'PLAYING') {
      player.jump();
    } else if (gameState === 'START') {
      SFX.playSelect();
      startGame();
    } else if (gameState === 'GAMEOVER') {
      SFX.playSelect();
      restartGame();
    }
  });

  touchDuck.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState === 'PLAYING') {
      player.duck(true);
    }
  });
  touchDuck.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (gameState === 'PLAYING') {
      player.duck(false);
    }
  });

  // Auto-show mobile overlay strictly on smartphones/tablets, hiding on desktops
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                         || (window.matchMedia("(pointer: coarse)").matches && window.innerWidth < 1024);
  if (isMobileDevice) {
    document.getElementById('mobile-controls-overlay').classList.remove('hidden');
  } else {
    document.getElementById('mobile-controls-overlay').classList.add('hidden');
  }
}

// 9. Core Game Loop logic
let lastTime = 0;
let scoreAccumulator = 0;

function startGame() {
  gameState = 'PLAYING';
  score = 0;
  gameSpeed = BASE_SPEED;
  milestoneCounter = 100;
  obstacles = [];
  player.reset();
  explosion = null;
  
  document.getElementById('hud-score').innerText = '0m';
  document.getElementById('hud-bar').classList.remove('hidden');
  document.getElementById('start-screen').classList.add('hidden');
}

function restartGame() {
  gameState = 'PLAYING';
  score = 0;
  gameSpeed = BASE_SPEED;
  milestoneCounter = 100;
  obstacles = [];
  player.reset();
  explosion = null;
  
  document.getElementById('hud-score').innerText = '0m';
  document.getElementById('gameover-screen').classList.add('hidden');
}

// Click triggers
document.getElementById('start-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  SFX.playSelect();
  startGame();
});

document.getElementById('restart-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  SFX.playSelect();
  restartGame();
});

function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  // 1. Clear Canvas context
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Save context state for screen shake translations
  ctx.save();
  let shakeX = 0;
  let shakeY = 0;
  if (screenShakeTimer > 0) {
    shakeX = (Math.random() - 0.5) * screenShakeIntensity;
    shakeY = (Math.random() - 0.5) * screenShakeIntensity;
    screenShakeTimer--;
  }
  ctx.translate(shakeX, shakeY);

  // 2. Render Parallax sky & watchtowers layers
  for (const bg of parallaxBg) {
    if (gameState === 'PLAYING') {
      bg.update();
    }
    bg.render(bg.offset);
  }

  // 3. Render and update tiled ground block deck
  drawGroundTiles();

  // 4. Update Game State logic
  if (gameState === 'PLAYING') {
    scoreAccumulator += deltaTime * 0.007;
    if (scoreAccumulator >= 1) {
      const meters = Math.floor(scoreAccumulator);
      score += meters;
      scoreAccumulator -= meters;
      
      document.getElementById('hud-score').innerText = score + 'm';

      if (score >= milestoneCounter) {
        SFX.playMilestone();
        milestoneCounter += 100;
      }
    }

    // Speed Progression
    if (gameSpeed < MAX_SPEED) {
      gameSpeed += 0.0022; // dynamic acceleration
    }

    player.update();
    player.draw();
    
    handleObstacles();
  } 
  else if (gameState === 'START') {
    gameSpeed = BASE_SPEED * 0.5;
    player.update();
    player.draw();
  } 
  else if (gameState === 'GAMEOVER') {
    player.update();
    player.draw();
    
    // Draw dead obstacles stationary
    for (const obs of obstacles) {
      obs.draw();
    }

    // Draw Explosion Sprite frame
    if (explosion) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        explosionSheet,
        explosion.frame * 48, 0, 48, 48,
        Math.round(explosion.x - 48), Math.round(explosion.y - 48), 96, 96
      );
      ctx.restore();

      explosion.tick++;
      if (explosion.tick >= 4) {
        explosion.tick = 0;
        explosion.frame++;
        if (explosion.frame >= 6) {
          explosion = null;
        }
      }
    }
  }

  // Restore screen shake translations
  ctx.restore();

  requestAnimationFrame(gameLoop);
}

// Initialize launch bindings
initInput();
requestAnimationFrame(gameLoop);
