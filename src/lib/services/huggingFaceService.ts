import { validationService } from './validationService';
import { systemGuardianService } from './systemGuardianService';

export interface HuggingFaceMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface HuggingFaceRequest {
  messages: HuggingFaceMessage[];
  action?: 'chat' | 'code' | 'analysis' | 'writing' | 'image';
  module?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface HuggingFaceResponse {
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
  stem: {
    model: 'microsoft/DeepSeek-R1-Distill-Qwen-32B',
    description: 'STEM subjects and complex analysis',
    max_tokens: 4096,
    temperature: 0.7
  },
  coding: {
    model: 'deepseek-ai/DeepSeek-Coder-V2-Instruct-236B',
    description: 'Programming and code generation',
    max_tokens: 8192,
    temperature: 0.3
  },
  writing: {
    model: 'Qwen/Qwen2.5-72B-Instruct',
    description: 'Language and writing tasks',
    max_tokens: 4096,
    temperature: 0.8
  },
  analysis: {
    model: 'microsoft/DeepSeek-R1-Distill-Qwen-32B',
    description: 'Research and complex analysis',
    max_tokens: 6144,
    temperature: 0.4
  },
  general: {
    model: 'Qwen/Qwen2.5-72B-Instruct',
    description: 'General conversation',
    max_tokens: 2048,
    temperature: 0.7
  }
};

class HuggingFaceService {
  private static instance: HuggingFaceService;
  private apiKey: string;
  private baseURL: string = 'https://api-inference.huggingface.co/models';

  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ Hugging Face API key not found. Service will not work properly.');
    }
  }

  static getInstance(): HuggingFaceService {
    if (!HuggingFaceService.instance) {
      HuggingFaceService.instance = new HuggingFaceService();
    }
    return HuggingFaceService.instance;
  }

  /**
   * Determine the best model based on the request content and action
   */
  private determineTaskType(request: HuggingFaceRequest): keyof typeof MODEL_CONFIG {
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
    
    // STEM subjects detection
    if (/math|physics|chemistry|biology|calculus|algebra|equation|formula|scientific|theorem|hypothesis|experiment/.test(lastMessage)) {
      return 'stem';
    }
    
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
  async createChatCompletion(request: HuggingFaceRequest): Promise<HuggingFaceResponse> {
    const startTime = Date.now();
    
    try {
      // Validation and security checks
      if (!this.apiKey) {
        return {
          success: false,
          error: 'Hugging Face API key not configured'
        };
      }

      // Validate and filter messages
      const validatedMessages = await this.validateMessages(request.messages);
      if (validatedMessages.length === 0) {
        return {
          success: false,
          error: 'No valid messages provided'
        };
      }

      // Determine the best model for this task
      const taskType = this.determineTaskType(request);
      const modelConfig = MODEL_CONFIG[taskType];
      
      console.log(`🤖 Using ${taskType} model: ${modelConfig.model}`);

      // Prepare the request
      const payload = {
        inputs: this.formatMessagesForHF(validatedMessages),
        parameters: {
          max_new_tokens: request.max_tokens || modelConfig.max_tokens,
          temperature: request.temperature || modelConfig.temperature,
          return_full_text: false,
          do_sample: true,
          top_p: 0.95,
          stop: ["<|im_end|>", "<|endoftext|>"]
        }
      };

      // Make API request
      const response = await fetch(`${this.baseURL}/${modelConfig.model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Hugging Face API error:', response.status, errorData);
        return {
          success: false,
          error: `API request failed: ${response.status} ${errorData}`
        };
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      // Extract response text
      let responseText = '';
      if (Array.isArray(data) && data[0]?.generated_text) {
        responseText = data[0].generated_text.trim();
      } else if (data.generated_text) {
        responseText = data.generated_text.trim();
      } else {
        return {
          success: false,
          error: 'Unexpected response format from Hugging Face API'
        };
      }

      // Post-process the response
      const cleanResponse = await this.postProcessResponse(responseText, taskType);

      return {
        success: true,
        data: {
          response: cleanResponse,
          model_used: modelConfig.model,
          task_type: taskType,
          processing_time: processingTime
        },
        usage: {
          prompt_tokens: this.estimateTokens(payload.inputs),
          completion_tokens: this.estimateTokens(cleanResponse),
          total_tokens: this.estimateTokens(payload.inputs + cleanResponse)
        }
      };

    } catch (error) {
      console.error('Hugging Face service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Generate images using FLUX.1-dev with fallback options
   */
  async generateImage(prompt: string, options?: {
    width?: number;
    height?: number;
    num_inference_steps?: number;
    guidance_scale?: number;
  }): Promise<{ success: boolean; data?: { image_url: string } | null; error?: string }> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: 'Hugging Face API key not configured'
        };
      }

      // Validate prompt
      const validation = validationService.validateTextInput(prompt);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Invalid or inappropriate prompt'
        };
      }

      // Try multiple models in order of preference
      const modelAttempts = [
        {
          model: 'kandinsky-community/kandinsky-3',
          name: 'Kandinsky 3.0',
          steps: 25,
          timeout: 35000,
          width: options?.width || 1024,
          height: options?.height || 1024
        },
        {
          model: 'kandinsky-community/kandinsky-2-2-decoder',
          name: 'Kandinsky 2.2',
          steps: 50,
          timeout: 30000,
          width: options?.width || 768,
          height: options?.height || 768
        },
        {
          model: 'stabilityai/stable-diffusion-xl-base-1.0',
          name: 'Stable Diffusion XL',
          steps: 20,
          timeout: 25000,
          width: options?.width || 1024,
          height: options?.height || 1024
        },
        {
          model: 'runwayml/stable-diffusion-v1-5',
          name: 'Stable Diffusion v1.5',
          steps: 20,
          timeout: 20000,
          width: options?.width || 512,
          height: options?.height || 512
        }
      ];

      for (const attempt of modelAttempts) {
        try {
          console.log(`🎨 Trying image generation with ${attempt.name}...`);

          // Prepare payload based on model type
          let payload;
          
          if (attempt.model.includes('kandinsky')) {
            // Kandinsky models use different parameter structure
            payload = {
              inputs: prompt,
              parameters: {
                width: attempt.width,
                height: attempt.height,
                num_inference_steps: attempt.steps,
                guidance_scale: options?.guidance_scale || 7.0,
                prior_guidance_scale: 1.0,
                prior_num_inference_steps: 10
              }
            };
          } else {
            // Standard Stable Diffusion models
            payload = {
              inputs: prompt,
              parameters: {
                width: attempt.width,
                height: attempt.height,
                num_inference_steps: attempt.steps,
                guidance_scale: options?.guidance_scale || 7.5
              }
            };
          }

          // Create abort controller for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), attempt.timeout);

          const response = await fetch(`${this.baseURL}/${attempt.model}`, {
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
            const errorText = await response.text();
            console.warn(`${attempt.name} failed:`, response.status, errorText.slice(0, 200));
            
            // If it's a 504 or 503, try the next model
            if (response.status === 504 || response.status === 503) {
              continue;
            }
            
            // For other errors, return the error
            return {
              success: false,
              error: `Image generation failed with ${attempt.name}: ${response.status}`
            };
          }

          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);

          console.log(`✅ Successfully generated image with ${attempt.name}`);

          return {
            success: true,
            data: { image_url: imageUrl }
          };

        } catch (error) {
          console.warn(`${attempt.name} error:`, error);
          
          // If it's a timeout or network error, try next model
          if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('fetch'))) {
            console.log(`⏰ ${attempt.name} timed out, trying next model...`);
            continue;
          }
          
          // For other errors, continue to next model
          continue;
        }
      }

      // If all models failed, return a helpful error
      return {
        success: false,
        error: 'All image generation models are currently unavailable. The Hugging Face inference API might be overloaded. Please try again in a few moments.'
      };

    } catch (error) {
      console.error('Image generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image generation failed'
      };
    }
  }

  /**
   * Format messages for Hugging Face chat format
   */
  private formatMessagesForHF(messages: HuggingFaceMessage[]): string {
    let formatted = '';
    
    for (const message of messages) {
      if (message.role === 'system') {
        formatted += `<|im_start|>system\n${message.content}<|im_end|>\n`;
      } else if (message.role === 'user') {
        formatted += `<|im_start|>user\n${message.content}<|im_end|>\n`;
      } else if (message.role === 'assistant') {
        formatted += `<|im_start|>assistant\n${message.content}<|im_end|>\n`;
      }
    }
    
    formatted += '<|im_start|>assistant\n';
    return formatted;
  }

  /**
   * Validate and filter messages
   */
  private async validateMessages(messages: HuggingFaceMessage[]): Promise<HuggingFaceMessage[]> {
    const validMessages: HuggingFaceMessage[] = [];
    
    for (const message of messages) {
      try {
        const validation = validationService.validateTextInput(message.content);
        if (validation.isValid) {
          validMessages.push(message);
        } else {
          console.warn('Message filtered out:', validation.errors);
        }
      } catch (error) {
        console.warn('Message validation failed:', error);
      }
    }
    
    return validMessages;
  }

  /**
   * Post-process response based on task type
   */
  private async postProcessResponse(response: string, taskType: keyof typeof MODEL_CONFIG): Promise<string> {
    let cleaned = response;
    
    // Remove common artifacts
    cleaned = cleaned.replace(/<\|im_end\|>[\s\S]*$/, '');
    cleaned = cleaned.replace(/<\|endoftext\|>[\s\S]*$/, '');
    cleaned = cleaned.replace(/^assistant\s*:?\s*/i, '');
    cleaned = cleaned.trim();
    
    // Task-specific processing
    switch (taskType) {
      case 'coding':
        // Ensure code blocks are properly formatted
        if (cleaned.includes('```') && !cleaned.endsWith('```')) {
          cleaned += '\n```';
        }
        break;
      
      case 'stem':
        // Ensure mathematical expressions are clear
        cleaned = cleaned.replace(/\$\$([^$]+)\$\$/g, '$$\n$1\n$$');
        break;
      
      case 'writing':
        // Clean up extra spaces and ensure proper punctuation
        cleaned = cleaned.replace(/\s+/g, ' ');
        cleaned = cleaned.replace(/([.!?])\s*([a-z])/g, '$1 $2');
        break;
    }
    
    // Final validation using text input validation
    const validation = validationService.validateTextInput(cleaned);
    if (!validation.isValid) {
      console.warn('Response validation failed:', validation.errors);
      return 'I apologize, but I cannot provide that response due to content policy restrictions.';
    }
    
    return cleaned;
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
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
      if (!this.apiKey) {
        return { status: 'offline', message: 'API key not configured' };
      }

      // Simple test request
      const testResponse = await this.createChatCompletion({
        messages: [
          { role: 'user', content: 'Hello, respond with just "OK"' }
        ]
      });

      if (testResponse.success) {
        return { status: 'healthy', message: 'All models operational' };
      } else {
        return { status: 'degraded', message: testResponse.error || 'Service issues detected' };
      }
    } catch (error) {
      return { status: 'offline', message: 'Service unavailable' };
    }
  }
}

// Export singleton instance
export const huggingFaceService = HuggingFaceService.getInstance();
export default huggingFaceService;