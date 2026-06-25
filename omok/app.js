// Board configuration
const canvas = document.getElementById('omok-canvas');
const ctx = canvas.getContext('2d');

const BOARD_SIZE = 15;
const cellSize = 38;
const padding = 34;

// Game State
let board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0)); // 0: empty, 1: black, 2: white
let moveHistory = []; // Stack of {x, y, player}
let gameMode = 'pve'; // pvp, pve, eve
let playerColor = 1; // 1: black, 2: white (PVE Mode user color)
let currentTurn = 1; // 1: black, 2: white
let aiLevel = 'medium'; // easy, medium, hard
let rulePreset = 'renju'; // renju, freestyle
let chkOverline = true;
let chkThreeThree = true;
let chkFourFour = true;
let chkShowNumbers = false;
let gameOver = false;

// DOM Elements
const turnDisplay = document.getElementById('turn-display');
const moveCountText = document.getElementById('move-count-text');
const startModal = document.getElementById('start-modal');
const winnerModal = document.getElementById('winner-modal');
const winnerTitle = document.getElementById('winner-title');
const winnerDetail = document.getElementById('winner-detail');

// Buttons & Selects
const btnPlayBlack = document.getElementById('btn-play-black');
const btnPlayWhite = document.getElementById('btn-play-white');
const btnUndo = document.getElementById('btn-undo');
const btnRestart = document.getElementById('btn-restart');
const btnNewgame = document.getElementById('btn-newgame');
const btnReplay = document.getElementById('btn-replay');
const btnWinClose = document.getElementById('btn-win-close');
const btnSaveSettings = document.getElementById('btn-save-settings');

const modeBtns = document.querySelectorAll('.tab-btn');
const radioColor = document.getElementsByName('stone-color');
const selectAiLevel = document.getElementById('ai-level');
const selectRulePreset = document.getElementById('rule-preset');
const toggleOverline = document.getElementById('chk-overline');
const toggleThreeThree = document.getElementById('chk-three-three');
const toggleFourFour = document.getElementById('chk-four-four');
const toggleShowNumbers = document.getElementById('chk-show-numbers');

// --- Canvas Draw Helpers ---

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw Board Background wood gradient
  const grad = ctx.createRadialGradient(300, 300, 50, 300, 300, 400);
  grad.addColorStop(0, '#f2bf83');
  grad.addColorStop(1, '#c68d4a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Grid Lines
  ctx.strokeStyle = '#3e2712';
  ctx.lineWidth = 1;
  
  for (let i = 0; i < BOARD_SIZE; i++) {
    // Horizontal Line
    ctx.beginPath();
    ctx.moveTo(padding, padding + i * cellSize);
    ctx.lineTo(padding + (BOARD_SIZE - 1) * cellSize, padding + i * cellSize);
    ctx.stroke();

    // Vertical Line
    ctx.beginPath();
    ctx.moveTo(padding + i * cellSize, padding);
    ctx.lineTo(padding + i * cellSize, padding + (BOARD_SIZE - 1) * cellSize);
    ctx.stroke();
  }

  // Draw Star Points (화점)
  const starPoints = [3, 7, 11];
  ctx.fillStyle = '#3e2712';
  starPoints.forEach(x => {
    starPoints.forEach(y => {
      // Draw stars at (3,3), (3,7), (3,11), (7,3), (7,7)...
      if (x === 7 && y === 3) return; // Skip minor points if desired, let's just draw 5 core stars
      if (x === 3 && y === 7) return;
      if (x === 11 && y === 7) return;
      if (x === 7 && y === 11) return;
      
      ctx.beginPath();
      ctx.arc(padding + x * cellSize, padding + y * cellSize, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  // Draw Stones
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] !== 0) {
        drawStone(x, y, board[y][x]);
      }
    }
  }

  // Draw last move marker
  if (moveHistory.length > 0) {
    const lastMove = moveHistory[moveHistory.length - 1];
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(padding + lastMove.x * cellSize, padding + lastMove.y * cellSize, 5, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawStone(x, y, player) {
  const cx = padding + x * cellSize;
  const cy = padding + y * cellSize;
  const r = cellSize * 0.44;

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);

  // Stone drop shadows
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 3;

  const stoneGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.1, cx, cy, r);
  
  if (player === 1) {
    // Black Stone
    stoneGrad.addColorStop(0, '#555555');
    stoneGrad.addColorStop(0.8, '#181818');
    stoneGrad.addColorStop(1, '#050505');
  } else {
    // White Stone
    stoneGrad.addColorStop(0, '#ffffff');
    stoneGrad.addColorStop(0.85, '#e5e5e5');
    stoneGrad.addColorStop(1, '#b5b5b5');
  }

  ctx.fillStyle = stoneGrad;
  ctx.fill();

  // Reset shadow for other drawings
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Draw number sequence if toggled
  if (chkShowNumbers) {
    const sequence = moveHistory.findIndex(h => h.x === x && h.y === y) + 1;
    if (sequence > 0) {
      ctx.fillStyle = player === 1 ? '#ffffff' : '#000000';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sequence, cx, cy);
    }
  }
}

// --- Rules & Victory Engines ---

function checkWin(x, y, player) {
  const dirs = [
    { dx: 1, dy: 0 },  // Horizontal
    { dx: 0, dy: 1 },  // Vertical
    { dx: 1, dy: 1 },  // Down-right diagonal
    { dx: 1, dy: -1 }  // Up-right diagonal
  ];

  for (const { dx, dy } of dirs) {
    let count = 1;
    
    // Positive direction
    let rx = x + dx;
    let ry = y + dy;
    while (rx >= 0 && rx < BOARD_SIZE && ry >= 0 && ry < BOARD_SIZE && board[ry][rx] === player) {
      count++;
      rx += dx;
      ry += dy;
    }

    // Negative direction
    rx = x - dx;
    ry = y - dy;
    while (rx >= 0 && rx < BOARD_SIZE && ry >= 0 && ry < BOARD_SIZE && board[ry][rx] === player) {
      count++;
      rx -= dx;
      ry -= dy;
    }

    if (player === 1 && rulePreset === 'renju' && chkOverline) {
      // Renju Overline Rule for Black: 6 or more is a foul (not a win)
      if (count === 5) return true;
    } else {
      // White can win with 5 or more (Freestyle allows both)
      if (count >= 5) return true;
    }
  }
  return false;
}

// Check if Black player makes an Overline foul (6 or more stones)
function checkOverlineFoul(x, y) {
  const dirs = [{ dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 }, { dx: 1, dy: -1 }];
  for (const { dx, dy } of dirs) {
    let count = 1;
    let rx = x + dx; let ry = y + dy;
    while (rx >= 0 && rx < BOARD_SIZE && ry >= 0 && ry < BOARD_SIZE && board[ry][rx] === 1) {
      count++; rx += dx; ry += dy;
    }
    rx = x - dx; ry = y - dy;
    while (rx >= 0 && rx < BOARD_SIZE && ry >= 0 && ry < BOARD_SIZE && board[ry][rx] === 1) {
      count++; rx -= dx; ry -= dy;
    }
    if (count > 5) return true; // Foul!
  }
  return false;
}

// Check 3-3 (Double Three) rule for Black
// Simplified double-three detection:
// For a coordinate (x,y), if black places a stone, does it create 2 or more "Open Threes"?
function checkThreeThreeFoul(x, y) {
  board[y][x] = 1; // Try placing the stone
  let openThreeCount = 0;
  
  const dirs = [{ dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 }, { dx: 1, dy: -1 }];
  
  for (const { dx, dy } of dirs) {
    if (isOpenThree(x, y, dx, dy, 1)) {
      openThreeCount++;
    }
  }
  
  board[y][x] = 0; // Revert
  return openThreeCount >= 2;
}

// Check if a line forms a "Three" that can be expanded to an "Open Four"
function isOpenThree(x, y, dx, dy, player) {
  // Scan a window of 6 coordinates containing (x,y) to detect open 3s
  // Open 3 structure typically looks like: . O O O . or . O . O O . with ends empty
  let foundPattern = false;
  
  for (let offset = -4; offset <= 0; offset++) {
    let cells = [];
    let validRange = true;
    
    for (let i = 0; i < 6; i++) {
      const rx = x + (offset + i) * dx;
      const ry = y + (offset + i) * dy;
      if (rx >= 0 && rx < BOARD_SIZE && ry >= 0 && ry < BOARD_SIZE) {
        cells.push(board[ry][rx]);
      } else {
        validRange = false;
        break;
      }
    }

    if (!validRange) continue;

    // Pattern Check: . O O O . (Empty, Stone, Stone, Stone, Empty)
    if (cells[0] === 0 && cells[1] === player && cells[2] === player && cells[3] === player && cells[4] === 0) {
      foundPattern = true;
    }
    // Pattern Check: . O . O O .
    if (cells[0] === 0 && cells[1] === player && cells[2] === 0 && cells[3] === player && cells[4] === player && cells[5] === 0) {
      foundPattern = true;
    }
    // Pattern Check: . O O . O .
    if (cells[0] === 0 && cells[1] === player && cells[2] === player && cells[3] === 0 && cells[4] === player && cells[5] === 0) {
      foundPattern = true;
    }
  }
  
  return foundPattern;
}

// --- HEURISTIC AI ENGINE ---

// Positional weight maps (prefers center placements)
const positionWeights = Array(BOARD_SIZE).fill().map((_, y) => 
  Array(BOARD_SIZE).fill().map((_, x) => {
    const distToCenter = Math.abs(x - 7) + Math.abs(y - 7);
    return 14 - distToCenter; // Center is 14, edges are 0
  })
);

// Evaluates a single coordinate for a player
// returns a score based on lines formed if the player plays at (x,y)
function evaluateMove(x, y, player) {
  board[y][x] = player;
  
  const dirs = [{ dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 }, { dx: 1, dy: -1 }];
  let score = 0;
  
  for (const { dx, dy } of dirs) {
    const stats = checkLineStats(x, y, dx, dy, player);
    
    if (stats.count === 5) {
      score += 100000; // Win!
    } else if (stats.count === 4) {
      if (stats.openEnds === 2) score += 10000; // Open 4 (straight victory)
      else if (stats.openEnds === 1) score += 1500; // Closed 4
    } else if (stats.count === 3) {
      if (stats.openEnds === 2) score += 1200; // Open 3 (very strong)
      else if (stats.openEnds === 1) score += 150; // Closed 3
    } else if (stats.count === 2) {
      if (stats.openEnds === 2) score += 100; // Open 2
      else if (stats.openEnds === 1) score += 10;
    }
  }
  
  board[y][x] = 0; // Revert
  return score;
}

// Analyzes the line length and open ends for (x,y)
function checkLineStats(x, y, dx, dy, player) {
  let count = 1;
  let openEnds = 0;
  
  // Positive Direction
  let rx = x + dx; let ry = y + dy;
  while (rx >= 0 && rx < BOARD_SIZE && ry >= 0 && ry < BOARD_SIZE && board[ry][rx] === player) {
    count++; rx += dx; ry += dy;
  }
  if (rx >= 0 && rx < BOARD_SIZE && ry >= 0 && ry < BOARD_SIZE && board[ry][rx] === 0) {
    openEnds++;
  }

  // Negative Direction
  rx = x - dx; ry = y - dy;
  while (rx >= 0 && rx < BOARD_SIZE && ry >= 0 && ry < BOARD_SIZE && board[ry][rx] === player) {
    count++; rx -= dx; ry -= dy;
  }
  if (rx >= 0 && rx < BOARD_SIZE && ry >= 0 && ry < BOARD_SIZE && board[ry][rx] === 0) {
    openEnds++;
  }
  
  return { count, openEnds };
}

// Main AI Turn Handler
function runAITurn() {
  if (gameOver) return;

  let bestScore = -1;
  let bestMoves = [];

  const aiPlayer = currentTurn;
  const oppPlayer = aiPlayer === 1 ? 2 : 1;

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] !== 0) continue; // Must be empty
      
      // Renju Rule checks if AI is Black
      if (aiPlayer === 1 && rulePreset === 'renju') {
        if (chkThreeThree && checkThreeThreeFoul(x, y)) continue;
        if (chkOverline && checkOverlineFoul(x, y)) continue;
      }

      // Compute scoring
      const attackScore = evaluateMove(x, y, aiPlayer);
      const defenseScore = evaluateMove(x, y, oppPlayer);
      
      // Medium/Hard level adjusts weighting of defense
      let totalScore = attackScore + defenseScore * 0.9 + positionWeights[y][x] * 0.2;
      
      // If easy level, lower defense awareness
      if (aiLevel === 'easy') {
        totalScore = attackScore + defenseScore * 0.4 + positionWeights[y][x] * 0.5;
      } else if (aiLevel === 'hard') {
        // High density su-ilki: prioritizing winning moves heavily
        totalScore = attackScore * 1.2 + defenseScore * 1.0 + positionWeights[y][x] * 0.1;
      }

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestMoves = [{ x, y }];
      } else if (totalScore === bestScore) {
        bestMoves.push({ x, y });
      }
    }
  }

  // Choose a random move from the pool of best scoring coordinates
  if (bestMoves.length > 0) {
    const choice = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    makeMove(choice.x, choice.y);
  }
}

// Make a valid move
function makeMove(x, y) {
  board[y][x] = currentTurn;
  moveHistory.push({ x, y, player: currentTurn });
  
  drawBoard();
  
  // Update Toolbar status
  btnUndo.disabled = false;
  btnReplay.disabled = true;

  // Check victory
  if (checkWin(x, y, currentTurn)) {
    endGame(`${currentTurn === 1 ? '흑' : '백'} 승리!`, '연속된 5개의 돌이 연결되어 승리했습니다.');
    return;
  }

  // Check board full (Draw)
  if (moveHistory.length === BOARD_SIZE * BOARD_SIZE) {
    endGame('무승부', '바둑판이 가득 찼습니다.');
    return;
  }

  // Turn toggles
  currentTurn = currentTurn === 1 ? 2 : 1;
  updateStatusDisplay();

  // If AI mode and it's AI turn, launch timer
  if (!gameOver && gameMode === 'pve' && currentTurn !== playerColor) {
    setTimeout(runAITurn, 400); // 400ms delay for realism
  } else if (!gameOver && gameMode === 'eve') {
    setTimeout(runAITurn, 400);
  }
}

function endGame(title, detail) {
  gameOver = true;
  winnerTitle.textContent = title;
  winnerDetail.textContent = detail;
  winnerModal.classList.add('open');
}

function updateStatusDisplay() {
  const turnStone = turnDisplay.querySelector('.turn-stone');
  const turnText = turnDisplay.querySelector('.turn-text');
  
  if (currentTurn === 1) {
    turnStone.className = 'turn-stone stone-black';
    turnText.textContent = '흑 차례';
  } else {
    turnStone.className = 'turn-stone stone-white';
    turnText.textContent = '백 차례';
  }

  moveCountText.textContent = moveHistory.length;
}

// --- INTERACTIVE ACTIONS & EVENTS ---

function resetGame() {
  board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
  moveHistory = [];
  gameOver = false;
  currentTurn = 1;
  
  btnUndo.disabled = true;
  btnReplay.disabled = true;
  
  drawBoard();
  updateStatusDisplay();
}

// Board Canvas Click Event Listener
canvas.addEventListener('click', (e) => {
  if (gameOver) return;
  
  // In PVE Mode, block clicks during AI turn
  if (gameMode === 'pve' && currentTurn !== playerColor) return;
  if (gameMode === 'eve') return; // Blocks click altogether in AI vs AI

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Snap to grid
  const gridX = Math.round((mouseX - padding) / cellSize);
  const gridY = Math.round((mouseY - padding) / cellSize);

  // Check valid index bounds
  if (gridX >= 0 && gridX < BOARD_SIZE && gridY >= 0 && gridY < BOARD_SIZE) {
    if (board[gridY][gridX] !== 0) return; // Spot taken

    // Renju rule checks for Black (foul placement alert)
    if (currentTurn === 1 && rulePreset === 'renju') {
      if (chkThreeThree && checkThreeThreeFoul(gridX, gridY)) {
        alert('금수(3-3) 자리입니다. 돌을 놓을 수 없습니다.');
        return;
      }
      if (chkOverline && checkOverlineFoul(gridX, gridY)) {
        alert('금수(오버라인 - 6목 이상) 자리입니다. 돌을 놓을 수 없습니다.');
        return;
      }
    }

    makeMove(gridX, gridY);
  }
});

// Modal Start Button Click Handlers
btnPlayBlack.addEventListener('click', () => {
  playerColor = 1; // User is Black
  resetGame();
  startModal.classList.add('hidden');
});

btnPlayWhite.addEventListener('click', () => {
  playerColor = 2; // User is White
  resetGame();
  startModal.classList.add('hidden');
  
  // AI is Black, makes first move in center
  setTimeout(() => {
    makeMove(7, 7);
  }, 400);
});

// Undo (무르기)
btnUndo.addEventListener('click', () => {
  if (moveHistory.length === 0) return;
  
  gameOver = false; // clear win modal

  if (gameMode === 'pve') {
    // In PVE, undoing deletes both User move and AI move (2 moves)
    if (moveHistory.length >= 2) {
      const m1 = moveHistory.pop();
      board[m1.y][m1.x] = 0;
      const m2 = moveHistory.pop();
      board[m2.y][m2.x] = 0;
      currentTurn = playerColor; // keep user turn
    } else {
      // User is white and undoes first AI move
      const m1 = moveHistory.pop();
      board[m1.y][m1.x] = 0;
      currentTurn = 1;
    }
  } else {
    // PVP or EVE, undoes 1 move
    const m = moveHistory.pop();
    board[m.y][m.x] = 0;
    currentTurn = currentTurn === 1 ? 2 : 1;
  }

  drawBoard();
  updateStatusDisplay();
  
  if (moveHistory.length === 0) btnUndo.disabled = true;
});

// Restart (다시두기)
btnRestart.addEventListener('click', () => {
  resetGame();
  if (gameMode === 'pve' && playerColor === 2) {
    setTimeout(() => { makeMove(7, 7); }, 400);
  }
});

// Newgame (새 게임)
btnNewgame.addEventListener('click', () => {
  resetGame();
  startModal.classList.remove('hidden');
});

btnWinClose.addEventListener('click', () => {
  winnerModal.classList.remove('open');
});

// Settings Management
btnSaveSettings.addEventListener('click', () => {
  // Apply setting values from elements
  const activeModeBtn = document.querySelector('.tab-btn.active');
  gameMode = activeModeBtn.getAttribute('data-mode');
  
  const activeColor = document.querySelector('input[name="stone-color"]:checked').value;
  playerColor = activeColor === 'black' ? 1 : 2;
  
  aiLevel = document.getElementById('ai-level').value;
  rulePreset = document.getElementById('rule-preset').value;
  
  chkOverline = toggleOverline.checked;
  chkThreeThree = toggleThreeThree.checked;
  chkFourFour = toggleFourFour.checked;
  chkShowNumbers = toggleShowNumbers.checked;

  alert('게임 설정이 저장되었습니다. 새 게임을 시작합니다.');
  
  resetGame();
  if (gameMode === 'pve') {
    startModal.classList.add('hidden');
    if (playerColor === 2) {
      setTimeout(() => { makeMove(7, 7); }, 400);
    }
  } else if (gameMode === 'eve') {
    startModal.classList.add('hidden');
    setTimeout(runAITurn, 400);
  } else {
    startModal.classList.add('hidden');
  }
});

// Mode switch UI buttons event
modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    modeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Toggle color/diff selector display based on selected mode
    const mode = btn.getAttribute('data-mode');
    const colorSelector = document.getElementById('stone-color-selector');
    const difficultySelector = document.getElementById('ai-difficulty-selector');
    
    if (mode === 'pvp') {
      colorSelector.style.display = 'none';
      difficultySelector.style.display = 'none';
    } else if (mode === 'eve') {
      colorSelector.style.display = 'none';
      difficultySelector.style.display = 'block';
    } else {
      colorSelector.style.display = 'block';
      difficultySelector.style.display = 'block';
    }
  });
});

// Initial Setup
drawBoard();
updateStatusDisplay();
btnUndo.disabled = true;
btnReplay.disabled = true;
// Modal is initially open
startModal.classList.remove('hidden');
