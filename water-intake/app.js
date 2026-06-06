/* --------------------------------------------------
   CineAHO Daily Recommended Water Intake Calculator
   JavaScript Engine - Calculations & Dynamic UI
-------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const rangeWeight = document.getElementById('range-weight');
  const valWeight = document.getElementById('val-weight');
  const presetsWeight = document.getElementById('presets-weight');

  const rangeExercise = document.getElementById('range-exercise');
  const valExercise = document.getElementById('val-exercise');
  const presetsExercise = document.getElementById('presets-exercise');

  const rangeCaffeine = document.getElementById('range-caffeine');
  const valCaffeine = document.getElementById('val-caffeine');
  const presetsCaffeine = document.getElementById('presets-caffeine');

  const optionsClimate = document.getElementById('options-climate');
  const optionsActivity = document.getElementById('options-activity');

  const btnReset = document.getElementById('btn-reset-inputs');

  // Result displays
  const totalLiters = document.getElementById('total-liters');
  const totalMl = document.getElementById('total-ml');
  const totalCups = document.getElementById('total-cups');
  const gridCupsContainer = document.getElementById('grid-cups-container');
  const waveBg = document.getElementById('wave-bg');

  // Breakdown fields
  const breakdownBase = document.getElementById('breakdown-base');
  const breakdownExercise = document.getElementById('breakdown-exercise');
  const breakdownClimate = document.getElementById('breakdown-climate');
  const breakdownActivity = document.getElementById('breakdown-activity');
  const breakdownCaffeine = document.getElementById('breakdown-caffeine');
  const breakdownTotal = document.getElementById('breakdown-total');

  // Slots fields
  const slotMorning = document.getElementById('slot-morning');
  const slotAfternoon = document.getElementById('slot-afternoon');
  const slotEvening = document.getElementById('slot-evening');

  // Drink equivalents
  const equivalentMl = document.getElementById('equivalent-ml');
  const eqWater = document.getElementById('eq-water');
  const eqMilk = document.getElementById('eq-milk');
  const eqSports = document.getElementById('eq-sports');
  const eqCoffee = document.getElementById('eq-coffee');
  const eqBeer = document.getElementById('eq-beer');
  const eqSoda = document.getElementById('eq-soda');

  // --- Initial / Default State ---
  const DEFAULTS = {
    weight: 70,
    exercise: 30,
    climate: 'normal',
    activity: 'sitting',
    caffeine: 1,
    drankCups: 0
  };

  let currentState = { ...DEFAULTS };

  // --- LocalStorage Logic ---
  const STORAGE_KEY = 'cineaho_water_intake_autosave';

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

  // --- Calculations ---
  function calculateHydration() {
    // 1. Base Hydration: Weight * 33 ml
    const base = currentState.weight * 33;

    // 2. Exercise addition: (Exercise minutes / 30) * 350 ml
    const exercise = Math.round((currentState.exercise / 30) * 350);

    // 3. Climate adjustments
    let climateOffset = 0;
    switch (currentState.climate) {
      case 'hot': climateOffset = 250; break;
      case 'humid': climateOffset = 150; break;
      case 'cold': climateOffset = -100; break;
      default: climateOffset = 0;
    }

    // 4. Activity adjustments
    let activityOffset = 0;
    switch (currentState.activity) {
      case 'light': activityOffset = 150; break;
      case 'moderate': activityOffset = 300; break;
      case 'active': activityOffset = 500; break;
      default: activityOffset = 0;
    }

    // 5. Caffeine adjustments: Cups * 150 ml (due to diuretic effects)
    const caffeineOffset = currentState.caffeine * 150;

    // Total Calculation
    const total = base + exercise + climateOffset + activityOffset + caffeineOffset;

    return {
      base,
      exercise,
      climate: climateOffset,
      activity: activityOffset,
      caffeine: caffeineOffset,
      total: Math.max(500, total) // minimum safety bound
    };
  }

  // --- UI Update ---
  function updateUI() {
    // Get current calculated values
    const result = calculateHydration();
    const total = result.total;

    // Update Input values on UI
    rangeWeight.value = currentState.weight;
    valWeight.textContent = currentState.weight;

    rangeExercise.value = currentState.exercise;
    valExercise.textContent = currentState.exercise;

    rangeCaffeine.value = currentState.caffeine;
    valCaffeine.textContent = currentState.caffeine;

    // Update active state in preset buttons
    updatePresetHighlight(presetsWeight, currentState.weight);
    updatePresetHighlight(presetsExercise, currentState.exercise);
    updatePresetHighlight(presetsCaffeine, currentState.caffeine);

    // Update climate option buttons
    const climateBtns = optionsClimate.querySelectorAll('.btn-option');
    climateBtns.forEach(btn => {
      if (btn.dataset.value === currentState.climate) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update activity option buttons
    const activityBtns = optionsActivity.querySelectorAll('.btn-option');
    activityBtns.forEach(btn => {
      if (btn.dataset.value === currentState.activity) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update droplet values
    const litersVal = (total / 1000).toFixed(1);
    totalLiters.textContent = litersVal;
    totalMl.textContent = total.toLocaleString();

    const cupsVal = Math.ceil(total / 250);
    totalCups.textContent = cupsVal;

    // Update breakdown table
    breakdownBase.textContent = `${result.base.toLocaleString()} ml`;
    breakdownExercise.textContent = `${result.exercise >= 0 ? '+' : ''}${result.exercise.toLocaleString()} ml`;
    breakdownClimate.textContent = `${result.climate >= 0 ? '+' : ''}${result.climate.toLocaleString()} ml`;
    breakdownActivity.textContent = `${result.activity >= 0 ? '+' : ''}${result.activity.toLocaleString()} ml`;
    breakdownCaffeine.textContent = `+${result.caffeine.toLocaleString()} ml`;
    breakdownTotal.textContent = `${total.toLocaleString()} ml`;

    // Update slots
    const morningMl = Math.round(total * 0.3);
    const afternoonMl = Math.round(total * 0.4);
    const eveningMl = Math.round(total * 0.3);

    slotMorning.textContent = `${morningMl.toLocaleString()} ml`;
    slotAfternoon.textContent = `${afternoonMl.toLocaleString()} ml`;
    slotEvening.textContent = `${eveningMl.toLocaleString()} ml`;

    // Update drink equivalents
    equivalentMl.textContent = total.toLocaleString();
    eqWater.textContent = (total / 250).toFixed(1);
    eqMilk.textContent = (total / 200).toFixed(1);
    eqSports.textContent = (total / 250).toFixed(1);
    eqCoffee.textContent = (total / 150).toFixed(1); // 150ml hydration efficiency
    eqBeer.textContent = (total / 150).toFixed(1);   // 150ml hydration efficiency
    eqSoda.textContent = (total / 200).toFixed(1);   // 200ml hydration efficiency

    // Render Cups Visualizer Grid
    renderCupsGrid(cupsVal);
    
    // Adjust water droplet wave height based on how many cups they have drunk
    updateDropletWave(cupsVal);
  }

  // --- Update Preset Button Highlight ---
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

  // --- Render Cups Visualizer ---
  function renderCupsGrid(requiredCups) {
    gridCupsContainer.innerHTML = '';
    
    // Safety check for drank cups exceeding recommended cups
    if (currentState.drankCups > requiredCups) {
      currentState.drankCups = requiredCups;
    }

    // We render requiredCups count of cups.
    for (let i = 1; i <= requiredCups; i++) {
      const cup = document.createElement('i');
      cup.className = 'fa-solid fa-glass-water cup-icon-item';
      cup.dataset.index = i;
      cup.title = `${i}번째 잔 (250ml)`;
      
      // If cup index <= drankCups, mark as active
      if (i <= currentState.drankCups) {
        cup.classList.add('active');
      }

      // Add click listener to toggle drank status
      cup.addEventListener('click', () => {
        if (i <= currentState.drankCups) {
          // If clicked on an already active cup, set drank count to the cup before it (to toggle off)
          currentState.drankCups = i - 1;
        } else {
          // Set drank count to this cup index
          currentState.drankCups = i;
        }
        
        saveState();
        updateDrankStatusOnCups(requiredCups);
        updateDropletWave(requiredCups);
      });

      gridCupsContainer.appendChild(cup);
    }
  }

  // --- Update drank status visually on cups without full re-render ---
  function updateDrankStatusOnCups(requiredCups) {
    const cups = gridCupsContainer.querySelectorAll('.cup-icon-item');
    cups.forEach(cup => {
      const idx = parseInt(cup.dataset.index, 10);
      if (idx <= currentState.drankCups) {
        cup.classList.add('active');
      } else {
        cup.classList.remove('active');
      }
    });
  }

  // --- Update wave height inside droplet ---
  function updateDropletWave(requiredCups) {
    if (requiredCups === 0) return;
    
    // Wave bottom starts at -40% (completely empty) and reaches 10% (filled up)
    const ratio = currentState.drankCups / requiredCups;
    const bottomPercentage = -40 + (ratio * 50); // scales from -40% to 10%
    
    waveBg.style.bottom = `${bottomPercentage}%`;
  }

  // --- Event Listeners Setup ---

  // Weight
  rangeWeight.addEventListener('input', (e) => {
    currentState.weight = parseInt(e.target.value, 10);
    saveState();
    updateUI();
  });

  presetsWeight.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-preset')) {
      currentState.weight = parseInt(e.target.dataset.value, 10);
      saveState();
      updateUI();
    }
  });

  // Exercise Time
  rangeExercise.addEventListener('input', (e) => {
    currentState.exercise = parseInt(e.target.value, 10);
    saveState();
    updateUI();
  });

  presetsExercise.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-preset')) {
      currentState.exercise = parseInt(e.target.dataset.value, 10);
      saveState();
      updateUI();
    }
  });

  // Caffeine
  rangeCaffeine.addEventListener('input', (e) => {
    currentState.caffeine = parseInt(e.target.value, 10);
    saveState();
    updateUI();
  });

  presetsCaffeine.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-preset')) {
      currentState.caffeine = parseInt(e.target.dataset.value, 10);
      saveState();
      updateUI();
    }
  });

  // Climate Options
  optionsClimate.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-option');
    if (btn) {
      currentState.climate = btn.dataset.value;
      saveState();
      updateUI();
    }
  });

  // Activity Options
  optionsActivity.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-option');
    if (btn) {
      currentState.activity = btn.dataset.value;
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
  // Listen for main dashboard theme toggle changes if applicable
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      // Small timeout to allow body dataset theme changes to commit
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
