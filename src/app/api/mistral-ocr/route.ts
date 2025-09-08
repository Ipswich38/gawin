import { NextRequest, NextResponse } from 'next/server';
import { mistralOCRService, MistralOCRRequest } from '@/lib/services/mistralOCRService';
import { validationService } from '@/lib/services/validationService';

export async function POST(request: NextRequest) {
  try {
    const body: MistralOCRRequest = await request.json();
    
    // Validate request structure
    if (!body.messages && !body.document) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request: messages or document required'
      }, { status: 400 });
    }

    // Validation for text content
    if (body.messages && Array.isArray(body.messages)) {
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
    }

    console.log('🔍 Processing request with Mistral OCR...');
    const result = await mistralOCRService.processOCR(body);
    
    if (result.success) {
      console.log('✅ Mistral OCR processing successful');
    } else {
      console.log(`❌ Mistral OCR processing failed: ${result.error}`);
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Mistral OCR API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Mistral OCR processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Health check for Mistral OCR service
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        service: 'Mistral OCR & Vision Processing',
        features: [
          'World-class multilingual OCR (99%+ accuracy)',
          'Lightning fast processing (2,000 pages/minute)',
          'Document structure preservation',
          'Multi-language support (11+ languages)',
          'PDF and image processing',
          'Vision model integration (Pixtral Large)'
        ],
        models: {
          ocr: 'mistral-ocr-latest - Specialized OCR model',
          vision: 'pixtral-large-2411 - Advanced vision model'
        },
        limits: {
          maxFileSize: '20MB for PDFs, 5MB for images',
          maxPages: '1000',
          maxImages: '8 per request',
          supportedFormats: ['PNG', 'JPEG', 'WEBP', 'PDF', 'non-animated GIF']
        },
        pricing: 'Free trial available, then $1 per 1000 pages',
        status: mistralOCRService.isConfigured() ? 'configured' : 'api_key_required'
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Mistral OCR service health check failed'
    }, { status: 500 });
  }
}