import { auth, db } from './supabase.js';

// Global auth state
let currentUser = null;
let userProfile = null;
let authInitialized = false;
let isModalOpening = false;

// Initialize authentication
export async function initAuth() {
  try {
    // Check for existing session
    currentUser = await auth.getCurrentUser();
    
    if (currentUser) {
      await loadUserProfile();
      updateUIForAuthenticatedUser();
    } else {
      updateUIForUnauthenticatedUser();
    }
    
    authInitialized = true;
  } catch (error) {
    console.warn('Auth initialization failed:', error);
    // Still show UI elements even if auth fails
    updateUIForUnauthenticatedUser();
    authInitialized = true;
  }

  // Listen for auth state changes
  auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN') {
      currentUser = session.user;
      await loadUserProfile();
      updateUIForAuthenticatedUser();
      
      // Check if this is a new user (just signed up)
      const isNewUser = session.user.user_metadata?.is_new_user || 
                       (userProfile && !userProfile.username);
      
      showSuccessMessage(isNewUser);
      
      // Dispatch custom event for other modules
      window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { event, session, user: currentUser, profile: userProfile } 
      }));
      
      // Force UI update after a short delay to ensure DOM is ready
      setTimeout(() => {
        updateUIForAuthenticatedUser();
      }, 100);
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
      userProfile = null;
      updateUIForUnauthenticatedUser();
      
      // Dispatch custom event for other modules
      window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { event, session: null, user: null, profile: null } 
      }));
    }
  });

  // Initialize auth modal
  initAuthModal();
}

// Auto-initialize auth when module loads
document.addEventListener('DOMContentLoaded', async () => {
  await initAuth();
  
  // Fallback: ensure UI is updated after a short delay
  setTimeout(() => {
    if (!authInitialized || (!currentUser && document.getElementById('authButton')?.classList.contains('auth-hidden'))) {
      console.log('Running fallback UI update');
      forceUIUpdate();
    }
  }, 1000);
});

// Load user profile
async function loadUserProfile() {
  if (!currentUser) return;
  
  const { data, error } = await db.getProfile(currentUser.id);
  
  if (error && error.code === 'PGRST116') {
    // Profile doesn't exist, create one
    const profileData = {
      username: currentUser.email.split('@')[0],
      full_name: currentUser.user_metadata?.full_name || '',
      bio: '',
      avatar_url: currentUser.user_metadata?.avatar_url || 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png'
    };
    
    await db.createProfile(currentUser.id, profileData);
    userProfile = { id: currentUser.id, ...profileData };
  } else if (!error) {
    userProfile = data;
    // Ensure default avatar if none set
    if (!userProfile.avatar_url) {
      userProfile.avatar_url = 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png';
    }
  }
}

// Update UI for authenticated user
function updateUIForAuthenticatedUser() {
  console.log('Updating UI for authenticated user');
  const authButton = document.getElementById('authButton');
  const userMenu = document.getElementById('userMenu');
  
  if (authButton) {
    authButton.classList.add('auth-hidden'); 
    authButton.style.display = 'none';
  }
  
  if (userMenu) {
    userMenu.classList.remove('auth-hidden');
    userMenu.style.display = 'flex';
    updateUserMenuContent();
  }
  
  // Update mobile navigation if needed
  updateMobileNavigation();
}

// Update UI for unauthenticated user
function updateUIForUnauthenticatedUser() {
  console.log('Updating UI for unauthenticated user');
  const authButton = document.getElementById('authButton');
  const userMenu = document.getElementById('userMenu');
  
  if (authButton) {
    authButton.classList.remove('auth-hidden');
    authButton.style.display = 'flex';
    console.log('Auth button should now be visible');
  }
  
  if (userMenu) {
    userMenu.classList.add('auth-hidden');
    userMenu.style.display = 'none';
  }
  
  // Update mobile navigation if needed
  updateMobileNavigation();
}

// Force UI update - fallback function
function forceUIUpdate() {
  console.log('Force updating UI elements');
  const authButton = document.getElementById('authButton');
  const userMenu = document.getElementById('userMenu');
  
  if (authButton && !currentUser) {
    authButton.classList.remove('auth-hidden'); 
    authButton.style.display = 'flex';
  } else if (userMenu && currentUser) {
    updateUIForAuthenticatedUser();
  }
}

// Update user menu content
function updateUserMenuContent() {
  const userAvatar = document.getElementById('userAvatar');
  const userName = document.getElementById('userName');
  
  if (userAvatar && userProfile) {
    userAvatar.src = userProfile.avatar_url || 'https://innovationhub-ph.github.io/MakersClub/images/Stealth_No_Image.png';
  }
  
  if (userName && userProfile) {
    userName.textContent = userProfile.username || userProfile.full_name || 'User';
  }
  
  // Update profile link to include user ID
  const profileLinks = document.querySelectorAll('a[href="profile.html"]');
  profileLinks.forEach(link => {
    if (currentUser) {
      link.href = `profile.html?id=${currentUser.id}`;
    }
  });
}

// Update mobile navigation
function updateMobileNavigation() {
  // Trigger mobile navigation update if theme.js is loaded
  if (typeof window.handleMobileNavigation === 'function') {
    window.handleMobileNavigation();
  }
}

// Initialize auth modal
function initAuthModal() {
  const authModal = document.getElementById('authModal');
  const authButton = document.getElementById('authButton');
  const closeAuthModal = document.getElementById('closeAuthModal');
  const authTabs = document.querySelectorAll('.auth-tab');
  const authForms = document.querySelectorAll('.auth-form');
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  
  // Show auth modal
  if (authButton) {
    authButton.addEventListener('click', () => {
      isModalOpening = true;
      authModal.classList.remove('hidden');
      // Reset flag after a short delay
      setTimeout(() => {
        isModalOpening = false;
      }, 100);
    });
  }
  
  // Close auth modal
  if (closeAuthModal) {
    closeAuthModal.addEventListener('click', hideAuthModal);
  }
  
  // Close on background click
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal && !isModalOpening) {
        hideAuthModal();
      }
    });
  }
  
  // Tab switching
  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetForm = tab.dataset.tab;
      
      // Update active tab
      authTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show corresponding form
      authForms.forEach(form => {
        form.classList.toggle('active', form.id === `${targetForm}Form`);
      });
    });
  });
  
  // Handle sign in form
  if (signInForm) {
    signInForm.addEventListener('submit', handleSignIn);
  }
  
  // Handle sign up form
  if (signUpForm) {
    signUpForm.addEventListener('submit', handleSignUp);
  }
  
  // Handle sign out
  const signOutButton = document.getElementById('signOutButton');
  if (signOutButton) {
    signOutButton.addEventListener('click', handleSignOut);
  }
}

// Hide auth modal
function hideAuthModal() {
  const authModal = document.getElementById('authModal');
  if (authModal) {
    authModal.classList.add('hidden');
    // Clear any success messages
    clearAuthMessages();
  }
}

// Show success message with personalized welcome
function showSuccessMessage(isNewUser = false) {
  const firstName = userProfile?.full_name?.split(' ')[0] || 
                   userProfile?.username || 
                   'there';
  
  const welcomeMessage = isNewUser 
    ? `♡ Welcome to Gawa, ${firstName}! Let's get you started.`
    : `♡ Welcome back, ${firstName}!`;
  
  showSuccessModal('Login Success!', welcomeMessage);
  
  // Hide modal after showing success message
  setTimeout(() => {
    hideAuthModal();
    // Ensure UI is updated after modal closes
    updateUIForAuthenticatedUser();
  }, 2500);
}

// Show success modal with plain content
function showSuccessModal(title, subtitle = '') {
  const authModal = document.getElementById('authModal');
  const modalContent = authModal.querySelector('.auth-modal-content');
  
  // Hide all existing content and show only success message
  modalContent.innerHTML = `
    <div class="success-modal-content">
      <div style="text-align: center; padding: 3rem 2rem;">
        <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; color: var(--text-color);">${title}</div>
        <div style="font-size: 1.2rem; color: var(--text-color);">${subtitle}</div>
      </div>
    </div>
  `;
  
  authModal.classList.remove('hidden');
}

// Handle sign in
async function handleSignIn(e) {
  e.preventDefault();
  
  // Clear any existing error messages
  clearAuthMessages();
  
  const formData = new FormData(e.target);
  const email = formData.get('email');
  const password = formData.get('password');
  
  try {
    const { data, error } = await auth.signIn(email, password);
    
    if (error) {
      showAuthError(error.message);
    } else {
      console.log('Sign in successful, waiting for auth state change...');
      // Success will be handled by auth state change listener
    }
  } catch (error) {
    console.error('Sign in error:', error);
    showAuthError('An error occurred during sign in. Please try again.');
  }
}

// Handle sign up
async function handleSignUp(e) {
  e.preventDefault();
  
  // Clear any existing error messages
  clearAuthMessages();
  
  const formData = new FormData(e.target);
  const email = formData.get('email');
  const password = formData.get('password');
  const fullName = formData.get('fullName');
  const username = formData.get('username');
  const accountType = formData.get('accountType');
  
  // Validate account type is selected
  if (!accountType) {
    showAuthError('Please select an account type');
    return;
  }
  
  try {
    const { data, error } = await auth.signUp(email, password, {
      full_name: fullName,
      username: username,
      account_type: accountType
    });
    
    if (error) {
      showAuthError(error.message);
    } else {
      console.log('Sign up successful, waiting for auth state change...');
      // Mark as new user for welcome message
      if (data.user) {
        data.user.user_metadata = { ...data.user.user_metadata, is_new_user: true };
      }
      // Success will be handled by auth state change listener
    }
  } catch (error) {
    console.error('Sign up error:', error);
    showAuthError('An error occurred during sign up. Please try again.');
  }
}

// Handle sign out
async function handleSignOut() {
  try {
    const { error } = await auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
    } else {
      console.log('Sign out successful');
    }
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

// Show auth error
function showAuthError(message) {
  const errorElement = document.getElementById('authError');
  const successElement = document.getElementById('authSuccess');
  
  // Hide success message if showing
  if (successElement) {
    successElement.style.display = 'none';
  }
  
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

// Show auth success
function showAuthSuccess(title, subtitle = '') {
  const successElement = document.getElementById('authSuccess');
  const errorElement = document.getElementById('authError');
  
  // Hide error message if showing
  if (errorElement) {
    errorElement.style.display = 'none';
  }
  
  if (successElement) {
    if (subtitle) {
      successElement.innerHTML = `
        <div style="text-align: center;">
          <div style="font-weight: bold; margin-bottom: 0.5rem;">${title}</div>
          <div>${subtitle}</div>
        </div>
      `;
    } else {
      successElement.textContent = title;
    }
    successElement.style.display = 'block';
  }
}

// Clear auth messages
function clearAuthMessages() {
  const errorElement = document.getElementById('authError');
  const successElement = document.getElementById('authSuccess');
  
  if (errorElement) {
    errorElement.style.display = 'none';
  }
  
  if (successElement) {
    successElement.style.display = 'none';
  }
}

// Export current user and profile
export function getCurrentUser() {
  return currentUser;
}

export function getUserProfile() {
  return userProfile;
}

// Check if user is authenticated
export function isAuthenticated() {
  return !!currentUser;
}