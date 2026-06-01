/**
 * CineAHO Premium BMI Calculator App Engine
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
        osc.frequency.setValueAtTime(800, t);
        gainNode.gain.setValueAtTime(baseGain * 0.4, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
        break;
      case 'success':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, t);
        osc.frequency.exponentialRampToValueAtTime(1000, t + 0.15);
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
    height: 170, // cm
    weight: 70   // kg
  },

  // DOM Elements
  sliderHeightEl: null,
  sliderWeightEl: null,
  txtHeightEl: null,
  txtWeightEl: null,
  quickHeightBtnsEl: null,
  quickWeightBtnsEl: null,
  btnResetInputsEl: null,
  btnCopyResultEl: null,
  
  resultBmiValEl: null,
  resultBmiClassEl: null,
  resultBmiRiskEl: null,
  
  gaugePointerPinEl: null,
  pointerBubbleValEl: null,
  
  idealWeightValEl: null,
  weightChangeIconWrapEl: null,
  weightChangeLblEl: null,
  weightChangeValEl: null,
  weightChangeDescEl: null,
  statusHeightValEl: null,
  normalWeightRangeValEl: null,
  
  bmiStandardTableEl: null,
  
  scrollProgressRingEl: null,
  progressCircleIndicatorEl: null,
  scrollPercentageLblEl: null,
  btnScrollTopEl: null,
  btnScrollBottomEl: null,

  init() {
    // Inputs elements
    this.sliderHeightEl = document.getElementById('slider-height');
    this.sliderWeightEl = document.getElementById('slider-weight');
    this.txtHeightEl = document.getElementById('txt-height');
    this.txtWeightEl = document.getElementById('txt-weight');
    this.quickHeightBtnsEl = document.querySelectorAll('#quick-height-buttons .qs-btn');
    this.quickWeightBtnsEl = document.querySelectorAll('#quick-weight-buttons .qw-btn');
    this.btnResetInputsEl = document.getElementById('btn-reset-inputs');
    this.btnCopyResultEl = document.getElementById('btn-copy-result');

    // Outputs elements
    this.resultBmiValEl = document.getElementById('result-bmi-val');
    this.resultBmiClassEl = document.getElementById('result-bmi-class');
    this.resultBmiRiskEl = document.getElementById('result-bmi-risk');
    this.gaugePointerPinEl = document.getElementById('gauge-pointer-pin');
    this.pointerBubbleValEl = document.getElementById('pointer-bubble-val');
    
    // Cards elements
    this.idealWeightValEl = document.getElementById('ideal-weight-val');
    this.weightChangeIconWrapEl = document.getElementById('weight-change-icon-wrap');
    this.weightChangeLblEl = document.getElementById('weight-change-lbl');
    this.weightChangeValEl = document.getElementById('weight-change-val');
    this.weightChangeDescEl = document.getElementById('weight-change-desc');
    this.statusHeightValEl = document.getElementById('status-height-val');
    this.normalWeightRangeValEl = document.getElementById('normal-weight-range-val');

    // Table element
    this.bmiStandardTableEl = document.getElementById('bmi-standard-table');

    // Floating controls
    this.scrollProgressRingEl = document.getElementById('scroll-progress-ring');
    this.progressCircleIndicatorEl = document.getElementById('progress-circle-indicator');
    this.scrollPercentageLblEl = document.getElementById('scroll-percentage-lbl');
    this.btnScrollTopEl = document.getElementById('btn-scroll-top');
    this.btnScrollBottomEl = document.getElementById('btn-scroll-bottom');

    this.bindEvents();
    this.calculateBmi();
    
    // Initialize Scroll state
    this.updateScrollProgress();
  },

  bindEvents() {
    // Slider Events
    this.sliderHeightEl.addEventListener('input', (e) => {
      this.state.height = parseInt(e.target.value, 10);
      this.txtHeightEl.textContent = this.state.height;
      this.updateQuickHeightButtonsActiveState();
      this.calculateBmi();
    });

    this.sliderWeightEl.addEventListener('input', (e) => {
      this.state.weight = parseInt(e.target.value, 10);
      this.txtWeightEl.textContent = this.state.weight;
      this.updateQuickWeightButtonsActiveState();
      this.calculateBmi();
    });

    // Quick Height Buttons
    this.quickHeightBtnsEl.forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.play('click');
        const val = parseInt(btn.getAttribute('data-val'), 10);
        this.state.height = val;
        this.sliderHeightEl.value = val;
        this.txtHeightEl.textContent = val;
        this.updateQuickHeightButtonsActiveState();
        this.calculateBmi();
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
        this.updateQuickWeightButtonsActiveState();
        this.calculateBmi();
      });
    });

    // Reset Inputs
    this.btnResetInputsEl.addEventListener('click', () => {
      SoundEngine.play('success');
      this.state.height = 170;
      this.state.weight = 70;
      this.sliderHeightEl.value = 170;
      this.sliderWeightEl.value = 70;
      this.txtHeightEl.textContent = 170;
      this.txtWeightEl.textContent = 70;
      this.updateQuickHeightButtonsActiveState();
      this.updateQuickWeightButtonsActiveState();
      this.calculateBmi();
    });

    // Copy Result
    this.btnCopyResultEl.addEventListener('click', () => {
      this.copyResultToClipboard();
    });

    // Scroll Progress & Fast Scroll Click
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

  updateQuickHeightButtonsActiveState() {
    this.quickHeightBtnsEl.forEach(btn => {
      const val = parseInt(btn.getAttribute('data-val'), 10);
      if (val === this.state.height) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  },

  updateQuickWeightButtonsActiveState() {
    this.quickWeightBtnsEl.forEach(btn => {
      const val = parseInt(btn.getAttribute('data-val'), 10);
      if (val === this.state.weight) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  },

  calculateBmi() {
    const hMeter = this.state.height / 100;
    const wKg = this.state.weight;

    // BMI Formula
    const bmiVal = wKg / (hMeter * hMeter);
    const roundedBmi = Math.round(bmiVal * 10) / 10;

    // Classification (Asia-Korea standard)
    let bmiClass = '';
    let bmiRisk = '';
    let classColor = '';
    let classId = '';

    if (roundedBmi < 18.5) {
      bmiClass = '저체중';
      bmiRisk = '면역력 저하, 영양 부족 주의';
      classColor = 'text-blue';
      classId = 'underweight';
    } else if (roundedBmi < 23) {
      bmiClass = '정상';
      bmiRisk = '가장 건강하고 질병 발생 위험 최저 범위';
      classColor = 'text-green';
      classId = 'normal';
    } else if (roundedBmi < 25) {
      bmiClass = '과체중';
      bmiRisk = '당뇨, 고혈압 등 대사질환 위험 초기 시작';
      classColor = 'text-orange';
      classId = 'overweight';
    } else if (roundedBmi < 30) {
      bmiClass = '비만 1단계';
      bmiRisk = '당뇨, 고혈압 등 만성질환 주의 요망';
      classColor = 'text-orange';
      classId = 'obese-1';
    } else if (roundedBmi < 35) {
      bmiClass = '비만 2단계';
      bmiRisk = '합병증 예방 및 심혈관 질환 경계 요망';
      classColor = 'text-red';
      classId = 'obese-2';
    } else {
      bmiClass = '고도비만';
      bmiRisk = '의학적 합병증 및 심각한 심뇌혈관 질환 고위험군';
      classColor = 'text-red';
      classId = 'obese-3';
    }

    // Update main text displays
    this.resultBmiValEl.textContent = roundedBmi.toFixed(1);
    this.resultBmiClassEl.textContent = bmiClass;
    this.resultBmiClassEl.className = classColor;
    this.resultBmiRiskEl.textContent = bmiRisk;

    // Ideal Weight (BMI 22)
    const idealW = 22 * (hMeter * hMeter);
    const roundedIdealW = Math.round(idealW * 10) / 10;
    this.idealWeightValEl.textContent = `${roundedIdealW.toFixed(1)} kg`;

    // Recommended Weight Change
    const deltaW = wKg - roundedIdealW;
    const roundedDeltaW = Math.round(Math.abs(deltaW) * 10) / 10;

    if (deltaW > 0.1) {
      this.weightChangeLblEl.textContent = '감량 권장';
      this.weightChangeValEl.textContent = `${roundedDeltaW.toFixed(1)} kg`;
      this.weightChangeDescEl.textContent = '추천 감량치';
      this.weightChangeIconWrapEl.className = 'icon-wrap color-orange';
      this.weightChangeIconWrapEl.innerHTML = '<i class="fa-solid fa-arrow-down-long"></i>';
    } else if (deltaW < -0.1) {
      this.weightChangeLblEl.textContent = '증량 권장';
      this.weightChangeValEl.textContent = `${roundedDeltaW.toFixed(1)} kg`;
      this.weightChangeDescEl.textContent = '추천 증량치';
      this.weightChangeIconWrapEl.className = 'icon-wrap color-blue';
      this.weightChangeIconWrapEl.innerHTML = '<i class="fa-solid fa-arrow-up-long"></i>';
    } else {
      this.weightChangeLblEl.textContent = '유지 권장';
      this.weightChangeValEl.textContent = '0.0 kg';
      this.weightChangeDescEl.textContent = '이상 체중 유지 중';
      this.weightChangeIconWrapEl.className = 'icon-wrap color-green';
      this.weightChangeIconWrapEl.innerHTML = '<i class="fa-solid fa-check"></i>';
    }

    // Normal weight range (BMI 18.5 ~ 23)
    const minNormalW = 18.5 * (hMeter * hMeter);
    const maxNormalW = 23 * (hMeter * hMeter);
    const roundedMinW = Math.round(minNormalW * 10) / 10;
    const roundedMaxW = Math.round(maxNormalW * 10) / 10;

    this.statusHeightValEl.textContent = this.state.height;
    this.normalWeightRangeValEl.textContent = `${roundedMinW.toFixed(1)} kg ~ ${roundedMaxW.toFixed(1)} kg`;

    // Update gauge needle positioning
    this.updateGaugePointer(roundedBmi);

    // Highlight row in classification table
    this.highlightTableCategory(classId);
  },

  updateGaugePointer(bmi) {
    // 5 segments of 20% width. We map values:
    // Segment 1 (Underweight): 15 to 18.5 (size 3.5)
    // Segment 2 (Normal): 18.5 to 23 (size 4.5)
    // Segment 3 (Overweight): 23 to 25 (size 2.0)
    // Segment 4 (Obese 1): 25 to 30 (size 5.0)
    // Segment 5 (Obese 2/3): 30 to 35 (size 5.0)
    
    let percentage = 0;

    if (bmi < 15) {
      percentage = 2; // minimum margin
    } else if (bmi >= 35) {
      percentage = 98; // maximum margin
    } else {
      if (bmi < 18.5) {
        percentage = 0 + ((bmi - 15) / (18.5 - 15)) * 20;
      } else if (bmi < 23) {
        percentage = 20 + ((bmi - 18.5) / (23 - 18.5)) * 20;
      } else if (bmi < 25) {
        percentage = 40 + ((bmi - 23) / (25 - 23)) * 20;
      } else if (bmi < 30) {
        percentage = 60 + ((bmi - 25) / (30 - 25)) * 20;
      } else {
        percentage = 80 + ((bmi - 30) / (35 - 30)) * 20;
      }
    }

    // Set styling position
    this.gaugePointerPinEl.style.left = `${percentage}%`;
    this.pointerBubbleValEl.textContent = bmi.toFixed(1);
  },

  highlightTableCategory(classId) {
    const rows = this.bmiStandardTableEl.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const dataClass = row.getAttribute('data-class');
      if (dataClass === classId) {
        row.classList.add('active-highlight');
      } else {
        row.classList.remove('active-highlight');
      }
    });
  },

  copyResultToClipboard() {
    const h = this.state.height;
    const w = this.state.weight;
    const bmiVal = this.resultBmiValEl.textContent;
    const bmiClass = this.resultBmiClassEl.textContent;
    const bmiRisk = this.resultBmiRiskEl.textContent;
    const idealW = this.idealWeightValEl.textContent;
    const changeW = this.weightChangeValEl.textContent;
    const changeLbl = this.weightChangeLblEl.textContent;
    const normalRange = this.normalWeightRangeValEl.textContent;

    const summaryText = `[CineAHO BMI 비만도 분석 결과]
- 신장(키): ${h} cm
- 체중(몸무게): ${w} kg
- 체질량지수(BMI): ${bmiVal} (${bmiClass})
- 건강 위험 평가: ${bmiRisk}
- 이상적인 체중: ${idealW} (BMI 22 기준)
- 체중 조절 제언: ${changeW} ${changeLbl}
- 정상 체중 범위: ${normalRange} (아시아 기준)`;

    navigator.clipboard.writeText(summaryText)
      .then(() => {
        SoundEngine.play('success');
        alert("BMI 분석 결과가 클립보드에 복사되었습니다!\n원하는 곳에 붙여넣어(Ctrl+V) 사용하세요.");
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

    // SVG dashoffset adjustment (circumference = 2 * PI * r = 2 * 3.14159 * 20 = 125.66)
    const maxOffset = 125.66;
    const strokeOffset = maxOffset - (scrolled / 100) * maxOffset;
    this.progressCircleIndicatorEl.style.strokeDashoffset = strokeOffset;
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
