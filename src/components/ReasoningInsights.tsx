import React, { useState } from 'react';
import { PerplexityResponse } from '../lib/services/perplexityService';
import { ReasoningMode } from '../lib/services/advancedReasoningEngine';
import { EmergentCapability } from '../lib/services/scalingLawsAnalyzer';

interface ReasoningInsightsProps {
  response: PerplexityResponse;
  onClose: () => void;
}

const ReasoningInsights: React.FC<ReasoningInsightsProps> = ({ response, onClose }) => {
  const [activeTab, setActiveTab] = useState<'reasoning' | 'experts' | 'emergence' | 'scaling' | 'performance'>('reasoning');

  const getModeColor = (mode: ReasoningMode) => {
    const colors = {
      [ReasoningMode.FAST_INTUITIVE]: '#10B981',
      [ReasoningMode.DELIBERATIVE]: '#3B82F6', 
      [ReasoningMode.ANALYTICAL]: '#8B5CF6',
      [ReasoningMode.CREATIVE]: '#F59E0B',
      [ReasoningMode.METACOGNITIVE]: '#EF4444'
    };
    return colors[mode] || '#6B7280';
  };

  const getCapabilityIcon = (capability: EmergentCapability) => {
    const icons = {
      [EmergentCapability.BASIC_GRAMMAR]: '📝',
      [EmergentCapability.FACTUAL_RECALL]: '🧠',
      [EmergentCapability.SIMPLE_REASONING]: '🤔',
      [EmergentCapability.FEW_SHOT_LEARNING]: '🎯',
      [EmergentCapability.CHAIN_OF_THOUGHT]: '🔗',
      [EmergentCapability.IN_CONTEXT_LEARNING]: '📚',
      [EmergentCapability.COMPLEX_REASONING]: '🧮',
      [EmergentCapability.META_COGNITION]: '🪞',
      [EmergentCapability.CREATIVE_SYNTHESIS]: '🎨',
      [EmergentCapability.ANALOGICAL_REASONING]: '🔄'
    };
    return icons[capability] || '🤖';
  };

  const getRiskColor = (riskLevel: string) => {
    const colors = {
      'low': '#10B981',
      'moderate': '#F59E0B', 
      'high': '#EF4444',
      'critical': '#DC2626'
    };
    return colors[riskLevel as keyof typeof colors] || '#6B7280';
  };

  const tabs = [
    { id: 'reasoning', label: '🧠 Reasoning Process', icon: '🧠' },
    { id: 'experts', label: '🚀 Expert Networks', icon: '🚀' },
    { id: 'emergence', label: '🌟 Emergent Capabilities', icon: '🌟' },
    { id: 'scaling', label: '📈 Scaling Analysis', icon: '📈' },
    { id: 'performance', label: '⚡ Performance Metrics', icon: '⚡' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(20, 20, 25, 0.95)',
        backdropFilter: 'blur(24px)',
        borderRadius: '20px',
        padding: '24px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        WebkitBackdropFilter: 'blur(24px)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '16px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '700',
            color: 'white',
            background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🧠 Advanced Reasoning Insights
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              width: '36px',
              height: '36px',
              fontSize: '18px',
              cursor: 'pointer',
              color: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            ×
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'rgba(255, 107, 53, 0.1)',
            border: '1px solid rgba(255, 107, 53, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', color: '#FF6B35' }}>
              {response.reasoningMode?.replace('_', ' ').toUpperCase() || 'N/A'}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>
              Reasoning Mode
            </div>
          </div>
          
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', color: '#3B82F6' }}>
              {((response.confidenceScore || 0) * 100).toFixed(0)}%
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>
              Confidence
            </div>
          </div>

          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', color: '#10B981' }}>
              {response.reasoningTrace?.metadata.reasoningSteps || 0}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>
              Reasoning Steps
            </div>
          </div>

          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', color: '#F59E0B' }}>
              {response.emergentCapabilities?.length || 0}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>
              Capabilities
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          overflowX: 'auto'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: activeTab === tab.id ? 'rgba(255, 107, 53, 0.2)' : 'transparent',
                border: activeTab === tab.id ? '1px solid rgba(255, 107, 53, 0.4)' : '1px solid transparent',
                borderRadius: '12px 12px 0 0',
                padding: '12px 16px',
                color: activeTab === tab.id ? '#FF6B35' : 'rgba(255, 255, 255, 0.7)',
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
        <div style={{ minHeight: '300px' }}>
          {activeTab === 'reasoning' && (
            <div>
              <h3 style={{ color: 'white', marginBottom: '16px', fontSize: '18px' }}>
                🧠 Reasoning Process Analysis
              </h3>
              
              {response.reasoningTrace?.reasoningTrace?.map((step, index) => (
                <div key={index} style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ 
                      color: '#FF6B35', 
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      Step {step.stepNumber + 1}
                    </span>
                    <div style={{
                      background: `${getModeColor(step.reasoningMode)}20`,
                      border: `1px solid ${getModeColor(step.reasoningMode)}40`,
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      color: getModeColor(step.reasoningMode)
                    }}>
                      {step.reasoningMode.replace('_', ' ')}
                    </div>
                  </div>
                  
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    marginBottom: '8px'
                  }}>
                    {step.reasoningContent}
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px'
                  }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      Insights: {step.insights.length}
                    </span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      Confidence: {(step.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )) || (
                <div style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  textAlign: 'center',
                  padding: '40px'
                }}>
                  No detailed reasoning trace available
                </div>
              )}
            </div>
          )}

          {activeTab === 'experts' && (
            <div>
              <h3 style={{ color: 'white', marginBottom: '16px', fontSize: '18px' }}>
                🚀 Expert Network Routing
              </h3>
              
              {response.expertRouting ? (
                <>
                  {/* Selected Experts */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px'
                  }}>
                    <h4 style={{ color: '#FF6B35', margin: '0 0 12px 0', fontSize: '14px' }}>
                      Selected Expert Networks
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      {response.expertRouting.selectedExperts.map((expert, idx) => (
                        <div key={expert.id} style={{
                          background: 'rgba(255, 107, 53, 0.1)',
                          border: '1px solid rgba(255, 107, 53, 0.3)',
                          borderRadius: '8px',
                          padding: '12px',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#FF6B35', marginBottom: '4px' }}>
                            {expert.specialization.replace('_', ' ').toUpperCase()}
                          </div>
                          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                            Confidence: {(expert.confidence * 100).toFixed(0)}%
                          </div>
                          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                            Routing Score: {(response.expertRouting.routingScores[idx] * 100).toFixed(0)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expert Contributions */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px'
                  }}>
                    <h4 style={{ color: '#3B82F6', margin: '0 0 12px 0', fontSize: '14px' }}>
                      Expert Contributions
                    </h4>
                    {Object.entries(response.expertRouting.expertContributions).map(([expertId, contribution]) => (
                      <div key={expertId} style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
                            {expertId.replace('_expert', '').replace('_', ' ')}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#3B82F6' }}>
                            {(contribution * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '4px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '2px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${contribution * 100}%`,
                            height: '100%',
                            background: '#3B82F6',
                            transition: 'width 0.5s ease'
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Load Balance Metrics */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '12px'
                  }}>
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      padding: '12px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: '#10B981' }}>
                        {response.expertRouting.loadBalanceMetrics.routingEntropy.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                        Routing Entropy
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '8px',
                      padding: '12px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: '#8B5CF6' }}>
                        {(response.expertRouting.loadBalanceMetrics.capacityUtilization * 100).toFixed(0)}%
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                        Capacity Usage
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '8px',
                      padding: '12px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: '#F59E0B' }}>
                        {response.retentionMetrics ? (response.retentionMetrics.memoryEfficiency * 100).toFixed(0) : 0}%
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                        Memory Efficiency
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  textAlign: 'center',
                  padding: '40px'
                }}>
                  No expert routing data available
                </div>
              )}
            </div>
          )}

          {activeTab === 'emergence' && (
            <div>
              <h3 style={{ color: 'white', marginBottom: '16px', fontSize: '18px' }}>
                🌟 Emergent Capabilities Detection
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginBottom: '20px'
              }}>
                {response.emergentCapabilities?.map(capability => (
                  <div key={capability} style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '12px',
                    padding: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                      {getCapabilityIcon(capability)}
                    </div>
                    <div style={{
                      color: '#10B981',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {capability.replace(/_/g, ' ')}
                    </div>
                  </div>
                )) || (
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center' }}>
                    No emergent capabilities detected
                  </div>
                )}
              </div>

              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <h4 style={{ color: '#F59E0B', margin: '0 0 8px 0', fontSize: '14px' }}>
                  Capability Analysis
                </h4>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px' }}>
                  Detected {response.emergentCapabilities?.length || 0} active capabilities indicating{' '}
                  {(response.emergentCapabilities?.length || 0) > 6 ? 'advanced' : 
                   (response.emergentCapabilities?.length || 0) > 3 ? 'moderate' : 'basic'} AI sophistication
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scaling' && (
            <div>
              <h3 style={{ color: 'white', marginBottom: '16px', fontSize: '18px' }}>
                📈 Scaling Laws Analysis
              </h3>
              
              {response.scalingAnalysis && (
                <>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '12px',
                      padding: '16px'
                    }}>
                      <h4 style={{ color: '#8B5CF6', margin: '0 0 8px 0', fontSize: '14px' }}>
                        Breakthrough Potential
                      </h4>
                      <div style={{
                        fontSize: '24px',
                        color: '#8B5CF6',
                        fontWeight: '700'
                      }}>
                        {(response.scalingAnalysis.breakthroughPotential * 100).toFixed(0)}%
                      </div>
                    </div>

                    <div style={{
                      background: `rgba(${getRiskColor(response.scalingAnalysis.emergenceRisk).slice(1, 3)}, ${getRiskColor(response.scalingAnalysis.emergenceRisk).slice(3, 5)}, ${getRiskColor(response.scalingAnalysis.emergenceRisk).slice(5, 7)}, 0.1)`,
                      border: `1px solid ${response.scalingAnalysis.emergenceRisk === 'low' ? 'rgba(16, 185, 129, 0.3)' : 
                               response.scalingAnalysis.emergenceRisk === 'moderate' ? 'rgba(245, 158, 11, 0.3)' :
                               'rgba(239, 68, 68, 0.3)'}`,
                      borderRadius: '12px',
                      padding: '16px'
                    }}>
                      <h4 style={{
                        color: getRiskColor(response.scalingAnalysis.emergenceRisk),
                        margin: '0 0 8px 0',
                        fontSize: '14px'
                      }}>
                        Emergence Risk
                      </h4>
                      <div style={{
                        fontSize: '18px',
                        color: getRiskColor(response.scalingAnalysis.emergenceRisk),
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {response.scalingAnalysis.emergenceRisk}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '16px'
                  }}>
                    <h4 style={{ color: 'white', margin: '0 0 12px 0', fontSize: '14px' }}>
                      Predicted Capabilities
                    </h4>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      {response.scalingAnalysis.predictedCapabilities.map(capability => (
                        <span
                          key={capability}
                          style={{
                            background: 'rgba(59, 130, 246, 0.2)',
                            border: '1px solid rgba(59, 130, 246, 0.4)',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            color: '#3B82F6'
                          }}
                        >
                          {getCapabilityIcon(capability)} {capability.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'performance' && (
            <div>
              <h3 style={{ color: 'white', marginBottom: '16px', fontSize: '18px' }}>
                ⚡ Performance Metrics
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '18px', color: '#10B981', fontWeight: '600' }}>
                    {response.responseTime}ms
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>
                    Response Time
                  </div>
                </div>

                <div style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '12px',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '18px', color: '#8B5CF6', fontWeight: '600' }}>
                    {((response.reasoningTrace?.evaluation.coherence || 0) * 100).toFixed(0)}%
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>
                    Coherence
                  </div>
                </div>

                <div style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '12px',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '18px', color: '#F59E0B', fontWeight: '600' }}>
                    {((response.reasoningTrace?.evaluation.completeness || 0) * 100).toFixed(0)}%
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>
                    Completeness
                  </div>
                </div>

                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '12px',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '18px', color: '#3B82F6', fontWeight: '600' }}>
                    {((response.reasoningTrace?.evaluation.accuracyEstimate || 0) * 100).toFixed(0)}%
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>
                    Accuracy Est.
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <h4 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '14px' }}>
                  Model Information
                </h4>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px', marginBottom: '4px' }}>
                  Model: {response.modelUsed}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px', marginBottom: '4px' }}>
                  Search Performed: {response.searchPerformed ? 'Yes' : 'No'}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px' }}>
                  Sources Used: {response.sources.length}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReasoningInsights;