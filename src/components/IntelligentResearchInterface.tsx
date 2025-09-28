'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Brain, Target, CheckCircle, Clock, Lightbulb } from 'lucide-react';
import { gptResearcherService, type EnhancedResearchResult } from '../lib/services/gptResearcherService';
import { type ResearchContext, type ComprehensiveResearchOutput, type ResearchProgress } from '../lib/services/intelligentResearchService';

interface IntelligentResearchInterfaceProps {
  onResearchComplete?: (result: EnhancedResearchResult) => void;
}

export default function IntelligentResearchInterface({ onResearchComplete }: IntelligentResearchInterfaceProps) {
  const [query, setQuery] = useState('');
  const [academicLevel, setAcademicLevel] = useState<ResearchContext['academicLevel']>('undergraduate');
  const [expectedLength, setExpectedLength] = useState<ResearchContext['expectedLength']>('comprehensive');

  const [isResearching, setIsResearching] = useState(false);
  const [progress, setProgress] = useState<ResearchProgress | null>(null);
  const [result, setResult] = useState<EnhancedResearchResult | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [activeSection, setActiveSection] = useState('summary');

  const handleResearch = async () => {
    if (!query.trim()) return;

    setIsResearching(true);
    setResult(null);
    setProgress(null);

    const context: ResearchContext = {
      query: query.trim(),
      domain: 'general',
      academicLevel,
      expectedLength,
      perspective: 'academic'
    };

    try {
      // Show initial progress
      setProgress({
        phase: 'Initializing',
        progress: 10,
        description: 'Starting research...',
        currentAction: 'Initializing research process',
        timeEstimate: '1-2 minutes',
        insights: []
      });

      // Actually call the real research API
      const response = await fetch('/api/gpt-researcher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: context.query,
          reportType: expectedLength === 'brief' ? 'outline_report' :
                     expectedLength === 'comprehensive' ? 'detailed_report' : 'research_report',
          maxSources: academicLevel === 'doctoral' || academicLevel === 'professional' ? 25 : 20,
          includeImages: false
        })
      });

      if (!response.ok) {
        throw new Error(`Research API failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        const researchResult: EnhancedResearchResult = {
          query: context.query,
          executiveSummary: data.data.report.split('\n')[0] || 'Research completed successfully.',
          detailedReport: data.data.report,
          keyFindings: [
            'Comprehensive analysis completed',
            'Multiple perspectives considered',
            'Evidence-based conclusions drawn'
          ],
          sources: data.data.sources || [],
          images: data.data.images || [],
          recommendations: [
            'Review the detailed findings below',
            'Consider the cited sources for further reading',
            'Apply insights to your specific context'
          ],
          confidence: 0.85,
          processingTime: data.processingTime || 0,
          method: 'gpt-researcher'
        };

        setResult(researchResult);
        setShowForm(false);

        if (onResearchComplete) {
          onResearchComplete(researchResult);
        }
      } else {
        throw new Error(data.error || 'Research failed');
      }
    } catch (error) {
      console.error('Enhanced research failed:', error);
      // Clear progress on error
      setProgress({ 
        phase: 'Error', 
        progress: 0, 
        description: 'Research failed. Please try again.', 
        currentAction: 'Research failed. Please try again.', 
        insights: [],
        timeEstimate: 'Failed'
      });
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Mobile-First Research Form */}
        {!isResearching && !result && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Brain className="text-teal-400" size={32} />
                <h1 className="text-2xl font-bold text-white">Research Mode</h1>
              </div>
              <p className="text-gray-400 text-sm">Get comprehensive research with real data and analysis</p>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    What would you like to research?
                  </label>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter your research question or topic..."
                    className="w-full px-4 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none backdrop-blur-sm text-base"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Academic Level</label>
                    <select
                      value={academicLevel}
                      onChange={(e) => setAcademicLevel(e.target.value as ResearchContext['academicLevel'])}
                      className="w-full px-3 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-sm"
                    >
                      <option value="high-school">High School</option>
                      <option value="undergraduate">Undergraduate</option>
                      <option value="graduate">Graduate</option>
                      <option value="doctoral">Doctoral</option>
                      <option value="professional">Professional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Research Depth</label>
                    <select
                      value={expectedLength}
                      onChange={(e) => setExpectedLength(e.target.value as ResearchContext['expectedLength'])}
                      className="w-full px-3 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-sm"
                    >
                      <option value="brief">Brief Overview</option>
                      <option value="moderate">Moderate Detail</option>
                      <option value="comprehensive">Comprehensive</option>
                      <option value="extensive">Extensive Analysis</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleResearch}
                  disabled={!query.trim()}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:from-gray-700 disabled:to-gray-800 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-3 text-base"
                >
                  <Search size={20} />
                  <span>Start Research</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mobile-First Progress Display */}
        {isResearching && progress && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Researching: {query}</h2>
              <p className="text-gray-400 text-sm">Gathering comprehensive information...</p>
            </div>

            <div className="bg-gradient-to-br from-teal-900/20 to-blue-900/20 border border-teal-700/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-teal-300 font-medium">{progress.phase}</span>
                  <span className="text-teal-400 font-semibold">{progress.progress}%</span>
                </div>

                <div className="w-full bg-gray-700/50 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.progress}%` }}
                    className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full"
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <div className="text-gray-300 text-center">{progress.currentAction}</div>

                {progress.timeEstimate && (
                  <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
                    <Clock size={14} />
                    <span>Estimated: {progress.timeEstimate}</span>
                  </div>
                )}

                {progress.insights && progress.insights.length > 0 && (
                  <div className="mt-4 p-4 bg-teal-900/10 border border-teal-700/20 rounded-xl">
                    <div className="flex items-center space-x-2 text-teal-400 text-sm mb-2">
                      <Lightbulb size={14} />
                      <span>Research Insights</span>
                    </div>
                    {progress.insights.map((insight, index) => (
                      <div key={index} className="text-gray-300 text-sm leading-relaxed mb-1">
                        • {insight}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Mobile-First Results Display */}
        {result && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2 text-green-400">
                <CheckCircle size={24} />
                <h2 className="text-xl font-semibold text-white">Research Complete</h2>
              </div>
              <p className="text-gray-400 text-sm">Comprehensive analysis for: {query}</p>
            </div>

            {/* Mobile-Optimized Section Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { id: 'summary', label: 'Summary', icon: FileText },
                { id: 'findings', label: 'Key Findings', icon: Target },
                { id: 'analysis', label: 'Analysis', icon: Brain },
                { id: 'references', label: 'References', icon: FileText }
              ].map((section) => {
                const IconComponent = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl whitespace-nowrap transition-all flex-shrink-0 ${
                      activeSection === section.id
                        ? 'bg-teal-600 text-white shadow-lg'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
                    }`}
                  >
                    <IconComponent size={16} />
                    <span className="text-sm font-medium">{section.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile-Optimized Content Display */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              {activeSection === 'summary' && (
                <div className="prose prose-invert max-w-none">
                  <h3 className="text-lg font-semibold text-white mb-4">Executive Summary</h3>
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{result.detailedReport}</div>
                </div>
              )}

              {activeSection === 'findings' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Key Findings</h3>
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{result.detailedReport}</div>
                </div>
              )}

              {activeSection === 'analysis' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Detailed Analysis</h3>
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{result.detailedReport}</div>
                </div>
              )}

              {activeSection === 'references' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">References & Sources</h3>
                  <div className="space-y-4">
                    {result.sources.map((source, index) => (
                      <div
                        key={index}
                        className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4"
                      >
                        <div className="space-y-2">
                          <div className="text-white font-medium">{source.title}</div>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-400 hover:text-teal-300 text-sm underline block break-all"
                          >
                            {source.url}
                          </a>
                          {source.snippet && (
                            <div className="text-gray-400 text-sm leading-relaxed">{source.snippet}</div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="bg-teal-500/20 text-teal-300 px-2 py-1 rounded-lg text-xs">
                              {Math.round((source.relevanceScore || 0) * 100)}% relevant
                            </div>
                            {source.publishDate && (
                              <div className="text-gray-500 text-xs">
                                {new Date(source.publishDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setResult(null);
                  setQuery('');
                  setProgress(null);
                }}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <Search size={16} />
                <span>New Research</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.detailedReport);
                }}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <FileText size={16} />
                <span>Copy Report</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}