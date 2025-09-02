/**
 * AI System Guardian Service
 * Intelligent system maintenance, security monitoring, and self-healing capabilities
 */
export class SystemGuardianService {
  private static instance: SystemGuardianService;
  private monitoringEnabled = true;
  private errorReports: Array<{
    timestamp: Date;
    error: string;
    context: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    resolved: boolean;
  }> = [];
  
  private performanceMetrics: Array<{
    timestamp: Date;
    operation: string;
    duration: number;
    success: boolean;
  }> = [];

  private securityAlerts: Array<{
    timestamp: Date;
    alert: string;
    source: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    mitigated: boolean;
  }> = [];

  private constructor() {
    this.initializeGuardian();
  }

  public static getInstance(): SystemGuardianService {
    if (!SystemGuardianService.instance) {
      SystemGuardianService.instance = new SystemGuardianService();
    }
    return SystemGuardianService.instance;
  }

  private initializeGuardian(): void {
    // Only initialize in browser environment
    if (typeof window === 'undefined') {
      console.log('🛡️ System Guardian - Server environment detected, monitoring disabled');
      this.monitoringEnabled = false;
      return;
    }
    
    // Start monitoring systems
    this.startPerformanceMonitoring();
    this.startSecurityMonitoring();
    this.startErrorMonitoring();
    
    console.log('🛡️ System Guardian initialized - Monitoring active');
  }

  /**
   * Performance Monitoring
   */
  private startPerformanceMonitoring(): void {
    // Monitor API response times
    setInterval(() => {
      this.checkSystemHealth();
    }, 30000); // Every 30 seconds
  }

  /**
   * Security Monitoring
   */
  private startSecurityMonitoring(): void {
    // Monitor for potential security threats
    setInterval(() => {
      this.scanForSecurityThreats();
    }, 60000); // Every minute
  }

  /**
   * Error Monitoring and Auto-Recovery
   */
  private startErrorMonitoring(): void {
    // Override console.error to capture errors
    const originalError = console.error;
    console.error = (...args) => {
      this.reportError(args.join(' '), 'console', 'medium');
      originalError.apply(console, args);
    };

    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError(
        `Unhandled Promise Rejection: ${event.reason}`,
        'promise',
        'high'
      );
    });

    // Listen for JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportError(
        `JavaScript Error: ${event.message} at ${event.filename}:${event.lineno}`,
        'javascript',
        'high'
      );
    });
  }

  /**
   * Report and handle errors with auto-recovery attempts
   */
  public reportError(
    error: string, 
    context: string, 
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): void {
    if (!this.monitoringEnabled) return;

    const errorReport = {
      timestamp: new Date(),
      error,
      context,
      severity,
      resolved: false
    };

    this.errorReports.push(errorReport);

    // Attempt auto-recovery for known issues
    this.attemptAutoRecovery(errorReport);

    // Alert if critical
    if (severity === 'critical') {
      this.triggerCriticalAlert(error);
    }

    // Keep only last 100 error reports
    if (this.errorReports.length > 100) {
      this.errorReports = this.errorReports.slice(-100);
    }
  }

  /**
   * Attempt automatic recovery from known issues
   */
  private attemptAutoRecovery(errorReport: any): void {
    const { error, context } = errorReport;

    // API connection issues
    if (error.includes('Failed to fetch') || error.includes('Network error')) {
      console.log('🔧 Attempting to recover from network issue...');
      this.recoverFromNetworkIssue();
      errorReport.resolved = true;
    }

    // Memory issues
    if (error.includes('out of memory') || error.includes('heap')) {
      console.log('🔧 Attempting to recover from memory issue...');
      this.recoverFromMemoryIssue();
      errorReport.resolved = true;
    }

    // State corruption
    if (error.includes('state') || error.includes('undefined')) {
      console.log('🔧 Attempting to recover from state issue...');
      this.recoverFromStateIssue();
      errorReport.resolved = true;
    }
  }

  /**
   * Recovery strategies
   */
  private recoverFromNetworkIssue(): void {
    if (typeof window === 'undefined') return;
    
    // Clear any cached failed requests
    localStorage.removeItem('failed_requests');
    
    // Reset retry counters
    sessionStorage.setItem('network_recovery_attempt', Date.now().toString());
  }

  private recoverFromMemoryIssue(): void {
    // Clear unnecessary data from memory
    this.clearOldPerformanceMetrics();
    this.clearOldErrorReports();
    
    // Trigger garbage collection if available
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
    }
  }

  private recoverFromStateIssue(): void {
    if (typeof window === 'undefined') return;
    
    // Reset corrupted state
    try {
      const currentState = localStorage.getItem('app_state');
      if (currentState) {
        const backup = `state_backup_${Date.now()}`;
        localStorage.setItem(backup, currentState);
        localStorage.removeItem('app_state');
        console.log('🔧 State backed up and reset');
      }
    } catch (error) {
      console.warn('Could not recover state:', error);
    }
  }

  /**
   * System Health Monitoring
   */
  private checkSystemHealth(): void {
    const health = {
      timestamp: new Date(),
      memoryUsage: this.getMemoryUsage(),
      errorRate: this.calculateErrorRate(),
      performanceScore: this.calculatePerformanceScore(),
      securityStatus: this.getSecurityStatus()
    };

    // Alert if health is poor
    if (health.performanceScore < 0.7) {
      this.reportError(
        `Poor system performance detected: ${health.performanceScore}`,
        'health_check',
        'medium'
      );
    }

    if (health.errorRate > 0.1) {
      this.reportError(
        `High error rate detected: ${health.errorRate}`,
        'health_check',
        'high'
      );
    }
  }

  /**
   * Security Threat Scanning
   */
  private scanForSecurityThreats(): void {
    if (typeof window === 'undefined') return;
    
    // Check for XSS attempts in localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value && this.detectXSSAttempt(value)) {
            this.reportSecurityAlert(
              `Potential XSS in localStorage key: ${key}`,
              'localStorage',
              'high'
            );
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.warn('Could not scan localStorage:', error);
    }

    // Check for suspicious URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    for (const [key, value] of urlParams) {
      if (this.detectXSSAttempt(value)) {
        this.reportSecurityAlert(
          `Potential XSS in URL parameter: ${key}`,
          'url_params',
          'high'
        );
      }
    }
  }

  /**
   * Detect XSS attempts
   */
  private detectXSSAttempt(content: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /eval\s*\(/gi,
      /document\.cookie/gi
    ];

    return xssPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Report security alerts
   */
  private reportSecurityAlert(
    alert: string,
    source: string,
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
  ): void {
    const securityAlert = {
      timestamp: new Date(),
      alert,
      source,
      riskLevel,
      mitigated: false
    };

    this.securityAlerts.push(securityAlert);

    // Auto-mitigation for high-risk alerts
    if (riskLevel === 'high' || riskLevel === 'critical') {
      this.mitigateSecurityThreat(securityAlert);
    }

    console.warn(`🚨 Security Alert [${riskLevel.toUpperCase()}]: ${alert}`);

    // Keep only last 50 security alerts
    if (this.securityAlerts.length > 50) {
      this.securityAlerts = this.securityAlerts.slice(-50);
    }
  }

  /**
   * Mitigate security threats
   */
  private mitigateSecurityThreat(alert: any): void {
    if (typeof window === 'undefined') return;
    
    // Block suspicious content
    if (alert.source === 'localStorage') {
      // Already handled in scanning
      alert.mitigated = true;
    }

    // Clear potentially compromised data
    if (alert.riskLevel === 'critical') {
      sessionStorage.clear();
      console.log('🛡️ Session storage cleared due to critical security threat');
      alert.mitigated = true;
    }
  }

  /**
   * Utility methods for health calculation
   */
  private getMemoryUsage(): number {
    if (typeof window === 'undefined') return 0;
    
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / memory.totalJSHeapSize;
    }
    return 0;
  }

  private calculateErrorRate(): number {
    const recentErrors = this.errorReports.filter(
      error => Date.now() - error.timestamp.getTime() < 300000 // Last 5 minutes
    );
    return recentErrors.length / 100; // Normalize to 0-1 scale
  }

  private calculatePerformanceScore(): number {
    const recentMetrics = this.performanceMetrics.filter(
      metric => Date.now() - metric.timestamp.getTime() < 300000
    );

    if (recentMetrics.length === 0) return 1.0;

    const avgDuration = recentMetrics.reduce((sum, metric) => sum + metric.duration, 0) / recentMetrics.length;
    const successRate = recentMetrics.filter(metric => metric.success).length / recentMetrics.length;

    // Score based on response time and success rate
    const timeScore = Math.max(0, 1 - (avgDuration / 5000)); // 5 seconds as baseline
    return (timeScore + successRate) / 2;
  }

  private getSecurityStatus(): 'secure' | 'warning' | 'alert' {
    const recentAlerts = this.securityAlerts.filter(
      alert => Date.now() - alert.timestamp.getTime() < 3600000 // Last hour
    );

    const criticalAlerts = recentAlerts.filter(alert => alert.riskLevel === 'critical');
    const highAlerts = recentAlerts.filter(alert => alert.riskLevel === 'high');

    if (criticalAlerts.length > 0) return 'alert';
    if (highAlerts.length > 2) return 'warning';
    return 'secure';
  }

  /**
   * Cleanup methods
   */
  private clearOldPerformanceMetrics(): void {
    const cutoff = Date.now() - 3600000; // 1 hour ago
    this.performanceMetrics = this.performanceMetrics.filter(
      metric => metric.timestamp.getTime() > cutoff
    );
  }

  private clearOldErrorReports(): void {
    const cutoff = Date.now() - 3600000; // 1 hour ago
    this.errorReports = this.errorReports.filter(
      error => error.timestamp.getTime() > cutoff
    );
  }

  /**
   * Critical alert handler
   */
  private triggerCriticalAlert(error: string): void {
    console.error(`🚨 CRITICAL SYSTEM ERROR: ${error}`);
    
    // Could integrate with external monitoring services here
    // For now, just ensure the error is logged and tracked
  }

  /**
   * Public API for performance tracking
   */
  public trackOperation(operation: string, duration: number, success: boolean): void {
    this.performanceMetrics.push({
      timestamp: new Date(),
      operation,
      duration,
      success
    });

    // Keep only last 200 metrics
    if (this.performanceMetrics.length > 200) {
      this.performanceMetrics = this.performanceMetrics.slice(-200);
    }
  }

  /**
   * Get system status summary
   */
  public getSystemStatus(): {
    health: 'excellent' | 'good' | 'fair' | 'poor';
    security: 'secure' | 'warning' | 'alert';
    errors: number;
    uptime: number;
  } {
    const performanceScore = this.calculatePerformanceScore();
    const errorRate = this.calculateErrorRate();
    
    let health: 'excellent' | 'good' | 'fair' | 'poor';
    if (performanceScore > 0.9 && errorRate < 0.02) health = 'excellent';
    else if (performanceScore > 0.7 && errorRate < 0.05) health = 'good';
    else if (performanceScore > 0.5 && errorRate < 0.1) health = 'fair';
    else health = 'poor';

    return {
      health,
      security: this.getSecurityStatus(),
      errors: this.errorReports.filter(e => !e.resolved).length,
      uptime: typeof window !== 'undefined' ? Date.now() - (window as any).appStartTime || 0 : 0
    };
  }

  /**
   * Enable/disable monitoring
   */
  public setMonitoring(enabled: boolean): void {
    this.monitoringEnabled = enabled;
    console.log(`🛡️ System Guardian monitoring ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Initialize app start time (browser only)
if (typeof window !== 'undefined') {
  (window as any).appStartTime = Date.now();
}

// Export singleton instance
export const systemGuardianService = SystemGuardianService.getInstance();