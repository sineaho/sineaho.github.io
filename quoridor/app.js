document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const lobbyPanel = document.getElementById('lobby-panel');
  const gamePanel = document.getElementById('game-panel');
  const playerSlotsContainer = document.getElementById('player-slots-container');
  const btnStartGame = document.getElementById('btn-start-game');
  
  const turnTitleText = document.getElementById('turn-title-text');
  const turnIndicatorDot = document.getElementById('turn-indicator-dot');
  const turnTimer = document.getElementById('turn-timer');
  const hudPlayersList = document.getElementById('hud-players-list');
  
  const btnToggleWallDirection = document.getElementById('btn-toggle-wall-direction');
  const wallDirectionText = document.getElementById('wall-direction-text');
  const btnResetCamera = document.getElementById('btn-reset-camera');
  const btnUndo = document.getElementById('btn-undo');
  const btnQuit = document.getElementById('btn-quit');
  const aiSpeedWrapper = document.getElementById('ai-speed-wrapper');
  const rangeAiSpeed = document.getElementById('range-ai-speed');
  const aiSpeedVal = document.getElementById('ai-speed-val');
  
  const scene3dCanvas = document.getElementById('scene-3d-canvas');
  const boardWrapperElement = document.getElementById('board-wrapper-element');
  const boardElement = document.getElementById('board-element');
  const boardGridElement = document.getElementById('board-grid-element');
  const wallPreviewsElement = document.getElementById('wall-previews-element');
  const placedWallsElement = document.getElementById('placed-walls-element');
  const pawnsElement = document.getElementById('pawns-element');
  const hudWallsRackElement = document.getElementById('hud-walls-rack-element');
  
  const rulesModal = document.getElementById('rules-modal');
  const btnRules = document.getElementById('btn-rules');
  const btnCloseRules = document.getElementById('btn-close-rules');
  
  const winnerModal = document.getElementById('winner-modal');
  const winnerTitleName = document.getElementById('winner-title-name');
  const btnLobbyReturn = document.getElementById('btn-lobby-return');
  const btnRestartGame = document.getElementById('btn-restart-game');
  
  const themeToggle = document.getElementById('theme-toggle');

  // --- Game Settings & Configuration Constants ---
  const PLAYER_DEFS = [
    { id: 0, name: 'White Spy (Player 1)', colorClass: 'color-white', color: '#ffffff', start: { x: 4, y: 8 }, goal: 'y0' },
    { id: 1, name: 'Black Spy (Player 2)', colorClass: 'color-black', color: '#18181b', start: { x: 4, y: 0 }, goal: 'y8' },
    { id: 2, name: 'Yellow Spy (Player 3)', colorClass: 'color-yellow', color: '#eab308', start: { x: 0, y: 4 }, goal: 'x8' },
    { id: 3, name: 'Blue Spy (Player 4)', colorClass: 'color-blue', color: '#2563eb', start: { x: 8, y: 4 }, goal: 'x0' }
  ];

  // Grid Constants
  const GRID_SIZE = 9;
  const BOARD_PIXEL_SIZE = 460;
  const GRID_PADDING = 16;
  const GAP_SIZE = 8;
  const TILE_SIZE = (BOARD_PIXEL_SIZE - 2 * GRID_PADDING - (GRID_SIZE - 1) * GAP_SIZE) / GRID_SIZE; // ~40.66px

  // --- Game State Variables ---
  let state = {
    maxPlayers: 2,
    playersConfig: [
      { type: 'human' }, // Player 1
      { type: 'ai' },    // Player 2
      { type: 'ai' },    // Player 3 (hidden initially)
      { type: 'ai' }     // Player 4 (hidden initially)
    ],
    gameStarted: false,
    activePlayers: [], // Players actually in current match
    currentPlayerIdx: 0,
    placedWalls: [],   // list of { x, y, type: 'h'|'v', playerIdx }
    playerPositions: [], // list of { x, y } mapping to playerIdx
    playerWallsLeft: [], // walls left for each player
    history: [],       // list of past moves for Undo: { playerPositions, placedWalls, playerWallsLeft, currentPlayerIdx }
    
    // UI states
    wallPlacementMode: false,
    wallDirection: 'h', // 'h' or 'v'
    selectedWallIntersection: null, // { wx, wy }
    hoveredIntersection: null,      // { wx, wy }
    
    // camera rotation angles
    rotateX: 52,
    rotateZ: -28,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    dragAngles: { x: 0, z: 0 },
    
    // timers and AI
    turnTimerInterval: null,
    turnSecondsLeft: 15,
    aiTimeout: null,
    aiDelayMs: 1000
  };

  // --- Theme Toggle ---
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeButton(savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
  });

  function updateThemeButton(theme) {
    if (theme === 'light') {
      themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i> <span>다크</span>';
    } else {
      themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i> <span>라이트</span>';
    }
  }

  // --- 3D Camera Mouse/Touch Drag Controls ---
  const initCameraControls = () => {
    const onDragStart = (clientX, clientY) => {
      state.isDragging = true;
      state.dragStart.x = clientX;
      state.dragStart.y = clientY;
      state.dragAngles.x = state.rotateX;
      state.dragAngles.z = state.rotateZ;
    };

    const onDragMove = (clientX, clientY) => {
      if (!state.isDragging) return;
      const dx = clientX - state.dragStart.x;
      const dy = clientY - state.dragStart.y;

      // Rotate camera angles (limit pitch RotateX to prevent upside down)
      state.rotateZ = state.dragAngles.z + dx * 0.5;
      state.rotateX = Math.max(15, Math.min(85, state.dragAngles.x - dy * 0.5));
      
      applyCameraRotation();
    };

    const onDragEnd = () => {
      state.isDragging = false;
    };

    // Mouse listeners
    scene3dCanvas.addEventListener('mousedown', (e) => {
      // Drag only on the canvas backdrop, not on tiles or UI buttons
      if (e.target.closest('.tile') || e.target.closest('button')) return;
      onDragStart(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', (e) => onDragMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onDragEnd);

    // Touch listeners for mobile
    scene3dCanvas.addEventListener('touchstart', (e) => {
      if (e.target.closest('.tile') || e.target.closest('button')) return;
      if (e.touches.length > 0) {
        onDragStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        onDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
    window.addEventListener('touchend', onDragEnd);
  };

  const applyCameraRotation = () => {
    boardWrapperElement.style.transform = `rotateX(${state.rotateX}deg) rotateZ(${state.rotateZ}deg)`;
  };

  btnResetCamera.addEventListener('click', () => {
    state.rotateX = 52;
    state.rotateZ = -28;
    applyCameraRotation();
  });

  // --- Quoridor Rules/Settings Lobby ---
  const updateLobbySlots = () => {
    playerSlotsContainer.innerHTML = '';
    const slotsCount = state.maxPlayers;
    
    for (let i = 0; i < slotsCount; i++) {
      const def = PLAYER_DEFS[i];
      const config = state.playersConfig[i];
      
      const slotDiv = document.createElement('div');
      slotDiv.className = 'slot-item';
      slotDiv.innerHTML = `
        <div class="slot-title">
          <span>플레이어 ${i + 1}</span>
          <span class="slot-color-badge" style="color: ${def.color}; background: ${def.color};"></span>
        </div>
        <div class="slot-name" style="font-size: 0.95rem; font-weight: 600;">${def.name}</div>
        <div class="slot-controls">
          <button class="slot-btn ${config.type === 'human' ? 'active' : ''}" data-player="${i}" data-type="human">
            <i class="fa-solid fa-keyboard"></i> 사람
          </button>
          <button class="slot-btn ${config.type === 'ai' ? 'active' : ''}" data-player="${i}" data-type="ai">
            <i class="fa-solid fa-robot"></i> AI
          </button>
        </div>
      `;
      
      playerSlotsContainer.appendChild(slotDiv);
    }

    // Bind slot buttons
    playerSlotsContainer.querySelectorAll('.slot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const playerIdx = parseInt(btn.getAttribute('data-player'), 10);
        const type = btn.getAttribute('data-type');
        
        state.playersConfig[playerIdx].type = type;
        
        // Re-render
        updateLobbySlots();
      });
    });
  };

  // Max player toggle
  document.querySelectorAll('.btn-count-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-count-toggle').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      state.maxPlayers = parseInt(btn.getAttribute('data-count'), 10);
      updateLobbySlots();
    });
  });

  // Toggle rules modal
  btnRules.addEventListener('click', () => rulesModal.style.display = 'flex');
  btnCloseRules.addEventListener('click', () => rulesModal.style.display = 'none');

  // Return to lobby
  btnQuit.addEventListener('click', () => {
    if (confirm('게임이 진행 중입니다. 정말 기권하고 로비로 돌아가시겠습니까?')) {
      resetGameToLobby();
    }
  });

  btnLobbyReturn.addEventListener('click', () => {
    winnerModal.style.display = 'none';
    resetGameToLobby();
  });

  btnRestartGame.addEventListener('click', () => {
    winnerModal.style.display = 'none';
    startGame();
  });

  const resetGameToLobby = () => {
    clearInterval(state.turnTimerInterval);
    clearTimeout(state.aiTimeout);
    state.gameStarted = false;
    
    gamePanel.style.display = 'none';
    lobbyPanel.style.display = 'block';
  };

  // --- Initializing 3D Board Layout in DOM ---
  const generateBoardGridDOM = () => {
    boardGridElement.innerHTML = '';
    
    // Create 9x9 tiles
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.setAttribute('data-x', x);
        tile.setAttribute('data-y', y);
        
        // Mark specific start boundaries for visual colors
        if (y === 8 && x === 4) tile.classList.add('start-white');
        if (y === 0 && x === 4) tile.classList.add('start-black');
        if (x === 0 && y === 4) tile.classList.add('start-yellow');
        if (x === 8 && y === 4) tile.classList.add('start-blue');
        
        tile.addEventListener('click', () => handleTileClick(x, y));
        boardGridElement.appendChild(tile);
      }
    }

    // Create wall hover preview intersections overlay
    // The wall placements fit in the intersections of cells.
    // There are (GRID_SIZE - 1) * (GRID_SIZE - 1) = 8 * 8 intersections
    wallPreviewsElement.innerHTML = '';
    for (let wy = 0; wy < GRID_SIZE - 1; wy++) {
      for (let wx = 0; wx < GRID_SIZE - 1; wx++) {
        const intersection = document.createElement('div');
        intersection.className = 'wall-intersection';
        
        // Positions are calculated in CSS absolute pixels matching the gaps
        const left = GRID_PADDING + wx * (TILE_SIZE + GAP_SIZE) + TILE_SIZE;
        const top = GRID_PADDING + wy * (TILE_SIZE + GAP_SIZE) + TILE_SIZE;
        
        intersection.style.left = `${left}px`;
        intersection.style.top = `${top}px`;
        intersection.style.width = `${GAP_SIZE}px`;
        intersection.style.height = `${GAP_SIZE}px`;
        
        intersection.addEventListener('mouseenter', () => handleIntersectionMouseEnter(wx, wy));
        intersection.addEventListener('mouseleave', handleIntersectionMouseLeave);
        intersection.addEventListener('click', () => handleIntersectionClick(wx, wy));
        
        wallPreviewsElement.appendChild(intersection);
      }
    }
  };

  // --- Core Game Logic Mechanics ---
  const startGame = () => {
    state.gameStarted = true;
    
    // Setup active players based on max players
    state.activePlayers = [];
    state.playerPositions = [];
    state.playerWallsLeft = [];
    state.history = [];
    
    const initialWallsCount = state.maxPlayers === 2 ? 10 : 5;
    
    for (let i = 0; i < state.maxPlayers; i++) {
      const def = PLAYER_DEFS[i];
      const config = state.playersConfig[i];
      
      state.activePlayers.push({
        id: i,
        name: def.name,
        colorClass: def.colorClass,
        color: def.color,
        type: config.type,
        goal: def.goal
      });
      
      state.playerPositions.push({ x: def.start.x, y: def.start.y });
      state.playerWallsLeft.push(initialWallsCount);
    }
    
    state.placedWalls = [];
    state.currentPlayerIdx = 0;
    
    // Check if AI Speed selector is needed (for spectator or AI matches)
    const hasHumans = state.activePlayers.some(p => p.type === 'human');
    if (!hasHumans) {
      aiSpeedWrapper.style.display = 'block';
    } else {
      aiSpeedWrapper.style.display = 'none';
    }
    
    // UI Layout setups
    lobbyPanel.style.display = 'none';
    gamePanel.style.display = 'grid';
    
    generateBoardGridDOM();
    
    renderPawns();
    renderWalls();
    renderHUD();
    
    startTurn();
  };

  // --- Standard Move Adjacency Validation Checks ---
  
  // Checks if movement from (x1, y1) to (x2, y2) is blocked by a wall
  const isBlockedByWall = (x1, y1, x2, y2) => {
    // Horizontal movement
    if (y1 === y2) {
      const minX = Math.min(x1, x2);
      // Blocks horizontal: a vertical wall at minX spanning row y1 or y1-1
      return state.placedWalls.some(w => w.type === 'v' && w.x === minX && (w.y === y1 || w.y === y1 - 1));
    }
    // Vertical movement
    if (x1 === x2) {
      const minY = Math.min(y1, y2);
      // Blocks vertical: a horizontal wall at minY spanning col x1 or x1-1
      return state.placedWalls.some(w => w.type === 'h' && w.y === minY && (w.x === x1 || w.x === x1 - 1));
    }
    return false;
  };

  // Helper to check if a pawn is at (x, y)
  const isPawnAt = (x, y) => {
    return state.playerPositions.some(pos => pos.x === x && pos.y === y);
  };

  // Calculates valid moves for a pawn at (x, y)
  const getValidMoves = (playerIdx) => {
    const pos = state.playerPositions[playerIdx];
    const x = pos.x;
    const y = pos.y;
    const moves = [];
    
    const directions = [
      { dx: 0, dy: -1 }, // Up
      { dx: 0, dy: 1 },  // Down
      { dx: -1, dy: 0 }, // Left
      { dx: 1, dy: 0 }   // Right
    ];
    
    directions.forEach(dir => {
      const nx = x + dir.dx;
      const ny = y + dir.dy;
      
      // Inside board bounds check
      if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
        // Wall check
        if (!isBlockedByWall(x, y, nx, ny)) {
          if (!isPawnAt(nx, ny)) {
            // Normal move
            moves.push({ x: nx, y: ny });
          } else {
            // Jump move!
            const jx = nx + dir.dx;
            const jy = ny + dir.dy;
            
            // Check jump straight ahead
            if (jx >= 0 && jx < GRID_SIZE && jy >= 0 && jy < GRID_SIZE && !isBlockedByWall(nx, ny, jx, jy) && !isPawnAt(jx, jy)) {
              moves.push({ x: jx, y: jy });
            } else {
              // Can't jump straight (out of bounds or blocked by wall/another pawn).
              // Can jump diagonally!
              // Diagonal offsets perpendicular to direction
              const diagonals = dir.dx === 0 
                ? [{ dx: -1, dy: 0 }, { dx: 1, dy: 0 }] // Vertical moving -> horizontal diagonals
                : [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }]; // Horizontal moving -> vertical diagonals
                
              diagonals.forEach(diag => {
                const px = nx + diag.dx;
                const py = ny + diag.dy;
                
                if (px >= 0 && px < GRID_SIZE && py >= 0 && py < GRID_SIZE && !isBlockedByWall(nx, ny, px, py) && !isPawnAt(px, py)) {
                  moves.push({ x: px, y: py });
                }
              });
            }
          }
        }
      }
    });
    
    return moves;
  };

  // --- BFS Path Validation algorithm for walls ---
  
  // BFS search to check if player can reach goal line
  const hasPathToGoal = (playerIdx, tempWalls = state.placedWalls) => {
    const startPos = state.playerPositions[playerIdx];
    const goal = state.activePlayers[playerIdx].goal;
    
    const queue = [{ x: startPos.x, y: startPos.y }];
    const visited = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
    visited[startPos.x][startPos.y] = true;
    
    // Adjacency helper with tempWalls list
    const isTempBlockedByWall = (x1, y1, x2, y2) => {
      if (y1 === y2) {
        const minX = Math.min(x1, x2);
        return tempWalls.some(w => w.type === 'v' && w.x === minX && (w.y === y1 || w.y === y1 - 1));
      }
      if (x1 === x2) {
        const minY = Math.min(y1, y2);
        return tempWalls.some(w => w.type === 'h' && w.y === minY && (w.x === x1 || w.x === x1 - 1));
      }
      return false;
    };
    
    while (queue.length > 0) {
      const curr = queue.shift();
      
      // Goal condition check
      if (goal === 'y0' && curr.y === 0) return true;
      if (goal === 'y8' && curr.y === 8) return true;
      if (goal === 'x8' && curr.x === 8) return true;
      if (goal === 'x0' && curr.x === 0) return true;
      
      const directions = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 }
      ];
      
      for (const dir of directions) {
        const nx = curr.x + dir.dx;
        const ny = curr.y + dir.dy;
        
        if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
          if (!visited[nx][ny] && !isTempBlockedByWall(curr.x, curr.y, nx, ny)) {
            visited[nx][ny] = true;
            queue.push({ x: nx, y: ny });
          }
        }
      }
    }
    
    return false;
  };

  // BFS search to get actual shortest path distance (for AI scoring)
  const getShortestPathLength = (playerIdx, currentX = state.playerPositions[playerIdx].x, currentY = state.playerPositions[playerIdx].y) => {
    const goal = state.activePlayers[playerIdx].goal;
    
    const queue = [{ x: currentX, y: currentY, dist: 0 }];
    const visited = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
    visited[currentX][currentY] = true;
    
    while (queue.length > 0) {
      const curr = queue.shift();
      
      // Goal checks
      if (goal === 'y0' && curr.y === 0) return curr.dist;
      if (goal === 'y8' && curr.y === 8) return curr.dist;
      if (goal === 'x8' && curr.x === 8) return curr.dist;
      if (goal === 'x0' && curr.x === 0) return curr.dist;
      
      const directions = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 }
      ];
      
      for (const dir of directions) {
        const nx = curr.x + dir.dx;
        const ny = curr.y + dir.dy;
        
        if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
          if (!visited[nx][ny] && !isBlockedByWall(curr.x, curr.y, nx, ny)) {
            visited[nx][ny] = true;
            queue.push({ x: nx, y: ny, dist: curr.dist + 1 });
          }
        }
      }
    }
    
    return 999; // Unreachable
  };

  // Validates if a new wall at (wx, wy) with orientation type is legal
  const isValidWall = (wx, wy, type, checkPathLock = true) => {
    // Bounds check
    if (wx < 0 || wx >= GRID_SIZE - 1 || wy < 0 || wy >= GRID_SIZE - 1) return false;
    
    // 1. Overlap checks with existing walls
    for (const wall of state.placedWalls) {
      if (type === 'h') {
        // Horizontal wall overlaps:
        // - exactly same H wall
        // - adjacent horizontal walls sharing segments
        // - intersects a vertical wall at center
        if (wall.type === 'h' && wall.y === wy && Math.abs(wall.x - wx) < 2) return false;
        if (wall.type === 'v' && wall.x === wx && wall.y === wy) return false;
      } else {
        // Vertical wall overlaps:
        // - exactly same V wall
        // - adjacent vertical walls sharing segments
        // - intersects a horizontal wall at center
        if (wall.type === 'v' && wall.x === wx && Math.abs(wall.y - wy) < 2) return false;
        if (wall.type === 'h' && wall.x === wx && wall.y === wy) return false;
      }
    }
    
    // 2. Lock path checks (BFS validation for all active players)
    if (checkPathLock) {
      const tempWalls = [...state.placedWalls, { x: wx, y: wy, type: type, playerIdx: state.currentPlayerIdx }];
      for (let p = 0; p < state.activePlayers.length; p++) {
        if (!hasPathToGoal(p, tempWalls)) {
          return false; // Path blocked for player p!
        }
      }
    }
    
    return true;
  };

  // --- Turn management ---
  const startTurn = () => {
    const player = state.activePlayers[state.currentPlayerIdx];
    
    // Update Indicators
    turnTitleText.textContent = `${player.name} 턴`;
    turnTitleText.className = player.colorClass;
    turnIndicatorDot.style.color = player.color;
    turnIndicatorDot.style.boxShadow = `0 0 12px ${player.color}`;
    
    // Reset timer
    state.turnSecondsLeft = 15;
    turnTimer.textContent = `남은 시간: ${state.turnSecondsLeft}초`;
    
    clearInterval(state.turnTimerInterval);
    state.turnTimerInterval = setInterval(() => {
      state.turnSecondsLeft--;
      if (state.turnSecondsLeft < 0) {
        // Timeout -> Force pass or random move
        clearInterval(state.turnTimerInterval);
        handleTimeout();
      } else {
        turnTimer.textContent = `남은 시간: ${state.turnSecondsLeft}초`;
      }
    }, 1000);
    
    // Enable Undo only if history exists and next player is human (or AI spectator is active)
    btnUndo.disabled = state.history.length === 0;

    // Highlight valid tiles for human players
    clearValidMovesHighlight();
    if (player.type === 'human') {
      highlightValidMoves();
    } else {
      // AI Turn -> Trigger thinking timeout
      clearTimeout(state.aiTimeout);
      state.aiTimeout = setTimeout(playAILogic, state.aiDelayMs);
    }
    
    renderHUD();
  };

  const nextTurn = () => {
    // Check win conditions first
    const lastPlayerIdx = state.currentPlayerIdx;
    const lastPos = state.playerPositions[lastPlayerIdx];
    const goal = state.activePlayers[lastPlayerIdx].goal;
    
    let isWinner = false;
    if (goal === 'y0' && lastPos.y === 0) isWinner = true;
    if (goal === 'y8' && lastPos.y === 8) isWinner = true;
    if (goal === 'x8' && lastPos.x === 8) isWinner = true;
    if (goal === 'x0' && lastPos.x === 0) isWinner = true;
    
    if (isWinner) {
      clearInterval(state.turnTimerInterval);
      showWinner(state.activePlayers[lastPlayerIdx]);
      return;
    }
    
    // Cycle turn index
    state.currentPlayerIdx = (state.currentPlayerIdx + 1) % state.activePlayers.length;
    startTurn();
  };

  const handleTimeout = () => {
    const player = state.activePlayers[state.currentPlayerIdx];
    if (player.type === 'human') {
      // Human timeout -> auto move to first valid move
      const moves = getValidMoves(state.currentPlayerIdx);
      if (moves.length > 0) {
        saveHistory();
        movePawn(state.currentPlayerIdx, moves[0].x, moves[0].y);
      } else {
        // Can't move -> pass
        nextTurn();
      }
    } else {
      // AI timeout (should not happen normally since AI triggers synchronously before timer ends)
      nextTurn();
    }
  };

  // Save history state for undo
  const saveHistory = () => {
    state.history.push({
      playerPositions: JSON.parse(JSON.stringify(state.playerPositions)),
      placedWalls: [...state.placedWalls],
      playerWallsLeft: [...state.playerWallsLeft],
      currentPlayerIdx: state.currentPlayerIdx
    });
    btnUndo.disabled = false;
  };

  // Undo triggers
  btnUndo.addEventListener('click', () => {
    if (state.history.length > 0) {
      // Clear timers
      clearInterval(state.turnTimerInterval);
      clearTimeout(state.aiTimeout);
      
      const lastState = state.history.pop();
      state.playerPositions = lastState.playerPositions;
      state.placedWalls = lastState.placedWalls;
      state.playerWallsLeft = lastState.playerWallsLeft;
      state.currentPlayerIdx = lastState.currentPlayerIdx;
      
      renderPawns();
      renderWalls();
      renderHUD();
      
      startTurn();
    }
  });

  // --- Pawn Operations ---
  const movePawn = (playerIdx, tx, ty) => {
    state.playerPositions[playerIdx] = { x: tx, y: ty };
    renderPawns();
    nextTurn();
  };

  const handleTileClick = (tx, ty) => {
    const player = state.activePlayers[state.currentPlayerIdx];
    if (player.type !== 'human') return; // Not human's turn
    
    const validMoves = getValidMoves(state.currentPlayerIdx);
    const isValid = validMoves.some(m => m.x === tx && m.y === ty);
    
    if (isValid) {
      saveHistory();
      movePawn(state.currentPlayerIdx, tx, ty);
    }
  };

  // --- Wall Operations ---
  
  // Directions Toggle
  btnToggleWallDirection.addEventListener('click', () => {
    state.wallDirection = state.wallDirection === 'h' ? 'v' : 'h';
    wallDirectionText.textContent = state.wallDirection === 'h' ? '가로(H)' : '세로(V)';
    
    // Refresh preview if hovered
    if (state.hoveredIntersection) {
      showWallPreview(state.hoveredIntersection.wx, state.hoveredIntersection.wy);
    }
  });

  // Keyboard shortcut for toggle wall direction (Space)
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && state.gameStarted) {
      e.preventDefault();
      btnToggleWallDirection.click();
    }
  });

  const handleIntersectionMouseEnter = (wx, wy) => {
    const player = state.activePlayers[state.currentPlayerIdx];
    if (player.type !== 'human') return;
    
    // Check if player has walls left
    if (state.playerWallsLeft[state.currentPlayerIdx] <= 0) return;
    
    state.hoveredIntersection = { wx, wy };
    showWallPreview(wx, wy);
  };

  const handleIntersectionMouseLeave = () => {
    state.hoveredIntersection = null;
    clearWallPreview();
  };

  const handleIntersectionClick = (wx, wy) => {
    const player = state.activePlayers[state.currentPlayerIdx];
    if (player.type !== 'human') return;
    
    // Check remaining walls
    if (state.playerWallsLeft[state.currentPlayerIdx] <= 0) {
      alert('벽을 모두 사용하셨습니다!');
      return;
    }
    
    if (isValidWall(wx, wy, state.wallDirection)) {
      saveHistory();
      placeWall(state.currentPlayerIdx, wx, wy, state.wallDirection);
    } else {
      alert('이곳에는 벽을 설치할 수 없습니다. (경로가 차단되거나 오버랩됨)');
    }
  };

  const placeWall = (playerIdx, wx, wy, type) => {
    state.placedWalls.push({ x: wx, y: wy, type: type, playerIdx: playerIdx });
    state.playerWallsLeft[playerIdx]--;
    
    clearWallPreview();
    renderWalls();
    renderHUD();
    
    nextTurn();
  };

  // Wall previews
  const showWallPreview = (wx, wy) => {
    clearWallPreview();
    
    const previewDiv = document.createElement('div');
    const isValid = isValidWall(wx, wy, state.wallDirection);
    
    previewDiv.id = 'temp-wall-preview';
    previewDiv.className = `wall-3d preview player-wall-${state.currentPlayerIdx} ${isValid ? '' : 'invalid-preview'}`;
    
    // 3D positioning
    const left = GRID_PADDING + wx * (TILE_SIZE + GAP_SIZE) + TILE_SIZE;
    const top = GRID_PADDING + wy * (TILE_SIZE + GAP_SIZE) + TILE_SIZE;
    
    if (state.wallDirection === 'h') {
      const width = TILE_SIZE * 2 + GAP_SIZE;
      const height = GAP_SIZE;
      
      // Shift left by tile width to span center
      previewDiv.style.left = `${left - TILE_SIZE}px`;
      previewDiv.style.top = `${top}px`;
      previewDiv.style.width = `${width}px`;
      previewDiv.style.height = `${height}px`;
      
      // Build 3D faces
      buildWallFaces(previewDiv, width, height);
    } else {
      const width = GAP_SIZE;
      const height = TILE_SIZE * 2 + GAP_SIZE;
      
      // Shift top by tile height
      previewDiv.style.left = `${left}px`;
      previewDiv.style.top = `${top - TILE_SIZE}px`;
      previewDiv.style.width = `${width}px`;
      previewDiv.style.height = `${height}px`;
      
      buildWallFaces(previewDiv, width, height);
    }
    
    placedWallsElement.appendChild(previewDiv);
  };

  const clearWallPreview = () => {
    const el = document.getElementById('temp-wall-preview');
    if (el) el.remove();
  };

  const buildWallFaces = (container, w, h) => {
    container.innerHTML = `
      <div class="wall-face wall-top" style="width: ${w}px; height: ${h}px;"></div>
      <div class="wall-face wall-front" style="width: ${w}px;"></div>
      <div class="wall-face wall-back" style="width: ${w}px;"></div>
      <div class="wall-face wall-left" style="height: ${h}px;"></div>
      <div class="wall-face wall-right" style="height: ${h}px;"></div>
    `;
  };

  // --- Rendering UI Objects ---
  
  // Render Pawns
  const renderPawns = () => {
    pawnsElement.innerHTML = '';
    
    state.activePlayers.forEach((player, idx) => {
      const pos = state.playerPositions[idx];
      
      const pawnDiv = document.createElement('div');
      pawnDiv.className = 'pawn-3d';
      pawnDiv.style.color = player.color;
      
      // Calculate coordinates inside board (centered on tile)
      const left = GRID_PADDING + pos.x * (TILE_SIZE + GAP_SIZE) + TILE_SIZE / 2;
      const top = GRID_PADDING + pos.y * (TILE_SIZE + GAP_SIZE) + TILE_SIZE / 2;
      
      pawnDiv.style.left = `${left}px`;
      pawnDiv.style.top = `${top}px`;
      
      // Determine rotation angle based on player index to face opponent
      // P1 (id 0) starts at bottom (y=8) facing up -> -90deg
      // P2 (id 1) starts at top (y=0) facing down -> 90deg
      // P3 (id 2) starts at left (x=0) facing right -> 0deg
      // P4 (id 3) starts at right (x=8) facing left -> 180deg
      let angle = 0;
      if (player.id === 0) angle = -90;
      else if (player.id === 1) angle = 90;
      else if (player.id === 2) angle = 0;
      else if (player.id === 3) angle = 180;
      
      pawnDiv.style.transform = `rotateZ(${angle}deg)`;
      
      // Build 3D Spy pawn using closely stacked slices (voxel/extrusion style)
      // Even IDs (0: White, 2: Yellow) are Dynamite Spies
      // Odd IDs (1: Black, 3: Blue) are Bomb Spies
      const isBlackSpy = (player.id % 2 === 1);
      
      let html = `<div class="pawn-ring"></div>`;
      
      // Height slices from Z=0 to Z=48, step 1.5px
      for (let z = 0; z <= 48; z += 1.5) {
        const brightnessRatio = 0.7 + (z / 48) * 0.45;
        
        // 1. Legs (Z: 0 to 4)
        if (z <= 4) {
          html += `
            <div class="pawn-slice" style="transform: translate3d(0, 0, ${z}px); width: 20px; height: 10px; margin-left: -10px; margin-top: -5px; background: transparent; border: none; filter: brightness(${brightnessRatio});">
              <div style="position: absolute; width: 6px; height: 6px; border-radius: 50%; left: 50%; top: 50%; margin-left: -7px; margin-top: -3px; background: ${player.color}; border: 0.5px solid rgba(255,255,255,0.15);"></div>
              <div style="position: absolute; width: 6px; height: 6px; border-radius: 50%; left: 50%; top: 50%; margin-left: 1px; margin-top: -3px; background: ${player.color}; border: 0.5px solid rgba(255,255,255,0.15);"></div>
            </div>
          `;
        }
        // 2. Coat/Body (Z: 4.5 to 22)
        else if (z <= 22) {
          const ratio = (z - 4.5) / (22 - 4.5);
          const d = 24 - 12 * ratio;
          const r = d / 2;
          
          // Handheld items (dynamite or bomb)
          let itemHtml = '';
          if (!isBlackSpy) {
            // Dynamite (red cylinder Z: 10 to 22)
            if (z >= 10 && z <= 22) {
              const sparkHtml = (z >= 20.5) ? `<div style="position: absolute; width: 2px; height: 2px; background: #ff9800; border-radius: 50%; left: 50%; top: 50%; margin-left: 1px; margin-top: -1px;"></div>` : '';
              itemHtml = `<div style="position: absolute; width: 4px; height: 4px; border-radius: 1px; background: #ef4444; left: 50%; top: 50%; margin-left: 7px; margin-top: 5px; border: 0.5px solid rgba(255,255,255,0.2);">${sparkHtml}</div>`;
            }
          } else {
            // Bomb (red sphere Z: 10 to 18)
            if (z >= 10 && z <= 18) {
              const zBomb = z - 10;
              const d_bomb = 8 * Math.sin(Math.PI * (zBomb / 8)) + 3;
              const r_bomb = d_bomb / 2;
              const sparkHtml = (z >= 17.5) ? `<div style="position: absolute; width: 1.5px; height: 1.5px; background: #ffeb3b; border-radius: 50%; left: 50%; top: 50%; margin-left: -1px; margin-top: -2px;"></div>` : '';
              itemHtml = `<div style="position: absolute; width: ${d_bomb}px; height: ${d_bomb}px; border-radius: 50%; background: #ef4444; left: 50%; top: 50%; margin-left: ${8 - r_bomb}px; margin-top: ${6 - r_bomb}px; border: 0.5px solid rgba(255,255,255,0.2);">${sparkHtml}</div>`;
            }
          }
          
          html += `
            <div class="pawn-slice" style="transform: translate3d(0, 0, ${z}px); width: ${d}px; height: ${d}px; margin-left: ${-r}px; margin-top: ${-r}px; border-radius: 50%; background: ${player.color}; filter: brightness(${brightnessRatio}); border: 0.5px solid rgba(255,255,255,0.15);">
              ${itemHtml}
            </div>
          `;
        }
        // 3. Head & Beak & Eyes (Z: 22.5 to 34)
        else if (z <= 34) {
          const zHead = z - 22.5;
          const d_head = 9 + 5 * Math.sin(Math.PI * (zHead / (34 - 22.5)));
          const r_head = d_head / 2;
          
          // Beak (Z: 24 to 31)
          let beakHtml = '';
          if (z >= 24 && z <= 31) {
            const beakRatio = (z - 24) / (31 - 24);
            const len_beak = 14 * Math.sin(Math.PI * beakRatio);
            const w_beak = 6 * Math.sin(Math.PI * beakRatio);
            beakHtml = `<div style="position: absolute; left: 50%; top: 50%; width: ${len_beak}px; height: ${w_beak}px; margin-left: ${r_head - 1.5}px; margin-top: ${-w_beak/2}px; border-radius: 0 50% 50% 0; background: ${player.color}; border: 0.5px solid rgba(255,255,255,0.15); transform-origin: left center;"></div>`;
          }
          
          // Sunglasses (Z: 26 to 29.5)
          let eyeHtml = '';
          if (z >= 26 && z <= 29.5) {
            const eyeX = r_head * 0.7;
            const eyeY = r_head * 0.45;
            const eyeD = 3.5;
            eyeHtml = `
              <div style="position: absolute; width: ${eyeD}px; height: ${eyeD}px; border-radius: 50%; background: #111111; left: 50%; top: 50%; margin-left: ${eyeX - eyeD/2}px; margin-top: ${-eyeY - eyeD/2}px; border: 0.3px solid rgba(255,255,255,0.2);"></div>
              <div style="position: absolute; width: ${eyeD}px; height: ${eyeD}px; border-radius: 50%; background: #111111; left: 50%; top: 50%; margin-left: ${eyeX - eyeD/2}px; margin-top: ${eyeY - eyeD/2}px; border: 0.3px solid rgba(255,255,255,0.2);"></div>
            `;
          }
          
          html += `
            <div class="pawn-slice" style="transform: translate3d(0, 0, ${z}px); width: ${d_head}px; height: ${d_head}px; margin-left: ${-r_head}px; margin-top: ${-r_head}px; border-radius: 50%; background: ${player.color}; filter: brightness(${brightnessRatio}); border: 0.5px solid rgba(255,255,255,0.15);">
              ${beakHtml}
              ${eyeHtml}
            </div>
          `;
        }
        // 4. Hat Brim (Z: 34.5 to 36)
        else if (z <= 36) {
          const d_brim = 32;
          const r_brim = d_brim / 2;
          html += `
            <div class="pawn-slice" style="transform: translate3d(0, 0, ${z}px); width: ${d_brim}px; height: ${d_brim}px; margin-left: ${-r_brim}px; margin-top: ${-r_brim}px; border-radius: 50%; background: ${player.color}; filter: brightness(${brightnessRatio}); border: 0.5px solid rgba(255,255,255,0.25);"></div>
          `;
        }
        // 5. Hat Crown (Z: 36.5 to 48)
        else {
          const zHat = z - 36.5;
          const d_hat = 15 - 13.5 * (zHat / (48 - 36.5));
          const r_hat = d_hat / 2;
          const offsetX = -3 * (zHat / (48 - 36.5)); // Tilt backward
          
          html += `
            <div class="pawn-slice" style="transform: translate3d(${offsetX}px, 0, ${z}px); width: ${d_hat}px; height: ${d_hat}px; margin-left: ${-r_hat}px; margin-top: ${-r_hat}px; border-radius: 50%; background: ${player.color}; filter: brightness(${brightnessRatio}); border: 0.5px solid rgba(255,255,255,0.15);"></div>
          `;
        }
      }
      
      pawnDiv.innerHTML = html;
      pawnsElement.appendChild(pawnDiv);
    });
  };

  // Render placed walls
  const renderWalls = () => {
    placedWallsElement.innerHTML = '';
    
    state.placedWalls.forEach(wall => {
      const wallDiv = document.createElement('div');
      wallDiv.className = `wall-3d player-wall-${wall.playerIdx}`;
      
      const left = GRID_PADDING + wall.x * (TILE_SIZE + GAP_SIZE) + TILE_SIZE;
      const top = GRID_PADDING + wall.y * (TILE_SIZE + GAP_SIZE) + TILE_SIZE;
      
      if (wall.type === 'h') {
        const width = TILE_SIZE * 2 + GAP_SIZE;
        const height = GAP_SIZE;
        
        wallDiv.style.left = `${left - TILE_SIZE}px`;
        wallDiv.style.top = `${top}px`;
        wallDiv.style.width = `${width}px`;
        wallDiv.style.height = `${height}px`;
        
        buildWallFaces(wallDiv, width, height);
      } else {
        const width = GAP_SIZE;
        const height = TILE_SIZE * 2 + GAP_SIZE;
        
        wallDiv.style.left = `${left}px`;
        wallDiv.style.top = `${top - TILE_SIZE}px`;
        wallDiv.style.width = `${width}px`;
        wallDiv.style.height = `${height}px`;
        
        buildWallFaces(wallDiv, width, height);
      }
      
      placedWallsElement.appendChild(wallDiv);
    });
  };

  // Highlights valid tiles
  const highlightValidMoves = () => {
    const validMoves = getValidMoves(state.currentPlayerIdx);
    
    validMoves.forEach(m => {
      const tile = boardGridElement.querySelector(`.tile[data-x="${m.x}"][data-y="${m.y}"]`);
      if (tile) tile.classList.add('valid-move');
    });
  };

  const clearValidMovesHighlight = () => {
    boardGridElement.querySelectorAll('.tile.valid-move').forEach(t => {
      t.classList.remove('valid-move');
    });
  };

  // Render Sidebar and HUD info panels
  const renderHUD = () => {
    // 1. Players list items
    hudPlayersList.innerHTML = '';
    state.activePlayers.forEach((player, idx) => {
      const pos = state.playerPositions[idx];
      const wallsLeft = state.playerWallsLeft[idx];
      
      const item = document.createElement('div');
      item.className = `hud-player-item ${idx === state.currentPlayerIdx ? 'active' : ''}`;
      
      item.innerHTML = `
        <div class="hud-player-meta">
          <span class="hud-player-color" style="color: ${player.color}; background: ${player.color};"></span>
          <span class="hud-player-name ${player.colorClass}">${player.name}</span>
          <span class="hud-player-type">${player.type === 'human' ? 'HUMAN' : 'SMART AI'}</span>
        </div>
        <div class="hud-player-walls ${wallsLeft === 0 ? 'empty' : ''}">
          <i class="fa-solid fa-border-all"></i> x<strong>${wallsLeft}</strong>
        </div>
      `;
      
      hudPlayersList.appendChild(item);
    });

    // 2. Unplaced walls bottom rack indicator
    hudWallsRackElement.innerHTML = '';
    state.activePlayers.forEach((player, idx) => {
      const def = PLAYER_DEFS[idx];
      const wallsLeft = state.playerWallsLeft[idx];
      const totalWalls = state.maxPlayers === 2 ? 10 : 5;
      
      const rackGroup = document.createElement('div');
      rackGroup.className = 'rack-player-group';
      
      let blocksHTML = '';
      for (let w = 0; w < totalWalls; w++) {
        const isUsed = w >= wallsLeft;
        blocksHTML += `<span class="rack-block-item ${isUsed ? 'used' : ''}"></span>`;
      }
      
      rackGroup.innerHTML = `
        <div class="rack-player-label" style="color: ${player.color};">
          <i class="fa-solid fa-user"></i> P${idx + 1}
        </div>
        <div class="rack-blocks">${blocksHTML}</div>
      `;
      
      hudWallsRackElement.appendChild(rackGroup);
    });
  };

  // --- Smart AI Engine Algorithms ---
  
  // Controls AI automatic play speed from inputs
  rangeAiSpeed.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    aiSpeedVal.textContent = val.toFixed(1);
    state.aiDelayMs = val * 1000;
  });

  const playAILogic = () => {
    if (!state.gameStarted) return;
    
    const aiIdx = state.currentPlayerIdx;
    const aiPlayer = state.activePlayers[aiIdx];
    
    // Evaluate if we should place a wall or move:
    // 1. Identify if any opponent is very close to winning (e.g. shortest path length <= 3)
    let criticalOpponent = null;
    let minOpponentDist = 999;
    
    state.activePlayers.forEach((opp, idx) => {
      if (idx === aiIdx) return;
      const dist = getShortestPathLength(idx);
      if (dist < minOpponentDist) {
        minOpponentDist = dist;
        if (dist <= 3) {
          criticalOpponent = idx;
        }
      }
    });
    
    // 2. If critical opponent identified AND AI has walls left, search for a wall that increases their path length
    let wallPlaced = false;
    
    if (criticalOpponent !== null && state.playerWallsLeft[aiIdx] > 0) {
      let bestWall = null;
      let maxDistIncrease = 0;
      const currentOpponentDist = minOpponentDist;
      
      // Scan all possible wall intersections and orientations to block the opponent
      for (let wy = 0; wy < GRID_SIZE - 1; wy++) {
        for (let wx = 0; wx < GRID_SIZE - 1; wx++) {
          ['h', 'v'].forEach(type => {
            if (isValidWall(wx, wy, type, true)) {
              // Simulate wall placement
              state.placedWalls.push({ x: wx, y: wy, type: type, playerIdx: aiIdx });
              
              const newOpponentDist = getShortestPathLength(criticalOpponent);
              const increase = newOpponentDist - currentOpponentDist;
              
              if (increase > maxDistIncrease) {
                maxDistIncrease = increase;
                bestWall = { x: wx, y: wy, type: type };
              }
              
              // Undo simulation
              state.placedWalls.pop();
            }
          });
        }
      }
      
      // If we found a wall that successfully blocks/stalls the opponent, place it!
      if (bestWall && maxDistIncrease > 0) {
        saveHistory();
        placeWall(aiIdx, bestWall.x, bestWall.y, bestWall.type);
        wallPlaced = true;
      }
    }
    
    if (wallPlaced) return;

    // 3. Regular Strategy: 25% chance of placing an obstructive wall (if walls left), otherwise move
    let wantsToPlaceWall = Math.random() < 0.25 && state.playerWallsLeft[aiIdx] > 0;
    
    if (wantsToPlaceWall) {
      // Find a random opponent
      const opponents = state.activePlayers.map((p, idx) => idx).filter(idx => idx !== aiIdx);
      const targetOpponent = opponents[Math.floor(Math.random() * opponents.length)];
      const currentDist = getShortestPathLength(targetOpponent);
      
      let validBlockingWalls = [];
      
      // Try to find a few valid walls that increase target opponent's path length
      for (let wy = 0; wy < GRID_SIZE - 1; wy++) {
        for (let wx = 0; wx < GRID_SIZE - 1; wx++) {
          ['h', 'v'].forEach(type => {
            if (isValidWall(wx, wy, type, true)) {
              state.placedWalls.push({ x: wx, y: wy, type: type, playerIdx: aiIdx });
              const newDist = getShortestPathLength(targetOpponent);
              state.placedWalls.pop();
              
              if (newDist > currentDist && newDist < 900) {
                validBlockingWalls.push({ x: wx, y: wy, type: type, score: newDist - currentDist });
              }
            }
          });
        }
      }
      
      if (validBlockingWalls.length > 0) {
        // Choose the one that increases the path the most
        validBlockingWalls.sort((a, b) => b.score - a.score);
        const selected = validBlockingWalls[0];
        
        saveHistory();
        placeWall(aiIdx, selected.x, selected.y, selected.type);
        wallPlaced = true;
      }
    }
    
    if (wallPlaced) return;

    // 4. Default Action: Move pawn along the shortest path
    const validMoves = getValidMoves(aiIdx);
    if (validMoves.length > 0) {
      let bestMove = null;
      let minPathLen = 999;
      
      // Shuffle moves to add some randomness for equal paths
      const shuffledMoves = validMoves.sort(() => Math.random() - 0.5);
      
      shuffledMoves.forEach(m => {
        // Calculate shortest path length from the hypothetical next position
        const pathLen = getShortestPathLength(aiIdx, m.x, m.y);
        if (pathLen < minPathLen) {
          minPathLen = pathLen;
          bestMove = m;
        }
      });
      
      if (bestMove) {
        saveHistory();
        movePawn(aiIdx, bestMove.x, bestMove.y);
      } else {
        // Fallback: move randomly
        saveHistory();
        const randMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        movePawn(aiIdx, randMove.x, randMove.y);
      }
    } else {
      // No moves (should not happen in Quoridor unless completely blocked, which BFS prevents)
      nextTurn();
    }
  };

  // --- Display Modals ---
  const showWinner = (player) => {
    clearInterval(state.turnTimerInterval);
    
    winnerTitleName.textContent = `${player.name} 승리!`;
    winnerTitleName.className = player.colorClass;
    
    winnerModal.style.display = 'flex';
  };

  // --- Initialize App ---
  const init = () => {
    updateLobbySlots();
    initCameraControls();
    applyCameraRotation();
  };

  btnStartGame.addEventListener('click', startGame);
  init();
});
