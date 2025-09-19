/**
 * Universal Text Formatter for Gawin AI
 * Applies proper text formatting principles like Claude's own responses
 * No special UI containers - just clean, readable markdown formatting
 */

export interface FormattingOptions {
  preserveOriginalFormatting?: boolean;
  enableMathRendering?: boolean;
  enableCodeSyntaxHighlighting?: boolean;
}

export type ContentType =
  | 'general'
  | 'song'
  | 'poem'
  | 'script'
  | 'story'
  | 'business'
  | 'research'
  | 'creative'
  | 'enumeration';

export class ComprehensiveFormatter {

  /**
   * Content type detection for formatting hints
   */
  static detectContentType(text: string): ContentType {
    const lowerText = text.toLowerCase();

    // Quick detection for formatting hints
    if (lowerText.includes('🎵') || /\[(verse|chorus|bridge)\]/i.test(text)) return 'song';
    if (/^#{1,3}\s+(abstract|introduction|methodology)/im.test(text)) return 'research';
    if (/^\d+\./m.test(text) || /list|ideas|ways|steps/.test(lowerText)) return 'enumeration';

    return 'general';
  }

  /**
   * Main formatting function - applies universal text formatting principles
   */
  static formatText(text: string, contentType?: ContentType, options: FormattingOptions = {}): string {
    let formatted = text;

    // 1. Fix sequential numbering FIRST (most critical)
    formatted = this.fixSequentialNumbering(formatted);

    // 2. Apply basic markdown formatting
    formatted = this.applyBasicMarkdown(formatted);

    // 3. Fix spacing and paragraph breaks
    formatted = this.fixSpacingAndBreaks(formatted);

    // 4. Apply content-specific formatting hints (minimal)
    formatted = this.applyContentHints(formatted, contentType);

    return formatted.trim();
  }

  /**
   * Fix sequential numbering (1. 1. 1. → 1. 2. 3.)
   */
  private static fixSequentialNumbering(text: string): string {
    const lines = text.split('\n');
    let listNumber = 1;
    let inList = false;

    return lines.map(line => {
      const trimmedLine = line.trim();

      // Check if this line starts with "1." (common error)
      if (trimmedLine.match(/^1\.\s+/)) {
        if (!inList) {
          listNumber = 1;
          inList = true;
        }
        const result = line.replace(/^(\s*)1\.\s+/, `$1${listNumber}. `);
        listNumber++;
        return result;
      }

      // Check if this continues a numbered list
      if (trimmedLine.match(/^\d+\.\s+/) && inList) {
        const result = line.replace(/^(\s*)\d+\.\s+/, `$1${listNumber}. `);
        listNumber++;
        return result;
      }

      // Reset list state if not a list item
      if (trimmedLine.length > 0 && !trimmedLine.match(/^\d+\.\s+/)) {
        inList = false;
        listNumber = 1;
      }

      return line;
    }).join('\n');
  }

  /**
   * Apply basic markdown formatting
   */
  private static applyBasicMarkdown(text: string): string {
    let formatted = text;

    // Convert markdown to HTML
    formatted = formatted
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');

    return formatted;
  }

  /**
   * Fix spacing and paragraph breaks
   */
  private static fixSpacingAndBreaks(text: string): string {
    let formatted = text;

    // Clean up excessive spacing
    formatted = formatted
      .replace(/\n{3,}/g, '\n\n')  // Max 2 line breaks
      .replace(/\s{3,}/g, ' ')     // Max 1 space between words
      .replace(/\.\s*\./g, '.');   // Remove double periods

    // Ensure proper paragraph breaks
    const lines = formatted.split('\n');
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line === '') {
        // Keep empty lines for paragraph breaks
        result.push('');
      } else {
        result.push(line);
      }
    }

    return result.join('\n');
  }

  /**
   * Apply minimal content-specific formatting hints
   */
  private static applyContentHints(text: string, contentType?: ContentType): string {
    if (!contentType || contentType === 'general') return text;

    let formatted = text;

    // Song lyrics: Ensure proper section formatting
    if (contentType === 'song') {
      formatted = this.formatSongLyricsSimple(formatted);
    }

    // Research papers: Ensure proper headings
    else if (contentType === 'research') {
      formatted = this.formatResearchSimple(formatted);
    }

    return formatted;
  }

  /**
   * Simple song lyrics formatting (no special containers)
   */
  private static formatSongLyricsSimple(text: string): string {
    let formatted = text;

    // Ensure song title has proper formatting
    if (!formatted.startsWith('🎵')) {
      const lines = formatted.split('\n');
      if (lines.length > 0 && lines[0].trim()) {
        lines[0] = `🎵 **${lines[0].trim()}**`;
        formatted = lines.join('\n');
      }
    }

    // Ensure section labels are properly formatted
    formatted = formatted.replace(/^\[(Verse|Chorus|Bridge|Outro|Intro|Pre-Chorus).*?\]$/gm, '**[$1]**');

    // Ensure proper line breaks between sections
    formatted = formatted.replace(/(\*\*\[.*?\]\*\*)\n/g, '$1\n\n');

    return formatted;
  }

  /**
   * Simple research paper formatting
   */
  private static formatResearchSimple(text: string): string {
    let formatted = text;

    // Ensure proper heading hierarchy
    formatted = formatted
      .replace(/^#{1}\s+(.+)$/gm, '# **$1**')
      .replace(/^#{2}\s+(.+)$/gm, '## **$1**')
      .replace(/^#{3}\s+(.+)$/gm, '### **$1**');

    return formatted;
  }
}