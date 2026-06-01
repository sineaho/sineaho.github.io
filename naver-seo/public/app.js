// API Server Base URL (CORS/File protocol compatibility)
const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';

// DOM Elements
const analyzeForm = document.getElementById('analyze-form');
const blogUrlInput = document.getElementById('blog-url');
const targetKeywordInput = document.getElementById('target-keyword');
const submitBtn = document.getElementById('submit-btn');
const spinner = submitBtn.querySelector('.spinner');
const btnText = submitBtn.querySelector('.btn-text');

const editorTitle = document.getElementById('editor-title');
const editorBody = document.getElementById('editor-body');
const titleCharCount = document.getElementById('title-char-count');
const bodyCharCount = document.getElementById('body-char-count');
const bodyCharNoSpaceCount = document.getElementById('body-char-no-space-count');
const editorAlertMsg = document.getElementById('editor-alert-msg');
const editorStatusBadge = document.getElementById('editor-status-badge');

// Radial Progress Gauge
const scoreRing = document.getElementById('score-ring');
const scoreNum = document.getElementById('score-num');
const scoreGrade = document.getElementById('score-grade');

// Tool buttons
const toolH2 = document.getElementById('tool-h2');
const toolH3 = document.getElementById('tool-h3');
const toolImg = document.getElementById('tool-img');
const toolLink = document.getElementById('tool-link');
const toolFaq = document.getElementById('tool-faq');

// Radial Progress Configuration
const radius = scoreRing.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
scoreRing.style.strokeDasharray = `${circumference} ${circumference}`;
scoreRing.style.strokeDashoffset = circumference;

// Naver Blog Valid URL Regexes
const NAVER_BLOG_REGEXES = [
  /blog\.naver\.com\/([a-zA-Z0-9_-]+)\/([0-9]+)/,
  /blog\.naver\.com\/PostView\.(naver|nhn)\?.*blogId=([a-zA-Z0-9_-]+).*logNo=([0-9]+)/,
  /m\.blog\.naver\.com\/([a-zA-Z0-9_-]+)\/([0-9]+)/,
  /m\.blog\.naver\.com\/PostView\.(naver|nhn)\?.*blogId=([a-zA-Z0-9_-]+).*logNo=([0-9]+)/
];

// Extracted tags holder from crawl
let extractedTags = [];

// Toast Notification
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'fa-circle-check';
  if (type === 'warning') icon = 'fa-triangle-exclamation';
  if (type === 'error') icon = 'fa-circle-xmark';

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 4000);
}

// Check if URL is valid Naver Blog URL
function isValidNaverBlogUrl(url) {
  return NAVER_BLOG_REGEXES.some(regex => regex.test(url));
}

// Progress Ring Updater
function setProgress(percent) {
  const offset = circumference - (percent / 100) * circumference;
  scoreRing.style.strokeDashoffset = offset;
  
  // Dynamic color updating based on score
  let accentColor = '#ef4444'; // Red
  if (percent >= 80) {
    accentColor = '#10b981'; // Green
  } else if (percent >= 50) {
    accentColor = '#f59e0b'; // Orange/Yellow
  }
  document.documentElement.style.setProperty('--accent-color', accentColor);
}

// Insert Text at Cursor Helper
function insertTextAtCursor(textarea, text) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const currentText = textarea.value;
  const before = currentText.substring(0, start);
  const after = currentText.substring(end, currentText.length);
  
  textarea.value = before + text + after;
  textarea.focus();
  textarea.selectionStart = start + text.length;
  textarea.selectionEnd = start + text.length;
  
  // trigger input event to recalculate score
  const event = new Event('input', { bubbles: true });
  textarea.dispatchEvent(event);
}

// Event Listeners for Editor Toolbar
toolH2.addEventListener('click', () => {
  if (editorBody.disabled) return;
  insertTextAtCursor(editorBody, '\n## 소제목 작성\n');
});

toolH3.addEventListener('click', () => {
  if (editorBody.disabled) return;
  insertTextAtCursor(editorBody, '\n### 소제목 작성\n');
});

toolImg.addEventListener('click', () => {
  if (editorBody.disabled) return;
  insertTextAtCursor(editorBody, '\n[이미지: 이미지 설명 작성]\n');
});

toolLink.addEventListener('click', () => {
  if (editorBody.disabled) return;
  insertTextAtCursor(editorBody, '\n[링크: 링크 텍스트](https://example.com)\n');
});

toolFaq.addEventListener('click', () => {
  if (editorBody.disabled) return;
  const faqTemplate = `
\n### FAQ
Q: 질문을 입력하세요.
A: 답변을 입력하세요.

Q: 두 번째 질문을 입력하세요.
A: 두 번째 답변을 입력하세요.

Q: 세 번째 질문을 입력하세요.
A: 세 번째 답변을 입력하세요.\n`;
  insertTextAtCursor(editorBody, faqTemplate);
});

// Main Score Logic
function calculateSEOScore() {
  const title = editorTitle.value.trim();
  const body = editorBody.value;
  const keyword = targetKeywordInput.value.trim().toLowerCase();

  // Character counts
  const spaceCharCount = body.length;
  const noSpaceCharCount = body.replace(/\s/g, '').length;
  
  titleCharCount.textContent = title.length;
  bodyCharCount.textContent = spaceCharCount;
  bodyCharNoSpaceCount.textContent = noSpaceCharCount;

  if (!keyword) {
    editorAlertMsg.textContent = '타겟 키워드를 먼저 입력해야 정확한 진단이 가능합니다.';
    editorAlertMsg.className = 'status-msg error';
    return;
  } else {
    editorAlertMsg.textContent = '실시간 편집본을 실시간으로 진단하고 있습니다.';
    editorAlertMsg.className = 'status-msg success';
  }

  let totalScore = 0;
  
  // Helper to update check items
  const updateCheckItem = (id, state, score, textContentObj) => {
    const item = document.getElementById(id);
    item.className = `check-item card-item chk-${state}`;
    
    // Status Icon
    const statusDiv = item.querySelector('.check-status');
    if (state === 'pass') {
      statusDiv.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
      totalScore += score;
    } else if (state === 'warn') {
      statusDiv.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i>';
      totalScore += Math.floor(score / 2);
    } else {
      statusDiv.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
    }

    // Sub metrics
    const subDiv = document.getElementById(`sub-${id}`);
    if (subDiv && textContentObj) {
      let subTexts = [];
      for (const [key, val] of Object.entries(textContentObj)) {
        subTexts.push(`<span>${key}: ${val}</span>`);
      }
      subDiv.innerHTML = subTexts.join(' | ');
    }
  };

  // 1. 키워드 배치 및 밀도 (15점)
  // - 도입부 100자 안에 키워드 포함 (3점)
  // - 본문 키워드 3회 이상 등장 (4점)
  // - 결론부 (뒤 30%) 안에 키워드 재언급 (4점)
  // - 키워드 밀도 0% 초과 3% 이하 (4점)
  const bodyLower = body.toLowerCase();
  
  const introText = bodyLower.substring(0, 100);
  const hasIntroKeyword = introText.includes(keyword);

  const keywordRegex = new RegExp(keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
  const keywordCount = (bodyLower.match(keywordRegex) || []).length;
  
  const conclusionStart = Math.max(0, bodyLower.length - Math.floor(bodyLower.length * 0.3));
  const conclusionText = bodyLower.substring(conclusionStart);
  const hasConclusionKeyword = conclusionText.includes(keyword);

  const density = spaceCharCount > 0 ? ((keywordCount * keyword.length) / spaceCharCount) * 100 : 0;
  
  let keywordState = 'fail';
  if (hasIntroKeyword && keywordCount >= 3 && hasConclusionKeyword && density > 0 && density <= 3) {
    keywordState = 'pass';
  } else if (keywordCount >= 1 && density <= 5) {
    keywordState = 'warn';
  }

  updateCheckItem('chk-keywords', keywordState, 15, {
    '도입부': hasIntroKeyword ? '포함' : '미포함',
    '빈도': `${keywordCount}회`,
    '결론부': hasConclusionKeyword ? '포함' : '미포함',
    '밀도': `${density.toFixed(1)}%`
  });


  // 2. 제목 최적화 (15점)
  // - 키워드 포함 (5점)
  // - 숫자 포함 (3점)
  // - 행동유도어 포함 (3점)
  // - 길이 15~40자 (4점)
  const titleLower = title.toLowerCase();
  const hasTitleKeyword = titleLower.includes(keyword);
  const hasTitleNumber = /\d+/.test(title);
  const triggerWords = ['총정리', '가이드', '솔직 후기', '후기', '추천', '방법', '꿀팁', '정보', '비법', '선택'];
  const hasTrigger = triggerWords.some(word => titleLower.includes(word));
  const titleLen = title.length;
  const isTitleLenOk = titleLen >= 15 && titleLen <= 40;

  let titleState = 'fail';
  if (hasTitleKeyword && isTitleLenOk && (hasTitleNumber || hasTrigger)) {
    titleState = 'pass';
  } else if (hasTitleKeyword || (titleLen >= 10 && titleLen <= 45)) {
    titleState = 'warn';
  }

  updateCheckItem('chk-title', titleState, 15, {
    '키워드': hasTitleKeyword ? '매칭' : '미매칭',
    '숫자': hasTitleNumber ? '포함' : '미포함',
    '행동유도': hasTrigger ? '감지' : '미감지',
    '길이': `${titleLen}자`
  });


  // 3. 소제목 구조 (10점)
  // - H2 (## ) 4개 이상 (5점)
  // - H3 (### ) 2개 이상 (5점)
  const h2Count = (body.match(/^##\s+.+/gm) || []).length;
  const h3Count = (body.match(/^###\s+.+/gm) || []).length;
  
  let subheadingState = 'fail';
  if (h2Count >= 4 && h3Count >= 2) {
    subheadingState = 'pass';
  } else if (h2Count >= 2 || h3Count >= 1) {
    subheadingState = 'warn';
  }

  updateCheckItem('chk-subheadings', subheadingState, 10, {
    'H2 소제목': `${h2Count}개 / 4개`,
    'H3 소제목': `${h3Count}개 / 2개`
  });


  // 4. 글 분량 (15점)
  // - 2,197자 이상 충족 (15점)
  const targetLength = 2197;
  let lengthState = 'fail';
  if (spaceCharCount >= targetLength) {
    lengthState = 'pass';
  } else if (spaceCharCount >= 1000) {
    lengthState = 'warn';
  }

  updateCheckItem('chk-length', lengthState, 15, {
    '현재': `${spaceCharCount}자`,
    '달성도': `${Math.min(100, Math.floor((spaceCharCount / targetLength) * 100))}%`
  });


  // 5. 이미지 수 (10점)
  // - 이미지 5개 이상 (10점)
  const imageRegex = /\[이미지:/g;
  const imgCount = (body.match(imageRegex) || []).length;
  
  let imageState = 'fail';
  if (imgCount >= 5) {
    imageState = 'pass';
  } else if (imgCount >= 2) {
    imageState = 'warn';
  }

  updateCheckItem('chk-images', imageState, 10, {
    '이미지 수': `${imgCount}개 / 5개`
  });


  // 6. 가독성 및 가치 (15점)
  // - 문단 70% 이상이 150자 이하 (5점)
  // - 표/목록 1개 이상 (5점)
  // - 질문형 문장 2개 이상 (5점)
  const paragraphs = body.split('\n').map(p => p.trim()).filter(p => p.length > 0);
  const shortParagraphs = paragraphs.filter(p => p.length <= 150);
  const shortRatio = paragraphs.length > 0 ? (shortParagraphs.length / paragraphs.length) * 100 : 0;
  
  const hasTableOrList = body.includes('|') || body.includes('* ') || body.includes('- ') || /^\d+\.\s/m.test(body);
  
  const questionCount = (body.match(/\?/g) || []).length;

  let readabilityState = 'fail';
  if (shortRatio >= 70 && hasTableOrList && questionCount >= 2) {
    readabilityState = 'pass';
  } else if (shortRatio >= 40 || hasTableOrList || questionCount >= 1) {
    readabilityState = 'warn';
  }

  updateCheckItem('chk-readability', readabilityState, 15, {
    '단문 비율': `${shortRatio.toFixed(0)}%`,
    '표/목록': hasTableOrList ? '존재' : '미존재',
    '질문형': `${questionCount}개`
  });


  // 7. 외부 링크 유무 (5점)
  // - 링크 1개 이상 (5점)
  const linkRegex = /\[링크:|https?:\/\//g;
  const linkCount = (body.match(linkRegex) || []).length;
  
  let linkState = 'fail';
  if (linkCount >= 1) {
    linkState = 'pass';
  }

  updateCheckItem('chk-links', linkState, 5, {
    '링크 수': `${linkCount}개 / 1개`
  });


  // 8. FAQ 섹션 (10점)
  // - FAQ 단어 포함 (5점)
  // - Q&A 3쌍 이상 (5점)
  const hasFaqKeyword = bodyLower.includes('faq') || bodyLower.includes('자주 묻는 질문');
  
  // Q: 와 A: 쌍 개수 계산
  const qMatches = body.match(/^Q[:.]\s*.+/gim) || [];
  const aMatches = body.match(/^A[:.]\s*.+/gim) || [];
  const qaPairs = Math.min(qMatches.length, aMatches.length);

  let faqState = 'fail';
  if (hasFaqKeyword && qaPairs >= 3) {
    faqState = 'pass';
  } else if (hasFaqKeyword || qaPairs >= 1) {
    faqState = 'warn';
  }

  updateCheckItem('chk-faq', faqState, 10, {
    'FAQ 섹션': hasFaqKeyword ? '감지' : '미감지',
    'Q&A 쌍': `${qaPairs}쌍 / 3쌍`
  });


  // 9. 해시태그 최적화 (5점)
  // - 해시태그 1~5개 (5점)
  // 본문 안의 #단어 패턴 감지 (단, ## 소제목 제외)
  const hashtagRegex = /(?<!#)#([a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣_]+)/g;
  const matches = body.match(hashtagRegex) || [];
  
  // ## 소제목 필터링
  const rawTags = matches.filter(tag => !tag.startsWith('##'));
  const tagCount = rawTags.length > 0 ? rawTags.length : extractedTags.length;

  let tagsState = 'fail';
  if (tagCount >= 1 && tagCount <= 5) {
    tagsState = 'pass';
  } else if (tagCount > 5 && tagCount <= 10) {
    tagsState = 'warn';
  }

  updateCheckItem('chk-tags', tagsState, 5, {
    '태그 수': `${tagCount}개`
  });

  // Score display & Gauge animations
  scoreNum.textContent = totalScore;
  setProgress(totalScore);

  // Grade badge styling
  scoreGrade.className = 'score-grade';
  if (totalScore >= 80) {
    scoreGrade.textContent = '최적화 우수';
    scoreGrade.classList.add('grade-good');
  } else if (totalScore >= 50) {
    scoreGrade.textContent = '개선 권장';
    scoreGrade.classList.add('grade-warn');
  } else {
    scoreGrade.textContent = '저품질 위험';
    scoreGrade.classList.add('grade-danger');
  }
}

// Bind live update events to input fields
editorTitle.addEventListener('input', calculateSEOScore);
editorBody.addEventListener('input', calculateSEOScore);
targetKeywordInput.addEventListener('input', calculateSEOScore);

// Form Submit Handler (Scrape & Analyze)
analyzeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const url = blogUrlInput.value.trim();

  if (!url) {
    showToast('블로그 주소를 입력해 주세요.', 'error');
    return;
  }

  if (!isValidNaverBlogUrl(url)) {
    showToast('올바른 네이버 블로그 주소가 아닙니다.', 'error');
    return;
  }

  // Set Loading state
  submitBtn.disabled = true;
  spinner.classList.remove('hidden');
  btnText.textContent = '데이터 수집 중...';

  try {
    const response = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '분석 중 오류가 발생했습니다.');
    }

    // Success
    showToast('블로그 데이터를 성공적으로 가져왔습니다!', 'success');

    // Enable Editor
    editorTitle.disabled = false;
    editorBody.disabled = false;
    editorStatusBadge.classList.remove('hidden');

    // Populate Fields
    editorTitle.value = data.title;
    
    // Convert tags array to text tags for appending if none found in body
    extractedTags = data.tags || [];
    let formattedTags = extractedTags.map(tag => `#${tag}`).join(' ');

    // Set Target Keyword to first hashtag if available
    if (extractedTags.length > 0) {
      targetKeywordInput.value = extractedTags[0];
      showToast(`첫 번째 해시태그(#${extractedTags[0]})를 타겟 핵심 키워드로 지정했습니다.`, 'info');
    } else {
      showToast('포스팅 내 해시태그가 없습니다. 타겟 키워드를 직접 입력해 주세요.', 'warning');
    }

    // Compile content structure for markdown editing
    let initialBody = data.content;
    if (formattedTags) {
      initialBody += `\n\n${formattedTags}`;
    }
    
    // If no images found but count exists, append image tags at end
    if (data.imageCount > 0 && !initialBody.includes('[이미지:')) {
      initialBody += '\n\n';
      for (let idx = 1; idx <= data.imageCount; idx++) {
        initialBody += `[이미지: 수집 이미지 ${idx}]\n`;
      }
    }
    
    // If no link marks, append links count helper
    if (data.linkCount > 0 && !initialBody.includes('[링크:')) {
      initialBody += '\n\n';
      for (let idx = 1; idx <= data.linkCount; idx++) {
        initialBody += `[링크: 수집 링크 ${idx}](https://blog.naver.com)\n`;
      }
    }

    editorBody.value = initialBody;

    // Run Scoring Engine
    calculateSEOScore();

  } catch (error) {
    showToast(error.message, 'error');
    console.error(error);
  } finally {
    // Reset Loading State
    submitBtn.disabled = false;
    spinner.classList.add('hidden');
    btnText.textContent = '분석 시작';
  }
});
