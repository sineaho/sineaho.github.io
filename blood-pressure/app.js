/* --------------------------------------------------
   CineAHO Blood Pressure Stage/Risk Checker
   JavaScript Engine - Calculations & Dynamic UI
-------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const rangeSystolic = document.getElementById('range-systolic');
  const valSystolic = document.getElementById('val-systolic');
  const presetsSystolic = document.getElementById('presets-systolic');

  const rangeDiastolic = document.getElementById('range-diastolic');
  const valDiastolic = document.getElementById('val-diastolic');
  const presetsDiastolic = document.getElementById('presets-diastolic');

  const btnReset = document.getElementById('btn-reset-inputs');

  // Result displays
  const bpResultBanner = document.getElementById('bp-result-banner');
  const bpStageName = document.getElementById('bp-stage-name');
  const displayBp = document.getElementById('display-bp');
  const bpRiskLevel = document.getElementById('bp-risk-level');
  const bpActionDesc = document.getElementById('bp-action-desc');

  // Secondary metrics
  const valPulsePressure = document.getElementById('val-pulse-pressure');
  const statusPulsePressure = document.getElementById('status-pulse-pressure');
  const valMap = document.getElementById('val-map');
  const statusMap = document.getElementById('status-map');

  // Emergency warnings
  const emergencyAlert = document.getElementById('emergency-alert');

  // Table rows for active highlights
  const tableRows = {
    hypo: document.querySelector('.row-hypo'),
    normal: document.querySelector('.row-normal'),
    elevated: document.querySelector('.row-elevated'),
    stage1: document.querySelector('.row-stage1'),
    stage2: document.querySelector('.row-stage2'),
    crisis: document.querySelector('.row-crisis')
  };

  // --- Initial / Default State ---
  const DEFAULTS = {
    systolic: 120,
    diastolic: 80
  };

  let currentState = { ...DEFAULTS };

  // --- LocalStorage Logic ---
  const STORAGE_KEY = 'cineaho_blood_pressure_autosave';

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
  }

  function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        currentState = { ...DEFAULTS, ...parsed };
      } catch (err) {
        console.error('Failed to parse saved state:', err);
      }
    }
  }

  // --- BP Classification Logic ---
  function getBPClassification(sys, dia) {
    if (sys >= 180 || dia >= 120) {
      return {
        key: 'crisis',
        name: '고혈압 위기',
        risk: '위험도: 매우 높음',
        desc: '⚠️ 고혈압 위기 상황입니다! 즉각 병원을 방문하거나 119에 연락해 진료를 받으십시오. 휴식을 취한 후 다시 측정해도 이 범주라면 지체하지 마십시오.'
      };
    } else if (sys >= 140 || dia >= 90) {
      return {
        key: 'stage2',
        name: '고혈압 2기',
        risk: '위험도: 높음',
        desc: '고혈압 2기 단계입니다. 심뇌혈관 질환 예방을 위해 의사의 정밀 진단 및 처방에 따른 지속적인 약물 복용과 엄격한 생활 관리가 필요합니다.'
      };
    } else if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) {
      return {
        key: 'stage1',
        name: '고혈압 1기',
        risk: '위험도: 보통',
        desc: '고혈압 1기 단계입니다. 심혈관 질환 위험도에 따라 약물 복용이 필요할 수 있으므로, 전문의와 상담하고 생활습관을 적극 개선해야 합니다.'
      };
    } else if (sys < 90 || dia < 60) {
      return {
        key: 'hypo',
        name: '저혈압',
        risk: '위험도: 낮음',
        desc: '수치상 저혈압에 해당합니다. 어지러움이나 실신 증상이 동반될 경우 위험할 수 있으니 충분한 수분을 섭취하고 기립 시 천천히 일어나야 하며 전문의 상담을 권합니다.'
      };
    } else if (sys >= 120 && sys <= 129 && dia < 80) {
      return {
        key: 'elevated',
        name: '주의 혈압',
        risk: '위험도: 낮음',
        desc: '혈압이 정상보다 다소 높습니다. 고혈압으로 발전하는 것을 막기 위해 식생활 개선(염분 제한) 및 체중 관리, 꾸준한 유산소 운동이 권장됩니다.'
      };
    } else {
      return {
        key: 'normal',
        name: '정상 혈압',
        risk: '위험도: 최저',
        desc: '현재 혈압이 건강한 범위 내에 있습니다. 이 혈압을 계속 유지할 수 있도록 싱겁게 먹기, 꾸준히 유산소 운동하기 등 올바른 생활 습관을 유지해 주세요.'
      };
    }
  }

  // --- Dynamic UI updates ---
  function updateUI() {
    const sys = currentState.systolic;
    const dia = currentState.diastolic;

    // Apply values to text
    valSystolic.textContent = sys;
    valDiastolic.textContent = dia;

    // Apply values to inputs
    rangeSystolic.value = sys;
    rangeDiastolic.value = dia;

    // Highlight active preset button
    updatePresetHighlight(presetsSystolic, sys);
    updatePresetHighlight(presetsDiastolic, dia);

    // Get classification details
    const bpClass = getBPClassification(sys, dia);

    // Update Result Banner
    bpStageName.textContent = bpClass.name;
    displayBp.textContent = `${sys} / ${dia}`;
    bpRiskLevel.textContent = bpClass.risk;
    bpActionDesc.textContent = bpClass.desc;

    // Apply color theme class to Result card banner
    bpResultBanner.className = 'result-card glass-panel'; // clear previous
    bpResultBanner.classList.add(`bp-${bpClass.key}`);

    // Update Emergency warning card display
    if (bpClass.key === 'crisis') {
      emergencyAlert.style.display = 'flex';
    } else {
      emergencyAlert.style.display = 'none';
    }

    // Update table row active highlight
    updateTableRowHighlight(bpClass.key);

    // Calculate secondary metrics
    const pulsePressure = sys - dia;
    const map = Math.round(dia + (pulsePressure / 3));

    // Update Pulse Pressure Widget
    valPulsePressure.innerHTML = `${pulsePressure} <small>mmHg</small>`;
    statusPulsePressure.className = 'metric-status';
    if (pulsePressure >= 35 && pulsePressure <= 45) {
      statusPulsePressure.textContent = '정상';
      statusPulsePressure.classList.add('status-normal');
    } else if (pulsePressure > 45 && pulsePressure <= 55) {
      statusPulsePressure.textContent = '약간 높음';
      statusPulsePressure.classList.add('status-warn');
    } else {
      statusPulsePressure.textContent = pulsePressure > 55 ? '경고 (경직)' : '낮음';
      statusPulsePressure.classList.add('status-alert');
    }

    // Update MAP Widget
    valMap.innerHTML = `${map} <small>mmHg</small>`;
    statusMap.className = 'metric-status';
    if (map >= 70 && map <= 100) {
      statusMap.textContent = '정상';
      statusMap.classList.add('status-normal');
    } else if (map > 100 && map <= 110) {
      statusMap.textContent = '주의';
      statusMap.classList.add('status-warn');
    } else {
      statusMap.textContent = map < 70 ? '낮음 (관류부족)' : '높음 (위험)';
      statusMap.classList.add('status-alert');
    }
  }

  // --- Preset Button Helper ---
  function updatePresetHighlight(container, currentValue) {
    const buttons = container.querySelectorAll('.btn-preset');
    buttons.forEach(btn => {
      if (parseInt(btn.dataset.value, 10) === currentValue) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // --- Table Row Highlight Helper ---
  function updateTableRowHighlight(activeKey) {
    for (const key in tableRows) {
      const row = tableRows[key];
      if (!row) continue;
      
      // Clear active styles
      row.className = row.className.replace(/row-active-\w+/g, '').trim();
      
      // Add active style if matching
      if (key === activeKey) {
        row.classList.add(`row-active-${activeKey}`);
      }
    }
  }

  // --- Event Listeners Setup ---

  // Systolic range changes
  rangeSystolic.addEventListener('input', (e) => {
    currentState.systolic = parseInt(e.target.value, 10);
    saveState();
    updateUI();
  });

  presetsSystolic.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-preset')) {
      currentState.systolic = parseInt(e.target.dataset.value, 10);
      saveState();
      updateUI();
    }
  });

  // Diastolic range changes
  rangeDiastolic.addEventListener('input', (e) => {
    currentState.diastolic = parseInt(e.target.value, 10);
    saveState();
    updateUI();
  });

  presetsDiastolic.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-preset')) {
      currentState.diastolic = parseInt(e.target.dataset.value, 10);
      saveState();
      updateUI();
    }
  });

  // Reset Button
  btnReset.addEventListener('click', () => {
    if (confirm('모든 입력 값을 초기 설정으로 돌리시겠습니까?')) {
      currentState = { ...DEFAULTS };
      saveState();
      updateUI();
    }
  });

  // --- Theme Syncing ---
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      setTimeout(() => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
      }, 50);
    });
  }

  // --- Run Initialization ---
  loadState();
  updateUI();
});
