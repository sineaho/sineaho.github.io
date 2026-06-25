/**
 * CineAHO 3D Pinball App
 * Using Three.js (r128) for 3D graphics & custom 2D math physics for smooth collision.
 * Features 3 stages: Western, Modern, Future.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- UI Elements ---
  const lobbyPanel = document.getElementById('lobby-panel');
  const gamePanel = document.getElementById('game-panel');
  const themeCards = document.querySelectorAll('.theme-card');
  const btnStartGame = document.getElementById('btn-start-game');
  const btnQuit = document.getElementById('btn-quit');
  const btnRules = document.getElementById('btn-rules');
  const btnCloseRules = document.getElementById('btn-close-rules');
  const rulesModal = document.getElementById('rules-modal');
  const gameoverModal = document.getElementById('gameover-modal');
  const btnLobbyReturn = document.getElementById('btn-lobby-return');
  const btnRestartGame = document.getElementById('btn-restart-game');
  
  const scoreDisplay = document.getElementById('score-display');
  const ballsDisplay = document.getElementById('balls-display');
  const multiplierDisplay = document.getElementById('multiplier-display');
  const highScoreVal = document.getElementById('high-score-val');
  const finalScoreVal = document.getElementById('final-score-val');
  const newRecordMsg = document.getElementById('new-record-msg');
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const themeToggle = document.getElementById('theme-toggle');

  // --- Mobile controls ---
  const btnMobileLeft = document.getElementById('btn-mobile-left');
  const btnMobileRight = document.getElementById('btn-mobile-right');
  const btnMobilePlunger = document.getElementById('btn-mobile-plunger');

  // --- Game Settings & State ---
  let currentTheme = null; // 'western', 'modern', 'future'
  let score = 0;
  let balls = 3;
  let multiplier = 1;
  let highScore = parseInt(localStorage.getItem('pinball_high_score') || '150000', 10);
  let isSoundEnabled = true;
  let isGameOver = false;
  let gameStarted = false;

  highScoreVal.textContent = formatNumber(highScore);

  // --- Web Audio API Synth Setup ---
  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playSynthSound(freqs, durations, type = 'sine', volume = 0.1) {
    if (!isSoundEnabled || !audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    try {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = type;
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      gainNode.gain.setValueAtTime(volume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + durations[durations.length - 1]);

      freqs.forEach((freq, idx) => {
        const time = idx === 0 ? now : now + durations[idx - 1];
        osc.frequency.setValueAtTime(freq, time);
      });

      osc.start(now);
      osc.stop(now + durations[durations.length - 1]);
    } catch (e) {
      console.warn('Audio synthesis failed:', e);
    }
  }

  function playFlipperSound() {
    playSynthSound([120, 60], [0.03, 0.08], 'triangle', 0.15);
  }

  function playBumperSound() {
    playSynthSound([500, 300, 150], [0.05, 0.1, 0.15], 'sine', 0.18);
  }

  function playSlingshotSound() {
    playSynthSound([300, 100], [0.03, 0.08], 'sawtooth', 0.08);
  }

  function playPlungerChargeSound(compression) {
    playSynthSound([150 + compression * 300], [0.05], 'sine', 0.05);
  }

  function playLaunchSound() {
    playSynthSound([200, 600, 800], [0.05, 0.1, 0.18], 'triangle', 0.12);
  }

  function playBonusSound() {
    playSynthSound([440, 554, 659, 880], [0.08, 0.16, 0.24, 0.35], 'sine', 0.1);
  }

  function playDrainSound() {
    playSynthSound([300, 200, 120, 80], [0.1, 0.2, 0.3, 0.45], 'sawtooth', 0.15);
  }

  function playNewRecordSound() {
    playSynthSound([523, 659, 783, 1046, 783, 1046], [0.1, 0.2, 0.3, 0.4, 0.5, 0.7], 'sine', 0.15);
  }

  // --- Three.js Setup Variables ---
  let scene, camera, renderer, controls;
  let tableMesh, ballMesh, ballTrail = [];
  let leftFlipperMesh, rightFlipperMesh;
  let bumperMeshes = [];
  let wallMeshes = [];
  let slingshotMeshes = [];
  let decorationMeshes = [];
  let lightSpot1, lightSpot2;
  const particles = [];

  // --- 2D Physics Parameters (X-Y Plane) ---
  const TABLE_WIDTH = 22;
  const TABLE_HEIGHT = 38;
  const GRAVITY_Y = -0.22; // Gravity pulling ball down the incline
  const FRICTION = 0.997;  // Air friction/damping
  const MAX_SPEED = 18;

  let ball = {
    x: 9.8,
    y: -16,
    vx: 0,
    vy: 0,
    radius: 0.65,
    mass: 1.0,
    inPlay: false
  };

  // Plunger state
  let plunger = {
    x: 9.8,
    y: -18,
    width: 1.2,
    height: 1.0,
    compression: 0, // 0 to 1
    isCompressing: false,
    springConst: 0.8
  };

  // Flippers states
  // Left Flipper
  let leftFlipper = {
    x: -4.2,
    y: -14.5,
    length: 4.8,
    angle: -0.4, // Radians
    targetAngle: -0.4,
    minAngle: -0.4,
    maxAngle: 0.55,
    omega: 12.0, // Angular velocity rad/s
    active: false,
    radius: 0.45
  };

  // Right Flipper
  let rightFlipper = {
    x: 4.2,
    y: -14.5,
    length: 4.8,
    angle: Math.PI + 0.4,
    targetAngle: Math.PI + 0.4,
    minAngle: Math.PI - 0.55,
    maxAngle: Math.PI + 0.4,
    omega: 12.0,
    active: false,
    radius: 0.45
  };

  // Bumpers, Slingshots, Walls definition
  let bumpers = [];
  let walls = [];
  let slingshots = [];
  let portalGates = []; // Future portal teleport logic
  let targetTriggers = []; // Drop targets / lights

  // Key states
  const keys = {
    leftFlipper: false,
    rightFlipper: false,
    plunger: false
  };

  // --- Lobby Setup ---
  themeCards.forEach(card => {
    card.addEventListener('click', () => {
      themeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentTheme = card.getAttribute('data-theme');
      btnStartGame.removeAttribute('disabled');
      initAudio();
    });
  });

  btnStartGame.addEventListener('click', () => {
    if (!currentTheme) return;
    startGame();
  });

  btnQuit.addEventListener('click', () => {
    if (confirm('현재 진행중인 스테이지를 나가시겠습니까?')) {
      quitToLobby();
    }
  });

  btnRules.addEventListener('click', () => {
    rulesModal.style.display = 'flex';
  });

  btnCloseRules.addEventListener('click', () => {
    rulesModal.style.display = 'none';
  });

  btnLobbyReturn.addEventListener('click', () => {
    gameoverModal.style.display = 'none';
    quitToLobby();
  });

  btnRestartGame.addEventListener('click', () => {
    gameoverModal.style.display = 'none';
    resetGame();
  });

  btnSoundToggle.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    if (isSoundEnabled) {
      btnSoundToggle.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span data-key="sound-toggle">소리 끄기</span>';
    } else {
      btnSoundToggle.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> <span data-key="sound-toggle">소리 켜기</span>';
    }
  });

  // --- Game Loop Management ---
  let animationId = null;

  function startGame() {
    lobbyPanel.style.display = 'none';
    gamePanel.style.display = 'grid';
    gameStarted = true;
    isGameOver = false;
    score = 0;
    balls = 3;
    multiplier = 1;
    
    scoreDisplay.textContent = formatNumber(score);
    ballsDisplay.textContent = balls;
    multiplierDisplay.textContent = 'x' + multiplier;

    // Initialize 3D Viewport
    init3D();
    buildTable();
    resetBall();

    // Start Loop
    lastTime = performance.now();
    animate(lastTime);
  }

  function quitToLobby() {
    gameStarted = false;
    cancelAnimationFrame(animationId);
    
    // Clear Three.js resources
    if (renderer) {
      renderer.dispose();
      const wrapper = document.getElementById('canvas-wrapper');
      while (wrapper.firstChild) {
        wrapper.removeChild(wrapper.firstChild);
      }
    }
    
    lobbyPanel.style.display = 'block';
    gamePanel.style.display = 'none';
  }

  function resetGame() {
    score = 0;
    balls = 3;
    multiplier = 1;
    isGameOver = false;
    
    scoreDisplay.textContent = formatNumber(score);
    ballsDisplay.textContent = balls;
    multiplierDisplay.textContent = 'x' + multiplier;

    // Reset physics items
    targetTriggers.forEach(t => t.active = false);
    resetBall();
  }

  // --- Physics Layout Builder depending on Themes ---
  function buildTablePhysics() {
    bumpers = [];
    walls = [];
    slingshots = [];
    portalGates = [];
    targetTriggers = [];

    // 1. Core outer walls
    // Main boundary walls (X-Y coordinates)
    // Left boundary
    walls.push({ x1: -10, y1: -19, x2: -10, y2: 12, type: 'normal' });
    // Right boundary (Launcher separator)
    walls.push({ x1: 8.5, y1: -19, x2: 8.5, y2: 10, type: 'normal' });
    // Outer right wall
    walls.push({ x1: 10.6, y1: -19, x2: 10.6, y2: 12, type: 'normal' });

    // Arch at top
    // Approximate curve with line segments
    const segments = 16;
    for (let i = 0; i < segments; i++) {
      const theta1 = (i / segments) * Math.PI;
      const theta2 = ((i + 1) / segments) * Math.PI;
      const radius = 10.6;
      walls.push({
        x1: radius * Math.cos(Math.PI - theta1),
        y1: 12 + 5 * Math.sin(Math.PI - theta1),
        x2: radius * Math.cos(Math.PI - theta2),
        y2: 12 + 5 * Math.sin(Math.PI - theta2),
        type: 'normal'
      });
    }

    // Inlanes & Outlanes guides (bottom area)
    // Left outlane wall
    walls.push({ x1: -10, y1: -9, x2: -8, y2: -14, type: 'normal' });
    // Left inlane guide
    walls.push({ x1: -5.5, y1: -9, x2: -7.5, y2: -15, type: 'normal' });
    // Right outlane wall
    walls.push({ x1: 8.5, y1: -9, x2: 6.5, y2: -14, type: 'normal' });
    // Right inlane guide
    walls.push({ x1: 5.5, y1: -9, x2: 7.5, y2: -15, type: 'normal' });

    // Bottom drain walls near flippers
    walls.push({ x1: -10, y1: -19, x2: -6.5, y2: -19, type: 'normal' });
    walls.push({ x1: 8.5, y1: -19, x2: 6.5, y2: -19, type: 'normal' });
    walls.push({ x1: 8.5, y1: -19, x2: 10.6, y2: -19, type: 'normal' }); // Bottom wall for plunger lane

    // Slingshots (Triangular active bumpers above flippers)
    // Left Slingshot
    slingshots.push({ x1: -7.2, y1: -11.5, x2: -5.2, y2: -7.5, boost: 3.5 });
    walls.push({ x1: -5.2, y1: -7.5, x2: -7.2, y2: -7.5, type: 'normal' });
    walls.push({ x1: -7.2, y1: -7.5, x2: -7.2, y2: -11.5, type: 'normal' });

    // Right Slingshot
    slingshots.push({ x1: 7.2, y1: -11.5, x2: 5.2, y2: -7.5, boost: 3.5 });
    walls.push({ x1: 5.2, y1: -7.5, x2: 7.2, y2: -7.5, type: 'normal' });
    walls.push({ x1: 7.2, y1: -7.5, x2: 7.2, y2: -11.5, type: 'normal' });

    // Theme Specific elements
    if (currentTheme === 'western') {
      // 3 Circle barrel bumpers at top
      bumpers.push({ x: -2.5, y: 8, radius: 1.4, points: 500, type: 'barrel' });
      bumpers.push({ x: 2.5, y: 8, radius: 1.4, points: 500, type: 'barrel' });
      bumpers.push({ x: 0, y: 4, radius: 1.4, points: 500, type: 'barrel' });

      // Drop Targets (Western Mine)
      // 3 targets on the left side
      targetTriggers.push({ id: 'mine1', x1: -9, y1: 1, x2: -8, y2: 3, active: false, points: 1000 });
      targetTriggers.push({ id: 'mine2', x1: -8, y1: 3, x2: -7, y2: 5, active: false, points: 1000 });
      targetTriggers.push({ id: 'mine3', x1: -7, y1: 5, x2: -6, y2: 7, active: false, points: 1000 });

      // Static wood posts
      bumpers.push({ x: -6, y: -2, radius: 0.6, points: 100, type: 'post' });
      bumpers.push({ x: 6, y: -2, radius: 0.6, points: 100, type: 'post' });

    } else if (currentTheme === 'modern') {
      // Skyscraper bumpers
      bumpers.push({ x: -3.5, y: 7.5, radius: 1.5, points: 600, type: 'skyscraper' });
      bumpers.push({ x: 3.5, y: 7.5, radius: 1.5, points: 600, type: 'skyscraper' });
      bumpers.push({ x: 0, y: 11, radius: 1.5, points: 800, type: 'skyscraper' });

      // Steel ramp loops
      // We simulate loop portals/ramps with lines that trigger score and speed boost
      targetTriggers.push({ id: 'ramp_entrance', x1: -8.5, y1: 4, x2: -7, y2: 5, active: false, points: 2500, action: 'ramp_boost' });
      targetTriggers.push({ id: 'traffic_red', x1: 3, y1: -1, x2: 4, y2: 0, active: false, points: 500 });
      targetTriggers.push({ id: 'traffic_yellow', x1: 4, y1: 0, x2: 5, y2: 1, active: false, points: 500 });
      targetTriggers.push({ id: 'traffic_green', x1: 5, y1: 1, x2: 6, y2: 2, active: false, points: 500 });

    } else if (currentTheme === 'future') {
      // Cosmic Plasma bumpers
      bumpers.push({ x: -3, y: 7, radius: 1.5, points: 1000, type: 'plasma' });
      bumpers.push({ x: 3, y: 7, radius: 1.5, points: 1000, type: 'plasma' });
      bumpers.push({ x: 0, y: 3, radius: 1.2, points: 700, type: 'plasma' });
      bumpers.push({ x: 0, y: 11, radius: 1.2, points: 700, type: 'plasma' });

      // Wormhole Teleport portals
      // Enter portal 1 (Black hole) on top-left, exit portal 2 (White hole) on top-right
      portalGates.push({
        id: 'wormhole_in',
        x: -7.5,
        y: 1.5,
        radius: 1.0,
        targetX: 6.5,
        targetY: 10,
        vx: 3,
        vy: -5
      });
      
      // Laser shield wall on right
      walls.push({ x1: 5, y1: -4, x2: 8, y2: -2, type: 'laser_shield' });
    }
  }

  // --- Three.js Table Builder ---
  function init3D() {
    const wrapper = document.getElementById('canvas-wrapper');
    const width = wrapper.clientWidth;
    const height = wrapper.clientHeight;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(currentTheme === 'light' ? 0xe2e8f0 : 0x070c19);
    if (currentTheme === 'future') {
      scene.fog = new THREE.FogExp2(0x0a0518, 0.015);
    } else {
      scene.fog = new THREE.FogExp2(0x070c19, 0.01);
    }

    // Camera
    camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1000);
    // Classical Pinball camera tilt angle
    camera.position.set(0, -25, 26);
    camera.lookAt(0, 2, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    wrapper.appendChild(renderer.domElement);

    // OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1; // Limit camera going below table
    controls.minDistance = 15;
    controls.maxDistance = 55;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, currentTheme === 'light' ? 0.6 : 0.25);
    scene.add(ambientLight);

    // Directional shadow casting light
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, -15, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.top = 25;
    dirLight.shadow.camera.bottom = -25;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Spotlight 1 & 2 (Neon glowing spotlight effects)
    lightSpot1 = new THREE.PointLight(0x00f2fe, 1.5, 35);
    lightSpot1.position.set(-6, 5, 8);
    scene.add(lightSpot1);

    lightSpot2 = new THREE.PointLight(0xff7e5f, 1.5, 35);
    lightSpot2.position.set(6, 5, 8);
    scene.add(lightSpot2);

    window.addEventListener('resize', onWindowResize);
  }

  function onWindowResize() {
    const wrapper = document.getElementById('canvas-wrapper');
    if (!wrapper || !camera || !renderer) return;
    const width = wrapper.clientWidth;
    const height = wrapper.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function buildTable() {
    buildTablePhysics();

    // Clear meshes arrays
    bumperMeshes = [];
    wallMeshes = [];
    slingshotMeshes = [];
    decorationMeshes.forEach(mesh => scene.remove(mesh));
    decorationMeshes = [];

    // Outer table box mesh (incline is mapped using group angle)
    const tableGroup = new THREE.Group();
    // Rotate slightly so it slopes downwards
    tableGroup.rotation.x = 0.14; // Incline around X-axis
    scene.add(tableGroup);

    // 1. Table Field board
    let boardMaterial;
    if (currentTheme === 'western') {
      // Wood board
      boardMaterial = new THREE.MeshStandardMaterial({
        color: 0x5c4033,
        roughness: 0.7,
        metalness: 0.1
      });
      scene.background = new THREE.Color(0x1a0f05);
      lightSpot1.color.setHex(0xffaa44);
      lightSpot2.color.setHex(0xffddaa);
    } else if (currentTheme === 'modern') {
      // Dark asphalt carbon-fiber look
      boardMaterial = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.3,
        metalness: 0.8
      });
      scene.background = new THREE.Color(0x030712);
      lightSpot1.color.setHex(0x00f2fe);
      lightSpot2.color.setHex(0xff0055);
    } else {
      // Hologram space grid look
      boardMaterial = new THREE.MeshStandardMaterial({
        color: 0x090518,
        roughness: 0.1,
        metalness: 0.95
      });
      scene.background = new THREE.Color(0x05020a);
      lightSpot1.color.setHex(0x00ffff);
      lightSpot2.color.setHex(0xff00ff);

      // Add a holographic wireframe grid overlay
      const gridGeom = new THREE.PlaneGeometry(24, 40, 24, 40);
      const gridMat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        wireframe: true,
        transparent: true,
        opacity: 0.08
      });
      const gridMesh = new THREE.Mesh(gridGeom, gridMat);
      gridMesh.position.z = 0.02;
      tableGroup.add(gridMesh);
    }

    const boardGeom = new THREE.BoxGeometry(24, 40, 1);
    const board = new THREE.Mesh(boardGeom, boardMaterial);
    board.position.z = -0.5; // Surface lies at Z=0
    board.receiveShadow = true;
    tableGroup.add(board);

    // 2. Table Side rails (wood or steel)
    const railMat = new THREE.MeshStandardMaterial({
      color: currentTheme === 'western' ? 0x3d271d : 0x475569,
      roughness: 0.5,
      metalness: currentTheme === 'western' ? 0.0 : 0.8
    });
    
    // Left, Right, Top rails
    const railLeft = new THREE.Mesh(new THREE.BoxGeometry(1, 40, 2), railMat);
    railLeft.position.set(-12, 0, 0.5);
    railLeft.castShadow = true;
    tableGroup.add(railLeft);

    const railRight = new THREE.Mesh(new THREE.BoxGeometry(1, 40, 2), railMat);
    railRight.position.set(12, 0, 0.5);
    railRight.castShadow = true;
    tableGroup.add(railRight);

    const railTop = new THREE.Mesh(new THREE.BoxGeometry(25, 1, 2), railMat);
    railTop.position.set(0, 20.5, 0.5);
    railTop.castShadow = true;
    tableGroup.add(railTop);

    // 3. Render Static Walls & Slingshots (visual mapping)
    const wallMat = new THREE.MeshStandardMaterial({
      color: currentTheme === 'western' ? 0x8a7a6e : 0x94a3b8,
      metalness: currentTheme === 'western' ? 0.2 : 0.9,
      roughness: 0.2
    });

    walls.forEach(w => {
      const dx = w.x2 - w.x1;
      const dy = w.y2 - w.y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      // Create a wall mesh
      const wallGeom = new THREE.BoxGeometry(len, 0.4, 1.2);
      let mat = wallMat;
      if (w.type === 'laser_shield') {
        mat = new THREE.MeshBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.7 });
      }
      const wallMesh = new THREE.Mesh(wallGeom, mat);
      wallMesh.position.set(w.x1 + dx/2, w.y1 + dy/2, 0.6);
      wallMesh.rotation.z = angle;
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      tableGroup.add(wallMesh);
    });

    // Draw Slingshot rubbers
    const slingshotRubberMat = new THREE.MeshStandardMaterial({
      color: 0xff3b30,
      emissive: 0x550000,
      roughness: 0.1
    });
    slingshots.forEach(s => {
      const dx = s.x2 - s.x1;
      const dy = s.y2 - s.y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      const rubberGeom = new THREE.BoxGeometry(len, 0.5, 1.0);
      const rubberMesh = new THREE.Mesh(rubberGeom, slingshotRubberMat);
      rubberMesh.position.set(s.x1 + dx/2, s.y1 + dy/2, 0.5);
      rubberMesh.rotation.z = angle;
      tableGroup.add(rubberMesh);
      slingshotMeshes.push({ mesh: rubberMesh, initialX: rubberMesh.position.x, initialY: rubberMesh.position.y });
    });

    // 4. Render Circle Bumpers
    bumpers.forEach((b, idx) => {
      const bumperGroup = new THREE.Group();
      bumperGroup.position.set(b.x, b.y, 0);
      tableGroup.add(bumperGroup);

      // Base cylinder
      let baseColor = 0xffa500;
      if (b.type === 'barrel') baseColor = 0x8b5a2b; // Brown barrel
      else if (b.type === 'skyscraper') baseColor = 0x64748b; // Steel structure
      else if (b.type === 'plasma') baseColor = 0x00ffff; // Cyan portal

      const baseGeom = new THREE.CylinderGeometry(b.radius, b.radius, 1.2, 32);
      const baseMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.3,
        metalness: 0.8
      });
      const baseMesh = new THREE.Mesh(baseGeom, baseMat);
      baseMesh.rotation.x = Math.PI / 2; // Orient along Z axis
      baseMesh.position.z = 0.6;
      baseMesh.castShadow = true;
      bumperGroup.add(baseMesh);

      // Cap ring (glowing LED visual)
      const capGeom = new THREE.CylinderGeometry(b.radius * 0.8, b.radius * 0.8, 0.3, 32);
      const capMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: baseColor,
        emissiveIntensity: 1.5
      });
      const capMesh = new THREE.Mesh(capGeom, capMat);
      capMesh.rotation.x = Math.PI / 2;
      capMesh.position.z = 1.35;
      bumperGroup.add(capMesh);

      // Keep reference for collision flash animation
      bumperMeshes.push({
        group: bumperGroup,
        capMaterial: capMat,
        baseColor: new THREE.Color(baseColor),
        scale: 1.0,
        flashTimer: 0
      });
    });

    // Drop Targets (Western Mine) or traffic lights
    targetTriggers.forEach(t => {
      const dx = t.x2 - t.x1;
      const dy = t.y2 - t.y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      const targetGeom = new THREE.BoxGeometry(len, 0.3, 1.2);
      const targetMat = new THREE.MeshStandardMaterial({
        color: 0xeab308,
        emissive: 0x332200,
        roughness: 0.2
      });
      const mesh = new THREE.Mesh(targetGeom, targetMat);
      mesh.position.set(t.x1 + dx/2, t.y1 + dy/2, 0.6);
      mesh.rotation.z = angle;
      tableGroup.add(mesh);
      t.mesh = mesh; // Attach mesh reference to target state
    });

    // Portal Teleport Ring models (Future Wormhole)
    portalGates.forEach(p => {
      // Draw outer rotating rings
      const torusGeom = new THREE.TorusGeometry(p.radius, 0.2, 16, 100);
      const torusMat = new THREE.MeshBasicMaterial({
        color: p.id === 'wormhole_in' ? 0xff00ff : 0x00ffff,
        wireframe: true
      });
      const torusMesh = new THREE.Mesh(torusGeom, torusMat);
      torusMesh.position.set(p.x, p.y, 0.8);
      tableGroup.add(torusMesh);
      decorationMeshes.push(torusMesh); // Keep reference to rotate it in render loop
    });

    // 5. Render Flippers
    const flipperMat = new THREE.MeshStandardMaterial({
      color: currentTheme === 'western' ? 0xd97706 : 0x3b82f6,
      roughness: 0.1,
      metalness: 0.9
    });

    // Flippers shapes are capsules or wedge boxes.
    // Left Flipper Mesh
    leftFlipperMesh = new THREE.Group();
    leftFlipperMesh.position.set(leftFlipper.x, leftFlipper.y, 0.6);
    tableGroup.add(leftFlipperMesh);

    const flipperLBody = new THREE.Mesh(new THREE.BoxGeometry(leftFlipper.length, 0.7, 1.0), flipperMat);
    flipperLBody.position.x = leftFlipper.length / 2; // Shift so pivot is at hinge origin
    flipperLBody.castShadow = true;
    leftFlipperMesh.add(flipperLBody);

    // Left Pivot Cap
    const capL = new THREE.Mesh(new THREE.CylinderGeometry(leftFlipper.radius, leftFlipper.radius, 1.1, 16), flipperMat);
    capL.rotation.x = Math.PI / 2;
    leftFlipperMesh.add(capL);

    // Right Flipper Mesh
    rightFlipperMesh = new THREE.Group();
    rightFlipperMesh.position.set(rightFlipper.x, rightFlipper.y, 0.6);
    tableGroup.add(rightFlipperMesh);

    const flipperRBody = new THREE.Mesh(new THREE.BoxGeometry(rightFlipper.length, 0.7, 1.0), flipperMat);
    flipperRBody.position.x = -rightFlipper.length / 2; // Shift so pivot is at hinge origin
    flipperRBody.castShadow = true;
    rightFlipperMesh.add(flipperRBody);

    // Right Pivot Cap
    const capR = new THREE.Mesh(new THREE.CylinderGeometry(rightFlipper.radius, rightFlipper.radius, 1.1, 16), flipperMat);
    capR.rotation.x = Math.PI / 2;
    rightFlipperMesh.add(capR);

    // 6. Plunger visual mesh
    const plungerMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8, roughness: 0.1 });
    const plungerGeom = new THREE.BoxGeometry(plunger.width, plunger.height, 0.8);
    const plungerMesh = new THREE.Mesh(plungerGeom, plungerMat);
    plungerMesh.position.set(plunger.x, plunger.y, 0.4);
    tableGroup.add(plungerMesh);
    plunger.mesh = plungerMesh; // Store reference

    // 7. Ball mesh
    const ballGeom = new THREE.SphereGeometry(ball.radius, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 1.0,
      roughness: 0.05
    });
    ballMesh = new THREE.Mesh(ballGeom, ballMat);
    ballMesh.castShadow = true;
    tableGroup.add(ballMesh);

    // Reference tableGroup in higher scope
    window.tableGroup = tableGroup;
  }

  // --- Particle Sparks generator ---
  function createSparks(x, y, colorHex, count = 12) {
    if (!window.tableGroup) return;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2.5;
      const size = 0.15 + Math.random() * 0.2;
      
      const geom = new THREE.SphereGeometry(size, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 1.0
      });
      const spark = new THREE.Mesh(geom, mat);
      spark.position.set(x, y, 0.6);
      window.tableGroup.add(spark);

      particles.push({
        mesh: spark,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        vz: 1.0 + Math.random() * 3.0, // Spark flies upwards in Z
        gravityZ: -0.15,
        life: 1.0,
        decay: 0.03 + Math.random() * 0.04
      });
    }
  }

  // --- Keyboard & Touch Listeners ---
  window.addEventListener('keydown', e => {
    if (isGameOver || !gameStarted) return;
    
    // Left Flipper triggers
    if (e.key === 'Shift' && e.code === 'ShiftLeft') keys.leftFlipper = true;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.leftFlipper = true;

    // Right Flipper triggers
    if (e.key === 'Shift' && e.code === 'ShiftRight') keys.rightFlipper = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.rightFlipper = true;

    // Plunger trigger
    if (e.key === ' ' || e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      keys.plunger = true;
    }

    // Reset shortcut
    if (e.key === 'r' || e.key === 'R') {
      resetGame();
    }
  });

  window.addEventListener('keyup', e => {
    if (e.key === 'Shift' && e.code === 'ShiftLeft') keys.leftFlipper = false;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.leftFlipper = false;

    if (e.key === 'Shift' && e.code === 'ShiftRight') keys.rightFlipper = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.rightFlipper = false;

    if (e.key === ' ' || e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      keys.plunger = false;
    }
  });

  // Touch interface triggers (Mobile)
  btnMobileLeft.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.leftFlipper = true;
  });
  btnMobileLeft.addEventListener('touchend', () => {
    keys.leftFlipper = false;
  });

  btnMobileRight.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.rightFlipper = true;
  });
  btnMobileRight.addEventListener('touchend', () => {
    keys.rightFlipper = false;
  });

  btnMobilePlunger.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.plunger = true;
  });
  btnMobilePlunger.addEventListener('touchend', () => {
    keys.plunger = false;
  });

  // --- Physics & Collision Resolution (Continuous Sub-stepping) ---
  const SUB_STEPS = 8;

  function updatePhysics(dt) {
    const stepDt = dt / SUB_STEPS;

    // 1. Rotate flippers towards targets
    updateFlipperRotation(leftFlipper, keys.leftFlipper, stepDt * SUB_STEPS);
    updateFlipperRotation(rightFlipper, keys.rightFlipper, stepDt * SUB_STEPS);

    // Apply flipper meshes rotation
    if (leftFlipperMesh) leftFlipperMesh.rotation.z = leftFlipper.angle;
    if (rightFlipperMesh) rightFlipperMesh.rotation.z = rightFlipper.angle;

    // Compress plunger
    if (keys.plunger) {
      if (plunger.compression < 1.0) {
        plunger.compression += 0.05;
        playPlungerChargeSound(plunger.compression);
      }
    } else {
      if (plunger.compression > 0) {
        // Launch ball if in plunger lane
        if (ball.x > 8.5 && ball.y < -15 && !ball.inPlay) {
          let launchVelocity = plunger.compression * 22;
          if (launchVelocity < 8.0) launchVelocity = 16.0; // Minimum launch velocity for quick taps / automated clicks
          ball.vy = launchVelocity;
          ball.vx = -0.5 - Math.random() * 0.5; // Kick left slightly
          ball.inPlay = true;
          playLaunchSound();
        }
        plunger.compression = 0;
      }
    }

    // Move visual plunger block based on compression
    if (plunger.mesh) {
      plunger.mesh.position.y = plunger.y - plunger.compression * 1.5;
    }

    // Run physics sub-steps
    for (let step = 0; step < SUB_STEPS; step++) {
      if (!ball.inPlay) {
        // Lock ball to plunger launcher surface, shifting down with compression
        ball.x = 9.8;
        ball.y = -18.0 + 0.5 + ball.radius - plunger.compression * 1.5;
        ball.vx = 0;
        ball.vy = 0;
      } else {
        // Gravity pulls ball down the table incline
        ball.vy += GRAVITY_Y * stepDt;

        // Apply air friction
        ball.vx *= Math.pow(FRICTION, stepDt);
        ball.vy *= Math.pow(FRICTION, stepDt);

        // Update positions
        ball.x += ball.vx * stepDt;
        ball.y += ball.vy * stepDt;

        // Bound velocity to prevent extreme tunneling
        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        if (speed > MAX_SPEED) {
          ball.vx = (ball.vx / speed) * MAX_SPEED;
          ball.vy = (ball.vy / speed) * MAX_SPEED;
        }

        // Check colliders
        resolveWallCollisions(stepDt);
        resolveBumperCollisions();
        resolveFlipperCollisions(leftFlipper);
        resolveFlipperCollisions(rightFlipper);
        resolveSlingshotCollisions();
        resolveTriggerCollisions();
        resolvePortalCollisions();
        
        // Bottom outlane Drain check
        if (ball.y < -20) {
          drainBall();
          break;
        }
      }
    }
  }

  function updateFlipperRotation(flipper, active, dt) {
    let currentTarget = active ? flipper.maxAngle : flipper.minAngle;
    
    // Smooth/high speed angular velocity
    if (active) {
      flipper.angle += flipper.omega * dt;
      if (flipper.angle > flipper.maxAngle) flipper.angle = flipper.maxAngle;
      // Play swipe sound once
      if (flipper.angle === flipper.maxAngle && !flipper.soundPlayed) {
        playFlipperSound();
        flipper.soundPlayed = true;
      }
    } else {
      flipper.angle -= flipper.omega * dt;
      if (flipper.angle < flipper.minAngle) flipper.angle = flipper.minAngle;
      flipper.soundPlayed = false;
    }
  }

  // --- Collision Resolutions Math ---

  // Closest point on line segment
  function closestPointOnSegment(px, py, ax, ay, bx, by) {
    const abx = bx - ax;
    const aby = by - ay;
    const apx = px - ax;
    const apy = py - ay;

    const abLenSq = abx * abx + aby * aby;
    if (abLenSq === 0) return { x: ax, y: ay, t: 0 };

    let t = (apx * abx + apy * aby) / abLenSq;
    t = Math.max(0, Math.min(1, t));

    return {
      x: ax + t * abx,
      y: ay + t * aby,
      t: t
    };
  }

  function resolveWallCollisions(dt) {
    walls.forEach(w => {
      const closest = closestPointOnSegment(ball.x, ball.y, w.x1, w.y1, w.x2, w.y2);
      const dx = ball.x - closest.x;
      const dy = ball.y - closest.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < ball.radius) {
        // Resolve overlap
        const normalX = dist > 0 ? dx / dist : 0;
        const normalY = dist > 0 ? dy / dist : 1;

        ball.x = closest.x + normalX * ball.radius;
        ball.y = closest.y + normalY * ball.radius;

        // Bounce reflection
        const vn = ball.vx * normalX + ball.vy * normalY;
        if (vn < 0) {
          const rest = 0.55; // Table boundary elasticity
          ball.vx = ball.vx - (1 + rest) * vn * normalX;
          ball.vy = ball.vy - (1 + rest) * vn * normalY;

          // Sound trigger for hard bounces
          if (Math.abs(vn) > 1.5) {
            playSynthSound([200, 100], [0.03, 0.08], 'sine', 0.04);
          }
        }
      }
    });
  }

  function resolveBumperCollisions() {
    bumpers.forEach((b, idx) => {
      const dx = ball.x - b.x;
      const dy = ball.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = ball.radius + b.radius;

      if (dist < minDist) {
        // Resolve overlap
        const normalX = dx / dist;
        const normalY = dy / dist;

        ball.x = b.x + normalX * minDist;
        ball.y = b.y + normalY * minDist;

        // Reflect velocity with extra bumper boost
        const vn = ball.vx * normalX + ball.vy * normalY;
        if (vn < 0) {
          const rest = 0.6;
          const bounceBoost = 5.0; // High kick impulse
          
          ball.vx = ball.vx - (1 + rest) * vn * normalX + normalX * bounceBoost;
          ball.vy = ball.vy - (1 + rest) * vn * normalY + normalY * bounceBoost;

          // Score & Sound
          addScore(b.points);
          playBumperSound();

          // Flash trigger
          if (bumperMeshes[idx]) {
            bumperMeshes[idx].scale = 1.35;
            bumperMeshes[idx].flashTimer = 0.12;
            createSparks(b.x, b.y, bumperMeshes[idx].baseColor.getHex());
          }
        }
      }
    });
  }

  function resolveSlingshotCollisions() {
    slingshots.forEach((s, idx) => {
      const closest = closestPointOnSegment(ball.x, ball.y, s.x1, s.y1, s.x2, s.y2);
      const dx = ball.x - closest.x;
      const dy = ball.y - closest.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < ball.radius) {
        // Resolve overlap
        const normalX = dx / dist;
        const normalY = dy / dist;

        ball.x = closest.x + normalX * ball.radius;
        ball.y = closest.y + normalY * ball.radius;

        // Reflect with slingshot kick
        const vn = ball.vx * normalX + ball.vy * normalY;
        if (vn < 0) {
          const rest = 0.5;
          const slingshotBoost = s.boost;
          
          ball.vx = ball.vx - (1 + rest) * vn * normalX + normalX * slingshotBoost;
          ball.vy = ball.vy - (1 + rest) * vn * normalY + normalY * slingshotBoost;

          addScore(200);
          playSlingshotSound();
          createSparks(closest.x, closest.y, 0xff3b30);

          // Animate slingshot slightly
          if (slingshotMeshes[idx]) {
            slingshotMeshes[idx].mesh.position.x = slingshotMeshes[idx].initialX + normalX * 0.4;
            slingshotMeshes[idx].mesh.position.y = slingshotMeshes[idx].initialY + normalY * 0.4;
          }
        }
      }
    });
  }

  function resolveFlipperCollisions(flipper) {
    // Flipper line segment: from hinge (flipper.x, flipper.y) to tip
    const tipX = flipper.x + flipper.length * Math.cos(flipper.angle);
    const tipY = flipper.y + flipper.length * Math.sin(flipper.angle);

    const closest = closestPointOnSegment(ball.x, ball.y, flipper.x, flipper.y, tipX, tipY);
    const dx = ball.x - closest.x;
    const dy = ball.y - closest.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // We add flipper radius to collision boundary
    const minDist = ball.radius + flipper.radius * (1 - closest.t * 0.5); // Tapered flipper shape

    if (dist < minDist) {
      const normalX = dx / dist;
      const normalY = dy / dist;

      // Resolve overlap
      ball.x = closest.x + normalX * minDist;
      ball.y = closest.y + normalY * minDist;

      // Linear velocity of flipper at contact point
      // Flipper angular speed: positive (upward flip), negative or zero (falling back)
      let flipperVelocityX = 0;
      let flipperVelocityY = 0;

      // If active, add rotational velocity to kick the ball
      if (flipper.active && flipper.angle !== flipper.maxAngle && flipper.angle !== flipper.minAngle) {
        // Distance from hinge pivot
        const distFromHinge = Math.sqrt((closest.x - flipper.x) * (closest.x - flipper.x) + (closest.y - flipper.y) * (closest.y - flipper.y));
        const dir = (flipper.maxAngle > flipper.minAngle) ? 1 : -1;
        const speed = distFromHinge * flipper.omega;
        
        // Direction perp to flipper line: (-sin, cos)
        flipperVelocityX = -Math.sin(flipper.angle) * speed * dir;
        flipperVelocityY = Math.cos(flipper.angle) * speed * dir;
      }

      // Ball velocity relative to flipper
      const relVx = ball.vx - flipperVelocityX;
      const relVy = ball.vy - flipperVelocityY;
      const vn = relVx * normalX + relVy * normalY;

      if (vn < 0) {
        const rest = 0.45; // Flipper rubber elasticity
        ball.vx = flipperVelocityX + (ball.vx - flipperVelocityX) - (1 + rest) * vn * normalX;
        ball.vy = flipperVelocityY + (ball.vy - flipperVelocityY) - (1 + rest) * vn * normalY;

        // Flipper hit trigger score/effects
        if (flipper.active) {
          addScore(100);
          createSparks(closest.x, closest.y, 0xffffff, 4);
        }
      }
    }
  }

  function resolveTriggerCollisions() {
    targetTriggers.forEach(t => {
      if (t.active) return; // Disappear when active

      const closest = closestPointOnSegment(ball.x, ball.y, t.x1, t.y1, t.x2, t.y2);
      const dx = ball.x - closest.x;
      const dy = ball.y - closest.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < ball.radius) {
        // Trigger hit
        t.active = true;
        addScore(t.points);
        playSynthSound([440, 880], [0.05, 0.12], 'sine', 0.1);
        createSparks(closest.x, closest.y, 0xeab308, 10);

        // Displace target visual (hide under board)
        if (t.mesh) {
          t.mesh.position.z = -1;
        }

        // Modern ramp speed boost
        if (t.action === 'ramp_boost') {
          // Launch ball along ramp loop
          ball.vx = 8;
          ball.vy = 12;
          playBonusSound();
          multiplier++;
          multiplierDisplay.textContent = 'x' + multiplier;
        }

        // Reset target triggers if all are hit (Western Gold Mine)
        const activeCount = targetTriggers.filter(tr => tr.active).length;
        if (activeCount === targetTriggers.length) {
          setTimeout(() => {
            targetTriggers.forEach(tr => {
              tr.active = false;
              if (tr.mesh) tr.mesh.position.z = 0.6;
            });
            playBonusSound();
            addScore(10000);
          }, 3000);
        }
      }
    });
  }

  function resolvePortalCollisions() {
    portalGates.forEach(p => {
      const dx = ball.x - p.x;
      const dy = ball.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < p.radius + ball.radius) {
        // sucked into wormhole!
        playSynthSound([800, 400, 200, 800], [0.08, 0.15, 0.25, 0.4], 'sawtooth', 0.12);
        createSparks(p.x, p.y, 0xff00ff, 25);

        // Instant teleport to white hole exit
        ball.x = p.targetX;
        ball.y = p.targetY;
        ball.vx = p.vx;
        ball.vy = p.vy;

        createSparks(p.targetX, p.targetY, 0x00ffff, 25);
        addScore(5000);
        multiplier++;
        multiplierDisplay.textContent = 'x' + multiplier;
      }
    });
  }

  // --- Score, Multipliers and Drain logic ---
  function addScore(points) {
    score += points * multiplier;
    scoreDisplay.textContent = formatNumber(score);
  }

  function resetBall() {
    ball.x = 9.8;
    ball.y = -16.5;
    ball.vx = 0;
    ball.vy = 0;
    ball.inPlay = false;

    // Reset flippers positions
    keys.leftFlipper = false;
    keys.rightFlipper = false;
    keys.plunger = false;
  }

  function drainBall() {
    playDrainSound();
    balls--;
    ballsDisplay.textContent = balls;

    // Check game over
    if (balls <= 0) {
      endGame();
    } else {
      resetBall();
    }
  }

  function endGame() {
    isGameOver = true;
    finalScoreVal.textContent = formatNumber(score);

    // New High Score?
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('pinball_high_score', highScore);
      highScoreVal.textContent = formatNumber(highScore);
      newRecordMsg.style.display = 'block';
      playNewRecordSound();
    } else {
      newRecordMsg.style.display = 'none';
      playSynthSound([500, 400, 300, 200, 100], [0.15, 0.3, 0.45, 0.6, 0.8], 'sawtooth', 0.15);
    }

    gameoverModal.style.display = 'flex';
  }

  // --- Rendering Loop ---
  let lastTime = 0;

  function animate(time) {
    if (!gameStarted) return;
    
    animationId = requestAnimationFrame(animate);

    // Dynamic FPS math delta
    let dt = (time - lastTime) / 16.666; // Normalize to 1 unit per 60FPS frame
    if (dt > 3.0) dt = 3.0; // Prevent huge leaps on page lag
    lastTime = time;

    // Update controls logic
    leftFlipper.active = keys.leftFlipper;
    rightFlipper.active = keys.rightFlipper;

    // Physics ticks
    if (!isGameOver) {
      updatePhysics(dt);
    }

    // Sync Ball mesh with physics coords
    if (ballMesh) {
      ballMesh.position.set(ball.x, ball.y, 0.65);
    }

    // Update Flipper Mesh positions/rotations
    // We already do this inside updatePhysics() for instant reaction

    // Bumper flash decay animations
    bumperMeshes.forEach(bm => {
      if (bm.flashTimer > 0) {
        bm.flashTimer -= 0.016 * dt;
        bm.capMaterial.emissiveIntensity = 1.5 + bm.flashTimer * 10;
        // Pulse scale
        bm.group.scale.set(bm.scale, bm.scale, 1.0);
        bm.scale -= 0.05 * dt;
        if (bm.scale < 1.0) bm.scale = 1.0;
      } else {
        bm.capMaterial.emissiveIntensity = 1.5;
        bm.group.scale.set(1.0, 1.0, 1.0);
      }
    });

    // Slingshot bounce decay animation
    slingshotMeshes.forEach(sm => {
      const dx = sm.mesh.position.x - sm.initialX;
      const dy = sm.mesh.position.y - sm.initialY;
      // return to base center
      sm.mesh.position.x -= dx * 0.12 * dt;
      sm.mesh.position.y -= dy * 0.12 * dt;
    });

    // Rotate holographic portals
    decorationMeshes.forEach((mesh, idx) => {
      mesh.rotation.z += 0.02 * dt;
      mesh.rotation.y = Math.sin(time * 0.001) * 0.2;
    });

    // Update Sparks particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.mesh.position.x += p.vx * dt;
      p.mesh.position.y += p.vy * dt;
      p.mesh.position.z += p.vz * dt;
      p.vz += p.gravityZ * dt;
      p.life -= p.decay * dt;

      p.mesh.material.opacity = p.life;
      // Fade size
      p.mesh.scale.set(p.life, p.life, p.life);

      if (p.life <= 0 || p.mesh.position.z < -1) {
        // Remove spark mesh
        if (window.tableGroup) {
          window.tableGroup.remove(p.mesh);
        }
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        particles.splice(i, 1);
      }
    }

    // Camera follow ball slightly (Smooth tilt focus)
    if (controls) {
      controls.target.x += (ball.x * 0.15 - controls.target.x) * 0.08 * dt;
      controls.target.y += ((ball.y + 4) * 0.15 - controls.target.y) * 0.08 * dt;
      controls.update();
    }

    // Render WebGL frame
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  // --- Helper utility ---
  function formatNumber(num) {
    return num.toLocaleString();
  }

  // --- Dynamic Dashboard Dark/Light Theme support ---
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-moon"></i> <span data-key="theme-btn">다크</span>' : '<i class="fa-solid fa-sun"></i> <span data-key="theme-btn">라이트</span>';
    
    if (scene) {
      scene.background.setHex(newTheme === 'light' ? 0xe2e8f0 : 0x070c19);
    }
  });

});
