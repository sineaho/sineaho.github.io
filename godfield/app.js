/**
 * CineAHO Premium God Field (갓 필드) Game Engine
 * 100% Client-side Serverless Card Battle Simulator
 */

// Sound Synthesizer using Web Audio API
const SoundEngine = {
  ctx: null,
  volume: 3, // Default level 3 out of 5

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  },

  setVolume(level) {
    this.volume = Math.max(0, Math.min(5, level));
  },

  getGain() {
    if (!this.ctx) return 0;
    return (this.volume / 5) * 0.15; // capped to avoid cracking
  },

  play(type) {
    if (!this.ctx) this.init();
    if (!this.ctx || this.volume === 0) return;
    
    // Resume context if suspended (browser security)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    const baseGain = this.getGain();

    switch (type) {
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        gainNode.gain.setValueAtTime(baseGain * 0.5, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
        break;

      case 'draw':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.15);
        gainNode.gain.setValueAtTime(baseGain * 0.7, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
        break;

      case 'attack':
        // Exploding noise style
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(40, t + 0.3);
        gainNode.gain.setValueAtTime(baseGain * 1.2, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        break;

      case 'heal':
        // Magical chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, t); // C5
        osc.frequency.setValueAtTime(659.25, t + 0.07); // E5
        osc.frequency.setValueAtTime(783.99, t + 0.14); // G5
        osc.frequency.setValueAtTime(1046.50, t + 0.21); // C6
        gainNode.gain.setValueAtTime(baseGain * 0.8, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
        osc.start(t);
        osc.stop(t + 0.4);
        break;

      case 'curse':
        // Dark buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, t);
        osc.frequency.linearRampToValueAtTime(80, t + 0.4);
        gainNode.gain.setValueAtTime(baseGain * 1.0, t);
        gainNode.gain.setValueAtTime(baseGain * 1.0, t + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
        osc.start(t);
        osc.stop(t + 0.4);
        break;

      case 'reflect':
        // Metallic ding
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1600, t);
        gainNode.gain.setValueAtTime(baseGain * 1.0, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
        osc.start(t);
        osc.stop(t + 0.25);
        break;

      case 'death':
        // Ascending chime minor
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t); // A4
        osc.frequency.setValueAtTime(523.25, t + 0.1); // C5
        osc.frequency.setValueAtTime(392, t + 0.2); // G4
        osc.frequency.linearRampToValueAtTime(110, t + 0.6);
        gainNode.gain.setValueAtTime(baseGain * 0.9, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
        osc.start(t);
        osc.stop(t + 0.6);
        break;
      
      case 'win':
        // Major fanfare
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, t); // C5
        osc.frequency.setValueAtTime(659.25, t + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, t + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, t + 0.3); // C6
        osc.frequency.setValueAtTime(1318.51, t + 0.5); // E6
        gainNode.gain.setValueAtTime(baseGain * 1.0, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
        osc.start(t);
        osc.stop(t + 0.8);
        break;
    }
  }
};

// Card Database Blueprint
const CARD_BLUEPRINTS = [
  // 1. Weapons
  { id: 'iron_sword', name: '철 검', type: 'weapon', value: 5, element: 'none', combo: false, icon: 'fa-sword', desc: '물리 공격력 5. 가장 기초적이고 든튼한 강철 검.' },
  { id: 'stone_hammer', name: '돌 망치', type: 'weapon', value: 4, element: 'stone', combo: false, icon: 'fa-hammer', desc: '돌 속성 공격력 4. 대지의 기운이 담겨 있습니다.' },
  { id: 'wooden_bow', name: '나무 활', type: 'weapon', value: 3, element: 'wood', combo: false, icon: 'fa-bow-arrow', desc: '나무 속성 공격력 3. 다루기 가벼운 기초 활.' },
  { id: 'combo_dagger', name: '연속 단검 +', type: 'weapon', value: 2, element: 'none', combo: true, icon: 'fa-hand-back-fist', desc: '공격력 2. 플러스(+) 속성으로 다른 무기와 중첩이 가능합니다.' },
  { id: 'combo_knife', name: '연속 나이프 +', type: 'weapon', value: 3, element: 'none', combo: true, icon: 'fa-utensils', desc: '공격력 3. 플러스(+) 속성으로 연속 콤보가 가능합니다.' },
  { id: 'fire_sword', name: '불꽃 검', type: 'weapon', value: 5, element: 'fire', combo: false, icon: 'fa-fire', desc: '화염 속성 공격력 5. 대상을 불태우는 뜨거운 마검.' },
  { id: 'ice_axe', name: '얼음 도끼', type: 'weapon', value: 5, element: 'water', combo: false, icon: 'fa-snowflake', desc: '물 속성 공격력 5. 냉기를 뿜어 방어구를 얼립니다.' },
  { id: 'dark_whip', name: '어둠의 채찍', type: 'weapon', value: 6, element: 'dark', combo: false, icon: 'fa-skull', desc: '어둠 속성 공격력 6. 사악한 영혼의 타격을 입힙니다.' },
  { id: 'light_sword', name: '빛의 검', type: 'weapon', value: 8, element: 'light', combo: false, icon: 'fa-sun', desc: '빛 속성 공격력 8. 높은 위력의 성스러운 심판의 검.' },
  { id: 'typhoon', name: '태풍의 눈', type: 'weapon', value: 5, element: 'water', combo: false, icon: 'fa-wind', aoe: true, desc: '모든 상대 예언자 전체에게 5의 광역 수 속성 충격을 가합니다.' },

  // 2. Shields
  { id: 'iron_shield', name: '철 방패', type: 'defense', value: 5, element: 'none', icon: 'fa-shield-halved', desc: '물리 방어력 5. 강력한 타격을 흡수합니다.' },
  { id: 'wooden_shield', name: '나무 방패', type: 'defense', value: 3, element: 'wood', icon: 'fa-tree', desc: '나무 속성 방어력 3. 나무 공격을 효율적으로 차단.' },
  { id: 'stone_shield', name: '돌 방패', type: 'defense', value: 4, element: 'stone', icon: 'fa-mountain', desc: '돌 속성 방어력 4. 든든한 석재 외벽 효과.' },
  { id: 'fire_shield', name: '화염 방패', type: 'defense', value: 5, element: 'fire', icon: 'fa-fire-burner', desc: '화염 속성 방어력 5. 불꽃 대미지를 흡수합니다.' },
  { id: 'ice_shield', name: '얼음 방패', type: 'defense', value: 5, element: 'water', icon: 'fa-icicles', desc: '물 속성 방어력 5. 냉기 충격을 완전히 소멸시킵니다.' },
  { id: 'light_shield', name: '빛의 방패', type: 'defense', value: 8, element: 'light', icon: 'fa-shield-heart', desc: '빛 속성 방어력 8. 성스러운 아우라로 큰 공격을 수호.' },
  { id: 'dark_shield', name: '어둠의 장막', type: 'defense', value: 6, element: 'dark', icon: 'fa-circle-dot', desc: '어둠 속성 방어력 6. 적의 타격을 삼켜 버리는 베일.' },
  { id: 'mirror_shield', name: '거울 방패', type: 'defense', value: 2, element: 'none', reflect: true, icon: 'fa-ghost', desc: '물리 방어력 2. 막아낸 대미지 수치를 공격한 자에게 그대로 돌려줍니다(반사).' },
  { id: 'invincible_aura', name: '무적의 오라', type: 'defense', value: 99, element: 'none', cost: 5, icon: 'fa-bahai', desc: '소비 MP 5. 모든 속성 공격을 완전 면역(DEF 99) 차단합니다.' },

  // 3. Sundry
  { id: 'herb', name: '약초', type: 'sundry', value: 10, effect: 'heal_hp', icon: 'fa-leaf', desc: '자신의 HP를 10 회복시킵니다.' },
  { id: 'medical_kit', name: '구급상자', type: 'sundry', value: 20, effect: 'heal_hp', icon: 'fa-briefcase-medical', desc: '자신의 HP를 20 회복시킵니다.' },
  { id: 'elixir', name: '엘릭서', type: 'sundry', value: 40, effect: 'heal_hp_full', icon: 'fa-prescription-bottle', desc: '자신의 HP를 즉시 40 회복(풀 리스토어)합니다.' },
  { id: 'mana_potion', name: '마나 포션', type: 'sundry', value: 10, effect: 'heal_mp', icon: 'fa-flask', desc: '자신의 마력(MP)을 10 회복시킵니다.' },
  { id: 'mana_essence', name: '마나 에센스', type: 'sundry', value: 20, effect: 'heal_mp', icon: 'fa-flask-vial', desc: '자신의 마력(MP)을 20 회복시킵니다.' },
  { id: 'money_bag', name: '돈주머니', type: 'sundry', value: 15, effect: 'gain_gold', icon: 'fa-sack-dollar', desc: '자신의 소지금($)을 즉시 15 얻습니다.' },
  { id: 'vaccine', name: '백신', type: 'sundry', effect: 'cure_all', icon: 'fa-syringe', desc: '자신에게 걸려있는 모든 상태이상(감기, 지옥병, 안개 등)을 완치합니다.' },
  { id: 'cold_virus', name: '감기 바이러스', type: 'sundry', effect: 'infect_cold', icon: 'fa-virus', desc: '선택한 상대 예언자에게 감기(Cold) 바이러스를 옮깁니다.' },
  { id: 'buy_card', name: '구매', type: 'sundry', cost: 5, effect: 'buy_transaction', icon: 'fa-basket-shopping', desc: '소지금 5를 대상에게 강제 지불하고 대상의 손패 중 1장을 무작위로 훔쳐옵니다.' },
  { id: 'sell_card', name: '판매', type: 'sundry', effect: 'sell_transaction', icon: 'fa-hand-holding-dollar', desc: '대상의 손패에 나의 쓸모없는 카드를 건네며 강제로 10의 대금을 징수합니다.' },
  { id: 'exchange_stats', name: '환전', type: 'sundry', effect: 'swap_stats', icon: 'fa-arrow-right-arrow-left', desc: '자신의 현재 HP 수치와 MP 수치를 서로 교환합니다.' },

  // 4. Miracles (Purple, Cost MP)
  { id: 'miracle_heal', name: '기적: 치유', type: 'miracle', cost: 5, value: 15, effect: 'heal_hp', icon: 'fa-heart-circle-check', desc: 'MP 5 소모. 자신의 HP를 15 치유합니다.' },
  { id: 'miracle_fireball', name: '기적: 파이어 볼', type: 'miracle', cost: 6, value: 8, element: 'fire', icon: 'fa-wand-sparkles', desc: 'MP 6 소모. 대상에게 화염 속성 대미지 8을 가합니다.' },
  { id: 'miracle_meteor', name: '기적: 메테오', type: 'miracle', cost: 10, value: 12, element: 'fire', aoe: true, icon: 'fa-meteor', desc: 'MP 10 소모. 모든 상대 예언자 전체에게 12의 돌/화염 대미지를 뿜습니다.' },
  { id: 'miracle_blizzard', name: '기적: 눈보라', type: 'miracle', cost: 8, value: 7, element: 'water', aoe: true, effect: 'infect_cold', icon: 'fa-snowflake', desc: 'MP 8 소모. 모든 상대 전체에게 7 대미지를 가하고 감기를 전파시킵니다.' },
  { id: 'miracle_lightning', name: '기적: 벼락', type: 'miracle', cost: 7, value: 10, element: 'none', effect: 'inflict_flash', icon: 'fa-bolt-lightning', desc: 'MP 7 소모. 대상에게 10 대미지를 가하며 콤보 방어가 차단되는 섬광(Flash)을 유발합니다.' },
  { id: 'miracle_blessing', name: '기적: 축복', type: 'miracle', cost: 8, value: 25, effect: 'cure_all_heal', icon: 'fa-gift', desc: 'MP 8 소모. 자신의 모든 상태이상을 정화하며 HP를 25 치료합니다.' }
];

// Game Engine State Variables
const Game = {
  state: 'LOBBY', // LOBBY, ACTIVE_TURN, COMBAT_DEFENSE, AI_TURN, GAME_OVER
  prophetName: 'cineaho',
  difficulty: 'normal',
  playersCount: 4,

  players: [], // Array of player object { id, name, isAI, hp, mp, gold, curses: {}, hand: [], avatarClass }
  activePlayerIndex: 0, // Whose turn it is
  deck: [],
  selectedCardIds: [], // Current selected combo or single card for user
  targetPlayerIndex: null, // Selected target index for attacks/sundries

  // Combat status variables
  currentAttack: {
    attackerIndex: null,
    defenderIndex: null,
    value: 0,
    element: 'none',
    cardsUsed: [],
    reflected: false,
    effectsTriggered: [] // e.g., infect_cold, inflict_flash
  },

  lobbyEl: null,
  gameEl: null,
  logListEl: null,
  cardsContainerEl: null,
  bibleModalEl: null,
  gameOverEl: null,

  init() {
    // Cache DOM Elements
    this.lobbyEl = document.getElementById('lobby-screen');
    this.gameEl = document.getElementById('game-screen');
    this.logListEl = document.getElementById('log-list');
    this.cardsContainerEl = document.getElementById('hand-cards-container');
    this.bibleModalEl = document.getElementById('bible-modal');
    this.gameOverEl = document.getElementById('game-over-panel');

    this.bindEvents();
    this.setupVolumeControls();
    SoundEngine.init();
  },

  bindEvents() {
    // Lobby events
    document.getElementById('btn-birth').addEventListener('click', () => {
      this.prophetName = document.getElementById('prophet-name').value.trim() || 'cineaho';
      this.playersCount = parseInt(document.getElementById('ai-count').value) || 4;
      this.difficulty = document.getElementById('difficulty').value || 'normal';
      
      SoundEngine.play('click');
      this.startGame();
    });

    // Toggle Bible Modal
    const openBibleFunc = () => {
      SoundEngine.play('click');
      this.bibleModalEl.classList.remove('hidden');
    };
    const closeBibleFunc = () => {
      SoundEngine.play('click');
      this.bibleModalEl.classList.add('hidden');
    };
    
    document.getElementById('btn-lobby-bible').addEventListener('click', openBibleFunc);
    document.getElementById('btn-open-bible').addEventListener('click', openBibleFunc);
    document.getElementById('btn-close-bible').addEventListener('click', closeBibleFunc);

    // Quit Event
    document.getElementById('btn-quit').addEventListener('click', () => {
      if (confirm("정말로 대전을 포기하고 로비로 돌아가시겠습니까?")) {
        SoundEngine.play('click');
        this.resetToLobby();
      }
    });

    // Restart Event
    document.getElementById('btn-restart-game').addEventListener('click', () => {
      SoundEngine.play('click');
      this.resetToLobby();
    });

    // Bible Tab Switch
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        SoundEngine.play('click');
        tabButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const tabId = e.target.getAttribute('data-tab');
        const panes = document.querySelectorAll('.tab-pane');
        panes.forEach(pane => {
          if (pane.id === tabId) {
            pane.classList.add('active');
          } else {
            pane.classList.remove('active');
          }
        });
      });
    });

    // User Turn action triggers
    document.getElementById('btn-pray').addEventListener('click', () => {
      if (this.state === 'ACTIVE_TURN' && this.activePlayerIndex === 0) {
        this.executePray(0);
      }
    });

    document.getElementById('btn-pass-turn').addEventListener('click', () => {
      if (this.state === 'ACTIVE_TURN' && this.activePlayerIndex === 0) {
        this.addLog(`${this.players[0].name}(은)는 턴을 패스했습니다.`, 'system');
        this.endTurn();
      }
    });

    document.getElementById('btn-play-card').addEventListener('click', () => {
      if (this.state === 'ACTIVE_TURN' && this.activePlayerIndex === 0) {
        this.playSelectedCards();
      }
    });

    // Defending triggers
    document.getElementById('btn-defend-execute').addEventListener('click', () => {
      if (this.state === 'COMBAT_DEFENSE' && this.currentAttack.defenderIndex === 0) {
        this.executeDefense();
      }
    });

    document.getElementById('btn-take-damage').addEventListener('click', () => {
      if (this.state === 'COMBAT_DEFENSE' && this.currentAttack.defenderIndex === 0) {
        this.executeTakeDamage();
      }
    });

    // Selection target clicking on Player Slots
    document.querySelectorAll('.player-slot').forEach(slot => {
      slot.addEventListener('click', (e) => {
        const slotIdx = parseInt(slot.getAttribute('data-slot'));
        if (isNaN(slotIdx)) return;

        // Can only target if we are choosing a target for a weapon/sundry card
        if (this.state === 'ACTIVE_TURN' && this.activePlayerIndex === 0) {
          if (this.players[slotIdx].hp <= 0) return; // Cannot target dead prophet
          
          // Clear current target highlights
          document.querySelectorAll('.player-slot').forEach(s => s.classList.remove('targeted'));
          
          this.targetPlayerIndex = slotIdx;
          slot.classList.add('targeted');
          SoundEngine.play('click');
          this.validateActionButtons();
        }
      });
    });
  },

  setupVolumeControls() {
    const steps = document.querySelectorAll('.vol-step');
    steps.forEach(step => {
      step.addEventListener('click', (e) => {
        const val = parseInt(step.getAttribute('data-val'));
        SoundEngine.setVolume(val);
        steps.forEach(s => {
          const sVal = parseInt(s.getAttribute('data-val'));
          if (sVal <= val) {
            s.classList.add('active');
          } else {
            s.classList.remove('active');
          }
        });
        SoundEngine.play('click');
      });
    });

    const volIcon = document.getElementById('vol-icon');
    volIcon.addEventListener('click', () => {
      if (SoundEngine.volume > 0) {
        this.prevVolume = SoundEngine.volume;
        SoundEngine.setVolume(0);
        steps.forEach(s => s.classList.remove('active'));
      } else {
        const val = this.prevVolume || 3;
        SoundEngine.setVolume(val);
        steps.forEach(s => {
          const sVal = parseInt(s.getAttribute('data-val'));
          if (sVal <= val) {
            s.classList.add('active');
          } else {
            s.classList.remove('active');
          }
        });
        SoundEngine.play('click');
      }
    });
  },

  // Game initialization
  startGame() {
    this.lobbyEl.classList.add('hidden');
    this.gameEl.classList.remove('hidden');
    this.gameOverEl.classList.add('hidden');
    
    this.logListEl.innerHTML = '';
    this.addLog(`결투 대기실에 입장했습니다. 예언자의 난이도: ${this.difficulty.toUpperCase()}`, 'system');

    // Create Deck
    this.deck = [];
    this.replenishDeck();

    // Setup Players
    this.players = [];

    // Player 1: User
    this.players.push({
      id: 0,
      name: this.prophetName,
      isAI: false,
      hp: 40,
      mp: 20,
      gold: 20,
      curses: {}, // cold, fever, hell, heaven, fog, flash, dream
      hand: [],
      avatarClass: 'icon-gold'
    });
    
    // Dynamically update user's prophet name in the UI
    document.getElementById('user-prophet-name').innerHTML = `${this.prophetName} <span class="user-badge">나</span>`;

    // AI Slots configurations
    const names4 = ['가브리엘', '미카엘', '라파엘'];
    const icons4 = ['icon-red', 'icon-blue', 'icon-purple'];

    if (this.playersCount === 4) {
      // 4-player FFA
      for (let i = 0; i < 3; i++) {
        this.players.push({
          id: i + 1,
          name: names4[i],
          isAI: true,
          hp: 40,
          mp: 20,
          gold: 20,
          curses: {},
          hand: [],
          avatarClass: icons4[i]
        });
      }
      // Show all 4 slots
      document.getElementById('slot-cpu1').classList.remove('hidden');
      document.getElementById('slot-cpu2').classList.remove('hidden');
      document.getElementById('slot-cpu3').classList.remove('hidden');
    } else {
      // 1:1 duel
      this.players.push({
        id: 1,
        name: '가브리엘',
        isAI: true,
        hp: 40,
        mp: 20,
        gold: 20,
        curses: {},
        hand: [],
        avatarClass: 'icon-red'
      });
      // Hide CPU 2 (Top) and CPU 3 (Right), rename slot Left to Gabriel
      document.getElementById('slot-cpu2').classList.add('hidden');
      document.getElementById('slot-cpu3').classList.add('hidden');
      document.getElementById('slot-cpu1').classList.remove('hidden');
    }

    // Deal cards (9 cards per player)
    for (let p of this.players) {
      for (let k = 0; k < 9; k++) {
        p.hand.push(this.drawCardFromDeck());
      }
    }

    this.activePlayerIndex = 0;
    this.selectedCardIds = [];
    this.targetPlayerIndex = null;
    this.state = 'ACTIVE_TURN';

    this.updateUI();
    this.addLog(`대결이 시작되었습니다! 당신의 턴입니다.`, 'system');
    SoundEngine.play('win');

    this.startTurnCycle();
  },

  resetToLobby() {
    this.state = 'LOBBY';
    this.lobbyEl.classList.remove('hidden');
    this.gameEl.classList.add('hidden');
    this.gameOverEl.classList.add('hidden');
    document.querySelectorAll('.player-slot').forEach(s => s.classList.remove('targeted', 'active', 'dead'));
  },

  // Event logging
  addLog(msg, type = '') {
    const div = document.createElement('div');
    div.className = `log-row ${type}`;
    div.textContent = msg;
    this.logListEl.appendChild(div);
    this.logListEl.scrollTop = this.logListEl.scrollHeight;
  },

  replenishDeck() {
    // Fill deck with random blueprints copies
    for (let i = 0; i < 3; i++) { // 3 copies of each card
      CARD_BLUEPRINTS.forEach(blueprint => {
        this.deck.push({ ...blueprint, instanceId: Math.random().toString(36).substring(2, 9) });
      });
    }
    // Shuffle
    this.shuffle(this.deck);
  },

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  },

  drawCardFromDeck() {
    if (this.deck.length === 0) {
      this.replenishDeck();
    }
    return this.deck.pop();
  },

  // Start active prophet turn cycle
  startTurnCycle() {
    // Verify if active player is alive
    const activePlayer = this.players[this.activePlayerIndex];

    if (activePlayer.hp <= 0) {
      // Skip turn
      this.endTurn();
      return;
    }

    // Mark active CSS
    document.querySelectorAll('.player-slot').forEach((slot, idx) => {
      const slotIdx = parseInt(slot.getAttribute('data-slot'));
      if (slotIdx === this.activePlayerIndex) {
        slot.classList.add('active');
      } else {
        slot.classList.remove('active');
      }
    });

    this.addLog(`[ ${activePlayer.name}의 턴 시작 ]`, 'system');

    // 1. Process diseases
    this.processTurnDisease(activePlayer);

    if (activePlayer.hp <= 0) {
      // Died from disease
      this.endTurn();
      return;
    }

    // 2. Start specific turn action
    if (activePlayer.isAI) {
      this.state = 'AI_TURN';
      this.updateUI();
      setTimeout(() => {
        this.runAIRoutine(this.activePlayerIndex);
      }, 1500);
    } else {
      this.state = 'ACTIVE_TURN';
      this.selectedCardIds = [];
      this.targetPlayerIndex = null;
      document.querySelectorAll('.player-slot').forEach(s => s.classList.remove('targeted'));
      this.updateUI();
    }
  },

  processTurnDisease(player) {
    let diseaseLogs = [];
    
    // Cold: -1
    if (player.curses.cold) {
      player.hp = Math.max(0, player.hp - 1);
      diseaseLogs.push("감기(Cold)로 HP 1 감소");
    }
    // Fever: -2
    if (player.curses.fever) {
      player.hp = Math.max(0, player.hp - 2);
      diseaseLogs.push("열병(Fever)으로 HP 2 감소");
    }
    // Hell: -5
    if (player.curses.hell) {
      player.hp = Math.max(0, player.hp - 5);
      diseaseLogs.push("지옥병(Hell)으로 HP 5 감소");
    }
    // Heaven: +5, but 5% death check
    if (player.curses.heaven) {
      player.hp = Math.min(40, player.hp + 5);
      diseaseLogs.push("천국병(Heaven)의 회복으로 HP 5 회복");
      
      const deathChance = Math.random() < 0.05;
      if (deathChance) {
        player.hp = 0;
        diseaseLogs.push("천국병 발작으로 즉사(승천)하였습니다!");
        SoundEngine.play('death');
      }
    }

    if (diseaseLogs.length > 0) {
      this.addLog(`${player.name}(은)는 상태이상 진행: ${diseaseLogs.join(', ')}`, 'curse');
      SoundEngine.play('curse');
      
      if (player.hp <= 0) {
        this.addLog(`${player.name}(이)가 끝내 힘을 잃고 승천하였습니다!`, 'death');
        this.triggerDeathEffect(player.id);
      }
      this.updateUI();
    }
  },

  triggerDeathEffect(playerIndex) {
    const player = this.players[playerIndex];
    this.addLog(`[ ${player.name} 승천 (탈락) ]`, 'death');
    SoundEngine.play('death');

    // Remove any targeted state
    const slotEl = this.getPlayerSlotEl(playerIndex);
    if (slotEl) {
      slotEl.classList.add('dead');
      slotEl.classList.remove('active', 'targeted');
    }

    // Check game over victory conditions
    this.checkGameVictory();
  },

  checkGameVictory() {
    const aliveCount = this.players.filter(p => p.hp > 0).length;
    const isPlayerAlive = this.players[0].hp > 0;

    if (aliveCount <= 1) {
      // Combat finishes!
      this.state = 'GAME_OVER';
      const winner = this.players.find(p => p.hp > 0);
      
      setTimeout(() => {
        this.showGameOverScreen(winner);
      }, 1500);
    }
  },

  showGameOverScreen(winner) {
    this.gameOverEl.classList.remove('hidden');
    const titleEl = document.getElementById('go-title');
    const descEl = document.getElementById('go-desc');
    const summaryEl = document.getElementById('go-summary');

    if (winner && winner.id === 0) {
      titleEl.textContent = "🏆 결투 승리!";
      titleEl.style.color = "#c3fa3c";
      descEl.textContent = `당신은 다른 모든 예언자들을 제압하고 신의 영역에 도달했습니다.`;
      SoundEngine.play('win');
    } else {
      titleEl.textContent = "💀 예언자 승천";
      titleEl.style.color = "#ef4444";
      descEl.textContent = `당신은 최후의 생존에 실패하고 하늘로 승천하여 탈락했습니다.`;
      SoundEngine.play('death');
    }

    // Populate stats
    summaryEl.innerHTML = `
      <div class="summary-row"><span>나의 최종 순위</span><strong>${this.players[0].hp > 0 ? '1등 (우승)' : '탈락'}</strong></div>
      <div class="summary-row"><span>남아있는 예언자</span><strong>${winner ? winner.name : '없음'}</strong></div>
      <div class="summary-row"><span>남은 소지금 ($)</span><strong>${this.players[0].gold} $</strong></div>
    `;
  },

  // Move active turn pointer to next player
  endTurn() {
    this.checkGameVictory();
    if (this.state === 'GAME_OVER') return;

    // Remove targeted classes
    document.querySelectorAll('.player-slot').forEach(s => s.classList.remove('targeted'));

    this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;
    this.selectedCardIds = [];
    this.targetPlayerIndex = null;

    setTimeout(() => {
      this.startTurnCycle();
    }, 1000);
  },

  // Active user selection validation
  validateActionButtons() {
    const playBtn = document.getElementById('btn-play-card');
    const prayBtn = document.getElementById('btn-pray');

    if (this.state !== 'ACTIVE_TURN' || this.activePlayerIndex !== 0) {
      playBtn.disabled = true;
      prayBtn.disabled = true;
      return;
    }

    const selectedCards = this.getSelectedCards(0);
    const hasWeaponsInHand = this.players[0].hand.some(c => c.type === 'weapon');
    
    // Pray is enabled only if player has NO weapons in hand
    prayBtn.disabled = hasWeaponsInHand;

    // Check if playable
    if (selectedCards.length === 0) {
      playBtn.disabled = true;
      return;
    }

    // Logic verification
    // 1. All selected cards must be of the same type? Or can combo weapons.
    const firstCard = selectedCards[0];
    const isAllSameType = selectedCards.every(c => c.type === firstCard.type);

    if (!isAllSameType) {
      playBtn.disabled = true;
      return;
    }

    if (firstCard.type === 'weapon') {
      // Weapons combo check
      // Only multiple weapon cards can be selected if all but the last card have `combo: true` (+)
      let validCombo = true;
      for (let i = 0; i < selectedCards.length - 1; i++) {
        if (!selectedCards[i].combo) {
          validCombo = false;
          break;
        }
      }
      
      // Weapon needs a valid target
      const validTarget = this.targetPlayerIndex !== null && 
                          this.targetPlayerIndex !== 0 && 
                          this.players[this.targetPlayerIndex].hp > 0;
      
      playBtn.disabled = !(validCombo && validTarget);
    } 
    else if (firstCard.type === 'miracle') {
      // Miracle needs MP check
      const totalCost = selectedCards.reduce((sum, c) => sum + (c.cost || 0), 0);
      const sufficientMp = this.players[0].mp >= totalCost;
      
      // If it requires a target (offensive miracles)
      const isOffensive = selectedCards.some(c => c.id === 'miracle_fireball' || c.id === 'miracle_lightning');
      const validTarget = !isOffensive || (this.targetPlayerIndex !== null && this.targetPlayerIndex !== 0 && this.players[this.targetPlayerIndex].hp > 0);

      playBtn.disabled = !(sufficientMp && validTarget && selectedCards.length === 1); // 1 miracle at a time
    } 
    else if (firstCard.type === 'sundry') {
      // Sundry cards
      const validCombo = selectedCards.length === 1; // Only 1 sundry item at a time
      
      // Target checks
      const item = firstCard;
      let targetRequired = false;
      if (item.id === 'cold_virus' || item.id === 'buy_card' || item.id === 'sell_card') {
        targetRequired = true;
      }
      
      const validTarget = !targetRequired || (this.targetPlayerIndex !== null && this.targetPlayerIndex !== 0 && this.players[this.targetPlayerIndex].hp > 0);
      
      // Extra cost check for Buy card
      let sufficientCost = true;
      if (item.id === 'buy_card' && this.players[0].gold < 5) {
        sufficientCost = false;
      }

      playBtn.disabled = !(validCombo && validTarget && sufficientCost);
    } 
    else {
      // Can't play defense cards actively on your turn
      playBtn.disabled = true;
    }
  },

  playSelectedCards() {
    const p = this.players[0];
    const cards = this.getSelectedCards(0);
    if (cards.length === 0) return;

    // Deduct cards from hand
    p.hand = p.hand.filter(c => !this.selectedCardIds.includes(c.instanceId));

    const firstCard = cards[0];

    if (firstCard.type === 'weapon') {
      // Resolve Weapon Attack
      let targetIdx = this.targetPlayerIndex;
      if (p.curses.fog) {
        const candidates = this.players.filter((pl, idx) => idx !== 0 && pl.hp > 0);
        if (candidates.length > 0) {
          targetIdx = candidates[Math.floor(Math.random() * candidates.length)].id;
          this.addLog(`안개(Fog)로 인해 공격 대상이 혼란해져 ${this.players[targetIdx].name}(으)로 지정되었습니다!`, 'curse');
        }
      }

      const totalAtk = cards.reduce((sum, c) => sum + c.value, 0);
      const element = firstCard.element; // element determined by first combo card

      this.currentAttack = {
        attackerIndex: 0,
        defenderIndex: targetIdx,
        value: totalAtk,
        element: element,
        cardsUsed: cards,
        reflected: false,
        effectsTriggered: []
      };

      // Play sound
      SoundEngine.play('attack');

      // Highlight arrow SVG and visual panel
      this.triggerAttackVisuals(0, targetIdx, cards, totalAtk);

      // Start defense sequence for target
      this.initiateTargetDefense(targetIdx);
    } 
    else if (firstCard.type === 'miracle') {
      // Deduct MP cost
      const cost = cards[0].cost || 0;
      p.mp -= cost;
      
      this.resolveUtilityCard(0, cards[0], this.targetPlayerIndex);
    } 
    else if (firstCard.type === 'sundry') {
      // Transaction or other costs
      if (cards[0].id === 'buy_card') {
        p.gold -= 5;
      }
      this.resolveUtilityCard(0, cards[0], this.targetPlayerIndex);
    }

    // Refill hand back to 9
    this.refillHand(0);
    this.selectedCardIds = [];
    this.targetPlayerIndex = null;
    this.updateUI();
  },

  // Refill hand up to 9
  refillHand(playerIndex) {
    const p = this.players[playerIndex];
    while (p.hand.length < 9) {
      const c = this.drawCardFromDeck();
      p.hand.push(c);
    }
  },

  // Resolve miscellaneous spells and potions
  resolveUtilityCard(casterIdx, card, targetIdx) {
    const caster = this.players[casterIdx];
    
    // Randomize target if caster is fogged
    let finalTargetIdx = targetIdx;
    if (caster.curses.fog && targetIdx !== null && targetIdx !== casterIdx) {
      const candidates = this.players.filter((pl, idx) => idx !== casterIdx && pl.hp > 0);
      if (candidates.length > 0) {
        finalTargetIdx = candidates[Math.floor(Math.random() * candidates.length)].id;
        this.addLog(`안개(Fog)로 인해 대상이 혼란해져 ${this.players[finalTargetIdx].name}(으)로 지정되었습니다!`, 'curse');
      }
    }
    
    let target = finalTargetIdx !== null ? this.players[finalTargetIdx] : null;

    this.addLog(`${caster.name}(이)가 성물 '${card.name}'을 사용했습니다.`, 'system');

    // Chime chime
    if (card.type === 'miracle') {
      SoundEngine.play('heal');
    } else {
      SoundEngine.play('click');
    }

    switch (card.id) {
      case 'herb':
        caster.hp = Math.min(40, caster.hp + 10);
        this.addLog(`${caster.name}의 HP가 10 회복되었습니다.`, 'heal');
        this.endTurn();
        break;
      case 'medical_kit':
        caster.hp = Math.min(40, caster.hp + 20);
        this.addLog(`${caster.name}의 HP가 20 회복되었습니다.`, 'heal');
        this.endTurn();
        break;
      case 'elixir':
        caster.hp = 40;
        this.addLog(`${caster.name}의 HP가 40으로 풀 회복되었습니다.`, 'heal');
        this.endTurn();
        break;
      case 'mana_potion':
        caster.mp = Math.min(20, caster.mp + 10);
        this.addLog(`${caster.name}의 MP가 10 회복되었습니다.`, 'heal');
        this.endTurn();
        break;
      case 'mana_essence':
        caster.mp = Math.min(20, caster.mp + 20);
        this.addLog(`${caster.name}의 MP가 20 회복되었습니다.`, 'heal');
        this.endTurn();
        break;
      case 'money_bag':
        caster.gold += 15;
        this.addLog(`${caster.name}의 소지금이 15 $ 증가했습니다.`, 'heal');
        this.endTurn();
        break;
      case 'vaccine':
        caster.curses = {};
        this.addLog(`${caster.name}의 모든 질병과 재앙 상태가 완치되었습니다.`, 'heal');
        this.endTurn();
        break;
      case 'exchange_stats':
        const temp = caster.hp;
        caster.hp = Math.min(40, caster.mp);
        caster.mp = Math.min(20, temp);
        this.addLog(`${caster.name}의 HP와 MP가 맞교환되었습니다. (HP: ${caster.hp}, MP: ${caster.mp})`, 'system');
        this.endTurn();
        break;

      case 'cold_virus':
        if (target) {
          this.inflictDisease(targetIdx, 'cold');
        }
        this.endTurn();
        break;

      case 'buy_card':
        if (target) {
          // target gains 5 gold, loses 1 card
          target.gold += 5;
          if (target.hand.length > 0) {
            const randIdx = Math.floor(Math.random() * target.hand.length);
            const stolenCard = target.hand.splice(randIdx, 1)[0];
            caster.hand.push(stolenCard);
            this.addLog(`${caster.name}(이)가 ${target.name}에게 5 $를 주고 카드 '${stolenCard.name}'을 탈취해왔습니다.`, 'system');
            
            // target refills hand if needed
            this.refillHand(targetIdx);
          } else {
            this.addLog(`${target.name}의 손패가 없어 카드 탈취에 실패했습니다.`, 'system');
          }
        }
        this.endTurn();
        break;

      case 'sell_card':
        if (target && caster.hand.length > 0) {
          // target loses 10 gold (down to 0 min), gains 1 card from caster
          const sellCost = Math.min(target.gold, 10);
          target.gold -= sellCost;
          caster.gold += sellCost;

          // Select random card from caster's hand to sell
          const randIdx = Math.floor(Math.random() * caster.hand.length);
          const soldCard = caster.hand.splice(randIdx, 1)[0];
          target.hand.push(soldCard);

          this.addLog(`${caster.name}(이)가 ${target.name}에게 카드 '${soldCard.name}'을 강제 판매하고 소지금 ${sellCost} $를 징수했습니다.`, 'system');
          
          this.refillHand(casterIdx);
          // target refills hand if needed (if it went above 9 it stays, but if under 9 it draws)
          this.refillHand(targetIdx);
        }
        this.endTurn();
        break;

      // Miracles
      case 'miracle_heal':
        caster.hp = Math.min(40, caster.hp + 15);
        this.addLog(`${caster.name}의 HP가 기적으로 15 회복되었습니다.`, 'heal');
        this.endTurn();
        break;
      case 'miracle_blessing':
        caster.curses = {};
        caster.hp = Math.min(40, caster.hp + 25);
        this.addLog(`${caster.name}의 상태이상이 정화되고 HP가 25 회복되었습니다.`, 'heal');
        this.endTurn();
        break;

      case 'miracle_fireball':
        if (target) {
          this.currentAttack = {
            attackerIndex: casterIdx,
            defenderIndex: targetIdx,
            value: card.value,
            element: card.element,
            cardsUsed: [card],
            reflected: false,
            effectsTriggered: []
          };
          this.triggerAttackVisuals(casterIdx, targetIdx, [card], card.value);
          this.initiateTargetDefense(targetIdx);
        }
        break;

      case 'miracle_lightning':
        if (target) {
          this.currentAttack = {
            attackerIndex: casterIdx,
            defenderIndex: targetIdx,
            value: card.value,
            element: card.element,
            cardsUsed: [card],
            reflected: false,
            effectsTriggered: ['flash']
          };
          this.triggerAttackVisuals(casterIdx, targetIdx, [card], card.value);
          this.initiateTargetDefense(targetIdx);
        }
        break;

      case 'miracle_meteor':
        // Attack all opponents!
        this.resolveAoEAttack(casterIdx, card, [card.element]);
        break;

      case 'miracle_blizzard':
        // Attack all opponents and cold infect
        this.resolveAoEAttack(casterIdx, card, [card.element], ['cold']);
        break;
    }
  },

  resolveAoEAttack(casterIdx, card, elements, statusEffects = []) {
    const caster = this.players[casterIdx];
    this.addLog(`${caster.name}의 전체 범위 기적 공격 발동! (파워 ${card.value})`, 'miracle');
    SoundEngine.play('attack');

    this.players.forEach((p, idx) => {
      if (idx !== casterIdx && p.hp > 0) {
        // Individual combat attack resolve instantly using basic defense logic
        setTimeout(() => {
          this.currentAttack = {
            attackerIndex: casterIdx,
            defenderIndex: idx,
            value: card.value,
            element: card.element,
            cardsUsed: [card],
            reflected: false,
            effectsTriggered: statusEffects
          };
          
          this.triggerAttackVisuals(casterIdx, idx, [card], card.value);
          
          if (p.isAI) {
            this.resolveAIDefense(idx);
          } else {
            // Player gets defense banner
            this.state = 'COMBAT_DEFENSE';
            this.updateUI();
            // Block loop waits for player response
          }
        }, idx * 400);
      }
    });

    // End caster turn after spawning AoE delays
    setTimeout(() => {
      this.endTurn();
    }, 1500);
  },

  inflictDisease(targetIdx, type) {
    const target = this.players[targetIdx];
    SoundEngine.play('curse');

    // Disease progression: cold -> fever -> hell -> heaven -> death
    if (type === 'cold') {
      if (target.curses.heaven) {
        // Ascend instantly!
        target.hp = 0;
        this.addLog(`${target.name}의 천국병이 과부하되어 즉시 승천하였습니다!`, 'death');
        this.triggerDeathEffect(targetIdx);
      } else if (target.curses.hell) {
        delete target.curses.hell;
        target.curses.heaven = true;
        this.addLog(`${target.name}의 질병이 지옥병에서 천국병(Heaven)으로 악화되었습니다!`, 'curse');
      } else if (target.curses.fever) {
        delete target.curses.fever;
        target.curses.hell = true;
        this.addLog(`${target.name}의 질병이 열병에서 지옥병(Hell)으로 악화되었습니다!`, 'curse');
      } else if (target.curses.cold) {
        delete target.curses.cold;
        target.curses.fever = true;
        this.addLog(`${target.name}의 질병이 감기에서 열병(Fever)으로 악화되었습니다!`, 'curse');
      } else {
        target.curses.cold = true;
        this.addLog(`${target.name}(이)가 감기(Cold)에 걸렸습니다.`, 'curse');
      }
    } else {
      // Special curses like fog, flash, dream
      target.curses[type] = true;
      this.addLog(`${target.name}(이)가 ${type.toUpperCase()} 상태에 감염되었습니다.`, 'curse');
    }
    this.updateUI();
  },

  // Target defending phase
  initiateTargetDefense(targetIdx) {
    const target = this.players[targetIdx];
    
    if (target.isAI) {
      // AI defends instantly
      setTimeout(() => {
        this.resolveAIDefense(targetIdx);
      }, 1000);
    } else {
      // Player defends, change state
      this.state = 'COMBAT_DEFENSE';
      this.selectedCardIds = [];
      this.updateUI();
    }
  },

  // Active player executing defense using chosen shields
  executeDefense() {
    const p = this.players[0];
    const selectedCards = this.getSelectedCards(0);
    const atk = this.currentAttack;

    // Check flash constraint: limit to max 1 card if flash curse is active
    if (p.curses.flash && selectedCards.length > 1) {
      alert("섬광(Flash) 상태이므로 방어용 카드를 단 1장만 등록할 수 있습니다!");
      return;
    }

    // Verify all selected are defense cards
    const isValid = selectedCards.every(c => c.type === 'defense');
    if (!isValid && selectedCards.length > 0) {
      alert("방어용 카드가 아닌 성물이 섞여 있습니다!");
      return;
    }

    // MP cost checks for invincible_aura or similar
    const totalMpCost = selectedCards.reduce((sum, c) => sum + (c.cost || 0), 0);
    if (p.mp < totalMpCost) {
      alert("방어용 카드를 사용하기 위한 마력(MP)이 부족합니다!");
      return;
    }
    p.mp -= totalMpCost;

    // Deduct cards from hand
    p.hand = p.hand.filter(c => !this.selectedCardIds.includes(c.instanceId));

    // Calculate defensive absorption
    let defPower = 0;
    let reflectActive = false;

    selectedCards.forEach(card => {
      // Check element match
      if (card.element === 'none' || card.element === atk.element) {
        defPower += card.value;
      } else {
        // Element mismatch blocks only 50% or 0%? 
        // In God Field, mismatching shields usually blocks 0 or minor. Let's make it block 0 for standard elements to stay faithful.
        this.addLog(`속성 불일치! '${card.name}'(은)는 '${atk.element}' 공격의 위력을 막아내지 못했습니다.`, 'system');
      }

      if (card.reflect) {
        reflectActive = true;
      }
    });

    const netDamage = Math.max(0, atk.value - defPower);

    this.addLog(`${p.name}(이)가 방어 카드를 제시했습니다. (방어력 ${defPower} / 피해량 ${netDamage})`, 'system');

    // Mirror shield reflect logic
    if (reflectActive && defPower > 0) {
      const reflectedVal = Math.min(atk.value, defPower);
      this.addLog(`거울 방패 발동! ${reflectedVal}의 데미지를 공격자인 ${this.players[atk.attackerIndex].name}에게 반사합니다!`, 'miracle');
      SoundEngine.play('reflect');
      
      // Inflict damage to attacker
      const attacker = this.players[atk.attackerIndex];
      attacker.hp = Math.max(0, attacker.hp - reflectedVal);
      
      if (attacker.hp <= 0) {
        this.addLog(`${attacker.name}(이)가 반사된 대미지로 승천하였습니다!`, 'death');
        this.triggerDeathEffect(atk.attackerIndex);
      }
    }

    // Apply net damage to player
    p.hp = Math.max(0, p.hp - netDamage);
    if (netDamage > 0) {
      this.triggerFlashEffect();
      this.getPlayerSlotEl(0).classList.add('shake');
      setTimeout(() => this.getPlayerSlotEl(0).classList.remove('shake'), 400);
      SoundEngine.play('attack');
    }

    if (p.hp <= 0) {
      this.addLog(`${p.name}(이)가 최후의 한 타를 견디지 못하고 승천했습니다.`, 'death');
      this.triggerDeathEffect(0);
    } else {
      // Apply status effects if any
      atk.effectsTriggered.forEach(eff => {
        this.inflictDisease(0, eff);
      });
    }

    // Refill hand and return turn back
    this.refillHand(0);
    this.selectedCardIds = [];
    
    // Clear center visual area
    this.clearAttackVisuals();

    // Reset turn
    this.state = 'ACTIVE_TURN';
    this.updateUI();

    // Check if attacker turn is ended
    if (this.activePlayerIndex !== 0) {
      // Attacking CPU ends its turn
      this.endTurn();
    } else {
      // Attacker was player, end turn
      this.endTurn();
    }
  },

  // Actively accepting damage to preserve shield cards
  executeTakeDamage() {
    const p = this.players[0];
    const atk = this.currentAttack;

    p.hp = Math.max(0, p.hp - atk.value);
    this.addLog(`${p.name}(이)가 공격에 그대로 노출되어 ${atk.value}의 데미지를 입었습니다.`, 'curse');
    
    this.triggerFlashEffect();
    this.getPlayerSlotEl(0).classList.add('shake');
    setTimeout(() => this.getPlayerSlotEl(0).classList.remove('shake'), 400);
    SoundEngine.play('attack');

    if (p.hp <= 0) {
      this.addLog(`${p.name}(이)가 승천하셨습니다.`, 'death');
      this.triggerDeathEffect(0);
    } else {
      atk.effectsTriggered.forEach(eff => {
        this.inflictDisease(0, eff);
      });
    }

    this.selectedCardIds = [];
    this.clearAttackVisuals();
    this.state = 'ACTIVE_TURN';
    this.updateUI();

    this.endTurn();
  },

  // Helper elements selectors
  getPlayerSlotEl(index) {
    if (index === 0) return document.getElementById('slot-player');
    if (index === 1) return document.getElementById('slot-cpu1');
    if (index === 2) return document.getElementById('slot-cpu2');
    if (index === 3) return document.getElementById('slot-cpu3');
    return null;
  },

  // Dynamic combat display chimes
  triggerAttackVisuals(attackerIdx, defenderIdx, cards, val) {
    const aSlot = this.getPlayerSlotEl(attackerIdx);
    const dSlot = this.getPlayerSlotEl(defenderIdx);

    // Show in Center Board
    const idlePanel = document.getElementById('center-idle-txt');
    const actPanel = document.getElementById('center-action-pane');
    idlePanel.classList.add('hidden');
    actPanel.classList.remove('hidden');

    document.getElementById('actor-txt').textContent = this.players[attackerIdx].name;
    document.getElementById('target-txt').textContent = this.players[defenderIdx].name;
    
    // Showcase Played Card
    const showcase = document.getElementById('action-card-showcase');
    const primaryCard = cards[0];
    let cardClass = 'type-weapon';
    if (primaryCard.type === 'miracle') cardClass = 'type-miracle';
    
    showcase.innerHTML = `
      <div class="gf-card ${cardClass}" style="width:100%; height:100%; margin:0; transform:none; cursor:default;">
        <div class="card-top">
          <span>${primaryCard.element.toUpperCase()}</span>
          <i class="fa-solid ${primaryCard.icon}"></i>
        </div>
        <div class="card-icon"><i class="fa-solid ${primaryCard.icon}"></i></div>
        <div class="card-footer-info">
          <span class="card-name">${primaryCard.name}</span>
          <span class="card-value">${val}</span>
        </div>
      </div>
    `;

    // Visual pointer arrow using dynamic SVG line draws
    this.drawSVGArrow(attackerIdx, defenderIdx);
  },

  clearAttackVisuals() {
    document.getElementById('center-idle-txt').classList.remove('hidden');
    document.getElementById('center-action-pane').classList.add('hidden');
    document.getElementById('defense-overlay').classList.add('hidden');
    document.getElementById('svg-arrows').innerHTML = '';
  },

  drawSVGArrow(fromIdx, toIdx) {
    const container = document.getElementById('svg-arrows');
    container.innerHTML = '';

    const fromEl = this.getPlayerSlotEl(fromIdx);
    const toEl = this.getPlayerSlotEl(toIdx);
    if (!fromEl || !toEl) return;

    // Get relative viewport positions
    const boardRect = document.getElementById('center-board').getBoundingClientRect();
    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();

    const x1 = (fromRect.left + fromRect.width / 2) - boardRect.left;
    const y1 = (fromRect.top + fromRect.height / 2) - boardRect.top;
    const x2 = (toRect.left + toRect.width / 2) - boardRect.left;
    const y2 = (toRect.top + toRect.height / 2) - boardRect.top;

    container.innerHTML = `
      <svg width="100%" height="100%" style="position:absolute; top:0; left:0;">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#c3fa3c" />
          </marker>
        </defs>
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#c3fa3c" stroke-width="4" stroke-dasharray="5,5" marker-end="url(#arrow)">
          <animate attributeName="stroke-dashoffset" values="50;0" dur="2s" repeatCount="indefinite" />
        </line>
      </svg>
    `;
  },

  triggerFlashEffect() {
    const flash = document.getElementById('screen-flash');
    flash.classList.add('active');
    setTimeout(() => {
      flash.classList.remove('active');
    }, 80);
  },


  // ==========================================================================
  // AI DECISION ROUTINES (EASY, NORMAL, HARD DIFFICULTIES)
  // ==========================================================================
  runAIRoutine(aiIdx) {
    const ai = this.players[aiIdx];
    if (ai.hp <= 0) {
      this.endTurn();
      return;
    }

    // AI priority decision list
    // 1. Heal if HP is low (< 15)
    const healCards = ai.hand.filter(c => c.effect === 'heal_hp' || c.effect === 'heal_hp_full' || c.id === 'miracle_heal');
    if (ai.hp < 15 && healCards.length > 0) {
      // Prioritize full potion (elixir) or Miracle heal (if sufficient MP)
      let chosenHeal = healCards.find(c => c.id === 'elixir');
      if (!chosenHeal) chosenHeal = healCards.find(c => c.id === 'miracle_heal' && ai.mp >= c.cost);
      if (!chosenHeal) chosenHeal = healCards[0];

      if (chosenHeal) {
        // Remove card, apply, end turn
        ai.hand = ai.hand.filter(c => c.instanceId !== chosenHeal.instanceId);
        this.addLog(`${ai.name}(이)가 위기를 겪고 치료 성물 '${chosenHeal.name}'을 사용했습니다.`, 'heal');
        
        if (chosenHeal.effect === 'heal_hp_full') ai.hp = 40;
        else ai.hp = Math.min(40, ai.hp + (chosenHeal.value || 10));

        if (chosenHeal.cost) ai.mp -= chosenHeal.cost;

        SoundEngine.play('heal');
        this.refillHand(aiIdx);
        this.updateUI();
        this.endTurn();
        return;
      }
    }

    // 2. Cure diseases if they have Vaccine and have at least 1 curse
    const hasCurse = Object.keys(ai.curses).length > 0;
    const vaccine = ai.hand.find(c => c.id === 'vaccine');
    if (hasCurse && vaccine) {
      ai.hand = ai.hand.filter(c => c.instanceId !== vaccine.instanceId);
      ai.curses = {};
      this.addLog(`${ai.name}(이)가 백신을 주입하여 질병을 해제했습니다.`, 'heal');
      SoundEngine.play('heal');
      this.refillHand(aiIdx);
      this.updateUI();
      this.endTurn();
      return;
    }

    // 3. Look for target and attack
    const weapons = ai.hand.filter(c => c.type === 'weapon');
    const miracles = ai.hand.filter(c => c.type === 'miracle' && (c.id === 'miracle_fireball' || c.id === 'miracle_lightning' || c.id === 'miracle_meteor' || c.id === 'miracle_blizzard') && ai.mp >= c.cost);
    
    // Choose target
    let targetIdx = null;
    const candidates = this.players.filter((p, idx) => idx !== aiIdx && p.hp > 0);
    
    if (candidates.length > 0) {
      // Hard mode: target player actively if active. Normal: target lowest HP opponent.
      if (this.difficulty === 'hard' && this.players[0].hp > 0) {
        targetIdx = 0;
      } else {
        // target player with lowest HP
        candidates.sort((a, b) => a.hp - b.hp);
        targetIdx = candidates[0].id;
      }
    }

    if (targetIdx !== null && (weapons.length > 0 || miracles.length > 0)) {
      // Choose attack card
      let selectedAttack = null;
      let isMiracle = false;

      if (miracles.length > 0 && Math.random() < 0.4) {
        selectedAttack = miracles[0];
        isMiracle = true;
      } else if (weapons.length > 0) {
        // Choose strongest weapon
        weapons.sort((a,b) => b.value - a.value);
        selectedAttack = weapons[0];
      }

      if (selectedAttack) {
        ai.hand = ai.hand.filter(c => c.instanceId !== selectedAttack.instanceId);
        
        if (isMiracle) {
          ai.mp -= selectedAttack.cost || 0;
          this.addLog(`${ai.name}(이)가 기적 공격 '${selectedAttack.name}'을 발동했습니다.`, 'miracle');
          SoundEngine.play('attack');

          if (selectedAttack.aoe) {
            // AoE resolved
            this.resolveAoEAttack(aiIdx, selectedAttack, [selectedAttack.element], selectedAttack.effect ? [selectedAttack.effect] : []);
            this.refillHand(aiIdx);
            this.updateUI();
            return;
          }
        } else {
          this.addLog(`${ai.name}(이)가 무기 '${selectedAttack.name}'을 들고 공격을 시도합니다. (위력 ${selectedAttack.value})`, 'attack');
        }

        this.currentAttack = {
          attackerIndex: aiIdx,
          defenderIndex: targetIdx,
          value: selectedAttack.value,
          element: selectedAttack.element,
          cardsUsed: [selectedAttack],
          reflected: false,
          effectsTriggered: selectedAttack.effect ? [selectedAttack.effect] : []
        };

        this.triggerAttackVisuals(aiIdx, targetIdx, [selectedAttack], selectedAttack.value);
        this.refillHand(aiIdx);
        this.updateUI();

        // Target defending phase
        this.initiateTargetDefense(targetIdx);
        return;
      }
    }

    // 4. Pray if no weapon
    const hasWeapons = ai.hand.some(c => c.type === 'weapon');
    if (!hasWeapons) {
      this.executePray(aiIdx);
      return;
    }

    // 5. Play other passive cards or pass
    const goldBag = ai.hand.find(c => c.id === 'money_bag');
    if (goldBag) {
      ai.hand = ai.hand.filter(c => c.instanceId !== goldBag.instanceId);
      ai.gold += 15;
      this.addLog(`${ai.name}(이)가 돈주머니를 열어 소지금이 증가했습니다.`, 'heal');
      SoundEngine.play('heal');
      this.refillHand(aiIdx);
      this.updateUI();
      this.endTurn();
      return;
    }

    // Default: end turn
    this.addLog(`${ai.name}(은)는 턴을 대기했습니다.`, 'system');
    this.endTurn();
  },

  executePray(playerIdx) {
    const p = this.players[playerIdx];
    // Draw 1 card, skip turn
    const c = this.drawCardFromDeck();
    p.hand.push(c);

    this.addLog(`${p.name}(이)가 무기가 없어 하늘에 기도를 올렸습니다. 성물 1장을 보충받습니다.`, 'heal');
    SoundEngine.play('draw');

    this.updateUI();
    this.endTurn();
  },

  // Resolve defense cards for AI slot
  resolveAIDefense(aiIdx) {
    const ai = this.players[aiIdx];
    const atk = this.currentAttack;

    // Filter defense shields
    let shields = ai.hand.filter(c => c.type === 'defense');
    
    // Choose mirrors or element matches
    const mirror = shields.find(c => c.reflect);
    let cardsToPlay = [];
    let blockedValue = 0;
    let reflectActive = false;

    if (mirror) {
      cardsToPlay.push(mirror);
      blockedValue += mirror.value;
      reflectActive = true;
      shields = shields.filter(c => c.instanceId !== mirror.instanceId);
    }

    // Check flash constraint: AI can play only 1 shield if flash curse is active
    const maxShields = ai.curses.flash ? 1 : 99;

    // Filter element-matching shields or physical shields
    const matchedShields = shields.filter(c => c.element === atk.element || c.element === 'none');
    matchedShields.sort((a,b) => b.value - a.value); // sort desc

    for (let shield of matchedShields) {
      if (blockedValue >= atk.value || cardsToPlay.length >= maxShields) break;
      
      // Check MP if invincible_aura
      if (shield.id === 'invincible_aura') {
        if (ai.mp >= 5) {
          ai.mp -= 5;
          cardsToPlay.push(shield);
          blockedValue += shield.value;
        }
      } else {
        cardsToPlay.push(shield);
        blockedValue += shield.value;
      }
    }

    // Deduct chosen cards from AI hand
    ai.hand = ai.hand.filter(c => !cardsToPlay.some(tc => tc.instanceId === c.instanceId));

    const netDamage = Math.max(0, atk.value - blockedValue);

    this.addLog(`${ai.name}(이)가 방패를 들어 방어했습니다. (방격 ${blockedValue} / 피격량 ${netDamage})`, 'system');

    // Reflect calculations
    if (reflectActive && blockedValue > 0) {
      const reflectedVal = Math.min(atk.value, blockedValue);
      this.addLog(`거울방패 효과! ${ai.name}(이)가 ${reflectedVal}의 공격력을 반사했습니다!`, 'miracle');
      SoundEngine.play('reflect');

      const attacker = this.players[atk.attackerIndex];
      attacker.hp = Math.max(0, attacker.hp - reflectedVal);
      
      if (attacker.hp <= 0) {
        this.addLog(`${attacker.name}(이)가 반사 피해로 승천하였습니다.`, 'death');
        this.triggerDeathEffect(atk.attackerIndex);
      }
    }

    // Inflict Damage
    ai.hp = Math.max(0, ai.hp - netDamage);
    if (netDamage > 0) {
      this.getPlayerSlotEl(aiIdx).classList.add('shake');
      setTimeout(() => this.getPlayerSlotEl(aiIdx).classList.remove('shake'), 400);
      SoundEngine.play('attack');
    }

    if (ai.hp <= 0) {
      this.addLog(`${ai.name}(이)가 버티지 못하고 승천(탈락)했습니다.`, 'death');
      this.triggerDeathEffect(aiIdx);
    } else {
      atk.effectsTriggered.forEach(eff => {
        this.inflictDisease(aiIdx, eff);
      });
    }

    this.refillHand(aiIdx);
    this.clearAttackVisuals();
    this.updateUI();

    this.endTurn();
  },


  // ==========================================================================
  // RENDER / UI REFRESH METHODS
  // ==========================================================================
  getSelectedCards(playerIndex) {
    const p = this.players[playerIndex];
    return p.hand.filter(c => this.selectedCardIds.includes(c.instanceId));
  },

  updateUI() {
    // 1. Update stats for all slots
    this.players.forEach((p, idx) => {
      const slotEl = this.getPlayerSlotEl(idx);
      if (!slotEl) return;

      if (p.hp <= 0) {
        slotEl.classList.add('dead');
        slotEl.querySelector('.hp-val').textContent = '0';
      } else {
        slotEl.classList.remove('dead');
        
        // Hide stats with "?" if under Fog disease (and it's AI slot)
        const isFogged = this.players[0].curses.fog && idx !== 0;
        
        slotEl.querySelector('.hp-val').textContent = isFogged ? '?' : p.hp;
        slotEl.querySelector('.mp-val').textContent = isFogged ? '?' : p.mp;
        slotEl.querySelector('.gold-val').textContent = isFogged ? '?' : p.gold;

        // Dynamic Curses updates
        const curseRow = document.getElementById(`curses-cpu${idx}` || `curses-player`);
        const curseTargetEl = idx === 0 ? document.getElementById('curses-player') : document.getElementById(`curses-cpu${idx}`);
        
        if (curseTargetEl) {
          curseTargetEl.innerHTML = '';
          Object.keys(p.curses).forEach(curseKey => {
            if (p.curses[curseKey]) {
              const badge = document.createElement('span');
              badge.className = `curse-badge ${curseKey}`;
              badge.innerHTML = `<i class="fa-solid fa-skull-crossbones"></i> ${this.getCurseNameKo(curseKey)}`;
              curseTargetEl.appendChild(badge);
            }
          });
        }
      }
    });

    // Update global search turn title banner
    const turnTxt = document.getElementById('turn-txt');
    const activePlayer = this.players[this.activePlayerIndex];
    
    if (this.state === 'COMBAT_DEFENSE') {
      turnTxt.textContent = "방어 진행 중";
      document.getElementById('defense-overlay').classList.remove('hidden');
      document.getElementById('center-idle-txt').classList.add('hidden');
      
      const defTarget = this.currentAttack.defenderIndex;
      const defTargetName = this.players[defTarget].name;
      document.getElementById('defense-detail-txt').textContent = `${this.players[this.currentAttack.attackerIndex].name}의 공격 (ATK ${this.currentAttack.value}, ${this.currentAttack.element.toUpperCase()}).`;
      document.getElementById('def-needed-val').textContent = this.currentAttack.value;
      
      // Calculate total chosen defense power
      const selectedDefensePower = this.getSelectedCards(0).reduce((sum, c) => sum + (c.type === 'defense' ? c.value : 0), 0);
      document.getElementById('def-registered-val').textContent = selectedDefensePower;
    } else {
      turnTxt.textContent = `${activePlayer.name}의 행동 차례`;
    }

    // 2. Render Hand shelf for user
    this.renderUserHand();

    // 3. Toggle Control buttons racks depending on state
    const activeRack = document.getElementById('rack-active-turn');
    const defenseRack = document.getElementById('rack-defense-turn');

    if (this.state === 'COMBAT_DEFENSE' && this.currentAttack.defenderIndex === 0) {
      activeRack.classList.add('hidden');
      defenseRack.classList.remove('hidden');
    } else {
      activeRack.classList.remove('hidden');
      defenseRack.classList.add('hidden');
    }

    this.validateActionButtons();
  },

  getCurseNameKo(key) {
    const map = {
      cold: '감기',
      fever: '열병',
      hell: '지옥병',
      heaven: '천국병',
      fog: '안개',
      flash: '섬광',
      dream: '꿈'
    };
    return map[key] || key;
  },

  renderUserHand() {
    this.cardsContainerEl.innerHTML = '';
    const p = this.players[0];

    // Card Count Label
    document.getElementById('hand-count-lbl').textContent = `${p.hand.length} / 9장`;

    p.hand.forEach(card => {
      const cardDiv = document.createElement('div');
      
      // Dream state filter: Scramble names and attributes
      const isDreamCurse = p.curses.dream && Math.random() < 0.5;
      
      let cardName = card.name;
      let cardValue = card.value;
      let cardElement = card.element;
      let cardClass = `type-${card.type}`;
      let cardIcon = card.icon;

      if (isDreamCurse) {
        cardName = "???";
        cardValue = Math.floor(Math.random() * 20);
        cardClass += ' dream-glitch';
        cardIcon = 'fa-question';
      }

      cardDiv.className = `gf-card ${cardClass}`;
      if (this.selectedCardIds.includes(card.instanceId)) {
        cardDiv.classList.add('selected');
      }

      // Dim cards that are not playable in current status
      let isPlayable = true;
      if (this.state === 'COMBAT_DEFENSE') {
        // Can only play Defense cards when defending
        if (card.type !== 'defense') isPlayable = false;
      } else if (this.state === 'ACTIVE_TURN') {
        // Can actively play anything except defense cards
        if (card.type === 'defense') isPlayable = false;
      } else {
        isPlayable = false;
      }

      if (!isPlayable) {
        cardDiv.classList.add('dimmed');
      }

      cardDiv.innerHTML = `
        <div class="card-top">
          <span>${cardElement.toUpperCase()}</span>
          ${card.cost ? `<span class="card-cost" style="font-size:0.6rem; color:#c084fc;">MP ${card.cost}</span>` : ''}
          ${card.combo ? `<span class="combo-badge">+</span>` : ''}
        </div>
        <div class="card-icon"><i class="fa-solid ${cardIcon}"></i></div>
        <div class="card-footer-info">
          <span class="card-name">${cardName}</span>
          <span class="card-value">${cardValue || ''}</span>
        </div>
      `;

      // Card click event
      cardDiv.addEventListener('click', () => {
        if (!isPlayable) return;
        
        SoundEngine.play('click');
        
        const idx = this.selectedCardIds.indexOf(card.instanceId);
        if (idx > -1) {
          this.selectedCardIds.splice(idx, 1);
        } else {
          // If active turn and choosing weapons combo, verify weapon combo criteria
          if (this.state === 'ACTIVE_TURN') {
            const currentSelected = this.getSelectedCards(0);
            if (currentSelected.length > 0 && currentSelected[0].type !== card.type) {
              // Clear previous selection if type mismatches (cannot combo weapons with healing potion!)
              this.selectedCardIds = [];
            }
          }
          this.selectedCardIds.push(card.instanceId);
        }

        this.updateUI();
      });

      this.cardsContainerEl.appendChild(cardDiv);
    });
  }
};

// Start initialization once DOM Content is ready
document.addEventListener('DOMContentLoaded', () => {
  Game.init();
});
