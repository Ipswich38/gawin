'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Download,
  RefreshCw,
  AlertCircle,
  Globe,
  BookOpen,
  Zap,
  Target
} from 'lucide-react';
import { aiResearchService, ResearchDocument, ResearchStep } from '@/lib/services/aiResearchService';

interface ResearchModeProps {
  onResearchComplete?: (document: ResearchDocument) => void;
}

const ResearchMode: React.FC<ResearchModeProps> = ({ onResearchComplete }) => {
  const [query, setQuery] = useState('');
  const [activeResearchId, setActiveResearchId] = useState<string | null>(null);
  const [researchDocument, setResearchDocument] = useState<ResearchDocument | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [researchHistory, setResearchHistory] = useState<ResearchDocument[]>([]);

  useEffect(() => {
    // Update research status every 2 seconds
    const interval = setInterval(() => {
      if (activeResearchId) {
        const updated = aiResearchService.getResearchStatus(activeResearchId);
        if (updated) {
          setResearchDocument(updated);
          if (updated.status === 'completed' && onResearchComplete) {
            onResearchComplete(updated);
          }
        }
      }
      
      // Update history
      setResearchHistory(aiResearchService.getAllResearch());
    }, 2000);

    return () => clearInterval(interval);
  }, [activeResearchId, onResearchComplete]);

  const startResearch = async () => {
    if (!query.trim()) return;

    try {
      const researchId = await aiResearchService.startResearch(query.trim());
      setActiveResearchId(researchId);
      setQuery('');
    } catch (error) {
      console.error('Failed to start research:', error);
    }
  };

  const cancelResearch = () => {
    if (activeResearchId) {
      aiResearchService.cancelResearch(activeResearchId);
      setActiveResearchId(null);
      setResearchDocument(null);
    }
  };

  const getStepIcon = (step: ResearchStep) => {
    switch (step.type) {
      case 'search':
        return <Search size={16} />;
      case 'analyze':
        return <Target size={16} />;
      case 'verify':
        return <CheckCircle size={16} />;
      case 'synthesize':
        return <Zap size={16} />;
      case 'document':
        return <FileText size={16} />;
      default:
        return <Globe size={16} />;
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'in_progress':
        return 'text-blue-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const downloadDocument = (format: 'markdown' | 'text' | 'json') => {
    if (!activeResearchId) return;

    const content = aiResearchService.exportDocument(activeResearchId, format);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-${activeResearchId}.${format === 'json' ? 'json' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (showHistory) {
    return (
      <div className="flex flex-col h-full bg-gray-900">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <BookOpen className="text-blue-400" size={20} />
            <h2 className="text-lg font-semibold text-white">Research History</h2>
          </div>
          <button
            onClick={() => setShowHistory(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {researchHistory.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p>No research sessions yet</p>
              <p className="text-sm">Start researching to build your knowledge base</p>
            </div>
          ) : (
            researchHistory.map((research) => (
              <motion.div
                key={research.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-medium">{research.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    research.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    research.status === 'researching' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {research.status}
                  </span>
                </div>
                
                <p className="text-gray-400 text-sm mb-3">{research.query}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{research.sources.length} sources</span>
                  <span>{research.actualDuration ? formatDuration(research.actualDuration) : 'In progress'}</span>
                </div>
                
                {research.status === 'completed' && (
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => {
                        setActiveResearchId(research.id);
                        setResearchDocument(research);
                        setShowHistory(false);
                      }}
                      className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      View Document
                    </button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Search className="text-purple-400" size={20} />
          <h2 className="text-lg font-semibold text-white">Research Mode</h2>
        </div>
        <button
          onClick={() => setShowHistory(true)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <BookOpen size={18} />
        </button>
      </div>

      {/* Research Input */}
      {!activeResearchId && (
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-white text-sm font-medium block">Research Query</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your research topic or question. Be specific for better results..."
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:border-purple-500 placeholder-gray-500 min-h-[80px] resize-none"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={startResearch}
              disabled={!query.trim()}
              className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Search size={16} />
              <span>Start Research</span>
            </button>
          </div>

          <div className="text-xs text-gray-400 space-y-1">
            <p>• AI will conduct comprehensive web research</p>
            <p>• Research time varies from 2-45 minutes based on complexity</p>
            <p>• Multiple sources will be analyzed and verified</p>
            <p>• Final document will be compiled in Google Docs style</p>
          </div>
        </div>
      )}

      {/* Active Research Display */}
      {activeResearchId && researchDocument && (
        <div className="flex-1 overflow-y-auto">
          {/* Research Header */}
          <div className="p-4 border-b border-gray-700 bg-gray-800/50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {researchDocument.title}
                </h3>
                <p className="text-gray-400 text-sm">{researchDocument.query}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                {researchDocument.status === 'researching' && (
                  <button
                    onClick={cancelResearch}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="Cancel Research"
                  >
                    <XCircle size={20} />
                  </button>
                )}
                
                {researchDocument.status === 'completed' && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => downloadDocument('markdown')}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Download as Markdown"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Overview */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">
                  Status: <span className={`font-medium ${
                    researchDocument.status === 'completed' ? 'text-green-400' :
                    researchDocument.status === 'researching' ? 'text-blue-400' :
                    'text-red-400'
                  }`}>
                    {researchDocument.status === 'researching' ? 'In Progress' :
                     researchDocument.status === 'completed' ? 'Completed' : 'Failed'}
                  </span>
                </span>
                
                <span className="text-gray-400">
                  Sources: <span className="text-white">{researchDocument.sources.length}</span>
                </span>
              </div>

              <div className="text-gray-400">
                {researchDocument.status === 'researching' ? (
                  <span>Est. {formatDuration(researchDocument.estimatedDuration)}</span>
                ) : researchDocument.actualDuration ? (
                  <span>Completed in {formatDuration(researchDocument.actualDuration)}</span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Research Steps */}
          <div className="p-4 space-y-3">
            <h4 className="text-white font-medium flex items-center space-x-2">
              <RefreshCw size={16} />
              <span>Research Progress</span>
            </h4>

            <div className="space-y-2">
              {researchDocument.steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center space-x-3 p-3 rounded-lg border ${
                    step.status === 'completed' ? 'bg-green-500/10 border-green-500/30' :
                    step.status === 'in_progress' ? 'bg-blue-500/10 border-blue-500/30' :
                    step.status === 'failed' ? 'bg-red-500/10 border-red-500/30' :
                    'bg-gray-800 border-gray-700'
                  }`}
                >
                  <div className={getStepStatusColor(step.status)}>
                    {step.status === 'in_progress' ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <RefreshCw size={16} />
                      </motion.div>
                    ) : (
                      getStepIcon(step)
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium text-sm">{step.title}</span>
                      <span className={`text-xs ${getStepStatusColor(step.status)}`}>
                        {step.status === 'completed' ? '✓' :
                         step.status === 'in_progress' ? `${step.progress}%` :
                         step.status === 'failed' ? '✗' : '⏳'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs">{step.description}</p>
                    
                    {step.status === 'in_progress' && (
                      <div className="mt-2 w-full bg-gray-700 rounded-full h-1">
                        <motion.div
                          className="bg-blue-500 h-1 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${step.progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Research Document Preview */}
          {researchDocument.status === 'completed' && researchDocument.content && (
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium flex items-center space-x-2">
                  <FileText size={16} />
                  <span>Research Document</span>
                </h4>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => downloadDocument('markdown')}
                    className="text-xs px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 max-h-96 overflow-y-auto">
                <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                  {researchDocument.content}
                </pre>
              </div>
            </div>
          )}

          {/* Error Display */}
          {researchDocument.status === 'failed' && (
            <div className="p-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start space-x-3">
                <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-red-400 font-medium mb-1">Research Failed</h4>
                  <p className="text-gray-300 text-sm">
                    The research process encountered an error. You can try starting a new research session with a different query.
                  </p>
                  <button
                    onClick={() => {
                      setActiveResearchId(null);
                      setResearchDocument(null);
                    }}
                    className="mt-3 text-xs px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Start New Research
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResearchMode;