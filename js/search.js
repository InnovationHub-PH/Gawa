import { blogPosts } from './blogData.js';

// Import PDF.js for community member documents
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// Sample job data
const jobs = [
  {
    title: 'Job Title',
    company: 'Company Name',
    logo: 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png',
    location: 'Makati, MNL',
    remote: false,
    tags: ['robotics', 'hardware'],
    description: 'Describe the Job opening here...',
    coordinates: { lat: 14.5547, lng: 120.9947 }
  },
  {
    title: 'Software Developer',
    company: 'Remote Robotics',
    logo: 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png',
    location: 'Remote',
    remote: true,
    tags: ['software', 'robotics'],
    description: 'Developing control systems for autonomous robots. We are looking for a skilled software developer with experience in robotics and control systems.',
    coordinates: { lat: 14.5580, lng: 120.9890 }
  },
  {
    title: 'Mechatronics Intern',
    company: 'Innovation Labs',
    logo: 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png',
    location: 'Boston, MA',
    remote: false,
    tags: ['internship', 'hardware', 'software'],
    description: 'Summer internship opportunity in our robotics division. Join our team of experts and gain hands-on experience.',
    coordinates: { lat: 14.5695, lng: 120.9822 }
  }
];

// Community member data
const communityMembers = [
  {
    name: 'TechLabs Manila',
    category: 'COMPANIES',
    website: 'https://techlabs.ph',
    email: 'contact@techlabs.ph',
    phone: '+63 2 8123 4567',
    facebook: 'https://facebook.com/techlabsmanila',
    tags: ['company', 'robotics', 'software'],
    profileImage: 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png',
    location: {
      lat: 14.5547,
      lng: 120.9947,
      address: 'Makati City, Philippines'
    }
  },
  {
    name: 'RoboCore Solutions',
    category: 'COMPANIES',
    website: 'https://robocore.ph',
    email: 'info@robocore.ph',
    phone: '+63 2 8234 5678',
    facebook: 'https://facebook.com/robocore',
    tags: ['company', 'robotics', 'hardware'],
    profileImage: 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png',
    location: {
      lat: 14.5580,
      lng: 120.9890,
      address: 'BGC, Taguig City, Philippines'
    }
  },
  {
    name: 'De La Salle University',
    category: 'EDUCATIONAL INSTITUTIONS',
    website: 'https://www.dlsu.edu.ph',
    email: 'info@dlsu.edu.ph',
    phone: '+63 2 8524 4611',
    facebook: 'https://facebook.com/dlsu',
    tags: ['education', 'robotics', 'research'],
    profileImage: 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png',
    location: {
      lat: 14.5648,
      lng: 120.9932,
      address: '2401 Taft Avenue, Manila'
    }
  },
  {
    name: 'Jon Prado',
    category: 'INDIVIDUALS',
    website: 'https://jonprado.com',
    email: 'jon@example.com',
    phone: '+63 917 123 4567',
    facebook: 'https://facebook.com/jonprado',
    tags: ['individual', 'hardware', 'software'],
    profileImage: 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png',
    location: {
      lat: 14.5695,
      lng: 120.9822,
      address: 'Manila, Philippines'
    }
  }
];

// Global state
let currentMode = 'blog';
let activeFilters = new Set();
let remoteOnly = false;
let searchTerm = '';
let currentPage = 0;
let map = null;
let markers = new Map();
let currentSlide = 0;
const totalSlides = 2;
let popupShown = false;

// Utility functions
function truncateWords(text, wordCount) {
  const words = text.split(' ');
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(' ') + '...';
}

function processCodeBlocks(content) {
  return content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || 'plaintext';
    const highlighted = Prism.highlight(
      code.trim(),
      Prism.languages[language] || Prism.languages.plaintext,
      language
    );
    return `<pre class="language-${language}"><code class="language-${language}">${highlighted}</code></pre>`;
  });
}

// Initialize map
function initializeMap() {
  if (!map) {
    map = L.map('searchMap').setView([14.5995, 120.9842], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
  }
}

// Clear map markers
function clearMapMarkers() {
  markers.forEach(marker => map.removeLayer(marker));
  markers.clear();
}

// Add markers to map
function addMarkersToMap(items, type) {
  clearMapMarkers();
  
  items.forEach(item => {
    let coords, popupContent;
    
    if (type === 'jobs' && item.coordinates) {
      coords = [item.coordinates.lat, item.coordinates.lng];
      popupContent = `<strong>${item.title}</strong><br>${item.company}<br>${item.location}`;
    } else if (type === 'community' && item.location) {
      coords = [item.location.lat, item.location.lng];
      popupContent = `<strong>${item.name}</strong><br>${item.location.address}`;
    }
    
    if (coords) {
      const marker = L.marker(coords)
        .bindPopup(popupContent)
        .addTo(map);
      
      markers.set(item.title || item.name, marker);
    }
  });
}

// Blog functions
function getAllBlogTags() {
  const tags = new Set();
  blogPosts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags);
}

function createBlogCard(post) {
  const excerpt = post.excerpt || post.content.split('\n')[0];
  const truncatedExcerpt = truncateWords(excerpt, 11);
  const needsReadMore = excerpt.split(' ').length > 11;
  
  return `
    <a href="post.html?id=${post.id}" class="card blog-card" data-tags="${post.tags.join(' ')}">
      <div class="blog-image">
        <img src="${post.image}" alt="${post.title}">
      </div>
      <div class="blog-content">
        <h3>${post.title}</h3>
        <div class="blog-meta">
          <span class="blog-date">${new Date(post.date).toLocaleDateString()}</span>
          <span class="blog-author">By ${post.author}</span>
        </div>
        <div class="blog-excerpt">
          <p class="truncated">${truncatedExcerpt}</p>
          <p class="full" style="display: none;">${excerpt}</p>
          ${needsReadMore ? '<button class="read-more-blog">READ MORE</button>' : ''}
        </div>
        <div class="tags">
          ${post.tags.map(tag => `<span class="tag">${tag.toUpperCase()}</span>`).join('')}
        </div>
      </div>
    </a>
  `;
}

// Job functions
function createJobCard(job) {
  const truncatedDescription = truncateWords(job.description, 11);
  const fullDescription = job.description;
  const isExpanded = truncatedDescription === fullDescription;

  return `
    <div class="card">
      <div class="card-header">
        <img src="${job.logo}" alt="${job.company} logo" class="card-logo">
        <div class="title-info">
          <h3>${job.title}</h3>
          <h4>${job.company}</h4>
          <p class="location">${job.location}</p>
        </div>
      </div>
      <div class="tags">
        ${job.tags.map(tag => `<span class="tag">${tag.toUpperCase()}</span>`).join('')}
      </div>
      <div class="description-container">
        <p class="description truncated">${truncatedDescription}</p>
        <p class="description full" style="display: none;">${fullDescription}</p>
        ${!isExpanded ? `<button class="read-more">READ MORE</button>` : ''}
      </div>
      <a href="#" class="sqr-btn">APPLY NOW</a>
    </div>
  `;
}

// Community functions
function createMemberCard(member) {
  const processedInfo = {};
  if (member.website) {
    const websiteText = member.website.replace('https://', '').replace('http://', '');
    processedInfo.website = {
      full: member.website,
      truncated: truncateWords(websiteText, 11),
      needsReadMore: websiteText.split(' ').length > 11
    };
  }
  
  if (member.email) {
    processedInfo.email = {
      full: member.email,
      truncated: truncateWords(member.email, 11),
      needsReadMore: member.email.split(' ').length > 11
    };
  }
  
  if (member.facebook) {
    const facebookText = member.facebook.replace('https://facebook.com/', '@');
    processedInfo.facebook = {
      full: member.facebook,
      truncated: truncateWords(facebookText, 11),
      needsReadMore: facebookText.split(' ').length > 11
    };
  }

  return `
    <div class="card member-card" data-member="${member.name}" data-tags="${member.tags.join(' ')}">
      <div class="card-header">
        <img src="${member.profileImage}" alt="${member.name}" class="card-logo">
        <div class="title-info">
          <h3>${member.name}</h3>
          ${member.location ? `<p class="member-location">${member.location.address}</p>` : ''}
        </div>
      </div>
      <div class="member-info">
        ${member.website ? `
          <div class="info-item">
            <span class="info-label">Website: </span>
            <span class="info-content">
              <span class="truncated"><a href="${processedInfo.website.full}" target="_blank">${processedInfo.website.truncated}</a></span>
              <span class="full" style="display: none;"><a href="${processedInfo.website.full}" target="_blank">${processedInfo.website.full}</a></span>
              ${processedInfo.website.needsReadMore ? '<button class="read-more-info">READ MORE</button>' : ''}
            </span>
          </div>
        ` : ''}
        ${member.email ? `
          <div class="info-item">
            <span class="info-label">Email: </span>
            <span class="info-content">
              <span class="truncated"><a href="mailto:${processedInfo.email.full}">${processedInfo.email.truncated}</a></span>
              <span class="full" style="display: none;"><a href="mailto:${processedInfo.email.full}">${processedInfo.email.full}</a></span>
              ${processedInfo.email.needsReadMore ? '<button class="read-more-info">READ MORE</button>' : ''}
            </span>
          </div>
        ` : ''}
        ${member.phone ? `<p>Phone: <a href="tel:${member.phone}">${member.phone}</a></p>` : ''}
        ${member.facebook ? `
          <div class="info-item">
            <span class="info-label">Facebook: </span>
            <span class="info-content">
              <span class="truncated"><a href="${processedInfo.facebook.full}" target="_blank">${processedInfo.facebook.truncated}</a></span>
              <span class="full" style="display: none;"><a href="${processedInfo.facebook.full}" target="_blank">${processedInfo.facebook.full}</a></span>
              ${processedInfo.facebook.needsReadMore ? '<button class="read-more-info">READ MORE</button>' : ''}
            </span>
          </div>
        ` : ''}
      </div>
      <div class="tags">
        ${member.tags.map(tag => `<span class="tag">${tag.toUpperCase()}</span>`).join('')}
      </div>
    </div>
  `;
}

// Update functions
function updateBlogResults() {
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTags = 
      activeFilters.size === 0 || 
      post.tags.some(tag => activeFilters.has(tag));

    return matchesSearch && matchesTags;
  });

  const postsPerPage = window.innerWidth <= 768 ? 1 : 3;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  
  if (currentPage >= totalPages) {
    currentPage = Math.max(0, totalPages - 1);
  }

  const startIndex = currentPage * postsPerPage;
  const visiblePosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  prevBtn.disabled = currentPage === 0;
  nextBtn.disabled = currentPage >= totalPages - 1;

  document.getElementById('blogGrid').innerHTML = visiblePosts.map(createBlogCard).join('');
  
  // Add read more event listeners
  document.querySelectorAll('.read-more-blog').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const container = this.closest('.blog-excerpt');
      const truncated = container.querySelector('.truncated');
      const full = container.querySelector('.full');
      
      if (truncated.style.display !== 'none') {
        truncated.style.display = 'none';
        full.style.display = 'block';
        this.textContent = 'READ LESS';
      } else {
        truncated.style.display = 'block';
        full.style.display = 'none';
        this.textContent = 'READ MORE';
      }
    });
  });

  Prism.highlightAll();
}

function updateJobsResults() {
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = (
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    if (!matchesSearch) return false;
    if (remoteOnly && !job.remote) return false;
    if (activeFilters.size === 0) return true;
    return job.tags.some(tag => activeFilters.has(tag));
  });

  document.getElementById('jobsList').innerHTML = filteredJobs.map(createJobCard).join('');
  
  // Add read more event listeners
  document.querySelectorAll('.read-more').forEach(button => {
    button.addEventListener('click', function(e) {
      const container = this.closest('.description-container');
      const truncated = container.querySelector('.truncated');
      const full = container.querySelector('.full');
      
      if (truncated.style.display !== 'none') {
        truncated.style.display = 'none';
        full.style.display = 'block';
        this.textContent = 'READ LESS';
      } else {
        truncated.style.display = 'block';
        full.style.display = 'none';
        this.textContent = 'READ MORE';
      }
    });
  });

  // Update map with job markers
  addMarkersToMap(filteredJobs, 'jobs');
}

function updateCommunityResults() {
  const filteredMembers = communityMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilters = activeFilters.size === 0 || 
                          member.tags.some(tag => activeFilters.has(tag));

    return matchesSearch && matchesFilters;
  });

  // Clear all grids
  document.querySelector('.companies-grid').innerHTML = '';
  document.querySelector('.individuals-grid').innerHTML = '';
  document.querySelector('.education-grid').innerHTML = '';

  filteredMembers.forEach(member => {
    let targetGrid;
    if (member.category === 'COMPANIES') {
      targetGrid = document.querySelector('.companies-grid');
    } else if (member.category === 'INDIVIDUALS') {
      targetGrid = document.querySelector('.individuals-grid');
    } else if (member.category === 'EDUCATIONAL INSTITUTIONS') {
      targetGrid = document.querySelector('.education-grid');
    }
    
    if (targetGrid) {
      targetGrid.insertAdjacentHTML('beforeend', createMemberCard(member));
    }
  });

  // Add read more event listeners
  document.querySelectorAll('.read-more-info').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      const container = this.closest('.info-content');
      const truncated = container.querySelector('.truncated');
      const full = container.querySelector('.full');
      
      if (truncated.style.display !== 'none') {
        truncated.style.display = 'none';
        full.style.display = 'inline';
        this.textContent = 'READ LESS';
      } else {
        truncated.style.display = 'inline';
        full.style.display = 'none';
        this.textContent = 'READ MORE';
      }
    });
  });

  // Update map with community markers
  addMarkersToMap(filteredMembers, 'community');
}

// Popup functions
function showAboutPopup() {
  if (!popupShown) {
    const popup = document.getElementById('aboutPopup');
    popup.classList.remove('hidden');
    popupShown = true;
  }
}

function hideAboutPopup() {
  const popup = document.getElementById('aboutPopup');
  popup.classList.add('hidden');
}

function initializePopup() {
  const closeBtn = document.getElementById('closePopup');
  const popup = document.getElementById('aboutPopup');
  
  // Close button event
  closeBtn.addEventListener('click', hideAboutPopup);
  
  // Close on background click
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      hideAboutPopup();
    }
  });
  
  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !popup.classList.contains('hidden')) {
      hideAboutPopup();
    }
  });
  
  // Popup carousel functionality
  const popupIndicators = popup.querySelectorAll('.indicator');
  const popupSlides = popup.querySelectorAll('.carousel-slide');
  
  popupIndicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      // Hide all slides
      popupSlides.forEach(slide => slide.classList.remove('active'));
      popupIndicators.forEach(ind => ind.classList.remove('active'));
      
      // Show selected slide
      popupSlides[index].classList.add('active');
      indicator.classList.add('active');
    });
  });
  
  // Auto-advance popup carousel every 8 seconds
  setInterval(() => {
    if (!popup.classList.contains('hidden')) {
      const activeIndex = Array.from(popupSlides).findIndex(slide => slide.classList.contains('active'));
      const nextIndex = (activeIndex + 1) % popupSlides.length;
      
      popupSlides.forEach(slide => slide.classList.remove('active'));
      popupIndicators.forEach(ind => ind.classList.remove('active'));
      
      popupSlides[nextIndex].classList.add('active');
      popupIndicators[nextIndex].classList.add('active');
    }
  }, 8000);
  
  // Show popup on page load
  setTimeout(showAboutPopup, 500);
}

// Mode switching
function switchMode(mode) {
  currentMode = mode;
  activeFilters.clear();
  currentPage = 0;
  
  // Update mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  
  // Update filter sections
  document.querySelectorAll('.filter-content').forEach(section => {
    section.classList.toggle('active', section.id === `${mode}Filters`);
  });
  
  // Update results sections
  document.querySelectorAll('.results-content').forEach(section => {
    section.classList.toggle('active', section.id === `${mode}Results`);
  });
  
  // Show/hide map
  const mapContainer = document.getElementById('mapContainer');
  if (mode === 'blog') {
    mapContainer.style.display = 'none';
  } else {
    mapContainer.style.display = 'block';
    if (!map) {
      initializeMap();
    }
    // Trigger map resize
    setTimeout(() => map.invalidateSize(), 100);
  }
  
  // Clear active tag filters
  document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Reset remote toggle
  document.getElementById('remoteToggle').checked = false;
  remoteOnly = false;
  
  // Update results
  updateResults();
}

// Carousel functions
function showSlide(slideIndex) {
  const slides = document.querySelectorAll('.carousel-slide');
  const indicators = document.querySelectorAll('.indicator');
  
  // Hide all slides
  slides.forEach(slide => slide.classList.remove('active'));
  indicators.forEach(indicator => indicator.classList.remove('active'));
  
  // Show current slide
  slides[slideIndex].classList.add('active');
  indicators[slideIndex].classList.add('active');
  
  currentSlide = slideIndex;
}

function nextSlide() {
  const nextIndex = (currentSlide + 1) % totalSlides;
  showSlide(nextIndex);
}

function prevSlide() {
  const prevIndex = (currentSlide - 1 + totalSlides) % totalSlides;
  showSlide(prevIndex);
}

function initializeCarousel() {
  // Carousel navigation buttons
  document.querySelector('.prev-carousel').addEventListener('click', prevSlide);
  document.querySelector('.next-carousel').addEventListener('click', nextSlide);
  
  // Carousel indicators
  document.querySelectorAll('.indicator').forEach((indicator, index) => {
    indicator.addEventListener('click', () => showSlide(index));
  });
  
  // Auto-advance carousel every 8 seconds
  setInterval(nextSlide, 8000);
}

function updateResults() {
  switch (currentMode) {
    case 'blog':
      updateBlogResults();
      break;
    case 'jobs':
      updateJobsResults();
      break;
    case 'community':
      updateCommunityResults();
      break;
  }
}

// Initialize
function initialize() {
  // Initialize popup
  initializePopup();
  
  // Initialize carousel
  initializeCarousel();
  
  // Populate blog tags
  const blogTagsContainer = document.getElementById('blogTags');
  getAllBlogTags().forEach(tag => {
    const button = document.createElement('button');
    button.className = 'tag-btn';
    button.textContent = tag.toUpperCase();
    button.dataset.tag = tag;
    blogTagsContainer.appendChild(button);
  });

  // Event listeners
  const searchInput = document.getElementById('searchInput');
  const remoteToggle = document.getElementById('remoteToggle');

  // Mode buttons
  document.querySelectorAll('.mode-btn').forEach(button => {
    button.addEventListener('click', () => {
      switchMode(button.dataset.mode);
    });
  });

  // Search input
  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    currentPage = 0;
    updateResults();
  });

  // Tag buttons
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('tag-btn')) {
      const tag = e.target.dataset.tag;
      if (activeFilters.has(tag)) {
        activeFilters.delete(tag);
        e.target.classList.remove('active');
      } else {
        activeFilters.add(tag);
        e.target.classList.add('active');
      }
      currentPage = 0;
      updateResults();
    }
  });

  // Remote toggle
  remoteToggle.addEventListener('click', () => {
    remoteOnly = !remoteOnly;
    remoteToggle.checked = remoteOnly;
    updateResults();
  });

  // Blog navigation
  document.querySelector('.prev-btn').addEventListener('click', () => {
    if (currentPage > 0) {
      currentPage--;
      updateBlogResults();
    }
  });

  document.querySelector('.next-btn').addEventListener('click', () => {
    currentPage++;
    updateBlogResults();
  });

  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (currentMode === 'blog') {
        currentPage = 0;
        updateBlogResults();
      }
      if (map) {
        map.invalidateSize();
      }
    }, 250);
  });

  // Initial render
  switchMode('blog');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initialize);