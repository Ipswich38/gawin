// Configuration and Environment Variables
// Now using Hugging Face Pro models with DeepSeek fallback

export const config = {
  // API Configuration - from environment variables
  huggingFaceApiKey: process.env.HUGGINGFACE_API_KEY || '',
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
  
  // App Configuration
  appName: 'Gawin AI',
  appVersion: '1.0.0',
  
  // Feature Flags
  enableAudioFeatures: true,
  enableVisionFeatures: true,
  enableFunctionCalling: true,
  enableImageGeneration: true,
  
  // Usage Limits
  freeTierMonthlyLimit: 200,
  freeTierMaxTokensPerRequest: 4096,
  
  // API Endpoints
  huggingFaceBaseUrl: 'https://api-inference.huggingface.co/models',
  deepseekBaseUrl: 'https://api.deepseek.com/v1',
  
  // AI Models Configuration
  models: {
    stem: 'microsoft/DeepSeek-R1-Distill-Qwen-32B',
    coding: 'deepseek-ai/DeepSeek-Coder-V2-Instruct-236B',
    writing: 'Qwen/Qwen2.5-72B-Instruct',
    analysis: 'microsoft/DeepSeek-R1-Distill-Qwen-32B',
    imageGeneration: 'kandinsky-community/kandinsky-3',
    fallback: 'deepseek-chat'
  },
  
  // UI Configuration
  animationDuration: 300,
  maxMessageLength: 4000,
  typingIndicatorDelay: 500,
  
  // Debug
  isDevelopment: process.env.NODE_ENV === 'development',
  enableLogging: process.env.NODE_ENV === 'development',
};

// Validation function to check if required config is present
export const validateConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!config.huggingFaceApiKey) {
    errors.push('HUGGINGFACE_API_KEY environment variable is required for optimal performance');
  }
  
  // DeepSeek API key is optional - it will use mock responses if not available
  
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
    enableImageGeneration: config.enableImageGeneration,
    isDevelopment: config.isDevelopment,
    hasHuggingFaceKey: !!config.huggingFaceApiKey,
    hasDeepSeekKey: !!config.deepseekApiKey,
    primaryModels: config.models,
  });
};