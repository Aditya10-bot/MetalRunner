// 2. Setup Variables and Constants
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('game-container');

const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const GROUND_Y = 440;

let gameState = 'START'; // START, PLAYING, GAMEOVER
let gameSpeed = 3.5;
const BASE_SPEED = 3.5;
const MAX_SPEED = 18;

let score = 0;
let highscore = parseInt(localStorage.getItem('neon_runner_highscore')) || 0;
let milestoneCounter = 100;

let screenShakeTimer = 0;
let screenShakeIntensity = 0;
let explosion = null;

function triggerScreenShake(duration = 20, intensity = 8) {
  screenShakeTimer = duration;
  screenShakeIntensity = intensity;
}

// Set high score initial bindings
document.getElementById('start-highscore').innerText = highscore + 'm';
document.getElementById('hud-highscore').innerText = highscore + 'm';
