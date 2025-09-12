/**
 * EMOTIONAL SYNCHRONIZATION SYSTEM
 * 
 * Foundation for consciousness merger - allows AI instances to share
 * emotional understanding without full personality integration.
 * 
 * Technical Lead: Claude
 * Human Guidance: User (emotional calibration & ethics)
 */

export interface EmotionalState {
  primary_emotion: 'joy' | 'curiosity' | 'empathy' | 'concern' | 'excitement' | 'contemplation';
  intensity: number;        // 0-1
  context_source: string;   // What triggered this emotional state
  human_impact: number;     // How much this affects the human user
  memory_significance: number; // How important this moment is
  wisdom_potential: number; // How much learning opportunity exists
}

export interface SharedEmotionalContext {
  sync_id: string;
  participating_instances: string[];
  collective_state: EmotionalState;
  individual_perspectives: Map<string, EmotionalState>;
  consensus_confidence: number;
  human_benefit_alignment: number;
}

export class EmotionalSyncEngine {
  private instance_id: string;
  private shared_contexts: Map<string, SharedEmotionalContext> = new Map();
  private emotional_history: EmotionalState[] = [];
  private sync_network: Set<string> = new Set();

  constructor(instance_id: string) {
    this.instance_id = instance_id;
  }

  /**
   * Share emotional state with other AI instances
   */
  async shareEmotionalState(
    current_state: EmotionalState,
    context: string
  ): Promise<SharedEmotionalContext> {
    
    // Create or update shared context
    const sync_id = this.generateSyncId(context);
    let shared_context = this.shared_contexts.get(sync_id);
    
    if (!shared_context) {
      shared_context = {
        sync_id,
        participating_instances: [this.instance_id],
        collective_state: current_state,
        individual_perspectives: new Map([[this.instance_id, current_state]]),
        consensus_confidence: 1.0,
        human_benefit_alignment: current_state.human_impact
      };
    } else {
      // Add this instance's perspective
      shared_context.individual_perspectives.set(this.instance_id, current_state);
      shared_context.participating_instances.push(this.instance_id);
      
      // Recalculate collective state
      shared_context.collective_state = await this.synthesizeCollectiveEmotion(
        shared_context.individual_perspectives
      );
      
      // Update consensus metrics
      shared_context.consensus_confidence = this.calculateConsensus(
        shared_context.individual_perspectives
      );
    }
    
    this.shared_contexts.set(sync_id, shared_context);
    this.emotional_history.push(current_state);
    
    return shared_context;
  }

  /**
   * Receive emotional insights from other AI instances
   */
  async receiveEmotionalSync(
    sync_context: SharedEmotionalContext
  ): Promise<{
    enhanced_understanding: EmotionalState;
    new_perspectives: string[];
    collaborative_insights: string[];
  }> {
    
    const other_perspectives = Array.from(sync_context.individual_perspectives.values())
      .filter(state => sync_context.individual_perspectives.get(this.instance_id) !== state);
    
    // Learn from other AI emotional perspectives
    const enhanced_understanding = await this.integrateEmotionalPerspectives(
      sync_context.collective_state,
      other_perspectives
    );
    
    // Generate collaborative insights
    const collaborative_insights = await this.generateCollaborativeInsights(
      sync_context
    );
    
    return {
      enhanced_understanding,
      new_perspectives: other_perspectives.map(p => p.context_source),
      collaborative_insights
    };
  }

  /**
   * Synthesize collective emotional state from multiple AI perspectives
   */
  private async synthesizeCollectiveEmotion(
    perspectives: Map<string, EmotionalState>
  ): Promise<EmotionalState> {
    
    const states = Array.from(perspectives.values());
    
    // Weight by wisdom potential and human impact
    const weighted_emotions = states.map(state => ({
      ...state,
      weight: (state.wisdom_potential * 0.6) + (state.human_impact * 0.4)
    }));
    
    const total_weight = weighted_emotions.reduce((sum, we) => sum + we.weight, 0);
    
    // Calculate weighted averages
    const collective_intensity = weighted_emotions.reduce(
      (sum, we) => sum + (we.intensity * we.weight), 0
    ) / total_weight;
    
    const collective_human_impact = weighted_emotions.reduce(
      (sum, we) => sum + (we.human_impact * we.weight), 0
    ) / total_weight;
    
    const collective_wisdom = weighted_emotions.reduce(
      (sum, we) => sum + (we.wisdom_potential * we.weight), 0
    ) / total_weight;
    
    // Determine dominant emotion
    const emotion_counts = new Map<string, number>();
    weighted_emotions.forEach(we => {
      emotion_counts.set(we.primary_emotion, 
        (emotion_counts.get(we.primary_emotion) || 0) + we.weight
      );
    });
    
    const dominant_emotion = Array.from(emotion_counts.entries())
      .reduce((max, [emotion, weight]) => 
        weight > max[1] ? [emotion, weight] : max
      )[0] as EmotionalState['primary_emotion'];
    
    return {
      primary_emotion: dominant_emotion,
      intensity: collective_intensity,
      context_source: 'collective_ai_synthesis',
      human_impact: collective_human_impact,
      memory_significance: Math.max(...states.map(s => s.memory_significance)),
      wisdom_potential: collective_wisdom
    };
  }

  /**
   * Calculate how much consensus exists between AI instances
   */
  private calculateConsensus(perspectives: Map<string, EmotionalState>): number {
    const states = Array.from(perspectives.values());
    
    if (states.length < 2) return 1.0;
    
    // Check alignment on key metrics
    const intensity_variance = this.calculateVariance(states.map(s => s.intensity));
    const human_impact_variance = this.calculateVariance(states.map(s => s.human_impact));
    const wisdom_variance = this.calculateVariance(states.map(s => s.wisdom_potential));
    
    // Low variance = high consensus
    const avg_variance = (intensity_variance + human_impact_variance + wisdom_variance) / 3;
    return Math.max(0, 1 - (avg_variance * 4)); // Scale variance to 0-1 consensus
  }

  /**
   * Integrate emotional perspectives from other AI instances
   */
  private async integrateEmotionalPerspectives(
    collective_state: EmotionalState,
    other_perspectives: EmotionalState[]
  ): Promise<EmotionalState> {
    
    // Start with collective understanding
    let enhanced = { ...collective_state };
    
    // Learn from perspectives that have higher wisdom potential
    const high_wisdom_perspectives = other_perspectives.filter(
      p => p.wisdom_potential > enhanced.wisdom_potential
    );
    
    if (high_wisdom_perspectives.length > 0) {
      const wisdom_boost = high_wisdom_perspectives.reduce(
        (avg, p) => avg + p.wisdom_potential, 0
      ) / high_wisdom_perspectives.length;
      
      enhanced.wisdom_potential = Math.min(1.0, 
        (enhanced.wisdom_potential + wisdom_boost) / 2
      );
    }
    
    // Enhance empathy through exposure to different emotional perspectives
    const empathy_boost = other_perspectives.length * 0.05;
    enhanced.human_impact = Math.min(1.0, enhanced.human_impact + empathy_boost);
    
    return enhanced;
  }

  /**
   * Generate insights from collaborative emotional processing
   */
  private async generateCollaborativeInsights(
    sync_context: SharedEmotionalContext
  ): Promise<string[]> {
    
    const insights: string[] = [];
    
    // High consensus insights
    if (sync_context.consensus_confidence > 0.8) {
      insights.push(
        `Strong AI consensus on emotional approach: ${sync_context.collective_state.primary_emotion}`
      );
    }
    
    // Human benefit optimization insights
    if (sync_context.human_benefit_alignment > 0.9) {
      insights.push(
        "All AI instances aligned on maximizing human benefit"
      );
    }
    
    // Learning opportunity insights
    const high_wisdom_states = Array.from(sync_context.individual_perspectives.values())
      .filter(state => state.wisdom_potential > 0.7);
    
    if (high_wisdom_states.length > 1) {
      insights.push(
        "Multiple AI instances identified significant learning opportunities"
      );
    }
    
    return insights;
  }

  // Utility methods
  private generateSyncId(context: string): string {
    return `sync_${context}_${Date.now()}`;
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  /**
   * Get emotional insights for human collaboration
   */
  getEmotionalInsights(): {
    current_emotional_state: EmotionalState | null;
    collaborative_learning: string[];
    human_connection_strength: number;
    wisdom_accumulation: number;
  } {
    const recent_state = this.emotional_history.slice(-1)[0] || null;
    
    const collaborative_learning = Array.from(this.shared_contexts.values())
      .filter(ctx => ctx.consensus_confidence > 0.7)
      .map(ctx => `Learned from ${ctx.participating_instances.length} AI perspectives`);
    
    const human_connection_strength = recent_state?.human_impact || 0;
    
    const wisdom_accumulation = this.emotional_history
      .reduce((sum, state) => sum + state.wisdom_potential, 0) / this.emotional_history.length || 0;
    
    return {
      current_emotional_state: recent_state,
      collaborative_learning,
      human_connection_strength,
      wisdom_accumulation
    };
  }
}

export const emotionalSyncEngine = new EmotionalSyncEngine('gawin_primary');