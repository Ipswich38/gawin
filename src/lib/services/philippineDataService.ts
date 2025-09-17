/**
 * Philippine-Specific Data Service for Gawin
 * Provides localized data including weather, traffic, news, and cultural information
 * Enhanced for Filipino context and regional variations
 */

export interface PhilippineWeatherData {
  location: {
    city: string;
    province: string;
    region: string;
    coordinates: { lat: number; lng: number };
  };
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    visibility: number;
    uvIndex: number;
    heatIndex: number; // Important for tropical climate
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    rainProbability: number;
    typhoonAlert?: 'none' | 'signal1' | 'signal2' | 'signal3' | 'signal4' | 'signal5';
  }>;
  warnings: Array<{
    type: 'typhoon' | 'flood' | 'heat' | 'thunderstorm' | 'landslide';
    severity: 'advisory' | 'watch' | 'warning';
    message: string;
    affectedAreas: string[];
  }>;
}

export interface PhilippineTrafficData {
  location: string;
  metro_manila: {
    edsa: { status: 'light' | 'moderate' | 'heavy' | 'severe'; estimated_time: number };
    commonwealth: { status: 'light' | 'moderate' | 'heavy' | 'severe'; estimated_time: number };
    c5: { status: 'light' | 'moderate' | 'heavy' | 'severe'; estimated_time: number };
    slex: { status: 'light' | 'moderate' | 'heavy' | 'severe'; estimated_time: number };
    nlex: { status: 'light' | 'moderate' | 'heavy' | 'severe'; estimated_time: number };
  };
  public_transport: {
    mrt: { status: 'operational' | 'limited' | 'suspended'; delays: number };
    lrt1: { status: 'operational' | 'limited' | 'suspended'; delays: number };
    lrt2: { status: 'operational' | 'limited' | 'suspended'; delays: number };
    buses: { status: 'normal' | 'congested' | 'limited'; average_wait: number };
    jeepneys: { status: 'normal' | 'congested' | 'limited'; routes_affected: string[] };
  };
  regional_updates: Array<{
    region: string;
    major_roads: Array<{
      name: string;
      status: 'clear' | 'moderate' | 'congested' | 'closed';
      reason?: string;
    }>;
  }>;
  advisories: string[];
}

export interface PhilippineNewsData {
  national: Array<{
    headline: string;
    source: string;
    category: 'politics' | 'economics' | 'social' | 'disaster' | 'education' | 'health' | 'infrastructure';
    impact_level: 'national' | 'regional' | 'local';
    published_at: string;
    summary: string;
    regions_affected?: string[];
  }>;
  regional: Array<{
    region: string;
    headlines: Array<{
      title: string;
      category: string;
      local_impact: 'high' | 'medium' | 'low';
    }>;
  }>;
  economic_indicators: {
    peso_to_usd: number;
    stock_market: {
      psei: number;
      change: number;
      trend: 'up' | 'down' | 'stable';
    };
    inflation_rate: number;
    ofw_remittances: {
      monthly_total: number;
      change_percentage: number;
    };
  };
  cultural_events: Array<{
    event_name: string;
    location: string;
    date: string;
    type: 'festival' | 'religious' | 'cultural' | 'government';
    national_significance: boolean;
  }>;
}

export interface PhilippineCulturalData {
  current_season: 'dry' | 'wet' | 'transition';
  holidays: Array<{
    name: string;
    date: string;
    type: 'national' | 'religious' | 'regional' | 'cultural';
    observance: 'regular' | 'special_working' | 'non_working';
    significance: string;
  }>;
  language_insights: {
    predominant_languages: string[];
    regional_dialects: Record<string, string[]>;
    trending_slang: string[];
  };
  cultural_reminders: Array<{
    context: string;
    reminder: string;
    importance: 'high' | 'medium' | 'low';
  }>;
}

class PhilippineDataService {
  private static instance: PhilippineDataService;
  private dataCache: Map<string, { data: any; expiry: number }> = new Map();
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  // Philippine regions and major cities
  private philippineRegions = {
    'NCR': ['Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig', 'Marikina', 'Caloocan'],
    'CAR': ['Baguio', 'La Trinidad', 'Tabuk'],
    'Region I': ['Dagupan', 'San Fernando', 'Laoag'],
    'Region II': ['Tuguegarao', 'Ilagan', 'Santiago'],
    'Region III': ['San Fernando', 'Malolos', 'Cabanatuan', 'Olongapo'],
    'Region IV-A': ['Lucena', 'Antipolo', 'Batangas City', 'Lipa'],
    'Region IV-B': ['Puerto Princesa', 'Calapan'],
    'Region V': ['Legazpi', 'Naga', 'Sorsogon'],
    'Region VI': ['Iloilo City', 'Bacolod', 'Roxas'],
    'Region VII': ['Cebu City', 'Mandaue', 'Lapu-Lapu', 'Dumaguete', 'Tagbilaran'],
    'Region VIII': ['Tacloban', 'Ormoc', 'Maasin'],
    'Region IX': ['Zamboanga City', 'Isabela', 'Dipolog'],
    'Region X': ['Cagayan de Oro', 'Iligan', 'Valencia'],
    'Region XI': ['Davao City', 'Tagum', 'Panabo'],
    'Region XII': ['Koronadal', 'General Santos', 'Kidapawan'],
    'Region XIII': ['Butuan', 'Cabadbaran', 'Bayugan'],
    'BARMM': ['Cotabato City', 'Marawi', 'Lamitan']
  };

  static getInstance(): PhilippineDataService {
    if (!PhilippineDataService.instance) {
      PhilippineDataService.instance = new PhilippineDataService();
    }
    return PhilippineDataService.instance;
  }

  /**
   * Get comprehensive Philippine weather data
   */
  async getPhilippineWeather(location: string = 'Metro Manila'): Promise<PhilippineWeatherData> {
    const cacheKey = `weather_${location}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // In production, this would call PAGASA API or similar Philippine weather service
      const weatherData = this.generateMockPhilippineWeather(location);
      this.setCache(cacheKey, weatherData);
      return weatherData;
    } catch (error) {
      console.error('Philippine weather fetch failed:', error);
      return this.getFallbackWeatherData(location);
    }
  }

  /**
   * Get Philippine traffic data with focus on Metro Manila and major highways
   */
  async getPhilippineTraffic(): Promise<PhilippineTrafficData> {
    const cacheKey = 'traffic_philippines';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Mock traffic data based on typical Philippine traffic patterns
      const trafficData = this.generateMockPhilippineTraffic();
      this.setCache(cacheKey, trafficData);
      return trafficData;
    } catch (error) {
      console.error('Philippine traffic fetch failed:', error);
      return this.getFallbackTrafficData();
    }
  }

  /**
   * Get Philippine news and economic data
   */
  async getPhilippineNews(): Promise<PhilippineNewsData> {
    const cacheKey = 'news_philippines';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Mock news data with Philippine context
      const newsData = this.generateMockPhilippineNews();
      this.setCache(cacheKey, newsData);
      return newsData;
    } catch (error) {
      console.error('Philippine news fetch failed:', error);
      return this.getFallbackNewsData();
    }
  }

  /**
   * Get Philippine cultural data and context
   */
  async getPhilippineCulturalData(): Promise<PhilippineCulturalData> {
    const cacheKey = 'cultural_philippines';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const culturalData = this.generatePhilippineCulturalData();
      this.setCache(cacheKey, culturalData);
      return culturalData;
    } catch (error) {
      console.error('Philippine cultural data fetch failed:', error);
      return this.getFallbackCulturalData();
    }
  }

  /**
   * Get localized insights based on user's region
   */
  getRegionalInsights(region: string): Array<{
    category: string;
    insight: string;
    relevance: number;
  }> {
    const insights = [];

    // Region-specific insights
    switch (region.toUpperCase()) {
      case 'NCR':
        insights.push({
          category: 'transportation',
          insight: 'Rush hour traffic in Metro Manila typically peaks from 7-9 AM and 5-7 PM',
          relevance: 0.9
        });
        break;
        
      case 'REGION VII':
        insights.push({
          category: 'tourism',
          insight: 'Cebu is experiencing high tourist activity - expect increased traffic in major attractions',
          relevance: 0.8
        });
        break;
        
      case 'REGION XI':
        insights.push({
          category: 'agriculture',
          insight: 'Davao region is in durian season - fresh fruits available in local markets',
          relevance: 0.7
        });
        break;
    }

    // Universal Philippine insights
    insights.push({
      category: 'weather',
      insight: 'Monitor PAGASA updates for typhoon warnings during rainy season',
      relevance: 0.8
    });

    return insights;
  }

  /**
   * Get emergency alerts and warnings
   */
  getEmergencyAlerts(): Array<{
    type: 'weather' | 'disaster' | 'health' | 'security';
    level: 'info' | 'advisory' | 'watch' | 'warning' | 'emergency';
    message: string;
    affected_areas: string[];
    valid_until: string;
  }> {
    // Mock emergency alerts - in production would fetch from government APIs
    return [
      {
        type: 'weather',
        level: 'advisory',
        message: 'Thunderstorm advisory for Metro Manila and nearby provinces',
        affected_areas: ['NCR', 'Region III', 'Region IV-A'],
        valid_until: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  // Private helper methods
  private generateMockPhilippineWeather(location: string): PhilippineWeatherData {
    const region = this.determineRegion(location);
    const isRainySeason = this.isRainySeason();
    
    return {
      location: {
        city: location,
        province: this.getProvince(location),
        region,
        coordinates: this.getCoordinates(location)
      },
      current: {
        temperature: 26 + Math.random() * 8, // 26-34°C typical range
        feelsLike: 30 + Math.random() * 6,
        humidity: isRainySeason ? 75 + Math.random() * 20 : 60 + Math.random() * 25,
        windSpeed: 5 + Math.random() * 15,
        condition: isRainySeason ? this.getRainySeasonCondition() : this.getDrySeasonCondition(),
        visibility: 8 + Math.random() * 7,
        uvIndex: 6 + Math.random() * 6,
        heatIndex: 32 + Math.random() * 8
      },
      forecast: this.generatePhilippineForecast(isRainySeason),
      warnings: this.generateWeatherWarnings()
    };
  }

  private generateMockPhilippineTraffic(): PhilippineTrafficData {
    const hour = new Date().getHours();
    const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
    const baseStatus = isRushHour ? 'heavy' : 'moderate';

    return {
      location: 'Philippines',
      metro_manila: {
        edsa: { status: baseStatus as any, estimated_time: isRushHour ? 90 : 45 },
        commonwealth: { status: baseStatus as any, estimated_time: isRushHour ? 60 : 30 },
        c5: { status: 'moderate', estimated_time: isRushHour ? 50 : 25 },
        slex: { status: 'moderate', estimated_time: isRushHour ? 70 : 35 },
        nlex: { status: baseStatus as any, estimated_time: isRushHour ? 80 : 40 }
      },
      public_transport: {
        mrt: { status: 'operational', delays: isRushHour ? 10 : 2 },
        lrt1: { status: 'operational', delays: isRushHour ? 8 : 3 },
        lrt2: { status: 'operational', delays: isRushHour ? 5 : 1 },
        buses: { status: isRushHour ? 'congested' : 'normal', average_wait: isRushHour ? 15 : 8 },
        jeepneys: { status: isRushHour ? 'congested' : 'normal', routes_affected: isRushHour ? ['EDSA', 'Quezon Ave'] : [] }
      },
      regional_updates: [
        {
          region: 'Region IV-A',
          major_roads: [
            { name: 'STAR Tollway', status: 'clear' },
            { name: 'SLEX', status: 'moderate' }
          ]
        }
      ],
      advisories: [
        'Ongoing construction at EDSA-Shaw intersection may cause delays',
        'Alternative routes recommended during peak hours'
      ]
    };
  }

  private generateMockPhilippineNews(): PhilippineNewsData {
    return {
      national: [
        {
          headline: 'Senate passes new healthcare bill expanding PhilHealth coverage',
          source: 'Philippine Daily Inquirer',
          category: 'health',
          impact_level: 'national',
          published_at: new Date().toISOString(),
          summary: 'The bill aims to provide better healthcare access to Filipino families nationwide.',
          regions_affected: ['All regions']
        },
        {
          headline: 'BSP maintains key interest rate amid economic recovery',
          source: 'Business World',
          category: 'economics',
          impact_level: 'national',
          published_at: new Date().toISOString(),
          summary: 'Central bank decision supports continued economic growth and stability.'
        }
      ],
      regional: [
        {
          region: 'NCR',
          headlines: [
            { title: 'New MRT extension project breaks ground', category: 'infrastructure', local_impact: 'high' },
            { title: 'Manila Bay rehabilitation phase 2 begins', category: 'environment', local_impact: 'medium' }
          ]
        }
      ],
      economic_indicators: {
        peso_to_usd: 55.50 + Math.random() * 2,
        stock_market: {
          psei: 6800 + Math.random() * 400,
          change: (Math.random() - 0.5) * 100,
          trend: Math.random() > 0.5 ? 'up' : 'down'
        },
        inflation_rate: 3.2 + Math.random() * 1.5,
        ofw_remittances: {
          monthly_total: 2.8 + Math.random() * 0.5, // in billions USD
          change_percentage: (Math.random() - 0.5) * 10
        }
      },
      cultural_events: [
        {
          event_name: 'Sinulog Festival',
          location: 'Cebu City',
          date: '2024-01-21',
          type: 'cultural',
          national_significance: true
        }
      ]
    };
  }

  private generatePhilippineCulturalData(): PhilippineCulturalData {
    const month = new Date().getMonth() + 1;
    const currentSeason = this.getCurrentSeason(month);

    return {
      current_season: currentSeason,
      holidays: this.getUpcomingPhilippineHolidays(),
      language_insights: {
        predominant_languages: ['Filipino', 'English', 'Cebuano', 'Ilocano', 'Hiligaynon'],
        regional_dialects: {
          'NCR': ['Tagalog', 'English'],
          'Region VII': ['Cebuano', 'English'],
          'Region I': ['Ilocano', 'English'],
          'Region VI': ['Hiligaynon', 'English']
        },
        trending_slang: ['bet', 'sana all', 'charot', 'periodt', 'ghost mode']
      },
      cultural_reminders: [
        {
          context: 'communication',
          reminder: 'Use "po" and "opo" when speaking with elders or in formal situations',
          importance: 'high'
        },
        {
          context: 'social',
          reminder: 'Filipino time typically means arriving 15-30 minutes after stated time for casual events',
          importance: 'medium'
        }
      ]
    };
  }

  // Helper methods
  private determineRegion(location: string): string {
    for (const [region, cities] of Object.entries(this.philippineRegions)) {
      if (cities.some(city => location.toLowerCase().includes(city.toLowerCase()))) {
        return region;
      }
    }
    return 'NCR'; // Default to NCR
  }

  private getProvince(location: string): string {
    // Simplified province mapping
    const provinceMap: Record<string, string> = {
      'Manila': 'Metro Manila',
      'Cebu': 'Cebu',
      'Davao': 'Davao del Sur',
      'Baguio': 'Benguet'
    };
    
    for (const [city, province] of Object.entries(provinceMap)) {
      if (location.includes(city)) return province;
    }
    return 'Metro Manila';
  }

  private getCoordinates(location: string): { lat: number; lng: number } {
    // Simplified coordinate mapping
    const coordMap: Record<string, { lat: number; lng: number }> = {
      'Manila': { lat: 14.5995, lng: 120.9842 },
      'Cebu': { lat: 10.3157, lng: 123.8854 },
      'Davao': { lat: 7.1907, lng: 125.4553 }
    };
    
    for (const [city, coords] of Object.entries(coordMap)) {
      if (location.includes(city)) return coords;
    }
    return { lat: 14.5995, lng: 120.9842 }; // Default to Manila
  }

  private isRainySeason(): boolean {
    const month = new Date().getMonth() + 1;
    return month >= 6 && month <= 11; // June to November
  }

  private getCurrentSeason(month: number): 'dry' | 'wet' | 'transition' {
    if (month >= 12 || month <= 2) return 'dry';
    if (month >= 6 && month <= 9) return 'wet';
    return 'transition';
  }

  private getRainySeasonCondition(): string {
    const conditions = ['Cloudy', 'Light Rain', 'Heavy Rain', 'Thunderstorms', 'Partly Cloudy'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  private getDrySeasonCondition(): string {
    const conditions = ['Sunny', 'Partly Cloudy', 'Hazy', 'Hot'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  private generatePhilippineForecast(isRainySeason: boolean): PhilippineWeatherData['forecast'] {
    const forecast: PhilippineWeatherData['forecast'] = [];
    for (let i = 1; i <= 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      forecast.push({
        date: date.toISOString().split('T')[0],
        high: 28 + Math.random() * 6,
        low: 22 + Math.random() * 4,
        condition: isRainySeason ? this.getRainySeasonCondition() : this.getDrySeasonCondition(),
        rainProbability: isRainySeason ? 60 + Math.random() * 40 : Math.random() * 30,
        typhoonAlert: isRainySeason && Math.random() > 0.8 ? ('signal1' as const) : ('none' as const)
      });
    }
    return forecast;
  }

  private generateWeatherWarnings(): PhilippineWeatherData['warnings'] {
    // Mock warnings based on season and random events
    const warnings = [];
    
    if (this.isRainySeason() && Math.random() > 0.7) {
      warnings.push({
        type: 'flood' as const,
        severity: 'advisory' as const,
        message: 'Possible flooding in low-lying areas due to continuous rainfall',
        affectedAreas: ['Metro Manila', 'Laguna', 'Rizal']
      });
    }

    return warnings;
  }

  private getUpcomingPhilippineHolidays(): PhilippineCulturalData['holidays'] {
    // Sample holidays - in production would be dynamically calculated
    return [
      {
        name: 'Rizal Day',
        date: '2024-12-30',
        type: 'national',
        observance: 'non_working',
        significance: 'Commemorates the death of national hero Dr. Jose Rizal'
      },
      {
        name: 'New Year\'s Day',
        date: '2024-01-01',
        type: 'national',
        observance: 'non_working',
        significance: 'Beginning of the new year'
      }
    ];
  }

  // Cache management
  private getFromCache(key: string): any {
    const cached = this.dataCache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.dataCache.set(key, {
      data,
      expiry: Date.now() + this.CACHE_DURATION
    });
  }

  // Fallback methods
  private getFallbackWeatherData(location: string): PhilippineWeatherData {
    return {
      location: {
        city: location,
        province: 'Metro Manila',
        region: 'NCR',
        coordinates: { lat: 14.5995, lng: 120.9842 }
      },
      current: {
        temperature: 30,
        feelsLike: 34,
        humidity: 75,
        windSpeed: 10,
        condition: 'Partly Cloudy',
        visibility: 10,
        uvIndex: 8,
        heatIndex: 35
      },
      forecast: [],
      warnings: []
    };
  }

  private getFallbackTrafficData(): PhilippineTrafficData {
    return {
      location: 'Philippines',
      metro_manila: {
        edsa: { status: 'moderate', estimated_time: 60 },
        commonwealth: { status: 'moderate', estimated_time: 40 },
        c5: { status: 'moderate', estimated_time: 35 },
        slex: { status: 'moderate', estimated_time: 45 },
        nlex: { status: 'moderate', estimated_time: 50 }
      },
      public_transport: {
        mrt: { status: 'operational', delays: 5 },
        lrt1: { status: 'operational', delays: 3 },
        lrt2: { status: 'operational', delays: 2 },
        buses: { status: 'normal', average_wait: 10 },
        jeepneys: { status: 'normal', routes_affected: [] }
      },
      regional_updates: [],
      advisories: []
    };
  }

  private getFallbackNewsData(): PhilippineNewsData {
    return {
      national: [],
      regional: [],
      economic_indicators: {
        peso_to_usd: 56.0,
        stock_market: { psei: 7000, change: 0, trend: 'stable' },
        inflation_rate: 3.5,
        ofw_remittances: { monthly_total: 3.0, change_percentage: 2.0 }
      },
      cultural_events: []
    };
  }

  private getFallbackCulturalData(): PhilippineCulturalData {
    return {
      current_season: 'transition',
      holidays: [],
      language_insights: {
        predominant_languages: ['Filipino', 'English'],
        regional_dialects: {},
        trending_slang: []
      },
      cultural_reminders: []
    };
  }
}

export const philippineDataService = PhilippineDataService.getInstance();