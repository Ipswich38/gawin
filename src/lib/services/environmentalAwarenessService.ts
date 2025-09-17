/**
 * Environmental Awareness Service for Gawin
 * Provides real-time environmental data including weather, news, traffic, and social trends
 * Specifically enhanced for Philippine context with real weather API integration
 */

import { realWeatherService, type RealWeatherData, type LocationData } from './realWeatherService';

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
  }>;
}

export interface NewsData {
  headlines: Array<{
    title: string;
    source: string;
    url: string;
    publishedAt: string;
    category: 'politics' | 'business' | 'technology' | 'entertainment' | 'sports' | 'health';
  }>;
  localNews: Array<{
    title: string;
    location: string;
    impact: 'low' | 'medium' | 'high';
  }>;
}

export interface TrafficData {
  location: string;
  congestionLevel: 'light' | 'moderate' | 'heavy' | 'severe';
  estimatedDelay: number; // in minutes
  alternativeRoutes: string[];
  advisories: string[];
}

export interface SocialTrends {
  philippines: Array<{
    topic: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    volume: number;
    relatedKeywords: string[];
  }>;
  global: Array<{
    topic: string;
    relevanceToPhilippines: number; // 0-1 scale
  }>;
}

export interface EnvironmentalContext {
  weather: WeatherData;
  news: NewsData;
  traffic: TrafficData;
  socialTrends: SocialTrends;
  timestamp: number;
  userLocation?: {
    city: string;
    region: string;
    coordinates?: { lat: number; lng: number };
  };
}

class EnvironmentalAwarenessService {
  private static instance: EnvironmentalAwarenessService;
  private cachedData: EnvironmentalContext | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  static getInstance(): EnvironmentalAwarenessService {
    if (!EnvironmentalAwarenessService.instance) {
      EnvironmentalAwarenessService.instance = new EnvironmentalAwarenessService();
    }
    return EnvironmentalAwarenessService.instance;
  }

  /**
   * Get comprehensive environmental awareness data
   */
  async getEnvironmentalContext(userLocation?: string): Promise<EnvironmentalContext> {
    // Return cached data if still valid
    if (this.cachedData && Date.now() < this.cacheExpiry) {
      return this.cachedData;
    }

    try {
      const location = userLocation || 'Metro Manila, Philippines';
      
      // Fetch all environmental data in parallel
      const [weather, news, traffic, socialTrends] = await Promise.all([
        this.getWeatherData(location),
        this.getNewsData(),
        this.getTrafficData(location),
        this.getSocialTrends()
      ]);

      // Get real user location data
      const realLocation = await realWeatherService.getUserLocation();
      
      const context: EnvironmentalContext = {
        weather,
        news,
        traffic,
        socialTrends,
        timestamp: Date.now(),
        userLocation: {
          city: realLocation.city,
          region: realLocation.region,
          coordinates: {
            lat: realLocation.latitude,
            lng: realLocation.longitude
          }
        }
      };

      // Cache the result
      this.cachedData = context;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;

      return context;
    } catch (error) {
      console.error('Environmental awareness fetch failed:', error);
      return this.getFallbackContext(userLocation);
    }
  }

  /**
   * Get weather data for specified location using real API
   */
  private async getWeatherData(location: string): Promise<WeatherData> {
    try {
      console.log('🌤️ Fetching real weather data...');
      
      // Get real weather data from API
      const realWeatherData: RealWeatherData = await realWeatherService.getCurrentWeather();
      
      // Convert to our WeatherData interface
      const weatherData: WeatherData = {
        location: realWeatherData.location,
        temperature: realWeatherData.temperature,
        condition: realWeatherData.condition,
        humidity: realWeatherData.humidity,
        windSpeed: realWeatherData.windSpeed,
        forecast: realWeatherData.forecast.map(day => ({
          date: day.date,
          high: day.high,
          low: day.low,
          condition: day.condition
        }))
      };

      console.log('✅ Real weather data loaded:', `${weatherData.temperature}°C, ${weatherData.condition} in ${weatherData.location}`);
      return weatherData;
      
    } catch (error) {
      console.error('Real weather data fetch failed, using fallback:', error);
      return this.getFallbackWeather(location);
    }
  }

  /**
   * Get news data with Philippine focus
   */
  private async getNewsData(): Promise<NewsData> {
    try {
      // Mock news data with Philippine context
      const mockNews: NewsData = {
        headlines: [
          {
            title: "Senate approves new infrastructure bill for Mindanao development",
            source: "Philippine Daily Inquirer",
            url: "https://example.com/news1",
            publishedAt: new Date().toISOString(),
            category: "politics"
          },
          {
            title: "Peso strengthens against dollar amid positive economic indicators",
            source: "Business World",
            url: "https://example.com/news2", 
            publishedAt: new Date().toISOString(),
            category: "business"
          },
          {
            title: "New tech hub opens in Cebu, creating 5,000 jobs",
            source: "TechNews Philippines",
            url: "https://example.com/news3",
            publishedAt: new Date().toISOString(),
            category: "technology"
          }
        ],
        localNews: [
          {
            title: "MMDA implements new traffic scheme in EDSA",
            location: "Metro Manila",
            impact: "high"
          },
          {
            title: "Boracay tourism numbers reach pre-pandemic levels",
            location: "Aklan",
            impact: "medium"
          }
        ]
      };

      return mockNews;
    } catch (error) {
      console.error('News data fetch failed:', error);
      return { headlines: [], localNews: [] };
    }
  }

  /**
   * Get traffic data for specified location
   */
  private async getTrafficData(location: string): Promise<TrafficData> {
    try {
      // Mock traffic data based on typical Philippine traffic patterns
      const hour = new Date().getHours();
      const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
      
      const mockTraffic: TrafficData = {
        location,
        congestionLevel: isRushHour ? 'heavy' : 'moderate',
        estimatedDelay: isRushHour ? 45 + Math.random() * 30 : 15 + Math.random() * 20,
        alternativeRoutes: [
          "Take C5 instead of EDSA",
          "Use Waze for real-time routing",
          "Consider MRT/LRT for faster travel"
        ],
        advisories: [
          "Heavy traffic expected due to ongoing road construction",
          "Motorcycle lanes available on major thoroughfares"
        ]
      };

      return mockTraffic;
    } catch (error) {
      console.error('Traffic data fetch failed:', error);
      return {
        location,
        congestionLevel: 'moderate',
        estimatedDelay: 20,
        alternativeRoutes: [],
        advisories: []
      };
    }
  }

  /**
   * Get social media trends with Philippine context
   */
  private async getSocialTrends(): Promise<SocialTrends> {
    try {
      // Mock social trends data
      const mockTrends: SocialTrends = {
        philippines: [
          {
            topic: "#Fiesta2024",
            sentiment: "positive",
            volume: 15000,
            relatedKeywords: ["celebration", "tradition", "community", "food"]
          },
          {
            topic: "Budget 2024",
            sentiment: "neutral",
            volume: 8500,
            relatedKeywords: ["government", "economy", "allocation", "infrastructure"]
          },
          {
            topic: "OFW Remittances",
            sentiment: "positive",
            volume: 5200,
            relatedKeywords: ["overseas workers", "family", "economy", "support"]
          }
        ],
        global: [
          {
            topic: "Climate Change Summit",
            relevanceToPhilippines: 0.9
          },
          {
            topic: "ASEAN Economic Forum",
            relevanceToPhilippines: 0.8
          }
        ]
      };

      return mockTrends;
    } catch (error) {
      console.error('Social trends fetch failed:', error);
      return { philippines: [], global: [] };
    }
  }

  /**
   * Generate contextual insights based on environmental data
   */
  generateContextualInsights(context: EnvironmentalContext): string[] {
    const insights: string[] = [];
    
    // Weather insights
    if (context.weather.temperature > 32) {
      insights.push("It's quite hot today - stay hydrated and consider indoor activities during peak hours.");
    }
    
    if (context.weather.condition.includes('rain')) {
      insights.push("Rain is expected - plan for possible traffic delays and carry an umbrella.");
    }

    // Traffic insights
    if (context.traffic.congestionLevel === 'heavy') {
      insights.push(`Heavy traffic in ${context.traffic.location} - consider leaving earlier or using alternative routes.`);
    }

    // News insights
    if (context.news.headlines.some(h => h.category === 'politics')) {
      insights.push("There are important political developments today that might affect public services.");
    }

    // Social trends insights
    const positivePhTrends = context.socialTrends.philippines.filter(t => t.sentiment === 'positive').length;
    if (positivePhTrends > 1) {
      insights.push("There's positive sentiment in Philippine social media today - good time for community engagement.");
    }

    return insights;
  }

  /**
   * Check if environmental conditions suggest specific actions
   */
  getEnvironmentalRecommendations(context: EnvironmentalContext): Array<{
    category: string;
    recommendation: string;
    priority: 'low' | 'medium' | 'high';
  }> {
    const recommendations = [];

    // Weather-based recommendations
    if (context.weather.temperature > 35) {
      recommendations.push({
        category: 'health',
        recommendation: 'Extreme heat warning - avoid outdoor activities between 10 AM - 3 PM',
        priority: 'high' as const
      });
    }

    // Traffic-based recommendations  
    if (context.traffic.congestionLevel === 'severe') {
      recommendations.push({
        category: 'transportation',
        recommendation: 'Consider working from home or adjusting travel times due to severe traffic',
        priority: 'medium' as const
      });
    }

    // News-based recommendations
    const hasEmergencyNews = context.news.localNews.some(n => n.impact === 'high');
    if (hasEmergencyNews) {
      recommendations.push({
        category: 'safety',
        recommendation: 'Stay updated on local news for important safety information',
        priority: 'high' as const
      });
    }

    return recommendations;
  }

  // Helper methods
  private getRandomWeatherCondition(): string {
    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain', 'Thunderstorms'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  private generateWeatherForecast(): Array<{ date: string; high: number; low: number; condition: string }> {
    const forecast = [];
    for (let i = 1; i <= 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      forecast.push({
        date: date.toISOString().split('T')[0],
        high: 28 + Math.random() * 8,
        low: 22 + Math.random() * 6,
        condition: this.getRandomWeatherCondition()
      });
    }
    return forecast;
  }

  private parseLocation(location: string): { city: string; region: string } {
    // Simple location parsing for Philippine locations
    if (location.includes('Metro Manila')) {
      return { city: 'Manila', region: 'National Capital Region' };
    }
    if (location.includes('Cebu')) {
      return { city: 'Cebu City', region: 'Central Visayas' };
    }
    if (location.includes('Davao')) {
      return { city: 'Davao City', region: 'Davao Region' };
    }
    
    return { city: location, region: 'Philippines' };
  }

  private getFallbackWeather(location: string): WeatherData {
    return {
      location,
      temperature: 30,
      condition: 'Partly Cloudy',
      humidity: 75,
      windSpeed: 10,
      forecast: []
    };
  }

  private getFallbackContext(userLocation?: string): EnvironmentalContext {
    return {
      weather: this.getFallbackWeather(userLocation || 'Philippines'),
      news: { headlines: [], localNews: [] },
      traffic: {
        location: userLocation || 'Philippines',
        congestionLevel: 'moderate',
        estimatedDelay: 20,
        alternativeRoutes: [],
        advisories: []
      },
      socialTrends: { philippines: [], global: [] },
      timestamp: Date.now(),
      userLocation: this.parseLocation(userLocation || 'Philippines')
    };
  }
}

export const environmentalAwarenessService = EnvironmentalAwarenessService.getInstance();