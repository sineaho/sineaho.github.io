// CineAHO Saju Destiny Analyst App Engine

// 전통 명리학 데이터 상수 정의
const STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const STEMS_HAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const STEMS_ELEM = ['wood', 'wood', 'fire', 'fire', 'earth', 'earth', 'metal', 'metal', 'water', 'water'];
const STEMS_YNYG = ['yang', 'yin', 'yang', 'yin', 'yang', 'yin', 'yang', 'yin', 'yang', 'yin'];

const BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
const BRANCHES_HAN = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const BRANCHES_ELEM = ['water', 'earth', 'wood', 'wood', 'earth', 'fire', 'fire', 'earth', 'metal', 'metal', 'earth', 'water'];
const BRANCHES_YNYG = ['yang', 'yin', 'yang', 'yin', 'yang', 'yin', 'yang', 'yin', 'yang', 'yin', 'yang', 'yin'];
const BRANCHES_ANIMAL = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];

// 12지 장간(지장간) 및 오행 기본 정보
const ELEM_KOREAN = {
  wood: { name: '목(木)', korName: '나무', color: '#10b981', class: 'col-wood' },
  fire: { name: '화(火)', korName: '불', color: '#ef4444', class: 'col-fire' },
  earth: { name: '토(土)', korName: '흙', color: '#f59e0b', class: 'col-earth' },
  metal: { name: '금(金)', korName: '쇠', color: '#cbd5e1', class: 'col-metal' },
  water: { name: '수(水)', korName: '물', color: '#3b82f6', class: 'col-water' }
};

// 십신 관계 정의용 오행 상생상극 데이터
const ELEM_RELATION = {
  // [나의 오행][상대 오행] -> 'same'(비겁), '생함'(식상), '극함'(재성), '극당함'(관성), '생받음'(인성)
  wood: { wood: 'same', fire: 'give', earth: 'control', metal: 'controlled', water: 'get' },
  fire: { fire: 'same', earth: 'give', metal: 'control', water: 'controlled', wood: 'get' },
  earth: { earth: 'same', metal: 'give', water: 'control', wood: 'controlled', fire: 'get' },
  metal: { metal: 'same', water: 'give', wood: 'control', fire: 'controlled', earth: 'get' },
  water: { water: 'same', wood: 'give', fire: 'control', earth: 'controlled', metal: 'get' }
};

// 글로벌 상태 변수
let selectedSolarLunar = 'solar';
let selectedGender = 'male';
let selectedTimeChip = null;

// ----------------------------------------------------
// 1. 만세력 코어 연산 엔진 (Saju Destiny Engine)
// ----------------------------------------------------

// 24절기 개략적 일자 테이블 (매년 유사한 범위에 드는 간이 절기 보정 기법)
// 월별 절기 든 날짜 (입춘, 경칩, 청명, 입하, 망종, 소서, 입추, 백로, 한로, 입동, 대설, 소한)
const JEOLGI_MONTHS = [
  { month: 2, day: 4, name: '입춘' },
  { month: 3, day: 5, name: '경칩' },
  { month: 4, day: 5, name: '청명' },
  { month: 5, day: 5, name: '입하' },
  { month: 6, day: 5, name: '망종' },
  { month: 7, day: 7, name: '소서' },
  { month: 8, day: 7, name: '입추' },
  { month: 9, day: 7, name: '백로' },
  { month: 10, day: 8, name: '한로' },
  { month: 11, day: 7, name: '입동' },
  { month: 12, day: 7, name: '대설' },
  { month: 1, day: 5, name: '소한' }
];

// 기산점 기준(1900년 1월 31일 = 경자년 정축월 갑술일) 경과일수 계산식
function getElapsedDays(y, m, d) {
  const baseDate = new Date(1900, 0, 31); // 1900.01.31
  const targetDate = new Date(y, m - 1, d);
  const diffTime = targetDate.getTime() - baseDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// 60갑자 사주 명식 산출 함수
function calculateSaju(year, month, day, hour, minute, options) {
  // 절기 기반 월 변동 보정 처리
  // 명리학적 연도의 시작은 양력 2월 4~5일 입춘 시점입니다.
  let isBeforeIpchun = false;
  if (month === 1 || (month === 2 && day < 4)) {
    isBeforeIpchun = true; // 2월 입춘 이전 출생이면 전년도 연도로 간주
  }

  // 1. 연주 (年柱)
  const sajuYear = isBeforeIpchun ? year - 1 : year;
  // 1900년은 경자년 (60갑자 중 37번째)
  // 4를 빼서 갑자년 기준으로 정렬
  const yearOffset = (sajuYear - 4) % 60;
  const yeonStemIdx = yearOffset % 10;
  const yeonBranchIdx = yearOffset % 12;

  // 2. 월주 (月柱)
  // 절기 보정을 적용한 간지 결정
  // 입춘(2월) -> 寅, 경칩(3월) -> 卯, 청명(4월) -> 辰 ...
  let sajuMonth = month;
  let jeolgi = JEOLGI_MONTHS.find(jg => jg.month === month);
  if (jeolgi && day < jeolgi.day) {
    sajuMonth = month - 1;
    if (sajuMonth === 0) sajuMonth = 12;
  }

  // 월의 지지는 고정되어 있음 (소한 1월: 丑 ~ 대설 12월: 子)
  // 입춘(양력 2월)은 寅월이 됨
  const branchOffsets = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // 축 인 묘 진 사 오 미 신 유 술 해 자
  const wolBranchIdx = branchOffsets[sajuMonth - 1];

  // 월의 천간은 연도 천간에 따라 결정됨 (월건법)
  // 연간이 甲/己 이면 월간은 丙인묘로 시작
  const wolStemStartIdx = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0][yeonStemIdx];
  const wolStemIdx = (wolStemStartIdx + (sajuMonth - 2 + 12) % 12) % 10;

  // 3. 일주 (日柱)
  let elapsed = getElapsedDays(year, month, day);
  
  // 야자시(夜子時) 보정: 밤 23:30 ~ 24:00 구간이고 옵션이 야자시일 경우
  // 일간은 당일 일간을 그대로 쓰되 시주는 다음날 자시를 적용
  let sajuDayOffset = elapsed;
  const isJasiLate = (hour === 23 && minute >= 30);
  
  if (isJasiLate && options.jasiType === 'ya') {
    // 야자시는 일간은 당일, 시주만 익일 자시
  } else if (isJasiLate && options.jasiType === 'dong') {
    // 동자시는 일간 자체를 익일(다음날)로 넘김
    sajuDayOffset = elapsed + 1;
  }

  // 1900년 1월 31일은 갑술일 (갑=0, 술=10)
  const ilStemIdx = (0 + sajuDayOffset) % 10;
  const ilBranchIdx = (10 + sajuDayOffset) % 12;

  // 4. 시주 (時柱)
  let siStemIdx = 0;
  let siBranchIdx = 0;

  if (options.timeUnknown) {
    siStemIdx = -1;
    siBranchIdx = -1;
  } else {
    // 출생 시각에 따른 지지 결정 (23:30 ~ 01:30 -> 子시)
    let adjustedHour = hour;
    let adjustedMin = minute;

    // 진태양시 정밀 계산 시 동경 127.5도 기준 보정 적용 (서울 기준 약 -32분 보정)
    if (options.calcBase === 'jintae') {
      adjustedMin -= 32;
      if (adjustedMin < 0) {
        adjustedMin += 60;
        adjustedHour -= 1;
      }
      if (adjustedHour < 0) adjustedHour += 24;
    }

    // 12시진 지지 구역 판정
    // 23:30~01:29 -> 子, 01:30~03:29 -> 丑, 03:30~05:29 -> 寅...
    let totalMinutes = adjustedHour * 60 + adjustedMin;
    let branchIdx = 0; // 자(子)시 기본

    if (totalMinutes >= 90 && totalMinutes < 210) branchIdx = 1;      // 丑 (01:30 ~ 03:29)
    else if (totalMinutes >= 210 && totalMinutes < 330) branchIdx = 2; // 寅 (03:30 ~ 05:29)
    else if (totalMinutes >= 330 && totalMinutes < 450) branchIdx = 3; // 卯 (05:30 ~ 07:29)
    else if (totalMinutes >= 450 && totalMinutes < 570) branchIdx = 4; // 辰 (07:30 ~ 09:29)
    else if (totalMinutes >= 570 && totalMinutes < 690) branchIdx = 5; // 巳 (09:30 ~ 11:29)
    else if (totalMinutes >= 690 && totalMinutes < 810) branchIdx = 6; // 午 (11:30 ~ 13:29)
    else if (totalMinutes >= 810 && totalMinutes < 930) branchIdx = 7; // 未 (13:30 ~ 15:29)
    else if (totalMinutes >= 930 && totalMinutes < 1050) branchIdx = 8;// 申 (15:30 ~ 17:29)
    else if (totalMinutes >= 1050 && totalMinutes < 1170) branchIdx = 9;// 酉 (17:30 ~ 19:29)
    else if (totalMinutes >= 1170 && totalMinutes < 1290) branchIdx = 10;// 戌 (19:30 ~ 21:29)
    else if (totalMinutes >= 1290 && totalMinutes < 1410) branchIdx = 11;// 亥 (21:30 ~ 23:29)
    else branchIdx = 0; // 子시 (23:30 ~ 01:29)

    siBranchIdx = branchIdx;

    // 시간 천간 결정 (시두법)
    // 일진 천간이 甲/己 이면 시천간은 甲자시로 시작
    const siStemStartIdx = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8][ilStemIdx];
    siStemIdx = (siStemStartIdx + siBranchIdx) % 10;
  }

  return {
    yeon: { stem: yeonStemIdx, branch: yeonBranchIdx },
    wol: { stem: wolStemIdx, branch: wolBranchIdx },
    il: { stem: ilStemIdx, branch: ilBranchIdx },
    si: { stem: siStemIdx, branch: siBranchIdx }
  };
}

// 일간(본원) 및 십신 판정 알고리즘
function getSajuGods(saju) {
  if (saju.si.stem === -1) return { si: '-', wol: '', yeon: '' };
  
  const ilganElem = STEMS_ELEM[saju.il.stem];
  const ilganYnyg = STEMS_YNYG[saju.il.stem];

  const getGodName = (targetStemIdx) => {
    const tarElem = STEMS_ELEM[targetStemIdx];
    const tarYnyg = STEMS_YNYG[targetStemIdx];
    const relation = ELEM_RELATION[ilganElem][tarElem];

    const isSameYnyg = (ilganYnyg === tarYnyg);

    if (relation === 'same') {
      return isSameYnyg ? '비견' : '겁재';
    } else if (relation === 'give') {
      return isSameYnyg ? '식신' : '상관';
    } else if (relation === 'control') {
      return isSameYnyg ? '편재' : '정재';
    } else if (relation === 'controlled') {
      return isSameYnyg ? '편관' : '정관';
    } else if (relation === 'get') {
      return isSameYnyg ? '편인' : '정인';
    }
    return '';
  };

  return {
    si: getGodName(saju.si.stem),
    wol: getGodName(saju.wol.stem),
    yeon: getGodName(saju.yeon.stem)
  };
}

// ----------------------------------------------------
// 2. 오행 기운 분석 및 신강/신약 판정
// ----------------------------------------------------

function calculateElements(saju) {
  const counts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const score = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

  const addPoint = (elem, isBranch, weight) => {
    counts[elem]++;
    score[elem] += weight;
  };

  // 명리학적 가중치 배정 (월지는 3점, 일지는 2점, 나머지는 1점)
  // 월지는 계절의 지배자로 기운의 지배 비중이 30%를 차지함
  addPoint(STEMS_ELEM[saju.yeon.stem], false, 1);
  addPoint(BRANCHES_ELEM[saju.yeon.branch], true, 1);
  
  addPoint(STEMS_ELEM[saju.wol.stem], false, 1);
  addPoint(BRANCHES_ELEM[saju.wol.branch], true, 3); // 월지 가중치 3
  
  addPoint(STEMS_ELEM[saju.il.stem], false, 1);
  addPoint(BRANCHES_ELEM[saju.il.branch], true, 2); // 일지 가중치 2

  if (saju.si.stem !== -1) {
    addPoint(STEMS_ELEM[saju.si.stem], false, 1);
    addPoint(BRANCHES_ELEM[saju.si.branch], true, 1);
  }

  // 신강/신약 판정
  // 내 기운(일간과 같은 오행 + 인성(나를 생해주는 오행))의 가중치 점수 합산
  const ilganElem = STEMS_ELEM[saju.il.stem];
  let selfStrength = score[ilganElem];
  
  // 인성 오행 찾기
  let motherElem = '';
  for (const key in ELEM_RELATION[ilganElem]) {
    if (ELEM_RELATION[ilganElem][key] === 'get') {
      motherElem = key;
      break;
    }
  }
  if (motherElem) {
    selfStrength += score[motherElem];
  }

  // 총점은 최대 10점 (시주 없을 시 8점)
  const totalScore = saju.si.stem !== -1 ? 10 : 8;
  const strengthRatio = selfStrength / totalScore;
  
  let strengthText = '';
  if (strengthRatio >= 0.6) {
    strengthText = '중화 신강(身强) 사주 - 자신의 주체성이 뚜렷하고 기운이 굳건하여 능히 재물과 관성을 제어할 힘이 있습니다.';
  } else if (strengthRatio >= 0.45) {
    strengthText = '중화 평평(平平) 사주 - 기운의 음양오행 균형이 매우 조화롭게 잡힌 사주로, 인생사 굴곡이 적고 무탈한 조화가 강점입니다.';
  } else {
    strengthText = '중화 신약(身弱) 사주 - 일간의 기운이 약해 주변 인성(부모/학문)과 비겁(동료)의 기운을 보강하는 용신 작용이 필요합니다.';
  }

  return { counts, score, strengthText };
}

// ----------------------------------------------------
// 3. AI 기반 사주 풀이 에디토리얼 리포트 생성기
// ----------------------------------------------------

const ILGAN_PROFILES = {
  '갑': '갑목(甲木) - 대지를 뚫고 굳세게 치솟는 아름드리 소나무의 기상입니다. 리더십이 뛰어나고 정직하지만 고집이 다소 셀 수 있습니다.',
  '을': '을목(乙木) - 척박한 바위 틈에서도 꽃을 피워내는 부드럽고 유연한 담쟁이 넝쿨의 기상입니다. 생명력과 적응력이 뛰어나며 대인관계가 유연합니다.',
  '병': '병화(丙火) - 온 세상을 조건 없이 비추는 찬란하고 정열적인 태양의 기운입니다. 화끈하고 공평무사하며, 화려한 표현력이 장점이나 성격이 급할 수 있습니다.',
  '정': '정화(丁火) - 어두운 방안을 은은하게 밝히는 등불이나 화롯불의 기운입니다. 내면이 따뜻하고 사려 깊으며 예의 바르나 한 번 토라지면 매섭습니다.',
  '무': '무토(戊土) - 광활한 대지와 태산처럼 묵직하고 신용이 두터운 기운입니다. 포용력이 크고 흔들림이 없으나, 고집이 황소고집이라 타협이 어려울 때가 있습니다.',
  '기': '기토(己土) - 만물을 길러내는 비옥한 정원이나 논밭의 온화한 기운입니다. 세심하고 어머니 같은 모성애와 실속이 강하지만 소심해지기 쉽습니다.',
  '경': '경화': '경금(庚金) - 제련되지 않은 거친 원석이나 예리한 칼날의 기운입니다. 결단력이 굳건하고 의리가 투철하며 공사를 칼같이 가르나 냉정하다는 오해를 사기도 합니다.',
  '경': '경금(庚金) - 제련되지 않은 거친 원석이나 예리한 칼날의 기운입니다. 결단력이 굳건하고 의리가 투철하며 공사를 칼같이 가르나 냉정하다는 오해를 사기도 합니다.',
  '신': '신금(辛金) - 제련을 마친 섬세하고 날카로운 보석 및 침(針)의 기운입니다. 미적 감각이 뛰어나고 총명하며 칼같이 예리하나 자존심이 매우 강해 상처를 쉽게 받습니다.',
  '임': '임수(壬水) - 도도히 흐르는 거대한 강물이나 깊고 넓은 바다의 기운입니다. 총명하고 지혜로우며 융통성이 무궁무진하나 속내를 쉽게 알 수 없는 신비로움이 있습니다.',
  '계': '계수(癸水) - 대지를 촉촉이 적셔주는 맑은 이슬비나 샘물의 기운입니다. 감수성이 풍부하고 지혜로우며 임기응변에 강하나 신경이 예민해지기 쉽습니다.'
};

function generateAIReport(saju, elemAnalysis) {
  const ilgan = STEMS[saju.il.stem];
  const profile = ILGAN_PROFILES[ilgan] || '';

  // 1) 종합 풀이
  const summaryHTML = `
    <h5>🔮 [종합 사주 풀이] 본원 타고난 명식</h5>
    <p>귀하의 타고난 일간은 <strong>${profile}</strong></p>
    <p>사주 내 오행의 흐름을 분석한 결과, <strong>${elemAnalysis.strengthText}</strong></p>
    <p>오행의 편중 상태를 보면, 사주 내에 가장 강한 기운은 <strong>${getDominantElement(elemAnalysis.score)}</strong>의 기운이며, 
    가장 결핍되거나 약한 기운은 <strong>${getWeakestElement(elemAnalysis.score)}</strong>입니다. 부족한 오행 기운을 일상 인테리어나 색상, 수양을 통해 보충하시는 개운법(開運法)을 권장합니다.</p>
  `;

  // 2) 재물운
  const wealthHTML = `
    <h5>💸 [평생 재물운 및 부의 크기]</h5>
    <p>사주 원국에서 재물(財星)의 상태를 스캔한 결과, 귀하의 사주에는 ${saju.il.stem % 2 === 0 ? '편재(사업적 횡재수) 기운이 발달하여 과감한 투자와 아이디어 창출을 통한 일확천금의 기회' : '정재(고정적인 월급적 재물) 기운이 뚜렷하여 근면 성실하게 저축하고 자산을 쪼개어 증식시키는 안정지향성'} 재물운이 형성되어 있습니다.</p>
    <p>특히 30대 중반 이후 들어오는 대운의 흐름에서 재성(財)을 돕는 기운이 강화되어 자산 가치의 큰 상승이 예견됩니다. 다만 충(沖)이 발생하는 해에는 투기성 투자를 삼가고 안정적인 부동산 자산으로 묶어두는 수성을 권장합니다.</p>
  `;

  // 3) 직업/적성운
  const jobHTML = `
    <h5>💼 [직업 적성 및 사회적 성취]</h5>
    <p>명리학적 격국을 분석한 결과, 귀하는 <strong>${elemAnalysis.strengthText.includes('신강') ? '식상생재격(자신의 재능과 아이디어를 발휘해 부를 창출하는 직업군)' : '관인상생격(조직이나 공직 사회에서 관직과 학문을 결합하여 신임을 얻는 직업군)'}</strong>에 가깝습니다.</p>
    <p>추천 직무 분야로는 ${ilgan === '갑' || ilgan === '을' ? '기획, 디자인, 교육, 콘텐츠 크리에이터 등 창조적 분야' : (ilgan === '병' || ilgan === '정' ? '홍보, 방송, IT 정보통신, 예술 분야' : '재무 회계, 공직, 행정 관리 및 중재 기술 전문가')}가 적합하며, 타인에게 구속받기보다는 주도적으로 전문성을 드러낼 수 있는 포지션에서 명예운이 발복합니다.</p>
  `;

  // 4) 연애/결혼운
  const loveHTML = `
    <h5>❤️ [연애·결혼 및 인연의 특징]</h5>
    <p>배우자 자리를 뜻하는 일지(日支)와 연애 기운을 상정하면, 귀하는 배우자와 친구처럼 격의 없이 소통하며 서로의 비전을 지지하는 동반자적 인연의 운을 타고났습니다.</p>
    <p>특히 ${selectedGender === 'male' ? '재성(財)이 배우자를 뜻하므로, 총명하고 재테크 수완이 좋은 현명한 조력자형 배우자' : '관성(官)이 배우자를 뜻하므로, 사회적 평판이 높고 책임감이 굳건한 듬직한 배우자'}와 백년가약을 맺을 복록이 있습니다. 2026년 병오(丙午)년 하반기에서 2027년 정미(丁美)년 사이에 강렬한 이성운이 동하므로 이 시기의 만남을 주목하시기 바랍니다.</p>
  `;

  // 5) 대운 흐름
  const daeunHTML = `
    <h5>📈 [10년 주기 대운(大運)의 방향]</h5>
    <p>귀하의 대운은 현재 10년 대운 주기의 안정적인 상승 궤도에 마운트되어 있습니다. 명리 오행 중 나를 이롭게 돕는 <strong>희신(喜神)</strong> 기운인 ${getWeakestElement(elemAnalysis.score)}의 계절적 대운으로 진입하고 있기 때문에, 과거에 꼬였던 계약이나 지연되었던 학업/승진 운이 빠르게 물꼬를 트게 됩니다.</p>
    <p>대운의 조후가 균형을 찾아감에 따라 건강상 기운도 활성화되며, 50대 이후에는 수확한 자산을 안정적으로 누리며 후학을 양성하거나 명예를 드높이는 안락한 노후 대운이 약속되어 있습니다.</p>
  `;

  return {
    summary: summaryHTML,
    wealth: wealthHTML,
    job: jobHTML,
    love: loveHTML,
    daeun: daeunHTML
  };
}

// 오행 가중치 중 최고 오행 이름
function getDominantElement(scores) {
  let maxKey = 'wood';
  for (const key in scores) {
    if (scores[key] > scores[maxKey]) maxKey = key;
  }
  return ELEM_KOREAN[maxKey].name;
}

// 오행 가중치 중 최소 오행 이름
function getWeakestElement(scores) {
  let minKey = 'wood';
  for (const key in scores) {
    if (scores[key] < scores[minKey]) minKey = key;
  }
  return ELEM_KOREAN[minKey].name;
}

// ----------------------------------------------------
// 4. UI 48개 빠른 시각 칩 생성 및 렌더러
// ----------------------------------------------------

function initQuickTimeGrid() {
  const grid = document.getElementById('quick-time-grid');
  if (!grid) return;

  grid.innerHTML = '';

  for (let h = 0; h < 24; h++) {
    for (let m = 0; m <= 30; m += 30) {
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      
      const chip = document.createElement('button');
      chip.className = 'btn-time-chip';
      chip.innerText = timeStr;
      chip.type = 'button';

      chip.addEventListener('click', () => {
        // 기존 활성화 해제
        document.querySelectorAll('.btn-time-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        // 입력 폼에 값 동기화
        document.getElementById('birth-hour').value = h;
        document.getElementById('birth-minute').value = m;

        // 시각 모름 체크박스 해제
        document.getElementById('chk-time-unknown').checked = false;
        document.getElementById('time-fields-row').style.opacity = '1';
        
        selectedTimeChip = timeStr;
      });

      grid.appendChild(chip);
    }
  }
}

// ----------------------------------------------------
// 5. 14단 아코디언 명리학 가이드 자동 생성
// ----------------------------------------------------

const ACCORDION_DATA = [
  {
    title: "1. 사주팔자란 무엇인가?",
    content: "사주팔자(四柱八字)는 사람이 태어난 연(年), 월(月), 일(日), 시(時)의 네 가지 기둥(사주)과 각 기둥마다 천간과 지지 두 글자씩 총 여덟 글자(팔자)로 이루어진 전통 역학의 기본 명식입니다. 이 명식은 태어난 순간 우주가 가졌던 음양오행의 기운을 담은 고유한 바코드와 같습니다."
  },
  {
    title: "2. 사주명리학의 역사와 유래",
    content: "사주명리학은 중국 주나라와 당나라 시대의 오행 사상에 뿌리를 두고 있으며, 송나라 때 서자평(徐子平) 선생에 의해 일간(일주 천간)을 사주의 주체(본원)로 삼는 자평명리학으로 집대성되었습니다. 현대의 사주학은 미신적 요소를 배제하고 우주적 자연주의와 심리학적 성향 분석을 융합한 성격/진로 예측 도구로 진화하고 있습니다."
  },
  {
    title: "3. 기본 개념 이해하기",
    content: "사주를 해독하는 첫걸음은 음양(陰陽)과 오행(五行)입니다. 세상의 모든 만물은 팽창(양)과 수축(음)의 순환 속에 있으며, 이는 목, 화, 토, 금, 수의 다섯 가지 물리적 기운(오행)으로 구체화됩니다. 사주는 이 기운들이 서로 돕는 상생(相生)과 통제하는 상극(相克)의 조화를 분석합니다."
  },
  {
    title: "4. 사주(四柱) 완벽 해설",
    content: "네 기둥은 인생의 시기적 단계를 대변합니다. 연주(年柱)는 초년운과 조상궁, 월주(月柱)는 청년운과 사회적 환경/부모궁, 일주(日柱)는 장년운과 자기 자신/배우자궁, 시주(時柱)는 말년운과 자식궁/자신의 내면을 상징합니다."
  },
  {
    title: "5. 오행(五行)의 이해",
    content: "목(木)은 시작과 성장의 기운(초록), 화(火)는 확산과 열정의 기운(빨강), 토(土)는 중재와 신용의 기운(노랑), 금(金)은 결단과 결실의 기운(흰색/회색), 수(水)는 지혜와 저장의 기운(파랑/검정)을 뜻합니다. 사주에 특정 오행이 많거나 적을 때 성격과 건강, 진로의 편중성이 생깁니다."
  },
  {
    title: "6. 십신(十神)과 육친",
    content: "십신은 일간(나)과 다른 글자들과의 오행 및 음양 관계를 인격화한 명리 용어입니다. 비견/겁재(나와 동등한 기운), 식신/상관(나의 재능 표출), 편재/정재(내가 다스리는 재물), 편관/정관(나를 제어하는 직장/규율), 편인/정인(나를 돕는 학문/어머니)으로 나뉘며 사회적 인간관계를 표상합니다."
  },
  {
    title: "7. 음양력과 만세력",
    content: "음력은 달의 위상 변화를 기준으로 하고 양력은 태양의 공전 주기를 따릅니다. 사주 명리학은 철저하게 태양의 움직임에 기반한 24절기(입춘, 경칩 등)를 기준으로 달(月)을 바꾸기 때문에 만세력(萬歲曆)이라는 특수한 도구를 통해 양음력 날짜를 사주 간지로 실시간 환산해야 합니다."
  },
  {
    title: "8. 대운(大運)과 세운(歲運)",
    content: "대운(大運)은 인생의 10년 주기로 바뀌는 거대한 계절적 환경(대운수 기준)을 뜻하며 '운이 크게 트인다'는 뜻보다는 '큰 흐름의 운'을 상징합니다. 세운(歲運)은 매년 바뀌는 연도별 운(예: 2026년은 병오년)으로, 대운이라는 큰 무대 위에서 세운이라는 사건사고가 연출되는 관계입니다."
  },
  {
    title: "9. 분석 유형별 해설",
    content: "사주 풀이는 주로 일간(본원)의 기운을 먼저 파악한 후, 사주 전체가 신강(기운이 강함)한지 신약(기운이 약함)한지를 나눕니다. 강한 사주는 식상과 재성으로 기운을 뿜어내는 것을 기뻐하고, 약한 사주는 인성과 비견으로 기운을 도우는 것을 길하게 여깁니다(용신법)."
  },
  {
    title: "10. 사주 결과 보는 법",
    content: "만세력 표에서 일간(일주 천간) 자리가 나의 본래 모습입니다. 그 외의 글자들이 일간을 돕는지 극하는지를 보며 주변 대인관계 및 부의 형성 경로를 파악합니다. 오행 기운 분석 게이지에서 한쪽 오행이 4개 이상으로 쏠려 있다면 과유불급의 조절이 필요한 상태입니다."
  },
  {
    title: "11. 앱 사용 방법",
    content: "양/음력 성별을 체크하고 생년월일을 숫자로 기입한 뒤, 시각을 아는 경우 48개 칩 중 가장 가까운 시각을 누르면 편하게 자동 입력됩니다. 시각을 아예 모를 경우 시각 모름에 체크하면 시주를 생략한 삼주(三柱)로 정밀 스캔하여 운세를 보여줍니다."
  },
  {
    title: "12. 출생 시각·지역 보정과 자시법(동자시·야자시·조자시)",
    content: "우리나라는 동경 135도 표준시를 쓰지만 실제 서울의 태양 남중 시간은 32분 정도 늦습니다. 따라서 진태양시 기준을 활성화하면 이 32분을 빼서 정확한 절기를 보정합니다. 자시법은 23:30 ~ 01:30 구간에 대해, 밤 23:30~24:00 출생을 당일의 일주로 볼 것인지(야자시), 다음날 일주로 넘길 것인지(동자시/조자시) 명리학적 취향에 맞게 선택할 수 있습니다."
  },
  {
    title: "13. 고급 명리학 개념",
    content: "고급 명리학에서는 천간 간의 합(合)과 지지 간의 삼합(三合), 방합(方合) 및 충(沖), 형(刑), 파(破), 해(害) 등을 분석합니다. 이러한 글자 간의 물리적 결합과 충돌은 특정 해(세운)에 강한 심경 변화나 계약, 이동수 등의 운명적 모멘텀을 형성하게 됩니다."
  },
  {
    title: "14. 자주 묻는 질문",
    content: "Q: 사주는 바꿀 수 없나요? A: 사주는 선천적인 우주적 기질(지도)일 뿐이며, 어떻게 행하느냐(후천적 선택과 대운의 활용)에 따라 부의 크기와 삶의 만족도는 무한히 확장할 수 있습니다. 사주는 결정론이 아니라 효율적인 인생 설계용 가이드라인입니다."
  }
];

function initGuideAccordion() {
  const container = document.getElementById('guide-accordion');
  if (!container) return;

  container.innerHTML = '';

  ACCORDION_DATA.forEach((item, idx) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'accordion-item';

    const headerBtn = document.createElement('button');
    headerBtn.className = 'acc-header';
    headerBtn.innerHTML = `<span>${item.title}</span><i class="fa-solid fa-chevron-down"></i>`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'acc-content';
    
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'acc-content-body';
    bodyDiv.innerText = item.content;

    contentDiv.appendChild(bodyDiv);
    itemDiv.appendChild(headerBtn);
    itemDiv.appendChild(contentDiv);

    headerBtn.addEventListener('click', () => {
      const isActive = itemDiv.classList.contains('active');
      
      // 다른 아코디언 항목 모두 닫기 (아코디언 연동)
      document.querySelectorAll('.accordion-item').forEach(el => {
        el.classList.remove('active');
        el.querySelector('.acc-content').style.maxHeight = null;
      });

      if (!isActive) {
        itemDiv.classList.add('active');
        contentDiv.style.maxHeight = contentDiv.scrollHeight + 'px';
      }
    });

    container.appendChild(itemDiv);
  });
}

// ----------------------------------------------------
// 6. 분석 진행 및 리포트 시각화
// ----------------------------------------------------

let currentReportTab = 'summary';
let reportData = {}; // 5대 탭별 리포트 데이터 캐시

const btnSubmitSaju = document.getElementById('btn-submit-saju');
const sajuResultsPanel = document.getElementById('saju-results-panel');

btnSubmitSaju.addEventListener('click', () => {
  const year = parseInt(document.getElementById('birth-year').value);
  const month = parseInt(document.getElementById('birth-month').value);
  const day = parseInt(document.getElementById('birth-day').value);
  
  const chkUnknown = document.getElementById('chk-time-unknown').checked;
  const hour = chkUnknown ? 12 : parseInt(document.getElementById('birth-hour').value);
  const minute = chkUnknown ? 0 : parseInt(document.getElementById('birth-minute').value);

  // 기본 유효성 검사
  if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
    alert('올바른 생년월일(연, 월, 일)을 기입해 주세요.');
    return;
  }

  // 1) 자시법 및 계산 기준 가져오기
  const calcBase = document.querySelector('input[name="calc-base"]:checked').value;
  const jasiType = document.querySelector('input[name="jasi-type"]:checked').value;

  const options = {
    timeUnknown: chkUnknown,
    calcBase,
    jasiType
  };

  // 2) 사주 명식 산출
  const saju = calculateSaju(year, month, day, hour, minute, options);

  // 3) 십신 계산
  const gods = getSajuGods(saju);

  // 4) 오행 분석
  const elemAnalysis = calculateElements(saju);

  // 5) UI 명식 표 렌더링
  renderSajuTableUI(saju, gods);

  // 6) 오행 게이지 렌더링
  renderElementsUI(elemAnalysis);

  // 7) AI 리포트 생성 및 초기 탭 표출
  reportData = generateAIReport(saju, elemAnalysis);
  switchReportTab('summary');

  // 8) 결과 패널 활성화 및 부드러운 스크롤 이동
  sajuResultsPanel.style.display = 'block';
  sajuResultsPanel.scrollIntoView({ behavior: 'smooth' });
});

// 결과 사주 명식 표 채우기
function renderSajuTableUI(saju, gods) {
  const fillCell = (idStem, idBranch, stemIdx, branchIdx, isSiEmpty) => {
    const stemCell = document.getElementById(idStem);
    const branchCell = document.getElementById(idBranch);

    if (isSiEmpty) {
      stemCell.innerText = '無';
      stemCell.className = '';
      branchCell.innerText = '無';
      branchCell.className = '';
      return;
    }

    const stemHan = STEMS_HAN[stemIdx];
    const stemKor = STEMS[stemIdx];
    const stemElem = STEMS_ELEM[stemIdx];

    const branchHan = BRANCHES_HAN[branchIdx];
    const branchKor = BRANCHES[branchIdx];
    const branchElem = BRANCHES_ELEM[branchIdx];
    const branchAnim = BRANCHES_ANIMAL[branchIdx];

    stemCell.innerHTML = `<span style="font-size:1.6rem;">${stemHan}</span><br><span style="font-size:0.8rem;font-weight:400;color:var(--text-muted);">${stemKor}</span>`;
    stemCell.className = ELEM_KOREAN[stemElem].class;

    branchCell.innerHTML = `<span style="font-size:1.6rem;">${branchHan}</span><br><span style="font-size:0.8rem;font-weight:400;color:var(--text-muted);">${branchKor}(${branchAnim})</span>`;
    branchCell.className = ELEM_KOREAN[branchElem].class;
  };

  const isSiEmpty = (saju.si.stem === -1);
  fillCell('stem-si', 'branch-si', saju.si.stem, saju.si.branch, isSiEmpty);
  fillCell('stem-il', 'branch-il', saju.il.stem, saju.il.branch, false);
  fillCell('stem-wol', 'branch-wol', saju.wol.stem, saju.wol.branch, false);
  fillCell('stem-yeon', 'branch-yeon', saju.yeon.stem, saju.yeon.branch, false);

  // 십신 렌더링
  document.getElementById('god-si').innerText = isSiEmpty ? '-' : gods.si;
  document.getElementById('god-wol').innerText = gods.wol;
  document.getElementById('god-yeon').innerText = gods.yeon;

  // 일간 분석 프로필 출력
  const profile = ILGAN_PROFILES[STEMS[saju.il.stem]];
  document.getElementById('ilgan-desc-box').innerHTML = `
    <strong>[나의 본원: ${STEMS[saju.il.stem]}일간]</strong><br>${profile}
  `;
}

// 오행 게이지 갱신
function renderElementsUI(elemAnalysis) {
  const updateBar = (idBar, idCount, type) => {
    const score = elemAnalysis.score[type];
    const maxScore = 10;
    const pct = (score / maxScore) * 100;
    
    document.getElementById(idBar).style.width = `${pct}%`;
    document.getElementById(idCount).innerText = `${elemAnalysis.counts[type]}개 (${score}점)`;
  };

  updateBar('bar-wood', 'count-wood', 'wood');
  updateBar('bar-fire', 'count-fire', 'fire');
  updateBar('bar-earth', 'count-earth', 'earth');
  updateBar('bar-metal', 'count-metal', 'metal');
  updateBar('bar-water', 'count-water', 'water');

  // 종합 기운 카드 문구
  document.getElementById('saju-strength-card').innerHTML = `
    <strong>[오행 신강/신약 진단]</strong><br>
    ${elemAnalysis.strengthText}
  `;
}

// AI 리포트 탭 스위치
function switchReportTab(tab) {
  currentReportTab = tab;
  
  // 탭 버튼 클래스 제어
  document.querySelectorAll('.rep-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  // 내용 출력
  const body = document.getElementById('report-content-body');
  if (body && reportData[tab]) {
    body.innerHTML = reportData[tab];
  }
}

// ----------------------------------------------------
// UI 제어 및 기타 토글 바인딩
// ----------------------------------------------------

// 양음력 토글
document.getElementById('btn-solar-lunar').addEventListener('click', (e) => {
  selectedSolarLunar = 'solar';
  document.getElementById('btn-solar-lunar').classList.add('active');
  document.getElementById('btn-lunar').classList.remove('active');
});

document.getElementById('btn-lunar').addEventListener('click', (e) => {
  selectedSolarLunar = 'lunar';
  document.getElementById('btn-lunar').classList.add('active');
  document.getElementById('btn-solar-lunar').classList.remove('active');
});

// 성별 토글
document.getElementById('btn-gender-m').addEventListener('click', () => {
  selectedGender = 'male';
  document.getElementById('btn-gender-m').classList.add('active');
  document.getElementById('btn-gender-f').classList.remove('active');
});

document.getElementById('btn-gender-f').addEventListener('click', () => {
  selectedGender = 'female';
  document.getElementById('btn-gender-f').classList.add('active');
  document.getElementById('btn-gender-m').classList.remove('active');
});

// 시각 모름 체크박스 연동 (시각 모름 체크 시 시각 입력 컨트롤 비활성화)
document.getElementById('chk-time-unknown').addEventListener('change', (e) => {
  const row = document.getElementById('time-fields-row');
  if (e.target.checked) {
    row.style.opacity = '0.35';
    // 빠른 시간 칩들도 활성화 취소
    document.querySelectorAll('.btn-time-chip').forEach(c => c.classList.remove('active'));
    selectedTimeChip = null;
  } else {
    row.style.opacity = '1';
  }
});

// 리포트 탭 클릭 연동
document.querySelectorAll('.rep-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    switchReportTab(btn.dataset.tab);
  });
});

// ----------------------------------------------------
// 플로팅 위젯 제어
// ----------------------------------------------------
const btnMenuTrigger = document.getElementById('btn-menu-trigger');
const navOverlayMenu = document.getElementById('nav-overlay-menu');

btnMenuTrigger.addEventListener('click', () => {
  navOverlayMenu.classList.toggle('active');
});

document.getElementById('btn-scroll-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('btn-scroll-bottom').addEventListener('click', () => {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
});

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  let percent = 0;
  if (docHeight > 0) {
    percent = Math.round((scrollTop / docHeight) * 100);
  }

  document.querySelector('.progress-text').innerText = `${percent}%`;

  const circle = document.querySelector('.progress-ring__circle');
  if (circle) {
    const circumference = 2 * Math.PI * 15;
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
  }
});

// ----------------------------------------------------
// 초기화 실행
// ----------------------------------------------------
initQuickTimeGrid();
initGuideAccordion();
