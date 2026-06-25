// CineAHO Sudoku Pro Game Controller

class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }
  next() {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
}

// ==========================================
// 1. Core Sudoku Generator & Solver Engine
// ==========================================

class SudokuEngine {
  constructor() {
    this.resetBoard();
    this.randomFunc = Math.random;
  }

  resetBoard() {
    this.solvedGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
    this.startGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
    this.userGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
  }

  // Check if val is valid in row/col/box
  isValid(grid, row, col, val) {
    for (let i = 0; i < 9; i++) {
      if (grid[row][i] === val && i !== col) return false;
      if (grid[i][col] === val && i !== row) return false;
    }

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (grid[boxRow + r][boxCol + c] === val && (boxRow + r !== row || boxCol + c !== col)) {
          return false;
        }
      }
    }
    return true;
  }

  // Solves the board and counts solutions up to 2 (to check for uniqueness)
  solve(grid, limit = 2) {
    let solutionsCount = 0;
    const solutions = [];

    const backtrack = (g) => {
      if (solutionsCount >= limit) return;

      // Find cell with minimum remaining values (MRV Heuristic) for ultra-fast solving
      let minCandidates = 10;
      let targetRow = -1;
      let targetCol = -1;
      let targetCandidates = [];

      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (g[r][c] === 0) {
            const candidates = [];
            for (let v = 1; v <= 9; v++) {
              if (this.isValid(g, r, c, v)) candidates.push(v);
            }
            if (candidates.length < minCandidates) {
              minCandidates = candidates.length;
              targetRow = r;
              targetCol = c;
              targetCandidates = candidates;
            }
          }
        }
      }

      // Solved! No empty cells found
      if (targetRow === -1) {
        solutionsCount++;
        solutions.push(g.map(row => [...row]));
        return;
      }

      // Try candidates
      for (const val of targetCandidates) {
        g[targetRow][targetCol] = val;
        backtrack(g);
        g[targetRow][targetCol] = 0;
        if (solutionsCount >= limit) return;
      }
    };

    const tempGrid = grid.map(row => [...row]);
    backtrack(tempGrid);
    return { count: solutionsCount, solutions };
  }

  // Fills a blank board using backtracking to create a solved board
  generateSolvedBoard() {
    this.resetBoard();

    // Fill diagonal 3x3 boxes first (independent boxes, extremely fast random seed)
    for (let box = 0; box < 9; box += 3) {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      // Shuffle numbers
      for (let i = nums.length - 1; i > 0; i--) {
        const j = Math.floor(this.randomFunc() * (i + 1));
        [nums[i], nums[j]] = [nums[j], nums[i]];
      }
      // Populate box
      let idx = 0;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          this.solvedGrid[box + r][box + c] = nums[idx++];
        }
      }
    }

    // Solve the rest
    const result = this.solve(this.solvedGrid, 1);
    if (result.count > 0) {
      this.solvedGrid = result.solutions[0];
    }
  }

  // Generates a puzzle of given difficulty, guaranteeing a unique solution
  generatePuzzle(difficulty) {
    this.generateSolvedBoard();

    // Copy solved board
    this.startGrid = this.solvedGrid.map(row => [...row]);

    // Target cells to remove
    let cellsToRemove = 32; // Default normal
    switch (difficulty) {
      case 'easy': cellsToRemove = 30; break;
      case 'normal': cellsToRemove = 42; break;
      case 'hard': cellsToRemove = 50; break;
      case 'expert': cellsToRemove = 55; break;
      case 'master': cellsToRemove = 59; break;
    }

    // Coordinates grid
    const coords = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        coords.push({ r, c });
      }
    }

    // Shuffle coords
    for (let i = coords.length - 1; i > 0; i--) {
      const j = Math.floor(this.randomFunc() * (i + 1));
      [coords[i], coords[j]] = [coords[j], coords[i]];
    }

    // Try removing numbers one by one, checking uniqueness
    let removed = 0;
    for (const coord of coords) {
      if (removed >= cellsToRemove) break;

      const { r, c } = coord;
      const prevVal = this.startGrid[r][c];

      // Remove temporarily
      this.startGrid[r][c] = 0;

      // Solve board
      const check = this.solve(this.startGrid, 2);
      if (check.count === 1) {
        // Solution is still unique!
        removed++;
      } else {
        // Not unique, restore
        this.startGrid[r][c] = prevVal;
      }
    }

    // Synchronize user grid
    this.userGrid = this.startGrid.map(row => [...row]);
  }
}

// ==========================================
// 2. 11-part Documentation Content
// ==========================================

const ACCORDION_DATA = {
  1: {
    title: "스도쿠란?",
    badge: "가이드 01: 스도쿠란?",
    content: `
      <p>스도쿠(Sudoku, 數獨)는 가로 9칸, 세로 9칸으로 이루어진 81칸 격자판에 1부터 9까지의 숫자를 겹치지 않게 채워 넣는 논리 게임입니다.</p>
      <p>일본어로 <strong>'숫자는 한 번만 쓸 수 있다'</strong>는 뜻을 담은 문장의 약칭이며, 수학적인 연산이나 계산이 일절 필요 없는 100% 순수 이성 논리 퍼즐입니다. 남녀노소 누구나 쉽게 규칙을 배워 두뇌 트레이닝을 즐길 수 있어 전 세계에서 사랑받고 있습니다.</p>
    `
  },
  2: {
    title: "스도쿠의 역사",
    badge: "가이드 02: 스도쿠의 역사",
    content: `
      <p>스도쿠의 수학적 기원은 18세기 스위스 수학자 레온하르트 오일러가 창안한 <strong>'라틴 방진(Latin Square)'</strong>으로 거슬러 올라갑니다.</p>
      <p>이후 1979년 미국의 건축가 하워드 가운즈가 이를 퍼즐화하여 '넘버 플레이스(Number Place)'라는 제명으로 델 매거진에 기고했습니다. 1984년 일본의 퍼즐 출판사인 니코리(Nikoli)가 지금의 '스도쿠'로 다듬어 재출간하면서 아시아와 서구권에 걸쳐 신드롬 급 대중적 유행을 창조하였습니다.</p>
    `
  },
  3: {
    title: "게임 규칙",
    badge: "가이드 03: 게임 규칙",
    content: `
      <p>스도쿠 보드는 9x9 격자이며 두꺼운 선으로 둘러싸인 9개의 3x3 작은 사각형(블록)들로 나뉩니다. 숫자를 채워 넣을 때 다음 세 규칙을 통과해야 합니다:</p>
      <ul>
        <li><strong>가로줄 규칙:</strong> 가로줄 9칸 내에는 1부터 9까지의 숫자가 중복 없이 한 번씩만 들어갑니다.</li>
        <li><strong>세로줄 규칙:</strong> 세로줄 9칸 내에는 1부터 9까지의 숫자가 중복 없이 한 번씩만 들어갑니다.</li>
        <li><strong>3x3 박스 규칙:</strong> 3x3 박스 9칸 내에는 1부터 9까지의 숫자가 중복 없이 한 번씩만 들어갑니다.</li>
      </ul>
    `
  },
  4: {
    title: "게임 방법",
    badge: "가이드 04: 게임 방법",
    content: `
      <p>스도쿠를 풀어나가는 가장 기본적인 방법은 다음과 같습니다:</p>
      <ol>
        <li>보드 위에 이미 고정 제공된 단서(Clues) 숫자들의 분포를 넓게 스캔합니다.</li>
        <li>특정 빈칸을 골라 해당 칸이 속한 행, 열, 3x3 박스를 전부 대조해 봅니다.</li>
        <li>배제 공식을 거쳐 들어갈 수 있는 유일한 후보수를 좁혀나간 뒤, 펜 버튼을 눌러 확정 숫자를 입력합니다.</li>
        <li>헷갈릴 때는 '연필(Pencil)' 모드를 활성화하여 복수 후보를 작게 적어두고 연쇄 소거합니다.</li>
      </ol>
    `
  },
  5: {
    title: "조작법 및 인터페이스",
    badge: "가이드 05: 조작법 및 인터페이스",
    content: `
      <p>본 CineAHO 스도쿠 Pro 엔진은 다음과 같은 편리한 스마트 콘트롤러를 지원합니다:</p>
      <ul>
        <li><strong>셀 선택:</strong> 마우스 클릭 또는 스마트폰 터치로 칸을 지정합니다. (방향키로 격자 이동 지원!)</li>
        <li><strong>연필 모드:</strong> 키패드 우측 하단 '연필'을 활성화하면 칸에 후보 숫자들을 작게 메모(Pencil mark)합니다.</li>
        <li><strong>실행취소/다시실행:</strong> 좌측의 되돌리기/다시하기 단추를 눌러 기록 스택을 자유롭게 되짚어 봅니다.</li>
        <li><strong>자동메모:</strong> 비어 있는 모든 칸에 입력될 수 있는 올바른 후보군 메모를 즉각 채워 소거 과정을 돕습니다.</li>
      </ul>
    `
  },
  6: {
    title: "기본 풀이 기법",
    badge: "가이드 06: 기본 풀이 기법",
    content: `
      <p>가장 기본이 되는 입문 탈출 공식은 다음과 같습니다:</p>
      <ul>
        <li><strong>Naked Single (단일 후보수):</strong> 한 빈칸에 대해 행, 열, 박스의 중복 수를 모두 소거해 보니 오직 단 하나의 숫자(예: 3)만 남았을 경우 즉각 3으로 채워 넣습니다.</li>
        <li><strong>Hidden Single (숨겨진 단일수):</strong> 특정 박스 안의 여러 빈칸 중, 유독 특정 숫자(예: 7)가 들어갈 수 있는 위치가 오직 단 한 칸뿐인 경우 주변 후보가 섞여 있어도 해당 칸을 7로 최종 낙점합니다.</li>
      </ul>
    `
  },
  7: {
    title: "고급 풀이 기법",
    badge: "가이드 07: 고급 풀이 기법",
    content: `
      <p>어려움 이상의 난이도를 극복하기 위한 대표적인 수학적 고급 공식들입니다:</p>
      <ul>
        <li><strong>Pointing Pairs (블록 교차 소거):</strong> 한 박스 내에서 어떤 숫자(예: 5)의 후보지가 한 행이나 한 열 위에만 나란히 갇혀 있을 때, 해당 행/열의 다른 박스 영역에서는 5를 후보에서 모조리 지워나가는 기법입니다.</li>
        <li><strong>Naked Pairs (선점 페어):</strong> 어떤 행이나 열 안의 두 셀에 들어갈 후보군이 동일하게 {2, 9} 두 개로 압축될 경우, 그 행/열의 나머지 셀에는 결코 2와 9가 들어갈 수 없으므로 후보 메모를 지워 나갑니다.</li>
      </ul>
    `
  },
  8: {
    title: "난이도별 특징",
    badge: "가이드 08: 난이도별 특징",
    content: `
      <p>난이도는 빈칸의 비율과 소거에 대입해야 하는 논리 법칙의 기법 수준에 맞춰 설계됩니다:</p>
      <ul>
        <li><strong>입문 (Easy):</strong> 힌트 숫자가 약 45개 이상으로 가로/세로 대조만으로 바로 풀립니다.</li>
        <li><strong>보통 (Normal):</strong> 힌트 약 36~40개로, 3x3 블록과 행열의 크로스 체킹이 필요합니다.</li>
        <li><strong>어려움/전문가 (Hard/Expert):</strong> 힌트 30개 이하이며 Pointing Pairs 등의 연필 메모 검증이 동반됩니다.</li>
        <li><strong>마스터 (Master):</strong> 힌트 20개 대로 극도로 아담하여 X-Wing 등의 극단의 수 체인을 타야 풀립니다.</li>
      </ul>
    `
  },
  9: {
    title: "실력 향상 팁",
    badge: "가이드 09: 실력 향상 팁",
    content: `
      <p>더 빠르게 스도쿠 명작을 정복하는 세 가지 팁입니다:</p>
      <ol>
        <li><strong>채워진 칸 우선:</strong> 이미 숫자가 6~7개 이상 채워진 가로줄, 세로줄, 3x3 블록을 조준하여 빈칸을 저격해 나갑니다.</li>
        <li><strong>추측 입력 금지:</strong> 확실하지 않은데 '대략 5가 맞겠지'하고 찍어 넣으면 연쇄 붕괴가 오므로 지양하고, 연필 메모를 쓰세요.</li>
        <li><strong>키패드 잔여 뱃지 활용:</strong> 키패드 숫자 오른쪽 하단에 남은 빈도수를 스캔해 보드판에서 빨리 완료할 수 있는 타겟 번호를 추려냅니다.</li>
      </ol>
    `
  },
  10: {
    title: "스도쿠의 효과",
    badge: "가이드 10: 스도쿠의 두뇌 효과",
    content: `
      <p>스도쿠는 일종의 <strong>'두뇌 에어로빅'</strong>입니다. 논리적 추론력과 순차적 사고 회로를 자극하여 전두엽 기능을 대단히 강화해 줍니다.</p>
      <p>어린이의 집중력 향상과 수 감각 발달, 그리고 노년층의 치매 및 인지장애 예방과 두뇌 퇴행 예방에 실제 유의미한 예방 효과가 논문으로 여러 차례 규명된 건전하고 유익한 클래식 퍼즐 게임입니다.</p>
    `
  },
  11: {
    title: "자주 묻는 질문 (FAQ)",
    badge: "가이드 11: 자주 묻는 질문 FAQ",
    content: `
      <p>스도쿠 입문자들이 던지는 단골 질문입니다:</p>
      <ul>
        <li><strong>Q. 수학을 잘해야 스도쿠를 푸나요?</strong><br>A. 전혀 관계없습니다. 크기 비교나 사칙 연산은 전혀 쓰이지 않으며, 숫자는 단순 기호일 뿐입니다. 알파벳으로 바꿔도 100% 동일하게 작동합니다.</li>
        <li><strong>Q. 왜 답을 채웠는데 충돌 경고가 뜨나요?</strong><br>A. 해당 행, 열, 또는 3x3 박스 내에 이미 똑같은 숫자가 배치되어 있어 유일한 배치 규칙을 위반했기 때문입니다.</li>
      </ul>
    `
  }
};

// ==========================================
// 3. Sudoku Game Coordinator Class
// ==========================================

class SudokuGame {
  constructor() {
    this.engine = new SudokuEngine();
    
    this.gameMode = 'daily'; // 'daily' | 'free'
    this.difficulty = 'normal';
    this.selectedRow = -1;
    this.selectedCol = -1;
    
    // Notes candidates 9x9 size. Each cell is an Array of booleans [false, false, ...] for numbers 1-9
    this.notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => Array(9).fill(false)));
    this.pencilMode = false;
    this.autoMemoActive = false;

    // Time & Timer
    this.timerSeconds = 0;
    this.timerInterval = null;
    this.isPaused = false;
    this.hintsUsed = 0;
    this.mistakesCount = 0;
    
    // Config Options
    this.showErrors = true;
    this.smartHighlight = true;
    this.areaHighlight = true;
    this.limitMistakes = true;

    // History undo/redo stacks
    // Stack items: { userGrid: 9x9, notes: 9x9x9 }
    this.undoStack = [];
    this.redoStack = [];

    this.initDOM();
    this.initEvents();
    this.loadStats();
    
    // Create first game
    this.startNewGame();
    this.loadAccordion(1);
  }

  initDOM() {
    this.gridContainer = document.getElementById('sudoku-grid');
    this.selectDifficulty = document.getElementById('select-difficulty');
    this.btnNewGame = document.getElementById('btn-new-game');
    this.btnModeDaily = document.getElementById('btn-mode-daily');
    this.btnModeFree = document.getElementById('btn-mode-free');

    // Controls sidebar
    this.badgeGameMode = document.getElementById('badge-game-mode');
    this.badgeDifficulty = document.getElementById('badge-difficulty');
    this.btnPausePlay = document.getElementById('btn-pause-play');
    this.radialProgressBar = document.getElementById('radial-progress-bar');
    this.labelProgressPct = document.getElementById('label-progress-pct');
    this.labelTimer = document.getElementById('label-timer');
    this.labelHintsUsed = document.getElementById('label-hints-used');
    this.labelMistakes = document.getElementById('label-mistakes');

    // Tool Actions
    this.btnUndo = document.getElementById('btn-undo');
    this.btnRedo = document.getElementById('btn-redo');
    this.btnAutoMemo = document.getElementById('btn-auto-memo');
    this.btnHint = document.getElementById('btn-hint');

    // Keypads
    this.keypadNums = document.getElementById('keypad-nums');
    this.btnActionErase = document.getElementById('btn-action-erase');
    this.btnActionPencil = document.getElementById('btn-action-pencil');

    // Dialogue Modals
    this.btnStats = document.getElementById('btn-stats');
    this.btnSettings = document.getElementById('btn-settings');
    this.modalStats = document.getElementById('modal-stats');
    this.modalSettings = document.getElementById('modal-settings');
    this.btnCloseStats = document.getElementById('btn-close-stats');
    this.btnCloseSettings = document.getElementById('btn-close-settings');
    this.btnResetStats = document.getElementById('btn-reset-stats');

    // Toggle Checkboxes
    this.chkShowErrors = document.getElementById('chk-show-errors');
    this.chkSmartHighlight = document.getElementById('chk-smart-highlight');
    this.chkAreaHighlight = document.getElementById('chk-area-highlight');
    this.chkLimitMistakes = document.getElementById('chk-limit-mistakes');

    // Stat numbers in modal
    this.statTotalGames = document.getElementById('stat-total-games');
    this.statWinGames = document.getElementById('stat-win-games');
    this.statWinRatio = document.getElementById('stat-win-ratio');
    this.statBestTime = document.getElementById('stat-best-time');

    // Accordion Table
    this.accordionItems = document.querySelectorAll('.explanation-index-list li');
    this.explanationBoardContent = document.getElementById('explanation-board-content');
    this.explanationTitleBadge = document.getElementById('explanation-title-badge');
    this.explanationDisplayTitle = document.getElementById('explanation-display-title');
    this.explanationDisplayText = document.getElementById('explanation-display-text');

    // Scroll floaters
    this.btnScrollTop = document.getElementById('btn-scroll-top');
    this.btnScrollBottom = document.getElementById('btn-scroll-bottom');
  }

  initEvents() {
    // Mode switcher
    this.btnModeDaily.addEventListener('click', () => this.switchMode('daily'));
    this.btnModeFree.addEventListener('click', () => this.switchMode('free'));

    // Difficulty and New game
    this.btnNewGame.addEventListener('click', () => this.startNewGame());
    this.selectDifficulty.addEventListener('change', (e) => {
      this.difficulty = e.target.value;
      this.startNewGame();
    });

    // Pause/Play
    this.btnPausePlay.addEventListener('click', () => this.togglePause());

    // Tools
    this.btnUndo.addEventListener('click', () => this.undo());
    this.btnRedo.addEventListener('click', () => this.redo());
    this.btnAutoMemo.addEventListener('click', () => this.runAutoMemo());
    this.btnHint.addEventListener('click', () => this.giveHint());

    // Keypad actions
    this.btnActionErase.addEventListener('click', () => this.eraseSelectedCell());
    this.btnActionPencil.addEventListener('click', () => this.togglePencilMode());

    // Dialog Modal Popups
    this.btnStats.addEventListener('click', () => this.showModal('stats'));
    this.btnSettings.addEventListener('click', () => this.showModal('settings'));
    this.btnCloseStats.addEventListener('click', () => this.hideModal('stats'));
    this.btnCloseSettings.addEventListener('click', () => this.hideModal('settings'));
    this.btnResetStats.addEventListener('click', () => this.resetStatsData());

    // Settings checkbox toggles
    this.chkShowErrors.addEventListener('change', (e) => {
      this.showErrors = e.target.checked;
      this.renderBoard();
    });
    this.chkSmartHighlight.addEventListener('change', (e) => {
      this.smartHighlight = e.target.checked;
      this.updateHighlights();
    });
    this.chkAreaHighlight.addEventListener('change', (e) => {
      this.areaHighlight = e.target.checked;
      this.updateHighlights();
    });
    this.chkLimitMistakes.addEventListener('change', (e) => {
      this.limitMistakes = e.target.checked;
      this.updateMistakesDisplay();
    });

    // Document TOC click
    this.accordionItems.forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.getAttribute('data-index'));
        this.accordionItems.forEach(li => li.classList.remove('active'));
        item.classList.add('active');
        this.loadAccordion(idx);
      });
    });

    // Keyboard Arrow navigation & Keypad entries
    document.addEventListener('keydown', (e) => this.handleKeyboardNav(e));

    // Scroll
    this.btnScrollTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    this.btnScrollBottom.addEventListener('click', () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
  }

  // ==========================================
  // Game Setup & Initialization
  // ==========================================

  switchMode(mode) {
    if (this.gameMode === mode) return;
    this.gameMode = mode;

    if (mode === 'daily') {
      this.btnModeDaily.classList.add('active');
      this.btnModeFree.classList.remove('active');
      this.badgeGameMode.textContent = '데일리';
      this.badgeGameMode.className = 'badge-mini orange';
    } else {
      this.btnModeFree.classList.add('active');
      this.btnModeDaily.classList.remove('active');
      this.badgeGameMode.textContent = '자유';
      this.badgeGameMode.className = 'badge-mini orange';
    }
    
    this.startNewGame();
  }

  startNewGame() {
    // Reset configurations & states
    this.selectedRow = -1;
    this.selectedCol = -1;
    this.pencilMode = false;
    this.autoMemoActive = false;
    this.btnActionPencil.classList.remove('active');
    
    this.undoStack = [];
    this.redoStack = [];
    this.updateUndoRedoButtonsState();

    this.timerSeconds = 0;
    this.hintsUsed = 0;
    this.mistakesCount = 0;
    this.isPaused = false;
    this.btnPausePlay.classList.remove('active');
    this.btnPausePlay.innerHTML = '<i class="fa-solid fa-pause"></i>';

    // Clear pencil notes
    this.notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => Array(9).fill(false)));

    // Load difficulty text
    const diffNames = { easy: "입문", normal: "보통", hard: "어려움", expert: "전문가", master: "마스터" };
    this.badgeDifficulty.textContent = diffNames[this.difficulty] || "보통";

    // Set status tags
    this.updateMistakesDisplay();
    this.labelHintsUsed.textContent = "0회 사용";

    // Seed generator if in daily mode
    if (this.gameMode === 'daily') {
      const today = new Date();
      const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
      const rng = new SeededRandom(seed);
      this.engine.randomFunc = () => rng.next();
    } else {
      this.engine.randomFunc = Math.random;
    }

    // Generate puzzle
    this.engine.generatePuzzle(this.difficulty);

    // Build DOM structure
    this.buildBoardGridDOM();
    this.buildKeypadDOM();
    
    // Start stopwatch timer
    this.startTimer();
    this.calculateProgress();
    this.updateKeypadCounters();
  }

  buildBoardGridDOM() {
    this.gridContainer.innerHTML = '';
    
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = this.engine.startGrid[r][c];

        const cell = document.createElement('div');
        cell.className = 'sudoku-cell';
        cell.setAttribute('data-row', r);
        cell.setAttribute('data-col', c);

        if (val !== 0) {
          cell.classList.add('starting-num');
          cell.innerHTML = `<span class="cell-value">${val}</span>`;
        } else {
          // Render 3x3 pencil note container for candidates
          const notesGrid = document.createElement('div');
          notesGrid.className = 'pencil-notes-grid';
          for (let i = 1; i <= 9; i++) {
            const slot = document.createElement('div');
            slot.className = `note-slot note-slot-${i}`;
            slot.setAttribute('data-num', i);
            slot.textContent = '';
            notesGrid.appendChild(slot);
          }
          cell.appendChild(notesGrid);
          cell.innerHTML += `<span class="cell-value"></span>`;
        }

        // Add mouse select listeners
        cell.addEventListener('click', () => this.selectCell(r, c));

        this.gridContainer.appendChild(cell);
      }
    }
  }

  buildKeypadDOM() {
    this.keypadNums.innerHTML = '';
    
    for (let i = 1; i <= 9; i++) {
      const btn = document.createElement('button');
      btn.className = 'btn-num';
      btn.setAttribute('data-num', i);
      btn.innerHTML = `
        <span>${i}</span>
        <span class="num-count-sub" id="num-subscript-${i}">0</span>
      `;
      btn.addEventListener('click', () => this.inputNumber(i));
      this.keypadNums.appendChild(btn);
    }
  }

  // ==========================================
  // Game Interactivity & Logic
  // ==========================================

  selectCell(row, col) {
    if (this.isPaused) return;

    this.selectedRow = row;
    this.selectedCol = col;

    this.renderSelectedState();
    this.updateHighlights();
  }

  renderSelectedState() {
    const cells = this.gridContainer.querySelectorAll('.sudoku-cell');
    cells.forEach(cell => {
      const r = parseInt(cell.getAttribute('data-row'));
      const c = parseInt(cell.getAttribute('data-col'));

      if (r === this.selectedRow && c === this.selectedCol) {
        cell.classList.add('selected-cell');
      } else {
        cell.classList.remove('selected-cell');
      }
    });
  }

  updateHighlights() {
    const cells = this.gridContainer.querySelectorAll('.sudoku-cell');
    
    // Selected cell info
    let selectedNum = 0;
    if (this.selectedRow !== -1 && this.selectedCol !== -1) {
      selectedNum = this.engine.userGrid[this.selectedRow][this.selectedCol];
    }

    cells.forEach(cell => {
      const r = parseInt(cell.getAttribute('data-row'));
      const c = parseInt(cell.getAttribute('data-col'));
      
      // Clean highlights
      cell.classList.remove('area-highlight', 'number-highlight');

      if (this.selectedRow === -1 || this.selectedCol === -1) return;

      // 1. Same row/col/box area highlight
      if (this.areaHighlight) {
        const inSameRow = (r === this.selectedRow);
        const inSameCol = (c === this.selectedCol);
        
        const selectedBoxRow = Math.floor(this.selectedRow / 3);
        const selectedBoxCol = Math.floor(this.selectedCol / 3);
        const currentBoxRow = Math.floor(r / 3);
        const currentBoxCol = Math.floor(c / 3);
        const inSameBox = (selectedBoxRow === currentBoxRow && selectedBoxCol === currentBoxCol);

        if ((inSameRow || inSameCol || inSameBox) && !(r === this.selectedRow && c === this.selectedCol)) {
          cell.classList.add('area-highlight');
        }
      }

      // 2. Same Number highlight (Smart Highlight)
      if (this.smartHighlight && selectedNum !== 0) {
        const currentVal = this.engine.userGrid[r][c];
        if (currentVal === selectedNum && !(r === this.selectedRow && c === this.selectedCol)) {
          cell.classList.add('number-highlight');
        }
      }
    });
  }

  inputNumber(num) {
    if (this.selectedRow === -1 || this.selectedCol === -1 || this.isPaused) return;

    // Cannot overwrite start clues
    if (this.engine.startGrid[this.selectedRow][this.selectedCol] !== 0) return;

    // Save history state snapshot before editing
    this.saveHistoryState();

    if (this.pencilMode) {
      // Pencil Memory mode: toggle candidate value
      const val = this.notes[this.selectedRow][this.selectedCol][num - 1];
      this.notes[this.selectedRow][this.selectedCol][num - 1] = !val;
      this.engine.userGrid[this.selectedRow][this.selectedCol] = 0; // Reset main num if memoing
    } else {
      // Main Pen value mode: set number
      const prevVal = this.engine.userGrid[this.selectedRow][this.selectedCol];
      
      if (prevVal === num) {
        // Clear if clicking same number
        this.engine.userGrid[this.selectedRow][this.selectedCol] = 0;
      } else {
        this.engine.userGrid[this.selectedRow][this.selectedCol] = num;
        
        // Clear this cell's pencil memo candidates
        this.notes[this.selectedRow][this.selectedCol].fill(false);

        // Smart Memo Clean: Automatically remove this number from pencil lists in same row/col/box!
        const correctVal = this.engine.solvedGrid[this.selectedRow][this.selectedCol];
        if (num === correctVal) {
          this.removePencilMarkConflicts(this.selectedRow, this.selectedCol, num);
        } else {
          // If incorrect mistake, handle mistakes count increment
          if (this.showErrors) {
            this.mistakesCount++;
            this.updateMistakesDisplay();
            this.triggerMistakeEffects();
          }
        }
      }
    }

    this.renderBoard();
    this.calculateProgress();
    this.updateKeypadCounters();
    this.checkWinState();
  }

  removePencilMarkConflicts(row, col, val) {
    // Row and Col memos removal
    for (let i = 0; i < 9; i++) {
      this.notes[row][i][val - 1] = false;
      this.notes[i][col][val - 1] = false;
    }
    // Box memos removal
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        this.notes[boxRow + r][boxCol + c][val - 1] = false;
      }
    }
  }

  eraseSelectedCell() {
    if (this.selectedRow === -1 || this.selectedCol === -1 || this.isPaused) return;
    if (this.engine.startGrid[this.selectedRow][this.selectedCol] !== 0) return;

    this.saveHistoryState();

    this.engine.userGrid[this.selectedRow][this.selectedCol] = 0;
    this.notes[this.selectedRow][this.selectedCol].fill(false);

    this.renderBoard();
    this.calculateProgress();
    this.updateKeypadCounters();
  }

  togglePencilMode() {
    this.pencilMode = !this.pencilMode;
    if (this.pencilMode) {
      this.btnActionPencil.classList.add('active');
    } else {
      this.btnActionPencil.classList.remove('active');
    }
  }

  runAutoMemo() {
    if (this.isPaused) return;
    this.saveHistoryState();

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.engine.userGrid[r][c] === 0) {
          // Empty cell. Find all mathematically valid entries
          const cellCandidates = Array(9).fill(false);
          for (let val = 1; val <= 9; val++) {
            if (this.engine.isValid(this.engine.userGrid, r, c, val)) {
              cellCandidates[val - 1] = true;
            }
          }
          this.notes[r][c] = cellCandidates;
        }
      }
    }

    this.renderBoard();
  }

  giveHint() {
    if (this.selectedRow === -1 || this.selectedCol === -1 || this.isPaused) {
      alert("힌트를 받을 셀을 먼저 클릭하여 선택해 주세요.");
      return;
    }
    if (this.engine.startGrid[this.selectedRow][this.selectedCol] !== 0) return;

    this.saveHistoryState();

    // Set correct solution number
    const correctVal = this.engine.solvedGrid[this.selectedRow][this.selectedCol];
    this.engine.userGrid[this.selectedRow][this.selectedCol] = correctVal;
    
    // Clear pencil memos for this cell
    this.notes[this.selectedRow][this.selectedCol].fill(false);
    this.removePencilMarkConflicts(this.selectedRow, this.selectedCol, correctVal);

    this.hintsUsed++;
    this.labelHintsUsed.textContent = `${this.hintsUsed}회 사용`;

    this.renderBoard();
    this.calculateProgress();
    this.updateKeypadCounters();
    this.checkWinState();
  }

  // ==========================================
  // State Rendering & Undo/Redo
  // ==========================================

  saveHistoryState() {
    // Copy current state
    const gridSnapshot = this.engine.userGrid.map(row => [...row]);
    const notesSnapshot = this.notes.map(r => r.map(c => [...c]));

    this.undoStack.push({
      grid: gridSnapshot,
      notes: notesSnapshot
    });

    // Clear redo
    this.redoStack = [];
    this.updateUndoRedoButtonsState();
  }

  undo() {
    if (this.undoStack.length === 0 || this.isPaused) return;

    // Push current to redo
    const currentGrid = this.engine.userGrid.map(row => [...row]);
    const currentNotes = this.notes.map(r => r.map(c => [...c]));
    this.redoStack.push({ grid: currentGrid, notes: currentNotes });

    // Pop from undo
    const prevState = this.undoStack.pop();
    this.engine.userGrid = prevState.grid;
    this.notes = prevState.notes;

    this.renderBoard();
    this.calculateProgress();
    this.updateKeypadCounters();
    this.updateUndoRedoButtonsState();
  }

  redo() {
    if (this.redoStack.length === 0 || this.isPaused) return;

    // Push current to undo
    const currentGrid = this.engine.userGrid.map(row => [...row]);
    const currentNotes = this.notes.map(r => r.map(c => [...c]));
    this.undoStack.push({ grid: currentGrid, notes: currentNotes });

    // Pop from redo
    const nextState = this.redoStack.pop();
    this.engine.userGrid = nextState.grid;
    this.notes = nextState.notes;

    this.renderBoard();
    this.calculateProgress();
    this.updateKeypadCounters();
    this.updateUndoRedoButtonsState();
  }

  updateUndoRedoButtonsState() {
    this.btnUndo.disabled = (this.undoStack.length === 0);
    this.btnRedo.disabled = (this.redoStack.length === 0);
  }

  getConflicts() {
    const conflicts = Array.from({ length: 9 }, () => Array(9).fill(false));
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = this.engine.userGrid[r][c];
        if (val === 0) continue;

        // Check row
        for (let i = 0; i < 9; i++) {
          if (i !== c && this.engine.userGrid[r][i] === val) {
            conflicts[r][c] = true;
            conflicts[r][i] = true;
          }
        }

        // Check col
        for (let i = 0; i < 9; i++) {
          if (i !== r && this.engine.userGrid[i][c] === val) {
            conflicts[r][c] = true;
            conflicts[i][c] = true;
          }
        }

        // Check 3x3 box
        const boxRow = Math.floor(r / 3) * 3;
        const boxCol = Math.floor(c / 3) * 3;
        for (let br = 0; br < 3; br++) {
          for (let bc = 0; bc < 3; bc++) {
            const tr = boxRow + br;
            const tc = boxCol + bc;
            if ((tr !== r || tc !== c) && this.engine.userGrid[tr][tc] === val) {
              conflicts[r][c] = true;
              conflicts[tr][tc] = true;
            }
          }
        }
      }
    }
    return conflicts;
  }

  renderBoard() {
    const cells = this.gridContainer.querySelectorAll('.sudoku-cell');
    const conflicts = this.getConflicts();
    
    cells.forEach(cell => {
      const r = parseInt(cell.getAttribute('data-row'));
      const c = parseInt(cell.getAttribute('data-col'));
      
      const isStartClue = (this.engine.startGrid[r][c] !== 0);
      if (isStartClue) {
        cell.className = 'sudoku-cell starting-num';
        if (r === this.selectedRow && c === this.selectedCol) {
          cell.classList.add('selected-cell');
        }
        if (conflicts[r][c]) {
          cell.classList.add('conflict-num');
        }
        return; // Keep clues alone but highlight conflicts
      }

      const currentVal = this.engine.userGrid[r][c];
      const correctVal = this.engine.solvedGrid[r][c];

      const valueSpan = cell.querySelector('.cell-value');
      const notesGrid = cell.querySelector('.pencil-notes-grid');

      // Reset cell class states
      cell.className = 'sudoku-cell user-num';
      if (r === this.selectedRow && c === this.selectedCol) {
        cell.classList.add('selected-cell');
      }

      if (currentVal !== 0) {
        // Pen main number visible
        valueSpan.textContent = currentVal;
        notesGrid.style.display = 'none';

        // Check correct/error highlights
        if (this.showErrors) {
          if (currentVal !== correctVal || conflicts[r][c]) {
            cell.classList.add('error-num');
          }
        } else if (conflicts[r][c]) {
          // Highlight conflicts in orange even if showErrors is off
          cell.classList.add('conflict-num');
        }
      } else {
        // Pencil marks candidates visible
        valueSpan.textContent = '';
        notesGrid.style.display = 'grid';

        // Populate pencil slots
        const slots = notesGrid.querySelectorAll('.note-slot');
        slots.forEach(slot => {
          const num = parseInt(slot.getAttribute('data-num'));
          const isActive = this.notes[r][c][num - 1];
          if (isActive) {
            slot.textContent = num;
            slot.classList.add('active');
          } else {
            slot.textContent = '';
            slot.classList.remove('active');
          }
        });
      }
    });

    this.updateHighlights();
  }

  // ==========================================
  // Timer, Mistakes & Progress 연산
  // ==========================================

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    this.timerInterval = setInterval(() => {
      if (!this.isPaused) {
        this.timerSeconds++;
        this.updateTimerDisplay();
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const mins = Math.floor(this.timerSeconds / 60);
    const secs = this.timerSeconds % 60;
    this.labelTimer.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.btnPausePlay.classList.add('active');
      this.btnPausePlay.innerHTML = '<i class="fa-solid fa-play"></i>';
      this.gridContainer.style.visibility = 'hidden';
      this.boardStatusText = document.createElement('div');
      this.boardStatusText.id = 'sudoku-pause-overlay';
      this.boardStatusText.style.position = 'absolute';
      this.boardStatusText.style.color = 'var(--text-muted)';
      this.boardStatusText.style.fontSize = '1.2rem';
      this.boardStatusText.style.fontWeight = '700';
      this.boardStatusText.textContent = '게임 일시정지됨';
      this.gridContainer.parentElement.appendChild(this.boardStatusText);
    } else {
      this.btnPausePlay.classList.remove('active');
      this.btnPausePlay.innerHTML = '<i class="fa-solid fa-pause"></i>';
      this.gridContainer.style.visibility = 'visible';
      const overlay = document.getElementById('sudoku-pause-overlay');
      if (overlay) overlay.remove();
    }
  }

  calculateProgress() {
    let correctCells = 0;
    let totalEmpty = 0;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.engine.startGrid[r][c] === 0) {
          totalEmpty++;
          if (this.engine.userGrid[r][c] === this.engine.solvedGrid[r][c]) {
            correctCells++;
          }
        }
      }
    }

    const pct = totalEmpty > 0 ? Math.round((correctCells / totalEmpty) * 100) : 100;
    
    // Render progress numbers
    this.labelProgressPct.textContent = `${pct}%`;

    // Render radial circle fill ring
    const radius = 33;
    const circumference = radius * 2 * Math.PI; // 207.35
    const offset = circumference - (pct / 100) * circumference;
    this.radialProgressBar.style.strokeDashoffset = offset;
  }

  updateMistakesDisplay() {
    if (this.limitMistakes) {
      this.labelMistakes.textContent = `${this.mistakesCount} / 3 (제한)`;
      if (this.mistakesCount >= 3) {
        this.labelMistakes.className = 'text-red';
      } else {
        this.labelMistakes.className = 'text-orange';
      }
    } else {
      this.labelMistakes.textContent = `${this.mistakesCount}회 (무제한)`;
      this.labelMistakes.className = 'text-orange';
    }
  }

  triggerMistakeEffects() {
    if (this.limitMistakes && this.mistakesCount >= 3) {
      this.handleGameOver(false);
    }
  }

  updateKeypadCounters() {
    // Counter shows how many times a number is entered in the board
    const numCounts = Array(10).fill(0);

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = this.engine.userGrid[r][c];
        if (val !== 0) {
          numCounts[val]++;
        }
      }
    }

    // Update sub subscripts inside button elements
    for (let i = 1; i <= 9; i++) {
      const subBadge = document.getElementById(`num-subscript-${i}`);
      const btn = this.keypadNums.querySelector(`.btn-num[data-num="${i}"]`);
      
      if (subBadge) {
        // Total needed of each number is 9
        const remains = 9 - numCounts[i];
        subBadge.textContent = remains > 0 ? remains : '✓';

        btn.disabled = false; // Never disable keypads (UX improvement)
        if (remains === 0) {
          btn.classList.add('completed');
          subBadge.style.color = '#10b981'; // Green completed check
        } else {
          btn.classList.remove('completed');
          subBadge.style.color = 'var(--text-muted)';
        }
      }
    }
  }

  checkWinState() {
    // If all user inputs match solved solutions
    let win = true;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.engine.userGrid[r][c] !== this.engine.solvedGrid[r][c]) {
          win = false;
          break;
        }
      }
      if (!win) break;
    }

    if (win) {
      this.handleGameOver(true);
    }
  }

  handleGameOver(isWin) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    // Save to statistics
    this.saveGameStats(isWin);

    setTimeout(() => {
      if (isWin) {
        alert(`🎉 축하합니다! 스도쿠 퍼즐을 성공적으로 클리어하셨습니다!\n소요 시간: ${this.labelTimer.textContent}\n힌트 사용: ${this.hintsUsed}회`);
      } else {
        alert(`💀 실수 횟수 3회 초과로 게임오버 되었습니다.\n새로운 도전을 위해 '새 게임' 버튼을 눌러주세요.`);
      }
    }, 100);
  }

  // ==========================================
  // Keyboard Arrow Navigation & Inputs
  // ==========================================

  handleKeyboardNav(e) {
    if (this.selectedRow === -1 || this.selectedCol === -1 || this.isPaused) return;

    let targetRow = this.selectedRow;
    let targetCol = this.selectedCol;

    switch (e.key) {
      case 'ArrowUp':
        targetRow = Math.max(0, this.selectedRow - 1);
        e.preventDefault();
        break;
      case 'ArrowDown':
        targetRow = Math.min(8, this.selectedRow + 1);
        e.preventDefault();
        break;
      case 'ArrowLeft':
        targetCol = Math.max(0, this.selectedCol - 1);
        e.preventDefault();
        break;
      case 'ArrowRight':
        targetCol = Math.min(8, this.selectedCol + 1);
        e.preventDefault();
        break;
      case 'Backspace':
      case 'Delete':
        this.eraseSelectedCell();
        e.preventDefault();
        return;
      case 'p':
      case 'P':
        this.togglePencilMode();
        return;
      default:
        // Check if number key entered
        const num = parseInt(e.key);
        if (num >= 1 && num <= 9) {
          this.inputNumber(num);
        }
        return;
    }

    if (targetRow !== this.selectedRow || targetCol !== this.selectedCol) {
      this.selectCell(targetRow, targetCol);
    }
  }

  // ==========================================
  // Dialog Modals & Stats Cache Manager
  // ==========================================

  showModal(type) {
    if (type === 'stats') {
      this.updateStatsModalText();
      this.modalStats.style.display = 'flex';
    } else {
      this.modalSettings.style.display = 'flex';
    }
  }

  hideModal(type) {
    if (type === 'stats') {
      this.modalStats.style.display = 'none';
    } else {
      this.modalSettings.style.display = 'none';
    }
  }

  loadStats() {
    const defaultStats = { total: 0, win: 0, bestSeconds: -1 };
    this.statsData = JSON.parse(localStorage.getItem('cineaho_sudoku_stats')) || defaultStats;
  }

  saveGameStats(isWin) {
    this.statsData.total++;
    if (isWin) {
      this.statsData.win++;
      // Check if best time
      if (this.statsData.bestSeconds === -1 || this.timerSeconds < this.statsData.bestSeconds) {
        this.statsData.bestSeconds = this.timerSeconds;
      }
    }
    localStorage.setItem('cineaho_sudoku_stats', JSON.stringify(this.statsData));
  }

  updateStatsModalText() {
    this.statTotalGames.textContent = this.statsData.total;
    this.statWinGames.textContent = this.statsData.win;
    
    const winRatio = this.statsData.total > 0 ? Math.round((this.statsData.win / this.statsData.total) * 100) : 0;
    this.statWinRatio.textContent = `${winRatio}%`;

    if (this.statsData.bestSeconds !== -1) {
      const mins = Math.floor(this.statsData.bestSeconds / 60);
      const secs = this.statsData.bestSeconds % 60;
      this.statBestTime.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      this.statBestTime.textContent = '--:--';
    }
  }

  resetStatsData() {
    if (confirm("정말로 모든 기록 데이터를 초기화하시겠습니까?")) {
      const defaultStats = { total: 0, win: 0, bestSeconds: -1 };
      this.statsData = defaultStats;
      localStorage.setItem('cineaho_sudoku_stats', JSON.stringify(this.statsData));
      this.updateStatsModalText();
    }
  }

  // ==========================================
  // Accordion switched switcher logic
  // ==========================================

  loadAccordion(idx) {
    const data = ACCORDION_DATA[idx];
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

// Instantiate Sudoku Game
document.addEventListener('DOMContentLoaded', () => {
  window.sudokuGame = new SudokuGame();
});
