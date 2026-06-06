const path = require('path');
const collector = require('../utils/stock-collector');

function formatNum(val, dec = 2) {
  if (val === undefined || val === null) return 'N/A';
  return val.toLocaleString('ko-KR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function formatChange(change, pct) {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${formatNum(change)} (${sign}${formatNum(pct)}%)`;
}

async function main() {
  console.log('========================================================================');
  console.log(' CineAHO Stock Collection CLI Utility');
  console.log(` Executed at: ${new Date().toLocaleString('ko-KR')}`);
  console.log('========================================================================\n');

  try {
    const snapshot = await collector.collectCurrentPrices();
    
    console.log('\n------------------------------------------------------------------------');
    console.log(' 1. Market Indices');
    console.log('------------------------------------------------------------------------');
    
    const idx = snapshot.indices;
    const indexRows = [
      { name: 'KOSPI 코스피', price: idx.kospi?.currentValue, change: idx.kospi?.change, pct: idx.kospi?.pct, unit: 'pt' },
      { name: 'KOSDAQ 코스닥', price: idx.kosdaq?.currentValue, change: idx.kosdaq?.change, pct: idx.kosdaq?.pct, unit: 'pt' },
      { name: 'S&P 500', price: idx.sp500?.currentValue, change: idx.sp500?.change, pct: idx.sp500?.pct, unit: '$' },
      { name: 'NASDAQ', price: idx.nasdaq?.currentValue, change: idx.nasdaq?.change, pct: idx.nasdaq?.pct, unit: '$' },
      { name: 'Nikkei 225', price: idx.nikkei?.currentValue, change: idx.nikkei?.change, pct: idx.nikkei?.pct, unit: '¥' },
      { name: '원/달러 환율', price: idx.exchange?.currentValue, change: idx.exchange?.change, pct: idx.exchange?.pct, unit: '원' }
    ];

    indexRows.forEach(row => {
      const priceStr = row.price !== undefined ? `${formatNum(row.price)} ${row.unit}` : 'N/A';
      const changeStr = (row.change !== undefined && row.pct !== undefined) ? formatChange(row.change, row.pct) : 'N/A';
      console.log(` - ${row.name.padEnd(16)}: ${priceStr.padStart(16)} | ${changeStr}`);
    });

    console.log('\n------------------------------------------------------------------------');
    console.log(' 2. Featured Stocks Summary');
    console.log('------------------------------------------------------------------------');

    const sampleStocks = [
      { code: '005930', name: '삼성전자 (KR)', market: 'KR' },
      { code: '000660', name: 'SK하이닉스 (KR)', market: 'KR' },
      { code: 'AAPL', name: 'Apple (US)', market: 'US' },
      { code: 'NVDA', name: 'NVIDIA (US)', market: 'US' },
      { code: '7203', name: 'Toyota (JP)', market: 'JP' },
      { code: '6758', name: 'Sony (JP)', market: 'JP' }
    ];

    sampleStocks.forEach(row => {
      const s = snapshot.stocks[row.code];
      if (s) {
        let priceStr = '';
        if (row.market === 'KR') priceStr = `${formatNum(s.price, 0)} 원`;
        else if (row.market === 'US') priceStr = `$${formatNum(s.price, 2)}`;
        else if (row.market === 'JP') priceStr = `¥${formatNum(s.price, 0)}`;

        const changeStr = formatChange(s.change, s.pct);
        console.log(` - ${row.name.padEnd(16)}: ${priceStr.padStart(16)} | ${changeStr} | Vol: ${s.volume}`);
      } else {
        console.log(` - ${row.name.padEnd(16)}: Not Found`);
      }
    });

    console.log('\n========================================================================');
    console.log(' SUCCESS: Data stored successfully in data/stock-history.json.');
    console.log('========================================================================');
  } catch (err) {
    console.error('\n========================================================================');
    console.error(' ERROR: Stock collection failed.');
    console.error(` details: ${err.message}`);
    console.error('========================================================================');
    process.exit(1);
  }
}

main();
