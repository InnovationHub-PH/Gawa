// API utility functions for making requests to Netlify Functions
export class API {
  static async post(endpoint, data) {
    try {
      const response = await fetch(`/.netlify/functions/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  static async get(endpoint, params = {}) {
    try {
      const url = new URL(`/.netlify/functions/${endpoint}`, window.location.origin);
      Object.keys(params).forEach(key => 
        url.searchParams.append(key, params[key])
      );

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Contact form submission
  static async submitContact(formData) {
    return this.post('contact', formData);
  }

  // Proxy Supabase requests
  static async getProfiles() {
    return this.get('proxy-supabase', { path: 'profiles' });
  }
}

// Example usage in your existing code
export function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
      };

      try {
        const result = await API.submitContact(data);
        alert(result.message);
        contactForm.reset();
      } catch (error) {
        alert('Error sending message. Please try again.');
      }
    });
  }
}