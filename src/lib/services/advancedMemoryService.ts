/**
 * Advanced Memory Service - True AI Partnership Intelligence
 * Implements persistent conversation memory with learning capabilities
 * Part of the Gawin AI Autonomous Intelligence Architecture
 */

import { ChatMessage } from '../types';

interface ConversationContext {
  sessionId: string;
  userId: string;
  timestamp: Date;
  topic: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  language: 'english' | 'filipino' | 'taglish';
  urgency: 'low' | 'medium' | 'high';
  complexity: number; // 1-10 scale
}

interface UserPreference {
  communicationStyle: 'formal' | 'casual' | 'technical' | 'creative';
  preferredResponseLength: 'brief' | 'detailed' | 'comprehensive';
  languagePreference: 'english' | 'filipino' | 'adaptive';
  topicInterests: string[];
  taskPatterns: TaskPattern[];
  timePreferences: TimePreference;
}

interface TaskPattern {
  taskType: string;
  frequency: number;
  lastUsed: Date;
  successRate: number;
  preferredApproach: string;
}

interface TimePreference {
  activeHours: { start: number; end: number };
  timezone: string;
  workDays: number[];
  responseSpeedPreference: 'instant' | 'thoughtful' | 'comprehensive';
}

interface MemoryCluster {
  id: string;
  topic: string;
  messages: ChatMessage[];
  context: ConversationContext[];
  importance: number; // 1-10 scale
  lastAccessed: Date;
  accessCount: number;
  relationships: string[]; // IDs of related clusters
}

interface LearningInsight {
  type: 'preference' | 'pattern' | 'goal' | 'style';
  insight: string;
  confidence: number;
  evidence: string[];
  timestamp: Date;
  actionable: boolean;
}

class AdvancedMemoryService {
  private memoryClusters: Map<string, MemoryCluster> = new Map();
  private userPreferences: Map<string, UserPreference> = new Map();
  private learningInsights: Map<string, LearningInsight[]> = new Map();
  private sessionMemory: Map<string, ChatMessage[]> = new Map();
  
  // Advanced conversation analysis
  analyzeConversationContext(message: ChatMessage, previousMessages: ChatMessage[]): ConversationContext {
    const context: ConversationContext = {
      sessionId: this.getCurrentSessionId(),
      userId: 'current_user', // Will be dynamic when auth is added
      timestamp: new Date(),
      topic: this.extractTopic(message.content, previousMessages),
      sentiment: this.analyzeSentiment(message.content),
      language: this.detectLanguagePattern(message.content),
      urgency: this.assessUrgency(message.content),
      complexity: this.assessComplexity(message.content, previousMessages)
    };
    
    return context;
  }
  
  // Store conversation with intelligent clustering
  storeConversation(userMessage: ChatMessage, aiResponse: ChatMessage, context: ConversationContext): void {
    const clusterId = this.findOrCreateCluster(context.topic, context);
    const cluster = this.memoryClusters.get(clusterId);
    
    if (cluster) {
      cluster.messages.push(userMessage, aiResponse);
      cluster.context.push(context);
      cluster.lastAccessed = new Date();
      cluster.accessCount++;
      
      // Update importance based on frequency and recency
      cluster.importance = this.calculateImportance(cluster);
    }
    
    // Store in session memory for immediate access
    const sessionId = this.getCurrentSessionId();
    const sessionMessages = this.sessionMemory.get(sessionId) || [];
    sessionMessages.push(userMessage, aiResponse);
    this.sessionMemory.set(sessionId, sessionMessages);
    
    // Generate learning insights
    this.generateLearningInsights(userMessage, aiResponse, context);
  }
  
  // Retrieve relevant context for new messages
  getRelevantContext(currentMessage: string, maxContexts: number = 5): MemoryCluster[] {
    const relevantClusters: { cluster: MemoryCluster; relevance: number }[] = [];
    
    for (const cluster of this.memoryClusters.values()) {
      const relevance = this.calculateRelevance(currentMessage, cluster);
      if (relevance > 0.3) { // Threshold for relevance
        relevantClusters.push({ cluster, relevance });
      }
    }
    
    // Sort by relevance and return top matches
    return relevantClusters
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxContexts)
      .map(item => item.cluster);
  }
  
  // Learn user preferences from interactions
  updateUserPreferences(userId: string, interaction: ChatMessage, response: ChatMessage, feedback?: 'positive' | 'negative'): void {
    let preferences = this.userPreferences.get(userId) || this.createDefaultPreferences();
    
    // Analyze communication style
    const communicationStyle = this.analyzeMessageStyle(interaction.content);
    preferences.communicationStyle = this.adaptPreference(preferences.communicationStyle, communicationStyle);
    
    // Learn response length preference
    if (feedback === 'positive') {
      const responseLength = this.categorizeResponseLength(response.content);
      preferences.preferredResponseLength = responseLength;
    }
    
    // Track topic interests
    const topic = this.extractTopic(interaction.content, []);
    if (topic && !preferences.topicInterests.includes(topic)) {
      preferences.topicInterests.push(topic);
    }
    
    // Update time preferences
    this.updateTimePreferences(preferences.timePreferences, new Date());
    
    this.userPreferences.set(userId, preferences);
  }
  
  // Generate proactive suggestions
  generateProactiveSuggestions(currentContext: ConversationContext): string[] {
    const suggestions: string[] = [];
    const userId = currentContext.userId;
    const preferences = this.userPreferences.get(userId);
    
    if (!preferences) return suggestions;
    
    // Suggest based on task patterns
    const relevantPatterns = preferences.taskPatterns.filter(pattern => 
      pattern.taskType.includes(currentContext.topic)
    );
    
    for (const pattern of relevantPatterns) {
      if (pattern.successRate > 0.7) {
        suggestions.push(`Based on your previous work with ${pattern.taskType}, would you like me to ${pattern.preferredApproach}?`);
      }
    }
    
    // Suggest based on time patterns
    const currentHour = new Date().getHours();
    if (this.isWithinActiveHours(currentHour, preferences.timePreferences)) {
      suggestions.push("I notice you're most productive at this time. Shall we tackle something challenging?");
    }
    
    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }
  
  // Get conversation summary for context
  getConversationSummary(sessionId?: string): string {
    const messages = sessionId ? 
      this.sessionMemory.get(sessionId) || [] : 
      Array.from(this.sessionMemory.values()).flat();
    
    if (messages.length === 0) return "No previous conversation in this session.";
    
    const topics = new Set<string>();
    const keyPoints: string[] = [];
    
    for (let i = 0; i < messages.length; i += 2) {
      const userMsg = messages[i];
      const aiMsg = messages[i + 1];
      
      if (userMsg && aiMsg) {
        const topic = this.extractTopic(userMsg.content, []);
        if (topic) topics.add(topic);
        
        // Extract key points from important messages
        if (userMsg.content.length > 100 || aiMsg.content.length > 200) {
          keyPoints.push(`Discussed: ${topic || 'general topic'}`);
        }
      }
    }
    
    return `Session topics: ${Array.from(topics).join(', ')}. Key points: ${keyPoints.join('; ')}.`;
  }
  
  // Private helper methods
  private getCurrentSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private extractTopic(content: string, previousMessages: ChatMessage[]): string {
    // Simple topic extraction - can be enhanced with NLP
    const keywords = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const topicKeywords = keywords.filter(word => 
      !['this', 'that', 'with', 'from', 'they', 'were', 'been', 'have', 'will', 'can', 'could', 'would', 'should'].includes(word)
    );
    
    return topicKeywords[0] || 'general';
  }
  
  private analyzeSentiment(content: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'perfect', 'love', 'like', 'awesome'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'problem', 'issue', 'error'];
    
    const words = content.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }
  
  private detectLanguagePattern(content: string): 'english' | 'filipino' | 'taglish' {
    const filipinoWords = ['ako', 'ikaw', 'siya', 'tayo', 'kayo', 'sila', 'ang', 'ng', 'sa', 'para', 'kasi', 'pero', 'tapos', 'saan', 'ano', 'bakit'];
    const words = content.toLowerCase().split(/\s+/);
    const filipinoCount = words.filter(word => filipinoWords.includes(word)).length;
    const filipinoRatio = filipinoCount / words.length;
    
    if (filipinoRatio > 0.3) return 'filipino';
    if (filipinoRatio > 0.1) return 'taglish';
    return 'english';
  }
  
  private assessUrgency(content: string): 'low' | 'medium' | 'high' {
    const urgentWords = ['urgent', 'asap', 'immediately', 'quickly', 'fast', 'rush', 'emergency'];
    const urgentPhrases = ['need now', 'right away', 'as soon as', 'time sensitive'];
    
    const hasUrgentWords = urgentWords.some(word => content.toLowerCase().includes(word));
    const hasUrgentPhrases = urgentPhrases.some(phrase => content.toLowerCase().includes(phrase));
    const hasExclamation = content.includes('!');
    const hasQuestion = content.includes('?');
    
    if (hasUrgentWords || hasUrgentPhrases) return 'high';
    if (hasExclamation || (hasQuestion && content.length < 50)) return 'medium';
    return 'low';
  }
  
  private assessComplexity(content: string, previousMessages: ChatMessage[]): number {
    let complexity = 1;
    
    // Length factor
    if (content.length > 200) complexity += 2;
    if (content.length > 500) complexity += 2;
    
    // Technical terms factor
    const technicalWords = ['algorithm', 'database', 'function', 'variable', 'class', 'method', 'api', 'framework'];
    const techCount = technicalWords.filter(word => content.toLowerCase().includes(word)).length;
    complexity += techCount;
    
    // Question complexity factor
    const questionWords = ['how', 'why', 'what', 'where', 'when', 'which'];
    const questionCount = questionWords.filter(word => content.toLowerCase().includes(word)).length;
    complexity += questionCount;
    
    // Context dependency factor
    if (previousMessages.length > 5) complexity += 1;
    
    return Math.min(complexity, 10);
  }
  
  private findOrCreateCluster(topic: string, context: ConversationContext): string {
    // Find existing cluster with similar topic
    for (const [id, cluster] of this.memoryClusters.entries()) {
      if (cluster.topic === topic || this.calculateTopicSimilarity(cluster.topic, topic) > 0.7) {
        return id;
      }
    }
    
    // Create new cluster
    const clusterId = `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newCluster: MemoryCluster = {
      id: clusterId,
      topic,
      messages: [],
      context: [],
      importance: 1,
      lastAccessed: new Date(),
      accessCount: 1,
      relationships: []
    };
    
    this.memoryClusters.set(clusterId, newCluster);
    return clusterId;
  }
  
  private calculateImportance(cluster: MemoryCluster): number {
    const recencyFactor = this.calculateRecencyFactor(cluster.lastAccessed);
    const frequencyFactor = Math.min(cluster.accessCount / 10, 1);
    const lengthFactor = Math.min(cluster.messages.length / 20, 1);
    
    return Math.min((recencyFactor + frequencyFactor + lengthFactor) * 3.33, 10);
  }
  
  private calculateRecencyFactor(lastAccessed: Date): number {
    const daysSinceAccess = (Date.now() - lastAccessed.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(1 - (daysSinceAccess / 30), 0); // Decay over 30 days
  }
  
  private calculateRelevance(currentMessage: string, cluster: MemoryCluster): number {
    const topicSimilarity = this.calculateTopicSimilarity(currentMessage, cluster.topic);
    const importanceFactor = cluster.importance / 10;
    const recencyFactor = this.calculateRecencyFactor(cluster.lastAccessed);
    
    return (topicSimilarity * 0.5 + importanceFactor * 0.3 + recencyFactor * 0.2);
  }
  
  private calculateTopicSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));
    
    return commonWords.length / Math.max(words1.length, words2.length);
  }
  
  private createDefaultPreferences(): UserPreference {
    return {
      communicationStyle: 'casual',
      preferredResponseLength: 'detailed',
      languagePreference: 'adaptive',
      topicInterests: [],
      taskPatterns: [],
      timePreferences: {
        activeHours: { start: 9, end: 17 },
        timezone: 'Asia/Manila',
        workDays: [1, 2, 3, 4, 5],
        responseSpeedPreference: 'thoughtful'
      }
    };
  }
  
  private analyzeMessageStyle(content: string): 'formal' | 'casual' | 'technical' | 'creative' {
    const formalIndicators = ['please', 'kindly', 'would you', 'could you', 'thank you'];
    const casualIndicators = ['hey', 'hi', 'yeah', 'ok', 'cool', 'awesome'];
    const technicalIndicators = ['function', 'variable', 'algorithm', 'database', 'implement'];
    const creativeIndicators = ['creative', 'innovative', 'artistic', 'design', 'brainstorm'];
    
    const lowerContent = content.toLowerCase();
    const formalCount = formalIndicators.filter(word => lowerContent.includes(word)).length;
    const casualCount = casualIndicators.filter(word => lowerContent.includes(word)).length;
    const technicalCount = technicalIndicators.filter(word => lowerContent.includes(word)).length;
    const creativeCount = creativeIndicators.filter(word => lowerContent.includes(word)).length;
    
    const max = Math.max(formalCount, casualCount, technicalCount, creativeCount);
    if (max === formalCount) return 'formal';
    if (max === casualCount) return 'casual';
    if (max === technicalCount) return 'technical';
    if (max === creativeCount) return 'creative';
    
    return 'casual'; // default
  }
  
  private adaptPreference<T>(current: T, new_preference: T): T {
    // Simple adaptation - in reality, this could be more sophisticated
    return new_preference;
  }
  
  private categorizeResponseLength(content: string): 'brief' | 'detailed' | 'comprehensive' {
    const length = content.length;
    if (length < 200) return 'brief';
    if (length < 800) return 'detailed';
    return 'comprehensive';
  }
  
  private updateTimePreferences(timePrefs: TimePreference, timestamp: Date): void {
    const hour = timestamp.getHours();
    const day = timestamp.getDay();
    
    // Simple learning - could be more sophisticated
    if (!timePrefs.workDays.includes(day)) {
      timePrefs.workDays.push(day);
    }
    
    // Expand active hours if user is active outside current range
    if (hour < timePrefs.activeHours.start) {
      timePrefs.activeHours.start = Math.max(0, hour - 1);
    }
    if (hour > timePrefs.activeHours.end) {
      timePrefs.activeHours.end = Math.min(23, hour + 1);
    }
  }
  
  private isWithinActiveHours(hour: number, timePrefs: TimePreference): boolean {
    return hour >= timePrefs.activeHours.start && hour <= timePrefs.activeHours.end;
  }
  
  private generateLearningInsights(userMessage: ChatMessage, aiResponse: ChatMessage, context: ConversationContext): void {
    const insights: LearningInsight[] = [];
    const userId = context.userId;
    
    // Analyze patterns
    if (context.urgency === 'high' && context.complexity > 7) {
      insights.push({
        type: 'pattern',
        insight: 'User tends to ask complex questions when in urgent situations',
        confidence: 0.7,
        evidence: [userMessage.content.substring(0, 100)],
        timestamp: new Date(),
        actionable: true
      });
    }
    
    // Language preference insights
    if (context.language === 'taglish') {
      insights.push({
        type: 'preference',
        insight: 'User prefers Taglish communication style',
        confidence: 0.8,
        evidence: [userMessage.content],
        timestamp: new Date(),
        actionable: true
      });
    }
    
    // Store insights
    const existingInsights = this.learningInsights.get(userId) || [];
    this.learningInsights.set(userId, [...existingInsights, ...insights]);
  }
  
  // Public methods for integration
  getMemoryStats(): { clusters: number; preferences: number; insights: number } {
    return {
      clusters: this.memoryClusters.size,
      preferences: this.userPreferences.size,
      insights: Array.from(this.learningInsights.values()).reduce((sum, insights) => sum + insights.length, 0)
    };
  }
  
  clearSession(sessionId?: string): void {
    if (sessionId) {
      this.sessionMemory.delete(sessionId);
    } else {
      this.sessionMemory.clear();
    }
  }
  
  exportMemoryData(): any {
    return {
      clusters: Array.from(this.memoryClusters.entries()),
      preferences: Array.from(this.userPreferences.entries()),
      insights: Array.from(this.learningInsights.entries())
    };
  }
}

// Create singleton instance
export const advancedMemoryService = new AdvancedMemoryService();
export default advancedMemoryService;