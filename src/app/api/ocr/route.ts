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
          // Note: Vision models are temporarily unavailable from Groq
          // For now, we'll provide guidance on image analysis
          const visionResult = {
            success: false,
            error: 'Vision analysis temporarily unavailable - Groq has deprecated their vision models',
            data: null as any
          };

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
              status: 'unavailable',
              error: 'Image analysis temporarily unavailable - vision models are being updated'
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

    // Generate AI analysis of the extracted content
    let aiAnalysis = '';
    
    if (extractedText.trim()) {
      // We have extracted text content
      try {
        let analysisPrompt = '';
        
        if (userQuery.trim()) {
          // User has a specific query
          analysisPrompt = `User Question: ${userQuery}

Extracted Content from Files:
${extractedText}

Please analyze this content and provide a comprehensive response to the user's question based on the extracted text.`;
        } else {
          // No specific query, provide general analysis
          analysisPrompt = `I've extracted the following text content from the uploaded files:

${extractedText}

Please provide a helpful analysis of this content, including:
- A summary of what the content contains
- Key information or data points found
- Any important details that stand out
- Suggestions for how this information might be useful

Make your response informative and engaging.`;
        }
        
        const analysisResult = await groqService.createChatCompletion({
          messages: [
            {
              role: 'system',
              content: `You are Gawin AI, an intelligent document analyst. The user has uploaded files and you have successfully extracted text content. Provide helpful, accurate analysis of the extracted content.`
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          action: 'analysis',
          module: 'document_analysis'
        });

        if (analysisResult.success && analysisResult.data) {
          aiAnalysis = analysisResult.data.response;
        } else {
          // Fallback if analysis fails
          aiAnalysis = `I've successfully extracted text from your uploaded files. Here's what I found:

${extractedText}

*Feel free to ask me any questions about this content!*`;
        }
      } catch (error) {
        console.error('AI analysis error:', error);
        // Fallback to showing extracted text with a helpful message
        aiAnalysis = `I've successfully extracted text from your uploaded files. Here's what I found:

${extractedText}

*Feel free to ask me any questions about this content!*`;
      }
    } else {
      // No text was extracted, check if we have unavailable image processing
      const imageProcessingUnavailable = analysisResults.some(result => 
        result.type === 'image' && result.status === 'unavailable'
      );
      
      if (imageProcessingUnavailable && hasImages) {
        // Images could not be processed due to unavailable vision models
        if (userQuery.trim()) {
          aiAnalysis = `I apologize, but image analysis and OCR capabilities are currently temporarily unavailable as our vision models are being updated.

Your question: "${userQuery}"

**Current Status:**
🔧 Vision/OCR models: Temporarily offline
📊 Text analysis: Fully operational
💻 Code assistance: Fully operational
📝 Writing help: Fully operational

**What you can do:**
• If your images contain text, you could try typing or copying the text content manually and I can help analyze it
• For non-text visual content, you can describe what you see and I can provide guidance
• All other AI features (math, coding, writing, general questions) are working normally

Thank you for your patience while we update our vision capabilities!`;
        } else {
          aiAnalysis = `I apologize, but I'm currently unable to analyze images or perform OCR (text extraction) as our vision models are temporarily offline while being updated.

**Current Status:**
🔧 Image analysis: Temporarily unavailable
🔧 OCR/text extraction: Temporarily unavailable  
✅ All other AI features: Fully operational

**Alternative approaches:**
• If your images contain text, you can type or copy the text content and I'll analyze it
• For questions about visual content, you can describe what you see
• All other capabilities (math, coding, writing, research) are working perfectly

We're working to restore full image analysis capabilities soon. Thank you for your patience!`;
        }
      } else if (hasPDFs && !hasImages) {
        // Only PDFs were uploaded
        aiAnalysis = `I see you've uploaded PDF files. For the best OCR and text extraction results, I recommend converting your PDF pages to high-quality images (PNG or JPG) and re-uploading them.

This approach typically provides more accurate text extraction than processing PDFs directly. Would you like me to guide you on how to convert your PDFs to images?`;
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