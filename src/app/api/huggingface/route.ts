import { NextRequest, NextResponse } from 'next/server';
import { huggingFaceService, HuggingFaceRequest } from '@/lib/services/huggingFaceService';
import { validationService } from '@/lib/services/validationService';

export async function POST(request: NextRequest) {
  try {
    const body: HuggingFaceRequest = await request.json();
    
    // Validate request structure
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request: messages array is required'
      }, { status: 400 });
    }

    // Validation pre-check
    const lastMessage = body.messages[body.messages.length - 1];
    if (lastMessage?.role === 'user') {
      const validation = validationService.validateTextInput(lastMessage.content);
      
      if (!validation.isValid) {
        return NextResponse.json({
          success: false,
          error: 'Content policy violation',
          details: validation.errors.join(', ')
        }, { status: 400 });
      }
    }

    // Process request with Hugging Face
    const result = await huggingFaceService.createChatCompletion(body);
    
    // Return response
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { 
        status: result.error?.includes('API key') ? 500 : 400 
      });
    }

  } catch (error) {
    console.error('Hugging Face API route error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Handle image generation requests
export async function PUT(request: NextRequest) {
  try {
    const { prompt, options } = await request.json();
    
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Invalid request: prompt is required'
      }, { status: 400 });
    }

    // Validation check for image prompts
    const validation = validationService.validateTextInput(prompt);
    
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Content policy violation',
        details: validation.errors.join(', ')
      }, { status: 400 });
    }

    // Generate image
    const result = await huggingFaceService.generateImage(prompt, options);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Hugging Face image generation error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Get available models and health status
export async function GET() {
  try {
    const models = huggingFaceService.getAvailableModels();
    const health = await huggingFaceService.healthCheck();
    
    return NextResponse.json({
      success: true,
      data: {
        models,
        health,
        service: 'Hugging Face Pro',
        features: [
          'STEM/Analysis: DeepSeek-R1-Distill-Qwen-32B',
          'Coding: DeepSeek-Coder-V2-Instruct-236B',
          'Writing: Qwen2.5-72B-Instruct', 
          'Image Generation: FLUX.1-dev'
        ]
      }
    });

  } catch (error) {
    console.error('Hugging Face health check error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}