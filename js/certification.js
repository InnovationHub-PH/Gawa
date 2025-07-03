import { db, auth } from './supabase.js';
import { getCurrentUser } from './auth.js';
import { geocodingService } from './geocoding.js';

// Category definitions
export const PROFILE_CATEGORIES = {
  'Architecture & Built Environment': [
    'Architecture',
    'Landscape Design', 
    'Permaculture Design',
    'Urban Planning'
  ],
  'Artisanal & Cultural': [
    'Artisan Co-ops & Guilds',
    'Cultural Preservation Initiatives',
    'Heritage Restoration',
    'Local Cuisine & Food Crafting',
    'Traditional Crafts (e.g., ceramics, weaving, woodworking)'
  ],
  'Business & Infrastructure': [
    'Business Incubator / Accelerator (local-focused)',
    'Inventory & Logistics',
    'Local Retail (Pop-ups, Maker Markets)',
    'Local Supply Chain Optimization',
    'Sales & Distribution for Local Products'
  ],
  'Design & Aesthetics': [
    'Fashion Design',
    'Furniture Design',
    'Graphic Design',
    'Industrial Design',
    'Product Design',
    'UI/UX Design'
  ],
  'Education & Knowledge Transfer': [
    'Online Resource',
    'Local Workshops & Apprenticeships',
    'Makerspace / Fab Lab',
    'Open Source Education Platform',
    'University'
  ],
  'Engineering & Technical Development': [
    'Electrical Engineering',
    'Embedded Systems',
    'Hardware Engineering',
    'Materials Science',
    'Mechanical Engineering',
    'Mechatronics',
    'Robotics',
    'Software Engineering'
  ],
  'Fabrication & Manufacturing': [
    'Digital Fabrication (e.g., CNC, laser cutting, 3D printing)',
    'Mass Manufacturing',
    'Small Batch Manufacturing',
    'Traditional Fabrication (e.g., manual machining, mold making)'
  ],
  'Marketing': [
    'Branding',
    'Content Creation',
    'Copywriting',
    'Digital Marketing for Small Business',
    'Strategy'
  ],
  'Media & Storytelling': [
    'Audio Storytelling (e.g., podcasting)',
    'Documentary Filmmaking',
    'Photography',
    'Videography',
    'Visual Journalism'
  ],
  'Research & Human-Centered Design': [
    'Behavioral Design',
    'Biodesign',
    'Ethnographic Research',
    'Human Factors Research',
    'Usability Testing'
  ],
  'Sustainability & Regenerative Systems': [
    'Agroecology / Urban Farming',
    'Circular Design',
    'Energy Self-Sufficiency',
    'Local Resource Reuse (e.g., biowaste into material)',
    'Zero-Waste Production'
  ],
  'Technology & Coding': [
    'Coding Bootcamps & Tech Schools',
    'Low-Code/No-Code Tools',
    'Programming (General)',
    'Software Development'
  ],
  'Trades & Skilled Labor': [
    'Carpentry',
    'Electrical',
    'Factory Work',
    'HVAC',
    'Masonry',
    'Plumbing',
    'Tool & Die',
    'Welding'
  ]
};

// Certification system class
export class ProfileCertification {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 5;
    this.completionData = {};
    this.selectedCategories = new Set();
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    const user = getCurrentUser();
    if (!user) {
      console.log('No user found for certification initialization, retrying...');
      // Retry after a short delay
      setTimeout(() => this.initialize(), 500);
      return;
    }

    console.log('Initializing certification for user:', user.id);

    try {
      await this.loadCompletionData();
      await this.loadSelectedCategories();
      this.isInitialized = true;
      console.log('Certification initialization complete');
    } catch (error) {
      console.error('Error initializing certification system:', error);
    }
  }

  async loadCompletionData() {
    const user = getCurrentUser();
    if (!user) {
      console.log('No user found for loading completion data');
      return;
    }

    try {
      const { data, error } = await db.getProfileCompletionSteps(user.id);
      if (error) {
        console.error('Error loading completion steps:', error);
        // Don't throw error, just initialize with empty data
        this.completionData = {};
        return;
      }

      this.completionData = {};
      if (data) {
        data.forEach(step => {
          this.completionData[step.step_number] = step.is_completed;
        });
        console.log('Loaded completion data:', this.completionData);
      }

      // Find current step (first incomplete step)
      this.currentStep = 1;
      for (let i = 1; i <= this.totalSteps; i++) {
        if (!this.completionData[i]) {
          this.currentStep = i;
          break;
        }
      }
      if (this.getCompletionPercentage() === 100) {
        this.currentStep = this.totalSteps;
      }
      console.log('Current step:', this.currentStep, 'Completion:', this.getCompletionPercentage() + '%');
    } catch (error) {
      console.error('Error loading completion data:', error);
      this.completionData = {};
    }
  }

  async loadSelectedCategories() {
    const user = getCurrentUser();
    if (!user) {
      console.log('No user found for loading categories');
      return;
    }

    try {
      const { data, error } = await db.getProfileCategories(user.id);
      if (error) {
        console.error('Error loading categories:', error);
        // Don't throw error, just initialize with empty data
        this.selectedCategories.clear();
        return;
      }

      this.selectedCategories.clear();
      if (data) {
        data.forEach(category => {
          this.selectedCategories.add(`${category.category_group}:${category.category_name}`);
        });
        console.log('Loaded categories:', this.selectedCategories.size);
      }
    } catch (error) {
      console.error('Error loading selected categories:', error);
      this.selectedCategories.clear();
    }
  }

  getCompletionPercentage() {
    const completedSteps = Object.values(this.completionData).filter(Boolean).length;
    return Math.round((completedSteps / this.totalSteps) * 100);
  }

  isStepCompleted(stepNumber) {
    return this.completionData[stepNumber] || false;
  }

  async markStepCompleted(stepNumber) {
    const user = getCurrentUser();
    if (!user) return;

    try {
      const { error } = await db.updateProfileCompletionStep(user.id, stepNumber, true);
      if (error) throw error;

      this.completionData[stepNumber] = true;
      this.updateProgressDisplay();
    } catch (error) {
      console.error('Error marking step completed:', error);
    }
  }

  async saveSelectedCategories() {
    const user = getCurrentUser();
    if (!user) return;

    try {
      // Clear existing categories
      await db.clearProfileCategories(user.id);

      // Save new categories
      const categoriesToSave = Array.from(this.selectedCategories).map(categoryKey => {
        const [group, name] = categoryKey.split(':');
        return { category_group: group, category_name: name };
      });

      if (categoriesToSave.length > 0) {
        const { error } = await db.saveProfileCategories(user.id, categoriesToSave);
        if (error) throw error;
      }

      // Mark step 4 as completed if categories are selected
      if (categoriesToSave.length > 0) {
        await this.markStepCompleted(4);
      }
    } catch (error) {
      console.error('Error saving categories:', error);
      throw error;
    }
  }

  updateProgressDisplay() {
    const progressBar = document.querySelector('.certification-progress-fill');
    const progressText = document.querySelector('.certification-progress-text');
    const badge = document.querySelector('.certification-badge');
    
    const percentage = this.getCompletionPercentage();
    
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
    
    if (progressText) {
      progressText.textContent = `${percentage}% Complete`;
    }
    
    if (badge) {
      if (percentage === 100) {
        badge.classList.add('certified');
        badge.textContent = '✓ CERTIFIED';
      } else {
        badge.classList.remove('certified');
        badge.textContent = 'PENDING';
      }
    }
  }

  createCertificationWidget() {
    const percentage = this.getCompletionPercentage();
    const isCertified = percentage === 100;
    
    console.log('Creating certification widget - Percentage:', percentage, 'Certified:', isCertified);
    
    // Don't show widget if already certified
    if (isCertified) {
      return '';
    }
    
    return `
      <div class="certification-widget">
        <div class="certification-header">
          <h3>Become a Certified Account</h3>
          <div class="certification-badge ${isCertified ? 'certified' : ''}">
            ${isCertified ? '✓ CERTIFIED' : 'PENDING'}
          </div>
        </div>
        <div class="certification-progress">
          <div class="certification-progress-bar">
            <div class="certification-progress-fill" style="width: ${percentage}%"></div>
          </div>
          <span class="certification-progress-text">${percentage}% Complete</span>
        </div>
        <p class="certification-description">
          Complete your profile to gain full Pro Access and appear on the Community Page
        </p>
        <button class="sqr-btn certification-start-btn">
          ${isCertified ? 'VIEW CERTIFICATION' : 'CONTINUE SETUP'}
        </button>
      </div>
    `;
  }

  createStepContent(stepNumber) {
    switch (stepNumber) {
      case 1:
        return this.createStep1Content();
      case 2:
        return this.createStep2Content();
      case 3:
        return this.createStep3Content();
      case 4:
        return this.createStep4Content();
      case 5:
        return this.createStep5Content();
      default:
        return '<p>Invalid step</p>';
    }
  }

  createStep1Content() {
    return `
      <div class="certification-step">
        <h3>Step 1 of 5</h3>
        <h4>Is this account for a:</h4>
        <p class="required-label">(Required)</p>
        <div class="account-type-options">
          <label class="radio-option">
            <input type="radio" name="accountType" value="person" required>
            <span class="radio-label">Person</span>
          </label>
          <label class="radio-option">
            <input type="radio" name="accountType" value="business" required>
            <span class="radio-label">Business/Company</span>
          </label>
          <label class="radio-option">
            <input type="radio" name="accountType" value="education" required>
            <span class="radio-label">Educational Institution</span>
          </label>
        </div>
      </div>
    `;
  }

  createStep2Content() {
    return `
      <div class="certification-step">
        <h3>Step 2 of 5</h3>
        <h4>Name of Person, Business/Company, or Institution</h4>
        <p class="required-label">(Required)</p>
        <input type="text" id="fullName" class="form-input" placeholder="Enter full name" required>
        
        <h4>Upload a Square 80 x 80px Picture</h4>
        <p>Picture of Yourself or Logo of your Business/Company or Institution</p>
        <input type="file" id="profilePicture" accept="image/*" class="form-input">
        
        <h4>Add Links</h4>
        <p>(Not Required)</p>
        <div class="links-section">
          <input type="url" id="website" class="form-input" placeholder="Website">
          <input type="email" id="email" class="form-input" placeholder="Email">
          <input type="tel" id="phone" class="form-input" placeholder="Phone">
          <input type="url" id="facebook" class="form-input" placeholder="Facebook">
          <input type="url" id="instagram" class="form-input" placeholder="Instagram">
          <input type="url" id="linkedin" class="form-input" placeholder="LinkedIn">
        </div>
      </div>
    `;
  }

  createStep3Content() {
    return `
      <div class="certification-step">
        <h3>Step 3 of 5</h3>
        <h4>Add Location</h4>
        <p class="location-help">Your location will be used to show you on the community map. We'll automatically find the coordinates for your city or address.</p>
        
        <label for="city">City</label>
        <p class="required-label">(Required)</p>
        <input type="text" id="city" class="form-input" placeholder="e.g., Manila, Makati, Cebu" required>
        
        <label for="address">Specific Address (Optional)</label>
        <p>If you provide a specific address, we'll use that for more precise location on the map</p>
        <input type="text" id="address" class="form-input" placeholder="e.g., 123 Main Street, Makati City">
        
        <h4>Would you like to keep your address private or public?</h4>
        <div class="privacy-options">
          <label class="radio-option">
            <input type="radio" name="addressPrivacy" value="private" checked>
            <span class="radio-label">Private (Default)</span>
          </label>
          <label class="radio-option">
            <input type="radio" name="addressPrivacy" value="public">
            <span class="radio-label">Public</span>
          </label>
        </div>
        
        <div class="location-preview" id="locationPreview" style="display: none;">
          <h4>Location Preview</h4>
          <p id="locationPreviewText"></p>
          <small>This is how your location will appear on the map</small>
        </div>
      </div>
    `;
  }

  createStep4Content() {
    const categoriesHtml = Object.entries(PROFILE_CATEGORIES).map(([group, categories]) => `
      <div class="category-group">
        <h4>
          <label class="category-group-label">
            <input type="checkbox" class="category-group-checkbox" data-group="${group}">
            <strong>${group}</strong>
          </label>
        </h4>
        <div class="category-items">
          ${categories.map(category => `
            <label class="category-item">
              <input type="checkbox" class="category-checkbox" data-group="${group}" data-category="${category}">
              <span>${category}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `).join('');

    return `
      <div class="certification-step">
        <h3>Step 4 of 5</h3>
        <h4>Select any categories that apply to Yourself or the Services your Business provides.</h4>
        <p>(Select all that apply - Recommended)</p>
        <div class="categories-container">
          ${categoriesHtml}
          <div class="category-group">
            <h4>
              <label class="category-group-label">
                <input type="checkbox" class="category-group-checkbox" data-group="Other">
                <strong>Other:</strong>
              </label>
            </h4>
            <div class="category-items">
              <input type="text" id="otherCategory" class="form-input" placeholder="Specify other category">
            </div>
          </div>
        </div>
      </div>
    `;
  }

  createStep5Content() {
    return `
      <div class="certification-step">
        <h3>Step 5 of 5</h3>
        <h4>Add Bio</h4>
        <p>(120 Word Limit)</p>
        <textarea id="bio" class="form-input bio-textarea" placeholder="Tell us about yourself..." maxlength="600"></textarea>
        <div class="word-count">
          <span id="wordCount">0</span> / 120 words
        </div>
      </div>
    `;
  }

  showCertificationModal() {
    console.log('Showing certification modal for step:', this.currentStep);
    const modal = document.createElement('div');
    modal.className = 'certification-modal';
    modal.innerHTML = `
      <div class="certification-modal-content">
        <div class="certification-modal-header">
          <h3>Complete Your Profile</h3>
          <button class="modal-close certification-close">&times;</button>
        </div>
        <div class="certification-progress-header">
          <div class="certification-progress">
            <div class="certification-progress-bar">
              <div class="certification-progress-fill" style="width: ${this.getCompletionPercentage()}%"></div>
            </div>
            <span class="certification-progress-text">${this.getCompletionPercentage()}% Complete</span>
          </div>
        </div>
        <div class="certification-step-content">
          ${this.createStepContent(this.currentStep)}
        </div>
        <div class="certification-modal-footer">
          <button class="sqr-btn certification-prev-btn" ${this.currentStep === 1 ? 'disabled' : ''}>PREVIOUS</button>
          <button class="sqr-btn certification-next-btn">
            ${this.currentStep === this.totalSteps ? 'COMPLETE' : 'NEXT'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.initializeModalEvents(modal);
    this.loadCurrentStepData();
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }

  initializeModalEvents(modal) {
    const closeBtn = modal.querySelector('.certification-close');
    const prevBtn = modal.querySelector('.certification-prev-btn');
    const nextBtn = modal.querySelector('.certification-next-btn');

    closeBtn.addEventListener('click', () => {
      document.body.style.overflow = '';
      document.body.removeChild(modal);
    });

    prevBtn.addEventListener('click', () => {
      if (this.currentStep > 1) {
        this.currentStep--;
        this.updateModalContent(modal);
      }
    });

    nextBtn.addEventListener('click', async () => {
      if (await this.validateAndSaveCurrentStep(modal)) {
        if (this.currentStep < this.totalSteps) {
          this.currentStep++;
          this.updateModalContent(modal);
        } else {
          // Complete certification
          await this.completeCertification();
          document.body.style.overflow = '';
          document.body.removeChild(modal);
          this.showCertificationCompleteMessage();
        }
      }
    });

    // Add event listeners for step 4 category selection
    this.initializeCategoryEvents(modal);
    
    // Add event listener for bio word count
    this.initializeBioWordCount(modal);
  }

  initializeCategoryEvents(modal) {
    // Group checkbox handlers
    modal.addEventListener('change', (e) => {
      if (e.target.classList.contains('category-group-checkbox')) {
        const group = e.target.dataset.group;
        const isChecked = e.target.checked;
        const categoryCheckboxes = modal.querySelectorAll(`input[data-group="${group}"].category-checkbox`);
        
        categoryCheckboxes.forEach(checkbox => {
          checkbox.checked = isChecked;
          this.updateCategorySelection(checkbox);
        });
      } else if (e.target.classList.contains('category-checkbox')) {
        this.updateCategorySelection(e.target);
        this.updateGroupCheckbox(modal, e.target.dataset.group);
      }
    });
  }

  updateCategorySelection(checkbox) {
    const categoryKey = `${checkbox.dataset.group}:${checkbox.dataset.category}`;
    if (checkbox.checked) {
      this.selectedCategories.add(categoryKey);
    } else {
      this.selectedCategories.delete(categoryKey);
    }
  }

  updateGroupCheckbox(modal, group) {
    const groupCheckbox = modal.querySelector(`input[data-group="${group}"].category-group-checkbox`);
    const categoryCheckboxes = modal.querySelectorAll(`input[data-group="${group}"].category-checkbox`);
    const checkedCount = Array.from(categoryCheckboxes).filter(cb => cb.checked).length;
    
    if (groupCheckbox) {
      groupCheckbox.checked = checkedCount > 0;
      groupCheckbox.indeterminate = checkedCount > 0 && checkedCount < categoryCheckboxes.length;
    }
  }

  initializeBioWordCount(modal) {
    const bioTextarea = modal.querySelector('#bio');
    const wordCountSpan = modal.querySelector('#wordCount');
    
    if (bioTextarea && wordCountSpan) {
      bioTextarea.addEventListener('input', () => {
        const words = bioTextarea.value.trim().split(/\s+/).filter(word => word.length > 0);
        const wordCount = bioTextarea.value.trim() === '' ? 0 : words.length;
        wordCountSpan.textContent = wordCount;
        
        if (wordCount > 120) {
          wordCountSpan.style.color = 'var(--secondary-color)';
        } else {
          wordCountSpan.style.color = 'var(--text-color)';
        }
      });
    }
  }

  async loadCurrentStepData() {
    const user = getCurrentUser();
    if (!user) return;

    try {
      const { data: profile } = await db.getProfile(user.id);
      if (!profile) return;

      // Load data based on current step
      switch (this.currentStep) {
        case 1:
          if (profile.account_type) {
            const radio = document.querySelector(`input[value="${profile.account_type}"]`);
            if (radio) radio.checked = true;
          }
          break;
        case 2:
          if (profile.full_name) {
            const nameInput = document.getElementById('fullName');
            if (nameInput) nameInput.value = profile.full_name;
          }
          // Load other fields
          ['website', 'email', 'phone', 'facebook', 'instagram', 'linkedin'].forEach(field => {
            const input = document.getElementById(field);
            if (input && profile[field]) {
              input.value = profile[field];
            }
          });
          break;
        case 3:
          if (profile.city) {
            const cityInput = document.getElementById('city');
            if (cityInput) cityInput.value = profile.city;
          }
          if (profile.address) {
            const addressInput = document.getElementById('address');
            if (addressInput) addressInput.value = profile.address;
          }
          if (profile.address_privacy) {
            const radio = document.querySelector(`input[value="${profile.address_privacy}"]`);
            if (radio) radio.checked = true;
          }
          break;
        case 4:
          // Load selected categories
          this.selectedCategories.forEach(categoryKey => {
            const [group, category] = categoryKey.split(':');
            const checkbox = document.querySelector(`input[data-group="${group}"][data-category="${category}"]`);
            if (checkbox) {
              checkbox.checked = true;
              this.updateGroupCheckbox(document.querySelector('.certification-modal'), group);
            }
          });
          break;
        case 5:
          if (profile.bio) {
            const bioTextarea = document.getElementById('bio');
            if (bioTextarea) {
              bioTextarea.value = profile.bio;
              // Trigger word count update
              bioTextarea.dispatchEvent(new Event('input'));
            }
          }
          break;
      }
    } catch (error) {
      console.error('Error loading step data:', error);
    }
  }

  async validateAndSaveCurrentStep(modal) {
    const user = getCurrentUser();
    if (!user) return false;

    try {
      switch (this.currentStep) {
        case 1:
          const accountType = modal.querySelector('input[name="accountType"]:checked');
          if (!accountType) {
            this.showError('Please select an account type');
            return false;
          }
          await db.updateProfile(user.id, { account_type: accountType.value });
          await this.markStepCompleted(1);
          break;

        case 2:
          const fullName = modal.querySelector('#fullName').value.trim();
          if (!fullName) {
            this.showError('Please enter your full name');
            return false;
          }
          
          const updateData = { full_name: fullName };
          
          // Handle optional fields
          ['website', 'email', 'phone', 'facebook', 'instagram', 'linkedin'].forEach(field => {
            const input = modal.querySelector(`#${field}`);
            if (input && input.value.trim()) {
              updateData[field] = input.value.trim();
            }
          });

          await db.updateProfile(user.id, updateData);
          
          // Handle profile picture upload
          const profilePictureInput = modal.querySelector('#profilePicture');
          if (profilePictureInput.files[0]) {
            await this.handleProfilePictureUpload(profilePictureInput.files[0]);
          }
          
          await this.markStepCompleted(2);
          break;

        case 3:
          const city = modal.querySelector('#city').value.trim();
          if (!city) {
            this.showError('Please enter your city');
            return false;
          }
          
          const address = modal.querySelector('#address').value.trim();
          const addressPrivacy = modal.querySelector('input[name="addressPrivacy"]:checked').value;
          
          // First update the basic profile data
          const profileUpdate = {
            city,
            address: address || null,
            address_privacy: addressPrivacy
          };
          
          await db.updateProfile(user.id, profileUpdate);
          
          // Then geocode the location
          await this.geocodeAndUpdateLocation(city, address);
          
          await this.markStepCompleted(3);
          break;

        case 4:
          // Handle other category
          const otherCategoryInput = modal.querySelector('#otherCategory');
          if (otherCategoryInput && otherCategoryInput.value.trim()) {
            const otherCategoryName = otherCategoryInput.value.trim();
            
            // Save as category request instead of adding directly
            try {
              await db.saveCategoryRequest(user.id, 'Other', otherCategoryName);
              console.log('Category request submitted:', otherCategoryName);
              
              // Show success message to user
              this.showSuccess(`Category request "${otherCategoryName}" submitted for review. Thank you for your suggestion!`);
              
              // Clear the input
              otherCategoryInput.value = '';
            } catch (error) {
              console.error('Error submitting category request:', error);
              this.showError('Failed to submit category request. Please try again.');
              return false;
            }
          }
          
          await this.saveSelectedCategories();
          // Step completion is handled in saveSelectedCategories
          break;

        case 5:
          const bio = modal.querySelector('#bio').value.trim();
          const words = bio.split(/\s+/).filter(word => word.length > 0);
          
          if (words.length > 120) {
            this.showError('Bio must be 120 words or less');
            return false;
          }
          
          await db.updateProfile(user.id, { bio });
          await this.markStepCompleted(5);
          break;
      }
      
      return true;
    } catch (error) {
      console.error('Error saving step:', error);
      this.showError('Error saving data. Please try again.');
      return false;
    }
  }

  async geocodeAndUpdateLocation(city, address) {
    const user = getCurrentUser();
    if (!user) return;

    try {
      console.log('Geocoding location:', { city, address });
      
      // Use the geocoding service to get coordinates
      const result = await geocodingService.geocodeLocation(city, address);
      
      if (result) {
        console.log('Geocoding successful:', result);
        
        // Update the profile with coordinates
        await db.updateProfileLocation(user.id, {
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

  async handleProfilePictureUpload(file) {
    const user = getCurrentUser();
    if (!user) return;

    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image must be smaller than 5MB');
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Image = event.target.result;
          let avatarUrl = base64Image;

          // Try Supabase Storage first, then fallback to database
          try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await db.uploadProfilePicture(fileName, file);
            
            if (!uploadError) {
              const { data: urlData } = await db.getProfilePictureUrl(fileName);
              avatarUrl = urlData?.publicUrl || base64Image;
            }
          } catch (storageError) {
            console.warn('Storage upload failed, using base64 fallback:', storageError);
          }

          await db.updateProfile(user.id, { avatar_url: avatarUrl });
        } catch (error) {
          console.error('Error processing profile picture:', error);
          throw error;
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }

  updateModalContent(modal) {
    const stepContent = modal.querySelector('.certification-step-content');
    const prevBtn = modal.querySelector('.certification-prev-btn');
    const nextBtn = modal.querySelector('.certification-next-btn');
    
    stepContent.innerHTML = this.createStepContent(this.currentStep);
    
    prevBtn.disabled = this.currentStep === 1;
    nextBtn.textContent = this.currentStep === this.totalSteps ? 'COMPLETE' : 'NEXT';
    
    this.updateProgressDisplay();
    this.initializeCategoryEvents(modal);
    this.initializeBioWordCount(modal);
    this.loadCurrentStepData();
    
    // Initialize location preview for step 3
    if (this.currentStep === 3) {
      this.initializeLocationPreview(modal);
    }
  }

  initializeLocationPreview(modal) {
    const cityInput = modal.querySelector('#city');
    const addressInput = modal.querySelector('#address');
    const preview = modal.querySelector('#locationPreview');
    const previewText = modal.querySelector('#locationPreviewText');
    
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

  async completeCertification() {
    const user = getCurrentUser();
    if (!user) return;

    try {
      // Final update to ensure certification status is current
      await db.updateCertificationStatus(user.id);
      await this.loadCompletionData();
    } catch (error) {
      console.error('Error completing certification:', error);
    }
  }

  showCertificationCompleteMessage() {
    console.log('Showing certification complete message');
    const message = document.createElement('div');
    message.className = 'certification-complete-message';
    message.innerHTML = `
      <div class="certification-complete-content">
        <div class="certification-complete-icon">✓</div>
        <h3>Congratulations!</h3>
        <p>Your profile is now certified and will appear on the Community Page.</p>
        <button class="sqr-btn certification-complete-close">CONTINUE</button>
      </div>
    `;
    
    document.body.appendChild(message);
    
    message.querySelector('.certification-complete-close').addEventListener('click', () => {
      document.body.removeChild(message);
      document.body.style.overflow = '';
      // Refresh the page to show updated certification status
      window.location.reload();
    });
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  showSuccess(message) {
    // Create a simple success display
    const existingSuccess = document.querySelector('.certification-success');
    if (existingSuccess) {
      existingSuccess.remove();
    }
    
    // For now, use the same styling as error but with different class
    this.showError(message, 'certification-success');
  }

  showError(message) {
    // Create a simple error display
    const existingError = document.querySelector('.certification-error');
    if (existingError) {
      existingError.remove();
    }
    
    const error = document.createElement('div');
    error.className = 'certification-error';
    error.textContent = message;
    
    const modal = document.querySelector('.certification-modal-content');
    if (modal) {
      modal.insertBefore(error, modal.querySelector('.certification-step-content'));
      
      setTimeout(() => {
        if (error.parentNode) {
          error.parentNode.removeChild(error);
        }
      }, 5000);
    }
  }
}