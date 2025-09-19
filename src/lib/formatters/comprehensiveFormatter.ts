/**
 * New Formatting Assistant for Gawin AI
 * Implements the new formatting rules based on content type detection
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
   * Enhanced content type detection based on new formatting rules
   */
  static detectContentType(text: string): ContentType {
    const lines = text.split('\n').filter(line => line.trim());
    const lowerText = text.toLowerCase();

    // Check for song lyrics - enhanced detection
    if (text.match(/🎵/) ||
        text.match(/\[(verse|chorus|bridge|outro|intro|pre-chorus)\]/i) ||
        lowerText.includes('verse') && lowerText.includes('chorus') ||
        (lines.length > 4 && lines.length < 50 &&
         lines.filter(line => line.length < 80).length > lines.length * 0.7)) {
      return 'song';
    }

    // Check for script/screenplay formatting
    if (text.match(/^(INT\.|EXT\.)/m) ||
        text.match(/^[A-Z\s]{3,20}$/m) ||
        text.match(/^(Title:|Genre:)/m) ||
        text.match(/^\([^)]+\)$/m)) {
      return 'script';
    }

    // Check for poems - refined detection
    if ((lines.length >= 3 && lines.length <= 25) &&
        lines.every(line => line.length < 100) &&
        !text.includes('#') &&
        !text.match(/^\d+\./m) &&
        text.split(/\s+/).length < 200) {
      return 'poem';
    }

    // Check for research papers
    if (text.match(/^#{1,2}\s+(Abstract|Introduction|Methodology|Results|Discussion|Conclusion)/im)) {
      return 'research';
    }

    // Check for business/feasibility reports
    if (text.match(/^#{1,2}\s+(Executive Summary|Market Analysis|Financial|Technical|Operational)/im) ||
        text.match(/\$[\d,]+|\d+%|ROI|revenue|profit|investment/i)) {
      return 'business';
    }

    // Check for story structure
    if (text.match(/^#{1,2}\s+Chapter \d+/m) ||
        (text.includes('"') && text.match(/(said|asked|whispered|shouted)/))) {
      return 'story';
    }

    // Check for creative writing
    if (text.match(/^#\s+[A-Z]/m) && text.split(/\s+/).length > 200) {
      return 'creative';
    }

    // Check for enumerations/lists
    if (text.match(/^\d+\./m) || text.match(/^[\-•]/m)) {
      return 'enumeration';
    }

    return 'general';
  }

  /**
   * Main formatting function based on content type
   */
  static formatText(text: string, contentType?: ContentType, options: FormattingOptions = {}): string {
    const type = contentType || this.detectContentType(text);

    // Apply content-specific formatting
    switch (type) {
      case 'song':
        return this.formatSongLyrics(text);
      case 'poem':
        return this.formatPoetry(text);
      case 'script':
        return this.formatScript(text);
      case 'story':
        return this.formatStorybook(text);
      case 'business':
        return this.formatBusinessDocument(text);
      case 'research':
        return this.formatResearchPaper(text);
      case 'creative':
        return this.formatCreativeWriting(text);
      case 'enumeration':
        return this.formatEnumeration(text);
      default:
        return this.formatGeneral(text);
    }
  }

  /**
   * 🎵 Song Lyrics Formatting
   */
  private static formatSongLyrics(text: string): string {
    const lines = text.split('\n');
    let result: string[] = [];
    let hasTitle = false;

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (!trimmed) {
        result.push('<br/>'); // Line break between sections
        return;
      }

      // Song title (first line or with 🎵)
      if ((index === 0 && !hasTitle) || trimmed.match(/^🎵\s*/)) {
        const title = trimmed.replace(/^🎵\s*/, '');
        result.push(`<h1 class="text-2xl font-bold text-purple-700 text-center mb-6">🎵 ${title}</h1>`);
        hasTitle = true;
        return;
      }

      // Section labels [Verse 1], [Chorus], etc.
      if (trimmed.match(/^\[(Verse|Chorus|Bridge|Outro|Intro|Pre-Chorus).*?\]$/i)) {
        result.push(`<h3 class="text-lg font-semibold text-purple-600 mt-6 mb-3 bg-purple-50 px-3 py-1 rounded-md inline-block">
          ${trimmed.replace(/[\[\]]/g, '')}
        </h3>`);
        return;
      }

      // Regular lyric lines - capitalize first letter
      if (trimmed.length > 0) {
        const capitalizedLine = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        result.push(`<p class="text-gray-700 leading-relaxed mb-1 pl-4">${capitalizedLine}</p>`);
      }
    });

    return `<div class="song-lyrics bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
      ${result.join('\n')}
    </div>`;
  }

  /**
   * ✒️ Poetry Formatting
   */
  private static formatPoetry(text: string): string {
    const lines = text.split('\n');
    let result: string[] = [];
    let title = '';

    // Extract title (first line if it looks like a title)
    if (lines.length > 0 && lines[0].trim().length < 50 && !lines[0].match(/^[a-z]/)) {
      title = lines[0].trim();
      lines.shift();
    }

    // Add title
    if (title) {
      result.push(`<h2 class="text-xl font-bold text-indigo-700 text-center mb-6 italic">${title}</h2>`);
    }

    // Process poem lines with stanza breaks
    let currentStanza: string[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();

      if (trimmed === '') {
        // Stanza break
        if (currentStanza.length > 0) {
          result.push('<div class="mb-4">');
          currentStanza.forEach(stanzaLine => {
            result.push(`<p class="text-gray-700 leading-relaxed">${stanzaLine}</p>`);
          });
          result.push('</div>');
          currentStanza = [];
        }
      } else {
        currentStanza.push(trimmed);
      }
    });

    // Add final stanza
    if (currentStanza.length > 0) {
      result.push('<div class="mb-4">');
      currentStanza.forEach(stanzaLine => {
        result.push(`<p class="text-gray-700 leading-relaxed">${stanzaLine}</p>`);
      });
      result.push('</div>');
    }

    return `<div class="poem bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200 text-center">
      ${result.join('\n')}
    </div>`;
  }

  /**
   * 🎬 Scriptwriting Formatting
   */
  private static formatScript(text: string): string {
    const lines = text.split('\n');
    let result: string[] = [];
    let title = '';
    let genre = '';

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (!trimmed) {
        result.push('<br/>');
        return;
      }

      // Title and genre detection
      if (trimmed.match(/^Title:\s*/i)) {
        title = trimmed.replace(/^Title:\s*/i, '');
        return;
      }
      if (trimmed.match(/^Genre:\s*/i)) {
        genre = trimmed.replace(/^Genre:\s*/i, '');
        return;
      }

      // Scene headings - INT./EXT. format
      if (trimmed.match(/^(INT\.|EXT\.)/i)) {
        result.push(`<div class="font-bold text-gray-900 bg-gray-100 p-3 mb-4 rounded">
          ${trimmed.toUpperCase()}
        </div>`);
        return;
      }

      // Character names (ALL CAPS)
      if (trimmed.match(/^[A-Z\s]{3,30}$/) && trimmed.length < 30) {
        result.push(`<div class="font-bold text-center text-blue-700 mt-6 mb-2">
          ${trimmed}
        </div>`);
        return;
      }

      // Parentheticals (stage directions)
      if (trimmed.match(/^\([^)]+\)$/)) {
        result.push(`<div class="italic text-center text-gray-600 text-sm mb-2">
          ${trimmed}
        </div>`);
        return;
      }

      // Dialogue or action
      result.push(`<div class="text-gray-700 mb-3 leading-relaxed text-center max-w-md mx-auto">
        ${trimmed}
      </div>`);
    });

    // Header with title and genre
    let header = '';
    if (title || genre) {
      header = `<div class="text-center mb-8 pb-4 border-b">
        ${title ? `<h1 class="text-2xl font-bold mb-2">${title}</h1>` : ''}
        ${genre ? `<div class="text-gray-600 italic">${genre}</div>` : ''}
      </div>`;
    }

    return `<div class="screenplay bg-gray-50 p-8 rounded-xl border font-mono">
      ${header}
      ${result.join('\n')}
    </div>`;
  }

  /**
   * 📚 Storybook Formatting
   */
  private static formatStorybook(text: string): string {
    let formatted = text;

    // Chapter headers
    formatted = formatted.replace(/^#{1,2}\s+(Chapter \d+.*?)$/gm,
      '<h2 class="text-xl font-bold text-green-600 mt-8 mb-4 text-center">$1</h2>');

    // Dialogue formatting
    formatted = formatted.replace(/^"([^"]+)"$/gm,
      '<div class="italic text-gray-600 my-3 pl-4 border-l-2 border-gray-300">"$1"</div>');

    // Break into paragraphs
    const paragraphs = formatted.split('\n\n');
    const result = paragraphs.map(paragraph => {
      if (paragraph.trim() && !paragraph.includes('<h') && !paragraph.includes('<div')) {
        return `<p class="mb-4 leading-relaxed text-gray-700">${paragraph.trim()}</p>`;
      }
      return paragraph;
    }).join('\n');

    return `<div class="storybook bg-green-50 p-6 rounded-xl border border-green-200">
      ${result}
    </div>`;
  }

  /**
   * 📊 Business/Feasibility Document Formatting
   */
  private static formatBusinessDocument(text: string): string {
    let formatted = text;

    // Fix sequential numbering first
    formatted = this.fixSequentialNumbering(formatted);

    // Section headers with emojis
    formatted = formatted.replace(/^#{1,2}\s+(Executive Summary|Market Analysis|Financial|Technical|Operational|Risk|Conclusion).*?$/gm,
      '<h2 class="text-xl font-bold text-emerald-700 bg-emerald-100 px-4 py-3 rounded-lg mt-8 mb-4">📊 $1</h2>');

    // Subsection headers
    formatted = formatted.replace(/^#{2,3}\s+(.+)$/gm,
      '<h3 class="text-lg font-semibold text-emerald-600 mt-6 mb-3 border-b border-emerald-200 pb-1">$1</h3>');

    // Numbered lists
    formatted = formatted.replace(/^(\d+)\.\s+(.+)$/gm,
      '<div class="flex items-start space-x-3 mb-3"><span class="font-bold text-emerald-600 flex-shrink-0">$1.</span><span class="flex-1">$2</span></div>');

    // Bullet points
    formatted = formatted.replace(/^[\-•]\s+(.+)$/gm,
      '<div class="flex items-start space-x-3 mb-2 ml-6"><span class="text-emerald-600">•</span><span class="flex-1">$1</span></div>');

    return `<div class="business-document bg-emerald-50 p-6 rounded-xl border border-emerald-200">
      ${formatted}
    </div>`;
  }

  /**
   * 📖 Research Paper Formatting
   */
  private static formatResearchPaper(text: string): string {
    let formatted = text;

    // Main title
    formatted = formatted.replace(/^#\s+(.+)$/gm,
      '<h1 class="text-3xl font-bold text-blue-800 text-center mb-8 pb-4 border-b-2 border-blue-200">$1</h1>');

    // Major sections
    formatted = formatted.replace(/^#{2}\s+(Abstract|Introduction|Methodology|Results|Discussion|Conclusion|References)$/gm,
      '<h2 class="text-xl font-bold text-blue-700 bg-blue-50 px-4 py-2 rounded-lg border-l-4 border-blue-600 mt-8 mb-4">$1</h2>');

    // Subsections
    formatted = formatted.replace(/^#{3}\s+(.+)$/gm,
      '<h3 class="text-lg font-semibold text-blue-600 mt-6 mb-3">$1</h3>');

    // Paragraphs
    const paragraphs = formatted.split('\n\n');
    const result = paragraphs.map(paragraph => {
      if (paragraph.trim() && !paragraph.includes('<h')) {
        return `<p class="mb-4 leading-relaxed text-gray-700 text-justify">${paragraph.trim()}</p>`;
      }
      return paragraph;
    }).join('\n');

    return `<div class="research-paper bg-blue-50 p-8 rounded-xl border border-blue-200">
      ${result}
    </div>`;
  }

  /**
   * 🖼️ Creative Writing Formatting
   */
  private static formatCreativeWriting(text: string): string {
    let formatted = text;

    // Title
    formatted = formatted.replace(/^#\s+(.+)$/gm,
      '<h1 class="text-2xl font-bold text-indigo-700 text-center mb-6">$1</h1>');

    // Headers
    formatted = formatted.replace(/^#{2,3}\s+(.+)$/gm,
      '<h3 class="text-lg font-semibold text-indigo-600 mt-6 mb-3">$1</h3>');

    // Break into paragraphs
    const paragraphs = formatted.split('\n\n');
    const result = paragraphs.map(paragraph => {
      if (paragraph.trim() && !paragraph.includes('<h')) {
        return `<p class="mb-4 leading-relaxed text-gray-700">${paragraph.trim()}</p>`;
      }
      return paragraph;
    }).join('\n');

    return `<div class="creative-writing bg-indigo-50 p-6 rounded-xl border border-indigo-200">
      ${result}
    </div>`;
  }

  /**
   * Enumeration/List Formatting
   */
  private static formatEnumeration(text: string): string {
    let formatted = this.fixSequentialNumbering(text);

    // Section headers
    formatted = formatted.replace(/^#{2,3}\s+(.+)$/gm,
      '<h3 class="text-lg font-bold text-blue-600 mt-6 mb-3">$1</h3>');

    // Numbered lists with proper sequence
    formatted = formatted.replace(/^(\d+)\.\s+(.+)$/gm,
      '<div class="flex items-start space-x-3 mb-3"><span class="font-bold text-blue-600 flex-shrink-0">$1.</span><span class="flex-1">$2</span></div>');

    // Sub-bullets
    formatted = formatted.replace(/^[\-•]\s+(.+)$/gm,
      '<div class="flex items-start space-x-3 mb-2 ml-6"><span class="text-blue-600">•</span><span class="flex-1">$1</span></div>');

    return formatted;
  }

  /**
   * General text formatting
   */
  private static formatGeneral(text: string): string {
    let formatted = text;

    // Basic markdown support
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Headers
    formatted = formatted.replace(/^#{1,3}\s+(.+)$/gm,
      '<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">$1</h3>');

    // Paragraphs
    const paragraphs = formatted.split('\n\n');
    const result = paragraphs.map(paragraph => {
      if (paragraph.trim() && !paragraph.includes('<h')) {
        return `<p class="mb-3 leading-relaxed text-gray-700">${paragraph.trim()}</p>`;
      }
      return paragraph;
    }).join('\n');

    return result;
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

      // Not a numbered list item - reset list state
      if (trimmedLine.length > 0 && !trimmedLine.match(/^\d+\.\s+/)) {
        inList = false;
        listNumber = 1;
      }

      return line;
    }).join('\n');
  }
}