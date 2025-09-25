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
      // Use enhanced GPT Researcher with progress simulation
      const progressSteps: ResearchProgress[] = [
        { phase: 'Initializing', progress: 10, description: 'Setting up GPT Researcher...', currentAction: 'Setting up GPT Researcher...', timeEstimate: '2-3 minutes', insights: [] },
        { phase: 'Web Research', progress: 30, description: 'Searching multiple sources...', currentAction: 'Searching multiple sources...', timeEstimate: '1-2 minutes', insights: [] },
        { phase: 'Content Analysis', progress: 60, description: 'Analyzing and synthesizing findings...', currentAction: 'Analyzing and synthesizing findings...', timeEstimate: '30-60 seconds', insights: [] },
        { phase: 'Report Generation', progress: 90, description: 'Generating comprehensive report...', currentAction: 'Generating comprehensive report...', timeEstimate: '10-20 seconds', insights: [] }
      ];

      // Simulate progress updates
      let currentStep = 0;
      const progressInterval = setInterval(() => {
        if (currentStep < progressSteps.length) {
          setProgress(progressSteps[currentStep]);
          currentStep++;
        } else {
          clearInterval(progressInterval);
        }
      }, 1000);

      // Conduct enhanced research using GPT Researcher
      const researchResult = await gptResearcherService.conductEnhancedResearch(
        query.trim(),
        {
          reportType: expectedLength === 'brief' ? 'outline_report' : 
                     expectedLength === 'comprehensive' ? 'detailed_report' : 'research_report',
          maxSources: academicLevel === 'doctoral' || academicLevel === 'professional' ? 25 : 20,
          includeImages: true,
          useHybrid: true
        }
      );

      clearInterval(progressInterval);
      setProgress({ 
        phase: 'Complete', 
        progress: 100, 
        description: 'Research completed successfully!', 
        currentAction: 'Research completed successfully!', 
        insights: [],
        timeEstimate: 'Complete'
      });
      
      // Use the EnhancedResearchResult directly since UI was updated to support it
      const displayResult = researchResult;
      
      setResult(displayResult);
      onResearchComplete?.(displayResult);
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

  const renderLeftPanel = () => (
    <motion.div
      initial={false}
      animate={{ width: showProcess ? 320 : 48 }}
      className="bg-gray-900/95 backdrop-blur-sm border-r border-gray-700/50 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
        {showProcess && (
          <div className="flex items-center space-x-2">
            <Brain className="text-teal-400" size={20} />
            <span className="text-white font-medium">Research</span>
          </div>
        )}
        <button
          onClick={() => setShowProcess(!showProcess)}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/50 transition-colors"
        >
          {showProcess ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      <AnimatePresence>
        {showProcess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 p-4 space-y-4 overflow-y-auto"
          >
            {/* Research Form */}
            {!isResearching && !result && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Research Question
                  </label>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="What would you like to research deeply?"
                    className="w-full px-3 py-3 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none backdrop-blur-sm"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Level</label>
                    <select
                      value={academicLevel}
                      onChange={(e) => setAcademicLevel(e.target.value as ResearchContext['academicLevel'])}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-sm"
                    >
                      <option value="high-school">High School</option>
                      <option value="undergraduate">Undergraduate</option>
                      <option value="graduate">Graduate</option>
                      <option value="doctoral">Doctoral</option>
                      <option value="professional">Professional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Depth</label>
                    <select
                      value={expectedLength}
                      onChange={(e) => setExpectedLength(e.target.value as ResearchContext['expectedLength'])}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-sm"
                    >
                      <option value="brief">Brief</option>
                      <option value="moderate">Moderate</option>
                      <option value="comprehensive">Comprehensive</option>
                      <option value="extensive">Extensive</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleResearch}
                  disabled={!query.trim()}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:from-gray-700 disabled:to-gray-800 text-white px-4 py-3 rounded-2xl font-medium transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Search size={18} />
                  <span>Start Research</span>
                </button>
              </motion.div>
            )}

            {/* Progress Display */}
            {isResearching && progress && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-4"
              >
                <div className="bg-gradient-to-br from-teal-900/20 to-blue-900/20 border border-teal-700/30 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-teal-300 font-medium text-sm">{progress.phase}</span>
                    <span className="text-teal-400 text-sm">{progress.progress}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-700/50 rounded-full h-2 mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.progress}%` }}
                      className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full"
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <div className="text-gray-300 text-sm mb-2">{progress.currentAction}</div>
                  
                  {progress.timeEstimate && (
                    <div className="flex items-center space-x-1 text-gray-400 text-xs">
                      <Clock size={12} />
                      <span>{progress.timeEstimate}</span>
                    </div>
                  )}

                  {progress.insights && progress.insights.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                      <div className="flex items-center space-x-1 text-teal-400 text-xs mb-1">
                        <Lightbulb size={12} />
                        <span>Insights</span>
                      </div>
                      {progress.insights.map((insight, index) => (
                        <div key={index} className="text-gray-300 text-xs leading-relaxed">
                          • {insight}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Research Complete */}
            {result && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-3"
              >
                <div className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border border-green-700/30 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="text-green-400" size={18} />
                    <span className="text-green-300 font-medium">Research Complete</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-gray-800/30 rounded-lg">
                      <div className="text-teal-400 font-bold text-lg">{Math.round(result.confidence * 100)}%</div>
                      <div className="text-gray-400">Quality</div>
                    </div>
                    <div className="text-center p-2 bg-gray-800/30 rounded-lg">
                      <div className="text-blue-400 font-bold text-lg">{result.sources.length}</div>
                      <div className="text-gray-400">Sources</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setResult(null);
                    setProgress(null);
                    setQuery('');
                  }}
                  className="w-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white px-3 py-2 rounded-xl text-sm transition-colors border border-gray-700/50"
                >
                  New Research
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderMainContent = () => {
    if (!result) {
      return (
        <div className="h-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-3xl flex items-center justify-center mx-auto">
              <Brain className="text-teal-400" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">Intelligent Research</h2>
              <p className="text-gray-400 max-w-md">
                Ask me anything and I'll conduct comprehensive research with deep analysis and quality insights.
              </p>
            </div>
          </motion.div>
        </div>
      );
    }

    const sections = [
      { id: 'summary', label: 'Summary', icon: FileText },
      { id: 'findings', label: 'Key Findings', icon: Target },
      { id: 'analysis', label: 'Analysis', icon: Brain },
      { id: 'references', label: 'References', icon: FileText }
    ];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full flex flex-col"
      >
        {/* Header with Navigation */}
        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 p-4">
          <h1 className="text-xl font-semibold text-white mb-4">{query}</h1>
          
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {sections.map((section) => {
              const IconComponent = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                    activeSection === section.id
                      ? 'bg-teal-600/80 text-white'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                  }`}
                >
                  <IconComponent size={16} />
                  <span className="text-sm">{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeSection === 'summary' && (
                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Executive Summary</h3>
                  <div className="prose prose-gray prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {result.executiveSummary}
                  </div>
                </div>
              )}

              {activeSection === 'findings' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Key Findings</h3>
                  {result.keyFindings.map((finding, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-4 flex items-start space-x-3"
                    >
                      <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-400 font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="text-gray-300 leading-relaxed">{finding}</div>
                    </motion.div>
                  ))}
                </div>
              )}

              {activeSection === 'analysis' && (
                <div className="space-y-6">
                  <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6">
                    <h4 className="text-lg font-medium text-white mb-3">Detailed Analysis</h4>
                    <div className="prose prose-gray prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {result.detailedReport}
                    </div>
                  </div>
                  {result.recommendations.length > 0 && (
                    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6">
                      <h4 className="text-lg font-medium text-white mb-3">Recommendations</h4>
                      <div className="space-y-2">
                        {result.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold text-xs flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <div className="text-gray-300 leading-relaxed">{rec}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'references' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">References</h3>
                  {result.sources.map((source, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-4 hover:bg-gray-700/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-white font-medium mb-1">{source.title}</div>
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-teal-400 hover:text-teal-300 text-sm underline mb-2 block"
                          >
                            {source.url}
                          </a>
                          {source.snippet && (
                            <div className="text-gray-400 text-sm">{source.snippet}</div>
                          )}
                        </div>
                        <div className="bg-teal-500/20 text-teal-300 px-2 py-1 rounded-lg text-xs ml-3">
                          {Math.round(source.relevanceScore * 100)}% relevant
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    );
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
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{result.report}</div>
                </div>
              )}

              {activeSection === 'findings' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Key Findings</h3>
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{result.report}</div>
                </div>
              )}

              {activeSection === 'analysis' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Detailed Analysis</h3>
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{result.report}</div>
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
                  navigator.clipboard.writeText(result.report);
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