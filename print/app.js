/**
 * CineAHO Web Print Editor App Engine
 * Re-creation of PrintWhatYouLike.com
 */

// Sound Synthesizer using Web Audio API
const SoundEngine = {
  ctx: null,

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio not supported", e);
    }
  },

  play(type) {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    const baseGain = 0.08;

    switch (type) {
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, t);
        gainNode.gain.setValueAtTime(baseGain * 0.3, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
        osc.start(t);
        osc.stop(t + 0.04);
        break;
    }
  }
};

const App = {
  state: {
    view: 'LOBBY', // LOBBY, EDITOR
    currentUrl: '',
    undoStack: [], // Array of history states: { type, parent, node, nextSibling, oldHTML }
    redoStack: [],
    
    // Formatter settings
    hideImages: false,
    stripBackgrounds: true,
    fontSize: 'font-size-md',
    fontFamily: 'font-family-default',
    pageWidth: 'page-width-medium',
    
    // Direct controls
    clickToDelete: true,
    directEdit: false,
    
    // Element currently hovered
    hoveredElement: null
  },

  // DOM Elements
  lobbyViewEl: null,
  editorViewEl: null,
  portalHeaderEl: null,
  sandboxCanvasEl: null,
  canvasContainerEl: null,
  hoverToolbarEl: null,
  urlInputEl: null,

  init() {
    this.lobbyViewEl = document.getElementById('lobby-view');
    this.editorViewEl = document.getElementById('editor-view');
    this.portalHeaderEl = document.getElementById('portal-header');
    this.sandboxCanvasEl = document.getElementById('sandbox-canvas');
    this.canvasContainerEl = document.getElementById('canvas-container');
    this.hoverToolbarEl = document.getElementById('hover-toolbar');
    this.urlInputEl = document.getElementById('target-url');

    this.bindEvents();
  },

  bindEvents() {
    // START Button click
    document.getElementById('btn-start-print').addEventListener('click', () => {
      const url = this.urlInputEl.value.trim();
      if (!url) {
        alert("URL을 입력해 주세요!");
        return;
      }
      this.loadUrl(url);
    });

    // Start with Enter Key
    this.urlInputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('btn-start-print').click();
      }
    });

    // Try The Demo button
    document.getElementById('btn-hero-demo').addEventListener('click', () => {
      this.loadDemo('news');
    });

    // Demo cards triggers
    document.querySelectorAll('.demo-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const demoType = btn.getAttribute('data-demo');
        this.loadDemo(demoType);
      });
    });

    // Custom HTML Paste start
    document.getElementById('btn-start-custom-html').addEventListener('click', () => {
      const htmlCode = document.getElementById('custom-html-input').value.trim();
      if (!htmlCode) {
        alert("HTML 코드 또는 텍스트를 입력해 주세요!");
        return;
      }
      this.loadCustomHTML(htmlCode);
    });

    // Sidebar Toggles
    document.getElementById('toggle-hide-images').addEventListener('change', (e) => {
      this.state.hideImages = e.target.checked;
      this.applyFormatting();
    });

    document.getElementById('toggle-strip-backgrounds').addEventListener('change', (e) => {
      this.state.stripBackgrounds = e.target.checked;
      this.applyFormatting();
    });

    // Sidebar Dropdowns
    document.getElementById('select-font-size').addEventListener('change', (e) => {
      this.state.fontSize = e.target.value;
      this.applyFormatting();
    });

    document.getElementById('select-font-family').addEventListener('change', (e) => {
      this.state.fontFamily = e.target.value;
      this.applyFormatting();
    });

    document.getElementById('select-page-width').addEventListener('change', (e) => {
      this.state.pageWidth = e.target.value;
      this.applyFormatting();
    });

    // Direct edit check
    document.getElementById('toggle-direct-edit').addEventListener('change', (e) => {
      this.state.directEdit = e.target.checked;
      this.sandboxCanvasEl.setAttribute('contenteditable', this.state.directEdit ? 'true' : 'false');
      if (this.state.directEdit) {
        // Disable outline hover temporarily
        this.sandboxCanvasEl.classList.remove('hover-delete-enabled');
        this.hoverToolbarEl.classList.add('hidden');
      } else {
        if (this.state.clickToDelete) {
          this.sandboxCanvasEl.classList.add('hover-delete-enabled');
        }
      }
    });

    document.getElementById('toggle-click-delete').addEventListener('change', (e) => {
      this.state.clickToDelete = e.target.checked;
      if (this.state.clickToDelete && !this.state.directEdit) {
        this.sandboxCanvasEl.classList.add('hover-delete-enabled');
      } else {
        this.sandboxCanvasEl.classList.remove('hover-delete-enabled');
        this.hoverToolbarEl.classList.add('hidden');
      }
    });

    // Auto Clean Ads
    document.getElementById('btn-auto-clean').addEventListener('click', () => {
      this.autoCleanPage();
    });

    // Undo / Redo Click
    document.getElementById('btn-editor-undo').addEventListener('click', () => {
      this.triggerUndo();
    });

    document.getElementById('btn-editor-redo').addEventListener('click', () => {
      this.triggerRedo();
    });

    // Print
    document.getElementById('btn-trigger-print').addEventListener('click', () => {
      window.print();
    });

    // PDF mock trigger
    document.getElementById('btn-trigger-pdf').addEventListener('click', () => {
      alert("브라우저 인쇄 창이 뜨면 대상(Destination)을 'PDF로 저장 (Save as PDF)'으로 지정하여 저장해 주세요.");
      window.print();
    });

    // Exit Editor
    document.getElementById('btn-exit-editor').addEventListener('click', () => {
      if (confirm("웹페이지 편집 상태가 유실됩니다. 나가시겠습니까?")) {
        this.exitEditor();
      }
    });

    // Interactive Hover outline trackers on canvas
    this.sandboxCanvasEl.addEventListener('mousemove', (e) => {
      this.handleCanvasMouseMove(e);
    });

    this.sandboxCanvasEl.addEventListener('mouseleave', () => {
      this.hoverToolbarEl.classList.add('hidden');
      this.state.hoveredElement = null;
    });

    // Element selection clicking (for delete / isolate actions)
    this.sandboxCanvasEl.addEventListener('click', (e) => {
      this.handleCanvasClick(e);
    });

    // Toolbar buttons re-bind
    document.getElementById('btn-tool-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.state.hoveredElement) {
        this.deleteElement(this.state.hoveredElement);
      }
    });

    document.getElementById('btn-tool-isolate').addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.state.hoveredElement) {
        this.isolateElement(this.state.hoveredElement);
      }
    });
  },

  // CORS Page Loader
  loadUrl(url) {
    // Add protocol if missing
    let targetUrl = url;
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'http://' + targetUrl;
    }

    this.state.currentUrl = targetUrl;
    
    // Show Loading
    document.getElementById('btn-start-print').textContent = "불러오는 중...";
    document.getElementById('btn-start-print').disabled = true;

    // Use allorigins CORS Proxy
    fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`)
      .then(response => {
        if (response.ok) return response.json();
        throw new Error('Network response was not ok.');
      })
      .then(data => {
        let html = data.contents;
        
        // Clean relative paths to absolute using base URL
        html = this.resolveRelativeUrls(html, targetUrl);

        // Load into sandbox
        this.sandboxCanvasEl.innerHTML = html;

        // Enter Editor View
        this.enterEditor();
      })
      .catch(error => {
        console.error("CORS Load failed", error);
        alert("웹페이지를 불러오는 데 실패했습니다.\n대상 사이트의 방화벽 또는 CORS 프록시 한계 때문일 수 있습니다. 데모 페이지를 시험하거나 HTML 붙여넣기를 사용해 보세요!");
      })
      .finally(() => {
        document.getElementById('btn-start-print').textContent = "START";
        document.getElementById('btn-start-print').disabled = false;
      });
  },

  resolveRelativeUrls(html, baseUrlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const base = new URL(baseUrlString);

    // Update relative img src, link href, script src
    doc.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('data:') && !src.startsWith('http')) {
        img.src = new URL(src, base).href;
      }
    });

    doc.querySelectorAll('link').forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http')) {
        link.href = new URL(href, base).href;
      }
    });

    doc.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('#')) {
        a.href = new URL(href, base).href;
      }
    });

    return doc.documentElement.innerHTML;
  },

  loadDemo(type) {
    let demoHtml = '';
    
    if (type === 'news') {
      demoHtml = `
        <div style="padding: 10px; font-family: sans-serif;">
          <!-- Breaking Pop-up -->
          <div class="pwl-ad pwl-popup" style="background:#fee2e2; border:3px solid #ef4444; border-radius:8px; padding:20px; margin-bottom:20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); position:relative;">
            <h4 style="color:#b91c1c; margin-bottom:5px;"><i class="fa-solid fa-triangle-exclamation"></i> 경고 팝업 광고</h4>
            <p style="font-size:0.85rem; color:#7f1d1d;">"구독자 특별 할인 혜택이 단 1시간 남았습니다!"</p>
            <button style="position:absolute; top:10px; right:10px; border:none; background:none; font-weight:700; cursor:pointer;" onclick="this.parentElement.remove();">X</button>
          </div>

          <!-- Ad Banner Top -->
          <div class="pwl-ad banner-ad" style="background: #eff6ff; border:1px dashed #3b82f6; padding:30px; text-align:center; margin-bottom:20px; border-radius:6px; color:#1d4ed8;">
            <strong>[광고] 2026 대한민국 연봉 상승 비결 전자책 출시! 무료 다운로드</strong>
          </div>

          <header style="border-bottom:3px solid #1e293b; padding-bottom:10px; margin-bottom:20px;">
            <h1 style="font-size:2.2rem; color:#0f172a;">한경비즈니스 뉴스포털</h1>
            <span style="color:#64748b; font-size:0.8rem;">발행일: 2026년 06월 01일 | 카테고리: 경제/IT</span>
          </header>

          <!-- Sidebar Layout -->
          <div style="display: flex; gap: 20px;">
            <!-- Main Content -->
            <div class="main-article-body" style="flex: 1.4;">
              <h2 style="font-size:1.6rem; color:#1e293b; margin-bottom:15px;">인공지능 개발 환경의 대격변, 핵심 도구 비교분석</h2>
              
              <p style="margin-bottom:1rem; color:#334155; line-height:1.6;">
                최근 소프트웨어 개발 생태계에서 에이전트 인공지능(AI Agent)의 가동 비중이 70%를 상회하면서, 기존 IDE와 코딩 어시스턴트 툴 간의 경쟁이 새로운 국면에 접어들었습니다. 특히 실시간 코딩 제안뿐만 아니라, 시스템 단의 쉘 스크립트 실행 권한 및 자율적 파일 마운트 제어를 지닌 고성능 에이전트가 각광받고 있습니다.
              </p>

              <!-- Inner Ad -->
              <div class="pwl-ad inline-ad" style="background:#fef3c7; border-left:4px solid #f59e0b; padding:15px; margin:20px 0; font-size:0.85rem; color:#78350f;">
                <strong>💡 이 기사와 함께 읽는 인기 스폰서 링크:</strong><br>
                1. 코딩 없이 만드는 나만의 AI 웹 사이트 솔루션<br>
                2. 전 세계 상위 1% 개발자들이 선택한 기계식 키보드 공동구매
              </div>

              <p style="margin-bottom:1rem; color:#334155; line-height:1.6;">
                전문가들은 향후 5년 내에 기획 및 검증, 그리고 문서화(Walkthrough)의 95%가 자율형 어시스턴트에 의해 전결 처리될 것으로 전망합니다. 개발자의 역할은 점차 비즈니스 아키텍처 조율과 프롬프트 보안 무결성 검증으로 시프트될 것입니다.
              </p>
            </div>

            <!-- Sidebar -->
            <aside class="pwl-sidebar" style="width: 250px; background:#f8fafc; border:1px solid #e2e8f0; padding:15px; border-radius:8px; align-self: flex-start;">
              <h4 style="font-size:0.85rem; color:#475569; border-bottom:1px solid #cbd5e1; padding-bottom:5px; margin-bottom:10px;">실시간 인기 기사</h4>
              <ul style="list-style:none; font-size:0.8rem; display:flex; flex-direction:column; gap:8px;">
                <li><a href="#" style="color:#0284c7; text-decoration:none;">1. 금리 인하 수혜주 분석 TOP 5</a></li>
                <li><a href="#" style="color:#0284c7; text-decoration:none;">2. 차세대 그래픽카드 전력 문제 발생</a></li>
                <li><a href="#" style="color:#0284c7; text-decoration:none;">3. 전세사기 예방 특약 넣는 법</a></li>
              </ul>
              
              <!-- Sidebar AD Banner -->
              <div class="pwl-ad sidebar-ad" style="background:#fee2e2; border:1px solid #fca5a5; margin-top:20px; padding:20px; text-align:center; font-size:0.78rem; border-radius:4px; color:#b91c1c;">
                <strong>[AD] 한 달 9,900원 건강기능식품 정기구독 서비스 신청</strong>
              </div>
            </aside>
          </div>

          <!-- Bottom Comments -->
          <footer style="margin-top: 40px; border-top: 2px solid #cbd5e1; padding-top:20px;">
            <h4 style="color:#1e293b; margin-bottom:10px;">독자 한줄평 (3개)</h4>
            <div style="font-size:0.8rem; color:#475569; display:flex; flex-direction:column; gap:10px;">
              <div style="background:#f1f5f9; padding:10px; border-radius:4px;"><strong>cine_dev:</strong> 좋은 분석 기사네요. 정말 에이전트 시대가 다가온 것 같습니다.</div>
              <div style="background:#f1f5f9; padding:10px; border-radius:4px;"><strong>ahn_k:</strong> 프린터 잉크 아까운데 광고가 너무 많아 다 지우고 뽑아야겠어요.</div>
            </div>
          </footer>
        </div>
      `;
    } 
    else if (type === 'blog') {
      demoHtml = `
        <div style="padding: 10px; font-family: serif; background:#fdfdf9;">
          <!-- Giant Hero Header -->
          <div style="text-align:center; padding:30px 10px; border-bottom:1px solid #eaeaea; margin-bottom:30px;">
            <span style="font-size:0.75rem; letter-spacing:2px; color:#c29c55; text-transform:uppercase;">Delicious & Simple</span>
            <h1 style="font-size:2.8rem; color:#222; font-family:Georgia, serif; margin:5px 0;">에밀리의 힐링 푸드 다이어리</h1>
            <p style="font-size:0.85rem; color:#888;">매일 아침 구워내는 따뜻한 식탁 레시피</p>
          </div>

          <!-- Newsletter Banner -->
          <div class="pwl-ad newsletter-banner" style="background:#f4f4f0; border:1px solid #d2d2c8; padding:20px; text-align:center; margin-bottom:25px; border-radius:4px;">
            <h4 style="font-size:0.9rem; color:#444;">🍳 에밀리의 제철 레시피 무료 구독 신청</h4>
            <p style="font-size:0.75rem; color:#777; margin:5px 0 10px 0;">이메일 주소만 입력하면 매주 목요일 비공개 레시피 노트를 발송해 드립니다.</p>
            <input type="email" placeholder="email@address.com" style="padding:4px 8px; font-size:0.75rem; width:180px; border:1px solid #ccc; outline:none;">
            <button style="background:#c29c55; border:none; color:#fff; font-size:0.75rem; padding:4px 10px; cursor:pointer;">신청하기</button>
          </div>

          <div style="max-width: 650px; margin: 0 auto;">
            <h2 style="font-size:1.8rem; font-family:Georgia, serif; color:#333; margin-bottom:20px;">바삭하고 촉촉한 홈메이드 크루아상 굽는 법</h2>
            
            <p style="color:#555; line-height:1.7; font-size:0.95rem; margin-bottom:15px;">
              크루아상 베이킹의 핵심은 <strong>라미네이션(Lamination)</strong> 과정에 있습니다. 차가운 버터 블록을 얇은 효모 밀가루 반죽 사이에 겹쳐 넣고, 수차례 접고 미는 과정을 거치며 수십 겹의 오븐 스팀 층을 형성합니다.
            </p>

            <img src="../lotto/icon.png" style="width:100%; max-height:250px; object-fit:cover; margin:15px 0; border-radius:6px; border:1px solid #ddd;" alt="Croissant Bakery">

            <h3 style="font-size:1.25rem; font-family:Georgia, serif; color:#444; margin-top:25px; margin-bottom:10px;">필수 재료</h3>
            <ul style="padding-left:20px; font-size:0.88rem; color:#555; display:flex; flex-direction:column; gap:6px;">
              <li>강력분 300g</li>
              <li>무염 판 버터 150g (롤링용)</li>
              <li>따뜻한 물 100ml & 우유 50ml</li>
              <li>드라이 이스트 6g, 설탕 30g, 소금 5g</li>
            </ul>

            <div class="pwl-ad blog-sponsor" style="background:#fafafa; border:1px solid #eee; padding:15px; margin:30px 0; font-size:0.8rem; text-align:center; color:#999;">
              [스폰서 광고] 프랑스 전통 고메 버터 20% 세일 쿠폰 지급 코드: EMILYBUTTER
            </div>
          </div>
        </div>
      `;
    } 
    else if (type === 'wiki') {
      demoHtml = `
        <div style="font-family: sans-serif; font-size: 13px; color:#202122; background:#fff; padding:10px;">
          <!-- Top Wiki Notice -->
          <div class="pwl-ad wiki-alert" style="background:#f8f9fa; border:1px solid #a2a9b1; padding:10px; margin-bottom:20px; font-size:0.8rem; display:flex; gap:10px; align-items:center;">
            <i class="fa-solid fa-circle-info" style="font-size:1.4rem; color:#36c;"></i>
            <div>
              <strong>독자 안내:</strong> 본 문서의 신뢰성 확보를 위해 출처 정보 보강이 권장됩니다. 검증되지 않은 문장은 토론을 거쳐 출처 필요 배너가 장착될 수 있습니다.
            </div>
          </div>

          <!-- Wiki Layout split -->
          <div style="display: flex;">
            <!-- Left Wiki Navigation Menu -->
            <nav class="wiki-nav" style="width:170px; border-right:1px solid #a2a9b1; padding-right:15px; margin-right:20px; font-size:0.75rem; flex-shrink:0;">
              <h5 style="font-weight:700; color:#54595d; margin-bottom:8px;">자주 찾는 대메뉴</h5>
              <ul style="list-style:none; display:flex; flex-direction:column; gap:6px; color:#36c; cursor:pointer;">
                <li>위키백과 소개</li>
                <li>최근 바뀐 문서</li>
                <li>무작위 임의 글</li>
                <li>기부금 납부</li>
                <li>오류 보충 건의</li>
              </ul>
            </nav>

            <!-- Main wiki body -->
            <div style="flex:1;">
              <h1 style="font-size:2rem; font-family:'Georgia', serif; border-bottom:1px solid #a2a9b1; padding-bottom:5px; margin-bottom:15px;">AHO 코퍼레이션 (AHO Corporation)</h1>
              
              <!-- Info Box (Right side box) -->
              <table class="wiki-infobox" style="float:right; width:260px; border:1px solid #a2a9b1; background:#f8f9fa; border-collapse:collapse; margin-left:15px; font-size:0.78rem;">
                <caption style="background:#b0c4de; font-weight:700; padding:4px;">AHO Corporation</caption>
                <tbody>
                  <tr style="border-bottom:1px solid #a2a9b1;"><td colspan="2" style="text-align:center; padding:10px;"><strong style="font-size:1.25rem;">AHO</strong></td></tr>
                  <tr style="border-bottom:1px solid #eaecf0;"><td style="padding:4px; font-weight:700;">설립일</td><td style="padding:4px;">2026년 05월 31일</td></tr>
                  <tr style="border-bottom:1px solid #eaecf0;"><td style="padding:4px; font-weight:700;">본사</td><td style="padding:4px;">대한민국 가상 포털</td></tr>
                  <tr style="border-bottom:1px solid #eaecf0;"><td style="padding:4px; font-weight:700;">핵심 인물</td><td style="padding:4px;">cineaho (예언자)</td></tr>
                </tbody>
              </table>

              <p style="margin-bottom:12px; line-height:1.6;">
                <strong>AHO 코퍼레이션</strong>은 CineAHO 포털 대시보드 내부에 탑재되는 20종 이상의 유틸리티, 클래식 보드게임, 생산성 오피스 프로그램 및 2D 슈팅 게임을 총괄 관리하는 오픈소스 가상 기업 조직입니다.
              </p>

              <h2 style="font-size:1.35rem; border-bottom:1px solid #a2a9b1; margin-top:20px; margin-bottom:10px;">1. 산하 프로젝트 역사</h2>
              <p style="margin-bottom:12px; line-height:1.6;">
                최초의 서브프로젝트는 네이버 SEO 분석 도구였으며, 점차 장기/오목 같은 복고 보드게임과 스도쿠/2048 등 하이테크 수학 퍼즐로 범위를 확장했습니다. 최근에는 PDF 분할 병합 도구 및 2D 물리 벡터 연산을 연동한 구슬 룰렛 추첨기를 탑재하여 생산성과 게임성을 고루 겸비한 창고가 되었습니다.
              </p>
            </div>
          </div>
        </div>
      `;
    }

    this.loadCustomHTML(demoHtml);
  },

  loadCustomHTML(htmlCode) {
    this.sandboxCanvasEl.innerHTML = htmlCode;
    this.state.currentUrl = 'custom-paste';
    this.enterEditor();
  },

  enterEditor() {
    this.state.view = 'EDITOR';
    this.lobbyViewEl.classList.add('hidden');
    this.editorViewEl.classList.remove('hidden');
    this.portalHeaderEl.classList.add('hidden');
    
    // Clear stacks
    this.state.undoStack = [];
    this.state.redoStack = [];
    this.updateHistoryButtons();

    // Default formatter resets
    document.getElementById('toggle-hide-images').checked = false;
    document.getElementById('toggle-strip-backgrounds').checked = true;
    document.getElementById('select-font-size').value = 'font-size-md';
    document.getElementById('select-font-family').value = 'font-family-default';
    document.getElementById('select-page-width').value = 'page-width-medium';

    this.state.hideImages = false;
    this.state.stripBackgrounds = true;
    this.state.fontSize = 'font-size-md';
    this.state.fontFamily = 'font-family-default';
    this.state.pageWidth = 'page-width-medium';
    this.state.clickToDelete = true;
    this.state.directEdit = false;

    document.getElementById('toggle-click-delete').checked = true;
    document.getElementById('toggle-direct-edit').checked = false;
    this.sandboxCanvasEl.setAttribute('contenteditable', 'false');

    this.applyFormatting();
  },

  exitEditor() {
    this.state.view = 'LOBBY';
    this.lobbyViewEl.classList.remove('hidden');
    this.editorViewEl.classList.add('hidden');
    this.portalHeaderEl.classList.remove('hidden');
    this.hoverToolbarEl.classList.add('hidden');
    
    // Clean canvas
    this.sandboxCanvasEl.innerHTML = '';
  },

  applyFormatting() {
    // Sync classlist on sandbox viewport
    this.sandboxCanvasEl.className = 'sandbox-canvas-viewport';

    // Width
    this.sandboxCanvasEl.classList.add(this.state.pageWidth);
    
    // Font sizes
    this.sandboxCanvasEl.classList.add(this.state.fontSize);

    // Font styles
    this.sandboxCanvasEl.classList.add(this.state.fontFamily);

    // Images
    if (this.state.hideImages) {
      this.sandboxCanvasEl.classList.add('hide-images');
    }

    // Background strip
    if (this.state.stripBackgrounds) {
      this.sandboxCanvasEl.classList.add('strip-backgrounds');
    }

    // Hover outline
    if (this.state.clickToDelete && !this.state.directEdit) {
      this.sandboxCanvasEl.classList.add('hover-delete-enabled');
    }
  },

  // Interactive mouse highlighting inside canvas
  handleCanvasMouseMove(e) {
    if (this.state.view !== 'EDITOR') return;
    if (this.state.directEdit || !this.state.clickToDelete) return;

    // Find actual hovered element
    const target = e.target;

    // Avoid hover trigger if target is the sandbox canvas viewport itself
    if (target === this.sandboxCanvasEl || target.id === 'sandbox-canvas') {
      this.hoverToolbarEl.classList.add('hidden');
      this.state.hoveredElement = null;
      return;
    }

    // Avoid if target is within hover toolbar
    if (this.hoverToolbarEl.contains(target)) return;

    this.state.hoveredElement = target;
    
    // Show hovered toolbar above element
    const rect = target.getBoundingClientRect();
    const containerRect = this.canvasContainerEl.getBoundingClientRect();

    // Position tooltip toolbar
    const left = rect.left - containerRect.left + this.canvasContainerEl.scrollLeft;
    const top = rect.top - containerRect.top + this.canvasContainerEl.scrollTop - 35; // 35px offset above element

    this.hoverToolbarEl.style.left = `${Math.max(10, left)}px`;
    this.hoverToolbarEl.style.top = `${Math.max(10, top)}px`;
    this.hoverToolbarEl.classList.remove('hidden');

    // Update tag label
    document.getElementById('tt-tag-name').textContent = target.tagName.toLowerCase();
  },

  handleCanvasClick(e) {
    if (this.state.view !== 'EDITOR') return;
    if (this.state.directEdit) return; // allow standard browser typing focus

    // Click to delete trigger
    if (this.state.clickToDelete) {
      const target = e.target;

      // Avoid if click is within toolbar
      if (this.hoverToolbarEl.contains(target)) return;
      if (target === this.sandboxCanvasEl || target.id === 'sandbox-canvas') return;

      e.preventDefault();
      e.stopPropagation();

      this.deleteElement(target);
    }
  },

  // DOM manipulators
  deleteElement(element) {
    // Save to Undo Stack
    const parent = element.parentNode;
    const nextSibling = element.nextSibling;
    
    // Push action
    this.state.undoStack.push({
      type: 'delete',
      node: element,
      parent: parent,
      nextSibling: nextSibling
    });

    // Clear redo
    this.state.redoStack = [];

    // Remove from DOM
    element.remove();
    this.hoverToolbarEl.classList.add('hidden');
    this.state.hoveredElement = null;

    this.updateHistoryButtons();
  },

  isolateElement(element) {
    // Isolate: keep ONLY this element. 
    // Save old full HTML state to undo
    const oldHTML = this.sandboxCanvasEl.innerHTML;

    this.state.undoStack.push({
      type: 'isolate',
      oldHTML: oldHTML
    });

    this.state.redoStack = [];

    // Extract element clone, clean canvas, append
    const clone = element.cloneNode(true);
    this.sandboxCanvasEl.innerHTML = '';
    this.sandboxCanvasEl.appendChild(clone);

    this.hoverToolbarEl.classList.add('hidden');
    this.state.hoveredElement = null;

    this.updateHistoryButtons();
  },

  autoCleanPage() {
    // Auto-clean common noise tags
    const oldHTML = this.sandboxCanvasEl.innerHTML;
    
    // Selectors representing typical advertisements, sidebars, nav headers, footers
    const noiseSelectors = [
      'aside', 'nav', 'header', 'footer', 'iframe',
      '.pwl-ad', '.ad', '.ads', '.banner', '.social-share', '.popup', '.sidebar',
      '[class*="ad-"]', '[class*="banner"]', '[class*="sidebar"]', '[id*="ad-"]'
    ];

    let removedCount = 0;
    noiseSelectors.forEach(selector => {
      this.sandboxCanvasEl.querySelectorAll(selector).forEach(el => {
        el.remove();
        removedCount++;
      });
    });

    if (removedCount > 0) {
      this.state.undoStack.push({
        type: 'clean',
        oldHTML: oldHTML
      });
      this.state.redoStack = [];
      this.updateHistoryButtons();
      alert(`자동 정리가 완료되었습니다. (총 ${removedCount}개의 불필요 요소 제거)`);
    } else {
      alert("자동 정리할 수 있는 광고 또는 사이드바 요소를 감지하지 못했습니다.");
    }
  },

  // Undo / Redo engine
  triggerUndo() {
    if (this.state.undoStack.length === 0) return;
    SoundEngine.play('click');

    const action = this.state.undoStack.pop();

    if (action.type === 'delete') {
      // Re-insert node
      if (action.nextSibling) {
        action.parent.insertBefore(action.node, action.nextSibling);
      } else {
        action.parent.appendChild(action.node);
      }
      this.state.redoStack.push(action);
    } 
    else if (action.type === 'isolate' || action.type === 'clean') {
      // Restore previous full HTML state
      const currentHTML = this.sandboxCanvasEl.innerHTML;
      this.sandboxCanvasEl.innerHTML = action.oldHTML;
      
      this.state.redoStack.push({
        type: action.type,
        oldHTML: currentHTML
      });
    }

    this.updateHistoryButtons();
    this.hoverToolbarEl.classList.add('hidden');
  },

  triggerRedo() {
    if (this.state.redoStack.length === 0) return;
    SoundEngine.play('click');

    const action = this.state.redoStack.pop();

    if (action.type === 'delete') {
      action.node.remove();
      this.state.undoStack.push(action);
    } 
    else if (action.type === 'isolate' || action.type === 'clean') {
      const currentHTML = this.sandboxCanvasEl.innerHTML;
      this.sandboxCanvasEl.innerHTML = action.oldHTML;
      
      this.state.undoStack.push({
        type: action.type,
        oldHTML: currentHTML
      });
    }

    this.updateHistoryButtons();
    this.hoverToolbarEl.classList.add('hidden');
  },

  updateHistoryButtons() {
    const undoBtn = document.getElementById('btn-editor-undo');
    const redoBtn = document.getElementById('btn-editor-redo');
    const undoCountLbl = document.getElementById('undo-count');

    undoBtn.disabled = this.state.undoStack.length === 0;
    redoBtn.disabled = this.state.redoStack.length === 0;
    undoCountLbl.textContent = this.state.undoStack.length;
  }
};

// Auto initialize App on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
