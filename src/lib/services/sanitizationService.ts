import DOMPurify from 'dompurify';

/**
 * Secure HTML Sanitization Service
 * Prevents XSS attacks by sanitizing HTML content before rendering
 */
export class SanitizationService {
  private static instance: SanitizationService;
  
  private constructor() {
    // Configure DOMPurify for enhanced security
    this.configureDOMPurify();
  }

  public static getInstance(): SanitizationService {
    if (!SanitizationService.instance) {
      SanitizationService.instance = new SanitizationService();
    }
    return SanitizationService.instance;
  }

  private configureDOMPurify(): void {
    // Add custom hooks for enhanced security
    DOMPurify.addHook('beforeSanitizeElements', (node) => {
      // Remove any script tags completely
      if ((node as Element).tagName === 'SCRIPT') {
        (node as Element).remove();
      }
    });

    DOMPurify.addHook('beforeSanitizeAttributes', (node) => {
      // Remove any potential XSS vectors from attributes
      const element = node as Element;
      if (element.hasAttribute('onerror')) {
        element.removeAttribute('onerror');
      }
      if (element.hasAttribute('onload')) {
        element.removeAttribute('onload');
      }
    });
  }

  /**
   * Sanitize HTML content for general display
   * Allows basic formatting but removes dangerous elements
   */
  public sanitizeHTML(content: string): string {
    if (!content || typeof content !== 'string') {
      return '';
    }

    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p', 'br', 'div', 'span', 'strong', 'em', 'i', 'b', 'u',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote', 'pre', 'code',
        'table', 'thead', 'tbody', 'tr', 'td', 'th',
        'a'
      ],
      ALLOWED_ATTR: [
        'href', 'title', 'class', 'id',
        'target', 'rel'
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
      ADD_ATTR: ['target'],
      FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
      KEEP_CONTENT: true,
      RETURN_DOM_FRAGMENT: false,
      WHOLE_DOCUMENT: false
    });
  }

  /**
   * Sanitize code content for display in code blocks
   * More restrictive, only allows text content
   */
  public sanitizeCode(content: string): string {
    if (!content || typeof content !== 'string') {
      return '';
    }

    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['pre', 'code', 'span', 'div', 'br'],
      ALLOWED_ATTR: ['class'],
      FORBID_TAGS: ['script', 'style', 'link'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
      KEEP_CONTENT: true
    });
  }

  /**
   * Sanitize math content for educational tools
   * Allows mathematical notation elements
   */
  public sanitizeMath(content: string): string {
    if (!content || typeof content !== 'string') {
      return '';
    }

    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p', 'br', 'div', 'span', 'strong', 'em',
        'sup', 'sub', 'math', 'mi', 'mo', 'mn', 'mrow', 'mfrac', 'msup', 'msub'
      ],
      ALLOWED_ATTR: ['class', 'mathvariant', 'displaystyle'],
      FORBID_TAGS: ['script', 'style', 'link', 'iframe'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick'],
      KEEP_CONTENT: true
    });
  }

  /**
   * Ultra-strict sanitization for user input validation
   * Only allows plain text
   */
  public sanitizeUserInput(content: string): string {
    if (!content || typeof content !== 'string') {
      return '';
    }

    // Remove all HTML tags and return plain text
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    }).trim();
  }

  /**
   * Validate that content doesn't contain potential XSS vectors
   */
  public validateContent(content: string): boolean {
    if (!content || typeof content !== 'string') {
      return false;
    }

    // Check for common XSS patterns
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^>]*>/gi,
      /data:text\/html/gi
    ];

    return !xssPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Get safe properties for dangerouslySetInnerHTML
   */
  public getSafeHTML(content: string, type: 'general' | 'code' | 'math' = 'general'): { __html: string } {
    let sanitized: string;
    
    switch (type) {
      case 'code':
        sanitized = this.sanitizeCode(content);
        break;
      case 'math':
        sanitized = this.sanitizeMath(content);
        break;
      default:
        sanitized = this.sanitizeHTML(content);
    }

    return { __html: sanitized };
  }
}

// Export singleton instance
export const sanitizationService = SanitizationService.getInstance();