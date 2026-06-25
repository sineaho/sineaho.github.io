// DOM Elements for Navigation & Scroll Indicator
const scrollRing = document.getElementById('scroll-ring');
const scrollPercent = document.getElementById('scroll-percent');
const btnScrollTop = document.getElementById('btn-scroll-top');
const btnScrollBottom = document.getElementById('btn-scroll-bottom');

let circumference = 0;
// SVG Ring Configuration
if (scrollRing) {
  const radius = scrollRing.r.baseVal.value;
  circumference = radius * 2 * Math.PI;
  scrollRing.style.strokeDasharray = `${circumference} ${circumference}`;
  scrollRing.style.strokeDashoffset = circumference;
}

// Scroll Tracker Logic
function updateScrollProgress() {
  if (!scrollRing || !scrollPercent) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  
  if (docHeight <= 0) return;
  
  const pct = Math.min(100, Math.floor((scrollTop / docHeight) * 100));
  scrollPercent.textContent = `${pct}%`;
  
  // Update progress circle offset
  const offset = circumference - (pct / 100) * circumference;
  scrollRing.style.strokeDashoffset = offset;
}

if (scrollRing) {
  window.addEventListener('scroll', updateScrollProgress);
  window.addEventListener('resize', updateScrollProgress);
}

// Smooth Scroll Buttons
if (btnScrollTop) {
  btnScrollTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

if (btnScrollBottom) {
  btnScrollBottom.addEventListener('click', () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  });
}

// Interactive Calculator Modals Logic
const calcModal = document.getElementById('calc-modal');
const modalTitle = document.getElementById('modal-title');
const modalBodyContent = document.getElementById('modal-body-content');
const modalCloseBtn = document.getElementById('modal-close-btn');

function openModal(title, htmlContent) {
  if (!modalTitle || !modalBodyContent || !calcModal) return;
  modalTitle.textContent = title;
  modalBodyContent.innerHTML = htmlContent;
  calcModal.classList.add('open');
}

function closeModal() {
  if (!modalBodyContent || !calcModal) return;
  calcModal.classList.remove('open');
  modalBodyContent.innerHTML = '';
}

if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', closeModal);
}
if (calcModal) {
  calcModal.addEventListener('click', (e) => {
    if (e.target === calcModal) closeModal();
  });
}

// Interactive 1: YouTube Channel Analyser
const btnChannelAnalyser = document.getElementById('btn-channel-analyser');
if (btnChannelAnalyser) {
  btnChannelAnalyser.addEventListener('click', () => {
    const html = `
      <div class="calc-field">
        <label for="anal-url">YouTube 채널 주소</label>
        <input type="url" id="anal-url" placeholder="https://www.youtube.com/@channel">
      </div>
      <div class="calc-field">
        <label for="anal-category">주요 컨텐츠 분류</label>
        <select id="anal-category">
          <option value="tech">IT/테크</option>
          <option value="mukbang">먹방/음식</option>
          <option value="gaming">게임</option>
          <option value="vlog">일상/Vlog</option>
        </select>
      </div>
      <button class="btn btn-purple-grad" style="width: 100%; margin-top: 0.5rem;" onclick="runChannelAnalysis()">실시간 분석 시작</button>
      <div class="calc-result-box hidden" id="anal-result">
        <span>AI 채널 분석 결과</span>
        <h4 id="anal-grade">-</h4>
        <p id="anal-detail" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;"></p>
      </div>
    `;
    openModal('YouTube 채널 분석기', html);
  });
}

window.runChannelAnalysis = function() {
  const url = document.getElementById('anal-url').value.trim();
  const category = document.getElementById('anal-category').value;
  const resultBox = document.getElementById('anal-result');
  const grade = document.getElementById('anal-grade');
  const detail = document.getElementById('anal-detail');

  if (!url) {
    alert('유튜브 채널 주소를 입력해 주세요.');
    return;
  }

  // Random Mockup Result
  const grades = ['A1 등급 (상위 1.2%)', 'A3 등급 (상위 4.8%)', 'B2 등급 (상위 15.6%)', 'C1 등급 (평균 수준)'];
  const randomGrade = grades[Math.floor(Math.random() * grades.length)];
  
  grade.textContent = randomGrade;
  detail.innerHTML = `
    카테고리 분석: <strong>${category.toUpperCase()}</strong> 분야<br>
    최근 30일 성장률: <strong>+${(Math.random() * 15).toFixed(1)}%</strong><br>
    예상 일일 조회수: <strong>${Math.floor(Math.random() * 50000 + 1000).toLocaleString()}회</strong>
  `;
  
  resultBox.classList.remove('hidden');
};

// Interactive 2: YouTube Revenue Calculator
const btnRevenueCalc = document.getElementById('btn-revenue-calc');
if (btnRevenueCalc) {
  btnRevenueCalc.addEventListener('click', () => {
    const html = `
      <div class="calc-field">
        <label for="rev-views">월간 예상 조회수</label>
        <input type="number" id="rev-views" value="100000" step="10000">
      </div>
      <div class="calc-field">
        <label for="rev-cpm">1,000회당 광고 수익 (RPM / CPM)</label>
        <input type="number" id="rev-cpm" value="3000" step="500">
      </div>
      <div class="calc-field">
        <label for="rev-type">영상 콘텐츠 형태</label>
        <select id="rev-type" onchange="updateDefaultRPM()">
          <option value="long">롱폼 영상 (일반 가로 영상)</option>
          <option value="short">숏폼 영상 (YouTube Shorts)</option>
        </select>
      </div>
      <button class="btn btn-blue-grad" style="width: 100%; margin-top: 0.5rem;" onclick="runRevenueCalculation()">수익 계산하기</button>
      <div class="calc-result-box hidden" id="rev-result">
        <span>예상 월 광고 수익 (세전)</span>
        <h4 id="rev-amount">- 원</h4>
      </div>
    `;
    openModal('YouTube 수익 계산기', html);
  });
}

window.updateDefaultRPM = function() {
  const type = document.getElementById('rev-type').value;
  const rpmInput = document.getElementById('rev-cpm');
  if (type === 'short') {
    rpmInput.value = '150'; // Shorts RPM is lower
  } else {
    rpmInput.value = '3000';
  }
};

window.runRevenueCalculation = function() {
  const views = parseFloat(document.getElementById('rev-views').value);
  const rpm = parseFloat(document.getElementById('rev-cpm').value);
  const resultBox = document.getElementById('rev-result');
  const amount = document.getElementById('rev-amount');

  if (isNaN(views) || isNaN(rpm)) {
    alert('올바른 값을 입력해 주세요.');
    return;
  }

  // Revenue = (Views / 1000) * RPM
  const earnings = Math.floor((views / 1000) * rpm);
  amount.textContent = `₩ ${earnings.toLocaleString()} 원`;
  resultBox.classList.remove('hidden');
};

// Interactive 3: Affiliate Marketing Calculator
const btnAffiliateCalc = document.getElementById('btn-affiliate-calc');
if (btnAffiliateCalc) {
  btnAffiliateCalc.addEventListener('click', () => {
    const html = `
      <div class="calc-field">
        <label for="aff-target">월 목표 제휴 수익</label>
        <input type="number" id="aff-target" value="1000000" step="100000">
      </div>
      <div class="calc-field">
        <label for="aff-price">추천 상품 평균 단가</label>
        <input type="number" id="aff-price" value="50000" step="10000">
      </div>
      <div class="calc-field">
        <label for="aff-ctr">링크 클릭율 (CTR, %)</label>
        <input type="number" id="aff-ctr" value="2" step="0.5">
      </div>
      <div class="calc-field">
        <label for="aff-cvr">구매 전환율 (CVR, %)</label>
        <input type="number" id="aff-cvr" value="3" step="0.5">
      </div>
      <button class="btn btn-cyan-grad" style="width: 100%; margin-top: 0.5rem;" onclick="runAffiliateCalculation()">필요 수치 역계산</button>
      <div class="calc-result-box hidden" id="aff-result" style="text-align: left;">
        <span style="display: block; text-align: center; margin-bottom: 0.5rem;">목표 달성을 위한 권장 트래픽</span>
        <p style="font-size: 0.85rem; line-height: 1.6;">
          필요 구매 건수: <strong id="aff-sales" style="color:#06b6d4;">- 건</strong><br>
          필요 링크 클릭수: <strong id="aff-clicks" style="color:#06b6d4;">- 회</strong><br>
          <strong>필요 영상 노출수(조회수):</strong> <h4 id="aff-views" style="margin-top:0.25rem;">- 회</h4>
        </p>
      </div>
    `;
    openModal('제휴마케팅 수익 계산기', html);
  });
}

window.runAffiliateCalculation = function() {
  const target = parseFloat(document.getElementById('aff-target').value);
  const price = parseFloat(document.getElementById('aff-price').value);
  const ctr = parseFloat(document.getElementById('aff-ctr').value) / 100;
  const cvr = parseFloat(document.getElementById('aff-cvr').value) / 100;

  const resultBox = document.getElementById('aff-result');
  const salesSpan = document.getElementById('aff-sales');
  const clicksSpan = document.getElementById('aff-clicks');
  const viewsH4 = document.getElementById('aff-views');

  if (isNaN(target) || isNaN(price) || isNaN(ctr) || isNaN(cvr)) {
    alert('올바른 값을 입력해 주세요.');
    return;
  }

  // Commission is 3% (Standard Coupang Partners)
  const commissionRate = 0.03;
  const earningPerSale = price * commissionRate;

  // Required Sales = Target / Earning per sale
  const requiredSales = Math.ceil(target / earningPerSale);
  
  // Required Clicks = Required Sales / CVR
  const requiredClicks = Math.ceil(requiredSales / cvr);

  // Required Views = Required Clicks / CTR
  const requiredViews = Math.ceil(requiredClicks / ctr);

  salesSpan.textContent = `${requiredSales.toLocaleString()} 건`;
  clicksSpan.textContent = `${requiredClicks.toLocaleString()} 회`;
  viewsH4.textContent = `${requiredViews.toLocaleString()} 회`;
  
  resultBox.classList.remove('hidden');
};

// Interactive 4: YouTuber Rank List View (Modal fallback/legacy)
const btnRankView = document.getElementById('btn-rank-view');
if (btnRankView) {
  btnRankView.addEventListener('click', (e) => {
    // If it's an anchor, let it navigate
    if (btnRankView.tagName.toLowerCase() === 'a') return;
    
    e.preventDefault();
    const html = `
      <div class="calc-field">
        <label for="rank-category">카테고리별 유튜버 랭킹</label>
        <select id="rank-category" onchange="updateYoutuberRankings()">
          <option value="tech">IT/디바이스</option>
          <option value="comedy">코미디/엔터</option>
          <option value="cooking">요리/쿡방</option>
        </select>
      </div>
      
      <div style="margin-top: 1rem;">
        <ul id="rank-list" style="display: flex; flex-direction: column; gap: 0.5rem;">
          <!-- Injected list -->
        </ul>
      </div>
    `;
    openModal('실시간 유튜버 랭킹 TOP 1200', html);
    updateYoutuberRankings();
  });
}

window.updateYoutuberRankings = function() {
  const categorySelect = document.getElementById('rank-category');
  const list = document.getElementById('rank-list');
  if (!categorySelect || !list) return;
  const category = categorySelect.value;
  
  const rankData = {
    tech: [
      { name: '잇섭 ITSub', sub: '2.6M', views: '1.2B', score: 'A1' },
      { name: '주연 ZUYONI', sub: '780K', views: '320M', score: 'A2' },
      { name: '테크몽 Techmong', sub: '650K', views: '280M', score: 'A3' }
    ],
    comedy: [
      { name: '피식대학 Psick Univ', sub: '3.1M', views: '1.8B', score: 'A1' },
      { name: '숏박스 Shortbox', sub: '2.9M', views: '1.5B', score: 'A1' },
      { name: '너덜트 Nerdult', sub: '1.8M', views: '920M', score: 'A2' }
    ],
    cooking: [
      { name: '백종원 Baek Jong Won', sub: '6.2M', views: '3.4B', score: 'A1' },
      { name: '하루한끼 one meal a day', sub: '4.5M', views: '2.1B', score: 'A1' },
      { name: '육식맨 YOOXICMAN', sub: '1.2M', views: '680M', score: 'A2' }
    ]
  };

  const selected = rankData[category] || [];
  list.innerHTML = selected.map((item, idx) => `
    <li style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 1rem; background-color: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid rgba(255,255,255,0.04);">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span style="font-weight: 800; color: #6366f1;"># ${idx + 1}</span>
        <span style="font-size: 0.85rem; font-weight: 600;">${item.name}</span>
      </div>
      <div style="font-size: 0.75rem; color: var(--text-muted);">
        구독자: <strong style="color:#fff;">${item.sub}</strong> | 등급: <span style="color:#10b981; font-weight:700;">${item.score}</span>
      </div>
    </li>
  `).join('');
};

// Tab Trigger Handlers for Rankings Card Grid (rank.html)
document.querySelectorAll('.tab-triggers').forEach(trigger => {
  const buttons = trigger.querySelectorAll('.tab-btn');
  const card = trigger.closest('.rank-card');
  if (!card) return;

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      // Set active tab trigger
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const tab = button.getAttribute('data-tab');
      const dailyElement = card.querySelector('.list-daily');
      const weeklyElement = card.querySelector('.list-weekly');

      if (tab === 'daily') {
        if (dailyElement) dailyElement.classList.remove('hidden');
        if (weeklyElement) weeklyElement.classList.add('hidden');
      } else if (tab === 'weekly') {
        if (dailyElement) dailyElement.classList.add('hidden');
        if (weeklyElement) weeklyElement.classList.remove('hidden');
      }
    });
  });
});

// Interactive Dots/More button visual feedback
document.querySelectorAll('.btn-more-dots, .btn-all-lives').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    alert('실시간 상세 데이터 분석 기능은 CineAHO 프리미엄 멤버 전용입니다.');
  });
});

// Initialize scroll progress check
if (scrollRing) {
  updateScrollProgress();
}

// ==========================================
// YouTube News & Docu Insight Page Logic
// ==========================================

const newsCardsContainer = document.getElementById('news-cards-container');
if (newsCardsContainer) {
  // Broadcaster Brand Colors mapping helper
  const brandColors = {
    'SBS 뉴스': 'color-sbs',
    'JTBC News': 'color-jtbc',
    'MBCNEWS': 'color-mbc',
    'YTN': 'color-ytn',
    'KBS News': 'color-kbs',
    '연합뉴스TV': 'color-jtbc', // default fallback colors
    '채널A': 'color-kbs',
    'Sky News': 'color-sbs',
    'France 24': 'color-mbc',
    'CNN': 'color-ytn',
    'BBC': 'color-others'
  };

  // Mockup Dataset (16 detailed records)
  const initialNewsData = [
    {
      id: 1,
      title: "[🔴속보] 한화 에어로스페이스 폭발 '합동 감식' 경찰·소방·한화 현장 점검",
      channel: "SBS 뉴스",
      region: "KR",
      type: "live",
      duration: "4:41:29",
      views: 2300,
      likes: 16,
      comments: 0,
      timestamp: "2026-06-02T20:41:00",
      timeDisplay: "2026-06-02 (화) 오후 08:41",
      growthRate: 0.7,
      tags: ["#SBS뉴스", "#실시간", "#속보", "#한화", "#폭발"],
      description: "속보, 폭발, 한화, 에어로스페이스, 경찰, 소방 합동 감식 진행 중",
      thumbGradient: "linear-gradient(135deg, #1e293b, #0f172a)",
      videoId: "9uLCEmc774U"
    },
    {
      id: 2,
      title: "[다시보기] 6·3 지방선거 D-1... 오세훈 국민의힘 서울시장 후보, 신촌역 파이널 유세 현장",
      channel: "JTBC News",
      region: "KR",
      type: "normal",
      duration: "39:55",
      views: 338,
      likes: 7,
      comments: 0,
      timestamp: "2026-06-02T20:36:00",
      timeDisplay: "2026-06-02 (화) 오후 08:36",
      growthRate: 2.1,
      tags: ["#선거", "#시장", "#서울시장", "#지방선거", "#오세훈"],
      description: "선거를 하루 앞둔 오늘(2일) 저녁 오세훈 국민의힘 서울시장 후보는 '파이널 유세'를 펼쳤습니다.",
      thumbGradient: "linear-gradient(135deg, #0f172a, #1e1b4b)",
      videoId: "6MdsToU5Zf8"
    },
    {
      id: 3,
      title: "Sadiq Khan gives speech in support of social media ban under U-16s policy",
      channel: "Sky News",
      region: "Global",
      type: "normal",
      duration: "14:40",
      views: 374,
      likes: 13,
      comments: 1,
      timestamp: "2026-06-02T20:35:00",
      timeDisplay: "2026-06-02 (화) 오후 08:35",
      growthRate: 3.7,
      tags: ["#Sadiq", "#Khan", "#social", "#media", "#ban"],
      description: "Mayor of London Sir Sadiq Khan will warn about the dangers of social media platforms on kids.",
      thumbGradient: "linear-gradient(135deg, #0284c7, #0f172a)",
      videoId: "7GyU3SDwoiQ"
    },
    {
      id: 4,
      title: "서소문 고가·스타벅스...선거전 강타한 이슈들 / SBS 8뉴스 / 2026 국민의 선택",
      channel: "SBS 뉴스",
      region: "KR",
      type: "normal",
      duration: "2:53",
      views: 64,
      likes: 3,
      comments: 1,
      timestamp: "2026-06-02T20:37:00",
      timeDisplay: "2026-06-02 (화) 오후 08:37",
      growthRate: 6.3,
      tags: ["#선거", "#사고", "#대통령", "#선거전", "#스타벅스"],
      description: "<앵커> 선거 막판 불거진 서소문 고가차도 붕괴 사고나 스타벅스 파문 같은 각종...",
      thumbGradient: "linear-gradient(135deg, #172554, #0f172a)",
      videoId: "UKHCciSjt7g"
    },
    {
      id: 5,
      title: "[🔴속보] '尹공수처' 호언장담 종합특검... 변호인 반발에 결국 비공개 전환",
      channel: "연합뉴스TV",
      region: "KR",
      type: "breaking",
      duration: "1:40:16",
      views: 15400,
      likes: 312,
      comments: 45,
      timestamp: "2026-06-02T20:20:00",
      timeDisplay: "2026-06-02 (화) 오후 08:20",
      growthRate: 1.5,
      tags: ["#연합뉴스TV", "#공수처", "#종합특검", "#비공개"],
      description: "종합특검법 수사 대상 및 공수처 외압 파장 속 비공개 심문 절차 전환 소식입니다.",
      thumbGradient: "linear-gradient(135deg, #451a03, #0f172a)",
      videoId: "1-ZFK-N54Js"
    },
    {
      id: 6,
      title: "\"화약 세척이 왜 위험한가?\" 폭발사고 합동감식... 현장 주변 CCTV 없다",
      channel: "MBCNEWS",
      region: "KR",
      type: "normal",
      duration: "2:05",
      views: 890,
      likes: 41,
      comments: 3,
      timestamp: "2026-06-02T20:05:00",
      timeDisplay: "2026-06-02 (화) 오후 08:05",
      growthRate: 0.9,
      tags: ["#합동감식", "#CCTV", "#화약", "#폭발사고"],
      description: "경찰 and 국과수 주도 화약 폭발 합동 감식 현장 보고. 현장에 CCTV가 없어 수사에 난항.",
      thumbGradient: "linear-gradient(135deg, #4c0519, #0f172a)",
      videoId: "zrM4WQ46sDw"
    },
    {
      id: 7,
      title: "10명 중 2명 표심 여전히 '안갯속'.. 지방선거 최종 승부처는 PK 격전지",
      channel: "채널A",
      region: "KR",
      type: "normal",
      duration: "2:29",
      views: 1200,
      likes: 28,
      comments: 2,
      timestamp: "2026-06-02T19:55:00",
      timeDisplay: "2026-06-02 (화) 오후 07:55",
      growthRate: 4.8,
      tags: ["#선거", "#표심", "#PK", "#지방선거", "#격전지"],
      description: "PK 낙동강 벨트 중심 10명 중 2명의 중도층 부동표가 캐스팅보트를 쥐고 있는 형국.",
      thumbGradient: "linear-gradient(135deg, #111827, #064e3b)",
      videoId: "S1ouDrWOov8"
    },
    {
      id: 8,
      title: "[비하인드 뉴스] \"그거 메뚜기예요?\" 빵 터진 대통령... 청와대 미공개 영상 먼저 보시죠",
      channel: "JTBC News",
      region: "KR",
      type: "normal",
      duration: "3:42",
      views: 45000,
      likes: 1200,
      comments: 89,
      timestamp: "2026-06-02T19:42:00",
      timeDisplay: "2026-06-02 (화) 오후 07:42",
      growthRate: 8.2,
      tags: ["#대통령", "#메뚜기", "#비하인드뉴스", "#청와대"],
      description: "농가 격려차 방문한 영농 단지에서 벼 위를 뛰어다니는 메뚜기를 보며 나눈 유쾌한 대화.",
      thumbGradient: "linear-gradient(135deg, #311042, #0f172a)",
      videoId: "YGKVWGUP9xI"
    },
    {
      id: 9,
      title: "L'INFO DU JOUR - Liban : les combats s'intensifient dans le sud du pays",
      channel: "France 24",
      region: "Global",
      type: "normal",
      duration: "25:00",
      views: 9800,
      likes: 245,
      comments: 12,
      timestamp: "2026-06-02T19:30:00",
      timeDisplay: "2026-06-02 (화) 오후 07:30",
      growthRate: 2.7,
      tags: ["#Liban", "#combat", "#intensifient", "#France24"],
      description: "Les frappes aériennes et les combats terrestres s'intensifient dans la région frontalière du Sud-Liban.",
      thumbGradient: "linear-gradient(135deg, #1e1b4b, #311042)",
      videoId: "HFkt17_8lto"
    },
    {
      id: 10,
      title: "[🔴LIVE] 24시간 뉴스 생중계 - 대한민국 대표 뉴스 채널 YTN 실시간 라이브",
      channel: "YTN",
      region: "KR",
      type: "live",
      duration: "LIVE",
      views: 120000,
      likes: 3400,
      comments: 560,
      timestamp: "2026-06-02T20:50:00",
      timeDisplay: "2026-06-02 (화) 오후 08:50",
      growthRate: 5.4,
      tags: ["#YTN", "#실시간", "#라이브", "#뉴스생중계", "#속보"],
      description: "대한민국 대표 뉴스 YTN의 실시간 24시간 스트리밍 방송입니다.",
      thumbGradient: "linear-gradient(135deg, #be123c, #1f2937)",
      videoId: "oueftKIQSnQ"
    },
    {
      id: 11,
      title: "Breaking News: Super Heavy rocket launch updates and telemetry details",
      channel: "CNN",
      region: "Global",
      type: "breaking",
      duration: "15:42",
      views: 87000,
      likes: 2900,
      comments: 430,
      timestamp: "2026-06-02T18:15:00",
      timeDisplay: "2026-06-02 (화) 오후 06:15",
      growthRate: 10.2,
      tags: ["#CNN", "#SpaceX", "#Rocket", "#Launch", "#SuperHeavy"],
      description: "NASA coordinates and SpaceX telemetry updates for the orbital test flight from Boca Chica.",
      thumbGradient: "linear-gradient(135deg, #090d16, #991b1b)",
      videoId: "iRbDmdCe6zA"
    },
    {
      id: 12,
      title: "CineAHO real-time search: How AI is transforming global elections and debates",
      channel: "BBC",
      region: "Global",
      type: "docu",
      duration: "42:15",
      views: 23000,
      likes: 812,
      comments: 94,
      timestamp: "2026-06-01T11:30:00",
      timeDisplay: "2026-06-01 (월) 오전 11:30",
      growthRate: 1.1,
      tags: ["#AI", "#elections", "#cineaho", "#docu"],
      description: "An in-depth documentary investigating how synthetic avatars and AI content sway local voting behaviors.",
      thumbGradient: "linear-gradient(135deg, #1e293b, #0d9488)",
      videoId: "qtrUg-QPC-8"
    },
    {
      id: 13,
      title: "[다큐] 누리호 발사 3주년 - 우주 영토 개척의 숨은 주역들을 만나다",
      channel: "KBS News",
      region: "KR",
      type: "docu",
      duration: "52:10",
      views: 41000,
      likes: 1100,
      comments: 120,
      timestamp: "2026-05-25T15:00:00",
      timeDisplay: "2026-05-25 (월) 오후 03:00",
      growthRate: 0.5,
      tags: ["#누리호", "#다큐멘터리", "#우주개발", "#KBS다큐"],
      description: "누리호 프로젝트의 뼈대 설계부터 연소시험 통과까지 피땀 흘린 연구원들의 감동 비하인드.",
      thumbGradient: "linear-gradient(135deg, #0369a1, #0f172a)",
      videoId: "ZACUseum0F8"
    },
    {
      id: 14,
      title: "[속보] 누리호 4차 발사 예비조립 완료... 한국항공우주연구원 최종 점검 돌입",
      channel: "YTN",
      region: "KR",
      type: "breaking",
      duration: "1:45",
      views: 1500,
      likes: 42,
      comments: 1,
      timestamp: "2026-06-02T20:25:00",
      timeDisplay: "2026-06-02 (화) 오후 08:25",
      growthRate: 7.8,
      tags: ["#누리호", "#속보", "#우주", "#KARI"],
      description: "과기정통부 보고에 따르면 4차 발사용 단 조립 완료 후 탑재 위성 연동성 전정 확인 작업 중.",
      thumbGradient: "linear-gradient(135deg, #1e293b, #1e3a8a)",
      videoId: "jmjMsQMtswc"
    },
    {
      id: 15,
      title: "[🔴LIVE] MBC 뉴스데스크 실시간 스트리밍 - 2026 제8회 지방선거 개표 D-1 전야 특집",
      channel: "MBCNEWS",
      region: "KR",
      type: "live",
      duration: "LIVE",
      views: 45000,
      likes: 1300,
      comments: 890,
      timestamp: "2026-06-02T20:30:00",
      timeDisplay: "2026-06-02 (화) 오후 08:30",
      growthRate: 4.1,
      tags: ["#MBC", "#뉴스데스크", "#실시간", "#지방선거"],
      description: "여야 수뇌부의 막판 총력 지지 호소 현장 분석 및 실시간 리포트 종합 중계.",
      thumbGradient: "linear-gradient(135deg, #a21caf, #0f172a)",
      videoId: "a5LdrO0gopk"
    },
    {
      id: 16,
      title: "스타벅스 커피 가격 기습 인상 파문... 고가 논란 속 대안 브랜드 찾는 직장인들",
      channel: "YTN",
      region: "KR",
      type: "normal",
      duration: "3:12",
      views: 12000,
      likes: 89,
      comments: 34,
      timestamp: "2026-06-02T17:40:00",
      timeDisplay: "2026-06-02 (화) 오후 05:40",
      growthRate: 3.2,
      tags: ["#스타벅스", "#물가상승", "#커피가격", "#직장인"],
      description: "유명 프랜차이즈 브랜드들의 연쇄 가격 인상 도미노 파장 속에 서민 체감 물가 고통 증가.",
      thumbGradient: "linear-gradient(135deg, #0f766e, #0f172a)",
      videoId: "syhy-JjkSvY"
    }
  ];

  let newsData = [];

  function formatNewsTimestamp(date) {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = weekdays[date.getDay()];
    
    const hours = date.getHours();
    const ampm = hours >= 12 ? '오후' : '오전';
    const hours12 = hours % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${yyyy}-${mm}-${dd} (${dayName}) ${ampm} ${hours12}:${minutes}`;
  }

  function initializeDefaultNews() {
    const mockToday = new Date("2026-06-02T20:55:00");
    const actualToday = new Date();
    const diffMs = actualToday.getTime() - mockToday.getTime();
    
    newsData = initialNewsData.map(item => {
      const mockDate = new Date(item.timestamp);
      const shiftedDate = new Date(mockDate.getTime() + diffMs);
      return {
        ...item,
        timestamp: shiftedDate.toISOString().slice(0, 19),
        timeDisplay: formatNewsTimestamp(shiftedDate)
      };
    });
    
    saveNewsToStorage();
  }

  function saveNewsToStorage() {
    localStorage.setItem('cineaho_news_list', JSON.stringify(newsData));
  }

  function loadNewsFromStorage() {
    const savedNews = localStorage.getItem('cineaho_news_list');
    if (savedNews) {
      try {
        newsData = JSON.parse(savedNews);
        
        // If any cached item is missing the videoId key or uses old invalid mock video IDs, force reset and load default dataset
        const oldMockIds = ["coYw-tI302w", "uQ88y0E4Bws", "N55R97d26_c", "aY5_zZ0531c", "q49P6_bQxYw", "lP2sS_V3oF0", "h3MuIUNMwzI", "J5f_b_z-0k4", "qf5u2L9kM3M", "tK9V05d_UvQ", "5p4B81N0F-w", "9AuqerQW2t4", "pE9fGfB1c4s", "M-x4UupmBfM"];
        const needsMigration = newsData.some(item => !item.videoId || oldMockIds.includes(item.videoId));
        if (needsMigration) {
          console.log("Old cached news data or invalid video IDs detected. Re-initializing default news...");
          initializeDefaultNews();
        }
      } catch (e) {
        console.error("Failed to parse saved news, fallback to default", e);
        initializeDefaultNews();
      }
    } else {
      initializeDefaultNews();
    }
  }

  loadNewsFromStorage();

  // Global filters state
  let activeFilter = 'all';
  let searchQuery = '';
  let selectedBroadcaster = 'all';
  let selectedPeriod = '1m';
  let selectedSort = 'default';
  let activeLayout = 'thumbnail';

  // DOM elements cache
  const totalCountSpan = document.getElementById('total-news-count');
  const searchInput = document.getElementById('news-search');
  const searchBtn = document.getElementById('btn-search-trigger');
  const selectBroadcaster = document.getElementById('select-broadcaster');
  const selectPeriod = document.getElementById('select-period');
  const selectSort = document.getElementById('select-sort');
  
  // Helpers
  function parseDurationToMinutes(durationStr) {
    if (!durationStr || durationStr === 'LIVE') return 9999;
    const parts = durationStr.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 60 + parts[1]; // hh:mm:ss -> minutes
    } else if (parts.length === 2) {
      return parts[0]; // mm:ss -> minutes
    }
    return 0;
  }

  function getRegionTag(region) {
    if (region === 'KR') return '<span class="news-region-badge kr">한국 뉴스</span>';
    return '<span class="news-region-badge global">해외 뉴스</span>';
  }

  function getBadgeHtml(item) {
    if (item.type === 'live') {
      return '<span class="news-badge-top-left live"><i class="fa-solid fa-circle"></i> LIVE</span>';
    } else if (item.type === 'breaking') {
      return '<span class="news-badge-top-left breaking">속보</span>';
    } else if (item.type === 'docu') {
      return '<span class="news-badge-top-left docu">다큐</span>';
    }
    return '';
  }

  // Render cards logic
  function renderNewsCards(filteredData) {
    if (!newsCardsContainer) return;
    
    if (filteredData.length === 0) {
      newsCardsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
          <i class="fa-solid fa-face-frown" style="font-size: 2.5rem; margin-bottom: 1rem; color: rgba(255,255,255,0.1);"></i>
          <p>조건에 일치하는 뉴스 영상을 찾을 수 없습니다.</p>
        </div>
      `;
      totalCountSpan.textContent = '0';
      return;
    }

    totalCountSpan.textContent = filteredData.length.toLocaleString();

    newsCardsContainer.innerHTML = filteredData.map(item => {
      const regionBadge = getRegionTag(item.region);
      const topBadge = getBadgeHtml(item);
      const colorClass = brandColors[item.channel] || 'color-others';

      if (activeLayout === 'list') {
        // List Layout (Horizontal row)
        return `
          <div class="news-item-card" data-id="${item.id}">
            <div class="news-item-thumb-wrapper">
              ${topBadge}
              <div class="news-item-thumb" style="background: url('https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg') center/cover no-repeat, ${item.thumbGradient};"></div>
              <span class="news-duration-badge">${item.duration}</span>
            </div>
            <div class="news-item-content">
              <div class="news-content-left">
                <h4 class="news-item-title" title="${item.title}">${item.title}</h4>
                <div class="news-item-channel-line">
                  <div class="news-channel-avatar ${colorClass}"></div>
                  <span class="news-channel-name">${item.channel}</span>
                  ${regionBadge}
                </div>
                <p class="news-item-desc">${item.description}</p>
                <div class="news-item-tags">
                  ${item.tags.map(t => `<span>${t}</span>`).join(' ')}
                </div>
              </div>
              <div class="news-content-right">
                <span class="news-item-stats-line">
                  조회 ${item.views >= 1000 ? (item.views/1000).toFixed(1) + 'K' : item.views} · 
                  추천 ${item.likes} · 
                  댓글 ${item.comments}
                </span>
                <span class="news-item-stats-line" style="font-size: 0.7rem; color: var(--text-dark);">${item.timeDisplay}</span>
                <div class="news-item-trend-line">
                  <span class="trend-indicator">↗ ${item.growthRate}%</span>
                  <span class="duration-indicator"><i class="fa-solid fa-play"></i> ${item.duration}</span>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        // Thumbnail or Grid Layout
        return `
          <div class="news-item-card" data-id="${item.id}">
            <div class="news-item-thumb-wrapper">
              ${topBadge}
              <div class="news-item-thumb" style="background: url('https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg') center/cover no-repeat, ${item.thumbGradient};"></div>
              <span class="news-duration-badge">${item.duration}</span>
            </div>
            <div class="news-item-content">
              <div class="news-item-channel-line">
                <div class="news-channel-avatar ${colorClass}"></div>
                <span class="news-channel-name">${item.channel}</span>
                ${regionBadge}
              </div>
              <h4 class="news-item-title" title="${item.title}">${item.title}</h4>
              <span class="news-item-stats-line">
                조회 ${item.views >= 1000 ? (item.views/1000).toFixed(1) + 'K' : item.views}회 · 
                좋아요 ${item.likes}개 · 
                댓글 ${item.comments}개<br>
                <span style="font-size: 0.68rem; color: var(--text-dark);">${item.timeDisplay}</span>
              </span>
              <div class="news-item-trend-line">
                <span class="trend-indicator">↗ ${item.growthRate}%</span>
                <span class="duration-indicator"><i class="fa-solid fa-play"></i> ${item.duration}</span>
              </div>
              <div class="news-item-tags">
                ${item.tags.map(t => `<span>${t}</span>`).join(' ')}
              </div>
              <p class="news-item-desc">${item.description}</p>
            </div>
          </div>
        `;
      }
    }).join('');
  }

  // Filter & Sort Engine
  function applyFilters() {
    let result = [...newsData];

    // 1. Quick Tag Filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'live') {
        result = result.filter(item => item.type === 'live' || item.title.includes('LIVE') || item.title.includes('라이브'));
      } else if (activeFilter === 'breaking') {
        result = result.filter(item => item.type === 'breaking' || item.title.includes('속보'));
      } else if (activeFilter === 'today') {
        if (newsData.length > 0) {
          const sorted = [...newsData].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          const newestDateStr = sorted[0].timestamp.slice(0, 10);
          result = result.filter(item => item.timestamp.startsWith(newestDateStr));
        }
      } else if (activeFilter === 'duration30') {
        result = result.filter(item => parseDurationToMinutes(item.duration) >= 30);
      } else if (activeFilter === 'kr') {
        result = result.filter(item => item.region === 'KR');
      } else if (activeFilter === 'global') {
        result = result.filter(item => item.region === 'Global');
      } else if (activeFilter === 'docu') {
        result = result.filter(item => item.type === 'docu' || item.title.includes('다큐'));
      }
    }

    // 2. Text Search Input
    if (searchQuery) {
      const cleanQuery = searchQuery.trim().toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(cleanQuery) || 
        item.description.toLowerCase().includes(cleanQuery) || 
        item.tags.some(tag => tag.toLowerCase().includes(cleanQuery))
      );
    }

    // 3. Broadcaster Dropdown Selection
    if (selectedBroadcaster !== 'all') {
      result = result.filter(item => item.channel === selectedBroadcaster);
    }

    // 4. Period Dropdown Selection
    if (selectedPeriod !== 'all') {
      const now = new Date();
      result = result.filter(item => {
        const itemDate = new Date(item.timestamp);
        const diffMs = now - itemDate;
        if (selectedPeriod === '24h') {
          return diffMs <= 24 * 60 * 60 * 1000;
        } else if (selectedPeriod === '1w') {
          return diffMs <= 7 * 24 * 60 * 60 * 1000;
        } else if (selectedPeriod === '1m') {
          return diffMs <= 30 * 24 * 60 * 60 * 1000;
        }
        return true;
      });
    }

    // 5. Sorting Engine
    if (selectedSort === 'views') {
      result.sort((a, b) => b.views - a.views);
    } else if (selectedSort === 'likes') {
      result.sort((a, b) => b.likes - a.likes);
    } else if (selectedSort === 'date') {
      result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (selectedSort === 'growth') {
      result.sort((a, b) => b.growthRate - a.growthRate);
    } else {
      result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    renderNewsCards(result);
  }

  // Trigger quick tags click listeners
  document.querySelectorAll('.quick-filter-wrapper .filter-tag-btn').forEach(tagBtn => {
    tagBtn.addEventListener('click', () => {
      const filterValue = tagBtn.getAttribute('data-filter');
      
      if (filterValue === 'reset') {
        // Reset state
        activeFilter = 'all';
        searchQuery = '';
        selectedBroadcaster = 'all';
        selectedPeriod = '1m';
        selectedSort = 'default';
        
        // Sync UI inputs
        searchInput.value = '';
        selectBroadcaster.value = 'all';
        selectPeriod.value = '1m';
        selectSort.value = 'default';

        // Re-active "전체" button
        document.querySelectorAll('.quick-filter-wrapper .filter-tag-btn').forEach(btn => btn.classList.remove('active'));
        const allBtn = document.querySelector('.quick-filter-wrapper .filter-tag-btn[data-filter="all"]');
        if (allBtn) allBtn.classList.add('active');
      } else {
        // Normal tag filter toggle
        document.querySelectorAll('.quick-filter-wrapper .filter-tag-btn').forEach(btn => btn.classList.remove('active'));
        tagBtn.classList.add('active');
        activeFilter = filterValue;
      }
      
      applyFilters();
    });
  });

  // Search execution
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      applyFilters();
    });
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchQuery = e.target.value;
        applyFilters();
      }
    });
  }
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      searchQuery = searchInput.value;
      applyFilters();
    });
  }

  // Dropdown change listeners
  if (selectBroadcaster) {
    selectBroadcaster.addEventListener('change', (e) => {
      selectedBroadcaster = e.target.value;
      applyFilters();
    });
  }
  if (selectPeriod) {
    selectPeriod.addEventListener('change', (e) => {
      selectedPeriod = e.target.value;
      applyFilters();
    });
  }
  if (selectSort) {
    selectSort.addEventListener('change', (e) => {
      selectedSort = e.target.value;
      applyFilters();
    });
  }

  // Layout switching trigger
  document.querySelectorAll('.layout-toggle-wrapper .layout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.layout-toggle-wrapper .layout-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const newLayout = btn.getAttribute('data-layout');
      activeLayout = newLayout;

      // Update container layout classes
      if (newsCardsContainer) {
        newsCardsContainer.className = `news-cards-container layout-${newLayout}`;
      }
      
      applyFilters();
    });
  });

  // Primary Tabs Navigation Toggles (News, Analysis, Statistics)
  const tabPanels = {
    'news-view': document.getElementById('tab-news-view'),
    'analysis-view': document.getElementById('tab-analysis-view'),
    'stats-view': document.getElementById('tab-stats-view')
  };

  function switchPrimaryTab(targetTabId) {
    // 1. Sync button states in left and right blocks
    document.querySelectorAll('.nav-tab-btn, .nav-tab-icon-btn').forEach(btn => {
      const target = btn.getAttribute('data-target');
      if (target === targetTabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 2. Hide all and show target panel
    Object.keys(tabPanels).forEach(key => {
      const panel = tabPanels[key];
      if (panel) {
        if (key === targetTabId) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      }
    });

    // 3. Post-switch render tasks
    if (targetTabId === 'analysis-view') {
      renderAnalysisCharts();
    } else if (targetTabId === 'stats-view') {
      renderStatisticsTable();
    }
  }

  document.querySelectorAll('.nav-tab-btn, .nav-tab-icon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      switchPrimaryTab(target);
    });
  });

  // Tab 2: Render Analysis Dashboard Charts
  function renderAnalysisCharts() {
    // A. Keywords Word Cloud (Real-time dynamic analysis)
    const wordcloud = document.querySelector('.keywords-cloud-container');
    if (wordcloud) {
      const tagCounts = {};
      newsData.forEach(item => {
        if (item.tags && Array.isArray(item.tags)) {
          item.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });
      // Sort and pick top 15
      const sortedTags = Object.entries(tagCounts)
        .map(([text, count]) => ({ text, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);
      
      if (sortedTags.length === 0) {
        wordcloud.innerHTML = `<span style="color:var(--text-muted); font-size:0.85rem;">실시간 수집된 키워드가 없습니다.</span>`;
      } else {
        const maxCount = sortedTags[0].count;
        wordcloud.innerHTML = sortedTags.map(kw => {
          let sizeClass = 'size-sm';
          const ratio = kw.count / maxCount;
          if (ratio > 0.7) sizeClass = 'size-lg';
          else if (ratio > 0.3) sizeClass = 'size-md';
          return `<a href="#" class="keyword-tag ${sizeClass}" data-word="${kw.text}">${kw.text}</a>`;
        }).join('');

        // Add click handler to keyword tags to perform auto-search
        wordcloud.querySelectorAll('.keyword-tag').forEach(tag => {
          tag.addEventListener('click', (e) => {
            e.preventDefault();
            const word = tag.getAttribute('data-word');
            
            // Set inputs
            searchQuery = word;
            searchInput.value = word;
            
            // Switch to News tab
            switchPrimaryTab('news-view');
            
            // Trigger filter
            applyFilters();
          });
        });
      }
    }

    // B. Broadcaster Share Chart (Proportional Flex Bars - Real-time dynamic analysis)
    const shareChartTrack = document.querySelector('.share-chart-track');
    const shareChartLegends = document.querySelector('.share-chart-legends');
    if (shareChartTrack && shareChartLegends) {
      const counts = {};
      newsData.forEach(item => {
        counts[item.channel] = (counts[item.channel] || 0) + 1;
      });
      const total = newsData.length || 1;
      const shares = Object.entries(counts)
        .map(([channel, count]) => ({
          label: channel,
          pct: Math.round((count / total) * 100),
          colorClass: brandColors[channel] || 'color-others'
        }))
        .sort((a, b) => b.pct - a.pct);
      
      // Limit to top 5 and group rest into '기타'
      let displayShares = shares.slice(0, 5);
      if (shares.length > 5) {
        const otherPct = shares.slice(5).reduce((acc, cur) => acc + cur.pct, 0);
        if (otherPct > 0) {
          displayShares.push({ label: "기타", pct: otherPct, colorClass: "color-others" });
        }
      }

      shareChartTrack.innerHTML = displayShares.map(s => `
        <div class="share-bar ${s.colorClass}" style="width: ${s.pct}%;" title="${s.label} (${s.pct}%)"></div>
      `).join('');

      shareChartLegends.innerHTML = displayShares.map(s => `
        <div class="legend-item">
          <div class="legend-color-dot ${s.colorClass}"></div>
          <span>${s.label}: <strong>${s.pct}%</strong></span>
        </div>
      `).join('');
    }

    // C. Duration Segment Chart (Real-time dynamic analysis)
    const barChartContainer = document.querySelector('.bar-chart-container');
    if (barChartContainer) {
      let under5 = 0;
      let range5to15 = 0;
      let range15to30 = 0;
      let over30 = 0;
      newsData.forEach(item => {
        const mins = parseDurationToMinutes(item.duration);
        if (mins < 5) under5++;
        else if (mins < 15) range5to15++;
        else if (mins < 30) range15to30++;
        else over30++;
      });
      const total = newsData.length || 1;
      const pctUnder5 = Math.round((under5 / total) * 100);
      const pct5to15 = Math.round((range5to15 / total) * 100);
      const pct15to30 = Math.round((range15to30 / total) * 100);
      const pctOver30 = Math.round((over30 / total) * 100);

      barChartContainer.innerHTML = `
        <div class="bar-chart-bar" style="--height: ${pctUnder5}%;" data-label="5분 미만"><span class="bar-val">${pctUnder5}%</span></div>
        <div class="bar-chart-bar" style="--height: ${pct5to15}%;" data-label="5분 - 15분"><span class="bar-val">${pct5to15}%</span></div>
        <div class="bar-chart-bar" style="--height: ${pct15to30}%;" data-label="15분 - 30분"><span class="bar-val">${pct15to30}%</span></div>
        <div class="bar-chart-bar" style="--height: ${pctOver30}%;" data-label="30분 이상"><span class="bar-val">${pctOver30}%</span></div>
      `;
    }

    // D. Live Streams Breakdown (Real-time dynamic analysis)
    const liveProgressList = document.querySelector('.live-progress-list');
    if (liveProgressList) {
      const channelStats = {};
      newsData.forEach(item => {
        if (!channelStats[item.channel]) {
          channelStats[item.channel] = { total: 0, live: 0 };
        }
        channelStats[item.channel].total++;
        if (item.type === 'live' || item.title.includes('LIVE') || item.title.includes('라이브')) {
          channelStats[item.channel].live++;
        }
      });

      const liveShares = Object.entries(channelStats)
        .map(([channel, stats]) => ({
          label: channel,
          pct: Math.round((stats.live / stats.total) * 100)
        }))
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 4); // Display top 4

      liveProgressList.innerHTML = liveShares.map(s => `
        <div class="live-progress-row">
          <span class="row-label">${s.label}</span>
          <div class="progress-bar-wrapper"><div class="progress-bar-fill" style="width: ${s.pct}%;"></div></div>
          <span class="row-pct">${s.pct}%</span>
        </div>
      `).join('');
    }
  }

  // Tab 3: Render Statistics KPI & Comparison Table
  function renderStatisticsTable() {
    const statsTableBody = document.getElementById('stats-table-body');
    if (!statsTableBody) return;

    const tableData = [
      { name: "SBS 뉴스", sub: "3.2M명", count: 12450, views: "840회", growth: "6.3%", live: true },
      { name: "JTBC News", sub: "2.1M명", count: 9840, views: "710회", growth: "4.8%", live: false },
      { name: "MBCNEWS", sub: "2.8M명", count: 11200, views: "650회", growth: "4.1%", live: true },
      { name: "YTN", sub: "3.9M명", count: 18450, views: "580회", growth: "5.4%", live: true },
      { name: "KBS News", sub: "2.5M명", count: 10400, views: "490회", growth: "3.2%", live: false },
      { name: "연합뉴스TV", sub: "1.8M명", count: 8700, views: "410회", growth: "1.5%", live: true },
      { name: "채널A", sub: "1.2M명", count: 5400, views: "320회", growth: "4.8%", live: false }
    ];

    statsTableBody.innerHTML = tableData.map(row => `
      <tr>
        <td><strong>${row.name}</strong></td>
        <td>${row.sub}</td>
        <td>${row.count.toLocaleString()}개</td>
        <td>${row.views}</td>
        <td style="color:#10b981; font-weight:700;">${row.growth}</td>
        <td>
          <span class="table-live-status-badge ${row.live ? 'on' : ''}">
            ${row.live ? '🔴 송출중' : '대기'}
          </span>
        </td>
      </tr>
    `).join('');

    // Dynamic aggregates
    const kpiViews = document.getElementById('kpi-total-views');
    const kpiActive = document.getElementById('kpi-active-lives');
    if (kpiViews) {
      const totalViewsCount = newsData.reduce((acc, cur) => acc + cur.views, 0);
      kpiViews.textContent = (totalViewsCount >= 1000 ? (totalViewsCount/1000).toFixed(1) + 'K회' : totalViewsCount + '회');
    }
    if (kpiActive) {
      const activeLivesCount = newsData.filter(item => item.type === 'live').length;
      kpiActive.textContent = `${activeLivesCount}개 채널`;
    }
  }

  // Real-time news generation simulation pool
  const freshNewsPool = [
    {
      title: "[🔴속보] 전국 개표율 98% 돌파... 주요 격전지 당선 후보 확정 임박",
      channel: "SBS 뉴스",
      region: "KR",
      type: "breaking",
      duration: "3:45",
      views: 1200,
      likes: 54,
      comments: 2,
      growthRate: 12.4,
      tags: ["#개표속보", "#지방선거", "#당선확정", "#격전지"],
      description: "전국 개표 상황 긴급 보도. 주요 핵심 격전지 부동표의 최종 선택에 따른 판세 분석 결과.",
      thumbGradient: "linear-gradient(135deg, #172554, #be123c)",
      videoId: "ve-hmicTjg0"
    },
    {
      title: "[속보] 국과수·경찰 화약 세척공장 폭발 현장 2차 합동 감식 브리핑 발표",
      channel: "JTBC News",
      region: "KR",
      type: "breaking",
      duration: "5:12",
      views: 940,
      likes: 31,
      comments: 0,
      growthRate: 8.5,
      tags: ["#합동감식", "#국과수", "#폭발원인", "#뉴스룸"],
      description: "화약 세척 작업실 내부 잔류 가스 인화 가능성에 무게를 둔 정밀 분석 중간 보고 발표.",
      thumbGradient: "linear-gradient(135deg, #311042, #1e1b4b)",
      videoId: "NmiPB9069js"
    },
    {
      title: "[🔴LIVE] YTN 뉴스 라이브 - 스타벅스 커피값 인상 여파에 기획재정부 물가 안정 대책 논의",
      channel: "YTN",
      region: "KR",
      type: "live",
      duration: "LIVE",
      views: 89000,
      likes: 2100,
      comments: 340,
      growthRate: 4.8,
      tags: ["#YTN", "#물가대책", "#스타벅스", "#실시간"],
      description: "커피, 가공식품 등 주요 가공품목 중심 가격 억제 유도 방침과 기업 협조 당부 내용 중계.",
      thumbGradient: "linear-gradient(135deg, #090d16, #12005e)",
      videoId: "hI6WP9tC_yc"
    },
    {
      title: "[🔴속보] 공수처 비공개 영장 심사 종료... 법조계 \"인용 여부 오늘 밤 결정\"",
      channel: "연합뉴스TV",
      region: "KR",
      type: "breaking",
      duration: "2:40",
      views: 18000,
      likes: 412,
      comments: 56,
      growthRate: 9.3,
      tags: ["#공수처", "#영장실질심사", "#법조계", "#속보"],
      description: "핵심 피의자 신문 절차 완료. 변호인단 입장 발표 및 최종 영장 기각/인용 여부 대기 중.",
      thumbGradient: "linear-gradient(135deg, #451a03, #1e293b)",
      videoId: "yCXTRHVWRRc"
    },
    {
      title: "SpaceX Starship successfully enters planned orbit during test flight 6",
      channel: "CNN",
      region: "Global",
      type: "breaking",
      duration: "18:22",
      views: 145000,
      likes: 6700,
      comments: 890,
      growthRate: 15.6,
      tags: ["#SpaceX", "#Starship", "#Orbit", "#Telemetry", "#CNN"],
      description: "Flight controllers confirm second stage engine cut-off and nominal trajectory in low Earth orbit.",
      thumbGradient: "linear-gradient(135deg, #0f172a, #991b1b)",
      videoId: "pvoa6468XcQ"
    },
    {
      title: "CineAHO real-time search: Global chip shortages easing as local fab output rises",
      channel: "BBC",
      region: "Global",
      type: "docu",
      duration: "35:10",
      views: 29000,
      likes: 912,
      comments: 65,
      growthRate: 2.5,
      tags: ["#CineAHO", "#semiconductor", "#shortage", "#tech", "#docu"],
      description: "Special documentary tracking industrial supply chains and local silicon fab expansions in Asia.",
      thumbGradient: "linear-gradient(135deg, #0f172a, #0d9488)",
      videoId: "mmHij2a151M"
    }
  ];

  // Helper function to show Toast notification
  function showNewsToast(newsTitle) {
    let toast = document.querySelector('.news-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'news-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `
      <div class="toast-icon"><i class="fa-solid fa-circle-exclamation"></i></div>
      <div class="toast-body">
        <strong>CineAHO 실시간 조사 감지</strong>
        <span>${newsTitle}</span>
      </div>
    `;
    toast.classList.remove('show');
    // Force reflow
    void toast.offsetWidth;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }

  // Curated Count animation
  let baseCuratedCount = 59143;
  const curatedCountSpan = document.getElementById('curated-count-glow');

  // Real-time loop (runs every 10 seconds)
  let freshIdCounter = 100;
  const realTimeInterval = setInterval(() => {
    // Pick a random news template
    const template = freshNewsPool[Math.floor(Math.random() * freshNewsPool.length)];
    
    // Generate fresh item details
    const now = new Date();
    const itemDateStr = now.toISOString().slice(0, 19);
    
    const newItem = {
      ...template,
      id: freshIdCounter++,
      timestamp: itemDateStr,
      timeDisplay: formatNewsTimestamp(now)
    };

    // Prepend to database
    newsData.unshift(newItem);
    if (newsData.length > 100) {
      newsData = newsData.slice(0, 100);
    }
    saveNewsToStorage();
    
    // Update count in Hero Banner
    baseCuratedCount += 1;
    if (curatedCountSpan) {
      curatedCountSpan.textContent = baseCuratedCount.toLocaleString();
    }
    
    // Trigger toast notification
    showNewsToast(newItem.title);
    
    // Re-filter list dynamically
    applyFilters();
    
    // If stats tab is currently open, refresh stats table
    const statsTab = document.getElementById('tab-stats-view');
    if (statsTab && statsTab.classList.contains('active')) {
      renderStatisticsTable();
    }

    // If analysis tab is currently open, refresh analysis charts in real-time
    const analysisTab = document.getElementById('tab-analysis-view');
    if (analysisTab && analysisTab.classList.contains('active')) {
      renderAnalysisCharts();
    }
  }, 10000); // 10 seconds interval

  // Open News Detail Modal with mockup video player
  function openNewsDetailModal(item) {
    const colorClass = brandColors[item.channel] || 'color-others';
    const regionBadgeHtml = getRegionTag(item.region);
    
    const mockComments = [
      { author: "콘텐츠마스터", time: "3시간 전", text: "실시간 정보 큐레이션 정말 빠르네요. 유익하게 보고 갑니다!" },
      { author: "TechVibe", time: "5시간 전", text: "CineAHO 분석 시스템 정보력이 확실히 남다르네요. 분석 내용 잘 짚어주셨습니다." }
    ];
    
    const html = `
      <div class="news-detail-modal-container">
        <!-- Real Video Player (with Sound Enabled) -->
        <div class="mock-player-wrapper" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); background: #000; margin-bottom: 1.5rem;">
          <iframe 
            src="https://www.youtube.com/embed/${item.videoId}?autoplay=1&mute=0&enablejsapi=1" 
            title="${item.title}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;">
          </iframe>
        </div>

        <!-- News Info -->
        <div class="news-detail-meta" style="margin-top: 1.5rem;">
          <div class="news-item-channel-line" style="margin-bottom: 0.75rem;">
            <div class="news-channel-avatar ${colorClass}"></div>
            <span class="news-channel-name" style="font-weight: 700; font-size: 1rem; color: #fff;">${item.channel}</span>
            ${regionBadgeHtml}
          </div>
          <h2 class="news-detail-title" style="font-family: 'Outfit', 'Noto Sans KR', sans-serif; font-size: 1.25rem; font-weight: 800; color: #fff; line-height: 1.4; margin-bottom: 0.75rem;">${item.title}</h2>
          
          <div class="news-detail-stats" style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.25rem; display: flex; gap: 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.75rem;">
            <span>조회수 <strong>${item.views.toLocaleString()}회</strong></span>
            <span>추천 <strong>${item.likes.toLocaleString()}개</strong></span>
            <span>게시일 <strong>${item.timeDisplay}</strong></span>
          </div>

          <!-- Description Box -->
          <div class="news-detail-desc-box" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
            <h4 style="font-size: 0.88rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;"><i class="fa-solid fa-align-left text-blue"></i> 영상 상세 정보</h4>
            <p style="font-size: 0.85rem; line-height: 1.6; color: rgba(255,255,255,0.8); margin: 0; white-space: pre-wrap;">${item.description}</p>
            <div class="news-item-tags" style="margin-top: 1rem;">
              ${item.tags.map(t => `<a href="#" class="modal-tag-link" data-tag="${t}">${t}</a>`).join(' ')}
            </div>
          </div>

          <!-- AI Insights -->
          <div class="news-detail-ai-box" style="background: linear-gradient(135deg, rgba(99,102,241,0.05), rgba(236,72,153,0.05)); border: 1px solid rgba(99,102,241,0.15); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
            <h4 style="font-size: 0.88rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.35rem;">
              <i class="fa-solid fa-wand-magic-sparkles text-purple"></i> CineAHO AI 실시간 분석 리포트
            </h4>
            <div class="ai-report-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem; margin-top: 0.75rem;">
              <div class="ai-report-card" style="background: rgba(0,0,0,0.2); border-radius: 6px; padding: 0.5rem; text-align: center;">
                <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">분석 센티멘트</span>
                <strong style="color: #10b981; font-size: 0.9rem;">긍정·중립 (88%)</strong>
              </div>
              <div class="ai-report-card" style="background: rgba(0,0,0,0.2); border-radius: 6px; padding: 0.5rem; text-align: center;">
                <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">실시간 전파 속도</span>
                <strong style="color: #ec4899; font-size: 0.9rem;">↗ ${item.growthRate}% / 분</strong>
              </div>
              <div class="ai-report-card" style="background: rgba(0,0,0,0.2); border-radius: 6px; padding: 0.5rem; text-align: center;">
                <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">핵심 카테고리</span>
                <strong style="color: #06b6d4; font-size: 0.9rem;">${item.type === 'live' ? '라이브 속보' : item.type === 'docu' ? '시사/다큐' : '일반 시사'}</strong>
              </div>
            </div>
          </div>

          <!-- Comments section -->
          <div class="news-detail-comments">
            <h4 style="font-size: 0.88rem; font-weight: 700; color: #fff; margin-bottom: 1rem;"><i class="fa-solid fa-comments text-orange"></i> 실시간 시청자 반응 (2)</h4>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${mockComments.map(c => `
                <div style="display: flex; gap: 0.75rem; background: rgba(255,255,255,0.01); border-radius: 6px; padding: 0.5rem 0.75rem;">
                  <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: #fff;"><i class="fa-solid fa-user"></i></div>
                  <div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <span style="font-size: 0.78rem; font-weight: 600; color: #fff;">${c.author}</span>
                      <span style="font-size: 0.65rem; color: var(--text-muted);">${c.time}</span>
                    </div>
                    <p style="font-size: 0.78rem; color: rgba(255,255,255,0.85); margin: 0.2rem 0 0 0;">${c.text}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>
      </div>
    `;
    
    openModal('뉴스 속보 & 분석 정보', html);
    
    // Add tag click listeners inside modal
    const modalContent = document.getElementById('modal-body-content');
    if (modalContent) {
      modalContent.querySelectorAll('.modal-tag-link').forEach(tagLink => {
        tagLink.addEventListener('click', (e) => {
          e.preventDefault();
          const tagValue = tagLink.getAttribute('data-tag');
          closeModal();
          
          // Set inputs
          searchQuery = tagValue;
          searchInput.value = tagValue;
          
          // Switch to News tab
          switchPrimaryTab('news-view');
          
          // Trigger filter
          applyFilters();
        });
      });
    }
  }

  // Delegated click listener on cards to open detail modal
  newsCardsContainer.addEventListener('click', (e) => {
    const card = e.target.closest('.news-item-card');
    if (!card) return;
    
    const id = parseInt(card.getAttribute('data-id'));
    const item = newsData.find(x => x.id === id);
    if (!item) return;
    
    openNewsDetailModal(item);
  });

  // --- Real-time Scheduled Update Engine ---
  const btnRealtimeUpdate = document.getElementById('btn-realtime-update');
  const iconUpdate = document.getElementById('icon-update');
  const lblLastUpdate = document.getElementById('lbl-last-update');
  const lblNextUpdate = document.getElementById('lbl-next-update');

  // Define target hours
  const scheduleHours = [9, 13, 22];

  function getScheduleWindows(now) {
    const dates = [];
    
    // Yesterday's schedules
    scheduleHours.forEach(h => {
      const d = new Date(now);
      d.setDate(now.getDate() - 1);
      d.setHours(h, 0, 0, 0);
      dates.push(d);
    });
    
    // Today's schedules
    scheduleHours.forEach(h => {
      const d = new Date(now);
      d.setHours(h, 0, 0, 0);
      dates.push(d);
    });
    
    // Tomorrow's schedules
    scheduleHours.forEach(h => {
      const d = new Date(now);
      d.setDate(now.getDate() + 1);
      d.setHours(h, 0, 0, 0);
      dates.push(d);
    });
    
    // Sort all dates
    dates.sort((a, b) => a - b);
    
    // Find last schedule that passed
    let lastSchedule = null;
    let nextSchedule = null;
    for (let i = 0; i < dates.length; i++) {
      if (dates[i] <= now) {
        lastSchedule = dates[i];
      }
      if (dates[i] > now && !nextSchedule) {
        nextSchedule = dates[i];
      }
    }
    
    return { lastSchedule, nextSchedule };
  }

  function formatScheduleTime(d) {
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const hours = d.getHours();
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHour = hours % 12 || 12;
    return `${month}/${date} ${ampm} ${displayHour}:00`;
  }

  function formatTimeHHMM(d) {
    const hours = d.getHours();
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHour = hours % 12 || 12;
    return `${ampm} ${displayHour}:00`;
  }

  let nextUpdateTargetTime = null;

  function initUpdateSchedule() {
    const now = new Date();
    const { lastSchedule, nextSchedule } = getScheduleWindows(now);
    nextUpdateTargetTime = nextSchedule;

    // Display schedule labels
    if (lblLastUpdate) {
      lblLastUpdate.textContent = `업데이트 완료: ${formatScheduleTime(lastSchedule)}`;
    }
    if (lblNextUpdate) {
      lblNextUpdate.textContent = `자동 업데이트 예정: ${formatScheduleTime(nextSchedule)}`;
    }

    // Check if we need to auto-update on page load
    const lastSavedUpdate = localStorage.getItem('cineaho_last_news_update');
    const lastSavedTime = lastSavedUpdate ? parseInt(lastSavedUpdate) : 0;

    // If last saved time is before the last schedule time, it means we crossed a schedule boundary since last view!
    if (lastSavedTime < lastSchedule.getTime()) {
      // Perform automatic schedule update
      triggerAutoScheduledUpdate(lastSchedule);
    }
  }

  function triggerAutoScheduledUpdate(scheduleTime) {
    // Generate 2 new news items representing the update
    const count = 2;
    for (let i = 0; i < count; i++) {
      const template = freshNewsPool[Math.floor(Math.random() * freshNewsPool.length)];
      const itemDateStr = scheduleTime.toISOString().slice(0, 19);
      
      const newItem = {
        ...template,
        id: freshIdCounter++,
        timestamp: itemDateStr,
        timeDisplay: formatNewsTimestamp(scheduleTime)
      };
      newsData.unshift(newItem);
    }
    
    if (newsData.length > 100) {
      newsData = newsData.slice(0, 100);
    }
    saveNewsToStorage();
    
    // Update base counter
    baseCuratedCount += count;
    if (curatedCountSpan) {
      curatedCountSpan.textContent = baseCuratedCount.toLocaleString();
    }

    localStorage.setItem('cineaho_last_news_update', scheduleTime.getTime());

    // Show schedule toast
    setTimeout(() => {
      showNewsToast(`[CineAHO 정기 업데이트 완료] ${formatTimeHHMM(scheduleTime)} 뉴스 & 다큐 수집 완료`);
    }, 1500);
  }

  // Background checker for automatic scheduled updates
  setInterval(() => {
    if (!nextUpdateTargetTime) return;
    const now = new Date();
    if (now >= nextUpdateTargetTime) {
      // Trigger automatic update!
      triggerAutoScheduledUpdate(nextUpdateTargetTime);
      
      // Re-initialize schedules
      initUpdateSchedule();
      
      // Re-filter list
      applyFilters();
      
      // If stats tab is open, refresh table
      const statsTab = document.getElementById('tab-stats-view');
      if (statsTab && statsTab.classList.contains('active')) {
        renderStatisticsTable();
      }
    }
  }, 30000); // Check every 30 seconds

  // Manual Update click handler
  if (btnRealtimeUpdate) {
    let isUpdating = false;
    btnRealtimeUpdate.addEventListener('click', () => {
      if (isUpdating) return;
      isUpdating = true;
      
      // Button loading state
      btnRealtimeUpdate.disabled = true;
      const textSpan = btnRealtimeUpdate.querySelector('span');
      if (textSpan) textSpan.textContent = '업데이트 중...';
      if (iconUpdate) iconUpdate.classList.add('spinning-icon');
      
      // Simulate API fetch delay
      setTimeout(() => {
        // Add 2 new manual update news items
        const now = new Date();
        for (let i = 0; i < 2; i++) {
          const template = freshNewsPool[Math.floor(Math.random() * freshNewsPool.length)];
          const itemDateStr = now.toISOString().slice(0, 19);
          
          const newItem = {
            ...template,
            id: freshIdCounter++,
            timestamp: itemDateStr,
            timeDisplay: formatNewsTimestamp(now)
          };
          newsData.unshift(newItem);
        }
        
        if (newsData.length > 100) {
          newsData = newsData.slice(0, 100);
        }
        saveNewsToStorage();
        
        baseCuratedCount += 2;
        if (curatedCountSpan) {
          curatedCountSpan.textContent = baseCuratedCount.toLocaleString();
        }
        
        // Update local storage last update to current time
        localStorage.setItem('cineaho_last_news_update', now.getTime());
        
        // Update label
        if (lblLastUpdate) {
          const hours = now.getHours();
          const minutes = now.getMinutes().toString().padStart(2, '0');
          const ampm = hours >= 12 ? '오후' : '오전';
          const displayHour = hours % 12 || 12;
          lblLastUpdate.textContent = `업데이트 완료: 오늘 ${ampm} ${displayHour}:${minutes} (수동)`;
        }
        
        // Apply filters
        applyFilters();
        
        // If stats tab is currently open, refresh stats table
        const statsTab = document.getElementById('tab-stats-view');
        if (statsTab && statsTab.classList.contains('active')) {
          renderStatisticsTable();
        }

        // If analysis tab is currently open, refresh analysis charts in real-time
        const analysisTab = document.getElementById('tab-analysis-view');
        if (analysisTab && analysisTab.classList.contains('active')) {
          renderAnalysisCharts();
        }
        
        // Show success toast
        showNewsToast('수동 실시간 뉴스 & 다큐 업데이트 완료! (+2건 수집)');
        
        // Restore button state
        if (textSpan) textSpan.textContent = '업데이트 완료';
        if (iconUpdate) iconUpdate.classList.remove('spinning-icon');
        
        setTimeout(() => {
          if (textSpan) textSpan.textContent = '실시간 업데이트';
          btnRealtimeUpdate.disabled = false;
          isUpdating = false;
        }, 1500);
      }, 1200);
    });
  }

  // Initialize schedule tracking
  initUpdateSchedule();

  // Initial dashboard load execution
  applyFilters();
}

// ==========================================
// CineAHO Creator Hub Notices & AI Chatbot
// ==========================================

// 1. notice buttons click handlers
const btnNoticeWhois = document.getElementById('btn-notice-whois');
if (btnNoticeWhois) {
  btnNoticeWhois.addEventListener('click', () => {
    const html = `
      <div style="text-align: left; line-height: 1.7;">
        <h4 style="font-size: 1.1rem; color: #ec4899; margin-bottom: 1rem;"><i class="fa-solid fa-graduation-cap"></i> 크리에이터 CineAHO는 누구인가?</h4>
        <p><strong>크리에이터 CineAHO(CineAHO Insight)</strong>는 20년 경력의 의료, 바이오 전문가로서 블로그, 유튜브를 운영하며 의료, 바이오 정보를 제공하고 있습니다.</p>
        <ul style="margin-top: 0.8rem; padding-left: 1.25rem; color: var(--text-muted); font-size: 0.85rem;">
          <li>의료, 바이오 박사급 전문가</li>
          <li>생성형 AI 결합을 활용한 의료, 건강관리, 바이오 관련 콘텐츠 및 파이프라인 설계 전문가</li>
          <li>통합 도구 허브 제작 관리 및 신규 분석 앱 개발자, AI, 바이오 경제, 경영 연구 분석 전문가</li>
        </ul>
      </div>
    `;
    openModal('크리에이터 CineAHO Profile', html);
  });
}

const btnNoticeUpdate = document.getElementById('btn-notice-update');
if (btnNoticeUpdate) {
  btnNoticeUpdate.addEventListener('click', () => {
    const html = `
      <div style="text-align: left; line-height: 1.7;">
        <h4 style="font-size: 1.1rem; color: #3b82f6; margin-bottom: 1rem;"><i class="fa-solid fa-bullhorn"></i> 실시간 업데이트 및 공지사항</h4>
        <div style="max-height: 250px; overflow-y: auto; padding-right: 0.5rem;">
          <ul style="display: flex; flex-direction: column; gap: 0.75rem; list-style: none; padding: 0;">
            <li style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
              <span style="font-size: 0.7rem; color: #3b82f6; font-weight: 700;">[2026-06-04]</span>
              <p style="font-size: 0.85rem; margin-top: 0.15rem;">메인 포털 및 크리에이터 도구 허브 대규모 개편 완료! 15개의 실시간 도구 바로가기 연동 및 하단 안내 기능이 추가되었습니다.</p>
            </li>
            <li style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
              <span style="font-size: 0.7rem; color: #10b981; font-weight: 700;">[2026-06-02]</span>
              <p style="font-size: 0.85rem; margin-top: 0.15rem;">실시간 뉴스 분석 채널에 YTN, MBC, SBS 등 10개 방송사 라이브 속보 수집 파이프라인 점검 및 모듈 최적화 작업이 완료되었습니다.</p>
            </li>
            <li>
              <span style="font-size: 0.7rem; color: #a855f7; font-weight: 700;">[2026-05-28]</span>
              <p style="font-size: 0.85rem; margin-top: 0.15rem;">유튜브 수익 계산기 및 쿠팡 파트너스 제휴마케팅 수익 역산기 알고리즘 업데이트가 적용되었습니다.</p>
            </li>
          </ul>
        </div>
      </div>
    `;
    openModal('공지사항 및 업데이트 로그', html);
  });
}

// 2. CineAHO AI Mentor chat dialog mockup
const btnCineahoMentor = document.getElementById('btn-cineaho-mentor');
if (btnCineahoMentor) {
  btnCineahoMentor.addEventListener('click', () => {
    const html = `
      <div class="cineaho-chat-container" style="display: flex; flex-direction: column; height: 400px; text-align: left;">
        <div class="cineaho-chat-header" style="padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-muted);">
          <i class="fa-solid fa-circle" style="color: #10b981; font-size: 0.5rem; animation: pulse 1s infinite alternate;"></i> <span>실시간 AI 멘토 온라인</span>
        </div>
        
        <!-- Chat log -->
        <div id="cineaho-chat-log" style="flex-grow: 1; overflow-y: auto; padding: 1rem 0; display: flex; flex-direction: column; gap: 0.75rem;">
          <div class="chat-msg msg-ai" style="display: flex; gap: 0.5rem; max-width: 85%;">
            <div class="chat-avatar" style="width: 32px; height: 32px; border-radius: 50%; background: var(--grad-blue); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.8rem; flex-shrink: 0;"><i class="fa-solid fa-robot"></i></div>
            <div class="chat-bubble" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); padding: 0.65rem 0.85rem; border-radius: 4px 16px 16px 16px; font-size: 0.82rem; line-height: 1.5;">
              안녕하세요! 의료·바이오 전문 AI 멘토 <strong>CineAHO Insight</strong>입니다. 의료, 건강관리, 바이오 기술 및 관련 분석 앱에 관해 질문해 주시면 20년 연구 노하우를 기반으로 즉시 답변해 드릴게요!
            </div>
          </div>
        </div>
        
        <!-- Input section -->
        <div class="cineaho-chat-input-bar" style="display: flex; gap: 0.5rem; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.75rem;">
          <input type="text" id="cineaho-input" placeholder="질문 내용을 입력하세요 (예: 쇼츠 알고리즘 태그, CPM 높이는 법)..." style="flex-grow: 1; padding: 0.65rem 1rem; border-radius: 30px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.05); color: #fff; outline: none; font-size: 0.82rem; transition: border-color 0.2s;" onkeypress="handleCineahoKeyPress(event)">
          <button class="btn btn-blue-grad" style="padding: 0.65rem 1.25rem; border-radius: 30px; font-size: 0.82rem; font-weight: 700; cursor: pointer; color: #fff;" onclick="sendCineahoMessage()"><i class="fa-solid fa-paper-plane"></i> 전송</button>
        </div>
      </div>
    `;
    openModal('AI 에이전트 크리에이터 멘토링', html);
  });
}

// Global functions for CineAHO chatbot interaction
window.handleCineahoKeyPress = function(e) {
  if (e.key === 'Enter') {
    sendCineahoMessage();
  }
};

window.sendCineahoMessage = function() {
  const input = document.getElementById('cineaho-input');
  const chatLog = document.getElementById('cineaho-chat-log');
  if (!input || !chatLog) return;
  
  const text = input.value.trim();
  if (!text) return;
  
  // 1. Add User Message
  const userMsgDiv = document.createElement('div');
  userMsgDiv.className = 'chat-msg msg-user';
  userMsgDiv.style.cssText = 'display: flex; gap: 0.5rem; max-width: 85%; align-self: flex-end; flex-direction: row-reverse;';
  userMsgDiv.innerHTML = `
    <div class="chat-avatar" style="width: 32px; height: 32px; border-radius: 50%; background: var(--grad-purple); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.8rem; flex-shrink: 0;"><i class="fa-solid fa-user"></i></div>
    <div class="chat-bubble" style="background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.2); padding: 0.65rem 0.85rem; border-radius: 16px 4px 16px 16px; font-size: 0.82rem; line-height: 1.5; color: #fff;">
      ${text}
    </div>
  `;
  chatLog.appendChild(userMsgDiv);
  
  // Clear input
  input.value = '';
  chatLog.scrollTop = chatLog.scrollHeight;
  
  // 2. Add Typing Indicator dots
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-msg msg-ai typing-dots';
  typingDiv.style.cssText = 'display: flex; gap: 0.5rem; max-width: 85%;';
  typingDiv.innerHTML = `
    <div class="chat-avatar" style="width: 32px; height: 32px; border-radius: 50%; background: var(--grad-blue); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.8rem; flex-shrink: 0;"><i class="fa-solid fa-robot"></i></div>
    <div class="chat-bubble" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); padding: 0.65rem 0.85rem; border-radius: 4px 16px 16px 16px; font-size: 0.82rem;">
      <i class="fa-solid fa-ellipsis fa-fade" style="color: var(--text-muted);"></i> 답변 분석 중...
    </div>
  `;
  chatLog.appendChild(typingDiv);
  chatLog.scrollTop = chatLog.scrollHeight;
  
  // 3. Trigger Mock Response after 1.2 seconds
  setTimeout(() => {
    // Remove typing indicator
    typingDiv.remove();
    
    // Choose responses based on query keywords
    let responseText = "좋은 질문이십니다! 의료, 바이오 연구와 AI 기술이 결합하는 헬스케어 및 콘텐츠 설계 분야에서 매우 핵심적인 주제입니다. 20년 전문가 관점에서 말씀드리면, AI를 접목한 건강 정보 및 신규 분석 모듈을 안정적으로 설계하고 운영하는 것이 핵심입니다. 추가적으로 궁금하신 점을 더 질문해 주세요!";
    if (text.includes('쇼츠') || text.includes('Shorts') || text.includes('숏폼')) {
      responseText = "쇼츠(Shorts) 전략에 관해서라면, 핵심은 **초반 3초 후킹(Hooking)**입니다. AI 에이전트를 통해 텍스트 자막 효과와 시각적 전환을 1.5초마다 배치하세요. 또한 10개 방송사 속보 키워드를 활용해 당일 인기 급상승 키워드를 제목에 조합하여 노출 비율을 극대화하는 것을 추천합니다.";
    } else if (text.includes('알고리즘') || text.includes('노출') || text.includes('추천')) {
      responseText = "알고리즘 추천 유도를 위해서는 시청자의 **만족도(Satisfaction)와 참여(Engagement)** 지표가 제일 큽니다. 좋아요, 댓글률을 올릴 수 있게 영상 말머리에 질문을 던지세요. 또한 영상의 \`data-tags\`와 메타데이터에 AI 트렌드 분석기로 필터링한 핵심 SEO 키워드를 삽입하는 것이 가점 요인입니다.";
    } else if (text.includes('수익') || text.includes('CPM') || text.includes('돈') || text.includes('쿠팡')) {
      responseText = "수익성 극대화를 위해서는 CPM 단가를 높여야 합니다. IT/테크, 금융/부업 분야가 일반 일상 브이로그 대비 RPM이 최대 10배 이상 높습니다. 더불어 쿠팡 파트너스와 같은 제휴마케팅 링크를 고정댓글에 배치하고 제휴마케팅 수익 역산기를 통해 필요한 전환율을 역계산해 목표 트래픽을 설계하세요.";
    }
    
    const replyDiv = document.createElement('div');
    replyDiv.className = 'chat-msg msg-ai';
    replyDiv.style.cssText = 'display: flex; gap: 0.5rem; max-width: 85%;';
    replyDiv.innerHTML = `
      <div class="chat-avatar" style="width: 32px; height: 32px; border-radius: 50%; background: var(--grad-blue); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.8rem; flex-shrink: 0;"><i class="fa-solid fa-robot"></i></div>
      <div class="chat-bubble" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.05); padding: 0.65rem 0.85rem; border-radius: 4px 16px 16px 16px; font-size: 0.82rem; line-height: 1.5;">
        ${responseText}
      </div>
    `;
    chatLog.appendChild(replyDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
  }, 1200);
};

