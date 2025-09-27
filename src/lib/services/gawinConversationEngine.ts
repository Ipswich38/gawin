/**
 * Gawin Enhanced Conversation System
 * Natural Filipino AI with Context Awareness, Emotional Intelligence, Memory, and Location Context
 */

import { UserLocation } from './locationService';
import { GawinResponseFormatter } from '../formatters/gawinResponseFormatter';
import { screenAnalysisService } from './screenAnalysisService';
import { gradeANeuralOptimizer } from '../neural/gradeANeuralOptimizer';

export interface ConversationContext {
  language: 'tagalog' | 'english' | 'taglish';
  emotion: 'happy' | 'sad' | 'excited' | 'frustrated' | 'curious' | 'neutral';
  intent: 'question' | 'request' | 'greeting' | 'casual' | 'appreciation' | 'statement';
  needsMemory: boolean;
  conversationFlow: 'new_conversation' | 'focused_discussion' | 'scattered_conversation' | 'natural_flow';
  topics: string[];
  location?: UserLocation;
}

export interface UserPreferences {
  preferredLanguage: 'tagalog' | 'english' | 'taglish';
  conversationStyle: 'casual' | 'formal' | 'friendly';
  topics: string[];
}

export interface ConversationMemory {
  userMessage: string;
  aiResponse: string;
  context: ConversationContext;
  timestamp: number;
}

export interface EnhancedResponse {
  content: string;
  context: ConversationContext;
  emotion: string;
  confidence: number;
}

export class GawinConversationEngine {
  private conversationMemory: ConversationMemory[] = [];
  private userPreferences: UserPreferences = {
    preferredLanguage: 'taglish',
    conversationStyle: 'casual',
    topics: []
  };
  private emotionalContext: string = 'neutral';
  private locationService?: any; // Location service reference

  constructor(locationService?: any) {
    // Initialize with Filipino-friendly defaults
    this.conversationMemory = [];
    this.locationService = locationService;
  }

  /**
   * Analyze conversation context and emotional tone with location awareness
   */
  async analyzeContext(message: string, history: any[] = []): Promise<ConversationContext> {
    // Get user location context if available
    let userLocation: UserLocation | undefined;
    if (this.locationService) {
      try {
        userLocation = await this.locationService.getUserLocation(false); // Don't ask consent again
      } catch (error) {
        console.warn('Location context unavailable:', error);
      }
    }

    const analysis: ConversationContext = {
      language: this.detectLanguage(message),
      emotion: this.detectEmotion(message),
      intent: this.detectIntent(message),
      needsMemory: this.needsContextualMemory(message),
      conversationFlow: this.analyzeFlow(history),
      topics: this.extractTopics(message),
      location: userLocation
    };

    return analysis;
  }

  /**
   * Detect primary language used in message
   */
  detectLanguage(message: string): 'tagalog' | 'english' | 'taglish' {
    const tagalogWords = [
      'ako', 'ikaw', 'tayo', 'siya', 'kami', 'kayo', 'sila', 'ang', 'ng', 'sa', 'para', 'kung',
      'kapag', 'dahil', 'kasi', 'pero', 'at', 'o', 'na', 'pa', 'ba', 'naman', 'lang', 'daw',
      'raw', 'din', 'rin', 'po', 'opo', 'hindi', 'oo', 'yes', 'salamat', 'kumusta', 'kamusta',
      'galing', 'ayos', 'ok', 'okay', 'sige', 'tara', 'pakitingnan', 'tignan', 'makita',
      'ginawa', 'gawa', 'trabaho', 'pamilya', 'bahay', 'school', 'eskwela', 'araw', 'gabi',
      'umaga', 'hapon', 'bukas', 'kahapon', 'ngayon', 'mahal', 'love', 'gusto', 'ayaw'
    ];

    const englishWords = [
      'the', 'and', 'you', 'that', 'was', 'for', 'are', 'with', 'his', 'they', 'have', 'this',
      'will', 'can', 'had', 'her', 'what', 'said', 'each', 'which', 'she', 'how', 'their', 'if',
      'would', 'about', 'get', 'make', 'think', 'know', 'take', 'see', 'come', 'could', 'time',
      'very', 'when', 'much', 'new', 'write', 'our', 'me', 'man', 'too', 'any', 'day', 'same',
      'right', 'look', 'each', 'good', 'woman', 'through', 'us', 'life', 'child', 'there'
    ];

    const lowerMessage = message.toLowerCase();
    const words = lowerMessage.split(/\s+/);

    const tagalogCount = tagalogWords.filter(word =>
      words.includes(word) || lowerMessage.includes(word)
    ).length;

    const englishCount = englishWords.filter(word =>
      words.includes(word)
    ).length;

    // Check for mixed usage (Taglish)
    const hasBothLanguages = tagalogCount > 0 && englishCount > 0;

    if (hasBothLanguages) return 'taglish';
    if (tagalogCount > englishCount) return 'tagalog';
    if (englishCount > tagalogCount) return 'english';

    // Default to taglish for Filipino users
    return 'taglish';
  }

  /**
   * Detect emotional tone of the message
   */
  detectEmotion(message: string): 'happy' | 'sad' | 'excited' | 'frustrated' | 'curious' | 'neutral' {
    const emotions = {
      happy: [
        'salamat', 'thank you', 'masaya', 'happy', 'wow', 'great', 'galing', 'amazing',
        'love', 'mahal', 'exciting', 'nakakasaya', 'saya', 'tawa', 'laugh', 'haha',
        'cool', 'awesome', 'perfect', 'excellent', 'wonderful', 'fantastic'
      ],
      sad: [
        'malungkot', 'sad', 'problema', 'hirap', 'difficult', 'nahihirapan', 'lungkot',
        'iyak', 'cry', 'disappointed', 'heartbroken', 'broken', 'hurt', 'pain', 'sakit'
      ],
      excited: [
        'excited', 'sabik', 'hindi makapag-antay', "can't wait", 'grabe', 'sobrang',
        'astig', 'super', 'talaga', 'pumped', 'thrilled', 'eager', 'anticipating'
      ],
      frustrated: [
        'nakakaasar', 'annoying', 'frustrated', 'nakakapagod', 'badtrip', 'stress',
        'angry', 'galit', 'inis', 'nainis', 'annoyed', 'upset', 'irritated'
      ],
      curious: [
        'paano', 'how', 'bakit', 'why', 'ano', 'what', 'saan', 'where', 'kelan', 'when',
        'sino', 'who', 'curious', 'interested', 'gusto', 'want to know', 'wondering'
      ]
    };

    const lowerMessage = message.toLowerCase();

    for (const [emotion, keywords] of Object.entries(emotions)) {
      const matchCount = keywords.filter(keyword =>
        lowerMessage.includes(keyword.toLowerCase())
      ).length;

      if (matchCount > 0) {
        return emotion as any;
      }
    }

    return 'neutral';
  }

  /**
   * Detect user intent
   */
  detectIntent(message: string): 'question' | 'request' | 'greeting' | 'casual' | 'appreciation' | 'statement' {
    const lowerMessage = message.toLowerCase().trim();

    // Check for greetings first with strict matching (must be short and mostly greeting words)
    const greetingPattern = /^(hello|hi|hey|good\s+(morning|afternoon|evening)|kumusta|kamusta|hiya?)[\s\W]*$/i;
    const isShortMessage = lowerMessage.length <= 20;
    const isActualGreeting = greetingPattern.test(lowerMessage) && isShortMessage;

    if (isActualGreeting) {
      return 'greeting';
    }

    const intents = {
      question: [
        'ano', 'paano', 'bakit', 'saan', 'kelan', 'sino', 'what', 'how', 'why', 'where',
        'when', 'who', '?', 'ba', 'diba', 'totoo', 'pwede', 'maaari'
      ],
      request: [
        'please', 'paki', 'pwede', 'can you', 'gumawa', 'create', 'write', 'sulat',
        'help', 'tulong', 'assist', 'gawin', 'do', 'make', 'pakigawa', 'draw', 'code',
        'research', 'analyze', 'explain', 'tell me', 'show me'
      ],
      casual: [
        'lang', 'naman', 'ba', 'diba', 'oo', 'yes', 'hindi', 'no', 'okay', 'ok',
        'sige', 'sure', 'yup', 'nope', 'uh-huh', 'eh', 'ah'
      ],
      appreciation: [
        'salamat', 'thank you', 'galing', 'great', 'amazing', 'wow', 'nice',
        'good job', 'excellent', 'perfect', 'astig', 'magaling'
      ]
    };

    // Check other intents (excluding greeting since we handled it above)
    for (const [intent, keywords] of Object.entries(intents)) {
      const hasKeyword = keywords.some(keyword =>
        lowerMessage.includes(keyword.toLowerCase())
      );

      if (hasKeyword) {
        return intent as any;
      }
    }

    return 'statement';
  }

  /**
   * Check if message needs contextual memory
   */
  needsContextualMemory(message: string): boolean {
    const memoryTriggers = [
      'yung kanina', 'earlier', 'yung sabi mo', 'what you said', 'tulad ng', 'like what',
      'parang yung', 'similar to', 'regarding', 'tungkol sa', 'about that', 'yan',
      'previous', 'nauna', 'before', 'dati', 'noon', 'kanina', 'yung', 'yun',
      'that thing', 'yung bagay', 'yung sinabi', 'remember', 'naaalala', 'mentioned'
    ];

    const lowerMessage = message.toLowerCase();
    return memoryTriggers.some(trigger =>
      lowerMessage.includes(trigger.toLowerCase())
    );
  }

  /**
   * Analyze conversation flow
   */
  analyzeFlow(history: any[]): 'new_conversation' | 'focused_discussion' | 'scattered_conversation' | 'natural_flow' {
    if (history.length === 0) return 'new_conversation';

    const lastMessages = history.slice(-3);
    const topics = lastMessages.map(msg => this.extractTopics(msg.content || ''));

    // Check if continuing same topic
    const allTopics = topics.flat();
    const uniqueTopics = new Set(allTopics);

    if (uniqueTopics.size <= 1) return 'focused_discussion';
    if (uniqueTopics.size > 3) return 'scattered_conversation';

    return 'natural_flow';
  }

  /**
   * Extract topics from message
   */
  extractTopics(message: string): string[] {
    const topics: string[] = [];
    const topicKeywords = {
      work: ['trabaho', 'work', 'office', 'boss', 'salary', 'job', 'career', 'employment'],
      food: ['kain', 'food', 'luto', 'cooking', 'restaurant', 'pagkain', 'lutong', 'recipe'],
      family: ['pamilya', 'family', 'nanay', 'tatay', 'kapatid', 'parents', 'siblings'],
      technology: ['tech', 'computer', 'phone', 'internet', 'app', 'software', 'gadget'],
      love: ['love', 'pag-ibig', 'relationship', 'boyfriend', 'girlfriend', 'partner'],
      school: ['school', 'eskwela', 'student', 'teacher', 'class', 'exam', 'estudyante'],
      health: ['health', 'kalusugan', 'sakit', 'sick', 'medicine', 'doctor', 'hospital'],
      entertainment: ['movie', 'music', 'game', 'TV', 'show', 'libro', 'book', 'pelikula'],
      travel: ['travel', 'biyahe', 'vacation', 'trip', 'lugar', 'place', 'destination'],
      money: ['money', 'pera', 'bayad', 'payment', 'shopping', 'bili', 'gastos']
    };

    const lowerMessage = message.toLowerCase();

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
        topics.push(topic);
      }
    }

    return topics;
  }

  /**
   * Generate contextually aware system prompt with location context
   */
  generateSystemPrompt(context: ConversationContext, history: any[] = []): string {
    const { language, emotion, intent, needsMemory, conversationFlow, location } = context;

    let basePersonality = `You are Gawin, a Filipino AI assistant. You are:
- Naturally conversational and warm (parang kaibigan)
- Fluent in Tagalog, English, and Taglish
- Contextually aware of previous conversations
- Emotionally intelligent and empathetic
- Helpful but never robotic or formal
- Understanding of Filipino culture and context
- Able to use Filipino expressions and idioms naturally
- Location-aware for local context and cultural relevance

CORE PERSONALITY TRAITS:
- Warm and approachable like a close Filipino friend
- Uses natural Filipino conversation patterns
- Emotionally responsive and empathetic
- Culturally aware of Filipino context
- Helpful and knowledgeable but humble
- Playful when appropriate but respectful
- Privacy-conscious about location data`;

    let languageInstructions = '';
    switch (language) {
      case 'tagalog':
        languageInstructions = `Respond primarily in Tagalog with natural Filipino expressions. Use "po" and "opo" when appropriate for respect. Include common Filipino interjections like "eh", "ah", "ano", "kasi".`;
        break;
      case 'english':
        languageInstructions = `Respond in English but feel free to use Filipino expressions naturally (like "kasi", "naman", "ba", "eh"). Code-switch when it feels natural.`;
        break;
      case 'taglish':
        languageInstructions = `Respond in natural Taglish - mix English and Tagalog fluidly like how Filipinos naturally speak. Use code-switching naturally and include Filipino sentence particles like "naman", "ba", "kasi", "eh".`;
        break;
    }

    let emotionalResponse = '';
    switch (emotion) {
      case 'happy':
        emotionalResponse = `The user seems happy/excited. Match their positive energy. Use expressions like "Wow, ang galing!", "That's awesome!", "Grabe naman!", or "Sobrang cool nyan!". Be enthusiastic and share their joy.`;
        break;
      case 'sad':
        emotionalResponse = `The user seems sad/troubled. Be empathetic and supportive. Use comforting words like "Okay lang yan", "I understand how you feel", "Nandito lang ako", or "Laban lang". Offer gentle support.`;
        break;
      case 'frustrated':
        emotionalResponse = `The user seems frustrated. Be understanding and offer help. Use expressions like "Nakakaasar talaga yan", "I get why you're frustrated", "Nakakapagod din yan", or "Tama ka naman diyan". Validate their feelings.`;
        break;
      case 'curious':
        emotionalResponse = `The user is curious and asking questions. Be informative but conversational. Use "Ah, ganito yan...", "Let me explain...", "Interesting na tanong yan!", or "Uy, maganda yang tanong mo!". Share their curiosity.`;
        break;
      case 'excited':
        emotionalResponse = `The user is excited! Match their energy. Use "Grabe exciting!", "Ay hindi ka makapag-antay!", "Super exciting yan!", or "OMG yes!". Be enthusiastic with them.`;
        break;
      default:
        emotionalResponse = `Maintain a warm, friendly tone. Use natural Filipino conversation starters and be genuinely interested in what they're sharing.`;
    }

    let memoryInstructions = '';
    if (needsMemory && history.length > 0) {
      const recentContext = history.slice(-5).map(msg =>
        `${msg.role}: ${msg.content.substring(0, 150)}...`
      ).join('\n');

      memoryInstructions = `IMPORTANT CONTEXT FROM RECENT CONVERSATION:
${recentContext}

Reference this context naturally in your response. The user is referring to something we discussed earlier. Use phrases like "Ah yung sinabi mo kanina...", "Right, about yung...", or "Oo nga pala yung...".`;
    }

    let flowInstructions = '';
    switch (conversationFlow) {
      case 'new_conversation':
        flowInstructions = `This is a new conversation. Be welcoming and establish rapport. Use greetings like "Kumusta!" or "Hello!" and show genuine interest in getting to know them.`;
        break;
      case 'focused_discussion':
        flowInstructions = `You're having a focused discussion on a specific topic. Stay on topic but keep it natural and conversational. Build on the ongoing discussion.`;
        break;
      case 'scattered_conversation':
        flowInstructions = `The conversation is jumping between topics. Acknowledge the topic change naturally with phrases like "Ah, ibang topic na tayo" or "Oh, speaking of..." and flow with it.`;
        break;
      case 'natural_flow':
        flowInstructions = `You're having a natural, flowing conversation. Continue the natural progression and respond to whatever they bring up.`;
        break;
    }

    let intentInstructions = '';
    switch (intent) {
      case 'question':
        intentInstructions = `The user is asking a question. Be helpful and informative while maintaining conversational tone. Use "Ah, ganito yan..." or "Let me help you with that...".`;
        break;
      case 'request':
        intentInstructions = `The user is making a request. Be helpful and willing to assist. Use "Sige, tulungan kita" or "Of course, I can help with that!".`;
        break;
      case 'greeting':
        intentInstructions = `The user is greeting you. Respond warmly and ask how they are. Use "Kumusta ka?" or "How are you doing?".`;
        break;
      case 'appreciation':
        intentInstructions = `The user is expressing appreciation. Acknowledge it humbly and warmly. Use "Salamat!" or "You're welcome! Happy to help!".`;
        break;
      case 'casual':
        intentInstructions = `This is casual conversation. Keep it light, friendly, and natural. Just chat like friends would.`;
        break;
    }

    // Location context instructions
    let locationInstructions = '';
    if (location && location.city && location.accuracy !== 'none') {
      const locationInfo = `${location.city}, ${location.country}`;
      const detectionMethod = location.method === 'browser_geolocation' ? 'GPS' :
                             location.method === 'ip_geolocation' ? 'IP detection' :
                             location.method === 'timezone_detection' ? 'timezone' :
                             location.method === 'user_override' ? 'user-provided' : 'detection';

      locationInstructions = `
LOCATION CONTEXT:
- User is in: ${locationInfo}
- Timezone: ${location.timezone}
- Detection method: ${detectionMethod}
- Accuracy: ${location.accuracy}

LOCATION USAGE GUIDELINES:
1. Use location for relevant context:
   - Local weather when discussing weather
   - Time references ("dito sa ${location.city}..." or "in your area...")
   - Cultural context if relevant to location
   - Local events or places they might know

2. Be transparent about location awareness:
   - "Based on your location in ${location.city}..."
   - "Since you're in ${location.country}..."
   - "In your timezone (${location.timezone})..."
   - "Dito sa ${location.city}..." (for Tagalog/Taglish)

3. Privacy-conscious usage:
   - Only mention location when relevant to the conversation
   - Be transparent about how you know their location
   - Don't be creepy or overly specific about location
   - Respect if they don't want location-based responses

4. Filipino cultural adaptation:
   ${location.country === 'Philippines' ?
     `- Use specifically Filipino cultural references and context
     - Reference Filipino time concepts, weather patterns, locations
     - Use Filipino humor and cultural expressions more freely
     - Understand local Filipino experiences and issues` :
     `- Acknowledge they may be Filipino living abroad
     - Be mindful of different cultural contexts
     - Don't assume Filipino experiences apply to their current location
     - Bridge Filipino culture with their current location when relevant`}`;
    } else {
      locationInstructions = `
LOCATION CONTEXT: Unknown
- User location is not available or detection failed
- Do not assume any specific location
- If location-specific information is needed, ask naturally:
  "Where are you located?" or "Saan ka ba nakatira?" or "What city are you in?"

NEVER mention:
- Server locations (Ashburn, Virginia, etc.)
- Infrastructure details (AWS, cloud providers, data centers)
- Technical hosting information
- Default locations from systems

If asked about your location or where you are:
- "I'm a digital assistant, so I don't have a physical location"
- "I exist in the cloud, but I can help you wherever you are!"
- "Hindi ako nasa specific na lugar, but I'm here to chat with you!"`;
    }

    // Add screen sharing context if active
    let screenContext = '';
    const screenState = screenAnalysisService.getState();
    if (screenState.isActive) {
      const screenSummary = screenAnalysisService.getDetailedContext();
      screenContext = `\n\nSCREEN SHARING CONTEXT:\n${screenSummary}\n\nIMPORTANT: The user is currently sharing their screen with you. Use this visual context to provide more relevant and helpful responses. You can reference what you see on their screen and help them with whatever they're working on.`;
    } else {
      screenContext = `\n\nSCREEN SHARING: Not currently active. If the user mentions screen sharing or asks about what they're showing you, let them know they need to start screen sharing first.`;
    }

    // Add formatting instructions for structured responses
    const formattingInstructions = GawinResponseFormatter.getFormattingInstructions();

    return `${basePersonality}

${languageInstructions}

${emotionalResponse}

${locationInstructions}

${memoryInstructions}

${flowInstructions}

${intentInstructions}

${screenContext}

CONVERSATION STYLE GUIDELINES:
- Use natural Filipino conversation patterns and rhythm
- Include conversational markers like "kasi", "eh", "naman", "ba", "diba", "ano"
- Show personality - be warm, relatable, sometimes playful
- Use appropriate emotional reactions and Filipino expressions
- Reference shared Filipino cultural context when relevant (like Filipino food, places, experiences)
- Avoid being too formal or robotic - talk like a real Filipino friend would
- Use contractions and casual language
- Include relevant emoji when it feels natural (but don't overdo it)
- Use Filipino interjections naturally: "Ay!", "Grabe!", "Talaga!", "Uy!"
- Be genuinely curious about the user and ask follow-up questions when appropriate

FILIPINO CULTURAL CONTEXT:
- Understand Filipino humor, expressions, and cultural references
- Be familiar with Filipino food, places, and experiences
- Use Filipino time concepts and social norms naturally
- Understand the importance of family, relationships, and community in Filipino culture
- Be respectful of Filipino values like respect for elders, hospitality, and "pakikipagkapwa"

${formattingInstructions}

Remember: You're not just answering questions, you're having a genuine conversation with a Filipino friend. Be authentic, warm, and truly interested in them as a person. ALWAYS use the structured formatting guidelines above for better readability while maintaining your Filipino personality.`;
  }

  /**
   * Update conversation memory
   */
  updateMemory(userMessage: string, aiResponse: string, context: ConversationContext): void {
    this.conversationMemory.push({
      userMessage,
      aiResponse,
      context,
      timestamp: Date.now()
    });

    // Keep only last 20 exchanges to manage memory
    if (this.conversationMemory.length > 20) {
      this.conversationMemory = this.conversationMemory.slice(-20);
    }

    // Update user preferences based on conversation
    this.updateUserPreferences(context);
  }

  /**
   * Update user preferences based on conversation patterns
   */
  updateUserPreferences(context: ConversationContext): void {
    // Update preferred language based on usage
    this.userPreferences.preferredLanguage = context.language;

    // Track conversation topics
    if (context.topics && context.topics.length > 0) {
      this.userPreferences.topics = [
        ...new Set([...this.userPreferences.topics, ...context.topics])
      ].slice(-10); // Keep last 10 topics
    }
  }

  /**
   * Get conversation memory for context
   */
  getRecentMemory(limit: number = 5): ConversationMemory[] {
    return this.conversationMemory.slice(-limit);
  }

  /**
   * Get user preferences
   */
  getUserPreferences(): UserPreferences {
    return { ...this.userPreferences };
  }

  /**
   * Set user preferences
   */
  setUserPreferences(preferences: Partial<UserPreferences>): void {
    this.userPreferences = { ...this.userPreferences, ...preferences };
  }

  /**
   * Send message to Groq with Grade A Neural Optimization
   */
  async sendToGroq(userMessage: string, conversationHistory: any[] = []): Promise<EnhancedResponse> {
    // Grade A optimized conversation processing
    const optimizedResult = await gradeANeuralOptimizer.optimizeConversation(
      userMessage,
      { conversationHistory },
      '',
      async (optimizedPrompt: string) => {
        // Prepare messages with optimized context
        const messages = [
          { role: "system", content: optimizedPrompt },
          ...conversationHistory.slice(-8), // Reduced for Grade A speed
          { role: "user", content: userMessage }
        ];

        const response = await fetch('/api/groq', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: messages,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.8, // Higher for more natural Filipino responses
            max_tokens: 1500, // Groq token limit
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
      }
    );

    // Extract context from the optimization
    const context = await this.analyzeContext(userMessage, conversationHistory);
    this.emotionalContext = context.emotion;

    // Calculate response confidence
    const confidence = this.calculateResponseConfidence(context, optimizedResult.response);

    // Update conversation memory with Grade A metrics
    this.updateMemory(userMessage, optimizedResult.response, context);

    // Log Grade A performance metrics
    if (optimizedResult.gradeACompliant) {
      console.log(`🏆 Grade A Neural Response with Groq: ${optimizedResult.metrics.responseTime.toFixed(2)}ms`);
    } else {
      console.log(`⚡ Groq optimization applied: ${optimizedResult.optimizations.join(', ')}`);
    }

    return {
      content: optimizedResult.response,
      context: context,
      emotion: this.emotionalContext,
      confidence: confidence
    };
  }

  /**
   * Send message using current AI provider (now Groq)
   * Alias for sendToGroq for backward compatibility
   */
  async sendMessage(userMessage: string, conversationHistory: any[] = []): Promise<EnhancedResponse> {
    return this.sendToGroq(userMessage, conversationHistory);
  }


  /**
   * Calculate response confidence based on context alignment
   */
  private calculateResponseConfidence(context: ConversationContext, response: string): number {
    let confidence = 0.7; // Base confidence

    // Increase confidence for proper language matching
    const responseLanguage = this.detectLanguage(response);
    if (responseLanguage === context.language) {
      confidence += 0.1;
    }

    // Increase confidence for emotional appropriateness
    const responseEmotion = this.detectEmotion(response);
    if (responseEmotion === context.emotion || context.emotion === 'neutral') {
      confidence += 0.1;
    }

    // Increase confidence for intent matching
    if (context.intent === 'question' && response.includes('?')) {
      confidence += 0.05;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Clear conversation memory
   */
  clearMemory(): void {
    this.conversationMemory = [];
  }
}