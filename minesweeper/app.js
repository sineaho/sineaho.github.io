/**
 * CineAHO Minesweeper Pro Game Engine & AI Solver
 */

// Sound Synthesizer using Web Audio API
const SoundEngine = {
  ctx: null,
  enabled: true,

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio not supported in this browser", e);
    }
  },

  play(type) {
    if (!this.enabled) return;
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    const baseGain = 0.08;

    switch (type) {
      case 'click':
        // Short high-pitch sweep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);
        gainNode.gain.setValueAtTime(baseGain * 0.4, t);
        gainNode.gain.linearRampToValueAtTime(0.01, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
        break;

      case 'flag':
        // Short double beep
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, t);
        gainNode.gain.setValueAtTime(baseGain * 0.3, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
        osc.start(t);
        osc.stop(t + 0.06);
        break;

      case 'explosion':
        // Low frequency noise sweep
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.linearRampToValueAtTime(20, t + 0.5);
        gainNode.gain.setValueAtTime(baseGain * 1.5, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
        osc.start(t);
        osc.stop(t + 0.6);
        break;

      case 'win':
        // Ascending arpeggio C-E-G-C
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        notes.forEach((freq, idx) => {
          const noteOsc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(this.ctx.destination);
          
          noteOsc.type = 'sine';
          noteOsc.frequency.setValueAtTime(freq, t + idx * 0.1);
          noteGain.gain.setValueAtTime(baseGain * 0.5, t + idx * 0.1);
          noteGain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.1 + 0.25);
          
          noteOsc.start(t + idx * 0.1);
          noteOsc.stop(t + idx * 0.1 + 0.25);
        });
        break;
    }
  }
};

const App = {
  // Game parameters based on difficulty size
  config: {
    small:  { rows: 9,  cols: 9,  mines: 10 },
    medium: { rows: 16, cols: 16, mines: 40 },
    large:  { rows: 16, cols: 30, mines: 99 } // Standard expert Expert
  },

  state: {
    size: 'small', // small, medium, large
    rows: 9,
    cols: 9,
    mineCount: 10,
    
    board: [], // 2D array of Cells: { r, c, isMine, isRevealed, isFlagged, count }
    gameOver: false,
    gameWon: false,
    firstClick: true,
    
    flagsCount: 0,
    timer: 0,
    timerInterval: null,
    
    // Auto solver status
    autoRunning: false,
    autoInterval: null,
    autoDelay: 300 // default speed ms
  },

  // DOM Elements
  boardEl: null,
  resetBtnEl: null,
  mineCountEl: null,
  timerEl: null,
  logContentEl: null,
  autoToggleBtnEl: null,
  stepSolveBtnEl: null,
  speedSliderEl: null,
  speedDisplayEl: null,

  init() {
    this.boardEl = document.getElementById('minesweeper-board');
    this.resetBtnEl = document.getElementById('reset-btn');
    this.mineCountEl = document.getElementById('mine-count-display');
    this.timerEl = document.getElementById('timer-display');
    this.logContentEl = document.getElementById('solver-log-content');
    this.autoToggleBtnEl = document.getElementById('btn-auto-toggle');
    this.stepSolveBtnEl = document.getElementById('btn-step-solve');
    this.speedSliderEl = document.getElementById('auto-speed-slider');
    this.speedDisplayEl = document.getElementById('auto-speed-display');

    this.initTheme();
    this.bindEvents();
    this.resetGame();
  },

  initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) return;
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
  },

  bindEvents() {
    // Smiley face reset
    this.resetBtnEl.addEventListener('click', () => {
      this.resetGame();
      this.log('[SYSTEM] 게임이 새로 초기화되었습니다.', 'dim');
    });

    // Difficulty buttons click
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        const targetBtn = e.target.closest('button');
        targetBtn.classList.add('active');
        this.state.size = targetBtn.getAttribute('data-size');
        this.resetGame();
        this.log(`[SYSTEM] 격자 크기가 변경되었습니다 (${this.state.cols}x${this.state.rows}).`, 'dim');
      });
    });

    // Sound toggle
    document.getElementById('toggle-sound').addEventListener('change', (e) => {
      SoundEngine.enabled = e.target.checked;
    });

    // AI Auto Toggle play/pause
    this.autoToggleBtnEl.addEventListener('click', () => {
      this.toggleAutoPlay();
    });

    // AI Step solving manual trigger
    this.stepSolveBtnEl.addEventListener('click', () => {
      this.triggerStepSolve();
    });

    // AI Speed slider changes
    this.speedSliderEl.addEventListener('input', (e) => {
      this.state.autoDelay = parseInt(e.target.value);
      this.speedDisplayEl.textContent = `${this.state.autoDelay}ms`;
      if (this.state.autoRunning) {
        // Restart timer interval with new delay
        this.stopAutoTimer();
        this.startAutoTimer();
      }
    });
  },

  resetGame() {
    this.stopTimer();
    this.stopAutoPlay();

    // Fetch difficulty rules
    const rules = this.config[this.state.size];
    this.state.rows = rules.rows;
    this.state.cols = rules.cols;
    this.state.mineCount = rules.mines;
    
    this.state.gameOver = false;
    this.state.gameWon = false;
    this.state.firstClick = true;
    this.state.flagsCount = 0;
    this.state.timer = 0;

    // Reset LCD indicators
    this.timerEl.textContent = '000';
    this.mineCountEl.textContent = String(this.state.mineCount).padStart(3, '0');
    this.resetBtnEl.textContent = '😀';

    // Clear board container grid template
    this.boardEl.className = `minesweeper-board grid-${this.state.size}`;
    this.boardEl.innerHTML = '';

    // Initialize state grid
    this.state.board = [];
    for (let r = 0; r < this.state.rows; r++) {
      const row = [];
      for (let c = 0; c < this.state.cols; c++) {
        const cell = {
          r: r,
          c: c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          count: 0
        };
        row.push(cell);

        // Create DOM element for grid representation
        const cellEl = document.createElement('div');
        cellEl.className = 'ms-cell';
        cellEl.id = `cell-${r}-${c}`;
        cellEl.dataset.r = r;
        cellEl.dataset.c = c;
        
        // Listeners for mouse clicks
        cellEl.addEventListener('click', (e) => this.handleCellClick(r, c));
        cellEl.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          this.handleCellRightClick(r, c);
        });

        this.boardEl.appendChild(cellEl);
      }
      this.state.board.push(row);
    }
  },

  // First click guarantees cell is not mine, then lays out the mines
  generateMines(clickedR, clickedC) {
    let minesPlaced = 0;
    while (minesPlaced < this.state.mineCount) {
      const r = Math.floor(Math.random() * this.state.rows);
      const c = Math.floor(Math.random() * this.state.cols);

      // Avoid placing mine on first clicked cell, its neighbors, or duplicate cells
      const distR = Math.abs(r - clickedR);
      const distC = Math.abs(c - clickedC);
      
      if (distR <= 1 && distC <= 1) continue; // Keep clicked cell & 3x3 surrounding zone safe
      if (this.state.board[r][c].isMine) continue;

      this.state.board[r][c].isMine = true;
      minesPlaced++;
    }

    // Calculate neighbors count
    for (let r = 0; r < this.state.rows; r++) {
      for (let c = 0; c < this.state.cols; c++) {
        if (this.state.board[r][c].isMine) continue;
        let count = 0;
        this.getNeighbors(r, c).forEach(neighbor => {
          if (neighbor.isMine) count++;
        });
        this.state.board[r][c].count = count;
      }
    }
  },

  getNeighbors(r, c) {
    const neighbors = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < this.state.rows && nc >= 0 && nc < this.state.cols) {
          neighbors.push(this.state.board[nr][nc]);
        }
      }
    }
    return neighbors;
  },

  // Handlers
  handleCellClick(r, c) {
    if (this.state.gameOver || this.state.gameWon) return;
    const cell = this.state.board[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    SoundEngine.play('click');

    // First click logic
    if (this.state.firstClick) {
      this.state.firstClick = false;
      this.generateMines(r, c);
      this.startTimer();
    }

    this.revealCell(r, c);
    this.checkGameWin();
  },

  handleCellRightClick(r, c) {
    if (this.state.gameOver || this.state.gameWon) return;
    const cell = this.state.board[r][c];
    if (cell.isRevealed) return;

    SoundEngine.play('flag');

    cell.isFlagged = !cell.isFlagged;
    const cellEl = document.getElementById(`cell-${r}-${c}`);

    if (cell.isFlagged) {
      cellEl.classList.add('flagged');
      cellEl.innerHTML = '<i class="fa-solid fa-flag"></i>';
      this.state.flagsCount++;
    } else {
      cellEl.classList.remove('flagged');
      cellEl.innerHTML = '';
      this.state.flagsCount--;
    }

    // Update mines remaining count LCD display
    const remaining = this.state.mineCount - this.state.flagsCount;
    this.mineCountEl.textContent = String(Math.max(0, remaining)).padStart(3, '0');
  },

  revealCell(r, c) {
    const cell = this.state.board[r][c];
    cell.isRevealed = true;

    const cellEl = document.getElementById(`cell-${r}-${c}`);
    cellEl.classList.add('opened');
    
    if (cell.isMine) {
      this.triggerGameOver(r, c);
      return;
    }

    if (cell.count > 0) {
      cellEl.textContent = cell.count;
      cellEl.classList.add(`num-${cell.count}`);
    } else {
      // Recursively open adjacent 0-neighboring cells (Flood-fill)
      this.getNeighbors(r, c).forEach(neighbor => {
        if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
          this.revealCell(neighbor.r, neighbor.c);
        }
      });
    }
  },

  triggerGameOver(explosionR, explosionC) {
    this.state.gameOver = true;
    this.stopTimer();
    this.stopAutoPlay();
    this.resetBtnEl.textContent = '😵';

    SoundEngine.play('explosion');

    // Highlight all mines on board
    for (let r = 0; r < this.state.rows; r++) {
      for (let c = 0; c < this.state.cols; c++) {
        const cell = this.state.board[r][c];
        const cellEl = document.getElementById(`cell-${r}-${c}`);

        if (cell.isMine) {
          if (r === explosionR && c === explosionC) {
            cellEl.classList.add('mine');
            cellEl.innerHTML = '<i class="fa-solid fa-bomb"></i>';
          } else if (!cell.isFlagged) {
            cellEl.classList.add('mine-revealed');
            cellEl.innerHTML = '<i class="fa-solid fa-bomb"></i>';
          }
        } else if (cell.isFlagged) {
          // Wrong flag indication
          cellEl.style.color = '#ef4444';
          cellEl.innerHTML = '<i class="fa-solid fa-ban"></i>';
        }
      }
    }

    this.log('[GAME OVER] 아쉬워요! 지뢰를 밟아 게임이 종료되었습니다.', 'flag');
  },

  checkGameWin() {
    // Win conditions: all non-mine cells are opened
    let unrevealedSafeCells = 0;
    for (let r = 0; r < this.state.rows; r++) {
      for (let c = 0; c < this.state.cols; c++) {
        const cell = this.state.board[r][c];
        if (!cell.isMine && !cell.isRevealed) {
          unrevealedSafeCells++;
        }
      }
    }

    if (unrevealedSafeCells === 0) {
      this.triggerGameWin();
    }
  },

  triggerGameWin() {
    this.state.gameWon = true;
    this.stopTimer();
    this.stopAutoPlay();
    this.resetBtnEl.textContent = '😎';

    SoundEngine.play('win');

    // Auto flag remaining mines
    for (let r = 0; r < this.state.rows; r++) {
      for (let c = 0; c < this.state.cols; c++) {
        const cell = this.state.board[r][c];
        if (cell.isMine && !cell.isFlagged) {
          cell.isFlagged = true;
          const cellEl = document.getElementById(`cell-${r}-${c}`);
          cellEl.classList.add('flagged');
          cellEl.innerHTML = '<i class="fa-solid fa-flag"></i>';
        }
      }
    }

    this.mineCountEl.textContent = '000';
    this.log('[VICTORY] 축하합니다! 지뢰를 모두 발견하고 무력화했습니다!', 'clear');
  },

  // Timer utilities
  startTimer() {
    this.stopTimer();
    this.state.timerInterval = setInterval(() => {
      this.state.timer++;
      if (this.state.timer > 999) this.state.timer = 999;
      this.timerEl.textContent = String(this.state.timer).padStart(3, '0');
    }, 1000);
  },

  stopTimer() {
    if (this.state.timerInterval) {
      clearInterval(this.state.timerInterval);
      this.state.timerInterval = null;
    }
  },

  // Auto Solver AI logic loops
  toggleAutoPlay() {
    if (this.state.gameOver || this.state.gameWon) {
      alert("게임이 이미 끝났습니다. 😀 스마일 단추를 클릭해 새 게임을 먼저 진행해 주세요.");
      return;
    }

    this.state.autoRunning = !this.state.autoRunning;
    const badge = document.getElementById('solver-status');

    if (this.state.autoRunning) {
      this.autoToggleBtnEl.innerHTML = '<i class="fa-solid fa-pause"></i> Auto 자동 재생 일시정지';
      this.autoToggleBtnEl.classList.add('active');
      badge.textContent = '해결 중';
      badge.classList.add('active-running');
      this.log('[SYSTEM] AI Auto-Solver 자동 재생이 시작되었습니다.', 'info');
      
      this.startAutoTimer();
    } else {
      this.stopAutoPlay();
      this.log('[SYSTEM] AI Auto-Solver 자동 재생이 일시정지되었습니다.', 'dim');
    }
  },

  stopAutoPlay() {
    this.state.autoRunning = false;
    this.autoToggleBtnEl.innerHTML = '<i class="fa-solid fa-play"></i> Auto 자동 재생 시작';
    this.autoToggleBtnEl.classList.remove('active');
    
    const badge = document.getElementById('solver-status');
    badge.textContent = '준비 완료';
    badge.classList.remove('active-running');
    
    this.stopAutoTimer();
  },

  startAutoTimer() {
    this.state.autoInterval = setInterval(() => {
      this.executeSolverMove();
    }, this.state.autoDelay);
  },

  stopAutoTimer() {
    if (this.state.autoInterval) {
      clearInterval(this.state.autoInterval);
      this.state.autoInterval = null;
    }
  },

  triggerStepSolve() {
    if (this.state.gameOver || this.state.gameWon) return;
    this.stopAutoPlay();
    this.executeSolverMove();
  },

  // Core solver move logic
  executeSolverMove() {
    if (this.state.gameOver || this.state.gameWon) {
      this.stopAutoPlay();
      return;
    }

    // First Click Action if board is clean
    if (this.state.firstClick) {
      // Pick a safe spot, preferably corners or middle
      const r = Math.floor(this.state.rows / 2);
      const c = Math.floor(this.state.cols / 2);
      
      this.log(`[GUESS] 게임 시작. 격자 중앙 (${c + 1}, ${r + 1}) 셀을 안전지대로 예측하여 오픈합니다.`, 'guess');
      this.handleCellClick(r, c);
      return;
    }

    // Gather candidate numbered cells
    const candidates = [];
    for (let r = 0; r < this.state.rows; r++) {
      for (let c = 0; c < this.state.cols; c++) {
        const cell = this.state.board[r][c];
        if (cell.isRevealed && cell.count > 0) {
          const neighbors = this.getNeighbors(r, c);
          const unopened = neighbors.filter(n => !n.isRevealed && !n.isFlagged);
          if (unopened.length > 0) {
            candidates.push({ cell, neighbors });
          }
        }
      }
    }

    // 1. Basic logic rule 1: Flag placement
    for (let i = 0; i < candidates.length; i++) {
      const { cell, neighbors } = candidates[i];
      const unopened = neighbors.filter(n => !n.isRevealed && !n.isFlagged);
      const flagged = neighbors.filter(n => n.isFlagged);

      // If remaining unopened cells matches remaining mines count (Number - Flags)
      if (unopened.length > 0 && unopened.length === cell.count - flagged.length) {
        // AI highlight effect
        unopened.forEach(n => {
          const el = document.getElementById(`cell-${n.r}-${n.c}`);
          el.classList.add('ai-evaluating');
        });

        // Trigger flag placement
        setTimeout(() => {
          unopened.forEach(n => {
            const el = document.getElementById(`cell-${n.r}-${n.c}`);
            el.classList.remove('ai-evaluating');
            if (!n.isFlagged) {
              this.handleCellRightClick(n.r, n.c);
              this.log(`[FLAG] (${n.c + 1}, ${n.r + 1}) 지뢰 확정! 깃발을 설치합니다.`, 'flag');
            }
          });
        }, 150);
        return;
      }
    }

    // 2. Basic logic rule 2: Clear safe neighbors
    for (let i = 0; i < candidates.length; i++) {
      const { cell, neighbors } = candidates[i];
      const unopened = neighbors.filter(n => !n.isRevealed && !n.isFlagged);
      const flagged = neighbors.filter(n => n.isFlagged);

      // If flags placed matches cell number, all other unopened neighbors are safe to clear
      if (unopened.length > 0 && flagged.length === cell.count) {
        // AI highlight effect
        unopened.forEach(n => {
          const el = document.getElementById(`cell-${n.r}-${n.c}`);
          el.classList.add('ai-evaluating');
        });

        // Trigger click clearing
        setTimeout(() => {
          unopened.forEach(n => {
            const el = document.getElementById(`cell-${n.r}-${n.c}`);
            el.classList.remove('ai-evaluating');
            if (!n.isRevealed && !n.isFlagged) {
              this.handleCellClick(n.r, n.c);
              this.log(`[CLEAR] (${n.c + 1}, ${n.r + 1}) 인접 안전지대 오픈.`, 'clear');
            }
          });
        }, 150);
        return;
      }
    }

    // 3. Calculated guessing fallback if no deterministic logic matches
    this.makeCalculatedGuess();
  },

  makeCalculatedGuess() {
    // Estimate probability for all unopened, unflagged border cells
    const borderCells = [];
    
    for (let r = 0; r < this.state.rows; r++) {
      for (let c = 0; c < this.state.cols; c++) {
        const cell = this.state.board[r][c];
        if (!cell.isRevealed && !cell.isFlagged) {
          const neighbors = this.getNeighbors(r, c);
          const adjacentRevealedNumbers = neighbors.filter(n => n.isRevealed && n.count > 0);
          
          if (adjacentRevealedNumbers.length > 0) {
            // Calculate probability contribution
            let maxProb = 0;
            adjacentRevealedNumbers.forEach(revCell => {
              const revNeighbors = this.getNeighbors(revCell.r, revCell.c);
              const revUnopened = revNeighbors.filter(n => !n.isRevealed && !n.isFlagged);
              const revFlagged = revNeighbors.filter(n => n.isFlagged);
              
              const remainingMines = revCell.count - revFlagged.length;
              if (revUnopened.length > 0) {
                const prob = remainingMines / revUnopened.length;
                if (prob > maxProb) maxProb = prob;
              }
            });
            borderCells.push({ cell, prob: maxProb });
          }
        }
      }
    }

    let targetCell = null;

    if (borderCells.length > 0) {
      // Find cells with lowest mine probability
      borderCells.sort((a, b) => a.prob - b.prob);
      const minProb = borderCells[0].prob;
      
      // Filter all cells matching minimum probability and pick one
      const bestCells = borderCells.filter(item => item.prob <= minProb);
      targetCell = bestCells[Math.floor(Math.random() * bestCells.length)].cell;
      
      const riskPercent = Math.round(minProb * 100);
      this.log(`[GUESS] 논리적 해법 교착 상태. 위험 확률 최소 계산지 (${targetCell.c + 1}, ${targetCell.r + 1}) 오픈 (지뢰 위험도 ${riskPercent}%).`, 'guess');
    } else {
      // No bordering cells at all (unopened islands), pick a random cell, preferring corner grids
      const allUnopened = [];
      for (let r = 0; r < this.state.rows; r++) {
        for (let c = 0; c < this.state.cols; c++) {
          const cell = this.state.board[r][c];
          if (!cell.isRevealed && !cell.isFlagged) {
            // Weight corners
            let weight = 1;
            if ((r === 0 || r === this.state.rows - 1) && (c === 0 || c === this.state.cols - 1)) {
              weight = 5; // highly preferred
            }
            allUnopened.push({ cell, weight });
          }
        }
      }

      if (allUnopened.length > 0) {
        // Weighted random picker
        const totalWeight = allUnopened.reduce((sum, item) => sum + item.weight, 0);
        let randomVal = Math.random() * totalWeight;
        
        for (let i = 0; i < allUnopened.length; i++) {
          randomVal -= allUnopened[i].weight;
          if (randomVal <= 0) {
            targetCell = allUnopened[i].cell;
            break;
          }
        }
      }
      
      if (targetCell) {
        this.log(`[GUESS] 논리 접점 없는 안전지대 탐색. 외부 격자 (${targetCell.c + 1}, ${targetCell.r + 1})를 무작위로 오픈합니다.`, 'guess');
      }
    }

    if (targetCell) {
      const el = document.getElementById(`cell-${targetCell.r}-${targetCell.c}`);
      el.classList.add('ai-evaluating');

      setTimeout(() => {
        el.classList.remove('ai-evaluating');
        this.handleCellClick(targetCell.r, targetCell.c);
      }, 150);
    }
  },

  // Terminal logging
  log(text, type) {
    const p = document.createElement('p');
    p.className = `log-line log-${type}`;
    p.textContent = text;
    this.logContentEl.appendChild(p);

    // Limit log display lines to prevent memory bloating
    while (this.logContentEl.childElementCount > 60) {
      this.logContentEl.removeChild(this.logContentEl.firstChild);
    }

    // Scroll to bottom
    this.logContentEl.scrollTop = this.logContentEl.scrollHeight;
  }
};

// Start App
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
