import { db } from './supabase.js';
import { blogPosts } from './blogData.js';

// Job data (keeping existing structure)
const jobs = [
  {
    title: 'Job Title',
    company: 'Company Name',
    logo: 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png',
    location: 'Makati, MNL',
    coordinates: { lat: 14.5547, lng: 120.9947 },
    remote: false,
    tags: ['robotics', 'hardware'],
    description: 'Describe the Job openning here...'
  },
  {
    title: 'Software Developer',
    company: 'Remote Robotics',
    logo: 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png',
    location: 'Remote',
    coordinates: { lat: 14.5995, lng: 120.9842 },
    remote: true,
    tags: ['software', 'robotics'],
    description: 'Developing control systems for autonomous robots. We are looking for a skilled software developer with experience in robotics and control systems. The ideal candidate will have a strong background in Python, C++, and ROS. You will be working with a team of engineers to develop and implement control algorithms for our autonomous robot fleet. Key responsibilities include: developing and maintaining robot control software, implementing new features and functionality, debugging and troubleshooting issues, and collaborating with the hardware team.'
  },
  {
    title: 'Mechatronics Intern',
    company: 'Innovation Labs',
    logo: 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png',
    location: 'Boston, MA',
    coordinates: { lat: 14.558, lng: 120.989 },
    remote: false,
    tags: ['internship', 'hardware', 'software'],
    description: 'Summer internship opportunity in our robotics division. Join our team of experts and gain hands-on experience in robotics development.'
  },
  {
    title: 'Control Systems Engineer',
    company: 'Virtual Mechanics',
    logo: 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png',
    location: 'Remote',
    coordinates: { lat: 14.5648, lng: 120.9932 },
    remote: true,
    tags: ['software', 'hardware'],
    description: 'Design and implement control systems for industrial robots. Work with cutting-edge technology and collaborate with a global team.'
  }
];

// Fabrication data (keeping existing structure)
const fabricationItems = [
  {
    id: 1,
    name: '3D Printer - Prusa i3 MK3S+',
    type: 'machine',
    category: '3d-printer',
    owner: 'TechLabs Manila',
    location: {
      lat: 14.5547,
      lng: 120.9947,
      address: 'Makati City, Philippines'
    },
    availability: 'available',
    hourlyRate: 150,
    description: 'High-quality FDM 3D printer capable of printing PLA, PETG, and ABS materials. Build volume: 250×210×210mm.',
    contact: 'contact@techlabs.ph',
    image: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg',
    tags: ['3d-printing', 'prototyping', 'fdm']
  },
  {
    id: 2,
    name: 'Laser Cutter - Epilog Zing 24',
    type: 'machine',
    category: 'laser-cutter',
    owner: 'Innovation Labs',
    location: {
      lat: 14.5580,
      lng: 120.9890,
      address: 'BGC, Taguig City, Philippines'
    },
    availability: 'available',
    hourlyRate: 300,
    description: 'CO2 laser cutter for wood, acrylic, paper, and fabric. Cutting area: 610×305mm, 30W laser.',
    contact: 'info@innovationlabs.ph',
    image: 'https://images.pexels.com/photos/5691659/pexels-photo-5691659.jpeg',
    tags: ['laser-cutting', 'engraving', 'prototyping']
  },
  {
    id: 3,
    name: 'CNC Mill - Haas Mini Mill',
    type: 'machine',
    category: 'cnc-mill',
    owner: 'Precision Works',
    location: {
      lat: 14.5648,
      lng: 120.9932,
      address: 'Manila, Philippines'
    },
    availability: 'busy',
    hourlyRate: 500,
    description: 'Precision CNC milling machine for aluminum, steel, and plastic parts. 3-axis machining.',
    contact: 'orders@precisionworks.ph',
    image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg',
    tags: ['cnc', 'machining', 'metal-working']
  },
  {
    id: 4,
    name: 'PLA Filament - Various Colors',
    type: 'material',
    category: 'filament',
    owner: 'Maker Supply Co.',
    location: {
      lat: 14.5695,
      lng: 120.9822,
      address: 'Quezon City, Philippines'
    },
    availability: 'available',
    price: 25,
    unit: 'per kg',
    description: 'High-quality PLA filament in multiple colors. Diameter: 1.75mm. Perfect for 3D printing.',
    contact: 'sales@makersupply.ph',
    image: 'https://images.pexels.com/photos/6069112/pexels-photo-6069112.jpeg',
    tags: ['3d-printing', 'filament', 'pla']
  },
  {
    id: 5,
    name: 'Acrylic Sheets - Clear & Colored',
    type: 'material',
    category: 'acrylic',
    owner: 'Plastic Solutions',
    location: {
      lat: 14.5542,
      lng: 120.9965,
      address: 'Pasig City, Philippines'
    },
    availability: 'available',
    price: 120,
    unit: 'per sheet',
    description: 'High-grade acrylic sheets, 3mm thickness. Available in clear and various colors. Perfect for laser cutting.',
    contact: 'info@plasticsolutions.ph',
    image: 'https://images.pexels.com/photos/6069112/pexels-photo-6069112.jpeg',
    tags: ['laser-cutting', 'acrylic', 'sheets']
  },
  {
    id: 6,
    name: 'Arduino Starter Kit',
    type: 'material',
    category: 'electronics',
    owner: 'Electronics Hub',
    location: {
      lat: 14.5907,
      lng: 120.9748,
      address: 'Manila, Philippines'
    },
    availability: 'available',
    price: 1500,
    unit: 'per kit',
    description: 'Complete Arduino starter kit with Uno R3, breadboard, sensors, LEDs, resistors, and jumper wires.',
    contact: 'support@electronicshub.ph',
    image: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg',
    tags: ['electronics', 'arduino', 'prototyping']
  }
];

// Global variables
let map = null;
let markers = new Map();
let currentMode = 'blog';
let activeFilters = new Set();
let mobileActiveFilters = new Set();
let mobileBlogFilters = new Set();
let mobileJobsFilters = new Set();
let mobileFabricationFilters = new Set();
let machineFilters = new Set();
let materialFilters = new Set();
let remoteOnly = false;
let searchTerm = '';
let currentPage = 0;
let drawingLayer = null;
let drawControl = null;
let drawnItems = null;
let selectedArea = null;
let communityMembers = []; // Will be populated from Supabase
let currentScrollY = 0;
let isMapMinimized = false;
let aboutPopupShown = false;

// Initialize PDF.js
let pdfjsLib = null;
let pdfWorkerLoaded = false;

async function loadPdfJs() {
  if (!pdfjsLib) {
    try {
      pdfjsLib = await import('pdfjs-dist');
      if (!pdfWorkerLoaded) {
        const pdfWorker = await import('pdfjs-dist/build/pdf.worker?url');
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker.default;
        pdfWorkerLoaded = true;
      }
    } catch (error) {
      console.warn('PDF.js not available:', error);
    }
  }
  return pdfjsLib;
}

// Utility functions
function truncateWords(text, wordCount) {
  const words = text.split(' ');
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(' ') + '...';
}

// Initialize map
function initializeMap() {
  if (!map) {
    if (typeof L === 'undefined') {
      console.error('Leaflet library not loaded');
      return;
    }

    map = L.map('searchMap').setView([14.5995, 120.9842], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Initialize drawing controls if Leaflet Draw is available
    if (typeof L.Draw !== 'undefined') {
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

      map.on(L.Draw.Event.CREATED, handleDrawCreated);
      map.on(L.Draw.Event.DELETED, handleDrawDeleted);
      map.on(L.Draw.Event.EDITED, handleDrawEdited);
    } else {
      console.warn('Leaflet Draw not available - drawing features disabled');
    }
  }
}

function handleDrawCreated(e) {
  const layer = e.layer;
  drawnItems.clearLayers();
  drawnItems.addLayer(layer);
  selectedArea = layer;
  updateResults();
}

function handleDrawDeleted(e) {
  selectedArea = null;
  updateResults();
}

function handleDrawEdited(e) {
  updateResults();
}

// Check if point is within selected area
function isPointInSelectedArea(lat, lng) {
  if (!selectedArea) return true;

  const point = L.latLng(lat, lng);
  
  if (selectedArea instanceof L.Rectangle) {
    return selectedArea.getBounds().contains(point);
  } else if (selectedArea instanceof L.Polygon) {
    const polygonPoints = selectedArea.getLatLngs()[0];
    return isPointInPolygon(point, polygonPoints);
  }
  
  return true;
}

// Point in polygon algorithm
function isPointInPolygon(point, polygon) {
  const lat = point.lat;
  const lng = point.lng;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat;
    const yi = polygon[i].lng;
    const xj = polygon[j].lat;
    const yj = polygon[j].lng;

    if (((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi)) {
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
    let coordinates, popupContent, itemId;
    
    if (type === 'jobs' && item.coordinates) {
      coordinates = [item.coordinates.lat, item.coordinates.lng];
      popupContent = `<strong>${item.title}</strong><br>${item.company}<br>${item.location}`;
      itemId = `${item.title}-${item.company}`;
    } else if (type === 'community' && item.location) {
      // For community members from Supabase, we don't have coordinates
      // Skip adding markers since we only have text location
      return;
    } else if (type === 'fabrication' && item.location) {
      coordinates = [item.location.lat, item.location.lng];
      const statusIcon = item.availability === 'available' ? '✅' : '🔴';
      popupContent = `<strong>${item.name}</strong><br>${item.owner}<br>${item.location.address}<br>${statusIcon} ${item.availability.toUpperCase()}`;
      itemId = item.name;
    }
    
    if (coordinates) {
      const marker = L.marker(coordinates)
        .bindPopup(popupContent)
        .addTo(map);
      
      marker.on('click', () => {
        highlightItem(itemId, type);
      });
      
      markers.set(itemId, marker);
    }
  });
}

// Get unique blog tags
function getBlogTags() {
  const tags = new Set();
  blogPosts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags);
}

// Create fabrication card
function createFabricationCard(item) {
  const isAvailable = item.availability === 'available';
  const priceText = item.type === 'machine' 
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
        <div class="price-info">${priceText}</div>
        <p class="description">${item.description}</p>
        <p class="contact-info">Contact: <a href="mailto:${item.contact}">${item.contact}</a></p>
      </div>
      <div class="tags">
        ${item.tags.map(tag => `<span class="tag">${tag.toUpperCase()}</span>`).join('')}
      </div>
    </div>
  `;
}

// Create blog card
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

// Create job card
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
        ${!isExpanded ? '<button class="read-more">READ MORE</button>' : ''}
      </div>
      <a href="#" class="sqr-btn">APPLY NOW</a>
    </div>
  `;
}

// Create community member card
function createCommunityCard(member) {
  // Map account_type to category for display
  const categoryMap = {
    'person': 'INDIVIDUALS',
    'business': 'COMPANIES', 
    'education': 'EDUCATIONAL INSTITUTIONS'
  };
  
  const category = categoryMap[member.account_type] || 'INDIVIDUALS';
  const displayName = member.full_name || member.username || 'Unknown User';
  const bio = member.bio || 'No bio available';
  const location = member.city || '';
  
  // Create basic tags based on account type and categories
  const tags = [member.account_type || 'person'];
  
  // Add certified badge if applicable
  const certifiedBadge = member.is_certified ? '<span class="profile-certified-badge">CERTIFIED</span>' : '';
  
  return `
    <div class="card member-card" data-member="${displayName}" data-tags="${tags.join(' ')}" data-category="${category}">
      <div class="card-header">
        <img src="${member.avatar_url || 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png'}" alt="${displayName}" class="card-logo">
        <div class="title-info">
          <h3>${displayName}${certifiedBadge}</h3>
          ${member.username ? `<h4>@${member.username}</h4>` : ''}
          ${location ? `<p class="member-location">${location}</p>` : ''}
        </div>
      </div>
      <div class="member-info">
        <p class="bio">${bio}</p>
        <p class="member-since">Member since: ${new Date(member.created_at).toLocaleDateString()}</p>
      </div>
      <div class="tags">
        ${tags.map(tag => `<span class="tag">${tag.toUpperCase()}</span>`).join('')}
      </div>
      <a href="profile.html?id=${member.id}" class="sqr-btn view-profile-btn">VIEW PROFILE</a>
    </div>
  `;
}

// Highlight item on map and in results
function highlightItem(itemId, type) {
  // Remove previous highlights
  document.querySelectorAll('.card.highlighted').forEach(card => {
    card.classList.remove('highlighted');
  });
  
  if (type === 'jobs') {
    document.querySelectorAll('#jobsList .card').forEach(card => {
      const title = card.querySelector('h3').textContent;
      const company = card.querySelector('h4').textContent;
      if (`${title}-${company}` === itemId) {
        card.classList.add('highlighted');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  } else if (type === 'community') {
    const memberCard = document.querySelector(`.member-card[data-member="${itemId}"]`);
    if (memberCard) {
      memberCard.classList.add('highlighted');
      memberCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

// Focus on map marker
function focusMapMarker(itemId) {
  const marker = markers.get(itemId);
  if (marker) {
    marker.openPopup();
    map.setView(marker.getLatLng(), map.getZoom());
  }
}

// Load community members from Supabase
async function loadCommunityMembers() {
  try {
    console.log('Loading community members from Supabase...');
    const { data, error } = await db.getAllProfiles();
    
    if (error) {
      console.error('Error loading community members:', error);
      communityMembers = []; // Fallback to empty array
      return;
    }
    
    communityMembers = data || [];
    console.log(`Loaded ${communityMembers.length} community members from Supabase`);
    
    // Update community results if we're currently viewing community
    if (currentMode === 'community') {
      updateCommunityResults();
    }
  } catch (error) {
    console.error('Failed to load community members:', error);
    communityMembers = []; // Fallback to empty array
  }
}

// Update blog results
function updateBlogResults() {
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTags = 
      (window.innerWidth <= 768 && currentMode === 'blog' ? mobileBlogFilters : activeFilters).size === 0 || 
      post.tags.some(tag => (window.innerWidth <= 768 && currentMode === 'blog' ? mobileBlogFilters : activeFilters).has(tag));

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
  
  // Add event listeners to read more buttons
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

  // Highlight code blocks
  if (typeof Prism !== 'undefined') {
    Prism.highlightAll();
  }
}

// Update job results
function updateJobResults() {
  let filteredJobs = jobs;
  
  // Apply area filter if selected
  if (selectedArea) {
    filteredJobs = jobs.filter(job => 
      job.coordinates ? isPointInSelectedArea(job.coordinates.lat, job.coordinates.lng) : false
    );
  }
  
  filteredJobs = filteredJobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (remoteOnly && !job.remote) return false;
    
    const matchesTags = (window.innerWidth <= 768 && currentMode === 'jobs' ? mobileJobsFilters : activeFilters).size === 0 || 
                       job.tags.some(tag => (window.innerWidth <= 768 && currentMode === 'jobs' ? mobileJobsFilters : activeFilters).has(tag));
    
    return matchesTags;
  });

  document.getElementById('jobsList').innerHTML = filteredJobs.map(createJobCard).join('');
  
  // Add event listeners to read more buttons
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

  // Add click handlers for job cards
  document.querySelectorAll('#jobsList .card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
      
      const title = card.querySelector('h3').textContent;
      const company = card.querySelector('h4').textContent;
      const itemId = `${title}-${company}`;
      
      document.querySelectorAll('.card.highlighted').forEach(c => c.classList.remove('highlighted'));
      card.classList.add('highlighted');
      focusMapMarker(itemId);
    });
  });

  addMarkersToMap(filteredJobs, 'jobs');
}

// Initialize mobile filter popup
function initializeMobileFilterPopup() {
  const communityTrigger = document.getElementById('communityFilterTrigger');
  const blogTrigger = document.getElementById('blogFilterTrigger');
  const jobsTrigger = document.getElementById('jobsFilterTrigger');
  const fabricationTrigger = document.getElementById('fabricationFilterTrigger');
  const popup = document.getElementById('mobileFilterPopup');
  const closeBtn = document.getElementById('mobileFilterClose');
  const optionsContainer = document.getElementById('mobileFilterOptions');
  const titleElement = document.getElementById('mobileFilterTitle');

  let currentFilterMode = '';

  communityTrigger.addEventListener('click', () => {
    currentFilterMode = 'community';
    titleElement.textContent = 'SELECT COMMUNITY FILTERS';
    showMobileFilterPopup();
  });

  blogTrigger.addEventListener('click', () => {
    currentFilterMode = 'blog';
    titleElement.textContent = 'SELECT BLOG FILTERS';
    showMobileFilterPopup();
  });

  jobsTrigger.addEventListener('click', () => {
    currentFilterMode = 'jobs';
    titleElement.textContent = 'SELECT JOB FILTERS';
    showMobileFilterPopup();
  });

  fabricationTrigger.addEventListener('click', () => {
    currentFilterMode = 'fabrication';
    titleElement.textContent = 'SELECT FABRICATION FILTERS';
    showMobileFilterPopup();
  });

  function showMobileFilterPopup() {
    popup.classList.add('active');
    populateMobileFilterOptions(currentFilterMode);
  }

  function getFilterOptions(mode) {
    switch (mode) {
      case 'community':
        return [
          { tag: 'business', label: 'COMPANIES' },
          { tag: 'person', label: 'INDIVIDUALS' },
          { tag: 'education', label: 'EDUCATION' }
        ];
      case 'blog':
        return getBlogTags().map(tag => ({ tag, label: tag.toUpperCase() }));
      case 'jobs':
        return [
          { tag: 'robotics', label: 'ROBOTICS' },
          { tag: 'software', label: 'SOFTWARE' },
          { tag: 'hardware', label: 'HARDWARE' },
          { tag: 'internship', label: 'INTERNSHIP' },
          { tag: 'industrial-design', label: 'INDUSTRIAL DESIGN' },
          { tag: 'manufacturing', label: 'MANUFACTURING' },
          { tag: 'mechatronics', label: 'MECHATRONICS' }
        ];
      case 'fabrication':
        return [
          { tag: '3d-printer', label: '3D PRINTERS' },
          { tag: 'laser-cutter', label: 'LASER CUTTERS' },
          { tag: 'cnc-mill', label: 'CNC MILLS' },
          { tag: 'cnc-router', label: 'CNC ROUTERS' },
          { tag: 'filament', label: 'FILAMENTS' },
          { tag: 'acrylic', label: 'ACRYLIC' },
          { tag: 'wood', label: 'WOOD' },
          { tag: 'electronics', label: 'ELECTRONICS' }
        ];
      default:
        return [];
    }
  }

  function getActiveFiltersForMode(mode) {
    switch (mode) {
      case 'community':
        return mobileActiveFilters;
      case 'blog':
        return mobileBlogFilters;
      case 'jobs':
        return mobileJobsFilters;
      case 'fabrication':
        return mobileFabricationFilters;
      default:
        return new Set();
    }
  }

  function getSelectedFiltersContainer(mode) {
    switch (mode) {
      case 'community':
        return document.getElementById('selectedFilters');
      case 'blog':
        return document.getElementById('selectedBlogFilters');
      case 'jobs':
        return document.getElementById('selectedJobsFilters');
      case 'fabrication':
        return document.getElementById('selectedFabricationFilters');
      default:
        return null;
    }
  }

  function populateMobileFilterOptions(mode) {
    const options = getFilterOptions(mode);
    const activeFilters = getActiveFiltersForMode(mode);
    
    optionsContainer.innerHTML = options.map(option => `
      <button class="mobile-filter-option ${activeFilters.has(option.tag) ? 'selected' : ''}" data-tag="${option.tag}">
        ${option.label}
      </button>
    `).join('');
  }

  function updateSelectedFiltersDisplay(mode) {
    const container = getSelectedFiltersContainer(mode);
    const activeFilters = getActiveFiltersForMode(mode);
    
    if (container) {
      container.innerHTML = '';
      activeFilters.forEach(tag => {
        const filterTag = document.createElement('div');
        filterTag.className = 'selected-filter-tag';
        filterTag.innerHTML = `
          ${tag.toUpperCase()}
          <button class="remove-filter" data-tag="${tag}" data-mode="${mode}">×</button>
        `;
        container.appendChild(filterTag);
      });

      // Add event listeners to remove buttons
      container.querySelectorAll('.remove-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const tag = e.target.dataset.tag;
          const mode = e.target.dataset.mode;
          getActiveFiltersForMode(mode).delete(tag);
          updateSelectedFiltersDisplay(mode);
          updateResults();
        });
      });
    }
  }

  function updateAllSelectedFiltersDisplays() {
    updateSelectedFiltersDisplay('community');
    updateSelectedFiltersDisplay('blog');
    updateSelectedFiltersDisplay('jobs');
    updateSelectedFiltersDisplay('fabrication');
  }

  optionsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('mobile-filter-option')) {
      const tag = e.target.dataset.tag;
      const activeFilters = getActiveFiltersForMode(currentFilterMode);
      
      if (activeFilters.has(tag)) {
        activeFilters.delete(tag);
        e.target.classList.remove('selected');
      } else {
        activeFilters.add(tag);
        e.target.classList.add('selected');
      }
      
      updateSelectedFiltersDisplay(currentFilterMode);
      updateResults();
    }
  });

  closeBtn.addEventListener('click', () => {
    popup.classList.remove('active');
  });

  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      popup.classList.remove('active');
    }
  });

  // Initialize selected filters display
  updateAllSelectedFiltersDisplays();
}

// Update community results
function updateCommunityResults() {
  let filteredMembers = communityMembers;
  
  // Apply search filter
  filteredMembers = filteredMembers.filter(member => {
    const searchableText = [
      member.full_name || '',
      member.username || '',
      member.bio || '',
      member.account_type || ''
    ].join(' ').toLowerCase();
    
    return searchableText.includes(searchTerm.toLowerCase());
  });
  
  // Apply tag filters
  const activeTagFilters = window.innerWidth <= 768 && currentMode === 'community' ? mobileActiveFilters : activeFilters;
  if (activeTagFilters.size > 0) {
    filteredMembers = filteredMembers.filter(member => {
      return activeTagFilters.has(member.account_type);
    });
  }

  // Clear existing content
  document.querySelector('.companies-grid').innerHTML = '';
  document.querySelector('.individuals-grid').innerHTML = '';
  document.querySelector('.education-grid').innerHTML = '';

  // Group members by category and render
  filteredMembers.forEach(member => {
    const categoryMap = {
      'business': '.companies-grid',
      'person': '.individuals-grid', 
      'education': '.education-grid'
    };
    
    const gridSelector = categoryMap[member.account_type] || '.individuals-grid';
    const grid = document.querySelector(gridSelector);
    
    if (grid) {
      grid.insertAdjacentHTML('beforeend', createCommunityCard(member));
    }
  });

  // Add click handlers for member cards
  document.querySelectorAll('.member-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button') || e.target.closest('a')) return;
      
      const memberName = card.dataset.member;
      document.querySelectorAll('.card.highlighted').forEach(c => c.classList.remove('highlighted'));
      card.classList.add('highlighted');
      focusMapMarker(memberName);
    });
  });

  // Since community members from Supabase don't have coordinates, we don't add map markers
  // addMarkersToMap(filteredMembers, 'community');
}

// Update fabrication results
function updateFabricationResults() {
  let filteredItems = fabricationItems;
  
  // Apply area filter if selected
  if (selectedArea) {
    filteredItems = fabricationItems.filter(item => 
      item.location ? isPointInSelectedArea(item.location.lat, item.location.lng) : false
    );
  }
  
  filteredItems = filteredItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    // Apply mobile or desktop filters
    if (window.innerWidth <= 768 && currentMode === 'fabrication') {
      if (mobileFabricationFilters.size > 0) {
        const matchesCategory = mobileFabricationFilters.has(item.category);
        const matchesTags = item.tags.some(tag => mobileFabricationFilters.has(tag));
        if (!matchesCategory && !matchesTags) return false;
      }
    } else {
      // Desktop filters
      const combinedFilters = new Set([...machineFilters, ...materialFilters]);
      if (machineFilters.size > 0 && item.type === 'machine' && !machineFilters.has(item.category)) return false;
      if (materialFilters.size > 0 && item.type === 'material' && !materialFilters.has(item.category)) return false;
      if ((machineFilters.size > 0 || materialFilters.size > 0) && 
          ((item.type === 'machine' && machineFilters.size === 0) || 
           (item.type === 'material' && materialFilters.size === 0))) return false;
    }
    
    return true;
  });

  // Clear existing content
  document.querySelector('.machines-grid').innerHTML = '';
  document.querySelector('.materials-grid').innerHTML = '';

  // Group items by type and render
  filteredItems.forEach(item => {
    const grid = item.type === 'machine' 
      ? document.querySelector('.machines-grid')
      : document.querySelector('.materials-grid');
    
    if (grid) {
      grid.insertAdjacentHTML('beforeend', createFabricationCard(item));
    }
  });

  // Add click handlers for fabrication cards
  document.querySelectorAll('.fabrication-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button') || e.target.closest('a')) return;
      
      const itemName = card.dataset.item;
      document.querySelectorAll('.card.highlighted').forEach(c => c.classList.remove('highlighted'));
      card.classList.add('highlighted');
      focusMapMarker(itemName);
    });
  });

  addMarkersToMap(filteredItems, 'fabrication');
}

// Show about popup
function showAboutPopup() {
  if (!aboutPopupShown) {
    document.getElementById('aboutPopup').classList.remove('hidden');
    aboutPopupShown = true;
  }
}

// Hide about popup
function hideAboutPopup() {
  document.getElementById('aboutPopup').classList.add('hidden');
}

// Initialize about popup
function initializeAboutPopup() {
  const closeBtn = document.getElementById('closePopup');
  const popup = document.getElementById('aboutPopup');
  
  closeBtn.addEventListener('click', hideAboutPopup);
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      hideAboutPopup();
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !popup.classList.contains('hidden')) {
      hideAboutPopup();
    }
  });

  // Carousel functionality
  const indicators = popup.querySelectorAll('.indicator');
  const slides = popup.querySelectorAll('.carousel-slide');
  
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      slides.forEach(slide => slide.classList.remove('active'));
      indicators.forEach(ind => ind.classList.remove('active'));
      slides[index].classList.add('active');
      indicator.classList.add('active');
    });
  });

  // Auto-advance carousel
  setInterval(() => {
    if (!popup.classList.contains('hidden')) {
      const currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains('active'));
      const nextIndex = (currentIndex + 1) % slides.length;
      slides.forEach(slide => slide.classList.remove('active'));
      indicators.forEach(ind => ind.classList.remove('active'));
      slides[nextIndex].classList.add('active');
      indicators[nextIndex].classList.add('active');
    }
  }, 8000);

  // Show popup after a delay
  setTimeout(showAboutPopup, 500);
}

// PDF modal functionality
const pdfModal = document.createElement('div');
pdfModal.className = 'pdf-modal';
pdfModal.innerHTML = `
  <div class="pdf-modal-content">
    <button class="close-modal">&times;</button>
    <button class="nav-btn prev-page">←</button>
    <canvas id="pdf-canvas"></canvas>
    <button class="nav-btn next-page">→</button>
    <div class="page-info">Page <span id="current-page">1</span> of <span id="total-pages">1</span></div>
  </div>
`;
document.body.appendChild(pdfModal);

let currentPdf = null;
let currentPdfPage = 1;

async function showPdfPreview(pdfUrl, pageNumber = 1) {
  try {
    const pdfLib = await loadPdfJs();
    if (!pdfLib) {
      console.error('PDF.js not available');
      return;
    }
    
    if (!currentPdf) {
      const loadingTask = pdfLib.getDocument(pdfUrl);
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
    pdfModal.style.display = 'flex';
  } catch (error) {
    console.error('Error loading PDF:', error);
  }
}

document.querySelector('.close-modal').addEventListener('click', () => {
  pdfModal.style.display = 'none';
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

// Initialize PDF previews
function initializePdfPreviews() {
  document.querySelectorAll('.pdf-preview').forEach(async (preview) => {
    const pdfUrl = preview.dataset.pdfUrl;
    const canvas = preview.querySelector('.pdf-thumbnail');
    const viewBtn = preview.querySelector('.view-pdf-btn');

    try {
      const pdfLib = await loadPdfJs();
      if (!pdfLib) {
        console.warn('PDF.js not available for preview');
        return;
      }
      
      const loadingTask = pdfLib.getDocument(pdfUrl);
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

// Switch between different modes
function switchMode(mode) {
  currentMode = mode;
  
  // Clear all filters
  activeFilters.clear();
  mobileActiveFilters.clear();
  mobileBlogFilters.clear();
  mobileJobsFilters.clear();
  mobileFabricationFilters.clear();
  machineFilters.clear();
  materialFilters.clear();
  currentPage = 0;

  // Update mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  // Show/hide filter content
  document.querySelectorAll('.filter-content').forEach(content => {
    content.classList.toggle('active', content.id === `${mode}Filters`);
  });

  // Show/hide results content
  document.querySelectorAll('.results-content').forEach(content => {
    content.classList.toggle('active', content.id === `${mode}Results`);
  });

  // Handle map visibility
  const mapContainer = document.getElementById('mapContainer');
  const mapColumn = document.getElementById('mapColumn');
  
  if (mode === 'blog') {
    mapContainer.style.display = 'none';
    mapColumn.style.display = 'none';
  } else {
    mapContainer.style.display = 'block';
    mapColumn.style.display = 'block';
    if (!map) {
      initializeMap();
    }
    setTimeout(() => map.invalidateSize(), 100);
  }

  // Clear tag button states
  document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Clear selected filters displays
  ['selectedFilters', 'selectedBlogFilters', 'selectedJobsFilters', 'selectedFabricationFilters'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.innerHTML = '';
    }
  });

  // Clear tag button states
  document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  updateResults();
}

// Carousel functionality
let currentSlide = 0;
const totalSlides = 2;

function showSlide(index) {
  const slides = document.querySelectorAll('.carousel-slide');
  const indicators = document.querySelectorAll('.indicator');
  
  slides.forEach(slide => slide.classList.remove('active'));
  indicators.forEach(indicator => indicator.classList.remove('active'));
  
  slides[index].classList.add('active');
  indicators[index].classList.add('active');
  
  currentSlide = index;
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
  document.querySelector('.prev-carousel').addEventListener('click', prevSlide);
  document.querySelector('.next-carousel').addEventListener('click', nextSlide);
  
  document.querySelectorAll('.indicator').forEach((indicator, index) => {
    indicator.addEventListener('click', () => showSlide(index));
  });

  // Auto-advance carousel
  setInterval(nextSlide, 8000);
}

// Update results based on current mode
function updateResults() {
  switch (currentMode) {
    case 'blog':
      updateBlogResults();
      break;
    case 'jobs':
      updateJobResults();
      break;
    case 'community':
      updateCommunityResults();
      break;
    case 'fabrication':
      updateFabricationResults();
      break;
  }
}

// Handle scroll to hide/show search interface
function handleScroll() {
  const scrollY = window.scrollY;
  const searchInterface = document.getElementById('searchInterface');
  
  if (scrollY > currentScrollY && scrollY > 100) {
    searchInterface.classList.add('hidden');
  } else if (scrollY < currentScrollY) {
    searchInterface.classList.remove('hidden');
  }
  
  currentScrollY = scrollY;
}

// Throttled scroll handler
function throttledScrollHandler() {
  let ticking = false;
  
  return function() {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  };
}

// Initialize map toggle functionality
function initializeMapToggle() {
  const mapToggle = document.getElementById('mapToggle');
  const mapColumn = document.getElementById('mapColumn');
  
  mapToggle.addEventListener('click', () => {
    isMapMinimized = !isMapMinimized;
    
    if (isMapMinimized) {
      mapColumn.classList.add('minimized');
      mapToggle.textContent = 'Show Map';
    } else {
      mapColumn.classList.remove('minimized');
      mapToggle.textContent = 'Hide Map';
      if (map) {
        setTimeout(() => map.invalidateSize(), 300);
      }
    }
  });
}

// Main initialization function
function initializeSearchPage() {
  initializeMapToggle();
  initializeAboutPopup();
  initializeMobileFilterPopup();
  initializeCarousel();

  // Add blog tags
  const blogTagsContainer = document.getElementById('blogTags');
  getBlogTags().forEach(tag => {
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

  // Mode switching
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchMode(btn.dataset.mode);
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

  // Machine select
  if (machineSelect) {
    machineSelect.addEventListener('change', (e) => {
      const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
      machineFilters.clear();
      selectedOptions.forEach(option => {
        if (option) machineFilters.add(option);
      });
      updateResults();
    });
  }

  // Material select
  if (materialSelect) {
    materialSelect.addEventListener('change', (e) => {
      const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
      materialFilters.clear();
      selectedOptions.forEach(option => {
        if (option) materialFilters.add(option);
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

  // Load community members from Supabase
  loadCommunityMembers();

  // Initialize with blog mode
  switchMode('blog');

  // Add scroll handler
  window.addEventListener('scroll', throttledScrollHandler());

  // Initialize dropdown collapse functionality
  initializeDropdownCollapse();
}

function initializeDropdownCollapse() {
  document.querySelectorAll('.dropdown-filter').forEach(filter => {
    const header = filter.querySelector('h3');
    
    function updateCollapsedState() {
      if (window.innerWidth <= 768) {
        filter.classList.add('collapsed');
      } else {
        filter.classList.remove('collapsed');
      }
    }
    
    updateCollapsedState();
    window.addEventListener('resize', updateCollapsedState);
    
    header.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        filter.classList.toggle('collapsed');
      }
    });
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('searchInterface')) {
    initializeSearchPage();
  }
});