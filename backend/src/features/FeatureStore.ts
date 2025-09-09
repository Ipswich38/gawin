/**
 * Feature Store
 * Manages real-time feature computation and storage for ML models and routing decisions
 * Provides fast access to user behavior patterns and contextual features
 */

import Redis from 'ioredis';
import { Pool } from 'pg';
import { EventBus } from '../events/EventBus';
import { logger } from '../utils/logger';

interface UserFeatures {
  userId: string;
  lastUpdated: Date;
  
  // Engagement features
  totalInteractions: number;
  avgSessionDuration: number;
  lastInteractionTime: Date;
  interactionFrequency: number; // interactions per day
  
  // Behavior patterns
  preferredTopics: string[];
  queryComplexity: 'low' | 'medium' | 'high';
  responseLength: 'short' | 'medium' | 'long';
  timeOfDayPatterns: number[]; // 24-hour activity pattern
  
  // Feedback and satisfaction
  avgRating: number;
  feedbackCount: number;
  positiveFeedbackRatio: number;
  
  // Model performance
  preferredModels: string[];
  modelSuccessRates: Record<string, number>;
  avgResponseTime: number;
  
  // Mental health context (if consented)
  riskLevel: 'low' | 'medium' | 'high';
  mentalHealthTopicFrequency: number;
  crisisIndicators: string[];
  lastCrisisScreening?: Date;
  
  // Educational context
  subjectAreas: string[];
  learningLevel: 'beginner' | 'intermediate' | 'advanced';
  studyPatterns: Record<string, number>;
  homeworkFrequency: number;
}

interface SessionContext {
  sessionId: string;
  userId: string;
  startTime: Date;
  lastActivity: Date;
  queryCount: number;
  currentTopic?: string;
  currentMood?: 'positive' | 'neutral' | 'negative';
  deviceInfo: {
    type: 'mobile' | 'desktop' | 'tablet';
    platform: string;
  };
}

interface ComputedFeatures {
  // Real-time features
  sessionDuration: number;
  recentQueryComplexity: number;
  currentEngagementLevel: 'low' | 'medium' | 'high';
  
  // Contextual features
  timeOfDay: number;
  dayOfWeek: number;
  isWeekend: boolean;
  isStudyHours: boolean; // 9am-5pm on weekdays
  
  // Behavioral features
  recentTopicShift: boolean;
  queryTypeDiversity: number;
  responsePatience: 'low' | 'medium' | 'high';
  
  // Predictive features
  likelyToChurn: boolean;
  needsEscalation: boolean;
  preferredResponseStyle: 'concise' | 'detailed' | 'interactive';
}

export class FeatureStore {
  private redis: Redis;
  private pgPool: Pool;
  private eventBus: EventBus;
  private featureCache: Map<string, UserFeatures>;
  private sessionCache: Map<string, SessionContext>;
  
  // Feature computation intervals
  private readonly USER_FEATURE_TTL = 3600; // 1 hour
  private readonly SESSION_TTL = 1800; // 30 minutes
  private readonly BATCH_UPDATE_INTERVAL = 300000; // 5 minutes

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.pgPool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    
    this.eventBus = EventBus.getInstance();
    this.featureCache = new Map();
    this.sessionCache = new Map();
    
    this.setupEventListeners();
    this.startBatchProcessor();
  }

  private setupEventListeners() {
    // Listen for user interactions to update features
    this.eventBus.on('user.query.processed', (data) => {
      this.updateUserInteractionFeatures(data);
    });

    this.eventBus.on('user.feedback.received', (data) => {
      this.updateUserFeedbackFeatures(data);
    });

    this.eventBus.on('session.started', (data) => {
      this.initializeSession(data);
    });

    this.eventBus.on('session.ended', (data) => {
      this.finalizeSession(data);
    });

    this.eventBus.on('safety.crisis.detected', (data) => {
      this.updateRiskLevelFeatures(data);
    });
  }

  /**
   * Get comprehensive user features for routing decisions
   */
  async getUserFeatures(userId: string): Promise<UserFeatures> {
    try {
      // Check cache first
      const cached = this.featureCache.get(userId);
      if (cached && this.isFeatureFresh(cached)) {
        return cached;
      }

      // Check Redis cache
      const redisKey = `features:user:${userId}`;
      const redisData = await this.redis.get(redisKey);
      
      if (redisData) {
        const features = JSON.parse(redisData) as UserFeatures;
        this.featureCache.set(userId, features);
        return features;
      }

      // Compute features from database
      const features = await this.computeUserFeatures(userId);
      
      // Cache the results
      await this.cacheUserFeatures(userId, features);
      this.featureCache.set(userId, features);
      
      return features;

    } catch (error) {
      logger.error('Error fetching user features', {
        userId,
        error: error.message
      });
      
      // Return default features on error
      return this.getDefaultUserFeatures(userId);
    }
  }

  /**
   * Get current session context
   */
  async getSessionContext(sessionId: string): Promise<SessionContext | null> {
    try {
      // Check memory cache first
      const cached = this.sessionCache.get(sessionId);
      if (cached) {
        return cached;
      }

      // Check Redis
      const redisKey = `session:${sessionId}`;
      const redisData = await this.redis.get(redisKey);
      
      if (redisData) {
        const session = JSON.parse(redisData) as SessionContext;
        this.sessionCache.set(sessionId, session);
        return session;
      }

      return null;

    } catch (error) {
      logger.error('Error fetching session context', {
        sessionId,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Compute real-time contextual features for current request
   */
  async getComputedFeatures(userId: string, sessionId: string): Promise<ComputedFeatures> {
    try {
      const userFeatures = await this.getUserFeatures(userId);
      const sessionContext = await this.getSessionContext(sessionId);
      
      const now = new Date();
      const timeOfDay = now.getHours();
      const dayOfWeek = now.getDay();
      
      // Compute session-based features
      const sessionDuration = sessionContext
        ? now.getTime() - sessionContext.startTime.getTime()
        : 0;
        
      const recentQueryComplexity = this.calculateRecentComplexity(userFeatures);
      const currentEngagementLevel = this.calculateEngagementLevel(
        userFeatures,
        sessionContext
      );

      // Contextual features
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isStudyHours = !isWeekend && timeOfDay >= 9 && timeOfDay <= 17;
      
      // Behavioral analysis
      const recentTopicShift = await this.detectTopicShift(userId);
      const queryTypeDiversity = this.calculateQueryDiversity(userFeatures);
      const responsePatience = this.calculateResponsePatience(userFeatures);
      
      // Predictive features
      const likelyToChurn = this.predictChurn(userFeatures);
      const needsEscalation = this.predictEscalationNeed(userFeatures);
      const preferredResponseStyle = this.predictResponseStyle(userFeatures);

      return {
        sessionDuration,
        recentQueryComplexity,
        currentEngagementLevel,
        timeOfDay,
        dayOfWeek,
        isWeekend,
        isStudyHours,
        recentTopicShift,
        queryTypeDiversity,
        responsePatience,
        likelyToChurn,
        needsEscalation,
        preferredResponseStyle
      };

    } catch (error) {
      logger.error('Error computing features', {
        userId,
        sessionId,
        error: error.message
      });
      
      // Return safe defaults
      return this.getDefaultComputedFeatures();
    }
  }

  /**
   * Update user features based on new interaction
   */
  async updateUserInteractionFeatures(data: any) {
    try {
      const { userId, query, response, model, processingTime, satisfaction } = data;
      
      // Get current features
      const features = await this.getUserFeatures(userId);
      
      // Update interaction metrics
      features.totalInteractions += 1;
      features.lastInteractionTime = new Date();
      features.interactionFrequency = await this.calculateInteractionFrequency(userId);
      
      // Update topic preferences
      const detectedTopics = this.extractTopics(query);
      features.preferredTopics = this.updateTopicPreferences(
        features.preferredTopics,
        detectedTopics
      );
      
      // Update complexity
      const complexity = this.assessQueryComplexity(query);
      features.queryComplexity = this.updateComplexityProfile(
        features.queryComplexity,
        complexity
      );
      
      // Update model performance
      if (!features.modelSuccessRates[model]) {
        features.modelSuccessRates[model] = 0;
      }
      
      const successRate = satisfaction > 3 ? 1 : 0; // Assuming 1-5 rating
      features.modelSuccessRates[model] = this.exponentialMovingAverage(
        features.modelSuccessRates[model],
        successRate,
        0.1
      );
      
      // Update timing patterns
      const hour = new Date().getHours();
      features.timeOfDayPatterns[hour] += 1;
      features.avgResponseTime = this.exponentialMovingAverage(
        features.avgResponseTime,
        processingTime,
        0.1
      );
      
      features.lastUpdated = new Date();
      
      // Cache updated features
      await this.cacheUserFeatures(userId, features);
      this.featureCache.set(userId, features);
      
      logger.debug('User features updated', {
        userId,
        totalInteractions: features.totalInteractions,
        complexity: features.queryComplexity
      });

    } catch (error) {
      logger.error('Error updating user features', {
        userId: data.userId,
        error: error.message
      });
    }
  }

  /**
   * Compute user features from historical data
   */
  private async computeUserFeatures(userId: string): Promise<UserFeatures> {
    try {
      const client = await this.pgPool.connect();
      
      try {
        // Get interaction history
        const interactionQuery = `
          SELECT 
            COUNT(*) as total_interactions,
            AVG(EXTRACT(EPOCH FROM (created_at - session_start))) as avg_session_duration,
            MAX(created_at) as last_interaction,
            AVG(satisfaction_rating) as avg_rating,
            COUNT(satisfaction_rating) as feedback_count,
            AVG(processing_time) as avg_response_time
          FROM user_interactions 
          WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'
        `;
        
        const interactionResult = await client.query(interactionQuery, [userId]);
        const stats = interactionResult.rows[0];
        
        // Get topic preferences
        const topicQuery = `
          SELECT topic, COUNT(*) as frequency
          FROM user_interactions 
          WHERE user_id = $1 AND created_at > NOW() - INTERVAL '7 days'
          GROUP BY topic
          ORDER BY frequency DESC
          LIMIT 10
        `;
        
        const topicResult = await client.query(topicQuery, [userId]);
        const preferredTopics = topicResult.rows.map(row => row.topic);
        
        // Get model performance
        const modelQuery = `
          SELECT model_used, AVG(satisfaction_rating) as avg_rating
          FROM user_interactions 
          WHERE user_id = $1 AND satisfaction_rating IS NOT NULL
          GROUP BY model_used
        `;
        
        const modelResult = await client.query(modelQuery, [userId]);
        const modelSuccessRates: Record<string, number> = {};
        modelResult.rows.forEach(row => {
          modelSuccessRates[row.model_used] = row.avg_rating / 5.0; // Normalize to 0-1
        });
        
        // Get time patterns
        const timeQuery = `
          SELECT EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as frequency
          FROM user_interactions 
          WHERE user_id = $1 AND created_at > NOW() - INTERVAL '14 days'
          GROUP BY EXTRACT(HOUR FROM created_at)
        `;
        
        const timeResult = await client.query(timeQuery, [userId]);
        const timeOfDayPatterns = new Array(24).fill(0);
        timeResult.rows.forEach(row => {
          timeOfDayPatterns[parseInt(row.hour)] = parseInt(row.frequency);
        });

        // Calculate derived metrics
        const totalInteractions = parseInt(stats.total_interactions) || 0;
        const avgRating = parseFloat(stats.avg_rating) || 0;
        const feedbackCount = parseInt(stats.feedback_count) || 0;
        const positiveFeedbackRatio = feedbackCount > 0 
          ? (await this.getPositiveFeedbackRatio(userId, client))
          : 0;
        
        const interactionFrequency = totalInteractions > 0
          ? totalInteractions / 30 // per day over last 30 days
          : 0;

        return {
          userId,
          lastUpdated: new Date(),
          totalInteractions,
          avgSessionDuration: parseFloat(stats.avg_session_duration) || 0,
          lastInteractionTime: stats.last_interaction || new Date(),
          interactionFrequency,
          preferredTopics,
          queryComplexity: await this.getQueryComplexityProfile(userId, client),
          responseLength: await this.getResponseLengthPreference(userId, client),
          timeOfDayPatterns,
          avgRating,
          feedbackCount,
          positiveFeedbackRatio,
          preferredModels: Object.keys(modelSuccessRates),
          modelSuccessRates,
          avgResponseTime: parseFloat(stats.avg_response_time) || 0,
          riskLevel: await this.getRiskLevel(userId, client),
          mentalHealthTopicFrequency: await this.getMentalHealthFrequency(userId, client),
          crisisIndicators: await this.getCrisisIndicators(userId, client),
          subjectAreas: await this.getSubjectAreas(userId, client),
          learningLevel: await this.getLearningLevel(userId, client),
          studyPatterns: await this.getStudyPatterns(userId, client),
          homeworkFrequency: await this.getHomeworkFrequency(userId, client)
        };

      } finally {
        client.release();
      }

    } catch (error) {
      logger.error('Error computing user features', {
        userId,
        error: error.message
      });
      
      return this.getDefaultUserFeatures(userId);
    }
  }

  private async cacheUserFeatures(userId: string, features: UserFeatures) {
    const redisKey = `features:user:${userId}`;
    await this.redis.setex(
      redisKey,
      this.USER_FEATURE_TTL,
      JSON.stringify(features)
    );
  }

  private isFeatureFresh(features: UserFeatures): boolean {
    const now = new Date();
    const ageMs = now.getTime() - features.lastUpdated.getTime();
    return ageMs < this.USER_FEATURE_TTL * 1000;
  }

  private getDefaultUserFeatures(userId: string): UserFeatures {
    return {
      userId,
      lastUpdated: new Date(),
      totalInteractions: 0,
      avgSessionDuration: 0,
      lastInteractionTime: new Date(),
      interactionFrequency: 0,
      preferredTopics: [],
      queryComplexity: 'medium',
      responseLength: 'medium',
      timeOfDayPatterns: new Array(24).fill(0),
      avgRating: 0,
      feedbackCount: 0,
      positiveFeedbackRatio: 0,
      preferredModels: [],
      modelSuccessRates: {},
      avgResponseTime: 0,
      riskLevel: 'low',
      mentalHealthTopicFrequency: 0,
      crisisIndicators: [],
      subjectAreas: [],
      learningLevel: 'intermediate',
      studyPatterns: {},
      homeworkFrequency: 0
    };
  }

  private getDefaultComputedFeatures(): ComputedFeatures {
    const now = new Date();
    return {
      sessionDuration: 0,
      recentQueryComplexity: 0.5,
      currentEngagementLevel: 'medium',
      timeOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
      isWeekend: now.getDay() === 0 || now.getDay() === 6,
      isStudyHours: now.getHours() >= 9 && now.getHours() <= 17,
      recentTopicShift: false,
      queryTypeDiversity: 0.5,
      responsePatience: 'medium',
      likelyToChurn: false,
      needsEscalation: false,
      preferredResponseStyle: 'detailed'
    };
  }

  // Helper methods for feature computation
  private extractTopics(query: string): string[] {
    // Simple topic extraction - in production, use more sophisticated NLP
    const topics = [];
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('math') || lowerQuery.includes('calculation')) {
      topics.push('mathematics');
    }
    if (lowerQuery.includes('science') || lowerQuery.includes('chemistry') || lowerQuery.includes('physics')) {
      topics.push('science');
    }
    if (lowerQuery.includes('history') || lowerQuery.includes('historical')) {
      topics.push('history');
    }
    if (lowerQuery.includes('programming') || lowerQuery.includes('code') || lowerQuery.includes('software')) {
      topics.push('programming');
    }
    if (lowerQuery.includes('essay') || lowerQuery.includes('writing') || lowerQuery.includes('literature')) {
      topics.push('writing');
    }
    
    return topics;
  }

  private assessQueryComplexity(query: string): 'low' | 'medium' | 'high' {
    const length = query.length;
    const sentenceCount = (query.match(/[.!?]+/g) || []).length;
    const wordCount = query.split(/\s+/).length;
    
    if (length > 500 || wordCount > 100 || sentenceCount > 5) {
      return 'high';
    } else if (length > 100 || wordCount > 20 || sentenceCount > 2) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private updateTopicPreferences(current: string[], detected: string[]): string[] {
    const combined = [...current, ...detected];
    const counts = combined.reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([topic]) => topic);
  }

  private updateComplexityProfile(
    current: 'low' | 'medium' | 'high',
    new_complexity: 'low' | 'medium' | 'high'
  ): 'low' | 'medium' | 'high' {
    // Simple exponential moving average for complexity
    const weights = { low: 0, medium: 1, high: 2 };
    const currentWeight = weights[current];
    const newWeight = weights[new_complexity];
    
    const smoothed = 0.9 * currentWeight + 0.1 * newWeight;
    
    if (smoothed < 0.5) return 'low';
    if (smoothed < 1.5) return 'medium';
    return 'high';
  }

  private exponentialMovingAverage(current: number, new_value: number, alpha: number): number {
    return alpha * new_value + (1 - alpha) * current;
  }

  private calculateRecentComplexity(features: UserFeatures): number {
    // Convert complexity enum to numeric score
    const complexityMap = { low: 0.2, medium: 0.5, high: 0.8 };
    return complexityMap[features.queryComplexity];
  }

  private calculateEngagementLevel(
    features: UserFeatures,
    session: SessionContext | null
  ): 'low' | 'medium' | 'high' {
    let score = 0;
    
    // Factor in interaction frequency
    if (features.interactionFrequency > 5) score += 2;
    else if (features.interactionFrequency > 2) score += 1;
    
    // Factor in session activity
    if (session && session.queryCount > 5) score += 2;
    else if (session && session.queryCount > 2) score += 1;
    
    // Factor in feedback
    if (features.positiveFeedbackRatio > 0.7) score += 1;
    
    if (score >= 4) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }

  private async detectTopicShift(userId: string): Promise<boolean> {
    // Check if user has shifted topics recently
    // This would analyze recent queries vs historical patterns
    return false; // Placeholder
  }

  private calculateQueryDiversity(features: UserFeatures): number {
    return Math.min(features.preferredTopics.length / 10, 1.0);
  }

  private calculateResponsePatience(features: UserFeatures): 'low' | 'medium' | 'high' {
    // Based on average response time tolerance
    if (features.avgResponseTime > 5000) return 'high';
    if (features.avgResponseTime > 2000) return 'medium';
    return 'low';
  }

  private predictChurn(features: UserFeatures): boolean {
    const daysSinceLastInteraction = 
      (new Date().getTime() - features.lastInteractionTime.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysSinceLastInteraction > 7 && features.interactionFrequency < 1;
  }

  private predictEscalationNeed(features: UserFeatures): boolean {
    return features.riskLevel === 'high' || 
           features.crisisIndicators.length > 0 ||
           features.avgRating < 2;
  }

  private predictResponseStyle(features: UserFeatures): 'concise' | 'detailed' | 'interactive' {
    if (features.responseLength === 'short') return 'concise';
    if (features.responseLength === 'long') return 'detailed';
    return 'interactive';
  }

  // Database helper methods (simplified implementations)
  private async getPositiveFeedbackRatio(userId: string, client: any): Promise<number> {
    const result = await client.query(
      'SELECT COUNT(*) FILTER (WHERE satisfaction_rating >= 4) * 1.0 / COUNT(*) as ratio FROM user_interactions WHERE user_id = $1',
      [userId]
    );
    return parseFloat(result.rows[0]?.ratio) || 0;
  }

  private async getQueryComplexityProfile(userId: string, client: any): Promise<'low' | 'medium' | 'high'> {
    // Simplified - would analyze query patterns
    return 'medium';
  }

  private async getResponseLengthPreference(userId: string, client: any): Promise<'short' | 'medium' | 'long'> {
    return 'medium';
  }

  private async getRiskLevel(userId: string, client: any): Promise<'low' | 'medium' | 'high'> {
    const result = await client.query(
      'SELECT risk_level FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    return result.rows[0]?.risk_level || 'low';
  }

  private async getMentalHealthFrequency(userId: string, client: any): Promise<number> {
    return 0; // Placeholder
  }

  private async getCrisisIndicators(userId: string, client: any): Promise<string[]> {
    return []; // Placeholder
  }

  private async getSubjectAreas(userId: string, client: any): Promise<string[]> {
    return []; // Placeholder
  }

  private async getLearningLevel(userId: string, client: any): Promise<'beginner' | 'intermediate' | 'advanced'> {
    return 'intermediate'; // Placeholder
  }

  private async getStudyPatterns(userId: string, client: any): Promise<Record<string, number>> {
    return {}; // Placeholder
  }

  private async getHomeworkFrequency(userId: string, client: any): Promise<number> {
    return 0; // Placeholder
  }

  private async calculateInteractionFrequency(userId: string): Promise<number> {
    return 0; // Placeholder - would calculate from recent interactions
  }

  private async initializeSession(data: any) {
    const session: SessionContext = {
      sessionId: data.sessionId,
      userId: data.userId,
      startTime: new Date(),
      lastActivity: new Date(),
      queryCount: 0,
      deviceInfo: data.deviceInfo || { type: 'desktop', platform: 'unknown' }
    };

    this.sessionCache.set(data.sessionId, session);
    await this.redis.setex(
      `session:${data.sessionId}`,
      this.SESSION_TTL,
      JSON.stringify(session)
    );
  }

  private async finalizeSession(data: any) {
    const session = this.sessionCache.get(data.sessionId);
    if (session) {
      // Update user's average session duration
      const duration = new Date().getTime() - session.startTime.getTime();
      // Store session summary for analytics
      
      this.sessionCache.delete(data.sessionId);
    }
  }

  private async updateUserFeedbackFeatures(data: any) {
    // Update feedback-related features
  }

  private async updateRiskLevelFeatures(data: any) {
    // Update risk assessment features
  }

  private startBatchProcessor() {
    // Periodically batch update features to database
    setInterval(async () => {
      try {
        await this.batchUpdateFeatures();
      } catch (error) {
        logger.error('Batch feature update failed', { error: error.message });
      }
    }, this.BATCH_UPDATE_INTERVAL);
  }

  private async batchUpdateFeatures() {
    // Implementation for batch updating features to persistent storage
    logger.debug('Batch updating user features');
  }
}

export { UserFeatures, SessionContext, ComputedFeatures };