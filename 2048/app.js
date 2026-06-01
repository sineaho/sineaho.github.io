// CineAHO 2048 - Premium Puzzle Engine JS Code

// LCG Deterministic Random Number Generator
class LCG {
  constructor(seed) {
    this.seed = seed;
  }

  // Generate float between 0 and 1
  next() {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  // Generate integer in range [min, max]
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

// TOC explanation articles database
const TOC_ARTICLES = {
  1: {
    title: "2048이란?",
    badge: "가이드 01: 2048 개요",
    icon: "fa-circle-info",
    content: `
      <p><strong>2048</strong>은 2014년 이탈리아의 웹 개발자 가브리엘레 시룰리(Gabriele Cirulli)가 개발한 오픈 소스 웹 기반 퍼즐 게임입니다. 숫자가 적힌 타일들을 격자판 위에서 미끄러뜨려 같은 숫자의 타일들을 합치고, 최종적으로 <strong>'2048'</strong>이라는 숫자가 적힌 타일을 만드는 것이 주 목표입니다.</p>
      <p>직관적인 조작법과 높은 중독성으로 전 세계적인 인기를 끌었으며, 수학적 사고력과 계획성을 기르는 데 훌륭한 두뇌 게임으로 평가받고 있습니다.</p>
    `
  },
  2: {
    title: "게임의 유래",
    badge: "가이드 02: 역사와 유래",
    icon: "fa-clock-rotate-left",
    content: `
      <p>이 게임은 원래 모바일 게임이었던 '1024'와 'Threes!'라는 퍼즐 게임에서 영감을 받아 단 주말 만에 개발되었습니다. 원작자인 가브리엘레 시룰리는 이 게임을 단순히 주말 프로젝트로 제작해 GitHub에 오픈 소스로 공개했으나, 소셜 미디어를 통해 폭발적인 바이럴을 타며 불과 몇 주 만에 수천만 명의 플레이어를 모았습니다.</p>
      <p>단순하면서도 깊이 있는 게임 플레이 덕분에 전 세계 개발자들에 의해 다양한 변형 판(3D, AI 탑재형 등)으로 재탄생하여 고전 퍼즐의 반열에 올라섰습니다.</p>
    `
  },
  3: {
    title: "기본 규칙",
    badge: "가이드 03: 퍼즐의 규칙",
    icon: "fa-gavel",
    content: `
      <ul>
        <li><strong>기본 격자</strong>: 게임은 NxN 격자판에서 진행됩니다. 빈 공간에 무작위로 '2' 또는 '4' 타일이 생성됩니다.</li>
        <li><strong>타일 병합</strong>: 플레이어가 타일을 상, 하, 좌, 우 네 방향 중 하나로 밀면, 모든 타일이 그 방향으로 끝까지 미끄러집니다.</li>
        <li><strong>병합 규칙</strong>: 미끄러지는 도중 같은 숫자를 가진 두 타일이 충돌하면, 두 숫자가 합쳐진 하나의 타일(예: 2+2=4, 4+4=8)로 병합됩니다.</li>
        <li><strong>1회 제한</strong>: 단, 한 번의 움직임에 하나의 타일이 두 번 이상 연속해서 합쳐질 수는 없습니다.</li>
        <li><strong>새 타일 생성</strong>: 이동 후 보드에 변화가 생기면, 빈칸 중 한 곳에 새로운 타일(2 또는 4)이 무작위로 생성됩니다.</li>
        <li><strong>게임 종료</strong>: 2048 타일을 만들면 승리하며, 보드가 타일로 가득 차서 더 이상 합치거나 움직일 수 없을 때 게임오버가 됩니다.</li>
      </ul>
    `
  },
  4: {
    title: "핵심 조작법",
    badge: "가이드 04: 컨트롤 가이드",
    icon: "fa-keyboard",
    content: `
      <p>다양한 기기에서 쾌적하게 플레이할 수 있도록 멀티 조작 인터페이스를 지원합니다.</p>
      <ul>
        <li><strong>키보드 조작</strong>: 키보드의 방향키(↑, ↓, ←, →) 또는 게임용 단축키 <strong>WASD</strong>(W: 위, A: 왼쪽, S: 아래, D: 오른쪽)를 사용해 직관적으로 보드를 제어할 수 있습니다.</li>
        <li><strong>실행 취소(Undo)</strong>: 조작 실수나 방향을 되돌리고 싶을 때 상단의 '되돌리기' 버튼을 클릭하면, 최대 20회 이전까지 점수와 보드 타일 상태를 완벽하게 복원합니다. (단축키: <strong>Z</strong> 또는 <strong>U</strong>)</li>
        <li><strong>모바일 스와이프</strong>: 스마트폰이나 태블릿 등 터치스크린 기기에서도 손가락 스와이프 동작을 통해 동일하게 조작할 수 있도록 모바일 터치 이벤트를 지원합니다.</li>
      </ul>
    `
  },
  5: {
    title: "보드 설정 및 커스텀",
    badge: "가이드 05: 커스터마이징",
    icon: "fa-sliders",
    content: `
      <ul>
        <li><strong>가변 보드 크기</strong>: 3x3 격자(좁고 스피디한 퍼즐), 4x4(오리지널 표준), 5x5, 6x6(더 여유로운 초고득점용 대형 보드)을 실시간으로 선택할 수 있습니다. 보드 크기 전환 시 게임판이 크기에 맞춰 동적으로 재설정됩니다.</li>
        <li><strong>레이아웃 커스터마이징</strong>: 우측 슬라이더 제어판을 통해 개별 셀의 크기(50px~120px) 및 타일 간의 간격(2px~16px)을 취향에 맞게 실시간 픽셀 단위로 커스텀할 수 있어 화면 해상도에 최적화된 뷰를 구성합니다.</li>
        <li><strong>고대비 모드(High Contrast)</strong>: 네온 불광 컬러를 구별하기 힘든 사용자를 위해, 원색 계열의 고강도 명도 대비 배색과 굵은 검은색 테두리 형태의 고대비 스타일을 제공합니다.</li>
      </ul>
    `
  },
  6: {
    title: "AI 및 자동 관전 활용",
    badge: "가이드 06: 지능형 시뮬레이터",
    icon: "fa-brain",
    content: `
      <ul>
        <li><strong>AI 힌트 추천</strong>: 언제든지 'AI 힌트' 단추를 클릭하면, 내장된 1단계 휴리스틱 시뮬레이터가 현재 보드에서 가장 최선인 이동 방향을 연산하여 시각적으로 가이드합니다.</li>
        <li><strong>실시간 자동 관전(Autoplay)</strong>: '관전 시작'을 활성화하면 AI가 120ms~1000ms의 속도로 스스로 상황판을 판단해 조작하며 게임을 진행합니다. AI가 타일을 현란하게 합쳐나가는 과정을 실시간 관람할 수 있습니다.</li>
        <li><strong>연산 메커니즘</strong>: AI는 각 방향으로 이동했을 때의 가상의 보드판을 그린 뒤, 빈 셀 개수, 모서리 배치, 단조 정렬, 평탄도를 종합 채점하여 최고의 점수를 내는 방향을 자동 선택합니다.</li>
      </ul>
    `
  },
  7: {
    title: "난수 시드 및 리플레이",
    badge: "가이드 07: 시드와 리플레이",
    icon: "fa-key",
    content: `
      <p>동일한 게임 조건을 타인과 겨루거나 자신의 과거 게임을 복기할 수 있는 고급 시드 시스템을 제공합니다.</p>
      <ul>
        <li><strong>결정론적 난수(LCG)</strong>: Math.random() 대신 선형 합동 생성기(LCG) 기반의 결정론적 난수를 사용하여 동일한 시드 번호에서는 항상 동일한 위치와 종류의 타일이 생성됩니다.</li>
        <li><strong>동일 패턴 재현</strong>: 6자리의 숫자 시드(Seed)를 입력하면 동일한 무작위 타일 젠(Spawn) 순서가 설정되어, 언제든 동일한 퍼즐 조건으로 경기를 치를 수 있습니다.</li>
        <li><strong>리플레이 공유</strong>: 플레이 중인 게임의 난수 시드와 지금까지 조작한 키 히스토리(예: U, D, L, R 등)가 담긴 URL 링크를 복사하여 친구에게 공유할 수 있습니다. 친구가 해당 URL로 진입하면 내가 진행했던 판이 똑같이 재현되어 실력 대결이 가능합니다.</li>
      </ul>
    `
  },
  8: {
    title: "초급 공략 기법",
    badge: "가이드 08: 초보자 입문 전략",
    icon: "fa-graduation-cap",
    content: `
      <p>2048을 처음 시작하는 플레이어를 위한 대표적인 기본 공식 3가지입니다.</p>
      <ul>
        <li><strong>한 방향 배제하기</strong>: 4가지 방향 중 절대 사용하지 않을 단 하나의 방향을 정하세요. 보통 '위쪽(↑)'을 누르지 않는 전략이 가장 흔합니다.</li>
        <li><strong>한쪽 벽에 타일 몰아넣기</strong>: 타일들을 항상 아래쪽(↓)이나 왼쪽(←) 벽으로 몰아서 정돈하는 습관을 들이세요. 이렇게 하면 판 전체가 뒤엉키는 것을 막고 정밀하게 라인을 관리할 수 있습니다.</li>
        <li><strong>가장 큰 숫자는 모서리에</strong>: 가장 큰 숫자가 적힌 타일은 항상 구석(예: 왼쪽 아래 모서리)에 단단히 고정해야 합니다. 모서리 타일이 중앙으로 빠져나오면 보드가 빠르게 블로킹되어 게임오버로 이어지기 쉽습니다.</li>
      </ul>
    `
  },
  9: {
    title: "고급 공략 기법",
    badge: "가이드 09: 마스터 공략 전략",
    icon: "fa-trophy",
    content: `
      <p>4096 이상, 10만 점 이상의 초고득점을 얻기 위한 고급 정돈 기술입니다.</p>
      <ul>
        <li><strong>단조 감소 정렬(Monotonicity)</strong>: 모서리에 있는 가장 큰 타일을 기점으로 인접한 타일들이 1024 > 512 > 256 > 128처럼 내림차순 계단식으로 정렬되도록 배치하세요. 이렇게 정렬되면 작은 숫자들이 물 흐르듯 합쳐져서 순식간에 가장 큰 타일로 흡수됩니다.</li>
        <li><strong>라인 가득 채우기</strong>: 모서리에 가장 큰 숫자가 위치한 행이나 열은 빈자리 없이 타일로 가득 채워두세요. 빈자리가 있는 상태에서 반대 방향으로 밀면 모서리에 있던 큰 타일이 강제로 이동하면서 그 자리에 '2'나 '4' 같은 작은 타일이 스폰되어 게임이 꼬이게 됩니다.</li>
        <li><strong>장기적인 병합 예측</strong>: 힌트 연산기처럼 단순히 1스텝 앞만 보는 것이 아니라, 내가 왼쪽으로 밀었을 때 아래쪽에 있는 타일들이 어떻게 합쳐질지 2~3단계의 연쇄 충돌을 미리 계산하고 움직여야 4096 이상의 타일을 노릴 수 있습니다.</li>
      </ul>
    `
  },
  10: {
    title: "기대 효과",
    badge: "가이드 10: 인지 기능 발달",
    icon: "fa-bolt",
    content: `
      <ul>
        <li><strong>공간 논리력 및 수학 감각 향상</strong>: 2의 거듭제곱(2, 4, 8, 16, 32...)을 지속적으로 다루며 머릿속으로 격자판의 이동 경로를 시각화하므로, 직관적인 공간 기억 능력과 빠른 암산 능력이 증진됩니다.</li>
        <li><strong>단기 기억 및 주의 집중력 강화</strong>: 빈 공간을 유지하면서 다수의 타일을 순서대로 배열해야 하기 때문에 고도의 집중력이 필요하며, 뇌의 전두엽 활동을 활성화하는 데 유익한 자극을 줍니다.</li>
        <li><strong>스트레스 해소와 인지 기능 유지</strong>: 간단하면서도 명확한 피드백을 통해 뇌에 적절한 도파민 자극을 주며, 시니어 층에게는 치매 예방 및 두뇌 활성화 훈련 도구로도 유용하게 추천됩니다.</li>
      </ul>
    `
  },
  11: {
    title: "자주 묻는 질문 (FAQ)",
    badge: "가이드 11: FAQ",
    icon: "fa-question-circle",
    content: `
      <p><strong>Q. 2048 타일을 만들면 게임이 바로 끝나나요?</strong><br>A. 아니요! 2048을 달성하더라도 게임은 끝나지 않고 4096, 8192 그 이상의 신기록을 향해 계속해서 플레이할 수 있습니다.</p>
      <p><strong>Q. AI 관전(Autoplay) 중에 제가 키보드로 개입할 수 있나요?</strong><br>A. 네, 언제든지 방향키를 직접 입력해 개입할 수 있습니다. 하지만 AI 연산이 연속해서 실행되므로 직접 완벽히 다루려면 '관전 일시정지'를 한 후 조작하시는 것을 권장합니다.</p>
      <p><strong>Q. 되돌리기(Undo)를 쓰면 최고 기록(Best Score)도 같이 줄어드나요?</strong><br>A. 되돌리기를 사용하면 현재 스코어(Score)와 이동 횟수는 이전 상태로 온전히 롤백되지만, 이미 기록해 둔 최고 점수(Best Score)는 그대로 유지됩니다.</p>
    `
  }
};

// Global App State
let boardSize = 4;
let cellSize = 80;
let cellGap = 10;
let autoplayDelay = 250;
let isHardMode = false;
let highContrast = false;

// Game State variables
let grid = []; // 2D array representation (contains value or null)
let activeTiles = []; // list of active tile objects: { id, row, col, value, element }
let tileIdCounter = 0;
let score = 0;
let bestScore = 0;
let movesCount = 0;
let initialSeed = 0;
let currentSeedState = 0;
let lcg = null;
let keyHistory = []; // Key input history: "L", "R", "U", "D"
let undoStack = []; // stores maximum 20 previous states for rollbacks
let hasWon = false;
let continuePlaying = false;
let isGameOver = false;

// AI state
let autoplayTimer = null;
let isAutoplayActive = false;

// Replay state
let replayMoves = [];
let isReplaying = false;
let replayIndex = 0;
let replayTimer = null;

// DOM Elements cache
const gridBoard = document.getElementById("grid-board");
const selectBoardSize = document.getElementById("select-board-size");
const btnNewGame = document.getElementById("btn-new-game");
const btnUndo = document.getElementById("btn-undo");
const lblUndoCount = document.getElementById("undo-count");
const btnHint = document.getElementById("btn-hint");
const btnAutoplay = document.getElementById("btn-autoplay");
const btnToggleContrast = document.getElementById("btn-toggle-contrast");
const btnSettingsToggle = document.getElementById("btn-settings-toggle");
const settingsPanel = document.getElementById("settings-panel");

const sliderCellSize = document.getElementById("slider-cell-size");
const lblCellSize = document.getElementById("label-cell-size");
const sliderCellGap = document.getElementById("slider-cell-gap");
const lblCellGap = document.getElementById("label-cell-gap");
const sliderAutoplaySpeed = document.getElementById("slider-autoplay-speed");
const lblAutoplaySpeed = document.getElementById("label-autoplay-speed");
const chkHardMode = document.getElementById("chk-hard-mode");

const inputSeed = document.getElementById("input-seed");
const btnApplySeed = document.getElementById("btn-apply-seed");
const btnCopySeed = document.getElementById("btn-copy-seed");
const btnCopyReplay = document.getElementById("btn-copy-replay");

const lblScore = document.getElementById("lbl-score");
const lblBest = document.getElementById("lbl-best");
const lblMoves = document.getElementById("lbl-moves");
const lblMaxTile = document.getElementById("lbl-max-tile");
const lblCurrentSeed = document.getElementById("lbl-current-seed");

const boardGameoverOverlay = document.getElementById("board-gameover-overlay");
const boardWinOverlay = document.getElementById("board-win-overlay");
const btnOverlayRetry = document.getElementById("btn-overlay-retry");
const btnOverlayContinue = document.getElementById("btn-overlay-continue");
const btnOverlayWinRetry = document.getElementById("btn-overlay-win-retry");

const aiHintDirection = document.getElementById("ai-hint-direction");
const aiScoresList = document.getElementById("ai-scores-list");

// TOC Display Elements
const explanationBoardContent = document.getElementById("explanation-board-content");
const explanationTitleBadge = document.getElementById("explanation-title-badge");
const explanationDisplayTitle = document.getElementById("explanation-display-title");
const explanationDisplayText = document.getElementById("explanation-display-text");
const tocListItems = document.querySelectorAll(".explanation-index-list li");

// Core LocalStorage key
const BEST_SCORE_LS_KEY = "aho_2048_best_score";

// -------------------------------------------------------------
// Initialization
// -------------------------------------------------------------
function init() {
  loadBestScore();
  setupEventListeners();
  
  // Read query params for seed/replay
  const urlParams = new URLSearchParams(window.location.search);
  const paramSeed = urlParams.get("seed");
  const paramReplay = urlParams.get("replay");
  
  if (paramSeed) {
    initialSeed = parseInt(paramSeed, 10) || 0;
    inputSeed.value = initialSeed;
  } else {
    generateNewRandomSeed();
  }
  
  if (paramReplay) {
    replayMoves = paramReplay.split("");
    isReplaying = true;
  }
  
  // Resize board first
  updateBoardStyles();
  
  // Start Game
  newGame(true);

  // If replay is active, start replay simulation after a short delay
  if (isReplaying && replayMoves.length > 0) {
    startReplayPlayback();
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Configs
  selectBoardSize.addEventListener("change", (e) => {
    boardSize = parseInt(e.target.value, 10);
    updateBoardStyles();
    newGame();
  });
  
  btnNewGame.addEventListener("click", () => {
    isReplaying = false;
    clearReplayPlayback();
    generateNewRandomSeed();
    newGame();
  });

  btnUndo.addEventListener("click", () => {
    if (isAutoplayActive) stopAutoplay();
    undo();
  });

  btnHint.addEventListener("click", () => {
    showAIHint();
  });

  btnAutoplay.addEventListener("click", () => {
    toggleAutoplay();
  });

  btnToggleContrast.addEventListener("click", () => {
    highContrast = !highContrast;
    document.documentElement.setAttribute("data-contrast", highContrast ? "true" : "false");
    btnToggleContrast.classList.toggle("active", highContrast);
  });

  btnSettingsToggle.addEventListener("click", () => {
    if (settingsPanel.style.display === "none") {
      settingsPanel.style.display = "block";
      btnSettingsToggle.classList.add("active");
    } else {
      settingsPanel.style.display = "none";
      btnSettingsToggle.classList.remove("active");
    }
  });

  // Settings inputs
  sliderCellSize.addEventListener("input", (e) => {
    cellSize = parseInt(e.target.value, 10);
    lblCellSize.textContent = `${cellSize}px`;
    updateBoardStyles();
    repaintTiles();
  });

  sliderCellGap.addEventListener("input", (e) => {
    cellGap = parseInt(e.target.value, 10);
    lblCellGap.textContent = `${cellGap}px`;
    updateBoardStyles();
    repaintTiles();
  });

  sliderAutoplaySpeed.addEventListener("input", (e) => {
    autoplayDelay = parseInt(e.target.value, 10);
    lblAutoplaySpeed.textContent = `${autoplayDelay}ms`;
    if (isAutoplayActive) {
      // restart timer with new speed
      stopAutoplay();
      startAutoplay();
    }
  });

  chkHardMode.addEventListener("change", (e) => {
    isHardMode = e.target.checked;
  });

  // Seed controls
  btnApplySeed.addEventListener("click", () => {
    isReplaying = false;
    clearReplayPlayback();
    const seedVal = parseInt(inputSeed.value, 10);
    if (!isNaN(seedVal)) {
      initialSeed = seedVal;
    } else {
      generateNewRandomSeed();
    }
    newGame();
  });

  btnCopySeed.addEventListener("click", () => {
    navigator.clipboard.writeText(initialSeed.toString()).then(() => {
      alert(`시드가 클립보드에 복사되었습니다: ${initialSeed}`);
    });
  });

  btnCopyReplay.addEventListener("click", () => {
    const replayStr = keyHistory.join("");
    const url = `${window.location.origin}${window.location.pathname}?seed=${initialSeed}&replay=${replayStr}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("리플레이 공유 링크가 클립보드에 복사되었습니다!");
    });
  });

  // Overlays
  btnOverlayRetry.addEventListener("click", () => {
    boardGameoverOverlay.style.display = "none";
    newGame();
  });

  btnOverlayContinue.addEventListener("click", () => {
    boardWinOverlay.style.display = "none";
    continuePlaying = true;
  });

  btnOverlayWinRetry.addEventListener("click", () => {
    boardWinOverlay.style.display = "none";
    newGame();
  });

  // Keyboard controls
  window.addEventListener("keydown", (e) => {
    if (isGameOver || isReplaying) return;
    
    // Skip key controls if user is typing in the seed input box
    if (document.activeElement === inputSeed) return;

    let dir = null;
    switch(e.key.toLowerCase()) {
      case "arrowup":
      case "w":
        dir = "U";
        break;
      case "arrowdown":
      case "s":
        dir = "D";
        break;
      case "arrowleft":
      case "a":
        dir = "L";
        break;
      case "arrowright":
      case "d":
        dir = "R";
        break;
      case "z":
      case "u":
        undo();
        e.preventDefault();
        return;
    }

    if (dir) {
      e.preventDefault();
      // If Autoplay is active, direct keypress pauses it
      if (isAutoplayActive) stopAutoplay();
      executeMove(dir);
    }
  });

  // Mobile Swipe controls
  let touchStartX = 0;
  let touchStartY = 0;
  gridBoard.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  gridBoard.addEventListener("touchend", (e) => {
    if (isGameOver || isReplaying) return;
    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;
    
    let diffX = touchEndX - touchStartX;
    let diffY = touchEndY - touchStartY;
    
    // minimum swipe threshold 30px
    if (Math.max(Math.abs(diffX), Math.abs(diffY)) < 30) return;
    
    let dir = null;
    if (Math.abs(diffX) > Math.abs(diffY)) {
      dir = diffX > 0 ? "R" : "L";
    } else {
      dir = diffY > 0 ? "D" : "U";
    }
    
    if (dir) {
      if (isAutoplayActive) stopAutoplay();
      executeMove(dir);
    }
  }, { passive: true });

  // Floating menu actions
  document.getElementById("btn-scroll-top").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.getElementById("btn-scroll-bottom").addEventListener("click", () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  });

  // TOC navigation list clicks
  tocListItems.forEach((li) => {
    li.addEventListener("click", () => {
      tocListItems.forEach(item => item.classList.remove("active"));
      li.classList.add("active");
      
      const idx = parseInt(li.getAttribute("data-index"), 10);
      switchTOCArticle(idx);
    });
  });
}

// Swaps TOC contents with fade transitions
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
// Seed Control & Score Loading
// -------------------------------------------------------------
function generateNewRandomSeed() {
  initialSeed = Math.floor(Math.random() * 900000) + 100000;
  inputSeed.value = initialSeed;
}

function loadBestScore() {
  const stored = localStorage.getItem(BEST_SCORE_LS_KEY);
  bestScore = parseInt(stored, 10) || 0;
  lblBest.textContent = bestScore;
}

function saveBestScore() {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem(BEST_SCORE_LS_KEY, bestScore);
    lblBest.textContent = bestScore;
  }
}

// -------------------------------------------------------------
// Core UI Update
// -------------------------------------------------------------
function updateBoardStyles() {
  document.documentElement.style.setProperty("--board-size", boardSize);
  document.documentElement.style.setProperty("--tile-size", `${cellSize}px`);
  document.documentElement.style.setProperty("--tile-gap", `${cellGap}px`);
  
  // Re-generate background slots
  gridBoard.innerHTML = "";
  for (let i = 0; i < boardSize * boardSize; i++) {
    const slot = document.createElement("div");
    slot.className = "grid-cell";
    gridBoard.appendChild(slot);
  }
}

// Repaints absolute positions of all tiles (useful on slider change)
function repaintTiles() {
  activeTiles.forEach((tile) => {
    tile.element.style.left = tile.col * (cellSize + cellGap) + cellGap + "px";
    tile.element.style.top = tile.row * (cellSize + cellGap) + cellGap + "px";
  });
}

// -------------------------------------------------------------
// Game Logic Engines
// -------------------------------------------------------------
function newGame(skipSeedGen = false) {
  // Cancel autoplay / replays
  stopAutoplay();
  clearReplayPlayback();

  // Clear elements
  activeTiles.forEach(tile => tile.element.remove());
  activeTiles = [];
  tileIdCounter = 0;
  
  score = 0;
  movesCount = 0;
  keyHistory = [];
  undoStack = [];
  hasWon = false;
  continuePlaying = false;
  isGameOver = false;
  
  // Reset overlay
  boardGameoverOverlay.style.display = "none";
  boardWinOverlay.style.display = "none";
  
  // Set LCG
  currentSeedState = initialSeed;
  lcg = new LCG(initialSeed);
  lblCurrentSeed.textContent = initialSeed;

  // Initialize board matrix
  grid = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
  
  // Spawn initial 2 tiles
  spawnTile();
  spawnTile();
  
  updateScoresUI();
  updateUndoButton();
  updateAIHintDisplay();
}

function updateScoresUI() {
  lblScore.textContent = score;
  saveBestScore();
  lblMoves.textContent = movesCount;
  
  let maxTileVal = 0;
  activeTiles.forEach(tile => {
    if (tile.value > maxTileVal) maxTileVal = tile.value;
  });
  lblMaxTile.textContent = maxTileVal || 2;
}

function updateUndoButton() {
  btnUndo.disabled = undoStack.length === 0;
  lblUndoCount.textContent = undoStack.length;
}

// Spawns a random tile (2 or 4) on an empty grid spot
function spawnTile() {
  const emptySpots = [];
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (grid[r][c] === null) {
        emptySpots.push({ row: r, col: c });
      }
    }
  }
  
  if (emptySpots.length === 0) return;
  
  // Choose empty spot using deterministic LCG RNG
  const randIndex = lcg.nextInt(0, emptySpots.length - 1);
  const spot = emptySpots[randIndex];
  
  // Determine tile value: In hard mode, higher chance of spawning a 4
  const chanceOf4 = isHardMode ? 0.35 : 0.10;
  const tileVal = lcg.next() < chanceOf4 ? 4 : 2;
  
  createTileElement(spot.row, spot.col, tileVal);
}

function createTileElement(row, col, value) {
  tileIdCounter++;
  const tileEl = document.createElement("div");
  tileEl.className = `tile-item tile-${value} tile-new`;
  tileEl.textContent = value;
  
  // Position absolutely
  tileEl.style.left = col * (cellSize + cellGap) + cellGap + "px";
  tileEl.style.top = row * (cellSize + cellGap) + cellGap + "px";
  
  gridBoard.appendChild(tileEl);
  
  // Cache tile object
  const tile = {
    id: tileIdCounter,
    row: row,
    col: col,
    value: value,
    element: tileEl
  };
  
  grid[row][col] = tile;
  activeTiles.push(tile);
  
  // Remove tile-new class after animation completes
  setTimeout(() => {
    tileEl.classList.remove("tile-new");
  }, 200);
}

// Saves board snapshot to rollback history (Max 20 states)
function saveUndoState() {
  const tilesSnapshot = activeTiles.map(t => {
    return { row: t.row, col: t.col, value: t.value };
  });
  
  undoStack.push({
    tiles: tilesSnapshot,
    score: score,
    moves: movesCount,
    seedState: lcg.seed,
    keyHistory: [...keyHistory]
  });
  
  if (undoStack.length > 20) {
    undoStack.shift();
  }
  updateUndoButton();
}

// Rolls back one move
function undo() {
  if (undoStack.length === 0) return;
  
  const prevState = undoStack.pop();
  
  // Remove all current tiles from DOM
  activeTiles.forEach(tile => tile.element.remove());
  activeTiles = [];
  grid = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
  
  score = prevState.score;
  movesCount = prevState.moves;
  lcg.seed = prevState.seedState;
  keyHistory = prevState.keyHistory;
  
  // Re-create tiles
  prevState.tiles.forEach(tSnapshot => {
    createTileElement(tSnapshot.row, tSnapshot.col, tSnapshot.value);
  });
  
  isGameOver = false;
  boardGameoverOverlay.style.display = "none";
  
  updateScoresUI();
  updateUndoButton();
  updateAIHintDisplay();
}

// Execute movement vector logic
function executeMove(direction) {
  if (isGameOver) return;
  
  // Direction vectors
  let vector = { x: 0, y: 0 };
  if (direction === "U") vector = { x: 0, y: -1 };
  if (direction === "D") vector = { x: 0, y: 1 };
  if (direction === "L") vector = { x: -1, y: 0 };
  if (direction === "R") vector = { x: 1, y: 0 };
  
  // Sort tiles to slide border-wise first
  let traverseRows = [];
  let traverseCols = [];
  for (let i = 0; i < boardSize; i++) {
    traverseRows.push(i);
    traverseCols.push(i);
  }
  if (direction === "D") traverseRows.reverse();
  if (direction === "R") traverseCols.reverse();
  
  let tileMoved = false;
  let scoreGained = 0;
  
  // Track merges inside this move
  const mergedIds = new Set();
  
  // Pre-save state for undo
  let stateSaved = false;
  
  traverseRows.forEach((r) => {
    traverseCols.forEach((c) => {
      const tile = grid[r][c];
      if (tile) {
        let currentR = r;
        let currentC = c;
        
        // Find furthest empty cell or merge target
        let nextR = currentR + vector.y;
        let nextC = currentC + vector.x;
        
        while (nextR >= 0 && nextR < boardSize && nextC >= 0 && nextC < boardSize) {
          const targetTile = grid[nextR][nextC];
          
          if (targetTile === null) {
            // Can move to this empty spot
            currentR = nextR;
            currentC = nextC;
          } else {
            // Hits another tile
            if (targetTile.value === tile.value && !mergedIds.has(targetTile.id) && !mergedIds.has(tile.id)) {
              // Merge!
              if (!stateSaved) {
                saveUndoState();
                stateSaved = true;
              }
              
              grid[r][c] = null;
              
              // Slide moving tile to target
              tile.row = nextR;
              tile.col = nextC;
              tile.element.style.left = nextC * (cellSize + cellGap) + cellGap + "px";
              tile.element.style.top = nextR * (cellSize + cellGap) + cellGap + "px";
              
              // Double target tile value
              targetTile.value *= 2;
              scoreGained += targetTile.value;
              
              // CSS visual update for merged
              const movingEl = tile.element;
              const targetEl = targetTile.element;
              
              // Mark target as merged
              mergedIds.add(targetTile.id);
              
              setTimeout(() => {
                movingEl.remove();
                targetEl.className = `tile-item tile-${targetTile.value} tile-merged`;
                targetEl.textContent = targetTile.value;
                
                // remove animation class later
                setTimeout(() => {
                  targetEl.classList.remove("tile-merged");
                }, 250);
              }, 100);
              
              // Remove merged tile from active list
              activeTiles = activeTiles.filter(t => t.id !== tile.id);
              tileMoved = true;
            }
            break; // hit a tile, stop searching direction
          }
          nextR += vector.y;
          nextC += vector.x;
        }
        
        // Simply slide to empty space
        if (currentR !== r || currentC !== c) {
          if (!stateSaved) {
            saveUndoState();
            stateSaved = true;
          }
          grid[r][c] = null;
          grid[currentR][currentC] = tile;
          tile.row = currentR;
          tile.col = currentC;
          
          tile.element.style.left = currentC * (cellSize + cellGap) + cellGap + "px";
          tile.element.style.top = currentR * (cellSize + cellGap) + cellGap + "px";
          
          tileMoved = true;
        }
      }
    });
  });
  
  if (tileMoved) {
    score += scoreGained;
    movesCount++;
    keyHistory.push(direction);
    
    // Spawn new tile after transition ends
    setTimeout(() => {
      spawnTile();
      updateScoresUI();
      checkGameStatus();
      updateAIHintDisplay();
    }, 110);
  }
}

// Checks if board has won (reached 2048) or lost
function checkGameStatus() {
  // Check Win condition
  if (!hasWon && !continuePlaying) {
    const reach2048 = activeTiles.some(t => t.value === 2048);
    if (reach2048) {
      hasWon = true;
      boardWinOverlay.style.display = "flex";
      if (isAutoplayActive) stopAutoplay();
      return;
    }
  }
  
  // Check Lose condition
  // If empty cells exist, game is not over
  const hasEmptyCells = activeTiles.length < boardSize * boardSize;
  if (hasEmptyCells) return;
  
  // If adjacent cells have same value, we can still move
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      const tile = grid[r][c];
      if (tile) {
        // right
        if (c < boardSize - 1) {
          const rightTile = grid[r][c+1];
          if (rightTile && rightTile.value === tile.value) return;
        }
        // down
        if (r < boardSize - 1) {
          const downTile = grid[r+1][c];
          if (downTile && downTile.value === tile.value) return;
        }
      }
    }
  }
  
  // No moves possible -> GAME OVER
  isGameOver = true;
  boardGameoverOverlay.style.display = "flex";
  if (isAutoplayActive) stopAutoplay();
}

// -------------------------------------------------------------
// Heuristic AI Engine
// -------------------------------------------------------------
function simulateBoardMove(boardMatrix, direction) {
  const size = boardMatrix.length;
  let tempBoard = boardMatrix.map(row => [...row]);
  
  let vector = { x: 0, y: 0 };
  if (direction === "U") vector = { x: 0, y: -1 };
  if (direction === "D") vector = { x: 0, y: 1 };
  if (direction === "L") vector = { x: -1, y: 0 };
  if (direction === "R") vector = { x: 1, y: 0 };
  
  let traverseRows = [];
  let traverseCols = [];
  for (let i = 0; i < size; i++) {
    traverseRows.push(i);
    traverseCols.push(i);
  }
  if (direction === "D") traverseRows.reverse();
  if (direction === "R") traverseCols.reverse();
  
  let moved = false;
  let scoreGained = 0;
  
  const mergedCells = Array(size).fill(null).map(() => Array(size).fill(false));
  
  traverseRows.forEach((r) => {
    traverseCols.forEach((c) => {
      const val = tempBoard[r][c];
      if (val !== 0) {
        let currR = r;
        let currC = c;
        
        let nextR = currR + vector.y;
        let nextC = currC + vector.x;
        
        while (nextR >= 0 && nextR < size && nextC >= 0 && nextC < size) {
          const targetVal = tempBoard[nextR][nextC];
          
          if (targetVal === 0) {
            currR = nextR;
            currC = nextC;
          } else {
            if (targetVal === val && !mergedCells[nextR][nextC] && !mergedCells[r][c]) {
              tempBoard[r][c] = 0;
              tempBoard[nextR][nextC] = val * 2;
              scoreGained += val * 2;
              mergedCells[nextR][nextC] = true;
              moved = true;
            }
            break;
          }
          nextR += vector.y;
          nextC += vector.x;
        }
        
        if (currR !== r || currC !== c) {
          tempBoard[currR][currC] = val;
          tempBoard[r][c] = 0;
          moved = true;
        }
      }
    });
  });
  
  return { board: tempBoard, moved: moved, score: scoreGained };
}

// 1-step heuristic score calculator
function getHeuristicScore(boardMatrix) {
  const size = boardMatrix.length;
  let score = 0;
  
  // 1. Empty spots
  let emptyCount = 0;
  let maxVal = 0;
  let maxR = 0;
  let maxC = 0;
  
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const val = boardMatrix[r][c];
      if (val === 0) {
        emptyCount++;
      } else {
        if (val > maxVal) {
          maxVal = val;
          maxR = r;
          maxC = c;
        }
      }
    }
  }
  
  score += emptyCount * 600;
  
  // 2. Cornering max tile
  const cornerBonus = maxVal * 2.5;
  const isCorner = (maxR === 0 && maxC === 0) ||
                   (maxR === 0 && maxC === size - 1) ||
                   (maxR === size - 1 && maxC === 0) ||
                   (maxR === size - 1 && maxC === size - 1);
  if (isCorner) {
    score += cornerBonus;
  } else {
    score -= maxVal * 1.5;
  }
  
  // 3. Monotonicity
  let monotonicity = 0;
  
  // Rows ordering check
  for (let r = 0; r < size; r++) {
    let inc = 0;
    let dec = 0;
    for (let c = 0; c < size - 1; c++) {
      let current = boardMatrix[r][c] ? Math.log2(boardMatrix[r][c]) : 0;
      let next = boardMatrix[r][c+1] ? Math.log2(boardMatrix[r][c+1]) : 0;
      if (current >= next) {
        dec += (current - next);
      } else {
        inc += (next - current);
      }
    }
    monotonicity += Math.max(inc, dec);
  }
  
  // Cols ordering check
  for (let c = 0; c < size; c++) {
    let inc = 0;
    let dec = 0;
    for (let r = 0; r < size - 1; r++) {
      let current = boardMatrix[r][c] ? Math.log2(boardMatrix[r][c]) : 0;
      let next = boardMatrix[r+1][c] ? Math.log2(boardMatrix[r+1][c]) : 0;
      if (current >= next) {
        dec += (current - next);
      } else {
        inc += (next - current);
      }
    }
    monotonicity += Math.max(inc, dec);
  }
  
  score += monotonicity * 120;
  
  // 4. Smoothness
  let smoothness = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (boardMatrix[r][c] !== 0) {
        let val = Math.log2(boardMatrix[r][c]);
        // right
        if (c < size - 1 && boardMatrix[r][c+1] !== 0) {
          smoothness -= Math.abs(val - Math.log2(boardMatrix[r][c+1]));
        }
        // down
        if (r < size - 1 && boardMatrix[r+1][c] !== 0) {
          smoothness -= Math.abs(val - Math.log2(boardMatrix[r+1][c]));
        }
      }
    }
  }
  
  score += smoothness * 80;
  return score;
}

// Compute scores for all directions
function computeAIDirections() {
  // Convert grid board to simple matrix representation
  const matrix = Array(boardSize).fill(0).map(() => Array(boardSize).fill(0));
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      matrix[r][c] = grid[r][c] ? grid[r][c].value : 0;
    }
  }
  
  const directions = ["U", "D", "L", "R"];
  const results = {};
  
  let bestScore = -Infinity;
  let bestDir = null;
  
  directions.forEach(dir => {
    const sim = simulateBoardMove(matrix, dir);
    if (!sim.moved) {
      results[dir] = -Infinity;
    } else {
      const hScore = getHeuristicScore(sim.board) + sim.score;
      results[dir] = Math.round(hScore);
      if (hScore > bestScore) {
        bestScore = hScore;
        bestDir = dir;
      }
    }
  });
  
  return { bestDir, bestScore, results };
}

// Highlights UI recommended direction and displays calculated weights
function updateAIHintDisplay() {
  if (isGameOver) {
    aiHintDirection.innerHTML = "추천 방향: <span>종료</span>";
    aiScoresList.innerHTML = `
      <div>↑ 위: -</div>
      <div>↓ 아래: -</div>
      <div>← 왼쪽: -</div>
      <div>→ 오른쪽: -</div>
    `;
    return;
  }
  
  const analysis = computeAIDirections();
  
  let arrow = "";
  let word = "대기";
  if (analysis.bestDir === "U") { arrow = "↑"; word = "위"; }
  if (analysis.bestDir === "D") { arrow = "↓"; word = "아래"; }
  if (analysis.bestDir === "L") { arrow = "←"; word = "왼쪽"; }
  if (analysis.bestDir === "R") { arrow = "→"; word = "오른쪽"; }
  
  if (analysis.bestDir) {
    aiHintDirection.innerHTML = `추천 방향: <span class="arrow-dir">${arrow} ${word}</span>`;
  } else {
    aiHintDirection.innerHTML = "추천 방향: <span>없음 (정체)</span>";
  }
  
  const formatScore = (val) => val === -Infinity ? "이동 불가" : val.toLocaleString();
  
  aiScoresList.innerHTML = `
    <div><span>↑ 위:</span> <strong>${formatScore(analysis.results.U)}</strong></div>
    <div><span>↓ 아래:</span> <strong>${formatScore(analysis.results.D)}</strong></div>
    <div><span>← 왼쪽:</span> <strong>${formatScore(analysis.results.L)}</strong></div>
    <div><span>→ 오른쪽:</span> <strong>${formatScore(analysis.results.R)}</strong></div>
  `;
}

// Triggers hint display flash
function showAIHint() {
  updateAIHintDisplay();
  const analysis = computeAIDirections();
  if (analysis.bestDir) {
    // temporarily flash the button with recommended move border
    const mapBtnWord = { "U": "위 (↑)", "D": "아래 (↓)", "L": "왼쪽 (←)", "R": "오른쪽 (→)" };
    alert(`AI 추천 한 수: ${mapBtnWord[analysis.bestDir]} (연산 스코어: ${analysis.bestScore.toLocaleString()})`);
  } else {
    alert("움직일 수 있는 방향이 없습니다!");
  }
}

// -------------------------------------------------------------
// Autoplay (관전) Mode Loop
// -------------------------------------------------------------
function toggleAutoplay() {
  if (isAutoplayActive) {
    stopAutoplay();
  } else {
    startAutoplay();
  }
}

function startAutoplay() {
  if (isGameOver) return;
  isAutoplayActive = true;
  btnAutoplay.innerHTML = '<i class="fa-solid fa-pause"></i> 관전 중단';
  btnAutoplay.classList.add("active");
  
  autoplayTimer = setInterval(() => {
    if (isGameOver) {
      stopAutoplay();
      return;
    }
    
    const analysis = computeAIDirections();
    if (analysis.bestDir) {
      executeMove(analysis.bestDir);
    } else {
      stopAutoplay();
    }
  }, autoplayDelay);
}

function stopAutoplay() {
  isAutoplayActive = false;
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
  btnAutoplay.innerHTML = '<i class="fa-solid fa-play"></i> 관전 시작 (Autoplay)';
  btnAutoplay.classList.remove("active");
}

// -------------------------------------------------------------
// Replay Share playback Loop
// -------------------------------------------------------------
function startReplayPlayback() {
  if (replayMoves.length === 0) return;
  
  isReplaying = true;
  replayIndex = 0;
  
  // Add indicator to score title
  lblCurrentSeed.innerHTML = `${initialSeed} <span style="font-size: 0.72rem; color: #fbbf24;">(Replaying...)</span>`;
  
  replayTimer = setInterval(() => {
    if (replayIndex >= replayMoves.length || isGameOver) {
      clearReplayPlayback();
      return;
    }
    
    const nextMove = replayMoves[replayIndex];
    executeMove(nextMove);
    replayIndex++;
  }, 350); // replay playback with standard 350ms speed
}

function clearReplayPlayback() {
  isReplaying = false;
  if (replayTimer) {
    clearInterval(replayTimer);
    replayTimer = null;
  }
  lblCurrentSeed.textContent = initialSeed;
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => {
  init();
  
  // Set default TOC text
  switchTOCArticle(1);
});
