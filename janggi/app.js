// CineAHO Janggi Game Logic Engine

// Canvas 및 Context 설정
const canvas = document.getElementById('janggi-canvas');
const ctx = canvas.getContext('2d');

// 게임 설정 & 상태 변수들
let board = [];
let turn = 'cho'; // 초(楚, 빨강, 플레이어) 선공으로 시작
let selectedPiece = null; // {x, y}
let highlights = []; // [{x, y}, ...]
let moveHistory = []; // 무르기(Undo)용 스택
let gameActive = false;
let gamePaused = false;
let soundOn = true;
let gameMode = 'pve'; // pve (사람 vs AI), pvp (사람 vs 사람), eve (AI vs AI)
let aiLevel = 3;
let coordsEnabled = true;
let currentTheme = 'classic';

// 통계 데이터
let timerInterval = null;
let timerSeconds = 0;
let totalMoves = 0;
let checkCount = { cho: 0, han: 0 };
let turnStartTime = Date.now();
let moveTimes = { cho: [], han: [] };

// 기물 상세 점수 정의
const PIECE_VALUES = {
  'K': 0,    // 왕 (점수 없음, 외통수로 종료)
  'R': 13,   // 차 (車)
  'P': 7,    // 포 (包)
  'H': 5,    // 마 (馬)
  'E': 3,    // 상 (象)
  'G': 3,    // 사 (仕)
  'S': 2     // 졸/병 (卒/兵)
};

// 한국 장기 기물 한글/한자 이름 매핑
const PIECE_NAMES = {
  'cho': { 'K': '楚', 'R': '車', 'P': '包', 'H': '馬', 'E': '象', 'G': '仕', 'S': '卒' },
  'han': { 'K': '漢', 'R': '車', 'P': '包', 'H': '馬', 'E': '象', 'G': '仕', 'S': '兵' }
};

// Canvas 레이아웃 상수
const PADDING = 50;
const BOARD_WIDTH = canvas.width - PADDING * 2;
const BOARD_HEIGHT = canvas.height - PADDING * 2;
const CELL_W = BOARD_WIDTH / 8;  // 가로 9줄 -> 8칸
const CELL_H = BOARD_HEIGHT / 9; // 세로 10줄 -> 9칸

// 오디오 컨텍스트 및 사운드 효과 생성
let audioCtx = null;
function playSound(type) {
  if (!soundOn) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'move') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } else if (type === 'capture') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, audioCtx.currentTime);
      osc.frequency.setValueAtTime(600, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } else if (type === 'check') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, audioCtx.currentTime);
      osc.frequency.setValueAtTime(220, audioCtx.currentTime + 0.1);
      osc.frequency.setValueAtTime(280, audioCtx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } else if (type === 'win') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3); // G5
      osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.45); // C6
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    }
  } catch (e) {
    console.error('사운드 재생 에러:', e);
  }
}

// 초기 보드 세팅 (귀마 대 귀마 표준 차림)
function initBoard() {
  board = Array(10).fill(null).map(() => Array(9).fill(null));

  // 한(漢, 파랑, 상단) 기물 배치 (Y=0~3)
  board[0][0] = { type: 'R', camp: 'han' }; // 차
  board[0][1] = { type: 'E', camp: 'han' }; // 상
  board[0][2] = { type: 'H', camp: 'han' }; // 마
  board[0][3] = { type: 'G', camp: 'han' }; // 사
  board[0][5] = { type: 'G', camp: 'han' }; // 사
  board[0][6] = { type: 'H', camp: 'han' }; // 마
  board[0][7] = { type: 'E', camp: 'han' }; // 상
  board[0][8] = { type: 'R', camp: 'han' }; // 차
  board[1][4] = { type: 'K', camp: 'han' }; // 왕
  board[2][1] = { type: 'P', camp: 'han' }; // 포
  board[2][7] = { type: 'P', camp: 'han' }; // 포
  for (let x = 0; x < 9; x += 2) {
    board[3][x] = { type: 'S', camp: 'han' }; // 병
  }

  // 초(楚, 빨강, 하단) 기물 배치 (Y=6~9)
  for (let x = 0; x < 9; x += 2) {
    board[6][x] = { type: 'S', camp: 'cho' }; // 졸
  }
  board[7][1] = { type: 'P', camp: 'cho' }; // 포
  board[7][7] = { type: 'P', camp: 'cho' }; // 포
  board[8][4] = { type: 'K', camp: 'cho' }; // 왕
  board[9][0] = { type: 'R', camp: 'cho' }; // 차
  board[9][1] = { type: 'E', camp: 'cho' }; // 상
  board[9][2] = { type: 'H', camp: 'cho' }; // 마
  board[9][3] = { type: 'G', camp: 'cho' }; // 사
  board[9][5] = { type: 'G', camp: 'cho' }; // 사
  board[9][6] = { type: 'H', camp: 'cho' }; // 마
  board[9][7] = { type: 'E', camp: 'cho' }; // 상
  board[9][8] = { type: 'R', camp: 'cho' }; // 차
}

// 좌표 검사 헬퍼
function isValid(x, y) {
  return x >= 0 && x < 9 && y >= 0 && y < 10;
}

// 궁성 범위 판정 (한: Y 0~2 / 초: Y 7~9, X 3~5)
function inPalace(x, y, camp) {
  if (x < 3 || x > 5) return false;
  if (camp === 'han' || y <= 2) {
    return y >= 0 && y <= 2;
  }
  if (camp === 'cho' || y >= 7) {
    return y >= 7 && y <= 9;
  }
  return false;
}

// 깊은 복사 (보드 상태 복제)
function cloneBoard(b) {
  return b.map(row => row.map(cell => cell ? { ...cell } : null));
}

// 특정 기물의 원시 이동 범위 탐색 (장군 위험성 무시)
function getPieceMoves(b, x, y) {
  const piece = b[y][x];
  if (!piece) return [];
  const moves = [];
  const camp = piece.camp;

  // 1. 왕(K) / 사(G)의 이동 규칙 (궁성 내부에서만 1칸씩)
  if (piece.type === 'K' || piece.type === 'G') {
    const isHanPalace = (y <= 2);
    const palaceYMin = isHanPalace ? 0 : 7;
    const palaceYMax = isHanPalace ? 2 : 9;

    // 상하좌우 직선
    const directions = [
      [0, -1], [0, 1], [-1, 0], [1, 0]
    ];
    // 대각선 (궁성 네 모서리 및 중앙에서만 활성화)
    const isCornerOrCenter = (
      (x === 3 && (y === palaceYMin || y === palaceYMax)) ||
      (x === 5 && (y === palaceYMin || y === palaceYMax)) ||
      (x === 4 && y === palaceYMin + 1)
    );

    if (isCornerOrCenter) {
      directions.push([-1, -1], [1, -1], [-1, 1], [1, 1]);
    }

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 3 && nx <= 5 && ny >= palaceYMin && ny <= palaceYMax) {
        // 궁성 대각선 방향 이동 시 실제로 대각선 선이 있는지 확인
        if (Math.abs(dx) === 1 && Math.abs(dy) === 1) {
          // 중앙(4, center)에서는 4개 모서리 모두 이동 가능
          // 모서리에서는 중앙으로만 이동 가능
          const isCenter = (nx === 4 && ny === palaceYMin + 1) || (x === 4 && y === palaceYMin + 1);
          if (!isCenter) continue;
        }
        const target = b[ny][nx];
        if (!target || target.camp !== camp) {
          moves.push({ x: nx, y: ny });
        }
      }
    }
  }

  // 2. 졸/병(S)의 이동 규칙 (전진 및 좌우 1칸, 뒤로는 못 감)
  else if (piece.type === 'S') {
    const forwardY = (camp === 'cho') ? -1 : 1; // 초는 위로(-1), 한은 아래로(+1)
    const candidates = [
      [x, y + forwardY],    // 앞
      [x - 1, y],           // 좌
      [x + 1, y]            // 우
    ];
    for (const [nx, ny] of candidates) {
      if (isValid(nx, ny)) {
        const target = b[ny][nx];
        if (!target || target.camp !== camp) {
          moves.push({ x: nx, y: ny });
        }
      }
    }
    // 상대 궁성 내 대각선 이동
    const oppPalaceYMin = (camp === 'cho') ? 0 : 7;
    const oppPalaceYMax = (camp === 'cho') ? 2 : 9;
    if (x >= 3 && x <= 5 && y >= oppPalaceYMin && y <= oppPalaceYMax) {
      // 대각선 전진 방향 정의
      const diagMoves = [];
      if (camp === 'cho') { // 초(卒)는 Y=2 -> Y=1 -> Y=0 방향으로만 대각선 전진
        if (x === 3 && y === 2) diagMoves.push({ x: 4, y: 1 });
        if (x === 5 && y === 2) diagMoves.push({ x: 4, y: 1 });
        if (x === 4 && y === 1) diagMoves.push({ x: 3, y: 0 }, { x: 5, y: 0 });
      } else { // 한(兵)은 Y=7 -> Y=8 -> Y=9 방향으로만 대각선 전진
        if (x === 3 && y === 7) diagMoves.push({ x: 4, y: 8 });
        if (x === 5 && y === 7) diagMoves.push({ x: 4, y: 8 });
        if (x === 4 && y === 8) diagMoves.push({ x: 3, y: 9 }, { x: 5, y: 9 });
      }
      for (const m of diagMoves) {
        const target = b[m.y][m.x];
        if (!target || target.camp !== camp) {
          moves.push(m);
        }
      }
    }
  }

  // 3. 차(R)의 이동 규칙 (직선 무제한 및 궁성 내 대각선)
  else if (piece.type === 'R') {
    const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of directions) {
      let nx = x + dx;
      let ny = y + dy;
      while (isValid(nx, ny)) {
        const target = b[ny][nx];
        if (!target) {
          moves.push({ x: nx, y: ny });
        } else {
          if (target.camp !== camp) {
            moves.push({ x: nx, y: ny });
          }
          break; // 장애물 만남
        }
        nx += dx;
        ny += dy;
      }
    }

    // 궁성 내부 대각선 행마
    const isPalace = inPalace(x, y, camp === 'cho' ? 'han' : 'cho') || inPalace(x, y, camp);
    if (isPalace) {
      const palaceYMin = y <= 2 ? 0 : 7;
      // 대각선 전 방향 체크
      const checkDiag = (path) => {
        let prev = { x, y };
        for (const pt of path) {
          const target = b[pt.y][pt.x];
          if (!target) {
            moves.push(pt);
          } else {
            if (target.camp !== camp) {
              moves.push(pt);
            }
            break;
          }
        }
      };

      if (x === 3 && y === palaceYMin) checkDiag([{ x: 4, y: palaceYMin + 1 }, { x: 5, y: palaceYMin + 2 }]);
      if (x === 5 && y === palaceYMin) checkDiag([{ x: 4, y: palaceYMin + 1 }, { x: 3, y: palaceYMin + 2 }]);
      if (x === 3 && y === palaceYMin + 2) checkDiag([{ x: 4, y: palaceYMin + 1 }, { x: 5, y: palaceYMin }]);
      if (x === 5 && y === palaceYMin + 2) checkDiag([{ x: 4, y: palaceYMin + 1 }, { x: 3, y: palaceYMin }]);
      if (x === 4 && y === palaceYMin + 1) {
        checkDiag([{ x: 3, y: palaceYMin }]);
        checkDiag([{ x: 5, y: palaceYMin }]);
        checkDiag([{ x: 3, y: palaceYMin + 2 }]);
        checkDiag([{ x: 5, y: palaceYMin + 2 }]);
      }
    }
  }

  // 4. 포(P)의 이동 규칙 (반드시 기물 하나를 뛰어넘음, 포끼리 넘기/잡기 금지)
  else if (piece.type === 'P') {
    const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of directions) {
      let nx = x + dx;
      let ny = y + dy;
      let bridgeFound = false;

      while (isValid(nx, ny)) {
        const target = b[ny][nx];
        if (!bridgeFound) {
          if (target) {
            if (target.type === 'P') break; // 포는 다리가 될 수 없음
            bridgeFound = true; // 다리 확보
          }
        } else {
          // 다리를 건넌 후
          if (!target) {
            moves.push({ x: nx, y: ny });
          } else {
            if (target.camp !== camp && target.type !== 'P') {
              moves.push({ x: nx, y: ny }); // 포가 아닌 상대 기물 포획 가능
            }
            break; // 다리 건넌 후 첫 기물 만나면 정지
          }
        }
        nx += dx;
        ny += dy;
      }
    }

    // 궁성 대각선 포뛰기 규칙
    const isPalace = inPalace(x, y, camp === 'cho' ? 'han' : 'cho') || inPalace(x, y, camp);
    if (isPalace) {
      const palaceYMin = y <= 2 ? 0 : 7;
      const getDiagTarget = (bx, by, tx, ty) => {
        const bridge = b[palaceYMin + 1][4]; // 궁성 정중앙
        const target = b[ty][tx];
        if (bridge && bridge.type !== 'P') {
          if (!target || (target.camp !== camp && target.type !== 'P')) {
            moves.push({ x: tx, y: ty });
          }
        }
      };

      if (x === 3 && y === palaceYMin) getDiagTarget(3, palaceYMin, 5, palaceYMin + 2);
      if (x === 5 && y === palaceYMin) getDiagTarget(5, palaceYMin, 3, palaceYMin + 2);
      if (x === 3 && y === palaceYMin + 2) getDiagTarget(3, palaceYMin + 2, 5, palaceYMin);
      if (x === 5 && y === palaceYMin + 2) getDiagTarget(5, palaceYMin + 2, 3, palaceYMin);
    }
  }

  // 5. 마(馬)의 이동 규칙 (날일자, 멱 판정 포함)
  else if (piece.type === 'H') {
    const horseMoves = [
      { target: { x: x + 1, y: y - 2 }, block: { x: x, y: y - 1 } },
      { target: { x: x - 1, y: y - 2 }, block: { x: x, y: y - 1 } },
      { target: { x: x + 1, y: y + 2 }, block: { x: x, y: y + 1 } },
      { target: { x: x - 1, y: y + 2 }, block: { x: x, y: y + 1 } },
      { target: { x: x + 2, y: y - 1 }, block: { x: x + 1, y: y } },
      { target: { x: x + 2, y: y + 1 }, block: { x: x + 1, y: y } },
      { target: { x: x - 2, y: y - 1 }, block: { x: x - 1, y: y } },
      { target: { x: x - 2, y: y + 1 }, block: { x: x - 1, y: y } }
    ];

    for (const m of horseMoves) {
      if (isValid(m.target.x, m.target.y)) {
        // 멱(block)이 비어있는지 검사
        if (!b[m.block.y][m.block.x]) {
          const targetPiece = b[m.target.y][m.target.x];
          if (!targetPiece || targetPiece.camp !== camp) {
            moves.push(m.target);
          }
        }
      }
    }
  }

  // 6. 상(象)의 이동 규칙 (쓸용자, 멱 2개 판정 포함)
  else if (piece.type === 'E') {
    const elephantMoves = [
      { target: { x: x + 2, y: y - 3 }, block1: { x: x, y: y - 1 }, block2: { x: x + 1, y: y - 2 } },
      { target: { x: x - 2, y: y - 3 }, block1: { x: x, y: y - 1 }, block2: { x: x - 1, y: y - 2 } },
      { target: { x: x + 2, y: y + 3 }, block1: { x: x, y: y + 1 }, block2: { x: x + 1, y: y + 2 } },
      { target: { x: x - 2, y: y + 3 }, block1: { x: x, y: y + 1 }, block2: { x: x - 1, y: y + 2 } },
      { target: { x: x + 3, y: y - 2 }, block1: { x: x + 1, y: y }, block2: { x: x + 2, y: y - 1 } },
      { target: { x: x + 3, y: y + 2 }, block1: { x: x + 1, y: y }, block2: { x: x + 2, y: y + 1 } },
      { target: { x: x - 3, y: y - 2 }, block1: { x: x - 1, y: y }, block2: { x: x - 2, y: y - 1 } },
      { target: { x: x - 3, y: y + 2 }, block1: { x: x - 1, y: y }, block2: { x: x - 2, y: y + 1 } }
    ];

    for (const m of elephantMoves) {
      if (isValid(m.target.x, m.target.y)) {
        // 두 개의 멱(block1, block2)이 모두 비어있는지 검사
        if (!b[m.block1.y][m.block1.x] && !b[m.block2.y][m.block2.x]) {
          const targetPiece = b[m.target.y][m.target.x];
          if (!targetPiece || targetPiece.camp !== camp) {
            moves.push(m.target);
          }
        }
      }
    }
  }

  return moves;
}

// 특정 진영의 왕 좌표 찾기
function findKing(b, camp) {
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      const piece = b[y][x];
      if (piece && piece.type === 'K' && piece.camp === camp) {
        return { x, y };
      }
    }
  }
  return null;
}

// 장군(Check) 판정: 특정 진영의 왕이 공격당하고 있는지 확인
function isKingInCheck(b, camp) {
  const kingPos = findKing(b, camp);
  if (!kingPos) return false;

  const opponentCamp = (camp === 'cho') ? 'han' : 'cho';
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      const piece = b[y][x];
      if (piece && piece.camp === opponentCamp) {
        const moves = getPieceMoves(b, x, y);
        if (moves.some(m => m.x === kingPos.x && m.y === kingPos.y)) {
          return true;
        }
      }
    }
  }
  return false;
}

// 합법적 이동 범위 계산 (자신의 왕이 장군이 되지 않는 수만 필터링)
function getLegalMoves(b, x, y) {
  const piece = b[y][x];
  if (!piece) return [];

  const rawMoves = getPieceMoves(b, x, y);
  const legalMoves = [];

  for (const m of rawMoves) {
    // 가상 이동 실행
    const nextBoard = cloneBoard(b);
    nextBoard[m.y][m.x] = nextBoard[y][x];
    nextBoard[y][x] = null;

    // 가상 이동 후 자신의 왕이 장군 상태가 아닌지 검사
    if (!isKingInCheck(nextBoard, piece.camp)) {
      legalMoves.push(m);
    }
  }

  return legalMoves;
}

// 현재 판 위에 존재하는 모든 합법적 수 리스트 구하기
function getAllLegalMoves(b, camp) {
  const allMoves = [];
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      const piece = b[y][x];
      if (piece && piece.camp === camp) {
        const moves = getLegalMoves(b, x, y);
        for (const m of moves) {
          allMoves.push({ from: { x, y }, to: m });
        }
      }
    }
  }
  return allMoves;
}

// 대국 초기화 및 시작
function startNewGame() {
  initBoard();
  turn = 'cho';
  selectedPiece = null;
  highlights = [];
  moveHistory = [];
  gameActive = true;
  gamePaused = false;
  totalMoves = 0;
  checkCount = { cho: 0, han: 0 };
  moveTimes = { cho: [], han: [] };
  
  // UI 갱신
  document.getElementById('move-count-text').innerText = '0';
  document.getElementById('check-count-text').innerText = '0 : 0';
  document.getElementById('avg-time-text').innerText = '0.0초';
  updateTurnBadge();
  updateScoresAndCaptured();
  
  // 타이머 작동
  resetTimer();
  
  // 무르기 버튼 비활성화
  document.getElementById('btn-undo').disabled = true;

  drawBoard();
  
  if (gameMode === 'eve') {
    setTimeout(makeAIMove, 600);
  }
}

// 타이머 제어
function resetTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerSeconds = 0;
  document.getElementById('timer-text').innerText = '00:00';
  turnStartTime = Date.now();

  timerInterval = setInterval(() => {
    if (!gamePaused && gameActive) {
      timerSeconds++;
      const mins = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
      const secs = String(timerSeconds % 60).padStart(2, '0');
      document.getElementById('timer-text').innerText = `${mins}:${secs}`;
    }
  }, 1000);
}

// 턴 표시 배지 업데이트
function updateTurnBadge() {
  const badge = document.getElementById('janggi-turn-badge');
  const dot = badge.querySelector('.badge-dot');
  const text = badge.querySelector('.badge-text');

  if (turn === 'cho') {
    dot.className = 'badge-dot dot-red';
    text.innerText = '초(楚) 차례 [빨간색]';
  } else {
    dot.className = 'badge-dot dot-blue';
    text.innerText = '한(漢) 차례 [파란색]';
  }
}

// 점수 및 포로 갱신
function updateScoresAndCaptured() {
  // 시작 시 기물 개수
  const START_COUNTS = { 'R': 2, 'P': 2, 'H': 2, 'E': 2, 'G': 2, 'S': 5 };
  
  // 현재 남아 있는 기물 수 카운트
  const currentCounts = {
    cho: { 'R': 0, 'P': 0, 'H': 0, 'E': 0, 'G': 0, 'S': 0 },
    han: { 'R': 0, 'P': 0, 'H': 0, 'E': 0, 'G': 0, 'S': 0 }
  };

  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      const piece = board[y][x];
      if (piece && piece.type !== 'K') {
        currentCounts[piece.camp][piece.type]++;
      }
    }
  }

  // 실시간 점수 합산 (덤 포함: 한 + 1.5점)
  let choScore = 0;
  let hanScore = 0;

  for (const type in PIECE_VALUES) {
    choScore += currentCounts.cho[type] * PIECE_VALUES[type];
    hanScore += currentCounts.han[type] * PIECE_VALUES[type];
  }
  hanScore += 1.5; // 덤 1.5점 가산

  document.getElementById('cho-total-score').innerText = `${choScore.toFixed(1)}점`;
  document.getElementById('han-total-score').innerText = `${hanScore.toFixed(1)}점`;

  // 점수 게이지 바 업데이트 (전체 145.5점 기준 비율 계산)
  const totalLimit = 145.5;
  const progressPercent = (hanScore / totalLimit) * 100;
  document.getElementById('score-balance-bar').style.width = `${progressPercent}%`;

  // 포로 목록 생성 (상대가 잃어버린 기물 목록)
  const capturedList = { cho: [], han: [] }; // cho 포로 = 한이 뺏은 초의 기물 / han 포로 = 초가 뺏은 한의 기물
  let choLostValue = 0;
  let hanLostValue = 0;

  for (const type of ['R', 'P', 'H', 'E', 'G', 'S']) {
    // 초가 잃은 기물 (한의 포로)
    const choLost = START_COUNTS[type] - currentCounts.cho[type];
    for (let i = 0; i < choLost; i++) {
      capturedList.cho.push(PIECE_NAMES.cho[type]);
      choLostValue += PIECE_VALUES[type];
    }

    // 한이 잃은 기물 (초의 포로)
    const hanLost = START_COUNTS[type] - currentCounts.han[type];
    for (let i = 0; i < hanLost; i++) {
      capturedList.han.push(PIECE_NAMES.han[type]);
      hanLostValue += PIECE_VALUES[type];
    }
  }

  // UI 포로 텍스트 출력
  document.getElementById('han-score').innerText = `${hanLostValue}점 획득`;
  document.getElementById('cho-score').innerText = `${choLostValue}점 획득`;

  document.getElementById('han-captured-list').innerText = capturedList.han.length > 0 ? capturedList.han.join(' ') : '없음';
  document.getElementById('cho-captured-list').innerText = capturedList.cho.length > 0 ? capturedList.cho.join(' ') : '없음';
}

// 무르기(Undo)용 대국 판 상태 저장
function saveState() {
  moveHistory.push({
    board: cloneBoard(board),
    turn,
    totalMoves,
    checkCount: { ...checkCount },
    moveTimes: {
      cho: [...moveTimes.cho],
      han: [...moveTimes.han]
    }
  });
  document.getElementById('btn-undo').disabled = false;
}

// 무르기 실행
function undoMove() {
  if (moveHistory.length === 0) return;
  
  // PVE 모드에서는 플레이어가 1번 물릴 때 AI의 직전 수도 같이 무르는 것이 자연스러움
  const rollbackCount = (gameMode === 'pve') ? 2 : 1;

  for (let i = 0; i < rollbackCount; i++) {
    if (moveHistory.length > 0) {
      const state = moveHistory.pop();
      board = state.board;
      turn = state.turn;
      totalMoves = state.totalMoves;
      checkCount = state.checkCount;
      moveTimes = state.moveTimes;
    }
  }

  selectedPiece = null;
  highlights = [];
  
  // UI 리드로우
  document.getElementById('move-count-text').innerText = totalMoves;
  document.getElementById('check-count-text').innerText = `${checkCount.cho} : ${checkCount.han}`;
  
  // 평균 시간 재산출
  recalcAvgMoveTime();

  updateTurnBadge();
  updateScoresAndCaptured();
  drawBoard();

  if (moveHistory.length === 0) {
    document.getElementById('btn-undo').disabled = true;
  }
  
  playSound('move');
}

// 평균 착수 소요 시간 갱신
function recalcAvgMoveTime() {
  const allTime = [...moveTimes.cho, ...moveTimes.han];
  if (allTime.length === 0) {
    document.getElementById('avg-time-text').innerText = '0.0초';
    return;
  }
  const sum = allTime.reduce((a, b) => a + b, 0);
  const avg = sum / allTime.length;
  document.getElementById('avg-time-text').innerText = `${(avg / 1000).toFixed(1)}초`;
}

// ----------------------------------------------------
// CANVAS DRAWING (장기판 및 기물 렌더링)
// ----------------------------------------------------

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 테마 배경
  if (currentTheme === 'classic') {
    ctx.fillStyle = '#dbb57b'; // 전통 따스한 목재 베이지
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 나무 질감 무늬 효과
    ctx.strokeStyle = 'rgba(139, 87, 42, 0.08)';
    ctx.lineWidth = 2;
    for (let i = 10; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + (Math.random() - 0.5) * 10, canvas.height);
      ctx.stroke();
    }
  } else if (currentTheme === 'neon') {
    ctx.fillStyle = '#060913'; // 네온 전용 딥 블랙 블루
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (currentTheme === 'minimal') {
    ctx.fillStyle = '#272a37'; // 차분한 그레이
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // 장기판 격자 선 색상
  let gridColor = 'rgba(0, 0, 0, 0.55)';
  let outerBorderColor = '#5c4015';
  if (currentTheme === 'neon') {
    gridColor = 'rgba(6, 182, 212, 0.25)'; // 글로잉 시안
    outerBorderColor = 'rgba(6, 182, 212, 0.8)';
  } else if (currentTheme === 'minimal') {
    gridColor = 'rgba(255, 255, 255, 0.15)';
    outerBorderColor = 'rgba(255, 255, 255, 0.3)';
  }

  // 1. 바깥 테두리 그리기
  ctx.strokeStyle = outerBorderColor;
  ctx.lineWidth = currentTheme === 'neon' ? 3 : 4;
  ctx.strokeRect(PADDING, PADDING, BOARD_WIDTH, BOARD_HEIGHT);

  // 2. 격자선 (가로 10개선, 세로 9개선) 그리기
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1.5;

  // 가로선
  for (let y = 0; y < 10; y++) {
    ctx.beginPath();
    ctx.moveTo(PADDING, PADDING + y * CELL_H);
    ctx.lineTo(PADDING + BOARD_WIDTH, PADDING + y * CELL_H);
    ctx.stroke();
  }

  // 세로선
  for (let x = 0; x < 9; x++) {
    ctx.beginPath();
    ctx.moveTo(PADDING + x * CELL_W, PADDING);
    ctx.lineTo(PADDING + x * CELL_W, PADDING + BOARD_HEIGHT);
    ctx.stroke();
  }

  // 3. 양 궁성 X 선 그리기
  const drawPalaceX = (yMin, yMax) => {
    ctx.beginPath();
    ctx.moveTo(PADDING + 3 * CELL_W, PADDING + yMin * CELL_H);
    ctx.lineTo(PADDING + 5 * CELL_W, PADDING + yMax * CELL_H);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(PADDING + 5 * CELL_W, PADDING + yMin * CELL_H);
    ctx.lineTo(PADDING + 3 * CELL_W, PADDING + yMax * CELL_H);
    ctx.stroke();
  };
  
  drawPalaceX(0, 2); // 한의 궁성
  drawPalaceX(7, 9); // 초의 궁성

  // 4. 좌표축 그리기 (옵션 활성화 시)
  if (coordsEnabled) {
    ctx.fillStyle = currentTheme === 'neon' ? 'rgba(6, 182, 212, 0.6)' : 'rgba(0, 0, 0, 0.45)';
    if (currentTheme === 'minimal') ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 가로 1 ~ 9 좌표 표시 (하단 및 상단 여백에 배치)
    for (let x = 0; x < 9; x++) {
      ctx.fillText(x + 1, PADDING + x * CELL_W, PADDING - 20);
      ctx.fillText(x + 1, PADDING + x * CELL_W, PADDING + BOARD_HEIGHT + 20);
    }

    // 세로 1 ~ 10 좌표 표시 (좌측 및 우측 여백에 배치)
    ctx.textAlign = 'right';
    for (let y = 0; y < 10; y++) {
      ctx.fillText(y + 1, PADDING - 15, PADDING + y * CELL_H);
    }
  }

  // 5. 기물 선택 시 하이라이트(이동 가능 범위) 렌더링
  if (selectedPiece && highlights.length > 0) {
    for (const h of highlights) {
      const cx = PADDING + h.x * CELL_W;
      const cy = PADDING + h.y * CELL_H;
      
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.45)'; // 세련된 초록 형광 하이라이트
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#10b981';
      ctx.stroke();
    }

    // 선택된 현재 기물 포커스 링
    const selX = PADDING + selectedPiece.x * CELL_W;
    const selY = PADDING + selectedPiece.y * CELL_H;
    ctx.beginPath();
    ctx.arc(selX, selY, 32, 0, Math.PI * 2);
    ctx.strokeStyle = '#fbbf24'; // 골드 서클
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // 6. 모든 장기 기물(Pieces) 렌더링
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      const piece = board[y][x];
      if (piece) {
        drawPiece(x, y, piece);
      }
    }
  }
}

// 낱개 기물 상세 그리기
function drawPiece(x, y, piece) {
  const cx = PADDING + x * CELL_W;
  const cy = PADDING + y * CELL_H;
  
  // 기물 등급별 크기 정의
  let radius = 24; // 기본 마, 상, 차, 포
  if (piece.type === 'K') radius = 29; // 궁(왕)
  if (piece.type === 'G' || piece.type === 'S') radius = 20; // 사, 졸/병

  ctx.save();

  // 그림자 효과 (입체감)
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;

  // 1. 기물 베이스 원형 그리기
  const baseGrad = ctx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, radius);
  
  if (currentTheme === 'classic') {
    // 둥근 3D 나무 디스크
    baseGrad.addColorStop(0, '#fbf0d9');
    baseGrad.addColorStop(0.7, '#e4ca99');
    baseGrad.addColorStop(1, '#c5a468');
    ctx.fillStyle = baseGrad;
    ctx.strokeStyle = '#856434';
    ctx.lineWidth = 2.5;
  } else if (currentTheme === 'neon') {
    // 반투명 미래형 테마
    baseGrad.addColorStop(0, '#101524');
    baseGrad.addColorStop(1, '#080b14');
    ctx.fillStyle = baseGrad;
    ctx.strokeStyle = piece.camp === 'cho' ? '#ef4444' : '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = piece.camp === 'cho' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(6, 182, 212, 0.4)';
  } else if (currentTheme === 'minimal') {
    // 미니멀
    if (piece.camp === 'cho') {
      baseGrad.addColorStop(0, '#4b5563');
      baseGrad.addColorStop(1, '#1f2937');
    } else {
      baseGrad.addColorStop(0, '#f9fafb');
      baseGrad.addColorStop(1, '#e5e7eb');
    }
    ctx.fillStyle = baseGrad;
    ctx.strokeStyle = piece.camp === 'cho' ? '#111827' : '#9ca3af';
    ctx.lineWidth = 2;
  }

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 그림자 무력화 후 내부 링/왕관 및 폰트 그리기
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 내부 기물 링 (클래식/네온용)
  if (currentTheme !== 'minimal') {
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 4, 0, Math.PI * 2);
    ctx.strokeStyle = currentTheme === 'neon' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 왕관 마크 렌더링 (궁/왕 전용)
  if (piece.type === 'K') {
    ctx.fillStyle = piece.camp === 'cho' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)';
    if (currentTheme === 'neon') {
      ctx.fillStyle = piece.camp === 'cho' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(6, 182, 212, 0.25)';
    }
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. 글씨 렌더링 (한자)
  let text = PIECE_NAMES[piece.camp][piece.type];
  
  // 폰트 크기 및 색상
  let fontSize = radius * 1.05;
  if (piece.type === 'K') fontSize = radius * 0.95; // 왕 글씨 스케일링
  
  ctx.font = `bold ${fontSize}px 'Noto Sans KR', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 글씨 색상
  if (currentTheme === 'classic') {
    ctx.fillStyle = piece.camp === 'cho' ? '#be123c' : '#1d4ed8'; // 고풍스러운 심홍색 / 감청색
  } else if (currentTheme === 'neon') {
    ctx.fillStyle = piece.camp === 'cho' ? '#ff4b4b' : '#38bdf8'; // 네온 하이 글로우 칼라
  } else if (currentTheme === 'minimal') {
    ctx.fillStyle = piece.camp === 'cho' ? '#ffffff' : '#111827';
  }

  ctx.fillText(text, cx, cy + (currentTheme === 'classic' ? 1.5 : 0.5));

  // 왕(궁)에 장식선 보강
  if (piece.type === 'K' && currentTheme === 'classic') {
    ctx.strokeStyle = piece.camp === 'cho' ? 'rgba(190, 18, 60, 0.3)' : 'rgba(29, 78, 216, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - 10, cy - 10, 20, 20);
  }

  ctx.restore();
}

// ----------------------------------------------------
// CLICK & INTERACTION 로직
// ----------------------------------------------------

canvas.addEventListener('click', (event) => {
  if (!gameActive || gamePaused) return;

  // AI 턴일 때 플레이어 클릭 대기 차단
  if (gameMode === 'pve' && turn === 'han') return;
  if (gameMode === 'eve') return;

  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  // 클릭 좌표를 9x10 교차점으로 계산 및 매핑
  const col = Math.round((clickX - PADDING) / CELL_W);
  const row = Math.round((clickY - PADDING) / CELL_H);

  // 클릭 유효 반경 체크 (스냅 성공 여부)
  const targetX = PADDING + col * CELL_W;
  const targetY = PADDING + row * CELL_H;
  const dist = Math.hypot(clickX - targetX, clickY - targetY);
  
  if (dist > Math.min(CELL_W, CELL_H) * 0.45) {
    // 너무 멀리 클릭했으면 해제
    return;
  }

  if (isValid(col, row)) {
    handleBoardClick(col, row);
  }
});

// 좌표 클릭 핸들러
function handleBoardClick(x, y) {
  const piece = board[y][x];

  // 1. 하이라이트된 위치를 클릭한 경우 -> 기물 이동 실행
  const movePos = highlights.find(h => h.x === x && h.y === y);
  if (selectedPiece && movePos) {
    executeMove(selectedPiece.x, selectedPiece.y, x, y);
    return;
  }

  // 2. 자신의 기물을 클릭한 경우 -> 선택 및 이동경로 하이라이트
  if (piece && piece.camp === turn) {
    selectedPiece = { x, y };
    highlights = getLegalMoves(board, x, y);
    drawBoard();
  } else {
    // 3. 빈 땅이나 상대 기물을 직접 클릭한 경우 -> 선택 취소
    selectedPiece = null;
    highlights = [];
    drawBoard();
  }
}

// 기물 이동 및 상태 갱신
function executeMove(fromX, fromY, toX, toY) {
  saveState();

  const activePiece = board[fromY][fromX];
  const targetPiece = board[toY][toX];

  // 착수 효과음 판별
  if (targetPiece) {
    playSound('capture');
  } else {
    playSound('move');
  }

  // 보드 배열 업데이트
  board[toY][toX] = activePiece;
  board[fromY][fromX] = null;

  // 착수 통계 누적
  totalMoves++;
  document.getElementById('move-count-text').innerText = totalMoves;

  // 소요 시간 통계
  const duration = Date.now() - turnStartTime;
  moveTimes[turn].push(duration);
  recalcAvgMoveTime();

  // 왕 제거(대국 종료) 판정
  if (targetPiece && targetPiece.type === 'K') {
    endGame(turn === 'cho' ? 'cho' : 'han', '외통수로 상대 궁을 격파했습니다.');
    return;
  }

  // 턴 전환
  turn = (turn === 'cho') ? 'han' : 'cho';
  updateTurnBadge();
  updateScoresAndCaptured();
  
  // 장군(Check) 판정
  if (isKingInCheck(board, turn)) {
    playSound('check');
    checkCount[turn === 'cho' ? 'han' : 'cho']++;
    document.getElementById('check-count-text').innerText = `${checkCount.cho} : ${checkCount.han}`;
    
    // 외통수(Checkmate) 인지 검사 (장군을 피할 수 있는 합법적 이동이 전혀 없으면 외통수)
    const nextMoves = getAllLegalMoves(board, turn);
    if (nextMoves.length === 0) {
      endGame(turn === 'cho' ? 'han' : 'cho', '더 이상 장군을 피할 수 없어 외통수에 빠졌습니다.');
      return;
    }
  } else {
    // 장군이 아니더라도 현재 차례 진영이 둘 수 있는 수가 없다면 한수쉼 또는 패배
    const nextMoves = getAllLegalMoves(board, turn);
    if (nextMoves.length === 0) {
      // 장기 룰상 기권패 처리
      endGame(turn === 'cho' ? 'han' : 'cho', '둘 수 있는 합법적 수가 없어 패배했습니다 (외통수).');
      return;
    }
  }

  // 선택 상태 해제 및 다시 그리기
  selectedPiece = null;
  highlights = [];
  drawBoard();

  // 차례 시작 시간 갱신
  turnStartTime = Date.now();

  // AI 턴 트리거
  if (gameActive) {
    if (gameMode === 'pve' && turn === 'han') {
      setTimeout(makeAIMove, 600); // 인간다운 인지 딜레이 부여
    } else if (gameMode === 'eve') {
      setTimeout(makeAIMove, 800);
    }
  }
}

// 대국 종료 처리
function endGame(winnerCamp, detailText) {
  gameActive = false;
  if (timerInterval) clearInterval(timerInterval);
  playSound('win');

  const modal = document.getElementById('janggi-winner-modal');
  const title = document.getElementById('win-title');
  const detail = document.getElementById('win-detail');

  const winnerName = winnerCamp === 'cho' ? '초(楚) 승리!' : '한(漢) 승리!';
  title.innerText = winnerName;
  title.className = winnerCamp === 'cho' ? 'text-red' : 'text-blue';
  detail.innerText = detailText;

  modal.classList.add('active');
}

// ----------------------------------------------------
// 휴리스틱 장기 AI 엔진
// ----------------------------------------------------

function makeAIMove() {
  if (!gameActive || gamePaused) return;

  const legalMoves = getAllLegalMoves(board, turn);
  if (legalMoves.length === 0) {
    // AI 패배 선언
    endGame(turn === 'cho' ? 'han' : 'cho', 'AI가 더 이상 둘 수 있는 수가 없어 기권합니다.');
    return;
  }

  let bestMove = null;

  // 난이도 분기 (1단계: 50%의 난수 실수 배치, 2~5단계: 휴리스틱 가중치 심도 탐색)
  const isRandomAct = (aiLevel === 1 && Math.random() < 0.45);

  if (isRandomAct) {
    // 무작위 착수
    bestMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
  } else {
    // 미니맥스 1-depth 혹은 2-depth 스캔 시작
    bestMove = searchBestMove(board, turn, aiLevel);
  }

  if (bestMove) {
    executeMove(bestMove.from.x, bestMove.from.y, bestMove.to.x, bestMove.to.y);
  }
}

// 최선의 수 탐색 (Alpha-Beta 2-depth Heuristic)
function searchBestMove(b, camp, level) {
  const moves = getAllLegalMoves(b, camp);
  if (moves.length === 0) return null;

  // 난이도별 검색 깊이 결정
  const depth = (level >= 4) ? 2 : 1; 

  let bestValue = (camp === 'han') ? -Infinity : Infinity;
  let bestCandidates = [];

  for (const m of moves) {
    const nextB = cloneBoard(b);
    nextB[m.to.y][m.to.x] = nextB[m.from.y][m.from.x];
    nextB[m.from.y][m.from.x] = null;

    let score = 0;
    if (depth === 2) {
      // 2-depth: 상대의 최선 대응 수 읽기
      const opponentCamp = (camp === 'cho') ? 'han' : 'cho';
      score = alphaBeta(nextB, 1, -Infinity, Infinity, false, opponentCamp);
    } else {
      // 1-depth
      score = evaluateBoard(nextB);
    }

    if (camp === 'han') {
      // 한(AI)은 점수 극대화 시도
      if (score > bestValue) {
        bestValue = score;
        bestCandidates = [m];
      } else if (score === bestValue) {
        bestCandidates.push(m);
      }
    } else {
      // 초는 점수 극소화 시도 (음수로 한과 경쟁)
      if (score < bestValue) {
        bestValue = score;
        bestCandidates = [m];
      } else if (score === bestValue) {
        bestCandidates.push(m);
      }
    }
  }

  // 후보군 중 랜덤 1선택 (기보의 획일성 방지)
  return bestCandidates[Math.floor(Math.random() * bestCandidates.length)];
}

// 알파베타 알고리즘 서브루틴
function alphaBeta(b, depth, alpha, beta, isMaximizing, camp) {
  if (depth === 0) {
    return evaluateBoard(b);
  }

  const moves = getAllLegalMoves(b, camp);
  if (moves.length === 0) {
    return isMaximizing ? -99999 : 99999;
  }

  const opponentCamp = (camp === 'cho') ? 'han' : 'cho';

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const m of moves) {
      const nextB = cloneBoard(b);
      nextB[m.to.y][m.to.x] = nextB[m.from.y][m.from.x];
      nextB[m.from.y][m.from.x] = null;
      const evalVal = alphaBeta(nextB, depth - 1, alpha, beta, false, opponentCamp);
      maxEval = Math.max(maxEval, evalVal);
      alpha = Math.max(alpha, evalVal);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const m of moves) {
      const nextB = cloneBoard(b);
      nextB[m.to.y][m.to.x] = nextB[m.from.y][m.from.x];
      nextB[m.from.y][m.from.x] = null;
      const evalVal = alphaBeta(nextB, depth - 1, alpha, beta, true, opponentCamp);
      minEval = Math.min(minEval, evalVal);
      beta = Math.min(beta, evalVal);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

// 판 형세 평가 함수 (Heuristic Evaluation)
// 한(漢) 기물은 양수(+), 초(楚) 기물은 음수(-)로 계산
function evaluateBoard(b) {
  let score = 0;

  // 기물 기본 정적 점수 (차=130, 포=70, 마=50, 상=30, 사=30, 졸/병=20)
  const SCALE_VALUES = { 'K': 10000, 'R': 130, 'P': 70, 'H': 50, 'E': 30, 'G': 30, 'S': 20 };

  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      const piece = b[y][x];
      if (piece) {
        let pieceVal = SCALE_VALUES[piece.type];
        
        // 위치별 포지션 보정 보너스 가중치 계산
        let posBonus = 0;
        
        if (piece.type === 'S') { // 졸/병: 전진할수록 가치 상승
          posBonus = (piece.camp === 'han') ? y * 1.5 : (9 - y) * 1.5;
        } else if (piece.type === 'H' || piece.type === 'E') { // 마/상: 구석보단 중앙 배치 시 활동성 증가
          const distToCenter = Math.abs(4 - x) + Math.abs(4.5 - y);
          posBonus = (6 - distToCenter) * 0.8;
        } else if (piece.type === 'K') { // 왕: 구석이 안전함
          const palaceY = (piece.camp === 'han') ? 1 : 8;
          if (x === 4 && y === palaceY) {
             posBonus = 5; // 궁성 중앙 사수 보너스
          }
        }

        const totalVal = pieceVal + posBonus;
        
        if (piece.camp === 'han') {
          score += totalVal;
        } else {
          score -= totalVal;
        }
      }
    }
  }

  // 덤 가산
  score += 1.5;

  return score;
}

// ----------------------------------------------------
// UI 이벤트 리스너 바인딩
// ----------------------------------------------------

// 게임 설정
document.getElementById('game-mode').addEventListener('change', (e) => {
  gameMode = e.target.value;
  startNewGame();
});

document.getElementById('ai-level-slider').addEventListener('input', (e) => {
  aiLevel = parseInt(e.target.value);
  document.getElementById('ai-level-val').innerText = aiLevel;
});

document.getElementById('chk-coords').addEventListener('change', (e) => {
  coordsEnabled = e.target.checked;
  drawBoard();
});

// 테마 변경
document.getElementById('board-theme').addEventListener('change', (e) => {
  currentTheme = e.target.value;
  drawBoard();
});

// 상단 제어 바 단추
document.getElementById('btn-start').addEventListener('click', () => {
  startNewGame();
});

document.getElementById('btn-pause').addEventListener('click', (e) => {
  if (!gameActive) return;
  gamePaused = !gamePaused;
  
  const icon = e.target.closest('button').querySelector('i');
  if (gamePaused) {
    icon.className = 'fa-solid fa-play';
    e.target.closest('button').title = '대국 재개';
  } else {
    icon.className = 'fa-solid fa-pause';
    e.target.closest('button').title = '일시 정지';
    turnStartTime = Date.now(); // 일시 정지 풀린 시점부터 턴 소요 시간 잼
  }
});

document.getElementById('btn-sound').addEventListener('click', (e) => {
  soundOn = !soundOn;
  const icon = e.target.closest('button').querySelector('i');
  if (soundOn) {
    icon.className = 'fa-solid fa-volume-high';
  } else {
    icon.className = 'fa-solid fa-volume-xmark';
  }
});

// 하단 툴바 제어단추
document.getElementById('btn-undo').addEventListener('click', () => {
  undoMove();
});

document.getElementById('btn-reset').addEventListener('click', () => {
  if (confirm('대국을 정말 초기화하고 처음부터 다시 시작하시겠습니까?')) {
    startNewGame();
  }
});

document.getElementById('btn-draw-claim').addEventListener('click', () => {
  if (!gameActive) return;
  // AI 대국 시 간단한 수락 판정 (점수차가 3점 이내일 경우 AI가 무승부 합의)
  const currentDiff = Math.abs(evaluateBoard(board));
  if (currentDiff <= 3.0) {
    alert('AI 엔진이 형세가 팽팽함을 인정하여 무승부 요청을 수락하였습니다.');
    endGame('draw', '상호 합의에 의해 무승부 처리되었습니다.');
  } else {
    alert('AI 엔진: "현재 국면은 무승부를 수락할 수 없습니다." (요청 거절)');
  }
});

document.getElementById('btn-resign').addEventListener('click', () => {
  if (!gameActive) return;
  if (confirm('정말로 기권하시겠습니까?')) {
    endGame(turn === 'cho' ? 'han' : 'cho', '대국자가 기권하였습니다.');
  }
});

// 승리 모달 닫기
document.getElementById('btn-win-close').addEventListener('click', () => {
  document.getElementById('janggi-winner-modal').classList.remove('active');
  drawBoard();
});

// 페이지 초기 로드 시 장기판을 미리 그리기 위해 준비
initBoard();
drawBoard();
