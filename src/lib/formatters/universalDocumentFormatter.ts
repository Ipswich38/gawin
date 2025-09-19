/**
 * Universal Document Formatter for Gawin AI
 * Comprehensive document type detection and professional formatting
 * Based on the enhanced specification for dramatic formatting improvements
 */

export type DocumentType =
  | 'script'
  | 'feasibility'
  | 'business_report'
  | 'research_paper'
  | 'proposal'
  | 'resume'
  | 'letter'
  | 'manual'
  | 'presentation'
  | 'contract'
  | 'poem'
  | 'lyrics'
  | 'list'
  | 'recipe'
  | 'essay'
  | 'text';

export interface DocumentDetectionResult {
  documentType: DocumentType;
  confidence: number;
  keywords: string[];
}

export interface DocumentFormattingOptions {
  preserveOriginalFormatting?: boolean;
  addProfessionalStyling?: boolean;
  includeHeaders?: boolean;
  useStandardSpacing?: boolean;
}

export class UniversalDocumentFormatter {

  /**
   * Enhanced document type detection with comprehensive keyword matching
   */
  static detectDocumentType(message: string): DocumentDetectionResult {
    const lowerMessage = message.toLowerCase();

    // Document type detection patterns with confidence scoring
    const documentTypes = {
      script: {
        keywords: ['movie script', 'screenplay', 'script for', 'dialogue', 'scene', 'character', 'fade in', 'int.', 'ext.'],
        confidence: 0.9
      },
      feasibility: {
        keywords: ['feasibility study', 'business feasibility', 'project feasibility', 'market analysis', 'viability'],
        confidence: 0.95
      },
      business_report: {
        keywords: ['business report', 'financial report', 'quarterly report', 'annual report', 'executive summary'],
        confidence: 0.9
      },
      research_paper: {
        keywords: ['research paper', 'academic paper', 'thesis', 'dissertation', 'abstract', 'methodology'],
        confidence: 0.95
      },
      proposal: {
        keywords: ['business proposal', 'project proposal', 'proposal for', 'investment proposal'],
        confidence: 0.9
      },
      resume: {
        keywords: ['resume', 'cv', 'curriculum vitae', 'work experience', 'education'],
        confidence: 0.95
      },
      letter: {
        keywords: ['formal letter', 'business letter', 'cover letter', 'complaint letter'],
        confidence: 0.85
      },
      manual: {
        keywords: ['user manual', 'instruction manual', 'guide', 'handbook', 'tutorial'],
        confidence: 0.9
      },
      presentation: {
        keywords: ['presentation', 'slide deck', 'powerpoint', 'slides', 'keynote'],
        confidence: 0.9
      },
      contract: {
        keywords: ['contract', 'agreement', 'terms and conditions', 'legal document'],
        confidence: 0.95
      },
      poem: {
        keywords: ['poem', 'poetry', 'verse', 'stanza', 'rhyme', 'haiku', 'sonnet'],
        confidence: 0.9
      },
      lyrics: {
        keywords: ['song lyrics', 'lyrics', 'song', 'chorus', 'verse', 'bridge'],
        confidence: 0.9
      },
      list: {
        keywords: ['list of', 'steps to', 'how to', 'instructions', 'ways to', 'methods'],
        confidence: 0.8
      },
      recipe: {
        keywords: ['recipe for', 'cooking', 'ingredients', 'preparation', 'cook time'],
        confidence: 0.95
      },
      essay: {
        keywords: ['essay', 'article', 'blog post', 'opinion piece', 'analysis'],
        confidence: 0.8
      }
    };

    let bestMatch: DocumentDetectionResult = {
      documentType: 'text' as DocumentType,
      confidence: 0,
      keywords: []
    };

    for (const [type, config] of Object.entries(documentTypes)) {
      const matchedKeywords = config.keywords.filter(keyword =>
        lowerMessage.includes(keyword)
      );

      if (matchedKeywords.length > 0) {
        const confidence = (matchedKeywords.length / config.keywords.length) * config.confidence;

        if (confidence > bestMatch.confidence) {
          bestMatch = {
            documentType: type as DocumentType,
            confidence,
            keywords: matchedKeywords
          };
        }
      }
    }

    return bestMatch;
  }

  /**
   * Get comprehensive formatting instructions for each document type
   */
  static getFormattingInstructions(documentType: DocumentType): string {
    const instructions = {
      script: `Format as a proper movie script with:
- Scene headings in ALL CAPS (INT./EXT. LOCATION - TIME)
- Character names in ALL CAPS before dialogue
- Action lines in regular text
- Dialogue indented
- Parentheticals in (brackets)
- Use proper script formatting with line breaks

Example:
FADE IN:

INT. COFFEE SHOP - DAY

JOHN sits alone at a corner table, nervously checking his watch.

JOHN
(anxiously)
Where is she?

MARY enters, scanning the room.`,

      feasibility: `Format as a professional feasibility study with:
- **EXECUTIVE SUMMARY**
- **PROJECT DESCRIPTION**
- **MARKET ANALYSIS**
- **TECHNICAL FEASIBILITY**
- **FINANCIAL PROJECTIONS**
- **RISK ASSESSMENT**
- **CONCLUSION AND RECOMMENDATIONS**

Use proper headers, bullet points, and sections with clear spacing.`,

      business_report: `Format as a professional business report with:
- **TITLE PAGE INFORMATION**
- **EXECUTIVE SUMMARY**
- **TABLE OF CONTENTS**
- **INTRODUCTION**
- **MAIN SECTIONS** (numbered headings)
- **DATA ANALYSIS** (organized format)
- **CONCLUSIONS AND RECOMMENDATIONS**

Use proper business formatting with clear sections and professional structure.`,

      research_paper: `Format as an academic research paper with:
- **TITLE**
- **ABSTRACT**
- **INTRODUCTION**
- **LITERATURE REVIEW**
- **METHODOLOGY**
- **RESULTS**
- **DISCUSSION**
- **CONCLUSION**
- **REFERENCES**

Use proper academic formatting with clear section breaks and numbered citations.`,

      proposal: `Format as a business proposal with:
- **COVER PAGE**
- **EXECUTIVE SUMMARY**
- **PROBLEM STATEMENT**
- **PROPOSED SOLUTION**
- **TIMELINE**
- **BUDGET**
- **TEAM/COMPANY INFORMATION**
- **CONCLUSION**

Use professional formatting with clear sections and compelling structure.`,

      resume: `Format as a professional resume with:
- **CONTACT INFORMATION**
- **PROFESSIONAL SUMMARY**
- **WORK EXPERIENCE** (dates, companies, positions)
- **EDUCATION**
- **SKILLS**
- **CERTIFICATIONS** (if applicable)

Use bullet points, proper spacing, and professional layout.`,

      letter: `Format as a formal business letter with:
- **DATE**
- **RECIPIENT ADDRESS**
- **SALUTATION**
- **BODY PARAGRAPHS**
- **CLOSING**
- **SIGNATURE LINE**

Use proper business letter formatting and professional tone.`,

      manual: `Format as a user manual with:
- **TABLE OF CONTENTS**
- **INTRODUCTION**
- **STEP-BY-STEP INSTRUCTIONS**
- **NUMBERED PROCEDURES**
- **SAFETY WARNINGS** (if applicable)
- **TROUBLESHOOTING SECTION**

Use clear headings, organized sections, and easy-to-follow structure.`,

      presentation: `Format as presentation slides with:
- **SLIDE TITLES** (clear and descriptive)
- **BULLET POINTS** for content
- **CLEAR SLIDE BREAKS**
- **SPEAKER NOTES** if needed

Use "SLIDE X:" to denote new slides and maintain consistent structure.`,

      contract: `Format as a legal document with:
- **TITLE** and parties involved
- **NUMBERED CLAUSES**
- **CLEAR TERMS AND CONDITIONS**
- **SIGNATURE BLOCKS**

Use formal legal formatting and precise language.`,

      poem: `Format as poetry with:
- **TITLE** at the top
- **PROPER STANZA BREAKS**
- **LINE BREAKS** for verses
- **CONSISTENT RHYTHM/METER**

Use proper poetic formatting with centered alignment if appropriate.`,

      lyrics: `Format as song lyrics with:
- **SONG TITLE**
- **[VERSE 1], [CHORUS], [VERSE 2], [BRIDGE]** labels
- **PROPER LINE BREAKS**
- **STANZA SEPARATIONS**

Use standard song structure formatting with clear section labels.`,

      list: `Format as an organized list with:
- **NUMBERED ITEMS** (1., 2., 3.) or bullet points
- **CLEAR DESCRIPTIONS** for each item
- **PROPER SPACING** between items
- **SUBPOINTS** if needed (a., b., c.)

Ensure sequential numbering and logical organization.`,

      recipe: `Format as a recipe with:
- **RECIPE TITLE**
- **PREP TIME, COOK TIME, SERVINGS**
- **INGREDIENTS LIST** (with measurements)
- **STEP-BY-STEP INSTRUCTIONS**
- **NOTES OR TIPS SECTION**

Use clear organization and easy-to-follow format.`,

      essay: `Format as an essay with:
- **TITLE**
- **INTRODUCTION PARAGRAPH**
- **BODY PARAGRAPHS** with clear topic sentences
- **CONCLUSION**
- **PROPER PARAGRAPH BREAKS** and flow

Use academic essay structure with logical progression.`,

      text: 'Use proper formatting with clear structure, appropriate headings, and good spacing.'
    };

    return instructions[documentType] || instructions.text;
  }

  /**
   * Generate enhanced system prompt for Groq API with document-specific instructions
   */
  static generateSystemPrompt(documentType: DocumentType, userMessage: string): string {
    const formattingInstruction = this.getFormattingInstructions(documentType);

    return `You are Gawin, an AI assistant. The user is requesting a ${documentType.replace('_', ' ')} document.

CRITICAL FORMATTING INSTRUCTIONS:
${formattingInstruction}

IMPORTANT RULES:
1. ALWAYS use actual line breaks (\\n) in your response
2. Use double line breaks (\\n\\n) for paragraph/section separations
3. Use proper spacing and indentation where appropriate
4. Create well-structured, professionally formatted content
5. Ensure the output looks exactly like a real ${documentType.replace('_', ' ')} document
6. Use bold formatting (**text**) for headers and important sections
7. Use proper numbering for lists and sections
8. Maintain consistent formatting throughout the document

DOCUMENT TYPE: ${documentType.toUpperCase()}
USER REQUEST: "${userMessage}"

Your response must be properly formatted and ready to display with preserved line breaks and professional structure. Make it look like a real, professional ${documentType.replace('_', ' ')} that someone would use in business or academic settings.`;
  }

  /**
   * Apply document-specific CSS styling
   */
  static getDocumentStyles(documentType: DocumentType): string {
    const baseStyle = `
      white-space: pre-wrap;
      line-height: 1.6;
      font-family: inherit;
      word-wrap: break-word;
      overflow-wrap: break-word;
    `;

    const typeStyles = {
      script: `
        ${baseStyle}
        font-family: 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.5;
        margin: 20px 0;
      `,
      feasibility: `
        ${baseStyle}
        font-size: 14px;
        line-height: 1.8;
        margin: 20px 0;
      `,
      business_report: `
        ${baseStyle}
        font-size: 14px;
        line-height: 1.8;
        margin: 20px 0;
      `,
      research_paper: `
        ${baseStyle}
        font-size: 12px;
        line-height: 2.0;
        text-align: justify;
        margin: 20px 0;
      `,
      proposal: `
        ${baseStyle}
        font-size: 14px;
        line-height: 1.7;
        margin: 20px 0;
      `,
      resume: `
        ${baseStyle}
        font-size: 11px;
        line-height: 1.4;
        margin: 15px 0;
      `,
      letter: `
        ${baseStyle}
        font-size: 12px;
        line-height: 1.6;
        margin: 20px 0;
      `,
      manual: `
        ${baseStyle}
        font-size: 12px;
        line-height: 1.6;
        margin: 20px 0;
      `,
      presentation: `
        ${baseStyle}
        font-size: 16px;
        line-height: 1.5;
        margin: 25px 0;
      `,
      contract: `
        ${baseStyle}
        font-size: 11px;
        line-height: 1.8;
        font-family: 'Times New Roman', serif;
        margin: 20px 0;
      `,
      poem: `
        ${baseStyle}
        font-size: 14px;
        line-height: 1.4;
        text-align: center;
        margin: 30px 0;
      `,
      lyrics: `
        ${baseStyle}
        font-size: 14px;
        line-height: 1.4;
        text-align: center;
        margin: 30px 0;
      `,
      list: `
        ${baseStyle}
        font-size: 14px;
        line-height: 1.6;
        margin: 20px 0;
      `,
      recipe: `
        ${baseStyle}
        font-size: 14px;
        line-height: 1.6;
        margin: 20px 0;
      `,
      essay: `
        ${baseStyle}
        font-size: 14px;
        line-height: 1.8;
        text-align: justify;
        margin: 20px 0;
      `,
      text: baseStyle
    };

    return typeStyles[documentType] || typeStyles.text;
  }

  /**
   * Apply special highlighting and formatting for different document types
   */
  static applySpecialFormatting(content: string, documentType: DocumentType): string {
    let formattedContent = content;

    switch (documentType) {
      case 'script':
        // Highlight scene headers and character names
        formattedContent = content
          .split('\n')
          .map((line, index) => {
            const trimmedLine = line.trim();

            if (trimmedLine.match(/^(INT\.|EXT\.|FADE)/)) {
              return `<div style="font-weight: bold; margin: 20px 0 10px 0; font-size: 14px; text-transform: uppercase;">${line}</div>`;
            }
            if (trimmedLine.match(/^[A-Z][A-Z\s]+$/) && trimmedLine.length < 30 && trimmedLine.length > 2) {
              return `<div style="font-weight: bold; margin: 15px 0 5px 0; text-align: center; color: #0066cc;">${line}</div>`;
            }
            if (trimmedLine.startsWith('(') && trimmedLine.endsWith(')')) {
              return `<div style="font-style: italic; margin: 5px 0; text-align: center; color: #666;">${line}</div>`;
            }
            return `<div>${line || '<br>'}</div>`;
          })
          .join('');
        break;

      case 'business_report':
      case 'feasibility':
      case 'research_paper':
      case 'proposal':
        // Highlight headers and important sections
        formattedContent = content
          .split('\n')
          .map((line, index) => {
            const trimmedLine = line.trim();

            if (trimmedLine.match(/^\*\*.*\*\*$/) || trimmedLine.match(/^[A-Z][^a-z]*:?$/)) {
              return `<div style="font-weight: bold; margin: 25px 0 15px 0; font-size: 16px; color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 5px;">${line}</div>`;
            }
            if (trimmedLine.match(/^\d+\.\s+[A-Z]/)) {
              return `<div style="font-weight: bold; margin: 20px 0 10px 0; font-size: 15px; color: #0066cc;">${line}</div>`;
            }
            if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
              return `<div style="margin: 8px 0; padding-left: 20px;">${line}</div>`;
            }
            return `<div style="margin: 8px 0;">${line || '<br>'}</div>`;
          })
          .join('');
        break;

      case 'lyrics':
        // Highlight song structure labels
        formattedContent = content
          .split('\n')
          .map((line, index) => {
            const trimmedLine = line.trim();

            if (trimmedLine.match(/^\[.*\]$/)) {
              return `<div style="font-weight: bold; margin: 20px 0 10px 0; color: #0066cc; font-size: 14px; text-align: center; background: #f0f8ff; padding: 5px; border-radius: 5px;">${line}</div>`;
            }
            if (trimmedLine.match(/^\*\*.*\*\*$/)) {
              return `<div style="font-weight: bold; margin: 25px 0 15px 0; font-size: 18px; text-align: center; color: #0066cc;">${line}</div>`;
            }
            return `<div style="text-align: center; margin: 5px 0;">${line || '<br>'}</div>`;
          })
          .join('');
        break;

      case 'poem':
        // Center-align and style poems
        formattedContent = content
          .split('\n')
          .map((line, index) => {
            const trimmedLine = line.trim();

            if (trimmedLine.match(/^\*\*.*\*\*$/)) {
              return `<div style="font-weight: bold; margin: 25px 0 20px 0; font-size: 18px; text-align: center; color: #0066cc;">${line}</div>`;
            }
            return `<div style="text-align: center; margin: 6px 0; line-height: 1.4;">${line || '<br>'}</div>`;
          })
          .join('');
        break;

      case 'presentation':
        // Format slides
        formattedContent = content
          .split('\n')
          .map((line, index) => {
            const trimmedLine = line.trim();

            if (trimmedLine.match(/^SLIDE \d+:/i)) {
              return `<div style="font-weight: bold; margin: 30px 0 20px 0; font-size: 18px; color: #0066cc; border-top: 3px solid #0066cc; padding-top: 15px;">${line}</div>`;
            }
            if (trimmedLine.match(/^\*\*.*\*\*$/)) {
              return `<div style="font-weight: bold; margin: 20px 0 10px 0; font-size: 16px; color: #0066cc;">${line}</div>`;
            }
            if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
              return `<div style="margin: 10px 0; padding-left: 25px; font-size: 14px;">${line}</div>`;
            }
            return `<div style="margin: 10px 0;">${line || '<br>'}</div>`;
          })
          .join('');
        break;

      default:
        // Default formatting with basic enhancements
        formattedContent = content
          .split('\n')
          .map((line, index) => {
            const trimmedLine = line.trim();

            if (trimmedLine.match(/^\*\*.*\*\*$/)) {
              return `<div style="font-weight: bold; margin: 20px 0 10px 0; font-size: 16px; color: #0066cc;">${line}</div>`;
            }
            if (trimmedLine.match(/^\d+\.\s+/)) {
              return `<div style="margin: 8px 0; padding-left: 10px;">${line}</div>`;
            }
            if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
              return `<div style="margin: 6px 0; padding-left: 15px;">${line}</div>`;
            }
            return `<div style="margin: 6px 0;">${line || '<br>'}</div>`;
          })
          .join('');
    }

    return formattedContent;
  }
}