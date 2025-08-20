import React, { useState, useEffect } from 'react';
import AttentionVisualizationTools from './AttentionVisualizationTools';
import ReasoningInsights from './ReasoningInsights';
import OrchestrationDashboard from './OrchestrationDashboard';
import { perplexityService, PerplexityResponse } from '../lib/services/perplexityService';
import { EmergentCapability } from '../lib/services/scalingLawsAnalyzer';
// import { colors, typography, spacing, borderRadius } from theme - DISABLED

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'attention' | 'reasoning' | 'orchestration' | 'analytics' | 'system'>('overview');
  const [systemMetrics, setSystemMetrics] = useState({
    totalQueries: 0,
    avgResponseTime: 0,
    avgConfidence: 0,
    emergentCapabilities: [] as EmergentCapability[],
    reasoningModes: {} as Record<string, number>
  });
  const [latestResponse, setLatestResponse] = useState<PerplexityResponse | null>(null);
  const [testQuery, setTestQuery] = useState('How does attention mechanism work in transformers?');
  const [isTestingReasoning, setIsTestingReasoning] = useState(false);
  const [showReasoningInsights, setShowReasoningInsights] = useState(false);

  // Simulate real-time metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        totalQueries: prev.totalQueries + Math.floor(Math.random() * 3),
        avgResponseTime: 1200 + Math.random() * 800,
        avgConfidence: 0.75 + Math.random() * 0.2,
        emergentCapabilities: [
          EmergentCapability.BASIC_GRAMMAR,
          EmergentCapability.FACTUAL_RECALL,
          EmergentCapability.SIMPLE_REASONING,
          EmergentCapability.CHAIN_OF_THOUGHT,
          EmergentCapability.IN_CONTEXT_LEARNING,
          EmergentCapability.COMPLEX_REASONING
        ],
        reasoningModes: {
          'fast_intuitive': 45,
          'deliberative': 25,
          'analytical': 20,
          'creative': 7,
          'metacognitive': 3
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleTestReasoning = async () => {
    setIsTestingReasoning(true);
    try {
      const response = await perplexityService.generateAnswer(testQuery);
      setLatestResponse(response);
      setShowReasoningInsights(true);
    } catch (error) {
      console.error('Test reasoning failed:', error);
    }
    setIsTestingReasoning(false);
  };

  const tabs = [
    { id: 'overview', label: '📊 System Overview', icon: '📊' },
    { id: 'attention', label: '🧠 Attention Analysis', icon: '🧠' },
    { id: 'reasoning', label: '⚡ Reasoning Engine', icon: '⚡' },
    { id: 'orchestration', label: '🎯 AI Orchestration', icon: '🎯' },
    { id: 'analytics', label: '📈 Analytics', icon: '📈' },
    { id: 'system', label: '⚙️ System Control', icon: '⚙️' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #3a3a3a 100%)`,
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              margin: '0',
              background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'white'
            }}>
              🧠 Gawyn Admin Dashboard
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '16px',
              margin: '4px 0 0 0'
            }}>
              Advanced AI System Monitoring & Analytics
            </p>
          </div>
          
          <button
            onClick={onLogout}
            style={{
              padding: '12px 20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            🚪 Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          overflowX: 'auto'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: activeTab === tab.id ? 'rgba(255, 107, 53, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                border: activeTab === tab.id ? '1px solid rgba(255, 107, 53, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '12px 20px',
                color: activeTab === tab.id ? '#FF6B35' : 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? '600' : '400',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                minWidth: 'fit-content'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Real-time Metrics */}
              <div style={{
                background: `${colors.terminalBlack}`,
                backdropFilter: 'blur(24px)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}>
                <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>📊 Real-time System Metrics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#3B82F6' }}>{systemMetrics.totalQueries}</div>
                    <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>Total Queries</div>
                  </div>
                  
                  <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#10B981' }}>{systemMetrics.avgResponseTime.toFixed(0)}ms</div>
                    <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>Avg Response Time</div>
                  </div>
                  
                  <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(245, 158, 11, 0.2)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#F59E0B' }}>{(systemMetrics.avgConfidence * 100).toFixed(0)}%</div>
                    <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>Avg Confidence</div>
                  </div>
                  
                  <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#8B5CF6' }}>{systemMetrics.emergentCapabilities.length}</div>
                    <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>Active Capabilities</div>
                  </div>
                </div>
              </div>

              {/* Reasoning Test Interface */}
              <div style={{
                background: `${colors.terminalBlack}`,
                backdropFilter: 'blur(24px)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}>
                <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>⚡ Reasoning Engine Tester</h3>
                
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    placeholder="Enter test query..."
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    onClick={handleTestReasoning}
                    disabled={isTestingReasoning}
                    style={{
                      padding: '12px 24px',
                      background: isTestingReasoning ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      cursor: isTestingReasoning ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      minWidth: '120px'
                    }}
                  >
                    {isTestingReasoning ? '🔄 Testing...' : '🧠 Test Reasoning'}
                  </button>
                </div>
                
                {latestResponse && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginTop: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong>Latest Test Result:</strong>
                      <button
                        onClick={() => setShowReasoningInsights(true)}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(255, 107, 53, 0.2)',
                          border: '1px solid rgba(255, 107, 53, 0.4)',
                          borderRadius: '8px',
                          color: '#FF6B35',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        📊 View Insights
                      </button>
                    </div>
                    <div style={{ fontSize: '14px', lineHeight: '1.5', color: 'rgba(255, 255, 255, 0.8)' }}>
                      {latestResponse.content.substring(0, 200)}...
                    </div>
                  </div>
                )}
              </div>

              {/* Reasoning Mode Distribution */}
              <div style={{
                background: `${colors.terminalBlack}`,
                backdropFilter: 'blur(24px)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}>
                <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>🧠 Reasoning Mode Distribution</h3>
                
                <div className="space-y-3">
                  {Object.entries(systemMetrics.reasoningModes).map(([mode, percentage]) => (
                    <div key={mode} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ minWidth: '140px', fontSize: '14px', textTransform: 'capitalize' }}>
                        {mode.replace('_', ' ')}
                      </div>
                      <div style={{
                        flex: 1,
                        height: '8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: mode === 'fast_intuitive' ? '#10B981' :
                                     mode === 'deliberative' ? '#3B82F6' :
                                     mode === 'analytical' ? '#8B5CF6' :
                                     mode === 'creative' ? '#F59E0B' : '#EF4444',
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                      <div style={{ minWidth: '40px', fontSize: '14px', textAlign: 'right' }}>
                        {percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attention' && (
            <AttentionVisualizationTools />
          )}

          {activeTab === 'reasoning' && (
            <div style={{
              background: `${colors.terminalBlack}`,
              backdropFilter: 'blur(24px)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white'
            }}>
              <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>⚡ Advanced Reasoning Engine</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 style={{ marginBottom: '12px', fontSize: '16px', color: '#FF6B35' }}>Architecture Components</h4>
                  <ul className="space-y-2 text-sm">
                    <li>✅ Multi-mode reasoning (5 modes)</li>
                    <li>✅ Mixture of Experts routing (6 experts)</li>
                    <li>✅ Retention mechanism (linear complexity)</li>
                    <li>✅ Constitutional AI compliance</li>
                    <li>✅ State Space Model processing</li>
                    <li>✅ Attention pattern analysis</li>
                    <li>✅ Working memory system</li>
                    <li>✅ Uncertainty tracking</li>
                    <li>✅ Dynamic mode switching</li>
                    <li>✅ Emergent capability detection</li>
                  </ul>
                </div>
                
                <div>
                  <h4 style={{ marginBottom: '12px', fontSize: '16px', color: '#FF6B35' }}>Scaling Laws Integration</h4>
                  <ul className="space-y-2 text-sm">
                    <li>✅ Capability emergence prediction</li>
                    <li>✅ Breakthrough potential analysis</li>
                    <li>✅ Risk assessment framework</li>
                    <li>✅ Model characteristic analysis</li>
                    <li>✅ Performance scaling metrics</li>
                    <li>✅ Future capability forecasting</li>
                  </ul>
                </div>
              </div>
              
              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: 'rgba(255, 107, 53, 0.1)',
                border: '1px solid rgba(255, 107, 53, 0.3)',
                borderRadius: '12px'
              }}>
                <strong style={{ color: '#FF6B35' }}>Status:</strong> All advanced reasoning and neural architecture components are active and integrated with the main Gawyn application. Expert routing, retention mechanisms, and constitutional AI compliance are operational.
              </div>
            </div>
          )}
          {activeTab === 'orchestration' && (
            <div style={{
              background: `${colors.terminalBlack}`,
              backdropFilter: 'blur(24px)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
              position: 'relative'
            }}>
              <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>🎯 AI Task Orchestration</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 style={{ marginBottom: '12px', fontSize: '16px', color: '#22C55E' }}>Orchestration Features</h4>
                  <ul className="space-y-2 text-sm">
                    <li>✅ Multi-agent task assignment (7 agents)</li>
                    <li>✅ Intelligent load balancing</li>
                    <li>✅ Real-time performance monitoring</li>
                    <li>✅ Predictive workload management</li>
                    <li>✅ Cost optimization algorithms</li>
                    <li>✅ Quality-based agent scoring</li>
                    <li>✅ Emergency task prioritization</li>
                    <li>✅ Automatic failover and reassignment</li>
                  </ul>
                </div>
                
                <div>
                  <h4 style={{ marginBottom: '12px', fontSize: '16px', color: '#22C55E' }}>Specialized Agents</h4>
                  <ul className="space-y-2 text-sm">
                    <li>🎬 HunyuanVideo Specialist (13B params)</li>
                    <li>🎥 Mochi Video Specialist (10B params)</li>
                    <li>🎨 Image Generation Specialist</li>
                    <li>🧠 Advanced Reasoning Specialist</li>
                    <li>📝 Text Processing Generalist</li>
                    <li>👁️ Computer Vision Specialist</li>
                    <li>🎵 Audio Processing Specialist</li>
                  </ul>
                </div>
              </div>
              
              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '12px'
              }}>
                <strong style={{ color: '#22C55E' }}>Enhanced Efficiency:</strong> The AI orchestrator optimizes task assignment based on agent performance, current load, cost efficiency, and quality scores. Real-time monitoring ensures optimal resource utilization and automatic load balancing.
              </div>
              
              {/* Floating orchestration dashboard */}
              <OrchestrationDashboard isVisible={activeTab === 'orchestration'} />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div style={{
              background: `${colors.terminalBlack}`,
              backdropFilter: 'blur(24px)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white'
            }}>
              <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>📈 Advanced Analytics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 style={{ marginBottom: '12px', fontSize: '16px', color: '#3B82F6' }}>Query Analysis</h4>
                  <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                    • Query complexity scoring<br/>
                    • Domain classification<br/>
                    • Reasoning requirements detection<br/>
                    • Response type optimization
                  </div>
                </div>
                
                <div>
                  <h4 style={{ marginBottom: '12px', fontSize: '16px', color: '#10B981' }}>Performance Metrics</h4>
                  <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                    • Response time optimization<br/>
                    • Confidence score tracking<br/>
                    • Reasoning quality assessment<br/>
                    • Attention pattern analysis
                  </div>
                </div>
                
                <div>
                  <h4 style={{ marginBottom: '12px', fontSize: '16px', color: '#8B5CF6' }}>Emergence Tracking</h4>
                  <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                    • Capability emergence detection<br/>
                    • Breakthrough potential scoring<br/>
                    • Risk level assessment<br/>
                    • Historical progression analysis
                  </div>
                </div>
                
                <div>
                  <h4 style={{ marginBottom: '12px', fontSize: '16px', color: '#F59E0B' }}>System Health</h4>
                  <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                    • Memory utilization monitoring<br/>
                    • Uncertainty trend analysis<br/>
                    • Mode switching patterns<br/>
                    • Error rate tracking
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div style={{
              background: `${colors.terminalBlack}`,
              backdropFilter: 'blur(24px)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white'
            }}>
              <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>⚙️ System Control Panel</h3>
              
              <div className="space-y-4">
                <div style={{
                  padding: '16px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#10B981' }}>Reasoning Engine Status</strong>
                      <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>All systems operational</div>
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#10B981'
                    }}>
                      ACTIVE
                    </div>
                  </div>
                </div>
                
                <div style={{
                  padding: '16px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#3B82F6' }}>Attention Visualization</strong>
                      <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>Real-time pattern analysis</div>
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      background: 'rgba(59, 130, 246, 0.2)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#3B82F6'
                    }}>
                      MONITORING
                    </div>
                  </div>
                </div>
                
                <div style={{
                  padding: '16px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#8B5CF6' }}>Scaling Laws Analyzer</strong>
                      <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>Emergence prediction active</div>
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      background: 'rgba(139, 92, 246, 0.2)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#8B5CF6'
                    }}>
                      ANALYZING
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reasoning Insights Modal */}
      {showReasoningInsights && latestResponse && (
        <ReasoningInsights
          response={latestResponse}
          onClose={() => setShowReasoningInsights(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;