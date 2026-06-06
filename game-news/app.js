// e:\Antigravity\workspace\Cineaho\game-news\app.js

document.addEventListener("DOMContentLoaded", () => {
  // --- Web Audio Chimes Synthesizer ---
  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playChime(type) {
    try {
      initAudio();
      if (!audioCtx) return;
      
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      const now = audioCtx.currentTime;
      if (type === 'click') {
        osc.frequency.setValueAtTime(650, now);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'warn') {
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(196, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      console.warn("Audio Context blocked or failed:", e.message);
    }
  }

  // Bind click sound globally to interactive elements
  document.querySelectorAll("button, select, .feed-tab-btn, a").forEach(el => {
    el.addEventListener("click", () => playChime('click'));
  });

  // --- State Variables ---
  let bookmarkedNews = [];
  let currentFeedFilter = "all";
  let searchQuery = "";
  let appVisitCount = 0;
  let activeNewsList = [];

  // --- Seed Datasets ---
  const freeGames = [
    {
      title: "Songs of Conquest",
      platform: "epic",
      originalPrice: "34,000원",
      timeLimit: "6월 12일 01:00까지",
      link: "https://store.epicgames.com/ko/p/songs-of-conquest"
    },
    {
      title: "Rogue Waters",
      platform: "epic",
      originalPrice: "32,000원",
      timeLimit: "6월 12일 01:00까지",
      link: "https://store.epicgames.com/ko/p/rogue-waters"
    },
    {
      title: "Gravity Circuit",
      platform: "steam",
      originalPrice: "23,500원",
      timeLimit: "6월 14일 12:00까지",
      link: "https://store.steampowered.com/app/858620/Gravity_Circuit/"
    },
    {
      title: "Tell Me Why",
      platform: "steam",
      originalPrice: "21,000원",
      timeLimit: "7월 1일 00:00까지",
      link: "https://store.steampowered.com/app/1180660/Tell_Me_Why/"
    },
    {
      title: "Mafia III: Definitive Edition",
      platform: "gog",
      originalPrice: "43,000원",
      timeLimit: "7월 6일 18:00까지",
      link: "https://www.gog.com/en/game/mafia_iii_definitive_edition"
    },
    {
      title: "XCOM: Chimera Squad",
      platform: "gog",
      originalPrice: "22,000원",
      timeLimit: "8월 31일 18:00까지",
      link: "https://www.gog.com/en/game/xcom_chimera_squad"
    }
  ];

  const seedNews = [
    {
      title: "나 혼자만 레벨업: 어라이즈, 글로벌 누적 다운로드 2000만 돌파",
      description: "넷마블의 신작 액션 RPG '나 혼자만 레벨업: 어라이즈'가 출시 2주 만에 글로벌 누적 다운로드 2000만 회를 돌파하며 강력한 지식재산권(IP) 파워를 입증했습니다. 모바일과 PC 크로스플레이 환경을 완성도 있게 제공하며 전 세계 매출 순위 상위권에 머무르고 있습니다.",
      pubDate: "2026.06.04",
      source: "인벤 (Inven)",
      category: "domestic",
      link: "https://www.inven.co.kr/webzine/news/?news=296200"
    },
    {
      title: "Wuthering Waves Surpasses 30 Million Downloads Globally After Rocky Launch",
      description: "Kuro Games announced that its open-world action RPG 'Wuthering Waves' has crossed 30 million downloads worldwide. Despite technical launch bugs, prompt developer communication and high-quality patch updates have successfully retained millions of players, pushing it high up on the app charts.",
      pubDate: "2026.06.03",
      source: "TouchArcade",
      category: "intl",
      link: "https://toucharcade.com/2026/06/03/wuthering-waves-30-million-downloads/"
    },
    {
      title: "젠레스 존 제로(ZZZ), 글로벌 사전예약자 4000만 명 돌파... 7월 4일 출시 확정",
      description: "호요버스(miHoYo)의 어반 판타지 액션 신작 '젠레스 존 제로'가 공식 홈페이지와 마켓 사전등록을 통해 신청자 4000만 명을 끌어모았습니다. 오는 7월 4일 모바일(AOS/iOS), PC, PS5 플랫폼을 통해 글로벌 동시 런칭을 기획 중입니다.",
      pubDate: "2026.06.02",
      source: "게임메카 (GameMeca)",
      category: "domestic",
      link: "https://www.gamemeca.com/view.php?gid=1748201"
    },
    {
      title: "Honor of Kings Launches Globally, Reaching Top Free Charts in 50 Countries",
      description: "Tencent's blockbuster MOBA 'Honor of Kings' has officially expanded its global service to North America, Europe, and Asia. Within 24 hours of release, the game secured the #1 position on the Apple App Store free games charts in over 50 countries, marking a massive MOBA transition.",
      pubDate: "2026.06.01",
      source: "Pocket Gamer",
      category: "intl",
      link: "https://www.pocketgamer.biz/news/83900/honor-of-kings-launches-globally/"
    },
    {
      title: "데브시스터즈 '쿠키런: 모험의 탑', 오는 6월 26일 글로벌 정식 출시 예고",
      description: "데브시스터즈의 기대작 캐주얼 액션 협동 게임 '쿠키런: 모험의 탑'이 최종 다듬기를 마치고 6월 26일 글로벌 런칭일을 발표했습니다. 개성 넘치는 쿠키들의 고유 능력과 실시간 멀티플레이 레이드 던전 공략이 특징인 기대작입니다.",
      pubDate: "2026.05.30",
      source: "디스이즈게임",
      category: "domestic",
      link: "https://www.thisisgame.com/news/nboard/4/?n=189201"
    },
    {
      title: "Minecraft Mobile Unveils 1.21 Tricky Trials Update with Trial Chambers and Breeze Mob",
      description: "Mojang Studios announced that the highly anticipated Minecraft 1.21 'Tricky Trials' update will be deployed on Bedrock and mobile editions in mid-June. Players can explore procedurally generated Trial Chambers, fight the wind-based Breeze mob, and craft the new powerful Mace weapon.",
      pubDate: "2026.05.28",
      source: "Droid Gamers",
      category: "intl",
      link: "https://www.droidgamers.com/news/minecraft-1-21-tricky-trials/"
    }
  ];

  const eventCalendar = [
    { title: "쿠키런: 모험의 탑 출시", date: "6월 26일", dday: "D-21" },
    { title: "퍼스트 디센던트 서비스", date: "7월 2일", dday: "D-27" },
    { title: "젠레스 존 제로 정식 런칭", date: "7월 4일", dday: "D-29" },
    { title: "아스팔트 레전드 유나이트", date: "7월 18일", dday: "D-43" }
  ];

  const hotKeywords = [
    "젠레스 존 제로",
    "나혼렙 어라이즈",
    "명조 음림",
    "스팀 무료게임",
    "에픽 메가세일",
    "쿠키런 모험의탑",
    "붕괴 스타레일",
    "배틀필드 모바일"
  ];

  // --- RSS Feed URLs (Korean and International) ---
  const rssFeeds = {
    domestic: [
      "https://feeds.feedburner.com/inven"
    ],
    intl: [
      "https://toucharcade.com/feed/",
      "https://www.pocketgamer.com/rss.xml"
    ],
    console: [
      "https://www.gameinformer.com/rss",
      "https://www.pcgamer.com/rss"
    ],
    retro: [
      "https://www.retrogamer.net/feed/",
      "https://www.nintendolife.com/rss"
    ]
  };


  // --- HTML Elements ---
  const freeGamesContainer = document.getElementById("free-games-container");
  const newsListContainer = document.getElementById("news-list");
  const keywordCloudContainer = document.getElementById("keyword-cloud");
  const eventListContainer = document.getElementById("event-list");
  const bookmarkListContainer = document.getElementById("bookmark-list");
  const searchInput = document.getElementById("news-search");
  const feedTabButtons = document.querySelectorAll(".feed-tab-btn");
  const btnRefreshNews = document.getElementById("btn-refresh-news");
  const appCounterEl = document.getElementById("app-counter");
  const statusOverlay = document.getElementById("status-overlay");
  const statusMessage = document.getElementById("status-message");
  const toastMessage = document.getElementById("toast-message");

  // Modal elements
  const detailModal = document.getElementById("detail-modal");
  const modalBadge = document.getElementById("modal-badge");
  const modalTitle = document.getElementById("modal-title");
  const modalSource = document.getElementById("modal-source");
  const modalDate = document.getElementById("modal-date");
  const modalDesc = document.getElementById("modal-desc");
  const btnModalClose = document.getElementById("btn-modal-close");
  const btnModalBookmark = document.getElementById("btn-modal-bookmark");
  const btnModalLink = document.getElementById("btn-modal-link");
  let activeModalNews = null;

  // --- Local Storage Management ---
  function loadState() {
    try {
      const savedBookmarks = localStorage.getItem("game_bookmarks");
      if (savedBookmarks) {
        bookmarkedNews = JSON.parse(savedBookmarks);
      } else {
        bookmarkedNews = [];
      }
      renderBookmarks();

      // App visitor count simulation
      const savedCounter = localStorage.getItem("game_visits_counter");
      if (savedCounter) {
        appVisitCount = parseInt(savedCounter, 10) + 1;
      } else {
        appVisitCount = 1840; // Simulated base
      }
      localStorage.setItem("game_visits_counter", appVisitCount.toString());
      if (appCounterEl) {
        appCounterEl.textContent = appVisitCount.toLocaleString();
      }
    } catch (e) {
      console.error("Local Storage load error:", e);
    }
  }

  function saveBookmarks() {
    localStorage.setItem("game_bookmarks", JSON.stringify(bookmarkedNews));
    renderBookmarks();
  }

  function showToast(text) {
    toastMessage.textContent = text;
    toastMessage.classList.add("active");
    setTimeout(() => {
      toastMessage.classList.remove("active");
    }, 2000);
  }

  // --- UI Render Functions ---

  function renderFreeGames() {
    freeGamesContainer.innerHTML = freeGames.map(game => `
      <div class="free-game-card">
        <span class="platform-badge platform-${game.platform}">
          <i class="${game.platform === 'steam' ? 'fa-brands fa-steam' : game.platform === 'epic' ? 'fa-solid fa-gamepad' : 'fa-solid fa-compact-disc'}"></i>
          ${game.platform}
        </span>
        <h4 style="margin-top: 18px;" title="${game.title}">${game.title}</h4>
        <div class="price-row">
          <span class="price-original">${game.originalPrice}</span>
          <span class="price-free">무료</span>
        </div>
        <div class="time-limit">
          <i class="fa-regular fa-clock"></i>
          <span>${game.timeLimit}</span>
        </div>
        <a href="${game.link}" target="_blank" class="btn-claim">
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
          받으러 가기
        </a>
      </div>
    `).join("");
  }

  function renderNewsList() {
    newsListContainer.innerHTML = "";
    
    // Filter news
    const filteredNews = activeNewsList.filter(news => {
      const matchesCategory = currentFeedFilter === "all" || news.category === currentFeedFilter;
      const matchesSearch = !searchQuery || 
        news.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        news.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    if (filteredNews.length === 0) {
      newsListContainer.innerHTML = `
        <div style="text-align:center; padding: 40px; color: var(--text-muted); font-size:14px;">
          <i class="fa-regular fa-folder-open" style="font-size:32px; display:block; margin-bottom:12px;"></i>
          일치하는 게임 뉴스가 없습니다.
        </div>
      `;
      return;
    }

    filteredNews.forEach(news => {
      const isBookmarked = bookmarkedNews.some(b => b.title === news.title);
      const card = document.createElement("div");
      card.className = "news-card";
      
      const badgeClass = news.category === "domestic" ? "badge-dom" : news.category === "intl" ? "badge-intl" : news.category === "console" ? "badge-console" : news.category === "retro" ? "badge-retro" : "badge-dom";
      const badgeText = news.category === "domestic" ? "국내" : news.category === "intl" ? "국외" : news.category === "console" ? "콘솔" : news.category === "retro" ? "레트로" : "뉴스";

      // Icon matching category/keyword
      let iconClass = "fa-solid fa-mobile-screen";
      if (news.title.includes("다운로드") || news.title.includes("Downloads")) {
        iconClass = "fa-solid fa-circle-down";
      } else if (news.title.includes("사전예약") || news.title.includes("Launch")) {
        iconClass = "fa-solid fa-calendar-check";
      } else if (news.title.includes("출시") || news.title.includes("Release")) {
        iconClass = "fa-solid fa-rocket";
      }

      card.innerHTML = `
        <div class="news-card-left">
          <div class="news-meta-row">
            <span class="news-badge ${badgeClass}">${badgeText}</span>
            <span class="news-source">${news.source}</span>
            <span class="news-date">${news.pubDate}</span>
          </div>
          <h3>${news.title}</h3>
          <p class="news-snippet">${news.description}</p>
          <div class="news-card-actions">
            <button class="btn-bookmark ${isBookmarked ? 'active' : ''}" title="북마크에 저장">
              <i class="${isBookmarked ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i>
            </button>
            <span style="font-size: 11px; color: var(--color-secondary);">자세히 보기 <i class="fa-solid fa-chevron-right"></i></span>
          </div>
        </div>
        <div class="news-card-right">
          <i class="${iconClass}"></i>
        </div>
      `;

      // Handle card click to open details
      card.addEventListener("click", (e) => {
        // Prevent click if clicking the bookmark button
        if (e.target.closest(".btn-bookmark")) {
          e.stopPropagation();
          toggleBookmark(news);
          card.querySelector(".btn-bookmark").classList.toggle("active");
          const icon = card.querySelector(".btn-bookmark i");
          if (icon.classList.contains("fa-regular")) {
            icon.className = "fa-solid fa-bookmark";
          } else {
            icon.className = "fa-regular fa-bookmark";
          }
          return;
        }
        openDetailModal(news);
      });

      newsListContainer.appendChild(card);
    });
  }

  function renderKeywords() {
    keywordCloudContainer.innerHTML = hotKeywords.map(kw => `
      <span class="keyword-tag">${kw}</span>
    `).join("");

    // Click keyword to search
    keywordCloudContainer.querySelectorAll(".keyword-tag").forEach(el => {
      el.addEventListener("click", () => {
        searchQuery = el.textContent;
        searchInput.value = searchQuery;
        renderNewsList();
        playChime('click');
      });
    });
  }

  function renderEvents() {
    eventListContainer.innerHTML = eventCalendar.map(ev => `
      <div class="event-item">
        <div class="event-info">
          <h5>${ev.title}</h5>
          <span>${ev.date}</span>
        </div>
        <span class="event-dday">${ev.dday}</span>
      </div>
    `).join("");
  }

  function renderBookmarks() {
    if (bookmarkedNews.length === 0) {
      bookmarkListContainer.innerHTML = `<span style="font-size: 11.5px; color: var(--text-muted); text-align: center; display: block; padding: 12px 0;">보관된 뉴스가 없습니다.</span>`;
      return;
    }
    bookmarkListContainer.innerHTML = bookmarkedNews.map(news => `
      <div class="bookmark-item" title="${news.title}">
        ${news.title}
      </div>
    `).join("");

    // Click bookmark to open modal
    bookmarkListContainer.querySelectorAll(".bookmark-item").forEach((el, idx) => {
      el.addEventListener("click", () => {
        openDetailModal(bookmarkedNews[idx]);
        playChime('click');
      });
    });
  }

  // --- Bookmark Logic ---
  function toggleBookmark(news) {
    const idx = bookmarkedNews.findIndex(b => b.title === news.title);
    if (idx === -1) {
      bookmarkedNews.push(news);
      saveBookmarks();
      playChime('success');
      showToast("북마크 보관함에 저장되었습니다.");
    } else {
      bookmarkedNews.splice(idx, 1);
      saveBookmarks();
      playChime('warn');
      showToast("북마크가 해제되었습니다.");
    }
  }

  // --- Modal Functions ---
  function openDetailModal(news) {
    activeModalNews = news;
    modalTitle.textContent = news.title;
    modalSource.textContent = news.source;
    modalDate.textContent = news.pubDate;
    modalDesc.textContent = news.description;
    
    modalBadge.className = `news-badge ${news.category === 'domestic' ? 'badge-dom' : news.category === 'intl' ? 'badge-intl' : news.category === 'console' ? 'badge-console' : news.category === 'retro' ? 'badge-retro' : 'badge-dom'}`;
    modalBadge.textContent = news.category === 'domestic' ? "국내" : news.category === 'intl' ? "국외" : news.category === 'console' ? "콘솔" : news.category === 'retro' ? "레트로" : "뉴스";

    btnModalLink.setAttribute("href", news.link);

    // Sync bookmark button icon
    const isBookmarked = bookmarkedNews.some(b => b.title === news.title);
    const icon = btnModalBookmark.querySelector("i");
    if (isBookmarked) {
      btnModalBookmark.style.color = "var(--color-warning)";
      icon.className = "fa-solid fa-bookmark";
      btnModalBookmark.innerHTML = `<i class="fa-solid fa-bookmark"></i> 북마크 해제`;
    } else {
      btnModalBookmark.style.color = "";
      icon.className = "fa-regular fa-bookmark";
      btnModalBookmark.innerHTML = `<i class="fa-regular fa-bookmark"></i> 북마크 저장`;
    }

    detailModal.classList.add("active");
  }

  function closeDetailModal() {
    detailModal.classList.remove("active");
    activeModalNews = null;
  }

  btnModalClose.addEventListener("click", closeDetailModal);
  detailModal.addEventListener("click", (e) => {
    if (e.target === detailModal) closeDetailModal();
  });

  btnModalBookmark.addEventListener("click", () => {
    if (activeModalNews) {
      toggleBookmark(activeModalNews);
      openDetailModal(activeModalNews); // refresh modal state
      renderNewsList(); // refresh feed icons
    }
  });

  // --- Search & Tabs Listeners ---
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderNewsList();
  });

  feedTabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      feedTabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      let filter = btn.dataset.feed;
      if (filter === "mobile") filter = "domestic";
      currentFeedFilter = filter;
      renderNewsList();
    });
  });

  // --- RSS Parser XML ---
  function parseRSS(xmlText, category) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, "text/xml");
      const items = doc.querySelectorAll("item");
      const parsedItems = [];
      
      items.forEach(item => {
        const title = item.querySelector("title")?.textContent || "";
        let link = item.querySelector("link")?.textContent || "";
        if (!link) {
          link = item.querySelector("link")?.getAttribute("href") || "";
        }
        const description = item.querySelector("description")?.textContent || item.querySelector("content")?.textContent || "";
        const pubDate = item.querySelector("pubDate")?.textContent || item.querySelector("published")?.textContent || "";
        const source = item.querySelector("author")?.textContent || item.querySelector("dc\\:creator")?.textContent || "";

        // Strip HTML tags from description and crop
        const cleanDesc = description.replace(/<[^>]*>/g, '').trim().substring(0, 160) + "...";

        if (title && link) {
          parsedItems.push({
            title: title.trim(),
            link: link.trim(),
            description: cleanDesc,
            pubDate: pubDate ? new Date(pubDate).toLocaleDateString('ko-KR') : new Date().toLocaleDateString('ko-KR'),
            source: source ? source.trim() : (category === 'domestic' ? '국내 게임 매체' : '해외 테크 매체'),
            category
          });
        }
      });
      return parsedItems;
    } catch (e) {
      console.error("RSS XML Parsing error:", e);
      return [];
    }
  }

  async function fetchFeedNews() {
    const fetchedResults = [];

    // Helper to fetch from one RSS feed URL via proxy
    const getFeed = async (url, cat) => {
      try {
        const res = await fetch(`/api/rss-proxy?url=${encodeURIComponent(url)}`);
        if (!res.ok) throw new Error("Network proxy failed");
        const xml = await res.text();
        return parseRSS(xml, cat);
      } catch (err) {
        console.warn(`Feed proxy fetch failed for ${url}:`, err.message);
        return [];
      }
    };

    // 1. Fetch Domestic Feeds
    for (const url of rssFeeds.domestic) {
      const items = await getFeed(url, "domestic");
      fetchedResults.push(...items);
    }

    // 2. Fetch International Feeds
    for (const url of rssFeeds.intl) {
      const items = await getFeed(url, "intl");
      fetchedResults.push(...items);
    }

    // 3. Fetch Console Feeds
    if (rssFeeds.console) {
      for (const url of rssFeeds.console) {
        const items = await getFeed(url, "console");
        fetchedResults.push(...items);
      }
    }

    // 4. Fetch Retro Feeds
    if (rssFeeds.retro) {
      for (const url of rssFeeds.retro) {
        const items = await getFeed(url, "retro");
        fetchedResults.push(...items);
      }
    }

    return fetchedResults;
  }

  // --- Real-time Refresh Action ---
  if (btnRefreshNews) {
    btnRefreshNews.addEventListener("click", async () => {
      playChime('click');
      statusOverlay.classList.add("active");
      statusMessage.textContent = "국내외 주요 게임 RSS 피드 및 스팀/에픽 배포 채널로부터 실시간 수집 중...";

      try {
        const fetched = await fetchFeedNews();
        
        if (fetched.length > 0) {
          // Blend with seedNews, deduplicating by title
          const existingTitles = new Set(fetched.map(item => item.title));
          const complementaryLocal = seedNews.filter(local => !existingTitles.has(local.title));
          
          activeNewsList = [...fetched, ...complementaryLocal];
        } else {
          // Fallback to local seed + random growth rate change/chime
          activeNewsList = [...seedNews];
        }

        // Shuffle keywords a bit to simulate change
        hotKeywords.sort(() => Math.random() - 0.5);

        // Render everything
        renderNewsList();
        renderKeywords();
        
        statusOverlay.classList.remove("active");
        playChime('success');
        showToast("실시간 게임 뉴스 및 무료 게임 동기화가 완료되었습니다.");
      } catch (err) {
        console.error("News aggregation failed:", err);
        statusOverlay.classList.remove("active");
        playChime('warn');
        showToast("실시간 RSS 로딩에 실패하여 로컬 캐시 뉴스로 대체합니다.");
      }
    });
  }

  // --- Startup / Initialization ---
  loadState();
  renderFreeGames();
  renderKeywords();
  renderEvents();

  // Populate active list with initial seedNews
  activeNewsList = [...seedNews];
  renderNewsList();

  // Auto trigger a quick check of real RSS feeds silently on start, fall back quietly
  setTimeout(async () => {
    try {
      const fetched = await fetchFeedNews();
      if (fetched.length > 0) {
        const existingTitles = new Set(fetched.map(item => item.title));
        const complementaryLocal = seedNews.filter(local => !existingTitles.has(local.title));
        activeNewsList = [...fetched, ...complementaryLocal];
        renderNewsList();
      }
    } catch (e) {
      console.log("Silent initial news fetch failed, relying on seedNews.");
    }
  }, 1000);

});
