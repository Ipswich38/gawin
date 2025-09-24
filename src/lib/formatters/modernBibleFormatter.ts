/**
 * Modern Bible-Verse Inspired Formatter for Gawin
 * Clean, minimalist formatting inspired by modern Bible layouts
 * Designed for young generation with line icons instead of emojis
 */

export interface ModernFormattingOptions {
  enableNumbering: boolean;
  useMinimalIcons: boolean;
  preserveStructure: boolean;
  mobileOptimized: boolean;
}

export interface FormattedSection {
  id: string;
  type: 'main_topic' | 'section' | 'subsection' | 'list' | 'explanation' | 'note';
  content: string;
  icon?: string;
  number?: number;
}

export interface FormattedContent {
  title?: string;
  sections: FormattedSection[];
  metadata: {
    wordCount: number;
    readingTime: number;
    hasLists: boolean;
    hasCode: boolean;
  };
}

export class ModernBibleFormatter {
  private static sectionIcons = {
    main_topic: '─', // Simple line
    section: '•', // Bullet point
    subsection: '│', // Vertical line
    list: '→', // Arrow
    explanation: '∴', // Therefore symbol
    note: '※', // Reference mark
    important: '!', // Exclamation
    tip: '↗', // Arrow up-right
    warning: '△', // Triangle
    example: '◦', // Small circle
    summary: '═', // Double line
    conclusion: '∎' // End of proof symbol
  };

  /**
   * Generate formatting instructions for system prompt
   */
  static getFormattingInstructions(): string {
    return `
## MODERN MINIMALIST RESPONSE FORMAT

Format ALL responses using this clean, Bible-verse inspired structure that appeals to young users.

### FORMATTING RULES:
1. Use simple line icons (─ • │ → ∴ ※) instead of emojis
2. Number main sections clearly like Bible verses
3. Keep visual hierarchy clean and minimal
4. Use consistent spacing and indentation
5. Make content scannable and digestible

### STRUCTURE TEMPLATE:

**1. [TOPIC TITLE]**
─ Brief introduction or context

**2. KEY POINTS:**
• First important point
• Second important point
• Third important point

**3. HOW IT WORKS:**
→ Step one explanation
→ Step two explanation
→ Step three explanation

**4. IMPORTANT NOTES:**
! Critical information to remember
△ Warning or limitation
※ Additional reference or tip

**5. EXAMPLES:**
◦ First example with clear explanation
◦ Second example with clear explanation

**6. SUMMARY:**
═ Main takeaway or conclusion
∎ Final thought or next steps

### VISUAL GUIDELINES:
- Use **bold** for section headers and important terms
- Use consistent indentation (2 spaces after icons)
- Separate sections with single blank line
- Keep paragraphs short (2-3 sentences max)
- Use active voice and conversational tone
- Make it feel modern and accessible to young users

### SPACING RULES:
- Single line break between different sections
- Double line break only before major topics
- Consistent 2-space indentation after icons
- No excessive white space

This format should feel clean, organized, and easy to scan on mobile devices.
`;
  }

  /**
   * Format content using modern Bible-verse inspired layout
   */
  static format(content: string, options: ModernFormattingOptions = {
    enableNumbering: true,
    useMinimalIcons: true,
    preserveStructure: true,
    mobileOptimized: true
  }): FormattedContent {

    const sections = this.parseContentIntoSections(content);
    const metadata = this.analyzeContent(content);

    return {
      sections,
      metadata
    };
  }

  /**
   * Parse content into structured sections
   */
  private static parseContentIntoSections(content: string): FormattedSection[] {
    const sections: FormattedSection[] = [];
    const lines = content.split('\n').filter(line => line.trim());

    let currentSection = 1;
    let currentSubsection = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) continue;

      // Detect section types based on patterns
      if (this.isMainTopic(line)) {
        sections.push({
          id: `section-${currentSection}`,
          type: 'main_topic',
          content: this.cleanContent(line),
          icon: '─',
          number: currentSection++
        });
      } else if (this.isSubSection(line)) {
        currentSubsection++;
        sections.push({
          id: `subsection-${currentSection}-${currentSubsection}`,
          type: 'subsection',
          content: this.cleanContent(line),
          icon: '•',
          number: currentSubsection
        });
      } else if (this.isListItem(line)) {
        sections.push({
          id: `list-${Date.now()}-${i}`,
          type: 'list',
          content: this.cleanContent(line),
          icon: '→'
        });
      } else if (this.isImportantNote(line)) {
        sections.push({
          id: `note-${Date.now()}-${i}`,
          type: 'note',
          content: this.cleanContent(line),
          icon: '!'
        });
      } else {
        // Regular content
        sections.push({
          id: `content-${Date.now()}-${i}`,
          type: 'explanation',
          content: this.cleanContent(line),
          icon: '∴'
        });
      }
    }

    return sections;
  }

  /**
   * Clean content by removing old emojis and formatting
   */
  private static cleanContent(content: string): string {
    return content
      // Remove 3D emojis and most emojis, keep only essential ones
      .replace(/[🎯🔧📊✅❌⚠️💡🚀🛡️📝🎨📱🔄💻🎉👍📚🧠]/g, '')
      // Remove multiple hashtags
      .replace(/^#{1,6}\s*/, '')
      // Remove excessive bold formatting
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Detect if line is a main topic
   */
  private static isMainTopic(line: string): boolean {
    return /^#{1,2}\s/.test(line) ||
           /^\*\*.*\*\*:?\s*$/.test(line) ||
           /^[A-Z][A-Z\s]+:?\s*$/.test(line);
  }

  /**
   * Detect if line is a subsection
   */
  private static isSubSection(line: string): boolean {
    return /^#{3,4}\s/.test(line) ||
           /^[A-Z][a-z\s]+:$/.test(line);
  }

  /**
   * Detect if line is a list item
   */
  private static isListItem(line: string): boolean {
    return /^[-•*]\s/.test(line) || /^\d+\.\s/.test(line);
  }

  /**
   * Detect if line is an important note
   */
  private static isImportantNote(line: string): boolean {
    return /\b(important|note|warning|tip|remember|caution)\b/i.test(line);
  }

  /**
   * Analyze content metadata
   */
  private static analyzeContent(content: string): FormattedContent['metadata'] {
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
    const hasLists = /^[-•*]\s|^\d+\.\s/m.test(content);
    const hasCode = /```|`[^`]+`/.test(content);

    return {
      wordCount,
      readingTime,
      hasLists,
      hasCode
    };
  }

  /**
   * Render formatted content to string
   */
  static renderToString(formattedContent: FormattedContent): string {
    let output = '';

    if (formattedContent.title) {
      output += `**${formattedContent.title}**\n\n`;
    }

    formattedContent.sections.forEach((section, index) => {
      switch (section.type) {
        case 'main_topic':
          output += `**${section.number}. ${section.content}**\n`;
          output += `${section.icon} `;
          break;

        case 'subsection':
          output += `**${section.content}:**\n`;
          break;

        case 'list':
          output += `${section.icon}  ${section.content}\n`;
          break;

        case 'note':
          output += `${section.icon}  ${section.content}\n`;
          break;

        case 'explanation':
          output += `${section.icon}  ${section.content}\n`;
          break;
      }

      // Add spacing between sections
      if (index < formattedContent.sections.length - 1) {
        const nextSection = formattedContent.sections[index + 1];
        if (section.type === 'main_topic' || nextSection.type === 'main_topic') {
          output += '\n';
        }
      }
    });

    return output.trim();
  }
}

export default ModernBibleFormatter;