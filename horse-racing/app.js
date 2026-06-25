/**
 * CineAHO Coin Horse Racing - Game Engine & Sound Synthesizer
 */

// Sound Synthesizer using Web Audio API
const SoundEngine = {
  ctx: null,
  enabled: true,

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio not supported in this browser", e);
    }
  },

  play(type) {
    if (!this.enabled) return;
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
        osc.frequency.setValueAtTime(1000, t);
        gainNode.gain.setValueAtTime(baseGain * 0.5, t);
        gainNode.gain.linearRampToValueAtTime(0.01, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
        break;

      case 'beep-countdown':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, t);
        gainNode.gain.setValueAtTime(baseGain * 0.8, t);
        gainNode.gain.linearRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;

      case 'beep-go':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);
        gainNode.gain.setValueAtTime(baseGain * 1.2, t);
        gainNode.gain.linearRampToValueAtTime(0.01, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        break;

      case 'trumpet-start':
        // Classic horse race fanfare arpeggio: C4 -> E4 -> G4 -> C5 -> G4 -> C5
        const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 523.25];
        const durations = [0.12, 0.12, 0.12, 0.24, 0.12, 0.4];
        let delay = 0;
        notes.forEach((freq, idx) => {
          const trumpOsc = this.ctx.createOscillator();
          const trumpGain = this.ctx.createGain();
          trumpOsc.connect(trumpGain);
          trumpGain.connect(this.ctx.destination);

          trumpOsc.type = 'triangle'; // brassy quality
          trumpOsc.frequency.setValueAtTime(freq, t + delay);
          trumpGain.gain.setValueAtTime(baseGain * 0.8, t + delay);
          trumpGain.gain.exponentialRampToValueAtTime(0.01, t + delay + durations[idx] - 0.02);

          trumpOsc.start(t + delay);
          trumpOsc.stop(t + delay + durations[idx]);
          delay += durations[idx];
        });
        break;

      case 'whip':
        // Noise band-pass crack sound
        if (this.ctx.createBiquadFilter) {
          const bufferSize = this.ctx.sampleRate * 0.05; // 50ms buffer
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }

          const noiseNode = this.ctx.createBufferSource();
          noiseNode.buffer = buffer;

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 1800;

          const noiseGain = this.ctx.createGain();
          noiseGain.gain.setValueAtTime(baseGain * 2, t);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

          noiseNode.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(this.ctx.destination);

          noiseNode.start(t);
        } else {
          // Fallback simple sweep
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(2000, t);
          osc.frequency.exponentialRampToValueAtTime(200, t + 0.08);
          gainNode.gain.setValueAtTime(baseGain, t);
          gainNode.gain.linearRampToValueAtTime(0.01, t + 0.08);
          osc.start(t);
          osc.stop(t + 0.08);
        }
        break;

      case 'gallop-single':
        // A single double-tap sound (clip-clop)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.linearRampToValueAtTime(20, t + 0.04);
        gainNode.gain.setValueAtTime(baseGain * 0.4, t);
        gainNode.gain.linearRampToValueAtTime(0.01, t + 0.04);
        osc.start(t);
        osc.stop(t + 0.04);

        setTimeout(() => {
          if (!this.ctx || this.ctx.state === 'closed') return;
          const osc2 = this.ctx.createOscillator();
          const gain2 = this.ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(this.ctx.destination);
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(90, this.ctx.currentTime);
          osc2.frequency.linearRampToValueAtTime(10, this.ctx.currentTime + 0.04);
          gain2.gain.setValueAtTime(baseGain * 0.35, this.ctx.currentTime);
          gain2.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);
          osc2.start(this.ctx.currentTime);
          osc2.stop(this.ctx.currentTime + 0.04);
        }, 60);
        break;

      case 'win-fanfare':
        // Ascending happy arpeggio C4-E4-G4-C5-E5-G5-C6
        const winNotes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
        winNotes.forEach((freq, idx) => {
          const noteOsc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(this.ctx.destination);
          
          noteOsc.type = 'sine';
          noteOsc.frequency.setValueAtTime(freq, t + idx * 0.08);
          noteGain.gain.setValueAtTime(baseGain * 0.6, t + idx * 0.08);
          noteGain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.08 + 0.3);
          
          noteOsc.start(t + idx * 0.08);
          noteOsc.stop(t + idx * 0.08 + 0.3);
        });
        break;

      case 'lose-fanfare':
        // Descending sad sound C4-B3-Ab3-G3
        const loseNotes = [261.63, 246.94, 207.65, 196.00];
        loseNotes.forEach((freq, idx) => {
          const noteOsc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(this.ctx.destination);
          
          noteOsc.type = 'sawtooth';
          noteOsc.frequency.setValueAtTime(freq, t + idx * 0.15);
          noteGain.gain.setValueAtTime(baseGain * 0.5, t + idx * 0.15);
          noteGain.gain.linearRampToValueAtTime(0.01, t + idx * 0.15 + 0.25);
          
          noteOsc.start(t + idx * 0.15);
          noteOsc.stop(t + idx * 0.15 + 0.25);
        });
        break;
    }
  }
};

const HorseGame = {
  // Preset Horse templates
  horseTemplates: [
    { id: 1, name: '빨간말 (Red)', color: '#f43f5e', emoji: '🐎🔴', colorClass: 'red' },
    { id: 2, name: '파란말 (Blue)', color: '#3b82f6', emoji: '🐎🔵', colorClass: 'blue' },
    { id: 3, name: '초록말 (Green)', color: '#10b981', emoji: '🐎🟢', colorClass: 'green' },
    { id: 4, name: '노란말 (Yellow)', color: '#fbbf24', emoji: '🐎🟡', colorClass: 'yellow' },
    { id: 5, name: '보랏말 (Purple)', color: '#a855f7', emoji: '🐎🟣', colorClass: 'purple' },
    { id: 6, name: '오렌지말 (Orange)', color: '#f97316', emoji: '🐎🟠', colorClass: 'orange' },
    { id: 7, name: '하늘말 (Cyan)', color: '#06b6d4', emoji: '🐎🩵', colorClass: 'cyan' },
    { id: 8, name: '황금말 (Gold)', color: '#fbbf24', emoji: '🐎💛', colorClass: 'gold' }
  ],

  state: {
    mode: 'single', // 'single' or 'party'
    lanesCount: 6,
    coins: 1000,
    
    // Betting properties
    selectedHorseId: 1,
    betAmount: 100,

    // Race logic variables
    raceState: 'idle', // 'idle', 'countdown', 'running', 'finished'
    horses: [], // array of horse objects: { template, position, baseSpeed, boostCounter, odds, rank, finishTime }
    startTime: 0,
    elapsedTime: 0,
    raceInterval: null,
    gallopSoundInterval: null,
    
    // Rankings lists
    finishersList: [],
    
    // Custom names for Party Mode
    partyBettors: {} // map of { laneIndex: "Comma-separated-names" }
  },

  // DOM elements cache
  arenaEl: null,
  selectLanesEl: null,
  coinBalanceDisplayEl: null,
  timerDisplayEl: null,
  statusScreenEl: null,
  commentaryLogEl: null,
  singleHorseSelectorEl: null,
  betAmountInputEl: null,
  btnStartSingleEl: null,
  btnStartPartyEl: null,
  partyBettorsContainerEl: null,
  victoryModalEl: null,
  winnerTitleEl: null,
  payoutDescMainEl: null,
  payoutDescSubEl: null,
  leaderboardTbodyEl: null,

  init() {
    // Cache UI elements
    this.arenaEl = document.getElementById('race-arena');
    this.selectLanesEl = document.getElementById('select-lanes');
    this.coinBalanceDisplayEl = document.getElementById('coin-balance-display');
    this.timerDisplayEl = document.getElementById('race-timer-display');
    this.statusScreenEl = document.getElementById('status-screen-display');
    this.commentaryLogEl = document.getElementById('commentary-log-content');
    
    this.singleHorseSelectorEl = document.getElementById('single-horse-selector');
    this.betAmountInputEl = document.getElementById('bet-amount-input');
    this.btnStartSingleEl = document.getElementById('btn-start-single');
    this.btnStartPartyEl = document.getElementById('btn-start-party');
    this.partyBettorsContainerEl = document.getElementById('party-bettors-container');
    
    this.victoryModalEl = document.getElementById('victory-modal');
    this.winnerTitleEl = document.getElementById('winner-modal-title');
    this.payoutDescMainEl = document.getElementById('payout-desc-main');
    this.payoutDescSubEl = document.getElementById('payout-desc-sub');
    this.leaderboardTbodyEl = document.getElementById('leaderboard-tbody');

    // Load coins balance from localStorage
    const savedCoins = localStorage.getItem('cineaho_horseracing_coins');
    if (savedCoins !== null) {
      this.state.coins = parseInt(savedCoins);
    } else {
      localStorage.setItem('cineaho_horseracing_coins', this.state.coins);
    }
    
    this.updateCoinsBalanceUI();
    this.initTheme();
    this.bindEvents();
    this.renderLanes();
  },

  initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) return;
    const themeIcon = themeToggleBtn.querySelector('i');
    const themeText = themeToggleBtn.querySelector('span');

    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      let newTheme = 'dark';
      if (currentTheme === 'dark') {
        newTheme = 'light';
      }
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeUI(newTheme);
    });

    function updateThemeUI(theme) {
      if (theme === 'light') {
        themeIcon.className = 'fa-solid fa-moon';
        themeText.textContent = '다크';
        themeToggleBtn.style.borderColor = 'var(--text-muted)';
      } else {
        themeIcon.className = 'fa-solid fa-sun';
        themeText.textContent = '라이트';
        themeToggleBtn.style.borderColor = 'rgba(255, 255, 255, 0.08)';
      }
    }
  },

  bindEvents() {
    // Tab Mode switches
    document.getElementById('mode-single').addEventListener('click', (e) => this.switchMode('single'));
    document.getElementById('mode-party').addEventListener('click', (e) => this.switchMode('party'));

    // Track lane size configuration
    this.selectLanesEl.addEventListener('change', (e) => {
      this.state.lanesCount = parseInt(e.target.value);
      this.renderLanes();
    });

    // Sound toggle
    document.getElementById('toggle-sound').addEventListener('change', (e) => {
      SoundEngine.enabled = e.target.checked;
    });

    // Bet input fields (Single)
    this.betAmountInputEl.addEventListener('input', (e) => {
      let amt = parseInt(e.target.value) || 0;
      if (amt < 10) amt = 10;
      if (amt > this.state.coins) amt = this.state.coins;
      this.state.betAmount = amt;
      e.target.value = amt;
    });

    // Quick Bet buttons
    document.querySelectorAll('.btn-quick-bet[data-amount]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        SoundEngine.play('click');
        const increment = parseInt(e.target.getAttribute('data-amount'));
        let val = (parseInt(this.betAmountInputEl.value) || 0) + increment;
        if (val > this.state.coins) val = this.state.coins;
        this.state.betAmount = val;
        this.betAmountInputEl.value = val;
      });
    });

    document.getElementById('btn-bet-max').addEventListener('click', () => {
      SoundEngine.play('click');
      this.state.betAmount = this.state.coins;
      this.betAmountInputEl.value = this.state.coins;
    });

    document.getElementById('btn-bet-clear').addEventListener('click', () => {
      SoundEngine.play('click');
      this.state.betAmount = 10;
      this.betAmountInputEl.value = 10;
    });

    // Start Race Buttons
    this.btnStartSingleEl.addEventListener('click', () => {
      this.startRaceProcess();
    });

    this.btnStartPartyEl.addEventListener('click', () => {
      this.startRaceProcess();
    });

    // Modal Close
    document.getElementById('btn-close-modal').addEventListener('click', () => {
      SoundEngine.play('click');
      this.victoryModalEl.classList.remove('active');
      this.resetRaceArena();
    });
  },

  switchMode(mode) {
    if (this.state.raceState !== 'idle') return; // block during running race
    SoundEngine.play('click');
    
    this.state.mode = mode;
    
    // Toggle active classes on tab headers
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`mode-${mode}`).classList.add('active');

    // Toggle panels
    if (mode === 'single') {
      document.getElementById('panel-single').style.display = 'flex';
      document.getElementById('panel-party').style.display = 'none';
      document.getElementById('balance-display-wrapper').style.display = 'flex';
      this.log('[SYSTEM] 싱글 베팅 모드가 활성화되었습니다. 배팅을 진행해 주세요.', 'dim');
    } else {
      document.getElementById('panel-single').style.display = 'none';
      document.getElementById('panel-party').style.display = 'flex';
      document.getElementById('balance-display-wrapper').style.display = 'none';
      this.log('[SYSTEM] 단체 내기 모드가 활성화되었습니다. 각 레인에 이름을 입력하고 시작 버튼을 눌러주세요.', 'dim');
    }

    this.renderLanes();
  },

  updateCoinsBalanceUI() {
    this.coinBalanceDisplayEl.textContent = String(this.state.coins).padStart(7, '0');
    document.getElementById('bet-max-label').textContent = this.state.coins.toLocaleString();
  },

  // Generates horses list and updates HTML tracks
  renderLanes() {
    this.arenaEl.innerHTML = '';
    this.state.horses = [];
    
    // Determine dynamic odds multiplier based on lane number and random difficulty
    // High odds means faster horse, lower odds slower horse? Or vice versa:
    // In horse racing, faster horses (lower odds / favorites) pay less, slower ones (high odds) pay more.
    // We compute odds between 2.0x and 8.0x, representing their dynamic multipliers.
    const oddsWeights = [];
    for (let i = 0; i < this.state.lanesCount; i++) {
      oddsWeights.push(2.0 + Math.random() * 5.0);
    }
    
    // To match actual racing, horse odds are inversely proportional to their speed parameter.
    // Standardize odds values to two decimals
    const sortedOdds = [...oddsWeights].sort((a,b) => a-b);
    
    for (let i = 0; i < this.state.lanesCount; i++) {
      const template = this.horseTemplates[i];
      // Generate odds inversely proportional to speed:
      // Faster horse -> smaller odds. Base Speed will be between 0.4 and 0.6
      const baseSpeed = 0.35 + (8.0 - sortedOdds[i]) * 0.03; // Faster base speeds for lower odds
      const odds = parseFloat(sortedOdds[i].toFixed(2));
      
      const horse = {
        template: template,
        position: 0,
        baseSpeed: baseSpeed,
        odds: odds,
        rank: 0,
        finishTime: 0,
        boostCooldown: 0,
        stumbleCooldown: 0
      };
      
      this.state.horses.push(horse);

      // Render lane HTML
      const laneEl = document.createElement('div');
      laneEl.className = 'race-lane';
      laneEl.id = `lane-${i}`;

      // Left Column: Lane Information Badge
      const infoEl = document.createElement('div');
      infoEl.className = 'lane-info';

      const badgeEl = document.createElement('div');
      badgeEl.className = 'lane-num-badge';
      badgeEl.innerHTML = `<span class="dot" style="background-color: ${template.color}"></span> ${i+1}번 말`;

      infoEl.appendChild(badgeEl);

      // Display according to Active Game Mode
      if (this.state.mode === 'single') {
        const oddsEl = document.createElement('span');
        oddsEl.className = 'lane-odds';
        oddsEl.textContent = `${odds} 배`;
        infoEl.appendChild(oddsEl);
      } else {
        const bettorEl = document.createElement('span');
        bettorEl.className = 'lane-bettor-label';
        bettorEl.id = `lane-bettor-label-${i}`;
        bettorEl.textContent = this.state.partyBettors[i] || '비어 있음';
        infoEl.appendChild(bettorEl);
      }

      laneEl.appendChild(infoEl);

      // Middle Column: Track strip container holding horse actor
      const stripEl = document.createElement('div');
      stripEl.className = 'lane-track-strip';
      stripEl.id = `lane-track-strip-${i}`;

      const actorEl = document.createElement('div');
      actorEl.className = 'horse-actor';
      actorEl.id = `horse-actor-${i}`;
      actorEl.textContent = template.emoji;
      actorEl.style.left = '0%';

      stripEl.appendChild(actorEl);
      laneEl.appendChild(stripEl);

      // Right Column: Checkered finish flag
      const finishEl = document.createElement('div');
      finishEl.className = 'lane-finish-line';
      
      laneEl.appendChild(finishEl);
      this.arenaEl.appendChild(laneEl);
    }

    // Refresh configurations inputs
    if (this.state.mode === 'single') {
      this.renderSingleSelector();
    } else {
      this.renderPartyBettorsInputs();
    }
  },

  // Renders the single player horse selectors radio-buttons grid
  renderSingleSelector() {
    this.singleHorseSelectorEl.innerHTML = '';
    this.state.horses.forEach(horse => {
      const btn = document.createElement('button');
      btn.className = 'horse-select-btn';
      if (horse.template.id === this.state.selectedHorseId) {
        btn.classList.add('selected');
      }

      btn.innerHTML = `
        <span class="emoji">${horse.template.emoji}</span>
        <span class="name">${horse.template.name}</span>
        <span class="odd">${horse.odds}배</span>
      `;

      btn.addEventListener('click', () => {
        SoundEngine.play('click');
        this.state.selectedHorseId = horse.template.id;
        document.querySelectorAll('.horse-select-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        this.log(`[SYSTEM] 베팅 대상을 ${horse.template.name}로 변경하였습니다.`, 'dim');
      });

      this.singleHorseSelectorEl.appendChild(btn);
    });
  },

  // Renders input fields for multiplayer mode bettors
  renderPartyBettorsInputs() {
    this.partyBettorsContainerEl.innerHTML = '';
    for (let i = 0; i < this.state.lanesCount; i++) {
      const template = this.state.horses[i].template;

      const row = document.createElement('div');
      row.className = 'lane-bettor-row';

      const tag = document.createElement('span');
      tag.className = 'lane-tag';
      tag.innerHTML = `<span class="dot" style="background-color: ${template.color}"></span> ${i+1}번 말:`;

      const input = document.createElement('input');
      input.type = 'text';
      input.id = `input-bettor-${i}`;
      input.placeholder = '배팅자 이름 입력 (쉼표로 구분)';
      input.value = this.state.partyBettors[i] || '';

      input.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        this.state.partyBettors[i] = val;
        
        const label = document.getElementById(`lane-bettor-label-${i}`);
        if (label) {
          label.textContent = val || '비어 있음';
        }
      });

      row.appendChild(tag);
      row.appendChild(input);
      this.partyBettorsContainerEl.appendChild(row);
    }
  },

  // Starts the countdown sequence
  startRaceProcess() {
    if (this.state.raceState !== 'idle') return;

    // Validate inputs
    if (this.state.mode === 'single') {
      if (this.state.betAmount > this.state.coins) {
        alert("보유 코인이 부족합니다.");
        return;
      }
      if (this.state.betAmount <= 0) {
        alert("10 코인 이상을 걸어주세요.");
        return;
      }
      // Deduct coins balance immediately upon starting
      this.state.coins -= this.state.betAmount;
      localStorage.setItem('cineaho_horseracing_coins', this.state.coins);
      this.updateCoinsBalanceUI();
    } else {
      // Party mode: verify at least one name is entered
      let hasBettor = false;
      for (let i = 0; i < this.state.lanesCount; i++) {
        if (this.state.partyBettors[i] && this.state.partyBettors[i].trim() !== '') {
          hasBettor = true;
          break;
        }
      }
      if (!hasBettor) {
        alert("최소 한 개의 레인에 참가자 이름을 입력해 주세요!");
        return;
      }
    }

    // Lock start buttons
    this.btnStartSingleEl.disabled = true;
    this.btnStartPartyEl.disabled = true;
    this.selectLanesEl.disabled = true;

    // Initialize state
    this.state.raceState = 'countdown';
    this.state.finishersList = [];
    this.state.elapsedTime = 0;
    this.timerDisplayEl.textContent = '00.00';

    // Clear commentary console log
    this.commentaryLogEl.innerHTML = '';
    this.log(`[SYSTEM] 경기가 곧 시작됩니다! 준비하세요.`, 'info');

    // Run Countdown loop
    let secondsLeft = 3;
    this.statusScreenEl.className = 'status-screen countdown';
    this.statusScreenEl.textContent = String(secondsLeft);
    SoundEngine.play('beep-countdown');

    const countdownTimer = setInterval(() => {
      secondsLeft--;
      if (secondsLeft > 0) {
        this.statusScreenEl.textContent = String(secondsLeft);
        SoundEngine.play('beep-countdown');
      } else if (secondsLeft === 0) {
        this.statusScreenEl.textContent = 'GO!';
        SoundEngine.play('beep-go');
      } else {
        clearInterval(countdownTimer);
        this.triggerRaceRun();
      }
    }, 1000);
  },

  // Commences the actual race run loop
  triggerRaceRun() {
    this.state.raceState = 'running';
    this.statusScreenEl.className = 'status-screen running';
    this.statusScreenEl.textContent = 'RACING!';
    this.state.startTime = performance.now();
    
    // Play trumpet fanfare sound
    SoundEngine.play('trumpet-start');

    // Set horses animation status
    this.state.horses.forEach((h, idx) => {
      h.position = 0;
      h.rank = 0;
      h.finishTime = 0;
      h.boostCooldown = 0;
      h.stumbleCooldown = 0;
      
      const el = document.getElementById(`horse-actor-${idx}`);
      if (el) {
        el.classList.add('running');
      }
    });

    this.log(`[COMMENTARY] 경주마들 일제히 게이트를 열고 힘차게 출발했습니다!`, 'info');

    // Gallop sound loop
    this.state.gallopSoundInterval = setInterval(() => {
      SoundEngine.play('gallop-single');
    }, 280);

    // Frame update loop
    const frameRateMs = 50; // 20 updates per second
    this.state.raceInterval = setInterval(() => {
      this.updateRaceTick();
    }, frameRateMs);
  },

  // Updates horse positions and tracks boundaries
  updateRaceTick() {
    this.state.elapsedTime = (performance.now() - this.state.startTime) / 1000;
    this.timerDisplayEl.textContent = this.state.elapsedTime.toFixed(2);

    let allFinished = true;
    let leadsChanged = false;
    let currentLeader = null;
    let highestPos = -1;

    // Run physics tick for each horse
    this.state.horses.forEach((horse, idx) => {
      if (horse.position >= 100) {
        return; // already finished
      }

      allFinished = false;

      // Base random movement step
      let step = horse.baseSpeed + Math.random() * 0.8;

      // Handle cooldowns
      if (horse.boostCooldown > 0) horse.boostCooldown--;
      if (horse.stumbleCooldown > 0) horse.stumbleCooldown--;

      // Random Event Triggers (1.5% chance for boost, 0.8% chance for stumble per tick)
      const roll = Math.random() * 100;
      
      if (roll < 1.5 && horse.boostCooldown === 0 && horse.stumbleCooldown === 0) {
        // Boost!
        const spurts = ["🔥 가속!", "⚡ 스퍼트!", "🥕 당근 파워!", "🐴 질주!"];
        const phrase = spurts[Math.floor(Math.random() * spurts.length)];
        
        horse.boostCooldown = 20; // 1 second cooldown
        this.triggerVisualEffect(idx, phrase, 'spurt');
        SoundEngine.play('whip');

        step += 2.5; // sudden burst

        // Random commentary selection
        const comms = [
          `기회를 잡은 ${idx+1}번 ${horse.template.name}말이 무서운 속도로 치고 나갑니다!`,
          `${idx+1}번 ${horse.template.name}말, 가속 스퍼트를 시작합니다!`
        ];
        this.log(`[COMMENTARY] ${comms[Math.floor(Math.random() * comms.length)]}`, 'spurt');
      } else if (roll > 98.8 && horse.boostCooldown === 0 && horse.stumbleCooldown === 0) {
        // Stumble
        const stumbles = ["⚠️ 헛디딤!", "💤 딴청피우기", "🍂 기운빠짐"];
        const phrase = stumbles[Math.floor(Math.random() * stumbles.length)];

        horse.stumbleCooldown = 25; // 1.25 second cooldown
        this.triggerVisualEffect(idx, phrase, 'stumble');
        
        step -= 1.8; // slowed down
        if (step < 0) step = 0.1;

        const comms = [
          `${idx+1}번 ${horse.template.name}말이 살짝 발을 헛디디며 속도가 줄어듭니다!`,
          `아! ${idx+1}번 ${horse.template.name}말, 집중력이 흐려진 모습을 보입니다.`
        ];
        this.log(`[COMMENTARY] ${comms[Math.floor(Math.random() * comms.length)]}`, 'stumble');
      }

      // Add to position
      horse.position += step;
      if (horse.position > 100) horse.position = 100;

      // Update UI elements position
      const actorEl = document.getElementById(`horse-actor-${idx}`);
      if (actorEl) {
        actorEl.style.left = `${horse.position}%`;
      }

      // Check for finish
      if (horse.position === 100) {
        horse.finishTime = this.state.elapsedTime;
        this.state.finishersList.push(horse);
        horse.rank = this.state.finishersList.length;

        // Visual finish indicator
        const laneEl = document.getElementById(`lane-${idx}`);
        if (laneEl) {
          laneEl.classList.add('winner-lane');
        }
        
        actorEl.classList.remove('running');

        // Commentary log
        if (horse.rank === 1) {
          this.log(`[결승선] 💥 ${idx+1}번 ${horse.template.name}말 1등으로 피니시라인 돌파! 시간: ${horse.finishTime.toFixed(2)}초`, 'win');
        } else {
          this.log(`[결승선] ${idx+1}번 ${horse.template.name}말 ${horse.rank}등 골인! 시간: ${horse.finishTime.toFixed(2)}초`, 'dim');
        }
      }

      // Determine current leader
      if (horse.position > highestPos) {
        highestPos = horse.position;
        currentLeader = horse;
      }
    });

    // Handle end of race
    if (allFinished) {
      this.triggerRaceEnd();
    }
  },

  // Triggers dynamic word text burst over horse avatar
  triggerVisualEffect(horseIndex, text, typeClass) {
    const strip = document.getElementById(`lane-track-strip-${horseIndex}`);
    if (!strip) return;

    const popup = document.createElement('div');
    popup.className = `effect-popup effect-${typeClass}`;
    popup.textContent = text;

    // Track horse actor to align popup correctly
    const actor = document.getElementById(`horse-actor-${horseIndex}`);
    const pos = actor ? actor.style.left : '0%';
    popup.style.left = pos;

    strip.appendChild(popup);

    // Clean up popup
    setTimeout(() => {
      popup.remove();
    }, 800);
  },

  // Finalizes the race parameters
  triggerRaceEnd() {
    this.state.raceState = 'finished';
    this.statusScreenEl.textContent = 'RACE FINISHED';
    this.statusScreenEl.className = 'status-screen';

    // Clear intervals
    if (this.state.raceInterval) {
      clearInterval(this.state.raceInterval);
      this.state.raceInterval = null;
    }
    if (this.state.gallopSoundInterval) {
      clearInterval(this.state.gallopSoundInterval);
      this.state.gallopSoundInterval = null;
    }

    // Process results
    const winner = this.state.finishersList[0];
    
    // Play sound based on result
    if (this.state.mode === 'single') {
      const playerWon = (winner.template.id === this.state.selectedHorseId);
      if (playerWon) {
        SoundEngine.play('win-fanfare');
        // Win coins
        const payout = Math.round(this.state.betAmount * winner.odds);
        this.state.coins += payout;
        localStorage.setItem('cineaho_horseracing_coins', this.state.coins);

        this.winnerTitleEl.textContent = `축하합니다! ${winner.template.name} 우승!`;
        this.payoutDescMainEl.innerHTML = `베팅 성공! <strong style="color: #fbbf24">+${payout.toLocaleString()} 코인</strong>을 획득했습니다! (배당률: ${winner.odds}배)`;
        this.payoutDescSubEl.textContent = `현재 보유 코인: ${this.state.coins.toLocaleString()} 코인`;
        this.log(`[VICTORY] 베팅에 승리하여 ${payout} 코인을 획득했습니다! 현재 잔고: ${this.state.coins} 코인`, 'win');
      } else {
        SoundEngine.play('lose-fanfare');
        this.winnerTitleEl.textContent = `아쉽습니다! ${winner.template.name} 우승!`;
        this.payoutDescMainEl.innerHTML = `베팅 실패... 선택한 말이 우승하지 못했습니다.`;
        this.payoutDescSubEl.textContent = `현재 보유 코인: ${this.state.coins.toLocaleString()} 코인`;
        this.log(`[DEFEAT] 베팅에 아쉽게 실패했습니다. 현재 잔고: ${this.state.coins} 코인`, 'stumble');
      }
      this.updateCoinsBalanceUI();
    } else {
      // Party mode results
      SoundEngine.play('win-fanfare');
      
      const penaltyText = document.getElementById('penalty-text-input').value.trim() || '벌칙 당첨';
      const winnersList = this.state.partyBettors[winner.template.id - 1] || '';
      
      this.winnerTitleEl.textContent = `${winner.template.name} 우승!`;
      
      if (winnersList !== '') {
        this.payoutDescMainEl.innerHTML = `우승마 베팅 성공자: <strong style="color: #a855f7">${winnersList}</strong>`;
        this.payoutDescSubEl.textContent = `내기 벌칙 [${penaltyText}] 대상에서 제외되었거나 승리하셨습니다!`;
        this.log(`[PARTY] 내기 결과: [${winnersList}]님 승리! 벌칙 [${penaltyText}] 적용에서 제외됩니다.`, 'win');
      } else {
        this.payoutDescMainEl.innerHTML = `우승마 베팅 성공자가 없습니다!`;
        this.payoutDescSubEl.textContent = `벌칙 [${penaltyText}]은 과연 누구의 몫이 될까요?`;
        this.log(`[PARTY] 우승마에 베팅한 사람이 없어 무승부입니다!`, 'dim');
      }
    }

    // Populate Leaderboard Table
    this.populateLeaderboardTable();

    // Spawn Confetti animations
    this.spawnConfetti();

    // Trigger modal overlay active
    setTimeout(() => {
      this.victoryModalEl.classList.add('active');
    }, 1000);
  },

  populateLeaderboardTable() {
    this.leaderboardTbodyEl.innerHTML = '';
    
    // Toggle bettor column header depending on mode
    const bettorHeader = document.getElementById('th-bettor-header');
    if (this.state.mode === 'single') {
      bettorHeader.textContent = '배당률';
    } else {
      bettorHeader.textContent = '내기 참가자';
    }

    this.state.finishersList.forEach(horse => {
      const row = document.createElement('tr');
      if (horse.rank === 1) {
        row.className = 'rank-1-row';
      }

      const rankCol = document.createElement('td');
      rankCol.innerHTML = horse.rank === 1 ? '🥇 1등' : `<strong>${horse.rank}등</strong>`;

      const infoCol = document.createElement('td');
      infoCol.textContent = `${horse.template.emoji} ${horse.template.name}`;

      const timeCol = document.createElement('td');
      timeCol.textContent = `${horse.finishTime.toFixed(2)}초`;

      const extraCol = document.createElement('td');
      if (this.state.mode === 'single') {
        extraCol.textContent = `${horse.odds}배`;
      } else {
        extraCol.textContent = this.state.partyBettors[horse.template.id - 1] || '-';
      }

      row.appendChild(rankCol);
      row.appendChild(infoCol);
      row.appendChild(timeCol);
      row.appendChild(extraCol);
      this.leaderboardTbodyEl.appendChild(row);
    });
  },

  // Confetti overlay particles builder
  spawnConfetti() {
    // Remove previous confetti elements if any
    document.querySelectorAll('.confetti').forEach(el => el.remove());

    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#fbbf24', '#a855f7', '#f97316'];
    const totalConfetti = 50;

    for (let i = 0; i < totalConfetti; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      c.style.left = `${Math.random() * 100}%`;
      c.style.animationDelay = `${Math.random() * 2}s`;
      c.style.animationDuration = `${1.5 + Math.random() * 1.5}s`;
      
      this.victoryModalEl.appendChild(c);
    }
  },

  // Reset track variables to prepare next race
  resetRaceArena() {
    this.state.raceState = 'idle';
    this.statusScreenEl.textContent = 'READY TO RUN';
    this.statusScreenEl.className = 'status-screen';
    
    // Unlock configurations buttons
    this.btnStartSingleEl.disabled = false;
    this.btnStartPartyEl.disabled = false;
    this.selectLanesEl.disabled = false;

    // Reset lane styles
    document.querySelectorAll('.race-lane').forEach(el => {
      el.classList.remove('winner-lane');
    });

    // Reset horse actors positions
    this.state.horses.forEach((h, idx) => {
      h.position = 0;
      h.rank = 0;
      h.finishTime = 0;
      
      const actor = document.getElementById(`horse-actor-${idx}`);
      if (actor) {
        actor.style.left = '0%';
        actor.className = 'horse-actor';
      }
    });

    this.timerDisplayEl.textContent = '00.00';
    this.log('[SYSTEM] 다음 경기를 시작할 준비가 되었습니다. 베팅을 세팅해 주세요.', 'dim');
  },

  // Console terminal log logger
  log(text, type) {
    const p = document.createElement('p');
    p.className = `log-line log-${type}`;
    p.textContent = text;
    this.commentaryLogEl.appendChild(p);

    // Auto-scroll and line limits
    while (this.commentaryLogEl.childElementCount > 40) {
      this.commentaryLogEl.removeChild(this.commentaryLogEl.firstChild);
    }

    this.commentaryLogEl.scrollTop = this.commentaryLogEl.scrollHeight;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  HorseGame.init();
});
