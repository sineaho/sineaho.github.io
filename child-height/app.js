/**
 * CineAHO Child Height Growth Prediction Calculator App Engine
 * 100% Client-side Statistical Calculation and SVG Rendering
 */

// KCDC 2017 Child Growth Chart Data (Ages 1-18, Height Percentiles in cm)
const GROWTH_DATA = {
  boy: {
    1:  { p5: 71.9,  p25: 74.0,  p50: 75.7,  p75: 77.4,  p95: 79.8  },
    2:  { p5: 83.2,  p25: 85.3,  p50: 87.1,  p75: 88.9,  p95: 91.5  },
    3:  { p5: 91.8,  p25: 94.1,  p50: 96.1,  p75: 98.1,  p95: 100.9 },
    4:  { p5: 98.7,  p25: 101.2, p50: 103.3, p75: 105.4, p95: 108.5 },
    5:  { p5: 104.7, p25: 107.3, p50: 109.6, p75: 111.9, p95: 115.1 },
    6:  { p5: 110.2, p25: 113.0, p50: 115.4, p75: 117.8, p95: 121.2 },
    7:  { p5: 115.8, p25: 118.8, p50: 121.5, p75: 124.2, p95: 128.0 },
    8:  { p5: 121.2, p25: 124.5, p50: 127.3, p75: 130.2, p95: 134.4 },
    9:  { p5: 126.3, p25: 129.8, p50: 132.8, p75: 135.9, p95: 140.5 },
    10: { p5: 131.2, p25: 135.0, p50: 138.2, p75: 141.6, p95: 146.9 },
    11: { p5: 136.2, p25: 140.6, p50: 144.3, p75: 148.5, p95: 154.8 },
    12: { p5: 142.4, p25: 147.5, p50: 151.7, p75: 156.5, p95: 163.6 },
    13: { p5: 149.8, p25: 155.3, p50: 159.6, p75: 164.2, p95: 171.1 },
    14: { p5: 156.8, p25: 161.8, p50: 165.7, p75: 169.8, p95: 176.1 },
    15: { p5: 161.8, p25: 166.1, p50: 169.5, p75: 173.1, p95: 178.6 },
    16: { p5: 164.8, p25: 168.6, p50: 171.6, p75: 174.8, p95: 180.0 },
    17: { p5: 166.1, p25: 169.8, p50: 172.9, p75: 175.9, p95: 180.9 },
    18: { p5: 166.8, p25: 170.4, p50: 173.5, p75: 176.4, p95: 181.4 }
  },
  girl: {
    1:  { p5: 70.3,  p25: 72.3,  p50: 74.0,  p75: 75.7,  p95: 78.2  },
    2:  { p5: 81.6,  p25: 83.8,  p50: 85.7,  p75: 87.5,  p95: 90.3  },
    3:  { p5: 90.3,  p25: 92.7,  p50: 94.7,  p75: 96.7,  p95: 99.6  },
    4:  { p5: 97.4,  p25: 99.9,  p50: 102.1, p75: 104.2, p95: 107.5 },
    5:  { p5: 103.3, p25: 106.0, p50: 108.4, p75: 110.7, p95: 114.2 },
    6:  { p5: 108.7, p25: 111.6, p50: 114.1, p75: 116.5, p95: 120.2 },
    7:  { p5: 114.4, p25: 117.5, p50: 120.3, p75: 122.9, p95: 126.9 },
    8:  { p5: 119.8, p25: 123.1, p50: 126.1, p75: 128.9, p95: 133.1 },
    9:  { p5: 125.1, p25: 128.7, p50: 131.9, p75: 135.0, p95: 139.6 },
    10: { p5: 130.6, p25: 134.4, p50: 137.9, p75: 141.2, p95: 146.4 },
    11: { p5: 137.2, p25: 141.4, p50: 145.1, p75: 148.8, p95: 154.5 },
    12: { p5: 143.8, p25: 148.0, p50: 151.4, p75: 154.8, p95: 159.9 },
    13: { p5: 149.0, p25: 152.8, p50: 155.6, p75: 158.4, p95: 162.7 },
    14: { p5: 152.0, p25: 155.5, p50: 158.0, p75: 160.5, p95: 164.5 },
    15: { p5: 153.5, p25: 156.8, p50: 159.2, p75: 161.6, p95: 165.4 },
    16: { p5: 154.2, p25: 157.4, p50: 159.8, p75: 162.1, p95: 165.9 },
    17: { p5: 154.6, p25: 157.8, p50: 160.2, p75: 162.5, p95: 166.3 },
    18: { p5: 155.0, p25: 158.2, p50: 160.7, p75: 163.0, p95: 166.7 }
  }
};

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
      case 'success':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.15);
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
    gender: 'boy',       // 'boy' | 'girl'
    fatherHeight: 175,   // cm
    motherHeight: 160,   // cm
    childAge: 10,        // years
    childHeight: null    // cm (optional)
  },

  // DOM Elements
  btnBoyEl: null,
  btnGirlEl: null,
  sliderFatherEl: null,
  sliderMotherEl: null,
  txtFatherEl: null,
  txtMotherEl: null,
  quickFatherBtnsEl: null,
  quickMotherBtnsEl: null,
  selectAgeEl: null,
  inputHeightEl: null,
  btnResetEl: null,
  btnCopyEl: null,

  resultTargetEl: null,
  resultRangeEl: null,
  avatarEl: null,
  badgeEl: null,
  txtAverageCompareEl: null,

  sumFatherEl: null,
  sumMotherEl: null,
  sumParentsAvgEl: null,

  projectionPanelEl: null,
  childPercentileEl: null,
  childPercentileDescEl: null,
  childProjectedAdultEl: null,
  childProjectedDescEl: null,
  projCompareAdviceEl: null,

  chartSectionEl: null,
  svgChartEl: null,

  // Floating controls
  scrollProgressRingEl: null,
  progressCircleIndicatorEl: null,
  scrollPercentageLblEl: null,
  btnScrollTopEl: null,
  btnScrollBottomEl: null,

  init() {
    // Buttons
    this.btnBoyEl = document.getElementById('btn-gender-boy');
    this.btnGirlEl = document.getElementById('btn-gender-girl');
    this.sliderFatherEl = document.getElementById('slider-father-height');
    this.sliderMotherEl = document.getElementById('slider-mother-height');
    this.txtFatherEl = document.getElementById('txt-father-height');
    this.txtMotherEl = document.getElementById('txt-mother-height');
    this.quickFatherBtnsEl = document.querySelectorAll('#quick-father-height-buttons .qs-btn');
    this.quickMotherBtnsEl = document.querySelectorAll('#quick-mother-height-buttons .qs-btn');
    this.selectAgeEl = document.getElementById('select-child-age');
    this.inputHeightEl = document.getElementById('input-child-height');
    this.btnResetEl = document.getElementById('btn-reset-inputs');
    this.btnCopyEl = document.getElementById('btn-copy-result');

    // Outputs
    this.resultTargetEl = document.getElementById('result-target-height');
    this.resultRangeEl = document.getElementById('result-target-range');
    this.avatarEl = document.getElementById('gender-avatar');
    this.badgeEl = document.getElementById('average-badge-el');
    this.txtAverageCompareEl = document.getElementById('txt-average-compare');

    this.sumFatherEl = document.getElementById('summary-father-height');
    this.sumMotherEl = document.getElementById('summary-mother-height');
    this.sumParentsAvgEl = document.getElementById('summary-parents-avg');

    this.projectionPanelEl = document.getElementById('growth-projection-panel-el');
    this.childPercentileEl = document.getElementById('child-percentile-val');
    this.childPercentileDescEl = document.getElementById('child-percentile-desc');
    this.childProjectedAdultEl = document.getElementById('child-projected-adult');
    this.childProjectedDescEl = document.getElementById('child-projected-desc');
    this.projCompareAdviceEl = document.getElementById('proj-compare-advice');

    this.chartSectionEl = document.getElementById('growth-chart-section-el');
    this.svgChartEl = document.getElementById('svg-growth-chart');

    // Floating controls
    this.scrollProgressRingEl = document.getElementById('scroll-progress-ring');
    this.progressCircleIndicatorEl = document.getElementById('progress-circle-indicator');
    this.scrollPercentageLblEl = document.getElementById('scroll-percentage-lbl');
    this.btnScrollTopEl = document.getElementById('btn-scroll-top');
    this.btnScrollBottomEl = document.getElementById('btn-scroll-bottom');

    this.bindEvents();
    this.calculate();
    this.updateScrollProgress();
  },

  bindEvents() {
    // Gender Toggle
    this.btnBoyEl.addEventListener('click', () => {
      SoundEngine.play('click');
      this.state.gender = 'boy';
      this.btnBoyEl.classList.add('active');
      this.btnGirlEl.classList.remove('active');
      this.avatarEl.parentNode.className = 'target-output-display boy';
      this.avatarEl.innerHTML = '<i class="fa-solid fa-face-smile text-blue"></i>';
      this.calculate();
    });

    this.btnGirlEl.addEventListener('click', () => {
      SoundEngine.play('click');
      this.state.gender = 'girl';
      this.btnGirlEl.classList.add('active');
      this.btnBoyEl.classList.remove('active');
      this.avatarEl.parentNode.className = 'target-output-display girl';
      this.avatarEl.innerHTML = '<i class="fa-solid fa-face-smile-wink text-pink"></i>';
      this.calculate();
    });

    // Sliders
    this.sliderFatherEl.addEventListener('input', (e) => {
      this.state.fatherHeight = parseInt(e.target.value, 10);
      this.txtFatherEl.textContent = this.state.fatherHeight;
      this.updateQuickButtons('father', this.state.fatherHeight);
      this.calculate();
    });

    this.sliderMotherEl.addEventListener('input', (e) => {
      this.state.motherHeight = parseInt(e.target.value, 10);
      this.txtMotherEl.textContent = this.state.motherHeight;
      this.updateQuickButtons('mother', this.state.motherHeight);
      this.calculate();
    });

    // Quick Select Buttons
    this.quickFatherBtnsEl.forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.play('click');
        const val = parseInt(btn.getAttribute('data-val'), 10);
        this.state.fatherHeight = val;
        this.sliderFatherEl.value = val;
        this.txtFatherEl.textContent = val;
        this.updateQuickButtons('father', val);
        this.calculate();
      });
    });

    this.quickMotherBtnsEl.forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.play('click');
        const val = parseInt(btn.getAttribute('data-val'), 10);
        this.state.motherHeight = val;
        this.sliderMotherEl.value = val;
        this.txtMotherEl.textContent = val;
        this.updateQuickButtons('mother', val);
        this.calculate();
      });
    });

    // Child Inputs
    this.selectAgeEl.addEventListener('change', (e) => {
      this.state.childAge = parseInt(e.target.value, 10);
      this.calculate();
    });

    this.inputHeightEl.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val >= 50 && val <= 200) {
        this.state.childHeight = val;
      } else {
        this.state.childHeight = null;
      }
      this.calculate();
    });

    // Reset Inputs
    this.btnResetEl.addEventListener('click', () => {
      SoundEngine.play('success');
      this.state.gender = 'boy';
      this.state.fatherHeight = 175;
      this.state.motherHeight = 160;
      this.state.childAge = 10;
      this.state.childHeight = null;

      // Reset DOM values
      this.btnBoyEl.classList.add('active');
      this.btnGirlEl.classList.remove('active');
      this.avatarEl.parentNode.className = 'target-output-display boy';
      this.avatarEl.innerHTML = '<i class="fa-solid fa-face-smile text-blue"></i>';

      this.sliderFatherEl.value = 175;
      this.txtFatherEl.textContent = 175;
      this.sliderMotherEl.value = 160;
      this.txtMotherEl.textContent = 160;

      this.updateQuickButtons('father', 175);
      this.updateQuickButtons('mother', 160);

      this.selectAgeEl.value = "10";
      this.inputHeightEl.value = "";

      this.calculate();
    });

    // Copy Result
    this.btnCopyEl.addEventListener('click', () => {
      this.copyResult();
    });

    // Scroll control listeners
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

  updateQuickButtons(parent, value) {
    const list = parent === 'father' ? this.quickFatherBtnsEl : this.quickMotherBtnsEl;
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
    const dad = this.state.fatherHeight;
    const mom = this.state.motherHeight;
    const isBoy = this.state.gender === 'boy';

    // Tanner formula: Boy (F + M + 13)/2, Girl (F + M - 13)/2
    let target = isBoy ? (dad + mom + 13) / 2 : (dad + mom - 13) / 2;
    const minTarget = target - 6.5;
    const maxTarget = target + 6.5;

    // National average adult height (Age 18)
    const avgAdult = isBoy ? 173.5 : 160.7;
    const avgDiff = target - avgAdult;

    // Update main text displays
    this.resultTargetEl.innerHTML = `${target.toFixed(1)}<span class="unit">cm</span>`;
    this.resultRangeEl.textContent = `${minTarget.toFixed(1)} - ${maxTarget.toFixed(1)}`;

    this.sumFatherEl.textContent = `${dad}cm`;
    this.sumMotherEl.textContent = `${mom}cm`;
    this.sumParentsAvgEl.textContent = `${((dad + mom) / 2).toFixed(1)}cm`;

    // Average compare text
    let avgText = '';
    if (avgDiff > 0.05) {
      avgText = `전국 평균 대비 +${avgDiff.toFixed(1)}cm (평균 이상)`;
      this.badgeEl.style.borderColor = 'rgba(16, 185, 129, 0.2)';
      this.badgeEl.style.background = 'rgba(16, 185, 129, 0.05)';
      this.txtAverageCompareEl.className = 'text-green';
    } else if (avgDiff < -0.05) {
      avgText = `전국 평균 대비 -${Math.abs(avgDiff).toFixed(1)}cm (평균 이하)`;
      this.badgeEl.style.borderColor = 'rgba(239, 68, 68, 0.2)';
      this.badgeEl.style.background = 'rgba(239, 68, 68, 0.05)';
      this.txtAverageCompareEl.className = 'text-red';
    } else {
      avgText = `전국 평균 수준 (평균)`;
      this.badgeEl.style.borderColor = 'rgba(6, 182, 212, 0.2)';
      this.badgeEl.style.background = 'rgba(6, 182, 212, 0.05)';
      this.txtAverageCompareEl.className = 'text-blue';
    }
    this.txtAverageCompareEl.textContent = avgText;

    // Optional child height analysis
    const childH = this.state.childHeight;
    if (childH !== null) {
      this.projectionPanelEl.style.display = 'block';
      this.chartSectionEl.style.display = 'block';

      const age = this.state.childAge;
      const pct = this.getPercentile(this.state.gender, age, childH);
      const projectedAdult = this.getHeightForPercentile(this.state.gender, 18, pct);

      // Display child results
      this.childPercentileEl.textContent = `또래 ${pct.toFixed(0)}%`;
      
      let rankText = '';
      if (pct > 50) {
        rankText = `100명 중 ${Math.round(101 - pct)}번째로 큼 (평균 이상)`;
      } else {
        rankText = `100명 중 ${Math.round(101 - pct)}번째 (평균 이하)`;
      }
      this.childPercentileDescEl.textContent = rankText;

      this.childProjectedAdultEl.textContent = `${projectedAdult.toFixed(1)}cm`;

      // Peer average comparison
      const peerAvg = GROWTH_DATA[this.state.gender][age].p50;
      const peerDiff = childH - peerAvg;
      let peerText = '';
      if (peerDiff > 0.05) {
        peerText = `또래 평균(${peerAvg.toFixed(1)}cm)보다 +${peerDiff.toFixed(1)}cm 큽니다. `;
      } else if (peerDiff < -0.05) {
        peerText = `또래 평균(${peerAvg.toFixed(1)}cm)보다 -${Math.abs(peerDiff).toFixed(1)}cm 작습니다. `;
      } else {
        peerText = `또래 평균(${peerAvg.toFixed(1)}cm) 수준입니다. `;
      }

      // Comparison advice
      const projDiff = projectedAdult - target;
      let compareText = peerText;
      if (projDiff > 1.5) {
        compareText += `현재 성장 발달이 매우 양호하여 유전적 예상 키(${target.toFixed(1)}cm)보다 더 크게 자랄 가능성(${projectedAdult.toFixed(1)}cm)이 관측됩니다. 꾸준한 양질의 식단과 수면을 유지해 주세요.`;
      } else if (projDiff < -1.5) {
        compareText += `현재 성장 속도 기준 예상 키(${projectedAdult.toFixed(1)}cm)가 유전적 예상 키(${target.toFixed(1)}cm)보다 다소 낮게 예측됩니다. 늦기 전에 운동, 충분한 수면 및 칼슘 등의 고른 영양 보충을 권장합니다.`;
      } else {
        compareText += `현재 키와 성장 궤적상 예상 키(${projectedAdult.toFixed(1)}cm)가 유전적 예상 키(${target.toFixed(1)}cm)와 일치하는 흐름입니다. 타고난 잠재력을 100% 발휘할 수 있도록 지속적인 관리를 유지해 주세요.`;
      }
      this.projCompareAdviceEl.textContent = compareText;

      // Render Dynamic SVG Chart
      this.renderSvgChart(target, age, childH, pct);
    } else {
      this.projectionPanelEl.style.display = 'none';
      this.chartSectionEl.style.display = 'none';
    }
  },

  getPercentile(gender, age, height) {
    const data = GROWTH_DATA[gender][age];
    
    if (height < data.p5) {
      return Math.max(0.1, (height / data.p5) * 5);
    } else if (height < data.p25) {
      return 5 + ((height - data.p5) / (data.p25 - data.p5)) * 20;
    } else if (height < data.p50) {
      return 25 + ((height - data.p25) / (data.p50 - data.p25)) * 25;
    } else if (height < data.p75) {
      return 50 + ((height - data.p50) / (data.p75 - data.p50)) * 25;
    } else if (height < data.p95) {
      return 75 + ((height - data.p75) / (data.p95 - data.p75)) * 20;
    } else {
      return 95 + Math.min(4.9, ((height - data.p95) / (data.p95 * 0.15)) * 5);
    }
  },

  getHeightForPercentile(gender, age, percentile) {
    const data = GROWTH_DATA[gender][age];

    if (percentile < 5) {
      return data.p5 - (5 - percentile) * 0.8;
    } else if (percentile < 25) {
      return data.p5 + ((percentile - 5) / 20) * (data.p25 - data.p5);
    } else if (percentile < 50) {
      return data.p25 + ((percentile - 25) / 25) * (data.p50 - data.p25);
    } else if (percentile < 75) {
      return data.p50 + ((percentile - 50) / 25) * (data.p75 - data.p50);
    } else if (percentile < 95) {
      return data.p75 + ((percentile - 75) / 20) * (data.p95 - data.p75);
    } else {
      return data.p95 + (percentile - 95) * 0.8;
    }
  },

  renderSvgChart(targetHeight, childAge, childHeight, percentile) {
    const gender = this.state.gender;
    const isBoy = gender === 'boy';
    const accentColor = isBoy ? '#3b82f6' : '#ec4899';
    
    // SVG Size mapping
    const svgW = 600;
    const svgH = 320;
    
    // Limits
    const minAge = 1;
    const maxAge = 18;
    const minH = 60;
    const maxH = 190;

    const padLeft = 45;
    const padRight = 35;
    const padTop = 20;
    const padBottom = 30;

    const chartW = svgW - padLeft - padRight;
    const chartH = svgH - padTop - padBottom;

    // Helper functions for mapping coordinates
    const mapX = (age) => padLeft + ((age - minAge) / (maxAge - minAge)) * chartW;
    const mapY = (height) => padBottom + chartH - ((height - minH) / (maxH - minH)) * chartH; // SVG coordinate y goes downwards

    let svgInnerHtml = `
      <!-- Definition elements -->
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="${accentColor}" stop-opacity="0.01"/>
        </linearGradient>
        <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#10b981" stop-opacity="0.05"/>
        </linearGradient>
      </defs>
    `;

    // 1. Grid Lines
    // Age grids (X)
    for (let a = 1; a <= 18; a++) {
      if (a === 1 || a % 2 === 0 || a === 18) {
        const x = mapX(a);
        svgInnerHtml += `
          <line x1="${x}" y1="${padTop}" x2="${x}" y2="${svgH - padBottom}" class="chart-grid-line" />
          <text x="${x}" y="${svgH - 12}" text-anchor="middle" class="chart-axis-label">${a}세</text>
        `;
      }
    }

    // Height grids (Y)
    for (let h = minH; h <= maxH; h += 20) {
      const y = mapY(h);
      svgInnerHtml += `
        <line x1="${padLeft}" y1="${y}" x2="${svgW - padRight}" y2="${y}" class="chart-grid-line" />
        <text x="${padLeft - 8}" y="${y + 3}" text-anchor="end" class="chart-axis-label">${h}</text>
      `;
    }

    // Y Axis Title
    svgInnerHtml += `
      <text x="${padLeft - 10}" y="${padTop - 5}" text-anchor="middle" class="chart-axis-label" style="font-weight: 700;">(cm)</text>
    `;

    // 2. Percentile Curves Calculations
    let pathP5 = '', pathP50 = '', pathP95 = '', areaPoints = [];

    for (let a = 1; a <= 18; a++) {
      const x = mapX(a);
      const hP5 = GROWTH_DATA[gender][a].p5;
      const hP50 = GROWTH_DATA[gender][a].p50;
      const hP95 = GROWTH_DATA[gender][a].p95;

      const yP5 = mapY(hP5);
      const yP50 = mapY(hP50);
      const yP95 = mapY(hP95);

      if (a === 1) {
        pathP5 += `M ${x} ${yP5}`;
        pathP50 += `M ${x} ${yP50}`;
        pathP95 += `M ${x} ${yP95}`;
      } else {
        pathP5 += ` L ${x} ${yP5}`;
        pathP50 += ` L ${x} ${yP50}`;
        pathP95 += ` L ${x} ${yP95}`;
      }

      areaPoints.push({ x, y: yP95 });
    }

    // Trace back for P5 to make area polygon
    for (let a = 18; a >= 1; a--) {
      const x = mapX(a);
      const hP5 = GROWTH_DATA[gender][a].p5;
      const yP5 = mapY(hP5);
      areaPoints.push({ x, y: yP5 });
    }

    // Normal Range Polygon Area
    let polygonPoints = areaPoints.map(p => `${p.x},${p.y}`).join(' ');
    svgInnerHtml += `
      <polygon points="${polygonPoints}" fill="url(#areaGrad)" />
    `;

    // Draw lines
    svgInnerHtml += `
      <path d="${pathP5}" class="chart-line-p5" />
      <path d="${pathP50}" class="chart-line-p50" />
      <path d="${pathP95}" class="chart-line-p95" />
    `;

    // 3. Genetic target range vertical rectangle at age 18
    const minTargetH = targetHeight - 6.5;
    const maxTargetH = targetHeight + 6.5;
    const yMinTarget = mapY(minTargetH);
    const yMaxTarget = mapY(maxTargetH);
    const xAge18 = mapX(18);

    svgInnerHtml += `
      <!-- Genetic target region -->
      <polygon points="${xAge18 - 8},${yMaxTarget} ${xAge18 + 8},${yMaxTarget} ${xAge18 + 8},${yMinTarget} ${xAge18 - 8},${yMinTarget}" fill="url(#targetGrad)" stroke="#10b981" stroke-width="1" stroke-opacity="0.3" rx="4" />
      <!-- Target height marker line -->
      <line x1="${xAge18 - 12}" y1="${mapY(targetHeight)}" x2="${xAge18 + 12}" y2="${mapY(targetHeight)}" stroke="#10b981" stroke-width="2" />
    `;

    // 4. Child's Projected Growth Path
    let pathChild = '';
    for (let a = 1; a <= 18; a++) {
      const hChild = this.getHeightForPercentile(gender, a, percentile);
      const x = mapX(a);
      const y = mapY(hChild);

      if (a === 1) {
        pathChild += `M ${x} ${y}`;
      } else {
        pathChild += ` L ${x} ${y}`;
      }
    }

    // Glowing Child path
    svgInnerHtml += `
      <path d="${pathChild}" class="chart-line-child" stroke="${accentColor}" style="filter: drop-shadow(0 0 4px ${accentColor});" />
    `;

    // Dot at current age
    const xChildCurrent = mapX(childAge);
    const yChildCurrent = mapY(childHeight);
    svgInnerHtml += `
      <circle cx="${xChildCurrent}" cy="${yChildCurrent}" r="7" class="chart-dot-child" fill="${accentColor}" />
      <text x="${xChildCurrent}" y="${yChildCurrent - 12}" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="10" font-weight="700" fill="#fff">${childHeight.toFixed(0)}cm</text>
    `;

    // Dot at final age 18
    const finalProjected = this.getHeightForPercentile(gender, 18, percentile);
    const yChildFinal = mapY(finalProjected);
    svgInnerHtml += `
      <circle cx="${xAge18}" cy="${yChildFinal}" r="5" class="chart-dot-child" fill="${accentColor}" />
      <text x="${xAge18 - 12}" y="${yChildFinal + 3}" text-anchor="end" font-family="'Outfit', sans-serif" font-size="10" font-weight="700" fill="${accentColor}">${finalProjected.toFixed(1)}cm</text>
    `;

    this.svgChartEl.innerHTML = svgInnerHtml;
  },

  copyResult() {
    const isBoy = this.state.gender === 'boy';
    const genderText = isBoy ? '남자아이' : '여자아이';
    const dad = this.state.fatherHeight;
    const mom = this.state.motherHeight;
    
    // Tanner results
    let target = isBoy ? (dad + mom + 13) / 2 : (dad + mom - 13) / 2;
    const minTarget = target - 6.5;
    const maxTarget = target + 6.5;

    const avgAdult = isBoy ? 173.5 : 160.7;
    const avgDiff = target - avgAdult;
    let avgComp = avgDiff > 0 ? `+${avgDiff.toFixed(1)}cm` : `${avgDiff.toFixed(1)}cm`;

    let summaryText = `[CineAHO 아이 예상 키 분석 결과]
- 자녀 성별: ${genderText}
- 아빠 키: ${dad} cm
- 엄마 키: ${mom} cm
- 유전적 예상 키: ${target.toFixed(1)} cm (오차 범위: ${minTarget.toFixed(1)} ~ ${maxTarget.toFixed(1)} cm)
- 전국 평균 대비: ${avgComp}`;

    // Child growth details if filled
    const childH = this.state.childHeight;
    if (childH !== null) {
      const age = this.state.childAge;
      const pct = this.getPercentile(this.state.gender, age, childH);
      const projectedAdult = this.getHeightForPercentile(this.state.gender, 18, pct);
      const peerAvg = GROWTH_DATA[this.state.gender][age].p50;
      const peerDiff = childH - peerAvg;
      let peerComp = peerDiff > 0 ? `+${peerDiff.toFixed(1)}cm` : `${peerDiff.toFixed(1)}cm`;

      summaryText += `\n\n[현재 자녀 성장 진단]
- 현재 상태: 만 ${age}세 / ${childH} cm
- 또래 평균 대비: ${peerComp} (전국 백분위: 하위 ${pct.toFixed(0)}%)
- 성장 곡선 예측 키: ${projectedAdult.toFixed(1)} cm (현재 속도로 계속 성장 시)`;
    }

    summaryText += `\n\n* 본 결과는 통계적 모델에 기초한 참고용 수치입니다. 바른 식습관, 운동, 수면을 통해 숨겨진 성장을 최대화하세요!`;

    navigator.clipboard.writeText(summaryText)
      .then(() => {
        SoundEngine.play('success');
        alert("예상 키 분석 결과가 클립보드에 복사되었습니다!\n원하는 곳에 붙여넣어(Ctrl+V) 사용하세요.");
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
