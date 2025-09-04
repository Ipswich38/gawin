import { NextRequest, NextResponse } from 'next/server';
import { pollinationsService } from '@/lib/services/pollinationsService';
import { validationService } from '@/lib/services/validationService';

export async function POST(request: NextRequest) {
  try {
    const { prompt, width, height, model, seed } = await request.json();
    
    // Validate request
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

    // Generate image using Pollinations AI
    const result = await pollinationsService.generateImage({
      prompt,
      width,
      height,
      model,
      seed
    });
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          image_url: result.data?.image_url,
          model_used: 'Gawin AI',
          service: 'Pollinations AI',
          processing_time: result.data?.processing_time
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Image generation failed'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Image generation API route error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Get available models and service status
export async function GET() {
  try {
    const models = pollinationsService.getAvailableModels();
    const health = await pollinationsService.healthCheck();
    
    return NextResponse.json({
      success: true,
      data: {
        service: 'Gawin AI Image Generator',
        provider: 'Pollinations AI',
        models,
        health,
        features: [
          'High-quality image generation',
          'Multiple art styles available',
          'Fast processing times',
          'No API key required',
          'FLUX-powered generation'
        ]
      }
    });

  } catch (error) {
    console.error('Image service health check error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}