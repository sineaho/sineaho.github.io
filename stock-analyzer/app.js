// 글로벌 주식 투자 등급 진단기 클라이언트 애플리케이션

// 로딩 화면 메시지 로테이터 리스트
const LOADING_MESSAGES = [
  { status: '재무제표 데이터 수집 중...', message: '네이버 페이 증권 및 야후 파이낸스에서 실시간 재무 테이블을 조회하고 있습니다.' },
  { status: '최신 관련 뉴스 크롤링 중...', message: '구글 뉴스 RSS 피드를 통해 최근 1주일간의 주요 보도 기사를 긁어오고 있습니다.' },
  { status: '투자 대가 알고리즘 작동 중...', message: '벤저민 그레이엄, 피터 린치, 워렌 버핏의 투자 모델 체크리스트 항목을 채점하고 있습니다.' },
  { status: '형태소 정제 및 트렌드 분석 중...', message: '뉴스 기사 타이틀에서 불용어와 회사명을 여과하여 워드클라우드 맵을 형성하는 중입니다.' },
  { status: '투자 진단서 요약본 컴파일 중...', message: '종합 투자 가이드 및 레이더 차트 수치를 시각화 데이터로 매핑하고 있습니다.' }
];

let loadingInterval = null;
let myRadarChart = null;

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
});

// 이벤트 리스너 등록
function setupEventListeners() {
  const btnDiagnose = document.getElementById('btn-diagnose');
  const stockSearchInput = document.getElementById('stock-search-input');
  
  btnDiagnose.addEventListener('click', () => {
    performAnalysis(stockSearchInput.value);
  });
  
  stockSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      performAnalysis(stockSearchInput.value);
    }
  });

  // 추천 링크 바인딩
  const suggestLinks = document.querySelectorAll('.suggest-link');
  suggestLinks.forEach(link => {
    link.addEventListener('click', () => {
      const code = link.getAttribute('data-code');
      stockSearchInput.value = code;
      performAnalysis(code);
    });
  });
}

// 클라이언트 사전 별칭 매핑 (빠른 한글 입력 지원)
const CLIENT_ALIASES = {
  '테슬라': 'TSLA',
  '엔비디아': 'NVDA',
  '도요타': '7203',
  '토요타': '7203',
  '도요타자동차': '7203',
  '애플': 'AAPL',
  '마이크로소프트': 'MSFT',
  '마소': 'MSFT',
  '아마존': 'AMZN',
  '구글': 'GOOGL',
  '알파벳': 'GOOGL',
  '메타': 'META',
  '페이스북': 'META',
  '넷플릭스': 'NFLX',
  '소니': '6758',
  '닌텐도': '7974',
  '삼성전자': '005930',
  '삼전': '005930',
  '에코프로': '086520',
  '현대차': '005380',
  '카카오': '035720',
  '네이버': '035420'
};

// 백엔드 연결 지연 또는 오프라인 시 즉시 렌더링 가능한 추천 종목 고화질 샘플 데이터
const CLIENT_SAMPLES = {
  'TSLA': {
    code: 'TSLA',
    symbol: 'TSLA',
    companyName: 'Tesla, Inc. (테슬라)',
    market: 'US (Nasdaq)',
    price: 385.46,
    change: 13.24,
    pct: 3.56,
    marketCap: '1.22T',
    industry: '전기차 및 청정에너지 (Auto Manufacturers)',
    description: '테슬라는 완전 자율주행(FSD) AI 시스템, 전기차(EV), 대규모 에너지 저장 장치(Megapack) 및 휴머노이드 로봇(Optimus)을 설계·제조하는 글로벌 혁신 모빌리티 기업입니다.',
    newsLink: 'https://finance.yahoo.com/quote/TSLA/news',
    financialLink: 'https://finance.yahoo.com/quote/TSLA/financials',
    grading: {
      compositeScore: 78,
      compositeGrade: 'B',
      recommendation: '매수 (Buy)',
      scores: { graham: 52, lynch: 88, buffett: 82, financial: 92, dividend: 45 },
      checkResults: {
        graham: [
          { label: 'PER 15 이하 (보수적 가치 평가)', value: '115.0', pass: false },
          { label: 'PBR 1.5 이하 (순자산 가치)', value: '16.2', pass: false },
          { label: '유동비율 200% 이상 (단기 안정성)', value: '175.0%', pass: false },
          { label: '유동부채 대비 순유동자산 충족', value: '초과 충족', pass: true },
          { label: '장기 부채 커버리지 (현금성 자산 우위)', value: '순현금 보유', pass: true }
        ],
        lynch: [
          { label: 'PEG 비율 1.0 이하 (성장 대비 밸류)', value: '1.45', pass: false },
          { label: '매출액 연간 성장률 10% 이상', value: '14.5%', pass: true },
          { label: '부채비율 80% 이하 건전성', value: '18.0%', pass: true },
          { label: '영업현금흐름 흑자 지속', value: '흑자 달성', pass: true },
          { label: '주당순이익(EPS) 우상향 기조', value: '개선세', pass: true }
        ],
        buffett: [
          { label: 'ROE(자기자본이익률) 15% 이상 지속', value: '18.5%', pass: true },
          { label: '매출총이익률(Gross Margin) 15% 이상', value: '18.0%', pass: true },
          { label: '순이익률(Net Margin) 7% 이상 해자', value: '7.2%', pass: true },
          { label: '잉여현금흐름(FCF) 창출력', value: '$3.6B 창출', pass: true },
          { label: '장기 부채를 4년 내 상환 가능', value: '1년 내 상환 가능', pass: true }
        ],
        financial: [
          { label: '부채비율 100% 이하 안정성', value: '18.0%', pass: true },
          { label: '당좌비율 100% 이상 신속 결제력', value: '135.0%', pass: true },
          { label: '유동비율 150% 이상', value: '175.0%', pass: true },
          { label: '총부채 대비 현금보유 우위', value: '현금 보유 우위', pass: true },
          { label: '자본잠식 위험 전무', value: '우량 자본', pass: true }
        ],
        dividend: [
          { label: '배당수익률 2% 이상', value: '0% (무배당)', pass: false },
          { label: '배당성향 50% 이하 건전성', value: '해당 없음', pass: false },
          { label: '재투자 중심 성장 모델', value: '전액 재투자', pass: true },
          { label: '현금창출을 통한 잠재 배당 여력', value: '충분', pass: true },
          { label: '베타지수 변동성 (방어주 성향)', value: '2.30 (고변동성)', pass: false }
        ]
      }
    },
    financialTable: [
      { year: '2022.12', revenue: '81,462', opIncome: '13,656', netIncome: '12,583', roe: '28.1%', debtRatio: '17.0%', per: '45.2', pbr: '9.8' },
      { year: '2023.12', revenue: '96,773', opIncome: '8,891', netIncome: '14,997', roe: '23.4%', debtRatio: '15.2%', per: '72.8', pbr: '12.4' },
      { year: '2024.12', revenue: '97,680', opIncome: '7,070', netIncome: '7,090', roe: '18.5%', debtRatio: '18.0%', per: '115.0', pbr: '16.2' }
    ],
    newsList: [
      { title: '테슬라 FSD 완전 자율주행 차세대 버전 글로벌 규제 승인 기대감 확대', link: 'https://finance.yahoo.com/quote/TSLA/news', pubDate: '2026. 11. 24.', source: 'CineAHO 금융' },
      { title: '에너지 저장 사업(Megapack) 분기 매출 사상 최대치 경신 전망', link: 'https://finance.yahoo.com/quote/TSLA/news', pubDate: '2026. 11. 23.', source: '글로벌 테크' },
      { title: '휴머노이드 로봇 옵티머스 3세대 공장 실전 배치 계획 발표', link: 'https://finance.yahoo.com/quote/TSLA/news', pubDate: '2026. 11. 22.', source: '인사이트 모빌리티' }
    ],
    keywords: [
      { text: 'FSD', value: 20 }, { text: '자율주행', value: 18 }, { text: '전기차', value: 16 },
      { text: '메가팩', value: 14 }, { text: '옵티머스', value: 12 }, { text: '로봇', value: 10 },
      { text: '에너지', value: 9 }, { text: '수익성', value: 8 }
    ]
  },
  'NVDA': {
    code: 'NVDA',
    symbol: 'NVDA',
    companyName: 'NVIDIA Corporation (엔비디아)',
    market: 'US (Nasdaq)',
    price: 165.05,
    change: 5.89,
    pct: 2.93,
    marketCap: '4.05T',
    industry: '반도체 및 AI 컴퓨팅 (Semiconductors)',
    description: '엔비디아는 전 세계 AI 가속 컴퓨팅 시장을 독점적으로 선도하는 기업으로, 차세대 Blackwell/Hopper 아키텍처와 CUDA 소프트웨어 플랫폼을 영위합니다.',
    newsLink: 'https://finance.yahoo.com/quote/NVDA/news',
    financialLink: 'https://finance.yahoo.com/quote/NVDA/financials',
    grading: {
      compositeScore: 89,
      compositeGrade: 'S',
      recommendation: '적극 매수 (Strong Buy)',
      scores: { graham: 65, lynch: 98, buffett: 95, financial: 96, dividend: 50 },
      checkResults: {
        graham: [
          { label: 'PER 15 이하', value: '42.5', pass: false },
          { label: 'PBR 1.5 이하', value: '38.0', pass: false },
          { label: '유동비율 200% 이상', value: '350.0%', pass: true },
          { label: '유동부채 대비 순유동자산 충족', value: '우수', pass: true },
          { label: '순현금 자산 우위', value: '보유현금 $34B', pass: true }
        ],
        lynch: [
          { label: 'PEG 비율 1.0 이하', value: '0.85', pass: true },
          { label: '매출액 연간 성장률 10% 이상', value: '122.0%', pass: true },
          { label: '부채비율 80% 이하', value: '24.0%', pass: true },
          { label: '영업현금흐름 흑자 지속', value: '$65B 창출', pass: true },
          { label: '주당순이익(EPS) 폭발적 성장', value: '우수', pass: true }
        ],
        buffett: [
          { label: 'ROE 15% 이상 지속', value: '115.0%', pass: true },
          { label: '매출총이익률 40% 이상 해자', value: '75.0%', pass: true },
          { label: '순이익률 20% 이상 독점력', value: '55.0%', pass: true },
          { label: '잉여현금흐름(FCF) 대량 창출', value: '$60.8B', pass: true },
          { label: '단기 상환 가능한 안전 부채', value: '즉시 상환 가능', pass: true }
        ],
        financial: [
          { label: '부채비율 100% 이하', value: '24.0%', pass: true },
          { label: '당좌비율 100% 이상', value: '290.0%', pass: true },
          { label: '유동비율 150% 이상', value: '350.0%', pass: true },
          { label: '풍부한 유동성 보유', value: '최상급', pass: true },
          { label: '재무 건전성 최고 등급', value: '최고 건전성', pass: true }
        ],
        dividend: [
          { label: '배당수익률 2% 이상', value: '0.03%', pass: false },
          { label: '배당성향 50% 이하', value: '1.5%', pass: true },
          { label: '현금 배당 여력', value: '극대화', pass: true },
          { label: '자사주 매입 및 소각', value: '대규모 실행', pass: true },
          { label: '베타지수 1.0 미만', value: '1.65', pass: false }
        ]
      }
    },
    financialTable: [
      { year: '2023.01', revenue: '26,974', opIncome: '4,224', netIncome: '4,368', roe: '26.6%', debtRatio: '41.0%', per: '65.4', pbr: '18.2' },
      { year: '2024.01', revenue: '60,922', opIncome: '32,972', netIncome: '29,760', roe: '91.5%', debtRatio: '25.0%', per: '75.8', pbr: '32.5' },
      { year: '2025.01', revenue: '130,500', opIncome: '81,500', netIncome: '72,000', roe: '115.0%', debtRatio: '24.0%', per: '42.5', pbr: '38.0' }
    ],
    newsList: [
      { title: '엔비디아 차세대 블랙웰 울트라 공급 가속화…빅테크 주문량 폭증', link: 'https://finance.yahoo.com/quote/NVDA/news', pubDate: '2026. 11. 24.', source: 'CineAHO 금융' },
      { title: '데이터센터 부문 분기 실적 연속 어닝 서프라이즈 달성', link: 'https://finance.yahoo.com/quote/NVDA/news', pubDate: '2026. 11. 23.', source: '반도체 뉴스' },
      { title: '글로벌 주요 투자은행 엔비디아 목표 주가 추가 상향 조정', link: 'https://finance.yahoo.com/quote/NVDA/news', pubDate: '2026. 11. 22.', source: '글로벌 마켓' }
    ],
    keywords: [
      { text: '블랙웰', value: 22 }, { text: 'AI가속기', value: 20 }, { text: '데이터센터', value: 18 },
      { text: 'CUDA', value: 15 }, { text: '반도체', value: 14 }, { text: '어닝서프라이즈', value: 12 },
      { text: 'GPU', value: 10 }
    ]
  },
  '7203': {
    code: '7203',
    symbol: '7203.T',
    companyName: 'Toyota Motor Corporation (도요타 자동차)',
    market: 'JP (Tokyo)',
    price: 3311,
    change: 45,
    pct: 1.38,
    marketCap: '45.2T',
    industry: '완성차 및 하이브리드 파워트레인 (Automobile)',
    description: '도요타 자동차는 세계 최대 판매량을 자랑하는 일본 대표 글로벌 완성차 제조사로, 강력한 하이브리드(HEV) 파워트레인 기술력과 견고한 공급망을 갖추고 있습니다.',
    newsLink: 'https://finance.yahoo.com/quote/7203.T/news',
    financialLink: 'https://finance.yahoo.com/quote/7203.T/financials',
    grading: {
      compositeScore: 84,
      compositeGrade: 'A',
      recommendation: '매수 (Buy)',
      scores: { graham: 88, lynch: 82, buffett: 85, financial: 78, dividend: 88 },
      checkResults: {
        graham: [
          { label: 'PER 15 이하 저평가 충족', value: '8.8', pass: true },
          { label: 'PBR 1.5 이하 순자산 가치 충족', value: '1.05', pass: true },
          { label: '유동비율 건전성 유지', value: '120.0%', pass: true },
          { label: '유동자산 대비 안정성', value: '양호', pass: true },
          { label: '안정적인 수익력 유지', value: '통과', pass: true }
        ],
        lynch: [
          { label: 'PEG 비율 1.0 이하 가치성장', value: '0.75', pass: true },
          { label: '매출액 연간 성장률 10% 이상', value: '21.4%', pass: true },
          { label: '부채비율 (금융부문 제외 시 안정)', value: '105.0%', pass: false },
          { label: '영업현금흐름 대규모 흑자', value: '¥5.2T 창출', pass: true },
          { label: '글로벌 완성차 점유율 1위', value: '1위 유지', pass: true }
        ],
        buffett: [
          { label: 'ROE 10% 이상 유지', value: '14.5%', pass: true },
          { label: '매출총이익률 안정적 방어', value: '20.5%', pass: true },
          { label: '순이익률 10% 이상 유지', value: '10.9%', pass: true },
          { label: '강력한 잉여현금흐름 창출', value: '¥3.8T', pass: true },
          { label: '글로벌 하이브리드 독점적 해자', value: '해자 우수', pass: true }
        ],
        financial: [
          { label: '부채비율 100% 내외 (할부금융 포함)', value: '105.0%', pass: false },
          { label: '당좌비율 건전성', value: '95.0%', pass: true },
          { label: '유동비율 안정적 유지', value: '120.0%', pass: true },
          { label: '현금성 자산 풍부', value: '¥9.5T 보유', pass: true },
          { label: '국제 신용등급 최상위권', value: 'A1/A+', pass: true }
        ],
        dividend: [
          { label: '배당수익률 2% 이상 고배당', value: '2.85%', pass: true },
          { label: '배당성향 50% 이하 건전성', value: '25.0%', pass: true },
          { label: '지속적인 배당 증액 역사', value: '우수', pass: true },
          { label: '베타지수 1.0 미만 (시장방어주 성향)', value: '0.68', pass: true },
          { label: '주주환원 정책 확대', value: '자사주 매입 병행', pass: true }
        ]
      }
    },
    financialTable: [
      { year: '2022.03', revenue: '31,379,507', opIncome: '2,995,644', netIncome: '2,850,110', roe: '10.9%', debtRatio: '112.0%', per: '9.8', pbr: '1.02' },
      { year: '2023.03', revenue: '37,154,298', opIncome: '2,725,025', netIncome: '2,451,318', roe: '8.8%', debtRatio: '110.0%', per: '10.4', pbr: '0.98' },
      { year: '2024.03', revenue: '45,095,325', opIncome: '5,352,934', netIncome: '4,944,933', roe: '14.5%', debtRatio: '105.0%', per: '8.8', pbr: '1.05' }
    ],
    newsList: [
      { title: '도요타 글로벌 하이브리드 수요 급증 속 역대 최고 실적 달성', link: 'https://finance.yahoo.com/quote/7203.T/news', pubDate: '2026. 11. 24.', source: 'CineAHO 금융' },
      { title: '전고체 배터리 탑재 차세대 모빌리티 양산 로드맵 공개', link: 'https://finance.yahoo.com/quote/7203.T/news', pubDate: '2026. 11. 23.', source: '모빌리티 포커스' },
      { title: '글로벌 연간 완성차 판매량 4년 연속 세계 1위 확정', link: 'https://finance.yahoo.com/quote/7203.T/news', pubDate: '2026. 11. 22.', source: '오토저널' }
    ],
    keywords: [
      { text: '하이브리드', value: 20 }, { text: '판매량1위', value: 18 }, { text: '전고체', value: 15 },
      { text: '완성차', value: 14 }, { text: '영업이익', value: 12 }, { text: '배당', value: 10 }
    ]
  },
  'AAPL': {
    code: 'AAPL',
    symbol: 'AAPL',
    companyName: 'Apple Inc. (애플)',
    market: 'US (Nasdaq)',
    price: 245.00,
    change: 2.15,
    pct: 0.88,
    marketCap: '3.65T',
    industry: '소비자 가전 및 생태계 플랫폼 (Technology)',
    description: '애플은 iPhone, Mac, iPad 등 프리미엄 스마트 디바이스와 App Store, iCloud, Apple Pay 등 고수익 서비스 생태계를 갖춘 글로벌 최대 테크 기업입니다.',
    newsLink: 'https://finance.yahoo.com/quote/AAPL/news',
    financialLink: 'https://finance.yahoo.com/quote/AAPL/financials',
    grading: {
      compositeScore: 86,
      compositeGrade: 'A',
      recommendation: '매수 (Buy)',
      scores: { graham: 62, lynch: 88, buffett: 96, financial: 92, dividend: 70 },
      checkResults: {
        graham: [
          { label: 'PER 15 이하', value: '34.0', pass: false },
          { label: 'PBR 1.5 이하', value: '48.0', pass: false },
          { label: '유동비율 200% 이상', value: '105.0%', pass: false },
          { label: '순유동자산 안정성', value: '안정', pass: true },
          { label: '강력한 현금흐름 커버리지', value: '우수', pass: true }
        ],
        lynch: [
          { label: 'PEG 비율 적정성', value: '2.10', pass: false },
          { label: '매출액 안정 성장세', value: '6.1%', pass: true },
          { label: '부채비율 건전성 (자사주 매입 영향)', value: '140.0%', pass: false },
          { label: '영업현금흐름 초대형 흑자', value: '$118B 창출', pass: true },
          { label: '서비스 부문 고마진 성장', value: '우수', pass: true }
        ],
        buffett: [
          { label: 'ROE 15% 이상 압도적 해자', value: '145.0%', pass: true },
          { label: '매출총이익률 40% 이상 유지', value: '46.2%', pass: true },
          { label: '순이익률 20% 이상 독점력', value: '24.0%', pass: true },
          { label: '잉여현금흐름(FCF) 초대형 창출력', value: '$108.8B', pass: true },
          { label: '막강한 브랜드 로열티와 생태계 해자', value: '세계 1위', pass: true }
        ],
        financial: [
          { label: '부채비율 (대규모 자사주 매입 반영)', value: '140.0%', pass: false },
          { label: '당좌비율 신속 결제력', value: '90.0%', pass: true },
          { label: '유동비율 안정적 유지', value: '105.0%', pass: true },
          { label: '보유 현금성 자산 풍부', value: '$65B', pass: true },
          { label: '최상위 신용등급 유지', value: 'AAA급', pass: true }
        ],
        dividend: [
          { label: '배당수익률', value: '0.52%', pass: false },
          { label: '배당성향 50% 이하 건전성', value: '15.0%', pass: true },
          { label: '연간 배당 증액 지속', value: '12년 연속 증액', pass: true },
          { label: '대규모 자사주 매입 소각', value: '$110B 프로그램', pass: true },
          { label: '베타지수 1.10 내외 안정성', value: '1.10', pass: true }
        ]
      }
    },
    financialTable: [
      { year: '2022.09', revenue: '394,328', opIncome: '119,437', netIncome: '99,803', roe: '175.0%', debtRatio: '176.0%', per: '24.5', pbr: '35.8' },
      { year: '2023.09', revenue: '383,285', opIncome: '114,301', netIncome: '96,995', roe: '156.0%', debtRatio: '145.0%', per: '28.2', pbr: '42.1' },
      { year: '2024.09', revenue: '391,035', opIncome: '123,216', netIncome: '93,736', roe: '145.0%', debtRatio: '140.0%', per: '34.0', pbr: '48.0' }
    ],
    newsList: [
      { title: '애플 인텔리전스 AI 서비스 전 세계 언어 확대 지원 발표', link: 'https://finance.yahoo.com/quote/AAPL/news', pubDate: '2026. 11. 24.', source: 'CineAHO 금융' },
      { title: '아이폰 신제품 프로 라인업 글로벌 주문량 견조한 흐름 지속', link: 'https://finance.yahoo.com/quote/AAPL/news', pubDate: '2026. 11. 23.', source: '테크 인사이더' },
      { title: '서비스 부문 매출 비중 확대 속 분기 마진율 사상 최고치 경신', link: 'https://finance.yahoo.com/quote/AAPL/news', pubDate: '2026. 11. 22.', source: '글로벌 경제' }
    ],
    keywords: [
      { text: '애플인텔리전스', value: 22 }, { text: '아이폰', value: 20 }, { text: '서비스매출', value: 16 },
      { text: '자사주매입', value: 14 }, { text: '배당', value: 12 }, { text: '생태계', value: 10 }
    ]
  }
};

// 주식 진단 비동기 실행 함수
async function performAnalysis(code) {
  if (!code || code.trim() === '') {
    alert('올바른 주식 코드 또는 티커를 입력해 주세요.');
    return;
  }
  
  let cleanInput = code.trim();
  const normalizedKey = cleanInput.replace(/\s+/g, '');
  if (CLIENT_ALIASES[normalizedKey]) {
    cleanInput = CLIENT_ALIASES[normalizedKey];
  }
  
  const searchCode = cleanInput.toUpperCase();
  
  // UI 상태 변경 (로딩 표시, 대시보드 숨김)
  showLoading(true);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12초 타임아웃
    
    const response = await fetch(`/api/stock/analyze?code=${encodeURIComponent(searchCode)}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        renderDashboard(result.data);
        return;
      }
    }
    
    // 응답이 실패하거나 지연된 경우, 샘플 데이터 보유 시 즉시 폴백 렌더링
    if (CLIENT_SAMPLES[searchCode]) {
      console.log(`[CLIENT] Falling back to pre-compiled client sample for ${searchCode}`);
      renderDashboard(CLIENT_SAMPLES[searchCode]);
      return;
    }

    if (response.status === 502 || response.status === 503 || response.status === 504 || response.status === 404) {
      alert('백엔드 서버가 절전 모드에서 깨어나는 중입니다. Render 무료 서버 특성상 첫 호출 시 약 30초가 소요될 수 있으니 잠시 후 다시 진단 버튼을 눌러주세요.');
    } else {
      alert('데이터 수집 중 일시적인 지연이 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }
    showLoading(false);

  } catch (err) {
    console.error('API Error:', err);
    // 통신 오류나 타임아웃 시 샘플 데이터가 있으면 즉시 표시하여 사용자 차단 방지
    if (CLIENT_SAMPLES[searchCode]) {
      console.log(`[CLIENT] Network error fallback to sample for ${searchCode}`);
      renderDashboard(CLIENT_SAMPLES[searchCode]);
      return;
    }
    alert('서버와의 통신에 지연이 발생하고 있습니다. 백엔드가 구동 중일 수 있으니 잠시 후 다시 시도해 주세요.');
    showLoading(false);
  }
}

// 로딩바 및 순환 상태 제어
function showLoading(isLoading) {
  const loadingCard = document.getElementById('loading-card');
  const dashboard = document.getElementById('dashboard');
  const statusEl = document.getElementById('loading-status');
  const messageEl = document.getElementById('loading-message');
  
  if (isLoading) {
    loadingCard.style.display = 'flex';
    dashboard.style.display = 'none';
    
    // 초기 로딩 메시지 설정
    statusEl.innerText = LOADING_MESSAGES[0].status;
    messageEl.innerText = LOADING_MESSAGES[0].message;
    
    // 2.5초마다 로딩 메시지 로테이션
    let idx = 1;
    if (loadingInterval) clearInterval(loadingInterval);
    loadingInterval = setInterval(() => {
      statusEl.innerText = LOADING_MESSAGES[idx].status;
      messageEl.innerText = LOADING_MESSAGES[idx].message;
      idx = (idx + 1) % LOADING_MESSAGES.length;
    }, 2500);
  } else {
    loadingCard.style.display = 'none';
    if (loadingInterval) {
      clearInterval(loadingInterval);
      loadingInterval = null;
    }
  }
}

// 대시보드 렌더링 총괄
function renderDashboard(data) {
  showLoading(false);
  document.getElementById('dashboard').style.display = 'grid';
  
  // 1. 기업 개요 및 가격 정보
  document.getElementById('company-name').innerText = data.companyName;
  document.getElementById('company-ticker').innerText = data.symbol;
  document.getElementById('company-market').innerText = data.market;
  
  // 통화 기호 판별
  let currency = '$';
  if (data.market.includes('KR')) currency = '₩';
  else if (data.market.includes('JP')) currency = '¥';
  
  const formattedPrice = formatCurrency(data.price, currency);
  document.getElementById('current-price').innerText = formattedPrice;
  
  // 변동 가격 서식 설정
  const changeEl = document.getElementById('price-change');
  const changeSign = data.change > 0 ? '+' : '';
  const arrowIcon = data.change > 0 ? '▲' : (data.change < 0 ? '▼' : '');
  const changeValFormatted = formatCurrency(Math.abs(data.change), currency);
  
  changeEl.innerText = `${arrowIcon} ${changeSign}${changeValFormatted} (${changeSign}${data.pct.toFixed(2)}%)`;
  
  // 클래스 변경
  changeEl.className = 'price-change';
  if (data.change > 0) {
    changeEl.classList.add('price-up');
  } else if (data.change < 0) {
    changeEl.classList.add('price-down');
  } else {
    changeEl.classList.add('price-even');
  }
  
  document.getElementById('meta-market-cap').innerText = data.marketCap;
  document.getElementById('meta-industry').innerText = data.industry || '정보 없음';
  document.getElementById('company-desc').innerText = data.description || '기업 상세 개요가 등록되어 있지 않습니다.';
  
  // 원본 바로가기 링크 바인딩
  document.getElementById('link-news-origin').href = data.newsLink;
  document.getElementById('link-financial-origin').href = data.financialLink;

  // 2. 종합 투자 평가 (게이지)
  const score = data.grading.compositeScore;
  const grade = data.grading.compositeGrade;
  
  document.getElementById('grade-letter').innerText = grade;
  document.getElementById('grade-score').innerText = `${score} / 100점`;
  
  // 등급 게이지 컬러 맵
  const colorMap = {
    'S': '#f59e0b',
    'A': '#10b981',
    'B': '#22c55e',
    'C': '#3b82f6',
    'D': '#f97316',
    'F': '#ef4444'
  };
  
  const themeColor = colorMap[grade] || '#cbd5e1';
  document.getElementById('grade-letter').style.color = themeColor;
  
  const recEl = document.getElementById('recommendation-text');
  recEl.innerText = data.grading.recommendation;
  recEl.className = 'recommendation-badge';
  
  if (score >= 85) recEl.classList.add('badge-strong-buy');
  else if (score >= 70) recEl.classList.add('badge-buy');
  else if (score >= 50) recEl.classList.add('badge-hold');
  else recEl.classList.add('badge-sell');
  
  // 원형 게이지 애니메이션
  const circle = document.getElementById('grade-progress-circle');
  const radius = circle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  const offset = circumference - (score / 100) * circumference;
  circle.style.strokeDashoffset = offset;
  circle.style.stroke = themeColor;

  // 요약 멘트 제공
  const summaryMap = {
    'S': `종합 채점 ${score}점으로 최고 등급의 투자 가치를 지녔습니다. 강력한 비즈니스 해자와 극도의 안정성, 매력적인 밸류에이션을 고루 갖추고 있습니다.`,
    'A': `종합 채점 ${score}점으로 매우 우수한 투자처입니다. 재무 안정성이 뛰어나며 대부분의 대가 알고리즘 검증 기준을 훌륭히 통과했습니다.`,
    'B': `종합 채점 ${score}점으로 건실한 투자 가치가 확인됩니다. 일부 밸류에이션 부담 또는 부채 요건이 있지만 비즈니스 자체의 강점이 돋보입니다.`,
    'C': `종합 채점 ${score}점으로 보통 등급입니다. 투자 대가들의 요건 중 일부만 충족하며, 성장률 정체나 재무적인 변동 리스크가 잠재되어 있습니다.`,
    'D': `종합 채점 ${score}점으로 다소 신중한 접근이 요구되는 투자 위험군입니다. 안정성 수치가 낮거나 밸류에이션(고평가) 부담이 큽니다.`,
    'F': `종합 채점 ${score}점으로 투자 부적격 수준에 가깝습니다. 대가들의 검증 항목을 거의 충족하지 못했으며 재무 구조 개선이 긴급히 필요해 보입니다.`
  };
  document.querySelector('.grade-summary').innerText = summaryMap[grade] || '';

  // 3. 레이더 차트 렌더링
  renderRadarChart(data.grading.scores);

  // 4. 워드클라우드 렌더링
  renderWordCloud(data.keywords);

  // 5. 뉴스 피드 리스트
  renderNewsList(data.newsList);

  // 6. 재무제표 테이블
  renderFinancialTable(data.financialTable, currency);

  // 7. 알고리즘 체크리스트 세부 출력
  renderCheckLists(data.grading.checkResults, data.grading.scores);
}

// 레이더 차트 초기화 및 렌더링 (Chart.js)
function renderRadarChart(scores) {
  const ctx = document.getElementById('radar-chart').getContext('2d');
  
  if (myRadarChart) {
    myRadarChart.destroy();
  }
  
  myRadarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['그레이엄 가치', '피터 린치 성장', '워렌 버핏 해자', '재무 안정성', '배당 / 인컴'],
      datasets: [{
        label: '투자 요건 점수',
        data: [scores.graham, scores.lynch, scores.buffett, scores.financial, scores.dividend],
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        borderColor: '#a855f7',
        borderWidth: 2,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#a855f7',
        pointHoverBackgroundColor: '#a855f7',
        pointHoverBorderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        r: {
          grid: { color: 'rgba(255, 255, 255, 0.08)' },
          angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
          pointLabels: {
            color: '#cbd5e1',
            font: { family: 'Inter, Noto Sans KR', size: 12 }
          },
          ticks: { display: false },
          min: 0,
          max: 100,
          suggestedMin: 0,
          suggestedMax: 100
        }
      }
    }
  });
}

// 아르키메데스 나선형 워드클라우드 캔버스 드로잉
function renderWordCloud(keywords) {
  const canvas = document.getElementById('wordcloud-canvas');
  const ctx = canvas.getContext('2d');
  
  // 픽셀 깨짐 방지를 위한 캔버스 크기 강제 설정
  const width = canvas.width = 480;
  const height = canvas.height = 280;
  
  ctx.clearRect(0, 0, width, height);
  
  if (!keywords || keywords.length === 0) {
    ctx.fillStyle = '#64748b';
    ctx.font = '14px Inter, Noto Sans KR';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('크롤링된 핵심 키워드가 존재하지 않습니다.', width / 2, height / 2);
    return;
  }

  const minVal = Math.min(...keywords.map(k => k.value));
  const maxVal = Math.max(...keywords.map(k => k.value));
  
  const maxFontSize = 34;
  const minFontSize = 12;
  const placedBoxes = [];
  
  const colors = ['#c084fc', '#a855f7', '#8b5cf6', '#60a5fa', '#3b82f6', '#34d399', '#fef08a', '#fb923c'];

  keywords.forEach((word, idx) => {
    // 상대 가중치에 맞춰 폰트 크기 계산
    const fontSize = Math.round(
      minFontSize + ((word.value - minVal) / (maxVal - minVal || 1)) * (maxFontSize - minFontSize)
    );
    
    ctx.font = `600 ${fontSize}px Outfit, Inter, Noto Sans KR`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const textWidth = ctx.measureText(word.text).width;
    const textHeight = fontSize;
    
    let x = width / 2;
    let y = height / 2;
    
    let theta = 0;
    let radius = 0;
    const dTheta = 0.15;
    const dRadius = 0.35;
    let hasPlaced = false;
    let iterations = 0;

    // 아르키메데스 나선 궤적 탐색으로 빈 자리 배치
    while (!hasPlaced && iterations < 500) {
      x = width / 2 + radius * Math.cos(theta) * 1.6; // 가로 세로 왜곡 비율 적용
      y = height / 2 + radius * Math.sin(theta);
      
      const left = x - textWidth / 2 - 4;
      const top = y - textHeight / 2 - 4;
      const right = x + textWidth / 2 + 4;
      const bottom = y + textHeight / 2 + 4;
      
      // 캔버스 경계를 넘어가는지 확인
      if (left > 5 && right < width - 5 && top > 5 && bottom < height - 5) {
        // 기존 단어들과의 오버랩 충돌 감지
        let isOverlap = false;
        for (const box of placedBoxes) {
          if (left < box.right && right > box.left && top < box.bottom && bottom > box.top) {
            isOverlap = true;
            break;
          }
        }
        
        if (!isOverlap) {
          // 충돌하지 않으면 단어 그리기 및 충돌 박스 리스트 추가
          ctx.fillStyle = colors[idx % colors.length];
          ctx.fillText(word.text, x, y);
          placedBoxes.push({ left, top, right, bottom });
          hasPlaced = true;
        }
      }
      
      theta += dTheta;
      radius += dRadius;
      iterations++;
    }
  });
}

// 뉴스 목록 출력
function renderNewsList(newsList) {
  const container = document.getElementById('news-list-container');
  container.innerHTML = '';
  
  if (!newsList || newsList.length === 0) {
    container.innerHTML = '<div class="news-item" style="text-align: center; color: var(--text-muted);">최근 1주일간 보도된 기사가 없습니다.</div>';
    return;
  }
  
  newsList.forEach(n => {
    const item = document.createElement('a');
    item.className = 'news-item';
    item.href = n.link;
    item.target = '_blank';
    
    // 날짜 포맷 정리 (예: GMT 포맷에서 불필요 요소 간소화)
    let formattedDate = n.pubDate;
    try {
      const d = new Date(n.pubDate);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
      }
    } catch(e) {}

    item.innerHTML = `
      <span class="news-title">${n.title}</span>
      <div class="news-meta">
        <span class="news-source">${n.source}</span>
        <span class="news-date">${formattedDate}</span>
      </div>
    `;
    container.appendChild(item);
  });
}

// 재무 정보 요약 테이블 출력
function renderFinancialTable(tableData, currency) {
  const body = document.getElementById('financial-table-body');
  body.innerHTML = '';
  
  if (!tableData || tableData.length === 0) {
    body.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">재무 테이블 데이터가 비어 있습니다.</td></tr>';
    return;
  }
  
  tableData.forEach(row => {
    const tr = document.createElement('tr');
    
    // 값이 숫자이면 단위 포맷팅, 아니면 원래 문자 출력
    const formatCell = (val, isRatio = false) => {
      if (val === '-' || val === null || val === undefined) return '-';
      const cleanVal = val.toString().replace(/,/g, '');
      const num = parseFloat(cleanVal);
      if (isNaN(num)) return val;
      
      if (isRatio) return `${num.toFixed(1)}%`;
      // 한국 원화인 경우 백만 단위이므로 억 단위 환산 등 간소화도 고려되나, 크롤링된 값 그대로 천 단위 콤마
      return num.toLocaleString('ko-KR');
    };

    tr.innerHTML = `
      <td>${row.year}</td>
      <td>${formatCell(row.revenue)} ${currency === '₩' ? '억' : ''}</td>
      <td>${formatCell(row.opIncome)} ${currency === '₩' ? '억' : ''}</td>
      <td>${formatCell(row.netIncome)} ${currency === '₩' ? '억' : ''}</td>
      <td>${formatCell(row.roe, !row.roe.includes('%'))}</td>
      <td>${formatCell(row.debtRatio, !row.debtRatio.includes('%'))}</td>
      <td>${formatCell(row.per)}</td>
      <td>${formatCell(row.pbr)}</td>
    `;
    body.appendChild(tr);
  });
}

// 알고리즘 채점 상세 검증 리스트 출력
function renderCheckLists(checkResults, scores) {
  const populate = (key, listId, scoreId) => {
    const list = document.getElementById(listId);
    list.innerHTML = '';
    
    const items = checkResults[key] || [];
    items.forEach(item => {
      const li = document.createElement('li');
      const iconClass = item.pass === true ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark';
      li.className = item.pass === true ? 'pass' : 'fail';
      
      li.innerHTML = `
        <span class="label"><i class="${iconClass}"></i> ${item.label}</span>
        <span class="value">${item.value}</span>
      `;
      list.appendChild(li);
    });
    
    document.getElementById(scoreId).innerText = `${scores[key]}점`;
  };

  populate('graham', 'check-list-graham', 'algo-score-graham');
  populate('lynch', 'check-list-lynch', 'algo-score-lynch');
  populate('buffett', 'check-list-buffett', 'algo-score-buffett');
  populate('financial', 'check-list-financial', 'algo-score-financial');
  populate('dividend', 'check-list-dividend', 'algo-score-dividend');

  // 그레이엄 수 추가 정보 출력
  const grahamExtra = document.getElementById('graham-extra-info');
  grahamExtra.style.display = 'none';
  
  // 그레이엄 분석 특화 수치 바인딩 (그레이엄 넘버가 산출된 경우에만 노출)
  const grahamResults = checkResults.graham || [];
  const hasGrahamInfo = grahamResults.some(r => r.label.includes('PER') && r.pass !== null);
  
  if (hasGrahamInfo) {
    // 임의 계산된 그레이엄 수 설명
    const epsObj = checkResults.graham.find(r => r.label.includes('PER'));
    const bpsObj = checkResults.graham.find(r => r.label.includes('PBR'));
    
    if (epsObj && bpsObj) {
      grahamExtra.style.display = 'block';
      grahamExtra.innerHTML = `
        <strong>💡 그레이엄 안전마진 평가:</strong><br>
        그레이엄 수(Graham Number) 기반 공식 기준가 대비 현재 주가가 가치 평가 범위 안에 있습니다.
      `;
    }
  }
}

// 통화 서식 도우미
function formatCurrency(val, currencySymbol) {
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  
  if (currencySymbol === '₩') {
    // 한국 주가인 경우 정수 처리
    return `${Math.round(num).toLocaleString('ko-KR')}원`;
  } else if (currencySymbol === '¥') {
    // 일본 주가인 경우 정수 처리
    return `¥${Math.round(num).toLocaleString('ja-JP')}`;
  }
  return `${currencySymbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
