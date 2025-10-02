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

interface ComprehensiveDocument {
  id: string;
  query: string;
  title: string;
  executiveSummary: string;
  introduction: string;
  methodology: string;
  findings: {
    section: string;
    content: string;
  }[];
  analysis: string;
  synthesis: string;
  conclusion: string;
  recommendations: string[];
  sources: {
    title: string;
    url: string;
    type: string;
    description: string;
  }[];
  wordCount: number;
  estimatedReadingTime: string;
  timestamp: string;
}

export default function CleanResearch() {
  const [research, setResearch] = useState<ResearchResult[]>([]);
  const [documents, setDocuments] = useState<ComprehensiveDocument[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [currentResearch, setCurrentResearch] = useState<ResearchResult | null>(null);
  const [currentDocument, setCurrentDocument] = useState<ComprehensiveDocument | null>(null);
  const [researchMode, setResearchMode] = useState<'quick' | 'comprehensive'>('comprehensive');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [research, documents, currentResearch, currentDocument]);



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

    if (researchMode === 'comprehensive') {
      await startComprehensiveResearch(query);
    } else {
      await startQuickResearch(query);
    }
  };

  const startQuickResearch = async (query: string) => {
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
        body: JSON.stringify({ query }),
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

  const startComprehensiveResearch = async (query: string) => {
    // Create new document entry
    const newDocument: ComprehensiveDocument = {
      id: Date.now().toString(),
      query,
      title: '',
      executiveSummary: '',
      introduction: '',
      methodology: '',
      findings: [],
      analysis: '',
      synthesis: '',
      conclusion: '',
      recommendations: [],
      sources: [],
      wordCount: 0,
      estimatedReadingTime: '',
      timestamp: new Date().toLocaleTimeString()
    };

    setCurrentDocument(newDocument);

    try {
      const response = await fetch('/api/comprehensive-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.document) {
        const completedDocument: ComprehensiveDocument = {
          ...newDocument,
          ...data.document,
          timestamp: new Date().toLocaleTimeString()
        };

        setCurrentDocument(null);
        setDocuments(prev => [...prev, completedDocument]);
      } else {
        throw new Error(data.error || 'Document generation failed');
      }
    } catch (error) {
      console.error('Comprehensive research error:', error);
      const errorDocument: ComprehensiveDocument = {
        ...newDocument,
        title: `Research Document: ${query}`,
        executiveSummary: 'An error occurred while generating the comprehensive research document. Please try again.',
        introduction: 'Technical issues prevented the completion of this research document.',
        methodology: 'Document generation encountered technical difficulties.',
        findings: [{
          section: 'Error Notice',
          content: 'The research document could not be completed due to technical issues. Please retry your request.'
        }],
        analysis: 'Unable to complete analysis due to technical error.',
        synthesis: 'Document synthesis could not be completed.',
        conclusion: 'Research document generation was unsuccessful.',
        recommendations: ['Retry the research request', 'Check system status'],
        sources: [],
        wordCount: 0,
        estimatedReadingTime: '0 minutes'
      };

      setCurrentDocument(null);
      setDocuments(prev => [...prev, errorDocument]);
    } finally {
      setIsResearching(false);
    }
  };

  // Copy comprehensive document to clipboard
  const copyDocumentToClipboard = async (doc: ComprehensiveDocument) => {
    const formattedText = `${doc.title}

EXECUTIVE SUMMARY
${doc.executiveSummary}

INTRODUCTION
${doc.introduction}

METHODOLOGY
${doc.methodology}

FINDINGS
${doc.findings.map((finding, index) =>
  `${index + 1}. ${finding.section}
${finding.content}`
).join('\n\n')}

ANALYSIS
${doc.analysis}

SYNTHESIS
${doc.synthesis}

CONCLUSION
${doc.conclusion}

RECOMMENDATIONS
${doc.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

SOURCES
${doc.sources.map((source, index) =>
  `${index + 1}. ${source.title} (${source.type})
   ${source.url}
   ${source.description}`
).join('\n\n')}

Word Count: ${doc.wordCount}
Estimated Reading Time: ${doc.estimatedReadingTime}
Research completed at ${doc.timestamp}`;

    try {
      await navigator.clipboard.writeText(formattedText);
      console.log('Research document copied to clipboard');
    } catch (err) {
      console.error('Failed to copy document:', err);
    }
  };

  // Download comprehensive document
  const downloadDocument = (doc: ComprehensiveDocument) => {
    const formattedText = `${doc.title}

EXECUTIVE SUMMARY
${doc.executiveSummary}

INTRODUCTION
${doc.introduction}

METHODOLOGY
${doc.methodology}

FINDINGS
${doc.findings.map((finding, index) =>
  `${index + 1}. ${finding.section}
${finding.content}`
).join('\n\n')}

ANALYSIS
${doc.analysis}

SYNTHESIS
${doc.synthesis}

CONCLUSION
${doc.conclusion}

RECOMMENDATIONS
${doc.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

SOURCES
${doc.sources.map((source, index) =>
  `${index + 1}. ${source.title} (${source.type})
   ${source.url}
   ${source.description}`
).join('\n\n')}

Word Count: ${doc.wordCount}
Estimated Reading Time: ${doc.estimatedReadingTime}
Research completed at ${doc.timestamp}`;

    const blob = new Blob([formattedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-document-${doc.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      startResearch();
    }
  };

  return (
    <div className="flex flex-col h-full relative" style={{backgroundColor: '#1b1e1e'}}>

      {/* Research Results Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence>
          {research.length === 0 && documents.length === 0 && !currentResearch && !currentDocument ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-6">🔬</div>
              <h3 className="text-white text-xl font-medium mb-4">
                Research Mode
              </h3>
              <p className="text-gray-400 text-sm">
                Enter your research question to get started
              </p>
            </motion.div>
          ) : (
            <>
              {/* Comprehensive Documents */}
              {documents.map((doc) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-6 border border-gray-700 relative"
                  style={{backgroundColor: '#1b1e1e'}}
                >
                  {/* Copy/Download Actions */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => copyDocumentToClipboard(doc)}
                      className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors group"
                      title="Copy research document"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400 group-hover:text-white">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => downloadDocument(doc)}
                      className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors group"
                      title="Download research document"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400 group-hover:text-white">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7,10 12,15 17,10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </button>
                  </div>

                  {/* Document Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Comprehensive Document
                    </span>
                    <span className="text-gray-400 text-xs">
                      {doc.wordCount} words • {doc.estimatedReadingTime}
                    </span>
                  </div>

                  {/* Document Title */}
                  <div className="mb-4 pr-20">
                    <h3 className="text-white font-semibold text-xl mb-2">{doc.title}</h3>
                    <p className="text-purple-300 bg-purple-900/20 p-3 rounded-lg text-sm">{doc.query}</p>
                  </div>

                  {/* Executive Summary */}
                  {doc.executiveSummary && (
                    <div className="mb-4">
                      <h4 className="text-gray-300 font-medium mb-2 flex items-center gap-2">
                        📋 Executive Summary
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed bg-gray-700/30 p-3 rounded-lg">{doc.executiveSummary}</p>
                    </div>
                  )}

                  {/* Introduction */}
                  {doc.introduction && (
                    <div className="mb-4">
                      <h4 className="text-gray-300 font-medium mb-2">📖 Introduction</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{doc.introduction}</p>
                    </div>
                  )}

                  {/* Methodology */}
                  {doc.methodology && (
                    <div className="mb-4">
                      <h4 className="text-gray-300 font-medium mb-2">🔍 Methodology</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{doc.methodology}</p>
                    </div>
                  )}

                  {/* Findings */}
                  {doc.findings.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-gray-300 font-medium mb-3">🔬 Key Findings</h4>
                      <div className="space-y-4">
                        {doc.findings.map((finding, index) => (
                          <div key={index} className="bg-gray-700/30 p-4 rounded-lg">
                            <h5 className="text-white text-sm font-medium mb-2">{finding.section}</h5>
                            <p className="text-gray-300 text-sm leading-relaxed">{finding.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Analysis */}
                  {doc.analysis && (
                    <div className="mb-4">
                      <h4 className="text-gray-300 font-medium mb-2">📊 Analysis</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">{doc.analysis}</p>
                    </div>
                  )}

                  {/* Synthesis */}
                  {doc.synthesis && (
                    <div className="mb-4">
                      <h4 className="text-gray-300 font-medium mb-2">🔗 Synthesis</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">{doc.synthesis}</p>
                    </div>
                  )}

                  {/* Conclusion */}
                  {doc.conclusion && (
                    <div className="mb-4">
                      <h4 className="text-gray-300 font-medium mb-2">📝 Conclusion</h4>
                      <p className="text-white text-sm leading-relaxed bg-blue-900/20 p-3 rounded-lg">{doc.conclusion}</p>
                    </div>
                  )}

                  {/* Recommendations */}
                  {doc.recommendations.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-gray-300 font-medium mb-2">💡 Recommendations</h4>
                      <ul className="space-y-2">
                        {doc.recommendations.map((rec, index) => (
                          <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                            <span className="text-green-400 font-medium">{index + 1}.</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Sources */}
                  {doc.sources.length > 0 && (
                    <div className="mb-2">
                      <h4 className="text-gray-300 font-medium mb-2">🔗 Sources</h4>
                      <div className="space-y-3">
                        {doc.sources.map((source, index) => (
                          <div key={index} className="bg-gray-700/20 p-3 rounded-lg">
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-sm font-medium underline hover:no-underline transition-colors block"
                            >
                              {index + 1}. {source.title}
                            </a>
                            <p className="text-gray-500 text-xs mt-1">{source.type}</p>
                            {source.description && (
                              <p className="text-gray-400 text-xs mt-1">{source.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-xs text-gray-500 mt-4 pt-2">
                    Research completed at {doc.timestamp}
                  </div>
                </motion.div>
              ))}

              {/* Quick Research Results */}
              {research.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-6 border border-gray-700 relative"
                  style={{backgroundColor: '#1b1e1e'}}
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

                  {/* Research Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Quick Research
                    </span>
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
                  <div className="text-xs text-gray-500 mt-4 pt-2">
                    Research completed at {item.timestamp}
                  </div>
                </motion.div>
              ))}

              {/* Current Research in Progress */}
              {currentResearch && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-6 border border-blue-500/30"
                  style={{backgroundColor: '#1b1e1e'}}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Quick Research
                    </span>
                    <span className="text-blue-400 text-xs">In Progress</span>
                  </div>

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

              {/* Current Document in Progress */}
              {currentDocument && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-6 border border-purple-500/30"
                  style={{backgroundColor: '#1b1e1e'}}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Comprehensive Document
                    </span>
                    <span className="text-purple-400 text-xs">In Progress</span>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-white font-medium text-lg mb-2">Document Generation in Progress</h3>
                    <p className="text-purple-300 bg-purple-900/20 p-3 rounded-lg">{currentDocument.query}</p>
                  </div>

                  <div className="flex items-center gap-3 text-purple-400">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-sm">Generating comprehensive research document...</span>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Research Input Area */}
      <div className="p-4">
        {/* Research Input with Toggle */}
        <div className="relative">
          {/* Quick/Comprehensive Switch - Top Left of Capsule */}
          <div className="absolute -top-5 left-2 z-10">
            <div className="relative bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-600/30 shadow-lg overflow-hidden">
              <button
                onClick={() => setResearchMode(researchMode === 'quick' ? 'comprehensive' : 'quick')}
                className="relative flex focus:outline-none focus:ring-1 focus:ring-teal-400/50"
              >
                {/* Background highlight */}
                <div className={`absolute top-0 h-full bg-teal-500/20 rounded-full transition-all duration-200 ${
                  researchMode === 'comprehensive'
                    ? 'left-12 w-20'
                    : 'left-0 w-12'
                }`} />

                {/* Quick option */}
                <div className={`relative px-2 py-1 text-xs font-medium transition-colors ${
                  researchMode === 'quick'
                    ? 'text-white'
                    : 'text-gray-400'
                }`}>
                  Quick
                </div>

                {/* Comprehensive option */}
                <div className={`relative px-2 py-1 text-xs font-medium transition-colors ${
                  researchMode === 'comprehensive'
                    ? 'text-white'
                    : 'text-gray-400'
                }`}>
                  Comprehensive
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-end gap-3 rounded-full border border-blue-500/30 p-4 transition-all duration-200 hover:border-blue-500/50 focus-within:border-blue-500/70" style={{backgroundColor: '#1b1e1e'}}>
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={
              researchMode === 'comprehensive'
                ? "Research topic for comprehensive document..."
                : "Research question for quick analysis..."
            }
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
                ? researchMode === 'comprehensive'
                  ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-500/25'
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/25'
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
    </div>
  );
}