/**
 * AI Model Manager - Smart model selection and fallback system
 * Automatically handles model availability, cost optimization, and failover
 */

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  category: 'reasoning' | 'coding' | 'creative' | 'general' | 'translation';
  cost_per_1k_tokens: number;
  max_tokens: number;
  strengths: string[];
  active: boolean;
  fallback_priority: number;
}

export interface ModelConfig {
  primary: string;
  fallbacks: string[];
  maxRetries: number;
  costThreshold: number; // Max cost per 1k tokens
}

export interface FeatureModelMapping {
  calculator: ModelConfig;
  coding_academy: ModelConfig;
  ai_academy: ModelConfig;
  creative_studio: ModelConfig;
  translator: ModelConfig;
  robotics: ModelConfig;
  grammar_checker: ModelConfig;
  general_chat: ModelConfig;
}

class AIModelManager {
  private static instance: AIModelManager;
  private models: AIModel[] = [];
  private featureMapping!: FeatureModelMapping;
  private modelHealth: Map<string, { 
    isHealthy: boolean; 
    lastChecked: Date; 
    consecutiveFailures: number;
    avgResponseTime: number;
  }> = new Map();

  private constructor() {
    this.initializeModels();
    this.initializeFeatureMapping();
    this.startHealthMonitoring();
  }

  public static getInstance(): AIModelManager {
    if (!AIModelManager.instance) {
      AIModelManager.instance = new AIModelManager();
    }
    return AIModelManager.instance;
  }

  private initializeModels(): void {
    this.models = [
      // Reasoning Specialists
      {
        id: 'deepseek/deepseek-r1',
        name: 'DeepSeek R1',
        provider: 'DeepSeek',
        category: 'reasoning',
        cost_per_1k_tokens: 0.55,
        max_tokens: 8192,
        strengths: ['Mathematical reasoning', 'Complex problem solving', 'Chain of thought'],
        active: true,
        fallback_priority: 1
      },
      {
        id: 'openai/o1-preview',
        name: 'GPT-4o1 Preview',
        provider: 'OpenAI',
        category: 'reasoning',
        cost_per_1k_tokens: 15.0,
        max_tokens: 32768,
        strengths: ['Advanced reasoning', 'Scientific analysis', 'Complex mathematics'],
        active: true,
        fallback_priority: 3
      },

      // Coding Specialists
      {
        id: 'anthropic/claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        category: 'coding',
        cost_per_1k_tokens: 3.0,
        max_tokens: 200000,
        strengths: ['Code generation', 'Debugging', 'Code review', 'System architecture'],
        active: true,
        fallback_priority: 1
      },
      {
        id: 'openai/gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'OpenAI',
        category: 'coding',
        cost_per_1k_tokens: 10.0,
        max_tokens: 128000,
        strengths: ['Code generation', 'Multi-language support', 'Complex algorithms'],
        active: true,
        fallback_priority: 2
      },
      {
        id: 'deepseek/deepseek-coder',
        name: 'DeepSeek Coder',
        provider: 'DeepSeek',
        category: 'coding',
        cost_per_1k_tokens: 0.14,
        max_tokens: 16384,
        strengths: ['Code completion', 'Bug fixing', 'Code explanation'],
        active: true,
        fallback_priority: 3
      },

      // Creative & General
      {
        id: 'openai/gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        category: 'creative',
        cost_per_1k_tokens: 5.0,
        max_tokens: 128000,
        strengths: ['Creative writing', 'General knowledge', 'Multimodal understanding'],
        active: true,
        fallback_priority: 1
      },
      {
        id: 'anthropic/claude-3-haiku',
        name: 'Claude 3 Haiku',
        provider: 'Anthropic',
        category: 'general',
        cost_per_1k_tokens: 0.25,
        max_tokens: 200000,
        strengths: ['Fast responses', 'Efficient processing', 'Good quality'],
        active: true,
        fallback_priority: 2
      },
      {
        id: 'google/gemini-pro',
        name: 'Gemini Pro',
        provider: 'Google',
        category: 'general',
        cost_per_1k_tokens: 0.5,
        max_tokens: 32768,
        strengths: ['Multilingual', 'Factual accuracy', 'Reasoning'],
        active: true,
        fallback_priority: 3
      },

      // Translation Specialists
      {
        id: 'google/gemini-pro',
        name: 'Gemini Pro',
        provider: 'Google',
        category: 'translation',
        cost_per_1k_tokens: 0.5,
        max_tokens: 32768,
        strengths: ['100+ languages', 'Context preservation', 'Cultural nuances'],
        active: true,
        fallback_priority: 1
      },
      {
        id: 'meta-llama/llama-3.1-70b-instruct',
        name: 'Llama 3.1 70B',
        provider: 'Meta',
        category: 'translation',
        cost_per_1k_tokens: 0.52,
        max_tokens: 131072,
        strengths: ['Open source', 'Multilingual', 'Good performance'],
        active: true,
        fallback_priority: 2
      },

      // Fallback Models (Always available)
      {
        id: 'deepseek/deepseek-chat',
        name: 'DeepSeek Chat',
        provider: 'DeepSeek',
        category: 'general',
        cost_per_1k_tokens: 0.14,
        max_tokens: 32768,
        strengths: ['Low cost', 'Reliable', 'General purpose'],
        active: true,
        fallback_priority: 10
      }
    ];
  }

  private initializeFeatureMapping(): void {
    this.featureMapping = {
      calculator: {
        primary: 'deepseek/deepseek-r1',
        fallbacks: ['openai/o1-preview', 'deepseek/deepseek-chat'],
        maxRetries: 3,
        costThreshold: 2.0
      },
      coding_academy: {
        primary: 'anthropic/claude-3.5-sonnet',
        fallbacks: ['deepseek/deepseek-coder', 'openai/gpt-4-turbo', 'deepseek/deepseek-chat'],
        maxRetries: 3,
        costThreshold: 5.0
      },
      ai_academy: {
        primary: 'openai/gpt-4o',
        fallbacks: ['anthropic/claude-3.5-sonnet', 'google/gemini-pro', 'deepseek/deepseek-chat'],
        maxRetries: 3,
        costThreshold: 7.0
      },
      creative_studio: {
        primary: 'openai/gpt-4o',
        fallbacks: ['anthropic/claude-3.5-sonnet', 'deepseek/deepseek-chat'],
        maxRetries: 3,
        costThreshold: 8.0
      },
      translator: {
        primary: 'google/gemini-pro',
        fallbacks: ['meta-llama/llama-3.1-70b-instruct', 'deepseek/deepseek-chat'],
        maxRetries: 3,
        costThreshold: 1.0
      },
      robotics: {
        primary: 'anthropic/claude-3.5-sonnet',
        fallbacks: ['deepseek/deepseek-r1', 'openai/gpt-4-turbo', 'deepseek/deepseek-chat'],
        maxRetries: 3,
        costThreshold: 4.0
      },
      grammar_checker: {
        primary: 'anthropic/claude-3-haiku',
        fallbacks: ['google/gemini-pro', 'deepseek/deepseek-chat'],
        maxRetries: 2,
        costThreshold: 1.0
      },
      general_chat: {
        primary: 'anthropic/claude-3-haiku',
        fallbacks: ['google/gemini-pro', 'deepseek/deepseek-chat'],
        maxRetries: 2,
        costThreshold: 2.0
      }
    };
  }

  /**
   * Get the best available model for a feature
   */
  public getBestModelForFeature(feature: keyof FeatureModelMapping): string {
    const config = this.featureMapping[feature];
    
    // Check primary model health
    const primaryHealth = this.modelHealth.get(config.primary);
    if (this.isModelHealthy(config.primary) && primaryHealth?.isHealthy !== false) {
      return config.primary;
    }

    // Try fallback models in order
    for (const fallbackModel of config.fallbacks) {
      if (this.isModelHealthy(fallbackModel)) {
        console.log(`🔄 Using fallback model ${fallbackModel} for ${feature}`);
        return fallbackModel;
      }
    }

    // Last resort - return the most reliable model
    console.warn(`⚠️ All preferred models unavailable for ${feature}, using emergency fallback`);
    return 'deepseek/deepseek-chat';
  }

  /**
   * Get model information
   */
  public getModelInfo(modelId: string): AIModel | null {
    return this.models.find(m => m.id === modelId) || null;
  }

  /**
   * Get all available models for a category
   */
  public getModelsByCategory(category: AIModel['category']): AIModel[] {
    return this.models
      .filter(m => m.category === category && m.active)
      .sort((a, b) => a.fallback_priority - b.fallback_priority);
  }

  /**
   * Get cost estimate for a request
   */
  public getCostEstimate(modelId: string, estimatedTokens: number): number {
    const model = this.getModelInfo(modelId);
    if (!model) return 0;
    return (model.cost_per_1k_tokens * estimatedTokens) / 1000;
  }

  /**
   * Report model success/failure for health tracking
   */
  public reportModelResult(modelId: string, success: boolean, responseTime?: number): void {
    const health = this.modelHealth.get(modelId) || {
      isHealthy: true,
      lastChecked: new Date(),
      consecutiveFailures: 0,
      avgResponseTime: 1000
    };

    health.lastChecked = new Date();
    
    if (success) {
      health.consecutiveFailures = 0;
      health.isHealthy = true;
      if (responseTime) {
        health.avgResponseTime = (health.avgResponseTime + responseTime) / 2;
      }
    } else {
      health.consecutiveFailures += 1;
      if (health.consecutiveFailures >= 3) {
        health.isHealthy = false;
        console.warn(`⚠️ Model ${modelId} marked as unhealthy after ${health.consecutiveFailures} failures`);
      }
    }

    this.modelHealth.set(modelId, health);
  }

  /**
   * Check if model is healthy
   */
  private isModelHealthy(modelId: string): boolean {
    const model = this.getModelInfo(modelId);
    if (!model || !model.active) return false;

    const health = this.modelHealth.get(modelId);
    if (!health) return true; // Assume healthy if no data

    // Auto-recovery after 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (!health.isHealthy && health.lastChecked < tenMinutesAgo) {
      console.log(`🔄 Auto-recovering model ${modelId} after cooldown period`);
      health.isHealthy = true;
      health.consecutiveFailures = 0;
      this.modelHealth.set(modelId, health);
      return true;
    }

    return health.isHealthy;
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Check model health every 5 minutes
    setInterval(() => {
      this.performHealthCheck();
    }, 5 * 60 * 1000);
  }

  /**
   * Perform health check on models
   */
  private async performHealthCheck(): Promise<void> {
    console.log('🏥 Performing model health check...');
    
    // Reset models that have been unhealthy for too long
    for (const [modelId, health] of this.modelHealth.entries()) {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      if (!health.isHealthy && health.lastChecked < thirtyMinutesAgo) {
        console.log(`🔄 Auto-recovering model ${modelId} after extended downtime`);
        health.isHealthy = true;
        health.consecutiveFailures = 0;
        this.modelHealth.set(modelId, health);
      }
    }
  }

  /**
   * Get feature configuration
   */
  public getFeatureConfig(feature: keyof FeatureModelMapping): ModelConfig {
    return this.featureMapping[feature];
  }

  /**
   * Update feature model configuration
   */
  public updateFeatureConfig(feature: keyof FeatureModelMapping, config: Partial<ModelConfig>): void {
    this.featureMapping[feature] = { ...this.featureMapping[feature], ...config };
  }

  /**
   * Get system status
   */
  public getSystemStatus(): {
    totalModels: number;
    healthyModels: number;
    unhealthyModels: number;
    modelsByProvider: Record<string, number>;
    avgCostPerProvider: Record<string, number>;
  } {
    const healthyCount = Array.from(this.modelHealth.values()).filter(h => h.isHealthy).length;
    const unhealthyCount = Array.from(this.modelHealth.values()).filter(h => !h.isHealthy).length;
    
    const modelsByProvider = this.models.reduce((acc, model) => {
      acc[model.provider] = (acc[model.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const costsByProvider = this.models.reduce((acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = [];
      }
      acc[model.provider].push(model.cost_per_1k_tokens);
      return acc;
    }, {} as Record<string, number[]>);

    // Calculate averages
    const avgCostPerProvider: Record<string, number> = {};
    for (const provider in costsByProvider) {
      const costs = costsByProvider[provider];
      avgCostPerProvider[provider] = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;
    }

    return {
      totalModels: this.models.length,
      healthyModels: healthyCount,
      unhealthyModels: unhealthyCount,
      modelsByProvider,
      avgCostPerProvider
    };
  }
}

// Export singleton instance
export const aiModelManager = AIModelManager.getInstance();