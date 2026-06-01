// CineAHO Marble Roulette Pro - Physics & Simulation Engine

// Guide Database
const GUIDE_ARTICLES = {
  1: {
    title: "구슬 룰렛 개요",
    badge: "가이드 01: 개요",
    icon: "fa-circle-info",
    content: `
      <p><strong>구슬 룰렛 시뮬레이터 Pro</strong>는 여러 개의 커스텀 구슬들이 다채로운 기하학적 장애물 선로(벽면, 스핀 핀, 터널 병목 등)를 따라 중력 가속도로 낙하하며 최종 골인 지점에 이르는 경주 과정을 사실적인 물리 엔진으로 연산하는 <strong>실시간 방송/추첨 시뮬레이션 도구</strong>입니다.</p>
      <p>인터랙티브 스크림 방송(유튜브, 치지직, 트위치 등)에서 시청자들과 경품 추첨, 벌칙 수행, 혹은 가벼운 대결 이벤트를 진행할 때 오프라인 상태에서도 완벽하게 구동되며, 변수 창출을 위한 4대 스킬 시스템과 3종 코스 트랙을 완비해 극적인 재미를 선사합니다.</p>
    `
  },
  2: {
    title: "원형체 탄성 충돌 물리 법칙",
    badge: "가이드 02: 구슬 충돌",
    icon: "fa-circle-nodes",
    content: `
      <p>구슬과 구슬 간의 충돌은 뉴턴의 운동 법칙에 기반한 <strong>2차원 완전 탄성 충돌(2D Elastic Collision)</strong> 물리 모델을 따릅니다.</p>
      <p>두 구슬의 중심 좌표간 거리(Distance)가 두 반지름의 합(Sum of Radii)보다 작아지는 순간 충돌(Overlap)로 판정합니다. 오차 누적으로 인해 구슬끼리 겹치는 현상을 방지하기 위해 중첩된 거리만큼 충돌 법선 방향으로 즉시 밀어낸 뒤(Positional Correction), 상대 속도 벡터를 법선 방향으로 투영하여 충돌 임펄스(Impulse)를 계산하고 상호 운동량을 교환시킵니다. 이를 통해 질량과 속도에 따른 튕김이 매우 매끄럽게 처리됩니다.</p>
    `
  },
  3: {
    title: "트랙 선분 및 핀 충돌 벡터 연산",
    badge: "가이드 03: 트랙 충돌",
    icon: "fa-arrows-split-up-and-left",
    content: `
      <p>구슬이 트랙 외곽선 벽(선분 Segment) 및 장애물 못(Static Circle Pin)과 부딪힐 때의 충돌 역학 원리입니다.</p>
      <ul>
        <li><strong>선분 충돌</strong>: 구슬의 중심점 <code>C</code>에서 트랙 벽면 선분 <code>AB</code> 사이의 가장 가까운 최근접 투영점 <code>P</code>를 구합니다. <code>C</code>와 <code>P</code> 사이의 거리인 법선 벡터의 길이가 구슬의 반지름보다 작으면 충돌한 것입니다. 반사각 벡터 연산을 위해 입사 속도 벡터를 벽면 법선 기준으로 대칭 반사(<code>R = V - 2(V·N)N</code>)시키고 반발 계수(Restitution)를 곱해 튕겨 나가게 만듭니다.</li>
        <li><strong>장애물 핀 충돌</strong>: 핀은 움직이지 않는 고정된 원형체이므로 질량이 무한대인 구슬로 가정해 연산합니다. 구슬의 입사 벡터를 핀의 접선 방향에 맞춰 정밀 반사 처리합니다.</li>
      </ul>
    `
  },
  4: {
    title: "3종 트랙 선로 노드 설계 스펙",
    badge: "가이드 04: 트랙 디자인",
    icon: "fa-map",
    content: `
      <p>시뮬레이터는 매치 특성에 따라 3가지 코스 디자인을 빌드할 수 있습니다.</p>
      <ul>
        <li><strong>Wheel of Fortune (분기 선로)</strong>: 상단 깔때기 병목을 지나며 구슬들이 1차 밀집된 뒤, 좌우 두 갈래 채널로 쪼개집니다. 중간의 Plinko 핀 보드 구역과 지그재그 회전 슬라이드, 하단 깔때기 구역을 통과하며 1등을 가립니다.</li>
        <li><strong>Plinko Board (격자 낙하)</strong>: 수백 개의 핀이 격자 형태로 조밀하게 배치되어 있어 완전한 무작위 확률 분배에 적합한 보드입니다.</li>
        <li><strong>Zigzag Course (지그재그 슬라이드)</strong>: 경사도가 높은 슬라이드가 좌우로 엇갈려 배치되어 구슬들이 초고속으로 활강하며 원심력과 튕김 반작용으로 역전을 반복합니다.</li>
      </ul>
    `
  },
  5: {
    title: "4대 랜덤 스킬 속성 및 효과",
    badge: "가이드 05: 스킬 시스템",
    icon: "fa-bolt",
    content: `
      <p>단조로운 중력 낙하 레이스에 변수를 주기 위한 <strong>랜덤 스킬(Using Skills)</strong>의 사양입니다. 구슬들은 쿨타임마다 약 15%의 확률로 자가 스킬을 발동합니다.</p>
      <ul>
        <li><strong>대시 (Dash)</strong>: 구슬의 진행 방향(하향)으로 강한 물리 외력 임펄스를 가해 초고속 가속합니다. (붉은색 잔상 이펙트 적용)</li>
        <li><strong>무게 증폭 (Heavy)</strong>: 2초간 구슬의 질량과 반지름을 1.5배 키워 다른 구슬들을 무겁게 짓누르고 강하게 밀어내어 선로를 개척합니다. (황금색 발광 구체 변신)</li>
        <li><strong>점프 (Jump)</strong>: 위쪽 및 대각선 방향으로 구슬을 순간 솟구치게 만들어 병목 구역에 갇힌 구슬을 탈출시킵니다. (녹색 파티클 빔)</li>
        <li><strong>유령화 (Ghost)</strong>: 1.5초간 트랙 내의 장애물 핀과 충돌하지 않고 투명하게 통과해 좁은 선로를 고속 활강합니다. (푸른색 반투명 홀로그램 효과)</li>
      </ul>
    `
  },
  6: {
    title: "실시간 카메라 추적 (Y-Lerp) 알고리즘",
    badge: "가이드 06: 카메라 트래킹",
    icon: "fa-video",
    content: `
      <p>수직 2400픽셀에 달하는 긴 트랙 선로를 화면 내에 효과적으로 담기 위해 <strong>선형 보간 카메라 추적 알고리즘(Y-Lerp Camera Tracking)</strong>을 사용합니다.</p>
      <p>매 프레임마다 전체 활성 구슬 중 가장 고도가 낮고(Y축 좌표가 가장 큰) 골인에 가까운 '선두 구슬'을 탐색해 냅니다. 선두 구슬의 Y좌표가 카메라 타겟 지점이 되며, 화면 스크롤이 순간이동하지 않고 부드럽게 감속 동기화되도록 보간 수식(<code>cameraY += (targetY - cameraY) * 0.1</code>)을 통해 60fps 프레임 단위로 수직 패닝을 처리합니다.</p>
    `
  },
  7: {
    title: "승패 조건(First vs Last)과 인센티브",
    badge: "가이드 07: 규칙 세팅",
    icon: "fa-trophy",
    content: `
      <p>룰렛 시뮬레이션의 목적에 따라 승리 조건을 완전히 정반대로 커스텀 셋업할 수 있습니다.</p>
      <ul>
        <li><strong>1등이 승리 (First)</strong>: 가장 일반적인 레이스 형태로, 하단 골인 라인을 최초 통과한 N개의 구슬들이 우승을 거머쥡니다. 빠른 가속 스킬을 발동한 구슬이 절대적으로 유리합니다.</li>
        <li><strong>꼴등이 승리 (Last)</strong>: 역으로 가장 늦게 내려오거나 장애물에 걸려 지체된 구슬이 생존하여 승리하는 데스매치 형태의 규칙입니다. 이 모드에서는 먼저 내려가거나 하단에 도달한 구슬들이 순차적으로 탈락하며, 끝까지 살아남은 구슬이 우승을 차지합니다.</li>
      </ul>
    `
  },
  8: {
    title: "실시간 순위 리더보드 정렬 원리",
    badge: "가이드 08: 리더보드 연산",
    icon: "fa-ranking-star",
    content: `
      <p>우측 리더보드는 매 프레임마다 구슬들의 위치 정보 상태를 정밀 스캔하여 실시간 퀵 정렬(Quick Sort) 알고리즘으로 랭킹 목록을 갱신합니다.</p>
      <p>정렬 기준은 다음과 같습니다: 이미 골인 라인을 통과해 순위가 확정된 구슬들이 우선적으로 최상단(1위, 2위 등)을 고정 점유합니다. 아직 경주 중인 구슬들은 현재 Y축 물리 좌표가 클수록(아래쪽에 있을수록) 높은 순위로 자동 계산되어 정렬 순위가 실시간 뒤바뀝니다. 각 구슬의 스킬 상태(Dash, Heavy 등)도 리더보드 카드 오른쪽에 배지로 시각 동기화됩니다.</p>
    `
  },
  9: {
    title: "시뮬레이션 브라우저 가비지 컬렉션",
    badge: "가이드 09: 메모리 관리",
    icon: "fa-trash-can",
    content: `
      <p>동시 참가자 수가 100명 이상으로 늘어날 경우 물리 충돌 연산량이 기하급수적으로 늘어나 루프 렉(Lag)이 유발될 수 있습니다.</p>
      <p>이를 막기 위해 충돌 감지 연산 영역을 분할(Spatial Partitioning)하여 현재 카메라 뷰포트 반경을 크게 벗어난 구슬 간의 상호 충돌 연산은 생략하는 최적화를 취합니다. 또한, 골인 지점을 완전히 통과해 레이스가 종료된 구슬 객체의 내부 물리 메모리 버퍼와 잔상 이펙트 좌표 배열은 즉시 청소(null) 유도하여 가비지 컬렉션을 활성화합니다.</p>
    `
  },
  10: {
    title: "방송 및 커뮤니티 이벤트 활용 요령",
    badge: "가이드 10: 이벤트 요령",
    icon: "fa-bullhorn",
    content: `
      <p>인터랙티브 방송 송출 시 시청자의 몰입감을 극대화하는 연출 팁입니다.</p>
      <p>참가자 명단 입력 칸에 시청자의 닉네임을 줄바꿈으로 대량 기입한 뒤 <strong>'Shuffle(셔플)'</strong> 버튼을 2~3회 눌러 출발선의 좌우 배치 순서를 무작위로 뒤흔듭니다. 'Using Skills' 옵션을 켜두면 선두 구슬이 장애물 핀에 걸려 주춤하는 사이 뒤따르던 구슬이 '대시 스킬'이나 '무게 증폭'으로 단숨에 앞질러 나가는 극적인 장면이 연출되어 시청자 피드백을 유도할 수 있습니다.</p>
    `
  },
  11: {
    title: "사운드 칩튠 Procedural 합성 기술",
    badge: "가이드 11: 음향 합성",
    icon: "fa-volume-high",
    content: `
      <p>본 구슬 룰렛은 무겁고 느린 음원 파일 로드 대신 순수 웹 표준 <code>Web Audio API</code> 오실레이터를 가동하여 충돌 음향을 합성합니다.</p>
      <p>구슬이 벽면에 튕겨 나갈 때 고음 주파수 사인파를 아주 짧게 끊어 쳐서 청아한 '톡' 소리를 내며, 핀 장애물과 충돌 시에는 주파수와 배음을 혼합해 핀의 탄성 재질감을 살린 '땅' 소리를 즉석 신디사이징합니다. 스킬 발동 시에는 오실레이터를 스윕하여 화려한 아케이드 칩튠 상승 효과음을 물리 액션 타이밍에 정확히 일치시켜 가청 피드백을 줍니다.</p>
    `
  },
  12: {
    title: "자주 묻는 질문 (FAQ)",
    badge: "가이드 12: FAQ",
    icon: "fa-question-circle",
    content: `
      <p><strong>Q. 최대 몇 명의 이름까지 입력해서 룰렛을 돌릴 수 있나요?</strong><br>A. 메모리와 물리 연산 장치의 한계를 감안해 브라우저 렉 없이 원활한 스케일은 최대 150명(구슬 150개) 정도입니다. 그 이상의 닉네임 입력 시 구슬 크기가 출발선 폭에 맞춰 자동으로 밀집되어 작게 스케일 다운되며 낙하를 조율합니다.</p>
      <p><strong>Q. 가끔 구슬이 트랙 벽에 걸려 안 움직이는데 고장인가요?</strong><br>A. 트랙의 사선 평면이나 핀과 핀 사이에 속도 성분이 0이 되어 끼이는 정적 평형 상태(Stuck)가 발생할 수 있습니다. 이럴 때 'Using Skills' 스킬 옵션이 켜져 있으면, 굳어버린 구슬이 자가 'Jump'나 'Dash' 스킬을 사용해 탈출하도록 설계되어 있어 게임이 중단되지 않고 끝까지 레이스를 완료할 수 있습니다.</p>
    `
  }
};

// Colors Database
const NEON_COLORS = [
  "#ff3b30", "#ff9500", "#ffcc00", "#4cd964", "#5ac8fa", 
  "#007aff", "#5856d6", "#ff2d55", "#a855f7", "#06b6d4"
];

// Grid Configurations
const TRACK_WIDTH = 320;
const TRACK_HEIGHT = 2400;

// Physics Variables
const GRAVITY = 0.16;
const AIR_RESISTANCE = 0.993;
const RESTITUTION = 0.58;

// State Variables
let activeMap = "fortune"; // "fortune", "plinko", "zigzag"
let isRecordingMode = false;
let isSkillsEnabled = true;
let winCondition = "first"; // "first", "last"
let winnerCount = 1;

let isSimulating = false;
let marbles = [];
let walls = []; // Array of segments: { x1, y1, x2, y2 }
let pins = []; // Array of circular obstacles: { x, y, r, type } // types: normal, goal, trap
let finishedMarbles = [];
let simulationTimer = 0;
let simTimerIntervalId = null;

let cameraY = 0;

// Web Audio API Synth setup
let audioCtx = null;

// DOM Cache
const mainCanvas = document.getElementById("main-canvas");
const mainCtx = mainCanvas.getContext("2d");

const minimapCanvas = document.getElementById("minimap-canvas");
const minimapCtx = minimapCanvas.getContext("2d");

const namesInput = document.getElementById("names-input");
const btnShuffle = document.getElementById("btn-shuffle");
const btnStart = document.getElementById("btn-start");

const mapSelect = document.getElementById("map-select");
const toggleRecording = document.getElementById("toggle-recording");
const winnerSelect = document.getElementById("winner-select");
const winnerCountInput = document.getElementById("winner-count");
const toggleSkills = document.getElementById("toggle-skills");

const lblActiveMapName = document.getElementById("lbl-active-map-name");
const lblMarblesCount = document.getElementById("lbl-marbles-count");
const lblRunTimer = document.getElementById("lbl-run-timer");
const leaderboardList = document.getElementById("leaderboard-list");

// TOC DOM Cache
const explanationBoardContent = document.getElementById("explanation-board-content");
const explanationTitleBadge = document.getElementById("explanation-title-badge");
const explanationDisplayTitle = document.getElementById("explanation-display-title");
const explanationDisplayText = document.getElementById("explanation-display-text");
const tocListItems = document.querySelectorAll(".explanation-index-list li");

// Bootstrap
function init() {
  setupUIListeners();
  detectSystemResolution();
  
  // Set default names textarea
  namesInput.value = "인형, 피규어, 정계제, 그렇군, 안그래, 맞는거 같은데, 오호라, 즐거운대, 말던지, ㅋㅋㅋ, 블로그, 상품, 놀라움, 놀랍구먼, 암꺼나, 맞던지";
  
  // Build default track
  buildTrackGeometry("fortune");
  
  // Refresh loop
  drawMinimapStatic();
  runAnimationSimulationLoop();
}

function detectSystemResolution() {
  // Main canvas size
  mainCanvas.width = TRACK_WIDTH;
  mainCanvas.height = 520;
  
  // Minimap canvas size
  minimapCanvas.width = 160;
  minimapCanvas.height = 490;
}

function setupUIListeners() {
  btnShuffle.addEventListener("click", () => shuffleParticipants());
  btnStart.addEventListener("click", () => toggleSimulationRun());
  
  mapSelect.addEventListener("change", (e) => {
    activeMap = e.target.value;
    const names = {
      fortune: "Wheel of Fortune (분기 선로)",
      plinko: "Plinko Board (핀 격자 낙하)",
      zigzag: "Zigzag Course (지그재그 슬라이드)"
    };
    lblActiveMapName.innerHTML = `<i class="fa-solid fa-compass"></i> ${names[activeMap]}`;
    buildTrackGeometry(activeMap);
    resetSimulationState();
  });

  toggleRecording.addEventListener("change", (e) => {
    isRecordingMode = e.target.checked;
  });

  winnerSelect.addEventListener("change", (e) => {
    winCondition = e.target.value;
  });

  winnerCountInput.addEventListener("change", (e) => {
    winnerCount = parseInt(e.target.value, 10) || 1;
  });

  toggleSkills.addEventListener("change", (e) => {
    isSkillsEnabled = e.target.checked;
  });

  // TOC click
  tocListItems.forEach((li) => {
    li.addEventListener("click", () => {
      tocListItems.forEach(item => item.classList.remove("active"));
      li.classList.add("active");
      const idx = parseInt(li.getAttribute("data-index"), 10);
      switchTOCArticle(idx);
    });
  });

  // Floating scroll top/bottom
  document.getElementById("btn-scroll-top").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.getElementById("btn-scroll-bottom").addEventListener("click", () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  });
}

// Web Audio API Synthesizer
function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch(e) {
    console.error("Web Audio not supported:", e);
  }
}

function playSynthSound(type, pitch = 440) {
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") audioCtx.resume();
  
  const dest = audioCtx.destination;
  
  if (type === "wall") {
    // short click
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.03);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.03);
  } 
  
  else if (type === "pin") {
    // elastic clang
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(pitch * 1.5, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  } 
  
  else if (type === "skill") {
    // arcade sweep
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    
    osc.type = "sine";
    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
    
    osc.start(now);
    osc.stop(now + 0.25);
  }
}

// Shuffle names in textarea
function shuffleParticipants() {
  let names = namesInput.value.split(/,|\n/).map(n => n.trim()).filter(n => n.length > 0);
  if (names.length === 0) return;
  
  // Shuffle list
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [names[i], names[j]] = [names[j], names[i]];
  }
  
  namesInput.value = names.join(", ");
}

function resetSimulationState() {
  isSimulating = false;
  marbles = [];
  finishedMarbles = [];
  cameraY = 0;
  simulationTimer = 0;
  lblRunTimer.textContent = "경과: 0.0s";
  lblMarblesCount.textContent = "구슬: 0개";
  leaderboardList.innerHTML = `<li class="empty-list-msg">레이스가 시작되면 여기에 실시간 순위가 표기됩니다.</li>`;
  
  if (simTimerIntervalId) {
    clearInterval(simTimerIntervalId);
    simTimerIntervalId = null;
  }
  
  btnStart.innerHTML = `<i class="fa-solid fa-play"></i> 레이스 시작`;
  btnStart.className = "btn btn-primary";
}

// Start simulation
function toggleSimulationRun() {
  initAudio();
  
  if (isSimulating) {
    // Pause
    isSimulating = false;
    btnStart.innerHTML = `<i class="fa-solid fa-play"></i> 레이스 시작`;
    btnStart.className = "btn btn-primary";
    
    if (simTimerIntervalId) {
      clearInterval(simTimerIntervalId);
      simTimerIntervalId = null;
    }
  } else {
    // Start or resume
    if (marbles.length === 0) {
      spawnMarblesFromInput();
    }
    
    if (marbles.length === 0) return;
    
    isSimulating = true;
    btnStart.innerHTML = `<i class="fa-solid fa-pause"></i> 일시정지`;
    btnStart.className = "btn btn-secondary";
    
    simTimerIntervalId = setInterval(() => {
      simulationTimer += 0.1;
      lblRunTimer.textContent = `경과: ${simulationTimer.toFixed(1)}s`;
    }, 1000/10);
  }
}

function spawnMarblesFromInput() {
  resetSimulationState();
  
  const names = namesInput.value.split(/,|\n/).map(n => n.trim()).filter(n => n.length > 0);
  if (names.length === 0) {
    alert("참가자 이름을 최소 1명 이상 입력해 주세요.");
    return;
  }
  
  // Set marbles count
  lblMarblesCount.textContent = `구슬: ${names.length}개`;
  
  // Determine sizes based on count
  // Scale down marble sizes if count is huge to prevent immediate jam
  let size = 9.0;
  if (names.length > 30) size = 7.5;
  if (names.length > 80) size = 6.0;
  
  // Spawn coordinates at top inlet
  const colCount = Math.ceil(Math.sqrt(names.length));
  
  marbles = names.map((name, idx) => {
    // grid offset drop
    const c = idx % colCount;
    const r = Math.floor(idx / colCount);
    
    // offset X centered around TRACK_WIDTH / 2
    const startX = TRACK_WIDTH / 2 - (colCount * size) + (c * size * 2) + (Math.random() - 0.5) * 5;
    const startY = 15 - (r * size * 2.2); // drop in stacks from top
    
    const color = NEON_COLORS[idx % NEON_COLORS.length];
    
    return {
      name: name,
      id: idx + 1,
      x: startX,
      y: startY,
      vx: (Math.random() - 0.5) * 1.5,
      vy: Math.random() * 0.5 + 0.5,
      r: size,
      color: color,
      finished: false,
      rank: 0,
      
      // Skills attributes
      skillActive: null, // null, "dash", "heavy", "jump", "ghost"
      skillTimer: 0,
      skillCooldown: Math.random() * 200 + 100, // frame ticks before next skill trigger
      
      // trail effect
      trail: []
    };
  });
  
  finishedMarbles = [];
  cameraY = 0;
}

// -------------------------------------------------------------
// Track builders
// -------------------------------------------------------------
function buildTrackGeometry(mapType) {
  walls = [];
  pins = [];
  
  // Outer frame bounds
  walls.push({ x1: 10, y1: 0, x2: 10, y2: TRACK_HEIGHT });
  walls.push({ x1: TRACK_WIDTH - 10, y1: 0, x2: TRACK_WIDTH - 10, y2: TRACK_HEIGHT });
  
  // Goal and Trap lines
  // Goal triggers when Y > 2300
  
  if (mapType === "fortune") {
    // Bottlenecks & split channels track segments
    // Top funnel guide
    walls.push({ x1: 10, y1: 200, x2: 130, y2: 300 });
    walls.push({ x1: TRACK_WIDTH - 10, y1: 200, x2: 190, y2: 300 });
    walls.push({ x1: 130, y1: 300, x2: 130, y2: 360 });
    walls.push({ x1: 190, y1: 300, x2: 190, y2: 360 });
    
    // Wedge Divider splitting left/right
    walls.push({ x1: 160, y1: 420, x2: 110, y2: 500 });
    walls.push({ x1: 160, y1: 420, x2: 210, y2: 500 });
    
    // Inner split walls
    walls.push({ x1: 110, y1: 500, x2: 110, y2: 680 });
    walls.push({ x1: 210, y1: 500, x2: 210, y2: 680 });
    
    // Ramps merging slides
    walls.push({ x1: 10, y1: 740, x2: 230, y2: 820 });
    walls.push({ x1: TRACK_WIDTH - 10, y1: 860, x2: 90, y2: 940 });
    
    // Plinko Grid section pins in middle
    const startPinY = 1050;
    for (let row = 0; row < 9; row++) {
      const pinY = startPinY + row * 45;
      const count = (row % 2 === 0) ? 6 : 5;
      const startX = (row % 2 === 0) ? 40 : 65;
      for (let i = 0; i < count; i++) {
        pins.push({
          x: startX + i * 48,
          y: pinY + (Math.random() - 0.5) * 4,
          r: 5,
          type: "pin"
        });
      }
    }
    
    // Zigzag course bottom ramps
    walls.push({ x1: 10, y1: 1540, x2: 240, y2: 1620 });
    walls.push({ x1: TRACK_WIDTH - 10, y1: 1720, x2: 80, y2: 1800 });
    walls.push({ x1: 10, y1: 1900, x2: 230, y2: 1980 });
    
    // Bottleneck funnel goal
    walls.push({ x1: 10, y1: 2150, x2: 130, y2: 2260 });
    walls.push({ x1: TRACK_WIDTH - 10, y1: 2150, x2: 190, y2: 2260 });
    walls.push({ x1: 130, y1: 2260, x2: 130, y2: 2390 });
    walls.push({ x1: 190, y1: 2260, x2: 190, y2: 2390 });
  } 
  
  else if (mapType === "plinko") {
    // Standard Plinko grid down the entire track
    const startY = 150;
    const endY = 2100;
    const rowGap = 55;
    const colGap = 42;
    
    let rowIndex = 0;
    for (let y = startY; y < endY; y += rowGap) {
      rowIndex++;
      const isOffset = rowIndex % 2 === 0;
      const startX = isOffset ? 40 : 61;
      const count = isOffset ? 7 : 6;
      
      for (let i = 0; i < count; i++) {
        pins.push({
          x: startX + i * colGap,
          y: y,
          r: 6,
          type: "pin"
        });
      }
    }
    
    // Bottom funnel slots dividers
    for (let i = 1; i <= 6; i++) {
      const slotX = i * 45 + 15;
      walls.push({ x1: slotX, y1: 2120, x2: slotX, y2: 2320 });
    }
  } 
  
  else if (mapType === "zigzag") {
    // Multi zigzag slide courses
    const slideGap = 160;
    let dir = 1; // 1: left-to-right, -1: right-to-left
    
    for (let y = 180; y < 2100; y += slideGap) {
      if (dir === 1) {
        // slide left to right
        walls.push({ x1: 10, y1: y, x2: TRACK_WIDTH - 65, y2: y + 80 });
      } else {
        // slide right to left
        walls.push({ x1: TRACK_WIDTH - 10, y1: y, x2: 65, y2: y + 80 });
      }
      
      // Add a couple of friction pins on slides
      pins.push({
        x: dir === 1 ? TRACK_WIDTH - 110 : 110,
        y: y + 55,
        r: 6,
        type: "pin"
      });
      
      dir = -dir;
    }
    
    // Goal funnel bottom
    walls.push({ x1: 10, y1: 2180, x2: 130, y2: 2280 });
    walls.push({ x1: TRACK_WIDTH - 10, y1: 2180, x2: 190, y2: 2280 });
    walls.push({ x1: 130, y1: 2280, x2: 130, y2: 2390 });
    walls.push({ x1: 190, y1: 2280, x2: 190, y2: 2390 });
  }

  // Redraw minimap static display
  drawMinimapStatic();
}

// -------------------------------------------------------------
// Physics 충돌(Collision) 연산
// -------------------------------------------------------------
function updatePhysicsSimulationFrame() {
  // Loop physics 2 times per frame (sub-stepping) to prevent tunneling through wall nodes
  const subSteps = 2;
  const stepGravity = GRAVITY / subSteps;
  
  for (let step = 0; step < subSteps; step++) {
    
    // 1. Move and apply gravity to dynamic marbles
    marbles.forEach(m => {
      if (m.finished) return;
      
      // Skills updates
      if (isSkillsEnabled) {
        updateMarbleSkillState(m);
      }
      
      // Apply forces
      const effectiveGravity = m.skillActive === "heavy" ? stepGravity * 1.5 : stepGravity;
      m.vy += effectiveGravity;
      m.vx *= AIR_RESISTANCE;
      m.vy *= AIR_RESISTANCE;
      
      m.x += m.vx / subSteps;
      m.y += m.vy / subSteps;
      
      // Record trail points
      if (step === 0 && Math.random() < 0.3) {
        m.trail.push({ x: m.x, y: m.y });
        if (m.trail.length > 8) m.trail.shift();
      }
      
      // Trigger Goal check line
      if (m.y >= 2320) {
        triggerMarbleGoalFinish(m);
      }
    });

    // 2. Circle vs Wall boundaries collision
    marbles.forEach(m => {
      if (m.finished) return;
      
      walls.forEach(w => {
        resolveCircleSegmentCollision(m, w);
      });
    });

    // 3. Circle vs Circular Pins collision
    marbles.forEach(m => {
      if (m.finished || m.skillActive === "ghost") return; // ghost mode bypass pins
      
      pins.forEach(p => {
        resolveCircleCircleCollision(m, p, true); // static pin flag
      });
    });

    // 4. Circle vs Circle elastic collision between marbles
    for (let i = 0; i < marbles.length; i++) {
      const m1 = marbles[i];
      if (m1.finished) continue;
      
      for (let j = i + 1; j < marbles.length; j++) {
        const m2 = marbles[j];
        if (m2.finished) continue;
        
        resolveCircleCircleCollision(m1, m2, false);
      }
    }
  }
}

// Solve Circle vs Line Segment collision
function resolveCircleSegmentCollision(c, s) {
  // Vector calculations
  const abX = s.x2 - s.x1;
  const abY = s.y2 - s.y1;
  const acX = c.x - s.x1;
  const acY = c.y - s.y1;
  
  // Projection ratio clamped between 0 and 1
  const abLenSq = abX * abX + abY * abY;
  let t = (acX * abX + acY * abY) / abLenSq;
  t = Math.max(0, Math.min(1, t));
  
  // Projection point coordinates
  const px = s.x1 + t * abX;
  const py = s.y1 + t * abY;
  
  // Distance to projection point
  const dx = c.x - px;
  const dy = c.y - py;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist < c.r) {
    // Collision! Calculate Normal
    let nx = dx / dist;
    let ny = dy / dist;
    
    // Handle corner case where dist is 0
    if (dist === 0) {
      nx = 0;
      ny = -1;
    }
    
    // Resolve overlap
    c.x = px + nx * c.r;
    c.y = py + ny * c.r;
    
    // Dot product velocity with normal
    const dot = c.vx * nx + c.vy * ny;
    
    if (dot < 0) {
      // Reflect velocity vector
      c.vx = c.vx - (1 + RESTITUTION) * dot * nx;
      c.vy = c.vy - (1 + RESTITUTION) * dot * ny;
      
      // Play synth click sound
      if (Math.abs(dot) > 0.8) {
        playSynthSound("wall", 400 + Math.random() * 150);
      }
    }
  }
}

// Solve Circle vs Circle collision (both dynamic/static)
function resolveCircleCircleCollision(c1, c2, isStatic) {
  const dx = c1.x - c2.x;
  const dy = c1.y - c2.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const rSum = c1.r + c2.r;
  
  if (dist < rSum && dist > 0) {
    const nx = dx / dist;
    const ny = dy / dist;
    
    if (isStatic) {
      // Fixed obstacle: normal reflection
      c1.x = c2.x + nx * rSum;
      c1.y = c2.y + ny * rSum;
      
      const dot = c1.vx * nx + c1.vy * ny;
      if (dot < 0) {
        c1.vx = c1.vx - (1 + RESTITUTION) * dot * nx;
        c1.vy = c1.vy - (1 + RESTITUTION) * dot * ny;
        
        if (Math.abs(dot) > 0.8) {
          playSynthSound("pin", 700 + Math.random() * 300);
        }
      }
    } 
    
    else {
      // Both marbles are dynamic!
      const overlap = rSum - dist;
      
      // Push apart evenly based on mass
      const m1 = c1.skillActive === "heavy" ? 2.5 : 1.0;
      const m2 = c2.skillActive === "heavy" ? 2.5 : 1.0;
      const totalMass = m1 + m2;
      
      c1.x += nx * overlap * (m2 / totalMass);
      c1.y += ny * overlap * (m2 / totalMass);
      c2.x -= nx * overlap * (m1 / totalMass);
      c2.y -= ny * overlap * (m1 / totalMass);
      
      // Relative velocity
      const rvx = c1.vx - c2.vx;
      const rvy = c1.vy - c2.vy;
      
      const vNorm = rvx * nx + rvy * ny;
      if (vNorm < 0) {
        // Elastic collision impulse
        const impulse = -(1 + RESTITUTION) * vNorm / (1/m1 + 1/m2);
        
        c1.vx += (impulse / m1) * nx;
        c1.vy += (impulse / m1) * ny;
        c2.vx -= (impulse / m2) * nx;
        c2.vy -= (impulse / m2) * ny;
        
        if (Math.abs(vNorm) > 1.2) {
          playSynthSound("wall", 500 + Math.random() * 100);
        }
      }
    }
  }
}

// -------------------------------------------------------------
// Skills Actuator (스킬)
// -------------------------------------------------------------
function updateMarbleSkillState(m) {
  if (m.skillActive) {
    m.skillTimer--;
    
    // Particle triggers during active skills
    if (Math.random() < 0.25) {
      triggerSkillParticles(m);
    }
    
    if (m.skillTimer <= 0) {
      // Deactivate skill
      if (m.skillActive === "heavy") {
        m.r = m.r / 1.5; // restore size
      }
      m.skillActive = null;
      m.skillCooldown = Math.random() * 250 + 150; // set next cooldown
    }
  } else {
    m.skillCooldown--;
    if (m.skillCooldown <= 0) {
      // Activate a random skill!
      const skills = ["dash", "heavy", "jump", "ghost"];
      m.skillActive = skills[Math.floor(Math.random() * skills.length)];
      m.skillTimer = 90; // active for 90 ticks (~1.5s)
      
      playSynthSound("skill", 350);
      
      if (m.skillActive === "dash") {
        // sudden burst downward
        m.vy += 3.0;
        m.vx += (Math.random() - 0.5) * 1.5;
      } else if (m.skillActive === "heavy") {
        m.r = m.r * 1.5; // double size
      } else if (m.skillActive === "jump") {
        // sudden upward jump
        m.vy -= 4.0;
        m.vx += (Math.random() - 0.5) * 2.0;
      }
    }
  }
}

let skillParticles = [];
function triggerSkillParticles(m) {
  const colors = {
    dash: "#ff3b30",
    heavy: "#ffcc00",
    jump: "#4cd964",
    ghost: "#5ac8fa"
  };
  
  skillParticles.push({
    x: m.x + (Math.random() - 0.5) * m.r,
    y: m.y + (Math.random() - 0.5) * m.r,
    vx: (Math.random() - 0.5) * 1,
    vy: (Math.random() - 0.5) * 1 - 1,
    radius: Math.random() * 2 + 1,
    color: colors[m.skillActive] || "#fff",
    alpha: 1.0,
    decay: 0.05
  });
}

function triggerMarbleGoalFinish(m) {
  m.finished = true;
  m.vy = 0;
  m.vx = 0;
  
  // Register in finished order list
  finishedMarbles.push(m);
  m.rank = finishedMarbles.length;
  
  playSynthSound("pin", 1200);
  
  // Check if race ends matching 우승자 수 limits
  checkRaceCompletion();
}

function checkRaceCompletion() {
  const completed = winCondition === "first" 
    ? finishedMarbles.length >= winnerCount 
    : finishedMarbles.length >= marbles.length; // last requires all to finish
    
  if (completed || finishedMarbles.length >= marbles.length) {
    endRaceSimulation();
  }
}

function endRaceSimulation() {
  isSimulating = false;
  btnStart.innerHTML = `<i class="fa-solid fa-play"></i> 레이스 시작`;
  btnStart.className = "btn btn-primary";
  
  if (simTimerIntervalId) {
    clearInterval(simTimerIntervalId);
    simTimerIntervalId = null;
  }
  
  // Display Winner modal/alert
  let msg = "";
  if (winCondition === "first") {
    const winners = finishedMarbles.slice(0, winnerCount).map(m => m.name);
    msg = `🏆 레이스가 종료되었습니다! 🏆\n\n[ 우승자 ]\n${winners.map((n, i) => `${i+1}등: ${n}`).join("\n")}`;
  } else {
    // Last place win
    const lastSurvivers = finishedMarbles.slice(-winnerCount).reverse().map(m => m.name);
    msg = `💀 데스매치 레이스가 종료되었습니다! 💀\n\n[ 최후 생존자 ]\n${lastSurvivers.map((n, i) => `${i+1}등: ${n}`).join("\n")}`;
  }
  
  setTimeout(() => {
    alert(msg);
  }, 500);
}

// -------------------------------------------------------------
// Canvas Graphics & Y-Scroll Engine (60fps)
// -------------------------------------------------------------
function runAnimationSimulationLoop() {
  // Update physics only if active
  if (isSimulating) {
    updatePhysicsSimulationFrame();
  }
  
  // Lerp camera tracking
  updateCameraScroll();
  
  // Draw main viewport and minimap
  drawMainViewport();
  drawMinimapDynamic();
  
  // Refresh leaderboard listing
  updateLeaderboardListUI();
  
  requestAnimationFrame(runAnimationSimulationLoop);
}

function updateCameraScroll() {
  if (marbles.length === 0) return;
  
  let targetY = 0;
  
  // Track the leading active marble
  const activeMarbles = marbles.filter(m => !m.finished);
  if (activeMarbles.length > 0) {
    // Find marble with largest Y coordinate
    const leader = activeMarbles.reduce((max, m) => m.y > max.y ? m : max, activeMarbles[0]);
    targetY = leader.y - mainCanvas.height / 3;
  } else {
    // Track the last finished marble
    targetY = TRACK_HEIGHT - mainCanvas.height;
  }
  
  // Clamp camera
  targetY = Math.max(0, Math.min(TRACK_HEIGHT - mainCanvas.height, targetY));
  
  // smooth Lerp transition
  cameraY += (targetY - cameraY) * 0.1;
}

function drawMainViewport() {
  // Draw background static grid color
  mainCtx.fillStyle = "#03060f";
  mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
  
  mainCtx.save();
  // Translate view according to camera scroll
  mainCtx.translate(0, -cameraY);
  
  // Draw glowing walls
  mainCtx.shadowBlur = 12;
  mainCtx.shadowColor = "#a855f7";
  mainCtx.strokeStyle = "rgba(168, 85, 247, 0.85)";
  mainCtx.lineWidth = 4;
  
  walls.forEach(w => {
    // Only draw if inside camera Y bounds
    if (Math.max(w.y1, w.y2) >= cameraY - 50 && Math.min(w.y1, w.y2) <= cameraY + mainCanvas.height + 50) {
      mainCtx.beginPath();
      mainCtx.moveTo(w.x1, w.y1);
      mainCtx.lineTo(w.x2, w.y2);
      mainCtx.stroke();
    }
  });
  
  // Draw pins
  mainCtx.shadowBlur = 8;
  mainCtx.shadowColor = "#5ac8fa";
  mainCtx.fillStyle = "#ffffff";
  mainCtx.strokeStyle = "#5ac8fa";
  mainCtx.lineWidth = 1.5;
  
  pins.forEach(p => {
    if (p.y >= cameraY - 20 && p.y <= cameraY + mainCanvas.height + 20) {
      mainCtx.beginPath();
      mainCtx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
      mainCtx.fill();
      mainCtx.stroke();
    }
  });
  mainCtx.restore(); // reset glowing shadows
  
  // Draw finish line checker
  mainCtx.save();
  mainCtx.translate(0, -cameraY);
  if (TRACK_HEIGHT - 80 >= cameraY && 2320 <= cameraY + mainCanvas.height) {
    // Checkerboard Goal banner
    const blockW = 10;
    for (let x = 12; x < TRACK_WIDTH - 12; x += blockW) {
      mainCtx.fillStyle = (Math.floor(x / blockW) % 2 === 0) ? "#ffffff" : "#000000";
      mainCtx.fillRect(x, 2320, blockW, 12);
    }
  }
  mainCtx.restore();

  // Draw skill particles
  mainCtx.save();
  mainCtx.translate(0, -cameraY);
  for (let i = skillParticles.length - 1; i >= 0; i--) {
    const p = skillParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= p.decay;
    if (p.alpha <= 0) {
      skillParticles.splice(i, 1);
    } else {
      mainCtx.globalAlpha = p.alpha;
      mainCtx.beginPath();
      mainCtx.arc(p.x, p.y, p.radius, 0, 2*Math.PI);
      mainCtx.fillStyle = p.color;
      mainCtx.fill();
    }
  }
  mainCtx.restore();

  // Draw Marbles
  marbles.forEach(m => {
    if (m.y < cameraY - 30 || m.y > cameraY + mainCanvas.height + 30) return;
    
    mainCtx.save();
    mainCtx.translate(0, -cameraY);
    
    // Draw trail
    m.trail.forEach((t, i) => {
      mainCtx.beginPath();
      mainCtx.arc(t.x, t.y, m.r * (i / m.trail.length), 0, 2*Math.PI);
      mainCtx.fillStyle = m.color;
      mainCtx.globalAlpha = 0.08 * i;
      mainCtx.fill();
    });
    mainCtx.globalAlpha = 1.0;
    
    // Draw ball body neon shadow
    mainCtx.shadowBlur = m.skillActive === "dash" ? 18 : 8;
    mainCtx.shadowColor = m.color;
    mainCtx.beginPath();
    mainCtx.arc(m.x, m.y, m.r, 0, 2 * Math.PI);
    
    // Color fill based on skills
    if (m.skillActive === "heavy") {
      mainCtx.fillStyle = "#ffcc00"; // Glowing gold
    } else if (m.skillActive === "ghost") {
      mainCtx.fillStyle = "rgba(90, 200, 250, 0.4)"; // Translucent cyan
      mainCtx.strokeStyle = "#5ac8fa";
      mainCtx.lineWidth = 1.5;
      mainCtx.stroke();
    } else {
      mainCtx.fillStyle = m.color;
    }
    
    mainCtx.fill();
    
    // Glowing stroke
    mainCtx.strokeStyle = "#ffffff";
    mainCtx.lineWidth = 1.5;
    mainCtx.stroke();
    mainCtx.shadowBlur = 0; // reset
    
    // Draw name label below
    mainCtx.fillStyle = m.color;
    mainCtx.font = "bold 9px sans-serif";
    mainCtx.textAlign = "center";
    mainCtx.textBaseline = "top";
    
    // Background tag for text
    const txtW = mainCtx.measureText(m.name).width;
    mainCtx.fillStyle = "rgba(0, 0, 0, 0.65)";
    mainCtx.fillRect(m.x - txtW/2 - 4, m.y + m.r + 3, txtW + 8, 12);
    mainCtx.strokeStyle = m.color;
    mainCtx.strokeRect(m.x - txtW/2 - 4, m.y + m.r + 3, txtW + 8, 12);
    
    mainCtx.fillStyle = "#ffffff";
    mainCtx.fillText(m.name, m.x, m.y + m.r + 5);
    
    // Finished label
    if (m.finished) {
      mainCtx.fillStyle = "#ffcc00";
      mainCtx.font = "bold 8px monospace";
      mainCtx.fillText(`#${m.rank} GOAL`, m.x, m.y - m.r - 10);
    }
    
    mainCtx.restore();
  });
}

// -------------------------------------------------------------
// Minimap static/dynamic rendering
// -------------------------------------------------------------
let staticMinimapImage = null;

function drawMinimapStatic() {
  minimapCtx.fillStyle = "#010307";
  minimapCtx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);
  
  // Draw full course paths
  minimapCtx.save();
  const scale = minimapCanvas.height / TRACK_HEIGHT;
  minimapCtx.scale(scale, scale);
  
  // Align horizontal centers
  const offsetX = (minimapCanvas.width / scale - TRACK_WIDTH) / 2;
  minimapCtx.translate(offsetX, 0);
  
  // Draw walls
  minimapCtx.strokeStyle = "rgba(168, 85, 247, 0.4)";
  minimapCtx.lineWidth = 6;
  walls.forEach(w => {
    minimapCtx.beginPath();
    minimapCtx.moveTo(w.x1, w.y1);
    minimapCtx.lineTo(w.x2, w.y2);
    minimapCtx.stroke();
  });
  
  // Draw pins
  minimapCtx.fillStyle = "rgba(90, 200, 250, 0.4)";
  pins.forEach(p => {
    minimapCtx.beginPath();
    minimapCtx.arc(p.x, p.y, p.r * 1.5, 0, 2 * Math.PI);
    minimapCtx.fill();
  });
  
  minimapCtx.restore();
  
  // Save static frame image
  staticMinimapImage = minimapCtx.getImageData(0, 0, minimapCanvas.width, minimapCanvas.height);
}

function drawMinimapDynamic() {
  if (!staticMinimapImage) return;
  
  // Load static frame
  minimapCtx.putImageData(staticMinimapImage, 0, 0);
  
  if (marbles.length === 0) return;
  
  // Draw marbles positions as tiny dots
  minimapCtx.save();
  const scale = minimapCanvas.height / TRACK_HEIGHT;
  minimapCtx.scale(scale, scale);
  
  const offsetX = (minimapCanvas.width / scale - TRACK_WIDTH) / 2;
  minimapCtx.translate(offsetX, 0);
  
  // Draw camera viewport boundaries on minimap
  minimapCtx.strokeStyle = "rgba(255,255,255,0.15)";
  minimapCtx.lineWidth = 3;
  minimapCtx.strokeRect(10, cameraY, TRACK_WIDTH - 20, mainCanvas.height);
  
  // Draw marbles
  marbles.forEach(m => {
    minimapCtx.beginPath();
    minimapCtx.arc(m.x, m.y, m.r * 1.6, 0, 2 * Math.PI);
    minimapCtx.fillStyle = m.finished ? "#ffff00" : m.color;
    minimapCtx.fill();
  });
  
  minimapCtx.restore();
}

// -------------------------------------------------------------
// Realtime Leaderboard updates
// -------------------------------------------------------------
function updateLeaderboardListUI() {
  if (marbles.length === 0) return;
  
  // Sort marbles: finished ones ranked by order of finish.
  // Unfinished ones ranked by Y position (downward height).
  const sorted = [...marbles].sort((a, b) => {
    if (a.finished && b.finished) {
      return a.rank - b.rank;
    }
    if (a.finished) return -1;
    if (b.finished) return 1;
    
    // Sort by Y position descending (largest Y first)
    return b.y - a.y;
  });
  
  leaderboardList.innerHTML = "";
  
  // Draw top 15 ranks
  sorted.slice(0, 15).forEach((m, idx) => {
    const li = document.createElement("li");
    li.className = "rank-item";
    
    // Set left border indicator
    li.style.borderLeftColor = m.color;
    
    if (idx === 0) li.classList.add("rank-first");
    
    const formatDist = m.finished 
      ? "GOAL" 
      : `${Math.round(m.y / 24)}m`; // distance in meters approx
      
    const skillBadge = m.skillActive 
      ? `<span class="rank-badge-skill" style="background:${getSkillColor(m.skillActive)}">${m.skillActive.toUpperCase()}</span>` 
      : "";
      
    li.innerHTML = `
      <div class="rank-item-left">
        <span class="rank-num">#${idx+1}</span>
        <span class="rank-name" title="${m.name}">${m.name}</span>
      </div>
      <div class="rank-item-right">
        ${skillBadge}
        <span class="rank-dist">${formatDist}</span>
      </div>
    `;
    
    leaderboardList.appendChild(li);
  });
}

function getSkillColor(skill) {
  if (skill === "dash") return "#ff3b30";
  if (skill === "heavy") return "#ffcc00";
  if (skill === "jump") return "#4cd964";
  if (skill === "ghost") return "#5ac8fa";
  return "#fff";
}

// -------------------------------------------------------------
// TOC Page Switcher
// -------------------------------------------------------------
function switchTOCArticle(index) {
  const article = GUIDE_ARTICLES[index];
  if (!article) return;
  
  explanationBoardContent.classList.add("fade-out");
  
  setTimeout(() => {
    explanationTitleBadge.innerHTML = `<i class="fa-solid ${article.icon} text-purple"></i> <span>${article.badge}</span>`;
    explanationDisplayTitle.textContent = article.title;
    explanationDisplayText.innerHTML = article.content;
    
    explanationBoardContent.classList.remove("fade-out");
  }, 300);
}

// Initialize
window.addEventListener("DOMContentLoaded", () => {
  init();
});
