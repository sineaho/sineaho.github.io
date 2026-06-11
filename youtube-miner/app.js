// YouTube Topic Miner (소재 채굴기) Application Logic

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const ytKeyInput = document.getElementById("yt-key-input");
  const geminiKeyInput = document.getElementById("gemini-key-input");
  const keySaveToggle = document.getElementById("key-save-toggle");
  
  const minerSearchInput = document.getElementById("miner-search-input");
  const btnRunMiner = document.getElementById("btn-run-miner");
  
  const selectDuration = document.getElementById("select-duration");
  const sliderPerformance = document.getElementById("slider-performance");
  const sliderValueDisplay = document.getElementById("slider-value-display");
  
  const minerDemoBanner = document.getElementById("miner-demo-banner");
  const minerLoadingStatus = document.getElementById("miner-loading-status");
  const minerStatusText = document.getElementById("miner-status-text");
  const minerResultsContainer = document.getElementById("miner-results-container");
  
  // Modal Elements
  const analysisModal = document.getElementById("analysis-modal");
  const btnCloseModal = document.getElementById("btn-close-modal");
  const modalVideoTitle = document.getElementById("modal-video-title");
  const modalVideoChannel = document.getElementById("modal-video-channel");
  
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  
  const viralAnalysisText = document.getElementById("viral-analysis-text");
  const commentsAnalysisText = document.getElementById("comments-analysis-text");
  const scriptGenerationText = document.getElementById("script-generation-text");
  const scriptActions = document.getElementById("script-actions");
  const btnCopyScript = document.getElementById("btn-copy-script");

  // State Variables
  let ytApiKey = "";
  let geminiApiKey = "";
  let minerResults = [];
  let filteredResults = [];
  let isSavingKeys = false;

  // ==========================================
  // API Key Storage Logic
  // ==========================================
  
  function initKeys() {
    isSavingKeys = localStorage.getItem("miner_save_keys") === "true";
    keySaveToggle.checked = isSavingKeys;
    
    if (isSavingKeys) {
      ytApiKey = localStorage.getItem("miner_yt_key") || "";
      geminiApiKey = localStorage.getItem("miner_gemini_key") || "";
      
      ytKeyInput.value = ytApiKey;
      geminiKeyInput.value = geminiApiKey;
    }
    
    updateDemoBanner();
  }

  function updateDemoBanner() {
    if (ytApiKey && geminiApiKey) {
      minerDemoBanner.style.display = "none";
    } else {
      minerDemoBanner.style.display = "flex";
    }
  }

  keySaveToggle.addEventListener("change", (e) => {
    isSavingKeys = e.target.checked;
    localStorage.setItem("miner_save_keys", isSavingKeys);
    
    if (isSavingKeys) {
      saveKeysToStorage();
    } else {
      clearKeysFromStorage();
    }
    updateDemoBanner();
  });

  function saveKeysToStorage() {
    const yt = ytKeyInput.value.trim();
    const gem = geminiKeyInput.value.trim();
    
    localStorage.setItem("miner_yt_key", yt);
    localStorage.setItem("miner_gemini_key", gem);
    
    ytApiKey = yt;
    geminiApiKey = gem;
  }

  function clearKeysFromStorage() {
    localStorage.removeItem("miner_yt_key");
    localStorage.removeItem("miner_gemini_key");
    
    ytApiKey = "";
    geminiApiKey = "";
  }

  // Auto-save keys when typing if toggle is on
  [ytKeyInput, geminiKeyInput].forEach(input => {
    input.addEventListener("input", () => {
      if (keySaveToggle.checked) {
        saveKeysToStorage();
        updateDemoBanner();
      }
    });
  });

  // Initialize keys on start
  initKeys();

  // ==========================================
  // Slider Controls
  // ==========================================
  
  sliderPerformance.addEventListener("input", (e) => {
    const val = e.target.value;
    sliderValueDisplay.textContent = `${val}%`;
    applyMinerFilters();
  });

  selectDuration.addEventListener("change", () => {
    if (!ytApiKey) {
      applyMinerFilters();
    } else {
      executeMinerSearch();
    }
  });

  // ==========================================
  // Accordion Modal Tabs Logic
  // ==========================================

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));
      
      btn.classList.add("active");
      const tabId = btn.dataset.tab;
      document.getElementById(tabId).classList.add("active");
    });
  });

  btnCloseModal.addEventListener("click", () => {
    analysisModal.style.display = "none";
  });

  // Close modal when clicking background
  analysisModal.addEventListener("click", (e) => {
    if (e.target === analysisModal) {
      analysisModal.style.display = "none";
    }
  });

  // Copy Script
  btnCopyScript.addEventListener("click", () => {
    const text = scriptGenerationText.innerText;
    
    const copyToClipboard = (txt) => {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(txt);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = txt;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        return new Promise((resolve, reject) => {
          const successful = document.execCommand('copy');
          textArea.remove();
          if (successful) {
            resolve();
          } else {
            reject(new Error("execCommand copy failed"));
          }
        });
      }
    };

    copyToClipboard(text)
      .then(() => {
        const originalText = btnCopyScript.innerHTML;
        btnCopyScript.innerHTML = `<i class="fa-solid fa-check"></i> 복사 완료!`;
        btnCopyScript.style.color = "#10b981";
        setTimeout(() => {
          btnCopyScript.innerHTML = originalText;
          btnCopyScript.style.color = "";
        }, 2000);
      })
      .catch((err) => {
        console.error("복사 실패:", err);
        const originalText = btnCopyScript.innerHTML;
        btnCopyScript.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> 복사 실패 (드래그하여 선택)`;
        btnCopyScript.style.color = "#ef4444";
        setTimeout(() => {
          btnCopyScript.innerHTML = originalText;
          btnCopyScript.style.color = "";
        }, 3000);
      });
  });

  // ==========================================
  // Miner Search Operations
  // ==========================================

  btnRunMiner.addEventListener("click", () => {
    executeMinerSearch();
  });

  minerSearchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      executeMinerSearch();
    }
  });

  async function executeMinerSearch() {
    const query = minerSearchInput.value.trim();
    if (!query) {
      alert("키워드를 입력하세요.");
      return;
    }

    minerResultsContainer.innerHTML = "";
    minerLoadingStatus.style.display = "flex";
    btnRunMiner.disabled = true;

    if (!ytApiKey || !geminiApiKey) {
      // Mock Demo Mode
      minerStatusText.innerText = "데모 모드로 로컬 떡상 소재 데이터를 탐색하는 중...";
      setTimeout(() => {
        minerResults = getMockMinerData(query);
        applyMinerFilters();
        minerLoadingStatus.style.display = "none";
        btnRunMiner.disabled = false;
      }, 800);
    } else {
      // Real API Search Mode
      try {
        minerStatusText.innerText = "유튜브 API에서 후보 영상 키워드 리스트를 불러오고 있습니다...";
        
        let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=50&type=video&key=${ytApiKey}`;
        const dur = selectDuration.value;
        if (dur !== "any") {
          url += `&videoDuration=${dur === "shorts" ? "short" : dur}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("유튜브 검색 API 호출 실패");
        const searchData = await res.json();
        const items = searchData.items || [];

        if (items.length === 0) {
          showEmptyMinerState("조건에 맞는 떡상 후보 영상을 찾지 못했습니다.");
          return;
        }

        minerStatusText.innerText = "각 영상들의 조회수와 메타데이터를 수집하는 중...";
        const videoIds = items.map(i => i.id.videoId).join(",");
        const vRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${ytApiKey}`);
        if (!vRes.ok) throw new Error("유튜브 비디오 세부 정보 호출 실패");
        const vData = await vRes.json();
        const videoItems = vData.items || [];
        const videoInfoMap = {};
        videoItems.forEach(v => {
          videoInfoMap[v.id] = {
            viewCount: parseInt(v.statistics?.viewCount) || 0,
            duration: parseISODuration(v.contentDetails?.duration || ""),
            description: v.snippet?.description || "",
            tags: v.snippet?.tags || []
          };
        });

        minerStatusText.innerText = "게시 채널들의 구독자 정보룰 조회하는 중...";
        const channelIds = [...new Set(items.map(i => i.snippet.channelId))].join(",");
        const cRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIds}&key=${ytApiKey}`);
        if (!cRes.ok) throw new Error("유튜브 채널 정보 호출 실패");
        const cData = await cRes.json();
        const channelItems = cData.items || [];
        const channelInfoMap = {};
        channelItems.forEach(c => {
          channelInfoMap[c.id] = {
            subscriberCount: parseInt(c.statistics.subscriberCount) || 0
          };
        });

        // Assemble Data
        minerResults = items.map(item => {
          const videoId = item.id.videoId;
          const snippet = item.snippet;
          
          const vInfo = videoInfoMap[videoId] || { viewCount: 0, duration: "00:00", description: "", tags: [] };
          const cInfo = channelInfoMap[snippet.channelId] || { subscriberCount: 0 };
          
          const views = vInfo.viewCount;
          const subs = cInfo.subscriberCount;
          
          // Calculate Viral Score (%)
          let viralScore = 0;
          if (subs > 0) {
            viralScore = (views / subs) * 100;
          } else if (views > 0) {
            viralScore = 100; // Fallback
          }

          return {
            videoId,
            title: snippet.title,
            description: vInfo.description,
            tags: vInfo.tags,
            thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || "",
            channelTitle: snippet.channelTitle,
            channelId: snippet.channelId,
            publishedAt: snippet.publishedAt,
            duration: vInfo.duration,
            viewCount: views,
            subscriberCount: subs,
            viralScore
          };
        });

        applyMinerFilters();

      } catch (err) {
        console.error(err);
        alert(`소재 검색 중 오류 발생: ${err.message}`);
        showEmptyMinerState("오류가 발생해 검색을 완료하지 못했습니다.");
      } finally {
        minerLoadingStatus.style.display = "none";
        btnRunMiner.disabled = false;
      }
    }
  }

  function applyMinerFilters() {
    const minPerformance = parseInt(sliderPerformance.value) || 100;
    const dur = selectDuration.value;

    filteredResults = minerResults.filter(item => {
      // 1. Viral score filter
      if (item.viralScore < minPerformance) return false;

      // 2. Duration filter (Only needed locally in mock mode, API handles duration server side)
      if (!ytApiKey && dur !== "any") {
        const mins = getDurationMinutes(item.duration);
        if (dur === "shorts" && mins >= 4) return false;
        if (dur === "medium" && (mins < 4 || mins > 20)) return false;
        if (dur === "long" && mins <= 20) return false;
      }

      return true;
    });

    // Sort by viral score descending (Viral items first)
    filteredResults.sort((a, b) => b.viralScore - a.viralScore);

    renderMinerResults();
  }

  function renderMinerResults() {
    minerResultsContainer.innerHTML = "";

    if (filteredResults.length === 0) {
      showEmptyMinerState("최소 성과도(%) 조건에 부합하는 소재가 없습니다.");
      return;
    }

    filteredResults.forEach(item => {
      const card = document.createElement("article");
      card.className = "video-card glass-panel";
      
      // Calculate progress bar percentage (cap at 100% visually)
      const barPercent = Math.min(item.viralScore / 5, 100);

      card.innerHTML = `
        <div class="card-thumbnail-wrapper">
          <div class="card-miner-badge">
            <i class="fa-solid fa-fire-flame-curved"></i> 떡상각
          </div>
          <img src="${item.thumbnail}" alt="${escapeHtml(item.title)}" loading="lazy">
          <span class="card-view-count">${formatKoreanShorthand(item.viewCount)}회</span>
        </div>
        <div class="card-body">
          <h3 class="video-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h3>
          <div class="channel-profile-row">
            <div class="channel-meta-left">
              <i class="fa-solid fa-user-check"></i>
              <span class="channel-name">${escapeHtml(item.channelTitle)}</span>
            </div>
            <div class="channel-subs">
              <i class="fa-solid fa-users"></i>
              <span>${formatKoreanShorthand(item.subscriberCount)}</span>
            </div>
          </div>
          
          <div class="viral-score-container">
            <div class="viral-score-header">
              <span class="label">성과도 (VIRAL SCORE)</span>
              <span class="pct">${item.viralScore.toFixed(1)}%</span>
            </div>
            <div class="viral-progress-track">
              <div class="viral-progress-bar" style="width: ${barPercent}%"></div>
            </div>
          </div>
          
          <button class="btn-analysis-launch" data-id="${item.videoId}">
            <i class="fa-solid fa-robot"></i> AI 분석 & 대본 생성
          </button>
        </div>
      `;
      
      // Bind click trigger for AI analysis
      card.querySelector(".btn-analysis-launch").addEventListener("click", () => {
        openAnalysisModal(item);
      });

      minerResultsContainer.appendChild(card);
    });
  }

  function showEmptyMinerState(msg) {
    minerResultsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-cubes-stacked"></i>
        <h3>발굴된 소재가 없습니다</h3>
        <p>${escapeHtml(msg)}</p>
      </div>
    `;
  }

  // ==========================================
  // Gemini AI Analysis Modal Operations
  // ==========================================

  async function openAnalysisModal(videoItem) {
    modalVideoTitle.textContent = videoItem.title;
    modalVideoChannel.textContent = `채널: ${videoItem.channelTitle} | 성과도: ${videoItem.viralScore.toFixed(1)}%`;
    
    // Switch to first tab initially
    tabButtons.forEach(b => b.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));
    tabButtons[0].classList.add("active");
    tabContents[0].classList.add("active");

    scriptActions.style.display = "none";
    
    // Clear previous texts
    viralAnalysisText.innerHTML = "";
    commentsAnalysisText.innerHTML = "";
    scriptGenerationText.innerHTML = "";
    
    // Show modal
    analysisModal.style.display = "flex";

    if (!ytApiKey || !geminiApiKey) {
      // Mock Demo AI Report
      showDemoAIReport(videoItem.videoId);
    } else {
      // Real API Gemini Analysis
      try {
        // Show loading spinners in tabs
        const loaders = document.querySelectorAll(".analysis-loading");
        loaders.forEach(l => l.style.display = "flex");

        // 1. Fetch Comments
        const cRes = await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoItem.videoId}&maxResults=40&key=${ytApiKey}`);
        let commentsList = [];
        if (cRes.ok) {
          const cData = await cRes.json();
          commentsList = (cData.items || []).map(i => i.snippet.topLevelComment.snippet.textOriginal);
        }
        
        // 2. Perform parallel Gemini calls for each tab
        const commentsText = commentsList.length > 0 ? commentsList.join("\n") : "댓글이 아직 수집되지 않았거나 없습니다.";
        
        // Tab 1: Viral Factors Analysis Prompts
        const viralPrompt = `You are a YouTube viral growth consultant. Analyze the following video metadata and explain why this video went viral. Identify its hook strategy, retention hooks, and structural design.
        Video Title: ${videoItem.title}
        Video Description: ${videoItem.description}
        Tags: ${(videoItem.tags || []).join(", ")}
        Provide a detailed bulleted summary in Korean language. Use <h4> and other basic formatting.`;

        // Tab 2: Audience Reaction summary Prompt
        const commentsPrompt = `Analyze these viewer comments for the YouTube video titled "${videoItem.title}". Summarize the general sentiment, positive feedback, constructive criticisms, and any specific questions or requests viewers are asking.
        Comments:
        ${commentsText}
        Write a detailed bulleted summary in Korean language. Use <h4> for subsections.`;

        // Tab 3: Script benchmark Prompt
        const scriptPrompt = `Write a compelling 60-second YouTube Shorts script bench-marking the topic: "${videoItem.title}".
        Base it on the following description details:
        ${videoItem.description}
        Ensure it incorporates what the audience loved in comments, utilizes a high-retention hook, and includes narration lines and visual directives (e.g. [화면 전환: 로봇]).
        Format the script with clean line breaks in Korean language.`;

        // Trigger APIs
        const [viralRes, commentsRes, scriptRes] = await Promise.all([
          callGeminiAPI(viralPrompt),
          callGeminiAPI(commentsPrompt),
          callGeminiAPI(scriptPrompt)
        ]);

        // Hide Loaders
        loaders.forEach(l => l.style.display = "none");

        // Render contents
        viralAnalysisText.innerHTML = formatMarkdownToHTML(viralRes);
        commentsAnalysisText.innerHTML = formatMarkdownToHTML(commentsRes);
        scriptGenerationText.innerHTML = escapeHtml(scriptRes);
        scriptActions.style.display = "flex";

      } catch (err) {
        console.error(err);
        document.querySelectorAll(".analysis-loading").forEach(l => l.style.display = "none");
        viralAnalysisText.textContent = `AI 분석 중 오류가 발생했습니다: ${err.message}`;
        commentsAnalysisText.textContent = "댓글 분석을 완료할 수 없습니다.";
        scriptGenerationText.textContent = "대본 생성을 완료할 수 없습니다.";
      }
    }
  }

  async function callGeminiAPI(promptText) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: promptText }
            ]
          }
        ]
      })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error?.message || "Gemini API 호출에 실패했습니다.");
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "답변을 생성할 수 없습니다.";
  }

  function showDemoAIReport(videoId) {
    const loaders = document.querySelectorAll(".analysis-loading");
    loaders.forEach(l => l.style.display = "flex");

    setTimeout(() => {
      loaders.forEach(l => l.style.display = "none");

      let viralHtml = "";
      let commentsHtml = "";
      let scriptText = "";

      if (videoId === "mock1") {
        viralHtml = `
          <h4>1. 초반 3초 극강의 비주얼 훅(Hook)</h4>
          <p>영상 시작하자마자 CES 2025에 출시된 실제 같은 로봇의 얼굴 마사지 장면을 배치하여 시청자들의 스크롤을 즉시 멈추게 함. 기괴함(Uncanny Valley)과 신기함의 심리를 결합하여 retention 확보.</p>
          <h4>2. 사운드 엠비언트 디자인</h4>
          <p>ASMR 스타일의 기계 작동 소리와 기괴한 효과음을 적절히 배치하여 이어폰 사용 시 몰입도를 배가함.</p>
          <h4>3. 해시태그 활용</h4>
          <p>#shorts, #ai, #robot 등 트렌딩 키워드를 제목 전면에 노출하여 탐색 알고리즘 피드에 빠르게 안착.</p>
        `;
        commentsHtml = `
          <h4>💬 시청자 반응 분석 요약</h4>
          <ul>
            <li><strong>긍정적 반응 (70%)</strong>: "로봇 피부 질감이 진짜 사람 같다.. 기술 속도가 무섭다", "CES 직접 안 가도 이런 쇼츠로 보니 퀄리티 대박"</li>
            <li><strong>우려 및 비판 (25%)</strong>: "불쾌한 골짜기 현상이 너무 심하다.. 밤에 보면 꿈에 나올 것 같음", "인간의 일자리가 로봇 마사지사로 대체되는 것인가?"</li>
            <li><strong>시청자 요청 질문</strong>: "저 로봇 이름이 뭔가요?", "가격이 얼마나 되는지 궁금하네요"</li>
          </ul>
        `;
        scriptText = `[00:00 - 00:03] (화면: CES 2025 현장에서 마사지를 받는 초실사 인간형 로봇 얼굴 타이트 샷)
나레이션: 방금 보신 거 사람 얼굴 아닙니다. 실제 로봇입니다!

[00:03 - 00:10] (화면: 로봇 얼굴의 피부가 부드럽게 눌리며 섬뜩하리만큼 리얼한 표정을 짓는 슬로우 모션)
나레이션: 올해 CES 2025에서 난리 난 이 초실사 안면 로봇. 피부 질감부터 머리카락까지 사람과 100% 똑같이 구현해 불쾌한 골짜기 끝판왕이라 불리고 있습니다.

[00:10 - 00:20] (화면: 기술진이 뒤에서 로봇을 코딩하고 기계 뼈대가 보이는 장면 교차 편집)
나레이션: 단순히 얼굴만 움직이는 게 아니라 사람의 감정을 인식해서 실시간으로 미세 표정 변화를 수행합니다. 마사지 샵이나 안내 센터 일자리, 정말 다 대체되는 걸까요?

[00:20 - 00:30] (화면: 로봇이 부드럽게 웃으며 마무리)
나레이션: 기술의 혁신일까요, 아니면 두려움의 시작일까요? 여러분의 의견을 댓글로 달아주세요!`;
      } else if (videoId === "mock2") {
        viralHtml = `
          <h4>1. 강렬한 썸네일 & 숏폼 도파민 훅</h4>
          <p>초대형 케밥 냄비를 드는 파격적인 오프닝 비주얼로 도파민을 유발하고 텍스트로 시청자의 주의를 가둠.</p>
          <h4>2. 자율적인 영상 호기심 유도</h4>
          <p>AI 얼굴없는 채널 아이디어를 제시하면서 요리 및 푸드 챌린지를 접목하여 20-30대 젊은 층 타겟팅 성공.</p>
        `;
        commentsHtml = `
          <h4>💬 시청자 반응 분석 요약</h4>
          <ul>
            <li><strong>긍정적 반응 (65%)</strong>: "얼굴 없이 유튜브 쇼츠 키우는 법 찾고 있었는데 진짜 꿀팁이다", "음식이 너무 맛있어 보여서 끝까지 봄"</li>
            <li><strong>비판적 반응 (30%)</strong>: "AI 보이스 목소리가 조금 웅얼거림", "자막 크기가 조금 더 컸으면 좋겠다"</li>
          </ul>
        `;
        scriptText = `[00:00 - 00:03] (화면: 3m 크기의 대형 구이 통에서 썰려 나오는 초대형 고기 덩어리 훅)
나레이션: 얼굴 안 까고 유튜브 조회수 100만 찍는 법, 바로 이겁니다!

[00:03 - 00:10] (화면: 고기 썰기 챌린지 썸네일 이미지 및 데이터 통계 화면 그래픽)
나레이션: 지금 해외에서 가장 뜨거운 조회수 유도 치트키, 바로 '자이언트 푸드 쇼츠' 채널입니다. 얼굴 노출 없이 조리 사운드와 대용량 비주얼만으로 엄청난 트래픽을 얻고 있죠.

[00:10 - 00:20] (화면: 조리 기구를 다루는 다양한 POV 1인칭 시점 촬영 컷 몽타주)
나레이션: 팁은 간단해요. 1인칭 시점으로 압도적인 부피감의 재료를 손질하는 소리를 ASMR로 전달하는 것. AI 채널 아이디어를 찾고 계신다면 꼭 벤치마킹해보세요.

[00:20 - 00:30] (화면: 완성된 케밥이 서빙되며 채널 구독 유도 로고 노출)
나레이션: 더 많은 무인 채널 아이디어가 궁금하다면 구독하고 떡상 템 받아가세요!`;
      } else {
        // Fallback for mock3 and dynamic mock items
        viralHtml = `
          <h4>1. ASMR 시각 자극 효과</h4>
          <p>블루 라즈베리 잼이 바삭한 토스트 위에 발려 나가는 시각적 대칭감과 청각 자극(바삭 소리)을 극대화하여 뇌에 쾌감을 주며 이탈 방지.</p>
          <h4>2. AI 일러스트와 요리의 결합</h4>
          <p>실제 없는 파란색 베리들을 AI 이미지 생성 기술을 통해 독창적으로 보여주어 시청자 호기심 유발.</p>
        `;
        commentsHtml = `
          <h4>💬 시청자 반응 분석 요약</h4>
          <ul>
            <li><strong>긍정적 반응 (85%)</strong>: "소리가 너무 힐링된다.. 잠들기 전에 보기 딱 좋은 영상", "AI 잼 바르는 아이디어 신박하네"</li>
            <li><strong>기타 반응 (15%)</strong>: "진짜 블루 라즈베리인 줄 알고 속았다 ㅋㅋ", "사용된 AI 오디오가 신기하다"</li>
          </ul>
        `;
        scriptText = `[00:00 - 00:03] (화면: 바삭한 토스트 위에 기묘한 네온 파란색 잼이 발라지는 근접 오프닝)
나레이션: 이 파란색 잼의 정체, 실제 과일일까요 AI일까요?

[00:03 - 00:10] (화면: 바사삭 토스트가 갈라지는 소리와 네온 베리가 합성되는 이미지 시각화)
나레이션: 최근 유튜브 피드를 뒤흔든 시각 및 청각 힐링 치트키, 바로 AI ASMR 브레드 메이킹입니다. 현실에 존재하지 않는 색감의 과일을 입혀 보는 재미를 극대화하죠.

[00:10 - 00:20] (화면: 버터가 녹아내리는 ASMR 숏폼 컷)
나레이션: 핵심은 4K 초고화질의 정적인 잼 퍼트리기 모션과 귀가 시원해지는 바삭한 사운드 믹싱입니다. 시청자들의 뇌에 시각적 오르가즘을 주며 평균 시청 지속률을 150% 이상 끌어올리는 비밀이죠.

[00:20 - 00:30] (화면: 파란 토스트가 완성되어 플레이팅되는 부드러운 아웃트로)
나레이션: 오늘 밤 잠들기 전, 여러분이 가장 듣고 싶은 소리를 댓글로 남겨주세요!`;
      }

      viralAnalysisText.innerHTML = viralHtml;
      commentsAnalysisText.innerHTML = commentsHtml;
      scriptGenerationText.innerHTML = scriptText;
      scriptActions.style.display = "flex";

    }, 1200);
  }

  // ==========================================
  // Helper Parsers
  // ==========================================

  function parseISODuration(duration) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "00:00";
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function getDurationMinutes(clockStr) {
    const parts = clockStr.split(":").map(Number);
    if (parts.length === 3) {
      return parts[0] * 60 + parts[1];
    }
    return parts[0];
  }

  function formatNumber(num) {
    if (num === undefined || num === null) return "0";
    return Number(num).toLocaleString('ko-KR');
  }

  function formatKoreanShorthand(num) {
    if (num === undefined || num === null) return "0";
    const n = Number(num);
    if (n >= 100000000) {
      return `${(n / 100000000).toFixed(1).replace(/\.0$/, '')}억`;
    }
    if (n >= 10000) {
      return `${(n / 10000).toFixed(1).replace(/\.0$/, '')}만`;
    }
    if (n >= 1000) {
      // Return 천명 shorthand to match sub list mockup (e.g. 237.0천명)
      return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}천명`;
    }
    return n.toLocaleString('ko-KR') + '명';
  }

  function escapeHtml(string) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(string).replace(/[&<>"']/g, function(m) { return map[m]; });
  }

  // Basic markdown-like text to HTML converter for Gemini output
  function formatMarkdownToHTML(text) {
    let html = escapeHtml(text);
    
    // Replace **bold** with <strong>
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Replace h4 headers (starting with #### or ### or ##)
    html = html.replace(/^####?\s+([^\n]+)/gm, '<h4>$1</h4>');
    html = html.replace(/^##\s+([^\n]+)/gm, '<h4>$1</h4>');
    
    // Handle bullet points
    html = html.replace(/^\*\s+([^\n]+)/gm, '<li>$1</li>');
    html = html.replace(/^\-\s+([^\n]+)/gm, '<li>$1</li>');
    
    // Wrap lists
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    
    // Replace line breaks with paragraphs/breaks
    html = html.replace(/\n\n/g, '</p><p>');
    
    return '<p>' + html + '</p>';
  }

  // ==========================================
  // Mock Data Generators for Miner Demo
  // ==========================================

  function getMockMinerData(query) {
    if (query === "AI") {
      return [
        {
          videoId: "mock1",
          title: "Hyper-realistic Robot at CES 2025! #robot #ai #shorts",
          thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=480&auto=format&fit=crop&q=60",
          channelTitle: "Voices of Nightmare",
          channelId: "ch1",
          publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          duration: "00:45",
          viewCount: 144000,
          subscriberCount: 2370, // Yields 6075.9% (approx 6067.0%)
          viralScore: 6067.0
        },
        {
          videoId: "mock2",
          title: "Who wanna kebab ??? #ai#facelessyoutubechannelideas...",
          thumbnail: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=480&auto=format&fit=crop&q=60",
          channelTitle: "Fleshcore AI",
          channelId: "ch2",
          publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          duration: "00:30",
          viewCount: 1090000,
          subscriberCount: 594, // Yields 183500% (approx 183471.5%)
          viralScore: 183471.5
        },
        {
          videoId: "mock3",
          title: "AI ASMR Spreading different blue raspberries on toast #ai...",
          thumbnail: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=480&auto=format&fit=crop&q=60",
          channelTitle: "Goody AI",
          channelId: "ch3",
          publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          duration: "00:15",
          viewCount: 14000,
          subscriberCount: 159, // Yields 8805% (approx 8818.3%)
          viralScore: 8818.3
        }
      ];
    }

    // Dynamic generator for other queries
    const mockList = [];
    const titles = [
      `떡상 조짐! 무조건 해야할 ${query} 쇼츠 주제 추천`,
      `이거 하나로 조회수 100만 찍었습니다. ${query} 기법`,
      `조회수 터지는 ${query} 관련 자극적인 영상 팁`,
      `요즘 해외에서 조회수 폭발 중인 ${query} 무인 채널`,
      `돈 버는 유튜브 소재: ${query} 쇼츠 대본 분석`
    ];

    const channels = ["유튜브 인큐베이터", "쇼츠 팩토리", "알고리즘 정복", "소재 탐사대"];
    const thumbnails = [
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=480&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=480&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=480&auto=format&fit=crop&q=60"
    ];

    for (let i = 0; i < 6; i++) {
      const subs = Math.floor(Math.random() * 800) + 100; // Small channels
      const views = Math.floor(subs * (1.5 + Math.random() * 25)); // High virality
      const viralScore = (views / subs) * 100;

      const durationSec = Math.floor(Math.random() * 59) + 5;
      const durationStr = `00:${String(durationSec).padStart(2, '0')}`;

      mockList.push({
        videoId: `mock_dyn_miner_${i}`,
        title: titles[i % titles.length],
        thumbnail: thumbnails[i % thumbnails.length],
        channelTitle: channels[i % channels.length],
        channelId: `ch_dyn_miner_${i}`,
        publishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        duration: durationStr,
        viewCount: views * 100, // scaled for display
        subscriberCount: subs * 10,
        viralScore
      });
    }
    return mockList;
  }

});
