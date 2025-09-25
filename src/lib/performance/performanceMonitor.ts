/**
 * Performance Monitor for Gawin AI
 * Grade A production monitoring with real-time metrics and optimization
 */

'use client';

export interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  errorRate: number;
  userSatisfactionScore: number;
}

export interface OptimizationSuggestion {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'performance' | 'memory' | 'network' | 'ui' | 'neural';
  description: string;
  estimatedImpact: number; // 1-100
  implementation: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    responseTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0,
    errorRate: 0,
    userSatisfactionScore: 100
  };

  private performanceThresholds = {
    responseTime: 1000, // 1 second max
    memoryUsage: 100 * 1024 * 1024, // 100MB max
    errorRate: 0.1, // 0.1% max
    gradeAResponseTime: 500, // Grade A: sub-500ms
    gradeAMemoryUsage: 50 * 1024 * 1024 // Grade A: under 50MB
  };

  private observerCallbacks: ((metrics: PerformanceMetrics) => void)[] = [];

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring(): void {
    // Skip during SSR
    if (typeof window === 'undefined') return;

    // Monitor response times
    this.setupResponseTimeMonitoring();

    // Monitor memory usage
    this.setupMemoryMonitoring();

    // Monitor network performance
    this.setupNetworkMonitoring();

    // Monitor error rates
    this.setupErrorRateMonitoring();

    console.log('🚀 Grade A Performance Monitor initialized');
  }

  /**
   * Real-time response time monitoring
   */
  private setupResponseTimeMonitoring(): void {
    // Hook into fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        this.updateResponseTime(responseTime);

        // Alert if response time exceeds Grade A standards
        if (responseTime > this.performanceThresholds.gradeAResponseTime) {
          this.logPerformanceAlert('Response time exceeds Grade A standard', {
            responseTime,
            url: typeof args[0] === 'string' ? args[0] : 'unknown',
            threshold: this.performanceThresholds.gradeAResponseTime
          });
        }

        return response;
      } catch (error) {
        const endTime = performance.now();
        this.updateResponseTime(endTime - startTime);
        this.incrementErrorRate();
        throw error;
      }
    };
  }

  /**
   * Memory usage monitoring with leak detection
   */
  private setupMemoryMonitoring(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const memoryUsage = memory.usedJSHeapSize;

        this.updateMemoryUsage(memoryUsage);

        // Grade A memory optimization
        if (memoryUsage > this.performanceThresholds.gradeAMemoryUsage) {
          this.logPerformanceAlert('Memory usage exceeds Grade A standard', {
            memoryUsage: this.formatBytes(memoryUsage),
            threshold: this.formatBytes(this.performanceThresholds.gradeAMemoryUsage),
            suggestions: this.getMemoryOptimizationSuggestions()
          });
        }

        // Detect potential memory leaks
        if (memory.usedJSHeapSize > memory.totalJSHeapSize * 0.9) {
          this.logPerformanceAlert('Potential memory leak detected', {
            usedHeap: this.formatBytes(memory.usedJSHeapSize),
            totalHeap: this.formatBytes(memory.totalJSHeapSize),
            utilization: `${((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100).toFixed(1)}%`
          });
        }
      }, 5000); // Check every 5 seconds
    }
  }

  /**
   * Network performance monitoring
   */
  private setupNetworkMonitoring(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;

      const updateNetworkMetrics = () => {
        this.metrics.networkLatency = connection.rtt || 0;

        // Optimize for different connection types
        if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
          this.suggestLowBandwidthOptimizations();
        }
      };

      connection.addEventListener('change', updateNetworkMetrics);
      updateNetworkMetrics();
    }
  }

  /**
   * Error rate monitoring with categorization
   */
  private setupErrorRateMonitoring(): void {
    // Global error handler
    window.addEventListener('error', (error) => {
      this.incrementErrorRate();
      this.logError('JavaScript Error', error);
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.incrementErrorRate();
      this.logError('Unhandled Promise Rejection', event);
    });
  }

  /**
   * AI Neural Processing Performance Optimization
   */
  startNeuralProcessingMonitor(operationName: string): () => void {
    const startTime = performance.now();
    const startMemory = this.getCurrentMemoryUsage();

    console.log(`🧠 Neural operation started: ${operationName}`);

    return () => {
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      const endMemory = this.getCurrentMemoryUsage();
      const memoryDelta = endMemory - startMemory;

      console.log(`✅ Neural operation completed: ${operationName}`, {
        processingTime: `${processingTime.toFixed(2)}ms`,
        memoryDelta: this.formatBytes(memoryDelta),
        gradeA: processingTime < 200 ? '🏆 Grade A' : '⚠️ Needs Optimization'
      });

      // Log performance for neural optimization
      this.logNeuralPerformance(operationName, processingTime, memoryDelta);

      // Suggest optimizations for slow operations
      if (processingTime > 1000) {
        this.suggestNeuralOptimizations(operationName, processingTime);
      }
    };
  }

  /**
   * Get comprehensive performance report
   */
  getPerformanceReport(): {
    metrics: PerformanceMetrics;
    gradeACompliance: boolean;
    optimizationSuggestions: OptimizationSuggestion[];
    overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  } {
    const gradeACompliance = this.isGradeACompliant();
    const optimizationSuggestions = this.generateOptimizationSuggestions();
    const overallGrade = this.calculateOverallGrade();

    return {
      metrics: { ...this.metrics },
      gradeACompliance,
      optimizationSuggestions,
      overallGrade
    };
  }

  /**
   * Real-time optimization suggestions
   */
  private generateOptimizationSuggestions(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Response time optimization
    if (this.metrics.responseTime > this.performanceThresholds.gradeAResponseTime) {
      suggestions.push({
        priority: 'critical',
        category: 'performance',
        description: 'Response time exceeds Grade A standard (500ms)',
        estimatedImpact: 95,
        implementation: 'Implement request caching, optimize API calls, use service workers'
      });
    }

    // Memory optimization
    if (this.metrics.memoryUsage > this.performanceThresholds.gradeAMemoryUsage) {
      suggestions.push({
        priority: 'high',
        category: 'memory',
        description: 'Memory usage exceeds Grade A standard (50MB)',
        estimatedImpact: 85,
        implementation: 'Implement lazy loading, optimize component unmounting, use memory pools'
      });
    }

    // Neural processing optimization
    suggestions.push({
      priority: 'high',
      category: 'neural',
      description: 'Optimize AI model inference and response generation',
      estimatedImpact: 90,
      implementation: 'Implement model quantization, response streaming, neural caching'
    });

    // UI responsiveness optimization
    suggestions.push({
      priority: 'medium',
      category: 'ui',
      description: 'Enhance UI responsiveness and interaction feedback',
      estimatedImpact: 80,
      implementation: 'Add loading states, skeleton screens, optimistic updates'
    });

    return suggestions.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Grade A compliance checker
   */
  private isGradeACompliant(): boolean {
    return (
      this.metrics.responseTime <= this.performanceThresholds.gradeAResponseTime &&
      this.metrics.memoryUsage <= this.performanceThresholds.gradeAMemoryUsage &&
      this.metrics.errorRate <= 0.001 && // 0.001% error rate for Grade A
      this.metrics.userSatisfactionScore >= 95
    );
  }

  /**
   * Calculate overall system grade
   */
  private calculateOverallGrade(): 'A' | 'B' | 'C' | 'D' | 'F' {
    let score = 100;

    // Deduct points for performance issues
    if (this.metrics.responseTime > 500) score -= 20;
    if (this.metrics.responseTime > 1000) score -= 30;
    if (this.metrics.responseTime > 2000) score -= 50;

    if (this.metrics.memoryUsage > 50 * 1024 * 1024) score -= 15;
    if (this.metrics.memoryUsage > 100 * 1024 * 1024) score -= 30;

    if (this.metrics.errorRate > 0.001) score -= 25;
    if (this.metrics.errorRate > 0.01) score -= 50;

    if (this.metrics.userSatisfactionScore < 95) score -= 10;
    if (this.metrics.userSatisfactionScore < 80) score -= 25;

    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  // Helper methods
  private updateResponseTime(time: number): void {
    this.metrics.responseTime = (this.metrics.responseTime + time) / 2; // Moving average
    this.notifyObservers();
  }

  private updateMemoryUsage(usage: number): void {
    this.metrics.memoryUsage = usage;
    this.notifyObservers();
  }

  private incrementErrorRate(): void {
    this.metrics.errorRate += 0.001; // Increment error rate
    this.metrics.userSatisfactionScore = Math.max(0, this.metrics.userSatisfactionScore - 1);
    this.notifyObservers();
  }

  private getCurrentMemoryUsage(): number {
    return ('memory' in performance) ? (performance as any).memory.usedJSHeapSize : 0;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private logPerformanceAlert(message: string, data: any): void {
    console.warn(`🚨 Performance Alert: ${message}`, data);
  }

  private logError(type: string, error: any): void {
    console.error(`❌ ${type}:`, error);
  }

  private logNeuralPerformance(operation: string, time: number, memory: number): void {
    const performanceData = {
      operation,
      processingTime: `${time.toFixed(2)}ms`,
      memoryUsage: this.formatBytes(memory),
      timestamp: new Date().toISOString()
    };

    // Store for analytics (could be sent to monitoring service)
    localStorage.setItem(
      `gawin_neural_performance_${Date.now()}`,
      JSON.stringify(performanceData)
    );
  }

  private suggestNeuralOptimizations(operation: string, time: number): void {
    console.log(`💡 Neural Optimization Suggestion for ${operation}:`, {
      currentTime: `${time.toFixed(2)}ms`,
      target: '< 200ms for Grade A',
      suggestions: [
        'Implement response streaming',
        'Use neural caching for common queries',
        'Optimize model inference pipeline',
        'Consider model quantization',
        'Implement progressive loading'
      ]
    });
  }

  private getMemoryOptimizationSuggestions(): string[] {
    return [
      'Implement component lazy loading',
      'Optimize large component unmounting',
      'Use React.memo for expensive renders',
      'Implement virtual scrolling for lists',
      'Clean up event listeners and subscriptions'
    ];
  }

  private suggestLowBandwidthOptimizations(): void {
    console.log('📡 Low bandwidth detected - suggesting optimizations:', {
      suggestions: [
        'Enable aggressive caching',
        'Reduce image quality',
        'Defer non-critical resources',
        'Use text-based responses when possible',
        'Enable compression'
      ]
    });
  }

  private notifyObservers(): void {
    this.observerCallbacks.forEach(callback => callback({ ...this.metrics }));
  }

  /**
   * Subscribe to performance updates
   */
  subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.observerCallbacks.push(callback);
    return () => {
      this.observerCallbacks = this.observerCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Force garbage collection (if available)
   */
  forceGarbageCollection(): void {
    if ((window as any).gc) {
      (window as any).gc();
      console.log('🗑️ Forced garbage collection completed');
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;