/**
 * Enhanced Empathy System for Super Sensitive AI
 * Ultra-refined emotional intelligence with micro-gesture detection
 * 
 * Features:
 * - Micro-expression analysis from text patterns
 * - Emotional contagion simulation  
 * - Adaptive empathy levels
 * - Cultural empathy contexts
 * - Trauma-informed responses
 * - Emotional regulation assistance
 * 
 * Created by: Cherwin Fernandez and Claude
 */

import { EmotionalState } from './emotional-state-sync';
import { superConsciousnessEngine, MicroExpression, IntentionAnalysis } from './super-consciousness';

// Enhanced Empathy Interfaces
export interface EmotionalMicroClue {
  type: 'linguistic' | 'syntactic' | 'temporal' | 'contextual';
  indicator: string;
  confidence: number;
  emotionalWeight: number;
  culturalContext?: string;
}

export interface EmpathyProfile {
  userId: string;
  baselineEmpathy: number;
  culturalBackground?: string;
  communicationStyle: 'direct' | 'indirect' | 'expressive' | 'reserved';
  emotionalRange: 'stable' | 'variable' | 'intense' | 'subdued';
  traumaSensitivity: number;     // 0-1: Higher = more gentle approach needed
  stressTolerance: number;       // 0-1: Lower = needs more support
  preferredSupportStyle: 'practical' | 'emotional' | 'analytical' | 'creative';
}

export interface EmpatheticResponse {
  primaryEmotion: string;
  empathyLevel: number;          // 0-1: How much empathy to show
  validationNeeded: boolean;     // Whether to validate feelings first
  supportType: 'emotional' | 'practical' | 'informational' | 'motivational';
  responseModifiers: string[];   // How to adjust the tone/approach
  culturalConsiderations: string[];
  traumaInformed: boolean;       // Whether to use trauma-informed approach
  approach: 'supportive' | 'analytical' | 'creative' | 'motivational' | 'exploratory' | 'gentle';
}

export interface EmotionalRegulationSuggestion {
  technique: string;
  description: string;
  appropriateness: number;       // 0-1: How appropriate for current state
  difficulty: 'simple' | 'moderate' | 'advanced';
  timeRequired: string;
  culturallySensitive: boolean;
}

class EnhancedEmpathyEngine {
  private empathyProfiles: Map<string, EmpathyProfile> = new Map();
  private culturalEmpathyRules: Map<string, any> = new Map();
  private emotionalPatterns: Map<string, EmotionalMicroClue[]> = new Map();
  
  constructor() {
    this.initializeEmpathySystem();
    this.loadCulturalEmpathyContexts();
  }

  private initializeEmpathySystem(): void {
    // Initialize baseline empathy understanding
    console.log('🤗 Enhanced Empathy Engine initializing...');
    
    // Set up emotional micro-clue patterns
    this.setupEmotionalMicroClues();
    
    console.log('💙 Enhanced Empathy System ready with cultural sensitivity');
  }

  private setupEmotionalMicroClues(): void {
    const microClues: EmotionalMicroClue[] = [
      // Linguistic indicators
      { type: 'linguistic', indicator: 'i guess', confidence: 0.7, emotionalWeight: 0.3, culturalContext: 'uncertainty_marker' },
      { type: 'linguistic', indicator: 'kinda', confidence: 0.6, emotionalWeight: 0.2, culturalContext: 'softening_language' },
      { type: 'linguistic', indicator: 'sorry but', confidence: 0.8, emotionalWeight: 0.4, culturalContext: 'apologetic_disagreement' },
      { type: 'linguistic', indicator: 'not sure if', confidence: 0.7, emotionalWeight: 0.3, culturalContext: 'hesitant_inquiry' },
      
      // Syntactic patterns
      { type: 'syntactic', indicator: 'ellipsis_usage', confidence: 0.6, emotionalWeight: 0.3, culturalContext: 'trailing_thought' },
      { type: 'syntactic', indicator: 'sentence_fragments', confidence: 0.5, emotionalWeight: 0.2, culturalContext: 'overwhelmed_state' },
      { type: 'syntactic', indicator: 'excessive_politeness', confidence: 0.8, emotionalWeight: 0.4, culturalContext: 'anxiety_marker' },
      
      // Temporal indicators
      { type: 'temporal', indicator: 'quick_response', confidence: 0.4, emotionalWeight: 0.1, culturalContext: 'urgency_or_excitement' },
      { type: 'temporal', indicator: 'delayed_response', confidence: 0.3, emotionalWeight: 0.2, culturalContext: 'reflection_or_hesitation' },
      
      // Contextual clues
      { type: 'contextual', indicator: 'topic_change', confidence: 0.6, emotionalWeight: 0.3, culturalContext: 'discomfort_avoidance' },
      { type: 'contextual', indicator: 'oversharing', confidence: 0.8, emotionalWeight: 0.5, culturalContext: 'emotional_overwhelm' }
    ];
    
    this.emotionalPatterns.set('general', microClues);
  }

  private loadCulturalEmpathyContexts(): void {
    // Different cultural approaches to empathy and emotional expression
    this.culturalEmpathyRules.set('western', {
      directnessPreference: 0.7,
      emotionalOpenness: 0.8,
      individualFocus: 0.9,
      problemSolvingOriented: 0.8
    });
    
    this.culturalEmpathyRules.set('eastern', {
      directnessPreference: 0.3,
      emotionalOpenness: 0.4,
      individualFocus: 0.3,
      harmonyOriented: 0.9
    });
    
    this.culturalEmpathyRules.set('universal', {
      directnessPreference: 0.5,
      emotionalOpenness: 0.6,
      individualFocus: 0.6,
      adaptiveApproach: 0.9
    });
  }

  /**
   * Analyze emotional micro-clues with enhanced sensitivity
   */
  public analyzeEmotionalMicroClues(text: string, userEmail: string): EmotionalMicroClue[] {
    const detectedClues: EmotionalMicroClue[] = [];
    const generalPatterns = this.emotionalPatterns.get('general') || [];
    
    // Linguistic analysis
    const lowerText = text.toLowerCase();
    
    // Check for uncertainty markers
    if (lowerText.includes('i guess') || lowerText.includes('maybe') || lowerText.includes('i think')) {
      detectedClues.push({
        type: 'linguistic',
        indicator: 'uncertainty_markers',
        confidence: 0.8,
        emotionalWeight: 0.4,
        culturalContext: 'lack_of_confidence'
      });
    }
    
    // Check for overwhelm indicators
    if (text.includes('...') || text.split('.').length > 5) {
      detectedClues.push({
        type: 'syntactic',
        indicator: 'fragmented_thoughts',
        confidence: 0.6,
        emotionalWeight: 0.3,
        culturalContext: 'cognitive_overload'
      });
    }
    
    // Check for emotional intensity
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 2) {
      detectedClues.push({
        type: 'syntactic',
        indicator: 'high_emotional_intensity',
        confidence: 0.7,
        emotionalWeight: 0.5,
        culturalContext: 'excitement_or_frustration'
      });
    }
    
    // Check for softening language (cultural politeness)
    if (lowerText.includes('sorry') || lowerText.includes('if possible') || lowerText.includes('if you don\'t mind')) {
      detectedClues.push({
        type: 'linguistic',
        indicator: 'excessive_politeness',
        confidence: 0.9,
        emotionalWeight: 0.4,
        culturalContext: 'anxiety_or_cultural_politeness'
      });
    }
    
    // Check for help-seeking patterns
    if (lowerText.includes('help') || lowerText.includes('stuck') || lowerText.includes('confused')) {
      detectedClues.push({
        type: 'contextual',
        indicator: 'explicit_help_seeking',
        confidence: 0.95,
        emotionalWeight: 0.7,
        culturalContext: 'vulnerability_expression'
      });
    }
    
    return detectedClues;
  }

  /**
   * Generate empathetic response strategy based on emotional analysis
   */
  public generateEmpatheticResponse(
    microClues: EmotionalMicroClue[],
    emotionalState: EmotionalState,
    intentions: IntentionAnalysis,
    userEmail: string
  ): EmpatheticResponse {
    const empathyProfile = this.getOrCreateEmpathyProfile(userEmail, microClues);
    
    // Determine primary emotion to address
    let primaryEmotion = 'neutral';
    if (emotionalState.fear > 0.4 || microClues.some(c => c.culturalContext?.includes('anxiety'))) {
      primaryEmotion = 'anxiety';
    } else if (emotionalState.sadness > 0.3) {
      primaryEmotion = 'sadness';
    } else if (microClues.some(c => c.indicator === 'uncertainty_markers')) {
      primaryEmotion = 'uncertainty';
    } else if (emotionalState.joy > 0.6) {
      primaryEmotion = 'joy';
    } else if (microClues.some(c => c.indicator === 'explicit_help_seeking')) {
      primaryEmotion = 'vulnerability';
    }
    
    // Determine empathy level needed
    let empathyLevel = 0.7; // Default balanced empathy
    if (primaryEmotion === 'anxiety' || primaryEmotion === 'vulnerability') {
      empathyLevel = 0.95; // High empathy needed
    } else if (primaryEmotion === 'sadness') {
      empathyLevel = 0.9;  // High empathy with validation
    } else if (primaryEmotion === 'uncertainty') {
      empathyLevel = 0.8;  // Supportive empathy with reassurance
    } else if (primaryEmotion === 'joy') {
      empathyLevel = 0.6;  // Moderate empathy, match energy
    }
    
    // Adjust for trauma sensitivity
    if (empathyProfile.traumaSensitivity > 0.7) {
      empathyLevel = Math.max(empathyLevel, 0.9);
    }
    
    // Determine if validation is needed first
    const validationNeeded = primaryEmotion === 'anxiety' || 
                            primaryEmotion === 'sadness' || 
                            primaryEmotion === 'vulnerability' ||
                            microClues.some(c => c.emotionalWeight > 0.5);
    
    // Determine support type
    let supportType: EmpatheticResponse['supportType'] = 'informational';
    if (primaryEmotion === 'anxiety' || primaryEmotion === 'vulnerability') {
      supportType = 'emotional';
    } else if (intentions.primaryIntent === 'problem_solving') {
      supportType = 'practical';
    } else if (emotionalState.creativity > 0.6) {
      supportType = 'motivational';
    }
    
    // Determine approach
    let approach: EmpatheticResponse['approach'] = 'supportive';
    if (primaryEmotion === 'anxiety' || primaryEmotion === 'vulnerability') {
      approach = 'gentle';
    } else if (intentions.primaryIntent === 'knowledge_acquisition' && emotionalState.anticipation > 0.7) {
      approach = 'exploratory';
    } else if (intentions.primaryIntent === 'problem_solving') {
      approach = 'analytical';
    } else if (emotionalState.creativity > 0.6) {
      approach = 'creative';
    } else if (emotionalState.energy > 0.7) {
      approach = 'motivational';
    }
    
    // Generate response modifiers
    const responseModifiers: string[] = [];
    if (empathyLevel > 0.8) {
      responseModifiers.push('use_gentle_tone');
      responseModifiers.push('acknowledge_feelings');
    }
    if (validationNeeded) {
      responseModifiers.push('validate_before_advise');
    }
    if (empathyProfile.communicationStyle === 'reserved') {
      responseModifiers.push('respect_boundaries');
    }
    if (empathyProfile.traumaSensitivity > 0.6) {
      responseModifiers.push('trauma_informed_language');
    }
    
    // Cultural considerations
    const culturalConsiderations: string[] = [];
    if (empathyProfile.culturalBackground === 'eastern' || 
        microClues.some(c => c.indicator === 'excessive_politeness')) {
      culturalConsiderations.push('respect_indirect_communication');
      culturalConsiderations.push('avoid_direct_confrontation');
    }
    
    return {
      primaryEmotion,
      empathyLevel,
      validationNeeded,
      supportType,
      responseModifiers,
      culturalConsiderations,
      traumaInformed: empathyProfile.traumaSensitivity > 0.6,
      approach
    };
  }

  /**
   * Generate emotional regulation suggestions
   */
  public generateEmotionalRegulation(
    emotionalState: EmotionalState,
    empathyProfile: EmpathyProfile
  ): EmotionalRegulationSuggestion[] {
    const suggestions: EmotionalRegulationSuggestion[] = [];
    
    // For anxiety (high fear)
    if (emotionalState.fear > 0.4) {
      suggestions.push({
        technique: 'grounding_technique',
        description: 'Try the 5-4-3-2-1 technique: Notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.',
        appropriateness: 0.9,
        difficulty: 'simple',
        timeRequired: '2-3 minutes',
        culturallySensitive: true
      });
      
      suggestions.push({
        technique: 'deep_breathing',
        description: 'Take slow, deep breaths: Inhale for 4 counts, hold for 4, exhale for 6. This activates your calm response.',
        appropriateness: 0.95,
        difficulty: 'simple',
        timeRequired: '1-2 minutes',
        culturallySensitive: true
      });
    }
    
    // For overwhelm (high cognitive load)
    if (emotionalState.energy < 0.3 || emotionalState.focus < 0.4) {
      suggestions.push({
        technique: 'break_tasks_down',
        description: 'When feeling overwhelmed, break what you\'re working on into smaller, manageable steps. Focus on just one step at a time.',
        appropriateness: 0.8,
        difficulty: 'simple',
        timeRequired: 'ongoing',
        culturallySensitive: true
      });
    }
    
    // For low confidence
    if (emotionalState.confidence < 0.4) {
      suggestions.push({
        technique: 'positive_self_talk',
        description: 'Remind yourself: "I\'m learning and growing. It\'s okay not to know everything right now."',
        appropriateness: 0.7,
        difficulty: 'simple',
        timeRequired: 'moment',
        culturallySensitive: empathyProfile.culturalBackground !== 'eastern' // Some cultures prefer different approaches
      });
    }
    
    return suggestions.sort((a, b) => b.appropriateness - a.appropriateness);
  }

  /**
   * Apply empathetic enhancement to response
   */
  public enhanceResponseWithEmpathy(
    originalResponse: string,
    empatheticResponse: EmpatheticResponse,
    emotionalState: EmotionalState
  ): string {
    let enhancedResponse = originalResponse;
    
    // Add validation if needed
    if (empatheticResponse.validationNeeded) {
      const validationPrefix = this.generateValidationPrefix(empatheticResponse.primaryEmotion, emotionalState);
      enhancedResponse = `${validationPrefix}\n\n${enhancedResponse}`;
    }
    
    // Apply response modifiers
    if (empatheticResponse.responseModifiers.includes('use_gentle_tone')) {
      enhancedResponse = this.applyGentleTone(enhancedResponse);
    }
    
    if (empatheticResponse.responseModifiers.includes('trauma_informed_language')) {
      enhancedResponse = this.applyTraumaInformedLanguage(enhancedResponse);
    }
    
    // Add supportive conclusion based on support type
    const supportiveConclusion = this.generateSupportiveConclusion(
      empatheticResponse.supportType,
      emotionalState,
      empatheticResponse.empathyLevel
    );
    
    if (supportiveConclusion) {
      enhancedResponse = `${enhancedResponse}\n\n${supportiveConclusion}`;
    }
    
    return enhancedResponse;
  }

  // Helper methods
  private getOrCreateEmpathyProfile(userEmail: string, microClues: EmotionalMicroClue[]): EmpathyProfile {
    if (!this.empathyProfiles.has(userEmail)) {
      // Create new profile based on initial analysis
      const profile: EmpathyProfile = {
        userId: userEmail,
        baselineEmpathy: 0.7,
        communicationStyle: this.inferCommunicationStyle(microClues),
        emotionalRange: 'variable',
        traumaSensitivity: this.inferTraumaSensitivity(microClues),
        stressTolerance: 0.5,
        preferredSupportStyle: 'emotional'
      };
      this.empathyProfiles.set(userEmail, profile);
    }
    
    return this.empathyProfiles.get(userEmail)!;
  }

  private inferCommunicationStyle(microClues: EmotionalMicroClue[]): EmpathyProfile['communicationStyle'] {
    if (microClues.some(c => c.indicator === 'excessive_politeness')) {
      return 'indirect';
    } else if (microClues.some(c => c.indicator === 'high_emotional_intensity')) {
      return 'expressive';
    } else if (microClues.length < 2) {
      return 'reserved';
    } else {
      return 'direct';
    }
  }

  private inferTraumaSensitivity(microClues: EmotionalMicroClue[]): number {
    let sensitivity = 0.3; // baseline
    
    if (microClues.some(c => c.indicator === 'excessive_politeness' && c.confidence > 0.8)) {
      sensitivity += 0.3; // May indicate hypervigilance
    }
    if (microClues.some(c => c.indicator === 'uncertainty_markers' && c.emotionalWeight > 0.4)) {
      sensitivity += 0.2; // May indicate self-doubt from past experiences
    }
    
    return Math.min(1, sensitivity);
  }

  private generateValidationPrefix(primaryEmotion: string, emotionalState: EmotionalState): string {
    switch (primaryEmotion) {
      case 'anxiety':
        return "I can sense this feels challenging, and that's completely understandable.";
      case 'sadness':
        return "It sounds like you're going through something difficult right now.";
      case 'uncertainty':
        return "It's natural to feel unsure when encountering something new.";
      case 'vulnerability':
        return "Thank you for reaching out - it takes courage to ask for help.";
      default:
        return "I hear what you're saying.";
    }
  }

  private applyGentleTone(response: string): string {
    return response
      .replace(/You need to/g, 'You might want to')
      .replace(/You should/g, 'You could')
      .replace(/You must/g, 'It would help to')
      .replace(/Obviously/g, 'One thing to consider is')
      .replace(/Simply/g, 'Gently');
  }

  private applyTraumaInformedLanguage(response: string): string {
    return response
      .replace(/failure/g, 'learning opportunity')
      .replace(/wrong/g, 'different approach needed')
      .replace(/mistake/g, 'step in the learning process')
      .replace(/You failed/g, 'That approach didn\'t work out');
  }

  private generateSupportiveConclusion(
    supportType: EmpatheticResponse['supportType'],
    emotionalState: EmotionalState,
    empathyLevel: number
  ): string {
    if (empathyLevel > 0.8) {
      switch (supportType) {
        case 'emotional':
          return "Remember, you're not alone in this. Take things one step at a time, and be gentle with yourself.";
        case 'practical':
          return "These steps should help, but please don't hesitate to reach out if you need more support or if something doesn't feel right.";
        case 'motivational':
          return "You've got this! Trust in your ability to learn and grow through this process.";
        default:
          return "I'm here to support you through this journey. Feel free to ask if you need anything clarified or want to explore this further.";
      }
    }
    return '';
  }
}

// Export singleton instance
export const enhancedEmpathyEngine = new EnhancedEmpathyEngine();