// AI Video Generator App Logic
document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // DOM Elements
  // ==========================================
  const apiKeyInput = document.getElementById("api-key-input");
  const btnToggleKey = document.getElementById("btn-toggle-key");
  const saveKeyToggle = document.getElementById("save-key-toggle");
  
  const videoDurationSelect = document.getElementById("video-duration");
  const videoAspectSelect = document.getElementById("video-aspect");
  const videoThemeSelect = document.getElementById("video-theme");
  const ttsVoiceSelect = document.getElementById("tts-voice");
  const ttsVoicePersonaSelect = document.getElementById("tts-voice-persona");
  const bgmThemeSelect = document.getElementById("bgm-theme");
  
  const promptPresetSelect = document.getElementById("prompt-preset");
  const promptInput = document.getElementById("prompt-input");
  const btnGenerateAi = document.getElementById("btn-generate-ai");
  
  const scriptEditorText = document.getElementById("script-editor-text");
  const btnCompileScript = document.getElementById("btn-compile-script");
  const sceneCounterBadge = document.getElementById("scene-counter-badge");
  
  const videoCanvas = document.getElementById("video-canvas");
  const ctx = videoCanvas.getContext("2d");
  
  const subtitleBoxOverlay = document.getElementById("subtitle-box-overlay");
  const subtitleTextElement = document.getElementById("subtitle-text-element");
  
  const playerLoadingOverlay = document.getElementById("player-loading-overlay");
  const playerLoadingText = document.getElementById("player-loading-text");
  const recIndicatorBanner = document.getElementById("rec-indicator-banner");
  
  const timelineProgressSlider = document.getElementById("timeline-progress-slider");
  const btnPlayPause = document.getElementById("btn-play-pause");
  const btnStopPlayer = document.getElementById("btn-stop-player");
  const btnVolumeToggle = document.getElementById("btn-volume-toggle");
  
  const currentTimeLabel = document.getElementById("current-time-label");
  const totalTimeLabel = document.getElementById("total-time-label");
  const currentSceneIndicator = document.getElementById("current-scene-indicator");
  
  const btnExportVideo = document.getElementById("btn-export-video");
  const btnExportSrt = document.getElementById("btn-export-srt");
  const btnPresetLoads = document.querySelectorAll(".btn-preset-load");

  // Advanced Gemini API controls
  const modelSelect = document.getElementById("model-select");
  const generationModeSelect = document.getElementById("generation-mode");
  const outlineFirstToggle = document.getElementById("outline-first-toggle");
  const generationTempSlider = document.getElementById("generation-temp");
  const tempValSpan = document.getElementById("temp-val");

  // Editor Toolbar and utilities
  const detectedFormatBadge = document.getElementById("detected-format-badge");
  const autoCompileToggle = document.getElementById("auto-compile-toggle");
  const btnImportFile = document.getElementById("btn-import-file");
  const fileImportInput = document.getElementById("file-import-input");
  const editorErrorMessage = document.getElementById("editor-error-message");
  const editorDropZone = document.getElementById("editor-drop-zone");

  // Temperature dynamic readout
  if (generationTempSlider && tempValSpan) {
    generationTempSlider.addEventListener("input", () => {
      tempValSpan.textContent = generationTempSlider.value;
    });
  }

  // ==========================================
  // App State variables
  // ==========================================
  let geminiApiKey = "";
  let timeline = []; // Parsed scenes
  let totalDuration = 0; // Total seconds
  let currentTime = 0; // Current playback time in seconds
  let isPlaying = false;
  let isMuted = false;
  
  let activeSceneIndex = -1;
  let lastFrameTime = 0;
  let animationFrameId = null;
  
  // Audio state
  let audioCtx = null;
  let bgmSynthNode = null;
  let audioDestNode = null; // Mixed stream destination for recorder
  let synthIntervalId = null;
  
  // Speech voice list
  let selectedVoice = null;
  let voiceList = [];
  
  // MediaRecorder state
  let mediaRecorder = null;
  let recordedChunks = [];
  let isRecording = false;

  // ==========================================
  // 1. API Key Setup
  // ==========================================
  function loadApiKey() {
    const savedKey = localStorage.getItem("AHO_GEMINI_API_KEY");
    if (savedKey) {
      geminiApiKey = savedKey;
      apiKeyInput.value = savedKey;
      saveKeyToggle.checked = true;
    }
  }

  loadApiKey();

  btnToggleKey.addEventListener("click", () => {
    if (apiKeyInput.type === "password") {
      apiKeyInput.type = "text";
      btnToggleKey.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
    } else {
      apiKeyInput.type = "password";
      btnToggleKey.innerHTML = '<i class="fa-solid fa-eye"></i>';
    }
  });

  saveKeyToggle.addEventListener("change", () => {
    if (saveKeyToggle.checked) {
      localStorage.setItem("AHO_GEMINI_API_KEY", apiKeyInput.value.trim());
    } else {
      localStorage.removeItem("AHO_GEMINI_API_KEY");
    }
  });

  apiKeyInput.addEventListener("input", () => {
    geminiApiKey = apiKeyInput.value.trim();
    if (saveKeyToggle.checked) {
      localStorage.setItem("AHO_GEMINI_API_KEY", geminiApiKey);
    }
  });

  // ==========================================
  // 2. TTS Voice List Loading
  // ==========================================
  function loadVoices() {
    if (typeof speechSynthesis === "undefined") return;
    
    voiceList = speechSynthesis.getVoices();
    ttsVoiceSelect.innerHTML = "";
    
    // Default system option
    const defOpt = document.createElement("option");
    defOpt.value = "default";
    defOpt.textContent = "기본 한글 낭독 목소리";
    ttsVoiceSelect.appendChild(defOpt);
    
    // Filter Korean voices first, then others
    const koVoices = voiceList.filter(v => v.lang.includes("ko") || v.lang.includes("KO"));
    koVoices.forEach((voice) => {
      const opt = document.createElement("option");
      opt.value = voice.name;
      opt.textContent = `${voice.name} (${voice.lang})`;
      ttsVoiceSelect.appendChild(opt);
    });

    // Append other english voices
    const enVoices = voiceList.filter(v => v.lang.includes("en") && !v.lang.includes("ko"));
    enVoices.slice(0, 5).forEach((voice) => {
      const opt = document.createElement("option");
      opt.value = voice.name;
      opt.textContent = `${voice.name} (${voice.lang})`;
      ttsVoiceSelect.appendChild(opt);
    });
  }

  loadVoices();
  if (typeof speechSynthesis !== "undefined" && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
  }

  ttsVoiceSelect.addEventListener("change", () => {
    const val = ttsVoiceSelect.value;
    if (val === "default") {
      selectedVoice = null;
    } else {
      selectedVoice = voiceList.find(v => v.name === val) || null;
    }
  });

  // Prompt Presets
  promptPresetSelect.addEventListener("change", () => {
    const val = promptPresetSelect.value;
    if (val === "space_explore") {
      promptInput.value = "인류의 우주 탐험 역사와 화성 정착의 비밀에 대한 다큐멘터리 스크립트를 작성해줘.";
      videoThemeSelect.value = "space";
      bgmThemeSelect.value = "space";
    } else if (val === "ai_future") {
      promptInput.value = "인공지능의 진화 역사와 인공일반지능(AGI) 도래 시 인간 사회의 딜레마에 관한 철학적 스크립트를 만들어줘.";
      videoThemeSelect.value = "cyberpunk";
      bgmThemeSelect.value = "techno";
    } else if (val === "js_master") {
      promptInput.value = "웹 개발의 근간인 자바스크립트의 핵심 기초(변수, 제어문, 함수, 객체, 비동기)를 알기 쉽게 가르쳐주는 코딩 강좌 대본을 제작해줘.";
      videoThemeSelect.value = "education";
      bgmThemeSelect.value = "lofi";
    } else if (val === "universe_scale") {
      promptInput.value = "우주에서 가장 작은 미립자부터 관측 가능한 은하계 크기까지의 물리적 척도를 과학적으로 해설하는 스크립트를 생성해줘.";
      videoThemeSelect.value = "space";
      bgmThemeSelect.value = "piano";
    }
  });

  // ==========================================
  // Helper to call Gemini API
  // ==========================================
  async function callGeminiAPI(prompt, model, apiKey, temp) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: prompt }] }
        ],
        generationConfig: {
          temperature: temp
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || `Status ${response.status}`;
      throw new Error(`Gemini API Error: ${errorMsg}`);
    }

    const data = await response.json();
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textOutput) {
      throw new Error("대본 텍스트를 생성하지 못했습니다. 할당량이나 제한 한도를 확인해 주세요.");
    }
    return textOutput;
  }

  function cleanAIGeneratedText(text) {
    let cleaned = text.trim();
    // Remove markdown block if any
    cleaned = cleaned.replace(/^```[a-zA-Z]*\r?\n/i, "");
    cleaned = cleaned.replace(/\r?\n```$/, "");
    return cleaned.trim();
  }

  function updateProgressOverlay(message, percent) {
    playerLoadingText.textContent = message;
    
    let progressContainer = document.getElementById("ai-progress-container");
    if (!progressContainer) {
      progressContainer = document.createElement("div");
      progressContainer.id = "ai-progress-container";
      progressContainer.className = "segment-progress-container";
      progressContainer.innerHTML = `<div id="ai-progress-bar" class="segment-progress-bar"></div>`;
      
      const spinnerBox = playerLoadingOverlay.querySelector(".spinner-box");
      if (spinnerBox) {
        spinnerBox.appendChild(progressContainer);
      }
    }
    progressContainer.style.display = "block";
    const progressBar = document.getElementById("ai-progress-bar");
    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }
  }

  function hideProgressOverlay() {
    playerLoadingOverlay.style.display = "none";
    const progressContainer = document.getElementById("ai-progress-container");
    if (progressContainer) {
      progressContainer.style.display = "none";
    }
  }

  // ==========================================
  // 3. AI Script Generation (Gemini API with Segmented Gen Option)
  // ==========================================
  btnGenerateAi.addEventListener("click", async () => {
    if (!geminiApiKey) {
      alert("Gemini API 키를 먼저 설정해야 AI 스크립트 생성이 가능합니다.\n키가 없는 경우 하단의 '데모 프리셋 로드'를 활용하십시오.");
      return;
    }

    const topic = promptInput.value.trim();
    if (!topic) {
      alert("동영상 주제 및 지침을 작성해 주세요.");
      return;
    }

    const duration = parseInt(videoDurationSelect.value) || 300;
    const theme = videoThemeSelect.value;
    const model = modelSelect.value || "gemini-2.5-flash";
    const generationMode = generationModeSelect.value || "segmented";
    const outlineFirst = outlineFirstToggle.checked;
    const temperature = parseFloat(generationTempSlider.value) || 0.7;

    btnGenerateAi.disabled = true;
    scriptEditorText.value = ""; // Clear existing editor content
    
    // Estimate total scene count (each scene is around 15 seconds)
    const totalScenes = Math.max(4, Math.round(duration / 15));
    
    try {
      if (generationMode === "singleshot") {
        // --- SINGLE SHOT MODE ---
        updateProgressOverlay(`Gemini AI가 ${duration / 60}분 동영상 대본을 작성하는 중...`, 30);
        playerLoadingOverlay.style.display = "flex";

        const promptText = `너는 전문 유튜브 다큐멘터리/강좌 영상용 대본 작성가이다.
사용자가 요청하는 다음 주제를 기반으로, 지정된 제한 시간(${duration}초) 동안 이어서 상영할 수 있는 동영상 시나리오 스크립트를 작성해라.
각 씬은 약 10초에서 20초 사이로 배정되어야 하며, 전체 씬의 총 지속시간의 합이 정확히 ${duration}초 부근(최대 씬 수 ${totalScenes}개 내외)이 되어야 한다.

반드시 다음의 지정된 포맷만을 정확하게 사용해서 스크립트를 출력해라. 어떠한 마크다운 코드 블록(\`\`\`), 머리글, 다른 안내 텍스트 등은 일절 제외하고 오직 순수한 텍스트만 출력해야 한다:

[SCENE 1]
Duration: 15s
Subtitle: [자막 영역에 표시할 핵심 한국어 자막 문장]
Background: [시각화 캔버스 연출용 테마 설명 키워드들]
Narration: [내레이션 음성으로 낭독할 자연스러운 스크립트 문장]

[SCENE 2]
Duration: 15s
Subtitle: ...
Background: ...
Narration: ...

(위 포맷 규격을 빈틈없이 완벽하게 지킬 것. Duration은 초 단위 숫자 뒤에 's'를 붙여라. 각 씬 사이는 빈 줄로 구분해라.)

비디오 요청 주제: ${topic}
영상 스타일 테마: ${theme}
`;
        
        const rawResult = await callGeminiAPI(promptText, model, geminiApiKey, temperature);
        scriptEditorText.value = cleanAIGeneratedText(rawResult);
        updateProgressOverlay("컴파일하는 중...", 90);
        
      } else {
        // --- SEGMENTED MODE (For reliable long video generation) ---
        playerLoadingOverlay.style.display = "flex";
        updateProgressOverlay("준비 중...", 5);

        // Divide total scenes into segments (e.g. 10 scenes per segment, approx 150 seconds)
        const scenesPerSegment = 10;
        const segments = [];
        for (let i = 0; i < totalScenes; i += scenesPerSegment) {
          const startScene = i + 1;
          const endScene = Math.min(totalScenes, i + scenesPerSegment);
          segments.push({ startScene, endScene, count: endScene - startScene + 1 });
        }

        let outlineText = "";
        let cumulativeScript = "";

        if (outlineFirst) {
          updateProgressOverlay("전체 스토리라인 아웃라인 생성 중...", 10);
          const outlinePrompt = `너는 전문 동영상 기획자이자 크리에이티브 디렉터이다.
주제: '${topic}'
전체 상영시간: ${duration}초 (총 ${totalScenes}개 씬 내외)
장르: ${theme} 관련 비주얼 다큐멘터리/강좌 영상

이 영상의 긴 흐름을 매끄럽게 만들기 위해, 총 ${segments.length}개 부분으로 구성된 전체 이야기 기획 아웃라인을 세워라.
각 부분의 서사적 목표, 다룰 주제, 비주얼의 흐름을 논리적이고 짜임새 있게 작성해라. 
출력할 때는 다른 꾸밈말 없이 한국어로 오직 기획 본문만 작성해라. (마크다운은 사용하지 말 것)`;
          
          outlineText = await callGeminiAPI(outlinePrompt, model, geminiApiKey, temperature);
          outlineText = cleanAIGeneratedText(outlineText);
        }

        // Loop through segments
        for (let j = 0; j < segments.length; j++) {
          const seg = segments[j];
          const progressPercent = Math.round(15 + (j / segments.length) * 80);
          updateProgressOverlay(`[${j+1}/${segments.length} 파트] 대본 생성 중 (씬 ${seg.startScene}~${seg.endScene})...`, progressPercent);

          let previousContext = "";
          if (cumulativeScript) {
            // Provide context about what was generated so far
            const lines = cumulativeScript.split("\n");
            // Grab last ~15 lines to give immediate continuity
            const tail = lines.slice(-25).join("\n");
            previousContext = `이전 씬에 이어서 자연스럽게 내용이 연결되어야 합니다. 이전 생성된 씬의 일부 내용은 다음과 같습니다:\n${tail}\n\n`;
          }

          const segPrompt = `너는 전문 유튜브 다큐멘터리/강좌 영상용 대본 작성가이다.
주제: ${topic}
영상 테마: ${theme}
전체 기획 아웃라인:
${outlineText || "자연스러운 시간의 흐름에 따른 다큐멘터리"}

현재 전체 ${segments.length}개 파트 중 [${j+1}번째 파트]의 시나리오 대본을 작성하고 있다.
이번 파트에서는 [SCENE ${seg.startScene}]부터 [SCENE ${seg.endScene}]까지 총 ${seg.count}개의 씬을 순서대로 이어서 작성해야 한다.
각 씬은 약 10초에서 20초 사이로 배정되어야 하며, 파트의 총 재생시간이 정확히 ${seg.count * 15}초 내외가 되도록 해라.

${previousContext}

반드시 다음의 지정된 포맷만을 정확하게 사용하여 스크립트를 출력해라. 어떠한 마크다운 코드 블록(\`\`\`), 파트명, 머리글, 설명 텍스트 등은 일절 제외하고 오직 포맷에 맞춘 순수한 텍스트만 출력해야 한다:

[SCENE ${seg.startScene}]
Duration: 15s
Subtitle: [이 씬에서 화면 하단에 표시할 자막 문장]
Background: [이 씬에서 화면에 연출될 테마 비주얼 묘사]
Narration: [이 씬에서 흘러나올 한국어 내레이션 낭독 대본]

...

[SCENE ${seg.endScene}]
Duration: 15s
Subtitle: ...
Background: ...
Narration: ...

(위 규격 포맷을 빈틈없이 완벽하게 지킬 것. Duration은 초 단위 숫자 뒤에 's'를 붙여라. 각 씬 사이는 빈 줄로 구분해라. 이번 파트 범위인 씬 ${seg.startScene}부터 씬 ${seg.endScene}까지만 작성해야 한다.)
`;

          let segResult = await callGeminiAPI(segPrompt, model, geminiApiKey, temperature);
          segResult = cleanAIGeneratedText(segResult);
          
          cumulativeScript += (j > 0 ? "\n\n" : "") + segResult;
          scriptEditorText.value = cumulativeScript;
          
          // Silent compile to let the user watch the timeline build in real-time!
          compileScriptData(true);
        }
      }

      updateProgressOverlay("비디오 타임라인 구성 완료!", 100);
      compileScriptData(true); // final compile
      
      setTimeout(() => {
        hideProgressOverlay();
        alert(`성공적으로 ${timeline.length}개의 씬으로 구성된 ${Math.round(totalDuration)}초 분량의 장편 대본이 생성 및 완료되었습니다!`);
      }, 500);

    } catch (err) {
      console.error(err);
      hideProgressOverlay();
      alert(`AI 대본 생성 중 실패: ${err.message}\nGemini API 키 유효성이나 네트워크, 혹은 타겟 모델 한도를 체크해 보세요.`);
    } finally {
      btnGenerateAi.disabled = false;
    }
  });

  // ==========================================
  // 4. Multi-Format Script Parser & Compiler
  // ==========================================
  function parseScriptText(text) {
    const trimmed = text.trim();
    if (!trimmed) return [];

    // 1. JSON Format detection
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const data = JSON.parse(trimmed);
        if (Array.isArray(data)) {
          const parsed = [];
          let cumulativeTime = 0;
          let id = 1;
          for (const item of data) {
            const duration = parseInt(item.duration || item.Duration || item.d || 15) || 15;
            const subtitle = (item.subtitle || item.Subtitle || item.sub || "").trim();
            const background = (item.background || item.Background || item.bg || "").trim();
            const narration = (item.narration || item.Narration || item.narr || "").trim();
            
            parsed.push({
              id: id++,
              duration,
              subtitle,
              background,
              narration,
              startTime: cumulativeTime,
              endTime: cumulativeTime + duration
            });
            cumulativeTime += duration;
          }
          return { format: "json", scenes: parsed, totalDuration: cumulativeTime };
        }
      } catch (e) {
        throw new Error("JSON 형식이 올바르지 않습니다: " + e.message);
      }
    }

    // 2. Standard SCENE Format detection
    const hasSceneHeaders = /\[SCENE \d+\]/i.test(trimmed);
    if (hasSceneHeaders) {
      const sceneBlocks = trimmed.split(/\[SCENE \d+\]/i);
      const parsed = [];
      let cumulativeTime = 0;
      let sceneId = 1;

      sceneBlocks.forEach((block) => {
        const blockTrim = block.trim();
        if (!blockTrim) return;

        let duration = 15;
        const durMatch = blockTrim.match(/Duration:\s*(\d+)s/i);
        if (durMatch) {
          duration = parseInt(durMatch[1]) || 15;
        }

        let subtitle = "";
        const subMatch = blockTrim.match(/Subtitle:\s*([^\n]+)/i);
        if (subMatch) {
          subtitle = subMatch[1].trim();
        }

        let background = "";
        const bgMatch = blockTrim.match(/Background:\s*([^\n]+)/i);
        if (bgMatch) {
          background = bgMatch[1].trim();
        }

        let narration = "";
        const narrMatch = blockTrim.match(/Narration:\s*([\s\S]+)$/i);
        if (narrMatch) {
          narration = narrMatch[1].trim();
        }

        parsed.push({
          id: sceneId++,
          duration,
          subtitle,
          background,
          narration,
          startTime: cumulativeTime,
          endTime: cumulativeTime + duration
        });
        cumulativeTime += duration;
      });
      return { format: "standard", scenes: parsed, totalDuration: cumulativeTime };
    }

    // 3. Simple Line-by-Line (CSV/TSV/Pipe) Format detection
    const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length > 0) {
      let hasSeparator = false;
      let separator = "|";
      
      // Determine separator
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        if (lines[i].includes("|")) {
          hasSeparator = true;
          separator = "|";
          break;
        }
        if (lines[i].includes("\t")) {
          hasSeparator = true;
          separator = "\t";
          break;
        }
      }

      const parsed = [];
      let cumulativeTime = 0;
      let sceneId = 1;
      const themeVal = videoThemeSelect.value || "space";

      lines.forEach((line) => {
        if (line.startsWith("[") || line.startsWith("#") || line.startsWith("//")) return;

        const parts = line.split(separator).map(p => p.trim());
        if (parts.length === 0 || parts[0] === "") return;

        const subtitle = parts[0] || "";
        let narration = parts[1] || "";
        const durationStr = parts[2] || "15";
        let background = parts[3] || "";

        let duration = parseInt(durationStr.replace(/[^\d]/g, "")) || 15;
        if (!background) {
          background = `${themeVal} 테마 스타일 연출`;
        }
        if (!narration) {
          narration = subtitle;
        }

        parsed.push({
          id: sceneId++,
          duration,
          subtitle,
          background,
          narration,
          startTime: cumulativeTime,
          endTime: cumulativeTime + duration
        });
        cumulativeTime += duration;
      });

      if (parsed.length > 0) {
        return { format: "csv", scenes: parsed, totalDuration: cumulativeTime };
      }
    }

    throw new Error("스크립트 형식을 인지할 수 없습니다. 포맷 가이드를 참고하여 올바른 형식으로 기입해 주세요.");
  }

  function compileScriptData(isSilent = false) {
    const text = scriptEditorText.value.trim();
    
    // Clear error logs
    if (editorErrorMessage) {
      editorErrorMessage.style.display = "none";
      editorErrorMessage.textContent = "";
    }

    if (!text) {
      if (detectedFormatBadge) {
        detectedFormatBadge.textContent = "포맷 미정";
        detectedFormatBadge.className = "format-badge";
      }
      if (!isSilent) {
        alert("에디터에 파싱할 시나리오 텍스트가 없습니다.");
      }
      return;
    }

    try {
      const result = parseScriptText(text);
      if (!result || result.scenes.length === 0) {
        throw new Error("파싱된 씬이 존재하지 않습니다.");
      }

      // Update badge visual
      if (detectedFormatBadge) {
        detectedFormatBadge.className = "format-badge";
        if (result.format === "json") {
          detectedFormatBadge.textContent = "JSON 포맷";
          detectedFormatBadge.classList.add("format-badge-json");
        } else if (result.format === "standard") {
          detectedFormatBadge.textContent = "Standard 포맷";
          detectedFormatBadge.classList.add("format-badge-standard");
        } else if (result.format === "csv") {
          detectedFormatBadge.textContent = "구분자 포맷";
          detectedFormatBadge.classList.add("format-badge-csv");
        }
      }

      timeline = result.scenes;
      totalDuration = result.totalDuration;
      currentTime = 0;
      activeSceneIndex = -1;

      // Sync player timeline UI
      timelineProgressSlider.max = Math.floor(totalDuration);
      timelineProgressSlider.value = 0;
      currentTimeLabel.textContent = "00:00";
      totalTimeLabel.textContent = formatTime(totalDuration);
      sceneCounterBadge.textContent = `총 ${timeline.length}개 씬`;
      currentSceneIndicator.textContent = `SCENE 0 / ${timeline.length}`;

      btnPlayPause.disabled = false;
      btnStopPlayer.disabled = false;
      btnExportVideo.disabled = false;
      btnExportSrt.disabled = false;

      if (typeof speechSynthesis !== "undefined") {
        speechSynthesis.cancel();
      }
      isPlaying = false;
      btnPlayPause.innerHTML = '<i class="fa-solid fa-play"></i>';
      stopSynthBGM();

      // Render initial frame
      renderCanvasFrame(0);
      updateActiveSubtitles(0);

      if (!isSilent) {
        alert(`비디오 컴파일 완료! 총 ${timeline.length}개 씬, 총 상영시간 ${formatTime(totalDuration)}이 정상 로드되었습니다.`);
      }
    } catch (err) {
      console.error(err);
      if (detectedFormatBadge) {
        detectedFormatBadge.textContent = "포맷 오류";
        detectedFormatBadge.className = "format-badge format-badge-unknown";
      }
      
      if (editorErrorMessage) {
        editorErrorMessage.textContent = `[에러] ${err.message}`;
        editorErrorMessage.style.display = "block";
      }

      if (!isSilent) {
        alert(`컴파일 에러: ${err.message}`);
      }
    }
  }

  btnCompileScript.addEventListener("click", () => compileScriptData(false));

  // ==========================================
  // 4b. Auto Compile Debounced Input
  // ==========================================
  let compileTimeoutId = null;
  scriptEditorText.addEventListener("input", () => {
    if (autoCompileToggle && autoCompileToggle.checked) {
      if (compileTimeoutId) clearTimeout(compileTimeoutId);
      compileTimeoutId = setTimeout(() => {
        compileScriptData(true); // Silent compile
      }, 1000);
    }
  });

  // ==========================================
  // 4c. File Import Loader
  // ==========================================
  if (btnImportFile && fileImportInput) {
    btnImportFile.addEventListener("click", () => {
      fileImportInput.click();
    });

    fileImportInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        readImportedFile(file);
      }
    });
  }

  function readImportedFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      scriptEditorText.value = event.target.result;
      compileScriptData(false); // Parse and alert on success/fail
    };
    reader.onerror = () => {
      alert("파일을 가져오는 중 오류가 발생했습니다.");
    };
    reader.readAsText(file, "UTF-8");
  }

  // ==========================================
  // 4d. File Drag and Drop Support
  // ==========================================
  if (editorDropZone) {
    editorDropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      editorDropZone.classList.add("drag-over");
    });

    editorDropZone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      editorDropZone.classList.remove("drag-over");
    });

    editorDropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      editorDropZone.classList.remove("drag-over");

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        readImportedFile(files[0]);
      }
    });
  }

  // ==========================================
  // Helper Time Formatter (MM:SS)
  // ==========================================
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // ==========================================
  // 5. Presets Loading (No API keys needed)
  // ==========================================
  function getPresetScript(type) {
    let script = "";
    if (type === "space") {
      const scenes = [
        { d: 15, sub: "태초에 거대한 빅뱅과 함께 시공간이 태어났습니다.", bg: "성운의 은은한 광채와 폭발", narr: "우주의 탄생, 그것은 거대한 에너지의 폭발이었습니다. 약 138억 년 전 빅뱅과 함께 시간과 공간, 그리고 만물을 이루는 물질들이 팽창하며 나타났습니다." },
        { d: 15, sub: "가스와 먼지 원반이 뭉쳐 태양이 형성되었습니다.", bg: "먼지 띠와 붉게 물든 항성", narr: "중력의 이끌림에 따라 수소 가스와 미세한 먼지 원반들이 모여들어 융합하기 시작했고, 중심부의 뜨거운 불꽃 속에서 태양이 깨어났습니다." },
        { d: 15, sub: "달 탐사를 통해 인류는 지구의 궤도를 이륙했습니다.", bg: "달 표면 크레이터와 착륙 모듈", narr: "오랜 시간 지구라는 요람에 머물렀던 인류는 아폴로 11호를 띄워 달을 향했습니다. 달 착륙선은 미지의 회색 대지에 인류의 역사적 발자국을 남겼습니다." },
        { d: 15, sub: "보이저 1호는 외계 성간 우주 공간을 항해하고 있습니다.", bg: "안테나 프로브와 먼 별빛 스캔", narr: "지구의 메시지를 품은 은빛 탐사선 보이저 1호는 태양계를 벗어나 깊은 어둠이 가득한 외계 성간 영역으로 지금도 계속 비행을 이어가고 있습니다." },
        { d: 15, sub: "제임스 웹 우주망원경이 심우주의 우주 성운을 관측합니다.", bg: "빛나는 적외선 성운과 화려한 은하 성단", narr: "최첨단 적외선 렌즈를 가진 망원경들은 우주의 끝자락에서 오는 희미한 태고의 빛을 포착하여 은하계 생성의 비밀을 파헤치고 있습니다." },
        { d: 15, sub: "화성 지표면에 착륙한 탐사차가 물의 증적을 분석합니다.", bg: "화성의 붉은 모래 바람과 큐리오시티 바퀴", narr: "로봇 탐사차들은 황량한 화성의 사막을 가로지르며, 고대 호수가 흘렀던 흔적을 발견해 훗날 인류가 정착할 수 있는 전초 기지를 꿈꾸고 있습니다." },
        { d: 15, sub: "민간 우주선 스페이스X 로켓이 성공적으로 지상에 귀환합니다.", bg: "불을 뿜으며 수직 착륙하는 로켓 부스터", sub: "로켓 수직 재착륙 기술은 민간 우주여행 단가를 획기적으로 낮춥니다.", narr: "과거 국가 차원을 넘어 민간 기업의 수직 재사용 로켓 성공은 우주 수송 비용을 비약적으로 줄였으며, 다행성 인류 문명을 실현하기 위한 가속 패치가 되었습니다." },
        { d: 15, sub: "우주 정거장을 거쳐 인류는 더 깊은 심우주로 비행합니다.", bg: "미래형 모듈러 도킹 정거장과 고속 워프 광선", narr: "이제 루나 게이트웨이와 같은 깊은 우주 전초기지가 구축되고 있으며, 이를 기점으로 지구를 초월하여 다른 태양계로 향하는 성간 이주가 현실로 다가오고 있습니다." }
      ];
      scenes.forEach((s, idx) => {
        script += `[SCENE ${idx + 1}]\nDuration: ${s.d}s\nSubtitle: ${s.sub}\nBackground: ${s.bg}\nNarration: ${s.narr}\n\n`;
      });
    } else if (type === "ai") {
      const scenes = [
        { d: 15, sub: "컴퓨터의 탄생과 함께 앨런 튜링은 기계의 사고를 질문했습니다.", bg: "진공관과 튜링 머신 톱니바퀴 링", narr: "20세기 중반, 위대한 수학자 앨런 튜링은 '기계가 생각할 수 있는가?'라는 질문을 던졌습니다. 이것이 바로 인공지능 탐사의 위대한 출발점이었습니다." },
        { d: 15, sub: "체스 시뮬레이터 딥블루가 인간 세계 챔피언을 격파했습니다.", bg: "체스판 그리드에 내리는 불꽃 연산 효과", narr: "1997년, IBM의 슈퍼컴퓨터 딥블루가 인간 세계 체스 챔피언 가리 카스파로프를 꺾으면서, 복잡한 지적 보드게임 규칙에서의 AI 우위가 증명되었습니다." },
        { d: 15, sub: "인간 바둑 최강자 이세돌을 무너뜨린 딥마인드 알파고의 등장.", bg: "바둑판 흑백 돌과 인공지능 뉴런 연결선", narr: "바둑은 경우의 수가 무한에 가까워 컴퓨터가 이길 수 없다고 여겨졌습니다. 하지만 2016년 알파고가 딥러닝과 몬테카를로 탐색을 결합해 인간을 격파하며 세상을 놀라게 했습니다." },
        { d: 15, sub: "대규모 언어 모델 트랜스포머 아키텍처의 혁신적인 돌파구.", bg: "대량의 데이터 문장들이 연결되는 레이저 빔 스트림", narr: "구글의 트랜스포머 논문 발표 이후 기계 번역과 언어 이해는 완전한 분기점을 맞이합니다. 인공지능은 문맥 속 단어의 주의 집중 가중치를 계산해 텍스트를 생성하기 시작했습니다." },
        { d: 15, sub: "생성형 AI가 화려한 예술 작품과 복잡한 프로그래밍 코드를 짭니다.", bg: "네온 물감이 무작위로 그려지는 디지털 페인팅 모션", narr: "이제 이미지 생성 AI와 초거대 언어 모델은 프롬프트 명령어 몇 줄만으로 고화질의 디지털 아트워크를 구현하고, 복잡한 소프트웨어 소스코드를 자동으로 빌드합니다." },
        { d: 15, sub: "자율주행 차량이 실시간으로 복잡한 도심 도로 환경을 식별합니다.", bg: "라이다 센서 격자선과 3D 물체 스캔 박스 회전", narr: "인공지능 카메라와 라이다 센서는 도로 위의 모든 차량, 보행자, 신호등을 실시간으로 추적 및 분류하여 안전하고 지능적인 주행 판단을 수행하고 있습니다." },
        { d: 15, sub: "지능형 로보틱스가 공장 조립 라인을 넘어 인간의 공간으로 들어옵니다.", bg: "로봇 매니퓰레이터 팔과 조립 부품 도식도", narr: "인지 지능을 갖춘 휴머노이드 로봇들은 제조 라인뿐만 아니라 가사 노동, 환자 케어 등 일상의 물리 공간에서 인간과 안전하게 협동하는 법을 배우고 있습니다." },
        { d: 15, sub: "AI 기술 발전에 따른 인공지능 저작권 및 딥페이크 위변조 윤리 리스크.", bg: "디지털 초상화 지문과 붉은 경고 시그널 오버레이", narr: "속도가 너무 빠른 AI 기술 성장은 저작권 침해, 딥페이크 악용, 대규모 가짜 정보 생산과 같은 다양한 사회적, 법적 부작용을 낳고 있으며, 엄격한 안전 지침 확립을 요구합니다." },
        { d: 15, sub: "인간의 능력을 모든 지적 영역에서 초월하는 인공일반지능(AGI)의 논쟁.", bg: "황금비율 휴머노이드 반도체 브레인 형상", narr: "학습 영역을 넘어 인간처럼 자율적으로 사유하고 멀티태스킹할 수 있는 AGI의 접근은, 인류에게 큰 도약이자 종말론적 위협이 될 수 있다는 야심 찬 경고를 던집니다." },
        { d: 15, sub: "인간과 기계의 상생적 융합과 동반 발전의 조화로운 미래.", bg: "빛나는 홀로그램 인터페이스와 인간의 악수 모션", narr: "가장 중요한 미래는 AI가 인간을 지배하거나 도태시키는 것이 아닌, 협력적 도구로서 인간의 상상력과 생산성의 한계를 극대화해 함께 문제를 해결해 나가는 상생의 여정입니다." }
      ];
      scenes.forEach((s, idx) => {
        script += `[SCENE ${idx + 1}]\nDuration: ${s.d}s\nSubtitle: ${s.sub}\nBackground: ${s.bg}\nNarration: ${s.narr}\n\n`;
      });
    } else if (type === "js") {
      // 80 scenes of 15 seconds each = 1200 seconds (20 minutes)
      const jsConcepts = [
        "JS 변수(let, const)", "원시 타입(String, Number)", "불리언과 조건 논리", "객체(Object)의 기초", 
        "배열(Array) 활용법", "기본 연산자 종류", "If-Else 조건문 분기", "Switch Case 매칭", 
        "For 루프와 반복 처리", "While 루프 기초", "함수 선언문 구조", "함수 표현식의 정의", 
        "화살표 함수(Arrow Fn)", "블록 및 글로벌 스코프", "호이스팅(Hoisting) 메커니즘", "클로저(Closure) 정의", 
        "콜백(Callback) 전달 패턴", "프로미스(Promise)의 상태", "비동기 Async와 Await", "구조 분해 할당(Destructuring)", 
        "스프레드 연산자(...)", "템플릿 리터럴 문장", "Map 자료구조의 키맵", "Set 중복 배제 컬렉션", 
        "클래스(Class) 선언문", "상속(Class extends)", "Getter와 Setter 메서드", "모듈 내보내기(export)", 
        "모듈 가져오기(import)", "이벤트 리스너(Click)", "DOM 요소 선택(querySelector)", "DOM 동적 스타일 변경", 
        "로컬스토리지 보관 키", "세션스토리지 임시보관", "Fetch API 원격 데이터 취득", "JSON 객체 파싱과 스트링화", 
        "예외 에러 핸들링", "Try-Catch 완충 패턴", "엄격 모드('use strict')", "배열 map() 데이터 가공", 
        "배열 filter() 조건 추출", "배열 reduce() 집계 연산", "배열 find() 값 검색", "Object.keys() 배열화", 
        "Object.values() 배열화", "Math 수학 상수 메서드", "Date 객체 시간 제어", "정규 표현식(RegExp) 매칭", 
        "setTimeout 지연 타이머", "setInterval 반복 주기", "requestAnimationFrame 루프", "Canvas 2D 렌더링 컨텍스트", 
        "Canvas 사각형 드로잉", "Canvas 아크 원형 드로잉", "Canvas 선 잇기(lineTo)", "Web Audio 오디오 소스", 
        "Web Speech 음성 낭독", "브라우저 위치 정보(Geolocation)", "커스텀 이벤트 발송과 수신", "이벤트 버블링 버블", 
        "이벤트 캡처링 단계", "커링(Currying) 함수 결합", "디바운스(Debounce) 부하 경감", "쓰로틀(Throttle) 주기 제한", 
        "클로저 캡처링 은닉 변수", "제너레이터(Generator) 이터레이터", "심볼(Symbol) 고유 식별자", "BigInt 거대 정수 타입", 
        "동적 임포트(import() 함수)", "웹 워커(Web Worker) 스레드", "서비스 워커(Service Worker) 캐시", "IndexedDB 로컬 DB", 
        "웹소켓(WebSocket) 실시간 통신", "로컬 변수 LERP 보간법", "게임 애니메이션 루프 축 구축", "총 80단계 로드 완료"
      ];
      
      for (let i = 0; i < 80; i++) {
        const title = jsConcepts[i] || `JS 추가 강좌 ${i+1}`;
        script += `[SCENE ${i + 1}]
Duration: 15s
Subtitle: 자바스크립트 학습 ${i+1}단계: ${title}에 대해 학습합니다.
Background: 소스 코드 텍스트 렌더링 및 알고리즘 시각화 다이어그램
Narration: 안녕하세요. 자바스크립트 마스터 코스입니다. 이번 장에서는 ${title}의 문법과 원리에 대해 알아봅니다. 코드를 작성하고 브라우저 개발자 도구 콘솔을 열어 결과를 바로 디버깅하며 이해해 보시기 바랍니다.

`;
      }
    }
    return script;
  }

  btnPresetLoads.forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.preset;
      const script = getPresetScript(type);
      scriptEditorText.value = script;
      compileScriptData();
    });
  });

  // ==========================================
  // 6. Web Audio Synthesizer Loop (BGM)
  // ==========================================
  function initAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create mixed destination node for MediaRecorder
      audioDestNode = audioCtx.createMediaStreamDestination();
    }
  }

  function startSynthBGM() {
    initAudioContext();
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    
    stopSynthBGM(); // Clean up existing
    
    const style = bgmThemeSelect.value;
    if (style === "none") return;
    
    let tempo = 120; // BPM
    let stepCount = 0;
    
    // Notes frequencies (pentatonic scale or ambient chords)
    const spaceChords = [110, 165, 220, 330, 440];
    const technoNotes = [55, 110, 165, 220, 293, 330];
    const pianoChords = [
      [261.63, 329.63, 392.00, 523.25], // C Major
      [349.23, 440.00, 523.25, 698.46], // F Major
      [392.00, 493.88, 587.33, 783.99], // G Major
      [293.66, 349.23, 440.00, 587.33]  // D minor
    ];
    const lofiNotes = [130.81, 196, 261.63, 329.63, 392, 440];

    const noteDuration = 60 / tempo; // quarter note in seconds
    
    // Procedural scheduling loop
    function scheduleNextNotes() {
      const now = audioCtx.currentTime;
      
      if (style === "space") {
        // Space Ambient: low droning oscillator with slow sweep filter
        if (stepCount % 8 === 0) {
          const baseFreq = spaceChords[Math.floor(Math.random() * spaceChords.length)] * 0.5;
          playSynthSynth(baseFreq, noteDuration * 8, 0.05, "sawtooth", 100, 800);
        }
      } else if (style === "techno") {
        // Fast Cyber Techno arpeggiator
        const freq = technoNotes[stepCount % technoNotes.length];
        playSynthSynth(freq, noteDuration * 0.8, 0.08, "square", 600, 1200);
      } else if (style === "piano") {
        // Slow Piano chord progression
        if (stepCount % 16 === 0) {
          const chordIdx = Math.floor(stepCount / 16) % pianoChords.length;
          const chord = pianoChords[chordIdx];
          chord.forEach(freq => {
            playSynthSynth(freq, noteDuration * 12, 0.03, "sine", 2000, 300);
          });
        }
      } else if (style === "lofi") {
        // Lofi jazzy slow chime melody
        if (stepCount % 4 === 0) {
          const freq = lofiNotes[Math.floor(Math.random() * lofiNotes.length)];
          playSynthSynth(freq, noteDuration * 3.5, 0.06, "triangle", 800, 400);
        }
      }
      
      stepCount++;
    }
    
    // Run arpeggiator step timer
    const intervalMs = (60 / tempo) * 1000 * 0.5; // Eighth notes
    synthIntervalId = setInterval(scheduleNextNotes, intervalMs);
  }

  function playSynthSynth(freq, duration, volume, type, cutFreq = 1000, q = 1) {
    if (!audioCtx || isMuted) return;
    
    try {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const filterNode = audioCtx.createBiquadFilter();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      
      filterNode.type = "lowpass";
      filterNode.frequency.setValueAtTime(cutFreq, audioCtx.currentTime);
      filterNode.Q.setValueAtTime(q, audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      
      osc.connect(filterNode);
      filterNode.connect(gainNode);
      
      // Connect to normal output (speakers)
      gainNode.connect(audioCtx.destination);
      
      // Connect to mixed MediaRecorder destination node
      if (audioDestNode) {
        gainNode.connect(audioDestNode);
      }
      
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio scheduling issue:", e);
    }
  }

  function stopSynthBGM() {
    if (synthIntervalId) {
      clearInterval(synthIntervalId);
      synthIntervalId = null;
    }
  }

  // ==========================================
  // 7. TTS Speech Synthesis Narration Play
  // ==========================================
  function playSceneNarration(scene) {
    if (typeof speechSynthesis === "undefined" || isMuted) return;
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const text = scene.narration.trim();
    if (!text) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply voice settings
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // AI Voice Persona profile mapping
    const persona = ttsVoicePersonaSelect ? ttsVoicePersonaSelect.value : "calm-male";
    let pitch = 1.0;
    let baseRate = 1.0;
    
    if (persona === "calm-male") {
      pitch = 0.82;
      baseRate = 0.95;
    } else if (persona === "calm-female") {
      pitch = 1.25;
      baseRate = 0.95;
    } else if (persona === "deep-docu") {
      pitch = 0.65;
      baseRate = 0.85;
    } else if (persona === "energetic") {
      pitch = 1.35;
      baseRate = 1.15;
    } else if (persona === "robot") {
      pitch = 1.0;
      baseRate = 1.0;
    }
    
    utterance.pitch = pitch;
    
    // Automatically match voice rate to scene duration if narration is very long
    const charCount = text.length;
    const durLimit = scene.duration;
    const standardDuration = charCount / (3.5 * baseRate);
    
    let speechRate = baseRate;
    if (standardDuration > durLimit) {
      speechRate = Math.max(0.8, Math.min(2.5, standardDuration / durLimit));
    }
    utterance.rate = speechRate;
    
    // Speak
    speechSynthesis.speak(utterance);
  }

  // ==========================================
  // 8. 16:9 Canvas Rendering Engine
  // ==========================================
  const stars = [];
  const matrixLines = [];
  const nodes = [];
  const leaves = [];
  const retroStars = [];
  const techGridLines = [];
  const bubbles = [];
  let codeOffset = 0;
  
  // Initialize dynamic background variables
  function initVisualAssets() {
    const w = videoCanvas.width;
    const h = videoCanvas.height;
    
    // 1. Space Stars
    stars.length = 0;
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: (Math.random() - 0.5) * w * 1.5,
        y: (Math.random() - 0.5) * h * 1.5,
        z: Math.random() * 800,
        size: Math.random() * 2 + 0.5
      });
    }
    
    // 2. Cyberpunk matrix rain
    matrixLines.length = 0;
    const cols = Math.floor(w / 20);
    for (let i = 0; i < cols; i++) {
      matrixLines.push({
        x: i * 20,
        y: Math.random() * -600,
        speed: Math.random() * 3 + 2,
        chars: Array.from({ length: 10 }, () => String.fromCharCode(33 + Math.floor(Math.random() * 90)))
      });
    }

    // 3. Coding diagram nodes
    nodes.length = 0;
    const minNodeX = w / 2 + 30;
    const maxNodeX = w - 40;
    const minNodeY = 50;
    const maxNodeY = h - 130;
    for (let i = 0; i < 15; i++) {
      nodes.push({
        x: Math.random() * (maxNodeX - minNodeX) + minNodeX,
        y: Math.random() * (maxNodeY - minNodeY) + minNodeY,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 8 + 4
      });
    }
    codeOffset = 0;

    // 4. Nature leaves/fireflies
    leaves.length = 0;
    for (let i = 0; i < 40; i++) {
      leaves.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 3 + 1.5,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: -(Math.random() * 0.7 + 0.3),
        alpha: Math.random() * 0.6 + 0.2,
        phase: Math.random() * Math.PI
      });
    }

    // 5. Retro-synth stars
    retroStars.length = 0;
    for (let i = 0; i < 60; i++) {
      retroStars.push({
        x: Math.random() * w,
        y: Math.random() * (h * 0.6),
        size: Math.random() * 2 + 1,
        color: Math.random() < 0.5 ? "#06b6d4" : "#ec4899",
        blinkSpeed: Math.random() * 0.05 + 0.01,
        phase: Math.random() * Math.PI
      });
    }

    // 6. Corporate grid & chart nodes
    techGridLines.length = 0;
    for (let i = 0; i < 12; i++) {
      techGridLines.push({
        val: Math.random() * 100,
        targetVal: Math.random() * 100,
        speed: Math.random() * 0.03 + 0.01
      });
    }

    // 7. Ocean bubbles
    bubbles.length = 0;
    for (let i = 0; i < 40; i++) {
      bubbles.push({
        x: Math.random() * w,
        y: Math.random() * h + 50,
        radius: Math.random() * 4 + 1.5,
        speedY: -(Math.random() * 1.0 + 0.4),
        wobbleSpeed: Math.random() * 0.02 + 0.01,
        wobbleAmount: Math.random() * 12 + 4,
        phase: Math.random() * Math.PI
      });
    }
  }

  function updateCanvasDimensions() {
    const aspect = videoAspectSelect ? videoAspectSelect.value : "16-9";
    const aspectWrapper = document.querySelector(".canvas-aspect-wrapper");
    const playerTitle = document.querySelector(".right-col .glass-card:nth-of-type(2) .card-title");
    
    if (aspect === "9-16") {
      videoCanvas.width = 360;
      videoCanvas.height = 640;
      if (aspectWrapper) {
        aspectWrapper.classList.add("aspect-9-16");
      }
      if (playerTitle) {
        playerTitle.innerHTML = '<i class="fa-solid fa-circle-play text-purple"></i> 9:16 렌더링 플레이어 (숏폼)';
      }
    } else {
      videoCanvas.width = 854;
      videoCanvas.height = 480;
      if (aspectWrapper) {
        aspectWrapper.classList.remove("aspect-9-16");
      }
      if (playerTitle) {
        playerTitle.innerHTML = '<i class="fa-solid fa-circle-play text-purple"></i> 16:9 렌더링 플레이어 (롱폼)';
      }
    }
    
    initVisualAssets();
    renderCanvasFrame(currentTime);
  }

  if (videoAspectSelect) {
    videoAspectSelect.addEventListener("change", () => {
      updateCanvasDimensions();
    });
  }

  // Initial setup call
  updateCanvasDimensions();

  function playSceneChirp() {
    if (!audioCtx || isMuted) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.08);
      
      gain.gain.setValueAtTime(0.012, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      if (audioDestNode) {
        gain.connect(audioDestNode);
      }
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  function renderCanvasFrame(timeSec) {
    const width = videoCanvas.width;
    const height = videoCanvas.height;
    
    // 1. Find currently active scene
    const sceneIdx = timeline.findIndex(s => timeSec >= s.startTime && timeSec < s.endTime);
    let scene = null;
    
    if (sceneIdx !== -1) {
      scene = timeline[sceneIdx];
      if (sceneIdx !== activeSceneIndex) {
        activeSceneIndex = sceneIdx;
        currentSceneIndicator.textContent = `SCENE ${scene.id} / ${timeline.length}`;
        // Automatically play TTS narration for this scene
        if (isPlaying) {
          playSceneChirp();
          playSceneNarration(scene);
        }
      }
    } else {
      // Out of bounds or at the end
      if (timeSec >= totalDuration && totalDuration > 0) {
        triggerPlaybackEnd();
      }
    }

    // Clear background
    ctx.fillStyle = "#030408";
    ctx.fillRect(0, 0, width, height);

    // Apply procedural background theme animations
    const activeTheme = videoThemeSelect.value;
    const timeFactor = timeSec * 1000; // ms
    
    if (activeTheme === "space") {
      drawSpaceTheme(ctx, width, height, timeFactor);
    } else if (activeTheme === "cyberpunk") {
      drawCyberpunkTheme(ctx, width, height, timeFactor);
    } else if (activeTheme === "education") {
      drawCodingTheme(ctx, width, height, timeFactor, scene, timeSec);
    } else if (activeTheme === "historical") {
      drawHistoricalTheme(ctx, width, height, timeFactor, scene);
    } else if (activeTheme === "nature") {
      drawNatureTheme(ctx, width, height, timeFactor);
    } else if (activeTheme === "retro-synth") {
      drawRetroSynthTheme(ctx, width, height, timeFactor);
    } else if (activeTheme === "corporate") {
      drawCorporateTheme(ctx, width, height, timeFactor, timeSec);
    } else if (activeTheme === "ocean") {
      drawOceanTheme(ctx, width, height, timeFactor);
    }

    // Draw grid overlays for design
    ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < width; x += 60) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += 60) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Draw active scene subtitle burnt on the canvas
    if (scene) {
      drawBakeInSubtitles(ctx, width, height, scene.subtitle);
      drawSceneIndexLabel(ctx, scene.id, timeSec - scene.startTime, scene.duration);
    } else {
      drawBakeInSubtitles(ctx, width, height, "CineAHO AI 영상 편집 대기 중");
    }

    // Top Header info decoration on canvas
    ctx.font = "bold 10px 'Outfit'";
    ctx.fillStyle = "rgba(139, 92, 246, 0.7)";
    ctx.fillText(width < 400 ? "AHO SHORT-CAPTURE" : "AHO PRO-STREAM CAPTURE SYSTEM", 20, 30);
    
    // Bottom footer timestamp decoration on canvas
    ctx.font = "bold 11px 'Fira Code'";
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fillText(formatTime(timeSec), width - 70, height - 25);
  }

  function wrapText(context, text, maxWidth) {
    const chars = Array.from(text);
    const lines = [];
    let line = "";
    
    for (let n = 0; n < chars.length; n++) {
      let testLine = line + chars[n];
      let metrics = context.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line);
        line = chars[n];
      } else {
        line = testLine;
      }
    }
    lines.push(line);
    return lines;
  }

  // Draw Subtitles baked into Canvas
  function drawBakeInSubtitles(targetCtx, w, h, text) {
    targetCtx.save();
    
    const isShortForm = w < 400;
    const fontSize = isShortForm ? 14 : 17;
    targetCtx.font = `500 ${fontSize}px 'Noto Sans KR', sans-serif`;
    
    const maxTextWidth = w - 60;
    const lines = wrapText(targetCtx, text, maxTextWidth);
    
    const lineHeight = fontSize + 6;
    const paddingX = 16;
    const paddingY = 10;
    
    let maxLineWidth = 0;
    lines.forEach(line => {
      const lineWidth = targetCtx.measureText(line).width;
      if (lineWidth > maxLineWidth) maxLineWidth = lineWidth;
    });
    
    const boxW = maxLineWidth + paddingX * 2;
    const boxH = (lines.length * lineHeight) + paddingY * 2 - 4;
    const boxX = (w - boxW) / 2;
    const boxY = h - 85 - (lines.length - 1) * lineHeight;
    
    // Draw Glass container backing on canvas
    targetCtx.fillStyle = "rgba(10, 12, 22, 0.85)";
    targetCtx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    targetCtx.lineWidth = 1;
    roundRect(targetCtx, boxX, boxY, boxW, boxH, 8);
    targetCtx.fill();
    targetCtx.stroke();
    
    // Text drawing
    targetCtx.fillStyle = "#ffffff";
    targetCtx.textAlign = "center";
    targetCtx.textBaseline = "top";
    
    lines.forEach((line, idx) => {
      targetCtx.fillText(line, w / 2, boxY + paddingY + idx * lineHeight);
    });
    
    targetCtx.restore();
  }

  function drawSceneIndexLabel(targetCtx, sceneId, elapsed, maxDur) {
    targetCtx.save();
    targetCtx.font = "800 11px 'Outfit'";
    targetCtx.fillStyle = "#8b5cf6";
    targetCtx.fillText(`SCENE ${sceneId}`, 25, 60);
    
    // Small progress dot bar
    targetCtx.fillStyle = "rgba(255, 255, 255, 0.1)";
    targetCtx.fillRect(25, 68, 60, 4);
    
    const ratio = Math.min(1.0, elapsed / maxDur);
    targetCtx.fillStyle = "#8b5cf6";
    targetCtx.fillRect(25, 68, 60 * ratio, 4);
    targetCtx.restore();
  }

  function roundRect(c, x, y, width, height, radius) {
    c.beginPath();
    c.moveTo(x + radius, y);
    c.lineTo(x + width - radius, y);
    c.quadraticCurveTo(x + width, y, x + width, y + radius);
    c.lineTo(x + width, y + height - radius);
    c.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    c.lineTo(x + radius, y + height);
    c.quadraticCurveTo(x, y + height, x, y + height - radius);
    c.lineTo(x, y + radius);
    c.quadraticCurveTo(x, y, x + radius, y);
    c.closePath();
  }

  // Space Starfield Theme Visuals
  function drawSpaceTheme(c, w, h, timeMs) {
    // Nebulae glowing background
    const gradient = c.createRadialGradient(
      w / 2 + Math.cos(timeMs / 4000) * 150, 
      h / 2 + Math.sin(timeMs / 4000) * 100, 
      50, 
      w / 2, 
      h / 2, 
      450
    );
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.08)"); // Dark blue glow
    gradient.addColorStop(0.5, "rgba(139, 92, 246, 0.06)"); // purple
    gradient.addColorStop(1, "#030408");
    
    c.fillStyle = gradient;
    c.fillRect(0, 0, w, h);

    // Drifting Giant Planet
    c.save();
    c.translate(w / 2 - 200 + (timeMs / 300) % 80, h / 2 + 50 - (timeMs / 600) % 30);
    const pGrad = c.createRadialGradient(-30, -30, 10, 0, 0, 80);
    pGrad.addColorStop(0, "#fbbf24"); // Sun side glow
    pGrad.addColorStop(0.3, "#d97706");
    pGrad.addColorStop(0.8, "#1e1b4b"); // Shadow side dark blue
    pGrad.addColorStop(1, "#0f172a");
    
    c.fillStyle = pGrad;
    c.shadowColor = "rgba(251, 191, 36, 0.3)";
    c.shadowBlur = 40;
    c.beginPath();
    c.arc(0, 0, 80, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // 3D Starfield Warp Speed
    c.fillStyle = "#ffffff";
    const speed = 2.5;
    
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.z -= speed;
      
      if (s.z <= 0) {
        s.z = 800;
        s.x = (Math.random() - 0.5) * 800;
        s.y = (Math.random() - 0.5) * 800;
      }
      
      const px = (s.x / s.z) * 600 + w / 2;
      const py = (s.y / s.z) * 600 + h / 2;
      
      if (px >= 0 && px < w && py >= 0 && py < h) {
        const dSize = (1 - s.z / 800) * 4 * s.size;
        const alpha = (1 - s.z / 800);
        c.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        c.beginPath();
        c.arc(px, py, dSize, 0, Math.PI * 2);
        c.fill();
      }
    }
  }

  // Cyberpunk Grid Theme Visuals
  function drawCyberpunkTheme(c, w, h, timeMs) {
    // Glow circles in center
    c.save();
    c.strokeStyle = "rgba(139, 92, 246, 0.15)";
    c.lineWidth = 2;
    c.shadowColor = "rgba(139, 92, 246, 0.5)";
    c.shadowBlur = 20;
    
    c.beginPath();
    c.arc(w / 2, h / 2, 120 + Math.sin(timeMs / 500) * 10, 0, Math.PI * 2);
    c.stroke();
    
    c.strokeStyle = "rgba(59, 130, 246, 0.15)";
    c.beginPath();
    c.arc(w / 2, h / 2, 70 - Math.cos(timeMs / 400) * 6, 0, Math.PI * 2);
    c.stroke();
    c.restore();

    // Perspective Neon Grid Lines at bottom
    c.save();
    const horizon = h / 2 + 30;
    c.strokeStyle = "rgba(236, 72, 153, 0.25)"; // Pink glow grid
    c.lineWidth = 1.5;
    
    const linesCount = 18;
    for (let i = 0; i <= linesCount; i++) {
      const startX = (i / linesCount) * w;
      c.beginPath();
      c.moveTo(w / 2 + (startX - w / 2) * 0.05, horizon);
      c.lineTo(startX, h);
      c.stroke();
    }
    
    // Horizontal lines scrolling down
    const offset = (timeMs * 0.08) % 40;
    for (let y = horizon; y <= h; y += 40) {
      const currY = y + offset;
      if (currY > h) continue;
      
      const ratio = (currY - horizon) / (h - horizon);
      c.strokeStyle = `rgba(236, 72, 153, ${ratio * 0.3})`;
      c.beginPath();
      c.moveTo(w / 2 - (w / 2) * ratio, currY);
      c.lineTo(w / 2 + (w / 2) * ratio, currY);
      c.stroke();
    }
    c.restore();

    // Digital matrix rain falling
    c.save();
    c.font = "10px 'Fira Code'";
    c.fillStyle = "rgba(16, 185, 129, 0.35)"; // green matrix
    
    for (let i = 0; i < matrixLines.length; i++) {
      const ml = matrixLines[i];
      ml.y += ml.speed;
      
      if (ml.y > h + 100) {
        ml.y = Math.random() * -300;
        ml.speed = Math.random() * 3 + 2;
      }
      
      ml.chars.forEach((ch, idx) => {
        const charY = ml.y + idx * 14;
        if (charY > 0 && charY < h) {
          c.fillText(ch, ml.x, charY);
        }
      });
      
      // Randomly change a character to make it look active
      if (Math.random() < 0.05) {
        const replaceIdx = Math.floor(Math.random() * ml.chars.length);
        ml.chars[replaceIdx] = String.fromCharCode(33 + Math.floor(Math.random() * 90));
      }
    }
    c.restore();
  }

  // IT Coding Theme Visuals
  const codingSamples = [
    "const app = express();",
    "app.use(express.json());",
    "// Fetch data from Gemini API",
    "async function generateVideo() {",
    "  const response = await fetch(url, {",
    "    method: 'POST',",
    "    body: JSON.stringify(payload)",
    "  });",
    "  const data = await response.json();",
    "  return data.candidates[0].text;",
    "}",
    "// Compile canvas frames at 60fps",
    "function renderScene(context, elapsed) {",
    "  context.fillStyle = '#05070e';",
    "  context.fillRect(0, 0, 854, 480);",
    "  drawParticles(context, elapsed);",
    "  drawSubtitles(context, subtitles);",
    "}",
    "const videoStream = canvas.captureStream();",
    "const recorder = new MediaRecorder(videoStream);",
    "recorder.start();"
  ];

  function drawCodingTheme(c, w, h, timeMs, scene, timeSec) {
    // Draw Simulated Code Editor UI
    c.save();
    
    // Editor Container
    c.fillStyle = "#0a0c14";
    c.strokeStyle = "rgba(59, 130, 246, 0.15)";
    c.lineWidth = 2;
    roundRect(c, 30, 45, w / 2 - 30, h - 140, 10);
    c.fill();
    c.stroke();
    
    // Editor Header tab
    c.fillStyle = "#141824";
    roundRect(c, 30, 45, w / 2 - 30, 26, { tl: 10, tr: 10, bl: 0, br: 0 });
    c.fill();
    
    // Title
    c.font = "bold 9px 'Fira Code'";
    c.fillStyle = "rgba(255, 255, 255, 0.5)";
    c.fillText("app.js - index_compiler - Visual IDE v1.0", 45, 62);
    
    // 3 small red, yellow, green buttons
    c.fillStyle = "#ef4444"; c.beginPath(); c.arc(w / 2 - 30, 58, 4, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#eab308"; c.beginPath(); c.arc(w / 2 - 42, 58, 4, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#22c55e"; c.beginPath(); c.arc(w / 2 - 54, 58, 4, 0, Math.PI * 2); c.fill();
    
    // Typist effect: draw lines of codes
    c.font = "10px 'Fira Code'";
    c.fillStyle = "#94a3b8";
    
    const maxVisibleLines = 14;
    const scrollOffset = Math.floor(timeSec * 0.8) % Math.max(1, codingSamples.length - maxVisibleLines + 5);
    
    for (let i = 0; i < maxVisibleLines; i++) {
      const lineIdx = (i + scrollOffset) % codingSamples.length;
      const rawLine = codingSamples[lineIdx];
      const yPos = 90 + i * 18;
      
      // Draw Line numbers
      c.fillStyle = "rgba(255, 255, 255, 0.15)";
      c.fillText((lineIdx + 1).toString().padStart(3, "0"), 45, yPos);
      
      // Simple coloring matching syntax
      let codeColor = "#f1f5f9";
      if (rawLine.startsWith("const") || rawLine.startsWith("async") || rawLine.startsWith("function") || rawLine.startsWith("return")) {
        codeColor = "#c084fc"; // keyword purple
      } else if (rawLine.startsWith("//")) {
        codeColor = "rgba(16, 185, 129, 0.6)"; // comment green
      } else if (rawLine.includes("fetch") || rawLine.includes("renderScene")) {
        codeColor = "#60a5fa"; // functions blue
      }
      
      c.fillStyle = codeColor;
      // Draw line string character by character (fake cursor write)
      const typedLen = Math.floor((timeSec * 25) % 80);
      const outputLine = rawLine.substring(0, typedLen);
      c.fillText(outputLine, 80, yPos);
    }
    c.restore();

    // Node diagram animation on the right
    c.save();
    c.strokeStyle = "rgba(139, 92, 246, 0.08)";
    c.lineWidth = 1;
    
    // Draw links between nodes
    for (let i = 0; i < nodes.length; i++) {
      const n1 = nodes[i];
      
      // Move node
      n1.x += n1.vx;
      n1.y += n1.vy;
      
      // Bounce off walls of right region
      const minX = w / 2 + 30;
      if (n1.x < minX || n1.x > w - 40) n1.vx *= -1;
      if (n1.y < 50 || n1.y > h - 130) n1.vy *= -1;
      
      for (let j = i + 1; j < nodes.length; j++) {
        const n2 = nodes[j];
        const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
        
        if (dist < 130) {
          c.strokeStyle = `rgba(139, 92, 246, ${(1 - dist / 130) * 0.15})`;
          c.beginPath();
          c.moveTo(n1.x, n1.y);
          c.lineTo(n2.x, n2.y);
          c.stroke();
        }
      }
    }
    
    // Draw node dots
    nodes.forEach(n => {
      c.fillStyle = "rgba(59, 130, 246, 0.25)";
      c.beginPath();
      c.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      c.fill();
      
      c.strokeStyle = "rgba(139, 92, 246, 0.4)";
      c.beginPath();
      c.arc(n.x, n.y, n.radius + Math.sin(timeMs / 250) * 3, 0, Math.PI * 2);
      c.stroke();
    });
    c.restore();
  }

  // Historical Archive Theme Visuals
  function drawHistoricalTheme(c, w, h, timeMs, scene) {
    // Sepia solid tone background
    c.fillStyle = "#1c140c"; // Sepia dark background
    c.fillRect(0, 0, w, h);

    // Old vintage film texture & dust particles
    c.save();
    
    // Vignette circular overlay
    const vigGrad = c.createRadialGradient(w/2, h/2, w/3, w/2, h/2, w/2 + 50);
    vigGrad.addColorStop(0, "transparent");
    vigGrad.addColorStop(1, "rgba(0, 0, 0, 0.8)");
    c.fillStyle = vigGrad;
    c.fillRect(0, 0, w, h);
    
    // Draw vertical film scratches
    c.strokeStyle = "rgba(255, 255, 255, 0.04)";
    c.lineWidth = Math.random() < 0.1 ? 1.5 : 0.4;
    if (Math.random() < 0.25) {
      const scratchX = Math.random() * w;
      c.beginPath();
      c.moveTo(scratchX, 0);
      c.lineTo(scratchX, h);
      c.stroke();
    }
    
    // Film hair or dust spots
    if (Math.random() < 0.15) {
      c.fillStyle = "rgba(255, 255, 255, 0.08)";
      c.beginPath();
      c.arc(Math.random() * w, Math.random() * h, Math.random() * 2 + 1, 0, Math.PI*2);
      c.fill();
    }
    
    // Pulsing film frame border shadows
    c.fillStyle = `rgba(0, 0, 0, ${Math.sin(timeMs / 100) * 0.03 + 0.05})`;
    c.fillRect(0, 0, w, h);
    c.restore();

    // Drawing a rotating ancient sketch world globe
    c.save();
    c.translate(w / 2, h / 2 - 30);
    c.strokeStyle = "rgba(235, 180, 105, 0.15)"; // Golden sepia outline
    c.lineWidth = 1;
    
    // Outer frame circle
    c.beginPath();
    c.arc(0, 0, 110, 0, Math.PI * 2);
    c.stroke();
    
    // Longitudinal lines rotating
    const count = 6;
    const rotateOffset = (timeMs / 5000) % (Math.PI * 2);
    
    for (let k = 0; k < count; k++) {
      const skewAngle = rotateOffset + (k * (Math.PI / count));
      c.save();
      c.scale(Math.cos(skewAngle), 1.0);
      c.beginPath();
      c.arc(0, 0, 110, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    }
    
    // Latitude lines
    for (let y = -90; y <= 90; y += 30) {
      const radiusAtY = Math.sqrt(110*110 - y*y);
      c.beginPath();
      c.moveTo(-radiusAtY, y);
      c.lineTo(radiusAtY, y);
      c.stroke();
    }
    c.restore();
  }
  // Nature Theme Drawing Logic
  function drawNatureTheme(c, w, h, timeMs) {
    // Forest deep green background gradient
    const gradient = c.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, "#021c12");
    gradient.addColorStop(1, "#010805");
    c.fillStyle = gradient;
    c.fillRect(0, 0, w, h);

    // Draw fireflies
    leaves.forEach(l => {
      l.x += l.speedX;
      l.y += l.speedY;
      l.phase += 0.02;

      // Wrap around screen
      if (l.y < -10) {
        l.y = h + 10;
        l.x = Math.random() * w;
      }
      if (l.x < -10 || l.x > w + 10) {
        l.x = Math.random() * w;
      }

      // Wobble animation
      const wobbleX = l.x + Math.sin(l.phase) * 8;
      const glowAlpha = l.alpha * (0.6 + 0.4 * Math.sin(l.phase * 2));

      c.save();
      c.shadowBlur = l.size * 5;
      c.shadowColor = "#10b981";
      c.fillStyle = `rgba(16, 185, 129, ${glowAlpha})`;
      c.beginPath();
      c.arc(wobbleX, l.y, l.size, 0, Math.PI * 2);
      c.fill();
      c.restore();
    });

    // Draw organic light rays
    c.save();
    c.strokeStyle = "rgba(16, 185, 129, 0.025)";
    c.lineWidth = w < 400 ? 25 : 40;
    c.beginPath();
    const rayAngle = Math.sin(timeMs / 5000) * 0.1;
    for (let k = 0; k < 4; k++) {
      const startX = w * 0.2 + k * w * 0.2 + Math.sin(timeMs / 3000 + k) * 30;
      c.moveTo(startX, 0);
      c.lineTo(startX + Math.tan(rayAngle) * h + (w < 400 ? 20 : 50), h);
    }
    c.stroke();
    c.restore();
  }

  // Retro Synthwave Theme Drawing Logic
  function drawRetroSynthTheme(c, w, h, timeMs) {
    const gradient = c.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, "#08061a");
    gradient.addColorStop(0.6, "#180c2e");
    gradient.addColorStop(1, "#3c093a");
    c.fillStyle = gradient;
    c.fillRect(0, 0, w, h);

    // Blinking retro stars
    retroStars.forEach(s => {
      s.phase += s.blinkSpeed;
      const alpha = 0.3 + 0.7 * Math.abs(Math.sin(s.phase));
      c.fillStyle = s.color;
      c.save();
      c.shadowBlur = s.size * 3;
      c.shadowColor = s.color;
      c.globalAlpha = alpha;
      c.beginPath();
      c.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      c.fill();
      c.restore();
    });

    // Neon grid sunset Sun rising
    c.save();
    const sunRadius = Math.min(w, h) * 0.25;
    const sunX = w / 2;
    const sunY = h * 0.55;
    
    const sunGrad = c.createLinearGradient(sunX, sunY - sunRadius, sunX, sunY + sunRadius);
    sunGrad.addColorStop(0, "#fbcfe8");
    sunGrad.addColorStop(0.5, "#ec4899");
    sunGrad.addColorStop(1, "#f97316");
    
    c.fillStyle = sunGrad;
    c.shadowColor = "#ec4899";
    c.shadowBlur = 30;
    c.beginPath();
    c.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // Slices cutouts
    c.fillStyle = "#08061a";
    for (let y = sunY - sunRadius; y < sunY + sunRadius; y += 12) {
      if (y > sunY - 40) {
        const sliceHeight = (y - (sunY - 40)) * 0.18 + 1;
        c.fillRect(sunX - sunRadius - 10, y, sunRadius * 2 + 20, sliceHeight);
      }
    }

    // Grid perspective bottom
    c.save();
    const horizon = h * 0.55;
    c.strokeStyle = "#06b6d4";
    c.lineWidth = 1.5;
    
    const linesCount = w < 400 ? 8 : 14;
    for (let i = 0; i <= linesCount; i++) {
      const startX = (i / linesCount) * w;
      c.beginPath();
      c.moveTo(w / 2 + (startX - w / 2) * 0.04, horizon);
      c.lineTo(startX, h);
      c.stroke();
    }
    
    const offset = (timeMs * 0.06) % 30;
    for (let y = horizon; y <= h; y += 30) {
      const currY = y + offset;
      if (currY > h) continue;
      
      const ratio = (currY - horizon) / (h - horizon);
      c.strokeStyle = `rgba(6, 182, 212, ${ratio * 0.35})`;
      c.beginPath();
      c.moveTo(w / 2 - (w / 2) * ratio, currY);
      c.lineTo(w / 2 + (w / 2) * ratio, currY);
      c.stroke();
    }
    c.restore();
  }

  // Corporate Tech Theme Drawing Logic
  function drawCorporateTheme(c, w, h, timeMs, timeSec) {
    const gradient = c.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, "#040c1e");
    gradient.addColorStop(1, "#01030a");
    c.fillStyle = gradient;
    c.fillRect(0, 0, w, h);

    // Dot grid
    c.fillStyle = "rgba(59, 130, 246, 0.12)";
    const gap = w < 400 ? 30 : 40;
    for (let x = 20; x < w; x += gap) {
      for (let y = 20; y < h; y += gap) {
        c.beginPath();
        c.arc(x, y, 1.2, 0, Math.PI * 2);
        c.fill();
      }
    }

    // Chart plotting
    c.save();
    c.strokeStyle = "rgba(59, 130, 246, 0.35)";
    c.lineWidth = 2;
    
    const chartW = w * 0.75;
    const chartH = h * 0.35;
    const chartX = (w - chartW) / 2;
    const chartY = h * 0.55;

    c.fillStyle = "rgba(59, 130, 246, 0.02)";
    c.fillRect(chartX, chartY - chartH, chartW, chartH);
    c.strokeStyle = "rgba(59, 130, 246, 0.08)";
    c.strokeRect(chartX, chartY - chartH, chartW, chartH);

    c.beginPath();
    const pointsCount = w < 400 ? 6 : 10;
    const stepX = chartW / (pointsCount - 1);
    
    for (let i = 0; i < pointsCount; i++) {
      const noise = Math.sin(timeSec * 0.5 + i * 1.5) * Math.cos(i * 0.8) * 0.5 + 0.5;
      const pY = chartY - (chartH * 0.2) - (chartH * 0.6 * noise);
      const pX = chartX + i * stepX;
      
      if (i === 0) {
        c.moveTo(pX, pY);
      } else {
        c.lineTo(pX, pY);
      }
    }
    c.strokeStyle = "#3b82f6";
    c.lineWidth = 3;
    c.shadowColor = "#3b82f6";
    c.shadowBlur = 10;
    c.stroke();
    c.restore();

    // Data packets
    c.save();
    c.font = "9px 'Fira Code'";
    c.fillStyle = "rgba(96, 165, 250, 0.25)";
    for (let i = 0; i < techGridLines.length; i++) {
      const line = techGridLines[i];
      if (Math.abs(line.val - line.targetVal) < 1) {
        line.targetVal = Math.random() * 100;
      }
      line.val += (line.targetVal - line.val) * line.speed;
      
      const textX = 30 + i * (w - 60) / techGridLines.length;
      const textY = 70 + (line.val % (h - 220));
      c.fillText(`D_${Math.round(line.val)}%`, textX, textY);
    }
    c.restore();
  }

  // Ocean Theme Drawing Logic
  function drawOceanTheme(c, w, h, timeMs) {
    const gradient = c.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, "#010c1e");
    gradient.addColorStop(0.7, "#031c36");
    gradient.addColorStop(1, "#022c43");
    c.fillStyle = gradient;
    c.fillRect(0, 0, w, h);

    // Floating organic bubbles
    bubbles.forEach(b => {
      b.y += b.speedY;
      b.phase += b.wobbleSpeed;

      if (b.y < -20) {
        b.y = h + 20;
        b.x = Math.random() * w;
      }

      const wobbleX = b.x + Math.sin(b.phase) * (b.wobbleAmount * 0.5);

      c.save();
      c.strokeStyle = "rgba(96, 165, 250, 0.25)";
      c.lineWidth = 1;
      
      c.beginPath();
      c.arc(wobbleX, b.y, b.radius, 0, Math.PI * 2);
      c.stroke();
      
      c.fillStyle = "rgba(255, 255, 255, 0.08)";
      c.beginPath();
      c.arc(wobbleX - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.2, 0, Math.PI * 2);
      c.fill();
      c.restore();
    });

    // Ocean caustics light rays
    c.save();
    c.fillStyle = "rgba(6, 182, 212, 0.04)";
    c.beginPath();
    
    const rayOffset = Math.sin(timeMs / 4000) * 40;
    c.moveTo(w / 2 + rayOffset - (w < 400 ? 50 : 100), 0);
    c.lineTo(w / 2 + rayOffset + (w < 400 ? 50 : 100), 0);
    c.lineTo(w / 2 + rayOffset * 1.8 + (w < 400 ? 120 : 250), h);
    c.lineTo(w / 2 + rayOffset * 1.8 - (w < 400 ? 120 : 250), h);
    c.closePath();
    c.fill();
    c.restore();
  }


  // ==========================================
  // 9. Timeline Playback Control Functions
  // ==========================================
  function updateActiveSubtitles(timeSec) {
    const active = timeline.find(s => timeSec >= s.startTime && timeSec < s.endTime);
    if (active) {
      subtitleTextElement.textContent = active.subtitle;
      subtitleBoxOverlay.style.display = "flex";
    } else {
      subtitleTextElement.textContent = "프로젝트 빌드 대기 중";
      subtitleBoxOverlay.style.display = "none";
    }
  }

  function tickPlayer(timestamp) {
    if (!isPlaying) return;
    
    const deltaMs = timestamp - lastFrameTime;
    lastFrameTime = timestamp;
    
    // Advance playback time
    currentTime += (deltaMs / 1000);
    
    // Sync slider UI
    timelineProgressSlider.value = Math.floor(currentTime);
    currentTimeLabel.textContent = formatTime(currentTime);
    
    // Render
    renderCanvasFrame(currentTime);
    updateActiveSubtitles(currentTime);
    
    // Request next frame
    animationFrameId = requestAnimationFrame(tickPlayer);
  }

  function playVideo() {
    if (timeline.length === 0) return;
    
    initAudioContext();
    
    // If finished, reset to beginning
    if (currentTime >= totalDuration) {
      currentTime = 0;
      activeSceneIndex = -1;
    }
    
    isPlaying = true;
    btnPlayPause.innerHTML = '<i class="fa-solid fa-pause"></i>';
    lastFrameTime = performance.now();
    
    // Trigger synth bgm
    startSynthBGM();
    
    // Run speech for active scene
    const active = timeline.find(s => currentTime >= s.startTime && currentTime < s.endTime);
    if (active) {
      playSceneNarration(active);
    }
    
    animationFrameId = requestAnimationFrame(tickPlayer);
  }

  function pauseVideo() {
    isPlaying = false;
    btnPlayPause.innerHTML = '<i class="fa-solid fa-play"></i>';
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    
    // Stop bgm synth
    stopSynthBGM();
    
    // Pause TTS
    if (typeof speechSynthesis !== "undefined") {
      speechSynthesis.pause();
    }
  }

  function stopVideo() {
    isPlaying = false;
    btnPlayPause.innerHTML = '<i class="fa-solid fa-play"></i>';
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    
    currentTime = 0;
    activeSceneIndex = -1;
    timelineProgressSlider.value = 0;
    currentTimeLabel.textContent = "00:00";
    currentSceneIndicator.textContent = `SCENE 0 / ${timeline.length}`;
    
    // Stop audio
    stopSynthBGM();
    if (typeof speechSynthesis !== "undefined") {
      speechSynthesis.cancel();
    }
    
    renderCanvasFrame(0);
    updateActiveSubtitles(0);
  }

  function triggerPlaybackEnd() {
    pauseVideo();
    currentTime = totalDuration;
    timelineProgressSlider.value = Math.floor(totalDuration);
    currentTimeLabel.textContent = formatTime(totalDuration);
    
    if (isRecording) {
      stopRecordingExport();
    }
  }

  btnPlayPause.addEventListener("click", () => {
    if (isPlaying) {
      pauseVideo();
    } else {
      playVideo();
    }
  });

  btnStopPlayer.addEventListener("click", stopVideo);

  // Volume toggle
  btnVolumeToggle.addEventListener("click", () => {
    isMuted = !isMuted;
    if (isMuted) {
      btnVolumeToggle.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
      // Stop BGM and cancel voice
      stopSynthBGM();
      if (typeof speechSynthesis !== "undefined") {
        speechSynthesis.cancel();
      }
    } else {
      btnVolumeToggle.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      if (isPlaying) {
        startSynthBGM();
        const active = timeline.find(s => currentTime >= s.startTime && currentTime < s.endTime);
        if (active) {
          playSceneNarration(active);
        }
      }
    }
  });

  // Slider change seeking
  timelineProgressSlider.addEventListener("input", () => {
    currentTime = parseFloat(timelineProgressSlider.value);
    currentTimeLabel.textContent = formatTime(currentTime);
    
    // Redraw and trigger subtitle sync
    renderCanvasFrame(currentTime);
    updateActiveSubtitles(currentTime);
    
    // If speaking, restart voice for this seeked scene
    if (isPlaying) {
      const active = timeline.find(s => currentTime >= s.startTime && currentTime < s.endTime);
      if (active) {
        playSceneNarration(active);
      }
    }
  });

  // ==========================================
  // 10. SRT Subtitles File Downloader Exporter
  // ==========================================
  function generateSRTContent() {
    let srtText = "";
    
    timeline.forEach((scene, index) => {
      const startTimeStr = formatSRTTime(scene.startTime);
      const endTimeStr = formatSRTTime(scene.endTime);
      
      srtText += `${index + 1}\n`;
      srtText += `${startTimeStr} --> ${endTimeStr}\n`;
      srtText += `${scene.subtitle}\n\n`;
    });
    
    return srtText;
  }

  function formatSRTTime(totalSeconds) {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);
    const ms = Math.floor((totalSeconds % 1) * 1000);
    
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`;
  }

  btnExportSrt.addEventListener("click", () => {
    if (timeline.length === 0) return;
    const srtData = generateSRTContent();
    
    const blob = new Blob([srtData], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "compiled_subtitles.srt";
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  });

  // ==========================================
  // 11. MediaRecorder Video Export Capturer
  // ==========================================
  function startRecordingExport() {
    initAudioContext();
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    recordedChunks = [];
    isRecording = true;
    
    // Show banner
    recIndicatorBanner.style.display = "flex";
    btnExportVideo.disabled = true;
    btnCompileScript.disabled = true;
    btnGenerateAi.disabled = true;

    // Capture Canvas frame stream
    const canvasStream = videoCanvas.captureStream(30); // 30 fps capture
    
    // Combine with Mixed Synthesized Web Audio
    const mixedStream = new MediaStream();
    
    // Video Track
    canvasStream.getVideoTracks().forEach(track => mixedStream.addTrack(track));
    
    // Audio Track
    if (audioDestNode) {
      const audioStream = audioDestNode.stream;
      audioStream.getAudioTracks().forEach(track => mixedStream.addTrack(track));
    }
    
    // Initialize Recorder with fallback codecs
    let options = { mimeType: "video/webm;codecs=vp9,opus" };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: "video/webm;codecs=vp8,opus" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: "video/webm" };
      }
    }
    
    mediaRecorder = new MediaRecorder(mixedStream, options);
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      // Create final download package
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `compiled_ai_video_${videoThemeSelect.value}.webm`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      // Release states
      recIndicatorBanner.style.display = "none";
      btnExportVideo.disabled = false;
      btnCompileScript.disabled = false;
      btnGenerateAi.disabled = false;
      isRecording = false;
      
      alert("비디오 녹화 및 웹 인코딩 (.webm) 파일 변환이 성공적으로 완료되었습니다!");
    };
    
    // Reset video to beginning and play
    stopVideo();
    mediaRecorder.start();
    playVideo();
  }

  function stopRecordingExport() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  }

  btnExportVideo.addEventListener("click", () => {
    if (timeline.length === 0) return;
    
    const confirmRec = confirm("비디오 인코딩 내보내기를 시작합니다.\n내보내기는 실시간 재생 속도로 캡처 녹화가 진행됩니다.\n최종 재생 시까지 페이지를 닫거나 이동하지 말아주십시오.\n시작하시겠습니까?");
    if (confirmRec) {
      startRecordingExport();
    }
  });

});
