import { validationService } from './validationService';
import { systemGuardianService } from './systemGuardianService';

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
  model: 'deepseek/deepseek-r1' | 'deepseek/deepseek-r1-distill-llama-70b' | 'deepseek/deepseek-chat';
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

class DeepSeekService {
  private static instance: DeepSeekService;
  private apiKey: string | null = null;
  private baseUrl = 'https://openrouter.ai/api/v1';

  private constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || null;
    if (!this.apiKey) {
      console.warn('🤖 OpenRouter API key not found. AI features will be disabled.');
    }
  }

  public static getInstance(): DeepSeekService {
    if (!DeepSeekService.instance) {
      DeepSeekService.instance = new DeepSeekService();
    }
    return DeepSeekService.instance;
  }

  private isConfigured(): boolean {
    return this.apiKey !== null;
  }

  async generateResponse(
    messages: DeepSeekMessage[],
    config: DeepSeekConfig = { model: 'deepseek/deepseek-chat' }
  ): Promise<{ success: boolean; response?: string; error?: string; usage?: any }> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'OpenRouter API not configured. Please set OPENROUTER_API_KEY environment variable.'
        };
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

      const requestBody = {
        model: config.model,
        messages: sanitizedMessages,
        temperature: config.temperature || 0.7,
        max_tokens: config.max_tokens || 2048,
        stream: config.stream || false
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://gawin-ai.vercel.app',
          'X-Title': 'Gawin AI - Your Pocket AI Companion'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        systemGuardianService.reportError(
          `OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`,
          'api',
          'medium'
        );
        return {
          success: false,
          error: `API Error: ${errorData.error?.message || 'Request failed'}`
        };
      }

      const data: DeepSeekResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        return {
          success: false,
          error: 'No response generated from DeepSeek'
        };
      }

      return {
        success: true,
        response: data.choices[0].message.content,
        usage: data.usage
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      systemGuardianService.reportError(`OpenRouter service error: ${errorMessage}`, 'api', 'high');
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Specialized methods for different modules
  async solveCalculatorProblem(expression: string, context?: string): Promise<{ success: boolean; solution?: string; steps?: string[]; error?: string }> {
    try {
      const messages: DeepSeekMessage[] = [
        {
          role: 'system',
          content: `You are an advanced mathematical reasoning AI specializing in solving complex calculations and mathematical problems. 
          
          Your capabilities include:
          - Advanced arithmetic and algebra
          - Calculus and differential equations
          - Statistical analysis
          - Mathematical proofs and reasoning
          - Step-by-step problem solving
          
          Always provide:
          1. The final answer
          2. Clear step-by-step solution
          3. Explanations for complex operations
          
          Format your response as:
          ANSWER: [final answer]
          STEPS:
          1. [step 1]
          2. [step 2]
          ...`
        },
        {
          role: 'user',
          content: `Solve this mathematical problem: ${expression}${context ? `\n\nContext: ${context}` : ''}`
        }
      ];

      const result = await this.generateResponse(messages, { model: 'deepseek/deepseek-r1', temperature: 0.1 });
      
      if (!result.success || !result.response) {
        return { success: false, error: result.error };
      }

      // Parse the structured response
      const response = result.response;
      const answerMatch = response.match(/ANSWER:\s*(.+?)(?=\n|$)/);
      const stepsMatch = response.match(/STEPS:\s*([\s\S]+?)(?=\n\n|$)/);
      
      const solution = answerMatch ? answerMatch[1].trim() : response;
      const steps = stepsMatch 
        ? stepsMatch[1].split('\n').filter(step => step.trim()).map(step => step.replace(/^\d+\.\s*/, '').trim())
        : [];

      return {
        success: true,
        solution,
        steps
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to solve problem'
      };
    }
  }

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

      const result = await this.generateResponse(messages, { model: 'deepseek/deepseek-r1', temperature: 0.3 });
      
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

      const result = await this.generateResponse(messages, { model: 'deepseek/deepseek-r1', temperature: 0.4 });
      
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
    module: 'calculator' | 'coding_academy' | 'ai_academy' | 'general' = 'general'
  ): Promise<{ success: boolean; response?: string; error?: string; usage?: any }> {
    try {
      // Add module-specific system message if not already present
      const hasSystemMessage = messages.some(msg => msg.role === 'system');
      
      if (!hasSystemMessage) {
        const systemPrompts = {
          calculator: 'You are a mathematical reasoning AI assistant specializing in calculations, problem-solving, and mathematical explanations.',
          coding_academy: 'You are a coding instructor AI specializing in programming education, code reviews, and software development guidance.',
          ai_academy: 'You are an AI education specialist teaching artificial intelligence, machine learning, and computer science concepts.',
          general: 'You are a helpful AI assistant powered by DeepSeek R1, specializing in reasoning and problem-solving.'
        };

        messages = [
          { role: 'system', content: systemPrompts[module] },
          ...messages
        ];
      }

      return await this.generateResponse(messages, { model: 'deepseek/deepseek-r1' });

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
        return { status: 'offline', message: 'OpenRouter API not configured' };
      }

      const testMessage: DeepSeekMessage[] = [
        { role: 'user', content: 'Hello, please respond with just "OK"' }
      ];

      const result = await this.generateResponse(testMessage, { 
        model: 'deepseek/deepseek-chat', 
        max_tokens: 10, 
        temperature: 0 
      });

      if (result.success) {
        return { status: 'healthy', message: 'OpenRouter API operational' };
      } else {
        return { status: 'degraded', message: result.error || 'API issues detected' };
      }

    } catch (error) {
      return { status: 'offline', message: 'OpenRouter API unavailable' };
    }
  }
}

// Export singleton instance
export const deepseekService = DeepSeekService.getInstance();