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
   * Generate formatting instructions for system prompt - Modern Bible-verse inspired
   */
  static getFormattingInstructions(): string {
    return `
## MODERN MINIMALIST RESPONSE FORMAT

Format ALL responses using this clean, Bible-verse inspired structure that appeals to young users.
NO 3D EMOJIS. Use only simple line icons and clean typography.

### FORMATTING RULES:
1. Use simple line icons (─ • → ∴ ! ※) instead of 3D emojis
2. Number main sections clearly like Bible verses
3. Keep visual hierarchy clean and minimal
4. Use consistent spacing and indentation
5. Make content scannable and digestible
6. Appeal to young generation with modern, clean design

### STRUCTURE TEMPLATE:

**1. Main Topic**

─ Brief introduction or key context


**2. Key Points**

• First important point with clear explanation

• Second important point with details

• Third important point with context


**3. How It Works**

→ Step one with clear action

→ Step two with next logical step

→ Step three with final implementation


**4. Important Notes**

! Critical information to remember

! Warning or limitation to consider

※ Additional tip or reference


**5. Examples**

◦ First practical example

◦ Second practical example


**6. Summary**

∴ Main takeaway or conclusion

∎ Final thought or next steps

### NUMBERED SECTIONS FORMATTING:
- Always use format: **1. Section Name** (not **1. Section Name:**)
- Keep section titles concise and descriptive
- Follow with blank line, then icon and content
- Maintain consistent numbering throughout response
- Each numbered section should be visually distinct

### LINE ICON GUIDE:
- ─ Main topic markers
- • Key points and features
- → Steps and processes
- ∴ Explanations and reasoning
- ! Important notes and warnings
- ※ Tips and additional info
- ◦ Examples and illustrations
- ∎ Conclusions and summaries
- │ Quotes and references
- ═ Major conclusions

### VISUAL GUIDELINES:
- Use **bold** for section headers and key terms only
- Keep paragraphs short (2-3 sentences max)
- **CRITICAL**: Always add blank lines between sections and items
- **CRITICAL**: Put each bullet point on its own line with blank line after
- **CRITICAL**: Separate numbered sections with double blank lines
- No excessive formatting or decoration
- Clean, scannable layout for mobile users

### SPACING REQUIREMENTS:
- Blank line after each section header
- Blank line after each bullet point or list item
- Double blank line between major numbered sections
- This creates visual breathing room for easy reading

### TONE FOR YOUNG USERS:
- Modern and accessible language
- Direct and conversational
- No overwhelming formatting
- Focus on clarity and usefulness
- Maintain warm Filipino personality without excessive emojis

This format should feel clean, organized, and appealing to young users who prefer minimalist design.
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