/* ==========================================
   CineAHO Shopping Price & Rank Analyzer
   JavaScript Client Logic & Visualization
   ========================================== */

// Global App State
let productsDataset = [];
let queryKeyword = '';
let priceSliderMinVal = 0;
let priceSliderMaxVal = 0;

// Chart references
let priceDistChart = null;
let mallCompareChart = null;

// DOM ready initialization
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSearchForm();
  initFilters();
  initModal();
  updateVisitorStats();
});

// 1. Theme Loader & Toggle
function initTheme() {
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
    
    // Refresh charts to apply theme colors
    if (productsDataset.length > 0) {
      renderCharts();
    }
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
}

// 2. Search Box & Quick Tags setup
function initSearchForm() {
  const btnSearch = document.getElementById('btn-shopping-search');
  const queryInput = document.getElementById('shopping-query-input');
  
  if (btnSearch && queryInput) {
    btnSearch.addEventListener('click', () => {
      performSearch(queryInput.value.trim());
    });
    queryInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch(queryInput.value.trim());
      }
    });
  }

  // Quick Tags
  document.querySelectorAll('.quick-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const query = tag.getAttribute('data-query');
      if (queryInput) queryInput.value = query;
      performSearch(query);
    });
  });
}

// 3. Perform Search API query
async function performSearch(query) {
  if (!query) {
    showToast('입력 오류', '검색어를 입력해 주세요.', 'fa-solid fa-circle-exclamation');
    return;
  }

  // Toggle state panels
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('dashboard-state').style.display = 'none';
  document.getElementById('loading-state').style.display = 'flex';

  queryKeyword = query;

  try {
    const response = await fetch(`/api/shopping/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('서버 응답 오류');
    
    const resData = await response.json();
    if (resData.success) {
      productsDataset = resData.products;
      
      // Update KPIs
      updateKPIs(resData.metrics, productsDataset[0]);
      
      // Setup Price Sliders bounds based on response metrics
      setupPriceSliders(resData.metrics.minPrice, resData.metrics.maxPrice);
      
      // Populate Source Badge (Fallback or Scraped)
      const sourceBadge = document.getElementById('backend-source-badge');
      if (sourceBadge) {
        if (resData.isFallback) {
          sourceBadge.textContent = '인공지능 정교형 모의 데이터';
          sourceBadge.style.color = '#fb923c';
          sourceBadge.style.borderColor = 'rgba(251, 146, 60, 0.3)';
          sourceBadge.style.background = 'rgba(251, 146, 60, 0.08)';
        } else {
          sourceBadge.textContent = '실시간 쇼핑 연동 데이터';
          sourceBadge.style.color = '#06b6d4';
          sourceBadge.style.borderColor = 'rgba(6, 182, 212, 0.3)';
          sourceBadge.style.background = 'rgba(6, 182, 212, 0.08)';
        }
      }

      // Render Charts & Tables
      renderCharts(resData.priceBins, resData.mallCompare);
      applyFilters();

      // Show Dashboard
      document.getElementById('loading-state').style.display = 'none';
      document.getElementById('dashboard-state').style.display = 'block';

      // Play chime sound
      playChime();
      showToast('분석 완료', `"${query}" 상품의 가격 분석 및 인기도 순위 연산을 완료했습니다.`, 'fa-solid fa-circle-check');
      
    } else {
      throw new Error(resData.error || '알 수 없는 오류');
    }
  } catch (err) {
    console.error(err);
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('empty-state').style.display = 'flex';
    showToast('검색 실패', err.message || '데이터 수집에 실패했습니다. 다시 시도해 주세요.', 'fa-solid fa-triangle-exclamation');
  }
}

// 4. Update KPI Dashboard Cards
function updateKPIs(metrics, topProduct) {
  document.getElementById('kpi-min-price').textContent = `₩${metrics.minPrice.toLocaleString()}`;
  document.getElementById('kpi-max-price').textContent = `₩${metrics.maxPrice.toLocaleString()}`;
  document.getElementById('kpi-avg-price').textContent = `₩${metrics.avgPrice.toLocaleString()}`;
  
  const topProductEl = document.getElementById('kpi-top-product');
  if (topProductEl && topProduct) {
    topProductEl.textContent = topProduct.name;
    topProductEl.title = topProduct.name;
  }
}

// 5. Setup Price range sliders bounds
function setupPriceSliders(min, max) {
  const minSlider = document.getElementById('price-slider-min');
  const maxSlider = document.getElementById('price-slider-max');
  
  if (minSlider && maxSlider) {
    // Prevent slider boundaries collapse
    minSlider.min = min;
    minSlider.max = max;
    minSlider.value = min;
    priceSliderMinVal = min;

    maxSlider.min = min;
    maxSlider.max = max;
    maxSlider.value = max;
    priceSliderMaxVal = max;

    updateFilterDisplay();
  }
}

function initFilters() {
  const minSlider = document.getElementById('price-slider-min');
  const maxSlider = document.getElementById('price-slider-max');
  const mallSelect = document.getElementById('filter-mall-select');

  if (minSlider && maxSlider) {
    minSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      const maxVal = parseInt(maxSlider.value, 10);
      if (val > maxVal) {
        minSlider.value = maxVal;
        priceSliderMinVal = maxVal;
      } else {
        priceSliderMinVal = val;
      }
      updateFilterDisplay();
      applyFilters();
    });

    maxSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      const minVal = parseInt(minSlider.value, 10);
      if (val < minVal) {
        maxSlider.value = minVal;
        priceSliderMaxVal = minVal;
      } else {
        priceSliderMaxVal = val;
      }
      updateFilterDisplay();
      applyFilters();
    });
  }

  if (mallSelect) {
    mallSelect.addEventListener('change', () => {
      applyFilters();
    });
  }
}

function updateFilterDisplay() {
  const label = document.getElementById('filter-price-label');
  if (label) {
    label.textContent = `₩${priceSliderMinVal.toLocaleString()} ~ ₩${priceSliderMaxVal.toLocaleString()}`;
  }
}

// 6. Apply sliders/selectors filters & Draw Products Table
function applyFilters() {
  const mallSelect = document.getElementById('filter-mall-select');
  const selectedMall = mallSelect ? mallSelect.value : 'all';
  
  const filtered = productsDataset.filter(p => {
    // Price boundary check
    if (p.price < priceSliderMinVal || p.price > priceSliderMaxVal) return false;
    
    // Mall check
    if (selectedMall === 'coupang' && !p.mall.includes('쿠팡')) return false;
    if (selectedMall === 'naver' && p.mall.includes('쿠팡')) return false;
    
    return true;
  });

  renderTable(filtered);
  
  // Update result count
  const countEl = document.getElementById('result-match-count');
  if (countEl) countEl.textContent = filtered.length.toLocaleString();

  // Dynamically update KPIs based on filtered list
  const minPriceEl = document.getElementById('kpi-min-price');
  const maxPriceEl = document.getElementById('kpi-max-price');
  const avgPriceEl = document.getElementById('kpi-avg-price');
  const topProductEl = document.getElementById('kpi-top-product');

  if (filtered.length > 0) {
    const prices = filtered.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = Math.round(prices.reduce((sum, val) => sum + val, 0) / prices.length);
    
    if (minPriceEl) minPriceEl.textContent = `₩${minPrice.toLocaleString()}`;
    if (maxPriceEl) maxPriceEl.textContent = `₩${maxPrice.toLocaleString()}`;
    if (avgPriceEl) avgPriceEl.textContent = `₩${avgPrice.toLocaleString()}`;
    
    const topProduct = filtered[0]; // The dataset is already sorted by popularity score descending
    if (topProductEl && topProduct) {
      topProductEl.textContent = topProduct.name;
      topProductEl.title = topProduct.name;
    }
  } else {
    if (minPriceEl) minPriceEl.textContent = `₩0`;
    if (maxPriceEl) maxPriceEl.textContent = `₩0`;
    if (avgPriceEl) avgPriceEl.textContent = `₩0`;
    if (topProductEl) {
      topProductEl.textContent = '-';
      topProductEl.title = '';
    }
  }
}

function renderTable(data) {
  const tbody = document.getElementById('products-table-body');
  if (!tbody) return;

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 4rem 2rem; color: var(--text-muted);">
          <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 1rem; color: rgba(255,255,255,0.06);"></i>
          <p>선택하신 필터 조건에 부합하는 쇼핑 상품이 존재하지 않습니다.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = data.map((p, idx) => {
    const isCoupang = p.mall.includes('쿠팡');
    const badgeClass = isCoupang ? 'mall-badge-coupang' : 'mall-badge-naver';
    const cleanMall = isCoupang ? '쿠팡(Coupang)' : p.mall;

    // Stars rendering based on rating
    const fullStars = Math.floor(p.rating);
    const halfStar = p.rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) starsHtml += '<i class="fa-solid fa-star"></i>';
    if (halfStar) starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
    for (let i = 0; i < emptyStars; i++) starsHtml += '<i class="fa-regular fa-star"></i>';

    return `
      <tr>
        <td class="td-rank"># ${p.rank}</td>
        <td><img class="td-product-img" src="${p.image}" alt="상품 이미지" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=80&h=80&q=80'"></td>
        <td><div class="td-product-name" title="${p.name}">${p.name}</div></td>
        <td><span class="mall-badge ${badgeClass}">${cleanMall}</span></td>
        <td class="td-price">₩${p.price.toLocaleString()}</td>
        <td>
          <div class="rating-stars">
            ${starsHtml}
            <span class="rating-num">${p.rating}</span>
          </div>
        </td>
        <td class="td-reviews">${p.reviewCount.toLocaleString()}개</td>
        <td class="td-popularity">${p.popularityScore}점</td>
        <td><button onclick="openReviewModal(${p.id})" class="btn-analyze"><i class="fa-solid fa-robot"></i> AI 분석</button></td>
        <td><a href="${p.link}" target="_blank" class="btn-buy"><i class="fa-solid fa-arrow-up-right-from-square"></i> 이동</a></td>
      </tr>
    `;
  }).join('');
}

// 7. Render Charts via Chart.js
function renderCharts(priceBins = null, mallCompare = null) {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const gridColor = isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.04)';
  const textColor = isLight ? '#374151' : '#9ca3af';

  // Aggregate current dataset if parameters are null
  if (!priceBins || !mallCompare) {
    const prices = productsDataset.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    const binSize = range > 0 ? Math.ceil(range / 5) : 1000;
    
    priceBins = [];
    for (let i = 0; i < 5; i++) {
      const binMin = minPrice + i * binSize;
      const binMax = minPrice + (i + 1) * binSize - 1;
      const count = prices.filter(p => p >= binMin && p <= binMax).length;
      priceBins.push({
        label: `${Math.round(binMin/10000)}만~${Math.round(binMax/10000)}만`,
        count
      });
    }

    const coupangPrices = productsDataset.filter(p => p.mall.includes('쿠팡')).map(p => p.price);
    const naverPrices = productsDataset.filter(p => !p.mall.includes('쿠팡')).map(p => p.price);
    
    mallCompare = {
      coupangAvg: coupangPrices.length > 0 ? Math.round(coupangPrices.reduce((s, v) => s + v, 0) / coupangPrices.length) : 0,
      naverAvg: naverPrices.length > 0 ? Math.round(naverPrices.reduce((s, v) => s + v, 0) / naverPrices.length) : 0
    };
  }

  // CHART 1: Price Distribution Bar Chart
  const ctxDist = document.getElementById('chart-price-distribution');
  if (ctxDist) {
    if (priceDistChart) priceDistChart.destroy();
    
    const labels = priceBins.map(b => b.label);
    const counts = priceBins.map(b => b.count);

    priceDistChart = new Chart(ctxDist, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '등록 상품수',
          data: counts,
          backgroundColor: 'rgba(6, 182, 212, 0.45)',
          borderColor: '#06b6d4',
          borderWidth: 1.5,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor, precision: 0 } }
        }
      }
    });
  }

  // CHART 2: Mall Compare Bar Chart
  const ctxCompare = document.getElementById('chart-mall-compare');
  if (ctxCompare) {
    if (mallCompareChart) mallCompareChart.destroy();

    mallCompareChart = new Chart(ctxCompare, {
      type: 'bar',
      data: {
        labels: ['쿠팡(Coupang)', '네이버쇼핑'],
        datasets: [{
          label: '평균 가격 (₩)',
          data: [mallCompare.coupangAvg, mallCompare.naverAvg],
          backgroundColor: [
            'rgba(239, 68, 68, 0.45)', // Coupang Red
            'rgba(16, 185, 129, 0.45)'  // Naver Green
          ],
          borderColor: [
            '#ef4444',
            '#10b981'
          ],
          borderWidth: 1.5,
          borderRadius: 8,
          barThickness: 50
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: { 
            grid: { color: gridColor }, 
            ticks: { 
              color: textColor,
              callback: function(value) {
                return (value / 10000).toLocaleString() + '만';
              }
            } 
          }
        }
      }
    });
  }
}

// 8. Custom Toast Alerts Helper
function showToast(title, message, iconClass = 'fa-solid fa-circle-check') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'custom-toast';
  toast.innerHTML = `
    <div class="toast-icon"><i class="${iconClass}"></i></div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
  `;

  container.appendChild(toast);

  // Auto remove toast
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 4000);
}

// 9. Play synthetic success chime
function playChime() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const t = audioCtx.currentTime;
    
    // Nice double sweep chord
    osc.frequency.setValueAtTime(587.33, t); // D5
    osc.frequency.setValueAtTime(880.00, t + 0.1); // A5
    osc.frequency.setValueAtTime(1174.66, t + 0.2); // D6
    
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    
    osc.start(t);
    osc.stop(t + 0.5);
  } catch(e) {}
}

// 10. Visitor Stats loader
async function updateVisitorStats() {
  try {
    const response = await fetch('/api/visits');
    if (!response.ok) return;
    const visits = await response.json();

    const mainStats = visits['main'] || { total: 839692, today: 363 };
    const siteTotalEl = document.getElementById('site-visit-total');
    const siteTodayEl = document.getElementById('site-visit-today');

    if (siteTotalEl) siteTotalEl.textContent = mainStats.total.toLocaleString();
    if (siteTodayEl) siteTodayEl.textContent = mainStats.today.toLocaleString();

    // Sum apps visits
    let appsTotal = 0;
    let appsToday = 0;
    for (const app in visits) {
      if (app === 'main') continue;
      appsTotal += visits[app].total || 0;
      appsToday += visits[app].today || 0;
    }

    const appsTotalEl = document.getElementById('apps-visit-total');
    const appsTodayEl = document.getElementById('apps-visit-today');
    if (appsTotalEl) appsTotalEl.textContent = appsTotal.toLocaleString();
    if (appsTodayEl) appsTodayEl.textContent = appsToday.toLocaleString();
  } catch (err) {}
}

// 11. Review Details Modal Setup & Trigger
function initModal() {
  const closeModalBtn = document.getElementById('btn-close-modal');
  const modal = document.getElementById('review-modal');
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      closeReviewModal();
    });
  }
  
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeReviewModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeReviewModal();
    }
  });
}

window.openReviewModal = function(productId) {
  const product = productsDataset.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('review-modal');
  if (!modal) return;

  const mallBadge = document.getElementById('modal-mall-badge');
  const isCoupang = product.mall.includes('쿠팡');
  const badgeClass = isCoupang ? 'mall-badge-coupang' : 'mall-badge-naver';
  const cleanMall = isCoupang ? '쿠팡(Coupang)' : product.mall;
  
  if (mallBadge) {
    mallBadge.className = `mall-badge ${badgeClass}`;
    mallBadge.textContent = cleanMall;
  }

  const nameEl = document.getElementById('modal-product-name');
  if (nameEl) nameEl.textContent = product.name;

  const imgEl = document.getElementById('modal-product-img');
  if (imgEl) {
    imgEl.src = product.image;
    imgEl.onerror = function() {
      this.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&h=150&q=80';
    };
  }

  const priceEl = document.getElementById('modal-product-price');
  if (priceEl) priceEl.textContent = `₩${product.price.toLocaleString()}`;

  const ratingStarsEl = document.getElementById('modal-rating-stars');
  if (ratingStarsEl) {
    const fullStars = Math.floor(product.rating);
    const halfStar = product.rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) starsHtml += '<i class="fa-solid fa-star"></i>';
    if (halfStar) starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
    for (let i = 0; i < emptyStars; i++) starsHtml += '<i class="fa-regular fa-star"></i>';
    starsHtml += `<span class="rating-num">${product.rating}</span>`;
    ratingStarsEl.innerHTML = starsHtml;
  }

  const reviewCountEl = document.getElementById('modal-review-count');
  if (reviewCountEl) reviewCountEl.textContent = `(${product.reviewCount.toLocaleString()}개 리뷰)`;

  const linkEl = document.getElementById('modal-product-link');
  if (linkEl) {
    linkEl.href = product.link;
  }

  const analysis = product.reviewAnalysis || {
    positiveRatio: 85,
    negativeRatio: 15,
    summary: '리뷰 정보 분석에 일시적인 지연이 발생하고 있습니다.',
    posKeywords: ['품질 만족', '기대 이상'],
    negKeywords: ['포장 훼손']
  };

  const posRatioEl = document.getElementById('modal-pos-ratio');
  if (posRatioEl) posRatioEl.textContent = analysis.positiveRatio;

  const negRatioEl = document.getElementById('modal-neg-ratio');
  if (negRatioEl) negRatioEl.textContent = analysis.negativeRatio;

  const barFillEl = document.getElementById('modal-sentiment-bar-fill');
  if (barFillEl) {
    barFillEl.style.width = `${analysis.positiveRatio}%`;
  }

  const summaryTextEl = document.getElementById('modal-summary-text');
  if (summaryTextEl) summaryTextEl.textContent = analysis.summary;

  const posKeywordsEl = document.getElementById('modal-pos-keywords');
  if (posKeywordsEl) {
    posKeywordsEl.innerHTML = analysis.posKeywords.map(k => `<span class="badge-pos">${k}</span>`).join('');
  }

  const negKeywordsEl = document.getElementById('modal-neg-keywords');
  if (negKeywordsEl) {
    negKeywordsEl.innerHTML = analysis.negKeywords.map(k => `<span class="badge-neg">${k}</span>`).join('');
  }

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

window.closeReviewModal = function() {
  const modal = document.getElementById('review-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
};
