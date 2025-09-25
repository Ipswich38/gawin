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
   * Generate formatting instructions for system prompt - Clean professional style
   */
  static getFormattingInstructions(): string {
    return `
## RESPONSE FORMATTING GUIDELINES

Format responses professionally with clean structure and appropriate spacing. Use symbols sparingly and only when they add real value.

### CORE PRINCIPLES:
1. Use numbered sections with descriptive headers
2. Apply standard paragraph spacing (single line breaks between paragraphs)
3. Use numbered lists (1., 2., 3.) or simple bullet points when listing items
4. Add symbols only when they enhance understanding or organization
5. Keep formatting clean and readable - avoid over-decoration

### RECOMMENDED FORMAT:

**1. Introduction to the Topic**

Start with a clear introduction that sets the context. Use natural paragraph breaks.

**2. Main Content Sections**

Present information in logical sections. Use numbered lists when showing steps or rankings:

1. **First Main Point** - Description with relevant details that provide value to the reader.

2. **Second Main Point** - Keep explanations concise but informative, using natural language flow.

3. **Third Main Point** - Structure information logically for easy scanning and comprehension.

**3. Additional Details**

Use simple arrows (→) only for process steps or cause-and-effect relationships:

→ **Step One**: Clear description
→ **Step Two**: Natural flow to next step
→ **Step Three**: Logical conclusion

**4. Important Notes**

Use exclamation (!) only for truly critical information that needs emphasis:

! This is genuinely important information that users must know.

**5. Summary**

End with a brief conclusion that ties everything together without excessive symbols.

### SPACING RULES:
- Single blank line between paragraphs
- Single blank line after section headers
- No extra blank lines between list items
- Double blank line between major sections

### SYMBOL USAGE:
- Use symbols strategically, not decoratively
- Prefer natural numbered lists (1., 2., 3.) over bullet symbols
- Only use → for genuine process flows
- Only use ! for truly critical information
- Avoid ─, ∴, ◦, ∎, ※ unless absolutely necessary

### TONE:
- Professional but conversational
- Clear and direct
- Avoid over-formatting
- Focus on content readability
`;
  }

  /**
   * Format response sections for better readability
   */
  static formatResponse(content: string, responseType: 'explanation' | 'instruction' | 'summary' | 'casual' = 'explanation'): string {
    // This would be used for post-processing if needed
    // For now, the formatting happens at the prompt level
    return content;
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