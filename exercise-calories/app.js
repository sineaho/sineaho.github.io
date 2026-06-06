/**
 * CineAHO Exercise Calories Burned Calculator App Engine
 * 100% Client-side METs (Metabolic Equivalent) Calculations & Render
 */

// Exercise Activity Database
const EXERCISE_DB = [
  { id: 'stretching', name: '스트레칭', mets: 2.3, intensity: 'low', icon: 'fa-person-stretching' },
  { id: 'yoga', name: '요가', mets: 2.5, intensity: 'low', icon: 'fa-spa' },
  { id: 'pilates', name: '필라테스', mets: 3.0, intensity: 'low', icon: 'fa-person-half-dress' },
  { id: 'walking', name: '걷기 (산책)', mets: 3.5, intensity: 'low', icon: 'fa-person-walking' },
  
  { id: 'badminton', name: '배드민턴', mets: 4.5, intensity: 'moderate', icon: 'fa-feather' },
  { id: 'cycling-normal', name: '자전거 (보통)', mets: 5.5, intensity: 'moderate', icon: 'fa-bicycle' },
  { id: 'swimming', name: '수영 (자유형)', mets: 6.0, intensity: 'moderate', icon: 'fa-person-swimming' },
  { id: 'aerobic', name: '에어로빅/댄스', mets: 6.0, intensity: 'moderate', icon: 'fa-music' },
  { id: 'gym-weight', name: '헬스/웨이트', mets: 6.0, intensity: 'moderate', icon: 'fa-dumbbell' },
  
  { id: 'hiking', name: '등산', mets: 7.0, intensity: 'high', icon: 'fa-mountain' },
  { id: 'tennis', name: '테니스/스쿼시', mets: 7.0, intensity: 'high', icon: 'fa-table-tennis-paddle-ball' },
  { id: 'football', name: '축구/농구', mets: 7.0, intensity: 'high', icon: 'fa-football' },
  { id: 'cycling-fast', name: '자전거 (빠르게)', mets: 7.5, intensity: 'high', icon: 'fa-bicycle' },
  { id: 'jogging', name: '조깅/러닝', mets: 8.0, intensity: 'high', icon: 'fa-person-running' },
  { id: 'rope-skipping', name: '줄넘기', mets: 9.0, intensity: 'high', icon: 'fa-child-reaching' },
  { id: 'boxing', name: '복싱', mets: 9.0, intensity: 'high', icon: 'fa-hand-fist' },
  { id: 'taekwondo', name: '태권도/합기도', mets: 10.0, intensity: 'high', icon: 'fa-khanda' }
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
        osc.frequency.setValueAtTime(650, t);
        gainNode.gain.setValueAtTime(baseGain * 0.4, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
        break;
      case 'success':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, t);
        osc.frequency.exponentialRampToValueAtTime(1040, t + 0.15);
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
    weight: 70,             // kg
    duration: 30,           // min
    selectedExerciseId: 'jogging' // default: 조깅/러닝
  },

  // DOM Elements
  sliderWeightEl: null,
  sliderDurationEl: null,
  txtWeightEl: null,
  txtDurationEl: null,
  quickWeightBtnsEl: null,
  quickDurationBtnsEl: null,
  btnResetEl: null,
  btnCopyEl: null,

  // Outputs
  txtSelectedExerciseNameEl: null,
  txtSelectedExerciseDurationEl: null,
  resultCaloriesEl: null,
  statMetsValEl: null,
  statMetsLevelEl: null,
  statFatValEl: null,
  statRiceValEl: null,
  txtWeightLossProjEl: null,

  // Food Substitutions
  foodRiceEl: null,
  foodBananaEl: null,
  foodMilkEl: null,
  foodChocolateEl: null,
  foodSodaEl: null,
  foodCoffeeEl: null,
  foodSojuEl: null,
  foodBeerEl: null,

  // Grid Containers
  gridLowEl: null,
  gridModerateEl: null,
  gridHighEl: null,

  // Table
  tblHeaderWeightEl: null,
  tblHeaderDurationEl: null,
  tblColDurationValEl: null,
  caloriesTableBodyEl: null,

  // Floating controls
  scrollProgressRingEl: null,
  progressCircleIndicatorEl: null,
  scrollPercentageLblEl: null,
  btnScrollTopEl: null,
  btnScrollBottomEl: null,

  init() {
    // Inputs
    this.sliderWeightEl = document.getElementById('slider-weight');
    this.sliderDurationEl = document.getElementById('slider-duration');
    this.txtWeightEl = document.getElementById('txt-weight');
    this.txtDurationEl = document.getElementById('txt-duration');
    this.quickWeightBtnsEl = document.querySelectorAll('#quick-weight-buttons .qs-btn');
    this.quickDurationBtnsEl = document.querySelectorAll('#quick-duration-buttons .qs-btn');
    this.btnResetEl = document.getElementById('btn-reset-inputs');
    this.btnCopyEl = document.getElementById('btn-copy-result');

    // Outputs
    this.txtSelectedExerciseNameEl = document.getElementById('txt-selected-exercise-name');
    this.txtSelectedExerciseDurationEl = document.getElementById('txt-selected-exercise-duration');
    this.resultCaloriesEl = document.getElementById('result-calories');
    this.statMetsValEl = document.getElementById('stat-mets-val');
    this.statMetsLevelEl = document.getElementById('stat-mets-level');
    this.statFatValEl = document.getElementById('stat-fat-val');
    this.statRiceValEl = document.getElementById('stat-rice-val');
    this.txtWeightLossProjEl = document.getElementById('txt-weight-loss-proj');

    // Food
    this.foodRiceEl = document.getElementById('food-rice');
    this.foodBananaEl = document.getElementById('food-banana');
    this.foodMilkEl = document.getElementById('food-milk');
    this.foodChocolateEl = document.getElementById('food-chocolate');
    this.foodSodaEl = document.getElementById('food-soda');
    this.foodCoffeeEl = document.getElementById('food-coffee');
    this.foodSojuEl = document.getElementById('food-soju');
    this.foodBeerEl = document.getElementById('food-beer');

    // Grid Containers
    this.gridLowEl = document.getElementById('grid-low-intensity');
    this.gridModerateEl = document.getElementById('grid-moderate-intensity');
    this.gridHighEl = document.getElementById('grid-high-intensity');

    // Table
    this.tblHeaderWeightEl = document.getElementById('tbl-header-weight');
    this.tblHeaderDurationEl = document.getElementById('tbl-header-duration');
    this.tblColDurationValEl = document.getElementById('tbl-col-duration-val');
    this.caloriesTableBodyEl = document.querySelector('#comparison-calories-table tbody');

    // Floating controls
    this.scrollProgressRingEl = document.getElementById('scroll-progress-ring');
    this.progressCircleIndicatorEl = document.getElementById('progress-circle-indicator');
    this.scrollPercentageLblEl = document.getElementById('scroll-percentage-lbl');
    this.btnScrollTopEl = document.getElementById('btn-scroll-top');
    this.btnScrollBottomEl = document.getElementById('btn-scroll-bottom');

    this.renderExerciseGrids();
    this.bindEvents();
    this.calculate();
    this.updateScrollProgress();
  },

  renderExerciseGrids() {
    // Empty grids
    this.gridLowEl.innerHTML = '';
    this.gridModerateEl.innerHTML = '';
    this.gridHighEl.innerHTML = '';

    EXERCISE_DB.forEach(ex => {
      const btn = document.createElement('button');
      btn.className = `ex-btn ${ex.id === this.state.selectedExerciseId ? 'active' : ''} intensity-${ex.intensity}`;
      btn.setAttribute('data-id', ex.id);
      btn.innerHTML = `
        <i class="fa-solid ${ex.icon} ex-icon"></i>
        <span>${ex.name}</span>
        <span class="ex-mets-desc">${ex.mets.toFixed(1)} METs</span>
      `;

      btn.addEventListener('click', () => {
        SoundEngine.play('click');
        this.state.selectedExerciseId = ex.id;
        this.updateActiveExerciseButtonState();
        this.calculate();
      });

      if (ex.intensity === 'low') {
        this.gridLowEl.appendChild(btn);
      } else if (ex.intensity === 'moderate') {
        this.gridModerateEl.appendChild(btn);
      } else if (ex.intensity === 'high') {
        this.gridHighEl.appendChild(btn);
      }
    });
  },

  updateActiveExerciseButtonState() {
    const btns = document.querySelectorAll('.ex-btn');
    btns.forEach(btn => {
      const id = btn.getAttribute('data-id');
      if (id === this.state.selectedExerciseId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  },

  bindEvents() {
    // Sliders
    this.sliderWeightEl.addEventListener('input', (e) => {
      this.state.weight = parseInt(e.target.value, 10);
      this.txtWeightEl.textContent = this.state.weight;
      this.updateQuickButtons('weight', this.state.weight);
      this.calculate();
    });

    this.sliderDurationEl.addEventListener('input', (e) => {
      this.state.duration = parseInt(e.target.value, 10);
      this.txtDurationEl.textContent = this.state.duration;
      this.updateQuickButtons('duration', this.state.duration);
      this.calculate();
    });

    // Quick Buttons
    this.quickWeightBtnsEl.forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.play('click');
        const val = parseInt(btn.getAttribute('data-val'), 10);
        this.state.weight = val;
        this.sliderWeightEl.value = val;
        this.txtWeightEl.textContent = val;
        this.updateQuickButtons('weight', val);
        this.calculate();
      });
    });

    this.quickDurationBtnsEl.forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.play('click');
        const val = parseInt(btn.getAttribute('data-val'), 10);
        this.state.duration = val;
        this.sliderDurationEl.value = val;
        this.txtDurationEl.textContent = val;
        this.updateQuickButtons('duration', val);
        this.calculate();
      });
    });

    // Reset Inputs
    this.btnResetEl.addEventListener('click', () => {
      SoundEngine.play('success');
      this.state.weight = 70;
      this.state.duration = 30;
      this.state.selectedExerciseId = 'jogging';

      this.sliderWeightEl.value = 70;
      this.txtWeightEl.textContent = 70;
      this.sliderDurationEl.value = 30;
      this.txtDurationEl.textContent = 30;

      this.updateQuickButtons('weight', 70);
      this.updateQuickButtons('duration', 30);
      this.updateActiveExerciseButtonState();
      this.calculate();
    });

    // Copy Result
    this.btnCopyEl.addEventListener('click', () => {
      this.copyResult();
    });

    // Scroll Control
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

  updateQuickButtons(type, value) {
    const list = type === 'weight' ? this.quickWeightBtnsEl : this.quickDurationBtnsEl;
    list.forEach(btn => {
      const val = parseInt(btn.getAttribute('data-val'), 10);
      if (val === value) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  },

  calculate() {
    const w = this.state.weight;
    const d = this.state.duration;
    
    // Find active exercise
    const ex = EXERCISE_DB.find(item => item.id === this.state.selectedExerciseId);
    if (!ex) return;

    // Formula: METs * 3.5 * Weight (kg) * Duration (min) / 200
    const kcal = ex.mets * 3.5 * w * d / 200;
    const roundedKcal = Math.round(kcal);

    // Update main text displays
    this.txtSelectedExerciseNameEl.textContent = ex.name;
    this.txtSelectedExerciseDurationEl.textContent = `(${d}분)`;
    this.resultCaloriesEl.innerHTML = `${roundedKcal}<span class="unit">kcal</span>`;

    // METs sub-box
    this.statMetsValEl.textContent = ex.mets.toFixed(1);
    let levelText = '';
    if (ex.intensity === 'low') levelText = '저강도 운동';
    else if (ex.intensity === 'moderate') levelText = '중강도 운동';
    else if (ex.intensity === 'high') levelText = '고강도 운동';
    this.statMetsLevelEl.textContent = levelText;

    // Fat burn sub-box: 1g fat tissue = ~7.7 kcal (or 9 kcal. In body fat weight loss, 7700 kcal burns 1kg of fat tissue, so we use 7.7 kcal/g)
    const fatBurn = kcal / 7.7;
    this.statFatValEl.textContent = `${fatBurn.toFixed(1)}g`;

    // Rice bowl sub-box: 1 bowl = 300 kcal
    const riceBowls = kcal / 300;
    this.statRiceValEl.textContent = `${riceBowls.toFixed(1)}공기`;

    // Weight loss projection: days to lose 1kg fat (7,700 kcal)
    const daysTo1kg = 7700 / kcal;
    const roundedDays = Math.round(daysTo1kg);
    this.txtWeightLossProjEl.innerHTML = `이 운동을 매일 수행한다면, 약 <strong>${roundedDays}일</strong> 후 체지방 1kg(7,700kcal) 감량이 가능합니다!`;

    // Food substitutions
    this.foodRiceEl.textContent = `${riceBowls.toFixed(1)}공기`;
    this.foodBananaEl.textContent = `${(kcal / 100).toFixed(1)}개`;
    this.foodMilkEl.textContent = `${(kcal / 120).toFixed(1)}잔`;
    this.foodChocolateEl.textContent = `${(kcal / 250).toFixed(1)}개`;
    this.foodSodaEl.textContent = `${(kcal / 140).toFixed(1)}캔`;
    this.foodCoffeeEl.textContent = `${(kcal / 10).toFixed(1)}잔`;
    this.foodSojuEl.textContent = `${(kcal / 400).toFixed(1)}병`;
    this.foodBeerEl.textContent = `${(kcal / 150).toFixed(1)}잔`;

    // Render Dynamic Comparison Table
    this.renderComparisonTable(w, d);
  },

  renderComparisonTable(weight, duration) {
    this.tblHeaderWeightEl.textContent = weight;
    this.tblHeaderDurationEl.textContent = duration;
    this.tblColDurationValEl.textContent = `${duration}분 소모량`;

    this.caloriesTableBodyEl.innerHTML = '';

    EXERCISE_DB.forEach(ex => {
      // Calories for user duration
      const cDuration = ex.mets * 3.5 * weight * duration / 200;
      // Calories for 60min
      const c60 = ex.mets * 3.5 * weight * 60 / 200;

      const tr = document.createElement('tr');
      if (ex.id === this.state.selectedExerciseId) {
        tr.className = 'active-row';
      }

      let badgeClass = '';
      let badgeLabel = '';
      if (ex.intensity === 'low') {
        badgeClass = 'intensity-low';
        badgeLabel = '저강도';
      } else if (ex.intensity === 'moderate') {
        badgeClass = 'intensity-moderate';
        badgeLabel = '중강도';
      } else if (ex.intensity === 'high') {
        badgeClass = 'intensity-high';
        badgeLabel = '고강도';
      }

      tr.innerHTML = `
        <td><i class="fa-solid ${ex.icon}" style="margin-right: 8px; opacity: 0.85;"></i> ${ex.name}</td>
        <td style="font-family: 'Outfit', sans-serif;">${ex.mets.toFixed(1)}</td>
        <td style="font-family: 'Outfit', sans-serif; font-weight: 700; color: var(--brand-orange);">${Math.round(cDuration)} kcal</td>
        <td style="font-family: 'Outfit', sans-serif; opacity: 0.85;">${Math.round(c60)} kcal</td>
        <td><span class="badge-pill ${badgeClass}">${badgeLabel}</span></td>
      `;

      // Allow row clicking to select exercise!
      tr.style.cursor = 'pointer';
      tr.addEventListener('click', () => {
        SoundEngine.play('click');
        this.state.selectedExerciseId = ex.id;
        this.updateActiveExerciseButtonState();
        this.calculate();
      });

      this.caloriesTableBodyEl.appendChild(tr);
    });
  },

  copyResult() {
    const w = this.state.weight;
    const d = this.state.duration;
    const ex = EXERCISE_DB.find(item => item.id === this.state.selectedExerciseId);
    if (!ex) return;

    const kcal = ex.mets * 3.5 * w * d / 200;
    const roundedKcal = Math.round(kcal);
    const fatG = (kcal / 7.7).toFixed(1);
    const riceB = (kcal / 300).toFixed(1);
    const banana = (kcal / 100).toFixed(1);
    const soju = (kcal / 400).toFixed(1);
    const beer = (kcal / 150).toFixed(1);
    const days = Math.round(7700 / kcal);

    const summaryText = `[CineAHO 운동 칼로리 소모 분석 결과]
- 본인 체중: ${w} kg
- 선택 운동: ${ex.name} (${ex.mets.toFixed(1)} METs)
- 진행 시간: ${d} 분
- 소모 칼로리: ${roundedKcal} kcal
- 환산 지방 소모량: ${fatG} g
- 밥 공기 환산: ${riceB} 공기
- 기타 푸드 대치: 바나나 ${banana}개 / 소주 ${soju}병 / 맥주 ${beer}잔
- 체중 감량 예측: 매일 이 운동 수행 시, 약 ${days}일 후 체지방 1kg 감량 가능!

* 본 결과는 통계적 모델에 기초한 참고용 수치입니다. 규칙적인 운동과 영양 조절로 즐겁고 건강한 다이어트를 완성하세요!`;

    navigator.clipboard.writeText(summaryText)
      .then(() => {
        SoundEngine.play('success');
        alert("운동 칼로리 분석 결과가 클립보드에 복사되었습니다!\n원하는 곳에 붙여넣어(Ctrl+V) 사용하세요.");
      })
      .catch(err => {
        console.error("복사 실패: ", err);
        alert("결과 복사에 실패했습니다. 수동으로 복사해 주세요.");
      });
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

    // SVG dashoffset adjustment (circumference = 125.66)
    const maxOffset = 125.66;
    const strokeOffset = maxOffset - (scrolled / 100) * maxOffset;
    this.progressCircleIndicatorEl.style.strokeDashoffset = strokeOffset;
  }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
