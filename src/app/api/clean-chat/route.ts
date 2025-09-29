import { NextRequest, NextResponse } from 'next/server';

interface Message {
  text: string;
  isAI: boolean;
  timestamp: string;
}

interface BetaChatRequest {
  message: string;
  history?: Message[];
}

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Beta chat request received');
    const body: BetaChatRequest = await request.json();
    console.log('📝 Request body parsed:', { message: body.message, historyLength: body.history?.length });

    // Validate request
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Invalid message format'
      }, { status: 400 });
    }

    // Check for Groq API key
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'API configuration missing'
      }, { status: 500 });
    }

    // Build conversation history for context
    const messages = [
      {
        role: 'system',
        content: "You are Gawin, a helpful AI assistant. You are running in beta mode with a clean, simple interface. Be helpful, accurate, and conversational. Provide direct answers without unnecessary formatting. Keep responses clear and concise. Respond naturally and helpfully to the user's message."
      },
      // Add recent history for context (last 5 messages)
      ...(body.history || []).slice(-5).map(msg => ({
        role: msg.isAI ? 'assistant' : 'user',
        content: msg.text
      })),
      // Current user message
      { role: 'user', content: body.message }
    ];

    // Call Groq API directly with simple configuration
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1500,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      return NextResponse.json({
        success: false,
        error: 'AI service temporarily unavailable'
      }, { status: 503 });
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No response generated'
      }, { status: 500 });
    }

    const aiResponse = data.choices[0].message?.content || 'Sorry, I could not generate a response.';

    return NextResponse.json({
      success: true,
      response: aiResponse.trim(),
      model: 'llama-3.3-70b-versatile',
      usage: data.usage
    });

  } catch (error) {
    console.error('Clean chat API error:', error);

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'Clean Chat API is running',
    version: '1.0.0',
    features: ['Simple chat', 'Clean responses', 'Direct Groq API']
  });
}