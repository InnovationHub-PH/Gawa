// Theme definitions
const themes = {
  black: {
    name: '◐',
    color: '#000000',
    vars: {
      '--frame-bg-color': '#0d0d0d',
      '--bg-color': '#000000',
      '--text-color': '#ffffff',
      '--border-color': '#333333',
      '--primary-color': '#00ff99',
      '--secondary-color': '#ff00cc',
      '--accent-color': '#ffcc00',
      '--link-color': '#ff00cc',
      '--code-comment': '#6272a4',
      '--code-punctuation': '#f8f8f2',
      '--code-property': '#ff79c6',
      '--code-boolean': '#bd93f9',
      '--code-string': '#50fa7b',
      '--code-function': '#f1fa8c',
      '--code-regex': '#ffb86c'
    }
  },
  purple: {
    name: '◑',
    color: '#160B26',
    vars: {
      '--frame-bg-color': 'rgba(292, 7, 145, 0.05)',
      '--bg-color': '#160B26',
      '--text-color': '#ffffff',
      '--border-color': '#b251b6',
      '--primary-color': '#d946ef',
      '--secondary-color': '#c084fc',
      '--accent-color': '#f472b6',
      '--link-color': '#fc5e03',
      '--code-comment': '#fc5e03',
      '--code-punctuation': '#f8f8f2',
      '--code-property': '#ffd042',
      '--code-boolean': '#bd93f9',
      '--code-string': '#50fa7b',
      '--code-function': '#02dbbe',
      '--code-regex': '#ffb86c'
    }
  },
  green: {
    name: '◒',
    color: '#000000',
    vars: {
      '--frame-bg-color': 'rgba(0, 255, 0, 0.05)',
      '--bg-color': '#000000',
      '--text-color': '#ffffff',
      '--border-color': '#00FF00',
      '--primary-color': '#34d399',
      '--secondary-color': '#6ee7b7',
      '--accent-color': '#a7f3d0',
      '--link-color': '#6ee7b7',
      '--code-comment': '#F72119',
      '--code-punctuation': '#A8DCAB',
      '--code-property': '#00FF00',
      '--code-boolean': '#bd93f9',
      '--code-string': '#50fa7b',
      '--code-function': '#f1fa8c',
      '--code-regex': '#ffb86c'
    }
  },
  brown: {
    name: '◓',
    color: '#111111',
    vars: {
      '--frame-bg-color': 'rgba(255, 176, 0, 0.1)',
      '--bg-color': '#111111',
      '--text-color': '#FFFFFF',
      '--border-color': '#FFB000',
      '--primary-color': '#fbbf24',
      '--secondary-color': '#facc15',
      '--accent-color': '#fde68a',
      '--link-color': '#facc15',
      '--code-comment': '#928374',
      '--code-punctuation': '#FE8019',
      '--code-property': '#66D9EF',
      '--code-boolean': '#FABD2F',
      '--code-string': '#B8BB26',
      '--code-function': '#FB4934',
      '--code-regex': '#D3869B'
    }
  },
  grey: {
    name: '◔',
    color: '#ffffff',
    vars: {
      '--frame-bg-color': 'rgba(180, 190, 200, 0.25)',
      '--bg-color': '#ffffff',
      '--text-color': '#1a1a1a',
      '--border-color': '#cbd5e1',
      '--primary-color': '#3b82f6',
      '--secondary-color': '#2563eb',
      '--accent-color': '#60a5fa',
      '--link-color': '#2563eb',
      '--code-comment': '#6272a4',
      '--code-punctuation': '#f8f8f2',
      '--code-property': '#ff79c6',
      '--code-boolean': '#bd93f9',
      '--code-string': '#50fa7b',
      '--code-function': '#f1fa8c',
      '--code-regex': '#ffb86c'
    }
  },
  beige: {
    name: '◕',
    color: '#fdf6e3',
    vars: {
      '--frame-bg-color': '#fef3c7',
      '--bg-color': '#fdf6e3',
      '--text-color': '#1a1a1a',
      '--border-color': '#2563eb',
      '--primary-color': '#2563eb',
      '--secondary-color': '#420480',
      '--accent-color': '#059669',
      '--link-color': '#2563eb',
      '--code-comment': '#6272a4',
      '--code-punctuation': '#f8f8f2',
      '--code-property': '#ff79c6',
      '--code-boolean': '#bd93f9',
      '--code-string': '#50fa7b',
      '--code-function': '#f1fa8c',
      '--code-regex': '#ffb86c'
    }
  }
};

// Get stored theme or default to 'grey'
const getStoredTheme = () => localStorage.getItem('theme') || 'grey';

// Update theme
const updateTheme = (themeName) => {
  const theme = themes[themeName];
  if (!theme) return;

  // Update data-theme attribute
  document.documentElement.setAttribute('data-theme', themeName);

  // Update meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme.color);
  }

  // Store theme preference
  localStorage.setItem('theme', themeName);
  
  // Update theme toggle button
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle.querySelector('.theme-icon');
  themeIcon.textContent = theme.name;
  themeToggle.setAttribute('aria-label', `Switch theme (current: ${theme.name})`);
};

// Get next theme in rotation
const getNextTheme = (currentTheme) => {
  const themeNames = Object.keys(themes);
  const currentIndex = themeNames.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % themeNames.length;
  return themeNames[nextIndex];
};

// Toggle mobile menu
const toggleMobileMenu = () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  menuToggle.classList.toggle('active');
  mainNav.classList.toggle('active');
};

// Close mobile menu when clicking outside
const handleClickOutside = (event) => {
  const mainNav = document.querySelector('.main-nav');
  const menuToggle = document.querySelector('.menu-toggle');
  
  if (mainNav.classList.contains('active') && 
      !event.target.closest('.main-nav') && 
      !event.target.closest('.menu-toggle')) {
    mainNav.classList.remove('active');
    menuToggle.classList.remove('active');
  }
};

// Set active navigation link based on current page
const setActiveNavLink = () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
};

// Initialize theme and navigation
document.addEventListener('DOMContentLoaded', () => {
  const storedTheme = getStoredTheme();
  updateTheme(storedTheme);
  
  // Add theme toggle button listener
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', () => {
    const currentTheme = localStorage.getItem('theme') || 'grey';
    const nextTheme = getNextTheme(currentTheme);
    updateTheme(nextTheme);
  });

  // Add mobile menu toggle listener
  const menuToggle = document.querySelector('.menu-toggle');
  menuToggle.addEventListener('click', toggleMobileMenu);

  // Add click outside listener
  document.addEventListener('click', handleClickOutside);

  // Set active navigation link
  setActiveNavLink();
});