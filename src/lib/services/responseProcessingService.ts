/**
 * Response Processing Service
 * Handles AI response formatting, thinking separation, and content type detection
 * Implements Mistral's recommendations for consistent formatting
 */

export interface ProcessedResponse {
  thinking: string;
  response: string;
  contentType: 'code' | 'explanation' | 'analysis' | 'mixed' | 'ascii-art';
  hasCodeBlocks: boolean;
  hasASCIIArt: boolean;
  hasMath: boolean;
  estimatedReadTime: number;
  codeLanguages: string[];
}

export interface ResponseFormattingOptions {
  separateThinking?: boolean;
  preserveASCII?: boolean;
  enableCodeEditor?: boolean;
  enforceMarkdown?: boolean;
}

export class ResponseProcessingService {
  private static thinkingPatterns = [
    // Common thinking indicators
    /^(Let me think about this|I need to consider|First, let me|Let me analyze|I'll start by)/i,

    // Explicit thinking markers
    /\*\*Thinking:\*\*(.+?)(?=\*\*Response:\*\*|\*\*Answer:\*\*|\n\n[A-Z])/i,
    /\*thinking\*(.+?)(?=\*response\*|\*answer\*|\n\n)/i,
    /<thinking>(.*?)<\/thinking>/i,

    // Internal monologue patterns
    /^.*?(?=Here's|Now I'll|The answer|To solve|Based on)/,

    // Question analysis patterns
    /^.*?(?=\n\n|\n[A-Z][^a-z]*:|\n#{1,6}\s)/
  ];

  private static asciiPatterns = [
    // Box drawing characters
    /[│┌┐└┘├┤┬┴┼─═║╔╗╚╝╠╣╦╩╬]/,

    // ASCII art indicators
    /^\s*[_\-=~`'",.\\/\|]+\s*$/m,

    // Diagram patterns
    /^\s*[\+\-\|]+\s*$/m,

    // Tree structures
    /^\s*[├└│]\s/m,

    // Calculator layouts
    /\[.*?\]\s*\[.*?\]\s*\[.*?\]/
  ];

  private static codeLanguages = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
    'html', 'css', 'scss', 'sql', 'bash', 'shell', 'json', 'xml', 'yaml',
    'markdown', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'dart'
  ];

  /**
   * Separates thinking process from actual response
   */
  static separateThinking(content: string): { thinking: string; response: string } {
    // Try each pattern to find thinking vs response
    for (const pattern of this.thinkingPatterns) {
      const match = content.match(pattern);
      if (match) {
        const thinking = match[0].trim();
        const response = content.replace(pattern, '').trim();

        // Validate separation quality
        if (thinking.length > 20 && response.length > 20 && thinking !== response) {
          return { thinking, response };
        }
      }
    }

    // If no clear separation found, check if entire content looks like thinking
    if (this.isThinkingContent(content)) {
      return { thinking: content, response: '' };
    }

    return { thinking: '', response: content };
  }

  /**
   * Determines if content is primarily thinking/internal process
   */
  private static isThinkingContent(content: string): boolean {
    const thinkingIndicators = [
      'let me think', 'i need to', 'first, i should', 'i\'ll analyze',
      'considering', 'looking at this', 'thinking about', 'analyzing'
    ];

    const lowerContent = content.toLowerCase();
    const indicatorCount = thinkingIndicators.filter(indicator =>
      lowerContent.includes(indicator)
    ).length;

    return indicatorCount >= 2 || content.length < 100;
  }

  /**
   * Detects ASCII art in content
   */
  static detectASCIIArt(content: string): boolean {
    // Check for ASCII art patterns
    for (const pattern of this.asciiPatterns) {
      if (pattern.test(content)) {
        return true;
      }
    }

    // Check for consistent spacing/alignment (potential ASCII art)
    const lines = content.split('\n');
    if (lines.length < 3) return false;

    const alignedLines = lines.filter(line =>
      line.trim().length > 0 && (line.startsWith(' ') || line.includes('|') || line.includes('+'))
    );

    return alignedLines.length >= Math.min(3, lines.length * 0.5);
  }

  /**
   * Detects code blocks and extracts languages
   */
  static detectCodeBlocks(content: string): { hasCode: boolean; languages: string[] } {
    const codeBlockPattern = /```(\w+)?\n([\s\S]*?)```/g;
    const languages: string[] = [];
    let hasCode = false;

    let match;
    while ((match = codeBlockPattern.exec(content)) !== null) {
      hasCode = true;
      const language = match[1];
      if (language && this.codeLanguages.includes(language.toLowerCase())) {
        languages.push(language.toLowerCase());
      }
    }

    // Also check for inline code
    if (!hasCode) {
      hasCode = /`[^`]+`/.test(content);
    }

    return { hasCode, languages };
  }

  /**
   * Detects mathematical content
   */
  static detectMath(content: string): boolean {
    const mathPatterns = [
      /\$\$[\s\S]*?\$\$/,  // Display math
      /\$[^$\n]*\$/,       // Inline math
      /\\[a-zA-Z]+\{/,     // LaTeX commands
      /\\\(/,              // LaTeX inline math
      /\\\[/               // LaTeX display math
    ];

    return mathPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Estimates reading time (words per minute)
   */
  static estimateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  }

  /**
   * Determines content type based on analysis
   */
  static determineContentType(
    hasCode: boolean,
    hasASCII: boolean,
    hasMath: boolean,
    content: string
  ): ProcessedResponse['contentType'] {
    if (hasASCII) return 'ascii-art';
    if (hasCode && content.split('```').length > 3) return 'code';
    if (hasMath || content.includes('formula') || content.includes('equation')) return 'analysis';
    if (hasCode || content.includes('function') || content.includes('algorithm')) return 'mixed';
    return 'explanation';
  }

  /**
   * Ensures content follows Markdown standards
   */
  static enforceMarkdownStandards(content: string): string {
    let formatted = content;

    // Ensure code blocks have language specification
    formatted = formatted.replace(/```\n/g, '```text\n');

    // Fix heading spacing
    formatted = formatted.replace(/^(#{1,6})\s*(.+)$/gm, '$1 $2');

    // Ensure list formatting
    formatted = formatted.replace(/^(\s*)-\s+/gm, '$1- ');
    formatted = formatted.replace(/^(\s*)\d+\.\s+/gm, '$1$2. ');

    // Fix table formatting
    formatted = formatted.replace(/\|([^|]+)\|/g, (match, content) => {
      return `| ${content.trim()} |`;
    });

    // Ensure proper line breaks
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    return formatted.trim();
  }

  /**
   * Main processing function
   */
  static processResponse(
    rawContent: string,
    options: ResponseFormattingOptions = {}
  ): ProcessedResponse {
    const {
      separateThinking = true,
      preserveASCII = true,
      enableCodeEditor = true,
      enforceMarkdown = true
    } = options;

    // Separate thinking from response
    const { thinking, response } = separateThinking
      ? this.separateThinking(rawContent)
      : { thinking: '', response: rawContent };

    // Analyze content
    const hasASCIIArt = preserveASCII ? this.detectASCIIArt(response) : false;
    const { hasCode, languages } = this.detectCodeBlocks(response);
    const hasMath = this.detectMath(response);
    const estimatedReadTime = this.estimateReadTime(response);
    const contentType = this.determineContentType(hasCode, hasASCIIArt, hasMath, response);

    // Format content if requested
    const finalResponse = enforceMarkdown
      ? this.enforceMarkdownStandards(response)
      : response;

    const finalThinking = enforceMarkdown && thinking
      ? this.enforceMarkdownStandards(thinking)
      : thinking;

    return {
      thinking: finalThinking,
      response: finalResponse,
      contentType,
      hasCodeBlocks: hasCode,
      hasASCIIArt,
      hasMath,
      estimatedReadTime,
      codeLanguages: languages
    };
  }

  /**
   * Format response for AI to ensure consistent output
   */
  static getFormattingPrompt(): string {
    return `
Please format your response following these guidelines:

1. **Code Blocks**: Always wrap code in triple backticks with language specification:
   \`\`\`python
   def example():
       return "Hello World"
   \`\`\`

2. **ASCII Art**: For diagrams, layouts, or visual representations, use plain text in code blocks:
   \`\`\`text
   ┌─────────┐
   │  Layout │
   └─────────┘
   \`\`\`

3. **Structure**: Use clear headings, bullet points, and numbered lists for organization.

4. **Separation**: If you need to show your thinking process, clearly separate it from your final answer.

5. **Consistency**: Use standard Markdown formatting throughout.
`;
  }
}