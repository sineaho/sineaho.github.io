/**
 * CineAHO Yacht Dice 3D - Game & WebGL Engine
 * Handles Yacht Dice scoring, pass-and-play multiplayer (up to 8),
 * WebGL physics simulations, slerp alignment, click raycasting, and Web Audio synth.
 */

// ==========================================================================
// 1. GAME STATE & VARIABLES
// ==========================================================================

const GAME_STATE = {
  players: [],            // Array of player objects: { name, scores: { aces: null, ... } }
  currentPlayerIndex: 0,
  currentRound: 1,
  rollsRemaining: 3,
  gameActive: false,
  diceValues: [1, 2, 3, 4, 5],
  diceLocked: [false, false, false, false, false],
  dicePhysicsActive: false,
  soundEnabled: true,
  selectedTheme: 'classic', // 'classic', 'cyber', 'gold'
  gameMode: 'vs-ai',       // 'vs-ai' or 'local-multi'
  aiDifficulty: 'normal'   // 'easy', 'normal', 'hard'
};

// Yacht category definitions
const CATEGORIES = [
  { id: 'aces', name: '1 (Ones)', desc: '1의 눈금 합계' },
  { id: 'deuces', name: '2 (Twos)', desc: '2의 눈금 합계' },
  { id: 'threes', name: '3 (Threes)', desc: '3의 눈금 합계' },
  { id: 'fours', name: '4 (Fours)', desc: '4의 눈금 합계' },
  { id: 'fives', name: '5 (Fives)', desc: '5의 눈금 합계' },
  { id: 'sixes', name: '6 (Sixes)', desc: '6의 눈금 합계' },
  { id: 'subtotal', name: '소계', desc: '1~6 항목의 합계', calc: false },
  { id: 'bonus', name: '보너스 (+35)', desc: '소계 63점 이상 시 획득', calc: false },
  { id: 'choice', name: '초이스 (Choice)', desc: '모든 눈금의 합' },
  { id: 'four_of_a_kind', name: '포오브어카인드', desc: '동일 눈금 4개 이상 시 총합' },
  { id: 'full_house', name: '풀하우스', desc: '3개 동일 + 2개 동일 구성 시 총합' },
  { id: 'little_straight', name: '소형 스트레이트', desc: '4개 연속 눈금 (15점)' },
  { id: 'big_straight', name: '대형 스트레이트', desc: '5개 연속 눈금 (30점)' },
  { id: 'yacht', name: '야추 (Yacht)', desc: '5개 눈금 모두 일치 (50점)' },
  { id: 'total', name: '총점', desc: '최종 합계 점수', calc: false }
];

// 3D & Physics globals
let scene, camera, renderer, controls;
let diceMeshes = [];
let trayFloor, trayWalls = [];
const diceRadius = 0.5;
const physicsWorld = {
  gravity: -16,
  floorY: 0.5,
  xLimit: 3.8,
  zLimit: 3.8,
  bounciness: 0.5,
  friction: 0.98,
  angFriction: 0.97
};

// Animation state for dice locking (flying from tray to Keep shelf)
const keepShelf = {
  y: 2.2,
  z: 3.4,
  xOffsets: [-2.0, -1.0, 0.0, 1.0, 2.0],
  pitch: Math.PI / 5 // slant slightly facing camera
};

// Web Audio API context
let audioCtx = null;

// Raycaster for clicking 3D dice
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Track overall simulation lock state
let isRollingAnimation = false;

// Dynamic physics throwing globals
let isDraggingThrow = false;
let pointerDownScreen = null;
let dragStart3D = null;
let throwIndicatorLine = null;

// 3D Cup model group and animation timeline state
let cupGroup = null;
const cupAnimation = {
  active: false,
  phase: 'idle', // 'idle', 'descend', 'shake', 'pour', 'exit'
  timer: 0,
  duration: 0
};

// Particle sparks system array
let collisionParticles = [];

// ==========================================================================
// 2. PROCEDURAL SOUND SYNTHESIZER (WEB AUDIO API)
// ==========================================================================

function initAudio() {
  if (audioCtx) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (AudioContextClass) {
    audioCtx = new AudioContextClass();
  }
}

function playSound(type, intensity = 1.0) {
  if (!GAME_STATE.soundEnabled) return;
  initAudio();
  if (!audioCtx) return;
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;

  switch (type) {
    case 'shake': {
      // Rapid rattle clicks using a band-pass filtered noise
      const bufferSize = audioCtx.sampleRate * 0.08;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.08);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.08 * intensity, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start(now);
      break;
    }
    case 'collision': {
      // High-quality wood/felt clack synth
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(250 + Math.random() * 80, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);
      
      gain.gain.setValueAtTime(0.3 * intensity, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
      break;
    }
    case 'lock': {
      // Digital retro click
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.setValueAtTime(1800, now + 0.015);
      
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
      break;
    }
    case 'score': {
      // Joyous chimes (arpeggio)
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const time = now + idx * 0.06;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        
        gain.gain.setValueAtTime(0.0, time);
        gain.gain.linearRampToValueAtTime(0.12, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + 0.25);
      });
      break;
    }
    case 'yacht': {
      // Epic winning retro fanfare
      const melody = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50, 1318.51];
      const durations = [0.1, 0.1, 0.1, 0.15, 0.1, 0.1, 0.45];
      let accumTime = now;
      melody.forEach((freq, idx) => {
        const dur = durations[idx];
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, accumTime);
        
        gain.gain.setValueAtTime(0.0, accumTime);
        gain.gain.linearRampToValueAtTime(0.18, accumTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, accumTime + dur);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(accumTime);
        osc.stop(accumTime + dur);
        accumTime += dur * 0.8;
      });
      break;
    }
  }
}

// ==========================================================================
// 3. PROCEDURAL TEXTURES DRAWER
// ==========================================================================

/**
 * Renders a high-res 2D canvas corresponding to a dice face,
 * and creates a THREE.CanvasTexture from it.
 */
function createDiceFaceTexture(number, theme) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Helper for rounded rectangles
  const drawRoundedRect = (c, x, y, w, h, r) => {
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
  };

  // 1. Draw Background based on Theme
  ctx.clearRect(0, 0, size, size);
  
  if (theme === 'cyber') {
    // Cyber Neon Theme: Semi-translucent dark grey with cyan/magenta glow borders
    ctx.fillStyle = '#0f172a';
    drawRoundedRect(ctx, 4, 4, size - 8, size - 8, 48);
    ctx.fill();
    
    // Draw neon outline glow border
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#c084fc'; // purple border
    drawRoundedRect(ctx, 12, 12, size - 24, size - 24, 40);
    ctx.stroke();
    
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#22d3ee'; // cyan thin line
    drawRoundedRect(ctx, 18, 18, size - 36, size - 36, 36);
    ctx.stroke();
  } 
  else if (theme === 'gold') {
    // Luxury Gold Theme: Polished gold metallic gradient
    const grad = ctx.createRadialGradient(size/2, size/2, 20, size/2, size/2, size * 0.7);
    grad.addColorStop(0, '#ffe066');
    grad.addColorStop(0.5, '#fbbf24');
    grad.addColorStop(1, '#b45309');
    ctx.fillStyle = grad;
    drawRoundedRect(ctx, 4, 4, size - 8, size - 8, 48);
    ctx.fill();

    // Bevel borders
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#f59e0b';
    drawRoundedRect(ctx, 12, 12, size - 24, size - 24, 40);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fffbeb';
    drawRoundedRect(ctx, 16, 16, size - 32, size - 32, 36);
    ctx.stroke();
  } 
  else {
    // Classic Ivory Theme: Smooth slightly warm white
    ctx.fillStyle = '#f8fafc';
    drawRoundedRect(ctx, 4, 4, size - 8, size - 8, 48);
    ctx.fill();
    
    // Subtle inner shadow border
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#e2e8f0';
    drawRoundedRect(ctx, 10, 10, size - 20, size - 20, 40);
    ctx.stroke();
  }

  // 2. Draw Pips (Dots)
  let pipColor = '#1e293b'; // dark blue/grey for classic
  if (theme === 'cyber') pipColor = '#22d3ee'; // neon cyan
  if (theme === 'gold') pipColor = '#b91c1c'; // ruby red

  if (theme === 'classic' && number === 1) {
    pipColor = '#ef4444'; // Large red center dot for classic 1
  }

  ctx.fillStyle = pipColor;

  // Add subtle shadow glow for cyber dots
  if (theme === 'cyber') {
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 12;
  }

  const r = size * 0.09; // Pip radius
  const cx = size / 2;
  const cy = size / 2;
  const p1 = size * 0.28;
  const p2 = size * 0.72;

  const drawPip = (x, y) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };

  switch (number) {
    case 1:
      drawPip(cx, cy);
      break;
    case 2:
      drawPip(p1, p1);
      drawPip(p2, p2);
      break;
    case 3:
      drawPip(p1, p1);
      drawPip(cx, cy);
      drawPip(p2, p2);
      break;
    case 4:
      drawPip(p1, p1);
      drawPip(p1, p2);
      drawPip(p2, p1);
      drawPip(p2, p2);
      break;
    case 5:
      drawPip(p1, p1);
      drawPip(p1, p2);
      drawPip(cx, cy);
      drawPip(p2, p1);
      drawPip(p2, p2);
      break;
    case 6:
      drawPip(p1, p1);
      drawPip(p1, cy);
      drawPip(p1, p2);
      drawPip(p2, p1);
      drawPip(p2, cy);
      drawPip(p2, p2);
      break;
  }

  // Reset shadow for subsequent drawings
  ctx.shadowBlur = 0;

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Creates standard 6-sided materials array for BoxGeometry
 */
function createDiceMaterials(theme) {
  // Dice Face orientation maps to material indices:
  // indices: 0 = +X, 1 = -X, 2 = +Y, 3 = -Y, 4 = +Z, 5 = -Z
  // Let's standardise values mapping to faces:
  // Face 1 = +Y, Face 6 = -Y
  // Face 3 = +X, Face 4 = -X
  // Face 2 = +Z, Face 5 = -Z
  const faceValues = [3, 4, 1, 6, 2, 5];
  
  let roughness = 0.15;
  let metalness = 0.1;
  if (theme === 'cyber') {
    roughness = 0.25;
    metalness = 0.5;
  } else if (theme === 'gold') {
    roughness = 0.08;
    metalness = 0.9;
  }

  return faceValues.map(val => {
    const tex = createDiceFaceTexture(val, theme);
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: roughness,
      metalness: metalness,
      bumpScale: 0.05
    });
  });
}

// ==========================================================================
// 4. 3D WEBGL GRAPHICS SETUP (THREE.JS)
// ==========================================================================

function init3D() {
  const container = document.getElementById('three-canvas-container');
  const w = container.clientWidth;
  const h = container.clientHeight;

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#0b0f19');
  scene.fog = new THREE.FogExp2('#0b0f19', 0.03);

  // Camera
  camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
  camera.position.set(0, 11, 8); // looking down at angle

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  // Clear any existing children and append new canvas
  const loading = document.getElementById('loading-overlay');
  if (loading) loading.style.display = 'none';
  
  const oldCanvas = container.querySelector('canvas');
  if (oldCanvas) container.removeChild(oldCanvas);
  container.appendChild(renderer.domElement);

  // Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.08; // don't go below floor
  controls.minDistance = 6;
  controls.maxDistance = 20;
  controls.enablePan = false; // keep centered on tray

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 0.85);
  mainLight.position.set(5, 15, 5);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 1024;
  mainLight.shadow.mapSize.height = 1024;
  mainLight.shadow.bias = -0.0008;
  mainLight.shadow.camera.near = 0.5;
  mainLight.shadow.camera.far = 25;
  mainLight.shadow.camera.left = -5;
  mainLight.shadow.camera.right = 5;
  mainLight.shadow.camera.top = 5;
  mainLight.shadow.camera.bottom = -5;
  scene.add(mainLight);

  // Subtle colored accent lights
  const purpleLight = new THREE.PointLight('#a855f7', 0.6, 12);
  purpleLight.position.set(-4, 3, -4);
  scene.add(purpleLight);

  const cyanLight = new THREE.PointLight('#22d3ee', 0.6, 12);
  cyanLight.position.set(4, 3, 4);
  scene.add(cyanLight);

  // Construct physics tray
  buildTray3D(GAME_STATE.selectedTheme);

  // Construct Keep Ledge indicators
  buildKeepShelf3D();

  // Create 5 Dice
  buildDice3D(GAME_STATE.selectedTheme);

  // Initialize interactive throw indicators
  createThrowIndicator();
  buildCup3D(GAME_STATE.selectedTheme);

  // Listeners
  window.addEventListener('resize', onWindowResize);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  renderer.domElement.addEventListener('pointerleave', () => {
    pointerDownScreen = null;
    isDraggingThrow = false;
    if (throwIndicatorLine) throwIndicatorLine.visible = false;
    if (controls) controls.enabled = true;
  });
}

function updateTrayTheme(theme) {
  GAME_STATE.selectedTheme = theme;
  
  if (!trayFloor) return;
  
  // Re-texture Floor
  let floorColor = '#064e3b'; // classic felt green
  let floorRoughness = 0.8;
  if (theme === 'cyber') {
    floorColor = '#090d16'; // sleek cyber blue-black
    floorRoughness = 0.4;
  } else if (theme === 'gold') {
    floorColor = '#171717'; // rich black velvet
    floorRoughness = 0.6;
  }
  
  trayFloor.material.color.set(floorColor);
  trayFloor.material.roughness = floorRoughness;

  // Re-texture Walls
  let wallColor = '#3f220f'; // wood
  let wallMetal = 0.1;
  if (theme === 'cyber') {
    wallColor = '#1e1b4b'; // deep glowing violet
    wallMetal = 0.6;
  } else if (theme === 'gold') {
    wallColor = '#171717'; // black leather border
    wallMetal = 0.2;
  }

  trayWalls.forEach(wall => {
    wall.material.color.set(wallColor);
    wall.material.metalness = wallMetal;
  });

  // Re-texture Dice
  const newMats = createDiceMaterials(theme);
  diceMeshes.forEach(die => {
    die.mesh.material = newMats;
  });

  // Re-texture Cup
  buildCup3D(theme);
}

function buildTray3D(theme) {
  // Floor
  const floorGeo = new THREE.PlaneGeometry(8, 8);
  
  let floorColor = '#064e3b';
  let roughness = 0.8;
  if (theme === 'cyber') {
    floorColor = '#090d16';
    roughness = 0.4;
  } else if (theme === 'gold') {
    floorColor = '#171717';
    roughness = 0.6;
  }

  const floorMat = new THREE.MeshStandardMaterial({
    color: floorColor,
    roughness: roughness,
    metalness: 0.1
  });
  
  trayFloor = new THREE.Mesh(floorGeo, floorMat);
  trayFloor.rotation.x = -Math.PI / 2;
  trayFloor.receiveShadow = true;
  scene.add(trayFloor);

  // Border Walls
  const wallMat = new THREE.MeshStandardMaterial({
    color: '#3f220f',
    roughness: 0.5
  });

  const wallThickness = 0.4;
  const wallHeight = 1.0;
  
  const wallGeos = [
    new THREE.BoxGeometry(8 + wallThickness * 2, wallHeight, wallThickness), // north/south
    new THREE.BoxGeometry(wallThickness, wallHeight, 8) // east/west
  ];

  // Positions: top, bottom, left, right
  const wallsData = [
    { geo: wallGeos[0], x: 0, y: wallHeight/2, z: -4 - wallThickness/2 },
    { geo: wallGeos[0], x: 0, y: wallHeight/2, z: 4 + wallThickness/2 },
    { geo: wallGeos[1], x: -4 - wallThickness/2, y: wallHeight/2, z: 0 },
    { geo: wallGeos[1], x: 4 + wallThickness/2, y: wallHeight/2, z: 0 }
  ];

  trayWalls = [];
  wallsData.forEach(data => {
    const wall = new THREE.Mesh(data.geo, wallMat.clone());
    wall.position.set(data.x, data.y, data.z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);
    trayWalls.push(wall);
  });

  // Re-trigger color mapping to align with theme parameters cleanly
  updateTrayTheme(theme);
}

function buildKeepShelf3D() {
  // Render a visual partition/shelf where locked dice will align.
  // We can represent it as a glowing futuristic line or transparent plexiglass bar.
  const shelfGeo = new THREE.BoxGeometry(6, 0.05, 0.8);
  const shelfMat = new THREE.MeshStandardMaterial({
    color: '#1e293b',
    transparent: true,
    opacity: 0.35,
    roughness: 0.1,
    metalness: 0.8
  });
  const shelf = new THREE.Mesh(shelfGeo, shelfMat);
  shelf.position.set(0, keepShelf.y - 0.55, keepShelf.z);
  shelf.rotation.x = keepShelf.pitch;
  scene.add(shelf);

  // Add 5 glowing slot markers underneath
  const slotGeo = new THREE.PlaneGeometry(0.8, 0.8);
  const slotMat = new THREE.MeshBasicMaterial({
    color: '#a855f7',
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide
  });

  for (let i = 0; i < 5; i++) {
    const slot = new THREE.Mesh(slotGeo, slotMat);
    slot.position.set(keepShelf.xOffsets[i], keepShelf.y - 0.52, keepShelf.z);
    slot.rotation.x = -Math.PI / 2 + keepShelf.pitch;
    scene.add(slot);
  }
}

function buildDice3D(theme) {
  const diceGeo = new THREE.BoxGeometry(0.92, 0.92, 0.92); // slightly smaller than 1 unit
  const materials = createDiceMaterials(theme);

  // Clear existing dice meshes if any
  diceMeshes.forEach(d => scene.remove(d.mesh));
  diceMeshes = [];

  for (let i = 0; i < 5; i++) {
    const mesh = new THREE.Mesh(diceGeo, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // Initial position aligned in tray
    const startX = -2 + i * 1.0;
    mesh.position.set(startX, diceRadius, 0);

    const dieState = {
      index: i,
      mesh: mesh,
      pos: mesh.position,
      vel: new THREE.Vector3(0, 0, 0),
      angVel: new THREE.Vector3(0, 0, 0),
      quat: mesh.quaternion,
      
      // Animation tracking (tray <-> keep shelf)
      animating: false,
      animProgress: 0,
      animStartPos: new THREE.Vector3(),
      animStartQuat: new THREE.Quaternion(),
      animEndPos: new THREE.Vector3(),
      animEndQuat: new THREE.Quaternion(),
      
      // Physics settle status
      settled: true,
      settleTimer: 0,
      targetQuaternion: null
    };

    diceMeshes.push(dieState);
  }
}

function onWindowResize() {
  if (!renderer || !camera) return;
  const container = document.getElementById('three-canvas-container');
  if (!container) return;
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

// ==========================================================================
// 5. 3D INTERACTION & LOCKING MECHANICS (RAYCASTING)
// ==========================================================================

function buildCup3D(theme) {
  if (cupGroup) scene.remove(cupGroup);
  
  cupGroup = new THREE.Group();
  
  // Outer cylinder
  const outerGeo = new THREE.CylinderGeometry(0.8, 0.65, 1.8, 20, 1, true);
  let outerColor = '#45220f'; // leather brown
  let metalness = 0.1;
  let roughness = 0.6;
  
  if (theme === 'cyber') {
    outerColor = '#1e1b4b'; // deep glowing violet
    metalness = 0.7;
    roughness = 0.2;
  } else if (theme === 'gold') {
    outerColor = '#d97706'; // gold
    metalness = 0.9;
    roughness = 0.1;
  }
  
  const outerMat = new THREE.MeshStandardMaterial({
    color: outerColor,
    metalness: metalness,
    roughness: roughness,
    side: THREE.DoubleSide
  });
  const outerMesh = new THREE.Mesh(outerGeo, outerMat);
  outerMesh.castShadow = true;
  outerMesh.receiveShadow = true;
  cupGroup.add(outerMesh);
  
  // Inner cylinder (lining)
  const innerGeo = new THREE.CylinderGeometry(0.76, 0.61, 1.76, 20, 1, true);
  let innerColor = '#991b1b'; // red velvet
  if (theme === 'cyber') innerColor = '#ec4899'; // pink
  if (theme === 'gold') innerColor = '#7f1d1d'; // dark ruby
  const innerMat = new THREE.MeshStandardMaterial({
    color: innerColor,
    roughness: 0.8,
    side: THREE.DoubleSide
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  cupGroup.add(innerMesh);
  
  // Cup bottom cap
  const bottomGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.08, 20);
  const bottomMesh = new THREE.Mesh(bottomGeo, outerMat);
  bottomMesh.position.y = -0.9;
  bottomMesh.castShadow = true;
  cupGroup.add(bottomMesh);
  
  // Add design accents (neon rim / metallic rim)
  if (theme === 'cyber') {
    const rimGeo = new THREE.RingGeometry(0.76, 0.8, 20);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.95;
    cupGroup.add(rim);
  } else if (theme === 'gold') {
    const rimGeo = new THREE.RingGeometry(0.76, 0.8, 20);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xfffbeb, metalness: 0.9, roughness: 0.1, side: THREE.DoubleSide });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.95;
    cupGroup.add(rim);
  }
  
  cupGroup.position.set(0, 5, -3);
  cupGroup.visible = false;
  scene.add(cupGroup);
}

function createThrowIndicator() {
  if (throwIndicatorLine) scene.remove(throwIndicatorLine);
  
  const material = new THREE.LineBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.85
  });
  
  const points = [new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0)];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  throwIndicatorLine = new THREE.Line(geometry, material);
  throwIndicatorLine.visible = false;
  scene.add(throwIndicatorLine);
}

function get3DPlaneIntersection(mouseVec) {
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -diceRadius);
  raycaster.setFromCamera(mouseVec, camera);
  const target = new THREE.Vector3();
  const intersect = raycaster.ray.intersectPlane(plane, target);
  return intersect ? target : null;
}

function onPointerDown(event) {
  // Prevent locking / throwing during active rolls
  if (!GAME_STATE.gameActive || GAME_STATE.rollsRemaining === 3 || isRollingAnimation) return;
  
  // Disable throwing if current turn is AI's
  const currentP = GAME_STATE.players[GAME_STATE.currentPlayerIndex];
  if (currentP && currentP.isAI) return;

  const rect = renderer.domElement.getBoundingClientRect();
  const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
  pointerDownScreen = new THREE.Vector2(event.clientX, event.clientY);
  const mouseCoords = new THREE.Vector2(mouseX, mouseY);
  
  // Get start coordinates projected on tray floor
  dragStart3D = get3DPlaneIntersection(mouseCoords);
  isDraggingThrow = false;
  
  // Raycast to check if clicking directly on a die
  raycaster.setFromCamera(mouseCoords, camera);
  const targets = diceMeshes.map(d => d.mesh);
  const intersects = raycaster.intersectObjects(targets);
  
  pointerDownScreen.clickedDieIndex = (intersects.length > 0)
    ? diceMeshes.find(d => d.mesh === intersects[0].object).index
    : -1;
}

function onPointerMove(event) {
  if (!pointerDownScreen) return;

  const rect = renderer.domElement.getBoundingClientRect();
  const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  const mouseCoords = new THREE.Vector2(mouseX, mouseY);

  const currentScreenPos = new THREE.Vector2(event.clientX, event.clientY);
  const dist = currentScreenPos.distanceTo(pointerDownScreen);

  // If dragged past 18px, switch from lock click to throw drag
  if (dist > 18 && !isDraggingThrow) {
    isDraggingThrow = true;
    if (controls) controls.enabled = false; // Disable orbit rotate
  }

  if (isDraggingThrow) {
    const dragCurrent3D = get3DPlaneIntersection(mouseCoords);
    if (dragStart3D && dragCurrent3D) {
      // Find average pos of active unlocked dice to draw throw path
      let activeCount = 0;
      const avgPos = new THREE.Vector3();
      diceMeshes.forEach((die, idx) => {
        if (!GAME_STATE.diceLocked[idx]) {
          avgPos.add(die.pos);
          activeCount++;
        }
      });
      
      if (activeCount > 0) {
        avgPos.divideScalar(activeCount);
      } else {
        avgPos.set(0, diceRadius, 0);
      }

      const dragDir = new THREE.Vector3().subVectors(dragCurrent3D, dragStart3D);
      const maxFlingLength = 6.0;
      if (dragDir.length() > maxFlingLength) {
        dragDir.normalize().multiplyScalar(maxFlingLength);
      }

      const endPos = new THREE.Vector3().addVectors(avgPos, dragDir);

      // Render indicator line
      const positions = throwIndicatorLine.geometry.attributes.position.array;
      positions[0] = avgPos.x;
      positions[1] = avgPos.y + 0.05;
      positions[2] = avgPos.z;
      positions[3] = endPos.x;
      positions[4] = endPos.y + 0.05;
      positions[5] = endPos.z;
      
      throwIndicatorLine.geometry.attributes.position.needsUpdate = true;
      
      // Paint color scale matching drag force (Green -> Red)
      const forceRatio = dragDir.length() / maxFlingLength;
      const color = new THREE.Color().setHSL(0.3 * (1.0 - forceRatio), 1.0, 0.5);
      throwIndicatorLine.material.color.copy(color);
      throwIndicatorLine.visible = true;
    }
  }
}

function onPointerUp(event) {
  if (!pointerDownScreen) return;

  const rect = renderer.domElement.getBoundingClientRect();
  const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  const mouseCoords = new THREE.Vector2(mouseX, mouseY);

  if (isDraggingThrow) {
    const dragCurrent3D = get3DPlaneIntersection(mouseCoords);
    if (dragStart3D && dragCurrent3D) {
      const throwVector = new THREE.Vector3().subVectors(dragCurrent3D, dragStart3D);
      const forceFactor = 3.6;
      const throwVel = throwVector.clone().multiplyScalar(forceFactor);

      // Verify minimum throw momentum
      if (throwVel.length() > 2.5) {
        rollDice3D(throwVel);
      }
    }
    if (controls) controls.enabled = true; // Restore orbit control
  } else {
    // Normal click - toggle locking clickraycast target
    const idx = pointerDownScreen.clickedDieIndex;
    if (idx !== -1) {
      toggleDiceLock(idx);
    }
  }

  pointerDownScreen = null;
  isDraggingThrow = false;
  if (throwIndicatorLine) throwIndicatorLine.visible = false;
}

// Particle spark emitter for collisions
function spawnSparks(position, count = 8, colorHex = '#22d3ee') {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const velocities = [];
  const colors = [];
  const lifeTimes = [];
  const baseColor = new THREE.Color(colorHex);

  for (let i = 0; i < count; i++) {
    positions.push(position.x, position.y, position.z);
    
    // Spawn directional random cone vectors
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.2 + Math.random() * 3.8;
    velocities.push(
      Math.cos(angle) * speed,
      1.5 + Math.random() * 3.5, // vertical blast bounce
      Math.sin(angle) * speed
    );
    
    colors.push(baseColor.r, baseColor.g, baseColor.b);
    lifeTimes.push(0.35 + Math.random() * 0.45);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.16,
    vertexColors: true,
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  collisionParticles.push({
    mesh: points,
    velocities: velocities,
    lifeTimes: lifeTimes,
    maxLifeTimes: [...lifeTimes]
  });
}

function updateParticles(dt) {
  for (let i = collisionParticles.length - 1; i >= 0; i--) {
    const p = collisionParticles[i];
    let allDead = true;
    const positions = p.mesh.geometry.attributes.position.array;
    const v = p.velocities;

    for (let j = 0; j < p.lifeTimes.length; j++) {
      if (p.lifeTimes[j] <= 0) continue;

      allDead = false;
      p.lifeTimes[j] -= dt;

      // Translate points along vectors
      positions[j*3] += v[j*3] * dt;
      positions[j*3+1] += v[j*3+1] * dt;
      positions[j*3+2] += v[j*3+2] * dt;

      // Apply downward gravity to sparks
      v[j*3+1] -= 9.8 * dt;
    }

    p.mesh.geometry.attributes.position.needsUpdate = true;

    // Fade opacity over average spark life
    const avgLife = p.lifeTimes.reduce((a, b) => a + b, 0) / p.lifeTimes.length;
    const maxLife = p.maxLifeTimes.reduce((a, b) => a + b, 0) / p.maxLifeTimes.length;
    p.mesh.material.opacity = Math.max(0, avgLife / maxLife);

    if (allDead || p.mesh.material.opacity <= 0) {
      scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
      collisionParticles.splice(i, 1);
    }
  }
}

function toggleDiceLock(index) {
  if (isRollingAnimation) return;
  
  const die = diceMeshes[index];
  const isCurrentlyLocked = GAME_STATE.diceLocked[index];
  const nextLockState = !isCurrentlyLocked;
  
  GAME_STATE.diceLocked[index] = nextLockState;
  playSound('lock');
  
  // Set up flying interpolation
  die.animating = true;
  die.animProgress = 0;
  die.animStartPos.copy(die.pos);
  die.animStartQuat.copy(die.quat);

  if (nextLockState) {
    // Fly to Keep Shelf
    die.animEndPos.set(keepShelf.xOffsets[index], keepShelf.y, keepShelf.z);
    
    // Rotate to make rolled value face front-up cleanly
    const targetQ = getQuaternionForValue(GAME_STATE.diceValues[index]);
    const cameraPitchQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), keepShelf.pitch);
    die.animEndQuat.copy(cameraPitchQ.multiply(targetQ));
    logConsole(`[System] 주사위 ${index+1}번 (${GAME_STATE.diceValues[index]}) 보관`, 'system-log');
  } else {
    // Return to tray floor
    die.animEndPos.set(-2 + index * 1.0, diceRadius, 1.5 + Math.random() * 0.5);
    
    // Smoothly restore default orientation
    die.animEndQuat.copy(getQuaternionForValue(GAME_STATE.diceValues[index]));
    logConsole(`[System] 주사위 ${index+1}번 보관 해제`, 'system-log');
  }

  update2DKeepSlots();
}

/**
 * Returns quaternion rotation that positions face value straight UP
 */
function getQuaternionForValue(val) {
  const q = new THREE.Quaternion();
  
  // Opposites: 1-6, 2-5, 3-4
  // We configured material indices to: +X=3, -X=4, +Y=1, -Y=6, +Z=2, -Z=5
  // Face points up:
  switch (val) {
    case 1: // +Y (already face up)
      q.setFromEuler(new THREE.Euler(0, 0, 0));
      break;
    case 6: // -Y (bottom) -> needs 180 flip
      q.setFromEuler(new THREE.Euler(Math.PI, 0, 0));
      break;
    case 2: // +Z (front) -> rotate back 90
      q.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
      break;
    case 5: // -Z (back) -> rotate forward 90
      q.setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
      break;
    case 3: // +X (right) -> rotate left 90
      q.setFromEuler(new THREE.Euler(0, 0, -Math.PI / 2));
      break;
    case 4: // -X (left) -> rotate right 90
      q.setFromEuler(new THREE.Euler(0, 0, Math.PI / 2));
      break;
  }
  return q;
}

// ==========================================================================
// 6. PHYSICS ROLLING ENGINE & ANIMATION LOOP
// ==========================================================================

function rollDice3D(customVelocity = null) {
  if (GAME_STATE.rollsRemaining <= 0 || isRollingAnimation) return;
  
  GAME_STATE.rollsRemaining--;
  document.getElementById('hud-rolls-left').innerText = GAME_STATE.rollsRemaining;
  document.getElementById('btn-roll-text').innerText = `주사위 굴리기 (${GAME_STATE.rollsRemaining}회 남음)`;
  
  if (GAME_STATE.rollsRemaining === 0) {
    document.getElementById('btn-roll-dice').disabled = true;
  }
  
  document.getElementById('btn-reset-roll').disabled = false;

  // 1. Generate target values for UNLOCKED dice
  const rolledVals = [];
  for (let i = 0; i < 5; i++) {
    if (!GAME_STATE.diceLocked[i]) {
      GAME_STATE.diceValues[i] = Math.floor(Math.random() * 6) + 1;
    }
    rolledVals.push(GAME_STATE.diceValues[i]);
  }

  logConsole(`[Roll] 주사위 결과: [${rolledVals.join(', ')}]`, 'roll-log');
  updateHUDStatus('주사위 굴리는 중...');

  // 2. Roll trigger
  if (customVelocity) {
    // Interactive direct swipe launch
    isRollingAnimation = true;
    GAME_STATE.dicePhysicsActive = true;
    
    diceMeshes.forEach((die, i) => {
      if (GAME_STATE.diceLocked[i]) return;
      die.animating = false;

      // Position clustered slightly around average drag start point
      let activeCount = 0;
      const avgStart = new THREE.Vector3();
      diceMeshes.forEach((d, idx) => {
        if (!GAME_STATE.diceLocked[idx]) {
          avgStart.add(d.pos);
          activeCount++;
        }
      });
      if (activeCount > 0) avgStart.divideScalar(activeCount);

      die.pos.copy(avgStart).add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.8,
        0.5 + Math.random() * 0.4,
        (Math.random() - 0.5) * 0.8
      ));

      // Throw vector with slight random dispersion
      die.vel.copy(customVelocity).add(new THREE.Vector3(
        (Math.random() - 0.5) * 2.0,
        1.5 + Math.random() * 2.0,
        (Math.random() - 0.5) * 2.0
      ));

      // High angular torque spin
      die.angVel.set(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25
      );

      die.settled = false;
      die.settleTimer = 0;
      
      const baseQuat = getQuaternionForValue(GAME_STATE.diceValues[i]);
      const randomYRot = (Math.floor(Math.random() * 4) * Math.PI) / 2 + (Math.random() - 0.5) * 0.3;
      const yRotationQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), randomYRot);
      die.targetQuaternion = yRotationQuat.multiply(baseQuat);
    });

    // Sound triggers
    playSound('shake', 1.0);
    setTimeout(() => playSound('shake', 0.8), 85);
    setTimeout(() => playSound('shake', 0.6), 170);
  } else {
    // Premium 3D Cup shake and pour animation
    startCupRollAnimation();
  }
}

function startCupRollAnimation() {
  isRollingAnimation = true;
  cupAnimation.active = true;
  cupAnimation.phase = 'descend';
  cupAnimation.timer = 0;
  cupAnimation.diceLaunched = false; // Robust launch flag

  if (cupGroup) {
    cupGroup.position.set(0, 6, -3.5);
    cupGroup.rotation.set(0, 0, 0); // upright facing
    cupGroup.visible = true;
  }

  // Hide active rolling dice inside cup initially
  diceMeshes.forEach((die, idx) => {
    if (!GAME_STATE.diceLocked[idx]) {
      die.mesh.visible = false;
    }
  });
}

function playCupShakeSounds() {
  if (cupAnimation.phase !== 'shake' || !cupAnimation.active) return;
  playSound('shake', 1.0);
  setTimeout(() => {
    if (cupAnimation.phase === 'shake' && cupAnimation.active) {
      playSound('shake', 0.85);
      setTimeout(() => {
        if (cupAnimation.phase === 'shake' && cupAnimation.active) {
          playSound('shake', 0.65);
        }
      }, 140);
    }
  }, 140);
}

function launchDiceFromCup() {
  GAME_STATE.dicePhysicsActive = true;

  diceMeshes.forEach((die, i) => {
    if (GAME_STATE.diceLocked[i]) return;

    die.mesh.visible = true;
    die.animating = false;

    // Place at cup mouth position
    die.pos.set(
      cupGroup.position.x + (Math.random() - 0.5) * 0.4,
      cupGroup.position.y + 0.1,
      cupGroup.position.z + 0.5 + (Math.random() - 0.5) * 0.4
    );

    // Blast forward & downward
    die.vel.set(
      (Math.random() - 0.5) * 5.0,
      -3.0 - Math.random() * 4.0,
      7.0 + Math.random() * 5.0
    );

    // Intense torque spin
    die.angVel.set(
      (Math.random() - 0.5) * 32, // More intense initial spin
      (Math.random() - 0.5) * 32,
      (Math.random() - 0.5) * 32
    );

    die.settled = false;
    die.settleTimer = 0;

    const baseQuat = getQuaternionForValue(GAME_STATE.diceValues[i]);
    const randomYRot = (Math.floor(Math.random() * 4) * Math.PI) / 2 + (Math.random() - 0.5) * 0.3;
    const yRotationQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), randomYRot);
    die.targetQuaternion = yRotationQuat.multiply(baseQuat);
  });
}

function updateCupAnimation(dt) {
  if (!cupAnimation.active || !cupGroup) return;

  cupAnimation.timer += dt;
  const t = cupAnimation.timer;

  if (cupAnimation.phase === 'descend') {
    const dur = 0.28;
    const ratio = Math.min(1.0, t / dur);
    cupGroup.position.y = 6 - (6 - 2.5) * easeOutCubic(ratio);
    cupGroup.position.z = -3.5 + (3.5 - 2.5) * easeOutCubic(ratio);

    if (t >= dur) {
      cupAnimation.phase = 'shake';
      cupAnimation.timer = 0;
      playCupShakeSounds();
    }
  } 
  else if (cupAnimation.phase === 'shake') {
    const dur = 0.65;
    const ratio = Math.min(1.0, t / dur);
    const speed = 60;
    
    // Rapid vibration displacements
    cupGroup.position.x = Math.sin(t * speed) * 0.16;
    cupGroup.position.z = -2.5 + Math.cos(t * speed * 0.85) * 0.16;
    cupGroup.rotation.z = Math.sin(t * speed * 1.1) * 0.09;
    cupGroup.rotation.x = Math.cos(t * speed * 0.9) * 0.09;

    if (t >= dur) {
      cupAnimation.phase = 'pour';
      cupAnimation.timer = 0;
    }
  } 
  else if (cupAnimation.phase === 'pour') {
    const dur = 0.25;
    const ratio = Math.min(1.0, t / dur);

    cupGroup.rotation.x = (Math.PI / 1.6) * easeOutCubic(ratio);
    cupGroup.position.y = 2.5 - 1.2 * easeOutCubic(ratio);
    cupGroup.position.z = -2.5 + 1.8 * easeOutCubic(ratio);

    // Launch dice robustly exactly once at start of pour phase
    if (!cupAnimation.diceLaunched) {
      launchDiceFromCup();
      cupAnimation.diceLaunched = true;
    }

    if (t >= dur) {
      cupAnimation.phase = 'exit';
      cupAnimation.timer = 0;
    }
  } 
  else if (cupAnimation.phase === 'exit') {
    const dur = 0.3;
    const ratio = Math.min(1.0, t / dur);

    cupGroup.rotation.x = (Math.PI / 1.6) * (1.0 - ratio);
    cupGroup.position.y = 1.3 + (6.0 - 1.3) * easeOutCubic(ratio);
    cupGroup.position.z = -0.7 - (3.5 - 0.7) * easeOutCubic(ratio);

    if (t >= dur) {
      cupGroup.visible = false;
      cupAnimation.active = false;
      cupAnimation.phase = 'idle';
    }
  }
}

function updatePhysics(dt) {
  if (!GAME_STATE.dicePhysicsActive || cupAnimation.active) return;

  let allSettled = true;

  for (let i = 0; i < 5; i++) {
    const die = diceMeshes[i];
    if (GAME_STATE.diceLocked[i]) continue;

    // Check if slerp-settled already
    if (die.settled) continue;

    allSettled = false;

    // Apply linear gravity
    die.vel.y += physicsWorld.gravity * dt;

    // Update positions
    die.pos.addScaledVector(die.vel, dt);

    // Update rotations via global angular velocities
    const deltaRotation = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        die.angVel.x * dt,
        die.angVel.y * dt,
        die.angVel.z * dt
      )
    );
    die.quat.premultiply(deltaRotation);

    // Bounces friction deceleration
    die.vel.multiplyScalar(physicsWorld.friction);
    die.angVel.multiplyScalar(physicsWorld.angFriction);

    // --- Boundary tray collisions ---
    // Floor
    if (die.pos.y < physicsWorld.floorY) {
      die.pos.y = physicsWorld.floorY;
      
      const vNormal = die.vel.y;
      if (vNormal < -0.15) {
        die.vel.y = -die.vel.y * physicsWorld.bounciness;
        
        // Add random floor bounce torque for realistic tumbling
        die.angVel.x += (Math.random() - 0.5) * 14;
        die.angVel.z += (Math.random() - 0.5) * 14;
        die.angVel.y += (Math.random() - 0.5) * 8;

        // Wood sound pitched by impact speed
        const volumeScale = Math.abs(vNormal) / 8;
        playSound('collision', volumeScale);
        
        // Spawn sparks on heavy floor landing
        if (Math.abs(vNormal) > 1.8) {
          const sparkColor = GAME_STATE.selectedTheme === 'cyber' ? '#c084fc' : (GAME_STATE.selectedTheme === 'gold' ? '#fbbf24' : '#e2e8f0');
          spawnSparks(new THREE.Vector3(die.pos.x, die.pos.y - 0.4, die.pos.z), 5, sparkColor);
        }
      } else {
        die.vel.y = 0;
      }
    }

    // Induce rolling rotation on the floor via contact friction torque
    if (die.pos.y <= physicsWorld.floorY + 0.05) {
      const R = diceRadius;
      // Relative sliding velocity at contact point
      const vContactX = die.vel.x + die.angVel.z * R;
      const vContactZ = die.vel.z - die.angVel.x * R;
      
      // Torque adds angular momentum matching rolling velocity
      const torqueFactor = 12.0;
      die.angVel.x += vContactZ * torqueFactor * dt;
      die.angVel.z -= vContactX * torqueFactor * dt;
      
      // Twist friction on Y axis
      die.angVel.y *= 0.94;
      
      // Linear deceleration from sliding friction
      die.vel.x -= vContactX * 2.8 * dt;
      die.vel.z -= vContactZ * 2.8 * dt;
    }

    // Walls (X boundary)
    if (die.pos.x < -physicsWorld.xLimit) {
      die.pos.x = -physicsWorld.xLimit;
      const vNormal = die.vel.x;
      die.vel.x = -die.vel.x * physicsWorld.bounciness;
      
      // Corner bounce torque
      die.angVel.y += (Math.random() - 0.5) * 16;
      die.angVel.z += (Math.random() - 0.5) * 16;

      playSound('collision', Math.abs(vNormal) / 8);
      if (Math.abs(vNormal) > 1.2) {
        const sparkColor = GAME_STATE.selectedTheme === 'cyber' ? '#22d3ee' : (GAME_STATE.selectedTheme === 'gold' ? '#fbbf24' : '#ef4444');
        spawnSparks(new THREE.Vector3(die.pos.x + 0.46, die.pos.y, die.pos.z), 6, sparkColor);
      }
    } else if (die.pos.x > physicsWorld.xLimit) {
      die.pos.x = physicsWorld.xLimit;
      const vNormal = die.vel.x;
      die.vel.x = -die.vel.x * physicsWorld.bounciness;

      // Corner bounce torque
      die.angVel.y += (Math.random() - 0.5) * 16;
      die.angVel.z += (Math.random() - 0.5) * 16;

      playSound('collision', Math.abs(vNormal) / 8);
      if (Math.abs(vNormal) > 1.2) {
        const sparkColor = GAME_STATE.selectedTheme === 'cyber' ? '#22d3ee' : (GAME_STATE.selectedTheme === 'gold' ? '#fbbf24' : '#ef4444');
        spawnSparks(new THREE.Vector3(die.pos.x - 0.46, die.pos.y, die.pos.z), 6, sparkColor);
      }
    }

    // Walls (Z boundary)
    if (die.pos.z < -physicsWorld.zLimit) {
      die.pos.z = -physicsWorld.zLimit;
      const vNormal = die.vel.z;
      die.vel.z = -die.vel.z * physicsWorld.bounciness;

      // Corner bounce torque
      die.angVel.x += (Math.random() - 0.5) * 16;
      die.angVel.y += (Math.random() - 0.5) * 16;

      playSound('collision', Math.abs(vNormal) / 8);
      if (Math.abs(vNormal) > 1.2) {
        const sparkColor = GAME_STATE.selectedTheme === 'cyber' ? '#22d3ee' : (GAME_STATE.selectedTheme === 'gold' ? '#fbbf24' : '#ef4444');
        spawnSparks(new THREE.Vector3(die.pos.x, die.pos.y, die.pos.z + 0.46), 6, sparkColor);
      }
    } else if (die.pos.z > physicsWorld.zLimit) {
      die.pos.z = physicsWorld.zLimit;
      const vNormal = die.vel.z;
      die.vel.z = -die.vel.z * physicsWorld.bounciness;

      // Corner bounce torque
      die.angVel.x += (Math.random() - 0.5) * 16;
      die.angVel.y += (Math.random() - 0.5) * 16;

      playSound('collision', Math.abs(vNormal) / 8);
      if (Math.abs(vNormal) > 1.2) {
        const sparkColor = GAME_STATE.selectedTheme === 'cyber' ? '#22d3ee' : (GAME_STATE.selectedTheme === 'gold' ? '#fbbf24' : '#ef4444');
        spawnSparks(new THREE.Vector3(die.pos.x, die.pos.y, die.pos.z - 0.46), 6, sparkColor);
      }
    }

    // --- Die-to-Die Elastic Collisions ---
    for (let j = i + 1; j < 5; j++) {
      const other = diceMeshes[j];
      if (GAME_STATE.diceLocked[j]) continue;

      const diff = new THREE.Vector3().subVectors(die.pos, other.pos);
      const dist = diff.length();
      const minDistance = 1.05; // avoid deep overlap

      if (dist < minDistance) {
        const overlap = minDistance - dist;
        const normal = diff.clone().normalize();
        
        die.pos.addScaledVector(normal, overlap * 0.5);
        other.pos.addScaledVector(normal, -overlap * 0.5);

        const relativeVel = new THREE.Vector3().subVectors(die.vel, other.vel);
        const velAlongNormal = relativeVel.dot(normal);

        if (velAlongNormal < 0) {
          const impulseScalar = -(1 + physicsWorld.bounciness) * velAlongNormal / 2;
          die.vel.addScaledVector(normal, impulseScalar);
          other.vel.addScaledVector(normal, -impulseScalar);

          // Transfer angular momentum + add small random corner bounce torque
          const tempW = die.angVel.clone();
          die.angVel.copy(other.angVel).multiplyScalar(0.7).add(new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8
          ));
          other.angVel.copy(tempW).multiplyScalar(0.7).add(new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8
          ));

          const volumeScale = Math.abs(velAlongNormal) / 6;
          playSound('collision', volumeScale);

          // Spawn collision sparks between dice
          if (Math.abs(velAlongNormal) > 1.2) {
            const midPoint = new THREE.Vector3().addVectors(die.pos, other.pos).multiplyScalar(0.5);
            const sparkColor = GAME_STATE.selectedTheme === 'cyber' ? '#22d3ee' : (GAME_STATE.selectedTheme === 'gold' ? '#fbbf24' : '#cbd5e1');
            spawnSparks(midPoint, 6, sparkColor);
          }
        }
      }
    }

    // --- Settle Slerp Alignment logic ---
    const linearSpeed = die.vel.length();
    const angularSpeed = die.angVel.length();

    if (linearSpeed < 0.12 && angularSpeed < 0.12 && die.pos.y <= physicsWorld.floorY + 0.15) {
      die.settleTimer += dt;
      if (die.settleTimer > 0.3) {
        die.vel.set(0, 0, 0);
        die.angVel.set(0, 0, 0);
        die.pos.y = diceRadius;

        die.quat.slerp(die.targetQuaternion, 0.22);
        
        if (die.quat.angleTo(die.targetQuaternion) < 0.01) {
          die.quat.copy(die.targetQuaternion);
          die.settled = true;
        }
      }
    } else {
      die.settleTimer = 0;
    }
  }

  // Once all settled, display scores and unlock controls
  if (allSettled) {
    GAME_STATE.dicePhysicsActive = false;
    isRollingAnimation = false;
    
    calculateScorecardPreviews();
    
    // If current player is AI, trigger next AI action!
    const currentPlayer = GAME_STATE.players[GAME_STATE.currentPlayerIndex];
    if (currentPlayer && currentPlayer.isAI && GAME_STATE.gameActive) {
      updateHUDStatus(`${currentPlayer.name} 킵 선택 중...`);
      setTimeout(runAITurn, 800);
    } else {
      updateHUDStatus('득점할 카테고리를 선택하세요');
    }
  }
}

function updateDiceAnimations(dt) {
  // Update flying animation of dice between tray <-> keep shelf
  diceMeshes.forEach(die => {
    if (!die.animating) return;

    die.animProgress += dt * 3.8; // completions in ~260ms
    if (die.animProgress >= 1.0) {
      die.animProgress = 1.0;
      die.animating = false;
      die.pos.copy(die.animEndPos);
      die.quat.copy(die.animEndQuat);
    } else {
      const t = easeOutCubic(die.animProgress);
      die.pos.lerpVectors(die.animStartPos, die.animEndPos, t);
      THREE.Quaternion.slerp(die.animStartQuat, die.animEndQuat, die.quat, t);
    }
  });
}

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}

// Core Loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.1); // clamp high dt glitches

  // Physics update
  updatePhysics(dt);

  // Flight transitions
  updateDiceAnimations(dt);

  // Update 3D Cup shaker animation timeline
  updateCupAnimation(dt);

  // Update particle sparks system
  updateParticles(dt);

  // Controls damping
  if (controls) controls.update();

  // Render Scene
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

// ==========================================================================
// 7. YACHT DICE SCORING RULES
// ==========================================================================

function getCategoryPotentialScore(catId, dice) {
  const counts = Array(7).fill(0);
  let sumAll = 0;
  dice.forEach(v => {
    counts[v]++;
    sumAll += v;
  });

  switch (catId) {
    case 'aces': return counts[1] * 1;
    case 'deuces': return counts[2] * 2;
    case 'threes': return counts[3] * 3;
    case 'fours': return counts[4] * 4;
    case 'fives': return counts[5] * 5;
    case 'sixes': return counts[6] * 6;
    case 'choice': return sumAll;
    
    case 'four_of_a_kind': {
      // 4 matching dice, score = sum of all 5 dice
      const has4 = counts.some(c => c >= 4);
      return has4 ? sumAll : 0;
    }
    case 'full_house': {
      // 3 of one, 2 of another (or 5 of same)
      let has3 = false;
      let has2 = false;
      let has5 = false;
      for (let i = 1; i <= 6; i++) {
        if (counts[i] === 3) has3 = true;
        if (counts[i] === 2) has2 = true;
        if (counts[i] === 5) has5 = true;
      }
      return (has3 && has2) || has5 ? sumAll : 0;
    }
    case 'little_straight': {
      // 4 consecutive: 1234, 2345, 3456
      const hasS1 = counts[1] >= 1 && counts[2] >= 1 && counts[3] >= 1 && counts[4] >= 1;
      const hasS2 = counts[2] >= 1 && counts[3] >= 1 && counts[4] >= 1 && counts[5] >= 1;
      const hasS3 = counts[3] >= 1 && counts[4] >= 1 && counts[5] >= 1 && counts[6] >= 1;
      return hasS1 || hasS2 || hasS3 ? 15 : 0;
    }
    case 'big_straight': {
      // 5 consecutive: 12345, 23456
      const hasL1 = counts[1] >= 1 && counts[2] >= 1 && counts[3] >= 1 && counts[4] >= 1 && counts[5] >= 1;
      const hasL2 = counts[2] >= 1 && counts[3] >= 1 && counts[4] >= 1 && counts[5] >= 1 && counts[6] >= 1;
      return hasL1 || hasL2 ? 30 : 0;
    }
    case 'yacht': {
      // All 5 match
      const has5 = counts.some(c => c === 5);
      return has5 ? 50 : 0;
    }
    default:
      return 0;
  }
}

// ==========================================================================
// 8. SCOREBOARD & GAME FLOW CONTROLLERS
// ==========================================================================

function calculateScorecardPreviews() {
  const pIdx = GAME_STATE.currentPlayerIndex;
  const pScores = GAME_STATE.players[pIdx].scores;
  
  CATEGORIES.forEach(cat => {
    if (cat.calc === false) return; // skip subtotal, bonus, total

    const cell = document.getElementById(`score-cell-${pIdx}-${cat.id}`);
    if (!cell) return;

    if (pScores[cat.id] === null) {
      const points = getCategoryPotentialScore(cat.id, GAME_STATE.diceValues);
      cell.innerText = points;
      cell.classList.add('previewable');
    }
  });
}

function clearScorecardPreviews() {
  const pIdx = GAME_STATE.currentPlayerIndex;
  CATEGORIES.forEach(cat => {
    if (cat.calc === false) return;
    const cell = document.getElementById(`score-cell-${pIdx}-${cat.id}`);
    if (cell && cell.classList.contains('previewable')) {
      cell.innerText = '';
      cell.classList.remove('previewable');
    }
  });
}

function handleCategorySelect(catId) {
  if (isRollingAnimation || GAME_STATE.rollsRemaining === 3) return;

  const pIdx = GAME_STATE.currentPlayerIndex;
  const player = GAME_STATE.players[pIdx];
  
  // Double safety check
  if (player.scores[catId] !== null) return;

  const points = getCategoryPotentialScore(catId, GAME_STATE.diceValues);
  player.scores[catId] = points;

  // Play Sound
  if (catId === 'yacht' && points === 50) {
    playSound('yacht');
    logConsole(`🎉 [YACHT] ${player.name}님이 야추(50점)를 달성했습니다!`, 'score-log');
  } else {
    playSound('score');
  }

  // Visual Update
  const cell = document.getElementById(`score-cell-${pIdx}-${catId}`);
  cell.innerText = points;
  cell.classList.remove('previewable');
  cell.classList.add('filled');

  logConsole(`[Score] ${player.name}님이 ${CATEGORIES.find(c => c.id === catId).name}에 ${points}점을 기록했습니다.`, 'score-log');

  // Recalculate Subtotal, Bonus, Total
  updatePlayerSummaryScores(pIdx);

  // Advanced Turn
  advanceTurn();
}

function updatePlayerSummaryScores(pIdx) {
  const player = GAME_STATE.players[pIdx];
  const scores = player.scores;

  // Aces to Sixes
  let subtotal = 0;
  const onesToSixes = ['aces', 'deuces', 'threes', 'fours', 'fives', 'sixes'];
  onesToSixes.forEach(key => {
    if (scores[key] !== null) subtotal += scores[key];
  });

  scores.subtotal = subtotal;
  document.getElementById(`score-cell-${pIdx}-subtotal`).innerText = `${subtotal} / 63`;

  // Bonus Check (>= 63)
  if (subtotal >= 63) {
    scores.bonus = 35;
    const cellBonus = document.getElementById(`score-cell-${pIdx}-bonus`);
    cellBonus.innerText = '+35';
    cellBonus.classList.add('filled');
  } else {
    scores.bonus = 0;
    document.getElementById(`score-cell-${pIdx}-bonus`).innerText = '0';
  }

  // Total Score
  let total = subtotal + scores.bonus;
  const extras = ['choice', 'four_of_a_kind', 'full_house', 'little_straight', 'big_straight', 'yacht'];
  extras.forEach(key => {
    if (scores[key] !== null) total += scores[key];
  });

  scores.total = total;
  document.getElementById(`score-cell-${pIdx}-total`).innerText = total;
}

function advanceTurn() {
  clearScorecardPreviews();
  
  // Unlock all dice and fly them back to tray floor
  GAME_STATE.diceLocked = [false, false, false, false, false];
  diceMeshes.forEach((die, index) => {
    die.animating = true;
    die.animProgress = 0;
    die.animStartPos.copy(die.pos);
    die.animStartQuat.copy(die.quat);
    die.animEndPos.set(-2 + index * 1.0, diceRadius, 1.5 + Math.random() * 0.5);
    die.animEndQuat.copy(getQuaternionForValue(GAME_STATE.diceValues[index]));
  });
  update2DKeepSlots();

  // Reset roll counts
  GAME_STATE.rollsRemaining = 3;
  document.getElementById('hud-rolls-left').innerText = GAME_STATE.rollsRemaining;
  document.getElementById('btn-roll-text').innerText = `주사위 굴리기 (3회 남음)`;
  document.getElementById('btn-roll-dice').disabled = false;
  document.getElementById('btn-reset-roll').disabled = true;

  // Move player index
  GAME_STATE.currentPlayerIndex++;
  if (GAME_STATE.currentPlayerIndex >= GAME_STATE.players.length) {
    GAME_STATE.currentPlayerIndex = 0;
    GAME_STATE.currentRound++;
  }

  // Save progress locally
  saveGameToLocalStorage();

  // End Game Check
  if (GAME_STATE.currentRound > 12) {
    endGame();
    return;
  }

  // Update HUD
  document.getElementById('hud-current-round').innerText = `${GAME_STATE.currentRound} / 12`;
  updateHUDStatus('주사위를 굴려주세요');
  highlightActivePlayerColumn();

  // If the next player is AI, trigger AI turn!
  if (GAME_STATE.players[GAME_STATE.currentPlayerIndex].isAI) {
    runAITurn();
  }
}

function highlightActivePlayerColumn() {
  const pIdx = GAME_STATE.currentPlayerIndex;
  document.getElementById('hud-current-player').innerText = GAME_STATE.players[pIdx].name;

  // Highlight active table headers
  const headerCols = document.querySelectorAll('#score-table-header-row th');
  headerCols.forEach((th, idx) => {
    if (idx === pIdx + 1) {
      th.classList.add('active-player-col');
    } else {
      th.classList.remove('active-player-col');
    }
  });

  // Highlight cells
  for (let p = 0; p < GAME_STATE.players.length; p++) {
    CATEGORIES.forEach(cat => {
      const cell = document.getElementById(`score-cell-${p}-${cat.id}`);
      if (cell) {
        if (p === pIdx) {
          cell.classList.add('active-player-col');
        } else {
          cell.classList.remove('active-player-col');
        }
      }
    });
  }
}

function endGame() {
  GAME_STATE.gameActive = false;
  
  // Sort players by total score to calculate ranking list
  const ranking = [...GAME_STATE.players].sort((a, b) => b.scores.total - a.scores.total);
  
  const container = document.getElementById('victory-ranking-container');
  container.innerHTML = '';

  ranking.forEach((player, rankIdx) => {
    const row = document.createElement('div');
    row.className = `ranking-row rank-${rankIdx <= 2 ? rankIdx + 1 : 'other'}`;
    
    let medal = `${rankIdx + 1}등`;
    if (rankIdx === 0) medal = '🥇';
    if (rankIdx === 1) medal = '🥈';
    if (rankIdx === 2) medal = '🥉';

    row.innerHTML = `
      <span class="rank-badge">${medal}</span>
      <span class="rank-player-name">${player.name}</span>
      <span class="rank-player-score">${player.scores.total}점</span>
    `;
    container.appendChild(row);
  });

  // Open modal overlay
  document.getElementById('victory-modal').classList.add('active');
  logConsole('🏆 게임이 모두 끝났습니다! 최종 순위를 확인해보세요.', 'score-log');
  
  // Trigger visitor tracking count increment for complete matches
  incrementAppVisitorStats();

  // Clear LocalStorage autosave
  localStorage.removeItem('cineaho_yacht_autosave');
}

// ==========================================================================
// 9. LOCAL STORAGE PERSISTENCE & AUTOSAVE
// ==========================================================================

function saveGameToLocalStorage() {
  const dump = {
    players: GAME_STATE.players,
    currentPlayerIndex: GAME_STATE.currentPlayerIndex,
    currentRound: GAME_STATE.currentRound,
    rollsRemaining: GAME_STATE.rollsRemaining,
    diceValues: GAME_STATE.diceValues,
    diceLocked: GAME_STATE.diceLocked,
    selectedTheme: GAME_STATE.selectedTheme
  };
  localStorage.setItem('cineaho_yacht_autosave', JSON.stringify(dump));
}

function loadAutosaveGame() {
  const raw = localStorage.getItem('cineaho_yacht_autosave');
  if (!raw) return false;

  try {
    const data = JSON.parse(raw);
    GAME_STATE.players = data.players;
    GAME_STATE.currentPlayerIndex = data.currentPlayerIndex;
    GAME_STATE.currentRound = data.currentRound;
    GAME_STATE.rollsRemaining = data.rollsRemaining;
    GAME_STATE.diceValues = data.diceValues;
    GAME_STATE.diceLocked = data.diceLocked;
    GAME_STATE.selectedTheme = data.selectedTheme;

    // Apply values to 3D models
    diceMeshes.forEach((die, idx) => {
      die.pos.set(-2 + idx * 1.0, diceRadius, 0);
      die.quat.copy(getQuaternionForValue(GAME_STATE.diceValues[idx]));
    });

    logConsole('[System] 이전 기록 복구 완료!', 'system-log');
    return true;
  } catch (err) {
    console.error('Failed to parse autosave:', err);
    return false;
  }
}

// ==========================================================================
// 10. INTERFACE CONTROLS & EVENT LISTENERS
// ==========================================================================

function setupEventListeners() {
  // Pre-game setup adjustments
  const pInc = document.getElementById('btn-player-inc');
  const pDec = document.getElementById('btn-player-dec');
  const pCountDisp = document.getElementById('player-count-display');
  
  let tempCount = 2;

  // Game Mode Tabs listeners
  const tabVsAI = document.getElementById('tab-vs-ai');
  const tabLocalMulti = document.getElementById('tab-local-multi');
  const vsAiPanel = document.getElementById('vs-ai-config-container');
  const localMultiPanel = document.getElementById('local-multi-config-container');

  tabVsAI.addEventListener('click', () => {
    tabVsAI.classList.add('active');
    tabLocalMulti.classList.remove('active');
    GAME_STATE.gameMode = 'vs-ai';
    vsAiPanel.style.display = 'block';
    localMultiPanel.style.display = 'none';
  });

  tabLocalMulti.addEventListener('click', () => {
    tabLocalMulti.classList.add('active');
    tabVsAI.classList.remove('active');
    GAME_STATE.gameMode = 'local-multi';
    localMultiPanel.style.display = 'block';
    vsAiPanel.style.display = 'none';
  });

  const renderNameInputs = (count) => {
    const container = document.getElementById('player-names-container');
    container.innerHTML = '';
    for (let i = 1; i <= count; i++) {
      const row = document.createElement('div');
      row.className = 'name-input-group';
      
      // Player 1 is default human, others can be toggled to AI
      const isAIHtml = i > 1 
        ? `<label class="ai-checkbox-label">
             <input type="checkbox" class="ai-player-toggle" id="checkbox-pai-${i-1}">
             <span>AI 대전</span>
           </label>`
        : `<span class="human-badge-label">Player 1</span>`;

      row.innerHTML = `
        <div class="name-label-row">
          ${isAIHtml}
        </div>
        <input type="text" class="player-name-input" id="input-pname-${i-1}" placeholder="플레이어 ${i} 이름" value="플레이어 ${i}">
      `;
      container.appendChild(row);

      // Handle checkbox change to auto-rename
      if (i > 1) {
        const toggle = row.querySelector('.ai-player-toggle');
        const input = row.querySelector('.player-name-input');
        toggle.addEventListener('change', () => {
          if (toggle.checked) {
            input.value = `AI 봇 ${i-1}`;
            input.disabled = true;
          } else {
            input.value = `플레이어 ${i}`;
            input.disabled = false;
          }
        });
      }
    }
  };

  renderNameInputs(tempCount);

  pInc.addEventListener('click', () => {
    if (tempCount < 8) {
      tempCount++;
      pCountDisp.innerText = tempCount;
      renderNameInputs(tempCount);
    }
  });

  pDec.addEventListener('click', () => {
    if (tempCount > 1) {
      tempCount--;
      pCountDisp.innerText = tempCount;
      renderNameInputs(tempCount);
    }
  });

  // Theme radios
  const radioLabels = document.querySelectorAll('.theme-radio-label');
  radioLabels.forEach(label => {
    label.addEventListener('click', () => {
      radioLabels.forEach(l => l.classList.remove('active'));
      label.classList.add('active');
      const val = label.querySelector('input').value;
      
      // Update global & dropdown selector
      document.getElementById('theme-selector').value = val;
      updateTrayTheme(val);
    });
  });

  // Dropdown theme selector in header
  document.getElementById('theme-selector').addEventListener('change', (e) => {
    const val = e.target.value;
    updateTrayTheme(val);
    
    // Synch pre-game radios
    const matchRadio = document.querySelector(`.theme-radio-label[data-theme="${val}"]`);
    if (matchRadio) {
      radioLabels.forEach(l => l.classList.remove('active'));
      matchRadio.classList.add('active');
      matchRadio.querySelector('input').checked = true;
    }
  });

  // Start game click
  document.getElementById('btn-start-game').addEventListener('click', () => {
    GAME_STATE.players = [];

    if (GAME_STATE.gameMode === 'vs-ai') {
      const humanNameInput = document.getElementById('input-pname-vs-ai-human');
      const humanName = humanNameInput.value.trim() || '플레이어 1';
      
      const difficultySelect = document.getElementById('ai-difficulty-select');
      const difficulty = difficultySelect.value;
      GAME_STATE.aiDifficulty = difficulty;

      let aiName = '일반 AI 봇';
      if (difficulty === 'easy') aiName = '초보 AI 봇';
      else if (difficulty === 'hard') aiName = 'AI 마스터 봇';

      // Player 1: Human
      const humanScores = {};
      CATEGORIES.forEach(cat => { humanScores[cat.id] = null; });
      GAME_STATE.players.push({ name: humanName, scores: humanScores, isAI: false });

      // Player 2: AI
      const aiScores = {};
      CATEGORIES.forEach(cat => { aiScores[cat.id] = null; });
      GAME_STATE.players.push({ name: aiName, scores: aiScores, isAI: true, aiDifficulty: difficulty });
    } 
    else {
      // Local Multi
      for (let i = 0; i < tempCount; i++) {
        const nameInput = document.getElementById(`input-pname-${i}`);
        const name = nameInput.value.trim() || `플레이어 ${i+1}`;
        
        const isAIToggle = document.getElementById(`checkbox-pai-${i}`);
        const isAI = isAIToggle ? isAIToggle.checked : false;

        const scores = {};
        CATEGORIES.forEach(cat => {
          scores[cat.id] = null;
        });

        GAME_STATE.players.push({ name, scores, isAI, aiDifficulty: 'normal' });
      }
    }

    GAME_STATE.currentPlayerIndex = 0;
    GAME_STATE.currentRound = 1;
    GAME_STATE.rollsRemaining = 3;
    GAME_STATE.soundEnabled = document.getElementById('sound-toggle').checked;
    
    startGame();
  });

  // Rules trigger
  document.getElementById('btn-rules-trigger').addEventListener('click', () => {
    document.getElementById('rules-modal').classList.add('active');
  });
  document.getElementById('btn-rules-close').addEventListener('click', () => {
    document.getElementById('rules-modal').classList.remove('active');
  });
  document.getElementById('rules-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('rules-modal')) {
      document.getElementById('rules-modal').classList.remove('active');
    }
  });

  // Victory replay trigger
  document.getElementById('btn-replay-game').addEventListener('click', () => {
    document.getElementById('victory-modal').classList.remove('active');
    document.getElementById('setup-panel').style.display = 'block';
    document.getElementById('gameplay-panel').style.display = 'none';
  });

  // 3D Rolling trigger
  document.getElementById('btn-roll-dice').addEventListener('click', () => {
    rollDice3D();
  });

  // Turn reset / rollback helper
  document.getElementById('btn-reset-roll').addEventListener('click', () => {
    if (isRollingAnimation) return;
    
    GAME_STATE.rollsRemaining = 3;
    document.getElementById('hud-rolls-left').innerText = 3;
    document.getElementById('btn-roll-text').innerText = `주사위 굴리기 (3회 남음)`;
    document.getElementById('btn-roll-dice').disabled = false;
    document.getElementById('btn-reset-roll').disabled = true;

    // Reset lock slots
    GAME_STATE.diceLocked = [false, false, false, false, false];
    diceMeshes.forEach((die, index) => {
      die.animating = true;
      die.animProgress = 0;
      die.animStartPos.copy(die.pos);
      die.animStartQuat.copy(die.quat);
      die.animEndPos.set(-2 + index * 1.0, diceRadius, 1.5 + Math.random() * 0.5);
      die.animEndQuat.copy(getQuaternionForValue(GAME_STATE.diceValues[index]));
    });
    update2DKeepSlots();

    clearScorecardPreviews();
    updateHUDStatus('재시작 완료, 굴려주세요.');
    logConsole('[System] 주사위 상태가 초기화되었습니다. 다시 굴릴 수 있습니다.', 'system-log');
  });

  // Game forfeit
  document.getElementById('btn-forfeit-game').addEventListener('click', () => {
    if (confirm('현재 진행중인 게임을 그만두고 대기실로 돌아가시겠습니까?')) {
      localStorage.removeItem('cineaho_yacht_autosave');
      document.getElementById('setup-panel').style.display = 'block';
      document.getElementById('gameplay-panel').style.display = 'none';
      logConsole('[System] 게임을 중단하고 대기실로 돌아갔습니다.', 'system-log');
    }
  });

  // Console Clear
  document.getElementById('btn-clear-console').addEventListener('click', () => {
    document.getElementById('console-logs-container').innerHTML = '';
  });
}

function startGame() {
  GAME_STATE.gameActive = true;
  document.getElementById('setup-panel').style.display = 'none';
  document.getElementById('gameplay-panel').style.display = 'flex';

  // Initialize 3D if not already done, otherwise trigger resize to handle display flex layout size
  if (!renderer) {
    init3D();
  } else {
    setTimeout(onWindowResize, 50);
  }

  // Sound Synth init triggers
  initAudio();
  playSound('score');

  // Draw Scoreboard
  buildScorecardHTML();

  // Reset active player indicator columns
  highlightActivePlayerColumn();

  // Update HUD
  document.getElementById('hud-current-round').innerText = `${GAME_STATE.currentRound} / 12`;
  document.getElementById('hud-rolls-left').innerText = GAME_STATE.rollsRemaining;
  document.getElementById('btn-roll-text').innerText = `주사위 굴리기 (${GAME_STATE.rollsRemaining}회 남음)`;
  document.getElementById('btn-roll-dice').disabled = false;
  document.getElementById('btn-reset-roll').disabled = true;

  updateHUDStatus('주사위를 굴려주세요');
  update2DKeepSlots();

  logConsole('[System] 야추 다이스 대국 시작!', 'system-log');
  
  // Increment visitor session count on load
  incrementAppVisitorStats();

  // Check autosave restoring triggers
  const hasAutosave = loadAutosaveGame();
  if (hasAutosave) {
    buildScorecardHTML();
    
    // Populate restored scorecard filled cells
    GAME_STATE.players.forEach((p, pIdx) => {
      CATEGORIES.forEach(cat => {
        const val = p.scores[cat.id];
        if (val !== null) {
          const cell = document.getElementById(`score-cell-${pIdx}-${cat.id}`);
          if (cell) {
            cell.innerText = val;
            cell.classList.add('filled');
          }
        }
      });
      updatePlayerSummaryScores(pIdx);
    });

    // Populate remaining HUD values
    document.getElementById('hud-current-round').innerText = `${GAME_STATE.currentRound} / 12`;
    document.getElementById('hud-rolls-left').innerText = GAME_STATE.rollsRemaining;
    document.getElementById('btn-roll-text').innerText = `주사위 굴리기 (${GAME_STATE.rollsRemaining}회 남음)`;
    
    if (GAME_STATE.rollsRemaining === 0) {
      document.getElementById('btn-roll-dice').disabled = true;
    }
    if (GAME_STATE.rollsRemaining < 3) {
      document.getElementById('btn-reset-roll').disabled = false;
    }

    highlightActivePlayerColumn();
    update2DKeepSlots();

    // Trigger score previews if mid-roll
    if (GAME_STATE.rollsRemaining < 3) {
      calculateScorecardPreviews();
      updateHUDStatus('득점할 카테고리를 선택하세요');
    }
  }

  // If starting player is AI, trigger AI turn
  if (GAME_STATE.players[GAME_STATE.currentPlayerIndex].isAI) {
    runAITurn();
  }
}

function buildScorecardHTML() {
  const table = document.getElementById('scorecard-table');
  const theadRow = document.getElementById('score-table-header-row');
  const tbody = document.getElementById('score-table-body');

  // Reset headers
  theadRow.innerHTML = '<th>족보 카테고리</th>';
  GAME_STATE.players.forEach((p, idx) => {
    const th = document.createElement('th');
    th.className = 'player-header-cell';
    
    let aiBadgeHtml = '';
    if (p.isAI) {
      const diff = p.aiDifficulty || 'normal';
      let diffText = 'Normal';
      if (diff === 'easy') diffText = 'Easy';
      if (diff === 'hard') diffText = 'Hard';
      aiBadgeHtml = `<br><span class="ai-badge ai-badge-${diff}">${diffText}</span>`;
    }
    
    th.innerHTML = `${p.name}${aiBadgeHtml}`;
    theadRow.appendChild(th);
  });

  // Reset rows
  tbody.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const tr = document.createElement('tr');
    tr.id = `row-${cat.id}`;
    
    // Add row classes
    if (cat.id === 'subtotal') tr.className = 'subtotal-row';
    else if (cat.id === 'bonus') tr.className = 'bonus-row';
    else if (cat.id === 'total') tr.className = 'total-row';

    // Label cell
    const nameCell = document.createElement('td');
    nameCell.className = 'category-name-cell';
    nameCell.innerHTML = `${cat.name} <span>${cat.desc}</span>`;
    tr.appendChild(nameCell);

    // Player cells
    GAME_STATE.players.forEach((p, pIdx) => {
      const td = document.createElement('td');
      td.className = 'score-cell empty';
      td.id = `score-cell-${pIdx}-${cat.id}`;

      // Click listener for category cells (only clickable for current player)
      if (cat.calc !== false) {
        td.addEventListener('click', () => {
          if (pIdx === GAME_STATE.currentPlayerIndex && td.classList.contains('previewable')) {
            handleCategorySelect(cat.id);
          }
        });
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

function update2DKeepSlots() {
  const container = document.getElementById('keep-slots-container');
  container.innerHTML = '';

  for (let i = 0; i < 5; i++) {
    const slot = document.createElement('div');
    const isLocked = GAME_STATE.diceLocked[i];
    slot.className = `keep-slot ${isLocked ? 'locked' : ''}`;
    
    // Show locked padlock icon + settled value
    if (isLocked) {
      slot.innerHTML = `<i class="fa-solid fa-lock"></i> ${GAME_STATE.diceValues[i]}`;
    } else {
      slot.innerHTML = `<i class="fa-solid fa-lock-open"></i>`;
    }

    // Connect click handler to sync 2D and 3D states
    slot.addEventListener('click', () => {
      toggleDiceLock(i);
    });

    container.appendChild(slot);
  }
}

function updateHUDStatus(text) {
  document.getElementById('hud-game-status').innerText = text;
}

function logConsole(message, className = '') {
  const container = document.getElementById('console-logs-container');
  if (!container) return;
  
  const time = new Date().toLocaleTimeString('ko-KR', { hour12: false });
  const line = document.createElement('div');
  line.className = `log-line ${className}`;
  line.innerText = `[${time}] ${message}`;
  
  container.appendChild(line);
  container.scrollTop = container.scrollHeight;
}

// ==========================================================================
// 11. PORTAL ANALYTICS VISITS COUNTER INTEGRATION
// ==========================================================================

function incrementAppVisitorStats() {
  // Try sending hits back to portal server.js visitor API endpoint
  fetch('../api/visit?app=yacht-dice')
    .then(r => r.json())
    .then(data => {
      console.log('App analytics session incremented:', data);
    })
    .catch(err => {
      // Offline / standalone mode - ignore failures silently
      console.warn('Portal visitor logging unavailable:', err);
    });
}

// ==========================================================================
// 12. AI OPPONENT LOGIC (HEURISTICS)
// ==========================================================================

function runAITurn() {
  if (!GAME_STATE.gameActive) return;
  
  // Disable user controls during AI turn
  document.getElementById('btn-roll-dice').disabled = true;
  document.getElementById('btn-reset-roll').disabled = true;
  
  const currentPlayer = GAME_STATE.players[GAME_STATE.currentPlayerIndex];
  const diff = currentPlayer.aiDifficulty || 'normal';
  updateHUDStatus(`${currentPlayer.name} 주사위 굴리는 중...`);

  setTimeout(() => {
    if (GAME_STATE.rollsRemaining === 3) {
      // First Roll
      rollDice3D();
      return;
    }
    
    // If rollsRemaining is 2 or 1
    if (GAME_STATE.rollsRemaining > 0) {
      const pIdx = GAME_STATE.currentPlayerIndex;
      const player = GAME_STATE.players[pIdx];
      const emptyCats = CATEGORIES.filter(c => c.calc !== false && player.scores[c.id] === null).map(c => c.id);
      
      // Heuristic stop-early check
      const yachtScore = getCategoryPotentialScore('yacht', GAME_STATE.diceValues);
      const bStraightScore = getCategoryPotentialScore('big_straight', GAME_STATE.diceValues);
      const wantsToKeepAll = (yachtScore === 50 && emptyCats.includes('yacht')) ||
                             (bStraightScore === 30 && emptyCats.includes('big_straight'));
                             
      if (wantsToKeepAll) {
        logConsole(`[AI] ${player.name}가 완벽한 족보를 획득하여 롤을 멈춥니다.`, 'system-log');
        aiScoreTurn(emptyCats);
        return;
      }
      
      // Determine locks based on difficulty Heuristics
      const locks = solveAILocks(GAME_STATE.diceValues, emptyCats, diff);
      
      // Apply locks with animations
      let anyLockChanged = false;
      locks.forEach((shouldLock, i) => {
        const isLocked = GAME_STATE.diceLocked[i];
        if (shouldLock !== isLocked) {
          toggleDiceLock(i);
          anyLockChanged = true;
        }
      });
      
      // Delay before next roll to show flying locks animations
      updateHUDStatus(`${player.name} 주사위 재굴림 준비 중...`);
      setTimeout(() => {
        rollDice3D();
      }, anyLockChanged ? 1200 : 600);
      
      return;
    }
    
    // If rollsRemaining is 0
    if (GAME_STATE.rollsRemaining === 0) {
      const pIdx = GAME_STATE.currentPlayerIndex;
      const player = GAME_STATE.players[pIdx];
      const emptyCats = CATEGORIES.filter(c => c.calc !== false && player.scores[c.id] === null).map(c => c.id);
      aiScoreTurn(emptyCats);
    }
  }, 1000);
}

function aiScoreTurn(emptyCats) {
  const pIdx = GAME_STATE.currentPlayerIndex;
  const player = GAME_STATE.players[pIdx];
  const diff = player.aiDifficulty || 'normal';
  
  // Easy AI: 25% chance to select a completely random empty category to score!
  if (diff === 'easy' && Math.random() < 0.25) {
    const randomCat = emptyCats[Math.floor(Math.random() * emptyCats.length)];
    if (randomCat) {
      updateHUDStatus(`${player.name} 득점 카테고리 기입 중...`);
      setTimeout(() => {
        handleCategorySelect(randomCat);
      }, 1000);
      return;
    }
  }

  let bestCat = null;
  let maxPriority = -9999;
  
  emptyCats.forEach(catId => {
    const score = getCategoryPotentialScore(catId, GAME_STATE.diceValues);
    let priority = 0;
    
    switch (catId) {
      case 'yacht':
        priority = score === 50 ? 1000 : -100;
        break;
      case 'big_straight':
        priority = score === 30 ? 900 : -80;
        break;
      case 'little_straight':
        priority = score === 15 ? 800 : -70;
        break;
      case 'full_house':
        priority = score > 0 ? 700 + score : -60;
        break;
      case 'four_of_a_kind':
        priority = score > 0 ? 600 + score : -50;
        break;
      case 'choice':
        priority = 100 + score;
        break;
      case 'aces':
      case 'deuces':
      case 'threes':
      case 'fours':
      case 'fives':
      case 'sixes': {
        const valMap = { aces: 1, deuces: 2, threes: 3, fours: 4, fives: 5, sixes: 6 };
        const num = valMap[catId];
        const count = score / num;
        if (count >= 3) {
          priority = 400 + score;
        } else if (count === 2) {
          priority = 150 + score;
        } else {
          priority = 20 + score;
        }
        break;
      }
    }
    
    // Sacrifice logic if score is 0
    if (score === 0) {
      const sacrificeWeight = {
        yacht: 10,
        big_straight: 9,
        four_of_a_kind: 8,
        full_house: 7,
        little_straight: 6,
        aces: 5,
        deuces: 4,
        threes: 3,
        fours: 2,
        fives: 1,
        sixes: 0
      };
      priority = -200 + (sacrificeWeight[catId] || 0);
    }

    // Hard AI overrides
    if (diff === 'hard') {
      if (catId === 'yacht' && score === 50) priority += 1000;
      if (catId === 'choice' && score >= 22) priority += 150;
      if (['fours', 'fives', 'sixes'].includes(catId) && score >= 16) priority += 120;
    }

    // Easy AI adds random noise
    if (diff === 'easy') {
      priority += (Math.random() - 0.5) * 80;
    }
    
    if (priority > maxPriority) {
      maxPriority = priority;
      bestCat = catId;
    }
  });

  if (bestCat) {
    updateHUDStatus(`${player.name} 득점 카테고리 기입 중...`);
    setTimeout(() => {
      handleCategorySelect(bestCat);
    }, 1000);
  }
}

function solveAILocks(diceValues, emptyCats, diff = 'normal') {
  const locks = [false, false, false, false, false];

  // Easy AI locks: 30% chance of locking random config
  if (diff === 'easy' && Math.random() < 0.3) {
    for (let i = 0; i < 5; i++) {
      locks[i] = Math.random() < 0.5;
    }
    return locks;
  }

  const counts = Array(7).fill(0);
  diceValues.forEach(v => counts[v]++);

  let maxVal = 1;
  let maxCount = 0;
  for (let i = 1; i <= 6; i++) {
    if (counts[i] > maxCount) {
      maxCount = counts[i];
      maxVal = i;
    }
  }

  // Hard AI locks: aggressive draw configurations
  if (diff === 'hard') {
    // Aggressive Yacht locking: keep double or triple pairs
    if (emptyCats.includes('yacht')) {
      if (maxCount >= 2) {
        diceValues.forEach((v, i) => {
          if (v === maxVal) locks[i] = true;
        });
        return locks;
      }
    }

    // Aggressive Straight locking: lock sequences of 3+
    if (emptyCats.includes('big_straight') || emptyCats.includes('little_straight')) {
      const seen = new Set();
      const uniqueIndices = [];
      diceValues.forEach((v, idx) => {
        if (!seen.has(v)) {
          seen.add(v);
          uniqueIndices.push(idx);
        }
      });
      const uniqueVals = Array.from(seen).sort((a, b) => a - b);
      
      let longestSeq = [];
      let currentSeq = [];
      for (let i = 0; i < uniqueVals.length; i++) {
        if (i === 0 || uniqueVals[i] === uniqueVals[i-1] + 1) {
          currentSeq.push(uniqueVals[i]);
        } else {
          if (currentSeq.length > longestSeq.length) longestSeq = [...currentSeq];
          currentSeq = [uniqueVals[i]];
        }
      }
      if (currentSeq.length > longestSeq.length) longestSeq = currentSeq;

      if (longestSeq.length >= 3) {
        const seqSet = new Set(longestSeq);
        const lockedVals = new Set();
        diceValues.forEach((v, i) => {
          if (seqSet.has(v) && !lockedVals.has(v)) {
            locks[i] = true;
            lockedVals.add(v);
          }
        });
        return locks;
      }
    }

    // Aggressive Subtotal locking: lock high ones (4, 5, 6) even if single
    const openNumbers = emptyCats.filter(c => ['aces', 'deuces', 'threes', 'fours', 'fives', 'sixes'].includes(c));
    if (openNumbers.length > 0) {
      let bestHighVal = -1;
      let bestHighIdx = -1;
      diceValues.forEach((v, idx) => {
        if (v >= 4) {
          const catMap = { 1:'aces', 2:'deuces', 3:'threes', 4:'fours', 5:'fives', 6:'sixes' };
          if (openNumbers.includes(catMap[v]) && v > bestHighVal) {
            bestHighVal = v;
            bestHighIdx = idx;
          }
        }
      });
      if (bestHighIdx !== -1 && maxCount < 3) {
        diceValues.forEach((v, idx) => {
          if (v === bestHighVal) locks[idx] = true;
        });
        return locks;
      }
    }
  }

  // 1. Yacht/Full House / 4-of-a-kind focus
  if (emptyCats.includes('yacht') || emptyCats.includes('four_of_a_kind') || emptyCats.includes('full_house')) {
    if (maxCount >= 2) {
      diceValues.forEach((v, i) => {
        if (v === maxVal) locks[i] = true;
      });
      return locks;
    }
  }

  // 2. Straights focus
  if (emptyCats.includes('big_straight') || emptyCats.includes('little_straight')) {
    const uniqueIndices = [];
    const seen = new Set();
    diceValues.forEach((v, i) => {
      if (!seen.has(v)) {
        seen.add(v);
        uniqueIndices.push(i);
      }
    });

    const uniqueVals = Array.from(seen).sort((a, b) => a - b);
    let maxSeq = [];
    let currentSeq = [];
    for (let i = 0; i < uniqueVals.length; i++) {
      if (i === 0 || uniqueVals[i] === uniqueVals[i-1] + 1) {
        currentSeq.push(uniqueVals[i]);
      } else {
        if (currentSeq.length > maxSeq.length) maxSeq = [...currentSeq];
        currentSeq = [uniqueVals[i]];
      }
    }
    if (currentSeq.length > maxSeq.length) maxSeq = currentSeq;

    if (maxSeq.length >= 3) {
      const seqSet = new Set(maxSeq);
      const lockedVals = new Set();
      diceValues.forEach((v, i) => {
        if (seqSet.has(v) && !lockedVals.has(v)) {
          locks[i] = true;
          lockedVals.add(v);
        }
      });
      return locks;
    }
  }

  // 3. Subtotal numbers focus
  const openNumbers = emptyCats
    .filter(cat => ['aces', 'deuces', 'threes', 'fours', 'fives', 'sixes'].includes(cat))
    .map(cat => {
      const valMap = { aces: 1, deuces: 2, threes: 3, fours: 4, fives: 5, sixes: 6 };
      return valMap[cat];
    });

  if (openNumbers.length > 0) {
    if (openNumbers.includes(maxVal) && maxCount >= 2) {
      diceValues.forEach((v, i) => {
        if (v === maxVal) locks[i] = true;
      });
      return locks;
    }
  }

  // Fallback
  if (maxCount >= 2) {
    diceValues.forEach((v, i) => {
      if (v === maxVal) locks[i] = true;
    });
  } else {
    const maxValInDice = Math.max(...diceValues);
    if (maxValInDice >= 5) {
      const idx = diceValues.indexOf(maxValInDice);
      locks[idx] = true;
    }
  }

  return locks;
}

// ==========================================================================
// 13. RUN INITIALIZATION
// ==========================================================================

window.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  animate();
});
