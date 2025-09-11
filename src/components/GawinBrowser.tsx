'use client';

import { useState, useEffect } from 'react';

interface GawinBrowserProps {
  url: string;
}

export default function GawinBrowser({ url }: GawinBrowserProps) {
  const [iframeError, setIframeError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [proxyUrl, setProxyUrl] = useState('');
  const [isBlockedDomain, setIsBlockedDomain] = useState(false);

  // List of CORS proxy services (free alternatives)
  const proxyServices = [
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://api.allorigins.win/get?url=',
    'https://corsproxy.io/?',
    'https://cors-anywhere.herokuapp.com/',
    'https://yacdn.org/proxy/'
  ];

  // Check if domain should be blocked
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
      return true; // Block invalid URLs
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setIframeError(false);
    setProxyUrl('');
    setIsBlockedDomain(false);
    
    // Check if URL should be blocked
    if (isUrlBlocked(url)) {
      setIsBlockedDomain(true);
      setIsLoading(false);
      return;
    }
    
    // First, try direct iframe loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [url]);

  const handleIframeError = () => {
    console.log('Direct iframe failed, trying proxy approach');
    setIframeError(true);
    setIsLoading(false);
    
    // Try first proxy service
    if (proxyServices.length > 0) {
      setProxyUrl(proxyServices[0] + encodeURIComponent(url));
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setIframeError(false);
  };

  const openInNewTab = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-sm">Loading Gawin Browser...</p>
          <p className="text-gray-500 text-xs">Connecting to {new URL(url).hostname}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative bg-white">
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
              <span className="text-green-600 text-sm">🔒</span>
              <span className="text-gray-700 text-sm font-mono">{new URL(url).hostname}</span>
              <div className="flex-1"></div>
              <span className="text-xs text-gray-500">Gawin Browser</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Browser Content */}
      <div className="relative h-full bg-white">
        {isBlockedDomain ? (
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
                <div className="text-red-700 text-xs space-y-1">
                  <p>• Self-loading prevented to avoid infinite loops</p>
                  <p>• Some domains are blocked for security</p>
                  <p>• Try a different website or use the suggestions below</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">🌐</span>
                  <h3 className="font-semibold text-blue-900">Try These Instead</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Google', url: 'https://google.com', icon: '🔍' },
                    { name: 'Wikipedia', url: 'https://wikipedia.org', icon: '📚' },
                    { name: 'YouTube', url: 'https://youtube.com', icon: '🎥' },
                    { name: 'GitHub', url: 'https://github.com', icon: '💻' }
                  ].map((site) => (
                    <button
                      key={site.name}
                      onClick={() => {
                        // This will be handled by parent component to update the browser URL
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('gawin-browser-navigate', {
                            detail: { url: site.url }
                          }));
                        }
                      }}
                      className="p-3 bg-blue-100 hover:bg-blue-200 rounded-lg border border-blue-300 transition-all text-center"
                    >
                      <div className="text-lg mb-1">{site.icon}</div>
                      <div className="text-blue-900 text-xs font-medium">{site.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-green-600">💡</span>
                  <h4 className="font-semibold text-green-900">Pro Tip</h4>
                </div>
                <p className="text-green-800 text-sm">
                  Use the address bar above to navigate to external websites. 
                  Gawin Browser works best with popular sites like news, educational content, and reference materials.
                </p>
              </div>
            </div>
          </div>
        ) : !iframeError ? (
          <>
            {/* Direct iframe attempt */}
            <iframe
              src={url}
              className="w-full h-full border-0"
              title="Gawin Browser"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
              onError={handleIframeError}
              onLoad={handleIframeLoad}
              style={{ display: iframeError ? 'none' : 'block' }}
            />
            
            {/* X-Frame-Bypass alternative */}
            {typeof window !== 'undefined' && (
              <iframe
                is="x-frame-bypass"
                src={url}
                className="w-full h-full border-0"
                title="Gawin Browser (X-Frame-Bypass)"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                onError={handleIframeError}
                onLoad={handleIframeLoad}
                style={{ display: 'none' }}
              />
            )}
          </>
        ) : (
          <div className="h-full flex flex-col">
            {/* Proxy iframe attempt */}
            {proxyUrl && (
              <iframe
                src={proxyUrl}
                className="w-full flex-1 border-0"
                title="Gawin Browser (Proxy)"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                onError={() => {
                  console.log('Proxy failed too, showing fallback');
                  setProxyUrl('');
                }}
                onLoad={() => setIframeError(false)}
              />
            )}
            
            {/* Fallback content when all methods fail */}
            {!proxyUrl && (
              <div className="h-full p-6 overflow-y-auto">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-yellow-600">⚠️</span>
                      <h3 className="font-semibold text-yellow-900">Site Protection Active</h3>
                    </div>
                    <p className="text-yellow-800 text-sm">
                      <strong>{new URL(url).hostname}</strong> prevents embedding for security. 
                      This protects users from clickjacking attacks.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-2xl">🤖</span>
                      <h3 className="font-semibold text-blue-900">Gawin AI Browser</h3>
                    </div>
                    <p className="text-blue-800 text-sm mb-4">
                      Your intelligent browsing companion. Even when sites block embedding, 
                      Gawin can still help you navigate and understand web content.
                    </p>
                    
                    <div className="space-y-3">
                      <button
                        onClick={openInNewTab}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Open {new URL(url).hostname} in New Tab →
                      </button>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            // This would integrate with the chat system
                            console.log('Analyze page content');
                          }}
                          className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                        >
                          📊 Analyze Page
                        </button>
                        <button
                          onClick={() => {
                            // This would summarize the website
                            console.log('Summarize website');
                          }}
                          className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                        >
                          📝 Summarize
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">How to Browse with Gawin</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center space-x-2">
                        <span className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></span>
                        <span>Many sites load directly in Gawin Browser</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></span>
                        <span>AI-powered page analysis and summarization</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-4 h-4 bg-teal-500 rounded-full flex-shrink-0"></span>
                        <span>Smart content extraction and Q&A</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-4 h-4 bg-teal-500 rounded-full flex-shrink-0"></span>
                        <span>Seamless integration with Gawin AI assistant</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-green-600">🚀</span>
                      <h4 className="font-semibold text-green-900">Coming Soon: Enhanced Browsing</h4>
                    </div>
                    <div className="text-green-800 text-sm space-y-1">
                      <p>• AI-powered ad blocking and content filtering</p>
                      <p>• Smart bookmarking with automatic categorization</p>
                      <p>• Real-time language translation</p>
                      <p>• Voice commands for hands-free browsing</p>
                      <p>• Privacy-focused anonymous browsing modes</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Load x-frame-bypass if in browser environment */}
      {typeof window !== 'undefined' && (
        <>
          <script 
            type="module" 
            src="https://unpkg.com/x-frame-bypass" 
            async
          />
          <script 
            src="https://unpkg.com/@ungap/custom-elements-builtin" 
            async
          />
        </>
      )}
    </div>
  );
}