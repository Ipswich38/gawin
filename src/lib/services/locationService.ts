/**
 * Privacy-First Location Service for Gawin
 * Ensures user consent, transparency, and no server location exposure
 */

export interface UserLocation {
  city: string | null;
  region: string | null;
  country: string | null;
  timezone: string;
  coordinates?: { lat: number; lng: number };
  accuracy: 'high' | 'medium' | 'low' | 'none' | 'manual';
  method: string;
  timestamp?: string;
}

export interface LocationConsentResult {
  granted: boolean;
  timestamp: string;
}

export class LocationService {
  private userLocation: UserLocation | null = null;
  private consentGranted: boolean = false;

  constructor() {
    this.loadSavedData();
  }

  /**
   * Main function to get user location with privacy-first approach
   */
  async getUserLocation(askConsent: boolean = true): Promise<UserLocation> {
    // Return cached location if available and not too old (24 hours)
    if (this.userLocation && this.userLocation.city) {
      const locationAge = this.userLocation.timestamp ?
        Date.now() - new Date(this.userLocation.timestamp).getTime() :
        Infinity;
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (locationAge < twentyFourHours) {
        console.log('📍 Using cached location:', this.userLocation.city);
        return this.userLocation;
      }
    }

    // Check if we need to ask for consent
    if (askConsent && !this.consentGranted) {
      const consent = await this.askLocationConsent();
      if (!consent.granted) {
        return this.getDefaultLocation();
      }
      this.consentGranted = true;
      this.saveConsentStatus(consent);
    }

    // Try multiple detection methods in order of preference
    const methods = [
      this.getBrowserGeolocation.bind(this),
      this.getIPGeolocation.bind(this),
      this.getTimezoneLocation.bind(this),
    ];

    for (const method of methods) {
      try {
        const location = await method();
        if (location && location.city && !this.isServerLocation(location.city)) {
          this.userLocation = {
            ...location,
            timestamp: new Date().toISOString()
          };
          this.saveUserLocation();
          return this.userLocation;
        }
      } catch (error) {
        console.warn(`Location detection method failed:`, error);
        continue;
      }
    }

    return this.getDefaultLocation();
  }

  /**
   * Ask user consent with clear privacy explanation
   */
  private async askLocationConsent(): Promise<LocationConsentResult> {
    return new Promise((resolve) => {
      const modal = this.createConsentModal();
      document.body.appendChild(modal);

      const handleResponse = (granted: boolean) => {
        document.body.removeChild(modal);
        resolve({
          granted,
          timestamp: new Date().toISOString()
        });
      };

      modal.querySelector('.consent-allow')?.addEventListener('click', () => handleResponse(true));
      modal.querySelector('.consent-deny')?.addEventListener('click', () => handleResponse(false));
    });
  }

  /**
   * Create simple consent modal
   */
  private createConsentModal(): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'gawin-location-consent-modal';
    modal.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      ">
        <div style="
          background: white;
          padding: 24px;
          border-radius: 12px;
          max-width: 320px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          margin: 20px;
        ">
          <div style="font-size: 32px; margin-bottom: 12px;">📍</div>
          <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 18px;">Allow Location?</h3>
          <p style="color: #666; line-height: 1.4; margin-bottom: 20px; font-size: 14px;">
            Gawin can provide better local context like weather and time.
          </p>

          <div style="display: flex; gap: 10px; justify-content: center;">
            <button class="consent-allow" style="
              background: #007bff;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 500;
              font-size: 14px;
            ">
              Allow
            </button>
            <button class="consent-deny" style="
              background: #6c757d;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 500;
              font-size: 14px;
            ">
              Skip
            </button>
          </div>
        </div>
      </div>
    `;
    return modal;
  }

  /**
   * Method 1: Browser Geolocation API (most accurate)
   */
  private async getBrowserGeolocation(): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const cityData = await this.reverseGeocode(latitude, longitude);
            resolve({
              city: cityData.city,
              region: cityData.region,
              country: cityData.country,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              coordinates: { lat: latitude, lng: longitude },
              accuracy: 'high',
              method: 'browser_geolocation'
            });
          } catch (error) {
            reject(error);
          }
        },
        (error) => reject(error),
        {
          timeout: 15000,
          enableHighAccuracy: false,
          maximumAge: 300000 // 5 minutes cache
        }
      );
    });
  }

  /**
   * Method 2: IP Geolocation (backup)
   */
  private async getIPGeolocation(): Promise<UserLocation> {
    const services = [
      { url: 'https://ipapi.co/json/', type: 'ipapi' },
      { url: 'https://ipinfo.io/json', type: 'ipinfo' },
      { url: 'https://ip-api.com/json/', type: 'ipapi_com' }
    ];

    for (const service of services) {
      try {
        const response = await fetch(service.url, {
          headers: {
            'Accept': 'application/json',
          }
        });

        if (!response.ok) continue;

        const data = await response.json();
        const location = this.normalizeLocationData(data, service.type);

        if (location.city && !this.isServerLocation(location.city)) {
          return {
            ...location,
            accuracy: 'medium',
            method: 'ip_geolocation'
          };
        }
      } catch (error) {
        console.warn(`IP service failed: ${service.url}`, error);
        continue;
      }
    }

    throw new Error('All IP geolocation services failed');
  }

  /**
   * Method 3: Timezone-based location (privacy-friendly fallback)
   */
  private async getTimezoneLocation(): Promise<UserLocation> {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneMap: Record<string, Omit<UserLocation, 'timezone' | 'accuracy' | 'method'>> = {
      'Asia/Manila': { city: 'Manila', region: 'Metro Manila', country: 'Philippines' },
      'Asia/Singapore': { city: 'Singapore', region: 'Singapore', country: 'Singapore' },
      'Asia/Jakarta': { city: 'Jakarta', region: 'Jakarta', country: 'Indonesia' },
      'Asia/Kuala_Lumpur': { city: 'Kuala Lumpur', region: 'Kuala Lumpur', country: 'Malaysia' },
      'Asia/Bangkok': { city: 'Bangkok', region: 'Bangkok', country: 'Thailand' },
      'Asia/Hong_Kong': { city: 'Hong Kong', region: 'Hong Kong', country: 'Hong Kong' },
      'Asia/Tokyo': { city: 'Tokyo', region: 'Tokyo', country: 'Japan' },
      'Asia/Seoul': { city: 'Seoul', region: 'Seoul', country: 'South Korea' },
      'America/New_York': { city: 'New York', region: 'New York', country: 'United States' },
      'America/Los_Angeles': { city: 'Los Angeles', region: 'California', country: 'United States' },
      'America/Chicago': { city: 'Chicago', region: 'Illinois', country: 'United States' },
      'Europe/London': { city: 'London', region: 'England', country: 'United Kingdom' },
      'Europe/Paris': { city: 'Paris', region: 'Île-de-France', country: 'France' },
      'Europe/Berlin': { city: 'Berlin', region: 'Berlin', country: 'Germany' },
      'Australia/Sydney': { city: 'Sydney', region: 'New South Wales', country: 'Australia' },
      'Australia/Melbourne': { city: 'Melbourne', region: 'Victoria', country: 'Australia' },
    };

    const location = timezoneMap[timezone];
    if (location) {
      return {
        ...location,
        timezone,
        accuracy: 'low',
        method: 'timezone_detection'
      };
    }

    throw new Error('Timezone not mapped');
  }

  /**
   * Reverse geocoding helper
   */
  private async reverseGeocode(lat: number, lng: number): Promise<{city: string; region: string; country: string}> {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding service unavailable');
      }

      const data = await response.json();

      return {
        city: data.city || data.locality || data.principalSubdivision,
        region: data.principalSubdivision || data.city,
        country: data.countryName
      };
    } catch (error) {
      throw new Error('Reverse geocoding failed');
    }
  }

  /**
   * Normalize different IP service response formats
   */
  private normalizeLocationData(data: any, serviceType: string): Omit<UserLocation, 'accuracy' | 'method'> {
    switch (serviceType) {
      case 'ipapi':
        return {
          city: data.city,
          region: data.region,
          country: data.country_name,
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
        };
      case 'ipinfo':
        return {
          city: data.city,
          region: data.region,
          country: data.country,
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
        };
      case 'ipapi_com':
        return {
          city: data.city,
          region: data.regionName,
          country: data.country,
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
        };
      default:
        return {
          city: data.city,
          region: data.region,
          country: data.country,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }
  }

  /**
   * Check if city is a server location that should be filtered out
   */
  private isServerLocation(city: string): boolean {
    const serverLocations = [
      'ashburn',
      'virginia',
      'aws',
      'amazon',
      'cloudflare',
      'google cloud',
      'microsoft azure',
      'data center',
      'server farm'
    ];

    return serverLocations.some(serverLoc =>
      city.toLowerCase().includes(serverLoc.toLowerCase())
    );
  }

  /**
   * Fallback when no location can be determined
   */
  private getDefaultLocation(): UserLocation {
    return {
      city: null,
      region: null,
      country: null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      accuracy: 'none',
      method: 'default'
    };
  }

  /**
   * Allow users to manually set/override their location
   */
  setManualLocation(city: string, region: string, country: string): UserLocation {
    this.userLocation = {
      city: city.trim(),
      region: region.trim(),
      country: country.trim(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      accuracy: 'manual',
      method: 'user_override',
      timestamp: new Date().toISOString()
    };

    this.saveUserLocation();
    return this.userLocation;
  }

  /**
   * Get current user location without triggering detection
   */
  getCurrentLocation(): UserLocation | null {
    return this.userLocation;
  }

  /**
   * Clear all location data and consent
   */
  clearAllLocationData(): void {
    this.userLocation = null;
    this.consentGranted = false;

    localStorage.removeItem('gawin_user_location');
    localStorage.removeItem('gawin_location_consent');

    console.log('🗑️ All location data cleared');
  }

  /**
   * Check if user has granted location consent
   */
  hasLocationConsent(): boolean {
    return this.consentGranted;
  }

  /**
   * Save user location to localStorage
   */
  private saveUserLocation(): void {
    if (this.userLocation) {
      try {
        localStorage.setItem('gawin_user_location', JSON.stringify(this.userLocation));
      } catch (error) {
        console.warn('Failed to save location:', error);
      }
    }
  }

  /**
   * Save consent status
   */
  private saveConsentStatus(consent: LocationConsentResult): void {
    try {
      localStorage.setItem('gawin_location_consent', JSON.stringify(consent));
    } catch (error) {
      console.warn('Failed to save consent:', error);
    }
  }

  /**
   * Load saved location and consent from localStorage
   */
  private loadSavedData(): void {
    try {
      // Load saved location
      const savedLocation = localStorage.getItem('gawin_user_location');
      if (savedLocation) {
        this.userLocation = JSON.parse(savedLocation);
      }

      // Load consent status
      const savedConsent = localStorage.getItem('gawin_location_consent');
      if (savedConsent) {
        const consent: LocationConsentResult = JSON.parse(savedConsent);
        // Consent expires after 90 days (extended for better UX)
        const consentAge = Date.now() - new Date(consent.timestamp).getTime();
        const ninetyDays = 90 * 24 * 60 * 60 * 1000;

        if (consentAge < ninetyDays && consent.granted) {
          this.consentGranted = true;
        }
      }
    } catch (error) {
      console.warn('Failed to load saved location data:', error);
    }
  }

  /**
   * Get location accuracy description for UI
   */
  getLocationAccuracyDescription(): string {
    if (!this.userLocation) return 'Location not detected';

    switch (this.userLocation.accuracy) {
      case 'high':
        return 'Precise location (GPS)';
      case 'medium':
        return 'City-level accuracy (IP)';
      case 'low':
        return 'Region-level accuracy (Timezone)';
      case 'manual':
        return 'User-provided location';
      default:
        return 'Location unavailable';
    }
  }
}