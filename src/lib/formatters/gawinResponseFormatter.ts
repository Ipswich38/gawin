/**
 * Gawin Response Formatting System
 * Provides structured, visual formatting for AI responses
 */

export interface FormattingGuidelines {
  useStructuredLayout: boolean;
  includeStatusEmojis: boolean;
  useVisualHierarchy: boolean;
  organizeInSections: boolean;
}

export class GawinResponseFormatter {

  /**
   * Generate comprehensive formatting instructions based on content type
   */
  static getFormattingInstructions(): string {
    return `
## MASTER FORMATTING GUIDE FOR AI RESPONSES

Format all responses according to content type with clean, professional structure. Avoid excessive decoration while maintaining clarity.

### CONTENT-SPECIFIC FORMATTING:

**1. General Responses**
Use clean hierarchy with natural paragraph breaks:

**Introduction**
Brief context setting with natural flow.

**Main Points**
1. First main point with clear explanation
2. Second main point with supporting details
3. Third main point with logical conclusion

**Summary**
Concise conclusion tying key points together.

**2. Poems**
Structure: Preserve line breaks and stanzas exactly.

**Title of the Poem**

Stanza 1 Line 1
Stanza 1 Line 2
Stanza 1 Line 3

Stanza 2 Line 1
Stanza 2 Line 2

**3. Lyrics**
Structure: Separate verses, choruses, and bridges.

**Song Title** – *Artist*

[Verse 1]
Line 1 of verse
Line 2 of verse

[Chorus]
Line 1 of chorus
Line 2 of chorus

**4. Research Papers**
Structure: Abstract, Introduction, Methods, Results, Discussion, References

# Title of the Research Paper

## Abstract
Brief summary of the research.

## Introduction
Background and objectives.

## Methods
- Method 1: Description
- Method 2: Description

## Results
- Key finding 1
- Key finding 2

## Discussion
Interpretation of results.

## References
- [1] Author, Title, Journal, Year

**5. Business Reports**
Structure: Executive Summary, Introduction, Data/Analysis, Recommendations, Conclusion

# Business Report: [Title]

## Executive Summary
Brief overview of findings.

## Introduction
Purpose and scope.

## Data/Analysis
- **Metric 1:** Data and analysis
- **Metric 2:** Data and analysis

## Recommendations
- Action 1
- Action 2

## Conclusion
Summary and next steps.

**6. Lists and Enumerations**
Use Cases: Steps, features, or items.
- Use numbered lists (1., 2., 3.) for sequences, steps, or rankings
- Use bullet points (-) for features, items, or non-sequential information
- Keep list items concise and parallel in structure

**7. Long Paragraph Management**
Rule: Split paragraphs longer than 3-4 sentences.

Methods:
- **By Topic:** Separate distinct ideas into paragraphs
- **By Example:** Use bullet points for examples or details
- **By Emphasis:** Highlight key points in bold or italics

Example transformation:
**Original:** Long paragraph with multiple ideas mixed together.

**Formatted Version:**
First key concept explained clearly.

- **Healthcare:** AI is used for diagnostics and personalized treatment plans
- **Finance:** AI algorithms analyze market trends and detect fraud

Second key concept with proper emphasis on **important terms**.

### FORMATTING RULES:
- Single blank line between paragraphs
- Single blank line after section headers
- Use **bold** for section headers and key terms only
- Use numbered lists for sequences, bullet points for items
- Split long paragraphs (3-4 sentences max per paragraph)
- Preserve meaning while improving readability

### SYMBOL USAGE GUIDELINES:
- → Only for genuine process flows or cause-and-effect relationships
- ! Only for truly critical information requiring emphasis
- Avoid decorative symbols: ─, ∴, ◦, ∎, ※
- Use standard markdown: **bold**, *italic*, numbered lists, bullet points

### CONTENT ADAPTATION:
- **Poems:** Preserve line breaks and stanzas exactly as written
- **Lyrics:** Use [Verse], [Chorus], [Bridge] structure with proper line breaks
- **Technical Content:** Use clear sections with numbered steps
- **Educational Content:** Break into digestible chunks with examples
- **Research Content:** Follow academic structure with proper sections
- **Business Content:** Use executive summary format with clear recommendations

### CORE PRINCIPLE:
Format for clarity and readability, not decoration. Every formatting choice should serve the reader's understanding. Always follow formatting rules strictly while preserving the original meaning and intent of the content.

### PARAGRAPH SPLITTING DIRECTIVE:
When encountering paragraphs longer than 3-4 sentences:
1. Identify distinct ideas or topics
2. Separate by topic into shorter paragraphs
3. Use bullet points for examples, lists, or supporting details
4. Highlight key concepts in **bold** for emphasis
5. Maintain logical flow and coherence between sections
`;
  }

  /**
   * Auto-detect content type and format accordingly
   */
  static detectContentType(content: string): string {
    const lowerContent = content.toLowerCase();

    // Check for poems (multiple line breaks, poetic structure)
    if (content.includes('\n\n') && content.match(/^.+$/gm)?.some(line => line.length < 50)) {
      return 'poem';
    }

    // Check for lyrics (contains [Verse], [Chorus], etc.)
    if (content.includes('[Verse') || content.includes('[Chorus') || content.includes('[Bridge')) {
      return 'lyrics';
    }

    // Check for research papers (contains abstract, methods, results)
    if (lowerContent.includes('abstract') && (lowerContent.includes('methods') || lowerContent.includes('results'))) {
      return 'research';
    }

    // Check for business reports (contains executive summary, recommendations)
    if (lowerContent.includes('executive summary') || lowerContent.includes('recommendations')) {
      return 'business';
    }

    // Check for lists (starts with numbers or bullets)
    if (content.match(/^[\d]+\./gm) || content.match(/^[-•*]/gm)) {
      return 'list';
    }

    return 'general';
  }

  /**
   * Format response sections for better readability with auto-detection
   */
  static formatResponse(content: string, responseType: 'explanation' | 'instruction' | 'summary' | 'casual' = 'explanation'): string {
    const contentType = this.detectContentType(content);

    // Split long paragraphs (3-4 sentences max)
    const formatted = this.splitLongParagraphs(content);

    // Apply content-specific formatting based on detected type
    switch (contentType) {
      case 'poem':
        return this.formatPoem(formatted);
      case 'lyrics':
        return this.formatLyrics(formatted);
      case 'research':
        return this.formatResearchPaper(formatted);
      case 'business':
        return this.formatBusinessReport(formatted);
      case 'list':
        return this.formatList(formatted);
      default:
        return this.formatGeneral(formatted);
    }
  }

  /**
   * Split long paragraphs into shorter, more readable sections
   */
  static splitLongParagraphs(content: string): string {
    const paragraphs = content.split('\n\n');
    const result: string[] = [];

    for (const paragraph of paragraphs) {
      const sentences = paragraph.split(/(?<=[.!?])\s+/);

      if (sentences.length > 4) {
        // Split by topic or use bullet points for examples
        const chunks = [];
        for (let i = 0; i < sentences.length; i += 3) {
          chunks.push(sentences.slice(i, i + 3).join(' '));
        }
        result.push(...chunks);
      } else {
        result.push(paragraph);
      }
    }

    return result.join('\n\n');
  }

  /**
   * Format general content with clean hierarchy
   */
  static formatGeneral(content: string): string {
    // Ensure proper spacing and structure
    return content.replace(/\n{3,}/g, '\n\n').trim();
  }

  /**
   * Format poems with preserved line breaks
   */
  static formatPoem(content: string): string {
    const lines = content.split('\n');
    if (lines.length > 0 && !lines[0].startsWith('**')) {
      lines[0] = `**${lines[0]}**`;
    }
    return lines.join('\n');
  }

  /**
   * Format lyrics with verse/chorus structure
   */
  static formatLyrics(content: string): string {
    return content.replace(/\[([^\]]+)\]/g, '\n[$1]');
  }

  /**
   * Format research papers with proper sections
   */
  static formatResearchPaper(content: string): string {
    return content
      .replace(/^([A-Z][^.!?]*?)$/gm, '## $1')
      .replace(/^## ## /gm, '# ');
  }

  /**
   * Format business reports with clear structure
   */
  static formatBusinessReport(content: string): string {
    return content
      .replace(/Executive Summary/gi, '## Executive Summary')
      .replace(/Recommendations/gi, '## Recommendations')
      .replace(/Conclusion/gi, '## Conclusion');
  }

  /**
   * Format lists with proper numbering and bullets
   */
  static formatList(content: string): string {
    const lines = content.split('\n');
    let listCounter = 1;

    return lines.map(line => {
      if (line.match(/^[\d]+\./)) {
        return line.replace(/^[\d]+\./, `${listCounter++}.`);
      }
      return line;
    }).join('\n');
  }

  /**
   * Add section headers and organization to content
   */
  static addStructure(content: string): string {
    // Auto-detect content patterns and add appropriate headers
    const lines = content.split('\n');
    let structured = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect list items and ensure proper formatting
      if (line.match(/^[\d]+\./)) {
        // Ensure sequential numbering
        const listNumber = structured.split('\n').filter(l => l.match(/^[\d]+\./)).length + 1;
        structured += line.replace(/^[\d]+\./, `${listNumber}.`) + '\n';
      } else {
        structured += line + '\n';
      }
    }

    return structured;
  }

  /**
   * Enhance Filipino expressions in formatted content
   */
  static enhanceFilipinoExpressions(content: string): string {
    // Add emphasis to common Filipino expressions
    const expressions = [
      { pattern: /\b(grabe|sobrang|ang galing|wow)\b/gi, replacement: '**$1**' },
      { pattern: /\b(kasi|naman|ba|eh)\b/gi, replacement: '*$1*' },
      { pattern: /\b(oo nga|tama ka|ayos yan)\b/gi, replacement: '**$1**' },
    ];

    let enhanced = content;
    expressions.forEach(({ pattern, replacement }) => {
      enhanced = enhanced.replace(pattern, replacement);
    });

    return enhanced;
  }
}

export default GawinResponseFormatter;