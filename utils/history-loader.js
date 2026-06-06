const fs = require('fs');
const path = require('path');
const axios = require('axios');

const DB_DIR = path.join(__dirname, '..', 'data', 'historical');
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Create database directory
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const INDEX_SYMBOLS = {
  'kospi': '^KS11',
  'kosdaq': '^KQ11',
  'kospi200': '^KS200',
  'exchange': 'KRW=X',
  'sp500': '^GSPC',
  'nasdaq': '^IXIC',
  'dow': '^DJI',
  'soxx': 'SOXX',
  'nikkei': '^N225',
  'topix': '^TPX'
};

// Map stock code & market to Yahoo symbol
function getYahooSymbol(code, market) {
  if (INDEX_SYMBOLS[code]) return INDEX_SYMBOLS[code];
  if (market === 'KOSPI') return `${code}.KS`;
  if (market === 'KOSDAQ') return `${code}.KQ`;
  if (market === 'JP') return `${code}.T`;
  return code; // US is code directly
}

// Format timestamps helper
function formatTimestamp(ts, range) {
  const d = new Date(ts * 1000);
  if (range === '1d') {
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  if (range === '1mo' || range === '1y') {
    return d.toISOString().split('T')[0];
  }
  if (range === '10y') {
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  }
  return d.toLocaleDateString('ko-KR');
}

// Fetch single range helper
async function fetchRange(symbol, range, interval) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`;
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };
  
  try {
    const res = await axios.get(url, { headers, timeout: 8000 });
    const result = res.data?.chart?.result?.[0];
    const timestamps = result?.timestamp || [];
    const closes = result?.indicators?.quote?.[0]?.close || [];
    
    const points = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] !== null && closes[i] !== undefined) {
        points.push({
          date: formatTimestamp(timestamps[i], range),
          price: closes[i]
        });
      }
    }
    return points;
  } catch (err) {
    console.error(`[HISTORY] Fetch failed for ${symbol} range ${range}:`, err.message);
    return []; // Return empty array on failure
  }
}

// Generate fallback mock data
function generateFallbackData(code, currentPrice) {
  const price = currentPrice || 10000;
  
  const generateWalk = (length, pctChange) => {
    const points = [];
    let cur = price * (1 - pctChange / 100);
    const step = (price * (pctChange / 100)) / length;
    for (let i = 0; i < length; i++) {
      cur += step + (Math.random() - 0.5) * (price * 0.02);
      points.push({
        date: `P-${length - i}`,
        price: Math.max(1, cur)
      });
    }
    points[length - 1] = { date: '현재', price };
    return points;
  };

  return {
    code,
    '1d': generateWalk(15, 1.5),
    '1mo': generateWalk(20, 5),
    '1y': generateWalk(24, 15),
    '10y': generateWalk(30, 80),
    isFallback: true,
    updatedAt: Date.now()
  };
}

/**
 * Get historical stock data: check cache file first, fetch if expired/missing
 */
async function getStockHistory(code, market, currentPrice) {
  const filePath = path.join(DB_DIR, `${code}.json`);
  
  // 1. Check cache database
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(raw);
      if (data && data.updatedAt && (Date.now() - data.updatedAt < CACHE_EXPIRY)) {
        console.log(`[HISTORY] Cache hit for stock ${code} database entry.`);
        return data;
      }
    } catch (e) {
      console.warn(`[HISTORY] Cache read failed for ${code}:`, e.message);
    }
  }

  // 2. Cache miss, fetch fresh from Yahoo Finance
  const symbol = getYahooSymbol(code, market);
  console.log(`[HISTORY] Cache miss. Fetching fresh history for ${symbol} (${market})...`);

  const [d1, mo1, y1, y10] = await Promise.all([
    fetchRange(symbol, '1d', '15m'),
    fetchRange(symbol, '1mo', '1d'),
    fetchRange(symbol, '1y', '1wk'),
    fetchRange(symbol, '10y', '1mo')
  ]);

  // If we fetched absolutely nothing (network down or symbol invalid), create fallback database entry
  if (d1.length === 0 && mo1.length === 0 && y1.length === 0 && y10.length === 0) {
    console.warn(`[HISTORY] All Yahoo requests failed for ${symbol}. Creating fallback mock entry.`);
    const fallback = generateFallbackData(code, currentPrice);
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }

  // Compile entry
  const dbEntry = {
    code,
    symbol,
    market,
    '1d': d1,
    '1mo': mo1,
    '1y': y1,
    '10y': y10,
    isFallback: false,
    updatedAt: Date.now()
  };

  try {
    fs.writeFileSync(filePath, JSON.stringify(dbEntry, null, 2), 'utf8');
    console.log(`[HISTORY] Saved fresh history database JSON for ${code}.`);
  } catch (err) {
    console.error(`[HISTORY] Failed to write database file for ${code}:`, err.message);
  }

  return dbEntry;
}

module.exports = {
  getStockHistory
};
