'use client';

/**
 * Production-Grade API Gateway Service
 * Handles authentication, rate limiting, request validation, and routing
 * Integrates with the AI Orchestrator architecture
 */

interface RequestHeaders {
  'Content-Type': string;
  'Authorization'?: string;
  'X-User-ID'?: string;
  'X-Session-ID'?: string;
  'X-Request-ID'?: string;
  'X-Client-Version'?: string;
  'X-Canary-Route'?: string;
  [key: string]: string | undefined;
}

interface ApiGatewayConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  rateLimitWindow: number;
  rateLimitMax: number;
  enableCanary: boolean;
  enableShadowTesting: boolean;
}

interface AuthContext {
  userId: string;
  sessionId: string;
  permissions: string[];
  consentFlags: {
    dataCollection: boolean;
    modelTraining: boolean;
    analytics: boolean;
    mentalHealthFeatures: boolean;
  };
  riskLevel: 'low' | 'medium' | 'high';
}

interface RateLimitState {
  requests: number;
  windowStart: number;
  blocked: boolean;
  resetTime: number;
}

interface ApiRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Partial<RequestHeaders>;
  timeout?: number;
  retries?: number;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    requestId: string;
    timestamp: number;
    latency: number;
    model?: string;
    version?: string;
    cached?: boolean;
  };
}

class ApiGatewayService {
  private static instance: ApiGatewayService;
  private config: ApiGatewayConfig;
  private rateLimitState: Map<string, RateLimitState>;
  private authContext: AuthContext | null = null;
  private requestQueue: Map<string, Promise<any>>;

  constructor() {
    this.config = {
      baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || (
        process.env.NODE_ENV === 'production' 
          ? '/api' // Use relative path in production through nginx
          : 'http://localhost:3001/api' // Direct to orchestrator in development
      ),
      timeout: 30000,
      retries: 3,
      rateLimitWindow: 60000, // 1 minute
      rateLimitMax: 100, // 100 requests per minute
      enableCanary: process.env.NEXT_PUBLIC_ENABLE_CANARY === 'true',
      enableShadowTesting: process.env.NEXT_PUBLIC_ENABLE_SHADOW === 'true'
    };

    this.rateLimitState = new Map();
    this.requestQueue = new Map();
    
    if (typeof window !== 'undefined') {
      this.initializeAuth();
    }
  }

  static getInstance(): ApiGatewayService {
    if (!ApiGatewayService.instance) {
      ApiGatewayService.instance = new ApiGatewayService();
    }
    return ApiGatewayService.instance;
  }

  private async initializeAuth() {
    try {
      // Load auth context from storage or refresh token
      const savedAuth = localStorage.getItem('auth_context');
      if (savedAuth) {
        this.authContext = JSON.parse(savedAuth);
      }
    } catch (error) {
      console.warn('Failed to initialize auth context:', error);
    }
  }

  /**
   * Set authentication context
   */
  setAuthContext(context: AuthContext) {
    this.authContext = context;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_context', JSON.stringify(context));
    }
  }

  /**
   * Get current authentication context
   */
  getAuthContext(): AuthContext | null {
    return this.authContext;
  }

  /**
   * Check rate limiting for user
   */
  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const state = this.rateLimitState.get(userId);

    if (!state) {
      this.rateLimitState.set(userId, {
        requests: 1,
        windowStart: now,
        blocked: false,
        resetTime: now + this.config.rateLimitWindow
      });
      return true;
    }

    // Reset window if expired
    if (now >= state.resetTime) {
      state.requests = 1;
      state.windowStart = now;
      state.blocked = false;
      state.resetTime = now + this.config.rateLimitWindow;
      return true;
    }

    // Check if within limits
    if (state.requests >= this.config.rateLimitMax) {
      state.blocked = true;
      return false;
    }

    state.requests++;
    return true;
  }

  /**
   * Generate request headers with auth and tracing
   */
  private generateHeaders(customHeaders?: Partial<RequestHeaders>): RequestHeaders {
    const requestId = this.generateRequestId();
    const sessionId = this.authContext?.sessionId || 'anonymous';

    const headers: RequestHeaders = {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      'X-Session-ID': sessionId,
      'X-Client-Version': process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      ...customHeaders
    };

    if (this.authContext) {
      headers['X-User-ID'] = this.authContext.userId;
      
      // Add canary routing if enabled
      if (this.config.enableCanary && this.shouldUseCanary()) {
        headers['X-Canary-Route'] = 'true';
      }
    }

    return headers;
  }

  /**
   * Determine if request should use canary routing
   */
  private shouldUseCanary(): boolean {
    if (!this.authContext) return false;
    
    // Route 5% of requests to canary for low-risk users
    // Route 0% for high-risk users (mental health)
    if (this.authContext.riskLevel === 'high') return false;
    
    return Math.random() < 0.05;
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate request before sending
   */
  private validateRequest(request: ApiRequest): { valid: boolean; error?: string } {
    // Check authentication for protected endpoints
    const protectedEndpoints = ['/ai/query', '/user/profile', '/mental-health'];
    const isProtected = protectedEndpoints.some(endpoint => 
      request.endpoint.startsWith(endpoint)
    );

    if (isProtected && !this.authContext) {
      return { valid: false, error: 'Authentication required' };
    }

    // Check rate limiting
    if (this.authContext && !this.checkRateLimit(this.authContext.userId)) {
      return { valid: false, error: 'Rate limit exceeded' };
    }

    // Validate request size
    if (request.body && JSON.stringify(request.body).length > 100 * 1024) {
      return { valid: false, error: 'Request payload too large' };
    }

    return { valid: true };
  }

  /**
   * Execute API request with full gateway features
   */
  async request<T = any>(request: ApiRequest): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      // Validate request
      const validation = this.validateRequest(request);
      if (!validation.valid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error!
          },
          metadata: {
            requestId,
            timestamp: Date.now(),
            latency: Date.now() - startTime
          }
        };
      }

      // Check for duplicate requests
      const requestKey = `${request.endpoint}_${JSON.stringify(request.body)}`;
      if (this.requestQueue.has(requestKey)) {
        const existingRequest = await this.requestQueue.get(requestKey);
        return existingRequest;
      }

      // Create request promise
      const requestPromise = this.executeRequest<T>(request, requestId, startTime);
      this.requestQueue.set(requestKey, requestPromise);

      const result = await requestPromise;

      // Clean up queue
      this.requestQueue.delete(requestKey);

      return result;

    } catch (error) {
      console.error('API Gateway error:', error);
      return {
        success: false,
        error: {
          code: 'GATEWAY_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        metadata: {
          requestId,
          timestamp: Date.now(),
          latency: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Execute the actual HTTP request
   */
  private async executeRequest<T>(
    request: ApiRequest, 
    requestId: string, 
    startTime: number
  ): Promise<ApiResponse<T>> {
    const headers = this.generateHeaders(request.headers);
    const url = `${this.config.baseUrl}${request.endpoint}`;
    
    const fetchOptions: RequestInit = {
      method: request.method,
      headers: headers as HeadersInit,
      signal: AbortSignal.timeout(request.timeout || this.config.timeout)
    };

    if (request.body) {
      fetchOptions.body = JSON.stringify(request.body);
    }

    let lastError: Error | null = null;
    const maxRetries = request.retries ?? this.config.retries;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, fetchOptions);
        const responseData = await response.json();

        const apiResponse: ApiResponse<T> = {
          success: response.ok,
          data: response.ok ? responseData : undefined,
          error: response.ok ? undefined : {
            code: responseData.code || 'HTTP_ERROR',
            message: responseData.message || response.statusText,
            details: responseData.details
          },
          metadata: {
            requestId,
            timestamp: Date.now(),
            latency: Date.now() - startTime,
            model: response.headers.get('X-Model-Used') || undefined,
            version: response.headers.get('X-Model-Version') || undefined,
            cached: response.headers.get('X-Cache-Hit') === 'true'
          }
        };

        // Log request for analytics
        this.logRequest(request, apiResponse);

        return apiResponse;

      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on authentication or validation errors
        if (error instanceof Error && 
            (error.name === 'AbortError' || 
             error.message.includes('Authentication') ||
             error.message.includes('Validation'))) {
          break;
        }

        // Exponential backoff for retries
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Log request for analytics and monitoring
   */
  private logRequest(request: ApiRequest, response: ApiResponse) {
    if (typeof window === 'undefined') return;

    try {
      const logEntry = {
        timestamp: Date.now(),
        endpoint: request.endpoint,
        method: request.method,
        userId: this.authContext?.userId,
        sessionId: this.authContext?.sessionId,
        requestId: response.metadata.requestId,
        success: response.success,
        latency: response.metadata.latency,
        error: response.error?.code,
        model: response.metadata.model,
        cached: response.metadata.cached
      };

      // Store in local analytics buffer
      const logs = JSON.parse(localStorage.getItem('api_logs') || '[]');
      logs.push(logEntry);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('api_logs', JSON.stringify(logs));

    } catch (error) {
      console.warn('Failed to log request:', error);
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.request({
        endpoint: '/health',
        method: 'GET',
        timeout: 5000,
        retries: 1
      });
      
      return response.success;
    } catch {
      return false;
    }
  }

  /**
   * Get API analytics
   */
  getAnalytics() {
    if (typeof window === 'undefined') return null;

    try {
      const logs = JSON.parse(localStorage.getItem('api_logs') || '[]');
      const lastHour = Date.now() - 60 * 60 * 1000;
      const recentLogs = logs.filter((log: any) => log.timestamp > lastHour);

      return {
        totalRequests: recentLogs.length,
        successRate: recentLogs.length > 0 
          ? recentLogs.filter((log: any) => log.success).length / recentLogs.length 
          : 0,
        averageLatency: recentLogs.length > 0
          ? recentLogs.reduce((sum: number, log: any) => sum + log.latency, 0) / recentLogs.length
          : 0,
        errorCodes: recentLogs
          .filter((log: any) => !log.success)
          .reduce((acc: any, log: any) => {
            acc[log.error] = (acc[log.error] || 0) + 1;
            return acc;
          }, {}),
        cacheHitRate: recentLogs.length > 0
          ? recentLogs.filter((log: any) => log.cached).length / recentLogs.length
          : 0
      };
    } catch {
      return null;
    }
  }

  /**
   * Clear analytics data
   */
  clearAnalytics() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('api_logs');
    }
  }
}

export const apiGateway = ApiGatewayService.getInstance();
export type { AuthContext, ApiRequest, ApiResponse, ApiGatewayConfig };