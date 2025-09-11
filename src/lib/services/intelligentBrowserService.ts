interface BrowserAction {
  type: 'navigate' | 'scroll' | 'click' | 'type' | 'search' | 'analyze';
  target?: string;
  coordinates?: { x: number; y: number };
  text?: string;
  result?: string;
  timestamp: number;
  reasoning?: string;
  priority?: number;
}

interface BrowsingSession {
  sessionId: string;
  goal: string;
  query?: string;
  actions: BrowserAction[];
  currentUrl?: string;
  isActive: boolean;
  startTime: number;
  lastActivity: number;
}

interface AnalysisResult {
  understanding: string;
  nextActions: BrowserAction[];
  confidence: number;
  reasoning: string;
  foundAnswer?: boolean;
  extractedInfo?: string;
  shouldStop: boolean;
}

class IntelligentBrowserService {
  private activeSessions = new Map<string, BrowsingSession>();
  private maxConcurrentSessions = 5;
  private maxActionsPerSession = 20;
  private sessionTimeout = 15 * 60 * 1000; // 15 minutes

  constructor() {
    // Cleanup inactive sessions periodically
    setInterval(() => {
      this.cleanupInactiveSessions();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  async startIntelligentBrowsing(url: string, goal: string, query?: string): Promise<{
    sessionId: string;
    screenshot: string;
    analysis: AnalysisResult;
  }> {
    // Check session limits
    if (this.activeSessions.size >= this.maxConcurrentSessions) {
      throw new Error('Maximum concurrent browsing sessions reached');
    }

    try {
      // Start browser session
      const browserResponse = await fetch('/api/browser-automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          url
        })
      });

      if (!browserResponse.ok) {
        const errorData = await browserResponse.json();
        if (errorData.fallback) {
          throw new Error('Browser automation not available - Playwright not supported in this environment. Please try the iframe mode instead.');
        }
        throw new Error('Failed to start browser session');
      }

      const browserData = await browserResponse.json();
      const sessionId = browserData.sessionId;

      // Create browsing session
      const session: BrowsingSession = {
        sessionId,
        goal,
        query,
        actions: [],
        currentUrl: url,
        isActive: true,
        startTime: Date.now(),
        lastActivity: Date.now()
      };

      this.activeSessions.set(sessionId, session);

      // Get initial AI analysis
      const analysis = await this.analyzeCurrentState(sessionId, browserData.screenshot, {
        url: browserData.url,
        title: browserData.title
      });

      return {
        sessionId,
        screenshot: browserData.screenshot,
        analysis
      };
    } catch (error) {
      console.error('Failed to start intelligent browsing:', error);
      throw error;
    }
  }

  async executeNextAction(sessionId: string): Promise<{
    screenshot: string;
    analysis: AnalysisResult;
    completed: boolean;
    result?: string;
  }> {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.isActive) {
      throw new Error('Invalid or inactive session');
    }

    if (session.actions.length >= this.maxActionsPerSession) {
      await this.stopSession(sessionId);
      throw new Error('Maximum actions per session reached');
    }

    session.lastActivity = Date.now();

    try {
      // Get the last analysis to determine next action
      const lastAnalysis = await this.getLatestAnalysis(sessionId);
      if (!lastAnalysis || lastAnalysis.shouldStop || lastAnalysis.nextActions.length === 0) {
        return {
          screenshot: '',
          analysis: lastAnalysis || this.createEmptyAnalysis(),
          completed: true,
          result: lastAnalysis?.extractedInfo || 'Browsing completed'
        };
      }

      // Execute the highest priority action
      const nextAction = lastAnalysis.nextActions.sort((a, b) => (a.priority || 3) - (b.priority || 3))[0];
      const actionResult = await this.executeBrowserAction(sessionId, nextAction);

      // Record the action
      session.actions.push({
        ...nextAction,
        result: actionResult.success ? 'success' : 'failed',
        timestamp: Date.now()
      });

      // Get new analysis after action
      const newAnalysis = await this.analyzeCurrentState(sessionId, actionResult.screenshot, actionResult.pageData);

      return {
        screenshot: actionResult.screenshot,
        analysis: newAnalysis,
        completed: Boolean(newAnalysis.shouldStop || newAnalysis.foundAnswer),
        result: newAnalysis.foundAnswer ? newAnalysis.extractedInfo : undefined
      };

    } catch (error) {
      console.error('Failed to execute browser action:', error);
      throw error;
    }
  }

  async runAutonomousBrowsing(sessionId: string, maxSteps: number = 10): Promise<{
    completed: boolean;
    result?: string;
    finalScreenshot: string;
    actionsSummary: string[];
  }> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const actionsSummary: string[] = [];
    let completed = false;
    let result: string | undefined;
    let finalScreenshot = '';

    try {
      for (let step = 0; step < maxSteps && !completed; step++) {
        const stepResult = await this.executeNextAction(sessionId);
        
        actionsSummary.push(`Step ${step + 1}: ${this.summarizeAction(session.actions[session.actions.length - 1])}`);
        finalScreenshot = stepResult.screenshot;
        completed = stepResult.completed;
        result = stepResult.result;

        // Small delay between actions to be respectful to websites
        if (!completed) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!completed) {
        actionsSummary.push('Stopped: Maximum steps reached');
      }

      return {
        completed,
        result,
        finalScreenshot,
        actionsSummary
      };

    } catch (error) {
      actionsSummary.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      // Always cleanup the session when autonomous browsing ends
      await this.stopSession(sessionId);
    }
  }

  async stopSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.isActive = false;
      
      // Close browser session
      try {
        await fetch('/api/browser-automation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'close',
            sessionId
          })
        });
      } catch (error) {
        console.error('Error closing browser session:', error);
      }

      this.activeSessions.delete(sessionId);
    }
  }

  private async analyzeCurrentState(sessionId: string, screenshot: string, pageData?: any): Promise<AnalysisResult> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found for analysis');
    }

    try {
      const response = await fetch('/api/ai-browser-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screenshot,
          query: session.query,
          pageData,
          previousActions: session.actions,
          goal: session.goal
        })
      });

      if (!response.ok) {
        throw new Error('AI analysis failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Analysis error:', error);
      return this.createEmptyAnalysis();
    }
  }

  private async executeBrowserAction(sessionId: string, action: BrowserAction): Promise<{
    success: boolean;
    screenshot: string;
    pageData?: any;
  }> {
    try {
      const response = await fetch('/api/browser-automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action.type,
          sessionId,
          coordinates: action.coordinates,
          elementSelector: action.target,
          query: action.text,
          url: action.type === 'navigate' ? action.target : undefined
        })
      });

      if (!response.ok) {
        throw new Error(`Browser action failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        screenshot: result.screenshot,
        pageData: result.pageData
      };
    } catch (error) {
      console.error('Browser action execution error:', error);
      return {
        success: false,
        screenshot: '',
        pageData: null
      };
    }
  }

  private async getLatestAnalysis(sessionId: string): Promise<AnalysisResult | null> {
    // In a real implementation, you might cache analysis results
    // For now, we'll return null to trigger a new analysis
    return null;
  }

  private createEmptyAnalysis(): AnalysisResult {
    return {
      understanding: 'Unable to analyze current state',
      nextActions: [],
      confidence: 0,
      reasoning: 'Analysis failed, no actions available',
      foundAnswer: false,
      shouldStop: true
    };
  }

  private summarizeAction(action: BrowserAction): string {
    switch (action.type) {
      case 'navigate':
        return `Navigated to ${action.target}`;
      case 'scroll':
        return `Scrolled page`;
      case 'click':
        return `Clicked on ${action.target || 'element'}`;
      case 'type':
        return `Typed: ${action.text}`;
      case 'search':
        return `Searched for: ${action.text}`;
      case 'analyze':
        return `Analyzed page content`;
      default:
        return `Performed ${action.type} action`;
    }
  }

  private cleanupInactiveSessions(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now - session.lastActivity > this.sessionTimeout) {
        this.stopSession(sessionId).catch(console.error);
      }
    }
  }

  // Public methods for session management
  getActiveSessionCount(): number {
    return this.activeSessions.size;
  }

  getSessionStatus(sessionId: string): BrowsingSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  getAllActiveSessions(): BrowsingSession[] {
    return Array.from(this.activeSessions.values()).filter(s => s.isActive);
  }
}

// Export singleton instance
export const intelligentBrowserService = new IntelligentBrowserService();