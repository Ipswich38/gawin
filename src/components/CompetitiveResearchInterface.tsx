'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { Tabs } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';

interface CompetitiveResearchInterfaceProps {
  onResearchComplete?: (result: any) => void;
}

interface ResearchProgress {
  phase: string;
  progress: number;
  details: string;
  activeAgents: number;
  papersReviewed: number;
  searchesCompleted: number;
}

interface CompetitiveFeature {
  name: string;
  description: string;
  gawintScore: number;
  manusScore: number;
  consensusScore: number;
  advantage: string;
}

export default function CompetitiveResearchInterface({ onResearchComplete }: CompetitiveResearchInterfaceProps) {
  const [query, setQuery] = useState('');
  const [academicLevel, setAcademicLevel] = useState('undergraduate');
  const [subject, setSubject] = useState('');
  const [researchMode, setResearchMode] = useState('wide-research');
  const [targetItems, setTargetItems] = useState(100);
  const [parallelAgents, setParallelAgents] = useState(10);
  const [isResearching, setIsResearching] = useState(false);
  const [progress, setProgress] = useState<ResearchProgress | null>(null);
  const [result, setResult] = useState<any>(null);
  const [competitiveAnalysis, setCompetitiveAnalysis] = useState<CompetitiveFeature[]>([]);

  const competitiveFeatures: CompetitiveFeature[] = [
    {
      name: 'Parallel Processing',
      description: 'Multi-agent research with real-time collaboration',
      gawintScore: 95,
      manusScore: 90,
      consensusScore: 60,
      advantage: 'Advanced agent coordination with Filipino language support'
    },
    {
      name: 'Deep Search',
      description: 'Comprehensive literature review across 200M+ papers',
      gawintScore: 90,
      manusScore: 70,
      consensusScore: 95,
      advantage: 'Integrated fact-checking and bias detection'
    },
    {
      name: 'Consensus Analysis',
      description: 'Scientific consensus measurement and visualization',
      gawintScore: 85,
      manusScore: 60,
      consensusScore: 90,
      advantage: 'Real-time monitoring and academic integrity validation'
    },
    {
      name: 'Academic Integrity',
      description: 'Plagiarism detection and citation verification',
      gawintScore: 95,
      manusScore: 40,
      consensusScore: 70,
      advantage: 'Comprehensive ethics compliance and transparency'
    },
    {
      name: 'Source Credibility',
      description: 'Advanced authority and bias scoring',
      gawintScore: 90,
      manusScore: 75,
      consensusScore: 85,
      advantage: 'Multi-factor credibility with real-time updates'
    },
    {
      name: 'Student Support',
      description: 'Learning progression and educational features',
      gawintScore: 90,
      manusScore: 50,
      consensusScore: 60,
      advantage: 'Tailored for Philippine educational system'
    }
  ];

  useEffect(() => {
    setCompetitiveAnalysis(competitiveFeatures);
  }, []);

  const handleResearch = async () => {
    setIsResearching(true);
    setProgress({
      phase: 'Initializing',
      progress: 0,
      details: 'Setting up competitive research system...',
      activeAgents: 0,
      papersReviewed: 0,
      searchesCompleted: 0
    });

    try {
      // Simulate competitive research process
      await simulateCompetitiveResearch();
    } catch (error) {
      console.error('Research failed:', error);
    } finally {
      setIsResearching(false);
    }
  };

  const simulateCompetitiveResearch = async () => {
    const phases = [
      {
        phase: 'Deploying Parallel Agents',
        progress: 15,
        details: `Deploying ${parallelAgents} specialized research agents...`,
        activeAgents: parallelAgents,
        papersReviewed: 0,
        searchesCompleted: 0
      },
      {
        phase: 'Multi-Step Search Strategy',
        progress: 30,
        details: 'Creating structured search strategy across databases...',
        activeAgents: parallelAgents,
        papersReviewed: 50,
        searchesCompleted: 5
      },
      {
        phase: 'Deep Literature Review',
        progress: 50,
        details: `Reviewing up to ${Math.min(1000, targetItems * 10)} papers in detail...`,
        activeAgents: parallelAgents,
        papersReviewed: 250,
        searchesCompleted: 12
      },
      {
        phase: 'Consensus Analysis',
        progress: 70,
        details: 'Analyzing research consensus and conflicting views...',
        activeAgents: parallelAgents,
        papersReviewed: 500,
        searchesCompleted: 18
      },
      {
        phase: 'Real-time Fact Checking',
        progress: 85,
        details: 'Verifying claims against authoritative databases...',
        activeAgents: parallelAgents,
        papersReviewed: 750,
        searchesCompleted: 20
      },
      {
        phase: 'Competitive Analysis',
        progress: 95,
        details: 'Comparing against Manus AI and Consensus AI capabilities...',
        activeAgents: parallelAgents,
        papersReviewed: Math.min(1000, targetItems * 10),
        searchesCompleted: 20
      },
      {
        phase: 'Finalizing Report',
        progress: 100,
        details: 'Generating comprehensive research report...',
        activeAgents: 0,
        papersReviewed: Math.min(1000, targetItems * 10),
        searchesCompleted: 20
      }
    ];

    for (const phase of phases) {
      setProgress(phase);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Generate mock result
    const mockResult = {
      query,
      academicLevel,
      subject,
      researchMode,
      targetItems,
      parallelAgents,
      trustScore: 92,
      consensusLevel: 85,
      papersReviewed: Math.min(1000, targetItems * 10),
      searchesPerformed: 20,
      agentsUsed: parallelAgents,
      processingTime: '2.3 minutes',
      competitiveAdvantages: {
        vsManusAI: [
          'Real-time fact checking integration',
          'Academic integrity validation',
          'Filipino-English bilingual support',
          'Comprehensive ethics compliance'
        ],
        vsConsensusAI: [
          'Multi-agent parallel processing',
          'Real-time monitoring and updates',
          'Student learning progression tracking',
          'Institutional compliance features'
        ]
      },
      uniqueFeatures: [
        'Autonomous consciousness integration',
        'Cultural context awareness',
        'Voice-enabled research interaction',
        'Academic level adaptation'
      ]
    };

    setResult(mockResult);
    onResearchComplete?.(mockResult);
  };

  const renderProgressSection = () => {
    if (!isResearching && !progress) return null;

    return (
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-blue-900">
              {progress?.phase || 'Research Progress'}
            </h3>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {researchMode === 'wide-research' ? 'Wide Research' : 'Deep Search'}
            </Badge>
          </div>
          
          <Progress value={progress?.progress || 0} className="w-full" />
          
          <p className="text-sm text-blue-700">{progress?.details}</p>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-white/50 rounded p-3">
              <div className="font-medium text-blue-900">Active Agents</div>
              <div className="text-xl font-bold text-blue-600">{progress?.activeAgents || 0}</div>
            </div>
            <div className="bg-white/50 rounded p-3">
              <div className="font-medium text-blue-900">Papers Reviewed</div>
              <div className="text-xl font-bold text-blue-600">{progress?.papersReviewed || 0}</div>
            </div>
            <div className="bg-white/50 rounded p-3">
              <div className="font-medium text-blue-900">Searches Completed</div>
              <div className="text-xl font-bold text-blue-600">{progress?.searchesCompleted || 0}</div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderCompetitiveAnalysis = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        🏆 Competitive Analysis vs. Manus AI & Consensus AI
      </h3>
      
      <div className="space-y-4">
        {competitiveAnalysis.map((feature, index) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{feature.name}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="text-center">
                <div className="text-xs font-medium text-orange-600 mb-1">Gawin</div>
                <Progress value={feature.gawintScore} className="h-2" />
                <div className="text-xs text-gray-600 mt-1">{feature.gawintScore}%</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-blue-600 mb-1">Manus AI</div>
                <Progress value={feature.manusScore} className="h-2" />
                <div className="text-xs text-gray-600 mt-1">{feature.manusScore}%</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-green-600 mb-1">Consensus AI</div>
                <Progress value={feature.consensusScore} className="h-2" />
                <div className="text-xs text-gray-600 mt-1">{feature.consensusScore}%</div>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded p-2">
              <div className="text-xs font-medium text-orange-800 mb-1">🚀 Gawin Advantage:</div>
              <div className="text-xs text-orange-700">{feature.advantage}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderResults = () => {
    if (!result) return null;

    return (
      <div className="space-y-6">
        <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <h3 className="text-lg font-semibold mb-4 text-green-900">
            ✅ Research Completed Successfully
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white/60 rounded p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{result.trustScore}%</div>
              <div className="text-xs text-green-700">Trust Score</div>
            </div>
            <div className="bg-white/60 rounded p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{result.consensusLevel}%</div>
              <div className="text-xs text-blue-700">Consensus Level</div>
            </div>
            <div className="bg-white/60 rounded p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">{result.papersReviewed}</div>
              <div className="text-xs text-purple-700">Papers Reviewed</div>
            </div>
            <div className="bg-white/60 rounded p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">{result.agentsUsed}</div>
              <div className="text-xs text-orange-700">Agents Used</div>
            </div>
          </div>
          
          <div className="text-sm text-green-700">
            <strong>Processing Time:</strong> {result.processingTime} | 
            <strong> Searches:</strong> {result.searchesPerformed} | 
            <strong> Mode:</strong> {result.researchMode}
          </div>
        </Card>

        <Tabs defaultValue="advantages" className="w-full">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
            <button 
              className="flex-1 py-2 px-4 text-sm font-medium rounded-md bg-white text-orange-600 shadow-sm"
            >
              🏆 Competitive Advantages
            </button>
            <button className="flex-1 py-2 px-4 text-sm font-medium rounded-md text-gray-500">
              📊 Detailed Analysis
            </button>
            <button className="flex-1 py-2 px-4 text-sm font-medium rounded-md text-gray-500">
              🎯 Unique Features
            </button>
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <h4 className="font-medium text-red-600 mb-2">🆚 Advantages vs. Manus AI</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                {result.competitiveAdvantages.vsManusAI.map((advantage: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                    {advantage}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium text-green-600 mb-2">🆚 Advantages vs. Consensus AI</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                {result.competitiveAdvantages.vsConsensusAI.map((advantage: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    {advantage}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium text-orange-600 mb-2">🌟 Unique Gawin Features</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                {result.uniqueFeatures.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🚀 Competitive Research Mode
        </h1>
        <p className="text-gray-600">
          Advanced research capabilities competing with Manus AI and Consensus AI
        </p>
        <div className="flex justify-center space-x-4 mt-4">
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            vs. Manus AI
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            vs. Consensus AI
          </Badge>
          <Badge variant="default" className="bg-orange-500 text-white">
            Gawin Advantage
          </Badge>
        </div>
      </div>

      {!result && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            🔬 Configure Competitive Research
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Research Question
                </label>
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your research question..."
                  className="w-full"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Level
                  </label>
                  <Select
                    value={academicLevel}
                    onValueChange={setAcademicLevel}
                  >
                    <option value="high-school">High School</option>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="graduate">Graduate</option>
                    <option value="doctoral">Doctoral</option>
                    <option value="professional">Professional</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Area
                  </label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Medicine, Technology"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Research Mode
                </label>
                <Select
                  value={researchMode}
                  onValueChange={setResearchMode}
                >
                  <option value="wide-research">Wide Research (Manus AI Style)</option>
                  <option value="deep-search">Deep Search (Consensus AI Style)</option>
                  <option value="hybrid">Hybrid Approach</option>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Items
                  </label>
                  <Input
                    type="number"
                    value={targetItems}
                    onChange={(e) => setTargetItems(parseInt(e.target.value))}
                    min={10}
                    max={1000}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parallel Agents
                  </label>
                  <Input
                    type="number"
                    value={parallelAgents}
                    onChange={(e) => setParallelAgents(parseInt(e.target.value))}
                    min={1}
                    max={20}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex justify-center">
            <Button
              onClick={handleResearch}
              disabled={!query.trim() || isResearching}
              variant="primary"
              size="lg"
              className="px-8"
            >
              {isResearching ? '🔄 Researching...' : '🚀 Start Competitive Research'}
            </Button>
          </div>
        </Card>
      )}

      {renderProgressSection()}
      
      {!isResearching && !result && renderCompetitiveAnalysis()}
      
      {renderResults()}
    </div>
  );
}