/**
 * Unified Text Formatting System for Gawin AI
 * Consolidates all formatting logic into a single, coherent system
 * Supports both Regular and Premium Agent Mode formatting
 */

export interface UnifiedFormattingOptions {
  mode: 'regular' | 'agent';
  enableMathRendering?: boolean;
  enableAdvancedLayout?: boolean;
  preserveStructure?: boolean;
  mobileOptimized?: boolean;
}

export type ContentType =
  | 'general'
  | 'research'
  | 'analysis'
  | 'creative'
  | 'technical'
  | 'educational'
  | 'business'
  | 'conversation';

export interface FormattedContent {
  html: string;
  contentType: ContentType;
  hasCodeBlocks: boolean;
  hasMath: boolean;
  hasImages: boolean;
  estimatedReadTime: number;
}

export class UnifiedFormatter {
  private static readonly AGENT_MODE_FEATURES = [
    'advanced_layout',
    'enhanced_typography',
    'research_formatting',
    'executive_summaries',
    'structured_analysis',
    'visual_hierarchy'
  ];

  /**
   * Main formatting entry point
   */
  static format(text: string, options: UnifiedFormattingOptions): FormattedContent {
    const contentType = this.detectContentType(text);
    const isAgentMode = options.mode === 'agent';

    let formattedHtml: string;

    if (isAgentMode) {
      formattedHtml = this.formatForAgentMode(text, contentType, options);
    } else {
      formattedHtml = this.formatForRegularMode(text, contentType, options);
    }

    return {
      html: formattedHtml,
      contentType,
      hasCodeBlocks: this.hasCodeBlocks(text),
      hasMath: this.hasMath(text),
      hasImages: this.hasImages(text),
      estimatedReadTime: this.calculateReadTime(text)
    };
  }

  /**
   * Premium Agent Mode Formatting
   * Enhanced structure, visual hierarchy, and comprehensive layout
   */
  private static formatForAgentMode(text: string, contentType: ContentType, options: UnifiedFormattingOptions): string {
    let html = text;

    // 1. Enhanced Document Structure
    html = this.addAgentModeStructure(html, contentType);

    // 2. Advanced Typography
    html = this.applyAdvancedTypography(html);

    // 3. Research-Grade Formatting
    if (contentType === 'research' || contentType === 'analysis') {
      html = this.applyResearchFormatting(html);
    }

    // 4. Executive Summary Generation
    html = this.addExecutiveSummary(html, contentType);

    // 5. Visual Hierarchy Enhancement
    html = this.enhanceVisualHierarchy(html);

    // 6. Advanced Layout Features
    if (options.enableAdvancedLayout) {
      html = this.applyAdvancedLayout(html);
    }

    // 7. Mobile Optimization
    if (options.mobileOptimized) {
      html = this.applyMobileOptimization(html, true);
    }

    return this.wrapInAgentContainer(html);
  }

  /**
   * Regular Mode Formatting
   * Clean, simple formatting focused on readability
   */
  private static formatForRegularMode(text: string, contentType: ContentType, options: UnifiedFormattingOptions): string {
    let html = text;

    // 1. Basic markdown processing
    html = this.processBasicMarkdown(html);

    // 2. Clean typography
    html = this.applyBasicTypography(html);

    // 3. Simple structure
    html = this.addBasicStructure(html, contentType);

    // 4. Mobile optimization
    if (options.mobileOptimized) {
      html = this.applyMobileOptimization(html, false);
    }

    return this.wrapInRegularContainer(html);
  }

  /**
   * Agent Mode Structure Enhancement
   */
  private static addAgentModeStructure(html: string, contentType: ContentType): string {
    const sections = this.identifySections(html);

    let structured = '';

    // Add content type indicator
    structured += `<div class="gawin-agent-header">
      <div class="content-type-badge ${contentType}">${this.getContentTypeLabel(contentType)}</div>
      <div class="agent-mode-indicator">🤖 Agent Mode</div>
    </div>`;

    // Process each section with enhanced formatting
    sections.forEach((section, index) => {
      if (section.type === 'heading') {
        structured += `<div class="agent-section">
          <h${section.level} class="agent-heading level-${section.level}">
            <span class="section-number">${index + 1}</span>
            ${section.content}
          </h${section.level}>
        </div>`;
      } else if (section.type === 'list') {
        structured += `<div class="agent-list-container">
          ${this.formatAgentList(section.content)}
        </div>`;
      } else if (section.type === 'code') {
        structured += `<div class="agent-code-container">
          ${this.formatAgentCodeBlock(section.content, section.language)}
        </div>`;
      } else {
        structured += `<div class="agent-content">
          ${this.formatAgentParagraph(section.content)}
        </div>`;
      }
    });

    return structured;
  }

  /**
   * Research-Grade Formatting
   */
  private static applyResearchFormatting(html: string): string {
    // Add research-specific elements
    html = this.addCitationSupport(html);
    html = this.addKeyInsights(html);
    html = this.addMethodologySection(html);
    html = this.addReferences(html);

    return html;
  }

  /**
   * Executive Summary Generation
   */
  private static addExecutiveSummary(html: string, contentType: ContentType): string {
    if (contentType === 'research' || contentType === 'analysis' || contentType === 'business') {
      const keyPoints = this.extractKeyPoints(html);

      if (keyPoints.length > 0) {
        const summary = `<div class="executive-summary">
          <h3 class="summary-title">📋 Executive Summary</h3>
          <ul class="key-points">
            ${keyPoints.map(point => `<li class="key-point">${point}</li>`).join('')}
          </ul>
        </div>`;

        return summary + html;
      }
    }

    return html;
  }

  /**
   * Advanced Typography
   */
  private static applyAdvancedTypography(html: string): string {
    // Enhanced typography rules
    html = html.replace(/--/g, '—'); // Em dashes
    html = html.replace(/\.\.\./g, '…'); // Ellipsis

    // Mathematical notation
    html = this.enhanceMathNotation(html);

    // Technical terminology
    html = this.highlightTechnicalTerms(html);

    return html;
  }

  /**
   * Visual Hierarchy Enhancement
   */
  private static enhanceVisualHierarchy(html: string): string {
    // Add visual separators
    html = html.replace(/\n\n(?=#{1,3}\s)/g, '\n\n<div class="section-divider"></div>\n\n');

    // Enhance headings with icons
    html = html.replace(/<h1>/g, '<h1 class="main-heading"><span class="heading-icon">📌</span>');
    html = html.replace(/<h2>/g, '<h2 class="sub-heading"><span class="heading-icon">🔍</span>');
    html = html.replace(/<h3>/g, '<h3 class="detail-heading"><span class="heading-icon">▶️</span>');

    // Enhance important content
    html = this.highlightImportantContent(html);

    return html;
  }

  /**
   * Advanced Layout Features
   */
  private static applyAdvancedLayout(html: string): string {
    // Multi-column layouts for appropriate content
    html = this.enableSmartColumns(html);

    // Side-by-side comparisons
    html = this.createComparisons(html);

    // Callout boxes
    html = this.addCalloutBoxes(html);

    // Progress indicators
    html = this.addProgressIndicators(html);

    return html;
  }

  /**
   * Content Type Detection
   */
  private static detectContentType(text: string): ContentType {
    const lowerText = text.toLowerCase();

    if (this.isResearchContent(lowerText)) return 'research';
    if (this.isAnalysisContent(lowerText)) return 'analysis';
    if (this.isTechnicalContent(lowerText)) return 'technical';
    if (this.isBusinessContent(lowerText)) return 'business';
    if (this.isEducationalContent(lowerText)) return 'educational';
    if (this.isCreativeContent(lowerText)) return 'creative';

    return 'general';
  }

  /**
   * Content Type Helpers
   */
  private static isResearchContent(text: string): boolean {
    const researchIndicators = [
      'research', 'study', 'analysis', 'findings', 'methodology',
      'hypothesis', 'conclusion', 'data', 'results', 'evidence',
      'survey', 'experiment', 'literature review'
    ];

    return researchIndicators.some(indicator => text.includes(indicator));
  }

  private static isAnalysisContent(text: string): boolean {
    const analysisIndicators = [
      'analyze', 'assessment', 'evaluation', 'comparison',
      'pros and cons', 'advantages', 'disadvantages', 'impact',
      'implications', 'trends', 'patterns'
    ];

    return analysisIndicators.some(indicator => text.includes(indicator));
  }

  private static isTechnicalContent(text: string): boolean {
    const technicalIndicators = [
      'algorithm', 'implementation', 'code', 'function',
      'system', 'architecture', 'protocol', 'api',
      'database', 'framework', 'technology'
    ];

    return technicalIndicators.some(indicator => text.includes(indicator));
  }

  private static isBusinessContent(text: string): boolean {
    const businessIndicators = [
      'strategy', 'market', 'revenue', 'profit', 'growth',
      'investment', 'roi', 'kpi', 'metrics', 'stakeholder',
      'competitive', 'opportunity', 'risk'
    ];

    return businessIndicators.some(indicator => text.includes(indicator));
  }

  private static isEducationalContent(text: string): boolean {
    const educationalIndicators = [
      'learn', 'teach', 'explain', 'understand', 'concept',
      'principle', 'theory', 'example', 'practice',
      'step by step', 'tutorial', 'guide'
    ];

    return educationalIndicators.some(indicator => text.includes(indicator));
  }

  private static isCreativeContent(text: string): boolean {
    const creativeIndicators = [
      'story', 'poem', 'creative', 'imagine', 'fantasy',
      'character', 'plot', 'narrative', 'verse',
      'artistic', 'design', 'inspiration'
    ];

    return creativeIndicators.some(indicator => text.includes(indicator));
  }

  /**
   * Utility Methods
   */
  private static getContentTypeLabel(contentType: ContentType): string {
    const labels = {
      general: 'General Response',
      research: 'Research Analysis',
      analysis: 'Detailed Analysis',
      technical: 'Technical Guide',
      business: 'Business Insights',
      educational: 'Learning Content',
      creative: 'Creative Content',
      conversation: 'Conversation'
    };

    return labels[contentType];
  }

  private static hasCodeBlocks(text: string): boolean {
    return /```[\s\S]*?```/.test(text) || /<code>[\s\S]*?<\/code>/.test(text);
  }

  private static hasMath(text: string): boolean {
    return /\$[\s\S]*?\$/.test(text) || /\\\([\s\S]*?\\\)/.test(text);
  }

  private static hasImages(text: string): boolean {
    return /!\[.*?\]\(.*?\)/.test(text) || /<img[\s\S]*?>/.test(text);
  }

  private static calculateReadTime(text: string): number {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  // Additional helper methods would be implemented here...
  private static identifySections(html: string): any[] { return []; }
  private static formatAgentList(content: string): string { return content; }
  private static formatAgentCodeBlock(content: string, language?: string): string { return content; }
  private static formatAgentParagraph(content: string): string { return content; }
  private static addCitationSupport(html: string): string { return html; }
  private static addKeyInsights(html: string): string { return html; }
  private static addMethodologySection(html: string): string { return html; }
  private static addReferences(html: string): string { return html; }
  private static extractKeyPoints(html: string): string[] { return []; }
  private static enhanceMathNotation(html: string): string { return html; }
  private static highlightTechnicalTerms(html: string): string { return html; }
  private static highlightImportantContent(html: string): string { return html; }
  private static enableSmartColumns(html: string): string { return html; }
  private static createComparisons(html: string): string { return html; }
  private static addCalloutBoxes(html: string): string { return html; }
  private static addProgressIndicators(html: string): string { return html; }
  private static processBasicMarkdown(html: string): string { return html; }
  private static applyBasicTypography(html: string): string { return html; }
  private static addBasicStructure(html: string, contentType: ContentType): string { return html; }
  private static applyMobileOptimization(html: string, isAgentMode: boolean): string { return html; }
  private static wrapInAgentContainer(html: string): string { return `<div class="gawin-agent-response">${html}</div>`; }
  private static wrapInRegularContainer(html: string): string { return `<div class="gawin-regular-response">${html}</div>`; }
}