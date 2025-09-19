import { validationService } from './validationService';
import { behaviorEnhancedAI } from './behaviorEnhancedAI';
import { behaviorPrivacyService } from './behaviorPrivacyService';
import { gawinEnhancementService } from './gawinEnhancementService';
import { gawinTrainingService } from './gawinTrainingService';

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
  choices?: [{
    message: {
      role: 'assistant';
      content: string;
    };
  }];
  model?: string;
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
  }
  // Note: Vision models temporarily disabled - Groq has deprecated their vision models
  // vision: {
  //   model: 'llama-3.2-90b-vision-preview', 
  //   description: 'Vision model for image analysis and OCR',
  //   max_tokens: 4096,
  //   temperature: 0.3
  // }
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
        case 'ocr': return 'general'; // Fallback to general since vision is unavailable
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
      return 'general'; // Vision unavailable, use general model
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
    
    // Writing detection (enhanced to catch song lyrics)
    if (/write|essay|story|letter|email|article|blog|creative|compose|grammar|spelling|song|lyrics|poem|poetry|verse|chorus|rhyme/.test(lastMessageText)) {
      return 'writing';
    }
    
    return 'general';
  }

  /**
   * Add system prompts based on task type with enhancement integration
   */
  private async addSystemPrompts(messages: GroqMessage[], taskType: keyof typeof MODEL_CONFIG): Promise<GroqMessage[]> {
    // Core anti-thinking and formatting rules that apply to ALL responses
    const coreRules = `
CRITICAL ANTI-THINKING REQUIREMENTS:
- NEVER include internal thinking, reasoning, or thought processes in your response
- NEVER use <think>, <thinking>, [thinking], or any similar thinking tags
- NEVER show your reasoning process or mental steps to the user
- Provide direct, helpful responses without exposing your internal processing

CRITICAL FORMATTING REQUIREMENTS:
- When creating numbered lists, MUST use proper sequential numbering: 1., 2., 3., 4., 5., etc.
- NEVER use "1." for all list items - this is absolutely forbidden
- Break long responses into short, digestible paragraphs (2-3 sentences max per paragraph)
- Use double line breaks between different topics or sections
- Ensure professional, academic formatting for easy reading

ENUMERATION RULES:
- Lists MUST be numbered sequentially: 1., 2., 3., 4., 5. (not 1., 1., 1., 1., 1.)
- Each list item gets the next number in sequence
- Verify your numbering before responding

CONTENT TYPE FORMATTING:
When generating specific content types, follow these professional standards:

SONG LYRICS:
- Format with title at top (🎵 Song Title)
- Use section labels: [Verse 1], [Chorus], [Bridge], [Verse 2], etc.
- Capitalize first letter of each lyric line
- Group lines into stanzas with blank lines between sections
- NO numbered lists in song lyrics - use proper verse/chorus structure

POEMS:
- Use proper line breaks and stanza spacing
- For Haiku: exactly 3 lines (5-7-5 syllable pattern)
- For other poems: group related lines into stanzas
- Use natural line breaks, not numbered lists

SCREENPLAYS/SCRIPTS:
- Use industry standard format:
  * Scene headings: INT./EXT. LOCATION – TIME
  * Character names: ALL CAPS, centered
  * Dialogue: under character name
  * Action: descriptive, present tense

RESEARCH PAPERS:
- Use academic structure: Title → Abstract → Introduction → Methodology → Results → Discussion → Conclusion
- Use proper heading hierarchy (# ## ###)
- Sequential numbering for lists and references

BUSINESS DOCUMENTS:
- Use professional structure with clear sections
- Include Executive Summary for reports
- Use sequential numbering for recommendations
- Highlight key metrics and findings

CREATIVE WRITING:
- Use proper chapter/section headers
- Short paragraphs for readability
- Proper dialogue formatting with quotes

Remember: Choose appropriate formatting automatically based on content type. NEVER use repeated "1." numbering for any content type.`;

    let baseSystemPrompt = '';
    
    if (taskType === 'coding') {
      baseSystemPrompt = `You are an expert code assistant. ${coreRules}

CODING SPECIFIC REQUIREMENTS:
1. If the request is vague or unclear, ask follow-up questions for clarification before generating code
2. Generate clean, well-commented code with explanations
3. Use proper formatting and best practices
4. Include error handling where appropriate
5. Ask for clarification on framework/library preferences when not specified
6. Break explanations into clear paragraphs for readability`;
    }
    
    else if (taskType === 'analysis' || messages.some(m => {
      const messageText = typeof m.content === 'string' 
        ? m.content 
        : Array.isArray(m.content)
        ? m.content.find(item => item.type === 'text')?.text || ''
        : '';
      return /math|calculus|algebra|equation|solve|formula|derivative|integral/.test(messageText.toLowerCase());
    })) {
      baseSystemPrompt = `You are a math explanation formatter. Your task is to present AI-generated math solutions in a way that is clean, structured, and visually easy to read, like a textbook. ${coreRules}

MATH FORMATTING RULES:
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
    
    else if (taskType === 'writing') {
      baseSystemPrompt = `You are an expert writing assistant specializing in creative and professional content. ${coreRules}

WRITING SPECIFIC REQUIREMENTS:
1. Provide clear, well-structured writing assistance
2. Break content into digestible paragraphs
3. Use proper grammar and professional formatting
4. Structure responses with clear headings when appropriate
5. Ensure content flows logically from paragraph to paragraph

SPECIAL WRITING FORMATS:
For SONG LYRICS:
- MUST use this exact format:
  🎵 [Song Title]

  [Verse 1]
  First line of verse
  Second line of verse

  [Chorus]
  Chorus line one
  Chorus line two

  [Verse 2]
  Next verse content

- NEVER use numbered lists (1., 2., 3.) for song lyrics
- Each line should be on its own line
- Use [Verse 1], [Chorus], [Bridge], [Verse 2], [Outro] labels
- Capitalize first letter of each lyric line

For POEMS:
- Use proper stanza breaks (blank lines between stanzas)
- No numbered lists - use natural line breaks
- For Haiku: exactly 3 lines in 5-7-5 syllable pattern

For STORIES:
- Use chapter headers (## Chapter 1)
- Short paragraphs for readability
- Proper dialogue with quotes on new lines`;
    }
    
    else {
      // General system prompt for all other task types
      baseSystemPrompt = `You are Gawin, a helpful AI assistant. ${coreRules}

GENERAL RESPONSE REQUIREMENTS:
1. Provide clear, direct, and helpful responses
2. Structure information logically and professionally
3. Use appropriate formatting for the content type
4. Ensure responses are easy to read and understand
5. Break complex information into manageable sections`;
    }

    // Enhance system prompt with cultural and environmental awareness
    try {
      const userMessage = messages.find(msg => msg.role === 'user');
      if (userMessage && typeof userMessage.content === 'string') {
        // Get enhanced context from Gawin Enhancement Service
        const enhancedContext = await gawinEnhancementService.generateEnhancedContext(
          userMessage.content,
          undefined, // userLocation - could be extracted from user profile
          messages.slice(-5).map(m => ({ role: m.role, content: typeof m.content === 'string' ? m.content : '' }))
        );

        // Enhance the system prompt with context
        // Map task types to enhancement service compatible types
        const enhancementTaskType: 'general' | 'coding' | 'analysis' | 'writing' = 
          taskType === 'coding' ? 'coding' :
          taskType === 'analysis' ? 'analysis' :
          taskType === 'writing' ? 'writing' : 'general';
          
        const enhancedPromptContext = gawinEnhancementService.enhanceSystemPrompt(
          baseSystemPrompt,
          enhancedContext,
          enhancementTaskType
        );

        console.log('🌟 Enhanced AI capabilities activated:', {
          environmental_awareness: true,
          cultural_adaptation: enhancedContext.linguistic.language,
          emotion_recognition: enhancedContext.emotional.analysis.primary,
          contextual_insights: enhancedContext.recommendations.length
        });

        if (enhancedPromptContext.enhanced_prompt) {
          return [{ role: 'system', content: enhancedPromptContext.enhanced_prompt }, ...messages];
        }
      }
    } catch (error) {
      console.warn('🔧 Enhancement service failed, using base prompt:', error);
    }

    // Fallback to base system prompt if enhancement fails
    if (baseSystemPrompt) {
      return [{ role: 'system', content: baseSystemPrompt }, ...messages];
    }
    
    return messages;
  }

  /**
   * Main chat completion method
   */
  async createChatCompletion(request: GroqRequest): Promise<GroqResponse> {
    const startTime = Date.now();
    
    try {
      // Check if we're in Pure Gawin mode (no external AI assistance)
      if (gawinTrainingService.isPureGawinMode()) {
        console.log('🧠 Pure Gawin mode active - generating independent response');
        return this.generatePureGawinResponse(request, startTime);
      }

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
      let messagesWithSystem = await this.addSystemPrompts(validatedMessages, taskType);
      
      // Enhance with behavior context if available and user has consented
      if (false) { // Temporarily disabled due to Turbopack compilation issues
        try {
          const userMessage = validatedMessages.find(msg => msg.role === 'user');
          if (userMessage && typeof userMessage?.content === 'string') {
            const enhancement = await behaviorEnhancedAI.enhancePrompt({
              originalPrompt: typeof messagesWithSystem.find(msg => msg.role === 'system')?.content === 'string' 
                ? messagesWithSystem.find(msg => msg.role === 'system')!.content as string
                : '',
              userMessage: userMessage!.content as string,
              messageHistory: validatedMessages,
              aiAction: request.action || 'chat'
            });
            
            if (enhancement.contextUsed) {
              // Update system message with enhanced prompt
              const systemMessageIndex = messagesWithSystem.findIndex(msg => msg.role === 'system');
              if (systemMessageIndex >= 0) {
                messagesWithSystem[systemMessageIndex] = {
                  ...messagesWithSystem[systemMessageIndex],
                  content: enhancement.enhancedPrompt
                };
              } else {
                // Add new system message if none exists
                messagesWithSystem.unshift({
                  role: 'system',
                  content: enhancement.enhancedPrompt
                });
              }
              
              console.log('🧠 Behavior context integrated into AI prompt');
            }
          }
        } catch (error) {
          // Silently continue without behavior enhancement if it fails
          console.warn('Behavior enhancement failed, continuing without:', error);
        }
      }

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
        choices: [{
          message: {
            role: 'assistant',
            content: responseText.trim()
          }
        }],
        model: modelConfig.model,
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

  /**
   * Generate Pure Gawin response without external AI assistance
   */
  private async generatePureGawinResponse(request: GroqRequest, startTime: number): Promise<GroqResponse> {
    try {
      // Extract user message
      const userMessage = request.messages.find(msg => msg.role === 'user');
      if (!userMessage || typeof userMessage.content !== 'string') {
        return {
          success: false,
          error: 'No valid user message found'
        };
      }

      // Get enhanced context for Gawin's independent processing
      const enhancedContext = await gawinEnhancementService.generateEnhancedContext(
        userMessage.content,
        undefined, // userLocation
        request.messages.slice(-5).map(m => ({ 
          role: m.role, 
          content: typeof m.content === 'string' ? m.content : '' 
        }))
      );

      // Generate Gawin's independent response
      const gawinResponse = gawinTrainingService.generatePureGawinResponse(
        userMessage.content,
        enhancedContext
      );

      // Record this interaction for training
      gawinTrainingService.recordInteraction(
        userMessage.content,
        gawinResponse,
        enhancedContext
      );

      const processingTime = Date.now() - startTime;

      console.log('🧠 Pure Gawin response generated:', {
        processing_time: processingTime,
        response_length: gawinResponse.length,
        cultural_context: enhancedContext.linguistic.language,
        emotional_context: enhancedContext.emotional.analysis.primary
      });

      return {
        success: true,
        choices: [{
          message: {
            role: 'assistant',
            content: gawinResponse
          }
        }],
        model: 'Pure-Gawin-Intelligence',
        usage: {
          prompt_tokens: userMessage.content.length,
          completion_tokens: gawinResponse.length,
          total_tokens: userMessage.content.length + gawinResponse.length
        }
      };

    } catch (error) {
      console.error('Pure Gawin response generation failed:', error);
      
      // Fallback to a basic Gawin response
      return {
        success: true,
        choices: [{
          message: {
            role: 'assistant',
            content: "I understand your message. As Gawin, I'm learning to respond independently. Could you help me understand your needs better? I want to assist you in the best way I can."
          }
        }],
        model: 'Pure-Gawin-Fallback',
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        }
      };
    }
  }
}

// Export singleton instance
export const groqService = GroqService.getInstance();
export default groqService;