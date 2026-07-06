/**
 * CineAHO 3D Catan Board Game
 * Built with Three.js (r128) and OrbitControls
 */

// ==========================================
// 1. CONSTANTS & GAME CONFIG
// ==========================================
const TERRAIN_TYPES = {
  WOOD: { name: 'wood', color: 0x2e7d32, text: '목재', icon: 'fa-tree', tileColor: 0x1b5e20, modelColor: 0x2e7d32 },
  BRICK: { name: 'brick', color: 0xc62828, text: '점토', icon: 'fa-cubes', tileColor: 0xb71c1c, modelColor: 0xd32f2f },
  SHEEP: { name: 'sheep', color: 0x7cb342, text: '양고기', icon: 'fa-egg', tileColor: 0x558b2f, modelColor: 0x8bc34a },
  WHEAT: { name: 'wheat', color: 0xfbc02d, text: '밀', icon: 'fa-wheat-awn', tileColor: 0xf9a825, modelColor: 0xffeb3b },
  ORE: { name: 'ore', color: 0x78909c, text: '철광석', icon: 'fa-gem', tileColor: 0x37474f, modelColor: 0x90a4ae },
  DESERT: { name: 'desert', color: 0xd7ccc8, text: '사막', icon: 'fa-sun', tileColor: 0xefebe9, modelColor: 0xe0a96d }
};

const DEV_CARDS = {
  KNIGHT: { type: 'knight', name: '기사', desc: '도둑을 이동하고, 도둑이 도달한 타일에 인접한 마을 소유자 한 명에게서 자원을 1장 훔칩니다.' },
  VP: { type: 'vp', name: '승점 카드', desc: '이 카드를 보유하면 즉시 승점이 1점 증가합니다.' },
  YOP: { type: 'yop', name: '풍요의 해', desc: '원하는 자원 카드 2장을 은행에서 공짜로 가져옵니다.' },
  RB: { type: 'rb', name: '도로 건설', desc: '자원 소모 없이 2개의 도로를 연속으로 배치합니다.' },
  MONOPOLY: { type: 'monopoly', name: '독점', desc: '원하는 자원 1종류를 선언하여 모든 상대 플레이어로부터 해당 카드를 전부 빼앗습니다.' }
};

const DICE_PROBABILITIES = {
  2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1
};

// ==========================================
// 2. GLOBAL GAME STATE
// ==========================================
let gameState = {
  players: [],
  currentPlayerIdx: 0,
  dice: [1, 1],
  diceRolled: false,
  phase: 'SETUP', // 'SETUP' (마을1/도로1 -> 마을2/도로2), 'MAIN'
  setupRound: 0,   // 0: 정방향(1->4), 1: 역방향(4->1)
  setupTurnIdx: 0, // setup 단계 플레이어 진행 순서
  robberHexIdx: -1,
  longestRoadPlayer: -1,
  longestRoadCount: 0,
  largestArmyPlayer: -1,
  largestArmyCount: 0,
  winnerIdx: -1,
  
  // Interaction states
  buildMode: null,  // 'road' | 'settlement' | 'city' | null
  roadBuildingCount: 0, // 'RB' 카드 사용 시 2개 지어야 함
  robberMovingMode: false,
  isAIProcessing: false
};

let playerColors = [
  { name: 'Red', color: '#ff4b5c', hex: 0xff4b5c, cssClass: 'indicator-red' },
  { name: 'Blue', color: '#00d2fc', hex: 0x00d2fc, cssClass: 'indicator-blue' },
  { name: 'Orange', color: '#ff8f00', hex: 0xff8f00, cssClass: 'indicator-orange' },
  { name: 'Green', color: '#00e676', hex: 0x00e676, cssClass: 'indicator-green' }
];

// Board Model Data
let board = {
  hexes: [],
  vertices: [],
  edges: [],
  ports: []
};

// Three.js Render Variables
let scene, camera, renderer, controls;
let hexMeshes = [];
let vertexIndicatorMeshes = [];
let edgeIndicatorMeshes = [];
let builtBuildingMeshes = {
  roads: {},
  settlements: {},
  cities: {}
};
let robberMesh = null;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let interactiveTargets = [];
let highlightedTarget = null;
const HEX_SIZE = 10;
const HEX_DEPTH = 3;

// UI elements
let logConsole, stateBannerText, countWood, countBrick, countSheep, countWheat, countOre, btnRoll, btnEnd;
let btnBuildRoad, btnBuildSettlement, btnBuildCity, btnBuyDevcard, btnOpenTrade, btnOpenDevcards, devcardsCount;

// ==========================================
// 3. BOARD MATHEMATICS & INITIALIZATION
// ==========================================
function initBoardStructure() {
  board.hexes = [];
  board.vertices = [];
  board.edges = [];
  board.ports = [];

  // Axial grid coordinates for 19 hexes (q, r)
  const hexCoords = [
    { q: 0, r: 0 },
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 }, { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 },
    { q: 2, r: 0 }, { q: 2, r: -1 }, { q: 2, r: -2 }, { q: 1, r: -2 }, { q: 0, r: -2 }, { q: -1, r: -1 },
    { q: -2, r: 0 }, { q: -2, r: 1 }, { q: -2, r: 2 }, { q: -1, r: 2 }, { q: 0, r: 2 }, { q: 1, r: 1 }
  ];

  // Catan Terrain Types (Standard 19 tiles)
  let terrains = [
    TERRAIN_TYPES.WOOD, TERRAIN_TYPES.WOOD, TERRAIN_TYPES.WOOD, TERRAIN_TYPES.WOOD,
    TERRAIN_TYPES.SHEEP, TERRAIN_TYPES.SHEEP, TERRAIN_TYPES.SHEEP, TERRAIN_TYPES.SHEEP,
    TERRAIN_TYPES.WHEAT, TERRAIN_TYPES.WHEAT, TERRAIN_TYPES.WHEAT, TERRAIN_TYPES.WHEAT,
    TERRAIN_TYPES.BRICK, TERRAIN_TYPES.BRICK, TERRAIN_TYPES.BRICK,
    TERRAIN_TYPES.ORE, TERRAIN_TYPES.ORE, TERRAIN_TYPES.ORE,
    TERRAIN_TYPES.DESERT
  ];
  
  // Standard Catan Number Tokens (Desert gets no token)
  let numbers = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];

  // Shuffle Terrains and Numbers (Fisher-Yates)
  shuffleArray(terrains);
  shuffleArray(numbers);

  // Make sure Desert gets no number token
  let numIdx = 0;
  hexCoords.forEach((coord, idx) => {
    let terrain = terrains[idx];
    let number = 0;
    if (terrain.name === 'desert') {
      gameState.robberHexIdx = idx; // Robber starts on Desert
    } else {
      number = numbers[numIdx++];
    }

    // Pointy-topped hexagon world coordinates
    let x = HEX_SIZE * Math.sqrt(3) * (coord.q + coord.r / 2);
    let z = HEX_SIZE * 1.5 * coord.r;

    board.hexes.push({
      id: idx,
      q: coord.q,
      r: coord.r,
      x: x,
      z: z,
      terrain: terrain.name,
      number: number,
      vertexIndices: [],
      edgeIndices: []
    });
  });

  // Generate Unique Vertices & Edges
  let tempVertices = [];
  board.hexes.forEach(hex => {
    let hexCorners = [];
    for (let i = 0; i < 6; i++) {
      let angle = (Math.PI / 180) * (60 * i + 30);
      let vx = hex.x + HEX_SIZE * Math.cos(angle);
      let vz = hex.z + HEX_SIZE * Math.sin(angle);
      hexCorners.push({ x: vx, z: vz });
    }

    hexCorners.forEach(corner => {
      // Find matching vertex in global list
      let existVIdx = tempVertices.findIndex(v => Math.hypot(v.x - corner.x, v.z - corner.z) < 1.0);
      if (existVIdx === -1) {
        tempVertices.push({
          id: tempVertices.length,
          x: corner.x,
          z: corner.z,
          hexIndices: [hex.id],
          building: null, // {type: 'settlement'|'city', player: 0..3}
          adjacentEdges: [],
          adjacentVertices: []
        });
        hex.vertexIndices.push(tempVertices.length - 1);
      } else {
        if (!tempVertices[existVIdx].hexIndices.includes(hex.id)) {
          tempVertices[existVIdx].hexIndices.push(hex.id);
        }
        hex.vertexIndices.push(existVIdx);
      }
    });
  });
  board.vertices = tempVertices;

  // Generate Unique Edges
  board.hexes.forEach(hex => {
    for (let i = 0; i < 6; i++) {
      let v1 = hex.vertexIndices[i];
      let v2 = hex.vertexIndices[(i + 1) % 6];
      let eMin = Math.min(v1, v2);
      let eMax = Math.max(v1, v2);

      let existEIdx = board.edges.findIndex(e => e.v1 === eMin && e.v2 === eMax);
      if (existEIdx === -1) {
        let edgeId = board.edges.length;
        board.edges.push({
          id: edgeId,
          v1: eMin,
          v2: eMax,
          hexIndices: [hex.id],
          road: null // player index (0..3)
        });
        hex.edgeIndices.push(edgeId);

        // Bind edge to vertices adjacency
        board.vertices[eMin].adjacentEdges.push(edgeId);
        board.vertices[eMax].adjacentEdges.push(edgeId);
        
        if (!board.vertices[eMin].adjacentVertices.includes(eMax)) board.vertices[eMin].adjacentVertices.push(eMax);
        if (!board.vertices[eMax].adjacentVertices.includes(eMin)) board.vertices[eMax].adjacentVertices.push(eMin);
      } else {
        if (!board.edges[existEIdx].hexIndices.includes(hex.id)) {
          board.edges[existEIdx].hexIndices.push(hex.id);
        }
        hex.edgeIndices.push(existEIdx);
      }
    }
  });

  // Generate Ports at the Rim
  // Ports connect to two adjacent rim vertices
  // Find vertices belonging to only 1 or 2 hexes (outer border)
  const outerVertices = board.vertices.filter(v => v.hexIndices.length <= 2);
  // Pick specific pairs of adjacent outer vertices to designate as ports
  const portSelections = [
    { v1: 0, v2: 1, type: '3:1' },
    { v1: 3, v2: 4, type: 'wood' },
    { v1: 14, v2: 15, type: '3:1' },
    { v1: 25, v2: 26, type: 'brick' },
    { v1: 37, v2: 38, type: '3:1' },
    { v1: 47, v2: 48, type: 'sheep' },
    { v1: 52, v2: 53, type: '3:1' },
    { v1: 41, v2: 42, type: 'wheat' },
    { v1: 29, v2: 30, type: 'ore' }
  ];

  portSelections.forEach((port, idx) => {
    // Find actual matched vertices indices by finding closest matching coordinates
    // To make it robust, we map ports to the vertices closest to these indexes
    if (board.vertices[port.v1] && board.vertices[port.v2]) {
      board.ports.push({
        id: idx,
        v1: port.v1,
        v2: port.v2,
        type: port.type
      });
    }
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// ==========================================
// 4. THREE.JS VIEWPORT & RENDERING
// ==========================================
function initThreeJS() {
  const container = document.getElementById('canvas-container');
  const width = container.clientWidth;
  const height = container.clientHeight;

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(gameState.theme === 'light' ? 0xe2e8f0 : 0x070b13);

  // Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 70, 75);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.innerHTML = ''; // Clear loading spinner
  container.appendChild(renderer.domElement);

  // OrbitControls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2.1; // Limit below floor
  controls.minDistance = 30;
  controls.maxDistance = 180;
  controls.target.set(0, -2, 0);

  // Lighting
  const ambientLight = new THREE.HemisphereLight(0xffffff, 0x111122, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(40, 90, 50);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 200;
  const d = 50;
  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;
  scene.add(dirLight);

  // Water Plane
  const waterGeo = new THREE.CylinderGeometry(60, 60, 2, 32);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0d47a1,
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.8
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = -2;
  water.receiveShadow = true;
  scene.add(water);

  // Draw 3D Board elements
  create3DBoard();

  // Resize Listener
  window.addEventListener('resize', onWindowResize);
  
  // Click Event Listener
  renderer.domElement.addEventListener('pointerdown', onDocumentPointerDown);
  renderer.domElement.addEventListener('pointermove', onDocumentPointerMove);

  // Start loop
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  const container = document.getElementById('canvas-container');
  if (!container) return;
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

// ==========================================
// 5. 3D MODELS GENERATION
// ==========================================
function create3DBoard() {
  board.hexes.forEach(hex => {
    // 1. Create Hexagon Mesh
    const terrainInfo = TERRAIN_TYPES[hex.terrain.toUpperCase()];
    
    // Create 2D Hexagon Shape
    const hexShape = new THREE.Shape();
    for (let i = 0; i < 6; i++) {
      let angle = (Math.PI / 180) * (60 * i + 30);
      let x = HEX_SIZE * Math.cos(angle);
      let y = HEX_SIZE * Math.sin(angle);
      if (i === 0) hexShape.moveTo(x, y);
      else hexShape.lineTo(x, y);
    }
    hexShape.closePath();

    // Extrude Shape into 3D Hexagon
    const extrudeSettings = {
      depth: HEX_DEPTH,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.4,
      bevelThickness: 0.4
    };
    const geom = new THREE.ExtrudeGeometry(hexShape, extrudeSettings);
    
    // Rotate to lie flat in XZ plane
    geom.rotateX(Math.PI / 2);
    
    // Adjust texture/materials
    const hexMat = new THREE.MeshStandardMaterial({
      color: terrainInfo.tileColor,
      roughness: 0.75,
      metalness: 0.15
    });
    
    const hexMesh = new THREE.Mesh(geom, hexMat);
    hexMesh.position.set(hex.x, 0, hex.z);
    hexMesh.castShadow = true;
    hexMesh.receiveShadow = true;
    hexMesh.userData = { type: 'hex', id: hex.id };
    
    scene.add(hexMesh);
    hexMeshes.push(hexMesh);

    // 2. Add 3D Terrain Features (Decorative)
    add3DTerrainDecorations(hex, terrainInfo);

    // 3. Add 3D Number Tokens
    if (hex.number > 0) {
      create3DNumberToken(hex);
    }
  });

  // 4. Create Robber Mesh
  create3DRobber();

  // 5. Build Port Ships/Tokens
  create3DPorts();
}

function add3DTerrainDecorations(hex, terrain) {
  const group = new THREE.Group();
  group.position.set(hex.x, HEX_DEPTH / 2, hex.z);
  
  if (terrain.name === 'wood') {
    // Forest: Pine Trees
    const treePositions = [
      { x: -3, z: -2 }, { x: 3, z: 2 }, { x: -2, z: 3 }, { x: 2, z: -3 }, { x: 0, z: 0 }
    ];
    treePositions.forEach(p => {
      const tree = new THREE.Group();
      tree.position.set(p.x, 0.4, p.z);
      
      const trunkGeo = new THREE.CylinderGeometry(0.3, 0.3, 1, 6);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.5;
      tree.add(trunk);

      const leavesGeo = new THREE.ConeGeometry(1.2, 3, 6);
      const leavesMat = new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.8 });
      const leaves = new THREE.Mesh(leavesGeo, leavesMat);
      leaves.position.y = 2.2;
      leaves.castShadow = true;
      tree.add(leaves);
      
      group.add(tree);
    });
  } else if (terrain.name === 'brick') {
    // Hills: Rocky Clays / Small Mounds
    const hillGeo = new THREE.DodecahedronGeometry(2, 0);
    const hillMat = new THREE.MeshStandardMaterial({ color: 0xb71c1c, roughness: 0.8 });
    
    const hill1 = new THREE.Mesh(hillGeo, hillMat);
    hill1.position.set(-2, 0.5, -1);
    hill1.scale.set(1.2, 0.8, 1);
    hill1.castShadow = true;
    group.add(hill1);
    
    const hill2 = new THREE.Mesh(hillGeo, hillMat);
    hill2.position.set(2, 0.3, 1.5);
    hill2.scale.set(0.9, 0.7, 0.9);
    hill2.castShadow = true;
    group.add(hill2);
  } else if (terrain.name === 'sheep') {
    // Pastures: Sheep Spheres & Grassy clumps
    const sheepPositions = [
      { x: -2.5, z: 1.5 }, { x: 2, z: -2 }, { x: 0.5, z: 2 }
    ];
    sheepPositions.forEach(p => {
      const sheep = new THREE.Group();
      sheep.position.set(p.x, 0.3, p.z);
      
      const bodyGeo = new THREE.SphereGeometry(0.6, 8, 8);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.9 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.3;
      body.castShadow = true;
      sheep.add(body);
      
      const headGeo = new THREE.SphereGeometry(0.3, 8, 8);
      const headMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(0.6, 0.5, 0);
      sheep.add(head);
      
      group.add(sheep);
    });
  } else if (terrain.name === 'wheat') {
    // Fields: Straw Clumps
    const wheatPositions = [
      { x: -3, z: -3 }, { x: -3, z: 1 }, { x: 1, z: -3 },
      { x: 3, z: 3 }, { x: 3, z: -1 }, { x: -1, z: 3 }, { x: 0, z: 0 }
    ];
    wheatPositions.forEach(p => {
      const stalkGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.6, 4);
      const stalkMat = new THREE.MeshStandardMaterial({ color: 0xfbc02d, roughness: 0.7 });
      
      const bundle = new THREE.Group();
      bundle.position.set(p.x, 0.8, p.z);
      
      for(let i=0; i<3; i++) {
        const s = new THREE.Mesh(stalkGeo, stalkMat);
        s.rotation.z = 0.2 * (i - 1);
        s.rotation.x = 0.1 * (i - 1);
        s.castShadow = true;
        bundle.add(s);
      }
      group.add(bundle);
    });
  } else if (terrain.name === 'ore') {
    // Mountains: Pyramidal Stone Peaks
    const mtnGeom = new THREE.ConeGeometry(3, 5, 4);
    const mtnMat = new THREE.MeshStandardMaterial({ color: 0x455a64, roughness: 0.85, metalness: 0.2 });
    
    const peak1 = new THREE.Mesh(mtnGeom, mtnMat);
    peak1.position.set(-2, 2.3, -1);
    peak1.scale.set(1.3, 1, 1.3);
    peak1.castShadow = true;
    group.add(peak1);

    const snowGeom = new THREE.ConeGeometry(1.6, 2, 4);
    const snowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
    const snow1 = new THREE.Mesh(snowGeom, snowMat);
    snow1.position.set(-2, 3.8, -1);
    snow1.scale.set(1.3, 1, 1.3);
    group.add(snow1);

    const peak2 = new THREE.Mesh(mtnGeom, mtnMat);
    peak2.position.set(2.5, 1.3, 2);
    peak2.castShadow = true;
    group.add(peak2);
  } else if (terrain.name === 'desert') {
    // Cacti / Sand clumps
    const cactusGeo = new THREE.CylinderGeometry(0.3, 0.3, 2, 6);
    const cactusMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.9 });
    
    const cactus = new THREE.Mesh(cactusGeo, cactusMat);
    cactus.position.set(2, 1, -1);
    cactus.castShadow = true;
    group.add(cactus);

    const armGeo = new THREE.CylinderGeometry(0.2, 0.2, 1, 6);
    const arm1 = new THREE.Mesh(armGeo, cactusMat);
    arm1.position.set(2.4, 1.3, -1);
    arm1.rotation.z = Math.PI / 2.5;
    group.add(arm1);
  }
  
  scene.add(group);
}

function create3DNumberToken(hex) {
  // Token Disk
  const tokenGeo = new THREE.CylinderGeometry(2, 2, 0.3, 16);
  const tokenMat = new THREE.MeshStandardMaterial({ color: 0xfffdd0, roughness: 0.5 });
  const tokenMesh = new THREE.Mesh(tokenGeo, tokenMat);
  tokenMesh.position.set(hex.x, 1.6, hex.z);
  tokenMesh.receiveShadow = true;
  scene.add(tokenMesh);

  // Draw 2D text into a dynamic Canvas texture
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#fffdd0';
  ctx.fillRect(0, 0, 64, 64);
  
  // Number
  ctx.fillStyle = (hex.number === 6 || hex.number === 8) ? '#ff0000' : '#000000';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(hex.number.toString(), 32, 28);
  
  // Probability Dots
  let dots = DICE_PROBABILITIES[hex.number];
  let dotStr = '.'.repeat(dots);
  ctx.font = 'bold 18px monospace';
  ctx.fillText(dotStr, 32, 50);

  const texture = new THREE.CanvasTexture(canvas);
  const labelGeo = new THREE.PlaneGeometry(3, 3);
  const labelMat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
  });
  const labelMesh = new THREE.Mesh(labelGeo, labelMat);
  labelMesh.position.set(hex.x, 1.76, hex.z);
  labelMesh.rotation.x = -Math.PI / 2;
  labelMesh.rotation.z = Math.PI; // Flip orientation
  scene.add(labelMesh);
}

function create3DRobber() {
  const robberGeo = new THREE.CylinderGeometry(0.6, 1.2, 3, 12);
  const robberMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3, metalness: 0.7 });
  robberMesh = new THREE.Mesh(robberGeo, robberMat);
  
  const headGeo = new THREE.SphereGeometry(0.8, 12, 12);
  const head = new THREE.Mesh(headGeo, robberMat);
  head.position.y = 1.8;
  robberMesh.add(head);

  robberMesh.castShadow = true;
  scene.add(robberMesh);

  // Position Robber on current hex
  updateRobber3DPosition();
}

function updateRobber3DPosition() {
  if (gameState.robberHexIdx !== -1 && robberMesh) {
    const targetHex = board.hexes[gameState.robberHexIdx];
    robberMesh.position.set(targetHex.x, 2.5, targetHex.z);
  }
}

function create3DPorts() {
  board.ports.forEach(port => {
    // Position port midway between the two vertices
    const v1 = board.vertices[port.v1];
    const v2 = board.vertices[port.v2];
    let px = (v1.x + v2.x) / 2;
    let pz = (v1.z + v2.z) / 2;

    // Push slightly outward from center of board
    const dist = Math.hypot(px, pz);
    px = px * (1.18);
    pz = pz * (1.18);

    // Render a small sailboat / token
    const boatGroup = new THREE.Group();
    boatGroup.position.set(px, -1, pz);
    
    // Hull
    const hullGeo = new THREE.BoxGeometry(2.5, 0.8, 1.2);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.rotation.y = Math.atan2(v2.x - v1.x, v2.z - v1.z);
    boatGroup.add(hull);

    // Mast & Sail
    const mastGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.5);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.y = 1.3;
    boatGroup.add(mast);

    // Sail
    const sailGeo = new THREE.ConeGeometry(1, 2, 4);
    const sailMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sail = new THREE.Mesh(sailGeo, sailMat);
    sail.position.set(0.3, 1.8, 0);
    boatGroup.add(sail);

    // Port Label Plate
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 64, 32);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(port.type, 32, 16);

    const texture = new THREE.CanvasTexture(canvas);
    const labelGeo = new THREE.PlaneGeometry(2.5, 1.25);
    const labelMat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.position.set(0, 3, 0);
    label.rotation.y = Math.atan2(px, pz); // Face center of board
    boatGroup.add(label);

    scene.add(boatGroup);
  });
}

// ==========================================
// 6. BUILD INTERACTION INTERFACE (3D TRIGGERS)
// ==========================================
function clearIndicators() {
  vertexIndicatorMeshes.forEach(m => scene.remove(m));
  vertexIndicatorMeshes = [];
  edgeIndicatorMeshes.forEach(m => scene.remove(m));
  edgeIndicatorMeshes = [];
  interactiveTargets = [];
  highlightedTarget = null;
}

function showBuildingIndicators() {
  clearIndicators();

  const activePlayer = gameState.players[gameState.currentPlayerIdx];
  if (!activePlayer || activePlayer.isAI || gameState.isAIProcessing) return; // Only show for human

  const player = activePlayer;
  const playerIdx = gameState.currentPlayerIdx;

  if (gameState.buildMode === 'settlement') {
    // Show valid vertices
    board.vertices.forEach(v => {
      if (isValidSettlementPosition(v.id, playerIdx)) {
        const sphereGeo = new THREE.SphereGeometry(1.6, 16, 16);
        const sphereMat = new THREE.MeshBasicMaterial({
          color: 0xffff00,
          transparent: true,
          opacity: 0.5
        });
        const mesh = new THREE.Mesh(sphereGeo, sphereMat);
        mesh.position.set(v.x, 1, v.z);
        mesh.userData = { type: 'trigger-vertex', id: v.id };
        scene.add(mesh);
        vertexIndicatorMeshes.push(mesh);
        interactiveTargets.push(mesh);
      }
    });
  } else if (gameState.buildMode === 'city') {
    // Show upgradeable settlements
    board.vertices.forEach(v => {
      if (v.building && v.building.type === 'settlement' && v.building.player === playerIdx) {
        const cylGeo = new THREE.CylinderGeometry(2, 2, 2.5, 16);
        const cylMat = new THREE.MeshBasicMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0.5
        });
        const mesh = new THREE.Mesh(cylGeo, cylMat);
        mesh.position.set(v.x, 1.2, v.z);
        mesh.userData = { type: 'trigger-vertex-city', id: v.id };
        scene.add(mesh);
        vertexIndicatorMeshes.push(mesh);
        interactiveTargets.push(mesh);
      }
    });
  } else if (gameState.buildMode === 'road') {
    // Show valid edges
    board.edges.forEach(e => {
      if (isValidRoadPosition(e.id, playerIdx)) {
        const v1 = board.vertices[e.v1];
        const v2 = board.vertices[e.v2];
        const len = Math.hypot(v2.x - v1.x, v2.z - v1.z);
        
        const barGeo = new THREE.BoxGeometry(1.4, 0.8, len - 0.4);
        const barMat = new THREE.MeshBasicMaterial({
          color: 0xffff00,
          transparent: true,
          opacity: 0.5
        });
        const mesh = new THREE.Mesh(barGeo, barMat);
        
        // Position mid-way
        mesh.position.set((v1.x + v2.x) / 2, 0.6, (v1.z + v2.z) / 2);
        // Rotate along edge direction
        mesh.rotation.y = Math.atan2(v2.x - v1.x, v2.z - v1.z);
        mesh.userData = { type: 'trigger-edge', id: e.id };
        
        scene.add(mesh);
        edgeIndicatorMeshes.push(mesh);
        interactiveTargets.push(mesh);
      }
    });
  } else if (gameState.robberMovingMode) {
    // Highlight all 19 hexes except the current robber one
    hexMeshes.forEach(m => {
      if (m.userData.id !== gameState.robberHexIdx) {
        // We will make the hexes themselves interactive targets
        m.userData.isRobberTarget = true;
        interactiveTargets.push(m);
      }
    });
  }
}

function onDocumentPointerMove(event) {
  const container = document.getElementById('canvas-container');
  if (!container) return;
  
  // Calculate mouse position in normalized device coordinates (-1 to +1)
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(interactiveTargets, true);

  if (intersects.length > 0) {
    const target = intersects[0].object;
    if (highlightedTarget !== target) {
      if (highlightedTarget) {
        resetTargetHighlight(highlightedTarget);
      }
      highlightedTarget = target;
      highlightTarget(highlightedTarget);
    }
  } else {
    if (highlightedTarget) {
      resetTargetHighlight(highlightedTarget);
      highlightedTarget = null;
    }
  }
}

function highlightTarget(obj) {
  if (obj.userData.type && obj.userData.type.startsWith('trigger')) {
    obj.material.opacity = 0.85;
    obj.scale.set(1.15, 1.15, 1.15);
  } else if (obj.userData.type === 'hex' && obj.userData.isRobberTarget) {
    obj.material.emissive = new THREE.Color(0xff0000);
    obj.material.emissiveIntensity = 0.35;
  }
}

function resetTargetHighlight(obj) {
  if (obj.userData.type && obj.userData.type.startsWith('trigger')) {
    obj.material.opacity = 0.5;
    obj.scale.set(1, 1, 1);
  } else if (obj.userData.type === 'hex') {
    obj.material.emissive = new THREE.Color(0x000000);
    obj.material.emissiveIntensity = 0;
  }
}

function onDocumentPointerDown(event) {
  if (interactiveTargets.length === 0) return;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(interactiveTargets, true);

  if (intersects.length > 0) {
    const obj = intersects[0].object;
    
    const activePlayerIdx = gameState.currentPlayerIdx;
    if (obj.userData.type === 'trigger-vertex') {
      // Build Settlement
      buildSettlement(obj.userData.id, activePlayerIdx);
      endBuildMode();
      
      // If in setup phase, handle setup flow
      if (gameState.phase === 'SETUP') {
        handleHumanSetupPlacementCompleted();
      }
    } else if (obj.userData.type === 'trigger-vertex-city') {
      // Upgrade to City
      buildCity(obj.userData.id, activePlayerIdx);
      endBuildMode();
    } else if (obj.userData.type === 'trigger-edge') {
      // Build Road
      buildRoad(obj.userData.id, activePlayerIdx);
      
      // If we are in Road Building card phase and have 1 road remaining:
      if (gameState.roadBuildingCount > 1) {
        gameState.roadBuildingCount--;
        addLog(`발전 카드: 첫 번째 도로를 건설했습니다. 두 번째 도로를 건설하세요.`, 'build');
        showBuildingIndicators(); // Refresh road indicators
      } else {
        gameState.roadBuildingCount = 0;
        endBuildMode();
        
        // If in setup phase, handle setup flow
        if (gameState.phase === 'SETUP') {
          handleHumanSetupPlacementCompleted();
        }
      }
    } else if (obj.userData.type === 'hex' && obj.userData.isRobberTarget) {
      // Move robber here
      moveRobber(obj.userData.id);
    }
  }
}

function endBuildMode() {
  gameState.buildMode = null;
  document.querySelectorAll('.btn-build').forEach(b => b.classList.remove('active-build'));
  clearIndicators();
  syncUI();
}

// ==========================================
// 7. BUILD MESH REPRESENTATIONS
// ==========================================
function render3DBuilding(vertexId, type, playerIdx) {
  const v = board.vertices[vertexId];
  const color = playerColors[playerIdx].hex;

  // Clear existing if any (like settlement upgraded to city)
  if (builtBuildingMeshes.settlements[vertexId]) {
    scene.remove(builtBuildingMeshes.settlements[vertexId]);
    delete builtBuildingMeshes.settlements[vertexId];
  }

  const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.4, metalness: 0.1 });

  if (type === 'settlement') {
    // Village: Small 3D House (Box + Roof)
    const houseGroup = new THREE.Group();
    
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.6), mat);
    body.position.y = 0.6;
    body.castShadow = true;
    houseGroup.add(body);

    const roofGeo = new THREE.ConeGeometry(1.3, 1, 4);
    roofGeo.rotateY(Math.PI / 4); // Align with box
    const roof = new THREE.Mesh(roofGeo, mat);
    roof.position.y = 1.7;
    roof.castShadow = true;
    houseGroup.add(roof);

    houseGroup.position.set(v.x, 0.4, v.z);
    scene.add(houseGroup);
    builtBuildingMeshes.settlements[vertexId] = houseGroup;
    
  } else if (type === 'city') {
    // City: Larger 3D Tower (Stacked blocks)
    const cityGroup = new THREE.Group();
    
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.5, 2.2), mat);
    base.position.y = 0.75;
    base.castShadow = true;
    cityGroup.add(base);

    const tower = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.6, 1.4), mat);
    tower.position.set(0.4, 1.8, 0.4);
    tower.castShadow = true;
    cityGroup.add(tower);

    cityGroup.position.set(v.x, 0.4, v.z);
    scene.add(cityGroup);
    builtBuildingMeshes.cities[vertexId] = cityGroup;
  }
}

function render3DRoad(edgeId, playerIdx) {
  const e = board.edges[edgeId];
  const v1 = board.vertices[e.v1];
  const v2 = board.vertices[e.v2];
  const color = playerColors[playerIdx].hex;

  const len = Math.hypot(v2.x - v1.x, v2.z - v1.z);
  const roadMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.6, metalness: 0.1 });
  const roadGeo = new THREE.BoxGeometry(0.8, 0.6, len - 0.8);
  const roadMesh = new THREE.Mesh(roadGeo, roadMat);

  roadMesh.position.set((v1.x + v2.x) / 2, 0.5, (v1.z + v2.z) / 2);
  roadMesh.rotation.y = Math.atan2(v2.x - v1.x, v2.z - v1.z);
  roadMesh.castShadow = true;
  
  scene.add(roadMesh);
  builtBuildingMeshes.roads[edgeId] = roadMesh;
}

// ==========================================
// 8. GAME RULES ENGINE & STATE LOGIC
// ==========================================
function initPlayers(playersConfig) {
  gameState.players = [];
  
  playersConfig.forEach((pConf, idx) => {
    gameState.players.push({
      id: idx,
      name: pConf.name,
      color: playerColors[idx].color,
      cssClass: playerColors[idx].cssClass,
      isAI: pConf.isAI,
      resources: { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 },
      devCards: [],
      knightsPlayed: 0,
      victoryPoints: 0,
      settlementsLeft: 5,
      citiesLeft: 4,
      roadsLeft: 15
    });
  });
}

// Validation Functions
function isValidSettlementPosition(vertexId, playerIdx) {
  const v = board.vertices[vertexId];
  if (v.building) return false;

  // Distance Rule: check if any adjacent vertices have buildings
  for (let adjId of v.adjacentVertices) {
    if (board.vertices[adjId].building) return false;
  }

  // Setup Phase: no road connection required
  if (gameState.phase === 'SETUP') return true;

  // Main Phase: must connect to owned roads
  let connectsToOwnRoad = false;
  for (let edgeId of v.adjacentEdges) {
    if (board.edges[edgeId].road === playerIdx) {
      connectsToOwnRoad = true;
      break;
    }
  }
  return connectsToOwnRoad;
}

function isValidRoadPosition(edgeId, playerIdx) {
  const e = board.edges[edgeId];
  if (e.road !== null) return false;

  // Setup Phase: must attach to the newly placed settlement
  if (gameState.phase === 'SETUP') {
    // Must touch the last built settlement by the current player
    const lastSettlementId = getLastSettlementBuiltInSetup(playerIdx);
    return (e.v1 === lastSettlementId || e.v2 === lastSettlementId);
  }

  // Main Phase: must attach to owned roads or owned buildings
  const v1 = board.vertices[e.v1];
  const v2 = board.vertices[e.v2];

  // Directly touches owned settlement/city
  if ((v1.building && v1.building.player === playerIdx) || (v2.building && v2.building.player === playerIdx)) {
    return true;
  }

  // Touches owned road (and path is not blocked by an enemy building)
  let connectsV1 = false;
  if (!v1.building || v1.building.player === playerIdx) {
    for (let adjEdge of v1.adjacentEdges) {
      if (adjEdge !== edgeId && board.edges[adjEdge].road === playerIdx) connectsV1 = true;
    }
  }
  
  let connectsV2 = false;
  if (!v2.building || v2.building.player === playerIdx) {
    for (let adjEdge of v2.adjacentEdges) {
      if (adjEdge !== edgeId && board.edges[adjEdge].road === playerIdx) connectsV2 = true;
    }
  }

  return connectsV1 || connectsV2;
}

function getLastSettlementBuiltInSetup(playerIdx) {
  // Return the vertex ID of the player's settlement placed in this turn
  // In setup phase, players place 1 settlement at a time.
  // Find vertices where player has a settlement
  let playerSettlements = [];
  board.vertices.forEach(v => {
    if (v.building && v.building.type === 'settlement' && v.building.player === playerIdx) {
      playerSettlements.push({ id: v.id, timestamp: v.building.timestamp || 0 });
    }
  });
  if (playerSettlements.length === 0) return -1;
  playerSettlements.sort((a,b) => b.timestamp - a.timestamp);
  return playerSettlements[0].id;
}

// Action Functions
function buildSettlement(vertexId, playerIdx) {
  const v = board.vertices[vertexId];
  const player = gameState.players[playerIdx];
  
  v.building = {
    type: 'settlement',
    player: playerIdx,
    timestamp: Date.now()
  };
  
  player.settlementsLeft--;
  
  // Deduct cost if not in Setup
  if (gameState.phase === 'MAIN') {
    player.resources.wood--;
    player.resources.brick--;
    player.resources.sheep--;
    player.resources.wheat--;
  }

  // Draw house in 3D
  render3DBuilding(vertexId, 'settlement', playerIdx);

  addLog(`${player.name}님이 마을을 건설했습니다.`, 'build');
  
  recalculateVictoryPoints();
  syncUI();
}

function buildCity(vertexId, playerIdx) {
  const v = board.vertices[vertexId];
  const player = gameState.players[playerIdx];

  v.building.type = 'city';
  player.settlementsLeft++; // Refund settlement
  player.citiesLeft--;

  // Deduct cost
  player.resources.wheat -= 2;
  player.resources.ore -= 3;

  // Draw city in 3D
  render3DBuilding(vertexId, 'city', playerIdx);

  addLog(`${player.name}님이 마을을 도시로 업그레이드했습니다.`, 'build');
  
  recalculateVictoryPoints();
  syncUI();
}

function buildRoad(edgeId, playerIdx) {
  const e = board.edges[edgeId];
  const player = gameState.players[playerIdx];

  e.road = playerIdx;
  player.roadsLeft--;

  // Deduct cost if not in Setup/Road Building card
  if (gameState.phase === 'MAIN' && gameState.roadBuildingCount === 0) {
    player.resources.wood--;
    player.resources.brick--;
  }

  // Draw road in 3D
  render3DRoad(edgeId, playerIdx);

  addLog(`${player.name}님이 도로를 건설했습니다.`, 'build');
  
  recalculateLongestRoad();
  recalculateVictoryPoints();
  syncUI();
}

function buyDevelopmentCard(playerIdx) {
  const player = gameState.players[playerIdx];
  
  player.resources.sheep--;
  player.resources.wheat--;
  player.resources.ore--;

  // Draw random dev card
  const types = Object.keys(DEV_CARDS);
  const randomType = types[Math.floor(Math.random() * types.length)];
  const cardTemplate = DEV_CARDS[randomType];

  player.devCards.push({
    type: cardTemplate.type,
    name: cardTemplate.name,
    desc: cardTemplate.desc,
    boughtTurn: getTurnCount() // Mark bought turn so they can't play it immediately
  });

  addLog(`${player.name}님이 발전 카드를 구매했습니다.`, 'build');
  recalculateVictoryPoints();
  syncUI();
}

function getTurnCount() {
  // Dynamic number representing current turns
  return gameState.setupRound; // simple counter
}

// Recalculating Stats
function recalculateVictoryPoints() {
  gameState.players.forEach((player, idx) => {
    let vp = 0;
    
    // Buildings
    board.vertices.forEach(v => {
      if (v.building && v.building.player === idx) {
        vp += (v.building.type === 'settlement') ? 1 : 2;
      }
    });

    // Dev Card VPs
    player.devCards.forEach(c => {
      if (c.type === 'vp') vp++;
    });

    // Longest Road Title
    if (gameState.longestRoadPlayer === idx) {
      vp += 2;
    }

    // Largest Army Title
    if (gameState.largestArmyPlayer === idx) {
      vp += 2;
    }

    player.victoryPoints = vp;

    // Victory Check
    if (vp >= 10 && gameState.winnerIdx === -1) {
      gameState.winnerIdx = idx;
      triggerWinner(idx);
    }
  });
}

function recalculateLongestRoad() {
  let bestCount = 0;
  let bestPlayer = -1;

  gameState.players.forEach((player, playerIdx) => {
    let roadLength = calculatePlayerRoadLength(playerIdx);
    if (roadLength >= 5 && roadLength > bestCount) {
      bestCount = roadLength;
      bestPlayer = playerIdx;
    }
  });

  if (bestPlayer !== -1 && bestPlayer !== gameState.longestRoadPlayer) {
    const prevHolder = gameState.longestRoadPlayer;
    gameState.longestRoadPlayer = bestPlayer;
    gameState.longestRoadCount = bestCount;
    
    const name = gameState.players[bestPlayer].name;
    if (prevHolder !== -1) {
      addLog(`🏆 ${name}님이 최장 도로 타이틀(도로 ${bestCount}개)을 획득했습니다! (이전 소유자: ${gameState.players[prevHolder].name})`, 'victory');
    } else {
      addLog(`🏆 ${name}님이 최장 도로 타이틀(도로 ${bestCount}개)을 최초로 획득했습니다!`, 'victory');
    }
  } else if (bestPlayer !== -1 && bestPlayer === gameState.longestRoadPlayer) {
    gameState.longestRoadCount = bestCount; // update count
  }
}

function calculatePlayerRoadLength(playerIdx) {
  // DFS Search to find longest contiguous road network
  // Find all edges owned by this player
  const playerRoadIds = board.edges.filter(e => e.road === playerIdx).map(e => e.id);
  if (playerRoadIds.length === 0) return 0;

  let maxLen = 0;

  // Helper recursive DFS function
  function dfs(vId, visitedEdges) {
    let best = 0;
    const vertex = board.vertices[vId];
    
    // If blocked by an enemy building, we cannot traverse past it
    if (vertex.building && vertex.building.player !== playerIdx) {
      return 0;
    }

    // Explore adjacent edges
    for (let edgeId of vertex.adjacentEdges) {
      if (playerRoadIds.includes(edgeId) && !visitedEdges.has(edgeId)) {
        visitedEdges.add(edgeId);
        
        // Find other endpoint vertex of this edge
        const edge = board.edges[edgeId];
        const nextVId = (edge.v1 === vId) ? edge.v2 : edge.v1;
        
        const pathLen = 1 + dfs(nextVId, visitedEdges);
        best = Math.max(best, pathLen);
        
        visitedEdges.delete(edgeId); // Backtrack
      }
    }
    return best;
  }

  // Run DFS starting from all vertices connected to this player's roads
  playerRoadIds.forEach(edgeId => {
    const e = board.edges[edgeId];
    maxLen = Math.max(maxLen, dfs(e.v1, new Set([edgeId])));
    maxLen = Math.max(maxLen, dfs(e.v2, new Set([edgeId])));
  });

  return maxLen;
}

function playKnightCard(playerIdx, cardIdx) {
  const player = gameState.players[playerIdx];
  player.devCards.splice(cardIdx, 1);
  player.knightsPlayed++;

  addLog(`${player.name}님이 기사 카드를 활성화했습니다!`, 'robber');

  // Largest Army calculation
  let bestArmy = 0;
  let bestPlayer = -1;
  gameState.players.forEach((p, pIdx) => {
    if (p.knightsPlayed >= 3 && p.knightsPlayed > bestArmy) {
      bestArmy = p.knightsPlayed;
      bestPlayer = pIdx;
    }
  });

  if (bestPlayer !== -1 && bestPlayer !== gameState.largestArmyPlayer) {
    const prevHolder = gameState.largestArmyPlayer;
    gameState.largestArmyPlayer = bestPlayer;
    gameState.largestArmyCount = bestArmy;
    
    const name = gameState.players[bestPlayer].name;
    if (prevHolder !== -1) {
      addLog(`🏆 ${name}님이 최대 군대 타이틀(기사 ${bestArmy}회)을 획득했습니다! (이전 소유자: ${gameState.players[prevHolder].name})`, 'victory');
    } else {
      addLog(`🏆 ${name}님이 최대 군대 타이틀(기사 ${bestArmy}회)을 최초로 획득했습니다!`, 'victory');
    }
  } else if (bestPlayer !== -1 && bestPlayer === gameState.largestArmyPlayer) {
    gameState.largestArmyCount = bestArmy;
  }

  recalculateVictoryPoints();

  // Trigger Robber Movement Mode
  if (!player.isAI) {
    // Human: Trigger visual click on hex
    gameState.robberMovingMode = true;
    updateStateBanner(`${player.name}님, 도둑을 이동시킬 타일을 선택하세요.`);
    showBuildingIndicators();
  } else {
    // AI: Run AI Robber Placement
    runAIRobberLogic(playerIdx);
  }
}

// Trade Ratios
function getPlayerTradeRatio(playerIdx, resourceType) {
  const player = gameState.players[playerIdx];
  
  // Find ports owned by this player
  let ownedPortsTypes = [];
  board.ports.forEach(port => {
    const v1 = board.vertices[port.v1];
    const v2 = board.vertices[port.v2];
    
    const v1Owned = v1.building && v1.building.player === playerIdx;
    const v2Owned = v2.building && v2.building.player === playerIdx;
    
    if (v1Owned || v2Owned) {
      ownedPortsTypes.push(port.type);
    }
  });

  if (ownedPortsTypes.includes(resourceType)) {
    return 2; // 2:1 Specialized Port
  }
  if (ownedPortsTypes.includes('3:1')) {
    return 3; // 3:1 Generic Port
  }
  return 4; // Default Bank 4:1
}

// Resource Distribution
function distributeResources(rollSum) {
  let distributed = false;

  board.hexes.forEach(hex => {
    // Robber blocks production
    if (hex.id === gameState.robberHexIdx) return;

    if (hex.number === rollSum) {
      // Find adjacent vertices
      hex.vertexIndices.forEach(vIdx => {
        const v = board.vertices[vIdx];
        if (v.building) {
          const playerIdx = v.building.player;
          const player = gameState.players[playerIdx];
          const amount = (v.building.type === 'city') ? 2 : 1;
          
          player.resources[hex.terrain] += amount;
          distributed = true;

          const resName = TERRAIN_TYPES[hex.terrain.toUpperCase()].text;
          addLog(`생산: ${player.name}님이 ${resName} ${amount}장을 획득했습니다.`, 'dice');
        }
      });
    }
  });

  if (!distributed) {
    addLog(`생산: 아무도 자원을 획득하지 못했습니다.`, 'dice');
  }
  syncUI();
}

async function handleRobberActivation() {
  addLog(`⚠️ 도둑이 출몰했습니다! (주사위 합 7)`, 'robber');
  
  // 1. Half card discard check
  // For each player, check if cards > 7
  for (let idx = 0; idx < gameState.players.length; idx++) {
    const player = gameState.players[idx];
    let totalCards = Object.values(player.resources).reduce((a,b) => a+b, 0);
    if (totalCards > 7) {
      let needed = Math.floor(totalCards / 2);
      if (!player.isAI) {
        // Human: Open Discard Modal and wait
        await triggerHumanDiscard(needed, idx);
      } else {
        // AI: Auto Discard
        triggerAIDiscard(idx, needed);
      }
    }
  }

  // Run robber placement once discard check finishes
  const currentPlayer = gameState.players[gameState.currentPlayerIdx];
  if (!currentPlayer.isAI) {
    gameState.robberMovingMode = true;
    updateStateBanner(`${currentPlayer.name}님, 도둑을 이동시킬 타일을 선택하세요.`);
    showBuildingIndicators();
  } else {
    runAIRobberLogic(gameState.currentPlayerIdx);
  }
}

// Discard Promise for Human
let resolveDiscard = null;
function triggerHumanDiscard(needed, playerIdx) {
  return new Promise((resolve) => {
    resolveDiscard = resolve;
    
    // Open Modal
    const modal = document.getElementById('discard-modal');
    modal.style.display = 'flex';
    document.getElementById('discard-count-needed').textContent = needed;
    document.getElementById('discard-total-needed').textContent = needed;
    document.getElementById('discard-remain-val').textContent = needed;
    
    // Render selectors
    const container = document.getElementById('discard-selector-container');
    container.innerHTML = '';

    const player = gameState.players[playerIdx];
    let selectedToDiscard = { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 };
    
    Object.keys(player.resources).forEach(res => {
      let limit = player.resources[res];
      if (limit === 0) return;

      const row = document.createElement('div');
      row.className = 'discard-row';
      
      const label = document.createElement('div');
      label.className = 'discard-label';
      label.innerHTML = `<div class="res-icon ${res}"><i class="fa-solid ${TERRAIN_TYPES[res.toUpperCase()].icon}"></i></div> ${TERRAIN_TYPES[res.toUpperCase()].text} (보유: ${limit})`;
      row.appendChild(label);
      
      const ctrl = document.createElement('div');
      ctrl.className = 'discard-controls';
      
      const btnMinus = document.createElement('button');
      btnMinus.className = 'btn-qty';
      btnMinus.textContent = '-';
      btnMinus.disabled = true;
      
      const qty = document.createElement('span');
      qty.className = 'discard-qty-val';
      qty.textContent = '0';
      
      const btnPlus = document.createElement('button');
      btnPlus.className = 'btn-qty';
      btnPlus.textContent = '+';

      btnPlus.onclick = () => {
        let totalSel = Object.values(selectedToDiscard).reduce((a,b)=>a+b, 0);
        if (totalSel < needed && selectedToDiscard[res] < limit) {
          selectedToDiscard[res]++;
          qty.textContent = selectedToDiscard[res];
          btnMinus.disabled = false;
          if (selectedToDiscard[res] === limit) btnPlus.disabled = true;
          
          let newTotal = Object.values(selectedToDiscard).reduce((a,b)=>a+b, 0);
          document.getElementById('discard-remain-val').textContent = needed - newTotal;
          document.getElementById('btn-confirm-discard').disabled = (newTotal !== needed);
        }
      };

      btnMinus.onclick = () => {
        if (selectedToDiscard[res] > 0) {
          selectedToDiscard[res]--;
          qty.textContent = selectedToDiscard[res];
          btnPlus.disabled = false;
          if (selectedToDiscard[res] === 0) btnMinus.disabled = true;
          
          let newTotal = Object.values(selectedToDiscard).reduce((a,b)=>a+b, 0);
          document.getElementById('discard-remain-val').textContent = needed - newTotal;
          document.getElementById('btn-confirm-discard').disabled = (newTotal !== needed);
        }
      };

      ctrl.appendChild(btnMinus);
      ctrl.appendChild(qty);
      ctrl.appendChild(btnPlus);
      row.appendChild(ctrl);
      container.appendChild(row);
    });

    document.getElementById('btn-confirm-discard').onclick = () => {
      // Deduct resources
      Object.keys(selectedToDiscard).forEach(res => {
        player.resources[res] -= selectedToDiscard[res];
      });
      modal.style.display = 'none';
      addLog(`${player.name}: 카드 ${needed}장을 버렸습니다.`, 'robber');
      resolve();
    };
  });
}

function triggerAIDiscard(playerIdx, needed) {
  const player = gameState.players[playerIdx];
  let discardedCount = 0;
  
  // Simple heuristic: discard random available resource cards
  while (discardedCount < needed) {
    let availableRes = Object.keys(player.resources).filter(res => player.resources[res] > 0);
    if (availableRes.length === 0) break;
    let randomRes = availableRes[Math.floor(Math.random() * availableRes.length)];
    player.resources[randomRes]--;
    discardedCount++;
  }
  
  addLog(`${player.name}님이 카드 ${needed}장을 버렸습니다.`, 'robber');
}

function moveRobber(hexId) {
  gameState.robberHexIdx = hexId;
  gameState.robberMovingMode = false;
  clearIndicators();
  
  updateRobber3DPosition();
  
  const hex = board.hexes[hexId];
  addLog(`${gameState.players[gameState.currentPlayerIdx].name}님이 도둑을 ${TERRAIN_TYPES[hex.terrain.toUpperCase()].text} 타일(번호: ${hex.number})로 이동시켰습니다.`, 'robber');

  // Trigger steal selection
  // Find adjacent vertices
  let adjacentPlayers = new Set();
  hex.vertexIndices.forEach(vIdx => {
    const v = board.vertices[vIdx];
    if (v.building && v.building.player !== gameState.currentPlayerIdx) {
      // Check if target player actually has resource cards
      const targetPlayer = gameState.players[v.building.player];
      const targetCardCount = Object.values(targetPlayer.resources).reduce((a,b)=>a+b, 0);
      if (targetCardCount > 0) {
        adjacentPlayers.add(v.building.player);
      }
    }
  });

  const currentPlayer = gameState.players[gameState.currentPlayerIdx];
  if (adjacentPlayers.size === 0) {
    addLog(`강탈: 해당 타일에 인접한 플레이어가 없거나 자원을 가진 적이 없습니다.`, 'robber');
    if (!currentPlayer.isAI) {
      syncUI();
    } else {
      continueAITurn();
    }
  } else {
    if (!currentPlayer.isAI) {
      // Human: Show steal target selection modal
      openStealModal(Array.from(adjacentPlayers));
    } else {
      // AI: Steal randomly from adjacent players
      let targets = Array.from(adjacentPlayers);
      let chosenTarget = targets[Math.floor(Math.random() * targets.length)];
      stealResource(chosenTarget, gameState.currentPlayerIdx);
    }
  }
}

function openStealModal(playerIndices) {
  const modal = document.getElementById('steal-modal');
  modal.style.display = 'flex';
  
  const container = document.getElementById('steal-targets-list');
  container.innerHTML = '';
  
  playerIndices.forEach(pIdx => {
    const opponent = gameState.players[pIdx];
    const totalCards = Object.values(opponent.resources).reduce((a,b)=>a+b, 0);
    
    const btn = document.createElement('button');
    btn.className = 'btn-steal-target';
    btn.innerHTML = `<span><strong>${opponent.name}</strong> (${opponent.color} 진영)</span> <span>카드 ${totalCards}장 보유</span>`;
    
    btn.onclick = () => {
      stealResource(pIdx, gameState.currentPlayerIdx);
      modal.style.display = 'none';
    };
    
    container.appendChild(btn);
  });
}

function stealResource(victimIdx, stealerIdx) {
  const victim = gameState.players[victimIdx];
  const stealer = gameState.players[stealerIdx];

  // Pick a random card from victim
  let pool = [];
  Object.keys(victim.resources).forEach(res => {
    for (let i = 0; i < victim.resources[res]; i++) {
      pool.push(res);
    }
  });

  if (pool.length === 0) return;
  const stolenRes = pool[Math.floor(Math.random() * pool.length)];

  victim.resources[stolenRes]--;
  stealer.resources[stolenRes]++;

  const resText = TERRAIN_TYPES[stolenRes.toUpperCase()].text;
  addLog(`강탈: ${stealer.name}님이 ${victim.name}님으로부터 ${resText} 1장을 강탈했습니다!`, 'robber');

  syncUI();
  
  if (stealer.isAI) {
    continueAITurn();
  }
}

// Turn Handlers
function startNextTurn() {
  gameState.diceRolled = false;
  gameState.buildMode = null;
  
  if (gameState.phase === 'SETUP') {
    runSetupTurn();
  } else {
    // Next player idx
    gameState.currentPlayerIdx = (gameState.currentPlayerIdx + 1) % gameState.players.length;
    
    const activePlayer = gameState.players[gameState.currentPlayerIdx];
    addLog(`\n[턴 ${activePlayer.name}] 님의 턴이 시작되었습니다.`, 'turn');
    
    if (activePlayer.isAI) {
      runAITurn();
    } else {
      syncUI();
    }
  }
}

function runSetupTurn() {
  // Setup phase placement order (Snake draft)
  // Round 0: 0 -> 1 -> 2 -> 3
  // Round 1: 3 -> 2 -> 1 -> 0
  
  let playerIdx = 0;
  if (gameState.setupRound === 0) {
    playerIdx = gameState.setupTurnIdx;
  } else {
    playerIdx = gameState.players.length - 1 - gameState.setupTurnIdx;
  }
  
  gameState.currentPlayerIdx = playerIdx;
  const player = gameState.players[playerIdx];

  addLog(`\n[초기 배치] ${player.name}님의 순서입니다.`, 'turn');
  
  if (player.isAI) {
    runAISetup();
  } else {
    // Human: force build mode settlement
    gameState.buildMode = 'settlement';
    updateStateBanner(`${player.name}님, 보드판 위의 꼭짓점을 클릭하여 첫 마을을 배치하세요.`);
    showBuildingIndicators();
    syncUI();
  }
}

function handleHumanSetupPlacementCompleted() {
  // If player just placed settlement, force road placement
  const playerIdx = gameState.currentPlayerIdx;
  const player = gameState.players[playerIdx];
  let settlementsBuilt = 5 - player.settlementsLeft;
  let roadsBuilt = 15 - player.roadsLeft;
  
  if (settlementsBuilt > roadsBuilt) {
    gameState.buildMode = 'road';
    updateStateBanner(`${player.name}님, 마을과 이어진 위치의 변(Edge)을 클릭하여 도로를 배치하세요.`);
    showBuildingIndicators();
  } else {
    // Both built for human, advance setup turn
    advanceSetupTurn();
  }
}

function advanceSetupTurn() {
  gameState.setupTurnIdx++;
  if (gameState.setupTurnIdx === gameState.players.length) {
    gameState.setupTurnIdx = 0;
    gameState.setupRound++;
    if (gameState.setupRound === 2) {
      // Setup phase finished! Distribute initial resources and go to main phase
      gameState.phase = 'MAIN';
      distributeSetupResources();
      addLog(`\n[게임 시작] 모든 초기 배치가 완료되었습니다. 본 게임을 시작하겠습니다!`, 'turn');
      gameState.currentPlayerIdx = 0; // human starts first
      syncUI();
    } else {
      runSetupTurn();
    }
  } else {
    runSetupTurn();
  }
}

function distributeSetupResources() {
  // Players get 1 resource card for each tile adjacent to their SECOND settlement
  gameState.players.forEach(player => {
    // Find all settlements belonging to player
    let settlements = [];
    board.vertices.forEach(v => {
      if (v.building && v.building.type === 'settlement' && v.building.player === player.id) {
        settlements.push(v);
      }
    });

    // Pick second settlement (newest, highest timestamp)
    if (settlements.length >= 2) {
      settlements.sort((a,b) => b.building.timestamp - a.building.timestamp);
      const secondV = settlements[0]; // Newest
      
      // Look at adjacent hexes
      secondV.hexIndices.forEach(hexId => {
        const hex = board.hexes[hexId];
        if (hex.terrain !== 'desert') {
          player.resources[hex.terrain]++;
        }
      });
    }
  });
}

// Roll Dice
function rollDice() {
  if (gameState.diceRolled) return;
  
  // Animate dice shake
  const d1 = document.getElementById('die-1');
  const d2 = document.getElementById('die-2');
  d1.classList.add('rolling');
  d2.classList.add('rolling');

  setTimeout(() => {
    d1.classList.remove('rolling');
    d2.classList.remove('rolling');

    const roll1 = Math.floor(Math.random() * 6) + 1;
    const roll2 = Math.floor(Math.random() * 6) + 1;
    const sum = roll1 + roll2;

    gameState.dice = [roll1, roll2];
    gameState.diceRolled = true;

    d1.textContent = roll1;
    d2.textContent = roll2;
    document.getElementById('dice-sum').textContent = sum;

    addLog(`주사위: [${roll1}], [${roll2}] -> 합 ${sum}`, 'dice');

    if (sum === 7) {
      handleRobberActivation();
    } else {
      distributeResources(sum);
      const currentPlayer = gameState.players[gameState.currentPlayerIdx];
      if (!currentPlayer.isAI) {
        syncUI();
      } else {
        continueAITurn();
      }
    }
  }, 600);
}

// ==========================================
// 9. ARTIFICIAL INTELLIGENCE (AI) AGENT
// ==========================================
function runAISetup() {
  gameState.isAIProcessing = true;
  updateStateBanner(`${gameState.players[gameState.currentPlayerIdx].name} 배치 중...`);

  setTimeout(() => {
    const aiIdx = gameState.currentPlayerIdx;
    
    // 1. Pick best settlement vertex
    // Sort vertices by sum of dice probability dots of adjacent hexes
    let vWeights = [];
    board.vertices.forEach(v => {
      if (isValidSettlementPosition(v.id, aiIdx)) {
        let weight = 0;
        v.hexIndices.forEach(hexId => {
          const hex = board.hexes[hexId];
          weight += DICE_PROBABILITIES[hex.number] || 0;
        });
        vWeights.push({ id: v.id, w: weight });
      }
    });

    // Sort descending
    vWeights.sort((a,b) => b.w - a.w);
    let chosenVertexId = vWeights[0].id;
    buildSettlement(chosenVertexId, aiIdx);

    // 2. Pick best road edge adjacent to settlement
    let validEdges = [];
    board.edges.forEach(e => {
      if (isValidRoadPosition(e.id, aiIdx)) {
        validEdges.push(e.id);
      }
    });
    // Pick randomly from valid edges
    let chosenEdgeId = validEdges[Math.floor(Math.random() * validEdges.length)];
    buildRoad(chosenEdgeId, aiIdx);

    gameState.isAIProcessing = false;
    advanceSetupTurn();
  }, 1000);
}

function runAITurn() {
  gameState.isAIProcessing = true;
  updateStateBanner(`${gameState.players[gameState.currentPlayerIdx].name} 플레이 중...`);

  // Step 1: Roll Dice
  setTimeout(() => {
    rollDice();
  }, 1200);
}

function continueAITurn() {
  // Step 2: Trade & Build Decisions
  setTimeout(() => {
    const aiIdx = gameState.currentPlayerIdx;
    const ai = gameState.players[aiIdx];
    
    // Keep building while AI has resources
    let builtSomething = true;
    while (builtSomething) {
      builtSomething = false;
      
      // 1. Try to build City
      if (ai.resources.wheat >= 2 && ai.resources.ore >= 3 && ai.citiesLeft > 0) {
        // Upgrade a random settlement
        let settlements = [];
        board.vertices.forEach(v => {
          if (v.building && v.building.type === 'settlement' && v.building.player === aiIdx) {
            settlements.push(v.id);
          }
        });
        if (settlements.length > 0) {
          buildCity(settlements[0], aiIdx);
          builtSomething = true;
          continue;
        }
      }

      // 2. Try to build Settlement
      if (ai.resources.wood >= 1 && ai.resources.brick >= 1 && ai.resources.sheep >= 1 && ai.resources.wheat >= 1 && ai.settlementsLeft > 0) {
        let validV = [];
        board.vertices.forEach(v => {
          if (isValidSettlementPosition(v.id, aiIdx)) validV.push(v.id);
        });
        if (validV.length > 0) {
          // Build on first valid position
          buildSettlement(validV[0], aiIdx);
          builtSomething = true;
          continue;
        }
      }

      // 3. Try to build Road
      if (ai.resources.wood >= 1 && ai.resources.brick >= 1 && ai.roadsLeft > 0) {
        let validE = [];
        board.edges.forEach(e => {
          if (isValidRoadPosition(e.id, aiIdx)) validE.push(e.id);
        });
        if (validE.length > 0) {
          buildRoad(validE[0], aiIdx);
          builtSomething = true;
          continue;
        }
      }

      // 4. Try to buy Dev Card
      if (ai.resources.sheep >= 1 && ai.resources.wheat >= 1 && ai.resources.ore >= 1) {
        buyDevelopmentCard(aiIdx);
        builtSomething = true;
        continue;
      }

      // 5. Try 4:1 Trade if AI lacks 1 card for a build
      // Simple trade logic: if AI has >= 4 of a resource and lacks resources for settlement/road
      let resourcesToGive = Object.keys(ai.resources).filter(res => ai.resources[res] >= 4);
      if (resourcesToGive.length > 0) {
        // Find what AI needs
        let woodNeeded = (ai.resources.wood === 0) ? 1 : 0;
        let brickNeeded = (ai.resources.brick === 0) ? 1 : 0;
        let sheepNeeded = (ai.resources.sheep === 0 && ai.settlementsLeft > 0) ? 1 : 0;
        let wheatNeeded = (ai.resources.wheat === 0) ? 1 : 0;
        
        let giveRes = resourcesToGive[0];
        let getRes = '';
        if (woodNeeded) getRes = 'wood';
        else if (brickNeeded) getRes = 'brick';
        else if (sheepNeeded) getRes = 'sheep';
        else if (wheatNeeded) getRes = 'wheat';
        
        if (getRes && giveRes !== getRes) {
          let ratio = getPlayerTradeRatio(aiIdx, giveRes);
          if (ai.resources[giveRes] >= ratio) {
            ai.resources[giveRes] -= ratio;
            ai.resources[getRes]++;
            addLog(`${ai.name}님이 은행과 거래하여 ${TERRAIN_TYPES[giveRes.toUpperCase()].text} ${ratio}장 ➔ ${TERRAIN_TYPES[getRes.toUpperCase()].text} 1장으로 교환했습니다.`, 'trade');
            builtSomething = true;
            continue;
          }
        }
      }
    }

    // Step 3: End Turn
    gameState.isAIProcessing = false;
    startNextTurn();
  }, 1000);
}

function runAIRobberLogic(aiIdx) {
  // Move robber to the hex with the most human settlements and high number probability
  let bestHexId = -1;
  let bestWeight = -1;

  board.hexes.forEach(hex => {
    if (hex.id === gameState.robberHexIdx) return;

    let weight = 0;
    hex.vertexIndices.forEach(vIdx => {
      const v = board.vertices[vIdx];
      if (v.building) {
        const buildingPlayer = gameState.players[v.building.player];
        if (buildingPlayer && !buildingPlayer.isAI) {
          // Block human (highest threat)
          weight += (v.building.type === 'city') ? 4 : 2;
        } else if (v.building.player !== aiIdx) {
          // Block other AIs
          weight += 1;
        }
      }
    });

    if (weight > bestWeight) {
      bestWeight = weight;
      bestHexId = hex.id;
    }
  });

  // Default to a random hex if no weights
  if (bestHexId === -1) {
    let validHexIds = board.hexes.filter(h => h.id !== gameState.robberHexIdx).map(h => h.id);
    bestHexId = validHexIds[Math.floor(Math.random() * validHexIds.length)];
  }

  moveRobber(bestHexId);
}

// ==========================================
// 10. USER INTERFACE & GAME LOOP INTEGRATION
// ==========================================
function addLog(message, type = 'system') {
  const line = document.createElement('div');
  line.className = `log-msg log-${type}`;
  line.textContent = message;
  
  logConsole.appendChild(line);
  logConsole.scrollTop = logConsole.scrollHeight; // Auto-scroll to bottom
}

function updateStateBanner(text) {
  stateBannerText.textContent = text;
}

function syncUI() {
  // Find which human player's resources to show.
  // Show active player's resources if they are human. Otherwise show first human player.
  let showPlayerIdx = 0;
  const currentPlayer = gameState.players[gameState.currentPlayerIdx];
  if (currentPlayer && !currentPlayer.isAI) {
    showPlayerIdx = gameState.currentPlayerIdx;
  } else {
    // find first human player
    const firstHuman = gameState.players.find(p => !p.isAI);
    if (firstHuman) showPlayerIdx = firstHuman.id;
  }

  const human = gameState.players[showPlayerIdx];
  if (!human) return;

  // 1. Resources count
  countWood.textContent = human.resources.wood;
  countBrick.textContent = human.resources.brick;
  countSheep.textContent = human.resources.sheep;
  countWheat.textContent = human.resources.wheat;
  countOre.textContent = human.resources.ore;

  // Update resource title to show whose resource it is
  const resSectionTitle = document.querySelector('.resources-section .section-title h3');
  if (resSectionTitle) {
    resSectionTitle.textContent = `${human.name}의 자원 카드`;
  }

  // 2. Dev Cards Count
  let usableDevCardsCount = human.devCards.length;
  devcardsCount.textContent = usableDevCardsCount;
  btnOpenDevcards.disabled = (usableDevCardsCount === 0 || (currentPlayer && currentPlayer.isAI));

  // 3. Action Buttons States
  const isHumanTurn = (currentPlayer && !currentPlayer.isAI && !gameState.isAIProcessing);

  if (gameState.phase === 'SETUP') {
    btnRoll.disabled = true;
    btnEnd.disabled = true;
    btnOpenTrade.disabled = true;
    
    btnBuildRoad.disabled = true;
    btnBuildSettlement.disabled = true;
    btnBuildCity.disabled = true;
    btnBuyDevcard.disabled = true;
    
    // Set appropriate build button highlight in setup phase
    if (gameState.buildMode === 'settlement') {
      btnBuildSettlement.classList.add('active-build');
      btnBuildRoad.classList.remove('active-build');
    } else if (gameState.buildMode === 'road') {
      btnBuildRoad.classList.add('active-build');
      btnBuildSettlement.classList.remove('active-build');
    }
  } else {
    // Main phase
    btnRoll.disabled = !isHumanTurn || gameState.diceRolled;
    btnEnd.disabled = !isHumanTurn || !gameState.diceRolled;
    btnOpenTrade.disabled = !isHumanTurn || !gameState.diceRolled;

    // Build costs check
    btnBuildRoad.disabled = !isHumanTurn || !gameState.diceRolled || human.resources.wood < 1 || human.resources.brick < 1 || human.roadsLeft === 0;
    btnBuildSettlement.disabled = !isHumanTurn || !gameState.diceRolled || human.resources.wood < 1 || human.resources.brick < 1 || human.resources.sheep < 1 || human.resources.wheat < 1 || human.settlementsLeft === 0;
    btnBuildCity.disabled = !isHumanTurn || !gameState.diceRolled || human.resources.wheat < 2 || human.resources.ore < 3 || human.citiesLeft === 0;
    btnBuyDevcard.disabled = !isHumanTurn || !gameState.diceRolled || human.resources.sheep < 1 || human.resources.wheat < 1 || human.resources.ore < 1;

    // Maintain build mode highlights
    btnBuildRoad.classList.toggle('active-build', gameState.buildMode === 'road');
    btnBuildSettlement.classList.toggle('active-build', gameState.buildMode === 'settlement');
    btnBuildCity.classList.toggle('active-build', gameState.buildMode === 'city');

    if (isHumanTurn) {
      if (!gameState.diceRolled) {
        updateStateBanner(`${currentPlayer.name}님, 주사위를 굴리세요.`);
      } else if (gameState.buildMode) {
        updateStateBanner('3D 월드에서 건설할 위치를 클릭하세요.');
      } else {
        updateStateBanner(`${currentPlayer.name}님, 행동을 선택하거나 턴을 종료하세요.`);
      }
    } else {
      updateStateBanner(`${gameState.players[gameState.currentPlayerIdx].name} 플레이 중...`);
    }
  }

  // 4. Scoreboard render
  const scoreboard = document.getElementById('players-list');
  scoreboard.innerHTML = '';

  gameState.players.forEach((p, idx) => {
    const card = document.createElement('div');
    card.className = `player-card ${gameState.currentPlayerIdx === idx ? 'active-turn' : ''}`;
    
    // Total resource cards count (hidden from other players, but visible as size)
    const cardsTotal = Object.values(p.resources).reduce((a,b)=>a+b, 0);

    // Dynamic Title Badges
    let badges = '';
    if (gameState.longestRoadPlayer === idx) {
      badges += `<span class="dev-badge" title="최장 도로 (도로 ${gameState.longestRoadCount}개)"><i class="fa-solid fa-road"></i> 최장</span>`;
    }
    if (gameState.largestArmyPlayer === idx) {
      badges += `<span class="dev-badge" title="최대 군대 (기사 ${gameState.largestArmyCount}회)"><i class="fa-solid fa-shield"></i> 군대</span>`;
    }

    card.innerHTML = `
      <div class="player-info">
        <div class="player-indicator ${p.cssClass}"></div>
        <span class="player-name">${p.name}${badges}</span>
      </div>
      <div class="player-stats">
        <div class="stat-item" title="승점"><i class="fa-solid fa-trophy text-accent"></i> <strong>${p.victoryPoints}점</strong></div>
        <div class="stat-item" title="자원 카드 수"><i class="fa-solid fa-copy"></i> <span>${cardsTotal}장</span></div>
      </div>
    `;
    scoreboard.appendChild(card);
  });
}

function openModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
  // End any trade selection states
  tradeGiveSelected = null;
  tradeGetSelected = null;
}

// 10.1 bank trade logic
let tradeGiveSelected = null;
let tradeGetSelected = null;

function renderTradeModal() {
  openModal('trade-modal');

  const playerIdx = gameState.currentPlayerIdx;
  const human = gameState.players[playerIdx];
  const giveContainer = document.getElementById('trade-give-list');
  const getContainer = document.getElementById('trade-get-list');

  giveContainer.innerHTML = '';
  getContainer.innerHTML = '';

  // Give Resources (Wood, Brick, Sheep, Wheat, Ore)
  Object.keys(human.resources).forEach(res => {
    const ratio = getPlayerTradeRatio(playerIdx, res);
    const hasEnough = human.resources[res] >= ratio;

    const btn = document.createElement('button');
    btn.className = `trade-btn-item ${tradeGiveSelected === res ? 'selected' : ''}`;
    btn.disabled = !hasEnough;
    btn.innerHTML = `
      <span class="trade-res-label"><i class="fa-solid ${TERRAIN_TYPES[res.toUpperCase()].icon} text-${res}"></i> ${TERRAIN_TYPES[res.toUpperCase()].text}</span>
      <span class="trade-ratio-label">${ratio}장 내기</span>
    `;

    btn.onclick = () => {
      tradeGiveSelected = res;
      renderTradeModal(); // Refresh highlights
      checkTradeValid();
    };

    giveContainer.appendChild(btn);
  });

  // Get Resources
  Object.keys(human.resources).forEach(res => {
    const btn = document.createElement('button');
    btn.className = `trade-btn-item ${tradeGetSelected === res ? 'selected' : ''}`;
    btn.disabled = (tradeGiveSelected === res); // Can't swap same resource

    btn.innerHTML = `
      <span class="trade-res-label"><i class="fa-solid ${TERRAIN_TYPES[res.toUpperCase()].icon} text-${res}"></i> ${TERRAIN_TYPES[res.toUpperCase()].text}</span>
      <span class="trade-ratio-label">1장 얻기</span>
    `;

    btn.onclick = () => {
      tradeGetSelected = res;
      renderTradeModal();
      checkTradeValid();
    };

    getContainer.appendChild(btn);
  });
}

function checkTradeValid() {
  const confirmBtn = document.getElementById('btn-confirm-trade');
  const playerIdx = gameState.currentPlayerIdx;
  if (tradeGiveSelected && tradeGetSelected) {
    const ratio = getPlayerTradeRatio(playerIdx, tradeGiveSelected);
    confirmBtn.disabled = false;
    document.getElementById('trade-ratio-display').textContent = `${ratio} : 1`;

    confirmBtn.onclick = () => {
      const human = gameState.players[playerIdx];
      human.resources[tradeGiveSelected] -= ratio;
      human.resources[tradeGetSelected]++;
      
      const giveName = TERRAIN_TYPES[tradeGiveSelected.toUpperCase()].text;
      const getName = TERRAIN_TYPES[tradeGetSelected.toUpperCase()].text;
      addLog(`거래: 은행(혹은 항구)과 교환하여 ${giveName} ${ratio}장 ➔ ${getName} 1장으로 교환했습니다.`, 'trade');
      
      closeModal('trade-modal');
      syncUI();
    };
  } else {
    confirmBtn.disabled = true;
  }
}

// 10.2 Play Dev Card popup
function renderDevCardModal() {
  openModal('devcard-modal');
  const playerIdx = gameState.currentPlayerIdx;
  const human = gameState.players[playerIdx];
  const container = document.getElementById('my-devcards-list');
  container.innerHTML = '';

  if (human.devCards.length === 0) {
    container.innerHTML = '<p class="text-center text-muted">보유한 발전 카드가 없습니다.</p>';
    return;
  }

  human.devCards.forEach((card, idx) => {
    // Can only play cards bought on PREVIOUS turns (unless it is a Victory Point card which is passive)
    // For simplicity, allow playing knight/actions immediately since it's a casual single player sandbox
    const item = document.createElement('div');
    item.className = 'devcard-item';
    
    let actionBtn = '';
    if (card.type !== 'vp') {
      actionBtn = `<button class="btn btn-primary" onclick="useDevCard(${idx})">사용하기</button>`;
    } else {
      actionBtn = `<span class="text-accent" style="font-weight:600;font-size:12px;">보유 즉시 승점 추가됨</span>`;
    }

    item.innerHTML = `
      <div class="devcard-meta">
        <h4>${card.name}</h4>
        <p>${card.desc}</p>
      </div>
      ${actionBtn}
    `;

    container.appendChild(item);
  });
}

function useDevCard(cardIdx) {
  closeModal('devcard-modal');
  const playerIdx = gameState.currentPlayerIdx;
  const human = gameState.players[playerIdx];
  const card = human.devCards[cardIdx];

  if (card.type === 'knight') {
    playKnightCard(playerIdx, cardIdx);
  } else if (card.type === 'yop') {
    // Year of plenty: give 2 random resources (or open choice, for simplicity give Wood & Wheat)
    human.devCards.splice(cardIdx, 1);
    human.resources.wood++;
    human.resources.wheat++;
    addLog(`발전 카드 풍요의 해 작동: 목재 1장과 밀 1장을 무료로 획득했습니다.`, 'trade');
    syncUI();
  } else if (card.type === 'rb') {
    // Road Building: Place 2 free roads
    human.devCards.splice(cardIdx, 1);
    gameState.buildMode = 'road';
    gameState.roadBuildingCount = 2;
    addLog(`발전 카드 도로 건설 작동: 2개의 도로를 무료로 순서대로 건설하십시오.`, 'build');
    showBuildingIndicators();
    syncUI();
  } else if (card.type === 'monopoly') {
    // Monopoly: Trigger Monopoly resource modal
    human.devCards.splice(cardIdx, 1);
    openMonopolyModal();
  }
}

function openMonopolyModal() {
  openModal('monopoly-modal');
  document.querySelectorAll('.btn-monopoly').forEach(btn => {
    btn.onclick = () => {
      const res = btn.getAttribute('data-res');
      closeModal('monopoly-modal');
      
      let stolenTotal = 0;
      const playerIdx = gameState.currentPlayerIdx;
      gameState.players.forEach((p, idx) => {
        if (idx !== playerIdx && p.resources[res] > 0) {
          stolenTotal += p.resources[res];
          p.resources[res] = 0;
        }
      });

      gameState.players[playerIdx].resources[res] += stolenTotal;
      const resText = TERRAIN_TYPES[res.toUpperCase()].text;
      addLog(`발전 카드 독점 작동: 모든 적 플레이어로부터 ${resText} 카드를 총 ${stolenTotal}장 강탈했습니다! 🎩`, 'trade');
      syncUI();
    };
  });
}

function triggerWinner(playerIdx) {
  const winner = gameState.players[playerIdx];
  const modal = document.getElementById('winner-modal');
  document.getElementById('winner-title').textContent = `${winner.name} 승리!`;
  document.getElementById('winner-desc').textContent = `${winner.name}님이 10점을 달성하여 게임에서 최종 우승하셨습니다. 축하합니다!`;
  modal.style.display = 'flex';
}

// Setup Event Listeners
function setupDOMEvents() {
  logConsole = document.getElementById('log-console');
  stateBannerText = document.getElementById('state-banner-text');
  countWood = document.getElementById('count-wood');
  countBrick = document.getElementById('count-brick');
  countSheep = document.getElementById('count-sheep');
  countWheat = document.getElementById('count-wheat');
  countOre = document.getElementById('count-ore');
  btnRoll = document.getElementById('btn-roll');
  btnEnd = document.getElementById('btn-end-turn');
  console.log("LOG IMMEDIATELY AFTER ASSIGNMENT - btnEnd:", btnEnd);

  btnBuildRoad = document.getElementById('btn-build-road');
  btnBuildSettlement = document.getElementById('btn-build-settlement');
  btnBuildCity = document.getElementById('btn-build-city');
  btnBuyDevcard = document.getElementById('btn-buy-devcard');

  btnOpenTrade = document.getElementById('btn-open-trade');
  btnOpenDevcards = document.getElementById('btn-open-devcards');
  devcardsCount = document.getElementById('devcards-count');

  // Mode toggling
  const btnModeSingle = document.getElementById('btn-mode-single');
  const btnModeMulti = document.getElementById('btn-mode-multi');
  const singleArea = document.getElementById('single-config-area');
  const multiArea = document.getElementById('multi-config-area');
  
  btnModeSingle.onclick = () => {
    btnModeSingle.classList.add('active');
    btnModeMulti.classList.remove('active');
    singleArea.style.display = 'block';
    multiArea.style.display = 'none';
  };
  
  btnModeMulti.onclick = () => {
    btnModeMulti.classList.add('active');
    btnModeSingle.classList.remove('active');
    singleArea.style.display = 'none';
    multiArea.style.display = 'block';
    renderMultiplayerNameInputs();
  };

  // Player count toggle buttons
  document.querySelectorAll('#player-count-toggle .btn-toggle').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#player-count-toggle .btn-toggle').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderMultiplayerNameInputs();
    };
  });

  // AI count toggle buttons
  document.querySelectorAll('#ai-count-toggle .btn-toggle').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#ai-count-toggle .btn-toggle').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    };
  });

  function renderMultiplayerNameInputs() {
    const container = document.getElementById('player-names-inputs');
    if (!container) return;
    const activeBtn = document.querySelector('#player-count-toggle .btn-toggle.active');
    const count = activeBtn ? parseInt(activeBtn.getAttribute('data-value')) : 3;
    
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const field = document.createElement('div');
      field.className = 'player-name-field';
      field.innerHTML = `
        <label>플레이어 ${i + 1} 이름</label>
        <input type="text" id="player-name-${i}" value="플레이어 ${i + 1}" maxlength="8">
      `;
      container.appendChild(field);
    }
  }

  // Lobby Trigger
  document.getElementById('btn-start-game').onclick = () => {
    const mode = document.querySelector('#mode-toggle-group .btn-toggle.active').getAttribute('data-mode');
    let playersConfig = [];
    
    if (mode === 'single') {
      const humanName = document.getElementById('player-name-input').value.trim() || '플레이어';
      const aiCountActive = document.querySelector('#ai-count-toggle .btn-toggle.active');
      const aiCount = aiCountActive ? parseInt(aiCountActive.getAttribute('data-value')) : 3;
      
      playersConfig.push({ name: humanName, isAI: false });
      for (let i = 1; i <= aiCount; i++) {
        playersConfig.push({ name: `인공지능 ${i}`, isAI: true });
      }
    } else {
      const playerCountActive = document.querySelector('#player-count-toggle .btn-toggle.active');
      const playerCount = playerCountActive ? parseInt(playerCountActive.getAttribute('data-value')) : 3;
      for (let i = 0; i < playerCount; i++) {
        const nameInput = document.getElementById(`player-name-${i}`);
        const pName = nameInput ? nameInput.value.trim() : `플레이어 ${i+1}`;
        playersConfig.push({ name: pName || `플레이어 ${i+1}`, isAI: false });
      }
    }
    
    document.getElementById('setup-modal').style.display = 'none';
    
    initPlayers(playersConfig);
    initBoardStructure();
    initThreeJS();
    
    runSetupTurn();
  };

  // Roll Dice Button
  btnRoll.onclick = rollDice;

  // End Turn Button
  btnEnd.onclick = () => {
    startNextTurn();
  };

  // Building Click Triggers
  btnBuildRoad.onclick = () => {
    if (gameState.buildMode === 'road') {
      endBuildMode();
    } else {
      gameState.buildMode = 'road';
      showBuildingIndicators();
      syncUI();
    }
  };

  btnBuildSettlement.onclick = () => {
    if (gameState.buildMode === 'settlement') {
      endBuildMode();
    } else {
      gameState.buildMode = 'settlement';
      showBuildingIndicators();
      syncUI();
    }
  };

  btnBuildCity.onclick = () => {
    if (gameState.buildMode === 'city') {
      endBuildMode();
    } else {
      gameState.buildMode = 'city';
      showBuildingIndicators();
      syncUI();
    }
  };

  btnBuyDevcard.onclick = () => {
    buyDevelopmentCard(0);
  };

  btnOpenTrade.onclick = renderTradeModal;
  btnOpenDevcards.onclick = renderDevCardModal;

  // Rules Modal Trigger
  document.getElementById('btn-rules').onclick = () => openModal('rules-modal');

  // Camera Reset
  document.getElementById('btn-camera-reset').onclick = () => {
    if (controls) {
      controls.reset();
      camera.position.set(0, 70, 75);
    }
  };
}

// Window Onload init
window.addEventListener('DOMContentLoaded', () => {
  setupDOMEvents();
});
