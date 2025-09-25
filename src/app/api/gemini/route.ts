import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GawinConversationEngine } from '@/lib/services/gawinConversationEngine';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Create conversation engine for context
const conversationEngine = new GawinConversationEngine();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      messages,
      model = 'gemini-1.5-flash',
      temperature = 0.7,
      maxTokens = 2048,
      systemPrompt,
      userMessage
    } = body;

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'Google AI API key not configured' },
        { status: 500 }
      );
    }

    // Get the Gemini model
    const geminiModel = genAI.getGenerativeModel({
      model: model,
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: maxTokens,
        topP: 0.85,
        topK: 40,
      }
    });

    let prompt = '';
    let conversationHistory = [];

    // Handle different input formats
    if (messages && Array.isArray(messages)) {
      // OpenAI-style messages format
      conversationHistory = messages;

      // Generate Filipino-aware system prompt if not provided
      if (!systemPrompt) {
        const context = await conversationEngine.analyzeContext(
          messages[messages.length - 1]?.content || '',
          messages
        );

        const generatedSystemPrompt = conversationEngine.generateSystemPrompt(context, messages);
        prompt = generatedSystemPrompt + '\n\n';
      } else {
        prompt = systemPrompt + '\n\n';
      }

      // Add conversation history
      messages.forEach((msg: any) => {
        if (msg.role === 'system') {
          // System messages already included in prompt
          return;
        }
        prompt += `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}\n\n`;
      });

    } else if (userMessage) {
      // Direct message format
      conversationHistory = [{ role: 'user', content: userMessage }];

      // Generate Filipino-aware system prompt
      const context = await conversationEngine.analyzeContext(userMessage, []);
      const generatedSystemPrompt = conversationEngine.generateSystemPrompt(context, []);

      prompt = generatedSystemPrompt + '\n\nHuman: ' + userMessage + '\n\nAssistant: ';
    } else {
      return NextResponse.json(
        { error: 'Invalid request format. Provide either messages array or userMessage.' },
        { status: 400 }
      );
    }

    console.log('🤖 Sending request to Gemini API...');
    console.log('📝 Model:', model);
    console.log('🌡️ Temperature:', temperature);
    console.log('📊 Max Tokens:', maxTokens);

    // Generate response with Gemini
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    console.log('✅ Gemini API response received');
    console.log('📝 Response length:', text.length, 'characters');

    // Update conversation memory
    if (userMessage) {
      const context = await conversationEngine.analyzeContext(userMessage, conversationHistory);
      conversationEngine.updateMemory(userMessage, text, context);
    }

    // Return response in OpenAI-compatible format
    return NextResponse.json({
      id: `gemini-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: text
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: Math.ceil(prompt.length / 4), // Rough estimate
        completion_tokens: Math.ceil(text.length / 4),
        total_tokens: Math.ceil((prompt.length + text.length) / 4)
      },
      provider: 'google-gemini',
      conversation_context: conversationHistory.length > 0 ? {
        total_messages: conversationHistory.length,
        last_message_role: conversationHistory[conversationHistory.length - 1]?.role
      } : null
    });

  } catch (error: any) {
    console.error('❌ Gemini API Error:', error);

    // Handle specific Google AI errors
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        {
          error: 'Invalid Google AI API key',
          details: 'Please check your GOOGLE_AI_API_KEY environment variable'
        },
        { status: 401 }
      );
    }

    if (error.message?.includes('quota')) {
      return NextResponse.json(
        {
          error: 'Google AI quota exceeded',
          details: 'API quota has been exceeded. Please try again later.'
        },
        { status: 429 }
      );
    }

    if (error.message?.includes('safety')) {
      return NextResponse.json(
        {
          error: 'Content filtered by safety settings',
          details: 'The request was blocked by Google AI safety filters'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Gemini API request failed',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    service: 'Google AI Studio (Gemini) API',
    status: 'active',
    models: [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-1.0-pro'
    ],
    features: [
      'Filipino-aware conversation engine',
      'Context-aware responses',
      'Taglish support',
      'Cultural sensitivity',
      'Emotional intelligence'
    ],
    endpoint: '/api/gemini',
    method: 'POST',
    example_request: {
      messages: [
        { role: 'system', content: 'You are Gawin, a Filipino AI assistant.' },
        { role: 'user', content: 'Kumusta ka?' }
      ],
      model: 'gemini-1.5-flash',
      temperature: 0.7,
      maxTokens: 2048
    }
  });
}