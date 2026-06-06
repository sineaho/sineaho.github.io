// e:\Antigravity\workspace\Cineaho\quant-simulator\app.js

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const initialBalanceInput = document.getElementById("initial-balance");
  const rebalancePeriodSelect = document.getElementById("rebalance-period");
  const portfolioSizeSelect = document.getElementById("portfolio-size");
  const feeRateInput = document.getElementById("fee-rate");
  const backtestDurationSelect = document.getElementById("backtest-duration");
  
  const maxDebtInput = document.getElementById("max-debt");
  const minRoeInput = document.getElementById("min-roe");
  const minGrowthInput = document.getElementById("min-growth");
  const mcapFilterSelect = document.getElementById("mcap-filter");
  
  const sliderPer = document.getElementById("weight-per");
  const sliderPbr = document.getElementById("weight-pbr");
  const sliderPsr = document.getElementById("weight-psr");
  const sliderMom = document.getElementById("weight-mom");
  
  const valPer = document.getElementById("weight-per-val");
  const valPbr = document.getElementById("weight-pbr-val");
  const valPsr = document.getElementById("weight-psr-val");
  const valMom = document.getElementById("weight-mom-val");
  
  const momentumGroup = document.getElementById("momentum-duration-group");
  const momentumLookbackSelect = document.getElementById("momentum-lookback");
  
  const btnRunSimulation = document.getElementById("btn-run-simulation");
  const resultsPlaceholder = document.getElementById("results-placeholder");
  const simulationLoading = document.getElementById("simulation-loading");
  const resultsContent = document.getElementById("results-content");
  
  // KPI Outputs
  const kpiCumReturn = document.getElementById("kpi-cum-return");
  const kpiCagr = document.getElementById("kpi-cagr");
  const kpiMdd = document.getElementById("kpi-mdd");
  const kpiSharpe = document.getElementById("kpi-sharpe");
  const kpiWinRate = document.getElementById("kpi-win-rate");
  const kpiFinalBalance = document.getElementById("kpi-final-balance");
  
  // Tables
  const portfolioTableBody = document.querySelector("#portfolio-table tbody");
  const historyTableBody = document.querySelector("#history-table tbody");
  
  // Preset Cards
  const presetCards = document.querySelectorAll(".preset-card");
  
  // Chart instances
  let returnChart = null;
  let annualChart = null;

  // --- Seed-based LCG Pseudo-Random Generator (Deterministic) ---
  function seedRandom(seed) {
    const m = 0x80000000; // 2**31
    const a = 1103515245;
    const c = 12345;
    let state = seed;
    return function() {
      state = (a * state + c) % m;
      return state / (m - 1);
    };
  }

  // --- Mock Database Generation ---
  // Generates 30 stocks with 60 months of historical prices (2021.06 to 2026.06)
  // and corresponding annual fundamentals (2021 to 2025)
  const stockTickers = [
    { code: "005930", name: "삼성전자", cap: "large", type: "tech" },
    { code: "000660", name: "SK하이닉스", cap: "large", type: "tech" },
    { code: "AAPL", name: "Apple", cap: "large", type: "tech" },
    { code: "NVDA", name: "Nvidia", cap: "large", type: "growth" },
    { code: "MSFT", name: "Microsoft", cap: "large", type: "tech" },
    { code: "GOOGL", name: "Google", cap: "large", type: "tech" },
    { code: "035420", name: "NAVER", cap: "mid", type: "growth" },
    { code: "035720", name: "카카오", cap: "mid", type: "growth" },
    { code: "005380", name: "현대자동차", cap: "large", type: "value" },
    { code: "000270", name: "기아", cap: "large", type: "value" },
    { code: "207940", name: "삼성바이오로직스", cap: "large", type: "growth" },
    { code: "068270", name: "셀트리온", cap: "mid", type: "growth" },
    { code: "051910", name: "LG화학", cap: "mid", type: "growth" },
    { code: "373220", name: "LG에너지솔루션", cap: "mid", type: "growth" },
    { code: "005490", name: "POSCO홀딩스", cap: "mid", type: "value" },
    { code: "055560", name: "KB금융지주", cap: "large", type: "dividend" },
    { code: "055550", name: "신한지주", cap: "mid", type: "dividend" },
    { code: "015760", name: "한국전력공사", cap: "mid", type: "utility" },
    { code: "010950", name: "S-Oil", cap: "mid", type: "dividend" },
    { code: "021240", name: "코웨이", cap: "mid", type: "value" },
    { code: "097950", name: "CJ제일제당", cap: "mid", type: "value" },
    { code: "139480", name: "이마트", cap: "small", type: "value" },
    { code: "012450", name: "한화에어로스페이스", cap: "small", type: "growth" },
    { code: "090430", name: "아모레퍼시픽", cap: "mid", type: "growth" },
    { code: "SMALL1", name: "에스원테크 (S-1)", cap: "small", type: "micro-value" },
    { code: "SMALL2", name: "케이아이바이오 (S-2)", cap: "small", type: "micro-growth" },
    { code: "SMALL3", name: "한가람화학 (S-3)", cap: "small", type: "micro-value" },
    { code: "SMALL4", name: "신성기계 (S-4)", cap: "small", type: "micro-value" },
    { code: "SMALL5", name: "대림자원 (S-5)", cap: "small", type: "micro-growth" },
    { code: "SMALL6", name: "동양정밀 (S-6)", cap: "small", type: "micro-value" }
  ];

  const db = { stocks: [] };

  function initDatabase() {
    // Fixed seed for deterministic behavior
    const rnd = seedRandom(42);
    
    stockTickers.forEach((t, idx) => {
      const stock = {
        code: t.code,
        name: t.name,
        capType: t.cap,
        type: t.type,
        prices: [], // 60 values
        fundamentals: {} // keys: "2021", "2022", "2023", "2024", "2025"
      };
      
      // Determine initial price and drift factors based on stock type
      let basePrice = 20000 + rnd() * 150000;
      let drift = 0.002; // moderate upward drift
      let volatility = 0.06; // standard deviation of monthly return
      
      if (t.type === "growth") {
        drift = 0.015; // high drift
        volatility = 0.12;
      } else if (t.type === "micro-growth") {
        drift = 0.012;
        volatility = 0.18; // high volatility
      } else if (t.type === "micro-value") {
        drift = 0.003;
        volatility = 0.09;
      } else if (t.type === "utility") {
        drift = -0.003; // negative drift
        volatility = 0.04;
      } else if (t.type === "dividend") {
        drift = 0.001;
        volatility = 0.05;
      }
      
      // Generate 60 months of prices (random walk with drift)
      let currentPrice = basePrice;
      for (let m = 0; m < 60; m++) {
        // Special market cycle shocks (e.g. 2022 bear market, 2024 tech rally)
        let shock = 1.0;
        if (m >= 10 && m <= 22) {
          // 2022 global interest rate shock (bear market)
          shock = 0.95 + (rnd() * 0.08 - 0.05); // negative pressure
        } else if (m >= 35 && m <= 48) {
          // 2024 AI boom (bull market for tech/growth)
          if (t.type === "growth" || t.type === "tech" || t.type === "micro-growth") {
            shock = 1.05 + (rnd() * 0.1);
          } else {
            shock = 1.01 + (rnd() * 0.04);
          }
        } else {
          shock = 1.0 + (rnd() * volatility * 2 - volatility);
        }
        
        currentPrice = currentPrice * (1 + drift) * shock;
        if (currentPrice < 100) currentPrice = 100; // minimum price
        stock.prices.push(Math.round(currentPrice));
      }
      
      // Generate yearly fundamentals (2021 to 2025)
      const years = ["2021", "2022", "2023", "2024", "2025"];
      years.forEach((yr, yIdx) => {
        let per = 8 + rnd() * 20;
        let pbr = 0.5 + rnd() * 2;
        let psr = 0.3 + rnd() * 3;
        let roe = 5 + rnd() * 20;
        let debt = 40 + rnd() * 180;
        let growth = -10 + rnd() * 50;
        
        // Customize financials per type
        if (t.type === "growth" || t.type === "micro-growth") {
          per = 25 + rnd() * 40;
          pbr = 3.0 + rnd() * 8;
          psr = 4.0 + rnd() * 8;
          roe = 15 + rnd() * 25;
          debt = 20 + rnd() * 80;
          growth = 20 + rnd() * 80;
        } else if (t.type === "value" || t.type === "micro-value") {
          per = 4 + rnd() * 6;
          pbr = 0.3 + rnd() * 0.5;
          psr = 0.2 + rnd() * 0.6;
          roe = 4 + rnd() * 8;
          debt = 30 + rnd() * 110;
          growth = -5 + rnd() * 15;
        } else if (t.type === "dividend") {
          per = 5 + rnd() * 5;
          pbr = 0.4 + rnd() * 0.4;
          roe = 7 + rnd() * 6;
          debt = 60 + rnd() * 120;
          growth = -2 + rnd() * 10;
        } else if (t.type === "utility") {
          per = 15 + rnd() * 25; // low earnings
          pbr = 0.2 + rnd() * 0.3;
          roe = -2 + rnd() * 6;
          debt = 150 + rnd() * 250; // high debt
          growth = -30 + rnd() * 20;
        }
        
        // Let factors fluctuate slightly year over year
        const multiplier = 1 + (rnd() * 0.2 - 0.1);
        stock.fundamentals[yr] = {
          per: parseFloat((per * multiplier).toFixed(2)),
          pbr: parseFloat((pbr * multiplier).toFixed(2)),
          psr: parseFloat((psr * multiplier).toFixed(2)),
          roe: parseFloat((roe * multiplier).toFixed(1)),
          debt: parseFloat((debt * multiplier).toFixed(1)),
          growth: parseFloat((growth * multiplier).toFixed(1))
        };
      });
      
      db.stocks.push(stock);
    });
  }

  // Initialize DB
  initDatabase();

  // --- Dynamic Slider Constraints (Proportional updates) ---
  const sliders = [
    { el: sliderPer, valEl: valPer, key: "per" },
    { el: sliderPbr, valEl: valPbr, key: "pbr" },
    { el: sliderPsr, valEl: valPsr, key: "psr" },
    { el: sliderMom, valEl: valMom, key: "mom" }
  ];

  sliders.forEach(slider => {
    slider.el.addEventListener("input", (e) => {
      const changedIndex = sliders.findIndex(s => s.el === e.target);
      const newValue = parseInt(e.target.value);
      
      // Calculate remaining value to distribute
      const remainingValue = 100 - newValue;
      
      // Get other sliders sum
      const otherSliders = sliders.filter((_, idx) => idx !== changedIndex);
      const otherSum = otherSliders.reduce((sum, s) => sum + parseInt(s.el.value), 0);
      
      if (otherSum > 0) {
        // Distribute proportionally
        otherSliders.forEach(s => {
          const prevVal = parseInt(s.el.value);
          const ratio = prevVal / otherSum;
          const assignedVal = Math.round(remainingValue * ratio);
          s.el.value = assignedVal;
        });
      } else {
        // If all others were 0, distribute equally
        const share = Math.round(remainingValue / otherSliders.length);
        otherSliders.forEach((s, idx) => {
          s.el.value = idx === otherSliders.length - 1 ? (remainingValue - share * (otherSliders.length - 1)) : share;
        });
      }
      
      // Force adjustment to exact 100% sum if rounding issues occur
      let total = sliders.reduce((sum, s) => sum + parseInt(s.el.value), 0);
      if (total !== 100) {
        // adjust the first non-changed slider
        const adjustIndex = (changedIndex + 1) % sliders.length;
        const currentVal = parseInt(sliders[adjustIndex].el.value);
        sliders[adjustIndex].el.value = currentVal + (100 - total);
      }
      
      // Update text values
      updateSliderUI();
    });
  });

  function updateSliderUI() {
    sliders.forEach(s => {
      s.valEl.textContent = `${s.el.value}%`;
    });
    
    // Toggle momentum duration dropdown based on weight
    if (parseInt(sliderMom.value) > 0) {
      momentumGroup.style.display = "block";
    } else {
      momentumGroup.style.display = "none";
    }
  }

  // --- Preset Strategies Handling ---
  presetCards.forEach(card => {
    card.addEventListener("click", () => {
      // Toggle active class
      presetCards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      
      const preset = card.dataset.preset;
      applyPresetParameters(preset);
    });
  });
  
  function applyPresetParameters(preset) {
    if (preset === "magic") {
      sliderPer.value = 50;
      sliderPbr.value = 50;
      sliderPsr.value = 0;
      sliderMom.value = 0;
      
      minRoeInput.value = 10;
      maxDebtInput.value = 200;
      minGrowthInput.value = -50;
      mcapFilterSelect.value = "all";
      portfolioSizeSelect.value = "10";
      rebalancePeriodSelect.value = "3";
    }
    else if (preset === "momentum") {
      sliderPer.value = 0;
      sliderPbr.value = 0;
      sliderPsr.value = 0;
      sliderMom.value = 100;
      
      minRoeInput.value = -20;
      maxDebtInput.value = 300;
      minGrowthInput.value = -50;
      mcapFilterSelect.value = "all";
      portfolioSizeSelect.value = "5";
      rebalancePeriodSelect.value = "3";
      momentumLookbackSelect.value = "12";
    }
    else if (preset === "value") {
      sliderPer.value = 50;
      sliderPbr.value = 50;
      sliderPsr.value = 0;
      sliderMom.value = 0;
      
      minRoeInput.value = 0;
      maxDebtInput.value = 200;
      minGrowthInput.value = -50;
      mcapFilterSelect.value = "all";
      portfolioSizeSelect.value = "15";
      rebalancePeriodSelect.value = "3";
    }
    else if (preset === "ncav") {
      sliderPer.value = 30;
      sliderPbr.value = 70;
      sliderPsr.value = 0;
      sliderMom.value = 0;
      
      minRoeInput.value = -10;
      maxDebtInput.value = 100; // conservative debt
      minGrowthInput.value = -50;
      mcapFilterSelect.value = "small"; // Small caps only
      portfolioSizeSelect.value = "10";
      rebalancePeriodSelect.value = "6"; // 6 months rebalance
    }
    else if (preset === "fscore") {
      sliderPer.value = 40;
      sliderPbr.value = 30;
      sliderPsr.value = 30;
      sliderMom.value = 0;
      
      minRoeInput.value = 10;
      maxDebtInput.value = 150;
      minGrowthInput.value = 5; // Positive earnings growth
      mcapFilterSelect.value = "all";
      portfolioSizeSelect.value = "10";
      rebalancePeriodSelect.value = "3";
    }
    
    updateSliderUI();
  }

  // Initialize UI
  applyPresetParameters("magic");

  // --- Backtesting Engine ---
  btnRunSimulation.addEventListener("click", () => {
    resultsPlaceholder.style.display = "none";
    resultsContent.style.display = "none";
    simulationLoading.style.display = "flex";
    
    // Simulate complex backtesting workload with a short timeout
    setTimeout(() => {
      runBacktest();
      simulationLoading.style.display = "none";
      resultsContent.style.display = "block";
      showToast("퀀트 시뮬레이션 및 백테스트가 완료되었습니다!");
    }, 800);
  });

  function getYearFromMonth(monthIndex) {
    // 0 is 2021.06, index 0~6: 2021, 7~18: 2022, 19~30: 2023, 31~42: 2024, 43~54: 2025, 55~59: 2025 (latest available)
    if (monthIndex < 7) return "2021";
    if (monthIndex < 19) return "2022";
    if (monthIndex < 31) return "2023";
    if (monthIndex < 43) return "2024";
    return "2025";
  }

  function runBacktest() {
    // Read Form Values
    const initialBalance = parseFloat(initialBalanceInput.value);
    const rebalancePeriod = parseInt(rebalancePeriodSelect.value);
    const portfolioSize = parseInt(portfolioSizeSelect.value);
    const feeRate = parseFloat(feeRateInput.value) / 100.0;
    const backtestDuration = parseInt(backtestDurationSelect.value);
    
    const maxDebt = parseFloat(maxDebtInput.value);
    const minRoe = parseFloat(minRoeInput.value);
    const minGrowth = parseFloat(minGrowthInput.value);
    const mcapFilter = mcapFilterSelect.value;
    
    const weightPer = parseInt(sliderPer.value);
    const weightPbr = parseInt(sliderPbr.value);
    const weightPsr = parseInt(sliderPsr.value);
    const weightMom = parseInt(sliderMom.value);
    const momentumLookback = parseInt(momentumLookbackSelect.value);
    
    // Define backtest index range: 60 - duration to 59
    const startIndex = 60 - backtestDuration;
    const endIndex = 59;
    
    // Simulation state
    let cash = initialBalance;
    let portfolio = []; // elements: { code, name, shares, buyPrice, buyMonth }
    
    // Historical performance tracking
    const historyLog = []; // items: { date, action, name, price, shares, total }
    const portfolioEquityCurve = []; // { month, val }
    const benchmarkEquityCurve = [];
    
    // Monthly loop
    for (let m = startIndex; m <= endIndex; m++) {
      const year = getYearFromMonth(m);
      const isRebalance = ((m - startIndex) % rebalancePeriod === 0) || (m === startIndex);
      
      const currentDateString = getFormattedDate(m);
      
      // Calculate current portfolio value at the start of this month
      let portfolioValue = cash;
      portfolio.forEach(pos => {
        const currentStockPrice = getStockPrice(pos.code, m);
        portfolioValue += pos.shares * currentStockPrice;
      });
      
      // Rebalancing Process
      if (isRebalance) {
        // 1. Sell previous positions
        if (portfolio.length > 0) {
          portfolio.forEach(pos => {
            const currentStockPrice = getStockPrice(pos.code, m);
            const proceeds = pos.shares * currentStockPrice * (1 - feeRate);
            cash += proceeds;
            
            historyLog.push({
              date: currentDateString,
              action: "매도",
              name: pos.name,
              price: currentStockPrice,
              shares: Math.floor(pos.shares),
              total: Math.round(proceeds)
            });
          });
          portfolio = [];
        }
        
        // 2. Filter & Rank Stocks
        const candidates = [];
        db.stocks.forEach(s => {
          const fundamentals = s.fundamentals[year];
          if (!fundamentals) return;
          
          // Check financial filters
          if (fundamentals.debt > maxDebt) return;
          if (fundamentals.roe < minRoe) return;
          if (fundamentals.growth < minGrowth) return;
          if (mcapFilter !== "all" && s.capType !== mcapFilter) return;
          
          // Valuation checks (PER, PBR, PSR should not be negative for ranking)
          if (weightPer > 0 && fundamentals.per <= 0) return;
          if (weightPbr > 0 && fundamentals.pbr <= 0) return;
          if (weightPsr > 0 && fundamentals.psr <= 0) return;
          
          // Calculate momentum return over lookback period
          let momentumReturn = 0;
          if (weightMom > 0) {
            const momStartMonth = Math.max(0, m - momentumLookback);
            const startPrice = s.prices[momStartMonth];
            const endPrice = s.prices[m];
            momentumReturn = (endPrice - startPrice) / startPrice;
            
            // Dual momentum absolute filter (Gary Antonacci style: return must be positive)
            if (weightMom === 100 && momentumReturn <= 0) {
              return; // skip if absolute momentum is negative
            }
          }
          
          candidates.push({
            code: s.code,
            name: s.name,
            capType: s.capType,
            prices: s.prices,
            fundamentals: fundamentals,
            momentumReturn: momentumReturn,
            // Ranks will be resolved
            perRank: 0,
            pbrRank: 0,
            psrRank: 0,
            momRank: 0
          });
        });
        
        if (candidates.length > 0) {
          // Resolve ranks (ascending order for PER/PBR/PSR - lower is better)
          if (weightPer > 0) {
            candidates.sort((a, b) => a.fundamentals.per - b.fundamentals.per);
            candidates.forEach((c, idx) => c.perRank = idx + 1);
          }
          if (weightPbr > 0) {
            candidates.sort((a, b) => a.fundamentals.pbr - b.fundamentals.pbr);
            candidates.forEach((c, idx) => c.pbrRank = idx + 1);
          }
          if (weightPsr > 0) {
            candidates.sort((a, b) => a.fundamentals.psr - b.fundamentals.psr);
            candidates.forEach((c, idx) => c.psrRank = idx + 1);
          }
          // Resolve momentum rank (descending order - higher return is better)
          if (weightMom > 0) {
            candidates.sort((a, b) => b.momentumReturn - a.momentumReturn);
            candidates.forEach((c, idx) => c.momRank = idx + 1);
          }
          
          // Compute composite scores
          candidates.forEach(c => {
            c.score = 
              (c.perRank * (weightPer / 100)) + 
              (c.pbrRank * (weightPbr / 100)) + 
              (c.psrRank * (weightPsr / 100)) + 
              (c.momRank * (weightMom / 100));
          });
          
          // Sort by composite score (lowest is best)
          candidates.sort((a, b) => a.score - b.score);
          
          // Buy Top N Stocks
          const selectedStocks = candidates.slice(0, portfolioSize);
          if (selectedStocks.length > 0) {
            const allocationPerStock = cash / selectedStocks.length;
            
            selectedStocks.forEach(s => {
              const currentPrice = getStockPrice(s.code, m);
              const costBeforeFees = allocationPerStock;
              const costAfterFees = costBeforeFees * (1 - feeRate);
              const sharesToBuy = costAfterFees / currentPrice;
              
              portfolio.push({
                code: s.code,
                name: s.name,
                shares: sharesToBuy,
                buyPrice: currentPrice,
                buyMonth: m,
                // store current metrics for details table
                pbr: s.fundamentals.pbr,
                per: s.fundamentals.per,
                roe: s.fundamentals.roe,
                debt: s.fundamentals.debt,
                cap: s.capType === "large" ? "대형주" : s.capType === "mid" ? "중형주" : "소형주"
              });
              
              historyLog.push({
                date: currentDateString,
                action: "매수",
                name: s.name,
                price: currentPrice,
                shares: Math.floor(sharesToBuy),
                total: Math.round(costBeforeFees)
              });
            });
            
            cash = 0; // all cash allocated
          }
        }
      }
      
      // Calculate end-of-month equity (realtime tracking)
      let endOfMonthPortfolioValue = cash;
      portfolio.forEach(pos => {
        const currentStockPrice = getStockPrice(pos.code, m);
        endOfMonthPortfolioValue += pos.shares * currentStockPrice;
      });
      portfolioEquityCurve.push({ month: m, val: endOfMonthPortfolioValue });
      
      // Track Benchmark index returns (broad market tracking of all 30 stocks)
      const benchmarkVal = getBenchmarkValue(m, startIndex, initialBalance);
      benchmarkEquityCurve.push({ month: m, val: benchmarkVal });
    }
    
    // Final equity value
    const finalEquity = portfolioEquityCurve[portfolioEquityCurve.length - 1].val;
    
    // --- Metric Calculations ---
    
    // 1. Cumulative Return
    const totalReturn = ((finalEquity - initialBalance) / initialBalance) * 100;
    
    // 2. CAGR (Annualized Return)
    const yearsDuration = backtestDuration / 12;
    const cagr = (Math.pow((finalEquity / initialBalance), (1 / yearsDuration)) - 1) * 100;
    
    // 3. Max Drawdown (MDD)
    let peak = -1;
    let maxDrawdown = 0;
    portfolioEquityCurve.forEach(p => {
      if (p.val > peak) {
        peak = p.val;
      }
      const drawdown = ((p.val - peak) / peak) * 100;
      if (drawdown < maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });
    
    // 4. Volatility & Sharpe Ratio (assume risk-free rate is 2.0% annually or 0.16% monthly)
    const monthlyReturns = [];
    for (let i = 1; i < portfolioEquityCurve.length; i++) {
      const prev = portfolioEquityCurve[i - 1].val;
      const curr = portfolioEquityCurve[i].val;
      monthlyReturns.push((curr - prev) / prev);
    }
    
    const avgMonthlyReturn = monthlyReturns.reduce((sum, r) => sum + r, 0) / monthlyReturns.length;
    const variance = monthlyReturns.reduce((sum, r) => sum + Math.pow(r - avgMonthlyReturn, 2), 0) / (monthlyReturns.length - 1);
    const monthlyVolatility = Math.sqrt(variance);
    const annualizedVol = monthlyVolatility * Math.sqrt(12);
    
    const riskFreeRateAnnual = 2.0 / 100.0;
    const annualizedReturnFraction = cagr / 100.0;
    
    let sharpeRatio = 0;
    if (annualizedVol > 0) {
      sharpeRatio = (annualizedReturnFraction - riskFreeRateAnnual) / annualizedVol;
    }
    
    // 5. Win Rate (number of positive return months)
    const positiveMonths = monthlyReturns.filter(r => r > 0).length;
    const winRate = (positiveMonths / monthlyReturns.length) * 100;
    
    // --- Render KPI Values to UI ---
    kpiCumReturn.textContent = `${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(2)}%`;
    kpiCumReturn.className = totalReturn >= 0 ? "positive" : "negative";
    
    kpiCagr.textContent = `${cagr >= 0 ? '+' : ''}${cagr.toFixed(2)}%`;
    kpiCagr.className = cagr >= 0 ? "positive" : "negative";
    
    kpiMdd.textContent = `${maxDrawdown.toFixed(2)}%`;
    kpiMdd.className = "negative";
    
    kpiSharpe.textContent = sharpeRatio.toFixed(2);
    kpiSharpe.className = sharpeRatio >= 1.0 ? "positive" : sharpeRatio < 0 ? "negative" : "";
    
    kpiWinRate.textContent = `${winRate.toFixed(1)}%`;
    kpiFinalBalance.textContent = `${Math.round(finalEquity).toLocaleString()}원`;
    
    // --- Render Tables ---
    
    // A. Current Portfolio Table
    portfolioTableBody.innerHTML = "";
    if (portfolio.length === 0) {
      portfolioTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;">편입된 종목이 없습니다.</td></tr>`;
    } else {
      const equalWeight = (100 / portfolio.length).toFixed(1);
      portfolio.forEach(pos => {
        const row = document.createElement("tr");
        const currentStockPrice = getStockPrice(pos.code, endIndex);
        row.innerHTML = `
          <td><strong>${pos.name}</strong> (${pos.code})</td>
          <td>${pos.cap}</td>
          <td>${equalWeight}%</td>
          <td>${currentStockPrice.toLocaleString()}원</td>
          <td>${pos.per}</td>
          <td>${pos.pbr}</td>
          <td>${pos.roe}%</td>
          <td>${pos.debt}%</td>
        `;
        portfolioTableBody.appendChild(row);
      });
    }
    
    // B. Rebalancing History Table
    historyTableBody.innerHTML = "";
    if (historyLog.length === 0) {
      historyTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">거래 일지가 없습니다.</td></tr>`;
    } else {
      // Reverse to show latest first
      historyLog.slice().reverse().forEach(log => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${log.date}</td>
          <td class="${log.action === '매수' ? 'positive' : 'negative'}">${log.action}</td>
          <td><strong>${log.name}</strong></td>
          <td>${log.price.toLocaleString()}원</td>
          <td>${log.shares.toLocaleString()}주</td>
          <td>${log.total.toLocaleString()}원</td>
        `;
        historyTableBody.appendChild(row);
      });
    }
    
    // --- Render Charts ---
    renderCharts(portfolioEquityCurve, benchmarkEquityCurve, startIndex);
  }

  // --- Helper Functions for Data Retrieve ---
  function getStockPrice(code, monthIndex) {
    const s = db.stocks.find(stock => stock.code === code);
    return s ? s.prices[monthIndex] : 0;
  }

  function getBenchmarkValue(monthIndex, startMonthIndex, initialBalance) {
    // Benchmark index is equal-weighted average price of all 30 stocks
    let startAvg = 0;
    let currentAvg = 0;
    
    db.stocks.forEach(s => {
      startAvg += s.prices[startMonthIndex];
      currentAvg += s.prices[monthIndex];
    });
    
    startAvg /= db.stocks.length;
    currentAvg /= db.stocks.length;
    
    return initialBalance * (currentAvg / startAvg);
  }

  function getFormattedDate(monthIndex) {
    // Month 0 is June 2021.
    // Calculate calendar year and month
    const startYear = 2021;
    const startMonth = 6; // June
    
    const totalMonths = startMonth - 1 + monthIndex;
    const year = startYear + Math.floor(totalMonths / 12);
    const month = (totalMonths % 12) + 1;
    
    return `${year}년 ${month < 10 ? '0' : ''}${month}월`;
  }

  // --- Chart.js Rendering Pipeline ---
  function renderCharts(portfolioCurve, benchmarkCurve, startMonthIndex) {
    // Prepare labels
    const labels = portfolioCurve.map(p => getFormattedDate(p.month));
    
    // Calculate returns instead of absolute balance to compare easily
    const initialBal = portfolioCurve[0].val;
    const portfolioReturns = portfolioCurve.map(p => (((p.val - initialBal) / initialBal) * 100).toFixed(2));
    const benchmarkReturns = benchmarkCurve.map(b => (((b.val - initialBal) / initialBal) * 100).toFixed(2));
    
    // 1. Cumulative Return Line Chart
    if (returnChart) returnChart.destroy();
    
    const ctxReturn = document.getElementById("return-chart").getContext("2d");
    returnChart = new Chart(ctxReturn, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '내 포트폴리오',
            data: portfolioReturns,
            borderColor: '#a855f7', // Purple
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            borderWidth: 3,
            pointRadius: 1,
            pointHoverRadius: 5,
            fill: true,
            tension: 0.15
          },
          {
            label: '벤치마크 (시장 평균)',
            data: benchmarkReturns,
            borderColor: '#00f2fe', // Cyan
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 1,
            pointHoverRadius: 4,
            borderDash: [5, 5],
            fill: false,
            tension: 0.15
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#94a3b8', font: { family: 'Noto Sans KR', size: 10 } }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: ${context.raw}%`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.03)' },
            ticks: { color: '#64748b', maxTicksLimit: 10, font: { family: 'Outfit', size: 9 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.03)' },
            ticks: { 
              color: '#64748b', 
              font: { family: 'Outfit', size: 9 },
              callback: function(value) { return value + '%'; }
            }
          }
        }
      }
    });
    
    // 2. Annual Performance Bar Chart
    // Group monthly results by year
    const yearlyPerformance = {}; // keys: 2021, 2022, 2023, 2024, 2025, 2026
    portfolioCurve.forEach((p, idx) => {
      const dateStr = getFormattedDate(p.month);
      const calendarYear = dateStr.split("년")[0].trim();
      
      if (!yearlyPerformance[calendarYear]) {
        yearlyPerformance[calendarYear] = {
          pStart: p.val,
          pEnd: p.val,
          bStart: benchmarkCurve[idx].val,
          bEnd: benchmarkCurve[idx].val
        };
      }
      // Update ending value
      yearlyPerformance[calendarYear].pEnd = p.val;
      yearlyPerformance[calendarYear].bEnd = benchmarkCurve[idx].val;
    });
    
    // For years after the first one, the starting value is the ending value of the previous year
    const activeYears = Object.keys(yearlyPerformance).sort();
    activeYears.forEach((yr, idx) => {
      if (idx > 0) {
        const prevYr = activeYears[idx - 1];
        yearlyPerformance[yr].pStart = yearlyPerformance[prevYr].pEnd;
        yearlyPerformance[yr].bStart = yearlyPerformance[prevYr].bEnd;
      }
    });
    
    const barLabels = [];
    const pBarData = [];
    const bBarData = [];
    
    activeYears.forEach(yr => {
      const data = yearlyPerformance[yr];
      const pRet = ((data.pEnd - data.pStart) / data.pStart) * 100;
      const bRet = ((data.bEnd - data.bStart) / data.bStart) * 100;
      
      barLabels.push(`${yr}년`);
      pBarData.push(pRet.toFixed(1));
      bBarData.push(bRet.toFixed(1));
    });
    
    if (annualChart) annualChart.destroy();
    
    const ctxAnnual = document.getElementById("annual-chart").getContext("2d");
    annualChart = new Chart(ctxAnnual, {
      type: 'bar',
      data: {
        labels: barLabels,
        datasets: [
          {
            label: '내 포트폴리오',
            data: pBarData,
            backgroundColor: '#a855f7',
            borderRadius: 4
          },
          {
            label: '벤치마크',
            data: bBarData,
            backgroundColor: '#00f2fe',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#94a3b8', font: { family: 'Noto Sans KR', size: 10 } }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: ${context.raw}%`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#64748b', font: { family: 'Noto Sans KR', size: 10 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.03)' },
            ticks: { 
              color: '#64748b', 
              font: { family: 'Outfit', size: 9 },
              callback: function(value) { return value + '%'; }
            }
          }
        }
      }
    });
  }

  // --- Toast System ---
  function showToast(message) {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 9999;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }
    
    const toast = document.createElement("div");
    toast.style.cssText = `
      background: rgba(17, 24, 39, 0.95);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-left: 4px solid #10b981;
      color: #fff;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      align-items: center;
      gap: 8px;
      pointer-events: auto;
    `;
    
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #10b981;"></i> <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.transform = "translateY(0)";
      toast.style.opacity = "1";
    }, 10);
    
    setTimeout(() => {
      toast.style.transform = "translateY(-10px)";
      toast.style.opacity = "0";
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }
});
