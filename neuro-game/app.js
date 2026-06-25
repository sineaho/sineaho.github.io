// ============================================================
// CineAHO Premium 3D Neuro Reflex Game – app.js
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // ── DOM refs ──
  const arena      = document.getElementById('arena');
  const scoreEl    = document.getElementById('lbl-score');
  const timerEl    = document.getElementById('lbl-timer');
  const avgEl      = document.getElementById('lbl-avg-reaction');
  const bestEl     = document.getElementById('lbl-best');
  const restartBtn = document.getElementById('btn-restart');
  const overlayBtn = document.getElementById('btn-overlay-start');
  const overlay    = document.getElementById('overlay-screen');
  const diffBtns   = document.querySelectorAll('.btn-diff');

  // ── Difficulty presets ──
  const PRESETS = {
    easy:   { duration: 30, spawnMin: 1200, spawnMax: 1800, sizeMin: 54, sizeMax: 72, label: '쉬움' },
    normal: { duration: 30, spawnMin: 800,  spawnMax: 1400, sizeMin: 42, sizeMax: 60, label: '보통' },
    hard:   { duration: 30, spawnMin: 500,  spawnMax: 900,  sizeMin: 30, sizeMax: 48, label: '어려움' }
  };

  // ── Target color palette ──
  const TARGET_COLORS = [
    'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
    'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
    'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
  ];

  const TARGET_ICONS = [
    'fa-solid fa-bolt',
    'fa-solid fa-star',
    'fa-solid fa-brain',
    'fa-solid fa-fire',
    'fa-solid fa-crosshairs',
    'fa-solid fa-diamond',
    'fa-solid fa-atom'
  ];

  // ── State ──
  let currentDiff  = 'normal';
  let score        = 0;
  let remaining    = 30;
  let gameRunning  = false;
  let timerId      = null;
  let spawnId      = null;
  let reactionTimes = [];
  let targetSpawnTime = 0;

  // ── localStorage best scores ──
  const getBest = () => { try { return JSON.parse(localStorage.getItem('neuroBest') || '{}'); } catch { return {}; } };
  const saveBest = (key, val) => { const d = getBest(); d[key] = val; localStorage.setItem('neuroBest', JSON.stringify(d)); };
  const showBest = () => { const b = getBest()[currentDiff]; bestEl.textContent = b != null ? `${b}점` : '--'; };

  // ── Random helpers ──
  const rand = (min, max) => Math.random() * (max - min) + min;
  const randInt = (min, max) => Math.floor(rand(min, max + 1));
  const pick = arr => arr[randInt(0, arr.length - 1)];

  // ── Spawn target ──
  const spawnTarget = () => {
    // Remove old target
    const old = arena.querySelector('.target');
    if (old) old.remove();

    const preset = PRESETS[currentDiff];
    const size = randInt(preset.sizeMin, preset.sizeMax);
    const arenaRect = arena.getBoundingClientRect();
    const maxX = arenaRect.width - size - 10;
    const maxY = arenaRect.height - size - 10;
    const x = rand(10, Math.max(10, maxX));
    const y = rand(10, Math.max(10, maxY));

    const target = document.createElement('div');
    target.className = 'target';
    target.style.width = `${size}px`;
    target.style.height = `${size}px`;
    target.style.left = `${x}px`;
    target.style.top = `${y}px`;
    target.style.background = pick(TARGET_COLORS);
    target.style.boxShadow = `0 0 20px rgba(244, 63, 94, 0.3), inset 0 0 15px rgba(255,255,255,0.1)`;

    const ring = document.createElement('div');
    ring.className = 'target-ring';

    const inner = document.createElement('div');
    inner.className = 'target-inner';
    inner.innerHTML = `<i class="${pick(TARGET_ICONS)}"></i>`;

    target.appendChild(ring);
    target.appendChild(inner);

    target.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!gameRunning) return;

      // Calculate reaction time
      const rt = Date.now() - targetSpawnTime;
      reactionTimes.push(rt);

      score++;
      scoreEl.textContent = score;

      // Update average
      const avg = Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length);
      avgEl.textContent = `${avg}ms`;

      // Hit effect
      showHitEffect(e.clientX - arenaRect.left, e.clientY - arenaRect.top, target.style.background);

      target.remove();
    });

    arena.appendChild(target);
    targetSpawnTime = Date.now();
  };

  // ── Hit effect ──
  const showHitEffect = (x, y, bg) => {
    const effect = document.createElement('div');
    effect.className = 'hit-effect';
    effect.style.width = '40px';
    effect.style.height = '40px';
    effect.style.left = `${x - 20}px`;
    effect.style.top = `${y - 20}px`;
    effect.style.background = bg;
    arena.appendChild(effect);
    setTimeout(() => effect.remove(), 500);
  };

  // ── Arena miss click ──
  arena.addEventListener('click', (e) => {
    if (!gameRunning) return;
    if (e.target === arena || e.target.closest('.target') === null) {
      // Miss flash
      const flash = document.createElement('div');
      flash.className = 'miss-flash';
      arena.appendChild(flash);
      setTimeout(() => flash.remove(), 300);
    }
  });

  // ── Game loop ──
  const startGame = () => {
    const preset = PRESETS[currentDiff];
    remaining = preset.duration;
    score = 0;
    reactionTimes = [];
    scoreEl.textContent = '0';
    timerEl.textContent = `${remaining}s`;
    avgEl.textContent = '--ms';
    showBest();
    gameRunning = true;
    overlay.classList.add('hidden');

    // Remove any complete overlay
    const co = arena.closest('.arena-panel')?.querySelector('.complete-overlay');
    if (co) co.remove();

    // Timer
    timerId = setInterval(() => {
      remaining--;
      timerEl.textContent = `${remaining}s`;
      if (remaining <= 0) endGame();
    }, 1000);

    // Spawn loop
    const spawnLoop = () => {
      if (!gameRunning) return;
      spawnTarget();
      const next = rand(preset.spawnMin, preset.spawnMax);
      spawnId = setTimeout(spawnLoop, next);
    };
    spawnLoop();
  };

  const endGame = () => {
    gameRunning = false;
    clearInterval(timerId);
    clearTimeout(spawnId);
    const old = arena.querySelector('.target');
    if (old) old.remove();

    // Save best
    const best = getBest()[currentDiff];
    if (best == null || score > best) saveBest(currentDiff, score);
    showBest();

    // Build complete overlay
    const avg = reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;

    const div = document.createElement('div');
    div.className = 'complete-overlay';
    div.innerHTML = `
      <div class="complete-inner">
        <div class="trophy-icon"><i class="fa-solid fa-trophy"></i></div>
        <h2>⏱️ 시간 종료!</h2>
        <p class="result-line">최종 점수: <strong>${score}점</strong></p>
        <p class="result-line">평균 반응속도: <strong>${avg}ms</strong></p>
        <p class="result-line">난이도: <strong>${PRESETS[currentDiff].label}</strong></p>
        <button class="btn btn-primary btn-large" id="btn-play-again">
          <i class="fa-solid fa-rotate-right"></i> 다시 하기
        </button>
      </div>`;
    const panel = arena.closest('.arena-panel');
    panel.appendChild(div);
    div.querySelector('#btn-play-again').addEventListener('click', () => {
      div.remove();
      startGame();
    });
  };

  // ── Difficulty switcher ──
  diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      diffBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDiff = btn.dataset.diff;
      if (gameRunning) {
        clearInterval(timerId);
        clearTimeout(spawnId);
        gameRunning = false;
      }
      startGame();
    });
  });

  // ── Button bindings ──
  overlayBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', () => {
    if (gameRunning) { clearInterval(timerId); clearTimeout(spawnId); gameRunning = false; }
    const co = arena.closest('.arena-panel')?.querySelector('.complete-overlay');
    if (co) co.remove();
    startGame();
  });

  // ── Floating nav ──
  document.getElementById('btn-scroll-top')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.getElementById('btn-scroll-bottom')?.addEventListener('click', () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));

  // ── Explanation board ──
  const GUIDE_DATA = [
    {
      badge: '가이드 01: 개요',
      title: '반응속도란?',
      body: `반응속도(Reaction Time)란 시각적 자극을 인식한 후 신체 반응을 개시하기까지의 시간을 말합니다.<br><br>
      일반적으로 사람의 시각 반응속도는 <strong>200~250ms</strong> 정도이며, 훈련을 통해 <strong>150ms</strong> 이하까지 단축할 수 있습니다.<br><br>
      뉴로 리플렉스 게임은 이 반응속도를 측정하고 훈련하기 위해 설계되었습니다. 
      화면에 나타나는 타겟을 최대한 빨리 클릭하며, 매 클릭마다 정밀한 반응 시간이 기록됩니다.`
    },
    {
      badge: '가이드 02: 과학',
      title: '신경 전달 과학',
      body: `반응속도는 여러 신경학적 단계를 거칩니다:<br><br>
      <strong>1️⃣ 감각 수용 (Sensory Reception)</strong><br>
      망막에서 빛 자극을 감지하고 전기 신호로 변환합니다. 약 30~50ms 소요.<br><br>
      <strong>2️⃣ 신경 전달 (Neural Transmission)</strong><br>
      시각 피질로 신호가 전달되어 자극의 위치와 형태를 인식합니다. 약 50~80ms.<br><br>
      <strong>3️⃣ 인지 처리 (Cognitive Processing)</strong><br>
      전두엽에서 '클릭해야 한다'는 의사결정이 이루어집니다. 약 30~50ms.<br><br>
      <strong>4️⃣ 운동 반응 (Motor Response)</strong><br>
      운동 피질에서 손가락 근육에 명령을 보내 클릭 동작을 실행합니다. 약 40~60ms.`
    },
    {
      badge: '가이드 03: 효과',
      title: '훈련 효과',
      body: `꾸준한 반응속도 훈련은 다양한 이점을 제공합니다:<br><br>
      <strong>🎮 게임 퍼포먼스 향상</strong><br>
      FPS, MOBA 등의 경쟁 게임에서 상대보다 빠른 반응으로 우위를 점할 수 있습니다.<br><br>
      <strong>🚗 일상생활 안전</strong><br>
      운전 중 돌발 상황에 대한 반응 시간이 단축되어 사고 위험이 줄어듭니다.<br><br>
      <strong>🧠 인지 노화 방지</strong><br>
      규칙적인 반응속도 훈련은 인지 능력 저하를 늦추는 데 도움이 됩니다.<br><br>
      <strong>⚡ 집중력 강화</strong><br>
      지속적인 주의 집중이 필요하므로, 전반적인 집중력과 주의 지속 시간이 향상됩니다.`
    },
    {
      badge: '가이드 04: 공략',
      title: '난이도별 공략',
      body: `<strong>🟢 쉬움 (Easy)</strong><br>
      타겟이 크고 출현 간격이 넓어 초보자에게 적합합니다. 타겟이 나타나면 여유 있게 클릭하세요. 평균 300ms 이하를 목표로!<br><br>
      <strong>🟡 보통 (Normal)</strong><br>
      표준 난이도입니다. 타겟 크기와 출현 속도가 균형 잡혀 있으며, 250ms 이하를 목표로 하세요. 화면 중앙에 시선을 고정하고 주변 시야를 활용하세요.<br><br>
      <strong>🔴 어려움 (Hard)</strong><br>
      작은 타겟이 빠르게 출현합니다. 200ms 이하의 반응속도가 요구됩니다. 마우스를 화면 중앙에 두고, 최소한의 이동 거리로 클릭하는 것이 핵심입니다.`
    },
    {
      badge: '가이드 05: FAQ',
      title: 'FAQ',
      body: `<strong>Q. 최고 기록은 어떻게 저장되나요?</strong><br>
      브라우저의 로컬 스토리지(localStorage)에 난이도별로 최고 점수가 자동 저장됩니다.<br><br>
      <strong>Q. 빨간색 플래시는 뭔가요?</strong><br>
      타겟이 아닌 빈 공간을 클릭하면 미스 플래시가 표시됩니다. 정확하게 타겟을 클릭하세요!<br><br>
      <strong>Q. 평균 반응속도는 어떻게 계산되나요?</strong><br>
      각 타겟 출현 시점부터 클릭 시점까지의 시간을 모두 기록하여 평균을 산출합니다.<br><br>
      <strong>Q. 모바일에서도 플레이 가능한가요?</strong><br>
      네! 터치 이벤트를 지원하며, 반응형 레이아웃으로 모바일에서도 최적화되어 있습니다.`
    }
  ];

  const guideItems = document.querySelectorAll('.explanation-index-list li');
  const guideTitleBadge = document.getElementById('explanation-title-badge');
  const guideDisplayTitle = document.getElementById('explanation-display-title');
  const guideDisplayText = document.getElementById('explanation-display-text');

  const showGuide = (index) => {
    const data = GUIDE_DATA[index];
    if (!data) return;
    guideTitleBadge.textContent = data.badge;
    guideDisplayTitle.textContent = data.title;
    guideDisplayText.innerHTML = data.body;
  };

  guideItems.forEach((li, idx) => {
    li.addEventListener('click', () => {
      guideItems.forEach(l => l.classList.remove('active'));
      li.classList.add('active');
      showGuide(idx);
    });
  });

  showGuide(0);
  showBest();
});
