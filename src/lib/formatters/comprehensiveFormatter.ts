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
   * Enhanced content type detection with better pattern recognition
   */
  static detectContentType(text: string): ContentType {
    const lines = text.split('\n').filter(line => line.trim());
    const wordCount = text.split(/\s+/).length;

    // Check for code blocks first
    if (text.includes('```')) {
      return 'code';
    }

    // Check for script formatting (more specific patterns)
    if (text.match(/^(INT\.|EXT\.)\s+/m) ||
        text.match(/^[A-Z\s]{2,20}$\n.*\(/m) ||
        text.match(/^(Title:|Genre:)/m)) {
      return 'script';
    }

    // Check for song lyrics (enhanced detection)
    if (text.match(/🎵/) ||
        text.match(/\[(Chorus|Verse|Bridge|Outro|Intro|Pre-Chorus)\]/i) ||
        text.match(/^(Verse|Chorus|Bridge)\s*\d*:?\s*$/m) ||
        (lines.length > 4 && lines.length < 50 &&
         lines.filter(line => line.length < 60).length > lines.length * 0.7)) {
      return 'song';
    }

    // Check for poems (more sophisticated detection)
    if ((lines.length >= 3 && lines.length <= 25) &&
        lines.every(line => line.length < 100) &&
        !text.includes('#') && !text.includes('##') &&
        wordCount < 200 &&
        !text.match(/^\d+\./m)) {
      return 'poem';
    }

    // Check for research paper structure (enhanced)
    if (text.match(/^#{1,2}\s+(Abstract|Introduction|Literature Review|Methodology|Methods|Results|Findings|Discussion|Conclusion|References)/im)) {
      return 'research';
    }

    // Check for feasibility study structure (enhanced)
    if (text.match(/^#{1,2}\s+(Executive Summary|Market Analysis|Financial (Feasibility|Analysis)|Technical Feasibility|Operational Plan|Risk Assessment)/im)) {
      return 'feasibility';
    }

    // Check for story structure (enhanced)
    if (text.match(/^#{1,2}\s+Chapter \d+/m) ||
        (text.includes('"') && text.match(/(said|asked|whispered|shouted|replied|answered)/)) ||
        text.match(/^#{1,2}\s+(Prologue|Epilogue|Chapter)/m)) {
      return 'story';
    }

    // Check for creative writing (enhanced)
    if (text.match(/^#\s+[A-Z][^#]*$/m) &&
        wordCount > 200 &&
        !text.match(/^#{2,}/m) &&
        !text.match(/^\d+\./m)) {
      return 'creative';
    }

    // Check for enumerations (enhanced)
    if (text.match(/^(\d+\.|\-|\•)/m) ||
        text.match(/^#{2,3}\s+/m) ||
        (text.match(/^\d+\./m) && lines.filter(line => line.match(/^\d+\./)).length >= 3)) {
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
   * Format song lyrics with proper structure
   */
  private static formatSongLyrics(text: string): string {
    const lines = text.split('\n');
    let result: string[] = [];
    let inTitle = true;

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (!trimmed) {
        result.push('<div class="mb-3"></div>'); // Stanza break
        return;
      }

      // Song title (first non-empty line or lines with 🎵)
      if ((inTitle && index === 0) || trimmed.match(/^🎵\s*/)) {
        const title = trimmed.replace(/^🎵\s*/, '');
        result.push(`<div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-purple-700 mb-2">🎵 ${title}</h1>
          <div class="w-24 h-1 bg-purple-300 mx-auto rounded"></div>
        </div>`);
        inTitle = false;
        return;
      }

      // Section labels (Verse 1, Chorus, Bridge, etc.)
      if (trimmed.match(/^\[(Verse|Chorus|Bridge|Outro|Intro|Pre-Chorus).*?\]$/i) ||
          trimmed.match(/^(Verse|Chorus|Bridge|Outro|Intro)\s*\d*:?$/i)) {
        result.push(`<div class="mt-6 mb-3">
          <h3 class="text-lg font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-md inline-block">
            ${trimmed.replace(/[\[\]]/g, '')}
          </h3>
        </div>`);
        inTitle = false;
        return;
      }

      // Regular lyric lines
      if (trimmed.length > 0) {
        // Capitalize first letter of each line
        const capitalizedLine = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        result.push(`<div class="text-gray-700 leading-relaxed mb-1 pl-4">${capitalizedLine}</div>`);
        inTitle = false;
      }
    });

    return `<div class="song-lyrics bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
      ${result.join('\n')}
    </div>`;
  }

  /**
   * Format poems with proper structure and type detection
   */
  private static formatPoem(text: string): string {
    const lines = text.split('\n').filter(line => line.trim());
    let result: string[] = [];
    let title = '';
    let poemType = this.detectPoemType(lines);

    // Detect title (first line if it's short and looks like a title)
    if (lines.length > 0 && lines[0].length < 50 && !lines[0].match(/^[a-z]/)) {
      title = lines[0].trim();
      lines.shift(); // Remove title from lines
    }

    // Add title if detected
    if (title) {
      result.push(`<div class="text-center mb-6">
        <h2 class="text-xl font-bold text-indigo-700 mb-2">${title}</h2>
        <div class="text-sm text-indigo-500 italic mb-4">${poemType}</div>
        <div class="w-16 h-0.5 bg-indigo-300 mx-auto"></div>
      </div>`);
    }

    // Format based on poem type
    if (poemType === 'Haiku') {
      result.push('<div class="haiku text-center space-y-2">');
      lines.forEach((line, index) => {
        result.push(`<div class="text-gray-700 leading-relaxed ${index === 1 ? 'text-lg' : 'text-base'}">${line.trim()}</div>`);
      });
      result.push('</div>');
    } else {
      // Regular poem formatting with stanzas
      let currentStanza: string[] = [];

      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed === '') {
          if (currentStanza.length > 0) {
            result.push('<div class="poem-stanza mb-4 space-y-1">');
            currentStanza.forEach(stanzaLine => {
              result.push(`<div class="text-gray-700 leading-relaxed">${stanzaLine}</div>`);
            });
            result.push('</div>');
            currentStanza = [];
          }
        } else {
          currentStanza.push(trimmed);
        }
      });

      // Add final stanza if exists
      if (currentStanza.length > 0) {
        result.push('<div class="poem-stanza mb-4 space-y-1">');
        currentStanza.forEach(stanzaLine => {
          result.push(`<div class="text-gray-700 leading-relaxed">${stanzaLine}</div>`);
        });
        result.push('</div>');
      }
    }

    return `<div class="poem bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
      ${result.join('\n')}
    </div>`;
  }

  /**
   * Detect poem type based on structure
   */
  private static detectPoemType(lines: string[]): string {
    if (lines.length === 3) return 'Haiku';
    if (lines.length === 14) return 'Sonnet';
    if (lines.length <= 8) return 'Short Poem';
    return 'Free Verse';
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
   * Format screenplay/script content with industry standards
   */
  private static formatScript(text: string): string {
    const lines = text.split('\n');
    let result: string[] = [];
    let title = '';
    let genre = '';

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (!trimmed) {
        result.push('<div class="mb-2"></div>');
        return;
      }

      // Detect title and genre
      if (index === 0 && trimmed.match(/^(Title:|.*?[A-Z][a-z].*)/)) {
        title = trimmed.replace(/^Title:\s*/, '');
        return;
      }

      if (trimmed.match(/^Genre:\s*/i)) {
        genre = trimmed.replace(/^Genre:\s*/i, '');
        return;
      }

      // Scene heading (Slugline) - INT./EXT. LOCATION - TIME
      if (trimmed.match(/^(INT\.|EXT\.)\s+/i)) {
        result.push(`<div class="script-slugline font-bold text-gray-900 bg-gray-800 text-white p-3 mb-4 rounded-t-lg">
          ${trimmed.toUpperCase()}
        </div>`);
        return;
      }

      // Character name (ALL CAPS line, centered)
      if (trimmed.match(/^[A-Z\s]{2,}$/) && trimmed.length < 30) {
        result.push(`<div class="script-character font-bold text-center text-blue-700 mt-6 mb-2 text-lg">
          ${trimmed}
        </div>`);
        return;
      }

      // Parentheticals (stage directions in parentheses)
      if (trimmed.match(/^\([^)]+\)$/)) {
        result.push(`<div class="script-parenthetical italic text-center text-gray-600 text-sm mb-2">
          ${trimmed}
        </div>`);
        return;
      }

      // Dialogue (under character name)
      if (result.length > 0 && result[result.length - 1].includes('script-character')) {
        result.push(`<div class="script-dialogue text-center text-gray-800 mb-4 max-w-md mx-auto leading-relaxed">
          ${trimmed}
        </div>`);
        return;
      }

      // Action/Description (everything else)
      result.push(`<div class="script-action text-gray-700 mb-3 leading-relaxed max-w-2xl">
        ${trimmed}
      </div>`);
    });

    // Add title and genre header if present
    let header = '';
    if (title || genre) {
      header = `<div class="text-center mb-8 pb-4 border-b border-gray-300">
        ${title ? `<h1 class="text-2xl font-bold text-gray-900 mb-2">${title}</h1>` : ''}
        ${genre ? `<div class="text-gray-600 italic">${genre}</div>` : ''}
      </div>`;
    }

    return `<div class="screenplay bg-gray-50 p-8 rounded-xl border border-gray-300 font-mono">
      ${header}
      ${result.join('\n')}
    </div>`;
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
   * Format research paper with academic structure
   */
  private static formatResearchPaper(text: string): string {
    const lines = text.split('\n');
    let result: string[] = [];
    let inAbstract = false;

    lines.forEach(line => {
      const trimmed = line.trim();

      if (!trimmed) {
        result.push('<div class="mb-4"></div>');
        return;
      }

      // Main title
      if (trimmed.match(/^#\s+(.+)$/)) {
        const title = trimmed.replace(/^#\s+/, '');
        result.push(`<div class="text-center mb-8 pb-6 border-b-2 border-blue-200">
          <h1 class="text-3xl font-bold text-blue-800 mb-4">${title}</h1>
          <div class="text-gray-600 italic">Academic Research Paper</div>
        </div>`);
        return;
      }

      // Major sections (Abstract, Introduction, etc.)
      if (trimmed.match(/^##\s+(Abstract|Introduction|Literature Review|Methodology|Results|Findings|Discussion|Conclusion|References)$/i)) {
        const section = trimmed.replace(/^##\s+/, '');
        inAbstract = section.toLowerCase() === 'abstract';

        result.push(`<div class="mt-8 mb-6">
          <h2 class="text-xl font-bold text-blue-700 bg-blue-50 px-4 py-2 rounded-lg border-l-4 border-blue-600">
            ${section}
          </h2>
        </div>`);
        return;
      }

      // Subsections
      if (trimmed.match(/^##\s+(.+)$/)) {
        const subsection = trimmed.replace(/^##\s+/, '');
        result.push(`<h3 class="text-lg font-semibold text-blue-600 mt-6 mb-3 border-b border-blue-200 pb-1">
          ${subsection}
        </h3>`);
        return;
      }

      // Sub-subsections
      if (trimmed.match(/^###\s+(.+)$/)) {
        const subsubsection = trimmed.replace(/^###\s+/, '');
        result.push(`<h4 class="text-md font-medium text-blue-500 mt-4 mb-2">
          ${subsubsection}
        </h4>`);
        return;
      }

      // Regular paragraphs
      if (trimmed.length > 0) {
        const className = inAbstract ?
          "text-gray-700 leading-relaxed mb-4 bg-gray-50 p-4 rounded-lg italic" :
          "text-gray-700 leading-relaxed mb-4 text-justify";

        result.push(`<p class="${className}">${trimmed}</p>`);
      }
    });

    return `<div class="research-paper bg-white p-8 rounded-xl border border-blue-200 max-w-4xl mx-auto">
      ${result.join('\n')}
    </div>`;
  }

  /**
   * Format feasibility study with business structure
   */
  private static formatFeasibilityStudy(text: string): string {
    const lines = text.split('\n');
    let result: string[] = [];
    let currentSection = '';

    lines.forEach(line => {
      const trimmed = line.trim();

      if (!trimmed) {
        result.push('<div class="mb-4"></div>');
        return;
      }

      // Main title
      if (trimmed.match(/^#\s+(.+)$/)) {
        const title = trimmed.replace(/^#\s+/, '');
        result.push(`<div class="text-center mb-8 pb-6 border-b-2 border-emerald-200">
          <h1 class="text-3xl font-bold text-emerald-800 mb-4">${title}</h1>
          <div class="text-gray-600 italic">Business Feasibility Study</div>
        </div>`);
        return;
      }

      // Major business sections
      if (trimmed.match(/^##\s+(Executive Summary|Market Analysis|Technical Feasibility|Financial Feasibility|Financial Analysis|Operational Plan|Risk Assessment|Conclusion|Recommendations?)$/i)) {
        const section = trimmed.replace(/^##\s+/, '');
        currentSection = section.toLowerCase();

        const sectionIcons: {[key: string]: string} = {
          'executive summary': '📋',
          'market analysis': '📊',
          'technical feasibility': '⚙️',
          'financial feasibility': '💰',
          'financial analysis': '💰',
          'operational plan': '🚀',
          'risk assessment': '⚠️',
          'conclusion': '✅',
          'recommendations': '💡'
        };

        const icon = sectionIcons[currentSection] || '📄';

        result.push(`<div class="mt-8 mb-6">
          <h2 class="text-xl font-bold text-emerald-700 bg-emerald-100 px-6 py-4 rounded-lg border-l-4 border-emerald-600 flex items-center">
            <span class="text-2xl mr-3">${icon}</span>
            ${section}
          </h2>
        </div>`);
        return;
      }

      // Subsections
      if (trimmed.match(/^##\s+(.+)$/)) {
        const subsection = trimmed.replace(/^##\s+/, '');
        result.push(`<h3 class="text-lg font-semibold text-emerald-600 mt-6 mb-3 border-b border-emerald-200 pb-2">
          ${subsection}
        </h3>`);
        return;
      }

      // Key metrics or numbers (detect financial data)
      if (trimmed.match(/\$[\d,]+|\d+%|\d+\s*(months?|years?)/)) {
        result.push(`<div class="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-500 mb-4">
          <p class="text-emerald-800 font-medium">${trimmed}</p>
        </div>`);
        return;
      }

      // Bullet points for lists
      if (trimmed.match(/^[\-•]\s+(.+)$/)) {
        const content = trimmed.replace(/^[\-•]\s+/, '');
        result.push(`<div class="flex items-start space-x-3 mb-2">
          <span class="text-emerald-600 font-bold mt-1">•</span>
          <span class="text-gray-700">${content}</span>
        </div>`);
        return;
      }

      // Regular paragraphs
      if (trimmed.length > 0) {
        const isExecutiveSummary = currentSection === 'executive summary';
        const className = isExecutiveSummary ?
          "text-gray-700 leading-relaxed mb-4 bg-gray-50 p-4 rounded-lg font-medium" :
          "text-gray-700 leading-relaxed mb-4";

        result.push(`<p class="${className}">${trimmed}</p>`);
      }
    });

    return `<div class="feasibility-study bg-white p-8 rounded-xl border border-emerald-200 max-w-4xl mx-auto">
      ${result.join('\n')}
    </div>`;
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