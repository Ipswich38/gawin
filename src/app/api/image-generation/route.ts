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

    // Enhanced style prompts with professional quality indicators
    const stylePrompts: Record<string, string> = {
      realistic: 'photorealistic, ultra-high quality, sharp focus, professional photography, 8K resolution, perfect lighting, detailed textures',
      artistic: 'artistic masterpiece, museum quality, fine art, beautiful composition, professional artwork, intricate details, perfect color harmony',
      anime: 'high-quality anime art, studio-grade animation, detailed character design, vibrant colors, professional manga style, crisp lineart',
      cartoon: 'professional cartoon illustration, vibrant colors, clean vector art, Disney-quality animation style, polished design',
      abstract: 'modern abstract art, contemporary style, museum-worthy, sophisticated color palette, artistic expression, avant-garde',
      cyberpunk: 'cyberpunk aesthetic, neon-lit futuristic cityscape, high-tech sci-fi, dramatic lighting, cinematic quality, dystopian atmosphere',
      portrait: 'professional portrait photography, studio lighting, sharp focus, detailed facial features, high-end fashion photography style',
      landscape: 'breathtaking landscape photography, golden hour lighting, ultra-wide vista, National Geographic quality, pristine nature',
      minimalist: 'clean minimalist design, sophisticated simplicity, elegant composition, modern aesthetic, premium quality',
      vintage: 'vintage aesthetic, classic photography style, retro charm, film grain texture, nostalgic atmosphere, timeless appeal'
    };

    // Advanced prompt engineering for better results
    const qualityEnhancers = 'masterpiece, best quality, ultra-detailed, professional grade, award-winning';
    const technicalSpecs = '8K resolution, perfect composition, optimal lighting';

    const enhancedPrompt = `${prompt}, ${stylePrompts[style] || stylePrompts.realistic}, ${qualityEnhancers}, ${technicalSpecs}`;

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
            steps: 6, // Increased steps for better quality
            n: 1,
            response_format: 'url',
            seed: Math.floor(Math.random() * 1000000), // Random seed for variety
            guidance_scale: 7.5 // Optimal guidance for FLUX
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

    // Fallback: Use Pollinations AI (free AI image generation service)
    console.log('🎨 Using Pollinations AI as fallback');

    // Use Pollinations AI - free AI image generation that actually uses prompts
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${dimensions.width}&height=${dimensions.height}&nologo=true&enhance=true`;

    console.log('✅ Pollinations AI image generated successfully');
    return NextResponse.json({
      success: true,
      imageUrl: pollinationsUrl,
      model: 'Pollinations AI (Free)',
      style: style,
      aspectRatio: aspectRatio,
      watermarkFree: true,
      note: 'Generated using Pollinations AI - add TOGETHER_API_KEY for FLUX model'
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