// DOM Elements for Navigation & Scroll Indicator
const scrollRing = document.getElementById('scroll-ring');
const scrollPercent = document.getElementById('scroll-percent');
const btnScrollTop = document.getElementById('btn-scroll-top');
const btnScrollBottom = document.getElementById('btn-scroll-bottom');

// SVG Ring Configuration
const radius = scrollRing.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
scrollRing.style.strokeDasharray = `${circumference} ${circumference}`;
scrollRing.style.strokeDashoffset = circumference;

// Scroll Tracker Logic
function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  
  if (docHeight <= 0) return;
  
  const pct = Math.min(100, Math.floor((scrollTop / docHeight) * 100));
  scrollPercent.textContent = `${pct}%`;
  
  // Update progress circle offset
  const offset = circumference - (pct / 100) * circumference;
  scrollRing.style.strokeDashoffset = offset;
}

window.addEventListener('scroll', updateScrollProgress);
window.addEventListener('resize', updateScrollProgress);

// Smooth Scroll Buttons
btnScrollTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

btnScrollBottom.addEventListener('click', () => {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
});

// Interactive Calculator Modals Logic
const calcModal = document.getElementById('calc-modal');
const modalTitle = document.getElementById('modal-title');
const modalBodyContent = document.getElementById('modal-body-content');
const modalCloseBtn = document.getElementById('modal-close-btn');

function openModal(title, htmlContent) {
  modalTitle.textContent = title;
  modalBodyContent.innerHTML = htmlContent;
  calcModal.classList.add('open');
}

function closeModal() {
  calcModal.classList.remove('open');
  modalBodyContent.innerHTML = '';
}

modalCloseBtn.addEventListener('click', closeModal);
calcModal.addEventListener('click', (e) => {
  if (e.target === calcModal) closeModal();
});

// Interactive 1: YouTube Channel Analyser
document.getElementById('btn-channel-analyser').addEventListener('click', () => {
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
document.getElementById('btn-revenue-calc').addEventListener('click', () => {
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
document.getElementById('btn-affiliate-calc').addEventListener('click', () => {
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

// Interactive 4: YouTuber Rank List View
document.getElementById('btn-rank-view').addEventListener('click', () => {
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

window.updateYoutuberRankings = function() {
  const category = document.getElementById('rank-category').value;
  const list = document.getElementById('rank-list');
  
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

// Initialize scroll progress check
updateScrollProgress();
