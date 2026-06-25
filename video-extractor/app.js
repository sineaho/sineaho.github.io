/**
 * CineAHO Video Extractor – Frontend Application Logic
 * Handles video file upload / YouTube URL loading, dual timeline slider,
 * conversion option controls, and backend API communication.
 */
(function () {
  'use strict';

  // ==================== DOM References ====================
  const DOM = {
    // Source Tabs
    tabUpload: document.getElementById('tab-upload'),
    tabYoutube: document.getElementById('tab-youtube'),
    panelUpload: document.getElementById('panel-upload'),
    panelYoutube: document.getElementById('panel-youtube'),

    // Upload
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'),
    btnBrowse: document.getElementById('btn-browse-file'),

    // YouTube
    inputYoutubeUrl: document.getElementById('input-youtube-url'),
    btnLoadYoutube: document.getElementById('btn-load-youtube'),
    youtubeInfoBar: document.getElementById('youtube-info-bar'),
    youtubeThumb: document.getElementById('youtube-thumb'),
    youtubeTitle: document.getElementById('youtube-title'),
    youtubeDuration: document.getElementById('youtube-duration'),

    // YouTube IFrame Player
    youtubePlayerWrap: document.getElementById('youtube-player-wrap'),

    // Preview Section
    previewSection: document.getElementById('preview-section'),
    videoPlayer: document.getElementById('video-player'),
    videoOverlay: document.getElementById('video-overlay'),
    btnPlayOverlay: document.getElementById('btn-play-overlay'),
    btnPlayPause: document.getElementById('btn-play-pause'),
    iconPlayPause: document.getElementById('icon-play-pause'),
    lblCurrentTime: document.getElementById('lbl-current-time'),
    lblTotalDuration: document.getElementById('lbl-total-duration'),
    btnMute: document.getElementById('btn-mute'),
    iconMute: document.getElementById('icon-mute'),

    // Screenshot
    btnScreenshot: document.getElementById('btn-screenshot'),
    screenshotCanvas: document.getElementById('screenshot-canvas'),

    // Range Play
    btnRangePlay: document.getElementById('btn-range-play'),
    iconRangePlay: document.getElementById('icon-range-play'),

    // Timeline
    timelineSliderWrap: document.getElementById('timeline-slider-wrap'),
    timelineTrack: document.getElementById('timeline-track'),
    timelineRange: document.getElementById('timeline-range'),
    handleStart: document.getElementById('handle-start'),
    handleEnd: document.getElementById('handle-end'),
    timelinePlayhead: document.getElementById('timeline-playhead'),
    inputStartTime: document.getElementById('input-start-time'),
    inputEndTime: document.getElementById('input-end-time'),
    lblStartTimeFormatted: document.getElementById('lbl-start-time-formatted'),
    lblEndTimeFormatted: document.getElementById('lbl-end-time-formatted'),
    lblSegmentDuration: document.getElementById('lbl-segment-duration'),

    // Options Section
    optionsSection: document.getElementById('options-section'),
    formatToggle: document.getElementById('format-toggle'),
    scaleButtons: document.getElementById('scale-buttons'),
    rangeFps: document.getElementById('range-fps'),
    lblFpsValue: document.getElementById('lbl-fps-value'),
    fpsPresets: document.getElementById('fps-presets'),
    rangeQuality: document.getElementById('range-quality'),
    lblQualityValue: document.getElementById('lbl-quality-value'),

    // Action Section
    actionSection: document.getElementById('action-section'),
    btnExtract: document.getElementById('btn-extract'),
    progressWrap: document.getElementById('progress-wrap'),
    progressBarInner: document.getElementById('progress-bar-inner'),
    progressLabel: document.getElementById('progress-label'),

    // Result Section
    resultSection: document.getElementById('result-section'),
    resultFormat: document.getElementById('result-format'),
    resultFilesize: document.getElementById('result-filesize'),
    resultPreview: document.getElementById('result-preview'),
    btnDownload: document.getElementById('btn-download'),
    btnRetry: document.getElementById('btn-retry'),
  };

  // ==================== State ====================
  const state = {
    sourceMode: 'upload', // 'upload' | 'youtube'
    videoFile: null,      // File object for local upload
    youtubeUrl: '',
    youtubeVideoId: '',   // Extracted YouTube video ID
    youtubeInfo: null,    // { title, duration, thumbnail }
    videoDuration: 0,     // total video duration in seconds
    startTime: 0,
    endTime: 0,
    outputFormat: 'gif',
    scaleRatio: 0.75,
    crop: '',             // '' = no crop, 'shorts' = 9:16
    fps: 15,
    quality: 80,
    isProcessing: false,
    resultBlob: null,
    resultFileName: '',
    isRangePlaying: false,
  };

  // YouTube IFrame API player instance
  let ytPlayer = null;
  let ytPlayerReady = false;
  let ytTimeUpdateInterval = null;

  // Extract YouTube video ID from various URL formats
  function extractYoutubeVideoId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
      /youtube\.com\/shorts\/([\w-]{11})/
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  }

  // ==================== Utilities ====================
  function formatTimeDisplay(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${ms}`;
  }

  function formatTimeShort(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  // ==================== Source Tab Switching ====================
  function switchSourceTab(mode) {
    state.sourceMode = mode;
    DOM.tabUpload.classList.toggle('active', mode === 'upload');
    DOM.tabYoutube.classList.toggle('active', mode === 'youtube');
    DOM.panelUpload.classList.toggle('active', mode === 'upload');
    DOM.panelYoutube.classList.toggle('active', mode === 'youtube');
  }

  DOM.tabUpload.addEventListener('click', () => switchSourceTab('upload'));
  DOM.tabYoutube.addEventListener('click', () => switchSourceTab('youtube'));

  // ==================== File Upload Handling ====================
  DOM.btnBrowse.addEventListener('click', (e) => {
    e.stopPropagation();
    DOM.fileInput.click();
  });

  DOM.dropZone.addEventListener('click', () => {
    DOM.fileInput.click();
  });

  DOM.dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    DOM.dropZone.classList.add('dragover');
  });

  DOM.dropZone.addEventListener('dragleave', () => {
    DOM.dropZone.classList.remove('dragover');
  });

  DOM.dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    DOM.dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('video/')) {
      handleLocalFile(files[0]);
    }
  });

  DOM.fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleLocalFile(e.target.files[0]);
    }
  });

  function handleLocalFile(file) {
    state.videoFile = file;
    state.sourceMode = 'upload';

    // Hide YouTube player, show local video player
    destroyYoutubePlayer();
    DOM.youtubePlayerWrap.style.display = 'none';
    DOM.videoPlayer.style.display = 'block';
    DOM.videoOverlay.style.display = '';

    // Load video into player
    const objectUrl = URL.createObjectURL(file);
    DOM.videoPlayer.src = objectUrl;
    DOM.videoPlayer.load();

    DOM.videoPlayer.addEventListener('loadedmetadata', function onMeta() {
      DOM.videoPlayer.removeEventListener('loadedmetadata', onMeta);
      state.videoDuration = DOM.videoPlayer.duration;
      state.startTime = 0;
      state.endTime = Math.min(state.videoDuration, 10);
      if (state.endTime > state.videoDuration) state.endTime = state.videoDuration;
      
      showPreviewAndOptions();
      updateTimelineUI();
      updateVideoTimeLabels();
    });
  }

  // ==================== YouTube URL Handling ====================
  DOM.btnLoadYoutube.addEventListener('click', loadYoutubeInfo);
  DOM.inputYoutubeUrl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loadYoutubeInfo();
  });

  async function loadYoutubeInfo() {
    const url = DOM.inputYoutubeUrl.value.trim();
    if (!url) return;

    // Extract video ID first
    const videoId = extractYoutubeVideoId(url);
    if (!videoId) {
      alert('올바른 유튜브 URL을 입력해 주세요.');
      return;
    }

    DOM.btnLoadYoutube.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>로딩...</span>';
    DOM.btnLoadYoutube.disabled = true;

    try {
      const res = await fetch(`/api/video/info?url=${encodeURIComponent(url)}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '정보를 가져올 수 없습니다.');
      }
      const info = await res.json();
      state.youtubeInfo = info;
      state.youtubeUrl = url;
      state.youtubeVideoId = videoId;
      state.videoDuration = info.duration || 0;
      state.startTime = 0;
      state.endTime = Math.min(state.videoDuration, 10);

      // Show info bar
      DOM.youtubeThumb.src = info.thumbnail;
      DOM.youtubeTitle.textContent = info.title;
      DOM.youtubeDuration.textContent = `재생시간: ${formatTimeShort(info.duration)}`;
      DOM.youtubeInfoBar.style.display = 'flex';

      showYoutubePreview(info);
    } catch (err) {
      alert('유튜브 정보 로드 실패: ' + err.message);
    } finally {
      DOM.btnLoadYoutube.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> <span>불러오기</span>';
      DOM.btnLoadYoutube.disabled = false;
    }
  }

  function showYoutubePreview(info) {
    DOM.previewSection.style.display = 'block';

    // Hide local video player, show YouTube player
    DOM.videoPlayer.style.display = 'none';
    DOM.videoPlayer.removeAttribute('src');
    DOM.youtubePlayerWrap.style.display = 'block';
    DOM.videoOverlay.style.display = 'none';

    // Create or replace YouTube player
    initYoutubePlayer(state.youtubeVideoId, state.startTime);

    DOM.lblTotalDuration.textContent = formatTimeShort(info.duration);
    DOM.lblCurrentTime.textContent = '00:00';

    showPreviewAndOptions();
    updateTimelineUI();
  }

  // ==================== YouTube IFrame Player ====================
  function initYoutubePlayer(videoId, startSeconds) {
    // Destroy existing player if any
    destroyYoutubePlayer();

    // Wait for YT API to be ready
    if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
      // API not ready yet, retry after delay
      setTimeout(() => initYoutubePlayer(videoId, startSeconds), 300);
      return;
    }

    ytPlayer = new YT.Player('youtube-player-container', {
      width: '100%',
      height: '100%',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        start: Math.floor(startSeconds || 0),
        fs: 0,
        playsinline: 1
      },
      events: {
        onReady: onYTPlayerReady,
        onStateChange: onYTPlayerStateChange
      }
    });
  }

  function destroyYoutubePlayer() {
    if (ytTimeUpdateInterval) {
      clearInterval(ytTimeUpdateInterval);
      ytTimeUpdateInterval = null;
    }
    if (ytPlayer && ytPlayer.destroy) {
      try { ytPlayer.destroy(); } catch (e) { /* ignore */ }
    }
    ytPlayer = null;
    ytPlayerReady = false;
    // Recreate the container div (YouTube API replaces it with iframe)
    const wrap = DOM.youtubePlayerWrap;
    if (wrap) {
      wrap.innerHTML = '<div id="youtube-player-container"></div>';
    }
  }

  function onYTPlayerReady() {
    ytPlayerReady = true;
    // Start time tracking interval
    ytTimeUpdateInterval = setInterval(() => {
      if (!ytPlayerReady || !ytPlayer || !ytPlayer.getCurrentTime) return;
      const currentTime = ytPlayer.getCurrentTime();
      DOM.lblCurrentTime.textContent = formatTimeShort(currentTime);
      updatePlayheadPosition(currentTime);

      // Range playback enforcement
      if (state.isRangePlaying && currentTime >= state.endTime) {
        ytPlayer.seekTo(state.startTime, true);
      }
    }, 250);
  }

  function onYTPlayerStateChange(event) {
    // YT.PlayerState: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
    if (event.data === 1) {
      // Playing
      DOM.iconPlayPause.className = 'fa-solid fa-pause';
    } else if (event.data === 2 || event.data === 0) {
      // Paused or Ended
      DOM.iconPlayPause.className = 'fa-solid fa-play';
      if (event.data === 0 && state.isRangePlaying) {
        stopRangePlayback();
      }
    }
  }

  function isYoutubeMode() {
    return state.sourceMode === 'youtube' && ytPlayerReady && ytPlayer;
  }

  // ==================== Preview & Options Display ====================
  function showPreviewAndOptions() {
    DOM.previewSection.style.display = 'block';
    DOM.optionsSection.style.display = 'block';
    DOM.actionSection.style.display = 'flex';
    DOM.resultSection.style.display = 'none';
    DOM.progressWrap.style.display = 'none';
    DOM.btnExtract.disabled = false;

    updateExtractButtonLabel();
  }

  // ==================== Video Player Controls ====================
  DOM.btnPlayOverlay.addEventListener('click', togglePlayback);
  DOM.videoOverlay.addEventListener('click', (e) => {
    if (e.target === DOM.videoOverlay) togglePlayback();
  });
  DOM.btnPlayPause.addEventListener('click', togglePlayback);

  function togglePlayback() {
    if (isYoutubeMode()) {
      const playerState = ytPlayer.getPlayerState();
      if (playerState === 1) {
        ytPlayer.pauseVideo();
      } else {
        ytPlayer.playVideo();
      }
      return;
    }

    if (!DOM.videoPlayer.src && !DOM.videoPlayer.currentSrc) return;

    if (DOM.videoPlayer.paused) {
      DOM.videoPlayer.play();
      DOM.iconPlayPause.className = 'fa-solid fa-pause';
      DOM.videoOverlay.classList.add('hidden');
    } else {
      DOM.videoPlayer.pause();
      DOM.iconPlayPause.className = 'fa-solid fa-play';
      DOM.videoOverlay.classList.remove('hidden');
    }
  }

  DOM.videoPlayer.addEventListener('timeupdate', () => {
    DOM.lblCurrentTime.textContent = formatTimeShort(DOM.videoPlayer.currentTime);
    updatePlayheadPosition();

    // Range playback: auto-loop back to start when reaching end time
    if (state.isRangePlaying && DOM.videoPlayer.currentTime >= state.endTime) {
      DOM.videoPlayer.currentTime = state.startTime;
      // Continue playing (loop within range)
    }
  });

  DOM.videoPlayer.addEventListener('loadedmetadata', () => {
    DOM.lblTotalDuration.textContent = formatTimeShort(DOM.videoPlayer.duration);
  });

  DOM.videoPlayer.addEventListener('ended', () => {
    DOM.iconPlayPause.className = 'fa-solid fa-play';
    DOM.videoOverlay.classList.remove('hidden');
    if (state.isRangePlaying) {
      stopRangePlayback();
    }
  });

  DOM.btnMute.addEventListener('click', () => {
    DOM.videoPlayer.muted = !DOM.videoPlayer.muted;
    DOM.iconMute.className = DOM.videoPlayer.muted
      ? 'fa-solid fa-volume-xmark'
      : 'fa-solid fa-volume-high';
  });

  // ==================== Screenshot Capture ====================
  DOM.btnScreenshot.addEventListener('click', captureScreenshot);

  function captureScreenshot() {
    const video = DOM.videoPlayer;
    if (!video.src && !video.currentSrc) {
      alert('비디오를 먼저 로드해 주세요.');
      return;
    }
    if (video.readyState < 2) {
      alert('비디오가 아직 준비되지 않았습니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    const canvas = DOM.screenshotCanvas;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob and trigger download
    canvas.toBlob(function (blob) {
      if (!blob) {
        alert('스크린샷 캡처에 실패했습니다.');
        return;
      }
      const timeStr = formatTimeDisplay(video.currentTime).replace(/[:.]/g, '-');
      const fileName = `screenshot_${timeStr}.png`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Visual feedback — flash the button
      DOM.btnScreenshot.classList.add('flash');
      setTimeout(() => DOM.btnScreenshot.classList.remove('flash'), 600);
    }, 'image/png');
  }

  // ==================== Range Playback ====================
  DOM.btnRangePlay.addEventListener('click', toggleRangePlayback);

  function toggleRangePlayback() {
    if (!isYoutubeMode()) {
      const video = DOM.videoPlayer;
      if (!video.src && !video.currentSrc) {
        alert('비디오를 먼저 로드해 주세요.');
        return;
      }
    }

    if (state.isRangePlaying) {
      stopRangePlayback();
    } else {
      state.isRangePlaying = true;
      DOM.btnRangePlay.classList.add('active');
      DOM.iconRangePlay.className = 'fa-solid fa-stop';
      DOM.btnRangePlay.querySelector('.vc-range-label').textContent = '구간 정지';

      if (isYoutubeMode()) {
        ytPlayer.seekTo(state.startTime, true);
        ytPlayer.playVideo();
      } else {
        DOM.videoPlayer.currentTime = state.startTime;
        DOM.videoPlayer.play();
        DOM.iconPlayPause.className = 'fa-solid fa-pause';
        DOM.videoOverlay.classList.add('hidden');
      }
    }
  }

  function stopRangePlayback() {
    state.isRangePlaying = false;
    DOM.btnRangePlay.classList.remove('active');
    DOM.iconRangePlay.className = 'fa-solid fa-rotate';
    DOM.btnRangePlay.querySelector('.vc-range-label').textContent = '구간 재생';

    if (isYoutubeMode()) {
      ytPlayer.pauseVideo();
    } else {
      DOM.videoPlayer.pause();
      DOM.videoOverlay.classList.remove('hidden');
    }
    DOM.iconPlayPause.className = 'fa-solid fa-play';
  }

  function updateVideoTimeLabels() {
    DOM.lblTotalDuration.textContent = formatTimeShort(state.videoDuration);
    DOM.lblCurrentTime.textContent = formatTimeShort(0);
  }

  // ==================== Dual Timeline Slider ====================
  let draggingHandle = null;

  function getTrackRect() {
    return DOM.timelineTrack.getBoundingClientRect();
  }

  function positionToTime(clientX) {
    const rect = getTrackRect();
    const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return fraction * state.videoDuration;
  }

  function timeToPercent(t) {
    if (state.videoDuration <= 0) return 0;
    return (t / state.videoDuration) * 100;
  }

  function updateTimelineUI() {
    const startPct = timeToPercent(state.startTime);
    const endPct = timeToPercent(state.endTime);

    DOM.handleStart.style.left = startPct + '%';
    DOM.handleEnd.style.left = endPct + '%';
    DOM.timelineRange.style.left = startPct + '%';
    DOM.timelineRange.style.width = (endPct - startPct) + '%';

    if (document.activeElement !== DOM.inputStartTime) {
      DOM.inputStartTime.value = state.startTime.toFixed(1);
    }
    if (document.activeElement !== DOM.inputEndTime) {
      DOM.inputEndTime.value = state.endTime.toFixed(1);
    }
    if (state.videoDuration > 0) {
      DOM.inputStartTime.max = state.videoDuration.toFixed(1);
      DOM.inputEndTime.max = state.videoDuration.toFixed(1);
    }

    DOM.lblStartTimeFormatted.textContent = '(' + formatTimeDisplay(state.startTime) + ')';
    DOM.lblEndTimeFormatted.textContent = '(' + formatTimeDisplay(state.endTime) + ')';
    const segDuration = Math.max(0, state.endTime - state.startTime);
    DOM.lblSegmentDuration.textContent = '구간: ' + segDuration.toFixed(1) + '초';
  }

  function updatePlayheadPosition(currentTimeOverride) {
    if (state.videoDuration <= 0) return;
    const t = currentTimeOverride !== undefined ? currentTimeOverride : DOM.videoPlayer.currentTime;
    const pct = (t / state.videoDuration) * 100;
    DOM.timelinePlayhead.style.left = pct + '%';
  }

  // Mouse events for handles
  DOM.handleStart.addEventListener('mousedown', (e) => {
    e.preventDefault();
    draggingHandle = 'start';
    DOM.handleStart.classList.add('dragging');
  });
  DOM.handleEnd.addEventListener('mousedown', (e) => {
    e.preventDefault();
    draggingHandle = 'end';
    DOM.handleEnd.classList.add('dragging');
  });

  // Touch events for handles
  DOM.handleStart.addEventListener('touchstart', (e) => {
    e.preventDefault();
    draggingHandle = 'start';
    DOM.handleStart.classList.add('dragging');
  });
  DOM.handleEnd.addEventListener('touchstart', (e) => {
    e.preventDefault();
    draggingHandle = 'end';
    DOM.handleEnd.classList.add('dragging');
  });

  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('touchmove', onDragMove, { passive: false });

  function onDragMove(e) {
    if (!draggingHandle) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const t = positionToTime(clientX);

    if (draggingHandle === 'start') {
      state.startTime = Math.max(0, Math.min(t, state.endTime - 0.1));
    } else {
      state.endTime = Math.min(state.videoDuration, Math.max(t, state.startTime + 0.1));
    }
    updateTimelineUI();
  }

  document.addEventListener('mouseup', onDragEnd);
  document.addEventListener('touchend', onDragEnd);

  function onDragEnd() {
    if (draggingHandle) {
      DOM.handleStart.classList.remove('dragging');
      DOM.handleEnd.classList.remove('dragging');
      draggingHandle = null;

      // Seek to start position when done dragging
      if (isYoutubeMode()) {
        ytPlayer.seekTo(state.startTime, true);
      } else if (DOM.videoPlayer.src || DOM.videoPlayer.currentSrc) {
        DOM.videoPlayer.currentTime = state.startTime;
      }
    }
  }

  // Click on track to set playhead / seek
  DOM.timelineTrack.addEventListener('click', (e) => {
    if (draggingHandle) return;
    const t = positionToTime(e.clientX);
    if (isYoutubeMode()) {
      ytPlayer.seekTo(t, true);
    } else if (DOM.videoPlayer.src || DOM.videoPlayer.currentSrc) {
      DOM.videoPlayer.currentTime = t;
    }
  });

  // Manual time input changes
  function onStartTimeChange() {
    let val = parseFloat(DOM.inputStartTime.value);
    if (isNaN(val)) {
      DOM.inputStartTime.value = state.startTime.toFixed(1);
      return;
    }
    
    // Bounds check
    if (val < 0) val = 0;
    if (val > state.endTime - 0.1) val = state.endTime - 0.1;
    
    state.startTime = val;
    updateTimelineUI();
    
    // Seek video player
    if (isYoutubeMode()) {
      ytPlayer.seekTo(state.startTime, true);
    } else if (DOM.videoPlayer.src || DOM.videoPlayer.currentSrc) {
      DOM.videoPlayer.currentTime = state.startTime;
    }
  }

  function onEndTimeChange() {
    let val = parseFloat(DOM.inputEndTime.value);
    if (isNaN(val)) {
      DOM.inputEndTime.value = state.endTime.toFixed(1);
      return;
    }
    
    // Bounds check
    if (val < state.startTime + 0.1) val = state.startTime + 0.1;
    if (val > state.videoDuration) val = state.videoDuration;
    
    state.endTime = val;
    updateTimelineUI();
    
    // Seek video player
    if (isYoutubeMode()) {
      ytPlayer.seekTo(state.endTime, true);
    } else if (DOM.videoPlayer.src || DOM.videoPlayer.currentSrc) {
      DOM.videoPlayer.currentTime = state.endTime;
    }
  }

  DOM.inputStartTime.addEventListener('change', onStartTimeChange);
  DOM.inputEndTime.addEventListener('change', onEndTimeChange);

  // ==================== Options Controls ====================

  // Format toggle
  DOM.formatToggle.addEventListener('click', (e) => {
    const btn = e.target.closest('.fmt-btn');
    if (!btn) return;
    DOM.formatToggle.querySelectorAll('.fmt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.outputFormat = btn.dataset.format;
    updateExtractButtonLabel();
  });

  // Scale buttons (including Shorts 9:16)
  DOM.scaleButtons.addEventListener('click', (e) => {
    const btn = e.target.closest('.scale-btn');
    if (!btn) return;
    DOM.scaleButtons.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const scaleVal = btn.dataset.scale;
    if (scaleVal === 'shorts') {
      state.scaleRatio = 1.0;
      state.crop = 'shorts';
    } else {
      state.scaleRatio = parseFloat(scaleVal);
      state.crop = '';
    }
  });

  // FPS slider
  DOM.rangeFps.addEventListener('input', (e) => {
    state.fps = parseInt(e.target.value);
    DOM.lblFpsValue.textContent = state.fps;
    syncFpsPresets(state.fps);
  });

  // FPS preset buttons
  DOM.fpsPresets.addEventListener('click', (e) => {
    const btn = e.target.closest('.fps-btn');
    if (!btn) return;
    const fpsVal = parseInt(btn.dataset.fps);
    state.fps = fpsVal;
    DOM.rangeFps.value = fpsVal;
    DOM.lblFpsValue.textContent = fpsVal;
    syncFpsPresets(fpsVal);
  });

  function syncFpsPresets(val) {
    DOM.fpsPresets.querySelectorAll('.fps-btn').forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.fps) === val);
    });
  }

  // Quality slider
  DOM.rangeQuality.addEventListener('input', (e) => {
    state.quality = parseInt(e.target.value);
    DOM.lblQualityValue.textContent = state.quality;
  });

  function updateExtractButtonLabel() {
    const formatLabel = state.outputFormat.toUpperCase();
    DOM.btnExtract.querySelector('span').textContent = `${formatLabel} 추출 시작`;
  }

  // ==================== Extraction ====================
  DOM.btnExtract.addEventListener('click', startExtraction);

  async function startExtraction() {
    if (state.isProcessing) return;

    // Validate
    if (state.sourceMode === 'upload' && !state.videoFile) {
      alert('비디오 파일을 먼저 업로드해 주세요.');
      return;
    }
    if (state.sourceMode === 'youtube' && !state.youtubeUrl) {
      alert('유튜브 URL을 먼저 입력하고 불러와 주세요.');
      return;
    }
    if (state.endTime <= state.startTime) {
      alert('추출 종료 시간이 시작 시간보다 커야 합니다.');
      return;
    }

    state.isProcessing = true;
    DOM.btnExtract.disabled = true;
    DOM.progressWrap.style.display = 'flex';
    DOM.progressBarInner.style.width = '0%';
    DOM.progressLabel.textContent = '변환 준비 중...';
    DOM.resultSection.style.display = 'none';

    // Simulate progress animation
    let fakeProgress = 0;
    const progressInterval = setInterval(() => {
      fakeProgress += Math.random() * 8;
      if (fakeProgress > 90) fakeProgress = 90;
      DOM.progressBarInner.style.width = fakeProgress + '%';
      DOM.progressLabel.textContent = `변환 중... ${Math.floor(fakeProgress)}%`;
    }, 500);

    try {
      const formData = new FormData();
      formData.append('startTime', state.startTime.toFixed(2));
      formData.append('endTime', state.endTime.toFixed(2));
      formData.append('outputFormat', state.outputFormat);
      formData.append('ratio', state.scaleRatio.toString());
      formData.append('fps', state.fps.toString());
      formData.append('quality', state.quality.toString());
      if (state.crop) {
        formData.append('crop', state.crop);
      }

      if (state.sourceMode === 'upload') {
        formData.append('source', 'upload');
        formData.append('videoFile', state.videoFile);
      } else {
        formData.append('source', 'youtube');
        formData.append('url', state.youtubeUrl);
      }

      const response = await fetch('/api/video/extract', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        let errMsg = '변환에 실패했습니다.';
        try {
          const errData = await response.json();
          errMsg = errData.error || errMsg;
        } catch (_) { /* ignore parse error */ }
        throw new Error(errMsg);
      }

      // Get file size from header
      const fileSize = parseInt(response.headers.get('X-File-Size')) || 0;

      // Get blob
      const blob = await response.blob();
      state.resultBlob = blob;

      // Determine filename from content-disposition or default
      const contentDisp = response.headers.get('Content-Disposition');
      let fileName = `extracted.${state.outputFormat}`;
      if (contentDisp) {
        const match = contentDisp.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          fileName = match[1].replace(/['"]/g, '');
        }
      }
      state.resultFileName = fileName;

      // Show progress complete
      DOM.progressBarInner.style.width = '100%';
      DOM.progressLabel.textContent = '변환 완료!';

      // Show result after a small delay
      setTimeout(() => {
        showResult(blob, fileSize, fileName);
      }, 600);

    } catch (err) {
      clearInterval(progressInterval);
      DOM.progressBarInner.style.width = '0%';
      DOM.progressLabel.textContent = '변환 실패';
      alert('추출 오류: ' + err.message);
    } finally {
      state.isProcessing = false;
      DOM.btnExtract.disabled = false;
    }
  }

  // ==================== Show Result ====================
  function showResult(blob, fileSize, fileName) {
    DOM.progressWrap.style.display = 'none';
    DOM.resultSection.style.display = 'block';

    // Set meta
    DOM.resultFormat.textContent = state.outputFormat.toUpperCase();
    DOM.resultFilesize.textContent = formatFileSize(fileSize || blob.size);

    // Preview
    const previewUrl = URL.createObjectURL(blob);
    DOM.resultPreview.src = previewUrl;

    // Scroll to result
    DOM.resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // ==================== Download ====================
  DOM.btnDownload.addEventListener('click', () => {
    if (!state.resultBlob) return;

    const url = URL.createObjectURL(state.resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = state.resultFileName || `extracted.${state.outputFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // ==================== Retry ====================
  DOM.btnRetry.addEventListener('click', () => {
    DOM.resultSection.style.display = 'none';
    DOM.progressWrap.style.display = 'none';
    state.resultBlob = null;
    state.resultFileName = '';
    DOM.btnExtract.disabled = false;

    // Scroll back to options
    DOM.optionsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

})();
