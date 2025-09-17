'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Brain, 
  FileText, 
  CheckCircle, 
  Clock, 
  ChevronRight,
  BookOpen,
  Target,
  Lightbulb,
  Download,
  Copy,
  PlayCircle,
  PauseCircle
} from 'lucide-react';

interface ResearchStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  result?: string;
  sources?: string[];
}

interface ResearchResult {
  query: string;
  steps: ResearchStep[];
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  sources: string[];
  timestamp: number;
}

interface EnhancedResearchInterfaceProps {
  onResearchComplete?: (result: ResearchResult) => void;
}

export function EnhancedResearchInterface({ onResearchComplete }: EnhancedResearchInterfaceProps) {
  const [query, setQuery] = useState('');
  const [researchType, setResearchType] = useState<'academic' | 'business' | 'general'>('general');
  const [depth, setDepth] = useState<'quick' | 'comprehensive' | 'deep'>('comprehensive');
  
  const [isResearching, setIsResearching] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [researchSteps, setResearchSteps] = useState<ResearchStep[]>([]);
  const [finalResult, setFinalResult] = useState<ResearchResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const initializeResearchSteps = (query: string): ResearchStep[] => {
    const baseSteps: ResearchStep[] = [
      {
        id: 'planning',
        title: 'Research Planning',
        description: 'Breaking down the research question into manageable components',
        status: 'pending'
      },
      {
        id: 'background',
        title: 'Background Research',
        description: 'Gathering foundational information and context',
        status: 'pending'
      },
      {
        id: 'deep_dive',
        title: 'Deep Analysis',
        description: 'Conducting detailed investigation of key aspects',
        status: 'pending'
      },
      {
        id: 'synthesis',
        title: 'Information Synthesis',
        description: 'Combining findings into coherent insights',
        status: 'pending'
      },
      {
        id: 'report',
        title: 'Report Generation',
        description: 'Creating comprehensive research report',
        status: 'pending'
      }
    ];

    // Add additional steps based on research type and depth
    if (researchType === 'academic') {
      baseSteps.splice(3, 0, {
        id: 'literature',
        title: 'Literature Review',
        description: 'Reviewing relevant academic sources and studies',
        status: 'pending'
      });
    }

    if (depth === 'deep') {
      baseSteps.splice(-1, 0, {
        id: 'validation',
        title: 'Cross-Validation',
        description: 'Verifying findings with multiple sources',
        status: 'pending'
      });
    }

    return baseSteps;
  };

  const handleResearchStep = async (step: ResearchStep, stepIndex: number): Promise<string> => {
    // Update step status to in_progress
    setResearchSteps(prev => prev.map((s, i) => 
      i === stepIndex ? { ...s, status: 'in_progress' } : s
    ));

    try {
      // Create research prompt based on step type
      let prompt = '';
      
      switch (step.id) {
        case 'planning':
          prompt = `As a research expert, help me plan a ${researchType} research project on: "${query}". 
          
          Please provide:
          1. 3-5 key research questions to investigate
          2. Important aspects to consider
          3. Research methodology approach
          4. Expected challenges and considerations
          
          Format as a structured research plan.`;
          break;
          
        case 'background':
          prompt = `Provide comprehensive background information on: "${query}". 
          
          Please include:
          1. Current state of knowledge
          2. Historical context and development
          3. Key terminology and concepts
          4. Major stakeholders or players involved
          5. Current trends and developments
          
          Focus on establishing a solid foundation for deeper research.`;
          break;
          
        case 'deep_dive':
          prompt = `Conduct a detailed analysis of: "${query}". 
          
          Please provide:
          1. In-depth examination of core aspects
          2. Multiple perspectives and viewpoints
          3. Advantages and disadvantages
          4. Case studies or examples
          5. Data, statistics, or evidence
          6. Expert opinions and insights
          
          Aim for comprehensive coverage of the topic.`;
          break;
          
        case 'literature':
          prompt = `Provide an academic literature review perspective on: "${query}". 
          
          Please include:
          1. Key academic theories and frameworks
          2. Recent research findings and studies
          3. Scholarly debates and controversies
          4. Research gaps and opportunities
          5. Methodological approaches used in the field
          
          Use academic writing style with focus on evidence-based insights.`;
          break;
          
        case 'synthesis':
          const previousResults = researchSteps.slice(0, stepIndex).map(s => s.result).join('\n\n');
          prompt = `Based on the research conducted so far on "${query}", please synthesize the information:
          
          Previous Research Results:
          ${previousResults}
          
          Please provide:
          1. Key insights and patterns
          2. Connections between different aspects
          3. Contradictions or conflicting information
          4. Emerging themes and conclusions
          5. Areas needing further investigation
          
          Create a coherent synthesis that ties everything together.`;
          break;
          
        case 'validation':
          const allPreviousResults = researchSteps.slice(0, stepIndex).map(s => s.result).join('\n\n');
          prompt = `Cross-validate and verify the research findings on "${query}":
          
          Current Findings:
          ${allPreviousResults}
          
          Please:
          1. Identify any inconsistencies or contradictions
          2. Suggest additional verification methods
          3. Rate the reliability of different claims
          4. Highlight the strongest supported conclusions
          5. Flag any areas requiring skepticism
          
          Provide a validation assessment.`;
          break;
          
        case 'report':
          const allResults = researchSteps.slice(0, stepIndex).map(s => s.result).join('\n\n');
          prompt = `Create a comprehensive research report on "${query}" based on all findings:
          
          Research Findings:
          ${allResults}
          
          Please provide:
          1. Executive Summary
          2. Key Findings (5-7 main points)
          3. Detailed Analysis
          4. Recommendations or Implications
          5. Conclusion
          6. Suggested next steps or further research
          
          Format as a professional research report.`;
          break;
          
        default:
          prompt = `Please provide detailed information about: "${query}" from the perspective of ${step.title}.`;
      }

      // Call the Groq API using the same infrastructure as main chat
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are an expert researcher conducting ${researchType} research. Provide thorough, accurate, and well-structured information. Always cite sources when possible and maintain academic rigor.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model: 'mixtral-8x7b-32768',
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Research step failed: ${response.statusText}`);
      }

      const data = await response.json();
      const result = data.content || data.message || 'No response received';

      // Update step with result
      setResearchSteps(prev => prev.map((s, i) => 
        i === stepIndex ? { ...s, status: 'completed', result } : s
      ));

      return result;
    } catch (error) {
      console.error(`Research step ${step.id} failed:`, error);
      
      // Update step with error status
      setResearchSteps(prev => prev.map((s, i) => 
        i === stepIndex ? { ...s, status: 'error', result: `Error: ${error}` } : s
      ));
      
      throw error;
    }
  };

  const startResearch = async () => {
    if (!query.trim()) return;

    setIsResearching(true);
    setShowResult(false);
    setFinalResult(null);
    setCurrentStep(0);

    const steps = initializeResearchSteps(query);
    setResearchSteps(steps);

    try {
      // Execute research steps sequentially
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i);
        await handleResearchStep(steps[i], i);
        
        // Small delay between steps for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Generate final research result
      const completedSteps = researchSteps.filter(s => s.status === 'completed');
      const allFindings = completedSteps.map(s => s.result).join('\n\n');
      
      // Extract key findings and create summary
      const summaryResponse = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an expert at creating research summaries. Extract the most important insights and create clear, actionable summaries.'
            },
            {
              role: 'user',
              content: `Create a final summary for this research on "${query}":

${allFindings}

Please provide:
1. A concise summary (2-3 paragraphs)
2. 5-7 key findings as bullet points
3. 3-5 practical recommendations
4. List of main topics covered (as potential sources)

Format as JSON with fields: summary, keyFindings, recommendations, sources`
            }
          ],
          model: 'mixtral-8x7b-32768',
          stream: false
        })
      });

      const summaryData = await summaryResponse.json();
      let parsedSummary;
      
      try {
        parsedSummary = JSON.parse(summaryData.content);
      } catch {
        // Fallback if JSON parsing fails
        parsedSummary = {
          summary: summaryData.content,
          keyFindings: ['Research completed successfully'],
          recommendations: ['Review findings for actionable insights'],
          sources: ['AI-generated research']
        };
      }

      const result: ResearchResult = {
        query,
        steps: researchSteps,
        summary: parsedSummary.summary,
        keyFindings: parsedSummary.keyFindings || [],
        recommendations: parsedSummary.recommendations || [],
        sources: parsedSummary.sources || [],
        timestamp: Date.now()
      };

      setFinalResult(result);
      setShowResult(true);
      onResearchComplete?.(result);

    } catch (error) {
      console.error('Research process failed:', error);
    } finally {
      setIsResearching(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadReport = () => {
    if (!finalResult) return;

    const reportContent = `# Research Report: ${finalResult.query}

## Summary
${finalResult.summary}

## Key Findings
${finalResult.keyFindings.map(finding => `• ${finding}`).join('\n')}

## Recommendations
${finalResult.recommendations.map(rec => `• ${rec}`).join('\n')}

## Detailed Research Steps
${finalResult.steps.map(step => `
### ${step.title}
${step.description}
${step.result || 'Not completed'}
`).join('\n')}

## Sources
${finalResult.sources.map(source => `• ${source}`).join('\n')}

---
Generated on: ${new Date(finalResult.timestamp).toLocaleString()}
Research Type: ${researchType} | Depth: ${depth}
`;

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-report-${finalResult.query.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Search className="w-6 h-6 mr-2 text-blue-600" />
            Enhanced Research Interface
          </h1>
          
          {/* Research Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Research Type</label>
              <select 
                value={researchType}
                onChange={(e) => setResearchType(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isResearching}
              >
                <option value="general">General Research</option>
                <option value="academic">Academic Research</option>
                <option value="business">Business Analysis</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Research Depth</label>
              <select 
                value={depth}
                onChange={(e) => setDepth(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isResearching}
              >
                <option value="quick">Quick Overview</option>
                <option value="comprehensive">Comprehensive</option>
                <option value="deep">Deep Analysis</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={startResearch}
                disabled={!query.trim() || isResearching}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                {isResearching ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Researching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Start Research
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Query Input */}
          <div>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your research question or topic..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isResearching}
            />
          </div>
        </div>
      </div>

      {/* Research Progress */}
      {researchSteps.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-600" />
              Research Progress
            </h2>
            
            <div className="space-y-4">
              {researchSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-lg border-2 transition-all ${
                    step.status === 'completed' ? 'border-green-200 bg-green-50' :
                    step.status === 'in_progress' ? 'border-blue-200 bg-blue-50' :
                    step.status === 'error' ? 'border-red-200 bg-red-50' :
                    'border-gray-200'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          step.status === 'completed' ? 'bg-green-500' :
                          step.status === 'in_progress' ? 'bg-blue-500' :
                          step.status === 'error' ? 'bg-red-500' :
                          'bg-gray-300'
                        }`}>
                          {step.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : step.status === 'in_progress' ? (
                            <Clock className="w-5 h-5 text-white animate-spin" />
                          ) : (
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{step.title}</h3>
                          <p className="text-sm text-gray-600">{step.description}</p>
                        </div>
                      </div>
                      
                      {step.status === 'completed' && step.result && (
                        <button
                          onClick={() => copyToClipboard(step.result!)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {step.result && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                          {step.result.length > 500 && !showResult ? 
                            `${step.result.substring(0, 500)}...` : 
                            step.result
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Final Results */}
      {showResult && finalResult && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-blue-50 border-t border-gray-200"
        >
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-600" />
                Research Complete
              </h2>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => copyToClipboard(JSON.stringify(finalResult, null, 2))}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All
                </button>
                <button
                  onClick={downloadReport}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4 border">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-blue-600" />
                  Key Findings
                </h3>
                <ul className="space-y-1">
                  {finalResult.keyFindings.map((finding, index) => (
                    <li key={index} className="text-sm text-gray-700 flex">
                      <ChevronRight className="w-4 h-4 mr-1 text-blue-500 flex-shrink-0 mt-0.5" />
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2 text-yellow-600" />
                  Recommendations
                </h3>
                <ul className="space-y-1">
                  {finalResult.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-700 flex">
                      <ChevronRight className="w-4 h-4 mr-1 text-yellow-500 flex-shrink-0 mt-0.5" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 bg-white rounded-lg p-4 border">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-purple-600" />
                Summary
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{finalResult.summary}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!isResearching && researchSteps.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-2">Ready to Research</h3>
            <p>Enter your research question above and click "Start Research" to begin</p>
          </div>
        </div>
      )}
    </div>
  );
}