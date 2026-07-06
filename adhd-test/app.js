/* ==========================================
   CineAHO ADHD Diagnostic & Cognitive Testing App
   ASRS Stepper, Go/No-Go Test, Stroop Test, and Custom Diagnostics
   ========================================== */

// 1. Language Datasets for Questions & UI
const TRANSLATIONS = {
  ko: {
    lobbyTitle: "종합 ADHD 인지 검사기",
    btnStart: "종합 검사 시작하기",
    btnRetry: "테스트 다시 하기",
    btnPrint: "진단서 출력 / PDF 저장",
    optionLabels: ["전혀 없음", "드물게 있음", "간혹 있음", "자주 있음", "아주 자주 있음"],
    stages: ["STAGE 1: ASRS 설문", "STAGE 2: Go/No-Go 반응 억제", "STAGE 3: 스트룹 색상 인지"],
    asrsTitle: "ASRS 자가진단 설문",
    asrsFooter: "자가 보고 평정 척도",
    gonogoTitle: "Go/No-Go 반응 억제 검사",
    gonogoFooter: "지속주의력 및 반응제어 척도",
    stroopTitle: "스트룹 색상-단어 인지간섭 검사",
    stroopFooter: "선택주의력 및 인지 유연성 척도",
    questions: [
      "일을 거의 다 끝마쳐놓고도 마지막 마무리 손질을 못해 쩔쩔맨 적이 얼마나 자주 있습니까?",
      "체계적인 계획을 요구하는 일을 해야 할 때 순서대로 진행하기가 얼마나 자주 어렵습니까?",
      "약속이나 해야 할 일을 잊어버려 곤란했던 적이 얼마나 자주 있습니까?",
      "골치 아픈 생각을 해야 하는 일을 피하거나 미루는 경우가 얼마나 자주 있습니까?",
      "오랫동안 앉아 있어야 할 때 손이나 발을 만지작거리거나 꼼지락거리는 경우가 얼마나 자주 있습니까?",
      "마치 모터가 달린 것처럼 끊임없이 움직이거나 지나치게 활동하는 경우가 얼마나 자주 있습니까?",
      "지루하거나 어려운 일을 할 때 부주의하여 실수를 저지르는 경우가 얼마나 자주 있습니까?",
      "지루하거나 단조로운 일을 할 때 주의를 집중하기가 얼마나 자주 어렵습니까?",
      "직접 대고 말하는데도 귀 기울여 듣지 않는 것 같은 느낌을 받은 적이 얼마나 자주 있습니까?",
      "집이나 직장에서 물건을 어디에 두었는지 잃어버리거나 찾는 데 어려움을 겪은 적이 얼마나 자주 있습니까?",
      "주변의 소음이나 활동 때문에 주의가 분산되는 경우가 얼마나 자주 있습니까?",
      "회의나 앉아 있어야 하는 상황에서 자리를 떠나는 경우가 얼마나 자주 있습니까?",
      "마음이 편치 않아 안절부절못한 적이 얼마나 자주 있습니까?",
      "혼자 여유롭게 쉬고 있을 때 마음을 편히 가지기가 어려운 적이 얼마나 자주 있습니까?",
      "사교적인 모임에서 말을 너무 많이 하는 자신을 발견한 적이 얼마나 자주 있습니까?",
      "대화 중 상대방이 말을 다 끝마치기 전에 상대방의 말을 가로채거나 끝맺어 주는 경우가 얼마나 자주 있습니까?",
      "차례를 기다려야 하는 상황에서 순서를 기다리기가 얼마나 자주 어렵습니까?",
      "다른 사람이 바쁘게 일하고 있을 때 방해하는 경우가 얼마나 자주 있습니까?"
    ],
    words: ["빨강", "초록", "파랑", "노랑"],
    results: {
      normal: "임상학적 정상 (Normal)",
      borderline: "경계선 상의 주의군 (Borderline)",
      high: "고위험 ADHD 성향군 (High Risk)",
      asrsBadge: ["주의점수 미달", "주의 수준", "상당한 수준"],
      gngOmission: ["우수", "양호", "집중력 감소"],
      gngCommission: ["우수", "양호", "충동 제어 저하"],
      stroopEval: ["신속·안정", "양호", "선택집중 지연"]
    }
  },
  en: {
    lobbyTitle: "ADHD Cognitive & Diagnostic Test",
    btnStart: "Start Full Assessment",
    btnRetry: "Restart Assessment",
    btnPrint: "Print / Save PDF",
    optionLabels: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
    stages: ["STAGE 1: ASRS Survey", "STAGE 2: Go/No-Go Test", "STAGE 3: Stroop Interference"],
    asrsTitle: "ASRS WHO Diagnostic Survey",
    asrsFooter: "Self-Report Scale",
    gonogoTitle: "Go/No-Go Response Inhibition Test",
    gonogoFooter: "Continuous Attention & Control",
    stroopTitle: "Stroop Word-Color Interference Test",
    stroopFooter: "Selective Attention & Cognitive Flexibility",
    questions: [
      "How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?",
      "How often do you have difficulty getting things in order when you have to do a task that requires organization?",
      "How often do you have problems remembering appointments or obligations?",
      "When you have a task that requires a lot of thought, how often do you avoid or delay getting started?",
      "How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?",
      "How often do you feel overly active and compelled to do things, as if you were driven by a motor?",
      "How often do you make careless mistakes when you have to work on a boring or difficult project?",
      "How often do you have difficulty keeping your attention when you are doing boring or repetitive work?",
      "How often do you have difficulty concentrating on what people say to you, even when they are speaking to you directly?",
      "How often do you misplace or have difficulty finding things at home or at work?",
      "How often are you distracted by activity or noise around you?",
      "How often do you leave your seat in meetings or other situations in which you are expected to remain seated?",
      "How often do you feel restless or fidgety?",
      "How often do you have difficulty unwinding and relaxing when you have time to yourself?",
      "How often do you find yourself talking too much when you are in social situations?",
      "When you're in a conversation, how often do you find yourself finishing the sentences of the people you are talking to, before they can finish them themselves?",
      "How often do you have difficulty waiting your turn when you are in situations where waiting is required?",
      "How often do you interrupt others when they are busy?"
    ],
    words: ["RED", "GREEN", "BLUE", "YELLOW"],
    results: {
      normal: "Clinically Normal",
      borderline: "Borderline Attention Group",
      high: "High Risk ADHD Tendency",
      asrsBadge: ["Normal Score", "Mild Symptoms", "Severe Symptoms"],
      gngOmission: ["Excellent", "Good", "Attention Deficit"],
      gngCommission: ["Excellent", "Good", "Impulse Deficit"],
      stroopEval: ["Fast & Stable", "Good", "Selective Focus Delay"]
    }
  },
  ja: {
    lobbyTitle: "総合 ADHD 認知機能検査",
    btnStart: "検査を開始する",
    btnRetry: "テストを再試行する",
    btnPrint: "診断書印刷 / PDF保存",
    optionLabels: ["なし", "まれにある", "ときどきある", "頻繁にある", "非常によくある"],
    stages: ["STAGE 1: ASRS問診", "STAGE 2: Go/No-Go反応抑制", "STAGE 3: ストループ色認知"],
    asrsTitle: "ASRS WHO 自己評価尺度",
    asrsFooter: "自己申告型評価尺度",
    gonogoTitle: "Go/No-Go 反応抑制テスト",
    gonogoFooter: "持続的注意及び反応制御尺度",
    stroopTitle: "ストループ色彩インジケータ検査",
    stroopFooter: "選択的注意及び認知的柔軟性尺度",
    questions: [
      "物事の難しい部分が終わった後、最後の仕上げで手こずることがどのくらいありますか？",
      "計画性や整理整頓が必要な仕事をする際、順序立てて行うことがどのくらい困難ですか？",
      "約束やしなければならない用事を忘れてしまい、困ったことがどのくらいありますか？",
      "深く考える必要がある仕事を避けたり、後回しにしたりすることがどのくらいありますか？",
      "長時間座っていなければならない時、手足をそわそわ動かしたりもじもじしたりすることがどのくらいありますか？",
      "まるでモーターが回っているかのように、絶えず動き回ったり過剰に行動したりすることがどのくらいありますか？",
      "退屈または難しい仕事をするとき、不注意によるミスをすることがどのくらいありますか？",
      "退屈で単調な作業をするとき、注意を集中し続けることがどのくらい困難ですか？",
      "直接話しかけられているのに、上の空で話を聞いていないように感じる瞬間がどのくらいありますか？",
      "家や職場で、物をどこに置いたか忘れたり、探すのに苦労したりすることがどのくらいありますか？",
      "周囲の騒音や活動によって、気が散ってしまうことがどのくらいありますか？",
      "会議や席に座っているべき状況で、席を立ってしまうことがどのくらいありますか？",
      "落ち着きがなく、そわそわした気分になることがどのくらいありますか？",
      "一人でゆっくり休んでいるとき、気分をリラックスさせることがどのくらい困難ですか？",
      "社交的な集まりで、自分が話しすぎてしまうと感じることがどのくらいありますか？",
      "会話の際、相手が話し終える前に相手の言葉を遮って最後まで代わりに言ってしまうことがどのくらいありますか？",
      "列に並んで順番を待つ状況で、待つことがどのくらい苦痛ですか？",
      "他人が忙しく働いているときに、邪魔をしてしまうことがどのくらいありますか？"
    ],
    words: ["赤", "緑", "青", "黄"],
    results: {
      normal: "臨床的正常 (Normal)",
      borderline: "境界線上の注意群 (Borderline)",
      high: "高リスクADHD傾向群 (High Risk)",
      asrsBadge: ["注意スコア正常", "注意レベル警報", "注意欠陥症状あり"],
      gngOmission: ["優秀", "良好", "集中力低下"],
      gngCommission: ["優秀", "良好", "衝動抑制低下"],
      stroopEval: ["迅速・安定", "良好", "選択的注意遅延"]
    }
  }
};

// 2. Audio Synthesizer via Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (type === 'tick') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  } else if (type === 'correct') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.setValueAtTime(880, now + 0.08);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === 'incorrect') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.25);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.start(now);
    osc.stop(now + 0.25);
  } else if (type === 'complete') {
    // Play arpeggio
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((f, i) => {
      const oscItem = audioCtx.createOscillator();
      const gainItem = audioCtx.createGain();
      oscItem.connect(gainItem);
      gainItem.connect(audioCtx.destination);
      
      oscItem.type = 'sine';
      oscItem.frequency.setValueAtTime(f, now + i * 0.07);
      gainItem.gain.setValueAtTime(0.1, now + i * 0.07);
      gainItem.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.25);
      
      oscItem.start(now + i * 0.07);
      oscItem.stop(now + i * 0.07 + 0.25);
    });
  }
}

// 3. Global App State
let currentLang = localStorage.getItem('site-lang') || 'ko';
let activeSection = 'lobby';

// ASRS State
let asrsCurrentQuestion = 0;
let asrsAnswers = Array(18).fill(-1);

// Go/No-Go State
let gngActive = false;
let gngTrialCount = 0;
let gngTrialsTotal = 40;
let gngResults = {
  goTotal: 0,
  nogoTotal: 0,
  hits: 0,           // Correct GO presses
  omissions: 0,      // Missed GOs
  commissions: 0,    // Pressed on NOGO
  correctRejections: 0, // Did not press on NOGO
  reactionTimes: []
};
let gngCanvas, gngCtx;
let gngStimulus = null; // 'go', 'nogo', or null
let gngStimulusTime = 0;
let gngHasResponded = false;
let gngGameLoop = null;

// Stroop State
let stroopActive = false;
let stroopTrialCount = 0;
let stroopTrialsTotal = 24;
let stroopResults = {
  congruentRTs: [],
  incongruentRTs: [],
  correctCongruent: 0,
  correctIncongruent: 0,
  congruentCount: 0,
  incongruentCount: 0
};
let stroopCurrentStimulus = null;
let stroopStimulusStartTime = 0;

// Chart references
let cognitiveRadarChart = null;
let stroopSpeedBarChart = null;

// DOM Load
document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initTheme();
  bindLobbyEvents();
});

// Sync Theme Settings (Light/Dark)
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeUI(savedTheme);

  document.getElementById('theme-toggle').addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeUI(newTheme);
    
    // Repaint charts if report is active
    if (activeSection === 'report') {
      renderCharts();
    }
  });
}

function updateThemeUI(theme) {
  const btn = document.getElementById('theme-toggle');
  const icon = btn.querySelector('i');
  const text = btn.querySelector('span');

  if (theme === 'light') {
    icon.className = 'fa-solid fa-moon';
    text.textContent = currentLang === 'ko' ? '다크' : (currentLang === 'ja' ? 'ダーク' : 'Dark');
    btn.style.borderColor = 'rgba(15, 23, 42, 0.08)';
  } else {
    icon.className = 'fa-solid fa-sun';
    text.textContent = currentLang === 'ko' ? '라이트' : (currentLang === 'ja' ? 'ライト' : 'Light');
    btn.style.borderColor = 'rgba(255, 255, 255, 0.08)';
  }
}

// Initialize Translations
function initLanguage() {
  const langItems = document.querySelectorAll('.lang-dropdown-item');
  
  // Try to read language from URL or local storage
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  if (langParam && TRANSLATIONS[langParam]) {
    currentLang = langParam;
    localStorage.setItem('site-lang', currentLang);
  }

  localizeDOM();
}

function localizeDOM() {
  const dict = TRANSLATIONS[currentLang];
  
  // Title / Headers
  document.querySelector('.logo-text').innerHTML = `CineAHO's <span>ADHD Test</span>`;
  document.querySelector('.lobby-hero h1').textContent = dict.lobbyTitle;
  document.getElementById('btn-start-all').innerHTML = `<i class="fa-solid fa-circle-play"></i> ${dict.btnStart}`;
  
  // Grid Cards
  const cards = document.querySelectorAll('.test-type-card');
  if (cards.length >= 3) {
    cards[0].querySelector('h3').textContent = dict.stages[0].substring(9);
    cards[1].querySelector('h3').textContent = dict.stages[1].substring(9);
    cards[2].querySelector('h3').textContent = dict.stages[2].substring(9);
    
    if (currentLang === 'en') {
      cards[0].querySelector('p').textContent = "WHO standard 18-question screening tool measuring inattention, impulsivity, and hyperactivity in daily activities.";
      cards[1].querySelector('p').textContent = "Measures reaction inhibition and attention drift by flashing target shapes (Go) and decoy shapes (No-Go).";
      cards[2].querySelector('p').textContent = "Measures cognitive flexibility and selective focus under conflicting color word cues.";
      
      document.querySelectorAll('.badge-time').forEach(el => el.innerHTML = `<i class="fa-regular fa-clock"></i> ~2 min`);
    } else if (currentLang === 'ja') {
      cards[0].querySelector('p').textContent = "WHO世界保健機関標準の18問の自己評価尺度に基づき、日常の不注意と多動性・衝動性を定量的に評価します。";
      cards[1].querySelector('p').textContent = "画面に現れるターゲット図形（Go）に素早く反応し、フェイク標的（No-Go）への反応を抑える注意集中テスト。";
      cards[2].querySelector('p').textContent = "単語の文字色と意味情報が一致しない干渉状況における前頭葉の抑制制御力を測定します。";
      
      document.querySelectorAll('.badge-time').forEach(el => el.innerHTML = `<i class="fa-regular fa-clock"></i> 約2分`);
    }
  }

  // Footer Button
  document.getElementById('btn-retry').innerHTML = `<i class="fa-solid fa-rotate-left"></i> ${dict.btnRetry}`;
  document.getElementById('btn-export-pdf').innerHTML = `<i class="fa-solid fa-print"></i> ${dict.btnPrint}`;
}

// Router between screens
function showSection(sectionId) {
  const sections = ['sec-lobby', 'sec-asrs', 'sec-gonogo', 'sec-stroop', 'sec-loading', 'sec-report'];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (id === sectionId) {
      el.classList.add('active-section');
      el.style.display = 'block';
    } else {
      el.classList.remove('active-section');
      el.style.display = 'none';
    }
  });
  activeSection = sectionId;
  window.scrollTo(0, 0);
}

// Bind Events
function bindLobbyEvents() {
  document.getElementById('btn-start-all').addEventListener('click', startAssessmentSuite);
  document.getElementById('btn-asrs-prev').addEventListener('click', loadPrevAsrsQuestion);
  document.getElementById('btn-asrs-next').addEventListener('click', loadNextAsrsQuestion);
  
  // ASRS Option buttons
  const optBtns = document.querySelectorAll('.asrs-options-grid .btn-option');
  optBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const score = parseInt(btn.getAttribute('data-value'), 10);
      selectAsrsOption(score);
    });
  });

  // Go/No-Go Buttons
  document.getElementById('btn-start-gonogo').addEventListener('click', startGoNoGoGame);
  
  // Stroop Buttons
  document.getElementById('btn-start-stroop').addEventListener('click', startStroopGame);
  const stroopBtns = document.querySelectorAll('.stroop-choices-grid .btn-choice-color');
  stroopBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const chosenColor = btn.getAttribute('data-color');
      submitStroopAnswer(chosenColor);
    });
  });

  // Keyboard controls for Stroop
  window.addEventListener('keydown', (e) => {
    if (activeSection === 'sec-stroop' && stroopActive && !document.getElementById('stroop-game-screen').classList.contains('hidden')) {
      if (e.key === '1') submitStroopAnswer('red');
      else if (e.key === '2') submitStroopAnswer('green');
      else if (e.key === '3') submitStroopAnswer('blue');
      else if (e.key === '4') submitStroopAnswer('yellow');
    }
  });

  // Restart Button
  document.getElementById('btn-retry').addEventListener('click', () => {
    resetAllTestState();
    showSection('sec-lobby');
  });

  // Print PDF Button
  document.getElementById('btn-export-pdf').addEventListener('click', () => {
    window.print();
  });
}

function startAssessmentSuite() {
  resetAllTestState();
  showSection('sec-asrs');
  loadAsrsQuestion();
}

function resetAllTestState() {
  asrsCurrentQuestion = 0;
  asrsAnswers = Array(18).fill(-1);
  
  gngActive = false;
  gngTrialCount = 0;
  gngResults = { goTotal: 0, nogoTotal: 0, hits: 0, omissions: 0, commissions: 0, correctRejections: 0, reactionTimes: [] };
  
  stroopActive = false;
  stroopTrialCount = 0;
  stroopResults = { congruentRTs: [], incongruentRTs: [], correctCongruent: 0, correctIncongruent: 0, congruentCount: 0, incongruentCount: 0 };
}


/* ==========================================
   STAGE 1: ASRS Questionnaire Controller
   ========================================== */
function loadAsrsQuestion() {
  const dict = TRANSLATIONS[currentLang];
  
  // Indicators
  document.querySelector('#sec-asrs .current-test-label').textContent = dict.stages[0].split(':')[0];
  document.querySelector('#sec-asrs .test-title').textContent = dict.asrsTitle;
  document.querySelector('#sec-asrs .test-stage-name').textContent = dict.asrsFooter;
  document.getElementById('asrs-page-number').textContent = `${asrsCurrentQuestion + 1} / 18`;
  
  const progressPercent = Math.round(((asrsCurrentQuestion + 1) / 18) * 100);
  document.getElementById('asrs-progress').style.width = `${progressPercent}%`;

  // Question Text
  document.getElementById('asrs-question-text').textContent = `${asrsCurrentQuestion + 1}. ${dict.questions[asrsCurrentQuestion]}`;

  // Option Labels
  const optButtons = document.querySelectorAll('.asrs-options-grid .btn-option');
  optButtons.forEach((btn, idx) => {
    btn.textContent = dict.optionLabels[idx];
    btn.classList.remove('selected');
    
    // Highlight if previously selected
    if (asrsAnswers[asrsCurrentQuestion] === idx) {
      btn.classList.add('selected');
    }
  });

  // Prev button control
  document.getElementById('btn-asrs-prev').disabled = (asrsCurrentQuestion === 0);
}

function selectAsrsOption(val) {
  asrsAnswers[asrsCurrentQuestion] = val;
  playSound('tick');

  // Highlight selected UI
  const optButtons = document.querySelectorAll('.asrs-options-grid .btn-option');
  optButtons.forEach((btn, idx) => {
    if (idx === val) btn.classList.add('selected');
    else btn.classList.remove('selected');
  });

  // Auto advance after 250ms
  setTimeout(() => {
    if (asrsCurrentQuestion < 17) {
      asrsCurrentQuestion++;
      loadAsrsQuestion();
    } else {
      // Completed STAGE 1
      playSound('complete');
      transitionToGoNoGoLobby();
    }
  }, 220);
}

function loadPrevAsrsQuestion() {
  if (asrsCurrentQuestion > 0) {
    asrsCurrentQuestion--;
    loadAsrsQuestion();
  }
}

function loadNextAsrsQuestion() {
  if (asrsCurrentQuestion < 17 && asrsAnswers[asrsCurrentQuestion] !== -1) {
    asrsCurrentQuestion++;
    loadAsrsQuestion();
  }
}

function transitionToGoNoGoLobby() {
  showSection('sec-gonogo');
  document.getElementById('gonogo-instructions').classList.remove('hidden');
  document.getElementById('gonogo-game-screen').classList.add('hidden');
  
  // Localize Instructions
  const dict = TRANSLATIONS[currentLang];
  document.querySelector('#sec-gonogo .current-test-label').textContent = dict.stages[1].split(':')[0];
  document.querySelector('#sec-gonogo .test-title').textContent = dict.gonogoTitle;
  document.querySelector('#sec-gonogo .test-stage-name').textContent = dict.gonogoFooter;
  
  if (currentLang === 'en') {
    document.querySelector('#gonogo-instructions h2')?.remove(); // clean dynamic tags
    document.querySelector('.go-symbol + .rule-desc').innerHTML = "<strong>Green Circle (GO):</strong> Press <strong>[Space]</strong> or Tap screen as fast as possible!";
    document.querySelector('.nogo-symbol + .rule-desc').innerHTML = "<strong>Red X (NO-GO):</strong> Do <strong>NOT</strong> press anything. Hold your response!";
    document.querySelector('.instruction-notes p').innerHTML = "<i class='fa-solid fa-triangle-exclamation'></i> Notice: 75% of cues are green circles. Your reflexes will push you to press. Suppress it!";
    document.getElementById('btn-start-gonogo').innerHTML = `<i class="fa-solid fa-circle-play"></i> Start Reaction Test`;
  } else if (currentLang === 'ja') {
    document.querySelector('.go-symbol + .rule-desc').innerHTML = "<strong>緑の円 (GO):</strong> 見えたらすぐに <strong>[Space]</strong> を押すか画面をタップします！";
    document.querySelector('.nogo-symbol + .rule-desc').innerHTML = "<strong>赤いエックス (NO-GO):</strong> キーを<strong>押さずに待機</strong>してください！";
    document.querySelector('.instruction-notes p').innerHTML = "<i class='fa-solid fa-triangle-exclamation'></i> 注意: 75%が緑の円のため、反射的に押してしまいがちです。抑制力が必要とされます。";
    document.getElementById('btn-start-gonogo').innerHTML = `<i class="fa-solid fa-circle-play"></i> 反応検査を開始`;
  }
}


/* ==========================================
   STAGE 2: Go/No-Go Response Test Controller
   ========================================== */
function startGoNoGoGame() {
  document.getElementById('gonogo-instructions').classList.add('hidden');
  document.getElementById('gonogo-countdown-overlay').classList.remove('hidden');
  document.getElementById('gonogo-game-screen').classList.add('hidden');

  gngCanvas = document.getElementById('gonogo-canvas');
  gngCtx = gngCanvas.getContext('2d');
  
  // Setup keyboard input binding
  window.addEventListener('keydown', handleGoNoGoKeypress);
  
  // Mobile tap binding
  const tapArea = document.getElementById('mobile-gonogo-tap');
  tapArea.addEventListener('touchstart', handleGoNoGoTap, { passive: true });

  let count = 3;
  document.getElementById('gonogo-countdown-number').textContent = count;
  playSound('tick');
  
  let countdownTimer = setInterval(() => {
    count--;
    if (count > 0) {
      document.getElementById('gonogo-countdown-number').textContent = count;
      playSound('tick');
    } else {
      clearInterval(countdownTimer);
      document.getElementById('gonogo-countdown-overlay').classList.add('hidden');
      document.getElementById('gonogo-game-screen').classList.remove('hidden');
      runGoNoGoTestLoop();
    }
  }, 1000);
}

function runGoNoGoTestLoop() {
  gngActive = true;
  gngTrialCount = 0;
  gngResults = { goTotal: 0, nogoTotal: 0, hits: 0, omissions: 0, commissions: 0, correctRejections: 0, reactionTimes: [] };

  // Setup loop
  nextGoNoGoTrial();
}

function nextGoNoGoTrial() {
  if (!gngActive) return;

  if (gngTrialCount >= gngTrialsTotal) {
    // Stage completed
    endGoNoGoGame();
    return;
  }

  gngTrialCount++;
  document.getElementById('gonogo-counter').textContent = `${currentLang === 'ko' ? '진행률' : 'Progress'}: ${gngTrialCount} / ${gngTrialsTotal}`;

  gngHasResponded = false;
  
  // 75% GO, 25% NOGO
  const randVal = Math.random();
  if (randVal < 0.75) {
    gngStimulus = 'go';
    gngResults.goTotal++;
  } else {
    gngStimulus = 'nogo';
    gngResults.nogoTotal++;
  }

  // Draw Stimulus
  drawGoNoGoCue(gngStimulus);
  gngStimulusTime = performance.now();
  playSound('tick');

  // Trigger blank screen after 250ms
  setTimeout(() => {
    drawGoNoGoCue(null);
    
    // Evaluate non-response at the end of the trial (1000ms total trial time)
    setTimeout(() => {
      if (!gngHasResponded) {
        if (gngStimulus === 'go') {
          // Missed target (Omission)
          gngResults.omissions++;
        } else if (gngStimulus === 'nogo') {
          // Correctly refrained (Correct Rejection)
          gngResults.correctRejections++;
        }
      }
      
      // Next Trial
      nextGoNoGoTrial();
    }, 750); // Inter-stimulus delay: 750ms
  }, 250); // Stimulus active: 250ms
}

function drawGoNoGoCue(type) {
  gngCtx.clearRect(0, 0, gngCanvas.width, gngCanvas.height);

  // Background
  gngCtx.fillStyle = '#0f172a';
  gngCtx.fillRect(0, 0, gngCanvas.width, gngCanvas.height);

  // Grid background
  gngCtx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  gngCtx.lineWidth = 1;
  for (let i = 20; i < gngCanvas.width; i += 20) {
    gngCtx.beginPath();
    gngCtx.moveTo(i, 0);
    gngCtx.lineTo(i, gngCanvas.height);
    ctxStroke();
    
    gngCtx.beginPath();
    gngCtx.moveTo(0, i);
    gngCtx.lineTo(gngCanvas.width, i);
    ctxStroke();
  }

  function ctxStroke() {
    gngCtx.stroke();
  }

  if (type === 'go') {
    // Draw neon green circle
    gngCtx.shadowColor = '#06d6a0';
    gngCtx.shadowBlur = 15;
    gngCtx.fillStyle = '#06d6a0';
    gngCtx.beginPath();
    gngCtx.arc(gngCanvas.width / 2, gngCanvas.height / 2, 50, 0, Math.PI * 2);
    gngCtx.fill();
    gngCtx.shadowBlur = 0; // reset
  } else if (type === 'nogo') {
    // Draw neon red square / X
    gngCtx.shadowColor = '#ff007f';
    gngCtx.shadowBlur = 15;
    gngCtx.strokeStyle = '#ff007f';
    gngCtx.lineWidth = 12;
    gngCtx.lineCap = 'round';
    
    const size = 50;
    const cx = gngCanvas.width / 2;
    const cy = gngCanvas.height / 2;
    
    gngCtx.beginPath();
    gngCtx.moveTo(cx - size, cy - size);
    gngCtx.lineTo(cx + size, cy + size);
    gngCtx.stroke();
    
    gngCtx.beginPath();
    gngCtx.moveTo(cx + size, cy - size);
    gngCtx.lineTo(cx - size, cy + size);
    gngCtx.stroke();
    
    gngCtx.shadowBlur = 0; // reset
  } else {
    // Blank fixation cross
    gngCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    gngCtx.lineWidth = 2;
    gngCtx.beginPath();
    gngCtx.moveTo(gngCanvas.width / 2 - 15, gngCanvas.height / 2);
    gngCtx.lineTo(gngCanvas.width / 2 + 15, gngCanvas.height / 2);
    gngCtx.stroke();
    
    gngCtx.beginPath();
    gngCtx.moveTo(gngCanvas.width / 2, gngCanvas.height / 2 - 15);
    gngCtx.lineTo(gngCanvas.width / 2, gngCanvas.height / 2 + 15);
    gngCtx.stroke();
  }
}

function handleGoNoGoKeypress(e) {
  if (e.code === 'Space') {
    e.preventDefault();
    triggerGoNoGoResponse();
  }
}

function handleGoNoGoTap(e) {
  triggerGoNoGoResponse();
}

function triggerGoNoGoResponse() {
  if (!gngActive || gngHasResponded || gngStimulus === null) return;
  gngHasResponded = true;

  const responseTime = performance.now() - gngStimulusTime;

  if (gngStimulus === 'go') {
    // Correct Action (Hit)
    gngResults.hits++;
    gngResults.reactionTimes.push(responseTime);
    playSound('correct');
    
    // Quick flash of canvas border to green
    flashCanvasBorder(true);
  } else if (gngStimulus === 'nogo') {
    // Incorrect Action (Commission / Impulsivity)
    gngResults.commissions++;
    playSound('incorrect');
    flashCanvasBorder(false);
  }
}

function flashCanvasBorder(correct) {
  gngCanvas.style.borderColor = correct ? 'var(--green-neon)' : 'var(--magenta-neon)';
  setTimeout(() => {
    gngCanvas.style.borderColor = 'var(--panel-border)';
  }, 150);
}

function endGoNoGoGame() {
  gngActive = false;
  window.removeEventListener('keydown', handleGoNoGoKeypress);
  playSound('complete');
  transitionToStroopLobby();
}

function transitionToStroopLobby() {
  showSection('sec-stroop');
  document.getElementById('stroop-instructions').classList.remove('hidden');
  document.getElementById('stroop-game-screen').classList.add('hidden');
  
  const dict = TRANSLATIONS[currentLang];
  document.querySelector('#sec-stroop .current-test-label').textContent = dict.stages[2].split(':')[0];
  document.querySelector('#sec-stroop .test-title').textContent = dict.stroopTitle;
  document.querySelector('#sec-stroop .test-stage-name').textContent = dict.stroopFooter;

  if (currentLang === 'en') {
    document.querySelector('.example-card:nth-child(1) .example-text').textContent = "RED";
    document.querySelector('.example-card:nth-child(1) .btn-preview-color').textContent = "Green Button (Correct)";
    document.querySelector('.example-card:nth-child(2) .example-text').textContent = "BLUE";
    document.querySelector('.example-card:nth-child(2) .btn-preview-color').textContent = "Yellow Button (Correct)";
    
    document.querySelector('.instruction-notes p').innerHTML = "<i class='fa-solid fa-keyboard'></i> Shortcuts: [1] Red, [2] Green, [3] Blue, [4] Yellow";
    document.getElementById('btn-start-stroop').innerHTML = `<i class="fa-solid fa-circle-play"></i> Start Stroop Test`;
  } else if (currentLang === 'ja') {
    document.querySelector('.example-card:nth-child(1) .example-text').textContent = "赤";
    document.querySelector('.example-card:nth-child(1) .btn-preview-color').textContent = "緑を選択 (正解)";
    document.querySelector('.example-card:nth-child(2) .example-text').textContent = "青";
    document.querySelector('.example-card:nth-child(2) .btn-preview-color').textContent = "黄を選択 (正解)";
    
    document.querySelector('.instruction-notes p').innerHTML = "<i class='fa-solid fa-keyboard'></i> ショートカットキー: [1] 赤, [2] 緑, [3] 青, [4] 黄";
    document.getElementById('btn-start-stroop').innerHTML = `<i class="fa-solid fa-circle-play"></i> ストループ検査を開始`;
  }
}


/* ==========================================
   STAGE 3: Stroop Interference Test Controller
   ========================================== */
function startStroopGame() {
  document.getElementById('stroop-instructions').classList.add('hidden');
  document.getElementById('stroop-countdown-overlay').classList.remove('hidden');
  document.getElementById('stroop-game-screen').classList.add('hidden');

  let count = 3;
  document.getElementById('stroop-countdown-number').textContent = count;
  playSound('tick');
  
  let countdownTimer = setInterval(() => {
    count--;
    if (count > 0) {
      document.getElementById('stroop-countdown-number').textContent = count;
      playSound('tick');
    } else {
      clearInterval(countdownTimer);
      document.getElementById('stroop-countdown-overlay').classList.add('hidden');
      document.getElementById('stroop-game-screen').classList.remove('hidden');
      runStroopLoop();
    }
  }, 1000);
}

function runStroopLoop() {
  stroopActive = true;
  stroopTrialCount = 0;
  stroopResults = { congruentRTs: [], incongruentRTs: [], correctCongruent: 0, correctIncongruent: 0, congruentCount: 0, incongruentCount: 0 };
  nextStroopTrial();
}

function nextStroopTrial() {
  if (!stroopActive) return;

  if (stroopTrialCount >= stroopTrialsTotal) {
    endStroopGame();
    return;
  }

  stroopTrialCount++;
  document.getElementById('stroop-counter').textContent = `${currentLang === 'ko' ? '진행률' : 'Progress'}: ${stroopTrialCount} / ${stroopTrialsTotal}`;

  const dict = TRANSLATIONS[currentLang];
  const colors = ['red', 'green', 'blue', 'yellow'];
  const colorMap = {
    red: { hex: '#ff007f', nameKo: '빨강', nameEn: 'RED', nameJa: '赤' },
    green: { hex: '#06d6a0', nameKo: '초록', nameEn: 'GREEN', nameJa: '緑' },
    blue: { hex: '#00f2fe', nameKo: '파랑', nameEn: 'BLUE', nameJa: '青' },
    yellow: { hex: '#ffd166', nameKo: '노랑', nameEn: 'YELLOW', nameJa: '黄' }
  };

  // Determine trial type
  const isCongruent = Math.random() >= 0.5;
  const wordColorKey = colors[Math.floor(Math.random() * colors.length)];
  let fontColorKey = wordColorKey;

  if (!isCongruent) {
    // Pick different color for font
    const possibleColors = colors.filter(c => c !== wordColorKey);
    fontColorKey = possibleColors[Math.floor(Math.random() * possibleColors.length)];
  }

  // Update State
  stroopCurrentStimulus = {
    isCongruent,
    wordColor: wordColorKey,
    fontColor: fontColorKey
  };

  if (isCongruent) stroopResults.congruentCount++;
  else stroopResults.incongruentCount++;

  // Render text
  const wordEl = document.getElementById('stroop-word');
  const wordStringName = 'name' + currentLang.charAt(0).toUpperCase() + currentLang.slice(1);
  wordEl.textContent = colorMap[wordColorKey][wordStringName];
  wordEl.style.color = colorMap[fontColorKey].hex;
  
  // Set shadows
  wordEl.style.textShadow = `0 0 15px ${colorMap[fontColorKey].hex}66`;

  // Start timer
  stroopStimulusStartTime = performance.now();
}

function submitStroopAnswer(chosenColor) {
  if (!stroopActive) return;
  
  const responseTime = performance.now() - stroopStimulusStartTime;
  const isCorrect = (chosenColor === stroopCurrentStimulus.fontColor);
  
  // Log results
  if (stroopCurrentStimulus.isCongruent) {
    if (isCorrect) {
      stroopResults.correctCongruent++;
      stroopResults.congruentRTs.push(responseTime);
    }
  } else {
    if (isCorrect) {
      stroopResults.correctIncongruent++;
      stroopResults.incongruentRTs.push(responseTime);
    }
  }

  if (isCorrect) {
    playSound('correct');
    flashStimulusBox(true);
  } else {
    playSound('incorrect');
    flashStimulusBox(false);
  }

  // Brief pause before next trial (300ms)
  stroopActive = false;
  setTimeout(() => {
    stroopActive = true;
    nextStroopTrial();
  }, 300);
}

function flashStimulusBox(correct) {
  const box = document.querySelector('.stroop-stimulus-box');
  box.style.borderColor = correct ? 'var(--green-neon)' : 'var(--magenta-neon)';
  box.style.background = correct ? 'rgba(6, 214, 160, 0.05)' : 'rgba(255, 0, 127, 0.05)';
  
  setTimeout(() => {
    box.style.borderColor = 'var(--panel-border)';
    box.style.background = 'transparent';
  }, 200);
}

function endStroopGame() {
  stroopActive = false;
  playSound('complete');
  triggerScoringAnimation();
}


/* ==========================================
   Scoring Transition & Evaluation Model
   ========================================== */
function triggerScoringAnimation() {
  showSection('sec-loading');
  
  let scoreBar = document.getElementById('scoring-progress');
  let pct = 0;
  
  let timer = setInterval(() => {
    pct += 5;
    scoreBar.style.width = `${pct}%`;
    playSound('tick');

    if (pct >= 100) {
      clearInterval(timer);
      setTimeout(() => {
        showSection('sec-report');
        generateReportMetrics();
      }, 300);
    }
  }, 100);
}

function generateReportMetrics() {
  const dict = TRANSLATIONS[currentLang];
  
  // 1. ASRS Scoring
  // Inattention index (Q 1,2,3,4, 7,8,9,10,11) - 9 items
  const inattIdx = [0, 1, 2, 3, 6, 7, 8, 9, 10];
  const hyperIdx = [4, 5, 11, 12, 13, 14, 15, 16, 17];
  
  let rawInatt = 0;
  inattIdx.forEach(idx => rawInatt += asrsAnswers[idx]);
  
  let rawHyper = 0;
  hyperIdx.forEach(idx => rawHyper += asrsAnswers[idx]);

  const asrsTotal = rawInatt + rawHyper; // Max 72
  document.getElementById('td-asrs-score').textContent = `${asrsTotal} / 72`;
  
  const asrsBadge = document.getElementById('badge-asrs-eval');
  if (asrsTotal >= 36) {
    asrsBadge.textContent = dict.results.asrsBadge[2];
    asrsBadge.className = "mini-badge bg-red";
  } else if (asrsTotal >= 20) {
    asrsBadge.textContent = dict.results.asrsBadge[1];
    asrsBadge.className = "mini-badge bg-yellow";
  } else {
    asrsBadge.textContent = dict.results.asrsBadge[0];
    asrsBadge.className = "mini-badge bg-green";
  }

  // 2. Go/No-Go Metrics
  const omissionRate = gngResults.goTotal > 0 ? (gngResults.omissions / gngResults.goTotal) * 100 : 0;
  const commissionRate = gngResults.nogoTotal > 0 ? (gngResults.commissions / gngResults.nogoTotal) * 100 : 0;
  const meanGoRT = gngResults.reactionTimes.length > 0 ? 
    gngResults.reactionTimes.reduce((s,v)=>s+v, 0) / gngResults.reactionTimes.length : 0;
  
  document.getElementById('td-gonogo-omission').textContent = `${omissionRate.toFixed(1)}% (${gngResults.omissions}회)`;
  document.getElementById('td-gonogo-commission').textContent = `${commissionRate.toFixed(1)}% (${gngResults.commissions}회)`;

  const omiBadge = document.getElementById('badge-gonogo-omission');
  if (omissionRate >= 15) {
    omiBadge.textContent = dict.results.gngOmission[2];
    omiBadge.className = "mini-badge bg-red";
  } else if (omissionRate >= 6) {
    omiBadge.textContent = dict.results.gngOmission[1];
    omiBadge.className = "mini-badge bg-yellow";
  } else {
    omiBadge.textContent = dict.results.gngOmission[0];
    omiBadge.className = "mini-badge bg-green";
  }

  const comBadge = document.getElementById('badge-gonogo-commission');
  if (commissionRate >= 35) {
    comBadge.textContent = dict.results.gngCommission[2];
    comBadge.className = "mini-badge bg-red";
  } else if (commissionRate >= 15) {
    comBadge.textContent = dict.results.gngCommission[1];
    comBadge.className = "mini-badge bg-yellow";
  } else {
    comBadge.textContent = dict.results.gngCommission[0];
    comBadge.className = "mini-badge bg-green";
  }

  // 3. Stroop Metrics
  const congruentRT = stroopResults.congruentRTs.length > 0 ? 
    stroopResults.congruentRTs.reduce((s,v)=>s+v, 0) / stroopResults.congruentRTs.length : 0;
  const incongruentRT = stroopResults.incongruentRTs.length > 0 ? 
    stroopResults.incongruentRTs.reduce((s,v)=>s+v, 0) / stroopResults.incongruentRTs.length : 0;
  
  const stroopCost = Math.max(0, incongruentRT - congruentRT);
  document.getElementById('td-stroop-cost').textContent = `${Math.round(stroopCost)}ms`;

  const stroopBadge = document.getElementById('badge-stroop-eval');
  if (stroopCost >= 220) {
    stroopBadge.textContent = dict.results.stroopEval[2];
    stroopBadge.className = "mini-badge bg-red";
  } else if (stroopCost >= 110) {
    stroopBadge.textContent = dict.results.stroopEval[1];
    stroopBadge.className = "mini-badge bg-yellow";
  } else {
    stroopBadge.textContent = dict.results.stroopEval[0];
    stroopBadge.className = "mini-badge bg-green";
  }

  // 4. Combined ADHD Risk Score (0 - 100)
  // Weightings: ASRS (40%), GNG Commission (25%), GNG Omission (15%), Stroop Cost (20%)
  const asrsFactor = (asrsTotal / 72) * 100;
  const gngComFactor = Math.min(100, commissionRate * 2.2); // Cap at 45% = 100pts
  const gngOmiFactor = Math.min(100, omissionRate * 5); // Cap at 20% = 100pts
  const stroopFactorWeight = Math.min(100, (stroopCost / 350) * 100); // Cap at 350ms = 100pts
  
  const totalRiskIndex = Math.round(
    asrsFactor * 0.40 + 
    gngComFactor * 0.25 + 
    gngOmiFactor * 0.15 + 
    stroopFactorWeight * 0.20
  );

  document.getElementById('lbl-risk-val').textContent = totalRiskIndex;
  
  const riskStatusLabel = document.getElementById('lbl-risk-status');
  const fillPath = document.getElementById('gauge-fill');
  
  // Set gauge color and label status
  if (totalRiskIndex >= 60) {
    riskStatusLabel.textContent = dict.results.high;
    riskStatusLabel.className = "status-badge bg-red";
    fillPath.className = "gauge-fill-magenta";
  } else if (totalRiskIndex >= 38) {
    riskStatusLabel.textContent = dict.results.borderline;
    riskStatusLabel.className = "status-badge bg-yellow";
    fillPath.className = "gauge-fill-yellow";
  } else {
    riskStatusLabel.textContent = dict.results.normal;
    riskStatusLabel.className = "status-badge bg-green";
    fillPath.className = "gauge-fill-cyan";
  }

  // Animate Gauge SVG Dashoffset
  // Total arc length of semi-circle: 251.2
  const offset = 251.2 - (totalRiskIndex / 100) * 251.2;
  setTimeout(() => {
    fillPath.style.strokeDashoffset = offset;
  }, 100);

  // 5. Generate Clinical Assessment Text
  generateClinicalReportText(totalRiskIndex, asrsTotal, rawInatt, rawHyper, omissionRate, commissionRate, stroopCost);

  // 6. Draw Chart.js Charts
  renderCharts(congruentRT, incongruentRT, inattIdx, hyperIdx, omissionRate, commissionRate, stroopCost);
}

function generateClinicalReportText(risk, asrs, inatt, hyper, omission, commission, stroop) {
  const box = document.getElementById('lbl-report-detail-text');
  
  let p1 = "", p2 = "", p3 = "";

  if (currentLang === 'en') {
    // English report
    if (risk >= 60) {
      p1 = `The comprehensive assessment indicates a <strong>high risk profile (${risk}/100)</strong> matching standard clinical ADHD parameters. Your self-report survey showed elevated levels of inattention (${inatt}/36) and impulsivity (${hyper}/36).`;
      p2 = `In the cognitive reaction tests, you had an omission rate of <strong>${omission.toFixed(1)}%</strong> (missed targets) and a commission rate of <strong>${commission.toFixed(1)}%</strong> (impulsive presses). This suggests significant challenges in response inhibition and sustained focus under monotony.`;
      p3 = `Your Stroop cognitive interference cost was <strong>${Math.round(stroop)}ms</strong>, showing delayed selective focus. We recommend cognitive drills, structured planners, and consulting a healthcare professional for a detailed consultation.`;
    } else if (risk >= 38) {
      p1 = `The assessment indicates a <strong>borderline profile (${risk}/100)</strong>. Your focus levels fluctuate, showing mild symptoms of inattention (${inatt}/36) or hyperactivity (${hyper}/36) during the survey.`;
      p2 = `Your Go/No-Go errors (Omissions: ${omission.toFixed(1)}%, Commissions: ${commission.toFixed(1)}%) suggest that while your overall control is good, fatigue or split attention can trigger impulsiveness.`;
      p3 = `The Stroop cost of <strong>${Math.round(stroop)}ms</strong> is normal but suggests slight executive overload. Implementing focus breaks and reducing digital distractions will highly benefit your daily productivity.`;
    } else {
      p1 = `The assessment indicates a <strong>clinically typical profile (${risk}/100)</strong>. Your self-report scores are well within the typical population average (Inattention: ${inatt}/36, Hyperactivity: ${hyper}/36).`;
      p2 = `In the Go/No-Go task, your omission rate (${omission.toFixed(1)}%) and commission rate (${commission.toFixed(1)}%) represent excellent attentional control and solid response inhibition.`;
      p3 = `Your Stroop interference cost (<strong>${Math.round(stroop)}ms</strong>) shows high cognitive flexibility, meaning your brain successfully suppresses conflicting visual stimuli rapidly.`;
    }
  } else if (currentLang === 'ja') {
    // Japanese report
    if (risk >= 60) {
      p1 = `総合検査の結果、<strong>高いADHD傾向 (${risk}/100)</strong> が確認されました。問診票では不注意 (${inatt}/36) および多動・衝動性 (${hyper}/36) の双方で基準値を超える高い自己評価が記録されています。`;
      p2 = `認知反応テストにおいて、ターゲットの無視（不注意）を示す漏れ率は <strong>${omission.toFixed(1)}%</strong>、フェイクへの誤反応を示す誤答率は <strong>${commission.toFixed(1)}%</strong> でした。持続的な集中維持と行動の自己抑制がやや不安定な傾向にあります。`;
      p3 = `ストループテストにおける色彩インジケータ干渉コストは <strong>${Math.round(stroop)}ms</strong> で、脳の選択集中にかかる遅延が観測されます。計画的なタイマー利用や専門家への相談を推奨します。`;
    } else if (risk >= 38) {
      p1 = `総合検査の結果、<strong>境界線の注意レベル (${risk}/100)</strong> です。問診票での不注意傾向 (${inatt}/36) または衝動性 (${hyper}/36) の自己診断は軽微な状態を示しています。`;
      p2 = `Go/No-Go 漏れ率 (${omission.toFixed(1)}%) および誤反応率 (${commission.toFixed(1)}%) から、疲労が蓄積した際に選択的な注意散漫や衝動的な操作が生じやすい状態であることが推測されます。`;
      p3 = `インジケータ干渉遅延は <strong>${Math.round(stroop)}ms</strong> と良好ですが、マルチタスクを減らし、シングルタスクに整理することで日々の認知制御を安定させることができます。`;
    } else {
      p1 = `総合検査の結果、<strong>臨床的正常の範囲内 (${risk}/100)</strong> です。問診スコア（不注意: ${inatt}/36, 衝動性: ${hyper}/36）は典型的な平均値内に収まっています。`;
      p2 = `Go/No-Go持続テストでのエラー率は非常に低く（漏れ: ${omission.toFixed(1)}%, 誤反応: ${commission.toFixed(1)}%）、注意集中と前頭葉の抑制機構が良好に噛み合っています。`;
      p3 = `インジケータ干渉コスト（<strong>${Math.round(stroop)}ms</strong>）も極めて優秀で、認知的柔軟性と不要な情報の選別処理が円滑に行われています。`;
    }
  } else {
    // Korean report
    if (risk >= 60) {
      p1 = `종합 검진 결과, <strong>임상학적 고위험 ADHD 성향군 (${risk}/100)</strong>의 인지 조절 프로필을 나타냅니다. ASRS 설문에서는 부주의 (${inatt}/36) 및 과잉행동/충동성 (${hyper}/36) 도메인 모두에서 고위험 컷오프를 웃도는 임상 지표가 확인되었습니다.`;
      p2 = `Go/No-Go 인지 작업 검사에서 타겟 주의 억제 누락율은 <strong>${omission.toFixed(1)}%</strong>, 방해 자극에 대한 충동 오반응율은 <strong>${commission.toFixed(1)}%</strong>으로 산출되었습니다. 이는 단조로운 환경에서 지속적인 주의 각성을 유지하기 어렵고 자동화된 반사 행동을 스스로 제어하는 통제력이 약화되어 있음을 시사합니다.`;
      p3 = `스트룹 단어 색상 인지 간섭 반응차는 <strong>${Math.round(stroop)}ms</strong>로 전두엽 억제 제어에 다소 과중한 인지 비용이 요구되고 있습니다. 뽀모도로 타이머, 업무/학업의 시각적 카테고리화, 전문가 상담을 통한 정밀 검사를 권장합니다.`;
    } else if (risk >= 38) {
      p1 = `종합 검진 결과, <strong>경계선 상의 주의 요망군 (${risk}/100)</strong> 상태입니다. 자가 보고 설문에서 부주의 지수 (${inatt}/36) 또는 과잉행동 지수 (${hyper}/36) 가 경계 수준에 도달하여 평소 분산 집중 상황에서 부분적인 제어의 어려움을 느끼고 있을 수 있습니다.`;
      p2 = `Go/No-Go 검사에서의 오류 수치(누락율: ${omission.toFixed(1)}%, 오반응율: ${commission.toFixed(1)}%)로 볼 때, 전반적인 자기 통제력은 양호하나 피로감이 누적되거나 자극적인 외부 간섭이 있을 경우 일시적 인지 부주의가 발동할 위험이 큽니다.`;
      p3 = `스트룹 간섭 비용은 <strong>${Math.round(stroop)}ms</strong>로 평균 수준입니다. 일상 속 멀티태스킹 습관을 지양하고 화면 차단, 디지털 기기 오프라인 전환 등의 집중 환경 정돈을 실행하는 것이 매우 효과적입니다.`;
    } else {
      p1 = `종합 검진 결과, <strong>임상학적 정상 대조군 (${risk}/100)</strong>의 프로필을 나타냅니다. ASRS 자가보고 항목(부주의: ${inatt}/36, 충동성: ${hyper}/36) 전반에서 임상적인 컷오프 한계치 미만의 안정적인 성향 점수를 보여줍니다.`;
      p2 = `Go/No-Go 주의 지속 훈련 검사에서 매우 양호한 누락율 (${omission.toFixed(1)}%)과 억제 오반응율 (${commission.toFixed(1)}%)을 보여, 목표물 포착 속도와 행동 개시/제어 조절 사이의 결합 밸런스가 뛰어납니다.`;
      p3 = `스트룹 선택 인지 지연 역시 <strong>${Math.round(stroop)}ms</strong>로 최상급에 속하여, 문자 폰트 색과 철자 뜻이 상충하는 고난도 인지 간섭 상황에서도 뇌신경이 불필요한 시각 방해 유입을 원천 차단하고 순발력 있게 목표에만 선택적으로 조율하고 있음을 뜻합니다.`;
    }
  }

  box.innerHTML = `<p>${p1}</p><p>${p2}</p><p>${p3}</p>`;
}

// 7. Render Charts
function renderCharts(congruentRT = 450, incongruentRT = 580, inattIdx = [], hyperIdx = [], omission = 5, commission = 20, stroop = 125) {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  
  // Theme Color Configurations
  const textClr = isLight ? '#475569' : '#94a3b8';
  const gridClr = isLight ? '#cbd5e1' : '#334155';
  
  // Destroy old charts if exist
  if (cognitiveRadarChart) cognitiveRadarChart.destroy();
  if (stroopSpeedBarChart) stroopSpeedBarChart.destroy();

  // 1. Radar Chart: 4대 영역 백분위수
  // Calculate relative percentiles (higher = better focus/control)
  // ASRS inverse, Omission inverse, Commission inverse, Stroop cost inverse
  let rawInattSum = 0;
  let rawHyperSum = 0;
  if (inattIdx.length > 0) {
    const inattQuestionsIdx = [0, 1, 2, 3, 6, 7, 8, 9, 10];
    const hyperQuestionsIdx = [4, 5, 11, 12, 13, 14, 15, 16, 17];
    inattQuestionsIdx.forEach(idx => rawInattSum += asrsAnswers[idx]);
    hyperQuestionsIdx.forEach(idx => rawHyperSum += asrsAnswers[idx]);
  } else {
    rawInattSum = 12;
    rawHyperSum = 12;
  }

  const asrsPercentile = Math.max(10, 100 - (rawInattSum + rawHyperSum) * 1.3);
  const attentionPercentile = Math.max(10, 100 - omission * 4.5);
  const inhibitionPercentile = Math.max(10, 100 - commission * 2.2);
  const flexibilityPercentile = Math.max(10, 100 - (stroop / 3.5));

  const radarLabels = currentLang === 'ko' ? 
    ["자가 주의집중 인지", "지속 주의력 (누락률 역산)", "행동 억제력 (오반응 역산)", "인지 유연성 (스트룹 간섭)"] : 
    (currentLang === 'ja' ? 
      ["自己注意認知", "持続的注意力（漏れ率逆算）", "行動抑制力（誤答率逆算）", "認知的柔軟性（ストループ制御）"] : 
      ["Self Attention Focus", "Sustained Focus (Omission Inverse)", "Response Inhibition", "Cognitive Flexibility"]);

  const ctxRadar = document.getElementById('chart-cognitive-profile').getContext('2d');
  cognitiveRadarChart = new Chart(ctxRadar, {
    type: 'radar',
    data: {
      labels: radarLabels,
      datasets: [{
        label: currentLang === 'ko' ? '인지 점수 백분위' : (currentLang === 'ja' ? '認知スコアパーセンタイル' : 'Cognitive Percentile'),
        data: [asrsPercentile, attentionPercentile, inhibitionPercentile, flexibilityPercentile],
        backgroundColor: 'rgba(0, 242, 254, 0.2)',
        borderColor: '#00f2fe',
        borderWidth: 2,
        pointBackgroundColor: '#9d4edd',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#00f2fe'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          grid: { color: gridClr },
          angleLines: { color: gridClr },
          pointLabels: {
            color: textClr,
            font: { family: 'Outfit, Noto Sans KR', size: 11, weight: '600' }
          },
          ticks: {
            display: false,
            stepSize: 20
          },
          min: 0,
          max: 100
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });

  // 2. Bar Chart: Stroop Speed
  const barLabels = currentLang === 'ko' ? 
    ["일치 조건 (의미 일치)", "불일치 조건 (인지 방해)"] : 
    (currentLang === 'ja' ? 
      ["一致条件 (意味一致)", "不一致条件 (色彩干渉)"] : 
      ["Congruent Trial", "Incongruent Trial"]);

  const ctxBar = document.getElementById('chart-stroop-reaction').getContext('2d');
  
  // Fill fallbacks if RTs are 0
  const cRT = congruentRT > 0 ? Math.round(congruentRT) : 480;
  const icRT = incongruentRT > 0 ? Math.round(incongruentRT) : 605;

  stroopSpeedBarChart = new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: barLabels,
      datasets: [{
        label: currentLang === 'ko' ? '평균 응답속도 (ms)' : (currentLang === 'ja' ? '平均反応速度 (ms)' : 'Average Response Time (ms)'),
        data: [cRT, icRT],
        backgroundColor: ['rgba(6, 214, 160, 0.35)', 'rgba(255, 0, 127, 0.35)'],
        borderColor: ['#06d6a0', '#ff007f'],
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textClr, font: { family: 'Outfit, Noto Sans KR' } }
        },
        y: {
          grid: { color: gridClr },
          ticks: { color: textClr, font: { family: 'Outfit, Noto Sans KR' } }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}
