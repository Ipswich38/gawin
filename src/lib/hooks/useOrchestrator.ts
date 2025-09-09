'use client';

/**
 * React hook for AI Orchestrator integration
 * Provides easy access to orchestrator features with React state management
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  orchestratorService, 
  QueryRequest, 
  OrchestratorResponse, 
  UserProfile, 
  SafetyError,
  AnalyticsData 
} from '../services/orchestratorService';

interface UseOrchestratorState {
  loading: boolean;
  error: string | null;
  response: OrchestratorResponse | null;
  profile: UserProfile | null;
  analytics: AnalyticsData | null;
  systemHealth: any;
}

interface UseOrchestratorReturn extends UseOrchestratorState {
  // Query methods
  query: (request: QueryRequest) => Promise<OrchestratorResponse>;
  retryLastQuery: () => Promise<OrchestratorResponse | null>;
  
  // Profile methods
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  
  // Feedback methods
  submitFeedback: (requestId: string, rating: number, feedback?: string) => Promise<boolean>;
  
  // Analytics methods
  refreshAnalytics: (timeframe?: '24h' | '7d' | '30d') => Promise<void>;
  
  // Safety methods
  checkSafety: (text: string) => Promise<boolean>;
  
  // Utility methods
  clearError: () => void;
  getLocalHistory: () => any[];
  clearLocalData: () => void;
}

export function useOrchestrator(): UseOrchestratorReturn {
  const [state, setState] = useState<UseOrchestratorState>({
    loading: false,
    error: null,
    response: null,
    profile: null,
    analytics: null,
    systemHealth: null
  });

  const [lastQueryRequest, setLastQueryRequest] = useState<QueryRequest | null>(null);

  // Clear error helper
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Main query function
  const query = useCallback(async (request: QueryRequest): Promise<OrchestratorResponse> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    setLastQueryRequest(request);

    try {
      const response = await orchestratorService.query(request);
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        response,
        error: null 
      }));

      return response;

    } catch (error) {
      const errorMessage = error instanceof SafetyError 
        ? `Safety concern detected: ${error.message}`
        : error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';

      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage,
        response: null 
      }));

      throw error;
    }
  }, []);

  // Retry last query
  const retryLastQuery = useCallback(async (): Promise<OrchestratorResponse | null> => {
    if (!lastQueryRequest) return null;
    return await query(lastQueryRequest);
  }, [lastQueryRequest, query]);

  // Profile management
  const refreshProfile = useCallback(async () => {
    try {
      const profile = await orchestratorService.getUserProfile();
      setState(prev => ({ ...prev, profile }));
    } catch (error) {
      console.warn('Failed to refresh profile:', error);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      const success = await orchestratorService.updateUserProfile(updates);
      if (success) {
        await refreshProfile();
      }
      return success;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return false;
    }
  }, [refreshProfile]);

  // Feedback submission
  const submitFeedback = useCallback(async (
    requestId: string, 
    rating: number, 
    feedback?: string
  ): Promise<boolean> => {
    try {
      return await orchestratorService.submitFeedback({
        requestId,
        rating,
        feedback
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      return false;
    }
  }, []);

  // Analytics
  const refreshAnalytics = useCallback(async (timeframe: '24h' | '7d' | '30d' = '7d') => {
    try {
      const analytics = await orchestratorService.getAnalytics(timeframe);
      setState(prev => ({ ...prev, analytics }));
    } catch (error) {
      console.warn('Failed to refresh analytics:', error);
    }
  }, []);

  // Safety check
  const checkSafety = useCallback(async (text: string): Promise<boolean> => {
    try {
      const safetyResponse = await orchestratorService.getMentalHealthAssessment(text);
      return safetyResponse.safe;
    } catch (error) {
      console.warn('Safety check failed:', error);
      return true; // Default to safe if check fails
    }
  }, []);

  // Utility methods
  const getLocalHistory = useCallback(() => {
    return orchestratorService.getLocalInteractionHistory();
  }, []);

  const clearLocalData = useCallback(() => {
    orchestratorService.clearLocalData();
  }, []);

  // Load initial data
  useEffect(() => {
    refreshProfile();
    refreshAnalytics();
  }, [refreshProfile, refreshAnalytics]);

  // Check system health periodically
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await orchestratorService.getSystemHealth();
        setState(prev => ({ ...prev, systemHealth: health }));
      } catch (error) {
        console.warn('Health check failed:', error);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Cleanup session on unmount
  useEffect(() => {
    return () => {
      orchestratorService.endSession();
    };
  }, []);

  return {
    ...state,
    query,
    retryLastQuery,
    updateProfile,
    refreshProfile,
    submitFeedback,
    refreshAnalytics,
    checkSafety,
    clearError,
    getLocalHistory,
    clearLocalData
  };
}

/**
 * Simplified hook for basic queries
 */
export function useSimpleQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useCallback(async (text: string, options?: {
    priority?: QueryRequest['priority'];
    temperature?: number;
    modelPreference?: string;
  }): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const response = await orchestratorService.query({
        text,
        priority: options?.priority || 'normal',
        temperature: options?.temperature,
        model_preference: options?.modelPreference,
        consent_to_train: true // Default to allowing training
      });

      return response.response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Query failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { query, loading, error, clearError: () => setError(null) };
}

/**
 * Hook for safety-focused interactions
 */
export function useSafetyAwareQuery() {
  const [safetyWarning, setSafetyWarning] = useState<string | null>(null);
  const { query: baseQuery, loading, error, clearError } = useSimpleQuery();

  const query = useCallback(async (text: string): Promise<{
    response?: string;
    safetyIssue?: {
      message: string;
      severity: string;
      resources?: any;
    };
  }> => {
    setSafetyWarning(null);

    try {
      // First check for safety issues
      const safetyCheck = await orchestratorService.getMentalHealthAssessment(text);
      
      if (!safetyCheck.safe && safetyCheck.severity !== 'low') {
        setSafetyWarning(safetyCheck.message);
        return {
          safetyIssue: {
            message: safetyCheck.message,
            severity: safetyCheck.severity,
            resources: safetyCheck.resources
          }
        };
      }

      // If safe, proceed with query
      const response = await baseQuery(text, { priority: 'normal' });
      return { response };

    } catch (error) {
      if (error instanceof SafetyError) {
        setSafetyWarning(error.message);
        return {
          safetyIssue: {
            message: error.message,
            severity: error.severity,
            resources: error.resources
          }
        };
      }
      throw error;
    }
  }, [baseQuery]);

  return {
    query,
    loading,
    error,
    safetyWarning,
    clearError,
    clearSafetyWarning: () => setSafetyWarning(null)
  };
}