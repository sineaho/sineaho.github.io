// CineAHO Calculator Pro Ultimate Javascript Engine

// 글로벌 상태 변수
let currentMode = 'standard';
let displayValue = '0';
let formulaValue = '';
let memoryValue = 0;
let calculationHistory = [];

// 프로그래머 계산기 진법 상태
let programmerInputBase = 10; // 기본 10진수 입력

// DOM 참조
const lcdFormula = document.getElementById('lcd-formula');
const lcdOutput = document.getElementById('lcd-output');
const btnCopyDisplay = document.getElementById('btn-copy-display');
const calcPadArea = document.getElementById('calc-pad-area');
const historyList = document.getElementById('history-list');
const btnClearHistory = document.getElementById('btn-clear-history');
const toastNotif = document.getElementById('calc-toast');

// 모드 인디케이터
const indicatorIcon = document.getElementById('indicator-icon');
const modeTitleText = document.getElementById('mode-title-text');
const modeDescBadge = document.getElementById('mode-desc-badge');

// ----------------------------------------------------
// 1. 디스플레이 제어 헬퍼
// ----------------------------------------------------

function updateDisplay() {
  lcdOutput.innerText = displayValue;
  lcdFormula.innerText = formulaValue;
}

function clearAll() {
  displayValue = '0';
  formulaValue = '';
  updateDisplay();
}

function clearEntry() {
  displayValue = '0';
  updateDisplay();
}

function handleBackspace() {
  if (displayValue.length > 1) {
    displayValue = displayValue.slice(0, -1);
  } else {
    displayValue = '0';
  }
  updateDisplay();
}

function appendToDisplay(char) {
  if (displayValue === '0' && char !== '.') {
    displayValue = char;
  } else {
    // 소수점 중복 제한
    if (char === '.' && displayValue.includes('.')) return;
    displayValue += char;
  }
  updateDisplay();
}

// ----------------------------------------------------
// 2. 수식 계산 파서 (안전한 수학 계산)
// ----------------------------------------------------

function evaluateExpression(expr) {
  try {
    // 안전한 수식 정화 (허용된 수학 문자만 필터링)
    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'Math.PI')
      .replace(/e/g, 'Math.E')
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/√\(/g, 'Math.sqrt(');

    // 허용 문자 외 제거 (안전 방어막)
    sanitized = sanitized.replace(/[^0-9+\-*/().\sMathPIEsinocalgqrt]/g, '');

    const result = new Function(`return (${sanitized})`)();
    if (result === undefined || isNaN(result)) return 'Error';
    
    // 부동소수점 오차 정밀도 보정 (소수점 10자리 제한)
    if (Number.isInteger(result)) return String(result);
    return String(parseFloat(result.toFixed(10)));
  } catch (e) {
    return 'Error';
  }
}

// 계산 결과 완료 처리 및 기록 누적
function performEquals() {
  if (formulaValue === '') {
    formulaValue = displayValue;
  } else {
    formulaValue += displayValue;
  }

  const result = evaluateExpression(formulaValue);
  
  if (result !== 'Error') {
    // 히스토리 기록
    addHistoryItem(formulaValue, result);
  }

  displayValue = result;
  formulaValue = '';
  updateDisplay();
}

// 계산 히스토리 추가
function addHistoryItem(formula, result) {
  calculationHistory.push({ formula, result });
  
  // DOM 갱신
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = '';
  if (calculationHistory.length === 0) {
    historyList.innerHTML = '<div class="history-empty">아직 계산 기록이 없습니다.</div>';
    return;
  }

  calculationHistory.slice().reverse().forEach((item, idx) => {
    const histDiv = document.createElement('div');
    histDiv.className = 'history-item';
    
    const formulaDiv = document.createElement('div');
    formulaDiv.className = 'hist-formula';
    formulaDiv.innerText = item.formula + ' =';
    
    const resultDiv = document.createElement('div');
    resultDiv.className = 'hist-result';
    resultDiv.innerText = item.result;

    histDiv.appendChild(formulaDiv);
    histDiv.appendChild(resultDiv);

    // 역사 항목 클릭 시 계산기에 복원
    histDiv.addEventListener('click', () => {
      displayValue = item.result;
      formulaValue = '';
      updateDisplay();
    });

    historyList.appendChild(histDiv);
  });
}

// ----------------------------------------------------
// 3. 8단 계산기 모드별 템플릿 마크업 렌더러
// ----------------------------------------------------

const KEYPAD_TEMPLATES = {
  // 1) 표준 계산기
  standard: `
    <div class="keys-grid-5" style="margin-bottom: 0.5rem;">
      <button class="btn-calc btn-mem" onclick="handleMemory('MC')">MC</button>
      <button class="btn-calc btn-mem" onclick="handleMemory('MR')">MR</button>
      <button class="btn-calc btn-mem" onclick="handleMemory('M+')">M+</button>
      <button class="btn-calc btn-mem" onclick="handleMemory('M-')">M-</button>
      <button class="btn-calc btn-mem" onclick="handleMemory('MS')">MS</button>
    </div>
    <div class="keys-grid">
      <button class="btn-calc btn-op-single" onclick="handleSingleOp('percent')">%</button>
      <button class="btn-calc btn-clear" onclick="clearEntry()">CE</button>
      <button class="btn-calc btn-clear" onclick="clearAll()">C</button>
      <button class="btn-calc btn-op-single" onclick="handleBackspace()"><i class="fa-solid fa-delete-left"></i></button>
      
      <button class="btn-calc btn-op-single" onclick="handleSingleOp('reciprocal')">1/x</button>
      <button class="btn-calc btn-op-single" onclick="handleSingleOp('square')">x²</button>
      <button class="btn-calc btn-op-single" onclick="handleSingleOp('sqrt')">√x</button>
      <button class="btn-calc btn-op" onclick="handleOp('÷')">÷</button>
      
      <button class="btn-calc" onclick="appendToDisplay('7')">7</button>
      <button class="btn-calc" onclick="appendToDisplay('8')">8</button>
      <button class="btn-calc" onclick="appendToDisplay('9')">9</button>
      <button class="btn-calc btn-op" onclick="handleOp('×')">×</button>
      
      <button class="btn-calc" onclick="appendToDisplay('4')">4</button>
      <button class="btn-calc" onclick="appendToDisplay('5')">5</button>
      <button class="btn-calc" onclick="appendToDisplay('6')">6</button>
      <button class="btn-calc btn-op" onclick="handleOp('-')">-</button>
      
      <button class="btn-calc" onclick="appendToDisplay('1')">1</button>
      <button class="btn-calc" onclick="appendToDisplay('2')">2</button>
      <button class="btn-calc" onclick="appendToDisplay('3')">3</button>
      <button class="btn-calc btn-op" onclick="handleOp('+')">+</button>
      
      <button class="btn-calc" onclick="handleSign()">+/-</button>
      <button class="btn-calc" onclick="appendToDisplay('0')">0</button>
      <button class="btn-calc" onclick="appendToDisplay('.')">.</button>
      <button class="btn-calc btn-equals" onclick="performEquals()">=</button>
    </div>
  `,

  // 2) 공학용 계산기
  scientific: `
    <div class="keys-grid-5" style="margin-bottom: 0.5rem;">
      <button class="btn-calc btn-sci-func" onclick="handleSciFunc('sin')">sin</button>
      <button class="btn-calc btn-sci-func" onclick="handleSciFunc('cos')">cos</button>
      <button class="btn-calc btn-sci-func" onclick="handleSciFunc('tan')">tan</button>
      <button class="btn-calc btn-sci-func" onclick="handleSciFunc('log')">log</button>
      <button class="btn-calc btn-sci-func" onclick="handleSciFunc('ln')">ln</button>
    </div>
    <div class="keys-grid-5" style="margin-bottom: 0.5rem;">
      <button class="btn-calc btn-sci-func" onclick="handleSciFunc('pi')">π</button>
      <button class="btn-calc btn-sci-func" onclick="handleSciFunc('e')">e</button>
      <button class="btn-calc btn-sci-func" onclick="handleSciFunc('pow')">x^y</button>
      <button class="btn-calc btn-sci-func" onclick="handleSciFunc('fact')">n!</button>
      <button class="btn-calc btn-sci-func" onclick="handleSciFunc('abs')">Abs</button>
    </div>
    <div class="keys-grid">
      <button class="btn-calc btn-op" onclick="appendToDisplay('(')">(</button>
      <button class="btn-calc btn-op" onclick="appendToDisplay(')')">)</button>
      <button class="btn-calc btn-clear" onclick="clearAll()">C</button>
      <button class="btn-calc btn-op-single" onclick="handleBackspace()"><i class="fa-solid fa-delete-left"></i></button>

      <button class="btn-calc" onclick="appendToDisplay('7')">7</button>
      <button class="btn-calc" onclick="appendToDisplay('8')">8</button>
      <button class="btn-calc" onclick="appendToDisplay('9')">9</button>
      <button class="btn-calc btn-op" onclick="handleOp('÷')">÷</button>
      
      <button class="btn-calc" onclick="appendToDisplay('4')">4</button>
      <button class="btn-calc" onclick="appendToDisplay('5')">5</button>
      <button class="btn-calc" onclick="appendToDisplay('6')">6</button>
      <button class="btn-calc btn-op" onclick="handleOp('×')">×</button>
      
      <button class="btn-calc" onclick="appendToDisplay('1')">1</button>
      <button class="btn-calc" onclick="appendToDisplay('2')">2</button>
      <button class="btn-calc" onclick="appendToDisplay('3')">3</button>
      <button class="btn-calc btn-op" onclick="handleOp('-')">-</button>
      
      <button class="btn-calc" onclick="handleSign()">+/-</button>
      <button class="btn-calc" onclick="appendToDisplay('0')">0</button>
      <button class="btn-calc" onclick="appendToDisplay('.')">.</button>
      <button class="btn-calc btn-equals" onclick="performEquals()">=</button>
    </div>
  `,

  // 3) 프로그래머 계산기
  programmer: `
    <div class="programmer-display-list">
      <div class="prog-item"><span class="prog-label">HEX</span><span class="prog-val" id="prog-hex">0</span></div>
      <div class="prog-item"><span class="prog-label">DEC</span><span class="prog-val" id="prog-dec">0</span></div>
      <div class="prog-item"><span class="prog-label">OCT</span><span class="prog-val" id="prog-oct">0</span></div>
      <div class="prog-item"><span class="prog-label">BIN</span><span class="prog-val" id="prog-bin">0</span></div>
    </div>
    <div class="keys-grid-5" style="margin-bottom: 0.5rem;">
      <button class="btn-calc btn-sci-func" onclick="appendToDisplay('A')">A</button>
      <button class="btn-calc btn-sci-func" onclick="appendToDisplay('B')">B</button>
      <button class="btn-calc btn-sci-func" onclick="appendToDisplay('C')">C</button>
      <button class="btn-calc btn-sci-func" onclick="appendToDisplay('D')">D</button>
      <button class="btn-calc btn-sci-func" onclick="appendToDisplay('E')">E</button>
    </div>
    <div class="keys-grid-5" style="margin-bottom: 0.5rem;">
      <button class="btn-calc btn-sci-func" onclick="appendToDisplay('F')">F</button>
      <button class="btn-calc btn-op" onclick="handleBitwise('AND')">AND</button>
      <button class="btn-calc btn-op" onclick="handleBitwise('OR')">OR</button>
      <button class="btn-calc btn-op" onclick="handleBitwise('XOR')">XOR</button>
      <button class="btn-calc btn-op" onclick="handleBitwise('NOT')">NOT</button>
    </div>
    <div class="keys-grid">
      <button class="btn-calc btn-clear" onclick="clearAll()">C</button>
      <button class="btn-calc btn-op-single" onclick="handleBackspace()"><i class="fa-solid fa-delete-left"></i></button>
      <button class="btn-calc btn-op" onclick="handleOp('+')">+</button>
      <button class="btn-calc btn-op" onclick="handleOp('-')">-</button>

      <button class="btn-calc" onclick="appendToDisplay('7')">7</button>
      <button class="btn-calc" onclick="appendToDisplay('8')">8</button>
      <button class="btn-calc" onclick="appendToDisplay('9')">9</button>
      <button class="btn-calc btn-op" onclick="handleOp('×')">×</button>
      
      <button class="btn-calc" onclick="appendToDisplay('4')">4</button>
      <button class="btn-calc" onclick="appendToDisplay('5')">5</button>
      <button class="btn-calc" onclick="appendToDisplay('6')">6</button>
      <button class="btn-calc btn-op" onclick="handleOp('÷')">÷</button>
      
      <button class="btn-calc" onclick="appendToDisplay('1')">1</button>
      <button class="btn-calc" onclick="appendToDisplay('2')">2</button>
      <button class="btn-calc" onclick="appendToDisplay('3')">3</button>
      <button class="btn-calc btn-equals" onclick="performEquals()">=</button>
      
      <button class="btn-calc" style="grid-column: span 2;" onclick="appendToDisplay('0')">0</button>
      <button class="btn-calc" style="grid-column: span 2; background: rgba(37,99,235,0.1);" id="btn-prog-base" onclick="toggleProgrammerBase()">DEC 입력</button>
    </div>
  `,

  // 4) 단위 변환기
  converter: `
    <div class="form-workspace">
      <div class="input-group">
        <label for="conv-category">변환 카테고리</label>
        <select id="conv-category" onchange="updateConverterUnits()">
          <option value="length">길이 (m, cm, inch 등)</option>
          <option value="temp">온도 (Celsius, Fahrenheit 등)</option>
          <option value="weight">무게 (kg, g, lb 등)</option>
          <option value="volume">부피 (l, ml, gal 등)</option>
        </select>
      </div>

      <div class="form-row">
        <div class="input-group">
          <label for="conv-from-unit">입력 단위</label>
          <select id="conv-from-unit" onchange="runConversion()"></select>
        </div>
        <div class="input-group">
          <label for="conv-to-unit">출력 단위</label>
          <select id="conv-to-unit" onchange="runConversion()"></select>
        </div>
      </div>

      <div class="form-row">
        <div class="input-group">
          <label for="conv-input-val">입력 값</label>
          <input type="number" id="conv-input-val" value="1" oninput="runConversion()">
        </div>
        <div class="input-group" style="justify-content: flex-end;">
          <label>변환 결과</label>
          <div style="font-family: var(--font-display); font-size: 1.45rem; font-weight: 700; color: #60a5fa; padding: 0.5rem 0;" id="conv-result-val">0</div>
        </div>
      </div>
    </div>
  `,

  // 5) 금융 계산기
  finance: `
    <div class="form-workspace">
      <div class="input-group">
        <label for="fin-type">금융 계산 유형</label>
        <select id="fin-type" onchange="updateFinanceFields()">
          <option value="deposit">정기 예금 이자 계산</option>
          <option value="saving">정기 적금 이자 계산</option>
          <option value="loan">대출 원리금 상환 계산</option>
        </select>
      </div>

      <div class="form-row">
        <div class="input-group">
          <label id="fin-val1-label" for="fin-val1">예치 금액 (원)</label>
          <input type="number" id="fin-val1" value="10000000">
        </div>
        <div class="input-group">
          <label for="fin-interest">연 이자율 (%)</label>
          <input type="number" id="fin-interest" value="3.5" step="0.1">
        </div>
      </div>

      <div class="form-row">
        <div class="input-group">
          <label for="fin-months">가입/상환 기간 (개월)</label>
          <input type="number" id="fin-months" value="12">
        </div>
        <div class="input-group" id="fin-compound-group">
          <label for="fin-compound">이자 계산 방식</label>
          <select id="fin-compound">
            <option value="simple">단리</option>
            <option value="compound">연 복리</option>
          </select>
        </div>
      </div>

      <button class="btn btn-equals" style="width: 100%; padding: 0.75rem;" onclick="runFinanceCalculation()">이율/원리금 계산하기</button>

      <div class="finance-result-list" id="fin-results">
        <!-- Result items render here -->
      </div>
    </div>
  `,

  // 6) 행렬 계산기
  matrix: `
    <div class="form-workspace">
      <div class="form-row">
        <div class="input-group">
          <label for="matrix-size">행렬 크기</label>
          <select id="matrix-size" onchange="updateMatrixGrid()">
            <option value="2">2 x 2 행렬</option>
            <option value="3">3 x 3 행렬</option>
          </select>
        </div>
        <div class="input-group">
          <label for="matrix-op-select">실행할 행렬 연산</label>
          <select id="matrix-op-select">
            <option value="detA">A 행렬식 (det A)</option>
            <option value="add">덧셈 (A + B)</option>
            <option value="sub">뺄셈 (A - B)</option>
            <option value="mul">곱셈 (A x B)</option>
            <option value="invA">A 역행렬 (A^-1)</option>
          </select>
        </div>
      </div>

      <div class="matrix-container">
        <div>
          <h5 style="text-align: center; margin-bottom: 0.25rem;">행렬 A</h5>
          <div class="matrix-box" id="matrix-A-box"></div>
        </div>
        <div>
          <h5 style="text-align: center; margin-bottom: 0.25rem;">행렬 B</h5>
          <div class="matrix-box" id="matrix-B-box"></div>
        </div>
      </div>

      <button class="btn btn-equals" style="width: 100%; padding: 0.75rem;" onclick="runMatrixCalculation()">행렬 연산 실행</button>

      <div class="matrix-result-box" id="matrix-result">
        연산 결과가 여기에 나타납니다.
      </div>
    </div>
  `,

  // 7) 통계 계산기
  statistics: `
    <div class="form-workspace">
      <div class="input-group">
        <label for="stats-data">데이터 입력 (쉼표 또는 공백으로 구분)</label>
        <textarea class="input-group stats-textarea" id="stats-data" placeholder="예: 10, 20, 15, 30, 25, 40"></textarea>
      </div>

      <button class="btn btn-equals" style="width: 100%; padding: 0.75rem;" onclick="runStatisticsCalculation()">기술 통계치 산출</button>

      <div class="finance-result-list" id="stats-results">
        <div class="finance-result-row"><span>데이터 개수 (N)</span><strong id="stat-n">0</strong></div>
        <div class="finance-result-row"><span>합계</span><strong id="stat-sum">0</strong></div>
        <div class="finance-result-row"><span>평균</span><strong id="stat-mean">0</strong></div>
        <div class="finance-result-row"><span>중앙값</span><strong id="stat-median">0</strong></div>
        <div class="finance-result-row"><span>분산 (Variance)</span><strong id="stat-variance">0</strong></div>
        <div class="finance-result-row"><span>표준편차 (Std Dev)</span><strong id="stat-stddev">0</strong></div>
      </div>
    </div>
  `,

  // 8) 그래프 계산기
  graph: `
    <div class="form-workspace">
      <div class="form-row">
        <div class="input-group" style="grid-column: span 2;">
          <label for="graph-expr">함수 입력 y = f(x)</label>
          <div style="display: flex; gap: 0.50rem;">
            <input type="text" id="graph-expr" value="x * x - 4" placeholder="예: x * x 또는 sin(x)">
            <button class="btn btn-equals" style="padding: 0 1.25rem;" onclick="drawFunctionGraph()">그리기</button>
          </div>
        </div>
      </div>

      <div class="graph-canvas-container">
        <canvas id="graph-canvas" width="550" height="300"></canvas>
      </div>
    </div>
  `
};

// ----------------------------------------------------
// 4. 모드별 스위칭 연동 로직
// ----------------------------------------------------

function switchMode(mode) {
  currentMode = mode;
  
  // 탭 활성화 클래스 조절
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  // LCD 디스플레이 및 텍스트 상태 변경
  indicatorIcon.innerHTML = getModeIconHTML(mode);
  modeTitleText.innerText = getModeTitle(mode);
  modeDescBadge.innerText = getModeDesc(mode);

  // Pad 영역 렌더링
  calcPadArea.innerHTML = KEYPAD_TEMPLATES[mode];

  // 각 특수 모드 진입 시 초기화 트리거
  if (mode === 'converter') {
    updateConverterUnits();
  } else if (mode === 'finance') {
    updateFinanceFields();
  } else if (mode === 'matrix') {
    updateMatrixGrid();
  } else if (mode === 'graph') {
    setTimeout(drawFunctionGraph, 100); // 캔버스 렌더링 딜레이 대응
  } else if (mode === 'programmer') {
    programmerInputBase = 10;
    updateProgrammerBases('0');
  }

  // 표준 및 일반 계산 모드일 땐 디스플레이 출력
  if (['standard', 'scientific'].includes(mode)) {
    clearAll();
  } else {
    // 디스플레이 숨김 또는 기능 무력화
    lcdOutput.innerText = 'MODE ACTIVE';
    lcdFormula.innerText = '';
  }
}

// 아이콘 헬퍼
function getModeIconHTML(mode) {
  switch (mode) {
    case 'standard': return '<i class="fa-solid fa-calculator"></i>';
    case 'scientific': return '<i class="fa-solid fa-plus"></i>';
    case 'programmer': return '<i class="fa-solid fa-microchip"></i>';
    case 'converter': return '<i class="fa-solid fa-right-left"></i>';
    case 'finance': return '<i class="fa-solid fa-dollar-sign"></i>';
    case 'matrix': return '<i class="fa-solid fa-table-cells"></i>';
    case 'statistics': return '<i class="fa-solid fa-chart-column"></i>';
    case 'graph': return '<i class="fa-solid fa-chart-line"></i>';
    default: return '<i class="fa-solid fa-calculator"></i>';
  }
}

// 모드 제목 헬퍼
function getModeTitle(mode) {
  switch (mode) {
    case 'standard': return '표준 계산기';
    case 'scientific': return '공학용 계산기';
    case 'programmer': return '프로그래머 계산기';
    case 'converter': return '단위 변환기';
    case 'finance': return '금융 계산기';
    case 'matrix': return '행렬 계산기';
    case 'statistics': return '통계 계산기';
    case 'graph': return '그래프 계산기';
    default: return '계산기';
  }
}

// 모드 설명 헬퍼
function getModeDesc(mode) {
  switch (mode) {
    case 'standard': return '기본 사칙연산';
    case 'scientific': return '고급 수학 함수';
    case 'programmer': return '진법 및 비트 연산';
    case 'converter': return '단위 환산 도구';
    case 'finance': return '예적금 및 대출 원리금';
    case 'matrix': return '행렬식 및 역행렬';
    case 'statistics': return '기술 통계 분석';
    case 'graph': return 'Canvas 함수 플로터';
    default: return '';
  }
}

// ----------------------------------------------------
// 5. 각 연산자 버튼 핸들러 (표준 / 공학용)
// ----------------------------------------------------

function handleOp(op) {
  formulaValue += displayValue + ' ' + op + ' ';
  displayValue = '0';
  updateDisplay();
}

function handleSign() {
  if (displayValue !== '0') {
    if (displayValue.startsWith('-')) {
      displayValue = displayValue.substring(1);
    } else {
      displayValue = '-' + displayValue;
    }
    updateDisplay();
  }
}

function handleSingleOp(type) {
  const num = parseFloat(displayValue);
  if (isNaN(num)) return;

  let result = 0;
  switch (type) {
    case 'percent': result = num / 100; break;
    case 'reciprocal': result = 1 / num; break;
    case 'square': result = num * num; break;
    case 'sqrt': result = Math.sqrt(num); break;
  }
  displayValue = String(result);
  updateDisplay();
}

// 메모리 처리
function handleMemory(action) {
  const current = parseFloat(displayValue);
  if (isNaN(current)) return;

  switch (action) {
    case 'MC': memoryValue = 0; break;
    case 'MR': displayValue = String(memoryValue); break;
    case 'M+': memoryValue += current; break;
    case 'M-': memoryValue -= current; break;
    case 'MS': memoryValue = current; break;
  }
  updateDisplay();
  showToast(`메모리 상태: ${memoryValue}`);
}

// 공학용 수학 함수 추가 입력
function handleSciFunc(func) {
  if (func === 'pi') {
    displayValue = String(Math.PI);
  } else if (func === 'e') {
    displayValue = String(Math.E);
  } else if (func === 'pow') {
    formulaValue += displayValue + ' ^ ';
    displayValue = '0';
  } else if (func === 'fact') {
    const num = parseInt(displayValue);
    if (num >= 0 && num <= 170) {
      displayValue = String(factorial(num));
    } else {
      displayValue = 'Error';
    }
  } else if (func === 'abs') {
    displayValue = String(Math.abs(parseFloat(displayValue)));
  } else {
    // sin, cos, tan, log, ln
    formulaValue = func + '(' + displayValue + ')';
    displayValue = evaluateExpression(formulaValue);
    formulaValue = '';
  }
  updateDisplay();
}

function factorial(n) {
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

// ----------------------------------------------------
// 6. 프로그래머 계산기 로직
// ----------------------------------------------------

function toggleProgrammerBase() {
  const bases = [10, 16, 8, 2];
  const labels = ['DEC 입력', 'HEX 입력', 'OCT 입력', 'BIN 입력'];
  
  let currentIndex = bases.indexOf(programmerInputBase);
  let nextIndex = (currentIndex + 1) % bases.length;
  
  programmerInputBase = bases[nextIndex];
  document.getElementById('btn-prog-base').innerText = labels[nextIndex];
  
  showToast(`입력 진법이 ${programmerInputBase}진수로 전환되었습니다.`);
}

function updateProgrammerBases(val) {
  const hexOut = document.getElementById('prog-hex');
  const decOut = document.getElementById('prog-dec');
  const octOut = document.getElementById('prog-oct');
  const binOut = document.getElementById('prog-bin');

  if (!hexOut) return;

  // 정수 추출
  let parsedInt = 0;
  try {
    parsedInt = parseInt(val, programmerInputBase);
    if (isNaN(parsedInt)) parsedInt = 0;
  } catch (e) {
    parsedInt = 0;
  }

  hexOut.innerText = parsedInt.toString(16).toUpperCase();
  decOut.innerText = parsedInt.toString(10);
  octOut.innerText = parsedInt.toString(8);
  binOut.innerText = parsedInt.toString(2);
}

// 프로그래머 전용 비트 연산
function handleBitwise(op) {
  const val = parseInt(displayValue, programmerInputBase);
  if (isNaN(val)) return;

  let res = 0;
  if (op === 'NOT') {
    res = ~val;
  } else {
    const second = parseInt(prompt(`${op} 연산을 실행할 두 번째 정수를 입력하세요:`));
    if (isNaN(second)) return;
    
    if (op === 'AND') res = val & second;
    else if (op === 'OR') res = val | second;
    else if (op === 'XOR') res = val ^ second;
  }

  displayValue = res.toString(programmerInputBase).toUpperCase();
  updateProgrammerBases(displayValue);
  updateDisplay();
}

// ----------------------------------------------------
// 7. 단위 변환기 로직
// ----------------------------------------------------

const CONVERSION_FACTORS = {
  length: {
    units: ['m', 'cm', 'mm', 'km', 'inch', 'ft'],
    labels: ['미터(m)', '센티미터(cm)', '밀리미터(mm)', '킬로미터(km)', '인치(inch)', '피트(ft)'],
    toMeter: { m: 1, cm: 0.01, mm: 0.001, km: 1000, inch: 0.0254, ft: 0.3048 }
  },
  temp: {
    units: ['C', 'F', 'K'],
    labels: ['섭씨(℃)', '화씨(℉)', '절대온도(K)']
  },
  weight: {
    units: ['kg', 'g', 'lb', 'oz'],
    labels: ['킬로그램(kg)', '그램(g)', '파운드(lb)', '온스(oz)'],
    toKg: { kg: 1, g: 0.001, lb: 0.453592, oz: 0.0283495 }
  },
  volume: {
    units: ['l', 'ml', 'gal', 'cup'],
    labels: ['리터(l)', '밀리리터(ml)', '갤런(gal)', '컵(cup)'],
    toLitre: { l: 1, ml: 0.001, gal: 3.78541, cup: 0.24 }
  }
};

function updateConverterUnits() {
  const cat = document.getElementById('conv-category').value;
  const fromSel = document.getElementById('conv-from-unit');
  const toSel = document.getElementById('conv-to-unit');
  
  if (!fromSel) return;

  const data = CONVERSION_FACTORS[cat];
  fromSel.innerHTML = '';
  toSel.innerHTML = '';

  data.units.forEach((unit, idx) => {
    const label = data.labels[idx];
    fromSel.innerHTML += `<option value="${unit}">${label}</option>`;
    toSel.innerHTML += `<option value="${unit}">${label}</option>`;
  });

  // 디폴트값 교차 정렬
  if (data.units.length > 1) {
    toSel.selectedIndex = 1;
  }

  runConversion();
}

function runConversion() {
  const cat = document.getElementById('conv-category').value;
  const fromUnit = document.getElementById('conv-from-unit').value;
  const toUnit = document.getElementById('conv-to-unit').value;
  const inputVal = parseFloat(document.getElementById('conv-input-val').value);
  const resultDiv = document.getElementById('conv-result-val');

  if (isNaN(inputVal)) {
    resultDiv.innerText = '0';
    return;
  }

  let result = 0;

  if (cat === 'temp') {
    // 온도 공식 분기
    let celsius = 0;
    if (fromUnit === 'C') celsius = inputVal;
    else if (fromUnit === 'F') celsius = (inputVal - 32) * 5/9;
    else if (fromUnit === 'K') celsius = inputVal - 273.15;

    if (toUnit === 'C') result = celsius;
    else if (toUnit === 'F') result = celsius * 9/5 + 32;
    else if (toUnit === 'K') result = celsius + 273.15;
  } else {
    // 일반 단위 변환 (중간 기준 단위로 환산 후 변환)
    if (cat === 'length') {
      const meters = inputVal * CONVERSION_FACTORS.length.toMeter[fromUnit];
      result = meters / CONVERSION_FACTORS.length.toMeter[toUnit];
    } else if (cat === 'weight') {
      const kgs = inputVal * CONVERSION_FACTORS.weight.toKg[fromUnit];
      result = kgs / CONVERSION_FACTORS.weight.toKg[toUnit];
    } else if (cat === 'volume') {
      const litres = inputVal * CONVERSION_FACTORS.volume.toLitre[fromUnit];
      result = litres / CONVERSION_FACTORS.volume.toLitre[toUnit];
    }
  }

  resultDiv.innerText = String(parseFloat(result.toFixed(6)));
}

// ----------------------------------------------------
// 8. 금융 계산기 로직
// ----------------------------------------------------

function updateFinanceFields() {
  const type = document.getElementById('fin-type').value;
  const val1Label = document.getElementById('fin-val1-label');
  const compoundGroup = document.getElementById('fin-compound-group');

  if (!val1Label) return;

  if (type === 'loan') {
    val1Label.innerText = '대출 원금 (원)';
    compoundGroup.style.display = 'none';
  } else {
    val1Label.innerText = '예치/적립 원금 (원)';
    compoundGroup.style.display = 'flex';
  }
}

function runFinanceCalculation() {
  const type = document.getElementById('fin-type').value;
  const principal = parseFloat(document.getElementById('fin-val1').value);
  const ratePercent = parseFloat(document.getElementById('fin-interest').value) / 100;
  const months = parseFloat(document.getElementById('fin-months').value);
  const compound = document.getElementById('fin-compound').value;
  const resultDiv = document.getElementById('fin-results');

  if (isNaN(principal) || isNaN(ratePercent) || isNaN(months)) {
    alert('모든 입력 값을 올바른 숫자로 채워주세요.');
    return;
  }

  resultDiv.innerHTML = '';

  let totalPrize = 0;
  let totalInterest = 0;
  let tax = 0.154; // 일반 이자소득세 15.4%

  if (type === 'deposit') {
    // 예금 단리/복리 계산
    if (compound === 'simple') {
      totalInterest = principal * ratePercent * (months / 12);
    } else {
      totalInterest = principal * (Math.pow(1 + ratePercent, months / 12) - 1);
    }
    const taxDeduction = totalInterest * tax;
    const finalReceipt = principal + totalInterest - taxDeduction;

    resultDiv.innerHTML = `
      <div class="finance-result-row"><span>총 세전 이자</span><strong>${Math.round(totalInterest).toLocaleString()}원</strong></div>
      <div class="finance-result-row"><span>이자소득세 (15.4%)</span><strong>${Math.round(taxDeduction).toLocaleString()}원</strong></div>
      <div class="finance-result-row"><span>세후 만기 수령액</span><strong>${Math.round(finalReceipt).toLocaleString()}원</strong></div>
    `;
  } 
  else if (type === 'saving') {
    // 적금 계산 (매월 적립식)
    let totalSavings = principal * months;
    if (compound === 'simple') {
      // 월 적금 단리 이자 공식
      totalInterest = principal * ratePercent * (months * (months + 1) / 2) / 12;
    } else {
      // 적금 복리 이자 공식 (월 복리 간이 적용)
      const monthlyRate = ratePercent / 12;
      totalInterest = principal * (1 + monthlyRate) * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate - totalSavings;
    }
    const taxDeduction = totalInterest * tax;
    const finalReceipt = totalSavings + totalInterest - taxDeduction;

    resultDiv.innerHTML = `
      <div class="finance-result-row"><span>누적 원금 합계</span><strong>${totalSavings.toLocaleString()}원</strong></div>
      <div class="finance-result-row"><span>총 세전 이자</span><strong>${Math.round(totalInterest).toLocaleString()}원</strong></div>
      <div class="finance-result-row"><span>이자소득세 (15.4%)</span><strong>${Math.round(taxDeduction).toLocaleString()}원</strong></div>
      <div class="finance-result-row"><span>세후 만기 수령액</span><strong>${Math.round(finalReceipt).toLocaleString()}원</strong></div>
    `;
  } 
  else if (type === 'loan') {
    // 대출 원리금 균등상환 계산
    const monthlyRate = ratePercent / 12;
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalRepay = monthlyPayment * months;
    totalInterest = totalRepay - principal;

    resultDiv.innerHTML = `
      <div class="finance-result-row"><span>매월 납입 원리금</span><strong>${Math.round(monthlyPayment).toLocaleString()}원</strong></div>
      <div class="finance-result-row"><span>총 상환 금액 (원리금)</span><strong>${Math.round(totalRepay).toLocaleString()}원</strong></div>
      <div class="finance-result-row"><span>총 대출 이자 지출</span><strong>${Math.round(totalInterest).toLocaleString()}원</strong></div>
    `;
  }
}

// ----------------------------------------------------
// 9. 행렬 계산기 로직
// ----------------------------------------------------

function updateMatrixGrid() {
  const size = parseInt(document.getElementById('matrix-size').value);
  const boxA = document.getElementById('matrix-A-box');
  const boxB = document.getElementById('matrix-B-box');

  if (!boxA) return;

  const buildInputs = (idPrefix) => {
    let html = '';
    for (let r = 0; r < size; r++) {
      html += '<div style="display: flex; gap: 0.25rem;">';
      for (let c = 0; c < size; c++) {
        html += `<input type="number" id="${idPrefix}_${r}_${c}" value="${r === c ? 1 : 0}">`;
      }
      html += '</div>';
    }
    return html;
  };

  boxA.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  boxB.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

  boxA.innerHTML = buildInputs('mA');
  boxB.innerHTML = buildInputs('mB');
}

function runMatrixCalculation() {
  const size = parseInt(document.getElementById('matrix-size').value);
  const op = document.getElementById('matrix-op-select').value;
  const resultDiv = document.getElementById('matrix-result');

  // 행렬 로드
  const loadMatrix = (prefix) => {
    const mat = [];
    for (let r = 0; r < size; r++) {
      const row = [];
      for (let c = 0; c < size; c++) {
        const val = parseFloat(document.getElementById(`${prefix}_${r}_${c}`).value);
        row.push(isNaN(val) ? 0 : val);
      }
      mat.push(row);
    }
    return mat;
  };

  const A = loadMatrix('mA');
  const B = loadMatrix('mB');

  // 행렬 포맷 출력 함수
  const formatMatrix = (M) => {
    let html = '<div style="display: flex; flex-direction: column; gap: 0.3rem;">';
    M.forEach(row => {
      html += '<div>[ ';
      row.forEach(val => {
        html += `<span style="display: inline-block; width: 45px; text-align: center; color: #10b981; font-weight:700;">${parseFloat(val.toFixed(2))}</span> `;
      });
      html += ' ]</div>';
    });
    html += '</div>';
    return html;
  };

  if (op === 'detA') {
    const det = calcDeterminant(A, size);
    resultDiv.innerHTML = `<strong>행렬식 det(A) = <span style="color: #c084fc;">${det}</span></strong>`;
  } 
  else if (op === 'add') {
    const C = [];
    for (let r = 0; r < size; r++) {
      C.push(A[r].map((v, c) => v + B[r][c]));
    }
    resultDiv.innerHTML = `<h5>덧셈 결과 A + B :</h5>` + formatMatrix(C);
  } 
  else if (op === 'sub') {
    const C = [];
    for (let r = 0; r < size; r++) {
      C.push(A[r].map((v, c) => v - B[r][c]));
    }
    resultDiv.innerHTML = `<h5>뺄셈 결과 A - B :</h5>` + formatMatrix(C);
  } 
  else if (op === 'mul') {
    const C = Array(size).fill(0).map(() => Array(size).fill(0));
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        let sum = 0;
        for (let k = 0; k < size; k++) {
          sum += A[r][k] * B[k][c];
        }
        C[r][c] = sum;
      }
    }
    resultDiv.innerHTML = `<h5>곱셈 결과 A x B :</h5>` + formatMatrix(C);
  } 
  else if (op === 'invA') {
    const inv = calcInverse(A, size);
    if (!inv) {
      resultDiv.innerHTML = `<span style="color: #ef4444;">A 행렬의 역행렬이 존재하지 않습니다 (det A = 0).</span>`;
    } else {
      resultDiv.innerHTML = `<h5>A의 역행렬 (A^-1) :</h5>` + formatMatrix(inv);
    }
  }
}

// 행렬식 계산
function calcDeterminant(M, size) {
  if (size === 2) {
    return M[0][0] * M[1][1] - M[0][1] * M[1][0];
  }
  // 3x3 사루스 공식
  return M[0][0]*M[1][1]*M[2][2] + M[0][1]*M[1][2]*M[2][0] + M[0][2]*M[1][0]*M[2][1]
       - M[0][2]*M[1][1]*M[2][0] - M[0][0]*M[1][2]*M[2][1] - M[0][1]*M[1][0]*M[2][2];
}

// 역행렬 계산
function calcInverse(M, size) {
  const det = calcDeterminant(M, size);
  if (det === 0) return null;

  if (size === 2) {
    return [
      [M[1][1]/det, -M[0][1]/det],
      [-M[1][0]/det, M[0][0]/det]
    ];
  }
  
  // 3x3 여인수 행렬을 이용한 수반행렬/역행렬 계산
  const adj = Array(3).fill(0).map(() => Array(3).fill(0));
  
  const getSubdet = (r1, c1, r2, c2) => {
    return M[r1][c1]*M[r2][c2] - M[r1][c2]*M[r2][c1];
  };

  adj[0][0] = getSubdet(1, 1, 2, 2);
  adj[0][1] = -getSubdet(0, 1, 2, 2);
  adj[0][2] = getSubdet(0, 1, 1, 2);
  
  adj[1][0] = -getSubdet(1, 0, 2, 2);
  adj[1][1] = getSubdet(0, 0, 2, 2);
  adj[1][2] = -getSubdet(0, 0, 1, 2);
  
  adj[2][0] = getSubdet(1, 0, 2, 1);
  adj[2][1] = -getSubdet(0, 0, 2, 1);
  adj[2][2] = getSubdet(0, 0, 1, 1);

  // 전치 및 나누기
  const inv = Array(3).fill(0).map(() => Array(3).fill(0));
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      inv[r][c] = adj[c][r] / det;
    }
  }
  return inv;
}

// ----------------------------------------------------
// 10. 통계 계산기 로직
// ----------------------------------------------------

function runStatisticsCalculation() {
  const rawText = document.getElementById('stats-data').value;
  const numArr = rawText
    .split(/[\s,]+/)
    .map(s => parseFloat(s.trim()))
    .filter(n => !isNaN(n));

  const N = numArr.length;
  if (N === 0) {
    alert('쉼표나 공백으로 나열된 유효한 숫자를 최소 1개 이상 입력하세요.');
    return;
  }

  // 합계
  const sum = numArr.reduce((a, b) => a + b, 0);
  
  // 평균
  const mean = sum / N;

  // 중앙값
  const sorted = [...numArr].sort((a, b) => a - b);
  const mid = Math.floor(N / 2);
  const median = N % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  // 분산
  let variance = 0;
  if (N > 1) {
    const sqDiffSum = numArr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
    variance = sqDiffSum / (N - 1); // 표본 분산 (N-1)
  }

  // 표준편차
  const stddev = Math.sqrt(variance);

  // UI 갱신
  document.getElementById('stat-n').innerText = N;
  document.getElementById('stat-sum').innerText = sum.toFixed(2);
  document.getElementById('stat-mean').innerText = mean.toFixed(4);
  document.getElementById('stat-median').innerText = median.toFixed(2);
  document.getElementById('stat-variance').innerText = variance.toFixed(4);
  document.getElementById('stat-stddev').innerText = stddev.toFixed(4);
}

// ----------------------------------------------------
// 11. 그래프 계산기 로직 (Canvas Drawing)
// ----------------------------------------------------

function drawFunctionGraph() {
  const canvas = document.getElementById('graph-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const expr = document.getElementById('graph-expr').value;

  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // 1) 격자선 및 중심 좌표축 그리기
  ctx.strokeStyle = '#272b38';
  ctx.lineWidth = 1;

  const scaleX = w / 20; // x 범위 -10 ~ +10 -> 20칸
  const scaleY = h / 10; // y 범위 -5 ~ +5 -> 10칸

  // 격자 세로선
  for (let xGrid = 0; xGrid <= 20; xGrid++) {
    ctx.beginPath();
    ctx.moveTo(xGrid * scaleX, 0);
    ctx.lineTo(xGrid * scaleX, h);
    ctx.stroke();
  }
  // 격자 가로선
  for (let yGrid = 0; yGrid <= 10; yGrid++) {
    ctx.beginPath();
    ctx.moveTo(0, yGrid * scaleY);
    ctx.lineTo(w, yGrid * scaleY);
    ctx.stroke();
  }

  // 2) 메인 중심축 (x축, y축)
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  
  // X축
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();
  
  // Y축
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.stroke();

  // 3) 함수 그래프 곡선 연산 및 lineTo 드로잉
  ctx.strokeStyle = '#10b981'; // 네온 그린 그래프 곡선
  ctx.lineWidth = 3;
  ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
  ctx.shadowBlur = 6;
  ctx.beginPath();

  let first = true;

  // 화면 픽셀 단위로 루프 돌면서 실제 함수 값 환산
  for (let px = 0; px < w; px++) {
    // 픽셀 X를 실제 수학적 x 값(-10 ~ +10)으로 환산
    const x = (px - w / 2) / scaleX;

    // 함수 식 연산
    let y = 0;
    try {
      // 수학 함수 라이브러리 맵 대체
      let MathExpr = expr
        .replace(/x/g, `(${x})`)
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/pi/g, 'Math.PI');

      y = new Function(`return ${MathExpr}`)();
      if (isNaN(y) || !isFinite(y)) continue;
    } catch (e) {
      continue;
    }

    // 수학적 y 값을 Canvas 픽셀 좌표로 환산
    const py = h / 2 - y * scaleY;

    if (py >= 0 && py <= h) {
      if (first) {
        ctx.moveTo(px, py);
        first = false;
      } else {
        ctx.lineTo(px, py);
      }
    } else {
      first = true; // 화면 밖으로 나가면 라인 연결 끊기
    }
  }
  ctx.stroke();
  
  // 캔버스 효과 해제
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
}

// ----------------------------------------------------
// 12. 전체 복사 / 플로팅 위젯 브라우징 로직
// ----------------------------------------------------

btnCopyDisplay.addEventListener('click', () => {
  navigator.clipboard.writeText(displayValue)
    .then(() => {
      showToast('출력창 값이 복사되었습니다.');
    });
});

// 토스트 가시화
function showToast(msg) {
  toastNotif.innerText = msg;
  toastNotif.classList.add('active');
  setTimeout(() => {
    toastNotif.classList.remove('active');
  }, 1500);
}

// 역사 목록 초기화
btnClearHistory.addEventListener('click', () => {
  calculationHistory = [];
  renderHistory();
  showToast('계산 기록이 초기화되었습니다.');
});

// 플로팅 메뉴 제어
const btnMenuTrigger = document.getElementById('btn-menu-trigger');
const navOverlayMenu = document.getElementById('nav-overlay-menu');

btnMenuTrigger.addEventListener('click', () => {
  navOverlayMenu.classList.toggle('active');
});

// 스크롤 상/하 단추
document.getElementById('btn-scroll-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('btn-scroll-bottom').addEventListener('click', () => {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
});

// 스크롤 프로그레스 표시 뱃지 갱신
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  let percent = 0;
  if (docHeight > 0) {
    percent = Math.round((scrollTop / docHeight) * 100);
  }

  // 뱃지 텍스트 갱신
  document.querySelector('.progress-text').innerText = `${percent}%`;

  // SVG 원형 진행 채우기 오프셋 계산 (반지름 r=15 -> 둘레 C = 2*pi*r = 94.2)
  const circle = document.querySelector('.progress-ring__circle');
  if (circle) {
    const circumference = 2 * Math.PI * 15;
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
  }
});

// 탭 클릭 바인딩
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    switchMode(btn.dataset.mode);
  });
});

// 초기 시동
switchMode('standard');
