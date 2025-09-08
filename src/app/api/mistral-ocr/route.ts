import { NextRequest, NextResponse } from 'next/server';
import { mistralOCRService, MistralOCRRequest } from '@/lib/services/mistralOCRService';
import { validationService } from '@/lib/services/validationService';

export async function POST(request: NextRequest) {
  // OCR functionality has been disabled
  return NextResponse.json({
    success: false,
    error: 'OCR functionality is currently disabled. File upload and processing features are not available.'
  }, { status: 503 });
}

// OCR service health check - currently disabled
export async function GET() {
  return NextResponse.json({
    success: false,
    data: {
      service: 'OCR & Vision Processing',
      status: 'disabled',
      message: 'OCR functionality has been disabled. File upload and processing features are not available.'
    }
  }, { status: 503 });
}