/**
 * CineAHO Health Supplement Trends Analyzer Engine
 * Core Logic & Data Controllers
 */

// Global Data Set
const SupplementData = [
  {
    rank: 1,
    name: '락토페린',
    eng: 'Lactoferrin',
    category: 'immune',
    score: 98,
    trend: 'up',
    rate: '+48.2%',
    desc: '체지방 감소와 면역 향상이라는 두 가지 기능성으로 언론의 뜨거운 관심을 한 몸에 받고 있습니다. 철분 흡수를 조절하고 강력한 항바이러스 방어벽을 구축합니다.',
    news: '식약처, 체지방 감소 유효성 락토페린 임상 연구 활발 발표',
    tags: ['다이어트', '면역 활성화', '철분 조절']
  },
  {
    rank: 2,
    name: '아쉬와간다',
    eng: 'Ashwagandha',
    category: 'fatigue',
    score: 92,
    trend: 'up',
    rate: '+35.4%',
    desc: '스트레스 호르몬인 코르티솔 수치 조절 및 천연 수면 보조제로 각광받고 있습니다. 고된 업무로 피로도가 높은 현대 젊은 직장인들의 포털 검색량이 급증했습니다.',
    news: '직장인 스트레스 완화 돕는 아쉬와간다 추출물 인기 급상승',
    tags: ['스트레스 완화', '수면 질 개선', '자율신경 조절']
  },
  {
    rank: 3,
    name: '포스트바이오틱스',
    eng: 'Postbiotics',
    category: 'gut',
    score: 88,
    trend: 'flat',
    rate: '0.0%',
    desc: '유산균 대사산물인 4세대 유산균으로, 위산과 담즙산에 파괴되지 않고 장점막까지 직접 도달하여 신속한 정장 작용과 염증성 면역 반응 제어를 수행합니다.',
    news: '유산균 시장의 대세로 떠오른 4세대 포스트바이오틱스 효능 입증',
    tags: ['4세대 유산균', '장 장벽 개선', '염증 조절']
  },
  {
    rank: 4,
    name: '글루타치온',
    eng: 'Glutathione',
    category: 'beauty',
    score: 85,
    trend: 'up',
    rate: '+18.6%',
    desc: '간에서 주로 합성되는 강력한 항산화제로, 피부 톤 미백 및 활성산소 제거 용도의 구강 점막 필름형 제형이 소셜 미디어 트렌드를 이끌고 있습니다.',
    news: '이너뷰티 필수템 글루타치온 필름 제형 판매량 150% 돌파',
    tags: ['피부 미백', '간 해독 작용', '항산화 이너뷰티']
  },
  {
    rank: 5,
    name: '콘드로이친',
    eng: 'Chondroitin',
    category: 'joint',
    score: 82,
    trend: 'down',
    rate: '-5.3%',
    desc: '연골 기질의 주요 구성 성분으로 연골 마모 방지와 관절 쿠션 역할을 돕습니다. 연령층이 높은 소비자 위주로 장기적이고 꾸준한 수요가 이어지고 있습니다.',
    news: '초고령 사회 진입에 따른 관절 활성 성분 콘드로이친 관심 집중',
    tags: ['연골 탄력', '관절 움직임 개선', '소 연골 유래']
  },
  {
    rank: 6,
    name: '아르기닌',
    eng: 'Arginine',
    category: 'fatigue',
    score: 79,
    trend: 'up',
    rate: '+12.4%',
    desc: '산화질소를 생성하여 혈관을 확장하고 전신 혈행을 돕는 아미노산입니다. 헬스 및 피트니스 인구 증가와 고함량 수어 활력 제품 출시 트렌드로 상승 기류입니다.',
    news: '운동 매니아를 위한 고함량 액상 아르기닌 음료 출시 붐',
    tags: ['운동 활력', '혈관 확장', '피로 물질 분해']
  },
  {
    rank: 7,
    name: 'MSM',
    eng: 'MSM (식이유황)',
    category: 'joint',
    score: 75,
    trend: 'flat',
    rate: '0.0%',
    desc: '관절 연골 및 결합 조직의 필수 구성 성분인 유황을 공급합니다. 염증 및 통증 유발 물질을 억제하여 퇴행성 관절 관리에 빈번히 추천됩니다.',
    news: '무릎 관절 불편함 개선 돕는 MSM 성분 복합 영양제 강세',
    tags: ['연골 연성 유지', '관절 통증 완화', '유황 영양소']
  },
  {
    rank: 8,
    name: '밀크씨슬',
    eng: 'Milk Thistle',
    category: 'fatigue',
    score: 72,
    trend: 'down',
    rate: '-2.1%',
    desc: '핵심 성분인 실리마린이 간세포 보호 및 해독 능력을 증진시킵니다. 숙취 해소 및 야근이 잦은 남성 직장인들 사이의 상설 관심 물질입니다.',
    news: '간 세포막 보호 돕는 실리마린 함량 체크 가이드 배포',
    tags: ['실리마린', '간 피로 해소', '세포 항산화']
  },
  {
    rank: 9,
    name: '저분자 콜라겐',
    eng: 'Collagen',
    category: 'beauty',
    score: 68,
    trend: 'up',
    rate: '+4.7%',
    desc: '피부 진피층의 90%를 차지하는 결합 단백질입니다. 흡수율을 극대화하기 위해 분자량을 300달톤 이하로 낮춘 저분자 피쉬 콜라겐 트렌드가 우세합니다.',
    news: '피부 보습 장벽을 세우는 흡수율 높은 저분자 콜라겐 인기',
    tags: ['피부 탄력', '수분 유지', '피쉬 콜라겐']
  },
  {
    rank: 10,
    name: '락토바실러스',
    eng: 'Lactobacillus',
    category: 'gut',
    score: 65,
    trend: 'flat',
    rate: '0.0%',
    desc: '장내 유익균을 증식시키고 유해균 억제를 돕는 가장 대중적인 프로바이오틱스 균주입니다. 질 건강 기능성 특허 균주 등 세분화된 신제품이 대세입니다.',
    news: '여성 건강 기능성 특허 락토바실러스 유산균 화제',
    tags: ['장벽 보호', '유해균 억제', '여성 특화 균주']
  }
];

// App Instance
const App = {
  state: {
    currentCategory: 'all',
    crawlerRunning: false,
    selectedGender: 'male',
    selectedAge: '20',
    selectedConcerns: []
  },

  init() {
    this.initTheme();
    this.bindEvents();
    this.startCountdown();
    this.renderTrends();
    this.renderChart();
  },

  initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) return;
    const themeIcon = themeToggleBtn.querySelector('i');
    const themeText = themeToggleBtn.querySelector('span');

    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      let newTheme = 'dark';
      if (currentTheme === 'dark') {
        newTheme = 'light';
      }
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeUI(newTheme);
    });

    function updateThemeUI(theme) {
      if (theme === 'light') {
        themeIcon.className = 'fa-solid fa-moon';
        themeText.textContent = '다크';
        themeToggleBtn.style.borderColor = 'var(--text-muted)';
      } else {
        themeIcon.className = 'fa-solid fa-sun';
        themeText.textContent = '라이트';
        themeToggleBtn.style.borderColor = 'rgba(255, 255, 255, 0.08)';
      }
    }
  },

  bindEvents() {
    // Category tabs click
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.state.currentCategory = e.target.getAttribute('data-category');
        this.renderTrends();
      });
    });

    // Run Crawler Trigger button
    document.getElementById('btn-trigger-crawler').addEventListener('click', () => {
      this.runCrawler();
    });

    // Survey Modal Controls
    const surveyModal = document.getElementById('survey-modal');
    document.getElementById('btn-open-survey').addEventListener('click', () => {
      this.resetSurvey();
      surveyModal.classList.remove('hidden');
    });

    document.getElementById('btn-close-modal').addEventListener('click', () => {
      surveyModal.classList.add('hidden');
    });

    document.getElementById('btn-close-result-modal').addEventListener('click', () => {
      surveyModal.classList.add('hidden');
    });

    // Gender selection toggle
    document.querySelectorAll('.btn-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.state.selectedGender = e.target.getAttribute('data-gender');
      });
    });

    // Concern items selection (multi-select up to 2)
    document.querySelectorAll('.check-item-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const targetCard = e.currentTarget;
        const concern = targetCard.getAttribute('data-concern');
        
        if (targetCard.classList.contains('active')) {
          targetCard.classList.remove('active');
          this.state.selectedConcerns = this.state.selectedConcerns.filter(c => c !== concern);
        } else {
          if (this.state.selectedConcerns.length >= 2) {
            alert('주요 건강 고민은 최대 2개까지만 선택할 수 있습니다.');
            return;
          }
          targetCard.classList.add('active');
          this.state.selectedConcerns.push(concern);
        }
      });
    });

    // Step navigations
    document.querySelectorAll('.btn-next-step').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const nextStepNum = e.target.closest('button').getAttribute('data-next');
        
        // Validation check for step 2 (Concerns)
        if (nextStepNum === '3' && this.state.selectedConcerns.length === 0) {
          alert('최소 1개 이상의 건강 고민을 선택해 주세요!');
          return;
        }

        this.showSurveyStep(nextStepNum);
      });
    });

    document.querySelectorAll('.btn-prev-step').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const prevStepNum = e.target.closest('button').getAttribute('data-prev');
        this.showSurveyStep(prevStepNum);
      });
    });

    // Submit Survey
    document.getElementById('btn-submit-survey').addEventListener('click', () => {
      this.generateRecommendation();
    });

    // Restart Survey
    document.getElementById('btn-restart-survey').addEventListener('click', () => {
      this.resetSurvey();
    });
  },

  // Countdown timer to next KST 09:00:00 AM
  startCountdown() {
    const timerEl = document.getElementById('countdown-timer');
    
    const updateTime = () => {
      const now = new Date();
      // KST Offset Adjustment (Korea is UTC+9)
      // Standard local time in target is already in KST
      
      const targetTime = new Date();
      targetTime.setHours(9, 0, 0, 0);

      // If it is already past 9:00 AM, the target is 9:00 AM tomorrow
      if (now.getTime() >= targetTime.getTime()) {
        targetTime.setDate(targetTime.getDate() + 1);
      }

      const diffMs = targetTime.getTime() - now.getTime();
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      const hStr = String(hours).padStart(2, '0');
      const mStr = String(minutes).padStart(2, '0');
      const sStr = String(seconds).padStart(2, '0');

      timerEl.textContent = `${hStr}시간 ${mStr}분 ${sStr}초 남음`;
    };

    updateTime();
    setInterval(updateTime, 1000);
  },

  // Log Simulation Console for Cron updates
  runCrawler() {
    if (this.state.crawlerRunning) return;
    this.state.crawlerRunning = true;

    const runBtn = document.getElementById('btn-trigger-crawler');
    const statusBadge = document.getElementById('scheduler-status');
    const logsPanel = document.getElementById('terminal-logs-panel');
    const logContent = document.getElementById('terminal-log-content');

    runBtn.disabled = true;
    runBtn.style.opacity = '0.6';
    statusBadge.textContent = '수집 중';
    statusBadge.classList.add('active-running');
    logsPanel.classList.remove('hidden');
    logContent.innerHTML = '';

    const logLines = [
      { text: '[INFO] 09:00:00 - 건강보조식품 크롤러 테스크 기동 (Cron Job Triggered)...', type: 'info' },
      { text: '[INFO] 09:00:01 - 네이버/다음 뉴스 포털 건강보조식품 검색어 실시간 스트리밍 로드...', type: 'info' },
      { text: '[INFO] 09:00:02 - 메디컬 타임즈, 약업신문 등 14개 보건의료 전문 저널 RSS 피드 스캔 시작...', type: 'info' },
      { text: '[SUCCESS] 09:00:04 - 24H 이내 등록된 134개의 신규 건강보조식품 관련 기사 수집 완료.', type: 'success' },
      { text: '[INFO] 09:00:05 - 형태소 분석기(KoNLPY NLP Engine) 가동: 영양소 고유 명사 맵 매칭 시작...', type: 'info' },
      { text: '[INFO] 09:00:07 - 성분별 언급 빈도: 락토페린(48.2% 증가), 아쉬와간다(35.4% 증가) 검출.', type: 'warn' },
      { text: '[INFO] 09:00:08 - 포털 주간 검색 인덱스 API 통신 호출 및 가중치 누적치 정합 중...', type: 'info' },
      { text: '[SUCCESS] 09:00:10 - 트렌드 지수 스코어 보드 및 등락률 재산출 성공.', type: 'success' },
      { text: '[INFO] 09:00:11 - 대시보드 인터랙티브 통계 그래프 컴포넌트 렌더링 동기화...', type: 'info' },
      { text: '[SUCCESS] 09:00:12 - 매일 오전 9시 정기 트렌드 수집 완료. 내부 데이터베이스 이중화 동기화 완료.', type: 'success' },
      { text: '[INFO] 09:00:13 - 크론 수집 데몬 대기 상태로 전환.', type: 'dim' }
    ];

    let currentLineIndex = 0;

    const logInterval = setInterval(() => {
      if (currentLineIndex < logLines.length) {
        const line = logLines[currentLineIndex];
        const p = document.createElement('p');
        p.className = `log-line log-${line.type}`;
        p.textContent = line.text;
        logContent.appendChild(p);
        logContent.scrollTop = logContent.scrollHeight;
        currentLineIndex++;
      } else {
        clearInterval(logInterval);
        
        // Randomize data slightly to show dynamic changes
        this.randomizeData();
        
        this.state.crawlerRunning = false;
        runBtn.disabled = false;
        runBtn.style.opacity = '1';
        statusBadge.textContent = '대기 중';
        statusBadge.classList.remove('active-running');
        
        // Show success alert
        setTimeout(() => {
          alert('아침 9시 기준 최신 건강보조식품 트렌드 수집 및 갱신이 시뮬레이션 완료되었습니다!');
        }, 150);
      }
    }, 450);
  },

  randomizeData() {
    SupplementData.forEach(item => {
      // randomly adjust score by -5 to +5
      const offset = Math.floor(Math.random() * 11) - 5;
      item.score = Math.max(50, Math.min(100, item.score + offset));
      
      // randomly toggle trend direction
      if (Math.random() > 0.7) {
        const directions = ['up', 'down', 'flat'];
        item.trend = directions[Math.floor(Math.random() * 3)];
        
        if (item.trend === 'up') {
          item.rate = `+${(Math.random() * 20 + 2).toFixed(1)}%`;
        } else if (item.trend === 'down') {
          item.rate = `-${(Math.random() * 10 + 1).toFixed(1)}%`;
        } else {
          item.rate = '0.0%';
        }
      }
    });

    // Sort again
    SupplementData.sort((a, b) => b.score - a.score);
    SupplementData.forEach((item, index) => {
      item.rank = index + 1;
    });

    // Update UI
    this.renderTrends();
    this.renderChart();

    // Update KPI 1
    const fastest = [...SupplementData].sort((a, b) => {
      const aVal = parseFloat(a.rate) || 0;
      const bVal = parseFloat(b.rate) || 0;
      return bVal - aVal;
    })[0];
    document.getElementById('kpi-fastest-rising').textContent = `${fastest.name} (${fastest.rate})`;
  },

  // Renders the list of trend cards based on selected filter
  renderTrends() {
    const container = document.getElementById('trends-cards-container');
    container.innerHTML = '';

    const filtered = SupplementData.filter(item => {
      if (this.state.currentCategory === 'all') return true;
      return item.category === this.state.currentCategory;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="glass-panel" style="padding: 3rem; text-align: center; color: var(--text-muted);">
          <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 1rem;"></i>
          <p>해당 카테고리에 포함된 트렌드 데이터가 없습니다.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(item => {
      // Trend Icon / Direction CSS mapping
      let dirClass = 'dir-flat';
      let dirIcon = '<i class="fa-solid fa-minus"></i>';
      if (item.trend === 'up') {
        dirClass = 'dir-up';
        dirIcon = '<i class="fa-solid fa-arrow-trend-up"></i>';
      } else if (item.trend === 'down') {
        dirClass = 'dir-down';
        dirIcon = '<i class="fa-solid fa-arrow-trend-down"></i>';
      }

      // Convert category keys to Korean Labels
      const catMap = {
        immune: '면역력 증진',
        fatigue: '피로/스트레스 해소',
        gut: '장 건강/소화기',
        joint: '관절/뼈 지탱',
        beauty: '이너뷰티/피부 건강'
      };

      const card = document.createElement('div');
      card.className = 'glass-panel trend-item-card';
      card.innerHTML = `
        <div class="rank-badge-box">
          <span class="rank-number">${item.rank}</span>
          <span class="rank-direction ${dirClass}">
            ${dirIcon} ${item.rate}
          </span>
        </div>
        <div class="card-info-content">
          <div class="card-meta-top">
            <div class="ingredient-title-row">
              <h4>${item.name}</h4>
              <span class="ingredient-eng">${item.eng}</span>
            </div>
            <span class="score-badge"><i class="fa-solid fa-bolt"></i> 트렌드 지수: ${item.score}점</span>
          </div>
          <p class="card-body-desc">${item.desc}</p>
          
          <div class="news-mention-block">
            <span class="news-lbl"><i class="fa-solid fa-magnifying-glass-chart"></i> 아침 9시 매칭 핫뉴스</span>
            <span class="news-title" title="${item.news}">${item.news}</span>
          </div>

          <div class="card-footer-tags">
            <span class="footer-tag category-tag">${catMap[item.category] || item.category}</span>
            ${item.tags.map(tag => `<span class="footer-tag">#${tag}</span>`).join('')}
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  },

  // Renders the stats bar chart
  renderChart() {
    const container = document.getElementById('custom-chart-container');
    container.innerHTML = '';

    // Take top 5 ingredients for chart representation
    const topFive = [...SupplementData].slice(0, 5);

    topFive.forEach(item => {
      const row = document.createElement('div');
      row.className = 'chart-row';
      row.innerHTML = `
        <div class="chart-row-header">
          <span class="chart-label">${item.name} (${item.eng})</span>
          <span class="chart-percent">${item.score}%</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" id="bar-${item.name}" style="width: 0%"></div>
        </div>
      `;
      container.appendChild(row);

      // Trigger width animation on next frame
      requestAnimationFrame(() => {
        const fillEl = document.getElementById(`bar-${item.name}`);
        if (fillEl) {
          fillEl.style.width = `${item.score}%`;
        }
      });
    });
  },

  // Recommender quiz navigators
  showSurveyStep(stepNum) {
    document.querySelectorAll('.survey-step').forEach(step => step.classList.add('hidden'));
    document.getElementById(`survey-step-${stepNum}`).classList.remove('hidden');
  },

  resetSurvey() {
    this.state.selectedConcerns = [];
    this.state.selectedGender = 'male';
    this.state.selectedAge = '20';
    
    document.querySelectorAll('.check-item-card').forEach(card => card.classList.remove('active'));
    document.querySelectorAll('.btn-toggle').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.btn-toggle[data-gender="male"]').classList.add('active');
    document.getElementById('survey-age').value = '20';
    document.getElementById('survey-workout').value = '0';
    document.getElementById('survey-sleep').value = 'short';

    this.showSurveyStep(1);
  },

  // Recommendation engine builder
  generateRecommendation() {
    const gender = this.state.selectedGender === 'male' ? '남성' : '여성';
    const age = document.getElementById('survey-age').value;
    const workout = document.getElementById('survey-workout').value;
    const sleep = document.getElementById('survey-sleep').value;

    const resultContainer = document.getElementById('survey-result-content');
    resultContainer.innerHTML = '';

    // Recommendation logic based on selected concerns
    const recs = [];
    this.state.selectedConcerns.forEach(con => {
      if (con === 'fatigue') {
        recs.push({
          name: '아쉬와간다 + 아르기닌',
          icon: '<i class="fa-solid fa-battery-half"></i>',
          dosage: '하루 1회 (오전/운동 전 복용 권장)',
          reason: '만성 스트레스 관리와 육체 에너지 회복을 돕기 위해 코르티솔 분비를 낮추는 아사와간다와 활력 증진용 아르기닌 스택이 이상적입니다.'
        });
      } else if (con === 'immune') {
        recs.push({
          name: '락토페린 + 아연',
          icon: '<i class="fa-solid fa-shield-halved"></i>',
          dosage: '아침 공복 섭취 권장',
          reason: '식약처에서 검증받은 항바이러스 및 철분 제어 기능의 락토페린과 기본 백혈구 생성에 필수적인 아연의 조합으로 면역을 극대화합니다.'
        });
      } else if (con === 'gut') {
        recs.push({
          name: '포스트바이오틱스 (4세대 유산균)',
          icon: '<i class="fa-solid fa-heart-circle-check"></i>',
          dosage: '매일 아침 공복 1캡슐',
          reason: '장 장벽의 복구와 배변 촉진을 위해 고순도 유산균 대사 물질인 포스트바이오틱스 복용이 최적입니다.'
        });
      } else if (con === 'joint') {
        recs.push({
          name: 'MSM + 콘드로이친 복합제',
          icon: '<i class="fa-solid fa-bone"></i>',
          dosage: '식후 즉시 2정 섭취',
          reason: '연골 보호 및 관절 쿠션 역할을 보충하는 소 연골 유래 콘드로이친에 식이 유황(MSM)을 더하여 퇴행성 염증 경감을 유도합니다.'
        });
      } else if (con === 'skin') {
        recs.push({
          name: '글루타치온 필름 + 저분자 콜라겐',
          icon: '<i class="fa-solid fa-sparkles"></i>',
          dosage: '취침 30분 전 섭취',
          reason: '흡수율이 탁월한 필름형 글루타치온으로 미백 항산화를 확보하고, 300달톤 이하 저분자 콜라겐으로 보습 탄력을 보완합니다.'
        });
      } else if (con === 'eyes') {
        recs.push({
          name: '루테인 + 오메가3',
          icon: '<i class="fa-solid fa-eye"></i>',
          dosage: '점심 식사 중 복용 권장',
          reason: '눈 피로도 완화를 위한 황반 색소 밀도 유지(루테인)와 건조한 눈 개선을 위한 DHA/EPA 오메가3의 황금 처방 스택입니다.'
        });
      }
    });

    // Add lifestyle-specific supplement
    if (workout === '5') {
      recs.push({
        name: '액상 아르기닌 및 전해질',
        icon: '<i class="fa-solid fa-dumbbell"></i>',
        dosage: '운동 30분 전 1포',
        reason: '운동 강도가 높으므로 근육 회복 및 펌핑 활력을 위해 고함량 활성 아미노산 공급이 필요합니다.'
      });
    }

    if (sleep === 'short') {
      recs.push({
        name: 'L-테아닌 및 마그네슘',
        icon: '<i class="fa-solid fa-moon"></i>',
        dosage: '저녁 식후 1회',
        reason: '수면 부족으로 유발되는 신경 긴장 완화와 숙면 유도를 위해 마그네슘과 테아닌 신경 릴렉스 스택을 조합합니다.'
      });
    }

    // Render results
    const box = document.createElement('div');
    box.className = 'recommendation-stack-box';
    box.innerHTML = `
      <div class="rec-description">
        <strong>진단 분석 요약 (${age}대 ${gender}):</strong><br>
        선택하신 건강 고민사항 및 평소 신체 활동 수준에 맞추어 현재 가장 신뢰도 높은 최신 건강 트렌드 데이터베이스를 기반으로 구성한 맞춤 영양 스택 리포트입니다.
      </div>
      <div class="stack-ingredients-list">
        ${recs.map(r => `
          <div class="stack-item">
            <div class="stack-icon">${r.icon}</div>
            <div class="stack-meta">
              <span class="stack-name">${r.name}</span>
              <span class="stack-dosage"><i class="fa-solid fa-prescription-bottle-med"></i> ${r.dosage}</span>
              <p style="font-size:0.78rem; color:var(--text-muted); margin-top:0.25rem;">${r.reason}</p>
            </div>
            <span class="stack-rank-lbl">추천도 ★★★★★</span>
          </div>
        `).join('')}
      </div>
    `;
    resultContainer.appendChild(box);

    this.showSurveyStep('result');
  }
};

// Initializer
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
