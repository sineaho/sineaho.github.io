/* =============================================================
   BlackJack 3D – Three.js Casino Table + Game Logic
   ============================================================= */

(function () {
  'use strict';

  // ── Configuration ──
  const CARD_WIDTH = 1.4;
  const CARD_HEIGHT = 2.0;
  const CARD_DEPTH = 0.04;
  const TABLE_RADIUS = 8;
  const DEAL_DURATION = 400; // ms per card animation
  const SUITS = ['♠', '♥', '♦', '♣'];
  const SUIT_COLORS = { '♠': '#111827', '♥': '#e11d48', '♦': '#2563eb', '♣': '#059669' };
  const DEALER_STAND = 17;
  const TARGET = 21;

  // ── Game State ──
  let playerHand = [];
  let dealerHand = [];
  let phase = 'betting'; // betting | dealing | player | dealer | result
  let chips = 1000;
  let currentBet = 50;
  let stats = { wins: 0, losses: 0, ties: 0, streak: 0 };

  // ── Three.js Globals ──
  let scene, camera, renderer, controls;
  let cardMeshes = { player: [], dealer: [] };
  let deckMesh;
  let tableGroup;
  let animationQueue = [];
  let isAnimating = false;

  // ── DOM References ──
  const container = document.getElementById('three-canvas-container');
  const loadingOverlay = document.getElementById('loading-overlay');
  const dealerTotalHud = document.getElementById('dealer-total-hud');
  const playerTotalHud = document.getElementById('player-total-hud');
  const resultBanner = document.getElementById('result-banner');
  const chipCountEl = document.getElementById('chip-count');
  const currentBetEl = document.getElementById('current-bet-value');
  const btnDeal = document.getElementById('btn-deal');
  const btnHit = document.getElementById('btn-hit');
  const btnStand = document.getElementById('btn-stand');
  const btnNewGame = document.getElementById('btn-new-game');
  const betChips = document.querySelectorAll('.bet-chip');

  // Stats DOM
  const statWins = document.getElementById('stat-wins');
  const statLosses = document.getElementById('stat-losses');
  const statTies = document.getElementById('stat-ties');
  const statStreak = document.getElementById('stat-streak');

  // Camera buttons
  const btnCamDefault = document.getElementById('btn-cam-default');
  const btnCamOverhead = document.getElementById('btn-cam-overhead');
  const btnCamClose = document.getElementById('btn-cam-close');

  // ══════════════════════════════════════════════
  //  THREE.JS SCENE SETUP
  // ══════════════════════════════════════════════
  function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a14);
    scene.fog = new THREE.Fog(0x0a0a14, 20, 50);

    // Camera
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 8, 7.5);
    camera.lookAt(0, 0, 0.5);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 5;
    controls.maxDistance = 25;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.target.set(0, 0, 0);

    // Lighting
    setupLights();

    // Build Scene
    buildCasinoTable();
    buildDeck();

    // Resize Handler
    window.addEventListener('resize', onResize);

    // Hide loading
    setTimeout(() => {
      loadingOverlay.classList.add('hidden');
    }, 800);

    // Render Loop
    animate();
  }

  function setupLights() {
    // Ambient
    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambient);

    // Main overhead spot
    const mainLight = new THREE.SpotLight(0xffeedd, 1.2, 30, Math.PI / 4, 0.5, 1);
    mainLight.position.set(0, 15, 0);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.set(2048, 2048);
    mainLight.shadow.camera.near = 1;
    mainLight.shadow.camera.far = 25;
    scene.add(mainLight);
    scene.add(mainLight.target);

    // Dedicated front light for card clarity
    const cardLight = new THREE.DirectionalLight(0xffffff, 0.85);
    cardLight.position.set(0, 10, 10);
    cardLight.castShadow = true;
    cardLight.shadow.mapSize.set(1024, 1024);
    scene.add(cardLight);

    // Accent warm point lights
    const warmLeft = new THREE.PointLight(0xf59e0b, 0.25, 20);
    warmLeft.position.set(-6, 6, -3);
    scene.add(warmLeft);

    const warmRight = new THREE.PointLight(0xf59e0b, 0.25, 20);
    warmRight.position.set(6, 6, -3);
    scene.add(warmRight);

    // Cool fill
    const coolFill = new THREE.PointLight(0x6366f1, 0.15, 20);
    coolFill.position.set(0, 8, 8);
    scene.add(coolFill);
  }

  function buildCasinoTable() {
    tableGroup = new THREE.Group();

    // ── Table Surface (semi-circle / D-shape blackjack table) ──
    const tableShape = new THREE.Shape();
    // Straight back edge
    tableShape.moveTo(-TABLE_RADIUS * 0.8, -TABLE_RADIUS * 0.35);
    tableShape.lineTo(TABLE_RADIUS * 0.8, -TABLE_RADIUS * 0.35);
    // Curved front
    tableShape.absarc(0, -TABLE_RADIUS * 0.35, TABLE_RADIUS * 0.8, 0, Math.PI, false);

    const tableGeo = new THREE.ExtrudeGeometry(tableShape, { depth: 0.3, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.05, bevelSegments: 3 });
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x0d5e2e,
      roughness: 0.85,
      metalness: 0.05,
    });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.rotation.x = -Math.PI / 2;
    tableMesh.position.y = -0.15;
    tableMesh.receiveShadow = true;
    tableGroup.add(tableMesh);

    // ── Table Edge (rim) ──
    const rimShape = new THREE.Shape();
    rimShape.moveTo(-TABLE_RADIUS * 0.85, -TABLE_RADIUS * 0.35);
    rimShape.lineTo(TABLE_RADIUS * 0.85, -TABLE_RADIUS * 0.35);
    rimShape.absarc(0, -TABLE_RADIUS * 0.35, TABLE_RADIUS * 0.85, 0, Math.PI, false);

    const innerShape = new THREE.Shape();
    innerShape.moveTo(-TABLE_RADIUS * 0.78, -TABLE_RADIUS * 0.35);
    innerShape.lineTo(TABLE_RADIUS * 0.78, -TABLE_RADIUS * 0.35);
    innerShape.absarc(0, -TABLE_RADIUS * 0.35, TABLE_RADIUS * 0.78, 0, Math.PI, false);

    rimShape.holes.push(innerShape);
    const rimGeo = new THREE.ExtrudeGeometry(rimShape, { depth: 0.6, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.03 });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x3d1a0a,
      roughness: 0.3,
      metalness: 0.6,
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = -Math.PI / 2;
    rimMesh.position.y = -0.3;
    rimMesh.receiveShadow = true;
    rimMesh.castShadow = true;
    tableGroup.add(rimMesh);

    // ── Felt Lines ──
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x1a7a44, transparent: true, opacity: 0.5 });

    // Dealer line arc
    const arcCurve = new THREE.EllipseCurve(0, -TABLE_RADIUS * 0.35, TABLE_RADIUS * 0.55, TABLE_RADIUS * 0.55, 0, Math.PI, false);
    const arcPoints = arcCurve.getPoints(64);
    const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const arcLine = new THREE.Line(arcGeo, new THREE.LineBasicMaterial({ color: 0x1a7a44, transparent: true, opacity: 0.4 }));
    arcLine.rotation.x = -Math.PI / 2;
    arcLine.position.y = 0.01;
    tableGroup.add(arcLine);

    // Table legs (4 pillars)
    const legGeo = new THREE.CylinderGeometry(0.2, 0.25, 2.5, 12);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x2a1008, roughness: 0.4, metalness: 0.5 });
    const legPositions = [[-4, -1.4, -2], [4, -1.4, -2], [-3, -1.4, 3], [3, -1.4, 3]];
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(...pos);
      leg.castShadow = true;
      tableGroup.add(leg);
    });

    // Floor
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0a0a14, roughness: 0.95, metalness: 0 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.7;
    floor.receiveShadow = true;
    tableGroup.add(floor);

    scene.add(tableGroup);
  }

  function buildDeck() {
    // Stack of cards on the right side of table
    const deckGroup = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const cardGeo = new THREE.BoxGeometry(CARD_WIDTH, CARD_DEPTH, CARD_HEIGHT);
      const cardMat = new THREE.MeshStandardMaterial({
        color: 0x1a237e,
        roughness: 0.5,
        metalness: 0.3,
      });
      const card = new THREE.Mesh(cardGeo, cardMat);
      card.position.y = i * CARD_DEPTH;
      card.castShadow = true;
      deckGroup.add(card);
    }
    deckGroup.position.set(4.5, 0.1, -1.5);
    deckMesh = deckGroup;
    scene.add(deckGroup);
  }

  // ══════════════════════════════════════════════
  //  CARD MESH CREATION
  // ══════════════════════════════════════════════
  function createCardMesh(card, faceDown = false) {
    const group = new THREE.Group();

    // Card body
    const geo = new THREE.BoxGeometry(CARD_WIDTH, CARD_DEPTH, CARD_HEIGHT);

    // Multi-material: top=face, bottom=back, sides=edge
    const faceMat = new THREE.MeshStandardMaterial({
      color: faceDown ? 0x1a237e : 0xf5f5f0,
      roughness: 0.4,
      metalness: 0.1,
    });
    const backMat = new THREE.MeshStandardMaterial({
      color: 0x1a237e,
      roughness: 0.4,
      metalness: 0.3,
    });
    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.6,
      metalness: 0.1,
    });

    // BoxGeometry faces: +x, -x, +y (top), -y (bottom), +z, -z
    const materials = [edgeMat, edgeMat, faceMat, backMat, edgeMat, edgeMat];
    const mesh = new THREE.Mesh(geo, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Card face decorations (only if face-up)
    if (!faceDown) {
      // Value text
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 768;
      const ctx = canvas.getContext('2d');

      // White background
      ctx.fillStyle = '#f5f5f0';
      ctx.fillRect(0, 0, 512, 768);

      // Border
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 8;
      ctx.roundRect ? ctx.roundRect(16, 16, 480, 736, 24) : ctx.strokeRect(16, 16, 480, 736);
      ctx.stroke();

      // Suit color
      const suitColor = SUIT_COLORS[card.suit] || '#333';

      // Top-left value + suit
      ctx.fillStyle = suitColor;
      ctx.font = 'bold 88px Outfit, Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(card.value.toString(), 40, 100);
      ctx.font = '64px Arial, sans-serif';
      ctx.fillText(card.suit, 44, 170);

      // Center value large
      ctx.font = 'bold 240px Outfit, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(card.value.toString(), 256, 400);

      // Center suit
      ctx.font = '120px Arial, sans-serif';
      ctx.fillText(card.suit, 256, 540);

      // Bottom-right value + suit (rotated)
      ctx.save();
      ctx.translate(472, 668);
      ctx.rotate(Math.PI);
      ctx.font = 'bold 88px Outfit, Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(card.value.toString(), 0, 0);
      ctx.font = '64px Arial, sans-serif';
      ctx.fillText(card.suit, 4, 70);
      ctx.restore();

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 8;

      // Apply texture to top face
      const texMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.35,
        metalness: 0.05,
      });
      mesh.material[2] = texMat; // top face (+y)
    } else {
      // Card back pattern
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 768;
      const ctx = canvas.getContext('2d');

      // Dark blue background
      const grad = ctx.createLinearGradient(0, 0, 512, 768);
      grad.addColorStop(0, '#1a237e');
      grad.addColorStop(0.5, '#283593');
      grad.addColorStop(1, '#1a237e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 768);

      // Diamond pattern
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 30; j++) {
          const cx = i * 52 + (j % 2) * 26;
          const cy = j * 26;
          ctx.beginPath();
          ctx.moveTo(cx, cy - 16);
          ctx.lineTo(cx + 16, cy);
          ctx.lineTo(cx, cy + 16);
          ctx.lineTo(cx - 16, cy);
          ctx.closePath();
          ctx.stroke();
        }
      }

      // Center emblem
      ctx.fillStyle = 'rgba(245,158,11,0.25)';
      ctx.font = 'bold 120px serif';
      ctx.textAlign = 'center';
      ctx.fillText('♠', 256, 410);

      // Border
      ctx.strokeStyle = 'rgba(245,158,11,0.4)';
      ctx.lineWidth = 12;
      ctx.strokeRect(24, 24, 464, 720);
      ctx.strokeStyle = 'rgba(245,158,11,0.2)';
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, 432, 688);

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 8;

      const texMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.4,
        metalness: 0.3,
      });
      mesh.material[2] = texMat; // top face
    }

    group.userData = { card, faceDown };
    return group;
  }

  // ══════════════════════════════════════════════
  //  CARD ANIMATION SYSTEM
  // ══════════════════════════════════════════════
  function queueAnimation(fn) {
    animationQueue.push(fn);
    if (!isAnimating) processQueue();
  }

  function processQueue() {
    if (animationQueue.length === 0) {
      isAnimating = false;
      return;
    }
    isAnimating = true;
    const fn = animationQueue.shift();
    fn(() => processQueue());
  }

  function animateCardDeal(cardMesh, targetPos, targetRotation, duration, onComplete) {
    const startPos = { x: deckMesh.position.x, y: deckMesh.position.y + 0.5, z: deckMesh.position.z };
    const startRot = { x: 0, y: 0, z: 0 };
    const startTime = performance.now();

    // Arc height
    const arcHeight = 3;

    function update() {
      const elapsed = performance.now() - startTime;
      let t = Math.min(elapsed / duration, 1);

      // Ease out cubic
      t = 1 - Math.pow(1 - t, 3);

      // Position with arc
      cardMesh.position.x = startPos.x + (targetPos.x - startPos.x) * t;
      cardMesh.position.z = startPos.z + (targetPos.z - startPos.z) * t;
      // Y with parabolic arc
      const arcT = 4 * t * (1 - t); // peaks at t=0.5
      cardMesh.position.y = startPos.y + (targetPos.y - startPos.y) * t + arcHeight * arcT;

      // Rotation
      cardMesh.rotation.x = startRot.x + (targetRotation.x - startRot.x) * t;
      cardMesh.rotation.y = startRot.y + (targetRotation.y - startRot.y) * t + Math.PI * 2 * (1 - t) * 0.3;
      cardMesh.rotation.z = startRot.z + (targetRotation.z - startRot.z) * t;

      if (t < 1) {
        requestAnimationFrame(update);
      } else {
        cardMesh.position.set(targetPos.x, targetPos.y, targetPos.z);
        cardMesh.rotation.set(targetRotation.x, targetRotation.y, targetRotation.z);
        if (onComplete) onComplete();
      }
    }
    requestAnimationFrame(update);
  }

  function animateCardFlip(cardMesh, card, duration, onComplete) {
    const startTime = performance.now();
    let flipped = false;

    function update() {
      const elapsed = performance.now() - startTime;
      let t = Math.min(elapsed / duration, 1);

      // Flip around Z
      const angle = Math.PI * t;
      cardMesh.rotation.z = angle;

      // At halfway, swap texture
      if (t >= 0.5 && !flipped) {
        flipped = true;
        // Replace with face-up card
        const newCard = createCardMesh(card, false);
        const targetPos = cardMesh.position.clone();
        const parent = cardMesh.parent;

        // Copy children's materials
        newCard.position.copy(targetPos);
        newCard.rotation.copy(cardMesh.rotation);
        newCard.rotation.z = Math.PI - cardMesh.rotation.z;

        // Remove old, add new
        scene.remove(cardMesh);
        scene.add(newCard);

        // Update reference
        const idx = cardMeshes.dealer.indexOf(cardMesh);
        if (idx >= 0) cardMeshes.dealer[idx] = newCard;

        // Continue animation on new card
        const startTime2 = performance.now();
        const remainDuration = duration * (1 - t);
        function update2() {
          const elapsed2 = performance.now() - startTime2;
          let t2 = Math.min(elapsed2 / remainDuration, 1);
          newCard.rotation.z = Math.PI + Math.PI * t2;
          if (t2 < 1) {
            requestAnimationFrame(update2);
          } else {
            newCard.rotation.z = 0;
            if (onComplete) onComplete();
          }
        }
        requestAnimationFrame(update2);
        return; // stop this animation
      }

      if (t < 1) {
        requestAnimationFrame(update);
      } else {
        if (onComplete) onComplete();
      }
    }
    requestAnimationFrame(update);
  }

  // ══════════════════════════════════════════════
  //  CARD POSITIONS
  // ══════════════════════════════════════════════
  function getPlayerCardPos(index) {
    const startX = -2;
    const spacing = CARD_WIDTH + 0.3;
    return {
      x: startX + index * spacing,
      y: 0.08 + index * CARD_DEPTH,
      z: 2.5
    };
  }

  function getDealerCardPos(index) {
    const startX = -2;
    const spacing = CARD_WIDTH + 0.3;
    return {
      x: startX + index * spacing,
      y: 0.08 + index * CARD_DEPTH,
      z: -2
    };
  }

  // ══════════════════════════════════════════════
  //  GAME LOGIC
  // ══════════════════════════════════════════════
  function drawCard() {
    const value = Math.floor(Math.random() * 6) + 1;
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    return { value, suit };
  }

  function handTotal(hand) {
    return hand.reduce((sum, c) => sum + c.value, 0);
  }

  function updateHUD() {
    playerTotalHud.textContent = playerHand.length > 0 ? handTotal(playerHand) : '-';

    if (phase === 'dealer' || phase === 'result') {
      dealerTotalHud.textContent = handTotal(dealerHand);
    } else if (dealerHand.length > 1) {
      // Show only the visible card total
      dealerTotalHud.textContent = dealerHand[1].value + ' + ?';
    } else if (dealerHand.length === 1) {
      dealerTotalHud.textContent = '?';
    } else {
      dealerTotalHud.textContent = '-';
    }

    chipCountEl.textContent = chips;
    statWins.textContent = stats.wins;
    statLosses.textContent = stats.losses;
    statTies.textContent = stats.ties;
    statStreak.textContent = stats.streak;
  }

  function showResult(message, cssClass, chipDelta) {
    resultBanner.textContent = message;
    resultBanner.className = 'result-banner ' + cssClass;
    resultBanner.style.display = 'block';

    chips += chipDelta;
    if (chips < 0) chips = 0;

    phase = 'result';
    btnHit.disabled = true;
    btnStand.disabled = true;
    btnDeal.style.display = 'none';
    btnNewGame.style.display = 'flex';

    updateHUD();
  }

  function clearTable() {
    // Remove all card meshes
    cardMeshes.player.forEach(m => scene.remove(m));
    cardMeshes.dealer.forEach(m => scene.remove(m));
    cardMeshes.player = [];
    cardMeshes.dealer = [];
    playerHand = [];
    dealerHand = [];
    animationQueue = [];
    isAnimating = false;
  }

  // ── Deal ──
  function startDeal() {
    if (chips < currentBet) {
      alert('칩이 부족합니다! 베팅을 줄여주세요.');
      return;
    }

    clearTable();
    resultBanner.style.display = 'none';
    phase = 'dealing';
    btnDeal.style.display = 'none';
    btnNewGame.style.display = 'none';
    btnHit.disabled = true;
    btnStand.disabled = true;

    // Draw cards
    const pCard1 = drawCard();
    const pCard2 = drawCard();
    const dCard1 = drawCard(); // face down
    const dCard2 = drawCard();

    playerHand.push(pCard1, pCard2);
    dealerHand.push(dCard1, dCard2);

    // Animate dealing: P1, D1(down), P2, D2
    queueAnimation((done) => {
      const mesh = createCardMesh(pCard1, false);
      scene.add(mesh);
      mesh.position.set(deckMesh.position.x, deckMesh.position.y + 0.5, deckMesh.position.z);
      cardMeshes.player.push(mesh);
      const pos = getPlayerCardPos(0);
      animateCardDeal(mesh, pos, { x: 0, y: 0, z: 0 }, DEAL_DURATION, () => {
        updateHUD();
        done();
      });
    });

    queueAnimation((done) => {
      const mesh = createCardMesh(dCard1, true);
      scene.add(mesh);
      mesh.position.set(deckMesh.position.x, deckMesh.position.y + 0.5, deckMesh.position.z);
      cardMeshes.dealer.push(mesh);
      const pos = getDealerCardPos(0);
      animateCardDeal(mesh, pos, { x: 0, y: 0, z: 0 }, DEAL_DURATION, () => {
        updateHUD();
        done();
      });
    });

    queueAnimation((done) => {
      const mesh = createCardMesh(pCard2, false);
      scene.add(mesh);
      mesh.position.set(deckMesh.position.x, deckMesh.position.y + 0.5, deckMesh.position.z);
      cardMeshes.player.push(mesh);
      const pos = getPlayerCardPos(1);
      animateCardDeal(mesh, pos, { x: 0, y: 0, z: 0 }, DEAL_DURATION, () => {
        updateHUD();
        done();
      });
    });

    queueAnimation((done) => {
      const mesh = createCardMesh(dCard2, false);
      scene.add(mesh);
      mesh.position.set(deckMesh.position.x, deckMesh.position.y + 0.5, deckMesh.position.z);
      cardMeshes.dealer.push(mesh);
      const pos = getDealerCardPos(1);
      animateCardDeal(mesh, pos, { x: 0, y: 0, z: 0 }, DEAL_DURATION, () => {
        updateHUD();
        // Check for natural 21
        checkAfterDeal();
        done();
      });
    });
  }

  function checkAfterDeal() {
    const pTotal = handTotal(playerHand);
    if (pTotal === TARGET) {
      // Player blackjack! Reveal dealer
      revealDealerAndResolve();
      return;
    }
    // Normal play
    phase = 'player';
    btnHit.disabled = false;
    btnStand.disabled = false;
  }

  // ── Hit ──
  function playerHit() {
    if (phase !== 'player') return;
    btnHit.disabled = true;
    btnStand.disabled = true;

    const card = drawCard();
    playerHand.push(card);

    queueAnimation((done) => {
      const idx = cardMeshes.player.length;
      const mesh = createCardMesh(card, false);
      scene.add(mesh);
      mesh.position.set(deckMesh.position.x, deckMesh.position.y + 0.5, deckMesh.position.z);
      cardMeshes.player.push(mesh);
      const pos = getPlayerCardPos(idx);
      animateCardDeal(mesh, pos, { x: 0, y: 0, z: 0 }, DEAL_DURATION, () => {
        updateHUD();
        const total = handTotal(playerHand);
        if (total > TARGET) {
          stats.losses++;
          stats.streak = 0;
          showResult(`버스트! (${total}) 패배 -${currentBet}`, 'result-lose', -currentBet);
        } else if (total === TARGET) {
          // Auto-stand at 21
          playerStand();
        } else {
          btnHit.disabled = false;
          btnStand.disabled = false;
        }
        done();
      });
    });
  }

  // ── Stand ──
  function playerStand() {
    if (phase !== 'player' && phase !== 'dealing') return;
    phase = 'dealer';
    btnHit.disabled = true;
    btnStand.disabled = true;

    revealDealerAndResolve();
  }

  function revealDealerAndResolve() {
    phase = 'dealer';

    // Flip dealer's hidden card
    queueAnimation((done) => {
      const hiddenMesh = cardMeshes.dealer[0];
      const card = dealerHand[0];

      // Replace with face-up version
      const newMesh = createCardMesh(card, false);
      newMesh.position.copy(hiddenMesh.position);
      newMesh.rotation.copy(hiddenMesh.rotation);
      scene.remove(hiddenMesh);
      scene.add(newMesh);
      cardMeshes.dealer[0] = newMesh;

      // Simple flip animation
      const startTime = performance.now();
      const dur = 400;
      function flipAnim() {
        const t = Math.min((performance.now() - startTime) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        // Rotate around local Y for flip effect
        newMesh.scale.x = Math.abs(Math.cos(Math.PI * eased));
        if (t < 1) {
          requestAnimationFrame(flipAnim);
        } else {
          newMesh.scale.x = 1;
          updateHUD();
          done();
        }
      }
      requestAnimationFrame(flipAnim);
    });

    // Dealer draws until >= 17
    function dealerDraw() {
      if (handTotal(dealerHand) < DEALER_STAND) {
        const card = drawCard();
        dealerHand.push(card);

        queueAnimation((done) => {
          const idx = cardMeshes.dealer.length;
          const mesh = createCardMesh(card, false);
          scene.add(mesh);
          mesh.position.set(deckMesh.position.x, deckMesh.position.y + 0.5, deckMesh.position.z);
          cardMeshes.dealer.push(mesh);
          const pos = getDealerCardPos(idx);
          animateCardDeal(mesh, pos, { x: 0, y: 0, z: 0 }, DEAL_DURATION, () => {
            updateHUD();
            done();
          });
        });

        // Schedule next draw check
        queueAnimation((done) => {
          dealerDraw();
          done();
        });
      } else {
        // Resolve
        queueAnimation((done) => {
          resolveGame();
          done();
        });
      }
    }

    // Start dealer drawing after reveal
    queueAnimation((done) => {
      dealerDraw();
      done();
    });
  }

  function resolveGame() {
    const pTotal = handTotal(playerHand);
    const dTotal = handTotal(dealerHand);

    if (dTotal > TARGET) {
      stats.wins++;
      stats.streak++;
      showResult(`딜러 버스트! (${dTotal}) 승리 +${currentBet}`, 'result-win', currentBet);
    } else if (pTotal > dTotal) {
      stats.wins++;
      stats.streak++;
      showResult(`승리! ${pTotal} vs ${dTotal} +${currentBet}`, 'result-win', currentBet);
    } else if (dTotal > pTotal) {
      stats.losses++;
      stats.streak = 0;
      showResult(`패배 ${pTotal} vs ${dTotal} -${currentBet}`, 'result-lose', -currentBet);
    } else {
      stats.ties++;
      showResult(`무승부 ${pTotal} vs ${dTotal} ±0`, 'result-tie', 0);
    }
  }

  // ── New Game ──
  function newGame() {
    clearTable();
    resultBanner.style.display = 'none';
    phase = 'betting';
    btnDeal.style.display = 'flex';
    btnNewGame.style.display = 'none';
    btnHit.disabled = true;
    btnStand.disabled = true;

    if (chips <= 0) {
      chips = 1000;
      alert('칩이 모두 소진되었습니다. 1,000칩으로 재시작합니다!');
    }

    updateHUD();
  }

  // ══════════════════════════════════════════════
  //  CAMERA PRESETS
  // ══════════════════════════════════════════════
  function setCameraPreset(preset) {
    const camBtns = [btnCamDefault, btnCamOverhead, btnCamClose];
    camBtns.forEach(b => b.classList.remove('active'));

    let targetPos, targetLookAt;
    switch (preset) {
      case 'default':
        targetPos = { x: 0, y: 8, z: 7.5 };
        targetLookAt = { x: 0, y: 0, z: 0.5 };
        btnCamDefault.classList.add('active');
        break;
      case 'overhead':
        targetPos = { x: 0, y: 12, z: 0.5 };
        targetLookAt = { x: 0, y: 0, z: 0.2 };
        btnCamOverhead.classList.add('active');
        break;
      case 'close':
        targetPos = { x: 0, y: 4, z: 4.5 };
        targetLookAt = { x: 0, y: 0, z: 1.5 };
        btnCamClose.classList.add('active');
        break;
    }

    // Smooth camera transition
    const startPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const startTarget = { x: controls.target.x, y: controls.target.y, z: controls.target.z };
    const startTime = performance.now();
    const dur = 800;

    function camAnim() {
      const t = Math.min((performance.now() - startTime) / dur, 1);
      const e = 1 - Math.pow(1 - t, 3);

      camera.position.x = startPos.x + (targetPos.x - startPos.x) * e;
      camera.position.y = startPos.y + (targetPos.y - startPos.y) * e;
      camera.position.z = startPos.z + (targetPos.z - startPos.z) * e;

      controls.target.x = startTarget.x + (targetLookAt.x - startTarget.x) * e;
      controls.target.y = startTarget.y + (targetLookAt.y - startTarget.y) * e;
      controls.target.z = startTarget.z + (targetLookAt.z - startTarget.z) * e;

      controls.update();

      if (t < 1) requestAnimationFrame(camAnim);
    }
    requestAnimationFrame(camAnim);
  }

  // ══════════════════════════════════════════════
  //  EVENT LISTENERS
  // ══════════════════════════════════════════════
  function setupEventListeners() {
    btnDeal.addEventListener('click', startDeal);
    btnHit.addEventListener('click', playerHit);
    btnStand.addEventListener('click', playerStand);
    btnNewGame.addEventListener('click', newGame);

    // Betting chips
    betChips.forEach(chip => {
      chip.addEventListener('click', () => {
        if (phase !== 'betting' && phase !== 'result') return;
        betChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentBet = parseInt(chip.dataset.amount);
        currentBetEl.textContent = currentBet;
      });
    });

    // Camera presets
    btnCamDefault.addEventListener('click', () => setCameraPreset('default'));
    btnCamOverhead.addEventListener('click', () => setCameraPreset('overhead'));
    btnCamClose.addEventListener('click', () => setCameraPreset('close'));
  }

  // ══════════════════════════════════════════════
  //  RENDER LOOP & RESIZE
  // ══════════════════════════════════════════════
  function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // Subtle deck hover animation
    if (deckMesh) {
      deckMesh.position.y = 0.1 + Math.sin(performance.now() * 0.001) * 0.03;
    }

    renderer.render(scene, camera);
  }

  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  // ══════════════════════════════════════════════
  //  INIT
  // ══════════════════════════════════════════════
  document.addEventListener('DOMContentLoaded', () => {
    initThree();
    setupEventListeners();
    updateHUD();
  });

})();
