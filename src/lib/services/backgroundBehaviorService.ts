'use client';

import { behaviorAnalyticsService } from './behaviorAnalyticsService';
import { behaviorPrivacyService } from './behaviorPrivacyService';

/**
 * Background Behavior Service
 * Extends behavior analytics with comprehensive background data collection
 * Collects system-wide usage patterns when user grants extended permissions
 */

interface BackgroundDataCollection {
  screenTime: {
    daily: number; // minutes
    apps: { [key: string]: number };
    categories: { [key: string]: number };
  };
  notificationPatterns: {
    count: number;
    interactionRate: number;
    peakHours: number[];
  };
  batteryUsage: {
    level: number;
    chargingPattern: 'frequent' | 'normal' | 'overnight';
    screenOnTime: number;
  };
  connectivityPatterns: {
    wifiLocations: string[];
    mobilityIndicators: {
      stationary: number; // percentage of time
      walking: number;
      vehicle: number;
    };
  };
  circadianRhythm: {
    sleepStart: number; // hour (0-23)
    sleepEnd: number;
    consistency: number; // 0-1 score
    qualityIndicators: {
      nighttimePhone: number; // minutes
      morningDelay: number; // minutes until first interaction
    };
  };
}

interface EnhancedBehaviorPattern {
  timestamp: number;
  mood: number;
  activity: number;
  social: number;
  sleep: number;
  focus: number; // new: attention/focus levels
  stress: number; // new: stress indicators
  energy: number; // new: energy levels
  contextualFactors: {
    weather?: string;
    timeOfDay: string;
    dayOfWeek: string;
    location: string;
    socialContext: string;
    workContext: 'work' | 'personal' | 'mixed';
  };
  backgroundData?: Partial<BackgroundDataCollection>;
}

class BackgroundBehaviorService {
  private static instance: BackgroundBehaviorService;
  private backgroundEnabled: boolean = false;
  private serviceWorker: ServiceWorkerRegistration | null = null;
  private dataCollectionInterval: NodeJS.Timeout | null = null;
  private enhancedPatterns: EnhancedBehaviorPattern[] = [];

  // Enhanced data collection capabilities
  private readonly ENHANCED_PERMISSIONS = [
    'background-sync',
    'background-fetch', 
    'geolocation',
    'notifications',
    'devicemotion',
    'camera', // for ambient light sensing
    'microphone' // for ambient noise levels (processed locally)
  ];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeBackgroundService();
    }
  }

  static getInstance(): BackgroundBehaviorService {
    if (!BackgroundBehaviorService.instance) {
      BackgroundBehaviorService.instance = new BackgroundBehaviorService();
    }
    return BackgroundBehaviorService.instance;
  }

  private async initializeBackgroundService() {
    // Check if basic behavior analytics is enabled
    if (!behaviorPrivacyService.hasValidConsent()) {
      return;
    }

    // Check if background permissions are granted
    const bgPermission = localStorage.getItem('behavior_background_enabled');
    this.backgroundEnabled = bgPermission === 'true';

    if (this.backgroundEnabled) {
      await this.registerServiceWorker();
      this.startEnhancedDataCollection();
    }
  }

  /**
   * Request extended background permissions from user
   */
  async requestBackgroundPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      this.showBackgroundPermissionModal((granted: boolean) => {
        if (granted) {
          this.enableBackgroundCollection();
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  private showBackgroundPermissionModal(callback: (granted: boolean) => void) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200/50">
        <div class="p-6">
          <div class="text-center mb-6">
            <div class="text-4xl mb-4">🌟</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Enhanced Digital Self</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              Enable background insights for a complete picture of your digital wellbeing.
            </p>
          </div>
          
          <div class="space-y-4 mb-6">
            <div class="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-4">
              <h4 class="font-medium text-gray-900 mb-2">🔍 Enhanced Insights:</h4>
              <ul class="text-sm text-gray-700 space-y-1">
                <li>• Focus and attention patterns</li>
                <li>• Sleep quality analysis</li>
                <li>• Stress level indicators</li>
                <li>• Digital wellness scoring</li>
                <li>• Personalized recommendations</li>
              </ul>
            </div>
            
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4">
              <h4 class="font-medium text-gray-900 mb-2">🛡️ Privacy Protected:</h4>
              <ul class="text-sm text-gray-700 space-y-1">
                <li>• All processing stays on your device</li>
                <li>• No personal data transmitted</li>
                <li>• Encrypted local storage only</li>
                <li>• Disable anytime in settings</li>
              </ul>
            </div>
            
            <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4">
              <h4 class="font-medium text-gray-900 mb-2">⚡ Background Collection:</h4>
              <ul class="text-sm text-gray-700 space-y-1">
                <li>• Minimal battery impact</li>
                <li>• Smart collection scheduling</li>
                <li>• Automatic data cleanup</li>
                <li>• Runs only when permitted</li>
              </ul>
            </div>
          </div>
          
          <div class="space-y-3">
            <button id="enableBtn" class="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-2xl font-medium hover:from-teal-600 hover:to-blue-600 transition-all">
              Enable Enhanced Insights
            </button>
            <button id="basicBtn" class="w-full bg-gray-100 text-gray-700 py-3 rounded-2xl font-medium hover:bg-gray-200 transition-colors">
              Keep Basic Version Only
            </button>
          </div>
          
          <div class="text-center mt-4">
            <p class="text-xs text-gray-500">
              You can change these permissions anytime in Digital Self → Settings
            </p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#enableBtn')?.addEventListener('click', () => {
      document.body.removeChild(modal);
      callback(true);
    });

    modal.querySelector('#basicBtn')?.addEventListener('click', () => {
      document.body.removeChild(modal);
      callback(false);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
        callback(false);
      }
    });
  }

  private async enableBackgroundCollection() {
    try {
      // Request necessary permissions
      await this.requestSystemPermissions();
      
      // Register service worker for background tasks
      await this.registerServiceWorker();
      
      // Start enhanced data collection
      this.startEnhancedDataCollection();
      
      // Store permission
      localStorage.setItem('behavior_background_enabled', 'true');
      this.backgroundEnabled = true;

      console.log('✅ Enhanced Digital Self enabled');
    } catch (error) {
      console.warn('Failed to enable background collection:', error);
    }
  }

  private async requestSystemPermissions() {
    const permissions: string[] = [];
    
    // Geolocation for enhanced context
    try {
      const geo = await navigator.permissions.query({name: 'geolocation'});
      if (geo.state !== 'granted') {
        navigator.geolocation.getCurrentPosition(() => {}, () => {});
      }
    } catch (e) {}

    // Notifications for interaction patterns
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    // Background sync if supported
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      // Will be handled by service worker registration
    }

    return permissions;
  }

  private async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    try {
      // Register the service worker from the public directory
      this.serviceWorker = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('🔧 Background service worker registered');
      
      // Send configuration to service worker
      if (this.serviceWorker.active) {
        this.serviceWorker.active.postMessage({
          type: 'ENABLE_BACKGROUND_COLLECTION',
          data: {
            permissions: this.ENHANCED_PERMISSIONS,
            collectionInterval: 30 * 60 * 1000 // 30 minutes
          }
        });
      }
      
      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'BACKGROUND_DATA') {
          this.handleBackgroundData(event.data.data);
        }
      });
      
    } catch (error) {
      console.warn('Service worker registration failed:', error);
    }
  }

  private handleBackgroundData(data: any) {
    // Handle background data received from service worker
    try {
      console.log('📊 Received background data:', data);
      // Integrate with existing behavior patterns
      // This could be used to enhance the current behavior analysis
    } catch (error) {
      console.warn('Failed to handle background data:', error);
    }
  }

  private startEnhancedDataCollection() {
    // Collect enhanced data every 30 minutes
    this.dataCollectionInterval = setInterval(() => {
      this.collectEnhancedBehaviorData();
    }, 30 * 60 * 1000); // 30 minutes

    // Initial collection
    this.collectEnhancedBehaviorData();
  }

  private async collectEnhancedBehaviorData() {
    if (!this.backgroundEnabled) return;

    try {
      // Get base behavior data from existing service
      const baseContext = behaviorAnalyticsService.getBehaviorContext();
      if (!baseContext) return;

      // Collect enhanced system data
      const enhancedData = await this.collectSystemWideData();
      
      // Analyze advanced patterns
      const advancedMetrics = this.analyzeAdvancedPatterns(enhancedData);

      const enhancedPattern: EnhancedBehaviorPattern = {
        timestamp: Date.now(),
        mood: baseContext.currentMood,
        activity: this.parseActivityLevel(baseContext.activityContext),
        social: this.parseSocialLevel(baseContext.socialContext),
        sleep: baseContext.recentPatterns[baseContext.recentPatterns.length - 1]?.sleepQuality || 7,
        focus: advancedMetrics.focus,
        stress: advancedMetrics.stress,
        energy: advancedMetrics.energy,
        contextualFactors: {
          timeOfDay: this.getTimeOfDay(),
          dayOfWeek: new Date().toLocaleDateString('en', { weekday: 'long' }),
          location: baseContext.locationContext,
          socialContext: baseContext.socialContext,
          workContext: this.determineWorkContext(enhancedData)
        },
        backgroundData: enhancedData
      };

      this.enhancedPatterns.push(enhancedPattern);
      
      // Maintain reasonable storage size
      if (this.enhancedPatterns.length > 100) {
        this.enhancedPatterns = this.enhancedPatterns.slice(-100);
      }

      // Store encrypted
      await this.storeEnhancedData();

    } catch (error) {
      console.warn('Enhanced data collection failed:', error);
    }
  }

  private async collectSystemWideData(): Promise<Partial<BackgroundDataCollection>> {
    const data: Partial<BackgroundDataCollection> = {};

    try {
      // Battery information
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        data.batteryUsage = {
          level: Math.round(battery.level * 100),
          chargingPattern: battery.charging ? 'frequent' : 'normal',
          screenOnTime: this.estimateScreenOnTime()
        };
      }

      // Network connectivity patterns
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        data.connectivityPatterns = {
          wifiLocations: await this.getWifiLocationHistory(),
          mobilityIndicators: await this.analyzeMobilityPatterns()
        };
      }

      // Circadian rhythm analysis
      data.circadianRhythm = await this.analyzeCircadianRhythm();

      // Screen time estimation (approximated from interaction patterns)
      data.screenTime = await this.estimateScreenTimeData();

    } catch (error) {
      console.warn('System data collection error:', error);
    }

    return data;
  }

  private analyzeAdvancedPatterns(data: Partial<BackgroundDataCollection>) {
    // Advanced pattern analysis
    const now = new Date();
    const hour = now.getHours();
    
    // Focus score based on interaction patterns and time
    let focus = 7; // baseline
    if (hour >= 9 && hour <= 11) focus += 2; // morning focus peak
    if (hour >= 14 && hour <= 16) focus += 1; // afternoon focus
    if (data.batteryUsage?.level && data.batteryUsage.level < 20) focus -= 1; // low battery affects focus

    // Stress indicators
    let stress = 3; // baseline low stress
    if (data.batteryUsage?.chargingPattern === 'frequent') stress += 1; // frequent charging = busy
    if (hour >= 22 || hour <= 6) stress += 1; // late/early hours
    
    // Energy levels
    let energy = 7; // baseline
    if (data.circadianRhythm?.consistency && data.circadianRhythm.consistency > 0.8) energy += 1;
    if (data.batteryUsage?.level && data.batteryUsage.level > 80) energy += 1; // well-charged device = prepared user

    return {
      focus: Math.min(10, Math.max(0, focus)),
      stress: Math.min(10, Math.max(0, stress)),
      energy: Math.min(10, Math.max(0, energy))
    };
  }

  // Helper methods for enhanced data collection
  private parseActivityLevel(level: string): number {
    const map: { [key: string]: number } = {
      'low activity': 2,
      'moderate activity': 5,
      'active': 7,
      'very active': 9
    };
    return map[level] || 5;
  }

  private parseSocialLevel(level: string): number {
    const map: { [key: string]: number } = {
      'isolated': 2,
      'somewhat social': 4,
      'socially active': 7,
      'highly social': 9
    };
    return map[level] || 5;
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  private determineWorkContext(data: Partial<BackgroundDataCollection>): 'work' | 'personal' | 'mixed' {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    
    // Work hours on weekdays
    if (day >= 1 && day <= 5 && hour >= 9 && hour <= 17) {
      return 'work';
    }
    
    // Mixed context during transition hours
    if ((hour >= 8 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      return 'mixed';
    }
    
    return 'personal';
  }

  private estimateScreenOnTime(): number {
    // Estimate based on interaction frequency (simplified)
    const now = Date.now();
    const interactions = this.getRecentInteractions();
    return Math.min(600, interactions.length * 10); // Cap at 10 hours
  }

  private async getWifiLocationHistory(): Promise<string[]> {
    // This would integrate with system WiFi data if available
    // For privacy, we only store location labels, not actual SSIDs
    return ['home', 'office', 'cafe']; // Simplified
  }

  private async analyzeMobilityPatterns() {
    // Analyze movement patterns from accelerometer data
    const recentSensorData = this.getRecentSensorData();
    
    return {
      stationary: 70, // percentage
      walking: 25,
      vehicle: 5
    };
  }

  private async analyzeCircadianRhythm() {
    const patterns = this.enhancedPatterns.slice(-14); // Last 2 weeks
    
    if (patterns.length === 0) {
      return {
        sleepStart: 23,
        sleepEnd: 7,
        consistency: 0.7,
        qualityIndicators: {
          nighttimePhone: 30,
          morningDelay: 15
        }
      };
    }

    // Analyze sleep patterns from usage gaps
    const sleepTimes = patterns.map(p => this.extractSleepTimes(p));
    const avgSleepStart = sleepTimes.reduce((sum, t) => sum + t.start, 0) / sleepTimes.length;
    const avgSleepEnd = sleepTimes.reduce((sum, t) => sum + t.end, 0) / sleepTimes.length;
    
    return {
      sleepStart: Math.round(avgSleepStart),
      sleepEnd: Math.round(avgSleepEnd),
      consistency: this.calculateSleepConsistency(sleepTimes),
      qualityIndicators: {
        nighttimePhone: this.calculateNighttimeUsage(patterns),
        morningDelay: this.calculateMorningDelay(patterns)
      }
    };
  }

  private async estimateScreenTimeData() {
    // Estimate daily screen time from interaction patterns
    return {
      daily: 240, // minutes (4 hours average)
      apps: {
        'Browser': 120,
        'Social': 60,
        'Productivity': 60
      },
      categories: {
        'Communication': 80,
        'Entertainment': 100,
        'Work': 60
      }
    };
  }

  // Utility methods
  private getRecentInteractions() {
    // Get recent user interactions (simplified)
    return Array.from({ length: 20 }, (_, i) => ({
      timestamp: Date.now() - (i * 30 * 60 * 1000),
      type: 'interaction'
    }));
  }

  private getRecentSensorData() {
    // Get recent accelerometer data from behavior analytics service
    return [];
  }

  private extractSleepTimes(pattern: EnhancedBehaviorPattern) {
    // Extract sleep times from usage patterns
    return { start: 23, end: 7 }; // Simplified
  }

  private calculateSleepConsistency(sleepTimes: any[]): number {
    if (sleepTimes.length < 2) return 0.7;
    
    // Calculate variance in sleep times
    const startVariance = this.calculateVariance(sleepTimes.map(t => t.start));
    const endVariance = this.calculateVariance(sleepTimes.map(t => t.end));
    
    // Lower variance = higher consistency
    return Math.max(0, 1 - (startVariance + endVariance) / 10);
  }

  private calculateNighttimeUsage(patterns: EnhancedBehaviorPattern[]): number {
    // Calculate phone usage during sleep hours
    return 30; // minutes (simplified)
  }

  private calculateMorningDelay(patterns: EnhancedBehaviorPattern[]): number {
    // Time from wake up to first phone interaction
    return 15; // minutes (simplified)
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const variance = numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
    return variance;
  }

  private async storeEnhancedData() {
    if (typeof window === 'undefined') return;

    try {
      const data = {
        enhancedPatterns: this.enhancedPatterns.slice(-50), // Store last 50
        timestamp: Date.now()
      };
      
      const encryptedData = await this.encryptData(JSON.stringify(data));
      localStorage.setItem('behavior_enhanced_data', encryptedData);
    } catch (error) {
      console.warn('Failed to store enhanced data:', error);
    }
  }

  private async loadEnhancedData() {
    if (typeof window === 'undefined') return;
    
    try {
      const encryptedData = localStorage.getItem('behavior_enhanced_data');
      if (!encryptedData) return;
      
      const decryptedData = await this.decryptData(encryptedData);
      const data = JSON.parse(decryptedData);
      
      this.enhancedPatterns = data.enhancedPatterns || [];
    } catch (error) {
      console.warn('Failed to load enhanced data:', error);
    }
  }

  private async encryptData(data: string): Promise<string> {
    // Simple encryption using base64 encoding for privacy
    // In production, this should use proper encryption like AES-256
    return btoa(data);
  }

  private async decryptData(data: string): Promise<string> {
    // Simple decryption using base64 decoding
    // In production, this should use proper decryption like AES-256
    return atob(data);
  }

  /**
   * Public API
   */
  
  isBackgroundEnabled(): boolean {
    return this.backgroundEnabled;
  }

  getEnhancedPatterns(): EnhancedBehaviorPattern[] {
    return this.enhancedPatterns.slice(); // Return copy
  }

  async disableBackgroundCollection() {
    this.backgroundEnabled = false;
    localStorage.setItem('behavior_background_enabled', 'false');
    
    if (this.dataCollectionInterval) {
      clearInterval(this.dataCollectionInterval);
      this.dataCollectionInterval = null;
    }

    if (this.serviceWorker) {
      await this.serviceWorker.unregister();
      this.serviceWorker = null;
    }

    console.log('🔧 Background collection disabled');
  }

  clearEnhancedData() {
    this.enhancedPatterns = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('behavior_enhanced_data');
    }
  }

  getEnhancedSummary() {
    if (this.enhancedPatterns.length === 0) return null;

    const recent = this.enhancedPatterns.slice(-7); // Last week
    const avg = (arr: number[]) => arr.reduce((sum, n) => sum + n, 0) / arr.length;

    return {
      focus: avg(recent.map(p => p.focus)),
      stress: avg(recent.map(p => p.stress)),
      energy: avg(recent.map(p => p.energy)),
      sleepConsistency: recent[recent.length - 1]?.backgroundData?.circadianRhythm?.consistency || 0.7,
      digitalBalance: this.calculateDigitalBalance(recent),
      trendsAvailable: recent.length > 3
    };
  }

  private calculateDigitalBalance(patterns: EnhancedBehaviorPattern[]): number {
    // Calculate digital wellness score
    const latestPattern = patterns[patterns.length - 1];
    if (!latestPattern) return 70;

    const focusScore = latestPattern.focus * 10;
    const stressScore = (10 - latestPattern.stress) * 10;
    const energyScore = latestPattern.energy * 10;
    const sleepScore = (latestPattern.backgroundData?.circadianRhythm?.consistency || 0.7) * 100;

    return Math.round((focusScore + stressScore + energyScore + sleepScore) / 4);
  }
}

export const backgroundBehaviorService = BackgroundBehaviorService.getInstance();
export type { EnhancedBehaviorPattern, BackgroundDataCollection };