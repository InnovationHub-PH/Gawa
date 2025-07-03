import { db } from './supabase.js';
import { blogPosts } from './blogData.js';

// Sample job data
const jobs = [
  {
    title: 'Job Title',
    company: 'Company Name',
    logo: 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png',
    location: 'Makati, MNL',
    coordinates: { lat: 14.5547, lng: 120.9947 },
    remote: false,
    tags: ['robotics', 'hardware'],
    description: 'Describe the Job opening here...'
  },
  {
    title: 'Software Developer',
    company: 'Remote Robotics',
    logo: 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png',
    location: 'Remote',
    coordinates: { lat: 14.5995, lng: 120.9842 },
    remote: true,
    tags: ['software', 'robotics'],
    description: 'Developing control systems for autonomous robots. We are looking for a skilled software developer with experience in robotics and control systems.'
  },
  {
    title: 'Mechatronics Intern',
    company: 'Innovation Labs',
    logo: 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png',
    location: 'Boston, MA',
    coordinates: { lat: 14.5580, lng: 120.9890 },
    remote: false,
    tags: ['internship', 'hardware', 'software'],
    description: 'Summer internship opportunity in our robotics division.'
  },
  {
    title: 'Control Systems Engineer',
    company: 'Virtual Mechanics',
    logo: 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png',
    location: 'Remote',
    coordinates: { lat: 14.5648, lng: 120.9932 },
    remote: true,
    tags: ['software', 'hardware'],
    description: 'Design and implement control systems for industrial robots.'
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
  },
  {
    name: 'Maria Santos',
    category: 'INDIVIDUALS',
    website: 'https://mariasantos.dev',
    email: 'maria@example.com',
    phone: '+63 918 234 5678',
    facebook: 'https://facebook.com/mariasantos',
    tags: ['individual', 'robotics', 'software'],
    profileImage: 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png',
    location: {
      lat: 14.5542,
      lng: 120.9965,
      address: 'Makati City, Philippines'
    }
  }
];

// Fabrication items data
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
    description: 'High-quality FDM 3D printer capable of printing PLA, PETG, and ABS materials.',
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
    description: 'CO2 laser cutter for wood, acrylic, paper, and fabric.',
    contact: 'info@innovationlabs.ph',
    image: 'https://images.pexels.com/photos/5691659/pexels-photo-5691659.jpeg',
    tags: ['laser-cutting', 'engraving', 'prototyping']
  }
];

// Global variables
let currentMode = 'blog';
let activeFilters = new Set();
let communityFilters = new Set();
let blogFilters = new Set();
let jobsFilters = new Set();
let fabricationFilters = new Set();
let machineFilters = new Set();
let materialFilters = new Set();
let remoteOnly = false;
let searchTerm = '';
let currentPage = 0;
let map = null;
let markers = new Map();
let drawLayer = null;
let drawControl = null;
let selectedArea = null;
let mobileFiltersInitialized = false;

// Utility functions
function truncateWords(text, wordCount) {
  const words = text.split(' ');
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(' ') + '...';
}

function getUniqueTagsFromBlogPosts() {
  const tags = new Set();
  blogPosts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags);
}

// Initialize map
function initializeMap() {
  if (!document.getElementById('searchMap')) return;
  
  if (typeof L === 'undefined') {
    console.error('Leaflet library not loaded');
    return;
  }

  map = L.map('searchMap').setView([14.5995, 120.9842], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Initialize drawing controls if available
  if (typeof L.Draw !== 'undefined') {
    drawLayer = new L.FeatureGroup();
    map.addLayer(drawLayer);

    drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawLayer
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
  }
}

function handleDrawCreated(e) {
  const layer = e.layer;
  drawLayer.clearLayers();
  drawLayer.addLayer(layer);
  selectedArea = layer;
  updateResults();
}

function handleDrawDeleted() {
  selectedArea = null;
  updateResults();
}

function handleDrawEdited() {
  updateResults();
}

// Filter functions
function getActiveFiltersForMode(mode) {
  switch (mode) {
    case 'blog':
      return blogFilters;
    case 'jobs':
      return jobsFilters;
    case 'community':
      return communityFilters;
    case 'fabrication':
      return fabricationFilters;
    default:
      return new Set();
  }
}

function getMobileFiltersForMode(mode) {
  const mobileJobsFilters = [
    { tag: 'robotics', label: 'ROBOTICS' },
    { tag: 'software', label: 'SOFTWARE' },
    { tag: 'hardware', label: 'HARDWARE' },
    { tag: 'internship', label: 'INTERNSHIP' }
  ];

  const mobileFabricationFilters = [
    { tag: '3d-printer', label: '3D PRINTERS' },
    { tag: 'laser-cutter', label: 'LASER CUTTERS' },
    { tag: 'cnc-mill', label: 'CNC MILLS' },
    { tag: 'filament', label: 'FILAMENTS' },
    { tag: 'acrylic', label: 'ACRYLIC' },
    { tag: 'electronics', label: 'ELECTRONICS' }
  ];

  const mobileCommunityFilters = [
    { tag: 'company', label: 'COMPANIES' },
    { tag: 'individual', label: 'INDIVIDUALS' },
    { tag: 'education', label: 'EDUCATION' },
    { tag: 'robotics', label: 'ROBOTICS' },
    { tag: 'software', label: 'SOFTWARE' },
    { tag: 'hardware', label: 'HARDWARE' }
  ];

  switch (mode) {
    case 'blog':
      return getUniqueTagsFromBlogPosts().map(tag => ({ tag, label: tag.toUpperCase() }));
    case 'jobs':
      return mobileJobsFilters;
    case 'community':
      return mobileCommunityFilters;
    case 'fabrication':
      return mobileFabricationFilters;
    default:
      return [];
  }
}

// Content creation functions
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
        ${member.email ? `<p>Email: <a href="mailto:${member.email}">${member.email}</a></p>` : ''}
        ${member.phone ? `<p>Phone: <a href="tel:${member.phone}">${member.phone}</a></p>` : ''}
      </div>
      <div class="tags">
        ${member.tags.map(tag => `<span class="tag">${tag.toUpperCase()}</span>`).join('')}
      </div>
    </div>
  `;
}

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

// Update functions
function updateBlogResults() {
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTags = 
      (window.innerWidth <= 768 && currentMode === 'blog' ? blogFilters : activeFilters).size === 0 || 
      post.tags.some(tag => (window.innerWidth <= 768 && currentMode === 'blog' ? blogFilters : activeFilters).has(tag));

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
  
  if (prevBtn) prevBtn.disabled = currentPage === 0;
  if (nextBtn) nextBtn.disabled = currentPage >= totalPages - 1;

  const blogGrid = document.getElementById('blogGrid');
  if (blogGrid) {
    blogGrid.innerHTML = visiblePosts.map(createBlogCard).join('');
    
    // Add event listeners for read more buttons
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
  }
}

function updateJobsResults() {
  let filteredJobs = jobs;

  // Apply area filter if selected
  if (selectedArea) {
    filteredJobs = jobs.filter(job => {
      if (!job.coordinates) return false;
      return isPointInArea(job.coordinates.lat, job.coordinates.lng);
    });
  }

  filteredJobs = filteredJobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (remoteOnly && !job.remote) return false;

    const activeJobFilters = window.innerWidth <= 768 && currentMode === 'jobs' ? jobsFilters : activeFilters;
    return activeJobFilters.size === 0 || job.tags.some(tag => activeJobFilters.has(tag));
  });

  const jobsList = document.getElementById('jobsList');
  if (jobsList) {
    jobsList.innerHTML = filteredJobs.map(createJobCard).join('');
    
    // Add event listeners
    document.querySelectorAll('.read-more').forEach(button => {
      button.addEventListener('click', function() {
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
  }

  updateMapMarkers(filteredJobs, 'jobs');
}

function updateCommunityResults() {
  let filteredMembers = communityMembers;

  // Apply area filter if selected
  if (selectedArea) {
    filteredMembers = communityMembers.filter(member => {
      if (!member.location) return false;
      return isPointInArea(member.location.lat, member.location.lng);
    });
  }

  filteredMembers = filteredMembers.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const activeCommunityFilters = window.innerWidth <= 768 && currentMode === 'community' ? communityFilters : activeFilters;
    const matchesTags = activeCommunityFilters.size === 0 || member.tags.some(tag => activeCommunityFilters.has(tag));

    return matchesSearch && matchesTags;
  });

  // Clear existing content
  const companiesGrid = document.querySelector('.companies-grid');
  const individualsGrid = document.querySelector('.individuals-grid');
  const educationGrid = document.querySelector('.education-grid');

  if (companiesGrid) companiesGrid.innerHTML = '';
  if (individualsGrid) individualsGrid.innerHTML = '';
  if (educationGrid) educationGrid.innerHTML = '';

  // Populate grids
  filteredMembers.forEach(member => {
    let targetGrid;
    if (member.category === 'COMPANIES') {
      targetGrid = companiesGrid;
    } else if (member.category === 'INDIVIDUALS') {
      targetGrid = individualsGrid;
    } else if (member.category === 'EDUCATIONAL INSTITUTIONS') {
      targetGrid = educationGrid;
    }

    if (targetGrid) {
      targetGrid.insertAdjacentHTML('beforeend', createMemberCard(member));
    }
  });

  updateMapMarkers(filteredMembers, 'community');
}

function updateFabricationResults() {
  let filteredItems = fabricationItems;

  // Apply area filter if selected
  if (selectedArea) {
    filteredItems = fabricationItems.filter(item => {
      if (!item.location) return false;
      return isPointInArea(item.location.lat, item.location.lng);
    });
  }

  filteredItems = filteredItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    const activeFabFilters = window.innerWidth <= 768 && currentMode === 'fabrication' ? fabricationFilters : new Set([...machineFilters, ...materialFilters]);

    if (window.innerWidth <= 768 && currentMode === 'fabrication') {
      if (activeFabFilters.size > 0) {
        const matchesCategory = activeFabFilters.has(item.category);
        const matchesTags = item.tags.some(tag => activeFabFilters.has(tag));
        if (!matchesCategory && !matchesTags) return false;
      }
    } else {
      if (machineFilters.size > 0 && item.type === 'machine' && !machineFilters.has(item.category)) return false;
      if (materialFilters.size > 0 && item.type === 'material' && !materialFilters.has(item.category)) return false;
      if ((machineFilters.size > 0 || materialFilters.size > 0) && 
          (item.type === 'machine' && machineFilters.size === 0) || 
          (item.type === 'material' && materialFilters.size === 0)) return false;
    }

    return true;
  });

  // Clear existing content
  const machinesGrid = document.querySelector('.machines-grid');
  const materialsGrid = document.querySelector('.materials-grid');

  if (machinesGrid) machinesGrid.innerHTML = '';
  if (materialsGrid) materialsGrid.innerHTML = '';

  // Populate grids
  filteredItems.forEach(item => {
    let targetGrid;
    if (item.type === 'machine') {
      targetGrid = machinesGrid;
    } else if (item.type === 'material') {
      targetGrid = materialsGrid;
    }

    if (targetGrid) {
      targetGrid.insertAdjacentHTML('beforeend', createFabricationCard(item));
    }
  });

  updateMapMarkers(filteredItems, 'fabrication');
}

// Map functions
function isPointInArea(lat, lng) {
  if (!selectedArea) return true;

  const point = L.latLng(lat, lng);
  
  if (selectedArea instanceof L.Rectangle) {
    return selectedArea.getBounds().contains(point);
  } else if (selectedArea instanceof L.Polygon) {
    const latlngs = selectedArea.getLatLngs()[0];
    return isPointInPolygon(point, latlngs);
  }
  
  return true;
}

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

function clearMapMarkers() {
  markers.forEach(marker => map.removeLayer(marker));
  markers.clear();
}

function updateMapMarkers(items, type) {
  clearMapMarkers();

  items.forEach(item => {
    let coords, popupContent, markerId;

    if (type === 'jobs' && item.coordinates) {
      coords = [item.coordinates.lat, item.coordinates.lng];
      popupContent = `<strong>${item.title}</strong><br>${item.company}<br>${item.location}`;
      markerId = `${item.title}-${item.company}`;
    } else if (type === 'community' && item.location) {
      coords = [item.location.lat, item.location.lng];
      popupContent = `<strong>${item.name}</strong><br>${item.location.address}`;
      markerId = item.name;
    } else if (type === 'fabrication' && item.location) {
      coords = [item.location.lat, item.location.lng];
      const statusIcon = item.availability === 'available' ? '✅' : '🔴';
      popupContent = `<strong>${item.name}</strong><br>${item.owner}<br>${item.location.address}<br>${statusIcon} ${item.availability.toUpperCase()}`;
      markerId = item.name;
    }

    if (coords) {
      const marker = L.marker(coords).bindPopup(popupContent).addTo(map);
      marker.on('click', () => {
        highlightItem(markerId, type);
      });
      markers.set(markerId, marker);
    }
  });
}

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

// Mode switching
function switchMode(mode) {
  currentMode = mode;
  activeFilters.clear();
  communityFilters.clear();
  blogFilters.clear();
  jobsFilters.clear();
  fabricationFilters.clear();
  machineFilters.clear();
  materialFilters.clear();
  currentPage = 0;

  // Update mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  // Update filter sections
  document.querySelectorAll('.filter-content').forEach(content => {
    content.classList.toggle('active', content.id === `${mode}Filters`);
  });

  // Update results sections
  document.querySelectorAll('.results-content').forEach(content => {
    content.classList.toggle('active', content.id === `${mode}Results`);
  });

  // Show/hide map
  const mapContainer = document.getElementById('mapContainer');
  const mapColumn = document.getElementById('mapColumn');
  
  if (mode === 'blog') {
    if (mapContainer) mapContainer.style.display = 'none';
    if (mapColumn) mapColumn.style.display = 'none';
  } else {
    if (mapContainer) mapContainer.style.display = 'block';
    if (mapColumn) mapColumn.style.display = 'block';
    if (map) {
      setTimeout(() => map.invalidateSize(), 100);
    } else {
      initializeMap();
    }
  }

  // Clear all tag buttons
  document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Clear selected filters displays
  ['selectedFilters', 'selectedBlogFilters', 'selectedJobsFilters', 'selectedFabricationFilters'].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.innerHTML = '';
  });

  updateResults();
}

// Main update function
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

// Initialize search interface
function initializeSearchInterface() {
  // Initialize blog tags
  const blogTagsContainer = document.getElementById('blogTags');
  if (blogTagsContainer) {
    getUniqueTagsFromBlogPosts().forEach(tag => {
      const button = document.createElement('button');
      button.className = 'tag-btn';
      button.textContent = tag.toUpperCase();
      button.dataset.tag = tag;
      blogTagsContainer.appendChild(button);
    });
  }

  // Initialize mobile filters
  initializeMobileFilters();

  // Event listeners
  const searchInput = document.getElementById('searchInput');
  const remoteToggle = document.getElementById('remoteToggle');
  const machineSelect = document.getElementById('machineSelect');
  const materialSelect = document.getElementById('materialSelect');

  // Mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchMode(btn.dataset.mode);
    });
  });

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      currentPage = 0;
      updateResults();
    });
  }

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
  if (remoteToggle) {
    remoteToggle.addEventListener('click', () => {
      remoteOnly = !remoteOnly;
      remoteToggle.checked = remoteOnly;
      updateResults();
    });
  }

  // Machine select
  if (machineSelect) {
    machineSelect.addEventListener('change', (e) => {
      const selectedValues = Array.from(e.target.selectedOptions).map(option => option.value);
      machineFilters.clear();
      selectedValues.forEach(value => {
        if (value) machineFilters.add(value);
      });
      updateResults();
    });
  }

  // Material select
  if (materialSelect) {
    materialSelect.addEventListener('change', (e) => {
      const selectedValues = Array.from(e.target.selectedOptions).map(option => option.value);
      materialFilters.clear();
      selectedValues.forEach(value => {
        if (value) materialFilters.add(value);
      });
      updateResults();
    });
  }

  // Blog navigation
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 0) {
        currentPage--;
        updateBlogResults();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentPage++;
      updateBlogResults();
    });
  }

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

  // Initialize with blog mode
  switchMode('blog');
}

// Mobile filters
function initializeMobileFilters() {
  if (mobileFiltersInitialized) return;
  
  const communityFilterTrigger = document.getElementById('communityFilterTrigger');
  const blogFilterTrigger = document.getElementById('blogFilterTrigger');
  const jobsFilterTrigger = document.getElementById('jobsFilterTrigger');
  const fabricationFilterTrigger = document.getElementById('fabricationFilterTrigger');
  const mobileFilterPopup = document.getElementById('mobileFilterPopup');
  const mobileFilterClose = document.getElementById('mobileFilterClose');
  const mobileFilterOptions = document.getElementById('mobileFilterOptions');
  const mobileFilterTitle = document.getElementById('mobileFilterTitle');

  let currentFilterMode = '';

  function showMobileFilters(mode) {
    currentFilterMode = mode;
    mobileFilterTitle.textContent = `SELECT ${mode.toUpperCase()} FILTERS`;
    mobileFilterPopup.classList.add('active');
    populateMobileFilters(mode);
  }

  function populateMobileFilters(mode) {
    const filters = getMobileFiltersForMode(mode);
    const activeFiltersForMode = getActiveFiltersForMode(mode);

    mobileFilterOptions.innerHTML = filters.map(filter => `
      <button class="mobile-filter-option ${activeFiltersForMode.has(filter.tag) ? 'selected' : ''}" data-tag="${filter.tag}">
        ${filter.label}
      </button>
    `).join('');
  }

  // Event listeners
  if (communityFilterTrigger) {
    communityFilterTrigger.addEventListener('click', () => showMobileFilters('community'));
  }
  if (blogFilterTrigger) {
    blogFilterTrigger.addEventListener('click', () => showMobileFilters('blog'));
  }
  if (jobsFilterTrigger) {
    jobsFilterTrigger.addEventListener('click', () => showMobileFilters('jobs'));
  }
  if (fabricationFilterTrigger) {
    fabricationFilterTrigger.addEventListener('click', () => showMobileFilters('fabrication'));
  }

  if (mobileFilterClose) {
    mobileFilterClose.addEventListener('click', () => {
      mobileFilterPopup.classList.remove('active');
    });
  }

  if (mobileFilterPopup) {
    mobileFilterPopup.addEventListener('click', (e) => {
      if (e.target === mobileFilterPopup) {
        mobileFilterPopup.classList.remove('active');
      }
    });
  }

  if (mobileFilterOptions) {
    mobileFilterOptions.addEventListener('click', (e) => {
      if (e.target.classList.contains('mobile-filter-option')) {
        const tag = e.target.dataset.tag;
        const activeFiltersForMode = getActiveFiltersForMode(currentFilterMode);

        if (activeFiltersForMode.has(tag)) {
          activeFiltersForMode.delete(tag);
          e.target.classList.remove('selected');
        } else {
          activeFiltersForMode.add(tag);
          e.target.classList.add('selected');
        }

        updateSelectedFiltersDisplay(currentFilterMode);
        updateResults();
      }
    });
  }

  mobileFiltersInitialized = true;
}

function updateSelectedFiltersDisplay(mode) {
  const containers = {
    'community': 'selectedFilters',
    'blog': 'selectedBlogFilters',
    'jobs': 'selectedJobsFilters',
    'fabrication': 'selectedFabricationFilters'
  };

  const containerId = containers[mode];
  const container = document.getElementById(containerId);
  const activeFiltersForMode = getActiveFiltersForMode(mode);

  if (container) {
    container.innerHTML = '';
    activeFiltersForMode.forEach(tag => {
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
        const activeFiltersForMode = getActiveFiltersForMode(mode);
        activeFiltersForMode.delete(tag);
        updateSelectedFiltersDisplay(mode);
        updateResults();
      });
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('searchInterface')) {
    initializeSearchInterface();
  }
});