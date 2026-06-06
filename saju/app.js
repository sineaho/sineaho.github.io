// CineAHO Saju Destiny Analyst App Engine (AI-Powered)

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

// 오행 기본 한글 정보 및 스타일 클래스 매칭
const ELEM_KOREAN = {
  wood: { name: '목(木)', korName: '나무', color: '#10b981', class: 'col-wood' },
  fire: { name: '화(火)', korName: '불', color: '#ef4444', class: 'col-fire' },
  earth: { name: '토(土)', korName: '흙', color: '#f59e0b', class: 'col-earth' },
  metal: { name: '금(金)', korName: '쇠', color: '#cbd5e1', class: 'col-metal' },
  water: { name: '수(水)', korName: '물', color: '#3b82f6', class: 'col-water' }
};

// 십신 관계 정의용 오행 상생상극 데이터
const ELEM_RELATION = {
  wood: { wood: 'same', fire: 'give', earth: 'control', metal: 'controlled', water: 'get' },
  fire: { fire: 'same', earth: 'give', metal: 'control', water: 'controlled', wood: 'get' },
  earth: { earth: 'same', metal: 'give', water: 'control', wood: 'controlled', fire: 'get' },
  metal: { metal: 'same', water: 'give', wood: 'control', fire: 'controlled', earth: 'get' },
  water: { water: 'same', wood: 'give', fire: 'control', earth: 'controlled', metal: 'get' }
};

// 지장간 구조 테이블 정의
const HIDE_GAN_DATA = [
  { here: -1, mid: -1, main: 9, ratios: [0, 0, 100], desc: '순수 수기' }, // 자 (계)
  { here: 9, mid: 7, main: 5, ratios: [30, 10, 60], desc: '겨울 토' },  // 축 (계, 신, 기)
  { here: 4, mid: 2, main: 0, ratios: [23, 23, 54], desc: '봄의 시작' }, // 인 (무, 병, 갑)
  { here: -1, mid: -1, main: 1, ratios: [0, 0, 100], desc: '순수 목기' }, // 묘 (을)
  { here: 1, mid: 9, main: 4, ratios: [30, 10, 60], desc: '봄 토' },    // 진 (을, 계, 무)
  { here: 4, mid: 6, main: 2, ratios: [23, 23, 54], desc: '여름의 시작' }, // 사 (무, 경, 병)
  { here: -1, mid: 5, main: 3, ratios: [0, 30, 70], desc: '화토 혼합' },  // 오 (기, 정)
  { here: 3, mid: 1, main: 5, ratios: [30, 10, 60], desc: '여름 토' },   // 미 (정, 을, 기)
  { here: 4, mid: 8, main: 6, ratios: [23, 23, 54], desc: '가을의 시작' }, // 신 (무, 임, 경)
  { here: -1, mid: -1, main: 7, ratios: [0, 0, 100], desc: '순수 금기' }, // 유 (신)
  { here: 7, mid: 3, main: 4, ratios: [30, 10, 60], desc: '가을 토' },   // 술 (신, 정, 무)
  { here: 4, mid: 0, main: 8, ratios: [23, 17, 60], desc: '겨울의 시작' } // 해 (무, 갑, 임)
];

const LIFESTAGES = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'];

const LIFESTAGES_MATRIX = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0], // 갑
  [6, 5, 4, 3, 2, 1, 0, 11, 10, 9, 8, 7], // 을
  [10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // 병
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11, 10], // 정
  [10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // 무
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11, 10], // 기
  [7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6], // 경
  [0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1], // 신
  [4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3], // 임
  [3, 2, 1, 0, 11, 10, 9, 8, 7, 6, 5, 4]  // 계
];

// 글로벌 상태 변수
let selectedSolarLunar = 'solar';
let selectedGender = 'male';
let selectedTimeChip = null;

// ----------------------------------------------------
// 1. 만세력 코어 연산 엔진 (lunar-javascript 기반)
// ----------------------------------------------------

function calculateSaju(year, month, day, hour, minute, options) {
  if (typeof Solar === 'undefined' || typeof Lunar === 'undefined') {
    alert('만세력 계산 라이브러리(lunar-javascript)가 아직 로드되지 않았습니다. 인터넷 연결 상태를 확인해 주세요.');
    return null;
  }

  let finalYear = year;
  let finalMonth = month;
  let finalDay = day;

  // 음력 입력인 경우 양력 변환 처리
  if (options.solarLunar === 'lunar') {
    try {
      const lunarObj = Lunar.fromYmd(year, month, day, options.isLunarLeap);
      const solarObj = lunarObj.getSolar();
      finalYear = solarObj.getYear();
      finalMonth = solarObj.getMonth();
      finalDay = solarObj.getDay();
    } catch (e) {
      console.error('음력-양력 변환 실패:', e);
      alert('음력 변환에 실패했습니다. 유효한 음력 날짜인지 확인해 주세요.');
      return null;
    }
  }

  // 진태양시 및 표준시 편차 보정 적용 (-30분 / -32분)
  const offsetMin = (options.calcBase === 'jintae') ? 32 : 30;
  const baseSolarDate = new Date(finalYear, finalMonth - 1, finalDay, hour, minute, 0);
  const adjustedDate = new Date(baseSolarDate.getTime() - offsetMin * 60000);
  
  const adjYear = adjustedDate.getFullYear();
  const adjMonth = adjustedDate.getMonth() + 1;
  const adjDay = adjustedDate.getDate();
  const adjHour = adjustedDate.getHours();
  const adjMin = adjustedDate.getMinutes();

  // lunar-javascript 천문 만세력 계산 수행
  const solar = Solar.fromYmdHms(adjYear, adjMonth, adjDay, adjHour, adjMin, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  // 자시법(Sect) 반영 (동자시: sect 1 / 야자시: sect 2)
  if (options.jasiType === 'dong') {
    eightChar.setSect(1);
  } else {
    eightChar.setSect(2);
  }

  const getStemIdx = (char) => STEMS_HAN.indexOf(char);
  const getBranchIdx = (char) => BRANCHES_HAN.indexOf(char);

  const yeon = {
    stem: getStemIdx(eightChar.getYearGan()),
    branch: getBranchIdx(eightChar.getYearZhi())
  };
  const wol = {
    stem: getStemIdx(eightChar.getMonthGan()),
    branch: getBranchIdx(eightChar.getMonthZhi())
  };
  const il = {
    stem: getStemIdx(eightChar.getDayGan()),
    branch: getBranchIdx(eightChar.getDayZhi())
  };

  let si = { stem: -1, branch: -1 };
  if (!options.timeUnknown) {
    si = {
      stem: getStemIdx(eightChar.getHourGan()),
      branch: getBranchIdx(eightChar.getHourZhi())
    };
  }

  return { 
    yeon, 
    wol, 
    il, 
    si, 
    rawLunar: lunar, 
    rawEightChar: eightChar, 
    adjustedSolarDate: adjustedDate,
    birthSolar: { year: finalYear, month: finalMonth, day: finalDay, hour, minute }
  };
}

// 일간 기준 십신 판정 함수
function getSajuGods(saju) {
  if (saju.si.stem === -1) {
    return { si: '-', wol: getGodName(saju.il.stem, saju.wol.stem), yeon: getGodName(saju.il.stem, saju.yeon.stem) };
  }
  return {
    si: getGodName(saju.il.stem, saju.si.stem),
    wol: getGodName(saju.il.stem, saju.wol.stem),
    yeon: getGodName(saju.il.stem, saju.yeon.stem)
  };
}

function getGodName(ilganIdx, targetStemIdx) {
  if (ilganIdx === -1 || targetStemIdx === -1) return '';
  const ilganElem = STEMS_ELEM[ilganIdx];
  const ilganYnyg = STEMS_YNYG[ilganIdx];
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

  // 신강/신약 판단 (일간과 같은 오행 + 나를 돕는 인성 오행 점수 합산)
  const ilganElem = STEMS_ELEM[saju.il.stem];
  let selfStrength = score[ilganElem];
  
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

  const totalScore = saju.si.stem !== -1 ? 10 : 8;
  const strengthRatio = selfStrength / totalScore;
  
  let strengthText = '';
  if (strengthRatio >= 0.55) {
    strengthText = '중화 신강(身强) 사주 - 자신의 본원 기운이 굳건하고 주체성이 뚜렷하여 능히 재물과 직장(관성) 기운을 제어할 강인한 자아를 지니고 있습니다.';
  } else if (strengthRatio >= 0.40) {
    strengthText = '중화(中和) 사주 - 음양오행의 흐름이 치우침 없이 조화롭게 균형을 이루어, 외부 환경 변화에 유연하게 대응하고 굴곡 없는 편안한 인생 조율이 가능합니다.';
  } else {
    strengthText = '중화 신약(身弱) 사주 - 일간의 기운이 다소 소모되어 학문(인성)과 인맥/조력자(비겁)의 힘을 통해 원국을 보강하는 용신 작용이 길하게 발현되는 형상입니다.';
  }

  return { counts, score, strengthText, strengthRatio };
}

// ----------------------------------------------------
// 3. 지장간 및 십이운성 텍스트 도출 헬퍼
// ----------------------------------------------------

function getHideGanString(branchIdx) {
  const data = HIDE_GAN_DATA[branchIdx];
  if (!data) return '-';
  let parts = [];
  if (data.here !== -1) parts.push(`${STEMS[data.here]}(여)`);
  if (data.mid !== -1) parts.push(`${STEMS[data.mid]}(중)`);
  parts.push(`<strong>${STEMS[data.main]}(정)</strong>`);
  return parts.join('<br>');
}

function getLifestage(ilganIdx, branchIdx) {
  if (ilganIdx === -1 || branchIdx === -1) return '';
  const stageIdx = LIFESTAGES_MATRIX[ilganIdx][branchIdx];
  return LIFESTAGES[stageIdx];
}

// ----------------------------------------------------
// 4. 격국 및 신살 판정 알고리즘
// ----------------------------------------------------

function determineGyeokguk(ilganIdx, woljiIdx) {
  if (ilganIdx === -1 || woljiIdx === -1) return '미상';
  const mainStemOfWolji = HIDE_GAN_DATA[woljiIdx].main;
  
  const myElem = STEMS_ELEM[ilganIdx];
  const myYnyg = STEMS_YNYG[ilganIdx];
  const tarElem = STEMS_ELEM[mainStemOfWolji];
  const tarYnyg = STEMS_YNYG[mainStemOfWolji];
  const relation = ELEM_RELATION[myElem][tarElem];
  const isSameYnyg = (myYnyg === tarYnyg);
  
  if (relation === 'same') {
    const lifestageOfWolji = getLifestage(ilganIdx, woljiIdx);
    if (lifestageOfWolji === '건록') {
      return '건록격 (建祿格)';
    } else if (lifestageOfWolji === '제왕' || lifestageOfWolji === '관대') {
      return '양인격 (羊刃格)';
    } else {
      return '비겁격 (比劫格)';
    }
  } else if (relation === 'give') {
    return isSameYnyg ? '식신격 (食神格)' : '상관격 (傷官格)';
  } else if (relation === 'control') {
    return isSameYnyg ? '편재격 (偏財格)' : '정재격 (正財格)';
  } else if (relation === 'controlled') {
    return isSameYnyg ? '편관격 (偏官格)' : '정관격 (正官格)';
  } else if (relation === 'get') {
    return isSameYnyg ? '편인격 (偏印格)' : '정인격 (正印格)';
  }
  return '잡격 (雜格)';
}

function getShinsalList(saju) {
  const list = [];
  const ilgan = saju.il.stem;
  const branches = [saju.yeon.branch, saju.wol.branch, saju.il.branch];
  if (saju.si.branch !== -1) branches.push(saju.si.branch);

  const yearBranch = saju.yeon.branch;
  const dayBranch = saju.il.branch;

  // 1) 천을귀인 (天乙貴人)
  const isCheoneul = (br) => {
    if (ilgan === 0 || ilgan === 4 || ilgan === 6) return br === 1 || br === 7; // 갑무경 -> 축미
    if (ilgan === 1 || ilgan === 5) return br === 0 || br === 8; // 을기 -> 자신
    if (ilgan === 2 || ilgan === 3) return br === 11 || br === 9; // 병정 -> 해유
    if (ilgan === 7) return br === 2 || br === 6; // 신 -> 인오
    if (ilgan === 8 || ilgan === 9) return br === 3 || br === 5; // 임계 -> 묘사
    return false;
  };
  if (branches.some(isCheoneul)) {
    list.push({ name: '천을귀인 (天乙貴人)', desc: '인생 최대 길신으로 위기를 모면하고 귀인의 도움을 받음', class: 'badge-gwiin' });
  }

  // 2) 문창귀인 (文昌貴人)
  const isMunchang = (br) => {
    if (ilgan === 0) return br === 5; // 갑 -> 사
    if (ilgan === 1) return br === 6; // 을 -> 오
    if (ilgan === 2 || ilgan === 4) return br === 8; // 병무 -> 신
    if (ilgan === 3 || ilgan === 5) return br === 9; // 정기 -> 유
    if (ilgan === 6) return br === 11; // 경 -> 해
    if (ilgan === 7) return br === 0; // 신 -> 자
    if (ilgan === 8) return br === 2; // 임 -> 인
    if (ilgan === 9) return br === 3; // 계 -> 묘
    return false;
  };
  if (branches.some(isMunchang)) {
    list.push({ name: '문창귀인 (文昌貴人)', desc: '총명하고 재주가 많으며 시험, 학업, 계약에서 탁월함', class: 'badge-gwiin' });
  }

  // 3) 도화살 (桃花殺)
  const isDohwa = (br) => {
    const isMatched = (refBr, targetBr) => {
      if (refBr === 2 || refBr === 6 || refBr === 10) return targetBr === 3; // 인오술 -> 묘
      if (refBr === 8 || refBr === 0 || refBr === 4) return targetBr === 9; // 신자진 -> 유
      if (refBr === 5 || refBr === 9 || refBr === 1) return targetBr === 6; // 사유축 -> 오
      if (refBr === 11 || refBr === 3 || refBr === 7) return targetBr === 0; // 해묘미 -> 자
      return false;
    };
    return isMatched(yearBranch, br) || isMatched(dayBranch, br);
  };
  if (branches.some(isDohwa)) {
    list.push({ name: '도화살 (桃花殺)', desc: '대중을 사로잡는 강력한 매력과 사교성, 예술적 감각', class: 'badge-dohwa' });
  }

  // 4) 역마살 (驛馬殺)
  const isYeokma = (br) => {
    const isMatched = (refBr, targetBr) => {
      if (refBr === 2 || refBr === 6 || refBr === 10) return targetBr === 8; // 인오술 -> 신
      if (refBr === 8 || refBr === 0 || refBr === 4) return targetBr === 2; // 신자진 -> 인
      if (refBr === 5 || refBr === 9 || refBr === 1) return targetBr === 11; // 사유축 -> 해
      if (refBr === 11 || refBr === 3 || refBr === 7) return targetBr === 5; // 해묘미 -> 사
      return false;
    };
    return isMatched(yearBranch, br) || isMatched(dayBranch, br);
  };
  if (branches.some(isYeokma)) {
    list.push({ name: '역마살 (驛馬殺)', desc: '활동적이고 잦은 이동을 통해 새로운 자산과 기회를 창출함', class: 'badge-yeokma' });
  }

  // 5) 화개살 (華蓋殺)
  const isHwagae = (br) => {
    const isMatched = (refBr, targetBr) => {
      if (refBr === 2 || refBr === 6 || refBr === 10) return targetBr === 10; // 인오술 -> 술
      if (refBr === 8 || refBr === 0 || refBr === 4) return targetBr === 4; // 신자진 -> 진
      if (refBr === 5 || refBr === 9 || refBr === 1) return targetBr === 1; // 사유축 -> 축
      if (refBr === 11 || refBr === 3 || refBr === 7) return targetBr === 7; // 해묘미 -> 미
      return false;
    };
    return isMatched(yearBranch, br) || isMatched(dayBranch, br);
  };
  if (branches.some(isHwagae)) {
    list.push({ name: '화개살 (華蓋殺)', desc: '예술, 철학, 종교적 영성 발달과 내면 성찰의 힘', class: 'badge-hwagae' });
  }

  // 6) 양인살 (羊刃殺)
  const isYangin = (br) => {
    if (ilgan === 0) return br === 3; // 갑 -> 묘
    if (ilgan === 1) return br === 2; // 을 -> 인
    if (ilgan === 2 || ilgan === 4) return br === 6; // 병무 -> 오
    if (ilgan === 3 || ilgan === 5) return br === 5; // 정기 -> 사
    if (ilgan === 6) return br === 9; // 경 -> 유
    if (ilgan === 7) return br === 8; // 신 -> 신
    if (ilgan === 8) return br === 0; // 임 -> 자
    if (ilgan === 9) return br === 11; // 계 -> 해
    return false;
  };
  if (branches.some(isYangin)) {
    list.push({ name: '양인살 (羊刃殺)', desc: '굳건한 자립정신과 추진력, 칼을 잡은 형상의 카리스마', class: 'badge-yangin' });
  }

  // 7) 귀문관살 (鬼門關殺)
  const isGwimun = (br) => {
    if (dayBranch === 0 && br === 1) return true; // 자축
    if (dayBranch === 1 && br === 0) return true;
    if (dayBranch === 2 && br === 7) return true; // 인미
    if (dayBranch === 7 && br === 2) return true;
    if (dayBranch === 3 && br === 8) return true; // 묘신
    if (dayBranch === 8 && br === 3) return true;
    if (dayBranch === 4 && br === 5) return true; // 진사
    if (dayBranch === 5 && br === 4) return true;
    if (dayBranch === 6 && br === 11) return true; // 오해
    if (dayBranch === 11 && br === 6) return true;
    if (dayBranch === 9 && br === 10) return true; // 유술
    if (dayBranch === 10 && br === 9) return true;
    return false;
  };
  if (branches.some(isGwimun)) {
    list.push({ name: '귀문관살 (鬼門關殺)', desc: '고도의 정신적 집중력, 직관력 및 예민한 심미안', class: 'badge-gwimun' });
  }

  return list;
}

// ----------------------------------------------------
// 5. AI 기반 사주 에디토리얼 리포트 렌더링
// ----------------------------------------------------

const ILGAN_PROFILES = {
  '갑': '갑목(甲木) - 대지를 뚫고 치솟는 거목(소나무)의 형상으로, 솔직담백하며 진취적이고 당당한 리더십을 갖추고 있습니다.',
  '을': '을목(乙木) - 척박한 바위 틈에서도 꽃을 피워내는 부드럽고 유연한 화초/덩굴로, 적응력과 끈기, 사교 능력이 훌륭합니다.',
  '병': '병화(丙火) - 하늘에서 만물을 비추는 태양의 형상으로, 열정적이고 공명정대하며 솔직하고 적극적인 행동력이 강점입니다.',
  '정': '정화(丁火) - 밤하늘의 등대나 화롯불의 기운으로, 내면이 매우 사려 깊고 온화하며 총명하고 섬세한 대인 소통이 돋보입니다.',
  '무': '무토(戊土) - 광활한 대지나 묵직한 태산의 형상으로, 신용이 두터우며 듬직하고 포용력이 커 믿음직한 기둥 역할을 합니다.',
  '기': '기토(己土) - 만물을 양육하는 비옥한 텃밭의 기운으로, 꼼꼼하고 실용적이며 세심하고 모성애와 실속을 겸비하고 있습니다.',
  '경': '경금(庚金) - 제련되지 않은 거친 원석이나 칼날의 형상으로, 의리가 무겁고 결단력이 강하며 공사의 구별이 철두철미합니다.',
  '신': '신금(辛金) - 제련을 마친 정교한 보석의 기운으로, 자존심이 세고 미적 감각이 남다르며 두뇌 회전이 대단히 명석합니다.',
  '임': '임수(壬水) - 도도히 흐르는 강물이자 깊고 넓은 바다로, 포용력과 스케일이 크고 지혜로우며 융통성이 무궁무진합니다.',
  '계': '계수(癸水) - 대지를 적시는 맑은 샘물이나 이슬비로, 직관력과 창의력이 뛰어나며 섬세하고 임기응변에 뛰어납니다.'
};

function generateAIReport(saju, elemAnalysis, gyeokguk, shinsalList, daeunList) {
  const ilgan = STEMS[saju.il.stem];
  const profile = ILGAN_PROFILES[ilgan] || '';

  // 오행 강약 텍스트 추출
  let maxKey = 'wood';
  let minKey = 'wood';
  for (const key in elemAnalysis.score) {
    if (elemAnalysis.score[key] > elemAnalysis.score[maxKey]) maxKey = key;
    if (elemAnalysis.score[key] < elemAnalysis.score[minKey]) minKey = key;
  }
  const maxElem = ELEM_KOREAN[maxKey];
  const minElem = ELEM_KOREAN[minKey];

  // 1) 종합 풀이
  const summaryHTML = `
    <h5>🔮 [종합 사주 및 인생 그릇]</h5>
    <p>귀하의 타고난 일간은 <strong>${profile}</strong></p>
    <p>격국 분석 결과 <strong>${gyeokguk}</strong>을 지니고 있어 사회적으로 추구하는 이상이 뚜렷하고 자신만의 독자적 영역을 구축하는 재능을 갖추었습니다.</p>
    <p><strong>[오행 조화 진단]:</strong> ${elemAnalysis.strengthText}</p>
    <p>원국 내 가장 강하게 작용하는 기운은 <strong>${maxElem.name} (${elemAnalysis.counts[maxKey]}개, ${elemAnalysis.score[maxKey]}점)</strong>이며, 
    기운을 보완하고 중화시켜 줄 희신은 <strong>${minElem.name} (${elemAnalysis.counts[minKey]}개, ${elemAnalysis.score[minKey]}점)</strong>의 기운입니다.</p>
    
    <div class="diag-card glass-panel-inner" style="margin-top: 1rem;">
      <div class="diag-card-header text-gold">
        <i class="fa-solid fa-wand-magic-sparkles"></i>
        <span>일상 개운법 (開運法) 제안</span>
      </div>
      <div class="diag-card-body">
        <ul>
          <li><strong>추천 색상:</strong> ${minKey === 'wood' ? '초록, 청색' : minKey === 'fire' ? '적색, 분홍' : minKey === 'earth' ? '노란색, 갈색' : minKey === 'metal' ? '흰색, 회색' : '검은색, 남색'} 계열의 아이템을 패션 및 인테리어에 활용해 보세요.</li>
          <li><strong>길한 방위:</strong> ${minKey === 'wood' ? '동쪽' : minKey === 'fire' ? '남쪽' : minKey === 'earth' ? '중앙(실내)' : minKey === 'metal' ? '서쪽' : '북쪽'}을 머리 두는 방향이나 주 거처 방향으로 삼는 것이 좋습니다.</li>
          <li><strong>행운의 숫자:</strong> ${minKey === 'wood' ? '3, 8' : minKey === 'fire' ? '2, 7' : minKey === 'earth' ? '5, 10' : minKey === 'metal' ? '4, 9' : '1, 6'}입니다.</li>
        </ul>
      </div>
    </div>
  `;

  // 2) 재물운
  const wealthHTML = `
    <h5>💸 [재물운과 평생 부의 크기]</h5>
    <p>귀하의 사주는 ${saju.il.stem % 2 === 0 ? '편재(변동성 투자재물)의 성격이 강하여, 직장 소득에 안주하기보다 비즈니스 모델 발굴이나 부동산/증권 등 적극적인 투자 활동에서 높은 부가가치를 창출할 수 있는 구조입니다.' : '정재(고정적 계약재물)의 성향이 뚜렷하여, 근면성실한 근로 소득과 확실한 계약 관계를 기초로 금융 자산을 쪼개어 단계적으로 탄탄하게 증식시키는 안정지향성 부의 패턴을 보입니다.'}</p>
    <p>특히 희신인 <strong>${minElem.name}</strong> 기운이 동행하는 대운 주기에서 자산가치가 대폭 활성화되며 재물이 고이는 축적도가 비약적으로 향상됩니다. 다만 원국 내 흉살이나 충이 오는 세운에는 무리한 확장이나 동업을 차단하고 기존 자산 수성에 힘써야 합니다.</p>
  `;

  // 3) 직업/적성운
  const jobHTML = `
    <h5>💼 [직업 적성 및 사회적 야망]</h5>
    <p>격국 <strong>${gyeokguk}</strong>의 영항에 따라 다음과 같은 분야에서 성공 궤도 진입이 수월합니다:</p>
    <ul>
      <li><strong>조직 관리형:</strong> 대기업, 공공기관의 관리 감독직, 컨설팅 및 기획 행정</li>
      <li><strong>전문 기술형:</strong> 연구 개발, 전문 자격증(의료, 법률, 회계), 디자인 아키텍트 및 IT 개발</li>
      <li><strong>창조적 표출형:</strong> 브랜딩, 미디어 콘텐츠 제작자, 강사 및 대고객 커뮤니케이터</li>
    </ul>
    <p>본원 ${ilgan}목/화/토/금/수의 기운에 맞게, 억지로 남에게 고개를 숙이기보다는 주도적으로 전문성을 인정받는 포지션을 고수할 때 승진 및 명예운이 강력하게 뒷받침됩니다.</p>
  `;

  // 4) 연애/결혼운
  const loveHTML = `
    <h5>❤️ [연애·결혼 및 이상적 인연]</h5>
    <p>배우자 자리를 의미하는 일지(日支) <strong>${BRANCHES_HAN[saju.il.branch]} (${BRANCHES_ANIMAL[saju.il.branch]}띠 기운)</strong>을 스캔한 결과, 서로의 자율성과 인생 커리어를 적극 지지하며 감정을 투명하게 공유할 수 있는 동반자 관계를 꿈꾸고 있습니다.</p>
    <p>배우자성을 뜻하는 ${selectedGender === 'male' ? '재성(財星)의 분포를 볼 때, 실용적 감각이 있고 경제 활동 능력을 고루 갖춘 현명한 파트너' : '관성(官星)의 흐름을 볼 때, 사회적 신망이 있고 가정에 무거운 책임감을 다하는 듬직한 배우자'}와 귀한 백년가약의 연을 맺을 복록이 두텁습니다.</p>
    <p>다가오는 2026년 병오(丙午)년과 2027년 정미(丁未)년에 지지 합이 동하면서 인생의 소중한 인연을 만나거나 결혼운이 강력하게 작동하는 최고의 매칭 타이밍을 노려볼 만합니다.</p>
  `;

  // 5) 대운 흐름
  const startAge = daeunList[0] ? daeunList[0].startAge : 0;
  
  let daeunCards = daeunList.map(d => `
    <div class="daeun-card">
      <div class="daeun-card-num">${d.index}대운</div>
      <div class="daeun-card-age">${d.startAge}세 ~</div>
      <div class="daeun-card-year">${d.startYear}년</div>
      <div class="daeun-card-ganzhi">${d.ganzhi}</div>
      <div class="daeun-card-desc">10년 대운</div>
    </div>
  `).join('');

  const daeunHTML = `
    <h5>📈 [10년 주기 대운(大運) 흐름 해석]</h5>
    <p>귀하의 인생 대운은 만 <strong>${startAge}세</strong>를 기점으로 순환하는 운명의 이정표를 지니고 있습니다.</p>
    <p>각 10년 대운은 인생의 '계절적 기상'을 뜻하며, 현재 머물고 있는 대운의 간지와 귀하의 희신인 <strong>${minElem.name}</strong>이 조화를 이룰 때 지연되었던 대형 계약 성사나 승진, 귀인의 결정적 인도가 집중적으로 발흥하게 됩니다.</p>
    
    <div class="daeun-timeline-grid">
      ${daeunCards}
    </div>
    
    <p style="margin-top: 1.5rem; font-size: 0.85rem; color: var(--text-muted); line-height: 1.6;">
      * 대운의 전반 5년은 주로 천간의 사회적 활동 기조가, 후반 5년은 지지의 내면적인 심리 및 주거지 안정도가 주도하는 경향을 나타냅니다.
    </p>
  `;

  return {
    summary: summaryHTML,
    wealth: wealthHTML,
    job: jobHTML,
    love: loveHTML,
    daeun: daeunHTML
  };
}

// ----------------------------------------------------
// 6. UI 48개 빠른 시각 칩 생성 및 렌더러
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
        document.querySelectorAll('.btn-time-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        document.getElementById('birth-hour').value = h;
        document.getElementById('birth-minute').value = m;

        document.getElementById('chk-time-unknown').checked = false;
        document.getElementById('time-fields-row').style.opacity = '1';
        
        selectedTimeChip = timeStr;
      });

      grid.appendChild(chip);
    }
  }
}

// ----------------------------------------------------
// 7. 14단 아코디언 명리학 가이드 자동 생성
// ----------------------------------------------------

const ACCORDION_DATA = [
  {
    title: "1. 사주팔자란 무엇인가?",
    content: "사주팔자(四柱八字)는 사람이 태어난 연(年), 월(月),일(日), 시(時)의 네 가지 기둥(사주)과 각 기둥마다 천간과 지지 두 글자씩 총 여덟 글자(팔자)로 이루어진 전통 명리학의 핵심 명식입니다. 이 여덟 글자는 일종의 선천적인 에너지 바코드로 본인의 본래 기질과 삶의 큰 궤적을 내포하고 있습니다."
  },
  {
    title: "2. 사주명리학의 역사와 유래",
    content: "명리학은 중국 주나라의 오행 사상을 뿌리에 두고 당나라 이허중의 납음오행을 거쳐 송나라 서자평 선생에 의해 일간을 중심으로 격국과 억부를 산정하는 자평명리학 체계로 확립되었습니다. 현대에는 맹목적 길흉 단정을 넘어서 심리학적 기질 분석과 인생의 길잡이용 지도로 널리 보급되었습니다."
  },
  {
    title: "3. 기본 개념 이해하기",
    content: "우주와 세상 만물이 수축(음)과 팽창(양)의 상호작용 속에서 목(木), 화(火), 토(土), 금(金), 수(水) 다섯 기운(오행)의 흐름으로 움직인다는 동양의 자연 순환론에 근거합니다. 이 오행들이 서로 돕는 상생(相生)과 통제하는 상극(相剋)의 역학을 분석합니다."
  },
  {
    title: "4. 사주(四柱) 완벽 해설",
    content: "연주(年柱)는 가문/조상의 기운이자 유년기 환경, 월주(月柱)는 부모/형제 및 평생의 사회적 진로와 청년기, 일주(日柱)는 본인(일간)과 배우자(일지) 및 중년기, 시주(時柱)는 자식운 및 말년의 내면 세계를 표상합니다."
  },
  {
    title: "5. 오행(五行)의 이해",
    content: "목(木)은 시작과 진취적 힘, 화(火)는 확산과 열정적인 자기표현, 토(土)는 환절기 조화와 신용, 금(金)은 결단력과 확실한 결실의 추구, 수(水)는 지혜와 깊은 저장 에너지를 뜻합니다. 특정 기운의 과다나 결핍은 심리와 육체의 쏠림을 형성합니다."
  },
  {
    title: "6. 십신(十神)과 육친",
    content: "일간(본원)과 타 글자 오행의 관계를 사회적 역할로 나타낸 것입니다: 비견/겁재(나와 동료), 식신/상관(나의 재능 표출/자식), 편재/정재(내가 취하는 재물/아내), 편관/정관(나를 이끄는 훈육/직장/남편), 편인/정인(나를 기르는 학문/도움/어머니)."
  },
  {
    title: "7. 음양력과 만세력",
    content: "음력은 달의 주기를 기준 삼고 양력은 지구 공전을 기준 삼습니다. 명리학은 태양 움직임에 종속된 24절기를 기반으로 달(月)을 나누므로, 음양력 날짜를 정확한 우주 절입 시점으로 계산하여 간지로 변환해 주는 만세력 엔진이 필수적입니다."
  },
  {
    title: "8. 대운(大運)과 세운(歲運)",
    content: "대운은 10년 동안 본인을 감싸는 거시적인 계절적 환경(대운수 기준)이며, 세운(歲運)은 매년 돌아오는 구체적 기상(예: 2026년은 병오년)입니다. 대운이라는 커다란 무대 위에서 매년 찾아오는 세운의 사건들이 펼쳐집니다."
  },
  {
    title: "9. 분석 유형별 해설",
    content: "일간 기운의 강약을 판단하는 억부법을 위시하여, 기후 조화를 고려하는 조후법, 병이 되는 글자와 그것을 치유하는 약을 가려내는 병약법 등을 종합 적용하여 사주의 편중을 잡아줄 용신(用神)을 가려냅니다."
  },
  {
    title: "10. 사주 결과 보는 법",
    content: "만세력 표에서 일주 천간(일간)이 나 자신의 본원 기질입니다. 오행 분포 그래프의 가중치 점수를 보고 가장 약한 오행 기운을 일상에서 옷 색상, 인테리어 방위, 생활 패턴 등으로 조율(개운)하는 것이 좋습니다."
  },
  {
    title: "11. 앱 사용 방법",
    content: "양음력 및 성별을 선택하고 숫자로 연월일을 기입한 다음, 태어난 시를 알면 48개 빠른 칩에서 원클릭으로 입력할 수 있습니다. 시각을 알 수 없다면 '시각 모름' 체크를 통해 시주를 생략한 삼주 분석으로 정밀 스캔을 진행해 보세요."
  },
  {
    title: "12. 출생 시각·지역 보정과 자시법(동자시·야자시·조자시)",
    content: "우리나라는 동경 135도 일본식 표준시를 사용하고 있지만 서울의 실제 태양 남중 시간은 32분 느린 127.5도 영역에 속합니다. '진태양시' 옵션은 이 격차를 정밀 보정하며, 밤 23:30~24:00 사이에 태어난 경우 일진을 당일로 볼 것인지(야자시) 다음날로 볼 것인지(동자시) 선택하게 해 줍니다."
  },
  {
    title: "13. 고급 명리학 개념",
    content: "고급 명리 분석에서는 천간끼리 합쳐져 변하는 천간합, 지지가 묶이는 삼합/방합/육합과 깨지는 충(沖), 조율이 필요한 형(刑), 파(破), 해(害) 등을 스캔하여 특정한 운을 만났을 때의 터닝포인트를 읽어냅니다."
  },
  {
    title: "14. 자주 묻는 질문",
    content: "Q: 사주가 안 좋으면 어떻게 하나요? A: 사주는 정해진 형벌이 아니라 본인이 설계해 온 에너지 설계도(우주 지도)입니다. 기세를 타고나기만 하고 노력하지 않는 것보다, 지도를 보고 내 쏠림을 보강하며 삶을 리드해 갈 때 더 큰 만족을 누릴 수 있습니다."
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
// ----------------------------------------------------
// 8. 분석 진행 및 리포트 시각화
// ----------------------------------------------------

let currentReportTab = 'summary';
let reportData = {}; // 탭별 리포트 데이터 캐시
let userSaju = null; // 계산된 사주 원본 캐시
let yongshinElement = ''; // 용신 오행
let huishinElement = '';  // 희신 오행
let gishinElement = '';    // 기신 오행
let calendarYear = 2026;
let calendarMonth = 6;

// 성향 매핑 상수
const STEM_TRAITS = {
  '갑': ['리더십', '개척정신', '곧은성품'],
  '을': ['유연성', '적응력', '예술성'],
  '병': ['열정적', '솔직함', '행동력'],
  '정': ['따뜻함', '섬세함', '배려심'],
  '무': ['듬직함', '포용력', '신뢰감'],
  '기': ['꼼꼼함', '다정함', '실용성'],
  '경': ['의리파', '결단력', '강인함'],
  '신': ['섬세함', '명석함', '완벽주의'],
  '임': ['지혜로움', '대범함', '친화력'],
  '계': ['총명함', '창의력', '융통성']
};

const TRAITS_MAP = {
  '갑인': ['독립심', '추진력', '리더십'],
  '갑묘': ['성장성', '온화함', '개척정신'],
  '갑진': ['포용력', '실용성', '안정성'],
  '갑오': ['활동성', '예술성', '솔직함'],
  '갑신': ['결단력', '통찰력', '자립성'],
  '갑술': ['신용적', '책임감', '듬직함'],
  '을축': ['끈기', '다정함', '성실함'],
  '을인': ['유연성', '적응력', '개척심'],
  '을묘': ['순수함', '예술성', '유연성'],
  '을진': ['친화력', '안정감', '조율력'],
  '을사': ['사교성', '임기응변', '화려함'],
  '을미': ['성실함', '차분함', '인내심'],
  '을유': ['섬세함', '명석함', '예술미'],
  '을해': ['지혜로움', '융통성', '다정함'],
  '병자': ['명랑함', '정의감', '성실함'],
  '병축': ['꼼꼼함', '사교성', '활동성'],
  '병인': ['열정', '리더십', '추진력'],
  '병진': ['포용력', '신용', '행동력'],
  '병오': ['자신감', '솔직함', '활동성'],
  '병신': ['재주꾼', '명석함', '결단력'],
  '병술': ['의리', '책임감', '사교성'],
  '정축': ['성실함', '사려깊음', '차분함'],
  '정묘': ['직관력', '예술성', '유연함'],
  '정사': ['열정적', '활동적', '임기응변'],
  '정미': ['온화함', '배려심', '차분함'],
  '정유': ['섬세함', '두뇌회전', '완벽주의'],
  '정해': ['예의바름', '신용', '지혜로움'],
  '무자': ['듬직함', '신용', '재물복'],
  '무인': ['카리스마', '강직함', '리더십'],
  '무진': ['포용력', '묵직함', '자립성'],
  '무오': ['추진력', '솔직함', '활동성'],
  '무신': ['재주많음', '실용성', '신뢰감'],
  '무술': ['책임감', '뚝심', '신용'],
  '기축': ['꼼꼼함', '인내심', '성실함'],
  '기묘': ['상냥함', '유연성', '다정함'],
  '기사': ['사교성', '두뇌명석', '활동성'],
  '기미': ['안정성', '신뢰성', '온화함'],
  '기유': ['완벽주의', '섬세함', '솜씨좋음'],
  '기해': ['지혜', '포용력', '다정다감'],
  '경자': ['총명함', '의리', '결단력'],
  '경축': ['성실함', '인내심', '강직함'],
  '경인': ['추진력', '리더십', '통큰기질'],
  '경진': ['뚝심', '카리스마', '의리'],
  '경오': ['정의감', '솔직함', '책임감'],
  '경신': ['강인함', '결단력', '독립심'],
  '경술': ['의리파', '듬직함', '용맹성'],
  '신자': ['명석함', '예리함', '창의성'],
  '신축': ['꼼꼼함', '인내심', '끈기'],
  '신묘': ['섬세함', '예술미', '순수함'],
  '신진': ['조율력', '직관력', '성실성'],
  '신사': ['사교성', '임기응변', '예리함'],
  '신미': ['차분함', '신중함', '꼼꼼함'],
  '신유': ['완벽주의', '심미안', '명석함'],
  '신해': ['지혜로움', '감수성', '융통성'],
  '임자': ['대범함', '지혜', '리더십'],
  '임축': ['성실함', '끈기', '포용력'],
  '임인': ['호기심', '활동성', '추진력'],
  '임진': ['포용력', '스케일', '자립성'],
  '임오': ['사교성', '센스', '활동성'],
  '임신': ['재주꾼', '두뇌회전', '융통성'],
  '임술': ['의리', '책임감', '듬직함'],
  '계자': ['지혜', '총명함', '창의성'],
  '계축': ['뚝심', '끈기', '차분함'],
  '계인': ['직관력', '융통성', '호기심'],
  '계묘': ['다정함', '예술성', '영리함'],
  '계진': ['사교성', '융통성', '안정감'],
  '계사': ['임기응변', '화려함', '명석함'],
  '계미': ['온화함', '배려심', '성실성'],
  '계유': ['예민함', '섬세함', '두뇌명석'],
  '계해': ['지혜', '창의성', '유연함']
};

const LIFESTAGE_ICONS = {
  '장생': { icon: 'fa-solid fa-seedling', power: '강', powerClass: 'power-strong', desc: '생명력이 시작되는 단계, 활력과 성장의 기운' },
  '목욕': { icon: 'fa-solid fa-bath', power: '중', powerClass: 'power-mid', desc: '세상의 때를 씻어내는 단계, 매력과 감성의 기운' },
  '관대': { icon: 'fa-solid fa-graduation-cap', power: '강', powerClass: 'power-strong', desc: '벼슬 모자를 쓰는 단계, 도전과 자립의 기운' },
  '건록': { icon: 'fa-solid fa-dumbbell', power: '강', powerClass: 'power-strong', desc: '건강하고 든든한 단계, 자립과 독립의 기운' },
  '제왕': { icon: 'fa-solid fa-crown', power: '강', powerClass: 'power-strong', desc: '인생의 정점에 선 단계, 주체성과 카리스마' },
  '쇠': { icon: 'fa-solid fa-shield-halved', power: '중', powerClass: 'power-mid', desc: '정점을 지나 성찰하는 단계, 은밀한 실속의 기운' },
  '병': { icon: 'fa-solid fa-prescription-bottle-medical', power: '약', powerClass: 'power-weak', desc: '기운이 쇠약해져 아픈 단계, 예민함과 성찰의 기운' },
  '사': { icon: 'fa-solid fa-skull', power: '약', powerClass: 'power-weak', desc: '육신의 호흡이 멈추는 단계, 고도의 집중력과 종교성' },
  '묘': { icon: 'fa-solid fa-box-archive', power: '약', powerClass: 'power-weak', desc: '창고에 보관하는 단계, 알뜰함과 저장의 기운' },
  '절': { icon: 'fa-solid fa-link-slash', power: '약', powerClass: 'power-weak', desc: '모든 기운이 끊어지는 터닝포인트, 새로움의 태동' },
  '태': { icon: 'fa-solid fa-egg', power: '중', powerClass: 'power-mid', desc: '생명이 잉태되는 단계, 꿈과 희망의 태동' },
  '양': { icon: 'fa-solid fa-baby', power: '중', powerClass: 'power-mid', desc: '양육되는 단계, 보호와 성장의 기운' }
};

const elemClassMap = {
  wood: 'green',
  fire: 'red',
  earth: 'gold',
  metal: 'grey',
  water: 'blue'
};

const btnSubmitSaju = document.getElementById('btn-submit-saju');
const sajuResultsPanel = document.getElementById('saju-results-panel');

btnSubmitSaju.addEventListener('click', () => {
  const year = parseInt(document.getElementById('birth-year').value);
  const month = parseInt(document.getElementById('birth-month').value);
  const day = parseInt(document.getElementById('birth-day').value);
  
  const chkUnknown = document.getElementById('chk-time-unknown').checked;
  const hour = chkUnknown ? 12 : parseInt(document.getElementById('birth-hour').value);
  const minute = chkUnknown ? 0 : parseInt(document.getElementById('birth-minute').value);

  // 유효성 검사
  if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
    alert('올바른 생년월일(연, 월, 일)을 입력해 주세요.');
    return;
  }

  const calcBase = document.querySelector('input[name="calc-base"]:checked').value;
  const jasiType = document.querySelector('input[name="jasi-type"]:checked').value;
  const isLunarLeap = document.getElementById('chk-lunar-leap').checked;

  const options = {
    timeUnknown: chkUnknown,
    calcBase,
    jasiType,
    solarLunar: selectedSolarLunar,
    isLunarLeap: isLunarLeap
  };

  // 1) 사주 계산 실행
  const result = calculateSaju(year, month, day, hour, minute, options);
  if (!result) return;

  const saju = { yeon: result.yeon, wol: result.wol, il: result.il, si: result.si };
  userSaju = saju;

  // 2) 십신 계산
  const gods = getSajuGods(saju);

  // 3) 오행 분석
  const elemAnalysis = calculateElements(saju);

  // 4) 격국 판정
  const gyeokguk = determineGyeokguk(saju.il.stem, saju.wol.branch);

  // 5) 신살 산출
  const shinsalList = getShinsalList(saju);

  // 6) 대운 리스트 산출
  const isMale = (selectedGender === 'male') ? 1 : 0;
  const daYun = result.rawEightChar.getYun(isMale);
  const daeunList = [];
  const rawDaYunList = daYun.getDaYun();
  const birthYear = result.adjustedSolarDate.getFullYear();

  for (let i = 0; i < Math.min(8, rawDaYunList.length); i++) {
    const dy = rawDaYunList[i];
    daeunList.push({
      index: i + 1,
      startAge: dy.getStartAge(),
      startYear: birthYear + dy.getStartAge(),
      ganzhi: dy.getGanZhi()
    });
  }

  // 7) 용신/희신/기신 산출 및 세팅
  determineYongshinHuiGishin(saju, elemAnalysis);

  // 8) 대시보드 UI 각 섹션 렌더링
  const currentYear = new Date().getFullYear();
  const currentAgeWestern = currentYear - birthYear - (new Date() < new Date(currentYear, result.birthSolar.month - 1, result.birthSolar.day) ? 1 : 0);
  const currentAgeKorean = currentYear - birthYear + 1;

  renderSummaryUI(result, saju, gods, elemAnalysis, gyeokguk, currentAgeWestern, currentAgeKorean, options);
  renderWongukUI(saju, gods, shinsalList);
  renderLuckCardsUI(saju, elemAnalysis, gyeokguk, result);
  renderDailyCalendarUI(saju);
  renderTechnicalMetricsUI(saju, gods, elemAnalysis);
  renderTimelineUI(saju, daeunList, currentAgeWestern, result.rawEightChar.getSector() === 1 ? '순행' : '역행', daYun.getStartAge());

  // 9) AI 리포트 생성 및 탭 표출
  reportData = generateAIReport(saju, elemAnalysis, gyeokguk, shinsalList, daeunList);
  switchReportTab(currentReportTab);

  // 10) 결과 영역 활성화 및 부드러운 스크롤 이동
  sajuResultsPanel.style.display = 'block';
  sajuResultsPanel.scrollIntoView({ behavior: 'smooth' });
});

// 용신/희신/기신 판단 함수
function determineYongshinHuiGishin(saju, elemAnalysis) {
  const ilganElem = STEMS_ELEM[saju.il.stem];
  
  if (elemAnalysis.strengthRatio >= 0.55) { // 신강
    // 용신: 비겁/인성을 배제하고 식상/재성/관성 중 가장 세력이 적당하거나 약한 오행을 찾음
    const candidates = ['wood', 'fire', 'earth', 'metal', 'water'].filter(e => {
      // 나를 돕는 오행인 경우 제외
      if (e === ilganElem) return false;
      let relation = ELEM_RELATION[ilganElem][e];
      if (relation === 'get') return false;
      return true;
    });
    
    // candidates 중 점수가 가장 낮은 것
    candidates.sort((a, b) => elemAnalysis.score[a] - elemAnalysis.score[b]);
    yongshinElement = candidates[0];
    huishinElement = candidates[1] || candidates[0];
    gishinElement = ilganElem; // 나 자신(비겁)이 기신이 됨
  } else { // 신약 또는 중화
    // 용신: 나를 돕는 인성(get) 또는 비겁(same) 중 점수가 더 부족한 오행
    let motherElem = '';
    for (const key in ELEM_RELATION[ilganElem]) {
      if (ELEM_RELATION[ilganElem][key] === 'get') {
        motherElem = key;
        break;
      }
    }
    
    if (elemAnalysis.score[ilganElem] <= elemAnalysis.score[motherElem]) {
      yongshinElement = ilganElem;
      huishinElement = motherElem;
    } else {
      yongshinElement = motherElem;
      huishinElement = ilganElem;
    }
    
    // 기신은 나를 극하거나 깎아내리는 오행(식상, 재성, 관성) 중 가장 강한 오행
    const drainCandidates = ['wood', 'fire', 'earth', 'metal', 'water'].filter(e => e !== ilganElem && e !== motherElem);
    drainCandidates.sort((a, b) => elemAnalysis.score[b] - elemAnalysis.score[a]);
    gishinElement = drainCandidates[0];
  }
}

// 1. 요약 카드 렌더러
function renderSummaryUI(result, saju, gods, elemAnalysis, gyeokguk, ageWestern, ageKorean, options) {
  // 상단 바 정보 세팅
  const dateText = `${result.birthSolar.year}년 ${result.birthSolar.month}월 ${result.birthSolar.day}일 (${options.solarLunar === 'solar' ? '양력' : '음력'}${options.isLunarLeap ? '·윤달' : ''})`;
  document.getElementById('res-birth-date').innerHTML = `<i class="fa-regular fa-calendar"></i> ${dateText}`;
  
  const timeText = options.timeUnknown ? '시간 미입력' : `${String(result.birthSolar.hour).padStart(2, '0')}시 ${String(result.birthSolar.minute).padStart(2, '0')}분`;
  document.getElementById('res-birth-time').innerHTML = `<i class="fa-regular fa-clock"></i> ${timeText}`;
  
  const genderText = selectedGender === 'male' ? '남성' : '여성';
  document.getElementById('res-gender').innerHTML = `<i class="fa-solid fa-venus-mars"></i> ${genderText}`;
  
  document.getElementById('res-age').innerHTML = `<i class="fa-solid fa-cake-candles"></i> 만 ${ageWestern}세 (${ageKorean}세)`;
  
  // 계산 옵션 바 세팅
  document.getElementById('res-setting-base').innerText = options.calcBase === 'standard' ? '표준 만세력 기준' : '진태양시 정밀 기준';
  document.getElementById('res-setting-jasi').innerText = options.jasiType === 'dong' ? '동자시 적용' : options.jasiType === 'ya' ? '야자시 적용' : '조자시 적용';

  // 일간 서클 세팅
  const ilganKor = STEMS[saju.il.stem];
  const iljiKor = BRANCHES[saju.il.branch];
  const ilganElem = STEMS_ELEM[saju.il.stem];
  const ilganElemKor = ELEM_KOREAN[ilganElem].name.split('(')[0];
  
  const dmCircle = document.getElementById('res-dm-circle');
  dmCircle.innerText = ilganElemKor;
  dmCircle.className = `daymaster-circle ${ilganElem}`;
  
  // 일주 명칭
  const iljuName = `${ilganKor}${iljiKor}`;
  const iljuHanja = `${STEMS_HAN[saju.il.stem]}${BRANCHES_HAN[saju.il.branch]}`;
  document.getElementById('res-dm-title').innerHTML = `${iljuName} <span class="hanja">${iljuHanja}</span>`;
  document.getElementById('res-dm-subtitle').innerText = `${ELEM_KOREAN[ilganElem].name} 일간`;

  // 대표 성향 키워드
  const dmBadges = document.getElementById('res-dm-badges');
  dmBadges.innerHTML = '';
  const traits = TRAITS_MAP[iljuName] || STEM_TRAITS[ilganKor] || ['성실함', '신용적', '활동성'];
  traits.forEach(t => {
    const span = document.createElement('span');
    span.innerText = t;
    dmBadges.appendChild(span);
  });

  // 6대 지표 그리드 채우기
  document.getElementById('res-m-gyeokguk').innerText = gyeokguk.split(' ')[0];
  
  const yongElemKor = ELEM_KOREAN[yongshinElement].name;
  const yongGodName = getGodName(saju.il.stem, STEMS_ELEM.indexOf(yongshinElement));
  document.getElementById('res-m-yongshin').innerHTML = `<span class="text-${yongshinElement}">${yongElemKor}</span><br><span class="age-range" style="font-size:0.75rem;">(${yongGodName || '용신'})</span>`;
  
  const strengthName = elemAnalysis.strengthText.split(' ')[0];
  document.getElementById('res-m-strength').innerText = strengthName;

  // 현재 대운
  const birthYear = result.adjustedSolarDate.getFullYear();
  const isMale = (selectedGender === 'male') ? 1 : 0;
  const daYun = result.rawEightChar.getYun(isMale);
  const rawDaYunList = daYun.getDaYun();
  let currentDaeunGanzhi = '미상';
  let currentDaeunRange = '-';
  for (let i = 0; i < rawDaYunList.length; i++) {
    const dy = rawDaYunList[i];
    const startAge = dy.getStartAge();
    const endAge = startAge + 9;
    if (ageWestern >= startAge && ageWestern <= endAge) {
      currentDaeunGanzhi = dy.getGanZhi();
      currentDaeunRange = `${startAge}~${endAge}세`;
      break;
    }
  }
  document.getElementById('res-m-daeun').innerHTML = `${currentDaeunGanzhi}<br><span class="age-range">${currentDaeunRange}</span>`;

  // 2026년 세운 (올해 세운)
  const userCurrentYear = new Date().getFullYear();
  // unpkg lunar-javascript로 올해 천간 지지 가져오기
  let curYearGanzhi = '병오';
  try {
    const curSolar = Solar.fromYmdHms(userCurrentYear, 6, 1, 12, 0, 0);
    curYearGanzhi = curSolar.getLunar().getEightChar().getYearGanZhi();
  } catch(e){}
  document.getElementById('res-m-sewun').innerText = curYearGanzhi;

  // 띠
  const animal = BRANCHES_ANIMAL[saju.yeon.branch];
  const yeonZhiHan = BRANCHES_HAN[saju.yeon.branch];
  document.getElementById('res-m-zodiac').innerHTML = `${animal}띠<br><span class="hanja-sub">${yeonZhiHan}(${BRANCHES[saju.yeon.branch]})</span>`;

  // 조언 알림창
  const yongGod = getGodName(saju.il.stem, STEMS_ELEM.indexOf(yongshinElement));
  document.getElementById('res-tip-alert').innerHTML = `
    <i class="fa-solid fa-hand-holding-heart"></i>
    <span>${ilganKor}일간의 ${strengthName} 사주입니다. 용신 <strong class="text-${yongshinElement}">${ELEM_KOREAN[yongshinElement].name}(${yongGod})</strong>으로 기운을 보완하면 좋습니다.</span>
  `;

  // 계산 기준 노트
  document.getElementById('res-calc-note').innerText = options.timeUnknown 
    ? '계산 기준 · 표준 태양시 보정 적용 · 시간 미상으로 시주는 제외했습니다.' 
    : '계산 기준 · 표준 태양시 보정 및 로컬 지역 시간 오차 보정 적용 완료.';
}

// 2. 사주 원국 렌더러
function renderWongukUI(saju, gods, shinsalList) {
  const isSiEmpty = (saju.si.stem === -1);
  
  // 시주 카드 렌더링
  const cardSiju = document.getElementById('card-siju');
  if (isSiEmpty) {
    cardSiju.className = 'wonguk-col-card empty-siju';
    cardSiju.innerHTML = `
      <span class="col-label">시주<br><span class="col-desc-sub">말년·자식</span></span>
      <div class="col-body-unknown">미상</div>
    `;
  } else {
    cardSiju.className = 'wonguk-col-card';
    const stemElem = STEMS_ELEM[saju.si.stem];
    const branchElem = BRANCHES_ELEM[saju.si.branch];
    cardSiju.innerHTML = `
      <span class="col-label">시주<br><span class="col-desc-sub">말년·자식</span></span>
      <div class="wonguk-cell-box stem-box col-${stemElem}">
        <span class="hz">${STEMS[saju.si.stem]}</span>
        <span class="hz-han">${STEMS_HAN[saju.si.stem]}</span>
        <span class="elem-txt">${ELEM_KOREAN[stemElem].name.split('(')[0]}(${STEMS_YNYG[saju.si.stem] === 'yang' ? '○' : '●'})</span>
        <span class="god-tag">${gods.si}</span>
      </div>
      <div class="wonguk-cell-box branch-box col-${branchElem}">
        <span class="hz">${BRANCHES[saju.si.branch]}</span>
        <span class="hz-han">${BRANCHES_HAN[saju.si.branch]}</span>
        <span class="elem-txt">${ELEM_KOREAN[branchElem].name.split('(')[0]}(${BRANCHES_YNYG[saju.si.branch] === 'yang' ? '○' : '●'})</span>
        <span class="god-tag">${getGodName(saju.il.stem, BRANCHES_ELEM.indexOf(branchElem))}</span>
      </div>
      <div class="lifestage-badge-wrap">
        <span class="badge-stage badge-${branchElem}">${getLifestage(saju.il.stem, saju.si.branch)}</span>
      </div>
      <div class="hidegan-desc-text">${getHideGanString(saju.si.branch)}</div>
    `;
  }

  // 나머지 기둥 렌더링 헬퍼
  const setCardPillar = (cardId, stemId, branchId, stemIdx, branchIdx, isIlju = false) => {
    const card = document.getElementById(cardId);
    const stemElem = STEMS_ELEM[stemIdx];
    const branchElem = BRANCHES_ELEM[branchIdx];
    
    // 카드 자체 호버 스타일을 위해 클래스 추가
    card.className = `wonguk-col-card pillar-${stemElem}`;
    
    const stemCell = document.getElementById(`cell-${stemId}-stem`);
    stemCell.className = `wonguk-cell-box stem-box col-${stemElem}`;
    document.getElementById(`txt-${stemId}-stem`).innerText = STEMS[stemIdx];
    document.getElementById(`txt-${stemId}-stem-han`).innerText = STEMS_HAN[stemIdx];
    document.getElementById(`txt-${stemId}-stem-elem`).innerHTML = `${ELEM_KOREAN[stemElem].name.split('(')[0]} ${STEMS_YNYG[stemIdx] === 'yang' ? '○' : '●'}`;
    
    const branchCell = document.getElementById(`cell-${branchId}-branch`);
    branchCell.className = `wonguk-cell-box branch-box col-${branchElem}`;
    document.getElementById(`txt-${branchId}-branch`).innerText = BRANCHES[branchIdx];
    document.getElementById(`txt-${branchId}-branch-han`).innerText = BRANCHES_HAN[branchIdx];
    document.getElementById(`txt-${branchId}-branch-elem`).innerHTML = `${ELEM_KOREAN[branchElem].name.split('(')[0]} ${BRANCHES_YNYG[branchIdx] === 'yang' ? '○' : '●'}`;

    if (isIlju) {
      document.getElementById(`tag-il-branch-god`).innerText = getGodName(saju.il.stem, STEMS_ELEM.indexOf(BRANCHES_ELEM[branchIdx]));
    } else {
      document.getElementById(`tag-${stemId}-stem-god`).innerText = stemId === 'wol' ? gods.wol : gods.yeon;
      document.getElementById(`tag-${branchId}-branch-god`).innerText = getGodName(saju.il.stem, STEMS_ELEM.indexOf(BRANCHES_ELEM[branchIdx]));
    }

    const stage = getLifestage(saju.il.stem, branchIdx);
    const stageBadge = document.getElementById(`cell-${branchId}-lifestage`);
    stageBadge.innerText = stage;
    stageBadge.className = `badge-stage badge-${branchElem}`;

    document.getElementById(`cell-${branchId}-hidegan`).innerHTML = getHideGanString(branchIdx).replace(/<br>/g, ' · ').replace(/<\/?strong>/g, '');
  };

  setCardPillar('card-ilju', 'il', 'il', saju.il.stem, saju.il.branch, true);
  setCardPillar('card-wolju', 'wol', 'wol', saju.wol.stem, saju.wol.branch, false);
  setCardPillar('card-yeonju', 'yeon', 'yeon', saju.yeon.stem, saju.yeon.branch, false);

  // 합충형파해 뱃지 세팅
  const hapChungList = calculateHapChung(saju);
  const combListWrap = document.getElementById('comb-list');
  combListWrap.innerHTML = '';
  document.getElementById('comb-count').innerText = `${hapChungList.length}개`;
  if (hapChungList.length === 0) {
    combListWrap.innerHTML = '<span class="text-muted" style="font-size:0.75rem;">원국 내 성립하는 주요 합충형파해가 없습니다.</span>';
  } else {
    hapChungList.forEach(hc => {
      const span = document.createElement('span');
      span.className = `comb-badge ${hc.class}`;
      span.innerHTML = `${hc.text} <span class="type-tag">${hc.type}</span> <span class="detail-tag">${hc.detail}</span>`;
      combListWrap.appendChild(span);
    });
  }

  // 신살 요약 뱃지 세팅
  const shinsalCompactWrap = document.getElementById('shinsal-compact-list');
  shinsalCompactWrap.innerHTML = '';
  document.getElementById('shinsal-count').innerText = `${shinsalList.length}개`;
  if (shinsalList.length === 0) {
    shinsalCompactWrap.innerHTML = '<span class="text-muted" style="font-size:0.75rem;">활성화된 핵심 신살이 없습니다.</span>';
  } else {
    shinsalList.forEach(s => {
      const span = document.createElement('span');
      span.className = 'shinsal-tag';
      // 신살 명칭에서 한자 제거하고 노출
      const sName = s.name.split(' ')[0];
      span.innerHTML = `${sName} <span class="loc-tag">원국</span>`;
      shinsalCompactWrap.appendChild(span);
    });
  }

  // 12운성·지장간 상세 그리드 세팅
  const detailGrid = document.getElementById('detail-wonguk-grid');
  detailGrid.innerHTML = '';

  const pillars = [
    { name: '연주', branch: saju.yeon.branch, label: 'yeon' },
    { name: '월주', branch: saju.wol.branch, label: 'wol' },
    { name: '일주', branch: saju.il.branch, label: 'il' }
  ];
  if (!isSiEmpty) {
    pillars.unshift({ name: '시주', branch: saju.si.branch, label: 'si' });
  }

  pillars.forEach(p => {
    const stage = getLifestage(saju.il.stem, p.branch);
    const stageInfo = LIFESTAGE_ICONS[stage] || { desc: '' };
    
    // 지장간 상세 구성
    const hgData = HIDE_GAN_DATA[p.branch];
    let hgItemsHTML = '';
    if (hgData) {
      if (hgData.here !== -1) {
        hgItemsHTML += `<div class="wonguk-detail-card-hg-item"><span class="hg-name">${STEMS[hgData.here]} (여기)</span><span class="hg-pct">${hgData.ratios[0]}%</span></div>`;
      }
      if (hgData.mid !== -1) {
        hgItemsHTML += `<div class="wonguk-detail-card-hg-item"><span class="hg-name">${STEMS[hgData.mid]} (중기)</span><span class="hg-pct">${hgData.ratios[1]}%</span></div>`;
      }
      hgItemsHTML += `<div class="wonguk-detail-card-hg-item" style="border-left: 2px solid #a855f7;"><span class="hg-name"><strong>${STEMS[hgData.main]} (정기)</strong></span><span class="hg-pct"><strong>${hgData.ratios[2]}%</strong></span></div>`;
    }

    const card = document.createElement('div');
    card.className = 'wonguk-detail-card';
    card.innerHTML = `
      <div class="wonguk-detail-card-header">
        <span class="col-t">${p.name}: ${STEMS[saju[p.label].stem]}${BRANCHES[p.branch]}</span>
        <span class="stage-t">${stage}</span>
      </div>
      <p class="wonguk-detail-card-desc">${stageInfo.desc}</p>
      <div class="wonguk-detail-card-hg-list">
        ${hgItemsHTML}
      </div>
    `;
    detailGrid.appendChild(card);
  });
}

// 3. 기본 운세 5대 카드 및 용신/현재흐름/절기 세력 세팅
function renderLuckCardsUI(saju, elemAnalysis, gyeokguk, result) {
  const ilganKor = STEMS[saju.il.stem];
  const ilganElem = STEMS_ELEM[saju.il.stem];

  const updateLuckCard = (prefix, title, score, desc, tags) => {
    document.getElementById(`luck-${prefix}-title`).innerText = title;
    document.getElementById(`luck-${prefix}-score`).innerText = score;
    document.getElementById(`luck-${prefix}-bar`).style.width = `${score}%`;
    document.getElementById(`luck-${prefix}-desc`).innerText = desc;
    
    const tagWrap = document.getElementById(`luck-${prefix}-tags`);
    tagWrap.innerHTML = '';
    tags.forEach(t => {
      const span = document.createElement('span');
      span.innerText = t;
      tagWrap.appendChild(span);
    });
  };

  // 1) 성향 카드
  const strengthName = elemAnalysis.strengthText.split(' ')[0];
  const pScore = Math.min(98, Math.max(45, Math.round(50 + (saju.il.stem * 3) + (elemAnalysis.strengthRatio * 30))));
  const pDesc = `${ilganKor}일간을 중심으로 원국이 짜여져 있으며, ${strengthName}의 균형도가 높아 주체성과 인내심이 강한 심리 패턴을 나타냅니다.`;
  updateLuckCard('p', `${strengthName}의 안정된 기질`, pScore, pDesc, [
    `일간 기조: ${ELEM_KOREAN[ilganElem].name.split('(')[0]} 기운`,
    `격국 성향: ${gyeokguk.split(' ')[0]}`,
    `조율 상태: ${strengthName}`
  ]);

  // 2) 애정운 카드
  const lScore = Math.min(95, Math.max(40, Math.round(50 + (saju.il.branch * 4) % 45)));
  const lDesc = `일지 배우자궁 ${BRANCHES[saju.il.branch]}의 안착도가 양호하여 관계는 전반적으로 온건하나, 원진 및 충이 드는 시기의 감정 조율이 연애 성패의 열쇠가 됩니다.`;
  updateLuckCard('l', '서로의 자율을 지지하는 연애', lScore, lDesc, [
    '일지 배우자성 안착',
    '감정 기복 방지 필요',
    '동반자적 배우자 인연'
  ]);

  // 3) 직업운 카드
  const jScore = Math.min(97, Math.max(45, Math.round(55 + (gyeokguk.length * 4))));
  const jDesc = `격국 ${gyeokguk.split(' ')[0]}의 영향으로 조직 내 기획 행정직 또는 자기 전문 기술을 살린 독립형 포지션에서 업무 성공 확률이 극대화됩니다.`;
  updateLuckCard('j', '전문성을 인정받는 커리어', jScore, jDesc, [
    `추천: ${ELEM_KOREAN[yongshinElement].name.split('(')[0]} 관련 기술직`,
    `방향: ${yongshinElement === 'wood' ? '동쪽' : yongshinElement === 'fire' ? '남쪽' : yongshinElement === 'earth' ? '중앙' : yongshinElement === 'metal' ? '서쪽' : '북쪽'}`,
    `역량: 주도적 전문 분야`
  ]);

  // 4) 재물운 카드
  const wScore = Math.min(96, Math.max(40, Math.round(50 + (elemAnalysis.score['earth'] * 6) % 45)));
  const wDesc = `안정지향적인 재산 증식 패턴을 보입니다. 무리한 단기 투기성 매매를 피하고 부동산이나 안전 계약을 기반으로 자산을 늘리는 것이 매우 유리합니다.`;
  updateLuckCard('w', '계획성과 실리 위주의 자산 형성', wScore, wDesc, [
    '근로 및 계약재물 위주',
    '금융 자산 쪼개기 권장',
    '용신 대운 시 자산 급증'
  ]);

  // 5) 건강운 카드
  const hScore = Math.min(95, Math.max(35, Math.round(40 + (elemAnalysis.score[yongshinElement] * 8) % 55)));
  const hDesc = `오행의 편중이 심화되는 환절기에는 소화기 및 관절 피로도가 높아지므로, 주기적인 휴식과 수분 보충, 걷기 등의 가벼운 아웃도어 활동이 중요합니다.`;
  updateLuckCard('h', '순환 및 생체 리듬 조율 유의', hScore, hDesc, [
    `부족 오행 보강 필요`,
    '환절기 리듬 다운 예방',
    `권장: ${yongshinElement === 'water' ? '수영, 반신욕' : yongshinElement === 'wood' ? '숲길 걷기' : '가벼운 스트레칭'}`
  ]);

  // 용신 활용 세부 가이드 박스
  const minColorName = ELEM_KOREAN[yongshinElement].name;
  const huiColorName = ELEM_KOREAN[huishinElement].name;
  document.getElementById('box-yongshin-title').innerText = `${minColorName.split('(')[0]} · ${huiColorName.split('(')[0]}`;
  document.getElementById('box-yongshin-body').innerHTML = `
    원국 균형이 무너지지 않도록 돕는 길한 색상은 <strong>${yongshinElement === 'wood' ? '초록색, 파란색' : yongshinElement === 'fire' ? '붉은색, 분홍색' : yongshinElement === 'earth' ? '황토색, 노란색' : yongshinElement === 'metal' ? '흰색, 밝은회색' : '검은색, 남색'}</strong> 계열입니다.<br>
    유리한 방향은 <strong>${yongshinElement === 'wood' ? '동쪽' : yongshinElement === 'fire' ? '남쪽' : yongshinElement === 'earth' ? '실내 중앙' : yongshinElement === 'metal' ? '서쪽' : '북쪽'}</strong>이며, 
    행운의 숫자는 <strong>${yongshinElement === 'wood' ? '3, 8' : yongshinElement === 'fire' ? '2, 7' : yongshinElement === 'earth' ? '5, 10' : yongshinElement === 'metal' ? '4, 9' : '1, 6'}</strong>입니다.
  `;

  // 현재 흐름 박스 (올해 세운과 대운)
  const isMale = (selectedGender === 'male') ? 1 : 0;
  const daYun = result.rawEightChar.getYun(isMale);
  const rawDaYunList = daYun.getDaYun();
  let curDaeunGanzhi = '을축';
  for (let i = 0; i < rawDaYunList.length; i++) {
    const dy = rawDaYunList[i];
    if (result.birthSolar.year + dy.getStartAge() <= new Date().getFullYear()) {
      curDaeunGanzhi = dy.getGanZhi();
    }
  }
  let currentYear = new Date().getFullYear();
  let curYearGanzhi = '병오';
  try {
    const curSolar = Solar.fromYmdHms(currentYear, 6, 1, 12, 0, 0);
    curYearGanzhi = curSolar.getLunar().getEightChar().getYearGanZhi();
  } catch(e){}

  document.getElementById('box-current-title').innerText = `${curYearGanzhi} · ${curDaeunGanzhi}`;
  document.getElementById('box-current-body').innerHTML = `
    올해 <strong>${curYearGanzhi}년</strong>은 사회적 성취와 대인 활동이 크게 확장되는 시기이나, 
    현재 <strong>${curDaeunGanzhi}대운</strong>의 계절적 영향력 하에 있으므로 감정에 치우친 무리한 사업 확장 등은 신중을 기할 필요가 있습니다.
  `;

  // 절기 기반 지장간 세력 박스
  const solarTerm = result.rawLunar.getJieQi(); // 절기명
  const woljiHan = BRANCHES_HAN[saju.wol.branch];
  const mainGanOfWolji = HIDE_GAN_DATA[saju.wol.branch].main;
  document.getElementById('box-solar-title').innerText = `${BRANCHES[saju.wol.branch]}월 · ${STEMS[mainGanOfWolji]} 우세`;
  document.getElementById('box-solar-body').innerHTML = `
    만세력 절기 산정 결과, 귀하는 <strong>${solarTerm || '해당월 절기'}</strong> 기준 구간에 출생하여, 
    월지 <strong>${woljiHan}(${BRANCHES[saju.wol.branch]})</strong>의 지장간 중 정기인 <strong>${STEMS_HAN[mainGanOfWolji]}(${STEMS[mainGanOfWolji]})</strong>의 기세가 원국의 기조를 지배하고 있어 실리적 성향이 강하게 드러납니다.
  `;
}

// 4. 일일 운세 캘린더 렌더러
function renderDailyCalendarUI(saju) {
  // 오늘 날짜 기준으로 초기 달력 세팅
  const today = new Date();
  calendarYear = today.getFullYear();
  calendarMonth = today.getMonth() + 1;
  
  renderCalendar(calendarYear, calendarMonth, saju);
  
  // 이전달/다음달 이벤트 바인딩
  document.getElementById('btn-cal-prev').onclick = () => {
    calendarMonth--;
    if (calendarMonth < 1) {
      calendarMonth = 12;
      calendarYear--;
    }
    renderCalendar(calendarYear, calendarMonth, saju);
  };
  
  document.getElementById('btn-cal-next').onclick = () => {
    calendarMonth++;
    if (calendarMonth > 12) {
      calendarMonth = 1;
      calendarYear++;
    }
    renderCalendar(calendarYear, calendarMonth, saju);
  };
}

// 일진 달력 그리기 핵심 함수
function renderCalendar(year, month, userSajuObj) {
  const container = document.getElementById('calendar-body');
  const monthText = document.getElementById('cal-month-text');
  if (!container || !monthText) return;

  monthText.innerText = `${year}년 ${month}월`;
  container.innerHTML = '';

  const firstDay = new Date(year, month - 1, 1).getDay();
  const numDays = new Date(year, month, 0).getDate();
  const prevNumDays = new Date(year, month - 1, 0).getDate();

  let row = document.createElement('tr');

  // 지난달 공백
  for (let i = 0; i < firstDay; i++) {
    const prevDay = prevNumDays - firstDay + i + 1;
    const td = document.createElement('td');
    td.innerHTML = `<div class="calendar-cell other-month"><span class="day-num">${prevDay}</span></div>`;
    row.appendChild(td);
  }

  let currentDayOfWeek = firstDay;
  for (let day = 1; day <= numDays; day++) {
    if (currentDayOfWeek === 7) {
      container.appendChild(row);
      row = document.createElement('tr');
      currentDayOfWeek = 0;
    }

    const td = document.createElement('td');
    let cellContent = '';
    let cellClass = 'calendar-cell';
    
    try {
      const solar = Solar.fromYmdHms(year, month, day, 12, 0, 0);
      const lunar = solar.getLunar();
      const eightChar = lunar.getEightChar();
      const dayGan = eightChar.getDayGan();
      const dayZhi = eightChar.getDayZhi();
      const dayGanIdx = STEMS_HAN.indexOf(dayGan);
      const dayZhiIdx = BRANCHES_HAN.indexOf(dayZhi);
      const dayElem = STEMS_ELEM[dayGanIdx];
      const dayBranchElem = BRANCHES_ELEM[dayZhiIdx];
      const dayGanzhiText = `${dayGan}${dayZhi}`;
      const dayLunarMonth = lunar.getMonth();
      const dayLunarDay = lunar.getDay();

      let godText = '';
      if (userSajuObj) {
        godText = getGodName(userSajuObj.il.stem, dayGanIdx);
      }

      // 오늘 날짜 여부
      const now = new Date();
      const isToday = (now.getFullYear() === year && now.getMonth() === month - 1 && now.getDate() === day);

      let isGood = false;
      let isWarn = false;

      if (userSajuObj && yongshinElement) {
        if (dayElem === yongshinElement || dayElem === huishinElement) {
          isGood = true;
        } else if (dayElem === gishinElement) {
          isWarn = true;
        }

        // 지지 충인 경우 경고 처리
        const userIljiBranchIdx = userSajuObj.il.branch;
        if (Math.abs(dayZhiIdx - userIljiBranchIdx) === 6) {
          isWarn = true;
          isGood = false;
        }
      }

      if (isToday) {
        cellClass += ' cell-today';
      } else if (isGood) {
        cellClass += ' cell-good';
      } else if (isWarn) {
        cellClass += ' cell-warn';
      }

      cellContent = `
        <div class="${cellClass}">
          <span class="day-num">${day}</span>
          <span class="ganzhi-text text-${elemClassMap[dayBranchElem]}">${dayGanzhiText}</span>
          <span class="lunar-text">${dayLunarMonth}.${dayLunarDay}</span>
          <span class="god-text">${godText || '-'}</span>
        </div>
      `;
    } catch (e) {
      cellContent = `<div class="calendar-cell"><span class="day-num">${day}</span></div>`;
    }

    td.innerHTML = cellContent;
    row.appendChild(td);
    currentDayOfWeek++;
  }

  // 다음달 공백
  let nextMonthDay = 1;
  while (currentDayOfWeek < 7) {
    const td = document.createElement('td');
    td.innerHTML = `<div class="calendar-cell other-month"><span class="day-num">${nextMonthDay}</span></div>`;
    row.appendChild(td);
    nextMonthDay++;
    currentDayOfWeek++;
  }

  container.appendChild(row);
}

// 5. 십성 배치표 및 오행 분포/신강 점수 슬라이더 세팅
function renderTechnicalMetricsUI(saju, gods, elemAnalysis) {
  const isSiEmpty = (saju.si.stem === -1);
  
  // 1) 십성 배치표 기입
  document.getElementById('tbl-si-stem').innerText = isSiEmpty ? '-' : `${STEMS[saju.si.stem]}`;
  document.getElementById('tbl-si-stem-god').innerText = isSiEmpty ? '-' : gods.si;
  document.getElementById('tbl-si-branch').innerText = isSiEmpty ? '-' : `${BRANCHES[saju.si.branch]}`;
  document.getElementById('tbl-si-branch-god').innerText = isSiEmpty ? '-' : getGodName(saju.il.stem, BRANCHES_ELEM.indexOf(BRANCHES_ELEM[saju.si.branch]));

  document.getElementById('tbl-il-stem').innerText = `${STEMS[saju.il.stem]}(일간)`;
  document.getElementById('tbl-il-branch').innerText = `${BRANCHES[saju.il.branch]}`;
  document.getElementById('tbl-il-branch-god').innerText = getGodName(saju.il.stem, BRANCHES_ELEM.indexOf(BRANCHES_ELEM[saju.il.branch]));

  document.getElementById('tbl-wol-stem').innerText = `${STEMS[saju.wol.stem]}`;
  document.getElementById('tbl-wol-stem-god').innerText = gods.wol;
  document.getElementById('tbl-wol-branch').innerText = `${BRANCHES[saju.wol.branch]}`;
  document.getElementById('tbl-wol-branch-god').innerText = getGodName(saju.il.stem, BRANCHES_ELEM.indexOf(BRANCHES_ELEM[saju.wol.branch]));

  document.getElementById('tbl-yeon-stem').innerText = `${STEMS[saju.yeon.stem]}`;
  document.getElementById('tbl-yeon-stem-god').innerText = gods.yeon;
  document.getElementById('tbl-yeon-branch').innerText = `${BRANCHES[saju.yeon.branch]}`;
  document.getElementById('tbl-yeon-branch-god').innerText = getGodName(saju.il.stem, BRANCHES_ELEM.indexOf(BRANCHES_ELEM[saju.yeon.branch]));

  // 2) 신강/신약 점수 슬라이더
  const pct = Math.round(elemAnalysis.strengthRatio * 100);
  document.getElementById('res-strength-fill').style.left = `${pct}%`;
  document.getElementById('res-strength-thumb').style.left = `${pct}%`;
  document.getElementById('res-strength-pct').innerText = `${pct}%`;
  
  const strengthName = elemAnalysis.strengthText.split(' ')[0];
  document.getElementById('res-w-strength-title').innerText = strengthName;

  // 득령, 득지, 득세 세부 연산 대입
  const ilganElem = STEMS_ELEM[saju.il.stem];
  
  // 득령: 월지가 나를 돕는 오행(same or get)
  const woljiElem = BRANCHES_ELEM[saju.wol.branch];
  const isDeungryeong = (woljiElem === ilganElem || ELEM_RELATION[ilganElem][woljiElem] === 'get');
  const deungryeongScore = isDeungryeong ? 3.0 : 0.0;
  
  // 득지: 일지가 나를 돕는 오행
  const iljiElem = BRANCHES_ELEM[saju.il.branch];
  const isDeungji = (iljiElem === ilganElem || ELEM_RELATION[ilganElem][iljiElem] === 'get');
  const deungjiScore = isDeungji ? 2.0 : 0.0;

  // 득세: 그 외 연주, 시주, 천간들이 돕는 총합 점수
  let deungseStems = 0;
  let deungseBranches = 0;

  const checkDeungse = (elem) => (elem === ilganElem || ELEM_RELATION[ilganElem][elem] === 'get');

  if (checkDeungse(STEMS_ELEM[saju.yeon.stem])) deungseStems += 1.0;
  if (checkDeungse(STEMS_ELEM[saju.wol.stem])) deungseStems += 1.0;
  if (!isSiEmpty && checkDeungse(STEMS_ELEM[saju.si.stem])) deungseStems += 1.0;

  if (checkDeungse(BRANCHES_ELEM[saju.yeon.branch])) deungseBranches += 1.0;
  if (!isSiEmpty && checkDeungse(BRANCHES_ELEM[saju.si.branch])) deungseBranches += 1.0;

  // 보정수치 적용 소수점
  const deungseTotal = deungseStems + deungseBranches * 0.1;

  document.getElementById('sc-deungryeong').innerText = deungryeongScore > 0 ? `+${deungryeongScore.toFixed(1)}` : '0.0';
  document.getElementById('sc-deungji').innerText = deungjiScore > 0 ? `+${deungjiScore.toFixed(1)}` : '0.0';
  document.getElementById('sc-deungse').innerText = deungseStems > 0 ? `+${deungseStems.toFixed(1)}` : '0.0';
  document.getElementById('sc-deungse-total').innerText = deungseBranches > 0 ? `+${(deungseBranches * 0.1).toFixed(1)}` : '0.0';

  // 3) 용신/희신/기신 디테일 세팅
  const yongElemKor = ELEM_KOREAN[yongshinElement].name;
  const yongGod = getGodName(saju.il.stem, STEMS_ELEM.indexOf(yongshinElement));
  document.getElementById('res-w-yongshin-title').innerText = `${yongElemKor.split('(')[0]}`;
  document.getElementById('res-w-yongshin-title').className = `text-${yongshinElement}`;

  document.getElementById('ys-yong-val').innerText = `${yongElemKor} (${yongGod || '용신'})`;
  document.getElementById('ys-yong-val').className = `text-${yongshinElement}`;
  
  const huiElemKor = ELEM_KOREAN[huishinElement].name;
  const huiGod = getGodName(saju.il.stem, STEMS_ELEM.indexOf(huishinElement));
  document.getElementById('ys-hui-val').innerText = `${huiElemKor} (${huiGod || '희신'})`;
  document.getElementById('ys-hui-val').className = `text-${huishinElement}`;

  const giElemKor = ELEM_KOREAN[gishinElement].name;
  const giGod = getGodName(saju.il.stem, STEMS_ELEM.indexOf(gishinElement));
  document.getElementById('ys-gi-val').innerText = `${giElemKor} (${giGod || '기신'})`;
  document.getElementById('ys-gi-val').className = `text-${gishinElement}`;

  // 4) 오행 백분율 수평 바 세팅
  const totalScore = isSiEmpty ? 8 : 10;
  const updateElemBar = (elemKey) => {
    const score = elemAnalysis.score[elemKey];
    const elemPct = Math.round((score / totalScore) * 100);
    
    document.getElementById(`ep-bar-${elemKey}`).style.width = `${elemPct}%`;
    document.getElementById(`ep-val-${elemKey}`).innerText = `${elemPct}%`;
    
    const count = elemAnalysis.counts[elemKey];
    const statusEl = document.getElementById(`ep-status-${elemKey}`);
    if (count >= 3) {
      statusEl.className = 'ep-status ep-tag-over';
      statusEl.innerText = '과다';
    } else if (count >= 1) {
      statusEl.className = 'ep-status ep-tag-good';
      statusEl.innerText = '적정';
    } else {
      statusEl.className = 'ep-status ep-tag-under';
      statusEl.innerText = '부족';
    }
  };

  updateElemBar('wood');
  updateElemBar('fire');
  updateElemBar('earth');
  updateElemBar('metal');
  updateElemBar('water');

  // 오행분포 타이틀 세팅 (가장 우세한 오행 명칭 출력)
  let maxElemKey = 'wood';
  for (const k in elemAnalysis.score) {
    if (elemAnalysis.score[k] > elemAnalysis.score[maxElemKey]) {
      maxElemKey = k;
    }
  }
  document.getElementById('res-w-elem-title').innerText = `${ELEM_KOREAN[maxElemKey].name.split('(')[0]} 우세`;
}

// 6. 12운성 타임라인 및 대운 내비게이션 세팅
function renderTimelineUI(saju, daeunList, ageWestern, directionText, daeunStartAge) {
  const isSiEmpty = (saju.si.stem === -1);
  const energyGrid = document.getElementById('lifestage-energy-grid');
  energyGrid.innerHTML = '';

  const columns = [
    { label: '연주', hint: '초년운 0~15세', branchIdx: saju.yeon.branch },
    { label: '월주', hint: '청년운 15~35세', branchIdx: saju.wol.branch },
    { label: '일주', hint: '중년운 35~50세', branchIdx: saju.il.branch },
    { label: '시주', hint: '말년운 50세~', branchIdx: saju.si.branch }
  ];

  columns.forEach(col => {
    const card = document.createElement('div');
    if (col.branchIdx === -1) {
      card.className = 'lifestage-energy-card unknown-stage';
      card.innerHTML = `
        <span class="col-name">${col.label}<br><span class="age-hint">${col.hint}</span></span>
        <div class="energy-icon"><i class="fa-solid fa-question"></i></div>
        <span class="stage-name">미상</span>
        <span class="stage-sub">-</span>
      `;
    } else {
      const stage = getLifestage(saju.il.stem, col.branchIdx);
      const stageInfo = LIFESTAGE_ICONS[stage] || { icon: 'fa-solid fa-circle', power: '중', powerClass: 'power-mid', desc: '' };
      const branchElem = BRANCHES_ELEM[col.branchIdx];

      card.className = 'lifestage-energy-card';
      card.innerHTML = `
        <span class="col-name">${col.label}<br><span class="age-hint">${col.hint}</span></span>
        <div class="energy-icon energy-icon-${branchElem}"><i class="${stageInfo.icon}"></i></div>
        <span class="stage-name">${stage}</span>
        <span class="stage-sub">(${stage})</span>
        <span class="badge-power ${stageInfo.powerClass}">${stageInfo.power}</span>
        <p class="stage-desc">${stageInfo.desc}</p>
      `;
    }
    energyGrid.appendChild(card);
  });

  // 대운 연대기 슬라이더 렌더링
  const daeunSlider = document.getElementById('daeun-slider');
  daeunSlider.innerHTML = '';

  // 대운수 메타 정보 갱신
  const genderName = selectedGender === 'male' ? '남' : '여';
  document.getElementById('daeun-meta-info').innerText = `${genderName} · 대운수 ${daeunStartAge}세 기준 (${directionText})`;
  document.getElementById('daeun-current-age').innerText = `현재 나이: 만 ${ageWestern}세`;
  document.getElementById('btn-dt-direction').innerText = directionText;

  // 현재 대운 인덱스 판단
  let currentDaeunIdx = -1;
  for (let i = 0; i < daeunList.length; i++) {
    const start = daeunList[i].startAge;
    const end = daeunList[i+1] ? daeunList[i+1].startAge : 999;
    if (ageWestern >= start && ageWestern < end) {
      currentDaeunIdx = i;
      break;
    }
  }

  daeunList.forEach((d, idx) => {
    const card = document.createElement('div');
    let cardClass = 'daeun-item-card';
    
    if (idx === currentDaeunIdx) {
      cardClass += ' current-daeun';
    } else if (idx < currentDaeunIdx) {
      cardClass += ' past-daeun';
    } else {
      cardClass += ' future-daeun';
    }

    card.className = cardClass;
    
    // 대운 천간 지지 분해 및 십신/12운성 연산
    const dyGan = d.ganzhi[0];
    const dyZhi = d.ganzhi[1];
    const dyGanIdx = STEMS_HAN.indexOf(dyGan);
    const dyZhiIdx = BRANCHES_HAN.indexOf(dyZhi);
    const dyGod = getGodName(saju.il.stem, dyGanIdx);
    const dyStage = getLifestage(saju.il.stem, dyZhiIdx);

    card.innerHTML = `
      <span class="di-title">${d.index}대운</span>
      <span class="di-age">${d.startAge}세~</span>
      <span class="di-year">${d.startYear}년</span>
      <span class="di-ganzhi" style="color:#fff;">${d.ganzhi}</span>
      <span class="di-god">${dyGod || '일간'}</span>
      <span class="di-stage">${dyStage}</span>
    `;

    daeunSlider.appendChild(card);
  });
}

// 복사, 저장, 공유 등의 부가 액션 바인딩
document.getElementById('btn-copy-result').onclick = () => {
  const iljuName = document.getElementById('res-dm-title').innerText;
  const birthText = document.getElementById('res-birth-date').innerText;
  const resultText = `[CineAHO 사주 진단 결과]\n사주 일주: ${iljuName}\n생년월일: ${birthText}\n분석 완료되었습니다.`;
  navigator.clipboard.writeText(resultText).then(() => {
    alert('결과 요약이 클립보드에 복사되었습니다.');
  });
};

document.getElementById('btn-save-result').onclick = () => {
  alert('이미지 파일 다운로드 또는 PDF 저장 모드가 준비 중입니다.');
};

document.getElementById('btn-share-result').onclick = () => {
  alert('현재 결과 공유용 단축 링크 생성 기능이 활성화되었습니다.');
};

document.getElementById('btn-share-app').onclick = () => {
  alert('어플리케이션 설치 링크가 클립보드에 복사되었습니다.');
};

// 궁합 시작 버튼 유도
document.getElementById('btn-comp-start').onclick = () => {
  alert('궁합 분석 모드가 실행됩니다. 상대방 출생 정보를 입력해 주세요.');
};

// AI 리포트 탭 스위치
function switchReportTab(tab) {
  currentReportTab = tab;
  
  document.querySelectorAll('.rep-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  const body = document.getElementById('report-content-body');
  if (body && reportData[tab]) {
    body.innerHTML = reportData[tab];
  }
}

// ----------------------------------------------------
// UI 제어 및 이벤트 바인딩
// ----------------------------------------------------

// 양음력 토글
document.getElementById('btn-solar-lunar').addEventListener('click', (e) => {
  selectedSolarLunar = 'solar';
  document.getElementById('btn-solar-lunar').classList.add('active');
  document.getElementById('btn-lunar').classList.remove('active');
  document.getElementById('lunar-leap-box').style.display = 'none';
});

document.getElementById('btn-lunar').addEventListener('click', (e) => {
  selectedSolarLunar = 'lunar';
  document.getElementById('btn-lunar').classList.add('active');
  document.getElementById('btn-solar-lunar').classList.remove('active');
  document.getElementById('lunar-leap-box').style.display = 'block';
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

// 시각 모름 체크박스 연동
document.getElementById('chk-time-unknown').addEventListener('change', (e) => {
  const row = document.getElementById('time-fields-row');
  if (e.target.checked) {
    row.style.opacity = '0.35';
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

// 플로팅 위젯 제어
const btnMenuTrigger = document.getElementById('btn-menu-trigger');
const navOverlayMenu = document.getElementById('nav-overlay-menu');

if (btnMenuTrigger) {
  btnMenuTrigger.addEventListener('click', () => {
    navOverlayMenu.classList.toggle('active');
  });
}

const btnScrollTop = document.getElementById('btn-scroll-top');
if (btnScrollTop) {
  btnScrollTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

const btnScrollBottom = document.getElementById('btn-scroll-bottom');
if (btnScrollBottom) {
  btnScrollBottom.addEventListener('click', () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  });
}

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  let percent = 0;
  if (docHeight > 0) {
    percent = Math.round((scrollTop / docHeight) * 100);
  }

  const progressText = document.querySelector('.progress-text');
  if (progressText) progressText.innerText = `${percent}%`;

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

