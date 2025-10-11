// Advanced Agent Memory & Context Management System
// Intelligent memory consolidation, context retention, and knowledge synthesis

export interface MemoryEntry {
  id: string;
  content: string;
  type: 'interaction' | 'knowledge' | 'skill' | 'preference' | 'context' | 'insight';
  timestamp: number;
  importance: number; // 1-10 scale
  confidence: number; // 0-1 scale
  tags: string[];
  source: string; // Where this memory came from
  associations: string[]; // IDs of related memories
  accessCount: number;
  lastAccessed: number;
  embeddings?: number[]; // Vector embeddings for semantic search
  metadata: Record<string, any>;
}

export interface ContextSnapshot {
  id: string;
  agentId: string;
  timestamp: number;
  conversationContext: {
    topic: string;
    sentiment: string;
    complexity: number;
    userIntent: string;
    conversationStage: string;
  };
  businessContext: {
    currentProjects: string[];
    priorities: string[];
    constraints: Record<string, any>;
    goals: string[];
  };
  performanceMetrics: {
    responseQuality: number;
    userSatisfaction: number;
    taskSuccess: number;
    toolEffectiveness: Record<string, number>;
  };
  learnings: string[];
  adaptations: string[];
}

export interface KnowledgeGraph {
  entities: Map<string, {
    id: string;
    type: string;
    properties: Record<string, any>;
    connections: string[];
  }>;
  relationships: Map<string, {
    from: string;
    to: string;
    type: string;
    strength: number;
    context: string;
  }>;
}

export class AdvancedAgentMemory {
  private agentId: string;
  private shortTermMemory: Map<string, MemoryEntry> = new Map();
  private longTermMemory: Map<string, MemoryEntry> = new Map();
  private workingMemory: Map<string, MemoryEntry> = new Map();
  private episodicMemory: ContextSnapshot[] = [];
  private knowledgeGraph: KnowledgeGraph;
  private memoryConsolidationTimer: NodeJS.Timeout | null = null;
  private maxShortTermSize = 100;
  private maxWorkingMemorySize = 20;
  private maxEpisodicMemory = 1000;

  constructor(agentId: string) {
    this.agentId = agentId;
    this.knowledgeGraph = {
      entities: new Map(),
      relationships: new Map()
    };
    this.startMemoryConsolidation();
    console.log(`🧠 Initialized advanced memory system for agent: ${agentId}`);
  }

  // === MEMORY STORAGE ===

  public async storeMemory(
    content: string,
    type: MemoryEntry['type'],
    importance: number = 5,
    tags: string[] = [],
    metadata: Record<string, any> = {}
  ): Promise<string> {
    const memoryId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const memory: MemoryEntry = {
      id: memoryId,
      content,
      type,
      timestamp: Date.now(),
      importance: Math.max(1, Math.min(10, importance)),
      confidence: 0.8, // Default confidence
      tags: [...tags, type],
      source: `agent_${this.agentId}`,
      associations: [],
      accessCount: 0,
      lastAccessed: Date.now(),
      embeddings: await this.generateEmbeddings(content),
      metadata
    };

    // Determine memory storage location based on importance and type
    if (importance >= 8 || type === 'knowledge' || type === 'skill') {
      this.longTermMemory.set(memoryId, memory);
      console.log(`📚 Stored in long-term memory: ${memoryId}`);
    } else if (importance >= 6 || type === 'context') {
      this.shortTermMemory.set(memoryId, memory);
      console.log(`🧠 Stored in short-term memory: ${memoryId}`);
    } else {
      this.workingMemory.set(memoryId, memory);
      console.log(`💭 Stored in working memory: ${memoryId}`);
    }

    // Update knowledge graph
    await this.updateKnowledgeGraph(memory);

    // Find and create associations
    await this.createAssociations(memory);

    // Trigger consolidation if needed
    this.checkConsolidationTriggers();

    return memoryId;
  }

  public async storeContextSnapshot(snapshot: ContextSnapshot): Promise<void> {
    this.episodicMemory.push(snapshot);

    // Keep episodic memory size manageable
    if (this.episodicMemory.length > this.maxEpisodicMemory) {
      this.episodicMemory.shift();
    }

    console.log(`📸 Stored context snapshot: ${snapshot.id}`);
  }

  // === MEMORY RETRIEVAL ===

  public async retrieveRelevantMemories(
    query: string,
    context: Record<string, any> = {},
    limit: number = 10
  ): Promise<MemoryEntry[]> {
    const queryEmbeddings = await this.generateEmbeddings(query);
    const allMemories = [
      ...Array.from(this.longTermMemory.values()),
      ...Array.from(this.shortTermMemory.values()),
      ...Array.from(this.workingMemory.values())
    ];

    // Calculate relevance scores
    const scoredMemories = allMemories.map(memory => ({
      memory,
      score: this.calculateRelevanceScore(memory, query, queryEmbeddings, context)
    }));

    // Sort by relevance and return top results
    const relevantMemories = scoredMemories
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => {
        // Update access statistics
        item.memory.accessCount++;
        item.memory.lastAccessed = Date.now();
        return item.memory;
      });

    console.log(`🔍 Retrieved ${relevantMemories.length} relevant memories for: "${query}"`);
    return relevantMemories;
  }

  public async retrieveMemoryByType(type: MemoryEntry['type'], limit: number = 50): Promise<MemoryEntry[]> {
    const allMemories = [
      ...Array.from(this.longTermMemory.values()),
      ...Array.from(this.shortTermMemory.values()),
      ...Array.from(this.workingMemory.values())
    ];

    return allMemories
      .filter(memory => memory.type === type)
      .sort((a, b) => b.importance - a.importance)
      .slice(0, limit);
  }

  public async retrieveMemoryByTags(tags: string[], limit: number = 20): Promise<MemoryEntry[]> {
    const allMemories = [
      ...Array.from(this.longTermMemory.values()),
      ...Array.from(this.shortTermMemory.values()),
      ...Array.from(this.workingMemory.values())
    ];

    return allMemories
      .filter(memory => tags.some(tag => memory.tags.includes(tag)))
      .sort((a, b) => b.importance - a.importance)
      .slice(0, limit);
  }

  public getRecentContext(timeWindow: number = 3600000): ContextSnapshot[] {
    const cutoff = Date.now() - timeWindow;
    return this.episodicMemory
      .filter(snapshot => snapshot.timestamp >= cutoff)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // === MEMORY CONSOLIDATION ===

  private startMemoryConsolidation(): void {
    // Run consolidation every 15 minutes
    this.memoryConsolidationTimer = setInterval(() => {
      this.performMemoryConsolidation();
    }, 15 * 60 * 1000);
  }

  private async performMemoryConsolidation(): Promise<void> {
    console.log(`🔄 Starting memory consolidation for agent: ${this.agentId}`);

    // Consolidate short-term to long-term
    await this.consolidateShortToLongTerm();

    // Clean working memory
    await this.cleanWorkingMemory();

    // Strengthen important associations
    await this.strengthenAssociations();

    // Update knowledge graph
    await this.optimizeKnowledgeGraph();

    // Generate insights from patterns
    await this.generateInsights();

    console.log(`✅ Memory consolidation completed for agent: ${this.agentId}`);
  }

  private async consolidateShortToLongTerm(): Promise<void> {
    const promotionCandidates = Array.from(this.shortTermMemory.values())
      .filter(memory => {
        const age = Date.now() - memory.timestamp;
        const ageInHours = age / (1000 * 60 * 60);

        // Promote if: high importance, frequently accessed, or older than 24 hours with good access
        return (
          memory.importance >= 7 ||
          memory.accessCount >= 3 ||
          (ageInHours >= 24 && memory.accessCount >= 1)
        );
      });

    for (const memory of promotionCandidates) {
      this.shortTermMemory.delete(memory.id);
      this.longTermMemory.set(memory.id, {
        ...memory,
        importance: Math.min(10, memory.importance + 1) // Boost importance slightly
      });
      console.log(`📈 Promoted to long-term memory: ${memory.id}`);
    }
  }

  private async cleanWorkingMemory(): Promise<void> {
    if (this.workingMemory.size <= this.maxWorkingMemorySize) {
      return;
    }

    // Keep most recent and important memories in working memory
    const workingMemories = Array.from(this.workingMemory.values())
      .sort((a, b) => {
        const scoreA = (a.importance * 0.6) + (a.accessCount * 0.4);
        const scoreB = (b.importance * 0.6) + (b.accessCount * 0.4);
        return scoreB - scoreA;
      });

    // Remove excess memories
    const toRemove = workingMemories.slice(this.maxWorkingMemorySize);
    for (const memory of toRemove) {
      this.workingMemory.delete(memory.id);
    }

    console.log(`🧹 Cleaned ${toRemove.length} memories from working memory`);
  }

  private async strengthenAssociations(): Promise<void> {
    // Find memories that are frequently accessed together
    const allMemories = [
      ...Array.from(this.longTermMemory.values()),
      ...Array.from(this.shortTermMemory.values())
    ];

    for (const memory of allMemories) {
      if (memory.accessCount >= 2) {
        const relatedMemories = await this.findRelatedMemories(memory);

        for (const related of relatedMemories.slice(0, 3)) {
          if (!memory.associations.includes(related.id)) {
            memory.associations.push(related.id);
          }
        }
      }
    }
  }

  private async generateInsights(): Promise<void> {
    // Analyze patterns in episodic memory to generate insights
    const recentSnapshots = this.getRecentContext(7 * 24 * 60 * 60 * 1000); // Last week

    if (recentSnapshots.length < 5) {
      return; // Need sufficient data for pattern analysis
    }

    // Pattern analysis
    const patterns = this.analyzeConversationPatterns(recentSnapshots);
    const performancePatterns = this.analyzePerformancePatterns(recentSnapshots);

    // Store insights as memories
    if (patterns.length > 0) {
      await this.storeMemory(
        `Pattern insight: ${patterns.join(', ')}`,
        'insight',
        8,
        ['pattern', 'conversation', 'behavior'],
        { patterns, source: 'pattern_analysis' }
      );
    }

    if (performancePatterns.length > 0) {
      await this.storeMemory(
        `Performance insight: ${performancePatterns.join(', ')}`,
        'insight',
        8,
        ['performance', 'optimization', 'metrics'],
        { patterns: performancePatterns, source: 'performance_analysis' }
      );
    }
  }

  // === KNOWLEDGE GRAPH MANAGEMENT ===

  private async updateKnowledgeGraph(memory: MemoryEntry): Promise<void> {
    // Extract entities from memory content
    const entities = await this.extractEntities(memory.content);

    for (const entity of entities) {
      const entityId = `entity_${entity.type}_${entity.value}`;

      if (!this.knowledgeGraph.entities.has(entityId)) {
        this.knowledgeGraph.entities.set(entityId, {
          id: entityId,
          type: entity.type,
          properties: { name: entity.value, ...entity.properties },
          connections: []
        });
      }

      // Create relationship between memory and entity
      const relationshipId = `rel_${memory.id}_${entityId}`;
      this.knowledgeGraph.relationships.set(relationshipId, {
        from: memory.id,
        to: entityId,
        type: 'mentions',
        strength: memory.importance / 10,
        context: memory.type
      });
    }
  }

  private async optimizeKnowledgeGraph(): Promise<void> {
    // Remove weak relationships
    const weakRelationships = Array.from(this.knowledgeGraph.relationships.entries())
      .filter(([_, rel]) => rel.strength < 0.3);

    for (const [id, _] of weakRelationships) {
      this.knowledgeGraph.relationships.delete(id);
    }

    console.log(`🕸️ Optimized knowledge graph: removed ${weakRelationships.length} weak relationships`);
  }

  // === HELPER METHODS ===

  private async generateEmbeddings(text: string): Promise<number[]> {
    // In a real implementation, this would use an actual embedding model
    // For now, return a mock embedding
    return Array.from({ length: 384 }, () => Math.random() - 0.5);
  }

  private calculateRelevanceScore(
    memory: MemoryEntry,
    query: string,
    queryEmbeddings: number[],
    context: Record<string, any>
  ): number {
    let score = 0;

    // Semantic similarity (mock calculation)
    if (memory.embeddings && queryEmbeddings) {
      const similarity = this.cosineSimilarity(memory.embeddings, queryEmbeddings);
      score += similarity * 40;
    }

    // Text similarity
    const textSimilarity = this.calculateTextSimilarity(memory.content, query);
    score += textSimilarity * 30;

    // Importance boost
    score += (memory.importance / 10) * 20;

    // Recency boost
    const age = Date.now() - memory.timestamp;
    const ageInDays = age / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 10 - ageInDays);
    score += recencyScore;

    // Access frequency boost
    score += Math.min(memory.accessCount * 2, 10);

    return score;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\W+/);
    const words2 = text2.toLowerCase().split(/\W+/);

    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;

    return commonWords.length / totalWords;
  }

  private async createAssociations(memory: MemoryEntry): Promise<void> {
    const relatedMemories = await this.findRelatedMemories(memory);

    for (const related of relatedMemories.slice(0, 5)) {
      if (!memory.associations.includes(related.id)) {
        memory.associations.push(related.id);
      }

      // Bidirectional association
      if (!related.associations.includes(memory.id)) {
        related.associations.push(memory.id);
      }
    }
  }

  private async findRelatedMemories(memory: MemoryEntry): Promise<MemoryEntry[]> {
    const allMemories = [
      ...Array.from(this.longTermMemory.values()),
      ...Array.from(this.shortTermMemory.values())
    ].filter(m => m.id !== memory.id);

    return allMemories
      .map(m => ({
        memory: m,
        similarity: this.calculateMemorySimilarity(memory, m)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10)
      .map(item => item.memory);
  }

  private calculateMemorySimilarity(memory1: MemoryEntry, memory2: MemoryEntry): number {
    let similarity = 0;

    // Content similarity
    similarity += this.calculateTextSimilarity(memory1.content, memory2.content) * 40;

    // Tag overlap
    const commonTags = memory1.tags.filter(tag => memory2.tags.includes(tag));
    similarity += (commonTags.length / Math.max(memory1.tags.length, memory2.tags.length)) * 30;

    // Type similarity
    if (memory1.type === memory2.type) {
      similarity += 20;
    }

    // Temporal proximity
    const timeDiff = Math.abs(memory1.timestamp - memory2.timestamp);
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    const temporalSimilarity = Math.max(0, 10 - daysDiff);
    similarity += temporalSimilarity;

    return similarity;
  }

  private async extractEntities(text: string): Promise<Array<{
    type: string;
    value: string;
    properties: Record<string, any>;
  }>> {
    // Mock entity extraction - in reality would use NLP
    const entities = [];

    // Extract simple patterns
    const urls = text.match(/https?:\/\/[^\s]+/g) || [];
    for (const url of urls) {
      entities.push({ type: 'url', value: url, properties: {} });
    }

    const emails = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
    for (const email of emails) {
      entities.push({ type: 'email', value: email, properties: {} });
    }

    return entities;
  }

  private checkConsolidationTriggers(): void {
    // Trigger immediate consolidation if memory stores are getting full
    if (this.shortTermMemory.size > this.maxShortTermSize * 0.8 ||
        this.workingMemory.size > this.maxWorkingMemorySize) {
      setTimeout(() => this.performMemoryConsolidation(), 1000);
    }
  }

  private analyzeConversationPatterns(snapshots: ContextSnapshot[]): string[] {
    const patterns = [];

    // Analyze topic distribution
    const topics = snapshots.map(s => s.conversationContext.topic);
    const topicFreq = topics.reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostFrequentTopic = Object.entries(topicFreq)
      .sort(([,a], [,b]) => b - a)[0];

    if (mostFrequentTopic && mostFrequentTopic[1] > snapshots.length * 0.3) {
      patterns.push(`Frequent focus on ${mostFrequentTopic[0]}`);
    }

    // Analyze sentiment trends
    const sentiments = snapshots.map(s => s.conversationContext.sentiment);
    if (sentiments.filter(s => s === 'positive').length > sentiments.length * 0.7) {
      patterns.push('Consistently positive interactions');
    }

    return patterns;
  }

  private analyzePerformancePatterns(snapshots: ContextSnapshot[]): string[] {
    const patterns = [];

    // Analyze response quality trends
    const avgQuality = snapshots.reduce((sum, s) => sum + s.performanceMetrics.responseQuality, 0) / snapshots.length;
    if (avgQuality > 8) {
      patterns.push('High response quality maintained');
    }

    // Analyze tool effectiveness
    const toolScores: Record<string, number[]> = {};
    snapshots.forEach(s => {
      Object.entries(s.performanceMetrics.toolEffectiveness).forEach(([tool, score]) => {
        if (!toolScores[tool]) toolScores[tool] = [];
        toolScores[tool].push(score);
      });
    });

    for (const [tool, scores] of Object.entries(toolScores)) {
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      if (avgScore > 8 && scores.length >= 3) {
        patterns.push(`${tool} consistently effective`);
      }
    }

    return patterns;
  }

  // === PUBLIC API ===

  public getMemoryStats(): any {
    return {
      agentId: this.agentId,
      longTermMemories: this.longTermMemory.size,
      shortTermMemories: this.shortTermMemory.size,
      workingMemories: this.workingMemory.size,
      episodicSnapshots: this.episodicMemory.length,
      knowledgeGraphEntities: this.knowledgeGraph.entities.size,
      knowledgeGraphRelationships: this.knowledgeGraph.relationships.size,
      totalMemoryFootprint: this.calculateMemoryFootprint()
    };
  }

  private calculateMemoryFootprint(): string {
    const estimate = (
      this.longTermMemory.size * 2 +
      this.shortTermMemory.size * 1.5 +
      this.workingMemory.size * 1 +
      this.episodicMemory.length * 0.5
    );
    return `${estimate.toFixed(1)}KB`;
  }

  public async forgetMemory(memoryId: string): Promise<boolean> {
    return (
      this.longTermMemory.delete(memoryId) ||
      this.shortTermMemory.delete(memoryId) ||
      this.workingMemory.delete(memoryId)
    );
  }

  public destroy(): void {
    if (this.memoryConsolidationTimer) {
      clearInterval(this.memoryConsolidationTimer);
    }

    this.longTermMemory.clear();
    this.shortTermMemory.clear();
    this.workingMemory.clear();
    this.episodicMemory.length = 0;
    this.knowledgeGraph.entities.clear();
    this.knowledgeGraph.relationships.clear();

    console.log(`🧠 Memory system destroyed for agent: ${this.agentId}`);
  }
}