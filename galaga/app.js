// CineAHO Space Warrior (Galaga) Sub-App Game Engine

// TOC explanation articles database
const TOC_ARTICLES = {
  1: {
    title: "스페이스 워리어란?",
    badge: "가이드 01: 개요",
    icon: "fa-circle-info",
    content: `
      <p><strong>스페이스 워리어(Space Warrior)</strong>는 80년대 아케이드 전설인 <strong>갤러그(Galaga)</strong>의 듀얼 전투기 합체 및 보스 트랙터 빔 포획 기믹을 모던 글래스모피즘 테마로 완벽히 재현해 낸 정통 스페이스 슈팅 게임입니다.</p>
      <p>플레이어는 외계 편대의 정밀한 대열 진입과 지그재그 하강 돌격, 시시각각 날아오는 적들의 탄막을 돌파하고 전설의 <strong>'듀얼 파이터'</strong>를 합체하여 은하계를 지켜내야 합니다.</p>
    `
  },
  2: {
    title: "갤러그와 슈팅의 역사",
    badge: "가이드 02: 게임의 역사",
    icon: "fa-clock-rotate-left",
    content: `
      <p>1981년 일본 남코(Namco) 사에서 출시한 갤러그(갈라가, Galaga)는 전작 갤럭시안(Galaxian)의 대히트 이후 출시되어 슈팅 게임 역사의 한 획을 그었습니다.</p>
      <p>기존 슈팅 게임들이 단순히 피하고 쏘는 것에 그쳤다면, 갤러그는 적 보스에게 내 기체를 고의로 포획시킨 뒤 보스를 처단하여 2대의 기체를 조작하는 <strong>'리스크 앤 리턴'</strong> 방식의 듀얼 파이터 시스템을 도입하여 게임 역사에 영원히 남을 클래식이 되었습니다.</p>
    `
  },
  3: {
    title: "게임 기본 규칙",
    badge: "가이드 03: 기본 규칙",
    icon: "fa-gavel",
    content: `
      <ul>
        <li><strong>승리 요건</strong>: 매 스테이지마다 진입하는 적 편대를 모두 격추하면 스테이지가 클리어되며 다음 스테이지로 넘어갑니다.</li>
        <li><strong>패배 요건</strong>: 플레이어 기체가 적 기체 또는 적 탄환과 충돌하면 생명(Heart)이 1개 소모됩니다. 모든 생명을 잃으면 게임오버가 됩니다.</li>
        <li><strong>편대 진입 단계</strong>: 적들은 스테이지 시작 시 상단 및 측면에서 편대를 이루어 곡선 비행을 하며 대형을 짭니다. 이때 격추하면 대형 완료 후보다 더 높은 보너스 점수를 얻습니다.</li>
        <li><strong>돌격 공격</strong>: 대형 배치가 끝나면, 적들은 교대로 경보음과 함께 하강 곡선 비행을 하며 미사일을 발사해 플레이어를 기습합니다.</li>
      </ul>
    `
  },
  4: {
    title: "핵심 조작법 (PC/모바일)",
    badge: "가이드 04: 컨트롤 조작",
    icon: "fa-keyboard",
    content: `
      <p>PC 환경의 키보드 조작과 모바일 환경의 터치 패널 조작을 동시에 완벽 지원합니다.</p>
      <ul>
        <li><strong>키보드 조작</strong>:
          <ul>
            <li><strong>좌우 이동</strong>: 키보드 좌우 방향키(←, →) 또는 <strong>A, D</strong> 키</li>
            <li><strong>미사일 발사</strong>: <strong>Spacebar</strong> (최대 2연사 지원)</li>
            <li><strong>일시정지</strong>: <strong>P</strong> 키</li>
            <li><strong>게임 재시작</strong>: <strong>R</strong> 키</li>
          </ul>
        </li>
        <li><strong>모바일 터치 컨트롤</strong>:
          <ul>
            <li>화면 하단의 좌우 caret 단추(◀, ▶)를 터치하여 이동합니다.</li>
            <li><strong>발사</strong> 단추를 눌러 공격하거나, <strong>자동발사</strong> 단추를 ON으로 켜두어 자동으로 탄을 쏠 수 있습니다.</li>
          </ul>
        </li>
      </ul>
    `
  },
  5: {
    title: "듀얼 파이터 & 트랙터 빔",
    badge: "가이드 05: 핵심 기믹",
    icon: "fa-rocket",
    content: `
      <p>본 게임의 핵심인 <strong>트랙터 빔</strong>과 <strong>듀얼 파이터</strong> 활용 시스템입니다.</p>
      <ul>
        <li><strong>보스의 포획 광선</strong>: 최상단의 녹색 보스 기체는 하강 비행을 하다가 화면 중앙 부근에서 자색 광선(트랙터 빔)을 방출합니다.</li>
        <li><strong>캡처(Capture)</strong>: 빔에 기체가 닿으면 회전하며 보스에게 포획되어 적으로 돌변합니다. 이때 목숨을 1개 잃고 새 기체가 스폰됩니다.</li>
        <li><strong>듀얼 파이터 복원</strong>: 아군을 캡처한 보스가 나중에 하강 공격을 할 때, <strong>보스만 정확히 격추</strong>하면 포획된 아군이 풀려나며 아군 기체와 결합해 <strong>듀얼 파이터</strong>가 됩니다.</li>
        <li><strong>듀얼의 강점과 약점</strong>: 2발씩 미사일을 동시 발사해 공격력이 2배가 되지만, 기체 가로 크기가 넓어져 적 탄환에 맞을 확률이 증가합니다. 피격 시 1대만 파괴되며 다시 싱글 파이터로 분리됩니다.</li>
      </ul>
    `
  },
  6: {
    title: "적 기체 유형 및 패턴",
    badge: "가이드 06: 에너미 분석",
    icon: "fa-robot",
    content: `
      <p>스페이스 워리어에 등장하는 3가지 주요 외계 기체 분석입니다.</p>
      <ul>
        <li><strong>졸개 기체 (Bee)</strong>: 하단 2개 열에 배치되는 붉은색 외계 기체입니다. 체력은 1이며 가볍게 하강 돌격을 수행합니다.</li>
        <li><strong>중형 기체 (Moth)</strong>: 중간 2개 열에 배치되는 황색/청색 날개를 가진 기체입니다. 체력은 1이며, 돌격 시 공중제비를 돌며 미사일을 난사합니다.</li>
        <li><strong>보스 기체 (Galaga Boss)</strong>: 최상단 열에 배치되는 녹색의 거대 기체입니다. <strong>2번의 유효 타격</strong>을 입혀야 파괴되며, 트랙터 빔을 쏠 수 있는 유일한 존재입니다.</li>
      </ul>
    `
  },
  7: {
    title: "챌린징 스테이지 공략",
    badge: "가이드 07: 챌린징 보너스",
    icon: "fa-crosshairs",
    content: `
      <ul>
        <li><strong>보너스 스테이지</strong>: 매 5스테이지(5, 10, 15...)마다 적들이 플레이어를 공격하지 않고 공중 곡선 비행 패턴만 그리고 빠져나가는 <strong>챌린징 스테이지(Challenging Stage)</strong>가 호출됩니다.</li>
        <li><strong>완벽 격추(Perfect)</strong>: 떼를 지어 들어오는 적 기체를 단 한 마리도 놓치지 않고 40마리 모두 격추하면 10,000점의 엄청난 스페셜 점수 보너스를 획득합니다.</li>
        <li><strong>공략 요령</strong>: 적들이 등장하는 측면과 루프 궤적을 기억하고, 듀얼 파이터 상태를 유지하여 진입하는 적들을 길목에서 일렬로 쓸어 담는 것이 핵심입니다.</li>
      </ul>
    `
  },
  8: {
    title: "스코어링 & 난이도",
    badge: "가이드 08: 점수 및 레벨",
    icon: "fa-chart-simple",
    content: `
      <p>효율적인 점수 획득 공식과 난이도 곡선 설계입니다.</p>
      <ul>
        <li><strong>진입 중 격추</strong>: 적들이 대형을 짜기 위해 나선 진입 비행을 하는 도중에 격추하면, 대형 정렬 상태에서 잡을 때보다 점수가 <strong>2배</strong> 높습니다. (예: 대형 내 Bee 50점 -> 비행 중 Bee 100점)</li>
        <li><strong>보스 격추</strong>: 보스는 대형 정렬 시 150점이지만, 돌격 중 격추하면 400점을 줍니다.</li>
        <li><strong>255 무한 난이도</strong>: 스테이지가 올라갈수록 적들의 돌격 빈도, 하강 속도, 적 탄환 발사 주기 및 속도가 급속도로 올라갑니다. 255스테이지 이후에는 난이도가 초기화되어 순환합니다.</li>
      </ul>
    `
  },
  9: {
    title: "고득점 실전 팁",
    badge: "가이드 09: 고수 공략 팁",
    icon: "fa-lightbulb",
    content: `
      <ul>
        <li><strong>의도적 캡처 전략</strong>: 스테이지 1이나 챌린징 스테이지 직전에 보스에게 고의로 전투기를 잡히게 한 뒤, 다음 국면에서 복원해 초반부터 듀얼 파이터의 강력한 화력으로 고득점을 쓸어 담으세요.</li>
        <li><strong>포획 아군 사격 주의</strong>: 보스가 아군 기체를 포획하여 대동하고 다닐 때 실수로 캡처된 아군 기체를 쏘면 점수 100점만 주고 파괴되므로, 보스 본체만 빗겨 쏘는 정밀 샷이 요구됩니다.</li>
        <li><strong>구석 차단 방지</strong>: 화면 맨 왼쪽이나 오른쪽 구석에 기체가 몰리면 적들의 하강 탄막에 갇히게 되므로 항상 화면 중앙 60% 영역 내에서 회피 기동하는 것이 안전합니다.</li>
      </ul>
    `
  },
  10: {
    title: "반사 신경 발달 효과",
    badge: "가이드 10: 집중력 증진",
    icon: "fa-bolt",
    content: `
      <p>스페이스 워리어 게임이 주는 두뇌 인지 훈련 효과입니다.</p>
      <ul>
        <li><strong>동체 시력 및 반사 신경 발달</strong>: 무작위 궤적의 3D 궤적 투영 적들과 빠른 미사일을 집중 피격 회피하며 안구 근육 활동과 뇌 시각 피질의 인지 지연 시간이 대폭 감소합니다.</li>
        <li><strong>주의 분산 집중 능력</strong>: 듀얼 파이터 두 대를 인지하면서 동시에 적 탄환의 안전지대를 스캔해야 하므로 멀티태스킹 뇌 영역의 정보 통합 속도가 향상됩니다.</li>
      </ul>
    `
  },
  11: {
    title: "자주 묻는 질문 (FAQ)",
    badge: "가이드 11: FAQ",
    icon: "fa-question-circle",
    content: `
      <p><strong>Q. 듀얼 파이터인 상태에서 포획 빔을 맞으면 어떻게 되나요?</strong><br>A. 듀얼 중 한 대만 보스의 빔에 끌려가 캡처되고, 플레이어는 남은 한 대의 싱글 파이터로 계속해서 즉시 조작하게 됩니다.</p>
      <p><strong>Q. 캡처된 아군 기체가 적 탄환을 쏘기도 하나요?</strong><br>A. 네! 보스 뒤에 포획되어 적으로 바뀐 상태에서는 보스가 하강 공격을 할 때 옆에서 붉은 탄환을 같이 쏘아 플레이어를 공격하는 장애물이 됩니다.</p>
      <p><strong>Q. 소리가 너무 큰데 조절할 수 있나요?</strong><br>A. 하단 컨트롤 영역 우측의 스피커(🔊) 아이콘 단추를 누르면 즉시 모든 효과음을 소소하게 무음/유음으로 전환(Mute)할 수 있습니다.</p>
    `
  }
};

// Procedural Retro Audio Synthesizer (Web Audio API)
class SoundSynth {
  constructor() {
    this.audioCtx = null;
    this.muted = false;
  }

  init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  // Play retro shoot laser sound
  playLaser() {
    if (this.muted) return;
    this.init();
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "square";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  // Play explosion chiptune sound
  playExplosion(isPlayer = false) {
    if (this.muted) return;
    this.init();
    const ctx = this.audioCtx;
    
    // Create white noise buffer
    const bufferSize = ctx.sampleRate * (isPlayer ? 0.4 : 0.18);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(isPlayer ? 400 : 800, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(80, ctx.currentTime + (isPlayer ? 0.4 : 0.18));
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(isPlayer ? 0.35 : 0.18, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + (isPlayer ? 0.4 : 0.18));
    
    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noiseNode.start();
    noiseNode.stop(ctx.currentTime + (isPlayer ? 0.4 : 0.18));
  }

  // Play tractor beam cycling continuous hum
  playTractorBeam(duration = 0.15) {
    if (this.muted) return;
    this.init();
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sawtooth";
    osc2.type = "sine";
    
    // alternating frequency for tractor beam feel
    const time = ctx.currentTime;
    osc.frequency.setValueAtTime(220, time);
    osc2.frequency.setValueAtTime(110, time);
    
    // LFO effect simulation
    osc.frequency.linearRampToValueAtTime(440, time + duration * 0.5);
    osc.frequency.linearRampToValueAtTime(220, time + duration);
    
    gain.gain.setValueAtTime(0.07, time);
    gain.gain.linearRampToValueAtTime(0.01, time + duration);
    
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc2.start();
    osc.stop(time + duration);
    osc2.stop(time + duration);
  }

  // Arpeggio for capture sequence
  playCaptureJingle() {
    if (this.muted) return;
    this.init();
    const ctx = this.audioCtx;
    const notes = [440, 392, 349, 293, 220, 196]; // descending sad chord
    const noteLen = 0.09;
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * noteLen);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * noteLen);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + (idx + 1) * noteLen);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + idx * noteLen);
      osc.stop(ctx.currentTime + (idx + 1) * noteLen);
    });
  }

  // Arpeggio for happy double fighter morph jingle
  playDualMorphJingle() {
    if (this.muted) return;
    this.init();
    const ctx = this.audioCtx;
    const notes = [261.6, 329.6, 392.0, 523.3, 659.3, 784.0]; // ascending happy chord (C major triad)
    const noteLen = 0.08;
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * noteLen);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * noteLen);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + (idx + 1) * noteLen);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + idx * noteLen);
      osc.stop(ctx.currentTime + (idx + 1) * noteLen);
    });
  }

  // Short stage complete melody
  playStageClearMelody() {
    if (this.muted) return;
    this.init();
    const ctx = this.audioCtx;
    const notes = [523.3, 587.3, 659.3, 523.3, 659.3, 784.0];
    const duration = [0.1, 0.1, 0.1, 0.1, 0.1, 0.3];
    let elapsed = 0;
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + elapsed);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime + elapsed);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + elapsed + duration[idx]);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + elapsed);
      osc.stop(ctx.currentTime + elapsed + duration[idx]);
      
      elapsed += duration[idx] + 0.02;
    });
  }
}

const synth = new SoundSynth();

// -------------------------------------------------------------
// Global Game Configs and State
// -------------------------------------------------------------
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const SCREEN_W = canvas.width;
const SCREEN_H = canvas.height;

let isPlaying = false;
let isPaused = false;
let score = 0;
let bestScore = 0;
let stage = 1;
let lives = 3;

// Starfield array
const stars = [];
const STAR_COUNT = 65;

// Entity arrays
let player = null;
let playerLasers = [];
let enemyBullets = [];
let enemies = [];
let particles = [];

// Game controllers
let currentStageType = "standard"; // "standard" or "challenging"
let stageTimer = 0;
let stageIntroTextTimer = 0;
let challengingKills = 0;
let challengingTotalSpawns = 0;
let isStageClearing = false;
let isEnteringFormationState = true;

// Key input map
const keys = {};

// Mobile controller simulation state
let mobileMoveDirection = 0; // -1: Left, 0: None, 1: Right
let isAutofireActive = false;

// DOM items cache
const lblScore = document.getElementById("lbl-score");
const lblBestScore = document.getElementById("lbl-best-score");
const lblStage = document.getElementById("lbl-stage");
const lblLives = document.getElementById("lbl-lives");
const overlayScreen = document.getElementById("overlay-screen");
const btnOverlayStart = document.getElementById("btn-overlay-start");
const btnActionStart = document.getElementById("btn-action-start");
const btnSoundToggle = document.getElementById("btn-sound-toggle");

// TOC items
const explanationBoardContent = document.getElementById("explanation-board-content");
const explanationTitleBadge = document.getElementById("explanation-title-badge");
const explanationDisplayTitle = document.getElementById("explanation-display-title");
const explanationDisplayText = document.getElementById("explanation-display-text");
const tocListItems = document.querySelectorAll(".explanation-index-list li");

const BEST_SCORE_KEY = "aho_galaga_best_score";

// -------------------------------------------------------------
// Particle effect emitter helper
// -------------------------------------------------------------
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = (Math.random() - 0.5) * 5;
    this.vy = (Math.random() - 0.5) * 5;
    this.alpha = 1;
    this.decay = Math.random() * 0.03 + 0.015;
    this.radius = Math.random() * 2 + 1.5;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function spawnExplosion(x, y, color = "#ff5555", count = 12) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, color));
  }
}

// -------------------------------------------------------------
// Player Space Warrior Ship Entity
// -------------------------------------------------------------
class PlayerShip {
  constructor() {
    this.width = 28;
    this.height = 28;
    this.x = SCREEN_W / 2 - this.width / 2;
    this.y = SCREEN_H - 60;
    this.speed = 4.2;
    
    this.isDual = false; // Combined Double fighter mode
    
    // Tractor beam capture properties
    this.isCaptured = false;
    this.captureProgress = 0; // 0 to 1 as pulled up
    this.capturedSpin = 0;
    this.capturingBoss = null;
    
    this.lastFireTime = 0;
    this.fireCooldown = 180; // ms
  }

  update(deltaTime) {
    if (this.isCaptured) {
      // Rotate and slide up towards boss
      this.capturedSpin += 0.15;
      if (this.capturingBoss && !this.capturingBoss.isDead) {
        // Linear interpolation to boss coordinates
        const targetX = this.capturingBoss.x + this.capturingBoss.width / 2 - this.width / 2;
        const targetY = this.capturingBoss.y - this.height;
        this.x += (targetX - this.x) * 0.05;
        this.y += (targetY - this.y) * 0.05;
        
        // check distance
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        if (Math.sqrt(dx*dx + dy*dy) < 5) {
          // Fully captured! Attach to boss
          this.capturingBoss.capturedFighter = this;
          this.isCaptured = false;
          // Player loses life
          handlePlayerDeath(true); // true means skip creating explosion on player position
        }
      } else {
        // Boss died during capture? Fall down
        this.isCaptured = false;
        this.y = SCREEN_H - 60;
      }
      return;
    }

    // Normal movement input controls
    let moveDir = 0;
    if (keys["arrowleft"] || keys["a"]) moveDir = -1;
    if (keys["arrowright"] || keys["d"]) moveDir = 1;
    if (mobileMoveDirection !== 0) moveDir = mobileMoveDirection;

    const currentWidth = this.isDual ? this.width * 2 + 4 : this.width;
    this.x += moveDir * this.speed;

    // Boundaries clamping
    if (this.x < 10) this.x = 10;
    if (this.x > SCREEN_W - currentWidth - 10) this.x = SCREEN_W - currentWidth - 10;

    // Autofire trigger
    if (isAutofireActive) {
      this.fire();
    } else if (keys[" "] || keys["spacebar"]) {
      this.fire();
    }
  }

  fire() {
    const now = Date.now();
    if (now - this.lastFireTime > this.fireCooldown) {
      this.lastFireTime = now;
      synth.playLaser();
      
      if (this.isDual) {
        // Fire 2 lasers concurrently
        playerLasers.push({
          x: this.x + 6,
          y: this.y,
          vy: -8.5,
          width: 3,
          height: 12
        });
        playerLasers.push({
          x: this.x + this.width + 10,
          y: this.y,
          vy: -8.5,
          width: 3,
          height: 12
        });
      } else {
        // Single laser
        playerLasers.push({
          x: this.x + this.width / 2 - 1.5,
          y: this.y,
          vy: -8.5,
          width: 3,
          height: 12
        });
      }
    }
  }

  draw(ctx) {
    ctx.save();
    
    if (this.isCaptured) {
      // Spinning captured drawing
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.rotate(this.capturedSpin);
      ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));
      // Red tinted filter for captured indicator
      ctx.shadowColor = "rgba(239, 68, 68, 0.8)";
      ctx.shadowBlur = 12;
    } else {
      ctx.shadowColor = "rgba(59, 130, 246, 0.8)";
      ctx.shadowBlur = 10;
    }

    if (this.isDual) {
      // Draw 2 ships side by side
      this.drawSingleFighterBody(ctx, this.x, this.y);
      this.drawSingleFighterBody(ctx, this.x + this.width + 4, this.y);
    } else {
      this.drawSingleFighterBody(ctx, this.x, this.y);
    }
    
    ctx.restore();
  }

  drawSingleFighterBody(ctx, px, py) {
    const w = this.width;
    const h = this.height;
    
    ctx.fillStyle = this.isCaptured ? "#ef4444" : "#ffffff";
    ctx.strokeStyle = this.isCaptured ? "#b91c1c" : "#3b82f6";
    ctx.lineWidth = 2;
    
    // Draw Space Warrior wing outline structure
    ctx.beginPath();
    ctx.moveTo(px + w / 2, py); // Nose tip
    ctx.lineTo(px + w - 4, py + h - 8);
    ctx.lineTo(px + w, py + h); // Right Wingtip
    ctx.lineTo(px + w / 2 + 3, py + h - 5);
    ctx.lineTo(px + w / 2 - 3, py + h - 5);
    ctx.lineTo(px, py + h); // Left Wingtip
    ctx.lineTo(px + 4, py + h - 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw cockpit details
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.moveTo(px + w / 2, py + 4);
    ctx.lineTo(px + w / 2 + 3, py + h / 2);
    ctx.lineTo(px + w / 2 - 3, py + h / 2);
    ctx.closePath();
    ctx.fill();
    
    // Draw engines fire glow
    if (Math.random() > 0.4) {
      ctx.fillStyle = "#ff7800";
      ctx.beginPath();
      ctx.rect(px + w / 2 - 2, py + h - 2, 4, 6);
      ctx.fill();
    }
  }
}

// -------------------------------------------------------------
// Alien Enemies FSM Entities (Grun, Moth, Boss)
// -------------------------------------------------------------
class Enemy {
  constructor(id, type, targetGridX, targetGridY) {
    this.id = id;
    this.type = type; // "bee" (grunt), "moth" (mid), "boss" (boss)
    
    this.width = type === "boss" ? 34 : 26;
    this.height = type === "boss" ? 32 : 24;
    
    // Grid alignment coords
    this.gridX = targetGridX;
    this.gridY = targetGridY;
    
    // Start way off-screen for entry patterns
    this.x = targetGridX;
    this.y = -80;
    
    this.state = "entering"; // "entering", "grid", "diving", "capturing", "captured_fall", "rejoining"
    this.health = type === "boss" ? 2 : 1;
    this.maxHealth = this.health;
    
    // Path parameter for spline curves
    this.pathProgress = 0;
    this.pathCurve = [];
    this.entryDelay = id * 5; // delay spawning entry sequences
    
    // Diving behaviors
    this.diveTime = 0;
    this.diveSpeed = 2.5 + stage * 0.15;
    
    // Tractor beam properties
    this.tractorBeamTimer = 0;
    this.tractorBeamHeight = 0;
    this.capturedFighter = null; // Stores fighter object if captured
    
    this.isDead = false;
    this.animationTick = Math.random() * 100;
  }

  // Pre-generate bezier flight path nodes for entry stage
  generateEntryPath(entryPointNum) {
    this.pathProgress = 0;
    const startX = entryPointNum % 2 === 0 ? -50 : SCREEN_W + 50;
    const startY = 120 + (entryPointNum * 40);
    
    const cp1x = SCREEN_W / 2 + (entryPointNum % 2 === 0 ? -120 : 120);
    const cp1y = 200;
    const cp2x = SCREEN_W / 2 + (entryPointNum % 2 === 0 ? 100 : -100);
    const cp2y = 350;
    
    const targetX = this.gridX;
    const targetY = this.gridY;
    
    this.pathCurve = [];
    // Compute Bézier curve points (30 steps)
    for (let t = 0; t <= 1; t += 0.035) {
      const cx = (1-t)*(1-t)*(1-t)*startX + 3*(1-t)*(1-t)*t*cp1x + 3*(1-t)*t*t*cp2x + t*t*t*targetX;
      const cy = (1-t)*(1-t)*(1-t)*startY + 3*(1-t)*(1-t)*t*cp1y + 3*(1-t)*t*t*cp2y + t*t*t*targetY;
      this.pathCurve.push({ x: cx, y: cy });
    }
  }

  update() {
    this.animationTick += 0.08;
    
    if (this.state === "entering") {
      if (this.entryDelay > 0) {
        this.entryDelay--;
        return;
      }
      
      const stepIdx = Math.floor(this.pathProgress);
      if (stepIdx < this.pathCurve.length) {
        this.x = this.pathCurve[stepIdx].x - this.width / 2;
        this.y = this.pathCurve[stepIdx].y - this.height / 2;
        this.pathProgress += 0.75;
      } else {
        // Finished spline path. Hover to grid position
        this.state = "grid";
      }
    }
    
    else if (this.state === "grid") {
      // Idle grid hover sway (sine wave sync)
      const swayOffset = Math.sin(Date.now() * 0.002) * 15;
      this.x = this.gridX + swayOffset;
      this.y = this.gridY;
      
      // Let captured fighter follow boss in grid
      if (this.capturedFighter) {
        this.capturedFighter.x = this.x + this.width/2 - this.capturedFighter.width/2;
        this.capturedFighter.y = this.y - this.capturedFighter.height - 4;
      }
    }
    
    else if (this.state === "diving") {
      this.diveTime += 0.02;
      this.y += this.diveSpeed;
      // Zig zag slide using sine wave
      this.x += Math.sin(this.diveTime * 8) * 3;
      
      // Captured fighter trails boss during dive
      if (this.capturedFighter) {
        this.capturedFighter.x = this.x + this.width/2 - this.capturedFighter.width/2;
        this.capturedFighter.y = this.y - this.capturedFighter.height - 4;
      }

      // Shoot bullet at player
      if (Math.random() < 0.01 + stage * 0.002) {
        this.fireBullet();
      }

      // Boss tractor beam logic trigger
      if (this.type === "boss" && !this.capturedFighter && this.y > 180 && this.y < 230 && Math.random() < 0.03) {
        this.state = "capturing";
        this.tractorBeamTimer = 0;
        this.tractorBeamHeight = 0;
      }
      
      // Loop back screen top if missed bottom boundary
      if (this.y > SCREEN_H) {
        this.y = -40;
        this.state = "rejoining";
      }
    }
    
    else if (this.state === "capturing") {
      // Hover horizontally while tractor beam is active
      this.tractorBeamTimer += 1;
      this.x += Math.sin(this.tractorBeamTimer * 0.05) * 1.0;
      
      // Extend tractor beam cone down
      if (this.tractorBeamHeight < 320) {
        this.tractorBeamHeight += 5;
      }
      
      // hum sound
      if (this.tractorBeamTimer % 6 === 0) {
        synth.playTractorBeam(0.12);
      }

      // Check player overlap for capture
      if (player && !player.isCaptured && this.tractorBeamHeight > 200) {
        const pCenterX = player.x + player.width / 2;
        const bLeftX = this.x + this.width / 2 - 80;
        const bRightX = this.x + this.width / 2 + 80;
        
        // If player is inside the triangular tractor beam projection
        if (pCenterX > bLeftX && pCenterX < bRightX && player.y > this.y) {
          // Trigger capture state
          player.isCaptured = true;
          player.capturingBoss = this;
          player.captureProgress = 0;
          synth.playCaptureJingle();
          // beam closes down
          this.tractorBeamHeight = 0;
        }
      }

      // Tractor beam shuts off after 6 seconds
      if (this.tractorBeamTimer > 360) {
        this.state = "diving";
      }
    }
    
    else if (this.state === "captured_fall") {
      // Captured fighter falls spinning towards player
      if (this.capturedFighter) {
        this.capturedFighter.capturedSpin += 0.2;
        this.capturedFighter.y += 3.5;
        
        // Collide check with current player ship to merge into Dual
        if (player && !player.isCaptured) {
          const dx = (this.capturedFighter.x + this.capturedFighter.width/2) - (player.x + player.width/2);
          const dy = (this.capturedFighter.y + this.capturedFighter.height/2) - (player.y + player.height/2);
          if (Math.sqrt(dx*dx + dy*dy) < 30) {
            // Morph dual fighter!
            player.isDual = true;
            synth.playDualMorphJingle();
            this.capturedFighter = null;
            this.isDead = true;
          }
        }
        
        // If fall out of bottom bound, destroyed
        if (this.capturedFighter && this.capturedFighter.y > SCREEN_H) {
          this.capturedFighter = null;
          this.isDead = true;
        }
      } else {
        this.isDead = true;
      }
    }
    
    else if (this.state === "rejoining") {
      // Flying back from top to slot
      const swayOffset = Math.sin(Date.now() * 0.002) * 15;
      const tx = this.gridX + swayOffset;
      const ty = this.gridY;
      
      const dx = tx - this.x;
      const dy = ty - this.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist < 8) {
        this.x = tx;
        this.y = ty;
        this.state = "grid";
      } else {
        this.x += (dx / dist) * 3.5;
        this.y += (dy / dist) * 3.5;
      }
      
      if (this.capturedFighter) {
        this.capturedFighter.x = this.x + this.width/2 - this.capturedFighter.width/2;
        this.capturedFighter.y = this.y - this.capturedFighter.height - 4;
      }
    }
  }

  fireBullet() {
    if (this.state === "entering" || isStageClearing) return;
    
    enemyBullets.push({
      x: this.x + this.width / 2,
      y: this.y + this.height,
      vx: player ? ((player.x + player.width/2) - (this.x + this.width/2)) * 0.006 : 0,
      vy: 4.0 + (stage * 0.12),
      radius: 4
    });
  }

  draw(ctx) {
    if (this.entryDelay > 0 && this.state === "entering") return;

    ctx.save();
    
    // Draw tractor beam cone if capturing
    if (this.state === "capturing" && this.tractorBeamHeight > 0) {
      const grad = ctx.createLinearGradient(this.x + this.width/2, this.y + this.height, this.x + this.width/2, this.y + this.height + this.tractorBeamHeight);
      grad.addColorStop(0, "rgba(168, 85, 247, 0.45)");
      grad.addColorStop(1, "rgba(59, 130, 246, 0.01)");
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(this.x + this.width/2, this.y + this.height);
      ctx.lineTo(this.x + this.width/2 + 65, this.y + this.height + this.tractorBeamHeight);
      ctx.lineTo(this.x + this.width/2 - 65, this.y + this.height + this.tractorBeamHeight);
      ctx.closePath();
      ctx.fill();
      
      // Draw grid laser lines in tractor beam
      ctx.strokeStyle = "rgba(168, 85, 247, 0.3)";
      ctx.lineWidth = 1.5;
      for (let offset = -50; offset <= 50; offset += 25) {
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y + this.height);
        ctx.lineTo(this.x + this.width/2 + offset, this.y + this.height + this.tractorBeamHeight);
        ctx.stroke();
      }
    }

    // Procedural Alien Drawing with flappy wings
    const w = this.width;
    const h = this.height;
    const wingFlap = Math.sin(this.animationTick) * 4;
    
    if (this.type === "bee") {
      ctx.fillStyle = "#ff5555"; // Red Bee
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 1.5;
      
      // Wings
      ctx.beginPath();
      ctx.ellipse(this.x + 4, this.y + h/2, 6, 8 + wingFlap, Math.PI/6, 0, Math.PI*2);
      ctx.ellipse(this.x + w - 4, this.y + h/2, 6, 8 + wingFlap, -Math.PI/6, 0, Math.PI*2);
      ctx.fill();
      ctx.stroke();
      
      // Body
      ctx.fillStyle = "#ff3333";
      ctx.beginPath();
      ctx.arc(this.x + w/2, this.y + h/2, 8, 0, Math.PI*2);
      ctx.fill();
      
      // Eyes
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(this.x + w/2 - 3, this.y + 6, 2, 0, Math.PI*2);
      ctx.arc(this.x + w/2 + 3, this.y + 6, 2, 0, Math.PI*2);
      ctx.fill();
    }
    
    else if (this.type === "moth") {
      ctx.fillStyle = "#facc15"; // Yellow Moth
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 1.5;
      
      // Larger Wings
      ctx.beginPath();
      ctx.moveTo(this.x + w/2, this.y + 6);
      ctx.quadraticCurveTo(this.x - wingFlap, this.y - 4, this.x + 2, this.y + h - 4);
      ctx.quadraticCurveTo(this.x + w/2, this.y + h - 8, this.x + w - 2, this.y + h - 4);
      ctx.quadraticCurveTo(this.x + w + wingFlap, this.y - 4, this.x + w/2, this.y + 6);
      ctx.fill();
      ctx.stroke();
      
      // Core
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.ellipse(this.x + w/2, this.y + h/2, 6, 9, 0, 0, Math.PI*2);
      ctx.fill();
    }
    
    else if (this.type === "boss") {
      // Green Boss
      // Top color changes green -> blue if hit once (Flashed state)
      ctx.fillStyle = this.health === 2 ? "#10b981" : "#06b6d4";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      
      // Thick procedural shape
      ctx.beginPath();
      ctx.moveTo(this.x + w/2, this.y);
      ctx.lineTo(this.x + w - wingFlap, this.y + 10);
      ctx.lineTo(this.x + w - 4, this.y + h - 6);
      ctx.lineTo(this.x + w/2, this.y + h);
      ctx.lineTo(this.x + 4, this.y + h - 6);
      ctx.lineTo(this.x + wingFlap, this.y + 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Pincers / Horns
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.moveTo(this.x + w/2 - 6, this.y + 2);
      ctx.lineTo(this.x + w/2 - 12, this.y - 6);
      ctx.lineTo(this.x + w/2 - 2, this.y + 6);
      
      ctx.moveTo(this.x + w/2 + 6, this.y + 2);
      ctx.lineTo(this.x + w/2 + 12, this.y - 6);
      ctx.lineTo(this.x + w/2 + 2, this.y + 6);
      ctx.fill();
    }
    
    ctx.restore();
    
    // Draw captured fighter trailing right behind boss if exist
    if (this.capturedFighter) {
      this.capturedFighter.draw(ctx);
    }
  }
}

// -------------------------------------------------------------
// Starfield background generation and update
// -------------------------------------------------------------
function generateStarfield() {
  stars.length = 0;
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * SCREEN_W,
      y: Math.random() * SCREEN_H,
      speed: Math.random() * 2.2 + 0.3,
      radius: Math.random() * 1.5 + 0.5,
      // subtle twinkling
      color: `rgba(255, 255, 255, ${Math.random() * 0.7 + 0.3})`
    });
  }
}

function updateStarfield() {
  stars.forEach(star => {
    star.y += star.speed;
    if (star.y > SCREEN_H) {
      star.y = 0;
      star.x = Math.random() * SCREEN_W;
    }
  });
}

function drawStarfield(ctx) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  
  stars.forEach(star => {
    ctx.fillStyle = star.color;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

// -------------------------------------------------------------
// Formation Calculations (Galaga Grid Setup)
// -------------------------------------------------------------
function spawnStageEnemies() {
  enemies = [];
  playerLasers = [];
  enemyBullets = [];
  
  const isChallenging = stage % 5 === 0;
  currentStageType = isChallenging ? "challenging" : "standard";
  challengingKills = 0;
  challengingTotalSpawns = 0;
  isEnteringFormationState = true;
  isStageClearing = false;
  stageTimer = 0;

  if (isChallenging) {
    // Challenging stage triggers wave loop in update
    return;
  }

  // Standard Stage formation grid setup (5 columns, 4 rows)
  // Boss (Top row), Moth (Rows 2), Bee (Rows 3,4)
  const cols = 8;
  const colGap = 40;
  const startX = SCREEN_W / 2 - ((cols - 1) * colGap) / 2;
  
  let id = 0;
  
  // Row 1: Bosses
  for (let c = 2; c < 6; c++) {
    const targetX = startX + c * colGap;
    const targetY = 70;
    const enemy = new Enemy(id++, "boss", targetX, targetY);
    enemy.generateEntryPath(c % 4);
    enemies.push(enemy);
  }
  
  // Row 2: Moths
  for (let c = 1; c < 7; c++) {
    const targetX = startX + c * colGap;
    const targetY = 110;
    const enemy = new Enemy(id++, "moth", targetX, targetY);
    enemy.generateEntryPath(c % 4);
    enemies.push(enemy);
  }
  
  // Row 3 & 4: Bees
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < cols; c++) {
      const targetX = startX + c * colGap;
      const targetY = 150 + r * 35;
      const enemy = new Enemy(id++, "bee", targetX, targetY);
      enemy.generateEntryPath((c + r) % 4);
      enemies.push(enemy);
    }
  }
}

// Spawns scheduled curves of aliens for Challenging Stage waves
function updateChallengingWaveSpawner() {
  stageTimer++;
  
  // Spawns 4 waves of 8 enemies each
  const waveSpawns = [
    { spawnTime: 60, startSide: 0 },
    { spawnTime: 220, startSide: 1 },
    { spawnTime: 380, startSide: 2 },
    { spawnTime: 540, startSide: 3 }
  ];
  
  waveSpawns.forEach((w) => {
    if (stageTimer === w.spawnTime) {
      spawnChallengingWaveGroup(w.startSide);
    }
  });

  // End Challenging stage if all spawned enemies left screen or died
  if (stageTimer > 680 && enemies.length === 0) {
    endChallengingStage();
  }
}

function spawnChallengingWaveGroup(side) {
  const type = side === 0 ? "bee" : (side === 1 ? "moth" : "boss");
  
  // Generate 8 curve nodes
  for (let i = 0; i < 8; i++) {
    challengingTotalSpawns++;
    const id = i;
    const enemy = new Enemy(id, type, 0, 0);
    enemy.state = "entering";
    enemy.entryDelay = i * 8; // sequence spacing
    
    // Custom looping trajectory path
    enemy.pathCurve = [];
    const entryX = side % 2 === 0 ? -40 : SCREEN_W + 40;
    const entryY = 100 + (side * 60);
    const loopDirection = side < 2 ? 1 : -1;
    
    for (let t = 0; t <= 1.05; t += 0.02) {
      let cx = entryX;
      let cy = entryY;
      
      if (t < 0.4) {
        // Sweep in
        const k = t / 0.4;
        cx = entryX + (SCREEN_W / 2 - entryX) * k;
        cy = entryY + 120 * Math.sin(k * Math.PI / 2);
      } else if (t < 0.75) {
        // Complete circle loop
        const angle = ((t - 0.4) / 0.35) * Math.PI * 2;
        cx = SCREEN_W / 2 + Math.cos(angle) * 75;
        cy = 220 + Math.sin(angle) * 75 * loopDirection;
      } else {
        // Sweep out exit bottom
        const k = (t - 0.75) / 0.3;
        cx = SCREEN_W / 2 + (side % 2 === 0 ? SCREEN_W : -SCREEN_W) * 0.6 * k;
        cy = 295 + 400 * k;
      }
      enemy.pathCurve.push({ x: cx, y: cy });
    }
    
    enemies.push(enemy);
  }
}

// -------------------------------------------------------------
// Collision Detection Loop (AABB)
// -------------------------------------------------------------
function handleCollisions() {
  if (!player || player.isCaptured) return;

  const pWidth = player.isDual ? player.width * 2 + 4 : player.width;
  const playerRect = { x: player.x, y: player.y, w: pWidth, h: player.height };

  // 1. Lasers hitting enemies
  for (let l = playerLasers.length - 1; l >= 0; l--) {
    const laser = playerLasers[l];
    let laserHit = false;

    for (let e = enemies.length - 1; e >= 0; e--) {
      const enemy = enemies[e];
      if (enemy.entryDelay > 0 && enemy.state === "entering") continue;
      
      const enemyRect = { x: enemy.x, y: enemy.y, w: enemy.width, h: enemy.height };

      if (rectsOverlap(laser, enemyRect)) {
        laserHit = true;
        
        // Damage enemy
        enemy.health--;
        spawnExplosion(laser.x, enemy.y + enemy.height/2, "#60a5fa", 5);

        if (enemy.health <= 0) {
          killEnemy(enemy);
        } else {
          // Play armor hit spark chime
          synth.playLaser();
        }
        break;
      }

      // Check hit on captured fighter trailing the boss
      if (enemy.capturedFighter) {
        const f = enemy.capturedFighter;
        const fighterRect = { x: f.x, y: f.y, w: f.width, h: f.height };
        
        if (rectsOverlap(laser, fighterRect)) {
          laserHit = true;
          // Accidental hit on own captured fighter destroys it!
          spawnExplosion(f.x + f.width/2, f.y + f.height/2, "#ef4444", 15);
          synth.playExplosion();
          enemy.capturedFighter = null;
          break;
        }
      }
    }

    if (laserHit) {
      playerLasers.splice(l, 1);
    }
  }

  // 2. Enemy bullets hitting player
  for (let b = enemyBullets.length - 1; b >= 0; b--) {
    const bullet = enemyBullets[b];
    const bulletRect = { x: bullet.x - bullet.radius, y: bullet.y - bullet.radius, w: bullet.radius * 2, h: bullet.radius * 2 };

    if (rectsOverlap(bulletRect, playerRect)) {
      enemyBullets.splice(b, 1);
      handlePlayerDeath();
      return;
    }
  }

  // 3. Enemy bodies colliding with player
  for (let e = enemies.length - 1; e >= 0; e--) {
    const enemy = enemies[e];
    if (enemy.state === "entering" && enemy.entryDelay > 0) continue;
    if (enemy.state === "captured_fall") continue; // captured fall can only merge

    const enemyRect = { x: enemy.x, y: enemy.y, w: enemy.width, h: enemy.height };
    if (rectsOverlap(enemyRect, playerRect)) {
      killEnemy(enemy);
      handlePlayerDeath();
      return;
    }
  }
}

function rectsOverlap(r1, r2) {
  return r1.x < r2.x + r2.w &&
         r1.x + r1.w > r2.x &&
         r1.y < r2.y + r2.h &&
         r1.y + r1.h > r2.y;
}

// Process scoring and particles on enemy kill
function killEnemy(enemy) {
  spawnExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.type === "boss" ? "#10b981" : "#fbbf24", 14);
  synth.playExplosion();
  
  // Scoring weights: double score if shot during diving loop
  let killScore = 50;
  if (enemy.type === "bee") {
    killScore = enemy.state === "diving" ? 100 : 50;
  } else if (enemy.type === "moth") {
    killScore = enemy.state === "diving" ? 160 : 80;
  } else if (enemy.type === "boss") {
    killScore = enemy.state === "diving" ? 400 : 150;
  }
  
  score += killScore;
  lblScore.textContent = score;
  saveBestScore();

  if (currentStageType === "challenging") {
    challengingKills++;
  }

  // Handle tractor beam captured fighter release
  if (enemy.capturedFighter) {
    // Release fighter back down to player (enters falling merge state)
    const f = enemy.capturedFighter;
    f.isCaptured = false;
    
    // transform boss to a fall container
    enemy.state = "captured_fall";
    enemy.x = f.x;
    enemy.y = f.y;
    // wait for merge or bottom bound fall out
  } else {
    // Remove enemy
    enemies = enemies.filter(e => e.id !== enemy.id);
  }
}

// Handle player loss of life
function handlePlayerDeath(skipExplosion = false) {
  if (!skipExplosion && player) {
    spawnExplosion(player.x + player.width / 2, player.y + player.height / 2, "#ff3333", 25);
    synth.playExplosion(true); // deep rumble explosion
  }
  
  if (player && player.isDual) {
    // Dual fighter hit: just downgrade to single fighter instead of dying
    player.isDual = false;
    return;
  }

  lives--;
  updateLivesUI();

  if (lives <= 0) {
    // GAME OVER
    isPlaying = false;
    showGameOverScreen();
  } else {
    // Respawn single player ship after 1 second delay
    player = null;
    setTimeout(() => {
      if (isPlaying) {
        player = new PlayerShip();
      }
    }, 1000);
  }
}

function updateLivesUI() {
  lblLives.innerHTML = "";
  for (let i = 0; i < lives; i++) {
    lblLives.innerHTML += '<i class="fa-solid fa-heart text-red"></i> ';
  }
  if (lives === 0) {
    lblLives.textContent = "아웃";
  }
}

// -------------------------------------------------------------
// Dive scheduler loops for standard levels
// -------------------------------------------------------------
function triggerEnemyDiveScheduler() {
  if (currentStageType !== "standard" || isStageClearing || isEnteringFormationState) return;

  // dive interval speeds up with stage progress
  const interval = Math.max(120 - stage * 4, 45);
  if (stageTimer % interval === 0 && enemies.length > 0) {
    // Select a random enemy in grid state to dive
    const gridEnemies = enemies.filter(e => e.state === "grid");
    if (gridEnemies.length > 0) {
      const lucky = gridEnemies[Math.floor(Math.random() * gridEnemies.length)];
      lucky.state = "diving";
      lucky.diveTime = 0;
      lucky.diveSpeed = 2.5 + stage * 0.12;
    }
  }
}

// -------------------------------------------------------------
// Level transitions / Clears
// -------------------------------------------------------------
function checkStageClear() {
  if (enemies.length === 0 && !isStageClearing && isPlaying) {
    isStageClearing = true;
    synth.playStageClearMelody();
    
    // Display STAGE CLEAR splash and advance
    setTimeout(() => {
      stage++;
      if (stage > 255) stage = 1; // loop difficulty
      lblStage.textContent = stage;
      
      spawnStageEnemies();
    }, 2800);
  }
}

function endChallengingStage() {
  isStageClearing = true;
  synth.playStageClearMelody();
  
  // Award bonus calculations
  let bonus = challengingKills * 100;
  let perfectBonus = false;
  if (challengingKills === challengingTotalSpawns && challengingTotalSpawns > 0) {
    bonus += 10000;
    perfectBonus = true;
  }
  
  score += bonus;
  lblScore.textContent = score;
  saveBestScore();

  // Draw HUD overlay results directly inside game loop for 3.5 seconds
  stageIntroTextTimer = 220; // flags clear results screen duration

  setTimeout(() => {
    stage++;
    lblStage.textContent = stage;
    spawnStageEnemies();
  }, 3500);
}

// -------------------------------------------------------------
// High Score LocalStorage Handler
// -------------------------------------------------------------
function loadBestScore() {
  const stored = localStorage.getItem(BEST_SCORE_KEY);
  bestScore = parseInt(stored, 10) || 0;
  lblBestScore.textContent = bestScore;
}

function saveBestScore() {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem(BEST_SCORE_KEY, bestScore);
    lblBestScore.textContent = bestScore;
  }
}

// -------------------------------------------------------------
// Core Engine Loop Updates
// -------------------------------------------------------------
function update() {
  if (!isPlaying || isPaused) return;

  stageTimer++;
  updateStarfield();

  // Check stage intro text countdowns
  if (stageIntroTextTimer > 0) {
    stageIntroTextTimer--;
  }

  // Update challenging spawner
  if (currentStageType === "challenging" && !isStageClearing) {
    updateChallengingWaveSpawner();
  }

  // Update player
  if (player) {
    player.update();
  }

  // Update player lasers
  playerLasers.forEach(laser => {
    laser.y += laser.vy;
  });
  // Filter offscreen lasers
  playerLasers = playerLasers.filter(laser => laser.y > -20);

  // Update enemies
  enemies.forEach(enemy => {
    enemy.update();
  });
  
  // Filter dead enemies
  enemies = enemies.filter(enemy => !enemy.isDead);

  // Check if grid formation entry completed
  if (isEnteringFormationState && currentStageType === "standard") {
    const stillEntering = enemies.some(e => e.state === "entering");
    if (!stillEntering) {
      isEnteringFormationState = false;
    }
  }

  // Dive trigger scheduler
  triggerEnemyDiveScheduler();

  // Update enemy bullets
  enemyBullets.forEach(bullet => {
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
  });
  enemyBullets = enemyBullets.filter(b => b.y < SCREEN_H + 20);

  // Update collision checking
  handleCollisions();

  // Update particle sparks
  particles.forEach(p => p.update());
  particles = particles.filter(p => p.alpha > 0);

  // Stage checks
  if (currentStageType === "standard") {
    checkStageClear();
  }
}

// -------------------------------------------------------------
// Rendering Canvas Graphics (Draw)
// -------------------------------------------------------------
function draw() {
  // 1. Draw star background
  drawStarfield(ctx);

  // 2. Draw particle explosions
  particles.forEach(p => p.draw(ctx));

  // 3. Draw player lasers
  ctx.fillStyle = "#38bdf8";
  ctx.shadowColor = "rgba(56, 189, 248, 0.8)";
  ctx.shadowBlur = 8;
  playerLasers.forEach(laser => {
    ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
  });
  ctx.shadowBlur = 0; // reset shadow

  // 4. Draw enemies
  enemies.forEach(enemy => {
    enemy.draw(ctx);
  });

  // 5. Draw enemy bullets
  ctx.fillStyle = "#facc15";
  ctx.shadowColor = "rgba(250, 204, 21, 0.7)";
  ctx.shadowBlur = 6;
  enemyBullets.forEach(bullet => {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;

  // 6. Draw player ship
  if (player) {
    player.draw(ctx);
  }

  // 7. HUD text overlays (Stage titles / Challenges)
  ctx.save();
  ctx.font = "bold 20px 'Outfit', sans-serif";
  ctx.textAlign = "center";
  
  if (stageTimer < 180 && !isStageClearing) {
    // Show stage start text banner
    ctx.fillStyle = "#fb7185";
    ctx.shadowColor = "rgba(251, 113, 133, 0.6)";
    ctx.shadowBlur = 10;
    
    if (currentStageType === "challenging") {
      ctx.fillText("CHALLENGING STAGE", SCREEN_W / 2, SCREEN_H / 2 - 20);
    } else {
      ctx.fillText(`STAGE ${stage}`, SCREEN_W / 2, SCREEN_H / 2 - 20);
    }
    
    ctx.font = "14px 'Inter', sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(currentStageType === "challenging" ? "탄막을 피하고 적들을 모두 소탕하세요!" : "적 편대가 진입 중입니다...", SCREEN_W / 2, SCREEN_H / 2 + 10);
  }

  if (isStageClearing && currentStageType === "standard") {
    // Stage completed splash text
    ctx.fillStyle = "#10b981";
    ctx.shadowColor = "rgba(16, 185, 129, 0.6)";
    ctx.shadowBlur = 10;
    ctx.fillText("STAGE CLEAR", SCREEN_W / 2, SCREEN_H / 2 - 20);
  }

  if (currentStageType === "challenging" && isStageClearing && stageIntroTextTimer > 0) {
    // Challenging stats summary splash
    ctx.fillStyle = "#fbbf24";
    ctx.shadowColor = "rgba(251, 191, 36, 0.5)";
    ctx.shadowBlur = 10;
    ctx.fillText("CHALLENGING STAGE 결과", SCREEN_W / 2, SCREEN_H / 2 - 60);
    
    ctx.font = "16px 'Inter', sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText(`격추 수: ${challengingKills} / 32`, SCREEN_W / 2, SCREEN_H / 2 - 15);
    
    const baseBonus = challengingKills * 100;
    ctx.fillText(`처단 보너스: +${baseBonus} 점`, SCREEN_W / 2, SCREEN_H / 2 + 15);
    
    if (challengingKills === 32) {
      ctx.fillStyle = "#10b981";
      ctx.font = "bold 18px 'Outfit', sans-serif";
      ctx.fillText("PERFECT BONUS! +10,000 점", SCREEN_W / 2, SCREEN_H / 2 + 50);
    }
  }

  ctx.restore();
}

// -------------------------------------------------------------
// Game control flows (Start, Pause, Gameover)
// -------------------------------------------------------------
function startNewGame() {
  isPlaying = true;
  isPaused = false;
  score = 0;
  stage = 1;
  lives = 3;
  
  lblScore.textContent = 0;
  lblStage.textContent = 1;
  updateLivesUI();
  
  overlayScreen.style.display = "none";
  btnActionStart.innerHTML = '<i class="fa-solid fa-pause"></i> 일시정지';
  
  // Spawn entities
  player = new PlayerShip();
  spawnStageEnemies();
  
  generateStarfield();
  
  // Synth play starting intro chirp
  synth.playDualMorphJingle();
}

function togglePause() {
  if (!isPlaying) return;
  
  isPaused = !isPaused;
  if (isPaused) {
    btnActionStart.innerHTML = '<i class="fa-solid fa-play"></i> 게임 재개';
    
    // Draw pause watermark overlay
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 24px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("GAME PAUSED", SCREEN_W / 2, SCREEN_H / 2);
  } else {
    btnActionStart.innerHTML = '<i class="fa-solid fa-pause"></i> 일시정지';
  }
}

function showGameOverScreen() {
  overlayScreen.style.display = "flex";
  
  const titleEl = overlayScreen.querySelector(".overlay-title");
  const subtitleEl = overlayScreen.querySelector(".overlay-subtitle");
  
  titleEl.textContent = "GAME OVER";
  titleEl.style.color = "#f43f5e";
  subtitleEl.innerHTML = `최종 점수: <strong style="color:#fff; font-size:1.2rem;">${score}</strong> 점<br>도달 스테이지: Stage ${stage}`;
  
  btnOverlayStart.innerHTML = '<i class="fa-solid fa-rotate-right"></i> 다시 도전';
  btnActionStart.innerHTML = '<i class="fa-solid fa-play"></i> 게임 시작';
  
  synth.playExplosion(true);
}

// -------------------------------------------------------------
// Setup Page Event Listeners
// -------------------------------------------------------------
function setupPageListeners() {
  // Game start controls
  btnOverlayStart.addEventListener("click", () => {
    startNewGame();
  });
  
  btnActionStart.addEventListener("click", () => {
    if (!isPlaying) {
      startNewGame();
    } else {
      togglePause();
    }
  });

  // Sound toggle mute
  btnSoundToggle.addEventListener("click", () => {
    synth.muted = !synth.muted;
    btnSoundToggle.classList.toggle("active", synth.muted);
    btnSoundToggle.innerHTML = synth.muted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
  });

  // PC Keyboard listeners
  window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (e.key.toLowerCase() === "p") {
      togglePause();
    }
    if (e.key.toLowerCase() === "r") {
      startNewGame();
    }
  });
  
  window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  // Mobile Gamepad touch buttons listeners
  const btnLeft = document.getElementById("btn-left-arrow");
  const btnRight = document.getElementById("btn-right-arrow");
  const btnShoot = document.getElementById("btn-shoot-action");
  const btnAutofire = document.getElementById("btn-autofire-toggle");

  // Left Arrow
  btnLeft.addEventListener("touchstart", (e) => {
    e.preventDefault();
    mobileMoveDirection = -1;
  });
  btnLeft.addEventListener("touchend", (e) => {
    e.preventDefault();
    if (mobileMoveDirection === -1) mobileMoveDirection = 0;
  });
  btnLeft.addEventListener("mousedown", () => {
    mobileMoveDirection = -1;
  });
  btnLeft.addEventListener("mouseup", () => {
    mobileMoveDirection = 0;
  });

  // Right Arrow
  btnRight.addEventListener("touchstart", (e) => {
    e.preventDefault();
    mobileMoveDirection = 1;
  });
  btnRight.addEventListener("touchend", (e) => {
    e.preventDefault();
    if (mobileMoveDirection === 1) mobileMoveDirection = 0;
  });
  btnRight.addEventListener("mousedown", () => {
    mobileMoveDirection = 1;
  });
  btnRight.addEventListener("mouseup", () => {
    mobileMoveDirection = 0;
  });

  // Shoot button
  btnShoot.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (player && !player.isCaptured && isPlaying && !isPaused) {
      player.fire();
    }
  });
  btnShoot.addEventListener("mousedown", () => {
    if (player && !player.isCaptured && isPlaying && !isPaused) {
      player.fire();
    }
  });

  // Autofire Toggle button
  btnAutofire.addEventListener("click", () => {
    isAutofireActive = !isAutofireActive;
    btnAutofire.classList.toggle("active", isAutofireActive);
    btnAutofire.querySelector("span").textContent = isAutofireActive ? "ON" : "OFF";
  });

  // Floating scroll controls
  document.getElementById("btn-scroll-top").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.getElementById("btn-scroll-bottom").addEventListener("click", () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  });

  // TOC navigation clicks
  tocListItems.forEach((li) => {
    li.addEventListener("click", () => {
      tocListItems.forEach(item => item.classList.remove("active"));
      li.classList.add("active");
      
      const idx = parseInt(li.getAttribute("data-index"), 10);
      switchTOCArticle(idx);
    });
  });
}

function switchTOCArticle(index) {
  const article = TOC_ARTICLES[index];
  if (!article) return;
  
  explanationBoardContent.classList.add("fade-out");
  
  setTimeout(() => {
    explanationTitleBadge.innerHTML = `<i class="fa-solid ${article.icon} text-blue"></i> <span>${article.badge}</span>`;
    explanationDisplayTitle.textContent = article.title;
    explanationDisplayText.innerHTML = article.content;
    
    explanationBoardContent.classList.remove("fade-out");
  }, 300);
}

// -------------------------------------------------------------
// Main GameLoop (RequestAnimationFrame ticker)
// -------------------------------------------------------------
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Init Game on page load
window.addEventListener("DOMContentLoaded", () => {
  loadBestScore();
  generateStarfield();
  setupPageListeners();
  
  // Set default TOC text article
  switchTOCArticle(1);
  
  // Start the background starfield animation loop immediately
  isPlaying = false;
  
  // Tick render
  requestAnimationFrame(loop);
});
