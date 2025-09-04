import { NextRequest, NextResponse } from 'next/server';
import { groqService } from '@/lib/services/groqService';

// File type constraints
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const userQuery = formData.get('query') as string || '';

    // Validate file count
    if (files.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No files provided'
      }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({
        success: false,
        error: `Maximum ${MAX_FILES} files allowed`
      }, { status: 400 });
    }

    // Process each file
    const processedFiles = [];
    
    for (const file of files) {
      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return NextResponse.json({
          success: false,
          error: `Unsupported file type: ${file.type}. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`
        }, { status: 400 });
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({
          success: false,
          error: `File too large: ${file.name}. Maximum size: 10MB`
        }, { status: 400 });
      }

      // Convert file to base64
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mimeType = file.type;
      const dataUri = `data:${mimeType};base64,${base64}`;

      processedFiles.push({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUri,
        base64
      });
    }

    // Determine processing approach based on file types
    const hasImages = processedFiles.some(f => f.type.startsWith('image/'));
    const hasPDFs = processedFiles.some(f => f.type === 'application/pdf');

    let extractedText = '';
    let analysisResults = [];

    // Process images with Groq vision model
    if (hasImages) {
      for (const file of processedFiles.filter(f => f.type.startsWith('image/'))) {
        try {
          // Use Groq's vision model for OCR and image analysis
          const visionResult = await groqService.createChatCompletion({
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `Please analyze this image and extract all text content. If it contains:
- Documents: Extract all text accurately, maintaining structure
- Screenshots: Extract UI text, buttons, labels
- Handwritten notes: Convert handwritten text to typed text
- Charts/graphs: Describe the visual content and extract any text labels
- Educational content: Extract formulas, equations, and explanations
- Code: Extract and format code properly

Be thorough and accurate in your text extraction.`
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: file.dataUri
                    }
                  }
                ]
              }
            ],
            action: 'vision',
            module: 'ocr'
          });

          if (visionResult.success && visionResult.data) {
            extractedText += `\n--- Content from ${file.name} ---\n${visionResult.data.response}\n`;
            analysisResults.push({
              filename: file.name,
              type: 'image',
              status: 'success',
              extractedText: visionResult.data.response
            });
          } else {
            analysisResults.push({
              filename: file.name,
              type: 'image',
              status: 'error',
              error: visionResult.error || 'Failed to process image'
            });
          }
        } catch (error) {
          analysisResults.push({
            filename: file.name,
            type: 'image',
            status: 'error',
            error: 'Image processing failed'
          });
        }
      }
    }

    // For PDFs, we'll extract basic info and suggest users convert to images
    if (hasPDFs) {
      for (const file of processedFiles.filter(f => f.type === 'application/pdf')) {
        analysisResults.push({
          filename: file.name,
          type: 'pdf',
          status: 'info',
          message: 'PDF detected. For best results, please convert PDF pages to images and re-upload.'
        });
      }
    }

    // If user provided a query along with files, analyze the extracted content
    let aiAnalysis = '';
    if (extractedText.trim() && userQuery.trim()) {
      try {
        const analysisResult = await groqService.createChatCompletion({
          messages: [
            {
              role: 'system',
              content: `You are Gawin AI, an intelligent document analyst. The user has uploaded files and extracted the following text content. Analyze this content in relation to their question and provide helpful, accurate responses.`
            },
            {
              role: 'user',
              content: `User Question: ${userQuery}

Extracted Content from Files:
${extractedText}

Please analyze this content and provide a comprehensive response to the user's question based on the extracted text.`
            }
          ],
          action: 'analysis',
          module: 'document_analysis'
        });

        if (analysisResult.success && analysisResult.data) {
          aiAnalysis = analysisResult.data.response;
        }
      } catch (error) {
        console.error('AI analysis error:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        filesProcessed: files.length,
        extractedText: extractedText.trim(),
        analysisResults,
        aiAnalysis,
        hasUserQuery: !!userQuery.trim(),
        processing: {
          imagesProcessed: processedFiles.filter(f => f.type.startsWith('image/')).length,
          pdfsDetected: processedFiles.filter(f => f.type === 'application/pdf').length,
          totalSize: processedFiles.reduce((sum, f) => sum + f.size, 0)
        }
      }
    });

  } catch (error) {
    console.error('OCR API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'OCR processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Health check for OCR service
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        service: 'Gawin OCR & Document Analysis',
        features: [
          'Image OCR (JPEG, PNG, WebP)',
          'PDF Processing (with limitations)',
          'Handwriting Recognition',
          'Document Structure Preservation', 
          'Multi-file Processing (up to 5 files)',
          'AI-powered Content Analysis'
        ],
        limits: {
          maxFiles: MAX_FILES,
          maxFileSize: '10MB',
          allowedTypes: ALLOWED_FILE_TYPES
        },
        status: 'operational'
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'OCR service health check failed'
    }, { status: 500 });
  }
}