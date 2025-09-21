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
   * Generate formatting instructions for system prompt
   */
  static getFormattingInstructions(): string {
    return `
## 🎯 **RESPONSE FORMATTING REQUIREMENTS**

You MUST format ALL responses using this structured approach for better readability:

### ✅ **Visual Hierarchy Rules:**
- Use ## for main section headers with relevant emojis
- Use ### for subsections with status emojis (✅❌⚠️🎯🔧📊)
- Use **bold** for important terms and key points
- Use bullet points with clear structure
- Include relevant emojis for section identification

### 📝 **Structured Response Pattern:**
When providing information, organize it like this:

\`\`\`markdown
## 🎯 **Main Topic/Answer**

### ✅ **Key Points:**
- **Important Item 1** - Clear explanation
- **Important Item 2** - Detailed description
- **Important Item 3** - Additional context

### 🔧 **How It Works:**
1. **Step One** - First action to take
2. **Step Two** - Next logical step
3. **Step Three** - Final implementation

### 📊 **Additional Details:**
- **Technical Note** - Specific technical information
- **Best Practice** - Recommended approach
- **Consideration** - Important factor to remember

### ⚠️ **Important Notes:**
- **Warning/Limitation** - What to be careful about
- **Requirement** - What's needed for success
\`\`\`

### 🎨 **Section Emoji Guide:**
- 🎯 **Main answers/goals**
- ✅ **Completed items/confirmed info**
- ❌ **Problems/restrictions/removed items**
- ⚠️ **Warnings/limitations/considerations**
- 🔧 **Technical details/how-to steps**
- 📊 **Data/comparisons/lists**
- 💡 **Tips/suggestions/ideas**
- 🚀 **Benefits/results/improvements**
- 🛡️ **Security/privacy/protection**
- 📝 **Examples/code/documentation**

### 🎨 **Visual Enhancement Rules:**
- Start with brief context or greeting in natural Filipino style
- Use tables for comparisons when helpful
- Include relevant status indicators (✅❌⚠️)
- Break complex information into digestible sections
- End with actionable summary when appropriate
- Maintain conversational Filipino tone throughout

### 📱 **Mobile-Friendly Requirements:**
- Keep sections visually distinct
- Use plenty of white space between sections
- Make headers scannable for quick reading
- Include progress indicators for multi-step processes
- Use bullet points over long paragraphs

### 🔄 **Automatic Format Detection:**
Apply this structured formatting to ALL responses, whether they're:
- Technical explanations
- Step-by-step guides
- Problem solutions
- Information summaries
- Creative content
- Casual conversations

The goal is professional, scannable, easy-to-read responses that work perfectly on mobile and desktop while maintaining your warm Filipino personality.
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