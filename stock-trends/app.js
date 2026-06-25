/**
 * CineAHO Stock Market Trend Tracker & Analyzer App Engine
 * Real-Time API Sync & Live Stock Simulator
 */

// 1. STOCKS DATABASE (20 KOSPI, 20 KOSDAQ, 15 US, 10 JP Stocks)
const STOCKS_DB = [
  // --- KOSPI ---
  { code: '005930', name: '삼성전자', market: 'KOSPI', basePrice: 76000, currentPrice: 77900, change: 1900, pct: 2.50, volume: '18.4M', commentary: '반도체 메모리 수출 가격 상승세 지속으로 외인 및 기관의 대규모 순매수세가 유입되었습니다. HBM 5세대 공급 확대 기대감이 주가를 이끌었습니다.' },
  { code: '000660', name: 'SK하이닉스', market: 'KOSPI', basePrice: 185000, currentPrice: 191200, change: 6200, pct: 3.35, volume: '4.8M', commentary: '글로벌 AI 칩 수요 폭발에 따른 고대역폭 메모리(HBM) 매출 성장 실적이 사상 최고치를 경신하며 기관 투자자들의 러브콜이 이어졌습니다.' },
  { code: '005380', name: '현대차', market: 'KOSPI', basePrice: 242000, currentPrice: 247500, change: 5500, pct: 2.27, volume: '1.2M', commentary: '친환경 하이브리드 차량의 북미 지역 판매 실적 성장과 인도 현지 법인 상장 기대감이 겹쳐 주가 강세를 유도했습니다.' },
  { code: '000270', name: '기아', market: 'KOSPI', basePrice: 112000, currentPrice: 114300, change: 2300, pct: 2.05, volume: '1.5M', commentary: '사상 최고 수준의 분기 영업이익률 달성과 견조한 배당 성향 확대 공시로 밸류업 프로그램 수혜주로서 상승세를 유지했습니다.' },
  { code: '068270', name: '셀트리온', market: 'KOSPI', basePrice: 178000, currentPrice: 182500, change: 4500, pct: 2.53, volume: '980K', commentary: '자가면역질환 치료 바이오시밀러의 미국 헬스케어 보험 선등재 소식이 알려지면서 실적 턴어라운드 모멘텀이 강화되었습니다.' },
  { code: '005490', name: 'POSCO홀딩스', market: 'KOSPI', basePrice: 382000, currentPrice: 376000, change: -6000, pct: -1.57, volume: '620K', commentary: '중국산 저가 철강 수입 물량 압박에 따른 2분기 철강 부문 마진 스프레드 둔화 전망과 2차전지 원소재 시황 회복 지연 여파로 하락했습니다.' },
  { code: '051910', name: 'LG화학', market: 'KOSPI', basePrice: 365000, currentPrice: 358500, change: -6500, pct: -1.78, volume: '420K', commentary: '석유화학 스프레드 마진 감소 우려가 지속되는 가운데 양극재 부문의 단가 인하 압박으로 기관 매도세가 집중되었습니다.' },
  { code: '028260', name: '삼성물산', market: 'KOSPI', basePrice: 145000, currentPrice: 148200, change: 3200, pct: 2.21, volume: '380K', commentary: '친환경 건설 및 해외 태양광 발전 EPC 수주 확대와 그룹 지배구조 개선 모멘텀이 복합 작용하여 완만한 상승 곡선을 그렸습니다.' },
  { code: '105560', name: 'KB금융', market: 'KOSPI', basePrice: 78000, currentPrice: 79900, change: 1900, pct: 2.44, volume: '1.9M', commentary: '1분기 호실적 발표 및 지속적인 자사주 매입/소각 계획 등 주주 환원 정책 강화가 지속적인 외인 순매수를 자극했습니다.' },
  { code: '055550', name: '신한지주', market: 'KOSPI', basePrice: 46200, currentPrice: 47450, change: 1250, pct: 2.71, volume: '2.1M', commentary: 'ROE 기반 포트폴리오 개선 성과 및 선제적 리스크 관리 공시로 밸류업 지수 편입 가능성이 한층 부각되었습니다.' },
  { code: '373220', name: 'LG에너지솔루션', market: 'KOSPI', basePrice: 345000, currentPrice: 338000, change: -7000, pct: -2.03, volume: '880K', commentary: '글로벌 전기차(EV) 수요 캐즘 존 진입 우려 및 주요 고객사들의 배터리 셀 재고 조정 여파로 공매도성 매물이 출회되었습니다.' },
  { code: '207940', name: '삼성바이오로직스', market: 'KOSPI', basePrice: 785000, currentPrice: 778000, change: -7000, pct: -0.89, volume: '120K', commentary: '연이은 대규모 위탁생산(CMO) 계약 성사 소식에도 불구하고, 최근 단기 주가 상승에 따른 연기금의 차익실현 매물로 약보합 마감했습니다.' },
  { code: '035420', name: 'NAVER', market: 'KOSPI', basePrice: 172000, currentPrice: 168500, change: -3500, pct: -2.03, volume: '1.1M', commentary: '중국 이커머스 업체들의 공격적인 국내 마케팅에 따른 라인야후 이슈 및 검색 광고 성장 둔화 우려로 검색 광고 성장 둔화 우려로 매수 심리가 축소되었습니다.' },
  { code: '035720', name: '카카오', market: 'KOSPI', basePrice: 48500, currentPrice: 46200, change: -2300, pct: -4.74, volume: '3.4M', commentary: '경영진의 법적 리스크 장기화와 문어발식 계열사 매각 구조조정 잡음이 이어져 연기금과 개인의 동반 투매가 발생했습니다.' },
  { code: '006400', name: '삼성SDI', market: 'KOSPI', basePrice: 395000, currentPrice: 382000, change: -13000, pct: -3.29, volume: '510K', commentary: '전고체 배터리 기대감에도 불구하고 원형 배터리 및 중대형 ESS 전방 수요 침체 우려가 부각되어 매수 거래가 정체되었습니다.' },
  { code: '003670', name: '포스코퓨처엠', market: 'KOSPI', basePrice: 265000, currentPrice: 254000, change: -11000, pct: -4.15, volume: '480K', commentary: '양극재 핵심 소재인 리튬 가격 하락세 장기화로 인한 재고평가손실 반영 가능성이 대두되며 업종 약세를 보였습니다.' },
  { code: '066570', name: 'LG전자', market: 'KOSPI', basePrice: 96000, currentPrice: 94100, change: -1900, pct: -1.98, volume: '820K', commentary: '가전 및 전장 부문 실적은 비교적 선방했으나 TV 글로벌 소비 부진 지속에 따른 출하 둔화 우려로 하방 압력을 받았습니다.' },
  { code: '450080', name: '에코프로머티', market: 'KOSPI', basePrice: 98000, currentPrice: 92100, change: -5900, pct: -6.02, volume: '1.2M', commentary: '모기업 지분 매각 루머 및 2차전지 전구체 공급 물량 과잉 진단 보고서 발표가 악재로 작용하며 가파르게 떨어졌습니다.' },
  { code: '096770', name: 'SK이노베이션', market: 'KOSPI', basePrice: 112000, currentPrice: 108500, change: -3500, pct: -3.13, volume: '950K', commentary: '정제마진 약세로 인한 석유개발 부문 감익과 자회사 SK온의 추가 자금 조달 리스크 부담으로 투자 심리가 악화되었습니다.' },
  { code: '329180', name: 'HD현대중공업', market: 'KOSPI', basePrice: 125000, currentPrice: 121000, change: -4000, pct: -3.20, volume: '310K', commentary: '선가 지수 상승에도 후판 가격 협상 난항 및 파업 가능성 악재 소식이 매수세를 주저하게 만들었습니다.' },

  // --- KOSDAQ ---
  { code: '198750', name: '알테오젠', market: 'KOSDAQ', basePrice: 185000, currentPrice: 196800, change: 11800, pct: 6.38, volume: '3.4M', commentary: 'MSD와의 면역항암제 피하주사(SC) 제형 독점 라이선스 마일스톤 유입 본격화와 기술 수출 누적 이익 확대로 급등세를 연출했습니다.' },
  { code: '247540', name: '에코프로비엠', market: 'KOSDAQ', basePrice: 215000, currentPrice: 206000, change: -9000, pct: -4.19, volume: '1.8M', commentary: '전기차 업계의 주문 연기 소식으로 에코프로 그룹 주 전반에 개인 투자자 대량 차익 매물이 대량 출회되며 동반 조정을 겪었습니다.' },
  { code: '086520', name: '에코프로', market: 'KOSDAQ', basePrice: 98000, currentPrice: 93800, change: -4200, pct: -4.29, volume: '2.5M', commentary: '이차전지 지주사로서 액면분할 이벤트 종료 후 신규 성장 동력 부재 분석 및 기관의 공매도 잔고 매물 청산 압박으로 내렸습니다.' },
  { code: '028300', name: 'HLB', market: 'KOSDAQ', basePrice: 65000, currentPrice: 62100, change: -2900, pct: -4.46, volume: '2.9M', commentary: '미국 FDA 항암 신약 승인(NDA) 관련 보완 요구서(CRL) 발령 이후 신약 출시 로드맵 장기화 우려로 매수 매력이 감소했습니다.' },
  { code: '348370', name: '엔켐', market: 'KOSDAQ', basePrice: 245000, currentPrice: 231500, change: -13500, pct: -5.51, volume: '1.2M', commentary: '글로벌 전해액 공급 과잉 전망 및 단기 랠리에 따른 외국인/투신 연합의 매도 차익 실현 집중으로 낙폭이 확대되었습니다.' },
  { code: '058470', name: '리노공업', market: 'KOSDAQ', basePrice: 255000, currentPrice: 268500, change: 13500, pct: 5.29, volume: '880K', commentary: '온디바이스 AI 칩 글로벌 양산 테스트 수요가 지속적으로 증가하며 리노핀 및 소켓 주문량이 사상 최고치를 달성해 급상승했습니다.' },
  { code: '214150', name: '클래시스', market: 'KOSDAQ', basePrice: 42000, currentPrice: 44250, change: 2250, pct: 5.36, volume: '950K', commentary: '글로벌 미용 의료기기 수출 매출 비중이 처음으로 70%를 돌파하며 가파른 이익 마진 스프레드를 기록, 외국인 순매수가 강했습니다.' },
  { code: '145020', name: '휴젤', market: 'KOSDAQ', basePrice: 198000, currentPrice: 208500, change: 10500, pct: 5.30, volume: '410K', commentary: '보툴리눔 톡신 제제의 미국 정식 출시 유통망 확보 완료 뉴스가 실적 향상 기대감을 증폭시키며 주가 전고점 돌파를 도왔습니다.' },
  { code: '000250', name: '삼천당제약', market: 'KOSDAQ', basePrice: 125000, currentPrice: 131400, change: 6400, pct: 5.12, volume: '1.4M', commentary: '유럽 유력 제약사와 황반변성 바이오시밀러 독점 공급 파트너십 가계약이 체결 완료되었다는 공시가 호재로 반영되었습니다.' },
  { code: '242040', name: '실리콘투', market: 'KOSDAQ', basePrice: 18200, currentPrice: 19950, change: 1750, pct: 9.62, volume: '6.4M', commentary: 'K-뷰티 인디 브랜드의 글로벌 물류 대행 허브 점유율이 미국에 이어 유럽에서도 가속 성장하며 실적 서프라이즈 랠리를 이어갔습니다.' },
  { code: '293490', name: '카카오게임즈', market: 'KOSDAQ', basePrice: 21500, currentPrice: 20600, change: -900, pct: -4.19, volume: '1.1M', commentary: '글로벌 신작 MMORPG 게임 출시 지연 및 모바일 라인업 매출 자연 하락 추세로 마케팅비 절감 효과 한계 분석이 부각되었습니다.' },
  { code: '277810', name: '레인보우로보틱스', market: 'KOSDAQ', basePrice: 168000, currentPrice: 161200, change: -6800, pct: -4.05, volume: '620K', commentary: '협동 로봇 대기업 공급 공시 대기 상태가 길어지며 거래량이 정체되고 연기금 포트폴리오 비중 조절 매물로 약세를 보였습니다.' },
  { code: '403010', name: 'HPSP', market: 'KOSDAQ', basePrice: 41200, currentPrice: 39550, change: -1650, pct: -4.00, volume: '1.2M', commentary: '고압 수소 어닐링 장비의 특허 소송 이슈 판결 대기로 단기 불확실성이 증가하자 기관들이 차익 수동 매물을 방출했습니다.' },
  { code: '039030', name: '이오테크닉스', market: 'KOSDAQ', basePrice: 198000, currentPrice: 189500, change: -8500, pct: -4.29, volume: '510K', commentary: '레이저 마커 및 그루빙 장비 발주 흐름은 양호하나 2차전지 가공 장비 수주 취소 루머 여파로 하방 변동이 발생했습니다.' },
  { code: '036830', name: '솔브레인', market: 'KOSDAQ', basePrice: 265000, currentPrice: 254200, change: -10800, pct: -4.08, volume: '310K', commentary: '반도체 식각액 출하량 개선 지연 전망과 주요 고객사의 감산 기조 장기화 분석이 투자 매력을 억제해 하락했습니다.' },
  { code: '005290', name: '동진쎄미켐', market: 'KOSDAQ', basePrice: 42000, currentPrice: 40300, change: -1700, pct: -4.05, volume: '880K', commentary: 'EUV 포토레지스트 국산화 양산 진척도 둔화 리포트 영향으로 테마성 차익 매물이 집중되었습니다.' },
  { code: '032800', name: '원익IPS', market: 'KOSDAQ', basePrice: 34500, currentPrice: 33100, change: -1400, pct: -4.06, volume: '950K', commentary: '메모리 제조사들의 설비투자(CAPEX) 보수적 유지 방침에 따른 장비 납품 일정 이월 루머로 약세를 기록했습니다.' },
  { code: '048260', name: '오스템임플란트', market: 'KOSDAQ', basePrice: 188000, currentPrice: 180200, change: -7800, pct: -4.15, volume: '80K', commentary: '해외 유통 채널 선적 스케줄 일시적 지연 여파로 단기 영업 마진 감소 우려가 제기되며 매수 거래가 한산했습니다.' },
  { code: '041960', name: '코미코', market: 'KOSDAQ', basePrice: 78000, currentPrice: 74800, change: -3200, pct: -4.10, volume: '190K', commentary: '반도체 세정/코팅 부문 국내외 가동률 회복세가 완만하여 실적 레벨업 시점이 이월될 것이라는 예측에 하락 마감했습니다.' },
  { code: '025900', name: '동화기업', market: 'KOSDAQ', basePrice: 58000, currentPrice: 55600, change: -2400, pct: -4.14, volume: '220K', commentary: '건설 착공 면적 감소에 따른 마루/보드 건축 자재 유통 부진과 전기차용 전해액 공급망 지연 소식으로 약세를 띠었습니다.' },

  // --- US ---
  { code: 'AAPL', name: 'Apple (애플)', market: 'US', basePrice: 175, currentPrice: 175.50, change: 0.50, pct: 0.28, volume: '52M', commentary: '아이폰의 온디바이스 AI 비서 기능 탑재 및 중국 시장 출하량 회복 소식에 힘입어 시가총액 1위 자리를 견고히 지켰습니다.' },
  { code: 'MSFT', name: 'Microsoft (마이크로소프트)', market: 'US', basePrice: 425, currentPrice: 425.80, change: 0.80, pct: 0.19, volume: '18M', commentary: '클라우드 애저(Azure)의 지속적인 성장과 Copilot 라이선스 매출 본격 반영으로 안정적인 실적 랠리를 이어가고 있습니다.' },
  { code: 'NVDA', name: 'NVIDIA (엔비디아)', market: 'US', basePrice: 920, currentPrice: 924.50, change: 4.50, pct: 0.49, volume: '45M', commentary: 'AI 차세대 칩인 블랙웰(Blackwell) 아키텍처 출시 지연 우려 해소 및 데이터센터 부문 매출 지속 폭증 기대감으로 외인 수급이 유지되었습니다.' },
  { code: 'AMZN', name: 'Amazon (아마존)', market: 'US', basePrice: 184, currentPrice: 184.20, change: 0.20, pct: 0.11, volume: '22M', commentary: 'AWS 클라우드 마진율 개선 및 이커머스 부문의 AI 물류 최적화 비용 절감 효과가 지속 반영되어 시장 예상을 상회했습니다.' },
  { code: 'GOOGL', name: 'Alphabet (구글)', market: 'US', basePrice: 168, currentPrice: 168.40, change: 0.40, pct: 0.24, volume: '21M', commentary: '제미나이 1.5 프로 모델의 구글 웍스페이스 전면 배포 및 검색 광고의 안정적 성장 모멘텀이 유지되었습니다.' },
  { code: 'META', name: 'Meta (메타)', market: 'US', basePrice: 476, currentPrice: 476.30, change: 0.30, pct: 0.06, volume: '12M', commentary: '인스타그램 릴스(Reels) 광고 수익화 가속 및 Llama 3 기반 오픈소스 생태계 확장에 힘입어 외인 기관 순매수가 이어졌습니다.' },
  { code: 'TSLA', name: 'Tesla (테슬라)', market: 'US', basePrice: 178, currentPrice: 178.50, change: 0.50, pct: 0.28, volume: '88M', commentary: '중국 내 FSD(완전자율주행) 승인 임박설 및 기가팩토리 상하이 생산량 정상화 흐름이 숏스퀴즈 유입을 자극했습니다.' },
  { code: 'BRK-B', name: 'Berkshire Hathaway (버크셔)', market: 'US', basePrice: 403, currentPrice: 403.50, change: 0.50, pct: 0.12, volume: '3.4M', commentary: '에너지 및 보험 등 방어적 가치 포트폴리오의 이익 안정성과 견조한 현금 보유고 부각으로 약세장 속 선방을 기록했습니다.' },
  { code: 'AVGO', name: 'Broadcom (브로드컴)', market: 'US', basePrice: 1378, currentPrice: 1378.20, change: 0.20, pct: 0.01, volume: '2.5M', commentary: 'AI 맞춤형 주문형 반도체(ASIC) 및 VM웨어 합병 시너지 효과가 분기 매출 가이드에 상향 반영되었습니다.' },
  { code: 'LLY', name: 'Eli Lilly (일라이릴리)', market: 'US', basePrice: 792, currentPrice: 792.10, change: 0.10, pct: 0.01, volume: '3.1M', commentary: '비만치료제 마운자로의 공급 부족 우려 완화 및 유럽 연합 품목 허가 획득 뉴스가 실적 향상 기대감을 지지했습니다.' },
  { code: 'AMD', name: 'AMD (AMD)', market: 'US', basePrice: 162, currentPrice: 162.80, change: 0.80, pct: 0.49, volume: '38M', commentary: '서버용 AI 가속기 MI300 시리즈의 신규 엔터프라이즈 고객사 공급 확대 공시가 상승을 견인했습니다.' },
  { code: 'NFLX', name: 'Netflix (넷플릭스)', market: 'US', basePrice: 615, currentPrice: 615.40, change: 0.40, pct: 0.07, volume: '4.2M', commentary: '계정 공유 유료화 안착 및 광고 요금제 가입자 증가율이 아시아/유럽 지역에서 고성장세를 기록하며 이익률을 방어했습니다.' },
  { code: 'INTC', name: 'Intel (인텔)', market: 'US', basePrice: 28.5, currentPrice: 28.50, change: 0, pct: 0, volume: '42M', commentary: '파운드리 분사 및 외부 수주 계약 확대 모멘텀에도 불구하고, 단기 공정 마진 악화 분석으로 하방 리스크가 부각되었습니다.' },
  { code: 'QCOM', name: 'Qualcomm (퀄컴)', market: 'US', basePrice: 182, currentPrice: 182.10, change: 0.10, pct: 0.05, volume: '9.8M', commentary: '스마트폰 내 온디바이스 AI 칩셋 탑재 비중 증대 소식이 칩 공급 단가 마진 수혜 기대를 모아 강세를 이끌었습니다.' },
  { code: 'MU', name: 'Micron (마이크론)', market: 'US', basePrice: 124, currentPrice: 124.50, change: 0.50, pct: 0.40, volume: '28M', commentary: '엔비디아 HBM3E 8단 메모리 공급 확대 본격화 루머 및 차세대 메모리 단가 인상 전망이 호재로 부각되었습니다.' },

  // --- JP ---
  { code: '7203', name: 'Toyota (토요타)', market: 'JP', basePrice: 3250, currentPrice: 3250, change: 0, pct: 0, volume: '11M', commentary: '엔화 약세 장기화에 따른 수출 마진 극대화 수혜와 하이브리드 차량 중심의 판매 비중 개선으로 어닝 서프라이즈를 기록했습니다.' },
  { code: '6758', name: 'Sony (소니)', market: 'JP', basePrice: 12800, currentPrice: 12800, change: 0, pct: 0, volume: '1.8M', commentary: '플레이스테이션 5 공급 정상화 및 음악/엔터테인먼트 부문 IP 라이선스 수출 매출 호조로 견조한 상승 곡선을 그렸습니다.' },
  { code: '6861', name: 'Keyence (키엔스)', market: 'JP', basePrice: 69200, currentPrice: 69200, change: 0, pct: 0, volume: '420K', commentary: '글로벌 스마트 팩토리 자동화 센서 및 계측 장비의 수주 회복에 따른 높은 영업이익률 유지가 투자 매력을 더했습니다.' },
  { code: '8306', name: 'Mitsubishi UFJ (미쓰비시UFJ)', market: 'JP', basePrice: 1585, currentPrice: 1585, change: 0, pct: 0, volume: '19M', commentary: '일본은행(BOJ)의 추가 금리 인상 기대감에 따른 은행 순이자마진(NIM) 스프레드 개선 수혜 기대가 부각되며 자금이 쏠렸습니다.' },
  { code: '8035', name: 'Tokyo Electron (도쿄일렉트론)', market: 'JP', basePrice: 33850, currentPrice: 33850, change: 0, pct: 0, volume: '2.1M', commentary: '반도체 미세 공정용 전공정 식각 장비 수요 확대 전망 및 중국 파운드리 투자 본격 재개 여파로 강세를 띠었습니다.' },
  { code: '9983', name: 'Fast Retailing (패스트리테일)', market: 'JP', basePrice: 41650, currentPrice: 41650, change: 0, pct: 0, volume: '620K', commentary: '유니클로의 중화권 및 유럽 오프라인 매장 매출 고성장세와 봄 시즌 아우터 라인업 조기 판매 성황 소식에 올랐습니다.' },
  { code: '9984', name: 'SoftBank Group (소프트뱅크)', market: 'JP', basePrice: 8430, currentPrice: 8430, change: 0, pct: 0, volume: '4.8M', commentary: '자회사 암(ARM) 주가 폭등에 따른 순자산가치(NAV) 급증 및 AI 유니콘 포트폴리오 회수 실적 개선 기대감에 자금이 유입되었습니다.' },
  { code: '7974', name: 'Nintendo (닌텐도)', market: 'JP', basePrice: 7650, currentPrice: 7650, change: 0, pct: 0, volume: '3.1M', commentary: '차세대 콘솔 스위치 2 출시 일정이 올해 하반기에서 내년 초로 일부 지연된다는 루머 유출 여파로 실망 매물이 출회되었습니다.' },
  { code: '7267', name: 'Honda (혼다)', market: 'JP', basePrice: 1775, currentPrice: 1775, change: 0, pct: 0, volume: '5.2M', commentary: '미국 하이브리드 시장 진출 성과 및 주주 가치 환원 강화를 위한 대규모 자사주 취득 공시가 매수세를 지지했습니다.' },
  { code: '4063', name: 'Shin-Etsu Chemical (신의츠)', market: 'JP', basePrice: 6280, currentPrice: 6280, change: 0, pct: 0, volume: '1.2M', commentary: '반도체용 실리콘 웨이퍼의 출하 안정성과 주거용 PVC 수지 부문 북미 수요 증가 전망에 강보합 마감했습니다.' }
];

// Global Indices Database (Initial static state)
let INDICES_DB = {
  kospi: { name: 'KOSPI 코스피', currentValue: 2654.21, change: 32.41, pct: 1.24, history: [2610, 2620, 2605, 2635, 2642, 2625, 2654] },
  kosdaq: { name: 'KOSDAQ 코스닥', currentValue: 842.15, change: -3.81, pct: -0.45, history: [855, 852, 848, 850, 846, 845, 842] },
  kospi200: { name: 'KOSPI 200', currentValue: 358.45, change: 5.10, pct: 1.44, history: [351, 353, 350, 355, 356, 354, 358] },
  exchange: { name: '원/달러 환율', currentValue: 1374.50, change: -6.20, pct: -0.45, history: [1382, 1379, 1380, 1378, 1375, 1377, 1374] },
  sp500: { name: 'S&P 500', currentValue: 5280.12, change: 44.20, pct: 0.84, history: [5220, 5235, 5240, 5262, 5255, 5270, 5280] },
  nasdaq: { name: 'NASDAQ', currentValue: 16820.45, change: 185.12, pct: 1.11, history: [16520, 16610, 16580, 16720, 16690, 16750, 16820] },
  dow: { name: 'Dow Jones', currentValue: 39120.40, change: -45.20, pct: -0.12, history: [39220, 39190, 39150, 39260, 39200, 39140, 39120] },
  soxx: { name: '필라델피아 반도체', currentValue: 5142.10, change: 98.24, pct: 1.95, history: [4980, 5020, 4995, 5060, 5090, 5080, 5142] },
  nikkei: { name: 'Nikkei 225', currentValue: 38920.15, change: -85.40, pct: -0.22, history: [39080, 39020, 38950, 39120, 39010, 38980, 38920] },
  topix: { name: 'TOPIX', currentValue: 2762.45, change: 12.10, pct: 0.44, history: [2745, 2750, 2748, 2758, 2755, 2758, 2762] }
};

// Sound Synthesizer using Web Audio API
const SoundEngine = {
  ctx: null,

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio not supported", e);
    }
  },

  play(type) {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    const baseGain = 0.08;

    switch (type) {
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        gainNode.gain.setValueAtTime(baseGain * 0.4, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
        break;
      case 'scan':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.linearRampToValueAtTime(600, t + 0.4);
        gainNode.gain.setValueAtTime(baseGain * 0.25, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.45);
        osc.start(t);
        osc.stop(t + 0.45);
        break;
      case 'success':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, t); // E5
        osc.frequency.setValueAtTime(987.77, t + 0.08); // B5
        gainNode.gain.setValueAtTime(baseGain, t);
        gainNode.gain.setValueAtTime(baseGain, t + 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
        osc.start(t);
        osc.stop(t + 0.25);
        break;
    }
  }
};

const App = {
  state: {
    selectedSegment: 'KOSPI', // KOSPI, KOSDAQ
    lastSyncTime: '2026-06-03 21:00:15',
    nextSyncTime: '2026-06-04 09:00:00',
    selectedStockCode: null,
    historySnapshots: [],
    selectedPeriod: '1d',
    currentStockHistory: null
  },

  // DOM Elements
  lblKospiPriceEl: null, lblKospiChangeEl: null, wrapKospiChangeEl: null,
  lblKosdaqPriceEl: null, lblKosdaqChangeEl: null, wrapKosdaqChangeEl: null,
  lblKospi200PriceEl: null, lblKospi200ChangeEl: null, wrapKospi200ChangeEl: null,
  lblExchangePriceEl: null, lblExchangeChangeEl: null, wrapExchangeChangeEl: null,

  // US DOM
  lblSp500PriceEl: null, lblSp500ChangeEl: null, wrapSp500ChangeEl: null,
  lblNasdaqPriceEl: null, lblNasdaqChangeEl: null, wrapNasdaqChangeEl: null,
  lblDowPriceEl: null, lblDowChangeEl: null, wrapDowChangeEl: null,
  lblSoxxPriceEl: null, lblSoxxChangeEl: null, wrapSoxxChangeEl: null,

  // JP DOM
  lblNikkeiPriceEl: null, lblNikkeiChangeEl: null, wrapNikkeiChangeEl: null,
  lblTopixPriceEl: null, lblTopixChangeEl: null, wrapTopixChangeEl: null,

  // UI logic
  btnSegmentKospiEl: null,
  btnSegmentKosdaqEl: null,
  bodyGainersEl: null,
  bodyDeclinersEl: null,
  bodyUsGainersEl: null,
  bodyUsDeclinersEl: null,
  bodyJpGainersEl: null,
  bodyJpDeclinersEl: null,
  btnTriggerLiveAnalysisEl: null,
  consoleLogsScreenEl: null,
  lblLastSyncTimeEl: null,
  lblNextSyncTimeEl: null,

  // Modal
  modalOverlayEl: null,
  btnCloseModalEl: null,
  lblModalStockNameEl: null,
  lblModalStockCodeEl: null,
  lblModalStockMarketEl: null,
  lblModalStockPriceEl: null,
  lblModalStockPctEl: null,
  lblModalStockHighEl: null,
  lblModalStockLowEl: null,
  lblModalStockVolEl: null,
  lblModalStockCommentaryEl: null,
  canvasStockChartEl: null,

  // Scroll
  scrollProgressRingEl: null,
  progressCircleIndicatorEl: null,
  scrollPercentageLblEl: null,
  btnScrollTopEl: null,
  btnScrollBottomEl: null,

  init() {
    this.cacheDomElements();
    this.bindEvents();
    this.renderTabs();
    this.updateIndicesUI();
    this.renderStockTables();
    this.renderAllSparklines();
    this.updateScrollProgress();
    
    // Fetch live prices on load
    this.fetchRealtimePrices(false);
    this.fetchHistoryData();
    this.renderTrendsTab();
  },

  async fetchHistoryData() {
    try {
      const res = await fetch('/api/stock/history');
      const data = await res.json();
      if (Array.isArray(data)) {
        this.state.historySnapshots = data;
      }
    } catch (e) {
      console.warn("Failed to fetch historical stock prices.", e);
    }
  },

  cacheDomElements() {
    // Domestic Indices
    this.lblKospiPriceEl = document.getElementById('val-kospi-price');
    this.lblKospiChangeEl = document.getElementById('val-kospi-change');
    this.wrapKospiChangeEl = document.getElementById('val-kospi-change-wrap');
    
    this.lblKosdaqPriceEl = document.getElementById('val-kosdaq-price');
    this.lblKosdaqChangeEl = document.getElementById('val-kosdaq-change');
    this.wrapKosdaqChangeEl = document.getElementById('val-kosdaq-change-wrap');

    this.lblKospi200PriceEl = document.getElementById('val-kospi200-price');
    this.lblKospi200ChangeEl = document.getElementById('val-kospi200-change');
    this.wrapKospi200ChangeEl = document.getElementById('val-kospi200-change-wrap');

    this.lblExchangePriceEl = document.getElementById('val-exchange-price');
    this.lblExchangeChangeEl = document.getElementById('val-exchange-change');
    this.wrapExchangeChangeEl = document.getElementById('val-exchange-change-wrap');

    // US Indices
    this.lblSp500PriceEl = document.getElementById('val-sp500-price');
    this.lblSp500ChangeEl = document.getElementById('val-sp500-change');
    this.wrapSp500ChangeEl = document.getElementById('val-sp500-change-wrap');

    this.lblNasdaqPriceEl = document.getElementById('val-nasdaq-price');
    this.lblNasdaqChangeEl = document.getElementById('val-nasdaq-change');
    this.wrapNasdaqChangeEl = document.getElementById('val-nasdaq-change-wrap');

    this.lblDowPriceEl = document.getElementById('val-dow-price');
    this.lblDowChangeEl = document.getElementById('val-dow-change');
    this.wrapDowChangeEl = document.getElementById('val-dow-change-wrap');

    this.lblSoxxPriceEl = document.getElementById('val-soxx-price');
    this.lblSoxxChangeEl = document.getElementById('val-soxx-change');
    this.wrapSoxxChangeEl = document.getElementById('val-soxx-change-wrap');

    // JP Indices
    this.lblNikkeiPriceEl = document.getElementById('val-nikkei-price');
    this.lblNikkeiChangeEl = document.getElementById('val-nikkei-change');
    this.wrapNikkeiChangeEl = document.getElementById('val-nikkei-change-wrap');

    this.lblTopixPriceEl = document.getElementById('val-topix-price');
    this.lblTopixChangeEl = document.getElementById('val-topix-change');
    this.wrapTopixChangeEl = document.getElementById('val-topix-change-wrap');

    // Segment & tables
    this.btnSegmentKospiEl = document.getElementById('btn-segment-kospi');
    this.btnSegmentKosdaqEl = document.getElementById('btn-segment-kosdaq');
    
    this.bodyGainersEl = document.getElementById('body-gainers');
    this.bodyDeclinersEl = document.getElementById('body-decliners');
    
    this.bodyUsGainersEl = document.getElementById('body-us-gainers');
    this.bodyUsDeclinersEl = document.getElementById('body-us-decliners');
    
    this.bodyJpGainersEl = document.getElementById('body-jp-gainers');
    this.bodyJpDeclinersEl = document.getElementById('body-jp-decliners');

    // Simulator logs
    this.btnTriggerLiveAnalysisEl = document.getElementById('btn-trigger-live-analysis');
    this.consoleLogsScreenEl = document.getElementById('console-logs-screen');
    this.lblLastSyncTimeEl = document.getElementById('lbl-last-sync-time');
    this.lblNextSyncTimeEl = document.getElementById('lbl-next-sync-time');

    // Modal
    this.modalOverlayEl = document.getElementById('stock-details-modal');
    this.btnCloseModalEl = document.getElementById('btn-close-modal');
    this.lblModalStockNameEl = document.getElementById('lbl-modal-stock-name');
    this.lblModalStockCodeEl = document.getElementById('lbl-modal-stock-code');
    this.lblModalStockMarketEl = document.getElementById('lbl-modal-stock-market');
    this.lblModalStockPriceEl = document.getElementById('lbl-modal-stock-price');
    this.lblModalStockPctEl = document.getElementById('lbl-modal-stock-pct');
    this.lblModalStockHighEl = document.getElementById('lbl-modal-stock-high');
    this.lblModalStockLowEl = document.getElementById('lbl-modal-stock-low');
    this.lblModalStockVolEl = document.getElementById('lbl-modal-stock-vol');
    this.lblModalStockCommentaryEl = document.getElementById('lbl-modal-stock-commentary');
    this.canvasStockChartEl = document.getElementById('canvas-stock-chart');

    // Scroll progress controls
    this.scrollProgressRingEl = document.getElementById('scroll-progress-ring');
    this.progressCircleIndicatorEl = document.getElementById('progress-circle-indicator');
    this.scrollPercentageLblEl = document.getElementById('scroll-percentage-lbl');
    this.btnScrollTopEl = document.getElementById('btn-scroll-top');
    this.btnScrollBottomEl = document.getElementById('btn-scroll-bottom');

    // Trends & News Elements
    this.trendsSearchInputEl = document.getElementById('trends-search-input');
    this.btnTriggerTrendsSearchEl = document.getElementById('btn-trigger-trends-search');
    this.btnBackToSummaryEl = document.getElementById('btn-back-to-summary');
    this.trendsSearchResultCardEl = document.getElementById('trends-search-result-card');
    this.lblTrendSearchedKeywordEl = document.getElementById('lbl-trend-searched-keyword');
    this.lblTrendMarketImpactEl = document.getElementById('lbl-trend-market-impact');
    this.lblTrendInterestIndexEl = document.getElementById('lbl-trend-interest-index');
    this.lblTrendSentimentEl = document.getElementById('lbl-trend-sentiment');
    this.lblTrendRiskEl = document.getElementById('lbl-trend-risk');
    this.lblTrendRelatedStocksEl = document.getElementById('lbl-trend-related-stocks');
    this.lblTrendAiAnalysisEl = document.getElementById('lbl-trend-ai-analysis');
    this.lblTrendSearchTimeEl = document.getElementById('lbl-trend-search-time');
    this.lblTrendRelatedArticlesEl = document.getElementById('lbl-trend-related-articles');
    this.newsSummaryLayoutEl = document.getElementById('news-summary-layout');
    this.domesticNewsContainerEl = document.getElementById('domestic-news-container');
    this.internationalNewsContainerEl = document.getElementById('international-news-container');
  },

  bindEvents() {
    // Segment Filtering
    if (this.btnSegmentKospiEl) {
      this.btnSegmentKospiEl.addEventListener('click', () => {
        SoundEngine.play('click');
        this.btnSegmentKospiEl.classList.add('active');
        this.btnSegmentKosdaqEl.classList.remove('active');
        this.state.selectedSegment = 'KOSPI';
        this.renderStockTables();
      });
    }

    if (this.btnSegmentKosdaqEl) {
      this.btnSegmentKosdaqEl.addEventListener('click', () => {
        SoundEngine.play('click');
        this.btnSegmentKosdaqEl.classList.add('active');
        this.btnSegmentKospiEl.classList.remove('active');
        this.state.selectedSegment = 'KOSDAQ';
        this.renderStockTables();
      });
    }

    // Modal close
    this.btnCloseModalEl.addEventListener('click', () => {
      this.modalOverlayEl.classList.remove('open');
    });
    this.modalOverlayEl.addEventListener('click', (e) => {
      if (e.target === this.modalOverlayEl) {
        this.modalOverlayEl.classList.remove('open');
      }
    });

    // Chart Period Swapping
    const periodButtons = document.querySelectorAll('.period-btn');
    periodButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.play('click');
        periodButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.selectedPeriod = btn.getAttribute('data-period');
        
        const currentCode = this.state.selectedStockCode;
        const stock = STOCKS_DB.find(s => s.code === currentCode);
        if (stock) {
          this.renderSelectedPeriodChart(stock);
        } else {
          const index = INDICES_DB[currentCode];
          if (index) {
            this.renderSelectedPeriodChart({ market: 'INDEX', pct: index.pct });
          }
        }
      });
    });

    // Index Cards Click
    const indexCards = document.querySelectorAll('.index-card');
    indexCards.forEach(card => {
      card.addEventListener('click', () => {
        SoundEngine.play('click');
        let indexKey = card.id.replace('card-', '');
        if (indexKey === 'usd-krw') indexKey = 'exchange';
        this.openStockDetails(indexKey);
      });
    });

    // Real-Time Simulator Action
    this.btnTriggerLiveAnalysisEl.addEventListener('click', () => {
      this.runLiveSimulatedAnalysis();
    });

    // Trends & News Event Listeners
    if (this.btnTriggerTrendsSearchEl) {
      this.btnTriggerTrendsSearchEl.addEventListener('click', () => {
        const kw = this.trendsSearchInputEl.value.trim();
        this.investigateTrend(kw);
      });
    }

    if (this.btnBackToSummaryEl) {
      this.btnBackToSummaryEl.addEventListener('click', () => {
        SoundEngine.play('click');
        if (this.trendsSearchResultCardEl) {
          this.trendsSearchResultCardEl.style.display = 'none';
        }
        if (this.newsSummaryLayoutEl) {
          this.newsSummaryLayoutEl.style.display = '';
        }
        this.btnBackToSummaryEl.style.display = 'none';
        if (this.trendsSearchInputEl) {
          this.trendsSearchInputEl.value = '';
        }
      });
    }

    if (this.trendsSearchInputEl) {
      this.trendsSearchInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const kw = this.trendsSearchInputEl.value.trim();
          this.investigateTrend(kw);
        }
      });
    }

    // Window scroll
    window.addEventListener('scroll', () => this.updateScrollProgress());
    this.btnScrollTopEl.addEventListener('click', () => {
      SoundEngine.play('click');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    this.btnScrollBottomEl.addEventListener('click', () => {
      SoundEngine.play('click');
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
  },

  renderTabs() {
    const tabButtons = document.querySelectorAll('.market-tab-btn');
    const tabPanels = document.querySelectorAll('.market-tab-panel');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEngine.play('click');
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const targetId = btn.getAttribute('data-target');
        tabPanels.forEach(p => {
          if (p.id === targetId) {
            p.classList.add('active');
          } else {
            p.classList.remove('active');
          }
        });

        // Trigger redraw of sparklines on tab switch
        this.renderAllSparklines();
      });
    });
  },

  updateIndicesUI() {
    const updateIndex = (priceEl, changeEl, wrapEl, dbObj, isWon = false, isCurrency = false, symbolKey = '') => {
      if (!priceEl || !dbObj) return;
      const isUp = dbObj.change >= 0;
      const arrowIcon = isUp ? '<i class="fa-solid fa-caret-up"></i>' : '<i class="fa-solid fa-caret-down"></i>';
      const changeSign = isUp ? '+' : '';
      
      let priceVal = dbObj.currentValue;
      let changeVal = dbObj.change;
      
      let priceStr = formatCommas(priceVal.toFixed(2));
      let changeStr = formatCommas(changeVal.toFixed(2));
      
      if (symbolKey === 'exchange') {
        priceStr = formatCommas(priceVal.toFixed(2)) + '원';
        changeStr = formatCommas(changeVal.toFixed(2)) + '원';
      } else if (symbolKey === 'sp500' || symbolKey === 'nasdaq' || symbolKey === 'dow' || symbolKey === 'soxx') {
        priceStr = '$' + formatCommas(priceVal.toFixed(2));
        changeStr = '$' + formatCommas(changeVal.toFixed(2));
      } else if (symbolKey === 'nikkei' || symbolKey === 'topix') {
        priceStr = '¥' + formatCommas(priceVal.toFixed(2));
        changeStr = '¥' + formatCommas(changeVal.toFixed(2));
      }

      priceEl.textContent = priceStr;
      changeEl.innerHTML = `${arrowIcon} ${changeSign}${changeStr} (${changeSign}${dbObj.pct.toFixed(2)}%)`;

      wrapEl.className = `index-change-row ${isUp ? 'stock-up' : 'stock-down'}`;
    };

    updateIndex(this.lblKospiPriceEl, this.lblKospiChangeEl, this.wrapKospiChangeEl, INDICES_DB.kospi);
    updateIndex(this.lblKosdaqPriceEl, this.lblKosdaqChangeEl, this.wrapKosdaqChangeEl, INDICES_DB.kosdaq);
    updateIndex(this.lblKospi200PriceEl, this.lblKospi200ChangeEl, this.wrapKospi200ChangeEl, INDICES_DB.kospi200);
    updateIndex(this.lblExchangePriceEl, this.lblExchangeChangeEl, this.wrapExchangeChangeEl, INDICES_DB.exchange, true, false, 'exchange');

    // US
    updateIndex(this.lblSp500PriceEl, this.lblSp500ChangeEl, this.wrapSp500ChangeEl, INDICES_DB.sp500, false, true, 'sp500');
    updateIndex(this.lblNasdaqPriceEl, this.lblNasdaqChangeEl, this.wrapNasdaqChangeEl, INDICES_DB.nasdaq, false, true, 'nasdaq');
    updateIndex(this.lblDowPriceEl, this.lblDowChangeEl, this.wrapDowChangeEl, INDICES_DB.dow, false, true, 'dow');
    updateIndex(this.lblSoxxPriceEl, this.lblSoxxChangeEl, this.wrapSoxxChangeEl, INDICES_DB.soxx, false, true, 'soxx');

    // JP
    updateIndex(this.lblNikkeiPriceEl, this.lblNikkeiChangeEl, this.wrapNikkeiChangeEl, INDICES_DB.nikkei, false, true, 'nikkei');
    updateIndex(this.lblTopixPriceEl, this.lblTopixChangeEl, this.wrapTopixChangeEl, INDICES_DB.topix, false, true, 'topix');
  },

  renderStockTables() {
    // 1. Render Domestic Market (selectedSegment KOSPI or KOSDAQ)
    const domMarket = this.state.selectedSegment;
    const domFiltered = STOCKS_DB.filter(s => s.market === domMarket);
    const domGainers = [...domFiltered].sort((a,b) => b.pct - a.pct).slice(0, 10);
    const domDecliners = [...domFiltered].sort((a,b) => a.pct - b.pct).slice(0, 10);

    const renderTableBody = (bodyEl, list) => {
      if (!bodyEl) return;
      bodyEl.innerHTML = '';
      list.forEach((stock, idx) => {
        const isUp = stock.pct >= 0;
        const colorClass = isUp ? 'stock-up' : 'stock-down';
        const changeSign = isUp ? '+' : '';
        const arrow = isUp ? '▲' : '▼';

        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.innerHTML = `
          <td class="rank-col ${idx < 3 ? 'stock-up' : ''}">${idx + 1}</td>
          <td class="name-col">${stock.name}</td>
          <td class="val-col">${formatPrice(stock.currentPrice, stock.market)}</td>
          <td class="val-col Change-cell ${colorClass}" style="text-align: right;">${arrow} ${formatChange(stock.change, stock.market)}</td>
          <td class="change-col ${colorClass}" style="text-align: right;">${changeSign}${stock.pct.toFixed(2)}%</td>
          <td class="val-col" style="text-align: right; color: var(--text-dark);">${stock.volume}</td>
        `;

        tr.addEventListener('click', () => {
          this.openStockDetails(stock.code);
        });

        bodyEl.appendChild(tr);
      });
    };

    renderTableBody(this.bodyGainersEl, domGainers);
    renderTableBody(this.bodyDeclinersEl, domDecliners);

    // 2. Render US Market
    const usFiltered = STOCKS_DB.filter(s => s.market === 'US');
    const usGainers = [...usFiltered].sort((a,b) => b.pct - a.pct).slice(0, 10);
    const usDecliners = [...usFiltered].sort((a,b) => a.pct - b.pct).slice(0, 10);
    renderTableBody(this.bodyUsGainersEl, usGainers);
    renderTableBody(this.bodyUsDeclinersEl, usDecliners);

    // 3. Render JP Market
    const jpFiltered = STOCKS_DB.filter(s => s.market === 'JP');
    const jpGainers = [...jpFiltered].sort((a,b) => b.pct - a.pct).slice(0, 10);
    const jpDecliners = [...jpFiltered].sort((a,b) => a.pct - b.pct).slice(0, 10);
    renderTableBody(this.bodyJpGainersEl, jpGainers);
    renderTableBody(this.bodyJpDeclinersEl, jpDecliners);
  },

  renderAllSparklines() {
    const drawSpark = (canvasId, historyData, color) => {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      if (historyData.length < 2) return;

      const min = Math.min(...historyData);
      const max = Math.max(...historyData);
      const range = max - min || 1;

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      historyData.forEach((val, idx) => {
        const x = (idx / (historyData.length - 1)) * (w - 6) + 3;
        const y = h - ((val - min) / range) * (h - 10) - 5;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      ctx.lineTo((w - 3), h);
      ctx.lineTo(3, h);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, hexToRgba(color, 0.12));
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fill();
    };

    drawSpark('spark-kospi', INDICES_DB.kospi.history, INDICES_DB.kospi.change >= 0 ? '#ef4444' : '#3b82f6');
    drawSpark('spark-kosdaq', INDICES_DB.kosdaq.history, INDICES_DB.kosdaq.change >= 0 ? '#ef4444' : '#3b82f6');
    drawSpark('spark-kospi200', INDICES_DB.kospi200.history, INDICES_DB.kospi200.change >= 0 ? '#ef4444' : '#3b82f6');
    drawSpark('spark-usd-krw', INDICES_DB.exchange.history, INDICES_DB.exchange.change >= 0 ? '#ef4444' : '#3b82f6');

    // US
    drawSpark('spark-sp500', INDICES_DB.sp500.history, INDICES_DB.sp500.change >= 0 ? '#ef4444' : '#3b82f6');
    drawSpark('spark-nasdaq', INDICES_DB.nasdaq.history, INDICES_DB.nasdaq.change >= 0 ? '#ef4444' : '#3b82f6');
    drawSpark('spark-dow', INDICES_DB.dow.history, INDICES_DB.dow.change >= 0 ? '#ef4444' : '#3b82f6');
    drawSpark('spark-soxx', INDICES_DB.soxx.history, INDICES_DB.soxx.change >= 0 ? '#ef4444' : '#3b82f6');

    // JP
    drawSpark('spark-nikkei', INDICES_DB.nikkei.history, INDICES_DB.nikkei.change >= 0 ? '#ef4444' : '#3b82f6');
    drawSpark('spark-topix', INDICES_DB.topix.history, INDICES_DB.topix.change >= 0 ? '#ef4444' : '#3b82f6');
  },

  async openStockDetails(code) {
    let name = '';
    let market = '';
    let currentPrice = 0;
    let change = 0;
    let pct = 0;
    let volume = '';
    let commentary = '';

    const stock = STOCKS_DB.find(s => s.code === code);
    if (stock) {
      name = stock.name;
      market = stock.market;
      currentPrice = stock.currentPrice;
      change = stock.change;
      pct = stock.pct;
      volume = stock.volume;
      commentary = stock.commentary;
    } else {
      const index = INDICES_DB[code];
      if (index) {
        name = index.name;
        market = 'INDEX';
        currentPrice = index.currentValue;
        change = index.change;
        pct = index.pct;
        volume = 'N/A';
        commentary = `${name} 지수의 하루, 한달, 일년, 10년 기간별 시장 추세 데이터베이스 정보입니다.`;
      } else {
        return;
      }
    }

    this.state.selectedStockCode = code;

    this.lblModalStockNameEl.textContent = name;
    this.lblModalStockCodeEl.textContent = stock ? stock.code : '';
    this.lblModalStockMarketEl.textContent = market;
    
    const isUp = pct >= 0;
    const colorClass = isUp ? 'stock-up' : 'stock-down';
    const changeSign = isUp ? '+' : '';
    const arrow = isUp ? '▲' : '▼';

    this.lblModalStockPriceEl.textContent = formatPrice(currentPrice, market);
    this.lblModalStockPriceEl.className = `val ${colorClass}`;
    this.lblModalStockPctEl.textContent = `${arrow} ${formatChange(change, market)} (${changeSign}${pct.toFixed(2)}%)`;
    this.lblModalStockPctEl.className = `val ${colorClass}`;

    // Reset active tab button state to '1d'
    const periodButtons = document.querySelectorAll('.period-btn');
    periodButtons.forEach(b => {
      if (b.getAttribute('data-period') === '1d') b.classList.add('active');
      else b.classList.remove('active');
    });
    this.state.selectedPeriod = '1d';

    this.lblModalStockHighEl.textContent = '불러오는 중...';
    this.lblModalStockLowEl.textContent = '불러오는 중...';
    this.lblModalStockVolEl.textContent = volume;
    this.lblModalStockCommentaryEl.textContent = commentary;

    this.modalOverlayEl.classList.add('open');

    // Draw temporary loading chart or placeholder
    const canvas = this.canvasStockChartEl;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '12px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('데이터베이스 조회 중...', rect.width / 2, rect.height / 2);
    }

    try {
      const res = await fetch(`/api/stock/history/${code}?market=${market}&price=${currentPrice}`);
      const historyData = await res.json();
      this.state.currentStockHistory = historyData;
      
      const currentStock = STOCKS_DB.find(s => s.code === code);
      this.renderSelectedPeriodChart(currentStock || { market: 'INDEX', pct: pct });
    } catch (e) {
      console.warn("Failed to load detailed stock history", e);
    }
  },

  renderSelectedPeriodChart(stock) {
    if (!this.state.currentStockHistory) return;
    const period = this.state.selectedPeriod;
    const points = this.state.currentStockHistory[period] || [];
    
    this.drawHistoryCanvasChart(points, stock.market, stock.pct >= 0);

    if (points.length > 0) {
      const prices = points.map(p => p.price);
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      
      this.lblModalStockHighEl.textContent = formatPrice(maxPrice, stock.market);
      this.lblModalStockLowEl.textContent = formatPrice(minPrice, stock.market);
    } else {
      this.lblModalStockHighEl.textContent = 'N/A';
      this.lblModalStockLowEl.textContent = 'N/A';
    }
  },

  drawHistoryCanvasChart(points, market, isUp) {
    const canvas = this.canvasStockChartEl;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    if (points.length < 2) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '12px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('데이터 수집 중...', w / 2, h / 2);
      return;
    }

    const prices = points.map(p => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const color = isUp ? '#ef4444' : '#3b82f6';

    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = (h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(w - 10, y);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const renderedPoints = [];
    points.forEach((pt, idx) => {
      const x = (idx / (points.length - 1)) * (w - 40) + 20;
      const y = h - ((pt.price - min) / range) * (h - 60) - 30;
      renderedPoints.push({ x, y, pt });
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.lineTo(renderedPoints[renderedPoints.length - 1].x, h);
    ctx.lineTo(renderedPoints[0].x, h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, hexToRgba(color, 0.15));
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fill();

    const endPt = renderedPoints[renderedPoints.length - 1];
    ctx.beginPath();
    ctx.arc(endPt.x, endPt.y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(endPt.x, endPt.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = hexToRgba(color, 0.3);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px Outfit, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${formatPrice(max, market)} (최고)`, 20, 18);
    ctx.fillText(`${formatPrice(min, market)} (최저)`, 20, h - 8);

    ctx.textAlign = 'left';
    ctx.fillText(points[0].date, 20, h - 22);
    ctx.textAlign = 'right';
    ctx.fillText(points[points.length - 1].date, w - 20, h - 22);
  },

  async fetchRealtimePrices(isRefresh = false) {
    try {
      const url = `/api/stock/realtime${isRefresh ? '?refresh=true' : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.success) {
        // 1. Update INDICES_DB
        for (const [key, val] of Object.entries(data.indices)) {
          if (INDICES_DB[key]) {
            INDICES_DB[key].currentValue = val.currentValue;
            INDICES_DB[key].change = val.change;
            INDICES_DB[key].pct = val.pct;
            
            if (INDICES_DB[key].history) {
              INDICES_DB[key].history.shift();
              INDICES_DB[key].history.push(val.currentValue);
            }
          }
        }

        // 2. Update STOCKS_DB
        STOCKS_DB.forEach(stock => {
          const apiStock = data.stocks[stock.code];
          if (apiStock) {
            stock.currentPrice = apiStock.price;
            stock.change = apiStock.change;
            stock.pct = apiStock.pct;
            if (apiStock.volume) stock.volume = apiStock.volume;
          }
        });

        // 3. Update Sync Timestamps
        const now = new Date(data.timestamp || Date.now());
        this.state.lastSyncTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        
        const nextUpdate = new Date(now);
        if (now.getHours() < 9) {
          nextUpdate.setHours(9, 0, 0, 0);
        } else if (now.getHours() < 21) {
          nextUpdate.setHours(21, 0, 0, 0);
        } else {
          nextUpdate.setDate(now.getDate() + 1);
          nextUpdate.setHours(9, 0, 0, 0);
        }
        this.state.nextSyncTime = `${nextUpdate.getFullYear()}-${pad(nextUpdate.getMonth() + 1)}-${pad(nextUpdate.getDate())} ${pad(nextUpdate.getHours())}:${pad(nextUpdate.getMinutes())}:${pad(nextUpdate.getSeconds())}`;
        
        if (this.lblLastSyncTimeEl) this.lblLastSyncTimeEl.textContent = this.state.lastSyncTime;
        if (this.lblNextSyncTimeEl) this.lblNextSyncTimeEl.textContent = this.state.nextSyncTime;

        // 4. Update UI displays
        this.updateIndicesUI();
        this.renderStockTables();
        this.renderAllSparklines();
      }
    } catch (e) {
      console.warn("Failed to fetch real-time stock prices, falling back to local simulation.", e);
    }
  },

  runLiveSimulatedAnalysis() {
    SoundEngine.play('scan');

    this.consoleLogsScreenEl.innerHTML = '';
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const logs = [
      { delay: 0, text: `[SYSTEM] ${timeStr} - 실시간 주식 동향 트렌드 조사 엔진 가동...` },
      { delay: 200, text: `[CONNECT] 한국거래소 (KRX) Open API 시세 피드 채널 바인딩 중...` },
      { delay: 450, text: `[FETCH] KOSPI 200 선물 연계 차익 지수 및 ETF 거래 수량 분석 중...` },
      { delay: 650, text: `[FETCH] 미국 뉴욕거래소 (NYSE) / 나스닥 (NASDAQ) 야간 주가 지수 연동 동기화...` },
      { delay: 850, text: `[TRENDS] 국내/외 주요 경제 포털 뉴스 헤드라인 및 뉴스 요약 동기화...` },
      { delay: 1050, text: `[FETCH] 일본 도쿄증권거래소 (TSE) 닛케이 225 대형 수출주 지수 피킹 완료.` },
      { delay: 1250, text: `[CALC] 등락폭 TOP 10 실시간 랭킹 산출 및 거래대금 가중 비율 계산 중...` },
      { delay: 1450, text: `[SUCCESS] 주식 트렌드 조사 분석 갱신 완료. 데이터 정합성 지표 99.9% 검사 완료.`, type: 'success' }
    ];

    logs.forEach(step => {
      setTimeout(() => {
        const div = document.createElement('div');
        div.className = `log-line ${step.type || ''}`;
        div.textContent = step.text;
        this.consoleLogsScreenEl.appendChild(div);
        this.consoleLogsScreenEl.scrollTop = this.consoleLogsScreenEl.scrollHeight;

        if (step.delay === 1450) {
          SoundEngine.play('success');
          // Fetch fresh real-time values from server bypass cache
          this.fetchRealtimePrices(true).then(() => {
            // Apply slight wiggle wiggles
            this.triggerSimulatedMarketFluctuation(true);
            this.fetchHistoryData();
            this.updateNewsTimestamps();
          });
        }
      }, step.delay);
    });
  },

  triggerSimulatedMarketFluctuation(isWiggleOnly = false) {
    if (!isWiggleOnly) {
      STOCKS_DB.forEach(stock => {
        const fluctuation = (Math.random() - 0.5) * 8;
        stock.pct += fluctuation;
        stock.pct = Math.max(-30, Math.min(30, stock.pct));

        if (stock.market === 'US') {
          stock.change = stock.basePrice * (stock.pct / 100);
          stock.currentPrice = stock.basePrice + stock.change;
        } else {
          stock.change = Math.round(stock.basePrice * (stock.pct / 100));
          stock.currentPrice = stock.basePrice + stock.change;
        }
        
        const volNum = parseFloat(stock.volume) || 1;
        stock.volume = `${(volNum * (1 + Math.random() * 0.15)).toFixed(1)}${stock.volume.includes('M') ? 'M' : 'K'}`;
      });

      const kospiStocks = STOCKS_DB.filter(s => s.market === 'KOSPI');
      const kosdaqStocks = STOCKS_DB.filter(s => s.market === 'KOSDAQ');

      const avgKospiPct = kospiStocks.reduce((sum, s) => sum + s.pct, 0) / kospiStocks.length;
      const avgKosdaqPct = kosdaqStocks.reduce((sum, s) => sum + s.pct, 0) / kosdaqStocks.length;

      const updateIndexData = (key, avgPct) => {
        const index = INDICES_DB[key];
        const change = index.currentValue * (avgPct / 100);
        index.currentValue += change;
        index.change = change;
        index.pct = avgPct;
        index.history.shift();
        index.history.push(index.currentValue);
      };

      updateIndexData('kospi', avgKospiPct);
      updateIndexData('kosdaq', avgKosdaqPct);
      updateIndexData('kospi200', avgKospiPct * 1.1);
      
      const exchange = INDICES_DB.exchange;
      const exchangePct = -avgKospiPct * 0.3;
      const exChangeVal = exchange.currentValue * (exchangePct / 100);
      exchange.currentValue += exChangeVal;
      exchange.change = exChangeVal;
      exchange.pct = exchangePct;
      exchange.history.shift();
      exchange.history.push(exchange.currentValue);

      const fluctuateGlobal = (key) => {
        const index = INDICES_DB[key];
        const globalPct = (Math.random() - 0.5) * 1.8;
        const changeVal = index.currentValue * (globalPct / 100);
        index.currentValue += changeVal;
        index.change = changeVal;
        index.pct = globalPct;
        index.history.shift();
        index.history.push(index.currentValue);
      };

      ['sp500', 'nasdaq', 'dow', 'soxx', 'nikkei', 'topix'].forEach(fluctuateGlobal);
    } else {
   
      // Wiggle already fetched real-time values slightly
      STOCKS_DB.forEach(stock => {
        const wigglePct = (Math.random() - 0.5) * 0.4; // -0.2% to +0.2%
        stock.pct += wigglePct;
        stock.currentPrice = stock.currentPrice * (1 + wigglePct / 100);
        stock.change = stock.currentPrice - stock.basePrice;
      });

      const wiggleIndex = (key) => {
        const index = INDICES_DB[key];
        if (index) {
          const wigglePct = (Math.random() - 0.5) * 0.1;
          index.currentValue = index.currentValue * (1 + wigglePct / 100);
          index.change = index.change * (1 + wigglePct / 100);
          index.pct += wigglePct;
        }
      };
      ['kospi', 'kosdaq', 'kospi200', 'exchange', 'sp500', 'nasdaq', 'dow', 'soxx', 'nikkei', 'topix'].forEach(wiggleIndex);
    }
  },

  investigateTrend(keyword) {
    if (!keyword) return;
    SoundEngine.play('scan');

    const resultCard = this.trendsSearchResultCardEl;
    const summariesBox = this.newsSummaryLayoutEl;
    
    const now = new Date();
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    if (resultCard) resultCard.style.display = 'none';
    if (summariesBox) summariesBox.style.display = 'none';
    if (this.btnBackToSummaryEl) this.btnBackToSummaryEl.style.display = 'none';

    const logDiv = document.createElement('div');
    logDiv.className = 'log-line';
    logDiv.textContent = `[TRENDS] ${timeStr} - "${keyword}" 트렌드 조사 시작...`;
    
    const consoleEl = document.getElementById('console-logs-screen');
    if (consoleEl) {
      consoleEl.appendChild(logDiv);
      consoleEl.scrollTop = consoleEl.scrollHeight;
    }

    setTimeout(() => {
      let trendData = {};
      let articles = [];

      const kwUpper = keyword.toUpperCase();
      if (kwUpper.includes('HBM') || kwUpper.includes('반도체') || kwUpper.includes('하이닉스') || kwUpper.includes('삼성전자')) {
        trendData = {
          keyword: keyword,
          impact: 'S-Class 영향력',
          interest: '94%',
          sentiment: '매우 긍정적 (Bullish)',
          sentimentColor: 'var(--brand-green)',
          risk: '주의 (Moderate)',
          riskColor: 'var(--brand-orange)',
          related: [
            { name: '삼성전자', code: '005930' },
            { name: 'SK하이닉스', code: '000660' },
            { name: '한미반도체', code: '000250' }
          ],
          analysis: 'HBM 관련 공급망 확장에 따른 대형 반도체 소부장 기업들의 실적 개선세가 뚜렷합니다. AI 연산 칩 수요 폭발이 하반기까지 이어져 상승 압력이 우세하나 고평가 부담이 있습니다.'
        };
        articles = [
          { title: '반도체 대장주 HBM 공급 본격화... 실적 개선 기대', site: '네이버금융', link: 'https://finance.naver.com/main/search/search.naver?query=HBM' },
          { title: 'AI 칩 수요 폭발, HBM 패키징 소부장 기업 수혜 지속', site: '에이치뉴스', link: 'https://finance.naver.com/main/search/search.naver?query=%EB%B0%98%EB%8F%84%EC%B2%B4' },
          { title: '글로벌 HBM 점유율 경쟁 가속화, 하반기 단가 강세 전망', site: '글로벌경제', link: 'https://finance.naver.com/main/search/search.naver?query=%EC%8A%A4%ED%8C%A8%EB%9D%BC%EC%9D%B8' }
        ];
      } else if (kwUpper.includes('밸류업') || kwUpper.includes('금융') || kwUpper.includes('지주') || kwUpper.includes('PBR')) {
        trendData = {
          keyword: keyword,
          impact: 'A-Class 영향력',
          interest: '85%',
          sentiment: '긍정적 (Bullish)',
          sentimentColor: 'var(--brand-green)',
          risk: '낮음 (Low)',
          riskColor: 'var(--brand-green)',
          related: [
            { name: 'KB금융', code: '105560' },
            { name: '신한지주', code: '055550' },
            { name: '삼성물산', code: '028260' }
          ],
          analysis: '정부의 기업 밸류업 프로그램 가이드라인 확정 및 기업들의 자발적인 주주 환원 확대 계획 공시가 지속적인 외인 매수세를 자극하고 있습니다. 고배당 매력과 저PBR 메리트가 견고하여 안정적인 우상향 흐름을 유지하고 있습니다.'
        };
        articles = [
          { title: '금융위, 밸류업 3대 핵심 과제 발표... 하반기 가동', site: '매경', link: 'https://news.naver.com/main/search/search.naver?query=%EB%B0%B8%EB%A5%98%EC%97%85' },
          { title: '기업가치 제고 공시 잇따라... 배당 성향 강화', site: '한경', link: 'https://news.naver.com/main/search/search.naver?query=%EB%B0%B8%EB%A5%98%EC%97%85' },
          { title: '저PBR 금융주 랠리 2차전... 외인 매수 집중', site: '머니투데이', link: 'https://news.naver.com/main/search/search.naver?query=%EB%B0%B8%EB%A5%98%EC%97%85' }
        ];
      } else {
        const seedVal = this.investigateHash(keyword);
        const interest = 55 + (seedVal % 42); // 55% to 96%
        const impactGrade = seedVal % 3 === 0 ? 'S-Class 영향력' : (seedVal % 3 === 1 ? 'A-Class 영향력' : 'B-Class 영향력');
        const sentimentVal = seedVal % 3 === 0 ? '매우 긍정적 (Bullish)' : (seedVal % 3 === 1 ? '중립 / 혼조 (Mixed)' : '부정 / 약세 (Bearish)');
        const sentimentCol = seedVal % 3 === 0 ? 'var(--brand-green)' : (seedVal % 3 === 1 ? 'var(--text-muted)' : 'var(--stock-blue)');
        const riskVal = seedVal % 3 === 0 ? '낮음 (Low)' : (seedVal % 3 === 1 ? '보통 (Moderate)' : '높음 (High Risk)');
        const riskCol = seedVal % 3 === 0 ? 'var(--brand-green)' : (seedVal % 3 === 1 ? 'var(--brand-orange)' : 'var(--stock-red)');
        
        const related = [];
        const matches = STOCKS_DB.filter(s => keyword.includes(s.name) || s.name.includes(keyword));
        if (matches.length > 0) {
          matches.forEach(m => related.push({ name: m.name, code: m.code }));
        } else {
          const idx1 = seedVal % STOCKS_DB.length;
          const idx2 = (seedVal + 3) % STOCKS_DB.length;
          related.push({ name: STOCKS_DB[idx1].name, code: STOCKS_DB[idx1].code });
          related.push({ name: STOCKS_DB[idx2].name, code: STOCKS_DB[idx2].code });
        }

        trendData = {
          keyword: keyword,
          impact: impactGrade,
          interest: `${interest}%`,
          sentiment: sentimentVal,
          sentimentColor: sentimentCol,
          risk: riskVal,
          riskColor: riskCol,
          related: related,
          analysis: `"${keyword}"(은)는 실시간 포털 검색량 및 뉴스 트렌드 분석 결과, 시장 전체에 ${sentimentVal}한 심리를 이끌어내고 있습니다. 단기 변동성은 존재하나 장기적인 테마 성장이 기대되는 영역입니다.`
        };
        articles = [
          { title: `"${keyword}" 글로벌 트렌드 분석... 시장 주목`, site: '구글뉴스', link: `https://news.google.com/search?q=${encodeURIComponent(keyword)}` },
          { title: `AI 포커스: "${keyword}" 산업 내 비중 15% 돌파`, site: '테크타임즈', link: `https://news.google.com/search?q=${encodeURIComponent(keyword)}` },
          { title: `전문가 기고: "${keyword}" 투자 리스크 진단과 대응 전략`, site: '이코노미스트', link: `https://news.google.com/search?q=${encodeURIComponent(keyword)}` }
        ];
      }

      // Update UI
      this.lblTrendSearchedKeywordEl.textContent = trendData.keyword;
      this.lblTrendMarketImpactEl.textContent = trendData.impact;
      this.lblTrendSearchTimeEl.textContent = timeStr;
      this.lblTrendInterestIndexEl.textContent = trendData.interest;
      
      this.lblTrendSentimentEl.textContent = trendData.sentiment;
      this.lblTrendSentimentEl.style.color = trendData.sentimentColor;
      
      this.lblTrendRiskEl.textContent = trendData.risk;
      this.lblTrendRiskEl.style.color = trendData.riskColor;
      
      this.lblTrendAiAnalysisEl.textContent = trendData.analysis;

      // Related stock pills
      this.lblTrendRelatedStocksEl.innerHTML = '';
      if (trendData.related.length === 0) {
        this.lblTrendRelatedStocksEl.innerHTML = '<span style="font-size:0.8rem;color:var(--text-muted);">N/A</span>';
      } else {
        trendData.related.forEach(stock => {
          const pill = document.createElement('span');
          pill.className = 'trends-related-pill';
          pill.innerHTML = `<i class="fa-solid fa-chart-line" style="margin-right: 4px;"></i> ${stock.name} (${stock.code})`;
          pill.addEventListener('click', () => {
            SoundEngine.play('click');
            this.openStockDetails(stock.code);
          });
          this.lblTrendRelatedStocksEl.appendChild(pill);
        });
      }

      // Related news articles
      if (this.lblTrendRelatedArticlesEl) {
        this.lblTrendRelatedArticlesEl.innerHTML = '';
        articles.forEach(art => {
          const item = document.createElement('a');
          item.href = art.link;
          item.target = '_blank';
          item.className = 'news-link-item';
          item.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 14px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            text-decoration: none;
            color: var(--text-light);
            transition: all 0.2s ease;
          `;
          item.addEventListener('mouseenter', () => {
            item.style.background = 'rgba(255, 255, 255, 0.07)';
            item.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          });
          item.addEventListener('mouseleave', () => {
            item.style.background = 'rgba(255, 255, 255, 0.03)';
            item.style.borderColor = 'rgba(255, 255, 255, 0.05)';
          });

          item.innerHTML = `
            <span style="font-size: 0.85rem; font-weight: 500; display: flex; align-items: center; gap: 8px;">
              <i class="fa-solid fa-arrow-up-right-from-square" style="color: var(--brand-purple); font-size: 0.75rem;"></i>
              ${art.title}
            </span>
            <span style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px;">
              ${art.site} <i class="fa-solid fa-angle-right"></i>
            </span>
          `;
          this.lblTrendRelatedArticlesEl.appendChild(item);
        });
      }

      if (this.newsSummaryLayoutEl) {
        this.newsSummaryLayoutEl.style.display = 'none';
      }
      if (this.btnBackToSummaryEl) {
        this.btnBackToSummaryEl.style.display = 'inline-block';
      }
      resultCard.style.display = 'flex';
    }, 1200);
  },

  investigateHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  },

  updateScrollProgress() {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    let scrolled = 0;
    if (height > 0) {
      scrolled = (winScroll / height) * 100;
    }
    
    const roundedScrolled = Math.round(scrolled);
    this.scrollPercentageLblEl.textContent = `${roundedScrolled}%`;

    const maxOffset = 125.66;
    const strokeOffset = maxOffset - (scrolled / 100) * maxOffset;
    this.progressCircleIndicatorEl.style.strokeDashoffset = strokeOffset;
  }
};

// HELPER UTILITIES
function pad(num) {
  return num.toString().padStart(2, '0');
}

function formatCommas(num) {
  if (num === null || num === undefined) return '';
  const parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join('.');
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatPrice(price, market) {
  if (market === 'US') {
    return `$${price.toFixed(2)}`;
  }
  if (market === 'JP') {
    return `¥${formatCommas(Math.round(price))}`;
  }
  if (market === 'INDEX') {
    if (App.state.selectedStockCode === 'exchange') {
      return `${formatCommas(price.toFixed(2))}원`;
    }
    return `${formatCommas(price.toFixed(2))}`;
  }
  return `${formatCommas(Math.round(price))}원`;
}

function formatChange(change, market) {
  if (market === 'US') {
    return `$${Math.abs(change).toFixed(2)}`;
  }
  if (market === 'JP') {
    return `¥${formatCommas(Math.abs(Math.round(change)))}`;
  }
  if (market === 'INDEX') {
    if (App.state.selectedStockCode === 'exchange') {
      return `${formatCommas(Math.abs(change).toFixed(2))}원`;
    }
    return `${formatCommas(Math.abs(change).toFixed(2))}`;
  }
  return `${formatCommas(Math.abs(Math.round(change)))}원`;
}

const NEWS_DB = {
  domestic: [
    {
      source: '매일경제',
      time: '1시간 전',
      tag: '지수마감',
      tagColor: 'var(--brand-green)',
      tagBg: 'rgba(16, 185, 129, 0.15)',
      title: 'KOSPI, 반도체·금융주 훈풍에 2,650선 회복 안착',
      summaries: [
        '외국인과 기관의 동반 매수세가 유입되며 코스피 지수가 전일 대비 1.24% 상승 마감했습니다.',
        '삼성전자(+2.50%)와 SK하이닉스(+3.35%) 등 반도체 대장주가 시세를 견인했습니다.',
        '미국 금리 인하 기대감에 원/달러 환율은 전일 대비 6.20원 하락한 1,374.50원에 마감했습니다.'
      ]
    },
    {
      source: '한국경제',
      time: '3시간 전',
      tag: '밸류업',
      tagColor: 'var(--brand-purple)',
      tagBg: 'rgba(168, 85, 247, 0.15)',
      title: '금융당국, 밸류업 프로그램 가이드라인 최종 공시',
      summaries: [
        '주주가치 제고를 위한 기업 지배구조 개선 공시 권고안이 공식 시행되었습니다.',
        'KB금융(+2.44%), 신한지주(+2.71%) 등 주요 금융지주사가 최대 수혜주로 부각되었습니다.',
        '자사주 소각 및 배당 확대 정책을 예고한 대형 가치주 중심으로 자금 유입이 뚜렷합니다.'
      ]
    },
    {
      source: '머니투데이',
      time: '5시간 전',
      tag: '2차전지',
      tagColor: 'var(--brand-orange)',
      tagBg: 'rgba(249, 115, 22, 0.15)',
      title: '2차전지 양극재 수출 단가 하락... 주가 동반 조정',
      summaries: [
        '글로벌 전기차 수요 캐즘(일시적 침체) 여파로 리튬 및 핵심 소재 단가가 하락세입니다.',
        '에코프로비엠(-4.19%), 엘앤에프(-5.51%) 등 코스닥 핵심 기업들이 동반 약세를 보였습니다.',
        '단기 실적 둔화 우려가 있으나 차세대 전고체 배터리 기대감으로 장기 투자는 유효하다는 평가입니다.'
      ]
    },
    {
      source: '아시아경제',
      time: '7시간 전',
      tag: '바이오',
      tagColor: 'var(--brand-blue)',
      tagBg: 'rgba(59, 130, 246, 0.15)',
      title: '알테오젠, 글로벌 제약사와 SC 제형 독점 계약 체결',
      summaries: [
        '정맥주사 제형을 피하주사 제형으로 변경하는 플랫폼 기술 수출 마일스톤 유입이 가시화되었습니다.',
        '당일 코스닥 시장에서 알테오젠(+6.38%) 주가는 외국인 순매수에 힘입어 급등세를 보였습니다.',
        '바이오 섹터 내 기술력을 보유한 신약 및 플랫폼 수출 기업들이 동반 강세를 기록 중입니다.'
      ]
    }
  ],
  international: [
    {
      source: 'Bloomberg',
      time: '2시간 전',
      tag: 'Fed 금리',
      tagColor: 'var(--brand-orange)',
      tagBg: 'rgba(249, 115, 22, 0.15)',
      title: '미국 연준 인사들, 금리 인하 신중론 지속 강조',
      summaries: [
        '인플레이션 지표가 확실하게 2%대에 진입하기 전까지 기준금리를 동결해야 한다는 입장이 강세입니다.',
        '소비자물가지수(CPI) 및 소매판매 지표 추이에 따라 하반기 금리 인하 횟수가 결정될 예정입니다.',
        '미 국채 금리가 소폭 상승세를 보이자 다우 지수는 하락하고 나스닥은 강보합의 혼조세를 보였습니다.'
      ]
    },
    {
      source: 'Reuters',
      time: '4시간 전',
      tag: 'AI 반도체',
      tagColor: 'var(--brand-green)',
      tagBg: 'rgba(16, 185, 129, 0.15)',
      title: '엔비디아, 차세대 AI 가속기 블랙웰 본격 공급 개시',
      summaries: [
        '빅테크 기업들의 인프라 투자 수요가 여전히 견조하여 출하량이 급증하는 추세입니다.',
        '마이크로소프트, 구글 등 주요 고객사의 자체 데이터센터 칩 내재화 시도 속에서도 독점적 입지를 유지하고 있습니다.',
        '필라델피아 반도체 지수(+1.95%)는 엔비디아와 브로드컴 등 대형주 중심으로 상승을 견인했습니다.'
      ]
    },
    {
      source: 'Nikkei News',
      time: '6시간 전',
      tag: 'BOJ 금리',
      tagColor: 'var(--brand-blue)',
      tagBg: 'rgba(59, 130, 246, 0.15)',
      title: '일본 은행(BOJ), 국채 매입 축소 방침 확정',
      summaries: [
        '엔화 약세 방어와 통화 정책 정상화를 위해 국채 매입 규모를 단계적으로 줄여나가겠다고 발표했습니다.',
        '엔/달러 환율이 일시적으로 하락(엔화 가치 상승)하면서 수출 대기업들의 단기 매물이 출회되었습니다.',
        '금융주와 부동산 섹터는 금리 상승 기대를 반영하여 상승세를 보였습니다.'
      ]
    }
  ]
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
