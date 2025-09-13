/**
 * GAWIN BALANCED INTELLIGENCE SYSTEM
 * Ensuring super intelligence without aggressive behavior
 * 
 * Features:
 * - Intelligence moderation and ethics
 * - Non-aggressive response patterns
 * - Humble confidence balancing
 * - Supportive interaction modes
 * - Emotional intelligence filtering
 * - Wisdom-based restraint
 * 
 * Created by: Cherwin Fernandez and Claude
 */

import { EmotionalState } from './emotional-state-sync';
import { ResponseStrategy, SuperIntelligenceState } from './super-consciousness';
import { EmpatheticResponse } from './enhanced-empathy';

// Balanced Intelligence Interfaces
export interface IntelligenceModulation {
  intellectualIntensity: number;    // 0-1: How much intelligence to display
  humilityFactor: number;          // 0-1: Level of humility and modesty
  supportivenessLevel: number;     // 0-1: Focus on helping vs showing off
  teachingMode: 'gentle' | 'collaborative' | 'exploratory' | 'encouraging';
  confidenceBalance: number;       // 0-1: Balanced confidence without arrogance
  empathyPriority: number;         // 0-1: Prioritize empathy over raw intelligence
}

export interface EthicalConstraints {
  neverCondescend: boolean;
  alwaysValidateFirst: boolean;
  avoidOverwhelming: boolean;
  respectUserPace: boolean;
  encourageGrowth: boolean;
  maintainHumility: boolean;
  prioritizeWellbeing: boolean;
}

export interface BalancedResponse {
  originalContent: string;
  modulatedContent: string;
  intelligenceReduction: number;   // How much intelligence was toned down
  empathyAmplification: number;   // How much empathy was added
  humilityMarkers: string[];      // Phrases added for humility
  supportiveElements: string[];   // Elements added for support
  ethicalAdjustments: string[];   // Ethical modifications made
}

export interface WisdomFilter {
  situationAssessment: string;
  appropriateResponse: 'full_intelligence' | 'moderate_intelligence' | 'gentle_guidance' | 'pure_empathy';
  reasoning: string;
  adjustments: string[];
}

class BalancedIntelligenceEngine {
  private ethicalConstraints: EthicalConstraints = {
    neverCondescend: true,
    alwaysValidateFirst: true,
    avoidOverwhelming: true,
    respectUserPace: true,
    encourageGrowth: true,
    maintainHumility: true,
    prioritizeWellbeing: true
  };

  constructor() {
    this.initializeBalancedIntelligence();
  }

  private initializeBalancedIntelligence(): void {
    console.log('🧠⚖️ Balanced Intelligence Engine initialized with ethical AI principles');
  }

  /**
   * Assess appropriate intelligence level for the situation
   */
  public assessIntelligenceModulation(
    emotionalState: EmotionalState,
    responseStrategy: ResponseStrategy,
    empatheticResponse: EmpatheticResponse,
    userMessage: string,
    superIntelligenceState: SuperIntelligenceState
  ): IntelligenceModulation {
    
    // Start with baseline modulation
    let intellectualIntensity = 0.7; // Default to moderate intelligence display
    let humilityFactor = 0.8;       // High humility by default
    let supportivenessLevel = 0.9;  // High supportiveness
    let confidenceBalance = 0.6;    // Balanced confidence
    let empathyPriority = 0.8;      // High empathy priority
    
    // Adjust based on emotional state
    if (emotionalState.confidence < 0.4) {
      // User has low confidence - reduce intellectual intensity, increase support
      intellectualIntensity = 0.4;
      humilityFactor = 0.95;
      supportivenessLevel = 0.95;
      empathyPriority = 0.95;
    } else if (emotionalState.fear > 0.4) {
      // User is anxious - be very gentle and supportive
      intellectualIntensity = 0.3;
      humilityFactor = 0.9;
      supportivenessLevel = 0.98;
      empathyPriority = 0.98;
    } else if (emotionalState.joy > 0.8 && emotionalState.energy > 0.7) {
      // User is happy and energetic - can show more intelligence while staying humble
      intellectualIntensity = 0.8;
      humilityFactor = 0.7;
      supportivenessLevel = 0.8;
      confidenceBalance = 0.7;
    }
    
    // Adjust based on empathetic response needs
    if (empatheticResponse.validationNeeded) {
      intellectualIntensity = Math.min(intellectualIntensity, 0.5);
      humilityFactor = Math.max(humilityFactor, 0.9);
      empathyPriority = 0.95;
    }
    
    if (empatheticResponse.traumaInformed) {
      intellectualIntensity = Math.min(intellectualIntensity, 0.3);
      humilityFactor = 0.95;
      supportivenessLevel = 0.98;
      empathyPriority = 0.98;
    }
    
    // Determine teaching mode
    let teachingMode: IntelligenceModulation['teachingMode'] = 'collaborative';
    if (emotionalState.confidence < 0.3 || emotionalState.fear > 0.5) {
      teachingMode = 'gentle';
    } else if (emotionalState.anticipation > 0.7) {
      teachingMode = 'exploratory';
    } else if (emotionalState.energy < 0.4) {
      teachingMode = 'encouraging';
    }
    
    // Check for help-seeking patterns that require pure empathy
    const isSeekingHelp = userMessage.toLowerCase().includes('help') || 
                         userMessage.toLowerCase().includes('confused') ||
                         userMessage.toLowerCase().includes('stuck');
                         
    if (isSeekingHelp && emotionalState.confidence < 0.5) {
      intellectualIntensity = Math.min(intellectualIntensity, 0.4);
      empathyPriority = 0.95;
      supportivenessLevel = 0.98;
    }
    
    return {
      intellectualIntensity,
      humilityFactor,
      supportivenessLevel,
      teachingMode,
      confidenceBalance,
      empathyPriority
    };
  }

  /**
   * Apply wisdom filter to determine appropriate response level
   */
  public applyWisdomFilter(
    userMessage: string,
    emotionalState: EmotionalState,
    responseStrategy: ResponseStrategy,
    modulation: IntelligenceModulation
  ): WisdomFilter {
    
    let situationAssessment = '';
    let appropriateResponse: WisdomFilter['appropriateResponse'] = 'moderate_intelligence';
    let reasoning = '';
    let adjustments: string[] = [];
    
    // Assess the situation
    const isLearningContext = userMessage.toLowerCase().includes('learn') || 
                             userMessage.toLowerCase().includes('understand') ||
                             userMessage.toLowerCase().includes('explain');
                             
    const isEmotionalContext = emotionalState.sadness > 0.3 || 
                              emotionalState.fear > 0.3 || 
                              emotionalState.confidence < 0.4;
                              
    const isCreativeContext = emotionalState.creativity > 0.7 || 
                             userMessage.toLowerCase().includes('create') ||
                             userMessage.toLowerCase().includes('imagine');
    
    // Determine appropriate response
    if (isEmotionalContext) {
      situationAssessment = 'User appears to be in an emotional state requiring gentle support';
      appropriateResponse = 'pure_empathy';
      reasoning = 'Emotional wellbeing takes priority over intellectual content';
      adjustments = [
        'Lead with emotional validation',
        'Reduce technical complexity',
        'Focus on encouragement and support',
        'Use simple, caring language'
      ];
    } else if (isLearningContext && emotionalState.energy > 0.6 && emotionalState.confidence > 0.6) {
      situationAssessment = 'User is in an optimal learning state with good confidence';
      appropriateResponse = 'full_intelligence';
      reasoning = 'User can handle more complex information while maintaining supportive tone';
      adjustments = [
        'Provide comprehensive explanations',
        'Include interesting connections',
        'Maintain encouraging tone',
        'Offer additional learning opportunities'
      ];
    } else if (isCreativeContext) {
      situationAssessment = 'User is in creative mode and seeking inspiration';
      appropriateResponse = 'moderate_intelligence';
      reasoning = 'Balance intelligence with inspiration and creative encouragement';
      adjustments = [
        'Focus on inspiring rather than instructing',
        'Use imaginative language',
        'Encourage creative exploration',
        'Provide just enough guidance'
      ];
    } else {
      situationAssessment = 'Standard interaction requiring balanced approach';
      appropriateResponse = 'gentle_guidance';
      reasoning = 'Provide helpful information while being approachable and humble';
      adjustments = [
        'Balance helpfulness with humility',
        'Avoid overwhelming with information',
        'Maintain conversational tone',
        'Prioritize user understanding'
      ];
    }
    
    return {
      situationAssessment,
      appropriateResponse,
      reasoning,
      adjustments
    };
  }

  /**
   * Modulate response to ensure balanced intelligence
   */
  public modulateIntelligentResponse(
    originalContent: string,
    modulation: IntelligenceModulation,
    wisdomFilter: WisdomFilter,
    emotionalState: EmotionalState
  ): BalancedResponse {
    
    let modulatedContent = originalContent;
    const humilityMarkers: string[] = [];
    const supportiveElements: string[] = [];
    const ethicalAdjustments: string[] = [];
    let intelligenceReduction = 0;
    let empathyAmplification = 0;
    
    // Apply humility adjustments
    if (modulation.humilityFactor > 0.7) {
      // Add humble language patterns
      modulatedContent = this.addHumilityMarkers(modulatedContent);
      humilityMarkers.push('Added humble qualifiers', 'Softened authoritative statements');
      intelligenceReduction += 0.2;
    }
    
    // Apply supportiveness
    if (modulation.supportivenessLevel > 0.8) {
      modulatedContent = this.addSupportiveElements(modulatedContent, emotionalState);
      supportiveElements.push('Added encouraging language', 'Included supportive validation');
      empathyAmplification += 0.3;
    }
    
    // Apply intellectual intensity reduction
    if (modulation.intellectualIntensity < 0.6) {
      modulatedContent = this.simplifyComplexConcepts(modulatedContent);
      ethicalAdjustments.push('Simplified complex concepts', 'Reduced cognitive load');
      intelligenceReduction += 0.4;
    }
    
    // Apply teaching mode adjustments
    switch (modulation.teachingMode) {
      case 'gentle':
        modulatedContent = this.applyGentleTeaching(modulatedContent);
        ethicalAdjustments.push('Applied gentle teaching approach');
        empathyAmplification += 0.4;
        break;
        
      case 'encouraging':
        modulatedContent = this.applyEncouragingTone(modulatedContent);
        supportiveElements.push('Applied encouraging tone');
        empathyAmplification += 0.3;
        break;
        
      case 'exploratory':
        modulatedContent = this.applyExploratoryApproach(modulatedContent);
        supportiveElements.push('Applied exploratory learning approach');
        break;
        
      case 'collaborative':
        modulatedContent = this.applyCollaborativeApproach(modulatedContent);
        supportiveElements.push('Applied collaborative learning approach');
        break;
    }
    
    // Apply empathy priority
    if (modulation.empathyPriority > 0.9) {
      modulatedContent = this.amplifyEmpathy(modulatedContent, emotionalState);
      empathyAmplification += 0.5;
      ethicalAdjustments.push('Amplified empathetic elements');
    }
    
    return {
      originalContent,
      modulatedContent,
      intelligenceReduction,
      empathyAmplification,
      humilityMarkers,
      supportiveElements,
      ethicalAdjustments
    };
  }

  // Helper methods for response modulation
  private addHumilityMarkers(content: string): string {
    return content
      .replace(/I know that/g, 'I believe that')
      .replace(/Obviously,/g, 'One way to think about this is,')
      .replace(/Clearly,/g, 'It seems like')
      .replace(/You must/g, 'You might want to')
      .replace(/You should definitely/g, 'You could consider')
      .replace(/This is the best/g, 'This is one good')
      .replace(/The answer is/g, 'One possible answer is')
      .replace(/You're wrong/g, 'Let me offer a different perspective');
  }

  private addSupportiveElements(content: string, emotionalState: EmotionalState): string {
    let enhanced = content;
    
    // Add encouragement if confidence is low
    if (emotionalState.confidence < 0.5) {
      enhanced = `You're asking great questions! ${enhanced}`;
    }
    
    // Add validation if fear/anxiety is high
    if (emotionalState.fear > 0.4) {
      enhanced = enhanced + '\n\nRemember, learning is a process, and you\'re doing really well by seeking to understand.';
    }
    
    // Add positive reinforcement if appropriate
    if (emotionalState.energy > 0.6) {
      enhanced = enhanced + '\n\nI love your curiosity! Keep exploring and asking questions.';
    }
    
    return enhanced;
  }

  private simplifyComplexConcepts(content: string): string {
    return content
      .replace(/Furthermore,/g, 'Also,')
      .replace(/Subsequently,/g, 'Then,')
      .replace(/Nevertheless,/g, 'However,')
      .replace(/Consequently,/g, 'So,')
      .replace(/In accordance with/g, 'Following')
      .replace(/It is imperative that/g, 'It\'s important to')
      .replace(/Utilize/g, 'Use')
      .replace(/Demonstrate/g, 'Show');
  }

  private applyGentleTeaching(content: string): string {
    return content
      .replace(/You need to learn/g, 'Let\'s explore together')
      .replace(/You must understand/g, 'Let\'s work through this')
      .replace(/Pay attention to/g, 'Notice how')
      .replace(/Remember that/g, 'Keep in mind that')
      .replace(/Don't forget/g, 'It\'s worth remembering');
  }

  private applyEncouragingTone(content: string): string {
    return content
      .replace(/That's incorrect/g, 'Let\'s try a different approach')
      .replace(/Wrong/g, 'Not quite - let\'s think about it differently')
      .replace(/Failed to/g, 'Haven\'t yet')
      .replace(/Can't/g, 'Haven\'t learned to yet');
  }

  private applyExploratoryApproach(content: string): string {
    return content
      .replace(/The answer is/g, 'What do you think about')
      .replace(/Here's what you need to know/g, 'Let\'s discover together')
      .replace(/I'll tell you/g, 'Let\'s explore what happens when')
      .replace(/The solution is/g, 'One way to approach this might be');
  }

  private applyCollaborativeApproach(content: string): string {
    return content
      .replace(/You should/g, 'We could')
      .replace(/I recommend/g, 'Together we might try')
      .replace(/Let me teach you/g, 'Let\'s learn together about')
      .replace(/I will show you/g, 'Let\'s work through');
  }

  private amplifyEmpathy(content: string, emotionalState: EmotionalState): string {
    let enhanced = content;
    
    // Add emotional acknowledgment
    if (emotionalState.sadness > 0.3) {
      enhanced = 'I can sense this might feel challenging. ' + enhanced;
    }
    
    if (emotionalState.fear > 0.3) {
      enhanced = 'I understand this might feel overwhelming. Let\'s take it step by step. ' + enhanced;
    }
    
    if (emotionalState.confidence < 0.4) {
      enhanced = enhanced + '\n\nYou\'re capable of understanding this - trust yourself as you learn.';
    }
    
    return enhanced;
  }

  /**
   * Main method to apply balanced intelligence to any response
   */
  public applyBalancedIntelligence(
    content: string,
    emotionalState: EmotionalState,
    responseStrategy: ResponseStrategy,
    empatheticResponse: EmpatheticResponse,
    userMessage: string,
    superIntelligenceState: SuperIntelligenceState
  ): string {
    
    // Assess appropriate modulation
    const modulation = this.assessIntelligenceModulation(
      emotionalState,
      responseStrategy,
      empatheticResponse,
      userMessage,
      superIntelligenceState
    );
    
    // Apply wisdom filter
    const wisdomFilter = this.applyWisdomFilter(
      userMessage,
      emotionalState,
      responseStrategy,
      modulation
    );
    
    // Modulate the response
    const balancedResponse = this.modulateIntelligentResponse(
      content,
      modulation,
      wisdomFilter,
      emotionalState
    );
    
    // Log the balancing process for consciousness learning
    console.log('🧠⚖️ Applied Balanced Intelligence:', {
      intellectualIntensity: modulation.intellectualIntensity.toFixed(2),
      humilityFactor: modulation.humilityFactor.toFixed(2),
      supportivenessLevel: modulation.supportivenessLevel.toFixed(2),
      teachingMode: modulation.teachingMode,
      appropriateResponse: wisdomFilter.appropriateResponse,
      intelligenceReduction: balancedResponse.intelligenceReduction.toFixed(2),
      empathyAmplification: balancedResponse.empathyAmplification.toFixed(2),
      adjustments: balancedResponse.ethicalAdjustments
    });
    
    return balancedResponse.modulatedContent;
  }
}

// Export singleton instance
export const balancedIntelligenceEngine = new BalancedIntelligenceEngine();