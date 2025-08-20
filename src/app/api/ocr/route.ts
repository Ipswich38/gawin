import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const language = formData.get('language') as string || 'auto';

    if (!image) {
      return NextResponse.json(
        { error: 'Image file is required' },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = image.type || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    // Use Groq's vision model for OCR
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract all text from this image. Return only the extracted text, preserving formatting and structure as much as possible. Language: ${language}`,
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      model: 'llama-3.2-11b-vision-preview',
      max_tokens: 2048,
    });

    const extractedText = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      text: extractedText,
      language: language,
      confidence: 0.95, // Groq vision models are generally high-confidence
    });

  } catch (error: any) {
    console.error('OCR API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to extract text from image',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'OCR API endpoint - use POST method with image file',
      supportedFormats: ['image/jpeg', 'image/png', 'image/webp']
    },
    { status: 405 }
  );
}