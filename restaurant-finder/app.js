/* ==========================================
   CineAHO Restaurant Finder – app.js
   Real API Integration (Naver / Kakao / Google Places)
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ── DOM Refs ──
  const searchInput = document.getElementById('search-input');
  const btnSearch = document.getElementById('btn-search');
  const useLocationCb = document.getElementById('use-location');
  const sortSelect = document.getElementById('sort-select');
  const locationInfo = document.getElementById('location-info');
  const locationText = document.getElementById('location-text');

  const resultStats = document.getElementById('result-stats');
  const statsSource = document.getElementById('stats-source');
  const statsCount = document.getElementById('stats-count');
  const statsQuery = document.getElementById('stats-query');
  const statsTime = document.getElementById('stats-time');

  const loadingSpinner = document.getElementById('loading-spinner');
  const errorContainer = document.getElementById('error-container');
  const errorMessage = document.getElementById('error-message');
  const emptyState = document.getElementById('empty-state');
  const resultsGrid = document.getElementById('results-grid');

  const paginationBar = document.getElementById('pagination-bar');
  const btnPrevPage = document.getElementById('btn-prev-page');
  const btnNextPage = document.getElementById('btn-next-page');
  const pageInfoEl = document.getElementById('page-info');

  const settingsToggle = document.getElementById('settings-toggle');
  const settingsPanel = document.getElementById('settings-panel');
  const settingsArrow = document.getElementById('settings-arrow');
  const apiKeyStatus = document.getElementById('api-key-status');

  const keyNaverId = document.getElementById('key-naver-id');
  const keyNaverSecret = document.getElementById('key-naver-secret');
  const keyKakao = document.getElementById('key-kakao');
  const keyGoogle = document.getElementById('key-google');
  const btnSaveKeys = document.getElementById('btn-save-keys');
  const btnClearKeys = document.getElementById('btn-clear-keys');

  const apiTabs = document.querySelectorAll('.api-tab');
  const tagBtns = document.querySelectorAll('.tag-btn');

  const guideBadge = document.getElementById('guide-badge');
  const guideTitle = document.getElementById('guide-title');
  const guideBody = document.getElementById('guide-body');
  const guideItems = document.querySelectorAll('.guide-index-list li');

  // ── State ──
  let currentSource = 'naver';
  let currentPage = 1;
  let totalResults = 0;
  let lastResults = [];
  let userLat = null;
  let userLng = null;
  let serverKeyStatus = { naver: false, kakao: false, google: false };

  // ── Load saved API keys from localStorage ──
  const loadSavedKeys = () => {
    const saved = JSON.parse(localStorage.getItem('rf_api_keys') || '{}');
    if (saved.naverId) keyNaverId.value = saved.naverId;
    if (saved.naverSecret) keyNaverSecret.value = saved.naverSecret;
    if (saved.kakao) keyKakao.value = saved.kakao;
    if (saved.google) keyGoogle.value = saved.google;
  };

  const saveKeys = () => {
    localStorage.setItem('rf_api_keys', JSON.stringify({
      naverId: keyNaverId.value.trim(),
      naverSecret: keyNaverSecret.value.trim(),
      kakao: keyKakao.value.trim(),
      google: keyGoogle.value.trim()
    }));
  };

  const getApiKey = (type) => {
    const saved = JSON.parse(localStorage.getItem('rf_api_keys') || '{}');
    switch (type) {
      case 'naverId': return saved.naverId || '';
      case 'naverSecret': return saved.naverSecret || '';
      case 'kakao': return saved.kakao || '';
      case 'google': return saved.google || '';
    }
    return '';
  };

  // ── Check server API key status ──
  const checkServerKeys = async () => {
    try {
      const res = await fetch('/api/restaurant/status');
      serverKeyStatus = await res.json();
    } catch (e) {
      console.warn('서버 API 키 상태 확인 실패:', e);
    }

    // Render status badges
    apiKeyStatus.innerHTML = '';
    const badges = [
      { name: '네이버', key: 'naver', hasServer: serverKeyStatus.naver, hasLocal: !!(getApiKey('naverId') && getApiKey('naverSecret')) },
      { name: '카카오', key: 'kakao', hasServer: serverKeyStatus.kakao, hasLocal: !!getApiKey('kakao') },
      { name: 'Google', key: 'google', hasServer: serverKeyStatus.google, hasLocal: !!getApiKey('google') }
    ];
    badges.forEach(b => {
      const ok = b.hasServer || b.hasLocal;
      const badge = document.createElement('div');
      badge.className = `key-status-badge ${ok ? 'ok' : 'missing'}`;
      badge.innerHTML = `<i class="fa-solid ${ok ? 'fa-check-circle' : 'fa-times-circle'}"></i> ${b.name}: ${b.hasServer ? '서버 키 ✓' : (b.hasLocal ? '로컬 키 ✓' : '미설정')}`;
      apiKeyStatus.appendChild(badge);
    });
  };

  // ── Geolocation ──
  useLocationCb.addEventListener('change', () => {
    if (useLocationCb.checked) {
      locationInfo.style.display = 'flex';
      locationText.textContent = '위치 확인 중...';
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          userLat = pos.coords.latitude;
          userLng = pos.coords.longitude;
          locationText.textContent = `${userLat.toFixed(4)}, ${userLng.toFixed(4)}`;
        },
        (err) => {
          locationText.textContent = '위치 접근 실패';
          useLocationCb.checked = false;
          setTimeout(() => { locationInfo.style.display = 'none'; }, 2000);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      locationInfo.style.display = 'none';
      userLat = null;
      userLng = null;
    }
  });

  // ── API Tab Switching ──
  apiTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      apiTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentSource = tab.dataset.source;
    });
  });

  // ── Quick Tags ──
  tagBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      searchInput.value = btn.dataset.query;
      performSearch();
    });
  });

  // ── Search ──
  btnSearch.addEventListener('click', performSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  async function performSearch(page = 1) {
    const query = searchInput.value.trim();
    if (!query) {
      searchInput.focus();
      return;
    }

    currentPage = page;
    showLoading();

    const startTime = Date.now();

    try {
      let results;
      switch (currentSource) {
        case 'naver':
          results = await searchNaver(query, page);
          break;
        case 'kakao':
          results = await searchKakao(query, page);
          break;
        case 'google':
          results = await searchGoogle(query);
          break;
      }

      const elapsed = Date.now() - startTime;
      lastResults = results.items;
      totalResults = results.total;

      // Sort
      sortResults();

      showResults(results.items, results.total, query, elapsed, page, results.totalPages);
    } catch (err) {
      showError(err.message);
    }
  }

  // ── Sort ──
  function sortResults() {
    const sortBy = sortSelect.value;
    if (sortBy === 'rating') {
      lastResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'name') {
      lastResults.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    }
    // 'accuracy' keeps API default order
  }

  sortSelect.addEventListener('change', () => {
    if (lastResults.length > 0) {
      sortResults();
      renderCards(lastResults);
    }
  });

  // ── Naver Search ──
  async function searchNaver(query, page) {
    const params = new URLSearchParams({ query, display: 5, start: (page - 1) * 5 + 1, sort: 'random' });

    // Pass local keys if server doesn't have them
    if (!serverKeyStatus.naver) {
      const id = getApiKey('naverId');
      const secret = getApiKey('naverSecret');
      if (id) params.append('clientId', id);
      if (secret) params.append('clientSecret', secret);
    }

    const res = await fetch(`/api/restaurant/naver?${params}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '네이버 API 오류');

    const items = (data.items || []).map((item, idx) => ({
      source: 'naver',
      name: stripHtml(item.title),
      category: item.category || '',
      address: item.roadAddress || item.address || '',
      phone: item.telephone || '',
      link: item.link || '',
      rating: null,
      ratingCount: null,
      mapUrl: item.link || '',
      lat: null,
      lng: null
    }));

    return { items, total: data.total || items.length, totalPages: Math.ceil((data.total || items.length) / 5) };
  }

  // ── Kakao Search ──
  async function searchKakao(query, page) {
    const params = new URLSearchParams({ query, page, size: 15, sort: 'accuracy' });
    if (userLat && userLng) {
      params.append('y', userLat);
      params.append('x', userLng);
      params.append('radius', 5000);
    }

    if (!serverKeyStatus.kakao) {
      const key = getApiKey('kakao');
      if (key) params.append('apiKey', key);
    }

    const res = await fetch(`/api/restaurant/kakao?${params}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '카카오 API 오류');

    const items = (data.documents || []).map((doc) => ({
      source: 'kakao',
      name: doc.place_name || '',
      category: doc.category_name || '',
      address: doc.road_address_name || doc.address_name || '',
      phone: doc.phone || '',
      link: doc.place_url || '',
      rating: null,
      ratingCount: null,
      mapUrl: doc.place_url || '',
      lat: doc.y ? parseFloat(doc.y) : null,
      lng: doc.x ? parseFloat(doc.x) : null,
      distance: doc.distance ? parseInt(doc.distance) : null
    }));

    const meta = data.meta || {};
    const total = meta.total_count || items.length;
    const isEnd = meta.is_end !== false;

    return { items, total, totalPages: isEnd ? page : page + 1 };
  }

  // ── Google Places Search ──
  async function searchGoogle(query) {
    const params = new URLSearchParams({ query });
    if (userLat && userLng) {
      params.append('lat', userLat);
      params.append('lng', userLng);
      params.append('radius', 5000);
    }

    if (!serverKeyStatus.google) {
      const key = getApiKey('google');
      if (key) params.append('apiKey', key);
    }

    const res = await fetch(`/api/restaurant/google?${params}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Google Places API 오류');

    const items = (data.places || []).map((place) => ({
      source: 'google',
      name: place.displayName?.text || '',
      category: place.primaryTypeDisplayName?.text || place.primaryType || '',
      address: place.formattedAddress || '',
      phone: place.nationalPhoneNumber || '',
      link: place.websiteUri || '',
      rating: place.rating || null,
      ratingCount: place.userRatingCount || null,
      mapUrl: place.googleMapsUri || '',
      lat: null,
      lng: null,
      businessStatus: place.businessStatus || '',
      priceLevel: place.priceLevel || '',
      photos: place.photos || [],
      openNow: place.currentOpeningHours?.openNow
    }));

    return { items, total: items.length, totalPages: 1 };
  }

  // ── Utility ──
  function stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  // ── UI State Helpers ──
  function showLoading() {
    loadingSpinner.style.display = 'flex';
    errorContainer.style.display = 'none';
    emptyState.style.display = 'none';
    resultsGrid.innerHTML = '';
    resultStats.style.display = 'none';
    paginationBar.style.display = 'none';
  }

  function showError(msg) {
    loadingSpinner.style.display = 'none';
    errorContainer.style.display = 'flex';
    errorMessage.textContent = msg;
    emptyState.style.display = 'none';
    resultsGrid.innerHTML = '';
    resultStats.style.display = 'none';
    paginationBar.style.display = 'none';
  }

  function showResults(items, total, query, elapsed, page, totalPages) {
    loadingSpinner.style.display = 'none';
    errorContainer.style.display = 'none';
    emptyState.style.display = 'none';

    // Stats bar
    resultStats.style.display = 'flex';
    statsSource.textContent = currentSource.toUpperCase();
    statsSource.className = `stats-source ${currentSource}`;
    statsCount.textContent = `${total.toLocaleString()}건`;
    statsQuery.textContent = `"${query}" 검색 결과`;
    statsTime.textContent = `${(elapsed / 1000).toFixed(2)}초`;

    if (items.length === 0) {
      resultsGrid.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><h3>검색 결과가 없습니다</h3><p>다른 검색어를 시도해보세요.</p></div>';
      paginationBar.style.display = 'none';
      return;
    }

    renderCards(items);

    // Pagination
    if (currentSource !== 'google' && totalPages > 1) {
      paginationBar.style.display = 'flex';
      pageInfoEl.textContent = `${page} / ${totalPages}`;
      btnPrevPage.disabled = page <= 1;
      btnNextPage.disabled = page >= totalPages;
    } else {
      paginationBar.style.display = 'none';
    }
  }

  // ── Render Restaurant Cards ──
  function renderCards(items) {
    resultsGrid.innerHTML = '';

    items.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'restaurant-card';

      // Rating HTML
      let ratingHtml = '';
      if (item.rating) {
        const stars = renderStars(item.rating);
        ratingHtml = `
          <div class="card-rating">
            <div class="rating-stars">${stars}</div>
            <span class="rating-value">${item.rating.toFixed(1)}</span>
            ${item.ratingCount ? `<span class="rating-count">(${item.ratingCount.toLocaleString()})</span>` : ''}
          </div>`;
      } else {
        ratingHtml = `<span class="no-rating">별점 정보 없음 ${currentSource !== 'google' ? '(Google API만 제공)' : ''}</span>`;
      }

      // Business status
      let statusHtml = '';
      if (item.openNow !== undefined) {
        statusHtml = item.openNow 
          ? '<span class="status-open"><i class="fa-solid fa-circle"></i> 영업 중</span>'
          : '<span class="status-closed"><i class="fa-solid fa-circle"></i> 영업 종료</span>';
      }

      // Price level
      let priceHtml = '';
      if (item.priceLevel) {
        const levels = { PRICE_LEVEL_FREE: '무료', PRICE_LEVEL_INEXPENSIVE: '₩', PRICE_LEVEL_MODERATE: '₩₩', PRICE_LEVEL_EXPENSIVE: '₩₩₩', PRICE_LEVEL_VERY_EXPENSIVE: '₩₩₩₩' };
        priceHtml = levels[item.priceLevel] || '';
      }

      // Category badge
      let categoryShort = item.category;
      if (categoryShort && categoryShort.includes('>')) {
        const parts = categoryShort.split('>');
        categoryShort = parts[parts.length - 1].trim();
      }
      if (categoryShort && categoryShort.length > 12) {
        categoryShort = categoryShort.substring(0, 12) + '…';
      }

      card.innerHTML = `
        <div class="card-top">
          <div class="card-rank ${idx < 3 ? 'rank-top' : 'rank-normal'}">${idx + 1}</div>
          <div class="card-name">${escapeHtml(item.name)}</div>
          ${categoryShort ? `<span class="card-category">${escapeHtml(categoryShort)}</span>` : ''}
        </div>
        ${ratingHtml}
        <div class="card-details">
          ${item.address ? `<div class="detail-row"><i class="fa-solid fa-location-dot"></i><span>${escapeHtml(item.address)}</span></div>` : ''}
          ${item.phone ? `<div class="detail-row"><i class="fa-solid fa-phone"></i><a href="tel:${item.phone}">${item.phone}</a></div>` : ''}
          ${item.distance ? `<div class="detail-row"><i class="fa-solid fa-ruler"></i><span>${item.distance >= 1000 ? (item.distance / 1000).toFixed(1) + 'km' : item.distance + 'm'}</span></div>` : ''}
          ${statusHtml ? `<div class="detail-row"><i class="fa-solid fa-clock"></i>${statusHtml}</div>` : ''}
          ${priceHtml ? `<div class="detail-row"><i class="fa-solid fa-money-bill"></i><span>${priceHtml}</span></div>` : ''}
        </div>
        <div class="card-actions">
          ${item.mapUrl ? `<a href="${item.mapUrl}" target="_blank" rel="noopener" class="btn-card-action"><i class="fa-solid fa-map"></i> 지도</a>` : ''}
          ${item.link && item.link !== item.mapUrl ? `<a href="${item.link}" target="_blank" rel="noopener" class="btn-card-action"><i class="fa-solid fa-globe"></i> 웹사이트</a>` : ''}
          ${item.phone ? `<a href="tel:${item.phone}" class="btn-card-action"><i class="fa-solid fa-phone"></i> 전화</a>` : ''}
        </div>`;

      resultsGrid.appendChild(card);
    });
  }

  function renderStars(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        html += '<i class="fa-solid fa-star star-filled"></i>';
      } else if (rating >= i - 0.5) {
        html += '<i class="fa-solid fa-star-half-stroke star-half"></i>';
      } else {
        html += '<i class="fa-regular fa-star star-empty"></i>';
      }
    }
    return html;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Pagination ──
  btnPrevPage.addEventListener('click', () => {
    if (currentPage > 1) performSearch(currentPage - 1);
  });
  btnNextPage.addEventListener('click', () => {
    performSearch(currentPage + 1);
  });

  // ── Settings Panel Toggle ──
  settingsToggle.addEventListener('click', () => {
    const isOpen = settingsPanel.style.display !== 'none';
    settingsPanel.style.display = isOpen ? 'none' : 'block';
    settingsArrow.classList.toggle('open', !isOpen);
  });

  btnSaveKeys.addEventListener('click', () => {
    saveKeys();
    checkServerKeys();
    alert('API 키가 저장되었습니다.');
  });

  btnClearKeys.addEventListener('click', () => {
    localStorage.removeItem('rf_api_keys');
    keyNaverId.value = '';
    keyNaverSecret.value = '';
    keyKakao.value = '';
    keyGoogle.value = '';
    checkServerKeys();
    alert('API 키가 초기화되었습니다.');
  });

  // ── Guide ──
  const GUIDES = [
    {
      badge: '가이드 01: 개요',
      title: '맛집 탐색기란?',
      body: `맛집 탐색기는 <strong>네이버, 카카오, Google</strong> 세 가지 실제 API를 연동하여 전국의 식당 정보를 실시간으로 검색하는 앱입니다.<br><br>
      검색어를 입력하면 선택한 API를 통해 식당의 <strong>이름, 주소, 전화번호, 카테고리</strong> 정보를 가져오며, Google Places API는 추가로 <strong>⭐ 별점과 리뷰 수</strong>를 제공합니다.<br><br>
      별점순 정렬, 위치 기반 검색, 빠른 검색 태그 등 다양한 기능을 활용하여 원하는 맛집을 손쉽게 찾아보세요.`
    },
    {
      badge: '가이드 02: API 키 발급',
      title: 'API 키 발급 방법',
      body: `<strong>🟢 네이버 검색 API</strong><br>
      1. <a href="https://developers.naver.com" target="_blank">developers.naver.com</a> 접속<br>
      2. 애플리케이션 등록 → "검색" 선택<br>
      3. Client ID와 Client Secret 발급<br>
      4. 일일 25,000건 무료<br><br>
      <strong>🟡 카카오 로컬 API</strong><br>
      1. <a href="https://developers.kakao.com" target="_blank">developers.kakao.com</a> 접속<br>
      2. 내 애플리케이션 → 앱 추가<br>
      3. REST API 키 복사<br>
      4. 일일 100,000건 무료<br><br>
      <strong>🔵 Google Places API</strong><br>
      1. <a href="https://console.cloud.google.com" target="_blank">Google Cloud Console</a> 접속<br>
      2. Places API (New) 활성화<br>
      3. API 키 생성<br>
      4. 월 10,000건 무료 (결제 계정 필요)`
    },
    {
      badge: '가이드 03: 별점 검색',
      title: '별점순 정렬 활용법',
      body: `<strong>⭐ 별점 데이터는 Google Places API만 제공합니다.</strong><br><br>
      네이버와 카카오 API는 정책상 별점/리뷰 데이터를 공개 API로 제공하지 않습니다. 따라서 별점순 정렬은 Google 소스에서만 의미가 있습니다.<br><br>
      <strong>별점순 정렬 방법:</strong><br>
      1. 상단 API 탭에서 "Google" 선택<br>
      2. 검색어 입력 후 검색<br>
      3. 정렬 드롭다운에서 "별점순" 선택<br><br>
      <strong>팁:</strong> "내 위치 사용"을 켜면 현재 위치 기반으로 가까운 식당을 우선 검색할 수 있습니다.`
    },
    {
      badge: '가이드 04: API 비교',
      title: 'API별 특징 비교',
      body: `<table style="width:100%; border-collapse:collapse; font-size:0.78rem;">
      <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
        <th style="text-align:left;padding:6px 8px;color:var(--text-main)">항목</th>
        <th style="padding:6px 8px;color:#00c73c">네이버</th>
        <th style="padding:6px 8px;color:#d9a600">카카오</th>
        <th style="padding:6px 8px;color:#4285f4">Google</th>
      </tr>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.03);">
        <td style="padding:6px 8px">별점</td><td style="text-align:center">❌</td><td style="text-align:center">❌</td><td style="text-align:center">✅</td>
      </tr>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.03);">
        <td style="padding:6px 8px">리뷰 수</td><td style="text-align:center">❌</td><td style="text-align:center">❌</td><td style="text-align:center">✅</td>
      </tr>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.03);">
        <td style="padding:6px 8px">한국 데이터</td><td style="text-align:center">⭐⭐⭐</td><td style="text-align:center">⭐⭐⭐</td><td style="text-align:center">⭐⭐</td>
      </tr>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.03);">
        <td style="padding:6px 8px">무료 쿼터</td><td style="text-align:center">25K/일</td><td style="text-align:center">100K/일</td><td style="text-align:center">10K/월</td>
      </tr>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.03);">
        <td style="padding:6px 8px">영업 상태</td><td style="text-align:center">❌</td><td style="text-align:center">❌</td><td style="text-align:center">✅</td>
      </tr>
      <tr>
        <td style="padding:6px 8px">결제 계정</td><td style="text-align:center">불필요</td><td style="text-align:center">불필요</td><td style="text-align:center">필요</td>
      </tr>
      </table>`
    },
    {
      badge: '가이드 05: FAQ',
      title: '자주 묻는 질문',
      body: `<strong>Q. API 키 없이 사용할 수 있나요?</strong><br>
      아니요. 실제 API를 호출하려면 각 플랫폼에서 발급받은 API 키가 필요합니다. 서버 .env 파일에 등록하거나 설정 패널에서 직접 입력할 수 있습니다.<br><br>
      <strong>Q. API 키는 어디에 저장되나요?</strong><br>
      설정 패널에서 입력한 키는 브라우저의 localStorage에만 저장됩니다. 서버로 전송되지만, 서버는 API 호출에만 사용하고 별도로 저장하지 않습니다.<br><br>
      <strong>Q. 네이버에서 별점이 안 보이는 이유는?</strong><br>
      네이버와 카카오 API는 정책상 별점/리뷰 데이터를 공개 API로 제공하지 않습니다. 별점을 보려면 Google Places API를 사용하세요.<br><br>
      <strong>Q. 검색 결과가 적게 나옵니다.</strong><br>
      네이버 API는 한 번에 최대 5건, 카카오는 15건, Google은 20건까지 반환합니다. 페이지네이션을 통해 추가 결과를 확인할 수 있습니다.`
    }
  ];

  guideItems.forEach((li, idx) => {
    li.addEventListener('click', () => {
      guideItems.forEach(l => l.classList.remove('active'));
      li.classList.add('active');
      showGuide(idx);
    });
  });

  function showGuide(idx) {
    const g = GUIDES[idx];
    guideBadge.textContent = g.badge;
    guideTitle.textContent = g.title;
    guideBody.innerHTML = g.body;
  }

  // ── Floating Nav ──
  document.getElementById('btn-scroll-top')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.getElementById('btn-scroll-bottom')?.addEventListener('click', () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));

  // ── Visitor Stats ──
  async function updateVisitorStats() {
    try {
      const response = await fetch('/api/visits');
      if (!response.ok) return;
      const visits = await response.json();
      const mainStats = visits['main'] || { total: 0, today: 0 };
      const el = document.getElementById('site-visit-total');
      if (el) el.textContent = mainStats.total.toLocaleString();
      const el2 = document.getElementById('site-visit-today');
      if (el2) el2.textContent = mainStats.today.toLocaleString();
    } catch (e) { /* silent */ }
  }

  // ── Init ──
  loadSavedKeys();
  checkServerKeys();
  showGuide(0);
  updateVisitorStats();
});
