/**
 * CineAHO Premium WHR Calculator App Engine
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
    gender: 'male', // male, female
    waist: 85,      // cm
    hip: 95         // cm
  },

  // DOM Elements - Inputs
  btnGenderMaleEl: null,
  btnGenderFemaleEl: null,
  sliderWaistEl: null,
  sliderHipEl: null,
  txtWaistEl: null,
  txtHipEl: null,
  waistStandardLblEl: null,
  quickWaistBtnsEl: null,
  quickHipBtnsEl: null,
  btnResetInputsEl: null,
  btnCopyResultEl: null,

  // DOM Elements - Outputs & Cards
  resultWhrValEl: null,
  resultWhrClassEl: null,
  resultWhrDescEl: null,
  gaugePointerPinEl: null,
  pointerBubbleValEl: null,
  cardRiskStatusEl: null,
  riskStatusIconEl: null,
  riskStatusTitleEl: null,
  riskStatusDescEl: null,
  cardWaistAbsIconEl: null,
  waistAbsStatusValEl: null,
  waistTargetValEl: null,

  // Tables
  whrMaleTableEl: null,
  whrFemaleTableEl: null,

  // Floating controls
  scrollProgressRingEl: null,
  progressCircleIndicatorEl: null,
  scrollPercentageLblEl: null,
  btnScrollTopEl: null,
  btnScrollBottomEl: null,

  init() {
    // Inputs
    this.btnGenderMaleEl = document.getElementById('btn-gender-male');
    this.btnGenderFemaleEl = document.getElementById('btn-gender-female');
    this.sliderWaistEl = document.getElementById('slider-waist');
    this.sliderHipEl = document.getElementById('slider-hip');
    this.txtWaistEl = document.getElementById('txt-waist');
    this.txtHipEl = document.getElementById('txt-hip');
    this.waistStandardLblEl = document.getElementById('waist-standard-lbl');
    this.quickWaistBtnsEl = document.querySelectorAll('#quick-waist-container .inner-btn');
    this.quickHipBtnsEl = document.querySelectorAll('#quick-hip-container .inner-btn');
    this.btnResetInputsEl = document.getElementById('btn-reset-inputs');
    this.btnCopyResultEl = document.getElementById('btn-copy-result');

    // Outputs
    this.resultWhrValEl = document.getElementById('result-whr-val');
    this.resultWhrClassEl = document.getElementById('result-whr-class');
    this.resultWhrDescEl = document.getElementById('result-whr-desc');
    this.gaugePointerPinEl = document.getElementById('gauge-pointer-pin');
    this.pointerBubbleValEl = document.getElementById('pointer-bubble-val');
    this.cardRiskStatusEl = document.getElementById('card-risk-status');
    this.riskStatusIconEl = document.getElementById('risk-status-icon');
    this.riskStatusTitleEl = document.getElementById('risk-status-title');
    this.riskStatusDescEl = document.getElementById('risk-status-desc');
    this.cardWaistAbsIconEl = document.getElementById('card-waist-abs-icon');
    this.waistAbsStatusValEl = document.getElementById('waist-abs-status-val');
    this.waistTargetValEl = document.getElementById('waist-target-val');

    // Tables
    this.whrMaleTableEl = document.getElementById('whr-male-table');
    this.whrFemaleTableEl = document.getElementById('whr-female-table');

    // Floating UI
    this.scrollProgressRingEl = document.getElementById('scroll-progress-ring');
    this.progressCircleIndicatorEl = document.getElementById('progress-circle-indicator');
    this.scrollPercentageLblEl = document.getElementById('scroll-percentage-lbl');
    this.btnScrollTopEl = document.getElementById('btn-scroll-top');
    this.btnScrollBottomEl = document.getElementById('btn-scroll-bottom');

    this.bindEvents();
    this.calculateWhr();
    this.updateScrollProgress();
  },

  bindEvents() {
    // Gender Male Card Click
    this.btnGenderMaleEl.addEventListener('click', () => {
      SoundEngine.play('click');
      this.state.gender = 'male';
      this.btnGenderMaleEl.classList.add('active');
      this.btnGenderFemaleEl.classList.remove('active');
      this.waistStandardLblEl.textContent = '기준: 90cm';
      this.calculateWhr();
    });

    // Gender Female Card Click
    this.btnGenderFemaleEl.addEventListener('click', () => {
      SoundEngine.play('click');
      this.state.gender = 'female';
      this.btnGenderFemaleEl.classList.add('active');
      this.btnGenderMaleEl.classList.remove('active');
      this.waistStandardLblEl.textContent = '기준: 85cm';
      this.calculateWhr();
    });

    // Waist Slider Change
    this.sliderWaistEl.addEventListener('input', (e) => {
      this.state.waist = parseInt(e.target.value, 10);
      this.txtWaistEl.textContent = this.state.waist;
      this.updateInnerWaistButtonsActiveState();
      this.calculateWhr();
    });

    // Hip Slider Change
    this.sliderHipEl.addEventListener('input', (e) => {
      this.state.hip = parseInt(e.target.value, 10);
      this.txtHipEl.textContent = this.state.hip;
      this.updateInnerHipButtonsActiveState();
      this.calculateWhr();
    });

    // Quick Waist Buttons
    this.quickWaistBtnsEl.forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.play('click');
        const val = parseInt(btn.getAttribute('data-val'), 10);
        this.state.waist = val;
        this.sliderWaistEl.value = val;
        this.txtWaistEl.textContent = val;
        this.updateInnerWaistButtonsActiveState();
        this.calculateWhr();
      });
    });

    // Quick Hip Buttons
    this.quickHipBtnsEl.forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.play('click');
        const val = parseInt(btn.getAttribute('data-val'), 10);
        this.state.hip = val;
        this.sliderHipEl.value = val;
        this.txtHipEl.textContent = val;
        this.updateInnerHipButtonsActiveState();
        this.calculateWhr();
      });
    });

    // Reset Inputs
    this.btnResetInputsEl.addEventListener('click', () => {
      SoundEngine.play('success');
      this.state.gender = 'male';
      this.state.waist = 85;
      this.state.hip = 95;

      this.btnGenderMaleEl.classList.add('active');
      this.btnGenderFemaleEl.classList.remove('active');
      this.waistStandardLblEl.textContent = '기준: 90cm';

      this.sliderWaistEl.value = 85;
      this.txtWaistEl.textContent = 85;

      this.sliderHipEl.value = 95;
      this.txtHipEl.textContent = 95;

      this.updateInnerWaistButtonsActiveState();
      this.updateInnerHipButtonsActiveState();
      this.calculateWhr();
    });

    // Copy result
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

  updateInnerWaistButtonsActiveState() {
    this.quickWaistBtnsEl.forEach(btn => {
      const val = parseInt(btn.getAttribute('data-val'), 10);
      if (val === this.state.waist) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  },

  updateInnerHipButtonsActiveState() {
    this.quickHipBtnsEl.forEach(btn => {
      const val = parseInt(btn.getAttribute('data-val'), 10);
      if (val === this.state.hip) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  },

  calculateWhr() {
    const w = this.state.waist;
    const h = this.state.hip;

    // WHR formula
    const whrVal = w / h;
    const roundedWhr = Math.round(whrVal * 100) / 100;

    this.resultWhrValEl.textContent = roundedWhr.toFixed(2);

    let classification = '';
    let description = '';
    let classColor = '';
    let classId = '';
    
    // Risk status card configurations
    let riskTitle = '';
    let riskDesc = '';
    let riskClassList = 'res-sub-card span-all warning-card';
    let riskIconHTML = '';
    let riskIconColor = '';

    // Classification mapping based on gender
    if (this.state.gender === 'male') {
      if (roundedWhr < 0.90) {
        classification = '정상';
        description = '건강한 허리-엉덩이 비율';
        classColor = 'text-green';
        classId = 'normal';

        riskTitle = '건강 위험도: 낮음';
        riskDesc = '대사증후군 및 심혈관 질환 위험 최저 범위';
        riskIconHTML = '<i class="fa-solid fa-heart-circle-check"></i>';
        riskIconColor = 'color-green';
      } else if (roundedWhr < 0.95) {
        classification = '주의';
        description = '복부 지방 비축 시작 단계';
        classColor = 'text-yellow';
        classId = 'caution';

        riskTitle = '건강 위험도: 보통';
        riskDesc = '경미한 내장지방 축적 상태, 예방적 식이 및 유산소 관리 권장';
        riskClassList += ' risk-caution';
        riskIconHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
        riskIconColor = 'color-orange';
      } else if (roundedWhr < 1.00) {
        classification = '복부비만';
        description = '내장지방으로 인한 대사증후군 위험';
        classColor = 'text-orange';
        classId = 'obese';

        riskTitle = '건강 위험도: 높음';
        riskDesc = '인슐린 저항성 및 성인병 예방을 위해 체중 감량 필수';
        riskClassList += ' risk-high';
        riskIconHTML = '<i class="fa-solid fa-circle-exclamation"></i>';
        riskIconColor = 'color-red';
      } else {
        classification = '고위험';
        description = '심혈관 및 만성질환 매우 높음';
        classColor = 'text-red';
        classId = 'high-risk';

        riskTitle = '건강 위험도: 매우 높음';
        riskDesc = '고혈압, 당뇨 및 동맥경화 등 심각한 합병증 주의 요망';
        riskClassList += ' risk-high';
        riskIconHTML = '<i class="fa-solid fa-circle-radiation"></i>';
        riskIconColor = 'color-red';
      }
    } else {
      // Female 기준
      if (roundedWhr < 0.80) {
        classification = '정상';
        description = '건강한 허리-엉덩이 비율';
        classColor = 'text-green';
        classId = 'normal';

        riskTitle = '건강 위험도: 낮음';
        riskDesc = '대사증후군 및 심혈관 질환 위험 최저 범위';
        riskIconHTML = '<i class="fa-solid fa-heart-circle-check"></i>';
        riskIconColor = 'color-green';
      } else if (roundedWhr < 0.85) {
        classification = '주의';
        description = '복부 지방 비축 시작 단계';
        classColor = 'text-yellow';
        classId = 'caution';

        riskTitle = '건강 위험도: 보통';
        riskDesc = '경미한 내장지방 축적 상태, 예방적 식이 및 유산소 관리 권장';
        riskClassList += ' risk-caution';
        riskIconHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
        riskIconColor = 'color-orange';
      } else if (roundedWhr < 0.90) {
        classification = '복부비만';
        description = '내장지방으로 인한 대사증후군 위험';
        classColor = 'text-orange';
        classId = 'obese';

        riskTitle = '건강 위험도: 높음';
        riskDesc = '인슐린 저항성 및 성인병 예방을 위해 체중 감량 필수';
        riskClassList += ' risk-high';
        riskIconHTML = '<i class="fa-solid fa-circle-exclamation"></i>';
        riskIconColor = 'color-red';
      } else {
        classification = '고위험';
        description = '심혈관 및 만성질환 매우 높음';
        classColor = 'text-red';
        classId = 'high-risk';

        riskTitle = '건강 위험도: 매우 높음';
        riskDesc = '고혈압, 당뇨 및 동맥경화 등 심각한 합병증 주의 요망';
        riskClassList += ' risk-high';
        riskIconHTML = '<i class="fa-solid fa-circle-radiation"></i>';
        riskIconColor = 'color-red';
      }
    }

    // Update main text displays
    this.resultWhrClassEl.textContent = classification;
    this.resultWhrClassEl.className = classColor;
    this.resultWhrDescEl.textContent = description;

    // Update Health Risk card
    this.cardRiskStatusEl.className = riskClassList;
    this.riskStatusIconEl.className = `icon-wrap ${riskIconColor}`;
    this.riskStatusIconEl.innerHTML = riskIconHTML;
    this.riskStatusTitleEl.textContent = riskTitle;
    this.riskStatusDescEl.textContent = riskDesc;

    // Absolute Waist Circumference evaluation (남 90, 여 85)
    let absoluteLimit = this.state.gender === 'male' ? 90 : 85;
    let absoluteStatus = '';
    let absIconHTML = '';
    let absIconColor = '';

    if (w >= absoluteLimit) {
      absoluteStatus = '복부비만';
      absIconHTML = '<i class="fa-solid fa-circle-xmark"></i>';
      absIconColor = 'icon-wrap color-red';
    } else {
      absoluteStatus = '정상';
      absIconHTML = '<i class="fa-solid fa-circle-check"></i>';
      absIconColor = 'icon-wrap color-green';
    }

    this.waistAbsStatusValEl.textContent = absoluteStatus;
    this.cardWaistAbsIconEl.className = absIconColor;
    this.cardWaistAbsIconEl.innerHTML = absIconHTML;

    // Target suggestion waist card
    this.waistTargetValEl.textContent = `${absoluteLimit} cm 이하`;
    const targetValCard = this.waistTargetValEl.closest('.res-sub-card');
    const targetDescEl = targetValCard.querySelector('p');
    
    if (w > absoluteLimit) {
      const delta = w - absoluteLimit;
      targetDescEl.textContent = `현재 둘레 대비 ${delta} cm 감량 필요`;
      targetValCard.querySelector('.icon-wrap').className = 'icon-wrap color-orange';
    } else {
      targetDescEl.textContent = '정상 범위 내 안착 중';
      targetValCard.querySelector('.icon-wrap').className = 'icon-wrap color-cyan';
    }

    // Position pointer pin on gauge
    this.updateGaugePointer(roundedWhr);

    // Highlight row in classification table
    this.highlightTableCategory(classId);
  },

  updateGaugePointer(whr) {
    let percentage = 0;

    if (this.state.gender === 'male') {
      // Segments: 정상(0.70~0.90), 주의(0.90~0.95), 복부비만(0.95~1.00), 고위험(1.00~1.10)
      if (whr < 0.70) {
        percentage = 3;
      } else if (whr >= 1.10) {
        percentage = 97;
      } else {
        if (whr < 0.90) {
          percentage = 0 + ((whr - 0.70) / (0.90 - 0.70)) * 25;
        } else if (whr < 0.95) {
          percentage = 25 + ((whr - 0.90) / (0.95 - 0.90)) * 25;
        } else if (whr < 1.00) {
          percentage = 50 + ((whr - 0.95) / (1.00 - 0.95)) * 25;
        } else {
          percentage = 75 + ((whr - 1.00) / (1.10 - 1.00)) * 25;
        }
      }
    } else {
      // Female: 정상(0.60~0.80), 주의(0.80~0.85), 복부비만(0.85~0.90), 고위험(0.90~1.00)
      if (whr < 0.60) {
        percentage = 3;
      } else if (whr >= 1.00) {
        percentage = 97;
      } else {
        if (whr < 0.80) {
          percentage = 0 + ((whr - 0.60) / (0.80 - 0.60)) * 25;
        } else if (whr < 0.85) {
          percentage = 25 + ((whr - 0.80) / (0.85 - 0.80)) * 25;
        } else if (whr < 0.90) {
          percentage = 50 + ((whr - 0.85) / (0.90 - 0.85)) * 25;
        } else {
          percentage = 75 + ((whr - 0.90) / (1.00 - 0.90)) * 25;
        }
      }
    }

    this.gaugePointerPinEl.style.left = `${percentage}%`;
    this.pointerBubbleValEl.textContent = whr.toFixed(2);
  },

  highlightTableCategory(classId) {
    // Clear highlights on both tables
    this.whrMaleTableEl.querySelectorAll('tbody tr').forEach(r => r.classList.remove('active-highlight'));
    this.whrFemaleTableEl.querySelectorAll('tbody tr').forEach(r => r.classList.remove('active-highlight'));

    // Highlight row on the active table
    let activeTable = this.state.gender === 'male' ? this.whrMaleTableEl : this.whrFemaleTableEl;
    const row = activeTable.querySelector(`tbody tr[data-class="${classId}"]`);
    if (row) {
      row.classList.add('active-highlight');
    }
  },

  copySummaryToClipboard() {
    const gender = this.state.gender === 'male' ? '남성' : '여성';
    const w = this.state.waist;
    const h = this.state.hip;
    const whrVal = this.resultWhrValEl.textContent;
    const whrClass = this.resultWhrClassEl.textContent;
    const whrDesc = this.resultWhrDescEl.textContent;
    const riskTitle = this.riskStatusTitleEl.textContent;
    const riskDesc = this.riskStatusDescEl.textContent;
    const absStatus = this.waistAbsStatusValEl.textContent;
    const targetLimit = this.waistTargetValEl.textContent;

    const summaryText = `[CineAHO 복부비만도(WHR) 분석 결과]
- 성별: ${gender}
- 허리둘레: ${w} cm
- 엉덩이둘레: ${h} cm
- 복부비만도 (WHR): ${whrVal} (${whrClass} - ${whrDesc})

[상세 신체 평가]
- ${riskTitle} (${riskDesc})
- 절대 허리둘레 기준: ${absStatus} (기준: ${gender === 'male' ? '90' : '85'} cm)
- 권장 허리둘레: ${targetLimit}`;

    navigator.clipboard.writeText(summaryText)
      .then(() => {
        SoundEngine.play('success');
        alert("복부비만도(WHR) 분석 결과가 클립보드에 복사되었습니다!\n원하는 곳에 붙여넣어(Ctrl+V) 사용하세요.");
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
