// Advanced Memory and Context Retention Service inspired by Atlassian Rovo AI
// Implements Teamwork Graph-like semantic understanding and session management

interface ConversationContext {
  id: string;
  sessionId: string;
  timestamp: Date;
  userId?: string;
  topic: string;
  intent: string;
  entities: ExtractedEntity[];
  sentiment: 'positive' | 'neutral' | 'negative';
  complexity: 'simple' | 'medium' | 'complex';
  followUpNeeded: boolean;
}

interface ExtractedEntity {
  type: 'person' | 'organization' | 'technology' | 'concept' | 'task' | 'location' | 'date';
  value: string;
  confidence: number;
  context: string;
}

interface KnowledgeGraph {
  entities: Map<string, ExtractedEntity[]>;
  relationships: Map<string, string[]>;
  topics: Map<string, ConversationContext[]>;
  userPreferences: Map<string, any>;
  sessionHistory: Map<string, ConversationContext[]>;
}

interface MemoryRetention {
  shortTerm: ConversationContext[]; // Last 10 messages
  mediumTerm: ConversationContext[]; // Last session
  longTerm: KnowledgeGraph; // Persistent knowledge
  workingMemory: ConversationContext[]; // Current conversation thread
}

class MemoryService {
  private memory: MemoryRetention;
  private currentSessionId: string;
  private readonly MAX_SHORT_TERM = 10;
  private readonly MAX_MEDIUM_TERM = 100;
  
  constructor() {
    this.currentSessionId = this.generateSessionId();
    this.memory = {
      shortTerm: [],
      mediumTerm: [],
      longTerm: {
        entities: new Map(),
        relationships: new Map(),
        topics: new Map(),
        userPreferences: new Map(),
        sessionHistory: new Map()
      },
      workingMemory: []
    };
    
    // Load from localStorage if available
    this.loadFromStorage();
  }

  /**
   * Core memory retention function - inspired by Rovo's context tracking
   */
  addConversationContext(
    userMessage: string, 
    assistantResponse: string, 
    metadata: any
  ): ConversationContext {
    const context: ConversationContext = {
      id: Date.now().toString(),
      sessionId: this.currentSessionId,
      timestamp: new Date(),
      topic: this.extractTopic(userMessage, assistantResponse),
      intent: metadata.intentAnalysis?.intent || 'text',
      entities: this.extractEntities(userMessage + ' ' + assistantResponse),
      sentiment: this.analyzeSentiment(userMessage),
      complexity: this.assessComplexity(userMessage, assistantResponse),
      followUpNeeded: this.detectFollowUpNeed(userMessage, assistantResponse)
    };

    // Add to all memory layers
    this.addToShortTerm(context);
    this.addToMediumTerm(context);
    this.addToLongTerm(context);
    this.updateWorkingMemory(context);

    // Save to persistent storage
    this.saveToStorage();

    return context;
  }

  /**
   * Teamwork Graph-inspired entity extraction
   */
  private extractEntities(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const lowerText = text.toLowerCase();

    // Technology entities
    const techKeywords = [
      'javascript', 'python', 'react', 'node', 'typescript', 'ai', 'machine learning',
      'database', 'api', 'sql', 'html', 'css', 'docker', 'kubernetes', 'aws', 'git'
    ];
    
    techKeywords.forEach(tech => {
      if (lowerText.includes(tech)) {
        entities.push({
          type: 'technology',
          value: tech,
          confidence: 0.8,
          context: this.extractContext(text, tech)
        });
      }
    });

    // Concept entities
    const conceptKeywords = [
      'project', 'task', 'problem', 'solution', 'algorithm', 'design', 'architecture',
      'performance', 'security', 'testing', 'deployment', 'optimization'
    ];
    
    conceptKeywords.forEach(concept => {
      if (lowerText.includes(concept)) {
        entities.push({
          type: 'concept',
          value: concept,
          confidence: 0.7,
          context: this.extractContext(text, concept)
        });
      }
    });

    // Organization entities (common companies/services)
    const orgKeywords = [
      'google', 'microsoft', 'amazon', 'apple', 'meta', 'openai', 'anthropic',
      'atlassian', 'github', 'stackoverflow', 'linkedin', 'twitter'
    ];
    
    orgKeywords.forEach(org => {
      if (lowerText.includes(org)) {
        entities.push({
          type: 'organization',
          value: org,
          confidence: 0.9,
          context: this.extractContext(text, org)
        });
      }
    });

    return entities;
  }

  /**
   * Extract contextual information around keywords
   */
  private extractContext(text: string, keyword: string): string {
    const lowerText = text.toLowerCase();
    const keywordIndex = lowerText.indexOf(keyword.toLowerCase());
    if (keywordIndex === -1) return '';

    const start = Math.max(0, keywordIndex - 30);
    const end = Math.min(text.length, keywordIndex + keyword.length + 30);
    return text.substring(start, end);
  }

  /**
   * Topic extraction based on conversation content
   */
  private extractTopic(userMessage: string, assistantResponse: string): string {
    const combined = (userMessage + ' ' + assistantResponse).toLowerCase();
    
    // Common topic patterns
    const topicPatterns = [
      { pattern: /programming|coding|software|development/, topic: 'programming' },
      { pattern: /design|ui|ux|interface/, topic: 'design' },
      { pattern: /data|database|sql|analytics/, topic: 'data' },
      { pattern: /ai|artificial intelligence|machine learning|ml/, topic: 'ai' },
      { pattern: /recipe|cooking|food|ingredients/, topic: 'cooking' },
      { pattern: /weather|temperature|climate/, topic: 'weather' },
      { pattern: /business|company|startup|entrepreneur/, topic: 'business' },
      { pattern: /education|learning|study|course/, topic: 'education' },
      { pattern: /health|medical|doctor|medicine/, topic: 'health' },
      { pattern: /travel|vacation|trip|destination/, topic: 'travel' }
    ];

    for (const { pattern, topic } of topicPatterns) {
      if (pattern.test(combined)) {
        return topic;
      }
    }

    return 'general';
  }

  /**
   * Sentiment analysis for conversation tone
   */
  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const lowerText = text.toLowerCase();
    
    const positiveWords = ['good', 'great', 'awesome', 'excellent', 'perfect', 'love', 'like', 'amazing', 'wonderful', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst', 'annoying', 'frustrated', 'disappointed'];
    
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Assess conversation complexity
   */
  private assessComplexity(userMessage: string, assistantResponse: string): 'simple' | 'medium' | 'complex' {
    const totalLength = userMessage.length + assistantResponse.length;
    const wordCount = (userMessage + ' ' + assistantResponse).split(' ').length;
    
    if (totalLength > 1000 || wordCount > 200) return 'complex';
    if (totalLength > 300 || wordCount > 50) return 'medium';
    return 'simple';
  }

  /**
   * Detect if follow-up questions might be needed
   */
  private detectFollowUpNeed(userMessage: string, assistantResponse: string): boolean {
    const followUpIndicators = [
      'more information', 'tell me more', 'explain further', 'what about',
      'how do', 'can you', 'would you', 'could you', 'any other'
    ];
    
    const combined = (userMessage + ' ' + assistantResponse).toLowerCase();
    return followUpIndicators.some(indicator => combined.includes(indicator));
  }

  /**
   * Memory layer management
   */
  private addToShortTerm(context: ConversationContext): void {
    this.memory.shortTerm.push(context);
    if (this.memory.shortTerm.length > this.MAX_SHORT_TERM) {
      this.memory.shortTerm.shift();
    }
  }

  private addToMediumTerm(context: ConversationContext): void {
    this.memory.mediumTerm.push(context);
    if (this.memory.mediumTerm.length > this.MAX_MEDIUM_TERM) {
      // Move oldest to long-term storage
      const oldest = this.memory.mediumTerm.shift();
      if (oldest) {
        this.archiveToLongTerm(oldest);
      }
    }
  }

  private addToLongTerm(context: ConversationContext): void {
    // Add entities to knowledge graph
    context.entities.forEach(entity => {
      const key = `${entity.type}:${entity.value}`;
      if (!this.memory.longTerm.entities.has(key)) {
        this.memory.longTerm.entities.set(key, []);
      }
      this.memory.longTerm.entities.get(key)!.push(entity);
    });

    // Add to topic mapping
    if (!this.memory.longTerm.topics.has(context.topic)) {
      this.memory.longTerm.topics.set(context.topic, []);
    }
    this.memory.longTerm.topics.get(context.topic)!.push(context);
  }

  private updateWorkingMemory(context: ConversationContext): void {
    this.memory.workingMemory.push(context);
    // Keep only current conversation thread (same topic or recent)
    const cutoffTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes
    this.memory.workingMemory = this.memory.workingMemory.filter(
      ctx => ctx.timestamp > cutoffTime || ctx.topic === context.topic
    );
  }

  private archiveToLongTerm(context: ConversationContext): void {
    // Archive significant conversations to long-term memory
    if (context.complexity === 'complex' || context.entities.length > 2) {
      const sessionKey = context.sessionId;
      if (!this.memory.longTerm.sessionHistory.has(sessionKey)) {
        this.memory.longTerm.sessionHistory.set(sessionKey, []);
      }
      this.memory.longTerm.sessionHistory.get(sessionKey)!.push(context);
    }
  }

  /**
   * Intelligent context retrieval for better responses
   */
  getRelevantContext(query: string, intent: string): ConversationContext[] {
    const relevantContexts: ConversationContext[] = [];
    const queryLower = query.toLowerCase();

    // Check working memory first (most recent and relevant)
    const workingMemoryMatches = this.memory.workingMemory.filter(ctx =>
      ctx.topic === this.extractTopic(query, '') ||
      ctx.entities.some(entity => queryLower.includes(entity.value.toLowerCase())) ||
      ctx.intent === intent
    );
    relevantContexts.push(...workingMemoryMatches);

    // Check medium-term memory for related topics
    const mediumTermMatches = this.memory.mediumTerm
      .filter(ctx => ctx.topic === this.extractTopic(query, ''))
      .slice(-3); // Last 3 related conversations
    relevantContexts.push(...mediumTermMatches);

    // Check long-term memory for entities
    const entities = this.extractEntities(query);
    entities.forEach(entity => {
      const key = `${entity.type}:${entity.value}`;
      if (this.memory.longTerm.entities.has(key)) {
        const entityContexts = this.memory.longTerm.topics.get(entity.value) || [];
        relevantContexts.push(...entityContexts.slice(-2)); // Last 2 mentions
      }
    });

    // Remove duplicates and sort by relevance
    const uniqueContexts = Array.from(new Set(relevantContexts));
    return uniqueContexts.sort((a, b) => {
      // Ensure timestamps are Date objects
      const timestampA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
      const timestampB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
      return timestampB.getTime() - timestampA.getTime();
    }).slice(0, 5);
  }

  /**
   * Get conversation summary for context
   */
  getConversationSummary(): string {
    if (this.memory.workingMemory.length === 0) return '';

    const currentTopic = this.memory.workingMemory[this.memory.workingMemory.length - 1]?.topic;
    const topicCount = this.memory.workingMemory.filter(ctx => ctx.topic === currentTopic).length;
    const entities = this.memory.workingMemory
      .flatMap(ctx => ctx.entities)
      .reduce((acc, entity) => {
        acc[entity.value] = (acc[entity.value] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topEntities = Object.entries(entities)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([entity]) => entity);

    return `Current conversation: ${currentTopic} (${topicCount} messages). Key topics: ${topEntities.join(', ')}`;
  }

  /**
   * Persistent storage management
   */
  private saveToStorage(): void {
    try {
      const memoryData = {
        mediumTerm: this.memory.mediumTerm.slice(-20), // Save last 20 medium-term
        longTerm: {
          entities: Array.from(this.memory.longTerm.entities.entries()),
          topics: Array.from(this.memory.longTerm.topics.entries()),
          sessionHistory: Array.from(this.memory.longTerm.sessionHistory.entries())
        },
        sessionId: this.currentSessionId,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('gawyn_memory', JSON.stringify(memoryData));
    } catch (error) {
      console.warn('Failed to save memory to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('gawyn_memory');
      if (stored) {
        const memoryData = JSON.parse(stored);
        
        // Restore medium-term memory
        this.memory.mediumTerm = memoryData.mediumTerm || [];
        
        // Restore long-term memory
        if (memoryData.longTerm) {
          this.memory.longTerm.entities = new Map(memoryData.longTerm.entities || []);
          this.memory.longTerm.topics = new Map(memoryData.longTerm.topics || []);
          this.memory.longTerm.sessionHistory = new Map(memoryData.longTerm.sessionHistory || []);
        }
        
        console.log('🧠 Memory restored from storage');
      }
    } catch (error) {
      console.warn('Failed to load memory from storage:', error);
    }
  }

  /**
   * Utility functions
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Clear memory (privacy compliance)
   */
  clearMemory(): void {
    this.memory = {
      shortTerm: [],
      mediumTerm: [],
      longTerm: {
        entities: new Map(),
        relationships: new Map(),
        topics: new Map(),
        userPreferences: new Map(),
        sessionHistory: new Map()
      },
      workingMemory: []
    };
    localStorage.removeItem('gawyn_memory');
    console.log('🧠 Memory cleared');
  }

  /**
   * Get memory statistics
   */
  getMemoryStats(): any {
    return {
      shortTerm: this.memory.shortTerm.length,
      mediumTerm: this.memory.mediumTerm.length,
      entities: this.memory.longTerm.entities.size,
      topics: this.memory.longTerm.topics.size,
      sessions: this.memory.longTerm.sessionHistory.size,
      workingMemory: this.memory.workingMemory.length,
      currentSession: this.currentSessionId
    };
  }

  /**
   * Start new session (like Rovo's session management)
   */
  startNewSession(): void {
    // Archive current working memory
    this.memory.workingMemory.forEach(ctx => this.archiveToLongTerm(ctx));
    
    // Clear working memory and start fresh
    this.memory.workingMemory = [];
    this.currentSessionId = this.generateSessionId();
    
    console.log('🧠 New session started:', this.currentSessionId);
  }
}

export const memoryService = new MemoryService();