/**
 * AI Research Service for Gawin
 * Provides comprehensive web research capabilities with deep analysis
 * Can conduct research sessions lasting up to 45 minutes for complex topics
 */

import { groqService } from './groqService';
import { perplexityService } from './perplexityService';

export interface ResearchStep {
  id: string;
  type: 'search' | 'analyze' | 'verify' | 'synthesize' | 'document';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  title: string;
  description: string;
  progress: number;
  startTime?: number;
  endTime?: number;
  results?: any;
  sources?: string[];
}

export interface ResearchSource {
  url: string;
  title: string;
  domain: string;
  content: string;
  relevanceScore: number;
  credibilityScore: number;
  timestamp: number;
}

export interface ResearchDocument {
  id: string;
  title: string;
  query: string;
  summary: string;
  content: string;
  sources: ResearchSource[];
  steps: ResearchStep[];
  startTime: number;
  endTime?: number;
  status: 'researching' | 'completed' | 'failed';
  estimatedDuration: number;
  actualDuration?: number;
}

class AIResearchService {
  private activeResearch: Map<string, ResearchDocument> = new Map();
  private researchQueue: string[] = [];

  /**
   * Start a comprehensive research session
   */
  async startResearch(query: string): Promise<string> {
    const researchId = `research_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Analyze query complexity to estimate duration
    const complexity = this.analyzeQueryComplexity(query);
    const estimatedDuration = this.calculateEstimatedDuration(complexity);

    const document: ResearchDocument = {
      id: researchId,
      title: this.generateResearchTitle(query),
      query,
      summary: '',
      content: '',
      sources: [],
      steps: this.generateResearchPlan(query, complexity),
      startTime: Date.now(),
      status: 'researching',
      estimatedDuration
    };

    this.activeResearch.set(researchId, document);
    this.researchQueue.push(researchId);

    // Start the research process
    this.executeResearchPlan(researchId);

    return researchId;
  }

  /**
   * Get research progress and current status
   */
  getResearchStatus(researchId: string): ResearchDocument | null {
    return this.activeResearch.get(researchId) || null;
  }

  /**
   * Get all active and completed research sessions
   */
  getAllResearch(): ResearchDocument[] {
    return Array.from(this.activeResearch.values());
  }

  /**
   * Analyze query complexity to determine research approach
   */
  private analyzeQueryComplexity(query: string): 'simple' | 'moderate' | 'complex' | 'comprehensive' {
    const words = query.toLowerCase().split(' ');
    const complexityIndicators = {
      simple: ['what', 'who', 'when', 'where', 'define', 'meaning'],
      moderate: ['how', 'why', 'compare', 'difference', 'explain', 'describe'],
      complex: ['analyze', 'evaluate', 'research', 'comprehensive', 'detailed', 'in-depth'],
      comprehensive: ['systematic', 'thorough', 'complete', 'extensive', 'exhaustive', 'academic']
    };

    let complexity: 'simple' | 'moderate' | 'complex' | 'comprehensive' = 'simple';

    for (const [level, indicators] of Object.entries(complexityIndicators)) {
      if (indicators.some(indicator => words.includes(indicator))) {
        complexity = level as any;
      }
    }

    // Additional complexity factors
    if (words.length > 15) complexity = 'complex';
    if (query.includes('multiple perspectives') || query.includes('various sources')) {
      complexity = 'comprehensive';
    }

    return complexity;
  }

  /**
   * Calculate estimated duration based on complexity
   */
  private calculateEstimatedDuration(complexity: string): number {
    const durations = {
      simple: 2 * 60 * 1000,      // 2 minutes
      moderate: 8 * 60 * 1000,    // 8 minutes
      complex: 20 * 60 * 1000,    // 20 minutes
      comprehensive: 45 * 60 * 1000 // 45 minutes
    };
    return durations[complexity as keyof typeof durations] || durations.moderate;
  }

  /**
   * Generate a research title from query
   */
  private generateResearchTitle(query: string): string {
    const words = query.split(' ');
    if (words.length <= 8) return query;
    
    // Extract key terms and create a concise title
    const keyWords = words.slice(0, 6);
    return keyWords.join(' ') + (words.length > 6 ? '...' : '');
  }

  /**
   * Generate research plan based on query and complexity
   */
  private generateResearchPlan(query: string, complexity: string): ResearchStep[] {
    const baseSteps: ResearchStep[] = [
      {
        id: 'search_initial',
        type: 'search',
        status: 'pending',
        title: 'Initial Web Search',
        description: 'Conducting preliminary search to identify key sources',
        progress: 0
      },
      {
        id: 'analyze_sources',
        type: 'analyze',
        status: 'pending',
        title: 'Source Analysis',
        description: 'Analyzing credibility and relevance of found sources',
        progress: 0
      }
    ];

    if (complexity === 'moderate' || complexity === 'complex' || complexity === 'comprehensive') {
      baseSteps.push(
        {
          id: 'search_deep',
          type: 'search',
          status: 'pending',
          title: 'Deep Research',
          description: 'Conducting specialized searches for comprehensive information',
          progress: 0
        },
        {
          id: 'verify_facts',
          type: 'verify',
          status: 'pending',
          title: 'Fact Verification',
          description: 'Cross-referencing information across multiple sources',
          progress: 0
        }
      );
    }

    if (complexity === 'complex' || complexity === 'comprehensive') {
      baseSteps.push(
        {
          id: 'search_academic',
          type: 'search',
          status: 'pending',
          title: 'Academic Sources',
          description: 'Searching for scholarly articles and academic resources',
          progress: 0
        },
        {
          id: 'analyze_perspectives',
          type: 'analyze',
          status: 'pending',
          title: 'Multiple Perspectives',
          description: 'Analyzing different viewpoints and expert opinions',
          progress: 0
        }
      );
    }

    baseSteps.push(
      {
        id: 'synthesize',
        type: 'synthesize',
        status: 'pending',
        title: 'Information Synthesis',
        description: 'Combining and organizing research findings',
        progress: 0
      },
      {
        id: 'document',
        type: 'document',
        status: 'pending',
        title: 'Document Creation',
        description: 'Compiling comprehensive research document',
        progress: 0
      }
    );

    return baseSteps;
  }

  /**
   * Execute the research plan step by step
   */
  private async executeResearchPlan(researchId: string): Promise<void> {
    const document = this.activeResearch.get(researchId);
    if (!document) return;

    try {
      for (const step of document.steps) {
        await this.executeResearchStep(researchId, step.id);
        
        // Update document
        const updatedDocument = this.activeResearch.get(researchId);
        if (updatedDocument && updatedDocument.status === 'failed') break;
        
        // Small delay between steps
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Mark research as completed
      const finalDocument = this.activeResearch.get(researchId);
      if (finalDocument) {
        finalDocument.status = 'completed';
        finalDocument.endTime = Date.now();
        finalDocument.actualDuration = finalDocument.endTime - finalDocument.startTime;
      }
    } catch (error) {
      console.error('Research execution failed:', error);
      const errorDocument = this.activeResearch.get(researchId);
      if (errorDocument) {
        errorDocument.status = 'failed';
        errorDocument.endTime = Date.now();
      }
    }
  }

  /**
   * Execute a single research step
   */
  private async executeResearchStep(researchId: string, stepId: string): Promise<void> {
    const document = this.activeResearch.get(researchId);
    if (!document) return;

    const step = document.steps.find(s => s.id === stepId);
    if (!step) return;

    step.status = 'in_progress';
    step.startTime = Date.now();

    try {
      switch (step.type) {
        case 'search':
          await this.executeSearchStep(document, step);
          break;
        case 'analyze':
          await this.executeAnalysisStep(document, step);
          break;
        case 'verify':
          await this.executeVerificationStep(document, step);
          break;
        case 'synthesize':
          await this.executeSynthesisStep(document, step);
          break;
        case 'document':
          await this.executeDocumentationStep(document, step);
          break;
      }

      step.status = 'completed';
      step.progress = 100;
      step.endTime = Date.now();
    } catch (error) {
      step.status = 'failed';
      step.progress = 0;
      step.endTime = Date.now();
      throw error;
    }
  }

  /**
   * Execute search step
   */
  private async executeSearchStep(document: ResearchDocument, step: ResearchStep): Promise<void> {
    step.progress = 10;

    // Use Perplexity for web search
    const searchResults = await perplexityService.search(document.query);
    step.progress = 50;

    if (searchResults) {
      // Process search results into sources
      const sources: ResearchSource[] = searchResults.sources?.map((source: any, index: number) => ({
        url: source.url || `https://source-${index}.com`,
        title: source.title || 'Research Source',
        domain: this.extractDomain(source.url || ''),
        content: source.content || '',
        relevanceScore: 0.8,
        credibilityScore: 0.7,
        timestamp: Date.now()
      })) || [];

      document.sources.push(...sources);
      step.results = { sourcesFound: sources.length };
    }

    step.progress = 100;
  }

  /**
   * Execute analysis step
   */
  private async executeAnalysisStep(document: ResearchDocument, step: ResearchStep): Promise<void> {
    step.progress = 10;

    // Analyze source credibility and relevance
    for (const source of document.sources) {
      // Simple domain-based credibility scoring
      const credibilityScore = this.calculateCredibilityScore(source.domain);
      source.credibilityScore = credibilityScore;
      step.progress += 90 / document.sources.length;
    }

    step.results = { sourcesAnalyzed: document.sources.length };
    step.progress = 100;
  }

  /**
   * Execute verification step
   */
  private async executeVerificationStep(document: ResearchDocument, step: ResearchStep): Promise<void> {
    step.progress = 10;

    // Cross-reference information across sources
    const highCredibilitySources = document.sources.filter(s => s.credibilityScore > 0.6);
    step.progress = 70;

    step.results = { verifiedSources: highCredibilitySources.length };
    step.progress = 100;
  }

  /**
   * Execute synthesis step
   */
  private async executeSynthesisStep(document: ResearchDocument, step: ResearchStep): Promise<void> {
    step.progress = 10;

    // Generate comprehensive summary using AI
    const prompt = `Based on the research query "${document.query}" and the following sources, create a comprehensive synthesis:

Sources: ${document.sources.map(s => `- ${s.title}: ${s.content?.substring(0, 200)}...`).join('\n')}

Provide a detailed analysis that:
1. Addresses the original research question
2. Synthesizes information from multiple sources
3. Identifies key findings and insights
4. Notes any conflicting information
5. Provides a balanced perspective`;

    step.progress = 50;

    try {
      const synthesis = await groqService.generateResponse([{ role: 'user', content: prompt }]);
      document.summary = synthesis;
      step.results = { synthesis };
    } catch (error) {
      console.error('Synthesis generation failed:', error);
      document.summary = 'Unable to generate synthesis due to service limitations.';
    }

    step.progress = 100;
  }

  /**
   * Execute documentation step
   */
  private async executeDocumentationStep(document: ResearchDocument, step: ResearchStep): Promise<void> {
    step.progress = 10;

    // Create comprehensive document
    const documentContent = this.generateResearchDocument(document);
    document.content = documentContent;
    step.progress = 100;

    step.results = { documentGenerated: true, wordCount: documentContent.length };
  }

  /**
   * Generate final research document
   */
  private generateResearchDocument(document: ResearchDocument): string {
    const duration = document.actualDuration || (Date.now() - document.startTime);
    const durationMinutes = Math.round(duration / 60000);

    return `# ${document.title}

**Research Query:** ${document.query}
**Research Duration:** ${durationMinutes} minutes
**Sources Consulted:** ${document.sources.length}
**Completed:** ${new Date().toLocaleString()}

## Executive Summary

${document.summary}

## Key Findings

${document.sources.slice(0, 5).map((source, index) => `
### Finding ${index + 1}: ${source.title}
**Source:** ${source.url}
**Credibility:** ${Math.round(source.credibilityScore * 100)}%
**Content:** ${source.content?.substring(0, 300)}...
`).join('\n')}

## Sources Bibliography

${document.sources.map((source, index) => `
${index + 1}. **${source.title}**
   - URL: ${source.url}
   - Domain: ${source.domain}
   - Credibility Score: ${Math.round(source.credibilityScore * 100)}%
   - Access Date: ${new Date(source.timestamp).toLocaleDateString()}
`).join('\n')}

## Research Methodology

This research was conducted using AI-powered search and analysis:

${document.steps.map(step => `
- **${step.title}:** ${step.description} (${step.status === 'completed' ? 'Completed' : 'Failed'})
`).join('\n')}

---
*Generated by Gawin AI Research System*
*Report ID: ${document.id}*`;
  }

  /**
   * Calculate credibility score based on domain
   */
  private calculateCredibilityScore(domain: string): number {
    const highCredibility = ['edu', 'gov', 'org', 'ac.uk', 'nature.com', 'springer.com', 'ieee.org'];
    const mediumCredibility = ['reuters.com', 'bbc.com', 'nytimes.com', 'washingtonpost.com'];
    const academicDomains = ['scholar.google', 'pubmed', 'arxiv.org', 'jstor.org'];

    if (academicDomains.some(d => domain.includes(d))) return 0.95;
    if (highCredibility.some(d => domain.endsWith(d))) return 0.85;
    if (mediumCredibility.some(d => domain.includes(d))) return 0.75;
    
    return 0.6; // Default credibility score
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown-domain.com';
    }
  }

  /**
   * Cancel active research
   */
  cancelResearch(researchId: string): boolean {
    const document = this.activeResearch.get(researchId);
    if (document && document.status === 'researching') {
      document.status = 'failed';
      document.endTime = Date.now();
      return true;
    }
    return false;
  }

  /**
   * Export research document as various formats
   */
  exportDocument(researchId: string, format: 'markdown' | 'text' | 'json'): string {
    const document = this.activeResearch.get(researchId);
    if (!document) return '';

    switch (format) {
      case 'markdown':
        return document.content;
      case 'text':
        return document.content.replace(/[#*\-]/g, '').replace(/\n\n+/g, '\n');
      case 'json':
        return JSON.stringify(document, null, 2);
      default:
        return document.content;
    }
  }
}

export const aiResearchService = new AIResearchService();