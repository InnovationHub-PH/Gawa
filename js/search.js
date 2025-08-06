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

// Global variables for community data
let allCommunityMembers = [];
let allCommunityCategories = [];
let communityDataLoaded = false;

// Other global variables
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

// Scroll tracking variables
let lastScrollY = 0;
let hideThreshold = 5; // Pixels to scroll down before hiding
let showThreshold = 10; // Pixels to scroll up before showing
let isSearchInterfaceHidden = false;

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

// Fetch community data from Supabase
async function fetchCommunityData() {
  if (communityDataLoaded) return;

  console.log('[Community] Starting to fetch community data...');
  
  // Show loading state
  const communityTagsContainer = document.getElementById('communityTags');
  if (communityTagsContainer) {
    communityTagsContainer.innerHTML = '<div class="loading-categories">Loading categories...</div>';
  }

  try {
    // Fetch profiles with coordinates
    console.log('[Community] Fetching profiles with coordinates...');
    
    // Add better error handling for Supabase connection
    let profiles = [];
    let profilesError = null;
    
    try {
      const result = await db.getProfilesWithCoordinates();
      profiles = result.data;
      profilesError = result.error;
    } catch (connectionError) {
      console.error('[Community] Supabase connection error:', connectionError);
      profilesError = { message: 'Failed to connect to database. Please check your Supabase configuration.', code: 'CONNECTION_ERROR' };
    }
    
    if (profilesError) {
      console.error('[Community] Error fetching profiles:', profilesError);
      // Don't throw, continue with empty data
      profiles = [];
    }

    console.log('[Community] Profiles fetched:', { count: profiles?.length || 0 });

    // Fetch all categories
    console.log('[Community] Fetching categories...');
    
    let categories = [];
    let categoriesError = null;
    
    try {
      const result = await db.getAllCategories();
      categories = result.data;
      categoriesError = result.error;
    } catch (connectionError) {
      console.error('[Community] Categories connection error:', connectionError);
      categoriesError = { message: 'Failed to connect to database for categories', code: 'CONNECTION_ERROR' };
    }
    
    if (categoriesError) {
      console.error('[Community] Error fetching categories:', categoriesError);
      // Don't throw, continue with empty data
      categories = [];
    }

    console.log('[Community] Categories fetched:', { count: categories?.length || 0 });

    // Transform profiles data to match expected format
    allCommunityMembers = (profiles || []).map(profile => {
      // Determine category based on account_type
      let category = 'INDIVIDUALS';
      if (profile.account_type === 'business') {
        category = 'COMPANIES';
      } else if (profile.account_type === 'education') {
        category = 'EDUCATIONAL INSTITUTIONS';
      }

      // Create tags array from profile categories and account type
      const tags = [profile.account_type];
      if (profile.profile_categories) {
        profile.profile_categories.forEach(cat => {
          // Add both category group and name as tags
          tags.push(cat.category_group.toLowerCase().replace(/\s+/g, '-'));
          tags.push(cat.category_name.toLowerCase().replace(/\s+/g, '-'));
        });
      }

      return {
        id: profile.id,
        name: profile.full_name || profile.username || 'Unknown User',
        category: category,
        website: profile.website || null,
        email: profile.email || null,
        phone: profile.phone || null,
        facebook: profile.facebook || null,
        instagram: profile.instagram || null,
        linkedin: profile.linkedin || null,
        tags: [...new Set(tags)], // Remove duplicates
        profileImage: profile.avatar_url || 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png',
        bio: profile.bio || '',
        location: profile.latitude && profile.longitude ? {
          lat: parseFloat(profile.latitude),
          lng: parseFloat(profile.longitude),
          address: profile.city || 'Unknown Location'
        } : null,
        categories: profile.profile_categories || []
      };
    });

    // Transform categories data
    const categoryMap = new Map();
    (categories || []).forEach(cat => {
      const groupKey = cat.category_group.toLowerCase().replace(/\s+/g, '-');
      const nameKey = cat.category_name.toLowerCase().replace(/\s+/g, '-');
      
      categoryMap.set(groupKey, cat.category_group);
      categoryMap.set(nameKey, cat.category_name);
    });

    // Create unique categories list for filters
    allCommunityCategories = [
      // Account type categories
      { tag: 'person', label: 'INDIVIDUALS' },
      { tag: 'business', label: 'COMPANIES' },
      { tag: 'education', label: 'EDUCATIONAL INSTITUTIONS' },
      // Dynamic categories from database
      ...Array.from(categoryMap.entries()).map(([tag, label]) => ({
        tag,
        label: label.toUpperCase()
      }))
    ];

    console.log('[Community] Data transformation complete:', {
      members: allCommunityMembers.length,
      categories: allCommunityCategories.length
    });

    communityDataLoaded = true;

    // Update UI - no need to populate tags since we use popup
    if (currentMode === 'community') {
      updateCommunityResults();
    }

  } catch (error) {
    console.error('[Community] Error fetching community data:', error);
    
    // Fallback to empty arrays
    allCommunityMembers = [];
    allCommunityCategories = [
      { tag: 'person', label: 'INDIVIDUALS' },
      { tag: 'business', label: 'COMPANIES' },
      { tag: 'education', label: 'EDUCATIONAL INSTITUTIONS' }
    ];
  }
}

// Populate community tags in the UI
function populateCommunityTags() {
  // Community tags are now populated through the filter popup
  console.log('[Community] Categories loaded:', allCommunityCategories.length);
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
}
function getFiltersForMode(mode) {
  const jobsFilters = [
    { tag: 'robotics', label: 'ROBOTICS' },
    { tag: 'software', label: 'SOFTWARE' },
    { tag: 'hardware', label: 'HARDWARE' },
    { tag: 'internship', label: 'INTERNSHIP' },
    { tag: 'industrial-design', label: 'INDUSTRIAL DESIGN' },
    { tag: 'manufacturing', label: 'MANUFACTURING' },
    { tag: 'mechatronics', label: 'MECHATRONICS' }
  ];

  const fabricationFilters = [
    { tag: '3d-printer', label: '3D PRINTERS' },
    { tag: 'laser-cutter', label: 'LASER CUTTERS' },
    { tag: 'cnc-mill', label: 'CNC MILLS' },
    { tag: 'cnc-router', label: 'CNC ROUTERS' },
    { tag: 'vinyl-cutter', label: 'VINYL CUTTERS' },
    { tag: 'soldering-station', label: 'SOLDERING STATIONS' },
    { tag: 'oscilloscope', label: 'OSCILLOSCOPES' },
    { tag: 'multimeter', label: 'MULTIMETERS' },
    { tag: 'filament', label: 'FILAMENTS' },
    { tag: 'acrylic', label: 'ACRYLIC' },
    { tag: 'wood', label: 'WOOD' },
    { tag: 'metal', label: 'METAL STOCK' },
    { tag: 'electronics', label: 'ELECTRONICS' },
    { tag: 'fabric', label: 'FABRIC' },
    { tag: 'foam', label: 'FOAM' },
    { tag: 'adhesives', label: 'ADHESIVES' }
  ];

  switch (mode) {
    case 'blog':
      return getUniqueTagsFromBlogPosts().map(tag => ({ tag, label: tag.toUpperCase() }));
    case 'jobs':
      return jobsFilters;
    case 'community':
      return allCommunityCategories; // Use dynamically fetched categories
    case 'fabrication':
      return fabricationFilters;
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

  // Display categories from Supabase data
  const categoriesDisplay = member.categories && member.categories.length > 0 
    ? member.categories.map(cat => `<span class="tag">${cat.category_name.toUpperCase()}</span>`).join('')
    : '';

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
        ${member.bio ? `<p class="member-bio">${truncateWords(member.bio, 20)}</p>` : ''}
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
        ${categoriesDisplay}
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
      blogFilters.size === 0 || 
      post.tags.some(tag => blogFilters.has(tag));

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

    return jobsFilters.size === 0 || job.tags.some(tag => jobsFilters.has(tag));
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
  let filteredMembers = allCommunityMembers;

  // Apply area filter if selected
  if (selectedArea) {
    filteredMembers = allCommunityMembers.filter(member => {
      if (!member.location) return false;
      return isPointInArea(member.location.lat, member.location.lng);
    });
  }

  filteredMembers = filteredMembers.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTags = communityFilters.size === 0 || member.tags.some(tag => communityFilters.has(tag));

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

  // Add event listeners for read more buttons
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

  // Add click handlers for member cards
  document.querySelectorAll('.member-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button') || e.target.closest('a')) return;
      
      const memberName = card.dataset.member;
      highlightItem(memberName, 'community');
    });
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

    const activeFabFilters = fabricationFilters;

    if (activeFabFilters.size > 0) {
      const matchesCategory = activeFabFilters.has(item.category);
      const matchesTags = item.tags.some(tag => activeFabFilters.has(tag));
      if (!matchesCategory && !matchesTags) return false;
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
async function switchMode(mode) {
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

  // Clear selected filters displays
  ['selectedFilters', 'selectedBlogFilters', 'selectedJobsFilters', 'selectedFabricationFilters'].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.innerHTML = '';
  });

  // Fetch community data when switching to community mode
  if (mode === 'community' && !communityDataLoaded) {
    await fetchCommunityData();
  }

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
  // Initialize filters
  initializeFilters();

  // Event listeners
  const searchInput = document.getElementById('searchInput');
  const remoteToggle = document.getElementById('remoteToggle');

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

  // Remote toggle
  if (remoteToggle) {
    remoteToggle.addEventListener('click', () => {
      remoteOnly = !remoteOnly;
      remoteToggle.checked = remoteOnly;
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
function initializeFilters() {
  if (mobileFiltersInitialized) return; // Rename this to filtersInitialized later
  
  const communityFilterTrigger = document.getElementById('communityFilterTrigger');
  const blogFilterTrigger = document.getElementById('blogFilterTrigger');
  const jobsFilterTrigger = document.getElementById('jobsFilterTrigger');
  const fabricationFilterTrigger = document.getElementById('fabricationFilterTrigger');
  const filterPopup = document.getElementById('filterPopup');
  const filterPopupClose = document.getElementById('filterPopupClose');
  const filterPopupOptions = document.getElementById('filterPopupOptions');
  const filterPopupTitle = document.getElementById('filterPopupTitle');

  let currentFilterMode = '';

  function showFilters(mode) {
    currentFilterMode = mode;
    filterPopupTitle.textContent = `SELECT ${mode.toUpperCase()} FILTERS`;
    filterPopup.classList.add('active');
    populateFilters(mode);
  }

  function populateFilters(mode) {
    const filters = getFiltersForMode(mode);
    const activeFiltersForMode = getActiveFiltersForMode(mode);

    filterPopupOptions.innerHTML = filters.map(filter => `
      <button class="filter-popup-option ${activeFiltersForMode.has(filter.tag) ? 'selected' : ''}" data-tag="${filter.tag}">
        ${filter.label}
      </button>
    `).join('');
  }

  // Event listeners
  if (communityFilterTrigger) {
    communityFilterTrigger.addEventListener('click', () => showFilters('community'));
  }
  if (blogFilterTrigger) {
    blogFilterTrigger.addEventListener('click', () => showFilters('blog'));
  }
  if (jobsFilterTrigger) {
    jobsFilterTrigger.addEventListener('click', () => showFilters('jobs'));
  }
  if (fabricationFilterTrigger) {
    fabricationFilterTrigger.addEventListener('click', () => showFilters('fabrication'));
  }

  if (filterPopupClose) {
    filterPopupClose.addEventListener('click', () => {
      filterPopup.classList.remove('active');
    });
  }

  if (filterPopup) {
    filterPopup.addEventListener('click', (e) => {
      if (e.target === filterPopup) {
        filterPopup.classList.remove('active');
      }
    });
  }

  if (filterPopupOptions) {
    filterPopupOptions.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-popup-option')) {
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

// Scroll handling for search interface
function handleSearchInterfaceScroll() {
  const currentScrollY = window.scrollY;
  const scrollDifference = currentScrollY - lastScrollY;
  const searchInterface = document.getElementById('searchInterface');
  
  if (!searchInterface) return;

  // Hide interface when scrolling down by 5 pixels
  if (scrollDifference > hideThreshold && !isSearchInterfaceHidden) {
    searchInterface.classList.add('hidden');
    isSearchInterfaceHidden = true;
  }
  // Show interface when scrolling up by 50 pixels
  else if (scrollDifference < -showThreshold && isSearchInterfaceHidden) {
    searchInterface.classList.remove('hidden');
    isSearchInterfaceHidden = false;
  }

  lastScrollY = currentScrollY;
}

// Throttled scroll handler for better performance
function createThrottledScrollHandler() {
  let ticking = false;
  
  return function() {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleSearchInterfaceScroll();
        ticking = false;
      });
      ticking = true;
    }
  };
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

// Initialize scroll handler
function initializeScrollHandler() {
  const throttledScrollHandler = createThrottledScrollHandler();
  window.addEventListener('scroll', throttledScrollHandler);
  
  // Initialize scroll position
  lastScrollY = window.scrollY;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('searchInterface')) {
    initializeSearchInterface();
    initializeScrollHandler();
  }
});