import { AgentContext, CulturalContext, VoiceContext } from '../types';

export interface ContextSnapshot {
  id: string;
  timestamp: Date;
  context: AgentContext;
  triggers: string[];
  changes: ContextChange[];
}

export interface ContextChange {
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  reason: string;
}

export interface ContextPrediction {
  field: string;
  predictedValue: any;
  confidence: number;
  reasoning: string;
  timeframe: number; // milliseconds
}

export class ContextManager {
  private currentContext: AgentContext;
  private contextHistory: ContextSnapshot[] = [];
  private culturalAdaptations: Map<string, CulturalContext> = new Map();
  private voiceContexts: Map<string, VoiceContext> = new Map();
  private contextPatterns: Map<string, any> = new Map();

  constructor(initialContext: AgentContext) {
    this.currentContext = { ...initialContext };
    this.initializeCulturalAdaptations();
    this.captureContextSnapshot('initialization');
  }

  async initialize(): Promise<void> {
    await this.loadContextHistory();
    await this.loadCulturalAdaptations();
    this.startContextMonitoring();
  }

  getCurrentContext(): AgentContext {
    return { ...this.currentContext };
  }

  async updateContext(updates: Partial<AgentContext>, reason: string = 'manual_update'): Promise<void> {
    const changes: ContextChange[] = [];

    // Track changes
    for (const [key, newValue] of Object.entries(updates)) {
      const oldValue = (this.currentContext as any)[key];
      if (oldValue !== newValue) {
        changes.push({
          field: key,
          oldValue,
          newValue,
          timestamp: new Date(),
          reason
        });
      }
    }

    // Apply updates
    this.currentContext = {
      ...this.currentContext,
      ...updates
    };

    // Capture snapshot if significant changes
    if (changes.length > 0) {
      this.captureContextSnapshot(reason, changes);
      await this.analyzeContextPatterns(changes);
    }

    // Update cultural adaptations if relevant
    if (updates.userPreferences?.language || updates.currentLocation) {
      await this.updateCulturalAdaptations();
    }
  }

  async enrichContext(additionalData: Record<string, any>): Promise<void> {
    const enrichments: Record<string, any> = {};

    // Location enrichment
    if (this.currentContext.currentLocation && !this.currentContext.currentLocation.city) {
      const locationDetails = await this.enrichLocationData(this.currentContext.currentLocation);
      enrichments.currentLocation = { ...this.currentContext.currentLocation, ...locationDetails };
    }

    // User preference enrichment
    if (this.currentContext.userPreferences) {
      const preferences = await this.enrichUserPreferences(this.currentContext.userPreferences);
      enrichments.userPreferences = { ...this.currentContext.userPreferences, ...preferences };
    }

    // Cultural context enrichment
    if (this.currentContext.userPreferences?.language) {
      const culturalContext = await this.getCulturalContext(this.currentContext.userPreferences.language);
      enrichments.metadata = {
        ...this.currentContext.metadata,
        culturalContext
      };
    }

    // Apply enrichments
    if (Object.keys(enrichments).length > 0) {
      await this.updateContext(enrichments, 'context_enrichment');
    }
  }

  async predictContextChanges(): Promise<ContextPrediction[]> {
    const predictions: ContextPrediction[] = [];

    // Analyze patterns to predict likely changes
    const patterns = Array.from(this.contextPatterns.values());

    for (const pattern of patterns) {
      if (pattern.frequency > 3 && pattern.confidence > 0.7) {
        const prediction = this.generatePredictionFromPattern(pattern);
        if (prediction) {
          predictions.push(prediction);
        }
      }
    }

    // Time-based predictions
    const timePredictions = this.generateTimeBasedPredictions();
    predictions.push(...timePredictions);

    return predictions.sort((a, b) => b.confidence - a.confidence);
  }

  async adaptToUserBehavior(behaviorData: Record<string, any>): Promise<void> {
    const adaptations: Partial<AgentContext> = {};

    // Analyze behavior patterns
    if (behaviorData.responseTime) {
      // Adapt communication frequency based on response patterns
      if (behaviorData.responseTime > 30000) { // Slow responses
        adaptations.userPreferences = {
          ...this.currentContext.userPreferences,
          enhancedResponses: true // Provide more detailed responses
        };
      }
    }

    if (behaviorData.interactionStyle) {
      // Adapt to user's communication style
      adaptations.userPreferences = {
        ...this.currentContext.userPreferences,
        ...this.inferPreferencesFromStyle(behaviorData.interactionStyle)
      };
    }

    if (behaviorData.languageUsage) {
      // Adapt to language patterns
      const languageAdaptations = this.analyzeLanguageUsage(behaviorData.languageUsage);
      adaptations.userPreferences = {
        ...this.currentContext.userPreferences,
        ...languageAdaptations
      };
    }

    if (Object.keys(adaptations).length > 0) {
      await this.updateContext(adaptations, 'behavior_adaptation');
    }
  }

  async getCulturalContext(language: string): Promise<CulturalContext | null> {
    let cultural = this.culturalAdaptations.get(language);

    if (!cultural) {
      cultural = await this.buildCulturalContext(language);
      if (cultural) {
        this.culturalAdaptations.set(language, cultural);
      }
    }

    return cultural || null;
  }

  async updateVoiceContext(userId: string, voiceData: Partial<VoiceContext>): Promise<void> {
    const existing = this.voiceContexts.get(userId) || {
      emotion: 'neutral',
      tone: 'conversational',
      speed: 1.0,
      pitch: 1.0,
      language: 'en'
    };

    const updated = { ...existing, ...voiceData };
    this.voiceContexts.set(userId, updated);

    // Update main context if this is the current user
    if (userId === this.currentContext.userId) {
      await this.updateContext({
        metadata: {
          ...this.currentContext.metadata,
          voiceContext: updated
        }
      }, 'voice_context_update');
    }
  }

  getVoiceContext(userId: string): VoiceContext | null {
    return this.voiceContexts.get(userId) || null;
  }

  private captureContextSnapshot(trigger: string, changes: ContextChange[] = []): void {
    const snapshot: ContextSnapshot = {
      id: this.generateSnapshotId(),
      timestamp: new Date(),
      context: { ...this.currentContext },
      triggers: [trigger],
      changes
    };

    this.contextHistory.push(snapshot);

    // Keep only last 100 snapshots
    if (this.contextHistory.length > 100) {
      this.contextHistory.shift();
    }
  }

  private async analyzeContextPatterns(changes: ContextChange[]): Promise<void> {
    for (const change of changes) {
      const patternKey = `${change.field}_${change.reason}`;
      const existing = this.contextPatterns.get(patternKey) || {
        field: change.field,
        reason: change.reason,
        frequency: 0,
        values: [],
        confidence: 0,
        lastSeen: new Date()
      };

      existing.frequency++;
      existing.values.push(change.newValue);
      existing.lastSeen = new Date();
      existing.confidence = Math.min(existing.frequency / 10, 1.0);

      this.contextPatterns.set(patternKey, existing);
    }
  }

  private generatePredictionFromPattern(pattern: any): ContextPrediction | null {
    // Predict based on historical patterns
    const mostCommonValue = this.getMostCommonValue(pattern.values);

    if (mostCommonValue && pattern.confidence > 0.5) {
      return {
        field: pattern.field,
        predictedValue: mostCommonValue,
        confidence: pattern.confidence,
        reasoning: `Based on ${pattern.frequency} previous occurrences of ${pattern.reason}`,
        timeframe: this.estimateTimeframe(pattern)
      };
    }

    return null;
  }

  private generateTimeBasedPredictions(): ContextPrediction[] {
    const predictions: ContextPrediction[] = [];
    const now = new Date();

    // Predict location changes based on time of day
    if (this.currentContext.currentLocation) {
      const hour = now.getHours();

      if (hour >= 8 && hour <= 17) {
        // Work hours - predict work location
        predictions.push({
          field: 'environment',
          predictedValue: 'work',
          confidence: 0.7,
          reasoning: 'Work hours detected',
          timeframe: 60 * 60 * 1000 // 1 hour
        });
      } else if (hour >= 18 && hour <= 22) {
        // Evening - predict home environment
        predictions.push({
          field: 'environment',
          predictedValue: 'home',
          confidence: 0.8,
          reasoning: 'Evening hours detected',
          timeframe: 30 * 60 * 1000 // 30 minutes
        });
      }
    }

    return predictions;
  }

  private async enrichLocationData(location: { latitude: number; longitude: number }): Promise<any> {
    // Simulate location enrichment
    // In a real implementation, this would call a geocoding service
    return {
      city: 'Unknown City',
      country: 'Unknown Country',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  private async enrichUserPreferences(preferences: any): Promise<any> {
    // Enrich user preferences based on behavior analysis
    const enriched: any = {};

    // Infer missing preferences
    if (!preferences.enableVoiceAnalysis && preferences.language === 'tagalog') {
      enriched.enableVoiceAnalysis = true;
    }

    if (!preferences.enhancedResponses && preferences.enableLearning) {
      enriched.enhancedResponses = true;
    }

    return enriched;
  }

  private async buildCulturalContext(language: string): Promise<CulturalContext | null> {
    // Build cultural context based on language
    const culturalMappings: Record<string, Partial<CulturalContext>> = {
      tagalog: {
        language: 'tagalog',
        region: 'Philippines',
        customs: ['respect for elders', 'hospitality', 'family-centered'],
        communicationStyle: 'indirect, respectful',
        preferences: {
          formalAddress: true,
          familyImportance: 'high',
          timeOrientation: 'flexible'
        }
      },
      filipino: {
        language: 'filipino',
        region: 'Philippines',
        customs: ['bayanihan spirit', 'respect for authority', 'harmony'],
        communicationStyle: 'context-dependent, polite',
        preferences: {
          conflictAvoidance: true,
          groupHarmony: 'high',
          respectForAge: 'high'
        }
      }
    };

    const mapping = culturalMappings[language.toLowerCase()];
    if (mapping) {
      return {
        language,
        region: mapping.region || 'Unknown',
        customs: mapping.customs || [],
        communicationStyle: mapping.communicationStyle || 'direct',
        preferences: mapping.preferences || {}
      };
    }

    return null;
  }

  private inferPreferencesFromStyle(style: string): any {
    const preferences: any = {};

    if (style.includes('formal')) {
      preferences.enhancedResponses = true;
    }

    if (style.includes('casual')) {
      preferences.enhancedResponses = false;
    }

    if (style.includes('detailed')) {
      preferences.enhancedResponses = true;
    }

    return preferences;
  }

  private analyzeLanguageUsage(usage: any): any {
    const adaptations: any = {};

    if (usage.codeSwithcing) {
      adaptations.enableVoiceAnalysis = true;
    }

    if (usage.culturalReferences) {
      adaptations.enhancedResponses = true;
    }

    return adaptations;
  }

  private getMostCommonValue(values: any[]): any {
    const frequency: Record<string, number> = {};

    for (const value of values) {
      const key = JSON.stringify(value);
      frequency[key] = (frequency[key] || 0) + 1;
    }

    let maxCount = 0;
    let mostCommon = null;

    for (const [key, count] of Object.entries(frequency)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = JSON.parse(key);
      }
    }

    return mostCommon;
  }

  private estimateTimeframe(pattern: any): number {
    // Estimate timeframe based on pattern frequency
    const avgTimeBetween = pattern.frequency > 1 ?
      (Date.now() - pattern.lastSeen.getTime()) / pattern.frequency :
      60 * 60 * 1000; // Default 1 hour

    return Math.max(avgTimeBetween * 0.8, 5 * 60 * 1000); // Minimum 5 minutes
  }

  private initializeCulturalAdaptations(): void {
    // Initialize with common cultural contexts
    this.culturalAdaptations.set('en', {
      language: 'en',
      region: 'Global',
      customs: ['individualism', 'direct communication'],
      communicationStyle: 'direct, efficient',
      preferences: {
        efficiency: 'high',
        directness: 'high'
      }
    });
  }

  private startContextMonitoring(): void {
    // Start periodic context analysis
    setInterval(() => {
      this.performPeriodicAnalysis();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private async performPeriodicAnalysis(): Promise<void> {
    // Analyze context patterns and make predictions
    const predictions = await this.predictContextChanges();

    // Auto-apply high-confidence predictions
    for (const prediction of predictions) {
      if (prediction.confidence > 0.9) {
        await this.updateContext(
          { [prediction.field]: prediction.predictedValue },
          'automatic_prediction'
        );
      }
    }
  }

  private async loadContextHistory(): Promise<void> {
    // Load context history from persistence
    // Implementation depends on storage solution
  }

  private async loadCulturalAdaptations(): Promise<void> {
    // Load cultural adaptations from persistence
    // Implementation depends on storage solution
  }

  private generateSnapshotId(): string {
    return `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getContextHistory(limit: number = 10): ContextSnapshot[] {
    return this.contextHistory.slice(-limit);
  }

  getContextPatterns(): any[] {
    return Array.from(this.contextPatterns.values());
  }

  getContextStats(): Record<string, any> {
    return {
      historySize: this.contextHistory.length,
      patternCount: this.contextPatterns.size,
      culturalAdaptations: this.culturalAdaptations.size,
      voiceContexts: this.voiceContexts.size,
      currentContext: this.currentContext
    };
  }
}