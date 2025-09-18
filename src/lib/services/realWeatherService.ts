/**
 * Real Weather Service for Gawin
 * Provides actual weather data using OpenWeatherMap API and IP-based location detection
 */

export interface LocationData {
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  ip: string;
  timezone: string;
}

export interface RealWeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  feelsLike: number;
  sunrise: string;
  sunset: string;
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    precipitation: number;
    humidity: number;
  }>;
}

class RealWeatherService {
  private static instance: RealWeatherService;
  private readonly IPAPI_URL = 'http://ip-api.com/json';
  private readonly OPENWEATHER_URL = 'https://api.openweathermap.org/data/2.5';
  private readonly OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '';
  
  private locationCache: LocationData | null = null;
  private weatherCache: { data: RealWeatherData; timestamp: number } | null = null;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  static getInstance(): RealWeatherService {
    if (!RealWeatherService.instance) {
      RealWeatherService.instance = new RealWeatherService();
    }
    return RealWeatherService.instance;
  }

  /**
   * Get user's location using multiple methods for better accuracy
   */
  async getUserLocation(): Promise<LocationData> {
    // Return cached location if available
    if (this.locationCache) {
      return this.locationCache;
    }

    // Try browser geolocation first if available
    try {
      const geoLocation = await this.getBrowserLocation();
      if (geoLocation) {
        console.log('📍 Location detected via browser geolocation:', `${geoLocation.city}, ${geoLocation.region}, ${geoLocation.country}`);
        this.locationCache = geoLocation;
        return geoLocation;
      }
    } catch (error) {
      console.log('🌐 Browser geolocation not available, falling back to IP-based detection');
    }

    // Fallback to IP-based location
    try {
      const response = await fetch(`${this.IPAPI_URL}?fields=status,message,country,regionName,city,lat,lon,timezone,query`);
      const data = await response.json();

      if (data.status === 'fail') {
        throw new Error(data.message || 'Failed to get location');
      }

      const locationData: LocationData = {
        city: data.city || 'Unknown',
        region: data.regionName || 'Unknown',
        country: data.country || 'Unknown',
        latitude: data.lat || 14.5995, // Default to Manila coordinates
        longitude: data.lon || 120.9842,
        ip: data.query || '',
        timezone: data.timezone || 'Asia/Manila'
      };

      // Cache the location
      this.locationCache = locationData;
      console.log('📍 Location detected via IP:', `${locationData.city}, ${locationData.region}, ${locationData.country}`);

      return locationData;
    } catch (error) {
      console.error('Failed to get user location via IP:', error);

      // Final fallback to Manila, Philippines
      const fallbackLocation: LocationData = {
        city: 'Manila',
        region: 'National Capital Region',
        country: 'Philippines',
        latitude: 14.5995,
        longitude: 120.9842,
        ip: 'unknown',
        timezone: 'Asia/Manila'
      };

      console.log('📍 Using fallback location:', `${fallbackLocation.city}, ${fallbackLocation.region}, ${fallbackLocation.country}`);
      this.locationCache = fallbackLocation;
      return fallbackLocation;
    }
  }

  /**
   * Attempt to get precise location using browser geolocation API
   */
  private async getBrowserLocation(): Promise<LocationData | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      const timeoutId = setTimeout(() => {
        resolve(null);
      }, 5000); // 5 second timeout

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(timeoutId);

          try {
            // Reverse geocode the coordinates to get location name
            const { latitude, longitude } = position.coords;
            const reverseGeoResponse = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${this.OPENWEATHER_API_KEY}`
            );

            if (reverseGeoResponse.ok) {
              const geoData = await reverseGeoResponse.json();
              if (geoData.length > 0) {
                const location = geoData[0];
                resolve({
                  city: location.name || 'Unknown',
                  region: location.state || 'Unknown',
                  country: location.country || 'Unknown',
                  latitude: latitude,
                  longitude: longitude,
                  ip: 'geolocation',
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                });
                return;
              }
            }

            // If reverse geocoding fails, use coordinates with unknown location
            resolve({
              city: 'Unknown',
              region: 'Unknown',
              country: 'Unknown',
              latitude: latitude,
              longitude: longitude,
              ip: 'geolocation',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });
          } catch (error) {
            console.warn('Reverse geocoding failed:', error);
            resolve(null);
          }
        },
        (error) => {
          clearTimeout(timeoutId);
          console.log('Geolocation denied or failed:', error.message);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000 // Cache for 5 minutes
        }
      );
    });
  }

  /**
   * Get current weather data
   */
  async getCurrentWeather(location?: LocationData): Promise<RealWeatherData> {
    // Check cache first
    if (this.weatherCache && Date.now() - this.weatherCache.timestamp < this.CACHE_DURATION) {
      return this.weatherCache.data;
    }

    try {
      // Get location if not provided
      const userLocation = location || await this.getUserLocation();

      // Check if API key is available
      if (!this.OPENWEATHER_API_KEY) {
        console.warn('OpenWeather API key not found, using mock data');
        return this.getMockWeatherData(userLocation);
      }

      // Fetch current weather
      const currentWeatherUrl = `${this.OPENWEATHER_URL}/weather?lat=${userLocation.latitude}&lon=${userLocation.longitude}&appid=${this.OPENWEATHER_API_KEY}&units=metric`;
      const currentResponse = await fetch(currentWeatherUrl);
      
      if (!currentResponse.ok) {
        throw new Error(`Weather API error: ${currentResponse.status}`);
      }

      const currentData = await currentResponse.json();

      // Fetch 5-day forecast
      const forecastUrl = `${this.OPENWEATHER_URL}/forecast?lat=${userLocation.latitude}&lon=${userLocation.longitude}&appid=${this.OPENWEATHER_API_KEY}&units=metric`;
      const forecastResponse = await fetch(forecastUrl);
      
      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.status}`);
      }

      const forecastData = await forecastResponse.json();

      // Process the data
      const weatherData: RealWeatherData = {
        location: `${userLocation.city}, ${userLocation.region}`,
        temperature: Math.round(currentData.main.temp),
        condition: this.formatWeatherCondition(currentData.weather[0].main, currentData.weather[0].description),
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
        pressure: currentData.main.pressure,
        visibility: currentData.visibility ? Math.round(currentData.visibility / 1000) : 10, // Convert to km
        uvIndex: 0, // UV index requires separate API call
        feelsLike: Math.round(currentData.main.feels_like),
        sunrise: new Date(currentData.sys.sunrise * 1000).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: userLocation.timezone 
        }),
        sunset: new Date(currentData.sys.sunset * 1000).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: userLocation.timezone 
        }),
        forecast: this.processForecastData(forecastData.list)
      };

      // Cache the result
      this.weatherCache = {
        data: weatherData,
        timestamp: Date.now()
      };

      console.log('🌤️ Real weather data fetched:', `${weatherData.temperature}°C, ${weatherData.condition} in ${weatherData.location}`);
      return weatherData;

    } catch (error) {
      console.error('Failed to fetch real weather data:', error);
      
      // Fallback to mock data
      const userLocation = location || await this.getUserLocation();
      return this.getMockWeatherData(userLocation);
    }
  }

  /**
   * Process forecast data from OpenWeather API
   */
  private processForecastData(forecastList: any[]): RealWeatherData['forecast'] {
    const dailyForecasts = new Map<string, any>();

    // Group forecasts by date and find min/max temperatures
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      
      if (!dailyForecasts.has(date)) {
        dailyForecasts.set(date, {
          date,
          high: item.main.temp_max,
          low: item.main.temp_min,
          condition: this.formatWeatherCondition(item.weather[0].main, item.weather[0].description),
          precipitation: item.rain ? (item.rain['3h'] || 0) : 0,
          humidity: item.main.humidity
        });
      } else {
        const existing = dailyForecasts.get(date);
        existing.high = Math.max(existing.high, item.main.temp_max);
        existing.low = Math.min(existing.low, item.main.temp_min);
      }
    });

    // Convert to array and take first 5 days
    return Array.from(dailyForecasts.values())
      .slice(0, 5)
      .map(forecast => ({
        ...forecast,
        high: Math.round(forecast.high),
        low: Math.round(forecast.low)
      }));
  }

  /**
   * Format weather condition for better readability
   */
  private formatWeatherCondition(main: string, description: string): string {
    const conditionMap: { [key: string]: string } = {
      'Thunderstorm': 'Thunderstorms',
      'Drizzle': 'Light Rain',
      'Rain': 'Rain',
      'Snow': 'Snow',
      'Mist': 'Misty',
      'Smoke': 'Smoky',
      'Haze': 'Hazy',
      'Dust': 'Dusty',
      'Fog': 'Foggy',
      'Sand': 'Sandy',
      'Ash': 'Volcanic Ash',
      'Squall': 'Squalls',
      'Tornado': 'Tornado',
      'Clear': 'Clear Sky',
      'Clouds': 'Cloudy'
    };

    // Use description for more specific conditions
    if (description.includes('heavy')) return `Heavy ${conditionMap[main] || main}`;
    if (description.includes('light')) return `Light ${conditionMap[main] || main}`;
    if (description.includes('broken')) return 'Partly Cloudy';
    if (description.includes('scattered')) return 'Partly Cloudy';
    if (description.includes('few')) return 'Mostly Clear';
    if (description.includes('overcast')) return 'Overcast';

    return conditionMap[main] || main;
  }

  /**
   * Get mock weather data as fallback
   */
  private getMockWeatherData(location: LocationData): RealWeatherData {
    const isPhilippines = location.country.toLowerCase().includes('philippines');
    const isRainySeason = this.isRainySeason();

    return {
      location: `${location.city}, ${location.region}`,
      temperature: Math.round(isPhilippines ? 28 + Math.random() * 8 : 20 + Math.random() * 15),
      condition: isRainySeason ? this.getRainySeasonCondition() : this.getDrySeasonCondition(),
      humidity: isPhilippines ? 65 + Math.random() * 25 : 40 + Math.random() * 40,
      windSpeed: 5 + Math.random() * 15,
      pressure: 1010 + Math.random() * 20,
      visibility: 8 + Math.random() * 7,
      uvIndex: 6 + Math.random() * 5,
      feelsLike: Math.round(isPhilippines ? 30 + Math.random() * 8 : 22 + Math.random() * 15),
      sunrise: '6:00 AM',
      sunset: '6:00 PM',
      forecast: this.generateMockForecast(isRainySeason)
    };
  }

  /**
   * Check if it's rainy season in Philippines (June-November)
   */
  private isRainySeason(): boolean {
    const month = new Date().getMonth() + 1; // 1-12
    return month >= 6 && month <= 11;
  }

  /**
   * Get rainy season weather condition
   */
  private getRainySeasonCondition(): string {
    const conditions = ['Rain', 'Thunderstorms', 'Heavy Rain', 'Light Rain', 'Cloudy', 'Partly Cloudy'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  /**
   * Get dry season weather condition
   */
  private getDrySeasonCondition(): string {
    const conditions = ['Sunny', 'Partly Cloudy', 'Clear Sky', 'Mostly Clear', 'Hazy'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  /**
   * Generate mock forecast data
   */
  private generateMockForecast(isRainySeason: boolean): RealWeatherData['forecast'] {
    const forecast = [];
    for (let i = 1; i <= 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      forecast.push({
        date: date.toISOString().split('T')[0],
        high: Math.round(28 + Math.random() * 8),
        low: Math.round(22 + Math.random() * 6),
        condition: isRainySeason ? this.getRainySeasonCondition() : this.getDrySeasonCondition(),
        precipitation: isRainySeason ? Math.random() * 20 : Math.random() * 5,
        humidity: 65 + Math.random() * 25
      });
    }
    return forecast;
  }

  /**
   * Get user's current local time
   */
  async getLocalTime(): Promise<string> {
    try {
      const location = await this.getUserLocation();
      const now = new Date();
      return now.toLocaleString('en-US', {
        timeZone: location.timezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Failed to get local time:', error);
      return new Date().toLocaleString();
    }
  }

  /**
   * Manually set user location (useful for testing or when geolocation fails)
   */
  setUserLocation(locationData: Partial<LocationData>): void {
    this.locationCache = {
      city: locationData.city || 'Unknown',
      region: locationData.region || 'Unknown',
      country: locationData.country || 'Unknown',
      latitude: locationData.latitude || 14.5995,
      longitude: locationData.longitude || 120.9842,
      ip: locationData.ip || 'manual',
      timezone: locationData.timezone || 'Asia/Manila'
    };

    // Clear weather cache to fetch new weather for new location
    this.weatherCache = null;
    console.log('📍 Location manually set:', `${this.locationCache.city}, ${this.locationCache.region}, ${this.locationCache.country}`);
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.locationCache = null;
    this.weatherCache = null;
    console.log('🗑️ Weather cache cleared');
  }
}

export const realWeatherService = RealWeatherService.getInstance();