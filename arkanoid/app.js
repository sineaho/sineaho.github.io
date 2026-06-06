/* ==========================================
   CineAHO Arkanoid Breakout Game Engine
   Custom 2D Canvas Physics & Web Audio Synth
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
const livesContainer = document.getElementById('lives-container');
const stageGridContainer = document.getElementById('stage-grid-container');

const displayStageNumber = document.getElementById('display-stage-number');
const displayStageName = document.getElementById('display-stage-name');
const displayStageDesc = document.getElementById('display-stage-desc');

const powerupPanel = document.getElementById('powerup-status-panel');
const activeItemIcon = document.getElementById('active-item-icon');
const activeItemName = document.getElementById('active-item-name');
const activeItemProgress = document.getElementById('active-item-progress');

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

// Mobile Controllers
const mobileGamepad = document.getElementById('mobile-gamepad');
const btnCtrlLeft = document.getElementById('btn-ctrl-left');
const btnCtrlRight = document.getElementById('btn-ctrl-right');
const btnCtrlFire = document.getElementById('btn-ctrl-fire');

// --- Game Config & Constants ---
const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 640;
const PADDLE_HEIGHT = 16;
const PADDLE_DEFAULT_WIDTH = 80;
const PADDLE_Y = CANVAS_HEIGHT - 60;
const BALL_RADIUS = 8;
const INITIAL_BALL_SPEED = 2.25;
const MAX_BALL_SPEED = 4.5;

// Stage Specs (Names and Descriptions for visual enrichment)
const STAGE_SPECS = {
  1: { name: "시작하는 여정", desc: "기본적인 벽돌 배열로 알카노이드 조작을 배우고 훈련합니다." },
  2: { name: "피라미드의 사원", desc: "높이 솟아오른 튼튼한 다단 구조의 벽돌 피라미드를 무너뜨리세요." },
  3: { name: "분열의 기둥", desc: "중앙에 굳건하게 배치된 기둥들을 격파해 골목길을 확보합니다." },
  4: { name: "체커보드 격차", desc: "어긋나게 배치된 벽돌들 사이로 공을 반사해 보너스를 챙기세요." },
  5: { name: "화약고 폭파", desc: "중앙의 강력한 주황색 폭발벽돌을 맞춰 주변 블록을 초토화합니다." },
  6: { name: "사랑의 하트", desc: "하트 모양으로 촘촘히 엮인 분홍색과 보랏빛 벽돌을 파괴해보세요." },
  7: { name: "에일리언 인베이더", desc: "추억의 고전 외계인 우주선 대형을 벽돌 격파로 방어하세요." },
  8: { name: "다이아몬드 코어", desc: "인정사정없는 강철 골드 블록에 싸여 있는 핵심 다이아몬드를 공략합니다." },
  9: { name: "동심원의 파도", desc: "물결치듯 퍼지는 물방울 파동의 형태를 띈 3중 동심원 장벽입니다." },
  10: { name: "골드 가디언즈", desc: "움직이는 폭발 벽돌과 단단한 금속 가드를 피해 핵심 벽돌을 격파하세요." }
};

// Procedural Stage Info Generator for all 50 stages
function getStageSpec(num) {
  if (STAGE_SPECS[num]) return STAGE_SPECS[num];
  
  // Procedural names for higher stages
  const prefix = ["네온", "강철", "우주", "혼돈", "중력", "차원", "양자", "매트릭스", "심해", "초신성"];
  const suffix = ["성벽", "파동", "요새", "격차", "미로", "연쇄", "수호자", "크리스탈", "네뷸라", "싱귤래리티"];
  const pIdx = Math.floor((num - 1) / 5) % prefix.length;
  const sIdx = (num - 1) % suffix.length;
  
  return {
    name: `${prefix[pIdx]} ${suffix[sIdx]} (Stage ${num})`,
    desc: `스테이지 ${num} 단계입니다. 복잡한 구조와 단단한 다중 HP 벽돌을 파괴해 한계에 도전하세요.`
  };
}

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
    case 'paddle':
      // Paddle bounce: brief triangle wave
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;

    case 'wall':
      // Wall bounce: short square wave
      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
      break;

    case 'hit_1':
      // Hard hit
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
      break;

    case 'break':
      // Break brick: noise-like short pitch down
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
      break;

    case 'explode':
      // Explosive brick: low-frequency rumbling
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(40, now + 0.35);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
      break;

    case 'laser':
      // Laser shoot: fast sawtooth sweep down
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
      break;

    case 'powerup':
      // Item collected: Double note chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
      break;

    case 'shield':
      // Shield bounce: metal bell clash
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(349.23, now + 0.05); // F4
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
      break;

    case 'clear':
      // Stage clear: ascending arpeggio
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C major arpeggio
      notes.forEach((freq, index) => {
        const noteOsc = audioCtx.createOscillator();
        const noteGain = audioCtx.createGain();
        noteOsc.type = 'sine';
        noteOsc.frequency.setValueAtTime(freq, now + index * 0.08);
        noteGain.gain.setValueAtTime(0.12, now + index * 0.08);
        noteGain.gain.linearRampToValueAtTime(0.001, now + index * 0.08 + 0.2);
        noteOsc.connect(noteGain);
        noteGain.connect(audioCtx.destination);
        noteOsc.start(now + index * 0.08);
        noteOsc.stop(now + index * 0.08 + 0.2);
      });
      break;

    case 'gameover':
      // GameOver: sad descending scale
      const sadNotes = [392.00, 369.99, 349.23, 311.13, 261.63];
      sadNotes.forEach((freq, index) => {
        const noteOsc = audioCtx.createOscillator();
        const noteGain = audioCtx.createGain();
        noteOsc.type = 'sawtooth';
        noteOsc.frequency.setValueAtTime(freq, now + index * 0.15);
        noteGain.gain.setValueAtTime(0.15, now + index * 0.15);
        noteGain.gain.linearRampToValueAtTime(0.001, now + index * 0.15 + 0.3);
        noteOsc.connect(noteGain);
        noteGain.connect(audioCtx.destination);
        noteOsc.start(now + index * 0.15);
        noteOsc.stop(now + index * 0.15 + 0.3);
      });
      break;
  }
}

// --- Game State Variables ---
let currentStage = parseInt(localStorage.getItem('ak_active_stage') || 1);
let unlockedStage = parseInt(localStorage.getItem('ak_unlocked_stage') || 1);
let score = 0;
let bestScore = parseInt(localStorage.getItem('ak_best_score') || 0);
let lives = 3;
let isPaused = false;
let isStarted = false;
let isGameOverState = false;
let autoPlay = false;
let autoLaserTimer = 0;

// Game Loop ID
let loopId = null;

// Game Entities
let paddle = {
  x: CANVAS_WIDTH / 2 - PADDLE_DEFAULT_WIDTH / 2,
  y: PADDLE_Y,
  width: PADDLE_DEFAULT_WIDTH,
  height: PADDLE_HEIGHT,
  speed: 7,
  targetX: CANVAS_WIDTH / 2 - PADDLE_DEFAULT_WIDTH / 2
};

let balls = [];
let bricks = [];
let powerups = [];
let lasers = [];
let particles = [];

// Screen shake duration/magnitude
let shakeTime = 0;
let shakeIntensity = 0;

// Bottom safety shield
let shieldActive = false;

// Keys State
let keys = {
  ArrowLeft: false,
  ArrowRight: false,
  Space: false
};

// Timed Item States
let activeItem = null; // 'expand', 'shrink', 'laser', 'catch', 'slow'
let itemTimeLeft = 0;
let itemDuration = 10000; // 10 seconds default

// --- Initialization ---
// Auto-play button DOM ref
const btnAutoPlay = document.getElementById('btn-auto-play');

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  bestScoreEl.textContent = bestScore.toLocaleString();
  buildStageSelector();
  loadStageInfo(currentStage);
  updateHeartsUI();
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

// Stage Selector Panel Builder
function buildStageSelector() {
  stageGridContainer.innerHTML = '';
  for (let i = 1; i <= 50; i++) {
    const btn = document.createElement('button');
    btn.className = 'btn-stage';
    btn.textContent = i;
    btn.setAttribute('data-stage', i);

    // Apply states
    if (i === currentStage) {
      btn.classList.add('active');
    }
    if (i <= unlockedStage) {
      btn.classList.add('unlocked');
      if (i < unlockedStage) {
        btn.classList.add('completed');
      }
    } else {
      btn.classList.add('locked');
      btn.innerHTML = `<i class="fa-solid fa-lock" style="font-size:0.6rem;"></i>`;
    }

    btn.addEventListener('click', () => {
      if (i > unlockedStage) return; // locked
      
      // Stop loop and reset
      cancelAnimationFrame(loopId);
      currentStage = i;
      localStorage.setItem('ak_active_stage', currentStage);
      
      // Update highlights
      document.querySelectorAll('.btn-stage').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      loadStageInfo(currentStage);
      resetGame(false); // Keep current score
    });

    stageGridContainer.appendChild(btn);
  }
}

function loadStageInfo(stageNum) {
  const spec = getStageSpec(stageNum);
  displayStageNumber.textContent = `STAGE ${stageNum}`;
  displayStageName.textContent = spec.name;
  displayStageDesc.textContent = spec.desc;
}

// Draw Hearts
function updateHeartsUI() {
  livesContainer.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const heart = document.createElement('i');
    if (i <= lives) {
      heart.className = 'fa-solid fa-heart text-red';
    } else {
      heart.className = 'fa-solid fa-heart text-muted-heart';
    }
    livesContainer.appendChild(heart);
  }
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

// --- Procedural Stage Bricks Generator ---
function buildBricks(stageNum) {
  bricks = [];
  const colCount = 11;
  const brickWidth = 36;
  const brickHeight = 16;
  const startX = (CANVAS_WIDTH - (colCount * brickWidth)) / 2;
  const startY = 80;

  // Choose layout style procedurally
  const layoutType = (stageNum - 1) % 10; 
  
  // Setup brick colors based on health
  // 1: Pink, 2: Purple, 3: Blue, 4: Gold (Metallic), 5: Explosive (Orange)
  const hpColors = {
    1: { fill: '#ec4899', stroke: '#fbcfe8', glow: '#f43f5e' },
    2: { fill: '#a855f7', stroke: '#e9d5ff', glow: '#d8b4fe' },
    3: { fill: '#3b82f6', stroke: '#bfdbfe', glow: '#60a5fa' },
    4: { fill: '#475569', stroke: '#94a3b8', glow: '#cbd5e1' }, // Gold/Metal
    5: { fill: '#f97316', stroke: '#ffedd5', glow: '#fdba74' }  // Explosive
  };

  const getBrickType = (r, c) => {
    // Generate brick types and properties
    // Gold block: indestructible
    // Explosive: orange
    // HP 1, 2, 3: Pink, Purple, Blue
    
    // Default values
    let hp = 1;
    let isMoving = false;

    // Moving Bricks: rows 3 or 5 move in stages divisible by 5
    if (stageNum % 5 === 0 && (r === 3 || r === 4)) {
      isMoving = true;
    }

    if (layoutType === 0) {
      // 0. Standard Flat rows
      if (r <= 2) hp = 3;
      else if (r <= 4) hp = 2;
      else hp = 1;
    }
    else if (layoutType === 1) {
      // 1. Pyramid
      if (c >= r && c < colCount - r) {
        hp = r === 0 ? 3 : (r === 1 || r === 2 ? 2 : 1);
      } else {
        return null; // empty
      }
    }
    else if (layoutType === 2) {
      // 2. Columns
      if (c % 2 === 0) {
        hp = r % 2 === 0 ? 3 : 1;
      } else {
        return null;
      }
    }
    else if (layoutType === 3) {
      // 3. Checkerboard
      if ((r + c) % 2 === 0) {
        hp = 2;
      } else {
        return null;
      }
    }
    else if (layoutType === 4) {
      // 4. Inverted pyramid + Explosive blocks
      if (c >= (colCount - 1 - r) || c <= r) {
        return null;
      }
      hp = (r === 0 || c === Math.floor(colCount/2)) ? 5 : 2; // Explosive center
    }
    else if (layoutType === 5) {
      // 5. Heart Shape
      const heartPattern = [
        [0,0,1,1,0,0,0,1,1,0,0],
        [0,1,1,1,1,0,1,1,1,1,0],
        [1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,1,1,1,0,0],
        [0,0,0,1,1,1,1,1,0,0,0],
        [0,0,0,0,1,1,1,0,0,0,0],
        [0,0,0,0,0,1,0,0,0,0,0]
      ];
      if (r < heartPattern.length && heartPattern[r][c] === 1) {
        hp = r <= 1 ? 1 : (r <= 4 ? 2 : 3);
      } else {
        return null;
      }
    }
    else if (layoutType === 6) {
      // 6. Alien Invader Layout
      const invader = [
        [0,0,1,0,0,0,0,0,1,0,0],
        [0,0,0,1,0,0,0,1,0,0,0],
        [0,0,1,1,1,1,1,1,1,0,0],
        [0,1,1,0,1,1,1,0,1,1,0],
        [1,1,1,1,1,1,1,1,1,1,1],
        [1,0,1,1,1,1,1,1,1,0,1],
        [1,0,1,0,0,0,0,0,1,0,1],
        [0,0,0,1,1,0,1,1,0,0,0]
      ];
      if (r < invader.length && invader[r][c] === 1) {
        hp = r === 4 ? 5 : 2; // explosive center row
      } else {
        return null;
      }
    }
    else if (layoutType === 7) {
      // 7. Diamond / Concentric Core
      const dist = Math.abs(5 - c) + Math.abs(3 - r);
      if (dist === 0) {
        hp = 5; // center explosive
      } else if (dist === 1 || dist === 2) {
        hp = 3;
      } else if (dist === 3 || dist === 4) {
        hp = 2;
      } else if (dist === 5) {
        hp = 1;
      } else {
        return null;
      }
    }
    else if (layoutType === 8) {
      // 8. Waves & Metal Guards
      if (r === 1 && (c === 2 || c === 3 || c === 7 || c === 8)) {
        hp = 4; // gold (indestructible)
      } else {
        const wave = Math.sin(c * 0.8) * 2 + 4;
        if (r >= wave - 1 && r <= wave + 1) {
          hp = 2;
        } else {
          return null;
        }
      }
    }
    else if (layoutType === 9) {
      // 9. Shield Fort & Moving Blocks
      if (r === 2 && (c === 0 || c === 1 || c === colCount - 1 || c === colCount - 2)) {
        hp = 4; // side metal guards
      } else if (r === 0 || r === 4) {
        hp = 2;
      } else if (r === 1 || r === 3) {
        hp = 1;
      } else {
        return null;
      }
    }

    // Adjust complexity and stats based on stage count (1 to 50)
    // Scale brick hits (up to 3 maximum, except gold/explosive)
    if (hp >= 1 && hp <= 3) {
      // Increase brick hp slightly on high levels
      const stageBonus = Math.floor((stageNum - 1) / 15);
      hp = Math.min(3, hp + stageBonus);
    }

    // Drop index rates: higher stages have more explosive bricks
    if (stageNum > 20 && hp === 1 && (r + c) % 9 === 0) {
      hp = 5; // make it explosive
    }
    // Add gold guards on higher stages
    if (stageNum > 15 && hp === 3 && r === 0 && c % 4 === 0) {
      hp = 4; // metal indestructible
    }

    return { hp, isMoving };
  };

  const rowCount = 10;
  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < colCount; c++) {
      const type = getBrickType(r, c);
      if (type) {
        bricks.push({
          x: startX + c * brickWidth,
          y: startY + r * brickHeight,
          width: brickWidth - 2,
          height: brickHeight - 2,
          hp: type.hp,
          maxHp: type.hp,
          isGold: type.hp === 4,
          isExplosive: type.hp === 5,
          isMoving: type.isMoving,
          moveDir: 1,
          moveSpeed: 0.8 + (stageNum * 0.02), // slightly faster moving bricks at higher stages
          colorData: hpColors[type.hp]
        });
      }
    }
  }
}

// Reset Game / Prepare ball
function resetGame(fullReset = true) {
  isStarted = false;
  isPaused = false;
  isGameOverState = false;
  
  if (fullReset) {
    score = 0;
    lives = 3;
    currentScoreEl.textContent = '0';
  }
  
  updateHeartsUI();

  // Reset Paddle
  paddle.width = PADDLE_DEFAULT_WIDTH;
  paddle.x = CANVAS_WIDTH / 2 - paddle.width / 2;
  paddle.targetX = paddle.x;

  // Reset Item Status
  activeItem = null;
  itemTimeLeft = 0;
  powerupPanel.style.display = 'none';
  shieldActive = false;

  // Reset entities
  balls = [{
    x: CANVAS_WIDTH / 2,
    y: PADDLE_Y - BALL_RADIUS - 2,
    vx: 0,
    vy: 0,
    radius: BALL_RADIUS,
    speed: INITIAL_BALL_SPEED,
    isCaught: true
  }];
  
  powerups = [];
  lasers = [];
  particles = [];

  // Build stage bricks
  buildBricks(currentStage);

  // Sync Start button
  startOverlay.style.display = 'flex';
}

// --- Firing Laser cannons ---
function fireLaser() {
  if (activeItem !== 'laser') return;
  playSound('laser');
  
  // Firing twin laser beams from paddle edges
  lasers.push({
    x: paddle.x + 4,
    y: paddle.y - 8,
    width: 3,
    height: 12,
    vy: -6
  });
  lasers.push({
    x: paddle.x + paddle.width - 7,
    y: paddle.y - 8,
    width: 3,
    height: 12,
    vy: -6
  });
}

// --- Spawn Particle Sparks ---
function spawnParticles(x, y, color, count = 8) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      radius: Math.random() * 2 + 1,
      color: color,
      alpha: 1,
      decay: Math.random() * 0.03 + 0.02
    });
  }
}

// --- Explosive Brick chain explosion ---
function explodeBrick(brick) {
  playSound('explode');
  shakeScreen(15, 6);

  // Radius of explosion in pixels
  const explosionRadius = 70;
  
  // Render visual expanding ring
  particles.push({
    x: brick.x + brick.width / 2,
    y: brick.y + brick.height / 2,
    radius: 10,
    maxRadius: explosionRadius,
    isRing: true,
    color: '#f97316',
    alpha: 1,
    decay: 0.06
  });

  // Shatter nearby bricks
  bricks.forEach(b => {
    if (b.hp > 0 && !b.isGold && b !== brick) {
      const dx = (b.x + b.width / 2) - (brick.x + brick.width / 2);
      const dy = (b.y + b.height / 2) - (brick.y + brick.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < explosionRadius) {
        // Destroy brick or decrease HP
        b.hp = 0; // immediate break in explosion radius
        score += 20;
        spawnParticles(b.x + b.width / 2, b.y + b.height / 2, b.colorData.glow, 12);
        
        // Spawn item with 15% probability
        if (Math.random() < 0.15) {
          spawnItem(b.x + b.width / 2, b.y + b.height / 2);
        }
      }
    }
  });

  currentScoreEl.textContent = score.toLocaleString();
}

// Screen Shake feedback
function shakeScreen(duration, intensity) {
  shakeTime = duration;
  shakeIntensity = intensity;
}

// --- Spawn Item Drops ---
function spawnItem(x, y) {
  const items = [
    { type: 'expand', char: 'E', color: '#3b82f6' }, // Expand
    { type: 'shrink', char: 'S', color: '#64748b' }, // Shrink (penalty)
    { type: 'multi', char: 'M', color: '#a855f7' },  // Multi-ball
    { type: 'laser', char: 'L', color: '#ef4444' },  // Laser
    { type: 'catch', char: 'C', color: '#eab308' },  // Catch
    { type: 'shield', char: 'H', color: '#10b981' }, // Shield barrier
    { type: 'slow', char: 'W', color: '#06b6d4' },   // Slow ball
    { type: 'life', char: '+1', color: '#ec4899' }   // Extra Life
  ];

  // Random selection
  const rand = Math.random();
  let item = items[0];
  if (rand < 0.15) item = items[0];      // Expand (15%)
  else if (rand < 0.25) item = items[1]; // Shrink (10%)
  else if (rand < 0.45) item = items[2]; // Multi-ball (20%)
  else if (rand < 0.60) item = items[3]; // Laser (15%)
  else if (rand < 0.75) item = items[4]; // Catch (15%)
  else if (rand < 0.85) item = items[5]; // Shield (10%)
  else if (rand < 0.95) item = items[6]; // Slow (10%)
  else item = items[7];                  // Life (5%)

  powerups.push({
    x: x,
    y: y,
    vy: 1.8,
    radius: 12,
    type: item.type,
    char: item.char,
    color: item.color
  });
}

// Activate power-up
function activatePowerUp(type) {
  playSound('powerup');
  
  if (type === 'life') {
    if (lives < 5) {
      lives++;
      updateHeartsUI();
    }
    return;
  }

  if (type === 'shield') {
    shieldActive = true;
    return;
  }

  // Set active timed item
  activeItem = type;
  itemTimeLeft = itemDuration;

  // Clear previous states
  paddle.width = PADDLE_DEFAULT_WIDTH;
  
  if (type === 'expand') {
    paddle.width = PADDLE_DEFAULT_WIDTH * 1.5;
  } else if (type === 'shrink') {
    paddle.width = PADDLE_DEFAULT_WIDTH * 0.6;
  } else if (type === 'multi') {
    // Split all existing balls into 3 balls
    let extraBalls = [];
    balls.forEach(b => {
      // ball 2
      extraBalls.push({
        x: b.x,
        y: b.y,
        vx: b.vx * Math.cos(0.4) - b.vy * Math.sin(0.4),
        vy: b.vx * Math.sin(0.4) + b.vy * Math.cos(0.4),
        radius: BALL_RADIUS,
        speed: b.speed,
        isCaught: false
      });
      // ball 3
      extraBalls.push({
        x: b.x,
        y: b.y,
        vx: b.vx * Math.cos(-0.4) - b.vy * Math.sin(-0.4),
        vy: b.vx * Math.sin(-0.4) + b.vy * Math.cos(-0.4),
        radius: BALL_RADIUS,
        speed: b.speed,
        isCaught: false
      });
    });
    balls = balls.concat(extraBalls);
  } else if (type === 'slow') {
    balls.forEach(b => {
      b.speed = Math.max(INITIAL_BALL_SPEED - 1, b.speed * 0.7);
    });
  }

  // Update UI panel
  powerupPanel.style.display = 'block';
  activeItemName.textContent = getPowerupName(type);
  activeItemIcon.textContent = getPowerupIcon(type);
}

function getPowerupName(type) {
  switch (type) {
    case 'expand': return '패들 확장 (E)';
    case 'shrink': return '패들 축소 (S)';
    case 'multi': return '멀티볼 분열 (M)';
    case 'laser': return '레이저 포탑 (L)';
    case 'catch': return '볼 캐처 (C)';
    case 'slow': return '비행 감속 (W)';
    default: return '아이템';
  }
}

function getPowerupIcon(type) {
  switch (type) {
    case 'expand': return '↔️';
    case 'shrink': return '📴';
    case 'multi': return '🔮';
    case 'laser': return '🚀';
    case 'catch': return '🧲';
    case 'slow': return '🌀';
    default: return '⭐';
  }
}

// --- Main Loop Tick Updates ---
function update(deltaTime) {
  if (!isStarted || isPaused || isGameOverState) return;

  // 1. Timed power-ups ticks
  if (activeItem) {
    itemTimeLeft -= deltaTime;
    const pct = Math.max(0, (itemTimeLeft / itemDuration) * 100);
    activeItemProgress.style.width = `${pct}%`;
    if (itemTimeLeft <= 0) {
      activeItem = null;
      paddle.width = PADDLE_DEFAULT_WIDTH;
      powerupPanel.style.display = 'none';
    }
  }

  // AUTO-PLAY AI: move paddle towards predicted ball landing
  if (autoPlay) {
    // Find the lowest active ball heading downward (or any ball)
    let targetBall = null;
    let bestY = -Infinity;
    balls.forEach(b => {
      if (!b.isCaught && b.y > bestY) {
        bestY = b.y;
        targetBall = b;
      }
    });

    if (targetBall) {
      // Predict where ball will be at paddle Y
      let predX = targetBall.x;
      if (targetBall.vy > 0) {
        const framesToPaddle = (PADDLE_Y - targetBall.y) / targetBall.vy;
        predX = targetBall.x + targetBall.vx * framesToPaddle;
        // Simulate wall bounces for prediction
        while (predX < 0 || predX > CANVAS_WIDTH) {
          if (predX < 0) predX = -predX;
          if (predX > CANVAS_WIDTH) predX = 2 * CANVAS_WIDTH - predX;
        }
      }

      // Add slight offset randomness for natural look
      const offset = (Math.random() - 0.5) * 4;
      const targetX = predX + offset - paddle.width / 2;
      const diff = targetX - paddle.x;
      const moveStep = Math.min(Math.abs(diff), paddle.speed);
      paddle.x += Math.sign(diff) * moveStep;
      paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, paddle.x));
    }

    // Also try to catch falling power-ups
    if (powerups.length > 0) {
      let closestItem = null;
      let closestDist = Infinity;
      powerups.forEach(pu => {
        const dist = CANVAS_HEIGHT - pu.y;
        if (dist < closestDist && pu.y > PADDLE_Y - 200) {
          closestDist = dist;
          closestItem = pu;
        }
      });
      if (closestItem && (!targetBall || targetBall.y < PADDLE_Y - 250)) {
        const itemTargetX = closestItem.x - paddle.width / 2;
        const itemDiff = itemTargetX - paddle.x;
        const itemMoveStep = Math.min(Math.abs(itemDiff), paddle.speed);
        paddle.x += Math.sign(itemDiff) * itemMoveStep;
        paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, paddle.x));
      }
    }

    // Auto-fire lasers periodically
    if (activeItem === 'laser') {
      autoLaserTimer += deltaTime;
      if (autoLaserTimer > 300) {
        fireLaser();
        autoLaserTimer = 0;
      }
    }

    // Auto-release caught balls
    balls.forEach(b => {
      if (b.isCaught) {
        b.isCaught = false;
        b.vx = b.speed * 0.707 * (Math.random() > 0.5 ? 1 : -1);
        b.vy = -b.speed * 0.707;
      }
    });
  }

  // 2. Paddle movement (manual)
  if (!autoPlay) {
    let targetSpeed = paddle.speed;
    if (keys.ArrowLeft) {
      paddle.x = Math.max(0, paddle.x - targetSpeed);
    }
    if (keys.ArrowRight) {
      paddle.x = Math.min(CANVAS_WIDTH - paddle.width, paddle.x + targetSpeed);
    }
  }

  // Keep caught balls attached to the paddle
  balls.forEach(b => {
    if (b.isCaught) {
      b.x = paddle.x + paddle.width / 2;
      b.y = paddle.y - b.radius - 2;
    }
  });

  // 3. Move Bricks (floating horizontal rows)
  bricks.forEach(b => {
    if (b.isMoving) {
      b.x += b.moveSpeed * b.moveDir;
      // boundary check
      if (b.x <= 15) {
        b.x = 15;
        b.moveDir = 1;
      } else if (b.x + b.width >= CANVAS_WIDTH - 15) {
        b.x = CANVAS_WIDTH - 15 - b.width;
        b.moveDir = -1;
      }
    }
  });

  // 4. Laser Beams move
  for (let i = lasers.length - 1; i >= 0; i--) {
    const laser = lasers[i];
    laser.y += laser.vy;

    // Check hit with bricks
    let hit = false;
    for (let j = 0; j < bricks.length; j++) {
      const b = bricks[j];
      if (b.hp > 0 && 
          laser.x >= b.x && laser.x <= b.x + b.width &&
          laser.y >= b.y && laser.y <= b.y + b.height) {
        
        hit = true;
        
        // Damage brick
        if (!b.isGold) {
          b.hp--;
          score += 10;
          currentScoreEl.textContent = score.toLocaleString();
          
          if (b.hp <= 0) {
            playSound('break');
            spawnParticles(b.x + b.width / 2, b.y + b.height / 2, b.colorData.glow, 8);
            if (b.isExplosive) explodeBrick(b);
            if (Math.random() < 0.18) spawnItem(b.x + b.width / 2, b.y + b.height / 2);
          } else {
            playSound('hit_1');
          }
        } else {
          // Metal clang particle sparks
          spawnParticles(laser.x, laser.y, '#94a3b8', 4);
        }
        break;
      }
    }

    if (hit || laser.y < 0) {
      lasers.splice(i, 1);
    }
  }

  // 5. Falling power-up items
  for (let i = powerups.length - 1; i >= 0; i--) {
    const item = powerups[i];
    item.y += item.vy;

    // Hit with paddle
    if (item.y + item.radius >= paddle.y &&
        item.x >= paddle.x && item.x <= paddle.x + paddle.width &&
        item.y - item.radius <= paddle.y + paddle.height) {
      
      activatePowerUp(item.type);
      powerups.splice(i, 1);
      continue;
    }

    // drop out
    if (item.y - item.radius > CANVAS_HEIGHT) {
      powerups.splice(i, 1);
    }
  }

  // 6. Ball Physics & Collisions
  for (let i = balls.length - 1; i >= 0; i--) {
    const ball = balls[i];
    if (ball.isCaught) continue;

    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Wall bounce: Left / Right
    if (ball.x - ball.radius <= 0) {
      ball.x = ball.radius;
      ball.vx = -ball.vx;
      playSound('wall');
    } else if (ball.x + ball.radius >= CANVAS_WIDTH) {
      ball.x = CANVAS_WIDTH - ball.radius;
      ball.vx = -ball.vx;
      playSound('wall');
    }

    // Wall bounce: Top
    if (ball.y - ball.radius <= 0) {
      ball.y = ball.radius;
      ball.vy = -ball.vy;
      playSound('wall');
    }

    // Shield check: Bottom safety barrier bounce
    if (shieldActive && ball.y + ball.radius >= CANVAS_HEIGHT - 12) {
      ball.y = CANVAS_HEIGHT - 12 - ball.radius;
      ball.vy = -ball.vy;
      shieldActive = false; // consume
      playSound('shield');
      continue;
    }

    // Fall below bottom
    if (ball.y - ball.radius > CANVAS_HEIGHT) {
      balls.splice(i, 1);
      continue;
    }

    // Collision with Paddle
    if (ball.vy > 0 &&
        ball.y + ball.radius >= paddle.y &&
        ball.x >= paddle.x - ball.radius &&
        ball.x <= paddle.x + paddle.width + ball.radius &&
        ball.y - ball.radius <= paddle.y + paddle.height) {
      
      // Deflect angle depending on where it hits the paddle
      const relativeIntersectX = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
      const bounceAngle = relativeIntersectX * (Math.PI / 3.2); // max 56 degrees deflection

      ball.vx = ball.speed * Math.sin(bounceAngle);
      ball.vy = -ball.speed * Math.cos(bounceAngle);
      ball.y = paddle.y - ball.radius; // snap to top of paddle

      if (activeItem === 'catch') {
        ball.isCaught = true;
        ball.vx = 0;
        ball.vy = 0;
      } else {
        playSound('paddle');
      }

      // Slightly accelerate speed to scale difficulty
      ball.speed = Math.min(MAX_BALL_SPEED, ball.speed + 0.04);
      continue;
    }

    // Collision with Bricks (AABB edge reflections)
    for (let j = 0; j < bricks.length; j++) {
      const b = bricks[j];
      if (b.hp <= 0) continue;

      // Ball AABB overlapping check
      if (ball.x + ball.radius >= b.x &&
          ball.x - ball.radius <= b.x + b.width &&
          ball.y + ball.radius >= b.y &&
          ball.y - ball.radius <= b.y + b.height) {
        
        // Find collision normal (which side did we hit?)
        const prevX = ball.x - ball.vx;
        const prevY = ball.y - ball.vy;
        
        let hitLeft = prevX + ball.radius <= b.x;
        let hitRight = prevX - ball.radius >= b.x + b.width;
        let hitTop = prevY + ball.radius <= b.y;
        let hitBottom = prevY - ball.radius >= b.y + b.height;

        if (hitLeft) {
          ball.vx = -Math.abs(ball.vx);
          ball.x = b.x - ball.radius;
        } else if (hitRight) {
          ball.vx = Math.abs(ball.vx);
          ball.x = b.x + b.width + ball.radius;
        }

        if (hitTop) {
          ball.vy = -Math.abs(ball.vy);
          ball.y = b.y - ball.radius;
        } else if (hitBottom) {
          ball.vy = Math.abs(ball.vy);
          ball.y = b.y + b.height + ball.radius;
        }

        // Apply damage to brick
        if (!b.isGold) {
          b.hp--;
          score += 15;
          currentScoreEl.textContent = score.toLocaleString();
          
          if (b.hp <= 0) {
            playSound('break');
            spawnParticles(b.x + b.width / 2, b.y + b.height / 2, b.colorData.glow, 10);
            if (b.isExplosive) explodeBrick(b);
            // Drop power-up randomly (16% chance)
            if (Math.random() < 0.16) spawnItem(b.x + b.width / 2, b.y + b.height / 2);
          } else {
            playSound('hit_1');
          }
        } else {
          // metallic click particle sparks
          spawnParticles(ball.x, ball.y, '#94a3b8', 5);
          playSound('wall');
        }
        break; // resolve single hit per frame
      }
    }
  }

  // 7. Lose ball check
  if (balls.length === 0) {
    lives--;
    updateHeartsUI();

    if (lives <= 0) {
      triggerGameOver();
    } else {
      // Spawn new ball caught on paddle – reset to base speed
      balls.push({
        x: paddle.x + paddle.width / 2,
        y: paddle.y - BALL_RADIUS - 2,
        vx: 0,
        vy: 0,
        radius: BALL_RADIUS,
        speed: INITIAL_BALL_SPEED,
        isCaught: true
      });
      activeItem = null;
      powerupPanel.style.display = 'none';
    }
  }

  // 8. Stage Clear Check
  // Stage is cleared when all non-indestructible bricks are broken
  const remainingBricks = bricks.filter(b => b.hp > 0 && !b.isGold);
  if (remainingBricks.length === 0) {
    triggerStageClear();
  }

  // 9. Update particles animation
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

  // Screen shake decay
  if (shakeTime > 0) {
    shakeTime--;
  }
}

// Launch caught ball
function launchBall() {
  const caughtBall = balls.find(b => b.isCaught);
  if (caughtBall) {
    caughtBall.isCaught = false;
    // Launch at roughly 45 degrees angle upwards
    caughtBall.vx = caughtBall.speed * 0.707 * (Math.random() > 0.5 ? 1 : -1);
    caughtBall.vy = -caughtBall.speed * 0.707;
    isStarted = true;
    startOverlay.style.display = 'none';
  }
}

// --- Render Canvas Elements ---
function draw() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Apply screen shake
  ctx.save();
  if (shakeTime > 0) {
    const dx = (Math.random() - 0.5) * shakeIntensity;
    const dy = (Math.random() - 0.5) * shakeIntensity;
    ctx.translate(dx, dy);
  }

  // Draw Bottom Safety Shield line
  if (shieldActive) {
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT - 10);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 10);
    ctx.stroke();
    
    // Safety shield text label
    ctx.fillStyle = '#10b981';
    ctx.font = '700 9px Outfit';
    ctx.fillText('SHIELD ACTIVE', 12, CANVAS_HEIGHT - 16);
  }

  // Draw Bricks
  bricks.forEach(b => {
    if (b.hp <= 0) return;

    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = b.colorData.glow;

    // Fill brick
    ctx.fillStyle = b.colorData.fill;
    ctx.fillRect(b.x, b.y, b.width, b.height);

    // Border
    ctx.strokeStyle = b.colorData.stroke;
    ctx.lineWidth = 1;
    ctx.strokeRect(b.x, b.y, b.width, b.height);

    // Decorative inner gloss line
    if (!b.isGold) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(b.x + 2, b.y + 2, b.width - 4, 3);
    } else {
      // Metal rivet pattern on gold blocks
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(b.x + 4, b.y + 4, 4, 4);
      ctx.fillRect(b.x + b.width - 8, b.y + 4, 4, 4);
      ctx.fillRect(b.x + 4, b.y + b.height - 8, 4, 4);
      ctx.fillRect(b.x + b.width - 8, b.y + b.height - 8, 4, 4);
    }

    // Crack lines on multi-hp blocks
    if (b.maxHp > 1 && b.hp < b.maxHp) {
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Draw procedural diagonal crack line
      ctx.moveTo(b.x + 4, b.y + 4);
      ctx.lineTo(b.x + b.width/2, b.y + b.height/2);
      ctx.lineTo(b.x + b.width - 8, b.y + 3);
      if (b.hp === 1) {
        ctx.moveTo(b.x + 6, b.y + b.height - 4);
        ctx.lineTo(b.x + b.width - 4, b.y + b.height - 8);
      }
      ctx.stroke();
    }

    ctx.restore();
  });

  // Draw Lasers
  lasers.forEach(laser => {
    ctx.fillStyle = '#ef4444';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ef4444';
    ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
  });

  // Draw Items drops
  powerups.forEach(item => {
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = item.color;

    // Outer circle
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(item.x, item.y, item.radius, 0, 2 * Math.PI);
    ctx.fill();

    // inner outline
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Text symbol
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 10px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.char, item.x, item.y);
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

  // Draw Paddle
  ctx.save();
  ctx.shadowBlur = 15;
  ctx.shadowColor = activeItem === 'laser' ? '#ef4444' : '#3b82f6';

  const paddleGrad = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.height);
  if (activeItem === 'laser') {
    paddleGrad.addColorStop(0, '#ef4444');
    paddleGrad.addColorStop(1, '#991b1b');
  } else if (activeItem === 'catch') {
    paddleGrad.addColorStop(0, '#fbbf24');
    paddleGrad.addColorStop(1, '#d97706');
  } else {
    paddleGrad.addColorStop(0, '#60a5fa');
    paddleGrad.addColorStop(1, '#1d4ed8');
  }

  // Round corners on paddle
  ctx.fillStyle = paddleGrad;
  ctx.beginPath();
  ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 6);
  ctx.fill();

  // Laser cannons overlay
  if (activeItem === 'laser') {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(paddle.x + 1, paddle.y - 4, 6, 6);
    ctx.fillRect(paddle.x + paddle.width - 7, paddle.y - 4, 6, 6);
  }

  // Magnetic catcher overlay
  if (activeItem === 'catch') {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(paddle.x + paddle.width / 2, paddle.y + paddle.height / 2, 8, Math.PI, 0);
    ctx.stroke();
  }

  ctx.restore();

  // Draw Balls
  balls.forEach(ball => {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffffff';

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  });

  ctx.restore(); // restore shake offset
}

// --- Main Engine Loop Tick ---
let lastTime = 0;
function tick(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  // Handle updates and draw
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
    localStorage.setItem('ak_best_score', bestScore);
    bestScoreEl.textContent = bestScore.toLocaleString();
  }

  // Display stats
  finalScoreEl.textContent = `${score.toLocaleString()}점`;
  maxStageEl.textContent = `STAGE ${currentStage}`;

  gameOverModal.classList.add('open');

  // Auto-play: auto restart after 2 seconds
  if (autoPlay) {
    setTimeout(() => {
      if (!autoPlay) return;
      gameOverModal.classList.remove('open');
      resetGame(true);
      buildStageSelector();
      lastTime = 0;
      loopId = requestAnimationFrame(tick);
      // Auto launch
      setTimeout(() => {
        if (autoPlay) launchBall();
      }, 500);
    }, 2000);
  }
}

function triggerStageClear() {
  cancelAnimationFrame(loopId);
  isGameOverState = true;
  playSound('clear');

  // Add stage clear bonus points
  const stageBonus = currentStage * 200;
  score += stageBonus;
  currentScoreEl.textContent = score.toLocaleString();

  // Sync highscore
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('ak_best_score', bestScore);
    bestScoreEl.textContent = bestScore.toLocaleString();
  }

  // Lock logic
  const nextStageNum = currentStage + 1;
  if (nextStageNum > 50) {
    // Game completed!
    triggerGameClear();
  } else {
    // Unlock next stage
    if (nextStageNum > unlockedStage) {
      unlockedStage = nextStageNum;
      localStorage.setItem('ak_unlocked_stage', unlockedStage);
    }
    
    stageClearModal.classList.add('open');

    // Auto-play: auto advance to next stage after 1.5 seconds
    if (autoPlay) {
      setTimeout(() => {
        if (!autoPlay) return;
        stageClearModal.classList.remove('open');
        currentStage++;
        localStorage.setItem('ak_active_stage', currentStage);
        buildStageSelector();
        loadStageInfo(currentStage);
        resetGame(false);
        lastTime = 0;
        loopId = requestAnimationFrame(tick);
        // Auto launch
        setTimeout(() => {
          if (autoPlay) launchBall();
        }, 500);
      }, 1500);
    }
  }
}

function triggerGameClear() {
  allFinalScoreEl.textContent = `${score.toLocaleString()}점`;
  allClearModal.classList.add('open');
}

// --- Control Bindings ---
function bindUIEvents() {
  // Restart click
  btnRestart.addEventListener('click', () => {
    cancelAnimationFrame(loopId);
    resetGame(true);
    buildStageSelector();
    lastTime = 0;
    loopId = requestAnimationFrame(tick);
  });

  // Modal restart click
  btnRestartModal.addEventListener('click', () => {
    gameOverModal.classList.remove('open');
    resetGame(true);
    buildStageSelector();
    lastTime = 0;
    loopId = requestAnimationFrame(tick);
  });

  // Modal next stage click
  btnNextStage.addEventListener('click', () => {
    stageClearModal.classList.remove('open');
    currentStage++;
    localStorage.setItem('ak_active_stage', currentStage);
    
    buildStageSelector();
    loadStageInfo(currentStage);
    resetGame(false); // Keep current score
    lastTime = 0;
    loopId = requestAnimationFrame(tick);
  });

  // Grand restart
  btnAllRestart.addEventListener('click', () => {
    allClearModal.classList.remove('open');
    currentStage = 1;
    unlockedStage = 1;
    localStorage.setItem('ak_active_stage', 1);
    localStorage.setItem('ak_unlocked_stage', 1);
    
    buildStageSelector();
    loadStageInfo(currentStage);
    resetGame(true);
    lastTime = 0;
    loopId = requestAnimationFrame(tick);
  });

  // Start Click
  btnStartGame.addEventListener('click', () => {
    launchBall();
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
    if (e.key === 'ArrowLeft') keys.ArrowLeft = true;
    if (e.key === 'ArrowRight') keys.ArrowRight = true;
    if (e.key === ' ' || e.key === 'Spacebar') {
      keys.Space = true;
      if (!isStarted) {
        launchBall();
      } else if (activeItem === 'laser') {
        fireLaser();
      } else {
        // launch caught ball in catch mode
        balls.forEach(b => {
          if (b.isCaught) {
            b.isCaught = false;
            b.vx = b.speed * 0.707 * (Math.random() > 0.5 ? 1 : -1);
            b.vy = -b.speed * 0.707;
          }
        });
      }
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.ArrowLeft = false;
    if (e.key === 'ArrowRight') keys.ArrowRight = false;
    if (e.key === ' ' || e.key === 'Spacebar') keys.Space = false;
  });

  // Mouse / Touch movement on Canvas
  const handlePointerMove = (clientX) => {
    if (!isStarted || isPaused || isGameOverState) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const relativeX = (clientX - rect.left) * scaleX;
    
    // Center paddle on pointer
    paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, relativeX - paddle.width / 2));
  };

  canvas.addEventListener('mousemove', (e) => {
    handlePointerMove(e.clientX);
  });
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      handlePointerMove(e.touches[0].clientX);
    }
    e.preventDefault();
  }, { passive: false });

  // Canvas Click releases caught balls or fires lasers
  canvas.addEventListener('click', () => {
    if (!isStarted) {
      launchBall();
    } else if (activeItem === 'laser') {
      fireLaser();
    } else {
      balls.forEach(b => {
        if (b.isCaught) {
          b.isCaught = false;
          b.vx = b.speed * 0.707 * (Math.random() > 0.5 ? 1 : -1);
          b.vy = -b.speed * 0.707;
        }
      });
    }
  });

  // Mobile Controller Actions
  btnCtrlLeft.addEventListener('touchstart', (e) => {
    keys.ArrowLeft = true;
    e.preventDefault();
  });
  btnCtrlLeft.addEventListener('touchend', () => {
    keys.ArrowLeft = false;
  });

  btnCtrlRight.addEventListener('touchstart', (e) => {
    keys.ArrowRight = true;
    e.preventDefault();
  });
  btnCtrlRight.addEventListener('touchend', () => {
    keys.ArrowRight = false;
  });

  btnCtrlFire.addEventListener('touchstart', (e) => {
    if (!isStarted) {
      launchBall();
    } else if (activeItem === 'laser') {
      fireLaser();
    } else {
      balls.forEach(b => {
        if (b.isCaught) {
          b.isCaught = false;
          b.vx = b.speed * 0.707 * (Math.random() > 0.5 ? 1 : -1);
          b.vy = -b.speed * 0.707;
        }
      });
    }
    e.preventDefault();
  });

  // Auto-Play Toggle
  if (btnAutoPlay) {
    btnAutoPlay.addEventListener('click', () => {
      autoPlay = !autoPlay;
      if (autoPlay) {
        btnAutoPlay.innerHTML = '<i class="fa-solid fa-robot"></i> 자동 플레이 ON';
        btnAutoPlay.classList.add('active-auto');
        // Auto-start if not started
        if (!isStarted) {
          launchBall();
        }
      } else {
        btnAutoPlay.innerHTML = '<i class="fa-solid fa-robot"></i> 자동 플레이';
        btnAutoPlay.classList.remove('active-auto');
      }
    });
  }
}

// Start Game Loop Tick
resetGame(true);
loopId = requestAnimationFrame(tick);
