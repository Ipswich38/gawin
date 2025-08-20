import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { messages, model = 'llama-3.1-sonar-large-128k-online', ...options } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        messages,
        model,
        ...options,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Perplexity API error:', error);
    
    if (error.response) {
      return NextResponse.json(
        { 
          error: 'Perplexity API error',
          details: error.response.data 
        },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to process Perplexity request',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Perplexity API endpoint - use POST method' },
    { status: 405 }
  );
}