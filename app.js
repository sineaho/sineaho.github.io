// DOM Elements
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = themeToggleBtn.querySelector('i');
const themeText = themeToggleBtn.querySelector('span');

const globalSearchInput = document.getElementById('global-search');
const heroSearchInput = document.getElementById('hero-tool-search');
const toolCards = document.querySelectorAll('.tool-card');
const subCards = document.querySelectorAll('.sub-card');

// Theme Toggle Logic (Light <-> Dark)
themeToggleBtn.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  let newTheme = 'dark';
  
  if (currentTheme === 'dark') {
    newTheme = 'light';
    themeIcon.className = 'fa-solid fa-moon';
    themeText.textContent = '다크';
    themeToggleBtn.style.borderColor = 'var(--text-muted)';
  } else {
    newTheme = 'dark';
    themeIcon.className = 'fa-solid fa-sun';
    themeText.textContent = '라이트';
    themeToggleBtn.style.borderColor = 'rgba(255, 255, 255, 0.08)';
  }
  
  document.documentElement.setAttribute('data-theme', newTheme);
});

// Live Search & Filtering Functionality
function filterTools(query) {
  const cleanQuery = query.trim().toLowerCase();
  
  toolCards.forEach(card => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    const desc = card.querySelector('.tool-desc').textContent.toLowerCase();
    const tags = card.getAttribute('data-tags').toLowerCase();
    
    // Check if query matches title, description or tags
    if (title.includes(cleanQuery) || desc.includes(cleanQuery) || tags.includes(cleanQuery)) {
      card.style.display = 'flex';
      // Fade in effect
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    } else {
      card.style.display = 'none';
    }
  });
}

// Bind search input events and synchronize inputs
globalSearchInput.addEventListener('input', (e) => {
  const val = e.target.value;
  heroSearchInput.value = val; // Synchronize
  filterTools(val);
});

heroSearchInput.addEventListener('input', (e) => {
  const val = e.target.value;
  globalSearchInput.value = val; // Synchronize
  filterTools(val);
});

// Main Feature Sub Card Activation Toggle
subCards.forEach(subCard => {
  subCard.addEventListener('click', () => {
    // Remove active class from all
    subCards.forEach(c => c.classList.remove('active'));
    // Add active to clicked
    subCard.classList.add('active');
    
    // Trigger visual feedback (toast/badge toggle etc. can be added here)
    const cardTitle = subCard.querySelector('span').textContent;
    console.log(`메인 피처 서브 탭 변경: ${cardTitle}`);
  });
});
