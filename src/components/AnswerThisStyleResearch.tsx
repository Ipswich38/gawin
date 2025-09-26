'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  FileText,
  Brain,
  BookOpen,
  Database,
  Download,
  Share,
  Bookmark,
  Quote,
  MapPin,
  TrendingUp,
  Filter,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  Eye,
  BarChart3,
  Network,
  Lightbulb,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap
} from 'lucide-react';
import {
  academicResearchService,
  type AcademicPaper,
  type LiteratureReview,
  type CitationStyle,
  type FormattedCitation
} from '../lib/services/academicResearchService';

// Enhanced types for academic research - using imports from service

interface ResearchLibraryItem {
  id: string;
  title: string;
  type: 'paper' | 'report' | 'thesis' | 'book';
  dateAdded: string;
  tags: string[];
  notes: string;
  paper?: AcademicPaper;
}

interface AnswerThisStyleResearchProps {
  onResearchComplete?: (result: any) => void;
}

export default function AnswerThisStyleResearch({ onResearchComplete }: AnswerThisStyleResearchProps) {
  // Main states
  const [query, setQuery] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'library' | 'citations' | 'insights'>('search');

  // Research results
  const [literatureReview, setLiteratureReview] = useState<LiteratureReview | null>(null);
  const [papers, setPapers] = useState<AcademicPaper[]>([]);
  const [researchLibrary, setResearchLibrary] = useState<ResearchLibraryItem[]>([]);
  const [citations, setCitations] = useState<FormattedCitation[]>([]);

  // UI states
  const [selectedPaper, setSelectedPaper] = useState<AcademicPaper | null>(null);
  const [citationStyle, setCitationStyle] = useState<'APA' | 'MLA' | 'Chicago' | 'Harvard' | 'IEEE'>('APA');
  const [filterYearRange, setFilterYearRange] = useState<[number, number]>([2020, 2024]);
  const [searchFilters, setSearchFilters] = useState({
    type: 'all',
    minCitations: 0,
    peerReviewed: true,
    openAccess: false
  });

  // Academic research function using the service
  const conductAcademicResearch = async (searchQuery: string) => {
    setIsResearching(true);

    try {
      console.log('🎓 Starting academic literature review...');

      // Use the academic research service
      const review = await academicResearchService.conductLiteratureReview(
        searchQuery,
        {
          yearRange: filterYearRange,
          minCitations: searchFilters.minCitations,
          peerReviewed: searchFilters.peerReviewed,
          openAccess: searchFilters.openAccess
        },
        citationStyle
      );

      setLiteratureReview(review);
      setCitations(review.citations);

      // Extract papers from citations
      const extractedPapers = review.citations.map(citation => citation.paper);
      setPapers(extractedPapers);

      console.log('✅ Academic research completed:', {
        papers: extractedPapers.length,
        confidence: review.confidenceScore
      });

    } catch (error) {
      console.error('Academic research failed:', error);
      // You could show an error message to the user here
    } finally {
      setIsResearching(false);
    }
  };

  // Citation formatting is now handled by the academic research service

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Brain className="mr-3 text-blue-600" size={32} />
                Gawin Research Assistant
              </h1>
              <p className="text-gray-600 mt-2">AI-powered academic research with 200M+ papers</p>
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center"
              >
                <Download size={16} className="mr-2" />
                Export
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg flex items-center"
              >
                <Share size={16} className="mr-2" />
                Share
              </motion.button>
            </div>
          </div>

          {/* Search Interface */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a research question or describe your topic..."
              className="w-full pl-12 pr-32 py-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && conductAcademicResearch(query)}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => conductAcademicResearch(query)}
              disabled={isResearching || !query.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isResearching ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Researching...
                </>
              ) : (
                <>
                  <Zap size={16} className="mr-2" />
                  Research
                </>
              )}
            </motion.button>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4 mt-4">
            <select
              value={citationStyle}
              onChange={(e) => setCitationStyle(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="APA">APA Style</option>
              <option value="MLA">MLA Style</option>
              <option value="Chicago">Chicago Style</option>
              <option value="Harvard">Harvard Style</option>
              <option value="IEEE">IEEE Style</option>
            </select>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Year Range:</span>
              <input
                type="number"
                value={filterYearRange[0]}
                onChange={(e) => setFilterYearRange([parseInt(e.target.value), filterYearRange[1]])}
                className="w-20 px-2 py-1 border border-gray-300 rounded"
                min="1900"
                max="2024"
              />
              <span>-</span>
              <input
                type="number"
                value={filterYearRange[1]}
                onChange={(e) => setFilterYearRange([filterYearRange[0], parseInt(e.target.value)])}
                className="w-20 px-2 py-1 border border-gray-300 rounded"
                min="1900"
                max="2024"
              />
            </div>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={searchFilters.peerReviewed}
                onChange={(e) => setSearchFilters({...searchFilters, peerReviewed: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Peer Reviewed</span>
            </label>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'search', label: 'Literature Review', icon: FileText },
            { id: 'library', label: 'Research Library', icon: BookOpen },
            { id: 'citations', label: 'Citations', icon: Quote },
            { id: 'insights', label: 'Research Insights', icon: BarChart3 }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-lg flex items-center font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={18} className="mr-2" />
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Literature Review */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <FileText className="mr-2 text-blue-600" size={24} />
                    Literature Review
                  </h2>

                  {literatureReview ? (
                    <div className="space-y-6">
                      {/* Executive Summary */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Executive Summary</h3>
                        <p className="text-gray-700 leading-relaxed">{literatureReview.executiveSummary}</p>
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
                            Confidence: {Math.round(literatureReview.confidenceScore * 100)}%
                          </span>
                          <span className="ml-2">Based on {literatureReview.totalPapers} papers</span>
                        </div>
                      </div>

                      {/* Key Themes */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Key Themes</h3>
                        <div className="flex flex-wrap gap-2">
                          {literatureReview.keyThemes.map((theme, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              {theme}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Research Gaps */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <Lightbulb className="mr-2 text-yellow-500" size={18} />
                          Research Gaps Identified
                        </h3>
                        <ul className="space-y-2">
                          {literatureReview.researchGaps.map((gap, index) => (
                            <li key={index} className="flex items-start">
                              <ArrowRight className="mr-2 text-yellow-500 mt-0.5" size={16} />
                              <span className="text-gray-700">{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Conclusions */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Key Conclusions</h3>
                        <ul className="space-y-2">
                          {literatureReview.conclusions.map((conclusion, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle2 className="mr-2 text-green-500 mt-0.5" size={16} />
                              <span className="text-gray-700">{conclusion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Brain className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-600">Enter a research question to generate a comprehensive literature review</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Papers Sidebar */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Database className="mr-2 text-green-600" size={24} />
                  Academic Papers ({papers.length})
                </h2>

                <div className="space-y-4">
                  {papers.map((paper) => (
                    <motion.div
                      key={paper.id}
                      whileHover={{ scale: 1.02 }}
                      className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedPaper(paper)}
                    >
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">
                        {paper.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">
                        {paper.authors.join(', ')} ({paper.year})
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">{paper.citationCount} citations</span>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                          <span className="text-green-600">{Math.round(paper.relevanceScore * 100)}% relevant</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <BookOpen className="mr-2 text-purple-600" size={24} />
                Research Library
              </h2>
              <div className="text-center py-12">
                <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">Your saved papers and research materials will appear here</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'citations' && (
            <motion.div
              key="citations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Quote className="mr-2 text-indigo-600" size={24} />
                Citations ({citations.length})
              </h2>

              <div className="space-y-4">
                {citations.map((citation) => (
                  <div key={citation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm">{citation.paper.title}</h3>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Copy size={16} />
                      </motion.button>
                    </div>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                      {citation.formatted}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Research Timeline */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Clock className="mr-2 text-orange-600" size={24} />
                  Research Timeline
                </h2>
                {literatureReview?.timeline ? (
                  <div className="space-y-4">
                    {literatureReview.timeline.map((event, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-4 h-4 bg-orange-500 rounded-full mt-1 mr-4"></div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{event.year}</h3>
                          <p className="text-gray-700 text-sm">{event.event}</p>
                          <p className="text-gray-600 text-xs mt-1">{event.significance}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600">Research timeline will appear here</p>
                  </div>
                )}
              </div>

              {/* Research Network */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Network className="mr-2 text-purple-600" size={24} />
                  Citation Network
                </h2>
                <div className="text-center py-12">
                  <Network className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600">Citation network visualization will appear here</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Paper Detail Modal */}
        <AnimatePresence>
          {selectedPaper && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedPaper(null)}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{selectedPaper.title}</h2>
                  <button
                    onClick={() => setSelectedPaper(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Authors</h3>
                    <p className="text-gray-700">{selectedPaper.authors.join(', ')}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Publication</h3>
                    <p className="text-gray-700">{selectedPaper.journal} ({selectedPaper.year})</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Abstract</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedPaper.abstract}</p>
                  </div>

                  <div className="flex items-center space-x-4 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center"
                    >
                      <Bookmark size={16} className="mr-2" />
                      Save to Library
                    </motion.button>

                    {selectedPaper.doi && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg flex items-center"
                      >
                        <ExternalLink size={16} className="mr-2" />
                        View Full Paper
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}