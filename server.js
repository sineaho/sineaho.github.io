require('dotenv').config();
const fs = require('fs');
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');
const stockCollector = require('./utils/stock-collector');
const historyLoader = require('./utils/history-loader');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- 실시간 방문자수 집계 시스템 ---
const STATS_FILE = path.join(__dirname, 'data', 'visitor-stats.json');

// 기본 통계 구조 초기화
let stats = {
  visits: {
    main: { total: 839335, today: 363, uniqueTotal: 326396, uniqueToday: 208 }
  },
  lastResetDate: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
  todayIPs: {}
};

// data 디렉토리 자동 생성
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// 파일로부터 통계 읽기
if (fs.existsSync(STATS_FILE)) {
  try {
    const raw = fs.readFileSync(STATS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed.visits) {
      stats = parsed;
    }
  } catch (err) {
    console.error('Failed to load visitor-stats.json:', err.message);
  }
}

// 통계 저장 함수
function saveStats() {
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save visitor-stats.json:', err.message);
  }
}

// 매일 자정 기준 일간 카운트 초기화 체크
function checkDateReset() {
  const todayStr = new Date().toLocaleDateString('en-CA');
  if (stats.lastResetDate !== todayStr) {
    stats.lastResetDate = todayStr;
    stats.todayIPs = {};
    for (const key in stats.visits) {
      stats.visits[key].today = 0;
      stats.visits[key].uniqueToday = 0;
    }
    saveStats();
  }
}

// 카운터 증가 처리 함수
function incrementVisit(app, clientIp, hasVisitedCookie, res) {
  checkDateReset();

  if (!stats.visits[app]) {
    stats.visits[app] = { total: 0, today: 0, uniqueTotal: 0, uniqueToday: 0 };
  }

  const appStats = stats.visits[app];
  appStats.total++;
  appStats.today++;

  // 오늘 고유 방문자 (IP 기준)
  if (!stats.todayIPs[app]) {
    stats.todayIPs[app] = [];
  }
  if (!stats.todayIPs[app].includes(clientIp)) {
    stats.todayIPs[app].push(clientIp);
    appStats.uniqueToday++;
  }

  // 전체 고유 방문자 (쿠키 기준)
  if (!hasVisitedCookie) {
    appStats.uniqueTotal++;
    const cookieName = `cineaho_visited_${app}`;
    res.cookie(cookieName, 'true', { maxAge: 10 * 365 * 24 * 60 * 60 * 1000, httpOnly: true });
  }

  saveStats();
}

// 방문 감지 미들웨어
app.use((req, res, next) => {
  const p = req.path;
  const ext = path.extname(p);
  const isHtml = ext === '' || ext === '.html';
  const isAssetDir = p.startsWith('/node_modules') || p.startsWith('/data') || p.startsWith('/images') || p.startsWith('/image') || p.startsWith('/css') || p.startsWith('/js');

  if (isHtml && !isAssetDir) {
    let appName = null;
    if (p === '/' || p === '/index.html') {
      appName = 'main';
    } else {
      const match = p.match(/^\/([a-zA-Z0-9_-]+)\/?(index\.html)?$/);
      if (match) {
        appName = match[1];
      }
    }

    if (appName) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      
      // 간단한 쿠키 파싱
      const cookies = {};
      if (req.headers.cookie) {
        req.headers.cookie.split(';').forEach(c => {
          const parts = c.split('=');
          if (parts.length >= 2) {
            cookies[parts[0].trim()] = parts[1].trim();
          }
        });
      }
      const cookieName = `cineaho_visited_${appName}`;
      const hasVisitedCookie = !!cookies[cookieName];

      incrementVisit(appName, clientIp, hasVisitedCookie, res);
    }
  }
  next();
});

// 방문자수 API 엔드포인트
app.get('/api/visits', (req, res) => {
  res.json(stats.visits);
});

// Cineaho 폴더 전체를 static 호스팅 (하위 naver-seo, checklist 등 자동 호스팅됨)
app.use(express.static(__dirname));

// 네이버 블로그 URL 파싱 정규식
const NAVER_BLOG_REGEXES = [
  /blog\.naver\.com\/([a-zA-Z0-9_-]+)\/([0-9]+)/,
  /blog\.naver\.com\/PostView\.(naver|nhn)\?.*blogId=([a-zA-Z0-9_-]+).*logNo=([0-9]+)/,
  /m\.blog\.naver\.com\/([a-zA-Z0-9_-]+)\/([0-9]+)/,
  /m\.blog\.naver\.com\/PostView\.(naver|nhn)\?.*blogId=([a-zA-Z0-9_-]+).*logNo=([0-9]+)/
];

function extractBlogInfo(url) {
  for (const regex of NAVER_BLOG_REGEXES) {
    const match = url.match(regex);
    if (match) {
      if (match.length >= 4 && (match[1] === 'naver' || match[1] === 'nhn')) {
        return { blogId: match[2], logNo: match[3] };
      } else {
        return { blogId: match[1], logNo: match[2] };
      }
    }
  }
  return null;
}

// 통합 SEO 크롤링 API (서브앱 naver-seo의 호출을 포털 서버가 직접 처리)
app.post('/api/analyze', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL을 입력해주세요.' });
  }

  const info = extractBlogInfo(url);
  if (!info) {
    return res.status(400).json({ 
      error: '올바른 네이버 블로그 주소가 아닙니다. 예시: https://blog.naver.com/아이디/글번호' 
    });
  }

  const { blogId, logNo } = info;
  const mobileUrl = `https://m.blog.naver.com/PostView.naver?blogId=${blogId}&logNo=${logNo}`;

  try {
    const response = await axios.get(mobileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);

    // 본문 컨테이너 탐색 (스마트에디터 ONE 및 구버전 폴백 포함)
    let mainContainer = $('.se-main-container');
    if (mainContainer.length === 0) {
      mainContainer = $('#postViewArea'); 
    }
    if (mainContainer.length === 0) {
      mainContainer = $('.post_ct'); 
    }
    if (mainContainer.length === 0) {
      mainContainer = $('#dirDetail, .se_viewer, #naverBlogStartContent');
    }

    // 제목 추출
    let title = $('.se-viewer .se-title-text').text().trim();
    if (!title) {
      title = $('.se_title .se_textarea').text().trim(); 
    }
    if (!title) {
      title = $('title').text().replace(' : 네이버 블로그', '').trim();
    }

    // 본문 내용 파싱 (구조 유지하며 텍스트화)
    let bodyMarkdown = [];
    let imageCount = 0;
    let linkCount = 0;
    let tableListCount = 0;
    const images = [];

    const components = mainContainer.find('.se-component, .se-component-content, .se_component');
    
    if (components.length > 0) {
      components.each((i, el) => {
        const comp = $(el);

        // 1. 텍스트 컴포넌트
        if (comp.hasClass('se-component-text') || comp.find('.se-text-paragraph').length > 0) {
          comp.find('.se-text-paragraph, p').each((j, pEl) => {
            const p = $(pEl);
            let text = p.text().trim();
            if (!text) return;

            const classAttr = p.attr('class') || '';
            const fsMatch = classAttr.match(/se-fs-fs(\d+)/) || classAttr.match(/se-fs(\d+)/) || classAttr.match(/se_fs_fs(\d+)/);
            
            if (fsMatch) {
              const size = parseInt(fsMatch[1], 10);
              if (size >= 19) {
                bodyMarkdown.push(`## ${text}`);
              } else if (size >= 16) {
                bodyMarkdown.push(`### ${text}`);
              } else {
                bodyMarkdown.push(text);
              }
            } else {
              bodyMarkdown.push(text);
            }
          });
        }
        // 2. 인용구 컴포넌트 (소제목 대용으로 많이 쓰임)
        else if (comp.hasClass('se-component-quote') || comp.find('.se-quote').length > 0) {
          const quoteText = comp.find('.se-quote').text().trim();
          if (quoteText) {
            bodyMarkdown.push(`## ${quoteText}`);
          }
        }
        // 3. 이미지 컴포넌트
        else if (comp.hasClass('se-component-image') || comp.find('img').length > 0) {
          const imgTag = comp.find('img');
          if (imgTag.length > 0) {
            imageCount++;
            const imgSrc = imgTag.attr('src') || imgTag.attr('data-lazy-src') || '';
            const caption = comp.find('.se-caption').text().trim();
            
            images.push({ src: imgSrc, caption });
            bodyMarkdown.push(`\n[이미지: ${caption || '본문 이미지'}]\n`);
          }
        }
        // 4. 링크 컴포넌트
        else if (comp.hasClass('se-component-link') || comp.find('a.se-link').length > 0) {
          linkCount++;
          const linkTag = comp.find('a');
          const href = linkTag.attr('href') || '';
          const linkTitle = comp.find('.se-link-title').text().trim() || '외부 링크';
          
          bodyMarkdown.push(`\n[링크: ${linkTitle}](${href})\n`);
        }
        // 5. 표 컴포넌트
        else if (comp.hasClass('se-component-table') || comp.find('table').length > 0) {
          tableListCount++;
          bodyMarkdown.push('\n[표 데이터]\n');
          comp.find('tr').each((trIdx, trEl) => {
            const cells = [];
            $(trEl).find('td, th').each((tdIdx, tdEl) => {
              cells.push($(tdEl).text().trim());
            });
            bodyMarkdown.push(`| ${cells.join(' | ')} |`);
          });
          bodyMarkdown.push('');
        }
        // 6. 리스트 컴포넌트
        else if (comp.hasClass('se-component-list') || comp.find('ul, ol').length > 0) {
          tableListCount++;
          comp.find('li').each((liIdx, liEl) => {
            bodyMarkdown.push(`* ${$(liEl).text().trim()}`);
          });
        }
      });
    } else {
      // 컴포넌트 구조가 아닌 경우 (완전 구버전)
      mainContainer.find('p, div, br').each((i, el) => {
        const text = $(el).clone().children().remove().end().text().trim(); 
        if (text) {
          bodyMarkdown.push(text);
        }
      });

      mainContainer.find('img').each((i, imgEl) => {
        const src = $(imgEl).attr('src') || '';
        const width = parseInt($(imgEl).attr('width') || '100', 10);
        if (src && !src.includes('postfiles') && width > 50) {
          imageCount++;
          images.push({ src, caption: '본문 이미지' });
          bodyMarkdown.push(`\n[이미지: 본문 이미지]\n`);
        }
      });

      mainContainer.find('a').each((i, aEl) => {
        const href = $(aEl).attr('href') || '';
        const text = $(aEl).text().trim();
        if (href && href.startsWith('http') && !href.includes('blog.naver.com')) {
          linkCount++;
          bodyMarkdown.push(`\n[링크: ${text || '외부 링크'}](${href})\n`);
        }
      });
    }

    // 해시태그 수집
    const tags = [];
    
    // 1단계: tagName 파라미터 디코딩
    $('a[href*="tagName="], a[href*="SearchPostList.nhn"], a[href*="SearchPostList.naver"]').each((i, el) => {
      const href = $(el).attr('href') || '';
      const match = href.match(/tagName=([^&]+)/);
      if (match) {
        try {
          const decodedTag = decodeURIComponent(match[1]).trim();
          if (decodedTag && !tags.includes(decodedTag)) {
            tags.push(decodedTag);
          }
        } catch (e) {
          const rawTag = match[1].trim();
          if (rawTag && !tags.includes(rawTag)) tags.push(rawTag);
        }
      }
    });

    // 2단계: 모바일 클래스 선택자 보조 매칭
    $('.wrap_tag a, .se-tag, .tag_area a, .tag_list a, .se-tag-text, .se_tag').each((i, el) => {
      const tagText = $(el).text().replace('#', '').trim();
      if (tagText && !tags.includes(tagText)) {
        tags.push(tagText);
      }
    });

    // 3단계: 본문 직접 타이핑 해시코드 추출
    const fullText = bodyMarkdown.filter(val => val !== undefined).join('\n').replace(/\n{3,}/g, '\n\n');
    const bodyTagRegex = /(?<!#)#([a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣_]+)/g;
    let bodyTagMatch;
    const searchArea = fullText.length > 1500 ? fullText.substring(fullText.length - 1500) : fullText;
    while ((bodyTagMatch = bodyTagRegex.exec(searchArea)) !== null) {
      const tagText = bodyTagMatch[1].trim();
      if (tagText && !tags.includes(tagText)) {
        tags.push(tagText);
      }
    }

    res.json({
      title,
      content: fullText,
      images,
      imageCount: imageCount || images.length,
      linkCount,
      tableListCount,
      tags
    });

  } catch (error) {
    console.error('통합서버 크롤링 실패:', error.message);
    res.status(500).json({ 
      error: '블로그 내용을 가져오는 데 실패했습니다. 주소를 확인하시거나 잠시 후 다시 시도해 주세요.' 
    });
  }
});
// 국회의원 데이터 로드 및 캐시
let assemblyMembersCache = null;

function getAssemblyMembers() {
  if (assemblyMembersCache) return assemblyMembersCache;
  const filePath = path.join(__dirname, 'data', 'assembly-members.json');
  if (fs.existsSync(filePath)) {
    try {
      const rawData = fs.readFileSync(filePath, 'utf8');
      assemblyMembersCache = JSON.parse(rawData);
      return assemblyMembersCache;
    } catch (e) {
      console.error('Error parsing assembly-members.json:', e.message);
      return [];
    }
  }
  return [];
}

app.get('/api/assembly-members', (req, res) => {
  const { code, name, party, committee, term, page = 1, pageSize = 50 } = req.query;
  const members = getAssemblyMembers();

  // 1. Filter by selected term to calculate party stats
  const activeTerm = term || '제22대';
  const termMembers = members.filter(m => {
    const eraco = m.GTELT_ERACO || '';
    return eraco.includes(activeTerm);
  });

  // Calculate party stats for the active term
  const partyStats = {};
  termMembers.forEach(m => {
    let pName = m.PLPT_NM || '무소속';
    if (pName.includes('/')) {
      const parts = pName.split('/');
      pName = parts[parts.length - 1].trim();
    }
    partyStats[pName] = (partyStats[pName] || 0) + 1;
  });

  // Sort party stats descending by count
  const sortedPartyStats = Object.entries(partyStats)
    .sort((a, b) => b[1] - a[1])
    .reduce((acc, [key, val]) => {
      acc[key] = val;
      return acc;
    }, {});

  // 2. Apply all filters
  let filtered = termMembers; // Start with the term filter

  if (code) {
    const codeClean = code.trim().toLowerCase();
    filtered = filtered.filter(m => (m.NAAS_CD || '').toLowerCase().includes(codeClean));
  }

  if (name) {
    const nameClean = name.trim().toLowerCase();
    filtered = filtered.filter(m => 
      (m.NAAS_NM || '').toLowerCase().includes(nameClean) || 
      (m.NAAS_CH_NM || '').toLowerCase().includes(nameClean)
    );
  }

  if (party) {
    const partyClean = party.trim().toLowerCase();
    filtered = filtered.filter(m => (m.PLPT_NM || '').toLowerCase().includes(partyClean));
  }

  if (committee) {
    const commClean = committee.trim().toLowerCase();
    filtered = filtered.filter(m => 
      (m.BLNG_CMIT_NM || '').toLowerCase().includes(commClean) || 
      (m.CMIT_NM || '').toLowerCase().includes(commClean)
    );
  }

  // 3. Paginate
  const totalCount = filtered.length;
  const pIndex = parseInt(page, 10) || 1;
  const pSize = parseInt(pageSize, 10) || 50;
  const startIndex = (pIndex - 1) * pSize;
  const paginated = filtered.slice(startIndex, startIndex + pSize);

  res.json({
    success: true,
    total: totalCount,
    page: pIndex,
    pageSize: pSize,
    partyStats: sortedPartyStats,
    row: paginated,
    source: "Turso 캐시" // Match mockup client display text
  });
});

// --- 실시간 주식 가격 및 지수 조회 API (Naver & Yahoo Finance 연동) ---
let stockRealtimeCache = null;
let lastStockCacheTime = 0;

app.get('/api/stock/realtime', async (req, res) => {
  const bypassCache = req.query.refresh === 'true';
  const cacheDuration = 30000; // 30 seconds cache to prevent overloading API
  if (!bypassCache && stockRealtimeCache && (Date.now() - lastStockCacheTime) < cacheDuration) {
    return res.json(stockRealtimeCache);
  }

  try {
    const data = await stockCollector.fetchCurrentData();
    stockRealtimeCache = data;
    lastStockCacheTime = Date.now();
    res.json(stockRealtimeCache);
  } catch (error) {
    console.error('Real-time stock API failed:', error.message);
    if (stockRealtimeCache) {
      return res.json(stockRealtimeCache);
    }
    res.status(500).json({ error: 'Failed to fetch stock prices' });
  }
});

// --- 주식 역사적 데이터 이력 조회 API ---
app.get('/api/stock/history', (req, res) => {
  try {
    const history = stockCollector.readPriceHistory();
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve stock history' });
  }
});

// --- 개별 종목 기간별(하루, 한달, 일년, 10년) 주가 이력 조회 API ---
app.get('/api/stock/history/:code', async (req, res) => {
  const { code } = req.params;
  const { market, price } = req.query;
  const currentPrice = price ? parseFloat(price) : null;
  
  if (!code) {
    return res.status(400).json({ error: 'Stock code is required' });
  }
  
  try {
    const history = await historyLoader.getStockHistory(code, market, currentPrice);
    res.json(history);
  } catch (err) {
    console.error(`[API] Failed to get stock history for ${code}:`, err.message);
    res.status(500).json({ error: 'Failed to retrieve stock history' });
  }
});

// --- 정기 주사 콜렉터 스케줄러 등록 ---
function scheduleNextStockCollection() {
  const now = new Date();
  const nextRun = new Date(now);

  const times = [9, 21];
  let scheduled = false;

  for (const hour of times) {
    nextRun.setHours(hour, 0, 0, 0);
    if (nextRun > now) {
      scheduled = true;
      break;
    }
  }

  if (!scheduled) {
    nextRun.setDate(now.getDate() + 1);
    nextRun.setHours(9, 0, 0, 0);
  }

  const delay = nextRun.getTime() - now.getTime();
  console.log(`[SCHEDULE] 다음 정기 주식 데이터 수집 예정 시각: ${nextRun.toLocaleString('ko-KR')} (남은 시간: ${Math.round(delay / 1000 / 60)}분)`);

  setTimeout(async () => {
    console.log(`[SCHEDULE] 정기 주식 데이터 수집 실행 시각: ${new Date().toLocaleString('ko-KR')}...`);
    try {
      await stockCollector.collectCurrentPrices();
    } catch (err) {
      console.error('[SCHEDULE] 정기 주식 데이터 수집 실패:', err.message);
    }
    scheduleNextStockCollection();
  }, delay);
}

async function initStockHistory() {
  const history = stockCollector.readPriceHistory();
  if (history.length === 0) {
    console.log('[COLLECTOR] 초기 주가 이력 데이터베이스 구축 중...');
    try {
      await stockCollector.collectCurrentPrices();
    } catch (err) {
      console.error('[COLLECTOR] 초기 주가 데이터베이스 생성 실패:', err.message);
    }
  }
  scheduleNextStockCollection();
}

initStockHistory();

// --- RSS Feed Proxy API ---
app.get('/api/rss-proxy', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      },
      responseType: 'text'
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    const contentType = response.headers['content-type'] || 'text/xml';
    res.set('Content-Type', contentType);
    res.send(response.data);
  } catch (error) {
    console.error(`[RSS Proxy] Failed to fetch feed ${url}:`, error.message);
    res.status(500).json({ error: `Failed to fetch RSS feed: ${error.message}` });
  }
});

// --- 맛집 탐색기 API 프록시 ---

// API 키 상태 확인 (프론트엔드에서 어떤 API가 서버에 등록되어 있는지 확인)
app.get('/api/restaurant/status', (req, res) => {
  res.json({
    naver: !!(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET),
    kakao: !!process.env.KAKAO_REST_API_KEY,
    google: !!process.env.GOOGLE_PLACES_API_KEY
  });
});

// 네이버 지역 검색 프록시
app.get('/api/restaurant/naver', async (req, res) => {
  const clientId = req.query.clientId || process.env.NAVER_CLIENT_ID;
  const clientSecret = req.query.clientSecret || process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(400).json({ error: '네이버 API 키가 설정되지 않았습니다. .env 파일 또는 설정 패널에서 키를 입력하세요.' });
  }

  const { query, display = 20, start = 1, sort = 'random' } = req.query;
  if (!query) {
    return res.status(400).json({ error: '검색어(query)를 입력하세요.' });
  }

  try {
    const response = await axios.get('https://openapi.naver.com/v1/search/local.json', {
      params: { query, display: Math.min(parseInt(display), 5), start: parseInt(start), sort },
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret
      },
      timeout: 8000
    });
    res.json(response.data);
  } catch (error) {
    console.error('[Restaurant/Naver] API 호출 실패:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({ error: `네이버 API 호출 실패: ${error.response?.data?.errorMessage || error.message}` });
  }
});

// 카카오 로컬 키워드 검색 프록시
app.get('/api/restaurant/kakao', async (req, res) => {
  const apiKey = req.query.apiKey || process.env.KAKAO_REST_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: '카카오 REST API 키가 설정되지 않았습니다.' });
  }

  const { query, x, y, radius = 2000, page = 1, size = 15, sort: kakaoSort = 'accuracy' } = req.query;
  if (!query) {
    return res.status(400).json({ error: '검색어(query)를 입력하세요.' });
  }

  try {
    const params = {
      query,
      page: parseInt(page),
      size: Math.min(parseInt(size), 15),
      sort: kakaoSort,
      category_group_code: 'FD6' // 음식점 카테고리
    };
    if (x) params.x = x;
    if (y) params.y = y;
    if (x && y) params.radius = Math.min(parseInt(radius), 20000);

    const response = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
      params,
      headers: { 'Authorization': `KakaoAK ${apiKey}` },
      timeout: 8000
    });
    res.json(response.data);
  } catch (error) {
    console.error('[Restaurant/Kakao] API 호출 실패:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({ error: `카카오 API 호출 실패: ${error.response?.data?.message || error.message}` });
  }
});

// Google Places (New) 텍스트 검색 프록시
app.get('/api/restaurant/google', async (req, res) => {
  const apiKey = req.query.apiKey || process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: 'Google Places API 키가 설정되지 않았습니다.' });
  }

  const { query, lat, lng, radius = 2000 } = req.query;
  if (!query) {
    return res.status(400).json({ error: '검색어(query)를 입력하세요.' });
  }

  try {
    const body = {
      textQuery: query,
      languageCode: 'ko',
      maxResultCount: 20
    };

    // 위치 기반 검색 바이어스
    if (lat && lng) {
      body.locationBias = {
        circle: {
          center: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
          radius: parseFloat(radius)
        }
      };
    }

    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.primaryType,places.primaryTypeDisplayName,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.businessStatus,places.currentOpeningHours,places.photos'
        },
        timeout: 10000
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('[Restaurant/Google] API 호출 실패:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({ error: `Google Places API 호출 실패: ${error.response?.data?.error?.message || error.message}` });
  }
});

// Google Places 사진 프록시
app.get('/api/restaurant/google/photo', async (req, res) => {
  const apiKey = req.query.apiKey || process.env.GOOGLE_PLACES_API_KEY;
  const { name, maxWidth = 400 } = req.query;

  if (!apiKey || !name) {
    return res.status(400).json({ error: 'API 키 또는 사진 이름이 필요합니다.' });
  }

  try {
    const url = `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${maxWidth}&key=${apiKey}`;
    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 8000 });
    const contentType = response.headers['content-type'] || 'image/jpeg';
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ error: '사진 로드 실패' });
  }
});

// 메인페이지 매칭
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Cineaho 통합 포털 서버가 포트 ${PORT}에서 실행 중입니다.`);
});
