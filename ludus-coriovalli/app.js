document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const lobbyPanel = document.getElementById('lobby-panel');
  const gamePanel = document.getElementById('game-panel');
  const btnStartGame = document.getElementById('btn-start-game');
  const selectGameMode = document.getElementById('select-game-mode');
  const aiDifficultyWrapper = document.getElementById('ai-difficulty-wrapper');
  
  const turnTitleText = document.getElementById('turn-title-text');
  const turnIndicatorDot = document.getElementById('turn-indicator-dot');
  const turnTimer = document.getElementById('turn-timer');
  const moveCountBanner = document.getElementById('move-count-banner');
  const hudPlayersList = document.getElementById('hud-players-list');
  
  const btnResetCamera = document.getElementById('btn-reset-camera');
  const btnUndo = document.getElementById('btn-undo');
  const btnQuit = document.getElementById('btn-quit');
  const aiSpeedWrapper = document.getElementById('ai-speed-wrapper');
  const rangeAiSpeed = document.getElementById('range-ai-speed');
  const aiSpeedVal = document.getElementById('ai-speed-val');
  
  const scene3dCanvas = document.getElementById('scene-3d-canvas');
  const boardWrapperElement = document.getElementById('board-wrapper-element');
  const boardElement = document.getElementById('board-element');
  const boardSvgElement = document.getElementById('board-svg-element');
  const boardNodesElement = document.getElementById('board-nodes-element');
  const piecesElement = document.getElementById('pieces-element');
  
  const rulesModal = document.getElementById('rules-modal');
  const btnRules = document.getElementById('btn-rules');
  const btnCloseRules = document.getElementById('btn-close-rules');
  
  const winnerModal = document.getElementById('winner-modal');
  const winnerTitleName = document.getElementById('winner-title-name');
  const winnerDescText = document.getElementById('winner-desc-text');
  const btnLobbyReturn = document.getElementById('btn-lobby-return');
  const btnRestartGame = document.getElementById('btn-restart-game');
  
  const themeToggle = document.getElementById('theme-toggle');

  // --- Graph Structure (11 Nodes Haretavl Graph) ---
  const NODES = [
    { id: 0, x: 50,  y: 150, label: 'L_TIP' },
    { id: 1, x: 150, y: 50,  label: 'TL_CORNER' },
    { id: 2, x: 150, y: 150, label: 'M_LEFT' },
    { id: 3, x: 150, y: 250, label: 'BL_CORNER' },
    { id: 4, x: 250, y: 50,  label: 'T_MID' },
    { id: 5, x: 250, y: 150, label: 'CENTER' },
    { id: 6, x: 250, y: 250, label: 'B_MID' },
    { id: 7, x: 350, y: 50,  label: 'TR_CORNER' },
    { id: 8, x: 350, y: 150, label: 'M_RIGHT' },
    { id: 9, x: 350, y: 250, label: 'BR_CORNER' },
    { id: 10, x: 450, y: 150, label: 'R_TIP' }
  ];

  const EDGES = [
    [0, 1], [0, 2], [0, 3],
    [1, 2], [1, 4], [1, 5],
    [2, 3], [2, 5],
    [3, 6], [3, 5],
    [4, 7], [4, 5],
    [5, 6], [5, 7], [5, 8], [5, 9],
    [6, 9],
    [7, 8], [7, 10],
    [8, 9], [8, 10],
    [9, 10]
  ];

  // Adjacency List construction
  const ADJ = Array.from({ length: 11 }, () => []);
  EDGES.forEach(([u, v]) => {
    ADJ[u].push(v);
    ADJ[v].push(u);
  });

  // --- Game State Variables ---
  let state = {
    userFaction: 'hounds', // 'hounds' or 'hares'
    gameMode: 'human-ai', // 'human-ai', 'human-human', 'ai-ai'
    difficulty: 'hard', // 'easy', 'hard'
    gameStarted: false,
    
    // Piece Positions mapping
    // Indices: [hound0, hound1, hound2, hound3, hare0, hare1]
    positions: [0, 1, 2, 3, 7, 9],
    
    currentTurn: 'hounds', // 'hounds' or 'hares'
    moveCount: 0, // full turn count (increments after both players move once)
    maxTurns: 50, // Hares win if they survive 50 full turns
    
    selectedPieceIdx: null, // index in state.positions (0-3: hounds, 4-5: hares)
    validMovesForSelected: [],
    
    // Camera rotation
    rotateX: 52,
    rotateZ: -28,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    dragAngles: { x: 0, z: 0 },
    
    // Timers
    turnTimerInterval: null,
    turnSecondsLeft: 20,
    aiTimeout: null,
    aiDelayMs: 1200,
    
    // History for Undo
    history: []
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

  // --- 3D Camera Controls ---
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

      state.rotateZ = state.dragAngles.z + dx * 0.5;
      state.rotateX = Math.max(15, Math.min(85, state.dragAngles.x - dy * 0.5));
      
      applyCameraRotation();
    };

    const onDragEnd = () => {
      state.isDragging = false;
    };

    scene3dCanvas.addEventListener('mousedown', (e) => {
      if (e.target.closest('.board-node') || e.target.closest('.pebble-3d') || e.target.closest('button')) return;
      onDragStart(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', (e) => onDragMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onDragEnd);

    scene3dCanvas.addEventListener('touchstart', (e) => {
      if (e.target.closest('.board-node') || e.target.closest('.pebble-3d') || e.target.closest('button')) return;
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

  // --- Lobby Setup Toggles ---
  document.querySelectorAll('.btn-faction-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-faction-toggle').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.userFaction = btn.getAttribute('data-faction');
    });
  });

  selectGameMode.addEventListener('change', (e) => {
    state.gameMode = e.target.value;
    if (state.gameMode === 'human-human') {
      aiDifficultyWrapper.style.display = 'none';
      aiSpeedWrapper.style.display = 'none';
    } else if (state.gameMode === 'ai-ai') {
      aiDifficultyWrapper.style.display = 'block';
      aiSpeedWrapper.style.display = 'block';
    } else {
      aiDifficultyWrapper.style.display = 'block';
      aiSpeedWrapper.style.display = 'none';
    }
  });

  document.querySelectorAll('.btn-diff').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-diff').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.difficulty = btn.getAttribute('data-diff');
    });
  });

  btnRules.addEventListener('click', () => rulesModal.style.display = 'flex');
  btnCloseRules.addEventListener('click', () => rulesModal.style.display = 'none');

  btnQuit.addEventListener('click', () => {
    if (confirm('진행 중인 대국을 기권하고 대기실로 돌아가시겠습니까?')) {
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

  // --- Initialize 3D Slab Elements ---
  const generateBoardDOM = () => {
    // 1. Draw SVG Grooves
    boardSvgElement.innerHTML = '';
    EDGES.forEach(([u, v]) => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', NODES[u].x);
      line.setAttribute('y1', NODES[u].y);
      line.setAttribute('x2', NODES[v].x);
      line.setAttribute('y2', NODES[v].y);
      boardSvgElement.appendChild(line);
    });

    // 2. Draw Carved Nodes
    boardNodesElement.innerHTML = '';
    NODES.forEach((node, idx) => {
      const nodeDiv = document.createElement('div');
      nodeDiv.className = 'board-node';
      nodeDiv.style.left = `${node.x}px`;
      nodeDiv.style.top = `${node.y}px`;
      nodeDiv.setAttribute('data-id', idx);
      
      nodeDiv.addEventListener('click', () => handleNodeClick(idx));
      boardNodesElement.appendChild(nodeDiv);
    });
  };

  // --- Game Flow Rules Logic ---
  
  // Get legal moves for a piece at index nodeIdx, with current placements array
  const getLegalMoves = (nodeIdx, currentPos, isHound) => {
    const moves = [];
    const adj = ADJ[nodeIdx];
    
    adj.forEach(target => {
      // Check if target node is occupied
      if (currentPos.includes(target)) return;
      
      // Hounds can only move forward (rightward) or vertically/diagonally right
      if (isHound) {
        if (NODES[target].x < NODES[nodeIdx].x) return; // Cannot move backward
      }
      
      moves.push(target);
    });
    
    return moves;
  };

  // Check escape condition: Hare past all Hounds
  const hasHareEscaped = (pos) => {
    const houndsX = [NODES[pos[0]].x, NODES[pos[1]].x, NODES[pos[2]].x, NODES[pos[3]].x];
    const minHoundX = Math.min(...houndsX);
    
    const hare0X = NODES[pos[4]].x;
    const hare1X = NODES[pos[5]].x;
    
    // A hare wins if it escapes past all hounds
    return (hare0X < minHoundX || hare1X < minHoundX);
  };

  // Check if a player has any valid moves
  const hasValidMoves = (faction, pos) => {
    if (faction === 'hounds') {
      for (let i = 0; i < 4; i++) {
        if (getLegalMoves(pos[i], pos, true).length > 0) return true;
      }
    } else {
      for (let i = 4; i < 6; i++) {
        if (getLegalMoves(pos[i], pos, false).length > 0) return true;
      }
    }
    return false;
  };

  const startGame = () => {
    state.gameStarted = true;
    state.positions = [0, 1, 2, 3, 7, 9]; // initial starting points
    state.currentTurn = 'hounds';
    state.moveCount = 0;
    state.selectedPieceIdx = null;
    state.validMovesForSelected = [];
    state.history = [];
    
    lobbyPanel.style.display = 'none';
    gamePanel.style.display = 'grid';
    
    generateBoardDOM();
    renderPieces();
    renderHUD();
    
    startTurn();
  };

  const startTurn = () => {
    // 1. Check Win conditions before turn starts
    const houndsWon = !hasValidMoves('hares', state.positions);
    const haresWon = hasHareEscaped(state.positions) || state.moveCount >= state.maxTurns;
    
    if (houndsWon) {
      endGame('hounds');
      return;
    }
    if (haresWon) {
      endGame('hares');
      return;
    }
    
    // 2. Set Indicator HUD
    const turnName = state.currentTurn === 'hounds' ? '사냥개(Hounds)' : '토끼(Hares)';
    turnTitleText.textContent = `${turnName} 턴`;
    
    if (state.currentTurn === 'hounds') {
      turnIndicatorDot.style.color = '#ffffff';
      turnIndicatorDot.style.boxShadow = '0 0 12px #ffffff';
      turnTitleText.className = 'color-hounds';
    } else {
      turnIndicatorDot.style.color = '#b1b1b7';
      turnIndicatorDot.style.boxShadow = '0 0 12px #b1b1b7';
      turnTitleText.className = 'color-hares';
    }
    
    // Reset timer
    state.turnSecondsLeft = 20;
    turnTimer.textContent = `남은 시간: ${state.turnSecondsLeft}초`;
    
    clearInterval(state.turnTimerInterval);
    state.turnTimerInterval = setInterval(() => {
      state.turnSecondsLeft--;
      if (state.turnSecondsLeft < 0) {
        clearInterval(state.turnTimerInterval);
        handleTimeout();
      } else {
        turnTimer.textContent = `남은 시간: ${state.turnSecondsLeft}초`;
      }
    }, 1000);
    
    btnUndo.disabled = state.history.length === 0;
    
    // 3. Clear previews
    clearValidTargetHighlights();
    state.selectedPieceIdx = null;
    state.validMovesForSelected = [];
    
    // Render Selection styles
    renderSelectionStyle();
    
    // 4. Trigger AI if appropriate
    const isHumanTurn = (state.gameMode === 'human-human') ||
      (state.gameMode === 'human-ai' && state.currentTurn === state.userFaction);
      
    if (!isHumanTurn) {
      clearTimeout(state.aiTimeout);
      state.aiTimeout = setTimeout(playAILogic, state.aiDelayMs);
    }
  };

  const nextTurn = () => {
    // Swap turn
    if (state.currentTurn === 'hounds') {
      state.currentTurn = 'hares';
    } else {
      state.currentTurn = 'hounds';
      state.moveCount++; // Full turn completes after Hares move
      moveCountBanner.textContent = `진행 턴수: ${state.moveCount} / ${state.maxTurns}`;
    }
    
    renderHUD();
    startTurn();
  };

  const handleTimeout = () => {
    // Timeout -> Select first valid random move
    const validMovesList = [];
    const isHound = state.currentTurn === 'hounds';
    const startIdx = isHound ? 0 : 4;
    const endIdx = isHound ? 4 : 6;
    
    for (let i = startIdx; i < endIdx; i++) {
      const m = getLegalMoves(state.positions[i], state.positions, isHound);
      m.forEach(target => {
        validMovesList.push({ pieceIdx: i, targetNode: target });
      });
    }
    
    if (validMovesList.length > 0) {
      const choice = validMovesList[Math.floor(Math.random() * validMovesList.length)];
      saveHistory();
      makeMove(choice.pieceIdx, choice.targetNode);
    } else {
      nextTurn(); // Pass
    }
  };

  const makeMove = (pieceIdx, targetNode) => {
    state.positions[pieceIdx] = targetNode;
    renderPieces();
    nextTurn();
  };

  const saveHistory = () => {
    state.history.push({
      positions: [...state.positions],
      currentTurn: state.currentTurn,
      moveCount: state.moveCount
    });
    btnUndo.disabled = false;
  };

  btnUndo.addEventListener('click', () => {
    if (state.history.length > 0) {
      clearInterval(state.turnTimerInterval);
      clearTimeout(state.aiTimeout);
      
      const last = state.history.pop();
      state.positions = last.positions;
      state.currentTurn = last.currentTurn;
      state.moveCount = last.moveCount;
      
      moveCountBanner.textContent = `진행 턴수: ${state.moveCount} / ${state.maxTurns}`;
      
      renderPieces();
      renderHUD();
      startTurn();
    }
  });

  // --- Click Handler Interactivity ---
  const handlePieceClick = (pieceIdx) => {
    if (!state.gameStarted) return;
    
    // 1. Verify it is human's turn
    const isHumanTurn = (state.gameMode === 'human-human') ||
      (state.gameMode === 'human-ai' && state.currentTurn === state.userFaction);
    if (!isHumanTurn) return;
    
    // 2. Check if the clicked piece belongs to current turn faction
    const isHound = state.currentTurn === 'hounds';
    if (isHound && pieceIdx >= 4) return; // Cannot select Hare on Hounds' turn
    if (!isHound && pieceIdx < 4) return;  // Cannot select Hound on Hares' turn
    
    // 3. Select the piece
    state.selectedPieceIdx = pieceIdx;
    state.validMovesForSelected = getLegalMoves(state.positions[pieceIdx], state.positions, isHound);
    
    // Render updates
    renderSelectionStyle();
    highlightValidTargets();
  };

  const handleNodeClick = (nodeIdx) => {
    if (state.selectedPieceIdx === null) return;
    if (state.validMovesForSelected.includes(nodeIdx)) {
      saveHistory();
      makeMove(state.selectedPieceIdx, nodeIdx);
    }
  };

  const highlightValidTargets = () => {
    clearValidTargetHighlights();
    state.validMovesForSelected.forEach(nodeIdx => {
      const nodeDiv = boardNodesElement.querySelector(`.board-node[data-id="${nodeIdx}"]`);
      if (nodeDiv) nodeDiv.classList.add('valid-target');
    });
  };

  const clearValidTargetHighlights = () => {
    boardNodesElement.querySelectorAll('.board-node.valid-target').forEach(n => {
      n.classList.remove('valid-target');
    });
  };

  const renderSelectionStyle = () => {
    piecesElement.querySelectorAll('.pebble-3d').forEach((peb, idx) => {
      if (idx === state.selectedPieceIdx) {
        peb.classList.add('selected');
      } else {
        peb.classList.remove('selected');
      }
    });
  };

  // --- Render Pebble Pieces using Stacked slices ---
  const renderPieces = () => {
    piecesElement.innerHTML = '';
    
    state.positions.forEach((nodeIdx, idx) => {
      const node = NODES[nodeIdx];
      const isHound = idx < 4;
      
      const pebbleDiv = document.createElement('div');
      pebbleDiv.className = `pebble-3d ${isHound ? 'faction-hound-piece' : 'faction-hare-piece'}`;
      pebbleDiv.style.left = `${node.x}px`;
      pebbleDiv.style.top = `${node.y}px`;
      
      // Determine orientation and color
      // Hounds: White Spies (1P), face right (0deg)
      // Hares: Black Spies (2P), face left (180deg)
      const angle = isHound ? 0 : 180;
      const playerColor = isHound ? '#ffffff' : '#18181b';
      const isBlackSpy = !isHound;
      
      // Build 3D Spy pawn using closely stacked slices (voxel/extrusion style)
      let html = `<div class="pebble-ring"></div>`;
      
      html += `<div class="spy-container" style="transform: rotateZ(${angle}deg); transform-style: preserve-3d; width: 100%; height: 100%; position: absolute; left: 0; top: 0;">`;
      
      // Height slices from Z=0 to Z=48, step 1.5px
      for (let z = 0; z <= 48; z += 1.5) {
        const brightnessRatio = 0.7 + (z / 48) * 0.45;
        
        // 1. Legs (Z: 0 to 4)
        if (z <= 4) {
          html += `
            <div class="pebble-slice" style="transform: translate3d(0, 0, ${z}px); width: 20px; height: 10px; margin-left: -10px; margin-top: -5px; background: transparent; border: none; filter: brightness(${brightnessRatio});">
              <div style="position: absolute; width: 6px; height: 6px; border-radius: 50%; left: 50%; top: 50%; margin-left: -7px; margin-top: -3px; background: ${playerColor}; border: 0.5px solid rgba(255,255,255,0.15);"></div>
              <div style="position: absolute; width: 6px; height: 6px; border-radius: 50%; left: 50%; top: 50%; margin-left: 1px; margin-top: -3px; background: ${playerColor}; border: 0.5px solid rgba(255,255,255,0.15);"></div>
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
            <div class="pebble-slice" style="transform: translate3d(0, 0, ${z}px); width: ${d}px; height: ${d}px; margin-left: ${-r}px; margin-top: ${-r}px; border-radius: 50%; background: ${playerColor}; filter: brightness(${brightnessRatio}); border: 0.5px solid rgba(255,255,255,0.15);">
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
            beakHtml = `<div style="position: absolute; left: 50%; top: 50%; width: ${len_beak}px; height: ${w_beak}px; margin-left: ${r_head - 1.5}px; margin-top: ${-w_beak/2}px; border-radius: 0 50% 50% 0; background: ${playerColor}; border: 0.5px solid rgba(255,255,255,0.15); transform-origin: left center;"></div>`;
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
            <div class="pebble-slice" style="transform: translate3d(0, 0, ${z}px); width: ${d_head}px; height: ${d_head}px; margin-left: ${-r_head}px; margin-top: ${-r_head}px; border-radius: 50%; background: ${playerColor}; filter: brightness(${brightnessRatio}); border: 0.5px solid rgba(255,255,255,0.15);">
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
            <div class="pebble-slice" style="transform: translate3d(0, 0, ${z}px); width: ${d_brim}px; height: ${d_brim}px; margin-left: ${-r_brim}px; margin-top: ${-r_brim}px; border-radius: 50%; background: ${playerColor}; filter: brightness(${brightnessRatio}); border: 0.5px solid rgba(255,255,255,0.25);"></div>
          `;
        }
        // 5. Hat Crown (Z: 36.5 to 48)
        else {
          const zHat = z - 36.5;
          const d_hat = 15 - 13.5 * (zHat / (48 - 36.5));
          const r_hat = d_hat / 2;
          const offsetX = -3 * (zHat / (48 - 36.5)); // Tilt backward
          
          html += `
            <div class="pebble-slice" style="transform: translate3d(${offsetX}px, 0, ${z}px); width: ${d_hat}px; height: ${d_hat}px; margin-left: ${-r_hat}px; margin-top: ${-r_hat}px; border-radius: 50%; background: ${playerColor}; filter: brightness(${brightnessRatio}); border: 0.5px solid rgba(255,255,255,0.15);"></div>
          `;
        }
      }
      
      html += `</div>`; // Close spy-container
      
      pebbleDiv.innerHTML = html;
      pebbleDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        handlePieceClick(idx);
      });
      
      piecesElement.appendChild(pebbleDiv);
    });
  };

  // --- Render HUD details ---
  const renderHUD = () => {
    hudPlayersList.innerHTML = '';
    
    // 1. Hounds slot
    const houndsItem = document.createElement('div');
    houndsItem.className = `hud-player-item ${state.currentTurn === 'hounds' ? 'active' : ''}`;
    houndsItem.innerHTML = `
      <div class="hud-player-meta">
        <i class="fa-solid fa-dog color-hounds hud-player-icon"></i>
        <span class="hud-player-name">사냥개 (Hounds)</span>
        <span class="hud-player-type">${state.gameMode === 'ai-ai' || (state.gameMode === 'human-ai' && state.userFaction === 'hares') ? 'AI' : 'HUMAN'}</span>
      </div>
      <span class="hud-player-status" style="color: #5c6bc0;">4개 피스</span>
    `;
    hudPlayersList.appendChild(houndsItem);

    // 2. Hares slot
    const haresItem = document.createElement('div');
    haresItem.className = `hud-player-item ${state.currentTurn === 'hares' ? 'active' : ''}`;
    haresItem.innerHTML = `
      <div class="hud-player-meta">
        <i class="fa-solid fa-rabbit color-hares hud-player-icon"></i>
        <span class="hud-player-name">토끼 (Hares)</span>
        <span class="hud-player-type">${state.gameMode === 'ai-ai' || (state.gameMode === 'human-ai' && state.userFaction === 'hounds') ? 'AI' : 'HUMAN'}</span>
      </div>
      <span class="hud-player-status" style="color: #ff8a65;">2개 피스</span>
    `;
    hudPlayersList.appendChild(haresItem);
  };

  // --- Smart AI Engine Algorithms ---
  
  rangeAiSpeed.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    aiSpeedVal.textContent = val.toFixed(1);
    state.aiDelayMs = val * 1000;
  });

  const playAILogic = () => {
    if (!state.gameStarted) return;
    
    const isHound = state.currentTurn === 'hounds';
    const depth = state.difficulty === 'hard' ? 4 : 1; // Lookahead depth
    
    const startPos = [...state.positions];
    const bestMove = findBestAIPlan(startPos, isHound, depth);
    
    if (bestMove) {
      saveHistory();
      makeMove(bestMove.pieceIdx, bestMove.targetNode);
    } else {
      nextTurn(); // Pass if completely stuck
    }
  };

  // Smart Heuristic Evaluation from Hound's perspective (maximizing Hounds, minimizing Hares)
  const evaluateBoard = (pos) => {
    const h = [pos[0], pos[1], pos[2], pos[3]];
    const r = [pos[4], pos[5]];
    
    const hX = h.map(idx => NODES[idx].x);
    const rX = r.map(idx => NODES[idx].x);
    
    const minHoundX = Math.min(...hX);
    
    // Check if any Hare escaped past all Hounds
    if (rX[0] < minHoundX || rX[1] < minHoundX) {
      return -10000; // Terrible for Hounds
    }
    
    // Calculate moves left for Hares
    let hareMovesCount = 0;
    r.forEach(idx => {
      hareMovesCount += getLegalMoves(idx, pos, false).length;
    });
    
    if (hareMovesCount === 0) {
      return 10000; // Both hares trapped, optimal for Hounds
    }
    
    // Heuristic Score construction
    let score = 0;
    
    // 1. Hound goal: Squeeze hare moves (Minimize hare moves)
    score -= hareMovesCount * 45;
    
    // 2. Hound goal: Push hares to the rightmost side (larger X)
    score += (NODES[r[0]].x + NODES[r[1]].x) * 20;
    
    // 3. Hound goal: Hounds should move rightwards to close the gap
    score += (NODES[h[0]].x + NODES[h[1]].x + NODES[h[2]].x + NODES[h[3]].x) * 10;
    
    // 4. Hound goal: Try to surround/flank the hares vertically
    const avgHoundY = (NODES[h[0]].y + NODES[h[1]].y + NODES[h[2]].y + NODES[h[3]].y) / 4;
    const avgHareY = (NODES[r[0]].y + NODES[r[1]].y) / 2;
    score -= Math.abs(avgHoundY - avgHareY) * 5;
    
    return score;
  };

  // Find Best Move using Minimax search with Alpha-Beta Pruning
  const findBestAIPlan = (pos, isHoundTurn, maxDepth) => {
    let bestVal = isHoundTurn ? -Infinity : Infinity;
    let candidates = [];
    
    const startIdx = isHoundTurn ? 0 : 4;
    const endIdx = isHoundTurn ? 4 : 6;
    
    for (let i = startIdx; i < endIdx; i++) {
      const moves = getLegalMoves(pos[i], pos, isHoundTurn);
      
      // Shuffle moves to avoid repetitive pathways
      const shuffledMoves = moves.sort(() => Math.random() - 0.5);
      
      shuffledMoves.forEach(target => {
        const nextPos = [...pos];
        nextPos[i] = target;
        
        // Recurse minimax
        const val = minimax(maxDepth - 1, !isHoundTurn, -Infinity, Infinity, nextPos);
        
        if (isHoundTurn) {
          if (val > bestVal) {
            bestVal = val;
            candidates = [{ pieceIdx: i, targetNode: target }];
          } else if (val === bestVal) {
            candidates.push({ pieceIdx: i, targetNode: target });
          }
        } else {
          if (val < bestVal) {
            bestVal = val;
            candidates = [{ pieceIdx: i, targetNode: target }];
          } else if (val === bestVal) {
            candidates.push({ pieceIdx: i, targetNode: target });
          }
        }
      });
    }
    
    if (candidates.length > 0) {
      // Pick random among equal utility candidate choices
      return candidates[Math.floor(Math.random() * candidates.length)];
    }
    return null;
  };

  // Minimax Alpha-Beta algorithm
  const minimax = (depth, isHoundTurn, alpha, beta, pos) => {
    // Base checks
    const houndsWon = !hasValidMoves('hares', pos);
    const haresWon = hasHareEscaped(pos);
    
    if (houndsWon) return 10000;
    if (haresWon) return -10000;
    if (depth === 0) return evaluateBoard(pos);
    
    if (isHoundTurn) {
      let maxEval = -Infinity;
      for (let i = 0; i < 4; i++) {
        const moves = getLegalMoves(pos[i], pos, true);
        for (const target of moves) {
          const nextPos = [...pos];
          nextPos[i] = target;
          
          const ev = minimax(depth - 1, false, alpha, beta, nextPos);
          maxEval = Math.max(maxEval, ev);
          alpha = Math.max(alpha, ev);
          if (beta <= alpha) break; // Prune
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 4; i < 6; i++) {
        const moves = getLegalMoves(pos[i], pos, false);
        for (const target of moves) {
          const nextPos = [...pos];
          nextPos[i] = target;
          
          const ev = minimax(depth - 1, true, alpha, beta, nextPos);
          minEval = Math.min(minEval, ev);
          beta = Math.min(beta, ev);
          if (beta <= alpha) break; // Prune
        }
      }
      return minEval;
    }
  };

  // --- Display Victory modals ---
  const endGame = (winner) => {
    clearInterval(state.turnTimerInterval);
    clearTimeout(state.aiTimeout);
    
    if (winner === 'hounds') {
      winnerTitleName.textContent = '사냥개 (Hounds) 승리!';
      winnerTitleName.className = 'color-hounds';
      winnerDescText.textContent = '토끼의 도주 경로를 완전히 포위 차단하여 대국을 승리로 이끌었습니다.';
      document.getElementById('winner-trophy-icon').style.color = '#5c6bc0';
    } else {
      winnerTitleName.textContent = '토끼 (Hares) 승리!';
      winnerTitleName.className = 'color-hares';
      winnerDescText.textContent = '사냥개의 포위 그물망을 뚫고 무사히 탈출에 성공했습니다!';
      document.getElementById('winner-trophy-icon').style.color = '#ff8a65';
    }
    
    winnerModal.style.display = 'flex';
  };

  const init = () => {
    initCameraControls();
    applyCameraRotation();
  };

  btnStartGame.addEventListener('click', startGame);
  init();
});
