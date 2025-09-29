'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResearchStep {
  id: string;
  step: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  result?: string;
  sources?: string[];
}

interface Source {
  title: string;
  url: string;
  type: string;
}

interface ResearchResult {
  id: string;
  query: string;
  methodology: string;
  steps: ResearchStep[];
  conclusion: string;
  sources: Source[];
  timestamp: string;
  isComplete: boolean;
}

export default function CleanResearch() {
  const [research, setResearch] = useState<ResearchResult[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [currentResearch, setCurrentResearch] = useState<ResearchResult | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [research, currentResearch]);

  // Auto-resize textarea function
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const minHeight = 48; // ~2 lines
      const maxHeight = 144; // ~6 lines
      textarea.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
    }
  };

  // Handle input change with auto-resize
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    adjustTextareaHeight();
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  // Copy research result to clipboard with WYSIWYG formatting
  const copyToClipboard = async (item: ResearchResult) => {
    const formattedText = `RESEARCH REPORT
${item.query}

METHODOLOGY
${item.methodology}

RESEARCH PROCESS
${item.steps.map((step, index) =>
  `${index + 1}. ${step.step}: ${step.description}
   ${step.result}`
).join('\n\n')}

CONCLUSION
${item.conclusion}

SOURCES
${item.sources.map((source, index) =>
  `${index + 1}. ${source.title} (${source.type})
   ${source.url}`
).join('\n')}

Research completed at ${item.timestamp}`;

    try {
      await navigator.clipboard.writeText(formattedText);
      // You could add a toast notification here
      console.log('Research copied to clipboard');
    } catch (err) {
      console.error('Failed to copy research:', err);
    }
  };

  // Download research result as a text file
  const downloadResearch = (item: ResearchResult) => {
    const formattedText = `RESEARCH REPORT
${item.query}

METHODOLOGY
${item.methodology}

RESEARCH PROCESS
${item.steps.map((step, index) =>
  `${index + 1}. ${step.step}: ${step.description}
   ${step.result}`
).join('\n\n')}

CONCLUSION
${item.conclusion}

SOURCES
${item.sources.map((source, index) =>
  `${index + 1}. ${source.title} (${source.type})
   ${source.url}`
).join('\n')}

Research completed at ${item.timestamp}`;

    const blob = new Blob([formattedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-${item.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const startResearch = async () => {
    if (!inputValue.trim() || isResearching) return;

    const query = inputValue.trim();
    setInputValue('');
    setIsResearching(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
    }

    // Create new research entry
    const newResearch: ResearchResult = {
      id: Date.now().toString(),
      query,
      methodology: '',
      steps: [],
      conclusion: '',
      sources: [],
      timestamp: new Date().toLocaleTimeString(),
      isComplete: false
    };

    setCurrentResearch(newResearch);

    try {
      const response = await fetch('/api/clean-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const completedResearch: ResearchResult = {
          ...newResearch,
          methodology: data.methodology,
          steps: data.steps,
          conclusion: data.conclusion,
          sources: data.sources,
          isComplete: true
        };

        setCurrentResearch(null);
        setResearch(prev => [...prev, completedResearch]);
      } else {
        throw new Error(data.error || 'Research failed');
      }
    } catch (error) {
      console.error('Research error:', error);
      const errorResearch: ResearchResult = {
        ...newResearch,
        methodology: 'Error occurred during research process',
        steps: [{
          id: 'error',
          step: 'Error',
          description: 'An error occurred while conducting the research',
          status: 'completed',
          result: 'Sorry, I encountered an error while researching this topic. Please try again.'
        }],
        conclusion: 'Research could not be completed due to technical issues.',
        sources: [],
        isComplete: true
      };

      setCurrentResearch(null);
      setResearch(prev => [...prev, errorResearch]);
    } finally {
      setIsResearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      startResearch();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 relative">
      {/* Research Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🔬</span>
          </div>
          <h2 className="text-white font-semibold">Research Mode</h2>
        </div>
        <div className="text-gray-400 text-sm">
          Quality research & analysis
        </div>
      </div>

      {/* Research Results Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence>
          {research.length === 0 && !currentResearch ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="text-white text-lg font-medium mb-2">
                Welcome to Research Mode!
              </h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                I'll conduct thorough, unbiased research using credible sources and logical reasoning.
                Quality takes time - each research follows a systematic methodology.
              </p>
            </motion.div>
          ) : (
            <>
              {/* Completed Research */}
              {research.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 relative"
                >
                  {/* Copy/Download Actions */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => copyToClipboard(item)}
                      className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors group"
                      title="Copy research result"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400 group-hover:text-white">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => downloadResearch(item)}
                      className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors group"
                      title="Download research result"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400 group-hover:text-white">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7,10 12,15 17,10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </button>
                  </div>

                  {/* Research Query */}
                  <div className="mb-4 pr-20">
                    <h3 className="text-white font-medium text-lg mb-2">Research Query</h3>
                    <p className="text-blue-300 bg-blue-900/20 p-3 rounded-lg">{item.query}</p>
                  </div>

                  {/* Methodology */}
                  {item.methodology && (
                    <div className="mb-4">
                      <h4 className="text-gray-300 font-medium mb-2">🔍 Methodology</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{item.methodology}</p>
                    </div>
                  )}

                  {/* Research Steps */}
                  {item.steps.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-gray-300 font-medium mb-3">📋 Research Process</h4>
                      <div className="space-y-3">
                        {item.steps.map((step, index) => (
                          <div key={step.id} className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h5 className="text-white text-sm font-medium">{step.step}</h5>
                              <p className="text-gray-400 text-xs mt-1">{step.description}</p>
                              {step.result && (
                                <p className="text-gray-300 text-sm mt-2 bg-gray-700/50 p-2 rounded">{step.result}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conclusion */}
                  {item.conclusion && (
                    <div className="mb-4">
                      <h4 className="text-gray-300 font-medium mb-2">📝 Conclusion</h4>
                      <p className="text-white leading-relaxed">{item.conclusion}</p>
                    </div>
                  )}

                  {/* Sources */}
                  {item.sources.length > 0 && (
                    <div className="mb-2">
                      <h4 className="text-gray-300 font-medium mb-2">🔗 Sources</h4>
                      <div className="space-y-2">
                        {item.sources.map((source, index) => (
                          <div key={index} className="text-sm">
                            {typeof source === 'string' ? (
                              <p className="text-blue-400">• {source}</p>
                            ) : (
                              <div className="flex flex-col gap-1">
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 underline hover:no-underline transition-colors"
                                >
                                  • {source.title}
                                </a>
                                <p className="text-gray-500 text-xs ml-2">{source.type}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-xs text-gray-500 mt-4 pt-2 border-t border-gray-700">
                    Research completed at {item.timestamp}
                  </div>
                </motion.div>
              ))}

              {/* Current Research in Progress */}
              {currentResearch && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 rounded-xl p-6 border border-blue-500/30"
                >
                  <div className="mb-4">
                    <h3 className="text-white font-medium text-lg mb-2">Research in Progress</h3>
                    <p className="text-blue-300 bg-blue-900/20 p-3 rounded-lg">{currentResearch.query}</p>
                  </div>

                  <div className="flex items-center gap-3 text-blue-400">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-sm">Conducting thorough research...</span>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Research Input Area */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-end gap-3 bg-gray-800 rounded-full border border-blue-500/30 p-4 transition-all duration-200 hover:border-blue-500/50 focus-within:border-blue-500/70">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter your research question or topic..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none outline-none border-none min-h-[48px] leading-6 focus:outline-none focus:ring-0 focus:border-none"
            style={{
              height: '48px',
              border: 'none',
              outline: 'none',
              boxShadow: 'none'
            }}
            disabled={isResearching}
          />
          <button
            onClick={startResearch}
            disabled={isResearching || !inputValue.trim()}
            className={`p-3 rounded-full transition-all duration-200 flex-shrink-0 ${
              inputValue.trim() && !isResearching
                ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/25'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}