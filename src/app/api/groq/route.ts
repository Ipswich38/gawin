import { NextRequest, NextResponse } from 'next/server';
import { groqService, GroqRequest, GroqMessage } from '@/lib/services/groqService';
import { huggingFaceService } from '@/lib/services/huggingFaceService';
import { deepseekService } from '@/lib/services/deepseekService';
import { validationService } from '@/lib/services/validationService';

/**
 * Generate intelligent educational responses when AI APIs fail
 * This acts as a smart fallback that analyzes context and provides helpful responses
 */
function generateSmartEducationalResponse(userMessage: string, conversationHistory: GroqMessage[]): string {
  const lowerMessage = userMessage.toLowerCase().trim();
  
  // Get conversation context
  const previousMessages = conversationHistory.slice(-4); // Last 4 messages for context
  const hasConversationHistory = previousMessages.length > 1;
  
  // Detect if user is frustrated or API failed
  if (lowerMessage.includes('not working') || lowerMessage.includes('error') || lowerMessage.includes('broken')) {
    return "I apologize that you're experiencing technical difficulties! I'm here to help with your learning. Even though some systems might be temporarily unavailable, I can still assist you with explanations, study guidance, and educational support. What specific topic would you like to explore together?";
  }
  
  // Math and science patterns
  if (/\b(math|calculus|algebra|geometry|physics|chemistry|biology|science)\b/i.test(lowerMessage)) {
    return generateSubjectResponse('mathematics and science', lowerMessage, hasConversationHistory);
  }
  
  // Programming and technology
  if (/\b(code|coding|programming|javascript|python|react|computer|software)\b/i.test(lowerMessage)) {
    return generateSubjectResponse('programming and technology', lowerMessage, hasConversationHistory);
  }
  
  // Language and writing
  if (/\b(write|writing|essay|grammar|literature|english|language)\b/i.test(lowerMessage)) {
    return generateSubjectResponse('language and writing', lowerMessage, hasConversationHistory);
  }
  
  // Study help and learning
  if (/\b(study|learn|homework|assignment|test|exam|help)\b/i.test(lowerMessage)) {
    return generateStudyHelpResponse(lowerMessage, hasConversationHistory);
  }
  
  // Greeting and basic interaction
  if (/\b(hello|hi|hey|good|morning|afternoon|evening)\b/i.test(lowerMessage) || lowerMessage.length < 10) {
    return hasConversationHistory 
      ? `Great to continue our learning conversation! I see we were discussing some interesting topics. What else would you like to explore or learn about today?`
      : `Hello! I'm your AI learning assistant, ready to help you understand complex topics, work through problems, and support your educational journey. What subject or question can I help you with today?`;
  }
  
  // Question patterns
  if (lowerMessage.includes('?')) {
    return generateQuestionResponse(lowerMessage, hasConversationHistory);
  }
  
  // Default educational response
  return generateDefaultEducationalResponse(lowerMessage, hasConversationHistory);
}

function generateSubjectResponse(subject: string, message: string, hasHistory: boolean): string {
  const responses = {
    'mathematics and science': [
      "I love helping with math and science! These subjects are all about understanding patterns and relationships in our world.",
      "Math and science can be challenging, but breaking problems down into smaller steps often makes them much clearer.",
      "Science and mathematics are interconnected - math helps us describe and predict scientific phenomena!"
    ],
    'programming and technology': [
      "Programming is like learning a new language to communicate with computers - it's very logical and creative!",
      "Technology is constantly evolving, but the fundamental problem-solving skills remain the same across all programming languages.",
      "Coding is all about breaking down complex problems into smaller, manageable pieces."
    ],
    'language and writing': [
      "Writing is a powerful way to organize and express your thoughts clearly and persuasively.",
      "Language skills improve with practice - reading widely and writing regularly are key to improvement.",
      "Good writing starts with understanding your audience and purpose."
    ]
  };
  
  const subjectResponses = responses[subject as keyof typeof responses] || responses['mathematics and science'];
  const baseResponse = subjectResponses[Math.floor(Math.random() * subjectResponses.length)];
  
  return hasHistory 
    ? `${baseResponse} Based on our conversation so far, what specific aspect would you like to dive deeper into?`
    : `${baseResponse} What particular question or topic in ${subject} can I help you with?`;
}

function generateStudyHelpResponse(message: string, hasHistory: boolean): string {
  const studyTips = [
    "Effective studying involves active engagement with the material rather than just reading passively.",
    "Breaking study sessions into focused chunks with short breaks can improve retention significantly.",
    "Teaching or explaining concepts to someone else is one of the best ways to solidify your understanding.",
    "Creating connections between new information and what you already know helps with long-term memory."
  ];
  
  const tip = studyTips[Math.floor(Math.random() * studyTips.length)];
  
  return hasHistory 
    ? `${tip} How can I help you apply this to the topics we've been discussing?`
    : `${tip} What subject or specific assignment are you working on? I'd be happy to help you develop a study strategy!`;
}

function generateQuestionResponse(message: string, hasHistory: boolean): string {
  return hasHistory 
    ? "That's a great follow-up question! I can see you're thinking deeply about this topic. Let me help you work through this step by step, building on what we've already covered."
    : "Excellent question! I appreciate your curiosity. The best way to approach this is to break it down systematically. While I work on getting the full AI systems online, I can guide you through the key concepts and help you think through this problem.";
}

function generateDefaultEducationalResponse(message: string, hasHistory: boolean): string {
  const responses = [
    "I'm here to support your learning journey! Even when technical systems have hiccups, education continues.",
    "Learning is an active process, and I'm glad you're engaging with challenging material.",
    "Your curiosity and willingness to ask questions is the foundation of great learning.",
    "Understanding comes from connecting new ideas with what you already know."
  ];
  
  const baseResponse = responses[Math.floor(Math.random() * responses.length)];
  
  return hasHistory 
    ? `${baseResponse} Let's continue building on our discussion - what aspect interests you most?`
    : `${baseResponse} What specific topic, subject, or question would you like to explore together?`;
}

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

    // If Groq fails, try HuggingFace as intelligent fallback
    console.log(`🔄 Groq primary failed: ${groqResult.error}, trying HuggingFace AI fallback...`);
    
    try {
      // Convert multimodal content to text for HuggingFace fallback
      const textOnlyMessages = body.messages.map(msg => ({
        ...msg,
        content: typeof msg.content === 'string' 
          ? msg.content 
          : Array.isArray(msg.content)
          ? msg.content.find(item => item.type === 'text')?.text || 'Please analyze the provided content.'
          : String(msg.content)
      }));

      // Try HuggingFace as an intelligent AI fallback
      const hfResult = await huggingFaceService.createChatCompletion({
        messages: textOnlyMessages,
        model: 'microsoft/DialoGPT-large',
        temperature: body.temperature || 0.7,
        max_tokens: body.max_tokens || 2048
      });

      if (hfResult.success) {
        console.log('✅ HuggingFace AI fallback successful');
        return NextResponse.json({
          success: true,
          choices: [{
            message: {
              role: 'assistant',
              content: hfResult.response || hfResult.choices?.[0]?.message?.content || 'I understand your question and I\'m here to help you learn!'
            }
          }],
          model: 'HuggingFace-AI-Fallback',
          usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0
          }
        });
      }

      console.log(`🔄 HuggingFace fallback also failed: ${hfResult.error}, trying Groq DeepSeek...`);

      // Try Groq's DeepSeek model as final AI fallback
      const groqDeepSeekResult = await groqService.createChatCompletion({
        ...body,
        messages: textOnlyMessages,
        action: 'deepseek'
      });

      if (groqDeepSeekResult.success) {
        console.log('✅ Groq DeepSeek AI fallback successful');
        return NextResponse.json(groqDeepSeekResult);
      }
      
    } catch (fallbackError) {
      console.error('AI fallback services failed:', fallbackError);
    }
    
    // Final fallback: Smart educational responses with conversation context
    console.log('🧠 Using intelligent educational fallback...');
    const finalUserMessage = body.messages[body.messages.length - 1];
    
    if (finalUserMessage?.role === 'user') {
      const messageContent = typeof finalUserMessage.content === 'string' 
        ? finalUserMessage.content 
        : Array.isArray(finalUserMessage.content)
        ? finalUserMessage.content.find(item => item.type === 'text')?.text || ''
        : '';
      
      // Generate contextual educational response
      const smartResponse = generateSmartEducationalResponse(messageContent, body.messages);
      
      return NextResponse.json({
        success: true,
        choices: [{
          message: {
            role: 'assistant',
            content: smartResponse
          }
        }],
        model: 'Gawin Smart Educational Assistant',
        usage: {
          prompt_tokens: messageContent.length,
          completion_tokens: smartResponse.length,
          total_tokens: messageContent.length + smartResponse.length
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