// e:\Antigravity\workspace\Cineaho\trend\app.js

document.addEventListener("DOMContentLoaded", () => {
  // --- Web Audio Chimes Synthesizer ---
  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playChime(type) {
    try {
      initAudio();
      if (!audioCtx) return;
      
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      const now = audioCtx.currentTime;
      if (type === 'click') {
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.setValueAtTime(554.37, now + 0.08); // C#5
        osc.frequency.setValueAtTime(659.25, now + 0.16); // E5
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'warn') {
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.setValueAtTime(180, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      console.warn("Audio Context blocked or failed:", e.message);
    }
  }

  // Bind click sounds globally to interactive elements
  document.querySelectorAll("button, select, .tab-btn").forEach(el => {
    el.addEventListener("click", () => playChime('click'));
  });

  // --- State Variables ---
  let kiwiCredits = 500;
  let savedFilters = [];
  let calendarEvents = [];
  
  // Active chart instances
  let demographicsChart = null;
  let seasonalityChart = null;
  let overlapChart = null;

  // --- HTML Elements ---
  const kiwiDisplay = document.getElementById("kiwi-credits-display");
  const btnResetApp = document.getElementById("btn-reset-app");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");
  const statusOverlay = document.getElementById("status-overlay");
  const statusMessage = document.getElementById("status-message");
  const toastMessage = document.getElementById("toast-message");
  const btnReanalyzeTrends = document.getElementById("btn-reanalyze-trends");

  // News Sentiment & Frequency Analyzer Elements
  const newsAnalysisTargetLabel = document.getElementById("news-analysis-target-label");
  const newsSentimentStatusLabel = document.getElementById("news-sentiment-status-label");
  const newsFrequencyBarsContainer = document.getElementById("news-frequency-bars-container");
  const newsSentimentBar = document.getElementById("news-sentiment-bar");
  const newsPosPct = document.getElementById("news-pos-pct");
  const newsNeuPct = document.getElementById("news-neu-pct");
  const newsNegPct = document.getElementById("news-neg-pct");
  const newsHeadlinesList = document.getElementById("news-headlines-list");

  // --- Local Storage Sync ---
  function loadState() {
    try {
      const savedCredits = localStorage.getItem("trend_kiwi_credits");
      if (savedCredits !== null) {
        kiwiCredits = parseInt(savedCredits, 10);
      } else {
        kiwiCredits = 500;
      }
      updateKiwiDisplay();

      const filters = localStorage.getItem("trend_saved_filters");
      if (filters) savedFilters = JSON.parse(filters);
      renderSavedFilters();

      const events = localStorage.getItem("trend_calendar_events");
      if (events) {
        calendarEvents = JSON.parse(events);
      } else {
        // Prepopulate with a few demo calendar items
        calendarEvents = [
          { day: 5, month: 6, year: 2026, keyword: "GPT-4o 활용가이드" },
          { day: 15, month: 6, year: 2026, keyword: "여름 캠핑장 추천" }
        ];
        saveState();
      }
      renderCalendar(6); // Default 6 (June)

      const savedSource = localStorage.getItem("trend_active_source");
      if (savedSource !== null) {
        currentSource = savedSource;
      } else {
        currentSource = "all";
      }
      // Sync UI active state for source tab buttons
      document.querySelectorAll(".source-tab-btn").forEach(btn => {
        if (btn.dataset.source === currentSource) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    } catch (e) {
      console.error("Local Storage load error:", e);
    }
  }

  function saveState() {
    localStorage.setItem("trend_kiwi_credits", kiwiCredits.toString());
    localStorage.setItem("trend_saved_filters", JSON.stringify(savedFilters));
    localStorage.setItem("trend_calendar_events", JSON.stringify(calendarEvents));
    localStorage.setItem("trend_active_source", currentSource);
  }

  function updateKiwiDisplay() {
    kiwiDisplay.querySelector("span").textContent = `${kiwiCredits} KIWI`;
  }

  function showToast(text) {
    toastMessage.textContent = text;
    toastMessage.classList.add("active");
    setTimeout(() => {
      toastMessage.classList.remove("active");
    }, 2000);
  }

  // Recharge Kiwi credit
  kiwiDisplay.addEventListener("click", () => {
    kiwiCredits += 50;
    saveState();
    updateKiwiDisplay();
    playChime('success');
    showToast("50 KIWI 무료 충전되었습니다!");
  });

  // Reset data button
  btnResetApp.addEventListener("click", () => {
    if (confirm("정말로 모든 로컬 분석 이력 및 일정을 초기화하시겠습니까?")) {
      localStorage.clear();
      loadState();
      showToast("모든 데이터가 초기화되었습니다.");
      location.reload();
    }
  });

  // --- Tab Switching ---
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;
      
      tabButtons.forEach(b => b.classList.remove("active"));
      tabPanels.forEach(p => p.classList.remove("active"));
      
      btn.classList.add("active");
      document.getElementById(targetTab).classList.add("active");
      
      // Special action: render charts when changing to tab-analysis/influence
      if (targetTab === "tab-analysis" && document.getElementById("analysis-dashboard-wrapper").style.display === "flex") {
        setTimeout(triggerAnalysisChartsResize, 50);
      }
    });
  });

  function triggerAnalysisChartsResize() {
    if (demographicsChart) demographicsChart.resize();
    if (seasonalityChart) seasonalityChart.resize();
  }

  // --- Tab 1: Trend Analysis Data ---
  let currentSource = "all";

  let risingKeywords = {
    all: {
      daily: [
        { rank: 1, keyword: "Claude 3.5 Sonnet 출시", growth: "+420%", category: "AI/IT", news: "https://search.google.com/search?q=Claude+3.5+Sonnet" },
        { rank: 2, keyword: "제주도 수국 명소", growth: "+380%", category: "국내여행", news: "https://search.naver.com/search.naver?where=news&query=제주도+수국" },
        { rank: 3, keyword: "장마 대비 제습기 추천", growth: "+310%", category: "생활가전", news: "https://search.naver.com/search.naver?where=news&query=장마+제습기" },
        { rank: 4, keyword: "K-콘텐츠 세제 혜택", growth: "+260%", category: "정책/경제", news: "https://search.naver.com/search.naver?where=news&query=K콘텐츠+세제혜택" },
        { rank: 5, keyword: "AI 반도체 엔비디아 주가", growth: "+210%", category: "주식/금융", news: "https://search.google.com/search?q=엔비디아+AI반도체" },
        { rank: 6, keyword: "글루타치온 효과 분석", growth: "+190%", category: "의료/건강", news: "https://search.naver.com/search.naver?where=news&query=글루타치온+효능" },
        { rank: 7, keyword: "다이어트 유산균 추천", growth: "+150%", category: "건강/의학", news: "https://search.naver.com/search.naver?where=news&query=다이어트+유산균" },
        { rank: 8, keyword: "아파트 취득세 계산기", growth: "+120%", category: "부동산/세무", news: "https://search.naver.com/search.naver?where=news&query=아파트+취득세" }
      ],
      monthly: [
        { rank: 1, keyword: "여름 휴가 추천 해외여행지", growth: "+680%", category: "해외여행", news: "https://search.naver.com/search.naver?where=news&query=여름휴가+해외여행" },
        { rank: 2, keyword: "소상공인 재난지원 대출", growth: "+490%", category: "정부지원", news: "https://search.naver.com/search.naver?where=news&query=소상공인+지원대출" },
        { rank: 3, keyword: "선크림 백탁현상 없는 제품", growth: "+410%", category: "화장품/뷰티", news: "https://search.naver.com/search.naver?where=news&query=백탁없는+선크림" },
        { rank: 4, keyword: "Generative AI in Healthcare", growth: "+330%", category: "AI/헬스케어", news: "https://search.google.com/search?q=Generative+AI+in+Healthcare" },
        { rank: 5, keyword: "캠핑용 타프 설치법", growth: "+290%", category: "레저/아웃도어", news: "https://search.naver.com/search.naver?where=news&query=캠핑+타프" },
        { rank: 6, keyword: "초당옥수수 찌는법", growth: "+240%", category: "식품/요리", news: "https://search.naver.com/search.naver?where=news&query=초당옥수수+찌는법" },
        { rank: 7, keyword: "종합소득세 신고 기한", growth: "+180%", category: "세무/회계", news: "https://search.naver.com/search.naver?where=news&query=종합소득세+신고기한" },
        { rank: 8, keyword: "에어컨 전기세 절약 방법", growth: "+160%", category: "리빙/생활", news: "https://search.naver.com/search.naver?where=news&query=에어컨+전기세+절약" }
      ]
    },
    naver: {
      daily: [
        { rank: 1, keyword: "글루타치온 효과 분석", growth: "+410%", category: "뷰티/헬스", news: "https://search.naver.com/search.naver?where=news&query=글루타치온+효능" },
        { rank: 2, keyword: "제주도 수국 명소", growth: "+380%", category: "국내여행", news: "https://search.naver.com/search.naver?where=news&query=제주도+수국" },
        { rank: 3, keyword: "장마 대비 제습기 추천", growth: "+310%", category: "생활가전", news: "https://search.naver.com/search.naver?where=news&query=장마+제습기" },
        { rank: 4, keyword: "혈압 낮추는 식단 가이드", growth: "+290%", category: "의료/건강", news: "https://search.naver.com/search.naver?where=news&query=혈압+낮추는+방법" },
        { rank: 5, keyword: "다이어트 유산균 추천", growth: "+210%", category: "건강/의학", news: "https://search.naver.com/search.naver?where=news&query=다이어트+유산균" },
        { rank: 6, keyword: "에어컨 청소 비용", growth: "+190%", category: "리빙/생활", news: "https://search.naver.com/search.naver?where=news&query=에어컨+청소업체+비용" },
        { rank: 7, keyword: "당뇨 초기증상 체크", growth: "+160%", category: "의료/건강", news: "https://search.naver.com/search.naver?where=news&query=당뇨+초기증상" },
        { rank: 8, keyword: "여름 샌들 핫딜", growth: "+120%", category: "패션/쇼핑", news: "https://search.naver.com/search.naver?where=news&query=여름+샌들" }
      ],
      monthly: [
        { rank: 1, keyword: "초당옥수수 맛있는 보관법", growth: "+650%", category: "식품/요리", news: "https://search.naver.com/search.naver?where=news&query=초당옥수수+보관법" },
        { rank: 2, keyword: "선크림 백탁현상 없는 제품", growth: "+410%", category: "화장품/뷰티", news: "https://search.naver.com/search.naver?where=news&query=백탁없는+선크림" },
        { rank: 3, keyword: "여름 휴가 국내 휴양지 TOP 10", growth: "+390%", category: "국내여행", news: "https://search.naver.com/search.naver?where=news&query=국내+여름휴가지" },
        { rank: 4, keyword: "비타민D 권장 섭취량", growth: "+280%", category: "의료/건강", news: "https://search.naver.com/search.naver?where=news&query=비타민D+하루권장량" },
        { rank: 5, keyword: "모기 퇴치 스마트 패치", growth: "+240%", category: "생활잡화", news: "https://search.naver.com/search.naver?where=news&query=모기퇴치+패치" },
        { rank: 6, keyword: "종합영양제 성분 비교법", growth: "+190%", category: "건강/의학", news: "https://search.naver.com/search.naver?where=news&query=종합영양제+비교" },
        { rank: 7, keyword: "피부 장벽 개선 크림", growth: "+160%", category: "화장품/뷰티", news: "https://search.naver.com/search.naver?where=news&query=피부장벽+크림" },
        { rank: 8, keyword: "실내 제습 방법", growth: "+110%", category: "리빙/생활", news: "https://search.naver.com/search.naver?where=news&query=실내제습방법" }
      ]
    },
    google: {
      daily: [
        { rank: 1, keyword: "Claude 3.5 Sonnet 출시", growth: "+420%", category: "AI/IT", news: "https://search.google.com/search?q=Claude+3.5+Sonnet" },
        { rank: 2, keyword: "PubMed 바이오 마커 논문", growth: "+340%", category: "의료/학술", news: "https://search.google.com/search?q=PubMed+biomarker+papers" },
        { rank: 3, keyword: "NVIDIA AI 반도체 주가", growth: "+260%", category: "주식/금융", news: "https://search.google.com/search?q=NVIDIA+stock" },
        { rank: 4, keyword: "GLP-1 비만치료제 임상 결과", growth: "+220%", category: "바이오/의학", news: "https://search.google.com/search?q=GLP-1+clinical+trial+results" },
        { rank: 5, keyword: "GPT-4o API 요금 비교", growth: "+180%", category: "AI/IT", news: "https://search.google.com/search?q=GPT-4o+API+pricing" },
        { rank: 6, keyword: "알츠하이머 백신 임상 3상", growth: "+150%", category: "바이오/의학", news: "https://search.google.com/search?q=Alzheimer+vaccine+phase+3" },
        { rank: 7, keyword: "AI 기반 신약 개발 플랫폼", growth: "+140%", category: "테크/바이오", news: "https://search.google.com/search?q=AI+drug+discovery+platform" },
        { rank: 8, keyword: "Apple Vision Pro 2 출시 루머", growth: "+110%", category: "신제품/테크", news: "https://search.google.com/search?q=Apple+Vision+Pro+2+rumors" }
      ],
      monthly: [
        { rank: 1, keyword: "Generative AI in Healthcare", growth: "+710%", category: "AI/헬스케어", news: "https://search.google.com/search?q=Generative+AI+in+Healthcare" },
        { rank: 2, keyword: "CRISPR 유전자 가위 암 치료", growth: "+480%", category: "바이오/의학", news: "https://search.google.com/search?q=CRISPR+cancer+therapy" },
        { rank: 3, keyword: "Midjourney v6 프롬프트 가이드", growth: "+390%", category: "IT/디자인", news: "https://search.google.com/search?q=Midjourney+v6+prompts" },
        { rank: 4, keyword: "마이크로바이옴 신약 승인", growth: "+310%", category: "바이오/의학", news: "https://search.google.com/search?q=microbiome+drug+approvals" },
        { rank: 5, keyword: "Stable Diffusion 3.0 세팅", growth: "+240%", category: "AI/IT", news: "https://search.google.com/search?q=Stable+Diffusion+3.0" },
        { rank: 6, keyword: "스마트워치 심전도 정밀도", growth: "+190%", category: "테크/건강", news: "https://search.google.com/search?q=smartwatch+ECG+accuracy" },
        { rank: 7, keyword: "메타버스 디지털 치료제(DTx)", growth: "+160%", category: "의료/테크", news: "https://search.google.com/search?q=digital+therapeutics" },
        { rank: 8, keyword: "나스닥 바이오테크 ETF 추천", growth: "+130%", category: "금융/재테크", news: "https://search.google.com/search?q=Nasdaq+Biotechnology+ETF" }
      ]
    },
    daum: {
      daily: [
        { rank: 1, keyword: "소상공인 재난지원 대출", growth: "+430%", category: "정부지원", news: "https://search.daum.net/search?w=news&q=소상공인+지원대출" },
        { rank: 2, keyword: "K-콘텐츠 세제 혜택", growth: "+310%", category: "정책/경제", news: "https://search.daum.net/search?w=news&q=K콘텐츠+세제혜택" },
        { rank: 3, keyword: "아파트 취득세 계산기", growth: "+280%", category: "부동산/세무", news: "https://search.daum.net/search?w=news&q=아파트+취득세" },
        { rank: 4, keyword: "노령연금 수급자격 기준", growth: "+210%", category: "복지/정책", news: "https://search.daum.net/search?w=news&q=노령연금+수급자격" },
        { rank: 5, keyword: "임영웅 콘서트 서울 예매", growth: "+190%", category: "대중문화", news: "https://search.daum.net/search?w=news&q=임영웅+콘서트+예매" },
        { rank: 6, keyword: "근로장려금 지급일 조회", growth: "+170%", category: "세무/복지", news: "https://search.daum.net/search?w=news&q=근로장려금+지급일" },
        { rank: 7, keyword: "주말 전국 날씨 및 장마전선", growth: "+150%", category: "생활/기상", news: "https://search.daum.net/search?w=news&q=주말+날씨+장마전선" },
        { rank: 8, keyword: "디지털 배움터 신청방법", growth: "+120%", category: "복지/교육", news: "https://search.daum.net/search?w=news&q=디지털배움터" }
      ],
      monthly: [
        { rank: 1, keyword: "종합소득세 신고 기한 연장", growth: "+580%", category: "세무/회계", news: "https://search.daum.net/search?w=news&q=종합소득세+신고기한" },
        { rank: 2, keyword: "국민연금 개혁안 비교", growth: "+420%", category: "사회/정책", news: "https://search.daum.net/search?w=news&q=국민연금+개혁안" },
        { rank: 3, keyword: "에어컨 전기세 절약 방법", growth: "+360%", category: "생활/살림", news: "https://search.daum.net/search?w=news&q=에어컨+전기세+절약" },
        { rank: 4, keyword: "지역사랑상품권 특별할인", growth: "+290%", category: "생활/경제", news: "https://search.daum.net/search?w=news&q=지역사랑상품권+할인" },
        { rank: 5, keyword: "햇살론 유스 대출 한도", growth: "+220%", category: "금융/지원", news: "https://search.daum.net/search?w=news&q=햇살론+유스" },
        { rank: 6, keyword: "전세사기 특별법 개정안", growth: "+180%", category: "부동산/법률", news: "https://search.daum.net/search?w=news&q=전세사기+특별법" },
        { rank: 7, keyword: "고향사랑기부제 답례품 추천", growth: "+140%", category: "정책/살림", news: "https://search.daum.net/search?w=news&q=고향사랑기부제+답례품" },
        { rank: 8, keyword: "지방 자치 교육 바우처", growth: "+110%", category: "교육/정책", news: "https://search.daum.net/search?w=news&q=교육+바우처" }
      ]
    }
  };

  let wordCloudKeywords = {
    all: [
      { text: "인공지능", size: "26px", color: "var(--color-primary)", weight: "bold" },
      { text: "여름 휴가", size: "24px", color: "var(--color-secondary)", weight: "bold" },
      { text: "Claude 3.5", size: "22px", color: "#bae6fd", weight: "600" },
      { text: "글루타치온", size: "21px", color: "var(--color-success)", weight: "600" },
      { text: "비만치료제", size: "20px", color: "var(--color-warning)", weight: "500" },
      { text: "장마 대비", size: "19px", color: "var(--color-warning)", weight: "500" },
      { text: "선크림", size: "18px", color: "var(--color-success)", weight: "500" },
      { text: "캠핑용품", size: "17px", color: "#e9d5ff", weight: "500" },
      { text: "재난대출", size: "16px", color: "var(--text-secondary)", weight: "normal" },
      { text: "주식투자", size: "15px", color: "#fca5a5", weight: "500" },
      { text: "GPT-4o", size: "14px", color: "var(--color-secondary)", weight: "normal" },
      { text: "제습기", size: "13px", color: "var(--text-secondary)", weight: "normal" }
    ],
    naver: [
      { text: "글루타치온", size: "26px", color: "var(--color-success)", weight: "bold" },
      { text: "제주도 수국", size: "24px", color: "var(--color-secondary)", weight: "bold" },
      { text: "다이어트 유산균", size: "22px", color: "#bae6fd", weight: "600" },
      { text: "장마 대비", size: "20px", color: "var(--color-warning)", weight: "500" },
      { text: "선크림", size: "19px", color: "var(--color-success)", weight: "500" },
      { text: "초당옥수수", size: "18px", color: "#e9d5ff", weight: "500" },
      { text: "당뇨 초기증상", size: "17px", color: "var(--color-primary)", weight: "normal" },
      { text: "에어컨 청소", size: "16px", color: "#fca5a5", weight: "500" },
      { text: "피부 장벽", size: "15px", color: "var(--color-secondary)", weight: "normal" },
      { text: "여름 샌들", size: "14px", color: "var(--text-secondary)", weight: "normal" }
    ],
    google: [
      { text: "Claude 3.5", size: "26px", color: "#bae6fd", weight: "bold" },
      { text: "GLP-1", size: "24px", color: "var(--color-primary)", weight: "bold" },
      { text: "PubMed", size: "22px", color: "var(--color-success)", weight: "600" },
      { text: "NVIDIA", size: "20px", color: "var(--color-secondary)", weight: "500" },
      { text: "GPT-4o", size: "19px", color: "var(--color-warning)", weight: "500" },
      { text: "알츠하이머 백신", size: "18px", color: "#e9d5ff", weight: "500" },
      { text: "유전자 가위", size: "17px", color: "var(--color-success)", weight: "normal" },
      { text: "신약 개발 AI", size: "16px", color: "#fca5a5", weight: "500" },
      { text: "Vision Pro 2", size: "15px", color: "var(--text-secondary)", weight: "normal" },
      { text: "마이크로바이옴", size: "14px", color: "var(--color-primary)", weight: "normal" }
    ],
    daum: [
      { text: "재난지원 대출", size: "26px", color: "var(--color-primary)", weight: "bold" },
      { text: "임영웅 예매", size: "24px", color: "var(--color-secondary)", weight: "bold" },
      { text: "종합소득세", size: "22px", color: "#bae6fd", weight: "600" },
      { text: "국민연금", size: "20px", color: "var(--color-warning)", weight: "500" },
      { text: "에어컨 전기세", size: "19px", color: "var(--color-success)", weight: "500" },
      { text: "근로장려금", size: "18px", color: "#e9d5ff", weight: "500" },
      { text: "취득세 계산기", size: "17px", color: "var(--text-secondary)", weight: "normal" },
      { text: "노령연금", size: "16px", color: "#fca5a5", weight: "500" },
      { text: "장마전선", size: "15px", color: "var(--color-secondary)", weight: "normal" },
      { text: "사랑상품권", size: "14px", color: "var(--text-secondary)", weight: "normal" }
    ]
  };

  let newlyEmergedKeywords = {
    all: [
      {
        date: "오늘 (2026.06.05)",
        items: [
          { name: "비만치료제 위고비 국내 허가", search: "8,920회", category: "바이오/의학", advice: "식약처 허가 기준 및 약가 비교 분석 앵글 추천" },
          { name: "애플 비전 프로2 루머", search: "4,820회", category: "신제품/테크", advice: "얼리어답터용 앵글로 유튜브 쇼츠 제작 권장" }
        ]
      },
      {
        date: "어제 (2026.06.04)",
        items: [
          { name: "아무코 댄스 챌린지", search: "12,900회", category: "신조어/밈", advice: "인스타그램 릴스 음원 매칭 및 챌린지 앵글 권장" },
          { name: "탄소 배출권 거래 신법안", search: "2,350회", category: "새로운 정책", advice: "친환경 ESG 관련 기획 기사 작성에 적합" }
        ]
      }
    ],
    naver: [
      {
        date: "오늘 (2026.06.05)",
        items: [
          { name: "비만치료제 위고비 국내 허가", search: "8,920회", category: "바이오/의학", advice: "식약처 허가 기준 및 부작용 주의사항 정리 권장" },
          { name: "여름철 탈모 예방법", search: "4,200회", category: "의료/건강", advice: "두피 열 내리는 관리 팁 정보성 포스팅 추천" }
        ]
      },
      {
        date: "어제 (2026.06.04)",
        items: [
          { name: "가성비 여름 영양제 공구", search: "7,150회", category: "의료/건강", advice: "직구 영양제 추천 리스트 및 성분 배합 분석 추천" },
          { name: "계곡 펜션 예약 팁", search: "5,300회", category: "생활/여행", advice: "가족 여행용 숨은 물놀이 스팟 정리 콘텐츠 권장" }
        ]
      }
    ],
    google: [
      {
        date: "오늘 (2026.06.05)",
        items: [
          { name: "OpenAI SearchGPT 발표", search: "14,800회", category: "테크/AI", advice: "네이버 검색엔진 대비 차별점 분석 기사 권장" },
          { name: "유전자 가위 특허권 판결", search: "3,100회", category: "바이오/학술", advice: "국내 바이오 벤처 기업 지식재산권 영향 분석 추천" }
        ]
      },
      {
        date: "어제 (2026.06.04)",
        items: [
          { name: "NVIDIA Rubin 아키텍처 스펙", search: "18,200회", category: "반도체/IT", advice: "Rubin 스펙 요약 및 공급망 수혜주 정리 권장" },
          { name: "Alzheimer 타우 단백질 신약", search: "4,900회", category: "바이오/의학", advice: "치매 치료제 기전 및 상용화 시점 정리 추천" }
        ]
      }
    ],
    daum: [
      {
        date: "오늘 (2026.06.05)",
        items: [
          { name: "청년 주택 드림 청약통장", search: "9,250회", category: "정부지원", advice: "기존 청약 통장 전환 절차 및 혜택 요약 권장" },
          { name: "경로연금 추가 인상 법안", search: "3,400회", category: "복지/정책", advice: "인상액 지급 시점 및 나이대별 조건 가이드" }
        ]
      },
      {
        date: "어제 (2026.06.04)",
        items: [
          { name: "디지털 배움터 마일리지", search: "5,100회", category: "정책/교육", advice: "적립 및 사용방법 상세 튜토리얼 앵글 추천" },
          { name: "자전거 헬멧 의무화 과태료", search: "4,200회", category: "생활/법률", advice: "벌금 규정 및 안전 장비 고르는법 가이드 추천" }
        ]
      }
    ]
  };

  const aiTrendReport = {
    all: {
      summary: `현재 온라인 검색 및 콘텐츠 트렌드에서 가장 지배적인 영향력을 보이고 있는 영역은 <strong>생성형 AI의 신모델 발표(Claude 3.5 Sonnet)</strong>와 계절적 수요 급등에 따른 <strong>아웃도어/여름 용품 준비(장마, 제주도 수국, 선크림)</strong>입니다.<br><br>특히 '아무코 댄스'와 같은 쇼츠/릴스 기반의 글로벌 숏폼 챌린지 밈이 급증하여 마케팅 소셜 채널에서의 트래픽 확보가 유리합니다. 정책면에서는 'K-콘텐츠 세제 혜택' 관련 키워드가 지식창작자 그룹 사이에서 널리 검색되고 있습니다.`,
      angles: [
        { theme: "테크/생산성", angle: "GPT-4o vs Claude 3.5 실무 코딩 능력 비교분석 앵글" },
        { theme: "여행/레저", angle: "장마철에도 즐길 수 있는 비 안 맞는 국내 이색 관광지 10선" },
        { theme: "라이프스타일", angle: "여름철 에어컨 하루 10시간 가동 시 누진세 피하는 현실 꿀팁" }
      ]
    },
    naver: {
      summary: `네이버 검색 트렌드는 실생활 중심의 <strong>건강기능식품(글루타치온, 다이어트 유산균)</strong>과 <strong>여름 맞이 실내외 대비(제습기, 수국 명소)</strong>가 주도하고 있습니다.<br><br>특히 바이오 박사로서 추천하는 유산균 성분 대조법이나 글루타치온 복용 시점별 효과 차이 등, 신뢰성 있는 전문 지식을 기반으로 한 제품 비교/체험 리뷰 포스팅이 검색 탭 상위에 노출되기 가장 좋은 시점입니다.`,
      angles: [
        { theme: "의료/건강", angle: "글루타치온 복용법: 흡수율 높이는 섭취 시간과 시너지 영양소" },
        { theme: "건강/의학", angle: "다이어트 유산균 선택 기준: 보장 균수와 인체 적용 시험 결과 분석" },
        { theme: "리빙/생활", angle: "장마철 곰팡이 방지: 실내 습도 50% 유지하는 가장 저렴한 환기법" }
      ]
    },
    google: {
      summary: `구글의 트렌드는 글로벌 기술 동향인 <strong>AI 아키텍처(Claude 3.5, Gemini)</strong> 및 <strong>학술적 바이오 신약 연구(PubMed 바이오 마커, GLP-1 비만치료제)</strong>가 큰 점유율을 보이고 있습니다.<br><br>바이오/헬스케어 기획자나 IT 크리에이터라면 학술 데이터베이스를 결합한 깊이 있는 분석 글과 최신 논문 번역/해설 콘텐츠를 제작해 전문 도메인 권위를 공고히 할 것을 권장합니다.`,
      angles: [
        { theme: "바이오/의학", angle: "GLP-1 계열 비만 치료제 신약 임상 3상 비교분석 및 국내 출시 전망" },
        { theme: "AI/헬스케어", angle: "PubMed 기반 바이오 마커 색인에 생성형 AI 파이프라인을 구축하는 법" },
        { theme: "테크/AI", angle: "앤트로픽 Claude 3.5 Sonnet Artifacts를 활용한 10분 만에 웹앱 MVP 완성하기" }
      ]
    },
    daum: {
      summary: `다음 포털에서는 정부 지원 정책인 <strong>소상공인 지원 대출</strong> 및 <strong>복지 혜택(노령연금, 근로장려금)</strong>, 그리고 실생활 경제 정보가 최상위 트래픽을 차지합니다.<br><br>일반 대중 및 장노년층 타겟의 복잡한 세무/복지 정책 신청 절차를 단계별로 쉽게 요약하고 다운로드 서식을 제공하는 콘텐츠 앵글이 안정적인 유입을 확보하는 데 유리합니다.`,
      angles: [
        { theme: "정부지원/금융", angle: "2026년 소상공인 저금리 지원 대출 자격 조건과 서류 간소화 꿀팁" },
        { theme: "복지/정책", angle: "노령연금 수급자격 모의 계산 및 다주택자 감액 규정 쉽게 이해하기" },
        { theme: "세무/재테크", angle: "종합소득세 기한 내 미신고 시 가산세 구제 절차와 환급금 조회 방법" }
      ]
    }
  };

  let secondaryKeywordPool = {
    all: [
      { keyword: "mRNA 암치료 백신 임상", category: "바이오/의학", news: "https://search.google.com/search?q=mRNA+cancer+vaccine" },
      { keyword: "Gemini 1.5 업데이트", category: "AI/IT", news: "https://search.google.com/search?q=Gemini+1.5+pro" },
      { keyword: "여름철 탈모 예방법", category: "의료/건강", news: "https://search.naver.com/search.naver?where=news&query=탈모+예방" },
      { keyword: "청년 주택드림 청약", category: "정부지원", news: "https://search.naver.com/search.naver?where=news&query=청년주택드림청약" }
    ],
    naver: [
      { keyword: "비타민C 고용량 메가도스", category: "의료/건강", news: "https://search.naver.com/search.naver?where=news&query=비타민C+메가도스" },
      { keyword: "마이크로바이옴 피부 유산균", category: "뷰티/헬스", news: "https://search.naver.com/search.naver?where=news&query=피부+유산균" },
      { keyword: "장마철 곰팡이 제거 꿀팁", category: "리빙/생활", news: "https://search.naver.com/search.naver?where=news&query=장마철+곰팡이+제거" },
      { keyword: "초당옥수수 전자레인지 시간", category: "식품/요리", news: "https://search.naver.com/search.naver?where=news&query=초당옥수수+전자레인지" }
    ],
    google: [
      { keyword: "mRNA 암치료 백신 임상", category: "바이오/의학", news: "https://search.google.com/search?q=mRNA+cancer+vaccine" },
      { keyword: "Gemini 1.5 업데이트", category: "AI/IT", news: "https://search.google.com/search?q=Gemini+1.5+pro" },
      { keyword: "CRISPR 유전자 교정 윤리", category: "바이오/학술", news: "https://search.google.com/search?q=CRISPR+ethics" },
      { keyword: "디지털 바이오 마커 학회", category: "의료/테크", news: "https://search.google.com/search?q=digital+biomarker+conference" }
    ],
    daum: [
      { keyword: "청년 주택드림 청약", category: "정부지원", news: "https://search.daum.net/search?w=news&q=청년주택드림청약" },
      { keyword: "국민연금 조기수령 조건", category: "복지/정책", news: "https://search.daum.net/search?w=news&q=국민연금+조기수령" },
      { keyword: "장마철 빗길 운전 예방", category: "생활/교통", news: "https://search.daum.net/search?w=news&q=장마철+빗길운전" },
      { keyword: "상생임대인 요건 확인", category: "부동산/세무", news: "https://search.daum.net/search?w=news&q=상생임대인" }
    ]
  };

  const trendPeriodSelect = document.getElementById("trend-period-select");
  const risingKeywordsTbody = document.getElementById("rising-keywords-tbody");
  const wordCloudContainer = document.getElementById("word-cloud-container");
  const newlyEmergedContainer = document.getElementById("newly-emerged-container");
  const aiInsightReportContainer = document.getElementById("ai-insight-report-container");

  // --- Real-time News Sentiment & Frequency Analyzer Logic ---
  let currentNewsKeyword = "Claude 3.5 Sonnet 출시";

  function analyzeNewsContext(keyword) {
    currentNewsKeyword = keyword;
    if (newsAnalysisTargetLabel) {
      newsAnalysisTargetLabel.textContent = keyword;
    }

    const seedVal = generateHashValue(keyword, 0, 100);
    const pos = 45 + (seedVal % 35); // 45% to 80%
    const neg = 5 + (seedVal % 15);  // 5% to 20%
    const neu = 100 - pos - neg;

    if (newsPosPct) newsPosPct.textContent = `${pos}%`;
    if (newsNeuPct) newsNeuPct.textContent = `${neu}%`;
    if (newsNegPct) newsNegPct.textContent = `${neg}%`;

    if (newsSentimentBar) {
      newsSentimentBar.innerHTML = `
        <div style="width: ${pos}%; background: #10b981; height: 100%;" title="긍정 ${pos}%"></div>
        <div style="width: ${neu}%; background: #6b7280; height: 100%;" title="중립 ${neu}%"></div>
        <div style="width: ${neg}%; background: #ef4444; height: 100%;" title="부정 ${neg}%"></div>
      `;
    }

    if (newsSentimentStatusLabel) {
      if (pos > 65) {
        newsSentimentStatusLabel.textContent = "긍정적 여론 우세";
        newsSentimentStatusLabel.style.backgroundColor = "rgba(16, 185, 129, 0.15)";
        newsSentimentStatusLabel.style.color = "#34d399";
      } else if (neg > 15) {
        newsSentimentStatusLabel.textContent = "부정적 여론 우려";
        newsSentimentStatusLabel.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
        newsSentimentStatusLabel.style.color = "#f87171";
      } else {
        newsSentimentStatusLabel.textContent = "중립적 여론 대기";
        newsSentimentStatusLabel.style.backgroundColor = "rgba(156, 163, 175, 0.15)";
        newsSentimentStatusLabel.style.color = "#d1d5db";
      }
    }

    const relatedWordsPool = {
      "Claude 3.5 Sonnet 출시": ["Anthropic", "코딩 성능", "GPT-4o 비교", "생산성 향상", "무료 사용"],
      "제주도 수국 명소": ["카멜리아힐", "여름 여행", "개화 시기", "포토존", "혼저옵서예"],
      "장마 대비 제습기 추천": ["위닉스", "습도 조절", "소음 비교", "에너지 효율", "제습 용량"],
      "K-콘텐츠 세제 혜택": ["문체부", "영상 산업", "세액 공제", "K-뷰티", "OTT 지원"],
      "AI 반도체 엔비디아 주가": ["NVIDIA", "젠슨 황", "H100", "나스닥", "삼성전자"],
      "글루타치온 효과 분석": ["항산화제", "피부 미백", "글루타치온 필름", "밀크씨슬", "하루 권장량"],
      "다이어트 유산균 추천": ["락토바실러스", "비에날씬", "프로바이오틱스", "장건강", "뚱보균"],
      "아파트 취득세 계산기": ["부동산 대책", "세율 인하", "생애 최초", "양도세", "다주택자"],
      "여름 휴가 추천 해외여행지": ["다낭", "방콕", "가성비 휴양지", "LCC 항공권", "엔저 여행"],
      "소상공인 재난지원 대출": ["중소벤처기업부", "저금리 대출", "보증 지원", "신용보증재단", "이자 감면"],
      "선크림 백탁현상 없는 제품": ["무기자차", "유기자차", "SPF 50+", "피부 저자극", "가성비 선크림"],
      "초당옥수수 찌는법": ["옥수수 보관법", "전자레인지", "초당 단맛", "칼로리", "여름 제철"],
      "종합소득세 신고 기한": ["홈택스", "소득 공제", "환급금 조회", "세무 대리", "5월 신고"],
      "에어컨 전기세 절약 방법": ["인버터 에어컨", "제습 모드", "실외기 관리", "하루 요금", "서큘레이터"],
      "PubMed 바이오 마커 논문": ["바이오마커", "암 조기진단", "유전체 분석", "임상 연구", "구글 스콜라"],
      "GLP-1 비만치료제 임상 결과": ["삭센다", "위고비", "젭바운드", "일라이 릴리", "노보 노디스크"],
      "GPT-4o API 요금 비교": ["OpenAI", "토큰 비용", "컨텍스트 윈도우", "API 연동", "레이트 리밋"],
      "알츠하이머 백신 임상 3상": ["아두카누맙", "레카네맙", "치매 신약", "뇌세포 복구", "FDA 승인"],
      "AI 기반 신약 개발 플랫폼": ["단백질 구조", "알파폴드", "컴퓨터 신약 설계", "바이오 벤처", "AI 스크리닝"],
      "Apple Vision Pro 2 출시 루머": ["공간 컴퓨팅", "비전 OS", "마이크로 OLED", "WWDC", "가성비 비전"],
      "Generative AI in Healthcare": ["의료 AI", "환자 차트 요약", "디지털 헬스", "의료 프라이버시", "FDA 가이드라인"],
      "CRISPR 유전자 가위 암 치료": ["유전자 교정", "카티(CAR-T)", "희귀질환 치료", "Cas9", "바이오 에디팅"],
      "Midjourney v6 프롬프트 가이드": ["이미지 생성 AI", "v6 파라미터", "시네마틱 프롬프트", "가변 에셋", "AI 디자인"],
      "마이크로바이옴 신약 승인": ["장내 미생물", "분변이식(FMT)", "면역 조절", "세라에스", "바이오 제약"],
      "Stable Diffusion 3.0 세팅": ["SD3 로컬설치", "ComfyUI", "체크포인트", "Lora 학습", "VRAM 최소요구"],
      "스마트워치 심전도 정밀도": ["부정맥 감지", "애플워치 ECG", "갤럭시워치 혈압", "의료기기 인증", "웨어러블"],
      "메타버스 디지털 치료제(DTx)": ["인지행동치료", "ADHD 치료제", "디지털 약약", "식약처 가이드", "DTx 가동"],
      "나스닥 바이오테크 ETF 추천": ["IBB ETF", "XBI ETF", "바이오 벤처 투자", "금리 인하 수혜", "글로벌 제약사"],
      "노령연금 수급자격 기준": ["기초연금", "소득인정액 계산", "단독가구", "부부 가구", "감액 연금"],
      "임영웅 콘서트 서울 예매": ["인터파크 티켓", "티케팅 꿀팁", "대기 순번", "상암 월드컵", "효도 티켓"],
      "근로장려금 지급일 조회": ["정기 지급", "반기 지급", "가구원 자격", "소득 요건", "국세청 환급"],
      "주말 전국 날씨 및 장마전선": ["기상청 예보", "강수량", "태풍 경로", "침수 피해 예방", "우산 추천"],
      "디지털 배움터 신청방법": ["무료 정보화 교육", "스마트폰 사용법", "에듀버스", "키오스크 실습", "NIA"],
      "종합소득세 신고 기한 연장": ["신고 유예", "재난 지역 세정지원", "가산세 감면", "홈택스 신청", "종소세"],
      "국민연금 개혁안 비교": ["모수개혁", "구조개혁", "보험료율 인상", "소득대체율", "연금 고갈 시기"],
      "지역사랑상품권 특별할인": ["온누리 상품권", "지역 화폐", "10% 할인", "구매 한도", "사용처 찾기"],
      "햇살론 유스 대출 한도": ["서민금융진흥원", "대학생 대출", "금리 3.5%", "보증서 발급", "상환 기간"],
      "전세사기 특별법 개정안": ["피해 지원", "선구제 후회수", "LH 임대", "보증금 반환", "피해자 요건"],
      "고향사랑기부제 답례품 추천": ["세액 공제 10만원", "지역 특산물", "기부 포인트", "위기 지역 지원", "고향사랑e음"],
      "지방 자치 교육 바우처": ["방과후 학교", "학습 보조금", "바우처 카드", "신청 자격", "지자체 교육"]
    };

    let related = relatedWordsPool[keyword];
    if (!related) {
      const foundKey = Object.keys(relatedWordsPool).find(k => keyword.includes(k) || k.includes(keyword));
      if (foundKey) {
        related = relatedWordsPool[foundKey];
      } else {
        related = [
          `${keyword} 추천`,
          `${keyword} 분석`,
          `${keyword} 트렌드`,
          `${keyword} 관련주`,
          `${keyword} 사용법`
        ];
      }
    }

    const maxFreq = 80 + (seedVal % 18);
    const freqBars = related.map((word, idx) => {
      const val = Math.round(maxFreq * Math.pow(0.82, idx));
      return { word, val };
    });

    if (newsFrequencyBarsContainer) {
      newsFrequencyBarsContainer.innerHTML = freqBars.map(fb => `
        <div class="news-freq-bar-item">
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:2px;">
            <span>${fb.word}</span>
            <span style="font-weight:700; color:var(--color-secondary);">${fb.val}%</span>
          </div>
          <div style="width:100%; height:6px; background:rgba(255,255,255,0.05); border-radius:3px; overflow:hidden;">
            <div class="news-freq-progress-fill" style="width:${fb.val}%; height:100%; background:linear-gradient(90deg, var(--color-primary), var(--color-secondary)); border-radius:3px;"></div>
          </div>
        </div>
      `).join("");
    }

    const headlinesPool = {
      "Claude 3.5 Sonnet 출시": [
        "앤트로픽, '클로드 3.5 소네트' 전격 공개... GPT-4o 압도하는 코딩 속도",
        "IT 업계 '클로드 3.5' 극찬 릴레이, 생성형 AI 시장 지각변동 예고",
        "무료 사용자도 사용 가능! 클로드 3.5 아티팩트 기능 활용법 총정리"
      ],
      "제주도 수국 명소": [
        "올여름 인생샷 명소는 여기! 제주도 서귀포 수국 축제 현장 스케치",
        "수국 꽃길 걸어볼까... 6월 제주도 꼭 가봐야 할 수국 명소 TOP 5",
        "제주도 장마 시기와 겹친 수국 개화... 관광객 발길 이어져"
      ],
      "장마 대비 제습기 추천": [
        "여름철 눅눅함 잡는다... 소비자 평점 높은 가성비 제습기 추천 리스트",
        "위닉스 vs LG 제습기, 성능 및 전기요금 직접 비교해보니",
        "장마철 올바른 제습기 위치 선정과 필터 청소 꿀팁"
      ]
    };

    let headlines = headlinesPool[keyword];
    if (!headlines) {
      const foundKey = Object.keys(headlinesPool).find(k => keyword.includes(k) || k.includes(keyword));
      if (foundKey) {
        headlines = headlinesPool[foundKey];
      } else {
        headlines = [
          `'${keyword}' 실시간 검색량 급상승... 대중적 관심 집중되는 이유`,
          `업계 관계자가 말하는 '${keyword}' 시장 트렌드와 향후 전망`,
          `소비자 만족도 1위 달성한 '${keyword}' 관련 주요 제품 분석`
        ];
      }
    }

    if (newsHeadlinesList) {
      newsHeadlinesList.innerHTML = headlines.map(h => `
        <li style="margin-bottom: 6px; list-style-type: disc; line-height: 1.4;">
          <a href="https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(keyword)}" target="_blank" style="color:var(--text-secondary); text-decoration:none; transition: color 0.2s;" onmouseover="this.style.color='var(--color-secondary)'" onmouseout="this.style.color='var(--text-secondary)'">
            ${h}
          </a>
        </li>
      `).join("");
    }
  }

  function renderTrendTab() {
    // 1. Rising keywords table
    const period = trendPeriodSelect.value;
    const list = risingKeywords[currentSource][period];
    risingKeywordsTbody.innerHTML = "";
    
    list.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><span class="rank-badge ${item.rank <= 3 ? 'rank-top3' : 'rank-other'}">${item.rank}</span></td>
        <td><strong class="clickable-keyword" style="cursor:pointer; color:var(--color-secondary);">${item.keyword}</strong></td>
        <td><span class="trend-up"><i class="fa-solid fa-arrow-trend-up"></i> ${item.growth}</span></td>
        <td><span class="badge-tag" style="background-color:rgba(255,255,255,0.05); color:var(--text-secondary);">${item.category}</span></td>
        <td style="text-align: right; display:flex; gap:6px; justify-content:flex-end;">
          <button class="action-btn btn-analyze-deep" data-keyword="${item.keyword}" style="padding: 4px 8px; font-size:10px;" title="심층 키워드 검색 분석 패널로 이동합니다."><i class="fa-solid fa-magnifying-glass-chart"></i> 상세분석</button>
          <a href="${item.news}" target="_blank" class="action-btn" style="padding: 4px 8px; font-size:10px;"><i class="fa-solid fa-newspaper"></i> 뉴스</a>
          <button class="action-btn btn-add-cal" data-keyword="${item.keyword}" style="padding: 4px 8px; font-size:10px;"><i class="fa-solid fa-calendar-plus"></i> 캘린더</button>
        </td>
      `;
      
      // Bind click on keyword to auto-analyze news
      tr.querySelector(".clickable-keyword").addEventListener("click", () => {
        analyzeNewsContext(item.keyword);
        playChime('click');
        showToast(`"${item.keyword}" 뉴스 분석을 시작합니다.`);
      });
      
      // Bind detailed analysis switch
      tr.querySelector(".btn-analyze-deep").addEventListener("click", () => {
        analyzeKeyword(item.keyword);
      });
      
      // Bind calendar add
      tr.querySelector(".btn-add-cal").addEventListener("click", () => {
        addKeywordToCalendar(item.keyword);
      });

      risingKeywordsTbody.appendChild(tr);
    });

    // 2. Word Cloud
    wordCloudContainer.innerHTML = "";
    const cloudList = wordCloudKeywords[currentSource] || [];
    cloudList.forEach(tag => {
      const span = document.createElement("span");
      span.className = "word-cloud-tag";
      span.style.fontSize = tag.size;
      span.style.color = tag.color;
      span.style.fontWeight = tag.weight;
      span.textContent = tag.text;
      
      span.addEventListener("click", () => {
        analyzeNewsContext(tag.text);
        playChime('click');
        showToast(`"${tag.text}" 뉴스 분석을 시작합니다.`);
      });
      
      wordCloudContainer.appendChild(span);
    });

    // 3. Newly Emerged
    newlyEmergedContainer.innerHTML = "";
    const emergedList = newlyEmergedKeywords[currentSource] || [];
    emergedList.forEach(group => {
      const div = document.createElement("div");
      div.className = "date-group";
      
      let itemsHtml = "";
      group.items.forEach(item => {
        itemsHtml += `
          <div class="emerged-card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong class="clickable-keyword" style="cursor:pointer; color:var(--color-secondary); font-size:14px;">${item.name}</strong>
              <span style="font-size:11px; color:var(--text-muted);">초기수요: ${item.search}</span>
            </div>
            <div style="font-size:12px; color:var(--text-secondary); display:flex; gap:6px; align-items:center;">
              <span class="badge-tag" style="background-color:rgba(56,189,248,0.1); color:#38bdf8;">${item.category}</span>
              <span>${item.advice}</span>
            </div>
            <div style="display:flex; gap:6px; justify-content:flex-end; margin-top:4px;">
              <button class="action-btn btn-analyze-deep" data-keyword="${item.name}" style="padding: 2px 6px; font-size:9px;" title="심층 키워드 검색 분석 패널로 이동합니다."><i class="fa-solid fa-magnifying-glass-chart"></i> 상세분석</button>
              <button class="action-btn btn-add-cal" data-keyword="${item.name}" style="padding: 2px 6px; font-size:9px;"><i class="fa-solid fa-calendar-plus"></i> 일정 추가</button>
            </div>
          </div>
        `;
      });
      
      div.innerHTML = `
        <div class="date-group-header">${group.date}</div>
        <div class="emerged-grid">${itemsHtml}</div>
      `;
      
      div.querySelectorAll(".clickable-keyword").forEach(el => {
        el.addEventListener("click", (e) => {
          const kw = e.target.textContent;
          analyzeNewsContext(kw);
          playChime('click');
          showToast(`"${kw}" 뉴스 분석을 시작합니다.`);
        });
      });

      div.querySelectorAll(".btn-analyze-deep").forEach(el => {
        el.addEventListener("click", (e) => {
          const kw = e.target.closest(".btn-analyze-deep").dataset.keyword;
          analyzeKeyword(kw);
        });
      });

      div.querySelectorAll(".btn-add-cal").forEach(el => {
        el.addEventListener("click", (e) => {
          const kw = e.target.closest(".btn-add-cal").dataset.keyword;
          addKeywordToCalendar(kw);
        });
      });

      newlyEmergedContainer.appendChild(div);
    });

    // 4. AI report
    const report = aiTrendReport[currentSource];
    aiInsightReportContainer.innerHTML = `
      <div style="font-size: 13.5px; line-height: 1.6; color: var(--text-secondary); margin-bottom: 12px;">
        ${report.summary}
      </div>
      <div style="margin-top: 8px;">
        <span style="font-size: 12px; font-weight: 700; color: var(--color-primary); display:block; margin-bottom: 6px;">[추천 마케팅 앵글 제안]</span>
        <ul style="font-size: 13px; list-style-type:square; padding-left: 20px; color:var(--text-main); display:flex; flex-direction:column; gap:6px;">
          ${report.angles.map(a => `<li><strong>${a.theme}</strong>: ${a.angle}</li>`).join("")}
        </ul>
      </div>
    `;
  }

  trendPeriodSelect.addEventListener("change", renderTrendTab);

  // Bind source tabs
  document.querySelectorAll(".source-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentSource = btn.dataset.source;
      document.querySelectorAll(".source-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      saveState();
      renderTrendTab();
      playChime('click');
      
      const firstKeyword = risingKeywords[currentSource].daily[0]?.keyword;
      if (firstKeyword) {
        analyzeNewsContext(firstKeyword);
      }
    });
  });

  // Bind trend re-analyze button
  if (btnReanalyzeTrends) {
    btnReanalyzeTrends.addEventListener("click", () => {
      playChime('click');
      statusOverlay.classList.add("active");
      statusMessage.textContent = "네이버/구글 API로부터 현재 트렌드 데이터 및 지수를 실시간 재수집하고 분석합니다...";

      setTimeout(() => {
        // Wiggle function for growth percentages
        const wiggleGrowth = (growthStr) => {
          const num = parseInt(growthStr.replace(/[^0-9]/g, ''), 10);
          const change = Math.floor(Math.random() * 41) - 20; // -20% to +20%
          const wiggled = Math.max(50, num + change);
          return `+${wiggled}%`;
        };

        // Wiggle and swap for all sources
        Object.keys(risingKeywords).forEach(src => {
          // Daily
          risingKeywords[src].daily.forEach(item => {
            item.growth = wiggleGrowth(item.growth);
          });
          
          // Monthly
          risingKeywords[src].monthly.forEach(item => {
            item.growth = wiggleGrowth(item.growth);
          });

          // Dynamic keyword swap from pool (1-2 keywords)
          const pool = secondaryKeywordPool[src];
          if (pool && pool.length > 0) {
            // Swap in daily list
            const swapCount = Math.floor(Math.random() * 2) + 1; // 1 or 2 keywords
            for (let k = 0; k < swapCount; k++) {
              const poolIdx = Math.floor(Math.random() * pool.length);
              const poolItem = pool[poolIdx];
              
              // Check if poolItem is already in daily list
              const alreadyExists = risingKeywords[src].daily.some(item => item.keyword === poolItem.keyword);
              if (!alreadyExists) {
                // Replace a random item from rank 4-8
                const replaceIdx = Math.floor(Math.random() * 5) + 3; // index 3 to 7 (rank 4 to 8)
                const replacedItem = risingKeywords[src].daily[replaceIdx];
                if (replacedItem) {
                  // Swap them
                  const originalKeyword = replacedItem.keyword;
                  const originalNews = replacedItem.news;
                  const originalCategory = replacedItem.category;
                  
                  replacedItem.keyword = poolItem.keyword;
                  replacedItem.news = poolItem.news;
                  replacedItem.category = poolItem.category;
                  replacedItem.growth = `+${Math.floor(Math.random() * 150) + 100}%`;
                  
                  // Put replaced back into pool
                  pool[poolIdx] = {
                    keyword: originalKeyword,
                    category: originalCategory,
                    news: originalNews
                  };
                }
              }
            }
          }

          // Randomize ordering slightly
          risingKeywords[src].daily.sort(() => Math.random() - 0.5);
          risingKeywords[src].daily.forEach((item, idx) => {
            item.rank = idx + 1;
          });

          risingKeywords[src].monthly.sort(() => Math.random() - 0.5);
          risingKeywords[src].monthly.forEach((item, idx) => {
            item.rank = idx + 1;
          });
        });

        // Wiggle word cloud keywords
        const colors = ["var(--color-primary)", "var(--color-secondary)", "#bae6fd", "var(--color-warning)", "var(--color-success)", "#e9d5ff", "#fca5a5"];
        Object.keys(wordCloudKeywords).forEach(src => {
          wordCloudKeywords[src].forEach(tag => {
            const sizeNum = parseInt(tag.size, 10);
            const change = Math.floor(Math.random() * 5) - 2; // -2px to +2px
            tag.size = `${Math.min(30, Math.max(12, sizeNum + change))}px`;
            tag.color = colors[Math.floor(Math.random() * colors.length)];
          });
          wordCloudKeywords[src].sort(() => Math.random() - 0.5);
        });

        // Wiggle newly emerged keywords search volume
        Object.keys(newlyEmergedKeywords).forEach(src => {
          newlyEmergedKeywords[src].forEach(group => {
            group.items.forEach(item => {
              const searchNum = parseInt(item.search.replace(/[^0-9]/g, ''), 10);
              const change = Math.floor(Math.random() * 500) - 250;
              item.search = `${Math.max(500, searchNum + change).toLocaleString()}회`;
            });
          });
        });

        // Re-render Trend Panel
        renderTrendTab();

        // Re-analyze news context for active portal's top daily keyword
        const topKeyword = risingKeywords[currentSource].daily[0]?.keyword || currentNewsKeyword;
        analyzeNewsContext(topKeyword);

        statusOverlay.classList.remove("active");
        playChime('success');
        showToast("트렌드 데이터 실시간 재분석 및 갱신이 완료되었습니다.");
      }, 1500);
    });
  }

  // --- Tab 2: Seasonal Keywords & Content Calendar ---
  const seasonalKeywords = {
    "6": {
      all: [
        { keyword: "초당옥수수 찌는법", search: 45000, factor: "6.5x", peak: "6월 10일 - 20일", industry: "shopping" },
        { keyword: "제주도 수국 개화시기", search: 32000, factor: "4.8x", peak: "6월 15일 - 25일", industry: "travel" },
        { keyword: "종합소득세 신고 해명", search: 18000, factor: "2.3x", peak: "6월 1일 - 10일", industry: "finance" },
        { keyword: "여름 샌들/크록스 추천", search: 28000, factor: "3.2x", peak: "6월 20일 - 30일", industry: "shopping" }
      ],
      travel: [
        { keyword: "제주도 수국 개화시기", search: 32000, factor: "4.8x", peak: "6월 15일 - 25일", industry: "travel" }
      ],
      edu: [],
      shopping: [
        { keyword: "초당옥수수 찌는법", search: 45000, factor: "6.5x", peak: "6월 10일 - 20일", industry: "shopping" },
        { keyword: "여름 샌들/크록스 추천", search: 28000, factor: "3.2x", peak: "6월 20일 - 30일", industry: "shopping" }
      ],
      beauty: [],
      finance: [
        { keyword: "종합소득세 신고 해명", search: 18000, factor: "2.3x", peak: "6월 1일 - 10일", industry: "finance" }
      ]
    },
    "7": {
      all: [
        { keyword: "가평 빠지 펜션 추천", search: 75000, factor: "8.2x", peak: "7월 15일 - 30일", industry: "travel" },
        { keyword: "여름방학 초등 수학 예습", search: 31000, factor: "3.5x", peak: "7월 20일 - 8월 5일", industry: "edu" },
        { keyword: "에어컨 청소업체 비용", search: 42000, factor: "4.0x", peak: "7월 5일 - 15일", industry: "shopping" },
        { keyword: "휴가지 물놀이 메이크업", search: 19000, factor: "3.0x", peak: "7월 25일 - 31일", industry: "beauty" }
      ],
      travel: [
        { keyword: "가평 빠지 펜션 추천", search: 75000, factor: "8.2x", peak: "7월 15일 - 30일", industry: "travel" }
      ],
      edu: [
        { keyword: "여름방학 초등 수학 예습", search: 31000, factor: "3.5x", peak: "7월 20일 - 8월 5일", industry: "edu" }
      ],
      shopping: [
        { keyword: "에어컨 청소업체 비용", search: 42000, factor: "4.0x", peak: "7월 5일 - 15일", industry: "shopping" }
      ],
      beauty: [
        { keyword: "휴가지 물놀이 메이크업", search: 19000, factor: "3.0x", peak: "7월 25일 - 31일", industry: "beauty" }
      ],
      finance: []
    },
    "8": {
      all: [
        { keyword: "계곡 근처 오토캠핑장", search: 58000, factor: "5.4x", peak: "8월 1일 - 15일", industry: "travel" },
        { keyword: "여름 네일아트 디자인", search: 29000, factor: "2.8x", peak: "8월 5일 - 15일", industry: "beauty" },
        { keyword: "가을 신학기 백팩 할인", search: 21000, factor: "3.1x", peak: "8월 20일 - 30일", industry: "shopping" },
        { keyword: "연차 세무 정산 시기", search: 11000, factor: "1.8x", peak: "8월 25일 - 31일", industry: "finance" }
      ],
      travel: [
        { keyword: "계곡 근처 오토캠핑장", search: 58000, factor: "5.4x", peak: "8월 1일 - 15일", industry: "travel" }
      ],
      edu: [],
      shopping: [
        { keyword: "가을 신학기 백팩 할인", search: 21000, factor: "3.1x", peak: "8월 20일 - 30일", industry: "shopping" }
      ],
      beauty: [
        { keyword: "여름 네일아트 디자인", search: 29000, factor: "2.8x", peak: "8월 5일 - 15일", industry: "beauty" }
      ],
      finance: [
        { keyword: "연차 세무 정산 시기", search: 11000, factor: "1.8x", peak: "8월 25일 - 31일", industry: "finance" }
      ]
    },
    "9": {
      all: [
        { keyword: "추석 선물세트 단체 주문", search: 95000, factor: "12.0x", peak: "9월 10일 - 22일", industry: "shopping" },
        { keyword: "설악산 단풍 예상 시기", search: 39000, factor: "6.0x", peak: "9월 20일 - 30일", industry: "travel" },
        { keyword: "환절기 가습기 세척법", search: 24000, factor: "3.2x", peak: "9월 15일 - 25일", industry: "shopping" },
        { keyword: "가을 자켓 아우터 코디", search: 43000, factor: "4.5x", peak: "9월 15일 - 30일", industry: "beauty" }
      ],
      travel: [
        { keyword: "설악산 단풍 예상 시기", search: 39000, factor: "6.0x", peak: "9월 20일 - 30일", industry: "travel" }
      ],
      edu: [],
      shopping: [
        { keyword: "추석 선물세트 단체 주문", search: 95000, factor: "12.0x", peak: "9월 10일 - 22일", industry: "shopping" },
        { keyword: "환절기 가습기 세척법", search: 24000, factor: "3.2x", peak: "9월 15일 - 25일", industry: "shopping" }
      ],
      beauty: [
        { keyword: "가을 자켓 아우터 코디", search: 43000, factor: "4.5x", peak: "9월 15일 - 30일", industry: "beauty" }
      ],
      finance: []
    }
  };

  const seasonMonthSelect = document.getElementById("season-month-select");
  const seasonIndustrySelect = document.getElementById("season-industry-select");
  const seasonalKeywordsTbody = document.getElementById("seasonal-keywords-tbody");
  
  const calendarTitleLabel = document.getElementById("calendar-title-label");
  const calendarDaysGrid = document.getElementById("calendar-days-grid");

  function renderSeasonalTab() {
    const month = seasonMonthSelect.value;
    const ind = seasonIndustrySelect.value;
    
    // Fill fallback if month or category empty
    const rawList = (seasonalKeywords[month] && seasonalKeywords[month][ind]) ? seasonalKeywords[month][ind] : [];
    
    seasonalKeywordsTbody.innerHTML = "";
    if (rawList.length === 0) {
      seasonalKeywordsTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">해당 월 및 카테고리에 조건이 일치하는 시즌 키워드가 없습니다.</td></tr>`;
    } else {
      rawList.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong class="clickable-keyword" style="cursor:pointer; color:var(--color-secondary);">${item.keyword}</strong></td>
          <td>${item.search.toLocaleString("ko-KR")}회</td>
          <td><span style="color:var(--color-primary); font-weight:600;">${item.factor}</span></td>
          <td>${item.peak}</td>
          <td style="text-align: right;">
            <button class="action-btn btn-add-cal" style="padding: 4px 8px; font-size:11px;"><i class="fa-solid fa-calendar-plus"></i> 일정 추가</button>
          </td>
        `;
        
        tr.querySelector(".clickable-keyword").addEventListener("click", () => {
          analyzeKeyword(item.keyword);
        });

        tr.querySelector(".btn-add-cal").addEventListener("click", () => {
          addKeywordToCalendar(item.keyword);
        });

        seasonalKeywordsTbody.appendChild(tr);
      });
    }

    renderCalendar(parseInt(month, 10));
  }

  seasonMonthSelect.addEventListener("change", renderSeasonalTab);
  seasonIndustrySelect.addEventListener("change", renderSeasonalTab);

  // --- Publishing Calendar logic ---
  function renderCalendar(monthNum) {
    const year = 2026;
    calendarTitleLabel.textContent = `${year}년 ${monthNum}월`;
    calendarDaysGrid.innerHTML = "";

    // Day of week headers
    const daysName = ["일", "월", "화", "수", "목", "금", "토"];
    daysName.forEach(d => {
      const header = document.createElement("div");
      header.className = "calendar-day-header";
      header.textContent = d;
      calendarDaysGrid.appendChild(header);
    });

    // Get first day of the month and total days
    const firstDayIndex = new Date(year, monthNum - 1, 1).getDay();
    const totalDays = new Date(year, monthNum, 0).getDate();

    // Pad before first day
    for (let i = 0; i < firstDayIndex; i++) {
      const pad = document.createElement("div");
      pad.className = "calendar-cell calendar-cell-other-month";
      pad.innerHTML = `<span></span>`;
      calendarDaysGrid.appendChild(pad);
    }

    // Render calendar day cells
    for (let day = 1; day <= totalDays; day++) {
      const cell = document.createElement("div");
      cell.className = "calendar-cell calendar-cell-active";
      
      const dayEvents = calendarEvents.filter(ev => ev.day === day && ev.month === monthNum && ev.year === year);
      
      let eventsHtml = "";
      dayEvents.forEach((ev, idx) => {
        eventsHtml += `
          <div class="calendar-event" title="${ev.keyword} (더블클릭시 삭제)" data-idx="${idx}">
            ${ev.keyword}
          </div>
        `;
      });

      cell.innerHTML = `
        <span class="calendar-day-num">${day}</span>
        <div class="calendar-events-container">${eventsHtml}</div>
      `;

      // Double-click event to remove
      cell.querySelectorAll(".calendar-event").forEach(el => {
        el.addEventListener("dblclick", (e) => {
          e.stopPropagation();
          const txt = e.target.textContent.trim();
          calendarEvents = calendarEvents.filter(ev => !(ev.day === day && ev.month === monthNum && ev.year === year && ev.keyword === txt));
          saveState();
          renderCalendar(monthNum);
          playChime('warn');
          showToast(`일정에서 "${txt}" 삭제되었습니다.`);
        });
      });

      calendarDaysGrid.appendChild(cell);
    }
  }

  function addKeywordToCalendar(keyword) {
    const month = parseInt(seasonMonthSelect.value, 10);
    const year = 2026;
    
    // Auto-pick a date: pick a random day between 5 and 25
    const day = Math.floor(Math.random() * 20) + 5;
    
    // Avoid exact duplicate on same day
    const exists = calendarEvents.some(ev => ev.day === day && ev.month === month && ev.year === year && ev.keyword === keyword);
    if (!exists) {
      calendarEvents.push({ day, month, year, keyword });
      saveState();
      renderCalendar(month);
      playChime('success');
      showToast(`일정 추가 완료: 6월 ${day}일 - "${keyword}"`);
    } else {
      playChime('warn');
      showToast("이미 해당 날짜에 동일한 일정이 배정되어 있습니다.");
    }
  }

  // --- Tab 3: Keyword Expansion & Recommendation ---
  const expansionSeedsText = document.getElementById("expansion-seeds");
  const expansionIncludeInput = document.getElementById("expansion-include");
  const expansionExcludeInput = document.getElementById("expansion-exclude");
  const btnRunExpansion = document.getElementById("btn-run-expansion");

  const filterMinSearchInput = document.getElementById("filter-min-search");
  const filterMaxPostsInput = document.getElementById("filter-max-posts");
  const filterGenderRatioInput = document.getElementById("filter-gender-ratio");
  const filterSeasonIdxInput = document.getElementById("filter-season-idx");
  const filterCommercialIdxInput = document.getElementById("filter-commercial-idx");
  const filterRecCategorySelect = document.getElementById("filter-rec-category");
  
  const labelMinSearch = document.getElementById("label-min-search");
  const labelMaxPosts = document.getElementById("label-max-posts");
  const labelGenderRatio = document.getElementById("label-gender-ratio");
  const labelSeasonIdx = document.getElementById("label-season-idx");
  const labelCommercialIdx = document.getElementById("label-commercial-idx");

  const filterSetNameInput = document.getElementById("filter-set-name");
  const btnSaveFilterSet = document.getElementById("btn-save-filter-set");
  const savedFiltersList = document.getElementById("saved-filters-list");
  
  const btnRunRecommendation = document.getElementById("btn-run-recommendation");
  const recResultsSection = document.getElementById("rec-results-section");
  const discoveryResultsTbody = document.getElementById("discovery-results-tbody");

  // Synchronize range sliders labels
  filterMinSearchInput.addEventListener("input", () => {
    labelMinSearch.textContent = parseInt(filterMinSearchInput.value).toLocaleString("ko-KR");
  });
  filterMaxPostsInput.addEventListener("input", () => {
    labelMaxPosts.textContent = parseInt(filterMaxPostsInput.value).toLocaleString("ko-KR");
  });
  filterGenderRatioInput.addEventListener("input", () => {
    labelGenderRatio.textContent = `여성 ${filterGenderRatioInput.value}% / 남성 ${100 - parseInt(filterGenderRatioInput.value)}%`;
  });
  filterSeasonIdxInput.addEventListener("input", () => {
    labelSeasonIdx.textContent = filterSeasonIdxInput.value;
  });
  filterCommercialIdxInput.addEventListener("input", () => {
    labelCommercialIdx.textContent = filterCommercialIdxInput.value;
  });

  // Save/Load Filter Sets
  btnSaveFilterSet.addEventListener("click", () => {
    const name = filterSetNameInput.value.trim();
    if (!name) {
      playChime('warn');
      alert("리서치 조건의 이름을 입력해 주세요.");
      return;
    }

    const newFilterSet = {
      id: Date.now(),
      name,
      minSearch: filterMinSearchInput.value,
      maxPosts: filterMaxPostsInput.value,
      gender: filterGenderRatioInput.value,
      season: filterSeasonIdxInput.value,
      comm: filterCommercialIdxInput.value,
      category: filterRecCategorySelect.value
    };

    savedFilters.push(newFilterSet);
    saveState();
    renderSavedFilters();
    filterSetNameInput.value = "";
    playChime('success');
    showToast(`리서치 조건 "${name}" 저장되었습니다!`);
  });

  function renderSavedFilters() {
    savedFiltersList.innerHTML = "";
    savedFilters.forEach(set => {
      const btn = document.createElement("button");
      btn.className = "action-btn";
      btn.style.color = "var(--color-primary)";
      btn.style.borderColor = "var(--color-primary)";
      btn.innerHTML = `<i class="fa-solid fa-folder-open"></i> ${set.name} <span class="delete-filter" data-id="${set.id}" style="margin-left:6px; opacity:0.6; cursor:pointer;">&times;</span>`;
      
      // Load saved values on click
      btn.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-filter")) {
          e.stopPropagation();
          const id = parseInt(e.target.dataset.id);
          savedFilters = savedFilters.filter(f => f.id !== id);
          saveState();
          renderSavedFilters();
          playChime('warn');
          return;
        }

        filterMinSearchInput.value = set.minSearch;
        filterMaxPostsInput.value = set.maxPosts;
        filterGenderRatioInput.value = set.gender;
        filterSeasonIdxInput.value = set.season;
        filterCommercialIdxInput.value = set.comm;
        filterRecCategorySelect.value = set.category;
        
        // Trigger event inputs manually to sync labels
        filterMinSearchInput.dispatchEvent(new Event("input"));
        filterMaxPostsInput.dispatchEvent(new Event("input"));
        filterGenderRatioInput.dispatchEvent(new Event("input"));
        filterSeasonIdxInput.dispatchEvent(new Event("input"));
        filterCommercialIdxInput.dispatchEvent(new Event("input"));
        
        playChime('success');
        showToast(`조건 필터 [${set.name}]를 로드했습니다.`);
      });

      savedFiltersList.appendChild(btn);
    });
  }

  // Deduct Kiwi credit helper
  function trySpendKiwi(amount) {
    if (kiwiCredits < amount) {
      playChime('warn');
      alert(`⚠️ 크레딧 부족! 추천 서비스 가동을 위해 최소 ${amount} KIWI가 필요합니다. 상단의 KIWI 위젯을 클릭해 무료 충전할 수 있습니다.`);
      return false;
    }
    kiwiCredits -= amount;
    saveState();
    updateKiwiDisplay();
    return true;
  }

  // Keyword expansion simulation
  btnRunExpansion.addEventListener("click", () => {
    const seeds = expansionSeedsText.value.trim();
    if (!seeds) {
      playChime('warn');
      alert("하나 이상의 시드 키워드를 입력해 주세요.");
      return;
    }

    if (!trySpendKiwi(5)) return;

    statusOverlay.classList.add("active");
    statusMessage.textContent = `시드 키워드 분석 및 연관어 색인 확장 중... (5 KIWI 차감)`;

    setTimeout(() => {
      statusOverlay.classList.remove("active");
      playChime('success');
      
      const seedList = seeds.split("\n").map(s => s.trim()).filter(Boolean);
      const includeFilter = expansionIncludeInput.value.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
      const excludeFilter = expansionExcludeInput.value.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
      
      // Simulation database of related words
      const simulationRelatedPool = {
        "인공지능": ["AI 활용", "AI 트렌드", "인공지능 코딩", "AI 그림 사이트", "인공지능 대학원", "AI 번역기", "인공지능 비즈니스", "생성형 AI 기술"],
        "메타버스": ["메타버스 플랫폼", "제페토 메타버스", "메타버스 주식", "VR 기기", "메타버스 교육", "NFT 메타버스", "로블록스 활용", "메타버스 사례"]
      };

      let results = [];
      seedList.forEach(seed => {
        const pool = simulationRelatedPool[seed] || [
          `${seed} 추천`, `${seed} 분석`, `${seed} 툴`, `${seed} 가이드`, `${seed} 주가`, `${seed} 관련주`, `${seed} 전망`, `${seed} 가격`
        ];

        pool.forEach(k => {
          // Check filters
          const lowerK = k.toLowerCase();
          const matchesInclude = includeFilter.length === 0 || includeFilter.some(inc => lowerK.includes(inc));
          const matchesExclude = excludeFilter.some(exc => lowerK.includes(exc));

          if (matchesInclude && !matchesExclude) {
            // Generate pseudo-random metrics
            const searches = generateHashValue(k, 300, 35000);
            const posts = generateHashValue(k, 100, 45000);
            const satIndex = (posts / searches).toFixed(2);
            const femaleRatio = generateHashValue(k, 20, 80);
            const mainAge = generateAgeTarget(k);
            const seasonIdx = generateHashValue(k, 10, 95);
            const commIdx = generateHashValue(k, 10, 95);

            results.push({ keyword: k, searches, posts, satIndex, femaleRatio, mainAge, seasonIdx, commIdx });
          }
        });
      });

      renderDiscoveryResults(results);
    }, 1500);
  });

  // Keyword Recommendation Simulation
  btnRunRecommendation.addEventListener("click", () => {
    if (!trySpendKiwi(5)) return;

    statusOverlay.classList.add("active");
    statusMessage.textContent = `다차원 필터링에 부합하는 급성장 유망 키워드 연산 중... (5 KIWI 차감)`;

    setTimeout(() => {
      statusOverlay.classList.remove("active");
      playChime('success');

      // Recommended keywords pool
      const pool = [
        { keyword: "AI 코딩 비서 Claude Code", searches: 8200, posts: 4200, category: "tech", gender: 25, age: "20대-30대", season: 15, comm: 65 },
        { keyword: "초보자 캠핑 용품 타프 세트", searches: 24000, posts: 48000, category: "living", gender: 45, age: "30대-40대", season: 85, comm: 75 },
        { keyword: "직장인 주택 담보 금리 대조", searches: 12000, posts: 8400, category: "finance", gender: 50, age: "30대-40대", season: 20, comm: 80 },
        { keyword: "친환경 고체 삼푸 바 내돈내산", searches: 4500, posts: 3100, category: "beauty", gender: 80, age: "20대-30대", season: 35, comm: 90 },
        { keyword: "대학생 방학 대외활동 공모전", searches: 15000, posts: 12000, category: "tech", gender: 60, age: "10대-20대", season: 65, comm: 30 },
        { keyword: "여름 린넨 자켓 출근룩", searches: 32000, posts: 64000, category: "beauty", gender: 85, age: "20대-30대", season: 90, comm: 85 },
        { keyword: "무풍 에어컨 자가 필터 청소", searches: 18000, posts: 9200, category: "living", gender: 40, age: "30대-40대", season: 95, comm: 45 }
      ];

      // Read filter values
      const minSearch = parseInt(filterMinSearchInput.value);
      const maxPosts = parseInt(filterMaxPostsInput.value);
      const targetGender = parseInt(filterGenderRatioInput.value);
      const seasonLimit = parseInt(filterSeasonIdxInput.value);
      const commLimit = parseInt(filterCommercialIdxInput.value);
      const category = filterRecCategorySelect.value;

      const results = [];
      pool.forEach(item => {
        const matchesCategory = category === "all" || item.category === category;
        const matchesSearch = item.searches >= minSearch;
        const matchesPosts = item.posts <= maxPosts;
        const matchesGender = Math.abs(item.gender - targetGender) <= 25; // inside range tolerance
        const matchesSeason = item.season >= seasonLimit;
        const matchesComm = item.comm >= commLimit;

        if (matchesCategory && matchesSearch && matchesPosts && matchesGender && matchesSeason && matchesComm) {
          const satIndex = (item.posts / item.searches).toFixed(2);
          results.push({
            keyword: item.keyword,
            searches: item.searches,
            posts: item.posts,
            satIndex,
            femaleRatio: item.gender,
            mainAge: item.age,
            seasonIdx: item.season,
            commIdx: item.comm
          });
        }
      });

      renderDiscoveryResults(results);
    }, 1500);
  });

  function renderDiscoveryResults(list) {
    recResultsSection.style.display = "flex";
    discoveryResultsTbody.innerHTML = "";

    if (list.length === 0) {
      discoveryResultsTbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:var(--text-muted); padding:20px;">조건에 일치하는 결과 키워드가 존재하지 않습니다. 슬라이더 범위를 넓히거나 필터를 조정해 보세요.</td></tr>`;
      return;
    }

    list.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong class="clickable-keyword" style="cursor:pointer; color:var(--color-secondary);">${item.keyword}</strong></td>
        <td>${item.searches.toLocaleString()}회</td>
        <td>${item.posts.toLocaleString()}개</td>
        <td><span style="font-weight:600; color:${item.satIndex > 1.5 ? 'var(--color-error)' : 'var(--color-success)'};">${item.satIndex}</span></td>
        <td>${item.femaleRatio}%</td>
        <td>${item.mainAge}</td>
        <td>${item.seasonIdx}</td>
        <td>${item.commIdx}</td>
        <td style="text-align: right; display:flex; gap:6px; justify-content:flex-end;">
          <button class="action-btn btn-analyze-direct" style="padding: 4px 8px; font-size:10px;"><i class="fa-solid fa-magnifying-glass-chart"></i> 심층 분석</button>
          <button class="action-btn btn-add-cal" style="padding: 4px 8px; font-size:10px;"><i class="fa-solid fa-calendar-plus"></i> 캘린더</button>
        </td>
      `;

      tr.querySelector(".clickable-keyword").addEventListener("click", () => {
        analyzeKeyword(item.keyword);
      });
      tr.querySelector(".btn-analyze-direct").addEventListener("click", () => {
        analyzeKeyword(item.keyword);
      });
      tr.querySelector(".btn-add-cal").addEventListener("click", () => {
        addKeywordToCalendar(item.keyword);
      });

      discoveryResultsTbody.appendChild(tr);
    });

    showToast(`키워드 분석 리스트 ${list.length}건이 갱신되었습니다.`);
  }

  // --- Tab 4: In-depth Keyword Analysis ---
  const analysisSearchInput = document.getElementById("analysis-search-input");
  const analysisAutocompleteBox = document.getElementById("analysis-autocomplete-box");
  const btnRunAnalysis = document.getElementById("btn-run-analysis");
  const analysisDashboardWrapper = document.getElementById("analysis-dashboard-wrapper");

  // In-depth details mock database
  const keywordsDatabase = {
    "인공지능": {
      searches: 85000, posts: 120000, grade: "S", index: 1.41, ad: "상 (A)",
      demographics: { labels: ["10대", "20대", "30대", "40대이상"], female: [40, 50, 45, 30], male: [60, 50, 55, 70] },
      seasonality: [70000, 72000, 75000, 80000, 85000, 85000, 82000, 80000, 83000, 88000, 92000, 95000],
      serp: ["지식iN", "네이버 뉴스", "인플루언서 스마트블록", "웹사이트", "쇼핑스마트블록"],
      serpList: [
        { rank: 1, title: "생성형 인공지능(AI) 코딩 실무 교육 강의 후기", channel: "S등급 블로그", keyword: "완전일치" },
        { rank: 2, title: "인공지능 기술의 윤리적 쟁점과 향후 규제 방안 정리", channel: "A등급 웹사이트", keyword: "부분일치" },
        { rank: 3, title: "[리포트] OpenAI GPT-4o 인공지능 발전이 일자리에 미칠 영향", channel: "A등급 뉴스", keyword: "완전일치" }
      ],
      aiDiagnose: "현재 검색량이 월간 8.5만 건으로 매우 강력한 메가 키워드입니다. 콘텐츠 포화지수는 1.41로 보통 수준이나, 광고 단가가 높은 상업 키워드입니다. 최신 LLM 성능 대조 앵글을 이용해 실무형 콘텐츠를 작성하면 상위 노출에 매우 효과적입니다.",
      aiTitles: ["실무 코딩을 위한 생성형 인공지능 툴 비교 추천", "인공지능 발전과 미래 직업군 대응 백서", "인공지능 AI 그림 생성기 사이트 추천 가이드"]
    },
    "GPT-4o": {
      searches: 42000, posts: 31000, grade: "S+", index: 0.73, ad: "중 (B)",
      demographics: { labels: ["10대", "20대", "30대", "40대이상"], female: [30, 45, 40, 25], male: [70, 55, 60, 75] },
      seasonality: [12000, 15000, 25000, 32000, 42000, 42000, 40000, 38000, 41000, 43000, 45000, 48000],
      serp: ["네이버 뉴스", "지식iN", "인플루언서 스마트블록", "웹사이트"],
      serpList: [
        { rank: 1, title: "챗GPT 신모델 GPT-4o 사용법과 주요 업데이트", channel: "S+등급 블로그", keyword: "완전일치" },
        { rank: 2, title: "GPT-4o API 요금표 및 결제 등록 연동 꿀팁", channel: "B등급 블로그", keyword: "완전일치" },
        { rank: 3, title: "GPT-4o 실시간 대화 보이스 모드 적용 시연", channel: "A등급 웹사이트", keyword: "부분일치" }
      ],
      aiDiagnose: "검색량 대비 발행 콘텐츠가 적은 매우 안전한 블루오션 키워드입니다. 신모델 특성에 관한 구체적인 정보성 콘텐츠(사용법, API 가격 등)를 빠르게 기획하여 시장을 선점하십시오.",
      aiTitles: ["무료 사용자용 GPT-4o 사용법 핵심 가이드", "개발자 필수: GPT-4o API 가격 및 연동 세팅", "챗GPT GPT-4o 보이스 모드 및 번역 성능 분석"]
    },
    "캠핑용품": {
      searches: 98000, posts: 320000, grade: "D-", index: 3.26, ad: "최상 (S)",
      demographics: { labels: ["10대", "20대", "30대", "40대이상"], female: [45, 50, 52, 48], male: [55, 50, 48, 52] },
      seasonality: [25000, 35000, 70000, 95000, 98000, 96000, 90000, 93000, 98000, 102000, 45000, 28000],
      serp: ["네이버 쇼핑", "인플루언서 스마트블록", "플레이스 스마트블록", "지식iN"],
      serpList: [
        { rank: 1, title: "캠핑용품 추천: 내돈내산 필수 입문 장비 리스트", channel: "S등급 인플루언서", keyword: "완전일치" },
        { rank: 2, title: "가성비 초보 캠핑용품 텐트 타프 구매 요령", channel: "S등급 블로그", keyword: "완전일치" },
        { rank: 3, title: "감성 캠핑용품 소품 랜턴 테이블 추천 10종", channel: "A+등급 블로그", keyword: "부분일치" }
      ],
      aiDiagnose: "월간 검색량이 약 10만 건에 육박하는 초대형 수요 키워드이나, 발행 콘텐츠가 과포화 상태(지수 3.26)로 최상위 경쟁이 극도로 치열합니다. 브랜드 샵 및 협찬 콘텐츠가 많아 일반 정보 앵글은 노출이 불리합니다. '초보 가성비 패키지' 등 세부 롱테일 키워드로 공략하십시오.",
      aiTitles: ["초보자 필수 캠핑용품 추천: 텐트부터 식기까지", "감성 가득한 가성비 차박 캠핑용품 리스트", "캠핑용품 타프 쉘터 종류별 장단점 추천"]
    }
  };

  // Suggestions trigger
  analysisSearchInput.addEventListener("input", () => {
    const val = analysisSearchInput.value.trim().toLowerCase();
    if (!val) {
      analysisAutocompleteBox.style.display = "none";
      return;
    }

    const matched = Object.keys(keywordsDatabase).filter(k => k.toLowerCase().includes(val));
    if (matched.length === 0) {
      analysisAutocompleteBox.style.display = "none";
      return;
    }

    analysisAutocompleteBox.innerHTML = "";
    matched.forEach(match => {
      const item = document.createElement("div");
      item.style.padding = "10px 14px";
      item.style.cursor = "pointer";
      item.style.color = "var(--text-main)";
      item.style.borderBottom = "1px solid rgba(255,255,255,0.03)";
      item.innerHTML = `<i class="fa-solid fa-magnifying-glass" style="margin-right:8px; font-size:11px; color:var(--text-muted);"></i> ${match}`;
      
      item.addEventListener("mouseenter", () => {
        item.style.backgroundColor = "rgba(168,85,247,0.15)";
      });
      item.addEventListener("mouseleave", () => {
        item.style.backgroundColor = "transparent";
      });
      
      item.addEventListener("click", () => {
        analysisSearchInput.value = match;
        analysisAutocompleteBox.style.display = "none";
        analyzeKeyword(match);
      });
      
      analysisAutocompleteBox.appendChild(item);
    });
    analysisAutocompleteBox.style.display = "block";
  });

  // Hide autocomplete box when clicking outside
  document.addEventListener("click", (e) => {
    if (!analysisSearchInput.contains(e.target) && !analysisAutocompleteBox.contains(e.target)) {
      analysisAutocompleteBox.style.display = "none";
    }
  });

  btnRunAnalysis.addEventListener("click", () => {
    const kw = analysisSearchInput.value.trim();
    if (!kw) {
      playChime('warn');
      alert("분석할 키워드를 입력해 주세요.");
      return;
    }
    analyzeKeyword(kw);
  });

  function analyzeKeyword(keyword) {
    // Switch to analysis tab if not active
    const activeTabBtn = document.querySelector(".tab-btn[data-tab='tab-analysis']");
    if (!activeTabBtn.classList.contains("active")) {
      activeTabBtn.click();
    }
    
    analysisSearchInput.value = keyword;
    statusOverlay.classList.add("active");
    statusMessage.textContent = `"${keyword}" 키워드의 검색 수치, 타겟 성향 및 SERP 배치 구조를 심층 크롤링 중...`;

    setTimeout(() => {
      statusOverlay.classList.remove("active");
      playChime('success');

      // Fetch or generate dynamic record
      let data = keywordsDatabase[keyword];
      if (!data) {
        // Fallback generator using keyword string hash to make it deterministic
        const pseudoSearches = generateHashValue(keyword, 500, 60000);
        const pseudoPosts = generateHashValue(keyword, 200, 95000);
        const pseudoSatIndex = (pseudoPosts / pseudoSearches).toFixed(2);
        
        let pseudoGrade = "C";
        if (pseudoSatIndex < 0.5) pseudoGrade = "S+";
        else if (pseudoSatIndex < 0.8) pseudoGrade = "A";
        else if (pseudoSatIndex < 1.2) pseudoGrade = "B";
        else if (pseudoSatIndex < 2.0) pseudoGrade = "C";
        else pseudoGrade = "D-";

        data = {
          searches: pseudoSearches,
          posts: pseudoPosts,
          grade: pseudoGrade,
          index: parseFloat(pseudoSatIndex),
          ad: pseudoSatIndex > 1.5 ? "상 (A)" : "중 (B)",
          demographics: {
            labels: ["10대", "20대", "30대", "40대이상"],
            female: [generateHashValue(keyword + "f10", 20, 80), generateHashValue(keyword + "f20", 25, 75), generateHashValue(keyword + "f30", 30, 70), generateHashValue(keyword + "f40", 20, 60)],
            male: [0, 0, 0, 0] // filled below
          },
          seasonality: Array.from({ length: 12 }, (_, i) => generateHashValue(keyword + "s" + i, Math.round(pseudoSearches * 0.5), Math.round(pseudoSearches * 1.5))),
          serp: ["인플루언서 스마트블록", "지식iN", "동영상스마트블록", "웹사이트"],
          serpList: [
            { rank: 1, title: `현직자가 제안하는 ${keyword} 기초 개념 가이드`, channel: "A등급 블로그", keyword: "완전일치" },
            { rank: 2, title: `알아두면 유익한 ${keyword} 실전 활용법 노하우 대조`, channel: "A+등급 웹사이트", keyword: "부분일치" },
            { rank: 3, title: `[논란] ${keyword}을 둘러싼 세부 이슈 분석`, channel: "C등급 블로그", keyword: "완전일치" }
          ],
          aiDiagnose: `현재 검색량이 월간 ${pseudoSearches.toLocaleString()} 건이며, 콘텐츠 포화지수는 ${pseudoSatIndex} 입니다. 연령 비율과 시즌 트렌드를 확인하여 적절한 콘텐츠 캘린더 발행 시점을 조율하십시오.`,
          aiTitles: [`${keyword} 초보 입문 가이드: 3분 요약 정리`, `가성비 좋은 ${keyword} 추천 브랜드 BEST 5`, `왜 지금 ${keyword}에 주목해야 할까? 트렌드 분석`]
        };

        // fill male
        for (let i = 0; i < 4; i++) {
          data.demographics.male[i] = 100 - data.demographics.female[i];
        }
      }

      // Render details
      analysisDashboardWrapper.style.display = "flex";
      
      document.getElementById("analysis-grade").textContent = data.grade;
      document.getElementById("analysis-monthly-searches").textContent = `${data.searches.toLocaleString()}회`;
      document.getElementById("analysis-total-posts").textContent = `${data.posts.toLocaleString()}개`;
      document.getElementById("analysis-saturation-index").textContent = data.index;
      document.getElementById("analysis-ad-efficiency").textContent = data.ad;

      // Gauge indicator position
      const percentage = Math.min(100, Math.max(0, (data.index / 3) * 100));
      document.getElementById("analysis-gauge-indicator").style.left = `${percentage}%`;

      // Render Charts
      renderAnalysisCharts(data);

      // SERP sequence
      const serpSeq = document.getElementById("analysis-serp-sequence");
      serpSeq.innerHTML = "";
      data.serp.forEach((s, idx) => {
        const span = document.createElement("span");
        span.className = `serp-pill ${idx === 0 ? 'serp-pill-active' : ''}`;
        span.innerHTML = `<strong>${idx + 1}위</strong> ${s}`;
        serpSeq.appendChild(span);
      });

      // SERP details list
      const serpTbody = document.getElementById("analysis-serp-tbody");
      serpTbody.innerHTML = "";
      data.serpList.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><span class="rank-badge rank-other" style="font-weight:700;">${item.rank}</span></td>
          <td><span style="color:var(--text-main); font-weight:500;">${item.title}</span></td>
          <td><span class="badge-tag" style="background-color:rgba(56,189,248,0.1); color:#38bdf8;">${item.channel}</span></td>
          <td><span class="badge-tag" style="background-color:${item.keyword === '완전일치' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}; color:${item.keyword === '완전일치' ? 'var(--color-success)' : 'var(--color-warning)'};">${item.keyword}</span></td>
        `;
        serpTbody.appendChild(tr);
      });

      // AI diagnose text
      document.getElementById("analysis-ai-diagnose-container").innerHTML = `
        <div style="font-size:13px; line-height:1.6; color:var(--text-secondary);">
          ${data.aiDiagnose}
        </div>
      `;

      // AI suggested titles
      const titlesList = document.getElementById("analysis-ai-titles-list");
      titlesList.innerHTML = "";
      data.aiTitles.forEach(t => {
        const li = document.createElement("li");
        li.style.cursor = "pointer";
        li.innerHTML = `${t} <span style="font-size:10px; color:var(--text-muted); margin-left:6px;"><i class="fa-solid fa-calendar-plus"></i> 일정 추가</span>`;
        li.addEventListener("click", () => {
          addKeywordToCalendar(t);
        });
        titlesList.appendChild(li);
      });

    }, 1200);
  }

  function renderAnalysisCharts(data) {
    // Demographics chart (stacked bar or grouped bar)
    const demoCtx = document.getElementById("analysis-demographics-chart").getContext("2d");
    if (demographicsChart) demographicsChart.destroy();
    
    demographicsChart = new Chart(demoCtx, {
      type: 'bar',
      data: {
        labels: data.demographics.labels,
        datasets: [
          {
            label: '여성 (%)',
            data: data.demographics.female,
            backgroundColor: 'rgba(168, 85, 247, 0.75)',
            borderColor: 'var(--color-primary)',
            borderWidth: 1
          },
          {
            label: '남성 (%)',
            data: data.demographics.male,
            backgroundColor: 'rgba(56, 189, 248, 0.75)',
            borderColor: 'var(--color-secondary)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#9ca3af', font: { size: 10 } }, position: 'bottom' }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280', font: { size: 10 } } },
          y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280', font: { size: 10 } } }
        }
      }
    });

    // Seasonality Line chart
    const seasonCtx = document.getElementById("analysis-seasonality-chart").getContext("2d");
    if (seasonalityChart) seasonalityChart.destroy();

    seasonalityChart = new Chart(seasonCtx, {
      type: 'line',
      data: {
        labels: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
        datasets: [{
          label: '검색 지수',
          data: data.seasonality,
          borderColor: 'var(--color-success)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 10 } } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280', font: { size: 10 } } }
        }
      }
    });
  }

  // Helpers to generate pseudo-random hash parameters deterministically
  function generateHashValue(str, min, max) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const abs = Math.abs(hash);
    return min + (abs % (max - min));
  }

  function generateAgeTarget(str) {
    const agePool = ["10대-20대", "20대-30대", "30대-40대", "40대이상"];
    const hash = generateHashValue(str, 0, 100);
    return agePool[hash % agePool.length];
  }

  // --- Tab 5: Quick Search Panel ---
  const quickKeywordsInput = document.getElementById("quick-keywords-input");
  const btnRunQuick = document.getElementById("btn-run-quick");
  const quickResultsSection = document.getElementById("quick-results-section");
  const quickResultsTbody = document.getElementById("quick-results-tbody");
  
  const quickHashtagsBox = document.getElementById("quick-hashtags-box");
  const btnCopyHashtags = document.getElementById("btn-copy-hashtags");

  btnRunQuick.addEventListener("click", () => {
    const linesText = quickKeywordsInput.value.trim();
    if (!linesText) {
      playChime('warn');
      alert("일괄 비교할 키워드를 입력해 주세요.");
      return;
    }

    statusOverlay.classList.add("active");
    statusMessage.textContent = "여러 키워드의 통합 색인 및 검색 포화 통계를 일괄 대조 분석 중...";

    setTimeout(() => {
      statusOverlay.classList.remove("active");
      playChime('success');
      quickResultsSection.style.display = "flex";

      const keywords = linesText.split("\n").map(l => l.trim()).filter(Boolean).slice(0, 10);
      quickResultsTbody.innerHTML = "";

      const hashtags = [];
      keywords.forEach(kw => {
        // Generate pseudo statistics
        const searches = generateHashValue(kw, 300, 95000);
        const posts = generateHashValue(kw, 100, 280000);
        const ratio = (posts / searches).toFixed(2);
        
        let grade = "C";
        if (ratio < 0.6) grade = "S+";
        else if (ratio < 1.0) grade = "A";
        else if (ratio < 1.8) grade = "B";
        
        hashtags.push(`#${kw.replace(/\s+/g, "")}`);

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong class="clickable-keyword" style="cursor:pointer; color:var(--color-secondary);">${kw}</strong></td>
          <td>${searches.toLocaleString()}회</td>
          <td>${posts.toLocaleString()}개</td>
          <td><span style="font-weight:700; color:${ratio > 1.5 ? 'var(--color-error)' : 'var(--color-success)'};">${ratio}</span></td>
          <td><span class="badge-tag" style="background-color:rgba(168,85,247,0.15); color:var(--color-primary); font-weight:700;">${grade}</span></td>
          <td style="text-align: right;">
            <button class="action-btn btn-analyze-direct" style="padding: 2px 6px; font-size:10px;"><i class="fa-solid fa-magnifying-glass-chart"></i> 상세분석</button>
          </td>
        `;

        tr.querySelector(".clickable-keyword").addEventListener("click", () => {
          analyzeKeyword(kw);
        });
        tr.querySelector(".btn-analyze-direct").addEventListener("click", () => {
          analyzeKeyword(kw);
        });

        quickResultsTbody.appendChild(tr);
      });

      // Populate hashtags
      quickHashtagsBox.value = hashtags.join(" ");

    }, 1000);
  });

  btnCopyHashtags.addEventListener("click", () => {
    const val = quickHashtagsBox.value;
    if (!val) return;
    
    navigator.clipboard.writeText(val).then(() => {
      playChime('success');
      showToast("해시태그 목록이 복사되었습니다!");
    }).catch(err => {
      console.error("Copy failed", err);
    });
  });

  // --- Tab 6: Influence Ranking & Channel Diagnosis ---
  const influenceUrlInput = document.getElementById("influence-url-input");
  const btnRunInfluence = document.getElementById("btn-run-influence");
  const influenceDashboardWrapper = document.getElementById("influence-dashboard-wrapper");

  btnRunInfluence.addEventListener("click", () => {
    const url = influenceUrlInput.value.trim();
    if (!url) {
      playChime('warn');
      alert("진단할 채널 URL을 입력해 주세요.");
      return;
    }

    statusOverlay.classList.add("active");
    statusMessage.textContent = "도메인 권위 지수, 최신 포스팅 색인율 및 노출 영향력을 연산 중...";

    setTimeout(() => {
      statusOverlay.classList.remove("active");
      playChime('success');

      influenceDashboardWrapper.style.display = "grid";

      // Pseudo values based on URL string
      const seed = url.replace(/https?:\/\//, "");
      const validKw = generateHashValue(seed + "kw", 50, 4500);
      const freshness = generateHashValue(seed + "fr", 60, 99);
      const authority = generateHashValue(seed + "auth", 40, 95);
      
      let grade = "A";
      if (authority >= 85) grade = "S-";
      else if (authority >= 75) grade = "A+";
      else if (authority >= 60) grade = "B";
      else grade = "C";

      document.getElementById("influence-channel-name").textContent = seed.split("/")[0] || "지정된 채널";
      document.getElementById("influence-channel-url").textContent = url;
      document.getElementById("influence-grade").textContent = grade;
      document.getElementById("influence-valid-keywords").textContent = `${validKw.toLocaleString()}개 키워드`;
      document.getElementById("influence-top-exposure").textContent = `${freshness}%`;
      document.getElementById("influence-freshness-score").textContent = `${freshness}점 / 100점`;
      document.getElementById("influence-expertness-score").textContent = `${authority}점 / 100점`;

      // Render overlap chart
      renderOverlapChart(seed);
    }, 1200);
  });

  function renderOverlapChart(seed) {
    const ctx = document.getElementById("influence-overlap-chart").getContext("2d");
    if (overlapChart) overlapChart.destroy();

    const pseudoComp1 = seed.includes("blog") ? "naver_blog_it_master" : "competitor_tech_site";
    const pseudoComp2 = "seo_expert_portal";
    const pseudoComp3 = "daily_trends_channel";

    overlapChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [pseudoComp1, pseudoComp2, pseudoComp3],
        datasets: [{
          label: '키워드 매칭 중복도 (%)',
          data: [
            generateHashValue(seed + "c1", 30, 85),
            generateHashValue(seed + "c2", 20, 70),
            generateHashValue(seed + "c3", 15, 60)
          ],
          backgroundColor: [
            'rgba(56, 189, 248, 0.75)',
            'rgba(168, 85, 247, 0.75)',
            'rgba(16, 185, 129, 0.75)'
          ],
          borderColor: [
            'var(--color-secondary)',
            'var(--color-primary)',
            'var(--color-success)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280', font: { size: 10 } } },
          y: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 10 } } }
        }
      }
    });
  }

  // --- PDF Downloader Simulation ---
  const btnDownloadPdf = document.getElementById("btn-download-pdf");
  btnDownloadPdf.addEventListener("click", () => {
    statusOverlay.classList.add("active");
    statusMessage.textContent = "AI 트렌드 레포트 요약서를 PDF로 빌드하는 중...";

    setTimeout(() => {
      statusOverlay.classList.remove("active");
      playChime('success');

      // Generate a download of simulated text file as PDF
      const reportContent = `
=========================================
CineAHO AI Trend Insight Report
생성일자: ${new Date().toLocaleDateString()}
출처 채널: ${currentSource.toUpperCase()}
=========================================

1. 트렌드 분석 요약
-----------------------------------------
${aiTrendReport[currentSource].summary.replace(/<br>/g, "\n").replace(/<[^>]*>/g, "")}

2. 금일 추천 마케팅 기획 앵글
-----------------------------------------
${aiTrendReport[currentSource].angles.map((a, i) => `${i + 1}. [${a.theme}] ${a.angle}`).join("\n")}

=========================================
Copyright (c) 2026 CineAHO Keyword Solutions
      `;
      
      const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `AI_Trend_Insight_Report_${currentSource}_${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("인사이트 보고서(텍스트형태) 다운로드가 개시되었습니다!");
    }, 1500);
  });

  // --- Start Up ---
  loadState();
  renderTrendTab();
  renderSeasonalTab();
  const startKeyword = (risingKeywords[currentSource] && risingKeywords[currentSource].daily[0]?.keyword) || "Claude 3.5 Sonnet 출시";
  analyzeNewsContext(startKeyword);
});
