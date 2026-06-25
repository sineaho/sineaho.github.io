/**
 * CineAHO Premium THR Calculator App Engine
 * 100% Client-side Medical Standard Calculation (Karvonen Formula)
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
    goal: 'fat-burn', // fat-burn, health-care, cardio, performance
    age: 30,          // years
    rhr: 70           // bpm
  },

  // DOM Elements - Inputs & Controls
  goalCardsEl: null,
  sliderAgeEl: null,
  sliderRhrEl: null,
  txtAgeEl: null,
  txtRhrEl: null,
  quickAgeBtnsEl: null,
  quickRhrBtnsEl: null,
  fitCardsEl: null,
  btnResetInputsEl: null,
  btnCopyResultEl: null,

  // DOM Elements - Outputs
  resultMaxHrEl: null,
  resultHrrEl: null,
  targetGoalTitleEl: null,
  targetRangeValEl: null,
  targetGoalDescEl: null,

  // Visual items
  zoneVisualsEl: null,
  zoneRangesEl: {},
  tblRangesEl: {},
  tableRowsEl: null,
  progCardsEl: null,

  // Floating controls
  scrollProgressRingEl: null,
  progressCircleIndicatorEl: null,
  scrollPercentageLblEl: null,
  btnScrollTopEl: null,
  btnScrollBottomEl: null,

  init() {
    // Inputs
    this.goalCardsEl = document.querySelectorAll('.goal-card');
    this.sliderAgeEl = document.getElementById('slider-age');
    this.sliderRhrEl = document.getElementById('slider-rhr');
    this.txtAgeEl = document.getElementById('txt-age');
    this.txtRhrEl = document.getElementById('txt-rhr');
    this.quickAgeBtnsEl = document.querySelectorAll('#quick-age-container .inner-btn');
    this.quickRhrBtnsEl = document.querySelectorAll('#quick-rhr-container .inner-btn');
    this.fitCardsEl = document.querySelectorAll('.fit-card');
    this.btnResetInputsEl = document.getElementById('btn-reset-inputs');
    this.btnCopyResultEl = document.getElementById('btn-copy-result');

    // Outputs
    this.resultMaxHrEl = document.getElementById('result-max-hr');
    this.resultHrrEl = document.getElementById('result-hrr');
    this.targetGoalTitleEl = document.getElementById('target-goal-title');
    this.targetRangeValEl = document.getElementById('target-range-val');
    this.targetGoalDescEl = document.getElementById('target-goal-desc');

    // Visuals & Tables
    this.zoneVisualsEl = document.querySelectorAll('.zone-bar-item');
    this.tableRowsEl = document.querySelectorAll('#thr-zone-table tbody tr');
    this.progCardsEl = document.querySelectorAll('.program-card');

    for (let i = 1; i <= 5; i++) {
      this.zoneRangesEl[i] = document.getElementById(`zone-range-${i}`);
      this.tblRangesEl[i] = document.getElementById(`tbl-range-${i}`);
    }

    // Floating UI
    this.scrollProgressRingEl = document.getElementById('scroll-progress-ring');
    this.progressCircleIndicatorEl = document.getElementById('progress-circle-indicator');
    this.scrollPercentageLblEl = document.getElementById('scroll-percentage-lbl');
    this.btnScrollTopEl = document.getElementById('btn-scroll-top');
    this.btnScrollBottomEl = document.getElementById('btn-scroll-bottom');

    this.bindEvents();
    this.calculateThr();
    this.updateScrollProgress();
  },

  bindEvents() {
    // Goal cards selection
    this.goalCardsEl.forEach(card => {
      card.addEventListener('click', () => {
        SoundEngine.play('click');
        const goal = card.getAttribute('data-goal');
        this.state.goal = goal;
        
        this.goalCardsEl.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        
        this.calculateThr();
      });
    });

    // Age Slider change
    this.sliderAgeEl.addEventListener('input', (e) => {
      this.state.age = parseInt(e.target.value, 10);
      this.txtAgeEl.textContent = this.state.age;
      this.updateInnerAgeButtonsActiveState();
      this.calculateThr();
    });

    // RHR Slider change
    this.sliderRhrEl.addEventListener('input', (e) => {
      this.state.rhr = parseInt(e.target.value, 10);
      this.txtRhrEl.textContent = this.state.rhr;
      this.updateInnerRhrButtonsActiveState();
      this.updateFitnessCardsActiveState();
      this.calculateThr();
    });

    // Quick Age Buttons
    this.quickAgeBtnsEl.forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.play('click');
        const val = parseInt(btn.getAttribute('data-val'), 10);
        this.state.age = val;
        this.sliderAgeEl.value = val;
        this.txtAgeEl.textContent = val;
        this.updateInnerAgeButtonsActiveState();
        this.calculateThr();
      });
    });

    // Quick RHR Buttons
    this.quickRhrBtnsEl.forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.play('click');
        const val = parseInt(btn.getAttribute('data-val'), 10);
        this.state.rhr = val;
        this.sliderRhrEl.value = val;
        this.txtRhrEl.textContent = val;
        this.updateInnerRhrButtonsActiveState();
        this.updateFitnessCardsActiveState();
        this.calculateThr();
      });
    });

    // Fitness cards (RHR connection)
    this.fitCardsEl.forEach(card => {
      card.addEventListener('click', () => {
        SoundEngine.play('click');
        const val = parseInt(card.getAttribute('data-rhr'), 10);
        this.state.rhr = val;
        this.sliderRhrEl.value = val;
        this.txtRhrEl.textContent = val;
        
        this.updateInnerRhrButtonsActiveState();
        this.updateFitnessCardsActiveState();
        this.calculateThr();
      });
    });

    // Reset Inputs
    this.btnResetInputsEl.addEventListener('click', () => {
      SoundEngine.play('success');
      this.state.goal = 'fat-burn';
      this.state.age = 30;
      this.state.rhr = 70;

      // Reset Goals active
      this.goalCardsEl.forEach(c => {
        if (c.getAttribute('data-goal') === 'fat-burn') {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });

      this.sliderAgeEl.value = 30;
      this.txtAgeEl.textContent = 30;

      this.sliderRhrEl.value = 70;
      this.txtRhrEl.textContent = 70;

      this.updateInnerAgeButtonsActiveState();
      this.updateInnerRhrButtonsActiveState();
      this.updateFitnessCardsActiveState();
      this.calculateThr();
    });

    // Copy Result
    this.btnCopyResultEl.addEventListener('click', () => {
      this.copySummaryToClipboard();
    });

    // Scroll handlers
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

  updateInnerAgeButtonsActiveState() {
    this.quickAgeBtnsEl.forEach(btn => {
      const val = parseInt(btn.getAttribute('data-val'), 10);
      if (val === this.state.age) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  },

  updateInnerRhrButtonsActiveState() {
    this.quickRhrBtnsEl.forEach(btn => {
      const val = parseInt(btn.getAttribute('data-val'), 10);
      if (val === this.state.rhr) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  },

  updateFitnessCardsActiveState() {
    this.fitCardsEl.forEach(card => {
      const val = parseInt(card.getAttribute('data-rhr'), 10);
      if (val === this.state.rhr) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  },

  calculateThr() {
    const age = this.state.age;
    const rhr = this.state.rhr;

    // Formulas
    const maxHr = 220 - age;
    const hrr = maxHr - rhr;

    this.resultMaxHrEl.textContent = maxHr;
    this.resultHrrEl.textContent = hrr;

    // Calculate all 5 zones (min & max boundary beats)
    const zones = {
      1: { min: Math.round(hrr * 0.50 + rhr), max: Math.round(hrr * 0.60 + rhr) },
      2: { min: Math.round(hrr * 0.60 + rhr), max: Math.round(hrr * 0.70 + rhr) },
      3: { min: Math.round(hrr * 0.70 + rhr), max: Math.round(hrr * 0.80 + rhr) },
      4: { min: Math.round(hrr * 0.80 + rhr), max: Math.round(hrr * 0.90 + rhr) },
      5: { min: Math.round(hrr * 0.90 + rhr), max: Math.round(hrr * 1.00 + rhr) }
    };

    // Update Zone labels in visual list and table
    for (let i = 1; i <= 5; i++) {
      const rangeText = `${zones[i].min} ~ ${zones[i].max} bpm`;
      this.zoneRangesEl[i].textContent = rangeText;
      this.tblRangesEl[i].textContent = rangeText;
    }

    // Set core target card outputs based on selected goal
    let targetTitle = '';
    let targetRange = '';
    let targetDesc = '';
    let activeZones = []; // Zones to highlight
    let recommendedProgCardId = '';

    switch (this.state.goal) {
      case 'fat-burn':
        targetTitle = '체중 감량 목표 심박수';
        targetRange = `${zones[2].min} ~ ${zones[2].max}`;
        targetDesc = 'Zone 2 (지방 연소 구간)에서 30분 이상 운동하는 것이 내장 지방 연소에 가장 효과적입니다.';
        activeZones = [2];
        recommendedProgCardId = 'prog-card-fat-burn';
        break;
      case 'health-care':
        targetTitle = '건강 유지 목표 심박수';
        targetRange = `${zones[2].min} ~ ${zones[3].max}`;
        targetDesc = 'Zone 2 ~ 3 (유산소 기초 구간)에서 일상적인 지속 운동은 심혈관 노화를 지연시키고 면역력을 증진시킵니다.';
        activeZones = [2, 3];
        recommendedProgCardId = 'prog-card-cardio';
        break;
      case 'cardio':
        targetTitle = '심폐 지구력 목표 심박수';
        targetRange = `${zones[3].min} ~ ${zones[4].max}`;
        targetDesc = 'Zone 3 ~ 4 (심폐 발달 구간)에서 지속형 관리는 젖산 축적 내성을 끌어올려 기초 스태미나를 대폭 향상시킵니다.';
        activeZones = [3, 4];
        recommendedProgCardId = 'prog-card-cardio';
        break;
      case 'performance':
        targetTitle = '운동 능력 목표 심박수';
        targetRange = `${zones[4].min} ~ ${zones[5].max}`;
        targetDesc = 'Zone 4 ~ 5 (고강도 역치 구간)에서 인터벌 트레이닝은 최대 유산소 섭취량(VO2 Max)을 돌파하는 데 적합합니다.';
        activeZones = [4, 5];
        recommendedProgCardId = 'prog-card-performance';
        break;
    }

    this.targetGoalTitleEl.textContent = targetTitle;
    this.targetRangeValEl.innerHTML = `${targetRange} <span class="unit">bpm</span>`;
    this.targetGoalDescEl.textContent = targetDesc;

    // Apply Active highlighting to the visual bars list and table rows
    this.zoneVisualsEl.forEach(item => {
      const z = parseInt(item.getAttribute('data-zone'), 10);
      if (activeZones.includes(z)) {
        item.classList.add('active-highlight');
      } else {
        item.classList.remove('active-highlight');
      }
    });

    this.tableRowsEl.forEach(row => {
      const z = parseInt(row.getAttribute('data-zone'), 10);
      if (activeZones.includes(z)) {
        row.classList.add('active-highlight');
      } else {
        row.classList.remove('active-highlight');
      }
    });

    // Highlight recommended program card
    this.progCardsEl.forEach(card => {
      if (card.id === recommendedProgCardId) {
        card.classList.add('active-highlight');
      } else {
        card.classList.remove('active-highlight');
      }
    });
  },

  copySummaryToClipboard() {
    const age = this.state.age;
    const rhr = this.state.rhr;
    const maxHr = this.resultMaxHrEl.textContent;
    const hrr = this.resultHrrEl.textContent;
    const goalTitle = this.targetGoalTitleEl.textContent;
    const targetRange = this.targetRangeValEl.textContent.trim();
    const targetDesc = this.targetGoalDescEl.textContent;

    const z1 = this.zoneRangesEl[1].textContent;
    const z2 = this.zoneRangesEl[2].textContent;
    const z3 = this.zoneRangesEl[3].textContent;
    const z4 = this.zoneRangesEl[4].textContent;
    const z5 = this.zoneRangesEl[5].textContent;

    const summaryText = `[CineAHO 목표 심박수(THR) 분석 결과]
- 입력 정보: 나이 ${age}세 / 안정시 심박수 ${rhr} bpm
- 최대 심박수: ${maxHr} bpm
- 여유 심박수(HRR): ${hrr} bpm

[맞춤형 권장 심박수]
- ${goalTitle}: ${targetRange}
- 상세 지침: ${targetDesc}

[5단계 심박수 상세 구간]
- Zone 1 (워밍업/회복 50-60%): ${z1}
- Zone 2 (지방 연소 60-70%): ${z2}
- Zone 3 (심폐 능력 개선 70-80%): ${z3}
- Zone 4 (무산소 역치 80-90%): ${z4}
- Zone 5 (최대 노력 90-100%): ${z5}`;

    navigator.clipboard.writeText(summaryText)
      .then(() => {
        SoundEngine.play('success');
        alert("목표 심박수(THR) 처방 결과가 클립보드에 복사되었습니다!\n원하는 곳에 붙여넣어(Ctrl+V) 사용하세요.");
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
