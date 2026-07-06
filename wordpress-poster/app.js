document.addEventListener('DOMContentLoaded', () => {
  // --- UI Elements ---
  const btnToggleSettings = document.getElementById('btn-toggle-settings');
  const settingsSection = document.getElementById('settings-section');
  const settingsContentWrapper = document.getElementById('settings-content-wrapper');
  
  const inputSiteUrl = document.getElementById('input-site-url');
  const inputUsername = document.getElementById('input-username');
  const inputAppPassword = document.getElementById('input-app-password');
  const btnConnect = document.getElementById('btn-connect');
  const btnDisconnect = document.getElementById('btn-disconnect');
  
  const statusBanner = document.getElementById('status-banner');
  const statusText = statusBanner.querySelector('.status-text');
  const statusIcon = statusBanner.querySelector('.status-icon');
  
  const inputPostTitle = document.getElementById('input-post-title');
  const selectCategory = document.getElementById('select-category');
  const textareaHtmlContent = document.getElementById('textarea-html-content');
  const charCounter = document.getElementById('char-counter');
  const inputTags = document.getElementById('input-tags');
  
  const fileImport = document.getElementById('file-import');
  const btnPublishPost = document.getElementById('btn-publish-post');
  
  const previewIframe = document.getElementById('preview-iframe');
  const btnDeviceToggles = document.querySelectorAll('.btn-device-toggle');
  const previewFrameWrapper = document.getElementById('preview-frame-wrapper');
  
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingText = document.getElementById('loading-text');
  const resultModal = document.getElementById('result-modal');
  const resultSiteUrl = document.getElementById('result-site-url');
  const resultPostId = document.getElementById('result-post-id');
  const btnViewPost = document.getElementById('btn-view-post');
  const btnCloseResult = document.getElementById('btn-close-result');
  
  const themeToggle = document.getElementById('theme-toggle');

  // --- App State ---
  let appState = {
    siteUrl: localStorage.getItem('wp_site_url') || '',
    username: localStorage.getItem('wp_username') || '',
    appPassword: localStorage.getItem('wp_app_password') || '',
    categories: [],
    isConnected: false
  };

  // Pre-fill input fields
  if (appState.siteUrl) inputSiteUrl.value = appState.siteUrl;
  if (appState.username) inputUsername.value = appState.username;
  if (appState.appPassword) inputAppPassword.value = appState.appPassword;

  // --- Theme Toggle ---
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeButton(savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
  });

  function updateThemeButton(theme) {
    if (theme === 'light') {
      themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i> <span>다크</span>';
    } else {
      themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i> <span>라이트</span>';
    }
  }

  // --- Toggle Settings Card ---
  btnToggleSettings.addEventListener('click', () => {
    settingsSection.classList.toggle('collapsed');
  });

  // --- Live Preview Renderer ---
  let debounceTimer;
  const renderPreview = () => {
    const htmlContent = textareaHtmlContent.value;
    const template = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
            color: #333333;
            line-height: 1.7;
            padding: 20px;
            margin: 0;
            background-color: #ffffff;
          }
          img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 10px auto;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
          }
          th, td {
            border: 1px solid #dddddd;
            padding: 10px;
            font-size: 0.9rem;
          }
          th {
            background-color: #f8fafc;
            font-weight: bold;
          }
          pre {
            background-color: #f1f5f9;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            font-family: Consolas, Monaco, monospace;
            font-size: 0.85rem;
            border: 1px solid #e2e8f0;
          }
          blockquote {
            border-left: 4px solid #a855f7;
            padding-left: 15px;
            color: #475569;
            margin: 1.5rem 0;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        ${htmlContent || '<div style="color: #94a3b8; text-align: center; padding-top: 100px; font-family: sans-serif;">HTML 소스 코드를 입력하시면 실시간 미리보기가 여기에 표시됩니다.</div>'}
      </body>
      </html>
    `;
    previewIframe.srcdoc = template;
    charCounter.textContent = `${htmlContent.length} 자`;
  };

  textareaHtmlContent.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(renderPreview, 300);
  });

  // --- Preset Template Insert ---
  const templates = {
    header: '<h2>여기에 대제목을 입력하세요</h2>\n<p>본문 내용을 채워 넣어 보세요.</p>\n',
    alert: '<div style="background-color: rgba(168, 85, 247, 0.08); border-left: 4px solid #a855f7; padding: 1.25rem; margin: 1.5rem 0; color: #1e1b4b; border-radius: 6px;">\n  <strong style="color: #7e22ce;">💡 안내:</strong> 중요 안내 사항이나 설명글을 이곳에 채워 넣으세요.\n</div>\n',
    table: `<table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0; text-align: left;">
  <thead>
    <tr style="background-color: #f1f5f9;">
      <th style="border: 1px solid #cbd5e1; padding: 12px; font-weight: 600;">비교 항목</th>
      <th style="border: 1px solid #cbd5e1; padding: 12px; font-weight: 600;">특징 A</th>
      <th style="border: 1px solid #cbd5e1; padding: 12px; font-weight: 600;">특징 B</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #cbd5e1; padding: 12px; font-weight: 600; background-color: #f8fafc;">성능</td>
      <td style="border: 1px solid #cbd5e1; padding: 12px;">매우 우수함</td>
      <td style="border: 1px solid #cbd5e1; padding: 12px;">보통 수준</td>
    </tr>
    <tr>
      <td style="border: 1px solid #cbd5e1; padding: 12px; font-weight: 600; background-color: #f8fafc;">가격</td>
      <td style="border: 1px solid #cbd5e1; padding: 12px;">합리적임</td>
      <td style="border: 1px solid #cbd5e1; padding: 12px;">높음</td>
    </tr>
  </tbody>
</table>\n`,
    card: `<div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin: 1.5rem 0; background-color: #ffffff;">
  <h3 style="margin-top: 0; color: #0f172a; font-size: 1.15rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">📌 요약 카드</h3>
  <p style="color: #475569; margin: 0; font-size: 0.9rem; line-height: 1.6;">여기에 중요한 요약 설명이나 강조 문구를 작성하세요. 깔끔한 디자인으로 가독성을 높여줍니다.</p>
</div>\n`,
    link: '<div style="text-align: center; margin: 1.5rem 0;">\n  <a href="https://example.com" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%); color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 30px; font-weight: 700; font-size: 0.95rem; box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3); transition: transform 0.2s;">바로가기 버튼 링크</a>\n</div>\n'
  };

  document.querySelectorAll('.btn-template').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-template');
      const snippet = templates[type] || '';
      
      const startPos = textareaHtmlContent.selectionStart;
      const endPos = textareaHtmlContent.selectionEnd;
      const originalText = textareaHtmlContent.value;
      
      textareaHtmlContent.value = originalText.substring(0, startPos) + snippet + originalText.substring(endPos);
      textareaHtmlContent.focus();
      
      const newCursorPos = startPos + snippet.length;
      textareaHtmlContent.setSelectionRange(newCursorPos, newCursorPos);
      
      renderPreview();
    });
  });

  // --- Drag & Drop HTML Import ---
  textareaHtmlContent.addEventListener('dragover', (e) => {
    e.preventDefault();
    textareaHtmlContent.style.borderColor = 'var(--accent-color)';
  });

  textareaHtmlContent.addEventListener('dragleave', () => {
    textareaHtmlContent.style.borderColor = 'var(--panel-border)';
  });

  textareaHtmlContent.addEventListener('drop', (e) => {
    e.preventDefault();
    textareaHtmlContent.style.borderColor = 'var(--panel-border)';
    
    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      importFile(file);
    }
  });

  // --- File Upload Input ---
  fileImport.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      importFile(file);
    }
  });

  function importFile(file) {
    if (!file.name.endsWith('.html') && !file.name.endsWith('.txt')) {
      alert('HTML 또는 텍스트 파일만 불러올 수 있습니다.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      textareaHtmlContent.value = event.target.result;
      renderPreview();
    };
    reader.readAsText(file);
  }

  // --- Device Layout Switcher ---
  btnDeviceToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      btnDeviceToggles.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const device = btn.getAttribute('data-device');
      previewFrameWrapper.className = `preview-container ${device}`;
    });
  });

  // --- Connection Status Banner Update ---
  function updateConnectionUI(connected, message = '') {
    appState.isConnected = connected;
    
    if (connected) {
      statusBanner.className = 'status-banner glass-panel positive';
      statusIcon.className = 'fa-solid fa-circle-check status-icon';
      statusText.innerHTML = `<strong>워드프레스 연동이 완료되었습니다.</strong> (${message})`;
      
      btnDisconnect.style.display = 'inline-flex';
      selectCategory.disabled = false;
      btnPublishPost.disabled = false;
    } else {
      statusBanner.className = 'status-banner glass-panel negative';
      statusIcon.className = 'fa-solid fa-circle-exclamation status-icon';
      statusText.innerHTML = `<strong>워드프레스 연동이 되어있지 않습니다.</strong> 상단 설정 영역에서 사이트 정보 및 애플리케이션 비밀번호를 입력 후 검증해 주세요.`;
      
      btnDisconnect.style.display = 'none';
      selectCategory.innerHTML = '<option value="">연동 후 카테고리를 불러옵니다...</option>';
      selectCategory.disabled = true;
      btnPublishPost.disabled = true;
    }
  }

  // --- Test & Connect Site ---
  btnConnect.addEventListener('click', async () => {
    const siteUrl = inputSiteUrl.value.trim();
    const username = inputUsername.value.trim();
    const appPassword = inputAppPassword.value.trim();
    
    if (!siteUrl || !username || !appPassword) {
      alert('워드프레스 사이트 주소, 사용자명, 애플리케이션 비밀번호를 모두 입력해 주세요.');
      return;
    }
    
    showLoader('워드프레스 주소 및 인증 정보를 검증 중입니다...');
    
    try {
      const response = await fetch('/api/wordpress/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ siteUrl, username, appPassword })
      });
      
      const data = await response.json();
      hideLoader();
      
      if (response.ok && data.success) {
        // Save to state & localStorage
        appState.siteUrl = data.siteUrl; // Cleaned url
        appState.username = username;
        appState.appPassword = appPassword;
        
        localStorage.setItem('wp_site_url', data.siteUrl);
        localStorage.setItem('wp_username', username);
        localStorage.setItem('wp_app_password', appPassword);
        
        // Refresh values with cleaned URL
        inputSiteUrl.value = data.siteUrl;
        
        const welcomeMessage = `${data.user.name || username}님 계정 연결됨`;
        updateConnectionUI(true, welcomeMessage);
        
        // Load Categories
        loadCategories();
        
        // Collapse settings card
        settingsSection.classList.add('collapsed');
      } else {
        const errMsg = data.details?.message || data.error || '잘못된 계정 정보이거나 워드프레스 REST API 연결이 차단되었습니다.';
        updateConnectionUI(false);
        alert('연결 실패: ' + errMsg);
      }
    } catch (err) {
      hideLoader();
      updateConnectionUI(false);
      alert('서버 요청 오류: ' + err.message);
    }
  });

  // --- Disconnect WordPress ---
  btnDisconnect.addEventListener('click', () => {
    localStorage.removeItem('wp_site_url');
    localStorage.removeItem('wp_username');
    localStorage.removeItem('wp_app_password');
    
    appState.siteUrl = '';
    appState.username = '';
    appState.appPassword = '';
    
    inputSiteUrl.value = '';
    inputUsername.value = '';
    inputAppPassword.value = '';
    
    updateConnectionUI(false);
    settingsSection.classList.remove('collapsed');
  });

  // --- Load Categories ---
  const loadCategories = async () => {
    if (!appState.siteUrl || !appState.username || !appState.appPassword) return;
    
    selectCategory.innerHTML = '<option value="">카테고리 로딩 중...</option>';
    selectCategory.disabled = true;
    
    try {
      const urlParams = new URLSearchParams({
        siteUrl: appState.siteUrl,
        username: appState.username,
        appPassword: appState.appPassword
      });
      
      const response = await fetch(`/api/wordpress/categories?${urlParams.toString()}`);
      const data = await response.json();
      
      if (response.ok && Array.isArray(data)) {
        appState.categories = data;
        selectCategory.innerHTML = '<option value="">선택 안 함 (기본값)</option>';
        
        appState.categories.forEach(cat => {
          const opt = document.createElement('option');
          opt.value = cat.id;
          opt.textContent = cat.name;
          selectCategory.appendChild(opt);
        });
        selectCategory.disabled = false;
      } else {
        selectCategory.innerHTML = '<option value="">카테고리 조회 실패 (기본 카테고리로 발행)</option>';
        selectCategory.disabled = false;
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      selectCategory.innerHTML = '<option value="">카테고리 오류 (기본 카테고리로 발행)</option>';
      selectCategory.disabled = false;
    }
  };

  // --- Publish Post ---
  btnPublishPost.addEventListener('click', async () => {
    const title = inputPostTitle.value.trim();
    const content = textareaHtmlContent.value.trim();
    const categoryVal = selectCategory.value;
    const tag = inputTags.value.trim();
    const status = document.querySelector('input[name="post-status"]:checked').value;
    
    if (!title) {
      alert('글 제목을 입력해 주세요.');
      inputPostTitle.focus();
      return;
    }
    
    if (!content) {
      alert('글 본문(HTML 내용)을 작성하거나 불러와 주세요.');
      textareaHtmlContent.focus();
      return;
    }
    
    if (!appState.siteUrl || !appState.username || !appState.appPassword) {
      alert('워드프레스 계정 연동 정보가 설정되어 있지 않습니다.');
      return;
    }
    
    showLoader('워드프레스에 포스트를 발행하는 중입니다...');
    
    try {
      const payload = {
        siteUrl: appState.siteUrl,
        username: appState.username,
        appPassword: appState.appPassword,
        title: title,
        content: content,
        status: status,
        tags: tag
      };
      
      // If a specific category was selected, map to an array
      if (categoryVal) {
        payload.categories = [parseInt(categoryVal, 10)];
      }
      
      const response = await fetch('/api/wordpress/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      hideLoader();
      
      if (response.ok && data.success) {
        // Populate modal details
        resultSiteUrl.textContent = appState.siteUrl;
        resultPostId.textContent = data.postId;
        btnViewPost.href = data.postUrl;
        
        // Display result modal
        resultModal.style.display = 'flex';
      } else {
        const errorDetail = data.details?.message || data.error || '게시글 발행 도중 알 수 없는 에러가 발생했습니다.';
        alert('발행 실패: ' + errorDetail);
      }
    } catch (err) {
      hideLoader();
      alert('발행 요청 실패: ' + err.message);
    }
  });

  // --- Close Result Modal ---
  btnCloseResult.addEventListener('click', () => {
    resultModal.style.display = 'none';
  });

  // --- Modal Helpers ---
  function showLoader(text) {
    loadingText.textContent = text;
    loadingOverlay.style.display = 'flex';
  }

  function hideLoader() {
    loadingOverlay.style.display = 'none';
  }

  // --- Initialize App ---
  const init = () => {
    renderPreview();
    if (appState.siteUrl && appState.username && appState.appPassword) {
      // Auto connect
      updateConnectionUI(true, '인증 정보 로드됨');
      loadCategories();
      settingsSection.classList.add('collapsed');
    }
  };

  init();
});
