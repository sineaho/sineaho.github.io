document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const extractorForm = document.getElementById('extractor-form');
  const pageUrlInput = document.getElementById('page-url');
  const btnExtract = document.getElementById('btn-extract');
  const statusTag = document.getElementById('status-tag');
  const statusText = document.getElementById('status-text');
  
  const placeholderView = document.getElementById('placeholder-view');
  const loadingView = document.getElementById('loading-view');
  const resultsView = document.getElementById('results-view');
  const extractedPageTitle = document.getElementById('extracted-page-title');
  const sourcesList = document.getElementById('sources-list');
  
  const conversionOverlay = document.getElementById('conversion-overlay');
  const overlayProgressText = document.getElementById('overlay-progress-text');
  const progressBar = document.getElementById('progress-bar');
  const downloadSize = document.getElementById('download-size');
  const btnCancelConversion = document.getElementById('btn-cancel-conversion');

  // State
  let currentPollingInterval = null;
  let currentTaskId = null;

  // Submit Form: Extract Sources
  extractorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const targetUrl = pageUrlInput.value.trim();
    if (!targetUrl) return;

    setUIState('loading');

    try {
      const response = await fetch('/api/jw-download/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: targetUrl })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '소스를 추출하는 중 오류가 발생했습니다.');
      }

      renderResults(data);
    } catch (err) {
      showToast(err.message, 'error');
      setUIState('placeholder');
    }
  });

  // Render Extracted Sources
  function renderResults(data) {
    extractedPageTitle.textContent = data.title || 'JW Player Video Source';
    sourcesList.innerHTML = '';

    if (!data.sources || data.sources.length === 0) {
      sourcesList.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 2rem;">
            <i class="fa-solid fa-face-frown" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
            검출된 JW Player 동영상 소스가 없습니다.
          </td>
        </tr>
      `;
      setUIState('results');
      showToast('검출된 동영상 소스가 없습니다. 다른 주소로 시도해 주세요.', 'warning');
      return;
    }

    data.sources.forEach(source => {
      const tr = document.createElement('tr');

      // Badge Class
      let badgeClass = 'badge-mp4';
      if (source.ext === 'm3u8') badgeClass = 'badge-hls';
      if (source.ext === 'mpd') badgeClass = 'badge-dash';

      // Short URL for display
      let displayUrl = source.url;
      try {
        const parsed = new URL(source.url);
        displayUrl = parsed.hostname + parsed.pathname;
      } catch (e) {}

      // Action Button
      let actionBtnHtml = '';
      if (source.ext === 'm3u8') {
        actionBtnHtml = `
          <button class="btn btn-primary btn-download-action btn-convert-hls" data-url="${encodeURIComponent(source.url)}">
            <i class="fa-solid fa-play"></i> MP4 변환 다운로드
          </button>
        `;
      } else if (source.ext === 'mpd') {
        actionBtnHtml = `
          <button class="btn btn-secondary btn-download-action" disabled title="DASH(.mpd) 변환은 지원하지 않습니다.">
            지원 안 함
          </button>
        `;
      } else {
        actionBtnHtml = `
          <button class="btn btn-primary btn-download-action btn-direct-download" data-url="${encodeURIComponent(source.url)}">
            <i class="fa-solid fa-arrow-down"></i> 직접 다운로드
          </button>
        `;
      }

      tr.innerHTML = `
        <td><span class="badge ${badgeClass}">${source.type}</span></td>
        <td><strong>${source.label || 'Direct Video'}</strong></td>
        <td>
          <div class="source-url" title="${source.url}">${displayUrl}</div>
          <button class="btn-copy-url" data-url="${source.url}" style="background:none; border:none; color:var(--accent-orange); cursor:pointer; font-size:0.75rem; margin-top:0.25rem;">
            <i class="fa-solid fa-copy"></i> 복사
          </button>
        </td>
        <td>${actionBtnHtml}</td>
      `;

      // Copy url event listener
      tr.querySelector('.btn-copy-url').addEventListener('click', (e) => {
        const copyUrl = e.currentTarget.getAttribute('data-url');
        navigator.clipboard.writeText(copyUrl).then(() => {
          showToast('주소가 클립보드에 복사되었습니다.', 'success');
        });
      });

      // Download event listeners
      const directBtn = tr.querySelector('.btn-direct-download');
      if (directBtn) {
        directBtn.addEventListener('click', () => {
          const fileUrl = decodeURIComponent(directBtn.getAttribute('data-url'));
          showToast('다운로드를 시작합니다 (프록시 전송 중)...', 'success');
          window.location.href = `/api/jw-download/stream?url=${encodeURIComponent(fileUrl)}`;
        });
      }

      const hlsBtn = tr.querySelector('.btn-convert-hls');
      if (hlsBtn) {
        hlsBtn.addEventListener('click', () => {
          const m3u8Url = decodeURIComponent(hlsBtn.getAttribute('data-url'));
          startHlsConvert(m3u8Url);
        });
      }

      sourcesList.appendChild(tr);
    });

    setUIState('results');
    showToast(`${data.sources.length}개의 동영상 소스를 발견했습니다!`, 'success');
  }

  // Start HLS Convert
  async function startHlsConvert(url) {
    try {
      showConversionOverlay(true);
      overlayProgressText.textContent = '서버에서 HLS 스트리밍을 다운로드 및 병합하기 시작합니다...';
      progressBar.style.width = '5%';
      downloadSize.textContent = '0.0 MB';

      const response = await fetch('/api/jw-download/hls-start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'HLS 변환 요청에 실패했습니다.');
      }

      currentTaskId = data.taskId;
      startStatusPolling(currentTaskId);
    } catch (err) {
      showToast(err.message, 'error');
      showConversionOverlay(false);
    }
  }

  // Poll Conversion Status
  function startStatusPolling(taskId) {
    if (currentPollingInterval) clearInterval(currentPollingInterval);

    let progressSimulated = 5;

    currentPollingInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/jw-download/hls-status?id=${taskId}`);
        if (!response.ok) {
          throw new Error('다운로드 상태 확인에 실패했습니다.');
        }

        const data = await response.json();

        if (data.status === 'processing') {
          // Update file size
          downloadSize.textContent = formatBytes(data.size);
          // Simulate some progress increments
          if (progressSimulated < 90) {
            progressSimulated += Math.floor(Math.random() * 3) + 1;
            progressBar.style.width = `${progressSimulated}%`;
          }
          overlayProgressText.textContent = `서버에서 동영상을 다운로드 중입니다... (${formatBytes(data.size)} 병합 완료)`;
        } else if (data.status === 'completed') {
          clearInterval(currentPollingInterval);
          progressBar.style.width = '100%';
          overlayProgressText.textContent = '변환 완료! 브라우저 다운로드 팝업을 기동합니다.';
          
          setTimeout(() => {
            showConversionOverlay(false);
            showToast('동영상 다운로드를 개시합니다!', 'success');
            // Trigger browser download
            window.location.href = data.downloadUrl;
          }, 800);
        } else if (data.status === 'failed') {
          clearInterval(currentPollingInterval);
          showConversionOverlay(false);
          showToast(`변환 실패: ${data.error || '알 수 없는 오류'}`, 'error');
        }

      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 1200);
  }

  // Cancel Conversion Action
  btnCancelConversion.addEventListener('click', () => {
    if (currentPollingInterval) {
      clearInterval(currentPollingInterval);
      currentPollingInterval = null;
    }
    currentTaskId = null;
    showConversionOverlay(false);
    showToast('다운로드/변환 요청을 취소했습니다.', 'warning');
  });

  // UI Helpers
  function setUIState(state) {
    if (state === 'loading') {
      btnExtract.disabled = true;
      statusTag.classList.remove('hidden');
      statusText.textContent = '분석 중...';
      
      placeholderView.classList.add('hidden');
      resultsView.classList.add('hidden');
      loadingView.classList.remove('hidden');
    } else if (state === 'results') {
      btnExtract.disabled = false;
      statusTag.classList.remove('hidden');
      statusText.textContent = '분석 완료';
      
      loadingView.classList.add('hidden');
      placeholderView.classList.add('hidden');
      resultsView.classList.remove('hidden');
    } else if (state === 'placeholder') {
      btnExtract.disabled = false;
      statusTag.classList.add('hidden');
      
      loadingView.classList.add('hidden');
      resultsView.classList.add('hidden');
      placeholderView.classList.remove('hidden');
    }
  }

  function showConversionOverlay(show) {
    if (show) {
      conversionOverlay.classList.remove('hidden');
    } else {
      conversionOverlay.classList.add('hidden');
    }
  }

  function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0.0 MB';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    // Always default display in MB or KB for user familiarity
    if (i < 2) {
      return parseFloat((bytes / k).toFixed(dm)) + ' KB';
    }
    return parseFloat((bytes / Math.pow(k, 2)).toFixed(dm)) + ' MB';
  }

  // Custom Toast Notification System
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

    // Auto-remove toast after 4s
    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
    }, 4000);
  }
});
