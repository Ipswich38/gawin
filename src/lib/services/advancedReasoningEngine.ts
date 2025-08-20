// Advanced Reasoning Engine inspired by Transformer Architecture
// Implements multi-step reasoning, attention mechanisms, and working memory

export const ReasoningMode = {
  FAST_INTUITIVE: 'fast_intuitive',
  DELIBERATIVE: 'deliberative', 
  CREATIVE: 'creative',
  ANALYTICAL: 'analytical',
  METACOGNITIVE: 'metacognitive'
} as const;

export type ReasoningMode = typeof ReasoningMode[keyof typeof ReasoningMode];

export interface ReasoningState {
  mode: ReasoningMode;
  confidence: number;
  reasoningSteps: string[];
  workingMemory: Map<string, any>;
  attentionFocus: string[];
  uncertaintyAreas: string[];
  generatedHypotheses: string[];
  currentContext: string;
}

export interface AttentionPattern {
  tokens: string[];
  attentionWeights: number[][];
  focusAreas: string[];
  relationshipType: 'sequential' | 'associative' | 'hierarchical' | 'comparative' | 'causal';
  confidence: number;
}

export interface ReasoningStep {
  stepNumber: number;
  reasoningContent: string;
  insights: string[];
  confidence: number;
  processingTime: number;
  reasoningMode: ReasoningMode;
  attentionPattern?: AttentionPattern;
}

export interface InferenceResult {
  response: string;
  reasoningTrace: ReasoningStep[];
  evaluation: {
    confidence: number;
    coherence: number;
    completeness: number;
    accuracyEstimate: number;
    reasoningQuality: number;
    overallScore: number;
  };
  metadata: {
    reasoningMode: ReasoningMode;
    responseTime: number;
    reasoningSteps: number;
    confidence: number;
    emergentCapabilities: string[];
  };
}

class AttentionMechanism {
  /**
   * Simulates multi-head attention for understanding relationships between concepts
   */
  
  static analyzeAttentionPattern(tokens: string[], query: string): AttentionPattern {
    const attentionWeights = this.computeAttentionWeights(tokens, query);
    const focusAreas = this.identifyFocusAreas(tokens, attentionWeights);
    const relationshipType = this.detectRelationshipType(tokens, attentionWeights);
    const confidence = this.calculateAttentionConfidence(attentionWeights);

    return {
      tokens,
      attentionWeights,
      focusAreas,
      relationshipType,
      confidence
    };
  }

  private static computeAttentionWeights(tokens: string[], query: string): number[][] {
    const queryTokens = query.toLowerCase().split(/\s+/);
    const seqLen = tokens.length;
    const weights: number[][] = Array(seqLen).fill(null).map(() => Array(seqLen).fill(0));

    // Simulate attention computation based on semantic similarity
    for (let i = 0; i < seqLen; i++) {
      for (let j = 0; j < seqLen; j++) {
        if (i === j) {
          weights[i][j] = 0.3; // Self-attention baseline
        } else {
          // Compute similarity based on various factors
          const semanticSim = this.computeSemanticSimilarity(tokens[i], tokens[j]);
          const positionDecay = Math.exp(-Math.abs(i - j) * 0.1);
          const queryRelevance = this.computeQueryRelevance(tokens[j], queryTokens);
          
          weights[i][j] = semanticSim * positionDecay * queryRelevance;
        }
      }
    }

    // Normalize weights (softmax-like)
    for (let i = 0; i < seqLen; i++) {
      const sum = weights[i].reduce((a, b) => a + b, 0);
      if (sum > 0) {
        for (let j = 0; j < seqLen; j++) {
          weights[i][j] /= sum;
        }
      }
    }

    return weights;
  }

  private static computeSemanticSimilarity(token1: string, token2: string): number {
    // Simplified semantic similarity based on word relationships
    const relatedGroups = [
      ['neural', 'network', 'ai', 'artificial', 'intelligence', 'model', 'deep', 'learning'],
      ['attention', 'transformer', 'mechanism', 'focus', 'context', 'sequence'],
      ['reasoning', 'thinking', 'logic', 'analysis', 'cognitive', 'mental'],
      ['data', 'information', 'knowledge', 'content', 'text', 'input'],
      ['training', 'learning', 'optimization', 'gradient', 'algorithm']
    ];

    const t1 = token1.toLowerCase();
    const t2 = token2.toLowerCase();

    // Check if tokens are in the same semantic group
    for (const group of relatedGroups) {
      if (group.includes(t1) && group.includes(t2)) {
        return 0.8;
      }
    }

    // Check for exact match
    if (t1 === t2) return 1.0;

    // Check for substring relationships
    if (t1.includes(t2) || t2.includes(t1)) return 0.6;

    // Check for common prefixes/suffixes
    if (t1.length > 3 && t2.length > 3) {
      if (t1.substring(0, 3) === t2.substring(0, 3)) return 0.4;
      if (t1.substring(-3) === t2.substring(-3)) return 0.3;
    }

    return 0.1; // Base similarity
  }

  private static computeQueryRelevance(token: string, queryTokens: string[]): number {
    const t = token.toLowerCase();
    
    // Direct match
    if (queryTokens.includes(t)) return 1.0;
    
    // Partial match
    for (const qToken of queryTokens) {
      if (t.includes(qToken) || qToken.includes(t)) return 0.7;
    }

    // Question words get higher relevance
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who'];
    if (questionWords.some(qw => queryTokens.includes(qw))) {
      const conceptWords = ['concept', 'idea', 'principle', 'mechanism', 'process'];
      if (conceptWords.some(cw => t.includes(cw))) return 0.6;
    }

    return 0.2; // Base relevance
  }

  private static identifyFocusAreas(tokens: string[], weights: number[][]): string[] {
    const focusAreas: string[] = [];
    const threshold = 0.3;

    for (let i = 0; i < tokens.length; i++) {
      const maxAttention = Math.max(...weights[i]);
      if (maxAttention > threshold) {
        const maxIndex = weights[i].indexOf(maxAttention);
        focusAreas.push(`${tokens[i]} → ${tokens[maxIndex]} (${maxAttention.toFixed(2)})`);
      }
    }

    return focusAreas.slice(0, 5); // Top 5 focus areas
  }

  private static detectRelationshipType(tokens: string[], weights: number[][]): AttentionPattern['relationshipType'] {
    // Analyze attention patterns to detect relationship types
    
    // Sequential: Strong attention to adjacent tokens
    let sequentialScore = 0;
    for (let i = 1; i < tokens.length; i++) {
      sequentialScore += weights[i][i-1];
    }
    sequentialScore /= (tokens.length - 1);

    // Hierarchical: Later tokens attend to early tokens
    let hierarchicalScore = 0;
    if (tokens.length > 2) {
      for (let i = 2; i < tokens.length; i++) {
        hierarchicalScore += (weights[i][0] + weights[i][1]) / 2;
      }
      hierarchicalScore /= (tokens.length - 2);
    }

    // Comparative: Look for symmetric attention patterns
    let comparativeScore = 0;
    const comparativeWords = ['vs', 'versus', 'compared', 'unlike', 'however', 'but'];
    const hasComparativeWords = tokens.some(t => comparativeWords.includes(t.toLowerCase()));
    if (hasComparativeWords) comparativeScore = 0.6;

    // Causal: Forward-looking attention patterns
    let causalScore = 0;
    const causalWords = ['because', 'since', 'therefore', 'thus', 'causes', 'leads', 'results'];
    const hasCausalWords = tokens.some(t => causalWords.includes(t.toLowerCase()));
    if (hasCausalWords) {
      // Check for forward attention
      for (let i = 0; i < tokens.length - 1; i++) {
        for (let j = i + 1; j < tokens.length; j++) {
          causalScore += weights[i][j];
        }
      }
      causalScore /= (tokens.length * (tokens.length - 1) / 2);
    }

    // Associative: High attention between non-adjacent related tokens
    let associativeScore = 0;
    for (let i = 0; i < tokens.length; i++) {
      for (let j = i + 2; j < tokens.length; j++) { // Skip adjacent tokens
        if (this.computeSemanticSimilarity(tokens[i], tokens[j]) > 0.5) {
          associativeScore += weights[i][j];
        }
      }
    }
    associativeScore /= tokens.length;

    // Return the dominant relationship type
    const scores = {
      sequential: sequentialScore,
      hierarchical: hierarchicalScore,
      comparative: comparativeScore,
      causal: causalScore,
      associative: associativeScore
    };

    const maxScore = Math.max(...Object.values(scores));
    const dominantType = Object.keys(scores).find(key => scores[key as keyof typeof scores] === maxScore);

    return dominantType as AttentionPattern['relationshipType'];
  }

  private static calculateAttentionConfidence(weights: number[][]): number {
    // Calculate confidence based on attention distribution
    let totalVariance = 0;
    let maxAttentions = 0;

    for (const row of weights) {
      const mean = row.reduce((a, b) => a + b, 0) / row.length;
      const variance = row.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / row.length;
      totalVariance += variance;
      maxAttentions += Math.max(...row);
    }

    // Higher variance and higher max attentions indicate more focused, confident attention
    const avgVariance = totalVariance / weights.length;
    const avgMaxAttention = maxAttentions / weights.length;

    return Math.min(1.0, (avgVariance * 2 + avgMaxAttention) / 2);
  }
}

class WorkingMemory {
  private memory = new Map<string, any>();
  private accessTimes = new Map<string, number>();
  private accessCount = new Map<string, number>();
  private capacity: number;

  constructor(capacity: number = 15) {
    this.capacity = capacity;
  }

  store(key: string, value: any): void {
    const currentTime = Date.now();

    // Remove least recently used if at capacity
    if (this.memory.size >= this.capacity) {
      let lruKey = '';
      let oldestTime = Infinity;
      
      for (const [k, time] of this.accessTimes) {
        if (time < oldestTime) {
          oldestTime = time;
          lruKey = k;
        }
      }

      if (lruKey) {
        this.memory.delete(lruKey);
        this.accessTimes.delete(lruKey);
        this.accessCount.delete(lruKey);
      }
    }

    this.memory.set(key, value);
    this.accessTimes.set(key, currentTime);
    this.accessCount.set(key, 0);
  }

  retrieve(key: string): any {
    if (this.memory.has(key)) {
      this.accessTimes.set(key, Date.now());
      this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
      return this.memory.get(key);
    }
    return null;
  }

  getActiveConcepts(): string[] {
    return Array.from(this.memory.keys());
  }

  getMemoryUtilization(): number {
    return this.memory.size / this.capacity;
  }

  getMostAccessedConcepts(limit: number = 5): string[] {
    return Array.from(this.accessCount.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([key]) => key);
  }
}

class UncertaintyTracker {
  private uncertaintyLog: Array<{
    timestamp: number;
    source: string;
    level: number;
    description: string;
  }> = [];

  private confidenceThreshold = 0.7;

  logUncertainty(source: string, level: number, description: string): void {
    this.uncertaintyLog.push({
      timestamp: Date.now(),
      source,
      level,
      description
    });

    // Keep only recent entries
    const cutoff = Date.now() - 30000; // 30 seconds
    this.uncertaintyLog = this.uncertaintyLog.filter(entry => entry.timestamp > cutoff);
  }

  getCurrentUncertainty(): number {
    if (this.uncertaintyLog.length === 0) return 0.5;

    const recentUncertainties = this.uncertaintyLog
      .slice(-5)
      .map(entry => entry.level);

    return recentUncertainties.reduce((a, b) => a + b, 0) / recentUncertainties.length;
  }

  shouldContinueReasoning(): boolean {
    const currentUncertainty = this.getCurrentUncertainty();
    return currentUncertainty > (1 - this.confidenceThreshold);
  }

  getUncertaintyTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.uncertaintyLog.length < 3) return 'stable';

    const recent = this.uncertaintyLog.slice(-3).map(e => e.level);
    const trend = recent[2] - recent[0];

    if (Math.abs(trend) < 0.1) return 'stable';
    return trend > 0 ? 'increasing' : 'decreasing';
  }
}

export class AdvancedReasoningEngine {
  private reasoningState: ReasoningState;
  private workingMemory: WorkingMemory;
  private uncertaintyTracker: UncertaintyTracker;
  private responseTimes: number[] = [];
  private confidenceScores: number[] = [];

  private config = {
    maxReasoningSteps: 5,
    confidenceThreshold: 0.7,
    temperatureSchedule: [0.8, 0.6, 0.4], // Decreasing for refinement
    metacognitiveThreshold: 0.8,
    creativeBooostThreshold: 0.3
  };

  constructor() {
    this.reasoningState = {
      mode: ReasoningMode.FAST_INTUITIVE,
      confidence: 0.5,
      reasoningSteps: [],
      workingMemory: new Map(),
      attentionFocus: [],
      uncertaintyAreas: [],
      generatedHypotheses: [],
      currentContext: ''
    };

    this.workingMemory = new WorkingMemory();
    this.uncertaintyTracker = new UncertaintyTracker();
  }

  async processQuery(query: string, context?: string): Promise<InferenceResult> {
    const startTime = Date.now();

    try {
      // Phase 1: Query Analysis and Mode Selection
      const analysis = this.analyzeQuery(query, context);
      this.reasoningState.mode = this.selectReasoningMode(analysis);
      this.reasoningState.currentContext = context || '';

      console.log(`🧠 Reasoning Engine: Processing "${query}" in ${this.reasoningState.mode} mode`);

      // Phase 2: Multi-step Reasoning Process
      const reasoningTrace: ReasoningStep[] = [];

      for (let step = 0; step < this.config.maxReasoningSteps; step++) {
        const stepResult = await this.executeReasoningStep(query, context, step, analysis);
        reasoningTrace.push(stepResult);

        // Store insights in working memory
        this.workingMemory.store(`step_${step}_insights`, stepResult.insights);

        // Check if sufficient confidence reached
        if (stepResult.confidence > this.config.confidenceThreshold) {
          console.log(`✅ Confidence threshold reached at step ${step + 1}`);
          break;
        }

        // Update reasoning state
        this.updateReasoningState(stepResult);
      }

      // Phase 3: Generate Final Response
      const finalResponse = this.generateFinalResponse(query, reasoningTrace);

      // Phase 4: Evaluate Response Quality
      const evaluation = this.evaluateResponse(finalResponse, reasoningTrace);

      // Track performance
      const responseTime = Date.now() - startTime;
      this.responseTimes.push(responseTime);
      this.confidenceScores.push(evaluation.confidence);

      return {
        response: finalResponse,
        reasoningTrace,
        evaluation,
        metadata: {
          reasoningMode: this.reasoningState.mode,
          responseTime,
          reasoningSteps: reasoningTrace.length,
          confidence: evaluation.confidence,
          emergentCapabilities: this.detectEmergentCapabilities(reasoningTrace)
        }
      };

    } catch (error) {
      console.error('Reasoning Engine Error:', error);
      
      return {
        response: `I encountered an error while processing your query: ${error}. Let me provide a direct response based on my knowledge.`,
        reasoningTrace: [],
        evaluation: {
          confidence: 0.3,
          coherence: 0.5,
          completeness: 0.4,
          accuracyEstimate: 0.4,
          reasoningQuality: 0.3,
          overallScore: 0.38
        },
        metadata: {
          reasoningMode: ReasoningMode.FAST_INTUITIVE,
          responseTime: Date.now() - startTime,
          reasoningSteps: 0,
          confidence: 0.3,
          emergentCapabilities: []
        }
      };
    }
  }

  private analyzeQuery(query: string, context?: string) {
    const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    
    return {
      queryType: this.classifyQueryType(query),
      complexityLevel: this.assessComplexity(query),
      domain: this.identifyDomain(query),
      requiresReasoning: this.requiresReasoning(query),
      ambiguityLevel: this.assessAmbiguity(query),
      contextDependence: this.assessContextDependence(query, context),
      expectedResponseType: this.determineResponseType(query),
      tokens,
      attentionPattern: AttentionMechanism.analyzeAttentionPattern(tokens, query)
    };
  }

  private classifyQueryType(query: string): string {
    const q = query.toLowerCase();
    
    if (/\b(what|define|explain)\b/.test(q)) return 'explanatory';
    if (/\b(how|step|process)\b/.test(q)) return 'procedural';
    if (/\b(why|because|reason)\b/.test(q)) return 'causal';
    if (/\b(compare|versus|difference)\b/.test(q)) return 'comparative';
    if (/\b(should|recommend|advice)\b/.test(q)) return 'advisory';
    if (/\b(will|predict|future)\b/.test(q) && q.includes('?')) return 'predictive';
    if (/\b(create|generate|write|design)\b/.test(q)) return 'creative';
    
    return 'general';
  }

  private assessComplexity(query: string): number {
    const indicators = [
      query.split(' ').length > 15,
      (query.match(/[,;]/g) || []).length > 2,
      /\b(analyze|evaluate|synthesize|integrate)\b/i.test(query),
      (query.match(/\?/g) || []).length > 1,
      query.split(' ').filter(w => w.length > 8).length > 3
    ];

    return indicators.filter(Boolean).length / indicators.length;
  }

  private identifyDomain(query: string): string {
    const domains = {
      technology: /\b(ai|artificial intelligence|machine learning|computer|software|algorithm|neural|network)\b/i,
      science: /\b(physics|chemistry|biology|research|experiment|scientific|hypothesis)\b/i,
      mathematics: /\b(equation|calculate|proof|theorem|formula|mathematical|statistics)\b/i,
      business: /\b(strategy|marketing|finance|management|revenue|business|company)\b/i,
      philosophy: /\b(ethics|morality|consciousness|existence|meaning|philosophy)\b/i,
      creative: /\b(story|poem|design|art|creative|imagine|writing)\b/i
    };

    for (const [domain, pattern] of Object.entries(domains)) {
      if (pattern.test(query)) return domain;
    }

    return 'general';
  }

  private requiresReasoning(query: string): boolean {
    return /\b(why|how.*work|analyze|compare|evaluate|explain.*complex)\b/i.test(query) ||
           (query.match(/\?/g) || []).length > 1 ||
           query.split(' ').length > 10;
  }

  private assessAmbiguity(query: string): number {
    const pronouns = (query.match(/\b(it|this|that|they|them)\b/gi) || []).length;
    const totalWords = query.split(' ').length;
    
    const factors = [
      pronouns / totalWords,
      /\b(or|maybe|possibly)\b/i.test(query) ? 0.3 : 0,
      !/[.?!]$/.test(query.trim()) ? 0.2 : 0,
      totalWords < 5 ? 0.4 : 0
    ];

    return factors.reduce((a, b) => a + b, 0) / factors.length;
  }

  private assessContextDependence(query: string, context?: string): number {
    if (!context) return 0.3;

    const indicators = [
      /\b(this|that|it|they)\b/i.test(query),
      /^(and|but|however|therefore)/i.test(query.trim()),
      query.split(' ').length < 8
    ];

    return indicators.filter(Boolean).length / indicators.length;
  }

  private determineResponseType(query: string): string {
    if (/\b(list|steps|process)\b/i.test(query)) return 'structured';
    if (/\b(explain|describe)\b/i.test(query)) return 'explanatory';
    if (/\b(yes|no|true|false)\b/i.test(query)) return 'binary';
    if (/\b(create|write|generate)\b/i.test(query)) return 'creative';
    return 'conversational';
  }

  private selectReasoningMode(analysis: any): ReasoningMode {
    const { complexityLevel, requiresReasoning, queryType, ambiguityLevel } = analysis;

    if (queryType === 'creative') return ReasoningMode.CREATIVE;
    if (complexityLevel > 0.7 && requiresReasoning) return ReasoningMode.ANALYTICAL;
    if (requiresReasoning && ambiguityLevel > 0.5) return ReasoningMode.DELIBERATIVE;
    if (complexityLevel > 0.8) return ReasoningMode.METACOGNITIVE;
    
    return ReasoningMode.FAST_INTUITIVE;
  }

  private async executeReasoningStep(
    query: string, 
    context: string | undefined, 
    step: number, 
    analysis: any
  ): Promise<ReasoningStep> {
    const stepStart = Date.now();

    // Generate reasoning based on mode and step
    const reasoningContent = this.generateReasoningContent(query, step, analysis);
    
    // Extract insights from reasoning
    const insights = this.extractInsights(reasoningContent, analysis);
    
    // Calculate step confidence
    const confidence = this.calculateStepConfidence(reasoningContent, insights, step);

    // Log uncertainty if confidence is low
    if (confidence < 0.6) {
      this.uncertaintyTracker.logUncertainty(
        `step_${step}`,
        1 - confidence,
        `Low confidence in reasoning step ${step + 1}`
      );
    }

    return {
      stepNumber: step,
      reasoningContent,
      insights,
      confidence,
      processingTime: Date.now() - stepStart,
      reasoningMode: this.reasoningState.mode,
      attentionPattern: analysis.attentionPattern
    };
  }

  private generateReasoningContent(query: string, step: number, analysis: any): string {
    const reasoningMode = this.reasoningState.mode;
    const { queryType, domain, attentionPattern } = analysis;

    const modeStrategies = {
      [ReasoningMode.FAST_INTUITIVE]: () => 
        `Direct response: Based on ${domain} knowledge, ${query.toLowerCase().replace('?', '')} involves ${attentionPattern.focusAreas.slice(0, 2).join(' and ')}.`,
      
      [ReasoningMode.DELIBERATIVE]: () =>
        `Step ${step + 1}: Considering multiple perspectives on "${query}". Key relationships: ${attentionPattern.relationshipType}. Focus areas: ${attentionPattern.focusAreas.join(', ')}.`,
      
      [ReasoningMode.ANALYTICAL]: () =>
        `Analytical step ${step + 1}: Breaking down the ${queryType} query systematically. Attention pattern shows ${attentionPattern.relationshipType} relationships with confidence ${attentionPattern.confidence.toFixed(2)}.`,
      
      [ReasoningMode.CREATIVE]: () =>
        `Creative exploration ${step + 1}: Exploring novel connections and possibilities for "${query}". Divergent thinking on ${attentionPattern.focusAreas.join(' + ')}.`,
      
      [ReasoningMode.METACOGNITIVE]: () =>
        `Meta-reasoning ${step + 1}: Reflecting on how to approach "${query}". Current strategy effectiveness: ${attentionPattern.confidence > 0.6 ? 'high' : 'moderate'}. Adjusting reasoning approach.`
    };

    return modeStrategies[reasoningMode]();
  }

  private extractInsights(reasoningContent: string, analysis: any): string[] {
    const insights = [];
    const { attentionPattern, domain, queryType } = analysis;

    // Domain-specific insights
    insights.push(`Domain context: ${domain} with ${queryType} query pattern`);

    // Attention-based insights
    insights.push(`Attention focus: ${attentionPattern.relationshipType} relationships detected`);

    // Relationship insights
    if (attentionPattern.focusAreas.length > 0) {
      insights.push(`Key relationships: ${attentionPattern.focusAreas.slice(0, 2).join(', ')}`);
    }

    // Confidence insights
    if (attentionPattern.confidence > 0.7) {
      insights.push('High attention confidence indicates clear conceptual structure');
    } else {
      insights.push('Lower attention confidence suggests need for more deliberation');
    }

    return insights;
  }

  private calculateStepConfidence(content: string, insights: string[], step: number): number {
    const factors = [
      insights.length >= 2,
      content.length > 50,
      !/(uncertain|unclear|maybe|possibly)/i.test(content),
      this.reasoningState.mode !== ReasoningMode.FAST_INTUITIVE
    ];

    let baseConfidence = factors.filter(Boolean).length / factors.length;

    // Adjust for reasoning mode
    const modeAdjustments = {
      [ReasoningMode.FAST_INTUITIVE]: -0.1,
      [ReasoningMode.DELIBERATIVE]: 0.1,
      [ReasoningMode.ANALYTICAL]: 0.15,
      [ReasoningMode.METACOGNITIVE]: 0.05,
      [ReasoningMode.CREATIVE]: -0.05
    };

    baseConfidence += modeAdjustments[this.reasoningState.mode];

    // Progressive confidence building
    baseConfidence += step * 0.05;

    return Math.min(1.0, Math.max(0.1, baseConfidence));
  }

  private updateReasoningState(stepResult: ReasoningStep): void {
    this.reasoningState.confidence = stepResult.confidence;
    this.reasoningState.reasoningSteps.push(stepResult.reasoningContent);
    
    // Update attention focus
    stepResult.insights.forEach(insight => {
      if (!this.reasoningState.attentionFocus.includes(insight)) {
        this.reasoningState.attentionFocus.push(insight);
      }
    });

    // Dynamic mode switching based on confidence
    if (stepResult.confidence < 0.4 && this.reasoningState.mode === ReasoningMode.FAST_INTUITIVE) {
      this.reasoningState.mode = ReasoningMode.DELIBERATIVE;
      console.log('🔄 Switching to deliberative mode due to low confidence');
    }
  }

  private generateFinalResponse(query: string, reasoningTrace: ReasoningStep[]): string {
    const allInsights = reasoningTrace.flatMap(step => step.insights);
    const avgConfidence = reasoningTrace.reduce((sum, step) => sum + step.confidence, 0) / reasoningTrace.length;
    
    let response = `Based on my analysis: `;

    // Incorporate key insights
    const keyInsights = allInsights.slice(0, 3);
    response += keyInsights.join(', ') + '. ';

    // Add reasoning quality indicator
    if (avgConfidence > 0.7) {
      response += 'This analysis is well-supported by the available information.';
    } else if (avgConfidence > 0.5) {
      response += 'This analysis has moderate confidence based on available information.';
    } else {
      response += 'This analysis requires additional information for higher confidence.';
    }

    return response;
  }

  private evaluateResponse(response: string, reasoningTrace: ReasoningStep[]): InferenceResult['evaluation'] {
    const confidence = this.calculateOverallConfidence(reasoningTrace);
    const coherence = this.assessCoherence(response);
    const completeness = this.assessCompleteness(response, reasoningTrace);
    const accuracyEstimate = this.estimateAccuracy(response);
    const reasoningQuality = this.assessReasoningQuality(reasoningTrace);

    const overallScore = (confidence + coherence + completeness + accuracyEstimate + reasoningQuality) / 5;

    return {
      confidence,
      coherence,
      completeness,
      accuracyEstimate,
      reasoningQuality,
      overallScore
    };
  }

  private calculateOverallConfidence(reasoningTrace: ReasoningStep[]): number {
    if (reasoningTrace.length === 0) return 0.5;

    const stepConfidences = reasoningTrace.map(step => step.confidence);
    const weights = stepConfidences.map((_, i) => i + 1); // Later steps weighted more
    
    const weightedSum = stepConfidences.reduce((sum, conf, i) => sum + conf * weights[i], 0);
    const weightSum = weights.reduce((a, b) => a + b, 0);

    return weightedSum / weightSum;
  }

  private assessCoherence(response: string): number {
    const indicators = [
      response.split('.').length > 1,
      !/\b(um|uh|well|like)\b/i.test(response),
      /[.!?]$/.test(response.trim()),
      response.split(' ').length > 10
    ];

    return indicators.filter(Boolean).length / indicators.length;
  }

  private assessCompleteness(response: string, reasoningTrace: ReasoningStep[]): number {
    const allInsights = reasoningTrace.flatMap(step => step.insights);
    let incorporatedInsights = 0;

    for (const insight of allInsights.slice(0, 3)) {
      const insightWords = insight.toLowerCase().split(' ').filter(w => w.length > 3);
      if (insightWords.some(word => response.toLowerCase().includes(word))) {
        incorporatedInsights++;
      }
    }

    return incorporatedInsights / Math.min(3, allInsights.length);
  }

  private estimateAccuracy(response: string): number {
    const indicators = [
      !/\b(maybe|possibly|might be|could be)\b/i.test(response),
      response.split(' ').length > 15,
      (response.match(/,/g) || []).length > 1
    ];

    return indicators.filter(Boolean).length / indicators.length;
  }

  private assessReasoningQuality(reasoningTrace: ReasoningStep[]): number {
    if (reasoningTrace.length === 0) return 0.5;

    const factors = [
      reasoningTrace.length > 1,
      reasoningTrace.some(step => step.confidence > 0.7),
      new Set(reasoningTrace.map(step => step.reasoningMode)).size > 1,
      reasoningTrace.some(step => step.attentionPattern && step.attentionPattern.confidence > 0.6)
    ];

    return factors.filter(Boolean).length / factors.length;
  }

  private detectEmergentCapabilities(reasoningTrace: ReasoningStep[]): string[] {
    const capabilities = [];

    // Multi-step reasoning
    if (reasoningTrace.length > 2) {
      capabilities.push('Multi-step reasoning');
    }

    // High confidence reasoning
    if (reasoningTrace.some(step => step.confidence > 0.8)) {
      capabilities.push('High-confidence analysis');
    }

    // Attention pattern recognition
    if (reasoningTrace.some(step => step.attentionPattern && step.attentionPattern.confidence > 0.7)) {
      capabilities.push('Attention pattern analysis');
    }

    // Mode switching
    const uniqueModes = new Set(reasoningTrace.map(step => step.reasoningMode));
    if (uniqueModes.size > 1) {
      capabilities.push('Dynamic reasoning adaptation');
    }

    // Complex relationship detection
    if (reasoningTrace.some(step => 
      step.attentionPattern && 
      ['hierarchical', 'causal', 'comparative'].includes(step.attentionPattern.relationshipType)
    )) {
      capabilities.push('Complex relationship modeling');
    }

    return capabilities;
  }

  // Public methods for monitoring and analysis
  getPerformanceMetrics() {
    return {
      averageResponseTime: this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length || 0,
      averageConfidence: this.confidenceScores.reduce((a, b) => a + b, 0) / this.confidenceScores.length || 0,
      workingMemoryUtilization: this.workingMemory.getMemoryUtilization(),
      currentUncertainty: this.uncertaintyTracker.getCurrentUncertainty(),
      uncertaintyTrend: this.uncertaintyTracker.getUncertaintyTrend()
    };
  }

  getWorkingMemoryState() {
    return {
      activeConcepts: this.workingMemory.getActiveConcepts(),
      mostAccessed: this.workingMemory.getMostAccessedConcepts(),
      utilization: this.workingMemory.getMemoryUtilization()
    };
  }

  getCurrentReasoningState(): ReasoningState {
    return { ...this.reasoningState };
  }
}