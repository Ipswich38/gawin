/**
 * Response Filter Service for Gawin
 * Ensures clean, natural, and well-formatted responses
 * Removes thinking processes, formulaic patterns, and formatting issues
 */

export interface FilteredResponse {
  content: string;
  wasFiltered: boolean;
  filtersApplied: string[];
}

class ResponseFilterService {
  private formulaicPatterns = [
    // Repetitive opening phrases
    /^You're asking great questions!.*?natural when learning something new\./gi,
    /^I can sense you might be feeling.*?completely natural/gi,
    /^That's.*?great question.*?let me help/gi,
    /^I understand your.*?I'm here to help/gi,
    
    // Repetitive closing phrases  
    /Remember, learning is a process.*?trust yourself as you learn\./gi,
    /You're capable of understanding this.*?trust yourself.*?learn\./gi,
    /Feel free to ask.*?staying curious.*?great.*?questions/gi,
    /I'm here to support.*?learning journey.*?ask.*?questions/gi,
  ];

  private thinkingPatterns = [
    // Thinking process leakage - comprehensive patterns
    /<think>[\s\S]*?<\/think>/gi,
    /<thinking>[\s\S]*?<\/thinking>/gi,
    /\[thinking\][\s\S]*?\[\/thinking\]/gi,
    /\*thinks\*[\s\S]*?\*\/thinks\*/gi,
    /\(thinking:[\s\S]*?\)/gi,
    /Let me think[\s\S]*?\.{3,}/gi,
    
    // Additional thinking patterns from user example
    /I need to[\s\S]*?step by step/gi,
    /Let me analyze[\s\S]*?approach/gi,
    /I should[\s\S]*?consider/gi,
    /Looking at[\s\S]*?I can see/gi,
    /Based on[\s\S]*?understanding/gi,
    /From my[\s\S]*?perspective/gi,
    
    // Meta-cognitive patterns
    /I'm thinking[\s\S]*?about/gi,
    /My reasoning[\s\S]*?process/gi,
    /I'll consider[\s\S]*?factors/gi,
    /Let me break this down[\s\S]*?systematically/gi,
    
    // Process exposure patterns
    /Here's my[\s\S]*?thought process/gi,
    /My approach[\s\S]*?would be/gi,
    /I'll work[\s\S]*?through this/gi,
    /Step-by-step[\s\S]*?analysis/gi,
  ];

  private regexArtifacts = [
    // Regex patterns that leaked into responses
    /\/\^.*?\$\/gi?s?/g,
    /\\[wWdDsSnrtbfv]\+/g,
    /\[\^\]\+/g,
    /\(\?\:.*?\)/g,
    /\\\(/g,
    /\\\)/g,
  ];

  private dynamicResponseStarters = [
    "Let's dive into this!",
    "Great question!",
    "I'd be happy to help with that.",
    "That's an interesting point.",
    "Let me break this down for you.",
    "Here's what I can tell you:",
    "Excellent observation!",
    "That's a thoughtful question.",
    "I see what you're getting at.",
    "Let me explain this clearly:",
    "That's worth exploring.",
    "Here's how this works:",
    "Good thinking!",
    "Let me walk you through this.",
    "That's exactly right to ask about."
  ];

  private dynamicResponseEnders = [
    "Hope this helps!",
    "Let me know if you need more details.",
    "Does this answer your question?",
    "Feel free to ask if anything's unclear.",
    "Happy to explain further if needed.",
    "Is there anything specific you'd like me to clarify?",
    "Let me know what else you'd like to explore.",
    "Any other questions about this?",
    "I'm here if you need more information.",
    "What would you like to know next?",
    "Hope that makes sense!",
    "Anything else I can help with?",
    "Let me know how this works for you.",
    "Feel free to dive deeper into any part.",
    ""  // Sometimes no ender is best
  ];

  /**
   * Fix malformed numbered lists (1. 1. 1. → 1. 2. 3.)
   */
  private fixNumberedLists(content: string): string {
    const lines = content.split('\n');
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

      // Check if this continues a numbered list with wrong numbering
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

  /**
   * Main filtering method - cleans and improves response quality
   */
  filterResponse(content: string): FilteredResponse {
    let filtered = content;
    const filtersApplied: string[] = [];
    let wasFiltered = false;

    // CRITICAL: Fix numbered lists as first priority
    const originalListLength = filtered.length;
    filtered = this.fixNumberedLists(filtered);
    if (filtered.length !== originalListLength || filtered !== content) {
      filtersApplied.push('numbered-list-fix');
      wasFiltered = true;
    }

    // Remove thinking process leakage
    const originalLength = filtered.length;
    this.thinkingPatterns.forEach((pattern, index) => {
      if (pattern.test(filtered)) {
        filtered = filtered.replace(pattern, '').trim();
        filtersApplied.push(`thinking-pattern-${index}`);
        wasFiltered = true;
      }
    });

    // Remove formulaic patterns
    this.formulaicPatterns.forEach((pattern, index) => {
      if (pattern.test(filtered)) {
        filtered = filtered.replace(pattern, '').trim();
        filtersApplied.push(`formulaic-pattern-${index}`);
        wasFiltered = true;
      }
    });

    // Remove regex artifacts
    this.regexArtifacts.forEach((pattern, index) => {
      if (pattern.test(filtered)) {
        filtered = filtered.replace(pattern, '').trim();
        filtersApplied.push(`regex-artifact-${index}`);
        wasFiltered = true;
      }
    });

    // Fix formatting issues
    const formattingFixed = this.fixFormatting(filtered);
    if (formattingFixed !== filtered) {
      filtered = formattingFixed;
      filtersApplied.push('formatting-fixed');
      wasFiltered = true;
    }

    // Add dynamic variety if response was heavily filtered
    if (wasFiltered && filtered.length < originalLength * 0.3) {
      filtered = this.addDynamicVariety(filtered);
      filtersApplied.push('dynamic-variety-added');
    }

    // Final cleanup
    filtered = this.finalCleanup(filtered);

    return {
      content: filtered,
      wasFiltered,
      filtersApplied
    };
  }

  /**
   * Fix formatting inconsistencies
   */
  private fixFormatting(content: string): string {
    let fixed = content;

    // Fix numbering issues handled above already

    // Reduce excessive asterisks
    fixed = fixed.replace(/\*{3,}/g, '**'); // Multiple asterisks -> bold
    fixed = fixed.replace(/\*\*([^*]+)\*\*\s*\*\*([^*]+)\*\*/g, '**$1 $2**'); // Merge consecutive bold

    // Clean up spacing
    fixed = fixed.replace(/\n{3,}/g, '\n\n'); // Too many newlines
    fixed = fixed.replace(/\s{2,}/g, ' '); // Multiple spaces
    fixed = fixed.replace(/\.\s*\./g, '.'); // Double periods

    // Fix bullet points
    fixed = fixed.replace(/^\s*[-•]\s+/gm, '• '); // Consistent bullets

    // Fix code formatting
    fixed = fixed.replace(/`{3,}/g, '```'); // Consistent code blocks

    return fixed.trim();
  }


  /**
   * Add dynamic variety to responses
   */
  private addDynamicVariety(content: string): string {
    if (!content.trim()) return content;

    // Add dynamic starter if response is too abrupt
    if (content.length < 50 && !content.match(/^(Here|Let|I|This|That|The)/)) {
      const randomStarter = this.dynamicResponseStarters[
        Math.floor(Math.random() * this.dynamicResponseStarters.length)
      ];
      content = `${randomStarter} ${content}`;
    }

    // Add dynamic ender occasionally
    if (Math.random() < 0.3 && !content.match(/[.!?]$/)) {
      const randomEnder = this.dynamicResponseEnders[
        Math.floor(Math.random() * this.dynamicResponseEnders.length)
      ];
      if (randomEnder) content += ` ${randomEnder}`;
    }

    return content;
  }

  /**
   * Final cleanup of response
   */
  private finalCleanup(content: string): string {
    return content
      .replace(/\s+/g, ' ') // Normalize spaces
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Max 2 consecutive newlines
      .replace(/[.!?]{2,}/g, '.') // Remove multiple punctuation
      .trim();
  }

  /**
   * Check if response needs filtering
   */
  needsFiltering(content: string): boolean {
    return this.thinkingPatterns.some(pattern => pattern.test(content)) ||
           this.formulaicPatterns.some(pattern => pattern.test(content)) ||
           this.regexArtifacts.some(pattern => pattern.test(content)) ||
           content.includes('<think>') ||
           content.includes('You\'re asking great questions!');
  }
}

export const responseFilterService = new ResponseFilterService();