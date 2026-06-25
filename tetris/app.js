// CineAHO Tetris (Legendary Block) Game Logic

// ==========================================
// 1. Tetromino Shapes & Configurations
// ==========================================

const SHAPES = {
  1: { // I (Cyan)
    matrix: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: '#00f2fe',
    shadow: 'rgba(0, 242, 254, 0.5)'
  },
  2: { // J (Blue)
    matrix: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#3b82f6',
    shadow: 'rgba(59, 130, 246, 0.5)'
  },
  3: { // L (Orange)
    matrix: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#f97316',
    shadow: 'rgba(249, 115, 22, 0.5)'
  },
  4: { // O (Yellow)
    matrix: [
      [1, 1],
      [1, 1]
    ],
    color: '#facc15',
    shadow: 'rgba(250, 204, 21, 0.5)'
  },
  5: { // S (Green)
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: '#10b981',
    shadow: 'rgba(16, 185, 129, 0.5)'
  },
  6: { // T (Purple)
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#a855f7',
    shadow: 'rgba(168, 85, 247, 0.5)'
  },
  7: { // Z (Red)
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: '#ef4444',
    shadow: 'rgba(239, 68, 68, 0.5)'
  }
};

// ==========================================
// 2. 9-part Documentation Guide Dataset
// ==========================================

const EXPLANATION_DATA = {
  1: {
    title: "테트리스의 역사",
    badge: "가이드 01: 테트리스의 역사",
    content: `
      <p>테트리스(Tetris)는 1984년 6월 6일, 소련 과학 아카데미의 연구원이었던 <strong>알렉세이 파지트노프</strong>가 전자공학 컴퓨터 장비에서 가볍게 플레이하기 위해 만든 퍼즐 게임입니다.</p>
      <p>게임 명칭은 네 개를 뜻하는 그리스어 접두사 <strong>테트라(Tetra)</strong>와 개발자가 좋아하던 스포츠인 <strong>테니스(Tennis)</strong>를 결합해 명명되었습니다. 닌텐도 게임보이로 이식되어 전 세계적으로 수억 장이 판매되며 비디오 게임 역사상 가장 상징적이고 중독성 높은 클래식 퍼즐로 왕좌를 차지했습니다.</p>
    `
  },
  2: {
    title: "게임 소개",
    badge: "가이드 02: 게임 소개",
    content: `
      <p>본 <strong>LEGENDARY BLOCK</strong>은 테트리스의 클래식 물리와 정규 룰을 세련된 그래픽으로 이식한 모던 퍼즐 블록 게임입니다.</p>
      <p>가로 10칸, 세로 20칸 격자의 보드 위에 무작위 순서로 떨어지는 테트로미노 블록들을 빈틈없이 끼워 맞추어 한 줄을 채우는 것이 목적입니다. 레벨에 따라 낙하 스피드가 빨라지며, 다양한 모드(데일리 챌린지, 하드코어 모드)와 고스트 가이드라인 등의 풍성한 인프라를 완비하고 있습니다.</p>
    `
  },
  3: {
    title: "테트로미노 완벽 가이드",
    badge: "가이드 03: 테트로미노 완벽 가이드",
    content: `
      <p>게임에 등장하는 7종의 블록은 4개의 정사각형이 모여 만들어진 기하학적 도형으로, <strong>'테트로미노(Tetromino)'</strong>라고 칭합니다:</p>
      <ul>
        <li><strong>I-블록 (Cyan 하늘):</strong> 4x1 한 줄 블록으로, 4줄을 동시에 없애는 '테트리스'의 유일한 카드입니다.</li>
        <li><strong>O-블록 (Yellow 노랑):</strong> 2x2 정사각형 블록으로, 회전해도 모양이 일정합니다.</li>
        <li><strong>T-블록 (Purple 보라):</strong> 凸자 형태로, 고난도 기술인 'T-Spin'에 필수적으로 활용됩니다.</li>
        <li><strong>J-블록 (Blue 파랑) & L-블록 (Orange 주황):</strong> 대칭을 이루는 ㄱ자 모양 블록입니다.</li>
        <li><strong>S-블록 (Green 초록) & Z-블록 (Red 빨강):</strong> 지그재그 모양으로 얽힌 대칭형 블록입니다.</li>
      </ul>
    `
  },
  4: {
    title: "조작법 가이드",
    badge: "가이드 04: 조작법 가이드",
    content: `
      <p>기본 키보드 조작법을 익혀 빠른 속도에 대응하세요:</p>
      <ul>
        <li><strong>좌우 이동 (← , →):</strong> 블록을 왼쪽 또는 오른쪽으로 1칸씩 수평 이동합니다.</li>
        <li><strong>회전 (↑ 또는 Z):</strong> 시계 방향 또는 반시계 방향으로 블록을 90도 회전합니다. (회전 충돌 시 Wall Kick 지원)</li>
        <li><strong>소프트 드롭 (↓):</strong> 하강 속도를 빠르게 증가시킵니다.</li>
        <li><strong>하드 드롭 (Space):</strong> 바닥으로 즉시 떨어뜨려 잠금(Lock) 처리를 합니다.</li>
        <li><strong>홀드 (C):</strong> 현재 조작 중인 블록을 보관함에 넣거나 교환합니다 (턴당 1회).</li>
        <li><strong>일시정지 (P):</strong> 게임을 멈추거나 재개합니다.</li>
      </ul>
    `
  },
  5: {
    title: "게임 플레이 방법",
    badge: "가이드 05: 게임 플레이 방법",
    content: `
      <p>블록을 배치하고 라인을 정화해 나가는 표준 순서입니다:</p>
      <ol>
        <li>무작위 생성기(7-bag 무작위 방식)가 낙하할 블록과 우측 'NEXT' 대기열의 다음 블록 3개를 대령합니다.</li>
        <li>블록이 하강할 때 바닥에 닿기 직전까지 방향키로 위치를 이동하고 회전시킵니다.</li>
        <li>바닥에 빈틈이 생기지 않도록 가로 한 줄(10칸)을 꽉 채우면 해당 줄이 제거되고 점수를 얻습니다.</li>
        <li>블록이 보드 맨 위의 소환 한계선(세로 20층)을 초과하여 더 이상 들어설 자리가 없으면 게임오버(Game Over)가 선언됩니다.</li>
      </ol>
    `
  },
  6: {
    title: "점수 시스템",
    badge: "가이드 06: 점수 시스템",
    content: `
      <p>한 번에 여러 줄을 제거할수록 비약적으로 높은 기본 점수 배율이 적용됩니다 (현재 레벨이 비례하여 곱해집니다):</p>
      <ul>
        <li><strong>1줄 클리어:</strong> 100점 * 레벨</li>
        <li><strong>2줄 클리어:</strong> 300점 * 레벨</li>
        <li><strong>3줄 클리어:</strong> 500점 * 레벨</li>
        <li><strong>4줄 클리어 (TETRIS):</strong> 800점 * 레벨 (클리어 시 네온 이펙트 렌더링!)</li>
        <li><strong>콤보 보너스:</strong> 연속해서 끊김 없이 라인을 제거할 때마다 보너스 보상이 스코어보드에 복리로 누적 가산됩니다.</li>
      </ul>
    `
  },
  7: {
    title: "고급 기술",
    badge: "가이드 07: 고급 기술",
    content: `
      <p>고급 스피드 대국을 돌파하기 위한 테크니컬 스킬 기법입니다:</p>
      <ul>
        <li><strong>Wall Kick (벽차기):</strong> 블록이 벽에 바짝 달라붙거나 좁은 틈에 가로막혀 회전할 수 없을 때, 시스템이 자동으로 좌/우/위 공간을 스캔하여 약간 밀어내며 강제로 회전시켜 주는 메커니즘입니다.</li>
        <li><strong>Lock Delay (잠금 지연):</strong> 블록이 바닥에 도착한 뒤 즉시 굳지 않고 약 0.5초 동안 회전이나 이동 조작을 허용해 줍니다. 이를 통해 미끄러지듯 구석 틈새로 끼워 맞추는 조율이 가능합니다.</li>
        <li><strong>Hold Swapping:</strong> 곤란한 블록(예: Z, S)이 왔을 때 C키로 홀드해 두고, 나중에 4줄 제거 시점이나 위기 대국 탈출용으로 스왑하여 사용합니다.</li>
      </ul>
    `
  },
  8: {
    title: "전략 및 팁",
    badge: "가이드 08: 전략 및 팁",
    content: `
      <p>고득점 2만 점 돌파를 향한 마스터들의 필수 가이드 꿀팁입니다:</p>
      <ol>
        <li><strong>I-블록 스택 빌드:</strong> 가로 9칸을 꼼꼼히 쌓고 우측 1칸만 비워두는 우물형 구조를 만든 뒤, 대기하던 I-블록을 세워 찔러 넣어 4줄 동시 제거(Tetris)를 연속 발휘하세요.</li>
        <li><strong>평탄한 지형 관리:</strong> 블록 탑을 가운데만 높게 쌓으면 회전이 막히고 가시성이 나빠지므로, 지형의 높낮이 편차를 2칸 이내로 평평하게 유지하는 지혜가 필요합니다.</li>
        <li><strong>대기열 관망:</strong> 눈앞의 블록만 보지 말고 우측 'NEXT'의 블록 색상 3개를 흘겨보며 어떤 지형을 깎아 나갈지 미리 설계해야 스피드 낭비가 없습니다.</li>
      </ol>
    `
  },
  9: {
    title: "자주 묻는 질문 (FAQ)",
    badge: "가이드 09: 자주 묻는 질문 FAQ",
    content: `
      <p>테트리스 플레이어들이 자주 던지는 질문 모음집입니다:</p>
      <ul>
        <li><strong>Q. 데일리 모드와 하드코어 모드의 차이는 뭔가요?</strong><br>A. 데일리 모드는 1레벨(느림)부터 안정되게 빌드하는 정적 마라톤이며, 하드코어 모드는 시작 속도가 매우 빠르고 락다운 지연 시간이 없어 극악의 순간 판단을 요구합니다.</li>
        <li><strong>Q. 왜 C키를 눌렀는데 홀드가 안 되나요?</strong><br>A. 홀드는 한 블록당 1번만 가능합니다. 한 번 홀드로 꺼내 쓴 블록은 바닥에 완전히 고정 잠금(Lock)되기 전까지 연속해서 다시 넣을 수 없습니다.</li>
      </ul>
    `
  }
};

// ==========================================
// 3. Tetris Game Coordinator Class
// ==========================================

class TetrisGame {
  constructor() {
    this.initDOM();
    this.setupCanvas();
    this.initEvents();

    this.board = Array.from({ length: 20 }, () => Array(10).fill(0));
    
    // 7-bag randomizer queues
    this.bag = [];
    this.nextPieces = [];
    this.heldPiece = null;
    this.canHold = true;
    
    this.currentPiece = null;
    this.currentX = 0;
    this.currentY = 0;

    // Game stats
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.combo = 0;

    // Animation & gravity loops
    this.gameLoopId = null;
    this.lastTickTime = 0;
    this.dropInterval = 800; // ms
    this.isPlaying = false;
    this.isPaused = false;
    this.isGameOver = false;

    // Configuration Settings
    this.showGhost = true;
    this.showParticles = true;
    this.speedBoosting = true;
    this.dailyMode = false;
    this.hardcoreMode = false;

    // Particles array for line clear flash effects
    this.particles = [];

    this.loadAccordion(1);
    this.drawStartOverlayGrids();
  }

  initDOM() {
    // Buttons
    this.btnStartGame = document.getElementById('btn-start-game');
    this.btnRestartGame = document.getElementById('btn-restart-game');
    this.btnReset = document.getElementById('btn-reset');
    this.btnToggleDaily = document.getElementById('btn-toggle-daily');
    this.btnToggleHardcore = document.getElementById('btn-toggle-hardcore');
    this.btnSettingsToggle = document.getElementById('btn-settings-toggle');
    this.btnCloseSettings = document.getElementById('btn-close-settings');

    // Overlays
    this.overlayStart = document.getElementById('overlay-start');
    this.overlayPause = document.getElementById('overlay-pause');
    this.overlayGameOver = document.getElementById('overlay-gameover');
    this.labelGameOverMsg = document.getElementById('label-gameover-msg');
    this.modalSettings = document.getElementById('modal-settings');

    // Stats Displays
    this.labelScore = document.getElementById('label-score');
    this.labelLevel = document.getElementById('label-level');
    this.labelLines = document.getElementById('label-lines');
    this.labelCombo = document.getElementById('label-combo');
    this.levelFillBar = document.getElementById('level-fill-bar');
    this.badgeHoldState = document.getElementById('badge-hold-state');

    // Config Checkboxes
    this.chkShowGhost = document.getElementById('chk-show-ghost');
    this.chkShowParticles = document.getElementById('chk-show-particles');
    this.chkSpeedBoosting = document.getElementById('chk-speed-boosting');

    // Accordion TOC list
    this.accordionItems = document.querySelectorAll('.explanation-index-list li');
    this.explanationBoardContent = document.getElementById('explanation-board-content');
    this.explanationTitleBadge = document.getElementById('explanation-title-badge');
    this.explanationDisplayTitle = document.getElementById('explanation-display-title');
    this.explanationDisplayText = document.getElementById('explanation-display-text');

    // Scroll
    this.btnScrollTop = document.getElementById('btn-scroll-top');
    this.btnScrollBottom = document.getElementById('btn-scroll-bottom');
  }

  setupCanvas() {
    this.canvasBoard = document.getElementById('canvas-board');
    this.ctxBoard = this.canvasBoard.getContext('2d');

    this.canvasHold = document.getElementById('canvas-hold');
    this.ctxHold = this.canvasHold.getContext('2d');

    this.canvasNext = document.getElementById('canvas-next');
    this.ctxNext = this.canvasNext.getContext('2d');

    this.blockSize = 25; // cell pixel size
  }

  initEvents() {
    this.btnStartGame.addEventListener('click', () => this.startGame());
    this.btnRestartGame.addEventListener('click', () => this.startGame());
    this.btnReset.addEventListener('click', () => this.resetGame());
    
    // Toggle Modes
    this.btnToggleDaily.addEventListener('click', () => this.toggleDailyMode());
    this.btnToggleHardcore.addEventListener('click', () => this.toggleHardcoreMode());

    // Settings modal
    this.btnSettingsToggle.addEventListener('click', () => this.showSettingsModal());
    this.btnCloseSettings.addEventListener('click', () => this.hideSettingsModal());

    this.chkShowGhost.addEventListener('change', (e) => this.showGhost = e.target.checked);
    this.chkShowParticles.addEventListener('change', (e) => this.showParticles = e.target.checked);
    this.chkSpeedBoosting.addEventListener('change', (e) => {
      this.speedBoosting = e.target.checked;
      this.updateDropInterval();
    });

    // Keyboard bindings listener
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // TOC switcher click
    this.accordionItems.forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.getAttribute('data-index'));
        this.accordionItems.forEach(li => li.classList.remove('active'));
        item.classList.add('active');
        this.loadAccordion(idx);
      });
    });
  }

  // ==========================================
  // Game Setup & Mode Toggles
  // ==========================================

  toggleDailyMode() {
    this.dailyMode = !this.dailyMode;
    if (this.dailyMode) {
      this.btnToggleDaily.classList.add('active-daily');
      this.btnToggleDaily.innerHTML = '<i class="fa-solid fa-calendar-days"></i> 데일리 ON';
      
      // Mutual exclusive
      if (this.hardcoreMode) this.toggleHardcoreMode();
    } else {
      this.btnToggleDaily.classList.remove('active-daily');
      this.btnToggleDaily.innerHTML = '<i class="fa-solid fa-calendar-days"></i> 데일리 OFF';
    }
    this.resetGame();
  }

  toggleHardcoreMode() {
    this.hardcoreMode = !this.hardcoreMode;
    if (this.hardcoreMode) {
      this.btnToggleHardcore.classList.add('active-hardcore');
      this.btnToggleHardcore.innerHTML = '<i class="fa-solid fa-skull-crossbones"></i> 하드코어 ON';
      
      // Mutual exclusive
      if (this.dailyMode) this.toggleDailyMode();
    } else {
      this.btnToggleHardcore.classList.remove('active-hardcore');
      this.btnToggleHardcore.innerHTML = '<i class="fa-solid fa-skull-crossbones"></i> 하드코어 OFF';
    }
    this.resetGame();
  }

  showSettingsModal() {
    this.modalSettings.style.display = 'flex';
  }

  hideSettingsModal() {
    this.modalSettings.style.display = 'none';
  }

  startGame() {
    this.overlayStart.style.display = 'none';
    this.overlayGameOver.style.display = 'none';
    this.overlayPause.style.display = 'none';

    this.board = Array.from({ length: 20 }, () => Array(10).fill(0));
    this.bag = [];
    this.nextPieces = [];
    this.heldPiece = null;
    this.canHold = true;

    this.score = 0;
    this.level = this.hardcoreMode ? 8 : 1; // hardcore starts at level 8
    this.lines = 0;
    this.combo = 0;

    this.updateStatsDisplay();

    // Populate queue with next blocks
    this.generateNextPieces();
    this.spawnPiece();

    this.isPlaying = true;
    this.isPaused = false;
    this.isGameOver = false;

    this.lastTickTime = performance.now();
    this.updateDropInterval();

    this.updateHoldBadge();

    if (this.gameLoopId) cancelAnimationFrame(this.gameLoopId);
    this.gameLoopId = requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  resetGame() {
    if (this.gameLoopId) cancelAnimationFrame(this.gameLoopId);
    this.isPlaying = false;
    this.isPaused = false;
    this.isGameOver = false;

    this.overlayStart.style.display = 'flex';
    this.overlayGameOver.style.display = 'none';
    this.overlayPause.style.display = 'none';

    this.board = Array.from({ length: 20 }, () => Array(10).fill(0));
    this.heldPiece = null;
    this.nextPieces = [];
    this.canHold = true;

    this.score = 0;
    this.level = this.hardcoreMode ? 8 : 1;
    this.lines = 0;
    this.combo = 0;
    this.updateStatsDisplay();
    this.updateHoldBadge();

    this.drawStartOverlayGrids();
  }

  drawStartOverlayGrids() {
    // Clear canvas
    this.ctxBoard.clearRect(0, 0, this.canvasBoard.width, this.canvasBoard.height);
    this.ctxHold.clearRect(0, 0, this.canvasHold.width, this.canvasHold.height);
    this.ctxNext.clearRect(0, 0, this.canvasNext.width, this.canvasNext.height);

    // Draw empty grid lines on main board for high premium aesthetics
    this.ctxBoard.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    this.ctxBoard.lineWidth = 1;
    for (let x = 0; x <= this.canvasBoard.width; x += this.blockSize) {
      this.ctxBoard.beginPath();
      this.ctxBoard.moveTo(x, 0);
      this.ctxBoard.lineTo(x, this.canvasBoard.height);
      this.ctxBoard.stroke();
    }
    for (let y = 0; y <= this.canvasBoard.height; y += this.blockSize) {
      this.ctxBoard.beginPath();
      this.ctxBoard.moveTo(0, y);
      this.ctxBoard.lineTo(this.canvasBoard.width, y);
      this.ctxBoard.stroke();
    }
  }

  // ==========================================
  // Tetris Engine Logic
  // ==========================================

  // 7-Bag Randomizer
  refillBag() {
    const list = [1, 2, 3, 4, 5, 6, 7];
    // Shuffle list
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    this.bag = list;
  }

  getBagPiece() {
    if (this.bag.length === 0) {
      this.refillBag();
    }
    return this.bag.pop();
  }

  generateNextPieces() {
    while (this.nextPieces.length < 4) {
      this.nextPieces.push(this.getBagPiece());
    }
  }

  spawnPiece() {
    this.generateNextPieces();
    const type = this.nextPieces.shift();
    this.currentPiece = {
      type: type,
      matrix: SHAPES[type].matrix.map(row => [...row]),
      color: SHAPES[type].color,
      shadow: SHAPES[type].shadow
    };

    // Center spawning point
    this.currentX = Math.floor((10 - this.currentPiece.matrix[0].length) / 2);
    this.currentY = 0;

    // Check collision at spawning
    if (this.checkCollision(this.currentPiece.matrix, this.currentX, this.currentY)) {
      this.handleGameOver();
    }

    this.canHold = true;
    this.updateHoldBadge();
    this.drawHoldAndNext();
  }

  // Swap pieces on hold queue
  hold() {
    if (!this.isPlaying || this.isPaused || this.isGameOver || !this.canHold) return;

    const currentType = this.currentPiece.type;

    if (this.heldPiece === null) {
      // Hold is empty, store current, spawn next
      this.heldPiece = currentType;
      this.spawnPiece();
    } else {
      // Swap hold
      const temp = this.heldPiece;
      this.heldPiece = currentType;

      this.currentPiece = {
        type: temp,
        matrix: SHAPES[temp].matrix.map(row => [...row]),
        color: SHAPES[temp].color,
        shadow: SHAPES[temp].shadow
      };
      this.currentX = Math.floor((10 - this.currentPiece.matrix[0].length) / 2);
      this.currentY = 0;
    }

    this.canHold = false;
    this.updateHoldBadge();
    this.drawHoldAndNext();
  }

  updateHoldBadge() {
    if (this.canHold) {
      this.badgeHoldState.textContent = "사용 가능";
      this.badgeHoldState.className = "hold-badge";
    } else {
      this.badgeHoldState.textContent = "홀드 불가";
      this.badgeHoldState.className = "hold-badge disabled";
    }
  }

  checkCollision(matrix, cellX, cellY) {
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] !== 0) {
          const boardX = cellX + c;
          const boardY = cellY + r;

          // Out of borders boundaries
          if (boardX < 0 || boardX >= 10 || boardY >= 20) {
            return true;
          }

          // Out of top boundary is fine, but check grid occupied cells
          if (boardY >= 0 && this.board[boardY][boardX] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  moveLeft() {
    if (!this.checkCollision(this.currentPiece.matrix, this.currentX - 1, this.currentY)) {
      this.currentX--;
    }
  }

  moveRight() {
    if (!this.checkCollision(this.currentPiece.matrix, this.currentX + 1, this.currentY)) {
      this.currentX++;
    }
  }

  rotate() {
    const matrix = this.currentPiece.matrix;
    // Transpose matrix and reverse rows for clock-wise 90deg rotation
    const rotated = matrix[0].map((val, index) => matrix.map(row => row[index]).reverse());

    // Wall Kick simulation: if rotation collides, test slight offsets to slide block
    const offsets = [0, -1, 1, -2, 2];
    for (const offset of offsets) {
      if (!this.checkCollision(rotated, this.currentX + offset, this.currentY)) {
        this.currentPiece.matrix = rotated;
        this.currentX += offset;
        return;
      }
    }
  }

  drop() {
    if (this.isPaused || this.isGameOver) return;

    if (!this.checkCollision(this.currentPiece.matrix, this.currentX, this.currentY + 1)) {
      this.currentY++;
    } else {
      this.lockPiece();
    }
  }

  hardDrop() {
    if (this.isPaused || this.isGameOver) return;

    let steps = 0;
    while (!this.checkCollision(this.currentPiece.matrix, this.currentX, this.currentY + 1)) {
      this.currentY++;
      steps++;
    }
    this.score += steps * 2; // Hard drop score bonus
    this.lockPiece();
  }

  lockPiece() {
    const matrix = this.currentPiece.matrix;
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] !== 0) {
          const boardY = this.currentY + r;
          const boardX = this.currentX + c;

          if (boardY >= 0) {
            this.board[boardY][boardX] = this.currentPiece.type;
          }
        }
      }
    }

    // Check line clears
    this.checkLineClears();

    // Spawn next
    this.spawnPiece();
  }

  checkLineClears() {
    let clearedCount = 0;
    const linesToClear = [];

    for (let r = 20 - 1; r >= 0; r--) {
      if (this.board[r].every(val => val !== 0)) {
        clearedCount++;
        linesToClear.push(r);
      }
    }

    if (clearedCount > 0) {
      this.lines += clearedCount;
      this.combo++;

      // Points calculation formula
      let basePoints = 100;
      if (clearedCount === 2) basePoints = 300;
      else if (clearedCount === 3) basePoints = 500;
      else if (clearedCount === 4) basePoints = 800; // TETRIS

      this.score += basePoints * this.level;

      // Combo points multiplier
      if (this.combo > 1) {
        this.score += 50 * this.combo * this.level;
      }

      // level progression (every 10 lines)
      if (this.lines >= this.level * 10) {
        this.level++;
        this.updateDropInterval();
      }

      // Particle explosion line clear effect
      if (this.showParticles) {
        this.triggerLineClearParticles(linesToClear);
      }

      // Remove lines
      linesToClear.forEach(r => {
        this.board.splice(r, 1);
        this.board.unshift(Array(10).fill(0));
      });

      this.updateStatsDisplay();
    } else {
      this.combo = 0;
      this.updateStatsDisplay();
    }
  }

  triggerLineClearParticles(lines) {
    // Generate small flying particle sparks on cleared rows
    lines.forEach(r => {
      const yCoord = r * this.blockSize + this.blockSize / 2;
      for (let xCoord = 10; xCoord < this.canvasBoard.width; xCoord += 20) {
        for (let k = 0; k < 4; k++) {
          this.particles.push({
            x: xCoord,
            y: yCoord,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 30, // ticks count
            color: `hsl(${Math.random() * 360}, 90%, 65%)`,
            size: Math.random() * 4 + 2
          });
        }
      }
    });
  }

  updateDropInterval() {
    if (!this.speedBoosting) {
      this.dropInterval = 800;
      return;
    }

    // Speed diminishes as level mounts
    const speedTable = {
      1: 800, 2: 700, 3: 600, 4: 500, 5: 420,
      6: 340, 7: 260, 8: 180, 9: 110, 10: 75
    };
    
    let baseInterval = speedTable[this.level] || 50;
    if (this.hardcoreMode) {
      // In hardcore speed is significantly accelerated
      baseInterval = Math.max(30, baseInterval * 0.45);
    }
    this.dropInterval = baseInterval;
  }

  // ==========================================
  // Core Drawing & Rendering Loops
  // ==========================================

  gameLoop(timestamp) {
    if (!this.isPlaying || this.isPaused || this.isGameOver) return;

    const delta = timestamp - this.lastTickTime;
    if (delta > this.dropInterval) {
      this.drop();
      this.lastTickTime = timestamp;
    }

    this.draw();

    this.gameLoopId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  draw() {
    // 1. Clear Play Canvas
    this.ctxBoard.clearRect(0, 0, this.canvasBoard.width, this.canvasBoard.height);

    // 2. Draw Grid borders
    this.ctxBoard.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    this.ctxBoard.lineWidth = 1;
    for (let x = 0; x <= this.canvasBoard.width; x += this.blockSize) {
      this.ctxBoard.beginPath();
      this.ctxBoard.moveTo(x, 0);
      this.ctxBoard.lineTo(x, this.canvasBoard.height);
      this.ctxBoard.stroke();
    }
    for (let y = 0; y <= this.canvasBoard.height; y += this.blockSize) {
      this.ctxBoard.beginPath();
      this.ctxBoard.moveTo(0, y);
      this.ctxBoard.lineTo(this.canvasBoard.width, y);
      this.ctxBoard.stroke();
    }

    // 3. Draw Placed cells in board matrix
    for (let r = 0; r < 20; r++) {
      for (let c = 0; c < 10; c++) {
        const type = this.board[r][c];
        if (type !== 0) {
          this.drawBlock(this.ctxBoard, c, r, SHAPES[type].color, SHAPES[type].shadow);
        }
      }
    }

    // 4. Draw Ghost guide block projection
    if (this.showGhost && this.currentPiece) {
      let ghostY = this.currentY;
      while (!this.checkCollision(this.currentPiece.matrix, this.currentX, ghostY + 1)) {
        ghostY++;
      }
      // Draw ghost block translucent outline wireframes
      const matrix = this.currentPiece.matrix;
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c] !== 0) {
            this.drawBlockOutline(this.ctxBoard, this.currentX + c, ghostY + r, this.currentPiece.color);
          }
        }
      }
    }

    // 5. Draw active moving piece
    if (this.currentPiece) {
      const matrix = this.currentPiece.matrix;
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c] !== 0) {
            this.drawBlock(this.ctxBoard, this.currentX + c, this.currentY + r, this.currentPiece.color, this.currentPiece.shadow);
          }
        }
      }
    }

    // 6. Draw Line Clear Particles
    this.drawAndUpdateParticles();
  }

  drawBlock(ctx, x, y, color, shadow) {
    const size = this.blockSize;
    const px = x * size;
    const py = y * size;

    ctx.fillStyle = color;
    ctx.fillRect(px + 1, py + 1, size - 2, size - 2);

    // Bevel light highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(px + 1, py + 1, size - 2, 3);
    ctx.fillRect(px + 1, py + 1, 3, size - 2);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(px + 1, py + size - 4, size - 2, 3);
    ctx.fillRect(px + size - 4, py + 1, 3, size - 2);

    // Neon shadow glow
    ctx.shadowColor = shadow;
    ctx.shadowBlur = 4;
  }

  drawBlockOutline(ctx, x, y, color) {
    const size = this.blockSize;
    const px = x * size;
    const py = y * size;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 2, py + 2, size - 4, size - 4);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fillRect(px + 2, py + 2, size - 4, size - 4);
    ctx.shadowBlur = 0; // Reset shadow for outline
  }

  drawAndUpdateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      this.ctxBoard.fillStyle = p.color;
      this.ctxBoard.shadowColor = p.color;
      this.ctxBoard.shadowBlur = 8;
      this.ctxBoard.fillRect(p.x, p.y, p.size, p.size);

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
    this.ctxBoard.shadowBlur = 0; // Reset
  }

  drawHoldAndNext() {
    // 1. Draw held piece
    this.ctxHold.clearRect(0, 0, this.canvasHold.width, this.canvasHold.height);
    if (this.heldPiece !== null) {
      const matrix = SHAPES[this.heldPiece].matrix;
      const color = SHAPES[this.heldPiece].color;
      const shadow = SHAPES[this.heldPiece].shadow;

      const size = 18; // Smaller cell for queue
      const offsetX = (this.canvasHold.width - matrix[0].length * size) / 2;
      const offsetY = (this.canvasHold.height - matrix.length * size) / 2;

      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c] !== 0) {
            this.ctxHold.fillStyle = color;
            this.ctxHold.fillRect(offsetX + c * size + 1, offsetY + r * size + 1, size - 2, size - 2);
          }
        }
      }
    }

    // 2. Draw upcoming 3 next pieces
    this.ctxNext.clearRect(0, 0, this.canvasNext.width, this.canvasNext.height);
    const size = 18;

    for (let i = 0; i < 3; i++) {
      const type = this.nextPieces[i];
      if (type) {
        const matrix = SHAPES[type].matrix;
        const color = SHAPES[type].color;

        const offsetX = (this.canvasNext.width - matrix[0].length * size) / 2;
        const offsetY = 20 + i * 75; // Even spaces

        for (let r = 0; r < matrix.length; r++) {
          for (let c = 0; c < matrix[r].length; c++) {
            if (matrix[r][c] !== 0) {
              this.ctxNext.fillStyle = color;
              this.ctxNext.fillRect(offsetX + c * size + 1, offsetY + r * size + 1, size - 2, size - 2);
            }
          }
        }
      }
    }
  }

  updateStatsDisplay() {
    this.labelScore.textContent = this.score;
    this.labelLevel.textContent = this.level;
    this.labelLines.textContent = this.lines;
    this.labelCombo.textContent = this.combo > 0 ? `${this.combo} 콤보` : '-';

    // Level progression gauge
    const linesNeeded = this.level * 10;
    const progress = this.lines - (this.level - 1) * 10;
    const pct = Math.min(100, Math.max(0, (progress / 10) * 100));
    this.levelFillBar.style.width = `${pct}%`;
  }

  handleGameOver() {
    this.isPlaying = false;
    this.isGameOver = true;
    if (this.gameLoopId) cancelAnimationFrame(this.gameLoopId);

    // Save statistics in LocalStorage
    this.saveGameStats();

    this.labelGameOverMsg.innerHTML = `점수: <strong>${this.score}</strong><br>도달 레벨: <strong>${this.level}</strong><br>제거한 줄: <strong>${this.lines}</strong>`;
    this.overlayGameOver.style.display = 'flex';
  }

  // ==========================================
  // Keyboard Action Bindings
  // ==========================================

  handleKeyDown(e) {
    if (!this.isPlaying || this.isGameOver) return;

    if (e.key === 'p' || e.key === 'P' || e.key === 'ㅔ' || e.key === 'ㅖ') {
      this.togglePause();
      e.preventDefault();
      return;
    }

    if (this.isPaused) return;

    switch (e.key) {
      case 'ArrowLeft':
        this.moveLeft();
        break;
      case 'ArrowRight':
        this.moveRight();
        break;
      case 'ArrowUp':
      case 'z':
      case 'Z':
      case 'ㅋ':
        this.rotate();
        break;
      case 'ArrowDown':
        this.drop();
        break;
      case ' ': // Space bar
        this.hardDrop();
        e.preventDefault();
        break;
      case 'c':
      case 'C':
      case 'ㅊ':
        this.hold();
        break;
    }
    this.draw();
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.overlayPause.style.display = 'flex';
    } else {
      this.overlayPause.style.display = 'none';
      // Restart loop
      this.lastTickTime = performance.now();
      this.gameLoopId = requestAnimationFrame((time) => this.gameLoop(time));
    }
  }

  saveGameStats() {
    const stats = JSON.parse(localStorage.getItem('cineaho_tetris_stats')) || { highscore: 0, total: 0 };
    stats.total++;
    if (this.score > stats.highscore) {
      stats.highscore = this.score;
    }
    localStorage.setItem('cineaho_tetris_stats', JSON.stringify(stats));
  }

  // ==========================================
  // Accordion switcher logic (TOC)
  // ==========================================

  loadAccordion(idx) {
    const data = EXPLANATION_DATA[idx];
    if (!data) return;

    this.explanationBoardContent.classList.add('fade-out');

    setTimeout(() => {
      this.explanationTitleBadge.textContent = data.badge;
      this.explanationDisplayTitle.textContent = data.title;
      this.explanationDisplayText.innerHTML = data.content;
      this.explanationBoardContent.classList.remove('fade-out');
    }, 200);
  }
}

// Instantiate Tetris on DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  window.tetrisGame = new TetrisGame();
});
