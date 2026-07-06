// e:\Antigravity\workspace\Cineaho\ai-rss-news\app.js

document.addEventListener("DOMContentLoaded", () => {
  // --- State Variables ---
  let customSources = [];
  let customArticles = [];
  let allArticles = [];
  
  // Filter settings
  let searchQuery = "";
  let activeCategory = "all";
  let activePeriod = "all"; // all, 24h, 7d, 30d
  let activeSourceFilter = "all"; // Specific source name or 'all'
  let sortOrder = "latest"; // latest, source
  let showTranslation = true;
  let consolidateDuplicates = false;
  
  // Infinite scroll limits per column
  const scrollLimits = {
    1: 20,
    2: 20,
    3: 20
  };

  // --- DOM Elements ---
  const searchInput = document.getElementById("search-input");
  const filterPeriod = document.getElementById("filter-period");
  const filterSource = document.getElementById("filter-source");
  const categoryFilters = document.getElementById("category-filters");
  
  // Buttons
  const btnSortLatest = document.getElementById("btn-sort-latest");
  const btnSortSource = document.getElementById("btn-sort-source");
  const btnToggleTranslation = document.getElementById("btn-toggle-translation");
  const btnToggleDuplicate = document.getElementById("btn-toggle-duplicate");
  const btnReset = document.getElementById("btn-reset");
  const btnRefresh = document.getElementById("btn-refresh");
  
  // RSS Drawer
  const btnToggleRssDrawer = document.getElementById("btn-toggle-rss-drawer");
  const rssDrawer = document.getElementById("rss-drawer");
  const rssDrawerClose = document.getElementById("rss-drawer-close");
  const addRssForm = document.getElementById("add-rss-form");
  const feedSourcesList = document.getElementById("feed-sources-list");
  
  // Columns content wrappers
  const colKContent = document.getElementById("col-k-content");
  const colF1Content = document.getElementById("col-f1-content");
  const colF2Content = document.getElementById("col-f2-content");
  
  // Counts
  const colKCount = document.getElementById("col-k-count");
  const colF1Count = document.getElementById("col-f1-count");
  const colF2Count = document.getElementById("col-f2-count");

  // Floating controls
  const scrollProgress = document.getElementById("scroll-progress");
  const btnScrollTop = document.getElementById("btn-scroll-top");
  const btnScrollBottom = document.getElementById("btn-scroll-bottom");
  
  // Overlay
  const statusOverlay = document.getElementById("status-overlay");
  const statusMessage = document.getElementById("status-message");

  // --- Local Storage Management ---
  function loadFromLocalStorage() {
    try {
      const storedSources = localStorage.getItem("custom_rss_sources");
      if (storedSources) {
        customSources = JSON.parse(storedSources);
      }
      
      const storedArticles = localStorage.getItem("custom_rss_articles");
      if (storedArticles) {
        customArticles = JSON.parse(storedArticles).map(art => {
          art.pubDate = new Date(art.pubDate);
          return art;
        });
      }
    } catch (e) {
      console.error("Local storage load failed", e);
    }
  }

  function saveToLocalStorage() {
    localStorage.setItem("custom_rss_sources", JSON.stringify(customSources));
    localStorage.setItem("custom_rss_articles", JSON.stringify(customArticles));
  }

  async function fetchAndParseRSS(feedSource) {
    let xmlText = "";

    // Try multiple fetch strategies in order
    const strategies = [
      // 1. Local server proxy (best option)
      async () => {
        const proxyUrl = `/api/rss-proxy?url=${encodeURIComponent(feedSource.url)}&_t=${Date.now()}`;
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`Local proxy status: ${res.status}`);
        return await res.text();
      },
      // 2. Fallback: corsproxy.io public CORS proxy
      async () => {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(feedSource.url)}`;
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`corsproxy.io status: ${res.status}`);
        return await res.text();
      },
      // 3. Fallback: api.allorigins.win public CORS proxy
      async () => {
        const cacheBuster = feedSource.url + (feedSource.url.includes('?') ? '&' : '?') + `_t=${Date.now()}`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(cacheBuster)}`;
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`allorigins status: ${res.status}`);
        return await res.text();
      }
    ];

    for (let i = 0; i < strategies.length; i++) {
      try {
        xmlText = await strategies[i]();
        break; // Success, stop trying
      } catch (err) {
        console.warn(`[RSS] Strategy ${i + 1} failed for ${feedSource.name}:`, err.message);
        if (i === strategies.length - 1) {
          // All strategies failed
          throw new Error(`All fetch strategies failed for ${feedSource.name}`);
        }
      }
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");
    
    // Check if XML parsing succeeded
    const parseError = xmlDoc.querySelector("parsererror");
    if (parseError) throw new Error("XML Parsing error");
    
    // Parse RSS items or Atom entries
    const items = xmlDoc.querySelectorAll("item, entry");
    const parsedArticles = [];
    
    // Helper to search child elements by localName (ignoring namespaces)
    function getElementTextByLocalName(element, name) {
      if (!element) return "";
      const children = Array.from(element.children || element.childNodes).filter(n => n.nodeType === 1);
      const child = children.find(c => c.localName === name);
      if (child) return child.textContent?.trim() || "";
      
      // If not found in immediate children, search descendants (depth first)
      const allDescendants = element.getElementsByTagName("*");
      for (let i = 0; i < allDescendants.length; i++) {
        if (allDescendants[i].localName === name) {
          return allDescendants[i].textContent?.trim() || "";
        }
      }
      return "";
    }
    
    items.forEach(item => {
      const title = getElementTextByLocalName(item, "title") || "제목 없음";
      
      let link = "#";
      // Find all child elements of item
      const children = Array.from(item.children || item.childNodes).filter(n => n.nodeType === 1);
      
      // Look for elements with localName "link"
      const linkEls = children.filter(child => child.localName === "link");
      for (const linkEl of linkEls) {
        const href = linkEl.getAttribute("href");
        const rel = linkEl.getAttribute("rel");
        
        if (href) {
          if (!rel || rel === "alternate") {
            link = href;
            break;
          }
        } else if (linkEl.textContent?.trim()) {
          const text = linkEl.textContent.trim();
          if (text.startsWith("http://") || text.startsWith("https://") || text !== "") {
            link = text;
            break;
          }
        }
      }
      
      if (link === "#" || link === "") {
        // Fallback: look for localName "guid" or "id"
        const guidEl = children.find(child => child.localName === "guid" || child.localName === "id");
        if (guidEl) {
          const guidText = guidEl.textContent.trim();
          if (guidText.startsWith("http://") || guidText.startsWith("https://")) {
            link = guidText;
          }
        }
      }
      
      if (link === "#" || link === "") {
        link = feedSource.url;
      }
      
      const pubDateStr = getElementTextByLocalName(item, "pubDate") || 
                         getElementTextByLocalName(item, "date") || 
                         getElementTextByLocalName(item, "updated") || 
                         getElementTextByLocalName(item, "published") || "";
      
      let pubDate = new Date();
      if (pubDateStr) {
        const parsedDate = new Date(pubDateStr);
        if (!isNaN(parsedDate.getTime())) {
          pubDate = parsedDate;
        }
      }
      
      // Auto-translate for English titles
      const translation = translateTitle(title);
      
      // Generate a unique ID using a stable URL hash
      const cleanLink = link.replace(/[\/\?#&]/g, "_");
      const linkHash = cleanLink.substring(Math.max(0, cleanLink.length - 24));
      
      parsedArticles.push({
        id: `rss-${feedSource.id}-${linkHash}`,
        title,
        link,
        source: feedSource.name,
        category: feedSource.category || "일반/AI",
        pubDate,
        translation: translation !== title ? translation : null,
        column: parseInt(feedSource.column)
      });
    });

    return parsedArticles;
  }

  // Basic title translator for tech headlines
  function translateTitle(title) {
    if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(title)) {
      return title; // Already contains Korean
    }
    
    const mappings = {
      "files confidential": "비공개 상장 신청",
      "ipo": "기업공개(IPO)",
      "released": "출시 완료",
      "sues": "고소/기소",
      "openAI": "오픈AI",
      "anthropic": "앤트로픽",
      "google": "구글",
      "nvidia": "엔비디아",
      "microsoft": "마이크로소프트",
      "meta": "메타",
      "llm": "대형언어모델(LLM)",
      "agi": "일반인공지능(AGI)",
      "supercomputer": "슈퍼컴퓨터",
      "robot": "로봇",
      "intelligence": "지능",
      "artificial": "인공",
      "learning": "러닝",
      "neural": "신경망"
    };
    
    let kTitle = title;
    Object.keys(mappings).forEach(k => {
      const regex = new RegExp(k, "gi");
      kTitle = kTitle.replace(regex, mappings[k]);
    });
    
    if (kTitle === title) {
      return `[자동번역] ${title}`;
    }
    return `[번역] ${kTitle}`;
  }

  // --- Load all sources and aggregate articles ---
  async function aggregateArticles(showLoading = false) {
    if (showLoading) {
      statusOverlay.classList.add("active");
      statusMessage.textContent = "최신 RSS 피드를 수집하고 수집 데이터를 갱신하는 중...";
    }
    
    // Combine pre-populated articles and user-added offline custom articles
    allArticles = [...prePopulatedArticles.map(art => {
      // Ensure pubDate is a Date object
      art.pubDate = new Date(art.pubDate);
      return art;
    }), ...customArticles];

    const activeSources = [...defaultRSSSources, ...customSources];
    
    // Attempt real-time fetch from each active feed source asynchronously
    const fetchPromises = activeSources.map(async (source) => {
      try {
        const fetchedItems = await fetchAndParseRSS(source);
        if (fetchedItems.length > 0) {
          // Merge fetched items, ensuring no duplicates by link
          fetchedItems.forEach(fetchedArt => {
            const exists = allArticles.some(existing => existing.link === fetchedArt.link);
            if (!exists) {
              allArticles.push(fetchedArt);
              // Save to customArticles for offline persistence
              customArticles.push(fetchedArt);
            }
          });
        }
      } catch (err) {
        console.warn(`Feed fetch failed for ${source.name}: ${err.message}`);
      }
    });

    // Wait up to 5 seconds for fetches to finish
    await Promise.all(fetchPromises.map(p => Promise.race([p, new Promise(res => setTimeout(res, 5000))])));
    
    saveToLocalStorage();
    
    if (showLoading) {
      statusOverlay.classList.remove("active");
    }

    populateSourceFilterOptions();
    applyFiltersAndRender();
  }

  // --- Dynamic Dropdown Population ---
  function populateSourceFilterOptions() {
    // Get unique source names
    const sourceNames = [...new Set(allArticles.map(art => art.source))];
    
    filterSource.innerHTML = `<option value="all">전체 언론사</option>`;
    sourceNames.forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      if (name === activeSourceFilter) option.selected = true;
      filterSource.appendChild(option);
    });
  }

  // --- Date formatters ---
  function formatKoreanDate(dateObj) {
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return "날짜 정보 없음";
    }
    const y = dateObj.getFullYear();
    const m = dateObj.getMonth() + 1;
    const d = dateObj.getDate();
    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${y}. ${m}. ${d}. ${ampm} ${hours}:${minutes}`;
  }

  // --- Filter and Sort ---
  function applyFiltersAndRender() {
    let filtered = [...allArticles];

    // 1. Search Query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(art => {
        const titleMatch = art.title.toLowerCase().includes(query);
        const sourceMatch = art.source.toLowerCase().includes(query);
        const transMatch = art.translation ? art.translation.toLowerCase().includes(query) : false;
        return titleMatch || sourceMatch || transMatch;
      });
    }

    // 2. Category Filter
    if (activeCategory !== "all") {
      filtered = filtered.filter(art => art.category === activeCategory);
    }

    // 3. Period Filter
    if (activePeriod !== "all") {
      const now = new Date();
      filtered = filtered.filter(art => {
        const diffMs = now - art.pubDate;
        const diffHrs = diffMs / (1000 * 60 * 60);
        if (activePeriod === "24h") return diffHrs <= 24;
        if (activePeriod === "7d") return diffHrs <= 24 * 7;
        if (activePeriod === "30d") return diffHrs <= 24 * 30;
        return true;
      });
    }

    // 4. Source Filter
    if (activeSourceFilter !== "all") {
      filtered = filtered.filter(art => art.source === activeSourceFilter);
    }

    // 5. Duplicate consolidation
    if (consolidateDuplicates) {
      const seenTitles = new Set();
      filtered = filtered.filter(art => {
        const cleanTitle = art.title.trim().toLowerCase();
        if (seenTitles.has(cleanTitle)) {
          return false;
        }
        seenTitles.add(cleanTitle);
        return true;
      });
    }

    // 6. Sort
    if (sortOrder === "latest") {
      filtered.sort((a, b) => b.pubDate - a.pubDate);
    } else {
      // Sort alphabetically by source name, then by date
      filtered.sort((a, b) => {
        const srcCompare = a.source.localeCompare(b.source, "ko-KR");
        if (srcCompare !== 0) return srcCompare;
        return b.pubDate - a.pubDate;
      });
    }

    // Distribute to columns and render
    renderColumns(filtered);
  }

  // --- Rendering Columns ---
  function renderColumns(filteredList) {
    // Separate by column
    const colKList = filteredList.filter(art => art.column === 1);
    const colF1List = filteredList.filter(art => art.column === 2);
    const colF2List = filteredList.filter(art => art.column === 3);

    // Update Counts Labels
    colKCount.textContent = `총 ${formatNumber(colKList.length)}건 · ${formatNumber(Math.min(scrollLimits[1], colKList.length))}건 표시`;
    colF1Count.textContent = `총 ${formatNumber(colF1List.length)}건 · ${formatNumber(Math.min(scrollLimits[2], colF1List.length))}건 표시`;
    colF2Count.textContent = `총 ${formatNumber(colF2List.length)}건 · ${formatNumber(Math.min(scrollLimits[3], colF2List.length))}건 표시`;

    // Render Column 1
    renderColumnCards(colKContent, colKList.slice(0, scrollLimits[1]));
    // Render Column 2
    renderColumnCards(colF1Content, colF1List.slice(0, scrollLimits[2]));
    // Render Column 3
    renderColumnCards(colF2Content, colF2List.slice(0, scrollLimits[3]));
  }

  function renderColumnCards(container, list) {
    container.innerHTML = "";
    if (list.length === 0) {
      container.innerHTML = `<div class="empty-state" style="padding:40px; text-align:center; color: var(--text-muted);">뉴스 카드가 없습니다.</div>`;
      return;
    }

    list.forEach(art => {
      const card = document.createElement("div");
      card.className = "news-card";
      
      // Link to original source on click
      card.addEventListener("click", () => {
        window.open(art.link, "_blank");
      });

      let translationHtml = "";
      if (showTranslation && art.translation) {
        translationHtml = `<div class="card-translation">${art.translation}</div>`;
      }

      card.innerHTML = `
        <div class="card-top">
          <span class="card-source" title="${art.source}">${art.source}</span>
          <span class="category-badge" data-cat="${art.category}">${art.category}</span>
        </div>
        <a class="card-title" href="${art.link}" target="_blank" onclick="event.stopPropagation();">${art.title}</a>
        ${translationHtml}
        <div class="card-date">${formatKoreanDate(art.pubDate)}</div>
      `;

      container.appendChild(card);
    });
  }

  function formatNumber(num) {
    return num.toLocaleString("ko-KR");
  }

  // --- RSS Drawer rendering ---
  function renderFeedSourcesList() {
    feedSourcesList.innerHTML = "";
    const custom = [...customSources];
    
    // Add default sources as read-only items
    defaultRSSSources.forEach(src => {
      const li = document.createElement("li");
      li.className = "feed-item";
      li.innerHTML = `
        <div class="feed-item-info">
          <span class="feed-item-name">${src.name} <small style="color:var(--text-muted);">(기본)</small></span>
          <span class="feed-item-url">${src.url}</span>
        </div>
        <span style="font-size:10px; color:var(--text-muted);">고정됨</span>
      `;
      feedSourcesList.appendChild(li);
    });

    // Add custom sources with delete button
    custom.forEach(src => {
      const li = document.createElement("li");
      li.className = "feed-item";
      li.innerHTML = `
        <div class="feed-item-info">
          <span class="feed-item-name">${src.name}</span>
          <span class="feed-item-url">${src.url}</span>
        </div>
        <button class="feed-delete-btn" data-id="${src.id}">삭제</button>
      `;
      
      li.querySelector(".feed-delete-btn").addEventListener("click", (e) => {
        const idToDelete = e.target.dataset.id;
        deleteRSSSource(idToDelete);
      });

      feedSourcesList.appendChild(li);
    });
  }

  function deleteRSSSource(id) {
    customSources = customSources.filter(src => src.id !== id);
    // Delete corresponding custom articles too to keep it clean
    customArticles = customArticles.filter(art => !art.id.includes(`rss-${id}`));
    saveToLocalStorage();
    renderFeedSourcesList();
    aggregateArticles(false);
  }

  // --- Event Listeners ---
  
  // Drawer toggles
  btnToggleRssDrawer.addEventListener("click", () => {
    rssDrawer.classList.toggle("open");
    renderFeedSourcesList();
  });

  rssDrawerClose.addEventListener("click", () => {
    rssDrawer.classList.remove("open");
  });

  // Search input change
  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value;
    applyFiltersAndRender();
  });

  // Period select filter
  filterPeriod.addEventListener("change", (e) => {
    activePeriod = e.target.value;
    applyFiltersAndRender();
  });

  // Source select filter
  filterSource.addEventListener("change", (e) => {
    activeSourceFilter = e.target.value;
    applyFiltersAndRender();
  });

  // Categories click filters
  categoryFilters.addEventListener("click", (e) => {
    const btn = e.target.closest(".category-btn");
    if (!btn) return;

    categoryFilters.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    activeCategory = btn.dataset.category;
    applyFiltersAndRender();
  });

  // Sorting buttons
  btnSortLatest.addEventListener("click", () => {
    btnSortLatest.classList.add("active");
    btnSortSource.classList.remove("active");
    sortOrder = "latest";
    applyFiltersAndRender();
  });

  btnSortSource.addEventListener("click", () => {
    btnSortSource.classList.add("active");
    btnSortLatest.classList.remove("active");
    sortOrder = "source";
    applyFiltersAndRender();
  });

  // Translation display toggle
  btnToggleTranslation.addEventListener("click", () => {
    showTranslation = !showTranslation;
    btnToggleTranslation.classList.toggle("active", showTranslation);
    applyFiltersAndRender();
  });

  // Duplicate consolidation toggle
  btnToggleDuplicate.addEventListener("click", () => {
    consolidateDuplicates = !consolidateDuplicates;
    btnToggleDuplicate.classList.toggle("active", consolidateDuplicates);
    btnToggleDuplicate.textContent = consolidateDuplicates ? "중복묶기ON" : "중복묶기OFF";
    applyFiltersAndRender();
  });

  // Refresh feed aggregation
  btnRefresh.addEventListener("click", () => {
    aggregateArticles(true);
  });

  // Reset filter configuration
  btnReset.addEventListener("click", () => {
    searchInput.value = "";
    searchQuery = "";
    activeCategory = "all";
    activePeriod = "all";
    activeSourceFilter = "all";
    sortOrder = "latest";
    showTranslation = true;
    consolidateDuplicates = false;

    // Reset UI Active States
    filterPeriod.value = "all";
    filterSource.value = "all";
    categoryFilters.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    categoryFilters.querySelector('[data-category="all"]').classList.add("active");
    
    btnSortLatest.classList.add("active");
    btnSortSource.classList.remove("active");
    btnToggleTranslation.classList.add("active");
    btnToggleDuplicate.classList.remove("active");
    btnToggleDuplicate.textContent = "중복묶기OFF";

    applyFiltersAndRender();
  });

  // Add RSS Form submission
  addRssForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = document.getElementById("feed-url").value.trim();
    const name = document.getElementById("feed-name").value.trim();
    const col = document.getElementById("feed-column").value;
    const cat = document.getElementById("feed-category").value;

    if (!url || !name) return;

    statusOverlay.classList.add("active");
    statusMessage.textContent = `"${name}" RSS 소스 유효성을 검사하고 파싱하는 중...`;

    const newSource = {
      id: `custom-${Date.now()}`,
      name,
      url,
      column: parseInt(col),
      category: cat
    };

    try {
      // Validate RSS and harvest initial articles via CORS proxy
      const parsedItems = await fetchAndParseRSS(newSource);
      
      // Save source
      customSources.push(newSource);
      
      // Merge articles
      if (parsedItems && parsedItems.length > 0) {
        parsedItems.forEach(art => {
          const exists = customArticles.some(existing => existing.link === art.link);
          if (!exists) {
            customArticles.push(art);
          }
        });
      }
      
      saveToLocalStorage();
      addRssForm.reset();
      
      statusMessage.textContent = `"${name}" RSS 등록 성공! 총 ${parsedItems.length}개의 최신 기사를 수집했습니다.`;
      setTimeout(() => {
        statusOverlay.classList.remove("active");
        renderFeedSourcesList();
        aggregateArticles(false);
      }, 1200);

    } catch (err) {
      console.error(err);
      // Fallback: If CORS blocks it or proxy fails, let the user register it anyway!
      customSources.push(newSource);
      saveToLocalStorage();
      addRssForm.reset();
      
      statusMessage.textContent = `⚠️ 파싱 에러 또는 CORS 차단! 피드 주소 등록만 완료했습니다. (연동 실패)`;
      setTimeout(() => {
        statusOverlay.classList.remove("active");
        renderFeedSourcesList();
        aggregateArticles(false);
      }, 2500);
    }
  });

  // --- Infinite Scroll Setup ---
  function setupInfiniteScroll(container, columnId) {
    container.addEventListener("scroll", () => {
      const threshold = 30; // px from bottom
      const position = container.scrollTop + container.clientHeight;
      const height = container.scrollHeight;

      if (position >= height - threshold) {
        // Load 20 more
        scrollLimits[columnId] += 20;
        applyFiltersAndRender();
      }
    });
  }

  setupInfiniteScroll(colKContent, 1);
  setupInfiniteScroll(colF1Content, 2);
  setupInfiniteScroll(colF2Content, 3);

  // --- Scroll Progress & Float Utility Controls ---
  window.addEventListener("scroll", updateScrollProgress, true);

  function updateScrollProgress() {
    const hoveredColumn = document.querySelector(".news-column:hover .column-cards-wrapper");
    if (hoveredColumn) {
      const top = hoveredColumn.scrollTop;
      const height = hoveredColumn.scrollHeight - hoveredColumn.clientHeight;
      if (height > 0) {
        const pct = Math.round((top / height) * 100);
        scrollProgress.textContent = `${pct}%`;
        return;
      }
    }
    scrollProgress.textContent = "0%";
  }

  btnScrollTop.addEventListener("click", () => {
    const activeCol = document.querySelector(".news-column:hover .column-cards-wrapper") || colKContent;
    activeCol.scrollTo({ top: 0, behavior: "smooth" });
  });

  btnScrollBottom.addEventListener("click", () => {
    const activeCol = document.querySelector(".news-column:hover .column-cards-wrapper") || colKContent;
    activeCol.scrollTo({ top: activeCol.scrollHeight, behavior: "smooth" });
  });

  // --- Start Up Executions ---
  loadFromLocalStorage();
  aggregateArticles(true); // Fetch and refresh feeds with spinner at startup
});
