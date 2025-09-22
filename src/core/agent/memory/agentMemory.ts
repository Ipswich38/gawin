import { MemoryEntry, AgentContext } from '../types';

export interface MemoryQuery {
  type?: string;
  tags?: string[];
  timeRange?: {
    start: Date;
    end: Date;
  };
  userId?: string;
  importance?: {
    min: number;
    max: number;
  };
  limit?: number;
}

export interface MemoryPattern {
  id: string;
  pattern: string;
  frequency: number;
  contexts: string[];
  relevance: number;
  lastSeen: Date;
}

export class AgentMemory {
  private memories: Map<string, MemoryEntry> = new Map();
  private patterns: Map<string, MemoryPattern> = new Map();
  private indices: {
    byType: Map<string, string[]>;
    byUser: Map<string, string[]>;
    byTag: Map<string, string[]>;
    byImportance: Map<number, string[]>;
  };

  constructor() {
    this.indices = {
      byType: new Map(),
      byUser: new Map(),
      byTag: new Map(),
      byImportance: new Map()
    };
  }

  async initialize(): Promise<void> {
    // Load existing memories from persistence layer
    await this.loadMemories();
  }

  async store(entry: Omit<MemoryEntry, 'id' | 'timestamp'>): Promise<string> {
    const memoryEntry: MemoryEntry = {
      ...entry,
      id: this.generateMemoryId(),
      timestamp: new Date()
    };

    this.memories.set(memoryEntry.id, memoryEntry);
    this.updateIndices(memoryEntry);
    await this.persistMemory(memoryEntry);

    return memoryEntry.id;
  }

  async retrieve(query: MemoryQuery): Promise<MemoryEntry[]> {
    let candidates = Array.from(this.memories.values());

    // Filter by type
    if (query.type) {
      const typeIds = this.indices.byType.get(query.type) || [];
      candidates = candidates.filter(m => typeIds.includes(m.id));
    }

    // Filter by user
    if (query.userId) {
      const userIds = this.indices.byUser.get(query.userId) || [];
      candidates = candidates.filter(m => userIds.includes(m.id));
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      candidates = candidates.filter(m =>
        query.tags!.some(tag => m.tags.includes(tag))
      );
    }

    // Filter by time range
    if (query.timeRange) {
      candidates = candidates.filter(m =>
        m.timestamp >= query.timeRange!.start &&
        m.timestamp <= query.timeRange!.end
      );
    }

    // Filter by importance
    if (query.importance) {
      candidates = candidates.filter(m =>
        m.importance >= query.importance!.min &&
        m.importance <= query.importance!.max
      );
    }

    // Sort by relevance (importance + recency)
    candidates.sort((a, b) => {
      const aScore = a.importance + (Date.now() - a.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      const bScore = b.importance + (Date.now() - b.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      return bScore - aScore;
    });

    // Apply limit
    if (query.limit) {
      candidates = candidates.slice(0, query.limit);
    }

    return candidates;
  }

  async search(searchTerm: string, context?: AgentContext): Promise<MemoryEntry[]> {
    const results: MemoryEntry[] = [];
    const lowerSearchTerm = searchTerm.toLowerCase();

    for (const memory of this.memories.values()) {
      let relevanceScore = 0;

      // Search in content
      if (typeof memory.content === 'string') {
        if (memory.content.toLowerCase().includes(lowerSearchTerm)) {
          relevanceScore += 2;
        }
      } else if (typeof memory.content === 'object') {
        const contentStr = JSON.stringify(memory.content).toLowerCase();
        if (contentStr.includes(lowerSearchTerm)) {
          relevanceScore += 1;
        }
      }

      // Search in tags
      for (const tag of memory.tags) {
        if (tag.toLowerCase().includes(lowerSearchTerm)) {
          relevanceScore += 1.5;
        }
      }

      // Context relevance
      if (context && memory.userId === context.userId) {
        relevanceScore += 0.5;
      }

      if (relevanceScore > 0) {
        results.push({
          ...memory,
          importance: memory.importance + relevanceScore
        });
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.importance - a.importance);

    return results.slice(0, 20); // Return top 20 results
  }

  async getRecentMemories(userId: string, limit: number = 10): Promise<MemoryEntry[]> {
    return this.retrieve({
      userId,
      limit,
      timeRange: {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        end: new Date()
      }
    });
  }

  async getImportantMemories(userId: string, minImportance: number = 8): Promise<MemoryEntry[]> {
    return this.retrieve({
      userId,
      importance: {
        min: minImportance,
        max: 10
      }
    });
  }

  async addPattern(pattern: string, context: string): Promise<void> {
    const existing = this.patterns.get(pattern);

    if (existing) {
      existing.frequency++;
      existing.lastSeen = new Date();
      if (!existing.contexts.includes(context)) {
        existing.contexts.push(context);
      }
    } else {
      this.patterns.set(pattern, {
        id: this.generatePatternId(),
        pattern,
        frequency: 1,
        contexts: [context],
        relevance: 1,
        lastSeen: new Date()
      });
    }
  }

  getPatterns(): MemoryPattern[] {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.frequency - a.frequency);
  }

  async updateImportance(memoryId: string, newImportance: number): Promise<boolean> {
    const memory = this.memories.get(memoryId);
    if (!memory) return false;

    const oldImportance = memory.importance;
    memory.importance = newImportance;

    // Update importance index
    this.removeFromImportanceIndex(memoryId, oldImportance);
    this.addToImportanceIndex(memoryId, newImportance);

    await this.persistMemory(memory);
    return true;
  }

  async deleteMemory(memoryId: string): Promise<boolean> {
    const memory = this.memories.get(memoryId);
    if (!memory) return false;

    this.memories.delete(memoryId);
    this.removeFromIndices(memory);

    return true;
  }

  async consolidateMemories(): Promise<number> {
    // Find similar memories and consolidate them
    const memoryGroups = this.groupSimilarMemories();
    let consolidated = 0;

    for (const group of memoryGroups) {
      if (group.length > 1) {
        const consolidatedMemory = this.mergeMemories(group);

        // Remove old memories
        for (const memory of group) {
          await this.deleteMemory(memory.id);
        }

        // Store consolidated memory
        await this.store(consolidatedMemory);
        consolidated += group.length - 1;
      }
    }

    return consolidated;
  }

  private groupSimilarMemories(): MemoryEntry[][] {
    const groups: MemoryEntry[][] = [];
    const processed = new Set<string>();

    for (const memory of this.memories.values()) {
      if (processed.has(memory.id)) continue;

      const similarGroup = [memory];
      processed.add(memory.id);

      for (const otherMemory of this.memories.values()) {
        if (processed.has(otherMemory.id)) continue;

        if (this.areSimilarMemories(memory, otherMemory)) {
          similarGroup.push(otherMemory);
          processed.add(otherMemory.id);
        }
      }

      if (similarGroup.length > 1) {
        groups.push(similarGroup);
      }
    }

    return groups;
  }

  private areSimilarMemories(mem1: MemoryEntry, mem2: MemoryEntry): boolean {
    // Check if memories are similar based on:
    // 1. Same type
    // 2. Same user
    // 3. Similar content
    // 4. Similar time period

    if (mem1.type !== mem2.type || mem1.userId !== mem2.userId) {
      return false;
    }

    // Time proximity (within 1 hour)
    const timeDiff = Math.abs(mem1.timestamp.getTime() - mem2.timestamp.getTime());
    if (timeDiff > 60 * 60 * 1000) {
      return false;
    }

    // Content similarity
    const contentSimilarity = this.calculateContentSimilarity(mem1.content, mem2.content);
    return contentSimilarity > 0.7;
  }

  private calculateContentSimilarity(content1: any, content2: any): number {
    const str1 = typeof content1 === 'string' ? content1 : JSON.stringify(content1);
    const str2 = typeof content2 === 'string' ? content2 : JSON.stringify(content2);

    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);

    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];

    return intersection.length / union.length;
  }

  private mergeMemories(memories: MemoryEntry[]): Omit<MemoryEntry, 'id' | 'timestamp'> {
    const first = memories[0];

    return {
      type: first.type,
      content: {
        merged: true,
        sources: memories.map(m => m.content),
        summary: `Consolidated memory from ${memories.length} related entries`
      },
      importance: Math.max(...memories.map(m => m.importance)),
      tags: [...new Set(memories.flatMap(m => m.tags))],
      userId: first.userId,
      context: {
        ...first.context,
        consolidated: true,
        sourceCount: memories.length
      }
    };
  }

  private updateIndices(memory: MemoryEntry): void {
    // Update type index
    const typeList = this.indices.byType.get(memory.type) || [];
    typeList.push(memory.id);
    this.indices.byType.set(memory.type, typeList);

    // Update user index
    const userList = this.indices.byUser.get(memory.userId) || [];
    userList.push(memory.id);
    this.indices.byUser.set(memory.userId, userList);

    // Update tag indices
    for (const tag of memory.tags) {
      const tagList = this.indices.byTag.get(tag) || [];
      tagList.push(memory.id);
      this.indices.byTag.set(tag, tagList);
    }

    // Update importance index
    this.addToImportanceIndex(memory.id, memory.importance);
  }

  private removeFromIndices(memory: MemoryEntry): void {
    // Remove from type index
    const typeList = this.indices.byType.get(memory.type);
    if (typeList) {
      const index = typeList.indexOf(memory.id);
      if (index > -1) typeList.splice(index, 1);
    }

    // Remove from user index
    const userList = this.indices.byUser.get(memory.userId);
    if (userList) {
      const index = userList.indexOf(memory.id);
      if (index > -1) userList.splice(index, 1);
    }

    // Remove from tag indices
    for (const tag of memory.tags) {
      const tagList = this.indices.byTag.get(tag);
      if (tagList) {
        const index = tagList.indexOf(memory.id);
        if (index > -1) tagList.splice(index, 1);
      }
    }

    // Remove from importance index
    this.removeFromImportanceIndex(memory.id, memory.importance);
  }

  private addToImportanceIndex(memoryId: string, importance: number): void {
    const importanceList = this.indices.byImportance.get(importance) || [];
    importanceList.push(memoryId);
    this.indices.byImportance.set(importance, importanceList);
  }

  private removeFromImportanceIndex(memoryId: string, importance: number): void {
    const importanceList = this.indices.byImportance.get(importance);
    if (importanceList) {
      const index = importanceList.indexOf(memoryId);
      if (index > -1) importanceList.splice(index, 1);
    }
  }

  private generateMemoryId(): string {
    return `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePatternId(): string {
    return `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async loadMemories(): Promise<void> {
    // Placeholder for loading from persistent storage
    // Implementation would depend on chosen storage solution
  }

  private async persistMemory(memory: MemoryEntry): Promise<void> {
    // Placeholder for persisting to storage
    // Implementation would depend on chosen storage solution
  }

  getMemoryStats(): Record<string, any> {
    return {
      totalMemories: this.memories.size,
      totalPatterns: this.patterns.size,
      memoryTypes: Array.from(this.indices.byType.keys()),
      users: Array.from(this.indices.byUser.keys()),
      averageImportance: Array.from(this.memories.values())
        .reduce((sum, m) => sum + m.importance, 0) / this.memories.size || 0
    };
  }
}