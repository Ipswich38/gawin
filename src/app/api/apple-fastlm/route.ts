import { NextRequest, NextResponse } from 'next/server';
import { appleFastLMService, FastLMRequest } from '@/lib/services/appleFastLMService';
import { validationService } from '@/lib/services/validationService';

export async function POST(request: NextRequest) {
  try {
    const body: FastLMRequest = await request.json();
    
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
      const messageContent = typeof lastMessage.content === 'string' 
        ? lastMessage.content 
        : Array.isArray(lastMessage.content)
        ? lastMessage.content.find(item => item.type === 'text')?.text || ''
        : '';
      const validation = validationService.validateTextInput(messageContent);
      
      if (!validation.isValid) {
        return NextResponse.json({
          success: false,
          error: 'Content policy violation',
          details: validation.errors.join(', ')
        }, { status: 400 });
      }
    }

    // Check if request contains images (required for vision processing)
    const hasImages = body.messages.some(msg => 
      Array.isArray(msg.content) && 
      msg.content.some(item => item.type === 'image_url')
    );

    if (!hasImages) {
      return NextResponse.json({
        success: false,
        error: 'Apple FastLM vision processing requires image content'
      }, { status: 400 });
    }

    console.log('🍎 Processing vision request with Apple FastLM...');
    const result = await appleFastLMService.processVision(body);
    
    if (result.success) {
      console.log('✅ Apple FastLM vision processing successful');
    } else {
      console.log(`❌ Apple FastLM vision processing failed: ${result.error}`);
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Apple FastLM API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Apple FastLM processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Health check for Apple FastLM service
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        service: 'Apple FastLM Vision Processing',
        features: [
          'Advanced OCR and Text Extraction',
          'Multi-modal Image Understanding',
          'Real-time Vision Processing',
          'Apple Neural Engine Optimization',
          'High-accuracy Content Analysis',
          'Contextual Visual Understanding'
        ],
        models: [
          'apple-fastlm-vision: Specialized for image analysis and OCR',
          'apple-fastlm-general: General language processing'
        ],
        status: appleFastLMService.isConfigured() ? 'configured' : 'api_key_required',
        capabilities: {
          ocr: 'Advanced text extraction from images',
          imageAnalysis: 'Comprehensive visual content understanding',
          multiModal: 'Combined text and image processing',
          realTime: 'Optimized for real-time processing'
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Apple FastLM service health check failed'
    }, { status: 500 });
  }
}