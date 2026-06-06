// e:\Antigravity\workspace\Cineaho\emoticon-maker\app.js

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const canvas = document.getElementById("editor-canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  
  // Tabs
  const tabDraw = document.getElementById("tab-draw");
  const tabPhoto = document.getElementById("tab-photo");
  const tabAi = document.getElementById("tab-ai");
  const drawTools = document.getElementById("draw-tools");
  const photoTools = document.getElementById("photo-tools");
  const aiTools = document.getElementById("ai-tools");
  
  // Draw controls
  const brushSizeInput = document.getElementById("brush-size");
  const brushSizeVal = document.getElementById("brush-size-val");
  const btnBrush = document.getElementById("btn-brush");
  const btnEraser = document.getElementById("btn-eraser");
  const btnClear = document.getElementById("btn-clear");
  const colorSwatches = document.querySelectorAll(".color-swatch");
  const colorPicker = document.getElementById("color-picker");
  
  // Photo controls
  const photoDropZone = document.getElementById("photo-drop-zone");
  const photoInput = document.getElementById("photo-input");
  const photoAdjusts = document.getElementById("photo-adjusts");
  const photoScaleSlider = document.getElementById("photo-scale");
  const photoRotationSlider = document.getElementById("photo-rotation");
  const btnRemovePhoto = document.getElementById("btn-remove-photo");
  
  // AI controls
  const aiPromptInput = document.getElementById("ai-prompt");
  const aiStyleSelect = document.getElementById("ai-style");
  const aiEmotionSelect = document.getElementById("ai-emotion");
  const btnGenerateAi = document.getElementById("btn-generate-ai");
  const aiLoadingDiv = document.getElementById("ai-loading");
  
  // Customization controls
  const textInput = document.getElementById("text-input");
  const textColorPicker = document.getElementById("text-color");
  const textStrokeColorPicker = document.getElementById("text-stroke-color");
  const textSizeSlider = document.getElementById("text-size");
  const textFontSelect = document.getElementById("text-font");
  const btnAddText = document.getElementById("btn-add-text");
  
  const bubbleInput = document.getElementById("bubble-input");
  const bubbleStyleSelect = document.getElementById("bubble-style");
  const bubbleBgColorPicker = document.getElementById("bubble-bg-color");
  const btnAddBubble = document.getElementById("btn-add-bubble");
  
  const stickerSwatches = document.querySelectorAll(".sticker-swatch");
  const stickerSizeSlider = document.getElementById("sticker-size");
  const btnAddSticker = document.getElementById("btn-add-sticker");
  
  // Execution controls
  const maskSquareBtn = document.getElementById("mask-square");
  const maskCircleBtn = document.getElementById("mask-circle");
  const stickerBorderCheckbox = document.getElementById("sticker-border");
  const filterSelect = document.getElementById("emoticon-filter");
  const btnGenerate = document.getElementById("btn-generate");
  
  // Preview & Export
  const previewImg = document.getElementById("emoticon-preview");
  const previewPlaceholder = document.getElementById("preview-placeholder");
  const previewActions = document.getElementById("preview-actions");
  const btnDownload = document.getElementById("btn-download");
  const btnSaveGallery = document.getElementById("btn-save-gallery");
  const galleryGrid = document.getElementById("gallery-grid");
  
  // Accordions
  const accordionHeaders = document.querySelectorAll(".accordion-header");

  // --- App State ---
  let activeTab = "draw"; // draw, photo
  let drawingMode = "brush"; // brush, eraser
  let brushColor = "#000000";
  let brushSize = 10;
  let isDrawing = false;
  
  // Base Layers
  let photoImg = null;
  let photoState = {
    x: 200,
    y: 200,
    scale: 1,
    rotation: 0 // degrees
  };
  
  // Drawing Canvas (offscreen canvas to persist drawings separately from photo)
  const drawCanvas = document.createElement("canvas");
  drawCanvas.width = canvas.width;
  drawCanvas.height = canvas.height;
  const drawCtx = drawCanvas.getContext("2d");
  
  // Overlays (Draggable layers)
  let overlays = [];
  let selectedOverlayIndex = -1;
  let isDraggingOverlay = false;
  let dragOffset = { x: 0, y: 0 };
  
  // Photo dragging
  let isDraggingPhoto = false;
  let dragStartPhoto = { x: 0, y: 0 };
  let photoOffset = { x: 0, y: 0 };
  
  // Output configuration
  let outputMask = "square"; // square, circle
  let generatedDataURL = null;
  
  // Selected sticker state
  let selectedSticker = "😎";

  // --- Toast Notification System ---
  function showToast(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 9999;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }
    
    const toast = document.createElement("div");
    toast.style.cssText = `
      background: rgba(17, 24, 39, 0.95);
      border: 1px solid ${type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"};
      border-left: 4px solid ${type === "success" ? "#10b981" : "#ef4444"};
      color: #fff;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      align-items: center;
      gap: 8px;
      pointer-events: auto;
    `;
    
    const icon = type === "success" 
      ? '<i class="fa-solid fa-circle-check" style="color: #10b981;"></i>' 
      : '<i class="fa-solid fa-triangle-exclamation" style="color: #ef4444;"></i>';
    toast.innerHTML = `${icon} <span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.transform = "translateY(0)";
      toast.style.opacity = "1";
    }, 10);
    
    setTimeout(() => {
      toast.style.transform = "translateY(-10px)";
      toast.style.opacity = "0";
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 2500);
  }

  // --- Accordion Controls Helper ---
  function openAccordionItem(index) {
    const items = document.querySelectorAll(".accordion-item");
    items.forEach((item, idx) => {
      if (idx === index) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }

  // --- WYSIWYG Real-time Update Helper ---
  function updateSelectedOverlayFromControls() {
    if (selectedOverlayIndex === -1) return;
    const ov = overlays[selectedOverlayIndex];
    if (ov.type === "text") {
      ov.text = textInput.value;
      ov.size = parseInt(textSizeSlider.value);
      ov.color = textColorPicker.value;
      ov.strokeColor = textStrokeColorPicker.value;
      ov.font = textFontSelect.value;
      
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.font = `bold ${ov.size}px ${ov.font}`;
      ov.width = tempCtx.measureText(ov.text).width + 20;
      ov.height = ov.size + 10;
    } else if (ov.type === "sticker") {
      ov.size = parseInt(stickerSizeSlider.value);
      ov.width = ov.size + 10;
      ov.height = ov.size + 10;
    } else if (ov.type === "bubble") {
      ov.text = bubbleInput.value;
      ov.bubbleStyle = bubbleStyleSelect.value;
      ov.bgColor = bubbleBgColorPicker.value;
    }
    redraw();
  }

  // Real-time update event listeners
  textInput.addEventListener("input", updateSelectedOverlayFromControls);
  textSizeSlider.addEventListener("input", updateSelectedOverlayFromControls);
  textColorPicker.addEventListener("input", updateSelectedOverlayFromControls);
  textStrokeColorPicker.addEventListener("input", updateSelectedOverlayFromControls);
  textFontSelect.addEventListener("change", updateSelectedOverlayFromControls);
  
  bubbleInput.addEventListener("input", updateSelectedOverlayFromControls);
  bubbleStyleSelect.addEventListener("change", updateSelectedOverlayFromControls);
  bubbleBgColorPicker.addEventListener("input", updateSelectedOverlayFromControls);
  
  stickerSizeSlider.addEventListener("input", updateSelectedOverlayFromControls);

  // --- Initialize App ---
  initCanvas();
  loadGallery();
  
  // --- Event Listeners: Tabs ---
  tabDraw.addEventListener("click", () => switchTab("draw"));
  tabPhoto.addEventListener("click", () => switchTab("photo"));
  tabAi.addEventListener("click", () => switchTab("ai"));
  
  function switchTab(tab) {
    activeTab = tab;
    // Reset active classes
    tabDraw.classList.remove("active");
    tabPhoto.classList.remove("active");
    tabAi.classList.remove("active");
    
    // Hide all tools
    drawTools.style.display = "none";
    photoTools.style.display = "none";
    aiTools.style.display = "none";
    
    // Hide hints
    document.querySelector(".draw-hint").style.display = "none";
    document.querySelector(".photo-hint").style.display = "none";
    document.querySelector(".ai-hint").style.display = "none";
    
    if (tab === "draw") {
      tabDraw.classList.add("active");
      drawTools.style.display = "flex";
      document.querySelector(".draw-hint").style.display = "inline";
    } else if (tab === "photo") {
      tabPhoto.classList.add("active");
      photoTools.style.display = "flex";
      document.querySelector(".photo-hint").style.display = "inline";
    } else if (tab === "ai") {
      tabAi.classList.add("active");
      aiTools.style.display = "flex";
      document.querySelector(".ai-hint").style.display = "inline";
    }
    redraw();
  }

  // --- Event Listeners: Drawing Tools ---
  btnBrush.classList.add("active");
  
  btnBrush.addEventListener("click", () => {
    drawingMode = "brush";
    btnBrush.classList.add("active");
    btnEraser.classList.remove("active");
  });
  
  btnEraser.addEventListener("click", () => {
    drawingMode = "eraser";
    btnEraser.classList.add("active");
    btnBrush.classList.remove("active");
  });
  
  btnClear.addEventListener("click", () => {
    if (confirm("그린 그림과 업로드한 사진, 데코레이션을 모두 초기화할까요?")) {
      clearAll();
    }
  });

  // Brush sizing
  brushSizeInput.addEventListener("input", (e) => {
    brushSize = parseInt(e.target.value);
    brushSizeVal.textContent = `${brushSize}px`;
  });

  // Color Swatches
  colorSwatches.forEach(swatch => {
    swatch.addEventListener("click", (e) => {
      colorSwatches.forEach(s => s.classList.remove("active"));
      e.target.classList.add("active");
      brushColor = e.target.dataset.color;
      colorPicker.value = brushColor;
      drawingMode = "brush";
      btnBrush.classList.add("active");
      btnEraser.classList.remove("active");
    });
  });

  colorPicker.addEventListener("input", (e) => {
    colorSwatches.forEach(s => s.classList.remove("active"));
    brushColor = e.target.value;
    drawingMode = "brush";
    btnBrush.classList.add("active");
    btnEraser.classList.remove("active");
  });

  // --- Accordion Logic ---
  accordionHeaders.forEach(header => {
    header.addEventListener("click", () => {
      const item = header.parentElement;
      const isActive = item.classList.contains("active");
      
      // Close all
      document.querySelectorAll(".accordion-item").forEach(i => i.classList.remove("active"));
      
      // Toggle
      if (!isActive) {
        item.classList.add("active");
      }
    });
  });

  // --- Drawing Logic on Canvas ---
  function initCanvas() {
    // Fill base with transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    
    // Mouse Events
    canvas.addEventListener("mousedown", handleStart);
    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseup", handleEnd);
    canvas.addEventListener("mouseleave", handleEnd);
    
    // Touch Events
    canvas.addEventListener("touchstart", handleStart, { passive: false });
    canvas.addEventListener("touchmove", handleMove, { passive: false });
    canvas.addEventListener("touchend", handleEnd);
    
    // Zoom/Scale image with wheel
    canvas.addEventListener("wheel", (e) => {
      if (activeTab === "photo" && photoImg) {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
        photoState.scale = Math.max(0.1, Math.min(3, photoState.scale * zoomFactor));
        photoScaleSlider.value = photoState.scale;
        redraw();
      }
    }, { passive: false });
  }

  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function handleStart(e) {
    e.preventDefault();
    const pos = getMousePos(e);
    
    // 0. Check if clicked the active overlay's delete button (red "x" circle)
    if (selectedOverlayIndex !== -1) {
      const ov = overlays[selectedOverlayIndex];
      const deleteX = ov.x + ov.width / 2 + 8;
      const deleteY = ov.y - ov.height / 2 - 8;
      const dist = Math.sqrt((pos.x - deleteX) ** 2 + (pos.y - deleteY) ** 2);
      if (dist <= 16) {
        overlays.splice(selectedOverlayIndex, 1);
        selectedOverlayIndex = -1;
        redraw();
        return;
      }
    }
    
    // 1. Check if clicked an overlay first (reverse loop to get top-most first)
    let clickedOverlay = false;
    for (let i = overlays.length - 1; i >= 0; i--) {
      const ov = overlays[i];
      // Basic bounding box check
      if (pos.x >= ov.x - ov.width / 2 && pos.x <= ov.x + ov.width / 2 &&
          pos.y >= ov.y - ov.height / 2 && pos.y <= ov.y + ov.height / 2) {
        selectedOverlayIndex = i;
        isDraggingOverlay = true;
        dragOffset.x = pos.x - ov.x;
        dragOffset.y = pos.y - ov.y;
        clickedOverlay = true;
        break;
      }
    }
    
    if (clickedOverlay) {
      const ov = overlays[selectedOverlayIndex];
      if (ov.type === "text") {
        openAccordionItem(0); // Text accordion
        textInput.value = ov.text;
        textColorPicker.value = ov.color;
        textStrokeColorPicker.value = ov.strokeColor;
        textSizeSlider.value = ov.size;
        textFontSelect.value = ov.font;
      } else if (ov.type === "bubble") {
        openAccordionItem(1); // Bubble accordion
        bubbleInput.value = ov.text;
        bubbleStyleSelect.value = ov.bubbleStyle;
        bubbleBgColorPicker.value = ov.bgColor;
      } else if (ov.type === "sticker") {
        openAccordionItem(2); // Sticker accordion
        stickerSizeSlider.value = ov.size;
        stickerSwatches.forEach(swatch => {
          if (swatch.dataset.sticker === ov.text) {
            stickerSwatches.forEach(s => s.classList.remove("active"));
            swatch.classList.add("active");
            selectedSticker = ov.text;
          }
        });
      }
      redraw();
      return;
    }
    
    // Deselect overlays if clicked blank space
    selectedOverlayIndex = -1;
    
    // 2. Tab-specific actions
    if (activeTab === "photo" && photoImg) {
      // Check click hits photo boundary (simplified to circle/bounding check)
      isDraggingPhoto = true;
      dragStartPhoto.x = pos.x;
      dragStartPhoto.y = pos.y;
      photoOffset.x = photoState.x;
      photoOffset.y = photoState.y;
    } else if (activeTab === "draw") {
      isDrawing = true;
      drawCtx.beginPath();
      drawCtx.moveTo(pos.x, pos.y);
      
      // Configure brush
      if (drawingMode === "brush") {
        drawCtx.globalCompositeOperation = "source-over";
        drawCtx.strokeStyle = brushColor;
        drawCtx.lineWidth = brushSize;
        drawCtx.lineCap = "round";
        drawCtx.lineJoin = "round";
      } else {
        drawCtx.globalCompositeOperation = "destination-out";
        drawCtx.lineWidth = brushSize;
        drawCtx.lineCap = "round";
        drawCtx.lineJoin = "round";
      }
      
      // Draw single dot on click
      drawCtx.lineTo(pos.x, pos.y);
      drawCtx.stroke();
      redraw();
    }
  }

  function handleMove(e) {
    if (!isDrawing && !isDraggingOverlay && !isDraggingPhoto) return;
    e.preventDefault();
    const pos = getMousePos(e);
    
    if (isDraggingOverlay && selectedOverlayIndex !== -1) {
      overlays[selectedOverlayIndex].x = pos.x - dragOffset.x;
      overlays[selectedOverlayIndex].y = pos.y - dragOffset.y;
      redraw();
    } else if (isDraggingPhoto) {
      const dx = pos.x - dragStartPhoto.x;
      const dy = pos.y - dragStartPhoto.y;
      photoState.x = photoOffset.x + dx;
      photoState.y = photoOffset.y + dy;
      redraw();
    } else if (isDrawing) {
      drawCtx.lineTo(pos.x, pos.y);
      drawCtx.stroke();
      redraw();
    }
  }

  function handleEnd() {
    isDrawing = false;
    isDraggingOverlay = false;
    isDraggingPhoto = false;
  }

  // --- Rendering Pipeline ---
  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Layer 1: Photo
    if (photoImg) {
      ctx.save();
      ctx.translate(photoState.x, photoState.y);
      ctx.rotate((photoState.rotation * Math.PI) / 180);
      ctx.scale(photoState.scale, photoState.scale);
      
      // Draw centered
      ctx.drawImage(photoImg, -photoImg.width / 2, -photoImg.height / 2);
      ctx.restore();
    }
    
    // Layer 2: Hand-drawn lines (from offscreen canvas)
    ctx.drawImage(drawCanvas, 0, 0);
    
    // Layer 3: Overlays
    overlays.forEach((ov, idx) => {
      ctx.save();
      ctx.translate(ov.x, ov.y);
      
      // Draw focus border if selected
      if (idx === selectedOverlayIndex) {
        ctx.strokeStyle = "rgba(56, 189, 248, 0.8)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(-ov.width / 2 - 8, -ov.height / 2 - 8, ov.width + 16, ov.height + 16);
        
        // Render helper delete indicator (tiny X icon at top-right of box)
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(ov.width / 2 + 8, -ov.height / 2 - 8, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("x", ov.width / 2 + 8, -ov.height / 2 - 8);
      }
      
      // Render overlay elements
      if (ov.type === "text") {
        ctx.font = `bold ${ov.size}px ${ov.font}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Outline text first (sticker look)
        ctx.strokeStyle = ov.strokeColor;
        ctx.lineWidth = ov.size / 6; // proportional outline thickness
        ctx.lineJoin = "round";
        ctx.strokeText(ov.text, 0, 0);
        
        // Fill text
        ctx.fillStyle = ov.color;
        ctx.fillText(ov.text, 0, 0);
      } 
      else if (ov.type === "sticker") {
        ctx.font = `${ov.size}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(ov.text, 0, 0);
      } 
      else if (ov.type === "bubble") {
        drawSpeechBubble(ctx, ov);
      }
      
      ctx.restore();
    });
  }

  function drawSpeechBubble(targetCtx, ov) {
    const text = ov.text;
    targetCtx.font = "bold 13px 'Noto Sans KR', sans-serif";
    targetCtx.textAlign = "center";
    targetCtx.textBaseline = "middle";
    
    const textWidth = targetCtx.measureText(text).width;
    const w = Math.max(80, textWidth + 24);
    const h = 40;
    
    // Bubble contour path
    targetCtx.fillStyle = ov.bgColor;
    targetCtx.strokeStyle = "#000000";
    targetCtx.lineWidth = 3;
    targetCtx.lineJoin = "round";
    
    targetCtx.beginPath();
    
    if (ov.bubbleStyle === "rounded" || ov.bubbleStyle === "oval") {
      const rx = w / 2;
      const ry = h / 2;
      targetCtx.ellipse(0, -5, rx, ry, 0, 0, 2 * Math.PI);
      targetCtx.fill();
      targetCtx.stroke();
      
      // Pointer tail
      targetCtx.fillStyle = ov.bgColor;
      targetCtx.beginPath();
      targetCtx.moveTo(-10, ry - 5);
      targetCtx.lineTo(-15, ry + 12);
      targetCtx.lineTo(5, ry - 5);
      targetCtx.closePath();
      targetCtx.fill();
      
      targetCtx.beginPath();
      targetCtx.moveTo(-10, ry - 5);
      targetCtx.lineTo(-15, ry + 12);
      targetCtx.lineTo(5, ry - 5);
      targetCtx.stroke();
    } 
    else if (ov.bubbleStyle === "shout") {
      // Spiky bubble
      const sp = 8; // spiky count
      const rx = w / 2;
      const ry = h / 2;
      for (let i = 0; i < sp * 2; i++) {
        const angle = (i * Math.PI) / sp;
        const dist = i % 2 === 0 ? rx : rx - 10;
        const xCoord = dist * Math.cos(angle);
        const yCoord = dist * Math.sin(angle) - 5;
        if (i === 0) targetCtx.moveTo(xCoord, yCoord);
        else targetCtx.lineTo(xCoord, yCoord);
      }
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.stroke();
    }
    else if (ov.bubbleStyle === "thought") {
      // Thinking clouds
      const rx = w / 2;
      const ry = h / 2;
      targetCtx.ellipse(0, -5, rx, ry, 0, 0, 2 * Math.PI);
      targetCtx.fill();
      targetCtx.stroke();
      
      // Draw tiny circles as cloud tail
      targetCtx.beginPath();
      targetCtx.arc(-15, ry + 5, 6, 0, 2 * Math.PI);
      targetCtx.fill();
      targetCtx.stroke();
      
      targetCtx.beginPath();
      targetCtx.arc(-22, ry + 14, 4, 0, 2 * Math.PI);
      targetCtx.fill();
      targetCtx.stroke();
    }
    
    // Draw bubble text
    targetCtx.fillStyle = "#000000";
    targetCtx.fillText(text, 0, -5);
    
    // Set width and height dynamically based on rendering for dragging hits
    ov.width = w;
    ov.height = h + 15;
  }

  // Double click or custom listener to delete overlays
  canvas.addEventListener("dblclick", (e) => {
    const pos = getMousePos(e);
    // Find overlay and delete it
    for (let i = overlays.length - 1; i >= 0; i--) {
      const ov = overlays[i];
      if (pos.x >= ov.x - ov.width / 2 && pos.x <= ov.x + ov.width / 2 &&
          pos.y >= ov.y - ov.height / 2 && pos.y <= ov.y + ov.height / 2) {
        
        // Check if double click is in the delete circle corner specifically or just generally dblclick
        overlays.splice(i, 1);
        selectedOverlayIndex = -1;
        redraw();
        break;
      }
    }
  });

  // --- Photo Upload Logic ---
  photoDropZone.addEventListener("click", () => photoInput.click());
  
  photoDropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    photoDropZone.classList.add("dragover");
  });

  photoDropZone.addEventListener("dragleave", () => {
    photoDropZone.classList.remove("dragover");
  });

  photoDropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    photoDropZone.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      loadImage(file);
    }
  });

  photoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) loadImage(file);
  });

  function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        photoImg = img;
        // Reset scale and translation
        photoState.x = canvas.width / 2;
        photoState.y = canvas.height / 2;
        
        // Compute fits scale
        const scaleX = canvas.width / img.width;
        const scaleY = canvas.height / img.height;
        photoState.scale = Math.min(0.8, Math.min(scaleX, scaleY));
        photoState.rotation = 0;
        
        // Update sliders
        photoScaleSlider.value = photoState.scale;
        photoRotationSlider.value = 0;
        
        // Show controls
        photoDropZone.style.display = "none";
        photoAdjusts.style.display = "block";
        redraw();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Remove Photo
  btnRemovePhoto.addEventListener("click", () => {
    photoImg = null;
    photoDropZone.style.display = "flex";
    photoAdjusts.style.display = "none";
    redraw();
  });

  // Photo sliders
  photoScaleSlider.addEventListener("input", (e) => {
    if (photoImg) {
      photoState.scale = parseFloat(e.target.value);
      redraw();
    }
  });

  photoRotationSlider.addEventListener("input", (e) => {
    if (photoImg) {
      photoState.rotation = parseInt(e.target.value);
      redraw();
    }
  });

  // --- Add Custom Overlay Elements ---
  
  // Add Text Layer
  btnAddText.addEventListener("click", () => {
    const textVal = textInput.value.trim();
    if (!textVal) return;
    
    // Compute dimensions based on length and size
    const size = parseInt(textSizeSlider.value);
    const font = textFontSelect.value;
    
    // Draw text offscreen to get width
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.font = `bold ${size}px ${font}`;
    const textWidth = tempCtx.measureText(textVal).width;
    
    const newOverlay = {
      type: "text",
      text: textVal,
      color: textColorPicker.value,
      strokeColor: textStrokeColorPicker.value,
      size: size,
      font: font,
      x: canvas.width / 2,
      y: canvas.height / 2,
      width: textWidth + 20,
      height: size + 10
    };
    
    overlays.push(newOverlay);
    selectedOverlayIndex = overlays.length - 1;
    textInput.value = "";
    redraw();
  });

  // Add Speech Bubble Layer
  btnAddBubble.addEventListener("click", () => {
    const textVal = bubbleInput.value.trim();
    if (!textVal) return;
    
    const newOverlay = {
      type: "bubble",
      text: textVal,
      bubbleStyle: bubbleStyleSelect.value,
      bgColor: bubbleBgColorPicker.value,
      x: canvas.width / 2,
      y: canvas.height / 3, // slightly higher
      width: 100, // resolved dynamically
      height: 50  // resolved dynamically
    };
    
    overlays.push(newOverlay);
    selectedOverlayIndex = overlays.length - 1;
    bubbleInput.value = "";
    redraw();
  });

  // Sticker Selector
  stickerSwatches.forEach(swatch => {
    swatch.addEventListener("click", (e) => {
      stickerSwatches.forEach(s => s.classList.remove("active"));
      e.target.classList.add("active");
      selectedSticker = e.target.dataset.sticker;
      
      // If a sticker overlay is selected, update it in real-time
      if (selectedOverlayIndex !== -1 && overlays[selectedOverlayIndex].type === "sticker") {
        overlays[selectedOverlayIndex].text = selectedSticker;
        redraw();
      }
    });
  });

  btnAddSticker.addEventListener("click", () => {
    const size = parseInt(stickerSizeSlider.value);
    const newOverlay = {
      type: "sticker",
      text: selectedSticker,
      size: size,
      x: canvas.width / 2,
      y: canvas.height / 2,
      width: size + 10,
      height: size + 10
    };
    
    overlays.push(newOverlay);
    selectedOverlayIndex = overlays.length - 1;
    redraw();
  });

  // Mask Toggles
  maskSquareBtn.addEventListener("click", () => {
    outputMask = "square";
    maskSquareBtn.classList.add("active");
    maskCircleBtn.classList.remove("active");
  });
  
  maskCircleBtn.addEventListener("click", () => {
    outputMask = "circle";
    maskCircleBtn.classList.add("active");
    maskSquareBtn.classList.remove("active");
  });

  // --- Clear Canvas API ---
  function clearAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    photoImg = null;
    overlays = [];
    selectedOverlayIndex = -1;
    
    photoDropZone.style.display = "flex";
    photoAdjusts.style.display = "none";
    
    redraw();
  }

  // --- Emoticon Execution and Image Processing Filters ---
  btnGenerate.addEventListener("click", () => {
    // Generate high resolution emoticon
    const size = 512;
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = size;
    outputCanvas.height = size;
    const outCtx = outputCanvas.getContext("2d", { willReadFrequently: true });
    
    // Scale editor canvas content to output canvas size
    const scale = size / canvas.width;
    
    // Draw content with outlines and filters
    renderFinalEmoticon(outCtx, size, scale);
    
    // Apply filters
    const filter = filterSelect.value;
    applyImageFilters(outCtx, size, filter);
    
    // Apply circle mask if enabled
    if (outputMask === "circle") {
      applyCircleMask(outCtx, size);
    }
    
    // Set preview
    generatedDataURL = outputCanvas.toDataURL("image/png");
    previewImg.src = generatedDataURL;
    previewImg.style.display = "block";
    previewPlaceholder.style.display = "none";
    previewActions.style.display = "grid";
    
    // Scroll to preview
    previewImg.scrollIntoView({ behavior: "smooth" });
  });

  function renderFinalEmoticon(targetCtx, size, scale) {
    targetCtx.clearRect(0, 0, size, size);
    
    // Create silhouette for sticker white outline
    const addStickerBorder = stickerBorderCheckbox.checked;
    
    if (addStickerBorder) {
      // 1. Render all contents on an offscreen canvas to extract alpha channel
      const silCanvas = document.createElement("canvas");
      silCanvas.width = size;
      silCanvas.height = size;
      const silCtx = silCanvas.getContext("2d");
      
      drawCanvasContentToTarget(silCtx, scale);
      
      // 2. Create the white mask canvas once outside the offset loop for peak performance
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = size;
      maskCanvas.height = size;
      const maskCtx = maskCanvas.getContext("2d");
      
      maskCtx.drawImage(silCanvas, 0, 0);
      maskCtx.globalCompositeOperation = "source-in";
      maskCtx.fillStyle = "#ffffff";
      maskCtx.fillRect(0, 0, size, size);
      
      // 3. Draw white shadow silhouette offset in multiple angles to create outline
      targetCtx.save();
      const outlineThickness = 8; // px
      const steps = 36;
      targetCtx.shadowColor = "rgba(0, 0, 0, 0.15)";
      targetCtx.shadowBlur = 6;
      
      for (let i = 0; i < steps; i++) {
        const angle = (i * 2 * Math.PI) / steps;
        const dx = outlineThickness * Math.cos(angle);
        const dy = outlineThickness * Math.sin(angle);
        
        targetCtx.drawImage(maskCanvas, dx, dy);
      }
      targetCtx.restore();
    }
    
    // Draw the main contents on top of the border outline
    drawCanvasContentToTarget(targetCtx, scale);
  }

  function drawCanvasContentToTarget(targetCtx, scale) {
    targetCtx.save();
    targetCtx.scale(scale, scale);
    
    // Layer 1: Photo
    if (photoImg) {
      targetCtx.save();
      targetCtx.translate(photoState.x, photoState.y);
      targetCtx.rotate((photoState.rotation * Math.PI) / 180);
      targetCtx.scale(photoState.scale, photoState.scale);
      targetCtx.drawImage(photoImg, -photoImg.width / 2, -photoImg.height / 2);
      targetCtx.restore();
    }
    
    // Layer 2: Drawings
    targetCtx.drawImage(drawCanvas, 0, 0);
    
    // Layer 3: Overlays (without highlight borders)
    overlays.forEach(ov => {
      targetCtx.save();
      targetCtx.translate(ov.x, ov.y);
      
      if (ov.type === "text") {
        targetCtx.font = `bold ${ov.size}px ${ov.font}`;
        targetCtx.textAlign = "center";
        targetCtx.textBaseline = "middle";
        targetCtx.strokeStyle = ov.strokeColor;
        targetCtx.lineWidth = ov.size / 6;
        targetCtx.lineJoin = "round";
        targetCtx.strokeText(ov.text, 0, 0);
        targetCtx.fillStyle = ov.color;
        targetCtx.fillText(ov.text, 0, 0);
      } 
      else if (ov.type === "sticker") {
        targetCtx.font = `${ov.size}px sans-serif`;
        targetCtx.textAlign = "center";
        targetCtx.textBaseline = "middle";
        targetCtx.fillText(ov.text, 0, 0);
      } 
      else if (ov.type === "bubble") {
        drawSpeechBubble(targetCtx, ov);
      }
      targetCtx.restore();
    });
    
    targetCtx.restore();
  }

  // --- Pixel Filters ---
  function applyImageFilters(targetCtx, size, filter) {
    if (filter === "none") return;
    
    const imgData = targetCtx.getImageData(0, 0, size, size);
    const data = imgData.data;
    
    if (filter === "cartoon") {
      // Cel Shading: Enhance colors and quantize
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue; // skip transparent
        
        // Quantize colors to 4 levels
        data[i] = Math.round(data[i] / 64) * 64;     // Red
        data[i + 1] = Math.round(data[i + 1] / 64) * 64; // Green
        data[i + 2] = Math.round(data[i + 2] / 64) * 64; // Blue
        
        // Increase saturation
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;
        if (d > 10) {
          data[i] = Math.min(255, r + 20);
          data[i + 1] = Math.min(255, g + 20);
          data[i + 2] = Math.min(255, b + 20);
        }
      }
      targetCtx.putImageData(imgData, 0, 0);
    } 
    else if (filter === "pixel") {
      // Scale down and scale up to pixelate
      const pCanvas = document.createElement("canvas");
      pCanvas.width = 64;
      pCanvas.height = 64;
      const pCtx = pCanvas.getContext("2d");
      
      // Draw small
      pCtx.drawImage(targetCtx.canvas, 0, 0, 64, 64);
      
      // Draw big back
      targetCtx.clearRect(0, 0, size, size);
      targetCtx.imageSmoothingEnabled = false;
      targetCtx.drawImage(pCanvas, 0, 0, size, size);
      targetCtx.imageSmoothingEnabled = true;
    } 
    else if (filter === "sketch") {
      // Grayscale sketch look
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // Thresholding for pencil line sketch
        const val = gray < 120 ? 40 : 240;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      }
      targetCtx.putImageData(imgData, 0, 0);
    }
    else if (filter === "neon") {
      // Neon Glow: Inverse dark colors and make active colors glow
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        
        if (luminance < 100) {
          // Make dark background purple-neon
          data[i] = 15;
          data[i + 1] = 0;
          data[i + 2] = 40;
        } else {
          // Bright colors glow cyan/neon green
          data[i] = Math.max(r, 80);
          data[i + 1] = 255;
          data[i + 2] = Math.max(b, 200);
        }
      }
      targetCtx.putImageData(imgData, 0, 0);
    }
    else if (filter === "outline") {
      // Edge Enhancement (Simplified Sobel/Outline)
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue;
        // Simple pixel difference outline
        const idx = i;
        const rightIdx = i + 4;
        const downIdx = i + size * 4;
        if (rightIdx < data.length && downIdx < data.length) {
          const l1 = data[idx], l2 = data[rightIdx], l3 = data[downIdx];
          const diff = Math.abs(l1 - l2) + Math.abs(l1 - l3);
          if (diff > 50) {
            // Draw black stroke line
            data[idx] = 0;
            data[idx + 1] = 0;
            data[idx + 2] = 0;
          }
        }
      }
      targetCtx.putImageData(imgData, 0, 0);
    }
  }

  function applyCircleMask(targetCtx, size) {
    // Cut canvas into circle
    targetCtx.globalCompositeOperation = "destination-in";
    targetCtx.beginPath();
    targetCtx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
    targetCtx.fill();
    targetCtx.globalCompositeOperation = "source-over";
  }

  // --- Export Actions ---
  btnDownload.addEventListener("click", () => {
    if (!generatedDataURL) return;
    const link = document.createElement("a");
    link.href = generatedDataURL;
    link.download = `emoticon-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  btnSaveGallery.addEventListener("click", () => {
    if (!generatedDataURL) return;
    
    // Load existing
    let gallery = [];
    try {
      const stored = localStorage.getItem("cineaho_saved_emoticons");
      if (stored) {
        gallery = JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    
    // Add new
    gallery.unshift(generatedDataURL); // Add to top
    
    // Cap at 12 items for storage space
    if (gallery.length > 12) {
      gallery.pop();
    }
    
    try {
      localStorage.setItem("cineaho_saved_emoticons", JSON.stringify(gallery));
      loadGallery();
      showToast("보관함에 성공적으로 저장되었습니다!");
    } catch (err) {
      showToast("저장 용량 초과! 기존 이모티콘을 삭제해 주세요.", "error");
    }
  });

  // --- Local Gallery Manager ---
  function loadGallery() {
    galleryGrid.innerHTML = "";
    let gallery = [];
    try {
      const stored = localStorage.getItem("cineaho_saved_emoticons");
      if (stored) {
        gallery = JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    
    if (gallery.length === 0) {
      galleryGrid.innerHTML = `<div class="gallery-empty">보관함이 비어있습니다.</div>`;
      return;
    }
    
    gallery.forEach((dataURL, idx) => {
      const item = document.createElement("div");
      item.className = "gallery-item";
      
      const img = document.createElement("img");
      img.src = dataURL;
      img.alt = `보관된 이모티콘 ${idx + 1}`;
      
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "gallery-item-delete";
      deleteBtn.innerHTML = `<i class="fa-solid fa-times"></i>`;
      deleteBtn.title = "이모티콘 삭제";
      
      // Download on click of image
      img.addEventListener("click", () => {
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = `my-emoticon-${idx + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
      
      // Delete on click of delete button
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm("이 이모티콘을 보관함에서 영구적으로 삭제할까요?")) {
          deleteFromGallery(idx);
        }
      });
      
      item.appendChild(img);
      item.appendChild(deleteBtn);
      galleryGrid.appendChild(item);
    });
  }

  function deleteFromGallery(idx) {
    let gallery = [];
    try {
      const stored = localStorage.getItem("cineaho_saved_emoticons");
      if (stored) {
        gallery = JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    
    gallery.splice(idx, 1);
    localStorage.setItem("cineaho_saved_emoticons", JSON.stringify(gallery));
    loadGallery();
  }

  // --- AI Emoticon Generation Logic ---
  if (btnGenerateAi) {
    btnGenerateAi.addEventListener("click", () => {
      const prompt = aiPromptInput.value.trim().toLowerCase();
      if (!prompt) {
        showToast("AI 이모티콘을 생성하려면 프롬프트를 입력하세요!", "error");
        return;
      }
      
      btnGenerateAi.style.display = "none";
      aiLoadingDiv.style.display = "block";
      
      // Auto-parse emotion from prompt
      let emotion = aiEmotionSelect.value;
      if (prompt.includes("신난") || prompt.includes("기쁜") || prompt.includes("기쁨") || prompt.includes("신남") || prompt.includes("happy") || prompt.includes("smile") || prompt.includes("😊")) {
        emotion = "happy";
      } else if (prompt.includes("슬픈") || prompt.includes("슬픔") || prompt.includes("눈물") || prompt.includes("우는") || prompt.includes("sad") || prompt.includes("cry") || prompt.includes("😭")) {
        emotion = "sad";
      } else if (prompt.includes("화난") || prompt.includes("분노") || prompt.includes("angry") || prompt.includes("mad") || prompt.includes("💢")) {
        emotion = "angry";
      } else if (prompt.includes("사랑") || prompt.includes("하트") || prompt.includes("love") || prompt.includes("heart") || prompt.includes("😍")) {
        emotion = "love";
      } else if (prompt.includes("놀란") || prompt.includes("놀람") || prompt.includes("surprised") || prompt.includes("shocked") || prompt.includes("😲")) {
        emotion = "surprised";
      } else if (prompt.includes("졸린") || prompt.includes("피곤") || prompt.includes("잠") || prompt.includes("sleepy") || prompt.includes("tired") || prompt.includes("😴")) {
        emotion = "sleepy";
      }
      aiEmotionSelect.value = emotion;

      // Auto-parse style from prompt
      let style = aiStyleSelect.value;
      if (prompt.includes("3d") || prompt.includes("러블리")) {
        style = "cute-3d";
      } else if (prompt.includes("픽셀") || prompt.includes("pixel") || prompt.includes("레트로")) {
        style = "pixel";
      } else if (prompt.includes("벡터") || prompt.includes("vector") || prompt.includes("2d")) {
        style = "vector";
      } else if (prompt.includes("카툰") || prompt.includes("cartoon") || prompt.includes("만화")) {
        style = "cartoon";
      }
      aiStyleSelect.value = style;
      
      setTimeout(() => {
        generateAIEmoticon(prompt, style, emotion);
        
        aiLoadingDiv.style.display = "none";
        btnGenerateAi.style.display = "block";
        
        showToast("AI가 이모티콘 캐릭터를 그렸습니다!");
      }, 1500);
    });
  }

  function generateAIEmoticon(promptText, style, emotion) {
    // Determine character type from prompt keywords
    let character = "bear"; // default
    const text = promptText.toLowerCase();
    if (text.includes("고양이") || text.includes("cat") || text.includes("야옹")) {
      character = "cat";
    } else if (text.includes("토끼") || text.includes("rabbit") || text.includes("bunny")) {
      character = "rabbit";
    } else if (text.includes("개구리") || text.includes("frog")) {
      character = "frog";
    } else if (text.includes("강아지") || text.includes("dog") || text.includes("개")) {
      character = "dog";
    } else if (text.includes("판다") || text.includes("panda")) {
      character = "panda";
    } else if (text.includes("사자") || text.includes("lion")) {
      character = "lion";
    } else if (text.includes("호랑이") || text.includes("tiger")) {
      character = "tiger";
    } else if (text.includes("병아리") || text.includes("chick")) {
      character = "chick";
    } else if (text.includes("돼지") || text.includes("pig")) {
      character = "pig";
    } else if (text.includes("곰") || text.includes("bear")) {
      character = "bear";
    }
    
    // Clear drawing canvas
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    
    // Set up style colors
    let primaryColor = "#fcd34d"; // yellow for bear
    let secondaryColor = "#fbbf24";
    if (character === "cat") {
      primaryColor = "#e5e7eb"; // light gray
      secondaryColor = "#d1d5db";
    } else if (character === "rabbit") {
      primaryColor = "#fbcfe8"; // pink
      secondaryColor = "#f472b6";
    } else if (character === "frog") {
      primaryColor = "#86efac"; // green
      secondaryColor = "#4ade80";
    } else if (character === "dog") {
      primaryColor = "#fdba74"; // orange-brown
      secondaryColor = "#f97316";
    } else if (character === "panda") {
      primaryColor = "#ffffff"; // white/black
      secondaryColor = "#1f2937";
    } else if (character === "lion") {
      primaryColor = "#fef08a"; // bright yellow face
      secondaryColor = "#f97316"; // orange mane
    } else if (character === "tiger") {
      primaryColor = "#f97316"; // orange face
      secondaryColor = "#ea580c"; // darker orange
    } else if (character === "chick") {
      primaryColor = "#fef08a"; // bright yellow face
      secondaryColor = "#facc15"; // darker yellow
    } else if (character === "pig") {
      primaryColor = "#ffd6e8"; // light pink
      secondaryColor = "#fbcfe8"; // pink
    }
    
    const cx = drawCanvas.width / 2;
    const cy = drawCanvas.height / 2;
    
    drawCtx.save();
    
    // Draw Lion Mane (before face contour and ears)
    if (character === "lion") {
      drawCtx.fillStyle = secondaryColor; // orange mane
      for (let a = 0; a < 2 * Math.PI; a += Math.PI / 6) {
        const mx = cx + 105 * Math.cos(a);
        const my = cy + 105 * Math.sin(a);
        drawCtx.beginPath();
        drawCtx.arc(mx, my, 40, 0, 2 * Math.PI);
        drawCtx.fill();
        drawCtx.strokeStyle = "#111827";
        drawCtx.lineWidth = 6;
        drawCtx.stroke();
      }
    }
    
    // Draw Ears
    if (character === "cat") {
      // Left ear
      drawCtx.fillStyle = secondaryColor;
      drawCtx.beginPath();
      drawCtx.moveTo(cx - 90, cy - 70);
      drawCtx.lineTo(cx - 130, cy - 140);
      drawCtx.lineTo(cx - 50, cy - 100);
      drawCtx.closePath();
      drawCtx.fill();
      drawCtx.strokeStyle = "#111827";
      drawCtx.lineWidth = 6;
      drawCtx.stroke();
      // Inner ear
      drawCtx.fillStyle = "#f472b6";
      drawCtx.beginPath();
      drawCtx.moveTo(cx - 85, cy - 80);
      drawCtx.lineTo(cx - 115, cy - 125);
      drawCtx.lineTo(cx - 65, cy - 98);
      drawCtx.closePath();
      drawCtx.fill();
      
      // Right ear
      drawCtx.fillStyle = secondaryColor;
      drawCtx.beginPath();
      drawCtx.moveTo(cx + 90, cy - 70);
      drawCtx.lineTo(cx + 130, cy - 140);
      drawCtx.lineTo(cx + 50, cy - 100);
      drawCtx.closePath();
      drawCtx.fill();
      drawCtx.strokeStyle = "#111827";
      drawCtx.lineWidth = 6;
      drawCtx.stroke();
      // Inner ear
      drawCtx.fillStyle = "#f472b6";
      drawCtx.beginPath();
      drawCtx.moveTo(cx + 85, cy - 80);
      drawCtx.lineTo(cx + 115, cy - 125);
      drawCtx.lineTo(cx + 65, cy - 98);
      drawCtx.closePath();
      drawCtx.fill();
    } else if (character === "rabbit") {
      // Long ears
      drawCtx.fillStyle = primaryColor;
      // Left ear
      drawCtx.beginPath();
      drawCtx.ellipse(cx - 50, cy - 130, 20, 70, -Math.PI/12, 0, 2*Math.PI);
      drawCtx.fill();
      drawCtx.strokeStyle = "#111827";
      drawCtx.lineWidth = 6;
      drawCtx.stroke();
      drawCtx.fillStyle = "#f472b6";
      drawCtx.beginPath();
      drawCtx.ellipse(cx - 50, cy - 130, 10, 50, -Math.PI/12, 0, 2*Math.PI);
      drawCtx.fill();
      
      // Right ear
      drawCtx.fillStyle = primaryColor;
      drawCtx.beginPath();
      drawCtx.ellipse(cx + 50, cy - 130, 20, 70, Math.PI/12, 0, 2*Math.PI);
      drawCtx.fill();
      drawCtx.strokeStyle = "#111827";
      drawCtx.lineWidth = 6;
      drawCtx.stroke();
      drawCtx.fillStyle = "#f472b6";
      drawCtx.beginPath();
      drawCtx.ellipse(cx + 50, cy - 130, 10, 50, Math.PI/12, 0, 2*Math.PI);
      drawCtx.fill();
    } else if (character === "bear" || character === "panda" || character === "dog" || character === "lion" || character === "tiger") {
      // Round ears
      drawCtx.fillStyle = character === "panda" ? "#1f2937" : secondaryColor;
      // Left ear
      drawCtx.beginPath();
      drawCtx.arc(cx - 80, cy - 90, 30, 0, 2*Math.PI);
      drawCtx.fill();
      drawCtx.strokeStyle = "#111827";
      drawCtx.lineWidth = 6;
      drawCtx.stroke();
      drawCtx.fillStyle = character === "panda" ? "#374151" : "#f472b6";
      drawCtx.beginPath();
      drawCtx.arc(cx - 80, cy - 90, 15, 0, 2*Math.PI);
      drawCtx.fill();
      
      // Right ear
      drawCtx.fillStyle = character === "panda" ? "#1f2937" : secondaryColor;
      drawCtx.beginPath();
      drawCtx.arc(cx + 80, cy - 90, 30, 0, 2*Math.PI);
      drawCtx.fill();
      drawCtx.strokeStyle = "#111827";
      drawCtx.lineWidth = 6;
      drawCtx.stroke();
      drawCtx.fillStyle = character === "panda" ? "#374151" : "#f472b6";
      drawCtx.beginPath();
      drawCtx.arc(cx + 80, cy - 90, 15, 0, 2*Math.PI);
      drawCtx.fill();
    } else if (character === "pig") {
      // Left floppy ear
      drawCtx.fillStyle = secondaryColor;
      drawCtx.beginPath();
      drawCtx.moveTo(cx - 70, cy - 70);
      drawCtx.lineTo(cx - 105, cy - 110);
      drawCtx.lineTo(cx - 40, cy - 95);
      drawCtx.closePath();
      drawCtx.fill();
      drawCtx.strokeStyle = "#111827";
      drawCtx.lineWidth = 6;
      drawCtx.stroke();
      
      // Right floppy ear
      drawCtx.fillStyle = secondaryColor;
      drawCtx.beginPath();
      drawCtx.moveTo(cx + 70, cy - 70);
      drawCtx.lineTo(cx + 105, cy - 110);
      drawCtx.lineTo(cx + 40, cy - 95);
      drawCtx.closePath();
      drawCtx.fill();
      drawCtx.strokeStyle = "#111827";
      drawCtx.lineWidth = 6;
      drawCtx.stroke();
    }
    
    // Draw Face Contour
    drawCtx.fillStyle = primaryColor;
    drawCtx.strokeStyle = "#111827";
    drawCtx.lineWidth = 6;
    drawCtx.beginPath();
    drawCtx.arc(cx, cy, 100, 0, 2*Math.PI);
    drawCtx.fill();
    drawCtx.stroke();
    
    // Draw Chick Hair Tuft
    if (character === "chick") {
      drawCtx.fillStyle = primaryColor;
      drawCtx.strokeStyle = "#111827";
      drawCtx.lineWidth = 5;
      drawCtx.beginPath();
      drawCtx.ellipse(cx - 8, cy - 102, 10, 18, -Math.PI/6, 0, 2*Math.PI);
      drawCtx.fill();
      drawCtx.stroke();
      
      drawCtx.beginPath();
      drawCtx.ellipse(cx + 8, cy - 102, 10, 18, Math.PI/6, 0, 2*Math.PI);
      drawCtx.fill();
      drawCtx.stroke();
    }
    
    // Draw Frog eyes
    if (character === "frog") {
      drawCtx.fillStyle = primaryColor;
      drawCtx.lineWidth = 6;
      drawCtx.beginPath();
      drawCtx.arc(cx - 50, cy - 95, 25, 0, 2*Math.PI);
      drawCtx.fill();
      drawCtx.stroke();
      
      drawCtx.beginPath();
      drawCtx.arc(cx + 50, cy - 95, 25, 0, 2*Math.PI);
      drawCtx.fill();
      drawCtx.stroke();
      
      drawCtx.fillStyle = "#ffffff";
      drawCtx.beginPath();
      drawCtx.arc(cx - 50, cy - 95, 15, 0, 2*Math.PI);
      drawCtx.fill();
      
      drawCtx.beginPath();
      drawCtx.arc(cx + 50, cy - 95, 15, 0, 2*Math.PI);
      drawCtx.fill();
    }
    
    // Cheek Blushes
    drawCtx.fillStyle = "rgba(244, 114, 182, 0.4)";
    drawCtx.beginPath();
    drawCtx.arc(cx - 65, cy + 25, 15, 0, 2*Math.PI);
    drawCtx.arc(cx + 65, cy + 25, 15, 0, 2*Math.PI);
    drawCtx.fill();
    
    // Draw Eyes
    drawCtx.fillStyle = "#111827";
    drawCtx.strokeStyle = "#111827";
    drawCtx.lineWidth = 6;
    drawCtx.lineCap = "round";
    
    const eyeY = character === "frog" ? cy - 95 : cy - 15;
    
    if (emotion === "happy") {
      drawCtx.beginPath();
      drawCtx.arc(cx - 40, eyeY + 10, 15, Math.PI, 2*Math.PI);
      drawCtx.stroke();
      drawCtx.beginPath();
      drawCtx.arc(cx + 40, eyeY + 10, 15, Math.PI, 2*Math.PI);
      drawCtx.stroke();
    } 
    else if (emotion === "sad") {
      drawCtx.beginPath();
      drawCtx.moveTo(cx - 55, eyeY - 5);
      drawCtx.lineTo(cx - 25, eyeY + 10);
      drawCtx.moveTo(cx + 55, eyeY - 5);
      drawCtx.lineTo(cx + 25, eyeY + 10);
      drawCtx.stroke();
      
      drawCtx.fillStyle = "#38bdf8";
      drawCtx.beginPath();
      drawCtx.arc(cx - 45, eyeY + 25, 8, 0, 2*Math.PI);
      drawCtx.arc(cx + 45, eyeY + 25, 8, 0, 2*Math.PI);
      drawCtx.fill();
    } 
    else if (emotion === "angry") {
      drawCtx.beginPath();
      drawCtx.moveTo(cx - 55, eyeY + 10);
      drawCtx.lineTo(cx - 25, eyeY - 5);
      drawCtx.moveTo(cx + 55, eyeY + 10);
      drawCtx.lineTo(cx + 25, eyeY - 5);
      drawCtx.stroke();
      
      drawCtx.strokeStyle = "#ef4444";
      drawCtx.lineWidth = 4;
      drawCtx.beginPath();
      drawCtx.moveTo(cx + 60, cy - 65);
      drawCtx.lineTo(cx + 80, cy - 65);
      drawCtx.moveTo(cx + 70, cy - 75);
      drawCtx.lineTo(cx + 70, cy - 55);
      drawCtx.stroke();
    } 
    else if (emotion === "love") {
      drawCtx.fillStyle = "#ef4444";
      drawHeart(drawCtx, cx - 40, eyeY, 20);
      drawHeart(drawCtx, cx + 40, eyeY, 20);
    } 
    else if (emotion === "surprised") {
      drawCtx.beginPath();
      drawCtx.arc(cx - 40, eyeY, 15, 0, 2*Math.PI);
      drawCtx.arc(cx + 40, eyeY, 15, 0, 2*Math.PI);
      drawCtx.fill();
      
      drawCtx.fillStyle = "#ffffff";
      drawCtx.beginPath();
      drawCtx.arc(cx - 36, eyeY - 4, 6, 0, 2*Math.PI);
      drawCtx.arc(cx + 44, eyeY - 4, 6, 0, 2*Math.PI);
      drawCtx.fill();
    } 
    else if (emotion === "sleepy") {
      drawCtx.beginPath();
      drawCtx.moveTo(cx - 55, eyeY);
      drawCtx.lineTo(cx - 25, eyeY);
      drawCtx.moveTo(cx + 55, eyeY);
      drawCtx.lineTo(cx + 25, eyeY);
      drawCtx.stroke();
      
      drawCtx.fillStyle = "#a855f7";
      drawCtx.font = "bold 18px Arial";
      drawCtx.fillText("Zzz", cx + 55, cy - 55);
    }
    
    // Draw Tiger Stripes
    if (character === "tiger") {
      drawCtx.fillStyle = "#111827";
      drawCtx.strokeStyle = "#111827";
      drawCtx.lineWidth = 5;
      drawCtx.lineCap = "round";
      
      // Forehead stripes
      drawCtx.beginPath();
      drawCtx.moveTo(cx, cy - 100); drawCtx.lineTo(cx, cy - 75);
      drawCtx.moveTo(cx - 15, cy - 100); drawCtx.lineTo(cx - 5, cy - 80);
      drawCtx.moveTo(cx + 15, cy - 100); drawCtx.lineTo(cx + 5, cy - 80);
      drawCtx.stroke();
      
      // Cheek stripes (left)
      drawCtx.beginPath();
      drawCtx.moveTo(cx - 95, cy - 5); drawCtx.lineTo(cx - 75, cy - 2);
      drawCtx.moveTo(cx - 95, cy + 12); drawCtx.lineTo(cx - 75, cy + 10);
      drawCtx.stroke();
      
      // Cheek stripes (right)
      drawCtx.beginPath();
      drawCtx.moveTo(cx + 95, cy - 5); drawCtx.lineTo(cx + 75, cy - 2);
      drawCtx.moveTo(cx + 95, cy + 12); drawCtx.lineTo(cx + 75, cy + 10);
      drawCtx.stroke();
    }
    
    // Draw Nose / Snout
    drawCtx.fillStyle = "#111827";
    if (character === "cat") {
      drawCtx.fillStyle = "#f472b6";
      drawCtx.beginPath();
      drawCtx.moveTo(cx - 8, cy + 5);
      drawCtx.lineTo(cx + 8, cy + 5);
      drawCtx.lineTo(cx, cy + 12);
      drawCtx.closePath();
      drawCtx.fill();
      
      drawCtx.strokeStyle = "#111827";
      drawCtx.lineWidth = 3;
      drawCtx.beginPath();
      drawCtx.moveTo(cx - 85, cy + 10); drawCtx.lineTo(cx - 115, cy + 8);
      drawCtx.moveTo(cx - 85, cy + 20); drawCtx.lineTo(cx - 120, cy + 20);
      drawCtx.moveTo(cx + 85, cy + 10); drawCtx.lineTo(cx + 115, cy + 8);
      drawCtx.moveTo(cx + 85, cy + 20); drawCtx.lineTo(cx + 120, cy + 20);
      drawCtx.stroke();
    } 
    else if (character === "bear" || character === "panda" || character === "rabbit" || character === "dog" || character === "lion" || character === "tiger") {
      drawCtx.fillStyle = "#ffffff";
      drawCtx.beginPath();
      drawCtx.ellipse(cx, cy + 12, 18, 14, 0, 0, 2*Math.PI);
      drawCtx.fill();
      drawCtx.stroke();
      
      drawCtx.fillStyle = "#111827";
      drawCtx.beginPath();
      drawCtx.ellipse(cx, cy + 6, 8, 5, 0, 0, 2*Math.PI);
      drawCtx.fill();
    } else if (character === "frog") {
      drawCtx.beginPath();
      drawCtx.arc(cx - 4, cy - 5, 2, 0, 2*Math.PI);
      drawCtx.arc(cx + 4, cy - 5, 2, 0, 2*Math.PI);
      drawCtx.fill();
    } else if (character === "chick") {
      drawCtx.fillStyle = "#f97316"; // orange beak
      drawCtx.strokeStyle = "#111827";
      drawCtx.lineWidth = 5;
      
      if (emotion === "happy") {
        // Open beak
        drawCtx.beginPath();
        drawCtx.moveTo(cx - 15, cy + 8);
        drawCtx.lineTo(cx + 15, cy + 8);
        drawCtx.lineTo(cx, cy - 2);
        drawCtx.closePath();
        drawCtx.fill();
        drawCtx.stroke();
        
        drawCtx.fillStyle = "#ef4444"; // red tongue inside
        drawCtx.beginPath();
        drawCtx.moveTo(cx - 12, cy + 8);
        drawCtx.lineTo(cx + 12, cy + 8);
        drawCtx.lineTo(cx, cy + 20);
        drawCtx.closePath();
        drawCtx.fill();
        
        drawCtx.fillStyle = "#f97316";
        drawCtx.beginPath();
        drawCtx.moveTo(cx - 15, cy + 8);
        drawCtx.lineTo(cx + 15, cy + 8);
        drawCtx.lineTo(cx, cy + 22);
        drawCtx.closePath();
        drawCtx.fill();
        drawCtx.stroke();
      } else {
        // Closed beak
        drawCtx.beginPath();
        drawCtx.moveTo(cx - 15, cy + 8);
        drawCtx.lineTo(cx + 15, cy + 8);
        drawCtx.lineTo(cx, cy + 20);
        drawCtx.closePath();
        drawCtx.fill();
        drawCtx.stroke();
      }
    } else if (character === "pig") {
      drawCtx.fillStyle = "#f472b6"; // pink snout
      drawCtx.strokeStyle = "#111827";
      drawCtx.lineWidth = 5;
      drawCtx.beginPath();
      drawCtx.ellipse(cx, cy + 12, 24, 16, 0, 0, 2*Math.PI);
      drawCtx.fill();
      drawCtx.stroke();
      
      // Nostrils
      drawCtx.fillStyle = "#111827";
      drawCtx.beginPath();
      drawCtx.arc(cx - 7, cy + 12, 4, 0, 2*Math.PI);
      drawCtx.arc(cx + 7, cy + 12, 4, 0, 2*Math.PI);
      drawCtx.fill();
    }
    
    // Draw Mouth
    if (character !== "chick") {
      drawCtx.strokeStyle = "#111827";
      drawCtx.lineWidth = 5;
      drawCtx.lineCap = "round";
      
      let mouthY = cy + 22;
      if (character === "pig") {
        mouthY = cy + 30;
      }
      
      if (emotion === "happy") {
        drawCtx.fillStyle = "#ef4444";
        drawCtx.beginPath();
        drawCtx.arc(cx, mouthY, 20, 0, Math.PI);
        drawCtx.closePath();
        drawCtx.fill();
        drawCtx.stroke();
      } 
      else if (emotion === "sad") {
        drawCtx.beginPath();
        drawCtx.arc(cx, mouthY + 10, 15, Math.PI, 2*Math.PI);
        drawCtx.stroke();
      } 
      else if (emotion === "angry") {
        drawCtx.beginPath();
        drawCtx.moveTo(cx - 20, mouthY);
        drawCtx.lineTo(cx - 10, mouthY + 5);
        drawCtx.lineTo(cx, mouthY - 5);
        drawCtx.lineTo(cx + 10, mouthY + 5);
        drawCtx.lineTo(cx + 20, mouthY);
        drawCtx.stroke();
      } 
      else if (emotion === "love") {
        drawCtx.beginPath();
        drawCtx.arc(cx - 8, mouthY - 4, 8, 0, Math.PI);
        drawCtx.stroke();
        drawCtx.beginPath();
        drawCtx.arc(cx + 8, mouthY - 4, 8, 0, Math.PI);
        drawCtx.stroke();
      } 
      else if (emotion === "surprised") {
        drawCtx.fillStyle = "#1f2937";
        drawCtx.beginPath();
        drawCtx.arc(cx, mouthY + 5, 12, 0, 2*Math.PI);
        drawCtx.fill();
        drawCtx.stroke();
      } 
      else if (emotion === "sleepy") {
        drawCtx.beginPath();
        drawCtx.moveTo(cx - 15, mouthY);
        drawCtx.lineTo(cx + 15, mouthY);
        drawCtx.stroke();
      }
    }
    
    // Style filters
    if (style === "pixel") {
      const pCanvas = document.createElement("canvas");
      pCanvas.width = 48;
      pCanvas.height = 48;
      const pCtx = pCanvas.getContext("2d");
      pCtx.drawImage(drawCanvas, 0, 0, 48, 48);
      
      drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
      drawCtx.imageSmoothingEnabled = false;
      drawCtx.drawImage(pCanvas, 0, 0, drawCanvas.width, drawCanvas.height);
      drawCtx.imageSmoothingEnabled = true;
    }
    else if (style === "cute-3d") {
      drawCtx.fillStyle = "rgba(255,255,255,0.12)";
      drawCtx.beginPath();
      drawCtx.ellipse(cx - 30, cy - 35, 55, 35, -Math.PI/6, 0, 2*Math.PI);
      drawCtx.fill();
    }
    else if (style === "vector") {
      // Draw flat shadow overlay on the right side of the character
      drawCtx.save();
      drawCtx.globalCompositeOperation = "source-atop";
      drawCtx.fillStyle = "rgba(0, 0, 0, 0.05)";
      drawCtx.beginPath();
      drawCtx.rect(cx, 0, drawCanvas.width / 2, drawCanvas.height);
      drawCtx.fill();
      drawCtx.restore();
    }
    else if (style === "cartoon") {
      // Draw cute cartoon action lines or sparkles around the character
      drawCtx.save();
      drawCtx.strokeStyle = "#111827";
      drawCtx.lineWidth = 4;
      drawCtx.lineCap = "round";
      
      // Top right sparkle
      drawCtx.beginPath();
      drawCtx.moveTo(cx + 115, cy - 95); drawCtx.lineTo(cx + 125, cy - 105);
      drawCtx.moveTo(cx + 125, cy - 95); drawCtx.lineTo(cx + 115, cy - 105);
      drawCtx.stroke();
      
      // Top left sparkle
      drawCtx.beginPath();
      drawCtx.moveTo(cx - 115, cy - 95); drawCtx.lineTo(cx - 125, cy - 105);
      drawCtx.moveTo(cx - 125, cy - 95); drawCtx.lineTo(cx - 115, cy - 105);
      drawCtx.stroke();
      
      drawCtx.restore();
    }
    
    drawCtx.restore();
    redraw();
  }
  
  function drawHeart(ctx, x, y, size) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y + size/4);
    ctx.quadraticCurveTo(x, y - size/2, x - size/2, y - size/2);
    ctx.quadraticCurveTo(x - size, y - size/2, x - size, y + size/4);
    ctx.quadraticCurveTo(x - size, y + size, x, y + size*1.2);
    ctx.quadraticCurveTo(x + size, y + size, x + size, y + size/4);
    ctx.quadraticCurveTo(x + size, y - size/2, x + size/2, y - size/2);
    ctx.quadraticCurveTo(x, y - size/2, x, y + size/4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // --- Drag and drop prevent defaults globally ---
  window.addEventListener("dragover", (e) => {
    e.preventDefault();
  }, false);
  window.addEventListener("drop", (e) => {
    e.preventDefault();
  }, false);
});
