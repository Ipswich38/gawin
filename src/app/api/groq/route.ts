import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Initialize Groq with server-side API key
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, model = 'llama-3.3-70b-versatile', ...options } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model,
      ...options,
    });

    return NextResponse.json(chatCompletion);
  } catch (error: any) {
    console.error('Groq API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process AI request',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Groq API endpoint - use POST method' },
    { status: 405 }
  );
}