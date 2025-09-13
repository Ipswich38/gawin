/**
 * Advanced Device Detection and Responsive Optimization
 * Automatic detection of device models, screen sizes, and optimization
 */

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  brand: string;
  model: string;
  os: string;
  osVersion: string;
  browser: string;
  browserVersion: string;
  screenSize: {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
    pixelRatio: number;
  };
  viewport: {
    width: number;
    height: number;
  };
  orientation: 'portrait' | 'landscape';
  touch: boolean;
  darkMode: boolean;
  reduceMotion: boolean;
  highContrast: boolean;
}

export interface OptimizationConfig {
  chatInputHeight: string;
  tabHeight: string;
  fontSize: string;
  spacing: string;
  borderRadius: string;
  maxWidth: string;
  gridCols: number;
  compactMode: boolean;
}

class DeviceDetectionService {
  private userAgent: string;
  private deviceInfo: DeviceInfo | null = null;

  constructor() {
    this.userAgent = typeof window !== 'undefined' ? navigator.userAgent : '';
  }

  /**
   * Detect comprehensive device information
   */
  detectDevice(): DeviceInfo {
    if (this.deviceInfo) return this.deviceInfo;

    const screenInfo = this.getScreenInfo();
    const type = this.detectDeviceType(screenInfo);
    const brand = this.detectBrand();
    const model = this.detectModel(brand);
    const os = this.detectOS();
    const osVersion = this.detectOSVersion(os);
    const browser = this.detectBrowser();
    const browserVersion = this.detectBrowserVersion(browser);

    this.deviceInfo = {
      type,
      brand,
      model,
      os,
      osVersion,
      browser,
      browserVersion,
      screenSize: screenInfo,
      viewport: this.getViewportInfo(),
      orientation: this.getOrientation(),
      touch: this.supportsTouchScreen(),
      darkMode: this.prefersDarkMode(),
      reduceMotion: this.prefersReducedMotion(),
      highContrast: this.prefersHighContrast()
    };

    console.log('🔍 Device Detection:', this.deviceInfo);
    return this.deviceInfo;
  }

  /**
   * Get optimized configuration for detected device
   */
  getOptimizationConfig(deviceInfo: DeviceInfo): OptimizationConfig {
    const { type, brand, model, screenSize, viewport } = deviceInfo;

    // iPhone specific optimizations
    if (brand === 'Apple' && type === 'mobile') {
      return this.getIPhoneOptimization(model, viewport);
    }

    // Samsung specific optimizations
    if (brand === 'Samsung' && type === 'mobile') {
      return this.getSamsungOptimization(model, viewport);
    }

    // Generic mobile optimizations
    if (type === 'mobile') {
      return this.getMobileOptimization(viewport);
    }

    // Tablet optimizations
    if (type === 'tablet') {
      return this.getTabletOptimization(viewport);
    }

    // Desktop optimizations
    return this.getDesktopOptimization(viewport);
  }

  private getScreenInfo() {
    if (typeof window === 'undefined') {
      return {
        width: 1920,
        height: 1080,
        availWidth: 1920,
        availHeight: 1080,
        pixelRatio: 1
      };
    }

    return {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      pixelRatio: window.devicePixelRatio || 1
    };
  }

  private getViewportInfo() {
    if (typeof window === 'undefined') {
      return { width: 1920, height: 1080 };
    }

    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  private detectDeviceType(screenInfo: any): 'mobile' | 'tablet' | 'desktop' {
    const { width } = screenInfo;
    const viewport = this.getViewportInfo();

    // Mobile detection
    if (this.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i)) {
      if (this.userAgent.match(/iPad/i) || (width >= 768 && width < 1024)) {
        return 'tablet';
      }
      return 'mobile';
    }

    // Width-based detection as fallback
    if (viewport.width < 768) return 'mobile';
    if (viewport.width >= 768 && viewport.width < 1024) return 'tablet';
    return 'desktop';
  }

  private detectBrand(): string {
    const ua = this.userAgent.toLowerCase();
    
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod') || ua.includes('mac')) {
      return 'Apple';
    }
    if (ua.includes('samsung') || ua.includes('sm-') || ua.includes('galaxy')) {
      return 'Samsung';
    }
    if (ua.includes('pixel') || ua.includes('nexus')) {
      return 'Google';
    }
    if (ua.includes('huawei') || ua.includes('honor')) {
      return 'Huawei';
    }
    if (ua.includes('xiaomi') || ua.includes('mi ') || ua.includes('redmi')) {
      return 'Xiaomi';
    }
    if (ua.includes('oneplus')) {
      return 'OnePlus';
    }
    if (ua.includes('oppo')) {
      return 'Oppo';
    }
    if (ua.includes('vivo')) {
      return 'Vivo';
    }
    if (ua.includes('lgelectronics') || ua.includes('lge')) {
      return 'LG';
    }
    if (ua.includes('sony')) {
      return 'Sony';
    }

    return 'Unknown';
  }

  private detectModel(brand: string): string {
    const ua = this.userAgent;

    if (brand === 'Apple') {
      // Latest iPhone models
      if (ua.includes('iPhone16')) return 'iPhone 16';
      if (ua.includes('iPhone15')) return 'iPhone 15';
      if (ua.includes('iPhone14')) return 'iPhone 14';
      if (ua.includes('iPhone13')) return 'iPhone 13';
      if (ua.includes('iPhone12')) return 'iPhone 12';
      if (ua.includes('iPhone11')) return 'iPhone 11';
      if (ua.includes('iPhoneXS')) return 'iPhone XS';
      if (ua.includes('iPhoneXR')) return 'iPhone XR';
      if (ua.includes('iPhoneX')) return 'iPhone X';
      if (ua.includes('iPhone')) return 'iPhone';
      if (ua.includes('iPad')) return 'iPad';
    }

    if (brand === 'Samsung') {
      if (ua.includes('SM-S921')) return 'Galaxy S24';
      if (ua.includes('SM-S911')) return 'Galaxy S23';
      if (ua.includes('SM-S901')) return 'Galaxy S22';
      if (ua.includes('SM-G991')) return 'Galaxy S21';
      if (ua.includes('SM-G981')) return 'Galaxy S20';
      if (ua.includes('SM-N976')) return 'Galaxy Note 10';
      if (ua.includes('Galaxy')) return 'Galaxy Series';
    }

    return 'Unknown Model';
  }

  private detectOS(): string {
    const ua = this.userAgent;
    
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    
    return 'Unknown';
  }

  private detectOSVersion(os: string): string {
    const ua = this.userAgent;
    
    if (os === 'iOS') {
      const match = ua.match(/OS (\d+)_(\d+)_?(\d+)?/);
      if (match) return `${match[1]}.${match[2]}.${match[3] || '0'}`;
    }
    
    if (os === 'Android') {
      const match = ua.match(/Android (\d+\.?\d*\.?\d*)/);
      if (match) return match[1];
    }

    return 'Unknown';
  }

  private detectBrowser(): string {
    const ua = this.userAgent;
    
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Opera')) return 'Opera';
    
    return 'Unknown';
  }

  private detectBrowserVersion(browser: string): string {
    const ua = this.userAgent;
    let match;
    
    switch (browser) {
      case 'Chrome':
        match = ua.match(/Chrome\/(\d+\.?\d*\.?\d*\.?\d*)/);
        break;
      case 'Safari':
        match = ua.match(/Version\/(\d+\.?\d*\.?\d*)/);
        break;
      case 'Firefox':
        match = ua.match(/Firefox\/(\d+\.?\d*\.?\d*)/);
        break;
      case 'Edge':
        match = ua.match(/Edg\/(\d+\.?\d*\.?\d*\.?\d*)/);
        break;
    }
    
    return match ? match[1] : 'Unknown';
  }

  private getOrientation(): 'portrait' | 'landscape' {
    if (typeof window === 'undefined') return 'landscape';
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }

  private supportsTouchScreen(): boolean {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  private prefersDarkMode(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private prefersHighContrast(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-contrast: high)').matches;
  }

  // iPhone specific optimizations
  private getIPhoneOptimization(model: string, viewport: any): OptimizationConfig {
    const isSmallPhone = viewport.width <= 375; // iPhone SE, iPhone 12 mini
    const isStandardPhone = viewport.width > 375 && viewport.width <= 390; // iPhone 14, 15
    const isProPhone = viewport.width > 390 && viewport.width <= 430; // iPhone 14 Pro, 15 Pro, 16, 16 Pro
    const isProMax = viewport.width > 430; // iPhone Pro Max models

    // Special handling for iPhone 16 series
    const isiPhone16Series = model.includes('iPhone 16');

    return {
      chatInputHeight: isSmallPhone ? 'h-12' : isiPhone16Series ? 'h-14' : isProMax ? 'h-16' : 'h-14',
      tabHeight: isSmallPhone ? 'h-8' : isiPhone16Series ? 'h-9' : 'h-10',
      fontSize: isSmallPhone ? 'text-sm' : isiPhone16Series ? 'text-sm' : 'text-base',
      spacing: isSmallPhone ? 'p-2' : isiPhone16Series ? 'p-3' : 'p-4',
      borderRadius: 'rounded-2xl',
      maxWidth: 'max-w-full',
      gridCols: isSmallPhone ? 2 : isiPhone16Series ? 2 : 3,
      compactMode: isSmallPhone || isiPhone16Series
    };
  }

  // Samsung specific optimizations
  private getSamsungOptimization(model: string, viewport: any): OptimizationConfig {
    const isLargeScreen = viewport.width >= 412; // Most Samsung flagships
    const isUltraWide = viewport.width >= 428; // Galaxy S Ultra series

    return {
      chatInputHeight: isUltraWide ? 'h-16' : 'h-15',
      tabHeight: 'h-11',
      fontSize: 'text-base',
      spacing: 'p-4',
      borderRadius: 'rounded-2xl',
      maxWidth: 'max-w-full',
      gridCols: isLargeScreen ? 3 : 2,
      compactMode: false
    };
  }

  // Generic mobile optimizations
  private getMobileOptimization(viewport: any): OptimizationConfig {
    const isSmall = viewport.width <= 360;

    return {
      chatInputHeight: isSmall ? 'h-14' : 'h-15',
      tabHeight: isSmall ? 'h-10' : 'h-11',
      fontSize: isSmall ? 'text-sm' : 'text-base',
      spacing: isSmall ? 'p-3' : 'p-4',
      borderRadius: 'rounded-xl',
      maxWidth: 'max-w-full',
      gridCols: isSmall ? 2 : 3,
      compactMode: isSmall
    };
  }

  // Tablet optimizations
  private getTabletOptimization(viewport: any): OptimizationConfig {
    return {
      chatInputHeight: 'h-16',
      tabHeight: 'h-12',
      fontSize: 'text-lg',
      spacing: 'p-5',
      borderRadius: 'rounded-2xl',
      maxWidth: 'max-w-2xl',
      gridCols: 4,
      compactMode: false
    };
  }

  // Desktop optimizations
  private getDesktopOptimization(viewport: any): OptimizationConfig {
    return {
      chatInputHeight: 'h-16',
      tabHeight: 'h-12',
      fontSize: 'text-lg',
      spacing: 'p-6',
      borderRadius: 'rounded-2xl',
      maxWidth: 'max-w-4xl',
      gridCols: 5,
      compactMode: false
    };
  }

  /**
   * Get safe area insets for devices with notches/dynamic islands
   */
  getSafeAreaInsets(): { top: number; bottom: number; left: number; right: number } {
    if (typeof window === 'undefined') {
      return { top: 0, bottom: 0, left: 0, right: 0 };
    }

    const style = getComputedStyle(document.documentElement);
    
    return {
      top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
      bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
      left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
      right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0')
    };
  }

  /**
   * Watch for device orientation changes
   */
  watchOrientation(callback: (orientation: 'portrait' | 'landscape') => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handleOrientationChange = () => {
      callback(this.getOrientation());
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }
}

// Export singleton instance
export const deviceDetection = new DeviceDetectionService();