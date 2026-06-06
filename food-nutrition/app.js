/**
 * CineAHO Food Photo Nutrition Scanner & Intake Calculator App Engine
 * 100% Client-side KDRIs Nutritional Logic & Simulated AI Scanner
 */

// CURATED FOOD DATABASE (40 popular Korean/Western/Asian foods & ingredients)
const FOOD_DB = [
  { id: 'bibimbap', name: '비빔밥', kcal: 585, carbs: 95.0, protein: 18.5, fat: 14.0, sodium: 1020, emoji: '🍚' },
  { id: 'pizza', name: '치즈피자 (2조각)', kcal: 650, carbs: 75.0, protein: 25.0, fat: 28.0, sodium: 1250, emoji: '🍕' },
  { id: 'salad', name: '닭가슴살 샐러드', kcal: 280, carbs: 12.0, protein: 32.0, fat: 11.0, sodium: 380, emoji: '🥗' },
  { id: 'burger', name: '더블치즈버거 세트', kcal: 920, carbs: 110.0, protein: 38.0, fat: 36.0, sodium: 1550, emoji: '🍔' },
  { id: 'tteokbokki', name: '매운 떡볶이 (1인분)', kcal: 450, carbs: 88.0, protein: 11.0, fat: 6.0, sodium: 1350, emoji: '🌶️' },
  
  { id: 'kimchi-jjigae', name: '김치찌개와 밥', kcal: 550, carbs: 78.0, protein: 24.5, fat: 16.0, sodium: 1850, emoji: '🥘' },
  { id: 'jjajangmyeon', name: '수타 짜장면', kcal: 785, carbs: 120.0, protein: 18.0, fat: 25.0, sodium: 1950, emoji: '🍜' },
  { id: 'samgyeopsal', name: '삼겹살 구이 (200g)', kcal: 620, carbs: 2.0, protein: 38.0, fat: 50.0, sodium: 250, emoji: '🥓' },
  { id: 'sushi', name: '모듬초밥 (10pcs)', kcal: 500, carbs: 70.0, protein: 22.0, fat: 10.0, sodium: 780, emoji: '🍣' },
  { id: 'fried-chicken', name: '후라이드 치킨 (3조각)', kcal: 750, carbs: 45.0, protein: 36.0, fat: 48.0, sodium: 1380, emoji: '🍗' },
  
  { id: 'steak', name: '안심 스테이크 (200g)', kcal: 480, carbs: 3.0, protein: 42.0, fat: 32.0, sodium: 620, emoji: '🥩' },
  { id: 'pasta', name: '크림 까르보나라', kcal: 680, carbs: 80.0, protein: 18.0, fat: 32.0, sodium: 980, emoji: '🍝' },
  { id: 'ramen', name: '매운 라면 (1봉지)', kcal: 500, carbs: 78.0, protein: 10.0, fat: 16.0, sodium: 1790, emoji: '🍜' },
  { id: 'kimbap', name: '참치 야채김밥 (1줄)', kcal: 420, carbs: 68.0, protein: 14.0, fat: 10.0, sodium: 850, emoji: '🍙' },
  { id: 'sandwich', name: '베이컨 클럽 샌드위치', kcal: 380, carbs: 42.0, protein: 18.0, fat: 15.0, sodium: 820, emoji: '🥪' },
  
  { id: 'bulgogi', name: '뚝배기 소불고기', kcal: 450, carbs: 35.0, protein: 30.0, fat: 20.0, sodium: 920, emoji: '🥩' },
  { id: 'tacos', name: '멕시칸 비프 타코 (2개)', kcal: 420, carbs: 40.0, protein: 22.0, fat: 18.0, sodium: 820, emoji: '🌮' },
  { id: 'donut', name: '글레이즈드 도넛 (1개)', kcal: 260, carbs: 32.0, protein: 3.0, fat: 14.0, sodium: 240, emoji: '🍩' },
  { id: 'icecream', name: '바닐라 아이스크림 (1컵)', kcal: 220, carbs: 28.0, protein: 4.0, fat: 10.0, sodium: 80, emoji: '🍨' },
  { id: 'gukbap', name: '전통 순대국밥', kcal: 750, carbs: 95.0, protein: 35.0, fat: 25.0, sodium: 1450, emoji: '🍲' },
  
  { id: 'naengmyeon', name: '살얼음 물냉면', kcal: 520, carbs: 95.0, protein: 16.0, fat: 8.0, sodium: 1580, emoji: '🍜' },
  { id: 'pork-cutlet', name: '경양식 돈까스', kcal: 850, carbs: 70.0, protein: 32.0, fat: 48.0, sodium: 1120, emoji: '🍛' },
  { id: 'chicken-breast', name: '스팀 닭가슴살 (100g)', kcal: 120, carbs: 0.0, protein: 26.0, fat: 1.5, sodium: 80, emoji: '🍗' },
  { id: 'apple', name: '세척 사과 (1개)', kcal: 100, carbs: 25.0, protein: 0.5, fat: 0.2, sodium: 2, emoji: '🍎' },
  { id: 'banana', name: '유기농 바나나 (1개)', kcal: 100, carbs: 26.0, protein: 1.1, fat: 0.2, sodium: 1, emoji: '🍌' },
  
  { id: 'milk', name: '흰 우유 (1잔, 200ml)', kcal: 120, carbs: 11.0, protein: 7.0, fat: 5.0, sodium: 120, emoji: '🥛' },
  { id: 'rice', name: '따뜻한 백미밥 (1공기)', kcal: 300, carbs: 68.0, protein: 6.0, fat: 1.0, sodium: 5, emoji: '🍚' },
  { id: 'americano', name: '아이스 아메리카노', kcal: 10, carbs: 1.0, protein: 0.5, fat: 0.0, sodium: 5, emoji: '☕' },
  { id: 'curry', name: '비프 카레라이스', kcal: 580, carbs: 92.0, protein: 18.0, fat: 16.0, sodium: 1120, emoji: '🍛' },
  { id: 'jeyuk', name: '매콤 제육덮밥', kcal: 720, carbs: 98.0, protein: 28.0, fat: 24.0, sodium: 1450, emoji: '🍛' },
  
  { id: 'fried-rice', name: '중식 계란볶음밥', kcal: 550, carbs: 82.0, protein: 12.0, fat: 19.0, sodium: 850, emoji: '🍛' },
  { id: 'egg-roll', name: '야채 계란말이', kcal: 220, carbs: 4.0, protein: 16.0, fat: 16.0, sodium: 480, emoji: '🥚' },
  { id: 'seaweed-soup', name: '소고기 미역국', kcal: 120, carbs: 8.0, protein: 12.0, fat: 5.0, sodium: 920, emoji: '🍲' },
  { id: 'doenjang', name: '차돌 된장찌개', kcal: 280, carbs: 18.0, protein: 16.0, fat: 16.0, sodium: 1380, emoji: '🍲' },
  { id: 'bossam', name: '담백한 보쌈 (1인분)', kcal: 550, carbs: 8.0, protein: 36.0, fat: 42.0, sodium: 650, emoji: '🥩' },
  
  { id: 'dumplings', name: '찐 갈비만두 (8개)', kcal: 360, carbs: 44.0, protein: 14.0, fat: 14.0, sodium: 620, emoji: '🥟' },
  { id: 'hotdog', name: '크리스피 핫도그', kcal: 280, carbs: 30.0, protein: 8.0, fat: 14.0, sodium: 620, emoji: '🌭' },
  { id: 'cheesecake', name: '뉴욕 치즈케이크', kcal: 350, carbs: 34.0, protein: 6.0, fat: 22.0, sodium: 280, emoji: '🍰' },
  { id: 'yogurt', name: '플레인 요거트', kcal: 90, carbs: 10.0, protein: 4.0, fat: 3.0, sodium: 60, emoji: '🥛' },
  { id: 'beer', name: '시원한 생맥주 (500cc)', kcal: 185, carbs: 15.0, protein: 1.0, fat: 0.0, sodium: 25, emoji: '🍺' }
];

// Sound Synthesizer using Web Audio API
const SoundEngine = {
  ctx: null,

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio not supported", e);
    }
  },

  play(type) {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    const baseGain = 0.08;

    switch (type) {
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, t);
        gainNode.gain.setValueAtTime(baseGain * 0.4, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
        break;
      case 'scan':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.linearRampToValueAtTime(800, t + 0.3);
        osc.frequency.linearRampToValueAtTime(400, t + 0.6);
        gainNode.gain.setValueAtTime(baseGain * 0.3, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.65);
        osc.start(t);
        osc.stop(t + 0.65);
        break;
      case 'success':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, t); // D5
        osc.frequency.setValueAtTime(880, t + 0.08); // A5
        gainNode.gain.setValueAtTime(baseGain, t);
        gainNode.gain.setValueAtTime(baseGain, t + 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
        osc.start(t);
        osc.stop(t + 0.25);
        break;
      case 'delete':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.linearRampToValueAtTime(220, t + 0.15);
        gainNode.gain.setValueAtTime(baseGain, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
        break;
    }
  }
};

const App = {
  state: {
    // User Profile
    gender: 'female',        // male, female
    ageGroup: '19-29',       // KDRI age keys
    activity: 'moderate',    // sedentary, moderate, active

    // Scanned food state
    selectedFoodId: 'bibimbap',
    multiplier: 1.0,         // serving size multiplier

    // Daily log diary
    diary: []
  },

  // DOM elements: Profile & inputs
  genderSelectEl: null,
  ageSelectEl: null,
  activitySelectEl: null,
  lblTargetKcalEl: null,
  dropZoneEl: null,
  fileInputEl: null,
  previewImgEl: null,
  scanLineBarEl: null,
  scanOverlayEl: null,
  logConsoleEl: null,
  searchFoodEl: null,
  searchResultsBoxEl: null,
  servingBtnsEl: null,

  // DOM elements: Results Display
  lblScannedFoodNameEl: null,
  lblScannedFoodServingEl: null,
  gaugeProgressEl: null,
  lblFoodKcalEl: null,
  lblKcalPctEl: null,
  badgeHighSodiumEl: null,
  badgeHighFatEl: null,
  badgeHealthyEl: null,

  // DOM elements: Macro bars
  valCarbsEl: null, targetCarbsEl: null, pctCarbsEl: null, barCarbsEl: null,
  valProteinEl: null, targetProteinEl: null, pctProteinEl: null, barProteinEl: null,
  valFatEl: null, targetFatEl: null, pctFatEl: null, barFatEl: null,
  valSodiumEl: null, targetSodiumEl: null, pctSodiumEl: null, barSodiumEl: null,

  // DOM elements: Burn time
  burnJoggingEl: null,
  burnWalkingEl: null,
  burnSwimmingEl: null,
  burnCyclingEl: null,

  // DOM elements: Logger
  btnLogMealEl: null,
  lblDiaryTotalKcalEl: null,
  lblDiaryTargetKcalEl: null,
  lblDiaryTotalPctEl: null,
  lblDiaryRemainKcalEl: null,
  diaryCalProgressEl: null,

  // DOM elements: Logger Macros
  lblDiaryCarbsEl: null, lblDiaryTargetCarbsEl: null, barDiaryCarbsEl: null,
  lblDiaryProteinEl: null, lblDiaryTargetProteinEl: null, barDiaryProteinEl: null,
  lblDiaryFatEl: null, lblDiaryTargetFatEl: null, barDiaryFatEl: null,
  lblDiarySodiumEl: null, lblDiaryTargetSodiumEl: null, barDiarySodiumEl: null,
  diaryTableBodyEl: null,
  diaryEmptyMsgEl: null,

  // DOM elements: Scroll
  scrollProgressRingEl: null,
  progressCircleIndicatorEl: null,
  scrollPercentageLblEl: null,
  btnScrollTopEl: null,
  btnScrollBottomEl: null,

  init() {
    this.cacheDomElements();
    this.loadDiaryFromStorage();
    this.bindEvents();
    this.renderPresets();
    this.updateDailyIntakeTargets();
    this.calculateScannedFoodNutrition();
    this.updateScrollProgress();
  },

  cacheDomElements() {
    // Profile
    this.genderSelectEl = document.getElementById('profile-gender');
    this.ageSelectEl = document.getElementById('profile-age');
    this.activitySelectEl = document.getElementById('profile-activity');
    this.lblTargetKcalEl = document.getElementById('lbl-target-kcal');

    // Upload & Scan
    this.dropZoneEl = document.getElementById('drop-zone');
    this.fileInputEl = document.getElementById('file-input');
    this.previewImgEl = document.getElementById('preview-img');
    this.scanLineBarEl = document.getElementById('scan-line-bar');
    this.scanOverlayEl = document.getElementById('scan-overlay');
    this.logConsoleEl = document.getElementById('log-console');

    // Search and adjust
    this.searchFoodEl = document.getElementById('search-food');
    this.searchResultsBoxEl = document.getElementById('search-results-box');
    this.servingBtnsEl = document.querySelectorAll('.serving-btn');

    // Results Display
    this.lblScannedFoodNameEl = document.getElementById('lbl-scanned-food-name');
    this.lblScannedFoodServingEl = document.getElementById('lbl-scanned-food-serving');
    this.gaugeProgressEl = document.getElementById('gauge-progress');
    this.lblFoodKcalEl = document.getElementById('lbl-food-kcal');
    this.lblKcalPctEl = document.getElementById('lbl-kcal-pct');

    // Badges
    this.badgeHighSodiumEl = document.getElementById('badge-high-sodium');
    this.badgeHighFatEl = document.getElementById('badge-high-fat');
    this.badgeHealthyEl = document.getElementById('badge-healthy');

    // Macros
    this.valCarbsEl = document.getElementById('val-carbs');
    this.targetCarbsEl = document.getElementById('target-carbs');
    this.pctCarbsEl = document.getElementById('pct-carbs');
    this.barCarbsEl = document.getElementById('bar-carbs');

    this.valProteinEl = document.getElementById('val-protein');
    this.targetProteinEl = document.getElementById('target-protein');
    this.pctProteinEl = document.getElementById('pct-protein');
    this.barProteinEl = document.getElementById('bar-protein');

    this.valFatEl = document.getElementById('val-fat');
    this.targetFatEl = document.getElementById('target-fat');
    this.pctFatEl = document.getElementById('pct-fat');
    this.barFatEl = document.getElementById('bar-fat');

    this.valSodiumEl = document.getElementById('val-sodium');
    this.targetSodiumEl = document.getElementById('target-sodium');
    this.pctSodiumEl = document.getElementById('pct-sodium');
    this.barSodiumEl = document.getElementById('bar-sodium');

    // Burn equivalencies
    this.burnJoggingEl = document.getElementById('burn-jogging');
    this.burnWalkingEl = document.getElementById('burn-walking');
    this.burnSwimmingEl = document.getElementById('burn-swimming');
    this.burnCyclingEl = document.getElementById('burn-cycling');

    // Diary Summary
    this.btnLogMealEl = document.getElementById('btn-log-meal');
    this.lblDiaryTotalKcalEl = document.getElementById('lbl-diary-total-kcal');
    this.lblDiaryTargetKcalEl = document.getElementById('lbl-diary-target-kcal');
    this.lblDiaryTotalPctEl = document.getElementById('lbl-diary-total-pct');
    this.lblDiaryRemainKcalEl = document.getElementById('lbl-diary-remain-kcal');
    this.diaryCalProgressEl = document.getElementById('diary-cal-progress');

    // Diary Macros
    this.lblDiaryCarbsEl = document.getElementById('lbl-diary-carbs');
    this.lblDiaryTargetCarbsEl = document.getElementById('lbl-diary-target-carbs');
    this.barDiaryCarbsEl = document.getElementById('bar-diary-carbs');

    this.lblDiaryProteinEl = document.getElementById('lbl-diary-protein');
    this.lblDiaryTargetProteinEl = document.getElementById('lbl-diary-target-protein');
    this.barDiaryProteinEl = document.getElementById('bar-diary-protein');

    this.lblDiaryFatEl = document.getElementById('lbl-diary-fat');
    this.lblDiaryTargetFatEl = document.getElementById('lbl-diary-target-fat');
    this.barDiaryFatEl = document.getElementById('bar-diary-fat');

    this.lblDiarySodiumEl = document.getElementById('lbl-diary-sodium');
    this.lblDiaryTargetSodiumEl = document.getElementById('lbl-diary-target-sodium');
    this.barDiarySodiumEl = document.getElementById('bar-diary-sodium');

    this.diaryTableBodyEl = document.getElementById('diary-table-body');
    this.diaryEmptyMsgEl = document.getElementById('diary-empty-msg');

    // Scroll
    this.scrollProgressRingEl = document.getElementById('scroll-progress-ring');
    this.progressCircleIndicatorEl = document.getElementById('progress-circle-indicator');
    this.scrollPercentageLblEl = document.getElementById('scroll-percentage-lbl');
    this.btnScrollTopEl = document.getElementById('btn-scroll-top');
    this.btnScrollBottomEl = document.getElementById('btn-scroll-bottom');
  },

  loadDiaryFromStorage() {
    try {
      const stored = localStorage.getItem('cineaho_food_diary');
      if (stored) {
        this.state.diary = JSON.parse(stored);
      } else {
        this.state.diary = [];
      }
    } catch (e) {
      console.error("Diary load error", e);
      this.state.diary = [];
    }
  },

  saveDiaryToStorage() {
    try {
      localStorage.setItem('cineaho_food_diary', JSON.stringify(this.state.diary));
    } catch (e) {
      console.error("Diary save error", e);
    }
  },

  bindEvents() {
    // Profile updates
    const updateProfile = () => {
      this.state.gender = this.genderSelectEl.value;
      this.state.ageGroup = this.ageSelectEl.value;
      this.state.activity = this.activitySelectEl.value;
      this.updateDailyIntakeTargets();
      this.calculateScannedFoodNutrition();
      this.renderDiary();
    };

    this.genderSelectEl.addEventListener('change', () => {
      SoundEngine.play('click');
      updateProfile();
    });
    this.ageSelectEl.addEventListener('change', () => {
      SoundEngine.play('click');
      updateProfile();
    });
    this.activitySelectEl.addEventListener('change', () => {
      SoundEngine.play('click');
      updateProfile();
    });

    // Upload interactions
    this.dropZoneEl.addEventListener('click', () => {
      SoundEngine.play('click');
      this.fileInputEl.click();
    });

    this.fileInputEl.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.handleImageFile(e.target.files[0]);
      }
    });

    // Drag and drop handlers
    this.dropZoneEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropZoneEl.classList.add('dragover');
    });

    this.dropZoneEl.addEventListener('dragleave', () => {
      this.dropZoneEl.classList.remove('dragover');
    });

    this.dropZoneEl.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropZoneEl.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        this.handleImageFile(e.dataTransfer.files[0]);
      }
    });

    // Refinement search
    this.searchFoodEl.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      this.renderAutocompleteResults(query);
    });

    // Close autocomplete on click outside
    document.addEventListener('click', (e) => {
      if (e.target !== this.searchFoodEl) {
        this.searchResultsBoxEl.style.display = 'none';
      }
    });

    // Serving multipliers
    this.servingBtnsEl.forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.play('click');
        this.servingBtnsEl.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.multiplier = parseFloat(btn.getAttribute('data-mult'));
        this.calculateScannedFoodNutrition();
      });
    });

    // Log meal
    this.btnLogMealEl.addEventListener('click', () => {
      this.logCurrentMeal();
    });

    // Scroll buttons
    window.addEventListener('scroll', () => this.updateScrollProgress());
    this.btnScrollTopEl.addEventListener('click', () => {
      SoundEngine.play('click');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    this.btnScrollBottomEl.addEventListener('click', () => {
      SoundEngine.play('click');
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
  },

  renderPresets() {
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent clicking preset opening file explorer
        const foodId = btn.getAttribute('data-food');
        // Synthesize temporary mock image path
        const mockImgUrl = `https://images.unsplash.com/photo-${getMockImageCode(foodId)}?auto=format&fit=crop&w=600&q=80`;
        this.triggerMockScanAnimation(foodId, mockImgUrl);
      });
    });
  },

  handleImageFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Filename keyword mapping
      let matchedFoodId = 'bibimbap'; // default fallback
      const filename = file.name.toLowerCase();

      for (const food of FOOD_DB) {
        if (filename.includes(food.id) || filename.includes(food.name.replace(/ /g, ''))) {
          matchedFoodId = food.id;
          break;
        }
      }

      // Check korean keywords
      if (matchedFoodId === 'bibimbap') {
        if (filename.includes('피자') || filename.includes('pizza')) matchedFoodId = 'pizza';
        else if (filename.includes('샐러드') || filename.includes('salad')) matchedFoodId = 'salad';
        else if (filename.includes('버거') || filename.includes('burger')) matchedFoodId = 'burger';
        else if (filename.includes('떡볶이') || filename.includes('tteokbokki')) matchedFoodId = 'tteokbokki';
        else if (filename.includes('김치찌개') || filename.includes('찌개')) matchedFoodId = 'kimchi-jjigae';
        else if (filename.includes('짜장') || filename.includes('jjajang')) matchedFoodId = 'jjajangmyeon';
        else if (filename.includes('삼겹살') || filename.includes('samgyeop')) matchedFoodId = 'samgyeopsal';
        else if (filename.includes('초밥') || filename.includes('sushi')) matchedFoodId = 'sushi';
        else if (filename.includes('치킨') || filename.includes('chicken')) matchedFoodId = 'fried-chicken';
        else if (filename.includes('스테이크') || filename.includes('steak')) matchedFoodId = 'steak';
        else if (filename.includes('라면') || filename.includes('ramen')) matchedFoodId = 'ramen';
        else if (filename.includes('김밥') || filename.includes('kimbap')) matchedFoodId = 'kimbap';
        else if (filename.includes('사과') || filename.includes('apple')) matchedFoodId = 'apple';
        else if (filename.includes('바나나') || filename.includes('banana')) matchedFoodId = 'banana';
        else if (filename.includes('맥주') || filename.includes('beer')) matchedFoodId = 'beer';
      }

      this.triggerMockScanAnimation(matchedFoodId, e.target.result);
    };
    reader.readAsDataURL(file);
  },

  triggerMockScanAnimation(foodId, imgSrc) {
    SoundEngine.play('scan');
    
    // UI elements setup
    this.previewImgEl.src = imgSrc;
    this.previewImgEl.style.display = 'block';
    this.scanLineBarEl.style.display = 'block';
    this.scanOverlayEl.style.display = 'block';
    this.logConsoleEl.style.display = 'block';
    this.logConsoleEl.innerHTML = '';

    // Hide icon/text inside dropzone
    document.getElementById('drop-zone-icon').style.display = 'none';
    document.getElementById('drop-zone-text').style.display = 'none';

    // Print logs sequentially
    const food = FOOD_DB.find(item => item.id === foodId) || FOOD_DB[0];
    const logSteps = [
      { delay: 0, text: "음식 이미지 픽셀 해독 중..." },
      { delay: 250, text: "합성곱 특징 연산 맵 가동 (Convolutional layers)..." },
      { delay: 550, text: "패턴 및 형상 감지 매칭 진행 중 (유사도 91.5% 돌파)..." },
      { delay: 900, text: "식품의약품안전처 표준 DB 비교 대치 완료." },
      { delay: 1200, text: `AI 스캔 성공: ${food.emoji} [${food.name}] 식별 (신뢰도 98.4%)` }
    ];

    logSteps.forEach(step => {
      setTimeout(() => {
        const div = document.createElement('div');
        div.className = 'log-line';
        div.textContent = step.text;
        this.logConsoleEl.appendChild(div);
        this.logConsoleEl.scrollTop = this.logConsoleEl.scrollHeight;

        if (step.delay === 1200) {
          SoundEngine.play('success');
          // Scan completion
          this.scanLineBarEl.style.display = 'none';
          this.scanOverlayEl.style.display = 'none';
          this.state.selectedFoodId = foodId;
          this.searchFoodEl.value = food.name;
          this.calculateScannedFoodNutrition();
        }
      }, step.delay);
    });
  },

  renderAutocompleteResults(query) {
    this.searchResultsBoxEl.innerHTML = '';
    if (!query) {
      this.searchResultsBoxEl.style.display = 'none';
      return;
    }

    const matches = FOOD_DB.filter(food => 
      food.name.toLowerCase().includes(query) || 
      food.id.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
      this.searchResultsBoxEl.style.display = 'none';
      return;
    }

    matches.forEach(food => {
      const div = document.createElement('div');
      div.className = 'autocomplete-item';
      div.innerHTML = `${food.emoji} ${food.name} <span style="font-size: 10px; color: var(--text-dark); margin-left: 5px;">(${food.kcal}kcal)</span>`;
      div.addEventListener('click', () => {
        SoundEngine.play('click');
        this.state.selectedFoodId = food.id;
        this.searchFoodEl.value = food.name;
        this.searchResultsBoxEl.style.display = 'none';
        this.calculateScannedFoodNutrition();
      });
      this.searchResultsBoxEl.appendChild(div);
    });

    this.searchResultsBoxEl.style.display = 'block';
  },

  // Calculate standard nutritional daily target based on 2020 KDRIs
  getKdrTargets() {
    const age = this.state.ageGroup;
    const gender = this.state.gender;
    const act = this.state.activity;

    // Base EER Calories lookup
    let baseCalories = 2000;
    if (age === '1-2') baseCalories = 900;
    else if (age === '3-5') baseCalories = 1400;
    else if (age === '6-8') baseCalories = gender === 'male' ? 1700 : 1500;
    else if (age === '9-11') baseCalories = gender === 'male' ? 2000 : 1800;
    else if (age === '12-14') baseCalories = gender === 'male' ? 2500 : 2000;
    else if (age === '15-18') baseCalories = gender === 'male' ? 2700 : 2000;
    else if (age === '19-29') baseCalories = gender === 'male' ? 2600 : 2000;
    else if (age === '30-49') baseCalories = gender === 'male' ? 2500 : 1900;
    else if (age === '50-64') baseCalories = gender === 'male' ? 2200 : 1700;
    else if (age === '65-74') baseCalories = gender === 'male' ? 2000 : 1600;
    else if (age === '75+') baseCalories = gender === 'male' ? 1700 : 1500;

    // Activity Multiplier
    let actMultiplier = 1.0;
    if (act === 'sedentary') actMultiplier = 0.9;
    else if (act === 'active') actMultiplier = 1.15;

    const targetKcal = Math.round(baseCalories * actMultiplier);

    // Carbs target: 60% of total calories (1g = 4 kcal)
    const targetCarbs = Math.round((targetKcal * 0.60) / 4);

    // Protein target: KDRI exact values
    let targetProtein = 55;
    if (age === '1-2') targetProtein = 20;
    else if (age === '3-5') targetProtein = 25;
    else if (age === '6-8') targetProtein = 35;
    else if (age === '9-11') targetProtein = gender === 'male' ? 50 : 45;
    else if (age === '12-14') targetProtein = gender === 'male' ? 60 : 55;
    else if (age === '15-18') targetProtein = gender === 'male' ? 65 : 55;
    else if (age === '19-29') targetProtein = gender === 'male' ? 65 : 55;
    else if (age === '30-49') targetProtein = gender === 'male' ? 65 : 50;
    else if (age === '50-64') targetProtein = gender === 'male' ? 65 : 50;
    else if (age === '65-74' || age === '75+') targetProtein = gender === 'male' ? 60 : 50;

    // Active people get 5g more protein
    if (act === 'active') {
      targetProtein += 5;
    }

    // Fat target: 25% of total calories (1g = 9 kcal)
    const targetFat = Math.round((targetKcal * 0.25) / 9);

    // Sodium maximum limit target (KDRIs max or reference limit)
    let targetSodium = 2000;
    if (age === '1-2') targetSodium = 810;
    else if (age === '3-5') targetSodium = 1000;
    else if (age === '6-8') targetSodium = 1200;
    else if (age === '9-11') targetSodium = 1500;

    return {
      kcal: targetKcal,
      carbs: targetCarbs,
      protein: targetProtein,
      fat: targetFat,
      sodium: targetSodium
    };
  },

  updateDailyIntakeTargets() {
    const targets = this.getKdrTargets();
    
    // Update labels
    this.lblTargetKcalEl.textContent = formatCommas(targets.kcal);
    this.lblDiaryTargetKcalEl.textContent = formatCommas(targets.kcal);

    // Macros limits
    this.targetCarbsEl.textContent = targets.carbs;
    this.targetProteinEl.textContent = targets.protein;
    this.targetFatEl.textContent = targets.fat;
    this.targetSodiumEl.textContent = formatCommas(targets.sodium);

    // Logger panel limits
    this.lblDiaryTargetCarbsEl.textContent = targets.carbs;
    this.lblDiaryTargetProteinEl.textContent = targets.protein;
    this.lblDiaryTargetFatEl.textContent = targets.fat;
    this.lblDiaryTargetSodiumEl.textContent = formatCommas(targets.sodium);
  },

  calculateScannedFoodNutrition() {
    const food = FOOD_DB.find(item => item.id === this.state.selectedFoodId) || FOOD_DB[0];
    const mult = this.state.multiplier;
    const targets = this.getKdrTargets();

    // Multiply food nutrients
    const kcal = Math.round(food.kcal * mult);
    const carbs = parseFloat((food.carbs * mult).toFixed(1));
    const protein = parseFloat((food.protein * mult).toFixed(1));
    const fat = parseFloat((food.fat * mult).toFixed(1));
    const sodium = Math.round(food.sodium * mult);

    // Update food details labels
    this.lblScannedFoodNameEl.textContent = `${food.emoji} ${food.name}`;
    this.lblScannedFoodServingEl.textContent = `(${mult.toFixed(1)}인분 기준)`;

    // Calorie ring & percent
    this.lblFoodKcalEl.innerHTML = `${formatCommas(kcal)}<span class="kcal-lbl"> kcal</span>`;
    const kcalPct = (kcal / targets.kcal) * 100;
    this.lblKcalPctEl.textContent = `${kcalPct.toFixed(1)}%`;

    // Circular SVG offset
    const maxOffset = 471.24; // 2 * pi * r(75) = 471.24
    let offset = maxOffset - (Math.min(kcalPct, 100) / 100) * maxOffset;
    if (kcalPct > 100) offset = 0;
    this.gaugeProgressEl.style.strokeDashoffset = offset;

    // Warning badges logic
    this.badgeHighSodiumEl.style.display = 'none';
    this.badgeHighFatEl.style.display = 'none';
    this.badgeHealthyEl.style.display = 'none';

    const sodiumPct = (sodium / targets.sodium) * 100;
    const fatPct = (fat / targets.fat) * 100;

    let hasWarning = false;
    if (sodiumPct >= 50) {
      this.badgeHighSodiumEl.style.display = 'inline-block';
      hasWarning = true;
    }
    if (fatPct >= 40) {
      this.badgeHighFatEl.style.display = 'inline-block';
      hasWarning = true;
    }
    if (!hasWarning && kcalPct < 35 && sodiumPct < 30) {
      this.badgeHealthyEl.style.display = 'inline-block';
    }

    // Set progress bars values and percentages
    const updateBar = (valEl, pctEl, barEl, value, target, type) => {
      valEl.textContent = value;
      const pct = (value / target) * 100;
      pctEl.textContent = `${pct.toFixed(1)}%`;
      barEl.style.width = `${Math.min(pct, 100)}%`;
    };

    updateBar(this.valCarbsEl, this.pctCarbsEl, this.barCarbsEl, carbs, targets.carbs);
    updateBar(this.valProteinEl, this.pctProteinEl, this.barProteinEl, protein, targets.protein);
    updateBar(this.valFatEl, this.pctFatEl, this.barFatEl, fat, targets.fat);
    updateBar(this.valSodiumEl, this.pctSodiumEl, this.barSodiumEl, sodium, targets.sodium);

    // Calculate burn times (reusing METs, default weight: male 75kg, female 60kg)
    const weight = this.state.gender === 'male' ? 75 : 60;
    const calcMinutes = (mets) => {
      // Calories = METs * 3.5 * Weight * Duration / 200
      // Duration = (Calories * 200) / (METs * 3.5 * Weight)
      const dur = (kcal * 200) / (mets * 3.5 * weight);
      return Math.round(dur);
    };

    this.burnJoggingEl.textContent = `${calcMinutes(8.0)}분`;
    this.burnWalkingEl.textContent = `${calcMinutes(3.5)}분`;
    this.burnSwimmingEl.textContent = `${calcMinutes(6.0)}분`;
    this.burnCyclingEl.textContent = `${calcMinutes(5.5)}분`;
  },

  logCurrentMeal() {
    const food = FOOD_DB.find(item => item.id === this.state.selectedFoodId) || FOOD_DB[0];
    const mult = this.state.multiplier;

    const meal = {
      id: Date.now().toString(),
      foodId: food.id,
      name: food.name,
      emoji: food.emoji,
      multiplier: mult,
      kcal: Math.round(food.kcal * mult),
      carbs: parseFloat((food.carbs * mult).toFixed(1)),
      protein: parseFloat((food.protein * mult).toFixed(1)),
      fat: parseFloat((food.fat * mult).toFixed(1)),
      sodium: Math.round(food.sodium * mult)
    };

    SoundEngine.play('success');
    this.state.diary.push(meal);
    this.saveDiaryToStorage();
    this.renderDiary();

    // Scroll smooth to diary panel
    document.getElementById('diary-container').scrollIntoView({ behavior: 'smooth' });
  },

  deleteDiaryItem(id) {
    SoundEngine.play('delete');
    this.state.diary = this.state.diary.filter(item => item.id !== id);
    this.saveDiaryToStorage();
    this.renderDiary();
  },

  renderDiary() {
    const targets = this.getKdrTargets();
    
    // Clear table rows
    this.diaryTableBodyEl.innerHTML = '';

    if (this.state.diary.length === 0) {
      this.diaryEmptyMsgEl.style.display = 'block';
    } else {
      this.diaryEmptyMsgEl.style.display = 'none';

      this.state.diary.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="food-title-col">${item.emoji} ${item.name}</td>
          <td>${item.multiplier.toFixed(1)}인분</td>
          <td class="val-col" style="font-weight:700;">${formatCommas(item.kcal)} kcal</td>
          <td class="val-col">${item.carbs} g</td>
          <td class="val-col">${item.protein} g</td>
          <td class="val-col">${item.fat} g</td>
          <td class="val-col">${formatCommas(item.sodium)} mg</td>
          <td style="text-align:center;">
            <button class="btn-delete-row" data-id="${item.id}">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        `;

        // Bind delete action
        const btnDelete = tr.querySelector('.btn-delete-row');
        btnDelete.addEventListener('click', () => {
          this.deleteDiaryItem(item.id);
        });

        this.diaryTableBodyEl.appendChild(tr);
      });
    }

    // Cumulative totals
    let totalKcal = 0;
    let totalCarbs = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalSodium = 0;

    this.state.diary.forEach(item => {
      totalKcal += item.kcal;
      totalCarbs += item.carbs;
      totalProtein += item.protein;
      totalFat += item.fat;
      totalSodium += item.sodium;
    });

    // Rounding
    totalCarbs = parseFloat(totalCarbs.toFixed(1));
    totalProtein = parseFloat(totalProtein.toFixed(1));
    totalFat = parseFloat(totalFat.toFixed(1));

    // Update cumulative labels
    this.lblDiaryTotalKcalEl.textContent = formatCommas(totalKcal);
    const totalKcalPct = (totalKcal / targets.kcal) * 100;
    this.lblDiaryTotalPctEl.textContent = `${totalKcalPct.toFixed(1)}%`;
    this.lblDiaryRemainKcalEl.textContent = formatCommas(Math.max(targets.kcal - totalKcal, 0));

    // Circular progress indicator (r=42, circumference=263.89)
    const maxOffset = 263.89;
    let offset = maxOffset - (Math.min(totalKcalPct, 100) / 100) * maxOffset;
    if (totalKcalPct > 100) offset = 0;
    this.diaryCalProgressEl.style.strokeDashoffset = offset;

    // Macro details boxes update
    const updateDiaryBox = (lblEl, barEl, value, target) => {
      lblEl.textContent = `${value}g`;
      const pct = (value / target) * 100;
      barEl.style.width = `${Math.min(pct, 100)}%`;
    };

    updateDiaryBox(this.lblDiaryCarbsEl, this.barDiaryCarbsEl, totalCarbs, targets.carbs);
    updateDiaryBox(this.lblDiaryProteinEl, this.barDiaryProteinEl, totalProtein, targets.protein);
    updateDiaryBox(this.lblDiaryFatEl, this.barDiaryFatEl, totalFat, targets.fat);
    
    // Sodium special formatting (mg instead of g)
    this.lblDiarySodiumEl.textContent = `${formatCommas(totalSodium)}mg`;
    const sodiumPct = (totalSodium / targets.sodium) * 100;
    this.barDiarySodiumEl.style.width = `${Math.min(sodiumPct, 100)}%`;
  },

  updateScrollProgress() {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    let scrolled = 0;
    if (height > 0) {
      scrolled = (winScroll / height) * 100;
    }
    
    const roundedScrolled = Math.round(scrolled);
    this.scrollPercentageLblEl.textContent = `${roundedScrolled}%`;

    // SVG indicator (r=20, circumference=125.66)
    const maxOffset = 125.66;
    const strokeOffset = maxOffset - (scrolled / 100) * maxOffset;
    this.progressCircleIndicatorEl.style.strokeDashoffset = strokeOffset;
  }
};

// HELPER UTILITIES
function formatCommas(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getMockImageCode(foodId) {
  // Returns unsplash image codes corresponding to foods for nice UI previews
  const imageMap = {
    bibimbap: '1541832676-c276f7f262db',
    pizza: '1513104890138-7c749659a591',
    salad: '1540420773420-3366772f4999',
    burger: '1568901346375-23c9450c58cd',
    tteokbokki: '1617470703128-26a0fc9af10f',
  };
  return imageMap[foodId] || '1498837167922-ddd27525d352';
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
