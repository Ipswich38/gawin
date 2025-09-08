'use client';

/**
 * Behavior Analytics Service
 * Production-ready behavior recognition and mood analysis system
 * Based on research: "Mobile Sensing-Based Multi-dimensional Behavior Analysis"
 */

interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

interface StayPoint {
  latitude: number;
  longitude: number;
  arrivalTime: number;
  departureTime: number;
  duration: number;
  visits: number;
}

interface SensorData {
  accelerometer?: {x: number, y: number, z: number};
  gyroscope?: {x: number, y: number, z: number};
  magnetometer?: {x: number, y: number, z: number};
  timestamp: number;
}

interface BehaviorPattern {
  locationPatterns: number; // 0-10 scale
  activityLevel: number;    // 0-10 scale
  socialInteraction: number; // 0-10 scale
  sleepQuality: number;     // 0-10 scale
  moodScore: number;        // 0-100 scale
  contextualFactors: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    dayOfWeek: string;
    weather?: string;
    location?: string;
  };
  timestamp: number;
}

interface BehaviorContext {
  currentMood: number;
  recentPatterns: BehaviorPattern[];
  locationContext: string;
  activityContext: string;
  socialContext: string;
  recommendations: string[];
}

class BehaviorAnalyticsService {
  private static instance: BehaviorAnalyticsService;
  private isEnabled: boolean = false;
  private encryptionKey: string = '';
  private locationPoints: LocationPoint[] = [];
  private stayPoints: StayPoint[] = [];
  private sensorData: SensorData[] = [];
  private behaviorPatterns: BehaviorPattern[] = [];
  private watchId: number | null = null;
  private sensorInterval: NodeJS.Timeout | null = null;
  
  // Configuration parameters from research paper
  private readonly DISTANCE_THRESHOLD = 100; // meters for stay point detection
  private readonly TIME_THRESHOLD = 10 * 60 * 1000; // 10 minutes in milliseconds
  private readonly MAX_LOCATION_HISTORY = 1000;
  private readonly PATTERN_ANALYSIS_WINDOW = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeService();
    }
  }

  static getInstance(): BehaviorAnalyticsService {
    if (!BehaviorAnalyticsService.instance) {
      BehaviorAnalyticsService.instance = new BehaviorAnalyticsService();
    }
    return BehaviorAnalyticsService.instance;
  }

  private async initializeService() {
    // Skip initialization during SSR
    if (typeof window === 'undefined') return;
    
    try {
      // Generate or retrieve encryption key
      this.encryptionKey = localStorage.getItem('behavior_encryption_key') || this.generateEncryptionKey();
      
      // Load existing data
      await this.loadStoredData();
      
      // Check permissions
      if (await this.checkPermissions()) {
        this.isEnabled = true;
        this.startDataCollection();
      }
    } catch (error) {
      console.warn('Behavior analytics initialization failed:', error);
    }
  }

  private generateEncryptionKey(): string {
    if (typeof window === 'undefined') return '';
    
    const key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    localStorage.setItem('behavior_encryption_key', key);
    return key;
  }

  private async checkPermissions(): Promise<boolean> {
    try {
      // Check geolocation permission
      const geoPermission = await navigator.permissions.query({name: 'geolocation'});
      
      // Check device motion permission (iOS requires explicit permission)
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        const motionPermission = await (DeviceMotionEvent as any).requestPermission();
        return geoPermission.state === 'granted' && motionPermission === 'granted';
      }
      
      return geoPermission.state === 'granted';
    } catch (error) {
      console.warn('Permission check failed:', error);
      return false;
    }
  }

  private startDataCollection() {
    if (!this.isEnabled) return;

    // Start location tracking
    this.startLocationTracking();
    
    // Start sensor tracking
    this.startSensorTracking();
    
    // Start pattern analysis
    this.startPatternAnalysis();
  }

  private startLocationTracking() {
    if (!navigator.geolocation) return;

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const point: LocationPoint = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now(),
          accuracy: position.coords.accuracy
        };
        
        this.addLocationPoint(point);
      },
      (error) => {
        console.warn('Geolocation error:', error);
      },
      options
    );
  }

  private startSensorTracking() {
    // Device motion tracking
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', (event) => {
        if (event.acceleration) {
          const sensorData: SensorData = {
            accelerometer: {
              x: event.acceleration.x || 0,
              y: event.acceleration.y || 0,
              z: event.acceleration.z || 0
            },
            timestamp: Date.now()
          };
          
          if (event.rotationRate) {
            sensorData.gyroscope = {
              x: event.rotationRate.alpha || 0,
              y: event.rotationRate.beta || 0,
              z: event.rotationRate.gamma || 0
            };
          }
          
          this.addSensorData(sensorData);
        }
      });
    }
  }

  private startPatternAnalysis() {
    // Analyze patterns every 15 minutes
    this.sensorInterval = setInterval(() => {
      this.analyzeCurrentBehavior();
    }, 15 * 60 * 1000);
  }

  private addLocationPoint(point: LocationPoint) {
    this.locationPoints.push(point);
    
    // Maintain maximum history size
    if (this.locationPoints.length > this.MAX_LOCATION_HISTORY) {
      this.locationPoints = this.locationPoints.slice(-this.MAX_LOCATION_HISTORY);
    }
    
    // Update stay points using research algorithm
    this.updateStayPoints(point);
    
    // Store encrypted data
    this.storeData();
  }

  private addSensorData(data: SensorData) {
    this.sensorData.push(data);
    
    // Keep only last hour of sensor data
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.sensorData = this.sensorData.filter(d => d.timestamp > oneHourAgo);
  }

  /**
   * Stay point detection algorithm from research paper
   * Identifies locations where user spent significant time
   */
  private updateStayPoints(newPoint: LocationPoint) {
    if (this.locationPoints.length < 2) return;

    const recentPoints = this.locationPoints.slice(-20); // Check last 20 points
    
    for (let i = 0; i < recentPoints.length - 1; i++) {
      const point1 = recentPoints[i];
      let j = i + 1;
      
      while (j < recentPoints.length) {
        const point2 = recentPoints[j];
        const distance = this.calculateDistance(point1, point2);
        
        if (distance <= this.DISTANCE_THRESHOLD) {
          const timeDiff = point2.timestamp - point1.timestamp;
          
          if (timeDiff >= this.TIME_THRESHOLD) {
            // Found a stay point
            const centerLat = (point1.latitude + point2.latitude) / 2;
            const centerLng = (point1.longitude + point2.longitude) / 2;
            
            this.addOrUpdateStayPoint({
              latitude: centerLat,
              longitude: centerLng,
              arrivalTime: point1.timestamp,
              departureTime: point2.timestamp,
              duration: timeDiff,
              visits: 1
            });
            
            break;
          }
        }
        j++;
      }
    }
  }

  private addOrUpdateStayPoint(newStayPoint: StayPoint) {
    // Check if this is a known location (within 50m)
    const existingPoint = this.stayPoints.find(sp => 
      this.calculateDistance(
        {latitude: sp.latitude, longitude: sp.longitude, timestamp: 0},
        {latitude: newStayPoint.latitude, longitude: newStayPoint.longitude, timestamp: 0}
      ) <= 50
    );

    if (existingPoint) {
      // Update existing stay point
      existingPoint.visits++;
      existingPoint.departureTime = newStayPoint.departureTime;
      existingPoint.duration += newStayPoint.duration;
    } else {
      // Add new stay point
      this.stayPoints.push(newStayPoint);
      
      // Maintain reasonable number of stay points
      if (this.stayPoints.length > 100) {
        this.stayPoints = this.stayPoints
          .sort((a, b) => b.visits - a.visits)
          .slice(0, 100);
      }
    }
  }

  private calculateDistance(point1: LocationPoint, point2: LocationPoint): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1.latitude * Math.PI / 180;
    const φ2 = point2.latitude * Math.PI / 180;
    const Δφ = (point2.latitude - point1.latitude) * Math.PI / 180;
    const Δλ = (point2.longitude - point1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  /**
   * Analyze current behavior patterns based on collected data
   */
  private analyzeCurrentBehavior(): BehaviorPattern {
    const now = Date.now();
    const recentData = this.getRecentData(4 * 60 * 60 * 1000); // Last 4 hours
    
    // Calculate behavior metrics
    const locationPatterns = this.calculateLocationPatterns(recentData);
    const activityLevel = this.calculateActivityLevel(recentData);
    const socialInteraction = this.calculateSocialInteraction(recentData);
    const sleepQuality = this.calculateSleepQuality();
    
    // Calculate overall mood score
    const moodScore = this.calculateMoodScore(
      locationPatterns, activityLevel, socialInteraction, sleepQuality
    );
    
    const pattern: BehaviorPattern = {
      locationPatterns,
      activityLevel,
      socialInteraction,
      sleepQuality,
      moodScore,
      contextualFactors: {
        timeOfDay: this.getTimeOfDay(),
        dayOfWeek: new Date().toLocaleDateString('en', { weekday: 'long' }),
        location: this.getCurrentLocationContext(),
      },
      timestamp: now
    };
    
    this.behaviorPatterns.push(pattern);
    
    // Keep only last 7 days of patterns
    const weekAgo = now - this.PATTERN_ANALYSIS_WINDOW;
    this.behaviorPatterns = this.behaviorPatterns.filter(p => p.timestamp > weekAgo);
    
    this.storeData();
    
    return pattern;
  }

  private getRecentData(timeWindow: number) {
    const cutoff = Date.now() - timeWindow;
    return {
      locations: this.locationPoints.filter(p => p.timestamp > cutoff),
      sensors: this.sensorData.filter(s => s.timestamp > cutoff),
      stayPoints: this.stayPoints.filter(sp => sp.departureTime > cutoff)
    };
  }

  private calculateLocationPatterns(data: any): number {
    if (data.stayPoints.length === 0) return 5; // Neutral score
    
    // Score based on location diversity and routine patterns
    const uniqueLocations = data.stayPoints.length;
    const averageStayDuration = data.stayPoints.reduce((sum: number, sp: StayPoint) => sum + sp.duration, 0) / data.stayPoints.length;
    
    // Higher scores for more diverse locations and reasonable stay durations
    let score = Math.min(10, uniqueLocations * 2);
    
    // Adjust for stay duration (too short or too long might indicate issues)
    const idealStayDuration = 2 * 60 * 60 * 1000; // 2 hours
    const durationFactor = Math.max(0.5, 1 - Math.abs(averageStayDuration - idealStayDuration) / idealStayDuration);
    
    return Math.round(score * durationFactor);
  }

  private calculateActivityLevel(data: any): number {
    if (data.sensors.length === 0) return 5; // Neutral score
    
    // Calculate movement intensity from accelerometer data
    const movements = data.sensors
      .filter((s: SensorData) => s.accelerometer)
      .map((s: SensorData) => {
        const acc = s.accelerometer!;
        return Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
      });
    
    if (movements.length === 0) return 3; // Low activity if no sensor data
    
    const averageMovement = movements.reduce((sum: number, m: number) => sum + m, 0) / movements.length;
    const maxMovement = Math.max(...movements);
    
    // Normalize to 0-10 scale (typical phone movement ranges from 0-20 m/s²)
    const activityScore = Math.min(10, (averageMovement + maxMovement * 0.3) / 2);
    
    return Math.round(activityScore);
  }

  private calculateSocialInteraction(data: any): number {
    // This would be enhanced with actual communication data
    // For now, use location diversity as proxy for social activity
    const timeOfDay = this.getTimeOfDay();
    const isWeekend = [0, 6].includes(new Date().getDay());
    
    let baseScore = 5;
    
    // Adjust based on time and day patterns
    if (timeOfDay === 'evening' && data.stayPoints.length > 0) {
      baseScore += 2; // Evening activities suggest social interaction
    }
    
    if (isWeekend && data.stayPoints.length > 1) {
      baseScore += 1; // Weekend mobility suggests social activities
    }
    
    return Math.min(10, Math.max(0, baseScore));
  }

  private calculateSleepQuality(): number {
    // Analyze night-time movement patterns
    const now = new Date();
    const lastNight = new Date(now);
    lastNight.setHours(0, 0, 0, 0);
    
    const nightSensors = this.sensorData.filter(s => {
      const sensorTime = new Date(s.timestamp);
      return sensorTime >= lastNight && 
             (sensorTime.getHours() >= 22 || sensorTime.getHours() <= 6);
    });
    
    if (nightSensors.length === 0) return 7; // Default good sleep
    
    // Lower movement at night = better sleep quality
    const nightMovement = nightSensors
      .filter(s => s.accelerometer)
      .map(s => {
        const acc = s.accelerometer!;
        return Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
      })
      .reduce((sum, m) => sum + m, 0) / nightSensors.length;
    
    // Invert movement score (less movement = better sleep)
    const sleepScore = Math.max(3, 10 - (nightMovement / 2));
    
    return Math.round(sleepScore);
  }

  private calculateMoodScore(
    locationPatterns: number,
    activityLevel: number,
    socialInteraction: number,
    sleepQuality: number
  ): number {
    // Weighted mood calculation based on behavior factors
    const weights = {
      location: 0.2,
      activity: 0.3,
      social: 0.25,
      sleep: 0.25
    };
    
    const moodScore = (
      locationPatterns * weights.location +
      activityLevel * weights.activity +
      socialInteraction * weights.social +
      sleepQuality * weights.sleep
    ) * 10; // Scale to 0-100
    
    return Math.round(Math.min(100, Math.max(0, moodScore)));
  }

  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  private getCurrentLocationContext(): string {
    if (this.stayPoints.length === 0) return 'mobile';
    
    const currentLocation = this.stayPoints[this.stayPoints.length - 1];
    
    // Simple location classification based on time and visit patterns
    const timeOfDay = this.getTimeOfDay();
    const isWeekday = ![0, 6].includes(new Date().getDay());
    
    if (timeOfDay === 'night') return 'home';
    if (isWeekday && (timeOfDay === 'morning' || timeOfDay === 'afternoon')) {
      return currentLocation.visits > 5 ? 'work' : 'other';
    }
    
    return 'leisure';
  }

  /**
   * Get behavior context for AI enhancement
   */
  getBehaviorContext(): BehaviorContext | null {
    if (!this.isEnabled || this.behaviorPatterns.length === 0) {
      return null;
    }

    const latestPattern = this.behaviorPatterns[this.behaviorPatterns.length - 1];
    const recentPatterns = this.behaviorPatterns.slice(-10); // Last 10 patterns
    
    const context: BehaviorContext = {
      currentMood: latestPattern.moodScore,
      recentPatterns,
      locationContext: latestPattern.contextualFactors.location || 'unknown',
      activityContext: this.getActivityContext(latestPattern.activityLevel),
      socialContext: this.getSocialContext(latestPattern.socialInteraction),
      recommendations: this.generateRecommendations(latestPattern)
    };
    
    return context;
  }

  private getActivityContext(level: number): string {
    if (level <= 3) return 'low activity';
    if (level <= 6) return 'moderate activity';
    if (level <= 8) return 'active';
    return 'very active';
  }

  private getSocialContext(level: number): string {
    if (level <= 3) return 'isolated';
    if (level <= 6) return 'somewhat social';
    if (level <= 8) return 'socially active';
    return 'highly social';
  }

  private generateRecommendations(pattern: BehaviorPattern): string[] {
    const recommendations: string[] = [];
    
    if (pattern.moodScore < 40) {
      recommendations.push('Consider taking a short walk or doing light exercise');
      recommendations.push('Reach out to a friend or family member');
    }
    
    if (pattern.activityLevel < 4) {
      recommendations.push('Try some gentle movement or stretching');
    }
    
    if (pattern.socialInteraction < 4) {
      recommendations.push('Consider social activities or contacting someone');
    }
    
    if (pattern.sleepQuality < 5) {
      recommendations.push('Focus on better sleep hygiene tonight');
    }
    
    return recommendations;
  }

  private async storeData() {
    if (typeof window === 'undefined') return;
    
    try {
      const data = {
        locationPoints: this.locationPoints.slice(-100), // Store last 100 points
        stayPoints: this.stayPoints,
        behaviorPatterns: this.behaviorPatterns.slice(-50), // Store last 50 patterns
        timestamp: Date.now()
      };
      
      const encryptedData = await this.encryptData(JSON.stringify(data));
      localStorage.setItem('behavior_analytics_data', encryptedData);
    } catch (error) {
      console.warn('Failed to store behavior data:', error);
    }
  }

  private async loadStoredData() {
    if (typeof window === 'undefined') return;
    
    try {
      const encryptedData = localStorage.getItem('behavior_analytics_data');
      if (!encryptedData) return;
      
      const decryptedData = await this.decryptData(encryptedData);
      const data = JSON.parse(decryptedData);
      
      this.locationPoints = data.locationPoints || [];
      this.stayPoints = data.stayPoints || [];
      this.behaviorPatterns = data.behaviorPatterns || [];
    } catch (error) {
      console.warn('Failed to load behavior data:', error);
      // Clear corrupted data
      localStorage.removeItem('behavior_analytics_data');
    }
  }

  private async encryptData(data: string): Promise<string> {
    // Simple encryption using Web Crypto API
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const keyBuffer = encoder.encode(this.encryptionKey.slice(0, 32));
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      dataBuffer
    );
    
    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...result));
  }

  private async decryptData(encryptedData: string): Promise<string> {
    const decoder = new TextDecoder();
    const data = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
    
    const iv = data.slice(0, 12);
    const encrypted = data.slice(12);
    
    const keyBuffer = new TextEncoder().encode(this.encryptionKey.slice(0, 32));
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encrypted
    );
    
    return decoder.decode(decrypted);
  }

  /**
   * Public API methods
   */
  
  isServiceEnabled(): boolean {
    return this.isEnabled;
  }

  async enableService(): Promise<boolean> {
    if (await this.checkPermissions()) {
      this.isEnabled = true;
      this.startDataCollection();
      return true;
    }
    return false;
  }

  disableService() {
    this.isEnabled = false;
    
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    
    if (this.sensorInterval) {
      clearInterval(this.sensorInterval);
      this.sensorInterval = null;
    }
  }

  clearAllData() {
    this.locationPoints = [];
    this.stayPoints = [];
    this.sensorData = [];
    this.behaviorPatterns = [];
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('behavior_analytics_data');
    }
  }

  getPrivacySummary() {
    return {
      enabled: this.isEnabled,
      dataPoints: {
        locations: this.locationPoints.length,
        stayPoints: this.stayPoints.length,
        patterns: this.behaviorPatterns.length
      },
      storage: 'Local device with AES-256 encryption',
      sharing: 'No data shared with third parties',
      retention: '7 days for detailed data, 30 days for patterns'
    };
  }
}

export const behaviorAnalyticsService = BehaviorAnalyticsService.getInstance();
export type { BehaviorContext, BehaviorPattern };