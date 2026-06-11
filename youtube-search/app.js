// YouTube Search Dashboard Application Logic

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const apiKeyInput = document.getElementById("api-key-input");
  const searchQueryInput = document.getElementById("search-query-input");
  const filterDuration = document.getElementById("filter-duration");
  const filterPeriod = document.getElementById("filter-period");
  const filterRatio = document.getElementById("filter-ratio");
  const filterLimit = document.getElementById("filter-limit");
  
  const btnSaveKey = document.getElementById("btn-save-key");
  const btnRunSearch = document.getElementById("btn-run-search");
  
  const btnViewCard = document.getElementById("btn-view-card");
  const btnViewTable = document.getElementById("btn-view-table");
  
  const btnExportCsv = document.getElementById("btn-export-csv");
  const btnExportXlsx = document.getElementById("btn-export-xlsx");
  
  const btnAccordion = document.getElementById("btn-accordion");
  const accordionContent = document.getElementById("accordion-content");
  
  const demoBanner = document.getElementById("demo-banner");
  const searchStatus = document.getElementById("search-status");
  const searchStatusText = document.getElementById("search-status-text");
  const resultsSection = document.getElementById("results-section");
  const wordCloudContainer = document.getElementById("word-cloud-container");
  const btnRefreshTrends = document.getElementById("btn-refresh-trends");

  // State Variables
  let youtubeApiKey = localStorage.getItem("yt_api_key") || "";
  let searchResults = []; // Master list of current search results
  let filteredResults = []; // List of results after applying local UI filters
  let currentView = "card"; // 'card' or 'table'

  // Initialize
  if (youtubeApiKey) {
    apiKeyInput.value = youtubeApiKey;
    demoBanner.style.display = "none";
  } else {
    demoBanner.style.display = "flex";
  }
  fetchTrendingTags();

  // Accordion Logic
  btnAccordion.addEventListener("click", () => {
    btnAccordion.classList.toggle("active");
    if (btnAccordion.classList.contains("active")) {
      accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
    } else {
      accordionContent.style.maxHeight = "0";
    }
  });

  // Save API Key Logic
  btnSaveKey.addEventListener("click", () => {
    const key = apiKeyInput.value.trim();
    if (key) {
      localStorage.setItem("yt_api_key", key);
      youtubeApiKey = key;
      demoBanner.style.display = "none";
      alert("YouTube API Key가 성공적으로 저장되었습니다!");
    } else {
      localStorage.removeItem("yt_api_key");
      youtubeApiKey = "";
      demoBanner.style.display = "flex";
      alert("저장된 API Key를 삭제하고 데모 모드로 전환합니다.");
    }
  });

  // Refresh Trends Button
  if (btnRefreshTrends) {
    btnRefreshTrends.addEventListener("click", () => {
      fetchTrendingTags();
    });
  }

  // Toggle View Modes
  btnViewCard.addEventListener("click", () => {
    currentView = "card";
    btnViewCard.classList.add("active");
    btnViewTable.classList.remove("active");
    renderResults();
  });

  btnViewTable.addEventListener("click", () => {
    currentView = "table";
    btnViewTable.classList.add("active");
    btnViewCard.classList.remove("active");
    renderResults();
  });

  // Run Search Button Listener
  btnRunSearch.addEventListener("click", () => {
    executeSearch();
  });

  // Enter Key on search inputs
  searchQueryInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      executeSearch();
    }
  });

  // Local Filter Listeners
  filterRatio.addEventListener("change", () => {
    applyFilters();
  });
  filterDuration.addEventListener("change", () => {
    // If using mock, filter locally. If using API, it is safer to re-fetch as YouTube handles duration server-side.
    if (!youtubeApiKey) {
      applyFilters();
    } else {
      executeSearch();
    }
  });
  filterPeriod.addEventListener("change", () => {
    if (!youtubeApiKey) {
      applyFilters();
    } else {
      executeSearch();
    }
  });

  // Export Buttons
  btnExportCsv.addEventListener("click", () => {
    exportToCSV();
  });

  btnExportXlsx.addEventListener("click", () => {
    exportToExcel();
  });

  // ==========================================
  // Core Search & API Operations
  // ==========================================

  async function executeSearch() {
    const query = searchQueryInput.value.trim();
    if (!query) {
      alert("검색어를 입력해 주세요.");
      return;
    }

    resultsSection.innerHTML = "";
    searchStatus.style.display = "flex";
    btnRunSearch.disabled = true;

    if (!youtubeApiKey) {
      // Mock Demo Mode
      searchStatusText.innerText = "로컬 모의 데이터를 로드하여 시뮬레이션 중입니다...";
      setTimeout(() => {
        searchResults = getMockData(query);
        applyFilters();
        searchStatus.style.display = "none";
        btnRunSearch.disabled = false;
      }, 800);
    } else {
      // Real API Mode
      try {
        searchStatusText.innerText = "YouTube API로부터 영상 검색 리스트를 가져오고 있습니다...";
        const limit = parseInt(filterLimit.value) || 50;
        
        // Duration and Period maps for API
        const apiDuration = filterDuration.value;
        const apiPeriod = filterPeriod.value;
        
        let searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${limit}&type=video&key=${youtubeApiKey}`;
        if (apiDuration !== "any") {
          searchUrl += `&videoDuration=${apiDuration}`;
        }
        
        if (apiPeriod !== "any") {
          const publishedAfter = calculatePublishedAfter(apiPeriod);
          searchUrl += `&publishedAfter=${publishedAfter}`;
        }

        const searchRes = await fetch(searchUrl);
        if (!searchRes.ok) {
          throw new Error(`검색 API 호출 실패 (HTTP ${searchRes.status})`);
        }
        
        const searchData = await searchRes.json();
        const items = searchData.items || [];
        
        if (items.length === 0) {
          showEmptyState("검색 결과가 없습니다.");
          searchStatus.style.display = "none";
          btnRunSearch.disabled = false;
          return;
        }

        searchStatusText.innerText = "영상의 상세 정보(조회수, 길이)를 수집하는 중입니다...";
        const videoIds = items.map(item => item.id.videoId).join(",");
        
        const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${youtubeApiKey}`;
        const videosRes = await fetch(videosUrl);
        if (!videosRes.ok) {
          throw new Error("비디오 상세 API 호출 실패");
        }
        const videosData = await videosRes.json();
        const videoItems = videosData.items || [];
        const videoInfoMap = {};
        videoItems.forEach(item => {
          videoInfoMap[item.id] = {
            viewCount: parseInt(item.statistics.viewCount) || 0,
            duration: parseISODuration(item.contentDetails.duration),
            rawDuration: item.contentDetails.duration
          };
        });

        searchStatusText.innerText = "채널의 구독자 정보를 수집하는 중입니다...";
        const channelIds = [...new Set(items.map(item => item.snippet.channelId))].join(",");
        const channelsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIds}&key=${youtubeApiKey}`;
        const channelsRes = await fetch(channelsUrl);
        if (!channelsRes.ok) {
          throw new Error("채널 상세 API 호출 실패");
        }
        const channelsData = await channelsRes.json();
        const channelItems = channelsData.items || [];
        const channelInfoMap = {};
        channelItems.forEach(item => {
          channelInfoMap[item.id] = {
            subscriberCount: parseInt(item.statistics.subscriberCount) || 0
          };
        });

        // Assemble Search Results
        searchResults = items.map(item => {
          const videoId = item.id.videoId;
          const snippet = item.snippet;
          
          const videoInfo = videoInfoMap[videoId] || { viewCount: 0, duration: "00:00", rawDuration: "" };
          const channelInfo = channelInfoMap[snippet.channelId] || { subscriberCount: 0 };
          
          const viewCount = videoInfo.viewCount;
          const subscriberCount = channelInfo.subscriberCount;
          
          // Calculate Ratio
          let ratio = 0;
          if (subscriberCount > 0) {
            ratio = viewCount / subscriberCount;
          } else if (viewCount > 0) {
            ratio = 1; // Fallback if subscriberCount is zero but views exist
          }
          
          // Compute Ratio Step
          let ratioStep = 1;
          if (ratio < 0.2) ratioStep = 1;
          else if (ratio >= 0.2 && ratio < 0.6) ratioStep = 2;
          else if (ratio >= 0.6 && ratio < 1.4) ratioStep = 3;
          else if (ratio >= 1.4 && ratio < 3) ratioStep = 4;
          else ratioStep = 5;

          return {
            videoId,
            title: snippet.title,
            thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || "",
            channelTitle: snippet.channelTitle,
            channelId: snippet.channelId,
            publishedAt: snippet.publishedAt,
            duration: videoInfo.duration,
            rawDuration: videoInfo.rawDuration,
            viewCount,
            subscriberCount,
            ratio,
            ratioStep
          };
        });

        applyFilters();
        
      } catch (err) {
        console.error(err);
        alert(`검색 중 오류가 발생했습니다: ${err.message}`);
        showEmptyState("오류가 발생했습니다. 도움말을 확인해 주세요.");
      } finally {
        searchStatus.style.display = "none";
        btnRunSearch.disabled = false;
      }
    }
  }

  // ==========================================
  // Filtering & Sorting
  // ==========================================

  function applyFilters() {
    const ratioFilter = filterRatio.value;
    const durationFilter = filterDuration.value;
    const periodFilter = filterPeriod.value;

    filteredResults = searchResults.filter(item => {
      // 1. Ratio filter
      if (ratioFilter !== "all" && item.ratioStep !== parseInt(ratioFilter)) {
        return false;
      }

      // 2. Duration filter (Only needed locally in mock mode, API handles duration server side)
      if (!youtubeApiKey && durationFilter !== "any") {
        const minutes = getDurationMinutes(item.duration);
        if (durationFilter === "short" && minutes >= 4) return false;
        if (durationFilter === "medium" && (minutes < 4 || minutes > 20)) return false;
        if (durationFilter === "long" && minutes <= 20) return false;
      }

      // 3. Period filter (Only needed locally in mock mode)
      if (!youtubeApiKey && periodFilter !== "any") {
        const uploadDate = new Date(item.publishedAt);
        const now = new Date();
        const diffTime = Math.abs(now - uploadDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (periodFilter === "today" && diffDays > 1) return false;
        if (periodFilter === "week" && diffDays > 7) return false;
        if (periodFilter === "month" && diffDays > 30) return false;
        if (periodFilter === "year" && diffDays > 365) return false;
      }

      return true;
    });

    // Sort: ratio descending (Viral items first)
    filteredResults.sort((a, b) => b.ratio - a.ratio);

    renderResults();
  }

  // ==========================================
  // Rendering
  // ==========================================

  function renderResults() {
    resultsSection.innerHTML = "";

    if (filteredResults.length === 0) {
      showEmptyState("필터 조건에 맞는 검색 결과가 없습니다.");
      return;
    }

    if (currentView === "card") {
      // Render Card Grid
      const grid = document.createElement("div");
      grid.className = "results-grid";
      
      filteredResults.forEach(item => {
        const card = document.createElement("article");
        card.className = "video-card glass-panel";
        
        card.innerHTML = `
          <div class="card-thumbnail-wrapper">
            <a href="https://www.youtube.com/watch?v=${item.videoId}" target="_blank" rel="noopener noreferrer">
              <img src="${item.thumbnail}" alt="${escapeHtml(item.title)}" loading="lazy">
            </a>
            <span class="video-duration">${item.duration}</span>
          </div>
          <div class="card-body">
            <a href="https://www.youtube.com/watch?v=${item.videoId}" target="_blank" rel="noopener noreferrer" class="video-title" title="${escapeHtml(item.title)}">
              ${escapeHtml(item.title)}
            </a>
            <div class="video-channel">
              <i class="fa-solid fa-circle-check"></i>
              <span class="table-channel">${escapeHtml(item.channelTitle)}</span>
            </div>
            
            <div class="card-stats-grid">
              <div class="stat-box">
                <span class="label">구독자수</span>
                <span class="value">${formatKoreanShorthand(item.subscriberCount)}</span>
              </div>
              <div class="stat-box">
                <span class="label">조회수</span>
                <span class="value">${formatKoreanShorthand(item.viewCount)}회</span>
              </div>
            </div>
            
            <div class="ratio-highlight-row">
              <div class="ratio-value-label">
                <span class="label">조회/구독 비율</span>
                <span class="num">${item.ratio.toFixed(2)}x</span>
              </div>
              <div class="step-badge ${getBadgeClass(item.ratioStep)}">
                <i class="fa-solid fa-chart-line"></i>
                <span>${item.ratioStep}단계</span>
              </div>
            </div>
          </div>
        `;
        grid.appendChild(card);
      });
      resultsSection.appendChild(grid);
    } else {
      // Render Table View
      const tableResp = document.createElement("div");
      tableResp.className = "table-responsive";
      
      let tbodyHtml = "";
      filteredResults.forEach(item => {
        tbodyHtml += `
          <tr>
            <td>
              <div class="table-thumbnail">
                <img src="${item.thumbnail}" alt="Thumbnail">
              </div>
            </td>
            <td>
              <a href="https://www.youtube.com/watch?v=${item.videoId}" target="_blank" rel="noopener noreferrer" class="table-title" title="${escapeHtml(item.title)}">
                ${escapeHtml(item.title)}
              </a>
            </td>
            <td>
              <span class="table-channel">${escapeHtml(item.channelTitle)}</span>
            </td>
            <td>${formatNumber(item.subscriberCount)}명</td>
            <td>${formatNumber(item.viewCount)}회</td>
            <td>
              <span class="table-ratio">${item.ratio.toFixed(2)}x</span>
            </td>
            <td>
              <span class="step-badge ${getBadgeClass(item.ratioStep)}">
                ${item.ratioStep}단계
              </span>
            </td>
            <td>${item.publishedAt.split('T')[0]}</td>
            <td>
              <a href="https://www.youtube.com/watch?v=${item.videoId}" target="_blank" rel="noopener noreferrer" class="btn-table-link" title="YouTube로 이동">
                <i class="fa-brands fa-youtube"></i>
              </a>
            </td>
          </tr>
        `;
      });

      tableResp.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>썸네일</th>
              <th>제목</th>
              <th>채널명</th>
              <th>구독자수</th>
              <th>조회수</th>
              <th>비율</th>
              <th>비율 단계</th>
              <th>업로드일</th>
              <th>링크</th>
            </tr>
          </thead>
          <tbody>
            ${tbodyHtml}
          </tbody>
        </table>
      `;
      resultsSection.appendChild(tableResp);
    }
  }

  function showEmptyState(message) {
    resultsSection.innerHTML = `
      <div class="empty-state">
        <i class="fa-brands fa-youtube"></i>
        <h3>검색 결과가 없습니다</h3>
        <p>${escapeHtml(message)}</p>
      </div>
    `;
  }

  // ==========================================
  // Exports
  // ==========================================

  function exportToCSV() {
    if (filteredResults.length === 0) {
      alert("다운로드할 데이터가 없습니다.");
      return;
    }

    const query = searchQueryInput.value.trim() || "youtube_search";
    
    // Headers
    let csvContent = "\uFEFF"; // UTF-8 BOM to prevent Korean characters corruption in Excel
    csvContent += "동영상 제목,채널명,구독자수,조회수,비율,비율 단계,업로드일,비디오 링크\n";
    
    // Rows
    filteredResults.forEach(r => {
      const cleanTitle = r.title.replace(/"/g, '""');
      const cleanChannel = r.channelTitle.replace(/"/g, '""');
      const link = `https://www.youtube.com/watch?v=${r.videoId}`;
      csvContent += `"${cleanTitle}","${cleanChannel}",${r.subscriberCount},${r.viewCount},${r.ratio.toFixed(2)},"${r.ratioStep}단계",${r.publishedAt.split('T')[0]},"${link}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${query}_유튜브_비율분석.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportToExcel() {
    if (filteredResults.length === 0) {
      alert("다운로드할 데이터가 없습니다.");
      return;
    }

    if (typeof XLSX === "undefined") {
      alert("엑셀 라이브러리(SheetJS)가 로드되지 않았습니다. 인터넷 상태를 확인해 주세요.");
      return;
    }

    const query = searchQueryInput.value.trim() || "youtube_search";
    
    const excelData = filteredResults.map(r => ({
      "동영상 제목": r.title,
      "채널명": r.channelTitle,
      "구독자수": r.subscriberCount,
      "조회수": r.viewCount,
      "비율 (조회/구독)": parseFloat(r.ratio.toFixed(2)),
      "비율 단계": `${r.ratioStep}단계`,
      "업로드일": r.publishedAt.split('T')[0],
      "비디오 링크": `https://www.youtube.com/watch?v=${r.videoId}`
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "YouTube 비율 분석");
    
    // Write out Excel file
    XLSX.writeFile(wb, `${query}_유튜브_비율분석.xlsx`);
  }

  // ==========================================
  // Helper Math/Parsers
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
      // hh:mm:ss
      return parts[0] * 60 + parts[1];
    }
    // mm:ss
    return parts[0];
  }

  function calculatePublishedAfter(period) {
    const date = new Date();
    if (period === "today") date.setDate(date.getDate() - 1);
    else if (period === "week") date.setDate(date.getDate() - 7);
    else if (period === "month") date.setDate(date.getDate() - 30);
    else if (period === "year") date.setDate(date.getDate() - 365);
    return date.toISOString();
  }

  function getBadgeClass(step) {
    switch (step) {
      case 1: return "badge-step1";
      case 2: return "badge-step2";
      case 3: return "badge-step3";
      case 4: return "badge-step4";
      case 5: return "badge-step5";
      default: return "badge-step1";
    }
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
    return n.toLocaleString('ko-KR');
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

  // ==========================================
  // Mock Data Generators for Demo Mode
  // ==========================================

  function getMockData(query) {
    // Return custom mock data for '쿠팡템' query
    if (query === "쿠팡템") {
      return [
        {
          videoId: "mock1",
          title: "자취생 필수! 삶의 질 수직상승하는 다이소/쿠팡 꿀템 10가지 추천",
          thumbnail: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=480&auto=format&fit=crop&q=60",
          channelTitle: "자취생 A의 살림살이",
          channelId: "ch1",
          publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          duration: "08:24",
          viewCount: 154200,
          subscriberCount: 45000,
          ratio: 154200 / 45000, // 3.42 -> Step 5
          ratioStep: 5
        },
        {
          videoId: "mock2",
          title: "이거 모르면 손해! 쿠팡에서 사야할 살림용 주방 꿀템 추천",
          thumbnail: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=480&auto=format&fit=crop&q=60",
          channelTitle: "주방의 마법사",
          channelId: "ch2",
          publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          duration: "04:15",
          viewCount: 2500,
          subscriberCount: 12000,
          ratio: 2500 / 12000, // 0.21 -> Step 2
          ratioStep: 2
        },
        {
          videoId: "mock3",
          title: "쿠팡 직원이 몰래 사는 가성비 개꿀템 탑 7",
          thumbnail: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=480&auto=format&fit=crop&q=60",
          channelTitle: "가성비 리뷰왕",
          channelId: "ch3",
          publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          duration: "11:50",
          viewCount: 840000,
          subscriberCount: 250000,
          ratio: 840000 / 250000, // 3.36 -> Step 5
          ratioStep: 5
        },
        {
          videoId: "mock4",
          title: "진짜 편하다! 숨겨진 생활 밀착형 쿠팡 꿀템들만 모았습니다",
          thumbnail: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=480&auto=format&fit=crop&q=60",
          channelTitle: "리빙템 큐레이터",
          channelId: "ch4",
          publishedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
          duration: "03:45",
          viewCount: 45000,
          subscriberCount: 60000,
          ratio: 45000 / 60000, // 0.75 -> Step 3
          ratioStep: 3
        },
        {
          videoId: "mock5",
          title: "돈값하는 쿠팡 살림템 추천템 9가지 솔직 리뷰",
          thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=480&auto=format&fit=crop&q=60",
          channelTitle: "살림백과사전",
          channelId: "ch5",
          publishedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          duration: "15:10",
          viewCount: 12000,
          subscriberCount: 95000,
          ratio: 12000 / 95000, // 0.12 -> Step 1
          ratioStep: 1
        },
        {
          videoId: "mock6",
          title: "쿠팡에서 후회 없는 만족도 100% 인생템 5선",
          thumbnail: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=480&auto=format&fit=crop&q=60",
          channelTitle: "꿀템수집가",
          channelId: "ch6",
          publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          duration: "05:55",
          viewCount: 98000,
          subscriberCount: 52000,
          ratio: 98000 / 52000, // 1.88 -> Step 4
          ratioStep: 4
        },
        {
          videoId: "mock7",
          title: "이거 진짜 요물입니다.. 직접 써보고 깜짝 놀란 쿠팡 추천템 대공개",
          thumbnail: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=480&auto=format&fit=crop&q=60",
          channelTitle: "아이디어 하우스",
          channelId: "ch7",
          publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          duration: "03:12",
          viewCount: 320000,
          subscriberCount: 80000,
          ratio: 320000 / 80000, // 4.0 -> Step 5
          ratioStep: 5
        },
        {
          videoId: "mock8",
          title: "내돈내산 쿠팡 주방 인테리어 템들 추천 리뷰",
          thumbnail: "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=480&auto=format&fit=crop&q=60",
          channelTitle: "감성키친 브이로그",
          channelId: "ch8",
          publishedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          duration: "22:15",
          viewCount: 8500,
          subscriberCount: 14000,
          ratio: 8500 / 14000, // 0.60 -> Step 3
          ratioStep: 3
        }
      ];
    }

    // Dynamic Mock Data Generator for any other queries
    const mockList = [];
    const titles = [
      `[내돈내산] SNS 난리난 ${query} 대란템 8가지 솔직리뷰`,
      `삶의 질 상승! 꼭 사야 할 ${query} 꿀템 리스트`,
      `진짜 유용해요! 전문가가 추천하는 ${query} 베스트 5`,
      `후회 없는 쇼핑! ${query} 사길 잘한 인생 아이템들`,
      `이거 진짜 신세계네요.. 가격값 톡톡히 하는 ${query} 꿀템`,
      `다이소보다 좋다?! 가성비 지리는 ${query} 살림템 모음`,
      `${query} 쓸데없는거 사지마시고 딱 이거만 사세요!`,
      `자취 필수품! 품절 전에 사야하는 ${query} 용품`,
      `${query} 직접 써보고 결정한 만족도 최상의 아이템 추천`,
      `${query} 샀다가 돈 버린 템 vs 돈 버는 인생템 비교분석`
    ];

    const channels = [
      "리뷰 팩토리", "꿀템 수집가", "자취생 일기", "살림 백과",
      "트렌드 서퍼", "비교 연구소", "쇼퍼 홀릭", "미니멀 하우스"
    ];

    const thumbnails = [
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=480&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=480&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=480&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=480&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=480&auto=format&fit=crop&q=60"
    ];

    for (let i = 0; i < 15; i++) {
      const sub = Math.floor(Math.random() * 200000) + 1000; // 1,000 ~ 200,000 subscribers
      let view = 0;
      
      // Setup various ratios randomly
      const ratioSeed = Math.random();
      if (ratioSeed < 0.2) {
        view = Math.floor(sub * (Math.random() * 0.18)); // Step 1
      } else if (ratioSeed < 0.5) {
        view = Math.floor(sub * (0.2 + Math.random() * 0.38)); // Step 2
      } else if (ratioSeed < 0.75) {
        view = Math.floor(sub * (0.6 + Math.random() * 0.78)); // Step 3
      } else if (ratioSeed < 0.92) {
        view = Math.floor(sub * (1.4 + Math.random() * 1.58)); // Step 4
      } else {
        view = Math.floor(sub * (3.0 + Math.random() * 8.5)); // Step 5
      }

      const ratio = view / sub;
      let ratioStep = 1;
      if (ratio < 0.2) ratioStep = 1;
      else if (ratio >= 0.2 && ratio < 0.6) ratioStep = 2;
      else if (ratio >= 0.6 && ratio < 1.4) ratioStep = 3;
      else if (ratio >= 1.4 && ratio < 3) ratioStep = 4;
      else ratioStep = 5;

      const durationMinutes = Math.floor(Math.random() * 25) + 1;
      const durationSeconds = Math.floor(Math.random() * 59);
      const durationStr = `${String(durationMinutes).padStart(2, '0')}:${String(durationSeconds).padStart(2, '0')}`;

      const daysAgo = Math.floor(Math.random() * 120);

      mockList.push({
        videoId: `mock_dyn_${i}`,
        title: titles[i % titles.length],
        thumbnail: thumbnails[i % thumbnails.length],
        channelTitle: channels[i % channels.length],
        channelId: `ch_dyn_${i}`,
        publishedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        duration: durationStr,
        viewCount: view,
        subscriberCount: sub,
        ratio,
        ratioStep
      });
    }

    return mockList;
  }

  // ==========================================
  // Word Cloud & Trending Topics Operations
  // ==========================================

  async function fetchTrendingTags() {
    if (wordCloudContainer) {
      wordCloudContainer.innerHTML = `
        <div class="word-cloud-loading">
          <i class="fa-solid fa-circle-notch fa-spin"></i> 트렌드를 로드 중입니다...
        </div>`;
    }

    const mock50Trends = [
      { text: "다이소 꿀템", weight: 95 },
      { text: "손흥민", weight: 90 },
      { text: "뉴진스", weight: 88 },
      { text: "자취요리", weight: 82 },
      { text: "에스파", weight: 80 },
      { text: "쿠팡 추천템", weight: 78 },
      { text: "일상 브이로그", weight: 75 },
      { text: "ASMR 먹방", weight: 72 },
      { text: "아이브", weight: 70 },
      { text: "ChatGPT 활용법", weight: 68 },
      { text: "인공지능 AI", weight: 65 },
      { text: "아이폰18 출시일", weight: 63 },
      { text: "신작 오픈월드", weight: 61 },
      { text: "가성비 캠핑장", weight: 59 },
      { text: "해외여행 브이로그", weight: 57 },
      { text: "방구석 요리사", weight: 55 },
      { text: "K-POP 무대교차", weight: 53 },
      { text: "미국 주식 전망", weight: 51 },
      { text: "부동산 투자", weight: 49 },
      { text: "스도쿠 공식", weight: 47 },
      { text: "자전거 국토종주", weight: 45 },
      { text: "헬스 루틴", weight: 44 },
      { text: "식단 관리법", weight: 43 },
      { text: "인테리어 소품", weight: 42 },
      { text: "맥북 에어 M4", weight: 41 },
      { text: "주말 나들이", weight: 40 },
      { text: "영화 리뷰 추천", weight: 39 },
      { text: "넷플릭스 신작", weight: 38 },
      { text: "편의점 꿀조합", weight: 37 },
      { text: "동기부여 명언", weight: 36 },
      { text: "영어 회화 독학", weight: 35 },
      { text: "명상과 치유", weight: 34 },
      { text: "재테크 기초", weight: 33 },
      { text: "코인 투자 리스크", weight: 32 },
      { text: "골프 스윙 자세", weight: 31 },
      { text: "반려동물 브이로그", weight: 30 },
      { text: "고양이 꾹꾹이", weight: 29 },
      { text: "캠핑 요리 레시피", weight: 28 },
      { text: "디저트 카페 투어", weight: 27 },
      { text: "레트로 감성 패션", weight: 26 },
      { text: "미니멀라이프 인테리어", weight: 25 },
      { text: "드론 촬영 입문", weight: 24 },
      { text: "퍼스널 컬러 진단", weight: 23 },
      { text: "도서 추천 베스트", weight: 22 },
      { text: "자기계발 습관", weight: 21 },
      { text: "클라이밍 초보", weight: 20 },
      { text: "홈트레이닝 필라테스", weight: 19 },
      { text: "전자기기 솔직리뷰", weight: 18 },
      { text: "주식 초보 강의", weight: 17 },
      { text: "갓생 사는 법", weight: 15 }
    ];

    if (!youtubeApiKey) {
      setTimeout(() => {
        renderWordCloud(mock50Trends);
      }, 500);
    } else {
      try {
        const trendsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=KR&maxResults=50&key=${youtubeApiKey}`;
        const res = await fetch(trendsUrl);
        if (!res.ok) {
          throw new Error("실시간 인기 동영상 데이터를 가져오지 못했습니다.");
        }
        const data = await res.json();
        const items = data.items || [];
        
        const wordWeights = {};
        items.forEach((item, index) => {
          const snippet = item.snippet || {};
          const tags = snippet.tags || [];
          
          const rankWeight = 50 - index; 
          
          tags.forEach(tag => {
            const cleanTag = tag.trim();
            if (cleanTag.length > 1 && cleanTag.length < 15) {
              wordWeights[cleanTag] = (wordWeights[cleanTag] || 0) + rankWeight;
            }
          });
          
          const title = snippet.title || "";
          const titleWords = title.split(/\s+/);
          titleWords.forEach(word => {
            const cleanWord = word.replace(/[\[\]\(\)\-\,\.\?\!\'\"]/g, "").trim();
            if (cleanWord.length > 1 && cleanWord.length < 10 && !/^(은|는|이|가|을|를|의|에|와|과|으로|로|해서)$/.test(cleanWord)) {
              wordWeights[cleanWord] = (wordWeights[cleanWord] || 0) + (rankWeight * 0.5);
            }
          });
        });
        
        let trendList = Object.entries(wordWeights).map(([text, weight]) => ({ text, weight }));
        trendList.sort((a, b) => b.weight - a.weight);
        trendList = trendList.slice(0, 50);
        
        if (trendList.length === 0) {
          throw new Error("트렌드 키워드를 파싱하지 못했습니다.");
        }
        
        renderWordCloud(trendList);
      } catch (err) {
        console.error("실시간 트렌드 조회 실패:", err.message);
        renderWordCloud(mock50Trends);
      }
    }
  }

  function renderWordCloud(trends) {
    if (!wordCloudContainer) return;
    wordCloudContainer.innerHTML = "";
    wordCloudContainer.style.position = "relative";
    
    if (trends.length === 0) {
      wordCloudContainer.innerHTML = `<span class="word-cloud-loading">트렌드 정보가 없습니다.</span>`;
      return;
    }
    
    const containerWidth = wordCloudContainer.offsetWidth || 800;
    const containerHeight = 400;
    const cx = containerWidth / 2;
    const cy = containerHeight / 2;
    
    const placedRects = [];
    
    const sortedTrends = [...trends].sort((a, b) => b.weight - a.weight);
    
    const weights = sortedTrends.map(t => t.weight);
    const maxWeight = Math.max(...weights) || 1;
    const minWeight = Math.min(...weights) || 0;
    const weightRange = maxWeight - minWeight || 1;
    
    const colors = ["navy", "blue", "cyan", "teal", "indigo"];
    
    const elements = sortedTrends.map((trend, idx) => {
      const normalized = (trend.weight - minWeight) / weightRange;
      const fontSize = 0.85 + (normalized * 1.45);
      
      const wordSpan = document.createElement("span");
      wordSpan.className = `cloud-word color-${colors[idx % colors.length]}`;
      wordSpan.style.fontSize = `${fontSize}rem`;
      wordSpan.style.position = "absolute";
      wordSpan.style.visibility = "hidden";
      wordSpan.innerText = trend.text;
      wordSpan.title = `트렌드 점수: ${Math.round(trend.weight)}`;
      
      const isVertical = (idx % 5 === 0);
      if (isVertical) {
        wordSpan.classList.add("vertical-word");
      } else {
        const rotations = [-8, -4, 0, 4, 8];
        const rot = rotations[idx % rotations.length];
        wordSpan.style.transform = `rotate(${rot}deg)`;
      }
      
      wordCloudContainer.appendChild(wordSpan);
      
      return {
        el: wordSpan,
        text: trend.text,
        fontSize,
        isVertical
      };
    });
    
    requestAnimationFrame(() => {
      elements.forEach((item, idx) => {
        const el = item.el;
        
        let scale = 1.0;
        let placed = false;
        let scaleAttempts = 0;
        
        let finalX = cx;
        let finalY = cy;
        let finalW = 0;
        let finalH = 0;
        
        while (!placed && scaleAttempts < 4) {
          // Adjust font size on retry
          const currentFontSize = item.fontSize * scale;
          el.style.fontSize = `${currentFontSize}rem`;
          
          const rect = el.getBoundingClientRect();
          const w = Math.ceil(rect.width) + 6; // Tight width with padding
          const h = Math.ceil(rect.height) + 6; // Tight height with padding
          
          let theta = 0;
          let r = 0;
          const thetaStep = 0.1;
          const rStep = 0.2; // Denser spiral search (0.2px radius growth per step)
          
          let attempts = 0;
          const maxAttempts = 2000;
          
          while (attempts < maxAttempts) {
            const candX = cx + r * Math.cos(theta) - w / 2;
            const candY = cy + r * Math.sin(theta) - h / 2;
            
            let collision = false;
            const pad = 2; // tight 2px gap
            
            for (let i = 0; i < placedRects.length; i++) {
              const rct = placedRects[i];
              if (
                candX < rct.x + rct.w + pad &&
                candX + w + pad > rct.x &&
                candY < rct.y + rct.h + pad &&
                candY + h + pad > rct.y
              ) {
                collision = true;
                break;
              }
            }
            
            // Bounds check
            if (candX < 5 || candX + w > containerWidth - 5 || candY < 5 || candY + h > containerHeight - 5) {
              collision = true;
            }
            
            if (!collision) {
              finalX = candX;
              finalY = candY;
              finalW = w;
              finalH = h;
              placed = true;
              break;
            }
            
            theta += thetaStep;
            r += rStep;
            attempts++;
          }
          
          if (!placed) {
            scale *= 0.82; // Shrink keyword slightly to fit in smaller gaps
            scaleAttempts++;
          }
        }
        
        // Final fallback: place on outer edges if still blocked
        if (!placed) {
          const angle = Math.random() * 2 * Math.PI;
          const radius = 170 + Math.random() * 25;
          finalW = Math.ceil(el.getBoundingClientRect().width) + 6;
          finalH = Math.ceil(el.getBoundingClientRect().height) + 6;
          finalX = cx + radius * Math.cos(angle) - finalW / 2;
          finalY = cy + radius * Math.sin(angle) - finalH / 2;
          
          // Constrain within container boundaries
          finalX = Math.max(5, Math.min(containerWidth - finalW - 5, finalX));
          finalY = Math.max(5, Math.min(containerHeight - finalH - 5, finalY));
        }
        
        placedRects.push({ x: finalX, y: finalY, w: finalW, h: finalH });
        
        el.style.left = `${finalX}px`;
        el.style.top = `${finalY}px`;
        el.style.visibility = "visible";
        
        el.addEventListener("click", () => {
          searchQueryInput.value = item.text;
          executeSearch();
          resultsSection.scrollIntoView({ behavior: 'smooth' });
        });
      });
    });
  }

});
