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
  const categoryText = (categorySpan.getAttribute('data-original') || categorySpan.textContent).trim();
  
  if (categoryText.includes('유튜브') || categoryText.includes('YouTube') || categoryText.includes('유투브')) {
    return 'youtube';
  }
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
  if (categoryText.includes('디자인/아트') || categoryText.includes('마케팅 툴') || categoryText.includes('미디어 변환')) {
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
  'youtube-search': { name: '유튜브 검색', icon: 'fa-solid fa-magnifying-glass-chart', link: './youtube-search/index.html' },
  'youtube-miner': { name: '떡상 소재 채굴기', icon: 'fa-solid fa-fire', link: './youtube-miner/index.html' },
  'ai-video-generator': { name: 'AI 영상 제작기', icon: 'fa-solid fa-wand-magic-sparkles', link: './ai-video-generator/index.html' },
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
  'blackjack': { name: '블랙잭 3D', icon: 'fa-diamond', link: './blackjack/index.html' },
  'vampire-survivors': { name: '비행기 서바이벌', icon: 'fa-solid fa-jet-fighter', link: './vampire-survivors/index.html' },
  'tistory-poster': { name: '티스토리 포스터', icon: 'fa-solid fa-paper-plane', link: './tistory-poster/index.html' },
  'wordpress-poster': { name: '워드프레스 포스터', icon: 'fa-brands fa-wordpress', link: './wordpress-poster/index.html' },
  'quoridor': { name: '쿼리도 3D', icon: 'fa-solid fa-chess-board', link: './quoridor/index.html' },
  'ludus-coriovalli': { name: '루두스 코리오발리', icon: 'fa-solid fa-chess-board', link: './ludus-coriovalli/index.html' },
  'video-extractor': { name: '비디오 GIF/WebP 추출기', icon: 'fa-solid fa-film', link: './video-extractor/index.html' },
  'naver-blog-evaluator': { name: '네이버 블로그 종합 진단기', icon: 'fa-solid fa-chart-bar', link: './naver-blog-evaluator/index.html' },
  'k-wais-test': { name: '웩슬러 지능검사', icon: 'fa-solid fa-brain', link: './k-wais-test/index.html' },
  'jw-downloader': { name: 'JW 다운로더', icon: 'fa-solid fa-download', link: './jw-downloader/index.html' },
  'pinball-3d': { name: '3D 핀볼 아케이드', icon: 'fa-solid fa-gamepad', link: './pinball-3d/index.html' },
  'adhd-test': { name: '종합 ADHD 인지 검사기', icon: 'fa-solid fa-brain-circuit', link: './adhd-test/index.html' }
};

// --- Favorites (즐겨찾기) Logic ---
function getFavorites() {
  const favs = localStorage.getItem('user-favorites');
  return favs ? JSON.parse(favs) : [];
}

function saveFavorites(favs) {
  localStorage.setItem('user-favorites', JSON.stringify(favs));
}

function toggleFavorite(appKey) {
  let favorites = getFavorites();
  const index = favorites.indexOf(appKey);
  
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(appKey);
  }
  saveFavorites(favorites);
  
  // Synchronize star states on main cards
  const cards = document.querySelectorAll(`.tool-card[data-app-key="${appKey}"]`);
  cards.forEach(card => {
    const btn = card.querySelector('.tool-star-btn');
    if (btn) {
      const isFav = favorites.includes(appKey);
      btn.innerHTML = isFav ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
      if (isFav) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });

  // Re-render favorites section
  renderFavorites();
}

function renderFavorites() {
  const container = document.getElementById('favorites-container');
  if (!container) return;
  
  const favorites = getFavorites();
  
  if (favorites.length === 0) {
    let emptyTitle = '즐겨찾는 도구가 없습니다';
    let emptyDesc = '도구 카드 우측 상단의 별표(☆) 아이콘을 눌러 나만의 즐겨찾기 리스트를 만들어보세요!';
    
    if (currentLang === 'en') {
      emptyTitle = 'No favorite tools yet';
      emptyDesc = 'Press the star (☆) icon on any tool card to build your own favorites list!';
    } else if (currentLang === 'ja') {
      emptyTitle = 'お気に入りのツールはありません';
      emptyDesc = 'ツールカードの右上にある星（☆）アイコンを押して、自分のお気に入りリストを作成してください！';
    }
    
    container.innerHTML = `
      <div class="favorites-empty-state glass-panel">
        <i class="fa-regular fa-star star-placeholder"></i>
        <p class="empty-title">${emptyTitle}</p>
        <p class="empty-desc">${emptyDesc}</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = '';
  favorites.forEach((appKey) => {
    const meta = APP_METADATA[appKey];
    if (meta) {
      const cardDiv = document.createElement('div');
      cardDiv.className = `frequent-tool-card glass-panel`;
      cardDiv.setAttribute('onclick', `location.href='${meta.link}'`);
      
      const appName = currentLang === 'ko' ? meta.name : (APP_NAME_TRANSLATIONS[meta.name] || meta.name);
      
      cardDiv.innerHTML = `
        <button class="fav-card-star-btn" title="${currentLang === 'ko' ? '즐겨찾기 해제' : (currentLang === 'en' ? 'Remove Favorite' : 'お気に入り解除')}">
          <i class="fa-solid fa-star"></i>
        </button>
        <div class="freq-icon-wrapper"><i class="${meta.icon}"></i></div>
        <div class="freq-card-info">
          <h3>${appName}</h3>
          <span class="freq-visits">${meta.name}</span>
        </div>
        <div class="freq-launch-arrow">
          <i class="fa-solid fa-arrow-right"></i>
        </div>
      `;
      
      // Handle unfavorite
      const favStar = cardDiv.querySelector('.fav-card-star-btn');
      favStar.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(appKey);
      });
      
      cardDiv.addEventListener('mousemove', (e) => {
        const rect = cardDiv.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cardDiv.style.setProperty('--x', `${x}px`);
        cardDiv.style.setProperty('--y', `${y}px`);
      });
      
      container.appendChild(cardDiv);
    }
  });
}

function initFavorites() {
  const toolCards = document.querySelectorAll('.tool-card');
  const favorites = getFavorites();
  
  toolCards.forEach(card => {
    const launchBtn = card.querySelector('.btn-card-launch');
    if (!launchBtn) return;
    const href = launchBtn.getAttribute('href');
    const match = href.match(/\.\/([a-zA-Z0-9_-]+)\//);
    if (!match) return;
    const appKey = match[1];
    
    // Set attribute
    card.setAttribute('data-app-key', appKey);
    
    // Create star toggle button
    const starBtn = document.createElement('button');
    starBtn.className = 'tool-star-btn';
    starBtn.setAttribute('title', currentLang === 'ko' ? '즐겨찾기 추가/해제' : (currentLang === 'en' ? 'Add/Remove Favorite' : 'お気に入り登録/解除'));
    
    const isFav = favorites.includes(appKey);
    starBtn.innerHTML = isFav ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
    if (isFav) starBtn.classList.add('active');
    
    starBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(appKey);
    });
    
    card.appendChild(starBtn);
  });
  
  // Render favorites list
  renderFavorites();
}

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
    news: 0,
    youtube: 0
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

// --- 실시간 방문자 통계 바인딩 및 자주 쓰는 도구 정렬 ---
let lastVisitsData = null;

const APP_NAME_TRANSLATIONS = {
  '네이버 SEO': 'Naver SEO',
  'AI 뉴스': 'AI News',
  '유튜브 분석': 'YouTube Hub',
  '유튜브 검색': 'YouTube Search',
  '떡상 소재 채굴기': 'Viral Video Finder',
  'AI 영상 제작기': 'AI Video Generator',
  '체크리스트': 'Checklist',
  '로또 생성기': 'Lotto Generator',
  '오목 대국실': 'Omok Game Room',
  '장기 대국실': 'Janggi Game Room',
  '통합 계산기': 'All-in-One Calculator',
  '물가 통계': 'Price Stats',
  '사주 분석': 'Saju Fortune',
  '타로 카드': 'Tarot Cards',
  '스도쿠 Pro': 'Sudoku Pro',
  '테트리스': 'Tetris Pro',
  '2048 퍼즐': '2048 Puzzle',
  '갤러그 슈팅': 'Galaga Shooting',
  'QR 생성기': 'QR Code Generator',
  'PDF 도구': 'PDF Tools',
  '화소 검사기': 'Monitor Pixel Checker',
  '사과게임+': 'Apple Game+',
  '구슬 룰렛': 'Marble Roulette',
  '갓 필드': 'God Field',
  '토익 학습기': 'TOEIC Prep',
  '프린트 편집': 'Print Editor',
  'BMI 계산': 'BMI Calculator',
  'BMR 계산': 'BMR Calculator',
  'WHR 계산': 'WHR Calculator',
  'THR 계산': 'THR Calculator',
  '탄단지 계산': 'Macronutrient Calc',
  '수분 섭취': 'Water Intake',
  '혈압 계산': 'Blood Pressure Calc',
  '예상 키': 'Child Height Predictor',
  '운동 칼로리': 'Exercise Calories',
  '음식 분석': 'Food Nutrition Analyzer',
  '이모티콘': 'Emoticon Maker',
  '당구 3D': 'Billiards 3D',
  '국회의원': 'National Assembly Search',
  '의학 논문': 'Bio-Medical Paper Trends',
  '주식 동향': 'Stock Trends',
  '트렌드 분석': 'Search Trend Analyzer',
  '퀀트 시뮬레이션': 'Quant Simulator',
  '게임 뉴스': 'Game News Aggregator',
  '신경 게임': 'Neuro Reflex 3D',
  '카드 맞추기': 'Memory Match 3D',
  '블랙잭 3D': 'Blackjack 3D',
  '비행기 서바이벌': 'Vampire Survivors 3D',
  '티스토리 포스터': 'Tistory Auto-Poster',
  '워드프레스 포스터': 'WordPress Auto-Poster',
  '쿼리도 3D': 'Quoridor 3D',
  '루두스 코리오발리': 'Ludus Coriovalli 3D',
  '비디오 GIF/WebP 추출기': 'Video GIF/WebP Extractor',
  '네이버 블로그 종합 진단기': 'Naver Blog Stats & Quality Analyzer',
  '웩슬러 지능검사': 'Wechsler Intelligence Test',
  'JW 다운로더': 'JW Downloader'
};

async function updateVisitorStats() {
  try {
    const response = await fetch('/api/visits');
    if (!response.ok) return;
    const visits = await response.json();
    lastVisitsData = visits;

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

    // 4. 자주 쓰는 도구 렌더링
    renderFrequentTools();

  } catch (err) {
    console.error('실시간 방문 데이터 로드 실패:', err);
  }
}

// 자주 쓰는 도구 동적 렌더링 (한영 대응 및 방문자수 정렬 적용)
function renderFrequentTools() {
  const freqContainer = document.getElementById('frequent-tools-middle-container');
  if (!freqContainer || !lastVisitsData) return;

  const sortedApps = Object.entries(lastVisitsData)
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
      
      const count = (lastVisitsData[appKey] && lastVisitsData[appKey].total) || 0;
      const appName = currentLang === 'ko' ? meta.name : (APP_NAME_TRANSLATIONS[meta.name] || meta.name);
      const visitsText = currentLang === 'ko' ? `${count.toLocaleString()}회` : `${count.toLocaleString()} views`;

      cardDiv.innerHTML = `
        <div class="freq-card-badge">TOP ${idx + 1}</div>
        <div class="freq-icon-wrapper"><i class="${meta.icon}"></i></div>
        <div class="freq-card-info">
          <h3>${appName}</h3>
          <span class="freq-visits"><i class="fa-solid fa-eye"></i> ${visitsText}</span>
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

// --- Naver Blog RSS Loader (최신 6개 글 지원 및 다국어 요약문 매핑) ---
let lastBlogPosts = null;

async function loadNaverBlogFeed() {
  const container = document.getElementById('blog-posts-container');
  if (!container) return;

  try {
    const response = await fetch('/api/naver-blog/latest');
    if (!response.ok) throw new Error('API response not OK');
    lastBlogPosts = await response.json();
    renderNaverBlogFeed();
  } catch (error) {
    console.error('[Naver Blog] Failed to fetch feed:', error);
    const errorMsg = currentLang === 'ko' ? '블로그 글을 불러오는 중 오류가 발생했습니다.' : 'Failed to load blog posts.';
    container.innerHTML = `
      <div class="blog-loading-spinner" style="color: #ef4444;">
        <i class="fa-solid fa-circle-exclamation"></i> ${errorMsg}
      </div>
    `;
  }
}

function renderNaverBlogFeed() {
  const container = document.getElementById('blog-posts-container');
  if (!container || !lastBlogPosts) return;

  container.innerHTML = '';
  if (lastBlogPosts.length === 0) {
    const emptyMsg = currentLang === 'ko' ? '표시할 새 블로그 글이 없습니다.' : 
                     (currentLang === 'en' ? 'No new blog posts to display.' : '表示する新しいブログ記事がありません。');
    container.innerHTML = `<div class="blog-loading-spinner"><i class="fa-solid fa-triangle-exclamation"></i> ${emptyMsg}</div>`;
    return;
  }

  lastBlogPosts.forEach(post => {
    const card = document.createElement('article');
    card.className = 'blog-post-card glass-panel';
    
    // Choose title and summary based on selected language
    let title = post.title;
    let summary = post.summary;
    let btnLabel = '원글 보기';

    if (currentLang === 'en') {
      title = post.titleEn || post.title;
      summary = post.summaryEn || post.summary;
      btnLabel = 'View Post';
    } else if (currentLang === 'ja') {
      title = post.titleJa || post.title;
      summary = post.summaryJa || post.summary;
      btnLabel = '元の投稿';
    }

    card.innerHTML = `
      <div class="blog-post-meta">
        <span><i class="fa-solid fa-clock"></i> ${post.pubDate}</span>
        <span style="color: #10b981; font-weight: 700;">Naver Blog</span>
      </div>
      <h4>${title}</h4>
      <p class="blog-post-summary">${summary}</p>
      <div class="blog-post-footer">
        <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="btn-blog-link">
          ${btnLabel} <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </div>
    `;
    container.appendChild(card);
  });
}

// Attach event listener for refresh button
function initBlogFeed() {
  const btnRefresh = document.getElementById('btn-refresh-blog');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      const container = document.getElementById('blog-posts-container');
      if (container) {
        let loadingText = '최신 콘텐츠를 요약 정리하는 중...';
        if (currentLang === 'en') loadingText = 'Summarizing latest contents...';
        else if (currentLang === 'ja') loadingText = '最新コンテンツを要約中...';
        container.innerHTML = `
          <div class="blog-loading-spinner">
            <i class="fa-solid fa-circle-notch fa-spin"></i> ${loadingText}
          </div>
        `;
      }
      loadNaverBlogFeed();
    });
  }
  loadNaverBlogFeed();
}

// --- 한영일 다국어 시스템 번역 전환 엔진 ---
let currentLang = localStorage.getItem('site-lang') || 'ko';
let siteTranslations = null;

async function loadTranslations() {
  try {
    const response = await fetch('/translations.json');
    if (response.ok) {
      siteTranslations = await response.json();
      applyLanguage(currentLang);
    }
  } catch (err) {
    console.error('Failed to load translations:', err);
  }
}

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('site-lang', lang);

  // Update HTML lang attribute
  document.documentElement.setAttribute('lang', lang);

  // Update active state in language dropdown list
  const langItems = document.querySelectorAll('.lang-dropdown-item');
  langItems.forEach(item => {
    if (item.getAttribute('data-lang') === lang) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update dropdown trigger label text
  const selectedLabel = document.getElementById('selected-lang-label');
  if (selectedLabel) {
    if (lang === 'ko') selectedLabel.textContent = '한국어';
    else if (lang === 'en') selectedLabel.textContent = 'English';
    else if (lang === 'ja') selectedLabel.textContent = '日本語';
  }

  if (!siteTranslations) return;

  const ui = siteTranslations[lang] ? siteTranslations[lang].ui : null;
  const cards = siteTranslations[lang] ? siteTranslations[lang].cards : null;

  // Helper to update text of elements matching selector
  function translateSelectorText(selector, koreanText, englishText, japaneseText) {
    const el = document.querySelector(selector);
    if (!el) return;
    if (lang === 'ko') el.textContent = koreanText;
    else if (lang === 'en') el.textContent = englishText;
    else if (lang === 'ja') el.textContent = japaneseText;
  }

  // 1. Header Navigation links
  const navLinks = document.querySelectorAll('.header-nav a');
  navLinks.forEach(link => {
    let original = link.getAttribute('data-original');
    if (!original) {
      original = link.textContent.trim();
      link.setAttribute('data-original', original);
    }
    if (lang !== 'ko' && ui && ui[original]) {
      link.textContent = ui[original];
    } else {
      link.textContent = original;
    }
  });

  // Global search input placeholder
  const globalSearch = document.getElementById('global-search');
  if (globalSearch) {
    globalSearch.placeholder = lang === 'ko' ? '전체 검색...' : (lang === 'en' ? 'Search all...' : '全体検索...');
  }

  // Visits text in Header
  const headerVisitsSpan = document.querySelector('#header-visits-badge span');
  const mainSiteCounterEl = document.getElementById('main-site-counter');
  if (headerVisitsSpan && mainSiteCounterEl) {
    const counterVal = mainSiteCounterEl.textContent;
    let label = '방문:';
    if (lang === 'en') label = 'Visits:';
    else if (lang === 'ja') label = '訪問数:';
    headerVisitsSpan.innerHTML = `<i class="fa-solid fa-users"></i> ${label} <strong id="main-site-counter">${counterVal}</strong>`;
  }

  // Theme Toggle text
  const themeTextEl = document.querySelector('#theme-toggle span');
  if (themeTextEl) {
    let original = themeTextEl.getAttribute('data-original');
    if (!original) {
      original = themeTextEl.textContent.trim();
      themeTextEl.setAttribute('data-original', original);
    }
    if (original === '라이트') {
      if (lang === 'ko') themeTextEl.textContent = '라이트';
      else if (lang === 'en') themeTextEl.textContent = 'Light';
      else if (lang === 'ja') themeTextEl.textContent = 'ライト';
    } else {
      if (lang === 'ko') themeTextEl.textContent = '다크';
      else if (lang === 'en') themeTextEl.textContent = 'Dark';
      else if (lang === 'ja') themeTextEl.textContent = 'ダーク';
    }
  }

  // 2. Blog RSS Banner Header
  const blogBannerHeaderH3 = document.querySelector('.blog-banner-header h3');
  if (blogBannerHeaderH3) {
    if (lang === 'ko') blogBannerHeaderH3.textContent = 'sineaho 블로그 최신 요약 피드';
    else if (lang === 'en') blogBannerHeaderH3.textContent = 'sineaho Blog Latest Summary Feed';
    else if (lang === 'ja') blogBannerHeaderH3.textContent = 'sineahoブログの最新要約フィード';
  }

  // 3. Hero Section Title & Description & Buttons
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    if (lang === 'ko') {
      heroTitle.innerHTML = `CineAHO의 잡다한<br><span class="gradient-text">SandBOX에 오신것을 환영합니다.</span>`;
    } else if (lang === 'en') {
      heroTitle.innerHTML = `Welcome to CineAHO's<br><span class="gradient-text">Miscellaneous SandBOX.</span>`;
    } else if (lang === 'ja') {
      heroTitle.innerHTML = `CineAHO의 잡다한<br><span class="gradient-text">SandBOXへようこそ。</span>`;
    }
  }

  const heroDesc = document.querySelector('.hero-desc');
  if (heroDesc) {
    if (lang === 'ko') {
      heroDesc.innerHTML = `전문가급 유튜브 분석부터 생활 속 계산기, 로또 생성, 3D 게임까지 —<br>수백 가지의 프리미엄 도구를 설치 없이 브라우저에서 즉시 실행하세요.`;
    } else if (lang === 'en') {
      heroDesc.innerHTML = `From professional-grade YouTube analysis to daily calculators, lotto generators, and 3D games —<br>run hundreds of premium tools instantly in your browser without installation.`;
    } else if (lang === 'ja') {
      heroDesc.innerHTML = `プロレベルのYouTube分析から日常生活の計算機、ロト生成、3Dゲームまでー<br>インストール不要でブラウザから数百のプレミアムツールを即座に実行できます。`;
    }
  }

  const heroSearchInput = document.getElementById('hero-tool-search');
  if (heroSearchInput) {
    if (lang === 'ko') heroSearchInput.placeholder = '원하는 도구를 검색해보세요...';
    else if (lang === 'en') heroSearchInput.placeholder = 'Search for tools...';
    else if (lang === 'ja') heroSearchInput.placeholder = '使いたいツールを検索...';
  }

  const searchLaunchSpan = document.querySelector('#btn-search-launch span');
  if (searchLaunchSpan) {
    if (lang === 'ko') searchLaunchSpan.textContent = '실행하기';
    else if (lang === 'en') searchLaunchSpan.textContent = 'Launch';
    else if (lang === 'ja') searchLaunchSpan.textContent = '起動';
  }

  const btnHeroStartSpan = document.querySelector('.btn-hero-start span');
  if (btnHeroStartSpan) {
    if (lang === 'ko') btnHeroStartSpan.textContent = 'CineAHO 시작하기';
    else if (lang === 'en') btnHeroStartSpan.textContent = 'Get Started';
    else if (lang === 'ja') btnHeroStartSpan.textContent = 'スタート';
  }

  // 4. Hero Right Main Feature Card (YouTube 채널 분석)
  const mainFeatureCard = document.querySelector('.main-feature-card');
  if (mainFeatureCard) {
    const titleEl = mainFeatureCard.querySelector('.app-info h3');
    if (titleEl) {
      if (lang === 'ko') titleEl.textContent = 'YouTube 채널 분석';
      else if (lang === 'en') titleEl.textContent = 'YouTube Channel Analysis';
      else if (lang === 'ja') titleEl.textContent = 'YouTubeチャンネル分析';
    }

    const subEl = mainFeatureCard.querySelector('.app-info .app-sub');
    if (subEl) {
      if (lang === 'ko') subEl.textContent = '실시간 데이터 분석 플랫폼';
      else if (lang === 'en') subEl.textContent = 'Real-time Data Analysis Platform';
      else if (lang === 'ja') subEl.textContent = 'リアルタイムデータ分析プラットフォーム';
    }

    const statsLabels = mainFeatureCard.querySelectorAll('.card-stats .stat-item .stat-label');
    if (statsLabels.length >= 3) {
      if (lang === 'ko') {
        statsLabels[0].textContent = '채널 분석';
        statsLabels[1].textContent = 'RSS 뉴스';
        statsLabels[2].textContent = '실시간 뉴스 속보';
      } else if (lang === 'en') {
        statsLabels[0].textContent = 'Channels';
        statsLabels[1].textContent = 'RSS News';
        statsLabels[2].textContent = 'Breaking News';
      } else if (lang === 'ja') {
        statsLabels[0].textContent = 'チャンネル分析';
        statsLabels[1].textContent = 'RSSニュース';
        statsLabels[2].textContent = 'リアルタイム速報';
      }
    }

    const bullets = mainFeatureCard.querySelectorAll('.app-bullets li');
    if (bullets.length >= 3) {
      if (lang === 'ko') {
        bullets[0].innerHTML = `<span class="bullet bullet-green"></span> 190,015개의 채널 데이터 분석`;
        bullets[1].innerHTML = `<span class="bullet bullet-blue"></span> A1~C3 등급별 채널 분류`;
        bullets[2].innerHTML = `<span class="bullet bullet-purple"></span> 성장률, 지역별 통계 제공`;
      } else if (lang === 'en') {
        bullets[0].innerHTML = `<span class="bullet bullet-green"></span> 190,015 channel data points analyzed`;
        bullets[1].innerHTML = `<span class="bullet bullet-blue"></span> A1~C3 grade classification`;
        bullets[2].innerHTML = `<span class="bullet bullet-purple"></span> Growth rates, regional stats provided`;
      } else if (lang === 'ja') {
        bullets[0].innerHTML = `<span class="bullet bullet-green"></span> 190,015個のチャンネルデータを分析`;
        bullets[1].innerHTML = `<span class="bullet bullet-blue"></span> A1~C3等級別のチャンネル分類`;
        bullets[2].innerHTML = `<span class="bullet bullet-purple"></span> 成長率、地域別の統計を提供`;
      }
    }

    const btnLaunch = mainFeatureCard.querySelector('.btn-app-launch span');
    if (btnLaunch) {
      if (lang === 'ko') btnLaunch.textContent = '분석 시작하기';
      else if (lang === 'en') btnLaunch.textContent = 'Start Analysis';
      else if (lang === 'ja') btnLaunch.textContent = '分析スタート';
    }

  }

  // 5. Middle Section (Popular tools header)
  translateSelectorText('.frequent-tools-middle-section .middle-section-title', '가장 자주 쓰는 인기 도구', 'Most Popular Tools', '最もよく使われる人気ツール');
  translateSelectorText('.frequent-tools-middle-section .middle-section-subtitle', '방문자들이 최근 가장 많이 실행한 실시간 인기 도구 목록입니다.', 'Most launched real-time popular tools by visitors recently.', '訪問者が最近最も多く実行したリアルタイム人気ツールのリストです。');

  // 6. Bottom App section Title & Subtitle
  const portalSectionTitle = document.querySelector('.tools-portal-section .portal-section-title');
  if (portalSectionTitle) {
    const totalAppCounter = document.querySelector('.total-app-count');
    const totalAppCounterStr = totalAppCounter ? totalAppCounter.outerHTML : '';
    let t = '다양한 무료 온라인 도구 모음';
    if (lang === 'en') t = 'Various Free Online Tools';
    else if (lang === 'ja') t = '多様な無料オンラインツール集';
    portalSectionTitle.innerHTML = `${t} ${totalAppCounterStr}`;
  }
  
  // App Count badge text
  const appCountNumber = document.getElementById('total-app-count-number');
  if (appCountNumber) {
    const parent = appCountNumber.parentElement;
    if (parent) {
      const val = appCountNumber.textContent;
      if (lang === 'ko') parent.innerHTML = `총 <span id="total-app-count-number" style="color: #a855f7;">${val}</span>개`;
      else if (lang === 'en') parent.innerHTML = `<span id="total-app-count-number" style="color: #a855f7;">${val}</span> items`;
      else if (lang === 'ja') parent.innerHTML = `計 <span id="total-app-count-number" style="color: #a855f7;">${val}</span>個`;
    }
  }

  translateSelectorText('.tools-portal-section .portal-section-subtitle', 
                        '추가 설치 없이 웹브라우저에서 바로 사용할 수 있는 CineAHO의 유용한 도구 모음집입니다.', 
                        "CineAHO's collection of useful tools to use directly in web browsers without installation.", 
                        '追加インストールなしで、ブラウザから直接使用できるCineAHO의便利なツールコレクションです。');

  // Category Tabs
  const categoryTabBtns = document.querySelectorAll('.category-tab-btn');
  categoryTabBtns.forEach(btn => {
    const cat = btn.getAttribute('data-category');
    const badge = btn.querySelector('.category-count-badge');
    const badgeHtml = badge ? badge.outerHTML : '';
    const icon = btn.querySelector('i').outerHTML;
    
    let label = '';
    if (lang === 'ko') {
      if (cat === 'all') label = '전체보기';
      else if (cat === 'data') label = '데이터 & 분석';
      else if (cat === 'game') label = '게임 & 시뮬레이션';
      else if (cat === 'health') label = '건강 & 피트니스';
      else if (cat === 'productivity') label = '생산성 & 문서';
      else if (cat === 'entertainment') label = '엔터테인먼트';
      else if (cat === 'media') label = '디자인 & 마케팅';
      else if (cat === 'news') label = '뉴스 & 피드';
      else if (cat === 'youtube') label = '유튜브';
    } else if (lang === 'en') {
      if (cat === 'all') label = 'Show All';
      else if (cat === 'data') label = 'Data & Analysis';
      else if (cat === 'game') label = 'Games & Sims';
      else if (cat === 'health') label = 'Health & Fitness';
      else if (cat === 'productivity') label = 'Productivity';
      else if (cat === 'entertainment') label = 'Entertainment';
      else if (cat === 'media') label = 'Design & Marketing';
      else if (cat === 'news') label = 'News & Feeds';
      else if (cat === 'youtube') label = 'YouTube';
    } else if (lang === 'ja') {
      if (cat === 'all') label = 'すべて見る';
      else if (cat === 'data') label = 'データ＆分析';
      else if (cat === 'game') label = 'ゲーム＆シミュレーション';
      else if (cat === 'health') label = '健康＆フィットネス';
      else if (cat === 'productivity') label = '生産性＆文書';
      else if (cat === 'entertainment') label = 'エン터テインメント';
      else if (cat === 'media') label = 'デザイン＆マーケティング';
      else if (cat === 'news') label = 'ニュース＆フィード';
      else if (cat === 'youtube') label = 'YouTube';
    }
    
    btn.innerHTML = `${icon} ${label} ${badgeHtml}`;
  });

  // 7. Grid Tool Cards translation
  const toolCards = document.querySelectorAll('.tool-card');
  toolCards.forEach(card => {
    // Card Title
    const h3 = card.querySelector('h3');
    if (h3) {
      const originalTitle = h3.getAttribute('data-original') || h3.textContent.trim();
      if (!h3.getAttribute('data-original')) h3.setAttribute('data-original', originalTitle);
      
      if (lang !== 'ko' && cards && cards.titles[originalTitle]) {
        h3.textContent = cards.titles[originalTitle];
      } else {
        h3.textContent = originalTitle;
      }
    }

    // Card Description
    const desc = card.querySelector('.tool-desc');
    if (desc) {
      const originalDesc = desc.getAttribute('data-original') || desc.textContent.trim();
      if (!desc.getAttribute('data-original')) desc.setAttribute('data-original', originalDesc);

      if (lang !== 'ko' && cards && cards.descs[originalDesc]) {
        desc.textContent = cards.descs[originalDesc];
      } else {
        desc.textContent = originalDesc;
      }
    }

    // Card Category
    const categorySpan = card.querySelector('.tool-category');
    if (categorySpan) {
      const originalCat = categorySpan.getAttribute('data-original') || categorySpan.textContent.trim();
      if (!categorySpan.getAttribute('data-original')) categorySpan.setAttribute('data-original', originalCat);
      
      const catText = originalCat.replace(/[\s\n\r]/g, '');
      let matchedKey = null;
      if (cards) {
        for (const k in cards.categories) {
          if (k.replace(/\s/g, '') === catText || originalCat.includes(k)) {
            matchedKey = k;
            break;
          }
        }
      }

      const icon = categorySpan.querySelector('i') ? categorySpan.querySelector('i').outerHTML : '';
      if (lang !== 'ko' && matchedKey && cards && cards.categories[matchedKey]) {
        categorySpan.innerHTML = `${icon} ${cards.categories[matchedKey]}`;
      } else {
        categorySpan.innerHTML = `${icon} ${originalCat.replace(/<[^>]*>/g, '')}`;
      }
    }

    // Card Button
    const launchBtn = card.querySelector('.btn-card-launch');
    if (launchBtn) {
      const icon = launchBtn.querySelector('i') ? launchBtn.querySelector('i').outerHTML : '';
      let btnLabel = '실행하기';
      if (lang === 'en') btnLabel = 'Launch';
      else if (lang === 'ja') btnLabel = '起動';
      launchBtn.innerHTML = `${btnLabel} ${icon}`;
    }
  });

  // Re-render popular tools to draw in the active language
  renderFrequentTools();

  // 8. Footer Section
  const footerBrandTitle = document.querySelector('.brand-title h2');
  if (footerBrandTitle) {
    footerBrandTitle.textContent = lang === 'ko' ? "Cineaho's SandBox" : "CineAHO's SandBox";
  }

  // Footer site visits stats headings
  const footerStatsHeaders = document.querySelectorAll('.visitor-stats .stat-group h4');
  if (footerStatsHeaders.length >= 2) {
    if (lang === 'ko') {
      footerStatsHeaders[0].textContent = '사이트 방문';
      footerStatsHeaders[1].textContent = '이 앱 방문';
    } else if (lang === 'en') {
      footerStatsHeaders[0].textContent = 'Site Visits';
      footerStatsHeaders[1].textContent = 'App Visits';
    } else if (lang === 'ja') {
      footerStatsHeaders[0].textContent = 'サイト訪問数';
      footerStatsHeaders[1].textContent = 'アプリ訪問数';
    }
  }

  // Footer site visits stats descriptions
  const footerStatsDescs = document.querySelectorAll('.visitor-stats .stat-group p');
  footerStatsDescs.forEach(p => {
    const spans = p.querySelectorAll('span');
    if (spans.length >= 4) {
      const total = spans[0].textContent;
      const today = spans[1].textContent;
      const utotal = spans[2].textContent;
      const utoday = spans[3].textContent;
      
      if (lang === 'ko') {
        p.innerHTML = `전체 <span id="${spans[0].id}">${total}</span> · 오늘 <span id="${spans[1].id}">${today}</span> · 고유 전체 <span id="${spans[2].id}">${utotal}</span> · 고유 오늘 <span id="${spans[3].id}">${utoday}</span>`;
      } else if (lang === 'en') {
        p.innerHTML = `Total <span id="${spans[0].id}">${total}</span> · Today <span id="${spans[1].id}">${today}</span> · Unique Total <span id="${spans[2].id}">${utotal}</span> · Unique Today <span id="${spans[3].id}">${utoday}</span>`;
      } else if (lang === 'ja') {
        p.innerHTML = `累計 <span id="${spans[0].id}">${total}</span> · 本日 <span id="${spans[1].id}">${today}</span> · ユニーク累計 <span id="${spans[2].id}">${utotal}</span> · ユニーク本日 <span id="${spans[3].id}">${utoday}</span>`;
      }
    }
  });

  const footerStatsLink = document.querySelector('.stats-link');
  if (footerStatsLink) {
    footerStatsLink.innerHTML = lang === 'ko' ? '방문 통계 / 인기 앱 순위 보러 가기 &rarr;' : 'View Visit Stats / Popular App Rankings &rarr;';
  }

  // Footer columns headings
  const footerColHeadings = document.querySelectorAll('.footer-right-columns .footer-col h3');
  if (footerColHeadings.length >= 3) {
    footerColHeadings[0].textContent = lang === 'ko' ? '제품' : 'Products';
    footerColHeadings[1].textContent = lang === 'ko' ? '지원' : 'Support';
    footerColHeadings[2].textContent = lang === 'ko' ? '법적 고지' : 'Legal Notice';
  }

  // Footer sublinks
  const footerColLinks = document.querySelectorAll('.footer-right-columns .footer-col a');
  footerColLinks.forEach(link => {
    const text = link.textContent.trim();
    if (ui && ui[text]) {
      link.textContent = ui[text];
    }
  });

  const copyrightEl = document.querySelector('.footer-copyright');
  if (copyrightEl) {
    copyrightEl.textContent = lang === 'ko' ? 
      "CineAHO's SandBox - 모든 도구를 한 곳에서 © 2025 Cineaho. All right reserved." :
      "CineAHO's SandBox - All tools in one place © 2025 Cineaho. All right reserved.";
  }

  // Favorites Section Translation
  const favTitle = document.getElementById('fav-section-title');
  const favSubtitle = document.getElementById('fav-section-subtitle');
  if (favTitle && favSubtitle) {
    if (lang === 'ko') {
      favTitle.textContent = '내가 즐겨찾는 도구';
      favSubtitle.textContent = '빠르게 접근하기 위해 즐겨찾기(별표)를 등록한 도구 목록입니다.';
    } else if (lang === 'en') {
      favTitle.textContent = 'My Favorites';
      favSubtitle.textContent = 'A list of tools you bookmarked for quick access.';
    } else if (lang === 'ja') {
      favTitle.textContent = 'お気に入りツール';
      favSubtitle.textContent = 'クイックアクセスのためにお気に入り（星印）에 登録したツールの一覧です。';
    }
  }

  // Update star button titles for the main cards
  toolCards.forEach(card => {
    const starBtn = card.querySelector('.tool-star-btn');
    if (starBtn) {
      starBtn.setAttribute('title', lang === 'ko' ? '즐겨찾기 추가/해제' : (lang === 'en' ? 'Add/Remove Favorite' : 'お気に入り登録/解除'));
    }
  });

  // Re-render favorites list to update empty state or category descriptions inside favorites cards
  renderFavorites();

  // Refresh Naver Blog layout to match language
  renderNaverBlogFeed();
}

// 초기화 시 방문자수, 앱 개수, 블로그 피드 및 다국어 시스템 로드 실행
window.addEventListener('DOMContentLoaded', () => {
  updateVisitorStats();
  initAppCounts();
  initBlogFeed();
  initFavorites();
  
  // Initialize language dropdown selector
  const langDropdown = document.getElementById('lang-dropdown');
  const langTrigger = document.getElementById('btn-lang-trigger');
  const langItems = document.querySelectorAll('.lang-dropdown-item');

  if (langTrigger && langDropdown) {
    langTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!langDropdown.contains(e.target)) {
        langDropdown.classList.remove('open');
      }
    });
  }

  langItems.forEach(item => {
    item.addEventListener('click', () => {
      const nextLang = item.getAttribute('data-lang');
      applyLanguage(nextLang);
      if (langDropdown) {
        langDropdown.classList.remove('open');
      }
    });
  });
  loadTranslations();
});
