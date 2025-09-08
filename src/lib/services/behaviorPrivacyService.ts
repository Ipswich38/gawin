'use client';

/**
 * Behavior Analytics Privacy Service
 * Handles all privacy, consent, and data protection aspects
 */

interface PrivacySettings {
  behaviorAnalytics: boolean;
  locationTracking: boolean;
  sensorData: boolean;
  aiIntegration: boolean;
  dataRetention: number; // days
  shareAnalytics: boolean;
}

interface ConsentRecord {
  timestamp: number;
  version: string;
  granted: boolean;
  settings: PrivacySettings;
}

class BehaviorPrivacyService {
  private static instance: BehaviorPrivacyService;
  private readonly CONSENT_VERSION = '1.0';
  private readonly DEFAULT_RETENTION_DAYS = 7;

  constructor() {}

  static getInstance(): BehaviorPrivacyService {
    if (!BehaviorPrivacyService.instance) {
      BehaviorPrivacyService.instance = new BehaviorPrivacyService();
    }
    return BehaviorPrivacyService.instance;
  }

  /**
   * Check if user has given valid consent
   */
  hasValidConsent(): boolean {
    const consent = this.getStoredConsent();
    
    if (!consent) return false;
    if (consent.version !== this.CONSENT_VERSION) return false;
    if (!consent.granted) return false;
    
    // Check if consent is not too old (30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    if (consent.timestamp < thirtyDaysAgo) return false;
    
    return true;
  }

  /**
   * Request consent from user with clear explanation
   */
  async requestConsent(): Promise<boolean> {
    return new Promise((resolve) => {
      // Show consent modal (will be integrated with existing UI)
      this.showConsentModal((granted: boolean, settings?: PrivacySettings) => {
        if (granted && settings) {
          this.recordConsent(settings);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  private showConsentModal(callback: (granted: boolean, settings?: PrivacySettings) => void) {
    // Create a subtle consent UI that doesn't disrupt the app flow
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-200/50">
        <div class="p-6">
          <div class="text-center mb-6">
            <div class="text-2xl mb-3">🧠</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Enhance Your AI Experience</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              Gawin can learn from your behavior patterns to provide more personalized and helpful responses.
            </p>
          </div>
          
          <div class="space-y-4 mb-6">
            <div class="bg-gray-50 rounded-2xl p-4">
              <h4 class="font-medium text-gray-900 mb-2">What we collect:</h4>
              <ul class="text-sm text-gray-700 space-y-1">
                <li>• Anonymous location patterns (for context)</li>
                <li>• Activity levels (for mood insights)</li>
                <li>• Usage patterns (for better responses)</li>
              </ul>
            </div>
            
            <div class="bg-blue-50 rounded-2xl p-4">
              <h4 class="font-medium text-gray-900 mb-2">Your privacy:</h4>
              <ul class="text-sm text-gray-700 space-y-1">
                <li>• All data stays on your device</li>
                <li>• Military-grade encryption (AES-256)</li>
                <li>• No sharing with third parties</li>
                <li>• Delete anytime</li>
              </ul>
            </div>
          </div>
          
          <div class="space-y-3">
            <button id="acceptBtn" class="w-full bg-emerald-500 text-white py-3 rounded-2xl font-medium hover:bg-emerald-600 transition-colors">
              Enable Smart Features
            </button>
            <button id="declineBtn" class="w-full bg-gray-100 text-gray-700 py-3 rounded-2xl font-medium hover:bg-gray-200 transition-colors">
              Maybe Later
            </button>
          </div>
          
          <div class="text-center mt-4">
            <button id="learnMore" class="text-xs text-gray-500 hover:text-gray-700">
              Learn more about our privacy practices
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle button clicks
    const acceptBtn = modal.querySelector('#acceptBtn');
    const declineBtn = modal.querySelector('#declineBtn');
    const learnMore = modal.querySelector('#learnMore');

    acceptBtn?.addEventListener('click', () => {
      document.body.removeChild(modal);
      const settings: PrivacySettings = {
        behaviorAnalytics: true,
        locationTracking: true,
        sensorData: true,
        aiIntegration: true,
        dataRetention: this.DEFAULT_RETENTION_DAYS,
        shareAnalytics: false
      };
      callback(true, settings);
    });

    declineBtn?.addEventListener('click', () => {
      document.body.removeChild(modal);
      callback(false);
    });

    learnMore?.addEventListener('click', () => {
      this.showPrivacyDetails();
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
        callback(false);
      }
    });
  }

  private showPrivacyDetails() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-200/50 max-h-[80vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Privacy & Data Protection</h3>
            <button id="closeBtn" class="p-2 hover:bg-gray-100 rounded-full">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="space-y-6 text-sm text-gray-700 leading-relaxed">
            <section>
              <h4 class="font-semibold text-gray-900 mb-2">Data Collection</h4>
              <p>We collect behavioral patterns to enhance your AI experience:</p>
              <ul class="list-disc pl-5 mt-2 space-y-1">
                <li>Location patterns (stay points, not exact addresses)</li>
                <li>Activity levels from device sensors</li>
                <li>App usage patterns and interaction frequency</li>
                <li>Sleep quality indicators from night-time activity</li>
              </ul>
            </section>
            
            <section>
              <h4 class="font-semibold text-gray-900 mb-2">Data Protection</h4>
              <ul class="list-disc pl-5 space-y-1">
                <li>All data is encrypted with AES-256 encryption</li>
                <li>Data never leaves your device</li>
                <li>No cloud storage or third-party sharing</li>
                <li>Automatic deletion after 7 days (configurable)</li>
              </ul>
            </section>
            
            <section>
              <h4 class="font-semibold text-gray-900 mb-2">How It Enhances AI</h4>
              <ul class="list-disc pl-5 space-y-1">
                <li>Contextual awareness for more relevant responses</li>
                <li>Mood-sensitive conversation adjustments</li>
                <li>Personalized recommendations based on patterns</li>
                <li>Better understanding of your current situation</li>
              </ul>
            </section>
            
            <section>
              <h4 class="font-semibold text-gray-900 mb-2">Your Control</h4>
              <ul class="list-disc pl-5 space-y-1">
                <li>Enable/disable any time in settings</li>
                <li>Delete all data instantly</li>
                <li>Granular control over data types</li>
                <li>Transparent privacy dashboard</li>
              </ul>
            </section>
            
            <div class="bg-green-50 border border-green-200 rounded-2xl p-4 mt-6">
              <h4 class="font-semibold text-green-800 mb-1">Privacy-First Design</h4>
              <p class="text-green-700">This system is built with privacy as the foundation, not an afterthought. Your data is yours, always.</p>
            </div>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button id="acceptDetailsBtn" class="flex-1 bg-emerald-500 text-white py-3 rounded-2xl font-medium hover:bg-emerald-600 transition-colors">
              I Understand, Enable Features
            </button>
            <button id="declineDetailsBtn" class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-medium hover:bg-gray-200 transition-colors">
              No Thanks
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#closeBtn');
    const acceptBtn = modal.querySelector('#acceptDetailsBtn');
    const declineBtn = modal.querySelector('#declineDetailsBtn');

    const closeModal = () => {
      document.body.removeChild(modal);
    };

    closeBtn?.addEventListener('click', closeModal);
    declineBtn?.addEventListener('click', closeModal);
    acceptBtn?.addEventListener('click', () => {
      closeModal();
      // Re-trigger the main consent flow
      setTimeout(() => this.requestConsent(), 100);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  private recordConsent(settings: PrivacySettings) {
    const consent: ConsentRecord = {
      timestamp: Date.now(),
      version: this.CONSENT_VERSION,
      granted: true,
      settings
    };
    
    localStorage.setItem('behavior_analytics_consent', JSON.stringify(consent));
  }

  private getStoredConsent(): ConsentRecord | null {
    try {
      const stored = localStorage.getItem('behavior_analytics_consent');
      if (!stored) return null;
      
      return JSON.parse(stored);
    } catch (error) {
      console.warn('Failed to parse consent record:', error);
      return null;
    }
  }

  /**
   * Get current privacy settings
   */
  getPrivacySettings(): PrivacySettings | null {
    const consent = this.getStoredConsent();
    return consent?.settings || null;
  }

  /**
   * Update privacy settings
   */
  updatePrivacySettings(settings: Partial<PrivacySettings>): boolean {
    const consent = this.getStoredConsent();
    if (!consent) return false;
    
    const updatedSettings = { ...consent.settings, ...settings };
    const updatedConsent: ConsentRecord = {
      ...consent,
      settings: updatedSettings,
      timestamp: Date.now() // Update timestamp
    };
    
    localStorage.setItem('behavior_analytics_consent', JSON.stringify(updatedConsent));
    return true;
  }

  /**
   * Withdraw consent and delete all data
   */
  withdrawConsent() {
    // Remove consent record
    localStorage.removeItem('behavior_analytics_consent');
    
    // Remove all behavior data
    localStorage.removeItem('behavior_analytics_data');
    
    // Clear encryption key
    localStorage.removeItem('behavior_encryption_key');
    
    // Disable AI integration
    localStorage.setItem('behavior_ai_integration', 'disabled');
  }

  /**
   * Get privacy dashboard data
   */
  getPrivacyDashboard() {
    const consent = this.getStoredConsent();
    const settings = consent?.settings;
    
    if (!consent || !settings) {
      return {
        consentStatus: 'not_granted',
        dataCollection: false,
        services: []
      };
    }

    return {
      consentStatus: 'granted',
      consentDate: new Date(consent.timestamp).toLocaleDateString(),
      dataCollection: true,
      services: [
        {
          name: 'Behavior Analytics',
          enabled: settings.behaviorAnalytics,
          description: 'Analyzes patterns for mood insights'
        },
        {
          name: 'Location Tracking',
          enabled: settings.locationTracking,
          description: 'Tracks stay points for context'
        },
        {
          name: 'Sensor Data',
          enabled: settings.sensorData,
          description: 'Uses device sensors for activity levels'
        },
        {
          name: 'AI Integration',
          enabled: settings.aiIntegration,
          description: 'Enhances AI responses with context'
        }
      ],
      dataRetention: `${settings.dataRetention} days`,
      encryption: 'AES-256',
      dataLocation: 'Local device only',
      sharing: 'None - data never shared'
    };
  }

  /**
   * Check if user should be prompted for consent
   */
  shouldPromptForConsent(): boolean {
    // Don't prompt if user has explicitly declined recently
    const lastPrompt = localStorage.getItem('behavior_last_consent_prompt');
    if (lastPrompt) {
      const lastPromptTime = parseInt(lastPrompt);
      const daysSinceLastPrompt = (Date.now() - lastPromptTime) / (24 * 60 * 60 * 1000);
      
      // Wait at least 7 days before prompting again
      if (daysSinceLastPrompt < 7) {
        return false;
      }
    }
    
    return !this.hasValidConsent();
  }

  /**
   * Record that consent was prompted (to avoid annoying users)
   */
  recordConsentPrompt() {
    localStorage.setItem('behavior_last_consent_prompt', Date.now().toString());
  }

  /**
   * Show privacy settings panel
   */
  showPrivacySettings() {
    const dashboard = this.getPrivacyDashboard();
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200/50">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Privacy Settings</h3>
            <button id="closeBtn" class="p-2 hover:bg-gray-100 rounded-full">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            ${dashboard.services.map(service => `
              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-2xl">
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">${service.name}</h4>
                  <p class="text-sm text-gray-600">${service.description}</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" ${service.enabled ? 'checked' : ''} class="sr-only peer" data-service="${service.name}">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            `).join('')}
          </div>
          
          <div class="mt-6 p-4 bg-gray-50 rounded-2xl">
            <h4 class="font-medium text-gray-900 mb-2">Data Summary</h4>
            <div class="text-sm text-gray-700 space-y-1">
              <div>Status: <span class="font-medium">${dashboard.consentStatus === 'granted' ? 'Active' : 'Inactive'}</span></div>
              <div>Retention: <span class="font-medium">${dashboard.dataRetention}</span></div>
              <div>Storage: <span class="font-medium">${dashboard.dataLocation}</span></div>
              <div>Sharing: <span class="font-medium">${dashboard.sharing}</span></div>
            </div>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button id="deleteDataBtn" class="flex-1 bg-red-100 text-red-700 py-3 rounded-2xl font-medium hover:bg-red-200 transition-colors">
              Delete All Data
            </button>
            <button id="saveBtn" class="flex-1 bg-emerald-500 text-white py-3 rounded-2xl font-medium hover:bg-emerald-600 transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle interactions
    const closeModal = () => {
      document.body.removeChild(modal);
    };

    modal.querySelector('#closeBtn')?.addEventListener('click', closeModal);
    modal.querySelector('#deleteDataBtn')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete all behavior data? This action cannot be undone.')) {
        this.withdrawConsent();
        closeModal();
      }
    });

    modal.querySelector('#saveBtn')?.addEventListener('click', () => {
      // Save updated settings
      const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
      const newSettings: Partial<PrivacySettings> = {};
      
      checkboxes.forEach((checkbox: any) => {
        const service = checkbox.dataset.service;
        const enabled = checkbox.checked;
        
        switch (service) {
          case 'Behavior Analytics':
            newSettings.behaviorAnalytics = enabled;
            break;
          case 'Location Tracking':
            newSettings.locationTracking = enabled;
            break;
          case 'Sensor Data':
            newSettings.sensorData = enabled;
            break;
          case 'AI Integration':
            newSettings.aiIntegration = enabled;
            break;
        }
      });
      
      this.updatePrivacySettings(newSettings);
      closeModal();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
}

export const behaviorPrivacyService = BehaviorPrivacyService.getInstance();
export type { PrivacySettings };