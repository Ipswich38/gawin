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
   * Enhanced content type detection following the specification
   */
  static detectContentType(text: string): ContentType {
    const lowerContent = text.toLowerCase();
    const lines = text.split('\n').filter(line => line.trim());

    // Poem/Poetry detection - enhanced with more keywords
    if (lowerContent.includes('poem') ||
        lowerContent.includes('poetry') ||
        lowerContent.includes('verse') ||
        lowerContent.includes('stanza') ||
        lowerContent.includes('rhyme') ||
        lowerContent.includes('haiku') ||
        lowerContent.includes('sonnet')) {
      return 'poem';
    }

    // Song/Lyrics detection - enhanced
    if (lowerContent.includes('song') ||
        lowerContent.includes('lyrics') ||
        lowerContent.includes('🎵') ||
        /\[(verse|chorus|bridge|intro|outro)\]/i.test(text)) {
      return 'song';
    }

    // Research paper detection - enhanced
    if (lowerContent.includes('research') ||
        lowerContent.includes('abstract:') ||
        lowerContent.includes('introduction:') ||
        lowerContent.includes('methodology') ||
        lowerContent.includes('discussion') ||
        lowerContent.includes('references') ||
        /^#{1,3}\s+(abstract|introduction|methodology|results|discussion|references)/im.test(text)) {
      return 'research';
    }

    // Business document detection
    if (lowerContent.includes('executive summary') ||
        lowerContent.includes('business report') ||
        lowerContent.includes('recommendations') ||
        lowerContent.includes('conclusion')) {
      return 'business';
    }

    // List/Enumeration detection - enhanced
    if (/^\d+\./m.test(text) ||
        /^[-*•]/m.test(text) ||
        lowerContent.includes('list') ||
        lowerContent.includes('steps') ||
        lowerContent.includes('ways') ||
        lowerContent.includes('ideas') ||
        lowerContent.includes('features') ||
        lowerContent.includes('items')) {
      return 'enumeration';
    }

    // Story/Creative content detection
    if (lowerContent.includes('story') ||
        lowerContent.includes('tale') ||
        lowerContent.includes('narrative') ||
        lowerContent.includes('script')) {
      return 'story';
    }

    // Multi-line formatted content
    if (lines.length > 4 && text.includes('\n')) {
      return 'creative';
    }

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
   * Apply content-specific formatting based on detected type
   */
  private static applyContentHints(text: string, contentType?: ContentType): string {
    if (!contentType || contentType === 'general') return text;

    let formatted = text;

    switch (contentType) {
      case 'song':
        formatted = this.formatSongLyricsAdvanced(formatted);
        break;
      case 'poem':
        formatted = this.formatPoemAdvanced(formatted);
        break;
      case 'research':
        formatted = this.formatResearchAdvanced(formatted);
        break;
      case 'business':
        formatted = this.formatBusinessDocument(formatted);
        break;
      case 'enumeration':
        formatted = this.formatListContent(formatted);
        break;
      case 'story':
        formatted = this.formatStoryContent(formatted);
        break;
      case 'creative':
        formatted = this.formatCreativeContent(formatted);
        break;
      default:
        // For general content, ensure proper paragraph formatting
        formatted = this.formatGeneralContent(formatted);
    }

    return formatted;
  }

  /**
   * Format song lyrics following the exact guide format
   */
  private static formatSongLyricsSimple(text: string): string {
    const lines = text.split('\n');
    let result: string[] = [];
    let title = '';

    // Extract title (first line or line with 🎵)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('[') && !title) {
        title = line.replace(/^🎵\s*/, '').trim();
        break;
      }
    }

    // Format according to guide: **Song Title** – *Artist*
    if (title) {
      result.push(`**${title}**`);
      result.push('');
    }

    // Process remaining lines
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) {
        result.push('');
      } else if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        // Section labels like [Verse 1], [Chorus]
        result.push('');
        result.push(trimmed);
      } else if (trimmed !== title.replace(/^🎵\s*/, '').trim()) {
        // Lyric lines
        result.push(trimmed);
      }
    });

    return result.join('\n').replace(/\n{3,}/g, '\n\n');
  }

  /**
   * Format poems following the exact guide format
   */
  private static formatPoemSimple(text: string): string {
    const lines = text.split('\n');
    let result: string[] = [];
    let title = '';

    // Extract title (first line if it looks like a title)
    if (lines.length > 0 && lines[0].trim() && lines[0].trim().length < 100) {
      title = lines[0].trim();
    }

    // Format according to guide: **Title of the Poem**
    if (title) {
      result.push(`**${title}**`);
      result.push('');
    }

    // Process remaining lines, preserving stanza structure
    let currentStanza: string[] = [];
    const startIndex = title ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line === '') {
        // Empty line - end current stanza
        if (currentStanza.length > 0) {
          result.push(...currentStanza);
          result.push('');
          currentStanza = [];
        }
      } else {
        // Add line to current stanza
        currentStanza.push(line);
      }
    }

    // Add final stanza
    if (currentStanza.length > 0) {
      result.push(...currentStanza);
    }

    return result.join('\n').replace(/\n{3,}/g, '\n\n');
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

  /**
   * Advanced song lyrics formatting following specification
   */
  private static formatSongLyricsAdvanced(text: string): string {
    const lines = text.split('\n');
    let result: string[] = [];
    let title = '';

    // Extract title (first line or line with 🎵)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('[') && !title) {
        title = line.replace(/^🎵\s*/, '').replace(/^\*\*|\*\*$/g, '').trim();
        break;
      }
    }

    // Format: **Song Title**
    if (title) {
      result.push(`**${title}**`);
      result.push('');
    }

    // Process lyrics with proper section formatting
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed === title) {
        if (result[result.length - 1] !== '') result.push('');
      } else if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        // Section labels like [Verse 1], [Chorus]
        if (result[result.length - 1] !== '') result.push('');
        result.push(trimmed);
      } else {
        // Lyric lines
        result.push(trimmed);
      }
    });

    return result.join('\n').replace(/\n{3,}/g, '\n\n');
  }

  /**
   * Advanced poem formatting following specification
   */
  private static formatPoemAdvanced(text: string): string {
    const lines = text.split('\n');
    let result: string[] = [];
    let title = '';

    // Extract title (first line if it looks like a title)
    if (lines.length > 0 && lines[0].trim() && lines[0].trim().length < 100) {
      title = lines[0].trim().replace(/^\*\*|\*\*$/g, '');
    }

    // Format: **Title of the Poem**
    if (title) {
      result.push(`**${title}**`);
      result.push('');
    }

    // Process poem with stanza structure preservation
    let currentStanza: string[] = [];
    const startIndex = title ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line === '') {
        // Empty line - end current stanza
        if (currentStanza.length > 0) {
          result.push(...currentStanza);
          result.push('');
          currentStanza = [];
        }
      } else {
        // Add line to current stanza (center align for poems)
        currentStanza.push(line);
      }
    }

    // Add final stanza
    if (currentStanza.length > 0) {
      result.push(...currentStanza);
    }

    return result.join('\n').replace(/\n{3,}/g, '\n\n');
  }

  /**
   * Advanced research paper formatting
   */
  private static formatResearchAdvanced(text: string): string {
    let formatted = text;

    // Format main sections
    formatted = formatted
      .replace(/^#\s*(.+)$/gm, '# $1')
      .replace(/^##\s*(abstract|introduction|methodology|methods|results|discussion|conclusion|references)(\s*:?)/gmi, '## **$1**')
      .replace(/^###\s*(.+)$/gm, '### **$1**');

    // Ensure proper paragraph breaks
    const sections = formatted.split('\n\n');
    const formattedSections = sections.map(section => {
      if (section.trim().startsWith('#')) {
        return section;
      }
      // Split long paragraphs
      const sentences = section.split('. ');
      if (sentences.length > 4) {
        const midpoint = Math.ceil(sentences.length / 2);
        return sentences.slice(0, midpoint).join('. ') + '.\n\n' + sentences.slice(midpoint).join('. ');
      }
      return section;
    });

    return formattedSections.join('\n\n');
  }

  /**
   * Business document formatting
   */
  private static formatBusinessDocument(text: string): string {
    let formatted = text;

    // Format business sections
    formatted = formatted
      .replace(/^#\s*(business report.*)/gmi, '# **$1**')
      .replace(/^##\s*(executive summary|introduction|data\/analysis|analysis|recommendations|conclusion)(\s*:?)/gmi, '## **$1**')
      .replace(/^-\s*\*\*(.*?):\*\*(.*)/gm, '- **$1:**$2');

    return formatted;
  }

  /**
   * List/Enumeration formatting
   */
  private static formatListContent(text: string): string {
    const lines = text.split('\n');
    let result: string[] = [];
    let listNumber = 1;
    let inNumberedList = false;

    lines.forEach(line => {
      const trimmed = line.trim();

      // Handle numbered lists
      if (/^\d+\.\s/.test(trimmed)) {
        if (!inNumberedList) {
          listNumber = 1;
          inNumberedList = true;
        }
        result.push(line.replace(/^\s*\d+\.\s/, `${listNumber}. `));
        listNumber++;
      }
      // Handle bullet points
      else if (/^[-*•]\s/.test(trimmed)) {
        result.push(line.replace(/^(\s*)[-*•]\s/, '$1• '));
        inNumberedList = false;
      }
      // Handle sub-items
      else if (/^\s+[-*•]\s/.test(line)) {
        result.push(line.replace(/^(\s+)[-*•]\s/, '$1- '));
      }
      else {
        result.push(line);
        if (trimmed.length > 0) inNumberedList = false;
      }
    });

    return result.join('\n');
  }

  /**
   * Story/Script content formatting
   */
  private static formatStoryContent(text: string): string {
    // Split into paragraphs and ensure proper spacing
    const paragraphs = text.split('\n\n');
    return paragraphs.map(paragraph => {
      // Split very long paragraphs
      const sentences = paragraph.split('. ');
      if (sentences.length > 5) {
        const midpoint = Math.ceil(sentences.length / 2);
        return sentences.slice(0, midpoint).join('. ') + '.\n\n' + sentences.slice(midpoint).join('. ');
      }
      return paragraph;
    }).join('\n\n');
  }

  /**
   * Creative content formatting
   */
  private static formatCreativeContent(text: string): string {
    // Preserve line breaks and ensure proper spacing
    return text
      .replace(/\n{3,}/g, '\n\n')  // Max 2 consecutive line breaks
      .replace(/^(.{200,}?[.!?])\s+(.)/gm, '$1\n\n$2'); // Break long lines at sentence boundaries
  }

  /**
   * General content formatting with paragraph breaks
   */
  private static formatGeneralContent(text: string): string {
    // Split long paragraphs and ensure readability
    const paragraphs = text.split('\n\n');

    return paragraphs.map(paragraph => {
      // If paragraph is very long, try to split it intelligently
      if (paragraph.length > 400) {
        const sentences = paragraph.split(/([.!?])\s+/);
        let currentParagraph = '';
        let result = [];

        for (let i = 0; i < sentences.length; i += 2) {
          const sentence = sentences[i] + (sentences[i + 1] || '');
          if (currentParagraph.length + sentence.length > 300 && currentParagraph.length > 0) {
            result.push(currentParagraph.trim());
            currentParagraph = sentence;
          } else {
            currentParagraph += sentence + ' ';
          }
        }

        if (currentParagraph.trim()) {
          result.push(currentParagraph.trim());
        }

        return result.join('\n\n');
      }

      return paragraph;
    }).join('\n\n');
  }
}