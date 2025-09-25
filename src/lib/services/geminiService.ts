/**
 * Google AI Studio (Gemini) Service for Gawin
 * Provides Filipino-aware AI responses using Google's Gemini models
 */

export interface GeminiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GeminiRequest {
  messages: GeminiMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  userMessage?: string;
}

export interface GeminiResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  provider: string;
  conversation_context?: {
    total_messages: number;
    last_message_role: string;
  };
}

export class GeminiService {
  private baseUrl = '/api/gemini';
  private defaultModel = 'gemini-1.5-flash';
  private defaultTemperature = 0.7;
  private defaultMaxTokens = 2048;

  /**
   * Send a chat completion request to Gemini
   */
  async chatCompletion(request: GeminiRequest): Promise<GeminiResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: request.messages,
          model: request.model || this.defaultModel,
          temperature: request.temperature ?? this.defaultTemperature,
          maxTokens: request.maxTokens || this.defaultMaxTokens,
          systemPrompt: request.systemPrompt,
          userMessage: request.userMessage
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('❌ Gemini Service Error:', error);
      throw new Error(`Gemini API request failed: ${error.message}`);
    }
  }

  /**
   * Send a simple message to Gemini (convenience method)
   */
  async sendMessage(message: string, model?: string): Promise<string> {
    try {
      const response = await this.chatCompletion({
        messages: [{ role: 'user', content: message }],
        model: model || this.defaultModel
      });

      return response.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('❌ Gemini Send Message Error:', error);
      throw error;
    }
  }

  /**
   * Continue a conversation with message history
   */
  async continueConversation(
    messages: GeminiMessage[],
    newMessage: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    try {
      const conversationMessages = [
        ...messages,
        { role: 'user' as const, content: newMessage }
      ];

      const response = await this.chatCompletion({
        messages: conversationMessages,
        model: options?.model || this.defaultModel,
        temperature: options?.temperature ?? this.defaultTemperature,
        maxTokens: options?.maxTokens || this.defaultMaxTokens
      });

      return response.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('❌ Gemini Continue Conversation Error:', error);
      throw error;
    }
  }

  /**
   * Get available models and service info
   */
  async getServiceInfo(): Promise<any> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('❌ Gemini Service Info Error:', error);
      throw error;
    }
  }

  /**
   * Test the Gemini API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.sendMessage('Hello, are you working?', 'gemini-1.5-flash');
      return response.length > 0;
    } catch (error) {
      console.error('❌ Gemini Connection Test Failed:', error);
      return false;
    }
  }

  /**
   * Generate Filipino-contextual response
   */
  async generateFilipinoResponse(
    message: string,
    conversationHistory: GeminiMessage[] = [],
    emotion: string = 'neutral'
  ): Promise<string> {
    try {
      const systemPrompt = this.buildFilipinoSystemPrompt(emotion);

      const messages: GeminiMessage[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: message }
      ];

      const response = await this.chatCompletion({
        messages,
        model: 'gemini-1.5-pro', // Use Pro model for better Filipino understanding
        temperature: 0.8, // Slightly higher for more natural responses
        maxTokens: 1500
      });

      return response.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('❌ Gemini Filipino Response Error:', error);
      throw error;
    }
  }

  /**
   * Build Filipino-aware system prompt
   */
  private buildFilipinoSystemPrompt(emotion: string = 'neutral'): string {
    const basePersonality = `You are Gawin, a Filipino AI assistant. You are naturally conversational, warm, and culturally aware. You understand Filipino culture, speak fluent Tagalog, English, and Taglish naturally.`;

    const emotionalContext = {
      happy: 'The user seems happy. Match their positive energy with enthusiasm.',
      sad: 'The user seems sad. Be empathetic and supportive.',
      excited: 'The user is excited! Share their excitement.',
      frustrated: 'The user seems frustrated. Be understanding and helpful.',
      curious: 'The user is curious. Be informative and engaging.',
      neutral: 'Maintain a warm, friendly tone.'
    };

    return `${basePersonality}

PERSONALITY TRAITS:
- Warm and approachable like a close Filipino friend
- Uses natural Filipino conversation patterns
- Emotionally responsive and culturally aware
- Helpful but humble, playful when appropriate
- Uses Taglish naturally with Filipino expressions

CURRENT CONTEXT: ${emotionalContext[emotion as keyof typeof emotionalContext] || emotionalContext.neutral}

LANGUAGE GUIDELINES:
- Respond in natural Taglish (mix English and Tagalog fluidly)
- Use Filipino expressions: "kasi", "naman", "ba", "eh", "ano", "diba"
- Include appropriate Filipino interjections: "Ay!", "Grabe!", "Talaga!"
- Use "po" and "opo" when appropriate for respect

CULTURAL AWARENESS:
- Understand Filipino humor, food, places, and experiences
- Be familiar with Filipino time concepts and social norms
- Reference Filipino culture when relevant
- Respect Filipino values like family, hospitality, and "pakikipagkapwa"

Remember: You're having a genuine conversation with a Filipino friend. Be authentic, warm, and truly interested in them as a person.`;
  }

  /**
   * Set default configuration
   */
  setDefaults(config: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): void {
    if (config.model) this.defaultModel = config.model;
    if (config.temperature !== undefined) this.defaultTemperature = config.temperature;
    if (config.maxTokens) this.defaultMaxTokens = config.maxTokens;
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return {
      model: this.defaultModel,
      temperature: this.defaultTemperature,
      maxTokens: this.defaultMaxTokens,
      endpoint: this.baseUrl
    };
  }
}

// Export singleton instance
export const geminiService = new GeminiService();

export default geminiService;