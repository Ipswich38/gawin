import { NextRequest, NextResponse } from 'next/server';
import { groqService, GroqRequest } from '@/lib/services/groqService';
import { huggingFaceService } from '@/lib/services/huggingFaceService';
import { deepseekService } from '@/lib/services/deepseekService';
import { validationService } from '@/lib/services/validationService';

export async function POST(request: NextRequest) {
  try {
    const body: GroqRequest = await request.json();
    
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
      const validation = validationService.validateTextInput(lastMessage.content);
      
      if (!validation.isValid) {
        return NextResponse.json({
          success: false,
          error: 'Content policy violation',
          details: validation.errors.join(', ')
        }, { status: 400 });
      }
    }

    // Try Groq first (primary provider)
    console.log('🚀 Attempting Groq API request...');
    const groqResult = await groqService.createChatCompletion(body);
    
    if (groqResult.success) {
      console.log('✅ Groq request successful');
      return NextResponse.json(groqResult);
    }

    // If Groq fails, try HuggingFace fallback
    console.log(`🔄 Groq failed: ${groqResult.error}, trying HuggingFace fallback...`);
    
    try {
      const hfResult = await huggingFaceService.createChatCompletion({
        messages: body.messages.map(msg => ({ role: msg.role, content: msg.content })),
        action: body.action,
        max_tokens: body.max_tokens,
        temperature: body.temperature
      });

      if (hfResult.success) {
        console.log('✅ HuggingFace fallback successful');
        return NextResponse.json(hfResult);
      }

      // If both Groq and HuggingFace fail, try DeepSeek
      console.log(`🔄 HuggingFace also failed: ${hfResult.error}, trying DeepSeek final fallback...`);
      
      const deepseekResult = await deepseekService.createChatCompletion(
        body.messages.map(msg => ({ role: msg.role, content: msg.content })),
        { model: 'deepseek-chat' }
      );

      if (deepseekResult.choices && deepseekResult.choices.length > 0) {
        console.log('✅ DeepSeek fallback successful');
        return NextResponse.json({
          success: true,
          data: {
            response: deepseekResult.choices[0].message.content,
            model_used: 'deepseek-chat',
            task_type: body.action || 'general',
            processing_time: 1000
          },
          usage: deepseekResult.usage
        });
      }

    } catch (fallbackError) {
      console.error('All fallback services failed:', fallbackError);
    }
    
    // If all services fail, return error
    return NextResponse.json({
      success: false,
      error: 'All AI services are currently unavailable',
      details: `Primary: ${groqResult.error}`
    }, { status: 503 });

  } catch (error) {
    console.error('Groq API route error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Get available models and health status
export async function GET() {
  try {
    const groqModels = groqService.getAvailableModels();
    const groqHealth = await groqService.healthCheck();
    
    const hfModels = huggingFaceService.getAvailableModels();
    const hfHealth = await huggingFaceService.healthCheck();

    return NextResponse.json({
      success: true,
      data: {
        primary_service: 'Groq',
        primary_models: groqModels,
        primary_health: groqHealth,
        fallback_service: 'HuggingFace',
        fallback_models: hfModels,
        fallback_health: hfHealth,
        features: [
          'Primary: Groq (Fast, Reliable)',
          'Fallback: HuggingFace Pro (Specialized Models)',
          'Final Fallback: Educational Responses',
          'Image Generation: Kandinsky 3.0'
        ]
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}