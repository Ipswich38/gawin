import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, voiceSettings, optimizeStreamingLatency, outputFormat } = await request.json();

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    // Get API key from server environment
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error('❌ ELEVENLABS_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'ElevenLabs API not configured' },
        { status: 500 }
      );
    }

    // Voice configuration
    const voiceId = 's2tgiTzhkPovTa6bxAlx'; // Specified voice ID
    const modelId = 'eleven_multilingual_v2';

    // Default voice settings optimized for natural speech
    const defaultSettings = {
      stability: 0.75,
      similarity_boost: 0.85,
      style: 0.3,
      use_speaker_boost: true,
    };

    // Merge with provided settings
    const finalSettings = { ...defaultSettings, ...voiceSettings };

    // Prepare request payload
    const payload = {
      text,
      model_id: modelId,
      voice_settings: finalSettings,
    };

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (optimizeStreamingLatency) {
      queryParams.append('optimize_streaming_latency', optimizeStreamingLatency.toString());
    }
    if (outputFormat) {
      queryParams.append('output_format', outputFormat);
    } else {
      queryParams.append('output_format', 'mp3_44100_128'); // Default high quality
    }

    const queryString = queryParams.toString();
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}${queryString ? '?' + queryString : ''}`;

    console.log('🎤 Generating ElevenLabs speech:', {
      voiceId,
      textLength: text.length,
      settings: finalSettings,
    });

    // Make request to ElevenLabs API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ElevenLabs API error:', response.status, errorText);
      return NextResponse.json(
        { error: `ElevenLabs API error: ${response.status} ${errorText}` },
        { status: response.status }
      );
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer();

    console.log(`✅ ElevenLabs speech generated successfully (${audioBuffer.byteLength} bytes)`);

    // Return the audio data with appropriate headers
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache', // Don't cache audio responses
      },
    });

  } catch (error) {
    console.error('❌ ElevenLabs TTS route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to test the service
export async function GET() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API not configured', configured: false },
        { status: 500 }
      );
    }

    // Test API connectivity
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'ElevenLabs API connection failed', configured: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'ElevenLabs API is configured and accessible',
      configured: true,
      voiceId: 's2tgiTzhkPovTa6bxAlx',
    });

  } catch (error) {
    console.error('❌ ElevenLabs API test error:', error);
    return NextResponse.json(
      { error: 'Failed to test ElevenLabs API', configured: false },
      { status: 500 }
    );
  }
}