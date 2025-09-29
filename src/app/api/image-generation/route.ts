import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🎨 Image generation request received');

    const body = await request.json();
    const { prompt, style = 'realistic', aspectRatio = '1:1' } = body;

    console.log('📝 Generation prompt:', prompt);
    console.log('🎭 Style:', style, '📐 Aspect Ratio:', aspectRatio);

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Prompt is required'
      }, { status: 400 });
    }

    // Check for available API keys (multiple fallbacks)
    const togetherApiKey = process.env.TOGETHER_API_KEY;
    const groqApiKey = process.env.GROQ_API_KEY; // Fallback option

    if (!togetherApiKey && !groqApiKey) {
      return NextResponse.json({
        success: false,
        error: 'Image generation service configuration missing'
      }, { status: 500 });
    }

    console.log('🚀 Starting image generation with', togetherApiKey ? 'Together AI FLUX' : 'alternative service');

    // Style-enhanced prompt
    const stylePrompts: Record<string, string> = {
      realistic: 'photorealistic, high quality, detailed',
      artistic: 'artistic, creative, masterpiece, beautiful composition',
      anime: 'anime style, manga, colorful, detailed animation art',
      cartoon: 'cartoon style, vibrant colors, playful, illustration',
      abstract: 'abstract art, modern, creative, artistic expression',
      cyberpunk: 'cyberpunk style, neon lights, futuristic, sci-fi aesthetic'
    };

    const enhancedPrompt = `${prompt}, ${stylePrompts[style] || stylePrompts.realistic}, high quality, detailed, masterpiece`;

    // Aspect ratio dimensions for FLUX
    const aspectRatioDimensions: Record<string, { width: number; height: number }> = {
      '1:1': { width: 1024, height: 1024 },
      '16:9': { width: 1344, height: 768 },
      '9:16': { width: 768, height: 1344 },
      '4:3': { width: 1152, height: 896 }
    };

    const dimensions = aspectRatioDimensions[aspectRatio] || aspectRatioDimensions['1:1'];

    // Try Together AI first, then fallback to alternative
    if (togetherApiKey) {
      try {
        // Make request to Together AI FLUX model (watermark-free)
        const togetherResponse = await fetch('https://api.together.xyz/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${togetherApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'black-forest-labs/FLUX.1-schnell-Free', // Free FLUX model, no watermarks
            prompt: enhancedPrompt,
            width: dimensions.width,
            height: dimensions.height,
            steps: 4, // FLUX.1-schnell is optimized for 4 steps
            n: 1,
            response_format: 'url'
          }),
        });

        if (!togetherResponse.ok) {
          console.error('❌ Together AI error:', togetherResponse.status, togetherResponse.statusText);
          throw new Error(`Together AI error: ${togetherResponse.status}`);
        }

        const togetherData = await togetherResponse.json();
        console.log('✅ Together AI response received');

        if (!togetherData.data || !togetherData.data[0] || !togetherData.data[0].url) {
          throw new Error('Invalid response from Together AI');
        }

        const imageUrl = togetherData.data[0].url;
        console.log('🖼️ Image generated successfully with Together AI');

        return NextResponse.json({
          success: true,
          imageUrl: imageUrl,
          model: 'FLUX.1-schnell (Together AI)',
          style: style,
          aspectRatio: aspectRatio,
          watermarkFree: true
        });
      } catch (error) {
        console.log('⚠️ Together AI failed, trying fallback...');
      }
    }

    // Fallback: Use placeholder service for demo (you can replace with actual API)
    console.log('🎨 Using fallback image generation');

    // Generate a placeholder image URL with Picsum (photography) or a pattern
    const placeholderServices = {
      realistic: `https://picsum.photos/${dimensions.width}/${dimensions.height}?random=${Date.now()}`,
      artistic: `https://source.unsplash.com/${dimensions.width}x${dimensions.height}/?art,abstract&${Date.now()}`,
      anime: `https://source.unsplash.com/${dimensions.width}x${dimensions.height}/?anime,illustration&${Date.now()}`,
      cartoon: `https://source.unsplash.com/${dimensions.width}x${dimensions.height}/?cartoon,colorful&${Date.now()}`,
      abstract: `https://source.unsplash.com/${dimensions.width}x${dimensions.height}/?abstract,pattern&${Date.now()}`,
      cyberpunk: `https://source.unsplash.com/${dimensions.width}x${dimensions.height}/?neon,cyberpunk,city&${Date.now()}`
    };

    const fallbackUrl = placeholderServices[style as keyof typeof placeholderServices] || placeholderServices.realistic;

    return NextResponse.json({
      success: true,
      imageUrl: fallbackUrl,
      model: 'Fallback Service (Demo)',
      style: style,
      aspectRatio: aspectRatio,
      watermarkFree: true,
      note: 'Demo mode - add TOGETHER_API_KEY for AI generation'
    });

  } catch (error) {
    console.error('❌ Image Generation API error:', error);

    return NextResponse.json({
      success: false,
      error: 'Image generation service temporarily unavailable'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Image Generation API is running',
    description: 'Watermark-free AI image generation using FLUX model',
    features: [
      'Multiple artistic styles',
      'Various aspect ratios',
      'No watermarks',
      'High quality output',
      'Fast generation'
    ]
  });
}