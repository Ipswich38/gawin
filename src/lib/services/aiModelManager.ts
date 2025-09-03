/**
 * AI Model Manager - Smart model selection and fallback system
 * Now using Hugging Face Pro models with intelligent routing
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
  costThreshold: number;
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
      // STEM and Analysis Models
      {
        id: 'microsoft/DeepSeek-R1-Distill-Qwen-32B',
        name: 'DeepSeek R1 Distill Qwen 32B',
        provider: 'HuggingFace',
        category: 'reasoning',
        cost_per_1k_tokens: 0.002,
        max_tokens: 4096,
        strengths: ['Mathematical reasoning', 'STEM problem solving', 'Scientific analysis', 'Complex reasoning'],
        active: true,
        fallback_priority: 1
      },
      // Coding Models
      {
        id: 'deepseek-ai/DeepSeek-Coder-V2-Instruct-236B',
        name: 'DeepSeek Coder V2 Instruct 236B',
        provider: 'HuggingFace',
        category: 'coding',
        cost_per_1k_tokens: 0.003,
        max_tokens: 8192,
        strengths: ['Code generation', 'Programming', 'Debugging', 'Algorithm design'],
        active: true,
        fallback_priority: 1
      },
      // Writing and Language Models
      {
        id: 'Qwen/Qwen2.5-72B-Instruct',
        name: 'Qwen 2.5 72B Instruct',
        provider: 'HuggingFace',
        category: 'creative',
        cost_per_1k_tokens: 0.002,
        max_tokens: 4096,
        strengths: ['Creative writing', 'Language tasks', 'Translation', 'General conversation'],
        active: true,
        fallback_priority: 1
      },
      // General Purpose Models
      {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        provider: 'DeepSeek',
        category: 'general',
        cost_per_1k_tokens: 0.001,
        max_tokens: 2048,
        strengths: ['General chat', 'Quick responses', 'Fallback model'],
        active: true,
        fallback_priority: 5
      }
    ];
  }

  private initializeFeatureMapping(): void {
    this.featureMapping = {
      coding_academy: {
        primary: 'deepseek-ai/DeepSeek-Coder-V2-Instruct-236B',
        fallbacks: ['microsoft/DeepSeek-R1-Distill-Qwen-32B', 'Qwen/Qwen2.5-72B-Instruct', 'deepseek-chat'],
        maxRetries: 3,
        costThreshold: 0.005
      },
      ai_academy: {
        primary: 'microsoft/DeepSeek-R1-Distill-Qwen-32B',
        fallbacks: ['Qwen/Qwen2.5-72B-Instruct', 'deepseek-chat'],
        maxRetries: 3,
        costThreshold: 0.005
      },
      creative_studio: {
        primary: 'Qwen/Qwen2.5-72B-Instruct',
        fallbacks: ['microsoft/DeepSeek-R1-Distill-Qwen-32B', 'deepseek-chat'],
        maxRetries: 3,
        costThreshold: 0.005
      },
      translator: {
        primary: 'Qwen/Qwen2.5-72B-Instruct',
        fallbacks: ['microsoft/DeepSeek-R1-Distill-Qwen-32B', 'deepseek-chat'],
        maxRetries: 3,
        costThreshold: 0.005
      },
      robotics: {
        primary: 'microsoft/DeepSeek-R1-Distill-Qwen-32B',
        fallbacks: ['deepseek-ai/DeepSeek-Coder-V2-Instruct-236B', 'deepseek-chat'],
        maxRetries: 3,
        costThreshold: 0.005
      },
      grammar_checker: {
        primary: 'Qwen/Qwen2.5-72B-Instruct',
        fallbacks: ['microsoft/DeepSeek-R1-Distill-Qwen-32B', 'deepseek-chat'],
        maxRetries: 3,
        costThreshold: 0.005
      },
      general_chat: {
        primary: 'Qwen/Qwen2.5-72B-Instruct',
        fallbacks: ['microsoft/DeepSeek-R1-Distill-Qwen-32B', 'deepseek-chat'],
        maxRetries: 3,
        costThreshold: 0.005
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
    return 'deepseek-chat';
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