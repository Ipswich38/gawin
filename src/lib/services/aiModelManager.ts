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
      // STEM-focused models available on Groq (Free)
      {
        id: 'deepseek-r1-distill-llama-70b',
        name: 'DeepSeek R1 Distill (Llama 70B)',
        provider: 'Groq',
        category: 'reasoning',
        cost_per_1k_tokens: 0.0,
        max_tokens: 8192,
        strengths: ['Mathematical reasoning', 'STEM problem solving', 'Chain of thought', 'Scientific analysis'],
        active: true,
        fallback_priority: 1
      },
      {
        id: 'llama-3.3-70b-versatile',
        name: 'Llama 3.3 70B Versatile',
        provider: 'Groq',
        category: 'general',
        cost_per_1k_tokens: 0.0,
        max_tokens: 32768,
        strengths: ['General reasoning', 'Problem solving', 'Multi-domain knowledge'],
        active: true,
        fallback_priority: 2
      },
      {
        id: 'llama3-groq-70b-8192-tool-use-preview',
        name: 'Llama 3 Groq 70B Tool Use',
        provider: 'Groq',
        category: 'coding',
        cost_per_1k_tokens: 0.0,
        max_tokens: 8192,
        strengths: ['Code generation', 'Tool usage', 'Function calling', 'API integration'],
        active: true,
        fallback_priority: 1
      },
      {
        id: 'llama-3.1-70b-versatile',
        name: 'Llama 3.1 70B Versatile',
        provider: 'Groq',
        category: 'general',
        cost_per_1k_tokens: 0.0,
        max_tokens: 131072,
        strengths: ['Long context', 'Complex reasoning', 'Multi-step problems'],
        active: true,
        fallback_priority: 3
      },
      {
        id: 'mixtral-8x7b-32768',
        name: 'Mixtral 8x7B',
        provider: 'Groq',
        category: 'creative',
        cost_per_1k_tokens: 0.0,
        max_tokens: 32768,
        strengths: ['Creative writing', 'Multi-language support', 'Complex reasoning'],
        active: true,
        fallback_priority: 2
      },
      {
        id: 'llama3-8b-8192',
        name: 'Llama 3 8B',
        provider: 'Groq',
        category: 'general',
        cost_per_1k_tokens: 0.0,
        max_tokens: 8192,
        strengths: ['Fast responses', 'Efficient processing', 'General purpose'],
        active: true,
        fallback_priority: 4
      },
      {
        id: 'gemma2-9b-it',
        name: 'Gemma 2 9B',
        provider: 'Groq',
        category: 'translation',
        cost_per_1k_tokens: 0.0,
        max_tokens: 8192,
        strengths: ['Multilingual', 'Instruction following', 'Translation tasks'],
        active: true,
        fallback_priority: 1
      },
      {
        id: 'llama-3.2-1b-preview',
        name: 'Llama 3.2 1B Preview',
        provider: 'Groq',
        category: 'general',
        cost_per_1k_tokens: 0.0,
        max_tokens: 8192,
        strengths: ['Ultra-fast', 'Basic tasks', 'Fallback model'],
        active: true,
        fallback_priority: 10
      }
    ];
  }

  private initializeFeatureMapping(): void {
    this.featureMapping = {
      coding_academy: {
        primary: 'llama3-groq-70b-8192-tool-use-preview',
        fallbacks: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama3-8b-8192'],
        maxRetries: 3,
        costThreshold: 0.0
      },
      ai_academy: {
        primary: 'deepseek-r1-distill-llama-70b',
        fallbacks: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768'],
        maxRetries: 3,
        costThreshold: 0.0
      },
      creative_studio: {
        primary: 'mixtral-8x7b-32768',
        fallbacks: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama3-8b-8192'],
        maxRetries: 3,
        costThreshold: 0.0
      },
      translator: {
        primary: 'gemma2-9b-it',
        fallbacks: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'llama3-8b-8192'],
        maxRetries: 3,
        costThreshold: 0.0
      },
      robotics: {
        primary: 'deepseek-r1-distill-llama-70b',
        fallbacks: ['llama3-groq-70b-8192-tool-use-preview', 'llama-3.3-70b-versatile', 'llama-3.1-70b-versatile'],
        maxRetries: 3,
        costThreshold: 0.0
      },
      grammar_checker: {
        primary: 'llama-3.3-70b-versatile',
        fallbacks: ['mixtral-8x7b-32768', 'gemma2-9b-it', 'llama3-8b-8192'],
        maxRetries: 3,
        costThreshold: 0.0
      },
      general_chat: {
        primary: 'deepseek-r1-distill-llama-70b',
        fallbacks: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768'],
        maxRetries: 3,
        costThreshold: 0.0
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