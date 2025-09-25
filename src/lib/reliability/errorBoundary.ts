/**
 * Production-Grade Error Boundary System for Gawin AI
 * Comprehensive error handling, recovery, and user experience protection
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

export interface ErrorDetails {
  error: Error;
  errorInfo: ErrorInfo;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId: string;
  componentStack: string;
  errorBoundary: string;
}

export interface RecoveryAction {
  type: 'retry' | 'refresh' | 'fallback' | 'contact_support';
  label: string;
  action: () => void;
  priority: number;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorDetails: ErrorDetails | null;
  recoveryAttempts: number;
  lastErrorTime: number;
  isRecovering: boolean;
  fallbackActive: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (errorDetails: ErrorDetails) => void;
  maxRetries?: number;
  autoRetryDelay?: number;
  boundaryName: string;
}

/**
 * Production-Grade Error Boundary Component
 */
export class ProductionErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimer: NodeJS.Timeout | null = null;
  private errorReportingService: ErrorReportingService;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorDetails: null,
      recoveryAttempts: 0,
      lastErrorTime: 0,
      isRecovering: false,
      fallbackActive: false
    };

    this.errorReportingService = new ErrorReportingService();
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      lastErrorTime: Date.now()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorDetails: ErrorDetails = {
      error,
      errorInfo,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.generateSessionId(),
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.boundaryName
    };

    this.setState({ errorDetails });

    // Report error to monitoring service
    this.errorReportingService.reportError(errorDetails);

    // Notify parent component
    if (this.props.onError) {
      this.props.onError(errorDetails);
    }

    // Attempt automatic recovery for certain error types
    this.attemptAutomaticRecovery(error);

    console.error(`❌ Error caught by ${this.props.boundaryName}:`, error);
    console.error('Error Info:', errorInfo);
  }

  /**
   * Attempt automatic recovery based on error type
   */
  private attemptAutomaticRecovery(error: Error): void {
    const maxRetries = this.props.maxRetries || 3;
    const autoRetryDelay = this.props.autoRetryDelay || 2000;

    // Don't retry too frequently
    if (Date.now() - this.state.lastErrorTime < 1000) {
      return;
    }

    // Check if we should attempt recovery
    if (this.state.recoveryAttempts < maxRetries && this.shouldAttemptRecovery(error)) {
      this.setState({ isRecovering: true });

      this.retryTimer = setTimeout(() => {
        this.setState(prevState => ({
          hasError: false,
          error: null,
          errorDetails: null,
          recoveryAttempts: prevState.recoveryAttempts + 1,
          isRecovering: false
        }));

        console.log(`🔄 Attempting automatic recovery (attempt ${this.state.recoveryAttempts + 1}/${maxRetries})`);
      }, autoRetryDelay);
    } else {
      // Max retries reached, activate fallback
      this.setState({ fallbackActive: true });
      console.log('🛡️ Activating fallback mode after failed recovery attempts');
    }
  }

  /**
   * Determine if automatic recovery should be attempted
   */
  private shouldAttemptRecovery(error: Error): boolean {
    const recoverableErrors = [
      'ChunkLoadError',
      'Loading chunk',
      'Network request failed',
      'Failed to fetch'
    ];

    return recoverableErrors.some(pattern =>
      error.message.includes(pattern) || error.name.includes(pattern)
    );
  }

  /**
   * Manual retry action
   */
  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorDetails: null,
      isRecovering: true,
      fallbackActive: false
    });

    // Clear recovery state after a brief moment
    setTimeout(() => {
      this.setState({ isRecovering: false });
    }, 500);

    console.log('🔄 Manual retry initiated');
  };

  /**
   * Refresh page action
   */
  private handleRefresh = (): void => {
    window.location.reload();
  };

  /**
   * Contact support action
   */
  private handleContactSupport = (): void => {
    const errorReport = this.generateErrorReport();
    const supportEmail = 'support@gawin-ai.com';
    const subject = encodeURIComponent('Gawin AI Error Report');
    const body = encodeURIComponent(errorReport);

    window.open(`mailto:${supportEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  /**
   * Generate comprehensive error report
   */
  private generateErrorReport(): string {
    const details = this.state.errorDetails;
    if (!details) return 'No error details available';

    return `
Gawin AI Error Report
====================

Timestamp: ${new Date(details.timestamp).toISOString()}
Error Boundary: ${details.errorBoundary}
Recovery Attempts: ${this.state.recoveryAttempts}

Error Details:
${details.error.name}: ${details.error.message}

Stack Trace:
${details.error.stack}

Component Stack:
${details.componentStack}

Environment:
User Agent: ${details.userAgent}
URL: ${details.url}
Session ID: ${details.sessionId}
`;
  }

  /**
   * Get available recovery actions
   */
  private getRecoveryActions(): RecoveryAction[] {
    const actions: RecoveryAction[] = [
      {
        type: 'retry',
        label: 'Try Again',
        action: this.handleRetry,
        priority: 1
      }
    ];

    // Add refresh option for persistent errors
    if (this.state.recoveryAttempts > 1) {
      actions.push({
        type: 'refresh',
        label: 'Refresh Page',
        action: this.handleRefresh,
        priority: 2
      });
    }

    // Always provide support contact
    actions.push({
      type: 'contact_support',
      label: 'Contact Support',
      action: this.handleContactSupport,
      priority: 3
    });

    return actions.sort((a, b) => a.priority - b.priority);
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  componentWillUnmount() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  render() {
    if (this.state.hasError) {
      // Show recovery UI
      return React.createElement(ErrorRecoveryUI, {
        error: this.state.error,
        errorDetails: this.state.errorDetails,
        isRecovering: this.state.isRecovering,
        recoveryActions: this.getRecoveryActions(),
        recoveryAttempts: this.state.recoveryAttempts,
        maxRetries: this.props.maxRetries || 3,
        fallback: this.props.fallback,
        fallbackActive: this.state.fallbackActive
      });
    }

    return this.props.children;
  }
}

/**
 * Error Recovery UI Component
 */
interface ErrorRecoveryUIProps {
  error: Error | null;
  errorDetails: ErrorDetails | null;
  isRecovering: boolean;
  recoveryActions: RecoveryAction[];
  recoveryAttempts: number;
  maxRetries: number;
  fallback?: ReactNode;
  fallbackActive: boolean;
}

const ErrorRecoveryUI: React.FC<ErrorRecoveryUIProps> = ({
  error,
  errorDetails,
  isRecovering,
  recoveryActions,
  recoveryAttempts,
  maxRetries,
  fallback,
  fallbackActive
}) => {
  if (fallbackActive && fallback) {
    return React.createElement(React.Fragment, null, fallback);
  }

  return React.createElement('div', {
    className: 'min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4',
    children: React.createElement('div', {
      className: 'bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center',
      children: [
        // Error Icon
        React.createElement('div', {
          className: 'w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4',
          children: React.createElement('svg', {
            className: 'w-8 h-8 text-red-600',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            children: React.createElement('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 2,
              d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.27 16.5c-.77.833.192 2.5 1.732 2.5z'
            })
          })
        }),

        // Title
        React.createElement('h1', {
          className: 'text-2xl font-bold text-gray-900 mb-2'
        }, 'Oops! Something went wrong'),

        // Description
        React.createElement('p', {
          className: 'text-gray-600 mb-6'
        }, isRecovering
          ? 'Attempting to recover...'
          : `Don't worry, we're working to fix this. You can try again or contact our support team.`
        ),

        // Recovery Attempts Info
        recoveryAttempts > 0 && React.createElement('div', {
          className: 'bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4',
          children: React.createElement('p', {
            className: 'text-sm text-yellow-800'
          }, `Recovery attempts: ${recoveryAttempts}/${maxRetries}`)
        }),

        // Recovery Actions
        React.createElement('div', {
          className: 'space-y-3',
          children: recoveryActions.map((action, index) =>
            React.createElement('button', {
              key: action.type,
              onClick: action.action,
              disabled: isRecovering,
              className: `w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                index === 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`
            }, isRecovering && index === 0 ? 'Recovering...' : action.label)
          )
        }),

        // Error Details (collapsible)
        error && React.createElement('details', {
          className: 'mt-6 text-left',
          children: [
            React.createElement('summary', {
              className: 'cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2'
            }, 'Show technical details'),
            React.createElement('pre', {
              className: 'bg-gray-100 p-3 rounded text-xs text-gray-800 overflow-auto max-h-32'
            }, `${error.name}: ${error.message}`)
          ]
        })
      ]
    })
  });
};

/**
 * Error Reporting Service
 */
class ErrorReportingService {
  private reportQueue: ErrorDetails[] = [];
  private isOnline = navigator.onLine;

  constructor() {
    // Monitor online status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushReportQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Report error to monitoring service
   */
  async reportError(errorDetails: ErrorDetails): Promise<void> {
    // Store locally first
    this.storeErrorLocally(errorDetails);

    if (this.isOnline) {
      try {
        await this.sendErrorReport(errorDetails);
        console.log('📊 Error reported to monitoring service');
      } catch (reportingError) {
        console.warn('Failed to report error to monitoring service:', reportingError);
        this.reportQueue.push(errorDetails);
      }
    } else {
      this.reportQueue.push(errorDetails);
    }
  }

  /**
   * Send error report to monitoring service
   */
  private async sendErrorReport(errorDetails: ErrorDetails): Promise<void> {
    // In production, this would send to your monitoring service
    // For now, we'll use a mock implementation

    const reportData = {
      timestamp: errorDetails.timestamp,
      error: {
        name: errorDetails.error.name,
        message: errorDetails.error.message,
        stack: errorDetails.error.stack
      },
      context: {
        url: errorDetails.url,
        userAgent: errorDetails.userAgent,
        sessionId: errorDetails.sessionId,
        componentStack: errorDetails.componentStack,
        errorBoundary: errorDetails.errorBoundary
      }
    };

    // Mock API call - replace with actual monitoring service
    await fetch('/api/error-reporting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reportData)
    }).catch(() => {
      // Silently handle reporting failures
    });
  }

  /**
   * Store error locally for offline reporting
   */
  private storeErrorLocally(errorDetails: ErrorDetails): void {
    try {
      const storedErrors = JSON.parse(localStorage.getItem('gawin_errors') || '[]');
      storedErrors.push({
        ...errorDetails,
        error: {
          name: errorDetails.error.name,
          message: errorDetails.error.message,
          stack: errorDetails.error.stack
        }
      });

      // Keep only the last 10 errors
      if (storedErrors.length > 10) {
        storedErrors.splice(0, storedErrors.length - 10);
      }

      localStorage.setItem('gawin_errors', JSON.stringify(storedErrors));
    } catch (storageError) {
      console.warn('Failed to store error locally:', storageError);
    }
  }

  /**
   * Flush queued error reports when online
   */
  private async flushReportQueue(): Promise<void> {
    while (this.reportQueue.length > 0 && this.isOnline) {
      const errorDetails = this.reportQueue.shift();
      if (errorDetails) {
        try {
          await this.sendErrorReport(errorDetails);
        } catch (error) {
          // Put it back in queue if failed
          this.reportQueue.unshift(errorDetails);
          break;
        }
      }
    }
  }
}

/**
 * Global Error Handler Setup
 */
export const setupGlobalErrorHandling = (): void => {
  const errorReportingService = new ErrorReportingService();

  // Catch all unhandled errors
  window.addEventListener('error', (event) => {
    const errorDetails: ErrorDetails = {
      error: event.error || new Error(event.message),
      errorInfo: { componentStack: 'Global Error Handler' } as ErrorInfo,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: Math.random().toString(36).substring(2),
      componentStack: 'Global Error Handler',
      errorBoundary: 'Global'
    };

    errorReportingService.reportError(errorDetails);
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));

    const errorDetails: ErrorDetails = {
      error,
      errorInfo: { componentStack: 'Unhandled Promise Rejection' } as ErrorInfo,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: Math.random().toString(36).substring(2),
      componentStack: 'Unhandled Promise Rejection',
      errorBoundary: 'Global'
    };

    errorReportingService.reportError(errorDetails);
  });

  console.log('🛡️ Global error handling initialized');
};

export default ProductionErrorBoundary;