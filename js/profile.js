import { db, auth } from './supabase.js';
import { getCurrentUser, getUserProfile } from './auth.js';

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
    
  } catch (error) {
    console.error('Error loading profile:', error);
    showError('Failed to load profile');
  }
}

// Update profile UI
function updateProfileUI(profile, posts, ratings, averageRating, ratingCount, followersCount, followingCount, isOwnProfile, isFollowing) {
  // Update profile header
  document.getElementById('profileAvatar').src = profile.avatar_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg';
  document.getElementById('profileName').textContent = profile.full_name || profile.username;
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
  } else {
    editProfileButton.style.display = 'none';
    followButton.style.display = 'block';
    rateUserButton.style.display = 'block';
    
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
        <img src="${post.profiles.avatar_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg'}" alt="${post.profiles.username}" class="post-avatar">
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
        <img src="${rating.profiles.avatar_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg'}" alt="${rating.profiles.username}" class="rating-avatar">
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
  
  // Rating modal
  initRatingModal();
  
  // Edit profile modal
  initEditProfileModal();
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
  const modal = document.getElementById('editProfileModal');
  const userProfile = getUserProfile();
  
  // Pre-fill form with current data
  document.getElementById('editFullName').value = userProfile.full_name || '';
  document.getElementById('editUsername').value = userProfile.username || '';
  document.getElementById('editBio').value = userProfile.bio || '';
  document.getElementById('editLocation').value = userProfile.location || '';
  document.getElementById('editWebsite').value = userProfile.website || '';
  
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
    
    try {
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

// Auto-initialize profile page when module loads
document.addEventListener('DOMContentLoaded', async () => {
  initProfilePage();
  initProfileInteractions();
});