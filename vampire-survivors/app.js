// Vampire Survivors (비행기 서바이벌 슈터) Game Logic

document.addEventListener("DOMContentLoaded", () => {
  
  // ==========================================
  // DOM Elements
  // ==========================================
  const lobbyPanel = document.getElementById("lobby-panel");
  const gamePanel = document.getElementById("game-panel");
  
  const stageCards = document.querySelectorAll(".stage-card");
  const btnTimeList = document.querySelectorAll(".btn-time");
  const btnStartGame = document.getElementById("btn-start-game");
  
  const hudLevel = document.getElementById("hud-level");
  const hudTimer = document.getElementById("hud-timer");
  const hudKills = document.getElementById("hud-kills");
  
  const expBarFill = document.getElementById("exp-bar-fill");
  const expBarText = document.getElementById("exp-bar-text");
  
  const hpBarFill = document.getElementById("hp-bar-fill");
  const hpValueText = document.getElementById("hp-value-text");
  
  const shieldBarFill = document.getElementById("shield-bar-fill");
  const shieldValueText = document.getElementById("shield-value-text");
  
  const weaponSlotsContainer = document.getElementById("weapon-slots-container");
  const passiveSlotsContainer = document.getElementById("passive-slots-container");
  
  const gameCanvas = document.getElementById("game-canvas");
  const ctx = gameCanvas.getContext("2d");
  
  const btnPauseGame = document.getElementById("btn-pause-game");
  const gameOverlay = document.getElementById("game-overlay");
  const levelupOverlay = document.getElementById("levelup-overlay");
  
  const overlayTitle = document.getElementById("overlay-title");
  const overlayDesc = document.getElementById("overlay-desc");
  const overlayBtnGroup = document.getElementById("overlay-btn-group");
  const upgradeCardsList = document.getElementById("upgrade-cards-list");
  
  const scalingAlertBanner = document.getElementById("scaling-alert-banner");
  
  const guideTabs = document.querySelectorAll(".explanation-index-list li");
  const guideTitleBadge = document.getElementById("explanation-title-badge");
  const guideTitle = document.getElementById("explanation-display-title");
  const guideText = document.getElementById("explanation-display-text");

  // ==========================================
  // Audio Synthesizer (Web Audio API)
  // ==========================================
  let audioCtx = null;
  let isSoundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playSynthSound(freqs, durations, type = "square", volume = 0.1) {
    if (!isSoundEnabled || !audioCtx) return;
    try {
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      
      const now = audioCtx.currentTime;
      let timeOffset = 0;
      
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now + timeOffset);
        
        const dur = durations[idx] || 0.1;
        gain.gain.setValueAtTime(volume, now + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + timeOffset + dur);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + dur);
        
        timeOffset += dur * 0.8;
      });
    } catch (e) {
      console.warn("Audio play error:", e);
    }
  }

  const sounds = {
    shoot: () => playSynthSound([600, 300], [0.08, 0.08], "sawtooth", 0.05),
    hit: () => playSynthSound([150, 80], [0.1, 0.1], "triangle", 0.15),
    explode: () => playSynthSound([100, 40], [0.2, 0.2], "triangle", 0.25),
    gem: () => playSynthSound([880, 1320], [0.06, 0.06], "sine", 0.08),
    levelUp: () => playSynthSound([523, 659, 784, 1046], [0.12, 0.12, 0.12, 0.2], "sine", 0.12),
    hurt: () => playSynthSound([220, 110], [0.15, 0.15], "sawtooth", 0.15),
    gameOver: () => playSynthSound([440, 349, 293, 220], [0.2, 0.2, 0.2, 0.4], "sawtooth", 0.15),
    victory: () => playSynthSound([523, 587, 659, 698, 784, 880, 987, 1046], [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.4], "sine", 0.12)
  };

  // ==========================================
  // Game Configuration & State
  // ==========================================
  const STAGES = {
    1: {
      name: "초보자의 숲",
      difficulty: "EASY",
      bgColor: "#0f2d1e", // Forest Deep Green
      gridColor: "#17442d",
      enemyTypes: ["goblin", "bat"],
      enemySpawnRate: 1500, // ms
      bossType: "giant_bat"
    },
    2: {
      name: "사막의 무덤",
      difficulty: "NORMAL",
      bgColor: "#2d230f", // Desert Gold-Brown
      gridColor: "#443517",
      enemyTypes: ["skeleton", "scorpio"],
      enemySpawnRate: 1200,
      bossType: "mummy_king"
    },
    3: {
      name: "얼어붙은 호수",
      difficulty: "HARD",
      bgColor: "#0f262d", // Ice Dark Teal
      gridColor: "#173a44",
      enemyTypes: ["ice_slime", "yeti"],
      enemySpawnRate: 1000,
      bossType: "frost_titan"
    },
    4: {
      name: "화산 동굴",
      difficulty: "VERY HARD",
      bgColor: "#2d0f0f", // Lava Dark Red
      gridColor: "#441717",
      enemyTypes: ["fire_imp", "lava_golem"],
      enemySpawnRate: 800,
      bossType: "lava_dragon"
    },
    5: {
      name: "지옥의 심연",
      difficulty: "CHAOS",
      bgColor: "#170505", // Hell Obsidian
      gridColor: "#260a0a",
      enemyTypes: ["demon", "hell_hound"],
      enemySpawnRate: 600,
      bossType: "archdemon"
    }
  };

  const ENEMY_TEMPLATES = {
    goblin: { hp: 15, speed: 0.6, damage: 6, exp: 10, color: "#10b981", radius: 8, shape: "circle" },
    bat: { hp: 10, speed: 1.1, damage: 4, exp: 5, color: "#8b5cf6", radius: 6, shape: "bat" },
    skeleton: { hp: 30, speed: 0.5, damage: 12, exp: 20, color: "#cbd5e1", radius: 10, shape: "square" },
    scorpio: { hp: 25, speed: 0.9, damage: 8, exp: 15, color: "#fb923c", radius: 7, shape: "triangle" },
    ice_slime: { hp: 45, speed: 0.7, damage: 15, exp: 35, color: "#60a5fa", radius: 11, shape: "circle" },
    yeti: { hp: 80, speed: 0.55, damage: 22, exp: 50, color: "#ffffff", radius: 16, shape: "yeti" },
    fire_imp: { hp: 60, speed: 1.0, damage: 18, exp: 60, color: "#f87171", radius: 9, shape: "imp" },
    lava_golem: { hp: 150, speed: 0.4, damage: 35, exp: 100, color: "#ef4444", radius: 20, shape: "square" },
    demon: { hp: 120, speed: 0.85, damage: 28, exp: 120, color: "#7f1d1d", radius: 14, shape: "imp" },
    hell_hound: { hp: 90, speed: 1.25, damage: 20, exp: 90, color: "#b91c1c", radius: 11, shape: "dog" },
    
    // Bosses
    giant_bat: { hp: 800, speed: 0.9, damage: 20, exp: 500, color: "#4c1d95", radius: 28, shape: "bat", isBoss: true },
    mummy_king: { hp: 2000, speed: 0.55, damage: 35, exp: 1000, color: "#ca8a04", radius: 32, shape: "square", isBoss: true },
    frost_titan: { hp: 4000, speed: 0.45, damage: 50, exp: 2000, color: "#0284c7", radius: 40, shape: "yeti", isBoss: true },
    lava_dragon: { hp: 8000, speed: 0.65, damage: 70, exp: 4000, color: "#991b1b", radius: 45, shape: "imp", isBoss: true },
    archdemon: { hp: 15000, speed: 0.8, damage: 90, exp: 8000, color: "#000000", radius: 50, shape: "imp", isBoss: true }
  };

  const WEAPONS_DB = {
    vulcan: {
      name: "기본 기관포",
      desc: "비행기 전방으로 강력한 소구경 철갑탄을 연사합니다.",
      levels: [
        { damage: 10, fireRate: 600, speed: 4, projectiles: 1 },
        { damage: 15, fireRate: 500, speed: 4.5, projectiles: 1 },
        { damage: 15, fireRate: 450, speed: 4.5, projectiles: 2 }, // Double bullets
        { damage: 22, fireRate: 400, speed: 5, projectiles: 2 },
        { damage: 22, fireRate: 350, speed: 5, projectiles: 3 }, // Triple bullets
        { damage: 32, fireRate: 300, speed: 6, projectiles: 3 }
      ]
    },
    missile: {
      name: "유도 미사일",
      desc: "가장 가까운 적에게 추적 유도탄을 발사하여 광역 폭발 피해를 줍니다.",
      levels: [
        { damage: 25, fireRate: 1500, speed: 3, radius: 40 },
        { damage: 35, fireRate: 1400, speed: 3.25, radius: 45 },
        { damage: 35, fireRate: 1300, speed: 3.5, radius: 45, count: 2 }, // Shoot 2 missiles
        { damage: 50, fireRate: 1200, speed: 3.75, radius: 50, count: 2 },
        { damage: 70, fireRate: 1100, speed: 4, radius: 60, count: 3 }, // Shoot 3 missiles
        { damage: 100, fireRate: 900, speed: 4.5, radius: 70, count: 3 }
      ]
    },
    shield: {
      name: "위성 빔 실드",
      desc: "기체 주변을 회전하며 근접하는 적들에게 다중 속성 충돌 피해를 입힙니다.",
      levels: [
        { damage: 12, count: 1, radius: 70, speed: 0.015 },
        { damage: 18, count: 2, radius: 70, speed: 0.0175 },
        { damage: 22, count: 2, radius: 80, speed: 0.02 },
        { damage: 30, count: 3, radius: 80, speed: 0.0225 },
        { damage: 38, count: 4, radius: 90, speed: 0.025 },
        { damage: 55, count: 5, radius: 95, speed: 0.03 }
      ]
    },
    boomerang: {
      name: "부메랑 서큘러",
      desc: "기체 밖으로 날아갔다가 되돌아오며 궤적 상의 적들을 관통하여 벱니다.",
      levels: [
        { damage: 15, fireRate: 2000, speed: 2.5, maxDist: 180 },
        { damage: 22, fireRate: 1800, speed: 2.75, maxDist: 200 },
        { damage: 30, fireRate: 1600, speed: 3, maxDist: 220, count: 2 },
        { damage: 45, fireRate: 1400, speed: 3.25, maxDist: 240, count: 2 },
        { damage: 60, fireRate: 1200, speed: 3.5, maxDist: 260, count: 3 },
        { damage: 85, fireRate: 1000, speed: 4, maxDist: 280, count: 3 }
      ]
    }
  };

  const PASSIVES_DB = {
    armor: {
      name: "합금 복합장갑",
      desc: "기체 외부 보강 장갑을 통해 적으로부터 받는 직접 피해를 경감합니다.",
      levels: [
        { reduce: 0.15, label: "받는 피해 15% 감소" },
        { reduce: 0.30, label: "받는 피해 30% 감소" },
        { reduce: 0.45, label: "받는 피해 45% 감소" },
        { reduce: 0.55, label: "받는 피해 55% 감소" },
        { reduce: 0.65, label: "받는 피해 65% 감소" }
      ]
    },
    speed: {
      name: "과충전 추진 부스터",
      desc: "기체의 엔진 분사력을 증가시켜 절대 활공 속도를 가속합니다.",
      levels: [
        { multiplier: 1.15, label: "비행 속도 +15%" },
        { multiplier: 1.30, label: "비행 속도 +30%" },
        { multiplier: 1.45, label: "비행 속도 +45%" },
        { multiplier: 1.60, label: "비행 속도 +60%" },
        { multiplier: 1.75, label: "비행 속도 +75%" }
      ]
    },
    magnet: {
      name: "전자기 자석 수신기",
      desc: "경험치 보석이나 골드 보급 상자를 수집할 수 있는 전자기장 반경을 넓힙니다.",
      levels: [
        { radius: 95, label: "아이템 흡수 반경 +45px" },
        { radius: 140, label: "아이템 흡수 반경 +90px" },
        { radius: 185, label: "아이템 흡수 반경 +135px" },
        { radius: 230, label: "아이템 흡수 반경 +180px" },
        { radius: 280, label: "아이템 흡수 반경 +230px" }
      ]
    },
    focus: {
      name: "포커스 증폭 렌즈",
      desc: "무기 투사체의 크기를 증폭시키고, 탄속 및 유효 사거리를 증가시킵니다.",
      levels: [
        { scale: 1.15, label: "투사체 탄속 및 사거리 +15%" },
        { scale: 1.30, label: "투사체 탄속 및 사거리 +30%" },
        { scale: 1.45, label: "투사체 탄속 및 사거리 +45%" },
        { scale: 1.60, label: "투사체 탄속 및 사거리 +60%" },
        { scale: 1.75, label: "투사체 탄속 및 사거리 +75%" }
      ]
    }
  };

  // State Variables
  let selectedStage = 1;
  let selectTimeLimit = 600; // 10 minutes default
  let selectedBulletType = "straight_3way";
  let isPlaying = false;
  let isPaused = false;
  
  let player = {
    x: 0,
    y: 0,
    angle: -Math.PI / 2, // Facing up initially
    speed: 1.75,
    radius: 12,
    hp: 100,
    maxHp: 100,
    shield: 50,
    maxShield: 50,
    level: 1,
    exp: 0,
    kills: 0,
    nextLevelExp: 100,
    shieldRegenTimer: 0
  };

  let camera = {
    x: 0,
    y: 0
  };

  let keys = {};
  let mouse = {
    x: 0,
    y: 0,
    active: false
  };

  // Dynamic Array Collections
  let monsters = [];
  let projectiles = [];
  let gems = [];
  let particleEffects = [];
  let floatTexts = [];
  
  // Timers & Stats tracking
  let gameTime = 0; // seconds
  let timeRemaining = 600;
  
  let weaponLevels = {
    vulcan: 0, // 0 = Locked, 1-6 = level
    missile: 0,
    shield: 0,
    boomerang: 0
  };

  let passiveLevels = {
    armor: 0, // 0 = Locked, 1-5 = level
    speed: 0,
    magnet: 0,
    focus: 0
  };

  let weaponCooldowns = {
    vulcan: 0,
    missile: 0,
    boomerang: 0
  };

  let lastSpawnTime = 0;
  let lastSecondTime = 0;
  let lastBossSpawnTime = 0;
  let scaleStepTracker = 0; // Steps of 2 minutes
  let animationId = null;

  // ==========================================
  // Lobby Event Bindings
  // ==========================================
  stageCards.forEach(card => {
    card.addEventListener("click", () => {
      stageCards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      selectedStage = parseInt(card.dataset.stage) || 1;
      initAudio();
    });
  });

  btnTimeList.forEach(btn => {
    btn.addEventListener("click", () => {
      btnTimeList.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectTimeLimit = parseInt(btn.dataset.time) || 600;
      initAudio();
    });
  });

  const btnBulletTypes = document.querySelectorAll(".btn-bullet-type");
  btnBulletTypes.forEach(btn => {
    btn.addEventListener("click", () => {
      btnBulletTypes.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedBulletType = btn.dataset.type || "straight_3way";
      initAudio();
    });
  });

  btnStartGame.addEventListener("click", () => {
    initAudio();
    startVampireGame();
  });

  // ==========================================
  // Gameplay Core Loop Controls
  // ==========================================
  function startVampireGame() {
    lobbyPanel.style.display = "none";
    gamePanel.style.display = "flex";
    
    isPlaying = true;
    isPaused = false;
    
    // Reset Stats
    player.x = 0;
    player.y = 0;
    player.angle = -Math.PI / 2;
    player.hp = 100;
    player.maxHp = 100;
    player.shield = 50;
    player.maxShield = 50;
    player.level = 1;
    player.exp = 0;
    player.kills = 0;
    player.nextLevelExp = 100;
    player.shieldRegenTimer = 0;
    
    // Reset equipment (Starter: Vulcan Level 1)
    weaponLevels.vulcan = 1;
    weaponLevels.missile = 0;
    weaponLevels.shield = 0;
    weaponLevels.boomerang = 0;
    
    passiveLevels.armor = 0;
    passiveLevels.speed = 0;
    passiveLevels.magnet = 0;
    passiveLevels.focus = 0;
    
    // Reset structures
    monsters = [];
    projectiles = [];
    gems = [];
    particleEffects = [];
    floatTexts = [];
    
    gameTime = 0;
    timeRemaining = selectTimeLimit;
    scaleStepTracker = 0;
    
    const now = Date.now();
    lastSpawnTime = now;
    lastSecondTime = now;
    lastBossSpawnTime = now;
    
    // HUD Sync
    updateHudDisplay();
    renderEquipmentIcons();
    
    // Trigger start screen overlay
    overlayTitle.textContent = STAGES[selectedStage].name;
    overlayDesc.textContent = `난이도: ${STAGES[selectedStage].difficulty} | 목표 생존 시간: ${selectTimeLimit / 60}분\n마우스 커서 방향을 따라 기체가 부드럽게 선회하며 날아갑니다.`;
    overlayBtnGroup.innerHTML = `
      <button class="btn btn-primary btn-large" id="btn-overlay-launch">
        <i class="fa-solid fa-plane-departure"></i> 활주로 이륙
      </button>
    `;
    
    gameOverlay.style.display = "flex";
    levelupOverlay.style.display = "none";
    
    document.getElementById("btn-overlay-launch").addEventListener("click", () => {
      gameOverlay.style.display = "none";
      playGameLoop();
    });
  }

  function playGameLoop() {
    if (animationId) cancelAnimationFrame(animationId);
    
    function loop(timestamp) {
      if (!isPlaying) return;
      if (!isPaused) {
        updateGameFrame();
        renderGameFrame();
      }
      animationId = requestAnimationFrame(loop);
    }
    animationId = requestAnimationFrame(loop);
  }

  // ==========================================
  // Update Frame Mechanics
  // ==========================================
  function updateGameFrame() {
    const now = Date.now();
    
    // 1. Clock Ticking
    if (now - lastSecondTime >= 1000) {
      gameTime += 1;
      timeRemaining = Math.max(0, timeRemaining - 1);
      lastSecondTime = now;
      
      updateHudDisplay();
      
      // 2-minute Enemy Scaling (120 seconds step)
      const currentScaleStep = Math.floor(gameTime / 120);
      if (currentScaleStep > scaleStepTracker) {
        scaleStepTracker = currentScaleStep;
        triggerScalingBanner();
      }
      
      // Periodic Shield regen
      if (player.shield < player.maxShield) {
        player.shieldRegenTimer++;
        if (player.shieldRegenTimer >= 3) { // Regens 5 shield every 3 seconds of safety
          player.shield = Math.min(player.maxShield, player.shield + 5);
          updateHudDisplay();
          player.shieldRegenTimer = 0;
        }
      }
      
      // Stage Victory Check
      if (timeRemaining <= 0) {
        triggerStageVictory();
        return;
      }
      
      // Boss Spawning (Every 5 minutes, or at the end based on limit)
      const isBossTime = (gameTime % 300 === 0 && gameTime > 0) || (timeRemaining <= 10 && monsters.filter(m => m.isBoss).length === 0);
      if (isBossTime && now - lastBossSpawnTime > 15000) {
        spawnBossEnemy();
        lastBossSpawnTime = now;
      }
    }
    
    // 2. Flight Angle Steering (Keyboard / Mouse)
    let steerSpeed = 0.03;
    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
      player.angle -= steerSpeed;
    }
    if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
      player.angle += steerSpeed;
    }
    
    // Mouse steering takes priority
    if (mouse.active) {
      const targetAngle = Math.atan2(mouse.y - gameCanvas.height / 2, mouse.x - gameCanvas.width / 2);
      // Smooth linear angle interpolation
      let angleDiff = targetAngle - player.angle;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      player.angle += angleDiff * 0.1; // linear lerp
    }
    
    // Keep angle normalized
    player.angle = (player.angle + Math.PI * 2) % (Math.PI * 2);
    
    // 3. Move Player (Never stops!)
    let actualSpeed = player.speed;
    if (passiveLevels.speed > 0) {
      actualSpeed *= PASSIVES_DB.speed.levels[passiveLevels.speed - 1].multiplier;
    }
    
    player.x += Math.cos(player.angle) * actualSpeed;
    player.y += Math.sin(player.angle) * actualSpeed;
    
    // Camera center lock
    camera.x = player.x - gameCanvas.width / 2;
    camera.y = player.y - gameCanvas.height / 2;
    
    // 4. Update Weapon Cooldowns & Fire Projectiles
    updateWeaponsActivation();
    
    // 5. Update Projectiles
    updateProjectilesMovement();
    
    // 6. Spawn Monsters
    const stageConf = STAGES[selectedStage];
    if (now - lastSpawnTime >= stageConf.enemySpawnRate && monsters.length < 120) {
      spawnNormalMonsters();
      lastSpawnTime = now;
    }
    
    // 7. Update Monsters
    updateMonstersMovement();
    
    // 8. Update EXP Gems (Physics & collection)
    updateExpGems();
    
    // 9. Update Particles & Floats
    updateParticleEffects();
    updateFloatTexts();
  }

  // ==========================================
  // Weapons Systems firing
  // ==========================================
  function updateWeaponsActivation() {
    const focusMultiplier = passiveLevels.focus > 0 ? PASSIVES_DB.focus.levels[passiveLevels.focus - 1].scale : 1.0;
    
    // 1. Vulcan Cannon (Fires straight forward)
    if (weaponLevels.vulcan > 0) {
      weaponCooldowns.vulcan -= 16.67; // approx ms per frame at 60fps
      if (weaponCooldowns.vulcan <= 0) {
        const specs = WEAPONS_DB.vulcan.levels[weaponLevels.vulcan - 1];
        sounds.shoot();
        
        const projSpeed = specs.speed * focusMultiplier;
        const damage = specs.damage;
        
        const type = selectedBulletType || "straight_3way";
        if (type === "straight_3way") {
          if (specs.projectiles === 1) {
            projectiles.push({
              x: player.x,
              y: player.y,
              vx: Math.cos(player.angle) * projSpeed,
              vy: Math.sin(player.angle) * projSpeed,
              radius: 3.5,
              color: "#fbbf24",
              damage,
              lifetime: 80 * focusMultiplier,
              type: "bullet"
            });
          } else if (specs.projectiles === 2) {
            const angles = [-0.1, 0.1];
            angles.forEach(ang => {
              const finalAngle = player.angle + ang;
              projectiles.push({
                x: player.x,
                y: player.y,
                vx: Math.cos(finalAngle) * projSpeed,
                vy: Math.sin(finalAngle) * projSpeed,
                radius: 3.5,
                color: "#fbbf24",
                damage,
                lifetime: 85 * focusMultiplier,
                type: "bullet"
              });
            });
          } else {
            const angles = [-0.18, 0, 0.18];
            angles.forEach(ang => {
              const finalAngle = player.angle + ang;
              projectiles.push({
                x: player.x,
                y: player.y,
                vx: Math.cos(finalAngle) * projSpeed,
                vy: Math.sin(finalAngle) * projSpeed,
                radius: 4,
                color: "#fbbf24",
                damage,
                lifetime: 90 * focusMultiplier,
                type: "bullet"
              });
            });
          }
        } else if (type === "radial") {
          let count = 4;
          if (specs.projectiles === 2) count = 6;
          else if (specs.projectiles === 3) count = 8;
          
          for (let k = 0; k < count; k++) {
            const bulletAngle = player.angle + (k * (Math.PI * 2 / count));
            projectiles.push({
              x: player.x,
              y: player.y,
              vx: Math.cos(bulletAngle) * projSpeed,
              vy: Math.sin(bulletAngle) * projSpeed,
              radius: 3.5,
              color: "#c084fc", // Purple bullet
              damage: Math.round(damage * 0.8), // Slight scaling down as count is higher
              lifetime: 70 * focusMultiplier,
              type: "bullet"
            });
          }
        } else if (type === "rear_3way") {
          const rearAngle = player.angle + Math.PI;
          if (specs.projectiles === 1) {
            projectiles.push({
              x: player.x,
              y: player.y,
              vx: Math.cos(rearAngle) * projSpeed,
              vy: Math.sin(rearAngle) * projSpeed,
              radius: 3.5,
              color: "#34d399", // Green bullet
              damage,
              lifetime: 80 * focusMultiplier,
              type: "bullet"
            });
          } else if (specs.projectiles === 2) {
            const angles = [-0.1, 0.1];
            angles.forEach(ang => {
              const finalAngle = rearAngle + ang;
              projectiles.push({
                x: player.x,
                y: player.y,
                vx: Math.cos(finalAngle) * projSpeed,
                vy: Math.sin(finalAngle) * projSpeed,
                radius: 3.5,
                color: "#34d399",
                damage,
                lifetime: 85 * focusMultiplier,
                type: "bullet"
              });
            });
          } else {
            const angles = [-0.18, 0, 0.18];
            angles.forEach(ang => {
              const finalAngle = rearAngle + ang;
              projectiles.push({
                x: player.x,
                y: player.y,
                vx: Math.cos(finalAngle) * projSpeed,
                vy: Math.sin(finalAngle) * projSpeed,
                radius: 4,
                color: "#34d399",
                damage,
                lifetime: 90 * focusMultiplier,
                type: "bullet"
              });
            });
          }
        }
        
        weaponCooldowns.vulcan = specs.fireRate;
      }
    }
    
    // 2. Seeker Missile (Fires at nearest monster)
    if (weaponLevels.missile > 0) {
      weaponCooldowns.missile -= 16.67;
      if (weaponCooldowns.missile <= 0) {
        const specs = WEAPONS_DB.missile.levels[weaponLevels.missile - 1];
        
        // Find nearest monster
        let nearest = findNearestMonster(player.x, player.y, 450);
        if (nearest) {
          sounds.shoot();
          const count = specs.count || 1;
          for (let i = 0; i < count; i++) {
            // Slight delay or scatter
            const startAngle = player.angle + (i - (count - 1) / 2) * 0.3;
            projectiles.push({
              x: player.x,
              y: player.y,
              vx: Math.cos(startAngle) * (specs.speed * 0.5), // starts slower, accelerates or tracks
              vy: Math.sin(startAngle) * (specs.speed * 0.5),
              target: nearest,
              maxSpeed: specs.speed * focusMultiplier,
              damage: specs.damage,
              radius: 5,
              explodeRadius: specs.radius,
              color: "#60a5fa",
              lifetime: 150 * focusMultiplier,
              type: "missile"
            });
          }
          weaponCooldowns.missile = specs.fireRate;
        }
      }
    }
    
    // 3. Orbit Shield (Orbits, logic updated during render/collision, no cooldown)
    
    // 4. Boomerang Blade
    if (weaponLevels.boomerang > 0) {
      weaponCooldowns.boomerang -= 16.67;
      if (weaponCooldowns.boomerang <= 0) {
        const specs = WEAPONS_DB.boomerang.levels[weaponLevels.boomerang - 1];
        const count = specs.count || 1;
        sounds.shoot();
        
        for (let i = 0; i < count; i++) {
          const shootAngle = player.angle + (i * (Math.PI * 2 / count));
          projectiles.push({
            x: player.x,
            y: player.y,
            originX: player.x,
            originY: player.y,
            angle: shootAngle,
            speed: specs.speed * focusMultiplier,
            maxDist: specs.maxDist * focusMultiplier,
            returning: false,
            damage: specs.damage,
            radius: 8,
            color: "#a78bfa",
            lifetime: 200 * focusMultiplier,
            type: "boomerang",
            hitMonsters: new Set() // prevent hitting same monster multiple times per pass
          });
        }
        weaponCooldowns.boomerang = specs.fireRate;
      }
    }
  }

  function findNearestMonster(px, py, range) {
    let nearest = null;
    let minDist = range;
    
    monsters.forEach(m => {
      const dx = m.x - px;
      const dy = m.y - py;
      const dist = Math.hypot(dx, dy);
      if (dist < minDist) {
        minDist = dist;
        nearest = m;
      }
    });
    return nearest;
  }

  function updateProjectilesMovement() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.lifetime--;
      
      if (p.lifetime <= 0) {
        projectiles.splice(i, 1);
        continue;
      }
      
      if (p.type === "bullet") {
        p.x += p.vx;
        p.y += p.vy;
      } else if (p.type === "missile") {
        // Seeker Missile Guidance
        if (p.target && monsters.includes(p.target)) {
          const dx = p.target.x - p.x;
          const dy = p.target.y - p.y;
          const dist = Math.hypot(dx, dy);
          
          // Interpolate velocity towards target
          const targetVx = (dx / dist) * p.maxSpeed;
          const targetVy = (dy / dist) * p.maxSpeed;
          
          // Guide strength
          p.vx += (targetVx - p.vx) * 0.15;
          p.vy += (targetVy - p.vy) * 0.15;
        } else {
          // Find a new nearest target
          p.target = findNearestMonster(p.x, p.y, 300);
        }
        
        p.x += p.vx;
        p.y += p.vy;
      } else if (p.type === "boomerang") {
        if (!p.returning) {
          // Move outward
          p.x += Math.cos(p.angle) * p.speed;
          p.y += Math.sin(p.angle) * p.speed;
          
          // Check distance from launch origin
          const dist = Math.hypot(p.x - p.originX, p.y - p.originY);
          if (dist >= p.maxDist) {
            p.returning = true;
          }
        } else {
          // Fly back directly towards current player position
          const dx = player.x - p.x;
          const dy = player.y - p.y;
          const dist = Math.hypot(dx, dy);
          
          if (dist < 15) {
            // Returned to player, delete
            projectiles.splice(i, 1);
            continue;
          }
          
          p.x += (dx / dist) * p.speed;
          p.y += (dy / dist) * p.speed;
        }
      }
    }
  }

  // ==========================================
  // Monster Spawning & Management
  // ==========================================
  function spawnNormalMonsters() {
    const stageConf = STAGES[selectedStage];
    // Spawn 1 to 4 monsters in a cluster
    const numToSpawn = Math.floor(Math.random() * 3) + 2;
    
    // Choose spawn angle randomly
    const angle = Math.random() * Math.PI * 2;
    // Spawns just outside game viewport
    const spawnDist = 480; 
    
    const baseCenterX = player.x + Math.cos(angle) * spawnDist;
    const baseCenterY = player.y + Math.sin(angle) * spawnDist;
    
    for (let i = 0; i < numToSpawn; i++) {
      const offsetX = (Math.random() - 0.5) * 60;
      const offsetY = (Math.random() - 0.5) * 60;
      
      const type = stageConf.enemyTypes[Math.floor(Math.random() * stageConf.enemyTypes.length)];
      const template = ENEMY_TEMPLATES[type];
      
      // Calculate 2-minute Scaling (10% HP / damage multiplier per level)
      const scaleMultiplier = 1.0 + scaleStepTracker * 0.1;
      
      monsters.push({
        x: baseCenterX + offsetX,
        y: baseCenterY + offsetY,
        hp: Math.round(template.hp * scaleMultiplier),
        maxHp: Math.round(template.hp * scaleMultiplier),
        speed: template.speed * (1.0 + scaleStepTracker * 0.05), // speed scales 5%
        damage: Math.round(template.damage * scaleMultiplier),
        exp: template.exp,
        color: template.color,
        radius: template.radius,
        shape: template.shape,
        isBoss: false,
        name: type
      });
    }
  }

  function spawnBossEnemy() {
    const stageConf = STAGES[selectedStage];
    const type = stageConf.bossType;
    const template = ENEMY_TEMPLATES[type];
    
    const angle = Math.random() * Math.PI * 2;
    const spawnX = player.x + Math.cos(angle) * 450;
    const spawnY = player.y + Math.sin(angle) * 450;
    
    // Scale Boss
    const scaleMultiplier = 1.0 + scaleStepTracker * 0.1;
    
    monsters.push({
      x: spawnX,
      y: spawnY,
      hp: Math.round(template.hp * scaleMultiplier),
      maxHp: Math.round(template.hp * scaleMultiplier),
      speed: template.speed,
      damage: Math.round(template.damage * scaleMultiplier),
      exp: template.exp,
      color: template.color,
      radius: template.radius,
      shape: template.shape,
      isBoss: true,
      name: stageConf.bossType
    });
    
    // Float Boss Notification
    floatTexts.push({
      x: player.x,
      y: player.y - 40,
      text: "⚠️ 보스 몬스터 경보! ⚠️",
      color: "#ef4444",
      size: 16,
      lifetime: 150
    });
    sounds.explode();
  }

  function updateMonstersMovement() {
    const now = Date.now();
    const defenseMultiplier = passiveLevels.armor > 0 ? (1.0 - PASSIVES_DB.armor.levels[passiveLevels.armor - 1].reduce) : 1.0;
    
    // Orbit Shield attributes if active
    const orbitActive = weaponLevels.shield > 0;
    const shieldSpecs = orbitActive ? WEAPONS_DB.shield.levels[weaponLevels.shield - 1] : null;
    const shieldOrbitAngle = (now * (shieldSpecs?.speed || 0)) % (Math.PI * 2);
    const shieldOrbitRadius = shieldSpecs?.radius || 0;
    const shieldOrbitCount = shieldSpecs?.count || 0;
    
    for (let i = monsters.length - 1; i >= 0; i--) {
      const m = monsters[i];
      
      // Calculate vector towards player
      const dx = player.x - m.x;
      const dy = player.y - m.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist > 1200) {
        // Despawn monsters that are extremely far away to recycle
        monsters.splice(i, 1);
        continue;
      }
      
      // Move monster towards player
      m.x += (dx / dist) * m.speed;
      m.y += (dy / dist) * m.speed;
      
      // Collision 1: Player Collision (Damage player)
      if (dist < m.radius + player.radius) {
        // Apply damage to Shield first, then HP
        const incomingDmg = m.damage * defenseMultiplier;
        
        if (player.shield > 0) {
          player.shield = Math.max(0, player.shield - incomingDmg);
          sounds.hit();
        } else {
          player.hp = Math.max(0, player.hp - incomingDmg);
          sounds.hurt();
        }
        
        // Safety flash / bounce monster back slightly
        m.x -= (dx / dist) * 15;
        m.y -= (dy / dist) * 15;
        
        updateHudDisplay();
        
        // Floater text
        floatTexts.push({
          x: player.x + (Math.random() - 0.5) * 30,
          y: player.y - 20,
          text: `-${Math.round(incomingDmg)}`,
          color: player.shield > 0 ? "#60a5fa" : "#ef4444",
          size: 13,
          lifetime: 40
        });
        
        // Reset shield safety timer
        player.shieldRegenTimer = 0;
        
        // Game Over Check
        if (player.hp <= 0) {
          triggerGameOver();
          return;
        }
      }
      
      // Collision 2: Orbit Shield Collision (If shield is active)
      if (orbitActive && shieldSpecs) {
        for (let j = 0; j < shieldOrbitCount; j++) {
          const orbitVal = shieldOrbitAngle + (j * (Math.PI * 2 / shieldOrbitCount));
          const shieldX = player.x + Math.cos(orbitVal) * shieldOrbitRadius;
          const shieldY = player.y + Math.sin(orbitVal) * shieldOrbitRadius;
          
          const sDist = Math.hypot(m.x - shieldX, m.y - shieldY);
          if (sDist < m.radius + 12) { // 12 is visual size of shield bubble
            // Inflict damage to monster
            m.hp -= shieldSpecs.damage;
            sounds.hit();
            
            // Push monster back
            m.x -= (dx / dist) * 20;
            m.y -= (dy / dist) * 20;
            
            // Create impact particle
            createSplatterParticles(m.x, m.y, "#a78bfa", 5);
            
            // Floating text
            floatTexts.push({
              x: m.x,
              y: m.y - 10,
              text: `${shieldSpecs.damage}`,
              color: "#c084fc",
              size: 11,
              lifetime: 30
            });
            
            break; // monster can only hit one shield orbit per tick
          }
        }
      }
      
      // Collision 3: Projectile Collisions
      for (let k = projectiles.length - 1; k >= 0; k--) {
        const p = projectiles[k];
        
        const pDist = Math.hypot(m.x - p.x, m.y - p.y);
        if (pDist < m.radius + p.radius) {
          // Collision registered!
          
          if (p.type === "bullet") {
            // Apply damage
            m.hp -= p.damage;
            createSplatterParticles(p.x, p.y, "#fbbf24", 4);
            sounds.hit();
            
            // Floating text
            floatTexts.push({
              x: m.x,
              y: m.y - 15,
              text: `${p.damage}`,
              color: "#fecdd3",
              size: 11,
              lifetime: 30
            });
            
            // Remove bullet
            projectiles.splice(k, 1);
          } else if (p.type === "missile") {
            // Explode!
            inflictAoEDamage(p.x, p.y, p.explodeRadius, p.damage);
            projectiles.splice(k, 1);
          } else if (p.type === "boomerang") {
            // Check if boomerang already hit this monster in this pass
            if (!p.hitMonsters.has(m)) {
              m.hp -= p.damage;
              p.hitMonsters.add(m);
              createSplatterParticles(p.x, p.y, "#c084fc", 5);
              sounds.hit();
              
              floatTexts.push({
                x: m.x,
                y: m.y - 15,
                text: `${p.damage}`,
                color: "#e9d5ff",
                size: 12,
                lifetime: 30
              });
            }
          }
        }
      }
      
      // Monster Death check
      if (m.hp <= 0) {
        // Drop EXP gem
        gems.push({
          x: m.x,
          y: m.y,
          exp: m.exp,
          color: m.isBoss ? "#fbbf24" : (m.exp >= 30 ? "#60a5fa" : "#a78bfa"),
          size: m.isBoss ? 8 : (m.exp >= 30 ? 6 : 4.5),
          vx: 0,
          vy: 0,
          magnetized: false
        });
        
        // Spawn death splash particles
        createSplatterParticles(m.x, m.y, m.color, m.isBoss ? 25 : 8);
        
        player.kills++;
        updateHudDisplay();
        
        // Remove monster
        monsters.splice(i, 1);
      }
    }
  }

  function inflictAoEDamage(ex, ey, radius, damage) {
    sounds.explode();
    // Explode particle ring
    createExplodeParticles(ex, ey, radius);
    
    monsters.forEach(m => {
      const dist = Math.hypot(m.x - ex, m.y - ey);
      if (dist < radius + m.radius) {
        m.hp -= damage;
        // Knock back
        const dx = m.x - ex;
        const dy = m.y - ey;
        const h = Math.hypot(dx, dy) || 1;
        m.x += (dx / h) * 30;
        m.y += (dy / h) * 30;
        
        floatTexts.push({
          x: m.x,
          y: m.y - 15,
          text: `${damage}💥`,
          color: "#fda4af",
          size: 14,
          lifetime: 35
        });
      }
    });
  }

  // ==========================================
  // EXP Gems Collectibles logic
  // ==========================================
  function updateExpGems() {
    // Determine player magnet range
    let magnetRange = 55;
    if (passiveLevels.magnet > 0) {
      magnetRange = PASSIVES_DB.magnet.levels[passiveLevels.magnet - 1].radius;
    }
    
    for (let i = gems.length - 1; i >= 0; i--) {
      const g = gems[i];
      const dx = player.x - g.x;
      const dy = player.y - g.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist < magnetRange) {
        g.magnetized = true;
      }
      
      if (g.magnetized) {
        // Sucks in towards player with accelerating velocity
        const speed = 7.5;
        g.vx += (dx / dist) * 0.5;
        g.vy += (dy / dist) * 0.5;
        // Cap speed
        const vLen = Math.hypot(g.vx, g.vy);
        if (vLen > speed) {
          g.vx = (g.vx / vLen) * speed;
          g.vy = (g.vy / vLen) * speed;
        }
        
        g.x += g.vx;
        g.y += g.vy;
      }
      
      // Collection Collision
      if (dist < player.radius + g.size) {
        // Collect!
        sounds.gem();
        addExperience(g.exp);
        gems.splice(i, 1);
      }
    }
  }

  function addExperience(amt) {
    player.exp += amt;
    
    // Level Up Loop (Can level up multiple times at once if massive exp)
    if (player.exp >= player.nextLevelExp) {
      player.exp -= player.nextLevelExp;
      player.level++;
      player.nextLevelExp = Math.round(player.level * 100 + (player.level - 1) * (player.level - 1) * 35);
      
      sounds.levelUp();
      triggerLevelUpOverlay();
    }
    updateHudDisplay();
  }

  // ==========================================
  // Upgrade Modal Options Selection
  // ==========================================
  function triggerLevelUpOverlay() {
    isPaused = true;
    
    // Choose 3 random upgrade choices
    const choices = generateUpgradeChoices();
    
    upgradeCardsList.innerHTML = "";
    
    if (choices.length === 0) {
      // All items maxed out! Offer gold or HP recovery
      const fallbackCard = document.createElement("div");
      fallbackCard.className = "upgrade-card glass-panel";
      fallbackCard.innerHTML = `
        <div class="upgrade-card-icon"><i class="fa-solid fa-heart text-red"></i></div>
        <div class="upgrade-card-info">
          <div class="upgrade-card-title-row">
            <h4>기체 수리 및 완충</h4>
            <span class="upgrade-type-badge">MAX OUT BONUS</span>
          </div>
          <p class="upgrade-card-desc">기체의 내구도(HP)와 배터리를 완전히 충전합니다.</p>
        </div>
      `;
      fallbackCard.addEventListener("click", () => {
        player.hp = player.maxHp;
        player.shield = player.maxShield;
        resumeGameplay();
      });
      upgradeCardsList.appendChild(fallbackCard);
    } else {
      choices.forEach(opt => {
        const card = document.createElement("div");
        card.className = "upgrade-card glass-panel";
        
        const isWeapon = opt.type === "weapon";
        const icon = isWeapon ? getWeaponIcon(opt.key) : getPassiveIcon(opt.key);
        const name = opt.name;
        const currentLvl = opt.currentLevel;
        const nextLvl = currentLvl + 1;
        const desc = opt.description;
        
        card.innerHTML = `
          <div class="upgrade-card-icon">${icon}</div>
          <div class="upgrade-card-info">
            <div class="upgrade-card-title-row">
              <h4>${name} (Lv.${nextLvl})</h4>
              <span class="upgrade-type-badge">${isWeapon ? "무기 부품" : "강화 부품"}</span>
            </div>
            <p class="upgrade-card-desc">${desc}</p>
          </div>
        `;
        
        card.addEventListener("click", () => {
          applyUpgradeSelection(opt.type, opt.key);
          resumeGameplay();
        });
        
        upgradeCardsList.appendChild(card);
      });
    }
    
    levelupOverlay.style.display = "flex";
  }

  function generateUpgradeChoices() {
    const list = [];
    
    // Weapons check
    Object.entries(WEAPONS_DB).forEach(([key, weapon]) => {
      const curLvl = weaponLevels[key];
      if (curLvl < weapon.levels.length) {
        // If locked (curLvl = 0), check if player slots are full
        const activeWeaponKeys = Object.keys(weaponLevels).filter(k => weaponLevels[k] > 0);
        if (curLvl > 0 || activeWeaponKeys.length < 4) { // slots cap at 4
          const nextSpecs = weapon.levels[curLvl];
          list.push({
            type: "weapon",
            key,
            name: weapon.name,
            currentLevel: curLvl,
            description: curLvl === 0 ? weapon.desc : `공격력: ${nextSpecs.damage} | 쿨타임 단축 등 능력 강화`,
            priority: curLvl === 0 ? 3 : 1
          });
        }
      }
    });
    
    // Passives check
    Object.entries(PASSIVES_DB).forEach(([key, passive]) => {
      const curLvl = passiveLevels[key];
      if (curLvl < passive.levels.length) {
        const activePassiveKeys = Object.keys(passiveLevels).filter(k => passiveLevels[k] > 0);
        if (curLvl > 0 || activePassiveKeys.length < 4) { // slots cap at 4
          const nextSpecs = passive.levels[curLvl];
          list.push({
            type: "passive",
            key,
            name: passive.name,
            currentLevel: curLvl,
            description: nextSpecs.label,
            priority: curLvl === 0 ? 2 : 1
          });
        }
      }
    });
    
    // Shuffle and pick 3
    list.sort(() => Math.random() - 0.5);
    return list.slice(0, 3);
  }

  function applyUpgradeSelection(type, key) {
    if (type === "weapon") {
      weaponLevels[key]++;
      // Initialize cooldown
      if (weaponLevels[key] === 1 && key !== "shield") {
        weaponCooldowns[key] = WEAPONS_DB[key].levels[0].fireRate;
      }
    } else {
      passiveLevels[key]++;
    }
    
    // Re-render dashboard slots
    renderEquipmentIcons();
    updateHudDisplay();
  }

  function resumeGameplay() {
    levelupOverlay.style.display = "none";
    isPaused = false;
  }

  // ==========================================
  // Visual Effects & Particle Generators
  // ==========================================
  function createSplatterParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.5 + 0.5;
      particleEffects.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 1.5,
        color,
        alpha: 1.0,
        decay: Math.random() * 0.04 + 0.02,
        type: "splatter"
      });
    }
  }

  function createExplodeParticles(x, y, radius) {
    // Draw expansion ring
    for (let angle = 0; angle < Math.PI * 2; angle += 0.25) {
      const vx = Math.cos(angle) * 3;
      const vy = Math.sin(angle) * 3;
      particleEffects.push({
        x,
        y,
        vx,
        vy,
        radius: Math.random() * 4 + 2,
        color: "#f87171",
        alpha: 1.0,
        decay: 0.03,
        type: "fire"
      });
    }
  }

  function updateParticleEffects() {
    for (let i = particleEffects.length - 1; i >= 0; i--) {
      const p = particleEffects[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      
      if (p.alpha <= 0) {
        particleEffects.splice(i, 1);
      }
    }
  }

  function updateFloatTexts() {
    for (let i = floatTexts.length - 1; i >= 0; i--) {
      const t = floatTexts[i];
      t.y -= 0.5; // floats up
      t.lifetime--;
      
      if (t.lifetime <= 0) {
        floatTexts.splice(i, 1);
      }
    }
  }

  // ==========================================
  // Canvas Steering Steering Screen Renderers
  // ==========================================
  function renderGameFrame() {
    // Clear screen
    ctx.fillStyle = STAGES[selectedStage].bgColor;
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Draw background infinite coordinates grid
    renderGridBackground();
    
    // Draw EXP gems
    gems.forEach(g => {
      ctx.save();
      ctx.beginPath();
      // Draw diamond shape
      ctx.translate(g.x - camera.x, g.y - camera.y);
      ctx.moveTo(0, -g.size);
      ctx.lineTo(g.size * 0.7, 0);
      ctx.lineTo(0, g.size);
      ctx.lineTo(-g.size * 0.7, 0);
      ctx.closePath();
      ctx.fillStyle = g.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = g.color;
      ctx.fill();
      ctx.restore();
    });
    
    // Draw projectiles
    projectiles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x - camera.x, p.y - camera.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = p.type === "missile" ? 10 : 4;
      ctx.shadowColor = p.color;
      ctx.fill();
    });
    
    // Draw Orbit Shield Orbit (Behind player, orbiting around player position)
    if (weaponLevels.shield > 0) {
      const specs = WEAPONS_DB.shield.levels[weaponLevels.shield - 1];
      const count = specs.count;
      const rad = specs.radius;
      const angleOffset = (Date.now() * specs.speed) % (Math.PI * 2);
      
      for (let j = 0; j < count; j++) {
        const orbitAngle = angleOffset + (j * (Math.PI * 2 / count));
        const orbX = player.x + Math.cos(orbitAngle) * rad;
        const orbY = player.y + Math.sin(orbitAngle) * rad;
        
        // Draw satellite glow ring
        ctx.beginPath();
        ctx.arc(orbX - camera.x, orbY - camera.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(192, 132, 252, 0.4)";
        ctx.strokeStyle = "#c084fc";
        ctx.lineWidth = 2;
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#c084fc";
        ctx.fill();
        ctx.stroke();
        
        // Inner core
        ctx.beginPath();
        ctx.arc(orbX - camera.x, orbY - camera.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      }
    }
    
    // Draw monsters
    monsters.forEach(m => {
      ctx.save();
      ctx.translate(m.x - camera.x, m.y - camera.y);
      
      // HP bar for injured monsters
      if (m.hp < m.maxHp) {
        const barW = m.radius * 2;
        const barH = 3;
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(-m.radius, -m.radius - 8, barW, barH);
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(-m.radius, -m.radius - 8, barW * (m.hp / m.maxHp), barH);
      }
      
      // Draw shapes
      ctx.fillStyle = m.color;
      ctx.shadowBlur = m.isBoss ? 15 : 4;
      ctx.shadowColor = m.color;
      
      ctx.beginPath();
      if (m.shape === "circle") {
        ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
      } else if (m.shape === "square") {
        ctx.rect(-m.radius, -m.radius, m.radius * 2, m.radius * 2);
      } else if (m.shape === "triangle") {
        ctx.moveTo(0, -m.radius);
        ctx.lineTo(m.radius, m.radius);
        ctx.lineTo(-m.radius, m.radius);
        ctx.closePath();
      } else if (m.shape === "bat") {
        // Draw bat wings
        ctx.moveTo(-m.radius * 1.5, -m.radius * 0.3);
        ctx.quadraticCurveTo(0, -m.radius * 0.8, m.radius * 1.5, -m.radius * 0.3);
        ctx.quadraticCurveTo(m.radius * 0.4, m.radius * 0.8, 0, m.radius * 0.3);
        ctx.quadraticCurveTo(-m.radius * 0.4, m.radius * 0.8, -m.radius * 1.5, -m.radius * 0.3);
        ctx.arc(0, 0, m.radius * 0.6, 0, Math.PI * 2);
      } else if (m.shape === "yeti") {
        // Broad oval
        ctx.ellipse(0, 0, m.radius, m.radius * 1.25, 0, 0, Math.PI * 2);
      } else if (m.shape === "dog") {
        // Horizontal capsule
        ctx.ellipse(0, 0, m.radius * 1.2, m.radius * 0.75, 0, 0, Math.PI * 2);
      } else {
        // imp / standard polygon
        ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
        // horns
        ctx.moveTo(-m.radius * 0.5, -m.radius * 0.8);
        ctx.lineTo(-m.radius * 0.3, -m.radius * 1.2);
        ctx.moveTo(m.radius * 0.5, -m.radius * 0.8);
        ctx.lineTo(m.radius * 0.3, -m.radius * 1.2);
      }
      ctx.fill();
      
      // Boss Crown
      if (m.isBoss) {
        ctx.beginPath();
        ctx.moveTo(-m.radius * 0.4, -m.radius * 1.1);
        ctx.lineTo(-m.radius * 0.4, -m.radius * 1.4);
        ctx.lineTo(-m.radius * 0.1, -m.radius * 1.2);
        ctx.lineTo(0, -m.radius * 1.5);
        ctx.lineTo(m.radius * 0.1, -m.radius * 1.2);
        ctx.lineTo(m.radius * 0.4, -m.radius * 1.4);
        ctx.lineTo(m.radius * 0.4, -m.radius * 1.1);
        ctx.fillStyle = "#facc15";
        ctx.fill();
      }
      
      ctx.restore();
    });
    
    // Draw Particle Effects
    particleEffects.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x - camera.x, p.y - camera.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 1.0; // Reset
    });
    
    // Draw Player Jet (Constant center of screen coordinate mapping)
    ctx.save();
    ctx.translate(player.x - camera.x, player.y - camera.y);
    ctx.rotate(player.angle);
    
    // Jet Engine fire flame trail
    const engineFlameLength = 10 + Math.random() * 8;
    ctx.beginPath();
    ctx.moveTo(-15, -4);
    ctx.lineTo(-15 - engineFlameLength, 0);
    ctx.lineTo(-15, 4);
    ctx.closePath();
    const grad = ctx.createLinearGradient(-15, 0, -15 - engineFlameLength, 0);
    grad.addColorStop(0, "#fb923c");
    grad.addColorStop(1, "rgba(239, 68, 68, 0)");
    ctx.fillStyle = grad;
    ctx.fill();
    
    // Draw Jet Body Shape (Neon purple/blue metallic)
    ctx.beginPath();
    ctx.moveTo(18, 0);       // Nose cone
    ctx.lineTo(-6, -14);     // Left wing tip
    ctx.lineTo(-4, -4);      // Left stabilizer
    ctx.lineTo(-15, -5);     // Left engine exhaust
    ctx.lineTo(-15, 5);      // Right engine exhaust
    ctx.lineTo(-4, 4);       // Right stabilizer
    ctx.lineTo(-6, 14);      // Right wing tip
    ctx.closePath();
    
    ctx.fillStyle = "#1e1b4b";
    ctx.strokeStyle = "#a78bfa";
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#8b5cf6";
    ctx.fill();
    ctx.stroke();
    
    // Canopy Glass (Cockpit)
    ctx.beginPath();
    ctx.ellipse(3, 0, 7, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#60a5fa";
    ctx.shadowBlur = 0;
    ctx.fill();
    
    ctx.restore();
    
    // Draw damage popup float texts
    floatTexts.forEach(t => {
      ctx.font = `bold ${t.size}px ${varDisplay()}`;
      ctx.fillStyle = t.color;
      ctx.textAlign = "center";
      ctx.fillText(t.text, t.x - camera.x, t.y - camera.y);
    });
  }

  function varDisplay() {
    return 'Outfit, Noto Sans KR, sans-serif';
  }

  function renderGridBackground() {
    const stageConf = STAGES[selectedStage];
    ctx.strokeStyle = stageConf.gridColor;
    ctx.lineWidth = 1;
    
    const gridSize = 80;
    
    // Top-left boundary of grid draw based on camera location
    const startX = Math.floor(camera.x / gridSize) * gridSize;
    const startY = Math.floor(camera.y / gridSize) * gridSize;
    
    for (let x = startX; x < startX + gameCanvas.width + gridSize; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x - camera.x, 0);
      ctx.lineTo(x - camera.x, gameCanvas.height);
      ctx.stroke();
    }
    for (let y = startY; y < startY + gameCanvas.height + gridSize; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y - camera.y);
      ctx.lineTo(gameCanvas.width, y - camera.y);
      ctx.stroke();
    }
  }

  // ==========================================
  // HUD Displays refresh
  // ==========================================
  function updateHudDisplay() {
    hudLevel.textContent = player.level;
    hudKills.textContent = player.kills;
    
    // Time formatted mm:ss
    const mins = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
    const secs = String(timeRemaining % 60).padStart(2, '0');
    hudTimer.textContent = `${mins}:${secs}`;
    
    // Exp bar percent
    const expPercent = Math.min((player.exp / player.nextLevelExp) * 100, 100);
    expBarFill.style.width = `${expPercent}%`;
    expBarText.textContent = `EXP ${Math.round(expPercent)}% (${player.exp}/${player.nextLevelExp})`;
    
    // HP bar percent
    const hpPercent = Math.max((player.hp / player.maxHp) * 100, 0);
    hpBarFill.style.width = `${hpPercent}%`;
    hpValueText.textContent = `${Math.round(player.hp)}/${player.maxHp}`;
    
    // Shield bar percent
    const shieldPercent = Math.max((player.shield / player.maxShield) * 100, 0);
    shieldBarFill.style.width = `${shieldPercent}%`;
    shieldValueText.textContent = `${Math.round(player.shield)}/${player.maxShield}`;
  }

  function renderEquipmentIcons() {
    // 1. Render Active Weapons
    weaponSlotsContainer.innerHTML = "";
    Object.entries(weaponLevels).forEach(([key, lvl]) => {
      const isOccupied = lvl > 0;
      const slot = document.createElement("div");
      slot.className = `slot-icon-badge ${isOccupied ? 'occupied' : ''}`;
      slot.title = isOccupied ? `${WEAPONS_DB[key].name} (Lv.${lvl})` : "장착 대기 슬롯";
      
      slot.innerHTML = isOccupied ? getWeaponIcon(key) : `<i class="fa-solid fa-plus text-dark"></i>`;
      if (isOccupied) {
        slot.innerHTML += `<span class="slot-level-indicator">${lvl}</span>`;
      }
      weaponSlotsContainer.appendChild(slot);
    });
    
    // 2. Render Boost Passives
    passiveSlotsContainer.innerHTML = "";
    Object.entries(passiveLevels).forEach(([key, lvl]) => {
      const isOccupied = lvl > 0;
      const slot = document.createElement("div");
      slot.className = `slot-icon-badge ${isOccupied ? 'occupied-passive' : ''}`;
      slot.title = isOccupied ? `${PASSIVES_DB[key].name} (Lv.${lvl})` : "장착 대기 슬롯";
      
      slot.innerHTML = isOccupied ? getPassiveIcon(key) : `<i class="fa-solid fa-plus text-dark"></i>`;
      if (isOccupied) {
        slot.innerHTML += `<span class="slot-level-indicator">${lvl}</span>`;
      }
      passiveSlotsContainer.appendChild(slot);
    });
  }

  function getWeaponIcon(key) {
    switch (key) {
      case "vulcan": return `<i class="fa-solid fa-bolt"></i>`;
      case "missile": return `<i class="fa-solid fa-rocket"></i>`;
      case "shield": return `<i class="fa-solid fa-shield-halved"></i>`;
      case "boomerang": return `<i class="fa-solid fa-compass"></i>`;
      default: return `<i class="fa-solid fa-circle-question"></i>`;
    }
  }

  function getPassiveIcon(key) {
    switch (key) {
      case "armor": return `<i class="fa-solid fa-shield text-blue"></i>`;
      case "speed": return `<i class="fa-solid fa-gauge-high text-purple"></i>`;
      case "magnet": return `<i class="fa-solid fa-magnet text-red"></i>`;
      case "focus": return `<i class="fa-solid fa-eye text-gold"></i>`;
      default: return `<i class="fa-solid fa-circle-question"></i>`;
    }
  }

  // ==========================================
  // Trigger alerts overlays (Victory / Defeat)
  // ==========================================
  function triggerScalingBanner() {
    scalingAlertBanner.style.display = "block";
    sounds.explode();
    setTimeout(() => {
      scalingAlertBanner.style.display = "none";
    }, 3500);
  }

  function triggerGameOver() {
    isPlaying = false;
    if (animationId) cancelAnimationFrame(animationId);
    sounds.gameOver();
    
    overlayTitle.textContent = "작전 중 산화! (GAME OVER)";
    overlayDesc.textContent = `비행기의 동력이 끊어지거나 내구도가 다했습니다.\n생존 시간: ${formatTime(gameTime)} | 처치한 적: ${player.kills}기 | 달성 레벨: ${player.level}레벨`;
    overlayBtnGroup.innerHTML = `
      <button class="btn btn-primary btn-large" id="btn-overlay-retry">
        <i class="fa-solid fa-rotate-left"></i> 재시도하기
      </button>
      <button class="btn btn-secondary" id="btn-overlay-lobby">
        <i class="fa-solid fa-circle-left"></i> 기지로 귀환 (로비)
      </button>
    `;
    gameOverlay.style.display = "flex";
    
    document.getElementById("btn-overlay-retry").addEventListener("click", () => {
      startVampireGame();
    });
    document.getElementById("btn-overlay-lobby").addEventListener("click", () => {
      returnToLobby();
    });
  }

  function triggerStageVictory() {
    isPlaying = false;
    if (animationId) cancelAnimationFrame(animationId);
    sounds.victory();
    
    overlayTitle.textContent = "생존 임무 성공! (VICTORY)";
    overlayDesc.textContent = `목표한 시간 동안 적들의 포위망을 뚫고 안전하게 복귀했습니다!\n생존 시간: ${formatTime(gameTime)} | 처치한 적: ${player.kills}기 | 최종 달성 레벨: ${player.level}레벨`;
    overlayBtnGroup.innerHTML = `
      <button class="btn btn-primary btn-large" id="btn-overlay-success-retry">
        <i class="fa-solid fa-plane"></i> 다시 생존 도전
      </button>
      <button class="btn btn-secondary" id="btn-overlay-success-lobby">
        <i class="fa-solid fa-house"></i> 기지 복귀
      </button>
    `;
    gameOverlay.style.display = "flex";
    
    document.getElementById("btn-overlay-success-retry").addEventListener("click", () => {
      startVampireGame();
    });
    document.getElementById("btn-overlay-success-lobby").addEventListener("click", () => {
      returnToLobby();
    });
  }

  function returnToLobby() {
    gameOverlay.style.display = "none";
    gamePanel.style.display = "none";
    lobbyPanel.style.display = "block";
    isPlaying = false;
    isPaused = false;
    if (animationId) cancelAnimationFrame(animationId);
  }

  function formatTime(sec) {
    const mins = String(Math.floor(sec / 60)).padStart(2, '0');
    const secs = String(sec % 60).padStart(2, '0');
    return `${mins}분 ${secs}초`;
  }

  // ==========================================
  // Mouse Pointer & Keys Bindings
  // ==========================================
  window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    
    // Pause trigger
    if (e.key === "Escape" || e.key === "p" || e.key === "P") {
      if (isPlaying && !levelupOverlay.style.display.includes("flex")) {
        togglePauseMenu();
      }
    }
  });

  window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });

  // Track mouse movements relative to canvas
  gameCanvas.addEventListener("mousemove", (e) => {
    const rect = gameCanvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });

  gameCanvas.addEventListener("mouseleave", () => {
    mouse.active = false;
  });

  // Touch Steer Joystick for Mobile Devices
  const touchSteerZone = document.getElementById("touch-steer-zone");
  touchSteerZone.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const rect = touchSteerZone.getBoundingClientRect();
    const touch = e.touches[0];
    const relativeX = touch.clientX - (rect.left + rect.width / 2);
    
    // steering rotation change
    const steerFactor = 0.05;
    if (relativeX < -15) {
      player.angle -= steerFactor;
    } else if (relativeX > 15) {
      player.angle += steerFactor;
    }
  }, { passive: false });

  // Pause Menu controls
  btnPauseGame.addEventListener("click", () => {
    if (isPlaying) {
      togglePauseMenu();
    }
  });

  function togglePauseMenu() {
    isPaused = !isPaused;
    if (isPaused) {
      overlayTitle.textContent = "작전 일시 중지";
      overlayDesc.textContent = `현재 게임이 일시정지 상태입니다.\n설정 변경 및 준비가 완료되면 이륙 상태를 이어받아 전장에 참여하세요.`;
      overlayBtnGroup.innerHTML = `
        <button class="btn btn-primary btn-large" id="btn-overlay-resume">
          <i class="fa-solid fa-play"></i> 작전 재개
        </button>
        <button class="btn btn-secondary" id="btn-overlay-abort">
          <i class="fa-solid fa-rectangle-xmark"></i> 작전 중단 (로비로 귀환)
        </button>
      `;
      gameOverlay.style.display = "flex";
      
      document.getElementById("btn-overlay-resume").addEventListener("click", () => {
        gameOverlay.style.display = "none";
        isPaused = false;
      });
      document.getElementById("btn-overlay-abort").addEventListener("click", () => {
        returnToLobby();
      });
    } else {
      gameOverlay.style.display = "none";
    }
  }

  // ==========================================
  // Encyclopedia guidebook displays
  // ==========================================
  const GUIDE_DATA = {
    1: {
      title: "서바이벌 개요",
      badge: "가이드 01: 개요",
      content: `
        <p><strong>비행기 서바이벌 슈터 (Vampire Planes)</strong>는 끊임없이 날아오는 적기 및 외계 생명체의 밀집 포위망 속에서, 기체를 조종하며 획득한 성능 보석(EXP)을 통해 다차원 무기를 레벨업하고 최종 작전 제한 시간 동안 버티는 액션 서바이벌 탄막 슈터 게임입니다.</p>
        <h4>🏆 작전 승리 요건</h4>
        <ul>
          <li>설정한 생존 시간(10분 / 20분 / 30분) 동안 내구도가 고갈되지 않고 비행을 완주하면 <strong>임무 성공</strong>으로 분류되며 작전 승리 팝업이 노출됩니다.</li>
          <li>기체 내구도(HP)가 0 이하로 떨어지면 <strong>작전 산화(GAME OVER)</strong>가 됩니다.</li>
        </ul>
      `
    },
    2: {
      title: "비행기 활공 조작법",
      badge: "가이드 02: 기체 비행",
      content: `
        <p>비행 시뮬레이터 특성상 기체는 이륙 후 <strong>절대로 정지하지 않고 등속 또는 아이템 가중치 속도로 비행</strong>을 이어갑니다.</p>
        <h4>🎮 두 가지 조종 궤적</h4>
        <ul>
          <li><strong>마우스 조종 (기본/권장)</strong>: 게임 스크린 캔버스 내 마우스의 좌표를 계산하여 해당 방향으로 기체가 부드럽게 각도를 선회하여 쫓아가므로 직관적인 궤적을 그릴 수 있습니다.</li>
          <li><strong>키보드 조종</strong>: <strong>← , →</strong> 또는 <strong>A , D</strong> 키를 입력하면 비행기가 회전 반경을 그리며 좌/우로 돕니다.</li>
          <li><strong>모바일 조종</strong>: 하단의 조종 유도 패드를 터치하여 드래그하는 방향으로 비행 각도를 선회할 수 있습니다.</li>
        </ul>
      `
    },
    3: {
      title: "무기 체계 백서 (4종)",
      badge: "가이드 03: 무기 도감",
      content: `
        <p>기체에 탑재할 수 있는 고화력 자동 공격 장치 목록입니다. 최대 4개의 무기 슬롯을 가집니다.</p>
        <h4>🔫 무기 리스트 및 강화 성능</h4>
        <ul>
          <li><strong>기본 기관포 (Vulcan Cannon)</strong>: 기체 정면으로 철갑 미사일을 연사합니다. 레벨 3부터는 2발, 레벨 5부터는 3발씩 산탄 분무 공격을 수행합니다.</li>
          <li><strong>유도 미사일 (Seeker Missile)</strong>: 레이더 반경 내 가장 가까운 적을 탐색하여 타격합니다. 충돌 시 주위의 적까지 한번에 무력화하는 폭발 스플래시 피해를 줍니다.</li>
          <li><strong>위성 빔 실드 (Orbit Shield)</strong>: 기체 주위를 회전하는 보호 물체가 형성되어 닿는 적들을 넉백시키고 다중 타격 피해를 입힙니다. 레벨 6에는 5개의 빔이 동시에 호위합니다.</li>
          <li><strong>부메랑 서큘러 (Boomerang Circular)</strong>: 비행기 뒤편/주변에서 발사되어 외곽 구역까지 전개된 후 다시 비행기로 돌아오며, 경로상의 모든 적을 다중 관통하여 궤멸시킵니다.</li>
        </ul>
      `
    },
    4: {
      title: "보조 부품 리스트 (4종)",
      badge: "가이드 04: 보조 부품",
      content: `
        <p>기체 보조 장치들을 장착해 기동성과 수집 반경을 극대화합니다. 최대 4개의 파츠 슬롯을 가집니다.</p>
        <h4>⚙️ 부품 리스트 및 효과</h4>
        <ul>
          <li><strong>합금 복합장갑 (Wing Armor)</strong>: 몬스터 및 발사체와 기체가 직접 충돌 시 가해지는 대미지를 <strong>15%~65% 경감</strong>시킵니다.</li>
          <li><strong>과충전 추진 부스터 (Engine Boost)</strong>: 기체의 활공 엔진 출력을 개조하여 이동 속도를 <strong>15%~75% 상승</strong>시킵니다. 적들의 포위망을 돌파하는 데 필수적입니다.</li>
          <li><strong>전자기 자석 수신기 (Electro Magnet)</strong>: 젬 수집 반경을 <strong>95px에서 280px까지</strong> 단계적으로 획득하여 무리한 이동 없이 빠른 성장을 도모할 수 있습니다.</li>
          <li><strong>포커스 증폭 렌즈 (Focus Lens)</strong>: 무기 투사체의 탄속을 가속화하고 유효 범위를 넓혀 몬스터들이 접근하기 전에 미리 격추할 수 있도록 돕습니다.</li>
        </ul>
      `
    },
    5: {
      title: "적 군단 스폰 & 보스",
      badge: "가이드 05: 군단 정보",
      content: `
        <p>작전 중 기체를 요격하러 모여드는 적 부대 편대 정보입니다.</p>
        <h4>👾 요격 편대 유형</h4>
        <ul>
          <li><strong>일반 편대 (스폰)</strong>: 화면 가두기 영역 외곽에서 끊임없이 무리를 지어 스폰되며 최단거리로 기체를 향해 돌진합니다. 스테이지가 높을수록 맷집과 이동 능력이 대폭 향상됩니다.</li>
          <li><strong>위협적 보스 (Boss Alert)</strong>: 매 5분 주기로 거대 보스 몬스터가 특별한 사이렌 경보음과 함께 스폰됩니다. 보스는 아주 두터운 장갑과 강력한 위력을 가지고 있으므로, 부메랑 및 유도탄을 활용해 외곽 궤도로 선회 비행하며 대미지를 지속 주어야 처치 가능합니다.</li>
        </ul>
      `
    },
    6: {
      title: "2분 주기 복리 강화 공식",
      badge: "가이드 06: 난이도 강화",
      content: `
        <p>비행 시간이 지속될수록 전장 환경의 물리 법칙이 중첩 가속되어 적들이 일률적으로 강력해집니다.</p>
        <h4>📈 적 스펙 2분 주기 상승 로직</h4>
        <ul>
          <li>경과 시간 <strong>120초 (2분) 단위로 모든 스폰 적기들의 최대 체력(HP)과 대미지가 10%씩 복리로 강해집니다.</strong></li>
          <li>적들의 비행 속도 또한 2분마다 <strong>5%씩 가속</strong>됩니다.</li>
          <li>난이도 강화 시점마다 화면 중앙 상단에 빨간색 해골 경고 배너가 나타납니다. 레벨을 빠르게 올리지 못하면 4분 이후 포위망을 뚫지 못해 피격당하므로 신속하게 경험치를 모아야 합니다.</li>
        </ul>
      `
    },
    7: {
      title: "5대 작전 스테이지 세부 정보",
      badge: "가이드 07: 작전 스테이지",
      content: `
        <p>총 5가지의 난이도별 스테이지 환경이 작전 기지에 존재합니다.</p>
        <h4>🗺️ 테마 정보</h4>
        <ul>
          <li><strong>스테이지 1: 초보자의 숲 (EASY)</strong> - 느리고 편안한 고블린/박쥐 대형 출몰. 잔디 패턴.</li>
          <li><strong>스테이지 2: 사막의 무덤 (NORMAL)</strong> - 사막 뼈대와 빠른 전갈 몬스터 배합.</li>
          <li><strong>스테이지 3: 얼어붙은 호수 (HARD)</strong> - 얼음 점박이 슬라임과 고내구도 설인(Yeti)이 등장합니다.</li>
          <li><strong>스테이지 4: 화산 동굴 (VERY HARD)</strong> - 화염 임프 군대가 엄청난 돌격 속도로 날아옵니다.</li>
          <li><strong>스테이지 5: 지옥의 심연 (CHAOS)</strong> - 검은 데몬과 불지옥 하운드가 최고 속도로 스폰되어 극단적인 조종 능력을 요합니다.</li>
        </ul>
      `
    },
    8: {
      title: "생존 초점 가이드 & 팁",
      badge: "가이드 08: 생존 공략",
      content: `
        <p>비행 서바이버 전장에서 살아남기 위한 베테랑 조종사의 핵심 작전 지침서입니다.</p>
        <h4>💡 생존 가이드라인</h4>
        <ul>
          <li><strong>한 방향 뺑뺑이 돌기 금지</strong>: 비행기가 계속해서 날아가므로 넓은 공간을 원형으로 선회 비행하여 적들을 한 덩어리로 뭉치게 유도한 후, 관통 무기(부메랑, 실드)가 격파해 만든 구멍으로 치고 나가는 전술을 구사하십시오.</li>
          <li><strong>초반 전자기 자석(Magnet) 투자 추천</strong>: 젬 수집 범위가 넓어질수록 기동 중에 멀리 떨어진 경험치 아이템을 흡수할 수 있어 레벨 성장이 기하급수적으로 빨라집니다.</li>
          <li><strong>에너지 보호막(Shield) 관리</strong>: 보호막은 대미지를 우선 차단하며, 피해를 입지 않고 3초 이상 안정적으로 비행을 지속할 경우 매 초당 빠른 속도로 자가 완충됩니다. 체력이 소모되지 않도록 보호막 완충 주기를 잘 타는 것이 급선무입니다.</li>
        </ul>
      `
    }
  };

  guideTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      guideTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      const idx = parseInt(tab.dataset.index) || 1;
      const data = GUIDE_DATA[idx];
      
      if (data) {
        guideTitleBadge.innerHTML = `<i class="fa-solid fa-circle-info text-purple"></i> ${data.badge}`;
        guideTitle.textContent = data.title;
        guideText.innerHTML = data.content;
      }
    });
  });

  // Trigger first tab details initially
  if (guideTabs.length > 0) {
    guideTabs[0].click();
  }

});
