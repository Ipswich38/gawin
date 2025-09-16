/**
 * GPT Researcher Integration Service
 * Integrates the free, open-source GPT Researcher (Apache-2.0 license)
 * Provides enhanced research capabilities for Gawin AI
 * 
 * Repository: https://github.com/assafelovic/gpt-researcher
 * License: Apache-2.0 (Free to use)
 */

import { groqService } from './groqService';

export interface GPTResearchRequest {
  query: string;
  reportType: 'research_report' | 'detailed_report' | 'resource_report' | 'outline_report';
  sourceUrls?: string[];
  maxSources?: number;
  reportLength?: 'short' | 'medium' | 'long';
  includeImages?: boolean;
}

export interface GPTResearchResult {
  query: string;
  report: string;
  sources: ResearchSource[];
  images: string[];
  metadata: {
    totalSources: number;
    processingTime: number;
    reportLength: number;
    researcher: 'gpt-researcher';
  };
}

export interface ResearchSource {
  url: string;
  title: string;
  snippet: string;
  relevanceScore: number;
  publishDate?: string;
  domain: string;
}

export interface EnhancedResearchResult {
  query: string;
  executiveSummary: string;
  detailedReport: string;
  keyFindings: string[];
  sources: ResearchSource[];
  images: string[];
  recommendations: string[];
  confidence: number;
  processingTime: number;
  method: 'hybrid' | 'gpt-researcher' | 'intelligent-only';
}

class GPTResearcherService {
  private apiEndpoint = '/api/gpt-researcher';
  private fallbackToIntelligent = true;

  /**
   * Conduct enhanced research using GPT Researcher + our intelligent system
   */
  async conductEnhancedResearch(
    query: string,
    options: {
      reportType?: 'research_report' | 'detailed_report' | 'resource_report' | 'outline_report';
      maxSources?: number;
      includeImages?: boolean;
      useHybrid?: boolean;
    } = {}
  ): Promise<EnhancedResearchResult> {
    console.log('🔬 Starting enhanced research with GPT Researcher integration...');
    
    const startTime = Date.now();
    
    try {
      // Try GPT Researcher first
      const gptResult = await this.useGPTResearcher({
        query,
        reportType: options.reportType || 'research_report',
        maxSources: options.maxSources || 20,
        includeImages: options.includeImages || true
      });

      if (gptResult) {
        console.log('✅ GPT Researcher completed successfully');
        
        // Enhance with our intelligent analysis
        if (options.useHybrid !== false) {
          return await this.enhanceWithIntelligentAnalysis(gptResult, query, startTime);
        }
        
        return this.convertGPTResultToEnhanced(gptResult, startTime);
      }
    } catch (error) {
      console.warn('⚠️ GPT Researcher failed, falling back to intelligent research:', error);
    }

    // Fallback to our intelligent research system
    if (this.fallbackToIntelligent) {
      return await this.fallbackToIntelligentResearch(query, startTime);
    }

    throw new Error('Both GPT Researcher and intelligent research failed');
  }

  /**
   * Use GPT Researcher via API endpoint
   */
  private async useGPTResearcher(request: GPTResearchRequest): Promise<GPTResearchResult | null> {
    try {
      console.log('📡 Calling GPT Researcher API...');
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`GPT Researcher API failed: ${response.status}`);
      }

      const apiResponse = await response.json();
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'GPT Researcher API returned error');
      }

      const result: GPTResearchResult = apiResponse.data;
      
      // Check if this is a fallback response (indicates GPT Researcher not available)
      if (result.sources.length === 0 && result.report.includes('GPT Researcher is currently unavailable')) {
        console.log('⚠️ GPT Researcher not available, will use intelligent research fallback');
        return null;
      }
      
      console.log(`✅ GPT Researcher completed: ${result.sources.length} sources, ${result.report.length} chars`);
      return result;
      
    } catch (error) {
      console.error('❌ GPT Researcher API call failed:', error);
      return null;
    }
  }

  /**
   * Enhance GPT Researcher results with our intelligent analysis
   */
  private async enhanceWithIntelligentAnalysis(
    gptResult: GPTResearchResult,
    originalQuery: string,
    startTime: number
  ): Promise<EnhancedResearchResult> {
    console.log('🧠 Enhancing GPT Researcher results with intelligent analysis...');
    
    try {
      // Use Groq to analyze and enhance the GPT Researcher report
      const enhancementPrompt = `
      As Gawin, an intelligent AI researcher, enhance this research report with deeper analysis:

      Original Query: "${originalQuery}"
      
      GPT Researcher Report:
      ${gptResult.report}
      
      Sources Found: ${gptResult.sources.length}
      
      Please provide a JSON response with enhanced analysis:
      {
        "executiveSummary": "Concise 2-3 sentence summary of key findings",
        "keyFindings": ["finding 1", "finding 2", "finding 3"],
        "recommendations": ["actionable recommendation 1", "recommendation 2"],
        "confidence": 0.85,
        "enhancedInsights": ["additional insight 1", "insight 2"],
        "gaps": ["potential gap 1", "gap 2"],
        "futureResearch": ["suggested future research direction 1", "direction 2"]
      }
      
      Focus on providing value-added analysis beyond what GPT Researcher already found.
      `;

      const enhancementResponse = await groqService.createChatCompletion({
        messages: [{ role: 'user', content: enhancementPrompt }],
        action: 'analysis'
      });

      const enhancement = JSON.parse(enhancementResponse.choices?.[0]?.message?.content || '{}');
      
      return {
        query: originalQuery,
        executiveSummary: enhancement.executiveSummary || gptResult.report.slice(0, 300) + '...',
        detailedReport: gptResult.report,
        keyFindings: enhancement.keyFindings || [],
        sources: gptResult.sources,
        images: gptResult.images,
        recommendations: enhancement.recommendations || [],
        confidence: enhancement.confidence || 0.8,
        processingTime: Date.now() - startTime,
        method: 'hybrid'
      };
      
    } catch (error) {
      console.warn('⚠️ Enhancement failed, returning base GPT Researcher result:', error);
      return this.convertGPTResultToEnhanced(gptResult, startTime);
    }
  }

  /**
   * Convert GPT Researcher result to our enhanced format
   */
  private convertGPTResultToEnhanced(
    gptResult: GPTResearchResult,
    startTime: number
  ): EnhancedResearchResult {
    return {
      query: gptResult.query,
      executiveSummary: gptResult.report.slice(0, 300) + '...',
      detailedReport: gptResult.report,
      keyFindings: this.extractKeyFindings(gptResult.report),
      sources: gptResult.sources,
      images: gptResult.images,
      recommendations: this.extractRecommendations(gptResult.report),
      confidence: 0.85,
      processingTime: Date.now() - startTime,
      method: 'gpt-researcher'
    };
  }

  /**
   * Fallback to our intelligent research system
   */
  private async fallbackToIntelligentResearch(
    query: string,
    startTime: number
  ): Promise<EnhancedResearchResult> {
    console.log('🔄 Using intelligent research fallback...');
    
    try {
      // Import and use our existing intelligent research service
      const { intelligentResearchService } = await import('./intelligentResearchService');
      
      const context = {
        query,
        domain: 'General Research',
        academicLevel: 'professional' as const,
        expectedLength: 'comprehensive' as const,
        perspective: 'academic' as const
      };

      const result = await intelligentResearchService.conductIntelligentResearch(context);
      
      return {
        query,
        executiveSummary: result.executiveSummary,
        detailedReport: typeof result.detailedAnalysis === 'string' ? result.detailedAnalysis : Object.values(result.detailedAnalysis).join('\n\n'),
        keyFindings: result.keyFindings,
        sources: result.references?.map((s: any) => ({
          url: s.url,
          title: s.citation || s.title || 'Unknown source',
          snippet: s.summary || s.content?.slice(0, 200) || '',
          relevanceScore: (s.relevanceScore || s.relevance || 80) / 100,
          domain: new URL(s.url).hostname
        })) || [],
        images: [],
        recommendations: (result as any).recommendations || [],
        confidence: 0.75,
        processingTime: Date.now() - startTime,
        method: 'intelligent-only'
      };
      
    } catch (error) {
      console.error('❌ Intelligent research fallback also failed:', error);
      throw error;
    }
  }

  /**
   * Extract key findings from report text
   */
  private extractKeyFindings(report: string): string[] {
    const lines = report.split('\n').filter(line => line.trim());
    const findings: string[] = [];
    
    for (const line of lines) {
      if (line.match(/^[\d\-\*•]/)) {
        findings.push(line.replace(/^[\d\-\*•]\s*/, '').trim());
      }
    }
    
    return findings.slice(0, 5);
  }

  /**
   * Extract recommendations from report text
   */
  private extractRecommendations(report: string): string[] {
    const recommendations: string[] = [];
    const lines = report.split('\n');
    
    let inRecommendationsSection = false;
    for (const line of lines) {
      if (line.toLowerCase().includes('recommend') || 
          line.toLowerCase().includes('suggest') ||
          line.toLowerCase().includes('conclusion')) {
        inRecommendationsSection = true;
      }
      
      if (inRecommendationsSection && line.match(/^[\d\-\*•]/)) {
        recommendations.push(line.replace(/^[\d\-\*•]\s*/, '').trim());
      }
    }
    
    return recommendations.slice(0, 3);
  }

  /**
   * Get service status and availability
   */
  async getServiceStatus(): Promise<{
    gptResearcherAvailable: boolean;
    intelligentResearchAvailable: boolean;
    recommendedMethod: string;
  }> {
    try {
      const response = await fetch(`${this.apiEndpoint}/status`);
      const gptAvailable = response.ok;
      
      return {
        gptResearcherAvailable: gptAvailable,
        intelligentResearchAvailable: true,
        recommendedMethod: gptAvailable ? 'hybrid' : 'intelligent-only'
      };
    } catch {
      return {
        gptResearcherAvailable: false,
        intelligentResearchAvailable: true,
        recommendedMethod: 'intelligent-only'
      };
    }
  }

  /**
   * Conduct quick research (optimized for speed)
   */
  async conductQuickResearch(query: string): Promise<EnhancedResearchResult> {
    return await this.conductEnhancedResearch(query, {
      reportType: 'outline_report',
      maxSources: 10,
      includeImages: false,
      useHybrid: false
    });
  }

  /**
   * Conduct comprehensive research (optimized for depth)
   */
  async conductComprehensiveResearch(query: string): Promise<EnhancedResearchResult> {
    return await this.conductEnhancedResearch(query, {
      reportType: 'detailed_report',
      maxSources: 25,
      includeImages: true,
      useHybrid: true
    });
  }
}

export const gptResearcherService = new GPTResearcherService();
export default gptResearcherService;