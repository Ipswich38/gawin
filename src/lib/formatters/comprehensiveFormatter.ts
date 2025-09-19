/**
 * Comprehensive Formatting System for Gawin AI
 * Handles different content types with proper formatting rules
 */

export interface FormattingOptions {
  preserveOriginalFormatting?: boolean;
  enableMathRendering?: boolean;
  enableCodeSyntaxHighlighting?: boolean;
}

export type ContentType =
  | 'general'
  | 'enumeration'
  | 'song'
  | 'poem'
  | 'story'
  | 'script'
  | 'creative'
  | 'research'
  | 'feasibility'
  | 'code';

export class ComprehensiveFormatter {

  /**
   * Detects the content type based on text patterns
   */
  static detectContentType(text: string): ContentType {
    const lines = text.split('\n').filter(line => line.trim());

    // Check for code blocks first
    if (text.includes('```')) {
      return 'code';
    }

    // Check for script formatting
    if (text.match(/^(INT\.|EXT\.)/m) || text.match(/^[A-Z\s]+\n\s*\(/m)) {
      return 'script';
    }

    // Check for song lyrics
    if (text.match(/\[Chorus\]|\[Verse\]|\[Bridge\]|🎵/) ||
        (text.match(/\n\n/) && lines.length > 4 && lines.every(line => line.length < 100))) {
      return 'song';
    }

    // Check for poems (short lines, potential rhyming)
    if (lines.length >= 3 && lines.length <= 20 &&
        lines.every(line => line.length < 80) &&
        !text.includes('#') && !text.includes('##')) {
      return 'poem';
    }

    // Check for research paper structure
    if (text.match(/^#+ (Abstract|Introduction|Methodology|Results|Discussion|Conclusion)/m)) {
      return 'research';
    }

    // Check for feasibility study structure
    if (text.match(/^#+ (Executive Summary|Market Analysis|Financial|Technical|Operational)/m)) {
      return 'feasibility';
    }

    // Check for story structure
    if (text.match(/^#+ Chapter \d+/m) || text.includes('"') && text.includes('said')) {
      return 'story';
    }

    // Check for creative writing
    if (text.match(/^# .+/m) && text.length > 500) {
      return 'creative';
    }

    // Check for enumerations
    if (text.match(/^(\d+\.|\-|\•)/m) || text.match(/^#{2,3} /m)) {
      return 'enumeration';
    }

    return 'general';
  }

  /**
   * Formats text based on detected or specified content type
   */
  static formatText(text: string, contentType?: ContentType, options: FormattingOptions = {}): string {
    const type = contentType || this.detectContentType(text);

    // Apply basic preprocessing first
    let processedText = this.basicPreprocessing(text, options);

    // Apply content-specific formatting
    switch (type) {
      case 'enumeration':
        return this.formatEnumeration(processedText);
      case 'song':
        return this.formatSongLyrics(processedText);
      case 'poem':
        return this.formatPoem(processedText);
      case 'story':
        return this.formatStorybook(processedText);
      case 'script':
        return this.formatScript(processedText);
      case 'creative':
        return this.formatCreativeWriting(processedText);
      case 'research':
        return this.formatResearchPaper(processedText);
      case 'feasibility':
        return this.formatFeasibilityStudy(processedText);
      case 'code':
        return processedText; // Code blocks handled separately
      default:
        return this.formatGeneral(processedText);
    }
  }

  /**
   * Basic preprocessing for all content types
   */
  private static basicPreprocessing(text: string, options: FormattingOptions): string {
    let processed = text;

    // Fix sequential numbering (replace all 1. with proper numbers)
    processed = this.fixSequentialNumbering(processed);

    // Handle basic markdown
    processed = processed
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

    // Handle inline code
    processed = processed.replace(
      /`([^`]+)`/g,
      '<code class="inline-code bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-1.5 py-0.5 rounded-md text-xs sm:text-sm font-mono border border-gray-300/50 dark:border-gray-600/50 whitespace-nowrap">$1</code>'
    );

    // Handle math if enabled
    if (options.enableMathRendering) {
      processed = this.processMathExpressions(processed);
    }

    return processed;
  }

  /**
   * Fix sequential numbering (replace repeated 1. with proper sequence)
   */
  private static fixSequentialNumbering(text: string): string {
    const lines = text.split('\n');
    let listNumber = 1;
    let inList = false;

    return lines.map(line => {
      const trimmedLine = line.trim();

      // Check if this line starts a numbered list
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

      // Not a numbered list item
      if (trimmedLine.length > 0 && !trimmedLine.match(/^\d+\.\s+/)) {
        inList = false;
        listNumber = 1;
      }

      return line;
    }).join('\n');
  }

  /**
   * Format enumeration/list content
   */
  private static formatEnumeration(text: string): string {
    // Enhanced enumeration formatting with proper hierarchy
    return text.replace(/^(#{2,3})\s+(.+)$/gm, '<h3 class="text-lg font-bold text-blue-600 mt-6 mb-3">$2</h3>')
                .replace(/^(\d+)\.\s+(.+)$/gm, '<div class="flex items-start space-x-3 mb-3"><span class="font-semibold text-blue-600 flex-shrink-0 mt-1">$1.</span><span class="flex-1">$2</span></div>')
                .replace(/^[\-•]\s+(.+)$/gm, '<div class="flex items-start space-x-3 mb-2 ml-6"><span class="text-blue-600 flex-shrink-0 mt-1">•</span><span class="flex-1">$1</span></div>');
  }

  /**
   * Format song lyrics
   */
  private static formatSongLyrics(text: string): string {
    return text.replace(/^🎵\s*(.+)$/gm, '<h2 class="text-xl font-bold text-purple-600 mb-4">🎵 $1</h2>')
                .replace(/^\[(Chorus|Verse|Bridge|Outro|Intro)\]$/gm, '<h3 class="text-md font-semibold text-purple-500 mt-4 mb-2">[$1]</h3>')
                .replace(/^([^#\[\n].+)$/gm, '<div class="text-gray-700 leading-relaxed mb-1">$1</div>');
  }

  /**
   * Format poems
   */
  private static formatPoem(text: string): string {
    const lines = text.split('\n');
    let inStanza = false;
    let result: string[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed === '') {
        if (inStanza) {
          result.push('</div>'); // Close stanza
          inStanza = false;
        }
        result.push('<div class="mb-4"></div>'); // Stanza break
      } else {
        if (!inStanza) {
          result.push('<div class="poem-stanza space-y-1">');
          inStanza = true;
        }
        result.push(`<div class="text-gray-700 leading-relaxed italic">${trimmed}</div>`);
      }
    });

    if (inStanza) {
      result.push('</div>'); // Close final stanza
    }

    return result.join('\n');
  }

  /**
   * Format storybook content
   */
  private static formatStorybook(text: string): string {
    return text.replace(/^#{1,2}\s+(Chapter \d+.*?)$/gm, '<h2 class="text-xl font-bold text-green-600 mt-8 mb-4">$1</h2>')
                .replace(/^"([^"]+)"$/gm, '<div class="italic text-gray-600 my-2 pl-4 border-l-2 border-gray-300">"$1"</div>')
                .replace(/(.+?)(said|asked|whispered|shouted)(.*)$/gm, '<div class="mb-3">$1<em>$2</em>$3</div>');
  }

  /**
   * Format screenplay/script content
   */
  private static formatScript(text: string): string {
    return text.replace(/^(INT\.|EXT\.)\s+(.+)\s+–\s+(.+)$/gm, '<div class="script-slugline font-bold text-gray-900 bg-gray-100 p-2 mb-2">$1 $2 – $3</div>')
                .replace(/^([A-Z\s]{2,})$/gm, '<div class="script-character font-bold text-center text-blue-700 mt-4 mb-1">$1</div>')
                .replace(/^\(([^)]+)\)$/gm, '<div class="script-parenthetical italic text-center text-gray-600 text-sm mb-1">($1)</div>')
                .replace(/^([^A-Z\n\(].+)$/gm, '<div class="script-action text-gray-700 mb-3">$1</div>');
  }

  /**
   * Format creative writing
   */
  private static formatCreativeWriting(text: string): string {
    return text.replace(/^#\s+(.+)$/gm, '<h1 class="text-2xl font-bold text-indigo-700 mb-6 text-center">$1</h1>')
                .replace(/^#{2,3}\s+(.+)$/gm, '<h3 class="text-lg font-semibold text-indigo-600 mt-6 mb-3">$1</h3>')
                .split('\n\n')
                .map(paragraph => {
                  if (paragraph.trim() && !paragraph.includes('<h')) {
                    return `<p class="mb-4 leading-relaxed text-gray-700">${paragraph.trim()}</p>`;
                  }
                  return paragraph;
                }).join('\n');
  }

  /**
   * Format research paper
   */
  private static formatResearchPaper(text: string): string {
    return text.replace(/^#\s+(.+)$/gm, '<h1 class="text-2xl font-bold text-blue-800 mb-6 text-center border-b-2 border-blue-200 pb-2">$1</h1>')
                .replace(/^##\s+(Abstract|Introduction|Methodology|Results|Discussion|Conclusion|References)$/gm, '<h2 class="text-xl font-bold text-blue-700 mt-8 mb-4">$1</h2>')
                .replace(/^##\s+(.+)$/gm, '<h2 class="text-lg font-semibold text-blue-600 mt-6 mb-3">$1</h2>');
  }

  /**
   * Format feasibility study
   */
  private static formatFeasibilityStudy(text: string): string {
    return text.replace(/^#\s+(.+)$/gm, '<h1 class="text-2xl font-bold text-emerald-800 mb-6 text-center border-b-2 border-emerald-200 pb-2">$1</h1>')
                .replace(/^##\s+(Executive Summary|Market Analysis|Technical Feasibility|Financial Feasibility|Operational Plan|Conclusion)$/gm, '<h2 class="text-xl font-bold text-emerald-700 mt-8 mb-4 bg-emerald-50 p-3 rounded">$1</h2>')
                .replace(/^##\s+(.+)$/gm, '<h2 class="text-lg font-semibold text-emerald-600 mt-6 mb-3">$1</h2>');
  }

  /**
   * Format general content
   */
  private static formatGeneral(text: string): string {
    return text.replace(/^#{1,3}\s+(.+)$/gm, '<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">$1</h3>')
                .split('\n\n')
                .map(paragraph => {
                  if (paragraph.trim() && !paragraph.includes('<h')) {
                    return `<p class="mb-3 leading-relaxed">${paragraph.trim()}</p>`;
                  }
                  return paragraph;
                }).join('\n');
  }

  /**
   * Process mathematical expressions
   */
  private static processMathExpressions(text: string): string {
    return text
      .replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}')
      .replace(/\(([^)]+)\)\/\(([^)]+)\)/g, '\\frac{$1}{$2}')
      .replace(/\+\-/g, '\\pm')
      .replace(/\-\+/g, '\\mp')
      .replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')
      .replace(/°/g, '^\\circ');
  }
}