'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { intelligentResearchService, type ResearchContext, type ComprehensiveResearchOutput, type ResearchProgress } from '../lib/services/intelligentResearchService';

interface IntelligentResearchInterfaceProps {
  onResearchComplete?: (result: ComprehensiveResearchOutput) => void;
}

export default function IntelligentResearchInterface({ onResearchComplete }: IntelligentResearchInterfaceProps) {
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('');
  const [academicLevel, setAcademicLevel] = useState<ResearchContext['academicLevel']>('undergraduate');
  const [expectedLength, setExpectedLength] = useState<ResearchContext['expectedLength']>('comprehensive');
  const [perspective, setPerspective] = useState<ResearchContext['perspective']>('academic');
  
  const [isResearching, setIsResearching] = useState(false);
  const [progress, setProgress] = useState<ResearchProgress | null>(null);
  const [result, setResult] = useState<ComprehensiveResearchOutput | null>(null);
  const [showProcess, setShowProcess] = useState(true);
  const [activeSection, setActiveSection] = useState('summary');

  const handleResearch = async () => {
    if (!query.trim()) return;

    setIsResearching(true);
    setResult(null);
    setProgress(null);

    const context: ResearchContext = {
      query: query.trim(),
      domain: domain || 'general',
      academicLevel,
      expectedLength,
      perspective
    };

    try {
      const researchResult = await intelligentResearchService.conductIntelligentResearch(
        context,
        setProgress
      );
      
      setResult(researchResult);
      onResearchComplete?.(researchResult);
    } catch (error) {
      console.error('Research failed:', error);
      // Handle error state
    } finally {
      setIsResearching(false);
    }
  };

  const renderProgressPanel = () => {
    if (!isResearching && !progress) return null;

    return (
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-blue-900 text-sm">
              {progress?.phase || 'Starting...'}
            </h3>
            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
              {progress?.progress || 0}%
            </Badge>
          </div>
          
          <Progress value={progress?.progress || 0} className="h-2" />
          
          <div className="text-xs text-blue-700">
            <div className="font-medium mb-1">{progress?.currentAction}</div>
            <div className="text-blue-600">⏱️ {progress?.timeEstimate}</div>
          </div>
          
          {progress?.insights && progress.insights.length > 0 && (
            <div className="bg-white/50 rounded p-2 text-xs">
              <div className="font-medium text-blue-800 mb-1">💡 Insights</div>
              {progress.insights.map((insight, index) => (
                <div key={index} className="text-blue-700">• {insight}</div>
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  };

  const renderConfigPanel = () => (
    <Card className="p-4">
      <h3 className="font-semibold text-gray-900 mb-3 text-sm">Research Configuration</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Research Query
          </label>
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your research question..."
            className="text-sm"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Domain/Field
          </label>
          <Input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="e.g., Medicine, Technology"
            className="text-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Academic Level
            </label>
            <Select value={academicLevel} onValueChange={(value) => setAcademicLevel(value as ResearchContext['academicLevel'])}>
              <option value="high-school">High School</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="graduate">Graduate</option>
              <option value="doctoral">Doctoral</option>
              <option value="professional">Professional</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Length
            </label>
            <Select value={expectedLength} onValueChange={(value) => setExpectedLength(value as ResearchContext['expectedLength'])}>
              <option value="brief">Brief</option>
              <option value="moderate">Moderate</option>
              <option value="comprehensive">Comprehensive</option>
              <option value="extensive">Extensive</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Perspective
            </label>
            <Select value={perspective} onValueChange={(value) => setPerspective(value as ResearchContext['perspective'])}>
              <option value="academic">Academic</option>
              <option value="practical">Practical</option>
              <option value="critical">Critical</option>
              <option value="exploratory">Exploratory</option>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleResearch}
          disabled={!query.trim() || isResearching}
          variant="primary"
          size="sm"
          className="w-full"
        >
          {isResearching ? '🔍 Researching...' : '🚀 Start Research'}
        </Button>
      </div>
    </Card>
  );

  const renderResultPanel = () => {
    if (!result) {
      return (
        <Card className="p-8 h-full flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-4">🔬</div>
            <h3 className="text-lg font-medium mb-2">Intelligent Research Ready</h3>
            <p className="text-sm">Configure your research parameters and click "Start Research" to begin comprehensive analysis.</p>
          </div>
        </Card>
      );
    }

    const sections = [
      { id: 'summary', label: '📋 Summary', icon: '📋' },
      { id: 'findings', label: '🔍 Key Findings', icon: '🔍' },
      { id: 'analysis', label: '📊 Detailed Analysis', icon: '📊' },
      { id: 'concepts', label: '🧠 Concept Map', icon: '🧠' },
      { id: 'evidence', label: '⚖️ Evidence', icon: '⚖️' },
      { id: 'applications', label: '🛠️ Applications', icon: '🛠️' },
      { id: 'references', label: '📚 References', icon: '📚' }
    ];

    return (
      <Card className="h-full">
        <div className="flex flex-col h-full">
          {/* Quality Metrics Header */}
          <div className="p-4 border-b bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Research Analysis</h2>
              <div className="flex space-x-2">
                <Badge variant="default" className="bg-green-500 text-white">
                  Quality: {Math.round(result.qualityMetrics.comprehensiveness)}%
                </Badge>
                <Badge variant="outline" className="text-blue-600">
                  {result.references.length} Sources
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-2 text-xs">
              <div className="text-center">
                <div className="font-medium text-gray-600">Comprehensive</div>
                <div className="text-lg font-bold text-green-600">{Math.round(result.qualityMetrics.comprehensiveness)}%</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-600">Coherence</div>
                <div className="text-lg font-bold text-blue-600">{Math.round(result.qualityMetrics.coherence)}%</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-600">Evidence</div>
                <div className="text-lg font-bold text-purple-600">{Math.round(result.qualityMetrics.evidenceStrength)}%</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-600">Authority</div>
                <div className="text-lg font-bold text-orange-600">{Math.round(result.qualityMetrics.expertValidation)}%</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-600">Relevance</div>
                <div className="text-lg font-bold text-indigo-600">{Math.round(result.qualityMetrics.practicalRelevance)}%</div>
              </div>
            </div>
          </div>

          {/* Section Navigation */}
          <div className="p-2 border-b bg-gray-50">
            <div className="flex space-x-1 overflow-x-auto">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap ${
                    activeSection === section.id
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {section.icon} {section.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeSection === 'summary' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Executive Summary</h3>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    {result.executiveSummary}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'findings' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3">Key Findings</h3>
                <div className="space-y-3">
                  {result.keyFindings.map((finding, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="prose prose-sm text-gray-700">{finding}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'analysis' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Introduction</h3>
                  <div className="prose prose-sm max-w-none text-gray-700">{result.detailedAnalysis.introduction}</div>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Methodology</h3>
                  <div className="prose prose-sm max-w-none text-gray-700">{result.detailedAnalysis.methodology}</div>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Findings</h3>
                  <div className="prose prose-sm max-w-none text-gray-700">{result.detailedAnalysis.findings}</div>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Discussion</h3>
                  <div className="prose prose-sm max-w-none text-gray-700">{result.detailedAnalysis.discussion}</div>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Implications</h3>
                  <div className="prose prose-sm max-w-none text-gray-700">{result.detailedAnalysis.implications}</div>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Limitations</h3>
                  <div className="prose prose-sm max-w-none text-gray-700">{result.detailedAnalysis.limitations}</div>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Conclusions</h3>
                  <div className="prose prose-sm max-w-none text-gray-700">{result.detailedAnalysis.conclusions}</div>
                </div>
              </div>
            )}

            {activeSection === 'concepts' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3">Concept Map</h3>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg">
                  <div className="text-center mb-4">
                    <div className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                      {result.conceptMap.centralConcept}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                    {result.conceptMap.relatedConcepts.map((concept, index) => (
                      <div key={index} className="bg-white p-2 rounded text-center text-sm text-gray-700 border">
                        {concept}
                      </div>
                    ))}
                  </div>
                </div>
                
                {result.conceptMap.consensus.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">✅ Consensus Points</h4>
                    <ul className="space-y-1">
                      {result.conceptMap.consensus.map((point, index) => (
                        <li key={index} className="text-sm text-gray-700">• {point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.conceptMap.controversies.length > 0 && (
                  <div>
                    <h4 className="font-medium text-orange-700 mb-2">⚡ Controversies</h4>
                    <ul className="space-y-1">
                      {result.conceptMap.controversies.map((controversy, index) => (
                        <li key={index} className="text-sm text-gray-700">• {controversy}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'evidence' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3">Evidence Hierarchy</h3>
                
                {result.evidenceHierarchy.strongEvidence && result.evidenceHierarchy.strongEvidence.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">🟢 Strong Evidence</h4>
                    <ul className="space-y-1">
                      {result.evidenceHierarchy.strongEvidence.map((evidence: string, index: number) => (
                        <li key={index} className="text-sm text-green-700">• {evidence}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.evidenceHierarchy.moderateEvidence && result.evidenceHierarchy.moderateEvidence.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">🟡 Moderate Evidence</h4>
                    <ul className="space-y-1">
                      {result.evidenceHierarchy.moderateEvidence.map((evidence: string, index: number) => (
                        <li key={index} className="text-sm text-yellow-700">• {evidence}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.evidenceHierarchy.limitedEvidence && result.evidenceHierarchy.limitedEvidence.length > 0 && (
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-medium text-orange-800 mb-2">🟠 Limited Evidence</h4>
                    <ul className="space-y-1">
                      {result.evidenceHierarchy.limitedEvidence.map((evidence: string, index: number) => (
                        <li key={index} className="text-sm text-orange-700">• {evidence}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.evidenceHierarchy.contradictoryEvidence && result.evidenceHierarchy.contradictoryEvidence.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">🔴 Contradictory Evidence</h4>
                    <ul className="space-y-1">
                      {result.evidenceHierarchy.contradictoryEvidence.map((evidence: string, index: number) => (
                        <li key={index} className="text-sm text-red-700">• {evidence}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'applications' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3">Practical Applications</h3>
                <div className="space-y-3">
                  {result.practicalApplications.map((application, index) => (
                    <div key={index} className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm text-blue-800">{application}</div>
                    </div>
                  ))}
                </div>

                <h3 className="font-semibold text-gray-900 mb-3 mt-6">Future Research Directions</h3>
                <div className="space-y-3">
                  {result.futureDirections.map((direction, index) => (
                    <div key={index} className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-sm text-purple-800">{direction}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'references' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3">References</h3>
                <div className="space-y-3">
                  {result.references.map((ref, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{ref.citation}</div>
                          <a 
                            href={ref.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
                          >
                            {ref.url}
                          </a>
                        </div>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {Math.round(ref.relevanceScore)}% relevant
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Left Panel - Process & Controls */}
      <div className={`${showProcess ? 'w-80' : 'w-12'} transition-all duration-300 bg-white border-r shadow-sm flex flex-col`}>
        <div className="p-3 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            {showProcess && (
              <h1 className="text-lg font-semibold text-gray-900">🧠 Intelligent Research</h1>
            )}
            <Button
              onClick={() => setShowProcess(!showProcess)}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              {showProcess ? '◀' : '▶'}
            </Button>
          </div>
        </div>

        {showProcess && (
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {renderConfigPanel()}
            {renderProgressPanel()}
          </div>
        )}
      </div>

      {/* Right Panel - Output */}
      <div className="flex-1 p-4">
        {renderResultPanel()}
      </div>
    </div>
  );
}