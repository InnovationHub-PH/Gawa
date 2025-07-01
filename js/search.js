import { blogPosts } from './blogData.js';
import { jobs } from './jobs.js';
import { communityMembers } from './community.js';
import { fabricationItems, machineCategories, materialCategories } from './fabrication.js';

// Import PDF.js for community member documents
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// Global state
let currentMode = 'blog';
let activeFilters = new Set();
let activeMachineCategories = new Set();
let activeMaterialCategories = new Set();
let remoteOnly = false;
let searchTerm = '';
let currentPage = 0;
let map = null;
let markers = new Map();
let currentSlide = 0;
const totalSlides = 2;
let popupShown = false;
let drawnItems = null;
let drawControl = null;
let activeSpatialFilterLayer = null;

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
    
    // Initialize drawing functionality
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    
    drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems
      },
      draw: {
        polygon: true,
        rectangle: true,
        circle: false,
        marker: false,
        polyline: false,
        circlemarker: false
      }
    });
    map.addControl(drawControl);
    
    // Event listeners for drawing
    map.on(L.Draw.Event.CREATED, handleDrawCreated);
    map.on(L.Draw.Event.DELETED, handleDrawDeleted);
    map.on(L.Draw.Event.EDITED, handleDrawEdited);
  }
}

// Handle draw events
function handleDrawCreated(e) {
  const layer = e.layer;
  
  // Clear any existing layers to ensure only one spatial filter is active
  drawnItems.clearLayers();
  
  // Add the new layer
  drawnItems.addLayer(layer);
  activeSpatialFilterLayer = layer;
  
  // Update results with spatial filter
  updateResults();
}

function handleDrawDeleted(e) {
  activeSpatialFilterLayer = null;
  updateResults();
}

function handleDrawEdited(e) {
  // Update results when shape is edited
  updateResults();
}

// Check if a point is within the drawn area
function isPointInDrawnArea(lat, lng) {
  if (!activeSpatialFilterLayer) return true;
  
  const point = L.latLng(lat, lng);
  
  if (activeSpatialFilterLayer instanceof L.Rectangle) {
    return activeSpatialFilterLayer.getBounds().contains(point);
  } else if (activeSpatialFilterLayer instanceof L.Polygon) {
    // For polygons, we need to check if point is inside the polygon
    const latLngs = activeSpatialFilterLayer.getLatLngs()[0];
    return isPointInPolygon(point, latLngs);
  }
  
  return true;
}

// Point in polygon algorithm
function isPointInPolygon(point, polygon) {
  const x = point.lat;
  const y = point.lng;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat;
    const yi = polygon[i].lng;
    const xj = polygon[j].lat;
    const yj = polygon[j].lng;
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
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
    let coords, popupContent, itemId;
    
    if (type === 'jobs' && item.coordinates) {
      coords = [item.coordinates.lat, item.coordinates.lng];
      popupContent = `<strong>${item.title}</strong><br>${item.company}<br>${item.location}`;
      itemId = `${item.title}-${item.company}`;
    } else if (type === 'community' && item.location) {
      coords = [item.location.lat, item.location.lng];
      popupContent = `<strong>${item.name}</strong><br>${item.location.address}`;
      itemId = item.name;
    } else if (type === 'fabrication' && item.location) {
      coords = [item.location.lat, item.location.lng];
      const availability = item.availability === 'available' ? '✅' : '🔴';
      popupContent = `<strong>${item.name}</strong><br>${item.owner}<br>${item.location.address}<br>${availability} ${item.availability.toUpperCase()}`;
      itemId = item.name;
    }
    
    if (coords) {
      const marker = L.marker(coords)
        .bindPopup(popupContent)
        .addTo(map);
      
      // Add click event to highlight corresponding card
      marker.on('click', () => {
        highlightCard(itemId, type);
      });
      
      markers.set(itemId, marker);
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

// Fabrication functions
function createFabricationCard(item) {
  const isAvailable = item.availability === 'available';
  const priceInfo = item.type === 'machine' 
    ? `₱${item.hourlyRate}/hour` 
    : `₱${item.price} ${item.unit}`;
  
  return `
    <div class="card fabrication-card" data-item="${item.name}" data-tags="${item.tags.join(' ')}" data-type="${item.type}" data-category="${item.category}">
      <div class="card-header">
        <img src="${item.image}" alt="${item.name}" class="card-logo">
        <div class="title-info">
          <h3>${item.name}</h3>
          <h4>${item.owner}</h4>
          <p class="location">${item.location.address}</p>
        </div>
      </div>
      <div class="fabrication-info">
        <div class="availability-status ${isAvailable ? 'available' : 'busy'}">
          ${isAvailable ? 'AVAILABLE' : 'BUSY'}
        </div>
        <div class="price-info">${priceInfo}</div>
        <p class="description">${item.description}</p>
        <p class="contact-info">Contact: <a href="mailto:${item.contact}">${item.contact}</a></p>
      </div>
      <div class="tags">
        ${item.tags.map(tag => `<span class="tag">${tag.toUpperCase()}</span>`).join('')}
      </div>
    </div>
  `;
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

  const pdfPreview = member.pdfDocument ? `
    <div class="pdf-preview" data-pdf-url="${member.pdfDocument}">
      <canvas class="pdf-thumbnail"></canvas>
      <button class="view-pdf-btn">View Document</button>
    </div>
  ` : '';

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
      ${pdfPreview}
      <div class="tags">
        ${member.tags.map(tag => `<span class="tag">${tag.toUpperCase()}</span>`).join('')}
      </div>
    </div>
  `;
}

// Update functions
// Highlight functions
function highlightCard(itemId, type) {
  // Remove previous highlights
  document.querySelectorAll('.card.highlighted').forEach(card => {
    card.classList.remove('highlighted');
  });
  
  let selector;
  if (type === 'jobs') {
    // For jobs, we need to find by title and company
    const cards = document.querySelectorAll('#jobsList .card');
    cards.forEach(card => {
      const title = card.querySelector('h3').textContent;
      const company = card.querySelector('h4').textContent;
      const cardId = `${title}-${company}`;
      if (cardId === itemId) {
        card.classList.add('highlighted');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  } else if (type === 'community') {
    // For community, find by member name
    const memberCard = document.querySelector(`.member-card[data-member="${itemId}"]`);
    if (memberCard) {
      memberCard.classList.add('highlighted');
      memberCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

function highlightMarker(itemId) {
  const marker = markers.get(itemId);
  if (marker) {
    marker.openPopup();
    // Center map on marker
    map.setView(marker.getLatLng(), map.getZoom());
  }
}

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
  // First filter by spatial area if one is drawn
  let spatiallyFilteredJobs = jobs;
  if (activeSpatialFilterLayer) {
    spatiallyFilteredJobs = jobs.filter(job => {
      if (!job.coordinates) return false;
      return isPointInDrawnArea(job.coordinates.lat, job.coordinates.lng);
    });
  }
  
  const filteredJobs = spatiallyFilteredJobs.filter(job => {
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

  // Add click event listeners to job cards for map highlighting
  document.querySelectorAll('#jobsList .card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking on buttons or links
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
      
      const title = card.querySelector('h3').textContent;
      const company = card.querySelector('h4').textContent;
      const itemId = `${title}-${company}`;
      
      // Highlight this card
      document.querySelectorAll('.card.highlighted').forEach(c => c.classList.remove('highlighted'));
      card.classList.add('highlighted');
      
      // Highlight corresponding marker
      highlightMarker(itemId);
    });
  });

  // Update map with job markers
  addMarkersToMap(filteredJobs, 'jobs');
}

function updateCommunityResults() {
  // First filter by spatial area if one is drawn
  let spatiallyFilteredMembers = communityMembers;
  if (activeSpatialFilterLayer) {
    spatiallyFilteredMembers = communityMembers.filter(member => {
      if (!member.location) return false;
      return isPointInDrawnArea(member.location.lat, member.location.lng);
    });
  }
  
  const filteredMembers = spatiallyFilteredMembers.filter(member => {
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

  // Initialize PDF previews
  initializePdfPreviews();

  // Add click event listeners to community cards for map highlighting
  document.querySelectorAll('.member-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking on buttons or links
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button') || e.target.closest('a')) return;
      
      const memberName = card.dataset.member;
      
      // Highlight this card
      document.querySelectorAll('.card.highlighted').forEach(c => c.classList.remove('highlighted'));
      card.classList.add('highlighted');
      
      // Highlight corresponding marker
      highlightMarker(memberName);
    });
  });

  // Update map with community markers
  addMarkersToMap(filteredMembers, 'community');
}

function updateFabricationResults() {
  // First filter by spatial area if one is drawn
  let spatiallyFilteredItems = fabricationItems;
  if (activeSpatialFilterLayer) {
    spatiallyFilteredItems = fabricationItems.filter(item => {
      if (!item.location) return false;
      return isPointInDrawnArea(item.location.lat, item.location.lng);
    });
  }
  
  const filteredItems = spatiallyFilteredItems.filter(item => {
    const matchesSearch = (
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    if (!matchesSearch) return false;
    
    // Filter by machine categories
    if (activeMachineCategories.size > 0 && item.type === 'machine') {
      if (!activeMachineCategories.has(item.category)) return false;
    }
    
    // Filter by material categories
    if (activeMaterialCategories.size > 0 && item.type === 'material') {
      if (!activeMaterialCategories.has(item.category)) return false;
    }
    
    // If both filters are active but item doesn't match either type
    if ((activeMachineCategories.size > 0 || activeMaterialCategories.size > 0)) {
      if (item.type === 'machine' && activeMachineCategories.size === 0) return false;
      if (item.type === 'material' && activeMaterialCategories.size === 0) return false;
    }
    
    return true;
  });

  // Clear grids
  document.querySelector('.machines-grid').innerHTML = '';
  document.querySelector('.materials-grid').innerHTML = '';

  filteredItems.forEach(item => {
    let targetGrid;
    if (item.type === 'machine') {
      targetGrid = document.querySelector('.machines-grid');
    } else if (item.type === 'material') {
      targetGrid = document.querySelector('.materials-grid');
    }
    
    if (targetGrid) {
      targetGrid.insertAdjacentHTML('beforeend', createFabricationCard(item));
    }
  });

  // Add click event listeners to fabrication cards for map highlighting
  document.querySelectorAll('.fabrication-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking on buttons or links
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button') || e.target.closest('a')) return;
      
      const itemName = card.dataset.item;
      
      // Highlight this card
      document.querySelectorAll('.card.highlighted').forEach(c => c.classList.remove('highlighted'));
      card.classList.add('highlighted');
      
      // Highlight corresponding marker
      highlightMarker(itemName);
    });
  });

  // Update map with fabrication markers
  addMarkersToMap(filteredItems, 'fabrication');
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

// PDF Preview functionality
const modal = document.createElement('div');
modal.className = 'pdf-modal';
modal.innerHTML = `
  <div class="pdf-modal-content">
    <button class="close-modal">&times;</button>
    <button class="nav-btn prev-page">←</button>
    <canvas id="pdf-canvas"></canvas>
    <button class="nav-btn next-page">→</button>
    <div class="page-info">Page <span id="current-page">1</span> of <span id="total-pages">1</span></div>
  </div>
`;
document.body.appendChild(modal);

let currentPdf = null;
let currentPdfPage = 1;

async function showPdfPreview(pdfUrl, pageNumber = 1) {
  try {
    if (!currentPdf) {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      currentPdf = await loadingTask.promise;
    }

    const page = await currentPdf.getPage(pageNumber);
    const canvas = document.getElementById('pdf-canvas');
    const context = canvas.getContext('2d');

    const viewport = page.getViewport({ scale: 1.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    document.getElementById('current-page').textContent = pageNumber;
    document.getElementById('total-pages').textContent = currentPdf.numPages;
    modal.style.display = 'flex';
  } catch (error) {
    console.error('Error loading PDF:', error);
  }
}

// Event listeners for modal navigation
document.querySelector('.close-modal').addEventListener('click', () => {
  modal.style.display = 'none';
  currentPdf = null;
  currentPdfPage = 1;
});

document.querySelector('.prev-page').addEventListener('click', () => {
  if (currentPdfPage > 1) {
    currentPdfPage--;
    showPdfPreview(currentPdf.url, currentPdfPage);
  }
});

document.querySelector('.next-page').addEventListener('click', () => {
  if (currentPdfPage < currentPdf.numPages) {
    currentPdfPage++;
    showPdfPreview(currentPdf.url, currentPdfPage);
  }
});

function initializePdfPreviews() {
  document.querySelectorAll('.pdf-preview').forEach(async (preview) => {
    const pdfUrl = preview.dataset.pdfUrl;
    const canvas = preview.querySelector('.pdf-thumbnail');
    const viewBtn = preview.querySelector('.view-pdf-btn');

    try {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      
      const viewport = page.getViewport({ scale: 0.5 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: canvas.getContext('2d'),
        viewport: viewport
      }).promise;

      viewBtn.addEventListener('click', () => showPdfPreview(pdfUrl));
    } catch (error) {
      console.error('Error loading PDF preview:', error);
    }
  });
}

// Mode switching
function switchMode(mode) {
  currentMode = mode;
  activeFilters.clear();
  activeMachineCategories.clear();
  activeMaterialCategories.clear();
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
    case 'fabrication':
      updateFabricationResults();
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
  const machineSelect = document.getElementById('machineSelect');
  const materialSelect = document.getElementById('materialSelect');

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

  // Dropdown change handlers
  if (machineSelect) {
    machineSelect.addEventListener('change', (e) => {
      const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
      activeMachineCategories.clear();
      selectedOptions.forEach(option => {
        if (option) activeMachineCategories.add(option);
      });
      updateResults();
    });
  }

  if (materialSelect) {
    materialSelect.addEventListener('change', (e) => {
      const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
      activeMaterialCategories.clear();
      selectedOptions.forEach(option => {
        if (option) activeMaterialCategories.add(option);
      });
      updateResults();
    });
  }

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
  
  // Initialize mobile dropdown collapse functionality
  initializeMobileDropdowns();
}

// Mobile dropdown collapse functionality
function initializeMobileDropdowns() {
  const dropdownFilters = document.querySelectorAll('.dropdown-filter');
  
  dropdownFilters.forEach(filter => {
    const header = filter.querySelector('h3');
    
    // Set initial collapsed state on mobile
    function updateCollapseState() {
      if (window.innerWidth <= 768) {
        filter.classList.add('collapsed');
      } else {
        filter.classList.remove('collapsed');
      }
    }
    
    // Initial state
    updateCollapseState();
    
    // Handle window resize
    window.addEventListener('resize', updateCollapseState);
    
    // Handle click to toggle
    header.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        filter.classList.toggle('collapsed');
      }
    });
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initialize);