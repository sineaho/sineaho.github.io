// CineAHO Lotto Generator Pro Engine

// DOM 요소 참조
const gameCountSelect = document.getElementById('game-count');
const lottoResultsBoard = document.getElementById('lotto-results-board');
const btnCopyAll = document.getElementById('btn-copy-all');
const toastNotif = document.getElementById('toast-notif');

// 시뮬레이터 DOM 요소 참조
const simTargetBalls = document.getElementById('sim-target-balls');
const btnSimStart = document.getElementById('btn-sim-start');
const btnSimStop = document.getElementById('btn-sim-stop');
const btnSimReset = document.getElementById('btn-sim-reset');

const txtSimTotalDraws = document.getElementById('sim-total-draws');
const txtSimTotalCost = document.getElementById('sim-total-cost');
const txtSimTimeSpent = document.getElementById('sim-time-spent');
const txtSimReturnRate = document.getElementById('sim-return-rate');

const txtSimGrade1 = document.getElementById('sim-grade-1');
const txtSimGrade2 = document.getElementById('sim-grade-2');
const txtSimGrade3 = document.getElementById('sim-grade-3');
const txtSimGrade4 = document.getElementById('sim-grade-4');
const txtSimGrade5 = document.getElementById('sim-grade-5');

// 글로벌 상태 변수
let generatedGames = []; // 생성된 게임들의 번호 배열 [[n1..n6], [n1..n6], ...]
let targetNumbers = []; // 시뮬레이터가 공략할 고정 번호 (6개)

// 시뮬레이터 상태 변수
let simIntervalId = null;
let simRunning = false;
let simTotalDraws = 0;
let simGradeCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
let simTotalPrize = 0;

// 가상의 과거 당첨 번호 빈도 통계 (핫/콜드 번호 분류용 모델)
// 나눔로또 실제 통계 트렌드를 일부 모사한 가중치 설정
const LOTTO_FREQ_WEIGHTS = {};
for (let i = 1; i <= 45; i++) {
  // 기본 출현율은 다 다르게 매핑 (핫 번호: 34, 43, 27, 18 등 / 콜드 번호: 9, 22 등)
  if ([34, 43, 27, 18, 1, 13, 17, 4, 39, 33].includes(i)) {
    LOTTO_FREQ_WEIGHTS[i] = 1.4; // 핫 번호 가중치
  } else if ([9, 22, 23, 29, 30, 41, 15, 32, 5].includes(i)) {
    LOTTO_FREQ_WEIGHTS[i] = 0.7; // 콜드 번호 가중치
  } else {
    LOTTO_FREQ_WEIGHTS[i] = 1.0; // 표준 가중치
  }
}

// ----------------------------------------------------
// 로또 번호 추출 알고리즘
// ----------------------------------------------------

// 1. 순수 랜덤 생성 (셔플법)
function generateRandomNumbers() {
  const numbers = [];
  while (numbers.length < 6) {
    const r = Math.floor(Math.random() * 45) + 1;
    if (!numbers.includes(r)) {
      numbers.push(r);
    }
  }
  return numbers.sort((a, b) => a - b);
}

// 가중치 배열에서 고유 번호 6개 추출하는 헬퍼
function drawWeightedNumbers(weightsMap) {
  const pool = [];
  for (let i = 1; i <= 45; i++) {
    const weight = weightsMap[i] || 1.0;
    // 가중치에 비례해서 숫자를 풀에 담음 (속도 향상을 위한 10배 정수 변환)
    const tickets = Math.round(weight * 10);
    for (let t = 0; t < tickets; t++) {
      pool.push(i);
    }
  }

  const result = [];
  while (result.length < 6) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    const chosen = pool[randomIndex];
    if (!result.includes(chosen)) {
      result.push(chosen);
    }
  }
  return result.sort((a, b) => a - b);
}

// 2. AI 추천 생성 (통계 + 패턴 + 미출현 믹싱)
function generateAINumbers() {
  // AI 가중치 맵 구성 (미출현 번호에 일시적 보너스 부여)
  const aiWeights = { ...LOTTO_FREQ_WEIGHTS };
  // 콜드 번호(9, 22, 23 등)를 일부 뜨겁게 보정하여 당첨 확률 가치 상향 유도
  [9, 22, 23].forEach(num => {
    aiWeights[num] = 1.5; // 미출현 반발 가중치
  });
  return drawWeightedNumbers(aiWeights);
}

// 3. 빈도수 기반 생성 (과거 빈도 상위 가중치 극대화)
function generateFrequencyNumbers() {
  const freqWeights = {};
  for (let i = 1; i <= 45; i++) {
    // 핫 번호는 극대화(3.0배), 콜드 번호는 완전 배제(0.1배)하여 빈도 쏠림 현상 모사
    if (LOTTO_FREQ_WEIGHTS[i] > 1.0) {
      freqWeights[i] = 3.0;
    } else if (LOTTO_FREQ_WEIGHTS[i] < 1.0) {
      freqWeights[i] = 0.1;
    } else {
      freqWeights[i] = 1.0;
    }
  }
  return drawWeightedNumbers(freqWeights);
}

// 4. 패턴 기반 생성 (수학적 균형 필터)
function generatePatternNumbers() {
  let attempts = 0;
  while (attempts < 1000) {
    attempts++;
    const nums = generateRandomNumbers();

    // 1) 홀짝 비율 계산
    const odds = nums.filter(n => n % 2 !== 0).length;
    const evens = 6 - odds;
    const isOddEvenBalanced = (odds === 3 && evens === 3) || (odds === 4 && evens === 2) || (odds === 2 && evens === 4);

    if (!isOddEvenBalanced) continue;

    // 2) 고저 비율 계산 (1~22 Low / 23~45 High)
    const lows = nums.filter(n => n <= 22).length;
    const highs = 6 - lows;
    const isLowHighBalanced = (lows === 3 && highs === 3) || (lows === 4 && highs === 2) || (lows === 2 && highs === 4);

    if (!isLowHighBalanced) continue;

    // 3) 총합 계산 (100 ~ 170 범위 권장)
    const sum = nums.reduce((a, b) => a + b, 0);
    const isSumOk = (sum >= 100 && sum <= 170);

    if (isSumOk) {
      return nums;
    }
  }
  // 예외 시 백업
  return generateRandomNumbers();
}

// ----------------------------------------------------
// UI 렌더링 및 클릭 이벤트
// ----------------------------------------------------

// 로또 공 색상 클래스 가져오기 (한국 공식 규격)
function getBallColorClass(num) {
  if (num <= 10) return 'ball-yellow';
  if (num <= 20) return 'ball-blue';
  if (num <= 30) return 'ball-red';
  if (num <= 40) return 'ball-grey';
  return 'ball-green';
}

// 로또판에 생성된 게임 렌더링
function renderLottoGames(modeName) {
  const count = parseInt(gameCountSelect.value);
  generatedGames = [];
  lottoResultsBoard.innerHTML = '';

  // 알파벳 식별자 배열
  const alphabets = ['A', 'B', 'C', 'D', 'E'];

  for (let i = 0; i < count; i++) {
    let numbers = [];
    if (modeName === 'ai') numbers = generateAINumbers();
    else if (modeName === 'freq') numbers = generateFrequencyNumbers();
    else if (modeName === 'pattern') numbers = generatePatternNumbers();
    else numbers = generateRandomNumbers();

    generatedGames.push(numbers);

    // 게임 로우 생성
    const rowDiv = document.createElement('div');
    rowDiv.className = 'game-row';
    
    // 라벨
    const labelSpan = document.createElement('span');
    labelSpan.className = 'game-label';
    labelSpan.innerText = alphabets[i];
    rowDiv.appendChild(labelSpan);

    // 공 컨테이너
    const containerDiv = document.createElement('div');
    containerDiv.className = 'balls-container';

    numbers.forEach(num => {
      const ballSpan = document.createElement('span');
      ballSpan.className = `lotto-ball ${getBallColorClass(num)}`;
      ballSpan.innerText = num;
      containerDiv.appendChild(ballSpan);
    });

    rowDiv.appendChild(containerDiv);

    // 마우스 호버 시 타겟 지정 유도 툴팁 대신 간편 클릭 액션 연결
    rowDiv.style.cursor = 'pointer';
    rowDiv.title = '이 조합을 시뮬레이터 도전 번호로 지정합니다.';
    
    const gameIndex = i;
    rowDiv.addEventListener('click', () => {
      setSimTargetNumbers(generatedGames[gameIndex]);
      // 시안의 보드 하이라이트 전환
      document.querySelectorAll('.game-row').forEach(r => r.classList.remove('ball-target-active'));
      rowDiv.classList.add('ball-target-active');
    });

    lottoResultsBoard.appendChild(rowDiv);
  }

  // 첫 번째 게임 번호를 자동으로 시뮬레이터 타겟으로 사전 설정
  if (generatedGames.length > 0) {
    setSimTargetNumbers(generatedGames[0]);
    document.querySelector('.game-row').classList.add('ball-target-active');
  }
}

// ----------------------------------------------------
// 시뮬레이터 도전 번호 설정 및 동기화
// ----------------------------------------------------

function setSimTargetNumbers(nums) {
  if (simRunning) return; // 실행 중엔 고정 변경 불가능
  targetNumbers = [...nums].sort((a, b) => a - b);

  // 시뮬레이터 볼 렌더링 갱신
  simTargetBalls.innerHTML = '';
  targetNumbers.forEach(num => {
    const ballSpan = document.createElement('span');
    ballSpan.className = `sim-ball ${getBallColorClass(num)}`;
    ballSpan.innerText = num;
    simTargetBalls.appendChild(ballSpan);
  });

  // 버튼 활성화
  btnSimStart.disabled = false;
  btnSimReset.disabled = false;
}

// ----------------------------------------------------
// 클립보드 전체 복사 기능
// ----------------------------------------------------

btnCopyAll.addEventListener('click', () => {
  if (generatedGames.length === 0) {
    alert('먼저 번호를 생성해 주세요.');
    return;
  }

  const alphabets = ['A', 'B', 'C', 'D', 'E'];
  let textToCopy = '[CineAHO 로또 추천 생성 번호]\n';
  generatedGames.forEach((nums, index) => {
    textToCopy += `${alphabets[index]} 게임: ${nums.map(n => String(n).padStart(2, '0')).join(', ')}\n`;
  });
  textToCopy += '-------------------------------\nCineAHO 웹앱 스토어에서 즉석 복사됨.';

  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      // 토스트 알림 띄우기
      toastNotif.classList.add('active');
      setTimeout(() => {
        toastNotif.classList.remove('active');
      }, 1500);
    })
    .catch(err => {
      console.error('복사 에러:', err);
      alert('복사에 실패했습니다. 번호를 직접 복사해 주세요.');
    });
});

// ----------------------------------------------------
// 고속 로또 시뮬레이터 제어
// ----------------------------------------------------

// 1회 가상 당첨 추첨 함수 (6개 당첨번호 + 1개 보너스번호 무작위 반환)
function drawWinningNumbers() {
  const nums = [];
  while (nums.length < 6) {
    const r = Math.floor(Math.random() * 45) + 1;
    if (!nums.includes(r)) {
      nums.push(r);
    }
  }
  // 보너스 번호 (기존 6개와 겹치지 않게)
  let bonus = 0;
  while (true) {
    const r = Math.floor(Math.random() * 45) + 1;
    if (!nums.includes(r)) {
      bonus = r;
      break;
    }
  }
  return { main: nums, bonus };
}

// 시뮬레이터 통계 UI 실시간 업데이트 (스마트 스로틀링)
function updateSimStatsUI() {
  txtSimTotalDraws.innerText = `${simTotalDraws.toLocaleString()}회`;
  
  const cost = simTotalDraws * 1000;
  txtSimTotalCost.innerText = `${cost.toLocaleString()}원`;

  // 경과 시간 계산 (52주 = 1년)
  const years = Math.floor(simTotalDraws / 52);
  const weeks = simTotalDraws % 52;
  txtSimTimeSpent.innerText = `${years.toLocaleString()}년 ${weeks}주`;

  // 수익률 계산
  let rate = 0;
  if (cost > 0) {
    rate = (simTotalPrize / cost) * 100;
  }
  txtSimReturnRate.innerText = `${simTotalPrize.toLocaleString()}원 (${rate.toFixed(2)}%)`;
  
  // 수익률에 따른 텍스트 배색 피드백
  if (rate >= 100) {
    txtSimReturnRate.className = 'text-green';
  } else if (rate > 0) {
    txtSimReturnRate.className = 'text-cyan';
  } else {
    txtSimReturnRate.className = 'text-red';
  }

  // 등수별 횟수 업데이트
  txtSimGrade1.innerText = `${simGradeCounts[1]}회`;
  txtSimGrade2.innerText = `${simGradeCounts[2]}회`;
  txtSimGrade3.innerText = `${simGradeCounts[3]}회`;
  txtSimGrade4.innerText = `${simGradeCounts[4]}회`;
  txtSimGrade5.innerText = `${simGradeCounts[5]}회`;
}

// 시뮬레이터 루프 (초당 수천 회 초고속 연산 처리)
function runSimulationBatch() {
  if (!simRunning) return;

  // 한 프레임당 실행할 모의 추첨 횟수 (CPU 부하를 고려해 약 4000회씩 수행)
  const batchSize = 4000;

  for (let i = 0; i < batchSize; i++) {
    simTotalDraws++;
    const win = drawWinningNumbers();

    // 일치하는 공 개수 세기
    let matchCount = 0;
    for (let k = 0; k < 6; k++) {
      if (targetNumbers.includes(win.main[k])) {
        matchCount++;
      }
    }

    // 등수 판정 및 당첨금 적립 (나눔로또 기대 수령금 기준 반영)
    if (matchCount === 6) {
      simGradeCounts[1]++;
      simTotalPrize += 2000000000; // 20억원
      
      // 1등 당첨 시 시뮬레이션 즉각 중단!
      simRunning = false;
      updateSimStatsUI();
      btnSimStart.disabled = false;
      btnSimStop.disabled = true;
      
      setTimeout(() => {
        alert(`축하합니다! 무려 ${simTotalDraws.toLocaleString()}회 추첨만에 로또 1등에 당첨되셨습니다!\n소모비용: ${(simTotalDraws*1000).toLocaleString()}원\n가상 경과 시간: ${Math.floor(simTotalDraws/52).toLocaleString()}년`);
      }, 100);
      return;
    } 
    else if (matchCount === 5 && targetNumbers.includes(win.bonus)) {
      simGradeCounts[2]++;
      simTotalPrize += 50000000; // 5천만원
    } 
    else if (matchCount === 5) {
      simGradeCounts[3]++;
      simTotalPrize += 1500000; // 150만원
    } 
    else if (matchCount === 4) {
      simGradeCounts[4]++;
      simTotalPrize += 50000; // 5만원 (고정)
    } 
    else if (matchCount === 3) {
      simGradeCounts[5]++;
      simTotalPrize += 5000; // 5천원 (고정)
    }
  }

  // 1프레임 연산 후 UI 업데이트
  updateSimStatsUI();

  // 재귀 호출
  if (simRunning) {
    requestAnimationFrame(runSimulationBatch);
  }
}

// 시뮬레이터 시작
btnSimStart.addEventListener('click', () => {
  if (targetNumbers.length < 6) return;
  simRunning = true;
  
  btnSimStart.disabled = true;
  btnSimStop.disabled = false;
  btnSimReset.disabled = true;
  gameCountSelect.disabled = true;
  document.querySelectorAll('.btn-mode').forEach(btn => btn.disabled = true);

  // 시뮬레이션 루프 발동
  requestAnimationFrame(runSimulationBatch);
});

// 시뮬레이터 정지
btnSimStop.addEventListener('click', () => {
  simRunning = false;
  btnSimStart.disabled = false;
  btnSimStop.disabled = true;
  btnSimReset.disabled = false;
  gameCountSelect.disabled = false;
  document.querySelectorAll('.btn-mode').forEach(btn => btn.disabled = false);
});

// 결과 초기화
btnSimReset.addEventListener('click', () => {
  if (simRunning) return;
  simTotalDraws = 0;
  simTotalPrize = 0;
  simGradeCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  updateSimStatsUI();
  btnSimReset.disabled = true;
});

// ----------------------------------------------------
// 모드별 번호 생성 이벤트 바인딩
// ----------------------------------------------------

document.getElementById('btn-mode-ai').addEventListener('click', () => renderLottoGames('ai'));
document.getElementById('btn-mode-freq').addEventListener('click', () => renderLottoGames('freq'));
document.getElementById('btn-mode-pattern').addEventListener('click', () => renderLottoGames('pattern'));
document.getElementById('btn-mode-random').addEventListener('click', () => renderLottoGames('random'));

// 초기화: 첫 진입 시 AI 추천 5게임 세팅해 놓기
renderLottoGames('ai');
