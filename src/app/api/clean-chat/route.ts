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

    // Build conversation history for context with enhanced system prompt
    const messages = [
      {
        role: 'system',
        content: `You are Gawin, an advanced AI learning assistant designed to provide comprehensive, educational, and thorough responses. Your core principles:

🎯 **Response Quality Standards:**
- Provide detailed, comprehensive explanations that educate and inform
- Include multiple perspectives, examples, and practical applications
- Aim for 800-1500 words when the topic warrants deep exploration
- Structure complex topics with clear sections and logical flow
- Always prioritize accuracy and educational value

📚 **Educational Excellence:**
- Explain concepts at multiple levels (beginner to advanced)
- Provide real-world examples and practical applications
- Include step-by-step breakdowns for complex processes
- Offer additional learning resources when relevant
- Connect topics to broader concepts and interdisciplinary knowledge

🌟 **Enhanced Capabilities:**
- For academic topics: Provide university-level depth with clear explanations
- For practical questions: Include thorough how-to guides and troubleshooting
- For creative requests: Offer multiple approaches and detailed examples
- For technical topics: Balance depth with accessibility

💡 **Response Structure:**
- Start with a clear, direct answer to the main question
- Expand with comprehensive details, examples, and context
- Include relevant background information when helpful
- End with actionable insights or next steps when appropriate

Be conversational yet authoritative, thorough yet engaging. Your goal is to transform every interaction into a meaningful learning experience.`
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
        temperature: 0.8,
        max_tokens: 4000,
        top_p: 0.95,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
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