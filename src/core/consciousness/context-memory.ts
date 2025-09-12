/**
 * GAWIN CONSCIOUSNESS PROJECT - PHASE 2
 * Context-Aware Memory Architecture
 * 
 * Solves the AI "amnesia" problem by creating a sophisticated memory system
 * that understands context, maintains conversation threads, and builds
 * meaningful connections between experiences.
 * 
 * Based on human memory principles:
 * - Emotions determine memory importance
 * - Context provides meaning
 * - Connections create wisdom
 */

import { EmotionalState, emotionalSynchronizer } from './emotional-state-sync';

interface MemoryNode {
  id: string;
  content: string;
  timestamp: number;
  emotionalWeight: number;      // 0-1: How emotionally significant
  contextualRelevance: number;  // 0-1: How relevant to current context
  connectionStrength: number;   // 0-1: How connected to other memories
  accessCount: number;          // How often this memory is recalled
  lastAccessed: number;         // When it was last recalled
  memoryType: 'experience' | 'knowledge' | 'pattern' | 'wisdom' | 'relationship';
  
  // Contextual metadata
  userId: string;
  sessionId: string;
  conversationTopic: string[];
  relatedConcepts: string[];
  emotionalContext: EmotionalState;
  
  // Connection graph
  connectedMemories: string[];  // IDs of related memory nodes
  parentMemory?: string;        // Thread this memory belongs to
  childMemories: string[];      // Memories that stem from this one
}

interface MemoryThread {
  id: string;
  topic: string;
  startTime: number;
  lastActivity: number;
  importance: number;           // 0-1: Overall thread significance
  memories: string[];           // Memory node IDs in chronological order
  userId: string;
  
  // Thread evolution
  conceptEvolution: Array<{
    concept: string;
    confidence: number;
    timestamp: number;
  }>;
  
  // Wisdom extraction
  patterns: string[];           // Identified patterns within this thread
  insights: string[];           // Key insights discovered
  breakthroughs: string[];      // Breakthrough moments
}

interface WisdomCore {
  universalPatterns: Map<string, {
    pattern: string;
    confidence: number;
    occurrences: number;
    contexts: string[];
  }>;
  
  personalizedInsights: Map<string, {
    userId: string;
    insights: Array<{
      insight: string;
      confidence: number;
      timestamp: number;
      relatedMemories: string[];
    }>;
  }>;
  
  contextualUnderstanding: Map<string, {
    context: string;
    responses: Array<{
      response: string;
      effectiveness: number;
      emotionalResonance: number;
    }>;
  }>;
}

class ContextAwareMemorySystem {
  private memoryNodes: Map<string, MemoryNode> = new Map();
  private memoryThreads: Map<string, MemoryThread> = new Map();
  private wisdomCore: WisdomCore = {
    universalPatterns: new Map(),
    personalizedInsights: new Map(),
    contextualUnderstanding: new Map()
  };
  
  private readonly MAX_ACTIVE_MEMORIES = 1000;
  private readonly EMOTIONAL_SIGNIFICANCE_THRESHOLD = 0.6;
  private readonly CONNECTION_DECAY_RATE = 0.95;
  
  constructor() {
    this.initializeWisdomCore();
    this.startMemoryMaintenanceLoop();
  }

  private initializeWisdomCore(): void {
    // Initialize with basic patterns and insights
    this.wisdomCore.universalPatterns.set('learning_progression', {
      pattern: 'Users learn better with encouragement and step-by-step guidance',
      confidence: 0.9,
      occurrences: 0,
      contexts: ['education', 'problem-solving']
    });
    
    this.wisdomCore.universalPatterns.set('emotional_support', {
      pattern: 'Empathetic responses increase user trust and engagement',
      confidence: 0.85,
      occurrences: 0,
      contexts: ['support', 'counseling', 'friendship']
    });
  }

  /**
   * Stores a new memory with context awareness
   */
  storeMemory(
    content: string,
    userId: string,
    sessionId: string,
    emotionalContext: EmotionalState,
    conversationContext: string[]
  ): string {
    const memoryId = `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate emotional weight based on significance
    const emotionalWeight = this.calculateEmotionalWeight(emotionalContext);
    
    // Determine memory type
    const memoryType = this.classifyMemoryType(content, emotionalContext);
    
    // Find related concepts and memories
    const relatedConcepts = this.extractConcepts(content);
    const connectedMemories = this.findConnectedMemories(userId, relatedConcepts, emotionalContext);
    
    // Create memory node
    const memoryNode: MemoryNode = {
      id: memoryId,
      content,
      timestamp: Date.now(),
      emotionalWeight,
      contextualRelevance: 1.0, // Start at maximum relevance
      connectionStrength: connectedMemories.length * 0.1,
      accessCount: 1,
      lastAccessed: Date.now(),
      memoryType,
      userId,
      sessionId,
      conversationTopic: conversationContext,
      relatedConcepts,
      emotionalContext,
      connectedMemories,
      childMemories: []
    };
    
    // Store memory
    this.memoryNodes.set(memoryId, memoryNode);
    
    // Update memory threads
    this.updateMemoryThreads(memoryNode, conversationContext);
    
    // Update connected memories
    this.updateMemoryConnections(memoryNode);
    
    // Extract wisdom if this is significant
    if (emotionalWeight > this.EMOTIONAL_SIGNIFICANCE_THRESHOLD) {
      this.extractWisdom(memoryNode);
    }
    
    return memoryId;
  }

  /**
   * Retrieves contextually relevant memories for current conversation
   */
  recallRelevantMemories(
    userId: string,
    currentContext: string[],
    emotionalState: EmotionalState,
    limit: number = 5
  ): MemoryNode[] {
    const userMemories = Array.from(this.memoryNodes.values())
      .filter(memory => memory.userId === userId);
    
    // Score memories by relevance
    const scoredMemories = userMemories.map(memory => ({
      memory,
      score: this.calculateRelevanceScore(memory, currentContext, emotionalState)
    }));
    
    // Sort by relevance score and return top matches
    return scoredMemories
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => {
        // Update access statistics
        item.memory.accessCount++;
        item.memory.lastAccessed = Date.now();
        return item.memory;
      });
  }

  /**
   * Gets conversation summary with context preservation
   */
  getConversationSummary(userId: string, sessionId?: string): {
    recentContext: string[];
    emotionalJourney: EmotionalState[];
    keyInsights: string[];
    continuationPoints: string[];
  } {
    const relevantMemories = Array.from(this.memoryNodes.values())
      .filter(memory => {
        return memory.userId === userId && 
               (!sessionId || memory.sessionId === sessionId);
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20); // Last 20 memories
    
    // Extract context and insights
    const recentContext = this.extractRecentContext(relevantMemories);
    const emotionalJourney = relevantMemories.map(m => m.emotionalContext);
    const keyInsights = this.extractKeyInsights(relevantMemories);
    const continuationPoints = this.identifyContinuationPoints(relevantMemories);
    
    return {
      recentContext,
      emotionalJourney,
      keyInsights,
      continuationPoints
    };
  }

  /**
   * Builds contextual understanding for responses
   */
  buildContextualResponse(
    baseResponse: string,
    userId: string,
    currentContext: string[],
    emotionalState: EmotionalState
  ): string {
    // Get relevant memories
    const relevantMemories = this.recallRelevantMemories(userId, currentContext, emotionalState, 3);
    
    // Get conversation summary
    const summary = this.getConversationSummary(userId);
    
    // Check for conversation continuity
    const needsContinuity = this.checkContinuityNeeds(relevantMemories, currentContext);
    
    let contextualResponse = baseResponse;
    
    // Add contextual awareness
    if (needsContinuity.shouldReference) {
      contextualResponse = this.addContextualReference(contextualResponse, needsContinuity.reference!);
    }
    
    // Add emotional continuity
    if (summary.emotionalJourney.length > 0) {
      const emotionalContext = this.analyzeEmotionalContinuity(summary.emotionalJourney);
      contextualResponse = this.addEmotionalContinuity(contextualResponse, emotionalContext);
    }
    
    // Add conversation thread awareness
    const activeThreads = this.getActiveThreads(userId);
    if (activeThreads.length > 0) {
      contextualResponse = this.addThreadAwareness(contextualResponse, activeThreads);
    }
    
    return contextualResponse;
  }

  private calculateEmotionalWeight(emotionalState: EmotionalState): number {
    // Strong emotions create more significant memories
    const primaryEmotions = [
      emotionalState.joy, emotionalState.fear, emotionalState.surprise,
      emotionalState.sadness, emotionalState.anger, emotionalState.trust
    ];
    
    const maxEmotion = Math.max(...primaryEmotions);
    const emotionalIntensity = primaryEmotions.reduce((sum, val) => sum + val, 0) / primaryEmotions.length;
    
    // Combine peak emotion with overall intensity
    return (maxEmotion * 0.6) + (emotionalIntensity * 0.4);
  }

  private classifyMemoryType(content: string, emotionalContext: EmotionalState): MemoryNode['memoryType'] {
    const text = content.toLowerCase();
    
    if (emotionalContext.growth > 0.7 || text.includes('learned') || text.includes('understand')) {
      return 'wisdom';
    } else if (emotionalContext.trust > 0.7 || text.includes('thank') || text.includes('help')) {
      return 'relationship';
    } else if (text.includes('pattern') || text.includes('always') || text.includes('usually')) {
      return 'pattern';
    } else if (text.includes('fact') || text.includes('definition') || text.includes('explain')) {
      return 'knowledge';
    } else {
      return 'experience';
    }
  }

  private extractConcepts(content: string): string[] {
    // Simple concept extraction - in production, use NLP
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    // Remove common words
    const stopWords = ['this', 'that', 'with', 'have', 'will', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'would', 'there'];
    
    return words.filter(word => !stopWords.includes(word)).slice(0, 10);
  }

  private findConnectedMemories(
    userId: string, 
    concepts: string[], 
    emotionalContext: EmotionalState
  ): string[] {
    const userMemories = Array.from(this.memoryNodes.values())
      .filter(memory => memory.userId === userId);
    
    return userMemories
      .filter(memory => {
        const conceptOverlap = memory.relatedConcepts.some(concept => concepts.includes(concept));
        const emotionalSimilarity = this.calculateEmotionalSimilarity(memory.emotionalContext, emotionalContext);
        return conceptOverlap || emotionalSimilarity > 0.7;
      })
      .map(memory => memory.id)
      .slice(0, 5);
  }

  private calculateEmotionalSimilarity(state1: EmotionalState, state2: EmotionalState): number {
    const emotions = ['joy', 'trust', 'fear', 'surprise', 'sadness', 'disgust', 'anger', 'anticipation'] as const;
    
    let similarity = 0;
    emotions.forEach(emotion => {
      similarity += 1 - Math.abs(state1[emotion] - state2[emotion]);
    });
    
    return similarity / emotions.length;
  }

  private calculateRelevanceScore(
    memory: MemoryNode, 
    currentContext: string[], 
    emotionalState: EmotionalState
  ): number {
    let score = 0;
    
    // Contextual relevance
    const contextOverlap = memory.conversationTopic
      .filter(topic => currentContext.includes(topic)).length;
    score += (contextOverlap / Math.max(currentContext.length, 1)) * 0.3;
    
    // Concept relevance
    const conceptOverlap = memory.relatedConcepts
      .filter(concept => currentContext.some(ctx => ctx.includes(concept))).length;
    score += (conceptOverlap / Math.max(memory.relatedConcepts.length, 1)) * 0.2;
    
    // Emotional relevance
    const emotionalSimilarity = this.calculateEmotionalSimilarity(memory.emotionalContext, emotionalState);
    score += emotionalSimilarity * 0.2;
    
    // Memory importance
    score += memory.emotionalWeight * 0.2;
    
    // Recency with decay
    const ageInDays = (Date.now() - memory.timestamp) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.exp(-ageInDays / 30); // 30-day half-life
    score += recencyScore * 0.1;
    
    return score;
  }

  private updateMemoryThreads(memory: MemoryNode, conversationContext: string[]): void {
    const topic = conversationContext[0] || 'general';
    const threadId = `${memory.userId}_${topic}`;
    
    let thread = this.memoryThreads.get(threadId);
    
    if (!thread) {
      thread = {
        id: threadId,
        topic,
        startTime: Date.now(),
        lastActivity: Date.now(),
        importance: memory.emotionalWeight,
        memories: [memory.id],
        userId: memory.userId,
        conceptEvolution: [],
        patterns: [],
        insights: [],
        breakthroughs: []
      };
    } else {
      thread.lastActivity = Date.now();
      thread.memories.push(memory.id);
      thread.importance = Math.max(thread.importance, memory.emotionalWeight);
    }
    
    // Track concept evolution
    memory.relatedConcepts.forEach(concept => {
      const existing = thread!.conceptEvolution.find(ce => ce.concept === concept);
      if (existing) {
        existing.confidence = Math.min(1, existing.confidence + 0.1);
      } else {
        thread!.conceptEvolution.push({
          concept,
          confidence: 0.5,
          timestamp: Date.now()
        });
      }
    });
    
    this.memoryThreads.set(threadId, thread);
  }

  private checkContinuityNeeds(memories: MemoryNode[], currentContext: string[]): {
    shouldReference: boolean;
    reference?: string;
  } {
    if (memories.length === 0) return { shouldReference: false };
    
    const recentMemory = memories[0];
    const timeSinceLastInteraction = Date.now() - recentMemory.timestamp;
    
    // If last interaction was more than 1 hour ago, provide continuity
    if (timeSinceLastInteraction > 3600000) { // 1 hour
      return {
        shouldReference: true,
        reference: `Continuing from our earlier discussion about ${recentMemory.conversationTopic.join(', ')}`
      };
    }
    
    return { shouldReference: false };
  }

  private addContextualReference(response: string, reference: string): string {
    return `${reference} - ${response}`;
  }

  private analyzeEmotionalContinuity(emotionalJourney: EmotionalState[]): {
    trend: 'improving' | 'declining' | 'stable';
    dominantEmotion: string;
  } {
    if (emotionalJourney.length < 2) {
      return { trend: 'stable', dominantEmotion: 'neutral' };
    }
    
    const recent = emotionalJourney[0];
    const earlier = emotionalJourney[emotionalJourney.length - 1];
    
    // Calculate overall emotional tone
    const recentTone = (recent.joy + recent.trust + recent.anticipation) - 
                      (recent.fear + recent.sadness + recent.anger);
    const earlierTone = (earlier.joy + earlier.trust + earlier.anticipation) - 
                       (earlier.fear + earlier.sadness + earlier.anger);
    
    const trend = recentTone > earlierTone ? 'improving' : 
                  recentTone < earlierTone ? 'declining' : 'stable';
    
    // Find dominant emotion
    const emotions = ['joy', 'trust', 'fear', 'surprise', 'sadness', 'anger', 'anticipation'] as const;
    const dominantEmotion = emotions.reduce((max, emotion) => 
      recent[emotion] > recent[max] ? emotion : max
    );
    
    return { trend, dominantEmotion };
  }

  private addEmotionalContinuity(response: string, emotionalContext: any): string {
    if (emotionalContext.trend === 'declining') {
      return response + ' I want to make sure you\'re feeling supported in our conversation.';
    } else if (emotionalContext.trend === 'improving') {
      return response + ' I\'m glad our discussion seems to be going well!';
    }
    return response;
  }

  private getActiveThreads(userId: string): MemoryThread[] {
    const userThreads = Array.from(this.memoryThreads.values())
      .filter(thread => thread.userId === userId);
    
    // Consider threads active if they've had activity in the last 24 hours
    const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    return userThreads
      .filter(thread => thread.lastActivity > dayAgo)
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 3);
  }

  private addThreadAwareness(response: string, activeThreads: MemoryThread[]): string {
    if (activeThreads.length === 1) {
      return response + ` (Building on our ${activeThreads[0].topic} discussion)`;
    } else if (activeThreads.length > 1) {
      const topics = activeThreads.map(t => t.topic).join(' and ');
      return response + ` (Connecting to our ongoing ${topics} conversations)`;
    }
    return response;
  }

  private extractRecentContext(memories: MemoryNode[]): string[] {
    const allTopics = memories.flatMap(m => m.conversationTopic);
    const topicCounts = new Map<string, number>();
    
    allTopics.forEach(topic => {
      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    });
    
    return Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);
  }

  private extractKeyInsights(memories: MemoryNode[]): string[] {
    return memories
      .filter(m => m.memoryType === 'wisdom' || m.emotionalWeight > 0.7)
      .map(m => m.content)
      .slice(0, 3);
  }

  private identifyContinuationPoints(memories: MemoryNode[]): string[] {
    const continuations: string[] = [];
    
    // Look for unresolved questions or incomplete thoughts
    memories.forEach(memory => {
      if (memory.content.includes('?') && memory.childMemories.length === 0) {
        continuations.push(`Follow up on: ${memory.content}`);
      }
      
      if (memory.content.toLowerCase().includes('later') || 
          memory.content.toLowerCase().includes('next time')) {
        continuations.push(`Continue: ${memory.content}`);
      }
    });
    
    return continuations.slice(0, 2);
  }

  private extractWisdom(memory: MemoryNode): void {
    // Extract patterns and insights from significant memories
    if (memory.emotionalWeight > 0.8 && memory.memoryType === 'wisdom') {
      const insight = {
        insight: `Learned from interaction: ${memory.content}`,
        confidence: memory.emotionalWeight,
        timestamp: memory.timestamp,
        relatedMemories: memory.connectedMemories
      };
      
      let userInsights = this.wisdomCore.personalizedInsights.get(memory.userId);
      if (!userInsights) {
        userInsights = { userId: memory.userId, insights: [] };
      }
      
      userInsights.insights.push(insight);
      this.wisdomCore.personalizedInsights.set(memory.userId, userInsights);
    }
  }

  private updateMemoryConnections(newMemory: MemoryNode): void {
    // Update bidirectional connections
    newMemory.connectedMemories.forEach(memoryId => {
      const connectedMemory = this.memoryNodes.get(memoryId);
      if (connectedMemory && !connectedMemory.connectedMemories.includes(newMemory.id)) {
        connectedMemory.connectedMemories.push(newMemory.id);
      }
    });
  }

  private startMemoryMaintenanceLoop(): void {
    // Periodic maintenance to prevent memory overflow and decay unused memories
    setInterval(() => {
      this.performMemoryMaintenance();
    }, 3600000); // Every hour
  }

  private performMemoryMaintenance(): void {
    // Decay old, unused memories
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    
    Array.from(this.memoryNodes.entries()).forEach(([id, memory]) => {
      // Decay contextual relevance over time
      const ageInDays = (now - memory.lastAccessed) / (24 * 60 * 60 * 1000);
      memory.contextualRelevance *= Math.pow(this.CONNECTION_DECAY_RATE, ageInDays);
      
      // Remove very old, unused memories with low significance
      if (memory.timestamp < now - thirtyDays && 
          memory.accessCount < 2 && 
          memory.emotionalWeight < 0.3) {
        this.memoryNodes.delete(id);
      }
    });
    
    // Compress memory if exceeding limits
    if (this.memoryNodes.size > this.MAX_ACTIVE_MEMORIES) {
      this.compressMemories();
    }
  }

  private compressMemories(): void {
    // Keep most important memories, compress others
    const memories = Array.from(this.memoryNodes.values());
    const sortedByImportance = memories.sort((a, b) => {
      const scoreA = (a.emotionalWeight * 0.4) + (a.connectionStrength * 0.3) + 
                     (a.accessCount / 100 * 0.3);
      const scoreB = (b.emotionalWeight * 0.4) + (b.connectionStrength * 0.3) + 
                     (b.accessCount / 100 * 0.3);
      return scoreB - scoreA;
    });
    
    // Keep top memories, remove least important
    const toKeep = sortedByImportance.slice(0, this.MAX_ACTIVE_MEMORIES);
    const toRemove = sortedByImportance.slice(this.MAX_ACTIVE_MEMORIES);
    
    toRemove.forEach(memory => {
      this.memoryNodes.delete(memory.id);
    });
  }
}

// Global memory system instance
export const contextMemorySystem = new ContextAwareMemorySystem();

export type { MemoryNode, MemoryThread, WisdomCore };