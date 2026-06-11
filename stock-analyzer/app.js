// 글로벌 주식 투자 등급 진단기 클라이언트 애플리케이션

// 로딩 화면 메시지 로테이터 리스트
const LOADING_MESSAGES = [
  { status: '재무제표 데이터 수집 중...', message: '네이버 페이 증권 및 야후 파이낸스에서 실시간 재무 테이블을 조회하고 있습니다.' },
  { status: '최신 관련 뉴스 크롤링 중...', message: '구글 뉴스 RSS 피드를 통해 최근 1주일간의 주요 보도 기사를 긁어오고 있습니다.' },
  { status: '투자 대가 알고리즘 작동 중...', message: '벤저민 그레이엄, 피터 린치, 워렌 버핏의 투자 모델 체크리스트 항목을 채점하고 있습니다.' },
  { status: '형태소 정제 및 트렌드 분석 중...', message: '뉴스 기사 타이틀에서 불용어와 회사명을 여과하여 워드클라우드 맵을 형성하는 중입니다.' },
  { status: '투자 진단서 요약본 컴파일 중...', message: '종합 투자 가이드 및 레이더 차트 수치를 시각화 데이터로 매핑하고 있습니다.' }
];

let loadingInterval = null;
let myRadarChart = null;

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
});

// 이벤트 리스너 등록
function setupEventListeners() {
  const btnDiagnose = document.getElementById('btn-diagnose');
  const stockSearchInput = document.getElementById('stock-search-input');
  
  btnDiagnose.addEventListener('click', () => {
    performAnalysis(stockSearchInput.value);
  });
  
  stockSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      performAnalysis(stockSearchInput.value);
    }
  });

  // 추천 링크 바인딩
  const suggestLinks = document.querySelectorAll('.suggest-link');
  suggestLinks.forEach(link => {
    link.addEventListener('click', () => {
      const code = link.getAttribute('data-code');
      stockSearchInput.value = code;
      performAnalysis(code);
    });
  });
}

// 주식 진단 비동기 실행 함수
async function performAnalysis(code) {
  if (!code || code.trim() === '') {
    alert('올바른 주식 코드 또는 티커를 입력해 주세요.');
    return;
  }
  
  code = code.trim().toUpperCase();
  
  // UI 상태 변경 (로딩 표시, 대시보드 숨김)
  showLoading(true);
  
  try {
    const response = await fetch(`/api/stock/analyze?code=${encodeURIComponent(code)}`);
    const result = await response.json();
    
    if (result.success && result.data) {
      renderDashboard(result.data);
    } else {
      alert(`진단 실패: ${result.error || '알 수 없는 서버 오류'}`);
      showLoading(false);
    }
  } catch (err) {
    console.error('API Error:', err);
    alert('서버와의 네트워크 연결에 실패했습니다. 나중에 다시 시도해 주세요.');
    showLoading(false);
  }
}

// 로딩바 및 순환 상태 제어
function showLoading(isLoading) {
  const loadingCard = document.getElementById('loading-card');
  const dashboard = document.getElementById('dashboard');
  const statusEl = document.getElementById('loading-status');
  const messageEl = document.getElementById('loading-message');
  
  if (isLoading) {
    loadingCard.style.display = 'flex';
    dashboard.style.display = 'none';
    
    // 초기 로딩 메시지 설정
    statusEl.innerText = LOADING_MESSAGES[0].status;
    messageEl.innerText = LOADING_MESSAGES[0].message;
    
    // 2.5초마다 로딩 메시지 로테이션
    let idx = 1;
    if (loadingInterval) clearInterval(loadingInterval);
    loadingInterval = setInterval(() => {
      statusEl.innerText = LOADING_MESSAGES[idx].status;
      messageEl.innerText = LOADING_MESSAGES[idx].message;
      idx = (idx + 1) % LOADING_MESSAGES.length;
    }, 2500);
  } else {
    loadingCard.style.display = 'none';
    if (loadingInterval) {
      clearInterval(loadingInterval);
      loadingInterval = null;
    }
  }
}

// 대시보드 렌더링 총괄
function renderDashboard(data) {
  showLoading(false);
  document.getElementById('dashboard').style.display = 'grid';
  
  // 1. 기업 개요 및 가격 정보
  document.getElementById('company-name').innerText = data.companyName;
  document.getElementById('company-ticker').innerText = data.symbol;
  document.getElementById('company-market').innerText = data.market;
  
  // 통화 기호 판별
  let currency = '$';
  if (data.market.includes('KR')) currency = '₩';
  else if (data.market.includes('JP')) currency = '¥';
  
  const formattedPrice = formatCurrency(data.price, currency);
  document.getElementById('current-price').innerText = formattedPrice;
  
  // 변동 가격 서식 설정
  const changeEl = document.getElementById('price-change');
  const changeSign = data.change > 0 ? '+' : '';
  const arrowIcon = data.change > 0 ? '▲' : (data.change < 0 ? '▼' : '');
  const changeValFormatted = formatCurrency(Math.abs(data.change), currency);
  
  changeEl.innerText = `${arrowIcon} ${changeSign}${changeValFormatted} (${changeSign}${data.pct.toFixed(2)}%)`;
  
  // 클래스 변경
  changeEl.className = 'price-change';
  if (data.change > 0) {
    changeEl.classList.add('price-up');
  } else if (data.change < 0) {
    changeEl.classList.add('price-down');
  } else {
    changeEl.classList.add('price-even');
  }
  
  document.getElementById('meta-market-cap').innerText = data.marketCap;
  document.getElementById('meta-industry').innerText = data.industry || '정보 없음';
  document.getElementById('company-desc').innerText = data.description || '기업 상세 개요가 등록되어 있지 않습니다.';
  
  // 원본 바로가기 링크 바인딩
  document.getElementById('link-news-origin').href = data.newsLink;
  document.getElementById('link-financial-origin').href = data.financialLink;

  // 2. 종합 투자 평가 (게이지)
  const score = data.grading.compositeScore;
  const grade = data.grading.compositeGrade;
  
  document.getElementById('grade-letter').innerText = grade;
  document.getElementById('grade-score').innerText = `${score} / 100점`;
  
  // 등급 게이지 컬러 맵
  const colorMap = {
    'S': '#f59e0b',
    'A': '#10b981',
    'B': '#22c55e',
    'C': '#3b82f6',
    'D': '#f97316',
    'F': '#ef4444'
  };
  
  const themeColor = colorMap[grade] || '#cbd5e1';
  document.getElementById('grade-letter').style.color = themeColor;
  
  const recEl = document.getElementById('recommendation-text');
  recEl.innerText = data.grading.recommendation;
  recEl.className = 'recommendation-badge';
  
  if (score >= 85) recEl.classList.add('badge-strong-buy');
  else if (score >= 70) recEl.classList.add('badge-buy');
  else if (score >= 50) recEl.classList.add('badge-hold');
  else recEl.classList.add('badge-sell');
  
  // 원형 게이지 애니메이션
  const circle = document.getElementById('grade-progress-circle');
  const radius = circle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  const offset = circumference - (score / 100) * circumference;
  circle.style.strokeDashoffset = offset;
  circle.style.stroke = themeColor;

  // 요약 멘트 제공
  const summaryMap = {
    'S': `종합 채점 ${score}점으로 최고 등급의 투자 가치를 지녔습니다. 강력한 비즈니스 해자와 극도의 안정성, 매력적인 밸류에이션을 고루 갖추고 있습니다.`,
    'A': `종합 채점 ${score}점으로 매우 우수한 투자처입니다. 재무 안정성이 뛰어나며 대부분의 대가 알고리즘 검증 기준을 훌륭히 통과했습니다.`,
    'B': `종합 채점 ${score}점으로 건실한 투자 가치가 확인됩니다. 일부 밸류에이션 부담 또는 부채 요건이 있지만 비즈니스 자체의 강점이 돋보입니다.`,
    'C': `종합 채점 ${score}점으로 보통 등급입니다. 투자 대가들의 요건 중 일부만 충족하며, 성장률 정체나 재무적인 변동 리스크가 잠재되어 있습니다.`,
    'D': `종합 채점 ${score}점으로 다소 신중한 접근이 요구되는 투자 위험군입니다. 안정성 수치가 낮거나 밸류에이션(고평가) 부담이 큽니다.`,
    'F': `종합 채점 ${score}점으로 투자 부적격 수준에 가깝습니다. 대가들의 검증 항목을 거의 충족하지 못했으며 재무 구조 개선이 긴급히 필요해 보입니다.`
  };
  document.querySelector('.grade-summary').innerText = summaryMap[grade] || '';

  // 3. 레이더 차트 렌더링
  renderRadarChart(data.grading.scores);

  // 4. 워드클라우드 렌더링
  renderWordCloud(data.keywords);

  // 5. 뉴스 피드 리스트
  renderNewsList(data.newsList);

  // 6. 재무제표 테이블
  renderFinancialTable(data.financialTable, currency);

  // 7. 알고리즘 체크리스트 세부 출력
  renderCheckLists(data.grading.checkResults, data.grading.scores);
}

// 레이더 차트 초기화 및 렌더링 (Chart.js)
function renderRadarChart(scores) {
  const ctx = document.getElementById('radar-chart').getContext('2d');
  
  if (myRadarChart) {
    myRadarChart.destroy();
  }
  
  myRadarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['그레이엄 가치', '피터 린치 성장', '워렌 버핏 해자', '재무 안정성', '배당 / 인컴'],
      datasets: [{
        label: '투자 요건 점수',
        data: [scores.graham, scores.lynch, scores.buffett, scores.financial, scores.dividend],
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        borderColor: '#a855f7',
        borderWidth: 2,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#a855f7',
        pointHoverBackgroundColor: '#a855f7',
        pointHoverBorderColor: '#ffffff'
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
          grid: { color: 'rgba(255, 255, 255, 0.08)' },
          angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
          pointLabels: {
            color: '#cbd5e1',
            font: { family: 'Inter, Noto Sans KR', size: 12 }
          },
          ticks: { display: false },
          min: 0,
          max: 100,
          suggestedMin: 0,
          suggestedMax: 100
        }
      }
    }
  });
}

// 아르키메데스 나선형 워드클라우드 캔버스 드로잉
function renderWordCloud(keywords) {
  const canvas = document.getElementById('wordcloud-canvas');
  const ctx = canvas.getContext('2d');
  
  // 픽셀 깨짐 방지를 위한 캔버스 크기 강제 설정
  const width = canvas.width = 480;
  const height = canvas.height = 280;
  
  ctx.clearRect(0, 0, width, height);
  
  if (!keywords || keywords.length === 0) {
    ctx.fillStyle = '#64748b';
    ctx.font = '14px Inter, Noto Sans KR';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('크롤링된 핵심 키워드가 존재하지 않습니다.', width / 2, height / 2);
    return;
  }

  const minVal = Math.min(...keywords.map(k => k.value));
  const maxVal = Math.max(...keywords.map(k => k.value));
  
  const maxFontSize = 34;
  const minFontSize = 12;
  const placedBoxes = [];
  
  const colors = ['#c084fc', '#a855f7', '#8b5cf6', '#60a5fa', '#3b82f6', '#34d399', '#fef08a', '#fb923c'];

  keywords.forEach((word, idx) => {
    // 상대 가중치에 맞춰 폰트 크기 계산
    const fontSize = Math.round(
      minFontSize + ((word.value - minVal) / (maxVal - minVal || 1)) * (maxFontSize - minFontSize)
    );
    
    ctx.font = `600 ${fontSize}px Outfit, Inter, Noto Sans KR`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const textWidth = ctx.measureText(word.text).width;
    const textHeight = fontSize;
    
    let x = width / 2;
    let y = height / 2;
    
    let theta = 0;
    let radius = 0;
    const dTheta = 0.15;
    const dRadius = 0.35;
    let hasPlaced = false;
    let iterations = 0;

    // 아르키메데스 나선 궤적 탐색으로 빈 자리 배치
    while (!hasPlaced && iterations < 500) {
      x = width / 2 + radius * Math.cos(theta) * 1.6; // 가로 세로 왜곡 비율 적용
      y = height / 2 + radius * Math.sin(theta);
      
      const left = x - textWidth / 2 - 4;
      const top = y - textHeight / 2 - 4;
      const right = x + textWidth / 2 + 4;
      const bottom = y + textHeight / 2 + 4;
      
      // 캔버스 경계를 넘어가는지 확인
      if (left > 5 && right < width - 5 && top > 5 && bottom < height - 5) {
        // 기존 단어들과의 오버랩 충돌 감지
        let isOverlap = false;
        for (const box of placedBoxes) {
          if (left < box.right && right > box.left && top < box.bottom && bottom > box.top) {
            isOverlap = true;
            break;
          }
        }
        
        if (!isOverlap) {
          // 충돌하지 않으면 단어 그리기 및 충돌 박스 리스트 추가
          ctx.fillStyle = colors[idx % colors.length];
          ctx.fillText(word.text, x, y);
          placedBoxes.push({ left, top, right, bottom });
          hasPlaced = true;
        }
      }
      
      theta += dTheta;
      radius += dRadius;
      iterations++;
    }
  });
}

// 뉴스 목록 출력
function renderNewsList(newsList) {
  const container = document.getElementById('news-list-container');
  container.innerHTML = '';
  
  if (!newsList || newsList.length === 0) {
    container.innerHTML = '<div class="news-item" style="text-align: center; color: var(--text-muted);">최근 1주일간 보도된 기사가 없습니다.</div>';
    return;
  }
  
  newsList.forEach(n => {
    const item = document.createElement('a');
    item.className = 'news-item';
    item.href = n.link;
    item.target = '_blank';
    
    // 날짜 포맷 정리 (예: GMT 포맷에서 불필요 요소 간소화)
    let formattedDate = n.pubDate;
    try {
      const d = new Date(n.pubDate);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
      }
    } catch(e) {}

    item.innerHTML = `
      <span class="news-title">${n.title}</span>
      <div class="news-meta">
        <span class="news-source">${n.source}</span>
        <span class="news-date">${formattedDate}</span>
      </div>
    `;
    container.appendChild(item);
  });
}

// 재무 정보 요약 테이블 출력
function renderFinancialTable(tableData, currency) {
  const body = document.getElementById('financial-table-body');
  body.innerHTML = '';
  
  if (!tableData || tableData.length === 0) {
    body.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">재무 테이블 데이터가 비어 있습니다.</td></tr>';
    return;
  }
  
  tableData.forEach(row => {
    const tr = document.createElement('tr');
    
    // 값이 숫자이면 단위 포맷팅, 아니면 원래 문자 출력
    const formatCell = (val, isRatio = false) => {
      if (val === '-' || val === null || val === undefined) return '-';
      const cleanVal = val.toString().replace(/,/g, '');
      const num = parseFloat(cleanVal);
      if (isNaN(num)) return val;
      
      if (isRatio) return `${num.toFixed(1)}%`;
      // 한국 원화인 경우 백만 단위이므로 억 단위 환산 등 간소화도 고려되나, 크롤링된 값 그대로 천 단위 콤마
      return num.toLocaleString('ko-KR');
    };

    tr.innerHTML = `
      <td>${row.year}</td>
      <td>${formatCell(row.revenue)} ${currency === '₩' ? '억' : ''}</td>
      <td>${formatCell(row.opIncome)} ${currency === '₩' ? '억' : ''}</td>
      <td>${formatCell(row.netIncome)} ${currency === '₩' ? '억' : ''}</td>
      <td>${formatCell(row.roe, !row.roe.includes('%'))}</td>
      <td>${formatCell(row.debtRatio, !row.debtRatio.includes('%'))}</td>
      <td>${formatCell(row.per)}</td>
      <td>${formatCell(row.pbr)}</td>
    `;
    body.appendChild(tr);
  });
}

// 알고리즘 채점 상세 검증 리스트 출력
function renderCheckLists(checkResults, scores) {
  const populate = (key, listId, scoreId) => {
    const list = document.getElementById(listId);
    list.innerHTML = '';
    
    const items = checkResults[key] || [];
    items.forEach(item => {
      const li = document.createElement('li');
      const iconClass = item.pass === true ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark';
      li.className = item.pass === true ? 'pass' : 'fail';
      
      li.innerHTML = `
        <span class="label"><i class="${iconClass}"></i> ${item.label}</span>
        <span class="value">${item.value}</span>
      `;
      list.appendChild(li);
    });
    
    document.getElementById(scoreId).innerText = `${scores[key]}점`;
  };

  populate('graham', 'check-list-graham', 'algo-score-graham');
  populate('lynch', 'check-list-lynch', 'algo-score-lynch');
  populate('buffett', 'check-list-buffett', 'algo-score-buffett');
  populate('financial', 'check-list-financial', 'algo-score-financial');
  populate('dividend', 'check-list-dividend', 'algo-score-dividend');

  // 그레이엄 수 추가 정보 출력
  const grahamExtra = document.getElementById('graham-extra-info');
  grahamExtra.style.display = 'none';
  
  // 그레이엄 분석 특화 수치 바인딩 (그레이엄 넘버가 산출된 경우에만 노출)
  const grahamResults = checkResults.graham || [];
  const hasGrahamInfo = grahamResults.some(r => r.label.includes('PER') && r.pass !== null);
  
  if (hasGrahamInfo) {
    // 임의 계산된 그레이엄 수 설명
    const epsObj = checkResults.graham.find(r => r.label.includes('PER'));
    const bpsObj = checkResults.graham.find(r => r.label.includes('PBR'));
    
    if (epsObj && bpsObj) {
      grahamExtra.style.display = 'block';
      grahamExtra.innerHTML = `
        <strong>💡 그레이엄 안전마진 평가:</strong><br>
        그레이엄 수(Graham Number) 기반 공식 기준가 대비 현재 주가가 가치 평가 범위 안에 있습니다.
      `;
    }
  }
}

// 통화 서식 도우미
function formatCurrency(val, currencySymbol) {
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  
  if (currencySymbol === '₩') {
    // 한국 주가인 경우 정수 처리
    return `${Math.round(num).toLocaleString('ko-KR')}원`;
  }
  return `${currencySymbol}${num.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
