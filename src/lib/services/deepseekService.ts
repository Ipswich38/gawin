import { validationService } from './validationService';
import { systemGuardianService } from './systemGuardianService';
import { aiModelManager } from './aiModelManager';
import Groq from 'groq-sdk';

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface DeepSeekConfig {
  model: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

class DeepSeekService {
  private static instance: DeepSeekService;
  private groq: Groq | null = null;

  private constructor() {
    const apiKey = process.env.GROQ_API_KEY || null;
    
    if (apiKey) {
      this.groq = new Groq({
        apiKey: apiKey,
        dangerouslyAllowBrowser: false // Server-side only
      });
    } else {
      console.warn('🤖 Groq API key not found. AI features will be disabled.');
    }
  }

  public static getInstance(): DeepSeekService {
    if (!DeepSeekService.instance) {
      DeepSeekService.instance = new DeepSeekService();
    }
    return DeepSeekService.instance;
  }

  private isConfigured(): boolean {
    return this.groq !== null;
  }

  async generateResponse(
    messages: DeepSeekMessage[],
    config: DeepSeekConfig = { model: 'deepseek/deepseek-chat' },
    feature: string = 'general_chat'
  ): Promise<{ success: boolean; response?: string; error?: string; usage?: any; modelUsed?: string }> {
    const startTime = Date.now();
    let selectedModel = config.model;
    
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Groq API not configured. Please set GROQ_API_KEY environment variable.'
        };
      }

      // Use AI Model Manager for smart model selection
      if (feature !== 'general_chat') {
        selectedModel = aiModelManager.getBestModelForFeature(feature as keyof import('./aiModelManager').FeatureModelMapping);
        config = { ...config, model: selectedModel };
      } else {
        // For general chat, use the general_chat mapping
        selectedModel = aiModelManager.getBestModelForFeature('general_chat');
        config = { ...config, model: selectedModel };
      }

      // Validate and sanitize messages
      const sanitizedMessages = messages.map(msg => {
        const validation = validationService.validateTextInput(msg.content);
        if (!validation.isValid) {
          throw new Error(`Invalid message content: ${validation.errors.join(', ')}`);
        }
        return {
          role: msg.role,
          content: validation.sanitized
        };
      });

      // Use Groq SDK for API calls with automatic fallback
      let completion;
      let attemptedModel = config.model;
      
      try {
        completion = await this.groq!.chat.completions.create({
          messages: sanitizedMessages as any,
          model: config.model,
          temperature: config.temperature || 0.7,
          max_tokens: config.max_tokens || 2048,
          stream: config.stream || false
        });
      } catch (modelError: any) {
        // If model is not available/decommissioned, try fallback models
        const fallbackModels = ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'llama-3.2-1b-preview'];
        
        for (const fallbackModel of fallbackModels) {
          if (fallbackModel !== config.model) {
            try {
              console.log(`🔄 Model ${config.model} failed, trying fallback: ${fallbackModel}`);
              completion = await this.groq!.chat.completions.create({
                messages: sanitizedMessages as any,
                model: fallbackModel,
                temperature: config.temperature || 0.7,
                max_tokens: config.max_tokens || 2048,
                stream: config.stream || false
              });
              attemptedModel = fallbackModel;
              break;
            } catch (fallbackError) {
              console.warn(`Fallback model ${fallbackModel} also failed:`, fallbackError);
              continue;
            }
          }
        }
        
        if (!completion) {
          throw new Error(`All models failed. Original error: ${modelError.message}`);
        }
      }

      // Handle both streaming and non-streaming responses
      const data = {
        choices: 'choices' in completion ? completion.choices : [],
        usage: 'usage' in completion ? completion.usage : undefined
      };
      
      if (!data.choices || data.choices.length === 0) {
        return {
          success: false,
          error: 'No response generated from AI model'
        };
      }

      // Report success to AI Model Manager
      const responseTime = Date.now() - startTime;
      aiModelManager.reportModelResult(attemptedModel, true, responseTime);

      return {
        success: true,
        response: data.choices[0].message.content || undefined,
        usage: data.usage,
        modelUsed: attemptedModel
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Report failure to AI Model Manager
      aiModelManager.reportModelResult(selectedModel, false);
      
      systemGuardianService.reportError(`Groq service error: ${errorMessage}`, 'api', 'high');
      return {
        success: false,
        error: errorMessage,
        modelUsed: selectedModel
      };
    }
  }

  // Specialized methods for different modules

  async generateCodeSolution(
    problem: string, 
    language: string = 'python',
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
  ): Promise<{ success: boolean; code?: string; explanation?: string; tests?: string; error?: string }> {
    try {
      const messages: DeepSeekMessage[] = [
        {
          role: 'system',
          content: `You are an expert coding instructor and software engineer specializing in teaching programming concepts.
          
          Your expertise includes:
          - Algorithm design and optimization
          - Code structure and best practices
          - Multiple programming languages
          - Testing and debugging
          - Educational explanations
          
          For ${difficulty} level problems, provide:
          1. Clean, well-commented code
          2. Clear explanation of the approach
          3. Basic test cases
          4. Learning objectives
          
          Format your response as:
          CODE:
          \`\`\`${language}
          [code here]
          \`\`\`
          
          EXPLANATION:
          [detailed explanation]
          
          TESTS:
          \`\`\`${language}
          [test cases]
          \`\`\``
        },
        {
          role: 'user',
          content: `Solve this ${difficulty} level coding problem in ${language}: ${problem}`
        }
      ];

      const result = await this.generateResponse(messages, { model: 'anthropic/claude-3.5-sonnet', temperature: 0.3 }, 'coding_academy');
      
      if (!result.success || !result.response) {
        return { success: false, error: result.error };
      }

      const response = result.response;
      
      // Parse the structured response
      const codeMatch = response.match(/CODE:\s*```[\w]*\n([\s\S]+?)```/);
      const explanationMatch = response.match(/EXPLANATION:\s*([\s\S]+?)(?=\nTESTS:|$)/);
      const testsMatch = response.match(/TESTS:\s*```[\w]*\n([\s\S]+?)```/);

      return {
        success: true,
        code: codeMatch ? codeMatch[1].trim() : '',
        explanation: explanationMatch ? explanationMatch[1].trim() : '',
        tests: testsMatch ? testsMatch[1].trim() : ''
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate code solution'
      };
    }
  }

  async explainAIConcept(
    concept: string,
    level: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
  ): Promise<{ success: boolean; explanation?: string; examples?: string[]; resources?: string[]; error?: string }> {
    try {
      const messages: DeepSeekMessage[] = [
        {
          role: 'system',
          content: `You are an AI education specialist with deep knowledge of artificial intelligence, machine learning, and computer science concepts.
          
          Your teaching approach:
          - Clear, jargon-free explanations for beginners
          - Technical depth appropriate to the level
          - Real-world examples and applications
          - Interactive learning opportunities
          
          For ${level} level, provide:
          1. Core concept explanation
          2. Practical examples
          3. Related concepts to explore
          4. Recommended learning resources
          
          Format your response as:
          EXPLANATION:
          [detailed explanation]
          
          EXAMPLES:
          - [example 1]
          - [example 2]
          
          RELATED_CONCEPTS:
          - [concept 1]
          - [concept 2]
          
          RESOURCES:
          - [resource 1]
          - [resource 2]`
        },
        {
          role: 'user',
          content: `Explain the AI concept: ${concept} at a ${level} level`
        }
      ];

      const result = await this.generateResponse(messages, { model: 'openai/gpt-4o', temperature: 0.4 }, 'ai_academy');
      
      if (!result.success || !result.response) {
        return { success: false, error: result.error };
      }

      const response = result.response;
      
      // Parse the structured response
      const explanationMatch = response.match(/EXPLANATION:\s*([\s\S]+?)(?=\nEXAMPLES:|$)/);
      const examplesMatch = response.match(/EXAMPLES:\s*([\s\S]+?)(?=\nRELATED_CONCEPTS:|$)/);
      const resourcesMatch = response.match(/RESOURCES:\s*([\s\S]+?)(?=\n\n|$)/);

      const examples = examplesMatch 
        ? examplesMatch[1].split('\n').filter(line => line.trim().startsWith('-')).map(line => line.replace(/^-\s*/, '').trim())
        : [];

      const resources = resourcesMatch 
        ? resourcesMatch[1].split('\n').filter(line => line.trim().startsWith('-')).map(line => line.replace(/^-\s*/, '').trim())
        : [];

      return {
        success: true,
        explanation: explanationMatch ? explanationMatch[1].trim() : response,
        examples,
        resources
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to explain AI concept'
      };
    }
  }

  // General chat for any module
  async chat(
    messages: DeepSeekMessage[],
    module: 'coding_academy' | 'ai_academy' | 'general' = 'general'
  ): Promise<{ success: boolean; response?: string; error?: string; usage?: any }> {
    try {
      // Add module-specific system message if not already present
      const hasSystemMessage = messages.some(msg => msg.role === 'system');
      
      if (!hasSystemMessage) {
        const systemPrompts = {
          coding_academy: 'You are Gawin AI, a coding instructor specializing in programming education, code reviews, and software development guidance.',
          ai_academy: 'You are Gawin AI, an AI education specialist teaching artificial intelligence, machine learning, and computer science concepts.',
          general: 'You are Gawin AI, a helpful and intelligent assistant specializing in reasoning, problem-solving, and providing thoughtful assistance across diverse topics.'
        };

        messages = [
          { role: 'system', content: systemPrompts[module] },
          ...messages
        ];
      }

      // Map module to feature name for AI model manager
      const featureMapping = {
        'general': 'general_chat',
        'coding_academy': 'coding_academy',
        'ai_academy': 'ai_academy'
      } as const;
      
      const feature = featureMapping[module] || 'general_chat';
      return await this.generateResponse(messages, { model: 'deepseek-r1-distill-llama-70b' }, feature);

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Chat failed'
      };
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'offline'; message: string }> {
    try {
      if (!this.isConfigured()) {
        return { status: 'offline', message: 'Groq API not configured' };
      }

      const testMessage: DeepSeekMessage[] = [
        { role: 'user', content: 'Hello, please respond with just "OK"' }
      ];

      const result = await this.generateResponse(testMessage, { 
        model: 'llama3-8b-8192', 
        max_tokens: 10, 
        temperature: 0 
      });

      if (result.success) {
        return { status: 'healthy', message: 'Groq API operational' };
      } else {
        return { status: 'degraded', message: result.error || 'API issues detected' };
      }

    } catch (error) {
      return { status: 'offline', message: 'Groq API unavailable' };
    }
  }
}

// Export singleton instance
export const deepseekService = DeepSeekService.getInstance();