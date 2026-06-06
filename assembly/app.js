// Application State
let state = {
  currentPage: 1,
  pageSize: 50,
  viewMode: 'photo', // 'photo' or 'list'
  activeTerm: '제22대',
  totalItems: 0,
  currentItemsCount: 0,
  partyStats: {},
  loading: false
};

// DOM Elements
const searchForm = document.getElementById('search-form');
const inputCode = document.getElementById('input-code');
const inputName = document.getElementById('input-name');
const inputParty = document.getElementById('input-party');
const inputCommittee = document.getElementById('input-committee');
const selectTerm = document.getElementById('select-term');
const selectPageSize = document.getElementById('select-pagesize');
const btnResetForm = document.getElementById('btn-reset-form');

const btnReloadCache = document.getElementById('btn-reload-cache');
const badgeActiveTerm = document.getElementById('badge-active-term');
const badgeTermResults = document.getElementById('badge-term-results');
const partyStatsList = document.getElementById('party-stats-list');
const partyStatsLabel = document.getElementById('party-stats-label');

const timelineButtonsContainer = document.getElementById('timeline-buttons');
const queryMetaDetails = document.getElementById('query-meta-details');
const metaTotalCount = document.getElementById('meta-total-count');
const metaCurrentCount = document.getElementById('meta-current-count');
const metaSource = document.getElementById('meta-source');
const metaSyncTime = document.getElementById('meta-sync-time');

const paginationSummary = document.getElementById('pagination-summary');
const btnModeList = document.getElementById('btn-mode-list');
const btnModePhoto = document.getElementById('btn-mode-photo');
const btnPagePrev = document.getElementById('btn-page-prev');
const btnPageNext = document.getElementById('btn-page-next');

const gridContainer = document.getElementById('members-grid-container');
const listContainer = document.getElementById('members-list-container');
const tableBody = document.getElementById('members-table-body');

const detailModal = document.getElementById('detail-modal');
const btnCloseModal = document.getElementById('btn-close-modal');

// Toast Notification
const toastNotif = document.getElementById('toast-notif');

function showToast(message) {
  toastNotif.textContent = message;
  toastNotif.classList.add('show');
  setTimeout(() => {
    toastNotif.classList.remove('show');
  }, 2000);
}

// Party CSS Class Mapper
function getPartyClass(partyName) {
  if (!partyName) return 'party-etc';
  const name = partyName.toLowerCase();
  if (name.includes('더불어민주당') || name.includes('더불어민주연합') || name.includes('민주당')) {
    return 'party-minjoo';
  }
  if (name.includes('국민의힘') || name.includes('국민의미래') || name.includes('새누리당') || name.includes('자유한국당') || name.includes('한나라당') || name.includes('미래통합당')) {
    return 'party-kukmin';
  }
  if (name.includes('조국혁신당')) {
    return 'party-jookuk';
  }
  if (name.includes('개혁신당')) {
    return 'party-gaehyuk';
  }
  if (name.includes('진보당')) {
    return 'party-jinbo';
  }
  if (name.includes('새로운미래')) {
    return 'party-saero';
  }
  return 'party-etc';
}

// Clean Party Name Helper (takes the final party if slash separated)
function cleanPartyName(partyName) {
  if (!partyName) return '무소속';
  if (partyName.includes('/')) {
    const parts = partyName.split('/');
    return parts[parts.length - 1].trim();
  }
  return partyName.trim();
}

// Format Date Helper
function formatDate(dateStr) {
  if (!dateStr) return '-';
  // If formatted as YYYY-MM-DD
  return dateStr;
}

// Initialize Application
function init() {
  bindEvents();
  fetchMembers();
}

// Bind Event Listeners
function bindEvents() {
  // Form submission
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    state.currentPage = 1;
    
    // Sync dropdown term if form submission changes it
    state.activeTerm = selectTerm.value;
    updateActiveTimelineButton(state.activeTerm);
    
    fetchMembers();
  });

  // Form Reset
  btnResetForm.addEventListener('click', () => {
    inputCode.value = '';
    inputName.value = '';
    inputParty.value = '';
    inputCommittee.value = '';
    selectTerm.value = '제22대';
    selectPageSize.value = '50';
    state.activeTerm = '제22대';
    state.currentPage = 1;
    state.pageSize = 50;
    
    updateActiveTimelineButton('제22대');
    fetchMembers();
  });

  // Cache Reload
  btnReloadCache.addEventListener('click', () => {
    showToast('Turso 캐시 데이터를 갱신 확인 중...');
    fetchMembers();
  });

  // Timeline Buttons Click
  timelineButtonsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.timeline-btn');
    if (!btn) return;
    
    const selectedTerm = btn.dataset.term;
    state.activeTerm = selectedTerm;
    selectTerm.value = selectedTerm; // sync form dropdown
    state.currentPage = 1;
    
    // UI Update
    updateActiveTimelineButton(selectedTerm);
    fetchMembers();
  });

  // View Mode Switchers
  btnModePhoto.addEventListener('click', () => {
    state.viewMode = 'photo';
    btnModePhoto.classList.add('active');
    btnModeList.classList.remove('active');
    gridContainer.style.display = 'grid';
    listContainer.style.display = 'none';
  });

  btnModeList.addEventListener('click', () => {
    state.viewMode = 'list';
    btnModeList.classList.add('active');
    btnModePhoto.classList.remove('active');
    gridContainer.style.display = 'none';
    listContainer.style.display = 'block';
  });

  // Pagination navigation
  btnPagePrev.addEventListener('click', () => {
    if (state.currentPage > 1) {
      state.currentPage--;
      fetchMembers();
    }
  });

  btnPageNext.addEventListener('click', () => {
    const maxPage = Math.ceil(state.totalItems / state.pageSize);
    if (state.currentPage < maxPage) {
      state.currentPage++;
      fetchMembers();
    }
  });

  // Page Size selector change
  selectPageSize.addEventListener('change', () => {
    state.pageSize = parseInt(selectPageSize.value, 10);
    state.currentPage = 1;
    fetchMembers();
  });

  // Modal actions
  btnCloseModal.addEventListener('click', closeModal);
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) {
      closeModal();
    }
  });

  // Esc key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && detailModal.classList.contains('open')) {
      closeModal();
    }
  });
}

// Update Active Button in Timeline UI
function updateActiveTimelineButton(term) {
  const buttons = timelineButtonsContainer.querySelectorAll('.timeline-btn');
  buttons.forEach(btn => {
    if (btn.dataset.term === term) {
      btn.classList.add('active');
      // Scroll into view if needed
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else {
      btn.classList.remove('active');
    }
  });
  
  badgeActiveTerm.textContent = `${term} 필터`;
  badgeTermResults.textContent = `대수 ${term}`;
}

// Fetch Members from Backend API
async function fetchMembers() {
  if (state.loading) return;
  state.loading = true;

  // Show loading state
  gridContainer.innerHTML = `
    <div class="empty-state">
      <i class="fa-solid fa-circle-notch fa-spin"></i>
      <p>데이터를 불러오는 중입니다...</p>
    </div>
  `;
  tableBody.innerHTML = `
    <tr>
      <td colspan="8" style="text-align: center; padding: 40px 0;">
        <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 1.5rem; margin-bottom: 12px; display: block; color: var(--accent-blue);"></i>
        데이터를 불러오는 중입니다...
      </td>
    </tr>
  `;

  // Get active inputs
  const codeVal = inputCode.value;
  const nameVal = inputName.value;
  const partyVal = inputParty.value;
  const commVal = inputCommittee.value;
  
  // Construct Query Params
  const query = new URLSearchParams({
    term: state.activeTerm,
    page: state.currentPage,
    pageSize: state.pageSize
  });

  if (codeVal) query.append('code', codeVal);
  if (nameVal) query.append('name', nameVal);
  if (partyVal) query.append('party', partyVal);
  if (commVal) query.append('committee', commVal);

  const url = `/api/assembly-members?${query.toString()}`;

  try {
    const response = await fetch(url);
    const result = await response.json();

    if (result.success) {
      state.totalItems = result.total;
      state.currentItemsCount = result.row.length;
      state.partyStats = result.partyStats;
      
      // Update Sync Time
      const now = new Date();
      const syncTimeStr = `${now.getFullYear()}. ${now.getMonth() + 1}. ${now.getDate()}. ` + 
                          `${now.getHours() >= 12 ? '오후' : '오전'} ` +
                          `${now.getHours() === 12 ? 12 : now.getHours() % 12}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      renderPartyStats();
      renderMetaDetails(result.source, syncTimeStr);
      renderResults(result.row);
      renderPagination();
    } else {
      renderError('데이터 로드 실패');
    }
  } catch (error) {
    console.error('Error fetching members:', error);
    renderError('네트워크 오류가 발생했습니다.');
  } finally {
    state.loading = false;
  }
}

// Render Party Stats tag bar
function renderPartyStats() {
  partyStatsLabel.textContent = `${state.activeTerm} 국회의원 필터 - `;
  partyStatsList.innerHTML = '';

  const entries = Object.entries(state.partyStats);
  if (entries.length === 0) {
    partyStatsList.innerHTML = '<span class="loading-text">소속 의원 없음</span>';
    return;
  }

  // Take top parties
  entries.forEach(([party, count]) => {
    const item = document.createElement('span');
    item.className = 'party-item';
    item.innerHTML = `${party} <span>${count}</span>`;
    partyStatsList.appendChild(item);
  });
}

// Render Query Meta Bar
function renderMetaDetails(source, syncTime) {
  metaTotalCount.textContent = `${state.totalItems}건`;
  metaCurrentCount.textContent = `${state.currentItemsCount}명`;
  metaSource.textContent = source;
  metaSyncTime.textContent = syncTime;

  queryMetaDetails.innerHTML = `
    질의 <span class="highlight">${state.activeTerm}</span> | 
    페이지 <span class="highlight">${state.currentPage}</span> | 
    페이지당 <span class="highlight">${state.pageSize}명</span> | 
    전체 <span class="highlight">${state.totalItems}건</span> | 
    이번 화면 <span class="highlight">${state.currentItemsCount}명</span> | 
    출처 <span class="highlight">${source}</span> | 
    동기화 <span class="highlight">${syncTime}</span>
  `;
}

// Render Member Grid Cards and List Table Rows
function renderResults(members) {
  gridContainer.innerHTML = '';
  tableBody.innerHTML = '';

  if (members.length === 0) {
    const emptyHtml = `
      <div class="empty-state">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>검색 조건에 맞는 국회의원 정보가 없습니다.</p>
      </div>
    `;
    gridContainer.innerHTML = emptyHtml;
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.5rem; margin-bottom: 12px; display: block; color: var(--text-secondary);"></i>
          검색 조건에 맞는 국회의원 정보가 없습니다.
        </td>
      </tr>
    `;
    return;
  }

  members.forEach(member => {
    const activeParty = cleanPartyName(member.PLPT_NM);
    const partyClass = getPartyClass(activeParty);

    // Image safety check: fallback to official assembly profile placeholder if blank or fails
    const picUrl = member.NAAS_PIC || 'https://www.assembly.go.kr/static/portal/img/openassm/default.jpg';

    // 1. Grid Card
    const card = document.createElement('article');
    card.className = 'member-card';
    card.innerHTML = `
      <div class="member-photo-wrapper">
        <img src="${picUrl}" alt="${member.NAAS_NM} 사진" loading="lazy" onerror="this.onerror=null; this.src='https://www.assembly.go.kr/static/portal/img/openassm/default.jpg';">
      </div>
      <div class="member-info-wrapper">
        <strong class="member-name">${member.NAAS_NM}</strong>
        <span class="member-party ${partyClass}">${activeParty}</span>
        <span class="member-district" title="${member.ELECD_NM || '비례대표'}">${member.ELECD_NM || '비례대표'}</span>
      </div>
    `;
    
    // Add Click listener to open modal details
    card.addEventListener('click', () => openModal(member));
    gridContainer.appendChild(card);

    // 2. Table Row
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><img class="table-photo" src="${picUrl}" alt="" onerror="this.onerror=null; this.src='https://www.assembly.go.kr/static/portal/img/openassm/default.jpg';"></td>
      <td><code>${member.NAAS_CD || '-'}</code></td>
      <td><strong>${member.NAAS_NM}</strong></td>
      <td>${member.NAAS_CH_NM || '-'}</td>
      <td><span class="member-party ${partyClass}">${activeParty}</span></td>
      <td>${member.ELECD_NM || '비례대표'}</td>
      <td><span class="member-district" title="${member.BLNG_CMIT_NM || member.CMIT_NM || '-'}">${member.BLNG_CMIT_NM || member.CMIT_NM || '-'}</span></td>
      <td>${member.GTELT_ERACO || '-'}</td>
    `;
    row.addEventListener('click', () => openModal(member));
    tableBody.appendChild(row);
  });
}

// Render pagination summary and toggling buttons
function renderPagination() {
  const maxPage = Math.ceil(state.totalItems / state.pageSize) || 1;
  const startNum = state.totalItems === 0 ? 0 : (state.currentPage - 1) * state.pageSize + 1;
  const endNum = Math.min(state.currentPage * state.pageSize, state.totalItems);

  paginationSummary.textContent = `${startNum} - ${endNum} / ${state.totalItems}건`;

  btnPagePrev.disabled = state.currentPage === 1;
  btnPageNext.disabled = state.currentPage === maxPage;
}

// Render Error
function renderError(message) {
  const errorHtml = `
    <div class="empty-state">
      <i class="fa-solid fa-triangle-exclamation" style="color: var(--accent-red);"></i>
      <p>${message}</p>
    </div>
  `;
  gridContainer.innerHTML = errorHtml;
  tableBody.innerHTML = `
    <tr>
      <td colspan="8" style="text-align: center; padding: 40px 0; color: var(--accent-red);">
        <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.5rem; margin-bottom: 12px; display: block; color: var(--accent-red);"></i>
        ${message}
      </td>
    </tr>
  `;
  paginationSummary.textContent = '0 - 0 / 0건';
  btnPagePrev.disabled = true;
  btnPageNext.disabled = true;
}

// Open Details Modal
function openModal(member) {
  const activeParty = cleanPartyName(member.PLPT_NM);
  
  // Set simple values
  document.getElementById('modal-photo').src = member.NAAS_PIC || 'https://www.assembly.go.kr/static/portal/img/openassm/default.jpg';
  document.getElementById('modal-name').textContent = member.NAAS_NM;
  document.getElementById('modal-hanja').textContent = member.NAAS_CH_NM ? `(${member.NAAS_CH_NM})` : '';
  document.getElementById('modal-eng').textContent = member.NAAS_EN_NM || '';
  
  const partyBadge = document.getElementById('modal-party');
  partyBadge.textContent = activeParty;
  partyBadge.className = 'modal-party-badge ' + getPartyClass(activeParty);

  document.getElementById('modal-birth').textContent = formatDate(member.BIRDY_DT);
  document.getElementById('modal-district').textContent = member.ELECD_NM || '비례대표';
  document.getElementById('modal-terms').textContent = member.GTELT_ERACO || '-';
  document.getElementById('modal-reelect').textContent = member.RLCT_DIV_NM || '초선';
  
  document.getElementById('modal-office').textContent = member.OFFM_RNUM_NO || '-';
  document.getElementById('modal-phone').textContent = member.NAAS_TEL_NO || '-';
  document.getElementById('modal-email').textContent = member.NAAS_EMAIL_ADDR || '-';
  
  const homepageLink = document.getElementById('modal-homepage');
  if (member.NAAS_HP_URL && member.NAAS_HP_URL.trim() !== '') {
    homepageLink.href = member.NAAS_HP_URL.trim();
    homepageLink.style.display = 'inline';
  } else {
    homepageLink.style.display = 'none';
  }

  // Helpers/Aides info
  document.getElementById('modal-aides').textContent = member.AIDE_NM || '-';
  
  // Split secretary columns
  const secName = member.CHF_SCRT_NM || '-';
  const secNames2 = member.SCRT_NM || '-';
  document.getElementById('modal-secretaries1').textContent = secName;
  document.getElementById('modal-secretaries2').textContent = secNames2;

  // Committees list
  document.getElementById('modal-committees').textContent = member.BLNG_CMIT_NM || member.CMIT_NM || '-';

  // Career Biography Bullet Points parsing
  const careerBox = document.getElementById('modal-career');
  careerBox.innerHTML = '';
  
  if (member.BRF_HST && member.BRF_HST.trim() !== '') {
    const lines = member.BRF_HST.split(/[\r\n]+/);
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed) {
        const item = document.createElement('div');
        item.className = 'modal-career-item';
        item.innerHTML = `<i class="fa-solid fa-check text-blue" style="margin-right: 8px; color: var(--accent-blue);"></i> ${trimmed}`;
        careerBox.appendChild(item);
      }
    });
  } else {
    careerBox.innerHTML = '<span class="loading-text">약력 정보가 존재하지 않습니다.</span>';
  }

  // Open modal animation
  detailModal.classList.add('open');
}

// Close Details Modal
function closeModal() {
  detailModal.classList.remove('open');
}

// Run on page load
document.addEventListener('DOMContentLoaded', init);
