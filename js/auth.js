import { auth, db } from './supabase.js';

// Global auth state
let currentUser = null;
let userProfile = null;

// Initialize authentication
export async function initAuth() {
  // Check for existing session
  currentUser = await auth.getCurrentUser();
  
  if (currentUser) {
    await loadUserProfile();
    updateUIForAuthenticatedUser();
  } else {
    updateUIForUnauthenticatedUser();
  }

  // Listen for auth state changes
  auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN') {
      currentUser = session.user;
      await loadUserProfile();
      updateUIForAuthenticatedUser();
      hideAuthModal();
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
      userProfile = null;
      updateUIForUnauthenticatedUser();
    }
  });

  // Initialize auth modal
  initAuthModal();
}

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
      avatar_url: currentUser.user_metadata?.avatar_url || ''
    };
    
    await db.createProfile(currentUser.id, profileData);
    userProfile = { id: currentUser.id, ...profileData };
  } else if (!error) {
    userProfile = data;
  }
}

// Update UI for authenticated user
function updateUIForAuthenticatedUser() {
  const authButton = document.getElementById('authButton');
  const userMenu = document.getElementById('userMenu');
  
  if (authButton) {
    authButton.classList.add('auth-hidden');
  }
  
  if (userMenu) {
    userMenu.classList.remove('auth-hidden');
    userMenu.style.display = 'flex';
    updateUserMenuContent();
  }
}

// Update UI for unauthenticated user
function updateUIForUnauthenticatedUser() {
  const authButton = document.getElementById('authButton');
  const userMenu = document.getElementById('userMenu');
  
  if (authButton) {
    authButton.classList.remove('auth-hidden');
    authButton.style.display = 'flex';
  }
  
  if (userMenu) {
    userMenu.classList.add('auth-hidden');
  }
}

// Update user menu content
function updateUserMenuContent() {
  const userAvatar = document.getElementById('userAvatar');
  const userName = document.getElementById('userName');
  
  if (userAvatar && userProfile) {
    userAvatar.src = userProfile.avatar_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg';
  }
  
  if (userName && userProfile) {
    userName.textContent = userProfile.username || userProfile.full_name || 'User';
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
      authModal.classList.remove('hidden');
    });
  }
  
  // Close auth modal
  if (closeAuthModal) {
    closeAuthModal.addEventListener('click', hideAuthModal);
  }
  
  // Close on background click
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) {
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
  }
}

// Handle sign in
async function handleSignIn(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const email = formData.get('email');
  const password = formData.get('password');
  
  const { data, error } = await auth.signIn(email, password);
  
  if (error) {
    showAuthError(error.message);
  }
}

// Handle sign up
async function handleSignUp(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const email = formData.get('email');
  const password = formData.get('password');
  const fullName = formData.get('fullName');
  const username = formData.get('username');
  
  const { data, error } = await auth.signUp(email, password, {
    full_name: fullName,
    username: username
  });
  
  if (error) {
    showAuthError(error.message);
  } else {
    showAuthSuccess('Account created! Please check your email to verify your account.');
  }
}

// Handle sign out
async function handleSignOut() {
  const { error } = await auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
  }
}

// Show auth error
function showAuthError(message) {
  const errorElement = document.getElementById('authError');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  }
}

// Show auth success
function showAuthSuccess(message) {
  const successElement = document.getElementById('authSuccess');
  if (successElement) {
    successElement.textContent = message;
    successElement.style.display = 'block';
    setTimeout(() => {
      successElement.style.display = 'none';
    }, 5000);
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