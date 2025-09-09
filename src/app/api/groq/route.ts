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

    // Try Groq first (primary provider)
    console.log('🚀 Attempting Groq API request...');
    const groqResult = await groqService.createChatCompletion(body);
    
    if (groqResult.success) {
      console.log('✅ Groq request successful');
      return NextResponse.json(groqResult);
    }

    // If Groq fails, try Groq's DeepSeek model as fallback
    console.log(`🔄 Groq primary failed: ${groqResult.error}, trying Groq DeepSeek model...`);
    
    try {
      // Convert multimodal content to text for DeepSeek fallback
      const textOnlyMessages = body.messages.map(msg => ({
        ...msg,
        content: typeof msg.content === 'string' 
          ? msg.content 
          : Array.isArray(msg.content)
          ? msg.content.find(item => item.type === 'text')?.text || 'Please analyze the provided content.'
          : String(msg.content)
      }));

      // Try Groq's DeepSeek model as fallback
      const groqDeepSeekResult = await groqService.createChatCompletion({
        ...body,
        messages: textOnlyMessages,
        action: 'deepseek' // Use Groq's DeepSeek model configuration
      });

      if (groqDeepSeekResult.success) {
        console.log('✅ Groq DeepSeek fallback successful');
        return NextResponse.json(groqDeepSeekResult);
      }

      console.log(`🔄 Groq DeepSeek also failed: ${groqDeepSeekResult.error}, using educational fallback...`);

      // HuggingFace temporarily disabled due to connection issues
      // DeepSeek direct API removed since Groq provides DeepSeek models
      
    } catch (fallbackError) {
      console.error('Groq fallback services failed:', fallbackError);
    }
    
    // Final fallback: Educational templates
    console.log('🎓 Using educational fallback template...');
    const finalUserMessage = body.messages[body.messages.length - 1];
    if (finalUserMessage?.role === 'user') {
      const messageContent = typeof finalUserMessage.content === 'string' 
        ? finalUserMessage.content 
        : Array.isArray(finalUserMessage.content)
        ? finalUserMessage.content.find(item => item.type === 'text')?.text || ''
        : '';
      const educationalResponse = deepseekService.getEducationalResponse(messageContent);
      
      return NextResponse.json({
        success: true,
        choices: [{
          message: {
            role: 'assistant',
            content: educationalResponse
          }
        }],
        model: 'Gawin AI Educational',
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        }
      });
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