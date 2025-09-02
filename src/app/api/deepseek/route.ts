import { NextRequest, NextResponse } from 'next/server';
import { deepseekService } from '@/lib/services/deepseekService';
import { databaseService } from '@/lib/services/databaseService';

export async function POST(request: NextRequest) {
  try {
    const { messages, module, action, metadata } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get current user (you might want to implement proper auth middleware)
    const user = await databaseService.getCurrentUser();
    
    // Handle specific actions
    let result;
    
    switch (action) {
      case 'generate_code':
        if (!metadata?.problem) {
          return NextResponse.json(
            { error: 'Problem statement is required for code generation' },
            { status: 400 }
          );
        }
        result = await deepseekService.generateCodeSolution(
          metadata.problem,
          metadata.language || 'python',
          metadata.difficulty || 'beginner'
        );
        break;

      case 'explain_ai':
        if (!metadata?.concept) {
          return NextResponse.json(
            { error: 'Concept is required for AI explanation' },
            { status: 400 }
          );
        }
        result = await deepseekService.explainAIConcept(
          metadata.concept,
          metadata.level || 'beginner'
        );
        break;

      case 'chat':
      default:
        result = await deepseekService.chat(messages, module || 'general');
        break;
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to process request' },
        { status: 500 }
      );
    }

    // Record usage if user is logged in and usage data exists
    if (user && 'usage' in result && result.usage) {
      await databaseService.recordUsage(
        user.id,
        'chat',
        1, // credit cost - you might want to make this dynamic based on token usage
        {
          module: module || 'general',
          action,
          tokens_used: result.usage.total_tokens,
          model: 'deepseek-r1'
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
      ...('usage' in result && result.usage ? { usage: result.usage } : {})
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