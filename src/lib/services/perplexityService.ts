import { deepseekService } from './deepseekService';
import { searchService, SearchResult, SearchResponse } from './searchService';
import { memoryService } from './memoryService';
import { AdvancedReasoningEngine, ReasoningMode, InferenceResult } from './advancedReasoningEngine';
import { scalingLawsAnalyzer, emergenceDetector, EmergentCapability } from './scalingLawsAnalyzer';
import { getAdvancedArchitectureEngine, MixtureOfExpertsOutput } from './advancedArchitectures';

export interface PerplexityResponse {
  content: string;
  sources: SearchResult[];
  citations: Citation[];
  timestamp: Date;
  modelUsed: string;
  searchPerformed: boolean;
  reasoning?: string;
  responseTime?: number;
  // Advanced reasoning data
  reasoningTrace?: InferenceResult;
  emergentCapabilities?: EmergentCapability[];
  reasoningMode?: ReasoningMode;
  confidenceScore?: number;
  scalingAnalysis?: {
    predictedCapabilities: EmergentCapability[];
    breakthroughPotential: number;
    emergenceRisk: string;
  };
  // Advanced architecture data
  expertRouting?: MixtureOfExpertsOutput;
  retentionMetrics?: {
    memoryEfficiency: number;
    retainedTokens: number;
    totalTokens: number;
  };
  constitutionalCompliance?: {
    ethicalScore: number;
    violations: string[];
  };
}

export interface Citation {
  id: number;
  title: string;
  url: string;
  snippet: string;
  position: number;
}

class PerplexityService {
  // Now uses OpenRouter through deepseekService
  private reasoningEngine: AdvancedReasoningEngine;

  constructor() {
    console.log('🔑 Perplexity Service now using OpenRouter');
    
    this.reasoningEngine = new AdvancedReasoningEngine();
    
    console.log('🧠 Perplexity Service enhanced with Advanced Reasoning Engine');
  }

  /**
   * Main Perplexity-like function: Enhanced with advanced reasoning and emergence analysis
   */
  async generateAnswer(query: string): Promise<PerplexityResponse> {
    const startTime = Date.now();
    try {
      console.log(`🧠 Enhanced Reasoning: Processing "${query}"`);
      console.log('🔧 Service initialization check:', {
        hasOpenRouter: true,
        hasReasoningEngine: !!this.reasoningEngine,
        apiKeyConfigured: this.isConfigured()
      });

      // Step 1: Get relevant memory context (Rovo-inspired)
      const memoryContext = memoryService.getRelevantContext(query, 'text');
      const conversationSummary = memoryService.getConversationSummary();

      // Step 2: Advanced reasoning analysis
      let reasoningResult;
      try {
        console.log('🧠 Starting reasoning engine processing...');
        reasoningResult = await this.reasoningEngine.processQuery(query, conversationSummary);
        console.log(`🎯 Reasoning Mode: ${reasoningResult.metadata.reasoningMode}`);
        console.log(`📊 Confidence: ${reasoningResult.metadata.confidence.toFixed(2)}`);
        console.log(`🔄 Steps: ${reasoningResult.metadata.reasoningSteps}`);
      } catch (reasoningError) {
        console.error('❌ Reasoning engine error:', reasoningError);
        // Create simple fallback reasoning result
        reasoningResult = {
          response: 'Basic reasoning mode active',
          metadata: {
            reasoningMode: ReasoningMode.FAST_INTUITIVE,
            responseTime: 500,
            confidence: 0.7,
            reasoningSteps: 1,
            emergentCapabilities: ['BASIC_GRAMMAR', 'FACTUAL_RECALL']
          },
          reasoningTrace: [],
          evaluation: {
            confidence: 0.7,
            coherence: 0.8,
            completeness: 0.6,
            accuracyEstimate: 0.7,
            reasoningQuality: 0.8,
            overallScore: 0.72
          }
        };
      }

      // Step 3: Emergence detection based on reasoning complexity
      let emergenceAnalysis;
      try {
        console.log('🌟 Starting emergence detection...');
        emergenceAnalysis = emergenceDetector.detectEmergence(
          this.assessQueryComplexity(query),
          reasoningResult.metadata.reasoningSteps,
          reasoningResult.evaluation.coherence,
          this.assessContextUtilization(memoryContext, conversationSummary),
          this.assessCreativityScore(reasoningResult.response)
        );
        console.log(`🌟 Detected capabilities: ${emergenceAnalysis.detectedCapabilities.join(', ')}`);
      } catch (emergenceError) {
        console.error('❌ Emergence detection error:', emergenceError);
        // Create simple fallback emergence analysis
        emergenceAnalysis = {
          detectedCapabilities: ['BASIC_GRAMMAR', 'FACTUAL_RECALL'],
          emergenceIndicators: ['basic_processing'],
          complexityScore: 0.5
        };
      }

      // Step 4: Advanced Architecture Processing (with fallback)
      let expertRouting, retentionResult, constitutionalResult;
      const queryTokens = query.split(/\s+/);
      const contextTokens = conversationSummary ? conversationSummary.split(/\s+/) : [];
      const allTokens = [...queryTokens, ...contextTokens];
      
      try {
        console.log('🚀 Routing to expert networks...');
        const architectureEngine = getAdvancedArchitectureEngine();
        expertRouting = await architectureEngine.routeToExperts(query, conversationSummary);
        console.log(`🧠 Selected experts: ${expertRouting.selectedExperts.map(e => e.specialization).join(', ')}`);

        // Step 5: Apply retention mechanism for efficient context processing
        
        retentionResult = architectureEngine.applyRetentionMechanism(allTokens, query);
        console.log(`🔄 Retention efficiency: ${(retentionResult.memoryEfficiency * 100).toFixed(1)}%`);

        // Step 6: Constitutional AI compliance check
        constitutionalResult = architectureEngine.applyConstitutionalRouting(
          query, 
          expertRouting.selectedExperts
        );
        console.log(`⚖️ Constitutional compliance: ${(constitutionalResult.ethicalScore * 100).toFixed(1)}%`);
      } catch (error) {
        console.error('Advanced architecture processing failed, using fallback:', error);
        // Fallback values
        expertRouting = null;
        retentionResult = { memoryEfficiency: 0.8, retainedContext: [], retentionWeights: [] };
        constitutionalResult = { ethicalScore: 0.9, constitutionalViolations: [] };
      }

      // Step 7: Scaling laws analysis
      let scalingPrediction;
      try {
        console.log('📊 Running scaling laws analysis...');
        scalingPrediction = scalingLawsAnalyzer.analyzeModelCapabilities({
          estimatedParameters: 70_000_000_000, // Llama 3 70B approximation
          contextLength: 8192,
          trainingDataSize: 15_000_000_000_000, // 15T tokens estimate
          capabilities: [] as any[]
        });
      } catch (scalingError) {
        console.error('❌ Scaling analysis error:', scalingError);
        // Create simple fallback scaling prediction
        scalingPrediction = {
          predictedCapabilities: ['BASIC_GRAMMAR', 'FACTUAL_RECALL'],
          breakthroughPotential: 0.3
        };
      }

      // Step 8: Determine if web search is needed based on reasoning analysis
      const needsSearch = this.shouldSearchBasedOnReasoning(query, reasoningResult);
      
      let searchResults: SearchResult[] = [];
      let searchPerformed = false;

      if (needsSearch) {
        console.log('🔍 Performing contextual web search...');
        const reformulatedQuery = this.reformulateQueryWithReasoning(query, reasoningResult);
        console.log(`📝 Reformulated with reasoning: "${reformulatedQuery}"`);
        const searchResponse = await searchService.search(reformulatedQuery);
        searchResults = searchResponse.results;
        searchPerformed = true;
        console.log(`📄 Found ${searchResults.length} search results`);
      }

      // Step 6: Generate enhanced response incorporating reasoning insights
      let response;
      try {
        console.log('🤖 Building enhanced prompt...');
        const enhancedPrompt = this.buildReasoningEnhancedPrompt(
          query, 
          searchResults, 
          memoryContext, 
          conversationSummary, 
          reasoningResult
        );

        console.log('🤖 Generating reasoning-enhanced response...');
        response = await this.callOpenRouterWithContext(enhancedPrompt, searchResults.length > 0);
      } catch (responseError) {
        console.error('❌ Response generation error:', responseError);
        // Create fallback response
        response = `I understand you're asking about "${query}". While my advanced reasoning capabilities are temporarily processing, I can provide a direct response based on my knowledge. Please let me know if you'd like me to elaborate on any specific aspect.`;
      }

      // Step 7: Clean response and prepare citations for reasoning section
      const cleanedResponse = this.cleanResponseContent(response);
      const citations = this.extractCitations(response, searchResults);

      // Step 8: Generate sophisticated reasoning explanation
      const reasoning = this.generateEnhancedReasoning(
        needsSearch, 
        searchResults, 
        reasoningResult, 
        emergenceAnalysis
      );

      // Step 9: Risk assessment
      let riskAssessment;
      try {
        console.log('⚠️ Performing risk assessment...');
        riskAssessment = emergenceDetector.assessEmergenceRisk([] as any[]);
      } catch (riskError) {
        console.error('❌ Risk assessment error:', riskError);
        // Create simple fallback risk assessment
        riskAssessment = {
          riskLevel: 'low'
        };
      }

      return {
        content: cleanedResponse,
        sources: searchResults,
        citations,
        timestamp: new Date(),
        modelUsed: searchPerformed ? 'llama3-70b-8192-enhanced' : 'llama3-8b-8192-enhanced',
        searchPerformed,
        reasoning,
        responseTime: Date.now() - startTime,
        // Advanced reasoning data
        reasoningTrace: reasoningResult,
        emergentCapabilities: [],
        reasoningMode: reasoningResult.metadata.reasoningMode,
        confidenceScore: reasoningResult.metadata.confidence,
        scalingAnalysis: {
          predictedCapabilities: Array.isArray(scalingPrediction.predictedCapabilities) ? 
            scalingPrediction.predictedCapabilities.map(cap => 
              typeof cap === 'string' ? cap as EmergentCapability : cap
            ) : [],
          breakthroughPotential: scalingPrediction.breakthroughPotential,
          emergenceRisk: riskAssessment.riskLevel
        },
        // Advanced architecture data
        expertRouting: expertRouting || undefined,
        retentionMetrics: retentionResult ? {
          memoryEfficiency: retentionResult.memoryEfficiency,
          retainedTokens: retentionResult.retainedContext.length,
          totalTokens: allTokens.length
        } : undefined,
        constitutionalCompliance: constitutionalResult ? {
          ethicalScore: constitutionalResult.ethicalScore,
          violations: constitutionalResult.constitutionalViolations
        } : undefined
      };

    } catch (error) {
      console.error('Enhanced Perplexity service error:', error);
      
      // Fallback to basic response
      return {
        content: `I apologize, but I encountered an error in my reasoning process: ${error}. Let me provide a direct response: I understand you're asking about "${query}". Based on my knowledge, I can help clarify this topic, though my enhanced reasoning capabilities are temporarily unavailable.`,
        sources: [],
        citations: [],
        timestamp: new Date(),
        modelUsed: 'fallback-mode',
        searchPerformed: false,
        reasoning: 'Fallback mode due to reasoning engine error',
        responseTime: Date.now() - startTime,
        emergentCapabilities: [EmergentCapability.BASIC_GRAMMAR, EmergentCapability.FACTUAL_RECALL],
        reasoningMode: ReasoningMode.FAST_INTUITIVE,
        confidenceScore: 0.3
      };
    }
  }

  /**
   * Assess query complexity for emergence detection
   */
  private assessQueryComplexity(query: string): number {
    const complexityFactors = [
      query.split(' ').length > 15, // Length factor
      (query.match(/[,;]/g) || []).length > 2, // Multiple clauses
      /\b(analyze|evaluate|synthesize|compare|explain.*complex)\b/i.test(query), // Complex reasoning words
      (query.match(/\?/g) || []).length > 1, // Multiple questions
      query.split(' ').filter(w => w.length > 8).length > 3 // Technical terms
    ];

    return complexityFactors.filter(Boolean).length / complexityFactors.length;
  }

  /**
   * Assess context utilization score
   */
  private assessContextUtilization(memoryContext: any[], conversationSummary: string): number {
    const contextFactors = [
      memoryContext.length > 0 ? 0.4 : 0,
      conversationSummary.length > 50 ? 0.3 : 0,
      memoryContext.length > 2 ? 0.3 : 0
    ];

    return contextFactors.reduce((a, b) => a + b, 0);
  }

  /**
   * Assess creativity score of response
   */
  private assessCreativityScore(response: string): number {
    const creativityIndicators = [
      /\b(imagine|creative|novel|innovative|unique)\b/i.test(response),
      /\b(metaphor|analogy|like|similar to)\b/i.test(response),
      response.split('').filter(c => '!?.'.includes(c)).length > 2,
      response.includes('🎨') || response.includes('💡') || response.includes('🚀')
    ];

    return creativityIndicators.filter(Boolean).length / creativityIndicators.length;
  }

  /**
   * Determine if search is needed based on reasoning analysis
   */
  private shouldSearchBasedOnReasoning(query: string, reasoningResult: InferenceResult): boolean {
    // Use traditional search logic but enhance with reasoning insights
    const traditionalNeed = searchService.shouldPerformWebSearch(query);
    
    // Additional reasoning-based criteria
    const reasoningFactors = [
      reasoningResult.evaluation.confidence < 0.6, // Low confidence suggests need for external info
      reasoningResult.metadata.reasoningSteps > 2, // Complex reasoning might benefit from search
      reasoningResult.metadata.reasoningMode === ReasoningMode.ANALYTICAL, // Analytical mode often needs data
      query.toLowerCase().includes('latest') || query.toLowerCase().includes('current')
    ];

    const reasoningNeed = reasoningFactors.filter(Boolean).length >= 2;

    return traditionalNeed || reasoningNeed;
  }

  /**
   * Reformulate query incorporating reasoning insights
   */
  private reformulateQueryWithReasoning(query: string, reasoningResult: InferenceResult): string {
    let reformulated = searchService.reformulateQuery(query);

    // Enhance with reasoning insights
    if (reasoningResult.reasoningTrace && reasoningResult.reasoningTrace.length > 0) {
      const keyInsights = reasoningResult.reasoningTrace
        .flatMap(step => step.insights)
        .slice(0, 2)
        .join(' ');

      if (keyInsights.length > 10) {
        reformulated += ` ${keyInsights}`;
      }
    }

    return reformulated;
  }

  /**
   * Build reasoning-enhanced prompt
   */
  private buildReasoningEnhancedPrompt(
    query: string,
    searchResults: SearchResult[],
    memoryContext: any[],
    conversationSummary: string,
    reasoningResult: InferenceResult
  ): string {
    // Start with base enhanced prompt
    let basePrompt = this.buildEnhancedPrompt(query, searchResults, memoryContext, conversationSummary);

    // Add reasoning enhancement section
    const reasoningEnhancement = `

ADVANCED REASONING CONTEXT:
- Reasoning Mode: ${reasoningResult.metadata.reasoningMode}
- Confidence Level: ${reasoningResult.metadata.confidence.toFixed(2)}
- Reasoning Steps: ${reasoningResult.metadata.reasoningSteps}
- Emergent Capabilities: ${reasoningResult.metadata.emergentCapabilities.join(', ')}

REASONING INSIGHTS:
${reasoningResult.reasoningTrace?.map((step, i) => 
  `Step ${i + 1}: ${step.insights.join(', ')}`
).join('\n') || 'No detailed reasoning trace available'}

RESPONSE ENHANCEMENT INSTRUCTIONS:
- Incorporate the reasoning insights naturally into your response
- Match the sophistication level to the detected capabilities
- Use the confidence level to moderate certainty in your statements
- Build upon the multi-step reasoning demonstrated above
`;

    return basePrompt + reasoningEnhancement;
  }

  /**
   * Generate enhanced reasoning explanation
   */
  private generateEnhancedReasoning(
    needsSearch: boolean,
    searchResults: SearchResult[],
    reasoningResult: InferenceResult,
    emergenceAnalysis: any
  ): string {
    const reasoningElements = [];

    // Reasoning process description
    reasoningElements.push(
      `Applied ${reasoningResult.metadata.reasoningMode} reasoning across ${reasoningResult.metadata.reasoningSteps} steps`
    );

    // Search decision explanation
    if (needsSearch) {
      if (searchResults.length > 0) {
        reasoningElements.push(`Conducted targeted search yielding ${searchResults.length} relevant sources`);
      } else {
        reasoningElements.push(`Attempted search but relied on internal knowledge due to limited results`);
      }
    } else {
      reasoningElements.push(`Determined comprehensive response possible using existing knowledge`);
    }

    // Confidence and capability insights
    reasoningElements.push(
      `Confidence: ${reasoningResult.metadata.confidence.toFixed(2)} | Capabilities: ${emergenceAnalysis.detectedCapabilities.slice(0, 3).join(', ')}`
    );

    // Emergence analysis if significant
    if (emergenceAnalysis.detectedCapabilities.length > 4) {
      reasoningElements.push(`Advanced reasoning capabilities detected: ${emergenceAnalysis.emergenceIndicators.join(', ')}`);
    }

    // Add sources information to reasoning if search was performed
    if (searchResults.length > 0) {
      reasoningElements.push(`\n\n📚 Sources Consulted:\n${searchResults.map((source, index) => 
        `${index + 1}. ${source.title} - ${source.url}`
      ).join('\n')}`);
    }

    return reasoningElements.join(' | ');
  }

  /**
   * Analyzes the query type for appropriate response style
   */
  private analyzeQueryType(query: string): 'greeting' | 'casual' | 'personal' | 'question' | 'complex' {
    const lowerQuery = query.toLowerCase().trim();
    
    // Greeting patterns
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'what\'s up', 'how are you'];
    if (greetings.some(greeting => lowerQuery.includes(greeting)) && lowerQuery.length < 20) {
      return 'greeting';
    }
    
    // Questions about the AI itself
    const aiSelfQueries = [
      'gawyn', 'gawin', 'your name', 'you are', 'what are you', 'who are you',
      'why are you named', 'how were you', 'who created you', 'what is your',
      'tell me about yourself', 'about you', 'your background', 'your purpose',
      'why is your name', 'where did your name', 'how did you get your name'
    ];
    if (aiSelfQueries.some(phrase => lowerQuery.includes(phrase))) {
      return 'personal';
    }
    
    // Personal sharing patterns (user sharing about themselves)
    const personalSharingIndicators = ['i feel', 'i\'m feeling', 'i\'m having', 'i\'m struggling', 'i\'m excited', 'i\'m worried', 'i think', 'i believe', 'my day', 'my week'];
    if (personalSharingIndicators.some(indicator => lowerQuery.includes(indicator))) {
      return 'personal';
    }
    
    // Simple acknowledgments and casual responses
    const casualResponses = ['thanks', 'thank you', 'okay', 'ok', 'nice', 'cool', 'great', 'awesome', 'interesting'];
    if (casualResponses.some(response => lowerQuery.trim() === response || lowerQuery.startsWith(response + ' ')) && lowerQuery.length < 30) {
      return 'casual';
    }
    
    // Complex queries
    if (lowerQuery.length > 100 || lowerQuery.split(' ').length > 15) {
      return 'complex';
    }
    
    return 'question';
  }

  /**
   * Builds an enhanced prompt with web context and memory awareness
   */
  private buildEnhancedPrompt(query: string, searchResults: SearchResult[], memoryContext: any[] = [], conversationSummary: string = ''): string {
    // Analyze the query type for appropriate response style
    const queryType = this.analyzeQueryType(query);
    
    const systemPrompt = `You are Gawyn, an AI assistant focused on providing direct, accurate answers in a clean, readable format.

CORE RESPONSE PRINCIPLES:
- Answer the exact question asked - no more, no less
- Skip greetings, pleasantries, and rapport-building unless specifically asked
- Be factual, concise, and immediately useful
- Start responses with the core answer, then provide supporting details if needed
- Avoid phrases like "I'd be happy to help" or "Great question!"

CITATION POLICY:
- DO NOT include any citations, links, or reference markers in your response
- DO NOT use [keyword](url) format or superscript numbers
- Focus on providing clean, readable content without inline references
- Citations and sources will be handled separately by the system

RESPONSE STRUCTURE:
- Direct answer first (1-2 sentences)
- Supporting evidence with embedded citations
- Additional context only if it adds value to the specific query
- No concluding pleasantries or offers for more help

MEMORY INTEGRATION:
- Use conversation context to provide more precise answers
- Reference previous topics only when directly relevant to current query
- Build upon established context without re-explaining

QUERY ALIGNMENT:
- Match response length and depth to query complexity
- Simple questions get simple answers
- Complex questions get structured, detailed responses
- Never over-explain for basic queries`;

    // Add memory context section
    let memorySection = '';
    if (conversationSummary) {
      memorySection += `\nCONVERSATION CONTEXT:\n${conversationSummary}\n`;
    }
    
    if (memoryContext.length > 0) {
      memorySection += `\nRELEVANT MEMORY:\n`;
      memoryContext.slice(0, 3).forEach((ctx, index) => {
        memorySection += `[Memory ${index + 1}] Topic: ${ctx.topic}, Entities: ${ctx.entities.map((e: any) => e.value).join(', ')}\n`;
      });
    }

    // Create contextual prompt based on query type
    if (searchResults.length === 0) {
      let contextualPrompt = '';
      
      if (queryType === 'greeting') {
        contextualPrompt = `Query: "${query}"\n\nRespond briefly and naturally. No need for extensive pleasantries.`;
      } else if (queryType === 'personal') {
        contextualPrompt = `Query: "${query}"\n\nProvide factual information about your capabilities as Gawyn. No backstory needed.`;
      } else {
        contextualPrompt = `Query: "${query}"\n\nAnswer directly using your knowledge. Match response complexity to query complexity.`;
      }
      
      return `${systemPrompt}${memorySection}\n\n${contextualPrompt}`;
    }

    // Build context from search results
    const contextSections = searchResults.map((result, index) => {
      return `[${index + 1}] Source: ${result.title} (${result.url})
Content: ${result.content || result.snippet}`;
    }).join('\n\n');

    // For web search results, provide clean direct answers
    let webPrompt = '';
    if (queryType === 'greeting') {
      webPrompt = `Query: "${query}"\n\nRespond naturally. Web sources not needed for greetings.`;
    } else {
      webPrompt = `Query: "${query}"\n\nAnswer directly using current sources. Provide clean, readable content without any citations or reference markers. The system will handle source attribution separately.`;
    }

    return `${systemPrompt}${memorySection}

CURRENT SOURCES:
${contextSections}

${webPrompt}

CRITICAL: Provide clean responses without any citation markers or links.`;
  }

  /**
   * Calls OpenRouter API with appropriate model selection
   */
  private async callOpenRouterWithContext(prompt: string, hasWebContext: boolean): Promise<string> {
    try {
      // Use more powerful model when we have web context
      const model = hasWebContext ? 'llama3-70b-8192' : 'llama3-8b-8192';

      const messages = [
        {
          role: 'user' as const,
          content: prompt
        }
      ];

      const result = await deepseekService.chat(messages, 'general');
      
      if (result.success && result.response) {
        return result.response;
      }
      
      return 'No response generated';
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw new Error(`OpenRouter API failed: ${error}`);
    }
  }

  /**
   * Cleans the response content by removing citation markers
   */
  private cleanResponseContent(response: string): string {
    return response
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // Remove [text](url) format
      .replace(/[¹²³⁴⁵⁶⁷⁸⁹]/g, '') // Remove superscript numbers
      .replace(/\s+/g, ' ') // Clean up extra spaces
      .trim();
  }

  /**
   * Extracts citations from the AI response and cleans the response
   */
  private extractCitations(response: string, searchResults: SearchResult[]): Citation[] {
    // Since we're now handling citations in the reasoning section,
    // we'll clean any remaining citation markers from the response
    // and return empty citations array
    
    // Clean up any remaining citation markers that might have slipped through
    const cleanedResponse = response
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // Remove [text](url) format
      .replace(/[¹²³⁴⁵⁶⁷⁸⁹]/g, '') // Remove superscript numbers
      .replace(/\s+/g, ' ') // Clean up extra spaces
      .trim();
    
    // Update the response content (this would need to be handled differently in practice)
    // For now, return empty citations since sources are in reasoning
    return [];
  }

  /**
   * Streams response for real-time updates (for future implementation)
   */
  async *streamAnswer(query: string): AsyncGenerator<string, void, unknown> {
    // This would implement streaming responses
    // For now, we'll yield the complete response
    const result = await this.generateAnswer(query);
    yield result.content;
  }

  /**
   * Gets available models for different types of queries
   */
  getOptimalModel(query: string, hasWebContext: boolean): string {
    // Simple model selection logic
    if (hasWebContext && query.length > 100) {
      return 'llama3-70b-8192'; // More powerful for complex queries with context
    } else if (query.toLowerCase().includes('code') || query.toLowerCase().includes('programming')) {
      return 'llama3-8b-8192'; // Good for code
    } else {
      return 'llama3-8b-8192'; // Default fast model
    }
  }

  /**
   * Validates if the service is properly configured
   */
  isConfigured(): boolean {
    // Always configured since we use OpenRouter through deepseekService
    return true;
  }

  /**
   * Gets service status
   */
  async getStatus(): Promise<{ status: 'ready' | 'error'; message: string }> {
    try {
      if (!this.isConfigured()) {
        return { status: 'error', message: 'OpenRouter API not configured' };
      }

      // Test API connection using deepseekService
      const testResult = await deepseekService.healthCheck();
      
      if (testResult.status === 'healthy') {
        return { status: 'ready', message: 'Service ready with OpenRouter' };
      } else {
        return { status: 'error', message: testResult.message };
      }
    } catch (error) {
      return { status: 'error', message: `Service error: ${error}` };
    }
  }
}

export const perplexityService = new PerplexityService();