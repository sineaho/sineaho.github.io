const fs = require('fs');
const path = require('path');
const axios = require('axios');

const DATA_DIR = path.join(__dirname, '..', 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'stock-history.json');
const MAX_HISTORY_LEN = 60;

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const krStockCodes = [
  '005930', '000660', '005380', '000270', '068270', '005490', '051910', '028260', '105560', '055550',
  '373220', '207940', '035420', '035720', '006400', '003670', '066570', '450080', '096770', '329180',
  '198750', '247540', '086520', '028300', '348370', '058470', '214150', '145020', '000250', '242040',
  '293490', '277810', '403010', '039030', '036830', '005290', '032800', '048260', '041960', '025900'
];

const chunks = {
  indices: ['^GSPC', '^IXIC', '^DJI', 'SOXX', '^N225', '^TPX', 'KRW=X'],
  us: ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA', 'BRK-B', 'AVGO', 'LLY', 'AMD', 'NFLX', 'INTC', 'QCOM', 'MU'],
  jp: ['7203.T', '6758.T', '6861.T', '8306.T', '8035.T', '9983.T', '9984.T', '7974.T', '7267.T', '4063.T']
};

// Helper for Naver sign
const getNaverChangeSign = (rf, val) => {
  const absVal = Math.abs(val);
  if (rf === '4' || rf === '5') return -absVal;
  return absVal;
};

/**
 * Core function to fetch current indices and stock prices from Naver and Yahoo Finance
 */
async function fetchCurrentData() {
  const formattedStocks = {};
  const formattedIndices = {};

  // 1. Fetch KR Stocks from Naver Finance
  console.log('[COLLECTOR] Fetching Korean stocks from Naver Finance...');
  const krStockUrl = `https://polling.finance.naver.com/api/realtime?query=SERVICE_ITEM:${krStockCodes.join(',')}`;
  const krStockRes = await axios.get(krStockUrl, { timeout: 10000 });
  const krStockDatas = krStockRes.data?.result?.areas?.[0]?.datas || [];

  // 2. Fetch KR Indices from Naver Finance
  console.log('[COLLECTOR] Fetching Korean indices from Naver Finance...');
  const krIndicesUrl = `https://polling.finance.naver.com/api/realtime?query=SERVICE_INDEX:KOSPI,KOSDAQ,KPI200`;
  const krIndicesRes = await axios.get(krIndicesUrl, { timeout: 10000 });
  const krIndicesDatas = krIndicesRes.data?.result?.areas?.[0]?.datas || [];

  // 3. Fetch Global Indices & Global Stocks from Yahoo Finance in chunks
  console.log('[COLLECTOR] Fetching global indices and stocks from Yahoo Finance...');
  const yahooResults = {};
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };

  for (const [key, syms] of Object.entries(chunks)) {
    try {
      const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${syms.join(',')}&range=1d&interval=1d`;
      const resYahoo = await axios.get(url, { headers, timeout: 10000 });
      const resultItems = resYahoo.data?.spark?.result || [];
      resultItems.forEach(item => {
        const sym = item.symbol;
        const meta = item.response?.[0]?.meta;
        if (meta) {
          const price = meta.regularMarketPrice;
          const prevClose = meta.chartPreviousClose;
          const change = price - prevClose;
          const pct = prevClose ? (change / prevClose) * 100 : 0;
          yahooResults[sym] = { price, change, pct };
        }
      });
    } catch (err) {
      console.error(`[COLLECTOR] Yahoo Finance fetch failed for chunk ${key}:`, err.message);
    }
  }

  // Format KR Stocks
  krStockDatas.forEach(d => {
    const price = d.nv;
    const rawChange = d.cv;
    const rawPct = d.cr;
    const rf = d.rf;
    
    const change = getNaverChangeSign(rf, rawChange);
    const pct = getNaverChangeSign(rf, rawPct);
    
    let volume = '0';
    if (d.aq) {
      if (d.aq >= 1000000) volume = (d.aq / 1000000).toFixed(1) + 'M';
      else if (d.aq >= 1000) volume = (d.aq / 1000).toFixed(0) + 'K';
      else volume = d.aq.toString();
    }

    formattedStocks[d.cd] = { price, change, pct, volume };
  });

  // Format KR Indices
  krIndicesDatas.forEach(d => {
    const val = d.nv / 100;
    const rf = d.rf;
    const change = getNaverChangeSign(rf, d.cv / 100);
    const pct = getNaverChangeSign(rf, d.cr);
    const key = d.cd.toLowerCase();
    const mappedKey = key === 'kpi200' ? 'kospi200' : key;
    formattedIndices[mappedKey] = { currentValue: val, change, pct };
  });

  // Format Global Indices
  const mapGlobalIndex = (yahooSym, indexKey) => {
    const data = yahooResults[yahooSym];
    if (data) {
      formattedIndices[indexKey] = {
        currentValue: data.price,
        change: data.change,
        pct: data.pct
      };
    }
  };

  mapGlobalIndex('^GSPC', 'sp500');
  mapGlobalIndex('^IXIC', 'nasdaq');
  mapGlobalIndex('^DJI', 'dow');
  mapGlobalIndex('SOXX', 'soxx');
  mapGlobalIndex('^N225', 'nikkei');
  mapGlobalIndex('^TPX', 'topix');
  mapGlobalIndex('KRW=X', 'exchange');

  // Format Global Stocks
  const globalStockSyms = [...chunks.us, ...chunks.jp];
  globalStockSyms.forEach(sym => {
    const data = yahooResults[sym];
    if (data) {
      const cleanKey = sym.replace('.T', '');
      formattedStocks[cleanKey] = {
        price: data.price,
        change: data.change,
        pct: data.pct,
        volume: '1.2M'
      };
    }
  });

  return {
    success: true,
    indices: formattedIndices,
    stocks: formattedStocks,
    timestamp: Date.now()
  };
}

/**
 * Read the historical price snapshots from data/stock-history.json
 */
function readPriceHistory() {
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      const raw = fs.readFileSync(HISTORY_FILE, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      console.error('[COLLECTOR] Failed to parse stock-history.json:', e.message);
      return [];
    }
  }
  return [];
}

/**
 * Core collector engine that fetches, saves, and trims history
 */
async function collectCurrentPrices() {
  try {
    const snapshot = await fetchCurrentData();
    
    // Load existing history
    let history = readPriceHistory();
    if (!Array.isArray(history)) {
      history = [];
    }

    // Append new snapshot
    history.push(snapshot);

    // Limit history length
    if (history.length > MAX_HISTORY_LEN) {
      history = history.slice(history.length - MAX_HISTORY_LEN);
    }

    // Save history
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
    console.log(`[COLLECTOR] Successfully collected and logged snapshot to history database (${history.length} records).`);
    return snapshot;
  } catch (err) {
    console.error('[COLLECTOR] Failed to collect stock prices:', err.message);
    throw err;
  }
}

module.exports = {
  collectCurrentPrices,
  readPriceHistory,
  fetchCurrentData
};
