/**
 * CineAHO Hidden Object Search Pro - Game Controller & Sound Synth
 */

// Procedural Retro Sound Synthesizer using Web Audio API
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
        osc.frequency.setValueAtTime(600, t);
        gainNode.gain.setValueAtTime(baseGain * 0.4, t);
        gainNode.gain.linearRampToValueAtTime(0.01, t + 0.04);
        osc.start(t);
        osc.stop(t + 0.04);
        break;

      case 'correct':
        // High sparkling bell chime: C6 -> E6 -> G6
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.50, t); // C6
        gainNode.gain.setValueAtTime(baseGain * 0.6, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

        const oscB = this.ctx.createOscillator();
        const gainB = this.ctx.createGain();
        oscB.connect(gainB);
        gainB.connect(this.ctx.destination);
        oscB.type = 'sine';
        oscB.frequency.setValueAtTime(1318.51, t + 0.06); // E6
        gainB.gain.setValueAtTime(baseGain * 0.5, t + 0.06);
        gainB.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

        const oscC = this.ctx.createOscillator();
        const gainC = this.ctx.createGain();
        oscC.connect(gainC);
        gainC.connect(this.ctx.destination);
        oscC.type = 'sine';
        oscC.frequency.setValueAtTime(1567.98, t + 0.12); // G6
        gainC.gain.setValueAtTime(baseGain * 0.4, t + 0.12);
        gainC.gain.exponentialRampToValueAtTime(0.01, t + 0.28);

        osc.start(t);
        osc.stop(t + 0.12);
        oscB.start(t + 0.06);
        oscB.stop(t + 0.18);
        oscC.start(t + 0.12);
        oscC.stop(t + 0.28);
        break;

      case 'error':
        // Low annoying buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, t);
        gainNode.gain.setValueAtTime(baseGain * 1.5, t);
        gainNode.gain.linearRampToValueAtTime(0.01, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
        break;

      case 'hint':
        // Ascending slide chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(1760, t + 0.25);
        gainNode.gain.setValueAtTime(baseGain * 0.6, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
        osc.start(t);
        osc.stop(t + 0.25);
        break;

      case 'win-fanfare':
        // Joyful retro arpeggio: C5 -> E5 -> G5 -> C6 -> E6 -> G6 -> C7
        const winNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
        winNotes.forEach((freq, idx) => {
          const wOsc = this.ctx.createOscillator();
          const wGain = this.ctx.createGain();
          wOsc.connect(wGain);
          wGain.connect(this.ctx.destination);
          wOsc.type = 'sine';
          wOsc.frequency.setValueAtTime(freq, t + idx * 0.07);
          wGain.gain.setValueAtTime(baseGain * 0.7, t + idx * 0.07);
          wGain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.07 + 0.35);
          wOsc.start(t + idx * 0.07);
          wOsc.stop(t + idx * 0.07 + 0.35);
        });
        break;

      case 'lose-fanfare':
        // Melancholy downward pitch slide
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(330, t);
        osc.frequency.linearRampToValueAtTime(80, t + 0.8);
        gainNode.gain.setValueAtTime(baseGain * 1.2, t);
        gainNode.gain.linearRampToValueAtTime(0.01, t + 0.8);
        osc.start(t);
        osc.stop(t + 0.8);
        break;
    }
  }
};

const HiddenGame = {
  state: {
    currentStageIndex: 0,
    lives: 3,
    hints: 3,
    timer: 120,
    timerInterval: null,
    
    // Discovery
    foundIds: [], // indices (0-4) of target items found
    completedStages: [], // indexes of stages completed
    activeStage: null, // holds computed stage object
    raceState: 'idle' // 'idle', 'running', 'finished'
  },

  // DOM caches
  canvas: null,
  ctx: null,
  overlaysEl: null,
  stageNumDisplayEl: null,
  themeNameDisplayEl: null,
  foundObjectsDisplayEl: null,
  heartsContainerEl: null,
  timerDisplayEl: null,
  hintCountDisplayEl: null,
  btnUseHintEl: null,
  btnResetStageEl: null,
  targetsShelfEl: null,
  stagesButtonsGridEl: null,
  consoleLogsEl: null,
  resultModalEl: null,
  resultModalTitleEl: null,
  resultDescMainEl: null,
  resultDescSubEl: null,
  btnNextActionEl: null,
  globalProgressBarEl: null,
  globalProgressTextEl: null,

  init() {
    // Cache DOM
    this.canvas = document.getElementById('hidden-object-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.overlaysEl = document.getElementById('visual-overlays-container');
    
    this.stageNumDisplayEl = document.getElementById('stage-number-display');
    this.themeNameDisplayEl = document.getElementById('theme-name-display');
    this.foundObjectsDisplayEl = document.getElementById('found-objects-display');
    this.heartsContainerEl = document.getElementById('health-hearts-container');
    this.timerDisplayEl = document.getElementById('game-timer-display');
    this.hintCountDisplayEl = document.getElementById('hint-count-display');
    this.btnUseHintEl = document.getElementById('btn-use-hint');
    this.btnResetStageEl = document.getElementById('btn-reset-stage');
    this.targetsShelfEl = document.getElementById('targets-shelf-container');
    this.stagesButtonsGridEl = document.getElementById('stages-buttons-grid');
    
    this.consoleLogsEl = document.getElementById('game-console-logs');
    this.resultModalEl = document.getElementById('result-modal');
    this.resultModalTitleEl = document.getElementById('result-modal-title');
    this.resultDescMainEl = document.getElementById('result-desc-main');
    this.resultDescSubEl = document.getElementById('result-desc-sub');
    this.btnNextActionEl = document.getElementById('btn-next-action');
    
    this.globalProgressBarEl = document.getElementById('global-progress-bar');
    this.globalProgressTextEl = document.getElementById('global-progress-text');

    // Load localStorage
    const savedCompleted = localStorage.getItem('cineaho_hidden_completed');
    if (savedCompleted) {
      this.state.completedStages = JSON.parse(savedCompleted);
    }
    const lastStageIdx = localStorage.getItem('cineaho_hidden_last_stage');
    if (lastStageIdx) {
      this.state.currentStageIndex = parseInt(lastStageIdx);
    }

    this.initTheme();
    this.bindEvents();
    this.renderStageButtons();
    this.updateGlobalProgress();
    
    // Load initial stage
    this.loadStage(this.state.currentStageIndex);
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
    // Click on canvas
    this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));

    // Hint button click
    this.btnUseHintEl.addEventListener('click', () => this.useHint());

    // Reset current stage
    this.btnResetStageEl.addEventListener('click', () => {
      SoundEngine.play('click');
      this.loadStage(this.state.currentStageIndex);
    });

    // Next button in modal
    this.btnNextActionEl.addEventListener('click', () => {
      this.resultModalEl.classList.remove('active');
      if (this.state.lives <= 0 || this.state.timer <= 0) {
        // Retry
        this.loadStage(this.state.currentStageIndex);
      } else {
        // Go to next stage
        const nextIdx = this.state.currentStageIndex + 1;
        if (nextIdx < 50) {
          this.loadStage(nextIdx);
        } else {
          alert("축하합니다! 50개의 모든 숨은그림찾기 스테이지를 정복하셨습니다! 🏆");
          this.loadStage(0);
        }
      }
    });
  },

  renderStageButtons() {
    this.stagesButtonsGridEl.innerHTML = '';
    for (let i = 0; i < 50; i++) {
      const btn = document.createElement('button');
      btn.className = 'btn-stage-select';
      if (this.state.completedStages.includes(i)) {
        btn.classList.add('completed');
      }
      if (i === this.state.currentStageIndex) {
        btn.classList.add('active');
      }

      btn.innerHTML = `
        <span class="stage-tag">STAGE</span>
        <strong>${i+1}</strong>
      `;

      btn.addEventListener('click', () => {
        SoundEngine.play('click');
        this.loadStage(i);
      });

      this.stagesButtonsGridEl.appendChild(btn);
    }
  },

  updateGlobalProgress() {
    const cleared = this.state.completedStages.length;
    const percent = Math.round((cleared / 50) * 100);
    this.globalProgressBarEl.style.width = `${percent}%`;
    this.globalProgressTextEl.textContent = `${cleared} / 50 스테이지 완료 (${percent}%)`;
  },

  loadStage(index) {
    this.stopTimer();

    this.state.currentStageIndex = index;
    this.state.lives = 3;
    this.state.hints = 3;
    this.state.timer = 120;
    this.state.foundIds = [];
    localStorage.setItem('cineaho_hidden_last_stage', String(index));

    // Generate stage procedurally
    this.state.activeStage = StageGenerator.generateStage(index);
    const stage = this.state.activeStage;

    // Clear click overlays
    this.overlaysEl.innerHTML = '';

    // Update active button UI
    document.querySelectorAll('.btn-stage-select').forEach((btn, bidx) => {
      btn.classList.remove('active');
      if (bidx === index) btn.classList.add('active');
    });

    // Draw the scene on the main canvas
    this.renderMainScene();

    // Render target silhouettes cards
    this.renderTargetsShelf();

    // Update HUD
    this.stageNumDisplayEl.textContent = `${String(index + 1).padStart(2, '0')} / 50`;
    this.themeNameDisplayEl.textContent = stage.themeName.split(' (')[0];
    this.foundObjectsDisplayEl.textContent = `0 / 5`;
    this.timerDisplayEl.textContent = String(this.state.timer);
    this.hintCountDisplayEl.textContent = String(this.state.hints);
    
    this.btnUseHintEl.disabled = false;
    this.updateHeartsUI();

    this.log(`[SYSTEM] 스테이지 ${index + 1}: 테마 [${stage.themeName}] 로딩 완료!`, 'info');
    
    this.state.raceState = 'running';
    this.startTimer();
  },

  renderMainScene() {
    const stage = this.state.activeStage;
    const rand = SeededRandom(stage.id + 3251);

    // 1. Draw themed background graphics
    BackgroundThemes[stage.themeIndex](this.ctx, rand);

    // 2. Draw all decoy items (they blend in because they use the camo color palette)
    stage.decoys.forEach(decoy => {
      drawHiddenItem(this.ctx, decoy.type, decoy.x, decoy.y, decoy.r, decoy.rotation, decoy.color, false);
    });

    // 3. Draw the 5 target items (rendered exactly like decoys to be camouflaged)
    stage.targets.forEach(target => {
      drawHiddenItem(this.ctx, target.type, target.x, target.y, target.r, target.rotation, target.color, false);
    });
  },

  renderTargetsShelf() {
    this.targetsShelfEl.innerHTML = '';
    const stage = this.state.activeStage;

    stage.targets.forEach(target => {
      // Build Card
      const card = document.createElement('div');
      card.className = 'target-item-card';
      card.id = `target-card-${target.id}`;

      // Build small canvas for shape outline
      const mCanvas = document.createElement('canvas');
      mCanvas.className = 'target-item-canvas';
      mCanvas.width = 60;
      mCanvas.height = 60;
      const mCtx = mCanvas.getContext('2d');

      // Draw stroke silhouette outline centered at (30, 30)
      drawHiddenItem(mCtx, target.type, 30, 30, 20, 0, '#ffffff', true);

      // Label name
      const name = document.createElement('span');
      name.className = 'target-item-name';
      name.textContent = target.label;

      card.appendChild(mCanvas);
      card.appendChild(name);

      this.targetsShelfEl.appendChild(card);
    });
  },

  updateHeartsUI() {
    this.heartsContainerEl.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const heart = document.createElement('i');
      heart.className = 'fa-solid fa-heart heart-icon';
      if (i < this.state.lives) {
        heart.classList.add('active');
      }
      this.heartsContainerEl.appendChild(heart);
    }
  },

  startTimer() {
    this.stopTimer();
    this.state.timerInterval = setInterval(() => {
      this.state.timer--;
      this.timerDisplayEl.textContent = String(this.state.timer);

      if (this.state.timer <= 0) {
        this.triggerGameOver('시간 초과');
      }
    }, 1000);
  },

  stopTimer() {
    if (this.state.timerInterval) {
      clearInterval(this.state.timerInterval);
      this.state.timerInterval = null;
    }
  },

  // Click handler
  handleCanvasClick(e) {
    if (this.state.raceState !== 'running') return;

    // Scale click offsets matching the display to raw buffer width/height ratio
    const rect = this.canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (this.canvas.height / rect.height);

    const stage = this.state.activeStage;
    let matchedTarget = null;

    // Check click hit distance
    for (let i = 0; i < stage.targets.length; i++) {
      const target = stage.targets[i];
      if (this.state.foundIds.includes(target.id)) continue;

      const dist = Math.sqrt((clickX - target.x)**2 + (clickY - target.y)**2);
      if (dist <= target.r + 12) { // 12px padding click hit box
        matchedTarget = target;
        break;
      }
    }

    if (matchedTarget !== null) {
      // Correct!
      this.state.foundIds.push(matchedTarget.id);
      SoundEngine.play('correct');

      // Highlight target with check circle
      this.drawHighlightCircle(matchedTarget.x, matchedTarget.y, matchedTarget.r);

      // Checkoff shelf card silhouette
      const card = document.getElementById(`target-card-${matchedTarget.id}`);
      if (card) {
        card.classList.add('found');
      }

      // Update counter
      this.foundObjectsDisplayEl.textContent = `${this.state.foundIds.length} / 5`;
      this.log(`[성공] 물건 발견: [${matchedTarget.label}]!`, 'success');

      // Remove hint ring if active
      const hintRing = document.getElementById(`hint-ring-${matchedTarget.id}`);
      if (hintRing) hintRing.remove();

      // Win check
      if (this.state.foundIds.length === 5) {
        this.triggerStageClear();
      }
    } else {
      // Wrong click
      this.state.lives--;
      SoundEngine.play('error');
      
      this.updateHeartsUI();
      this.drawErrorCross(clickX, clickY);

      this.log(`[실패] 잘못된 위치 클릭! 남은 생명: ${this.state.lives}개`, 'error');

      if (this.state.lives <= 0) {
        this.triggerGameOver('생명 소진');
      }
    }
  },

  drawHighlightCircle(x, y, r) {
    const marker = document.createElement('div');
    marker.className = 'diff-circle-marker';
    // Percentage layout for responsive scaling
    marker.style.left = `${(x / 500) * 100}%`;
    marker.style.top = `${(y / 500) * 100}%`;
    marker.style.width = `${(r * 2 / 500) * 100}%`;
    marker.style.height = `${(r * 2 / 500) * 100}%`;

    this.overlaysEl.appendChild(marker);
  },

  drawErrorCross(x, y) {
    const cross = document.createElement('div');
    cross.className = 'error-cross-marker';
    cross.style.left = `${(x / 500) * 100}%`;
    cross.style.top = `${(y / 500) * 100}%`;
    cross.innerHTML = '<i class="fa-solid fa-xmark"></i>';

    this.overlaysEl.appendChild(cross);

    setTimeout(() => {
      cross.remove();
    }, 800);
  },

  useHint() {
    if (this.state.raceState !== 'running') return;
    if (this.state.hints <= 0) {
      alert("사용할 수 있는 힌트 개수가 없습니다.");
      return;
    }

    const stage = this.state.activeStage;
    const remaining = stage.targets.filter(t => !this.state.foundIds.includes(t.id));
    if (remaining.length === 0) return;

    // Pick random undiscovered target
    const target = remaining[Math.floor(Math.random() * remaining.length)];
    this.state.hints--;
    this.hintCountDisplayEl.textContent = String(this.state.hints);
    SoundEngine.play('hint');

    this.log(`[HINT] 힌트를 사용합니다. (남은 힌트: ${this.state.hints}개)`, 'hint');

    if (this.state.hints === 0) {
      this.btnUseHintEl.disabled = true;
    }

    // Add gold pulsing hint ring
    const ring = document.createElement('div');
    ring.className = 'hint-pulse-ring';
    ring.id = `hint-ring-${target.id}`;
    ring.style.left = `${(target.x / 500) * 100}%`;
    ring.style.top = `${(target.y / 500) * 100}%`;

    this.overlaysEl.appendChild(ring);
  },

  triggerStageClear() {
    this.stopTimer();
    this.state.raceState = 'finished';
    SoundEngine.play('win-fanfare');

    // Add to completed stages
    if (!this.state.completedStages.includes(this.state.currentStageIndex)) {
      this.state.completedStages.push(this.state.currentStageIndex);
      localStorage.setItem('cineaho_hidden_completed', JSON.stringify(this.state.completedStages));
      this.renderStageButtons();
      this.updateGlobalProgress();
    }

    // Victory modal
    this.resultModalTitleEl.textContent = 'STAGE CLEAR!';
    document.getElementById('modal-status-ribbon').className = 'modal-ribbon';
    document.getElementById('modal-status-ribbon').innerHTML = '<i class="fa-solid fa-award"></i>';
    document.getElementById('result-badge-emoji').textContent = '🎉';
    this.resultDescMainEl.innerHTML = `축하합니다! 5개의 숨은그림을 완벽히 다 찾았습니다!`;
    this.resultDescSubEl.textContent = `소요 시간: ${(120 - this.state.timer)}초 (남은 생명: ${'💖'.repeat(this.state.lives)})`;
    this.btnNextActionEl.querySelector('span').textContent = '다음 스테이지 진행';

    this.spawnConfetti();

    setTimeout(() => {
      this.resultModalEl.classList.add('active');
    }, 800);
  },

  triggerGameOver(reason) {
    this.stopTimer();
    this.state.raceState = 'finished';
    SoundEngine.play('lose-fanfare');

    // Game over modal
    this.resultModalTitleEl.textContent = 'GAME OVER';
    document.getElementById('modal-status-ribbon').className = 'modal-ribbon bg-red';
    document.getElementById('modal-status-ribbon').innerHTML = '<i class="fa-solid fa-skull-crossbones"></i>';
    document.getElementById('result-badge-emoji').textContent = '💀';
    this.resultDescMainEl.innerHTML = `아쉽게도 실패했습니다! (사유: ${reason})`;
    this.resultDescSubEl.textContent = `다시 도전하여 돋보기 같은 매의 눈을 발휘해보세요!`;
    this.btnNextActionEl.querySelector('span').textContent = '재도전 하기';

    setTimeout(() => {
      this.resultModalEl.classList.add('active');
    }, 800);
  },

  spawnConfetti() {
    document.querySelectorAll('.confetti').forEach(el => el.remove());
    const colors = ['#06b6d4', '#3b82f6', '#10b981', '#fbbf24', '#f43f5e'];
    for (let i = 0; i < 50; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      c.style.left = `${Math.random() * 100}%`;
      c.style.animationDelay = `${Math.random() * 2}s`;
      c.style.animationDuration = `${1.5 + Math.random() * 1.5}s`;
      this.resultModalEl.appendChild(c);
    }
  },

  log(text, type) {
    const p = document.createElement('p');
    p.className = `log-line log-${type}`;
    p.textContent = text;
    this.consoleLogsEl.appendChild(p);

    while (this.consoleLogsEl.childElementCount > 40) {
      this.consoleLogsEl.removeChild(this.consoleLogsEl.firstChild);
    }
    this.consoleLogsEl.scrollTop = this.consoleLogsEl.scrollHeight;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  HiddenGame.init();
});
