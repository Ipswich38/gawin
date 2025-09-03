import { NextRequest, NextResponse } from 'next/server';
import { deepseekService } from '@/lib/services/deepseekService';
import { databaseService } from '@/lib/services/databaseService';

export async function POST(request: NextRequest) {
  try {
    const { messages, model } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get current user (you might want to implement proper auth middleware)
    const user = await databaseService.getCurrentUser();
    
    // Use DeepSeek service for chat completion
    const result = await deepseekService.createChatCompletion(
      messages,
      { model: model || 'deepseek-chat' }
    );

    if (!result.choices || result.choices.length === 0) {
      return NextResponse.json(
        { error: 'No response generated' },
        { status: 500 }
      );
    }

    // Record usage if user is logged in
    if (user && result.usage) {
      await databaseService.recordUsage(
        user.id,
        'chat',
        1, // credit cost - you might want to make this dynamic based on token usage
        {
          model: result.model || 'deepseek-chat',
          tokens_used: result.usage.total_tokens
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        response: result.choices[0].message.content,
        model: result.model,
        usage: result.usage
      }
    });

  } catch (error) {
    console.error('DeepSeek API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const health = await deepseekService.healthCheck();
    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      { status: 'offline', message: 'Health check failed' },
      { status: 500 }
    );
  }
}