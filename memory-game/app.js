// ============================================================
// CineAHO Premium 3D Memory Master Game – app.js
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // ── DOM refs ──
  const board       = document.getElementById('board');
  const timerEl     = document.getElementById('lbl-timer');
  const movesEl     = document.getElementById('lbl-moves');
  const matchedEl   = document.getElementById('lbl-matched');
  const bestEl      = document.getElementById('lbl-best');
  const restartBtn  = document.getElementById('btn-restart');
  const overlayBtn  = document.getElementById('btn-overlay-start');
  const overlay     = document.getElementById('overlay-screen');
  const diffBtns    = document.querySelectorAll('.btn-diff');

  // ── Icon pool (Font Awesome) ──
  const ICON_POOL = [
    'fa-solid fa-heart',
    'fa-solid fa-star',
    'fa-solid fa-bolt',
    'fa-solid fa-moon',
    'fa-solid fa-sun',
    'fa-solid fa-music',
    'fa-solid fa-camera',
    'fa-solid fa-gem',
    'fa-solid fa-crown',
    'fa-solid fa-ghost',
    'fa-solid fa-dragon',
    'fa-solid fa-hat-wizard',
    'fa-solid fa-snowflake',
    'fa-solid fa-fire',
    'fa-solid fa-anchor'
  ];

  // ── Difficulty presets ──
  const PRESETS = {
    '4':   { cols: 4, rows: 3, pairs: 6,  boardClass: 'board-4x3' },
    '4x4': { cols: 4, rows: 4, pairs: 8,  boardClass: 'board-4x4' },
    '6':   { cols: 6, rows: 4, pairs: 12, boardClass: 'board-6x4' },
    '6x5': { cols: 6, rows: 5, pairs: 15, boardClass: 'board-6x5' }
  };

  // ── State ──
  let currentPreset = '4x4';
  let firstCard     = null;
  let secondCard    = null;
  let lockBoard     = false;
  let moves         = 0;
  let matchCount    = 0;
  let totalPairs    = 8;
  let seconds       = 0;
  let timerId       = null;
  let gameStarted   = false;

  // ── localStorage best scores ──
  const getBest = () => {
    try { return JSON.parse(localStorage.getItem('memoryBest') || '{}'); }
    catch { return {}; }
  };
  const saveBest = (key, val) => {
    const data = getBest();
    data[key] = val;
    localStorage.setItem('memoryBest', JSON.stringify(data));
  };
  const showBest = () => {
    const data = getBest();
    const b = data[currentPreset];
    bestEl.textContent = b != null ? `${b}회` : '--';
  };

  // ── Timer helpers ──
  const fmtTime = s => {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
  };
  const startTimer = () => {
    stopTimer();
    timerId = setInterval(() => { seconds++; timerEl.textContent = fmtTime(seconds); }, 1000);
  };
  const stopTimer = () => { clearInterval(timerId); timerId = null; };

  // ── Shuffle (Fisher-Yates) ──
  const shuffle = arr => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // ── Card factory ──
  const createCard = (iconClass) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.icon = iconClass;

    const inner = document.createElement('div');
    inner.className = 'card-inner';

    const front = document.createElement('div');
    front.className = 'card-front';
    front.innerHTML = '<i class="fa-solid fa-question"></i>';

    const back = document.createElement('div');
    back.className = 'card-back';
    back.innerHTML = `<i class="${iconClass}"></i>`;

    inner.append(front, back);
    card.appendChild(inner);
    card.addEventListener('click', handleCardClick);
    return card;
  };

  // ── Click handler ──
  const handleCardClick = (e) => {
    if (lockBoard) return;
    const card = e.currentTarget;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

    card.classList.add('flipped');

    if (!firstCard) {
      firstCard = card;
      return;
    }

    secondCard = card;
    lockBoard = true;
    moves++;
    movesEl.textContent = moves;

    const isMatch = firstCard.dataset.icon === secondCard.dataset.icon;

    if (isMatch) {
      firstCard.classList.add('matched');
      secondCard.classList.add('matched');
      matchCount++;
      matchedEl.textContent = `${matchCount} / ${totalPairs}`;
      resetTurn();

      if (matchCount === totalPairs) {
        stopTimer();
        showComplete();
      }
    } else {
      // shake then flip back
      firstCard.classList.add('shake');
      secondCard.classList.add('shake');
      setTimeout(() => {
        firstCard.classList.remove('flipped', 'shake');
        secondCard.classList.remove('flipped', 'shake');
        resetTurn();
      }, 900);
    }
  };

  const resetTurn = () => {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
  };

  // ── Game complete ──
  const showComplete = () => {
    // update best
    const best = getBest()[currentPreset];
    if (best == null || moves < best) saveBest(currentPreset, moves);
    showBest();

    // build overlay
    const div = document.createElement('div');
    div.className = 'complete-overlay';
    div.innerHTML = `
      <div class="complete-inner">
        <div class="trophy-icon"><i class="fa-solid fa-trophy"></i></div>
        <h2>🎉 축하합니다!</h2>
        <p class="result-line">시도 횟수: <strong>${moves}회</strong></p>
        <p class="result-line">소요 시간: <strong>${fmtTime(seconds)}</strong></p>
        <button class="btn btn-primary btn-large" id="btn-play-again">
          <i class="fa-solid fa-rotate-right"></i> 다시 하기
        </button>
      </div>`;
    const panel = document.querySelector('.board-panel');
    panel.appendChild(div);
    div.querySelector('#btn-play-again').addEventListener('click', () => {
      div.remove();
      initGame();
    });
  };

  // ── Init game ──
  const initGame = () => {
    const preset = PRESETS[currentPreset];
    totalPairs = preset.pairs;

    board.innerHTML = '';
    board.className = `board ${preset.boardClass}`;
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    moves = 0;
    matchCount = 0;
    seconds = 0;
    movesEl.textContent = '0';
    timerEl.textContent = '00:00';
    matchedEl.textContent = `0 / ${totalPairs}`;
    showBest();
    stopTimer();

    const chosenIcons = shuffle(ICON_POOL).slice(0, totalPairs);
    const icons = shuffle([...chosenIcons, ...chosenIcons]);
    icons.forEach(ic => board.appendChild(createCard(ic)));

    overlay.classList.add('hidden');
    gameStarted = true;
    startTimer();
  };

  // ── Difficulty switcher ──
  diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      diffBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPreset = btn.dataset.size;
      initGame();
    });
  });

  // ── Button bindings ──
  overlayBtn.addEventListener('click', initGame);
  restartBtn.addEventListener('click', initGame);

  // ── Floating nav ──
  document.getElementById('btn-scroll-top')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.getElementById('btn-scroll-bottom')?.addEventListener('click', () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));

  // ── Explanation board ──
  const GUIDE_DATA = [
    {
      badge: '가이드 01: 개요',
      title: '메모리 게임이란?',
      body: `메모리 게임(카드 맞추기)은 뒤집어진 카드 중 같은 쌍을 찾아내는 고전적인 두뇌 훈련 게임입니다.<br><br>
      이 게임은 <strong>단기 기억력</strong>, <strong>집중력</strong>, <strong>패턴 인식 능력</strong>을 동시에 자극합니다. 
      간단한 규칙이지만, 카드 수가 늘어날수록 기억해야 할 위치가 기하급수적으로 증가하여 진정한 두뇌 챌린지가 됩니다.<br><br>
      메모리 마스터 3D 버전은 CSS 3D transform을 활용한 부드러운 카드 플립 애니메이션과 
      글래스모피즘 UI 디자인으로 시각적 몰입감을 극대화했습니다.`
    },
    {
      badge: '가이드 02: 효과',
      title: '인지 능력 향상 효과',
      body: `카드 매칭 게임은 다양한 인지 능력을 훈련합니다:<br><br>
      <strong>🧠 작업 기억(Working Memory)</strong><br>
      뒤집었던 카드의 위치와 종류를 기억하는 과정에서 작업 기억이 강화됩니다.<br><br>
      <strong>👁️ 시공간 인식(Visuospatial Skills)</strong><br>
      그리드 상의 카드 위치를 머릿속에 매핑하는 능력이 향상됩니다.<br><br>
      <strong>🎯 집중력(Attention)</strong><br>
      실수를 줄이기 위해 지속적으로 주의를 기울여야 하므로 집중 지속 시간이 늘어납니다.<br><br>
      <strong>⚡ 처리 속도(Processing Speed)</strong><br>
      더 빠르게 매칭을 완료하려면 정보 처리 속도가 중요합니다.`
    },
    {
      badge: '가이드 03: 전략',
      title: '카드 매칭 전략',
      body: `효율적으로 게임을 클리어하려면 다음 전략을 활용하세요:<br><br>
      <strong>1. 체계적 스캔</strong><br>
      처음에는 왼쪽 상단부터 순서대로 카드를 뒤집어 전체 맵을 파악합니다.<br><br>
      <strong>2. 구역 분할</strong><br>
      보드를 2~4개의 구역으로 나누어 기억하면 위치 추적이 쉬워집니다.<br><br>
      <strong>3. 연상 기억법</strong><br>
      카드 아이콘과 위치를 연결하는 이야기를 만들면 기억 유지율이 높아집니다.<br><br>
      <strong>4. 확인 우선 매칭</strong><br>
      이미 본 카드가 나오면 즉시 매칭을 시도하세요. 확실한 쌍부터 처리하는 것이 효율적입니다.`
    },
    {
      badge: '가이드 04: 공략',
      title: '난이도별 공략법',
      body: `<strong>🟢 4×3 쉬움 (6쌍)</strong><br>
      초보자에게 적합합니다. 12장의 카드를 기억하면 되므로, 처음 한 번의 전체 스캔으로 대부분 클리어할 수 있습니다.<br><br>
      <strong>🟡 4×4 보통 (8쌍)</strong><br>
      가장 대중적인 난이도입니다. 16장의 카드는 집중력이 필요하지만 체계적 스캔으로 충분히 공략 가능합니다.<br><br>
      <strong>🟠 6×4 어려움 (12쌍)</strong><br>
      24장의 카드를 기억해야 합니다. 구역 분할 전략이 필수적이며, 실수를 줄이는 것이 핵심입니다.<br><br>
      <strong>🔴 6×5 극한 (15쌍)</strong><br>
      30장의 카드로 진정한 두뇌 챌린지! 연상 기억법과 구역 분할을 조합해야 합니다.`
    },
    {
      badge: '가이드 05: FAQ',
      title: '자주 묻는 질문 (FAQ)',
      body: `<strong>Q. 최고 기록은 어떻게 저장되나요?</strong><br>
      브라우저의 로컬 스토리지(localStorage)에 난이도별로 최소 시도 횟수가 자동 저장됩니다.<br><br>
      <strong>Q. 모바일에서도 플레이 가능한가요?</strong><br>
      네! 반응형 디자인으로 모바일, 태블릿, 데스크톱 모두에서 최적화되어 있습니다.<br><br>
      <strong>Q. 카드 아이콘은 매번 바뀌나요?</strong><br>
      네, 15개의 아이콘 풀에서 난이도에 맞는 수만큼 무작위로 선택되어 매 게임마다 다른 조합이 나옵니다.<br><br>
      <strong>Q. 시간 제한이 있나요?</strong><br>
      시간 제한은 없습니다. 하지만 타이머가 측정되므로 자신의 속도 향상을 추적할 수 있습니다.`
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

  // Show first guide entry on load
  showGuide(0);
  showBest();
});
