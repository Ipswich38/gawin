/**
 * AI Provider Utilities
 * Unified interface for calling different AI providers
 */

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIRequest {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface AIResponse {
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
  provider?: string;
}

export class AIProviderUtils {
  /**
   * Send a request to the specified AI provider
   */
  static async callAIProvider(
    provider: string,
    request: AIRequest
  ): Promise<AIResponse> {
    const endpoints: Record<string, string> = {
      groq: '/api/groq',
      gemini: '/api/gemini',
      deepseek: '/api/deepseek',
      perplexity: '/api/perplexity'
    };

    const endpoint = endpoints[provider];
    if (!endpoint) {
      throw new Error(`Unsupported AI provider: ${provider}`);
    }

    try {
      console.log(`🤖 Calling ${provider} API...`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...request,
          // Provider-specific parameter mapping
          ...(provider === 'gemini' && {
            maxTokens: request.max_tokens,
            userMessage: request.messages[request.messages.length - 1]?.content
          }),
          ...(provider === 'groq' && {
            max_tokens: request.max_tokens || 1500
          }),
          ...(provider === 'deepseek' && {
            max_tokens: request.max_tokens || 1500
          }),
          ...(provider === 'perplexity' && {
            max_tokens: request.max_tokens || 1500
          })
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || errorData.details || `HTTP ${response.status}`);
      }

      const data: AIResponse = await response.json();

      // Add provider info to response
      data.provider = provider;

      console.log(`✅ ${provider} API response received`);
      return data;

    } catch (error: any) {
      console.error(`❌ ${provider} API Error:`, error);
      throw new Error(`${provider} API request failed: ${error.message}`);
    }
  }

  /**
   * Get the default model for a provider
   */
  static getDefaultModel(provider: string): string {
    const defaultModels: Record<string, string> = {
      groq: 'llama-3.3-70b-versatile',
      gemini: 'gemini-1.5-flash',
      deepseek: 'deepseek-chat',
      perplexity: 'llama-3.1-sonar-small-128k-online'
    };

    return defaultModels[provider] || 'default';
  }

  /**
   * Check if a provider is available
   */
  static async checkProviderStatus(provider: string): Promise<boolean> {
    const endpoints: Record<string, string> = {
      groq: '/api/groq',
      gemini: '/api/gemini',
      deepseek: '/api/deepseek',
      perplexity: '/api/perplexity'
    };

    const endpoint = endpoints[provider];
    if (!endpoint) return false;

    try {
      const response = await fetch(endpoint, {
        method: 'GET'
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Format messages for a specific provider
   */
  static formatMessages(provider: string, messages: AIMessage[]): AIMessage[] {
    switch (provider) {
      case 'gemini':
        // Gemini handles system messages differently
        return messages.map(msg => ({
          ...msg,
          role: msg.role === 'system' ? 'user' as const : msg.role
        }));

      case 'groq':
      case 'deepseek':
      case 'perplexity':
      default:
        return messages;
    }
  }

  /**
   * Get provider-specific optimal settings
   */
  static getOptimalSettings(provider: string) {
    const settings: Record<string, { temperature: number; max_tokens: number }> = {
      groq: { temperature: 0.7, max_tokens: 1500 },
      gemini: { temperature: 0.8, max_tokens: 2048 },
      deepseek: { temperature: 0.7, max_tokens: 1500 },
      perplexity: { temperature: 0.7, max_tokens: 1500 }
    };

    return settings[provider] || { temperature: 0.7, max_tokens: 1500 };
  }

  /**
   * Handle provider-specific errors
   */
  static handleProviderError(provider: string, error: any): string {
    const errorMessages: Record<string, Record<string, string>> = {
      gemini: {
        'API key': 'Google AI API key is missing or invalid. Please check your GOOGLE_AI_API_KEY environment variable.',
        'quota': 'Google AI quota exceeded. Please try again later.',
        'safety': 'Content was filtered by Google AI safety settings.'
      },
      groq: {
        'API key': 'Groq API key is missing or invalid.',
        'rate limit': 'Groq rate limit exceeded. Please try again later.'
      },
      deepseek: {
        'API key': 'DeepSeek API key is missing or invalid.',
        'quota': 'DeepSeek quota exceeded.'
      },
      perplexity: {
        'API key': 'Perplexity API key is missing or invalid.',
        'credits': 'Perplexity credits exhausted.'
      }
    };

    const providerErrors = errorMessages[provider] || {};
    const errorMessage = error.message || error.toString();

    // Find matching error type
    for (const [key, message] of Object.entries(providerErrors)) {
      if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
        return message;
      }
    }

    return `${provider} error: ${errorMessage}`;
  }

  /**
   * Get available models for a provider
   */
  static getAvailableModels(provider: string): string[] {
    const models: Record<string, string[]> = {
      groq: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama3-groq-70b-8192-tool-use-preview'],
      gemini: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'],
      deepseek: ['deepseek-chat', 'deepseek-coder'],
      perplexity: ['llama-3.1-sonar-small-128k-online', 'llama-3.1-sonar-large-128k-online']
    };

    return models[provider] || [];
  }
}

export default AIProviderUtils;