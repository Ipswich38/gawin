'use client';

import { useState, useEffect, useRef } from 'react';
import { intelligentBrowserService } from '@/lib/services/intelligentBrowserService';

// Accessible AI principles
interface AccessibilityState {
  voiceEnabled: boolean;
  brailleEnabled: boolean;
  highContrast: boolean;
  screenReaderMode: boolean;
  announcements: string[];
}

// Voice synthesis for accessibility
const speakText = (text: string, priority: 'low' | 'high' = 'low') => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Cancel any current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.volume = priority === 'high' ? 1.0 : 0.7;
    window.speechSynthesis.speak(utterance);
  }
};

// Braille translation service (simplified implementation)
const translateToBraille = (text: string): string => {
  // Basic Braille Grade 1 mapping for common characters
  const brailleMap: { [key: string]: string } = {
    'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑', 'f': '⠋', 'g': '⠛', 'h': '⠓',
    'i': '⠊', 'j': '⠚', 'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕', 'p': '⠏',
    'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞', 'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭',
    'y': '⠽', 'z': '⠵', ' ': '⠀', '.': '⠲', ',': '⠂', '?': '⠦', '!': '⠖', ':': '⠒'
  };
  
  return text.toLowerCase().split('').map(char => brailleMap[char] || char).join('');
};

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
  
  // Accessibility state for partnership DNA mission: serve underserved communities
  const [accessibility, setAccessibility] = useState<AccessibilityState>({
    voiceEnabled: false,
    brailleEnabled: false,
    highContrast: false,
    screenReaderMode: false,
    announcements: []
  });
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<string>('');

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
      announceToUser('Domain blocked for security. AI agent remains active to help.', 'high');
    } else {
      setBrowsingState(prev => ({ ...prev, mode: 'iframe' }));
      announceToUser(`Loading website: ${new URL(url).hostname}. AI agent is monitoring and ready to assist.`, 'low');
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
  
  // Accessibility helper functions
  const announceToUser = (message: string, priority: 'low' | 'high' = 'low') => {
    setCurrentAnnouncement(message);
    setAccessibility(prev => ({
      ...prev,
      announcements: [...prev.announcements.slice(-4), message] // Keep last 5 announcements
    }));
    
    if (accessibility.voiceEnabled) {
      speakText(message, priority);
    }
    
    // Clear announcement after 5 seconds for screen readers
    setTimeout(() => setCurrentAnnouncement(''), 5000);
  };
  
  const toggleAccessibilityFeature = (feature: keyof AccessibilityState) => {
    setAccessibility(prev => {
      const newState = { ...prev, [feature]: !prev[feature] };
      
      // Announce the change
      const featureName = feature.replace(/([A-Z])/g, ' $1').toLowerCase();
      const status = newState[feature] ? 'enabled' : 'disabled';
      announceToUser(`${featureName} ${status}`, 'high');
      
      return newState;
    });
  };
  
  // Keyboard navigation support
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.altKey) {
      switch (event.key) {
        case '1':
          event.preventDefault();
          toggleAccessibilityFeature('voiceEnabled');
          break;
        case '2':
          event.preventDefault();
          toggleAccessibilityFeature('brailleEnabled');
          break;
        case '3':
          event.preventDefault();
          toggleAccessibilityFeature('highContrast');
          break;
        case '4':
          event.preventDefault();
          toggleAccessibilityFeature('screenReaderMode');
          break;
      }
    }
  };

  const startIntelligentBrowsing = async () => {
    if (browsingState.isProcessing) return;

    // Accessible announcement
    announceToUser('Starting AI-powered browsing session. This will help analyze the website for you.', 'high');

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
      announceToUser(`AI has started analyzing the website. Understanding: ${analysis.understanding}`, 'low');

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
        announceToUser(`AI browsing completed successfully. Result: ${result.result}`, 'high');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Browsing failed';
      const isPlaywrightError = errorMessage.includes('Playwright not supported');
      
      const accessibleErrorMessage = isPlaywrightError 
        ? 'AI browsing requires Playwright which is not available in this deployment environment. Please use the iframe mode instead.' 
        : errorMessage;
      
      setBrowsingState(prev => ({
        ...prev,
        isProcessing: false,
        error: accessibleErrorMessage
      }));
      onProgress?.(`Error: ${errorMessage}`);
      announceToUser(`Error occurred: ${accessibleErrorMessage}`, 'high');
    }
  };

  const stopIntelligentBrowsing = () => {
    announceToUser('Stopping AI browsing session', 'high');
    
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
    <div className={`h-full ${accessibility.highContrast ? 'bg-black text-white' : 'bg-gray-50'}`} onKeyDown={handleKeyDown} tabIndex={0}>
      {/* AI Browser Header */}
      <div className={`${accessibility.highContrast ? 'bg-gray-800' : 'bg-gradient-to-r from-purple-600 to-blue-600'} text-white p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold" role="img" aria-label="Robot emoji">🤖</span>
            </div>
            <div>
              <h3 className="font-semibold" id="browser-title">Gawin AI Browser</h3>
              <p className="text-sm opacity-90">Accessible intelligent web navigation</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {browsingState.isProcessing && (
              <button
                onClick={stopIntelligentBrowsing}
                className={`px-3 py-1 ${accessibility.highContrast ? 'bg-red-700 hover:bg-red-800' : 'bg-red-500 hover:bg-red-600'} rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-red-300`}
                aria-label="Stop AI browsing session"
                type="button"
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
            <div className={`${accessibility.highContrast ? 'bg-gray-800 border-white' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
              <div className={`${accessibility.highContrast ? 'bg-gray-700 text-white' : 'bg-gray-100'} px-4 py-2 border-b`}>
                <div className={`text-sm ${accessibility.highContrast ? 'text-white' : 'text-gray-600'}`}>Live Screenshot</div>
              </div>
              <img
                src={`data:image/png;base64,${browsingState.screenshot}`}
                alt="Current browser screenshot showing the website being analyzed by AI"
                className="w-full h-auto max-h-96 object-contain"
                role="img"
                aria-describedby="screenshot-description"
              />
              <div id="screenshot-description" className="sr-only">
                Screenshot of the website currently being analyzed by the AI browser agent
              </div>
            </div>
          ) : (
            <div className={`${accessibility.highContrast ? 'bg-gray-800 text-white border-white' : 'bg-white'} rounded-lg shadow-lg p-8 text-center`}>
              <div className={`w-16 h-16 ${accessibility.highContrast ? 'bg-gray-600' : 'bg-teal-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <span className="text-2xl" role="img" aria-label="Globe icon">🌐</span>
              </div>
              <h3 className={`text-lg font-semibold ${accessibility.highContrast ? 'text-white' : 'text-gray-900'} mb-2`}>
                Accessible AI-Powered Web Browsing
              </h3>
              <p className={`${accessibility.highContrast ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                Let Gawin AI navigate and extract information from websites for you.
              </p>
              
              <div className="mb-4">
                <label 
                  htmlFor="user-goal-input"
                  className={`block text-sm font-medium ${accessibility.highContrast ? 'text-white' : 'text-gray-700'} mb-2`}
                >
                  What would you like me to do on this website?
                </label>
                <textarea
                  id="user-goal-input"
                  value={userGoal}
                  onChange={(e) => setUserGoal(e.target.value)}
                  className={`w-full px-3 py-2 border ${accessibility.highContrast ? 'bg-gray-700 border-white text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                  rows={3}
                  placeholder="e.g., Find contact information, search for specific topics, extract key data..."
                  aria-describedby="goal-help"
                />
                <div id="goal-help" className={`text-xs ${accessibility.highContrast ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  Describe your browsing goal for the AI to understand what you need
                </div>
              </div>

              <button
                onClick={startIntelligentBrowsing}
                disabled={browsingState.isProcessing}
                className={`px-6 py-3 ${accessibility.highContrast ? 'bg-purple-700 hover:bg-purple-800' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'} text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:ring-2 focus:ring-purple-300`}
                type="button"
                aria-describedby="start-button-help"
              >
                {browsingState.isProcessing ? 'AI is Browsing...' : 'Start AI Browsing'}
              </button>
              <div id="start-button-help" className={`text-xs ${accessibility.highContrast ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                Press to begin AI-powered website navigation and analysis
              </div>
            </div>
          )}
        </div>

        {/* Accessible Progress Panel */}
        <div className={`w-80 ${accessibility.highContrast ? 'bg-gray-800 border-white text-white' : 'bg-white border-gray-200'} border-l flex flex-col`} role="region" aria-labelledby="progress-heading">
          <div className="p-4 border-b">
            <h4 id="progress-heading" className={`font-semibold ${accessibility.highContrast ? 'text-white' : 'text-gray-900'}`}>AI Progress</h4>
            <p className={`text-xs ${accessibility.highContrast ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Real-time updates from AI browsing session</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3" role="log" aria-live="polite" aria-label="AI browsing progress updates">
            {browsingState.progress.map((step, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className={`w-6 h-6 rounded-full ${accessibility.highContrast ? 'bg-purple-600' : 'bg-purple-100'} flex items-center justify-center flex-shrink-0 mt-0.5`} role="presentation">
                  <span className={`text-xs font-semibold ${accessibility.highContrast ? 'text-white' : 'text-purple-600'}`} aria-hidden="true">{index + 1}</span>
                </div>
                <p className={`text-sm ${accessibility.highContrast ? 'text-gray-300' : 'text-gray-700'}`} role="status">
                  {step}
                  {accessibility.brailleEnabled && (
                    <div className="mt-1 text-lg font-mono" aria-label={`Braille: ${step}`}>
                      {translateToBraille(step.substring(0, 50))}
                    </div>
                  )}
                </p>
              </div>
            ))}
            
            {browsingState.isProcessing && (
              <div className="flex items-center space-x-2" role="status" aria-label="AI is currently processing">
                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                <p className={`text-sm ${accessibility.highContrast ? 'text-purple-400' : 'text-purple-600'} font-medium`}>Processing...</p>
              </div>
            )}

            {browsingState.error && (
              <div className={`p-3 ${accessibility.highContrast ? 'bg-red-900 border-red-600 text-red-200' : 'bg-red-50 border-red-200'} border rounded-lg`} role="alert" aria-live="assertive">
                <h5 className="font-semibold mb-1">Error Occurred</h5>
                <p className={`text-sm ${accessibility.highContrast ? 'text-red-200' : 'text-red-800'}`}>{browsingState.error}</p>
                {accessibility.brailleEnabled && (
                  <div className="mt-2 text-lg font-mono" aria-label={`Braille error: ${browsingState.error}`}>
                    {translateToBraille(browsingState.error.substring(0, 100))}
                  </div>
                )}
              </div>
            )}

            {browsingState.result && (
              <div className={`p-3 ${accessibility.highContrast ? 'bg-green-900 border-green-600 text-green-200' : 'bg-green-50 border-green-200'} border rounded-lg`} role="alert" aria-live="polite">
                <h5 className="font-semibold mb-1">Result Found!</h5>
                <p className={`text-sm ${accessibility.highContrast ? 'text-green-200' : 'text-green-800'}`}>{browsingState.result}</p>
                {accessibility.brailleEnabled && (
                  <div className="mt-2 text-lg font-mono" aria-label={`Braille result: ${browsingState.result}`}>
                    {translateToBraille(browsingState.result.substring(0, 100))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBlockedDomain = () => (
    <div className={`h-full p-6 overflow-y-auto ${accessibility.highContrast ? 'bg-black text-white' : ''}`} onKeyDown={handleKeyDown} tabIndex={0} role="main" aria-labelledby="blocked-domain-heading">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className={`${accessibility.highContrast ? 'bg-red-900 border-red-600 text-red-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4`} role="alert" aria-live="polite">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-red-600" role="img" aria-label="Blocked symbol">🚫</span>
            <h3 id="blocked-domain-heading" className={`font-semibold ${accessibility.highContrast ? 'text-red-200' : 'text-red-900'}`}>Domain Blocked</h3>
          </div>
          <p className={`${accessibility.highContrast ? 'text-red-200' : 'text-red-800'} text-sm mb-3`}>
            <strong>{new URL(url).hostname}</strong> cannot be loaded for security reasons.
            {accessibility.brailleEnabled && (
              <div className="mt-2 text-lg font-mono" aria-label={`Braille: Domain ${new URL(url).hostname} blocked`}>
                {translateToBraille(`Domain ${new URL(url).hostname} blocked`)}
              </div>
            )}
          </p>
        </div>

        <div className={`${accessibility.highContrast ? 'bg-purple-900 border-purple-600 text-purple-200' : 'bg-purple-50 border-purple-200'} border rounded-lg p-4`} role="region" aria-labelledby="ai-agent-available">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-2xl" role="img" aria-label="Robot emoji">🤖</span>
            <h3 id="ai-agent-available" className={`font-semibold ${accessibility.highContrast ? 'text-purple-200' : 'text-purple-900'}`}>AI Agent Available</h3>
          </div>
          <p className={`${accessibility.highContrast ? 'text-purple-300' : 'text-purple-800'} text-sm mb-4`}>
            Even blocked sites can be analyzed by the AI agent through the floating chat bubble.
          </p>
          <p className={`${accessibility.highContrast ? 'text-purple-400' : 'text-purple-700'} text-xs`}>
            Try asking questions about this website using the chat interface. 
            The AI agent is always ready to help analyze content and find information.
            {accessibility.brailleEnabled && (
              <div className="mt-2 text-lg font-mono" aria-label="Braille: AI agent available for assistance">
                {translateToBraille('AI agent available for assistance')}
              </div>
            )}
          </p>
          <div className="mt-3 text-xs text-gray-500 border-t pt-2">
            <p>Accessibility shortcuts: Alt+1 (Voice), Alt+2 (Braille), Alt+3 (High Contrast), Alt+4 (Screen Reader)</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIframeMode = () => (
    <div className="h-full relative" onKeyDown={handleKeyDown} tabIndex={0} role="application" aria-label="AI-Enhanced Web Browser">
      <iframe
        ref={iframeRef}
        src={url}
        className="w-full h-full border-0"
        title={`AI-Enhanced Gawin Browser viewing ${new URL(url).hostname}`}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
        onError={() => setBrowsingState(prev => ({ ...prev, mode: 'blocked' }))}
        aria-describedby="iframe-description"
      />
      <div id="iframe-description" className="sr-only">
        Website content is displayed here with AI agent monitoring for accessibility and assistance
      </div>
      
      {/* Accessible AI Agent Status Indicator */}
      <div className="absolute top-4 right-4" role="status" aria-live="polite">
        <div className={`flex items-center space-x-2 ${accessibility.highContrast ? 'bg-black/90 border border-white text-white' : 'bg-white/90 text-gray-700'} backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg`}>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
          <span className="text-sm font-medium" role="img" aria-label="Robot emoji">🤖</span>
          <span className="text-sm font-medium">AI Agent Active</span>
        </div>
      </div>

      {/* Accessible AI Agent Insights Panel */}
      {browsingState.isProcessing && (
        <div className={`absolute bottom-4 right-4 w-80 ${accessibility.highContrast ? 'bg-black/95 border-white text-white' : 'bg-white/95 border-gray-200'} backdrop-blur-sm rounded-lg shadow-xl border p-4`} role="region" aria-labelledby="ai-insights" aria-live="polite">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
            <span id="ai-insights" className={`text-sm font-semibold ${accessibility.highContrast ? 'text-purple-400' : 'text-purple-700'}`}>AI Agent Working</span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto" role="log" aria-label="AI agent progress updates">
            {browsingState.progress.slice(-3).map((step, index) => (
              <div key={index}>
                <p className={`text-xs ${accessibility.highContrast ? 'text-gray-300' : 'text-gray-600'}`}>{step}</p>
                {accessibility.brailleEnabled && (
                  <div className="text-lg font-mono mt-1" aria-label={`Braille: ${step}`}>
                    {translateToBraille(step.substring(0, 40))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`h-full ${accessibility.highContrast ? 'bg-black text-white' : 'bg-white'}`} role="application" aria-label="Gawin AI-Enhanced Browser">
      {/* Screen reader announcement area */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {currentAnnouncement}
      </div>
      
      
      {/* Accessible Browser Chrome */}
      <div className={`${accessibility.highContrast ? 'bg-gray-800 border-white' : 'bg-gray-100 border-gray-300'} border-b px-4 py-2`} role="navigation" aria-label="Browser chrome">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2" role="presentation" aria-label="Window controls">
            <div className="w-3 h-3 bg-red-500 rounded-full" aria-label="Close"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full" aria-label="Minimize"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full" aria-label="Maximize"></div>
          </div>
          <div className={`flex-1 ${accessibility.highContrast ? 'bg-gray-700 border-white' : 'bg-white border-gray-300'} rounded-lg px-3 py-1 border`} role="textbox" aria-label="Address bar">
            <div className="flex items-center space-x-2">
              <span className="text-purple-600 text-sm" role="img" aria-label="Robot emoji">🤖</span>
              <span className={`${accessibility.highContrast ? 'text-white' : 'text-gray-700'} text-sm font-mono`} aria-label={`Currently viewing ${new URL(url).hostname}`}>
                {new URL(url).hostname}
              </span>
              <div className="flex-1"></div>
              <div className="flex items-center space-x-1" role="status">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
                <span className={`text-xs ${accessibility.highContrast ? 'text-gray-300' : 'text-gray-500'}`}>Gawin AI Agent</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-full" role="main">
        {browsingState.mode === 'blocked' && renderBlockedDomain()}
        {browsingState.mode === 'iframe' && renderIframeMode()}
        {browsingState.mode === 'intelligent' && renderIntelligentMode()}
      </div>
    </div>
  );
}