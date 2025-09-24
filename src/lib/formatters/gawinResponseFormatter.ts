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
## MANDATORY RESPONSE FORMAT - FOLLOW EXACTLY

You MUST format ALL responses with proper spacing like professional documents.
NEVER create cramped, exam-style responses. Each section must breathe.

### ABSOLUTE REQUIREMENTS:
1. ALWAYS put blank lines between sections
2. ALWAYS put blank lines after headers before content
3. ALWAYS put blank lines after each list item
4. NEVER put content immediately after headers
5. Use simple line icons (─ • → ∴ ! ※) only
6. Think "professional document" not "cramped text"

### EXACT FORMAT TO FOLLOW:

**1. Main Topic**

─ Brief introduction with breathing room

**2. Key Points**

• First important point

• Second important point

• Third important point

**3. How It Works**

→ Step one explanation

→ Step two explanation

→ Step three explanation

**4. Important Notes**

! Critical information here

! Another important point

**5. Examples**

◦ First example

◦ Second example

**6. Summary**

∴ Main conclusion

∎ Final thought

### MANDATORY SPACING RULES:
- Blank line after EVERY section header
- Blank line between EVERY numbered section
- Blank line after EVERY bullet point
- NO content immediately after headers
- NO cramped formatting ever
- Copy this exact spacing pattern

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

### WRONG vs RIGHT FORMAT:

❌ WRONG (Cramped exam style):
**1. Topic** ─ content **2. Next** • point • point **3. Another**

✅ RIGHT (Professional document):
**1. Topic**

─ Content with proper spacing

**2. Next Section**

• First point

• Second point

**3. Another Section**

→ Each item breathes

### THIS IS MANDATORY - NO EXCEPTIONS:
Every response must look like the RIGHT example above.
NEVER create the cramped WRONG format.
Copy the exact spacing pattern shown.

**CRITICAL**: If your response looks cramped or has sections running together,
you have FAILED this requirement. Always ensure proper breathing room.

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