'use client';

import { useState, useEffect, useRef } from 'react';
import { intelligentBrowserService } from '@/lib/services/intelligentBrowserService';

interface IntelligentGawinBrowserProps {
  url: string;
  query?: string;
  onResult?: (result: string) => void;
  onProgress?: (step: string) => void;
}

interface BrowsingState {
  mode: 'iframe' | 'intelligent' | 'blocked';
  sessionId?: string;
  screenshot?: string;
  isProcessing: boolean;
  progress: string[];
  result?: string;
  error?: string;
}

interface AnalysisResult {
  understanding: string;
  nextActions: any[];
  confidence: number;
  reasoning: string;
  foundAnswer?: boolean;
  extractedInfo?: string;
  shouldStop: boolean;
}

export default function IntelligentGawinBrowser({ 
  url, 
  query, 
  onResult, 
  onProgress 
}: IntelligentGawinBrowserProps) {
  const [browsingState, setBrowsingState] = useState<BrowsingState>({
    mode: 'iframe', // Always start with iframe but AI agent is ready
    isProcessing: false,
    progress: []
  });
  const [aiAgentActive, setAiAgentActive] = useState(true); // AI agent always active
  const [userGoal, setUserGoal] = useState(query || 'Assist with browsing this website');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check if domain should be blocked or use intelligent mode
  const isUrlBlocked = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      // Block self-loading (current domain)
      const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
      if (hostname === currentDomain || hostname.includes('gawin') || hostname.includes('vercel.app')) {
        return true;
      }
      
      // Block other problematic domains
      const blockedDomains = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        'file://',
        'javascript:',
        'data:',
        'blob:'
      ];
      
      return blockedDomains.some(domain => 
        hostname.includes(domain) || url.startsWith(domain)
      );
    } catch {
      return true;
    }
  };

  useEffect(() => {
    if (isUrlBlocked(url)) {
      setBrowsingState(prev => ({ ...prev, mode: 'blocked' }));
    } else {
      setBrowsingState(prev => ({ ...prev, mode: 'iframe' }));
    }

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (browsingState.sessionId) {
        intelligentBrowserService.stopSession(browsingState.sessionId).catch(console.error);
      }
    };
  }, [url]);

  const startIntelligentBrowsing = async () => {
    if (browsingState.isProcessing) return;

    setBrowsingState(prev => ({
      ...prev,
      mode: 'intelligent',
      isProcessing: true,
      progress: ['Starting AI-powered browsing...'],
      error: undefined
    }));

    abortControllerRef.current = new AbortController();

    try {
      onProgress?.('Starting intelligent browsing session...');
      
      const { sessionId, screenshot, analysis } = await intelligentBrowserService.startIntelligentBrowsing(
        url,
        userGoal,
        query
      );

      if (abortControllerRef.current.signal.aborted) return;

      setBrowsingState(prev => ({
        ...prev,
        sessionId,
        screenshot,
        progress: [...prev.progress, `Session started: ${analysis.understanding}`]
      }));

      onProgress?.(`AI Analysis: ${analysis.understanding}`);

      // Run autonomous browsing
      const result = await intelligentBrowserService.runAutonomousBrowsing(sessionId, 8);

      if (abortControllerRef.current.signal.aborted) return;

      setBrowsingState(prev => ({
        ...prev,
        isProcessing: false,
        result: result.result,
        screenshot: result.finalScreenshot,
        progress: [...prev.progress, ...result.actionsSummary]
      }));

      if (result.result) {
        onResult?.(result.result);
        onProgress?.(`Completed: ${result.result}`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Browsing failed';
      const isPlaywrightError = errorMessage.includes('Playwright not supported');
      
      setBrowsingState(prev => ({
        ...prev,
        isProcessing: false,
        error: isPlaywrightError 
          ? 'AI browsing requires Playwright which is not available in this deployment environment. Please use the iframe mode instead.' 
          : errorMessage
      }));
      onProgress?.(`Error: ${errorMessage}`);
    }
  };

  const stopIntelligentBrowsing = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (browsingState.sessionId) {
      intelligentBrowserService.stopSession(browsingState.sessionId).catch(console.error);
    }
    setBrowsingState(prev => ({
      ...prev,
      isProcessing: false,
      progress: [...prev.progress, 'Stopped by user']
    }));
    onProgress?.('Browsing stopped');
  };

  const renderIntelligentMode = () => (
    <div className="h-full bg-gray-50">
      {/* AI Browser Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">🤖</span>
            </div>
            <div>
              <h3 className="font-semibold">Gawin AI Browser</h3>
              <p className="text-sm opacity-90">Intelligent web navigation</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {browsingState.isProcessing && (
              <button
                onClick={stopIntelligentBrowsing}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-colors"
              >
                Stop
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-full">
        {/* Screenshot/Visual Area */}
        <div className="flex-1 p-4">
          {browsingState.screenshot ? (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 border-b">
                <div className="text-sm text-gray-600">Live Screenshot</div>
              </div>
              <img
                src={`data:image/png;base64,${browsingState.screenshot}`}
                alt="Browser Screenshot"
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI-Powered Web Browsing
              </h3>
              <p className="text-gray-600 mb-6">
                Let Gawin AI navigate and extract information from websites for you
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What would you like me to do on this website?
                </label>
                <textarea
                  value={userGoal}
                  onChange={(e) => setUserGoal(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="e.g., Find contact information, search for specific topics, extract key data..."
                />
              </div>

              <button
                onClick={startIntelligentBrowsing}
                disabled={browsingState.isProcessing}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {browsingState.isProcessing ? 'AI is Browsing...' : 'Start AI Browsing'}
              </button>
            </div>
          )}
        </div>

        {/* Progress Panel */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b">
            <h4 className="font-semibold text-gray-900">AI Progress</h4>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {browsingState.progress.map((step, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-purple-600">{index + 1}</span>
                </div>
                <p className="text-sm text-gray-700">{step}</p>
              </div>
            ))}
            
            {browsingState.isProcessing && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-purple-600 font-medium">Processing...</p>
              </div>
            )}

            {browsingState.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{browsingState.error}</p>
              </div>
            )}

            {browsingState.result && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h5 className="font-semibold text-green-900 mb-1">Result Found!</h5>
                <p className="text-sm text-green-800">{browsingState.result}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBlockedDomain = () => (
    <div className="h-full p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-red-600">🚫</span>
            <h3 className="font-semibold text-red-900">Domain Blocked</h3>
          </div>
          <p className="text-red-800 text-sm mb-3">
            <strong>{new URL(url).hostname}</strong> cannot be loaded for security reasons.
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-2xl">🤖</span>
            <h3 className="font-semibold text-purple-900">AI Agent Available</h3>
          </div>
          <p className="text-purple-800 text-sm mb-4">
            Even blocked sites can be analyzed by the AI agent through the floating chat bubble.
          </p>
          <p className="text-purple-700 text-xs">
            Try asking questions about this website using the chat interface. 
            The AI agent is always ready to help analyze content and find information.
          </p>
        </div>
      </div>
    </div>
  );

  const renderIframeMode = () => (
    <div className="h-full relative">
      <iframe
        src={url}
        className="w-full h-full border-0"
        title="Gawin Browser"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
        onError={() => setBrowsingState(prev => ({ ...prev, mode: 'blocked' }))}
      />
      
      {/* AI Agent Status Indicator */}
      <div className="absolute top-4 right-4">
        <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">🤖 AI Agent Active</span>
        </div>
      </div>

      {/* AI Agent Insights Panel (when processing) */}
      {browsingState.isProcessing && (
        <div className="absolute bottom-4 right-4 w-80 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold text-purple-700">AI Agent Working</span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {browsingState.progress.slice(-3).map((step, index) => (
              <p key={index} className="text-xs text-gray-600">{step}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full bg-white">
      {/* Browser Chrome */}
      <div className="bg-gray-100 border-b border-gray-300 px-4 py-2">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex-1 bg-white rounded-lg px-3 py-1 border border-gray-300">
            <div className="flex items-center space-x-2">
              <span className="text-purple-600 text-sm">🤖</span>
              <span className="text-gray-700 text-sm font-mono">{new URL(url).hostname}</span>
              <div className="flex-1"></div>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Gawin AI Agent</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-full">
        {browsingState.mode === 'blocked' && renderBlockedDomain()}
        {browsingState.mode === 'iframe' && renderIframeMode()}
        {browsingState.mode === 'intelligent' && renderIntelligentMode()}
      </div>
    </div>
  );
}