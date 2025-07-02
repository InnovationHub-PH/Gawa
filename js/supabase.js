import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured. Auth will work in fallback mode.');
}

// Create client with fallback for missing env vars
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Auth helper functions
export const auth = {
  // Sign up with email and password
  async signUp(email, password, userData = {}) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  // Sign in with email and password
  async signIn(email, password) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Sign out
  async signOut() {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  async getCurrentUser() {
    if (!supabase) {
      return null;
    }
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    if (!supabase) {
      return () => {}; // Return empty unsubscribe function
    }
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database helper functions
export const db = {
  // User profiles
  async createProfile(userId, profileData) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ id: userId, ...profileData }]);
    return { data, error };
  },

  async getProfile(userId) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    return { data, error };
  },

  async updateProfile(userId, updates) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    return { data, error };
  },

  // Profile picture upload
  async uploadProfilePicture(fileName, file) {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }
      
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      return { data, error };
    } catch (error) {
      console.error('Upload error:', error);
      return { data: null, error: error };
    }
  },

  async getProfilePictureUrl(fileName) {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }
      
      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);
      return { data };
    } catch (error) {
      console.error('Get URL error:', error);
      return { data: null };
    }
  },

  async deleteProfilePicture(fileName) {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }
      
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .remove([fileName]);
      return { data, error };
    } catch (error) {
      console.error('Delete error:', error);
      return { data: null, error: error };
    }
  },

  // Profile pictures database operations
  async saveProfilePictureRecord(userId, imageData, contentType, fileSize) {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }
      
      const { data, error } = await supabase
        .from('profile_pictures')
        .upsert([{
          user_id: userId,
          image_data: imageData,
          content_type: contentType,
          file_size: fileSize
        }]);
      return { data, error };
    } catch (error) {
      console.error('Save profile picture record error:', error);
      return { data: null, error: error };
    }
  },

  async saveProfilePictureWithStorage(userId, imageData, storagePath, contentType, fileSize) {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }
      
      const { data, error } = await supabase
        .from('profile_pictures')
        .upsert([{
          user_id: userId,
          image_data: imageData,
          storage_path: storagePath,
          content_type: contentType,
          file_size: fileSize
        }]);
      return { data, error };
    } catch (error) {
      console.error('Save profile picture with storage error:', error);
      return { data: null, error: error };
    }
  },

  async getProfilePictureRecord(userId) {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }
      
      const { data, error } = await supabase
        .from('profile_pictures')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      return { data, error };
    } catch (error) {
      console.error('Get profile picture record error:', error);
      return { data: null, error: error };
    }
  },

  async deleteProfilePictureRecord(userId) {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }
      
      const { data, error } = await supabase
        .from('profile_pictures')
        .delete()
        .eq('user_id', userId);
      return { data, error };
    } catch (error) {
      console.error('Delete profile picture record error:', error);
      return { data: null, error: error };
    }
  },

  // Posts
  async createPost(postData) {
    const { data, error } = await supabase
      .from('posts')
      .insert([postData]);
    return { data, error };
  },

  async getUserPosts(userId) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:author_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('author_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getAllPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:author_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Following system
  async followUser(followerId, followingId) {
    const { data, error } = await supabase
      .from('follows')
      .insert([{ follower_id: followerId, following_id: followingId }]);
    return { data, error };
  },

  async unfollowUser(followerId, followingId) {
    const { data, error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    return { data, error };
  },

  async isFollowing(followerId, followingId) {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();
    return { data: !!data, error };
  },

  async getFollowers(userId) {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        follower_id,
        profiles:follower_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('following_id', userId);
    return { data, error };
  },

  async getFollowing(userId) {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        following_id,
        profiles:following_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('follower_id', userId);
    return { data, error };
  },

  // Ratings and reviews
  async rateUser(raterId, ratedUserId, rating, comment = '') {
    const { data, error } = await supabase
      .from('user_ratings')
      .upsert([{
        rater_id: raterId,
        rated_user_id: ratedUserId,
        rating,
        comment
      }]);
    return { data, error };
  },

  async getUserRatings(userId) {
    const { data, error } = await supabase
      .from('user_ratings')
      .select(`
        *,
        profiles:rater_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('rated_user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getUserAverageRating(userId) {
    const { data, error } = await supabase
      .from('user_ratings')
      .select('rating')
      .eq('rated_user_id', userId);
    
    if (error || !data.length) return { average: 0, count: 0, error };
    
    const average = data.reduce((sum, rating) => sum + rating.rating, 0) / data.length;
    return { average: Math.round(average * 10) / 10, count: data.length, error: null };
  },

  // Search users
  async searchUsers(query) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,bio.ilike.%${query}%`)
      .limit(20);
    return { data, error };
  },

  // Get all profiles for community directory
  async getAllProfiles() {
    if (!supabase) {
      console.warn('Supabase not configured, returning empty array');
      return { data: [], error: null };
    }
    // Only return certified profiles for public display
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, bio, account_type, created_at, is_certified, city, website, phone, facebook, instagram, linkedin')
      .eq('is_certified', true)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Profile completion and certification functions
  async getProfileCompletionSteps(userId) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    const { data, error } = await supabase
      .from('profile_completion_steps')
      .select('*')
      .eq('user_id', userId)
      .order('step_number');
    return { data, error };
  },

  async updateProfileCompletionStep(userId, stepNumber, isCompleted) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    const { data, error } = await supabase
      .from('profile_completion_steps')
      .upsert([{
        user_id: userId,
        step_number: stepNumber,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      }]);
    return { data, error };
  },

  async getProfileCategories(userId) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    const { data, error } = await supabase
      .from('profile_categories')
      .select('*')
      .eq('user_id', userId);
    return { data, error };
  },

  async saveProfileCategories(userId, categories) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    const categoriesToInsert = categories.map(cat => ({
      user_id: userId,
      category_group: cat.category_group,
      category_name: cat.category_name
    }));
    
    const { data, error } = await supabase
      .from('profile_categories')
      .insert(categoriesToInsert);
    return { data, error };
  },

  async clearProfileCategories(userId) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    const { data, error } = await supabase
      .from('profile_categories')
      .delete()
      .eq('user_id', userId);
    return { data, error };
  },

  async updateCertificationStatus(userId) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    const { data, error } = await supabase.rpc('update_certification_status', {
      user_uuid: userId
    });
    return { data, error };
  }
};