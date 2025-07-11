import { db, auth } from './supabase.js';
import { getCurrentUser, getUserProfile } from './auth.js';
import { PROFILE_CATEGORIES, geocodingService } from './certification.js';

// Global certification instance
let certification = null;
let selectedCategories = new Set();

// Initialize profile page
export function initProfilePage() {
  const urlParams = new URLSearchParams(window.location.search);
  const profileId = urlParams.get('id');
  
  if (profileId) {
    // Load specific user's profile
    loadUserProfile(profileId);
  } else {
    // Load current user's profile
    const currentUser = getCurrentUser();
    if (currentUser) {
      loadUserProfile(currentUser.id);
    } else {
      // Wait for auth to initialize, then try again
      setTimeout(() => {
        const user = getCurrentUser();
        if (user) {
          loadUserProfile(user.id);
        } else {
          // Show message instead of redirecting
          showError('Please sign in to view your profile');
          // Optionally redirect to home page instead of search
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 2000);
        }
      }, 1000);
    }
  }
}

// Load user profile
async function loadUserProfile(userId) {
  const currentUser = getCurrentUser();
  const isOwnProfile = currentUser && currentUser.id === userId;
  
  try {
    // Load profile data
    const { data: profile, error: profileError } = await db.getProfile(userId);
    if (profileError) throw profileError;
    
    // Check if profile exists
    if (!profile) {
      showError('Profile not found');
      return;
    }
    
    // Load user posts
    const { data: posts, error: postsError } = await db.getUserPosts(userId);
    if (postsError) throw postsError;
    
    // Load ratings
    const { data: ratings, error: ratingsError } = await db.getUserRatings(userId);
    if (ratingsError) throw ratingsError;
    
    // Load average rating
    const { average, count } = await db.getUserAverageRating(userId);
    
    // Load followers/following counts
    const { data: followers } = await db.getFollowers(userId);
    const { data: following } = await db.getFollowing(userId);
    
    // Check if current user is following this profile
    let isFollowing = false;
    if (currentUser && !isOwnProfile) {
      const { data } = await db.isFollowing(currentUser.id, userId);
      isFollowing = data;
    }
    
    // Update UI
    updateProfileUI(profile, posts, ratings, average, count, followers?.length || 0, following?.length || 0, isOwnProfile, isFollowing);
    
    // Render certification widget if this is the user's own profile
    if (isOwnProfile && !profile.is_certified) {
      await renderCertificationWidget();
    }
    
  } catch (error) {
    console.error('Error loading profile:', error);
    showError('Failed to load profile');
  }
}

// Update profile UI
function updateProfileUI(profile, posts, ratings, averageRating, ratingCount, followersCount, followingCount, isOwnProfile, isFollowing) {
  // Update profile header
  document.getElementById('profileAvatar').src = profile.avatar_url || 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png';
  
  // Update profile name with certification checkmark if certified
  const profileNameElement = document.getElementById('profileName');
  const displayName = profile.full_name || profile.username;
  
  if (profile.is_certified) {
    profileNameElement.innerHTML = `${displayName} <span class="profile-certified-checkmark">✓</span>`;
  } else {
    profileNameElement.textContent = displayName;
  }
  
  document.getElementById('profileUsername').textContent = `@${profile.username}`;
  document.getElementById('profileBio').textContent = profile.bio || 'No bio available';
  document.getElementById('profileLocation').textContent = profile.location || '';
  document.getElementById('profileWebsite').href = profile.website || '#';
  document.getElementById('profileWebsite').textContent = profile.website || '';
  
  // Update stats
  document.getElementById('postsCount').textContent = posts.length;
  document.getElementById('followersCount').textContent = followersCount;
  document.getElementById('followingCount').textContent = followingCount;
  document.getElementById('averageRating').textContent = averageRating.toFixed(1);
  document.getElementById('ratingCount').textContent = `(${ratingCount} reviews)`;
  
  // Update rating stars
  updateRatingStars(averageRating);
  
  // Show/hide action buttons
  const followButton = document.getElementById('followButton');
  const editProfileButton = document.getElementById('editProfileButton');
  const rateUserButton = document.getElementById('rateUserButton');
  
  if (isOwnProfile) {
    followButton.style.display = 'none';
    rateUserButton.style.display = 'none';
    editProfileButton.style.display = 'block';
    
    // Show upload button for own profile
    const uploadBtn = document.getElementById('uploadProfilePictureBtn');
    if (uploadBtn) {
      uploadBtn.style.display = 'block';
    }
  } else {
    editProfileButton.style.display = 'none';
    followButton.style.display = 'block';
    rateUserButton.style.display = 'block';
    
    // Hide upload button for other profiles
    const uploadBtn = document.getElementById('uploadProfilePictureBtn');
    if (uploadBtn) {
      uploadBtn.style.display = 'none';
    }
    
    followButton.textContent = isFollowing ? 'UNFOLLOW' : 'FOLLOW';
    followButton.dataset.following = isFollowing;
    followButton.dataset.userId = profile.id;
  }
  
  // Update posts feed
  updatePostsFeed(posts);
  
  // Update ratings section
  updateRatingsSection(ratings);
}

// Update rating stars display
function updateRatingStars(rating) {
  const starsContainer = document.getElementById('ratingStars');
  starsContainer.innerHTML = '';
  
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.className = 'star';
    star.textContent = i <= rating ? '★' : '☆';
    starsContainer.appendChild(star);
  }
}

// Update posts feed
function updatePostsFeed(posts) {
  const postsContainer = document.getElementById('postsContainer');
  
  if (posts.length === 0) {
    postsContainer.innerHTML = '<p class="no-posts">No posts yet</p>';
    return;
  }
  
  postsContainer.innerHTML = posts.map(post => createPostCard(post)).join('');
}

// Create post card
function createPostCard(post) {
  const timeAgo = getTimeAgo(new Date(post.created_at));
  
  return `
    <div class="post-card">
      <div class="post-header">
        <img src="${post.profiles.avatar_url || 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png'}" alt="${post.profiles.username}" class="post-avatar">
        <div class="post-info">
          <h4>${post.profiles.full_name || post.profiles.username}</h4>
          <span class="post-time">${timeAgo}</span>
        </div>
      </div>
      <div class="post-content">
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        ${post.image_url ? `<img src="${post.image_url}" alt="Post image" class="post-image">` : ''}
      </div>
      <div class="post-tags">
        ${post.tags ? post.tags.map(tag => `<span class="tag">${tag.toUpperCase()}</span>`).join('') : ''}
      </div>
    </div>
  `;
}

// Update ratings section
function updateRatingsSection(ratings) {
  const ratingsContainer = document.getElementById('ratingsContainer');
  
  if (ratings.length === 0) {
    ratingsContainer.innerHTML = '<p class="no-ratings">No reviews yet</p>';
    return;
  }
  
  ratingsContainer.innerHTML = ratings.map(rating => createRatingCard(rating)).join('');
}

// Create rating card
function createRatingCard(rating) {
  const timeAgo = getTimeAgo(new Date(rating.created_at));
  const stars = '★'.repeat(rating.rating) + '☆'.repeat(5 - rating.rating);
  
  return `
    <div class="rating-card">
      <div class="rating-header">
        <img src="${rating.profiles.avatar_url || 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png'}" alt="${rating.profiles.username}" class="rating-avatar">
        <div class="rating-info">
          <h4>${rating.profiles.full_name || rating.profiles.username}</h4>
          <div class="rating-stars">${stars}</div>
          <span class="rating-time">${timeAgo}</span>
        </div>
      </div>
      ${rating.comment ? `<p class="rating-comment">${rating.comment}</p>` : ''}
    </div>
  `;
}

// Initialize profile interactions
export function initProfileInteractions() {
  // Follow/unfollow button
  const followButton = document.getElementById('followButton');
  if (followButton) {
    followButton.addEventListener('click', handleFollowToggle);
  }
  
  // Rate user button
  const rateUserButton = document.getElementById('rateUserButton');
  if (rateUserButton) {
    rateUserButton.addEventListener('click', showRatingModal);
  }
  
  // Edit profile button
  const editProfileButton = document.getElementById('editProfileButton');
  if (editProfileButton) {
    editProfileButton.addEventListener('click', showEditProfileModal);
  }
  
  // Profile picture upload
  const profilePictureInput = document.getElementById('profilePictureInput');
  const uploadProfilePictureBtn = document.getElementById('uploadProfilePictureBtn');
  
  if (uploadProfilePictureBtn && profilePictureInput) {
    uploadProfilePictureBtn.addEventListener('click', () => {
      profilePictureInput.click();
    });
    
    profilePictureInput.addEventListener('change', handleProfilePictureUpload);
  }
  
  // Rating modal
  initRatingModal();
  
  // Edit profile modal
  initEditProfileModal();
}

// Handle profile picture upload
async function handleProfilePictureUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showError('Please select an image file');
    return;
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showError('Image must be smaller than 5MB');
    return;
  }
  
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showError('Please sign in to upload a profile picture');
    return;
  }
  
  try {
    // Show loading state
    const uploadBtn = document.getElementById('uploadProfilePictureBtn');
    const originalText = uploadBtn.textContent;
    uploadBtn.textContent = 'UPLOADING...';
    uploadBtn.disabled = true;
    
    // Convert image to base64
    const reader = new FileReader();
    reader.onload = async function(event) {
      try {
        const base64Image = event.target.result;
        
        let avatarUrl;
        
        // Try Supabase Storage first, then fallback to database
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await db.uploadProfilePicture(fileName, file);
          
          if (uploadError) {
            console.warn('Supabase Storage upload failed, using database fallback:', uploadError);
            // Save to database as fallback
            await db.saveProfilePictureRecord(currentUser.id, base64Image, file.type, file.size);
            avatarUrl = base64Image;
          } else {
            // Get public URL from Supabase Storage
            const { data: urlData } = await db.getProfilePictureUrl(fileName);
            avatarUrl = urlData?.publicUrl || base64Image;
            
            // Save record to database with both storage path and data
            await db.saveProfilePictureWithStorage(currentUser.id, base64Image, fileName, file.type, file.size);
          }
        } catch (storageError) {
          console.warn('Storage operation failed, using database fallback:', storageError);
          // Save to database as fallback
          await db.saveProfilePictureRecord(currentUser.id, base64Image, file.type, file.size);
          avatarUrl = base64Image;
        }
        
        // Update profile with new avatar URL
        await db.updateProfile(currentUser.id, { avatar_url: avatarUrl });
        
        // Update UI
        document.getElementById('profileAvatar').src = avatarUrl;
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
          userAvatar.src = avatarUrl;
        }
        
        showSuccess('Profile picture updated successfully!');
        
      } catch (error) {
        console.error('Error processing profile picture:', error);
        showError('Failed to upload profile picture. Please try again.');
      } finally {
        // Reset button state
        const uploadBtn = document.getElementById('uploadProfilePictureBtn');
        uploadBtn.textContent = originalText;
        uploadBtn.disabled = false;
      }
    };
    
    reader.onerror = function() {
      showError('Failed to read the image file');
      // Reset button state
      const uploadBtn = document.getElementById('uploadProfilePictureBtn');
      uploadBtn.textContent = originalText;
      uploadBtn.disabled = false;
    };
    
    // Read the file as base64
    reader.readAsDataURL(file);
    
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    showError(`Failed to upload profile picture: ${error.message}`);
    
    // Reset button state
    const uploadBtn = document.getElementById('uploadProfilePictureBtn');
    uploadBtn.textContent = 'UPLOAD PICTURE';
    uploadBtn.disabled = false;
  }
}

// Handle follow/unfollow
async function handleFollowToggle(e) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showError('Please sign in to follow users');
    return;
  }
  
  const button = e.target;
  const userId = button.dataset.userId;
  const isFollowing = button.dataset.following === 'true';
  
  try {
    if (isFollowing) {
      await db.unfollowUser(currentUser.id, userId);
      button.textContent = 'FOLLOW';
      button.dataset.following = 'false';
    } else {
      await db.followUser(currentUser.id, userId);
      button.textContent = 'UNFOLLOW';
      button.dataset.following = 'true';
    }
    
    // Reload profile to update counts
    loadUserProfile(userId);
    
  } catch (error) {
    console.error('Error toggling follow:', error);
    showError('Failed to update follow status');
  }
}

// Show rating modal
function showRatingModal() {
  const modal = document.getElementById('ratingModal');
  modal.classList.remove('hidden');
}

// Initialize rating modal
function initRatingModal() {
  const modal = document.getElementById('ratingModal');
  const closeButton = document.getElementById('closeRatingModal');
  const form = document.getElementById('ratingForm');
  const stars = document.querySelectorAll('.rating-star');
  
  let selectedRating = 0;
  
  // Close modal
  closeButton.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
  
  // Star selection
  stars.forEach((star, index) => {
    star.addEventListener('click', () => {
      selectedRating = index + 1;
      updateStarSelection(stars, selectedRating);
    });
  });
  
  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      showError('Please sign in to rate users');
      return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const profileId = urlParams.get('id');
    const comment = form.comment.value;
    
    try {
      await db.rateUser(currentUser.id, profileId, selectedRating, comment);
      modal.classList.add('hidden');
      showSuccess('Rating submitted successfully');
      
      // Reload profile to show new rating
      loadUserProfile(profileId);
      
    } catch (error) {
      console.error('Error submitting rating:', error);
      showError('Failed to submit rating');
    }
  });
}

// Update star selection
function updateStarSelection(stars, rating) {
  stars.forEach((star, index) => {
    star.classList.toggle('selected', index < rating);
  });
}

// Show edit profile modal
function showEditProfileModal() {
  selectedCategories = new Set();
  const modal = document.getElementById('editProfileModal');
  const userProfile = getUserProfile();
  
  // Pre-fill form with current data
  document.getElementById('editFullName').value = userProfile.full_name || '';
  document.getElementById('editUsername').value = userProfile.username || '';
  document.getElementById('editBio').value = userProfile.bio || '';
  document.getElementById('editLocation').value = userProfile.location || '';
  document.getElementById('editWebsite').value = userProfile.website || '';
  
  
  // Show certification section if user is certified
  const certificationSection = document.getElementById('editProfileCertificationSection');
  if (userProfile.is_certified && certificationSection) {
    certificationSection.style.display = 'block';
    
    // Pre-fill certification fields
    document.getElementById('editCity').value = userProfile.city || '';
    document.getElementById('editAddress').value = userProfile.address || '';
    document.getElementById('editPhone').value = userProfile.phone || '';
    document.getElementById('editFacebook').value = userProfile.facebook || '';
    document.getElementById('editInstagram').value = userProfile.instagram || '';
    document.getElementById('editLinkedin').value = userProfile.linkedin || '';
    
    // Set address privacy
    const privacyValue = userProfile.address_privacy || 'private';
    const privacyRadio = document.querySelector(`input[name="editAddressPrivacy"][value="${privacyValue}"]`);
    if (privacyRadio) {
      privacyRadio.checked = true;
    }
    
    // Generate categories UI
    generateCategoriesUI();
    
    // Load user's selected categories
    loadUserCategories(userProfile.id);
    
    // Initialize location preview
    initializeLocationPreview();
  } else if (certificationSection) {
    certificationSection.style.display = 'none';
  }
  
  modal.classList.remove('hidden');
}

// Generate categories UI
function generateCategoriesUI() {
  const categoriesContainer = document.getElementById('editProfileCategories');
  if (!categoriesContainer) return;
  
  let categoriesHtml = '';
  
  Object.entries(PROFILE_CATEGORIES).forEach(([group, categories]) => {
    categoriesHtml += `
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
    `;
  });
  
  categoriesContainer.innerHTML = categoriesHtml;
  
  // Add event listeners for category checkboxes
  initializeCategoryEvents();
}

// Initialize category events
function initializeCategoryEvents() {
  const modal = document.getElementById('editProfileModal');
  
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

// Load user categories
async function loadUserCategories(userId) {
  try {
    const { data, error } = await db.getProfileCategories(userId);
    if (error) throw error;
    
    if (data && data.length > 0) {
      // Clear previous selections
      selectedCategories.clear();
      
      // Add each category to the set
      data.forEach(cat => {
        const categoryKey = `${cat.category_group}:${cat.category_name}`;
        selectedCategories.add(categoryKey);
        
        // Check the corresponding checkbox
        const checkbox = document.querySelector(`input[data-group="${cat.category_group}"][data-category="${cat.category_name}"]`);
        if (checkbox) {
          checkbox.checked = true;
          updateGroupCheckbox(cat.category_group);
        }
      });
    }
  } catch (error) {
    console.error('Error loading user categories:', error);
  }
}

// Update category selection
function updateCategorySelection(checkbox) {
  const categoryKey = `${checkbox.dataset.group}:${checkbox.dataset.category}`;
  if (checkbox.checked) {
    selectedCategories.add(categoryKey);
  } else {
    selectedCategories.delete(categoryKey);
  }
}

// Update group checkbox state
function updateGroupCheckbox(group) {
  const modal = document.getElementById('editProfileModal');
  const groupCheckbox = modal.querySelector(`input[data-group="${group}"].category-group-checkbox`);
  const categoryCheckboxes = modal.querySelectorAll(`input[data-group="${group}"].category-checkbox`);
  const checkedCount = Array.from(categoryCheckboxes).filter(cb => cb.checked).length;
  
  if (groupCheckbox) {
    groupCheckbox.checked = checkedCount > 0;
    groupCheckbox.indeterminate = checkedCount > 0 && checkedCount < categoryCheckboxes.length;
  }
}

// Initialize location preview
function initializeLocationPreview() {
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
  
  modal.classList.remove('hidden');
}

// Initialize edit profile modal
function initEditProfileModal() {
  const modal = document.getElementById('editProfileModal');
  const closeButton = document.getElementById('closeEditProfileModal');
  const form = document.getElementById('editProfileForm');
  
  // Close modal
  closeButton.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
  
  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) return;
      
      const formData = new FormData(e.target);
      const updates = {
        full_name: formData.get('fullName'),
        username: formData.get('username'),
        bio: formData.get('bio'),
        location: formData.get('location'),
        website: formData.get('website')
      };
      
      // Add certification fields if user is certified
      const userProfile = getUserProfile();
      if (userProfile.is_certified) {
        updates.city = formData.get('city') || null;
        updates.address = formData.get('address') || null;
        updates.phone = formData.get('phone') || null;
        updates.facebook = formData.get('facebook') || null;
        updates.instagram = formData.get('instagram') || null;
        updates.linkedin = formData.get('linkedin') || null;
        updates.address_privacy = formData.get('editAddressPrivacy') || 'private';
        
        // Update categories
        await updateUserCategories(currentUser.id);
        
        // Update location coordinates
        const city = formData.get('city');
        const address = formData.get('address');
        if (city) {
          await geocodeAndUpdateLocation(currentUser.id, city, address);
        }
      }
    
      // Update profile
      await db.updateProfile(currentUser.id, updates);
      modal.classList.add('hidden');
      showSuccess('Profile updated successfully');
      
      // Reload profile
      loadUserProfile(currentUser.id);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Failed to update profile');
    }
  });
}

// Update user categories
async function updateUserCategories(userId) {
  try {
    // Clear existing categories
    await db.clearProfileCategories(userId);
    
    // Save new categories
    if (selectedCategories.size > 0) {
      const categoriesToSave = Array.from(selectedCategories).map(categoryKey => {
        const [group, name] = categoryKey.split(':');
        return { category_group: group, category_name: name };
      });
      
      await db.saveProfileCategories(userId, categoriesToSave);
    }
  } catch (error) {
    console.error('Error updating categories:', error);
    throw error;
  }
}

// Geocode and update location
async function geocodeAndUpdateLocation(userId, city, address) {
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

// Utility functions
function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
}

function showError(message) {
  // You can implement a toast notification system here
  alert(message);
}

function showSuccess(message) {
  // You can implement a toast notification system here
  alert(message);
}

// Render certification widget
async function renderCertificationWidget() {
  try {
    // Import certification module dynamically
    const { ProfileCertification } = await import('./certification.js');
    
    // Initialize certification if not already done
    if (!certification) {
      certification = new ProfileCertification();
    }
    
    // Ensure certification data is loaded
    await certification.initialize();
    
    // Get the container and render the widget
    const container = document.getElementById('certificationWidgetContainer');
    if (container) {
      container.innerHTML = certification.createCertificationWidget();
      
      // Add event listener to the certification button
      const startBtn = container.querySelector('.certification-start-btn');
      if (startBtn) {
        startBtn.addEventListener('click', () => {
          certification.showCertificationModal();
        });
      }
    }
  } catch (error) {
    console.error('Error rendering certification widget:', error);
  }
}

// Auto-initialize profile page when module loads
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Profile page initializing...');
  initProfilePage();
  initProfileInteractions();
});