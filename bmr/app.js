/**
 * CineAHO Premium BMR/TDEE Calculator App Engine
 * 100% Client-side Medical Standard Calculation
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
        osc.frequency.setValueAtTime(850, t);
        gainNode.gain.setValueAtTime(baseGain * 0.4, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
        break;
      case 'success':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(1100, t + 0.15);
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
    gender: 'male',       // male, female
    age: 30,             // years
    height: 170,         // cm
    weight: 70,          // kg
    activityFactor: 1.55, // 1.2, 1.375, 1.55, 1.725, 1.9
    selectedGoal: 'maintain' // loss-heavy, loss-light, maintain, gain-light, gain-heavy
  },

  // DOM Elements - Inputs
  btnGenderMaleEl: null,
  btnGenderFemaleEl: null,
  sliderAgeEl: null,
  sliderHeightEl: null,
  sliderWeightEl: null,
  txtAgeEl: null,
  txtHeightEl: null,
  txtWeightEl: null,
  quickAgeBtnsEl: null,
  quickHeightBtnsEl: null,
  quickWeightBtnsEl: null,
  activityCardsEl: null,
  btnResetInputsEl: null,
  btnCopyResultEl: null,

  // DOM Elements - Outputs & Cards
  resultBmrValEl: null,
  resultTdeeValEl: null,
  goalsCalListEl: null,
  distributionTargetLblEl: null,
  mealBreakfastValEl: null,
  mealLunchValEl: null,
  mealDinnerValEl: null,
  mealSnackValEl: null,
  activityGuideTableEl: null,

  // Floating controls
  scrollProgressRingEl: null,
  progressCircleIndicatorEl: null,
  scrollPercentageLblEl: null,
  btnScrollTopEl: null,
  btnScrollBottomEl: null,

  init() {
    // Select input controls
    this.btnGenderMaleEl = document.getElementById('btn-gender-male');
    this.btnGenderFemaleEl = document.getElementById('btn-gender-female');
    this.sliderAgeEl = document.getElementById('slider-age');
    this.sliderHeightEl = document.getElementById('slider-height');
    this.sliderWeightEl = document.getElementById('slider-weight');
    this.txtAgeEl = document.getElementById('txt-age');
    this.txtHeightEl = document.getElementById('txt-height');
    this.txtWeightEl = document.getElementById('txt-weight');
    this.quickAgeBtnsEl = document.querySelectorAll('#quick-age-buttons .qs-btn');
    this.quickHeightBtnsEl = document.querySelectorAll('#quick-height-container .inner-btn');
    this.quickWeightBtnsEl = document.querySelectorAll('#quick-weight-container .inner-btn');
    this.activityCardsEl = document.querySelectorAll('#activity-cards-wrap .activity-card');
    this.btnResetInputsEl = document.getElementById('btn-reset-inputs');
    this.btnCopyResultEl = document.getElementById('btn-copy-result');

    // Outputs
    this.resultBmrValEl = document.getElementById('result-bmr-val');
    this.resultTdeeValEl = document.getElementById('result-tdee-val');
    this.goalsCalListEl = document.querySelectorAll('#goals-calorie-list .goal-item');
    this.distributionTargetLblEl = document.getElementById('distribution-target-lbl');
    this.mealBreakfastValEl = document.getElementById('meal-breakfast-val');
    this.mealLunchValEl = document.getElementById('meal-lunch-val');
    this.mealDinnerValEl = document.getElementById('meal-dinner-val');
    this.mealSnackValEl = document.getElementById('meal-snack-val');
    this.activityGuideTableEl = document.getElementById('activity-guide-table');

    // Floating UI
    this.scrollProgressRingEl = document.getElementById('scroll-progress-ring');
    this.progressCircleIndicatorEl = document.getElementById('progress-circle-indicator');
    this.scrollPercentageLblEl = document.getElementById('scroll-percentage-lbl');
    this.btnScrollTopEl = document.getElementById('btn-scroll-top');
    this.btnScrollBottomEl = document.getElementById('btn-scroll-bottom');

    this.bindEvents();
    this.calculateBmrTdee();
    this.updateScrollProgress();
  },

  bindEvents() {
    // Gender Toggle Male
    this.btnGenderMaleEl.addEventListener('click', () => {
      SoundEngine.play('click');
      this.state.gender = 'male';
      this.btnGenderMaleEl.classList.add('active');
      this.btnGenderFemaleEl.classList.remove('active');
      this.calculateBmrTdee();
    });

    // Gender Toggle Female
    this.btnGenderFemaleEl.addEventListener('click', () => {
      SoundEngine.play('click');
      this.state.gender = 'female';
      this.btnGenderFemaleEl.classList.add('active');
      this.btnGenderMaleEl.classList.remove('active');
      this.calculateBmrTdee();
    });

    // Age Slider
    this.sliderAgeEl.addEventListener('input', (e) => {
      this.state.age = parseInt(e.target.value, 10);
      this.txtAgeEl.textContent = this.state.age;
      this.updateQuickAgeButtonsActiveState();
      this.calculateBmrTdee();
    });

    // Height Slider
    this.sliderHeightEl.addEventListener('input', (e) => {
      this.state.height = parseInt(e.target.value, 10);
      this.txtHeightEl.textContent = this.state.height;
      this.updateInnerHeightButtonsActiveState();
      this.calculateBmrTdee();
    });

    // Weight Slider
    this.sliderWeightEl.addEventListener('input', (e) => {
      this.state.weight = parseInt(e.target.value, 10);
      this.txtWeightEl.textContent = this.state.weight;
      this.updateInnerWeightButtonsActiveState();
      this.calculateBmrTdee();
    });

    // Quick Age Buttons
    this.quickAgeBtnsEl.forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.play('click');
        const val = parseInt(btn.getAttribute('data-val'), 10);
        this.state.age = val;
        this.sliderAgeEl.value = val;
        this.txtAgeEl.textContent = val;
        this.updateQuickAgeButtonsActiveState();
        this.calculateBmrTdee();
      });
    });

    // Inner Height Buttons
    this.quickHeightBtnsEl.forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.play('click');
        const val = parseInt(btn.getAttribute('data-val'), 10);
        this.state.height = val;
        this.sliderHeightEl.value = val;
        this.txtHeightEl.textContent = val;
        this.updateInnerHeightButtonsActiveState();
        this.calculateBmrTdee();
      });
    });

    // Inner Weight Buttons
    this.quickWeightBtnsEl.forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.play('click');
        const val = parseInt(btn.getAttribute('data-val'), 10);
        this.state.weight = val;
        this.sliderWeightEl.value = val;
        this.txtWeightEl.textContent = val;
        this.updateInnerWeightButtonsActiveState();
        this.calculateBmrTdee();
      });
    });

    // Activity Cards Click
    this.activityCardsEl.forEach(card => {
      card.addEventListener('click', () => {
        SoundEngine.play('click');
        
        // Remove active class from all cards
        this.activityCardsEl.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        this.state.activityFactor = parseFloat(card.getAttribute('data-factor'));
        this.highlightActivityGuideTableRow();
        this.calculateBmrTdee();
      });
    });

    // Goals Item Selector Click
    this.goalsCalListEl.forEach(item => {
      item.addEventListener('click', () => {
        SoundEngine.play('click');
        
        // Remove active from all items
        this.goalsCalListEl.forEach(g => g.classList.remove('active'));
        item.classList.add('active');

        this.state.selectedGoal = item.getAttribute('data-goal');
        this.updateCalorieDistributionView();
      });
    });

    // Reset Inputs Click
    this.btnResetInputsEl.addEventListener('click', () => {
      SoundEngine.play('success');
      
      // Reset state
      this.state.gender = 'male';
      this.state.age = 30;
      this.state.height = 170;
      this.state.weight = 70;
      this.state.activityFactor = 1.55;
      this.state.selectedGoal = 'maintain';

      // Reset controls UI
      this.btnGenderMaleEl.classList.add('active');
      this.btnGenderFemaleEl.classList.remove('active');
      
      this.sliderAgeEl.value = 30;
      this.txtAgeEl.textContent = 30;

      this.sliderHeightEl.value = 170;
      this.txtHeightEl.textContent = 170;

      this.sliderWeightEl.value = 70;
      this.txtWeightEl.textContent = 70;

      this.updateQuickAgeButtonsActiveState();
      this.updateInnerHeightButtonsActiveState();
      this.updateInnerWeightButtonsActiveState();

      // Reset activity cards
      this.activityCardsEl.forEach(c => {
        const f = parseFloat(c.getAttribute('data-factor'));
        if (f === 1.55) c.classList.add('active');
        else c.classList.remove('active');
      });
      this.highlightActivityGuideTableRow();

      // Reset goal items
      this.goalsCalListEl.forEach(g => {
        if (g.getAttribute('data-goal') === 'maintain') g.classList.add('active');
        else g.classList.remove('active');
      });

      this.calculateBmrTdee();
    });

    // Copy Result Click
    this.btnCopyResultEl.addEventListener('click', () => {
      this.copySummaryToClipboard();
    });

    // Scroll & Floating Controls
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

  updateQuickAgeButtonsActiveState() {
    this.quickAgeBtnsEl.forEach(btn => {
      const val = parseInt(btn.getAttribute('data-val'), 10);
      if (val === this.state.age) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  },

  updateInnerHeightButtonsActiveState() {
    this.quickHeightBtnsEl.forEach(btn => {
      const val = parseInt(btn.getAttribute('data-val'), 10);
      if (val === this.state.height) {
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

  highlightActivityGuideTableRow() {
    const rows = this.activityGuideTableEl.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const factor = parseFloat(row.getAttribute('data-level'));
      if (factor === this.state.activityFactor) {
        row.classList.add('active-highlight');
      } else {
        row.classList.remove('active-highlight');
      }
    });
  },

  calculateBmrTdee() {
    const w = this.state.weight;
    const h = this.state.height;
    const a = this.state.age;

    // BMR: Mifflin-St Jeor Equation
    let bmr = 0;
    if (this.state.gender === 'male') {
      bmr = (10 * w) + (6.25 * h) - (5 * a) + 5;
    } else {
      bmr = (10 * w) + (6.25 * h) - (5 * a) - 161;
    }

    const roundedBmr = Math.round(bmr);
    this.resultBmrValEl.textContent = roundedBmr;

    // TDEE
    const tdee = bmr * this.state.activityFactor;
    const roundedTdee = Math.round(tdee);
    this.resultTdeeValEl.textContent = roundedTdee;

    // Goal Calories
    const calLossHeavy = Math.max(roundedBmr, roundedTdee - 500);
    const calLossLight = Math.max(roundedBmr, roundedTdee - 300);
    const calMaintain = roundedTdee;
    const calGainLight = roundedTdee + 300;
    const calGainHeavy = roundedTdee + 500;

    document.getElementById('cal-loss-heavy').textContent = Math.round(calLossHeavy);
    document.getElementById('cal-loss-light').textContent = Math.round(calLossLight);
    document.getElementById('cal-maintain').textContent = Math.round(calMaintain);
    document.getElementById('cal-gain-light').textContent = Math.round(calGainLight);
    document.getElementById('cal-gain-heavy').textContent = Math.round(calGainHeavy);

    // Apply safety warning styling on goal items if limited to BMR
    const setSafetyWarning = (elId, value, rawTarget) => {
      const parent = document.getElementById(elId).closest('.goal-item');
      if (value === roundedBmr && rawTarget < roundedBmr) {
        parent.classList.add('safety-limited');
        parent.title = "건강 보호를 위해 기초대사량(BMR) 이하로 식단이 조절되지 않도록 자동 제한되었습니다.";
      } else {
        parent.classList.remove('safety-limited');
        parent.removeAttribute('title');
      }
    };

    setSafetyWarning('cal-loss-heavy', calLossHeavy, roundedTdee - 500);
    setSafetyWarning('cal-loss-light', calLossLight, roundedTdee - 300);

    // Redraw Meal distributions
    this.updateCalorieDistributionView();
  },

  updateCalorieDistributionView() {
    const tdeeVal = parseInt(this.resultTdeeValEl.textContent, 10);
    const bmrVal = parseInt(this.resultBmrValEl.textContent, 10);

    let targetCal = tdeeVal;
    let label = '(유지 기준)';

    if (this.state.selectedGoal === 'loss-heavy') {
      targetCal = Math.max(bmrVal, tdeeVal - 500);
      label = '(체중 감량 기준)';
    } else if (this.state.selectedGoal === 'loss-light') {
      targetCal = Math.max(bmrVal, tdeeVal - 300);
      label = '(완만한 감량 기준)';
    } else if (this.state.selectedGoal === 'maintain') {
      targetCal = tdeeVal;
      label = '(체중 유지 기준)';
    } else if (this.state.selectedGoal === 'gain-light') {
      targetCal = tdeeVal + 300;
      label = '(완만한 증량 기준)';
    } else if (this.state.selectedGoal === 'gain-heavy') {
      targetCal = tdeeVal + 500;
      label = '(근육 증량 기준)';
    }

    this.distributionTargetLblEl.textContent = label;

    // Proportional breakdown (25%, 35%, 30%, 10%)
    const breakfast = Math.round(targetCal * 0.25);
    const lunch = Math.round(targetCal * 0.35);
    const dinner = Math.round(targetCal * 0.30);
    // Snack holds the remainder to ensure exact summation
    const snack = Math.max(0, targetCal - (breakfast + lunch + dinner));

    this.mealBreakfastValEl.textContent = breakfast;
    this.mealLunchValEl.textContent = lunch;
    this.mealDinnerValEl.textContent = dinner;
    this.mealSnackValEl.textContent = snack;
  },

  copySummaryToClipboard() {
    const gender = this.state.gender === 'male' ? '남성' : '여성';
    const age = this.state.age;
    const h = this.state.height;
    const w = this.state.weight;
    
    let activityText = '';
    if (this.state.activityFactor === 1.2) activityText = '거의 활동 없음 (사무직)';
    else if (this.state.activityFactor === 1.375) activityText = '가벼운 활동 (주 1~3회 운동)';
    else if (this.state.activityFactor === 1.55) activityText = '보통 활동 (주 3~5회 운동)';
    else if (this.state.activityFactor === 1.725) activityText = '활발한 활동 (주 6~7회 운동)';
    else if (this.state.activityFactor === 1.9) activityText = '매우 활발 (고강도 훈련/노동)';

    const bmr = this.resultBmrValEl.textContent;
    const tdee = this.resultTdeeValEl.textContent;

    const calHeavyLoss = document.getElementById('cal-loss-heavy').textContent;
    const calLightLoss = document.getElementById('cal-loss-light').textContent;
    const calMaintain = document.getElementById('cal-maintain').textContent;
    const calLightGain = document.getElementById('cal-gain-light').textContent;
    const calHeavyGain = document.getElementById('cal-gain-heavy').textContent;

    const breakfast = this.mealBreakfastValEl.textContent;
    const lunch = this.mealLunchValEl.textContent;
    const dinner = this.mealDinnerValEl.textContent;
    const snack = this.mealSnackValEl.textContent;
    const distLabel = this.distributionTargetLblEl.textContent;

    const summaryText = `[CineAHO BMR/TDEE 칼로리 분석 결과]
- 성별: ${gender} | 나이: ${age} 세
- 신장: ${h} cm | 체중: ${w} kg
- 일상 활동량: ${activityText}
- 기초대사량 (BMR): ${bmr} kcal/일
- 하루 총 에너지 소비량 (TDEE): ${tdee} kcal/일

[목표별 권장 칼로리 섭취량]
- 체중 감량 (-0.5kg/주): ${calHeavyLoss} kcal
- 완만한 감량 (-0.3kg/주): ${calLightLoss} kcal
- 체중 유지: ${calMaintain} kcal
- 완만한 증량 (+0.3kg/주): ${calLightGain} kcal
- 근육 증량 (+0.5kg/주): ${calHeavyGain} kcal

[한 끼 권장 칼로리 분배 ${distLabel}]
- 아침 (25%): ${breakfast} kcal
- 점심 (35%): ${lunch} kcal
- 저녁 (30%): ${dinner} kcal
- 간식 (10%): ${snack} kcal`;

    navigator.clipboard.writeText(summaryText)
      .then(() => {
        SoundEngine.play('success');
        alert("BMR/TDEE 분석 결과가 클립보드에 복사되었습니다!\n원하는 곳에 붙여넣어(Ctrl+V) 사용하세요.");
      })
      .catch(err => {
        console.error("복사 오류: ", err);
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

// Auto initialize App on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
