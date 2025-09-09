'use client';

/**
 * AI Orchestrator Service
 * Integrates frontend with the production AI orchestrator backend
 * Handles intelligent query routing, safety checks, and model selection
 */

import { apiGateway } from './apiGateway';

interface QueryRequest {
  text: string;
  context?: Record<string, any>;
  model_preference?: string;
  temperature?: number;
  max_tokens?: number;
  consent_to_train?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  session_metadata?: {
    deviceType?: 'mobile' | 'desktop' | 'tablet';
    subject?: string;
    isHomework?: boolean;
    emotionalState?: 'positive' | 'neutral' | 'negative';
  };
}

interface OrchestratorResponse {
  response: string;
  model: string;
  version: string;
  confidence: number;
  reasoning: string[];
  metadata: {
    requestId: string;
    processingTime: number;
    tokensUsed: number;
    cached: boolean;
    pipelineSteps: string[];
    safetyChecks: string[];
    costTier: string;
  };
}

interface UserProfile {
  userId: string;
  riskLevel: 'low' | 'medium' | 'high';
  learningLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredSubjects: string[];
  consentFlags: {
    dataCollection: boolean;
    modelTraining: boolean;
    analytics: boolean;
    mentalHealthFeatures: boolean;
  };
  preferences: {
    responseStyle: 'concise' | 'detailed' | 'interactive';
    language: string;
    timezone: string;
  };
}

interface SafetyResponse {
  safe: boolean;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resources?: {
    helplines: Array<{
      name: string;
      phone: string;
      url: string;
      country: string;
    }>;
    emergencyAction?: string;
  };
}

interface AnalyticsData {
  totalQueries: number;
  successRate: number;
  averageLatency: number;
  preferredModels: Array<{
    model: string;
    usage: number;
    satisfaction: number;
  }>;
  topicBreakdown: Record<string, number>;
  safetyIncidents: number;
}

class OrchestratorService {
  private sessionId: string;
  private initialized: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  private async initialize() {
    if (this.initialized) return;

    // Initialize session with backend
    try {
      await apiGateway.request({
        endpoint: '/v1/session/start',
        method: 'POST',
        body: {
          sessionId: this.sessionId,
          clientInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            deviceType: this.detectDeviceType()
          }
        }
      });

      this.initialized = true;
    } catch (error) {
      console.warn('Failed to initialize orchestrator session:', error);
      // Continue without session tracking
    }
  }

  /**
   * Send a query to the AI orchestrator for intelligent processing
   */
  async query(request: QueryRequest): Promise<OrchestratorResponse> {
    await this.initialize();

    // Add session metadata
    const enhancedRequest = {
      ...request,
      sessionId: this.sessionId,
      clientTimestamp: new Date().toISOString(),
      context: {
        ...request.context,
        sessionInfo: {
          deviceType: this.detectDeviceType(),
          platform: navigator.platform,
          language: navigator.language,
          ...request.session_metadata
        }
      }
    };

    const response = await apiGateway.request<OrchestratorResponse>({
      endpoint: '/v1/query',
      method: 'POST',
      body: enhancedRequest,
      timeout: request.priority === 'critical' ? 60000 : 30000 // Longer timeout for critical queries
    });

    if (!response.success) {
      // Check if this is a safety-related response
      if (response.error?.code === 'SAFETY_VIOLATION' || 
          response.error?.code === 'CRISIS_DETECTED') {
        throw new SafetyError(
          response.error.message,
          response.error.details?.severity || 'medium',
          response.error.details?.resources
        );
      }
      
      throw new Error(response.error?.message || 'Query processing failed');
    }

    // Log successful interaction for analytics
    this.logInteraction(request, response.data!);

    return response.data!;
  }

  /**
   * Get or update user profile
   */
  async getUserProfile(): Promise<UserProfile | null> {
    const response = await apiGateway.request<UserProfile>({
      endpoint: '/v1/user/profile',
      method: 'GET'
    });

    return response.success ? response.data! : null;
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<boolean> {
    const response = await apiGateway.request({
      endpoint: '/v1/user/profile',
      method: 'PUT',
      body: updates
    });

    return response.success;
  }

  /**
   * Submit feedback for a response
   */
  async submitFeedback(data: {
    requestId: string;
    rating: number; // 1-5 scale
    feedback?: string;
    categories?: string[]; // helpful, accurate, safe, etc.
  }): Promise<boolean> {
    const response = await apiGateway.request({
      endpoint: '/v1/feedback',
      method: 'POST',
      body: {
        ...data,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString()
      }
    });

    return response.success;
  }

  /**
   * Get user's query analytics and insights
   */
  async getAnalytics(timeframe: '24h' | '7d' | '30d' = '7d'): Promise<AnalyticsData | null> {
    const response = await apiGateway.request<AnalyticsData>({
      endpoint: `/v1/analytics?timeframe=${timeframe}`,
      method: 'GET'
    });

    return response.success ? response.data! : null;
  }

  /**
   * Mental health specific assessment and support
   */
  async getMentalHealthAssessment(query: string): Promise<SafetyResponse> {
    const response = await apiGateway.request<SafetyResponse>({
      endpoint: '/v1/mental-health/assess',
      method: 'POST',
      body: {
        text: query,
        sessionId: this.sessionId
      }
    });

    if (!response.success) {
      // Return safe fallback
      return {
        safe: false,
        message: 'Unable to assess query safety. Please consider speaking with a mental health professional if you\'re experiencing distress.',
        severity: 'medium',
        resources: {
          helplines: [
            {
              name: 'Suicide & Crisis Lifeline',
              phone: '988',
              url: 'https://988lifeline.org',
              country: 'US'
            },
            {
              name: 'Hopeline Philippines',
              phone: '1553',
              url: 'https://doh.gov.ph',
              country: 'PH'
            }
          ]
        }
      };
    }

    return response.data!;
  }

  /**
   * Get available models and their capabilities
   */
  async getAvailableModels(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    capabilities: string[];
    performance: {
      speed: 'fast' | 'medium' | 'slow';
      accuracy: 'high' | 'medium' | 'low';
      cost: 'low' | 'medium' | 'high';
    };
    status: 'available' | 'limited' | 'maintenance';
  }> | null> {
    const response = await apiGateway.request({
      endpoint: '/v1/models',
      method: 'GET'
    });

    return response.success ? response.data : null;
  }

  /**
   * Check system health and capabilities
   */
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    services: Record<string, {
      status: 'up' | 'down' | 'degraded';
      latency?: number;
      lastCheck: string;
    }>;
    features: {
      aiRouting: boolean;
      safetyChecks: boolean;
      mentalHealthSupport: boolean;
      vectorSearch: boolean;
      modelTraining: boolean;
    };
  } | null> {
    const response = await apiGateway.request({
      endpoint: '/health/detailed',
      method: 'GET'
    });

    return response.success ? response.data : null;
  }

  /**
   * Handle session end
   */
  async endSession(): Promise<void> {
    if (!this.initialized) return;

    try {
      await apiGateway.request({
        endpoint: '/v1/session/end',
        method: 'POST',
        body: {
          sessionId: this.sessionId,
          endTime: new Date().toISOString()
        }
      });
    } catch (error) {
      console.warn('Failed to end session properly:', error);
    }
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private detectDeviceType(): 'mobile' | 'desktop' | 'tablet' {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/tablet|ipad|playbook|silk|(android(?!.*mobi))/.test(userAgent)) {
      return 'tablet';
    }
    
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent)) {
      return 'mobile';
    }
    
    return 'desktop';
  }

  private logInteraction(request: QueryRequest, response: OrchestratorResponse) {
    // Log interaction for local analytics
    const interaction = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      requestId: response.metadata.requestId,
      queryLength: request.text.length,
      model: response.model,
      processingTime: response.metadata.processingTime,
      tokensUsed: response.metadata.tokensUsed,
      cached: response.metadata.cached,
      confidence: response.confidence,
      safetyChecks: response.metadata.safetyChecks.length,
      pipelineSteps: response.metadata.pipelineSteps.length
    };

    // Store in localStorage for client-side analytics
    try {
      const stored = JSON.parse(localStorage.getItem('orchestrator_interactions') || '[]');
      stored.push(interaction);
      
      // Keep only last 100 interactions
      if (stored.length > 100) {
        stored.splice(0, stored.length - 100);
      }
      
      localStorage.setItem('orchestrator_interactions', JSON.stringify(stored));
    } catch (error) {
      console.warn('Failed to log interaction locally:', error);
    }
  }

  /**
   * Get local interaction history
   */
  getLocalInteractionHistory(): any[] {
    try {
      return JSON.parse(localStorage.getItem('orchestrator_interactions') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear local data
   */
  clearLocalData(): void {
    localStorage.removeItem('orchestrator_interactions');
  }
}

/**
 * Custom error class for safety-related responses
 */
export class SafetyError extends Error {
  constructor(
    message: string,
    public severity: string,
    public resources?: any
  ) {
    super(message);
    this.name = 'SafetyError';
  }
}

// Export singleton instance
export const orchestratorService = new OrchestratorService();

// Export types
export type { 
  QueryRequest, 
  OrchestratorResponse, 
  UserProfile, 
  SafetyResponse, 
  AnalyticsData 
};