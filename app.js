// DOM Elements
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = themeToggleBtn.querySelector('i');
const themeText = themeToggleBtn.querySelector('span');

const globalSearchInput = document.getElementById('global-search');
const heroSearchInput = document.getElementById('hero-tool-search');
const toolCards = document.querySelectorAll('.tool-card');
const subCards = document.querySelectorAll('.sub-card');

// Theme Toggle Logic (Light <-> Dark)
themeToggleBtn.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  let newTheme = 'dark';
  
  if (currentTheme === 'dark') {
    newTheme = 'light';
    themeIcon.className = 'fa-solid fa-moon';
    themeText.textContent = '다크';
    themeToggleBtn.style.borderColor = 'var(--text-muted)';
  } else {
    newTheme = 'dark';
    themeIcon.className = 'fa-solid fa-sun';
    themeText.textContent = '라이트';
    themeToggleBtn.style.borderColor = 'rgba(255, 255, 255, 0.08)';
  }
  
  document.documentElement.setAttribute('data-theme', newTheme);
});

// Category state
const categoryTabs = document.querySelectorAll('.category-tab-btn');
let currentCategory = 'all';

// Dynamic category mapping by card icon/content
function getCardCategoryKey(card) {
  const categorySpan = card.querySelector('.tool-category');
  if (!categorySpan) return 'all';
  const categoryText = categorySpan.textContent.trim();
  
  if (categoryText.includes('빅데이터') || categoryText.includes('공공 데이터') || categoryText.includes('데이터 & 분석')) {
    return 'data';
  }
  if (categoryText.includes('게임') || categoryText.includes('보드게임') || categoryText.includes('슈팅게임') || categoryText.includes('퍼즐게임') || categoryText.includes('블록게임') || categoryText.includes('수학게임') || categoryText.includes('3D 게임') || categoryText.includes('전략게임') || categoryText.includes('아케이드')) {
    return 'game';
  }
  if (categoryText.includes('건강/헬스')) {
    return 'health';
  }
  if (categoryText.includes('생산성') || categoryText.includes('유틸리티') || categoryText.includes('문서 오피스툴') || categoryText.includes('하드웨어 테스트') || categoryText.includes('교육 및 학습툴')) {
    return 'productivity';
  }
  if (categoryText.includes('엔터테인먼트')) {
    return 'entertainment';
  }
  if (categoryText.includes('디자인/아트') || categoryText.includes('마케팅 툴')) {
    return 'media';
  }
  if (categoryText.includes('뉴스 피드')) {
    return 'news';
  }
  return 'all';
}

// Live Search & Filtering Functionality
function filterTools() {
  const cleanQuery = (globalSearchInput.value || '').trim().toLowerCase();
  let firstVisibleLink = null;
  
  toolCards.forEach(card => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    const desc = card.querySelector('.tool-desc').textContent.toLowerCase();
    const tags = card.getAttribute('data-tags').toLowerCase();
    
    // Check search query match
    const searchMatch = !cleanQuery || title.includes(cleanQuery) || desc.includes(cleanQuery) || tags.includes(cleanQuery);
    
    // Check category match
    const cardCategory = getCardCategoryKey(card);
    const categoryMatch = currentCategory === 'all' || cardCategory === currentCategory;
    
    if (searchMatch && categoryMatch) {
      card.style.display = 'flex';
      // Fade in effect
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
      
      if (!firstVisibleLink) {
        const launchBtn = card.querySelector('.btn-card-launch');
        if (launchBtn) {
          firstVisibleLink = launchBtn.getAttribute('href');
        }
      }
    } else {
      card.style.display = 'none';
    }
  });

  // Update hero search launch button visibility and click handler
  const searchLaunchBtn = document.getElementById('btn-search-launch');
  if (searchLaunchBtn) {
    if (cleanQuery && firstVisibleLink) {
      searchLaunchBtn.style.display = 'flex';
      searchLaunchBtn.onclick = () => {
        window.location.href = firstVisibleLink;
      };
    } else {
      searchLaunchBtn.style.display = 'none';
    }
  }
}

// Bind search input events and synchronize inputs
globalSearchInput.addEventListener('input', (e) => {
  const val = e.target.value;
  heroSearchInput.value = val; // Synchronize
  filterTools();
});

heroSearchInput.addEventListener('input', (e) => {
  const val = e.target.value;
  globalSearchInput.value = val; // Synchronize
  filterTools();
});

// Launch first matching tool on pressing Enter
const handleSearchEnter = (e) => {
  if (e.key === 'Enter') {
    const cleanQuery = (e.target.value || '').trim();
    if (cleanQuery) {
      const firstVisibleCard = Array.from(toolCards).find(card => card.style.display !== 'none');
      if (firstVisibleCard) {
        const launchBtn = firstVisibleCard.querySelector('.btn-card-launch');
        if (launchBtn) {
          window.location.href = launchBtn.getAttribute('href');
        }
      }
    }
  }
};

heroSearchInput.addEventListener('keydown', handleSearchEnter);
globalSearchInput.addEventListener('keydown', handleSearchEnter);

// Bind Category tabs click events
if (categoryTabs.length > 0) {
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.getAttribute('data-category');
      filterTools();
    });
  });
}


const APP_METADATA = {
  'naver-seo': { name: '네이버 SEO', icon: 'fa-solid fa-square-rss', link: './naver-seo/index.html' },
  'ai-rss-news': { name: 'AI 뉴스', icon: 'fa-solid fa-square-rss', link: './ai-rss-news/index.html' },
  'youtube-hub': { name: '유튜브 분석', icon: 'fa-brands fa-youtube', link: './youtube-hub/index.html' },
  'checklist': { name: '체크리스트', icon: 'fa-solid fa-clipboard-check', link: './checklist/index.html' },
  'lotto': { name: '로또 생성기', icon: 'fa-solid fa-dice', link: './lotto/index.html' },
  'omok': { name: '오목 대국실', icon: 'fa-solid fa-gamepad', link: './omok/index.html' },
  'janggi': { name: '장기 대국실', icon: 'fa-solid fa-gamepad', link: './janggi/index.html' },
  'calculator': { name: '통합 계산기', icon: 'fa-solid fa-calculator', link: './calculator/index.html' },
  'kosis': { name: '물가 통계', icon: 'fa-solid fa-chart-line', link: './kosis/index.html' },
  'saju': { name: '사주 분석', icon: 'fa-solid fa-hand-holding-heart', link: './saju/index.html' },
  'tarot': { name: '타로 카드', icon: 'fa-solid fa-wand-magic-sparkles', link: './tarot/index.html' },
  'sudoku': { name: '스도쿠 Pro', icon: 'fa-solid fa-puzzle-piece', link: './sudoku/index.html' },
  'tetris': { name: '테트리스', icon: 'fa-solid fa-shapes', link: './tetris/index.html' },
  '2048': { name: '2048 퍼즐', icon: 'fa-solid fa-square-plus', link: './2048/index.html' },
  'galaga': { name: '갤러그 슈팅', icon: 'fa-solid fa-rocket', link: './galaga/index.html' },
  'qrcode': { name: 'QR 생성기', icon: 'fa-solid fa-qrcode', link: './qrcode/index.html' },
  'pdf': { name: 'PDF 도구', icon: 'fa-solid fa-file-pdf', link: './pdf/index.html' },
  'monitor': { name: '화소 검사기', icon: 'fa-solid fa-display', link: './monitor/index.html' },
  'apple': { name: '사과게임+', icon: 'fa-solid fa-apple-whole', link: './apple/index.html' },
  'marble': { name: '구슬 룰렛', icon: 'fa-solid fa-circle-nodes', link: './marble/index.html' },
  'godfield': { name: '갓 필드', icon: 'fa-solid fa-crown', link: './godfield/index.html' },
  'toeic': { name: '토익 학습기', icon: 'fa-solid fa-book-open-reader', link: './toeic/index.html' },
  'print': { name: '프린트 편집', icon: 'fa-solid fa-print', link: './print/index.html' },
  'bmi': { name: 'BMI 계산', icon: 'fa-solid fa-weight-scale', link: './bmi/index.html' },
  'bmr': { name: 'BMR 계산', icon: 'fa-solid fa-fire-flame-curved', link: './bmr/index.html' },
  'whr': { name: 'WHR 계산', icon: 'fa-solid fa-arrows-left-right-to-line', link: './whr/index.html' },
  'thr': { name: 'THR 계산', icon: 'fa-solid fa-heart-pulse', link: './thr/index.html' },
  'macros': { name: '탄단지 계산', icon: 'fa-solid fa-carrot', link: './macros/index.html' },
  'water-intake': { name: '수분 섭취', icon: 'fa-solid fa-droplet', link: './water-intake/index.html' },
  'blood-pressure': { name: '혈압 계산', icon: 'fa-solid fa-heart-pulse', link: './blood-pressure/index.html' },
  'child-height': { name: '예상 키', icon: 'fa-solid fa-ruler-vertical', link: './child-height/index.html' },
  'exercise-calories': { name: '운동 칼로리', icon: 'fa-solid fa-fire-flame-curved', link: './exercise-calories/index.html' },
  'food-nutrition': { name: '음식 분석', icon: 'fa-solid fa-camera-retro', link: './food-nutrition/index.html' },
  'emoticon-maker': { name: '이모티콘', icon: 'fa-solid fa-face-smile-wink', link: './emoticon-maker/index.html' },
  'billiards-3d': { name: '당구 3D', icon: 'fa-solid fa-circle-dot', link: './billiards-3d/index.html' },
  'assembly': { name: '국회의원', icon: 'fa-solid fa-building-columns', link: './assembly/index.html' },
  'bio-medical-trends': { name: '의학 논문', icon: 'fa-solid fa-dna', link: './bio-medical-trends/index.html' },
  'stock-trends': { name: '주식 동향', icon: 'fa-solid fa-arrow-trend-up', link: './stock-trends/index.html' },
  'trend': { name: '트렌드 분석', icon: 'fa-solid fa-chart-line', link: './trend/index.html' },
  'quant-simulator': { name: '퀀트 시뮬레이션', icon: 'fa-solid fa-chart-pie', link: './quant-simulator/index.html' },
  'game-news': { name: '게임 뉴스', icon: 'fa-solid fa-gamepad', link: './game-news/index.html' },
  'neuro-game': { name: '신경 게임', icon: 'fa-solid fa-brain', link: './neuro-game/index.html' },
  'memory-game': { name: '카드 맞추기', icon: 'fa-solid fa-clone', link: './memory-game/index.html' },
  'blackjack': { name: '블랙잭 3D', icon: 'fa-solid fa-diamond', link: './blackjack/index.html' }
};

// --- 카테고리별 앱 개수 및 전체 개수 동적 집계 ---
function initAppCounts() {
  const toolCards = document.querySelectorAll('.tool-card');
  const totalCount = toolCards.length;

  // 1. 전체 앱 개수 업데이트
  const totalCountEl = document.getElementById('total-app-count-number');
  if (totalCountEl) {
    totalCountEl.textContent = totalCount;
  }

  // 2. 카테고리별 앱 개수 카운팅
  const categoryCounts = {
    all: totalCount,
    data: 0,
    game: 0,
    health: 0,
    productivity: 0,
    entertainment: 0,
    media: 0,
    news: 0
  };

  toolCards.forEach(card => {
    const cat = getCardCategoryKey(card);
    if (categoryCounts[cat] !== undefined) {
      categoryCounts[cat]++;
    }
  });

  // 3. 카테고리 탭 버튼 옆에 개수 배지 추가/업데이트
  const categoryTabs = document.querySelectorAll('.category-tab-btn');
  categoryTabs.forEach(tab => {
    const cat = tab.getAttribute('data-category');
    const count = categoryCounts[cat] || 0;
    
    let badge = tab.querySelector('.category-count-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'category-count-badge';
      tab.appendChild(badge);
    }
    badge.textContent = count;
  });
}

// --- 실시간 방문자 통계 바인딩 ---
async function updateVisitorStats() {
  try {
    const response = await fetch('/api/visits');
    if (!response.ok) return;
    const visits = await response.json();

    // 1. 메인 사이트 헤더 및 푸터 방문 수치 업데이트
    const mainStats = visits['main'] || { total: 0, today: 0, uniqueTotal: 0, uniqueToday: 0 };
    
    // 헤더 배지 노출
    const headerVisitsEl = document.getElementById('header-visits-badge');
    const mainSiteCounterEl = document.getElementById('main-site-counter');
    if (headerVisitsEl && mainSiteCounterEl) {
      mainSiteCounterEl.textContent = mainStats.total.toLocaleString();
      headerVisitsEl.style.display = 'inline-flex';
    }

    // 푸터 사이트 방문 노출
    const siteTotalEl = document.getElementById('site-visit-total');
    const siteTodayEl = document.getElementById('site-visit-today');
    const siteUTotalEl = document.getElementById('site-visit-utotal');
    const siteUTodayEl = document.getElementById('site-visit-utoday');

    if (siteTotalEl) siteTotalEl.textContent = mainStats.total.toLocaleString();
    if (siteTodayEl) siteTodayEl.textContent = mainStats.today.toLocaleString();
    if (siteUTotalEl) siteUTotalEl.textContent = mainStats.uniqueTotal.toLocaleString();
    if (siteUTodayEl) siteUTodayEl.textContent = mainStats.uniqueToday.toLocaleString();

    // 2. 개별 서브 앱 방문 합산 계산 및 렌더링
    let appsTotal = 0;
    let appsToday = 0;
    let appsUTotal = 0;
    let appsUToday = 0;

    for (const app in visits) {
      if (app === 'main') continue;
      const appData = visits[app];
      appsTotal += appData.total || 0;
      appsToday += appData.today || 0;
      appsUTotal += appData.uniqueTotal || 0;
      appsUToday += appData.uniqueToday || 0;
    }

    // 푸터 이 앱 방문 노출
    const appsTotalEl = document.getElementById('apps-visit-total');
    const appsTodayEl = document.getElementById('apps-visit-today');
    const appsUTotalEl = document.getElementById('apps-visit-utotal');
    const appsUTodayEl = document.getElementById('apps-visit-utoday');

    if (appsTotalEl) appsTotalEl.textContent = appsTotal.toLocaleString();
    if (appsTodayEl) appsTodayEl.textContent = appsToday.toLocaleString();
    if (appsUTotalEl) appsUTotalEl.textContent = appsUTotal.toLocaleString();
    if (appsUTodayEl) appsUTodayEl.textContent = appsUToday.toLocaleString();

    // 3. 개별 앱 카드에 실시간 누적 조회수(방문수) 추가 시각화
    toolCards.forEach(card => {
      const launchBtn = card.querySelector('.btn-card-launch');
      if (!launchBtn) return;
      const href = launchBtn.getAttribute('href');
      const match = href.match(/\.\/([a-zA-Z0-9_-]+)\//);
      if (match) {
        const appName = match[1];
        const count = (visits[appName] && visits[appName].total) || 0;

        let visitsEl = card.querySelector('.tool-visits-count');
        if (!visitsEl) {
          const footer = card.querySelector('.tool-footer');
          if (footer) {
            const categoryEl = footer.querySelector('.tool-category');
            visitsEl = document.createElement('span');
            visitsEl.className = 'tool-visits-count';
            visitsEl.innerHTML = `<i class="fa-solid fa-eye"></i> <span>${count.toLocaleString()}</span>`;
            if (categoryEl) {
              categoryEl.parentNode.insertBefore(visitsEl, categoryEl.nextSibling);
            } else {
              footer.insertBefore(visitsEl, footer.firstChild);
            }
          }
        } else {
          visitsEl.querySelector('span').textContent = count.toLocaleString();
        }
      }
    });

    // 4. 자주 쓰는 도구 동적 로드 (방문수 기준 정렬)
    const freqContainer = document.getElementById('frequent-tools-middle-container');
    if (freqContainer) {
      const sortedApps = Object.entries(visits)
        .filter(([key]) => key !== 'main' && APP_METADATA[key])
        .sort((a, b) => (b[1].total || 0) - (a[1].total || 0))
        .map(([key]) => key);

      const defaultApps = ['stock-trends', 'lotto', 'omok'];
      const finalApps = [];
      
      for (const app of sortedApps) {
        if (finalApps.length < 3) {
          finalApps.push(app);
        }
      }
      
      for (const app of defaultApps) {
        if (finalApps.length < 3 && !finalApps.includes(app)) {
          finalApps.push(app);
        }
      }

      freqContainer.innerHTML = '';
      finalApps.forEach((appKey, idx) => {
        const meta = APP_METADATA[appKey];
        if (meta) {
          const cardDiv = document.createElement('div');
          cardDiv.className = `frequent-tool-card glass-panel`;
          cardDiv.setAttribute('onclick', `location.href='${meta.link}'`);
          
          const count = (visits[appKey] && visits[appKey].total) || 0;
          cardDiv.innerHTML = `
            <div class="freq-card-badge">TOP ${idx + 1}</div>
            <div class="freq-icon-wrapper"><i class="${meta.icon}"></i></div>
            <div class="freq-card-info">
              <h3>${meta.name}</h3>
              <span class="freq-visits"><i class="fa-solid fa-eye"></i> ${count.toLocaleString()}회</span>
            </div>
            <div class="freq-launch-arrow">
              <i class="fa-solid fa-arrow-right"></i>
            </div>
          `;
          
          // Add custom mouse move listener for the radial glow reflection effect
          cardDiv.addEventListener('mousemove', (e) => {
            const rect = cardDiv.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            cardDiv.style.setProperty('--x', `${x}px`);
            cardDiv.style.setProperty('--y', `${y}px`);
          });

          freqContainer.appendChild(cardDiv);
        }
      });
    }

  } catch (err) {
    console.error('실시간 방문 데이터 로드 실패:', err);
  }
}

// 초기화 시 방문자수 및 앱 개수 집계 실행
window.addEventListener('DOMContentLoaded', () => {
  updateVisitorStats();
  initAppCounts();
});
