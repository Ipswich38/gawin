/**
 * Input Validation Service
 * Provides comprehensive validation for user inputs and AI responses
 */
export class ValidationService {
  private static instance: ValidationService;

  private constructor() {}

  public static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  /**
   * Validate user text input
   */
  public validateTextInput(input: string): { isValid: boolean; errors: string[]; sanitized: string } {
    const errors: string[] = [];
    let sanitized = input;

    // Basic checks
    if (!input || typeof input !== 'string') {
      errors.push('Input must be a non-empty string');
      return { isValid: false, errors, sanitized: '' };
    }

    // Length validation
    if (input.length > 10000) {
      errors.push('Input exceeds maximum length of 10,000 characters');
    }

    // Check for potential injection attempts
    const injectionPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(input)) {
        errors.push('Input contains potentially malicious content');
        break;
      }
    }

    // Sanitize while preserving meaningful content
    sanitized = input
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .trim();

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }

  /**
   * Validate file upload
   */
  public validateFileUpload(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!file) {
      errors.push('No file provided');
      return { isValid: false, errors };
    }

    // File size validation (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push('File size exceeds 10MB limit');
    }

    // File type validation
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/json'
    ];

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    // Filename validation
    const filename = file.name;
    if (!/^[a-zA-Z0-9._-]+\.[a-zA-Z0-9]+$/.test(filename)) {
      errors.push('Invalid filename format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate AI response for potential hallucinations
   */
  public validateAIResponse(response: string, context?: string): { 
    isValid: boolean; 
    confidence: number; 
    warnings: string[];
    riskLevel: 'low' | 'medium' | 'high';
  } {
    const warnings: string[] = [];
    let confidence = 1.0;
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    if (!response || typeof response !== 'string') {
      return {
        isValid: false,
        confidence: 0,
        warnings: ['Invalid response format'],
        riskLevel: 'high'
      };
    }

    // Check for common hallucination indicators
    const hallucinationPatterns = [
      /I cannot actually (browse|access|see|view|visit)/i,
      /As an AI, I (don't|cannot|can't) (actually|really)/i,
      /I don't have the ability to/i,
      /I cannot provide real-time/i,
      /I should note that I can't actually/i
    ];

    for (const pattern of hallucinationPatterns) {
      if (pattern.test(response)) {
        warnings.push('Response may contain AI limitations acknowledgment');
        confidence -= 0.1;
      }
    }

    // Check for suspicious certainty claims
    const certaintyPatterns = [
      /I am (100%|completely|absolutely) (certain|sure|confident)/i,
      /This is (definitely|certainly|absolutely)/i,
      /Without a doubt/i,
      /I guarantee/i
    ];

    for (const pattern of certaintyPatterns) {
      if (pattern.test(response)) {
        warnings.push('Response contains suspicious certainty claims');
        confidence -= 0.2;
        riskLevel = 'medium';
      }
    }

    // Check for factual claims without qualification
    const factualPatterns = [
      /The (latest|current|most recent)/i,
      /As of (today|now|this moment)/i,
      /Currently/i,
      /At this time/i
    ];

    let hasTemporalClaims = false;
    for (const pattern of factualPatterns) {
      if (pattern.test(response)) {
        hasTemporalClaims = true;
        break;
      }
    }

    if (hasTemporalClaims && !response.includes('as of my last update')) {
      warnings.push('Response may contain outdated temporal claims');
      confidence -= 0.15;
      riskLevel = 'medium';
    }

    // Check for specific URLs or specific recent events
    if (/https?:\/\/[^\s]+/.test(response) && !context?.includes('generate') && !context?.includes('create')) {
      warnings.push('Response contains specific URLs that may be fabricated');
      confidence -= 0.25;
      riskLevel = 'high';
    }

    // Determine final risk level
    if (confidence < 0.6) {
      riskLevel = 'high';
    } else if (confidence < 0.8) {
      riskLevel = 'medium';
    }

    return {
      isValid: confidence > 0.3,
      confidence: Math.max(0, confidence),
      warnings,
      riskLevel
    };
  }

  /**
   * Validate API response structure
   */
  public validateAPIResponse(response: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!response) {
      errors.push('Response is null or undefined');
      return { isValid: false, errors };
    }

    // Check for required fields
    if (typeof response.content !== 'string') {
      errors.push('Response missing content field');
    }

    if (response.content && response.content.length > 50000) {
      errors.push('Response content exceeds maximum length');
    }

    // Validate response time if present
    if (response.responseTime !== undefined) {
      if (typeof response.responseTime !== 'number' || response.responseTime < 0) {
        errors.push('Invalid response time value');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate model selection and parameters
   */
  public validateModelRequest(modelId: string, parameters?: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!modelId || typeof modelId !== 'string') {
      errors.push('Model ID is required and must be a string');
    }

    // Validate model ID format
    if (modelId && !/^[a-zA-Z0-9-._]+$/.test(modelId)) {
      errors.push('Invalid model ID format');
    }

    // Validate parameters if provided
    if (parameters) {
      if (parameters.temperature !== undefined) {
        if (typeof parameters.temperature !== 'number' || parameters.temperature < 0 || parameters.temperature > 2) {
          errors.push('Temperature must be a number between 0 and 2');
        }
      }

      if (parameters.max_tokens !== undefined) {
        if (typeof parameters.max_tokens !== 'number' || parameters.max_tokens < 1 || parameters.max_tokens > 8192) {
          errors.push('Max tokens must be a number between 1 and 8192');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate content warning based on validation results
   */
  public generateContentWarning(validationResult: any): string | null {
    if (!validationResult.warnings || validationResult.warnings.length === 0) {
      return null;
    }

    const riskLevel = validationResult.riskLevel || 'low';
    const emoji = riskLevel === 'high' ? '🚨' : riskLevel === 'medium' ? '⚠️' : 'ℹ️';
    
    return `${emoji} Content Validation Warning: ${validationResult.warnings[0]}`;
  }
}

// Export singleton instance
export const validationService = ValidationService.getInstance();