/**
 * CineAHO JSON & CSV/TSV Converter App
 * Robust, client-side bidirectional parser and interactive data table viewer.
 */

// ==========================================
// 1. SOUND EFFECTS SYNTHESIZER (Web Audio API)
// ==========================================
const SoundEffects = {
  ctx: null,
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume audio context if suspended (browser security policies)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },
  playClick() {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {
      console.warn("Audio play blocked/failed:", e);
    }
  },
  playSuccess() {
    try {
      this.init();
      const now = this.ctx.currentTime;
      const playTone = (freq, start, duration) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.06, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        
        osc.start(start);
        osc.stop(start + duration);
      };
      playTone(523.25, now, 0.08);       // C5
      playTone(659.25, now + 0.07, 0.08);  // E5
      playTone(783.99, now + 0.14, 0.15);  // G5
    } catch (e) {
      console.warn("Audio play blocked/failed:", e);
    }
  },
  playError() {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.25);
      
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {
      console.warn("Audio play blocked/failed:", e);
    }
  }
};

// ==========================================
// 2. CONVERSION ALGORITHMS
// ==========================================

/**
 * Parses CSV/TSV contents conforming to RFC 4180
 */
function parseDelimitedText(text, delimiter = ',') {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Double quote escaping ("")
          cell += '"';
          i++; // Skip next quote
        } else {
          // End of quote
          inQuotes = false;
        }
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        row.push(cell);
        cell = '';
      } else if (char === '\n' || char === '\r') {
        row.push(cell);
        cell = '';
        rows.push(row);
        row = [];
        if (char === '\r' && nextChar === '\n') {
          i++; // Skip LF in CRLF
        }
      } else {
        cell += char;
      }
    }
  }
  
  // Handle remainder
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  
  // Drop trailing empty line if it exists
  if (rows.length > 0 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') {
    rows.pop();
  }
  
  return rows;
}

/**
 * Auto-detect and parse primitive values from CSV strings
 */
function autoParseValue(val) {
  val = val.trim();
  if (val === '') return null;
  if (val.toLowerCase() === 'true') return true;
  if (val.toLowerCase() === 'false') return false;
  if (val.toLowerCase() === 'null') return null;
  
  // Parse numeric values (ensure it's not a phone number or postal code starting with zero unless single digit)
  if (!isNaN(val) && !isNaN(parseFloat(val))) {
    if (val.length === 1 || !val.startsWith('0') || val.startsWith('0.')) {
      return Number(val);
    }
  }
  
  // Parse nested objects/arrays inside csv cell if stringified
  if ((val.startsWith('{') && val.endsWith('}')) || (val.startsWith('[') && val.endsWith(']'))) {
    try {
      return JSON.parse(val);
    } catch (e) {
      // Fallback to plain string if parse fails
    }
  }
  
  return val;
}

/**
 * Converts CSV or TSV to JSON
 */
function delimitedToJSON(text, delimiter = ',') {
  if (!text || text.trim() === '') {
    throw new Error('데이터가 비어 있습니다.');
  }
  
  const parsedRows = parseDelimitedText(text, delimiter);
  if (parsedRows.length === 0) {
    throw new Error('유효한 행 데이터를 찾을 수 없습니다.');
  }
  
  // First row is the header
  const headers = parsedRows[0].map(h => h.trim());
  if (headers.some(h => h === '')) {
    throw new Error('일부 헤더(열 이름)가 비어 있습니다. 올바른 파일 포맷인지 확인해 주세요.');
  }
  
  const result = [];
  for (let i = 1; i < parsedRows.length; i++) {
    const row = parsedRows[i];
    // Create mapping key-value
    const obj = {};
    headers.forEach((header, colIndex) => {
      const rawVal = row[colIndex] !== undefined ? row[colIndex] : '';
      obj[header] = autoParseValue(rawVal);
    });
    result.push(obj);
  }
  
  return result;
}

/**
 * Formats value for delimited cell including stringification and escaping
 */
function formatCell(val, delimiter = ',') {
  if (val === null || val === undefined) {
    return '';
  }
  
  let strVal = '';
  if (typeof val === 'object') {
    strVal = JSON.stringify(val);
  } else {
    strVal = String(val);
  }
  
  // Check if string contains comma, tab, quote, or newline
  const needsQuotes = strVal.includes(delimiter) || strVal.includes('"') || strVal.includes('\n') || strVal.includes('\r');
  
  if (needsQuotes) {
    // Escape quotes by doubling them
    strVal = strVal.replace(/"/g, '""');
    return `"${strVal}"`;
  }
  
  return strVal;
}

/**
 * Converts JSON to CSV or TSV
 */
function jsonToDelimited(jsonStr, delimiter = ',') {
  if (!jsonStr || jsonStr.trim() === '') {
    throw new Error('데이터가 비어 있습니다.');
  }
  
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(`JSON 파싱 실패: ${e.message}`);
  }
  
  // Support single objects by wrapping them in array
  if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
    parsed = [parsed];
  }
  
  if (!Array.isArray(parsed)) {
    throw new Error('JSON은 객체 배열이거나 단일 객체 구조여야 합니다.');
  }
  
  if (parsed.length === 0) {
    return '';
  }
  
  // Gather all unique keys from all elements
  const keys = [];
  parsed.forEach(item => {
    if (typeof item === 'object' && item !== null) {
      Object.keys(item).forEach(key => {
        if (!keys.includes(key)) {
          keys.push(key);
        }
      });
    }
  });
  
  if (keys.length === 0) {
    // Array of primitives or empty objects
    keys.push('value');
    const rows = ['value'];
    parsed.forEach(item => {
      rows.push(formatCell(item, delimiter));
    });
    return rows.join('\n');
  }
  
  // Build header row
  const headerLine = keys.join(delimiter);
  
  // Build data rows
  const dataLines = parsed.map(item => {
    if (typeof item === 'object' && item !== null) {
      return keys.map(key => formatCell(item[key], delimiter)).join(delimiter);
    } else {
      // Primitive fallback
      return keys.map(key => key === 'value' ? formatCell(item, delimiter) : '').join(delimiter);
    }
  });
  
  return [headerLine, ...dataLines].join('\n');
}

// ==========================================
// 3. SAMPLE DATA STORE
// ==========================================
const SAMPLE_DATA = {
  json: JSON.stringify([
    { "사원번호": 1001, "이름": "김민수", "부서": "개발팀", "직급": "대리", "기술스택": ["Javascript", "Node.js"], "입사일": "2024-03-01", "재직여부": true },
    { "사원번호": 1002, "이름": "이영희", "부서": "디자인팀", "직급": "과장", "기술스택": ["Figma", "UI/UX"], "입사일": "2022-07-15", "재직여부": true },
    { "사원번호": 1003, "이름": "박찬호", "부서": "기획팀", "직급": "차장", "기술스택": ["PM", "Excel", "PPT"], "입사일": "2019-11-10", "재직여부": false },
    { "사원번호": 1004, "이름": "정우성", "부서": "개발팀", "직급": "수석", "기술스택": ["Python", "Kubernetes"], "입사일": "2021-02-28", "재직여부": true },
    { "사원번호": 1005, "이름": "최사랑", "부서": "마케팅팀", "직급": "사원", "기술스택": ["Google Analytics", "SEO"], "입사일": "2025-01-10", "재직여부": true },
    { "사원번호": 1006, "이름": "홍길동", "부서": "인사팀", "직급": "주임", "기술스택": ["HRM", "E-HR"], "입사일": "2023-09-01", "재직여부": true },
    { "사원번호": 1007, "이름": "강감찬", "부서": "경영전략", "직급": "이사", "기술스택": ["Management", "Finance"], "입사일": "2015-05-18", "재직여부": true }
  ], null, 2),
  csv: `사원번호,이름,부서,직급,기술스택,입사일,재직여부
1001,김민수,개발팀,대리,"[""Javascript"",""Node.js""]",2024-03-01,true
1002,이영희,디자인팀,과장,"[""Figma"",""UI/UX""]",2022-07-15,true
1003,박찬호,기획팀,차장,"[""PM"",""Excel"",""PPT""]",2019-11-10,false
1004,정우성,개발팀,수석,"[""Python"",""Kubernetes""]",2021-02-28,true
1005,최사랑,마케팅팀,사원,"[""Google Analytics"",""SEO""]",2025-01-10,true
1006,홍길동,인사팀,주임,"[""HRM"",""E-HR""]",2023-09-01,true
1007,강감찬,경영전략,이사,"[""Management"",""Finance""]",2015-05-18,true`
};

// ==========================================
// 4. INTERACTIVE TABLE COMPONENT STATE
// ==========================================
let tableState = {
  originalData: [], // Array of objects parsed
  filteredData: [],  // Data matching current search
  allColumns: [],    // All header keys
  visibleColumns: {}, // colName -> boolean
  currentPage: 1,
  pageSize: 10,
  sortKey: null,
  sortDirection: 'asc' // or 'desc'
};

// ==========================================
// 5. APPLICATION INITIALIZATION & SELECTORS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const txtSource = document.getElementById('txt-source-code');
  const txtOutput = document.getElementById('txt-output-code');
  const sourceLineNumbers = document.getElementById('source-line-numbers');
  const outputLineNumbers = document.getElementById('output-line-numbers');
  const lblDetectedFormat = document.getElementById('lbl-detected-format');
  const lblOutputFormat = document.getElementById('lbl-output-format');
  
  // Drop Zone
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const btnBrowseFile = document.getElementById('btn-browse-file');
  
  // Action Buttons
  const btnLoadSample = document.getElementById('btn-load-sample');
  const btnClearSource = document.getElementById('btn-clear-source');
  const btnConvertJsonCsv = document.getElementById('btn-convert-json-csv');
  const btnConvertJsonTsv = document.getElementById('btn-convert-json-tsv');
  const btnConvertCsvJson = document.getElementById('btn-convert-csv-json');
  const btnConvertTsvJson = document.getElementById('btn-convert-tsv-json');
  const btnCopyOutput = document.getElementById('btn-copy-output');
  const btnDownloadOutput = document.getElementById('btn-download-output');
  
  // Table Section
  const sectionTableViewer = document.getElementById('section-table-viewer');
  const inputTableSearch = document.getElementById('input-table-search');
  const wrapColumnCheckboxes = document.getElementById('wrap-column-checkboxes');
  const dataGridTable = document.getElementById('data-grid-table');
  const tableHeadRow = document.getElementById('table-head-row');
  const tableBodyRows = document.getElementById('table-body-rows');
  const lblTableSummary = document.getElementById('lbl-table-summary');
  const btnPrevPage = document.getElementById('btn-prev-page');
  const btnNextPage = document.getElementById('btn-next-page');
  const lblPageIndicator = document.getElementById('lbl-page-indicator');
  
  // Floating Controls & Scroll progress
  const progressCircleIndicator = document.getElementById('progress-circle-indicator');
  const scrollPercentageLbl = document.getElementById('scroll-percentage-lbl');
  const btnScrollTop = document.getElementById('btn-scroll-top');
  const btnScrollBottom = document.getElementById('btn-scroll-bottom');

  // Set initial scroll values
  updateScrollProgress();

  // Initialize Line Numbers
  updateLineNumbers(txtSource, sourceLineNumbers);
  updateLineNumbers(txtOutput, outputLineNumbers);

  // Synchronize scrolling for editor textareas with their respective line number rails
  txtSource.addEventListener('scroll', () => {
    sourceLineNumbers.scrollTop = txtSource.scrollTop;
  });
  txtOutput.addEventListener('scroll', () => {
    outputLineNumbers.scrollTop = txtOutput.scrollTop;
  });

  // Event Listeners for Editor modifications
  txtSource.addEventListener('input', () => {
    updateLineNumbers(txtSource, sourceLineNumbers);
    detectAndDisplayFormat(txtSource.value);
  });
  
  txtOutput.addEventListener('input', () => {
    updateLineNumbers(txtOutput, outputLineNumbers);
  });

  // Action Buttons
  btnLoadSample.addEventListener('click', () => {
    SoundEffects.playClick();
    // Load JSON as default sample
    txtSource.value = SAMPLE_DATA.json;
    updateLineNumbers(txtSource, sourceLineNumbers);
    detectAndDisplayFormat(txtSource.value);
  });

  btnClearSource.addEventListener('click', () => {
    SoundEffects.playClick();
    txtSource.value = '';
    txtOutput.value = '';
    updateLineNumbers(txtSource, sourceLineNumbers);
    updateLineNumbers(txtOutput, outputLineNumbers);
    detectAndDisplayFormat('');
    lblOutputFormat.textContent = '포맷 미정';
    sectionTableViewer.style.display = 'none';
  });

  // Click Sound triggers for buttons
  const playClickSound = () => SoundEffects.playClick();
  btnConvertJsonCsv.addEventListener('click', playClickSound);
  btnConvertJsonTsv.addEventListener('click', playClickSound);
  btnConvertCsvJson.addEventListener('click', playClickSound);
  btnConvertTsvJson.addEventListener('click', playClickSound);

  // Conversion Operations
  btnConvertJsonCsv.addEventListener('click', () => {
    try {
      const output = jsonToDelimited(txtSource.value, ',');
      txtOutput.value = output;
      lblOutputFormat.textContent = 'CSV 데이터';
      updateLineNumbers(txtOutput, outputLineNumbers);
      SoundEffects.playSuccess();
      
      // Parse output back/use parsed input for visualization
      const data = JSON.parse(txtSource.value);
      initTableState(data);
    } catch (e) {
      alert(`변환 오류: ${e.message}`);
      SoundEffects.playError();
    }
  });

  btnConvertJsonTsv.addEventListener('click', () => {
    try {
      const output = jsonToDelimited(txtSource.value, '\t');
      txtOutput.value = output;
      lblOutputFormat.textContent = 'TSV 데이터';
      updateLineNumbers(txtOutput, outputLineNumbers);
      SoundEffects.playSuccess();
      
      const data = JSON.parse(txtSource.value);
      initTableState(data);
    } catch (e) {
      alert(`변환 오류: ${e.message}`);
      SoundEffects.playError();
    }
  });

  btnConvertCsvJson.addEventListener('click', () => {
    try {
      const parsedData = delimitedToJSON(txtSource.value, ',');
      txtOutput.value = JSON.stringify(parsedData, null, 2);
      lblOutputFormat.textContent = 'JSON 배열';
      updateLineNumbers(txtOutput, outputLineNumbers);
      SoundEffects.playSuccess();
      
      initTableState(parsedData);
    } catch (e) {
      alert(`변환 오류: ${e.message}`);
      SoundEffects.playError();
    }
  });

  btnConvertTsvJson.addEventListener('click', () => {
    try {
      const parsedData = delimitedToJSON(txtSource.value, '\t');
      txtOutput.value = JSON.stringify(parsedData, null, 2);
      lblOutputFormat.textContent = 'JSON 배열';
      updateLineNumbers(txtOutput, outputLineNumbers);
      SoundEffects.playSuccess();
      
      initTableState(parsedData);
    } catch (e) {
      alert(`변환 오류: ${e.message}`);
      SoundEffects.playError();
    }
  });

  // Copy and download buttons
  btnCopyOutput.addEventListener('click', () => {
    SoundEffects.playClick();
    if (!txtOutput.value) {
      return;
    }
    navigator.clipboard.writeText(txtOutput.value)
      .then(() => {
        const oldText = btnCopyOutput.innerHTML;
        btnCopyOutput.innerHTML = '<i class="fa-solid fa-check"></i> 복사됨';
        setTimeout(() => {
          btnCopyOutput.innerHTML = oldText;
        }, 1500);
      })
      .catch(err => {
        console.error('Copy failed:', err);
      });
  });

  btnDownloadOutput.addEventListener('click', () => {
    SoundEffects.playClick();
    if (!txtOutput.value) return;
    
    const fmt = lblOutputFormat.textContent;
    let extension = 'txt';
    let mimeType = 'text/plain';
    
    if (fmt.includes('JSON')) {
      extension = 'json';
      mimeType = 'application/json';
    } else if (fmt.includes('CSV')) {
      extension = 'csv';
      mimeType = 'text/csv';
    } else if (fmt.includes('TSV')) {
      extension = 'tsv';
      mimeType = 'text/tab-separated-values';
    }
    
    const blob = new Blob([txtOutput.value], { type: `${mimeType};charset=utf-8;` });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `convert_result_${Date.now()}.${extension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // File Upload Logic
  btnBrowseFile.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  dropZone.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  function handleFile(file) {
    SoundEffects.playClick();
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 최대 5MB까지만 지원합니다.");
      SoundEffects.playError();
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      txtSource.value = event.target.result;
      updateLineNumbers(txtSource, sourceLineNumbers);
      detectAndDisplayFormat(txtSource.value);
      SoundEffects.playSuccess();
    };
    reader.onerror = () => {
      alert("파일을 읽는 중에 오류가 발생했습니다.");
      SoundEffects.playError();
    };
    reader.readAsText(file);
  }

  // Auto-Detect function
  function detectAndDisplayFormat(text) {
    const val = text.trim();
    if (!val) {
      lblDetectedFormat.textContent = '포맷 대기중';
      lblDetectedFormat.className = 'badge';
      return;
    }

    if ((val.startsWith('{') && val.endsWith('}')) || (val.startsWith('[') && val.endsWith(']'))) {
      lblDetectedFormat.textContent = 'JSON';
      lblDetectedFormat.className = 'badge'; // purple by default
    } else {
      // Look for delimiters in the first non-empty line
      const lines = val.split('\n');
      const firstLine = lines.find(l => l.trim() !== '') || '';
      const tabs = (firstLine.match(/\t/g) || []).length;
      const commas = (firstLine.match(/,/g) || []).length;

      if (tabs > commas) {
        lblDetectedFormat.textContent = 'TSV';
        lblDetectedFormat.className = 'badge badge-blue';
      } else if (commas > 0) {
        lblDetectedFormat.textContent = 'CSV';
        lblDetectedFormat.className = 'badge badge-blue';
      } else {
        lblDetectedFormat.textContent = '텍스트/구분자 미정';
        lblDetectedFormat.className = 'badge';
      }
    }
  }

  // ==========================================
  // 6. INTERACTIVE TABLE LOGIC
  // ==========================================
  function initTableState(data) {
    if (!Array.isArray(data)) {
      if (typeof data === 'object' && data !== null) {
        data = [data];
      } else {
        sectionTableViewer.style.display = 'none';
        return;
      }
    }

    if (data.length === 0) {
      sectionTableViewer.style.display = 'none';
      return;
    }

    tableState.originalData = data;
    tableState.filteredData = [...data];
    tableState.currentPage = 1;
    tableState.sortKey = null;
    tableState.sortDirection = 'asc';

    // Collect all column names
    const cols = [];
    data.forEach(item => {
      if (item && typeof item === 'object') {
        Object.keys(item).forEach(key => {
          if (!cols.includes(key)) cols.push(key);
        });
      }
    });

    if (cols.length === 0) {
      cols.push('value');
    }

    tableState.allColumns = cols;
    tableState.visibleColumns = {};
    cols.forEach(col => {
      tableState.visibleColumns[col] = true;
    });

    // Show panel
    sectionTableViewer.style.display = 'block';

    // Render checkbox filters
    renderColumnCheckboxes();

    // Render table contents
    renderTable();
  }

  function renderColumnCheckboxes() {
    wrapColumnCheckboxes.innerHTML = '';
    tableState.allColumns.forEach(col => {
      const label = document.createElement('label');
      label.className = 'col-check-lbl';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = tableState.visibleColumns[col];
      checkbox.addEventListener('change', () => {
        tableState.visibleColumns[col] = checkbox.checked;
        renderTable();
      });

      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(` ${col}`));
      wrapColumnCheckboxes.appendChild(label);
    });
  }

  function renderTable() {
    // Generate head
    tableHeadRow.innerHTML = '';
    const activeCols = tableState.allColumns.filter(c => tableState.visibleColumns[c]);

    if (activeCols.length === 0) {
      tableHeadRow.innerHTML = '<th>활성화된 열이 없습니다.</th>';
      tableBodyRows.innerHTML = '<tr><td style="text-align: center;">표시할 컬럼을 위 필터에서 선택해 주세요.</td></tr>';
      lblTableSummary.textContent = `총 ${tableState.originalData.length}개 행, ${tableState.allColumns.length}개 열`;
      return;
    }

    activeCols.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col;
      
      // Add type badge if any data row has values
      const sampleItem = tableState.originalData.find(item => item[col] !== undefined && item[col] !== null);
      if (sampleItem !== undefined) {
        const val = sampleItem[col];
        let typeLabel = typeof val;
        if (Array.isArray(val)) typeLabel = 'array';
        else if (val === null) typeLabel = 'null';
        
        const typeSpan = document.createElement('span');
        typeSpan.className = 'type-pill';
        typeSpan.textContent = typeLabel;
        th.appendChild(typeSpan);
      }

      if (tableState.sortKey === col) {
        th.classList.add(tableState.sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
      }

      th.addEventListener('click', () => {
        SoundEffects.playClick();
        if (tableState.sortKey === col) {
          tableState.sortDirection = tableState.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          tableState.sortKey = col;
          tableState.sortDirection = 'asc';
        }
        sortData();
        renderTable();
      });

      tableHeadRow.appendChild(th);
    });

    // Slice for pagination
    const startIdx = (tableState.currentPage - 1) * tableState.pageSize;
    const paginatedData = tableState.filteredData.slice(startIdx, startIdx + tableState.pageSize);

    tableBodyRows.innerHTML = '';
    if (paginatedData.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = activeCols.length;
      td.style.textAlign = 'center';
      td.textContent = '검색 결과가 없습니다.';
      tr.appendChild(td);
      tableBodyRows.appendChild(tr);
    } else {
      paginatedData.forEach(rowItem => {
        const tr = document.createElement('tr');
        activeCols.forEach(col => {
          const td = document.createElement('td');
          const val = rowItem[col];
          
          if (val === null || val === undefined) {
            td.innerHTML = '<span style="color: var(--text-dark); font-style: italic;">null</span>';
          } else if (typeof val === 'object') {
            td.textContent = JSON.stringify(val);
            td.style.fontFamily = 'monospace';
            td.style.fontSize = '0.74rem';
          } else {
            td.textContent = String(val);
          }
          tr.appendChild(td);
        });
        tableBodyRows.appendChild(tr);
      });
    }

    // Update Pagination Indicators
    const totalPages = Math.max(1, Math.ceil(tableState.filteredData.length / tableState.pageSize));
    lblPageIndicator.textContent = `페이지 ${tableState.currentPage} / ${totalPages}`;
    btnPrevPage.disabled = tableState.currentPage <= 1;
    btnNextPage.disabled = tableState.currentPage >= totalPages;

    // Summary text
    let summaryText = `총 ${tableState.originalData.length}개 행, ${tableState.allColumns.length}개 열 로드됨`;
    if (tableState.filteredData.length !== tableState.originalData.length) {
      summaryText += ` (필터링됨: ${tableState.filteredData.length}개 행)`;
    }
    lblTableSummary.textContent = summaryText;
  }

  function sortData() {
    const key = tableState.sortKey;
    if (!key) return;

    tableState.filteredData.sort((a, b) => {
      let valA = a[key];
      let valB = b[key];

      // Standardize null/undefined to empty strings for comparison
      if (valA === null || valA === undefined) valA = '';
      if (valB === null || valB === undefined) valB = '';

      if (typeof valA === 'object') valA = JSON.stringify(valA);
      if (typeof valB === 'object') valB = JSON.stringify(valB);

      if (typeof valA === 'string' && typeof valB === 'string') {
        return tableState.sortDirection === 'asc' 
          ? valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' })
          : valB.localeCompare(valA, undefined, { numeric: true, sensitivity: 'base' });
      }

      if (valA < valB) return tableState.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return tableState.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Table Search input
  inputTableSearch.addEventListener('input', () => {
    const query = inputTableSearch.value.toLowerCase().trim();
    tableState.currentPage = 1;

    if (!query) {
      tableState.filteredData = [...tableState.originalData];
    } else {
      tableState.filteredData = tableState.originalData.filter(rowItem => {
        // Search across all columns
        return tableState.allColumns.some(col => {
          const val = rowItem[col];
          if (val === null || val === undefined) return false;
          const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
          return strVal.toLowerCase().includes(query);
        });
      });
    }

    if (tableState.sortKey) {
      sortData();
    }
    renderTable();
  });

  // Table Pagination Events
  btnPrevPage.addEventListener('click', () => {
    SoundEffects.playClick();
    if (tableState.currentPage > 1) {
      tableState.currentPage--;
      renderTable();
    }
  });

  btnNextPage.addEventListener('click', () => {
    SoundEffects.playClick();
    const totalPages = Math.ceil(tableState.filteredData.length / tableState.pageSize);
    if (tableState.currentPage < totalPages) {
      tableState.currentPage++;
      renderTable();
    }
  });

  // ==========================================
  // 7. LINE NUMBERS LOGIC
  // ==========================================
  function updateLineNumbers(textarea, lineNumbersDiv) {
    if (!textarea || !lineNumbersDiv) return;
    const lines = textarea.value.split('\n');
    const count = lines.length;
    let html = '';
    for (let i = 1; i <= count; i++) {
      html += `<div>${i}</div>`;
    }
    lineNumbersDiv.innerHTML = html;
    lineNumbersDiv.scrollTop = textarea.scrollTop;
  }

  // ==========================================
  // 8. SCROLL & FLOATING CONTROLS
  // ==========================================
  window.addEventListener('scroll', updateScrollProgress);
  window.addEventListener('resize', updateScrollProgress);

  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
    
    if (scrollPercentageLbl) {
      scrollPercentageLbl.textContent = `${percent}%`;
    }

    if (progressCircleIndicator) {
      // Circumference = 2 * PI * r = 2 * 3.14159 * 20 = 125.66
      const circumference = 2 * Math.PI * 20;
      const offset = circumference - (percent / 100) * circumference;
      progressCircleIndicator.style.strokeDasharray = `${circumference}`;
      progressCircleIndicator.style.strokeDashoffset = `${offset}`;
    }
  }

  if (btnScrollTop) {
    btnScrollTop.addEventListener('click', () => {
      SoundEffects.playClick();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (btnScrollBottom) {
    btnScrollBottom.addEventListener('click', () => {
      SoundEffects.playClick();
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    });
  }
});
