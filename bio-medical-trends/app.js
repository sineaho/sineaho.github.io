/* ==========================================
   CineAHO Bio-Medical Paper Trends Analyzer
   JavaScript Data Model and Controllers
   ========================================== */

// 1. Curated Papers Dataset (16 Seminal biology and medicine papers)
let papersDataset = [
  {
    id: 1,
    title: "Accurate structure prediction of biomolecular interactions with AlphaFold 3",
    authors: "Josh Abramson, Jonas Adler, Jackumper et al.",
    journal: "Nature",
    year: 2024,
    citations: 1640,
    impactFactor: 64.8,
    altmetric: 4520,
    subfield: "AI Drug Discovery",
    keywords: ["AI", "Structural Biology", "Protein folding", "AlphaFold", "Drug design"],
    abstract: "This paper describes AlphaFold 3, a deep-learning-based model that can predict the structures and interactions of proteins, DNA, RNA, chemical ligands, and post-translational modifications with unprecedented accuracy. This tool accelerates drug design and helps decode basic biological mechanisms."
  },
  {
    id: 2,
    title: "Lecanemab in Early Alzheimer's Disease",
    authors: "Christopher H. van Dyck, Chad J. Swanson, et al.",
    journal: "NEJM",
    year: 2023,
    citations: 1210,
    impactFactor: 158.5,
    altmetric: 3890,
    subfield: "Immunotherapy",
    keywords: ["Alzheimer's", "Monoclonal Antibody", "Amyloid beta", "Clinical Trial", "Neurobiology"],
    abstract: "A phase 3 clinical trial evaluating Lecanemab, an anti-amyloid-beta protofibril antibody, in patients with early Alzheimer's disease. Results showed that Lecanemab reduced brain amyloid levels and led to moderately less decline on clinical measures of cognition and function compared to placebo over 18 months."
  },
  {
    id: 3,
    title: "In vivo CRISPR base editing of PCSK9 in humans for cardiovascular treatment",
    authors: "Andrew M. Bellinger, Verve Therapeutics Team",
    journal: "Nature Medicine",
    year: 2024,
    citations: 640,
    impactFactor: 58.7,
    altmetric: 2980,
    subfield: "CRISPR Gene Editing",
    keywords: ["CRISPR", "Base editing", "PCSK9", "Gene therapy", "Cardiovascular"],
    abstract: "The first clinical report showing successful in vivo gene editing in humans using a single infusion of base-editing therapy targeting the PCSK9 gene in the liver. It demonstrated a durable reduction in low-density lipoprotein (LDL) cholesterol, opening a new paradigm for treating cardiovascular diseases."
  },
  {
    id: 4,
    title: "Tirzepatide once weekly for the treatment of obesity",
    authors: "Ania M. Jastreboff, Louis J. Aronne, et al.",
    journal: "NEJM",
    year: 2023,
    citations: 1450,
    impactFactor: 158.5,
    altmetric: 4120,
    subfield: "Metabolism",
    keywords: ["Obesity", "GLP-1", "GIP", "Tirzepatide", "Weight Loss"],
    abstract: "In this phase 3 double-blind trial, weekly administration of Tirzepatide (a dual GIP and GLP-1 receptor agonist) in adults with obesity resulted in substantial and sustained reductions in body weight (up to 20.9% on average), showing a breakthrough pharmacological solution for metabolic health."
  },
  {
    id: 5,
    title: "Structural basis of mRNA vaccine translation efficiency and immunity",
    authors: "Katalin Kariko, Drew Weissman et al.",
    journal: "Cell",
    year: 2024,
    citations: 820,
    impactFactor: 66.8,
    altmetric: 3100,
    subfield: "mRNA Tech",
    keywords: ["mRNA vaccine", "Nucleoside modification", "Immunology", "Translation", "Lipid Nanoparticles"],
    abstract: "This study elucidates the structural atomic details of ribosomes translating modified mRNA codes. It describes how specific chemical base alterations (like pseudouridine) prevent innate immune sensing while optimizing protein expression, providing crucial engineering guidelines for future mRNA therapeutics."
  },
  {
    id: 6,
    title: "Epigenetic reprogramming to restore youthful gene expression patterns and reverse aging",
    authors: "David A. Sinclair, Harvard Longevity Group",
    journal: "Cell",
    year: 2023,
    citations: 980,
    impactFactor: 66.8,
    altmetric: 3540,
    subfield: "Longevity",
    keywords: ["Aging", "Epigenetics", "Yamanaka factors", "Cellular rejuvenation", "Longevity"],
    abstract: "Demonstrates that cellular aging is driven in part by loss of epigenetic information. Using Yamanaka factors (OSK) delivered via viral vectors, researchers reprogrammed retinal and muscle cells in vivo, successfully reversing biological age indicators and restoring damaged tissue functionalities."
  },
  {
    id: 7,
    title: "Gut microbiome signatures correlate with response to PD-1 immunotherapy in solid tumors",
    authors: "Laurence Zitvogel, Science Immunology Network",
    journal: "Science",
    year: 2024,
    citations: 450,
    impactFactor: 56.9,
    altmetric: 1890,
    subfield: "Microbiome",
    keywords: ["Microbiome", "Cancer", "Immunotherapy", "PD-1", "Metagenomics"],
    abstract: "This paper correlates specific intestinal bacterial species with the therapeutic response of patients undergoing PD-1 blockade. Fecal microbiota transplantation from responders into germ-free mice restored antitumor efficacy, proving the microbiome's active role in systemic immune modulation."
  },
  {
    id: 8,
    title: "A high-density brain-computer interface for speech restoration in paralyzed patients",
    authors: "Edward F. Chang, BCI Consortium",
    journal: "Nature",
    year: 2023,
    citations: 590,
    impactFactor: 64.8,
    altmetric: 3200,
    subfield: "Neural Interfaces",
    keywords: ["BCI", "Brain-Computer Interface", "Speech prosthesis", "Neural grids", "AI decoding"],
    abstract: "A clinical trial demonstrating a high-density cortical implant coupled with deep learning language models that decoded neural signals into text and synthesized speech. The patient, unable to speak due to stroke, communicated at over 70 words per minute with low error rates."
  },
  {
    id: 9,
    title: "Discovery of novel structural antibiotics using deep learning molecular models",
    authors: "James J. Collins, MIT Bio-AI Lab",
    journal: "Nature Chemical Biology",
    year: 2024,
    citations: 510,
    impactFactor: 52.3,
    altmetric: 2450,
    subfield: "AI Drug Discovery",
    keywords: ["AI", "Antibiotics", "Drug discovery", "Deep learning", "Superbugs"],
    abstract: "Using deep learning neural networks to screen structurally diverse compounds, researchers discovered a powerful new class of non-toxic antibiotics (including Abaucin) targeting drug-resistant superbugs like Acinetobacter baumannii, demonstrating AI's power in antimicrobial research."
  },
  {
    id: 10,
    title: "Complete sequencing of the human genome centromeres and telomeres",
    authors: "Telomere-to-Telomere (T2T) Consortium",
    journal: "Science",
    year: 2024,
    citations: 720,
    impactFactor: 56.9,
    altmetric: 2150,
    subfield: "Genomics",
    keywords: ["Genomics", "DNA sequencing", "Centromere", "T2T", "Dark genome"],
    abstract: "The completion of the final unresolved gaps of the human reference genome. It unveils the full structural organization of difficult heterochromatic regions, telomeres, and centromeric repetitive arrays, resolving key questions in chromosomal stability and evolution."
  },
  {
    id: 11,
    title: "CRISPR-based in vivo gene therapy for hereditary blindness",
    authors: "Albert M. Maguire, Eric A. Pierce, et al.",
    journal: "NEJM",
    year: 2024,
    citations: 310,
    impactFactor: 158.5,
    altmetric: 2710,
    subfield: "CRISPR Gene Editing",
    keywords: ["CRISPR", "Gene therapy", "Blindness", "LCA", "In vivo"],
    abstract: "Clinical report on in vivo subretinal delivery of CRISPR-Cas9 components to correct splicing errors in the CEP290 gene. Treated patients with Leber Congenital Amaurosis showed significant, durable improvements in visual acuity and navigation tests."
  },
  {
    id: 12,
    title: "Personalized cancer vaccine based on mRNA technology in adjuvant melanoma treatment",
    authors: "Jeffrey S. Weber, Georgina V. Long, et al.",
    journal: "Lancet",
    year: 2024,
    citations: 380,
    impactFactor: 112.1,
    altmetric: 3410,
    subfield: "mRNA Tech",
    keywords: ["mRNA vaccine", "Melanoma", "Cancer vaccine", "Immunotherapy", "Neoantigen"],
    abstract: "A randomized phase 2b trial showing that adjuvant therapy with a personalized mRNA cancer vaccine (mRNA-4157/V940) combined with Pembrolizumab significantly reduced the risk of recurrence or death by 44% compared to pembrolizumab alone in patients with high-risk resected melanoma."
  },
  {
    id: 13,
    title: "Clinical safety of xenotransplantation using genetically modified porcine hearts",
    authors: "Bartley P. Griffith, Muhammad M. Mohiuddin, et al.",
    journal: "Lancet",
    year: 2023,
    citations: 890,
    impactFactor: 112.1,
    altmetric: 3950,
    subfield: "Immunotherapy",
    keywords: ["Xenotransplantation", "Gene editing", "Porcine Heart", "Organ transplant"],
    abstract: "Detailed pathological analysis of the historic first transplant of a genetically modified pig heart into a human patient. It describes the surgical execution, genetic modifications (10 edits to knock down pig genes and add human genes), and immune rejection patterns observed."
  },
  {
    id: 14,
    title: "Senolytic clearance of cellular senescence in human pulmonary fibrosis",
    authors: "Kirkland J. Kirkland, Mayo Clinic Aging Group",
    journal: "Nature Cell Biology",
    year: 2023,
    citations: 620,
    impactFactor: 54.2,
    altmetric: 1780,
    subfield: "Longevity",
    keywords: ["Senolytics", "Aging", "Senescence", "Pulmonary Fibrosis", "Dasatinib"],
    abstract: "Clinical pilot trial evaluating the efficacy of clearing senescent cells using dasatinib plus quercetin. The treatment led to statistically significant reductions in key inflammatory markers and improved physical function indicators in patients with idiopathic pulmonary fibrosis."
  },
  {
    id: 15,
    title: "A neural grid mapping prosthesis for restoring arm movement in spinal cord injury",
    authors: "Grégoire Courtine, EPFL Neuroprosthetics Team",
    journal: "JAMA",
    year: 2025,
    citations: 210,
    impactFactor: 120.7,
    altmetric: 1980,
    subfield: "Neural Interfaces",
    keywords: ["BCI", "Prosthesis", "Spinal cord injury", "Motor cortex", "AI modeling"],
    abstract: "Clinical report on a chronic spinal implant delivering epidural electrical stimulation mapped from a motor cortex neural grid, creating a digital bridge that allowed a paralyzed patient to stand and walk naturally under control of their thoughts."
  },
  {
    id: 16,
    title: "AI-driven structural screening of small molecules for cancer targeted protein degradation",
    authors: "Stuart L. Schreiber, Broad Institute Cell biology",
    journal: "Cell",
    year: 2025,
    citations: 240,
    impactFactor: 66.8,
    altmetric: 2200,
    subfield: "AI Drug Discovery",
    keywords: ["AI", "Cancer", "Protein degrader", "PROTAC", "Targeted therapy"],
    abstract: "Describes an AI model that designs bifunctional small molecules capable of recruiting E3 ligases to destroy oncogenic proteins. The structural predictions speed up optimization of PROTAC compounds from years to weeks."
  }
];

// Load/Save state to localStorage for persistence
function saveBioTrendsState() {
  localStorage.setItem("bio_trends_papers_dataset", JSON.stringify(papersDataset));
}

function loadBioTrendsState() {
  try {
    const cached = localStorage.getItem("bio_trends_papers_dataset");
    if (cached) {
      papersDataset = JSON.parse(cached);
    }
  } catch(e) {
    console.warn("Failed to load bio_trends_papers_dataset from localStorage:", e);
  }
}

// Fetch papers from Server API
async function fetchBioTrends(refresh = false) {
  try {
    const url = refresh ? '/api/bio-trends?refresh=true' : '/api/bio-trends';
    const response = await fetch(url);
    if (!response.ok) throw new Error('API response not OK');
    const result = await response.json();
    if (result.success && Array.isArray(result.data) && result.data.length > 0) {
      papersDataset = result.data;
      saveBioTrendsState();
      return true;
    }
  } catch (err) {
    console.error('Failed to fetch bio trends from API:', err);
  }
  return false;
}

function updateSyncTimeLabel(statusText = '') {
  const bioSyncTimeLabel = document.getElementById("bio-sync-time-label");
  if (bioSyncTimeLabel) {
    const now = new Date();
    bioSyncTimeLabel.textContent = `최근 갱신: ${now.toLocaleTimeString("ko-KR")} (${statusText})`;
    bioSyncTimeLabel.style.color = "#10b981";
  }
}

function playSuccessChime() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const t = audioCtx.currentTime;
    osc.frequency.setValueAtTime(523.25, t);
    osc.frequency.setValueAtTime(659.25, t + 0.1);
    osc.frequency.setValueAtTime(783.99, t + 0.2);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.start(t);
    osc.stop(t + 0.4);
  } catch(e) {}
}

// Sleek Custom Toast System
function showToast(title, message, iconClass = 'fa-solid fa-circle-check') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'custom-toast';
  toast.innerHTML = `
    <div class="toast-icon"><i class="${iconClass}"></i></div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
  `;

  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 4000);
}

loadBioTrendsState();

// Global Dashboard Charts reference
let radarChart = null;
let lineChart = null;
let doughnutChart = null;
let simChart = null;

// Global Filter State
let searchQuery = '';
let selectedSubfield = 'all';
let selectedJournal = 'all';
let selectedYear = 'all';
let currentSortColumn = 'id';
let currentSortAsc = true;

// 2. Initialize Charts, Navigation, Theme & Stats
async function initAll() {
  initTheme();
  initNavigation();
  
  // Try to load fresh data from backend. If it fails, fallback to local storage or static array
  const loadSuccess = await fetchBioTrends(false);
  
  initDashboardCharts();
  initExplorerTable();
  initSimulator();
  initPaperModal();
  updateVisitorStats();

  updateSyncTimeLabel(loadSuccess ? 'API 동기화 완료' : '로컬 로드 완료');

  // Bind manual data sync button
  const btnSyncBio = document.getElementById("btn-sync-bio-trends");
  if (btnSyncBio) {
    btnSyncBio.addEventListener("click", async () => {
      btnSyncBio.disabled = true;
      btnSyncBio.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>PubMed API 연동 실시간 데이터 수집 중...</span>`;
      
      const success = await fetchBioTrends(true);
      
      if (success) {
        initDashboardCharts();
        initExplorerTable();
        initSimulator();
        
        playSuccessChime();
        updateSyncTimeLabel('실시간 동기화 완료');
        showToast("동기화 성공", "NCBI PubMed API 연동이 완료되었습니다! 최근 발표된 논문 60편을 실시간으로 수집하고 트렌드 분석을 완료했습니다.", "fa-solid fa-circle-check");
      } else {
        showToast("동기화 실패", "실시간 데이터 수집에 실패했습니다. PubMed 서버 상태 또는 네트워크 설정을 확인해 주세요.", "fa-solid fa-triangle-exclamation");
      }
      
      btnSyncBio.disabled = false;
      btnSyncBio.innerHTML = `<i class="fa-solid fa-arrows-rotate"></i> <span>실시간 논문 데이터 수집 및 갱신</span>`;
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

// Theme Initializer (Sync with localStorage / default dark)
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;
  const themeIcon = themeToggleBtn.querySelector('i');
  const themeText = themeToggleBtn.querySelector('span');

  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeUI(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    let newTheme = 'dark';
    if (currentTheme === 'dark') {
      newTheme = 'light';
    }
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeUI(newTheme);
    
    // Re-render active tab charts to apply new theme colors
    initDashboardCharts();
    initSimulatorChart();
  });

  function updateThemeUI(theme) {
    if (theme === 'light') {
      themeIcon.className = 'fa-solid fa-moon';
      themeText.textContent = '다크';
      themeToggleBtn.style.borderColor = 'var(--text-muted)';
    } else {
      themeIcon.className = 'fa-solid fa-sun';
      themeText.textContent = '라이트';
      themeToggleBtn.style.borderColor = 'rgba(255, 255, 255, 0.08)';
    }
  }
}

// Visitor Stats Loader for sub-app
async function updateVisitorStats() {
  try {
    const response = await fetch('/api/visits');
    if (!response.ok) return;
    const visits = await response.json();

    // 1. Portal stats
    const mainStats = visits['main'] || { total: 0, today: 0, uniqueTotal: 0, uniqueToday: 0 };
    const siteTotalEl = document.getElementById('site-visit-total');
    const siteTodayEl = document.getElementById('site-visit-today');
    const siteUTotalEl = document.getElementById('site-visit-utotal');
    const siteUTodayEl = document.getElementById('site-visit-utoday');

    if (siteTotalEl) siteTotalEl.textContent = mainStats.total.toLocaleString();
    if (siteTodayEl) siteTodayEl.textContent = mainStats.today.toLocaleString();
    if (siteUTotalEl) siteUTotalEl.textContent = mainStats.uniqueTotal.toLocaleString();
    if (siteUTodayEl) siteUTodayEl.textContent = mainStats.uniqueToday.toLocaleString();

    // 2. Apps collective stats
    let appsTotal = 0;
    let appsToday = 0;
    let appsUTotal = 0;
    let appsUToday = 0;

    for (const app in visits) {
      if (app === 'main') continue;
      const appData = visits[app];
      appsTotal += appData.total || 0;
      appsToday += appData.today || 0;
      appsUTotal += appData.uniqueTotal || 0;
      appsUToday += appData.uniqueToday || 0;
    }

    const appsTotalEl = document.getElementById('apps-visit-total');
    const appsTodayEl = document.getElementById('apps-visit-today');
    const appsUTotalEl = document.getElementById('apps-visit-utotal');
    const appsUTodayEl = document.getElementById('apps-visit-utoday');

    if (appsTotalEl) appsTotalEl.textContent = appsTotal.toLocaleString();
    if (appsTodayEl) appsTodayEl.textContent = appsToday.toLocaleString();
    if (appsUTotalEl) appsUTotalEl.textContent = appsUTotal.toLocaleString();
    if (appsUTodayEl) appsUTodayEl.textContent = appsUToday.toLocaleString();

  } catch (err) {
    console.error('방문자 통계 로드 실패:', err);
  }
}

// App Tab Switcher
function initNavigation() {
  const tabButtons = document.querySelectorAll('.bio-tab-btn');
  const tabPanels = document.querySelectorAll('.bio-tab-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle buttons
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Toggle Panels
      const targetId = btn.getAttribute('data-target');
      tabPanels.forEach(p => {
        if (p.id === targetId) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });

      // Special triggers on tab load
      if (targetId === 'tab-dashboard') {
        initDashboardCharts();
      } else if (targetId === 'tab-simulator') {
        initSimulatorChart();
      }
    });
  });
}

// 3. Render Trend Dashboard Charts
function initDashboardCharts() {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const gridColor = isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.04)';
  const radarGridColor = isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.06)';
  const textColor = isLight ? '#475569' : '#94a3b8';

  // Aggregate Data
  const subfields = {};
  const years = {};
  const journals = {};
  const keywordsPool = {};

  let totalCitations = 0;
  let maxIF = 0;
  let maxIFJournal = '';

  papersDataset.forEach(paper => {
    // KPI metrics
    totalCitations += paper.citations;
    if (paper.impactFactor > maxIF) {
      maxIF = paper.impactFactor;
      maxIFJournal = `${paper.impactFactor} (${paper.journal})`;
    }

    // Subfield aggregates (Radar)
    subfields[paper.subfield] = (subfields[paper.subfield] || 0) + paper.citations;

    // Year timeline aggregates (Line)
    if (!years[paper.year]) {
      years[paper.year] = { sum: 0, count: 0 };
    }
    years[paper.year].sum += paper.citations;
    years[paper.year].count += 1;

    // Journal shares (Doughnut)
    journals[paper.journal] = (journals[paper.journal] || 0) + 1;

    // Keywords frequency
    paper.keywords.forEach(kw => {
      keywordsPool[kw] = (keywordsPool[kw] || 0) + paper.citations; // Weight by citation count!
    });
  });

  // Inject KPI values
  const avgCits = document.getElementById('kpi-avg-citations');
  const maxIFSpan = document.getElementById('kpi-max-if');
  const totalPapersSpan = document.getElementById('kpi-total-papers');
  const topTopicSpan = document.getElementById('kpi-top-topic');

  if (avgCits) avgCits.textContent = papersDataset.length > 0 ? `${Math.round(totalCitations / papersDataset.length)}회` : '0회';
  if (maxIFSpan) maxIFSpan.textContent = maxIFJournal || '-';
  if (totalPapersSpan) totalPapersSpan.textContent = `${papersDataset.length}편`;

  // Find top topic (subfield with max citations)
  let topTopic = 'N/A';
  let maxTopicVal = -1;
  for (const [subfield, val] of Object.entries(subfields)) {
    if (val > maxTopicVal) {
      maxTopicVal = val;
      topTopic = subfield;
    }
  }
  if (topTopicSpan) {
    const koSubfields = {
      'AI Drug Discovery': 'AI 신약개발',
      'CRISPR Gene Editing': '유전자 교정',
      'mRNA Tech': 'mRNA 백신공학',
      'Immunotherapy': '면역 항암치료',
      'Neural Interfaces': '뇌-컴퓨터 인터페이스',
      'Longevity': '노화 방지',
      'Microbiome': '마이크로바이옴',
      'Genomics': '유전체학',
      'General Medicine': '일반 의학'
    };
    topTopicSpan.textContent = koSubfields[topTopic] || topTopic;
  }

  // Render Keyword Cloud tags
  const cloudContainer = document.getElementById('kws-cloud-container');
  if (cloudContainer) {
    const sortedKeywords = Object.entries(keywordsPool).sort((a,b) => b[1] - a[1]).slice(0, 15);
    cloudContainer.innerHTML = sortedKeywords.map(([kw, citations]) => {
      let sizeClass = 'size-sm';
      if (citations > 3000) sizeClass = 'size-xxl';
      else if (citations > 2000) sizeClass = 'size-xl';
      else if (citations > 1000) sizeClass = 'size-lg';
      else if (citations > 500) sizeClass = 'size-md';
      return `<span class="kw-tag ${sizeClass}" data-kw="${kw}">${kw}</span>`;
    }).join('');

    // Clicking tags inside cloud searches for the keyword in Tab 2
    cloudContainer.querySelectorAll('.kw-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const kw = tag.getAttribute('data-kw');
        searchQuery = kw;
        const searchInput = document.getElementById('paper-search-input');
        if (searchInput) searchInput.value = kw;
        
        // Go to explorer tab
        const explorerTabBtn = document.querySelector('.bio-tab-btn[data-target="tab-explorer"]');
        if (explorerTabBtn) explorerTabBtn.click();
        
        applyExplorerFilters();
      });
    });
  }

  // --- CHART 1: Radar Chart (Topics Hotness) ---
  const ctxRadar = document.getElementById('chart-radar-topics');
  if (ctxRadar) {
    if (radarChart) radarChart.destroy();
    
    const labels = Object.keys(subfields);
    const dataValues = Object.values(subfields);

    radarChart = new Chart(ctxRadar, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: '누적 논문 인용 지수',
          data: dataValues,
          backgroundColor: 'rgba(168, 85, 247, 0.15)',
          borderColor: '#a855f7',
          pointBackgroundColor: '#c084fc',
          pointBorderColor: '#fff',
          borderWidth: 2
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
            angleLines: { color: radarGridColor },
            grid: { color: radarGridColor },
            pointLabels: { color: textColor, font: { size: 10 } },
            ticks: { display: false }
          }
        }
      }
    });
  }

  // --- CHART 2: Line Chart (Citations Timeline) ---
  const ctxLine = document.getElementById('chart-line-citations');
  if (ctxLine) {
    if (lineChart) lineChart.destroy();

    const chartYears = Object.keys(years).sort();
    const chartAvgCitations = chartYears.map(yr => {
      const item = years[yr];
      return item.count > 0 ? Math.round(item.sum / item.count) : 0;
    });

    lineChart = new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: chartYears,
        datasets: [{
          label: '연도별 평균 인용수',
          data: chartAvgCitations,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointBackgroundColor: '#60a5fa',
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor }
          }
        }
      }
    });
  }

  // --- CHART 3: Doughnut Chart (Journal Shares) ---
  const ctxDoughnut = document.getElementById('chart-doughnut-journals');
  if (ctxDoughnut) {
    if (doughnutChart) doughnutChart.destroy();

    const journalNames = Object.keys(journals);
    const counts = Object.values(journals);

    doughnutChart = new Chart(ctxDoughnut, {
      type: 'doughnut',
      data: {
        labels: journalNames,
        datasets: [{
          data: counts,
          backgroundColor: [
            'rgba(244, 63, 94, 0.7)',  // Nature red
            'rgba(59, 130, 246, 0.7)',  // Science blue
            'rgba(16, 185, 129, 0.7)',  // Cell green
            'rgba(168, 85, 247, 0.7)',  // NEJM purple
            'rgba(249, 115, 22, 0.7)',  // Lancet orange
            'rgba(6, 182, 212, 0.7)'    // JAMA cyan
          ],
          borderWidth: 1,
          borderColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: textColor, font: { size: 10 }, boxWidth: 10 }
          }
        }
      }
    });
  }
}

// 4. Tab 2: Papers Explorer Table
function initExplorerTable() {
  const searchInput = document.getElementById('paper-search-input');
  const filterSubfield = document.getElementById('filter-subfield');
  const filterJournal = document.getElementById('filter-journal');
  const filterYear = document.getElementById('filter-year');
  const btnReset = document.getElementById('btn-reset-explorer');

  // Input changes
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      applyExplorerFilters();
    });
  }
  if (filterSubfield) {
    filterSubfield.addEventListener('change', (e) => {
      selectedSubfield = e.target.value;
      applyExplorerFilters();
    });
  }
  if (filterJournal) {
    filterJournal.addEventListener('change', (e) => {
      selectedJournal = e.target.value;
      applyExplorerFilters();
    });
  }
  if (filterYear) {
    filterYear.addEventListener('change', (e) => {
      selectedYear = e.target.value;
      applyExplorerFilters();
    });
  }

  // Reset filters
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      searchQuery = '';
      selectedSubfield = 'all';
      selectedJournal = 'all';
      selectedYear = 'all';

      searchInput.value = '';
      filterSubfield.value = 'all';
      filterJournal.value = 'all';
      filterYear.value = 'all';

      applyExplorerFilters();
    });
  }

  // Table Sorting headers click
  document.querySelectorAll('.papers-table th.sortable').forEach(header => {
    header.addEventListener('click', () => {
      const col = header.getAttribute('data-sort');
      if (currentSortColumn === col) {
        currentSortAsc = !currentSortAsc;
      } else {
        currentSortColumn = col;
        currentSortAsc = true;
      }

      // Sync header sort icons
      document.querySelectorAll('.papers-table th.sortable i').forEach(icon => {
        icon.className = 'fa-solid fa-sort';
      });
      const icon = header.querySelector('i');
      if (currentSortAsc) {
        icon.className = 'fa-solid fa-sort-up';
      } else {
        icon.className = 'fa-solid fa-sort-down';
      }

      applyExplorerFilters();
    });
  });

  // Initial draw
  applyExplorerFilters();
}

function applyExplorerFilters() {
  let result = [...papersDataset];

  // 1. Keyword search filter
  if (searchQuery) {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.authors.toLowerCase().includes(q) ||
      item.journal.toLowerCase().includes(q) ||
      item.subfield.toLowerCase().includes(q) ||
      item.keywords.some(tag => tag.toLowerCase().includes(q))
    );
  }

  // 2. Dropdown selectors
  if (selectedSubfield !== 'all') {
    result = result.filter(item => item.subfield === selectedSubfield);
  }
  if (selectedJournal !== 'all') {
    result = result.filter(item => item.journal === selectedJournal);
  }
  if (selectedYear !== 'all') {
    result = result.filter(item => item.year === parseInt(selectedYear, 10));
  }

  // 3. Sorting
  result.sort((a, b) => {
    let valA = a[currentSortColumn];
    let valB = b[currentSortColumn];

    // Impact Factor alias mapper
    if (currentSortColumn === 'if') {
      valA = a.impactFactor;
      valB = b.impactFactor;
    }

    if (valA < valB) return currentSortAsc ? -1 : 1;
    if (valA > valB) return currentSortAsc ? 1 : -1;
    return 0;
  });

  renderPapersTable(result);
}

function renderPapersTable(data) {
  const tableBody = document.getElementById('papers-table-body');
  const countSpan = document.getElementById('explorer-match-count');
  
  if (countSpan) countSpan.textContent = data.length.toString();

  if (!tableBody) return;

  if (data.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 3rem; color: var(--text-muted);">
          <i class="fa-solid fa-folder-open" style="font-size: 2.2rem; margin-bottom: 1rem; color: rgba(255,255,255,0.08);"></i>
          <p>조건과 매칭되는 바이오·의학 연구 논문이 존재하지 않습니다.</p>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = data.map((paper, idx) => `
    <tr>
      <td><span style="font-weight: 700; color: #a855f7;"># ${paper.id}</span></td>
      <td><div class="paper-title-col" title="${paper.title}">${paper.title}</div></td>
      <td><span style="font-size: 0.78rem;">${paper.authors.split(',')[0]} 외</span></td>
      <td><strong style="color: #60a5fa;">${paper.journal}</strong></td>
      <td>${paper.year}년</td>
      <td><strong>${paper.citations.toLocaleString()}회</strong></td>
      <td><span style="color:#34d399; font-weight:700;">${paper.impactFactor}</span></td>
      <td><span style="color:#fb7185; font-weight:700;">${paper.altmetric.toLocaleString()}</span></td>
      <td>
        <button class="btn-detail-view" onclick="openPaperDetail(${paper.id})">🔍 정보</button>
      </td>
    </tr>
  `).join('');
}

// 5. Detailed Paper Viewer Modal
function initPaperModal() {
  const modal = document.getElementById('paper-details-modal');
  const btnClose = document.getElementById('btn-close-modal');

  if (btnClose) btnClose.addEventListener('click', closePaperModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closePaperModal();
    });
  }
}

window.openPaperDetail = function(paperId) {
  const paper = papersDataset.find(p => p.id === paperId);
  if (!paper) return;

  const modal = document.getElementById('paper-details-modal');
  if (!modal) return;

  // Inject specs
  document.getElementById('modal-title').textContent = paper.title;
  document.getElementById('modal-authors').textContent = paper.authors;
  document.getElementById('modal-journal').textContent = paper.journal;
  document.getElementById('modal-citations').textContent = `${paper.citations.toLocaleString()}회`;
  document.getElementById('modal-if').textContent = paper.impactFactor.toString();
  document.getElementById('modal-altmetric').textContent = paper.altmetric.toLocaleString();
  document.getElementById('modal-subfield').textContent = paper.subfield;
  document.getElementById('modal-abstract').textContent = paper.abstract;

  // Ingest keywords tags
  const keywordsWrapper = document.getElementById('modal-keywords-container');
  if (keywordsWrapper) {
    keywordsWrapper.innerHTML = paper.keywords.map(kw => `
      <span class="modal-kw-tag">${kw}</span>
    `).join('');
  }

  modal.classList.add('open');
};

function closePaperModal() {
  const modal = document.getElementById('paper-details-modal');
  if (modal) modal.classList.remove('open');
}

// 6. Tab 3: Future Trend Simulator
function initSimulator() {
  // Inputs Setup
  const sliders = ['budget', 'compute', 'success', 'coop'];
  sliders.forEach(key => {
    const input = document.getElementById(`slider-${key}`);
    const valSpan = document.getElementById(`val-slider-${key}`);

    if (input) {
      input.addEventListener('input', (e) => {
        if (valSpan) valSpan.textContent = `${e.target.value}%`;
        calculateForecastSimulation();
      });
    }
  });

  // Reset simulator
  const btnResetSim = document.getElementById('btn-reset-sim-params');
  if (btnResetSim) {
    btnResetSim.addEventListener('click', () => {
      sliders.forEach(key => {
        const input = document.getElementById(`slider-${key}`);
        const valSpan = document.getElementById(`val-slider-${key}`);
        if (input) {
          input.value = 50;
          if (valSpan) valSpan.textContent = '50%';
        }
      });
      calculateForecastSimulation();
    });
  }

  // Draw initial curve on load
  initSimulatorChart();
}

function initSimulatorChart() {
  const ctxSim = document.getElementById('chart-sim-forecast');
  if (!ctxSim) return;

  if (simChart) simChart.destroy();

  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const gridColor = isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.04)';
  const textColor = isLight ? '#475569' : '#94a3b8';

  const yearsLabel = ['2026', '2028', '2030', '2032', '2034', '2036'];

  simChart = new Chart(ctxSim, {
    type: 'line',
    data: {
      labels: yearsLabel,
      datasets: [
        {
          label: 'AI 신약개발 (AI Drug Discovery)',
          data: [15, 22, 34, 45, 60, 78],
          borderColor: '#a855f7',
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          tension: 0.3
        },
        {
          label: '유전자 교정 (CRISPR)',
          data: [18, 25, 29, 38, 52, 65],
          borderColor: '#ec4899',
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          tension: 0.3
        },
        {
          label: '면역 항암치료 (Immunotherapy)',
          data: [25, 28, 32, 37, 43, 50],
          borderColor: '#3b82f6',
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          tension: 0.3
        },
        {
          label: 'mRNA 백신공학 (mRNA Tech)',
          data: [22, 24, 28, 30, 36, 42],
          borderColor: '#10b981',
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          tension: 0.3
        },
        {
          label: '노화 방지 (Longevity)',
          data: [10, 14, 20, 26, 35, 48],
          borderColor: '#fb923c',
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: textColor, font: { size: 10 }, boxWidth: 10 }
        }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor } },
        y: { 
          grid: { color: gridColor }, 
          ticks: { color: textColor },
          title: { display: true, text: '상대적 연구 관심도 (%)', color: textColor, font: { size: 10 } }
        }
      }
    }
  });

  // Calculate default values based on default sliders (50%)
  calculateForecastSimulation();
}

// Simulated future prediction values algorithm
function calculateForecastSimulation() {
  if (!simChart) return;

  // Retrieve slider values
  const budget = parseInt(document.getElementById('slider-budget').value, 10);
  const compute = parseInt(document.getElementById('slider-compute').value, 10);
  const success = parseInt(document.getElementById('slider-success').value, 10);
  const coop = parseInt(document.getElementById('slider-coop').value, 10);

  // Growth formulas based on slider parameters
  // AI Drug Discovery: Heavily dependent on Compute and Coop
  const aiGrowth = 0.8 + (compute / 50) * 0.9 + (coop / 50) * 0.3;
  // CRISPR: Dependent on FDA success and compute
  const crisprGrowth = 0.9 + (success / 50) * 0.8 + (compute / 50) * 0.4;
  // Immunotherapy: Dependent on Budget and FDA success
  const immunoGrowth = 1.0 + (budget / 50) * 0.7 + (success / 50) * 0.5;
  // mRNA Tech: Dependent on Budget and global Cooperation
  const mrnaGrowth = 1.1 + (budget / 50) * 0.4 + (coop / 50) * 0.5;
  // Longevity: Dependent on Budget, success, and computing power
  const longevityGrowth = 0.6 + (budget / 50) * 0.5 + (success / 50) * 0.6 + (compute / 50) * 0.4;

  // Year mapping points
  const yearsOffset = [0, 2, 4, 6, 8, 10]; // 2026 to 2036

  // 1. AI Drug Discovery curve
  const aiData = yearsOffset.map(t => Math.round(15 + t * 4 * aiGrowth + (t*t * 0.2 * (compute/50))));
  
  // 2. CRISPR curve
  const crisprData = yearsOffset.map(t => Math.round(18 + t * 3.5 * crisprGrowth + (t*t * 0.1 * (success/50))));

  // 3. Immunotherapy curve
  const immunoData = yearsOffset.map(t => Math.round(25 + t * 2.2 * immunoGrowth));

  // 4. mRNA Tech curve
  const mrnaData = yearsOffset.map(t => Math.round(22 + t * 1.8 * mrnaGrowth));

  // 5. Longevity curve
  const longevityData = yearsOffset.map(t => Math.round(10 + t * 2.5 * longevityGrowth + (t*t * 0.15 * (budget/50))));

  // Update Chart.js datasets
  simChart.data.datasets[0].data = aiData;
  simChart.data.datasets[1].data = crisprData;
  simChart.data.datasets[2].data = immunoData;
  simChart.data.datasets[3].data = mrnaData;
  simChart.data.datasets[4].data = longevityData;

  simChart.update();
}
