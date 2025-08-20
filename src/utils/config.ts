// Configuration and Environment Variables
// Uses Vite's environment variable system for secure configuration

export const config = {
  // API Configuration - from environment variables
  groqApiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  
  // App Configuration
  appName: 'Gawin AI',
  appVersion: '1.0.0',
  
  // Feature Flags
  enableAudioFeatures: true,
  enableVisionFeatures: true,
  enableFunctionCalling: true,
  
  // Usage Limits
  freeTierMonthlyLimit: 200,
  freeTierMaxTokensPerRequest: 4096,
  
  // API Endpoints
  groqBaseUrl: 'https://api.groq.com/openai/v1',
  
  // UI Configuration
  animationDuration: 300,
  maxMessageLength: 4000,
  typingIndicatorDelay: 500,
  
  // Debug
  isDevelopment: import.meta.env.DEV,
  enableLogging: import.meta.env.DEV,
};

// Validation function to check if required config is present
export const validateConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!config.groqApiKey) {
    errors.push('VITE_GROQ_API_KEY environment variable is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Helper to log configuration (without sensitive data)
export const logConfig = () => {
  if (!config.enableLogging) return;
  
  console.log('🔧 Gawin AI Configuration:', {
    appName: config.appName,
    appVersion: config.appVersion,
    enableAudioFeatures: config.enableAudioFeatures,
    enableVisionFeatures: config.enableVisionFeatures,
    enableFunctionCalling: config.enableFunctionCalling,
    isDevelopment: config.isDevelopment,
    hasApiKey: !!config.groqApiKey,
  });
};