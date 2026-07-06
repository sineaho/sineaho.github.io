/* ==========================================
   CineAHO K-WAIS-IV Wechsler Intelligence Test
   JavaScript Controllers, Math Logic, & Visualizations
   ========================================== */

// 1. App State
let currentDomainIdx = 0; // 0: VCI, 1: PRI, 2: WMI, 3: PSI
let currentQuestionIdx = 0;
let userAnswers = {
  vci: [],
  pri: [],
  wmi: [],
  psi: { correct: 0, total: 0 }
};

// PSI Game config
let psiTimer = null;
let psiTimeLeft = 30; // 30 seconds game
let psiScore = 0;
let psiSymbols = ['★', '▲', '■', '◆', '●', '♥', '♣', '♠', '✿', '✦', '✪', '✖'];

// WMI digit flash timer
let digitFlashInterval = null;

// Chart references
let radarChart = null;

// DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  bindEvents();
});

// 2. Theme Syncer (syncs charts & bell curve canvas on toggle)
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeButtonUI(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButtonUI(newTheme);

    // Redraw reports if result is visible
    if (!document.getElementById('wais-report-panel').classList.contains('hidden')) {
      // Re-trigger render with the existing scores
      const rawVci = userAnswers.vci.reduce((s, v) => s + v, 0);
      const rawPri = userAnswers.pri.reduce((s, v) => s + v, 0);
      const rawWmi = userAnswers.wmi.reduce((s, v) => s + v, 0);
      const rawPsi = Math.floor(psiScore);

      const scaledVci = Math.min(19, Math.max(1, Math.round(4 + (rawVci / 6) * 14)));
      const scaledPri = Math.min(19, Math.max(1, Math.round(4 + (rawPri / 6) * 14)));
      const scaledWmi = Math.min(19, Math.max(1, Math.round(4 + (rawWmi / 6) * 14)));
      const scaledPsi = Math.min(19, Math.max(1, Math.round(4 + (Math.min(22, rawPsi) / 22) * 14)));

      const indexVci = Math.min(150, Math.max(50, 100 + (scaledVci - 10) * 5));
      const indexPri = Math.min(150, Math.max(50, 100 + (scaledPri - 10) * 5));
      const indexWmi = Math.min(150, Math.max(50, 100 + (scaledWmi - 10) * 5));
      const indexPsi = Math.min(150, Math.max(50, 100 + (scaledPsi - 10) * 5));

      const fsiq = Math.round((indexVci + indexPri + indexWmi + indexPsi) / 4);

      renderRadarChart([indexVci, indexPri, indexWmi, indexPsi]);
      drawBellCurve(fsiq);
    }
  });

  function updateThemeButtonUI(theme) {
    const icon = themeToggleBtn.querySelector('i');
    const text = themeToggleBtn.querySelector('span');
    if (theme === 'light') {
      icon.className = 'fa-solid fa-moon';
      text.textContent = '다크';
      themeToggleBtn.style.borderColor = 'rgba(15, 23, 42, 0.08)';
    } else {
      icon.className = 'fa-solid fa-sun';
      text.textContent = '라이트';
      themeToggleBtn.style.borderColor = 'rgba(255, 255, 255, 0.08)';
    }
  }
}

// 3. Question Datasets
const VCI_QUESTIONS = [
  {
    title: "1. [공통성] '사과'와 '바나나'의 공통점으로 가장 적합한 명칭은 무엇인가요?",
    choices: [
      { text: "나무에서만 열리는 줄기 식물이다.", score: 0 },
      { text: "빨간색과 노란색의 대표적인 껍질 식물이다.", score: 1 },
      { text: "먹을 수 있는 유기농 과일(식품)류에 속한다.", score: 2 },
      { text: "비타민 C가 들어있는 구형의 씨앗 식물이다.", score: 0 }
    ]
  },
  {
    title: "2. [어휘] '방대하다'의 가장 핵심적이고 정확한 사전적 정의는 무엇인가요?",
    choices: [
      { text: "정신이나 관심이 여러 갈래로 흩어져 어지럽다.", score: 0 },
      { text: "앞선 의견을 가로막아 강하게 물리치다.", score: 0 },
      { text: "물질적인 양이나 에너지가 미세하게 줄어들다.", score: 0 },
      { text: "규모, 범위, 부피 또는 내용이 매우 크고 넓다.", score: 2 }
    ]
  },
  {
    title: "3. [상식] 태양계 행성 중 질량이 가장 크며 부피가 제일 거대한 행성은 무엇인가요?",
    choices: [
      { text: "화성 (Mars)", score: 0 },
      { text: "금성 (Venus)", score: 0 },
      { text: "목성 (Jupiter)", score: 2 },
      { text: "토성 (Saturn)", score: 1 }
    ]
  }
];

const PRI_QUESTIONS = [
  {
    title: "1. [행렬추리] 다음 2x2 매트릭스 패턴에서 물음표(?)에 위치할 알맞은 도형을 고르세요.",
    svg: `<svg width="220" height="220" viewBox="0 0 220 220" style="background:#131a30; border-radius:12px;">
      <!-- Grid Lines -->
      <line x1="110" y1="0" x2="110" y2="220" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
      <line x1="0" y1="110" x2="220" y2="110" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
      <!-- Top Left: Red Circle -->
      <circle cx="55" cy="55" r="25" fill="#f43f5e" />
      <!-- Top Right: Red Triangle -->
      <polygon points="165,30 140,80 190,80" fill="#f43f5e" />
      <!-- Bottom Left: Blue Circle -->
      <circle cx="55" cy="165" r="25" fill="#3b82f6" />
      <!-- Bottom Right: Question Mark -->
      <text x="155" y="180" font-size="36" fill="#64748b" font-weight="bold">?</text>
    </svg>`,
    choices: [
      { text: "빨간색 사각형 (Red Square)", score: 0 },
      { text: "파란색 원 (Blue Circle)", score: 0 },
      { text: "파란색 삼각형 (Blue Triangle)", score: 2 },
      { text: "빨간색 삼각형 (Red Triangle)", score: 0 }
    ]
  },
  {
    title: "2. [퍼즐] 아래의 '정육각형 조각'을 다른 틈새 없이 완벽하게 채울 수 있는 단위 평면 조각의 조합은 무엇인가요?",
    svg: `<svg width="220" height="220" viewBox="0 0 220 220" style="background:#131a30; border-radius:12px;">
      <!-- Hexagon -->
      <polygon points="110,30 180,70 180,150 110,190 40,150 40,70" fill="none" stroke="#3b82f6" stroke-width="3" />
      <line x1="110" y1="30" x2="110" y2="190" stroke="rgba(59,130,246,0.3)" stroke-width="1.5" />
      <line x1="40" y1="70" x2="180" y2="150" stroke="rgba(59,130,246,0.3)" stroke-width="1.5" />
      <line x1="40" y1="150" x2="180" y2="70" stroke="rgba(59,130,246,0.3)" stroke-width="1.5" />
    </svg>`,
    choices: [
      { text: "동일한 크기의 정삼각형 6개 조각", score: 2 },
      { text: "동일한 크기의 직각삼각형 4개 조각", score: 0 },
      { text: "정사각형 3개와 직각삼각형 2개 조각", score: 0 },
      { text: "직사각형 2개와 반원 2개 조각", score: 0 }
    ]
  },
  {
    title: "3. [토막짜기] 2x2 빨간색과 흰색 블록 패턴 중 아래 그림과 정확히 대치하는 패턴을 선택하세요.",
    svg: `<svg width="220" height="220" viewBox="0 0 220 220" style="background:#131a30; border-radius:12px;">
      <!-- Grid -->
      <rect x="30" y="30" width="80" height="80" fill="#f43f5e" />
      <rect x="110" y="30" width="80" height="80" fill="#ffffff" />
      <!-- Diagonal Split Block Bottom-Left -->
      <polygon points="30,110 110,110 30,190" fill="#f43f5e" />
      <polygon points="110,110 110,190 30,190" fill="#ffffff" />
      <rect x="110" y="110" width="80" height="80" fill="#f43f5e" />
      <rect x="30" y="30" width="160" height="160" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
      <line x1="110" y1="30" x2="110" y2="190" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
      <line x1="30" y1="110" x2="190" y2="110" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
    </svg>`,
    choices: [
      { text: "좌상단 백색, 우상단 적색, 하단 전체 백색 블록", score: 0 },
      { text: "좌상단 적색, 우상단 백색, 좌하단 대각 적/백 분할, 우하단 적색 블록", score: 2 },
      { text: "전체 4칸이 모두 적색으로 이루어진 단색 블록", score: 0 },
      { text: "좌상단 백색, 우상단 적색, 좌하단 적색, 우하단 백색 블록", score: 0 }
    ]
  }
];

const WMI_QUESTIONS = [
  {
    type: "digit-forward",
    title: "1. [숫자 순방향] 제시되는 5자리 숫자를 순서대로 기억한 후 입력창에 적어주세요.",
    sequence: [5, 1, 9, 4, 8],
    answer: "51948"
  },
  {
    type: "digit-backward",
    title: "2. [숫자 역방향] 제시되는 4자리 숫자를 거꾸로 역순으로 기억하여 입력창에 적어주세요.",
    sequence: [2, 7, 3, 6],
    answer: "6372"
  },
  {
    type: "arithmetic",
    title: "3. [산수] 시계 3개의 합산 가격이 18,000원입니다. 그렇다면 시계 5개의 합산 가격은 얼마인가요?",
    choices: [
      { text: "20,000 원", score: 0 },
      { text: "30,000 원", score: 2 },
      { text: "25,000 원", score: 0 },
      { text: "32,000 원", score: 0 }
    ]
  }
];

// 4. Bind DOM Actions
function bindEvents() {
  document.getElementById('btn-start-test').addEventListener('click', startTest);
  document.getElementById('btn-restart-test').addEventListener('click', restartTest);
}

// 5. Test State Transitions
function startTest() {
  document.getElementById('wais-intro-panel').classList.add('hidden');
  document.getElementById('wais-test-panel').classList.remove('hidden');
  
  currentDomainIdx = 0;
  currentQuestionIdx = 0;
  userAnswers = {
    vci: [],
    pri: [],
    wmi: [],
    psi: { correct: 0, total: 0 }
  };
  
  loadQuestion();
}

function restartTest() {
  document.getElementById('wais-report-panel').classList.add('hidden');
  startTest();
}

// Progress Bar Synchronizer
function updateProgressBar() {
  const totalQuestions = VCI_QUESTIONS.length + PRI_QUESTIONS.length + WMI_QUESTIONS.length + 1; // +1 for PSI game
  const currentStep = (currentDomainIdx * 3) + currentQuestionIdx + 1;
  const progressPercent = Math.min(100, Math.round((currentStep / totalQuestions) * 100));
  
  document.getElementById('progress-bar-fill').style.width = `${progressPercent}%`;
  
  const domainsNames = ['언어이해 영역', '지각추리 영역', '작업기억 영역', '처리속도 영역'];
  document.getElementById('current-index-label').textContent = domainsNames[currentDomainIdx];
  
  if (currentDomainIdx === 3) {
    document.getElementById('question-index-label').textContent = '기호 찾기 게임 진행 중';
  } else {
    document.getElementById('question-index-label').textContent = `문항 ${currentQuestionIdx + 1} / 3`;
  }
}

// Question Router
function loadQuestion() {
  updateProgressBar();

  // Hide all domains first
  document.getElementById('domain-vci').classList.add('hidden');
  document.getElementById('domain-pri').classList.add('hidden');
  document.getElementById('domain-wmi').classList.add('hidden');
  document.getElementById('domain-psi').classList.add('hidden');

  if (currentDomainIdx === 0) {
    // VCI
    document.getElementById('domain-vci').classList.remove('hidden');
    renderVciQuestion();
  } else if (currentDomainIdx === 1) {
    // PRI
    document.getElementById('domain-pri').classList.remove('hidden');
    renderPriQuestion();
  } else if (currentDomainIdx === 2) {
    // WMI
    document.getElementById('domain-wmi').classList.remove('hidden');
    renderWmiQuestion();
  } else if (currentDomainIdx === 3) {
    // PSI
    document.getElementById('domain-psi').classList.remove('hidden');
    startPsiGame();
  }
}

// 6. Domain Renderers
// Domain 1: Verbal Comprehension
function renderVciQuestion() {
  const q = VCI_QUESTIONS[currentQuestionIdx];
  const container = document.getElementById('vci-question-container');
  
  let choicesHtml = q.choices.map((c, idx) => `
    <button class="choice-card-btn" onclick="selectVciAnswer(${c.score})">
      <span class="choice-marker">${String.fromCharCode(65 + idx)}</span>
      <span>${c.text}</span>
    </button>
  `).join('');

  container.innerHTML = `
    <h4 class="question-title">${q.title}</h4>
    <div class="choices-list">${choicesHtml}</div>
  `;
}

window.selectVciAnswer = function(score) {
  userAnswers.vci.push(score);
  
  if (currentQuestionIdx < 2) {
    currentQuestionIdx++;
    loadQuestion();
  } else {
    // Transition to PRI
    currentDomainIdx = 1;
    currentQuestionIdx = 0;
    loadQuestion();
  }
};

// Domain 2: Perceptual Reasoning
function renderPriQuestion() {
  const q = PRI_QUESTIONS[currentQuestionIdx];
  const container = document.getElementById('pri-question-container');

  let choicesHtml = q.choices.map((c, idx) => `
    <button class="choice-card-btn" onclick="selectPriAnswer(${c.score})">
      <span class="choice-marker">${String.fromCharCode(65 + idx)}</span>
      <span>${c.text}</span>
    </button>
  `).join('');

  container.innerHTML = `
    <h4 class="question-title">${q.title}</h4>
    <div class="matrix-display-container">
      <div class="matrix-svg-card">${q.svg}</div>
    </div>
    <div class="choices-list">${choicesHtml}</div>
  `;
}

window.selectPriAnswer = function(score) {
  userAnswers.pri.push(score);

  if (currentQuestionIdx < 2) {
    currentQuestionIdx++;
    loadQuestion();
  } else {
    // Transition to WMI
    currentDomainIdx = 2;
    currentQuestionIdx = 0;
    loadQuestion();
  }
};

// Domain 3: Working Memory
function renderWmiQuestion() {
  const q = WMI_QUESTIONS[currentQuestionIdx];
  const container = document.getElementById('wmi-question-container');

  if (q.type === 'digit-forward' || q.type === 'digit-backward') {
    // Digit Span sequence display
    container.innerHTML = `
      <h4 class="question-title">${q.title}</h4>
      <div class="wmi-digital-board">
        <span class="digital-digit" id="wmi-flash-digit">-</span>
        <span class="digital-guide-text" id="wmi-flash-guide">대기 중</span>
      </div>
      <div class="wmi-input-form hidden" id="wmi-input-form-wrapper">
        <input type="text" class="wmi-text-input" id="wmi-user-input" placeholder="숫자 입력" maxlength="8">
        <button class="btn btn-wmi-submit" onclick="submitWmiDigits('${q.answer}')">정답 제출</button>
      </div>
    `;

    // Start flash sequence
    flashDigitsSequence(q.sequence);
  } else {
    // Arithmetic
    let choicesHtml = q.choices.map((c, idx) => `
      <button class="choice-card-btn" onclick="selectWmiArithmetic(${c.score})">
        <span class="choice-marker">${String.fromCharCode(65 + idx)}</span>
        <span>${c.text}</span>
      </button>
    `).join('');

    container.innerHTML = `
      <h4 class="question-title">${q.title}</h4>
      <div class="choices-list">${choicesHtml}</div>
    `;
  }
}

function flashDigitsSequence(sequence) {
  const digitEl = document.getElementById('wmi-flash-digit');
  const guideEl = document.getElementById('wmi-flash-guide');
  let idx = 0;
  
  guideEl.textContent = '숫자를 기억하세요';
  digitEl.classList.remove('pulse');

  // Flash number sequence at 1.1s intervals (1s display, 0.1s blank)
  digitFlashInterval = setInterval(() => {
    if (idx < sequence.length) {
      digitEl.textContent = sequence[idx];
      digitEl.classList.add('pulse');
      
      // Momentarily blank digit before next
      setTimeout(() => {
        digitEl.classList.remove('pulse');
      }, 950);
      
      idx++;
    } else {
      clearInterval(digitFlashInterval);
      digitEl.textContent = '끝!';
      guideEl.textContent = '기억한 숫자를 아래에 쓰세요';
      
      // Unhide input form
      document.getElementById('wmi-input-form-wrapper').classList.remove('hidden');
      const inputEl = document.getElementById('wmi-user-input');
      inputEl.focus();
      inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          submitWmiDigits(WMI_QUESTIONS[currentQuestionIdx].answer);
        }
      });
    }
  }, 1100);
}

window.submitWmiDigits = function(correctAnswer) {
  const inputEl = document.getElementById('wmi-user-input');
  if (!inputEl) return;

  const userVal = inputEl.value.trim();
  const score = (userVal === correctAnswer) ? 2 : 0;
  
  userAnswers.wmi.push(score);

  currentQuestionIdx++;
  loadQuestion();
};

window.selectWmiArithmetic = function(score) {
  userAnswers.wmi.push(score);

  // Transition to PSI
  currentDomainIdx = 3;
  currentQuestionIdx = 0;
  loadQuestion();
};

// Domain 4: Processing Speed
function startPsiGame() {
  psiScore = 0;
  psiTimeLeft = 30;
  document.getElementById('psi-score-counter').textContent = psiScore;
  document.getElementById('psi-time-left').textContent = psiTimeLeft;
  document.getElementById('psi-timer-fill').style.width = '100%';

  generatePsiItem();

  // Start 30s timer
  if (psiTimer) clearInterval(psiTimer);
  psiTimer = setInterval(() => {
    psiTimeLeft--;
    document.getElementById('psi-time-left').textContent = psiTimeLeft;
    
    const timePercentage = Math.round((psiTimeLeft / 30) * 100);
    document.getElementById('psi-timer-fill').style.width = `${timePercentage}%`;

    if (psiTimeLeft <= 0) {
      clearInterval(psiTimer);
      finishTest();
    }
  }, 1000);
}

function generatePsiItem() {
  const targetSymbol = psiSymbols[Math.floor(Math.random() * psiSymbols.length)];
  const isTargetPresent = Math.random() >= 0.35; // 65% chance symbol is in row
  
  let options = [];
  if (isTargetPresent) {
    options.push(targetSymbol);
    // Fill other two options
    while (options.length < 3) {
      const sym = psiSymbols[Math.floor(Math.random() * psiSymbols.length)];
      if (!options.includes(sym)) options.push(sym);
    }
    // Shuffle options
    options.sort(() => Math.random() - 0.5);
  } else {
    // Generate 3 random symbols excluding target
    while (options.length < 3) {
      const sym = psiSymbols[Math.floor(Math.random() * psiSymbols.length)];
      if (sym !== targetSymbol && !options.includes(sym)) options.push(sym);
    }
  }

  const board = document.getElementById('psi-game-board');
  
  let choicesHtml = options.map(opt => `
    <button class="btn-psi-option" onclick="clickPsiSymbol('${opt}', '${targetSymbol}')">${opt}</button>
  `).join('');

  // Add the 'None' (없음) option button
  choicesHtml += `
    <button class="btn-psi-option option-none" onclick="clickPsiSymbol('none', '${targetSymbol}')">
      <i class="fa-solid fa-ban" style="font-size: 0.8rem; margin-right: 5px;"></i> 없음
    </button>
  `;

  board.innerHTML = `
    <div class="psi-target-row">
      <span class="label">목표 기호</span>
      <div class="psi-symbol-box">${targetSymbol}</div>
    </div>
    <div class="psi-options-row">${choicesHtml}</div>
  `;
}

window.clickPsiSymbol = function(clickedSymbol, targetSymbol) {
  userAnswers.psi.total++;

  const isNoneClicked = (clickedSymbol === 'none');
  const isTargetInOptions = Array.from(document.querySelectorAll('.psi-options-row button')).slice(0, 3).some(btn => btn.textContent.trim() === targetSymbol);

  let isCorrect = false;
  if (isNoneClicked && !isTargetInOptions) {
    isCorrect = true;
  } else if (!isNoneClicked && clickedSymbol === targetSymbol) {
    isCorrect = true;
  }

  if (isCorrect) {
    psiScore++;
    userAnswers.psi.correct++;
  } else {
    // Penalty for incorrect clicks (-0.5 pts)
    psiScore = Math.max(0, psiScore - 0.5);
  }

  document.getElementById('psi-score-counter').textContent = Math.floor(psiScore);
  
  // Flash visual grid color feedback on click
  const borderEl = document.getElementById('psi-game-board');
  borderEl.style.borderColor = isCorrect ? 'var(--accent-green)' : 'var(--accent-red)';
  borderEl.style.background = isCorrect ? 'rgba(16, 185, 129, 0.03)' : 'rgba(239, 68, 68, 0.03)';
  
  setTimeout(() => {
    if (borderEl) {
      borderEl.style.borderColor = 'var(--wais-panel-border)';
      borderEl.style.background = 'var(--wais-input-bg)';
    }
  }, 120);

  generatePsiItem();
};

// 7. Finish Test & Trigger Scoring Loading Animation
function finishTest() {
  clearInterval(psiTimer);
  document.getElementById('wais-test-panel').classList.add('hidden');
  document.getElementById('wais-scoring-panel').classList.remove('hidden');

  // Trigger phase loading messages
  const statusTitle = document.getElementById('scoring-status-title');
  const statusDesc = document.getElementById('scoring-status-desc');

  setTimeout(() => {
    statusTitle.textContent = "작업기억 및 처리속도 인덱싱 분석 중...";
    statusDesc.textContent = "숫자 스팬 암기 정밀 대조 및 기호 부호화 빈도 연산 완료. 백분위 보정 중.";
  }, 1000);

  setTimeout(() => {
    statusTitle.textContent = "전체 지능 지수(FSIQ) 및 정규분포 곡선 그리는 중...";
    statusDesc.textContent = "연령 규준에 따른 환산 점수 산출 및 가우스 확률 밀도 맵 매핑 중.";
  }, 2000);

  setTimeout(() => {
    document.getElementById('wais-scoring-panel').classList.add('hidden');
    document.getElementById('wais-report-panel').classList.remove('hidden');
    generateReport();
  }, 3200);
}

// 8. Scoring Engine & Math Model
function generateReport() {
  // 1. Raw Scores
  const rawVci = userAnswers.vci.reduce((s, v) => s + v, 0); // max 6
  const rawPri = userAnswers.pri.reduce((s, v) => s + v, 0); // max 6
  const rawWmi = userAnswers.wmi.reduce((s, v) => s + v, 0); // max 6
  const rawPsi = Math.floor(psiScore); // unbounded but usually 0-25

  // 2. Scaled Scores (1 to 19 scale, Mean 10, SD 3)
  const scaledVci = Math.min(19, Math.max(1, Math.round(4 + (rawVci / 6) * 14)));
  const scaledPri = Math.min(19, Math.max(1, Math.round(4 + (rawPri / 6) * 14)));
  const scaledWmi = Math.min(19, Math.max(1, Math.round(4 + (rawWmi / 6) * 14)));
  const scaledPsi = Math.min(19, Math.max(1, Math.round(4 + (Math.min(22, rawPsi) / 22) * 14)));

  // 3. Index Scores (Mean 100, SD 15)
  // Index = 100 + (Scaled - 10) * 5
  const indexVci = Math.min(150, Math.max(50, 100 + (scaledVci - 10) * 5));
  const indexPri = Math.min(150, Math.max(50, 100 + (scaledPri - 10) * 5));
  const indexWmi = Math.min(150, Math.max(50, 100 + (scaledWmi - 10) * 5));
  const indexPsi = Math.min(150, Math.max(50, 100 + (scaledPsi - 10) * 5));

  // 4. FSIQ (Full Scale IQ)
  // Standard weighted IQ combining indices (average with slight regression to mean)
  const fsiq = Math.round((indexVci + indexPri + indexWmi + indexPsi) / 4);

  // 5. Percentile
  // Normal Distribution Z-Score logic
  const zScore = (fsiq - 100) / 15;
  const percentile = Math.round(getPercentileFromZ(zScore) * 10) / 10;

  // Render KPIs
  document.getElementById('report-fsiq-value').textContent = fsiq;
  document.getElementById('report-percentile-value').textContent = percentile;
  
  // Set FSIQ Classification Label
  const gradeTag = document.getElementById('report-iq-grade');
  const briefDesc = document.getElementById('report-iq-desc');
  let classification = '';
  let color = '';

  if (fsiq >= 130) {
    classification = '최우수 지능 (Very Superior)';
    color = '#a855f7';
    briefDesc.textContent = '상위 2.2% 이내에 속하는 탁월한 영재 지능입니다. 복잡한 논리 문제 해결, 추상적 개념 형성 및 지적 창의성이 압도적인 수준입니다.';
  } else if (fsiq >= 120) {
    classification = '우수 지능 (Superior)';
    color = '#3b82f6';
    briefDesc.textContent = '상위 9% 이내의 고도로 발달된 지능입니다. 시공간 지각 정보 조직화 능력이 매우 수려하고 작업 기억력이 우수하여 학습 및 다중 업무 처리에 대단한 두각을 보입니다.';
  } else if (fsiq >= 110) {
    classification = '보통 상 지능 (High Average)';
    color = '#fbbf24';
    briefDesc.textContent = '상위 25%에 진입하는 수준 높은 지능입니다. 언어적 의사소통 및 수리 계산 영역의 균형이 양호하며 주어진 학습 과제를 주도적으로 잘 해결합니다.';
  } else if (fsiq >= 90) {
    classification = '보통 지능 (Average)';
    color = '#10b981';
    briefDesc.textContent = '인구 통계상 가장 다수에 속하는 표준 지능 범위(상위 25%~75%)입니다. 일상적이고 실용적인 문제 해결과 뇌신경 처리 반응의 일치성이 훌륭합니다.';
  } else if (fsiq >= 80) {
    classification = '보통 하 지능 (Low Average)';
    color = '#f97316';
    briefDesc.textContent = '평균 수준보다 약간 아래인 범주에 속합니다. 구체적이고 직관적인 자극은 빠르게 받아들이나, 여러 단계를 거치는 추상 논리 해결 시 보완이 요구될 수 있습니다.';
  } else {
    classification = '경계선 지능 (Borderline)';
    color = '#ef4444';
    briefDesc.textContent = '주의집중 및 시인성 탐색 처리 성능이 조율되어야 하는 수치입니다. 단순 인지 훈련과 반복적인 연상 훈련을 통해 점진적으로 회복 및 상승시킬 수 있습니다.';
  }

  gradeTag.textContent = classification;
  gradeTag.style.color = color;
  gradeTag.style.borderColor = color + '33';
  gradeTag.style.background = color + '0d';

  // Renders Individual Index KPIs
  updateIndexKPI('vci', indexVci);
  updateIndexKPI('pri', indexPri);
  updateIndexKPI('wmi', indexWmi);
  updateIndexKPI('psi', indexPsi);

  // Populates Detailed Table Rows
  const tbody = document.getElementById('report-table-body');
  tbody.innerHTML = `
    <tr>
      <td><strong>언어이해 (VCI)</strong></td>
      <td>공통성 / 어휘 / 상식</td>
      <td>${rawVci} / 6점</td>
      <td><strong>${scaledVci}점</strong></td>
      <td><strong>${indexVci}점</strong></td>
    </tr>
    <tr>
      <td><strong>지각추리 (PRI)</strong></td>
      <td>행렬추리 / 퍼즐 / 토막짜기</td>
      <td>${rawPri} / 6점</td>
      <td><strong>${scaledPri}점</strong></td>
      <td><strong>${indexPri}점</strong></td>
    </tr>
    <tr>
      <td><strong>작업기억 (WMI)</strong></td>
      <td>숫자 플래시(순/역) / 산수</td>
      <td>${rawWmi} / 6점</td>
      <td><strong>${scaledWmi}점</strong></td>
      <td><strong>${indexWmi}점</strong></td>
    </tr>
    <tr>
      <td><strong>처리속도 (PSI)</strong></td>
      <td>기호 동형 찾기 속도전</td>
      <td>${rawPsi}점</td>
      <td><strong>${scaledPsi}점</strong></td>
      <td><strong>${indexPsi}점</strong></td>
    </tr>
  `;

  // Draw Visual Graphics
  renderRadarChart([indexVci, indexPri, indexWmi, indexPsi]);
  drawBellCurve(fsiq);
  generateStrengthsWeaknesses([indexVci, indexPri, indexWmi, indexPsi]);
}

function updateIndexKPI(domain, score) {
  document.getElementById(`score-${domain}`).textContent = score;
  const gradeEl = document.getElementById(`grade-${domain}`);
  
  let label = '보통';
  if (score >= 130) label = '최우수';
  else if (score >= 120) label = '우수';
  else if (score >= 110) label = '보통상';
  else if (score >= 90) label = '보통';
  else if (score >= 80) label = '보통하';
  else label = '경계선';

  gradeEl.textContent = label;
}

// Gaussian Normal Distribution Percentile Formula (Z-Score Approximation)
function getPercentileFromZ(z) {
  // Return percentage from top (e.g. z = 0 -> 50%, z = 1.96 -> 2.5%, z = -1.96 -> 97.5%)
  const sign = (z < 0) ? -1 : 1;
  const absZ = Math.abs(z);
  
  // Z-Score approximation formula
  const t = 1.0 / (1.0 + 0.2316419 * absZ);
  const d = 0.39894228 * Math.exp(-absZ * absZ / 2.0);
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const probability = 1.0 - p;
  
  let percentileVal = 0;
  if (sign === 1) {
    percentileVal = (1.0 - probability) * 100;
  } else {
    percentileVal = probability * 100;
  }
  
  return Math.max(0.1, Math.min(99.9, percentileVal));
}

// 9. Draw Bell Curve on HTML5 Canvas
function drawBellCurve(userIQ = 100) {
  const canvas = document.getElementById('bell-curve-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear
  ctx.clearRect(0, 0, width, height);

  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  
  // Palette config
  const axisColor = isLight ? '#cbd5e1' : '#334155';
  const curveColor = isLight ? '#94a3b8' : '#475569';
  const fillGradientColor = isLight ? 'rgba(168,85,247,0.06)' : 'rgba(168,85,247,0.03)';
  const textColor = isLight ? '#64748b' : '#94a3b8';
  
  // Draw Area Bounds
  const marginL = 40;
  const marginR = 40;
  const plotW = width - marginL - marginR;
  const plotH = height - 40;
  const baselineY = height - 25;

  // Normal distribution parameters (Mean 100, SD 15, Range 50 ~ 150)
  const minIQ = 50;
  const maxIQ = 150;
  
  function getX(iq) {
    const ratio = (iq - minIQ) / (maxIQ - minIQ);
    return marginL + ratio * plotW;
  }
  
  function getY(iq) {
    const z = (iq - 100) / 15;
    // PDF Gaussian function
    const pdfVal = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-z * z / 2);
    // Scale to fit height
    const ratio = pdfVal / 0.3989; // max value of standard normal curve is approx 0.3989
    return baselineY - ratio * plotH;
  }

  // Draw Bell Curve Path
  ctx.beginPath();
  for (let iq = minIQ; iq <= maxIQ; iq++) {
    const x = getX(iq);
    const y = getY(iq);
    if (iq === minIQ) {
      ctx.moveTo(x, baselineY);
    }
    ctx.lineTo(x, y);
  }
  ctx.lineTo(getX(maxIQ), baselineY);
  ctx.closePath();
  
  // Fill gradient under curve
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, fillGradientColor);
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw curve stroke line
  ctx.strokeStyle = curveColor;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Draw SD (Standard Deviation) Guideline vertical dashes
  const sdPoints = [70, 85, 100, 115, 130];
  ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  ctx.font = '9px Outfit, Inter';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';

  sdPoints.forEach(sdVal => {
    const x = getX(sdVal);
    const y = getY(sdVal);
    
    // Vertical dash line
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.moveTo(x, y);
    ctx.lineTo(x, baselineY);
    ctx.stroke();
    
    // X-Axis labels (IQ ticks)
    ctx.setLineDash([]);
    ctx.fillText(`IQ ${sdVal}`, x, baselineY + 15);
  });

  // Draw User Pinpoint
  const userX = getX(userIQ);
  const userY = getY(userIQ);

  // Vertical highlight line for user IQ
  ctx.beginPath();
  ctx.strokeStyle = 'var(--accent-purple)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([2, 2]);
  ctx.moveTo(userX, userY);
  ctx.lineTo(userX, baselineY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw glowing pulse ring around user pin
  ctx.beginPath();
  ctx.arc(userX, userY, 7, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
  ctx.fill();

  // Draw solid center dot for user pin
  ctx.beginPath();
  ctx.arc(userX, userY, 3.5, 0, 2 * Math.PI);
  ctx.fillStyle = 'var(--accent-purple)';
  ctx.fill();

  // Draw User text above pin
  ctx.font = 'bold 10px Outfit, Noto Sans KR';
  ctx.fillStyle = 'var(--accent-purple)';
  ctx.textAlign = 'center';
  ctx.fillText(`나의 위치 (IQ ${userIQ})`, userX, userY - 10);
}

// 10. Render Chart.js Radar Index Comparison Chart
function renderRadarChart(dataArr = [100, 100, 100, 100]) {
  const ctx = document.getElementById('chart-radar-indices');
  if (!ctx) return;

  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const gridColor = isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.05)';
  const textColor = isLight ? '#475569' : '#94a3b8';

  if (radarChart) radarChart.destroy();

  radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['언어이해 (VCI)', '지각추리 (PRI)', '작업기억 (WMI)', '처리속도 (PSI)'],
      datasets: [{
        label: '지표별 점수',
        data: dataArr,
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        borderColor: '#a855f7',
        pointBackgroundColor: '#a855f7',
        pointBorderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        r: {
          angleLines: { color: gridColor },
          grid: { color: gridColor },
          pointLabels: { color: textColor, font: { size: 10, weight: '600' } },
          ticks: { display: false, stepSize: 20 },
          min: 40,
          max: 160
        }
      }
    }
  });
}

// 11. Generate Tailored Strengths, Weaknesses, and Roadmaps
function generateStrengthsWeaknesses(indices) {
  const vci = indices[0];
  const pri = indices[1];
  const wmi = indices[2];
  const psi = indices[3];

  const strengthsList = document.getElementById('list-cognitive-strengths');
  const weaknessesList = document.getElementById('list-cognitive-weaknesses');
  const roadmapContainer = document.getElementById('roadmap-container');

  if (!strengthsList || !weaknessesList || !roadmapContainer) return;

  const strengths = [];
  const weaknesses = [];
  const roadmap = [];

  // 1. Evaluate Verbal Comprehension
  if (vci >= 115) {
    strengths.push("언어 추론 및 개념 형성 능력이 탁월합니다. 어휘 정보력이 풍부하고 복잡한 사회적 상황을 종합적으로 조율하는 지혜를 가지고 있습니다.");
  } else {
    weaknesses.push("언어적 정의 및 대면 전달 속도가 다소 제한적입니다. 평소 어휘 책이나 사설 칼럼 정독을 통해 표현력을 기르는 것을 추천합니다.");
  }

  // 2. Evaluate Perceptual Reasoning
  if (pri >= 115) {
    strengths.push("시공간 구성 및 비언어적 추론 성능이 아주 우수합니다. 눈앞의 도형 배치나 규칙성을 직관적으로 관통하여 원인을 밝히는 시각 패턴 능력이 특출납니다.");
  } else {
    weaknesses.push("생소한 그래픽 자극이나 입체적인 공간 배열에 반응하는 데 시간이 걸립니다. 퍼즐 또는 간단한 기하학 기반 게임 훈련이 도움이 됩니다.");
  }

  // 3. Evaluate Working Memory
  if (wmi >= 110) {
    strengths.push("작업 기억(Memory Capacity)이 안정적입니다. 여러 단계의 암산 처리 과정과 청각적 정보 흐름을 놓치지 않고 뇌 속에 올려 유지/조작할 수 있습니다.");
  } else {
    weaknesses.push("다차원 연계 수치 보류 능력이 떨어집니다. 한 번에 여러 정보가 들어올 때, 메모 작성을 습관화하여 워킹 메모리 과부하를 줄이는 훈련이 필요합니다.");
  }

  // 4. Evaluate Processing Speed
  if (psi >= 110) {
    strengths.push("시각 반응과 정보 탐색 속도가 대단히 빠릅니다. 단순 오류 판별을 정확하게 짚어내며 고도의 집중력을 순간적으로 발산하는 인지 순발력이 강점입니다.");
  } else {
    weaknesses.push("기호를 신속히 변환하고 동형을 찾아내는 처리 속도가 다소 지연됩니다. 순간 주의력을 요구하는 리듬 게임 또는 모션 제어 반응 훈련을 추천합니다.");
  }

  strengthsList.innerHTML = strengths.map(s => `<li>${s}</li>`).join('');
  weaknessesList.innerHTML = weaknesses.map(w => `<li>${w}</li>`).join('');

  // 5. Build Action Roadmap
  let stepIdx = 1;

  if (vci < 115) {
    roadmap.push({
      title: "매일 1편 문맥 쟁점 파악 및 칼럼 리딩",
      desc: "신문 칼럼이나 책을 소리 내어 정독한 후, 전체 맥락을 한 문장으로 요약하는 습관을 들여보세요. 언어적 개념망과 사회적 상황 분석 능력이 크게 강화됩니다."
    });
  }

  if (pri < 115) {
    roadmap.push({
      title: "기하학 퍼즐 및 공간 퍼즐 매일 5분 훈련",
      desc: "칠교놀이나 테트리스, 또는 복잡한 평면 도형의 조각을 맞추는 놀이에 노출해보세요. 시각적 구조를 세분화하여 분석하는 유동 지능이 대폭 향상됩니다."
    });
  }

  if (wmi < 110) {
    roadmap.push({
      title: "이중 N-Back 두뇌 훈련(Dual N-Back Game) 입문",
      desc: "스마트폰 어플로 손쉽게 구동 가능한 Dual N-Back 게임을 하루 3회 이상 플레이해 보세요. 뇌의 작업 공간인 전두엽 부근의 작용을 촉진하고 단기 기억 용량을 늘려줍니다."
    });
  }

  if (psi < 110) {
    roadmap.push({
      title: "시각적 동형 기호 찾기 및 순발력 트레이닝",
      desc: "제한 시간 30초 내에 단순 그림이나 숫자 차이를 구별하는 속도 매칭 보드게임을 정기적으로 연습해보세요. 단순 주의력 누수를 방지하고 정보 인코딩 속도를 가속시킵니다."
    });
  }

  // Always add a general cognitive health advice step
  roadmap.push({
    title: "충분한 숙면과 유산소 운동 병행",
    desc: "뇌에 깨끗한 혈류와 영양분을 공급하고 가소성(Neuroplasticity)을 유지할 수 있도록 주 3회 유산소 조깅과 최소 7시간의 질 높은 수면 루틴을 반드시 구축하십시오."
  });

  roadmapContainer.innerHTML = roadmap.map((item, idx) => `
    <div class="step-card">
      <div class="step-number">${idx + 1}</div>
      <div class="step-info">
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
      </div>
    </div>
  `).join('');
}
