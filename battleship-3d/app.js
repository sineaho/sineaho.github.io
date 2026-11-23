// ==========================================================================
// 3D Battleship Online Game Logic
// ==========================================================================

// --- State Variables ---
let myId = null;
let roomId = null;
let nickname = '제독';
let myRole = null; // 'player1' or 'player2'
let opponentId = null;
let eventSource = null;
let currentRoomState = null;

// Game phases: 'LOBBY', 'PLACEMENT', 'PLAYING', 'GAMEOVER'
let currentPhase = 'LOBBY';

// Ships configuration
const SHIP_TYPES = [
  { name: 'Carrier', size: 5, label: '항공모함' },
  { name: 'Battleship', size: 4, label: '전투함' },
  { name: 'Cruiser', size: 3, label: '순양함' },
  { name: 'Submarine', size: 3, label: '잠수함' },
  { name: 'Destroyer', size: 2, label: '구축함' }
];

// Placement state
let placementShips = []; // [{ name, size, x, y, vertical }]
let selectedShipType = null; // ship spec item from shipsList
let placementVertical = false; // vertical vs horizontal
let placedShipIds = new Set();

// 3D Engine Variables
let scene, camera, renderer, controls;
let container = document.getElementById('canvas-container');
let raycaster, mouse;
let isFirstRender = true;

// Grid meshes for interaction
const playerGridCells = [];
const opponentGridCells = [];
let GRID_SIZE = 10;
const CELL_SIZE = 1.2;
const BOARD_OFFSET_X = 7.5; // distance from center to board center

// Dynamic Grid tracking
let boardGroups = [];
let boardLabelMeshes = [];

// 3D Assets registries
const shipMeshesMap = new Map(); // shipName -> Mesh
const markerMeshes = []; // array of { x, y, board, mesh }
let placementPreviewGroup = null;
let opponentRevealedShips = new Set(); // shipNames that are revealed

// Active animations (missiles, particles, etc.)
const activeAnimations = [];

// Colors
const COLOR_ALLY = 0x00f0ff;
const COLOR_ENEMY = 0xff007f;
const COLOR_WATER = 0x081326;
const COLOR_CELL_DEFAULT = 0x111e36;
const COLOR_CELL_HOVER_ALLY = 0x00f0ff;
const COLOR_CELL_HOVER_ENEMY = 0xff5500;
const COLOR_HIT = 0xef4444;
const COLOR_MISS = 0x00b4d8;

// --- Initialize Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
  initUI();
  init3D();
  fetchLobbies();
  // Poll rooms every 5 seconds in lobby
  setInterval(() => {
    if (currentPhase === 'LOBBY') fetchLobbies();
  }, 5000);
});

// --- UI Actions & Event Bindings ---
function initUI() {
  const btnCreate = document.getElementById('btn-create-room');
  const btnJoin = document.getElementById('btn-join-room');
  const btnRefresh = document.getElementById('btn-refresh-lobbies');
  const btnCopy = document.getElementById('btn-copy-code');
  const btnExit = document.getElementById('btn-exit-game');
  const btnRotate = document.getElementById('btn-rotate-ship');
  const btnReady = document.getElementById('btn-ready');
  const btnCameraReset = document.getElementById('btn-btn-camera-reset') || document.getElementById('btn-camera-reset');
  const btnRules = document.getElementById('btn-rules');
  const chatInput = document.getElementById('chat-input');
  const btnSendChat = document.getElementById('btn-send-chat');

  // Load nickname from localStorage if exists
  const savedNick = localStorage.getItem('battleship_nickname');
  if (savedNick) {
    document.getElementById('player-nickname').value = savedNick;
  }

  btnCreate.addEventListener('click', createRoom);
  btnJoin.addEventListener('click', () => {
    const codeInput = document.getElementById('join-room-id').value.trim();
    if (codeInput.length === 5) {
      joinRoom(codeInput);
    } else {
      alert('올바른 5자리 방 코드를 입력하세요.');
    }
  });

  btnRefresh.addEventListener('click', fetchLobbies);
  btnCopy.addEventListener('click', copyRoomCode);
  btnExit.addEventListener('click', exitGame);
  btnRotate.addEventListener('click', togglePlacementRotation);
  btnReady.addEventListener('click', submitPlacement);
  
  if (btnCameraReset) {
    btnCameraReset.addEventListener('click', resetCamera);
  }
  
  btnRules.addEventListener('click', () => showModal('rules-modal'));

  // Chat send
  btnSendChat.addEventListener('click', sendChatMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  // Handle R key for placement rotation
  window.addEventListener('keydown', (e) => {
    if (currentPhase === 'PLACEMENT' && (e.key === 'r' || e.key === 'R' || e.key === 'ㄱ' || e.key === 'ㄲ')) {
      togglePlacementRotation();
    }
  });

  // Handle Arrow keys to pan camera target between Allied Grid (-BOARD_OFFSET_X), Center (0), and Opponent Grid (BOARD_OFFSET_X)
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault(); // prevent window scrolling
      
      if (!camera || !controls) return;

      let targetX = 0;
      if (e.key === 'ArrowLeft') {
        targetX = -BOARD_OFFSET_X;
      } else if (e.key === 'ArrowRight') {
        targetX = BOARD_OFFSET_X;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        targetX = 0;
      }

      // Smooth camera pan transition
      const startTarget = controls.target.clone();
      const endTarget = new THREE.Vector3(targetX, 0, 0);

      // Keep the camera's relative viewing offset (distance and angle) exactly the same, just shifted by diffX
      const startPos = camera.position.clone();
      const diffX = targetX - startTarget.x;
      const endPos = new THREE.Vector3(startPos.x + diffX, startPos.y, startPos.z);

      const startTime = Date.now();
      const duration = 500; // ms transition

      function panStep() {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        
        // Cubic out ease
        const ease = 1 - Math.pow(1 - t, 3);

        camera.position.lerpVectors(startPos, endPos, ease);
        controls.target.lerpVectors(startTarget, endTarget, ease);

        if (t < 1) {
          requestAnimationFrame(panStep);
        }
      }
      panStep();
    }
  });

  // Lobby Tab Controls
  const tabOnline = document.getElementById('tab-online');
  const tabCpu = document.getElementById('tab-cpu');
  const contentOnline = document.getElementById('content-online');
  const contentCpu = document.getElementById('content-cpu');
  const btnStartCpu = document.getElementById('btn-start-cpu-game');

  tabOnline.addEventListener('click', () => {
    tabOnline.classList.add('active');
    tabCpu.classList.remove('active');
    contentOnline.style.display = 'grid';
    contentCpu.style.display = 'none';
  });

  tabCpu.addEventListener('click', () => {
    tabCpu.classList.add('active');
    tabOnline.classList.remove('active');
    contentOnline.style.display = 'none';
    contentCpu.style.display = 'block';
  });

  // Segmented controls selection behavior
  const setupSegmentedControl = (parentId) => {
    const parent = document.getElementById(parentId);
    if (!parent) return;
    const buttons = parent.querySelectorAll('.segment-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  };
  setupSegmentedControl('grid-size-select');
  setupSegmentedControl('ai-level-select');

  // Counters configuration behavior
  const validateCounters = () => {
    let total = 0;
    const counters = document.querySelectorAll('.ship-counter-item');
    counters.forEach(item => {
      const val = parseInt(item.querySelector('.counter-value').textContent);
      total += val;
    });
    
    const warning = document.getElementById('config-warning');
    const startBtn = document.getElementById('btn-start-cpu-game');
    if (total < 1 || total > 8) {
      warning.style.display = 'block';
      startBtn.disabled = true;
      startBtn.style.opacity = '0.5';
      startBtn.style.pointerEvents = 'none';
    } else {
      warning.style.display = 'none';
      startBtn.disabled = false;
      startBtn.style.opacity = '1';
      startBtn.style.pointerEvents = 'auto';
    }
  };

  const counters = document.querySelectorAll('.ship-counter-item');
  counters.forEach(item => {
    const dec = item.querySelector('.btn-counter-dec');
    const inc = item.querySelector('.btn-counter-inc');
    const valSpan = item.querySelector('.counter-value');
    const type = item.getAttribute('data-ship');

    const maxVal = ['carrier', 'battleship'].includes(type) ? 2 : 3;

    dec.addEventListener('click', () => {
      let currentVal = parseInt(valSpan.textContent);
      if (currentVal > 0) {
        valSpan.textContent = currentVal - 1;
        validateCounters();
      }
    });

    inc.addEventListener('click', () => {
      let currentVal = parseInt(valSpan.textContent);
      if (currentVal < maxVal) {
        valSpan.textContent = currentVal + 1;
        validateCounters();
      }
    });
  });

  btnStartCpu.addEventListener('click', () => {
    createRoom(true);
  });
}

function showModal(id) {
  document.getElementById(id).style.display = 'flex';
}

window.closeModal = function(id) {
  document.getElementById(id).style.display = 'none';
};

// --- HTTP API calls ---
async function fetchLobbies() {
  try {
    const res = await fetch('/api/battleship/lobbies');
    const data = await res.json();
    renderLobbyList(data.lobbies);
  } catch (err) {
    console.error('Failed to fetch rooms', err);
  }
}

function renderLobbyList(lobbies) {
  const container = document.getElementById('room-list-container');
  container.innerHTML = '';

  if (!lobbies || lobbies.length === 0) {
    container.innerHTML = `
      <div class="no-rooms-msg">
        <i class="fa-solid fa-radar fa-spin"></i>
        <p>참여 가능한 공개 방이 없습니다.</p>
        <span class="sub-msg">새로운 방을 생성해 보세요!</span>
      </div>
    `;
    return;
  }

  lobbies.forEach(lobby => {
    const div = document.createElement('div');
    div.className = 'room-item';
    div.innerHTML = `
      <div class="room-item-info">
        <span class="room-item-code">${lobby.roomId}</span>
        <span class="room-item-host">${lobby.hostNickname}님의 함대</span>
      </div>
      <button class="btn btn-secondary btn-icon-sm" onclick="joinRoom('${lobby.roomId}')">
        <i class="fa-solid fa-play"></i>
      </button>
    `;
    container.appendChild(div);
  });
}

async function createRoom(isCpu = false) {
  const nickInput = document.getElementById('player-nickname').value.trim();
  if (!nickInput) return alert('닉네임을 입력해 주세요.');
  
  localStorage.setItem('battleship_nickname', nickInput);
  nickname = nickInput;

  let gridSize = 10;
  let aiLevel = 'normal';
  let shipConfig = {};

  if (isCpu) {
    const activeGridBtn = document.querySelector('#grid-size-select .segment-btn.active');
    if (activeGridBtn) gridSize = parseInt(activeGridBtn.getAttribute('data-val'));

    const activeAiBtn = document.querySelector('#ai-level-select .segment-btn.active');
    if (activeAiBtn) aiLevel = activeAiBtn.getAttribute('data-val');

    const counters = document.querySelectorAll('.ship-counter-item');
    counters.forEach(item => {
      const type = item.getAttribute('data-ship');
      const val = parseInt(item.querySelector('.counter-value').textContent);
      shipConfig[type] = val;
    });
  }

  try {
    const res = await fetch('/api/battleship/create-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, isCpu, gridSize, aiLevel, shipConfig })
    });
    const data = await res.json();
    if (data.error) return alert(data.error);

    roomId = data.roomId;
    myId = data.playerId;
    
    enterGameScreen();
  } catch (err) {
    alert('방 생성에 실패했습니다.');
  }
}

window.joinRoom = async function(roomCode) {
  const nickInput = document.getElementById('player-nickname').value.trim();
  if (!nickInput) return alert('닉네임을 입력해 주세요.');

  localStorage.setItem('battleship_nickname', nickInput);
  nickname = nickInput;

  try {
    const res = await fetch('/api/battleship/join-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: roomCode, nickname })
    });
    const data = await res.json();
    if (data.error) return alert(data.error);

    roomId = data.roomId;
    myId = data.playerId;

    enterGameScreen();
  } catch (err) {
    alert('방 입장에 실패했습니다. 코드를 확인하세요.');
  }
};

function enterGameScreen() {
  document.getElementById('lobby-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'grid';
  document.getElementById('room-code-display').innerText = roomId;
  
  // Set up SSE Event Stream
  setupEventStream();
  
  // Trigger window resize to size ThreeJS canvas correctly
  setTimeout(() => {
    onWindowResize();
    resetCamera();
  }, 100);
}

function setupEventStream() {
  if (eventSource) eventSource.close();

  eventSource = new EventSource(`/api/battleship/events?roomId=${roomId}&playerId=${myId}`);

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'state_update') {
      handleStateUpdate(data.state);
    }
  };

  eventSource.onerror = (err) => {
    console.error('SSE Error:', err);
    addLogMessage('System', '서버와의 연결이 다소 불안정합니다. 재연결 시도 중...');
  };
}

function handleStateUpdate(state) {
  currentRoomState = state;
  currentPhase = state.status;
  
  // Determine role
  myRole = state.myRole;
  opponentId = state.opponentId;

  // Update lobby and status text
  const myData = state.players[myId];
  const oppData = opponentId ? state.players[opponentId] : null;

  document.getElementById('my-name-display').innerText = myData.nickname;
  document.getElementById('role-display').innerText = myRole === 'player1' ? '선공 (함대 1)' : '후공 (함대 2)';
  document.getElementById('role-display').className = `role-badge ${myRole === 'player1' ? 'cyan' : 'magenta'}`;
  
  if (myData.ready) {
    document.getElementById('my-status-detail').innerText = '배치 완료 (준비됨)';
  } else {
    document.getElementById('my-status-detail').innerText = '함선 배치 중...';
  }

  if (oppData) {
    document.getElementById('opponent-name-display').innerText = oppData.nickname;
    if (oppData.ready) {
      document.getElementById('opponent-status-detail').innerText = '배치 완료 (준비됨)';
    } else {
      document.getElementById('opponent-status-detail').innerText = '함선 배치 중...';
    }
  } else {
    document.getElementById('opponent-name-display').innerText = '상대 대기 중...';
    document.getElementById('opponent-status-detail').innerText = '상대편의 입장을 기다리고 있습니다.';
  }

  // Sync Chat & Logs
  renderChatLogs(state.chat);

  // Transition UI states based on status
  const banner = document.getElementById('state-banner');
  const bannerText = document.getElementById('state-banner-text');

  if (state.status === 'LOBBY') {
    bannerText.innerText = '상대 플레이어를 기다리는 중...';
    banner.className = 'state-banner glass-panel';
    document.getElementById('placement-panel').style.display = 'block';
    document.getElementById('ships-status-panel').style.display = 'none';
  } 
  else if (state.status === 'PLACEMENT') {
    bannerText.innerText = '내 보드판에 함선을 배치해 주세요!';
    banner.className = 'state-banner glass-panel';
    document.getElementById('placement-panel').style.display = 'block';
    document.getElementById('ships-status-panel').style.display = 'none';
    
    // Initialize ship select list if not already done
    renderShipSelect();
  } 
  else if (state.status === 'PLAYING') {
    document.getElementById('placement-panel').style.display = 'none';
    document.getElementById('ships-status-panel').style.display = 'block';
    
    // Render Ship health list
    renderShipsHealth(myData, oppData);

    const isMyTurn = state.turn === myId;
    if (isMyTurn) {
      bannerText.innerHTML = `<i class="fa-solid fa-crosshairs fa-spin"></i> 당신의 공격 턴입니다! (사격할 적 구역 클릭)`;
      banner.className = 'state-banner glass-panel your-turn';
    } else {
      bannerText.innerHTML = `<i class="fa-solid fa-hourglass-half fa-spin"></i> 상대방의 공격 턴입니다. 대기 중...`;
      banner.className = 'state-banner glass-panel opponent-turn';
    }
  } 
  else if (state.status === 'GAMEOVER') {
    document.getElementById('placement-panel').style.display = 'none';
    document.getElementById('ships-status-panel').style.display = 'block';
    renderShipsHealth(myData, oppData);

    const didIWin = state.winner === myId;
    bannerText.innerText = didIWin ? '승리했습니다!' : '패배했습니다...';
    banner.className = didIWin ? 'state-banner glass-panel your-turn' : 'state-banner glass-panel opponent-turn';

    // Show winner modal
    document.getElementById('winner-title').innerText = didIWin ? '🎉 승리하였습니다!' : '💀 패배하였습니다...';
    document.getElementById('winner-desc').innerText = didIWin ? 
      '적의 함대를 완벽하게 소탕했습니다. 탁월한 지휘였습니다, 사령관님!' : 
      '우리 함대가 전멸하였습니다. 대피소로 철수합니다.';
    showModal('winner-modal');
  }

  // Update 3D elements
  sync3DScene(state);
}

function renderShipSelect() {
  const container = document.getElementById('ship-select-list');
  container.innerHTML = '';

  const shipsList = (currentRoomState && currentRoomState.shipsList) || SHIP_TYPES;

  shipsList.forEach(ship => {
    const isPlaced = placedShipIds.has(ship.id);
    const isSelected = selectedShipType && selectedShipType.id === ship.id;
    
    const div = document.createElement('div');
    div.className = `ship-select-item ${isPlaced ? 'placed' : ''} ${isSelected ? 'selected' : ''}`;
    div.innerHTML = `
      <span class="ship-select-name">${ship.label || ship.name} (크기 ${ship.size})</span>
      <div class="ship-select-size">
        ${Array(ship.size).fill(`<span class="ship-dot"></span>`).join('')}
      </div>
    `;

    if (!isPlaced) {
      div.addEventListener('click', () => {
        selectedShipType = ship;
        renderShipSelect();
      });
    }
    container.appendChild(div);
  });

  // Enable/Disable Ready button
  const btnReady = document.getElementById('btn-ready');
  btnReady.disabled = placedShipIds.size !== shipsList.length;
}

function renderShipsHealth(myData, oppData) {
  const myContainer = document.getElementById('my-ships-health');
  const oppContainer = document.getElementById('opponent-ships-sunk');

  myContainer.innerHTML = '';
  oppContainer.innerHTML = '';

  const shipsList = (currentRoomState && currentRoomState.shipsList) || SHIP_TYPES;

  // 1. My ships health status
  shipsList.forEach(shipSpec => {
    const placedShip = myData.ships.find(s => s.id === shipSpec.id);
    const row = document.createElement('div');
    row.className = 'ship-status-row';

    let hitCount = 0;
    const cellsStatus = [];

    if (placedShip) {
      for (let i = 0; i < placedShip.size; i++) {
        const cellX = placedShip.vertical ? placedShip.x : placedShip.x + i;
        const cellY = placedShip.vertical ? placedShip.y + i : placedShip.y;
        
        const isHit = oppData ? oppData.shots.some(s => s.x === cellX && s.y === cellY && s.hit) : false;
        if (isHit) hitCount++;
        
        cellsStatus.push(isHit ? 'allied-hit' : 'allied');
      }
      const isSunk = hitCount === placedShip.size;
      if (isSunk) row.classList.add('sunk');

      row.innerHTML = `
        <div class="ship-status-label">
          <span>${shipSpec.label || shipSpec.name}</span>
          <span>${isSunk ? '침몰' : `${placedShip.size - hitCount}/${placedShip.size}`}</span>
        </div>
        <div class="ship-status-cells">
          ${cellsStatus.map(c => `<span class="ship-status-cell ${c}"></span>`).join('')}
        </div>
      `;
    } else {
      const cellStatus = Array(shipSpec.size).fill('allied');
      row.innerHTML = `
        <div class="ship-status-label">
          <span>${shipSpec.label || shipSpec.name}</span>
          <span>대기중</span>
        </div>
        <div class="ship-status-cells">
          ${cellStatus.map(c => `<span class="ship-status-cell ${c}"></span>`).join('')}
        </div>
      `;
    }
    myContainer.appendChild(row);
  });

  // 2. Opponent ships sunk status
  const sunkShipIds = new Set();
  if (oppData && oppData.ships) {
    oppData.ships.forEach(s => sunkShipIds.add(s.id));
  }

  shipsList.forEach(shipSpec => {
    const row = document.createElement('div');
    row.className = 'ship-status-row';
    const isSunk = sunkShipIds.has(shipSpec.id);

    if (isSunk) row.classList.add('sunk');

    const cellsStatus = Array(shipSpec.size).fill(isSunk ? 'enemy-sunk' : 'enemy-unk');

    row.innerHTML = `
      <div class="ship-status-label">
        <span>${shipSpec.label || shipSpec.name}</span>
        <span>${isSunk ? '침몰' : '생존'}</span>
      </div>
      <div class="ship-status-cells">
        ${cellsStatus.map(c => `<span class="ship-status-cell ${c}"></span>`).join('')}
      </div>
    `;
    oppContainer.appendChild(row);
  });
}

function renderChatLogs(chat) {
  const container = document.getElementById('chat-logs');
  const scrollNeeded = container.scrollHeight - container.scrollTop <= container.clientHeight + 40;
  container.innerHTML = '';

  chat.forEach(msg => {
    const div = document.createElement('div');
    if (msg.sender === 'System') {
      div.className = 'chat-msg system';
      div.innerHTML = `<span class="msg-time">${msg.time}</span><span class="msg-sender">[작전부]</span> ${msg.text}`;
    } else {
      const isOpponent = msg.sender !== nickname;
      div.className = `chat-msg ${isOpponent ? 'opponent' : ''}`;
      div.innerHTML = `
        <span class="msg-time">${msg.time}</span>
        <span class="msg-sender">${msg.sender}:</span>
        <span class="msg-text">${msg.text}</span>
      `;
    }
    container.appendChild(div);
  });

  if (scrollNeeded) {
    container.scrollTop = container.scrollHeight;
  }
}

async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  try {
    await fetch('/api/battleship/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, playerId: myId, text })
    });
    input.value = '';
  } catch (err) {
    console.error('Failed to send chat');
  }
}

function addLogMessage(sender, text) {
  const container = document.getElementById('chat-logs');
  const div = document.createElement('div');
  div.className = `chat-msg ${sender === 'System' ? 'system' : ''}`;
  div.innerHTML = `<span class="msg-time">${new Date().toLocaleTimeString('ko-KR')}</span><span class="msg-sender">[${sender}]</span> ${text}`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function copyRoomCode() {
  const code = document.getElementById('room-code-display').innerText;
  navigator.clipboard.writeText(code).then(() => {
    alert('방 코드가 클립보드에 복사되었습니다: ' + code);
  });
}

async function exitGame() {
  if (confirm('정말로 게임방을 나가시겠습니까?')) {
    if (eventSource) eventSource.close();
    try {
      await fetch('/api/battleship/exit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerId: myId })
      });
    } catch (err) {
      console.error(err);
    }
    
    // Reset state and reload
    location.reload();
  }
}

function togglePlacementRotation() {
  placementVertical = !placementVertical;
  const btn = document.getElementById('btn-rotate-ship');
  if (placementVertical) {
    btn.innerHTML = `<i class="fa-solid fa-rotate-right"></i> 세로 방향 (R키)`;
  } else {
    btn.innerHTML = `<i class="fa-solid fa-rotate-right"></i> 가로 방향 (R키)`;
  }
}

async function submitPlacement() {
  const expectedCount = (currentRoomState && currentRoomState.shipsList) ? currentRoomState.shipsList.length : 5;
  if (placementShips.length !== expectedCount) {
    return alert(`${expectedCount}척의 함선을 모두 배치해야 준비할 수 있습니다.`);
  }

  try {
    const res = await fetch('/api/battleship/place-ships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, playerId: myId, ships: placementShips })
    });
    const data = await res.json();
    if (data.error) return alert(data.error);

    // Disable placement UI
    document.getElementById('btn-ready').disabled = true;
    addLogMessage('System', '배치를 완료하고 대기 중입니다...');
  } catch (err) {
    alert('배치 제출에 실패했습니다.');
  }
}

// --- 3D Graphics Engine ---
function init3D() {
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight || 500;

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(COLOR_WATER);
  scene.fog = new THREE.FogExp2(COLOR_WATER, 0.015);

  // Camera
  camera = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 0.1, 100);
  camera.position.set(0, 18, 18);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(containerWidth, containerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.05; // don't go under water
  controls.minDistance = 5;
  controls.maxDistance = 40;
  controls.target.set(0, 0, 0);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
  sunLight.position.set(10, 20, 10);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 40;
  const d = 15;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  scene.add(sunLight);

  // Soft blue water point light
  const waterLight = new THREE.PointLight(0x00aaff, 1, 30);
  waterLight.position.set(0, 2, 0);
  scene.add(waterLight);

  // Water Surface (Grid of waves / large plane)
  const waterGeo = new THREE.PlaneGeometry(100, 100, 64, 64);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x07152c,
    roughness: 0.15,
    metalness: 0.8,
    transparent: true,
    opacity: 0.85,
    flatShading: true
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.15;
  water.receiveShadow = true;
  scene.add(water);

  // Wave vertex animation reference
  water.geometry.attributes.position.usage = THREE.DynamicDrawUsage;
  const initialPos = water.geometry.attributes.position.clone();

  // Create Grid Boards
  rebuild3DGrids(10);

  // Labels for grids
  createGridLabel('MY FLEET', -BOARD_OFFSET_X, 0x888888);
  createGridLabel('OPPONENT', BOARD_OFFSET_X, 0x888888);

  // Raycaster & Mouse
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Interaction events
  renderer.domElement.addEventListener('mousemove', onMouseMove);
  
  let pointerDownX = 0;
  let pointerDownY = 0;
  
  renderer.domElement.addEventListener('pointerdown', (e) => {
    pointerDownX = e.clientX;
    pointerDownY = e.clientY;
  });
  
  renderer.domElement.addEventListener('pointerup', (e) => {
    const dist = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
    // If pointer moved less than 5 pixels, treat it as a click
    if (dist < 5) {
      onGridClick(e);
    }
  });
  
  window.addEventListener('resize', onWindowResize);

  // Placement preview group
  placementPreviewGroup = new THREE.Group();
  scene.add(placementPreviewGroup);

  // Start loop
  animate();

  function animate() {
    requestAnimationFrame(animate);
    
    // Wave animation
    const time = Date.now() * 0.001;
    const pos = water.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const u = initialPos.getX(i);
      const v = initialPos.getY(i);
      const z = Math.sin(u * 0.2 + time) * 0.15 + Math.cos(v * 0.2 + time * 1.5) * 0.15;
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;

    // Run active custom animations
    for (let i = activeAnimations.length - 1; i >= 0; i--) {
      const anim = activeAnimations[i];
      const finished = anim(time);
      if (finished) {
        activeAnimations.splice(i, 1);
      }
    }

    controls.update();
    renderer.render(scene, camera);
  }
}

function resetCamera() {
  if (currentPhase === 'PLACEMENT') {
    // Zoom in on player board
    gsapAnimateCamera(-BOARD_OFFSET_X, 8, 8, -BOARD_OFFSET_X, 0, 0);
  } else if (currentPhase === 'PLAYING' && currentRoomState && currentRoomState.turn === myId) {
    // Zoom in slightly on enemy board
    gsapAnimateCamera(BOARD_OFFSET_X * 0.5, 10, 10, BOARD_OFFSET_X, 0, 0);
  } else {
    // Standard tactical view
    gsapAnimateCamera(0, 14, 15, 0, 0, 0);
  }
}

function gsapAnimateCamera(px, py, pz, tx, ty, tz) {
  // Simple LERP camera transition since GSAP is not loaded, we do a simple manual LERP animation
  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const endPos = new THREE.Vector3(px, py, pz);
  const endTarget = new THREE.Vector3(tx, ty, tz);

  const startTime = Date.now();
  const duration = 800; // ms

  function lerpStep() {
    const elapsed = Date.now() - startTime;
    const t = Math.min(elapsed / duration, 1);
    
    // Ease cubic out
    const ease = 1 - Math.pow(1 - t, 3);

    camera.position.lerpVectors(startPos, endPos, ease);
    controls.target.lerpVectors(startTarget, endTarget, ease);

    if (t < 1) {
      requestAnimationFrame(lerpStep);
    }
  }
  lerpStep();
}

function onWindowResize() {
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight || 500;
  
  camera.aspect = containerWidth / containerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(containerWidth, containerHeight);
}

// Draw a board grid in 3D
function createBoardGrid(offsetX, cellArray, accentColor) {
  const gridHelper = new THREE.Group();
  scene.add(gridHelper);
  boardGroups.push(gridHelper);

  const boxGeo = new THREE.BoxGeometry(1.0, 0.05, 1.0);

  const startX = offsetX - ((GRID_SIZE - 1) * CELL_SIZE) / 2;
  const startZ = -((GRID_SIZE - 1) * CELL_SIZE) / 2;

  for (let x = 0; x < GRID_SIZE; x++) {
    cellArray[x] = [];
    for (let z = 0; z < GRID_SIZE; z++) {
      const posX = startX + x * CELL_SIZE;
      const posZ = startZ + z * CELL_SIZE;

      // Base grid block
      const mat = new THREE.MeshStandardMaterial({
        color: COLOR_CELL_DEFAULT,
        roughness: 0.5,
        metalness: 0.5,
        transparent: true,
        opacity: 0.7,
        emissive: accentColor,
        emissiveIntensity: 0.05
      });

      const cellMesh = new THREE.Mesh(boxGeo, mat);
      cellMesh.position.set(posX, 0, posZ);
      cellMesh.receiveShadow = true;
      gridHelper.add(cellMesh);

      // Save references
      cellMesh.userData = { gridX: x, gridY: z, boardOffset: offsetX };
      cellArray[x][z] = cellMesh;

      // Draw thin neon borders
      const edges = new THREE.EdgesGeometry(boxGeo);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
        color: accentColor,
        transparent: true,
        opacity: 0.25
      }));
      line.position.copy(cellMesh.position);
      gridHelper.add(line);
    }
  }
}

// Floating 3D Label
function createGridLabel(text, offsetX, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0,0,256,64);
  
  ctx.font = 'bold 36px Orbitron';
  ctx.fillStyle = '#' + new THREE.Color(color).getHexString();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#' + new THREE.Color(color).getHexString();
  ctx.shadowBlur = 10;
  ctx.fillText(text, 128, 32);

  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(4, 1, 1);
  sprite.position.set(offsetX, 0.5, -((GRID_SIZE / 2) + 1.5));
  scene.add(sprite);
  boardLabelMeshes.push(sprite);
}

// Raycast Hover Events
function onMouseMove(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Clear previous hovers on both grids
  clearGridHovers();
  
  // Clear placement preview
  while (placementPreviewGroup.children.length > 0) {
    const obj = placementPreviewGroup.children[0];
    placementPreviewGroup.remove(obj);
  }

  if (currentPhase === 'PLACEMENT') {
    // Only raycast on Player Board (-BOARD_OFFSET_X)
    const targets = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        targets.push(playerGridCells[x][z]);
      }
    }

    const intersects = raycaster.intersectObjects(targets);
    if (intersects.length > 0 && selectedShipType && !placedShipIds.has(selectedShipType.id)) {
      const hitCell = intersects[0].object;
      const { gridX, gridY } = hitCell.userData;
      
      showPlacementPreview(gridX, gridY);
    }
  } 
  else if (currentPhase === 'PLAYING' && currentRoomState && currentRoomState.turn === myId) {
    // Only raycast on Opponent Board (BOARD_OFFSET_X)
    const targets = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        targets.push(opponentGridCells[x][z]);
      }
    }

    const intersects = raycaster.intersectObjects(targets);
    if (intersects.length > 0) {
      const hitCell = intersects[0].object;
      const { gridX, gridY } = hitCell.userData;

      // Check if already shot
      const myData = currentRoomState.players[myId];
      const alreadyShot = myData.shots.some(s => s.x === gridX && s.y === gridY);

      if (!alreadyShot) {
        hitCell.material.color.setHex(COLOR_CELL_HOVER_ENEMY);
        hitCell.material.opacity = 0.9;
        hitCell.material.emissiveIntensity = 0.4;
      }
    }
  }
}

function clearGridHovers() {
  // Player grid
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let z = 0; z < GRID_SIZE; z++) {
      playerGridCells[x][z].material.color.setHex(COLOR_CELL_DEFAULT);
      playerGridCells[x][z].material.opacity = 0.7;
      playerGridCells[x][z].material.emissiveIntensity = 0.05;
    }
  }
  // Opponent grid
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let z = 0; z < GRID_SIZE; z++) {
      opponentGridCells[x][z].material.color.setHex(COLOR_CELL_DEFAULT);
      opponentGridCells[x][z].material.opacity = 0.7;
      opponentGridCells[x][z].material.emissiveIntensity = 0.05;
    }
  }
}

// Raycast Click Events
function onGridClick(event) {
  // Only click if tab is active
  if (currentPhase === 'LOBBY' || currentPhase === 'GAMEOVER') return;

  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  if (currentPhase === 'PLACEMENT') {
    const targets = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        targets.push(playerGridCells[x][z]);
      }
    }

    const intersects = raycaster.intersectObjects(targets);
    if (intersects.length > 0 && selectedShipType) {
      const hitCell = intersects[0].object;
      const { gridX, gridY } = hitCell.userData;

      placeShipLocally(selectedShipType, gridX, gridY, placementVertical);
    }
  } 
  else if (currentPhase === 'PLAYING' && currentRoomState && currentRoomState.turn === myId) {
    const targets = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        targets.push(opponentGridCells[x][z]);
      }
    }

    const intersects = raycaster.intersectObjects(targets);
    if (intersects.length > 0) {
      const hitCell = intersects[0].object;
      const { gridX, gridY } = hitCell.userData;

      const myData = currentRoomState.players[myId];
      const alreadyShot = myData.shots.some(s => s.x === gridX && s.y === gridY);

      if (!alreadyShot) {
        fireShotAtOpponent(gridX, gridY);
      }
    }
  }
}

// Display ship placement preview model on board
function showPlacementPreview(startX, startY) {
  const size = selectedShipType.size;
  const isVertical = placementVertical;

  let isValid = true;
  const previewCells = [];

  for (let i = 0; i < size; i++) {
    const x = isVertical ? startX : startX + i;
    const y = isVertical ? startY + i : startY;

    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
      isValid = false;
      break;
    }
    previewCells.push({ x, y });
  }

  // Check overlap with already placed ships
  if (isValid) {
    placementShips.forEach(placedShip => {
      const cells = getShipCoordinates(placedShip);
      cells.forEach(c => {
        if (previewCells.some(pc => pc.x === c.x && pc.y === c.y)) {
          isValid = false;
        }
      });
    });
  }

  // Create preview materials
  const previewColor = isValid ? 0x00ff88 : 0xff3300;
  
  // Highlight cells
  previewCells.forEach(cell => {
    const cellMesh = playerGridCells[cell.x][cell.y];
    cellMesh.material.color.setHex(previewColor);
    cellMesh.material.opacity = 0.9;
    cellMesh.material.emissiveIntensity = 0.3;
  });

  // Render a simple semi-transparent bounding box for preview ship
  if (isValid) {
    const geometry = new THREE.BoxGeometry(
      isVertical ? 0.9 : size * CELL_SIZE - 0.2,
      0.4,
      isVertical ? size * CELL_SIZE - 0.2 : 0.9
    );
    const material = new THREE.MeshBasicMaterial({
      color: previewColor,
      transparent: true,
      opacity: 0.4,
      wireframe: false
    });
    const previewMesh = new THREE.Mesh(geometry, material);

    // Calculate position center
    const startMesh = playerGridCells[startX][startY];
    const endMesh = playerGridCells[previewCells[size-1].x][previewCells[size-1].y];
    const centerX = (startMesh.position.x + endMesh.position.x) / 2;
    const centerZ = (startMesh.position.z + endMesh.position.z) / 2;

    previewMesh.position.set(centerX, 0.2, centerZ);
    placementPreviewGroup.add(previewMesh);
  }
}

// Place ship on board locally
function placeShipLocally(shipType, startX, startY, isVertical) {
  const size = shipType.size;
  let isValid = true;
  const shipCells = [];

  for (let i = 0; i < size; i++) {
    const x = isVertical ? startX : startX + i;
    const y = isVertical ? startY + i : startY;

    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
      isValid = false;
      break;
    }
    shipCells.push({ x, y });
  }

  if (!isValid) return;

  // Overlap check
  let overlap = false;
  placementShips.forEach(placed => {
    const cells = getShipCoordinates(placed);
    cells.forEach(c => {
      if (shipCells.some(pc => pc.x === c.x && pc.y === c.y)) {
        overlap = true;
      }
    });
  });

  if (overlap) return;

  // Register ship placement
  const newShip = {
    id: shipType.id,
    name: shipType.name,
    size: shipType.size,
    label: shipType.label,
    x: startX,
    y: startY,
    vertical: isVertical
  };

  placementShips.push(newShip);
  placedShipIds.add(shipType.id);

  // Render actual 3D Ship Mesh on my board
  spawnShipMesh(newShip, -BOARD_OFFSET_X);

  selectedShipType = null;
  renderShipSelect();
  addLogMessage('System', `${shipType.label || shipType.name}을(를) (${startX+1}, ${startY+1}) 구역에 배치했습니다.`);
}

function getShipCoordinates(ship) {
  const cells = [];
  for (let i = 0; i < ship.size; i++) {
    const x = ship.vertical ? ship.x : ship.x + i;
    const y = ship.vertical ? ship.y + i : ship.y;
    cells.push({ x, y });
  }
  return cells;
}

// Generate procedurally styled 3D ship models
function createShipMeshModel(name, size, accentColorHex) {
  const shipGroup = new THREE.Group();

  const hullMat = new THREE.MeshStandardMaterial({
    color: 0x3a4856,
    roughness: 0.2,
    metalness: 0.8
  });
  const deckMat = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.5,
    metalness: 0.3
  });
  const glowMat = new THREE.MeshBasicMaterial({
    color: accentColorHex
  });

  const width = 0.75;
  const height = 0.35;
  const length = size * CELL_SIZE - 0.25;

  // 1. Base hull (Pointy bow shape)
  const hullGeo = new THREE.BoxGeometry(width, height, length);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.position.y = height / 2;
  hull.castShadow = true;
  hull.receiveShadow = true;
  shipGroup.add(hull);

  // Pointy Bow nose (cone / wedge)
  const bowGeo = new THREE.ConeGeometry(width / 2, 0.8, 4);
  const bow = new THREE.Mesh(bowGeo, hullMat);
  bow.rotation.x = Math.PI / 2;
  bow.rotation.y = Math.PI / 4;
  bow.position.set(0, height / 2, -length / 2 - 0.2);
  bow.scale.set(1.4, 1.4, 0.4);
  bow.castShadow = true;
  shipGroup.add(bow);

  // Propeller/Stern detail
  const sternGeo = new THREE.BoxGeometry(width - 0.2, height - 0.1, 0.15);
  const stern = new THREE.Mesh(sternGeo, hullMat);
  stern.position.set(0, height / 2, length / 2 + 0.05);
  shipGroup.add(stern);

  // 2. Custom structures based on ship type
  if (name.toLowerCase() === 'carrier') {
    // Flight Deck - Offset slightly
    const deckGeo = new THREE.BoxGeometry(width + 0.15, 0.05, length);
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(-0.05, height + 0.02, 0);
    deck.castShadow = true;
    shipGroup.add(deck);

    // Control Tower/Island on side
    const towerGeo = new THREE.BoxGeometry(0.2, 0.5, 0.8);
    const tower = new THREE.Mesh(towerGeo, hullMat);
    tower.position.set(width / 2 - 0.05, height + 0.25, 0.2);
    tower.castShadow = true;
    shipGroup.add(tower);

    // Radar antenna
    const mastGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8);
    const mast = new THREE.Mesh(mastGeo, deckMat);
    mast.position.set(width / 2 - 0.05, height + 0.6, 0.2);
    shipGroup.add(mast);

    // Runway stripes
    const runwayGeo = new THREE.BoxGeometry(0.05, 0.01, length - 1.0);
    const stripe = new THREE.Mesh(runwayGeo, glowMat);
    stripe.position.set(-0.1, height + 0.05, 0);
    shipGroup.add(stripe);
  } 
  else if (name.toLowerCase() === 'battleship') {
    // Secondary deck
    const deckGeo = new THREE.BoxGeometry(width - 0.1, 0.15, length * 0.7);
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(0, height + 0.07, 0);
    deck.castShadow = true;
    shipGroup.add(deck);

    // Double Turrets
    const turretGeo = new THREE.BoxGeometry(0.4, 0.15, 0.4);
    const barrelGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
    barrelGeo.rotateX(Math.PI / 2);

    // Fore Turret
    const turret1 = new THREE.Mesh(turretGeo, hullMat);
    turret1.position.set(0, height + 0.22, -length * 0.25);
    const barrel1 = new THREE.Mesh(barrelGeo, deckMat);
    barrel1.position.set(-0.08, 0, -0.25);
    const barrel2 = new THREE.Mesh(barrelGeo, deckMat);
    barrel2.position.set(0.08, 0, -0.25);
    turret1.add(barrel1);
    turret1.add(barrel2);
    turret1.castShadow = true;
    shipGroup.add(turret1);

    // Aft Turret
    const turret2 = new THREE.Mesh(turretGeo, hullMat);
    turret2.position.set(0, height + 0.22, length * 0.25);
    turret2.rotation.y = Math.PI; // pointing backward
    const barrel3 = new THREE.Mesh(barrelGeo, deckMat);
    barrel3.position.set(-0.08, 0, -0.25);
    const barrel4 = new THREE.Mesh(barrelGeo, deckMat);
    barrel4.position.set(0.08, 0, -0.25);
    turret2.add(barrel3);
    turret2.add(barrel4);
    turret2.castShadow = true;
    shipGroup.add(turret2);

    // Central bridge structure
    const bridgeGeo = new THREE.BoxGeometry(0.3, 0.4, 0.6);
    const bridge = new THREE.Mesh(bridgeGeo, hullMat);
    bridge.position.set(0, height + 0.35, 0);
    shipGroup.add(bridge);
  } 
  else if (name.toLowerCase() === 'cruiser') {
    // Sleek structure
    const deckGeo = new THREE.BoxGeometry(width - 0.15, 0.12, length * 0.65);
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(0, height + 0.06, 0);
    shipGroup.add(deck);

    // Missile launch pods (cylinders laid flat)
    const podGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.4, 8);
    podGeo.rotateX(Math.PI / 2);
    const pod1 = new THREE.Mesh(podGeo, deckMat);
    pod1.position.set(0, height + 0.18, -length * 0.15);
    const pod2 = new THREE.Mesh(podGeo, deckMat);
    pod2.position.set(0, height + 0.18, length * 0.15);
    shipGroup.add(pod1);
    shipGroup.add(pod2);

    // Mast
    const mastGeo = new THREE.BoxGeometry(0.08, 0.6, 0.08);
    const mast = new THREE.Mesh(mastGeo, hullMat);
    mast.position.set(0, height + 0.4, -0.05);
    shipGroup.add(mast);

    // Radar dish
    const dishGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.04, 16);
    dishGeo.rotateX(Math.PI/2);
    const dish = new THREE.Mesh(dishGeo, glowMat);
    dish.position.set(0, height + 0.7, -0.05);
    shipGroup.add(dish);
  }
  else if (name.toLowerCase() === 'submarine') {
    // Cylindrical round hull instead of box
    shipGroup.remove(hull); // Remove base box
    shipGroup.remove(bow);

    const subMat = new THREE.MeshStandardMaterial({
      color: 0x272e38,
      roughness: 0.1,
      metalness: 0.95
    });

    const subHullGeo = new THREE.CylinderGeometry(width / 2, width / 2, length, 16);
    subHullGeo.rotateX(Math.PI / 2);
    const subHull = new THREE.Mesh(subHullGeo, subMat);
    subHull.position.y = width / 2;
    subHull.castShadow = true;
    shipGroup.add(subHull);

    // Rounded caps
    const capGeo = new THREE.SphereGeometry(width / 2, 16, 16);
    const bowCap = new THREE.Mesh(capGeo, subMat);
    bowCap.position.set(0, width / 2, -length / 2);
    shipGroup.add(bowCap);

    const sternCap = new THREE.Mesh(capGeo, subMat);
    sternCap.position.set(0, width / 2, length / 2);
    shipGroup.add(sternCap);

    // Sail / Conning Tower
    const sailGeo = new THREE.BoxGeometry(width * 0.5, 0.5, 0.8);
    const sail = new THREE.Mesh(sailGeo, subMat);
    sail.position.set(0, width + 0.2, -length * 0.1);
    sail.castShadow = true;
    shipGroup.add(sail);

    // Propeller shaft
    const propGeo = new THREE.ConeGeometry(0.12, 0.3, 4);
    propGeo.rotateX(-Math.PI / 2);
    const prop = new THREE.Mesh(propGeo, deckMat);
    prop.position.set(0, width / 2, length / 2 + 0.3);
    shipGroup.add(prop);
  } 
  else {
    // Destroyer (size 2 or default)
    const deckGeo = new THREE.BoxGeometry(width - 0.2, 0.1, length * 0.8);
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(0, height + 0.05, 0);
    shipGroup.add(deck);

    // Small bridge
    const bridgeGeo = new THREE.BoxGeometry(0.3, 0.25, 0.35);
    const bridge = new THREE.Mesh(bridgeGeo, hullMat);
    bridge.position.set(0, height + 0.2, -length * 0.1);
    shipGroup.add(bridge);

    // Single gun turret
    const gunGeo = new THREE.BoxGeometry(0.3, 0.12, 0.3);
    const barrelGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.35, 8);
    barrelGeo.rotateX(Math.PI / 2);

    const gun = new THREE.Mesh(gunGeo, hullMat);
    gun.position.set(0, height + 0.12, -length * 0.35);
    const barrel = new THREE.Mesh(barrelGeo, deckMat);
    barrel.position.set(0, 0, -0.2);
    gun.add(barrel);
    shipGroup.add(gun);
  }

  // Add decorative neon strip on base sides
  const lightGeo = new THREE.BoxGeometry(width + 0.02, 0.04, length - 0.2);
  const lights = new THREE.Mesh(lightGeo, glowMat);
  lights.position.set(0, height * 0.4, 0);
  shipGroup.add(lights);

  return shipGroup;
}

// Spawn ship in 3D scene at correct offset
function spawnShipMesh(ship, boardOffsetX) {
  const model = createShipMeshModel(ship.name, ship.size, boardOffsetX < 0 ? COLOR_ALLY : COLOR_ENEMY);
  
  // Grid alignment
  const startMesh = getGridCellMesh(ship.x, ship.y, boardOffsetX);
  const endMesh = getGridCellMesh(
    ship.vertical ? ship.x : ship.x + ship.size - 1,
    ship.vertical ? ship.y + ship.size - 1 : ship.y,
    boardOffsetX
  );

  const posX = (startMesh.position.x + endMesh.position.x) / 2;
  const posZ = (startMesh.position.z + endMesh.position.z) / 2;

  model.position.set(posX, 0.05, posZ);

  if (ship.vertical) {
    model.rotation.y = 0;
  } else {
    model.rotation.y = Math.PI / 2;
  }

  scene.add(model);
  
  // Register mesh
  const uniqueKey = `${boardOffsetX < 0 ? 'ally' : 'enemy'}_${ship.id || ship.name}`;
  
  // Remove existing mesh if exists
  if (shipMeshesMap.has(uniqueKey)) {
    scene.remove(shipMeshesMap.get(uniqueKey));
  }
  
  shipMeshesMap.set(uniqueKey, model);
}

function getGridCellMesh(gridX, gridY, boardOffsetX) {
  if (boardOffsetX < 0) {
    return playerGridCells[gridX][gridY];
  } else {
    return opponentGridCells[gridX][gridY];
  }
}

// Sync client 3D elements with server-side Room State
function sync3DScene(state) {
  if (!scene) return;

  // Rebuild grids dynamically if state gridSize changed
  if (state.gridSize && (state.gridSize !== GRID_SIZE || boardGroups.length === 0)) {
    rebuild3DGrids(state.gridSize);
  }

  const myData = state.players[myId];
  const oppData = opponentId ? state.players[opponentId] : null;

  const expectedCount = (state && state.shipsList) ? state.shipsList.length : 5;
  let allyMeshCount = 0;
  shipMeshesMap.forEach((mesh, key) => {
    if (key.startsWith('ally_')) allyMeshCount++;
  });

  // 1. Spawn my ships on first loading or placement updates
  if (myData && myData.ships.length > 0 && allyMeshCount < expectedCount) {
    myData.ships.forEach(ship => {
      const key = `ally_${ship.id || ship.name}`;
      if (!shipMeshesMap.has(key)) {
        spawnShipMesh(ship, -BOARD_OFFSET_X);
      }
    });
  }

  // 2. Spawn revealed (sunk) opponent ships
  if (oppData && oppData.ships) {
    oppData.ships.forEach(ship => {
      const key = `enemy_${ship.id || ship.name}`;
      if (!opponentRevealedShips.has(ship.id || ship.name)) {
        opponentRevealedShips.add(ship.id || ship.name);
        spawnShipMesh(ship, BOARD_OFFSET_X);
        
        // Add visual transition (fade in scale, spawn small bubbles)
        const mesh = shipMeshesMap.get(key);
        if (mesh) {
          mesh.position.y = -1.0; // start submerged
          // Float up animation
          const startY = mesh.position.y;
          const endY = 0.05;
          const startTime = Date.now();
          activeAnimations.push((t) => {
            const progress = Math.min((Date.now() - startTime) / 1500, 1);
            mesh.position.y = startY + (endY - startY) * progress;
            return progress >= 1;
          });
        }
      }
    });
  }

  // 3. Sync shots (Peg Markers)
  // Check shots I fired at opponent (My shots list)
  if (myData && myData.shots) {
    syncPegMarkers(myData.shots, BOARD_OFFSET_X, 'enemy');
  }

  // Check shots opponent fired at me (Opponent shots list)
  if (oppData && oppData.shots) {
    syncPegMarkers(oppData.shots, -BOARD_OFFSET_X, 'ally');
  }
}

// Sync red/blue markers with actual coordinates
function syncPegMarkers(shots, boardOffsetX, targetType) {
  shots.forEach(shot => {
    const key = `${targetType}_${shot.x}_${shot.y}`;
    const exists = markerMeshes.some(m => m.key === key);

    if (!exists) {
      // Find position
      const cellMesh = getGridCellMesh(shot.x, shot.y, boardOffsetX);
      const position = cellMesh.position.clone();
      position.y = 0.25;

      // Decide color and particle type
      const color = shot.hit ? COLOR_HIT : COLOR_MISS;

      // On first load, skip animation, just place immediately
      if (isFirstRender) {
        spawnPegMesh(position, color, key);
      } else {
        // Trigger missile strike animation then spawn peg
        // Determine starting position (high above the opposite board)
        const startPos = getGridCellMesh(shot.x, shot.y, -boardOffsetX).position.clone();
        startPos.y = 1.0;
        
        playMissileStrikeAnimation(startPos, position, shot.hit, () => {
          spawnPegMesh(position, color, key);
        });
      }
    }
  });
  
  if (isFirstRender && shots.length > 0) {
    isFirstRender = false;
  }
}

// Spawn static marker peg (sphere + cylinder glow)
function spawnPegMesh(position, color, key) {
  const pegGroup = new THREE.Group();
  
  const cylinderGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8);
  const cylinderMat = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.1,
    metalness: 0.9,
    emissive: color,
    emissiveIntensity: 0.4
  });
  const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
  pegGroup.add(cylinder);

  const sphereGeo = new THREE.SphereGeometry(0.18, 12, 12);
  const sphereMat = new THREE.MeshBasicMaterial({ color: color });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  sphere.position.y = 0.25;
  pegGroup.add(sphere);

  pegGroup.position.copy(position);
  scene.add(pegGroup);

  // Glow halo ring at the water surface
  const ringGeo = new THREE.RingGeometry(0.15, 0.35, 16);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = -0.15;
  pegGroup.add(ring);

  markerMeshes.push({ key, mesh: pegGroup });
}

// Play Missile Strike Animation (Arc curve + particles)
function playMissileStrikeAnimation(startPos, targetPos, isHit, onComplete) {
  // Create missile cylinder mesh
  const missileGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8);
  missileGeo.rotateX(Math.PI / 2);
  const missileMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
  const missile = new THREE.Mesh(missileGeo, missileMat);
  
  missile.position.copy(startPos);
  scene.add(missile);

  // Bezier curve calculations for realistic arc flight path
  const midPos = new THREE.Vector3().addVectors(startPos, targetPos).multiplyScalar(0.5);
  midPos.y += 8.0; // peak height of arc

  const startTime = Date.now();
  const duration = 1200; // 1.2 seconds flight

  // Spark trail particles emitter
  const particleSystem = createParticleTrailSystem();

  activeAnimations.push((t) => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Quadratic Bezier interpolation
    const q1 = new THREE.Vector3().lerpVectors(startPos, midPos, progress);
    const q2 = new THREE.Vector3().lerpVectors(midPos, targetPos, progress);
    const currentPos = new THREE.Vector3().lerpVectors(q1, q2, progress);

    // Calculate heading direction
    const nextProgress = Math.min((elapsed + 16) / duration, 1);
    const nq1 = new THREE.Vector3().lerpVectors(startPos, midPos, nextProgress);
    const nq2 = new THREE.Vector3().lerpVectors(midPos, targetPos, nextProgress);
    const nextPos = new THREE.Vector3().lerpVectors(nq1, nq2, nextProgress);
    
    missile.position.copy(currentPos);
    missile.lookAt(nextPos);

    // Spawn trail particles
    emitTrailParticle(particleSystem, currentPos);

    if (progress >= 1) {
      // Impact!
      scene.remove(missile);
      scene.remove(particleSystem);

      if (isHit) {
        playExplosionEffect(targetPos);
      } else {
        playSplashEffect(targetPos);
      }

      if (onComplete) onComplete();
      return true; // end animation
    }
    return false;
  });
}

function createParticleTrailSystem() {
  const count = 100;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const opacities = new Float32Array(count);
  const sizes = new Float32Array(count);

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

  // Canvas texture for circular particles
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(8,8,0, 8,8,8);
  gradient.addColorStop(0, 'rgba(255,200,50,1)');
  gradient.addColorStop(1, 'rgba(255,50,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0,0,16,16);

  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  const material = new THREE.PointsMaterial({
    size: 0.35,
    map: texture,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  points.userData = {
    index: 0,
    positions: positions,
    opacities: opacities,
    count: count
  };

  return points;
}

function emitTrailParticle(system, position) {
  const data = system.userData;
  const index = data.index;
  const posArr = data.positions;
  const opArr = data.opacities;

  // Add new particle
  posArr[index * 3] = position.x + (Math.random() - 0.5) * 0.1;
  posArr[index * 3 + 1] = position.y + (Math.random() - 0.5) * 0.1;
  posArr[index * 3 + 2] = position.z + (Math.random() - 0.5) * 0.1;
  opArr[index] = 1.0; // full opacity

  // Slowly fade all existing particles
  for (let i = 0; i < data.count; i++) {
    if (opArr[i] > 0) {
      opArr[i] -= 0.05;
      if (opArr[i] < 0) opArr[i] = 0;
    }
  }

  system.geometry.attributes.position.needsUpdate = true;
  system.geometry.attributes.opacity.needsUpdate = true;

  data.index = (index + 1) % data.count;
}

// Particle Explosion (Hit effect)
function playExplosionEffect(position) {
  const particleCount = 45;
  const group = new THREE.Group();
  scene.add(group);

  const geometry = new THREE.SphereGeometry(0.12, 6, 6);
  const material = new THREE.MeshBasicMaterial({
    color: 0xff5500,
    transparent: true,
    opacity: 1.0
  });

  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    const mesh = new THREE.Mesh(geometry, material.clone());
    mesh.position.copy(position);
    
    // Random velocity
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 6.0,
      Math.random() * 5.0 + 2.0,
      (Math.random() - 0.5) * 6.0
    );
    
    group.add(mesh);
    particles.push({ mesh, velocity });
  }

  // Shockwave expansion sphere
  const waveGeo = new THREE.SphereGeometry(0.2, 16, 16);
  const waveMat = new THREE.MeshBasicMaterial({
    color: 0xffdd88,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });
  const shockwave = new THREE.Mesh(waveGeo, waveMat);
  shockwave.position.copy(position);
  scene.add(shockwave);

  const startTime = Date.now();
  const duration = 1000; // 1s duration

  activeAnimations.push((t) => {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / duration;

    // Expand shockwave
    shockwave.scale.setScalar(1.0 + progress * 15.0);
    shockwave.material.opacity = 0.8 * (1.0 - progress);

    // Animate particles
    particles.forEach(p => {
      // Gravity physics
      p.velocity.y -= 0.15; 
      p.mesh.position.addScaledVector(p.velocity, 0.016);
      p.mesh.material.opacity = 1.0 - progress;
      
      // Color shift orange -> dark gray
      p.mesh.material.color.lerp(new THREE.Color(0x333333), progress * 0.8);
    });

    if (progress >= 1) {
      scene.remove(group);
      scene.remove(shockwave);
      return true;
    }
    return false;
  });
}

// Particle Splash (Miss effect)
function playSplashEffect(position) {
  const particleCount = 25;
  const group = new THREE.Group();
  scene.add(group);

  const geometry = new THREE.CylinderGeometry(0.02, 0.04, 0.3, 4);
  const material = new THREE.MeshStandardMaterial({
    color: 0x66ccff,
    roughness: 0.1,
    transparent: true,
    opacity: 0.8
  });

  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    const mesh = new THREE.Mesh(geometry, material.clone());
    mesh.position.copy(position);
    mesh.position.y += 0.1;
    
    // Radial fountain velocity
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 1.5 + 0.5;
    const velocity = new THREE.Vector3(
      Math.cos(angle) * speed,
      Math.random() * 5.0 + 3.0,
      Math.sin(angle) * speed
    );
    
    mesh.lookAt(mesh.position.clone().add(velocity));
    group.add(mesh);
    particles.push({ mesh, velocity });
  }

  // Ripple mesh
  const rippleGeo = new THREE.RingGeometry(0.1, 0.4, 24);
  rippleGeo.rotateX(-Math.PI / 2);
  const rippleMat = new THREE.MeshBasicMaterial({
    color: 0x88ddff,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
  });
  const ripple = new THREE.Mesh(rippleGeo, rippleMat);
  ripple.position.copy(position);
  ripple.position.y = -0.12;
  scene.add(ripple);

  const startTime = Date.now();
  const duration = 900;

  activeAnimations.push((t) => {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / duration;

    // Expand ripple
    ripple.scale.setScalar(1.0 + progress * 8.0);
    ripple.material.opacity = 0.7 * (1.0 - progress);

    particles.forEach(p => {
      p.velocity.y -= 0.18; // gravity
      p.mesh.position.addScaledVector(p.velocity, 0.016);
      p.mesh.lookAt(p.mesh.position.clone().add(p.velocity));
      p.mesh.material.opacity = 0.8 * (1.0 - progress);
    });

    if (progress >= 1) {
      scene.remove(group);
      scene.remove(ripple);
      return true;
    }
    return false;
  });
}

// Client action: fire coordinate to server
async function fireShotAtOpponent(x, y) {
  // Prevent shooting if animations are active
  if (activeAnimations.length > 0) return;

  // Optimistic turn check
  if (currentRoomState.turn !== myId) return;

  try {
    const res = await fetch('/api/battleship/shoot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, playerId: myId, x, y })
    });
    const data = await res.json();
    if (data.error) return alert(data.error);

    // Local trigger of hit/miss notifications
    if (data.hit) {
      if (data.sunkShip) {
        addLogMessage('System', `타격 성공! 적의 ${data.sunkShip}을(를) 침몰시켰습니다!`);
      } else {
        addLogMessage('System', `타격 성공! 적 함선을 타격했습니다. 한 번 더 공격합니다!`);
      }
    } else {
      addLogMessage('System', `빗나갔습니다. 턴이 넘어갑니다.`);
    }

    // Force rendering update through SSE stream sync
  } catch (err) {
    console.error('Failed to fire shot');
  }
}

function rebuild3DGrids(newGridSize) {
  if (GRID_SIZE === newGridSize && boardGroups.length > 0) return;
  
  // Clear old grid helpers and labels
  boardGroups.forEach(group => {
    scene.remove(group);
    group.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  });
  boardGroups = [];

  boardLabelMeshes.forEach(mesh => {
    scene.remove(mesh);
    if (mesh.material) {
      if (mesh.material.map) mesh.material.map.dispose();
      mesh.material.dispose();
    }
  });
  boardLabelMeshes = [];

  // Update global GRID_SIZE
  GRID_SIZE = newGridSize;

  // Re-create Grids
  playerGridCells.length = 0;
  opponentGridCells.length = 0;
  createBoardGrid(-BOARD_OFFSET_X, playerGridCells, COLOR_ALLY);
  createBoardGrid(BOARD_OFFSET_X, opponentGridCells, COLOR_ENEMY);

  // Re-create Labels
  createGridLabel('MY FLEET', -BOARD_OFFSET_X, 0x888888);
  createGridLabel('OPPONENT', BOARD_OFFSET_X, 0x888888);
}

