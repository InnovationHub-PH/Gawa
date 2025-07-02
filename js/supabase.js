import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured. Some features may not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const auth = {
  // Sign up with email and password
  async signUp(email, password, userData = {}) {
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database helper functions
export const db = {
  // User profiles
  async createProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ id: userId, ...profileData }]);
    return { data, error };
  },

  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    return { data, error };
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    return { data, error };
  },

  // Profile picture upload
  async uploadProfilePicture(fileName, file) {
    try {
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      return { data, error };
    } catch (error) {
      console.error('Upload error:', error);
      return { data: null, error };
    }
  },

  async getProfilePictureUrl(fileName) {
    try {
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
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .remove([fileName]);
      return { data, error };
    } catch (error) {
      console.error('Delete error:', error);
      return { data: null, error };
    }
  },

  // Profile pictures database operations
  async saveProfilePictureRecord(userId, imageData, contentType, fileSize) {
    try {
      const { data, error } = await supabase
        .from('profile_pictures')
        .upsert([{
          user_id: userId,
          image_data: imageData,
          content_type: contentType,
          file_size: fileSize
        }], {
          onConflict: 'user_id'
        });
      
      if (error) {
        console.error('Database upsert error:', error);
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error saving profile picture record:', error);
      return { data: null, error };
    }
  },

  async getProfilePictureRecord(userId) {
    try {
      const { data, error } = await supabase
        .from('profile_pictures')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Database select error:', error);
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error getting profile picture record:', error);
      return { data: null, error };
    }
  },

  async deleteProfilePictureRecord(userId) {
    try {
      const { data, error } = await supabase
        .from('profile_pictures')
        .delete()
        .eq('user_id', userId);
      
      if (error) {
        console.error('Database delete error:', error);
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error deleting profile picture record:', error);
      return { data: null, error };
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,bio.ilike.%${query}%`)
      .limit(20);
    return { data, error };
  }
};