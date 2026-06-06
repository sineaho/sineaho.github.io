/* ==========================================
   CineAHO Suika Watermelon Game Engine
   Using Matter.js rigid body 2D physics
   ========================================== */

// DOM Elements
const canvasContainer = document.getElementById('canvas-container-box');
const warningLineEl = document.getElementById('warning-line');
const dropGuideEl = document.getElementById('drop-guide');
const countdownAlertEl = document.getElementById('countdown-alert');
const currentScoreEl = document.getElementById('current-score');
const bestScoreEl = document.getElementById('best-score');
const btnRestart = document.getElementById('btn-restart-game');
const btnSound = document.getElementById('btn-sound-toggle');
const modalGameOver = document.getElementById('game-over-modal');
const modalFinalScore = document.getElementById('modal-final-score');
const modalMaxFruit = document.getElementById('modal-max-fruit');
const btnRestartModal = document.getElementById('btn-restart-modal-btn');
const themeToggleBtn = document.getElementById('theme-toggle');

// Fruit preview DOM elements
const previewFruitDot = document.getElementById('preview-fruit-dot');
const previewFruitName = document.getElementById('preview-fruit-name');

// Matter.js alias references
const { Engine, Render, Runner, Bodies, Composite, Body, Events, Vector } = Matter;

// Game Config & Constants
const STAGE_WIDTH = 440;
const STAGE_HEIGHT = 600;
const DEADLINE_Y = 120; // Dotted red warning line position
const WALL_THICKNESS = 20;

// Fruit Levels Definition (radius, score, color, name)
const FRUIT_LEVELS = {
  1: { name: "체리", radius: 15, score: 1, color: '#e11d48' },
  2: { name: "딸기", radius: 22, score: 2, color: '#ec4899' },
  3: { name: "포도", radius: 30, score: 4, color: '#a855f7' },
  4: { name: "귤", radius: 38, score: 8, color: '#fb923c' },
  5: { name: "감", radius: 46, score: 12, color: '#ea580c' },
  6: { name: "사과", radius: 55, score: 16, color: '#ef4444' },
  7: { name: "배", radius: 64, score: 20, color: '#facc15' },
  8: { name: "복숭아", radius: 74, score: 24, color: '#fca5a5' },
  9: { name: "파인애플", radius: 85, score: 32, color: '#eab308' },
  10: { name: "멜론", radius: 98, score: 48, color: '#22c55e' },
  11: { name: "수박", radius: 115, score: 66, color: '#047857' }
};

// Audio Synthesizer Context
let audioCtx = null;
let soundEnabled = true;

// Visual Effects
let activeShockwaves = [];

// Game States
let engine, render, runner, world;
let currentScore = 0;
let bestScore = parseInt(localStorage.getItem('wm_best_score') || 0);
let isGameOver = false;
let canDrop = true;
let currentLevel = 1;
let nextLevel = 1;
let maxLevelAchieved = 1;

// Ghost preview fruit (that follows the cursor at the top before dropping)
let previewBody = null;
let currentMouseX = STAGE_WIDTH / 2;

// Warning timers
let isAboveDeadline = false;
let deadlineTimer = null;
let countdownSecs = 3;

// --- Initialize Theme & Stats ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  bestScoreEl.textContent = bestScore.toLocaleString();
  initGame();
  bindUIEvents();
  updateVisitorStats();
});

// Theme Initializer (Sync with localStorage / default dark)
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
    
    // Adjust Matter.js Canvas Background based on theme
    if (render) {
      render.options.background = newTheme === 'light' ? 'rgba(241, 245, 249, 0.95)' : 'rgba(8, 12, 28, 0.7)';
    }
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

// Visitor Stats Loader
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
    console.error('방문자 통계 로드 실패:', err);
  }
}

// --- Synthesized Game Audio (Web Audio API) ---
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

  if (type === 'drop') {
    // Drop: Sine wave sweeping down quickly
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.15);
  } 
  else if (type === 'merge') {
    // Merge: Triangle wave sweeping up
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.2);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } 
  else if (type === 'warning') {
    // Warning beep: short square beep
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } 
  else if (type === 'gameover') {
    // Game over: Decreasing notes
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.setValueAtTime(220, now + 0.25);
    osc.frequency.setValueAtTime(150, now + 0.5);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.85);
    osc.start(now);
    osc.stop(now + 0.85);
  }
}

// --- Initialize Matter.js Physics Engine ---
function initGame() {
  // Clear any existing contents
  canvasContainer.querySelectorAll('canvas').forEach(c => c.remove());
  if (runner) Runner.stop(runner);
  if (engine) Engine.clear(engine);

  isGameOver = false;
  canDrop = true;
  currentScore = 0;
  maxLevelAchieved = 1;
  currentScoreEl.textContent = '0';
  isAboveDeadline = false;
  countdownSecs = 3;
  countdownAlertEl.style.display = 'none';
  activeShockwaves = [];

  // Reset highlight list
  updateEvolutionHighlight(1);

  // 1. Create Engine
  engine = Engine.create({
    gravity: { y: 1.0, scale: 0.001 }
  });
  world = engine.world;

  // 2. Create Renderer
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  render = Render.create({
    element: canvasContainer,
    engine: engine,
    options: {
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      wireframes: false,
      background: theme === 'light' ? 'rgba(241, 245, 249, 0.95)' : 'rgba(8, 12, 28, 0.7)'
    }
  });
  Render.run(render);

  // 3. Create Runner
  runner = Runner.create();
  Runner.run(runner, engine);

  // 4. Create Boundaries (Walls & Floor)
  const wallOptions = { 
    isStatic: true, 
    render: { fillStyle: 'transparent' }, 
    restitution: 0.2, 
    friction: 0.1 
  };
  
  const floor = Bodies.rectangle(STAGE_WIDTH / 2, STAGE_HEIGHT - WALL_THICKNESS / 2, STAGE_WIDTH, WALL_THICKNESS, wallOptions);
  const leftWall = Bodies.rectangle(WALL_THICKNESS / 2, STAGE_HEIGHT / 2, WALL_THICKNESS, STAGE_HEIGHT, wallOptions);
  const rightWall = Bodies.rectangle(STAGE_WIDTH - WALL_THICKNESS / 2, STAGE_HEIGHT / 2, WALL_THICKNESS, STAGE_HEIGHT, wallOptions);

  Composite.add(world, [floor, leftWall, rightWall]);

  // Set initial fruit levels
  currentLevel = getRandomStartLevel();
  nextLevel = getRandomStartLevel();

  // Create preview floating guide dot
  updatePreviewFruitUI();
  createPreviewFruitBody();

  // Register Collision & Game State events
  Events.on(engine, 'collisionStart', handleCollisions);
  Events.on(engine, 'afterUpdate', checkDeadlineWarning);
  
  // Custom Shockwave Drawing Event hook
  Events.on(render, 'afterRender', drawVisualEffects);
}

// Generate starting random levels (levels 1 to 5)
function getRandomStartLevel() {
  return Math.floor(Math.random() * 5) + 1;
}

// --- Preview Fruit Logic ---
function createPreviewFruitBody() {
  if (previewBody) Composite.remove(world, previewBody);

  const fruit = FRUIT_LEVELS[currentLevel];
  previewBody = Bodies.circle(currentMouseX, 60, fruit.radius, {
    isStatic: true,
    isSensor: true,
    render: {
      fillStyle: fruit.color,
      opacity: 0.85
    }
  });

  Composite.add(world, previewBody);
}

function updatePreviewFruitUI() {
  const currentFruit = FRUIT_LEVELS[currentLevel];
  const nextFruit = FRUIT_LEVELS[nextLevel];

  // Update visual floating guide preview
  if (previewBody) {
    Composite.remove(world, previewBody);
    createPreviewFruitBody();
  }

  // Update Left chain list active level highlight
  updateEvolutionHighlight(currentLevel);

  // Update Right preview preview box
  previewFruitDot.style.background = nextFruit.color;
  previewFruitDot.style.boxShadow = `0 0 10px ${nextFruit.color}`;
  previewFruitDot.style.width = `${nextFruit.radius * 0.9}px`;
  previewFruitDot.style.height = `${nextFruit.radius * 0.9}px`;
  previewFruitName.textContent = nextFruit.name;
}

function updateEvolutionHighlight(level) {
  document.querySelectorAll('.chain-item').forEach(item => {
    const itemLevel = parseInt(item.getAttribute('data-level'), 10);
    if (itemLevel === level) {
      item.classList.add('highlight');
    } else {
      item.classList.remove('highlight');
    }
  });
}

// Clamps dropping fruit boundary alignment within walls
function getClampedX(x, radius) {
  const minX = WALL_THICKNESS + radius;
  const maxX = STAGE_WIDTH - WALL_THICKNESS - radius;
  return Math.max(minX, Math.min(maxX, x));
}

// --- Game Interactivity (Drop mechanics) ---
function handleCursorMove(clientX) {
  if (isGameOver) return;
  const rect = render.canvas.getBoundingClientRect();
  const scaleX = STAGE_WIDTH / rect.width;
  const relativeX = (clientX - rect.left) * scaleX;

  const radius = FRUIT_LEVELS[currentLevel].radius;
  currentMouseX = getClampedX(relativeX, radius);

  // Sync Matter preview body position
  if (previewBody) {
    Body.setPosition(previewBody, { x: currentMouseX, y: 60 });
  }

  // Update vertical dotted guide line
  dropGuideEl.style.left = `${currentMouseX}px`;
  dropGuideEl.style.opacity = canDrop ? '0.4' : '0.05';
}

function dropFruit() {
  if (isGameOver || !canDrop) return;
  canDrop = false;

  const fruit = FRUIT_LEVELS[currentLevel];
  
  // Hide guide preview
  if (previewBody) {
    Composite.remove(world, previewBody);
    previewBody = null;
  }

  // Create real physics body
  const droppedBody = Bodies.circle(currentMouseX, 60, fruit.radius, {
    restitution: 0.15, // light bounce
    friction: 0.08,   // rolling friction
    density: 0.001,
    render: {
      fillStyle: fruit.color
    }
  });
  
  // Tag with metadata
  droppedBody.customMeta = {
    level: currentLevel,
    isDropped: true,
    spawnTime: Date.now()
  };

  Composite.add(world, droppedBody);
  playSound('drop');

  // Trigger drop guide fade
  dropGuideEl.style.opacity = '0.05';

  // Cooldown delay for next drop
  setTimeout(() => {
    if (isGameOver) return;
    
    // Cycle preview state
    currentLevel = nextLevel;
    nextLevel = getRandomStartLevel();
    canDrop = true;

    updatePreviewFruitUI();
    createPreviewFruitBody();
  }, 550);
}

// --- Collision Merger Handler ---
function handleCollisions(event) {
  const pairs = event.pairs;

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    const bodyA = pair.bodyA;
    const bodyB = pair.bodyB;

    // Check if customMeta properties exist on both bodies
    if (bodyA.customMeta && bodyB.customMeta) {
      const metaA = bodyA.customMeta;
      const metaB = bodyB.customMeta;

      // Merge conditions: same level and neither is already flagged for deletion
      if (metaA.level === metaB.level && !bodyA.toBeRemoved && !bodyB.toBeRemoved) {
        // Flag to prevent double merging in the same physical update loop
        bodyA.toBeRemoved = true;
        bodyB.toBeRemoved = true;

        const mergeLevel = metaA.level;

        // Perform merge deferred so Matter.js doesn't crash updating coordinates mid-solver
        setTimeout(() => {
          Composite.remove(world, [bodyA, bodyB]);

          // Midpoint coordinates
          const posX = (bodyA.position.x + bodyB.position.x) / 2;
          const posY = (bodyA.position.y + bodyB.position.y) / 2;

          // Merge level increment
          const nextLevelKey = mergeLevel + 1;
          
          if (FRUIT_LEVELS[nextLevelKey]) {
            const nextFruit = FRUIT_LEVELS[nextLevelKey];
            
            // Spawn next level fruit
            const mergedBody = Bodies.circle(posX, posY, nextFruit.radius, {
              restitution: 0.15,
              friction: 0.08,
              density: 0.001,
              render: {
                fillStyle: nextFruit.color
              }
            });

            mergedBody.customMeta = {
              level: nextLevelKey,
              isDropped: true,
              spawnTime: Date.now()
            };

            Composite.add(world, mergedBody);

            // Trigger visual expanding shockwave
            activeShockwaves.push({
              x: posX,
              y: posY,
              radius: nextFruit.radius * 0.8,
              opacity: 0.9,
              color: nextFruit.color
            });

            // Update stats
            currentScore += FRUIT_LEVELS[mergeLevel].score * 2;
            currentScoreEl.textContent = currentScore.toLocaleString();

            if (nextLevelKey > maxLevelAchieved) {
              maxLevelAchieved = nextLevelKey;
            }

            playSound('merge');
          } else {
            // Level 11 + Level 11 (Max Watermelons pop/victory)
            currentScore += FRUIT_LEVELS[11].score * 5;
            currentScoreEl.textContent = currentScore.toLocaleString();
            playSound('merge');

            activeShockwaves.push({
              x: posX,
              y: posY,
              radius: 120,
              opacity: 1.0,
              color: '#10b981'
            });
          }
        }, 0);
      }
    }
  }
}

// Draw custom shockwaves canvas overlay
function drawVisualEffects() {
  if (!render) return;
  const context = render.context;

  activeShockwaves.forEach((wave, index) => {
    context.beginPath();
    context.arc(wave.x, wave.y, wave.radius, 0, 2 * Math.PI);
    context.strokeStyle = wave.color;
    context.globalAlpha = wave.opacity;
    context.lineWidth = 4;
    context.stroke();
    
    // Animate wave expand and fade
    wave.radius += 3;
    wave.opacity -= 0.04;

    if (wave.opacity <= 0) {
      activeShockwaves.splice(index, 1);
    }
  });

  context.globalAlpha = 1.0; // Reset
}

// --- Deadline Sensor & Warning Logic ---
function checkDeadlineWarning() {
  if (isGameOver) return;

  const bodies = Composite.allBodies(world);
  let aboveLimit = false;

  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];
    if (body.customMeta && body.customMeta.isDropped) {
      // Cooldown buffer: ignore fruits dropped within the last 1.2s to prevent premature warnings
      if (Date.now() - body.customMeta.spawnTime < 1200) continue;

      // Check if top of body is above warning line (Y=120)
      if (body.position.y - body.circleRadius < DEADLINE_Y) {
        aboveLimit = true;
        break;
      }
    }
  }

  if (aboveLimit) {
    if (!isAboveDeadline) {
      isAboveDeadline = true;
      startWarningCountdown();
    }
  } else {
    if (isAboveDeadline) {
      isAboveDeadline = false;
      stopWarningCountdown();
    }
  }
}

function startWarningCountdown() {
  countdownSecs = 3;
  countdownAlertEl.textContent = countdownSecs;
  countdownAlertEl.style.display = 'block';
  warningLineEl.style.borderColor = '#ef4444';

  playSound('warning');

  deadlineTimer = setInterval(() => {
    countdownSecs--;
    if (countdownSecs <= 0) {
      triggerGameOver();
    } else {
      countdownAlertEl.textContent = countdownSecs;
      playSound('warning');
    }
  }, 1000);
}

function stopWarningCountdown() {
  if (deadlineTimer) {
    clearInterval(deadlineTimer);
    deadlineTimer = null;
  }
  countdownAlertEl.style.display = 'none';
  warningLineEl.style.borderColor = 'transparent';
}

function triggerGameOver() {
  stopWarningCountdown();
  isGameOver = true;
  playSound('gameover');

  // Sync highscore
  if (currentScore > bestScore) {
    bestScore = currentScore;
    localStorage.setItem('wm_best_score', bestScore);
    bestScoreEl.textContent = bestScore.toLocaleString();
  }

  // Populate stats modal
  modalFinalScore.textContent = `${currentScore.toLocaleString()}점`;
  modalMaxFruit.textContent = FRUIT_LEVELS[maxLevelAchieved].name;
  modalMaxFruit.style.color = FRUIT_LEVELS[maxLevelAchieved].color;

  modalGameOver.classList.add('open');
}

// --- UI / Control Binding Elements ---
function bindUIEvents() {
  // Canvas cursor tracks
  canvasContainer.addEventListener('mousemove', (e) => {
    handleCursorMove(e.clientX);
  });
  canvasContainer.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      handleCursorMove(e.touches[0].clientX);
    }
  });

  // Canvas click drops
  canvasContainer.addEventListener('click', () => {
    dropFruit();
  });
  canvasContainer.addEventListener('touchend', (e) => {
    dropFruit();
    e.preventDefault();
  });

  // Restart buttons
  btnRestart.addEventListener('click', () => {
    initGame();
  });
  btnRestartModal.addEventListener('click', () => {
    modalGameOver.classList.remove('open');
    initGame();
  });

  // Sound option toggle
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
}
