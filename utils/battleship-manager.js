const crypto = require('crypto');

// In-memory store for game rooms
// roomId -> roomState
const rooms = new Map();

// Helper: Generate a unique room ID (5-digit uppercase characters)
function generateRoomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id;
  do {
    id = '';
    for (let i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (rooms.has(id));
  return id;
}

// Helper: Generate a random ID
function generateId() {
  return crypto.randomBytes(8).toString('hex');
}

// SSE Connection registry
// roomId -> Map(playerId -> response)
const clients = new Map();

// Send SSE update to a specific player
function sendToPlayer(roomId, playerId, data) {
  const roomClients = clients.get(roomId);
  if (!roomClients) return;
  const res = roomClients.get(playerId);
  if (res) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
}

// Send SSE update to all players in a room, filtering private data
function broadcastRoomState(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  const playerIds = Object.keys(room.players);
  playerIds.forEach(playerId => {
    const filteredState = getFilteredState(room, playerId);
    sendToPlayer(roomId, playerId, {
      type: 'state_update',
      state: filteredState
    });
  });
}

// Cheat protection: filter out opponent ship locations unless they are sunk
function getFilteredState(room, playerId) {
  const playersData = {};
  const myData = room.players[playerId];
  let opponentId = null;

  Object.keys(room.players).forEach(id => {
    if (id !== playerId) {
      opponentId = id;
    }
  });

  const opponentData = opponentId ? room.players[opponentId] : null;

  // Filter opponent's ships. Only reveal ships that are completely sunk.
  let revealedOpponentShips = [];
  if (opponentData) {
    opponentData.ships.forEach(ship => {
      if (isShipSunk(ship, myData ? myData.shots : [])) {
        revealedOpponentShips.push(ship);
      }
    });

    playersData[opponentId] = {
      nickname: opponentData.nickname,
      ready: opponentData.ready,
      shots: opponentData.shots, // shots they fired at me
      ships: revealedOpponentShips, // only reveal sunk ships
      sunkCount: revealedOpponentShips.length,
      isConnected: clients.has(room.roomId) && clients.get(room.roomId).has(opponentId)
    };
  }

  if (myData) {
    playersData[playerId] = {
      nickname: myData.nickname,
      ready: myData.ready,
      shots: myData.shots, // shots I fired at opponent
      ships: myData.ships, // my ships (always visible to me)
      isConnected: true
    };
  }

  return {
    roomId: room.roomId,
    status: room.status,
    turn: room.turn,
    winner: room.winner,
    chat: room.chat,
    players: playersData,
    myId: playerId,
    opponentId: opponentId,
    myRole: room.players[playerId] ? (Object.keys(room.players)[0] === playerId ? 'player1' : 'player2') : null,
    gridSize: room.gridSize,
    aiLevel: room.aiLevel,
    shipsList: room.shipsList
  };
}

// Helper: Check if a specific ship is sunk
function isShipSunk(ship, shotsFired) {
  // A ship has coordinates from (x, y) extending ship.size horizontally or vertically
  for (let i = 0; i < ship.size; i++) {
    const cellX = ship.vertical ? ship.x : ship.x + i;
    const cellY = ship.vertical ? ship.y + i : ship.y;
    
    // Check if this cell has been hit
    const wasHit = shotsFired.some(shot => shot.x === cellX && shot.y === cellY && shot.hit);
    if (!wasHit) return false;
  }
  return true;
}

// Helper: Find which ship is at (x, y) if any
function getShipAt(ships, x, y) {
  for (const ship of ships) {
    for (let i = 0; i < ship.size; i++) {
      const cellX = ship.vertical ? ship.x : ship.x + i;
      const cellY = ship.vertical ? ship.y + i : ship.y;
      if (cellX === x && cellY === y) {
        return ship;
      }
    }
  }
  return null;
}

// Helper: Generate random ship placement for CPU
function generateRandomPlacement(shipsList, gridSize) {
  const placedShips = [];
  const occupied = new Set();

  for (const shipSpec of shipsList) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 1000) {
      attempts++;
      const vertical = Math.random() < 0.5;
      const x = vertical ? Math.floor(Math.random() * gridSize) : Math.floor(Math.random() * (gridSize - shipSpec.size + 1));
      const y = vertical ? Math.floor(Math.random() * (gridSize - shipSpec.size + 1)) : Math.floor(Math.random() * gridSize);

      const cells = [];
      let collision = false;

      for (let i = 0; i < shipSpec.size; i++) {
        const cx = vertical ? x : x + i;
        const cy = vertical ? y + i : y;
        const key = `${cx},${cy}`;

        if (cx < 0 || cx >= gridSize || cy < 0 || cy >= gridSize || occupied.has(key)) {
          collision = true;
          break;
        }
        cells.push({ x: cx, y: cy });
      }

      if (!collision) {
        cells.forEach(c => occupied.add(`${c.x},${c.y}`));
        placedShips.push({
          id: shipSpec.id,
          name: shipSpec.name,
          size: shipSpec.size,
          label: shipSpec.label,
          x,
          y,
          vertical,
          cells
        });
        placed = true;
      }
    }
  }

  return placedShips;
}

// Public API endpoints
const battleshipManager = {
  // Create Room
  createRoom: (req, res) => {
    const { nickname, isCpu, gridSize: reqGridSize, aiLevel: reqAiLevel, shipConfig } = req.body;
    if (!nickname) {
      return res.status(400).json({ error: '닉네임이 필요합니다.' });
    }

    const roomId = generateRoomId();
    const playerId = generateId();
    const isCpuGame = !!isCpu;

    // Parse and clamp configurations
    const gridSize = Math.max(8, Math.min(12, reqGridSize !== undefined ? parseInt(reqGridSize) : 10));
    const aiLevel = ['easy', 'normal', 'hard'].includes(reqAiLevel) ? reqAiLevel : 'normal';

    const shipSpecs = {
      carrier: { name: 'Carrier', size: 5, label: '항공모함' },
      battleship: { name: 'Battleship', size: 4, label: '전투함' },
      cruiser: { name: 'Cruiser', size: 3, label: '순양함' },
      submarine: { name: 'Submarine', size: 3, label: '잠수함' },
      destroyer: { name: 'Destroyer', size: 2, label: '구축함' }
    };

    const shipsList = [];
    const config = shipConfig || { carrier: 1, battleship: 1, cruiser: 1, submarine: 1, destroyer: 1 };
    
    for (const key of ['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer']) {
      const count = Math.max(0, Math.min(3, config[key] !== undefined ? parseInt(config[key]) : 1));
      for (let i = 0; i < count; i++) {
        shipsList.push({
          id: `${key}_${i}`,
          name: shipSpecs[key].name,
          size: shipSpecs[key].size,
          label: count > 1 ? `${shipSpecs[key].label} ${i + 1}` : shipSpecs[key].label
        });
      }
    }

    // Fallback: Ensure at least one ship
    if (shipsList.length === 0) {
      shipsList.push({ id: 'destroyer_0', name: 'Destroyer', size: 2, label: '구축함' });
    }

    const roomState = {
      roomId,
      status: isCpuGame ? 'PLACEMENT' : 'LOBBY',
      turn: null,
      winner: null,
      isCpu: isCpuGame,
      gridSize,
      aiLevel,
      shipsList,
      players: {
        [playerId]: {
          id: playerId,
          nickname,
          ready: false,
          ships: [],
          shots: [],
          lastActive: Date.now()
        }
      },
      chat: [
        { sender: 'System', text: `${nickname}님이 대기실을 생성했습니다.`, time: new Date().toLocaleTimeString('ko-KR') }
      ]
    };

    if (isCpuGame) {
      const cpuShips = generateRandomPlacement(shipsList, gridSize);
      roomState.players['cpu'] = {
        id: 'cpu',
        nickname: '인공지능 대장',
        ready: true,
        ships: cpuShips,
        shots: [],
        lastActive: Date.now()
      };
      roomState.chat.push({
        sender: 'System',
        text: `인공지능 대장이 참전했습니다! 함선을 배치해 주세요! (그리드: ${gridSize}x${gridSize}, AI 수준: ${aiLevel === 'easy' ? '초급' : aiLevel === 'normal' ? '중급' : '고급'})`,
        time: new Date().toLocaleTimeString('ko-KR')
      });
    }

    rooms.set(roomId, roomState);
    res.json({ roomId, playerId });
  },

  // Join Room
  joinRoom: (req, res) => {
    const { roomId, nickname } = req.body;
    if (!roomId || !nickname) {
      return res.status(400).json({ error: '방 코드와 닉네임이 필요합니다.' });
    }

    const upperRoomId = roomId.toUpperCase();
    const room = rooms.get(upperRoomId);

    if (!room) {
      return res.status(404).json({ error: '방을 찾을 수 없습니다.' });
    }

    const playerIds = Object.keys(room.players);
    if (playerIds.length >= 2) {
      return res.status(400).json({ error: '이미 방이 가득 찼습니다.' });
    }

    const playerId = generateId();
    room.players[playerId] = {
      id: playerId,
      nickname,
      ready: false,
      ships: [],
      shots: [],
      lastActive: Date.now()
    };

    room.status = 'PLACEMENT';
    room.chat.push({
      sender: 'System',
      text: `${nickname}님이 입장했습니다. 함선을 배치해 주세요!`,
      time: new Date().toLocaleTimeString('ko-KR')
    });

    // Notify existing player
    broadcastRoomState(upperRoomId);

    res.json({ roomId: upperRoomId, playerId });
  },

  // SSE Stream setup
  setupSSE: (req, res) => {
    const { roomId, playerId } = req.query;
    if (!roomId || !playerId) {
      return res.status(400).write('data: {"error": "Missing parameters"}\n\n');
    }

    const upperRoomId = roomId.toUpperCase();
    const room = rooms.get(upperRoomId);

    if (!room || !room.players[playerId]) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Room or Player not found');
    }

    // Keep connection alive
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // disable buffering for Nginx
    });
    res.write('\n');

    // Register client
    if (!clients.has(upperRoomId)) {
      clients.set(upperRoomId, new Map());
    }
    clients.get(upperRoomId).set(playerId, res);

    // Update connection status
    room.players[playerId].lastActive = Date.now();
    broadcastRoomState(upperRoomId);

    // Heartbeat to keep connection alive
    const heartbeat = setInterval(() => {
      res.write(':keepalive\n\n');
    }, 15000);

    req.on('close', () => {
      clearInterval(heartbeat);
      
      const roomClients = clients.get(upperRoomId);
      if (roomClients) {
        roomClients.delete(playerId);
        if (roomClients.size === 0) {
          clients.delete(upperRoomId);
        }
      }
      
      // We don't delete room immediately to allow brief reconnects,
      // but we notify the opponent that the connection was lost.
      const activeRoom = rooms.get(upperRoomId);
      if (activeRoom && activeRoom.players[playerId]) {
        broadcastRoomState(upperRoomId);
      }
    });
  },

  // Submit Ship Placement
  placeShips: (req, res) => {
    const { roomId, playerId, ships } = req.body;
    if (!roomId || !playerId || !ships) {
      return res.status(400).json({ error: '필수 파라미터가 누락되었습니다.' });
    }

    const upperRoomId = roomId.toUpperCase();
    const room = rooms.get(upperRoomId);

    if (!room) {
      return res.status(404).json({ error: '방을 찾을 수 없습니다.' });
    }

    const player = room.players[playerId];
    if (!player) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    // Validate placement matching room's shipsList specifications
    if (ships.length !== room.shipsList.length) {
      return res.status(400).json({ error: `정확히 ${room.shipsList.length}개의 함선을 배치해야 합니다.` });
    }

    const specsMap = {};
    room.shipsList.forEach(s => {
      specsMap[s.id] = s;
    });

    for (const ship of ships) {
      const spec = specsMap[ship.id];
      if (!spec) {
        return res.status(400).json({ error: `올바르지 않은 함선 ID입니다: ${ship.id}` });
      }
      if (ship.size !== spec.size || ship.name !== spec.name) {
        return res.status(400).json({ error: `함선 '${ship.name}'의 명세가 방 설정과 일치하지 않습니다.` });
      }

      // Check bounds
      const cells = [];
      for (let i = 0; i < ship.size; i++) {
        const x = ship.vertical ? ship.x : ship.x + i;
        const y = ship.vertical ? ship.y + i : ship.y;
        if (x < 0 || x >= room.gridSize || y < 0 || y >= room.gridSize) {
          return res.status(400).json({ error: '함선이 그리드 범위를 벗어났습니다.' });
        }
        cells.push({ x, y });
      }
      ship.cells = cells; // cache ship cells
    }

    // Check overlap
    const occupied = new Set();
    for (const ship of ships) {
      for (const cell of ship.cells) {
        const key = `${cell.x},${cell.y}`;
        if (occupied.has(key)) {
          return res.status(400).json({ error: '함선이 서로 겹칩니다.' });
        }
        occupied.add(key);
      }
    }

    player.ships = ships;
    player.ready = true;
    player.lastActive = Date.now();

    room.chat.push({
      sender: 'System',
      text: `${player.nickname}님이 준비를 마쳤습니다.`,
      time: new Date().toLocaleTimeString('ko-KR')
    });

    // Check if both ready
    const playerIds = Object.keys(room.players);
    const bothReady = playerIds.length === 2 && playerIds.every(id => room.players[id].ready);

    if (bothReady) {
      room.status = 'PLAYING';
      // Player 1 goes first (first one who created the room)
      room.turn = playerIds[0];
      room.chat.push({
        sender: 'System',
        text: `게임이 시작되었습니다! ${room.players[room.turn].nickname}님의 턴입니다.`,
        time: new Date().toLocaleTimeString('ko-KR')
      });
      
      broadcastRoomState(upperRoomId);
      res.json({ success: true, status: room.status });
      
      // Trigger CPU turn if applicable
      checkAndTriggerCpu(room);
    } else {
      broadcastRoomState(upperRoomId);
      res.json({ success: true, status: room.status });
    }
  },

  // Fire a shot
  shoot: (req, res) => {
    const { roomId, playerId, x, y } = req.body;
    if (!roomId || !playerId || x === undefined || y === undefined) {
      return res.status(400).json({ error: '필수 파라미터가 누락되었습니다.' });
    }

    const upperRoomId = roomId.toUpperCase();
    const room = rooms.get(upperRoomId);

    if (!room || room.status !== 'PLAYING') {
      return res.status(400).json({ error: '게임이 진행 중이 아닙니다.' });
    }

    if (room.turn !== playerId) {
      return res.status(400).json({ error: '당신의 턴이 아닙니다.' });
    }

    if (x < 0 || x >= room.gridSize || y < 0 || y >= room.gridSize) {
      return res.status(400).json({ error: '올바르지 않은 좌표입니다.' });
    }

    const player = room.players[playerId];
    // Find opponent
    const opponentId = Object.keys(room.players).find(id => id !== playerId);
    const opponent = room.players[opponentId];

    if (!opponent) {
      return res.status(400).json({ error: '상대방이 존재하지 않습니다.' });
    }

    // Check if already shot this cell
    const alreadyShot = player.shots.some(s => s.x === x && s.y === y);
    if (alreadyShot) {
      return res.status(400).json({ error: '이미 사격한 좌표입니다.' });
    }

    // Check hit
    const hitShip = getShipAt(opponent.ships, x, y);
    const hit = !!hitShip;
    let sunkShipName = null;

    if (hit) {
      // Record hit
      player.shots.push({ x, y, hit: true });
      
      // Check if ship is sunk
      const isSunk = isShipSunk(hitShip, player.shots);
      if (isSunk) {
        sunkShipName = hitShip.name;
        room.chat.push({
          sender: 'System',
          text: `💥 ${opponent.nickname}님의 ${hitShip.name}이(가) 침몰했습니다!`,
          time: new Date().toLocaleTimeString('ko-KR')
        });

        // Check win condition (all 5 ships sunk)
        const allSunk = opponent.ships.every(ship => isShipSunk(ship, player.shots));
        if (allSunk) {
          room.status = 'GAMEOVER';
          room.winner = playerId;
          room.chat.push({
            sender: 'System',
            text: `🎉 게임 종료! ${player.nickname}님이 최종 승리하였습니다!`,
            time: new Date().toLocaleTimeString('ko-KR')
          });
        }
      } else {
        room.chat.push({
          sender: 'System',
          text: `${player.nickname}님이 ${x + 1},${y + 1} 구역을 타격했습니다! (Hit)`,
          time: new Date().toLocaleTimeString('ko-KR')
        });
      }
      
      // In standard Battleship, hitting a ship grants another turn!
      // So room.turn stays as playerId.
    } else {
      // Record miss
      player.shots.push({ x, y, hit: false });
      
      room.chat.push({
        sender: 'System',
        text: `${player.nickname}님의 사격이 빗나갔습니다. (Miss)`,
        time: new Date().toLocaleTimeString('ko-KR')
      });

      // Switch turn
      room.turn = opponentId;
    }

    player.lastActive = Date.now();
    broadcastRoomState(upperRoomId);

    res.json({
      success: true,
      hit,
      sunkShip: sunkShipName,
      winner: room.winner,
      nextTurn: room.turn
    });

    // Trigger CPU turn if it is CPU's turn now
    checkAndTriggerCpu(room);
  },

  // Send a Chat Message
  chat: (req, res) => {
    const { roomId, playerId, text } = req.body;
    if (!roomId || !playerId || !text) {
      return res.status(400).json({ error: '메시지 전송 실패' });
    }

    const upperRoomId = roomId.toUpperCase();
    const room = rooms.get(upperRoomId);

    if (!room) {
      return res.status(404).json({ error: '방을 찾을 수 없습니다.' });
    }

    const player = room.players[playerId];
    if (!player) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    room.chat.push({
      sender: player.nickname,
      text: text.substring(0, 100), // length limit
      time: new Date().toLocaleTimeString('ko-KR')
    });

    broadcastRoomState(upperRoomId);
    res.json({ success: true });
  },

  // Exit Room
  exitRoom: (req, res) => {
    const { roomId, playerId } = req.body;
    if (!roomId || !playerId) {
      return res.status(400).json({ error: '필수 파라미터가 누락되었습니다.' });
    }

    const upperRoomId = roomId.toUpperCase();
    const room = rooms.get(upperRoomId);

    if (room) {
      const leavingPlayer = room.players[playerId];
      if (leavingPlayer) {
        room.chat.push({
          sender: 'System',
          text: `${leavingPlayer.nickname}님이 게임에서 퇴장했습니다.`,
          time: new Date().toLocaleTimeString('ko-KR')
        });

        delete room.players[playerId];

        // Close SSE connection
        const roomClients = clients.get(upperRoomId);
        if (roomClients) {
          const clientRes = roomClients.get(playerId);
          if (clientRes) {
            clientRes.end();
            roomClients.delete(playerId);
          }
        }

        const remainingPlayerIds = Object.keys(room.players);
        if (remainingPlayerIds.length === 0) {
          // Delete room if empty
          rooms.delete(upperRoomId);
          clients.delete(upperRoomId);
        } else {
          // Opponent wins automatically if game was playing
          if (room.status === 'PLAYING') {
            room.status = 'GAMEOVER';
            room.winner = remainingPlayerIds[0];
            room.chat.push({
              sender: 'System',
              text: `상대방 퇴장으로 인해 ${room.players[room.winner].nickname}님이 기권승했습니다!`,
              time: new Date().toLocaleTimeString('ko-KR')
            });
          } else {
            // Revert back to lobby
            room.status = 'LOBBY';
            // Reset player ready status
            remainingPlayerIds.forEach(id => {
              room.players[id].ready = false;
              room.players[id].ships = [];
              room.players[id].shots = [];
            });
          }
          broadcastRoomState(upperRoomId);
        }
      }
    }
    res.json({ success: true });
  },

  // Get active public rooms (lobby list)
  getActiveRooms: (req, res) => {
    const activeLobbies = [];
    rooms.forEach((room, id) => {
      const players = Object.values(room.players);
      // Only list rooms that have 1 player and are waiting in lobby
      if (room.status === 'LOBBY' && players.length === 1) {
        activeLobbies.push({
          roomId: id,
          hostNickname: players[0].nickname
        });
      }
    });
    res.json({ lobbies: activeLobbies });
  }
};

// Auto-cleanup: Delete rooms inactive for more than 2 hours
setInterval(() => {
  const now = Date.now();
  rooms.forEach((room, roomId) => {
    let inactive = true;
    Object.values(room.players).forEach(player => {
      if (now - player.lastActive < 2 * 60 * 60 * 1000) {
        inactive = false;
      }
    });

    if (inactive) {
      console.log(`[Battleship] Auto-cleaning inactive room: ${roomId}`);
      // Close SSE connections
      const roomClients = clients.get(roomId);
      if (roomClients) {
        roomClients.forEach(res => res.end());
        clients.delete(roomId);
      }
      rooms.delete(roomId);
    }
  });
}, 10 * 60 * 1000); // run every 10 minutes

// --- CPU Battle AI & Simulator Functions ---

function checkAndTriggerCpu(room) {
  if (room.isCpu && room.status === 'PLAYING' && room.turn === 'cpu' && !room.winner) {
    // Run CPU shooting after delay
    setTimeout(() => {
      const currentRoom = rooms.get(room.roomId);
      if (!currentRoom || currentRoom.status !== 'PLAYING' || currentRoom.turn !== 'cpu' || currentRoom.winner) {
        return;
      }
      executeCpuShot(currentRoom);
    }, 1500);
  }
}

function executeCpuShot(room) {
  const humanId = Object.keys(room.players).find(id => id !== 'cpu');
  const humanPlayer = room.players[humanId];
  const cpuPlayer = room.players['cpu'];

  if (!humanPlayer || !cpuPlayer) return;

  const target = selectCpuTarget(cpuPlayer.shots, humanPlayer.ships, room.gridSize, room.aiLevel);
  const { x, y } = target;

  const hitShip = getShipAt(humanPlayer.ships, x, y);
  const hit = !!hitShip;
  let sunkShipName = null;

  if (hit) {
    cpuPlayer.shots.push({ x, y, hit: true });
    const isSunk = isShipSunk(hitShip, cpuPlayer.shots);
    if (isSunk) {
      sunkShipName = hitShip.label || hitShip.name;
      room.chat.push({
        sender: 'System',
        text: `💥 인공지능이 당신의 ${sunkShipName}을(를) 침몰시켰습니다!`,
        time: new Date().toLocaleTimeString('ko-KR')
      });

      const allSunk = humanPlayer.ships.every(ship => isShipSunk(ship, cpuPlayer.shots));
      if (allSunk) {
        room.status = 'GAMEOVER';
        room.winner = 'cpu';
        room.chat.push({
          sender: 'System',
          text: `💀 게임 종료! 인공지능이 최종 승리하였습니다!`,
          time: new Date().toLocaleTimeString('ko-KR')
        });
      }
    } else {
      room.chat.push({
        sender: 'System',
        text: `인공지능이 (${x + 1}, ${y + 1}) 구역을 타격했습니다! (Hit)`,
        time: new Date().toLocaleTimeString('ko-KR')
      });
    }
  } else {
    cpuPlayer.shots.push({ x, y, hit: false });
    room.chat.push({
      sender: 'System',
      text: `인공지능의 사격이 빗나갔습니다. (Miss)`,
      time: new Date().toLocaleTimeString('ko-KR')
    });
    room.turn = humanId;
  }

  broadcastRoomState(room.roomId);

  if (hit && room.status === 'PLAYING') {
    checkAndTriggerCpu(room);
  }
}

function selectCpuTarget(shots, enemyShips, gridSize, aiLevel) {
  // 1. Easy Mode: Purely random
  if (aiLevel === 'easy') {
    return getRandomUnshotCell(shots, gridSize);
  }

  // 2. Normal Mode: 25% chance of random hunt shot even if targeting is active
  if (aiLevel === 'normal' && Math.random() < 0.25) {
    return getRandomUnshotCell(shots, gridSize);
  }

  // 3. Hard / Target Mode: Hunt-and-Target
  const hits = shots.filter(s => s.hit);
  const activeHits = [];
  
  hits.forEach(hit => {
    const hitShip = getShipAt(enemyShips, hit.x, hit.y);
    if (hitShip) {
      const isSunk = isShipSunk(hitShip, shots);
      if (!isSunk) {
        activeHits.push(hit);
      }
    }
  });

  if (activeHits.length > 0) {
    if (activeHits.length === 1) {
      const hit = activeHits[0];
      const neighbors = [
        { x: hit.x, y: hit.y - 1 },
        { x: hit.x, y: hit.y + 1 },
        { x: hit.x - 1, y: hit.y },
        { x: hit.x + 1, y: hit.y }
      ];

      const validNeighbors = neighbors.filter(n => 
        n.x >= 0 && n.x < gridSize && n.y >= 0 && n.y < gridSize &&
        !shots.some(s => s.x === n.x && s.y === n.y)
      );

      if (validNeighbors.length > 0) {
        return validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
      }
    } else {
      const isHorizontal = activeHits.every(h => h.y === activeHits[0].y);
      const isVertical = activeHits.every(h => h.x === activeHits[0].x);

      let candidates = [];
      if (isHorizontal) {
        const y = activeHits[0].y;
        const xs = activeHits.map(h => h.x);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);

        candidates.push({ x: minX - 1, y });
        candidates.push({ x: maxX + 1, y });
      } else if (isVertical) {
        const x = activeHits[0].x;
        const ys = activeHits.map(h => h.y);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        candidates.push({ x, y: minY - 1 });
        candidates.push({ x, y: maxY + 1 });
      }

      const validCandidates = candidates.filter(c => 
        c.x >= 0 && c.x < gridSize && c.y >= 0 && c.y < gridSize &&
        !shots.some(s => s.x === c.x && s.y === c.y)
      );

      if (validCandidates.length > 0) {
        return validCandidates[Math.floor(Math.random() * validCandidates.length)];
      }

      for (const hit of activeHits) {
        const neighbors = [
          { x: hit.x, y: hit.y - 1 },
          { x: hit.x, y: hit.y + 1 },
          { x: hit.x - 1, y: hit.y },
          { x: hit.x + 1, y: hit.y }
        ];
        const validN = neighbors.filter(n => 
          n.x >= 0 && n.x < gridSize && n.y >= 0 && n.y < gridSize &&
          !shots.some(s => s.x === n.x && s.y === n.y)
        );
        if (validN.length > 0) {
          return validN[Math.floor(Math.random() * validN.length)];
        }
      }
    }
  }

  // Hunt mode: Checkerboard Scanning
  const allTargets = [];
  const checkerboardTargets = [];

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const alreadyShot = shots.some(s => s.x === x && s.y === y);
      if (!alreadyShot) {
        allTargets.push({ x, y });
        if ((x + y) % 2 === 0) {
          checkerboardTargets.push({ x, y });
        }
      }
    }
  }

  if (checkerboardTargets.length > 0) {
    return checkerboardTargets[Math.floor(Math.random() * checkerboardTargets.length)];
  }
  return allTargets[Math.floor(Math.random() * allTargets.length)];
}

function getRandomUnshotCell(shots, gridSize) {
  const unshot = [];
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (!shots.some(s => s.x === x && s.y === y)) {
        unshot.push({ x, y });
      }
    }
  }
  if (unshot.length > 0) {
    return unshot[Math.floor(Math.random() * unshot.length)];
  }
  return { x: 0, y: 0 };
}

module.exports = battleshipManager;
