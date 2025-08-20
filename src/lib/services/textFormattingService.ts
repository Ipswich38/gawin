/**
 * Intelligent Text Formatting Service
 * Automatically formats AI outputs for enhanced readability and user engagement
 * Implements smart paragraph breaks, spacing, and visual structure
 */

interface FormattingOptions {
  maxSentencesPerParagraph: number;
  emphasizeHeaders: boolean;
  addEmojis: boolean;
  enhanceStructure: boolean;
  tutorMode: boolean;
}

interface FormattedText {
  html: string;
  plainText: string;
  wordCount: number;
  readingTime: number; // in minutes
}

class TextFormattingService {
  private defaultOptions: FormattingOptions = {
    maxSentencesPerParagraph: 2,
    emphasizeHeaders: true,
    addEmojis: false,
    enhanceStructure: true,
    tutorMode: false
  };

  /**
   * Main formatting function - automatically formats text for better readability
   */
  formatText(content: string, options?: Partial<FormattingOptions>): FormattedText {
    const opts = { ...this.defaultOptions, ...options };
    
    // Clean and normalize the text
    let formatted = this.normalizeText(content);
    
    // Apply intelligent paragraph breaks
    formatted = this.createIntelligentParagraphs(formatted, opts.maxSentencesPerParagraph);
    
    // Enhance structure and readability
    if (opts.enhanceStructure) {
      formatted = this.enhanceTextStructure(formatted, opts.tutorMode);
    }
    
    // Convert to HTML with proper styling
    const html = this.convertToStyledHTML(formatted, opts);
    
    return {
      html,
      plainText: this.stripHTML(html),
      wordCount: this.countWords(content),
      readingTime: Math.ceil(this.countWords(content) / 200) // 200 WPM average
    };
  }

  /**
   * Clean and normalize text input
   */
  private normalizeText(text: string): string {
    return text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n\s*\n/g, '\n\n') // Clean multiple line breaks
      .trim();
  }

  /**
   * Create intelligent paragraph breaks based on sentence count and content flow
   */
  private createIntelligentParagraphs(text: string, maxSentencesPerParagraph: number): string {
    // Split into sentences while preserving important punctuation
    const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [text];
    
    const paragraphs: string[] = [];
    let currentParagraph: string[] = [];
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (!sentence) continue;
      
      currentParagraph.push(sentence);
      
      // Create paragraph break conditions
      const shouldBreak = 
        currentParagraph.length >= maxSentencesPerParagraph ||
        this.isTopicShift(sentence, sentences[i + 1]) ||
        this.isListStart(sentences[i + 1]) ||
        this.isConclusion(sentence);
      
      if (shouldBreak || i === sentences.length - 1) {
        paragraphs.push(currentParagraph.join(' '));
        currentParagraph = [];
      }
    }
    
    return paragraphs.filter(p => p.trim()).join('\n\n');
  }

  /**
   * Enhance text structure with better formatting
   */
  private enhanceTextStructure(text: string, tutorMode: boolean): string {
    let enhanced = text;
    
    // Add emphasis to key concepts
    enhanced = this.emphasizeKeyConcepts(enhanced, tutorMode);
    
    // Improve list formatting
    enhanced = this.improveListFormatting(enhanced);
    
    // Add breathing room around important sections
    enhanced = this.addStructuralSpacing(enhanced);
    
    return enhanced;
  }

  /**
   * Emphasize key concepts and important information
   */
  private emphasizeKeyConcepts(text: string, tutorMode: boolean): string {
    let enhanced = text;
    
    // Emphasize educational terms in tutor mode
    if (tutorMode) {
      enhanced = enhanced.replace(
        /\b(remember|important|key concept|note that|pay attention|crucial|essential|fundamental)\b/gi,
        '<strong class="concept-emphasis">$1</strong>'
      );
    }
    
    // Emphasize numbers and statistics
    enhanced = enhanced.replace(
      /\b(\d+(?:\.\d+)?(?:%|percent|degrees?|years?|months?|days?|hours?|minutes?))\b/g,
      '<span class="number-emphasis">$1</span>'
    );
    
    // Emphasize quoted terms and definitions
    enhanced = enhanced.replace(
      /"([^"]+)"/g,
      '<span class="quote-emphasis">"$1"</span>'
    );
    
    return enhanced;
  }

  /**
   * Improve list and bullet point formatting
   */
  private improveListFormatting(text: string): string {
    let enhanced = text;
    
    // Convert dash lists to proper formatting
    enhanced = enhanced.replace(
      /^[-•*]\s+(.+)$/gm,
      '<div class="list-item">• $1</div>'
    );
    
    // Convert numbered lists
    enhanced = enhanced.replace(
      /^(\d+)[.)]\s+(.+)$/gm,
      '<div class="numbered-item"><span class="item-number">$1.</span> $2</div>'
    );
    
    return enhanced;
  }

  /**
   * Add structural spacing for better visual flow
   */
  private addStructuralSpacing(text: string): string {
    let enhanced = text;
    
    // Add extra spacing before questions
    enhanced = enhanced.replace(
      /\n([^.!?]*\?)/g,
      '\n\n<div class="question-spacing">$1</div>'
    );
    
    // Add spacing around transitions
    enhanced = enhanced.replace(
      /\b(however|therefore|furthermore|additionally|in conclusion|meanwhile|consequently)\b/gi,
      '\n\n<span class="transition-word">$1</span>'
    );
    
    return enhanced;
  }

  /**
   * Convert formatted text to styled HTML
   */
  private convertToStyledHTML(text: string, options: FormattingOptions): string {
    let html = text;
    
    // Convert paragraph breaks to proper HTML
    html = html.replace(/\n\n+/g, '</p><p class="formatted-paragraph">');
    html = `<p class="formatted-paragraph">${html}</p>`;
    
    // Clean up empty paragraphs
    html = html.replace(/<p class="formatted-paragraph"><\/p>/g, '');
    
    // Add CSS classes for styling
    html = `<div class="formatted-content ${options.tutorMode ? 'tutor-mode' : 'normal-mode'}">${html}</div>`;
    
    return html;
  }

  /**
   * Helper functions for content analysis
   */
  private isTopicShift(current: string, next?: string): boolean {
    if (!next) return false;
    
    const transitionWords = ['however', 'meanwhile', 'furthermore', 'additionally', 'on the other hand'];
    return transitionWords.some(word => 
      next.toLowerCase().includes(word) || current.toLowerCase().includes(word)
    );
  }

  private isListStart(sentence?: string): boolean {
    if (!sentence) return false;
    return /^(first|second|third|finally|lastly|[\d]+[.)]\s)/i.test(sentence.trim());
  }

  private isConclusion(sentence: string): boolean {
    const conclusionWords = ['in conclusion', 'finally', 'in summary', 'to summarize', 'therefore'];
    return conclusionWords.some(word => sentence.toLowerCase().includes(word));
  }

  private stripHTML(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Get CSS styles for formatted content
   */
  getCSSStyles(): string {
    return `
      .formatted-content {
        line-height: 1.7;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .formatted-paragraph {
        margin: 0 0 16px 0;
        text-align: left;
      }
      
      .formatted-paragraph:last-child {
        margin-bottom: 0;
      }
      
      .concept-emphasis {
        color: #FF6B35;
        font-weight: 600;
        background: rgba(255, 107, 53, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
      }
      
      .number-emphasis {
        font-weight: 600;
        color: #2563eb;
        background: rgba(37, 99, 235, 0.1);
        padding: 1px 4px;
        border-radius: 3px;
      }
      
      .quote-emphasis {
        font-style: italic;
        color: #059669;
        background: rgba(5, 150, 105, 0.1);
        padding: 1px 4px;
        border-radius: 3px;
      }
      
      .list-item {
        margin: 8px 0;
        padding-left: 12px;
        position: relative;
      }
      
      .numbered-item {
        margin: 8px 0;
        padding-left: 24px;
        position: relative;
      }
      
      .item-number {
        position: absolute;
        left: 0;
        font-weight: 600;
        color: #FF6B35;
      }
      
      .question-spacing {
        background: rgba(255, 107, 53, 0.05);
        padding: 12px;
        border-left: 3px solid #FF6B35;
        border-radius: 0 8px 8px 0;
        margin: 12px 0;
      }
      
      .transition-word {
        font-weight: 500;
        color: #7c3aed;
      }
      
      .tutor-mode .formatted-paragraph {
        margin-bottom: 20px;
      }
      
      .tutor-mode .concept-emphasis {
        animation: gentle-highlight 2s ease-in-out;
      }
      
      @keyframes gentle-highlight {
        0%, 100% { background: rgba(255, 107, 53, 0.1); }
        50% { background: rgba(255, 107, 53, 0.2); }
      }
      
      .normal-mode .formatted-paragraph {
        margin-bottom: 14px;
      }
    `;
  }
}

// Export singleton instance
export const textFormattingService = new TextFormattingService();
export default textFormattingService;