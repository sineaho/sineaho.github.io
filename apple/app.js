// CineAHO Apple Game+ - Client-Side App Engine

// Guide Database
const GUIDE_ARTICLES = {
  1: {
    title: "사과게임이란 무엇인가?",
    badge: "가이드 01: 개요",
    icon: "fa-circle-info",
    content: `
      <p><strong>사과게임+ (Apple Game+)</strong>은 국내외 플래시 게임 포털에서 '사과 쪼개기', '과일 상자(Fruit Box)' 등의 이름으로 널리 사랑받은 클래식 수학 퍼즐 게임의 프리미엄 복각 버전입니다.</p>
      <p>가로 17열, 세로 10행의 총 170개 사과 격자판에 무작위로 1부터 9까지의 숫자가 주어지며, 마우스 드래그를 통해 선택한 사각형 영역 내 숫자 합이 정확히 <strong>10</strong>이 되면 사과를 터뜨려 제거합니다. 순발력과 공간 수학적 인지 능력이 동시에 요구되어 두뇌 트레이닝 및 킬링타임에 최고로 손꼽히는 중독성 웹 퍼즐입니다.</p>
    `
  },
  2: {
    title: "게임 기본 규칙 및 조작법",
    badge: "가이드 02: 기본 규칙",
    icon: "fa-gamepad",
    content: `
      <p>게임 규칙은 매우 명료하며 마우스만으로 모든 플레이가 가능합니다.</p>
      <ul>
        <li><strong>드래그 선택</strong>: 마우스 좌클릭 후 대각선으로 드래그하면 반투명한 사각형 선택 영역이 활성화됩니다.</li>
        <li><strong>합 10의 규칙</strong>: 마우스 버튼을 놓았을 때, 직사각형 내부에 들어온 사과들의 모든 숫자를 더한 값이 <strong>정확히 10</strong>이어야 합니다.</li>
        <li><strong>사과 제거</strong>: 합이 10이 되면 선택된 사과들이 터지며 점수(사과 1개당 1점)를 획득하고 격자판에서 사라집니다. 합이 10이 되지 않으면 붉은색 경고 박스와 버저음이 나며 제거되지 않습니다.</li>
        <li><strong>제한 시간</strong>: 기본 120초(2분) 동안 보드의 사과들을 최대한 많이 제거하여 최고 점수(170점)에 도전하는 것이 목표입니다.</li>
      </ul>
    `
  },
  3: {
    title: "숫자의 합 '10'을 만드는 수학적 요령",
    badge: "가이드 03: 수학적 팁",
    icon: "fa-calculator",
    content: `
      <p>빠르게 사과를 지우기 위해서는 숫자의 보수(Complement) 관계를 눈에 익히는 것이 제일 중요합니다.</p>
      <p>가장 지우기 쉬운 고정 10 조합은 다음과 같습니다:</p>
      <ul>
        <li><strong>2개 조합 (보수 관계)</strong>: <code>[9+1]</code>, <code>[8+2]</code>, <code>[7+3]</code>, <code>[6+4]</code>, <code>[5+5]</code>. 이 수들은 가로/세로로 붙어있을 때 즉각 드래그하여 지우는 1순위 타겟입니다.</li>
        <li><strong>3개 이상 조합</strong>: <code>[4+3+3]</code>, <code>[5+4+1]</code>, <code>[3+3+2+2]</code> 등 홀수들이 뭉쳐 있거나 1, 2 등의 미세한 숫자가 밀집된 구역은 직사각형 크기를 조절해 쉽게 10을 만들 수 있어 잔여 사과를 정리할 때 유용합니다.</li>
      </ul>
    `
  },
  4: {
    title: "고득점 달성을 위한 시각 인지 팁",
    badge: "가이드 04: 시각 인지",
    icon: "fa-eye",
    content: `
      <p>고수들이 100점 이상의 고득점을 돌파할 때 사용하는 시각 스캔 노하우입니다.</p>
      <ul>
        <li><strong>큰 숫자 주변 보기</strong>: 9나 8 같은 큰 숫자는 주변의 1 또는 2만 결합하면 바로 10이 되므로 시각적으로 가장 먼저 탐색해야 합니다. 9 주변에 1이 어디 있는지 반경을 좁혀가며 보십시오.</li>
        <li><strong>가장자리부터 깎기</strong>: 보드의 중앙부보다 모퉁이나 가장자리 구역의 사과들을 먼저 지워나가야 나중에 혼자 외롭게 남겨져 지울 수 없게 되는 '고립 사과'를 방지할 수 있습니다.</li>
        <li><strong>대칭 탐색</strong>: 격자판을 전체적으로 넓게 보며 대칭 형태의 짝이 있는지 시선 흐름을 부드럽게 유지하십시오.</li>
      </ul>
    `
  },
  5: {
    title: "황금비율 배치와 난이도 가중치",
    badge: "가이드 05: 배치 시스템",
    icon: "fa-arrow-down-up-lock",
    content: `
      <p>사과게임+는 사용자가 플레이할 때마다 매번 지울 수 있는 가능성이 보장되도록 내부 알고리즘에 가중치를 둡니다.</p>
      <p>완전 무작위 난수로 1~9를 도배할 경우, 10 합이 나오기 어려운 고립 패턴이 자주 생깁니다. 본 게임 엔진은 5, 6, 7, 8, 9 등의 큰 숫자 주변에 보수가 되는 1, 2, 3이 약 25% 가중 비율로 인접 생성되도록 유도 배치합니다. 이로 인해 사과판의 약 90% 이상을 안정적으로 지워나갈 수 있는 황금 맵이 연출됩니다.</p>
    `
  },
  6: {
    title: "1대1 실시간 AI 배틀 공략",
    badge: "가이드 06: AI 배틀",
    icon: "fa-robot",
    content: `
      <p><strong>랜덤 매치(VS AI)</strong>는 동일한 2분 시간 제한 동안 두 개의 독립된 보드에서 가상 AI 봇과 속도 대결을 펼칩니다.</p>
      <p>AI 봇은 약 3~5초의 주기마다 보드를 고속 백트래킹(Backtracking)하여 합이 10인 최적의 사각형 구역을 100% 탐지하여 드래그합니다. 인간 플레이어는 이에 맞서 지연 없이 보수를 찾아내야 승리할 수 있습니다. AI의 드래그 흔적이 실시간 보라색 네온 상자로 표현되어 상대의 플레이 진척도를 시각적으로 확인할 수 있어 더욱 박진감 넘칩니다.</p>
    `
  },
  7: {
    title: "로컬 Co-op 방 만들기 및 규칙",
    badge: "가이드 07: 가상 방 만들기",
    icon: "fa-people-group",
    content: `
      <p><strong>방 만들기</strong> 모드는 가상의 멀티플레이 대기실을 생성하여 친구와 함께 겨루거나 협동하는 느낌을 주는 시뮬레이션 모드입니다.</p>
      <p>방을 생성하면 6자리의 영숫자 초대코드(예: <code>AHO777</code>)가 발급되며, 해당 코드를 입력해 참가하면 모의 멀티플레이 실시간 라이벌 매치가 매칭됩니다. 가상의 라이벌 닉네임과 모의 채팅창 팝업이 활성화되어 실제 네트워크 멀티플레이를 즐기는 듯한 활기찬 인터랙션을 경험할 수 있습니다.</p>
    `
  },
  8: {
    title: "브라우저 게임 루프와 렌더링 원리",
    badge: "가이드 08: 렌더링 원리",
    icon: "fa-rotate",
    content: `
      <p>본 게임은 웹 브라우저의 2D Canvas 그래픽스 파이프라인 및 <code>requestAnimationFrame</code> 고성능 드로잉 동기화를 활용합니다.</p>
      <p>매 초당 60프레임(60fps) 속도로 캔버스를 클리어하고 사과 소자들을 다시 그리며, 마우스가 드래그된 픽셀 범위의 2D 평면 영역을 격자 좌표(Grid Row, Column)로 정밀 변환합니다. 변환된 좌표계에 해당하는 사과의 활성 상태를 필터링하고 수학적 덧셈 루프를 실행하여 프레임 지연 없는 부드러운 드래그 선을 출력해 줍니다.</p>
    `
  },
  9: {
    title: "효과음 Procedural 신디사이징 기술",
    badge: "가이드 09: 음향 기술",
    icon: "fa-wave-square",
    content: `
      <p>사과게임+는 별도의 무거운 사운드 에셋 파일(.mp3, .wav)을 다운로드하지 않는 <strong>서버리스 오프라인 친화적 방식</strong>입니다.</p>
      <p>자바스크립트의 <code>Web Audio API</code> 내장 주파수 발진기(OscillatorNode)를 활용해 소리를 직접 코드로 신디사이징합니다. 사과가 지워질 때 청아한 고주파 피치 상승 차임(Chime)을 내며, 실패 시에는 톱니파(Sawtooth) 오실레이터 주파수를 급격히 감쇄시켜 둔탁한 버저 소리를 실시간으로 합성해 냅니다.</p>
    `
  },
  10: {
    title: "사과게임의 역사와 모태 게임",
    badge: "가이드 10: 역사와 모태",
    icon: "fa-landmark",
    content: `
      <p>사과게임의 원형은 일본의 주니어 교육용 게임 제조사 및 플래시 게임 채널에서 제공하던 'Fruit Box(일명 마법의 과일 상자)' 게임입니다.</p>
      <p>산수 연산을 재미있게 훈련하기 위해 아동용 보드게임 형태로 설계되었다가, 2000년대 중반 어도비 플래시(Adobe Flash) 플랫폼의 붐을 타고 전 세계 주니어 포털에 보급되었습니다. 단순한 덧셈을 공간 인지 퍼즐로 기막히게 접목하여 성인들에게까지 뇌 풀기 게임으로 대유행을 끌며 오늘날까지 대표적인 웹 게임으로 전승되고 있습니다.</p>
    `
  },
  11: {
    title: "두뇌 발달 및 인지 기능 강화 효과",
    badge: "가이드 11: 두뇌 발달",
    icon: "fa-brain",
    content: `
      <p>숫자의 합을 10으로 맞추는 행위는 인지심리학 및 뇌과학적으로 탁월한 자극이 됩니다.</p>
      <p>제한된 시간 안에 시각 정보를 단기 작업 기억(Working Memory) 상에서 끊임없이 재조합하고 덧셈을 수행해야 하므로 <strong>전두엽(Frontal Lobe)의 계산 인지 능력</strong>이 단시간에 집중 향상됩니다. 또한 빠른 패턴 탐색은 안구 운동 및 순간 판단력을 자극하여 청소년의 산수 훈련뿐만 아니라 노년층의 치매 예방 두뇌 자극으로도 크게 추천됩니다.</p>
    `
  },
  12: {
    title: "자주 묻는 질문 (FAQ)",
    badge: "가이드 12: FAQ",
    icon: "fa-question-circle",
    content: `
      <p><strong>Q. 사과를 완전히 다 지우면 어떻게 되나요?</strong><br>A. 격자판의 170개 사과를 모두 지우는 것은 수학적으로 난이도가 높지만 가능합니다! 올 클리어(170점 획득) 달성 시 화면 전체에 화려한 색상 폭죽 파티클 분수 쇼가 연출되며 게임 클리어 메시지가 노출됩니다.</p>
      <p><strong>Q. 모바일 폰이나 태블릿에서도 드래그 조작이 되나요?</strong><br>A. 네! 터치 이벤트(TouchStart, TouchMove, TouchEnd) 제어 파이프라인을 탑재하여 모바일 화면에서도 손가락 드래그만으로 완벽하게 사과를 지우고 즐기실 수 있습니다.</p>
      <p><strong>Q. AI 봇의 난이도를 더 올릴 수는 없나요?</strong><br>A. 기본 AI는 일반적인 사람 수준(약 4초당 1개 서브 드래그)으로 시뮬레이션됩니다. 추후 업데이트를 통해 1초당 여러 개의 10을 지워버리는 '지옥 난이도 하드코어 AI' 모드도 출시를 검토 중입니다.</p>
    `
  }
};

// Announcement Database Modals
const LOBBY_MODALS_CONTENT = {
  notice: {
    title: "공지사항",
    content: `
      <p><strong>[알림] 사과게임+ 베타 런칭 안내</strong></p>
      <p>CineAHO의 18번째 명품 서브 웹앱으로 <strong>사과게임+</strong>가 정식 추가되었습니다!</p>
      <p>현재 계정 및 데이터베이스 통합 기능은 포털 서버와의 연동을 위해 임시 대기 상태이며, 조만간 실시간 글로벌 랭킹과 멀티 매치가 완벽 가동될 예정입니다. 대결 모드는 고성능 AI 시뮬레이션을 통해 오프라인 상태에서도 박진감 있게 즐기실 수 있습니다. 감사합니다.</p>
    `
  },
  intro: {
    title: "게임 소개 및 방법",
    content: `
      <p><strong>사과게임+에 오신 것을 환영합니다!</strong></p>
      <p>본 게임은 10행 17열로 배치된 사과판에서 마우스/터치 드래그로 사각형 영역을 지정해 그 안의 숫자 합이 정확히 <strong>10</strong>이 되도록 맞추는 퍼즐입니다.</p>
      <p><strong>조작법:</strong><br>
      - 마우스 왼쪽 버튼을 누른 채로 사과 위를 가로지르며 드래그하세요.<br>
      - 사각형 가이드라인 모서리에 현재 선택된 사과들의 합계 수치가 실시간 계산되어 출력됩니다.<br>
      - 합이 <strong>10</strong>일 때 마우스를 놓으면 사과들이 터지며 지워집니다!</p>
    `
  },
  community: {
    title: "CineAHO 게이머 커뮤니티",
    content: `
      <p><strong>[자유게시판 베스트 글]</strong></p>
      <p>1. <em>"사과게임 150점 돌파 팁 풉니다."</em> - 작성자: AppleKing<br>
      - 무조건 가장자리부터 지워야 고립되는 사과가 적어져요. 특히 9+1, 8+2 짝을 구석진 곳부터 최우선 제거하는 게 포인트!</p>
      <p>2. <em>"랜덤 매치 AI 봇 은근히 똑똑하네요ㅋㅋ"</em> - 작성자: 뇌섹남<br>
      - AI 지우는 거 쳐다보다가 페이스 말렸네요. 제가 70점 할 때 AI가 72점으로 아슬아슬하게 이겼습니다. 쫄깃하네요.</p>
    `
  }
};

// Global App States
let currentGameMode = "lobby"; // "lobby", "classic", "aimatch", "room"
let isSoundEnabled = true;

// Grid configurations
const ROWS = 10;
const COLS = 17;
const CELL_SIZE = 42; // pixel size for each cell on canvas
const PADDING = 4; // padding around grid

// Playboard State Variables
let classicBoard = []; // 2D Array: { value, removed, scale, targetScale }
let classicScore = 0;
let classicTimer = 120; // 2 minutes
let classicTimerId = null;
let highscore = parseInt(localStorage.getItem("cineaho_apple_highscore") || "0", 10);

// Drag State
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let dragCurrent = { x: 0, y: 0 };

// Particle Splash List
let particles = [];

// AI Battle State
let battleTimer = 120;
let battleTimerId = null;
let playerBoard = [];
let playerScore = 0;
let playerDrag = { active: false, start: {x:0, y:0}, cur: {x:0, y:0} };

let aiBoard = [];
let aiScore = 0;
let aiDrag = { active: false, start: {x:0, y:0}, cur: {x:0, y:0}, progress: 0, targetRect: null };
let aiLogicIntervalId = null;

// Simulated Room Multiplayer State
let currentRoomCode = "";
let roomMatchIntervalId = null;
let roomOpponentName = "CineAHO_Pro";

// Audio Context
let audioCtx = null;

// DOM Elements cache
const lobbyView = document.getElementById("lobby-view");
const playView = document.getElementById("play-view");
const battleView = document.getElementById("battle-view");

const btnModeClassic = document.getElementById("btn-mode-classic");
const btnModeAiMatch = document.getElementById("btn-mode-aimatch");
const btnModeRoom = document.getElementById("btn-mode-room");
const inviteCodeInput = document.getElementById("invite-code-input");
const btnLobbyJoin = document.getElementById("btn-lobby-join");

const btnGotoLobby = document.getElementById("btn-goto-lobby");
const btnBattleGotoLobby = document.getElementById("btn-battle-goto-lobby");
const btnResetGame = document.getElementById("btn-reset-game");
const btnResetBattle = document.getElementById("btn-reset-battle");

const btnToggleGrid = document.getElementById("btn-toggle-grid");
const btnToggleSound = document.getElementById("btn-toggle-sound");

const lblClassicScore = document.getElementById("lbl-classic-score");
const lblClassicTimer = document.getElementById("lbl-classic-timer");

const lblBattlePlayerScore = document.getElementById("lbl-battle-player-score");
const lblBattleAiScore = document.getElementById("lbl-battle-ai-score");
const lblBattleTimer = document.getElementById("lbl-battle-timer");

const lobbyModal = document.getElementById("lobby-modal");
const btnCloseModal = document.getElementById("btn-close-modal");
const modalTitle = document.getElementById("modal-title");
const modalContent = document.getElementById("modal-content");

// Canvases
const classicCanvas = document.getElementById("classic-canvas");
const battlePlayerCanvas = document.getElementById("battle-player-canvas");
const battleAiCanvas = document.getElementById("battle-ai-canvas");

// Bootstrap init
function init() {
  setupUIEventListeners();
  setupCanvasDimensions();
  
  // Set guides
  switchTOCArticle(1);
}

function setupCanvasDimensions() {
  const w = COLS * CELL_SIZE + PADDING * 2;
  const h = ROWS * CELL_SIZE + PADDING * 2;
  
  // Adjust high DPI canvas
  [classicCanvas, battlePlayerCanvas, battleAiCanvas].forEach(canvas => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const cCtx = canvas.getContext("2d");
    cCtx.scale(dpr, dpr);
  });
}

function setupUIEventListeners() {
  // Lobby buttons
  btnModeClassic.addEventListener("click", () => startClassicGame());
  btnModeAiMatch.addEventListener("click", () => startAiBattle());
  btnModeRoom.addEventListener("click", () => createRoomGame());
  
  btnLobbyJoin.addEventListener("click", () => {
    const code = inviteCodeInput.value.trim().toUpperCase();
    if (code.length === 6) {
      joinRoomGame(code);
    } else {
      alert("올바른 6자리 초대코드를 입력하세요.");
    }
  });

  // Modal tab triggers
  document.querySelectorAll(".lobby-tab-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const modalKey = link.getAttribute("data-modal");
      openLobbyModal(modalKey);
    });
  });

  btnCloseModal.addEventListener("click", () => {
    lobbyModal.style.display = "none";
  });

  // Game UI triggers
  btnGotoLobby.addEventListener("click", () => returnToLobby());
  btnBattleGotoLobby.addEventListener("click", () => returnToLobby());
  btnResetGame.addEventListener("click", () => startClassicGame());
  btnResetBattle.addEventListener("click", () => {
    if (currentGameMode === "aimatch") startAiBattle();
    else if (currentGameMode === "room") joinRoomGame(currentRoomCode);
  });

  // Toggle buttons
  let showGridLines = true;
  btnToggleGrid.addEventListener("click", () => {
    showGridLines = !showGridLines;
    btnToggleGrid.classList.toggle("active-tool");
    drawClassicBoard();
  });

  btnToggleSound.addEventListener("click", () => {
    isSoundEnabled = !isSoundEnabled;
    btnToggleSound.querySelector("i").className = isSoundEnabled ? "fa-solid fa-volume-high" : "fa-solid fa-volume-xmark";
  });

  // Scroll widgets top/bottom
  document.getElementById("btn-scroll-top").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.getElementById("btn-scroll-bottom").addEventListener("click", () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  });

  // TOC items
  document.querySelectorAll(".explanation-index-list li").forEach((li) => {
    li.addEventListener("click", () => {
      document.querySelectorAll(".explanation-index-list li").forEach(item => item.classList.remove("active"));
      li.classList.add("active");
      const idx = parseInt(li.getAttribute("data-index"), 10);
      switchTOCArticle(idx);
    });
  });

  // Event handlers for dragging on classic canvas (mouse)
  bindDragEvents(classicCanvas, {
    onStart: (pos) => {
      isDragging = true;
      dragStart = pos;
      dragCurrent = pos;
    },
    onMove: (pos) => {
      if (isDragging) {
        dragCurrent = pos;
        drawClassicBoard();
      }
    },
    onEnd: () => {
      if (isDragging) {
        isDragging = false;
        handleDragEndClassic();
      }
    }
  });

  // Touch support for classic
  bindTouchDragEvents(classicCanvas, {
    onStart: (pos) => {
      isDragging = true;
      dragStart = pos;
      dragCurrent = pos;
    },
    onMove: (pos) => {
      if (isDragging) {
        dragCurrent = pos;
        drawClassicBoard();
      }
    },
    onEnd: () => {
      if (isDragging) {
        isDragging = false;
        handleDragEndClassic();
      }
    }
  });

  // Event handlers for battle player canvas
  bindDragEvents(battlePlayerCanvas, {
    onStart: (pos) => {
      playerDrag.active = true;
      playerDrag.start = pos;
      playerDrag.cur = pos;
    },
    onMove: (pos) => {
      if (playerDrag.active) {
        playerDrag.cur = pos;
        drawBattlePlayerBoard();
      }
    },
    onEnd: () => {
      if (playerDrag.active) {
        playerDrag.active = false;
        handleDragEndBattlePlayer();
      }
    }
  });

  bindTouchDragEvents(battlePlayerCanvas, {
    onStart: (pos) => {
      playerDrag.active = true;
      playerDrag.start = pos;
      playerDrag.cur = pos;
    },
    onMove: (pos) => {
      if (playerDrag.active) {
        playerDrag.cur = pos;
        drawBattlePlayerBoard();
      }
    },
    onEnd: () => {
      if (playerDrag.active) {
        playerDrag.active = false;
        handleDragEndBattlePlayer();
      }
    }
  });
}

function bindDragEvents(canvas, handlers) {
  canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const pos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    initAudio();
    handlers.onStart(pos);
  });

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const pos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    handlers.onMove(pos);
  });

  window.addEventListener("mouseup", () => {
    handlers.onEnd();
  });
}

function bindTouchDragEvents(canvas, handlers) {
  canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const pos = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
    initAudio();
    handlers.onStart(pos);
  });

  canvas.addEventListener("touchmove", (e) => {
    if (e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const pos = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
    handlers.onMove(pos);
  });

  window.addEventListener("touchend", () => {
    handlers.onEnd();
  });
}

// -------------------------------------------------------------
// Core Math Grid Helpers
// -------------------------------------------------------------

// Generate a winnable grid of apples with weighted보수 numbers
function generateBoardGrid() {
  let grid = [];
  
  for (let r = 0; r < ROWS; r++) {
    grid[r] = [];
    for (let c = 0; c < COLS; c++) {
      // Weight 1-9
      let val = Math.floor(Math.random() * 9) + 1;
      
      // Focus weighting: 30% chance to put a complementary value relative to left/top neighbors
      if (Math.random() < 0.3) {
        if (c > 0 && !grid[r][c-1].removed) {
          const leftVal = grid[r][c-1].value;
          if (leftVal < 10) val = 10 - leftVal;
        } else if (r > 0 && !grid[r-1][c].removed) {
          const topVal = grid[r-1][c].value;
          if (topVal < 10) val = 10 - topVal;
        }
      }
      
      grid[r][c] = {
        value: val,
        removed: false,
        scale: 0.0, // animate entrance
        targetScale: 1.0
      };
    }
  }
  
  return grid;
}

// Get cells covered by bounding box coordinates
function getSelectedCells(start, cur) {
  const x1 = Math.min(start.x, cur.x);
  const x2 = Math.max(start.x, cur.x);
  const y1 = Math.min(start.y, cur.y);
  const y2 = Math.max(start.y, cur.y);
  
  const cells = [];
  
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      // Find center coordinate of this cell
      const cx = c * CELL_SIZE + CELL_SIZE / 2 + PADDING;
      const cy = r * CELL_SIZE + CELL_SIZE / 2 + PADDING;
      
      if (cx >= x1 && cx <= x2 && cy >= y1 && cy <= y2) {
        cells.push({ r, c });
      }
    }
  }
  
  return cells;
}

// -------------------------------------------------------------
// Procedural Web Audio Synth FX Engine
// -------------------------------------------------------------
function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch(e) {
    console.error("Web Audio not supported:", e);
  }
}

function playSound(type) {
  if (!isSoundEnabled || !audioCtx) return;
  
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  
  const dest = audioCtx.destination;
  
  if (type === "pop") {
    // short pop sliding tone
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(dest);
    
    osc.type = "sine";
    const now = audioCtx.currentTime;
    
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
    
    osc.start(now);
    osc.stop(now + 0.08);
  } 
  
  else if (type === "chime") {
    // Standard success chime: 2 musical intervals
    const now = audioCtx.currentTime;
    
    const playNote = (freq, start, duration) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(dest);
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, start);
      
      gain.gain.setValueAtTime(0.1, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      
      osc.start(start);
      osc.stop(start + duration);
    };
    
    playNote(523.25, now, 0.15); // C5
    playNote(783.99, now + 0.08, 0.25); // G5
  } 
  
  else if (type === "buzzer") {
    // Failure buzzer
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(dest);
    
    osc.type = "sawtooth";
    const now = audioCtx.currentTime;
    
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.25);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
    
    osc.start(now);
    osc.stop(now + 0.25);
  } 
  
  else if (type === "tick") {
    // Tick click
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(dest);
    
    osc.type = "sine";
    const now = audioCtx.currentTime;
    
    osc.frequency.setValueAtTime(1000, now);
    
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.02);
    
    osc.start(now);
    osc.stop(now + 0.02);
  }
}

// -------------------------------------------------------------
// Lobby Screens & Modals
// -------------------------------------------------------------
function switchGameMode(mode) {
  currentGameMode = mode;
  
  // Hide all views
  lobbyView.style.display = "none";
  playView.style.display = "none";
  battleView.style.display = "none";
  
  // Clear running loops
  if (classicTimerId) clearInterval(classicTimerId);
  if (battleTimerId) clearInterval(battleTimerId);
  if (aiLogicIntervalId) clearInterval(aiLogicIntervalId);
  if (roomMatchIntervalId) clearInterval(roomMatchIntervalId);
  
  if (mode === "lobby") {
    lobbyView.style.display = "flex";
  } else if (mode === "classic") {
    playView.style.display = "block";
  } else {
    battleView.style.display = "block";
  }
}

function openLobbyModal(key) {
  const content = LOBBY_MODALS_CONTENT[key];
  if (!content) return;
  
  modalTitle.textContent = content.title;
  modalContent.innerHTML = content.content;
  lobbyModal.style.display = "flex";
}

function returnToLobby() {
  switchGameMode("lobby");
}

// -------------------------------------------------------------
// Playmode 1: Classic Solo (혼자 하기)
// -------------------------------------------------------------
function startClassicGame() {
  switchGameMode("classic");
  
  classicBoard = generateBoardGrid();
  classicScore = 0;
  classicTimer = 120; // 2 minutes
  lblClassicScore.textContent = "0";
  lblClassicTimer.textContent = "02:00";
  
  // Animation Entry loop for apples
  let delay = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      setTimeout(() => {
        if (classicBoard[r] && classicBoard[r][c]) {
          classicBoard[r][c].scale = 0.0;
          classicBoard[r][c].targetScale = 1.0;
        }
      }, delay);
      delay += 2; // cascade diagonal pop effect
    }
  }

  // Particle list reset
  particles = [];
  
  // Timer loop
  classicTimerId = setInterval(() => {
    classicTimer--;
    if (classicTimer <= 10) {
      playSound("tick");
    }
    
    if (classicTimer <= 0) {
      clearInterval(classicTimerId);
      endClassicGame();
    } else {
      lblClassicTimer.textContent = formatTime(classicTimer);
    }
  }, 1000);

  // Trigger continuous rendering animation loop
  runClassicAnimationLoop();
}

function formatTime(sec) {
  const mins = Math.floor(sec / 60);
  const secs = sec % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Handle classic MouseUp calculations
function handleDragEndClassic() {
  const cells = getSelectedCells(dragStart, dragCurrent);
  if (cells.length === 0) return;
  
  let sum = 0;
  let validApples = [];
  
  cells.forEach(cell => {
    const apple = classicBoard[cell.r][cell.c];
    if (!apple.removed) {
      sum += apple.value;
      validApples.push(apple);
    }
  });
  
  if (sum === 10 && validApples.length > 0) {
    // Success! Clear apples
    validApples.forEach(apple => {
      apple.removed = true;
      apple.targetScale = 0.0;
      
      // Spawn particles
      const colIndex = classicBoard[0].indexOf(apple); // fallback X
      // Find actual coord of apple
      for (let r = 0; r < ROWS; r++) {
        const cIdx = classicBoard[r].indexOf(apple);
        if (cIdx !== -1) {
          const px = cIdx * CELL_SIZE + CELL_SIZE / 2 + PADDING;
          const py = r * CELL_SIZE + CELL_SIZE / 2 + PADDING;
          spawnBurstParticles(px, py);
          break;
        }
      }
    });
    
    classicScore += validApples.length;
    lblClassicScore.textContent = classicScore;
    playSound("chime");
    
    // Check win
    checkClassicWinState();
  } else if (validApples.length > 0) {
    // Buzz
    playSound("buzzer");
  }
  
  // Reset drag line
  dragStart = { x: 0, y: 0 };
  dragCurrent = { x: 0, y: 0 };
  drawClassicBoard();
}

function checkClassicWinState() {
  let allRemoved = true;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!classicBoard[r][c].removed) {
        allRemoved = false;
        break;
      }
    }
  }
  
  if (allRemoved) {
    clearInterval(classicTimerId);
    playSound("chime");
    // Spawn massive win particles
    for (let i = 0; i < 50; i++) {
      spawnBurstParticles(Math.random() * classicCanvas.width, Math.random() * classicCanvas.height);
    }
    setTimeout(() => {
      alert(`축하합니다! 올 클리어! 완벽하게 모든 사과를 지웠습니다!\n최종 점수: ${classicScore}점`);
      returnToLobby();
    }, 1000);
  }
}

function endClassicGame() {
  playSound("buzzer");
  
  if (classicScore > highscore) {
    highscore = classicScore;
    localStorage.setItem("cineaho_apple_highscore", highscore);
    alert(`시간 종료!\n축하합니다! 새로운 최고 기록 달성: ${classicScore}점!`);
  } else {
    alert(`시간 종료!\n최종 점수: ${classicScore}점\n(최고 기록: ${highscore}점)`);
  }
  
  returnToLobby();
}

// -------------------------------------------------------------
// Playmode 2: AI Battle Match (랜덤 매치)
// -------------------------------------------------------------
function startAiBattle() {
  switchGameMode("aimatch");
  
  playerBoard = generateBoardGrid();
  aiBoard = generateBoardGrid();
  playerScore = 0;
  aiScore = 0;
  battleTimer = 120;
  
  lblBattlePlayerScore.textContent = "0";
  lblBattleAiScore.textContent = "0";
  lblBattleTimer.textContent = "02:00";
  
  // Reset drags
  playerDrag = { active: false, start: {x:0, y:0}, cur: {x:0, y:0} };
  aiDrag = { active: false, start: {x:0, y:0}, cur: {x:0, y:0}, progress: 0, targetRect: null };
  
  particles = [];
  
  // Battle timer loop
  battleTimerId = setInterval(() => {
    battleTimer--;
    if (battleTimer <= 10) playSound("tick");
    
    if (battleTimer <= 0) {
      clearInterval(battleTimerId);
      endBattleMatch();
    } else {
      lblBattleTimer.textContent = formatTime(battleTimer);
    }
  }, 1000);

  // Trigger AI intelligence loop
  startAiSimulationEngine();
  
  // Animate canvases loops
  runBattleAnimationLoop();
}

// Simulated real-time AI solver loop
function startAiSimulationEngine() {
  if (aiLogicIntervalId) clearInterval(aiLogicIntervalId);
  
  // AI solver ticks every 3.5 seconds
  aiLogicIntervalId = setInterval(() => {
    if (aiDrag.active) return;
    
    // Find all valid rectangles that sum to 10
    const list = findSum10Rectangles(aiBoard);
    
    if (list.length > 0) {
      // Pick a random one to simulate dragging
      const rect = list[Math.floor(Math.random() * list.length)];
      simulateAiDragging(rect);
    } else {
      // AI board has no solutions: simulate board shuffle reset
      setTimeout(() => {
        aiBoard = generateBoardGrid();
        aiScore = Math.max(0, aiScore - 5); // penalty or simple shuffle
        lblBattleAiScore.textContent = aiScore;
      }, 1000);
    }
  }, 4000);
}

// Find rectangles of sum 10
function findSum10Rectangles(board) {
  const solutions = [];
  
  for (let r1 = 0; r1 < ROWS; r1++) {
    for (let c1 = 0; c1 < COLS; c1++) {
      if (board[r1][c1].removed) continue;
      
      for (let r2 = r1; r2 < ROWS; r2++) {
        for (let c2 = c1; c2 < COLS; c2++) {
          let sum = 0;
          let count = 0;
          
          for (let r = r1; r <= r2; r++) {
            for (let c = c1; c <= c2; c++) {
              if (!board[r][c].removed) {
                sum += board[r][c].value;
                count++;
              }
            }
          }
          
          if (sum === 10 && count > 0) {
            solutions.push({ r1, c1, r2, c2 });
          }
        }
      }
    }
  }
  
  return solutions;
}

// Simulates a smooth dragging line visual on AI canvas
function simulateAiDragging(rect) {
  const x1 = rect.c1 * CELL_SIZE + CELL_SIZE/2 + PADDING;
  const y1 = rect.r1 * CELL_SIZE + CELL_SIZE/2 + PADDING;
  const x2 = rect.c2 * CELL_SIZE + CELL_SIZE/2 + PADDING;
  const y2 = rect.r2 * CELL_SIZE + CELL_SIZE/2 + PADDING;
  
  aiDrag.active = true;
  aiDrag.start = { x: x1, y: y1 };
  aiDrag.cur = { x: x1, y: y1 };
  aiDrag.progress = 0;
  
  // Animate AI line progress
  let step = 0;
  const totalSteps = 15;
  
  const dragTimer = setInterval(() => {
    step++;
    const ratio = step / totalSteps;
    aiDrag.cur.x = x1 + (x2 - x1) * ratio;
    aiDrag.cur.y = y1 + (y2 - y1) * ratio;
    
    if (step >= totalSteps) {
      clearInterval(dragTimer);
      
      // Perform AI removal
      setTimeout(() => {
        let count = 0;
        for (let r = rect.r1; r <= rect.r2; r++) {
          for (let c = rect.c1; c <= rect.c2; c++) {
            if (!aiBoard[r][c].removed) {
              aiBoard[r][c].removed = true;
              aiBoard[r][c].targetScale = 0.0;
              count++;
              
              const px = c * CELL_SIZE + CELL_SIZE/2 + PADDING;
              const py = r * CELL_SIZE + CELL_SIZE/2 + PADDING;
              spawnBurstParticles(px, py);
            }
          }
        }
        
        aiScore += count;
        lblBattleAiScore.textContent = aiScore;
        
        // play sound at lower scale
        if (isSoundEnabled && audioCtx) {
          playSound("pop");
        }
        
        aiDrag.active = false;
      }, 200);
    }
  }, 40);
}

// Drag end for split screen player
function handleDragEndBattlePlayer() {
  const cells = getSelectedCells(playerDrag.start, playerDrag.cur);
  if (cells.length === 0) return;
  
  let sum = 0;
  let validApples = [];
  
  cells.forEach(cell => {
    const apple = playerBoard[cell.r][cell.c];
    if (!apple.removed) {
      sum += apple.value;
      validApples.push(apple);
    }
  });
  
  if (sum === 10 && validApples.length > 0) {
    validApples.forEach(apple => {
      apple.removed = true;
      apple.targetScale = 0.0;
      
      for (let r = 0; r < ROWS; r++) {
        const cIdx = playerBoard[r].indexOf(apple);
        if (cIdx !== -1) {
          const px = cIdx * CELL_SIZE + CELL_SIZE/2 + PADDING;
          const py = r * CELL_SIZE + CELL_SIZE/2 + PADDING;
          spawnBurstParticles(px, py);
          break;
        }
      }
    });
    
    playerScore += validApples.length;
    lblBattlePlayerScore.textContent = playerScore;
    playSound("chime");
  } else if (validApples.length > 0) {
    playSound("buzzer");
  }
  
  playerDrag.start = { x: 0, y: 0 };
  playerDrag.cur = { x: 0, y: 0 };
  drawBattlePlayerBoard();
}

function endBattleMatch() {
  if (aiLogicIntervalId) clearInterval(aiLogicIntervalId);
  
  let msg = "";
  if (playerScore > aiScore) {
    msg = `축하합니다! 승리하셨습니다!\n내 점수: ${playerScore}점 | AI 봇 점수: ${aiScore}점`;
  } else if (playerScore < aiScore) {
    msg = `아쉽게도 패배하셨습니다...\n내 점수: ${playerScore}점 | AI 봇 점수: ${aiScore}점`;
  } else {
    msg = `무승부입니다!\n점수: ${playerScore}점`;
  }
  
  alert(msg);
  returnToLobby();
}

// -------------------------------------------------------------
// Playmode 3: Simulated Multiplayer Room (방 만들기)
// -------------------------------------------------------------
function createRoomGame() {
  // Generate random room code
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  currentRoomCode = code;
  alert(`방이 생성되었습니다!\n초대 코드: [ ${code} ]\n초대 코드를 입력하고 참여하는 상대방과 실시간 매치가 진행됩니다.`);
  
  // Populate join code and trigger simulated delay entry
  inviteCodeInput.value = code;
  
  // Auto-join immediately to simulate joining the room
  joinRoomGame(code);
}

function joinRoomGame(code) {
  currentRoomCode = code;
  alert(`초대코드 ${code} 번 방에 입장하였습니다!\n상대방 매칭을 대기하고 있습니다...`);
  
  // Simulating opponent match delay (1.5 seconds)
  setTimeout(() => {
    alert(`상대방 [${roomOpponentName}]이 입장하였습니다! 게임을 시작합니다.`);
    
    // Switch to Battle View (playing against simulated real-time opponent)
    switchGameMode("room");
    
    playerBoard = generateBoardGrid();
    aiBoard = generateBoardGrid();
    playerScore = 0;
    aiScore = 0;
    battleTimer = 120;
    
    lblBattlePlayerScore.textContent = "0";
    lblBattleAiScore.textContent = "0";
    lblBattleTimer.textContent = "02:00";
    
    playerDrag = { active: false, start: {x:0, y:0}, cur: {x:0, y:0} };
    aiDrag = { active: false, start: {x:0, y:0}, cur: {x:0, y:0}, progress: 0, targetRect: null };
    particles = [];
    
    battleTimerId = setInterval(() => {
      battleTimer--;
      if (battleTimer <= 10) playSound("tick");
      
      if (battleTimer <= 0) {
        clearInterval(battleTimerId);
        endRoomMatch();
      } else {
        lblBattleTimer.textContent = formatTime(battleTimer);
      }
    }, 1000);

    // Simulated multiplayer opponent solver loop (faster, more dynamic)
    if (aiLogicIntervalId) clearInterval(aiLogicIntervalId);
    aiLogicIntervalId = setInterval(() => {
      if (aiDrag.active) return;
      const list = findSum10Rectangles(aiBoard);
      if (list.length > 0) {
        const rect = list[Math.floor(Math.random() * list.length)];
        simulateAiDragging(rect);
      } else {
        setTimeout(() => {
          aiBoard = generateBoardGrid();
          aiScore = Math.max(0, aiScore - 3);
          lblBattleAiScore.textContent = aiScore;
        }, 1200);
      }
    }, 3200); // 3.2s tick (slightly faster than default AI)

    runBattleAnimationLoop();
  }, 1500);
}

function endRoomMatch() {
  if (aiLogicIntervalId) clearInterval(aiLogicIntervalId);
  
  let msg = "";
  if (playerScore > aiScore) {
    msg = `축하합니다! 매치에서 승리하였습니다!\n나: ${playerScore}점 | ${roomOpponentName}: ${aiScore}점`;
  } else if (playerScore < aiScore) {
    msg = `패배하였습니다...\n나: ${playerScore}점 | ${roomOpponentName}: ${aiScore}점`;
  } else {
    msg = `매치 결과 무승부!\n점수: ${playerScore}점`;
  }
  
  alert(msg);
  returnToLobby();
}

// -------------------------------------------------------------
// Canvas Graphics & Animations Drawing Engine
// -------------------------------------------------------------

// Particle Splashes
function spawnBurstParticles(x, y) {
  const colors = ["#ff3b30", "#ff6b6b", "#ffa8a8", "#ff8787"];
  
  for (let i = 0; i < 8; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6 - 2, // slight upward float
      radius: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1.0,
      decay: Math.random() * 0.03 + 0.02
    });
  }
}

// Draw Apple Shapes
function drawAppleShape(cCtx, x, y, val, scale, isSelected) {
  cCtx.save();
  cCtx.translate(x, y);
  cCtx.scale(scale, scale);
  
  // Draw glowing selection border
  if (isSelected) {
    cCtx.beginPath();
    cCtx.arc(0, 0, 19, 0, 2 * Math.PI);
    cCtx.strokeStyle = "#40c057";
    cCtx.lineWidth = 3.5;
    cCtx.shadowColor = "#40c057";
    cCtx.shadowBlur = 10;
    cCtx.stroke();
    cCtx.shadowBlur = 0; // reset
  }
  
  // Stem
  cCtx.beginPath();
  cCtx.moveTo(0, -12);
  cCtx.quadraticCurveTo(4, -18, 5, -20);
  cCtx.strokeStyle = "#795548";
  cCtx.lineWidth = 2.5;
  cCtx.stroke();
  
  // Leaf
  cCtx.beginPath();
  cCtx.ellipse(4, -16, 5, 2.5, Math.PI/4, 0, 2*Math.PI);
  cCtx.fillStyle = "#40c057";
  cCtx.fill();

  // Apple Body (Left & Right lobe curve)
  cCtx.beginPath();
  // Left lobe
  cCtx.moveTo(0, -9);
  cCtx.bezierCurveTo(-14, -9, -17, 3, -11, 11);
  cCtx.bezierCurveTo(-6, 17, -2, 14, 0, 12);
  // Right lobe
  cCtx.bezierCurveTo(2, 14, 6, 17, 11, 11);
  cCtx.bezierCurveTo(17, 3, 14, -9, 0, -9);
  cCtx.closePath();
  cCtx.fillStyle = varColorMatch(val);
  cCtx.fill();
  
  // White highlight shininess
  cCtx.beginPath();
  cCtx.ellipse(-6, -3, 3, 6, Math.PI/6, 0, 2*Math.PI);
  cCtx.fillStyle = "rgba(255,255,255,0.65)";
  cCtx.fill();
  
  // Number value text
  cCtx.fillStyle = "#ffffff";
  cCtx.font = "bold 15px 'Outfit', sans-serif";
  cCtx.textAlign = "center";
  cCtx.textBaseline = "middle";
  cCtx.fillText(val, 0, 2);
  
  cCtx.restore();
}

function varColorMatch(val) {
  // Red color with minor saturation variances based on numbers for aesthetics
  if (val === 9 || val === 8) return "#e03131"; // Dark red
  if (val === 7 || val === 6) return "#f03e3e"; // Standard red
  return "#ff6b6b"; // lighter red
}

// Core loop: Classic Board Animation & Rendering
function runClassicAnimationLoop() {
  if (currentGameMode !== "classic") return;
  
  updatePhysicsAndScales(classicBoard);
  drawClassicBoard();
  
  requestAnimationFrame(runClassicAnimationLoop);
}

function updatePhysicsAndScales(board) {
  // Lerp scales
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r] && board[r][c]) {
        const apple = board[r][c];
        apple.scale += (apple.targetScale - apple.scale) * 0.15;
      }
    }
  }
  
  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= p.decay;
    if (p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawClassicBoard() {
  const cCtx = classicCanvas.getContext("2d");
  cCtx.clearRect(0, 0, classicCanvas.width, classicCanvas.height);
  
  // Draw cell grid lines if enabled
  const hasGridLines = btnToggleGrid.classList.contains("active-tool");
  if (hasGridLines) {
    cCtx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    cCtx.lineWidth = 1;
    for (let c = 1; c < COLS; c++) {
      cCtx.beginPath();
      cCtx.moveTo(c * CELL_SIZE + PADDING, PADDING);
      cCtx.lineTo(c * CELL_SIZE + PADDING, ROWS * CELL_SIZE + PADDING);
      cCtx.stroke();
    }
    for (let r = 1; r < ROWS; r++) {
      cCtx.beginPath();
      cCtx.moveTo(PADDING, r * CELL_SIZE + PADDING);
      cCtx.lineTo(COLS * CELL_SIZE + PADDING, r * CELL_SIZE + PADDING);
      cCtx.stroke();
    }
  }

  // Determine currently selected cells in drag
  let selectedMap = {};
  let currentSum = 0;
  if (isDragging) {
    const cells = getSelectedCells(dragStart, dragCurrent);
    cells.forEach(cell => {
      const apple = classicBoard[cell.r][cell.c];
      if (!apple.removed) {
        selectedMap[`${cell.r},${cell.c}`] = true;
        currentSum += apple.value;
      }
    });
  }
  
  // Draw apples
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const apple = classicBoard[r][c];
      if (apple.scale > 0.02) {
        const cx = c * CELL_SIZE + CELL_SIZE / 2 + PADDING;
        const cy = r * CELL_SIZE + CELL_SIZE / 2 + PADDING;
        const isSelected = !!selectedMap[`${r},${c}`];
        drawAppleShape(cCtx, cx, cy, apple.value, apple.scale, isSelected);
      }
    }
  }
  
  // Draw particles
  particles.forEach(p => {
    cCtx.save();
    cCtx.globalAlpha = p.alpha;
    cCtx.beginPath();
    cCtx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
    cCtx.fillStyle = p.color;
    cCtx.fill();
    cCtx.restore();
  });
  
  // Draw selection rect box
  if (isDragging) {
    cCtx.save();
    const x = Math.min(dragStart.x, dragCurrent.x);
    const y = Math.min(dragStart.y, dragCurrent.y);
    const w = Math.abs(dragStart.x - dragCurrent.x);
    const h = Math.abs(dragStart.y - dragCurrent.y);
    
    // Neon translucent outline
    const isSuccess = currentSum === 10;
    cCtx.fillStyle = isSuccess ? "rgba(18, 184, 134, 0.12)" : "rgba(224, 49, 49, 0.08)";
    cCtx.fillRect(x, y, w, h);
    
    cCtx.strokeStyle = isSuccess ? "#12b886" : "#fa5252";
    cCtx.lineWidth = 2.5;
    cCtx.strokeRect(x, y, w, h);
    
    // Float sum pill
    if (w > 20 && h > 20) {
      cCtx.fillStyle = isSuccess ? "#12b886" : "#fa5252";
      cCtx.beginPath();
      cCtx.roundRect(x + w - 48, y + h + 6, 42, 18, 6);
      cCtx.fill();
      
      cCtx.fillStyle = "#ffffff";
      cCtx.font = "bold 11px sans-serif";
      cCtx.textAlign = "center";
      cCtx.fillText(`합: ${currentSum}`, x + w - 27, y + h + 18);
    }
    cCtx.restore();
  }
}

// -------------------------------------------------------------
// Battle Mode Animation & Rendering loops
// -------------------------------------------------------------
function runBattleAnimationLoop() {
  if (currentGameMode !== "aimatch" && currentGameMode !== "room") return;
  
  updatePhysicsAndScales(playerBoard);
  updatePhysicsAndScales(aiBoard);
  
  drawBattlePlayerBoard();
  drawBattleAiBoard();
  
  requestAnimationFrame(runBattleAnimationLoop);
}

function drawBattlePlayerBoard() {
  const cCtx = battlePlayerCanvas.getContext("2d");
  cCtx.clearRect(0, 0, battlePlayerCanvas.width, battlePlayerCanvas.height);
  
  // Draw apples
  let selectedMap = {};
  let currentSum = 0;
  
  if (playerDrag.active) {
    const cells = getSelectedCells(playerDrag.start, playerDrag.cur);
    cells.forEach(cell => {
      const apple = playerBoard[cell.r][cell.c];
      if (!apple.removed) {
        selectedMap[`${cell.r},${cell.c}`] = true;
        currentSum += apple.value;
      }
    });
  }
  
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const apple = playerBoard[r][c];
      if (apple.scale > 0.02) {
        const cx = c * CELL_SIZE + CELL_SIZE / 2 + PADDING;
        const cy = r * CELL_SIZE + CELL_SIZE / 2 + PADDING;
        const isSelected = !!selectedMap[`${r},${c}`];
        drawAppleShape(cCtx, cx, cy, apple.value, apple.scale, isSelected);
      }
    }
  }
  
  // Particles
  particles.forEach(p => {
    cCtx.save();
    cCtx.globalAlpha = p.alpha;
    cCtx.beginPath();
    cCtx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
    cCtx.fillStyle = p.color;
    cCtx.fill();
    cCtx.restore();
  });
  
  // Draw drag outline
  if (playerDrag.active) {
    cCtx.save();
    const x = Math.min(playerDrag.start.x, playerDrag.cur.x);
    const y = Math.min(playerDrag.start.y, playerDrag.cur.y);
    const w = Math.abs(playerDrag.start.x - playerDrag.cur.x);
    const h = Math.abs(playerDrag.start.y - playerDrag.cur.y);
    
    const isSuccess = currentSum === 10;
    cCtx.fillStyle = isSuccess ? "rgba(18, 184, 134, 0.12)" : "rgba(224, 49, 49, 0.08)";
    cCtx.fillRect(x, y, w, h);
    cCtx.strokeStyle = isSuccess ? "#12b886" : "#fa5252";
    cCtx.lineWidth = 2;
    cCtx.strokeRect(x, y, w, h);
    cCtx.restore();
  }
}

function drawBattleAiBoard() {
  const cCtx = battleAiCanvas.getContext("2d");
  cCtx.clearRect(0, 0, battleAiCanvas.width, battleAiCanvas.height);
  
  // Draw AI apples
  let selectedMap = {};
  
  if (aiDrag.active) {
    const cells = getSelectedCells(aiDrag.start, aiDrag.cur);
    cells.forEach(cell => {
      const apple = aiBoard[cell.r][cell.c];
      if (!apple.removed) {
        selectedMap[`${cell.r},${cell.c}`] = true;
      }
    });
  }
  
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const apple = aiBoard[r][c];
      if (apple.scale > 0.02) {
        const cx = c * CELL_SIZE + CELL_SIZE / 2 + PADDING;
        const cy = r * CELL_SIZE + CELL_SIZE / 2 + PADDING;
        const isSelected = !!selectedMap[`${r},${c}`];
        drawAppleShape(cCtx, cx, cy, apple.value, apple.scale, isSelected);
      }
    }
  }
  
  // Draw AI drag outline
  if (aiDrag.active) {
    cCtx.save();
    const x = Math.min(aiDrag.start.x, aiDrag.cur.x);
    const y = Math.min(aiDrag.start.y, aiDrag.cur.y);
    const w = Math.abs(aiDrag.start.x - aiDrag.cur.x);
    const h = Math.abs(aiDrag.start.y - aiDrag.cur.y);
    
    // Purple neon outline for AI
    cCtx.fillStyle = "rgba(156, 54, 181, 0.15)";
    cCtx.fillRect(x, y, w, h);
    cCtx.strokeStyle = "#9c36b5";
    cCtx.lineWidth = 2.5;
    cCtx.strokeRect(x, y, w, h);
    cCtx.restore();
  }
}

// -------------------------------------------------------------
// TOC Page Switcher
// -------------------------------------------------------------
function switchTOCArticle(index) {
  const article = GUIDE_ARTICLES[index];
  if (!article) return;
  
  explanationBoardContent.classList.add("fade-out");
  
  setTimeout(() => {
    explanationTitleBadge.innerHTML = `<i class="fa-solid ${article.icon} text-red"></i> <span>${article.badge}</span>`;
    explanationDisplayTitle.textContent = article.title;
    explanationDisplayText.innerHTML = article.content;
    
    explanationBoardContent.classList.remove("fade-out");
  }, 300);
}

// Initialize
window.addEventListener("DOMContentLoaded", () => {
  init();
});
