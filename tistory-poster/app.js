document.addEventListener('DOMContentLoaded', () => {
  // --- UI Elements ---
  const btnToggleSettings = document.getElementById('btn-toggle-settings');
  const settingsSection = document.getElementById('settings-section');
  const settingsContentWrapper = document.getElementById('settings-content-wrapper');
  
  const inputDirectToken = document.getElementById('input-direct-token');
  const btnSaveDirectToken = document.getElementById('btn-save-direct-token');
  
  const inputClientId = document.getElementById('input-client-id');
  const inputClientSecret = document.getElementById('input-client-secret');
  const btnOauthLogin = document.getElementById('btn-oauth-login');
  const btnCopyUri = document.getElementById('btn-copy-uri');
  const oauthRedirectUriCode = document.getElementById('oauth-redirect-uri');
  
  const statusBanner = document.getElementById('status-banner');
  const statusText = statusBanner.querySelector('.status-text');
  const statusIcon = statusBanner.querySelector('.status-icon');
  
  const inputPostTitle = document.getElementById('input-post-title');
  const selectBlog = document.getElementById('select-blog');
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
  const resultBlogName = document.getElementById('result-blog-name');
  const resultPostId = document.getElementById('result-post-id');
  const btnViewPost = document.getElementById('btn-view-post');
  const btnCloseResult = document.getElementById('btn-close-result');
  
  const themeToggle = document.getElementById('theme-toggle');

  // --- App State ---
  let appState = {
    accessToken: localStorage.getItem('tistory_access_token') || '',
    clientId: localStorage.getItem('tistory_client_id') || '',
    clientSecret: localStorage.getItem('tistory_client_secret') || '',
    blogs: [],
    selectedBlogName: '',
    categories: []
  };

  // Pre-fill fields from localStorage
  if (appState.accessToken) {
    inputDirectToken.value = appState.accessToken;
  }
  if (appState.clientId) {
    inputClientId.value = appState.clientId;
  }
  if (appState.clientSecret) {
    inputClientSecret.value = appState.clientSecret;
  }

  // Set default Redirect URI text
  const currentRedirectUri = `${window.location.origin}/tistory-poster/index.html`;
  oauthRedirectUriCode.textContent = currentRedirectUri;

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

  // --- Copy Redirect URI ---
  btnCopyUri.addEventListener('click', () => {
    navigator.clipboard.writeText(currentRedirectUri).then(() => {
      const originalHtml = btnCopyUri.innerHTML;
      btnCopyUri.innerHTML = '<i class="fa-solid fa-check" style="color: #10b981;"></i>';
      setTimeout(() => {
        btnCopyUri.innerHTML = originalHtml;
      }, 1500);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
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
      
      // Move cursor right after the inserted text
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

  // --- Status Banner Update ---
  function updateConnectionUI(connected, message = '') {
    if (connected) {
      statusBanner.className = 'status-banner glass-panel positive';
      statusIcon.className = 'fa-solid fa-circle-check status-icon';
      statusText.innerHTML = `<strong>티스토리 연동이 완료되었습니다.</strong> (${message})`;
      
      // Enable selectors and buttons
      selectBlog.disabled = false;
      btnPublishPost.disabled = false;
    } else {
      statusBanner.className = 'status-banner glass-panel negative';
      statusIcon.className = 'fa-solid fa-circle-exclamation status-icon';
      statusText.innerHTML = `<strong>티스토리 연동이 되어있지 않습니다.</strong> 상단 설정 영역에서 Access Token을 입력하거나 OAuth 인증을 진행해 주세요.`;
      
      selectBlog.innerHTML = '<option value="">연동 후 블로그를 불러옵니다...</option>';
      selectBlog.disabled = true;
      selectCategory.innerHTML = '<option value="0">분류 없음 (기본값)</option>';
      selectCategory.disabled = true;
      btnPublishPost.disabled = true;
    }
  }

  // --- Direct Token Integration ---
  btnSaveDirectToken.addEventListener('click', () => {
    const token = inputDirectToken.value.trim();
    if (!token) {
      alert('Access Token을 입력하세요.');
      return;
    }
    
    appState.accessToken = token;
    localStorage.setItem('tistory_access_token', token);
    
    loadBlogsAndConfigure();
  });

  // --- OAuth Authorization Flow ---
  btnOauthLogin.addEventListener('click', () => {
    const clientId = inputClientId.value.trim();
    const clientSecret = inputClientSecret.value.trim();
    
    if (!clientId || !clientSecret) {
      alert('Client ID와 Secret Key를 모두 입력해야 합니다.');
      return;
    }
    
    // Save credentials to localStorage
    localStorage.setItem('tistory_client_id', clientId);
    localStorage.setItem('tistory_client_secret', clientSecret);
    
    // Redirect user to Tistory Authorize endpoint
    const redirectUrl = `${window.location.origin}/tistory-poster/index.html`;
    const authUrl = `https://www.tistory.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code`;
    
    window.location.href = authUrl;
  });

  // --- Check URL for OAuth code parameter ---
  const checkOAuthCode = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      const clientId = localStorage.getItem('tistory_client_id');
      const clientSecret = localStorage.getItem('tistory_client_secret');
      
      if (!clientId || !clientSecret) {
        alert('로컬 저장소에 저장된 Client ID 또는 Secret Key를 찾을 수 없습니다. 다시 시도해 주세요.');
        // Clean up URL parameters
        history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      
      showLoader('티스토리 서버에서 토큰을 발급받는 중입니다...');
      
      try {
        const redirectUrl = `${window.location.origin}/tistory-poster/index.html`;
        const response = await fetch('/api/tistory/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUrl,
            code: code
          })
        });
        
        const data = await response.json();
        hideLoader();
        
        if (data.success && data.access_token) {
          appState.accessToken = data.access_token;
          localStorage.setItem('tistory_access_token', data.access_token);
          inputDirectToken.value = data.access_token;
          
          alert('인증에 성공하여 Access Token이 발급되었습니다!');
          
          // Clean up URL parameters
          history.replaceState({}, document.title, window.location.pathname);
          
          // Collapse settings card
          settingsSection.classList.add('collapsed');
          
          loadBlogsAndConfigure();
        } else {
          alert('토큰 발급 실패: ' + (data.error || '알 수 없는 에러'));
          history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (err) {
        hideLoader();
        console.error(err);
        alert('토큰 교환 과정에서 에러가 발생했습니다: ' + err.message);
        history.replaceState({}, document.title, window.location.pathname);
      }
    }
  };

  // --- Load Blogs & Categories ---
  const loadBlogsAndConfigure = async () => {
    if (!appState.accessToken) return;
    
    showLoader('연동된 티스토리 블로그 목록을 가져오고 있습니다...');
    
    try {
      const response = await fetch(`/api/tistory/blogs?access_token=${appState.accessToken}`);
      const data = await response.json();
      hideLoader();
      
      if (data.tistory && data.tistory.status === '200' && data.tistory.item && data.tistory.item.blogs) {
        const blogsList = data.tistory.item.blogs;
        appState.blogs = Array.isArray(blogsList) ? blogsList : [blogsList];
        
        if (appState.blogs.length > 0) {
          // Clear dropdown and populate
          selectBlog.innerHTML = '';
          appState.blogs.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b.name; // This is the blogName sub-domain (e.g. 'mine')
            opt.textContent = `${b.title} (${b.url})`;
            selectBlog.appendChild(opt);
          });
          
          const primaryBlog = appState.blogs[0];
          appState.selectedBlogName = primaryBlog.name;
          
          updateConnectionUI(true, `블로그: ${primaryBlog.title}`);
          
          // Load categories for the first blog
          loadCategories(primaryBlog.name);
          
          // Collapse settings card
          settingsSection.classList.add('collapsed');
        } else {
          updateConnectionUI(false);
          alert('연동은 성공했으나 계정에 연결된 블로그를 찾을 수 없습니다.');
        }
      } else {
        const errorDetail = data.tistory?.errorMessage || data.error || '잘못된 Access Token이거나 API 요청에 오류가 있습니다.';
        updateConnectionUI(false);
        alert('블로그 조회 실패: ' + errorDetail);
      }
    } catch (err) {
      hideLoader();
      updateConnectionUI(false);
      alert('블로그 조회 오류: ' + err.message);
    }
  };

  // Select blog change listener
  selectBlog.addEventListener('change', (e) => {
    const blogName = e.target.value;
    if (blogName) {
      appState.selectedBlogName = blogName;
      loadCategories(blogName);
    }
  });

  const loadCategories = async (blogName) => {
    if (!appState.accessToken || !blogName) return;
    
    selectCategory.innerHTML = '<option value="0">분류 로딩 중...</option>';
    selectCategory.disabled = true;
    
    try {
      const response = await fetch(`/api/tistory/categories?access_token=${appState.accessToken}&blogName=${blogName}`);
      const data = await response.json();
      
      if (data.tistory && data.tistory.status === '200') {
        const categoriesList = data.tistory.item.categories || [];
        appState.categories = Array.isArray(categoriesList) ? categoriesList : [categoriesList];
        
        selectCategory.innerHTML = '<option value="0">분류 없음 (기본값)</option>';
        appState.categories.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.id;
          opt.textContent = c.label;
          selectCategory.appendChild(opt);
        });
        selectCategory.disabled = false;
      } else {
        selectCategory.innerHTML = '<option value="0">분류 로드 실패 (기본값)</option>';
        selectCategory.disabled = false;
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      selectCategory.innerHTML = '<option value="0">분류 조회 오류 (기본값)</option>';
      selectCategory.disabled = false;
    }
  };

  // --- Publish Post ---
  btnPublishPost.addEventListener('click', async () => {
    const title = inputPostTitle.value.trim();
    const content = textareaHtmlContent.value.trim();
    const blogName = appState.selectedBlogName;
    const category = selectCategory.value || '0';
    const tag = inputTags.value.trim();
    const visibility = document.querySelector('input[name="post-visibility"]:checked').value;
    
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
    
    if (!blogName) {
      alert('발행할 블로그를 선택해 주세요.');
      return;
    }
    
    showLoader('티스토리에 게시글을 업로드하고 있습니다...');
    
    try {
      const response = await fetch('/api/tistory/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_token: appState.accessToken,
          blogName: blogName,
          title: title,
          content: content,
          visibility: parseInt(visibility),
          category: parseInt(category),
          tag: tag
        })
      });
      
      const data = await response.json();
      hideLoader();
      
      if (data.tistory && data.tistory.status === '200') {
        const postId = data.tistory.postId;
        const postUrl = data.tistory.url;
        
        // Populate result modal details
        resultBlogName.textContent = blogName;
        resultPostId.textContent = postId;
        btnViewPost.href = postUrl;
        
        // Show result modal
        resultModal.style.display = 'flex';
      } else {
        const errorMsg = data.tistory?.errorMessage || data.error || '게시글 발행 과정에 예상치 못한 응답이 왔습니다.';
        alert('발행 실패: ' + errorMsg);
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

  // --- Modal Helper Functions ---
  function showLoader(text) {
    loadingText.textContent = text;
    loadingOverlay.style.display = 'flex';
  }

  function hideLoader() {
    loadingOverlay.style.display = 'none';
  }

  // Initialize checks
  const init = async () => {
    renderPreview();
    await checkOAuthCode();
    if (appState.accessToken) {
      loadBlogsAndConfigure();
    }
  };

  init();
});
