document.addEventListener('DOMContentLoaded', () => {
  // Auth Elements
  const setupView = document.getElementById('setup-view');
  const loginView = document.getElementById('login-view');
  const dashboardView = document.getElementById('dashboard-view');
  
  const setupForm = document.getElementById('setup-form');
  const setupPassword = document.getElementById('setup-password');
  const setupPasswordConfirm = document.getElementById('setup-password-confirm');
  
  const loginForm = document.getElementById('login-form');
  const loginPassword = document.getElementById('login-password');
  
  // Dashboard Elements
  const appSearch = document.getElementById('app-search');
  const appListBody = document.getElementById('app-list-body');
  const btnSaveStatuses = document.getElementById('btn-save-statuses');
  const btnLogout = document.getElementById('btn-logout');
  
  const totalAppsCount = document.getElementById('total-apps-count');
  const activeAppsCount = document.getElementById('active-apps-count');
  const inactiveAppsCount = document.getElementById('inactive-apps-count');
  const soonAppsCount = document.getElementById('soon-apps-count');
  
  // Password Modal Elements
  const pwModal = document.getElementById('pw-modal');
  const btnOpenPwModal = document.getElementById('btn-open-pw-modal');
  const btnClosePwModal = document.getElementById('btn-close-pw-modal');
  const btnCancelPw = document.getElementById('btn-cancel-pw');
  const changePwForm = document.getElementById('change-pw-form');
  const currentPasswordInput = document.getElementById('current-password');
  const newPasswordInput = document.getElementById('new-password');
  const newPasswordConfirmInput = document.getElementById('new-password-confirm');
  
  // State
  let sessionToken = sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');
  let appMetadata = null;
  let appStatuses = {};
  let currentFilterText = '';

  // 1. Initial Access Check
  async function checkSetupState() {
    try {
      const res = await fetch('/api/admin/check-setup');
      const data = await res.json();
      
      if (!data.isSetup) {
        showView('setup');
      } else {
        if (sessionToken) {
          // Verify session or just show dashboard
          showView('dashboard');
          loadDashboardData();
        } else {
          showView('login');
        }
      }
    } catch (err) {
      showToast('서버 연결에 실패했습니다.', 'error');
    }
  }

  // View Manager
  function showView(view) {
    setupView.classList.add('hidden');
    loginView.classList.add('hidden');
    dashboardView.classList.add('hidden');
    
    if (view === 'setup') setupView.classList.remove('hidden');
    else if (view === 'login') loginView.classList.remove('hidden');
    else if (view === 'dashboard') dashboardView.classList.remove('hidden');
  }

  // 2. Setup Password Form Handler
  setupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw = setupPassword.value;
    const confirmPw = setupPasswordConfirm.value;
    
    if (pw !== confirmPw) {
      showToast('비밀번호가 일치하지 않습니다.', 'error');
      return;
    }
    
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw })
      });
      
      const data = await res.json();
      if (res.ok) {
        showToast('비밀번호가 성공적으로 설정되었습니다. 로그인을 해주세요.', 'success');
        showView('login');
      } else {
        showToast(data.error || '설정 저장에 실패했습니다.', 'error');
      }
    } catch (err) {
      showToast('네트워크 오류가 발생했습니다.', 'error');
    }
  });

  // 3. Login Form Handler
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw = loginPassword.value;
    
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw })
      });
      
      const data = await res.json();
      if (res.ok) {
        sessionToken = data.token;
        sessionStorage.setItem('admin_token', sessionToken);
        showToast('성공적으로 로그인했습니다.', 'success');
        showView('dashboard');
        loadDashboardData();
      } else {
        showToast(data.error || '로그인에 실패했습니다.', 'error');
      }
    } catch (err) {
      showToast('네트워크 오류가 발생했습니다.', 'error');
    }
  });

  // 4. Load Dashboard Data
  async function loadDashboardData() {
    try {
      const [listRes, statusRes] = await Promise.all([
        fetch('/api/admin/apps-list'),
        fetch('/api/apps/status')
      ]);
      
      if (!listRes.ok || !statusRes.ok) {
        if (listRes.status === 401 || statusRes.status === 401) {
          handleLogout();
          return;
        }
        throw new Error();
      }
      
      appMetadata = await listRes.json();
      appStatuses = await statusRes.json();
      
      renderAppList();
    } catch (err) {
      showToast('데이터를 가져오는 중 오류가 발생했습니다.', 'error');
    }
  }

  // Render App Grid/Table
  function renderAppList() {
    if (!appMetadata) return;
    
    appListBody.innerHTML = '';
    
    const appIds = Object.keys(appMetadata);
    
    appIds.forEach(id => {
      const app = appMetadata[id];
      const status = appStatuses[id] || 'active'; // Default active
      
      // Match query filter
      if (currentFilterText) {
        const query = currentFilterText.toLowerCase();
        const matchesName = app.name.toLowerCase().includes(query);
        const matchesId = id.toLowerCase().includes(query);
        if (!matchesName && !matchesId) return;
      }
      
      const tr = document.createElement('tr');
      tr.setAttribute('data-app-id', id);
      
      // Render status button options
      const activeSel = status === 'active' ? 'selected' : '';
      const inactiveSel = status === 'inactive' ? 'selected' : '';
      const soonSel = status === 'coming-soon' ? 'selected' : '';
      
      tr.innerHTML = `
        <td>
          <span class="app-name">${app.name}</span>
          <span class="app-tag-id">${id}</span>
        </td>
        <td><i class="${app.icon || 'fa-solid fa-cube'} app-icon-display"></i></td>
        <td><span class="app-category">${app.link.split('/')[1] || '기본'}</span></td>
        <td>
          <div class="status-selector">
            <button class="status-option ${activeSel}" data-status="active">액티브</button>
            <button class="status-option ${inactiveSel}" data-status="inactive">비액티브</button>
            <button class="status-option ${soonSel}" data-status="coming-soon">준비중</button>
          </div>
        </td>
      `;
      
      // Attach click events to the status buttons
      const buttons = tr.querySelectorAll('.status-option');
      buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          buttons.forEach(b => b.classList.remove('selected'));
          e.currentTarget.classList.add('selected');
          
          const newStatus = e.currentTarget.getAttribute('data-status');
          appStatuses[id] = newStatus;
          updateCounters();
        });
      });
      
      appListBody.appendChild(tr);
    });
    
    updateCounters();
  }

  // Update Summary Counts
  function updateCounters() {
    if (!appMetadata) return;
    
    const appIds = Object.keys(appMetadata);
    let total = appIds.length;
    let active = 0;
    let inactive = 0;
    let soon = 0;
    
    appIds.forEach(id => {
      const status = appStatuses[id] || 'active';
      if (status === 'active') active++;
      else if (status === 'inactive') inactive++;
      else if (status === 'coming-soon') soon++;
    });
    
    totalAppsCount.textContent = total;
    activeAppsCount.textContent = active;
    inactiveAppsCount.textContent = inactive;
    soonAppsCount.textContent = soon;
  }

  // Filter Event
  appSearch.addEventListener('input', (e) => {
    currentFilterText = e.target.value.trim();
    renderAppList();
  });

  // 5. Save Statuses Form Submit
  btnSaveStatuses.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/apps/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ statuses: appStatuses })
      });
      
      const data = await res.json();
      if (res.ok) {
        showToast('애플리케이션 상태 설정을 성공적으로 저장했습니다!', 'success');
      } else {
        showToast(data.error || '저장하지 못했습니다.', 'error');
        if (res.status === 401) handleLogout();
      }
    } catch (err) {
      showToast('네트워크 오류가 발생했습니다.', 'error');
    }
  });

  // 6. Logout Handler
  btnLogout.addEventListener('click', handleLogout);

  function handleLogout() {
    sessionToken = null;
    sessionStorage.removeItem('admin_token');
    localStorage.removeItem('admin_token');
    showToast('로그아웃되었습니다.', 'warning');
    showView('login');
    loginPassword.value = '';
  }

  // 7. Password Modal Dialog Handling
  btnOpenPwModal.addEventListener('click', () => {
    pwModal.classList.remove('hidden');
    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    newPasswordConfirmInput.value = '';
  });
  
  const closeModal = () => pwModal.classList.add('hidden');
  btnClosePwModal.addEventListener('click', closeModal);
  btnCancelPw.addEventListener('click', closeModal);
  
  changePwForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPw = currentPasswordInput.value;
    const newPw = newPasswordInput.value;
    const confirmNewPw = newPasswordConfirmInput.value;
    
    if (newPw !== confirmNewPw) {
      showToast('새 비밀번호가 서로 일치하지 않습니다.', 'error');
      return;
    }
    
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw })
      });
      
      const data = await res.json();
      if (res.ok) {
        showToast('비밀번호가 성공적으로 업데이트되었습니다.', 'success');
        closeModal();
      } else {
        showToast(data.error || '비밀번호 변경에 실패했습니다.', 'error');
        if (res.status === 401) handleLogout();
      }
    } catch (err) {
      showToast('네트워크 오류가 발생했습니다.', 'error');
    }
  });

  // Toast alert system
  function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'fa-circle-check';
    if (type === 'warning') icon = 'fa-triangle-exclamation';
    if (type === 'error') icon = 'fa-circle-xmark';

    toast.innerHTML = `
      <i class="fa-solid ${icon}"></i>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
    }, 3500);
  }

  // Initialize page check
  checkSetupState();
});
