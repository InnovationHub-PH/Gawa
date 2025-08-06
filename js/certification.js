import { geocodingService } from './geocoding.js';
import { db } from './supabase.js';
import { getCurrentUser } from './auth.js';

// Profile categories for certification process
export const PROFILE_CATEGORIES = {
  'Engineering & Design': [
    'Mechanical Engineering',
    'Electrical Engineering', 
    'Software Engineering',
    'Industrial Design',
    'Product Design',
    'CAD Design',
    'Other'
  ],
  'Manufacturing & Fabrication': [
    '3D Printing',
    'CNC Machining',
    'Laser Cutting',
    'Injection Molding',
    'Metal Fabrication',
    'Woodworking',
    'Other'
  ],
  'Technology & Innovation': [
    'Robotics',
    'IoT Development',
    'Automation',
    'AI/Machine Learning',
    'Electronics',
    'Embedded Systems',
    'Other'
  ],
  'Business & Services': [
    'Startup Founder',
    'Consultant',
    'Educator/Teacher',
    'Research & Development',
    'Project Management',
    'Sales & Marketing',
    'Other'
  ]
};

// Re-export geocoding service for convenience
export { geocodingService } from './geocoding.js';

// Profile Certification Class
export class ProfileCertification {
  constructor() {
    this.selectedCategories = new Set();
    this.currentStep = 1;
    this.totalSteps = 5;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Any initialization logic can go here
      this.isInitialized = true;
      console.log('Profile certification initialized');
    } catch (error) {
      console.error('Error initializing certification:', error);
    }
  }

  createCertificationWidget() {
    return `
      <div class="certification-widget">
        <div class="certification-info">
          <h3>🎯 Complete Your Profile</h3>
          <p>Get certified to appear in our community directory and on the map!</p>
          <button class="sqr-btn certification-start-btn">START CERTIFICATION</button>
        </div>
      </div>
    `;
  }

  showCertificationModal() {
    // This would show the certification modal
    console.log('Certification modal would show here');
    // For now, just redirect to profile edit since the functionality is similar
    const editProfileButton = document.getElementById('editProfileButton');
    if (editProfileButton) {
      editProfileButton.click();
    }
  }
}

// Utility functions for category management
export function updateCategorySelection(checkbox) {
  const categoryKey = `${checkbox.dataset.group}:${checkbox.dataset.category}`;
  const event = new CustomEvent('categoryChanged', {
    detail: { categoryKey, checked: checkbox.checked }
  });
  
  if (checkbox.checked) {
    checkbox.dispatchEvent(event);
  } else {
    checkbox.dispatchEvent(event);
  }
}

export function updateGroupCheckbox(group) {
  const modal = document.getElementById('editProfileModal');
  if (!modal) return;
  
  const groupCheckbox = modal.querySelector(`input[data-group="${group}"].category-group-checkbox`);
  const categoryCheckboxes = modal.querySelectorAll(`input[data-group="${group}"].category-checkbox`);
  const checkedCount = Array.from(categoryCheckboxes).filter(cb => cb.checked).length;
  
  if (groupCheckbox) {
    groupCheckbox.checked = checkedCount > 0;
    groupCheckbox.indeterminate = checkedCount > 0 && checkedCount < categoryCheckboxes.length;
  }
}

export function initializeCategoryEvents() {
  const modal = document.getElementById('editProfileModal');
  if (!modal) return;
  
  // Group checkbox handlers
  modal.addEventListener('change', (e) => {
    if (e.target.classList.contains('category-group-checkbox')) {
      const group = e.target.dataset.group;
      const isChecked = e.target.checked;
      const categoryCheckboxes = modal.querySelectorAll(`input[data-group="${group}"].category-checkbox`);
      
      categoryCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
        updateCategorySelection(checkbox);
      });
    } else if (e.target.classList.contains('category-checkbox')) {
      updateCategorySelection(e.target);
      updateGroupCheckbox(e.target.dataset.group);
    }
  });
}

export function initializeLocationPreview() {
  const cityInput = document.getElementById('editCity');
  const addressInput = document.getElementById('editAddress');
  const preview = document.getElementById('locationPreview');
  const previewText = document.getElementById('locationPreviewText');
  
  if (!cityInput || !addressInput || !preview || !previewText) return;
  
  let debounceTimer;
  
  const updatePreview = async () => {
    const city = cityInput.value.trim();
    const address = addressInput.value.trim();
    
    if (!city) {
      preview.style.display = 'none';
      return;
    }
    
    // Clear previous timer
    clearTimeout(debounceTimer);
    
    // Debounce the geocoding request
    debounceTimer = setTimeout(async () => {
      try {
        const result = await geocodingService.geocodeLocation(city, address);
        
        if (result) {
          preview.style.display = 'block';
          previewText.innerHTML = `
            <strong>📍 ${result.display_name}</strong><br>
            <small>Coordinates: ${result.latitude.toFixed(4)}, ${result.longitude.toFixed(4)}</small><br>
            <small>Source: ${result.source === 'nominatim' ? 'OpenStreetMap' : 'Built-in database'}</small>
          `;
        } else {
          preview.style.display = 'block';
          previewText.innerHTML = `
            <strong>⚠️ Location not found</strong><br>
            <small>We couldn't find coordinates for this location. You can still save it, but it won't appear on the map.</small>
          `;
        }
      } catch (error) {
        console.error('Preview geocoding error:', error);
        preview.style.display = 'none';
      }
    }, 1000); // 1 second debounce
  };
  
  cityInput.addEventListener('input', updatePreview);
  addressInput.addEventListener('input', updatePreview);
  
  // Initial preview if fields are already filled
  if (cityInput.value.trim()) {
    updatePreview();
  }
}

// Geocode and update location function
export async function geocodeAndUpdateLocation(userId, city, address) {
  try {
    console.log('Geocoding location:', { city, address });
    
    // Use the geocoding service to get coordinates
    const result = await geocodingService.geocodeLocation(city, address);
    
    if (result) {
      console.log('Geocoding successful:', result);
      
      // Update the profile with coordinates
      await db.updateProfileLocation(userId, {
        city,
        address: address || null,
        latitude: result.latitude,
        longitude: result.longitude,
        location_type: result.type
      });
      
      console.log('Location updated with coordinates');
    } else {
      console.log('Geocoding failed, location saved without coordinates');
    }
  } catch (error) {
    console.error('Error geocoding location:', error);
    // Don't throw error - location is still saved without coordinates
  }
}