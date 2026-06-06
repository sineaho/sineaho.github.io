/* ==========================================
   CineAHO Slug Shooter Game Engine
   Custom Platformer Physics & Web Audio Synth
   ========================================== */

// --- DOM Elements ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startOverlay = document.getElementById('start-overlay');
const btnStartGame = document.getElementById('btn-start-game-click');
const btnRestart = document.getElementById('btn-restart-game');
const btnPause = document.getElementById('btn-pause-toggle');
const btnSound = document.getElementById('btn-sound-toggle');

const currentScoreEl = document.getElementById('current-score');
const bestScoreEl = document.getElementById('best-score');
const grenadesCountEl = document.getElementById('grenades-count');
const livesTextEl = document.getElementById('player-lives-text');
const livesHeartsBox = document.getElementById('lives-hearts-box');

const displayStageNumber = document.getElementById('display-stage-number');
const displayStageName = document.getElementById('display-stage-name');
const displayMissionTitle = document.getElementById('display-mission-title');
const displayMissionDesc = document.getElementById('display-mission-desc');

const rescuedCountEl = document.getElementById('display-rescued-count');
const totalCaptivesEl = document.getElementById('display-total-captives');
const rescueProgressEl = document.getElementById('display-rescue-progress');

// Weapon Display
const weaponIconDisplay = document.getElementById('weapon-icon-display');
const weaponNameDisplay = document.getElementById('weapon-name-display');
const weaponAmmoDisplay = document.getElementById('weapon-ammo-display');

// Boss HUD
const bossHud = document.getElementById('boss-hud');
const bossHudName = document.getElementById('boss-hud-name');
const bossHudProgress = document.getElementById('boss-hud-progress');

// Modals
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreEl = document.getElementById('modal-final-score');
const maxStageEl = document.getElementById('modal-max-stage');
const btnRestartModal = document.getElementById('btn-restart-modal-btn');

const stageClearModal = document.getElementById('stage-clear-modal');
const btnNextStage = document.getElementById('btn-next-stage-btn');

const allClearModal = document.getElementById('all-clear-modal');
const allFinalScoreEl = document.getElementById('modal-all-final-score');
const btnAllRestart = document.getElementById('btn-all-restart-btn');

// Theme toggle
const themeToggleBtn = document.getElementById('theme-toggle');
const flashOverlay = document.getElementById('flash-overlay');

// Mobile Controllers
const btnMLeft = document.getElementById('btn-m-left');
const btnMRight = document.getElementById('btn-m-right');
const btnMUp = document.getElementById('btn-m-up');
const btnMDown = document.getElementById('btn-m-down');
const btnMJump = document.getElementById('btn-m-jump');
const btnMFire = document.getElementById('btn-m-fire');
const btnMGrenade = document.getElementById('btn-m-grenade');

// --- Game Config & Constants ---
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;
const GROUND_Y = 400;
const STAGE_LENGTH = 3000;
const GRAVITY = 0.45;

const WEAPONS = {
  pistol: { name: "HANDGUN", ammo: Infinity, icon: "🔫", damage: 1, fireDelay: 250 },
  hmg: { name: "HEAVY MACHINE GUN", ammo: 200, icon: "🔥", damage: 1.2, fireDelay: 90 },
  shotgun: { name: "SHOTGUN", ammo: 30, icon: "💥", damage: 3, fireDelay: 480 },
  rocket: { name: "ROCKET LAUNCHER", ammo: 20, icon: "🚀", damage: 4, fireDelay: 450 }
};

// Stage Details Specs
const STAGE_DETAILS = {
  1: { name: "밀림 저지대", mission: "밀림 전선 돌파", desc: "밀림 속 적 초소를 돌파하고 중간 보스인 헬기와 최종 장갑탱크를 처치하세요.", captives: 4, skyColor: '#1e3a8a', groundColor: '#27272a' },
  2: { name: "사막 유적지", mission: "태양의 유적 탐사", desc: "고대 유적지 모래톱을 가로질러 미라 바이러스 군단과 신형 급강하 전투기를 파괴하세요.", captives: 5, skyColor: '#7c2d12', groundColor: '#f59e0b' },
  3: { name: "눈 덮인 협곡", mission: "눈보라 협곡 철로 엄호", desc: "하얀 설산 속 계곡의 다리를 가로질러 돌격 기갑 메카와 거대 궤도 전함을 무너뜨려야 합니다.", captives: 4, skyColor: '#0f172a', groundColor: '#e2e8f0' },
  4: { name: "군사 화학 기지", mission: "핵심 화학동 소탕", desc: "강철 격벽과 포탑이 즐비한 기지 내부에 잠입해 상공 협공 편대와 주피터 킹 거대 로봇을 처치하세요.", captives: 6, skyColor: '#312e81', groundColor: '#3f3f46' },
  5: { name: "우주선 사령부", mission: "최종 마더쉽 결전", desc: "하늘로 솟아오르는 우주 모선 잔교를 타고 올라가 복제 퀸과 최종 보스 외계 뇌 루트마스를 소탕하세요.", captives: 5, skyColor: '#111827', groundColor: '#4c1d95' }
};

// --- Audio Synthesizer Context ---
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playSound(type) {
  if (!soundEnabled) return;
  initAudio();
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  switch (type) {
    case 'shot':
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;

    case 'shotgun':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.linearRampToValueAtTime(30, now + 0.25);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
      break;

    case 'rocket':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
      break;

    case 'hit':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
      break;

    case 'explode':
      // Bass rumble for grenade/missile explosions
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(20, now + 0.35);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
      break;

    case 'rescue':
      // Saluting captivity chime: "Thank you!"
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
      break;

    case 'siren':
      // Homing boss incoming
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
      break;

    case 'clear':
      // Stage clear tune
      const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
      notes.forEach((freq, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, now + i * 0.1);
        g.gain.setValueAtTime(0.15, now + i * 0.1);
        g.gain.linearRampToValueAtTime(0.001, now + i * 0.1 + 0.22);
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start(now + i * 0.1);
        o.stop(now + i * 0.1 + 0.22);
      });
      break;

    case 'gameover':
      const sadNotes = [392.00, 349.23, 311.13, 261.63];
      sadNotes.forEach((freq, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(freq, now + i * 0.15);
        g.gain.setValueAtTime(0.15, now + i * 0.15);
        g.gain.linearRampToValueAtTime(0.001, now + i * 0.15 + 0.35);
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start(now + i * 0.15);
        o.stop(now + i * 0.15 + 0.35);
      });
      break;
  }
}

// --- Game State Variables ---
let currentStage = parseInt(localStorage.getItem('ss_active_stage') || 1);
let unlockedStage = parseInt(localStorage.getItem('ss_unlocked_stage') || 1);
let score = 0;
let bestScore = parseInt(localStorage.getItem('ss_best_score') || 0);
let lives = 3;
let grenades = 10;
let isPaused = false;
let isStarted = false;
let isGameOverState = false;

// Scrolling Camera
let cameraX = 0;
let cameraLock = false;
let midBossDead = false;
let finalBossSpawned = false;

// Entities Arrays
let player = null;
let platforms = [];
let enemies = [];
let captives = [];
let bullets = [];
let powerups = [];
let particles = [];

// Screen Flash and shake
let flashTime = 0;
let shakeTime = 0;
let shakeIntensity = 0;

// Loop ID
let loopId = null;

// Controller inputs keys
let keys = {
  a: false,
  d: false,
  w: false,
  s: false,
  j: false,
  k: false,
  l: false
};

// Fire delay counter
let lastFireTime = 0;

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  bestScoreEl.textContent = bestScore.toLocaleString();
  loadStageSpecs(currentStage);
  bindUIEvents();
  updateVisitorStats();
  
  // Show starting overlay initially
  startOverlay.style.display = 'flex';
});

// Theme Toggle
function initTheme() {
  const themeIcon = themeToggleBtn.querySelector('i');
  const themeText = themeToggleBtn.querySelector('span');

  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeUI(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    let newTheme = 'dark';
    if (currentTheme === 'dark') {
      newTheme = 'light';
    }
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeUI(newTheme);
  });

  function updateThemeUI(theme) {
    if (theme === 'light') {
      themeIcon.className = 'fa-solid fa-moon';
      themeText.textContent = '다크';
      themeToggleBtn.style.borderColor = 'var(--text-muted)';
    } else {
      themeIcon.className = 'fa-solid fa-sun';
      themeText.textContent = '라이트';
      themeToggleBtn.style.borderColor = 'rgba(255, 255, 255, 0.08)';
    }
  }
}

function loadStageSpecs(stageNum) {
  const spec = STAGE_DETAILS[stageNum];
  displayStageNumber.textContent = `STAGE ${stageNum}`;
  displayStageName.textContent = spec.name;
  displayMissionTitle.textContent = spec.mission;
  displayMissionDesc.textContent = spec.desc;
  totalCaptivesEl.textContent = spec.captives;
}

// Visitor Counter integration
async function updateVisitorStats() {
  try {
    const response = await fetch('/api/visits');
    if (!response.ok) return;
    const visits = await response.json();

    const mainStats = visits['main'] || { total: 0, today: 0, uniqueTotal: 0, uniqueToday: 0 };
    const siteTotalEl = document.getElementById('site-visit-total');
    const siteTodayEl = document.getElementById('site-visit-today');
    const siteUTotalEl = document.getElementById('site-visit-utotal');
    const siteUTodayEl = document.getElementById('site-visit-utoday');

    if (siteTotalEl) siteTotalEl.textContent = mainStats.total.toLocaleString();
    if (siteTodayEl) siteTodayEl.textContent = mainStats.today.toLocaleString();
    if (siteUTotalEl) siteUTotalEl.textContent = mainStats.uniqueTotal.toLocaleString();
    if (siteUTodayEl) siteUTodayEl.textContent = mainStats.uniqueToday.toLocaleString();

    let appsTotal = 0;
    let appsToday = 0;
    let appsUTotal = 0;
    let appsUToday = 0;

    for (const app in visits) {
      if (app === 'main') continue;
      const appData = visits[app];
      appsTotal += appData.total || 0;
      appsToday += appData.today || 0;
      appsUTotal += appData.uniqueTotal || 0;
      appsUToday += appData.uniqueToday || 0;
    }

    const appsTotalEl = document.getElementById('apps-visit-total');
    const appsTodayEl = document.getElementById('apps-visit-today');
    const appsUTotalEl = document.getElementById('apps-visit-utotal');
    const appsUTodayEl = document.getElementById('apps-visit-utoday');

    if (appsTotalEl) appsTotalEl.textContent = appsTotal.toLocaleString();
    if (appsTodayEl) appsTodayEl.textContent = appsToday.toLocaleString();
    if (appsUTotalEl) appsUTotalEl.textContent = appsUTotal.toLocaleString();
    if (appsUTodayEl) appsUTodayEl.textContent = appsUToday.toLocaleString();

  } catch (err) {
    console.error('방문자 수 업데이트 실패:', err);
  }
}

// Draw Hearts
function updateHeartsUI() {
  livesTextEl.textContent = lives;
  livesHeartsBox.innerHTML = '';
  for (let i = 1; i <= 3; i++) {
    const heart = document.createElement('i');
    if (i <= lives) {
      heart.className = 'fa-solid fa-heart text-red';
    } else {
      heart.className = 'fa-solid fa-heart text-muted-heart';
    }
    livesHeartsBox.appendChild(heart);
  }
}

// --- Platform Builder ---
function buildStage(stageNum) {
  platforms = [
    // Default Ground platform spanning full stage length
    { x: 0, y: GROUND_Y, width: STAGE_LENGTH, height: 100 }
  ];

  // Specific platforms per stage
  if (stageNum === 1) {
    platforms.push({ x: 300, y: 300, width: 150, height: 16 });
    platforms.push({ x: 600, y: 240, width: 200, height: 16 });
    platforms.push({ x: 1000, y: 310, width: 180, height: 16 });
    platforms.push({ x: 1800, y: 280, width: 240, height: 16 });
    platforms.push({ x: 2200, y: 220, width: 160, height: 16 });
  } else if (stageNum === 2) {
    // Ruins pillars
    platforms.push({ x: 400, y: 280, width: 120, height: 16 });
    platforms.push({ x: 550, y: 190, width: 120, height: 16 });
    platforms.push({ x: 900, y: 300, width: 220, height: 16 });
    platforms.push({ x: 1750, y: 250, width: 180, height: 16 });
    platforms.push({ x: 2100, y: 280, width: 120, height: 16 });
    platforms.push({ x: 2300, y: 200, width: 140, height: 16 });
  } else if (stageNum === 3) {
    // Snowy ledges
    platforms.push({ x: 350, y: 310, width: 180, height: 16 });
    platforms.push({ x: 700, y: 260, width: 150, height: 16 });
    platforms.push({ x: 1050, y: 210, width: 150, height: 16 });
    platforms.push({ x: 1850, y: 290, width: 200, height: 16 });
    platforms.push({ x: 2150, y: 230, width: 180, height: 16 });
  } else if (stageNum === 4) {
    // Base bridges
    platforms.push({ x: 300, y: 280, width: 140, height: 16 });
    platforms.push({ x: 500, y: 280, width: 140, height: 16 });
    platforms.push({ x: 800, y: 220, width: 250, height: 16 });
    platforms.push({ x: 1900, y: 300, width: 160, height: 16 });
    platforms.push({ x: 2250, y: 250, width: 160, height: 16 });
  } else if (stageNum === 5) {
    // Spaceship scaffolds
    platforms.push({ x: 400, y: 320, width: 200, height: 16 });
    platforms.push({ x: 800, y: 250, width: 200, height: 16 });
    platforms.push({ x: 1100, y: 180, width: 150, height: 16 });
    platforms.push({ x: 1800, y: 310, width: 250, height: 16 });
    platforms.push({ x: 2200, y: 240, width: 200, height: 16 });
  }

  // Rescuable Captives positions
  captives = [];
  const spec = STAGE_DETAILS[stageNum];
  const captiveX = [500, 1100, 1900, 2300, 2500, 2800];
  for (let i = 0; i < spec.captives; i++) {
    captives.push({
      x: captiveX[i % captiveX.length] + (Math.random() - 0.5) * 80,
      y: GROUND_Y - 32,
      width: 24,
      height: 32,
      isRescued: false,
      saluteTime: 0
    });
  }

  // Prepopulate standard enemies
  enemies = [];
  const enemyX = [450, 750, 950, 1200, 1850, 2100, 2450];
  enemyX.forEach((ex, idx) => {
    if (ex < STAGE_LENGTH) {
      // 1 Shield soldier, others normal infantry
      enemies.push({
        x: ex,
        y: GROUND_Y - 36,
        vx: -0.6 - (stageNum * 0.05),
        width: 26,
        height: 36,
        hp: idx % 3 === 0 ? 3 : 1, // Shield soldier has 3 hp
        isShield: idx % 3 === 0,
        fireDelay: Math.random() * 2000 + 1000,
        lastFire: 0,
        type: 'infantry'
      });
    }
  });

  // Spawn tank (heavy unit) in Stage 1, 3, 5
  if (stageNum % 2 !== 0) {
    enemies.push({
      x: 1050,
      y: GROUND_Y - 50,
      vx: -0.4,
      width: 60,
      height: 50,
      hp: 12,
      fireDelay: 3200,
      lastFire: 0,
      type: 'tank'
    });
  }

  // Spawn patrol heli in Stage 2, 4
  if (stageNum % 2 === 0) {
    enemies.push({
      x: 850,
      y: 150,
      vx: -0.8,
      width: 46,
      height: 36,
      hp: 8,
      fireDelay: 2500,
      lastFire: 0,
      type: 'heli'
    });
  }
}

// Reset Level / Game states
function resetGame(fullReset = true) {
  isStarted = false;
  isPaused = false;
  isGameOverState = false;

  if (fullReset) {
    score = 0;
    lives = 3;
    grenades = 10;
    currentScoreEl.textContent = '0';
  }

  grenadesCountEl.textContent = grenades;
  updateHeartsUI();

  // Reset Camera
  cameraX = 0;
  cameraLock = false;
  midBossDead = false;
  finalBossSpawned = false;

  // Reset boss HUD
  bossHud.style.display = 'none';

  // Spawn Player
  player = {
    x: 80,
    y: GROUND_Y - 40,
    vx: 0,
    vy: 0,
    width: 28,
    height: 40,
    isGrounded: true,
    isCrouching: false,
    invincibleTime: 0,
    facing: 'right',
    aim: 'front', // 'front', 'up', 'down'
    weapon: WEAPONS.pistol,
    shootCooldown: 0
  };

  // Weapon HUD sync
  updateWeaponHUD();

  // Reset arrays
  bullets = [];
  powerups = [];
  particles = [];

  // Build stage specs
  buildStage(currentStage);

  // Rescued statistics
  updateRescuedUI();

  // Show starting overlay
  startOverlay.style.display = 'flex';
}

function updateWeaponHUD() {
  weaponIconDisplay.textContent = player.weapon.icon;
  weaponNameDisplay.textContent = player.weapon.name;
  weaponAmmoDisplay.textContent = player.weapon.ammo === Infinity ? 'INFINITY' : player.weapon.ammo;
}

function updateRescuedUI() {
  const rescuedCount = captives.filter(c => c.isRescued).length;
  rescuedCountEl.textContent = rescuedCount;
  const spec = STAGE_DETAILS[currentStage];
  const pct = (rescuedCount / spec.captives) * 100;
  rescueProgressEl.style.width = `${pct}%`;
}

// --- Spawn Particle Sparks & Debris ---
function spawnExplosion(x, y, scale = 1.0) {
  playSound('explode');
  flashScreen(100);
  shakeScreen(20, 8 * scale);

  // Big fire ring
  particles.push({
    x: x,
    y: y,
    radius: 15 * scale,
    maxRadius: 60 * scale,
    isRing: true,
    color: '#f97316',
    alpha: 1,
    decay: 0.05
  });

  // Multiple sparks
  const count = 15 * scale;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 8 * scale,
      vy: (Math.random() - 0.5) * 8 * scale - 2,
      radius: Math.random() * 4 * scale + 2,
      color: Math.random() > 0.4 ? '#f97316' : '#fbbf24',
      alpha: 1.0,
      decay: Math.random() * 0.04 + 0.02
    });
  }
}

function flashScreen(duration) {
  flashOverlay.style.opacity = '0.35';
  flashTime = duration;
}

function shakeScreen(duration, intensity) {
  shakeTime = duration;
  shakeIntensity = intensity;
}

// --- Spawning weapon drops from prisoners ---
function spawnPowerUp(x, y) {
  const types = [
    { type: 'hmg', char: 'H', color: '#fbbf24' },      // HMG
    { type: 'shotgun', char: 'S', color: '#f43f5e' },  // Shotgun
    { type: 'rocket', char: 'R', color: '#3b82f6' },   // Rocket Launcher
    { type: 'grenade', char: 'G', color: '#10b981' }   // Grenades refill
  ];

  // Weighted random drop selection
  const rand = Math.random();
  let selected = types[0]; // HMG (default)
  if (rand < 0.45) selected = types[0];      // HMG (45%)
  else if (rand < 0.70) selected = types[1]; // Shotgun (25%)
  else if (rand < 0.88) selected = types[2]; // Rocket (18%)
  else selected = types[3];                  // Grenades (12%)

  powerups.push({
    x: x,
    y: y,
    vx: 0,
    vy: -3.5, // pop up slightly
    width: 24,
    height: 24,
    type: selected.type,
    char: selected.char,
    color: selected.color
  });
}

// Draw Parallax Scrolling Backgrounds
function drawBackground() {
  const skyColor = STAGE_DETAILS[currentStage].skyColor;
  ctx.fillStyle = skyColor;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Simple procedurally drawn background elements based on cameraX
  ctx.save();
  
  // Layer 1: Mountains / Silhouette pyramids (Scrolling speed * 0.15)
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  const layer1X = -(cameraX * 0.15) % CANVAS_WIDTH;
  
  ctx.beginPath();
  if (currentStage === 2) {
    // Pyramids for Desert Stage 2
    ctx.moveTo(layer1X + 100, GROUND_Y);
    ctx.lineTo(layer1X + 220, GROUND_Y - 140);
    ctx.lineTo(layer1X + 340, GROUND_Y);
    
    ctx.moveTo(layer1X + 400, GROUND_Y);
    ctx.lineTo(layer1X + 500, GROUND_Y - 100);
    ctx.lineTo(layer1X + 600, GROUND_Y);
  } else {
    // Mountains for standard stages
    ctx.moveTo(layer1X, GROUND_Y);
    ctx.lineTo(layer1X + 150, GROUND_Y - 120);
    ctx.lineTo(layer1X + 300, GROUND_Y - 40);
    ctx.lineTo(layer1X + 450, GROUND_Y - 150);
    ctx.lineTo(layer1X + 600, GROUND_Y - 60);
    ctx.lineTo(layer1X + 640, GROUND_Y);
  }
  ctx.fill();

  // Layer 2: Trees / Columns / Ruins (Scrolling speed * 0.45)
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  const layer2X = -(cameraX * 0.45) % CANVAS_WIDTH;
  
  for (let i = 0; i < 8; i++) {
    const xPos = layer2X + i * 100;
    if (currentStage === 2) {
      // Ancient pillars ruins for Stage 2
      ctx.fillRect(xPos + 10, GROUND_Y - 80, 16, 80);
      ctx.fillRect(xPos + 6, GROUND_Y - 90, 24, 10);
    } else if (currentStage === 3) {
      // Snow pines
      ctx.beginPath();
      ctx.moveTo(xPos + 20, GROUND_Y - 90);
      ctx.lineTo(xPos + 5, GROUND_Y - 30);
      ctx.lineTo(xPos + 35, GROUND_Y - 30);
      ctx.fill();
    } else {
      // Forest trees
      ctx.beginPath();
      ctx.arc(xPos + 20, GROUND_Y - 60, 20, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillRect(xPos + 18, GROUND_Y - 40, 4, 40);
    }
  }

  ctx.restore();
}

// --- Player Fire bullet system ---
function playerFire() {
  if (player.shootCooldown > 0) return;
  
  playSound('shot');
  player.shootCooldown = player.weapon.fireDelay;

  // Calculate firing coordinates based on crouching and aim dir
  let fireX = player.x + (player.facing === 'right' ? player.width : 0);
  let fireY = player.y + (player.isCrouching ? player.height * 0.6 : player.height * 0.35);

  let bulletVx = player.facing === 'right' ? 8 : -8;
  let bulletVy = 0;

  if (player.aim === 'up') {
    bulletVx = 0;
    bulletVy = -8;
    fireX = player.x + player.width / 2;
    fireY = player.y - 4;
  }

  // Heavy Machine Gun (HMG)
  if (player.weapon === WEAPONS.hmg) {
    bullets.push({
      x: fireX,
      y: fireY,
      vx: bulletVx,
      vy: bulletVy,
      radius: 4,
      color: '#f59e0b',
      isEnemy: false,
      damage: player.weapon.damage
    });
    player.weapon.ammo--;
  }
  // Shotgun (Spread shoot)
  else if (player.weapon === WEAPONS.shotgun) {
    playSound('shotgun');
    // Fire 5 bullets spreading out
    const spread = [-0.18, -0.09, 0, 0.09, 0.18];
    spread.forEach(angle => {
      // Rotational matrix transform
      let vx = bulletVx * Math.cos(angle) - bulletVy * Math.sin(angle);
      let vy = bulletVx * Math.sin(angle) + bulletVy * Math.cos(angle);
      
      bullets.push({
        x: fireX,
        y: fireY,
        vx: vx * 0.9,
        vy: vy * 0.9,
        radius: 5,
        color: '#ef4444',
        isEnemy: false,
        damage: player.weapon.damage
      });
    });
    player.weapon.ammo--;
  }
  // Rocket Launcher (RL) - Homing rocket
  else if (player.weapon === WEAPONS.rocket) {
    playSound('rocket');
    bullets.push({
      x: fireX,
      y: fireY,
      vx: bulletVx * 0.8,
      vy: bulletVy * 0.8,
      radius: 6,
      color: '#3b82f6',
      isEnemy: false,
      isRocket: true,
      damage: player.weapon.damage
    });
    player.weapon.ammo--;
  }
  // Default pistol
  else {
    bullets.push({
      x: fireX,
      y: fireY,
      vx: bulletVx,
      vy: bulletVy,
      radius: 3,
      color: '#ffffff',
      isEnemy: false,
      damage: player.weapon.damage
    });
  }

  // Deplete ammo and revert to pistol
  if (player.weapon.ammo <= 0) {
    player.weapon = WEAPONS.pistol;
  }
  
  updateWeaponHUD();

  // Muzzle flash particles
  for (let i = 0; i < 3; i++) {
    particles.push({
      x: fireX,
      y: fireY,
      vx: bulletVx * 0.15 + (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      radius: Math.random() * 2 + 1,
      color: '#fbbf24',
      alpha: 1,
      decay: 0.15
    });
  }
}

// Firing Grenade
function throwGrenade() {
  if (grenades <= 0) return;
  grenades--;
  grenadesCountEl.textContent = grenades;

  bullets.push({
    x: player.x + (player.facing === 'right' ? player.width : 0),
    y: player.y + player.height * 0.35,
    vx: player.facing === 'right' ? 5 : -5,
    vy: -5.5, // arch trajectory
    radius: 7,
    color: '#10b981',
    isEnemy: false,
    isGrenade: true,
    damage: 8
  });
}

// Spawn Boss Siren alarm beeps
let bossAlarmTimer = 0;
let alarmBeeps = 0;

// Trigger Boss fights
function spawnMidBoss() {
  cameraLock = true;
  playSound('siren');
  
  // Mid boss spec
  let bossHp = 25 + (currentStage * 10);
  let name = "";
  
  switch (currentStage) {
    case 1: name = "ARMORED HELICOPTER"; break;
    case 2: name = "MUMMY WORM"; break;
    case 3: name = "MECH WALKER"; break;
    case 4: name = "TWIN HELI SQUAD"; break;
    case 5: name = "ALIEN QUEEN CLONE"; break;
  }

  enemies.push({
    x: cameraX + CANVAS_WIDTH + 80,
    y: currentStage === 2 ? GROUND_Y - 32 : 120, // Worm stands on ground
    vx: -1.2,
    vy: 0,
    width: 70,
    height: 60,
    hp: bossHp,
    maxHp: bossHp,
    fireDelay: 2200,
    lastFire: 0,
    isMidBoss: true,
    type: 'midboss',
    name: name,
    stateTimer: 0
  });

  // Display boss HUD
  bossHud.style.display = 'block';
  bossHudName.textContent = `MID-BOSS: ${name}`;
  bossHudProgress.style.width = '100%';
}

function spawnFinalBoss() {
  cameraLock = true;
  finalBossSpawned = true;
  playSound('siren');

  let bossHp = 60 + (currentStage * 20);
  let name = "";

  switch (currentStage) {
    case 1: name = "SV-001 IRON NOKANA"; break;
    case 2: name = "PHARAONIC BATTLE JET"; break;
    case 3: name = "BIG SHIEE (NAVAL TANK)"; break;
    case 4: name = "JUPITER KING (GIANT MECH)"; break;
    case 5: name = "ROOTMARS FINAL BRAIN"; break;
  }

  enemies.push({
    x: cameraX + CANVAS_WIDTH + 120,
    y: currentStage === 2 ? 80 : GROUND_Y - 90, // Pharaoh flies, others ground
    vx: -0.8,
    vy: 0,
    width: 120,
    height: 90,
    hp: bossHp,
    maxHp: bossHp,
    fireDelay: 3500,
    lastFire: 0,
    isFinalBoss: true,
    type: 'finalboss',
    name: name,
    stateTimer: 0
  });

  // Display boss HUD
  bossHud.style.display = 'block';
  bossHudName.textContent = `FINAL BOSS: ${name}`;
  bossHudProgress.style.width = '100%';
}

// --- Frame Updates ---
function update(deltaTime) {
  if (!isStarted || isPaused || isGameOverState) return;

  // Flash decay
  if (flashTime > 0) {
    flashTime -= deltaTime;
    flashOverlay.style.opacity = Math.max(0, flashTime / 300 * 0.35);
  }

  // Cooldown timers
  if (player.shootCooldown > 0) {
    player.shootCooldown -= deltaTime;
  }
  if (player.invincibleTime > 0) {
    player.invincibleTime -= deltaTime;
  }

  // 1. Move Player
  if (keys.a) {
    player.vx = -3.2;
    player.facing = 'left';
  } else if (keys.d) {
    player.vx = 3.2;
    player.facing = 'right';
  } else {
    player.vx = 0;
  }

  // Aim Direction
  if (keys.w) {
    player.aim = 'up';
  } else {
    player.aim = 'front';
  }

  // Crouching
  if (keys.s && player.isGrounded) {
    player.isCrouching = true;
    player.vx = 0; // cannot move while crouching
  } else {
    player.isCrouching = false;
  }

  // Apply Gravity
  player.vy += GRAVITY;
  player.y += player.vy;
  player.x += player.vx;

  // 2. Camera Scroll & Locking
  if (!cameraLock) {
    if (player.x > cameraX + CANVAS_WIDTH * 0.45) {
      cameraX = player.x - CANVAS_WIDTH * 0.45;
    }
  }

  // Clamps camera limits
  if (cameraX < 0) cameraX = 0;
  if (cameraX > STAGE_LENGTH - CANVAS_WIDTH) cameraX = STAGE_LENGTH - CANVAS_WIDTH;

  // Keep player inside camera frame boundaries
  if (player.x < cameraX) player.x = cameraX;
  if (player.x + player.width > cameraX + CANVAS_WIDTH) {
    player.x = cameraX + CANVAS_WIDTH - player.width;
  }

  // Trigger mid boss locks at x = 1350px
  if (!midBossDead && !cameraLock && player.x >= 1350) {
    spawnMidBoss();
  }

  // Trigger final boss locks at x = 2550px
  if (midBossDead && !finalBossSpawned && !cameraLock && player.x >= 2550) {
    spawnFinalBoss();
  }

  // 3. Platform collisions
  let onAnyPlatform = false;

  platforms.forEach(plat => {
    // Only collide while falling down
    if (player.vy >= 0 &&
        player.x + player.width > plat.x &&
        player.x < plat.x + plat.width &&
        player.y + player.height >= plat.y &&
        player.y + player.height - player.vy <= plat.y + 8) {
      
      player.y = plat.y - player.height;
      player.vy = 0;
      player.isGrounded = true;
      onAnyPlatform = true;
    }
  });

  if (!onAnyPlatform) {
    player.isGrounded = false;
  }

  // 4. Update Bullets (bullets, rockets, grenades)
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    
    if (b.isGrenade) {
      // Grenade physics (gravity + bounce)
      b.vy += GRAVITY * 0.8;
      b.x += b.vx;
      b.y += b.vy;

      // Bounce off ground
      if (b.y + b.radius >= GROUND_Y) {
        b.y = GROUND_Y - b.radius;
        b.vy = -b.vy * 0.5; // bounce decay
        b.vx *= 0.8;
      }

      // Timer detonates grenade
      b.fuse = (b.fuse || 0) + deltaTime;
      
      // Detonate immediately on enemy hit
      let exploded = false;
      if (b.fuse > 1200) {
        exploded = true;
      } else {
        // overlap check with enemies
        for (let j = 0; j < enemies.length; j++) {
          const enemy = enemies[j];
          if (enemy.hp > 0 &&
              b.x >= enemy.x && b.x <= enemy.x + enemy.width &&
              b.y >= enemy.y && b.y <= enemy.y + enemy.height) {
            exploded = true;
            break;
          }
        }
      }

      if (exploded) {
        spawnExplosion(b.x, b.y, 1.2);
        
        // AOE Damage
        enemies.forEach(enemy => {
          if (enemy.hp > 0) {
            const dx = (enemy.x + enemy.width / 2) - b.x;
            const dy = (enemy.y + enemy.height / 2) - b.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 80) {
              enemy.hp -= b.damage;
              if (enemy.hp <= 0) {
                score += enemy.isFinalBoss ? 5000 : (enemy.isMidBoss ? 1500 : 100);
                currentScoreEl.textContent = score.toLocaleString();
              }
            }
          }
        });
        bullets.splice(i, 1);
        continue;
      }
    }
    else if (b.isRocket) {
      // Homing Rocket logic
      b.x += b.vx;
      b.y += b.vy;

      // Seek closest active enemy/boss
      let target = null;
      let minDist = 9999;
      enemies.forEach(enemy => {
        if (enemy.hp > 0) {
          const dx = enemy.x + enemy.width/2 - b.x;
          const dy = enemy.y + enemy.height/2 - b.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < minDist) {
            minDist = dist;
            target = enemy;
          }
        }
      });

      if (target) {
        const tx = target.x + target.width/2;
        const ty = target.y + target.height/2;
        const angle = Math.atan2(ty - b.y, tx - b.x);
        
        // Slowly steer velocity vector towards target
        const currentAngle = Math.atan2(b.vy, b.vx);
        let nextAngle = currentAngle + (angle - currentAngle) * 0.12;

        const speed = Math.sqrt(b.vx*b.vx + b.vy*b.vy);
        b.vx = speed * Math.cos(nextAngle);
        b.vy = speed * Math.sin(nextAngle);
      }

      // Particle smoke trail
      if (Math.random() < 0.3) {
        particles.push({
          x: b.x - b.vx * 1.5,
          y: b.y - b.vy * 1.5,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 3 + 2,
          color: 'rgba(255, 255, 255, 0.4)',
          alpha: 0.8,
          decay: 0.05
        });
      }

      // Check hit
      let hit = false;
      for (let j = 0; j < enemies.length; j++) {
        const enemy = enemies[j];
        if (enemy.hp > 0 &&
            b.x + b.radius >= enemy.x && b.x - b.radius <= enemy.x + enemy.width &&
            b.y + b.radius >= enemy.y && b.y - b.radius <= enemy.y + enemy.height) {
          
          enemy.hp -= b.damage;
          hit = true;
          
          spawnExplosion(b.x, b.y, 0.8);

          if (enemy.hp <= 0) {
            score += enemy.isFinalBoss ? 5000 : (enemy.isMidBoss ? 1500 : 100);
            currentScoreEl.textContent = score.toLocaleString();
          }
          break;
        }
      }

      if (hit || b.x < cameraX || b.x > cameraX + CANVAS_WIDTH || b.y < 0 || b.y > CANVAS_HEIGHT) {
        bullets.splice(i, 1);
        continue;
      }
    }
    else {
      // Standard linear bullets (Player & Enemy bullets)
      b.x += b.vx;
      b.y += b.vy;

      let hit = false;

      if (!b.isEnemy) {
        // Player bullet hits enemies
        for (let j = 0; j < enemies.length; j++) {
          const enemy = enemies[j];
          if (enemy.hp > 0 &&
              b.x >= enemy.x && b.x <= enemy.x + enemy.width &&
              b.y >= enemy.y && b.y <= enemy.y + enemy.height) {
            
            hit = true;
            
            // Shield blocks player bullets from front
            if (enemy.isShield && b.vx < 0) {
              playSound('hit');
              spawnParticles(b.x, b.y, '#94a3b8', 4); // shield sparks
            } else {
              enemy.hp -= b.damage;
              playSound('hit');
              spawnParticles(b.x, b.y, '#f87171', 3);
              
              if (enemy.hp <= 0) {
                playSound('break');
                spawnExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.isFinalBoss ? 1.6 : (enemy.isMidBoss ? 1.2 : 0.6));
                
                score += enemy.isFinalBoss ? 5000 : (enemy.isMidBoss ? 1500 : 100);
                currentScoreEl.textContent = score.toLocaleString();
              }
            }
            break;
          }
        }
      } else {
        // Enemy bullet hits player
        if (player.invincibleTime <= 0 &&
            b.x >= player.x && b.x <= player.x + player.width &&
            b.y >= player.y && b.y <= player.y + player.height) {
          
          hit = true;
          playerDamage();
        }
      }

      // Drop out
      if (hit || b.x < cameraX - 50 || b.x > cameraX + CANVAS_WIDTH + 50 || b.y < -50 || b.y > CANVAS_HEIGHT + 50) {
        bullets.splice(i, 1);
      }
    }
  }

  // 5. Update Enemies AI
  const now = Date.now();
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    if (enemy.hp <= 0) {
      if (enemy.isMidBoss) {
        midBossDead = true;
        cameraLock = false; // release scroll lock
        bossHud.style.display = 'none';
      }
      if (enemy.isFinalBoss) {
        triggerStageClear();
      }
      enemies.splice(i, 1);
      continue;
    }

    // Mid-Boss Actions
    if (enemy.isMidBoss) {
      // Entry slide in
      if (enemy.x > cameraX + CANVAS_WIDTH * 0.7) {
        enemy.x += enemy.vx;
      } else {
        // Float movement
        enemy.stateTimer += deltaTime;
        enemy.y = 120 + Math.sin(enemy.stateTimer * 0.002) * 40;
        
        // Sync boss HUD
        const hpPct = (enemy.hp / enemy.maxHp) * 100;
        bossHudProgress.style.width = `${hpPct}%`;

        // Shoot bullets
        if (now - enemy.lastFire > enemy.fireDelay) {
          enemy.lastFire = now;
          playSound('shot');
          
          // Triple bullets sweep down towards player
          const angleToPlayer = Math.atan2(player.y - enemy.y, player.x - enemy.x);
          const spread = [-0.15, 0, 0.15];
          spread.forEach(sa => {
            bullets.push({
              x: enemy.x,
              y: enemy.y + 30,
              vx: 5.0 * Math.cos(angleToPlayer + sa),
              vy: 5.0 * Math.sin(angleToPlayer + sa),
              radius: 4,
              color: '#fbbf24',
              isEnemy: true,
              damage: 1
            });
          });
        }
      }
      continue;
    }

    // Final Boss Actions
    if (enemy.isFinalBoss) {
      // Entry slide in
      if (enemy.x > cameraX + CANVAS_WIDTH * 0.65) {
        enemy.x += enemy.vx;
      } else {
        // boss active attack routines
        enemy.stateTimer += deltaTime;
        
        // Sync boss HUD
        const hpPct = (enemy.hp / enemy.maxHp) * 100;
        bossHudProgress.style.width = `${hpPct}%`;

        // Shoot routines
        if (now - enemy.lastFire > enemy.fireDelay) {
          enemy.lastFire = now;
          playSound('rocket');
          
          // Heavy rockets or bullet sweep depending on Stage
          if (currentStage === 1) {
            // SV-001 Nokana: Heavy artillery shell + fire jet
            bullets.push({
              x: enemy.x + 20,
              y: enemy.y + 20,
              vx: -5.5,
              vy: -4.0, // arch
              radius: 8,
              color: '#f97316',
              isEnemy: true,
              isGrenade: true,
              damage: 1
            });
          } else if (currentStage === 2) {
            // Pharaoh Jet: Spawns falling columns
            bullets.push({
              x: player.x + (Math.random() - 0.5) * 80,
              y: 50,
              vx: 0,
              vy: 4.5,
              radius: 10,
              color: '#a855f7',
              isEnemy: true,
              damage: 1
            });
          } else {
            // Standard heavy sweep
            for (let k = 0; k < 4; k++) {
              bullets.push({
                x: enemy.x + 10,
                y: enemy.y + 40,
                vx: -4.8,
                vy: -2.0 + k * 1.5,
                radius: 4,
                color: '#ef4444',
                isEnemy: true,
                damage: 1
              });
            }
          }
        }
      }
      continue;
    }

    // Standard Enemies AI
    // Patrol walk
    enemy.x += enemy.vx;

    // Turn at platform borders
    if (enemy.x < cameraX || enemy.x > cameraX + CANVAS_WIDTH + 150) {
      enemy.vx = -enemy.vx;
    }

    // Soldier fires gun
    if (enemy.type === 'infantry') {
      if (now - enemy.lastFire > enemy.fireDelay) {
        enemy.lastFire = now;
        
        // Aim direction to player
        if (Math.abs(player.x - enemy.x) < 320) {
          playSound('shot');
          bullets.push({
            x: enemy.x + (enemy.vx < 0 ? 0 : enemy.width),
            y: enemy.y + 12,
            vx: player.x > enemy.x ? 4.5 : -4.5,
            vy: 0,
            radius: 3,
            color: '#fbbf24',
            isEnemy: true,
            damage: 1
          });
        }
      }
    }
    // Tank heavy fire
    else if (enemy.type === 'tank') {
      if (now - enemy.lastFire > enemy.fireDelay) {
        enemy.lastFire = now;
        playSound('rocket');
        bullets.push({
          x: enemy.x,
          y: enemy.y + 16,
          vx: -5.0,
          vy: -2.0, // arching tank shell
          radius: 6,
          color: '#fbbf24',
          isEnemy: true,
          damage: 1
        });
      }
    }
  }

  // 6. Rescuing captives
  captives.forEach(cap => {
    if (cap.isRescued) {
      if (cap.saluteTime > 0) {
        cap.saluteTime -= deltaTime;
        // running away after salute
        cap.x -= 2.0; 
      }
      return;
    }

    // overlap with player
    if (player.x + player.width >= cap.x &&
        player.x <= cap.x + cap.width &&
        player.y + player.height >= cap.y &&
        player.y <= cap.y + cap.height) {
      
      cap.isRescued = true;
      cap.saluteTime = 2000; // salute for 2 seconds
      
      playSound('rescue');
      score += 500;
      currentScoreEl.textContent = score.toLocaleString();

      updateRescuedUI();
      
      // Drop HMG/Shotgun items
      spawnPowerUp(cap.x, cap.y - 10);
    }
  });

  // 7. Update Falling Power-ups
  for (let i = powerups.length - 1; i >= 0; i--) {
    const item = powerups[i];
    item.vy += 0.15; // light gravity fall
    item.y += item.vy;
    item.x += item.vx;

    // bounce off ground
    if (item.y + item.height >= GROUND_Y) {
      item.y = GROUND_Y - item.height;
      item.vy = 0;
      item.vx = 0;
    }

    // overlap with player
    if (player.x + player.width >= item.x &&
        player.x <= item.x + item.width &&
        player.y + player.height >= item.y &&
        player.y <= item.y + item.height) {
      
      // activate weapon HMG, SG, RL
      if (item.type === 'grenade') {
        grenades = Math.min(10, grenades + 5);
        grenadesCountEl.textContent = grenades;
        playSound('powerup');
      } else {
        player.weapon = WEAPONS[item.type];
        playSound('powerup');
        updateWeaponHUD();
      }

      powerups.splice(i, 1);
    }
  }

  // 8. Update Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    if (p.isRing) {
      p.radius += 2.5;
      p.alpha -= p.decay;
      if (p.alpha <= 0) particles.splice(i, 1);
    } else {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) particles.splice(i, 1);
    }
  }

  // Shake screen decay
  if (shakeTime > 0) {
    shakeTime--;
  }

  // Respawn player if fell down (safety)
  if (player.y > CANVAS_HEIGHT) {
    playerDamage();
    player.x = cameraX + 80;
    player.y = GROUND_Y - 80;
    player.vy = 0;
  }
}

// Player damage
function playerDamage() {
  if (player.invincibleTime > 0) return;

  lives--;
  playSound('hit');
  flashScreen(150);
  shakeScreen(15, 8);
  updateHeartsUI();

  if (lives <= 0) {
    triggerGameOver();
  } else {
    // grant temporary invincibility
    player.invincibleTime = 2000; // 2 seconds
    // Revert weapon
    player.weapon = WEAPONS.pistol;
    updateWeaponHUD();
  }
}

// --- Render Canvas Elements ---
function draw() {
  // Draw parallax sky and mountains
  drawBackground();

  // Draw scrolling items/entities
  ctx.save();
  
  // Apply shake
  if (shakeTime > 0) {
    const dx = (Math.random() - 0.5) * shakeIntensity;
    const dy = (Math.random() - 0.5) * shakeIntensity;
    ctx.translate(dx, dy);
  }

  // Shift coordinates based on camera scroll
  ctx.translate(-cameraX, 0);

  // Draw Ground platform
  ctx.fillStyle = STAGE_DETAILS[currentStage].groundColor;
  ctx.fillRect(0, GROUND_Y, STAGE_LENGTH, 100);

  // Draw other platforms
  platforms.forEach(plat => {
    if (plat.y === GROUND_Y) return; // ground is drawn above
    
    // Glassmorphic floating ledges
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 4);
    ctx.fill();
    ctx.stroke();
  });

  // Draw Captives
  captives.forEach(cap => {
    ctx.fillStyle = cap.isRescued ? '#3b82f6' : '#ea580c';
    ctx.fillRect(cap.x, cap.y, cap.width, cap.height);
    
    // Captive head/hair (yellow retro tied up look)
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(cap.x + cap.width/2, cap.y - 4, 8, 0, 2 * Math.PI);
    ctx.fill();

    // Rope lines if tied
    if (!cap.isRescued) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cap.x, cap.y + 10);
      ctx.lineTo(cap.x + cap.width, cap.y + 10);
      ctx.moveTo(cap.x, cap.y + 20);
      ctx.lineTo(cap.x + cap.width, cap.y + 20);
      ctx.stroke();
    } else {
      // Salute label or salute sign
      ctx.fillStyle = '#38bdf8';
      ctx.font = '700 8px Outfit';
      ctx.fillText('THANK YOU!', cap.x - 8, cap.y - 16);
    }
  });

  // Draw Powerups items
  powerups.forEach(item => {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = item.color;
    ctx.fillStyle = item.color;
    
    // Box shape
    ctx.fillRect(item.x, item.y, item.width, item.height);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(item.x, item.y, item.width, item.height);
    
    // Text symbol
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 12px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.char, item.x + item.width/2, item.y + item.height/2);
    ctx.restore();
  });

  // Draw Bullets & Grenades
  bullets.forEach(b => {
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = b.color;
    ctx.fillStyle = b.color;
    
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  });

  // Draw Particles
  particles.forEach(p => {
    ctx.save();
    if (p.isRing) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
      ctx.strokeStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.lineWidth = 3;
      ctx.stroke();
    } else {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.restore();
  });

  // Draw Enemies (Soldiers, Helis, Tanks)
  enemies.forEach(enemy => {
    if (enemy.hp <= 0) return;

    if (enemy.type === 'infantry') {
      // Draw soldier body
      ctx.fillStyle = enemy.isShield ? '#64748b' : '#15803d'; // shield vs green infantry
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

      // Soldier helmet
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.arc(enemy.x + enemy.width/2, enemy.y, 8, 0, 2 * Math.PI);
      ctx.fill();

      // Draw shield board
      if (enemy.isShield) {
        ctx.fillStyle = '#475569';
        ctx.fillRect(enemy.x - 4, enemy.y + 4, 8, enemy.height - 4);
      }
    }
    else if (enemy.type === 'tank') {
      // Draw Tank treads & body
      ctx.fillStyle = '#3f3f46';
      ctx.fillRect(enemy.x, enemy.y + 25, enemy.width, 25); // base
      ctx.fillStyle = '#27272a';
      ctx.fillRect(enemy.x + 10, enemy.y + 5, enemy.width - 20, 20); // turret

      // Cannon barrel
      ctx.fillStyle = '#52525b';
      ctx.fillRect(enemy.x - 20, enemy.y + 12, 25, 8);
    }
    else if (enemy.type === 'heli') {
      // Draw Helicopter body
      ctx.fillStyle = '#065f46';
      ctx.beginPath();
      ctx.ellipse(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.width/2, enemy.height/2, 0, 0, 2*Math.PI);
      ctx.fill();

      // Rotors
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(enemy.x - 10, enemy.y);
      ctx.lineTo(enemy.x + enemy.width + 10, enemy.y);
      ctx.stroke();
    }
    else if (enemy.type === 'midboss' || enemy.type === 'finalboss') {
      // Draw massive Boss sprite bounds
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      
      // Metal metallic outlines
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 3;
      ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);

      // Warning text flashing on boss
      if (Math.floor(enemy.stateTimer / 250) % 2 === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 10px Outfit';
        ctx.fillText('TARGET', enemy.x + 8, enemy.y + 20);
      }
    }
  });

  // Draw Player
  if (player.invincibleTime <= 0 || Math.floor(player.invincibleTime / 100) % 2 === 0) {
    ctx.save();
    
    // Player body
    ctx.fillStyle = '#fbbf24'; // yellow vest
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Player Head/bandana
    ctx.fillStyle = '#f43f5e'; // red bandana
    ctx.beginPath();
    ctx.arc(player.x + player.width/2, player.y - 2, 7, 0, 2 * Math.PI);
    ctx.fill();

    // Aim direction visual indicator lines
    ctx.fillStyle = '#ffffff';
    let gunX = player.x + (player.facing === 'right' ? player.width : 0);
    let gunY = player.y + (player.isCrouching ? player.height * 0.6 : player.height * 0.35);
    
    if (player.aim === 'up') {
      ctx.fillRect(player.x + player.width/2 - 2, player.y - 12, 4, 10); // straight up gun
    } else {
      ctx.fillRect(player.facing === 'right' ? gunX : gunX - 10, gunY - 2, 10, 4); // front gun
    }

    ctx.restore();
  }

  ctx.restore(); // restore shake/camera translation
}

// --- Main Engine Loop Tick ---
let lastTime = 0;
function tick(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  update(deltaTime);
  draw();

  loopId = requestAnimationFrame(tick);
}

// --- End State Handlers ---
function triggerGameOver() {
  cancelAnimationFrame(loopId);
  isGameOverState = true;
  playSound('gameover');

  // Sync highscore
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('ss_best_score', bestScore);
    bestScoreEl.textContent = bestScore.toLocaleString();
  }

  finalScoreEl.textContent = `${score.toLocaleString()}점`;
  maxStageEl.textContent = `STAGE ${currentStage}`;

  gameOverModal.classList.add('open');
}

function triggerStageClear() {
  cancelAnimationFrame(loopId);
  isGameOverState = true;
  playSound('clear');

  // Grant stage clear bonus points
  const stageBonus = currentStage * 1000;
  score += stageBonus;
  currentScoreEl.textContent = score.toLocaleString();

  // Sync highscore
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('ss_best_score', bestScore);
    bestScoreEl.textContent = bestScore.toLocaleString();
  }

  const nextStage = currentStage + 1;
  if (nextStage > 5) {
    // Grand all clear!
    triggerGameClear();
  } else {
    // unlock next stage
    if (nextStage > unlockedStage) {
      unlockedStage = nextStage;
      localStorage.setItem('ss_unlocked_stage', unlockedStage);
    }
    stageClearModal.classList.add('open');
  }
}

function triggerGameClear() {
  allFinalScoreEl.textContent = `${score.toLocaleString()}점`;
  allClearModal.classList.add('open');
}

// --- Control Bindings ---
function bindUIEvents() {
  // Start action
  btnStartGame.addEventListener('click', () => {
    isStarted = true;
    startOverlay.style.display = 'none';
  });

  // Restart click
  btnRestart.addEventListener('click', () => {
    cancelAnimationFrame(loopId);
    resetGame(true);
    lastTime = 0;
    loopId = requestAnimationFrame(tick);
  });

  // Modal restart click
  btnRestartModal.addEventListener('click', () => {
    gameOverModal.classList.remove('open');
    resetGame(true);
    lastTime = 0;
    loopId = requestAnimationFrame(tick);
  });

  // Modal next stage click
  btnNextStage.addEventListener('click', () => {
    stageClearModal.classList.remove('open');
    currentStage++;
    localStorage.setItem('ss_active_stage', currentStage);
    
    loadStageSpecs(currentStage);
    resetGame(false); // Keep current score
    lastTime = 0;
    loopId = requestAnimationFrame(tick);
  });

  // Grand restart
  btnAllRestart.addEventListener('click', () => {
    allClearModal.classList.remove('open');
    currentStage = 1;
    unlockedStage = 1;
    localStorage.setItem('ss_active_stage', 1);
    localStorage.setItem('ss_unlocked_stage', 1);
    
    loadStageSpecs(currentStage);
    resetGame(true);
    lastTime = 0;
    loopId = requestAnimationFrame(tick);
  });

  // Pause
  btnPause.addEventListener('click', () => {
    isPaused = !isPaused;
    if (isPaused) {
      btnPause.innerHTML = '<i class="fa-solid fa-play"></i> 계속 하기';
    } else {
      btnPause.innerHTML = '<i class="fa-solid fa-pause"></i> 일시 정지';
    }
  });

  // Sound toggle
  btnSound.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      btnSound.innerHTML = '<i class="fa-solid fa-volume-high"></i> 소리 켜짐';
      btnSound.style.color = 'var(--text-main)';
    } else {
      btnSound.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> 소리 끔';
      btnSound.style.color = 'var(--text-dark)';
    }
  });

  // Keyboard Event Handlers
  window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'a') keys.a = true;
    if (key === 'd') keys.d = true;
    if (key === 'w') keys.w = true;
    if (key === 's') keys.s = true;

    // Jump
    if (key === 'k') {
      keys.k = true;
      if (player.isGrounded) {
        player.vy = -7.5; // jump power
        player.isGrounded = false;
        playSound('paddle');
      }
    }

    // Shoot
    if (key === 'j') {
      keys.j = true;
      playerFire();
    }

    // Grenade
    if (key === 'l') {
      keys.l = true;
      throwGrenade();
    }
  });

  window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'a') keys.a = false;
    if (key === 'd') keys.d = false;
    if (key === 'w') keys.w = false;
    if (key === 's') keys.s = false;
    if (key === 'j') keys.j = false;
    if (key === 'k') keys.k = false;
    if (key === 'l') keys.l = false;
  });

  // Mobile Controller Touch Events
  btnMLeft.addEventListener('touchstart', (e) => {
    keys.a = true;
    e.preventDefault();
  });
  btnMLeft.addEventListener('touchend', () => {
    keys.a = false;
  });

  btnMRight.addEventListener('touchstart', (e) => {
    keys.d = true;
    e.preventDefault();
  });
  btnMRight.addEventListener('touchend', () => {
    keys.d = false;
  });

  btnMUp.addEventListener('touchstart', (e) => {
    keys.w = true;
    e.preventDefault();
  });
  btnMUp.addEventListener('touchend', () => {
    keys.w = false;
  });

  btnMDown.addEventListener('touchstart', (e) => {
    keys.s = true;
    e.preventDefault();
  });
  btnMDown.addEventListener('touchend', () => {
    keys.s = false;
  });

  btnMJump.addEventListener('touchstart', (e) => {
    if (player.isGrounded) {
      player.vy = -7.5;
      player.isGrounded = false;
      playSound('paddle');
    }
    e.preventDefault();
  });

  btnMFire.addEventListener('touchstart', (e) => {
    playerFire();
    e.preventDefault();
  });

  btnMGrenade.addEventListener('touchstart', (e) => {
    throwGrenade();
    e.preventDefault();
  });
}

// Start Game Loop Tick
resetGame(true);
loopId = requestAnimationFrame(tick);
