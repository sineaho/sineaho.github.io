/**
 * CineAHO Spot the Difference - Game Controller & Image Processor
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
        osc.frequency.setValueAtTime(800, t);
        gainNode.gain.setValueAtTime(baseGain * 0.4, t);
        gainNode.gain.linearRampToValueAtTime(0.01, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
        break;

      case 'correct':
        // Positive ding-ding arpeggio: G5 -> C6
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(783.99, t); // G5
        gainNode.gain.setValueAtTime(baseGain * 0.8, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1046.50, t + 0.08); // C6
        gain2.gain.setValueAtTime(baseGain * 0.6, t + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.08 + 0.25);
        
        osc.start(t);
        osc.stop(t + 0.15);
        osc2.start(t + 0.08);
        osc2.stop(t + 0.08 + 0.25);
        break;

      case 'error':
        // Low double-buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        gainNode.gain.setValueAtTime(baseGain * 1.5, t);
        gainNode.gain.linearRampToValueAtTime(0.01, t + 0.15);
        
        setTimeout(() => {
          if (!this.ctx || this.ctx.state === 'closed') return;
          const oscB = this.ctx.createOscillator();
          const gainB = this.ctx.createGain();
          oscB.connect(gainB);
          gainB.connect(this.ctx.destination);
          oscB.type = 'sawtooth';
          oscB.frequency.setValueAtTime(140, this.ctx.currentTime);
          gainB.gain.setValueAtTime(baseGain * 1.5, this.ctx.currentTime);
          gainB.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
          oscB.start(this.ctx.currentTime);
          oscB.stop(this.ctx.currentTime + 0.15);
        }, 120);

        osc.start(t);
        osc.stop(t + 0.15);
        break;

      case 'hint':
        // High sparkling bell sweep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.3);
        gainNode.gain.setValueAtTime(baseGain * 0.6, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        break;

      case 'win-fanfare':
        // Happy ascending 8-bit fanfare arpeggio: C5 -> E5 -> G5 -> C6
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const winOsc = this.ctx.createOscillator();
          const winGain = this.ctx.createGain();
          winOsc.connect(winGain);
          winGain.connect(this.ctx.destination);

          winOsc.type = 'triangle';
          winOsc.frequency.setValueAtTime(freq, t + idx * 0.08);
          winGain.gain.setValueAtTime(baseGain * 0.6, t + idx * 0.08);
          winGain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.08 + 0.3);

          winOsc.start(t + idx * 0.08);
          winOsc.stop(t + idx * 0.08 + 0.3);
        });
        break;

      case 'lose-fanfare':
        // Descending melancholic tone
        const loseNotes = [392.00, 349.23, 311.13, 261.63]; // G4, F4, Eb4, C4
        loseNotes.forEach((freq, idx) => {
          const loseOsc = this.ctx.createOscillator();
          const loseGain = this.ctx.createGain();
          loseOsc.connect(loseGain);
          loseGain.connect(this.ctx.destination);

          loseOsc.type = 'sawtooth';
          loseOsc.frequency.setValueAtTime(freq, t + idx * 0.15);
          loseGain.gain.setValueAtTime(baseGain * 0.5, t + idx * 0.15);
          loseGain.gain.linearRampToValueAtTime(0.01, t + idx * 0.15 + 0.25);

          loseOsc.start(t + idx * 0.15);
          loseOsc.stop(t + idx * 0.15 + 0.25);
        });
        break;
    }
  }
};

const SpotGame = {
  state: {
    mode: 'stages', // 'stages' or 'creator'
    currentStageIndex: 0,
    raceState: 'idle', // 'idle' or 'running' or 'finished'
    
    // In-game stats
    lives: 3,
    hints: 3,
    timer: 90,
    timerInterval: null,
    
    // Differences properties
    activeDifferences: [], // list of current difference objects
    foundIds: [], // indices of found differences
    
    // Stage completed states
    completedStages: [], // indices of stages completed (persisted in localStorage)
    
    // Custom Stage properties
    customImage: null, // Image object loaded in editor
    customDifferences: [], // coordinates generated manually or automatically
    customDrawings: [], // edits list to draw on modified canvas
    
    // Editor State
    editorTool: 'hue', // 'hue', 'mosaic', 'invert', 'stamp'
    editorStamp: '⭐',
    brushRadius: 30,
    isDrawing: false,
    hasEdited: false
  },

  // DOM Elements
  canvasOrig: null,
  canvasMod: null,
  ctxOrig: null,
  ctxMod: null,
  overlayOrig: null,
  overlayMod: null,
  stageNumberDisplayEl: null,
  diffsFoundDisplayEl: null,
  heartsContainerEl: null,
  timerDisplayEl: null,
  hintCountDisplayEl: null,
  btnUseHintEl: null,
  btnResetStageEl: null,
  stagesButtonsGridEl: null,
  dropzoneAreaEl: null,
  editorControlsBoxEl: null,
  brushRadiusSliderEl: null,
  brushRadiusDisplayEl: null,
  btnAutoGenerateDiffsEl: null,
  btnPlayCustomEl: null,
  btnClearCustomEl: null,
  consoleLogsEl: null,
  resultModalEl: null,
  resultModalTitleEl: null,
  resultDescMainEl: null,
  resultDescSubEl: null,
  btnNextActionEl: null,

  // Temporary Brush Indicator overlay
  brushIndicatorEl: null,

  init() {
    // Cache DOM Elements
    this.canvasOrig = document.getElementById('canvas-original');
    this.canvasMod = document.getElementById('canvas-modified');
    this.ctxOrig = this.canvasOrig.getContext('2d', { willReadFrequently: true });
    this.ctxMod = this.canvasMod.getContext('2d', { willReadFrequently: true });
    this.overlayOrig = document.getElementById('overlay-original');
    this.overlayMod = document.getElementById('overlay-modified');
    
    this.stageNumberDisplayEl = document.getElementById('stage-number-display');
    this.diffsFoundDisplayEl = document.getElementById('diffs-found-display');
    this.heartsContainerEl = document.getElementById('health-hearts-container');
    this.timerDisplayEl = document.getElementById('game-timer-display');
    this.hintCountDisplayEl = document.getElementById('hint-count-display');
    this.btnUseHintEl = document.getElementById('btn-use-hint');
    this.btnResetStageEl = document.getElementById('btn-reset-stage');
    
    this.stagesButtonsGridEl = document.getElementById('stages-buttons-grid');
    this.dropzoneAreaEl = document.getElementById('dropzone-area');
    this.editorControlsBoxEl = document.getElementById('editor-controls-box');
    this.brushRadiusSliderEl = document.getElementById('brush-radius-slider');
    this.brushRadiusDisplayEl = document.getElementById('brush-radius-display');
    this.btnAutoGenerateDiffsEl = document.getElementById('btn-auto-generate-diffs');
    this.btnPlayCustomEl = document.getElementById('btn-play-custom');
    this.btnClearCustomEl = document.getElementById('btn-clear-custom');
    
    this.consoleLogsEl = document.getElementById('game-console-logs');
    this.resultModalEl = document.getElementById('result-modal');
    this.resultModalTitleEl = document.getElementById('result-modal-title');
    this.resultDescMainEl = document.getElementById('result-desc-main');
    this.resultDescSubEl = document.getElementById('result-desc-sub');
    this.btnNextActionEl = document.getElementById('btn-next-action');

    // Create brush indicator overlay element
    this.brushIndicatorEl = document.createElement('div');
    this.brushIndicatorEl.className = 'brush-preview-circle';
    this.canvasMod.parentElement.appendChild(this.brushIndicatorEl);

    // Load completed stages from localStorage
    const savedCompleted = localStorage.getItem('cineaho_spots_completed');
    if (savedCompleted) {
      this.state.completedStages = JSON.parse(savedCompleted);
    }

    this.initTheme();
    this.bindEvents();
    this.renderStageButtons();
    
    // Start with Stage 1
    this.loadStage(0);
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
    // Mode switcher tabs
    document.getElementById('mode-stages').addEventListener('click', () => this.switchMode('stages'));
    document.getElementById('mode-creator').addEventListener('click', () => this.switchMode('creator'));

    // Canvas click listeners (check differences)
    this.canvasOrig.addEventListener('click', (e) => this.handleCanvasClick(e, false));
    this.canvasMod.addEventListener('click', (e) => this.handleCanvasClick(e, true));

    // Hint button click
    this.btnUseHintEl.addEventListener('click', () => this.useHint());

    // Reset current stage
    this.btnResetStageEl.addEventListener('click', () => {
      SoundEngine.play('click');
      if (this.state.mode === 'stages') {
        this.loadStage(this.state.currentStageIndex);
      } else {
        this.startCustomPlay();
      }
    });

    // --- Creator / Editor Drag & Drop Events ---
    const dropzone = this.dropzoneAreaEl;
    dropzone.addEventListener('click', () => document.getElementById('image-file-input').click());
    document.getElementById('image-file-input').addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleImageFileLoad(e.target.files[0]);
      }
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        this.handleImageFileLoad(e.dataTransfer.files[0]);
      }
    });

    // Editor Tool Selectors
    document.querySelectorAll('.btn-editor-tool').forEach(btn => {
      btn.addEventListener('click', (e) => {
        SoundEngine.play('click');
        document.querySelectorAll('.btn-editor-tool').forEach(b => b.classList.remove('active'));
        const targetBtn = e.target.closest('button');
        targetBtn.classList.add('active');
        this.state.editorTool = targetBtn.getAttribute('data-tool');

        // Show/hide stamp choices wrapper
        const stampPicker = document.getElementById('stamp-picker-wrapper');
        if (this.state.editorTool === 'stamp') {
          stampPicker.style.display = 'block';
        } else {
          stampPicker.style.display = 'none';
        }
      });
    });

    // Stamp choices
    document.querySelectorAll('.btn-stamp-choice').forEach(btn => {
      btn.addEventListener('click', (e) => {
        SoundEngine.play('click');
        document.querySelectorAll('.btn-stamp-choice').forEach(b => b.classList.remove('active'));
        const targetBtn = e.target.closest('button');
        targetBtn.classList.add('active');
        this.state.editorStamp = targetBtn.getAttribute('data-stamp');
      });
    });

    // Brush slider radius change
    this.brushRadiusSliderEl.addEventListener('input', (e) => {
      this.state.brushRadius = parseInt(e.target.value);
      this.brushRadiusDisplayEl.textContent = `${this.state.brushRadius}px`;
    });

    // Manual editor painting listeners on Modified Canvas
    this.canvasMod.addEventListener('mousedown', (e) => this.handleEditorMouseDown(e));
    this.canvasMod.addEventListener('mousemove', (e) => this.handleEditorMouseMove(e));
    window.addEventListener('mouseup', () => { this.state.isDrawing = false; });
    this.canvasMod.addEventListener('mouseenter', () => {
      if (this.state.mode === 'creator' && this.state.customImage && this.state.raceState === 'idle') {
        this.brushIndicatorEl.style.display = 'block';
      }
    });
    this.canvasMod.addEventListener('mouseleave', () => {
      this.brushIndicatorEl.style.display = 'none';
    });

    // Auto generate differences
    this.btnAutoGenerateDiffsEl.addEventListener('click', () => this.autoGenerateDifferences());

    // Play Custom map button
    this.btnPlayCustomEl.addEventListener('click', () => this.startCustomPlay());

    // Clear Custom editor button
    this.btnClearCustomEl.addEventListener('click', () => {
      SoundEngine.play('click');
      this.clearCustomEditor();
    });

    // Next Action modal button click
    this.btnNextActionEl.addEventListener('click', () => {
      this.resultModalEl.classList.remove('active');
      
      if (this.state.mode === 'stages') {
        // Go to next stage
        const nextIdx = this.state.currentStageIndex + 1;
        if (nextIdx < GameStages.length) {
          this.loadStage(nextIdx);
        } else {
          // Finished all 30!
          alert("축하합니다! 30개의 모든 스테이지를 클리어하셨습니다! 당신은 절대적 관찰력의 소유자입니다. 😀");
          this.loadStage(0);
        }
      } else {
        // Back to editing
        this.stopCustomPlay();
      }
    });
  },

  switchMode(mode) {
    if (this.state.mode === mode) return;
    
    // Stop any active game timer/state when switching modes
    this.stopTimer();
    this.state.raceState = 'idle';
    
    SoundEngine.play('click');
    
    this.state.mode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`mode-${mode}`).classList.add('active');

    if (mode === 'stages') {
      document.getElementById('panel-stages').style.display = 'block';
      document.getElementById('panel-creator').style.display = 'none';
      document.getElementById('stage-lcd-display').style.display = 'flex';
      
      this.log('[SYSTEM] 스테이지 모드가 시작되었습니다.', 'dim');
      this.loadStage(this.state.currentStageIndex);
    } else {
      document.getElementById('panel-stages').style.display = 'none';
      document.getElementById('panel-creator').style.display = 'block';
      document.getElementById('stage-lcd-display').style.display = 'none';

      this.log('[SYSTEM] 제작기 모드가 준비되었습니다. 이미지를 로드해주세요.', 'dim');
      this.clearCustomEditor();
    }
  },

  // Renders the 30 stage select buttons grid
  renderStageButtons() {
    this.stagesButtonsGridEl.innerHTML = '';
    GameStages.forEach((stage, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn-stage-select';
      if (this.state.completedStages.includes(idx)) {
        btn.classList.add('completed');
      }
      if (idx === this.state.currentStageIndex && this.state.mode === 'stages') {
        btn.classList.add('active');
      }

      btn.innerHTML = `
        <span class="stage-tag">LV.${String(idx+1).padStart(2, '0')}</span>
        <strong>${idx+1}</strong>
      `;

      btn.addEventListener('click', () => {
        SoundEngine.play('click');
        this.loadStage(idx);
      });

      this.stagesButtonsGridEl.appendChild(btn);
    });
  },

  // Renders a vector stage onto the canvases
  loadStage(index) {
    this.stopTimer();
    
    this.state.currentStageIndex = index;
    this.state.lives = 3;
    this.state.hints = 3;
    this.state.timer = 90;
    this.state.foundIds = [];

    // Fetch stage settings
    const stage = GameStages[index];
    this.state.activeDifferences = stage.differences;

    // Clear click overlays
    this.overlayOrig.innerHTML = '';
    this.overlayMod.innerHTML = '';

    // Update Stage selection buttons UI
    document.querySelectorAll('.btn-stage-select').forEach((btn, bidx) => {
      btn.classList.remove('active');
      if (bidx === index) btn.classList.add('active');
    });

    // Render Canvas original and modified side
    this.drawStageScene(this.ctxOrig, false);
    this.drawStageScene(this.ctxMod, true);

    // Update HUD display
    this.stageNumberDisplayEl.textContent = `${String(index + 1).padStart(2, '0')} / 30`;
    this.diffsFoundDisplayEl.textContent = `0 / ${this.state.activeDifferences.length}`;
    this.timerDisplayEl.textContent = String(this.state.timer);
    this.hintCountDisplayEl.textContent = String(this.state.hints);
    
    this.btnUseHintEl.disabled = false;
    this.updateHeartsUI();

    this.log(`[SYSTEM] 스테이지 ${index + 1}: [${stage.name}] 로드 완료!`, 'info');
    
    this.state.raceState = 'running';
    this.startTimer();
  },

  drawStageScene(ctx, isMod) {
    ctx.clearRect(0, 0, 450, 450);
    const stage = GameStages[this.state.currentStageIndex];
    stage.draw(ctx, isMod);
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

  // Timer controls
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

  // Canvas Clicks Check
  handleCanvasClick(e, isModSide) {
    if (this.state.raceState !== 'running') return;

    // Get click coordinates relative to the canvas element and scale to canvas resolution (450x450)
    const rect = e.target.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (e.target.width / rect.width);
    const clickY = (e.clientY - rect.top) * (e.target.height / rect.height);

    // Check if clicked near any of the remaining differences
    let matchedDiff = null;
    
    for (let i = 0; i < this.state.activeDifferences.length; i++) {
      const diff = this.state.activeDifferences[i];
      if (this.state.foundIds.includes(diff.id)) continue;

      // Distance formula check
      const dist = Math.sqrt((clickX - diff.x)**2 + (clickY - diff.y)**2);
      if (dist <= diff.r + 10) { // added 10px click padding tolerance
        matchedDiff = diff;
        break;
      }
    }

    if (matchedDiff !== null) {
      // Correct Match!
      this.state.foundIds.push(matchedDiff.id);
      SoundEngine.play('correct');

      // Draw highlighting green circles on both sides
      this.drawHighlightCircle(matchedDiff.x, matchedDiff.y, matchedDiff.r);

      // Update counters
      this.diffsFoundDisplayEl.textContent = `${this.state.foundIds.length} / ${this.state.activeDifferences.length}`;
      
      this.log(`[성공] 틀린그림 발견: [${matchedDiff.label}]!`, 'success');

      // Clear matching hint indicators if any
      const hintRing = document.getElementById(`hint-ring-${matchedDiff.id}`);
      if (hintRing) hintRing.remove();

      // Check win condition
      if (this.state.foundIds.length === this.state.activeDifferences.length) {
        this.triggerStageClear();
      }
    } else {
      // Mistake!
      this.state.lives--;
      SoundEngine.play('error');
      
      this.updateHeartsUI();
      this.drawErrorCross(clickX, clickY, isModSide);

      this.log(`[실패] 잘못된 마킹! 남은 생명: ${this.state.lives}개`, 'error');

      // Check game over
      if (this.state.lives <= 0) {
        this.triggerGameOver('생명 소진');
      }
    }
  },

  // Draws green circles around found differences (using percentages for responsive scaling)
  drawHighlightCircle(x, y, r) {
    const origMarker = document.createElement('div');
    origMarker.className = 'diff-circle-marker';
    origMarker.style.left = `${(x / 450) * 100}%`;
    origMarker.style.top = `${(y / 450) * 100}%`;
    origMarker.style.width = `${(r * 2 / 450) * 100}%`;
    origMarker.style.height = `${(r * 2 / 450) * 100}%`;

    const modMarker = origMarker.cloneNode(true);

    this.overlayOrig.appendChild(origMarker);
    this.overlayMod.appendChild(modMarker);
  },

  // Draws a temporary red X mark at the failed click position (using percentages for responsive scaling)
  drawErrorCross(x, y, isModSide) {
    const cross = document.createElement('div');
    cross.className = 'error-cross-marker';
    cross.style.left = `${(x / 450) * 100}%`;
    cross.style.top = `${(y / 450) * 100}%`;
    cross.innerHTML = '<i class="fa-solid fa-xmark"></i>';

    const targetOverlay = isModSide ? this.overlayMod : this.overlayOrig;
    targetOverlay.appendChild(cross);

    // Remove cross after animation ends
    setTimeout(() => {
      cross.remove();
    }, 800);
  },

  // Highlight a random undiscovered difference
  useHint() {
    if (this.state.raceState !== 'running') return;
    if (this.state.hints <= 0) {
      alert("사용할 수 있는 힌트 개수가 없습니다.");
      return;
    }

    // Find undiscovered differences
    const remaining = this.state.activeDifferences.filter(d => !this.state.foundIds.includes(d.id));
    if (remaining.length === 0) return;

    // Pick random difference
    const target = remaining[Math.floor(Math.random() * remaining.length)];
    this.state.hints--;
    this.hintCountDisplayEl.textContent = String(this.state.hints);
    SoundEngine.play('hint');

    this.log(`[HINT] 힌트를 사용합니다. (남은 힌트: ${this.state.hints}개)`, 'hint');

    if (this.state.hints === 0) {
      this.btnUseHintEl.disabled = true;
    }

    // Spawn a pulsing gold target ring around coordinates on modified canvas (using percentages for responsive scaling)
    const ring = document.createElement('div');
    ring.className = 'hint-pulse-ring';
    ring.id = `hint-ring-${target.id}`;
    ring.style.left = `${(target.x / 450) * 100}%`;
    ring.style.top = `${(target.y / 450) * 100}%`;

    this.overlayMod.appendChild(ring);
  },

  triggerStageClear() {
    this.stopTimer();
    this.state.raceState = 'finished';
    SoundEngine.play('win-fanfare');

    // Register completed stage index
    if (this.state.mode === 'stages') {
      if (!this.state.completedStages.includes(this.state.currentStageIndex)) {
        this.state.completedStages.push(this.state.currentStageIndex);
        localStorage.setItem('cineaho_spots_completed', JSON.stringify(this.state.completedStages));
        this.renderStageButtons();
      }
    }

    // Setup clear modal details
    this.resultModalTitleEl.textContent = 'STAGE CLEAR!';
    document.getElementById('modal-status-ribbon').className = 'modal-ribbon';
    document.getElementById('modal-status-ribbon').innerHTML = '<i class="fa-solid fa-award"></i>';
    document.getElementById('result-badge-emoji').textContent = '🎉';
    this.resultDescMainEl.innerHTML = `축하합니다! 모든 틀린그림을 성공적으로 발견하셨습니다!`;
    this.resultDescSubEl.textContent = `소요 시간: ${(90 - this.state.timer)}초 (남은 생명: ${'💖'.repeat(this.state.lives)})`;
    this.btnNextActionEl.querySelector('span').textContent = this.state.mode === 'stages' ? '다음 스테이지 진행' : '에디터 편집으로 복귀';

    this.spawnConfetti();

    setTimeout(() => {
      this.resultModalEl.classList.add('active');
    }, 800);
  },

  triggerGameOver(reason) {
    this.stopTimer();
    this.state.raceState = 'finished';
    SoundEngine.play('lose-fanfare');

    this.resultModalTitleEl.textContent = 'GAME OVER';
    document.getElementById('modal-status-ribbon').className = 'modal-ribbon bg-red';
    document.getElementById('modal-status-ribbon').innerHTML = '<i class="fa-solid fa-skull-crossbones"></i>';
    document.getElementById('result-badge-emoji').textContent = '💀';
    this.resultDescMainEl.innerHTML = `아쉽게도 게임 오버 되었습니다! (사유: ${reason})`;
    this.resultDescSubEl.textContent = `다시 한번 도전하여 숨은 그림을 찾아보세요!`;
    this.btnNextActionEl.querySelector('span').textContent = this.state.mode === 'stages' ? '스테이지 재도전' : '에디터 복귀';

    setTimeout(() => {
      this.resultModalEl.classList.add('active');
    }, 800);
  },

  // Confetti builder
  spawnConfetti() {
    document.querySelectorAll('.confetti').forEach(el => el.remove());
    const colors = ['#a855f7', '#3b82f6', '#10b981', '#fbbf24', '#f43f5e'];
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

  // --- Creator / Editor Functions ---

  handleImageFileLoad(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.state.customImage = img;
        this.clearCustomEditor();
        this.dropzoneAreaEl.style.display = 'none';
        this.editorControlsBoxEl.style.display = 'block';
        this.log('[SYSTEM] 사용자 이미지가 업로드 되었습니다. 편집을 시작해주세요.', 'info');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  clearCustomEditor() {
    this.state.customDifferences = [];
    this.state.customDrawings = [];
    this.state.hasEdited = false;
    this.state.raceState = 'idle';

    // Clear HUD displays
    this.overlayOrig.innerHTML = '';
    this.overlayMod.innerHTML = '';

    if (this.state.customImage) {
      // Project image onto original and modified canvases (aspect ratio matching)
      this.drawImageOnCanvas(this.ctxOrig, this.state.customImage);
      this.drawImageOnCanvas(this.ctxMod, this.state.customImage);
    } else {
      // Clear canvases
      this.ctxOrig.clearRect(0,0,450,450);
      this.ctxMod.clearRect(0,0,450,450);
    }
  },

  drawImageOnCanvas(ctx, img) {
    ctx.clearRect(0, 0, 450, 450);
    // Scale fitting maintaining aspect ratio
    const iw = img.width;
    const ih = img.height;
    const scale = Math.min(450 / iw, 450 / ih);
    const nw = iw * scale;
    const nh = ih * scale;
    const dx = (450 - nw) / 2;
    const dy = (450 - nh) / 2;
    ctx.drawImage(img, dx, dy, nw, nh);
  },

  // Mousedown trigger
  handleEditorMouseDown(e) {
    if (this.state.mode !== 'creator' || !this.state.customImage || this.state.raceState !== 'idle') return;
    this.state.isDrawing = true;
    this.applyBrushAction(e);
  },

  // Mousemove trigger
  handleEditorMouseMove(e) {
    if (this.state.mode !== 'creator' || !this.state.customImage) return;

    const rect = this.canvasMod.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update circular brush indicator positioning
    this.brushIndicatorEl.style.left = `${x}px`;
    this.brushIndicatorEl.style.top = `${y}px`;
    
    // Scale brush preview radius according to CSS scaling
    const scaleFactor = rect.width / this.canvasMod.width;
    const displayRadius = this.state.brushRadius * scaleFactor;
    this.brushIndicatorEl.style.width = `${displayRadius * 2}px`;
    this.brushIndicatorEl.style.height = `${displayRadius * 2}px`;

    // Draw if mousedown is active
    if (this.state.isDrawing && this.state.raceState === 'idle') {
      this.applyBrushAction(e);
    }
  },

  applyBrushAction(e) {
    const rect = this.canvasMod.getBoundingClientRect();
    
    // Scale coords to canvas resolution (450x450)
    const scaleX = this.canvasMod.width / rect.width;
    const scaleY = this.canvasMod.height / rect.height;

    // Get position in canvas resolution coordinates (0 to 450)
    const clickX = Math.round((e.clientX - rect.left) * scaleX);
    const clickY = Math.round((e.clientY - rect.top) * scaleY);

    // Apply pixel filters based on selected tool
    const r = this.state.brushRadius;

    if (this.state.editorTool === 'stamp') {
      // Draw stamp immediately
      this.ctxMod.font = `${r * 1.2}px Arial`;
      this.ctxMod.textAlign = "center";
      this.ctxMod.textBaseline = "middle";
      this.ctxMod.fillText(this.state.editorStamp, clickX, clickY);

      // Save difference object
      this.registerCustomDifference(clickX, clickY, r * 0.7, `스티커 (${this.state.editorStamp})`);
      this.state.isDrawing = false; // single stamp placement
    } else {
      // Pixel manipulations (Hue shift, mosaic, invert)
      const imgData = this.ctxMod.getImageData(clickX - r, clickY - r, r * 2, r * 2);
      const data = imgData.data;

      // Filter loops
      for (let y = 0; y < r * 2; y++) {
        for (let x = 0; x < r * 2; x++) {
          const dx = x - r;
          const dy = y - r;
          if (dx*dx + dy*dy > r*r) continue; // inside circle boundary

          const idx = (y * (r * 2) + x) * 4;

          // Apply selected tool filter
          if (this.state.editorTool === 'hue') {
            const h = rgbToHsl(data[idx], data[idx+1], data[idx+2]);
            // Shift hue by 120 degrees
            const rgb = hslToRgb((h[0] + 0.3) % 1.0, h[1], h[2]);
            data[idx] = rgb[0];
            data[idx+1] = rgb[1];
            data[idx+2] = rgb[2];
          } else if (this.state.editorTool === 'invert') {
            data[idx] = 255 - data[idx];
            data[idx+1] = 255 - data[idx+1];
            data[idx+2] = 255 - data[idx+2];
          } else if (this.state.editorTool === 'mosaic') {
            // Block pixelation
            const block = 6;
            const bx = Math.floor(x / block) * block;
            const by = Math.floor(y / block) * block;
            const bidx = (by * (r * 2) + bx) * 4;
            data[idx] = data[bidx];
            data[idx+1] = data[bidx+1];
            data[idx+2] = data[bidx+2];
          }
        }
      }

      this.ctxMod.putImageData(imgData, clickX - r, clickY - r);
      this.registerCustomDifference(clickX, clickY, r, `필터 (${this.state.editorTool})`);
    }

    this.state.hasEdited = true;
  },

  // Inserts difference point and merges overlapping circles to avoid duplicates
  registerCustomDifference(x, y, r, label) {
    // Check if overlaps with an existing difference point
    let merged = false;
    for (let i = 0; i < this.state.customDifferences.length; i++) {
      const cd = this.state.customDifferences[i];
      const dist = Math.sqrt((cd.x - x)**2 + (cd.y - y)**2);
      if (dist < (cd.r + r) * 0.4) { // merges overlaps
        // Grow radius to cover both
        cd.r = Math.max(cd.r, r);
        cd.x = (cd.x + x) / 2;
        cd.y = (cd.y + y) / 2;
        merged = true;
        break;
      }
    }

    if (!merged) {
      this.state.customDifferences.push({
        id: this.state.customDifferences.length,
        x: Math.round(x),
        y: Math.round(y),
        r: Math.round(r),
        label: label
      });
    }
  },

  // Automatically generates 5 differences on custom image
  autoGenerateDifferences() {
    if (!this.state.customImage || this.state.raceState !== 'idle') return;
    SoundEngine.play('click');
    this.clearCustomEditor();

    const tools = ['hue', 'mosaic', 'invert', 'stamp'];
    const stamps = ['⭐', '❤️', '🍀', '🐱', '🕶️'];

    // Generate 5 random difference positions
    for (let i = 0; i < 5; i++) {
      // Find bounds near center of image to avoid blank borders
      const border = 80;
      const rx = border + Math.random() * (450 - border * 2);
      const ry = border + Math.random() * (450 - border * 2);
      const radius = 25 + Math.round(Math.random() * 10);
      
      const tool = tools[Math.floor(Math.random() * tools.length)];

      if (tool === 'stamp') {
        const stamp = stamps[Math.floor(Math.random() * stamps.length)];
        this.ctxMod.font = `${radius * 1.2}px Arial`;
        this.ctxMod.textAlign = "center";
        this.ctxMod.textBaseline = "middle";
        this.ctxMod.fillText(stamp, rx, ry);
        this.registerCustomDifference(rx, ry, radius * 0.7, `자동 스티커 (${stamp})`);
      } else {
        const imgData = this.ctxMod.getImageData(rx - radius, ry - radius, radius * 2, radius * 2);
        const data = imgData.data;

        for (let y = 0; y < radius * 2; y++) {
          for (let x = 0; x < radius * 2; x++) {
            const dx = x - radius;
            const dy = y - radius;
            if (dx*dx + dy*dy > radius*radius) continue;

            const idx = (y * (radius * 2) + x) * 4;

            if (tool === 'hue') {
              const h = rgbToHsl(data[idx], data[idx+1], data[idx+2]);
              const rgb = hslToRgb((h[0] + 0.3) % 1.0, h[1], h[2]);
              data[idx] = rgb[0];
              data[idx+1] = rgb[1];
              data[idx+2] = rgb[2];
            } else if (tool === 'invert') {
              data[idx] = 255 - data[idx];
              data[idx+1] = 255 - data[idx+1];
              data[idx+2] = 255 - data[idx+2];
            } else if (tool === 'mosaic') {
              const block = 6;
              const bx = Math.floor(x / block) * block;
              const by = Math.floor(y / block) * block;
              const bidx = (by * (radius * 2) + bx) * 4;
              data[idx] = data[bidx];
              data[idx+1] = data[bidx+1];
              data[idx+2] = data[bidx+2];
            }
          }
        }
        this.ctxMod.putImageData(imgData, rx - radius, ry - radius);
        this.registerCustomDifference(rx, ry, radius, `자동 필터 (${tool})`);
      }
    }

    this.state.hasEdited = true;
    this.log(`[SYSTEM] 5개의 틀린그림이 자동으로 생성되었습니다. [플레이 시작]을 눌러 플레이하세요!`, 'info');
  },

  // Switches custom canvas editor into play mode
  startCustomPlay() {
    if (this.state.customDifferences.length === 0) {
      alert("틀린 그림 영역이 최소 한 개 있어야 플레이할 수 있습니다. 수동으로 그리거나 [자동 틀린그림 생성]을 먼저 눌러주세요.");
      return;
    }

    SoundEngine.play('click');

    // Setup active play states
    this.state.lives = 3;
    this.state.hints = 3;
    this.state.timer = 90;
    this.state.foundIds = [];
    this.state.activeDifferences = this.state.customDifferences;

    this.overlayOrig.innerHTML = '';
    this.overlayMod.innerHTML = '';

    // Hide editor tools during play
    this.brushIndicatorEl.style.display = 'none';
    this.btnPlayCustomEl.disabled = true;
    this.btnAutoGenerateDiffsEl.disabled = true;
    this.btnClearCustomEl.disabled = true;

    // HUD
    this.diffsFoundDisplayEl.textContent = `0 / ${this.state.activeDifferences.length}`;
    this.timerDisplayEl.textContent = String(this.state.timer);
    this.hintCountDisplayEl.textContent = String(this.state.hints);
    this.btnUseHintEl.disabled = false;
    
    this.updateHeartsUI();

    this.log(`[제작기] 사용자가 만든 맵 시작! 총 틀린그림 개수: ${this.state.activeDifferences.length}개`, 'info');

    this.state.raceState = 'running';
    this.startTimer();
  },

  // Exits custom play mode back to editor mode
  stopCustomPlay() {
    this.stopTimer();
    this.state.raceState = 'idle';

    this.btnPlayCustomEl.disabled = false;
    this.btnAutoGenerateDiffsEl.disabled = false;
    this.btnClearCustomEl.disabled = false;
    
    // Redraw canvases in editable mode (found markings remain hidden)
    this.overlayOrig.innerHTML = '';
    this.overlayMod.innerHTML = '';

    this.log(`[제작기] 에디터 편집 상태로 복귀했습니다. 추가 수정을 할 수 있습니다.`, 'dim');
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

// --- Color Helper Utilities: RGB to HSL and back ---

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

document.addEventListener('DOMContentLoaded', () => {
  SpotGame.init();
});
