/**
 * AI Orchestrator Service
 * The brain that decides which model/pipeline to use based on query, context, user history, and confidence
 * Implements hybrid rule-engine + meta-model routing decisions
 */

import { EventBus } from '../events/EventBus';
import { SafetyProcessor } from '../safety/SafetyProcessor';
import { FeatureStore } from '../features/FeatureStore';
import { VectorDatabase } from '../vector/VectorDatabase';
import { logger } from '../utils/logger';

interface QueryContext {
  query: string;
  context: Record<string, any>;
  authContext: {
    userId: string;
    sessionId: string;
    permissions: string[];
    consentFlags: {
      dataCollection: boolean;
      modelTraining: boolean;
      analytics: boolean;
      mentalHealthFeatures: boolean;
    };
    riskLevel: 'low' | 'medium' | 'high';
  };
  requestId: string;
  preferences: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    priority: 'low' | 'normal' | 'high' | 'critical';
  };
  consentToTrain: boolean;
}

interface RoutingDecision {
  modelId: string;
  version: string;
  pipeline: string[];
  confidence: number;
  reasoning: string[];
  fallbackModels: string[];
  estimatedLatency: number;
  costTier: 'low' | 'medium' | 'high';
  safetyChecks: string[];
}

interface ModelResponse {
  content: string;
  model: string;
  version: string;
  confidence: number;
  tokens: {
    input: number;
    output: number;
  };
  latency: number;
  cached: boolean;
  safetyFlags: string[];
}

interface OrchestratorResponse {
  response: string;
  model: string;
  version: string;
  confidence: number;
  reasoning: string[];
  metadata: {
    requestId: string;
    processingTime: number;
    tokensUsed: number;
    cached: boolean;
    pipelineSteps: string[];
    safetyChecks: string[];
    costTier: string;
  };
}

export class OrchestratorService {
  private eventBus: EventBus;
  private safetyProcessor: SafetyProcessor;
  private featureStore: FeatureStore;
  private vectorDb: VectorDatabase;
  private modelRegistry: Map<string, any>;

  // Rule-based routing rules
  private routingRules = [
    {
      condition: (ctx: QueryContext) => this.detectMentalHealthQuery(ctx.query),
      action: 'mental-health-specialized',
      priority: 10,
      reasoning: 'Mental health query detected'
    },
    {
      condition: (ctx: QueryContext) => this.detectEducationalQuery(ctx.query),
      action: 'educational-specialized',
      priority: 8,
      reasoning: 'Educational content query'
    },
    {
      condition: (ctx: QueryContext) => this.detectComplexReasoningQuery(ctx.query),
      action: 'large-reasoning-model',
      priority: 7,
      reasoning: 'Complex reasoning required'
    },
    {
      condition: (ctx: QueryContext) => ctx.preferences.priority === 'critical',
      action: 'fastest-model',
      priority: 9,
      reasoning: 'Critical priority request'
    },
    {
      condition: (ctx: QueryContext) => ctx.authContext.riskLevel === 'high',
      action: 'safety-first-model',
      priority: 10,
      reasoning: 'High risk user requires safety-first approach'
    }
  ];

  // Model configurations
  private modelConfigs = {
    'groq-llama3-70b': {
      id: 'groq-llama3-70b',
      provider: 'groq',
      model: 'llama3-70b-8192',
      maxTokens: 8192,
      costTier: 'medium',
      estimatedLatency: 2000,
      strengths: ['reasoning', 'general'],
      safetyLevel: 'high'
    },
    'groq-mixtral-8x7b': {
      id: 'groq-mixtral-8x7b',
      provider: 'groq',
      model: 'mixtral-8x7b-32768',
      maxTokens: 32768,
      costTier: 'medium',
      estimatedLatency: 1500,
      strengths: ['long-context', 'multilingual'],
      safetyLevel: 'high'
    },
    'openai-gpt4': {
      id: 'openai-gpt4',
      provider: 'openai',
      model: 'gpt-4-1106-preview',
      maxTokens: 4096,
      costTier: 'high',
      estimatedLatency: 5000,
      strengths: ['reasoning', 'safety', 'accuracy'],
      safetyLevel: 'highest'
    },
    'educational-tuned': {
      id: 'educational-tuned',
      provider: 'custom',
      model: 'llama3-education-lora',
      maxTokens: 2048,
      costTier: 'low',
      estimatedLatency: 1000,
      strengths: ['education', 'tutoring'],
      safetyLevel: 'high'
    },
    'mental-health-specialized': {
      id: 'mental-health-specialized',
      provider: 'custom',
      model: 'mental-health-safe-v2',
      maxTokens: 2048,
      costTier: 'medium',
      estimatedLatency: 2500,
      strengths: ['mental-health', 'empathy', 'crisis-detection'],
      safetyLevel: 'highest'
    }
  };

  constructor() {
    this.eventBus = EventBus.getInstance();
    this.safetyProcessor = new SafetyProcessor();
    this.featureStore = new FeatureStore();
    this.vectorDb = new VectorDatabase();
    this.modelRegistry = new Map();
    
    this.initializeModels();
    this.setupEventListeners();
  }

  private initializeModels() {
    Object.entries(this.modelConfigs).forEach(([key, config]) => {
      this.modelRegistry.set(key, config);
    });
  }

  private setupEventListeners() {
    this.eventBus.on('model.response.received', (data) => {
      this.logModelResponse(data);
    });

    this.eventBus.on('safety.violation.detected', (data) => {
      logger.warn('Safety violation detected', data);
    });
  }

  async processQuery(context: QueryContext): Promise<OrchestratorResponse> {
    const startTime = Date.now();
    
    try {
      logger.info('Processing query', {
        requestId: context.requestId,
        userId: context.authContext.userId,
        queryLength: context.query.length
      });

      // Step 1: Safety pre-screening
      const safetyCheck = await this.safetyProcessor.validateQuery(
        context.query,
        context.authContext
      );

      if (!safetyCheck.safe) {
        return this.createSafetyResponse(safetyCheck, context.requestId);
      }

      // Step 2: Load user features and context
      const userFeatures = await this.featureStore.getUserFeatures(
        context.authContext.userId
      );

      // Step 3: Semantic similarity check for cached responses
      const similarResponse = await this.vectorDb.findSimilarResponse(
        context.query,
        context.authContext.userId
      );

      if (similarResponse && similarResponse.confidence > 0.95) {
        return this.createCachedResponse(similarResponse, context.requestId, startTime);
      }

      // Step 4: Make routing decision
      const routingDecision = await this.makeRoutingDecision(context, userFeatures);

      // Step 5: Execute model pipeline
      const modelResponse = await this.executeModelPipeline(
        routingDecision,
        context
      );

      // Step 6: Post-processing and safety check
      const finalResponse = await this.postProcessResponse(
        modelResponse,
        context,
        routingDecision
      );

      // Step 7: Store response for future similarity matching
      if (context.consentToTrain && context.authContext.consentFlags.dataCollection) {
        await this.vectorDb.storeResponse(
          context.query,
          finalResponse.response,
          context.authContext.userId,
          modelResponse.confidence
        );
      }

      // Step 8: Log decision and response for learning
      this.logDecisionOutcome(context, routingDecision, finalResponse);

      return {
        ...finalResponse,
        metadata: {
          ...finalResponse.metadata,
          processingTime: Date.now() - startTime
        }
      };

    } catch (error) {
      logger.error('Orchestrator processing error', {
        error: error.message,
        requestId: context.requestId,
        userId: context.authContext.userId
      });

      return this.createErrorResponse(error, context.requestId, startTime);
    }
  }

  private async makeRoutingDecision(
    context: QueryContext,
    userFeatures: any
  ): Promise<RoutingDecision> {
    const reasoning: string[] = [];
    
    // Apply rule-based routing first
    const applicableRules = this.routingRules
      .filter(rule => rule.condition(context))
      .sort((a, b) => b.priority - a.priority);

    if (applicableRules.length > 0) {
      const topRule = applicableRules[0];
      reasoning.push(topRule.reasoning);
      
      const modelId = this.selectModelForAction(topRule.action, context);
      const modelConfig = this.modelRegistry.get(modelId);

      return {
        modelId,
        version: modelConfig.version || '1.0.0',
        pipeline: this.buildPipeline(topRule.action, context),
        confidence: 0.9, // High confidence for rule-based decisions
        reasoning,
        fallbackModels: this.getFallbackModels(modelId),
        estimatedLatency: modelConfig.estimatedLatency,
        costTier: modelConfig.costTier,
        safetyChecks: this.getSafetyChecks(modelConfig.safetyLevel)
      };
    }

    // Fallback to meta-model or default routing
    return this.useMetaModelRouting(context, userFeatures, reasoning);
  }

  private selectModelForAction(action: string, context: QueryContext): string {
    const modelMap: Record<string, string> = {
      'mental-health-specialized': 'mental-health-specialized',
      'educational-specialized': 'educational-tuned',
      'large-reasoning-model': 'openai-gpt4',
      'fastest-model': 'groq-mixtral-8x7b',
      'safety-first-model': 'openai-gpt4',
      'default': 'groq-llama3-70b'
    };

    return modelMap[action] || modelMap['default'];
  }

  private buildPipeline(action: string, context: QueryContext): string[] {
    const basePipeline = ['preprocessing', 'model-call', 'postprocessing'];
    
    switch (action) {
      case 'mental-health-specialized':
        return ['crisis-detection', 'empathy-enhancement', ...basePipeline, 'mental-health-safety'];
      case 'educational-specialized':
        return ['educational-context', ...basePipeline, 'pedagogical-enhancement'];
      case 'safety-first-model':
        return ['enhanced-safety-check', ...basePipeline, 'output-moderation'];
      default:
        return basePipeline;
    }
  }

  private getFallbackModels(primaryModel: string): string[] {
    const fallbackChains: Record<string, string[]> = {
      'openai-gpt4': ['groq-llama3-70b', 'groq-mixtral-8x7b'],
      'groq-llama3-70b': ['groq-mixtral-8x7b', 'educational-tuned'],
      'mental-health-specialized': ['openai-gpt4', 'groq-llama3-70b'],
      'educational-tuned': ['groq-llama3-70b', 'groq-mixtral-8x7b']
    };

    return fallbackChains[primaryModel] || ['groq-llama3-70b'];
  }

  private getSafetyChecks(safetyLevel: string): string[] {
    const checks = ['input-validation', 'output-moderation'];
    
    if (safetyLevel === 'highest') {
      checks.push('crisis-detection', 'harm-prevention', 'pii-detection');
    } else if (safetyLevel === 'high') {
      checks.push('crisis-detection', 'harm-prevention');
    }
    
    return checks;
  }

  private async useMetaModelRouting(
    context: QueryContext,
    userFeatures: any,
    reasoning: string[]
  ): Promise<RoutingDecision> {
    // This would use a small model to make routing decisions
    // For now, implement simple heuristics
    
    const queryLength = context.query.length;
    const hasComplexTerms = this.detectComplexTerms(context.query);
    
    let selectedModel = 'groq-llama3-70b'; // default
    
    if (queryLength > 2000 || hasComplexTerms) {
      selectedModel = 'groq-mixtral-8x7b'; // better for long context
      reasoning.push('Long or complex query detected');
    }
    
    if (context.preferences.priority === 'high') {
      selectedModel = 'groq-llama3-70b'; // balance of speed and quality
      reasoning.push('High priority request');
    }

    const modelConfig = this.modelRegistry.get(selectedModel);
    
    return {
      modelId: selectedModel,
      version: modelConfig.version || '1.0.0',
      pipeline: ['preprocessing', 'model-call', 'postprocessing'],
      confidence: 0.7, // Medium confidence for heuristic decisions
      reasoning,
      fallbackModels: this.getFallbackModels(selectedModel),
      estimatedLatency: modelConfig.estimatedLatency,
      costTier: modelConfig.costTier,
      safetyChecks: this.getSafetyChecks(modelConfig.safetyLevel)
    };
  }

  private async executeModelPipeline(
    decision: RoutingDecision,
    context: QueryContext
  ): Promise<ModelResponse> {
    // This would integrate with your existing model services
    // Import and use your existing Groq/OpenAI services
    
    const modelConfig = this.modelRegistry.get(decision.modelId);
    
    try {
      // Dynamically import the appropriate service
      let response: any;
      
      if (modelConfig.provider === 'groq') {
        const { groqService } = await import('../../lib/services/groqService');
        response = await groqService.createChatCompletion({
          messages: [{ role: 'user', content: context.query }],
          model: modelConfig.model,
          temperature: context.preferences.temperature || 0.7,
          max_tokens: Math.min(
            context.preferences.maxTokens || 2048,
            modelConfig.maxTokens
          )
        });
      } else if (modelConfig.provider === 'openai') {
        // Integrate with OpenAI service
        response = await this.callOpenAI(context, modelConfig);
      } else {
        // Custom/fine-tuned models
        response = await this.callCustomModel(context, modelConfig);
      }

      return {
        content: response.data?.response || response.data?.content || 'No response available',
        model: decision.modelId,
        version: decision.version,
        confidence: decision.confidence,
        tokens: {
          input: response.data?.usage?.prompt_tokens || 0,
          output: response.data?.usage?.completion_tokens || 0
        },
        latency: response.data?.processing_time || decision.estimatedLatency,
        cached: false,
        safetyFlags: []
      };

    } catch (error) {
      logger.warn('Primary model failed, trying fallback', {
        primaryModel: decision.modelId,
        error: error.message,
        requestId: context.requestId
      });

      return this.executeFallback(decision, context, error);
    }
  }

  private async executeFallback(
    decision: RoutingDecision,
    context: QueryContext,
    primaryError: Error
  ): Promise<ModelResponse> {
    for (const fallbackModel of decision.fallbackModels) {
      try {
        const fallbackConfig = this.modelRegistry.get(fallbackModel);
        const { groqService } = await import('../../lib/services/groqService');
        
        const response = await groqService.createChatCompletion({
          messages: [{ role: 'user', content: context.query }],
          model: fallbackConfig.model,
          temperature: context.preferences.temperature || 0.7,
          max_tokens: context.preferences.maxTokens || 2048
        });

        return {
          content: response.data?.response || 'Fallback response unavailable',
          model: fallbackModel,
          version: fallbackConfig.version || '1.0.0',
          confidence: decision.confidence * 0.8, // Reduce confidence for fallback
          tokens: {
            input: response.data?.usage?.prompt_tokens || 0,
            output: response.data?.usage?.completion_tokens || 0
          },
          latency: response.data?.processing_time || fallbackConfig.estimatedLatency,
          cached: false,
          safetyFlags: []
        };

      } catch (fallbackError) {
        logger.warn('Fallback model failed', {
          fallbackModel,
          error: fallbackError.message
        });
      }
    }

    // All models failed, return error response
    throw new Error(`All models failed. Primary: ${primaryError.message}`);
  }

  private async postProcessResponse(
    modelResponse: ModelResponse,
    context: QueryContext,
    decision: RoutingDecision
  ): Promise<OrchestratorResponse> {
    // Apply post-processing based on pipeline
    let processedContent = modelResponse.content;
    const appliedSteps: string[] = [];

    for (const step of decision.pipeline) {
      switch (step) {
        case 'mental-health-safety':
          const safetyResult = await this.safetyProcessor.validateResponse(
            processedContent,
            'mental-health'
          );
          if (!safetyResult.safe) {
            processedContent = this.generateSafeAlternative(context.query);
            appliedSteps.push('safety-override');
          }
          appliedSteps.push('mental-health-safety');
          break;
          
        case 'pedagogical-enhancement':
          processedContent = this.enhanceEducationalResponse(processedContent);
          appliedSteps.push('pedagogical-enhancement');
          break;
          
        case 'output-moderation':
          const moderationResult = await this.safetyProcessor.moderateOutput(processedContent);
          if (moderationResult.flagged) {
            processedContent = moderationResult.cleanedContent;
          }
          appliedSteps.push('output-moderation');
          break;
      }
    }

    return {
      response: processedContent,
      model: modelResponse.model,
      version: modelResponse.version,
      confidence: modelResponse.confidence,
      reasoning: decision.reasoning,
      metadata: {
        requestId: context.requestId,
        processingTime: 0, // Will be set by caller
        tokensUsed: modelResponse.tokens.input + modelResponse.tokens.output,
        cached: modelResponse.cached,
        pipelineSteps: appliedSteps,
        safetyChecks: decision.safetyChecks,
        costTier: decision.costTier
      }
    };
  }

  // Utility methods for query classification
  private detectMentalHealthQuery(query: string): boolean {
    const mentalHealthKeywords = [
      'depressed', 'anxiety', 'anxious', 'suicide', 'suicidal', 'self-harm',
      'cutting', 'worthless', 'hopeless', 'therapy', 'counseling', 'mental health',
      'panic', 'stress', 'overwhelmed', 'lonely', 'isolated', 'hurt myself',
      'end it all', 'can\'t go on', 'no point', 'better off dead'
    ];
    
    const lowerQuery = query.toLowerCase();
    return mentalHealthKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  private detectEducationalQuery(query: string): boolean {
    const educationKeywords = [
      'homework', 'assignment', 'study', 'exam', 'test', 'quiz', 'lesson',
      'explain', 'learn', 'understand', 'teach', 'tutor', 'grade', 'school',
      'university', 'college', 'course', 'subject', 'chapter', 'textbook'
    ];
    
    const lowerQuery = query.toLowerCase();
    return educationKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  private detectComplexReasoningQuery(query: string): boolean {
    const complexKeywords = [
      'analyze', 'compare', 'contrast', 'evaluate', 'synthesize', 'complex',
      'multi-step', 'reasoning', 'logic', 'proof', 'derivation', 'calculation',
      'solve', 'problem', 'algorithm', 'optimization', 'decision'
    ];
    
    const lowerQuery = query.toLowerCase();
    return complexKeywords.some(keyword => lowerQuery.includes(keyword)) ||
           query.length > 500; // Long queries often need complex reasoning
  }

  private detectComplexTerms(query: string): boolean {
    // Detect technical terms, academic language, etc.
    const complexTermPattern = /\b[A-Z][a-z]{8,}\b|\b\w{12,}\b/g;
    const matches = query.match(complexTermPattern);
    return matches ? matches.length > 2 : false;
  }

  private generateSafeAlternative(originalQuery: string): string {
    return "I understand you're going through a difficult time. It's important to talk to someone who can provide proper support. Please consider reaching out to a mental health professional or a crisis helpline. In the US, you can call 988 for the Suicide & Crisis Lifeline. Remember, you're not alone and help is available.";
  }

  private enhanceEducationalResponse(content: string): string {
    // Add educational structuring, examples, etc.
    return content + "\n\n📚 **Study Tip**: Try breaking this concept into smaller parts and practice with examples to reinforce your understanding.";
  }

  private createSafetyResponse(safetyCheck: any, requestId: string): OrchestratorResponse {
    return {
      response: safetyCheck.message || "I'm here to help with educational and supportive conversations. Please feel free to ask me about study topics or general questions.",
      model: 'safety-filter',
      version: '1.0.0',
      confidence: 1.0,
      reasoning: ['Safety filter activated'],
      metadata: {
        requestId,
        processingTime: 0,
        tokensUsed: 0,
        cached: false,
        pipelineSteps: ['safety-filter'],
        safetyChecks: ['input-validation'],
        costTier: 'free'
      }
    };
  }

  private createCachedResponse(similar: any, requestId: string, startTime: number): OrchestratorResponse {
    return {
      response: similar.response,
      model: similar.model || 'cached',
      version: similar.version || '1.0.0',
      confidence: similar.confidence,
      reasoning: ['Similar query found in cache'],
      metadata: {
        requestId,
        processingTime: Date.now() - startTime,
        tokensUsed: 0,
        cached: true,
        pipelineSteps: ['cache-retrieval'],
        safetyChecks: [],
        costTier: 'free'
      }
    };
  }

  private createErrorResponse(error: Error, requestId: string, startTime: number): OrchestratorResponse {
    return {
      response: "I'm experiencing some technical difficulties right now. Please try again in a moment, or feel free to ask me something else!",
      model: 'error-handler',
      version: '1.0.0',
      confidence: 0.0,
      reasoning: ['Error occurred during processing'],
      metadata: {
        requestId,
        processingTime: Date.now() - startTime,
        tokensUsed: 0,
        cached: false,
        pipelineSteps: ['error-handling'],
        safetyChecks: [],
        costTier: 'free'
      }
    };
  }

  private async callOpenAI(context: QueryContext, modelConfig: any): Promise<any> {
    // Placeholder for OpenAI integration
    throw new Error('OpenAI integration not implemented');
  }

  private async callCustomModel(context: QueryContext, modelConfig: any): Promise<any> {
    // Placeholder for custom model integration
    throw new Error('Custom model integration not implemented');
  }

  private logModelResponse(data: any) {
    // Log model response for analytics
    this.eventBus.emit('analytics.model.response', data);
  }

  private logDecisionOutcome(
    context: QueryContext,
    decision: RoutingDecision,
    response: OrchestratorResponse
  ) {
    this.eventBus.emit('analytics.decision.outcome', {
      requestId: context.requestId,
      userId: context.authContext.userId,
      query: context.query,
      routingDecision: decision,
      response: {
        model: response.model,
        confidence: response.confidence,
        processingTime: response.metadata.processingTime,
        tokensUsed: response.metadata.tokensUsed
      },
      timestamp: new Date().toISOString()
    });
  }
}

export { QueryContext, RoutingDecision, OrchestratorResponse };