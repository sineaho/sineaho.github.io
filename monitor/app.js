// CineAHO Monitor Dead Pixel Tester Pro - Client-Side App Engine

// Guide Database
const GUIDE_ARTICLES = {
  1: {
    title: "불량 화소란 무엇인가?",
    badge: "가이드 01: 개요",
    icon: "fa-circle-info",
    content: `
      <p><strong>불량 화소 (Defective Pixel)</strong>는 LCD, OLED 등 디스플레이 패널을 구성하는 수백만 개의 초미세 서브픽셀(Sub-pixel) 중 오작동하여 정상적으로 빛을 발산하지 못하거나 특정 색으로 상시 고정되어 버린 화소를 뜻합니다.</p>
      <p>모니터 화면은 적색(Red), 녹색(Green), 청색(Blue)의 3개 서브픽셀이 모여 하나의 픽셀(화소)을 이루는데, 이 소자들의 미세 회로 불량이나 신호 고정 등으로 불량 화소가 발생합니다. 일반적으로 화면의 선명도를 해치고 시선 집중을 방해해 초기 불량 체크 시 가장 먼저 확인해야 할 핵심 항목입니다.</p>
    `
  },
  2: {
    title: "불량 화소의 종류",
    badge: "가이드 02: 불량 화소 종류",
    icon: "fa-sliders",
    content: `
      <p>디스플레이에서 발생할 수 있는 불량 화소는 작동 형태와 양상에 따라 크게 3가지로 분류됩니다.</p>
      <ul>
        <li><strong>데드 픽셀 (Dead Pixel / 암점)</strong>: 전류 제어가 작동하지 않아 항상 꺼져 있는 상태의 검은색 점입니다. 흰색 바탕화면이나 밝은 계열 화면을 켰을 때 가장 명확하게 드러납니다.</li>
        <li><strong>스턱 픽셀 (Stuck Pixel / 상시 점등 화소)</strong>: 서브픽셀 중 일부(R/G/B)가 항상 켜진 상태로 액정이 고착된 화소입니다. 특정 유채색(적색, 녹색, 청색, 자홍색 등)으로 화면에 고정되어 표시됩니다.</li>
        <li><strong>핫 픽셀 (Hot Pixel / 휘점)</strong>: 서브픽셀 전체가 전압 제어를 잃고 최대 강도로 발광하여 흰색 점으로 계속 빛나는 상태입니다. 어두운 검은색 배경에서 눈에 띄게 식별됩니다.</li>
      </ul>
    `
  },
  3: {
    title: "불량 화소가 생기는 원인",
    badge: "가이드 03: 발생 원인",
    icon: "fa-microchip",
    content: `
      <p>불량 화소의 주된 원인은 패널의 제조 공정상의 한계와 미세 불량에서 비롯됩니다.</p>
      <p>디스플레이 제조 공정은 나노미터 단위의 초정밀 진공 증착 작업을 수백 회 반복하는데, 이 과정에서 박막 트랜지스터(TFT) 레이어에 균열이 생기거나 초미세 정전기 먼지 입자가 액정 셀에 박히면 신호 누출 또는 차단이 유발됩니다. 또한 OLED의 경우, 특정 서브픽셀의 유기 발광층 증착 두께 편차나 과부하로 발광 소자가 불량 상태로 고착되거나 조기에 파손되면서 불량이 발생하기도 합니다.</p>
    `
  },
  4: {
    title: "불량 화소 테스트 방법",
    badge: "가이드 04: 테스트 요령",
    icon: "fa-vial",
    content: `
      <p>가장 기본적이고 신뢰도 높은 검증 방식은 디스플레이를 가로막는 브라우저 창이나 OS 컨트롤러를 완전히 가린 상태에서 <strong>전체 화면 단색(Solid Color) 테스트</strong>를 수행하는 것입니다.</p>
      <ol>
        <li>어두운 검은색 단색을 띄워 밤하늘에 반짝이는 별처럼 상시 발광하는 <strong>휘점(Hot/Stuck Pixel)</strong>을 추적합니다.</li>
        <li>밝은 흰색 단색 화면으로 전환하여 흰 종이에 박힌 모래알처럼 빛이 통과하지 못해 어두컴컴한 <strong>암점(Dead Pixel)</strong>을 탐색합니다.</li>
        <li>적색(Red), 녹색(Green), 청색(Blue) 원색 화면을 하나씩 대조하여 특정 색상 서브픽셀의 점등 불량을 순차적으로 걸러냅니다.</li>
      </ol>
    `
  },
  5: {
    title: "정확한 검사를 위한 팁",
    badge: "가이드 05: 정밀 검사 팁",
    icon: "fa-lightbulb",
    content: `
      <p>단 한 개의 미세한 불량 화소도 남김없이 추적하기 위해 다음 수칙을 준비하십시오.</p>
      <ul>
        <li><strong>주변 조명 끄기</strong>: 방 안의 전등이나 스탠드를 모두 소등하여 모니터 빛 이외의 난반사를 완벽하게 배제합니다.</li>
        <li><strong>패널 청소</strong>: 검사 시작 전 모니터 표면의 정전기 먼지나 얼룩을 전용 극세사 천으로 깨끗이 닦아내어 불량 화소로 착각하는 혼동을 방지합니다.</li>
        <li><strong>시야각 수직 유지</strong>: TN이나 VA 패널 등 시야각 편차가 존재하는 디스플레이는 가장자리 영역을 비스듬히 보면 명암 왜곡이 일어납니다. 몸을 움직여 모니터 표면과 눈을 항상 수직으로 유지하여 검사하십시오.</li>
      </ul>
    `
  },
  6: {
    title: "제조사별 불량 화소 정책",
    badge: "가이드 06: 제조사별 정책",
    icon: "fa-building-shield",
    content: `
      <p>모니터 제품들은 판매 시 '무결점 보증' 모델과 '일반' 모델로 이원화되어 AS 교환 판정 기준이 달리 적용됩니다.</p>
      <ul>
        <li><strong>무결점(Zero Defect) 정책 제품</strong>: 휘점(Hot Pixel) 1개 이상 혹은 암점(Dead Pixel) 1~2개 발생 시 초기 불량으로 판정하여 즉시 새 제품 교환이나 패널 교체를 보증합니다. (대부분 구입 후 1개월 이내 기준)</li>
        <li><strong>일반/기본 정책 제품</strong>: ISO 13406-2 국제 표준 품질 등급을 차용합니다. 통상 휘점 3개 이상, 암점 5개 이상 또는 불량화소 간격이 인접해 밀집된 경우(예: 1cm 이내에 2개 이상)에 한하여 AS 무상 교환을 적용해 줍니다.</li>
      </ul>
    `
  },
  7: {
    title: "모니터 구매 시 체크리스트",
    badge: "가이드 07: 구매 체크리스트",
    icon: "fa-clipboard-list",
    content: `
      <p>새로운 디스플레이 장비를 수령했을 때 7일 이내에 반드시 테스트해야 할 필수 체크리스트 항목입니다.</p>
      <ul>
        <li><strong>무결점 스티커 부착 여부</strong>: 박스 패키지에 명시된 무결점 라벨 및 시리얼 번호가 오프라인/온라인 영수증과 일치하는지 확인합니다.</li>
        <li><strong>초기 불량화소 스캔</strong>: 본 도구를 이용해 수령 즉시 RGBW 및 그레이스케일을 가동하여 이상 유무를 점검합니다.</li>
        <li><strong>백라이트 빛샘 (Bleeding)</strong>: 완전한 암전 방 안에서 검은 화면을 띄운 뒤 테두리 모서리에서 백색 광원이 흘러나오는지 체크합니다.</li>
        <li><strong>가독성 및 서브픽셀 배열</strong>: 3서브픽셀 표준 배열(RGB)이 아닌 펜타일이나 BGR 배열의 경우 가독성에 글자 번짐이 있을 수 있으니 추가 확인이 권장됩니다.</li>
      </ul>
    `
  },
  8: {
    title: "교환/환불 완벽 가이드",
    badge: "가이드 08: 교환 및 환불",
    icon: "fa-file-shield",
    content: `
      <p>불량 화소가 발견되었을 때 교환/환불을 원활하게 받기 위한 권장 절차입니다.</p>
      <ol>
        <li><strong>증거 기록 확보</strong>: 발견된 불량 화소의 위치를 볼펜 끝 등으로 기리키거나 본 도구의 '좌표 기록 스크린샷'을 찍은 후, 스마트폰 카메라를 모니터에 가까이 대어 매크로(접사) 모드로 해당 소자가 꺼져 있거나 고착된 상태를 근접 촬영합니다.</li>
        <li><strong>판정서 발급 신청</strong>: 구입한 브랜드 서비스 센터에 접수하여 기사 방문 또는 입고 검사를 진행하고 '초기 불량 확인서(판정서)'를 수령합니다.</li>
        <li><strong>구매처 교환 접수</strong>: 판정서를 첨부하여 구매 쇼핑몰이나 대리점에 14일 이내로 교환/환불 청구서를 정식 접수합니다.</li>
      </ol>
    `
  },
  9: {
    title: "불량 화소 자가 복구 시도",
    badge: "가이드 09: 자가 복구 기술",
    icon: "fa-wrench",
    content: `
      <p>물리적인 단선이 일어난 데드 픽셀은 복구가 불가하나, 액정이 걸려 잠겨 버린 <strong>스턱 픽셀(Stuck Pixel)</strong>은 외부 자극으로 깨울 가능성이 존재합니다.</p>
      <ul>
        <li><strong>고주파 플리커링 브러시</strong>: 액정의 전기 신호를 60Hz 이상의 초고속 빈도로 껐다 켰다 반복하여 굳은 소자를 흔들어 줍니다. 본 도구의 <strong>'잔상 복구기'</strong> 옵션을 가동하여 15~30분간 작동시켜 보십시오.</li>
        <li><strong>물리 압박 요령 (주의 요망)</strong>: 모니터를 켠 상태에서 불량 화소 위치를 극세사 수건이나 터치 펜 끝에 천을 감싼 채 아주 가벼운 압력으로 문지르거나 가볍게 톡톡 쳐서 액정 배열의 고착 풀림을 유도합니다. (과한 압력 시 패널 파손 유발 주의)</li>
      </ul>
    `
  },
  10: {
    title: "불량 화소 예방법",
    badge: "가이드 10: 수명 관리 및 예방",
    icon: "fa-shield-halved",
    content: `
      <p>모니터 패널 소자의 조기 노화 및 고장을 방지하고 수명을 대폭 연장하기 위한 생활 예방법입니다.</p>
      <ul>
        <li><strong>밝기 최적화</strong>: 화면 밝기(Brightness)를 과도하게 높은 100% 한계치로 장시간 방치하면 액정 트랜지스터에 열화가 생깁니다. 실내 조도에 알맞은 50~70% 수준으로 조정하십시오.</li>
        <li><strong>절전 모드 및 화면 보호기</strong>: 동일한 정지 이미지(예: 윈도우 작업 표시줄)를 수십 시간 동안 켜두면 번인 및 고착 열화가 일어납니다. 10분 이상 공석 시 자동 대기모드가 가동되도록 OS 에너지를 제어하십시오.</li>
      </ul>
    `
  },
  11: {
    title: "기기별 특수 사항",
    badge: "가이드 11: 하드웨어별 특성",
    icon: "fa-microchip",
    content: `
      <p>패널 종류(LCD, OLED 등)에 따라 불량 화소의 메커니즘과 기준이 차이 납니다.</p>
      <ul>
        <li><strong>OLED (유기발광다이오드)</strong>: 각 소자가 스스로 빛을 내기 때문에 백라이트가 없습니다. 따라서 빛샘 현상(Bleeding)은 원천적으로 존재하지 않지만, 소자 수명 한계로 인한 번인(Burn-in)이나 열화에 따른 미세한 암점 발생 빈도가 LCD 대비 높을 수 있습니다.</li>
        <li><strong>IPS / VA / TN LCD</strong>: 액정 셔터를 열어 백라이트 빛을 차단하는 구조이므로 완벽한 암전이 어려워 미세한 빛샘이 존재합니다. 특히 IPS 패널은 시야각이 우수하지만 고질적인 모서리 빛샘 현상이 잦으므로 정밀 캘리브레이션 검사가 요구됩니다.</li>
      </ul>
    `
  },
  12: {
    title: "자주 묻는 질문 (FAQ)",
    badge: "가이드 12: 자주 묻는 질문",
    icon: "fa-circle-question",
    content: `
      <p><strong>Q. 새 모니터를 받았는데 검은 점이 하나 보입니다. 무조건 반품이 되나요?</strong><br>A. 구매 당시 '무결점 모델' 여부를 확인하십시오. 무결점 보증 모델은 대개 교환 가능하지만, 일반 모델은 제조사 보증 조건(예: 암점 5개 이상)을 넘겨야 반품 처리가 허용됩니다.</p>
      <p><strong>Q. 자가 복구 프로그램을 오래 켜두면 모니터에 해롭지 않나요?</strong><br>A. 잔상 복구용 고주파 플리커링은 액정 분자의 배열을 빠르게 가변하는 기법입니다. 30분 안팎의 단시간 구동은 안전하나, 수 시간 이상 과도하게 실행하면 패널 메인보드 칩셋에 무리가 가거나 발열이 생길 수 있으니 15~30분 주기 사용을 권장합니다.</p>
      <p><strong>Q. 가상 좌표 기록은 브라우저를 종료해도 저장되나요?</strong><br>A. 브라우저 내부 메모리에 임시 기록되므로, 탭을 닫거나 새로고침하면 로그가 소멸합니다. 종료하기 전에 반드시 JSON이나 CSV 버튼을 눌러 로컬 PC에 백업 파일을 내려받으십시오.</p>
    `
  }
};

// Colors Data Model (27 Colors total)
const COLORS_DATABASE = [
  // Basic Colors
  { hex: "#ffffff", name: "흰색 (White)", desc: "데드 픽셀 (검은 점) 및 어두운 먼지 고착 검출에 최적화된 백색 화면입니다." },
  { hex: "#000000", name: "검은색 (Black)", desc: "핫 픽셀 (밝은 점) 및 모니터 테두리의 백라이트 빛샘(Bleed)을 식별하는 검정 화면입니다." },
  { hex: "#ff0000", name: "빨간색 (Red)", desc: "R(적색) 서브픽셀의 점등 이상 및 고착 상태를 확인하는 원색 화면입니다." },
  { hex: "#00ff00", name: "초록색 (Green)", desc: "G(녹색) 서브픽셀의 감마 점등 및 비정상 발광을 측정하는 원색 화면입니다." },
  { hex: "#0000ff", name: "파란색 (Blue)", desc: "B(청색) 서브픽셀의 이상 작동 여부를 판별하는 원색 화면입니다." },
  { hex: "#00ffff", name: "시안색 (Cyan)", desc: "녹색과 파란색이 결합된 합성 혼합색으로 보조 서브픽셀 체크를 돕습니다." },
  { hex: "#ff00ff", name: "마젠타색 (Magenta)", desc: "빨간색과 파란색이 합성된 유채색으로 서브픽셀 오결선 결함을 탐지합니다." },
  { hex: "#ffff00", name: "노란색 (Yellow)", desc: "빨간색과 녹색이 조합된 색상으로 다색 융합 발광 결함을 잡아냅니다." },
  
  // Grey Scales
  { hex: "#1a1a1a", name: "회색 10% (Gray 10%)", desc: "매우 어두운 회색으로 블랙 균일도 및 암전 계조 노이즈 상태를 진단합니다." },
  { hex: "#404040", name: "회색 25% (Gray 25%)", desc: "어두운 회색 화면으로 VA/IPS 패널의 디테일 표현력 및 암점 균일도를 진단합니다." },
  { hex: "#808080", name: "회색 50% (Gray 50%)", desc: "표준 18% 반사율에 준하는 중간 회색 화면으로 모니터의 전체적인 밝기 균일성을 식별합니다." },
  { hex: "#bfbfbf", name: "회색 75% (Gray 75%)", desc: "밝은 회색 화면으로 전체 영역의 백라이트 광량 불균형과 얼룩(DSE)을 검출합니다." },
  { hex: "#e5e5e5", name: "회색 90% (Gray 90%)", desc: "매우 밝은 회색 화면으로 완전 백색 직전의 미세한 휘도 불균일도를 스캔합니다." },
  
  // Extra colors
  { hex: "#ff5722", name: "오렌지색 (Orange)", desc: "보조 테스트용 강렬한 주황색 화면입니다." },
  { hex: "#e91e63", name: "핑크색 (Deep Pink)", desc: "서브픽셀 결함 추적용 분홍색 화면입니다." },
  { hex: "#9c27b0", name: "보라색 (Purple)", desc: "보라색 영역의 크로스토크 결함 검출용 화면입니다." },
  { hex: "#009688", name: "에메랄드색 (Teal)", desc: "청록색 계열 스냅 테스트용 에메랄드 화면입니다." },
  { hex: "#8bc34a", name: "연두색 (Light Green)", desc: "녹색 서브 픽셀 보조 테스트용 연두색 화면입니다." }
];

// Gradients Database
const GRADIENTS_DATABASE = [
  { id: "grad-h-rgb", name: "수평 RGB 그라데이션", desc: "가로 방향 빨강-초록-파랑 색상 변환을 통해 디스플레이 선형 표현력을 테스트합니다." },
  { id: "grad-v-rgb", name: "수직 RGB 그라데이션", desc: "세로 방향 빨강-초록-파랑 계조 변환을 통해 세로 채널 밴딩 현상을 확인합니다." },
  { id: "grad-h-bw", name: "수평 흑백 그라데이션", desc: "가로 방향 검정에서 흰색으로 이어지는 계조(Grayscale) 표현 단계의 매끄러움을 검사합니다." },
  { id: "grad-v-bw", name: "수직 흑백 그라데이션", desc: "세로 방향 검정에서 흰색으로 이어지는 밝기 그라디언트를 검사합니다." }
];

// Patterns Database
const PATTERNS_DATABASE = [
  { id: "pat-grid", name: "격자 패턴 (Grid)", desc: "모니터의 기하학적 왜곡, 초점 및 가로/세로 정렬 상태를 체크하는 격자선 패턴입니다." },
  { id: "pat-chess", name: "바둑판 패턴 (Chessboard)", desc: "인접 픽셀간의 최대 대비 명암 표현력(명암비) 및 고주파 디테일을 판별합니다." },
  { id: "pat-stripe-v", name: "세로 1px 스트라이프", desc: "세로 방향 1픽셀 간격의 흑백 반복 패턴으로 모니터 샤프니스 및 가독성을 진단합니다." },
  { id: "pat-stripe-h", name: "가로 1px 스트라이프", desc: "가로 방향 1픽셀 간격의 흑백 줄무늬 패턴으로 서브픽셀 렌더링 품질을 체크합니다." },
  { id: "pat-dots", name: "도트 매트릭스 (Dots)", desc: "격자 형태로 정렬된 1px 점들을 통해 화면 전반의 픽셀 매핑 상태를 검사합니다." },
  { id: "pat-bars", name: "컬러바 (Color Bars)", desc: "방송 표준 8대 기본 컬러 바를 렌더링하여 모니터 색 분해능을 점검합니다." },
  { id: "pat-focus", name: "빛샘 측정 가이드", desc: "외곽 안내선 및 대각 크로스라인으로 화면 끝부분 백라이트 누출(Bleed)을 추적합니다." }
];

// Global State
let activeTab = "color"; // "color", "pattern", "tool"
let activeTestMode = "color"; // "color", "pattern", "tool"
let currentColorIndex = 0;
let currentPatternIndex = 0;
let customColors = [];
let badPixelsLog = []; // Array of objects: { x, y, size: 4, color, type: 'bad' }
let autoscanIntervalId = null;
let repairerIntervalId = null;
let selectedMonitorSize = 27.0;

// Repair configuration
let repairTimer = null;

// DOM Elements
const testScreenCanvas = document.getElementById("test-screen-canvas");
const ctx = testScreenCanvas.getContext("2d");
const testScreenWrapper = document.getElementById("test-screen-wrapper");

const tabButtons = document.querySelectorAll(".btn-control-tab");
const tabContents = document.querySelectorAll(".option-tab-content");

const statusPreviewBox = document.getElementById("status-preview-box");
const lblActiveName = document.getElementById("lbl-active-name");
const lblActiveIndex = document.getElementById("lbl-active-index");
const lblActiveDesc = document.getElementById("lbl-active-desc");

// Grid containers
const basicColorsGrid = document.getElementById("basic-colors-grid");
const grayColorsGrid = document.getElementById("gray-colors-grid");
const gradientsGrid = document.getElementById("gradients-grid");
const customColorsGrid = document.getElementById("custom-colors-grid");
const patternsGrid = document.getElementById("patterns-grid");

// Inputs/buttons
const customColorPicker = document.getElementById("custom-color-picker");
const btnAddCustomColor = document.getElementById("btn-add-custom-color");
const btnPrevColor = document.getElementById("btn-prev-color");
const btnNextColor = document.getElementById("btn-next-color");
const btnPrevPattern = document.getElementById("btn-prev-pattern");
const btnNextPattern = document.getElementById("btn-next-pattern");

const btnToggleRepairer = document.getElementById("btn-toggle-repairer");
const repairModeSelect = document.getElementById("repair-mode-select");
const btnRunBleed = document.getElementById("btn-run-bleed");

const btnRunFullscreen = document.getElementById("btn-run-fullscreen");
const btnLogUndetermined = document.getElementById("btn-log-undetermined");
const btnLogBad = document.getElementById("btn-log-bad");
const btnToggleGuide = document.getElementById("btn-toggle-guide");
const btnResetSession = document.getElementById("btn-reset-session");

const btnStartAutoscan = document.getElementById("btn-start-autoscan");
const lblScanBtn = document.getElementById("lbl-scan-btn");

// Specifications UI
const specResolution = document.getElementById("spec-resolution");
const specDpr = document.getElementById("spec-dpr");
const specRatio = document.getElementById("spec-ratio");
const specPpi = document.getElementById("spec-ppi");

const inputMonitorInch = document.getElementById("input-monitor-inch");
const sliderMonitorInch = document.getElementById("slider-monitor-inch");

// Reports
const btnExportJson = document.getElementById("btn-export-json");
const btnExportCsv = document.getElementById("btn-export-csv");
const btnCaptureScreenshot = document.getElementById("btn-capture-screenshot");

const fsOverlay = document.getElementById("fs-overlay");

// Footers
const footerLblColor = document.getElementById("footer-lbl-color");
const footerLblPattern = document.getElementById("footer-lbl-pattern");
const footerLblBadpixels = document.getElementById("footer-lbl-badpixels");
const lblBadpixelCount = document.getElementById("lbl-badpixel-count");

// TOC DOM
const explanationBoardContent = document.getElementById("explanation-board-content");
const explanationTitleBadge = document.getElementById("explanation-title-badge");
const explanationDisplayTitle = document.getElementById("explanation-display-title");
const explanationDisplayText = document.getElementById("explanation-display-text");
const tocListItems = document.querySelectorAll(".explanation-index-list li");

// Bootstrap
function init() {
  setupUIColorsAndPatterns();
  setupEventListeners();
  detectSpecs();
  
  // Set default state
  switchTab("color");
  switchTOCArticle(1);
  
  // Handle initial resize
  resizeCanvas();
  
  // Periodically check if wrapper size changes
  window.addEventListener("resize", () => {
    detectSpecs();
    resizeCanvas();
  });
}

// Draw grids of choices
function setupUIColorsAndPatterns() {
  // Basic colors
  basicColorsGrid.innerHTML = "";
  COLORS_DATABASE.slice(0, 8).forEach((color, idx) => {
    const btn = document.createElement("button");
    btn.className = "color-btn";
    btn.style.backgroundColor = color.hex;
    btn.title = color.name;
    btn.setAttribute("data-index", idx);
    btn.addEventListener("click", () => {
      currentColorIndex = idx;
      activeTestMode = "color";
      drawCurrentScreen();
    });
    basicColorsGrid.appendChild(btn);
  });

  // Gray scales
  grayColorsGrid.innerHTML = "";
  COLORS_DATABASE.slice(8, 13).forEach((color, idx) => {
    const dbIndex = idx + 8;
    const btn = document.createElement("button");
    btn.className = "color-btn";
    btn.style.backgroundColor = color.hex;
    btn.title = color.name;
    btn.setAttribute("data-index", dbIndex);
    btn.addEventListener("click", () => {
      currentColorIndex = dbIndex;
      activeTestMode = "color";
      drawCurrentScreen();
    });
    grayColorsGrid.appendChild(btn);
  });

  // Extra Colors
  COLORS_DATABASE.slice(13).forEach((color, idx) => {
    const dbIndex = idx + 13;
    const btn = document.createElement("button");
    btn.className = "color-btn";
    btn.style.backgroundColor = color.hex;
    btn.title = color.name;
    btn.setAttribute("data-index", dbIndex);
    btn.addEventListener("click", () => {
      currentColorIndex = dbIndex;
      activeTestMode = "color";
      drawCurrentScreen();
    });
    grayColorsGrid.appendChild(btn); // group together in layout
  });

  // Gradients
  gradientsGrid.innerHTML = "";
  GRADIENTS_DATABASE.forEach((grad, idx) => {
    const dbIndex = idx + COLORS_DATABASE.length; // gradients start after static colors
    const btn = document.createElement("button");
    btn.className = "gradient-btn";
    btn.title = grad.name;
    
    // Set typical gradient background preview
    if (grad.id === "grad-h-rgb") {
      btn.style.background = "linear-gradient(90deg, #ff0000, #00ff00, #0000ff)";
    } else if (grad.id === "grad-v-rgb") {
      btn.style.background = "linear-gradient(180deg, #ff0000, #00ff00, #0000ff)";
    } else if (grad.id === "grad-h-bw") {
      btn.style.background = "linear-gradient(90deg, #000000, #ffffff)";
    } else if (grad.id === "grad-v-bw") {
      btn.style.background = "linear-gradient(180deg, #000000, #ffffff)";
    }
    
    btn.addEventListener("click", () => {
      currentColorIndex = dbIndex;
      activeTestMode = "color";
      drawCurrentScreen();
    });
    gradientsGrid.appendChild(btn);
  });

  // Patterns
  patternsGrid.innerHTML = "";
  PATTERNS_DATABASE.forEach((pat, idx) => {
    const btn = document.createElement("button");
    btn.className = "pattern-btn";
    btn.setAttribute("data-index", idx);
    
    let iconClass = "fa-square";
    if (pat.id === "pat-grid") iconClass = "fa-border-all";
    else if (pat.id === "pat-chess") iconClass = "fa-table-cells";
    else if (pat.id === "pat-stripe-v") iconClass = "fa-align-justify"; // rotated in css
    else if (pat.id === "pat-stripe-h") iconClass = "fa-align-justify";
    else if (pat.id === "pat-dots") iconClass = "fa-braille";
    else if (pat.id === "pat-bars") iconClass = "fa-chart-simple";
    else if (pat.id === "pat-focus") iconClass = "fa-crop-simple";

    btn.innerHTML = `
      <i class="fa-solid ${iconClass}" style="font-size: 1.25rem;"></i>
      <span>${pat.name}</span>
    `;
    btn.addEventListener("click", () => {
      currentPatternIndex = idx;
      activeTestMode = "pattern";
      drawCurrentScreen();
    });
    patternsGrid.appendChild(btn);
  });
}

function setupEventListeners() {
  // Tabs Navigation
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      switchTab(tabId);
    });
  });

  // Navigation handlers
  btnPrevColor.addEventListener("click", () => navigateSelection(-1, "color"));
  btnNextColor.addEventListener("click", () => navigateSelection(1, "color"));
  btnPrevPattern.addEventListener("click", () => navigateSelection(-1, "pattern"));
  btnNextPattern.addEventListener("click", () => navigateSelection(1, "pattern"));

  // Custom Color Picker & Adding
  btnAddCustomColor.addEventListener("click", () => {
    const hex = customColorPicker.value;
    addCustomColor(hex);
  });

  // Size Inches Slider
  inputMonitorInch.addEventListener("input", (e) => {
    sliderMonitorInch.value = e.target.value;
    detectSpecs();
  });
  sliderMonitorInch.addEventListener("input", (e) => {
    inputMonitorInch.value = e.target.value;
    detectSpecs();
  });

  // Canvas Action controls
  btnRunFullscreen.addEventListener("click", () => toggleFullscreen(true));
  btnResetSession.addEventListener("click", () => resetSession());
  btnToggleGuide.addEventListener("click", () => {
    window.scrollTo({
      top: document.getElementById("guide-section").offsetTop - 100,
      behavior: "smooth"
    });
  });

  // Logger actions
  btnLogBad.addEventListener("click", () => addLastBadPixel());
  btnLogUndetermined.addEventListener("click", () => removeLastBadPixel());

  btnExportJson.addEventListener("click", () => exportLogFile("json"));
  btnExportCsv.addEventListener("click", () => exportLogFile("csv"));
  btnCaptureScreenshot.addEventListener("click", () => captureScreenshotReport());

  // Autoscan Slideshow
  btnStartAutoscan.addEventListener("click", () => toggleAutoscan());

  // Tools Option
  btnToggleRepairer.addEventListener("click", () => toggleRepairer());
  btnRunBleed.addEventListener("click", () => runBleedMode());

  // Canvas events
  testScreenCanvas.addEventListener("click", (e) => {
    // Left-click registers coordinates
    handleCanvasClick(e);
  });

  testScreenCanvas.addEventListener("dblclick", () => {
    // Double click toggles fullscreen
    toggleFullscreen();
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    handleKeyboardInput(e);
  });

  // Handle Fullscreen Event Changes
  document.addEventListener("fullscreenchange", () => {
    onFullscreenStateChange();
  });
  document.addEventListener("webkitfullscreenchange", () => {
    onFullscreenStateChange();
  });

  // Floating scroll top/bottom
  document.getElementById("btn-scroll-top").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.getElementById("btn-scroll-bottom").addEventListener("click", () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  });

  // TOC
  tocListItems.forEach((li) => {
    li.addEventListener("click", () => {
      tocListItems.forEach(item => item.classList.remove("active"));
      li.classList.add("active");
      const idx = parseInt(li.getAttribute("data-index"), 10);
      switchTOCArticle(idx);
    });
  });
}

// Detect screen specs
function detectSpecs() {
  const dpr = window.devicePixelRatio || 1.0;
  
  // Screen specifications
  const physicalWidth = Math.round(window.screen.width * dpr);
  const physicalHeight = Math.round(window.screen.height * dpr);
  
  // Set labels
  specResolution.innerHTML = `<i class="fa-solid fa-crop"></i> ${physicalWidth} x ${physicalHeight}`;
  specDpr.innerHTML = `<i class="fa-solid fa-display"></i> DPR: ${dpr.toFixed(1)}`;
  
  // Aspect Ratio
  const ratioStr = getAspectRatio(physicalWidth, physicalHeight);
  specRatio.innerHTML = `<i class="fa-solid fa-arrows-left-right"></i> ${ratioStr}`;
  
  // PPI Calculator
  selectedMonitorSize = parseFloat(inputMonitorInch.value) || 27.0;
  const diagonalPx = Math.sqrt(physicalWidth * physicalWidth + physicalHeight * physicalHeight);
  const ppi = diagonalPx / selectedMonitorSize;
  specPpi.innerHTML = `<i class="fa-solid fa-calculator"></i> ~${Math.round(ppi)} PPI`;
}

function getAspectRatio(w, h) {
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const divisor = gcd(w, h);
  const rx = w / divisor;
  const ry = h / divisor;
  
  // normalize typical ratios
  if (rx === 8 && ry === 5) return "16:10";
  if (rx === 16 && ry === 9) return "16:9";
  if (rx === 4 && ry === 3) return "4:3";
  if (rx === 21 && ry === 9) return "21:9";
  if (rx === 32 && ry === 9) return "32:9";
  
  return `${rx}:${ry}`;
}

// Tabs
function switchTab(tabId) {
  activeTab = tabId;
  
  tabButtons.forEach(btn => {
    if (btn.getAttribute("data-tab") === tabId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  tabContents.forEach(content => {
    if (content.id === `tab-${tabId}-options`) {
      content.classList.add("active-content");
    } else {
      content.classList.remove("active-content");
    }
  });

  // Pause active scanners if switching tab
  if (autoscanIntervalId) toggleAutoscan(false);
  if (repairerIntervalId) toggleRepairer(false);

  // Switch test screen mode
  if (tabId === "color") {
    activeTestMode = "color";
  } else if (tabId === "pattern") {
    activeTestMode = "pattern";
  } else if (tabId === "tool") {
    activeTestMode = "tool";
  }
  
  drawCurrentScreen();
}

// Add Custom Color
function addCustomColor(hex) {
  // Avoid duplication
  if (customColors.includes(hex)) return;
  
  customColors.push(hex);
  
  // Render custom colors container
  customColorsGrid.style.display = "grid";
  customColorsGrid.innerHTML = "";
  
  customColors.forEach((color, idx) => {
    const btn = document.createElement("button");
    btn.className = "color-btn";
    btn.style.backgroundColor = color;
    btn.title = `Custom Color (${color})`;
    
    // Gradients database start index
    const dbIndex = COLORS_DATABASE.length + GRADIENTS_DATABASE.length + idx;
    
    btn.addEventListener("click", () => {
      // Pick custom color
      currentColorIndex = dbIndex;
      activeTestMode = "color";
      drawCurrentScreen();
    });
    
    customColorsGrid.appendChild(btn);
  });

  // Set active custom color
  currentColorIndex = COLORS_DATABASE.length + GRADIENTS_DATABASE.length + customColors.length - 1;
  activeTestMode = "color";
  drawCurrentScreen();
}

// Navigate selections
function navigateSelection(dir, type) {
  if (type === "color") {
    const totalColorsCount = COLORS_DATABASE.length + GRADIENTS_DATABASE.length + customColors.length;
    currentColorIndex = (currentColorIndex + dir + totalColorsCount) % totalColorsCount;
    activeTestMode = "color";
  } else if (type === "pattern") {
    currentPatternIndex = (currentPatternIndex + dir + PATTERNS_DATABASE.length) % PATTERNS_DATABASE.length;
    activeTestMode = "pattern";
  }
  
  // Stop repair if navigating
  if (repairerIntervalId) toggleRepairer(false);
  
  drawCurrentScreen();
}

// Canvas click logger coordinates
function handleCanvasClick(e) {
  // If repairer is playing, bypass log
  if (repairerIntervalId) return;

  const rect = testScreenCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1.0;
  
  // Calculate relative coordinates matching the canvas resolution
  const scaleX = testScreenCanvas.width / rect.width;
  const scaleY = testScreenCanvas.height / rect.height;
  
  const mouseX = Math.round((e.clientX - rect.left) * scaleX);
  const mouseY = Math.round((e.clientY - rect.top) * scaleY);
  
  // Determine current active item name
  let activeName = "Unknown";
  if (activeTestMode === "color") {
    activeName = getActiveColorObject().name;
  } else if (activeTestMode === "pattern") {
    activeName = PATTERNS_DATABASE[currentPatternIndex].name;
  }
  
  // Register bad pixel
  const badPixel = {
    x: mouseX,
    y: mouseY,
    canvasW: testScreenCanvas.width,
    canvasH: testScreenCanvas.height,
    screenW: window.screen.width * dpr,
    screenH: window.screen.height * dpr,
    activeName: activeName,
    testMode: activeTestMode,
    timestamp: new Date().toLocaleTimeString()
  };
  
  badPixelsLog.push(badPixel);
  
  // Draw marker ripple feedback
  drawRippleFeedback(mouseX, mouseY);
  
  // Sync UI reports buttons
  updateReportsButtons();
  
  // Play short blink indicator
  drawCurrentScreen();
}

// Draw click feedback ripple on canvas
function drawRippleFeedback(x, y) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, 2 * Math.PI);
  ctx.strokeStyle = "#ff0000";
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, 2 * Math.PI);
  ctx.fillStyle = "#ff0000";
  ctx.fill();
  ctx.restore();
  
  setTimeout(() => {
    drawCurrentScreen();
  }, 150);
}

// Add manually registered last bad pixel
function addLastBadPixel() {
  if (badPixelsLog.length === 0) {
    alert("화면 검사 캔버스를 클릭하여 불량화소 지점을 지정한 후 클릭하십시오.");
    return;
  }
  alert(`가장 최근 기록된 불량 화소 좌표: [X: ${badPixelsLog[badPixelsLog.length-1].x}, Y: ${badPixelsLog[badPixelsLog.length-1].y}]`);
}

// Remove last bad pixel log
function removeLastBadPixel() {
  if (badPixelsLog.length > 0) {
    badPixelsLog.pop();
    updateReportsButtons();
    drawCurrentScreen();
  }
}

// Sync downloads buttons
function updateReportsButtons() {
  const count = badPixelsLog.length;
  
  if (count > 0) {
    btnExportJson.disabled = false;
    btnExportCsv.disabled = false;
    footerLblBadpixels.style.display = "inline-block";
    lblBadpixelCount.textContent = count;
  } else {
    btnExportJson.disabled = true;
    btnExportCsv.disabled = true;
    footerLblBadpixels.style.display = "none";
  }
}

// Resets
function resetSession() {
  badPixelsLog = [];
  updateReportsButtons();
  
  // Stop scan
  if (autoscanIntervalId) toggleAutoscan(false);
  if (repairerIntervalId) toggleRepairer(false);
  
  currentColorIndex = 0;
  currentPatternIndex = 0;
  activeTestMode = "color";
  switchTab("color");
  drawCurrentScreen();
  
  alert("테스트 세션 및 불량화소 로그가 초기화되었습니다.");
}

// Get active color info
function getActiveColorObject() {
  const dbLen = COLORS_DATABASE.length;
  const gradLen = GRADIENTS_DATABASE.length;
  
  if (currentColorIndex < dbLen) {
    return COLORS_DATABASE[currentColorIndex];
  } else if (currentColorIndex < dbLen + gradLen) {
    const idx = currentColorIndex - dbLen;
    return {
      hex: "gradient",
      name: GRADIENTS_DATABASE[idx].name,
      desc: GRADIENTS_DATABASE[idx].desc,
      id: GRADIENTS_DATABASE[idx].id
    };
  } else {
    const idx = currentColorIndex - dbLen - gradLen;
    return {
      hex: customColors[idx],
      name: `사용자 정의 색상 (${customColors[idx]})`,
      desc: "직접 지정한 커스텀 컬러 테스트 화면입니다."
    };
  }
}

// Draw Canvas main entry
function drawCurrentScreen() {
  if (repairerIntervalId) return; // let repair engine handle rendering loop
  
  // Clear
  ctx.clearRect(0, 0, testScreenCanvas.width, testScreenCanvas.height);
  
  if (activeTestMode === "color") {
    drawColorsScreen();
  } else if (activeTestMode === "pattern") {
    drawPatternsScreen();
  }
  
  // Draw marked bad pixel indicator points
  drawBadPixelMarkers();
  
  // Update status info cards
  updateStatusLabels();
}

function updateStatusLabels() {
  const isColor = activeTestMode === "color";
  
  if (isColor) {
    const colObj = getActiveColorObject();
    if (colObj.hex === "gradient") {
      statusPreviewBox.style.background = getGradientCSSBackground(colObj.id);
    } else {
      statusPreviewBox.style.background = colObj.hex;
    }
    
    lblActiveName.textContent = colObj.name;
    
    const totalColorsCount = COLORS_DATABASE.length + GRADIENTS_DATABASE.length + customColors.length;
    lblActiveIndex.textContent = `색상 ${currentColorIndex + 1} / ${totalColorsCount}`;
    lblActiveDesc.textContent = colObj.desc;
    
    footerLblColor.textContent = `색상: ${currentColorIndex + 1} / ${totalColorsCount}`;
    footerLblPattern.textContent = `패턴: 0 / ${PATTERNS_DATABASE.length}`;
  } else {
    const patObj = PATTERNS_DATABASE[currentPatternIndex];
    statusPreviewBox.style.background = "repeating-conic-gradient(#3f3f3f 0% 25%, #2a2a2a 0% 50%) 50% / 10px 10px";
    
    lblActiveName.textContent = patObj.name;
    lblActiveIndex.textContent = `패턴 ${currentPatternIndex + 1} / ${PATTERNS_DATABASE.length}`;
    lblActiveDesc.textContent = patObj.desc;
    
    footerLblColor.textContent = `색상: 0 / ${COLORS_DATABASE.length + GRADIENTS_DATABASE.length + customColors.length}`;
    footerLblPattern.textContent = `패턴: ${currentPatternIndex + 1} / ${PATTERNS_DATABASE.length}`;
  }

  // Active styles in grids
  document.querySelectorAll(".color-btn, .gradient-btn, .pattern-btn").forEach(el => el.classList.remove("active"));
  
  if (isColor) {
    const dbLen = COLORS_DATABASE.length;
    const gradLen = GRADIENTS_DATABASE.length;
    
    if (currentColorIndex < dbLen) {
      const activeBtn = basicColorsGrid.querySelector(`.color-btn[data-index='${currentColorIndex}']`) || 
                        grayColorsGrid.querySelector(`.color-btn[data-index='${currentColorIndex}']`);
      if (activeBtn) activeBtn.classList.add("active");
    } else if (currentColorIndex < dbLen + gradLen) {
      const idx = currentColorIndex - dbLen;
      const activeBtn = gradientsGrid.children[idx];
      if (activeBtn) activeBtn.classList.add("active");
    } else {
      const idx = currentColorIndex - dbLen - gradLen;
      const activeBtn = customColorsGrid.children[idx];
      if (activeBtn) activeBtn.classList.add("active");
    }
  } else {
    const activeBtn = patternsGrid.querySelector(`.pattern-btn[data-index='${currentPatternIndex}']`);
    if (activeBtn) activeBtn.classList.add("active");
  }
}

function getGradientCSSBackground(id) {
  if (id === "grad-h-rgb") return "linear-gradient(90deg, #ff0000, #00ff00, #0000ff)";
  if (id === "grad-v-rgb") return "linear-gradient(180deg, #ff0000, #00ff00, #0000ff)";
  if (id === "grad-h-bw") return "linear-gradient(90deg, #000000, #ffffff)";
  if (id === "grad-v-bw") return "linear-gradient(180deg, #000000, #ffffff)";
  return "#000";
}

// -------------------------------------------------------------
// Render Colors Mode
// -------------------------------------------------------------
function drawColorsScreen() {
  const colObj = getActiveColorObject();
  
  if (colObj.hex === "gradient") {
    // Draw canvas gradient
    const gradId = colObj.id;
    let grad;
    
    if (gradId === "grad-h-rgb") {
      grad = ctx.createLinearGradient(0, 0, testScreenCanvas.width, 0);
      grad.addColorStop(0, '#ff0000');
      grad.addColorStop(0.17, '#ffff00');
      grad.addColorStop(0.33, '#00ff00');
      grad.addColorStop(0.5, '#00ffff');
      grad.addColorStop(0.67, '#0000ff');
      grad.addColorStop(0.83, '#ff00ff');
      grad.addColorStop(1, '#ff0000');
    } else if (gradId === "grad-v-rgb") {
      grad = ctx.createLinearGradient(0, 0, 0, testScreenCanvas.height);
      grad.addColorStop(0, '#ff0000');
      grad.addColorStop(0.17, '#ffff00');
      grad.addColorStop(0.33, '#00ff00');
      grad.addColorStop(0.5, '#00ffff');
      grad.addColorStop(0.67, '#0000ff');
      grad.addColorStop(0.83, '#ff00ff');
      grad.addColorStop(1, '#ff0000');
    } else if (gradId === "grad-h-bw") {
      grad = ctx.createLinearGradient(0, 0, testScreenCanvas.width, 0);
      grad.addColorStop(0, '#000000');
      grad.addColorStop(1, '#ffffff');
    } else if (gradId === "grad-v-bw") {
      grad = ctx.createLinearGradient(0, 0, 0, testScreenCanvas.height);
      grad.addColorStop(0, '#000000');
      grad.addColorStop(1, '#ffffff');
    }
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, testScreenCanvas.width, testScreenCanvas.height);
  } else {
    ctx.fillStyle = colObj.hex;
    ctx.fillRect(0, 0, testScreenCanvas.width, testScreenCanvas.height);
  }
}

// -------------------------------------------------------------
// Render Patterns Mode
// -------------------------------------------------------------
function drawPatternsScreen() {
  const pat = PATTERNS_DATABASE[currentPatternIndex];
  const w = testScreenCanvas.width;
  const h = testScreenCanvas.height;
  
  if (pat.id === "pat-grid") {
    // 50px Grid layout
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    const gap = 50;
    
    for (let x = 0; x < w; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  } 
  
  else if (pat.id === "pat-chess") {
    // 32px chessboard cells
    const size = 32;
    for (let y = 0; y < h; y += size) {
      for (let x = 0; x < w; x += size) {
        ctx.fillStyle = ((Math.floor(x / size) + Math.floor(y / size)) % 2 === 0) ? '#ffffff' : '#000000';
        ctx.fillRect(x, y, size, size);
      }
    }
  } 
  
  else if (pat.id === "pat-stripe-v") {
    // Vertical 1px Stripes
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    for (let x = 0; x < w; x += 2) {
      ctx.fillRect(x, 0, 1, h);
    }
  } 
  
  else if (pat.id === "pat-stripe-h") {
    // Horizontal 1px Stripes
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    for (let y = 0; y < h; y += 2) {
      ctx.fillRect(0, y, w, 1);
    }
  } 
  
  else if (pat.id === "pat-dots") {
    // 1px Dots Matrix
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    const gap = 16;
    for (let y = 8; y < h; y += gap) {
      for (let x = 8; x < w; x += gap) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  } 
  
  else if (pat.id === "pat-bars") {
    // 8 Color Bars standard alignment
    const barColors = ['#ffffff', '#ffff00', '#00ffff', '#00ff00', '#ff00ff', '#ff0000', '#0000ff', '#000000'];
    const barW = w / barColors.length;
    for (let i = 0; i < barColors.length; i++) {
      ctx.fillStyle = barColors[i];
      ctx.fillRect(i * barW, 0, barW, h);
    }
  } 
  
  else if (pat.id === "pat-focus") {
    // Bleed / Guide focus
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);
    
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    // Outer border guide lines
    ctx.strokeRect(10, 10, w - 20, h - 20);
    
    // Faint diagonal guides
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(w, h);
    ctx.moveTo(w, 0); ctx.lineTo(0, h);
    ctx.stroke();
    
    // Crosshair target center
    ctx.strokeStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(w/2, h/2, 40, 0, 2*Math.PI);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(w/2 - 60, h/2); ctx.lineTo(w/2 + 60, h/2);
    ctx.moveTo(w/2, h/2 - 60); ctx.lineTo(w/2, h/2 + 60);
    ctx.stroke();
  }
}

// Draw bad pixel markers
function drawBadPixelMarkers() {
  if (badPixelsLog.length === 0) return;
  
  badPixelsLog.forEach((pixel, idx) => {
    ctx.save();
    
    // Pulsing indicator effect
    const pulseRadius = 6 + Math.abs(Math.sin(Date.now() / 200)) * 4;
    
    ctx.beginPath();
    ctx.arc(pixel.x, pixel.y, pulseRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(pixel.x, pixel.y, 2, 0, 2 * Math.PI);
    ctx.fillStyle = "#ef4444";
    ctx.fill();
    
    // Annotation tag
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(pixel.x + 10, pixel.y - 12, 110, 18);
    ctx.strokeStyle = "#ef4444";
    ctx.strokeRect(pixel.x + 10, pixel.y - 12, 110, 18);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "9px monospace";
    ctx.fillText(`#${idx+1} [${pixel.x},${pixel.y}]`, pixel.x + 15, pixel.y);
    
    ctx.restore();
  });
}

// -------------------------------------------------------------
// Interactive Fullscreen Controls
// -------------------------------------------------------------
function toggleFullscreen(forceOn = false) {
  const isFullscreen = !!document.fullscreenElement;
  
  if (forceOn || !isFullscreen) {
    if (testScreenWrapper.requestFullscreen) {
      testScreenWrapper.requestFullscreen();
    } else if (testScreenWrapper.webkitRequestFullscreen) {
      testScreenWrapper.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

function onFullscreenStateChange() {
  const isFullscreen = !!document.fullscreenElement;
  
  if (isFullscreen) {
    fsOverlay.style.display = "block";
    
    // Hide overlay after 3 seconds so screen is clean
    setTimeout(() => {
      fsOverlay.style.opacity = "0";
      setTimeout(() => {
        fsOverlay.style.display = "none";
        fsOverlay.style.opacity = "1";
      }, 1000);
    }, 3000);
  } else {
    fsOverlay.style.display = "none";
  }
  
  detectSpecs();
  resizeCanvas();
}

function resizeCanvas() {
  const isFullscreen = !!document.fullscreenElement;
  let targetWidth, targetHeight;
  
  if (isFullscreen) {
    // Physical monitor screen dimensions
    const dpr = window.devicePixelRatio || 1.0;
    targetWidth = Math.round(window.screen.width * dpr);
    targetHeight = Math.round(window.screen.height * dpr);
  } else {
    // Bounding parent rect
    const dpr = window.devicePixelRatio || 1.0;
    const rect = testScreenWrapper.getBoundingClientRect();
    targetWidth = Math.round(rect.width * dpr);
    targetHeight = Math.round(rect.height * dpr);
  }
  
  if (testScreenCanvas.width !== targetWidth || testScreenCanvas.height !== targetHeight) {
    testScreenCanvas.width = targetWidth;
    testScreenCanvas.height = targetHeight;
  }
  
  drawCurrentScreen();
}

// -------------------------------------------------------------
// Auto Scan Slideshow Slides
// -------------------------------------------------------------
function toggleAutoscan(force = null) {
  const isRunning = autoscanIntervalId !== null;
  const shouldRun = force !== null ? force : !isRunning;
  
  if (shouldRun) {
    // Start scan loop
    if (autoscanIntervalId) clearInterval(autoscanIntervalId);
    
    // Disable other loops
    if (repairerIntervalId) toggleRepairer(false);
    
    btnStartAutoscan.classList.remove("btn-success");
    btnStartAutoscan.classList.add("btn-danger");
    lblScanBtn.textContent = "슬라이드 일시정지";
    
    autoscanIntervalId = setInterval(() => {
      if (activeTestMode === "color") {
        navigateSelection(1, "color");
      } else {
        navigateSelection(1, "pattern");
      }
    }, 2000); // 2s cycle
  } else {
    // Stop loop
    if (autoscanIntervalId) {
      clearInterval(autoscanIntervalId);
      autoscanIntervalId = null;
    }
    
    btnStartAutoscan.classList.remove("btn-danger");
    btnStartAutoscan.classList.add("btn-success");
    lblScanBtn.textContent = "새 세션 시작";
  }
}

// -------------------------------------------------------------
// Pixel Repairer High Frequency Engine
// -------------------------------------------------------------
let repairFrameId = null;
let repairColorToggle = false;

function toggleRepairer(force = null) {
  const isRunning = repairerIntervalId !== null;
  const shouldRun = force !== null ? force : !isRunning;
  
  if (shouldRun) {
    if (repairerIntervalId) clearInterval(repairerIntervalId);
    if (autoscanIntervalId) toggleAutoscan(false);
    
    btnToggleRepairer.classList.remove("btn-primary");
    btnToggleRepairer.classList.add("btn-danger");
    btnToggleRepairer.innerHTML = `<i class="fa-solid fa-stop"></i> 복구기 정지`;
    
    activeTestMode = "tool";
    
    // Create optimized offscreen noise pattern to prevent main thread choke
    const noiseCanvas = document.createElement("canvas");
    noiseCanvas.width = 256;
    noiseCanvas.height = 256;
    const nCtx = noiseCanvas.getContext("2d");
    const imgData = nCtx.createImageData(256, 256);
    
    // 60fps Tick Loop
    repairerIntervalId = setInterval(() => {
      const mode = repairModeSelect.value;
      const w = testScreenCanvas.width;
      const h = testScreenCanvas.height;
      
      if (mode === "flicker") {
        // Alternating black and white
        ctx.fillStyle = repairColorToggle ? "#ffffff" : "#000000";
        ctx.fillRect(0, 0, w, h);
        repairColorToggle = !repairColorToggle;
      } 
      
      else if (mode === "color") {
        // High frequency rgb cycling
        const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];
        const randCol = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillStyle = randCol;
        ctx.fillRect(0, 0, w, h);
      } 
      
      else if (mode === "noise") {
        // Fast noise redraw
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const val = Math.floor(Math.random() * 255);
          data[i] = val;
          data[i+1] = val;
          data[i+2] = val;
          data[i+3] = 255;
        }
        nCtx.putImageData(imgData, 0, 0);
        
        // Pattern tile draw
        const pat = ctx.createPattern(noiseCanvas, "repeat");
        ctx.fillStyle = pat;
        
        // Random offsets to prevent static noise look
        ctx.save();
        ctx.translate(Math.random() * 50, Math.random() * 50);
        ctx.fillRect(-50, -50, w + 100, h + 100);
        ctx.restore();
      }
      
      // Draw registered coordinates over repair loop
      drawBadPixelMarkers();
    }, 16); // ~60fps
    
  } else {
    if (repairerIntervalId) {
      clearInterval(repairerIntervalId);
      repairerIntervalId = null;
    }
    
    btnToggleRepairer.classList.remove("btn-danger");
    btnToggleRepairer.classList.add("btn-primary");
    btnToggleRepairer.innerHTML = `<i class="fa-solid fa-bolt"></i> 잔상 복구기 재생`;
    
    activeTestMode = "color";
    drawCurrentScreen();
  }
}

// Bleed measurement
function runBleedMode() {
  switchTab("pattern");
  currentPatternIndex = PATTERNS_DATABASE.findIndex(p => p.id === "pat-focus");
  activeTestMode = "pattern";
  drawCurrentScreen();
  toggleFullscreen(true);
}

// -------------------------------------------------------------
// Report Data Exporter (JSON, CSV, Screenshot)
// -------------------------------------------------------------
function exportLogFile(format) {
  if (badPixelsLog.length === 0) return;
  
  let content = "";
  let filename = `monitor_bad_pixels_${Date.now()}`;
  let mime = "text/plain";
  
  if (format === "json") {
    content = JSON.stringify(badPixelsLog, null, 2);
    filename += ".json";
    mime = "application/json";
  } else if (format === "csv") {
    // Headers
    content = "Index,X,Y,CanvasWidth,CanvasHeight,ScreenWidth,ScreenHeight,TestColorName,TestMode,Timestamp\n";
    badPixelsLog.forEach((pixel, idx) => {
      content += `${idx+1},${pixel.x},${pixel.y},${pixel.canvasW},${pixel.canvasH},${pixel.screenW},${pixel.screenH},"${pixel.activeName}",${pixel.testMode},${pixel.timestamp}\n`;
    });
    filename += ".csv";
    mime = "text/csv;charset=utf-8;";
  }
  
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Capture current screen including crosshair markings
function captureScreenshotReport() {
  // We can convert canvas rendering context to URL base64
  const url = testScreenCanvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = url;
  link.download = `monitor_bad_pixel_report_${Date.now()}.png`;
  link.click();
}

// -------------------------------------------------------------
// Keyboard Handlers
// -------------------------------------------------------------
function handleKeyboardInput(e) {
  const key = e.key.toLowerCase();
  
  // F key: fullscreen
  if (key === "f") {
    e.preventDefault();
    toggleFullscreen();
  }
  
  // A key: autoscan slideshow
  else if (key === "a") {
    e.preventDefault();
    toggleAutoscan();
  }
  
  // M key: remove last bad pixel
  else if (key === "m") {
    e.preventDefault();
    removeLastBadPixel();
  }
  
  // O key: confirm info
  else if (key === "o") {
    e.preventDefault();
    addLastBadPixel();
  }
  
  // Space: Play/pause scan
  else if (e.code === "Space") {
    e.preventDefault();
    toggleAutoscan();
  }
  
  // Left/Right Arrow: Navigate colors or patterns
  else if (e.key === "ArrowRight") {
    e.preventDefault();
    if (activeTestMode === "color") {
      navigateSelection(1, "color");
    } else {
      navigateSelection(1, "pattern");
    }
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    if (activeTestMode === "color") {
      navigateSelection(-1, "color");
    } else {
      navigateSelection(-1, "pattern");
    }
  }
  
  // Plus/Minus keys: Switch tab/color
  else if (e.key === "+" || e.key === "=") {
    e.preventDefault();
    switchTab("color");
  } else if (e.key === "-") {
    e.preventDefault();
    switchTab("pattern");
  }
  
  // Asterisk / slash keys
  else if (e.key === "*") {
    e.preventDefault();
    switchTab("tool");
  } else if (e.key === "/") {
    e.preventDefault();
    location.href = "../index.html"; // Home
  }
}

// -------------------------------------------------------------
// TOC Page Switcher
// -------------------------------------------------------------
function switchTOCArticle(index) {
  const article = GUIDE_ARTICLES[index];
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
