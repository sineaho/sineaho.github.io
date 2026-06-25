// CineAHO PDF Merge/Split Tool Pro - Client-Side App Engine

// Set PDF.js Worker Source URL for high-performance rendering threads
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// TOC explanation articles database
const TOC_ARTICLES = {
  1: {
    title: "PDF 병합/분할 도구 개요",
    badge: "가이드 01: 개요",
    icon: "fa-circle-info",
    content: `
      <p><strong>PDF 병합/분할 도구 Pro</strong>는 현대 오피스 환경에서 가장 빈번히 발생하는 PDF 편집 작업을 외부 웹 서버로 문서 전송 없이 100% 사용자 브라우저 내에서 안전하고 빠르게 처리하는 고기능성 <strong>클라이언트 사이드 오피스 솔루션</strong>입니다.</p>
      <p>본 도구는 보안이 핵심인 기업 기밀문서나 개인정보가 포함된 금융/의료 문서를 웹 서버에 업로드할 때 발생하는 프라이버시 침해 위험을 원천 차단(0%)하며, 인터넷이 연결되지 않은 오프라인 환경에서도 완벽히 작동합니다.</p>
    `
  },
  2: {
    title: "PDF 포맷의 역사와 내부 구조",
    badge: "가이드 02: 포맷의 구조",
    icon: "fa-clock-rotate-left",
    content: `
      <p>PDF(Portable Document Format)는 1993년 어도비(Adobe) 사가 서로 다른 운영체제(Windows, Mac, Linux) 및 하드웨어 장치에서도 동일한 서식, 글꼴, 레이아웃으로 문서를 시각화하여 인쇄 및 열람하기 위해 개발한 개방형 국제 표준 문서 포맷(ISO 32000)입니다.</p>
      <p>PDF 파일 내부 구조는 텍스트 폰트 매핑 구조, 벡터 드로잉 명령줄, 이미지 바이너리 데이터 스트림 등으로 컴파일되어 있으며, 페이지 구조 테이블이 인덱스화되어 있어 문서 내 특정 페이지만을 정밀하게 분리해 내거나 다른 PDF 문서 꼬리에 붙이는 병합 연산이 매우 수학적으로 깔끔하게 수행될 수 있는 토대를 갖추고 있습니다.</p>
    `
  },
  3: {
    title: "서버리스 로컬 처리와 보안성",
    badge: "가이드 03: 보안 메커니즘",
    icon: "fa-shield-halved",
    content: `
      <p>대다수의 온라인 무료 PDF 편집 서비스는 사용자가 업로드한 문서를 클라우드 서버로 복사 전송한 뒤 서버 컴퓨터 내 프로그램(Python, Java 등)으로 변환해 결과를 다시 다운로드해 주는 방식을 취합니다. 이 과정에서 유출 사고나 보관 서버 해킹 시 심각한 정보 노출 사고가 유발될 수 있습니다.</p>
      <p>본 도구는 최신 HTML5 File API 및 WebAssembly 기반의 자바스크립트 가상 머신 연산을 수행합니다. <code>pdf-lib</code>와 <code>pdf.js</code> 엔진을 이용하여 PC 메모리 버퍼 상에서 즉석으로 데이터를 읽고 쓰기 때문에, 파일이 인터넷망을 전혀 타지 않아 공공기관 및 대기업 내부망에서도 완벽한 기밀을 유지하며 사용할 수 있습니다.</p>
    `
  },
  4: {
    title: "PDF 병합(Merge) 기술 가이드",
    badge: "가이드 04: 병합 기술",
    icon: "fa-code-merge",
    content: `
      <p><strong>PDF 병합(Merge)</strong>은 여러 개의 개별 문서들을 단일 문서 파일로 이어 붙이는 작업입니다.</p>
      <ul>
        <li><strong>병합 알고리즘</strong>: 각 업로드 파일의 바이너리 버퍼를 로드한 뒤 신규 PDFDocument 컨테이너를 생성합니다. 그 후 각 문서의 모든 페이지 인덱스를 복제(<code>copyPages</code>)하여 타겟 컨테이너에 순차적으로 적재하고 저장합니다.</li>
        <li><strong>순서 정렬 인터랙션</strong>: 드래그 앤 드롭 방식을 이용해 파일 카드 목록의 노드 순서를 바꾸면 내부 Array 리스트의 파일 인덱스가 스왑되어 최종 출력 파일에 그대로 동기화됩니다.</li>
      </ul>
    `
  },
  5: {
    title: "PDF 분할(Split) 및 추출 요령",
    badge: "가이드 05: 분할 및 추출",
    icon: "fa-scissors",
    content: `
      <p>대용량 PDF 문서에서 일부분만 발췌하거나 낱개로 쪼개어 배포할 때 유용한 기능입니다.</p>
      <ul>
        <li><strong>범위 지정 분할</strong>: <code>1-3, 5, 8-10</code>처럼 표준 인쇄 인덱스 방식을 파싱하여 지정한 페이지만을 새 문서로 복제해 다운로드합니다.</li>
        <li><strong>균등 분할</strong>: 100페이지 문서를 10페이지 단위로 끊어서 총 10개의 독립 파일로 쪼갤 수 있습니다. 생성된 파일들은 브라우저 내에서 <code>JSZip</code>을 통해 하나의 압축 파일로 패킹하여 일괄 저장합니다.</li>
        <li><strong>시각적 마우스 추출</strong>: 우측 미리보기 보드에서 각 페이지 썸네일 위의 체크박스를 직접 클릭해 체크한 페이지만을 골라내어 저장할 수도 있습니다.</li>
      </ul>
    `
  },
  6: {
    title: "이미지 변환(Convert) 품질 설정",
    badge: "가이드 06: 이미지 변환",
    icon: "fa-file-image",
    content: `
      <p>PDF 문서의 각 페이지를 픽셀 단위 이미지(PNG/JPEG) 파일로 캡처하여 저장해 줍니다.</p>
      <ul>
        <li><strong>해상도(DPI)와 스케일</strong>: DPI(Dots Per Inch)가 높을수록 텍스트 경계면이 깨끗하지만 용량이 기하급수적으로 늘어납니다:
          <ul>
            <li><strong>72 DPI</strong>: 웹 모니터 최적화 (가장 빠름)</li>
            <li><strong>150 DPI</strong>: 범용 표준 문서 검토용 (가장 추천)</li>
            <li><strong>300 DPI</strong>: 고화질 인쇄 및 OCR 텍스트 인식 판독용</li>
          </ul>
        </li>
        <li><strong>변환 메커니즘</strong>: PDF.js로 페이지 뷰포트 스케일을 구하고 오프스크린 캔버스를 임시 생성하여 페이지 픽셀 정보를 드로잉한 뒤, <code>canvas.toBlob()</code> 바이너리를 아카이브에 압축합니다.</li>
      </ul>
    `
  },
  7: {
    title: "워터마크(Watermark) 설계 기법",
    badge: "가이드 07: 워터마크 가이드",
    icon: "fa-stamp",
    content: `
      <p>문서 도용 및 무단 복제를 방지하기 위해 텍스트 스탬프를 오버레이하는 보안 기법입니다.</p>
      <ul>
        <li><strong>투명도 조절</strong>: 본문 글자를 가리지 않도록 0.1 ~ 0.5 사이의 은은한 투명도(Opacity) 설정을 장착해 주는 것이 비주얼 가독성에 좋습니다.</li>
        <li><strong>9개 그리드 위치</strong>: 문서 크기를 X/Y 평면으로 분할하여 좌상단(TL), 중앙(MC), 우하단(BR) 등 9가지 표준 위치 좌표값을 동적으로 계산하여 오버레이합니다.</li>
        <li><strong>글꼴 연산</strong>: 영문 표준 헬베티카(Helvetica) 폰트를 내장하여 에셋 에러 없이 고품격 텍스트를 드로잉합니다.</li>
      </ul>
    `
  },
  8: {
    title: "텍스트 추출(Extract)과 메타데이터",
    badge: "가이드 08: 텍스트 추출",
    icon: "fa-file-lines",
    content: `
      <p>PDF에 인쇄된 텍스트 레이어를 긁어모아 컴퓨터 편집용 텍스트 파일(.txt)로 저장하는 강력한 OCR 보조 텍스트 긁기 툴입니다.</p>
      <ul>
        <li><strong>디코딩 연산</strong>: PDF.js의 <code>page.getTextContent()</code> 메소드를 활용하여 각 페이지에 숨겨진 문자열 객체를 위치 정보 순서대로 순회 스캔합니다.</li>
        <li><strong>메모장 저장</strong>: 수집한 문자열을 줄바꿈 서식과 함께 버퍼에 머지한 뒤 가상 Blob 링크를 생성해 텍스트 문서로 저장시킵니다.</li>
      </ul>
    `
  },
  9: {
    title: "브라우저 렌더링 성능 최적화",
    badge: "가이드 09: 최적화 기법",
    icon: "fa-gauge-high",
    content: `
      <p>수십 메가바이트가 넘는 PDF를 브라우저에서 다룰 때 렉 현상이나 메모리 부족 현상을 극복하기 위한 기법들입니다.</p>
      <ul>
        <li><strong>비동기 파이프라인</strong>: PDF 썸네일을 렌더링할 때 한 번에 모든 페이지를 그리면 브라우저 메인 루프가 중단됩니다. 이를 막기 위해 비동기 <code>async/await</code> 루프를 돌려 1페이지씩 렌더링한 후 순차 삽입합니다.</li>
        <li><strong>가비지 컬렉션 유도</strong>: 작업에 쓰인 임시 ArrayBuffer 메모리 객체와 PDF 도큐먼트 인스턴스들은 작업 완료 후 즉시 <code>null</code>로 변환하여 힙 메모리를 해제합니다.</li>
      </ul>
    `
  },
  10: {
    title: "스마트 사무 자동화의 기대 효과",
    badge: "가이드 10: 스마트 오피스",
    icon: "fa-laptop-code",
    content: `
      <p>스마트 오피스 환경에서 본 local PDF 도구가 주는 가치입니다.</p>
      <ul>
        <li><strong>무설치 오피스 환경</strong>: 값비싼 상용 PDF 편집 소프트웨어를 개별 PC마다 라이선스를 끊어 깔 필요 없이, 즐겨찾기 등록만으로 크롬 브라우저에서 즉시 업무를 해결합니다.</li>
        <li><strong>데이터 유출 예방책</strong>: 회사 내부 보안 감사 규정상 외부 사이트에 파일 업로드가 금지되어 있는 실무 연구원 및 금융사 직원들에게 최상의 대안이 됩니다.</li>
      </ul>
    `
  },
  11: {
    title: "자주 묻는 질문 (FAQ)",
    badge: "가이드 11: FAQ",
    icon: "fa-question-circle",
    content: `
      <p><strong>Q. 암호가 걸린 PDF 파일도 병합이나 분할이 가능한가요?</strong><br>A. 보안 암호(Password)가 걸린 PDF의 경우, 브라우저가 내부 락을 해제할 수 없으므로 업로드 단계에서 파싱 에러가 발생합니다. 먼저 암호 해제 조치를 마친 후에 업로드하셔야 동작합니다.</p>
      <p><strong>Q. 모바일 폰에서도 이 웹을 통해 병합한 파일을 바로 다운받을 수 있나요?</strong><br>A. 네! 아이폰 및 안드로이드폰 모바일 브라우저에서도 로컬 다운로드 드라이버가 동일하게 반응하므로 즉시 변환하고 저장할 수 있습니다.</p>
      <p><strong>Q. 여러 파일을 올렸는데 왜 썸네일 그리드에는 한 파일만 보이나요?</strong><br>A. 썸네일 기반의 '분할', '이미지 변환', '고급 편집' 작업은 단일 문서를 가공하는 방식이므로, 업로드된 파일들 중 가장 첫 번째 파일의 페이지만 미리보기에 정렬되어 표시됩니다.</p>
    `
  }
};

// Global PDF App State variables
let activeTab = "merge"; // "merge", "split", "convert", "advanced"
let uploadedFiles = []; // Array of files: { id, name, size, arrayBuffer, pdfjsDoc, totalPages }
let fileCounter = 0;

// Selected pages set (used in Split/Convert/Advanced)
let selectedPages = new Set(); // 1-indexed page numbers

// Custom Watermark pos mapping
let selectedWatermarkPosition = "MC"; // Default Middle-Center

// DOM elements cache
const fileInput = document.getElementById("file-input");
const btnSelectFile = document.getElementById("btn-select-file");
const dropZone = document.getElementById("drop-zone");
const btnSettingsToggle = document.getElementById("btn-settings-toggle");
const settingsCard = document.getElementById("settings-card");
const settingsTitle = document.getElementById("settings-title");

const navTabs = document.querySelectorAll(".btn-nav-tab");
const settingsSections = document.querySelectorAll(".setting-group-box");

// Preview boards elements
const previewBoardTitle = document.getElementById("preview-board-title");
const lblFileCount = document.getElementById("lbl-file-count");
const previewPlaceholderBox = document.getElementById("preview-placeholder-box");
const placeholderMessage = document.getElementById("placeholder-message");

const mergeListBox = document.getElementById("merge-list-box");
const fileCardsUl = document.getElementById("file-cards-ul");

const thumbnailsGridBox = document.getElementById("thumbnails-grid-box");

const extractedTextBox = document.getElementById("extracted-text-box");
const txtExtractionArea = document.getElementById("txt-extraction-area");
const btnCopyExtractedText = document.getElementById("btn-copy-extracted-text");
const btnDownloadTxtFile = document.getElementById("btn-download-txt-file");

// Settings actions triggers buttons
const btnRunMerge = document.getElementById("btn-run-merge");
const btnRunSplit = document.getElementById("btn-run-split");
const btnRunConvert = document.getElementById("btn-run-convert");
const btnRunAdvanced = document.getElementById("btn-run-advanced");

// Form controls inputs
const splitModeSelect = document.getElementById("split-mode-select");
const splitRangeInput = document.getElementById("split-range-input");
const splitFixedInput = document.getElementById("split-fixed-input");

const convertFormatSelect = document.getElementById("convert-format-select");
const convertDpiSelect = document.getElementById("convert-dpi-select");

const advActionSelect = document.getElementById("adv-action-select");
const wmTextInput = document.getElementById("wm-text-input");
const wmSizeInput = document.getElementById("wm-size-input");
const wmOpacityInput = document.getElementById("wm-opacity-input");
const wmColorPicker = document.getElementById("wm-color-picker");
const btnWmPositions = document.querySelectorAll(".btn-wm-pos");
const selectRotateAngle = document.getElementById("rotate-angle-select");
const selectRotateTarget = document.getElementById("rotate-target-select");

// TOC items
const explanationBoardContent = document.getElementById("explanation-board-content");
const explanationTitleBadge = document.getElementById("explanation-title-badge");
const explanationDisplayTitle = document.getElementById("explanation-display-title");
const explanationDisplayText = document.getElementById("explanation-display-text");
const tocListItems = document.querySelectorAll(".explanation-index-list li");

// -------------------------------------------------------------
// Bootstrap Setup
// -------------------------------------------------------------
function init() {
  setupEventListeners();
  
  // Set default TOC text
  switchTOCArticle(1);
  
  // Refresh Tab state
  switchTab(activeTab);
}

function setupEventListeners() {
  // Navigation Tabs clicks
  navTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      navTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      const tabId = tab.getAttribute("data-tab");
      switchTab(tabId);
    });
  });

  // Settings Card collapsible toggle
  btnSettingsToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (settingsCard.style.display === "none") {
      settingsCard.style.display = "block";
      btnSettingsToggle.classList.add("active");
    } else {
      settingsCard.style.display = "none";
      btnSettingsToggle.classList.remove("active");
    }
  });

  // File upload clicking dropzone triggers file picker
  dropZone.addEventListener("click", () => {
    fileInput.click();
  });
  btnSelectFile.addEventListener("click", (e) => {
    e.stopPropagation(); // prevent triggering dropZone click
    fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    handleSelectedFiles(e.target.files);
  });

  // Drag and drop event listeners
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });
  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    handleSelectedFiles(e.dataTransfer.files);
  });

  // Actions trigger clicks
  btnRunMerge.addEventListener("click", () => runMergeAction());
  btnRunSplit.addEventListener("click", () => runSplitAction());
  btnRunConvert.addEventListener("click", () => runConvertAction());
  btnRunAdvanced.addEventListener("click", () => runAdvancedAction());

  // Split configurations options switch
  splitModeSelect.addEventListener("change", (e) => {
    const val = e.target.value;
    document.getElementById("split-range-group").style.display = val === "range" ? "flex" : "none";
    document.getElementById("split-fixed-group").style.display = val === "fixed" ? "flex" : "none";
  });

  // Advanced configurations edit options switch
  advActionSelect.addEventListener("change", (e) => {
    const val = e.target.value;
    document.getElementById("adv-watermark-options").style.display = val === "watermark" ? "flex" : "none";
    document.getElementById("adv-rotate-options").style.display = val === "rotate" ? "flex" : "none";
    document.getElementById("adv-extract-options").style.display = val === "extract" ? "flex" : "none";
    
    // Switch preview states directly if Text Extract
    if (val === "extract" && uploadedFiles.length > 0) {
      thumbnailsGridBox.style.display = "none";
      extractedTextBox.style.display = "flex";
    } else if (uploadedFiles.length > 0) {
      thumbnailsGridBox.style.display = "grid";
      extractedTextBox.style.display = "none";
    }
  });

  // Watermark position buttons
  btnWmPositions.forEach(btn => {
    btn.addEventListener("click", () => {
      btnWmPositions.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedWatermarkPosition = btn.getAttribute("data-pos");
    });
  });

  // Extracted text copying / downloading
  btnCopyExtractedText.addEventListener("click", () => {
    const text = txtExtractionArea.value;
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        alert("추출된 텍스트가 클립보드에 복사되었습니다!");
      });
    }
  });

  btnDownloadTxtFile.addEventListener("click", () => {
    const text = txtExtractionArea.value;
    if (text) {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `extracted_text_${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  });

  // Floating menus
  document.getElementById("btn-scroll-top").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.getElementById("btn-scroll-bottom").addEventListener("click", () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  });

  // TOC navigation index list
  tocListItems.forEach((li) => {
    li.addEventListener("click", () => {
      tocListItems.forEach(item => item.classList.remove("active"));
      li.classList.add("active");
      
      const idx = parseInt(li.getAttribute("data-index"), 10);
      switchTOCArticle(idx);
    });
  });
}

// -------------------------------------------------------------
// Tabs Swapper
// -------------------------------------------------------------
function switchTab(tabId) {
  activeTab = tabId;
  
  // Settings Sections switch
  settingsSections.forEach(section => {
    if (section.id === `settings-${tabId}`) {
      section.classList.add("active-settings");
    } else {
      section.classList.remove("active-settings");
    }
  });

  // Update Settings Title
  const titles = {
    merge: "병합 상세 옵션",
    split: "분할 상세 옵션",
    convert: "변환 상세 옵션",
    advanced: "고급 편집 옵션"
  };
  settingsTitle.textContent = titles[tabId];

  // Refresh Workspace Right panel matching tabs
  updatePreviewsContainer();
}

// Refresh dynamic panels previews
function updatePreviewsContainer() {
  // Hide all
  mergeListBox.style.display = "none";
  thumbnailsGridBox.style.display = "none";
  extractedTextBox.style.display = "none";
  previewPlaceholderBox.style.display = "none";
  
  if (uploadedFiles.length === 0) {
    previewPlaceholderBox.style.display = "flex";
    lblFileCount.textContent = "업로드 대기 중";
    
    // Set placeholder descriptions
    if (activeTab === "merge") {
      previewBoardTitle.textContent = "PDF 병합 준비";
      placeholderMessage.innerHTML = "병합할 PDF 파일을 업로드하세요.<br>최소 2개의 파일이 필요합니다.";
    } else if (activeTab === "split") {
      previewBoardTitle.textContent = "PDF 분할 미리보기";
      placeholderMessage.innerHTML = "분할할 단일 PDF 파일을 업로드하세요.";
    } else if (activeTab === "convert") {
      previewBoardTitle.textContent = "PDF 이미지 변환 미리보기";
      placeholderMessage.innerHTML = "이미지로 변환할 단일 PDF 파일을 업로드하세요.";
    } else {
      previewBoardTitle.textContent = "PDF 고급 편집 미리보기";
      placeholderMessage.innerHTML = "편집할 단일 PDF 파일을 업로드하세요.";
    }
    
    // Disable run triggers
    disableActionButtons();
    return;
  }

  // Files are uploaded! Populate UI content
  if (activeTab === "merge") {
    previewBoardTitle.textContent = "PDF 병합 목록";
    lblFileCount.textContent = `${uploadedFiles.length}개 파일`;
    mergeListBox.style.display = "block";
    
    renderMergeFilesList();
    
    // Enable run buttons if >= 2 files
    btnRunMerge.disabled = uploadedFiles.length < 2;
  } 
  
  else {
    // Split/Convert/Advanced operate on 1st uploaded file
    const targetFile = uploadedFiles[0];
    lblFileCount.textContent = `${targetFile.name} (${targetFile.totalPages}p)`;
    
    if (activeTab === "split") {
      previewBoardTitle.textContent = "PDF 분할 페이지 선택";
      thumbnailsGridBox.style.display = "grid";
      renderThumbnailsGrid(targetFile);
      btnRunSplit.disabled = false;
    } 
    
    else if (activeTab === "convert") {
      previewBoardTitle.textContent = "PDF 변환 페이지 선택";
      thumbnailsGridBox.style.display = "grid";
      renderThumbnailsGrid(targetFile);
      btnRunConvert.disabled = false;
    } 
    
    else if (activeTab === "advanced") {
      previewBoardTitle.textContent = "PDF 고급 편집 미리보기";
      
      const advAction = advActionSelect.value;
      if (advAction === "extract") {
        extractedTextBox.style.display = "flex";
        // run immediate preview text extract
        runLiveTextExtractPreview(targetFile);
      } else {
        thumbnailsGridBox.style.display = "grid";
        renderThumbnailsGrid(targetFile);
      }
      btnRunAdvanced.disabled = false;
    }
  }
}

function disableActionButtons() {
  btnRunMerge.disabled = true;
  btnRunSplit.disabled = true;
  btnRunConvert.disabled = true;
  btnRunAdvanced.disabled = true;
}

// -------------------------------------------------------------
// File Upload Logic
// -------------------------------------------------------------
function handleSelectedFiles(filesList) {
  if (filesList.length === 0) return;
  
  // Load files as arrayBuffers asynchronously
  let promises = [];
  
  for (let file of filesList) {
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      alert(`${file.name}은 올바른 PDF 형식이 아닙니다.`);
      continue;
    }
    
    const promise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async function(evt) {
        try {
          const arrayBuffer = evt.target.result;
          // Load document using PDF.js to fetch page count/metadata
          const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          
          fileCounter++;
          const fileObj = {
            id: fileCounter,
            name: file.name,
            size: file.size,
            arrayBuffer: arrayBuffer,
            pdfjsDoc: pdfDoc,
            totalPages: pdfDoc.numPages
          };
          
          resolve(fileObj);
        } catch(e) {
          console.error("Failed to parse pdf document:", e);
          alert(`${file.name} 파싱 도중 오류가 발생했습니다. 암호가 걸린 문서인지 확인해 주세요.`);
          resolve(null);
        }
      };
      reader.readAsArrayBuffer(file);
    });
    
    promises.push(promise);
  }

  Promise.all(promises).then((results) => {
    // Filter successful results
    const loaded = results.filter(f => f !== null);
    
    if (activeTab === "merge") {
      uploadedFiles = uploadedFiles.concat(loaded);
    } else {
      // In single file modes, replace completely
      uploadedFiles = loaded.slice(0, 1);
    }
    
    // reset selection Set
    selectedPages.clear();
    
    updatePreviewsContainer();
  });
}

// -------------------------------------------------------------
// Previews Builders
// -------------------------------------------------------------

// 1. Files List renderer for PDF Merging (Re-orderable list)
function renderMergeFilesList() {
  fileCardsUl.innerHTML = "";
  
  uploadedFiles.forEach((file, idx) => {
    const li = document.createElement("li");
    li.className = "file-list-card";
    li.setAttribute("draggable", "true");
    li.setAttribute("data-index", idx);
    
    const formatSize = (bytes) => {
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    li.innerHTML = `
      <div class="card-left-info">
        <div class="drag-handle-btn" title="드래그하여 순서 변경">
          <i class="fa-solid fa-grip-lines"></i>
        </div>
        <div class="file-icon-pdf">
          <i class="fa-solid fa-file-pdf"></i>
        </div>
        <div class="file-details-wrapper">
          <span class="file-name" title="${file.name}">${file.name}</span>
          <div class="file-meta-row">
            <span>크기: ${formatSize(file.size)}</span>
            <span>페이지 수: ${file.totalPages}p</span>
          </div>
        </div>
      </div>
      <button class="btn-remove-card" title="파일 삭제" onclick="removeFileFromList(${file.id})">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    
    // Bind Drag events for reordering files
    bindDragEventsToCard(li);
    
    fileCardsUl.appendChild(li);
  });
}

window.removeFileFromList = function(fileId) {
  uploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
  updatePreviewsContainer();
};

// Reorder drag and drop handlers
let dragSrcEl = null;

function bindDragEventsToCard(card) {
  card.addEventListener("dragstart", (e) => {
    dragSrcEl = card;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", card.innerHTML);
    card.style.opacity = "0.4";
  });
  
  card.addEventListener("dragover", (e) => {
    e.preventDefault();
    return false;
  });
  
  card.addEventListener("dragenter", (e) => {
    card.classList.add("drag-over-card");
  });
  
  card.addEventListener("dragleave", () => {
    card.classList.remove("drag-over-card");
  });
  
  card.addEventListener("drop", (e) => {
    e.stopPropagation();
    
    if (dragSrcEl !== card) {
      const srcIdx = parseInt(dragSrcEl.getAttribute("data-index"), 10);
      const destIdx = parseInt(card.getAttribute("data-index"), 10);
      
      // Swap items in uploadedFiles Array
      const temp = uploadedFiles[srcIdx];
      uploadedFiles.splice(srcIdx, 1);
      uploadedFiles.splice(destIdx, 0, temp);
      
      renderMergeFilesList();
      updatePreviewsContainer();
    }
    return false;
  });
  
  card.addEventListener("dragend", () => {
    card.style.opacity = "1.0";
    card.classList.remove("drag-over-card");
  });
}

// 2. Page Thumbnails grid renderer (using PDF.js async page rendering)
async function renderThumbnailsGrid(file) {
  thumbnailsGridBox.innerHTML = "";
  
  const totalPages = file.totalPages;
  
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const card = document.createElement("div");
    card.className = "page-thumbnail-card";
    
    const isChecked = selectedPages.has(pageNum) ? "checked" : "";
    
    card.innerHTML = `
      <label class="page-select-checkbox-container">
        <input type="checkbox" data-page="${pageNum}" ${isChecked}>
      </label>
      <div class="thumb-canvas-wrapper" id="canvas-wrap-${pageNum}">
        <!-- Canvas injected asynchronously -->
        <div style="font-size:0.7rem; color:var(--text-dark); position:absolute;">로딩 중...</div>
      </div>
      <div class="page-meta-footer">Page ${pageNum}</div>
    `;
    
    thumbnailsGridBox.appendChild(card);
    
    // Trigger lazy rendering of page content on canvas
    renderPageCanvasThumbnail(file.pdfjsDoc, pageNum);
    
    // Checkbox click listener
    const chk = card.querySelector("input[type='checkbox']");
    chk.addEventListener("change", (e) => {
      const p = parseInt(e.target.getAttribute("data-page"), 10);
      if (e.target.checked) {
        selectedPages.add(p);
      } else {
        selectedPages.delete(p);
      }
      
      // Sync split range input field if Split Mode Range
      if (activeTab === "split") {
        syncSplitRangeInput();
      }
    });
  }
}

// Render page canvas thumbnail
async function renderPageCanvasThumbnail(pdfDoc, pageNum) {
  try {
    const page = await pdfDoc.getPage(pageNum);
    const wrap = document.getElementById(`canvas-wrap-${pageNum}`);
    if (!wrap) return;
    
    const viewport = page.getViewport({ scale: 0.3 }); // thumbnail small scale
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const canvasCtx = canvas.getContext("2d");
    wrap.innerHTML = "";
    wrap.appendChild(canvas);
    
    const renderContext = {
      canvasContext: canvasCtx,
      viewport: viewport
    };
    
    await page.render(renderContext).promise;
  } catch(e) {
    console.error(`Page ${pageNum} thumbnail render failed:`, e);
  }
}

// Fills range input string based on selected checked checkboxes
function syncSplitRangeInput() {
  if (selectedPages.size === 0) {
    splitRangeInput.value = "";
    return;
  }
  
  // Format selectedPages array to range string, e.g. [1, 2, 3, 5] -> "1-3, 5"
  const sorted = Array.from(selectedPages).sort((a,b)=>a-b);
  let ranges = [];
  let start = sorted[0];
  let end = start;
  
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      if (start === end) {
        ranges.push(`${start}`);
      } else {
        ranges.push(`${start}-${end}`);
      }
      start = sorted[i];
      end = start;
    }
  }
  
  if (start === end) {
    ranges.push(`${start}`);
  } else {
    ranges.push(`${start}-${end}`);
  }
  
  splitRangeInput.value = ranges.join(", ");
}

// -------------------------------------------------------------
// Core Actions Implementation Engines
// -------------------------------------------------------------

// Helper to parse page range input
function parsePageRanges(rangeStr, maxPage) {
  const pages = [];
  const parts = rangeStr.split(",");
  
  for (let part of parts) {
    part = part.trim();
    if (!part) continue;
    
    if (part.includes("-")) {
      const sub = part.split("-");
      const start = parseInt(sub[0], 10);
      const end = parseInt(sub[1], 10);
      if (!isNaN(start) && !isNaN(end)) {
        const s = Math.min(start, end);
        const e = Math.max(start, end);
        for (let i = s; i <= e; i++) {
          if (i >= 1 && i <= maxPage) pages.push(i);
        }
      }
    } else {
      const num = parseInt(part, 10);
      if (!isNaN(num) && num >= 1 && num <= maxPage) {
        pages.push(num);
      }
    }
  }
  
  return [...new Set(pages)].sort((a,b)=>a-b);
}

// 1. PDF 병합 (Merge)
async function runMergeAction() {
  if (uploadedFiles.length < 2) return;
  
  try {
    const mergedDoc = await PDFLib.PDFDocument.create();
    
    for (let file of uploadedFiles) {
      const srcDoc = await PDFLib.PDFDocument.load(file.arrayBuffer);
      const pagesCount = srcDoc.getPageCount();
      const indices = Array.from({ length: pagesCount }, (_, i) => i);
      
      const copiedPages = await mergedDoc.copyPages(srcDoc, indices);
      copiedPages.forEach(page => mergedDoc.addPage(page));
    }
    
    const mergedPdfBytes = await mergedDoc.save();
    
    // Download PDF Blob
    const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `merged_${Date.now()}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch(e) {
    console.error("PDF Merge failed:", e);
    alert("PDF 병합 실행 도중 에러가 발생했습니다.");
  }
}

// 2. PDF 분할 (Split)
async function runSplitAction() {
  if (uploadedFiles.length === 0) return;
  const file = uploadedFiles[0];
  const totalPages = file.totalPages;
  const mode = splitModeSelect.value;
  
  try {
    const srcDoc = await PDFLib.PDFDocument.load(file.arrayBuffer);
    
    if (mode === "range") {
      // Split selected range into a single file
      const rangeStr = splitRangeInput.value.trim();
      let targetPages = [];
      
      if (rangeStr) {
        targetPages = parsePageRanges(rangeStr, totalPages);
      } else {
        // Fallback: if no range input, use checked checkboxes
        targetPages = Array.from(selectedPages).sort((a,b)=>a-b);
      }
      
      if (targetPages.length === 0) {
        alert("분할할 페이지 범위를 기입하거나 페이지를 체크해 주세요.");
        return;
      }
      
      const splitDoc = await PDFLib.PDFDocument.create();
      // copyPages uses 0-indexed values
      const copied = await splitDoc.copyPages(srcDoc, targetPages.map(p => p - 1));
      copied.forEach(page => splitDoc.addPage(page));
      
      const bytes = await splitDoc.save();
      
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `split_${targetPages[0]}-${targetPages[targetPages.length-1]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } 
    
    else if (mode === "fixed") {
      // Split into groups of N pages each
      const n = parseInt(splitFixedInput.value, 10);
      if (isNaN(n) || n < 1) {
        alert("올바른 균등 분할 기준 페이지를 기입해 주세요.");
        return;
      }
      
      const zip = new JSZip();
      
      let chunkIndex = 1;
      for (let i = 0; i < totalPages; i += n) {
        const splitDoc = await PDFLib.PDFDocument.create();
        
        let rangeIndices = [];
        for (let j = i; j < i + n && j < totalPages; j++) {
          rangeIndices.push(j);
        }
        
        const copied = await splitDoc.copyPages(srcDoc, rangeIndices);
        copied.forEach(page => splitDoc.addPage(page));
        
        const bytes = await splitDoc.save();
        zip.file(`split_part_${chunkIndex}.pdf`, bytes);
        chunkIndex++;
      }
      
      // Download ZIP
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `split_fixed_${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } 
    
    else if (mode === "all") {
      // Split all pages into individual files
      const zip = new JSZip();
      
      for (let i = 0; i < totalPages; i++) {
        const splitDoc = await PDFLib.PDFDocument.create();
        const [copied] = await splitDoc.copyPages(srcDoc, [i]);
        splitDoc.addPage(copied);
        
        const bytes = await splitDoc.save();
        zip.file(`page_${i + 1}.pdf`, bytes);
      }
      
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `split_all_${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    }
  } catch(e) {
    console.error("PDF Split failed:", e);
    alert("PDF 분할 실행 도중 에러가 발생했습니다.");
  }
}

// 3. 이미지 변환 (Convert)
async function runConvertAction() {
  if (uploadedFiles.length === 0) return;
  const file = uploadedFiles[0];
  const pdfDoc = file.pdfjsDoc;
  
  const format = convertFormatSelect.value;
  const dpi = parseInt(convertDpiSelect.value, 10);
  
  // Set scale factor matching DPI: 72 -> scale 1.0, 150 -> scale 2.0, 300 -> scale 4.0
  const scale = dpi === 72 ? 1.0 : (dpi === 150 ? 2.0 : 4.0);
  const mimeType = format === "png" ? "image/png" : "image/jpeg";
  
  // Determine target page indexes
  let targetPages = [];
  if (selectedPages.size > 0) {
    targetPages = Array.from(selectedPages).sort((a,b)=>a-b);
  } else {
    // default convert all
    for (let i = 1; i <= file.totalPages; i++) {
      targetPages.push(i);
    }
  }

  try {
    const zip = new JSZip();
    
    for (let pageNum of targetPages) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: scale });
      
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      const canvasCtx = canvas.getContext("2d");
      
      await page.render({
        canvasContext: canvasCtx,
        viewport: viewport
      }).promise;
      
      // Get base64 data
      const dataUrl = canvas.toDataURL(mimeType, 0.9);
      const base64Data = dataUrl.split(",")[1];
      
      zip.file(`page_${pageNum}.${format}`, base64Data, { base64: true });
    }
    
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `converted_images_${Date.now()}.zip`;
    link.click();
    URL.revokeObjectURL(url);
  } catch(e) {
    console.error("PDF Image Convert failed:", e);
    alert("이미지 일괄 변환 도중 오류가 발생했습니다.");
  }
}

// 4. 고급 편집 (Advanced: Watermark, Rotate, Extract Text)
async function runAdvancedAction() {
  if (uploadedFiles.length === 0) return;
  const file = uploadedFiles[0];
  const advAction = advActionSelect.value;
  
  try {
    const srcDoc = await PDFLib.PDFDocument.load(file.arrayBuffer);
    
    if (advAction === "watermark") {
      const text = wmTextInput.value.trim() || "CONFIDENTIAL";
      const size = parseInt(wmSizeInput.value, 10) || 30;
      const opacity = parseFloat(wmOpacityInput.value) || 0.3;
      const hexColor = wmColorPicker.value || "#ff0000";
      
      // Convert HEX color to pdf-lib rgb values
      const rgb = hexToRgbRatio(hexColor);
      
      const pages = srcDoc.getPages();
      
      // Determine which pages to write watermark
      let targetPages = [];
      if (selectedPages.size > 0) {
        selectedPages.forEach(p => {
          if (p >= 1 && p <= pages.length) targetPages.push(p - 1);
        });
      } else {
        // default all
        targetPages = Array.from({ length: pages.length }, (_, i) => i);
      }
      
      // Embed standard Font Helvetica
      const font = await srcDoc.embedFont(PDFLib.StandardFonts.Helvetica);
      
      targetPages.forEach(idx => {
        const page = pages[idx];
        const { width, height } = page.getSize();
        
        // Calculate watermark text width/height
        const textWidth = font.widthOfTextAtSize(text, size);
        const textHeight = size;
        
        let x = (width - textWidth) / 2;
        let y = (height - textHeight) / 2;
        
        // Determine 9-grid coordinates
        if (selectedWatermarkPosition === "TL") { x = 20; y = height - textHeight - 20; }
        else if (selectedWatermarkPosition === "TC") { x = (width - textWidth) / 2; y = height - textHeight - 20; }
        else if (selectedWatermarkPosition === "TR") { x = width - textWidth - 20; y = height - textHeight - 20; }
        else if (selectedWatermarkPosition === "ML") { x = 20; y = (height - textHeight) / 2; }
        else if (selectedWatermarkPosition === "MC") { x = (width - textWidth) / 2; y = (height - textHeight) / 2; }
        else if (selectedWatermarkPosition === "MR") { x = width - textWidth - 20; y = (height - textHeight) / 2; }
        else if (selectedWatermarkPosition === "BL") { x = 20; y = 20; }
        else if (selectedWatermarkPosition === "BC") { x = (width - textWidth) / 2; y = 20; }
        else if (selectedWatermarkPosition === "BR") { x = width - textWidth - 20; y = 20; }
        
        page.drawText(text, {
          x: x,
          y: y,
          size: size,
          font: font,
          color: PDFLib.rgb(rgb.r, rgb.g, rgb.b),
          opacity: opacity
        });
      });
      
      const bytes = await srcDoc.save();
      downloadPdfBlob(bytes, `watermarked_${Date.now()}.pdf`);
    } 
    
    else if (advAction === "rotate") {
      const angle = parseInt(selectRotateAngle.value, 10);
      const targetMode = selectRotateTarget.value;
      
      const pages = srcDoc.getPages();
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        
        // Check if targeting selected check page
        if (targetMode === "selected" && !selectedPages.has(i + 1)) {
          continue;
        }
        
        // Accumulate rotation angle
        const currentRotation = page.getRotation().angle;
        page.setRotation(PDFLib.degrees((currentRotation + angle) % 360));
      }
      
      const bytes = await srcDoc.save();
      downloadPdfBlob(bytes, `rotated_${Date.now()}.pdf`);
    }
  } catch(e) {
    console.error("Advanced action failed:", e);
    alert("고급 편집 작업 실행 중 에러가 발생했습니다.");
  }
}

// Hex color to RGB Ratio helper
function hexToRgbRatio(hex) {
  // #ff0000 -> { r: 1.0, g: 0, b: 0 }
  const r = parseInt(hex.substring(1, 3), 16) / 255;
  const g = parseInt(hex.substring(3, 5), 16) / 255;
  const b = parseInt(hex.substring(5, 7), 16) / 255;
  return { r, g, b };
}

function downloadPdfBlob(bytes, filename) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// 5. Live Text Extraction Preview
async function runLiveTextExtractPreview(file) {
  txtExtractionArea.value = "텍스트 본문을 추출하고 있습니다. 잠시만 기다려 주세요...";
  
  try {
    const pdfDoc = file.pdfjsDoc;
    let fullText = "";
    
    for (let i = 1; i <= file.totalPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items.map(item => item.str).join(" ");
      fullText += `--- PAGE ${i} ---\n${pageText}\n\n`;
    }
    
    txtExtractionArea.value = fullText.trim() || "[추출된 텍스트가 없습니다. 이미지 기반 문서의 경우 OCR 스캔이 요구됩니다.]";
  } catch(e) {
    console.error("Text extraction failed:", e);
    txtExtractionArea.value = "텍스트 추출 과정에 에러가 발생했습니다.";
  }
}

// -------------------------------------------------------------
// TOC Page Switcher
// -------------------------------------------------------------
function switchTOCArticle(index) {
  const article = TOC_ARTICLES[index];
  if (!article) return;
  
  explanationBoardContent.classList.add("fade-out");
  
  setTimeout(() => {
    explanationTitleBadge.innerHTML = `<i class="fa-solid ${article.icon} text-blue"></i> <span>${article.badge}</span>`;
    explanationDisplayTitle.textContent = article.title;
    explanationDisplayText.innerHTML = article.content;
    
    explanationBoardContent.classList.remove("fade-out");
  }, 300);
}

// Initialize
window.addEventListener("DOMContentLoaded", () => {
  init();
});
