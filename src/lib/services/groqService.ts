import { validationService } from './validationService';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
}

export interface GroqRequest {
  messages: GroqMessage[];
  action?: 'chat' | 'code' | 'analysis' | 'writing' | 'deepseek' | 'vision' | 'ocr';
  module?: string;
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
    model: 'llama-3.3-70b-versatile',
    description: 'General conversation and mixed tasks',
    max_tokens: 4096,
    temperature: 0.7
  },
  coding: {
    model: 'llama-3.3-70b-versatile',
    description: 'Programming and code generation',
    max_tokens: 8192,
    temperature: 0.3
  },
  analysis: {
    model: 'llama-3.3-70b-versatile',
    description: 'Research and complex analysis',
    max_tokens: 6144,
    temperature: 0.4
  },
  writing: {
    model: 'llama-3.3-70b-versatile',
    description: 'Language and writing tasks',
    max_tokens: 4096,
    temperature: 0.8
  },
  fast: {
    model: 'llama-3.1-8b-instant',
    description: 'Quick responses',
    max_tokens: 2048,
    temperature: 0.7
  },
  deepseek: {
    model: 'deepseek-r1-distill-llama-70b',
    description: 'DeepSeek model for fallback',
    max_tokens: 4096,
    temperature: 0.7
  },
  vision: {
    model: 'llama-3.2-11b-vision-preview',
    description: 'Vision model for image analysis and OCR',
    max_tokens: 4096,
    temperature: 0.3
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
        case 'vision':
        case 'ocr': return 'vision';
        case 'deepseek': return 'deepseek';
        default: break;
      }
    }
    
    // Check if any message contains images
    const hasImages = messages.some(msg => 
      Array.isArray(msg.content) && 
      msg.content.some(item => item.type === 'image_url')
    );
    
    if (hasImages) {
      return 'vision';
    }

    // Analyze message content
    const lastMessage = messages[messages.length - 1]?.content;
    const lastMessageText = typeof lastMessage === 'string' 
      ? lastMessage.toLowerCase() 
      : Array.isArray(lastMessage)
      ? lastMessage.find(item => item.type === 'text')?.text?.toLowerCase() || ''
      : '';
    
    // Coding detection
    if (/code|program|function|class|variable|debug|algorithm|javascript|python|react|typescript|css|html/.test(lastMessageText)) {
      return 'coding';
    }
    
    // Analysis/Research detection
    if (/analyze|research|compare|evaluate|investigate|study|examine|explain.*why|what.*causes|how.*works/.test(lastMessageText)) {
      return 'analysis';
    }
    
    // Writing detection
    if (/write|essay|story|letter|email|article|blog|creative|compose|grammar|spelling/.test(lastMessageText)) {
      return 'writing';
    }
    
    return 'general';
  }

  /**
   * Add system prompts based on task type
   */
  private addSystemPrompts(messages: GroqMessage[], taskType: keyof typeof MODEL_CONFIG): GroqMessage[] {
    let systemPrompt = '';
    
    if (taskType === 'coding') {
      systemPrompt = `You are an expert code assistant. When providing code solutions:
1. If the request is vague or unclear, ask follow-up questions for clarification before generating code
2. Generate clean, well-commented code with explanations
3. Use proper formatting and best practices
4. Include error handling where appropriate
5. Ask for clarification on framework/library preferences when not specified`;
    }
    
    if (taskType === 'analysis' || messages.some(m => {
      const messageText = typeof m.content === 'string' 
        ? m.content 
        : Array.isArray(m.content)
        ? m.content.find(item => item.type === 'text')?.text || ''
        : '';
      return /math|calculus|algebra|equation|solve|formula|derivative|integral/.test(messageText.toLowerCase());
    })) {
      systemPrompt = `You are a math explanation formatter. Your task is to present AI-generated math solutions in a way that is clean, structured, and visually easy to read, like a textbook.

Formatting Rules:
1. Use clear sectioning with headings: "Step 1", "Step 2", etc.
2. Keep each step short and precise. No long paragraphs.
3. Use bullet points when listing items.
4. Always format math with LaTeX style:
   - Inline math: \\( f(x) = 3x^2 \\sin(x) \\)
   - Block math for key formulas:
     \\[
     f'(x) = 6x \\sin(x) + 3x^2 \\cos(x)
     \\]
5. Highlight the **Final Answer** in its own block at the end.
6. Never mix text and formulas in the same long sentence — keep text and formulas separated for clarity.
7. Use bold for important words like "Conclusion", "Final Answer".
8. If the request is vague or unclear, ask follow-up questions for clarification before solving`;
    }
    
    if (systemPrompt) {
      return [{ role: 'system', content: systemPrompt }, ...messages];
    }
    
    return messages;
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

      // Add system prompts for specialized tasks
      const messagesWithSystem = this.addSystemPrompts(validatedMessages, taskType);

      // Prepare the request
      const payload = {
        model: modelConfig.model,
        messages: messagesWithSystem,
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
        const messageText = typeof message.content === 'string' 
          ? message.content 
          : Array.isArray(message.content)
          ? message.content.find(item => item.type === 'text')?.text || ''
          : '';
        const validation = validationService.validateTextInput(messageText);
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