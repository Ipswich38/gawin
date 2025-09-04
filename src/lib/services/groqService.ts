import { validationService } from './validationService';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqRequest {
  messages: GroqMessage[];
  action?: 'chat' | 'code' | 'analysis' | 'writing';
  max_tokens?: number;
  temperature?: number;
}

export interface GroqResponse {
  success: boolean;
  data?: {
    response: string;
    model_used: string;
    task_type: string;
    processing_time?: number;
  };
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Model configurations for different tasks
const MODEL_CONFIG = {
  general: {
    model: 'llama-3.1-70b-versatile',
    description: 'General conversation and mixed tasks',
    max_tokens: 4096,
    temperature: 0.7
  },
  coding: {
    model: 'llama-3.1-70b-versatile',
    description: 'Programming and code generation',
    max_tokens: 8192,
    temperature: 0.3
  },
  analysis: {
    model: 'mixtral-8x7b-32768',
    description: 'Research and complex analysis',
    max_tokens: 6144,
    temperature: 0.4
  },
  writing: {
    model: 'llama-3.1-70b-versatile',
    description: 'Language and writing tasks',
    max_tokens: 4096,
    temperature: 0.8
  },
  fast: {
    model: 'llama-3.1-8b-instant',
    description: 'Quick responses',
    max_tokens: 2048,
    temperature: 0.7
  }
};

class GroqService {
  private static instance: GroqService;
  private apiKey: string;
  private baseURL: string = 'https://api.groq.com/openai/v1';

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ Groq API key not found. Service will not work properly.');
    } else {
      console.log('✅ Groq API key configured successfully.');
    }
  }

  static getInstance(): GroqService {
    if (!GroqService.instance) {
      GroqService.instance = new GroqService();
    }
    return GroqService.instance;
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return this.apiKey !== '';
  }

  /**
   * Determine the best model based on the request content and action
   */
  private determineTaskType(request: GroqRequest): keyof typeof MODEL_CONFIG {
    const { action, messages } = request;
    
    // Check explicit action first
    if (action) {
      switch (action) {
        case 'code': return 'coding';
        case 'analysis': return 'analysis';
        case 'writing': return 'writing';
        default: break;
      }
    }

    // Analyze message content
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    
    // Coding detection
    if (/code|program|function|class|variable|debug|algorithm|javascript|python|react|typescript|css|html/.test(lastMessage)) {
      return 'coding';
    }
    
    // Analysis/Research detection
    if (/analyze|research|compare|evaluate|investigate|study|examine|explain.*why|what.*causes|how.*works/.test(lastMessage)) {
      return 'analysis';
    }
    
    // Writing detection
    if (/write|essay|story|letter|email|article|blog|creative|compose|grammar|spelling/.test(lastMessage)) {
      return 'writing';
    }
    
    return 'general';
  }

  /**
   * Main chat completion method
   */
  async createChatCompletion(request: GroqRequest): Promise<GroqResponse> {
    const startTime = Date.now();
    
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Groq API key not configured'
        };
      }

      // Validate and filter messages
      const validatedMessages = this.validateMessages(request.messages);
      if (validatedMessages.length === 0) {
        return {
          success: false,
          error: 'No valid messages provided'
        };
      }

      // Determine the best model for this task
      const taskType = this.determineTaskType(request);
      const modelConfig = MODEL_CONFIG[taskType];
      
      console.log(`🚀 Using Groq ${taskType} model: ${modelConfig.model}`);

      // Prepare the request
      const payload = {
        model: modelConfig.model,
        messages: validatedMessages,
        max_tokens: request.max_tokens || modelConfig.max_tokens,
        temperature: request.temperature || modelConfig.temperature,
        stream: false
      };

      // Make API request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Groq API error:', response.status, errorData);
        return {
          success: false,
          error: `Groq API request failed: ${response.status}`
        };
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      // Extract response text
      if (!data.choices || data.choices.length === 0) {
        return {
          success: false,
          error: 'No response choices returned from Groq API'
        };
      }

      const responseText = data.choices[0].message?.content || '';

      // Validate the response
      const validation = validationService.validateTextInput(responseText);
      if (!validation.isValid) {
        console.warn('Groq response validation failed:', validation.errors);
        return {
          success: false,
          error: 'Response validation failed'
        };
      }

      return {
        success: true,
        data: {
          response: responseText.trim(),
          model_used: modelConfig.model,
          task_type: taskType,
          processing_time: processingTime
        },
        usage: {
          prompt_tokens: data.usage?.prompt_tokens || 0,
          completion_tokens: data.usage?.completion_tokens || 0,
          total_tokens: data.usage?.total_tokens || 0
        }
      };

    } catch (error) {
      console.error('Groq service error:', error);
      
      // Handle timeout/abort errors specifically
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Groq API request timeout'
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Validate messages for content safety
   */
  private validateMessages(messages: GroqMessage[]): GroqMessage[] {
    return messages.filter(message => {
      try {
        const validation = validationService.validateTextInput(message.content);
        return validation.isValid;
      } catch (error) {
        console.warn('Message validation failed:', error);
        return false;
      }
    });
  }

  /**
   * Get available models info
   */
  getAvailableModels() {
    return MODEL_CONFIG;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'offline'; message: string }> {
    try {
      if (!this.isConfigured()) {
        return { status: 'offline', message: 'Groq API key not configured' };
      }

      // Simple test request
      const testResponse = await this.createChatCompletion({
        messages: [
          { role: 'user', content: 'Hello, respond with just "OK"' }
        ]
      });

      if (testResponse.success) {
        return { status: 'healthy', message: 'Groq API operational' };
      } else {
        return { status: 'degraded', message: testResponse.error || 'Service issues detected' };
      }
    } catch (error) {
      return { status: 'offline', message: 'Groq service unavailable' };
    }
  }
}

// Export singleton instance
export const groqService = GroqService.getInstance();
export default groqService;