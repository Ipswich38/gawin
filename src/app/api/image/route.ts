import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { prompt, provider = 'pollinations', ...options } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    let response;

    switch (provider) {
      case 'pollinations':
        // Pollinations AI - Free service
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
        response = await axios.get(pollinationsUrl, {
          responseType: 'arraybuffer',
          timeout: 30000,
        });
        
        return new NextResponse(response.data, {
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000',
          },
        });

      case 'deepai':
        if (!process.env.DEEPAI_API_KEY) {
          return NextResponse.json(
            { error: 'DeepAI API key not configured' },
            { status: 500 }
          );
        }

        const formData = new FormData();
        formData.append('text', prompt);

        response = await axios.post(
          'https://api.deepai.org/api/text2img',
          formData,
          {
            headers: {
              'Api-Key': process.env.DEEPAI_API_KEY,
            },
            timeout: 30000,
          }
        );

        return NextResponse.json(response.data);

      default:
        return NextResponse.json(
          { error: 'Unsupported image provider' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Image generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate image',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Image generation API endpoint - use POST method',
      supportedProviders: ['pollinations', 'deepai']
    },
    { status: 405 }
  );
}