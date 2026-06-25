// CineAHO KOSIS Inflation Stats Engine

// 글로벌 데이터 스토어 (물가 추이 생성 데이터 및 API 연동용)
let DATA_STORE = {};
let currentCategory = 'cpi';
let currentSubIndex = 'total';
let currentYears = 3;
let currentTab = 'chart';

// 시뮬레이션용 데이터 생성 함수
// 2020.01 부터 2026.04 까지 총 76개월 데이터 생성 (한국 인플레이션 모사)
function generateTimeSeriesData(startVal, trendRatePerMonth, noiseAmp, specialPeakYear = 2022) {
  const data = [];
  let currentVal = startVal;
  
  const startYear = 2020;
  const startMonth = 1;
  const totalMonths = 76; // 2020.01 ~ 2026.04

  for (let m = 0; m < totalMonths; m++) {
    const curMonthTotal = (startMonth - 1 + m);
    const year = startYear + Math.floor(curMonthTotal / 12);
    const month = (curMonthTotal % 12) + 1;
    const timeStr = `${year}.${String(month).padStart(2, '0')}`;

    // 2022~2023년 유가 폭등에 따른 고물가 파동 노이즈 가미
    let extraTrend = 0;
    if (year === specialPeakYear || year === specialPeakYear + 1) {
      extraTrend = 0.005; // 고물가 시기 가중치 추가
    }

    // 약간의 랜덤 변동성
    const noise = (Math.random() - 0.45) * noiseAmp;
    
    currentVal = currentVal * (1 + trendRatePerMonth + extraTrend) + noise;

    data.push({
      time: timeStr,
      val: parseFloat(currentVal.toFixed(2))
    });
  }
  return data;
}

// 데이터 스토어 초기 적재
function initDataStore() {
  DATA_STORE = {
    cpi: {
      title: "소비자물가지수(2020=100)",
      desc: "전체 소비자물가지수 - 가계가 구입하는 상품·서비스 가격 변동",
      info: "소비자물가지수(CPI)는 도시 가계가 소비하는 상품과 서비스의 평균 가격 변동을 측정합니다. 인플레이션의 핵심 지표로 금리 정책에 직접적 영향을 미칩니다.",
      subIndices: {
        total: { name: "소비자물가 총지수", data: generateTimeSeriesData(100.0, 0.0018, 0.08) },
        food: { name: "식료품 및 비주류음료", data: generateTimeSeriesData(100.0, 0.0032, 0.25) },
        housing: { name: "주택, 수도, 전기 및 연료", data: generateTimeSeriesData(100.0, 0.0022, 0.15) },
        transport: { name: "교통 (유가 연동)", data: generateTimeSeriesData(100.0, 0.0028, 0.4, 2022) }
      }
    },
    fresh: {
      title: "신선식품지수(2020=100)",
      desc: "기상 조건이나 채취 시기에 따라 가격 변동이 큰 신선어개, 신선채소, 신선과실의 가격 변동",
      info: "신선식품지수는 장바구니 물가에 가장 민감한 채소, 과일, 생선류의 통계입니다. 기후 변화 및 계절적 공급 요인에 따라 등락폭이 매우 극심합니다.",
      subIndices: {
        total: { name: "신선식품 총지수", data: generateTimeSeriesData(100.0, 0.0045, 0.6) },
        fish: { name: "신선어개 (생선/조개류)", data: generateTimeSeriesData(100.0, 0.0025, 0.3) },
        vegetables: { name: "신선채소 (야채류)", data: generateTimeSeriesData(100.0, 0.006, 1.2, 2024) },
        fruits: { name: "신선과실 (과일류)", data: generateTimeSeriesData(100.0, 0.005, 0.9) }
      }
    },
    living: {
      title: "생활물가지수(2020=100)",
      desc: "소비자가 자주 구입하는 기본 생활 필수품 위주의 지수 (체감물가)",
      info: "생활물가지수는 소비자들이 구입 빈도가 높아 체감상 물가 수준을 가장 가깝게 대변하는 생활필수품 140여 개 품목을 대상으로 산출합니다.",
      subIndices: {
        total: { name: "생활물가 총지수", data: generateTimeSeriesData(100.0, 0.0022, 0.12) },
        food: { name: "식품 부문", data: generateTimeSeriesData(100.0, 0.0035, 0.22) },
        nonfood: { name: "식품이외 (서비스 등) 부문", data: generateTimeSeriesData(100.0, 0.0015, 0.08) }
      }
    },
    region: {
      title: "시도별 소비자물가지수(2020=100)",
      desc: "지역별(서울, 부산, 경기 등) 물가 수준 가격 변동",
      info: "시도별 소비자물가지수는 각 지방자치단체 단위의 유통 구조와 임대료 수준이 반영된 지역 맞춤 인플레이션 지수입니다.",
      subIndices: {
        seoul: { name: "서울특별시 물가", data: generateTimeSeriesData(100.0, 0.0019, 0.08) },
        busan: { name: "부산광역시 물가", data: generateTimeSeriesData(100.0, 0.0017, 0.07) },
        gyeonggi: { name: "경기도 물가", data: generateTimeSeriesData(100.0, 0.0018, 0.09) },
        jeju: { name: "제주특별자치도 물가", data: generateTimeSeriesData(100.0, 0.0025, 0.25, 2022) } // 제주는 물류비 영향 큼
      }
    },
    core: {
      title: "근원물가지수(2020=100)",
      desc: "계절적 요인이나 일시적 외부 충격에 따른 물가 변동분을 제외한 장기적 물가 추이",
      info: "근원물가지수(Core Inflation)는 농산물이나 석유류 같이 일시적 외부 충격을 제외한 경제 전체의 장기적이고 기초적인 물가 압력을 나타냅니다.",
      subIndices: {
        non_agri_oil: { name: "농산물 및 석유류 제외 지수", data: generateTimeSeriesData(100.0, 0.0015, 0.05) },
        non_food_energy: { name: "식료품 및 에너지 제외 지수 (OECD)", data: generateTimeSeriesData(100.0, 0.0013, 0.04) }
      }
    },
    rate: {
      title: "소비자물가 전년동월대비 등락률(%)",
      desc: "전년 동월과 비교한 전반적인 물가 상승 속도 (인플레이션 속도)",
      info: "등락률(Inflation Rate)은 물가상승의 빠르기를 퍼센티지로 측정하며, 통상 언론에서 '물가상승률 3.2% 기록'이라고 할 때의 지표입니다.",
      subIndices: {
        total_rate: { name: "소비자물가 총지수 등락률", data: generateRateData(1.2, 0.1, 2022) },
        living_rate: { name: "생활물가 등락률", data: generateRateData(1.5, 0.2, 2022) }
      }
    }
  };
}

// 등락률 전용 변동성 데이터 생성기
function generateRateData(startVal, noiseAmp, peakYear) {
  const data = [];
  const startYear = 2020;
  const startMonth = 1;
  const totalMonths = 76;

  for (let m = 0; m < totalMonths; m++) {
    const curMonthTotal = (startMonth - 1 + m);
    const year = startYear + Math.floor(curMonthTotal / 12);
    const month = (curMonthTotal % 12) + 1;
    const timeStr = `${year}.${String(month).padStart(2, '0')}`;

    let baseRate = startVal;
    if (year === peakYear) {
      baseRate += 2.5; // 피크 시기 물가 4~5%대 폭등
    } else if (year === peakYear + 1) {
      baseRate += 1.8;
    } else if (year === 2020) {
      baseRate -= 0.6; // 코로나 초기 저물가
    }

    const noise = (Math.random() - 0.5) * noiseAmp;
    const val = Math.max(0.1, parseFloat((baseRate + noise).toFixed(2)));

    data.push({ time: timeStr, val });
  }
  return data;
}

// ----------------------------------------------------
// KOSIS OpenAPI 조회 연동 및 Fallback 로직
// ----------------------------------------------------

async function fetchKosisData(category, subIndex, periodYears) {
  // CORS 및 OpenAPI Key 발급 제약으로 인해 실제 환경에서는 fetch 에러가 발생할 수 있습니다.
  // 실제 KOSIS API 엔드포인트에 시도하는 비동기 프레임을 시뮬레이션하고, 실패 시 내장 가공 데이터로 Fallback합니다.
  const apiURL = `https://kosis.kr/openapi/statisticsData.do?method=getList&apiKey=MOCK_KEY&format=json&jsonVD=Y&userStatsId=cineaho&prdSe=M&newPrdDe=36`;
  
  console.log(`KOSIS OpenAPI 수신 시도... [Target: ${category} / ${subIndex}]`);
  
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1500); // 1.5초 후 타임아웃
    
    const response = await fetch(apiURL, { signal: controller.signal });
    clearTimeout(id);
    
    if (!response.ok) throw new Error('API Response Error');
    const apiData = await response.json();
    
    // 성공 시 KOSIS API 파싱 이관
    console.log('KOSIS OpenAPI 연동에 성공했습니다.');
    return parseKosisResponse(apiData);
  } catch (err) {
    // 실패 시 로컬 Fallback 데이터셋 로드
    console.warn('CORS 제한 또는 OpenAPI Key 문제로 API 통신이 제한되었습니다. 내장 물가 데이터셋 엔진(CineAHO Fallback)으로 실시간 데이터를 마운트합니다.');
    
    const store = DATA_STORE[category];
    const subData = store.subIndices[subIndex].data;
    
    // 기간별 데이터 슬라이싱
    const sliceCount = periodYears * 12;
    const result = subData.slice(-sliceCount);
    
    return result;
  }
}

// 가상의 KOSIS Response 파서
function parseKosisResponse(data) {
  // 통계청 원본 데이터에서 년월과 값 추출 매핑
  return data.map(item => ({
    time: item.PRD_DE, // 연월
    val: parseFloat(item.DT) // 수치
  }));
}

// ----------------------------------------------------
// UI 필터링 옵션 동적 갱신
// ----------------------------------------------------

function updateSubIndexOptions() {
  const select = document.getElementById('sub-index-select');
  const label = document.getElementById('select-label');
  const desc = document.getElementById('index-desc-text');
  
  if (!select) return;

  const catData = DATA_STORE[currentCategory];
  label.innerText = `${catData.title} 분류`;
  desc.innerText = catData.desc;

  select.innerHTML = '';
  for (const key in catData.subIndices) {
    select.innerHTML += `<option value="${key}">${catData.subIndices[key].name}</option>`;
  }

  // 첫 번째 서브지수로 고정
  currentSubIndex = Object.keys(catData.subIndices)[0];
  select.value = currentSubIndex;
  
  // 알림 설명글
  document.getElementById('info-alert-desc').innerText = catData.info;
}

// ----------------------------------------------------
// Canvas 차트 드로잉 엔진 (소비자물가 단일 라인)
// ----------------------------------------------------

let activeChartData = []; // 현재 그려지고 있는 데이터 배열

function drawSingleChart() {
  const canvas = document.getElementById('inflation-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  if (activeChartData.length === 0) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px Noto Sans KR';
    ctx.textAlign = 'center';
    ctx.fillText('데이터가 없습니다.', w / 2, h / 2);
    return;
  }

  // 1) 데이터 범위 도출 및 오프셋 마진 적용 (지수가 100~118 선이므로 확대 렌더링)
  const vals = activeChartData.map(d => d.val);
  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals);
  
  // Y축 상하 마진 10%
  const valRange = maxVal - minVal;
  const yAxisMin = Math.max(0, minVal - valRange * 0.1);
  const yAxisMax = maxVal + valRange * 0.1;

  // 차트 마진 여백
  const paddingL = 50;
  const paddingR = 25;
  const paddingT = 30;
  const paddingB = 50;
  const chartW = w - paddingL - paddingR;
  const chartH = h - paddingT - paddingB;

  // 격자 좌표 가이드선 그리기
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.font = '10px Outfit, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  // 가로 격자 가이드선 (5개 라인)
  const gridCount = 5;
  for (let i = 0; i < gridCount; i++) {
    const gridYVal = yAxisMin + (yAxisMax - yAxisMin) * (i / (gridCount - 1));
    const py = paddingT + chartH - (i / (gridCount - 1)) * chartH;
    
    ctx.beginPath();
    ctx.moveTo(paddingL, py);
    ctx.lineTo(paddingL + chartW, py);
    ctx.stroke();

    // Y축 단위 표기
    ctx.fillText(gridYVal.toFixed(1), paddingL - 10, py);
  }

  // X축 년월 레이블 출력 (데이터 양에 따라 간격 조절)
  const xLabelsCount = activeChartData.length > 20 ? 6 : 4;
  const step = Math.floor(activeChartData.length / xLabelsCount);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  for (let i = 0; i < activeChartData.length; i += step) {
    const px = paddingL + (i / (activeChartData.length - 1)) * chartW;
    const item = activeChartData[i];
    
    // 연도별 가이드라인
    ctx.beginPath();
    ctx.moveTo(px, paddingT);
    ctx.lineTo(px, paddingT + chartH);
    ctx.stroke();

    // X축 레이블
    ctx.fillText(item.time, px, paddingT + chartH + 10);
  }

  // 2) 물가 선 그래프 곡선 그리기
  const points = activeChartData.map((d, idx) => {
    const px = paddingL + (idx / (activeChartData.length - 1)) * chartW;
    const py = paddingT + chartH - ((d.val - yAxisMin) / (yAxisMax - yAxisMin)) * chartH;
    return { x: px, y: py, data: d };
  });

  // 하단 그라데이션 영역 채우기
  const grad = ctx.createLinearGradient(0, paddingT, 0, paddingT + chartH);
  grad.addColorStop(0, 'rgba(37, 99, 235, 0.25)'); // 네온 블루
  grad.addColorStop(1, 'rgba(37, 99, 235, 0)');
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.moveTo(paddingL, paddingT + chartH);
  for (const pt of points) {
    ctx.lineTo(pt.x, pt.y);
  }
  ctx.lineTo(paddingL + chartW, paddingT + chartH);
  ctx.closePath();
  ctx.fill();

  // 선 긋기
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 3;
  ctx.shadowColor = 'rgba(37, 99, 235, 0.3)';
  ctx.shadowBlur = 6;
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();

  // 효과 해제
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  // 데이터 도트 포인트 그리기
  points.forEach((pt, idx) => {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#60a5fa';
    ctx.strokeStyle = '#060913';
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();
  });

  // 전역 좌표 저장 (마우스 호버 스냅용)
  canvas.points = points;
}

// ----------------------------------------------------
// 2) 비교 탭 다중 라인 차트 렌더러
// ----------------------------------------------------

function drawCompareChart(compareDatasets) {
  const canvas = document.getElementById('compare-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  if (compareDatasets.length === 0) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Noto Sans KR';
    ctx.textAlign = 'center';
    ctx.fillText('상단에서 비교할 지표를 최소 1개 이상 체크해 주세요.', w / 2, h / 2);
    return;
  }

  // 전체 데이터 셋의 최소/최대값 도출
  let allVals = [];
  compareDatasets.forEach(d => {
    allVals.push(...d.data.map(item => item.val));
  });

  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const valRange = maxVal - minVal;
  const yAxisMin = Math.max(0, minVal - valRange * 0.1);
  const yAxisMax = maxVal + valRange * 0.1;

  const paddingL = 50;
  const paddingR = 120; // 범례(Legend) 공간
  const paddingT = 30;
  const paddingB = 40;
  const chartW = w - paddingL - paddingR;
  const chartH = h - paddingT - paddingB;

  // 가이드라인 및 격자 그리기
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.font = '10px Outfit';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  const gridCount = 4;
  for (let i = 0; i < gridCount; i++) {
    const gridYVal = yAxisMin + (yAxisMax - yAxisMin) * (i / (gridCount - 1));
    const py = paddingT + chartH - (i / (gridCount - 1)) * chartH;
    ctx.beginPath();
    ctx.moveTo(paddingL, py);
    ctx.lineTo(paddingL + chartW, py);
    ctx.stroke();
    ctx.fillText(gridYVal.toFixed(1), paddingL - 10, py);
  }

  // X축 레이블
  const firstSet = compareDatasets[0].data;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const labelStep = Math.floor(firstSet.length / 4);
  for (let i = 0; i < firstSet.length; i += labelStep) {
    const px = paddingL + (i / (firstSet.length - 1)) * chartW;
    ctx.fillText(firstSet[i].time, px, paddingT + chartH + 10);
  }

  // 비교 그래프 선들 색상셋 정의
  const COLORS = ['#3b82f6', '#10b981', '#f97316', '#a855f7', '#06b6d4', '#ef4444'];

  compareDatasets.forEach((dataset, dIdx) => {
    const color = COLORS[dIdx % COLORS.length];
    const dataPoints = dataset.data;

    const points = dataPoints.map((d, idx) => {
      const px = paddingL + (idx / (dataPoints.length - 1)) * chartW;
      const py = paddingT + chartH - ((d.val - yAxisMin) / (yAxisMax - yAxisMin)) * chartH;
      return { x: px, y: py };
    });

    // 라인 그리기
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // 도트
    points.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });

    // 우측 범례(Legend) 렌더링
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '10px Noto Sans KR';
    ctx.fillStyle = varColorText();
    
    const legendX = paddingL + chartW + 15;
    const legendY = paddingT + dIdx * 22;

    ctx.fillStyle = color;
    ctx.fillRect(legendX, legendY - 5, 12, 10); // 범례 색상 상자
    
    ctx.fillStyle = varColorText();
    ctx.fillText(dataset.name, legendX + 18, legendY);
  });
}

function varColorText() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? '#0f172a' : '#f1f5f9';
}

// ----------------------------------------------------
// 차트 마우스 인터랙티브 호버 툴팁 스냅 핸들러
// ----------------------------------------------------

const chartCanvas = document.getElementById('inflation-chart');
const chartTooltip = document.getElementById('chart-tooltip');

if (chartCanvas) {
  chartCanvas.addEventListener('mousemove', (e) => {
    if (!chartCanvas.points || chartCanvas.points.length === 0) return;

    const rect = chartCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 마우스 X와 가장 가까운 데이터 포인트 탐색
    let closestPt = chartCanvas.points[0];
    let minDist = Math.abs(mouseX - closestPt.x);

    for (let i = 1; i < chartCanvas.points.length; i++) {
      const dist = Math.abs(mouseX - chartCanvas.points[i].x);
      if (dist < minDist) {
        minDist = dist;
        closestPt = chartCanvas.points[i];
      }
    }

    // 마우스 좌표 근처(약 30px 이내)일 때만 수직선 가이드와 툴팁 표기
    if (Math.abs(mouseX - closestPt.x) < 40) {
      // 캔버스 위에 가이드 라인 실시간 표기 (차트 지우고 다시 그린 뒤 가이드선 가미)
      drawSingleChart();
      
      const ctx = chartCanvas.getContext('2d');
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(closestPt.x, 30);
      ctx.lineTo(closestPt.x, chartCanvas.height - 50);
      ctx.stroke();

      // 포커스 서클
      ctx.beginPath();
      ctx.arc(closestPt.x, closestPt.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#2563eb';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 툴팁 노출
      chartTooltip.style.opacity = '1';
      chartTooltip.style.left = `${closestPt.x + 10}px`;
      chartTooltip.style.top = `${closestPt.y - 45}px`;
      
      const dataItem = closestPt.data;
      const isRateMode = currentCategory === 'rate';
      
      chartTooltip.innerHTML = `
        <strong style="color:#fbbf24;">${dataItem.time}</strong><br>
        지수: <span style="font-weight:700;color:#60a5fa;">${dataItem.val}${isRateMode ? '%' : ''}</span>
      `;
    } else {
      chartTooltip.style.opacity = '0';
    }
  });

  chartCanvas.addEventListener('mouseleave', () => {
    chartTooltip.style.opacity = '0';
    drawSingleChart();
  });
}

// ----------------------------------------------------
// 3) 분석 탭 계산 및 요약 보고서 도출
// ----------------------------------------------------

function runStatisticalAnalysis() {
  if (activeChartData.length === 0) return;

  const vals = activeChartData.map(d => d.val);
  const firstVal = vals[0];
  const lastVal = vals[vals.length - 1];

  // 1) 전체 상승률
  const totalRate = ((lastVal - firstVal) / firstVal) * 100;
  
  // 2) 연평균 상승률 (months / 12)
  const years = activeChartData.length / 12;
  const cagr = (Math.pow(lastVal / firstVal, 1 / years) - 1) * 100;

  // 3) 최고/최저 지점
  let maxIdx = 0;
  let minIdx = 0;
  for (let i = 1; i < vals.length; i++) {
    if (vals[i] > vals[maxIdx]) maxIdx = i;
    if (vals[i] < vals[minIdx]) minIdx = i;
  }

  // UI 출력
  const isRate = currentCategory === 'rate';

  document.getElementById('anal-total-rate').innerText = isRate 
    ? `${(lastVal - firstVal).toFixed(2)}%p` 
    : `${totalRate.toFixed(2)}%`;

  document.getElementById('anal-cagr-rate').innerText = isRate 
    ? '해당없음' 
    : `${cagr.toFixed(2)}%`;

  document.getElementById('anal-max-point').innerText = `${activeChartData[maxIdx].time} (${activeChartData[maxIdx].val})`;
  document.getElementById('anal-min-point').innerText = `${activeChartData[minIdx].time} (${activeChartData[minIdx].val})`;

  // 트렌드 리프트 에디토리얼 요약 자동 빌드
  const categoryName = DATA_STORE[currentCategory].title;
  let reportHTML = `
    현재 조회 구간(<strong>${activeChartData[0].time} ~ ${activeChartData[activeChartData.length-1].time}</strong>, ${activeChartData.length}개월) 동안 
    ${categoryName} 지표는 시작 시점 <strong>${firstVal}</strong>에서 종료 시점 <strong>${lastVal}</strong>으로 변동되었습니다.
  `;

  if (!isRate) {
    reportHTML += `
      누적 인플레이션 상승률은 <strong>${totalRate.toFixed(2)}%</strong>이며, 매월 평균적으로 꾸준히 상승하는 복리 효과가 확인됩니다.
      특히 해당 기간 중 최고 고물가 정점은 <strong>${activeChartData[maxIdx].time}</strong>으로 지수 <strong>${activeChartData[maxIdx].val}</strong>을 기록하였습니다.
    `;
  } else {
    reportHTML += `
      해당 등락률 기간 중 전년동월대비 가장 가파른 인플레이션 속도를 기록한 피크 시점은 <strong>${activeChartData[maxIdx].time}</strong>으로 
      연간 상승률 <strong>${activeChartData[maxIdx].val}%</strong>을 가리키고 있습니다.
    `;
  }

  reportHTML += `
    <br><br>
    <strong>[CineAHO 경제 브리프]</strong><br>
    2022년도에 발생한 글로벌 에너지 공급망 쇼크가 원재료와 신선식품 물가에 기저 효과를 미치며 고물가 국면을 견인했습니다.
    이후 2024~2025년도에는 금리 인상 압박으로 물가 지수가 연착륙 추세(안정기)로 회귀하는 형태를 보이고 있습니다.
  `;

  document.getElementById('analysis-report-text').innerHTML = reportHTML;
}

// ----------------------------------------------------
// 4) 데이터 시트 테이블 드로잉
// ----------------------------------------------------

function renderDataTable() {
  const tbody = document.getElementById('kosis-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';
  
  // 역순(최신 데이터부터) 출력
  const reverseData = [...activeChartData].reverse();

  reverseData.forEach((item, idx) => {
    // 전월 대비 (MoM), 전년동월 대비 (YoY) 임의 계산
    let mom = 0;
    let yoy = 0;

    // activeChartData 인덱스 추적
    const originalIdx = activeChartData.findIndex(d => d.time === item.time);
    
    // MoM
    if (originalIdx > 0) {
      const prev = activeChartData[originalIdx - 1].val;
      mom = ((item.val - prev) / prev) * 100;
    }

    // YoY
    if (originalIdx >= 12) {
      const prevYear = activeChartData[originalIdx - 12].val;
      yoy = ((item.val - prevYear) / prevYear) * 100;
    }

    const tr = document.createElement('tr');
    
    const tdTime = document.createElement('td');
    tdTime.innerText = item.time;
    
    const tdVal = document.createElement('td');
    tdVal.innerText = item.val;
    tdVal.style.fontWeight = '700';

    const tdMom = document.createElement('td');
    tdMom.innerText = originalIdx > 0 ? `${mom.toFixed(2)}%` : '-';
    tdMom.className = mom > 0 ? 'text-red' : (mom < 0 ? 'text-blue' : '');

    const tdYoy = document.createElement('td');
    tdYoy.innerText = originalIdx >= 12 ? `${yoy.toFixed(2)}%` : '-';
    tdYoy.className = yoy > 0 ? 'text-red' : (yoy < 0 ? 'text-blue' : '');

    tr.appendChild(tdTime);
    tr.appendChild(tdVal);
    tr.appendChild(tdMom);
    tr.appendChild(tdYoy);

    tbody.appendChild(tr);
  });
}

// CSV 내보내기 
document.getElementById('btn-export-csv').addEventListener('click', () => {
  if (activeChartData.length === 0) return;

  let csvContent = '\uFEFF'; // Excel 한글 자모 깨짐 방지 BOM 추가
  csvContent += '연월,지수,전월대비 등락률,전년동월대비 등락률\n';

  activeChartData.forEach((item, idx) => {
    let mom = '-';
    let yoy = '-';

    if (idx > 0) {
      const prev = activeChartData[idx - 1].val;
      mom = `${(((item.val - prev) / prev) * 100).toFixed(2)}%`;
    }
    if (idx >= 12) {
      const prevYear = activeChartData[idx - 12].val;
      yoy = `${(((item.val - prevYear) / prevYear) * 100).toFixed(2)}%`;
    }

    csvContent += `${item.time},${item.val},${mom},${yoy}\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `KOSIS_${currentCategory}_${currentSubIndex}_데이터.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // 토스트
  const toast = document.getElementById('kosis-toast');
  toast.classList.add('active');
  setTimeout(() => {
    toast.classList.remove('active');
  }, 1500);
});

// ----------------------------------------------------
// 5) 정보 문서 탭 렌더링
// ----------------------------------------------------

const DOCS = {
  cpi: `
    <h5>소비자물가지수(CPI)의 이해</h5>
    <p>소비자물가지수(Consumer Price Index, CPI)는 대표적인 인플레이션 지표입니다. 도시 가계가 일상생활을 영위하기 위해 구입하는 상품 및 서비스 약 460여 개 품목의 가격 변동을 가중 평균하여 산출합니다.</p>
    <br>
    <h5>금리 및 거시경제 연계성</h5>
    <p>CPI가 급격하게 상승한다는 것은 화폐 가치 하락과 실질 구매력 저하를 유의미합니다. 중앙은행(한국은행)은 물가 안정을 목표로 기준 금리를 인상하여 시중 통화량을 환수하고 수요를 억제합니다. 즉, 소비자물가지수의 추이는 대출 금리와 가계 경제에 직결됩니다.</p>
  `,
  fresh: `
    <h5>신선식품지수(Fresh Food Index)란?</h5>
    <p>계절적 영향과 기후 조건에 의해 가격 진동성이 극단적으로 큰 50여 개 품목(생선, 신선 채소, 과일류)의 장바구니 체감 가격 통계입니다.</p>
    <br>
    <h5>구조적 특징</h5>
    <p>신선식품은 기후 요인(폭우, 한파, 가뭄)에 따른 일시적 공급난에 가격이 민감하게 폭등하며, 공급이 정상화되면 다시 급격히 낙하하는 톱니형 곡선을 보여줍니다. 일반 소비자들의 마트 체감 물가를 지배하는 특성이 있습니다.</p>
  `,
  living: `
    <h5>생활물가지수(Living Necessities Index)</h5>
    <p>소비자들이 체감하는 생활 물가를 가장 잘 반영할 수 있도록, 일상 구입 빈도가 높고 지출 비중이 큰 140여 개의 생필품(식품, 전기세, 수도세, 쓰레기 봉투 등)을 대상으로 집계합니다. 일반 총지수보다 가계의 체감 인플레이션을 실시간으로 직접 대변합니다.</p>
  `,
  region: `
    <h5>시도별 소비자물가지수 (Regional CPI)</h5>
    <p>지방자치단체(서울, 경기, 제주 등)별 유통 마진 차이, 인구 밀집도에 의한 상가 월세 가격, 그리고 지역 내 수급 구조에 따른 개별 물가입니다. 대도시권(서울/경기)은 주거비와 교육비 비중이 크고, 제주는 육지 수송 물류비 가산으로 신선식품 지수가 높게 나타나는 지역적 특징을 보입니다.</p>
  `,
  core: `
    <h5>근원물가지수(Core Inflation)의 정의</h5>
    <p>인플레이션의 기초적이고 장기적인 추세를 측정하기 위해, 계절적 공급 요인이나 국제 유가 충격 등에 영향받기 쉬운 농산물 및 에너지 가격(석유류 등)을 제외하고 산출합니다. 한국은행의 중장기 물가목표 설정 시 핵심 지표로 활용됩니다.</p>
  `,
  rate: `
    <h5>물가상승률(등락률) 지표 해석</h5>
    <p>통상 '올해 물가가 3% 올랐다'고 표현할 때의 YoY(Year on Year) 전년동월대비 변화율 지표입니다. 물가지수가 매달 복리로 누적되어 오르는 것과 달리, 상승률은 인플레이션의 가속 속도를 가리킵니다. 등락률이 하락하더라도(디스인플레이션) 물가 지수 자체는 상승하는 국면임을 이해해야 합니다.</p>
  `
};

function renderInfoDoc() {
  const sec = document.getElementById('info-doc-section');
  if (sec) {
    sec.innerHTML = DOCS[currentCategory] || '설명 문서가 존재하지 않습니다.';
  }
}

// ----------------------------------------------------
// 6) 비교 탭 체크박스 목록 및 트리거 로직
// ----------------------------------------------------

function updateCompareCheckboxList() {
  const grid = document.getElementById('compare-checkbox-grid');
  if (!grid) return;

  grid.innerHTML = '';
  
  // DATA_STORE의 모든 카테고리 내부의 모든 서브지수 목록을 체크박스로 뿌림
  for (const catKey in DATA_STORE) {
    const cat = DATA_STORE[catKey];
    for (const subKey in cat.subIndices) {
      const sub = cat.subIndices[subKey];
      
      const label = document.createElement('label');
      label.className = 'comp-check-item';
      
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = `${catKey}:${subKey}`;
      
      // 기본적으로 3개 지수를 디폴트 체크 처리해 놓기 (비주얼 로드용)
      if (
        (catKey === 'cpi' && subKey === 'total') ||
        (catKey === 'fresh' && subKey === 'total') ||
        (catKey === 'living' && subKey === 'total')
      ) {
        input.checked = true;
      }

      input.addEventListener('change', runCompareRendering);

      const span = document.createElement('span');
      span.innerText = `[${cat.title.split('(')[0]}] ${sub.name}`;

      label.appendChild(input);
      label.appendChild(span);
      grid.appendChild(label);
    }
  }
  
  runCompareRendering();
}

function runCompareRendering() {
  const checkedInputs = document.querySelectorAll('.compare-checkbox-grid input:checked');
  const datasets = [];

  checkedInputs.forEach(input => {
    const [catKey, subKey] = input.value.split(':');
    const store = DATA_STORE[catKey];
    const sub = store.subIndices[subKey];
    
    // 기간별 데이터 슬라이싱해서 셋 추가
    const sliceCount = currentYears * 12;
    const slicedData = sub.data.slice(-sliceCount);
    
    datasets.push({
      name: sub.name,
      data: slicedData
    });
  });

  drawCompareChart(datasets);
}

// ----------------------------------------------------
// 7. 대국적 데이터 새로고침 및 동기화 처리
// ----------------------------------------------------

async function refreshActiveData() {
  // 로딩 상태 피드백
  lcdOutput.innerText = 'FETCHING...';
  
  // OpenAPI 통신 시도
  const fetched = await fetchKosisData(currentCategory, currentSubIndex, currentYears);
  
  activeChartData = fetched;

  // 년월 날짜 레이블 범위 갱신
  if (activeChartData.length > 0) {
    const firstDate = activeChartData[0].time;
    const lastDate = activeChartData[activeChartData.length - 1].time;
    
    const format = (t) => {
      const parts = t.split('.');
      return `${parts[0]}년 ${parseInt(parts[1])}월`;
    };
    document.getElementById('range-date-label').innerText = `${format(firstDate)} ~ ${format(lastDate)}`;
  }

  // 탭별 리드로우
  if (currentTab === 'chart') {
    drawSingleChart();
  } else if (currentTab === 'compare') {
    runCompareRendering();
  } else if (currentTab === 'analysis') {
    runStatisticalAnalysis();
  } else if (currentTab === 'data') {
    renderDataTable();
  } else if (currentTab === 'info') {
    renderInfoDoc();
  }

  lcdOutput.innerText = activeChartData[activeChartData.length - 1].val;
  lcdFormula.innerText = DATA_STORE[currentCategory].title;
}

// ----------------------------------------------------
// UI 이벤트 바인딩
// ----------------------------------------------------

// 1. 카테고리 6단 카드 클릭 이벤트
document.querySelectorAll('.cat-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    
    currentCategory = card.dataset.category;
    
    // 지수 서브 셀렉트 갱신
    updateSubIndexOptions();
    
    // 새로고침 실행
    refreshActiveData();
  });
});

// 2. 세부 지수 셀렉트 변경
document.getElementById('sub-index-select').addEventListener('change', (e) => {
  currentSubIndex = e.target.value;
  refreshActiveData();
});

// 3. 조회 기간 버튼 변경
document.querySelectorAll('.btn-range').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.btn-range').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    currentYears = parseInt(btn.dataset.years);
    refreshActiveData();
  });
});

// 4. 분석 탭 변경
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    currentTab = btn.dataset.tab;
    
    // 다른 탭바 컨텐츠 숨김/노출
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`tab-content-${currentTab}`).classList.add('active');
    
    refreshActiveData();
  });
});

// 5. 새로고침 단추 클릭
document.getElementById('btn-refresh-data').addEventListener('click', () => {
  refreshActiveData();
  showNotification('물가 데이터가 성공적으로 갱신되었습니다.');
});

function showNotification(msg) {
  const toast = document.getElementById('kosis-toast');
  toast.innerText = msg;
  toast.classList.add('active');
  setTimeout(() => {
    toast.classList.remove('active');
  }, 1500);
}

// ----------------------------------------------------
// 플로팅 위젯 제어
// ----------------------------------------------------
const btnMenuTrigger = document.getElementById('btn-menu-trigger');
const navOverlayMenu = document.getElementById('nav-overlay-menu');

btnMenuTrigger.addEventListener('click', () => {
  navOverlayMenu.classList.toggle('active');
});

document.getElementById('btn-scroll-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('btn-scroll-bottom').addEventListener('click', () => {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
});

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  let percent = 0;
  if (docHeight > 0) {
    percent = Math.round((scrollTop / docHeight) * 100);
  }

  document.querySelector('.progress-text').innerText = `${percent}%`;

  const circle = document.querySelector('.progress-ring__circle');
  if (circle) {
    const circumference = 2 * Math.PI * 15;
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
  }
});

// ----------------------------------------------------
// 초기 시동 시퀀스
// ----------------------------------------------------
initDataStore();
updateSubIndexOptions();
updateCompareCheckboxList();
refreshActiveData();
