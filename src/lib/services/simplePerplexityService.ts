import Groq from 'groq-sdk';

export interface SimplePerplexityResponse {
  content: string;
  timestamp: Date;
  modelUsed: string;
  searchPerformed: boolean;
  reasoning?: string;
  responseTime?: number;
}

class SimplePerplexityService {
  private groq: Groq;
  private readonly GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

  constructor() {
    console.log('🔧 SimplePerplexityService initializing...');
    console.log('🔑 API Key check:', {
      exists: !!this.GROQ_API_KEY,
      length: this.GROQ_API_KEY?.length,
      first6: this.GROQ_API_KEY?.substring(0, 6)
    });
    
    this.groq = new Groq({
      apiKey: this.GROQ_API_KEY,
      dangerouslyAllowBrowser: true
    });
    
    console.log('✅ SimplePerplexityService initialized successfully');
  }

  async generateAnswer(query: string): Promise<SimplePerplexityResponse> {
    const startTime = Date.now();
    console.log(`🤖 SimplePerplexity: Processing "${query}"`);
    
    try {
      const prompt = `You are Gawyn, a helpful AI assistant. Answer the user's question directly and clearly.

User Question: ${query}

Provide a helpful, accurate response:`;

      console.log('📤 Sending request to Groq API...');
      
      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama3-8b-8192',
        temperature: 0.3,
        max_tokens: 512,
        top_p: 0.9,
      });

      console.log('📥 Received response from Groq API');
      
      const content = completion.choices[0]?.message?.content || 'No response generated';
      const responseTime = Date.now() - startTime;
      
      console.log(`✅ Response generated in ${responseTime}ms`);

      return {
        content,
        timestamp: new Date(),
        modelUsed: 'llama3-8b-8192-simple',
        searchPerformed: false,
        reasoning: `Simple processing: Direct API call to Groq in ${responseTime}ms`,
        responseTime
      };

    } catch (error) {
      console.error('❌ SimplePerplexity error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      return {
        content: `I apologize, but I encountered an error: ${error.message}. Please check the console for more details.`,
        timestamp: new Date(),
        modelUsed: 'error-fallback',
        searchPerformed: false,
        reasoning: `Error occurred: ${error.message}`,
        responseTime: Date.now() - startTime
      };
    }
  }

  isConfigured(): boolean {
    return !!this.GROQ_API_KEY;
  }
}

export const simplePerplexityService = new SimplePerplexityService();