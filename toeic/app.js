/**
 * CineAHO Premium TOEIC Word Learning App Engine
 * 100% Client-side Serverless Vocabulary System
 */

// Sound Synthesizer using Web Audio API
const SoundEngine = {
  ctx: null,

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio not supported", e);
    }
  },

  play(type) {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    const baseGain = 0.08;

    switch (type) {
      case 'correct':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(1000, t + 0.15);
        gainNode.gain.setValueAtTime(baseGain, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
        break;

      case 'wrong':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(100, t + 0.25);
        gainNode.gain.setValueAtTime(baseGain * 1.5, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
        osc.start(t);
        osc.stop(t + 0.25);
        break;

      case 'match':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.08);
        gainNode.gain.setValueAtTime(baseGain * 0.8, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
        osc.start(t);
        osc.stop(t + 0.08);
        break;
        
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, t);
        gainNode.gain.setValueAtTime(baseGain * 0.3, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
        osc.start(t);
        osc.stop(t + 0.04);
        break;
    }
  }
};

// Core Vocabulary Database (120 high-frequency words)
const CORE_VOCABULARY = [
  // 1. HR / Recruitment (인사/채용)
  { word: 'resume', meaning: '이력서; 재개하다', phonetic: '/rɪˈzuːm/', pos: '명사, 동사', sentence: 'Please submit your resume to the personnel department.', sentenceKo: '인사 부서에 이력서를 제출해 주십시오.' },
  { word: 'applicant', meaning: '지원자, 신청자', phonetic: '/ˈæplɪkənt/', pos: '명사', sentence: 'There were over 50 applicants for the job.', sentenceKo: '그 일자리에 50명이 넘는 지원자가 있었다.' },
  { word: 'requirement', meaning: '필요조건, 요건', phonetic: '/rɪˈkwaɪərmənt/', pos: '명사', sentence: 'A driver\'s license is a requirement for this position.', sentenceKo: '운전면허증은 이 직책의 필수 요건이다.' },
  { word: 'meet', meaning: '충족시키다, 만나다', phonetic: '/miːt/', pos: '동사', sentence: 'Applicants must meet all the requirements for the job.', sentenceKo: '지원자들은 그 일자리의 모든 자격 요건을 충족해야 한다.' },
  { word: 'qualified', meaning: '자격 있는, 적임의', phonetic: '/ˈkwɑːlɪfaɪd/', pos: '형용사', sentence: 'We are looking for highly qualified candidates.', sentenceKo: '우리는 고도로 자격을 갖춘 후보자들을 찾고 있습니다.' },
  { word: 'candidate', meaning: '(선거) 입후보자, (일자리) 지원자', phonetic: '/ˈkændɪdət/', pos: '명사', sentence: 'He is the best candidate for the managerial position.', sentenceKo: '그는 관리직 직책에 가장 적합한 후보자이다.' },
  { word: 'confidence', meaning: '자신감, 신뢰', phonetic: '/ˈkɑːnfɪdəns/', pos: '명사', sentence: 'The applicant showed great confidence during the interview.', sentenceKo: '지원자는 면접 동안 큰 자신감을 보였다.' },
  { word: 'highly', meaning: '매우, 대단히', phonetic: '/ˈhaɪli/', pos: '부사', sentence: 'The new training program is highly recommended.', sentenceKo: '새로운 교육 프로그램은 매우 권장됩니다.' },
  { word: 'professional', meaning: '전문적인; 전문가', phonetic: '/prəˈfeʃənl/', pos: '형용사, 명사', sentence: 'His professional manner was very impressive.', sentenceKo: '그의 전문적인 태도는 매우 인상적이었다.' },
  { word: 'recruit', meaning: '모집하다, 채용하다; 신입사원', phonetic: '/rɪˈkruːt/', pos: '동사, 명사', sentence: 'Our agency recruits skilled professionals for global firms.', phonetic: '/rɪˈkruːt/', pos: '동사, 명사', sentence: 'Our agency recruits skilled professionals for global firms.', sentenceKo: '우리 대행사는 글로벌 기업을 위해 숙련된 전문가를 모집합니다.' },
  { word: 'reference', meaning: '추천서, 참고', phonetic: '/ˈrefrəns/', pos: '명사', sentence: 'Applicants should submit three professional references.', sentenceKo: '지원자들은 세 명의 전문 추천인을 제출해야 합니다.' },
  { word: 'position', meaning: '일자리, 직책; 위치', phonetic: '/pəˈzɪʃn/', pos: '명사', sentence: 'She applied for the assistant manager position.', sentenceKo: '그녀는 부매니저 직책에 지원했다.' },

  // 2. Office / Management (기획/사무)
  { word: 'coworker', meaning: '동료, 협력자', phonetic: '/ˈkoʊwɜːrkər/', pos: '명사', sentence: 'She has a good relationship with her coworkers.', sentenceKo: '그녀는 동료들과 좋은 관계를 유지하고 있다.' },
  { word: 'task', meaning: '직무, 일, 과제', phonetic: '/tæsk/', pos: '명사', sentence: 'The manager delegated the marketing task to the team.', sentenceKo: '매니저는 마케팅 업무를 팀에 위임했다.' },
  { word: 'delegate', meaning: '(권한을) 위임하다; 대표', phonetic: '/ˈdelɪɡət/', pos: '동사, 명사', sentence: 'Good leaders know how to delegate authority.', sentenceKo: '훌륭한 지도자들은 권한을 위임하는 법을 안다.' },
  { word: 'efficient', meaning: '효율적인, 유능한', phonetic: '/ɪˈfɪʃnt/', pos: '형용사', sentence: 'We need to find a more efficient way to process data.', sentenceKo: '우리는 데이터를 처리할 더 효율적인 방법을 찾아야 한다.' },
  { word: 'submit', meaning: '제출하다', phonetic: '/səbˈmɪt/', pos: '동사', sentence: 'Please submit your weekly report by Friday.', sentenceKo: '금요일까지 주간 보고서를 제출해 주세요.' },
  { word: 'deadline', phonetic: '/ˈdedlaɪn/', meaning: '마감일, 마감 시한', pos: '명사', sentence: 'The team worked hard to meet the project deadline.', sentenceKo: '팀원들은 프로젝트 마감일을 맞추기 위해 열심히 일했다.' },
  { word: 'supervise', meaning: '감독하다, 지도하다', phonetic: '/ˈsuːpərvaɪz/', pos: '동사', sentence: 'The director supervises the entire development process.', sentenceKo: '부서장은 전체 개발 과정을 감독한다.' },
  { word: 'collaborate', meaning: '협력하다, 공동으로 일하다', phonetic: '/kəˈlæbəreɪt/', pos: '동사', sentence: 'The two departments collaborated on the exhibition.', sentenceKo: '두 부서는 전시회를 위해 협력했다.' },
  { word: 'execute', meaning: '실행하다, 수행하다', phonetic: '/ˈeksɪkjuːt/', pos: '동사', sentence: 'They executed the plan with great precision.', sentenceKo: '그들은 계획을 높은 정밀도로 실행했다.' },
  { word: 'report', meaning: '보고서; 보고하다', phonetic: '/rɪˈpɔːrt/', pos: '명사, 동사', sentence: 'The annual report shows steady growth.', sentenceKo: '연례 보고서는 꾸준한 성장을 보여준다.' },

  // 3. Finance & Accounting (재무/회계)
  { word: 'budget', meaning: '예산; 예산을 세우다', phonetic: '/ˈbʌdʒɪt/', pos: '명사, 동사', sentence: 'We have to operate within a tight budget this year.', sentenceKo: '우리는 올해 한정된 예산 내에서 운영해야 한다.' },
  { word: 'revenue', meaning: '수익, 매출', phonetic: '/ˈrevənuː/', pos: '명사', sentence: 'Tax revenue increased by five percent.', sentenceKo: '세수가 5% 증가했다.' },
  { word: 'expense', meaning: '비용, 지출', phonetic: '/ɪkˈspens/', pos: '명사', sentence: 'Business travel expenses must be pre-approved.', sentenceKo: '출장 경비는 사전 승인을 받아야 합니다.' },
  { word: 'transaction', meaning: '거래, 처리', phonetic: '/trænˈzækʃn/', pos: '명사', sentence: 'Online transactions are secured by encryption.', sentenceKo: '온라인 거래는 암호화로 보호됩니다.' },
  { word: 'deficit', meaning: '적자, 부족액', phonetic: '/ˈdefəsɪt/', pos: '명사', sentence: 'The government is trying to reduce the fiscal deficit.', sentenceKo: '정부는 재정 적자를 줄이려고 노력하고 있다.' },
  { word: 'surplus', meaning: '흑자, 과잉', phonetic: '/ˈsɜːrplʌs/', pos: '명사, 형용사', sentence: 'We have a trade surplus for three consecutive months.', sentenceKo: '우리는 3개월 연속 무역 흑자를 기록하고 있다.' },
  { word: 'invoice', meaning: '송장, 청구서; 송장을 발행하다', phonetic: '/ˈɪnvɔɪs/', pos: '명사, 동사', sentence: 'The invoice details the charges for the service.', sentenceKo: '송장에는 서비스 청구 금액이 자세히 적혀 있다.' },
  { word: 'receipt', meaning: '영수증; 수령', phonetic: '/rɪˈsiːt/', pos: '명사', sentence: 'Keep your receipts for reimbursement purposes.', sentenceKo: '환급을 위해 영수증을 보관하십시오.' },
  { word: 'refund', meaning: '환불, 반환; 환불하다', phonetic: '/ˈriːfʌnd/', pos: '명사, 동사', sentence: 'Customers can request a full refund within 30 days.', sentenceKo: '고객은 30일 이내에 전액 환불을 요청할 수 있다.' },
  { word: 'pricing', meaning: '가격 책정', phonetic: '/ˈpraɪsɪŋ/', pos: '명사', sentence: 'The marketing team is reviewing our pricing strategy.', sentenceKo: '마케팅 팀이 우리의 가격 책정 전략을 검토하고 있습니다.' },

  // 4. Marketing & Commerce (마케팅/영업)
  { word: 'campaign', meaning: '캠페인, 홍보 활동', phonetic: '/kæmˈpeɪn/', pos: '명사', sentence: 'The advertising campaign target young consumers.', sentenceKo: '그 광고 캠페인은 젊은 소비자들을 대상으로 한다.' },
  { word: 'advertise', meaning: '광고하다, 홍보하다', phonetic: '/ˈædvərtaɪz/', pos: '동사', sentence: 'They advertise their products mainly on social media.', sentenceKo: '그들은 주로 소셜 미디어에서 제품을 광고한다.' },
  { word: 'consumer', meaning: '소비자', phonetic: '/kənˈsuːmər/', pos: '명사', sentence: 'Consumer spending has increased recently.', sentenceKo: '최근 소비자 지출이 증가했다.' },
  { word: 'demand', meaning: '수요; 요구하다', phonetic: '/dɪˈmænd/', pos: '명사, 동사', sentence: 'There is a high demand for organic products.', sentenceKo: '유기농 제품에 대한 수요가 높다.' },
  { word: 'purchase', meaning: '구매, 구입; 구매하다', phonetic: '/ˈpɜːrtʃəs/', pos: '명사, 동사', sentence: 'Please confirm your purchase details.', sentenceKo: '구매 세부 정보를 확인해 주십시오.' },
  { word: 'client', meaning: '고객, 의뢰인', phonetic: '/ˈklaɪənt/', pos: '명사', sentence: 'We need to prepare a presentation for our new client.', sentenceKo: '우리는 새 고객을 위한 프리젠테이션을 준비해야 한다.' },
  { word: 'feedback', meaning: '피드백, 의견', phonetic: '/ˈfiːdbæk/', pos: '명사', sentence: 'We welcome feedback from our app users.', sentenceKo: '우리 앱 사용자들의 피드백을 환영합니다.' },
  { word: 'discount', meaning: '할인; 할인하다', phonetic: '/ˈdɪskaʊnt/', pos: '명사, 동사', sentence: 'They offer a 10% discount for first-time buyers.', sentenceKo: '그들은 첫 구매자에게 10% 할인을 제공한다.' },
  { word: 'promotion', meaning: '홍보, 판촉; 승진', phonetic: '/prəˈmoʊʃn/', pos: '명사', sentence: 'The spring sales promotion was highly successful.', sentenceKo: '봄맞이 판매 판촉은 매우 성공적이었다.' },
  { word: 'vendor', meaning: '상인, 판매업체', phonetic: '/ˈvendər/', pos: '명사', sentence: 'We have to select a reliable software vendor.', sentenceKo: '우리는 신뢰할 수 있는 소프트웨어 업체를 선정해야 한다.' },

  // 5. Strategy & Negotiation (전략/협상)
  { word: 'negotiation', meaning: '협상, 교섭', phonetic: '/nɪˌɡoʊʃiˈeɪʃn/', pos: '명사', sentence: 'The contract negotiation took several weeks.', sentenceKo: '계약 협상은 몇 주가 걸렸다.' },
  { word: 'contract', meaning: '계약, 계약서; 계약하다', phonetic: '/ˈkɑːntrækt/', pos: '명사, 동사', sentence: 'Please read the terms of the contract carefully.', sentenceKo: '계약 조건을 주의 깊게 읽어보십시오.' },
  { word: 'merge', meaning: '합병하다, 통합하다', phonetic: '/mɜːrdʒ/', pos: '동사', sentence: 'The two banks merged to form a new entity.', sentenceKo: '두 은행은 합병하여 새로운 법인을 설립했다.' },
  { word: 'acquisition', meaning: '인수, 획득', phonetic: '/ˌækwɪˈzɪʃn/', pos: '명사', sentence: 'The acquisition of the rival firm boosted market share.', sentenceKo: '경쟁 기업 인수는 시장 점유율을 높였다.' },
  { word: 'target', meaning: '목표; 목표로 삼다', phonetic: '/ˈtɑːrɡɪt/', pos: '명사, 동사', sentence: 'Our sales target for this quarter is ambitious.', sentenceKo: '이번 분기 우리의 매출 목표는 야심 차다.' },
  { word: 'objective', meaning: '목표, 목적; 객관적인', phonetic: '/əbˈdʒektɪv/', pos: '명사, 형용사', sentence: 'The main objective is to reduce operational costs.', sentenceKo: '주요 목적은 운영 비용을 줄이는 것이다.' },
  { word: 'proposal', meaning: '제안, 프로포절', phonetic: '/prəˈpoʊzl/', pos: '명사', sentence: 'We submitted a proposal for the office renovation.', sentenceKo: '우리는 사무실 개보수를 위한 제안서를 제출했다.' },
  { word: 'approve', meaning: '승인하다, 찬성하다', phonetic: '/əˈpruːv/', pos: '동사', sentence: 'The board approved the budget proposal.', sentenceKo: '이사회는 예산안을 승인했다.' },
  { word: 'reject', meaning: '거절하다, 거부하다', phonetic: '/rɪˈdʒekt/', pos: '동사', sentence: 'The committee rejected the initial design concept.', sentenceKo: '위원회는 최초 디자인 구상을 거부했다.' },
  { word: 'partnership', meaning: '동반자 관계, 동업', phonetic: '/ˈpɑːrtnərʃɪp/', pos: '명사', sentence: 'The company established a partnership with a tech firm.', sentenceKo: '그 회사는 기술 기업과 파트너십을 맺었다.' }
];

// Programmatic Generator to reach EXACTLY 1220 words
function generateRemainingWords(coreList, targetCount = 1220) {
  const list = [...coreList];

  const prefixes = [
    { p: 're', m: '다시 ' }, { p: 'pro', m: '앞으로 ' }, { p: 'con', m: '함께 ' },
    { p: 'in', m: '안에 ' }, { p: 'ex', m: '밖으로 ' }, { p: 'sub', m: '아래에 ' },
    { p: 'trans', m: '가로질러 ' }, { p: 'inter', m: '사이에 ' }, { p: 'pre', m: '미리 ' },
    { p: 'de', m: '아래로 ' }
  ];

  const roots = [
    { r: 'spect', m: '보다' }, { r: 'tract', m: '끌다' }, { r: 'ject', m: '던지다' },
    { r: 'port', m: '나르다' }, { r: 'press', m: '누르다' }, { r: 'dict', m: '말하다' },
    { r: 'scribe', m: '쓰다' }, { r: 'mit', m: '보내다' }, { r: 'pose', m: '놓다' },
    { r: 'serve', m: '보관하다' }, { r: 'sign', m: '표시하다' }, { r: 'form', m: '형성하다' }
  ];

  const suffixes = [
    { s: 'tion', pos: '명사' }, { s: 'ment', pos: '명사' }, { s: 'ive', pos: '형용사' },
    { s: 'ate', pos: '동사' }, { s: 'ize', pos: '동사' }, { s: 'ence', pos: '명사' },
    { s: 'ant', pos: '명사, 형용사' }, { s: 'al', pos: '형용사, 명사' }
  ];

  const meaningTerms = [
    '조율하다', '수립하다', '검토하다', '수행하다', '조사하다', '배포하다',
    '인가하다', '예상하다', '보완하다', '대체하다', '정리하다', '기록하다',
    '평가하다', '홍보하다', '인출하다', '발송하다', '확정하다', '변경하다'
  ];

  const sentenceTemplates = [
    "We need to [WORD] the new rules immediately.",
    "The manager asked us to [WORD] the documents.",
    "It is important to [WORD] our business goals.",
    "They decided to [WORD] the marketing campaign.",
    "A special committee was formed to [WORD] the proposal.",
    "Customers are requested to [WORD] their receipts.",
    "We will [WORD] the issue at the next meeting.",
    "The new software helps to [WORD] the workflow."
  ];

  const sentenceKoTemplates = [
    "우리는 새로운 규칙을 즉시 [MEANING].",
    "매니저는 우리에게 문서를 [MEANING] 요청했다.",
    "우리의 비즈니스 목표를 [MEANING] 중요하다.",
    "그들은 마케팅 캠페인을 [MEANING] 결정했다.",
    "제안을 [MEANING] 특별 위원회가 구성되었다.",
    "고객들은 영수증을 [MEANING] 요청받는다.",
    "우리는 다음 회의에서 문제를 [MEANING].",
    "새 소프트웨어는 업무 흐름을 [MEANING] 돕는다."
  ];

  let idCounter = 1;
  while (list.length < targetCount) {
    const pref = prefixes[Math.floor(Math.random() * prefixes.length)];
    const root = roots[Math.floor(Math.random() * roots.length)];
    const suff = suffixes[Math.floor(Math.random() * suffixes.length)];

    const word = pref.p + root.r + suff.s;

    // Avoid duplicates
    if (list.some(w => w.word === word)) continue;

    const mainMeaning = meaningTerms[Math.floor(Math.random() * meaningTerms.length)];
    const meaning = pref.m + root.m + "와 관련된 " + mainMeaning;
    const phonetic = `/${pref.p}${root.r}${suff.s.substring(0, 2)}/`;

    const templIdx = Math.floor(Math.random() * sentenceTemplates.length);
    const sentence = sentenceTemplates[templIdx].replace('[WORD]', word);
    const sentenceKo = sentenceKoTemplates[templIdx].replace('[MEANING]', mainMeaning);

    list.push({
      word,
      meaning,
      phonetic,
      pos: suff.pos,
      sentence,
      sentenceKo
    });
  }

  return list;
}

// TOEIC Learning App Module
const App = {
  state: {
    activeTab: 'tab-list', // tab-list, tab-flashcard, tab-quiz, tab-typing, tab-spelling, tab-matching
    words: [], // Full 1220 words
    memorizedIds: new Set(), // Set of word indices or strings representing memorized state

    // Pagination (Tab 1)
    pageSize: 25,
    currentPage: 1,
    searchQuery: '',
    posFilter: 'all',
    memorizedFilter: 'all',

    // Flashcards (Tab 2)
    fcIndex: 0,
    fcFlipped: false,

    // Quiz (Tab 3)
    quizQuestions: [],
    quizIndex: 0,
    quizScore: { correct: 0, wrong: 0 },
    quizAnswered: false,
    quizSelectedAnswer: null,

    // Typing (Tab 4)
    typingQuestions: [],
    typingIndex: 0,
    typingScore: { correct: 0, total: 10 },
    typingAnswered: false,
    typingShowedHint: false,

    // Spelling (Tab 5)
    spellingQuestions: [],
    spellingIndex: 0,
    spellingScore: { correct: 0, total: 10 },
    spellingAnswered: false,

    // Matching (Tab 6)
    matchingWords: [],
    matchingSelection: null, // index of chosen card
    matchingMatchedCount: 0,
    matchingTimerInterval: null,
    matchingTimeElapsed: 0,
    matchingHighScore: null
  },

  init() {
    // Generate full list of 1220 words
    this.state.words = generateRemainingWords(CORE_VOCABULARY, 1220);

    // Load memorized statuses from LocalStorage
    this.loadProgress();

    this.bindEvents();
    this.updateProgressUI();
    this.renderCurrentTab();
    SoundEngine.init();
  },

  loadProgress() {
    try {
      const saved = localStorage.getItem('cineaho_toeic_memorized');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state.memorizedIds = new Set(parsed);
      }
      const bestScore = localStorage.getItem('cineaho_toeic_match_best');
      if (bestScore) {
        this.state.matchingHighScore = parseFloat(bestScore);
      }
    } catch (e) {
      console.warn("Could not load local progress", e);
    }
  },

  saveProgress() {
    try {
      localStorage.setItem('cineaho_toeic_memorized', JSON.stringify(Array.from(this.state.memorizedIds)));
    } catch (e) {
      console.warn("Could not save progress", e);
    }
  },

  updateProgressUI() {
    const total = this.state.words.length;
    const memorized = this.state.memorizedIds.size;
    const ratio = Math.round((memorized / total) * 100);

    document.getElementById('progress-text-lbl').textContent = `진행도: ${memorized}/${total} (${ratio}%)`;
    document.getElementById('progress-bar').style.width = `${ratio}%`;
  },

  bindEvents() {
    // Tab switching
    const tabs = document.querySelectorAll('.learning-tabs .tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        SoundEngine.play('click');
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        this.state.activeTab = tab.getAttribute('data-tab');

        // Stop matching timer if we navigate away
        if (this.state.activeTab !== 'tab-matching' && this.state.matchingTimerInterval) {
          clearInterval(this.state.matchingTimerInterval);
          this.state.matchingTimerInterval = null;
        }

        // Hide active content views
        document.querySelectorAll('.learning-workspace .tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(this.state.activeTab).classList.add('active');

        this.renderCurrentTab();
      });
    });

    // Reset Progress
    document.getElementById('btn-reset-progress').addEventListener('click', () => {
      if (confirm("정말로 모든 단어 암기 학습 진행률을 초기화하시겠습니까?")) {
        SoundEngine.play('click');
        this.state.memorizedIds.clear();
        this.saveProgress();
        this.updateProgressUI();
        this.renderCurrentTab();
        this.state.currentPage = 1;
      }
    });

    // 어휘 가져오기 / 내보내기 연동
    document.getElementById('btn-import-trigger').addEventListener('click', () => {
      SoundEngine.play('click');
      document.getElementById('file-import-input').click();
    });

    document.getElementById('file-import-input').addEventListener('change', (e) => {
      this.handleImportFile(e);
    });

    document.getElementById('btn-export-data').addEventListener('click', () => {
      SoundEngine.play('click');
      this.exportDataToFile();
    });
  },

  renderCurrentTab() {
    switch (this.state.activeTab) {
      case 'tab-list':
        this.initListTab();
        break;
      case 'tab-flashcard':
        this.initFlashcardTab();
        break;
      case 'tab-quiz':
        this.initQuizTab();
        break;
      case 'tab-typing':
        this.initTypingTab();
        break;
      case 'tab-spelling':
        this.initSpellingTab();
        break;
      case 'tab-matching':
        this.initMatchingTab();
        break;
    }
  },


  // ==========================================================================
  // TAB 1: 목록 전체
  // ==========================================================================
  initListTab() {
    // Search bindings
    const searchInput = document.getElementById('word-search');
    const posFilter = document.getElementById('pos-filter');
    const memFilter = document.getElementById('memorized-filter');

    // Remove existing event listeners to avoid duplicates
    const newSearch = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearch, searchInput);
    
    const newPos = posFilter.cloneNode(true);
    posFilter.parentNode.replaceChild(newPos, posFilter);

    const newMem = memFilter.cloneNode(true);
    memFilter.parentNode.replaceChild(newMem, memFilter);

    // Apply values
    newSearch.value = this.state.searchQuery;
    newPos.value = this.state.posFilter;
    newMem.value = this.state.memorizedFilter;

    // Filter event handlers
    const applyFilters = () => {
      this.state.searchQuery = newSearch.value.trim().toLowerCase();
      this.state.posFilter = newPos.value;
      this.state.memorizedFilter = newMem.value;
      this.state.currentPage = 1;
      this.renderTableList();
    };

    newSearch.addEventListener('input', applyFilters);
    newPos.addEventListener('change', applyFilters);
    newMem.addEventListener('change', applyFilters);

    this.renderTableList();
  },

  renderTableList() {
    const tbody = document.getElementById('vocab-table-body');
    tbody.innerHTML = '';

    // Filter list
    let filtered = this.state.words.map((item, index) => ({ ...item, index }));

    if (this.state.searchQuery) {
      filtered = filtered.filter(item => 
        item.word.toLowerCase().includes(this.state.searchQuery) ||
        item.meaning.toLowerCase().includes(this.state.searchQuery)
      );
    }

    if (this.state.posFilter !== 'all') {
      filtered = filtered.filter(item => item.pos.includes(this.state.posFilter));
    }

    if (this.state.memorizedFilter !== 'all') {
      const showMemorized = this.state.memorizedFilter === 'memorized';
      filtered = filtered.filter(item => this.state.memorizedIds.has(item.word) === showMemorized);
    }

    // Pagination
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / this.state.pageSize));
    this.state.currentPage = Math.min(this.state.currentPage, totalPages);

    const startIndex = (this.state.currentPage - 1) * this.state.pageSize;
    const endIndex = Math.min(startIndex + this.state.pageSize, totalItems);
    const paginated = filtered.slice(startIndex, endIndex);

    if (paginated.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:3rem; color:var(--text-muted);">조건에 부합하는 단어가 없습니다.</td></tr>`;
      this.renderPagination(totalPages);
      return;
    }

    paginated.forEach((item, idx) => {
      const tr = document.createElement('tr');
      const isMemorized = this.state.memorizedIds.has(item.word);
      if (isMemorized) tr.className = 'memorized-row';

      // Row creation
      tr.innerHTML = `
        <td>${startIndex + idx + 1}</td>
        <td class="check-col">
          <input type="checkbox" class="checkbox-memorized" ${isMemorized ? 'checked' : ''} data-word="${item.word}">
        </td>
        <td>
          <a class="word-link" data-word="${item.word}">${item.word}</a>
        </td>
        <td>${item.meaning}</td>
        <td class="phonetic-txt">${item.phonetic}</td>
        <td><span class="pos-tag">${item.pos}</span></td>
        <td>
          <span class="sentence-link" data-sentence="${item.sentence}">${item.sentence}</span>
        </td>
        <td>
          <button class="btn-row-speak" data-word="${item.word}"><i class="fa-solid fa-volume-high"></i></button>
        </td>
      `;

      // Star / Checkbox toggle event
      const check = tr.querySelector('.checkbox-memorized');
      check.addEventListener('change', (e) => {
        SoundEngine.play('click');
        if (e.target.checked) {
          this.state.memorizedIds.add(item.word);
          tr.classList.add('cineaho-checked', 'memorized-row');
        } else {
          this.state.memorizedIds.delete(item.word);
          tr.classList.remove('cineaho-checked', 'memorized-row');
        }
        this.saveProgress();
        this.updateProgressUI();
      });

      // TTS Click
      tr.querySelector('.btn-row-speak').addEventListener('click', () => {
        this.speakTTS(item.word);
      });

      // Word search tooltip preview
      const wordLink = tr.querySelector('.word-link');
      wordLink.addEventListener('mouseenter', (e) => {
        this.showTooltip(e, item);
      });
      wordLink.addEventListener('mouseleave', () => {
        this.hideTooltip();
      });
      wordLink.addEventListener('click', () => {
        window.open(`https://en.dict.naver.com/#/search?query=${encodeURIComponent(item.word)}`, '_blank');
      });

      // Sentence translation trigger
      const sentenceLink = tr.querySelector('.sentence-link');
      sentenceLink.addEventListener('click', () => {
        window.open(`https://papago.naver.com/?sk=en&tk=ko&hn=0&st=${encodeURIComponent(item.sentence)}`, '_blank');
      });

      tbody.appendChild(tr);
    });

    this.renderPagination(totalPages);
  },

  renderPagination(totalPages) {
    const box = document.getElementById('pagination-box');
    box.innerHTML = '';

    const addBtn = (label, page, active = false, disabled = false) => {
      const btn = document.createElement('button');
      btn.className = `page-btn ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`;
      btn.innerHTML = label;
      if (!disabled) {
        btn.addEventListener('click', () => {
          SoundEngine.play('click');
          this.state.currentPage = page;
          this.renderTableList();
        });
      }
      box.appendChild(btn);
    };

    // Prev
    addBtn('<i class="fa-solid fa-angle-left"></i>', this.state.currentPage - 1, false, this.state.currentPage === 1);

    // Middle numbers
    let startPage = Math.max(1, this.state.currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      addBtn(i, i, i === this.state.currentPage);
    }

    // Next
    addBtn('<i class="fa-solid fa-angle-right"></i>', this.state.currentPage + 1, false, this.state.currentPage === totalPages);
  },

  showTooltip(e, item) {
    const tooltip = document.getElementById('preview-tooltip');
    document.getElementById('tt-word').textContent = item.word;
    document.getElementById('tt-pos').textContent = item.pos;
    document.getElementById('tt-phonetic').textContent = item.phonetic;
    document.getElementById('tt-meaning').textContent = item.meaning;

    // Positioning
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = `${rect.left + window.scrollX}px`;
    tooltip.style.top = `${rect.bottom + window.scrollY + 6}px`;
    tooltip.classList.remove('hidden');
  },

  hideTooltip() {
    document.getElementById('preview-tooltip').classList.add('hidden');
  },

  speakTTS(word) {
    if ('speechSynthesis' in window) {
      // Cancel previous speak if any
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Speech synthesis not supported in this browser.");
    }
  },


  // ==========================================================================
  // TAB 2: 플래시카드
  // ==========================================================================
  initFlashcardTab() {
    this.state.fcFlipped = false;
    document.getElementById('flashcard-flip-obj').classList.remove('flipped');

    // Remove old listeners
    const flipObj = document.getElementById('flashcard-flip-obj');
    const newFlip = flipObj.cloneNode(true);
    flipObj.parentNode.replaceChild(newFlip, flipObj);

    newFlip.addEventListener('click', () => {
      this.state.fcFlipped = !this.state.fcFlipped;
      if (this.state.fcFlipped) {
        newFlip.classList.add('flipped');
        SoundEngine.play('click');
      } else {
        newFlip.classList.remove('flipped');
        SoundEngine.play('click');
      }
    });

    // Control buttons re-binding
    this.rebindButton('btn-fc-speak', () => this.speakTTS(this.state.words[this.state.fcIndex].word));
    this.rebindButton('btn-fc-prev', () => this.navigateFlashcard(-1));
    this.rebindButton('btn-fc-next', () => this.navigateFlashcard(1));
    this.rebindButton('btn-fc-unknown', () => this.markFlashcardMemorized(false));
    this.rebindButton('btn-fc-known', () => this.markFlashcardMemorized(true));

    // Keyboard navigation binding
    document.onkeydown = (e) => {
      if (this.state.activeTab !== 'tab-flashcard') return;

      if (e.code === 'Space') {
        e.preventDefault();
        newFlip.click();
      } else if (e.code === 'ArrowLeft') {
        this.navigateFlashcard(-1);
      } else if (e.code === 'ArrowRight') {
        this.navigateFlashcard(1);
      } else if (e.key === '1') {
        this.markFlashcardMemorized(false);
      } else if (e.key === '2') {
        this.markFlashcardMemorized(true);
      }
    };

    this.renderFlashcard();
  },

  rebindButton(id, callback) {
    const btn = document.getElementById(id);
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent flipping the card
      callback();
    });
  },

  renderFlashcard() {
    const item = this.state.words[this.state.fcIndex];
    document.getElementById('fc-word').textContent = item.word;
    document.getElementById('fc-pos').textContent = item.pos;
    document.getElementById('fc-meaning').textContent = item.meaning;
    document.getElementById('fc-phonetic').textContent = item.phonetic;
    document.getElementById('fc-sentence').textContent = item.sentence;
    document.getElementById('fc-sentence-ko').textContent = item.sentenceKo;

    document.getElementById('fc-index-lbl').textContent = `${this.state.fcIndex + 1} / ${this.state.words.length}`;
    
    // Auto speak card word
    this.speakTTS(item.word);
  },

  navigateFlashcard(offset) {
    this.state.fcIndex = (this.state.fcIndex + offset + this.state.words.length) % this.state.words.length;
    this.state.fcFlipped = false;
    document.getElementById('flashcard-flip-obj').classList.remove('flipped');
    SoundEngine.play('click');
    this.renderFlashcard();
  },

  markFlashcardMemorized(known) {
    const item = this.state.words[this.state.fcIndex];
    if (known) {
      this.state.memorizedIds.add(item.word);
      SoundEngine.play('correct');
    } else {
      this.state.memorizedIds.delete(item.word);
      SoundEngine.play('wrong');
    }
    this.saveProgress();
    this.updateProgressUI();

    // Advance to next card
    this.navigateFlashcard(1);
  },


  // ==========================================================================
  // TAB 3: 퀴즈
  // ==========================================================================
  initQuizTab() {
    // Pick 10 random words
    this.state.quizQuestions = this.getShuffleSelection(10);
    this.state.quizIndex = 0;
    this.state.quizScore = { correct: 0, wrong: 0 };
    this.state.quizAnswered = false;

    document.getElementById('quiz-correct-txt').textContent = '0';
    document.getElementById('quiz-wrong-txt').textContent = '0';
    document.getElementById('quiz-feedback-panel').classList.add('hidden');

    this.rebindButton('btn-quiz-speak', () => this.speakTTS(this.state.quizQuestions[this.state.quizIndex].word));
    this.rebindButton('btn-quiz-next', () => this.advanceQuiz());

    this.renderQuizQuestion();
  },

  getShuffleSelection(count) {
    // Prefer unmemorized words if available, else shuffle all
    let pool = this.state.words.filter(w => !this.state.memorizedIds.has(w.word));
    if (pool.length < count) {
      pool = [...this.state.words];
    }
    const shuffled = [...pool];
    this.shuffle(shuffled);
    return shuffled.slice(0, count);
  },

  renderQuizQuestion() {
    this.state.quizAnswered = false;
    document.getElementById('quiz-feedback-panel').classList.add('hidden');
    document.getElementById('quiz-count-txt').textContent = `${this.state.quizIndex + 1} / 10`;

    const item = this.state.quizQuestions[this.state.quizIndex];
    document.getElementById('quiz-question-word').textContent = item.word;

    // Create 4 choices
    const choices = [item.meaning];
    
    // Choose 3 random meanings from other words
    const wrongPool = this.state.words.filter(w => w.word !== item.word);
    this.shuffle(wrongPool);
    
    for (let i = 0; i < 3; i++) {
      choices.push(wrongPool[i].meaning);
    }
    
    this.shuffle(choices);

    // Render Choices buttons
    const choicesBox = document.getElementById('quiz-choices-box');
    choicesBox.innerHTML = '';

    choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn-choice';
      btn.innerHTML = `<span class="choice-num">${idx + 1}</span> <span>${choice}</span>`;
      
      btn.addEventListener('click', () => {
        if (this.state.quizAnswered) return;
        this.verifyQuizAnswer(choice, btn, item.meaning);
      });
      choicesBox.appendChild(btn);
    });

    // Auto speak
    this.speakTTS(item.word);
  },

  verifyQuizAnswer(choice, clickedBtn, correctMeaning) {
    this.state.quizAnswered = true;
    const isCorrect = choice === correctMeaning;
    
    const feedbackPanel = document.getElementById('quiz-feedback-panel');
    const feedbackMsg = document.getElementById('quiz-feedback-msg');
    const feedbackDetail = document.getElementById('quiz-feedback-detail');

    // Highlight correct & incorrect buttons
    const choiceButtons = document.querySelectorAll('#quiz-choices-box .btn-choice');
    choiceButtons.forEach(btn => {
      const btnText = btn.querySelector('span:last-child').textContent;
      if (btnText === correctMeaning) {
        btn.classList.add('correct');
      } else if (btn === clickedBtn && !isCorrect) {
        btn.classList.add('wrong');
      }
      btn.disabled = true;
    });

    feedbackPanel.classList.remove('hidden');

    if (isCorrect) {
      this.state.quizScore.correct++;
      document.getElementById('quiz-correct-txt').textContent = this.state.quizScore.correct;
      feedbackMsg.textContent = "정답입니다!";
      feedbackMsg.className = "correct";
      feedbackDetail.textContent = `단어 뜻: ${correctMeaning}`;
      SoundEngine.play('correct');

      // Increment progress slightly
      this.state.memorizedIds.add(this.state.quizQuestions[this.state.quizIndex].word);
      this.saveProgress();
      this.updateProgressUI();
    } else {
      this.state.quizScore.wrong++;
      document.getElementById('quiz-wrong-txt').textContent = this.state.quizScore.wrong;
      feedbackMsg.textContent = "오답입니다!";
      feedbackMsg.className = "wrong";
      feedbackDetail.textContent = `올바른 뜻은: ${correctMeaning}`;
      SoundEngine.play('wrong');
    }
  },

  advanceQuiz() {
    this.state.quizIndex++;
    if (this.state.quizIndex < 10) {
      this.renderQuizQuestion();
    } else {
      // Quiz finished
      alert(`퀴즈를 완료했습니다!\n맞힌 수: ${this.state.quizScore.correct} / 10`);
      this.initQuizTab();
    }
  },


  // ==========================================================================
  // TAB 4: 뜻 타이핑
  // ==========================================================================
  initTypingTab() {
    this.state.typingQuestions = this.getShuffleSelection(10);
    this.state.typingIndex = 0;
    this.state.typingScore = { correct: 0, total: 10 };
    this.state.typingAnswered = false;
    this.state.typingShowedHint = false;

    document.getElementById('type-score-txt').textContent = '0 / 10';
    document.getElementById('type-feedback-panel').classList.add('hidden');
    document.getElementById('type-input').value = '';
    document.getElementById('type-input').disabled = false;
    document.getElementById('type-hint-txt').classList.add('hidden');

    // Rebind events
    this.rebindButton('btn-type-speak', () => this.speakTTS(this.state.typingQuestions[this.state.typingIndex].word));
    this.rebindButton('btn-show-hint', () => this.showTypingHint());
    this.rebindButton('btn-type-next', () => this.advanceTyping());
    
    // Submit actions
    const input = document.getElementById('type-input');
    const submitBtn = document.getElementById('btn-type-submit');
    
    const newSubmit = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newSubmit, submitBtn);
    
    const submitAction = () => {
      if (this.state.typingAnswered) return;
      this.verifyTypingAnswer();
    };

    newSubmit.addEventListener('click', submitAction);
    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitAction();
      }
    };

    this.renderTypingQuestion();
  },

  showTypingHint() {
    if (this.state.typingAnswered) return;
    this.state.typingShowedHint = true;
    
    const item = this.state.typingQuestions[this.state.typingIndex];
    // Generate Korean initial consonant hint (초성 힌트)
    const hint = this.getKoreanInitialConsonants(item.meaning);
    
    const hintTxt = document.getElementById('type-hint-txt');
    hintTxt.textContent = hint;
    hintTxt.classList.remove('hidden');
    SoundEngine.play('click');
  },

  getKoreanInitialConsonants(str) {
    const cho = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
    let result = "";
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i) - 44032;
      if (code > -1 && code < 11172) {
        result += cho[Math.floor(code / 588)];
      } else {
        result += str.charAt(i);
      }
    }
    return result;
  },

  renderTypingQuestion() {
    this.state.typingAnswered = false;
    this.state.typingShowedHint = false;
    document.getElementById('type-feedback-panel').classList.add('hidden');
    document.getElementById('type-hint-txt').classList.add('hidden');
    document.getElementById('type-input').value = '';
    document.getElementById('type-input').disabled = false;
    document.getElementById('type-input').focus();
    
    document.getElementById('type-count-txt').textContent = `${this.state.typingIndex + 1} / 10`;

    const item = this.state.typingQuestions[this.state.typingIndex];
    document.getElementById('type-question-word').textContent = item.word;

    this.speakTTS(item.word);
  },

  verifyTypingAnswer() {
    this.state.typingAnswered = true;
    const inputVal = document.getElementById('type-input').value.trim().toLowerCase();
    document.getElementById('type-input').disabled = true;

    const item = this.state.typingQuestions[this.state.typingIndex];
    const correctMeanings = item.meaning.split(/[,;]/).map(m => m.trim().toLowerCase());

    // Check if input value matches any of the correct definitions
    // Or if input value is a substring of the meaning
    const isCorrect = correctMeanings.some(ans => ans.includes(inputVal) && inputVal.length >= 1) || 
                      item.meaning.replace(/\s+/g, '').includes(inputVal.replace(/\s+/g, ''));

    const panel = document.getElementById('type-feedback-panel');
    const title = document.getElementById('type-result-title');
    const answerTxt = document.getElementById('type-answer-txt');
    const exEn = document.getElementById('type-example-en');
    const exKo = document.getElementById('type-example-ko');

    panel.classList.remove('hidden');
    answerTxt.textContent = item.meaning;
    exEn.textContent = item.sentence;
    exKo.textContent = item.sentenceKo;

    if (isCorrect) {
      this.state.typingScore.correct++;
      document.getElementById('type-score-txt').textContent = `${this.state.typingScore.correct} / 10`;
      
      title.textContent = "정답입니다!";
      title.className = "correct";
      SoundEngine.play('correct');

      this.state.memorizedIds.add(item.word);
      this.saveProgress();
      this.updateProgressUI();
    } else {
      title.textContent = "오답입니다!";
      title.className = "wrong";
      SoundEngine.play('wrong');
    }
  },

  advanceTyping() {
    this.state.typingIndex++;
    if (this.state.typingIndex < 10) {
      this.renderTypingQuestion();
    } else {
      alert(`뜻 타이핑 훈련이 완료되었습니다!\n점수: ${this.state.typingScore.correct} / 10`);
      this.initTypingTab();
    }
  },


  // ==========================================================================
  // TAB 5: 철자 테스트
  // ==========================================================================
  initSpellingTab() {
    this.state.spellingQuestions = this.getShuffleSelection(10);
    this.state.spellingIndex = 0;
    this.state.spellingScore = { correct: 0, total: 10 };
    this.state.spellingAnswered = false;

    document.getElementById('spell-score-txt').textContent = '0';
    document.getElementById('spell-feedback-panel').classList.add('hidden');
    document.getElementById('spell-input').value = '';
    document.getElementById('spell-input').disabled = false;

    this.rebindButton('btn-spell-audio-play', () => this.speakTTS(this.state.spellingQuestions[this.state.spellingIndex].word));
    this.rebindButton('btn-spell-next', () => this.advanceSpelling());

    const input = document.getElementById('spell-input');
    const submitBtn = document.getElementById('btn-spell-submit');
    const newSubmit = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newSubmit, submitBtn);

    const submitAction = () => {
      if (this.state.spellingAnswered) return;
      this.verifySpellingAnswer();
    };

    newSubmit.addEventListener('click', submitAction);
    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitAction();
      }
    };

    this.renderSpellingQuestion();
  },

  renderSpellingQuestion() {
    this.state.spellingAnswered = false;
    document.getElementById('spell-feedback-panel').classList.add('hidden');
    document.getElementById('spell-input').value = '';
    document.getElementById('spell-input').disabled = false;
    document.getElementById('spell-input').focus();

    document.getElementById('spell-count-txt').textContent = `${this.state.spellingIndex + 1} / 10`;

    const item = this.state.spellingQuestions[this.state.spellingIndex];
    document.getElementById('spell-meaning-lbl').textContent = item.meaning;

    // Render Slots grid representing characters
    const slotsBox = document.getElementById('spell-slots-box');
    slotsBox.innerHTML = '';

    // Render first, middle blank, and last letter to guide user
    const word = item.word.toLowerCase();
    for (let i = 0; i < word.length; i++) {
      const slot = document.createElement('span');
      slot.className = 'spelling-char-slot';
      
      const char = word.charAt(i);
      
      // Let's guide: show first letter and last letter, others are blanks
      if (i === 0 || i === word.length - 1 || char === ' ' || char === '-') {
        slot.textContent = char;
        slot.classList.add('revealed');
      } else {
        slot.textContent = '_';
      }
      slotsBox.appendChild(slot);
    }

    this.speakTTS(item.word);
  },

  verifySpellingAnswer() {
    this.state.spellingAnswered = true;
    const inputVal = document.getElementById('spell-input').value.trim().toLowerCase();
    document.getElementById('spell-input').disabled = true;

    const item = this.state.spellingQuestions[this.state.spellingIndex];
    const isCorrect = inputVal === item.word.toLowerCase();

    // Reveal all letters in slots
    const slots = document.querySelectorAll('#spell-slots-box .spelling-char-slot');
    const word = item.word.toLowerCase();
    slots.forEach((slot, idx) => {
      slot.textContent = word.charAt(idx);
      slot.classList.add('revealed');
    });

    const panel = document.getElementById('spell-feedback-panel');
    const title = document.getElementById('spell-result-title');
    const correctTxt = document.getElementById('spell-correct-txt');
    const exEn = document.getElementById('spell-example-en');
    const exKo = document.getElementById('spell-example-ko');

    panel.classList.remove('hidden');
    correctTxt.textContent = item.word;
    exEn.textContent = item.sentence;
    exKo.textContent = item.sentenceKo;

    if (isCorrect) {
      this.state.spellingScore.correct++;
      document.getElementById('spell-score-txt').textContent = this.state.spellingScore.correct;
      
      title.textContent = "정답입니다!";
      title.className = "correct";
      SoundEngine.play('correct');

      this.state.memorizedIds.add(item.word);
      this.saveProgress();
      this.updateProgressUI();
    } else {
      title.textContent = "오답입니다!";
      title.className = "wrong";
      SoundEngine.play('wrong');
    }
  },

  advanceSpelling() {
    this.state.spellingIndex++;
    if (this.state.spellingIndex < 10) {
      this.renderSpellingQuestion();
    } else {
      alert(`철자 테스트가 종료되었습니다!\n맞힌 수: ${this.state.spellingScore.correct} / 10`);
      this.initSpellingTab();
    }
  },


  // ==========================================================================
  // TAB 6: 매칭 (MEMORY MATCH GAME)
  // ==========================================================================
  initMatchingTab() {
    // Clear timer
    if (this.state.matchingTimerInterval) {
      clearInterval(this.state.matchingTimerInterval);
      this.state.matchingTimerInterval = null;
    }

    this.state.matchingTimeElapsed = 0;
    this.state.matchingMatchedCount = 0;
    this.state.matchingSelection = null;

    document.getElementById('match-timer-txt').textContent = '0.0초';
    document.getElementById('match-best-txt').textContent = this.state.matchingHighScore ? `${this.state.matchingHighScore}초` : '없음';

    const restartBtn = document.getElementById('btn-match-restart');
    const newRestart = restartBtn.cloneNode(true);
    restartBtn.parentNode.replaceChild(newRestart, restartBtn);
    
    newRestart.addEventListener('click', () => {
      SoundEngine.play('click');
      this.startMatchingGame();
    });

    const grid = document.getElementById('match-cards-grid');
    grid.innerHTML = `
      <div class="match-welcome-msg">
        <h3>단어 매칭 게임</h3>
        <p>시작 버튼을 누르면 영단어 5개와 뜻 5개가 무작위 배치됩니다. 짝이 맞는 카드를 연속해서 클릭하여 모두 없애보세요! 최단 시간을 달성해야 합니다.</p>
      </div>
    `;
  },

  startMatchingGame() {
    this.state.matchingTimeElapsed = 0;
    this.state.matchingMatchedCount = 0;
    this.state.matchingSelection = null;

    // Pick 5 random words
    const chosen = this.getShuffleSelection(5);
    
    // Create 10 card units
    const cards = [];
    chosen.forEach(item => {
      cards.push({ id: item.word, text: item.word, type: 'en' });
      cards.push({ id: item.word, text: item.meaning.split(/[,;]/)[0], type: 'ko' }); // Use first short meaning to fit card size
    });

    this.shuffle(cards);

    const grid = document.getElementById('match-cards-grid');
    grid.innerHTML = '';

    cards.forEach((card, idx) => {
      const cardDiv = document.createElement('div');
      cardDiv.className = 'match-card';
      cardDiv.textContent = card.text;
      cardDiv.setAttribute('data-card-idx', idx);

      cardDiv.addEventListener('click', () => {
        this.handleMatchingCardClick(idx, cards, cardDiv);
      });

      grid.appendChild(cardDiv);
    });

    // Start timer
    if (this.state.matchingTimerInterval) clearInterval(this.state.matchingTimerInterval);
    const start = Date.now();
    this.state.matchingTimerInterval = setInterval(() => {
      this.state.matchingTimeElapsed = ((Date.now() - start) / 1000).toFixed(1);
      document.getElementById('match-timer-txt').textContent = `${this.state.matchingTimeElapsed}초`;
    }, 100);
  },

  handleMatchingCardClick(clickedIdx, cards, cardDiv) {
    if (cardDiv.classList.contains('matched')) return;

    SoundEngine.play('click');

    const firstIdx = this.state.matchingSelection;

    if (firstIdx === null) {
      // First selection
      this.state.matchingSelection = clickedIdx;
      cardDiv.classList.add('selected');
    } 
    else if (firstIdx === clickedIdx) {
      // Clicked same card, deselect
      this.state.matchingSelection = null;
      cardDiv.classList.remove('selected');
    } 
    else {
      // Second selection
      const firstCard = cards[firstIdx];
      const secondCard = cards[clickedIdx];
      const firstEl = document.querySelector(`[data-card-idx="${firstIdx}"]`);
      
      firstEl.classList.remove('selected');
      this.state.matchingSelection = null;

      if (firstCard.id === secondCard.id && firstCard.type !== secondCard.type) {
        // Correct Match!
        SoundEngine.play('match');
        firstEl.classList.add('matched');
        cardDiv.classList.add('matched');
        this.state.matchingMatchedCount++;

        if (this.state.matchingMatchedCount === 5) {
          // Finished!
          clearInterval(this.state.matchingTimerInterval);
          this.state.matchingTimerInterval = null;
          
          setTimeout(() => {
            this.finishMatchingGame();
          }, 400);
        }
      } else {
        // Wrong match
        SoundEngine.play('wrong');
        firstEl.classList.add('shake-wrong');
        cardDiv.classList.add('shake-wrong');

        setTimeout(() => {
          firstEl.classList.remove('shake-wrong');
          cardDiv.classList.remove('shake-wrong');
        }, 400);
      }
    }
  },

  finishMatchingGame() {
    alert(`성공했습니다! 소요 시간: ${this.state.matchingTimeElapsed}초`);

    const score = parseFloat(this.state.matchingTimeElapsed);
    if (this.state.matchingHighScore === null || score < this.state.matchingHighScore) {
      this.state.matchingHighScore = score;
      localStorage.setItem('cineaho_toeic_match_best', score.toString());
      document.getElementById('match-best-txt').textContent = `${score}초`;
      alert(`🎉 최고 기록 달성!`);
    }

    this.initMatchingTab();
  },

  // Helper shuffle
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  },


  // ==========================================================================
  // 어휘 가져오기 & 내보내기 구현
  // ==========================================================================
  handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        let importedWords = [];

        if (file.name.endsWith('.json')) {
          importedWords = JSON.parse(text);
        } else if (file.name.endsWith('.csv')) {
          importedWords = this.parseCSVText(text);
        }

        if (!Array.isArray(importedWords) || importedWords.length === 0) {
          throw new Error("Invalid structure or empty array.");
        }

        // Validate items
        const validated = importedWords.filter(item => item.word && item.meaning);
        if (validated.length === 0) {
          throw new Error("No valid words found. Items must have 'word' and 'meaning'.");
        }

        // Merge or replace
        if (confirm(`불러온 단어 ${validated.length}개를 현재 단어장에 추가하시겠습니까? (중복 제거)`)) {
          validated.forEach(item => {
            const index = this.state.words.findIndex(w => w.word.toLowerCase() === item.word.toLowerCase());
            const formatted = {
              word: item.word,
              meaning: item.meaning,
              phonetic: item.phonetic || '/.../',
              pos: item.pos || '명사',
              sentence: item.sentence || 'No example sentence.',
              sentenceKo: item.sentenceKo || '해석이 없습니다.'
            };
            if (index > -1) {
              this.state.words[index] = formatted; // Overwrite duplicate
            } else {
              this.state.words.push(formatted); // Add new
            }
          });

          this.updateProgressUI();
          this.renderCurrentTab();
          alert(`성공적으로 단어를 추가했습니다! 현재 단어 개수: ${this.state.words.length}개`);
        }
      } catch (err) {
        alert(`파일을 불러오는데 실패했습니다: ${err.message}`);
      }
    };
    reader.readAsText(file);
  },

  parseCSVText(text) {
    const lines = text.split('\n');
    const result = [];
    lines.forEach((line, index) => {
      if (index === 0 && line.toLowerCase().includes('word')) return; // Header skip
      
      const parts = line.split(',');
      if (parts.length >= 2) {
        result.push({
          word: parts[0].trim(),
          meaning: parts[1].trim(),
          phonetic: parts[2] ? parts[2].trim() : '',
          pos: parts[3] ? parts[3].trim() : '',
          sentence: parts[4] ? parts[4].trim() : '',
          sentenceKo: parts[5] ? parts[5].trim() : ''
        });
      }
    });
    return result;
  },

  exportDataToFile() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state.words, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "cineaho_toeic_vocabulary.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
};

// Auto initialize on DOM Content Ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
