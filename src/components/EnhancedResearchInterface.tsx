'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Search, BookOpen, Shield, CheckCircle, AlertTriangle, Users, 
  TrendingUp, Brain, FileText, Award, Clock, Globe, Zap,
  BarChart3, Target, Lightbulb, BookMarked, GraduationCap,
  Microscope, Lock, RefreshCw, Eye, Star, ThumbsUp
} from 'lucide-react';
import { enhancedResearchSystem, type ResearchQuery, type EnhancedResearchResult } from '@/lib/services/enhancedResearchSystem';

interface EnhancedResearchInterfaceProps {
  onResearchComplete?: (result: EnhancedResearchResult) => void;
}

export function EnhancedResearchInterface({ onResearchComplete }: EnhancedResearchInterfaceProps) {
  const [query, setQuery] = useState<Partial<ResearchQuery>>({
    query: '',
    academicLevel: 'undergraduate',
    subject: '',
    citationStyle: 'APA',
    requirements: {
      minSources: 5,
      maxSources: 20,
      requirePeerReview: true,
      excludeBiased: true,
      maxSourceAge: 5,
      includeInternational: true,
      requireMethodologyAnalysis: false,
      includeStatisticalAnalysis: false
    },
    deliverables: {
      executiveSummary: true,
      literatureReview: true,
      factCheckReport: true,
      integrityReport: true,
      citations: true,
      recommendations: true,
      futureResearch: false
    }
  });

  const [result, setResult] = useState<EnhancedResearchResult | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [competitorComparison, setCompetitorComparison] = useState<any>(null);

  const researchSteps = [
    'Analyzing query and setting parameters',
    'Searching authoritative databases',
    'Evaluating source credibility',
    'Performing real-time fact checking',
    'Analyzing academic integrity',
    'Generating citations and references',
    'Calculating trustworthiness metrics',
    'Creating transparency report',
    'Preparing student learning materials',
    'Finalizing comprehensive report'
  ];

  const handleStartResearch = async () => {
    if (!query.query || !query.subject) {
      alert('Please fill in the research query and subject');
      return;
    }

    setIsResearching(true);
    setProgress(0);
    setResult(null);

    try {
      // Simulate progress updates
      for (let i = 0; i < researchSteps.length; i++) {
        setCurrentStep(researchSteps[i]);
        setProgress((i + 1) * 10);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Conduct actual research
      const researchResult = await enhancedResearchSystem.conductEnhancedResearch(query as ResearchQuery);
      
      setResult(researchResult);
      setProgress(100);
      onResearchComplete?.(researchResult);

      // Get competitor comparison
      const comparison = await enhancedResearchSystem.compareWithCompetitors(query as ResearchQuery);
      setCompetitorComparison(comparison);

    } catch (error) {
      console.error('Research failed:', error);
      alert('Research failed: ' + (error as Error).message);
    } finally {
      setIsResearching(false);
      setCurrentStep('');
    }
  };

  const handleMonitorResearch = async () => {
    if (result) {
      await enhancedResearchSystem.monitorResearchUpdates(result);
      alert('Research monitoring activated! You\'ll receive updates on changes.');
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getReadinessColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
          <Microscope className="w-10 h-10 text-blue-600" />
          Enhanced Research System
        </h1>
        <p className="text-gray-600 text-lg">
          Comprehensive, trustworthy research with academic integrity and real-time verification
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Academic Integrity
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Fact Verified
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Award className="w-3 h-3" />
            Research Grade
          </Badge>
        </div>
      </div>

      {!result ? (
        <>
          {/* Research Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Research Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Research Query *</label>
                    <Textarea
                      placeholder="Enter your research question or topic..."
                      value={query.query || ''}
                      onChange={(e) => setQuery(prev => ({ ...prev, query: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Subject Area *</label>
                    <Input
                      placeholder="e.g., Psychology, Computer Science, Medicine"
                      value={query.subject || ''}
                      onChange={(e) => setQuery(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Academic Level</label>
                      <Select
                        value={query.academicLevel}
                        onValueChange={(value) => setQuery(prev => ({ ...prev, academicLevel: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high-school">High School</SelectItem>
                          <SelectItem value="undergraduate">Undergraduate</SelectItem>
                          <SelectItem value="graduate">Graduate</SelectItem>
                          <SelectItem value="doctoral">Doctoral</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Citation Style</label>
                      <Select
                        value={query.citationStyle}
                        onValueChange={(value) => setQuery(prev => ({ ...prev, citationStyle: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="APA">APA</SelectItem>
                          <SelectItem value="MLA">MLA</SelectItem>
                          <SelectItem value="Chicago">Chicago</SelectItem>
                          <SelectItem value="Harvard">Harvard</SelectItem>
                          <SelectItem value="IEEE">IEEE</SelectItem>
                          <SelectItem value="Vancouver">Vancouver</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-3">Research Requirements</label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Require Peer Review</span>
                        <Button
                          variant={query.requirements?.requirePeerReview ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setQuery(prev => ({
                            ...prev,
                            requirements: { ...prev.requirements!, requirePeerReview: !prev.requirements?.requirePeerReview }
                          }))}
                        >
                          {query.requirements?.requirePeerReview ? 'ON' : 'OFF'}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Exclude Biased Sources</span>
                        <Button
                          variant={query.requirements?.excludeBiased ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setQuery(prev => ({
                            ...prev,
                            requirements: { ...prev.requirements!, excludeBiased: !prev.requirements?.excludeBiased }
                          }))}
                        >
                          {query.requirements?.excludeBiased ? 'ON' : 'OFF'}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Include International Sources</span>
                        <Button
                          variant={query.requirements?.includeInternational ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setQuery(prev => ({
                            ...prev,
                            requirements: { ...prev.requirements!, includeInternational: !prev.requirements?.includeInternational }
                          }))}
                        >
                          {query.requirements?.includeInternational ? 'ON' : 'OFF'}
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-600">Max Sources</label>
                          <Input
                            type="number"
                            min="5"
                            max="50"
                            value={query.requirements?.maxSources || 20}
                            onChange={(e) => setQuery(prev => ({
                              ...prev,
                              requirements: { ...prev.requirements!, maxSources: parseInt(e.target.value) }
                            }))}
                          />
                        </div>

                        <div>
                          <label className="text-xs text-gray-600">Max Age (years)</label>
                          <Input
                            type="number"
                            min="1"
                            max="20"
                            value={query.requirements?.maxSourceAge || 5}
                            onChange={(e) => setQuery(prev => ({
                              ...prev,
                              requirements: { ...prev.requirements!, maxSourceAge: parseInt(e.target.value) }
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <label className="block text-sm font-medium mb-3">Deliverables</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(query.deliverables || {}).map(([key, value]) => (
                    <Button
                      key={key}
                      variant={value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setQuery(prev => ({
                        ...prev,
                        deliverables: { ...prev.deliverables!, [key]: !value }
                      }))}
                      className="justify-start text-xs"
                    >
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleStartResearch}
                disabled={isResearching || !query.query || !query.subject}
                className="w-full h-12 text-lg"
              >
                {isResearching ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Conducting Research...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Microscope className="w-5 h-5" />
                    Start Enhanced Research
                  </div>
                )}
              </Button>

              {isResearching && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>{currentStep}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Research Results */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trust Score Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Trust Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-center p-4 rounded-lg ${getTrustScoreColor(result.trustworthinessMetrics.overallTrustScore)}`}>
                  <div className="text-3xl font-bold">
                    {Math.round(result.trustworthinessMetrics.overallTrustScore)}%
                  </div>
                  <div className="text-sm mt-1">Overall Trust Score</div>
                </div>
                
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span>Source Credibility</span>
                    <span className="font-medium">{Math.round(result.trustworthinessMetrics.sourceCredibilityAverage)}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Fact Check Accuracy</span>
                    <span className="font-medium">{Math.round(result.trustworthinessMetrics.factCheckAccuracy)}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Academic Integrity</span>
                    <span className="font-medium">{Math.round(result.trustworthinessMetrics.academicIntegrityScore)}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Bias Assessment</span>
                    <span className="font-medium">{Math.round(result.trustworthinessMetrics.biasAssessment)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Readiness Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Academic Readiness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="m18,2.0845
                          a 15.9155,15.9155 0 0,1 0,31.831
                          a 15.9155,15.9155 0 0,1 0,-31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="2"
                      />
                      <path
                        d="m18,2.0845
                          a 15.9155,15.9155 0 0,1 0,31.831
                          a 15.9155,15.9155 0 0,1 0,-31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={`${result.readinessScore}, 100`}
                        className={`${getReadinessColor(result.readinessScore)} text-current`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold">{Math.round(result.readinessScore)}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {result.readinessScore >= 85 ? 'Ready for Submission' : 
                     result.readinessScore >= 70 ? 'Needs Minor Improvements' : 
                     'Requires Significant Work'}
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Originality: {Math.round(result.integrityReport.originalityScore)}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Citations: {Math.round(result.integrityReport.citationAccuracy)}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Ethics: {Math.round(result.integrityReport.ethicsCompliance)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Delivery Time</span>
                    </div>
                    <span className="font-medium">{(result.deliveryTime / 1000).toFixed(1)}s</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Sources Found</span>
                    </div>
                    <span className="font-medium">{result.researchReport.sources.length}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Fact Checks</span>
                    </div>
                    <span className="font-medium">{result.factCheckResults.length}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Peer Reviewed</span>
                    </div>
                    <span className="font-medium">
                      {result.researchReport.literatureReview.peerReviewedSources}/
                      {result.researchReport.literatureReview.totalSources}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Confidence</span>
                    </div>
                    <span className="font-medium">{Math.round(result.confidence)}%</span>
                  </div>
                </div>

                <Button 
                  onClick={handleMonitorResearch}
                  variant="outline" 
                  className="w-full mt-4"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Monitor for Updates
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Results Tabs */}
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="sources">Sources</TabsTrigger>
              <TabsTrigger value="factcheck">Fact Check</TabsTrigger>
              <TabsTrigger value="integrity">Integrity</TabsTrigger>
              <TabsTrigger value="learning">Learning</TabsTrigger>
              <TabsTrigger value="competitive">Competitive</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Executive Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {result.researchReport.executiveSummary}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Findings</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.researchReport.keyFindings.map((finding, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {result.improvementSuggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      Improvement Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.improvementSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="sources" className="space-y-4">
              {result.researchReport.sources.slice(0, 10).map((source, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-sm">{source.title}</h4>
                      <div className="flex gap-2">
                        <Badge variant={source.credibilityAnalysis.authorityScore >= 80 ? 'default' : 'secondary'}>
                          {Math.round(source.credibilityAnalysis.authorityScore)}% Authority
                        </Badge>
                        {source.credibilityAnalysis.peerReviewStatus === 'peer-reviewed' && (
                          <Badge variant="outline">Peer Reviewed</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {source.metadata.author} • {source.metadata.publishDate} • {source.metadata.domain}
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {source.content.substring(0, 200)}...
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Relevance: {Math.round(source.relevanceScore)}%</span>
                      <span>Bias Score: {Math.round(source.credibilityAnalysis.biasAnalysis.biasScore)}%</span>
                      <span>Type: {source.primaryOrSecondary}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="factcheck" className="space-y-4">
              {result.factCheckResults.map((factCheck, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge 
                        variant={
                          factCheck.overallVerdict === 'true' ? 'default' :
                          factCheck.overallVerdict === 'mostly-true' ? 'secondary' :
                          factCheck.overallVerdict === 'mixed' ? 'outline' : 'destructive'
                        }
                      >
                        {factCheck.overallVerdict.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium">{Math.round(factCheck.confidenceLevel)}% Confidence</span>
                    </div>
                    <p className="text-sm font-medium mb-2">{factCheck.claim}</p>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>Expert Consensus: {Math.round(factCheck.expertConsensus)}%</p>
                      <p>Sources Checked: {factCheck.sourcesChecked}</p>
                      <p>Processing Time: {factCheck.processingTime}ms</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="integrity" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{Math.round(result.integrityReport.originalityScore)}%</div>
                    <div className="text-sm text-gray-600">Originality</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{Math.round(result.integrityReport.citationAccuracy)}%</div>
                    <div className="text-sm text-gray-600">Citation Accuracy</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{Math.round(result.integrityReport.ethicsCompliance)}%</div>
                    <div className="text-sm text-gray-600">Ethics Compliance</div>
                  </CardContent>
                </Card>
              </div>

              {result.integrityReport.violations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      Integrity Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.integrityReport.violations.map((violation, index) => (
                        <div key={index} className="border-l-4 border-yellow-400 pl-4">
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-sm">{violation.type}</p>
                            <Badge variant={violation.severity === 'severe' ? 'destructive' : 'secondary'}>
                              {violation.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{violation.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            <strong>Recommendation:</strong> {violation.recommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="learning" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookMarked className="w-5 h-5" />
                    Key Concepts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.studentSupport.conceptExplanations.map((concept, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm">{concept}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Skills Developed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {result.studentSupport.skillsDeveloped.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">{skill}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Next Learning Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.studentSupport.nextLearningSteps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
                          {index + 1}
                        </div>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="competitive" className="space-y-4">
              {competitorComparison && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Competitive Advantages
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {competitorComparison.advantages.map((advantage: string, index: number) => (
                          <div key={index} className="flex items-start gap-2">
                            <ThumbsUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{advantage}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Unique Features
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {competitorComparison.uniqueFeatures.map((feature: string, index: number) => (
                          <Badge key={index} variant="outline" className="justify-start p-2">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => {
                setResult(null);
                setQuery(prev => ({ ...prev, query: '', subject: '' }));
              }}
              variant="outline"
            >
              <Search className="w-4 h-4 mr-2" />
              New Research
            </Button>
            
            <Button 
              onClick={() => {
                const printWindow = window.open('', '_blank');
                printWindow?.document.write(`
                  <html>
                    <head><title>Research Report</title></head>
                    <body>
                      <h1>Enhanced Research Report</h1>
                      <p><strong>Query:</strong> ${result.query.query}</p>
                      <p><strong>Trust Score:</strong> ${Math.round(result.trustworthinessMetrics.overallTrustScore)}%</p>
                      <h2>Executive Summary</h2>
                      <p>${result.researchReport.executiveSummary}</p>
                    </body>
                  </html>
                `);
                printWindow?.print();
              }}
              variant="default"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </>
      )}
    </div>
  );
}