/**
 * CineAHO Premium Macros Calculator App Engine
 * 100% Client-side Medical & Fitness Standard Calculation
 */

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
        osc.frequency.setValueAtTime(900, t);
        gainNode.gain.setValueAtTime(baseGain * 0.4, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
        break;
      case 'success':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(550, t);
        osc.frequency.exponentialRampToValueAtTime(1050, t + 0.15);
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
    customMode: false,
    preset: 'balanced', // balanced, muscle, low-carb, keto, high-protein, endurance
    calories: 2000,     // kcal
    weight: 70,         // kg
    carbRatio: 50,      // %
    proteinRatio: 20,   // %
    fatRatio: 30        // %
  },

  // Presets mapping
  presets: {
    'balanced': [50, 20, 30],
    'muscle': [40, 40, 20],
    'low-carb': [30, 35, 35],
    'keto': [5, 25, 70],
    'high-protein': [35, 45, 20],
    'endurance': [60, 15, 25]
  },

  // DOM Elements - Inputs
  chkCustomModeEl: null,
  presetCardsEl: null,
  presetContainerEl: null,
  sliderCaloriesEl: null,
  sliderWeightEl: null,
  txtCaloriesEl: null,
  txtWeightEl: null,
  quickCaloriesBtnsEl: null,
  quickWeightBtnsEl: null,
  btnResetInputsEl: null,
  btnCopyResultEl: null,

  // DOM Elements - Custom sliders
  customSlidersPanelEl: null,
  sliderCarbRatioEl: null,
  sliderProteinRatioEl: null,
  sliderFatRatioEl: null,
  lblCarbRatioEl: null,
  lblProteinRatioEl: null,
  lblFatRatioEl: null,
  txtRatioSumEl: null,

  // DOM Elements - Outputs
  resultHeaderTitleEl: null,
  barSegCarbEl: null,
  barSegProteinEl: null,
  barSegFatEl: null,

  cardCarbPercentEl: null,
  cardCarbGramsEl: null,
  cardCarbKcalEl: null,

  cardProteinPercentEl: null,
  cardProteinGramsEl: null,
  cardProteinKcalEl: null,

  cardFatPercentEl: null,
  cardFatGramsEl: null,
  cardFatKcalEl: null,

  lblProteinRatioValEl: null,
  badgeProteinEvalEl: null,

  // Food Examples
  foodTitleCarbEl: null,
  foodTitleProteinEl: null,
  foodTitleFatEl: null,

  foodRiceEl: null,
  foodPotatoEl: null,
  foodBananaEl: null,
  foodBreadEl: null,
  foodOatmealEl: null,

  foodChickenEl: null,
  foodEggEl: null,
  foodTofuEl: null,
  foodSalmonEl: null,
  foodMilkEl: null,

  foodAvocadoEl: null,
  foodAlmondEl: null,
  foodOliveEl: null,
  foodCheeseEl: null,
  foodPorkEl: null,

  // Table rows for presets
  tableRowsEl: {},

  // Floating controls
  scrollProgressRingEl: null,
  progressCircleIndicatorEl: null,
  scrollPercentageLblEl: null,
  btnScrollTopEl: null,
  btnScrollBottomEl: null,

  init() {
    // Inputs
    this.chkCustomModeEl = document.getElementById('chk-custom-mode');
    this.presetContainerEl = document.getElementById('preset-cards-container');
    this.presetCardsEl = document.querySelectorAll('.preset-card');
    this.sliderCaloriesEl = document.getElementById('slider-calories');
    this.sliderWeightEl = document.getElementById('slider-weight');
    this.txtCaloriesEl = document.getElementById('txt-calories');
    this.txtWeightEl = document.getElementById('txt-weight');
    this.quickCaloriesBtnsEl = document.querySelectorAll('#quick-calories-container .inner-btn');
    this.quickWeightBtnsEl = document.querySelectorAll('#quick-weight-container .inner-btn');
    this.btnResetInputsEl = document.getElementById('btn-reset-inputs');
    this.btnCopyResultEl = document.getElementById('btn-copy-result');

    // Custom Ratio sliders
    this.customSlidersPanelEl = document.getElementById('custom-ratio-sliders');
    this.sliderCarbRatioEl = document.getElementById('slider-carb-ratio');
    this.sliderProteinRatioEl = document.getElementById('slider-protein-ratio');
    this.sliderFatRatioEl = document.getElementById('slider-fat-ratio');
    this.lblCarbRatioEl = document.getElementById('lbl-carb-ratio');
    this.lblProteinRatioEl = document.getElementById('lbl-protein-ratio');
    this.lblFatRatioEl = document.getElementById('lbl-fat-ratio');
    this.txtRatioSumEl = document.getElementById('txt-ratio-sum');

    // Outputs
    this.resultHeaderTitleEl = document.getElementById('result-header-title');
    this.barSegCarbEl = document.getElementById('bar-seg-carb');
    this.barSegProteinEl = document.getElementById('bar-seg-protein');
    this.barSegFatEl = document.getElementById('bar-seg-fat');

    this.cardCarbPercentEl = document.getElementById('card-carb-percent');
    this.cardCarbGramsEl = document.getElementById('card-carb-grams');
    this.cardCarbKcalEl = document.getElementById('card-carb-kcal');

    this.cardProteinPercentEl = document.getElementById('card-protein-percent');
    this.cardProteinGramsEl = document.getElementById('card-protein-grams');
    this.cardProteinKcalEl = document.getElementById('card-protein-kcal');

    this.cardFatPercentEl = document.getElementById('card-fat-percent');
    this.cardFatGramsEl = document.getElementById('card-fat-grams');
    this.cardFatKcalEl = document.getElementById('card-fat-kcal');

    this.lblProteinRatioValEl = document.getElementById('lbl-protein-ratio-val');
    this.badgeProteinEvalEl = document.getElementById('badge-protein-eval');

    // Food Examples titles
    this.foodTitleCarbEl = document.getElementById('food-target-title-carb');
    this.foodTitleProteinEl = document.getElementById('food-target-title-protein');
    this.foodTitleFatEl = document.getElementById('food-target-title-fat');

    // Food Examples items
    this.foodRiceEl = document.getElementById('food-amount-rice');
    this.foodPotatoEl = document.getElementById('food-amount-potato');
    this.foodBananaEl = document.getElementById('food-amount-banana');
    this.foodBreadEl = document.getElementById('food-amount-bread');
    this.foodOatmealEl = document.getElementById('food-amount-oatmeal');

    this.foodChickenEl = document.getElementById('food-amount-chicken');
    this.foodEggEl = document.getElementById('food-amount-egg');
    this.foodTofuEl = document.getElementById('food-amount-tofu');
    this.foodSalmonEl = document.getElementById('food-amount-salmon');
    this.foodMilkEl = document.getElementById('food-amount-milk');

    this.foodAvocadoEl = document.getElementById('food-amount-avocado');
    this.foodAlmondEl = document.getElementById('food-amount-almond');
    this.foodOliveEl = document.getElementById('food-amount-olive');
    this.foodCheeseEl = document.getElementById('food-amount-cheese');
    this.foodPorkEl = document.getElementById('food-amount-pork');

    // Table rows
    this.tableRowsEl['balanced'] = document.getElementById('tbl-row-balanced');
    this.tableRowsEl['muscle'] = document.getElementById('tbl-row-muscle');
    this.tableRowsEl['low-carb'] = document.getElementById('tbl-row-low-carb');
    this.tableRowsEl['keto'] = document.getElementById('tbl-row-keto');
    this.tableRowsEl['high-protein'] = document.getElementById('tbl-row-high-protein');
    this.tableRowsEl['endurance'] = document.getElementById('tbl-row-endurance');

    // Floating UI
    this.scrollProgressRingEl = document.getElementById('scroll-progress-ring');
    this.progressCircleIndicatorEl = document.getElementById('progress-circle-indicator');
    this.scrollPercentageLblEl = document.getElementById('scroll-percentage-lbl');
    this.btnScrollTopEl = document.getElementById('btn-scroll-top');
    this.btnScrollBottomEl = document.getElementById('btn-scroll-bottom');

    this.bindEvents();
    this.calculateMacros();
    this.updateScrollProgress();
  },

  bindEvents() {
    // Custom Mode Toggle
    this.chkCustomModeEl.addEventListener('change', (e) => {
      SoundEngine.play('click');
      this.state.customMode = e.target.checked;
      
      if (this.state.customMode) {
        this.presetContainerEl.classList.add('disabled-state');
        this.customSlidersPanelEl.style.display = 'flex';
        // Sync sliders to current state ratios
        this.sliderCarbRatioEl.value = this.state.carbRatio;
        this.sliderProteinRatioEl.value = this.state.proteinRatio;
        this.sliderFatRatioEl.value = this.state.fatRatio;
        
        this.lblCarbRatioEl.textContent = `${this.state.carbRatio}%`;
        this.lblProteinRatioEl.textContent = `${this.state.proteinRatio}%`;
        this.lblFatRatioEl.textContent = `${this.state.fatRatio}%`;
      } else {
        this.presetContainerEl.classList.remove('disabled-state');
        this.customSlidersPanelEl.style.display = 'none';
        
        // Reset to active preset ratios
        const ratios = this.presets[this.state.preset];
        this.state.carbRatio = ratios[0];
        this.state.proteinRatio = ratios[1];
        this.state.fatRatio = ratios[2];
      }
      this.calculateMacros();
    });

    // Preset Selection
    this.presetCardsEl.forEach(card => {
      card.addEventListener('click', () => {
        if (this.state.customMode) return;
        SoundEngine.play('click');
        
        const presetName = card.getAttribute('data-preset');
        this.state.preset = presetName;
        
        this.presetCardsEl.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        // Update state ratios
        const ratios = this.presets[presetName];
        this.state.carbRatio = ratios[0];
        this.state.proteinRatio = ratios[1];
        this.state.fatRatio = ratios[2];

        this.calculateMacros();
      });
    });

    // Calories Slider Change
    this.sliderCaloriesEl.addEventListener('input', (e) => {
      this.state.calories = parseInt(e.target.value, 10);
      this.txtCaloriesEl.textContent = this.state.calories;
      this.updateInnerCaloriesButtonsActiveState();
      this.calculateMacros();
    });

    // Weight Slider Change
    this.sliderWeightEl.addEventListener('input', (e) => {
      this.state.weight = parseInt(e.target.value, 10);
      this.txtWeightEl.textContent = this.state.weight;
      this.updateInnerWeightButtonsActiveState();
      this.calculateMacros();
    });

    // Quick Calories Buttons
    this.quickCaloriesBtnsEl.forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.play('click');
        const val = parseInt(btn.getAttribute('data-val'), 10);
        this.state.calories = val;
        this.sliderCaloriesEl.value = val;
        this.txtCaloriesEl.textContent = val;
        this.updateInnerCaloriesButtonsActiveState();
        this.calculateMacros();
      });
    });

    // Quick Weight Buttons
    this.quickWeightBtnsEl.forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.play('click');
        const val = parseInt(btn.getAttribute('data-val'), 10);
        this.state.weight = val;
        this.sliderWeightEl.value = val;
        this.txtWeightEl.textContent = val;
        this.updateInnerWeightButtonsActiveState();
        this.calculateMacros();
      });
    });

    // Custom Sliders Auto-Balancing Events
    this.sliderCarbRatioEl.addEventListener('input', (e) => {
      this.adjustCustomRatios('carb', parseInt(e.target.value, 10));
      this.calculateMacros();
    });

    this.sliderProteinRatioEl.addEventListener('input', (e) => {
      this.adjustCustomRatios('protein', parseInt(e.target.value, 10));
      this.calculateMacros();
    });

    this.sliderFatRatioEl.addEventListener('input', (e) => {
      this.adjustCustomRatios('fat', parseInt(e.target.value, 10));
      this.calculateMacros();
    });

    // Reset button click
    this.btnResetInputsEl.addEventListener('click', () => {
      SoundEngine.play('success');
      
      this.state.customMode = false;
      this.chkCustomModeEl.checked = false;
      this.presetContainerEl.classList.remove('disabled-state');
      this.customSlidersPanelEl.style.display = 'none';

      this.state.preset = 'balanced';
      this.presetCardsEl.forEach(c => {
        if (c.getAttribute('data-preset') === 'balanced') {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });

      this.state.calories = 2000;
      this.sliderCaloriesEl.value = 2000;
      this.txtCaloriesEl.textContent = 2000;

      this.state.weight = 70;
      this.sliderWeightEl.value = 70;
      this.txtWeightEl.textContent = 70;

      const defaultRatios = this.presets['balanced'];
      this.state.carbRatio = defaultRatios[0];
      this.state.proteinRatio = defaultRatios[1];
      this.state.fatRatio = defaultRatios[2];

      this.updateInnerCaloriesButtonsActiveState();
      this.updateInnerWeightButtonsActiveState();
      this.calculateMacros();
    });

    // Copy result button click
    this.btnCopyResultEl.addEventListener('click', () => {
      this.copySummaryToClipboard();
    });

    // Scroll progress & buttons
    window.addEventListener('scroll', () => {
      this.updateScrollProgress();
    });

    this.btnScrollTopEl.addEventListener('click', () => {
      SoundEngine.play('click');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    this.btnScrollBottomEl.addEventListener('click', () => {
      SoundEngine.play('click');
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
  },

  updateInnerCaloriesButtonsActiveState() {
    this.quickCaloriesBtnsEl.forEach(btn => {
      const val = parseInt(btn.getAttribute('data-val'), 10);
      if (val === this.state.calories) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  },

  updateInnerWeightButtonsActiveState() {
    this.quickWeightBtnsEl.forEach(btn => {
      const val = parseInt(btn.getAttribute('data-val'), 10);
      if (val === this.state.weight) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  },

  adjustCustomRatios(changedMacro, newValue) {
    let carb = this.state.carbRatio;
    let protein = this.state.proteinRatio;
    let fat = this.state.fatRatio;

    if (changedMacro === 'carb') {
      carb = newValue;
      const remaining = 100 - carb;
      const otherSum = protein + fat;
      if (otherSum > 0) {
        protein = Math.round((protein / otherSum) * remaining);
        fat = remaining - protein;
      } else {
        protein = Math.round(remaining / 2);
        fat = remaining - protein;
      }
    } else if (changedMacro === 'protein') {
      protein = newValue;
      const remaining = 100 - protein;
      const otherSum = carb + fat;
      if (otherSum > 0) {
        carb = Math.round((carb / otherSum) * remaining);
        fat = remaining - carb;
      } else {
        carb = Math.round(remaining / 2);
        fat = remaining - carb;
      }
    } else if (changedMacro === 'fat') {
      fat = newValue;
      const remaining = 100 - fat;
      const otherSum = carb + protein;
      if (otherSum > 0) {
        carb = Math.round((carb / otherSum) * remaining);
        protein = remaining - carb;
      } else {
        carb = Math.round(remaining / 2);
        protein = remaining - carb;
      }
    }

    // Auto balance validation corrector
    const currentSum = carb + protein + fat;
    if (currentSum !== 100) {
      const diff = 100 - currentSum;
      if (changedMacro === 'carb') {
        protein += diff;
      } else {
        carb += diff;
      }
    }

    this.state.carbRatio = Math.max(0, Math.min(100, carb));
    this.state.proteinRatio = Math.max(0, Math.min(100, protein));
    this.state.fatRatio = Math.max(0, Math.min(100, fat));

    this.sliderCarbRatioEl.value = this.state.carbRatio;
    this.sliderProteinRatioEl.value = this.state.proteinRatio;
    this.sliderFatRatioEl.value = this.state.fatRatio;

    this.lblCarbRatioEl.textContent = `${this.state.carbRatio}%`;
    this.lblProteinRatioEl.textContent = `${this.state.proteinRatio}%`;
    this.lblFatRatioEl.textContent = `${this.state.fatRatio}%`;
  },

  calculateMacros() {
    const cal = this.state.calories;
    const wt = this.state.weight;
    const rCarb = this.state.carbRatio;
    const rProtein = this.state.proteinRatio;
    const rFat = this.state.fatRatio;

    // Header Title Update
    this.resultHeaderTitleEl.textContent = `하루 ${cal}kcal 기준 권장 섭취량`;

    // Calories allocations
    const kcalCarb = Math.round(cal * (rCarb / 100));
    const kcalProtein = Math.round(cal * (rProtein / 100));
    const kcalFat = Math.round(cal * (rFat / 100));

    // Grams allocations
    const gCarb = Math.round(kcalCarb / 4);
    const gProtein = Math.round(kcalProtein / 4);
    const gFat = Math.round(kcalFat / 9);

    // Update segment progress bars width
    this.barSegCarbEl.style.width = `${rCarb}%`;
    this.barSegProteinEl.style.width = `${rProtein}%`;
    this.barSegFatEl.style.width = `${rFat}%`;

    // Update Card Displays
    this.cardCarbPercentEl.textContent = `${rCarb}%`;
    this.cardCarbGramsEl.textContent = gCarb;
    this.cardCarbKcalEl.textContent = `${kcalCarb} kcal`;

    this.cardProteinPercentEl.textContent = `${rProtein}%`;
    this.cardProteinGramsEl.textContent = gProtein;
    this.cardProteinKcalEl.textContent = `${kcalProtein} kcal`;

    this.cardFatPercentEl.textContent = `${rFat}%`;
    this.cardFatGramsEl.textContent = gFat;
    this.cardFatKcalEl.textContent = `${kcalFat} kcal`;

    // Calculate protein intake ratio relative to body weight (g/kg)
    const ratioProteinWeight = (gProtein / wt).toFixed(1);
    this.lblProteinRatioValEl.textContent = `${ratioProteinWeight}g`;

    // Evaluate protein levels
    let evalText = '';
    let evalColorClass = '';
    const floatRatio = parseFloat(ratioProteinWeight);

    if (floatRatio < 1.0) {
      evalText = '부족 (증량 권장)';
      evalColorClass = 'eval-badge bg-fat'; // orange/red
      this.badgeProteinEvalEl.style.backgroundColor = 'var(--macro-fat-bg)';
    } else if (floatRatio >= 1.0 && floatRatio < 1.5) {
      evalText = '일반인 권장 수준';
      evalColorClass = 'eval-badge bg-balanced'; // green
      this.badgeProteinEvalEl.style.backgroundColor = 'var(--brand-green-dark)';
    } else if (floatRatio >= 1.5 && floatRatio <= 2.0) {
      evalText = '운동인 / 다이어트 수준';
      evalColorClass = 'eval-badge bg-protein'; // blue
      this.badgeProteinEvalEl.style.backgroundColor = 'var(--macro-protein-bg)';
    } else {
      evalText = '고함량 (운동 강도 높을 때 적합)';
      evalColorClass = 'eval-badge bg-fat';
      this.badgeProteinEvalEl.style.backgroundColor = 'var(--macro-fat-bg)';
    }
    this.badgeProteinEvalEl.textContent = evalText;

    // Update Food Examples titles with actual target grams
    this.foodTitleCarbEl.textContent = `탄수화물 (${gCarb}g 필요)`;
    this.foodTitleProteinEl.textContent = `단백질 (${gProtein}g 필요)`;
    this.foodTitleFatEl.textContent = `지방 (${gFat}g 필요)`;

    // Calculate Food Examples portions
    this.foodRiceEl.textContent = `약 ${(gCarb / 65).toFixed(1)}공기 분량`;
    this.foodPotatoEl.textContent = `약 ${(gCarb / 30).toFixed(1)}개 분량`;
    this.foodBananaEl.textContent = `약 ${(gCarb / 27).toFixed(1)}개 분량`;
    this.foodBreadEl.textContent = `약 ${(gCarb / 26).toFixed(1)}회 (약 ${(gCarb / 13).toFixed(1)}장) 분량`;
    this.foodOatmealEl.textContent = `약 ${(gCarb / 27).toFixed(1)}컵 분량`;

    this.foodChickenEl.textContent = `약 ${(gProtein / 31).toFixed(1)}팩 분량`;
    this.foodEggEl.textContent = `약 ${(gProtein / 12).toFixed(1)}회 (약 ${(gProtein / 6).toFixed(1)}개) 분량`;
    this.foodTofuEl.textContent = `약 ${(gProtein / 15).toFixed(1)}회 분량`;
    this.foodSalmonEl.textContent = `약 ${(gProtein / 25).toFixed(1)}팩 분량`;
    this.foodMilkEl.textContent = `약 ${(gProtein / 7).toFixed(1)}팩 분량`;

    this.foodAvocadoEl.textContent = `약 ${(gFat / 15).toFixed(1)}회 분량`;
    this.foodAlmondEl.textContent = `약 ${(gFat / 6).toFixed(1)}회 (약 ${(gFat / 0.6).toFixed(0)}알) 분량`;
    this.foodOliveEl.textContent = `약 ${(gFat / 14).toFixed(1)}스푼 분량`;
    this.foodCheeseEl.textContent = `약 ${(gFat / 5).toFixed(1)}장 분량`;
    this.foodPorkEl.textContent = `약 ${(gFat / 30).toFixed(1)}회 (약 ${(gFat / 0.3).toFixed(0)}g) 분량`;

    // Highlight row in comparison table
    this.highlightTableCategory();
  },

  highlightTableCategory() {
    // Clear highlights on all table rows
    Object.keys(this.tableRowsEl).forEach(key => {
      if (this.tableRowsEl[key]) {
        this.tableRowsEl[key].classList.remove('active-row');
      }
    });

    // If not in custom mode, highlight active preset row
    if (!this.state.customMode) {
      const activeRow = this.tableRowsEl[this.state.preset];
      if (activeRow) {
        activeRow.classList.add('active-row');
      }
    }
  },

  copySummaryToClipboard() {
    const cal = this.state.calories;
    const wt = this.state.weight;
    const rCarb = this.state.carbRatio;
    const rProtein = this.state.proteinRatio;
    const rFat = this.state.fatRatio;

    const gCarb = this.cardCarbGramsEl.textContent;
    const kcalCarb = this.cardCarbKcalEl.textContent;
    const gProtein = this.cardProteinGramsEl.textContent;
    const kcalProtein = this.cardProteinKcalEl.textContent;
    const gFat = this.cardFatGramsEl.textContent;
    const kcalFat = this.cardFatKcalEl.textContent;

    const protRatioVal = this.lblProteinRatioValEl.textContent;
    const protEval = this.badgeProteinEvalEl.textContent;

    let modeText = this.state.customMode ? '커스텀 조절 비율' : `프리셋 식단 (${this.state.preset})`;

    const summaryText = `[CineAHO 영양소(탄단지) 비율 분석 결과]
- 식단 유형: ${modeText}
- 하루 목표 열량: ${cal} kcal
- 사용자 몸무게: ${wt} kg

[3대 영양소(탄단지) 분배 처방]
- 탄수화물: ${rCarb}% | ${gCarb}g | ${kcalCarb}
- 단백질: ${rProtein}% | ${gProtein}g | ${kcalProtein}
- 지방: ${rFat}% | ${gFat}g | ${kcalFat}

[체중 대비 단백질 섭취 평가]
- 체중 당 단백질: ${protRatioVal} / kg 체중
- 진단 등급: ${protEval}`;

    navigator.clipboard.writeText(summaryText)
      .then(() => {
        SoundEngine.play('success');
        alert("탄단지 영양소 권장 분배 리포트가 클립보드에 복사되었습니다!\n원하는 곳에 붙여넣어(Ctrl+V) 사용하세요.");
      })
      .catch(err => {
        console.error("복사 실패: ", err);
        alert("결과 복사에 실패했습니다. 수동으로 텍스트를 드래그해 복사해 주세요.");
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

    const maxOffset = 125.66;
    const strokeOffset = maxOffset - (scrolled / 100) * maxOffset;
    this.progressCircleIndicatorEl.style.strokeDashoffset = strokeOffset;
  }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
