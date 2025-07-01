// Environment configuration for different deployment stages
export const ENV = {
  // Detect environment
  isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
  isNetlify: window.location.hostname.includes('netlify.app') || window.location.hostname.includes('netlify.com'),
  isProduction: !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1'),

  // API endpoints
  getApiUrl: (endpoint) => {
    if (ENV.isDevelopment) {
      return `http://localhost:8888/.netlify/functions/${endpoint}`;
    }
    return `/.netlify/functions/${endpoint}`;
  },

  // Supabase configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  },

  // Feature flags
  features: {
    enableAnalytics: ENV.isProduction,
    enableDebugMode: ENV.isDevelopment,
    enableServiceWorker: ENV.isProduction
  }
};

// Log environment info in development
if (ENV.isDevelopment) {
  console.log('Environment:', ENV);
}