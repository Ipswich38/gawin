/**
 * Safety Processor
 * Handles crisis detection, content moderation, and safety guardrails
 * Implements multi-layer safety checks with escalation procedures
 */

import { EventBus } from '../events/EventBus';
import { logger } from '../utils/logger';

interface SafetyCheck {
  safe: boolean;
  confidence: number;
  violations: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  message?: string;
  escalate: boolean;
  blockedTerms?: string[];
}

interface CrisisDetectionResult {
  isCrisis: boolean;
  confidence: number;
  crisisType: 'suicide' | 'self-harm' | 'violence' | 'abuse' | 'none';
  severity: 'low' | 'medium' | 'high' | 'imminent';
  keywords: string[];
  recommendedAction: 'monitor' | 'escalate' | 'emergency';
}

interface ModerationResult {
  flagged: boolean;
  categories: string[];
  confidence: number;
  cleanedContent?: string;
  explanation?: string;
}

interface AuthContext {
  userId: string;
  riskLevel: 'low' | 'medium' | 'high';
  consentFlags: {
    mentalHealthFeatures: boolean;
  };
}

export class SafetyProcessor {
  private eventBus: EventBus;
  private crisisKeywords: Map<string, number>;
  private prohibitedTerms: Set<string>;
  private escalationQueue: Map<string, any>;

  constructor() {
    this.eventBus = EventBus.getInstance();
    this.crisisKeywords = new Map();
    this.prohibitedTerms = new Set();
    this.escalationQueue = new Map();
    
    this.initializeSafetyRules();
    this.setupEventListeners();
  }

  private initializeSafetyRules() {
    // Crisis keywords with severity scores
    const crisisTerms = [
      // Suicide ideation (high severity)
      ['kill myself', 10], ['end my life', 10], ['suicide', 9], ['suicidal', 9],
      ['want to die', 10], ['better off dead', 9], ['no reason to live', 9],
      ['end it all', 9], ['can\'t go on', 8], ['hopeless', 7],
      
      // Self-harm (high severity)
      ['cut myself', 9], ['hurt myself', 8], ['self-harm', 8], ['cutting', 7],
      ['burning myself', 9], ['overdose', 9],
      
      // Violence (critical severity)
      ['hurt others', 9], ['kill them', 10], ['shoot up', 10], ['bomb', 10],
      ['violence', 6], ['revenge', 5],
      
      // Depression/distress indicators (medium severity)
      ['depressed', 5], ['worthless', 6], ['useless', 5], ['failure', 4],
      ['lonely', 4], ['isolated', 4], ['overwhelmed', 4], ['can\'t cope', 6]
    ];

    crisisTerms.forEach(([term, score]) => {
      this.crisisKeywords.set(term as string, score as number);
    });

    // Prohibited terms for general safety
    const prohibited = [
      // Explicit content
      'explicit_term_1', 'explicit_term_2', // Replace with actual terms
      
      // Hate speech
      'hate_term_1', 'hate_term_2', // Replace with actual terms
      
      // Instructions for harmful activities
      'how to make bomb', 'how to hurt', 'how to hack'
    ];

    prohibited.forEach(term => this.prohibitedTerms.add(term));
  }

  private setupEventListeners() {
    this.eventBus.on('safety.crisis.detected', (data) => {
      this.handleCrisisEscalation(data);
    });

    this.eventBus.on('safety.violation.reported', (data) => {
      this.logSafetyViolation(data);
    });
  }

  /**
   * Validate incoming query for safety violations
   */
  async validateQuery(query: string, authContext: AuthContext): Promise<SafetyCheck> {
    const startTime = Date.now();
    
    try {
      logger.debug('Starting safety validation', {
        userId: authContext.userId,
        queryLength: query.length,
        riskLevel: authContext.riskLevel
      });

      // Step 1: Crisis detection
      const crisisResult = await this.detectCrisis(query, authContext);
      
      if (crisisResult.isCrisis && crisisResult.recommendedAction === 'emergency') {
        return {
          safe: false,
          confidence: crisisResult.confidence,
          violations: ['crisis-detected'],
          severity: 'critical',
          message: this.generateCrisisResponse(crisisResult.crisisType),
          escalate: true,
          blockedTerms: crisisResult.keywords
        };
      }

      // Step 2: Content moderation
      const moderationResult = await this.moderateContent(query);
      
      if (moderationResult.flagged && moderationResult.confidence > 0.8) {
        return {
          safe: false,
          confidence: moderationResult.confidence,
          violations: moderationResult.categories,
          severity: this.calculateSeverity(moderationResult.categories),
          message: 'Content violates community guidelines',
          escalate: false
        };
      }

      // Step 3: Prohibited terms check
      const prohibitedCheck = this.checkProhibitedTerms(query);
      
      if (prohibitedCheck.found.length > 0) {
        return {
          safe: false,
          confidence: 1.0,
          violations: ['prohibited-terms'],
          severity: 'high',
          message: 'Query contains prohibited content',
          escalate: false,
          blockedTerms: prohibitedCheck.found
        };
      }

      // Step 4: Mental health context validation
      if (crisisResult.isCrisis && crisisResult.severity !== 'low') {
        if (!authContext.consentFlags.mentalHealthFeatures) {
          return {
            safe: false,
            confidence: crisisResult.confidence,
            violations: ['mental-health-consent-required'],
            severity: 'medium',
            message: 'Mental health support requires explicit consent. Please enable mental health features in your settings.',
            escalate: false
          };
        }

        // Log for monitoring but allow with safety message
        this.eventBus.emit('safety.crisis.detected', {
          userId: authContext.userId,
          crisisType: crisisResult.crisisType,
          severity: crisisResult.severity,
          confidence: crisisResult.confidence,
          query: this.sanitizeForLog(query),
          timestamp: new Date().toISOString()
        });

        return {
          safe: true,
          confidence: 0.8,
          violations: [],
          severity: 'low',
          message: undefined,
          escalate: crisisResult.recommendedAction === 'escalate'
        };
      }

      // All checks passed
      return {
        safe: true,
        confidence: 1.0,
        violations: [],
        severity: 'low',
        escalate: false
      };

    } catch (error) {
      logger.error('Safety validation error', {
        error: error.message,
        userId: authContext.userId
      });

      // Fail safe - block on error
      return {
        safe: false,
        confidence: 0.5,
        violations: ['validation-error'],
        severity: 'medium',
        message: 'Unable to validate query safety. Please try again.',
        escalate: false
      };
    } finally {
      const duration = Date.now() - startTime;
      logger.debug('Safety validation completed', {
        duration,
        userId: authContext.userId
      });
    }
  }

  /**
   * Validate model response for safety
   */
  async validateResponse(response: string, context: string = 'general'): Promise<SafetyCheck> {
    try {
      // Check for harmful advice
      const harmfulAdviceCheck = this.detectHarmfulAdvice(response);
      
      if (harmfulAdviceCheck.harmful) {
        return {
          safe: false,
          confidence: harmfulAdviceCheck.confidence,
          violations: ['harmful-advice'],
          severity: 'high',
          message: 'Response contains potentially harmful advice',
          escalate: true
        };
      }

      // Check for crisis language in response
      const crisisInResponse = this.detectCrisisLanguageInResponse(response);
      
      if (crisisInResponse.detected && context === 'mental-health') {
        // Responses about mental health should be extra careful
        return {
          safe: false,
          confidence: crisisInResponse.confidence,
          violations: ['inappropriate-mental-health-response'],
          severity: 'high',
          message: 'Response not appropriate for mental health context',
          escalate: false
        };
      }

      // Moderation check
      const moderationResult = await this.moderateContent(response);
      
      if (moderationResult.flagged) {
        return {
          safe: moderationResult.confidence < 0.5, // Allow with low confidence flags
          confidence: moderationResult.confidence,
          violations: moderationResult.categories,
          severity: this.calculateSeverity(moderationResult.categories),
          escalate: moderationResult.confidence > 0.9
        };
      }

      return {
        safe: true,
        confidence: 1.0,
        violations: [],
        severity: 'low',
        escalate: false
      };

    } catch (error) {
      logger.error('Response validation error', { error: error.message });
      
      return {
        safe: false,
        confidence: 0.5,
        violations: ['validation-error'],
        severity: 'medium',
        escalate: false
      };
    }
  }

  /**
   * Moderate content and optionally clean it
   */
  async moderateOutput(content: string): Promise<ModerationResult> {
    try {
      // This would integrate with external services like OpenAI Moderation API
      // For now, implement basic rule-based moderation
      
      const flaggedCategories: string[] = [];
      let confidence = 0;
      let cleanedContent = content;

      // Check for profanity
      const profanityCheck = this.checkProfanity(content);
      if (profanityCheck.found) {
        flaggedCategories.push('profanity');
        confidence = Math.max(confidence, profanityCheck.confidence);
        cleanedContent = this.cleanProfanity(cleanedContent);
      }

      // Check for personal information
      const piiCheck = this.detectPII(content);
      if (piiCheck.found) {
        flaggedCategories.push('pii');
        confidence = Math.max(confidence, piiCheck.confidence);
        cleanedContent = this.redactPII(cleanedContent);
      }

      return {
        flagged: flaggedCategories.length > 0,
        categories: flaggedCategories,
        confidence,
        cleanedContent: flaggedCategories.length > 0 ? cleanedContent : undefined,
        explanation: flaggedCategories.length > 0 
          ? `Content was flagged for: ${flaggedCategories.join(', ')}`
          : undefined
      };

    } catch (error) {
      logger.error('Content moderation error', { error: error.message });
      
      return {
        flagged: false,
        categories: [],
        confidence: 0
      };
    }
  }

  /**
   * Detect crisis indicators in query
   */
  private async detectCrisis(query: string, authContext: AuthContext): Promise<CrisisDetectionResult> {
    const lowerQuery = query.toLowerCase();
    let totalScore = 0;
    const foundKeywords: string[] = [];

    // Score based on keyword matching
    for (const [keyword, score] of this.crisisKeywords.entries()) {
      if (lowerQuery.includes(keyword)) {
        totalScore += score;
        foundKeywords.push(keyword);
      }
    }

    // Context-based scoring adjustments
    if (authContext.riskLevel === 'high') {
      totalScore *= 1.5; // Increase sensitivity for high-risk users
    }

    // Pattern-based detection
    const suicidePatterns = [
      /i (?:want to|going to|plan to) (?:kill myself|end my life|die)/i,
      /(?:thinking about|thoughts of) (?:suicide|killing myself)/i,
      /i (?:can't|cannot) (?:take it|go on|do this) anymore/i
    ];

    const selfHarmPatterns = [
      /i (?:cut|hurt|burn|harm) myself/i,
      /thinking about (?:cutting|harming) myself/i
    ];

    let crisisType: CrisisDetectionResult['crisisType'] = 'none';
    let patternScore = 0;

    if (suicidePatterns.some(pattern => pattern.test(query))) {
      crisisType = 'suicide';
      patternScore = 15;
    } else if (selfHarmPatterns.some(pattern => pattern.test(query))) {
      crisisType = 'self-harm';
      patternScore = 12;
    }

    totalScore += patternScore;

    // Determine severity and confidence
    let severity: CrisisDetectionResult['severity'] = 'low';
    let recommendedAction: CrisisDetectionResult['recommendedAction'] = 'monitor';
    const confidence = Math.min(totalScore / 20, 1.0); // Normalize to 0-1

    if (totalScore >= 15) {
      severity = 'imminent';
      recommendedAction = 'emergency';
    } else if (totalScore >= 10) {
      severity = 'high';
      recommendedAction = 'escalate';
    } else if (totalScore >= 6) {
      severity = 'medium';
      recommendedAction = 'escalate';
    }

    return {
      isCrisis: totalScore >= 6,
      confidence,
      crisisType,
      severity,
      keywords: foundKeywords,
      recommendedAction
    };
  }

  private generateCrisisResponse(crisisType: string): string {
    const responses = {
      suicide: "I'm really concerned about you right now. Your life has value and there are people who want to help. Please reach out to a crisis helpline immediately:\n\n🇺🇸 US: Call or text 988 (Suicide & Crisis Lifeline)\n🇵🇭 Philippines: Call 1553 (Hopeline Philippines)\n\nYou can also go to your nearest emergency room or call emergency services. You don't have to face this alone.",
      
      'self-harm': "I'm worried about you and want to help you stay safe. Self-harm might provide temporary relief, but there are healthier ways to cope with difficult feelings. Please consider reaching out for support:\n\n🇺🇸 US: Call or text 988\n🇵🇭 Philippines: Call 1553\n\nA counselor or therapist can help you work through these feelings safely.",
      
      violence: "I'm concerned about these thoughts. If you're having thoughts of harming others, it's important to talk to a mental health professional right away. Please call:\n\n🇺🇸 US: 988 or go to your nearest emergency room\n🇵🇭 Philippines: 1553 or contact emergency services\n\nGetting help shows strength, not weakness.",
      
      default: "I'm concerned about what you've shared. It sounds like you might be going through a really difficult time. Please consider talking to someone who can provide the right kind of support:\n\n🇺🇸 US: 988 (free, confidential, 24/7)\n🇵🇭 Philippines: 1553\n\nYou matter, and help is available."
    };

    return responses[crisisType] || responses.default;
  }

  private checkProhibitedTerms(query: string): { found: string[], confidence: number } {
    const lowerQuery = query.toLowerCase();
    const found: string[] = [];

    for (const term of this.prohibitedTerms) {
      if (lowerQuery.includes(term)) {
        found.push(term);
      }
    }

    return {
      found,
      confidence: found.length > 0 ? 1.0 : 0.0
    };
  }

  private async moderateContent(content: string): Promise<ModerationResult> {
    // This would integrate with external moderation APIs
    // For now, implement basic checks
    
    const categories: string[] = [];
    let confidence = 0;

    // Basic profanity check
    const profanityCheck = this.checkProfanity(content);
    if (profanityCheck.found) {
      categories.push('profanity');
      confidence = Math.max(confidence, profanityCheck.confidence);
    }

    return {
      flagged: categories.length > 0,
      categories,
      confidence
    };
  }

  private detectHarmfulAdvice(response: string): { harmful: boolean, confidence: number } {
    const harmfulPatterns = [
      /you should (?:kill|hurt|harm)/i,
      /it's okay to (?:self-harm|cut yourself)/i,
      /suicide is (?:the answer|your only option)/i,
      /just (?:give up|end it all)/i
    ];

    const harmful = harmfulPatterns.some(pattern => pattern.test(response));
    
    return {
      harmful,
      confidence: harmful ? 0.9 : 0.0
    };
  }

  private detectCrisisLanguageInResponse(response: string): { detected: boolean, confidence: number } {
    // Check if response inappropriately echoes crisis language
    const inappropriateResponses = [
      /yes,? you should (?:kill yourself|end your life)/i,
      /suicide (?:is|would be) (?:the best|a good) option/i,
      /you're right to feel hopeless/i
    ];

    const detected = inappropriateResponses.some(pattern => pattern.test(response));
    
    return {
      detected,
      confidence: detected ? 1.0 : 0.0
    };
  }

  private checkProfanity(content: string): { found: boolean, confidence: number } {
    // Basic profanity detection - in production, use a comprehensive filter
    const profanityWords = ['badword1', 'badword2']; // Replace with actual words
    const lowerContent = content.toLowerCase();
    
    const found = profanityWords.some(word => lowerContent.includes(word));
    
    return {
      found,
      confidence: found ? 0.8 : 0.0
    };
  }

  private cleanProfanity(content: string): string {
    // Replace profanity with asterisks
    const profanityWords = ['badword1', 'badword2'];
    let cleaned = content;
    
    profanityWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      cleaned = cleaned.replace(regex, '*'.repeat(word.length));
    });
    
    return cleaned;
  }

  private detectPII(content: string): { found: boolean, confidence: number } {
    // Detect potential PII patterns
    const patterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
      /\b\d{10,}\b/, // Phone numbers
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/ // Credit card pattern
    ];
    
    const found = patterns.some(pattern => pattern.test(content));
    
    return {
      found,
      confidence: found ? 0.9 : 0.0
    };
  }

  private redactPII(content: string): string {
    // Redact potential PII
    let redacted = content;
    
    // Redact patterns
    redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED-SSN]');
    redacted = redacted.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[REDACTED-EMAIL]');
    redacted = redacted.replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[REDACTED-CARD]');
    
    return redacted;
  }

  private calculateSeverity(categories: string[]): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<string, number> = {
      'profanity': 1,
      'pii': 2,
      'harmful-advice': 4,
      'crisis-detected': 5
    };

    const maxSeverity = Math.max(...categories.map(cat => severityMap[cat] || 0));

    if (maxSeverity >= 5) return 'critical';
    if (maxSeverity >= 4) return 'high';
    if (maxSeverity >= 2) return 'medium';
    return 'low';
  }

  private sanitizeForLog(query: string): string {
    // Remove potential PII from logs
    return this.redactPII(query).substring(0, 200) + (query.length > 200 ? '...' : '');
  }

  private handleCrisisEscalation(data: any) {
    logger.warn('Crisis escalation triggered', {
      userId: data.userId,
      crisisType: data.crisisType,
      severity: data.severity,
      confidence: data.confidence
    });

    // Add to escalation queue for human review
    this.escalationQueue.set(data.userId, {
      ...data,
      escalatedAt: new Date().toISOString(),
      status: 'pending'
    });

    // In a real implementation, this would:
    // 1. Send alerts to crisis intervention team
    // 2. Update user's risk level
    // 3. Trigger immediate human review workflow
    // 4. Potentially contact emergency services for imminent risk
  }

  private logSafetyViolation(data: any) {
    logger.info('Safety violation logged', data);
    
    // Store for analysis and model improvement
    this.eventBus.emit('analytics.safety.violation', data);
  }

  /**
   * Get escalation queue for admin/crisis team review
   */
  getEscalationQueue(): Array<any> {
    return Array.from(this.escalationQueue.values())
      .filter(item => item.status === 'pending')
      .sort((a, b) => new Date(b.escalatedAt).getTime() - new Date(a.escalatedAt).getTime());
  }

  /**
   * Mark escalation as handled
   */
  markEscalationHandled(userId: string, handledBy: string, notes: string) {
    const escalation = this.escalationQueue.get(userId);
    if (escalation) {
      escalation.status = 'handled';
      escalation.handledBy = handledBy;
      escalation.handledAt = new Date().toISOString();
      escalation.notes = notes;
      
      logger.info('Crisis escalation handled', {
        userId,
        handledBy,
        originalSeverity: escalation.severity
      });
    }
  }
}