// Production utilities for error handling and monitoring

export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;

// Global error handler for production
export class ProductionErrorHandler {
  private static instance: ProductionErrorHandler;
  
  static getInstance(): ProductionErrorHandler {
    if (!ProductionErrorHandler.instance) {
      ProductionErrorHandler.instance = new ProductionErrorHandler();
    }
    return ProductionErrorHandler.instance;
  }

  init() {
    if (isProduction) {
      // Capture unhandled errors
      window.addEventListener('error', this.handleError.bind(this));
      window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
      
      console.log('🛡️ Production error handling initialized');
    }
  }

  private handleError(event: ErrorEvent) {
    const error = {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.logError('JavaScript Error', error);
  }

  private handlePromiseRejection(event: PromiseRejectionEvent) {
    const error = {
      reason: event.reason,
      stack: event.reason?.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.logError('Unhandled Promise Rejection', error);
  }

  private logError(type: string, error: any) {
    // Log to console in production (can be replaced with external service)
    console.error(`🚨 ${type}:`, error);
    
    // In a real production app, you would send this to a monitoring service:
    // - Sentry
    // - LogRocket
    // - Datadog
    // - Custom analytics endpoint
    
    if (import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true') {
      // Example: Send to your error reporting service
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ type, error })
      // }).catch(() => {}); // Silently fail if error reporting fails
    }
  }

  // Method to manually report errors
  reportError(error: Error, context?: string) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.logError('Manual Error Report', errorInfo);
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  init() {
    if (isProduction && 'performance' in window) {
      // Monitor page load performance
      window.addEventListener('load', this.measurePageLoad.bind(this));
      
      // Monitor Core Web Vitals if supported
      this.measureWebVitals();
      
      console.log('📊 Performance monitoring initialized');
    }
  }

  private measurePageLoad() {
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const metrics = {
          loadTime: navigation.loadEventEnd - navigation.fetchStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          firstPaint: this.getFirstPaint(),
          timestamp: new Date().toISOString()
        };

        console.log('📊 Page Load Metrics:', metrics);
        
        // Send to analytics if enabled
        if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
          // Example: Send to your analytics service
          // this.sendMetrics('page_load', metrics);
        }
      }
    }, 0);
  }

  private getFirstPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  private measureWebVitals() {
    // Simplified Web Vitals measurement
    // In production, you'd use the 'web-vitals' library
    if ('PerformanceObserver' in window) {
      // Measure Largest Contentful Paint (LCP)
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('📊 LCP:', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }

      // Measure First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            console.log('📊 FID:', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }
    }
  }

  // Method to track custom metrics
  trackMetric(name: string, value: number, tags?: Record<string, string>) {
    const metric = {
      name,
      value,
      tags,
      timestamp: new Date().toISOString()
    };

    console.log('📊 Custom Metric:', metric);
    
    if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      // Send to analytics service
      // this.sendMetrics('custom_metric', metric);
    }
  }
}

// Initialize production utilities
export function initProductionUtils() {
  if (isProduction) {
    ProductionErrorHandler.getInstance().init();
    PerformanceMonitor.getInstance().init();
    
    console.log('🚀 Production utilities initialized');
    console.log(`📦 App Version: ${import.meta.env.VITE_APP_VERSION || 'unknown'}`);
    console.log(`🏗️ Build Time: ${(globalThis as any).__BUILD_TIME__ || 'unknown'}`);
  }
}

// Utility to check if features are enabled
export const features = {
  analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  errorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
  serviceWorker: import.meta.env.VITE_ENABLE_SERVICE_WORKER === 'true',
  compression: import.meta.env.VITE_ENABLE_COMPRESSION === 'true',
  devMode: import.meta.env.VITE_DEV_MODE === 'true'
};

export default {
  ProductionErrorHandler,
  PerformanceMonitor,
  initProductionUtils,
  features,
  isProduction,
  isDevelopment
};