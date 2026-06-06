// e:\Antigravity\workspace\Cineaho\billiards-3d\app.js

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const container = document.getElementById("three-canvas-container");
  const loadingOverlay = document.getElementById("loading-overlay");
  
  // Scoreboard
  const p1Card = document.getElementById("player1-card");
  const p2Card = document.getElementById("player2-card");
  const p1NameEl = document.getElementById("p1-name");
  const p2NameEl = document.getElementById("p2-name");
  const p1StatusEl = document.getElementById("p1-status");
  const p2StatusEl = document.getElementById("p2-status");
  const p1ScoreEl = document.getElementById("p1-score");
  const p2ScoreEl = document.getElementById("p2-score");
  const p1Tray = document.getElementById("p1-tray");
  const p2Tray = document.getElementById("p2-tray");
  const gameStatusMsg = document.getElementById("game-status-msg");
  const currentModeBadgeText = document.getElementById("mode-text");
  
  // HUD Overlays
  const cushionCounterDisplay = document.getElementById("cushion-counter-display");
  const cushionCountNum = document.getElementById("cushion-count-num");
  
  // Camera buttons
  const btnCamFree = document.getElementById("btn-cam-free");
  const btnCamOverhead = document.getElementById("btn-cam-overhead");
  const btnCamCue = document.getElementById("btn-cam-cue");
  
  // Actions
  const btnShoot = document.getElementById("btn-shoot");
  const btnResetCue = document.getElementById("btn-reset-cue");
  const btnRestart = document.getElementById("btn-restart");
  
  // Sliders
  const sliderAim = document.getElementById("slider-aim");
  const valAim = document.getElementById("val-aim");
  const btnAimDec = document.getElementById("btn-aim-dec");
  const btnAimInc = document.getElementById("btn-aim-inc");
  
  const sliderPower = document.getElementById("slider-power");
  const valPower = document.getElementById("val-power");
  const btnPowerDec = document.getElementById("btn-power-dec");
  const btnPowerInc = document.getElementById("btn-power-inc");
  
  // Spin Pad
  const spinIndicator = document.getElementById("spin-indicator");
  const valSpin = document.getElementById("val-spin");
  const btnResetSpin = document.getElementById("btn-reset-spin");
  const spinPadBack = document.querySelector(".spin-pad-back");
  
  // Mode selectors
  const btnModePractice = document.getElementById("btn-mode-practice");
  const btnMode8ball = document.getElementById("btn-mode-8ball");
  const btnMode3cushion = document.getElementById("btn-mode-3cushion");

  // --- Constants ---
  const TABLE_LENGTH = 200; // X bounds: -100 to 100
  const TABLE_WIDTH = 100;  // Z bounds: -50 to 50
  const BALL_RADIUS = 3.0;
  
  const RAIL_LIMIT_X = 100 - BALL_RADIUS; // 97
  const RAIL_LIMIT_Z = 50 - BALL_RADIUS;  // 47
  
  // Pocket positions (X, Z) - Y is flat 0
  const POCKETS = [
    { x: -100, z: -50, id: "corner-tl" },
    { x: 0,    z: -51, id: "side-t"   }, // slightly offset outward
    { x: 100,  z: -50, id: "corner-tr" },
    { x: -100, z: 50,  id: "corner-bl" },
    { x: 0,    z: 51,  id: "side-b"   },
    { x: 100,  z: 50,  id: "corner-br" }
  ];
  const POCKET_RADIUS = 6.5;

  // --- Physics & Game State Variables ---
  let gameMode = "practice"; // practice, 8ball, 3cushion
  let currentPlayer = 1;
  let scores = { 1: 0, 2: 0 };
  let activeGroup = { 1: null, 2: null }; // 8ball: "solid" or "stripe"
  let pocketedThisTurn = [];
  let cushionBounces = 0;
  let firstHitBall = null; // first target ball cue hits
  let secondHitBall = null; // second target ball cue hits (for 3cushion)
  let touchedCushionsThisShot = []; // logs cushion IDs touched
  
  let isSimulating = false;
  let aimAngle = 0; // Degrees (0 to 360)
  let shootPower = 40; // 5 to 100
  let spin = { x: 0, y: 0 }; // Spin offset (-1 to 1)
  
  let balls = [];
  let cueBall = null;
  let targetBall1 = null; // Red (for 3cushion / practice)
  let targetBall2 = null; // Yellow (for 3cushion / practice)
  
  let spinPadActive = false;
  
  // --- Three.js Variables ---
  let scene, camera, renderer, controls;
  let tableFelt, railsGroup, pocketsGroup;
  let cueMesh, guideLine;
  let pocketMeshes = [];
  
  // Camera status
  let cameraMode = "free"; // free, overhead, cue

  // --- Initializers ---
  init3D();
  setupEventListeners();
  resetGame(gameMode);
  
  // Hide loading overlay once ready
  setTimeout(() => {
    loadingOverlay.style.opacity = 0;
    setTimeout(() => loadingOverlay.style.display = "none", 500);
  }, 1000);

  // --- 1. Three.js Setup ---
  function init3D() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.0015);

    // Renderer
    const rect = container.getBoundingClientRect();
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(rect.width, rect.height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Camera
    camera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 1, 1000);
    camera.position.set(0, 150, 200);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05; // prevent going below table bed
    controls.minDistance = 40;
    controls.maxDistance = 350;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    // Billiards table ceiling lamp (Spotlights for nice shadows)
    const tableLamp = new THREE.SpotLight(0xffffff, 1.2);
    tableLamp.position.set(0, 160, 0);
    tableLamp.angle = Math.PI / 3;
    tableLamp.penumbra = 0.5;
    tableLamp.castShadow = true;
    tableLamp.shadow.mapSize.width = 2048;
    tableLamp.shadow.mapSize.height = 2048;
    tableLamp.shadow.camera.near = 50;
    tableLamp.shadow.camera.far = 250;
    tableLamp.shadow.bias = -0.0005;
    scene.add(tableLamp);

    // Floor glow decor
    const floorGeo = new THREE.PlaneGeometry(500, 500);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: 0x080c18, 
      roughness: 0.9, 
      metalness: 0.1 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -40;
    floor.receiveShadow = true;
    scene.add(floor);

    // Build Billiards Table
    buildTable();

    // Cue stick mesh
    const cueGeo = new THREE.CylinderGeometry(0.3, 0.8, 140, 12);
    // rotate so stick lies along axes for easier manipulation
    cueGeo.rotateX(Math.PI / 2);
    cueGeo.translate(0, 0, -70 - BALL_RADIUS - 1);
    const cueMat = new THREE.MeshStandardMaterial({
      color: 0xe5c158, // wood color
      roughness: 0.4,
      metalness: 0.1
    });
    cueMesh = new THREE.Mesh(cueGeo, cueMat);
    cueMesh.castShadow = true;
    scene.add(cueMesh);

    // Cue aiming guide line mesh
    const guideGeo = new THREE.BufferGeometry();
    const guidePoints = [new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,-80)];
    guideGeo.setFromPoints(guidePoints);
    const guideMat = new THREE.LineDashedMaterial({
      color: 0x10b981,
      dashSize: 3,
      gapSize: 2
    });
    guideLine = new THREE.Line(guideGeo, guideMat);
    guideLine.computeLineDistances();
    scene.add(guideLine);

    // Render loop
    renderer.setAnimationLoop(animate);
  }

  function buildTable() {
    // 1. Table Felt Bed
    const bedGeo = new THREE.BoxGeometry(200, 4, 100);
    const bedMat = new THREE.MeshStandardMaterial({ 
      color: 0x075e3c, // deep green felt
      roughness: 0.95,
      metalness: 0.05
    });
    tableFelt = new THREE.Mesh(bedGeo, bedMat);
    tableFelt.position.y = -2;
    tableFelt.receiveShadow = true;
    scene.add(tableFelt);

    // 2. Wood Cushion Rails
    railsGroup = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x5c2c16, // mahogany
      roughness: 0.2,
      metalness: 0.1
    });
    const railThickness = 12;
    const railHeight = 6;

    // Top & Bottom Rails (Long sides)
    const longRailGeo = new THREE.BoxGeometry(224, railHeight, railThickness);
    const topRail = new THREE.Mesh(longRailGeo, woodMat);
    topRail.position.set(0, railHeight/2, -50 - railThickness/2);
    topRail.castShadow = true;
    topRail.receiveShadow = true;
    railsGroup.add(topRail);

    const bottomRail = topRail.clone();
    bottomRail.position.z = 50 + railThickness/2;
    railsGroup.add(bottomRail);

    // Left & Right Rails (Short sides)
    const shortRailGeo = new THREE.BoxGeometry(railThickness, railHeight, 100);
    const leftRail = new THREE.Mesh(shortRailGeo, woodMat);
    leftRail.position.set(-100 - railThickness/2, railHeight/2, 0);
    leftRail.castShadow = true;
    leftRail.receiveShadow = true;
    railsGroup.add(leftRail);

    const rightRail = leftRail.clone();
    rightRail.position.x = 100 + railThickness/2;
    railsGroup.add(rightRail);

    // Felt Cushion trims (inside edges of wood rails)
    const cushionMat = new THREE.MeshStandardMaterial({
      color: 0x09794f, // slightly brighter green felt
      roughness: 0.9,
      metalness: 0.05
    });
    
    // Long cushions
    const longCushGeo = new THREE.BoxGeometry(190, 4, 3);
    const topCush = new THREE.Mesh(longCushGeo, cushionMat);
    topCush.position.set(0, 2, -48.5);
    railsGroup.add(topCush);
    const botCush = topCush.clone();
    botCush.position.z = 48.5;
    railsGroup.add(botCush);

    // Short cushions
    const shortCushGeo = new THREE.BoxGeometry(3, 4, 90);
    const leftCush = new THREE.Mesh(shortCushGeo, cushionMat);
    leftCush.position.set(-98.5, 2, 0);
    railsGroup.add(leftCush);
    const rightCush = leftCush.clone();
    rightCush.position.x = 98.5;
    railsGroup.add(rightCush);

    scene.add(railsGroup);

    // 3. Pockets (in 8-ball mode)
    pocketsGroup = new THREE.Group();
    const pocketHoleGeo = new THREE.CylinderGeometry(POCKET_RADIUS, POCKET_RADIUS, 4.2, 16);
    const pocketHoleMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

    POCKETS.forEach(poc => {
      const pocketMesh = new THREE.Mesh(pocketHoleGeo, pocketHoleMat);
      pocketMesh.position.set(poc.x, 0.1, poc.z);
      pocketsGroup.add(pocketMesh);
      pocketMeshes.push(pocketMesh);
    });

    scene.add(pocketsGroup);
  }

  // --- 2. Interactive Event Handlers ---
  function setupEventListeners() {
    // Mode Switchers
    btnModePractice.addEventListener("click", () => switchMode("practice"));
    btnMode8ball.addEventListener("click", () => switchMode("8ball"));
    btnMode3cushion.addEventListener("click", () => switchMode("3cushion"));

    // Camera Mode Selectors
    btnCamFree.addEventListener("click", () => setCameraMode("free"));
    btnCamOverhead.addEventListener("click", () => setCameraMode("overhead"));
    btnCamCue.addEventListener("click", () => setCameraMode("cue"));

    // Aim Sliders
    sliderAim.addEventListener("input", (e) => {
      aimAngle = parseFloat(e.target.value);
      valAim.textContent = `${aimAngle.toFixed(1)}°`;
      updateCuePosition();
    });
    btnAimDec.addEventListener("click", () => {
      aimAngle = (aimAngle - 1 + 360) % 360;
      sliderAim.value = aimAngle;
      valAim.textContent = `${aimAngle.toFixed(1)}°`;
      updateCuePosition();
    });
    btnAimInc.addEventListener("click", () => {
      aimAngle = (aimAngle + 1) % 360;
      sliderAim.value = aimAngle;
      valAim.textContent = `${aimAngle.toFixed(1)}°`;
      updateCuePosition();
    });

    // Power Sliders
    sliderPower.addEventListener("input", (e) => {
      shootPower = parseInt(e.target.value);
      valPower.textContent = `${shootPower}%`;
      updateCuePosition();
    });
    btnPowerDec.addEventListener("click", () => {
      shootPower = Math.max(5, shootPower - 5);
      sliderPower.value = shootPower;
      valPower.textContent = `${shootPower}%`;
      updateCuePosition();
    });
    btnPowerInc.addEventListener("click", () => {
      shootPower = Math.min(100, shootPower + 5);
      sliderPower.value = shootPower;
      valPower.textContent = `${shootPower}%`;
      updateCuePosition();
    });

    // Shoot & Action Buttons
    btnShoot.addEventListener("click", triggerShoot);
    btnResetCue.addEventListener("click", () => {
      aimAngle = 0;
      sliderAim.value = 0;
      valAim.textContent = "0.0°";
      updateCuePosition();
    });
    btnRestart.addEventListener("click", () => {
      if (confirm("현재 진행 중인 경기를 완전히 초기화하고 다시 시작할까요?")) {
        resetGame(gameMode);
      }
    });

    // Spin/English Pad Drag logic
    spinPadBack.addEventListener("mousedown", handleSpinStart);
    window.addEventListener("mousemove", handleSpinMove);
    window.addEventListener("mouseup", handleSpinEnd);
    
    // Touch support for spin pad
    spinPadBack.addEventListener("touchstart", (e) => {
      e.preventDefault();
      handleSpinStart(e.touches[0]);
    }, { passive: false });
    window.addEventListener("touchmove", (e) => {
      if (spinPadActive) {
        handleSpinMove(e.touches[0]);
      }
    }, { passive: false });
    window.addEventListener("touchend", handleSpinEnd);

    btnResetSpin.addEventListener("click", resetSpin);

    // Mouse drag on table to aim
    let isDraggingTable = false;
    let prevMouseX = 0;
    
    renderer.domElement.addEventListener("mousedown", (e) => {
      // Rotate aim on left click drag only if OrbitControls is not overriding
      // Check if clicking on the table/felt via simple raycaster or checking click type
      if (e.button === 0 && !isSimulating && cameraMode !== "free") {
        isDraggingTable = true;
        prevMouseX = e.clientX;
      }
    });

    window.addEventListener("mousemove", (e) => {
      if (isDraggingTable && !isSimulating) {
        const deltaX = e.clientX - prevMouseX;
        prevMouseX = e.clientX;
        
        // Adjust aim angle proportionally
        aimAngle = (aimAngle + deltaX * 0.4 + 360) % 360;
        sliderAim.value = aimAngle;
        valAim.textContent = `${aimAngle.toFixed(1)}°`;
        updateCuePosition();
      }
    });

    window.addEventListener("mouseup", () => {
      isDraggingTable = false;
    });

    // Window Resize
    window.addEventListener("resize", () => {
      const rect = container.getBoundingClientRect();
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      renderer.setSize(rect.width, rect.height);
    });
  }

  function handleSpinStart(e) {
    spinPadActive = true;
    updateSpinFromEvent(e);
  }

  function handleSpinMove(e) {
    if (!spinPadActive) return;
    updateSpinFromEvent(e);
  }

  function handleSpinEnd() {
    spinPadActive = false;
  }

  function updateSpinFromEvent(e) {
    const rect = spinPadBack.getBoundingClientRect();
    const padRadius = rect.width / 2;
    
    // Relative coordinates from center of pad
    let rx = e.clientX - (rect.left + padRadius);
    let ry = e.clientY - (rect.top + padRadius);
    
    // Cap radius at pad boundary
    const distance = Math.sqrt(rx * rx + ry * ry);
    if (distance > padRadius - 6) {
      const angle = Math.atan2(ry, rx);
      rx = (padRadius - 6) * Math.cos(angle);
      ry = (padRadius - 6) * Math.sin(angle);
    }
    
    // Set cursor position
    spinIndicator.style.left = `${padRadius + rx}px`;
    spinIndicator.style.top = `${padRadius + ry}px`;
    
    // Compute spin values from -1.0 to 1.0 (X is side spin, Y is follow/draw)
    // Invert Y so up is positive (Follow) and down is negative (Draw)
    spin.x = parseFloat((rx / (padRadius - 6)).toFixed(2));
    spin.y = parseFloat((-ry / (padRadius - 6)).toFixed(2));
    
    valSpin.textContent = `${spin.y > 0 ? '밀어' : spin.y < 0 ? '끌어' : ''}${spin.x > 0 ? '우' : spin.x < 0 ? '좌' : ''} (${spin.x.toFixed(2)}, ${spin.y.toFixed(2)})`;
    if (spin.x === 0 && spin.y === 0) {
      valSpin.textContent = "중앙 (0.00, 0.00)";
    }
  }

  function resetSpin() {
    spin.x = 0;
    spin.y = 0;
    spinIndicator.style.left = "50%";
    spinIndicator.style.top = "50%";
    valSpin.textContent = "중앙 (0.00, 0.00)";
  }

  // --- 3. Camera Controllers ---
  function setCameraMode(mode) {
    cameraMode = mode;
    
    // Update active button classes
    btnCamFree.classList.remove("active");
    btnCamOverhead.classList.remove("active");
    btnCamCue.classList.remove("active");
    
    if (mode === "free") {
      btnCamFree.classList.add("active");
      controls.enabled = true;
    } 
    else if (mode === "overhead") {
      btnCamOverhead.classList.add("active");
      controls.enabled = false;
      
      // Top down camera lookat
      camera.position.set(0, 160, 0.01); // minor offset to prevent singular vector lock
      controls.target.set(0, 0, 0);
      camera.lookAt(0, 0, 0);
    } 
    else if (mode === "cue") {
      btnCamCue.classList.add("active");
      controls.enabled = false;
      updateCueCamera();
    }
  }

  function updateCueCamera() {
    if (cameraMode !== "cue" || !cueBall) return;
    
    // Camera is positioned behind the cue ball looking along the aim vector
    const angleRad = (aimAngle * Math.PI) / 180;
    const dx = Math.cos(angleRad);
    const dz = Math.sin(angleRad);
    
    // Camera is offset back and slightly up
    const camDistance = 45;
    const camHeight = 16;
    
    camera.position.set(
      cueBall.position.x - dx * camDistance,
      cueBall.position.y + camHeight,
      cueBall.position.z - dz * camDistance
    );
    
    // Look slightly ahead of cue ball
    camera.lookAt(
      cueBall.position.x + dx * 20,
      cueBall.position.y,
      cueBall.position.z + dz * 20
    );
  }

  // --- 4. Game Modes & Reset Logic ---
  function switchMode(mode) {
    if (isSimulating) return;
    if (confirm(`${mode === '8ball' ? '8볼 포켓볼' : mode === '3cushion' ? '3쿠션 캐롬' : '연습'} 모드로 변경하시겠습니까? 현재 게임 진행 정보는 무시됩니다.`)) {
      resetGame(mode);
    }
  }

  function resetGame(mode) {
    gameMode = mode;
    isSimulating = false;
    pocketedThisTurn = [];
    cushionBounces = 0;
    cushionCountNum.textContent = "0";
    firstHitBall = null;
    secondHitBall = null;
    touchedCushionsThisShot = [];
    
    // Mode UI badge
    if (mode === "practice") {
      currentModeBadgeText.textContent = "연습 모드";
      p1Card.classList.remove("active");
      p2Card.classList.remove("active");
      p1StatusEl.textContent = "-";
      p2StatusEl.textContent = "-";
      p1NameEl.textContent = "연습생 1";
      p2NameEl.textContent = "연습생 2";
      scores = { 1: 0, 2: 0 };
      p1ScoreEl.textContent = "0";
      p2ScoreEl.textContent = "0";
      pocketsGroup.visible = false;
      cushionCounterDisplay.style.display = "none";
    } 
    else if (mode === "8ball") {
      currentModeBadgeText.textContent = "8볼 포켓볼";
      currentPlayer = 1;
      scores = { 1: 0, 2: 0 };
      activeGroup = { 1: null, 2: null };
      p1NameEl.textContent = "플레이어 1 (그룹: 미정)";
      p2NameEl.textContent = "플레이어 2 (그룹: 미정)";
      p1ScoreEl.textContent = "0";
      p2ScoreEl.textContent = "0";
      p1Card.classList.add("active");
      p2Card.classList.remove("active");
      p1StatusEl.textContent = "내 차례";
      p2StatusEl.textContent = "대기";
      pocketsGroup.visible = true;
      cushionCounterDisplay.style.display = "none";
      gameStatusMsg.textContent = "플레이어 1 차례. 샷을 조준하세요.";
    } 
    else if (mode === "3cushion") {
      currentModeBadgeText.textContent = "3쿠션 캐롬";
      currentPlayer = 1;
      scores = { 1: 0, 2: 0 };
      p1NameEl.textContent = "플레이어 1 (백구)";
      p2NameEl.textContent = "플레이어 2 (황구)";
      p1ScoreEl.textContent = "0";
      p2ScoreEl.textContent = "0";
      p1Card.classList.add("active");
      p2Card.classList.remove("active");
      p1StatusEl.textContent = "내 차례";
      p2StatusEl.textContent = "대기";
      pocketsGroup.visible = false;
      cushionCounterDisplay.style.display = "flex";
      gameStatusMsg.textContent = "플레이어 1 차례 (백구 타격)";
    }

    // Reset score trays
    p1Tray.innerHTML = "";
    p2Tray.innerHTML = "";
    
    // Re-create balls array
    spawnBalls(mode);
    
    // Reset view
    aimAngle = 0;
    sliderAim.value = 0;
    valAim.textContent = "0.0°";
    
    sliderPower.value = 40;
    shootPower = 40;
    valPower.textContent = "40%";
    
    resetSpin();
    updateCuePosition();
    
    if (cameraMode === "overhead" || cameraMode === "cue") {
      setCameraMode(cameraMode);
    } else {
      camera.position.set(0, 140, 180);
      controls.target.set(0, 0, 0);
      controls.update();
    }
  }

  function spawnBalls(mode) {
    // Clear old ball meshes
    balls.forEach(b => {
      if (b.mesh) scene.remove(b.mesh);
    });
    balls = [];
    
    const ballMaterialOptions = (color, numberText) => {
      // Basic colored spheres with custom textures or styled specular highlights
      return new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.1,
        metalness: 0.1
      });
    };

    const ballGeo = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);

    if (mode === "practice" || mode === "3cushion") {
      // Practice or 3cushion uses 3 balls
      // 1. Cue ball (White)
      const meshWhite = new THREE.Mesh(ballGeo, ballMaterialOptions(0xffffff));
      meshWhite.castShadow = true;
      meshWhite.receiveShadow = true;
      scene.add(meshWhite);
      cueBall = {
        id: 0,
        name: "cue-white",
        type: "cue",
        color: 0xffffff,
        position: { x: -50, y: BALL_RADIUS, z: 0 },
        velocity: { x: 0, z: 0 },
        spin: { x: 0, z: 0 },
        mesh: meshWhite,
        isFallen: false
      };
      balls.push(cueBall);

      // 2. Yellow Target Ball
      const meshYellow = new THREE.Mesh(ballGeo, ballMaterialOptions(0xffd700));
      meshYellow.castShadow = true;
      meshYellow.receiveShadow = true;
      scene.add(meshYellow);
      targetBall2 = {
        id: 1,
        name: "yellow",
        type: "target",
        color: 0xffd700,
        position: { x: 50, y: BALL_RADIUS, z: -15 },
        velocity: { x: 0, z: 0 },
        spin: { x: 0, z: 0 },
        mesh: meshYellow,
        isFallen: false
      };
      balls.push(targetBall2);

      // 3. Red Target Ball
      const meshRed = new THREE.Mesh(ballGeo, ballMaterialOptions(0xd2143a));
      meshRed.castShadow = true;
      meshRed.receiveShadow = true;
      scene.add(meshRed);
      targetBall1 = {
        id: 2,
        name: "red",
        type: "target",
        color: 0xd2143a,
        position: { x: 50, y: BALL_RADIUS, z: 15 },
        velocity: { x: 0, z: 0 },
        spin: { x: 0, z: 0 },
        mesh: meshRed,
        isFallen: false
      };
      balls.push(targetBall1);
    } 
    else if (mode === "8ball") {
      // 8-Ball pool uses 16 balls
      // 1. Cue ball (White)
      const meshWhite = new THREE.Mesh(ballGeo, ballMaterialOptions(0xffffff));
      meshWhite.castShadow = true;
      meshWhite.receiveShadow = true;
      scene.add(meshWhite);
      cueBall = {
        id: 0,
        name: "cue",
        type: "cue",
        color: 0xffffff,
        position: { x: -50, y: BALL_RADIUS, z: 0 },
        velocity: { x: 0, z: 0 },
        spin: { x: 0, z: 0 },
        mesh: meshWhite,
        isFallen: false
      };
      balls.push(cueBall);

      // Racked target balls triangle on the right side
      const startX = 40;
      const rowGap = BALL_RADIUS * 1.732; // sin(60) * diameter
      const colGap = BALL_RADIUS * 2;
      
      // Setup the 15 pocket ball colors/types
      // Solids (1-7), Stripe (9-15), 8Ball (Black)
      const ballDefs = [
        { num: 1,  color: 0xffcc00, type: "solid"  }, // Yellow
        { num: 2,  color: 0x007aff, type: "solid"  }, // Blue
        { num: 3,  color: 0xff3b30, type: "solid"  }, // Red
        { num: 4,  color: 0x5856d6, type: "solid"  }, // Purple
        { num: 5,  color: 0xff9500, type: "solid"  }, // Orange
        { num: 6,  color: 0x4cd964, type: "solid"  }, // Green
        { num: 7,  color: 0x9a3b00, type: "solid"  }, // Maroon
        { num: 8,  color: 0x0a0a0a, type: "8ball"  }, // Black
        { num: 9,  color: 0xffcc00, type: "stripe" },
        { num: 10, color: 0x007aff, type: "stripe" },
        { num: 11, color: 0xff3b30, type: "stripe" },
        { num: 12, color: 0x5856d6, type: "stripe" },
        { num: 13, color: 0xff9500, type: "stripe" },
        { num: 14, color: 0x4cd964, type: "stripe" },
        { num: 15, color: 0x9a3b00, type: "stripe" }
      ];

      // Shuffle racked ball order slightly but keep 8ball in center
      // Swap elements to ensure randomness but hold requirements
      const randomRack = [...ballDefs];
      
      // Standard 8-ball racks: 8ball at row 3 center.
      // Corner balls of back row should be one solid, one stripe.
      // Let's place them explicitly:
      const rackOrder = [
        1,  // row 1: (index 0)
        9, 2, // row 2: (index 1, 2)
        10, 8, 3, // row 3: (index 3, 4, 5) - index 4 is 8ball!
        4, 11, 5, 12, // row 4: (index 6, 7, 8, 9)
        13, 6, 14, 7, 15 // row 5: (index 10, 11, 12, 13, 14)
      ];

      let orderIdx = 0;
      for (let row = 0; row < 5; row++) {
        const ballCountInRow = row + 1;
        const x = startX + row * rowGap;
        
        for (let col = 0; col < ballCountInRow; col++) {
          const z = (col - (ballCountInRow - 1) / 2) * colGap;
          
          const targetNum = rackOrder[orderIdx];
          const def = ballDefs.find(d => d.num === targetNum);
          
          const mesh = new THREE.Mesh(ballGeo, ballMaterialOptions(def.color));
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          scene.add(mesh);
          
          balls.push({
            id: targetNum,
            name: `ball-${def.num}`,
            type: def.type,
            color: def.color,
            position: { x: x, y: BALL_RADIUS, z: z },
            velocity: { x: 0, z: 0 },
            spin: { x: 0, z: 0 },
            mesh: mesh,
            isFallen: false
          });
          
          orderIdx++;
        }
      }
    }

    // Apply positions to meshes
    updateBallMeshes();
  }

  function updateBallMeshes() {
    balls.forEach(b => {
      if (b.isFallen) return;
      b.mesh.position.set(b.position.x, b.position.y, b.position.z);
    });
  }

  // --- 5. Cue and Guide Projector Position Logic ---
  function updateCuePosition() {
    if (isSimulating || !cueBall) {
      cueMesh.visible = false;
      guideLine.visible = false;
      return;
    }

    cueMesh.visible = true;
    guideLine.visible = true;

    const angleRad = (aimAngle * Math.PI) / 180;
    const dx = Math.cos(angleRad);
    const dz = Math.sin(angleRad);

    // Cue stick positioning
    // Pushes back based on power slider
    const cuePushBack = 1.5 + (shootPower * 0.15); // visual pull back
    cueMesh.position.set(
      cueBall.position.x - dx * cuePushBack,
      cueBall.position.y + 0.5,
      cueBall.position.z - dz * cuePushBack
    );
    // Rotate cue stick mesh to point at cue ball
    cueMesh.rotation.y = -angleRad - Math.PI / 2;

    // Guide projector line positioning (starts at cue ball, extends forward)
    const lineLength = 120;
    const lineEnd = new THREE.Vector3(
      cueBall.position.x + dx * lineLength,
      cueBall.position.y,
      cueBall.position.z + dz * lineLength
    );
    
    // We can calculate cushion boundary intersections to bounce the guide line!
    let guideSegments = [new THREE.Vector3(cueBall.position.x, cueBall.position.y, cueBall.position.z)];
    
    // Standard ray casting against rails
    let rayX = cueBall.position.x;
    let rayZ = cueBall.position.z;
    let rdx = dx;
    let rdz = dz;
    let remainingLength = 140;

    for (let bounce = 0; bounce < 2; bounce++) {
      // Find intersection with cushion rails
      let tX = Infinity;
      let tZ = Infinity;

      if (rdx > 0) tX = (RAIL_LIMIT_X - rayX) / rdx;
      else if (rdx < 0) tX = (-RAIL_LIMIT_X - rayX) / rdx;

      if (rdz > 0) tZ = (RAIL_LIMIT_Z - rayZ) / rdz;
      else if (rdz < 0) tZ = (-RAIL_LIMIT_Z - rayZ) / rdz;

      const t = Math.min(tX, tZ);

      if (t < remainingLength && t > 0) {
        // Intersects rail!
        rayX += rdx * t;
        rayZ += rdz * t;
        guideSegments.push(new THREE.Vector3(rayX, cueBall.position.y, rayZ));
        
        remainingLength -= t;

        // Bounce ray
        if (t === tX) rdx = -rdx;
        else rdz = -rdz;
      } else {
        // Extends to length limit
        rayX += rdx * remainingLength;
        rayZ += rdz * remainingLength;
        guideSegments.push(new THREE.Vector3(rayX, cueBall.position.y, rayZ));
        break;
      }
    }

    const guideGeo = new THREE.BufferGeometry().setFromPoints(guideSegments);
    guideLine.geometry.dispose();
    guideLine.geometry = guideGeo;
    guideLine.computeLineDistances();
  }

  // --- 6. Shooting Execution ---
  function triggerShoot() {
    if (isSimulating || !cueBall) return;
    
    const angleRad = (aimAngle * Math.PI) / 180;
    const dx = Math.cos(angleRad);
    const dz = Math.sin(angleRad);

    // Initial cue ball velocity proportional to power (increased multiplier to 1.275 to increase power by 5x)
    const velocityMagnitude = shootPower * 1.275; // scaler
    cueBall.velocity.x = dx * velocityMagnitude;
    cueBall.velocity.z = dz * velocityMagnitude;

    // Apply spin/English offsets
    // Side spin (spin.x) affects cushion bounce angle.
    // Vertical spin (spin.y) creates follow/draw forces applied during rolling decay.
    cueBall.spin.x = spin.x * 2.5; // side spin intensity
    cueBall.spin.y = spin.y * 3.5; // draw/follow intensity

    // Play visual feedback trigger (animate stick hitting ball)
    animateCueStrike(() => {
      isSimulating = true;
      pocketedThisTurn = [];
      cushionBounces = 0;
      cushionCountNum.textContent = "0";
      firstHitBall = null;
      secondHitBall = null;
      touchedCushionsThisShot = [];
      
      // Update UI Status
      gameStatusMsg.textContent = "공 시뮬레이션 중...";
      
      cueMesh.visible = false;
      guideLine.visible = false;
    });
  }

  function animateCueStrike(onComplete) {
    const angleRad = (aimAngle * Math.PI) / 180;
    const dx = Math.cos(angleRad);
    const dz = Math.sin(angleRad);
    
    // Simple visual pull stick forward
    const origPos = cueMesh.position.clone();
    const duration = 120; // ms
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      
      // Move stick forward towards cue ball position
      const slide = (1 - progress) * (shootPower * 0.15 + 1.5);
      cueMesh.position.set(
        cueBall.position.x - dx * slide,
        cueBall.position.y + 0.5,
        cueBall.position.z - dz * slide
      );

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Strike completed
        onComplete();
      }
    }
    requestAnimationFrame(step);
  }

  // --- 7. Custom Physics Simulation Engine ---
  function updatePhysics(dt) {
    let ballsMoving = false;

    // 1. Update positions, apply friction, detect rail bounds
    balls.forEach(b => {
      if (b.isFallen) return;

      const speedSq = b.velocity.x * b.velocity.x + b.velocity.z * b.velocity.z;
      
      if (speedSq > 0.001) {
        ballsMoving = true;

        // Apply position update
        b.position.x += b.velocity.x * dt;
        b.position.z += b.velocity.z * dt;

        // Friction decay (felt surface drag)
        const friction = 0.982;
        b.velocity.x *= friction;
        b.velocity.z *= friction;

        // Apply vertical spin (follow / draw) friction forces
        // Follow (spin.y > 0) accelerates ball forward. Draw (spin.y < 0) pulls it back.
        if (Math.abs(b.spin.y) > 0.05) {
          const spinFriction = 0.93;
          b.velocity.x += b.spin.y * Math.cos(aimAngle * Math.PI/180) * 0.04;
          b.velocity.z += b.spin.y * Math.sin(aimAngle * Math.PI/180) * 0.04;
          b.spin.y *= spinFriction;
        }

        // Apply side spin curve (minor curvature drift on rolling)
        if (Math.abs(b.spin.x) > 0.05) {
          const spinDrift = 0.005 * b.spin.x;
          // Perpendicular drift vector
          b.velocity.x += -b.velocity.z * spinDrift;
          b.velocity.z += b.velocity.x * spinDrift;
          b.spin.x *= 0.98; // slow down spin
        }

        // Cushion collision checks (taking ball radius into account)
        handleCushionBounce(b);
      } else {
        b.velocity.x = 0;
        b.velocity.z = 0;
        b.spin.x = 0;
        b.spin.y = 0;
      }
    });

    // 2. Resolve Ball-to-Ball collisions
    for (let i = 0; i < balls.length; i++) {
      const b1 = balls[i];
      if (b1.isFallen) continue;

      for (let j = i + 1; j < balls.length; j++) {
        const b2 = balls[j];
        if (b2.isFallen) continue;

        handleBallCollision(b1, b2);
      }
    }

    // 3. Resolve pocket falls (8-ball mode only)
    if (gameMode === "8ball") {
      balls.forEach(b => {
        if (b.isFallen) return;
        checkPocketFall(b);
      });
    }

    // Update 3D mesh positions & rotation rotations based on rolling speed
    balls.forEach(b => {
      if (b.isFallen) return;
      b.mesh.position.set(b.position.x, b.position.y, b.position.z);
      
      // Roll ball mesh rotation
      const speed = Math.sqrt(b.velocity.x * b.velocity.x + b.velocity.z * b.velocity.z);
      if (speed > 0.05) {
        const axisX = -b.velocity.z / speed;
        const axisZ = b.velocity.x / speed;
        b.mesh.rotateOnWorldAxis(new THREE.Vector3(axisX, 0, axisZ), (speed / BALL_RADIUS) * dt);
      }
    });

    // If simulating and all balls stopped, trigger turn resolution
    if (isSimulating && !ballsMoving) {
      isSimulating = false;
      resolveTurnRules();
    }
  }

  function handleCushionBounce(ball) {
    let bounced = false;
    let cushionId = null;

    // Bounce off Left / Right rails
    if (ball.position.x < -RAIL_LIMIT_X) {
      ball.position.x = -RAIL_LIMIT_X;
      ball.velocity.x = -ball.velocity.x * 0.78; // Restitution
      
      // Apply side spin correction (spin.x affects reflection angle)
      ball.velocity.z += ball.spin.x * 0.6;
      ball.spin.x *= 0.5; // lose spin on impact
      bounced = true;
      cushionId = "left";
    } 
    else if (ball.position.x > RAIL_LIMIT_X) {
      ball.position.x = RAIL_LIMIT_X;
      ball.velocity.x = -ball.velocity.x * 0.78;
      
      ball.velocity.z -= ball.spin.x * 0.6;
      ball.spin.x *= 0.5;
      bounced = true;
      cushionId = "right";
    }

    // Bounce off Top / Bottom rails
    if (ball.position.z < -RAIL_LIMIT_Z) {
      ball.position.z = -RAIL_LIMIT_Z;
      ball.velocity.z = -ball.velocity.z * 0.78;
      
      ball.velocity.x -= ball.spin.x * 0.6;
      ball.spin.x *= 0.5;
      bounced = true;
      cushionId = "top";
    } 
    else if (ball.position.z > RAIL_LIMIT_Z) {
      ball.position.z = RAIL_LIMIT_Z;
      ball.velocity.z = -ball.velocity.z * 0.78;
      
      ball.velocity.x += ball.spin.x * 0.6;
      ball.spin.x *= 0.5;
      bounced = true;
      cushionId = "bottom";
    }

    // Logging cushion count for 3cushion mode
    if (bounced && ball.type === "cue") {
      // Play a quick animation effect on wood rails if possible (or console debug)
      triggerCushionFlash(cushionId);

      // Track unique cushions hit this shot (only increment count if it is a new wall or consecutively bounced)
      // Standard rule: just counting cushion hit events
      cushionBounces++;
      cushionCountNum.textContent = cushionBounces;
    }
  }

  function triggerCushionFlash(cushionId) {
    // Make corresponding cushion flash color slightly in Three.js (simple felt flash)
    const flashColor = new THREE.Color(0x09bc8a);
    const origColor = new THREE.Color(0x075e3c);
    
    // Quick interpolation
    tableFelt.material.color.copy(flashColor);
    setTimeout(() => {
      tableFelt.material.color.copy(origColor);
    }, 150);
  }

  function handleBallCollision(b1, b2) {
    const dx = b2.position.x - b1.position.x;
    const dz = b2.position.z - b1.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const minDist = BALL_RADIUS * 2;

    if (dist < minDist) {
      // Collision detected!
      // 1. Resolve overlap (push them apart equally)
      const overlap = minDist - dist;
      const nx = dx / dist; // normal vector X
      const nz = dz / dist; // normal vector Z
      
      b1.position.x -= nx * overlap * 0.5;
      b1.position.z -= nz * overlap * 0.5;
      b2.position.x += nx * overlap * 0.5;
      b2.position.z += nz * overlap * 0.5;

      // 2. Elastic collision calculations
      // Relative velocity
      const rvx = b2.velocity.x - b1.velocity.x;
      const rvz = b2.velocity.z - b1.velocity.z;

      // Velocity projected onto normal
      const velAlongNormal = rvx * nx + rvz * nz;

      // Only resolve if velocities are approaching
      if (velAlongNormal < 0) {
        // Swap velocities along normal
        const restitution = 0.95; // highly elastic plastic ball collisions
        const impulse = -(1 + restitution) * velAlongNormal * 0.5;

        // Apply impulse
        b1.velocity.x -= nx * impulse;
        b1.velocity.z -= nz * impulse;
        b2.velocity.x += nx * impulse;
        b2.velocity.z += nz * impulse;

        // Transfer partial side spin to target ball (gives nice curve to object balls)
        const spinTransfer = 0.15;
        b2.spin.x += b1.spin.x * spinTransfer;
        b1.spin.x *= (1 - spinTransfer);

        // Track hit order (useful for game mode rules)
        if (b1.type === "cue") {
          registerCueHit(b2);
        } else if (b2.type === "cue") {
          registerCueHit(b1);
        }
      }
    }
  }

  function registerCueHit(targetBall) {
    if (!firstHitBall) {
      firstHitBall = targetBall;
      console.log(`수구 첫 충돌 대상: ${targetBall.name}`);
    } else if (!secondHitBall && targetBall.id !== firstHitBall.id) {
      secondHitBall = targetBall;
      console.log(`수구 두번째 충돌 대상: ${targetBall.name}`);
    }
  }

  function checkPocketFall(ball) {
    for (let i = 0; i < POCKETS.length; i++) {
      const poc = POCKETS[i];
      const dx = ball.position.x - poc.x;
      const dz = ball.position.z - poc.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      
      if (dist < POCKET_RADIUS) {
        // Falls in pocket!
        ball.isFallen = true;
        ball.velocity = { x: 0, z: 0 };
        
        // Pocket animation: scale down and sink under table bed
        animatePocketFall(ball);
        pocketedThisTurn.push(ball);
        break;
      }
    }
  }

  function animatePocketFall(ball) {
    const mesh = ball.mesh;
    const origScale = mesh.scale.clone();
    const startTime = performance.now();
    const duration = 400; // ms

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Scale down
      mesh.scale.copy(origScale).multiplyScalar(1 - progress);
      // Drop Z position (which is 3D Y coordinate)
      mesh.position.y = BALL_RADIUS - progress * 10;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Fully fallen: hide mesh and remove from scene
        mesh.visible = false;
        scene.remove(mesh);
      }
    }
    requestAnimationFrame(step);
  }

  // --- 8. Turn Resolution & Rules Logic ---
  function resolveTurnRules() {
    console.log("시뮬레이션 정지. 판정 시작.");

    if (gameMode === "practice") {
      // Practice mode: No turns, no fouls, just return cue ball if pocketed or check positions
      if (cueBall.isFallen) {
        respawnCueBall();
      }
      gameStatusMsg.textContent = "연습 샷 완료. 다음 샷을 조준하세요.";
      updateCuePosition();
      if (cameraMode === "cue") setCameraMode("cue");
      return;
    }

    if (gameMode === "3cushion") {
      resolve3CushionTurn();
    } 
    else if (gameMode === "8ball") {
      resolve8BallTurn();
    }

    // Force camera reposition if in cue mode
    updateCuePosition();
    if (cameraMode === "cue") {
      setCameraMode("cue");
    }
  }

  function resolve3CushionTurn() {
    // Target balls: Yellow (id:1) and Red (id:2)
    // Cue ball must hit both target balls, and cushion count must be >= 3 BEFORE hitting the second target ball.
    let scored = false;
    let msg = "";

    const target1 = balls.find(b => b.id === 1);
    const target2 = balls.find(b => b.id === 2);

    if (firstHitBall && secondHitBall) {
      // Hit both balls!
      if (cushionBounces >= 3) {
        scored = true;
        msg = `득점 성공! 3쿠션 성공 (${cushionBounces}쿠션)`;
      } else {
        msg = `실패: 쿠션 횟수 부족 (${cushionBounces}쿠션)`;
      }
    } else {
      msg = "실패: 두 개의 목적구를 모두 맞추지 못했습니다.";
    }

    // In Carom/3cushion, falling off table or scratching doesn't exist, but reset ball positions if they are somehow stuck or out.
    if (cueBall.isFallen) respawnCueBall();
    if (target1 && target1.isFallen) respawnBall(target1, 50, -15);
    if (target2 && target2.isFallen) respawnBall(target2, 50, 15);

    if (scored) {
      // Current player gets point and shoots again
      scores[currentPlayer]++;
      updateScoreboardDisplays();
      gameStatusMsg.textContent = `플레이어 ${currentPlayer} ${msg}`;
    } else {
      // Turn switches
      currentPlayer = currentPlayer === 1 ? 2 : 1;
      updateScoreboardDisplays();
      gameStatusMsg.textContent = `플레이어 ${currentPlayer} 차례. ${msg}`;
    }
  }

  function resolve8BallTurn() {
    let p1Scratch = false;
    let p8BallPocketed = false;
    let pocketedOpponentBallsCount = 0;
    let pocketedMyBallsCount = 0;
    let pocketedWrongGroupFirst = false;

    // Check if cue ball scratched
    if (cueBall.isFallen) {
      p1Scratch = true;
      respawnCueBall();
      console.log("스크래치 파울 발생!");
    }

    // Process pocketed balls this turn
    pocketedThisTurn.forEach(b => {
      if (b.type === "cue") return; // processed
      
      if (b.type === "8ball") {
        p8BallPocketed = true;
      } else {
        // Group check (Solids 1-7 vs Stripes 9-15)
        const ballGroup = b.type; // solid or stripe
        
        // Render pocketed ball inside player scoreboard tray
        addBallToTray(currentPlayer, b.color, b.id);

        if (activeGroup[currentPlayer] === null) {
          // No groups assigned yet, first ball pocketed assigns it!
          const otherPlayer = currentPlayer === 1 ? 2 : 1;
          activeGroup[currentPlayer] = ballGroup;
          activeGroup[otherPlayer] = ballGroup === "solid" ? "stripe" : "solid";
          
          p1NameEl.textContent = `플레이어 1 (${activeGroup[1] === "solid" ? "단색공" : "줄무늬공"})`;
          p2NameEl.textContent = `플레이어 2 (${activeGroup[2] === "solid" ? "단색공" : "줄무늬공"})`;
          
          pocketedMyBallsCount++;
          console.log(`그룹 결정: P${currentPlayer} -> ${ballGroup}`);
        } 
        else {
          // Group already assigned
          if (activeGroup[currentPlayer] === ballGroup) {
            pocketedMyBallsCount++;
            scores[currentPlayer]++;
          } else {
            const otherPlayer = currentPlayer === 1 ? 2 : 1;
            pocketedOpponentBallsCount++;
            scores[otherPlayer]++; // opponent scores points!
          }
        }
      }
    });

    // Check first ball hit foul (must hit own group first)
    if (firstHitBall && activeGroup[currentPlayer] !== null) {
      if (firstHitBall.type !== "8ball" && firstHitBall.type !== activeGroup[currentPlayer]) {
        pocketedWrongGroupFirst = true;
        console.log("파울: 상대방 그룹의 공을 먼저 맞췄습니다!");
      }
    }

    updateScoreboardDisplays();

    // Sinking 8-ball rules
    if (p8BallPocketed) {
      // Check if player has pocketed all their own group balls
      const myGroup = activeGroup[currentPlayer];
      const remainingMyGroupBalls = balls.filter(b => b.type === myGroup && !b.isFallen).length;

      if (remainingMyGroupBalls === 0 && !p1Scratch) {
        // WIN GAME
        gameStatusMsg.textContent = `🏆 축하합니다! 플레이어 ${currentPlayer} 승리!`;
        alert(`플레이어 ${currentPlayer}가 8번 공을 넣어 게임에서 승리했습니다!`);
        resetGame("8ball");
      } else {
        // LOSE GAME (Pocketed 8ball early, or scratched on 8ball)
        const winner = currentPlayer === 1 ? 2 : 1;
        gameStatusMsg.textContent = `💀 플레이어 ${currentPlayer} 패배! (8번공 파울)`;
        alert(`플레이어 ${currentPlayer}가 파울 또는 조기 8번 공 포켓팅으로 패배했습니다. 플레이어 ${winner} 승리!`);
        resetGame("8ball");
      }
      return;
    }

    // Determine next turn
    let nextPlayer = currentPlayer;
    let statusText = "";

    if (p1Scratch || pocketedWrongGroupFirst || (firstHitBall === null && balls.filter(b=>b.type!=='cue'&&!b.isFallen).length > 0)) {
      // FOUL: Switch turn and give free ball/placement
      nextPlayer = currentPlayer === 1 ? 2 : 1;
      statusText = "파울 발생! 상대편에게 프리볼 기회가 넘어갑니다.";
      
      // Move cue ball to starting spot (Kitchen)
      cueBall.position.x = -50;
      cueBall.position.z = 0;
      updateBallMeshes();
    } 
    else if (pocketedMyBallsCount > 0) {
      // Scored own group: Keep turn
      nextPlayer = currentPlayer;
      statusText = "득점 성공! 차례를 계속 유지합니다.";
    } 
    else {
      // Didn't pocket anything or only opponent's ball: Switch turn
      nextPlayer = currentPlayer === 1 ? 2 : 1;
      statusText = "공 포켓팅 실패. 차례가 바뀝니다.";
    }

    currentPlayer = nextPlayer;
    updateActivePlayerCard();
    gameStatusMsg.textContent = `플레이어 ${currentPlayer} 차례. ${statusText}`;
  }

  function respawnCueBall() {
    cueBall.isFallen = false;
    cueBall.position = { x: -50, y: BALL_RADIUS, z: 0 };
    cueBall.velocity = { x: 0, z: 0 };
    cueBall.spin = { x: 0, z: 0 };
    cueBall.mesh.visible = true;
    scene.add(cueBall.mesh);
    updateBallMeshes();
  }

  function respawnBall(ball, x, z) {
    ball.isFallen = false;
    ball.position = { x: x, y: BALL_RADIUS, z: z };
    ball.velocity = { x: 0, z: 0 };
    ball.spin = { x: 0, z: 0 };
    ball.mesh.visible = true;
    scene.add(ball.mesh);
    updateBallMeshes();
  }

  function updateScoreboardDisplays() {
    p1ScoreEl.textContent = scores[1];
    p2ScoreEl.textContent = scores[2];
  }

  function updateActivePlayerCard() {
    if (currentPlayer === 1) {
      p1Card.classList.add("active");
      p2Card.classList.remove("active");
      p1StatusEl.textContent = "내 차례";
      p2StatusEl.textContent = "대기";
    } else {
      p2Card.classList.add("active");
      p1Card.classList.remove("active");
      p2StatusEl.textContent = "내 차례";
      p1StatusEl.textContent = "대기";
    }
  }

  function addBallToTray(player, colorHex, id) {
    const tray = player === 1 ? p1Tray : p2Tray;
    
    // Check if ball icon already exists to prevent duplicate rendering
    if (tray.querySelector(`[data-ball-id="${id}"]`)) return;

    const ballIcon = document.createElement("div");
    ballIcon.className = "pocket-ball-icon";
    ballIcon.style.backgroundColor = `#${colorHex.toString(16).padStart(6, '0')}`;
    ballIcon.setAttribute("data-ball-id", id);
    tray.appendChild(ballIcon);
  }

  // --- 9. Three.js Animation Render Frame ---
  function animate(time) {
    // Run physics in 8 sub-steps to prevent ball-tunneling at 5x maximum shooting velocities
    const substeps = 8;
    const dt = 0.16 / substeps; 

    for (let i = 0; i < substeps; i++) {
      updatePhysics(dt);
    }

    // Camera follow if in cue mode
    updateCueCamera();

    // OrbitControls update
    if (cameraMode === "free") {
      controls.update();
    }

    // Render Scene
    renderer.render(scene, camera);
  }
});
