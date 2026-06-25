/* ==========================================
   CineAHO Naver Blog Analyzer & Evaluator
   JavaScript Controllers and Chart Bindings
   ========================================== */

// Global state
let blogData = null;
let radarChart = null;
let lineChart = null;

// Table controls
let searchQuery = '';
let selectedCategory = 'all';
let currentSortColumn = 'idx';
let currentSortAsc = true;

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initFormHandler();
  initTableControls();
  initModal();
});

// 1. Theme Syncer (adjusts Chart.js colors based on active theme)
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
    
    // Re-render charts to apply correct color palette
    if (blogData) {
      renderEvaluationCharts();
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

// 2. Navigation Tabs
function initNavigation() {
  const tabButtons = document.querySelectorAll('.blog-tab-btn');
  const tabPanels = document.querySelectorAll('.blog-tab-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Deactivate all
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      // Activate clicked
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }

      // Re-trigger layout updates for charts if needed
      if (targetId === 'tab-report' && blogData) {
        renderEvaluationCharts();
      }
    });
  });
}

// 3. Search Form Handler
function initFormHandler() {
  const form = document.getElementById('blog-search-form');
  const input = document.getElementById('blog-id-input');
  
  const loadingPanel = document.getElementById('analysis-loading');
  const errorPanel = document.getElementById('analysis-error');
  const resultsPanel = document.getElementById('analysis-results');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const blogId = input.value.trim();
    if (!blogId) return;

    // Show loading, hide others
    loadingPanel.classList.remove('hidden');
    errorPanel.classList.add('hidden');
    resultsPanel.classList.add('hidden');

    try {
      const response = await fetch(`/api/naver-blog-analyze?blogId=${encodeURIComponent(blogId)}`);
      if (!response.ok) {
        throw new Error('데이터 수집 중 오류가 발생했습니다.');
      }
      
      const result = await response.json();
      if (result.success) {
        blogData = result;
        
        // Hide loader, show results
        loadingPanel.classList.add('hidden');
        resultsPanel.classList.remove('hidden');

        // Populate everything
        populateHeaderMetadata();
        populateKPIMetrics();
        renderEvaluationCharts();
        populateCategoryFilter();
        applyTableFiltersAndSort();
        populateOptimizationSolutions();
        
        // Auto scroll to results
        resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        throw new Error(result.error || '블로그를 분석할 수 없습니다.');
      }
    } catch (err) {
      loadingPanel.classList.add('hidden');
      errorPanel.classList.remove('hidden');
      document.getElementById('error-message').textContent = err.message;
    }
  });

  document.getElementById('btn-error-retry').addEventListener('click', () => {
    errorPanel.classList.add('hidden');
    input.focus();
  });
}

// 4. Populate Metadata & KPIs
function populateHeaderMetadata() {
  document.getElementById('result-blog-title').textContent = blogData.blogTitle;
  document.getElementById('result-blog-desc').textContent = blogData.blogDescription || '네이버 블로그 포스팅 품질 진단 리포트';
  document.getElementById('badge-blog-id').textContent = `ID: ${blogData.blogId}`;
  
  const modeBadge = document.getElementById('badge-blog-mode');
  if (blogData.isFallback) {
    modeBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> 오프라인 데모 모드`;
    modeBadge.style.color = '#fb7185';
    modeBadge.style.borderColor = 'rgba(244, 63, 94, 0.2)';
    modeBadge.style.background = 'rgba(244, 63, 94, 0.08)';
  } else {
    modeBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> 실시간 RSS 동기화`;
    modeBadge.style.color = '#10b981';
    modeBadge.style.borderColor = 'rgba(16, 185, 129, 0.2)';
    modeBadge.style.background = 'rgba(16, 185, 129, 0.08)';
  }
}

function populateKPIMetrics() {
  animateCounter('kpi-avg-views', blogData.metrics.avgViews, '회');
  document.getElementById('kpi-avg-dwell').textContent = blogData.metrics.avgStayTimeFormatted;
  document.getElementById('kpi-avg-bounce').textContent = `${blogData.metrics.avgBounceRate}%`;
  document.getElementById('kpi-engagement').textContent = `${blogData.metrics.engagementIndex}%`;

  // Score display ring animation
  animateCounter('overall-score-number', blogData.overallScore, '');
  
  const scoreRing = document.getElementById('score-ring');
  if (scoreRing) {
    const radius = scoreRing.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (blogData.overallScore / 100) * circumference;
    scoreRing.style.strokeDasharray = `${circumference}`;
    scoreRing.style.strokeDashoffset = `${offset}`;
  }

  // Grade badge settings
  const gradeBadge = document.getElementById('overall-grade');
  const gradeTitle = document.getElementById('overall-grade-title');
  const gradeDesc = document.getElementById('overall-grade-desc');

  gradeBadge.textContent = blogData.grade;

  const gradesInfo = {
    'S': {
      title: '파워 인플루언서급 초우량 블로그',
      desc: '검색 노출 최적화(C-Rank) 및 핵심 지표가 최고 수준입니다. 높은 체류시간과 인게이지먼트로 상위 노출에 매우 견고합니다.',
      color: '#10b981'
    },
    'A': {
      title: '최적화 진입 완료 우수 블로그',
      desc: '독자 참여 및 텍스트 구조가 탄탄하여 스마트블록 노출 가능성이 매우 높은 상태입니다. 유입량 보강으로 성장을 가속화하세요.',
      color: '#06b6d4'
    },
    'B': {
      title: '성장 잠재력을 가진 일반 블로그',
      desc: '기본 정보력은 우수하나, 포스팅 구성 지표와 핵심 키워드 밀도 조율을 통해 체류 시간을 추가 확보할 여지가 큽니다.',
      color: '#c084fc'
    },
    'C': {
      title: '관리가 필요한 입문 단계 블로그',
      desc: '포스팅 평균 분량 및 이미지 유무 등 기본 작성 지표가 부족합니다. D.I.A.+ 지수 향상을 위한 보완 가이드 적용을 권장합니다.',
      color: '#f59e0b'
    },
    'D': {
      title: 'SEO 최적화 저조 단계 블로그',
      desc: '키워드 누락 및 매우 낮은 글자수로 검색 지표에 악영향을 받고 있습니다. 일관성 있는 주제와 기초적인 포스팅 설계가 시급합니다.',
      color: '#ef4444'
    }
  };

  const info = gradesInfo[blogData.grade] || gradesInfo['B'];
  gradeTitle.textContent = info.title;
  gradeDesc.textContent = info.desc;
  gradeBadge.style.color = info.color;
  gradeBadge.style.textShadow = `0 0 15px ${info.color}35`;
}

function animateCounter(id, targetVal, suffix = '') {
  const element = document.getElementById(id);
  if (!element) return;

  let currentVal = 0;
  const duration = 800; // ms
  const stepTime = 16; // ~60fps
  const steps = Math.ceil(duration / stepTime);
  const increment = targetVal / steps;

  const timer = setInterval(() => {
    currentVal += increment;
    if (currentVal >= targetVal) {
      clearInterval(timer);
      element.textContent = targetVal.toLocaleString() + suffix;
    } else {
      element.textContent = Math.round(currentVal).toLocaleString() + suffix;
    }
  }, stepTime);
}

// 5. Render Chart.js
function renderEvaluationCharts() {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const gridColor = isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.04)';
  const radarGridColor = isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.06)';
  const textColor = isLight ? '#475569' : '#94a3b8';

  // --- Chart 1: Radar (5 Dimensions) ---
  const ctxRadar = document.getElementById('chart-radar-evaluation');
  if (ctxRadar) {
    if (radarChart) radarChart.destroy();

    const scores = blogData.dimensionScores;
    radarChart = new Chart(ctxRadar, {
      type: 'radar',
      data: {
        labels: ['검색 노출 (SEO)', '트래픽 (Traffic)', '독자 참여 (Likes/Comments)', '블로그 활동성 (Activity)', '평균 머문시간 (Dwell)'],
        datasets: [{
          label: '진단 점수',
          data: [scores.seo, scores.traffic, scores.engagement, scores.activity, scores.dwellTime],
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          borderColor: '#10b981',
          pointBackgroundColor: '#34d399',
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
            angleLines: { color: radarGridColor },
            grid: { color: radarGridColor },
            pointLabels: { color: textColor, font: { size: 10, weight: '600' } },
            ticks: { display: false, stepSize: 20 },
            min: 0,
            max: 100
          }
        }
      }
    });
  }

  // --- Chart 2: Line (Views Traffic Trend) ---
  const ctxLine = document.getElementById('chart-line-traffic');
  if (ctxLine) {
    if (lineChart) lineChart.destroy();

    // Show oldest first in trend line chart
    const trendPosts = [...blogData.posts].reverse();
    const labels = trendPosts.map((p, idx) => `#${idx + 1}`);
    const viewsData = trendPosts.map(p => p.views);

    lineChart = new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: '포스트 조회수',
          data: viewsData,
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.08)',
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointBackgroundColor: '#22d3ee',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => {
                const itemIdx = items[0].dataIndex;
                const post = trendPosts[itemIdx];
                return post.title;
              },
              label: (context) => {
                return `조회수: ${context.parsed.y.toLocaleString()}회`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { size: 9 } },
            title: { display: true, text: '발행 포스트 순서 (과거 -> 현재)', color: textColor, font: { size: 10 } }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { size: 9 } },
            title: { display: true, text: '조회수 (회)', color: textColor, font: { size: 10 } }
          }
        }
      }
    });
  }
}

// 6. Table Tab Data Handling
function initTableControls() {
  const searchInput = document.getElementById('post-search-input');
  const categoryFilter = document.getElementById('filter-post-category');
  const btnReset = document.getElementById('btn-reset-table-filters');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      applyTableFiltersAndSort();
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      selectedCategory = e.target.value;
      applyTableFiltersAndSort();
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      searchQuery = '';
      selectedCategory = 'all';
      if (searchInput) searchInput.value = '';
      if (categoryFilter) categoryFilter.value = 'all';
      applyTableFiltersAndSort();
    });
  }

  // Sort headers trigger
  document.querySelectorAll('.posts-table th.sortable').forEach(header => {
    header.addEventListener('click', () => {
      const col = header.getAttribute('data-sort');
      if (currentSortColumn === col) {
        currentSortAsc = !currentSortAsc;
      } else {
        currentSortColumn = col;
        currentSortAsc = true;
      }

      // Reset icons
      document.querySelectorAll('.posts-table th.sortable i').forEach(icon => {
        icon.className = 'fa-solid fa-sort';
      });
      const icon = header.querySelector('i');
      if (currentSortAsc) {
        icon.className = 'fa-solid fa-sort-up';
      } else {
        icon.className = 'fa-solid fa-sort-down';
      }

      applyTableFiltersAndSort();
    });
  });
}

function populateCategoryFilter() {
  const select = document.getElementById('filter-post-category');
  if (!select) return;

  const categories = [...new Set(blogData.posts.map(p => p.category))];
  let html = '<option value="all">전체 카테고리</option>';
  categories.forEach(cat => {
    html += `<option value="${cat}">${cat}</option>`;
  });
  select.innerHTML = html;
  selectedCategory = 'all';
}

function applyTableFiltersAndSort() {
  if (!blogData) return;

  let filtered = [...blogData.posts];

  // 1. Text Search Filter
  if (searchQuery) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  }

  // 2. Category Filter
  if (selectedCategory !== 'all') {
    filtered = filtered.filter(p => p.category === selectedCategory);
  }

  // 3. Sorting
  filtered.sort((a, b) => {
    let valA, valB;

    if (currentSortColumn === 'idx') {
      // Map based on reverse index so newer is top
      valA = blogData.posts.indexOf(a);
      valB = blogData.posts.indexOf(b);
    } else if (currentSortColumn === 'pubDate') {
      valA = new Date(a.pubDate).getTime();
      valB = new Date(b.pubDate).getTime();
    } else {
      valA = a[currentSortColumn];
      valB = b[currentSortColumn];
    }

    if (valA < valB) return currentSortAsc ? -1 : 1;
    if (valA > valB) return currentSortAsc ? 1 : -1;
    return 0;
  });

  renderTableRows(filtered);
}

function renderTableRows(data) {
  const tbody = document.getElementById('posts-table-body');
  const countVisible = document.getElementById('visible-posts-count');
  const countTotal = document.getElementById('total-posts-count');

  if (countVisible) countVisible.textContent = data.length;
  if (countTotal) countTotal.textContent = blogData.posts.length;

  if (!tbody) return;

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 4rem; color: var(--text-muted);">
          <i class="fa-solid fa-folder-open" style="font-size: 2.2rem; margin-bottom: 12px; color: rgba(255,255,255,0.06);"></i>
          <p>조건과 매칭되는 게시글이 존재하지 않습니다.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = data.map((post) => {
    // Generate simple order index
    const seqNum = blogData.posts.indexOf(post) + 1;
    
    // Formatting date
    const dateObj = new Date(post.pubDate);
    const dateFormatted = `${dateObj.getFullYear()}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')}`;

    return `
      <tr>
        <td><span style="font-weight: 700; color: var(--accent-color);"># ${seqNum}</span></td>
        <td><div class="post-title-cell" title="${post.title}">${post.title}</div></td>
        <td><span class="category-badge">${post.category}</span></td>
        <td><span style="font-size: 0.8rem; color: var(--text-secondary);">${dateFormatted}</span></td>
        <td><strong>${post.views.toLocaleString()}회</strong></td>
        <td><span style="color: #f43f5e; font-weight: 600;">${post.likes.toLocaleString()}</span></td>
        <td><span style="color: #a855f7; font-weight: 600;">${post.comments.toLocaleString()}</span></td>
        <td><strong style="color: #06b6d4;">${post.stayTimeFormatted}</strong></td>
        <td><span style="color: var(--text-secondary);">${post.bounceRate}%</span></td>
        <td>
          <button class="btn-post-detail" onclick="openPostModal('${post.logNo}')">🔍 정보</button>
        </td>
      </tr>
    `;
  }).join('');
}

// 7. Tab 3: Solutions and Action roadmap generator
function populateOptimizationSolutions() {
  const strengthsList = document.getElementById('list-strengths');
  const weaknessesList = document.getElementById('list-weaknesses');
  const roadmapContainer = document.getElementById('roadmap-container');

  if (!strengthsList || !weaknessesList || !roadmapContainer) return;

  const scores = blogData.dimensionScores;
  const strengths = [];
  const weaknesses = [];
  const steps = [];

  // Determine strengths & weaknesses based on scores
  if (scores.seo >= 85) {
    strengths.push('제목 및 본문 내 핵심 키워드 배치(SEO) 감각이 뛰어나 검색엔진 크롤러가 색인하기 쉽습니다.');
  } else {
    weaknesses.push('핵심 키워드가 제목 초입부 또는 본문 첫 100자 내 누락되어 노출 우선순위 손실이 있습니다.');
  }

  if (scores.dwellTime >= 78) {
    strengths.push('가독성이 높은 레이아웃 구성과 긴 평균 글자 수 덕분에 방문자 평균 체류시간이 우수합니다.');
  } else {
    weaknesses.push('본문 텍스트 길이가 다소 짧고 문단 가독성이 떨어져 방문자가 평균 2분 이내로 빠르게 이탈합니다.');
  }

  if (scores.engagement >= 75) {
    strengths.push('조회수 대비 독자들의 공감 클릭 및 댓글 피드백 반응성(인게이지먼트 지수)이 아주 훌륭합니다.');
  } else {
    weaknesses.push('방문량에 비해 이웃들과의 인터랙션(댓글, 공감)이 저조하여 지수가 정체되어 있습니다.');
  }

  if (scores.traffic >= 70) {
    strengths.push('핵심 핫토픽 유입량이 안정적으로 유지되며 평균 조회수 등 검색 랭킹 유입도가 높습니다.');
  } else {
    weaknesses.push('최근 포스팅의 일평균 유입수가 낮습니다. 검색 의도를 저격한 롱테일 키워드 선정이 추가로 요구됩니다.');
  }

  if (scores.activity >= 90) {
    strengths.push('포스팅 업로드 빈도와 발행 주기의 일관성이 높게 유지되어 C-Rank 신뢰도가 탄탄히 누적되고 있습니다.');
  } else {
    weaknesses.push('포스트 업로드 주기가 뜸해지거나 불규칙해질 경우 네이버 C-Rank 활동성 가중치 저하로 이어질 수 있습니다.');
  }

  // Fallbacks if lists are empty
  if (strengths.length === 0) strengths.push('현재 분석 단계에서 압도적인 장점은 아직 감지되지 않았습니다. 기초 작성을 강화해 주세요.');
  if (weaknesses.length === 0) weaknesses.push('완벽히 최적화된 블로그입니다! 현재 강점 요소를 지금처럼 지속해서 유지해 주세요.');

  // Populate Lists HTML
  strengthsList.innerHTML = strengths.map(str => `<li>${str}</li>`).join('');
  weaknessesList.innerHTML = weaknesses.map(wk => `<li>${wk}</li>`).join('');

  // Generate Action Roadmap Steps
  let stepIdx = 1;

  // Step 1: SEO Fix
  if (scores.seo < 85) {
    steps.push({
      num: stepIdx++,
      title: '포스팅 제목 및 도입부 키워드 배치 규칙 조율',
      desc: '향후 발행하는 모든 글에 타겟 핵심 키워드를 제목 최전방에 위치시키고, 본문 시작 후 1~2문단(100자 이내) 내에서 반드시 자연스럽게 2회 이상 기입해 네이버 크롤러의 매칭 우선순위를 높이세요.'
    });
  }

  // Step 2: Dwell time Fix
  if (scores.dwellTime < 78) {
    steps.push({
      num: stepIdx++,
      title: 'D.I.A.+ 가중치 획득을 위한 콘텐츠 구조화',
      desc: '문맥의 지루함을 환기할 수 있도록 본문에 직접 촬영한 사진(이미지 5개 이상 권장)과 표(Table), 굵은 글씨 효과를 다용하세요. 또한, 정보 요약형 질문과 답변 구조(Q&A)를 가미하면 체류 시간을 크게 확보할 수 있습니다.'
    });
  }

  // Step 3: Traffic Fix
  if (scores.traffic < 70) {
    steps.push({
      num: stepIdx++,
      title: '서브 스마트블록 저격용 세부 키워드 다변화',
      desc: '경쟁이 너무 심한 대표 키워드만 고집하는 대신, 메인 키워드 뒤에 지역명, 사용법, 후기 등의 세부 행동 유도 수식어를 붙인 롱테일 키워드로 스마트블록 틈새 유입량을 확보하십시오.'
    });
  }

  // Step 4: Engagement Fix
  if (scores.engagement < 75) {
    steps.push({
      num: stepIdx++,
      title: '방문 유도형 이웃 소통 및 본문 아웃바운드 링크 활용',
      desc: '게시물 말미에 "댓글이나 공감으로 궁금증을 남겨주시면 바로 피드백 해드리겠습니다" 등의 행동유도 문구를 추가하세요. 유용한 정보를 추가 제공할 수 있는 연계 아웃바운드 링크도 지수 상승에 도움이 됩니다.'
    });
  }

  // Always append a final maintenance step
  steps.push({
    num: stepIdx,
    title: '원토픽 C-Rank 전문성 가중치 관리',
    desc: '네이버 검색 봇은 특정 카테고리의 일관된 포스팅 비율을 중요하게 평가합니다. 잡식성 블로그보다는 하나의 카테고리(예: IT/가전 또는 맛집/리뷰) 포스팅 비율을 60% 이상으로 통일하여 발행 규칙성을 지켜가십시오.'
  });

  roadmapContainer.innerHTML = steps.map(step => `
    <div class="step-card">
      <div class="step-number">${step.num}</div>
      <div class="step-info">
        <h4>${step.title}</h4>
        <p>${step.desc}</p>
      </div>
    </div>
  `).join('');
}

// 8. Detailed Post Modal Logic
function initModal() {
  const modal = document.getElementById('post-detail-modal');
  const btnClose = document.getElementById('btn-close-modal');

  if (btnClose) btnClose.addEventListener('click', closePostModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closePostModal();
    });
  }
}

window.openPostModal = function(logNo) {
  if (!blogData) return;

  const post = blogData.posts.find(p => p.logNo === logNo);
  if (!post) return;

  const modal = document.getElementById('post-detail-modal');
  if (!modal) return;

  // Populate data
  document.getElementById('modal-post-category').textContent = post.category || '전체';
  document.getElementById('modal-post-title').textContent = post.title;
  
  const dateObj = new Date(post.pubDate);
  document.getElementById('modal-post-date').textContent = `발행일: ${dateObj.getFullYear()}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

  document.getElementById('modal-views').textContent = `${post.views.toLocaleString()}회`;
  document.getElementById('modal-engagement').textContent = `${post.likes.toLocaleString()} / ${post.comments.toLocaleString()}`;
  document.getElementById('modal-dwell').textContent = post.stayTimeFormatted;
  document.getElementById('modal-bounce').textContent = `${post.bounceRate}%`;
  
  document.getElementById('modal-post-preview').textContent = post.description;

  // Character audit
  document.getElementById('modal-char-count').textContent = `${post.bodyLength.toLocaleString()}자`;
  
  const charStatus = document.getElementById('modal-char-status');
  if (post.bodyLength >= 2000) {
    charStatus.textContent = '아주 양호 (상위 노출 최적화 범위)';
    charStatus.style.color = '#10b981';
  } else if (post.bodyLength >= 1000) {
    charStatus.textContent = '보통 (일반 정보전달용 충분)';
    charStatus.style.color = '#3b82f6';
  } else {
    charStatus.textContent = '보완 권장 (글자 수 부족으로 저품질 위험)';
    charStatus.style.color = '#ef4444';
  }

  // Keywords tags
  const container = document.getElementById('modal-keywords-container');
  if (container) {
    if (post.keywords && post.keywords.length > 0) {
      container.innerHTML = post.keywords.map(kw => `<span class="modal-kw-tag"># ${kw}</span>`).join('');
    } else {
      container.innerHTML = `<span style="font-size:0.75rem; color:var(--text-muted);">제목 내 2자 이상의 유의미한 키워드 누락</span>`;
    }
  }

  // External Link
  const linkBtn = document.getElementById('modal-btn-link');
  if (linkBtn) {
    linkBtn.href = post.link;
  }

  modal.classList.add('open');
};

window.closePostModal = function() {
  const modal = document.getElementById('post-detail-modal');
  if (modal) modal.classList.remove('open');
};
