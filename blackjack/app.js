/* ==========================================================================
   CineAHO 3D Blackjack Sub-App - Game Engine & Sound Synthesizer
   ========================================================================== */

// --- Card Data definition ---
const SUITS = [
    { name: 'spades', symbol: '♠', isRed: false },
    { name: 'hearts', symbol: '♥', isRed: true },
    { name: 'diamonds', symbol: '♦', isRed: true },
    { name: 'clubs', symbol: '♣', isRed: false }
];

const VALUES = [
    { name: 'A', value: 11 },
    { name: '2', value: 2 },
    { name: '3', value: 3 },
    { name: '4', value: 4 },
    { name: '5', value: 5 },
    { name: '6', value: 6 },
    { name: '7', value: 7 },
    { name: '8', value: 8 },
    { name: '9', value: 9 },
    { name: '10', value: 10 },
    { name: 'J', value: 10 },
    { name: 'Q', value: 10 },
    { name: 'K', value: 10 }
];

// --- Web Audio Synth Controller ---
class SoundController {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playCardDraw() {
        this.init();
        const ctx = this.ctx;
        const now = ctx.currentTime;
        
        // Friction slide noise sweep
        const bufferSize = ctx.sampleRate * 0.16;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1100, now);
        filter.frequency.exponentialRampToValueAtTime(160, now + 0.16);
        filter.Q.setValueAtTime(4, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
    }

    playChipClick() {
        this.init();
        const ctx = this.ctx;
        const now = ctx.currentTime;

        // Double high sine wave clinks
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(2300, now);
        osc1.frequency.exponentialRampToValueAtTime(1600, now + 0.04);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(3300, now);
        osc2.frequency.exponentialRampToValueAtTime(2100, now + 0.05);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.07);
        osc2.stop(now + 0.07);
    }

    playWin() {
        this.init();
        const ctx = this.ctx;
        const now = ctx.currentTime;

        // Major chime chord arpeggio
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.07);
            
            gain.gain.setValueAtTime(0, now + idx * 0.07);
            gain.gain.linearRampToValueAtTime(0.07, now + idx * 0.07 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(now + idx * 0.07);
            osc.stop(now + idx * 0.07 + 0.45);
        });
    }

    playLoss() {
        this.init();
        const ctx = this.ctx;
        const now = ctx.currentTime;

        // Descending low saw wave buzzer
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(75, now + 0.4);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.45);
    }

    playPush() {
        this.init();
        const ctx = this.ctx;
        const now = ctx.currentTime;

        // Brief double neutral chime
        const notes = [349.23, 349.23]; // F4
        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.15);

            gain.gain.setValueAtTime(0, now + idx * 0.15);
            gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.15 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.2);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + idx * 0.15);
            osc.stop(now + idx * 0.15 + 0.25);
        });
    }
}

const soundCtrl = new SoundController();

// --- Card Deck Shoe (6 Decks) ---
class Shoe {
    constructor(deckCount = 6) {
        this.deckCount = deckCount;
        this.cards = [];
        this.reset();
    }

    reset() {
        this.cards = [];
        for (let d = 0; d < this.deckCount; d++) {
            for (let suit of SUITS) {
                for (let val of VALUES) {
                    this.cards.push({ suit, val });
                }
            }
        }
        this.shuffle();
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    draw() {
        if (this.cards.length < 20) {
            this.reset();
        }
        return this.cards.pop();
    }
}

// --- Main Blackjack Game Controller ---
class BlackjackGame {
    constructor() {
        this.shoe = new Shoe();
        this.state = 'BETTING'; // BETTING, DEALING, PLAYER_TURNS, DEALER_TURN, SETTLEMENT
        
        // Spot seating (Spot 2 is active User player)
        this.players = [
            { id: 0, type: 'ai', name: '카지노로얄', balance: 50000, currentBet: 0, pendingBet: 0, cards: [], score: 0, active: true, status: 'playing' },
            { id: 1, type: 'ai', name: 'casino', balance: 20000, currentBet: 0, pendingBet: 0, cards: [], score: 0, active: true, status: 'playing' },
            { id: 2, type: 'user', name: '나 (Player)', balance: 100000, currentBet: 0, pendingBet: 0, cards: [], score: 0, active: true, status: 'playing' },
            { id: 3, type: 'ai', name: 'magiccater5', balance: 15000, currentBet: 0, pendingBet: 0, cards: [], score: 0, active: true, status: 'playing' },
            { id: 4, type: 'empty', name: '사자왕', balance: 30000, currentBet: 0, pendingBet: 0, cards: [], score: 0, active: false, status: 'playing' }
        ];

        this.dealer = { name: '딜러', cards: [], score: 0 };
        
        this.activeTurnIdx = 0;
        this.timeRemaining = 15;
        this.timerInterval = null;
        this.currentChipValue = 500;

        // Portal Stats
        this.stats = {
            wins: 0,
            losses: 0,
            ties: 0,
            streak: 0
        };

        // Load balance & stats from LocalStorage
        this.loadGameState();

        // UI Hooks
        this.dom = {
            timerSec: document.getElementById('timer-sec'),
            timerProgress: document.getElementById('timer-progress'),
            timerContainer: document.getElementById('timer-container'),
            dealerSpeech: document.getElementById('dealer-speech'),
            dealerCards: document.getElementById('dealer-cards'),
            dealerScore: document.getElementById('dealer-score'),
            btnReset: document.getElementById('btn-reset'),
            btnBet: document.getElementById('btn-bet'),
            btnHit: document.getElementById('btn-hit'),
            btnStand: document.getElementById('btn-stand'),
            btnDouble: document.getElementById('btn-double'),
            playActions: document.getElementById('play-actions'),
            gameBanner: document.getElementById('game-banner'),
            bannerText: document.getElementById('banner-text'),
            chipsList: document.querySelectorAll('.bet-chips .bet-chip'),
            btnJoin4: document.getElementById('btn-join-4'),
            spot4: document.getElementById('spot-4'),
            // Stats HUD
            statWins: document.getElementById('stat-wins'),
            statLosses: document.getElementById('stat-losses'),
            statTies: document.getElementById('stat-ties'),
            statStreak: document.getElementById('stat-streak')
        };

        this.registerEventListeners();
        this.startBettingPhase();
    }

    // --- State Persistence ---
    loadGameState() {
        const savedBalance = localStorage.getItem('cineaho_bj3d_balance');
        if (savedBalance) {
            try {
                const balances = JSON.parse(savedBalance);
                this.players.forEach((p, idx) => {
                    if (balances[idx] !== undefined) {
                        p.balance = balances[idx];
                    }
                });
            } catch (e) {
                console.error("Failed to load balances", e);
            }
        }

        const savedStats = localStorage.getItem('cineaho_bj3d_stats');
        if (savedStats) {
            try {
                this.stats = JSON.parse(savedStats);
            } catch (e) {
                console.error("Failed to load stats", e);
            }
        }
    }

    saveGameState() {
        const balances = this.players.map(p => p.balance);
        localStorage.setItem('cineaho_bj3d_balance', JSON.stringify(balances));
        localStorage.setItem('cineaho_bj3d_stats', JSON.stringify(this.stats));
    }

    // --- UI Listeners ---
    registerEventListeners() {
        // Chip Click Selection
        this.dom.chipsList.forEach(chipEl => {
            chipEl.addEventListener('click', () => {
                const valAttr = chipEl.getAttribute('data-value');
                soundCtrl.playChipClick();
                
                this.dom.chipsList.forEach(c => c.classList.remove('active'));
                chipEl.classList.add('active');

                if (valAttr === 'max') {
                    this.currentChipValue = 'max';
                } else {
                    this.currentChipValue = parseInt(valAttr);
                }
            });
        });

        // Bet Ring Click on main player (Spot 2)
        const spot2El = document.getElementById('spot-2');
        spot2El.querySelector('.spot-bet-ring').addEventListener('click', () => {
            if (this.state !== 'BETTING') return;
            this.placeUserBet();
        });

        // Reset and Bet Confirm buttons
        this.dom.btnReset.addEventListener('click', () => {
            if (this.state !== 'BETTING') return;
            soundCtrl.init();
            this.resetUserBet();
        });

        this.dom.btnBet.addEventListener('click', () => {
            if (this.state !== 'BETTING') return;
            soundCtrl.init();
            this.lockBetsAndStart();
        });

        // In-game user choice buttons
        this.dom.btnHit.addEventListener('click', () => {
            if (this.state !== 'PLAYER_TURNS' || this.activeTurnIdx !== 2) return;
            this.playerHit(2);
        });

        this.dom.btnStand.addEventListener('click', () => {
            if (this.state !== 'PLAYER_TURNS' || this.activeTurnIdx !== 2) return;
            this.playerStand(2);
        });

        this.dom.btnDouble.addEventListener('click', () => {
            if (this.state !== 'PLAYER_TURNS' || this.activeTurnIdx !== 2) return;
            this.playerDoubleDown(2);
        });

        // Join button (Seat 4 AI activation)
        this.dom.btnJoin4.addEventListener('click', () => {
            soundCtrl.init();
            this.joinSpot4();
        });
    }

    joinSpot4() {
        const spot = this.players[4];
        spot.active = true;
        spot.type = 'ai';
        this.dom.btnJoin4.classList.add('hidden');
        this.dom.spot4.classList.remove('empty-spot');
        this.dom.spot4.querySelector('.player-tag').classList.remove('hidden');
        this.updateBalancesUI();
        this.showToast("사자왕님이 자리에 참가했습니다.");
        
        if (this.state === 'BETTING') {
            setTimeout(() => {
                this.placeAIBet(4);
            }, 600);
        }
    }

    // --- Speech updates ---
    setDealerSpeech(text) {
        this.dom.dealerSpeech.innerText = text;
        this.dom.dealerSpeech.style.animation = 'none';
        this.dom.dealerSpeech.offsetHeight; // trigger reflow
        this.dom.dealerSpeech.style.animation = 'bounceSpeech 4s infinite ease-in-out, popSpeech 0.25s ease-out';
    }

    showToast(message) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerText = message;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 2500);
    }

    // --- Betting flow ---
    startBettingPhase() {
        this.state = 'BETTING';
        this.timeRemaining = 15;
        this.dom.timerContainer.style.opacity = '1';
        this.setDealerSpeech("배팅해 주세요.");

        // Clear card DOMs
        this.clearTableVisuals();

        // UI active controls
        this.dom.btnReset.disabled = false;
        this.dom.btnBet.disabled = false;
        this.dom.btnHit.disabled = true;
        this.dom.btnStand.disabled = true;
        this.dom.btnDouble.disabled = true;
        this.dom.playActions.classList.add('hidden');
        this.dom.btnBet.classList.remove('hidden');

        // Reset game status
        this.players.forEach(p => {
            p.currentBet = 0;
            p.cards = [];
            p.score = 0;
            p.status = 'playing';
            document.getElementById(`score-${p.id}`).classList.remove('bust', 'blackjack');
        });
        this.dealer.cards = [];
        this.dealer.score = 0;
        this.dom.dealerScore.classList.remove('bust', 'blackjack');

        // Place bets for AI players with short staggered delays
        this.players.forEach(p => {
            if (p.active && p.type === 'ai') {
                setTimeout(() => {
                    this.placeAIBet(p.id);
                }, Math.random() * 1800 + 800);
            }
        });

        this.startTimer();
        this.updateBalancesUI();
        this.updateStatsUI();
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.updateTimerCircle();
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            if (this.timeRemaining < 0) {
                clearInterval(this.timerInterval);
                this.lockBetsAndStart();
            } else {
                this.dom.timerSec.innerText = this.timeRemaining;
                this.updateTimerCircle();
            }
        }, 1000);
    }

    updateTimerCircle() {
        this.dom.timerSec.innerText = this.timeRemaining;
        const circleLength = 283;
        const offset = circleLength - (this.timeRemaining / 15) * circleLength;
        this.dom.timerProgress.style.strokeDashoffset = offset;
        
        if (this.timeRemaining <= 5) {
            this.dom.timerProgress.style.stroke = 'var(--red)';
        } else {
            this.dom.timerProgress.style.stroke = 'var(--gold)';
        }
    }

    placeUserBet() {
        const user = this.players[2];
        let amount = 0;

        if (this.currentChipValue === 'max') {
            amount = user.balance - user.pendingBet;
        } else {
            amount = this.currentChipValue;
        }

        if (user.pendingBet + amount > 250000) {
            this.showToast("최대 배팅금액은 25만 골드입니다.");
            return;
        }

        if (user.pendingBet + amount > user.balance) {
            this.showToast("보유 자금이 부족합니다!");
            return;
        }

        user.pendingBet += amount;
        soundCtrl.playChipClick();
        this.renderBetChips(2, user.pendingBet);
        document.getElementById('spot-2').classList.add('bet-placed');
    }

    resetUserBet() {
        const user = this.players[2];
        user.pendingBet = 0;
        this.renderBetChips(2, 0);
        document.getElementById('spot-2').classList.remove('bet-placed');
    }

    placeAIBet(aiIdx) {
        if (this.state !== 'BETTING') return;
        const ai = this.players[aiIdx];
        if (ai.balance <= 500) {
            ai.balance = 20000; // Free refill for AI
        }

        let bet = 500;
        if (ai.balance > 40000) {
            const pool = [1000, 2000, 5000, 10000];
            bet = pool[Math.floor(Math.random() * pool.length)];
        } else if (ai.balance > 15000) {
            const pool = [500, 1000, 2000];
            bet = pool[Math.floor(Math.random() * pool.length)];
        } else {
            bet = 500;
        }

        ai.pendingBet = bet;
        this.renderBetChips(aiIdx, bet);
        document.getElementById(`spot-${aiIdx}`).classList.add('bet-placed');
        soundCtrl.playChipClick();
    }

    renderBetChips(spotIdx, amount) {
        const container = document.getElementById(`chips-${spotIdx}`);
        container.innerHTML = '';
        if (amount <= 0) return;

        const DENOMINATIONS = [
            { value: 50000, class: 'purple', label: '5만' },
            { value: 10000, class: 'blue', label: '1만' },
            { value: 2000, class: 'red', label: '2000' },
            { value: 500, class: 'green', label: '500' }
        ];

        let temp = amount;
        const chipsList = [];
        for (let denom of DENOMINATIONS) {
            const count = Math.floor(temp / denom.value);
            for (let i = 0; i < count; i++) {
                chipsList.push(denom);
            }
            temp %= denom.value;
        }

        // Render stacked chips
        const visible = chipsList.reverse().slice(-8);
        visible.forEach((chip, index) => {
            const chipEl = document.createElement('div');
            chipEl.className = `game-chip-visual ${chip.class}`;
            chipEl.style.setProperty('--chip-col', `var(--chip-${chip.class})`);
            chipEl.style.transform = `translate(${index * 1.5}px, -${index * 3.5}px)`;
            chipEl.innerText = chip.label;
            container.appendChild(chipEl);
        });

        // Wiggle player badge for visual feedback
        const tag = document.getElementById(`spot-${spotIdx}`).querySelector('.player-tag');
        if (tag) {
            tag.style.transform = 'translateY(8px) scale(0.98)';
            setTimeout(() => tag.style.transform = '', 150);
        }
    }

    lockBetsAndStart() {
        if (this.state !== 'BETTING') return;
        clearInterval(this.timerInterval);
        this.dom.timerContainer.style.opacity = '0';

        const user = this.players[2];
        if (user.pendingBet === 0) {
            if (user.balance >= 500) {
                user.pendingBet = 500;
                this.renderBetChips(2, 500);
                document.getElementById('spot-2').classList.add('bet-placed');
                this.showToast("최소 배팅(500)으로 베팅되었습니다.");
            } else {
                // Out of balance user refill
                this.showToast("자금이 부족해 충전금 10,000 골드가 제공됩니다.");
                user.balance = 10000;
                user.pendingBet = 500;
                this.renderBetChips(2, 500);
                document.getElementById('spot-2').classList.add('bet-placed');
            }
        }

        // Substract bets from balances
        this.players.forEach(p => {
            if (p.active) {
                if (p.pendingBet === 0 && p.type === 'ai') {
                    p.pendingBet = 500;
                    this.renderBetChips(p.id, 500);
                }
                p.currentBet = p.pendingBet;
                p.balance -= p.currentBet;
                p.pendingBet = 0;
            }
        });

        this.updateBalancesUI();
        this.saveGameState();
        this.startDealingPhase();
    }

    updateBalancesUI() {
        this.players.forEach(p => {
            const balEl = document.getElementById(`balance-${p.id}`);
            if (balEl) {
                balEl.innerText = p.balance.toLocaleString();
            }
        });
        
        // Sync portal header chip count display
        const portalChips = document.getElementById('chip-count');
        if (portalChips) {
            portalChips.innerText = this.players[2].balance.toLocaleString();
        }
    }

    updateStatsUI() {
        if (this.dom.statWins) this.dom.statWins.innerText = this.stats.wins;
        if (this.dom.statLosses) this.dom.statLosses.innerText = this.stats.losses;
        if (this.dom.statTies) this.dom.statTies.innerText = this.stats.ties;
        if (this.dom.statStreak) this.dom.statStreak.innerText = this.stats.streak;
    }

    clearTableVisuals() {
        this.players.forEach(p => {
            document.getElementById(`cards-${p.id}`).innerHTML = '';
            const scoreEl = document.getElementById(`score-${p.id}`);
            scoreEl.classList.remove('visible');
            scoreEl.innerText = '0';
        });
        this.dom.dealerCards.innerHTML = '';
        this.dom.dealerScore.classList.remove('visible');
        this.dom.dealerScore.innerText = '0';
    }

    // --- Dealing cards ---
    async startDealingPhase() {
        this.state = 'DEALING';
        this.setDealerSpeech("카드를 분배합니다.");

        const activeSpots = this.players.filter(p => p.active && p.currentBet > 0);
        
        // Round 1
        for (let spot of activeSpots) {
            await this.dealCardToSpot(spot.id, true);
        }
        await this.dealCardToDealer(true);

        // Round 2
        for (let spot of activeSpots) {
            await this.dealCardToSpot(spot.id, true);
        }
        await this.dealCardToDealer(false); // Second dealer card face down

        this.startPlayerTurns();
    }

    dealCardToSpot(spotIdx, faceUp = true) {
        return new Promise((resolve) => {
            const player = this.players[spotIdx];
            const cardData = this.shoe.draw();
            player.cards.push(cardData);
            player.score = this.calculateHand(player.cards);

            const container = document.getElementById(`cards-${spotIdx}`);
            const cardEl = this.createCardElement(cardData);
            container.appendChild(cardEl);

            this.animateDeal(cardEl, container, () => {
                if (faceUp) {
                    cardEl.querySelector('.card-inner').classList.add('flipped');
                }
                
                const scoreEl = document.getElementById(`score-${spotIdx}`);
                scoreEl.innerText = player.score;
                scoreEl.classList.add('visible');
                
                if (player.score > 21) {
                    scoreEl.classList.add('bust');
                } else if (player.score === 21 && player.cards.length === 2) {
                    scoreEl.classList.add('blackjack');
                }
                
                resolve();
            });
        });
    }

    dealCardToDealer(faceUp = true) {
        return new Promise((resolve) => {
            const cardData = this.shoe.draw();
            this.dealer.cards.push(cardData);
            
            const visible = faceUp ? this.dealer.cards : [this.dealer.cards[0]];
            this.dealer.score = this.calculateHand(visible);

            const container = this.dom.dealerCards;
            const cardEl = this.createCardElement(cardData);
            container.appendChild(cardEl);

            this.animateDeal(cardEl, container, () => {
                if (faceUp) {
                    cardEl.querySelector('.card-inner').classList.add('flipped');
                }
                this.dom.dealerScore.innerText = this.dealer.score;
                this.dom.dealerScore.classList.add('visible');
                
                resolve();
            });
        });
    }

    createCardElement(card) {
        const wrapper = document.createElement('div');
        wrapper.className = 'card-3d-wrapper';
        
        const cardClass = card.suit.isRed ? 'hearts' : 'spades';
        
        wrapper.innerHTML = `
            <div class="card-inner">
                <div class="card-face card-back"></div>
                <div class="card-face card-front ${card.suit.name} ${cardClass}">
                    <div class="card-corner top">
                        <span class="card-value">${card.val.name}</span>
                        <span class="card-suit-mini">${card.suit.symbol}</span>
                    </div>
                    <div class="card-center-suit">${card.suit.symbol}</div>
                    <div class="card-corner bottom">
                        <span class="card-value">${card.val.name}</span>
                        <span class="card-suit-mini">${card.suit.symbol}</span>
                    </div>
                </div>
            </div>
        `;
        return wrapper;
    }

    animateDeal(cardEl, targetContainer, onComplete) {
        const shoeEl = document.getElementById('card-shoe');
        const shoeRect = shoeEl.getBoundingClientRect();
        const targetRect = targetContainer.getBoundingClientRect();

        // Translate delta coordinate offset
        const startX = shoeRect.left - targetRect.left + 15;
        const startY = shoeRect.top - targetRect.top - 10;

        const cardIdx = targetContainer.children.length - 1;
        const overlapOffset = cardIdx * 18;

        cardEl.style.left = '0px';
        cardEl.style.top = '0px';
        cardEl.style.transform = `translate3d(${startX}px, ${startY}px, 350px) rotate(-35deg) scale(0.12)`;
        cardEl.style.transition = 'none';

        cardEl.offsetHeight; // trigger layout

        setTimeout(() => {
            cardEl.style.transition = 'transform 0.65s cubic-bezier(0.25, 0.8, 0.25, 1), left 0.65s ease';
            cardEl.style.left = `${overlapOffset}px`;
            cardEl.style.transform = 'translate3d(0, 0, 0) rotate(0deg) scale(1)';
            soundCtrl.playCardDraw();
        }, 15);

        setTimeout(() => {
            if (onComplete) onComplete();
        }, 650);
    }

    calculateHand(cards) {
        let score = 0;
        let aces = 0;
        for (let card of cards) {
            const val = card.val.value;
            if (card.val.name === 'A') {
                aces++;
            }
            score += val;
        }
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        return score;
    }

    // --- Turn cycles ---
    startPlayerTurns() {
        this.state = 'PLAYER_TURNS';
        this.activeTurnIdx = 0;
        this.nextPlayerTurn();
    }

    nextPlayerTurn() {
        this.players.forEach(p => {
            document.getElementById(`spot-${p.id}`).classList.remove('active-turn');
        });

        if (this.activeTurnIdx >= this.players.length) {
            this.startDealerTurn();
            return;
        }

        const player = this.players[this.activeTurnIdx];
        if (!player.active || player.currentBet <= 0) {
            this.activeTurnIdx++;
            this.nextPlayerTurn();
            return;
        }

        document.getElementById(`spot-${player.id}`).classList.add('active-turn');

        if (player.score === 21) {
            this.setDealerSpeech(`${player.name}님, 블랙잭!`);
            player.status = 'blackjack';
            setTimeout(() => {
                this.activeTurnIdx++;
                this.nextPlayerTurn();
            }, 1200);
            return;
        }

        if (player.type === 'ai') {
            this.playAITurn(player.id);
        } else {
            this.playUserTurn();
        }
    }

    playAITurn(aiIdx) {
        const ai = this.players[aiIdx];
        this.setDealerSpeech(`${ai.name}님이 고민 중입니다...`);

        setTimeout(() => {
            if (ai.score < 17) {
                this.setDealerSpeech(`${ai.name}님, 힛 (Hit).`);
                this.dealCardToSpot(aiIdx, true).then(() => {
                    setTimeout(() => {
                        if (ai.score > 21) {
                            this.setDealerSpeech(`${ai.name}님 버스트!`);
                            ai.status = 'bust';
                            setTimeout(() => {
                                this.activeTurnIdx++;
                                this.nextPlayerTurn();
                            }, 1200);
                        } else {
                            this.playAITurn(aiIdx);
                        }
                    }, 800);
                });
            } else {
                this.setDealerSpeech(`${ai.name}님 스탠드.`);
                ai.status = 'stand';
                setTimeout(() => {
                    this.activeTurnIdx++;
                    this.nextPlayerTurn();
                }, 1200);
            }
        }, 1500);
    }

    playUserTurn() {
        this.setDealerSpeech("당신의 차례입니다. 선택해 주세요.");
        this.dom.playActions.classList.remove('hidden');
        this.dom.btnBet.classList.add('hidden');
        this.dom.btnReset.disabled = true;

        this.dom.btnHit.disabled = false;
        this.dom.btnStand.disabled = false;
        
        const user = this.players[2];
        if (user.cards.length === 2 && user.balance >= user.currentBet) {
            this.dom.btnDouble.disabled = false;
        } else {
            this.dom.btnDouble.disabled = true;
        }
    }

    playerHit(spotIdx) {
        this.dom.btnHit.disabled = true;
        this.dom.btnStand.disabled = true;
        this.dom.btnDouble.disabled = true;

        this.setDealerSpeech("힛, 카드 추가.");
        this.dealCardToSpot(spotIdx, true).then(() => {
            const user = this.players[spotIdx];
            if (user.score > 21) {
                this.setDealerSpeech("버스트하셨습니다!");
                user.status = 'bust';
                this.dom.playActions.classList.add('hidden');
                setTimeout(() => {
                    this.activeTurnIdx++;
                    this.nextPlayerTurn();
                }, 1500);
            } else if (user.score === 21) {
                user.status = 'stand';
                this.dom.playActions.classList.add('hidden');
                setTimeout(() => {
                    this.activeTurnIdx++;
                    this.nextPlayerTurn();
                }, 1500);
            } else {
                this.playUserTurn();
            }
        });
    }

    playerStand(spotIdx) {
        this.dom.playActions.classList.add('hidden');
        const user = this.players[spotIdx];
        user.status = 'stand';
        this.setDealerSpeech("스탠드.");
        
        setTimeout(() => {
            this.activeTurnIdx++;
            this.nextPlayerTurn();
        }, 800);
    }

    playerDoubleDown(spotIdx) {
        this.dom.btnHit.disabled = true;
        this.dom.btnStand.disabled = true;
        this.dom.btnDouble.disabled = true;
        this.dom.playActions.classList.add('hidden');

        const user = this.players[spotIdx];
        user.balance -= user.currentBet;
        user.currentBet *= 2;
        
        this.updateBalancesUI();
        this.renderBetChips(spotIdx, user.currentBet);
        this.setDealerSpeech("더블 다운! 한 장만 추가합니다.");
        
        soundCtrl.playChipClick();

        this.dealCardToSpot(spotIdx, true).then(() => {
            if (user.score > 21) {
                user.status = 'bust';
                this.setDealerSpeech("버스트하셨습니다!");
            } else {
                user.status = 'stand';
            }
            
            setTimeout(() => {
                this.activeTurnIdx++;
                this.nextPlayerTurn();
            }, 1500);
        });
    }

    // --- Dealer sequence ---
    async startDealerTurn() {
        this.state = 'DEALER_TURN';
        this.setDealerSpeech("딜러 카드를 공개합니다.");

        // Reveal dealer hidden card
        const hole = this.dom.dealerCards.children[1];
        hole.querySelector('.card-inner').classList.add('flipped');
        soundCtrl.playCardDraw();

        this.dealer.score = this.calculateHand(this.dealer.cards);
        this.dom.dealerScore.innerText = this.dealer.score;

        await new Promise(r => setTimeout(r, 1200));

        while (this.dealer.score < 17) {
            this.setDealerSpeech("딜러 카드 한 장 더 받습니다.");
            await this.dealCardToDealer(true);
            await new Promise(r => setTimeout(r, 1200));
        }

        if (this.dealer.score > 21) {
            this.setDealerSpeech("딜러 버스트!");
            this.dom.dealerScore.classList.add('bust');
        } else if (this.dealer.score === 21 && this.dealer.cards.length === 2) {
            this.dom.dealerScore.classList.add('blackjack');
            this.setDealerSpeech("딜러 블랙잭!");
        } else {
            this.setDealerSpeech(`딜러 ${this.dealer.score}점, 스탠드.`);
        }

        await new Promise(r => setTimeout(r, 1500));
        this.settleRound();
    }

    // --- Settlement comparison ---
    settleRound() {
        this.state = 'SETTLEMENT';
        const dScore = this.dealer.score;
        const dBlackjack = (dScore === 21 && this.dealer.cards.length === 2);

        this.players.forEach(p => {
            if (!p.active || p.currentBet <= 0) return;

            const pBust = p.status === 'bust';
            const pBlackjack = p.status === 'blackjack';
            let result = 'lose';

            if (pBust) {
                result = 'lose';
            } else if (dScore > 21) {
                result = pBlackjack ? 'blackjack_win' : 'win';
            } else if (pBlackjack) {
                result = dBlackjack ? 'push' : 'blackjack_win';
            } else if (dBlackjack) {
                result = 'lose';
            } else if (p.score > dScore) {
                result = 'win';
            } else if (p.score < dScore) {
                result = 'lose';
            } else {
                result = 'push';
            }

            let winnings = 0;
            if (result === 'win') {
                winnings = p.currentBet * 2;
                p.balance += winnings;
                this.markSpotWinner(p.id, false);
            } else if (result === 'blackjack_win') {
                winnings = Math.floor(p.currentBet * 2.5);
                p.balance += winnings;
                this.markSpotWinner(p.id, true);
            } else if (result === 'push') {
                winnings = p.currentBet;
                p.balance += winnings;
                this.markSpotPush(p.id);
            } else {
                this.markSpotLoser(p.id);
            }

            // Update user stats
            if (p.id === 2) {
                if (result === 'win' || result === 'blackjack_win') {
                    this.stats.wins++;
                    this.stats.streak++;
                } else if (result === 'push') {
                    this.stats.ties++;
                    this.stats.streak = 0;
                } else {
                    this.stats.losses++;
                    this.stats.streak = 0;
                }
            }
        });

        // Trigger results visual banner for user (Spot 2)
        const user = this.players[2];
        if (user.currentBet > 0) {
            const userBust = user.status === 'bust';
            const userBJ = user.status === 'blackjack';
            
            let userResultText = "LOSE";
            let userResultClass = "lose";

            if (userBust) {
                userResultText = "BUST";
                userResultClass = "lose";
                soundCtrl.playLoss();
            } else if (dScore > 21) {
                userResultText = userBJ ? "BLACKJACK" : "YOU WIN";
                userResultClass = "win";
                soundCtrl.playWin();
            } else if (userBJ) {
                if (dBlackjack) {
                    userResultText = "PUSH";
                    userResultClass = "push";
                    soundCtrl.playPush();
                } else {
                    userResultText = "BLACKJACK";
                    userResultClass = "win";
                    soundCtrl.playWin();
                }
            } else if (dBlackjack) {
                userResultText = "LOSE";
                userResultClass = "lose";
                soundCtrl.playLoss();
            } else if (user.score > dScore) {
                userResultText = "YOU WIN";
                userResultClass = "win";
                soundCtrl.playWin();
            } else if (user.score < dScore) {
                userResultText = "YOU LOSE";
                userResultClass = "lose";
                soundCtrl.playLoss();
            } else {
                userResultText = "PUSH";
                userResultClass = "push";
                soundCtrl.playPush();
            }

            this.showBanner(userResultText, userResultClass);
        }

        this.updateBalancesUI();
        this.updateStatsUI();
        this.saveGameState();

        // 5 seconds delay then reset for next betting round
        setTimeout(() => {
            this.hideBanner();
            this.startBettingPhase();
        }, 5000);
    }

    showBanner(text, cssClass) {
        this.dom.bannerText.innerText = text;
        this.dom.bannerText.className = `banner-title ${cssClass}`;
        this.dom.gameBanner.classList.add('visible');
    }

    hideBanner() {
        this.dom.gameBanner.classList.remove('visible');
    }

    markSpotWinner(spotIdx, isBlackjack) {
        const spotEl = document.getElementById(`spot-${spotIdx}`);
        spotEl.classList.remove('bet-placed');
        
        const bet = this.players[spotIdx].currentBet;
        const prize = isBlackjack ? Math.floor(bet * 1.5) : bet;
        this.spawnFloatingScoreEffect(spotIdx, `+${prize.toLocaleString()}`, 'var(--gold)');
    }

    markSpotLoser(spotIdx) {
        const spotEl = document.getElementById(`spot-${spotIdx}`);
        spotEl.classList.remove('bet-placed');
        
        const bet = this.players[spotIdx].currentBet;
        this.spawnFloatingScoreEffect(spotIdx, `-${bet.toLocaleString()}`, 'var(--red)');
    }

    markSpotPush(spotIdx) {
        const spotEl = document.getElementById(`spot-${spotIdx}`);
        spotEl.classList.remove('bet-placed');
        this.spawnFloatingScoreEffect(spotIdx, 'PUSH', 'var(--blue)');
    }

    spawnFloatingScoreEffect(spotIdx, text, color) {
        const spotEl = document.getElementById(`spot-${spotIdx}`);
        const eff = document.createElement('div');
        eff.innerText = text;
        eff.style.position = 'absolute';
        eff.style.top = '30px';
        eff.style.left = '50%';
        eff.style.transform = 'translateX(-50%)';
        eff.style.color = color;
        eff.style.fontSize = '18px';
        eff.style.fontWeight = '900';
        eff.style.fontFamily = "'Outfit', sans-serif";
        eff.style.textShadow = '0 0 10px rgba(0,0,0,0.8), 0 0 5px ' + color;
        eff.style.pointerEvents = 'none';
        eff.style.zIndex = '100';
        eff.style.transition = 'all 1.5s cubic-bezier(0.19, 1, 0.22, 1)';
        
        spotEl.appendChild(eff);

        setTimeout(() => {
            eff.style.transform = 'translate3d(-50%, -60px, 0)';
            eff.style.opacity = '0';
        }, 50);

        setTimeout(() => {
            eff.remove();
        }, 1600);
    }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new BlackjackGame();
});
