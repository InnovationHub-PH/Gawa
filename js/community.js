// Community member data
export const communityMembers = [
  {
    name: 'TechLabs Manila',
    category: 'COMPANIES',
    website: 'https://techlabs.ph',
    email: 'contact@techlabs.ph',
    phone: '+63 2 8123 4567',
    facebook: 'https://facebook.com/techlabsmanila',
    tags: ['company', 'robotics', 'software'],
    profileImage: 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png',
    pdfDocument: 'https://innovationhub-ph.github.io/MakersClub/Portfolios/portfolio_Darja_Osojnik.pdf', // Example PDF URL
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
    name: 'Mapua University',
    category: 'EDUCATIONAL INSTITUTIONS',
    website: 'https://mapua.edu.ph',
    email: 'info@mapua.edu.ph',
    phone: '+63 2 8247 5000',
    facebook: 'https://facebook.com/mapua',
    tags: ['education', 'robotics', 'engineering'],
    profileImage: 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png',
    location: {
      lat: 14.5907,
      lng: 120.9748,
      address: 'Intramuros, Manila'
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

// Initialize PDF.js
let pdfjsLib = null;
let pdfWorkerLoaded = false;

// Dynamically load PDF.js only when needed
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

// Utility function to truncate text to word limit
function truncateWords(text, wordCount) {
  const words = text.split(' ');
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(' ') + '...';
}

// Variables for community page functionality
let map = null;
let markers = new Map();
let modal = null;
let currentPdf = null;
let currentPage = 1;
let activeFilters = new Set();

function initializeCommunityPage() {
  // Check if we're on the community page
  const mapContainer = document.getElementById('communityMap');
  if (!mapContainer) {
    return; // Exit if not on community page
  }

  // Check if Leaflet is available
  if (typeof L === 'undefined') {
    console.error('Leaflet library not loaded');
    return;
  }

  // Initialize map
  map = L.map('communityMap').setView([14.5995, 120.9842], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Add markers for members with locations
  communityMembers.forEach(member => {
    if (member.location) {
      const marker = L.marker([member.location.lat, member.location.lng])
        .bindPopup(`
          <strong>${member.name}</strong><br>
          ${member.location.address}
        `)
        .addTo(map);
      
      markers.set(member.name, marker);
      
      marker.on('click', () => {
        highlightMember(member.name);
      });
    }
  });

  // PDF Preview Modal
  modal = document.createElement('div');
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

  // Event listeners for modal navigation
  document.querySelector('.close-modal').addEventListener('click', () => {
    modal.style.display = 'none';
    currentPdf = null;
    currentPage = 1;
  });

  document.querySelector('.prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      showPdfPreview(currentPdf.url, currentPage);
    }
  });

  document.querySelector('.next-page').addEventListener('click', () => {
    if (currentPage < currentPdf.numPages) {
      currentPage++;
      showPdfPreview(currentPdf.url, currentPage);
    }
  });

  // Search and filter functionality
  const searchInput = document.getElementById('searchInput');
  const tagButtons = document.querySelectorAll('.tag-btn');

  // Event listeners
  if (searchInput) {
    searchInput.addEventListener('input', updateDirectory);
  }

  tagButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tag = button.dataset.tag;
      if (activeFilters.has(tag)) {
        activeFilters.delete(tag);
        button.classList.remove('active');
      } else {
        activeFilters.add(tag);
        button.classList.add('active');
      }
      updateDirectory();
    });
  });

  // Category collapse functionality
  document.querySelectorAll('.directory-category h2').forEach(header => {
    header.addEventListener('click', () => {
      const category = header.closest('.directory-category');
      category.classList.toggle('collapsed');
    });
  });

  // Initial render
  updateDirectory();
}

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
    modal.style.display = 'flex';
  } catch (error) {
    console.error('Error loading PDF:', error);
  }
}

function createMemberCard(member) {
  // Process member info fields for truncation
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

// After cards are rendered, initialize PDF previews
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

function updateDirectory() {
  const searchInput = document.getElementById('searchInput');
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  
  document.querySelectorAll('.member-grid').forEach(grid => {
    grid.innerHTML = '';
  });

  communityMembers.forEach(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm) ||
                         member.tags.some(tag => tag.toLowerCase().includes(searchTerm));
    const matchesFilters = activeFilters.size === 0 || 
                          member.tags.some(tag => activeFilters.has(tag));

    if (matchesSearch && matchesFilters) {
      const categoryDiv = Array.from(document.querySelectorAll('.directory-category')).find(
        categoryDiv => categoryDiv.querySelector('h2').textContent === member.category
      );
      if (categoryDiv) {
        const memberGrid = categoryDiv.querySelector('.member-grid');
        memberGrid.insertAdjacentHTML('beforeend', createMemberCard(member));
      }
    }
  });

  document.querySelectorAll('.member-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking on buttons or links
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button') || e.target.closest('a')) return;
      
      const memberName = card.dataset.member;
      highlightMember(memberName);
    });
  });

  // Add event listeners to read more buttons for member info
  document.querySelectorAll('.read-more-info').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent card click
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

  initializePdfPreviews();
}

function highlightMember(memberName) {
  // Remove previous selection
  document.querySelectorAll('.member-card.highlighted').forEach(card => {
    card.classList.remove('highlighted');
  });
  
  // Add selection to new card
  const memberCard = document.querySelector(`.member-card[data-member="${memberName}"]`);
  if (memberCard) {
    memberCard.classList.add('highlighted');
    memberCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  
  // Update marker
  const marker = markers.get(memberName);
  if (marker) {
    marker.openPopup();
    // Center map on marker
    if (map) {
      map.setView(marker.getLatLng(), map.getZoom());
    }
  }
}

// Initialize community page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on a page with community map before initializing
  if (document.getElementById('communityMap')) {
    initializeCommunityPage();
  }
});