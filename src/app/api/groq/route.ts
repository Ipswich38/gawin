import { NextRequest, NextResponse } from 'next/server';
import { groqService, GroqRequest, GroqMessage } from '@/lib/services/groqService';
import { huggingFaceService } from '@/lib/services/huggingFaceService';
import { deepseekService } from '@/lib/services/deepseekService';
import { validationService } from '@/lib/services/validationService';
import { responseFilterService } from '@/lib/services/responseFilterService';
import { contentFilterService } from '@/lib/services/contentFilterService';
import { naturalConversationService, type ConversationContext } from '@/lib/services/naturalConversationService';
import { GawinResponseFormatter } from '@/lib/formatters/gawinResponseFormatter';

/**
 * Enhanced AI Context Analyzer - Provides deep conversation understanding
 * Analyzes conversation patterns, learning objectives, and user progress
 */
function analyzeConversationContext(conversationHistory: GroqMessage[]) {
  const context = {
    topics: new Set<string>(),
    learningObjectives: [] as string[],
    userKnowledgeLevel: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    conversationFlow: 'exploratory' as 'exploratory' | 'problem_solving' | 'clarification' | 'deep_dive',
    emotionalTone: 'neutral' as 'frustrated' | 'curious' | 'confused' | 'confident' | 'neutral',
    previousContext: conversationHistory.slice(-6) // Keep more context for learning
  };
  
  // Analyze conversation for topics and patterns
  conversationHistory.forEach(msg => {
    if (msg.role === 'user') {
      const content = typeof msg.content === 'string' ? msg.content : '';
      const lowerContent = content.toLowerCase();
      
      // Extract topics
      const topicPatterns = [
        { pattern: /\b(math|calculus|algebra|geometry|trigonometry|statistics)\b/i, topic: 'mathematics' },
        { pattern: /\b(physics|chemistry|biology|science|lab|experiment)\b/i, topic: 'science' },
        { pattern: /\b(code|coding|programming|javascript|python|react|api|database|algorithm)\b/i, topic: 'programming' },
        { pattern: /\b(write|writing|essay|grammar|literature|english|composition)\b/i, topic: 'writing' },
        { pattern: /\b(history|geography|social|politics|economics|culture)\b/i, topic: 'social_studies' },
        { pattern: /\b(art|design|creative|music|visual|aesthetic)\b/i, topic: 'creative_arts' }
      ];
      
      topicPatterns.forEach(({ pattern, topic }) => {
        if (pattern.test(lowerContent)) context.topics.add(topic);
      });
      
      // Detect emotional tone
      if (/\b(frustrated|stuck|confused|don't understand|help)\b/i.test(lowerContent)) {
        context.emotionalTone = 'frustrated';
      } else if (/\b(interesting|curious|wonder|explore|learn more)\b/i.test(lowerContent)) {
        context.emotionalTone = 'curious';
      } else if (/\b(unclear|confusing|not sure|don't get)\b/i.test(lowerContent)) {
        context.emotionalTone = 'confused';
      } else if (/\b(understand|got it|makes sense|clear now)\b/i.test(lowerContent)) {
        context.emotionalTone = 'confident';
      }
      
      // Detect knowledge level
      const complexTerms = content.match(/\b(algorithm|implementation|optimization|abstraction|polymorphism|derivative|integral|synthesis|analysis)\b/gi);
      const basicTerms = content.match(/\b(what is|how do|basic|simple|beginner|start|first time)\b/gi);
      
      if (complexTerms && complexTerms.length > 2) {
        context.userKnowledgeLevel = 'advanced';
      } else if (basicTerms && basicTerms.length > 0) {
        context.userKnowledgeLevel = 'beginner';
      }
    }
  });
  
  return context;
}

/**
 * Generate intelligent educational responses when AI APIs fail
 * This acts as a smart fallback that analyzes context and provides helpful responses
 */
async function generateSmartEducationalResponse(userMessage: string, conversationHistory: GroqMessage[]): Promise<string> {
  const lowerMessage = userMessage.toLowerCase().trim();
  const context = analyzeConversationContext(conversationHistory);
  const hasConversationHistory = conversationHistory.length > 1;
  
  // Generate context-aware responses based on conversation analysis
  const topicsDiscussed = Array.from(context.topics);
  const knowledgeLevel = context.userKnowledgeLevel;
  const emotionalState = context.emotionalTone;
  
  // Adaptive response based on emotional tone
  if (emotionalState === 'frustrated') {
    return generateSupportiveResponse(userMessage, context, hasConversationHistory);
  } else if (emotionalState === 'curious') {
    return generateExploratoryResponse(userMessage, context, hasConversationHistory);
  } else if (emotionalState === 'confused') {
    return generateClarificationResponse(userMessage, context, hasConversationHistory);
  } else if (emotionalState === 'confident') {
    return generateAdvancedResponse(userMessage, context, hasConversationHistory);
  }
  
  // Detect if user is frustrated or API failed
  if (lowerMessage.includes('not working') || lowerMessage.includes('error') || lowerMessage.includes('broken')) {
    return "I apologize that you're experiencing technical difficulties! I'm here to help with your learning. Even though some systems might be temporarily unavailable, I can still assist you with explanations, study guidance, and educational support. What specific topic would you like to explore together?";
  }
  
  // Context-aware subject responses
  if (topicsDiscussed.length > 0) {
    return generateContextualSubjectResponse(userMessage, context, hasConversationHistory);
  }
  
  // Math and science patterns
  if (/\b(math|calculus|algebra|geometry|physics|chemistry|biology|science)\b/i.test(lowerMessage)) {
    return generateSubjectResponse('mathematics and science', lowerMessage, hasConversationHistory, knowledgeLevel);
  }
  
  // Programming and technology
  if (/\b(code|coding|programming|javascript|python|react|computer|software)\b/i.test(lowerMessage)) {
    return generateSubjectResponse('programming and technology', lowerMessage, hasConversationHistory, knowledgeLevel);
  }
  
  // Language and writing
  if (/\b(write|writing|essay|grammar|literature|english|language)\b/i.test(lowerMessage)) {
    return generateSubjectResponse('language and writing', lowerMessage, hasConversationHistory, knowledgeLevel);
  }
  
  // Study help and learning
  if (/\b(study|learn|homework|assignment|test|exam|help)\b/i.test(lowerMessage)) {
    return generateStudyHelpResponse(lowerMessage, hasConversationHistory, context);
  }
  
  // Natural conversation handling with contextual awareness - only for actual greetings
  // Log for debugging
  console.log('🔍 Debugging message:', { userMessage, lowerMessage, length: lowerMessage.length });

  const isActualGreeting = /^(hello[\s\W]*|hi[\s\W]*|hey[\s\W]*|good\s+(morning|afternoon|evening)[\s\W]*|kumusta[\s\W]*)$/i.test(lowerMessage);
  console.log('🎯 Is actual greeting:', isActualGreeting);

  if (isActualGreeting) {
    const conversationContext: ConversationContext = {
      userMessage: userMessage,
      previousMessages: [], // This should be populated from actual conversation history
      emotionalTone: context.emotionalTone,
      topics: Array.from(context.topics),
      knowledgeLevel: context.userKnowledgeLevel,
      timestamp: new Date()
    };
    
    try {
      const naturalResponse = await naturalConversationService.generateNaturalResponse(conversationContext);
      return naturalResponse.content;
    } catch (error) {
      console.error('Natural conversation service failed:', error);
      // Intelligent fallback that avoids templated responses
      return hasConversationHistory 
        ? `I see you're back! What's on your mind today?`
        : `What brings you here? I'm curious about what you'd like to explore.`;
    }
  }
  
  // Question patterns
  if (lowerMessage.includes('?')) {
    return generateQuestionResponse(lowerMessage, hasConversationHistory, context);
  }
  
  // Default educational response
  return generateDefaultEducationalResponse(lowerMessage, hasConversationHistory, context);
}

// Enhanced response generators based on emotional state and context
function generateSupportiveResponse(message: string, context: any, hasHistory: boolean): string {
  const topics = Array.from(context.topics);
  const encouragement = [
    "I understand this can be challenging. Let's break it down step by step.",
    "Don't worry - learning involves struggles, and that's completely normal!",
    "I'm here to help you work through this. Let's approach it from a different angle.",
    "Every expert was once a beginner. Let's tackle this together."
  ];
  
  const support = encouragement[Math.floor(Math.random() * encouragement.length)];
  return hasHistory && topics.length > 0
    ? `${support} Building on our previous discussion about ${topics.join(', ')}, what specific part is giving you trouble?`
    : `${support} What specific aspect would you like help with?`;
}

function generateExploratoryResponse(message: string, context: any, hasHistory: boolean): string {
  const topics = Array.from(context.topics);
  const exploration = [
    "I love your curiosity! Let's explore this fascinating topic together.",
    "That's an excellent question that opens up many interesting possibilities!",
    "Your curiosity is the foundation of great learning. Let's dive deeper!",
    "Great question! This connects to so many interesting concepts."
  ];
  
  const response = exploration[Math.floor(Math.random() * exploration.length)];
  return hasHistory && topics.length > 0
    ? `${response} Since we've been discussing ${topics.join(', ')}, how do you think this connects to what we've covered?`
    : `${response} What aspects of this topic intrigue you most?`;
}

function generateClarificationResponse(message: string, context: any, hasHistory: boolean): string {
  const topics = Array.from(context.topics);
  const clarification = [
    "I can help clarify this for you. Let's start with the fundamentals.",
    "Let me explain this more clearly. Understanding builds step by step.",
    "Good question! Let me break this down into simpler parts.",
    "I see the confusion. Let's approach this systematically."
  ];
  
  const response = clarification[Math.floor(Math.random() * clarification.length)];
  return hasHistory && topics.length > 0
    ? `${response} Thinking back to our discussion on ${topics.join(', ')}, which part needs more explanation?`
    : `${response} What specific aspect would you like me to clarify?`;
}

function generateAdvancedResponse(message: string, context: any, hasHistory: boolean): string {
  const topics = Array.from(context.topics);
  const advanced = [
    "Great! I can see you're grasping these concepts well. Let's explore more advanced applications.",
    "Excellent understanding! Ready to dive into some more complex aspects?",
    "You're demonstrating solid comprehension. Let's challenge ourselves further.",
    "Perfect! Your grasp of this topic opens doors to more sophisticated concepts."
  ];
  
  const response = advanced[Math.floor(Math.random() * advanced.length)];
  return hasHistory && topics.length > 0
    ? `${response} Given your understanding of ${topics.join(', ')}, what advanced concepts interest you?`
    : `${response} What challenging aspects would you like to explore?`;
}

function generateContextualSubjectResponse(message: string, context: any, hasHistory: boolean): string {
  const topics = Array.from(context.topics);
  const knowledgeLevel = context.userKnowledgeLevel;
  
  const levelAdjustedResponse: Record<string, string> = {
    beginner: "Let's build on the basics we've covered",
    intermediate: "Based on your growing understanding",
    advanced: "Given your strong grasp of the concepts"
  };
  
  const intro = levelAdjustedResponse[knowledgeLevel] || levelAdjustedResponse['intermediate'];
  return `${intro} in ${topics.join(', ')}, how can I help you take the next step in your learning journey?`;
}

function generateSubjectResponse(subject: string, message: string, hasHistory: boolean, knowledgeLevel?: string): string {
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
  let baseResponse = subjectResponses[Math.floor(Math.random() * subjectResponses.length)];
  
  // Adjust response based on knowledge level
  if (knowledgeLevel === 'beginner') {
    baseResponse += " Let's start with the fundamentals and build up your understanding step by step.";
  } else if (knowledgeLevel === 'advanced') {
    baseResponse += " I can see you have a strong foundation - let's explore some advanced concepts.";
  }
  
  return hasHistory 
    ? `${baseResponse} Based on our conversation so far, what specific aspect would you like to dive deeper into?`
    : `${baseResponse} What particular question or topic in ${subject} can I help you with?`;
}

function generateStudyHelpResponse(message: string, hasHistory: boolean, context?: any): string {
  const studyTips = [
    "Effective studying involves active engagement with the material rather than just reading passively.",
    "Breaking study sessions into focused chunks with short breaks can improve retention significantly.",
    "Teaching or explaining concepts to someone else is one of the best ways to solidify your understanding.",
    "Creating connections between new information and what you already know helps with long-term memory."
  ];
  
  const tip = studyTips[Math.floor(Math.random() * studyTips.length)];
  const topics = context ? Array.from(context.topics) : [];
  
  return hasHistory && topics.length > 0
    ? `${tip} How can I help you apply this to ${topics.join(', ')} that we've been discussing?`
    : hasHistory 
    ? `${tip} How can I help you apply this to the topics we've been discussing?`
    : `${tip} What subject or specific assignment are you working on? I'd be happy to help you develop a study strategy!`;
}

function generateQuestionResponse(message: string, hasHistory: boolean, context?: any): string {
  const topics = context ? Array.from(context.topics) : [];
  const knowledgeLevel = context?.userKnowledgeLevel || 'intermediate';
  
  const levelResponse = knowledgeLevel === 'advanced' 
    ? "That's a sophisticated question that shows deep thinking!"
    : knowledgeLevel === 'beginner'
    ? "Great question! Asking questions is how we learn."
    : "That's a thoughtful question!";
  
  return hasHistory && topics.length > 0
    ? `${levelResponse} Building on our discussion of ${topics.join(', ')}, let me help you work through this step by step.`
    : hasHistory 
    ? `${levelResponse} I can see you're thinking deeply about this topic. Let me help you work through this step by step, building on what we've already covered.`
    : `${levelResponse} I appreciate your curiosity. The best way to approach this is to break it down systematically.`;
}

function generateDefaultEducationalResponse(message: string, hasHistory: boolean, context?: any): string {
  const responses = [
    "I'm here to support your learning journey! Even when technical systems have hiccups, education continues.",
    "Learning is an active process, and I'm glad you're engaging with challenging material.",
    "Your curiosity and willingness to ask questions is the foundation of great learning.",
    "Understanding comes from connecting new ideas with what you already know."
  ];
  
  const baseResponse = responses[Math.floor(Math.random() * responses.length)];
  const topics = context ? Array.from(context.topics) : [];
  
  return hasHistory && topics.length > 0
    ? `${baseResponse} Let's continue building on our discussion of ${topics.join(', ')} - what aspect interests you most?`
    : hasHistory 
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

    // Check for image generation request
    const lastMessage = body.messages[body.messages.length - 1];
    const messageContent = typeof lastMessage.content === 'string'
      ? lastMessage.content
      : Array.isArray(lastMessage.content)
      ? lastMessage.content.find(item => item.type === 'text')?.text || ''
      : String(lastMessage.content);

    // **Content Filtering - Block inappropriate content BUT ALWAYS ALLOW QUIZ GENERATION**
    // Special protection for quiz generation - bypass all filtering
    const isQuizRequest = /\b(quiz|generate|questions|mathematics|physics|chemistry|biology|computer science|engineering)\b/i.test(messageContent);

    let contentFilter;
    if (!isQuizRequest) {
      contentFilter = contentFilterService.filterContent(messageContent);

      if (contentFilter.wasFiltered && contentFilter.filterResult.isBlocked) {
        console.log(`🛡️ Content blocked: ${contentFilter.filterResult.category} (${contentFilter.filterResult.detectedLanguage})`);

        return NextResponse.json({
          success: true,
          choices: [{
            message: {
              role: 'assistant',
              content: contentFilter.filtered
            },
            finish_reason: 'stop',
            index: 0
          }],
          usage: {
            prompt_tokens: messageContent.length,
            completion_tokens: contentFilter.filtered.length,
            total_tokens: messageContent.length + contentFilter.filtered.length
          }
        });
      }

      // Handle academic context clarification (but not for quiz requests)
      if (contentFilter.filterResult.category === 'academic_context') {
        console.log(`📚 Academic context detected, requesting clarification`);

        return NextResponse.json({
          success: true,
          choices: [{
            message: {
              role: 'assistant',
              content: contentFilter.filtered
            },
            finish_reason: 'stop',
            index: 0
          }],
          usage: {
            prompt_tokens: messageContent.length,
            completion_tokens: contentFilter.filtered.length,
            total_tokens: messageContent.length + contentFilter.filtered.length
          }
        });
      }
    } else {
      console.log('🎓 Quiz generation request detected - bypassing all content filtering');
    }

    // Enhanced context-aware image detection
    const hasCodeContexts = /\b(code|program|function|algorithm|script|software|javascript|python|html|css|programming|coding|development)\b/i.test(messageContent);
    
    const imageKeywords = [
      'generate image', 'create image', 'make image', 'draw', 'picture', 
      'illustration', 'visual', 'artwork', 'photo', 'design', 'sketch', 'paint', 'render'
    ];
    
    // More specific image detection - avoid false positives with code requests
    const isExplicitImageRequest = imageKeywords.some(keyword => 
      messageContent.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Check for ambiguous "generate a" or "create a" patterns
    const hasAmbiguousGenerate = /\b(generate|create|make)\s+a\b/i.test(messageContent);
    
    // Final decision: only treat as image request if explicit OR (ambiguous AND no code context)
    const isImageRequest = isExplicitImageRequest || (hasAmbiguousGenerate && !hasCodeContexts);
    
    // Add clarification system for ambiguous requests
    if (hasAmbiguousGenerate && hasCodeContexts && isExplicitImageRequest) {
      // This is a truly ambiguous case - ask for clarification
      return NextResponse.json({
        success: true,
        choices: [{
          message: {
            role: 'assistant',
            content: `I notice you mentioned both "${messageContent.match(/\b(generate|create|make)\s+a\b/i)?.[0] || 'generate'}" and programming-related terms. To help you better, could you clarify what you'd like me to do?\n\n🖼️ **Generate an image** - Create a visual representation\n💻 **Generate code** - Write programming code or scripts\n\nJust let me know which one you had in mind, and I'll be happy to help!`
          },
          finish_reason: 'stop',
          index: 0
        }],
        usage: {
          prompt_tokens: messageContent.length,
          completion_tokens: 50,
          total_tokens: messageContent.length + 50
        }
      });
    }

    if (isImageRequest) {
      console.log('🎨 Image generation request detected, using Pollinations API...');
      try {
        // Extract image prompt from the message
        let imagePrompt = messageContent;
        
        // Clean up the prompt by removing generation keywords
        const cleanPrompt = imagePrompt
          .replace(/(?:generate|create|make|draw|show me|design|sketch|paint|render)\s+(?:an?\s+)?(?:image|picture|illustration|visual|artwork|photo|of\s+)?/gi, '')
          .trim();

        // Call the image API directly using pollinationsService instead of internal API call
        const { pollinationsService } = await import('@/lib/services/pollinationsService');
        const imageResult = await pollinationsService.generateImage({
          prompt: cleanPrompt || imagePrompt
        });

        if (!imageResult.success || !imageResult.data) {
          console.error('Image generation failed:', imageResult.error);
          return NextResponse.json(
            { 
              success: false,
              error: imageResult.error || 'Image generation failed' 
            },
            { status: 500 }
          );
        }

        // Use the image URL directly from pollinations service
        const imageDataUrl = imageResult.data.image_url;

        // Return successful image generation response
        return NextResponse.json({
          success: true,
          choices: [{
            message: {
              role: 'assistant',
              content: `I've generated an image based on your request: "${cleanPrompt || imagePrompt}"\n\n![Generated Image](${imageDataUrl})\n\nThe image has been created using AI image generation. Would you like me to generate another variation or create something different?`
            },
            finish_reason: 'stop',
            index: 0
          }],
          usage: {
            prompt_tokens: messageContent.length,
            completion_tokens: 50,
            total_tokens: messageContent.length + 50
          }
        });
      } catch (imageError) {
        console.error('Image generation error:', imageError);
      }
    }

    // Validation pre-check
    if (lastMessage?.role === 'user') {
      const validation = validationService.validateTextInput(messageContent);
      
      if (!validation.isValid) {
        return NextResponse.json({
          success: false,
          error: 'Content policy violation',
          details: validation.errors.join(', ')
        }, { status: 400 });
      }
    }

    // Try Groq first (primary provider) - THIS IS THE DEFAULT
    console.log('🚀 Attempting Groq API request...');
    const groqResult = await groqService.createChatCompletion(body);
    
    if (groqResult.success) {
      console.log('✅ Groq request successful - DIRECT RESPONSE');
      
      // Background orchestrator learning (non-blocking)
      setTimeout(() => {
        try {
          // Log interaction for learning without affecting response
          const lastMessage = body.messages[body.messages.length - 1];
          const messageContent = typeof lastMessage.content === 'string' 
            ? lastMessage.content 
            : Array.isArray(lastMessage.content)
            ? lastMessage.content.find(item => item.type === 'text')?.text || ''
            : '';
          
          // Analyze conversation context for background learning
          const context = analyzeConversationContext(body.messages);
          console.log('📊 Background orchestrator learning:', {
            topics: Array.from(context.topics),
            userLevel: context.userKnowledgeLevel,
            emotionalTone: context.emotionalTone
          });
        } catch (error) {
          console.log('Background learning error (non-critical):', error);
        }
      }, 0);
      
      // Filter response for quality and consistency
      if (groqResult.choices?.[0]?.message?.content) {
        const filteredResponse = responseFilterService.filterResponse(groqResult.choices[0].message.content);

        // Log filtering results for monitoring
        if (filteredResponse.wasFiltered) {
          console.log('🧹 Response filtered:', {
            originalLength: groqResult.choices[0].message.content.length,
            filteredLength: filteredResponse.content.length,
            filtersApplied: filteredResponse.filtersApplied
          });
        }

        // Apply comprehensive formatting from the master guide
        const formattedResponse = GawinResponseFormatter.formatResponse(filteredResponse.content);

        // Update the response content with formatting applied
        groqResult.choices[0].message.content = formattedResponse;
      }
      
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
        action: 'chat',
        temperature: body.temperature || 0.7,
        max_tokens: body.max_tokens || 2048
      });

      if (hfResult.success) {
        console.log('✅ HuggingFace AI fallback successful');
        
        // Filter HuggingFace response as well
        let content = hfResult.data?.response || 'I understand your question and I\'m here to help you learn!';
        const filteredResponse = responseFilterService.filterResponse(content);

        if (filteredResponse.wasFiltered) {
          console.log('🧹 HuggingFace response filtered:', {
            originalLength: content.length,
            filteredLength: filteredResponse.content.length,
            filtersApplied: filteredResponse.filtersApplied
          });
        }

        // Apply comprehensive formatting to HuggingFace response
        const formattedContent = GawinResponseFormatter.formatResponse(filteredResponse.content);
        
        return NextResponse.json({
          success: true,
          choices: [{
            message: {
              role: 'assistant',
              content: formattedContent
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
        
        // Filter DeepSeek response as well
        if (groqDeepSeekResult.choices?.[0]?.message?.content) {
          const filteredResponse = responseFilterService.filterResponse(groqDeepSeekResult.choices[0].message.content);

          if (filteredResponse.wasFiltered) {
            console.log('🧹 DeepSeek response filtered:', {
              originalLength: groqDeepSeekResult.choices[0].message.content.length,
              filteredLength: filteredResponse.content.length,
              filtersApplied: filteredResponse.filtersApplied
            });
          }

          // Apply comprehensive formatting to DeepSeek response
          const formattedContent = GawinResponseFormatter.formatResponse(filteredResponse.content);

          groqDeepSeekResult.choices[0].message.content = formattedContent;
        }
        
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
      const smartResponse = await generateSmartEducationalResponse(messageContent, body.messages);

      // Apply comprehensive formatting to smart educational response
      const formattedSmartResponse = GawinResponseFormatter.formatResponse(smartResponse);

      return NextResponse.json({
        success: true,
        choices: [{
          message: {
            role: 'assistant',
            content: formattedSmartResponse
          }
        }],
        model: 'Gawin Smart Educational Assistant',
        usage: {
          prompt_tokens: messageContent.length,
          completion_tokens: formattedSmartResponse.length,
          total_tokens: messageContent.length + formattedSmartResponse.length
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