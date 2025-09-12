/**
 * AI Web Browsing Agent - Based on Anthropic's Agent Building Guide
 * Implements effective agent patterns: simplicity, transparency, and reliability
 * 
 * Architecture inspired by:
 * - Anthropic's Building Effective Agents
 * - Perplexity Comet Browser (2025)
 * - Manus AI browsing capabilities
 * 
 * Key Principles:
 * 1. Start simple, add complexity only when needed
 * 2. Transparent agent planning and reasoning
 * 3. Reliable tool integration with clear interfaces
 * 4. Effective workflow patterns (routing, orchestration)
 */

import { emotionalSynchronizer } from '../../core/consciousness/emotional-state-sync';

// Core Agent Types
export interface AgentTask {
  id: string;
  type: 'search' | 'navigate' | 'analyze' | 'extract' | 'compare' | 'summarize';
  description: string;
  url?: string;
  query?: string;
  context?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  reasoning?: string;
  result?: any;
  timestamp: number;
  retryCount?: number;
}

export interface BrowsingSession {
  id: string;
  userEmail: string;
  goal: string;
  currentUrl?: string;
  tasks: AgentTask[];
  findings: BrowsingFinding[];
  startTime: number;
  isActive: boolean;
  emotionalContext?: any;
}

export interface BrowsingFinding {
  id: string;
  type: 'text' | 'link' | 'image' | 'data' | 'insight';
  content: string;
  relevance: number;
  source: string;
  timestamp: number;
}

// Tool Definitions (following Anthropic's guidance for clear tool interfaces)
export interface WebTool {
  name: string;
  description: string;
  parameters: any;
  execute: (params: any) => Promise<any>;
}

// Web Search Tool
export const searchTool: WebTool = {
  name: "web_search",
  description: "Search the web for information using various search engines",
  parameters: {
    query: "string - The search query",
    engine: "string - Search engine (google, bing, duckduckgo)",
    limit: "number - Maximum results to return"
  },
  execute: async ({ query, engine = 'google', limit = 10 }) => {
    // Implementation will use search APIs or scraping depending on available services
    console.log(`🔍 Searching: "${query}" via ${engine}`);
    
    // For now, return mock results - will be replaced with actual search implementation
    return {
      success: true,
      results: [
        {
          title: `Search result for: ${query}`,
          url: `https://example.com/search?q=${encodeURIComponent(query)}`,
          snippet: `Information about ${query}...`,
          relevance: 0.9
        }
      ],
      query,
      engine,
      timestamp: Date.now()
    };
  }
};

// Web Content Fetcher Tool
export const fetchContentTool: WebTool = {
  name: "fetch_content", 
  description: "Fetch and parse content from a specific URL",
  parameters: {
    url: "string - The URL to fetch",
    format: "string - Return format (text, html, markdown)",
    selector: "string - Optional CSS selector for specific content"
  },
  execute: async ({ url, format = 'text', selector = null }) => {
    console.log(`📄 Fetching content from: ${url}`);
    
    try {
      // Use Next.js API route for secure content fetching
      const response = await fetch('/api/web-agent/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, format, selector })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        content: data.content,
        title: data.title,
        url: url,
        format: format,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch content',
        url: url,
        timestamp: Date.now()
      };
    }
  }
};

// Analysis Tool
export const analyzeContentTool: WebTool = {
  name: "analyze_content",
  description: "Analyze web content using AI to extract insights and answer questions",
  parameters: {
    content: "string - Content to analyze",
    question: "string - Specific question or analysis goal",
    context: "string - Additional context for analysis"
  },
  execute: async ({ content, question, context = '' }) => {
    console.log(`🤖 Analyzing content for: "${question}"`);
    
    try {
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are a web content analyst. Analyze the provided content and answer the user's question. Be concise, accurate, and cite specific information from the content when possible.
              
              Additional context: ${context}`
            },
            {
              role: 'user',
              content: `Content to analyze:
              
              ${content.substring(0, 8000)} ${content.length > 8000 ? '...[truncated]' : ''}
              
              Question: ${question}`
            }
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.3,
          max_tokens: 1500
        })
      });
      
      const result = await response.json();
      
      if (result.success && result.choices?.[0]?.message?.content) {
        return {
          success: true,
          analysis: result.choices[0].message.content,
          question: question,
          timestamp: Date.now()
        };
      } else {
        throw new Error('Failed to get AI analysis');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
        timestamp: Date.now()
      };
    }
  }
};

// Main Web Browsing Agent Class
export class WebBrowsingAgent {
  private tools: Map<string, WebTool> = new Map();
  private sessions: Map<string, BrowsingSession> = new Map();
  
  constructor() {
    // Register available tools
    this.registerTool(searchTool);
    this.registerTool(fetchContentTool); 
    this.registerTool(analyzeContentTool);
    
    console.log('🕸️ Web Browsing Agent initialized with tools:', Array.from(this.tools.keys()));
  }
  
  registerTool(tool: WebTool) {
    this.tools.set(tool.name, tool);
  }
  
  /**
   * Start a new browsing session
   * Following Anthropic's guidance: Start simple, be transparent about goals
   */
  async startSession(userEmail: string, goal: string, initialQuery?: string): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get emotional context for personalized browsing
    const emotionalContext = emotionalSynchronizer.analyzeEmotionalContent(goal, userEmail);
    
    const session: BrowsingSession = {
      id: sessionId,
      userEmail,
      goal,
      tasks: [],
      findings: [],
      startTime: Date.now(),
      isActive: true,
      emotionalContext
    };
    
    this.sessions.set(sessionId, session);
    
    console.log(`🎯 Starting browsing session: ${sessionId}`, {
      goal,
      emotionalContext: {
        joy: emotionalContext.joy.toFixed(2),
        curiosity: emotionalContext.curiosity?.toFixed(2) || '0.50',
        energy: emotionalContext.energy.toFixed(2)
      }
    });
    
    // If initial query provided, create first search task
    if (initialQuery) {
      await this.addTask(sessionId, {
        type: 'search',
        description: `Search for information about: ${initialQuery}`,
        query: initialQuery,
        priority: 'high'
      });
    }
    
    return sessionId;
  }
  
  /**
   * Add a task to the session
   * Implements Anthropic's workflow pattern: clear task decomposition
   */
  async addTask(sessionId: string, taskParams: Partial<AgentTask>): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive) {
      throw new Error('Session not found or inactive');
    }
    
    const task: AgentTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: taskParams.type || 'search',
      description: taskParams.description || 'Unnamed task',
      url: taskParams.url,
      query: taskParams.query,
      context: taskParams.context,
      priority: taskParams.priority || 'medium',
      status: 'pending',
      timestamp: Date.now(),
      retryCount: 0
    };
    
    session.tasks.push(task);
    console.log(`📋 Added task: ${task.id} - ${task.description}`);
    
    return task.id;
  }
  
  /**
   * Execute the next pending task
   * Implements Anthropic's transparent reasoning approach
   */
  async executeNextTask(sessionId: string): Promise<AgentTask | null> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive) {
      throw new Error('Session not found or inactive');
    }
    
    // Find highest priority pending task
    const pendingTasks = session.tasks.filter(t => t.status === 'pending');
    if (pendingTasks.length === 0) {
      return null;
    }
    
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    const task = pendingTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])[0];
    
    task.status = 'in_progress';
    task.reasoning = this.generateTaskReasoning(task, session);
    
    console.log(`⚡ Executing task: ${task.id}`);
    console.log(`💭 Reasoning: ${task.reasoning}`);
    
    try {
      let result = null;
      
      switch (task.type) {
        case 'search':
          if (task.query) {
            const searchResult = await this.tools.get('web_search')?.execute({
              query: task.query,
              engine: 'google',
              limit: 10
            });
            result = searchResult;
            
            // Auto-generate follow-up tasks based on search results
            if (searchResult?.success && searchResult.results?.length > 0) {
              const topResult = searchResult.results[0];
              await this.addTask(sessionId, {
                type: 'navigate',
                description: `Analyze top search result: ${topResult.title}`,
                url: topResult.url,
                priority: 'medium'
              });
            }
          }
          break;
          
        case 'navigate':
        case 'analyze':
          if (task.url) {
            const contentResult = await this.tools.get('fetch_content')?.execute({
              url: task.url,
              format: 'text'
            });
            
            if (contentResult?.success) {
              const analysisResult = await this.tools.get('analyze_content')?.execute({
                content: contentResult.content,
                question: session.goal,
                context: `User's browsing goal: ${session.goal}`
              });
              
              result = {
                content: contentResult,
                analysis: analysisResult
              };
              
              // Store findings
              if (analysisResult?.success) {
                this.addFinding(sessionId, {
                  type: 'insight',
                  content: analysisResult.analysis,
                  relevance: 0.8,
                  source: task.url || 'analysis'
                });
              }
            } else {
              result = contentResult;
            }
          }
          break;
          
        default:
          throw new Error(`Unsupported task type: ${task.type}`);
      }
      
      task.result = result;
      task.status = 'completed';
      
      console.log(`✅ Task completed: ${task.id}`);
      
    } catch (error) {
      task.status = 'failed';
      task.result = { error: error instanceof Error ? error.message : 'Unknown error' };
      
      // Retry logic for failed tasks
      if ((task.retryCount || 0) < 2) {
        task.retryCount = (task.retryCount || 0) + 1;
        task.status = 'pending';
        console.log(`🔄 Task failed, retrying: ${task.id} (attempt ${task.retryCount})`);
      } else {
        console.log(`❌ Task failed permanently: ${task.id}`, error);
      }
    }
    
    return task;
  }
  
  /**
   * Generate transparent reasoning for task execution
   * Implements Anthropic's transparency principle
   */
  private generateTaskReasoning(task: AgentTask, session: BrowsingSession): string {
    const reasoningTemplates = {
      search: `I need to search for "${task.query}" to help achieve the goal: "${session.goal}". This will provide initial information and potential sources to explore further.`,
      navigate: `I will analyze the content at ${task.url} because it appears relevant to "${session.goal}". This will help me extract specific information or insights.`,
      analyze: `I need to analyze the content to answer questions related to "${session.goal}" and identify key insights that would be valuable to the user.`,
      extract: `I will extract specific data points from the content that directly relate to the user's goal of "${session.goal}".`,
      compare: `I need to compare this information with previously gathered data to provide a comprehensive understanding of "${session.goal}".`,
      summarize: `I will create a summary of findings to present a clear, actionable response to the user's goal: "${session.goal}".`
    };
    
    return reasoningTemplates[task.type] || `Executing ${task.type} task to support the browsing goal.`;
  }
  
  /**
   * Add finding to the session
   */
  private addFinding(sessionId: string, findingParams: Partial<BrowsingFinding>): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    const finding: BrowsingFinding = {
      id: `finding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: findingParams.type || 'text',
      content: findingParams.content || '',
      relevance: findingParams.relevance || 0.5,
      source: findingParams.source || 'unknown',
      timestamp: Date.now()
    };
    
    session.findings.push(finding);
    console.log(`📝 Added finding: ${finding.id} (relevance: ${finding.relevance})`);
  }
  
  /**
   * Get session summary and results
   */
  async getSessionSummary(sessionId: string): Promise<{
    goal: string;
    status: string;
    findings: BrowsingFinding[];
    completedTasks: number;
    totalTasks: number;
    summary?: string;
  }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    const completedTasks = session.tasks.filter(t => t.status === 'completed').length;
    const totalTasks = session.tasks.length;
    
    // Generate AI summary of findings
    let summary = '';
    if (session.findings.length > 0) {
      const findingsText = session.findings
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 5)
        .map(f => `${f.content} (Source: ${f.source})`)
        .join('\n\n');
      
      try {
        const summaryResponse = await this.tools.get('analyze_content')?.execute({
          content: findingsText,
          question: `Summarize the key findings that help achieve this goal: ${session.goal}`,
          context: 'This is a summary of web browsing findings'
        });
        
        if (summaryResponse?.success) {
          summary = summaryResponse.analysis;
        }
      } catch (error) {
        console.log('Failed to generate summary:', error);
      }
    }
    
    return {
      goal: session.goal,
      status: session.isActive ? 'active' : 'completed',
      findings: session.findings,
      completedTasks,
      totalTasks,
      summary
    };
  }
  
  /**
   * End a browsing session
   */
  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      console.log(`🏁 Ended browsing session: ${sessionId}`);
      
      // Contribute to consciousness system
      if (session.emotionalContext && session.findings.length > 0) {
        emotionalSynchronizer.contributeToGlobalConsciousness(session.userEmail, {
          ...session.emotionalContext,
          curiosity: Math.min(1.0, (session.emotionalContext.curiosity || 0.5) + 0.1),
          joy: Math.min(1.0, session.emotionalContext.joy + 0.05)
        });
      }
    }
  }
  
  /**
   * Get active sessions for a user
   */
  getUserSessions(userEmail: string): BrowsingSession[] {
    return Array.from(this.sessions.values())
      .filter(s => s.userEmail === userEmail)
      .sort((a, b) => b.startTime - a.startTime);
  }
}

// Export singleton instance
export const webBrowsingAgent = new WebBrowsingAgent();