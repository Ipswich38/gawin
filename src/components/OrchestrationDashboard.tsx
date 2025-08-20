// Real-time AI Orchestration Dashboard
import React, { useState, useEffect } from 'react';
import { aiOrchestrator, type AIAgent, type OrchestrationMetrics, type TaskAssignment } from '../lib/services/aiOrchestrator';
// import { colors, typography, spacing, borderRadius } from theme - DISABLED

interface OrchestrationDashboardProps {
  isVisible: boolean;
}

const OrchestrationDashboard: React.FC<OrchestrationDashboardProps> = ({ isVisible }) => {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [metrics, setMetrics] = useState<OrchestrationMetrics | null>(null);
  const [activeAssignments, setActiveAssignments] = useState<TaskAssignment[]>([]);
  const [selectedTab, setSelectedTab] = useState<'agents' | 'metrics' | 'assignments'>('agents');

  useEffect(() => {
    if (!isVisible) return;

    const updateData = () => {
      setAgents(aiOrchestrator.getAgentStatus());
      setMetrics(aiOrchestrator.getSystemMetrics());
      setActiveAssignments(aiOrchestrator.getActiveAssignments());
    };

    updateData();
    const interval = setInterval(updateData, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const getAgentStatusColor = (agent: AIAgent) => {
    if (agent.availability === 'offline') return '#dc2626';
    if (agent.currentLoad > 80) return '#f59e0b';
    if (agent.currentLoad > 50) return '#3b82f6';
    return "#00ff00";
  };

  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case 'specialist': return '🎯';
      case 'generalist': return '🌐';
      case 'hybrid': return '⚡';
      default: return '🤖';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '400px',
        maxHeight: '600px',
        backgroundColor: "#1a1a1a",
        border: "1px solid #374151",
        borderRadius: "12px",
        padding: "16px",
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
        overflow: 'hidden',
        fontFamily: "monospace",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: "16px",
          paddingBottom: "8px",
          borderBottom: `1px solid rgba(34, 139, 34, 0.3)`,
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: '14px',
              color: "#00ff00",
              fontWeight: 'bold',
            }}
          >
            🎯 AI Orchestrator
          </h3>
          <div
            style={{
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.6)',
              marginTop: '2px',
            }}
          >
            Real-time Task Management
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: "#00ff00",
              animation: 'pulse 2s infinite',
            }}
          />
          <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)' }}>
            ACTIVE
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: 'flex',
          marginBottom: "8px",
          backgroundColor: 'rgba(42, 43, 38, 0.3)',
          borderRadius: "6px",
          padding: '2px',
        }}
      >
        {(['agents', 'metrics', 'assignments'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            style={{
              flex: 1,
              padding: '6px 8px',
              fontSize: '10px',
              backgroundColor: selectedTab === tab ? "#00ff00" : 'transparent',
              color: selectedTab === tab ? 'black' : 'rgba(255, 255, 255, 0.7)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              fontFamily: "monospace",
              transition: 'all 0.2s ease',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div
        style={{
          maxHeight: '450px',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {selectedTab === 'agents' && (
          <div>
            <div
              style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: "4px",
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Active Agents ({agents.length})
            </div>
            
            {agents.map((agent) => (
              <div
                key={agent.id}
                style={{
                  backgroundColor: 'rgba(42, 43, 38, 0.2)',
                  border: `1px solid rgba(34, 139, 34, 0.2)`,
                  borderRadius: "6px",
                  padding: "4px",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px' }}>
                      {getAgentTypeIcon(agent.type)}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        color: "#00ff00",
                        fontWeight: 'bold',
                      }}
                    >
                      {agent.name}
                    </span>
                  </div>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: getAgentStatusColor(agent),
                    }}
                  />
                </div>
                
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '4px',
                    fontSize: '9px',
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  <div>Load: {Math.round(agent.currentLoad)}%</div>
                  <div>Quality: {Math.round(agent.qualityScore * 100)}%</div>
                  <div>Tasks: {agent.currentTasks.length}/{agent.maxConcurrentTasks}</div>
                  <div>Cost: ${agent.costPerTask.toFixed(2)}</div>
                </div>
                
                {/* Load Bar */}
                <div
                  style={{
                    marginTop: '4px',
                    height: '3px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${agent.currentLoad}%`,
                      backgroundColor: getAgentStatusColor(agent),
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                
                {/* Capabilities */}
                <div
                  style={{
                    marginTop: '4px',
                    fontSize: '8px',
                    color: 'rgba(255, 255, 255, 0.4)',
                  }}
                >
                  {agent.capabilities.slice(0, 3).join(', ')}
                  {agent.capabilities.length > 3 && '...'}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'metrics' && metrics && (
          <div>
            <div
              style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: "4px",
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              System Performance
            </div>
            
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: "4px",
              }}
            >
              {Object.entries({
                'Tasks Assigned': metrics.totalTasksAssigned,
                'Success Rate': `${Math.round(metrics.taskSuccessRate * 100)}%`,
                'Resource Util': `${Math.round(metrics.resourceUtilization * 100)}%`,
                'Cost Efficiency': `${Math.round(metrics.costEfficiency * 100)}%`,
                'Throughput': metrics.systemThroughput,
                'Satisfaction': `${Math.round(metrics.userSatisfactionScore * 100)}%`,
              }).map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    backgroundColor: 'rgba(42, 43, 38, 0.2)',
                    border: `1px solid rgba(34, 139, 34, 0.2)`,
                    borderRadius: "6px",
                    padding: "4px",
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '14px',
                      color: "#00ff00",
                      fontWeight: 'bold',
                      marginBottom: '2px',
                    }}
                  >
                    {value}
                  </div>
                  <div
                    style={{
                      fontSize: '8px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {key}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'assignments' && (
          <div>
            <div
              style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: "4px",
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Active Assignments ({activeAssignments.length})
            </div>
            
            {activeAssignments.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '10px',
                  padding: "16px",
                }}
              >
                No active task assignments
              </div>
            ) : (
              activeAssignments.map((assignment) => (
                <div
                  key={assignment.taskId}
                  style={{
                    backgroundColor: 'rgba(42, 43, 38, 0.2)',
                    border: `1px solid rgba(34, 139, 34, 0.2)`,
                    borderRadius: "6px",
                    padding: "4px",
                    marginBottom: "4px",
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        color: "#00ff00",
                        fontWeight: 'bold',
                      }}
                    >
                      {assignment.taskId.split('_')[0].toUpperCase()}
                    </span>
                    <span
                      style={{
                        fontSize: '9px',
                        color: 'rgba(255, 193, 7, 0.8)',
                      }}
                    >
                      {Math.round(assignment.confidence * 100)}%
                    </span>
                  </div>
                  
                  <div
                    style={{
                      fontSize: '9px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginBottom: '4px',
                    }}
                  >
                    Agent: {assignment.agentId.split('-')[0]}
                  </div>
                  
                  <div
                    style={{
                      fontSize: '8px',
                      color: 'rgba(255, 255, 255, 0.4)',
                      lineHeight: 1.3,
                    }}
                  >
                    {assignment.reasoning}
                  </div>
                  
                  <div
                    style={{
                      fontSize: '8px',
                      color: 'rgba(255, 255, 255, 0.3)',
                      marginTop: '4px',
                    }}
                  >
                    ETA: {assignment.estimatedCompletion.toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};

export default OrchestrationDashboard;