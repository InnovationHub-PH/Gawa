// Geocoding service for converting addresses to coordinates
export class GeocodingService {
  constructor() {
    this.cache = new Map();
    this.rateLimitDelay = 1000; // 1 second between requests
    this.lastRequestTime = 0;
  }

  // Rate limiting helper
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  // Geocode using Nominatim (OpenStreetMap)
  async geocodeWithNominatim(query) {
    const cacheKey = `nominatim:${query}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    await this.waitForRateLimit();

    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Gawa-MakersClub/1.0 (https://gawa-makers.netlify.app)'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          display_name: data[0].display_name,
          address: data[0].address || {}
        };
        
        this.cache.set(cacheKey, result);
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('Nominatim geocoding error:', error);
      return null;
    }
  }

  // Fallback geocoding using a simple coordinate lookup for major cities
  getFallbackCoordinates(city, country = 'Philippines') {
    const cityCoordinates = {
      // Philippines major cities
      'manila': { lat: 14.5995, lng: 120.9842 },
      'quezon city': { lat: 14.6760, lng: 121.0437 },
      'makati': { lat: 14.5547, lng: 120.9947 },
      'pasig': { lat: 14.5764, lng: 121.0851 },
      'taguig': { lat: 14.5176, lng: 121.0509 },
      'bgc': { lat: 14.5507, lng: 121.0494 },
      'ortigas': { lat: 14.5866, lng: 121.0565 },
      'cebu': { lat: 10.3157, lng: 123.8854 },
      'davao': { lat: 7.1907, lng: 125.4553 },
      'iloilo': { lat: 10.7202, lng: 122.5621 },
      'baguio': { lat: 16.4023, lng: 120.5960 },
      'cagayan de oro': { lat: 8.4542, lng: 124.6319 },
      'bacolod': { lat: 10.6770, lng: 122.9540 },
      'zamboanga': { lat: 6.9214, lng: 122.0790 },
      'antipolo': { lat: 14.5873, lng: 121.1759 },
      'tarlac': { lat: 15.4817, lng: 120.5979 },
      'dagupan': { lat: 16.0433, lng: 120.3433 },
      'caloocan': { lat: 14.6507, lng: 120.9668 },
      'las piñas': { lat: 14.4378, lng: 120.9821 },
      'marikina': { lat: 14.6507, lng: 121.1029 },
      'muntinlupa': { lat: 14.3832, lng: 121.0409 },
      'parañaque': { lat: 14.4793, lng: 121.0198 },
      'pasay': { lat: 14.5378, lng: 120.9896 },
      'pateros': { lat: 14.5441, lng: 121.0658 },
      'san juan': { lat: 14.6019, lng: 121.0355 },
      'valenzuela': { lat: 14.7000, lng: 120.9830 },
      'malabon': { lat: 14.6570, lng: 120.9633 },
      'navotas': { lat: 14.6691, lng: 120.9472 },
      
      // International cities (fallback)
      'new york': { lat: 40.7128, lng: -74.0060 },
      'london': { lat: 51.5074, lng: -0.1278 },
      'tokyo': { lat: 35.6762, lng: 139.6503 },
      'singapore': { lat: 1.3521, lng: 103.8198 },
      'hong kong': { lat: 22.3193, lng: 114.1694 },
      'sydney': { lat: -33.8688, lng: 151.2093 },
      'melbourne': { lat: -37.8136, lng: 144.9631 },
      'san francisco': { lat: 37.7749, lng: -122.4194 },
      'los angeles': { lat: 34.0522, lng: -118.2437 },
      'chicago': { lat: 41.8781, lng: -87.6298 },
      'boston': { lat: 42.3601, lng: -71.0589 },
      'seattle': { lat: 47.6062, lng: -122.3321 }
    };

    const normalizedCity = city.toLowerCase().trim();
    return cityCoordinates[normalizedCity] || null;
  }

  // Main geocoding function with fallbacks
  async geocodeLocation(city, address = null) {
    try {
      // Determine what to geocode
      const query = address && address.trim() 
        ? `${address}, ${city}` 
        : city;

      console.log('Geocoding query:', query);

      // Try Nominatim first
      const nominatimResult = await this.geocodeWithNominatim(query);
      if (nominatimResult) {
        console.log('Nominatim result:', nominatimResult);
        return {
          latitude: nominatimResult.latitude,
          longitude: nominatimResult.longitude,
          source: 'nominatim',
          display_name: nominatimResult.display_name,
          type: address ? 'address' : 'city'
        };
      }

      // Fallback to city coordinates if address geocoding failed
      if (address) {
        console.log('Address geocoding failed, trying city only');
        const cityResult = await this.geocodeWithNominatim(city);
        if (cityResult) {
          return {
            latitude: cityResult.latitude,
            longitude: cityResult.longitude,
            source: 'nominatim',
            display_name: cityResult.display_name,
            type: 'city'
          };
        }
      }

      // Final fallback to hardcoded coordinates
      console.log('API geocoding failed, using fallback coordinates');
      const fallbackCoords = this.getFallbackCoordinates(city);
      if (fallbackCoords) {
        return {
          latitude: fallbackCoords.lat,
          longitude: fallbackCoords.lng,
          source: 'fallback',
          display_name: city,
          type: 'city'
        };
      }

      console.log('No coordinates found for:', query);
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      
      // Try fallback on any error
      const fallbackCoords = this.getFallbackCoordinates(city);
      if (fallbackCoords) {
        return {
          latitude: fallbackCoords.lat,
          longitude: fallbackCoords.lng,
          source: 'fallback',
          display_name: city,
          type: 'city'
        };
      }
      
      return null;
    }
  }

  // Reverse geocoding (coordinates to address)
  async reverseGeocode(latitude, longitude) {
    const cacheKey = `reverse:${latitude},${longitude}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    await this.waitForRateLimit();

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Gawa-MakersClub/1.0 (https://gawa-makers.netlify.app)'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Reverse geocoding error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.address) {
        const result = {
          display_name: data.display_name,
          city: data.address.city || data.address.town || data.address.municipality || '',
          address: data.display_name,
          country: data.address.country || ''
        };
        
        this.cache.set(cacheKey, result);
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }
}

// Create singleton instance
export const geocodingService = new GeocodingService();