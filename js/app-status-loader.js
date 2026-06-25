document.addEventListener('DOMContentLoaded', () => {
  // Inject required styles dynamically
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .tool-card.status-inactive,
    a.tool-card.status-inactive,
    .sub-card.status-inactive,
    a.sub-card.status-inactive,
    .update-card.status-inactive,
    a.update-card.status-inactive,
    .calc-card.status-inactive,
    a.calc-card.status-inactive {
      opacity: 0.35 !important;
      filter: grayscale(90%) !important;
      pointer-events: none !important;
      cursor: not-allowed !important;
    }
    .tool-card.status-inactive a,
    .tool-card.status-inactive button,
    .sub-card.status-inactive a,
    .sub-card.status-inactive button,
    .update-card.status-inactive a,
    .update-card.status-inactive button,
    .calc-card.status-inactive a,
    .calc-card.status-inactive button {
      pointer-events: none !important;
      cursor: not-allowed !important;
      background: #64748b !important;
      color: #e2e8f0 !important;
      box-shadow: none !important;
    }
    .tool-card.status-coming-soon,
    .sub-card.status-coming-soon,
    .update-card.status-coming-soon,
    .calc-card.status-coming-soon {
      opacity: 0.8 !important;
    }
    .tool-badge.badge-inactive,
    .badge.badge-inactive {
      background-color: rgba(239, 68, 68, 0.12) !important;
      color: #ef4444 !important;
      border: 1px solid rgba(239, 68, 68, 0.2) !important;
    }
    .tool-badge.badge-soon,
    .badge.badge-soon {
      background-color: rgba(245, 158, 11, 0.12) !important;
      color: #d97706 !important;
      border: 1px solid rgba(245, 158, 11, 0.2) !important;
    }
  `;
  document.head.appendChild(styleEl);

  let appMetadata = null;
  let appStatuses = null;

  async function loadAppStatuses() {
    try {
      const [statusRes, listRes] = await Promise.all([
        fetch('/api/apps/status'),
        fetch('/api/admin/apps-list')
      ]);

      if (statusRes.ok && listRes.ok) {
        appStatuses = await statusRes.json();
        appMetadata = await listRes.json();
        applyStatuses();
      }
    } catch (err) {
      console.error('[StatusLoader] Failed to load statuses:', err);
    }
  }

  function getAppIdFromCard(card, titleText) {
    // 1. Try extracting from link href
    let href = card.getAttribute('href');
    if (!href) {
      const launchBtn = card.querySelector('.btn-card-launch, .btn-app-launch, a[href]');
      if (launchBtn) href = launchBtn.getAttribute('href');
    }

    if (href && href !== 'coming-soon.html' && href !== '#') {
      const match = href.match(/(?:\.\/|^\/|)([a-zA-Z0-9_-]+)\//);
      if (match) return match[1];
    }

    // 2. Try matching name with APP_METADATA
    if (appMetadata && titleText) {
      const cleanTitle = titleText.toLowerCase().replace(/\s/g, '');
      for (const key in appMetadata) {
        const metaName = appMetadata[key].name.toLowerCase().replace(/\s/g, '');
        if (cleanTitle.includes(metaName) || metaName.includes(cleanTitle)) {
          return key;
        }
      }
    }

    return null;
  }

  function applyStatuses() {
    const cards = document.querySelectorAll('.tool-card, .sub-card, .update-card, .calc-card');
    cards.forEach(card => {
      const titleEl = card.querySelector('h3');
      if (!titleEl) return;
      const titleText = titleEl.textContent.trim();
      const appId = getAppIdFromCard(card, titleText);

      if (!appId || !appStatuses) return;

      const status = appStatuses[appId] || 'active'; // Default to active

      // Reset classes
      card.classList.remove('status-inactive', 'status-coming-soon');
      
      const badgeEl = card.querySelector('.tool-badge, .badge, .badge-hub, .calc-badge');
      const launchBtn = card.querySelector('.btn-card-launch, .btn-app-launch') || (card.tagName === 'A' ? card : null);

      if (status === 'inactive') {
        card.classList.add('status-inactive');
        if (badgeEl) {
          badgeEl.className = 'tool-badge badge-inactive';
          badgeEl.textContent = document.documentElement.lang === 'ko' ? '비활성화' : 'Inactive';
        }
        if (launchBtn && launchBtn !== card) {
          launchBtn.setAttribute('href', '#');
          launchBtn.style.pointerEvents = 'none';
        }
      } else if (status === 'coming-soon') {
        card.classList.add('status-coming-soon');
        if (badgeEl) {
          badgeEl.className = 'tool-badge badge-soon';
          badgeEl.textContent = document.documentElement.lang === 'ko' ? '준비중' : 'Coming Soon';
        }
        if (launchBtn) {
          launchBtn.setAttribute('href', card.tagName === 'A' ? 'coming-soon.html' : './coming-soon.html');
          launchBtn.style.pointerEvents = 'auto';
        }
      } else {
        // Active: if it was coming-soon, restore normal link
        if (badgeEl) {
          // If it was badge-soon or badge-inactive, restore to active
          if (badgeEl.classList.contains('badge-soon') || badgeEl.classList.contains('badge-inactive')) {
            badgeEl.className = 'tool-badge badge-active';
            badgeEl.textContent = 'Active';
          }
        }
        if (launchBtn && appMetadata[appId]) {
          const rootPrefix = window.location.pathname.includes('/admin/') ? '../' : './';
          const link = appMetadata[appId].link.replace(/^\.\//, '');
          launchBtn.setAttribute('href', rootPrefix + link);
          launchBtn.style.pointerEvents = 'auto';
        }
      }
    });
  }

  loadAppStatuses();
});
