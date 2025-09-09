/**
 * Vector Database Service
 * Handles semantic search, RAG (Retrieval-Augmented Generation), and vector operations
 * Supports multiple vector database backends (Pinecone, Weaviate, local)
 */

import { logger } from '../utils/logger';
import { EventBus } from '../events/EventBus';

interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    userId?: string;
    sessionId?: string;
    timestamp: Date;
    source: 'query' | 'response' | 'knowledge_base' | 'conversation';
    topic?: string[];
    language?: string;
    confidence?: number;
    responseQuality?: number;
  };
}

interface SearchResult {
  document: VectorDocument;
  score: number;
  distance: number;
}

interface SearchOptions {
  topK?: number;
  threshold?: number;
  filters?: Record<string, any>;
  includeMetadata?: boolean;
  rerank?: boolean;
}

interface SimilarResponse {
  response: string;
  confidence: number;
  model?: string;
  version?: string;
  timestamp: Date;
  userId: string;
}

interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>;
  getDimension(): number;
  getModel(): string;
}

// OpenAI Embeddings Provider
class OpenAIEmbeddingProvider implements EmbeddingProvider {
  private apiKey: string;
  private model: string = 'text-embedding-3-small';
  private dimension: number = 1536;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          input: text.substring(0, 8000), // Limit input length
          encoding_format: 'float'
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;

    } catch (error) {
      logger.error('Failed to generate embedding', {
        error: error.message,
        model: this.model,
        textLength: text.length
      });
      throw error;
    }
  }

  getDimension(): number {
    return this.dimension;
  }

  getModel(): string {
    return this.model;
  }
}

// Local/Fallback Embedding Provider (simple)
class FallbackEmbeddingProvider implements EmbeddingProvider {
  private dimension: number = 384; // Smaller dimension for fallback

  async generateEmbedding(text: string): Promise<number[]> {
    // Generate a simple hash-based embedding for fallback
    // In production, you'd use a local model like SentenceTransformers
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(this.dimension).fill(0);
    
    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      const pos = Math.abs(hash) % this.dimension;
      embedding[pos] += 1 / Math.sqrt(words.length);
    });

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  getDimension(): number {
    return this.dimension;
  }

  getModel(): string {
    return 'fallback-hash';
  }
}

export class VectorDatabase {
  private eventBus: EventBus;
  private embeddingProvider: EmbeddingProvider;
  private documents: Map<string, VectorDocument>; // In-memory storage for demo
  private userConversations: Map<string, VectorDocument[]>; // Per-user conversation history
  private knowledgeBase: VectorDocument[]; // General knowledge vectors
  private embeddingCache: Map<string, number[]>; // Cache embeddings
  
  constructor() {
    this.eventBus = EventBus.getInstance();
    this.documents = new Map();
    this.userConversations = new Map();
    this.knowledgeBase = [];
    this.embeddingCache = new Map();
    
    this.initializeEmbeddingProvider();
    this.setupEventListeners();
  }

  private initializeEmbeddingProvider() {
    if (process.env.OPENAI_API_KEY) {
      this.embeddingProvider = new OpenAIEmbeddingProvider(process.env.OPENAI_API_KEY);
      logger.info('Initialized OpenAI embedding provider');
    } else {
      this.embeddingProvider = new FallbackEmbeddingProvider();
      logger.warn('Using fallback embedding provider - OpenAI API key not found');
    }
  }

  private setupEventListeners() {
    this.eventBus.on('user.query.processed', (data) => {
      this.storeConversationTurn(data);
    });

    this.eventBus.on('knowledge.document.added', (data) => {
      this.addKnowledgeDocument(data);
    });
  }

  /**
   * Store a query-response pair for future similarity matching
   */
  async storeResponse(
    query: string,
    response: string,
    userId: string,
    confidence: number = 1.0,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      // Generate embeddings for both query and response
      const [queryEmbedding, responseEmbedding] = await Promise.all([
        this.getEmbedding(query),
        this.getEmbedding(response)
      ]);

      const timestamp = new Date();
      const baseMetadata = {
        userId,
        timestamp,
        confidence,
        responseQuality: confidence,
        topic: this.extractTopics(query),
        language: 'en',
        ...metadata
      };

      // Store query document
      const queryDoc: VectorDocument = {
        id: this.generateId('query'),
        content: query,
        embedding: queryEmbedding,
        metadata: {
          ...baseMetadata,
          source: 'query'
        }
      };

      // Store response document
      const responseDoc: VectorDocument = {
        id: this.generateId('response'),
        content: response,
        embedding: responseEmbedding,
        metadata: {
          ...baseMetadata,
          source: 'response'
        }
      };

      // Add to storage
      this.documents.set(queryDoc.id, queryDoc);
      this.documents.set(responseDoc.id, responseDoc);

      // Add to user's conversation history
      if (!this.userConversations.has(userId)) {
        this.userConversations.set(userId, []);
      }
      const userConversations = this.userConversations.get(userId)!;
      userConversations.push(queryDoc, responseDoc);

      // Maintain conversation history limit per user
      const maxConversationHistory = 1000;
      if (userConversations.length > maxConversationHistory) {
        const removed = userConversations.splice(0, userConversations.length - maxConversationHistory);
        removed.forEach(doc => this.documents.delete(doc.id));
      }

      logger.debug('Stored conversation turn', {
        userId,
        queryLength: query.length,
        responseLength: response.length,
        confidence,
        totalDocuments: this.documents.size
      });

      // Emit analytics event
      this.eventBus.emitEvent(
        'vector.document.stored',
        {
          documentCount: 2,
          userId,
          topics: baseMetadata.topic
        },
        'vector-database'
      );

    } catch (error) {
      logger.error('Failed to store response', {
        userId,
        error: error.message,
        queryLength: query.length
      });
    }
  }

  /**
   * Find similar responses to a query
   */
  async findSimilarResponse(
    query: string,
    userId: string,
    options: SearchOptions = {}
  ): Promise<SimilarResponse | null> {
    try {
      const searchOptions: SearchOptions = {
        topK: 5,
        threshold: 0.85,
        includeMetadata: true,
        ...options
      };

      // Search for similar queries first
      const similarQueries = await this.searchSimilar(
        query,
        {
          ...searchOptions,
          filters: {
            source: 'query',
            userId: userId // Only search user's own queries for privacy
          }
        }
      );

      if (similarQueries.length === 0 || similarQueries[0].score < searchOptions.threshold!) {
        return null;
      }

      const bestMatch = similarQueries[0];
      
      // Find the corresponding response
      const responseQuery = Array.from(this.documents.values()).find(doc =>
        doc.metadata.userId === userId &&
        doc.metadata.source === 'response' &&
        Math.abs(doc.metadata.timestamp.getTime() - bestMatch.document.metadata.timestamp.getTime()) < 10000 // Within 10 seconds
      );

      if (!responseQuery) {
        return null;
      }

      return {
        response: responseQuery.content,
        confidence: bestMatch.score,
        model: 'cached',
        version: '1.0.0',
        timestamp: responseQuery.metadata.timestamp,
        userId: responseQuery.metadata.userId!
      };

    } catch (error) {
      logger.error('Failed to find similar response', {
        userId,
        error: error.message,
        queryLength: query.length
      });
      return null;
    }
  }

  /**
   * Search for similar documents
   */
  async searchSimilar(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    try {
      const searchOptions: SearchOptions = {
        topK: 10,
        threshold: 0.7,
        includeMetadata: true,
        rerank: false,
        ...options
      };

      // Generate query embedding
      const queryEmbedding = await this.getEmbedding(query);

      // Calculate similarities
      const candidates: SearchResult[] = [];
      
      for (const doc of this.documents.values()) {
        // Apply filters
        if (searchOptions.filters) {
          const matchesFilters = Object.entries(searchOptions.filters).every(([key, value]) => {
            const docValue = key === 'source' ? doc.metadata.source : doc.metadata[key];
            return docValue === value;
          });
          
          if (!matchesFilters) continue;
        }

        // Calculate cosine similarity
        const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding);
        const distance = 1 - similarity;

        if (similarity >= searchOptions.threshold!) {
          candidates.push({
            document: doc,
            score: similarity,
            distance
          });
        }
      }

      // Sort by similarity score (descending)
      candidates.sort((a, b) => b.score - a.score);

      // Return top-k results
      const results = candidates.slice(0, searchOptions.topK);

      logger.debug('Vector search completed', {
        query: query.substring(0, 100),
        totalCandidates: this.documents.size,
        filteredCandidates: candidates.length,
        returnedResults: results.length,
        topScore: results[0]?.score
      });

      return results;

    } catch (error) {
      logger.error('Vector search failed', {
        error: error.message,
        query: query.substring(0, 100)
      });
      return [];
    }
  }

  /**
   * Retrieve augmented context for RAG
   */
  async retrieveContext(
    query: string,
    userId?: string,
    options: {
      maxTokens?: number;
      includeConversationHistory?: boolean;
      includeKnowledgeBase?: boolean;
      topK?: number;
    } = {}
  ): Promise<{
    context: string;
    sources: string[];
    relevanceScores: number[];
  }> {
    try {
      const {
        maxTokens = 2000,
        includeConversationHistory = true,
        includeKnowledgeBase = true,
        topK = 5
      } = options;

      const contextSections: string[] = [];
      const sources: string[] = [];
      const relevanceScores: number[] = [];
      let currentTokens = 0;

      // Search conversation history if requested
      if (includeConversationHistory && userId) {
        const conversationResults = await this.searchSimilar(query, {
          topK,
          threshold: 0.7,
          filters: { userId, source: 'response' }
        });

        for (const result of conversationResults) {
          const tokens = this.estimateTokens(result.document.content);
          if (currentTokens + tokens <= maxTokens) {
            contextSections.push(result.document.content);
            sources.push(`conversation:${result.document.id}`);
            relevanceScores.push(result.score);
            currentTokens += tokens;
          }
        }
      }

      // Search knowledge base if requested
      if (includeKnowledgeBase) {
        const knowledgeResults = await this.searchSimilar(query, {
          topK,
          threshold: 0.75,
          filters: { source: 'knowledge_base' }
        });

        for (const result of knowledgeResults) {
          const tokens = this.estimateTokens(result.document.content);
          if (currentTokens + tokens <= maxTokens) {
            contextSections.push(result.document.content);
            sources.push(`knowledge:${result.document.id}`);
            relevanceScores.push(result.score);
            currentTokens += tokens;
          }
        }
      }

      const context = contextSections.join('\n\n---\n\n');

      logger.debug('Retrieved RAG context', {
        query: query.substring(0, 100),
        contextSections: contextSections.length,
        totalTokens: currentTokens,
        sources: sources.length
      });

      return {
        context,
        sources,
        relevanceScores
      };

    } catch (error) {
      logger.error('Failed to retrieve context', {
        error: error.message,
        query: query.substring(0, 100)
      });
      
      return {
        context: '',
        sources: [],
        relevanceScores: []
      };
    }
  }

  /**
   * Add document to knowledge base
   */
  async addKnowledgeDocument(data: {
    content: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const embedding = await this.getEmbedding(data.content);
      
      const doc: VectorDocument = {
        id: this.generateId('kb'),
        content: data.content,
        embedding,
        metadata: {
          timestamp: new Date(),
          source: 'knowledge_base',
          topic: this.extractTopics(data.content),
          language: 'en',
          ...data.metadata
        }
      };

      this.documents.set(doc.id, doc);
      this.knowledgeBase.push(doc);

      logger.info('Added knowledge document', {
        documentId: doc.id,
        contentLength: data.content.length,
        topics: doc.metadata.topic
      });

    } catch (error) {
      logger.error('Failed to add knowledge document', {
        error: error.message,
        contentLength: data.content.length
      });
    }
  }

  /**
   * Get or generate embedding with caching
   */
  private async getEmbedding(text: string): Promise<number[]> {
    // Create cache key
    const cacheKey = `${this.embeddingProvider.getModel()}:${this.hashString(text)}`;
    
    // Check cache
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!;
    }

    // Generate embedding
    const embedding = await this.embeddingProvider.generateEmbedding(text);
    
    // Cache it
    this.embeddingCache.set(cacheKey, embedding);
    
    // Maintain cache size limit
    if (this.embeddingCache.size > 10000) {
      const keys = Array.from(this.embeddingCache.keys());
      const keysToDelete = keys.slice(0, 1000); // Remove oldest 1000
      keysToDelete.forEach(key => this.embeddingCache.delete(key));
    }

    return embedding;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimension');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Extract topics from text (simple keyword-based)
   */
  private extractTopics(text: string): string[] {
    const topicKeywords: Record<string, string[]> = {
      math: ['math', 'mathematics', 'equation', 'calculate', 'algebra', 'geometry'],
      science: ['science', 'physics', 'chemistry', 'biology', 'experiment'],
      programming: ['code', 'programming', 'software', 'algorithm', 'function'],
      history: ['history', 'historical', 'war', 'ancient', 'civilization'],
      literature: ['literature', 'novel', 'poem', 'author', 'book', 'writing'],
      'mental-health': ['anxiety', 'depression', 'stress', 'mental health', 'therapy']
    };

    const lowerText = text.toLowerCase();
    const topics: string[] = [];

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        topics.push(topic);
      }
    }

    return topics;
  }

  /**
   * Estimate token count for text
   */
  private estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Generate a simple hash for strings
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Generate unique ID
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Store conversation turn from event
   */
  private async storeConversationTurn(data: any) {
    if (data.userId && data.query && data.response) {
      await this.storeResponse(
        data.query,
        data.response,
        data.userId,
        data.satisfaction ? data.satisfaction / 5 : 1.0,
        {
          sessionId: data.sessionId,
          requestId: data.requestId,
          model: data.model,
          processingTime: data.processingTime
        }
      );
    }
  }

  /**
   * Get database statistics
   */
  getStats() {
    const userConversationCounts = Array.from(this.userConversations.entries())
      .reduce((acc, [userId, docs]) => {
        acc[userId] = docs.length;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalDocuments: this.documents.size,
      knowledgeBaseDocuments: this.knowledgeBase.length,
      userConversations: Object.keys(this.userConversations).length,
      userConversationCounts,
      embeddingCacheSize: this.embeddingCache.size,
      embeddingProvider: this.embeddingProvider.getModel(),
      embeddingDimension: this.embeddingProvider.getDimension()
    };
  }

  /**
   * Clear user data (for privacy compliance)
   */
  async clearUserData(userId: string) {
    // Remove user's conversation history
    const userDocs = this.userConversations.get(userId) || [];
    userDocs.forEach(doc => this.documents.delete(doc.id));
    this.userConversations.delete(userId);

    // Clear user-specific cache entries (would need more sophisticated tracking)
    // For now, we'll just clear the entire cache
    this.embeddingCache.clear();

    logger.info('Cleared user data', {
      userId,
      documentsRemoved: userDocs.length
    });

    this.eventBus.emitEvent(
      'vector.user.data.cleared',
      { userId, documentsRemoved: userDocs.length },
      'vector-database'
    );
  }
}