import React, { useState, useEffect } from 'react';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

interface ReasoningStep {
  id: string;
  step: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  duration?: number;
  details?: string;
  agentAssigned?: string;
  confidence?: number;
}

interface ReasoningProcessProps {
  query: string;
  intentType: string;
  onComplete: () => void;
}

const ReasoningProcess: React.FC<ReasoningProcessProps> = ({ query, intentType, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<ReasoningStep[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Initialize reasoning steps based on intent type
    const initializeSteps = () => {
      let reasoningSteps: ReasoningStep[] = [];

      if (intentType === 'video') {
        reasoningSteps = [
          {
            id: '1',
            step: 'Intent Analysis',
            description: 'Analyzing video generation request...',
            status: 'pending',
            details: `Parsing "${query}" for video generation requirements`
          },
          {
            id: '2',
            step: 'AI Orchestration',
            description: 'Orchestrating optimal agent assignment...',
            status: 'pending',
            details: 'Analyzing 7 specialized agents for best match',
            confidence: 0.95
          },
          {
            id: '3',
            step: 'Expert Routing',
            description: 'Routing to video generation specialists...',
            status: 'pending',
            details: 'HunyuanVideo vs Mochi-1 selection analysis',
            agentAssigned: 'HunyuanVideo Specialist'
          },
          {
            id: '4',
            step: 'Scene Understanding',
            description: 'Understanding visual scene requirements...',
            status: 'pending',
            details: 'Analyzing objects, motion, colors, and environment'
          },
          {
            id: '5',
            step: 'Model Optimization',
            description: 'Optimizing generation parameters...',
            status: 'pending',
            details: 'Load balancing and performance optimization'
          },
          {
            id: '6',
            step: 'Video Generation',
            description: 'Generating high-quality video...',
            status: 'pending',
            details: 'HunyuanVideo 13B processing at 720p resolution'
          },
          {
            id: '7',
            step: 'Quality Assurance',
            description: 'Validating output quality...',
            status: 'pending',
            details: 'Ensuring optimal visual fidelity and motion'
          }
        ];
      } else if (intentType === 'image') {
        reasoningSteps = [
          {
            id: '1',
            step: 'Intent Analysis',
            description: 'Analyzing image generation request...',
            status: 'pending',
            details: `Processing "${query}" for visual requirements`
          },
          {
            id: '2',
            step: 'Expert Routing',
            description: 'Routing to image AI specialists...',
            status: 'pending',
            details: 'Selecting Pollinations and FLUX models'
          },
          {
            id: '3',
            step: 'Prompt Engineering',
            description: 'Optimizing prompt for best results...',
            status: 'pending',
            details: 'Enhancing description for AI image models'
          },
          {
            id: '4',
            step: 'Model Selection',
            description: 'Choosing optimal generation model...',
            status: 'pending',
            details: 'Evaluating FLUX, DALL-E, and Stable Diffusion'
          },
          {
            id: '5',
            step: 'Image Generation',
            description: 'Creating your image...',
            status: 'pending',
            details: 'Processing with advanced AI image synthesis'
          }
        ];
      } else {
        reasoningSteps = [
          {
            id: '1',
            step: 'Intent Analysis',
            description: 'Understanding your request...',
            status: 'pending',
            details: `Analyzing "${query}" for optimal response strategy`
          },
          {
            id: '2',
            step: 'Expert Routing',
            description: 'Routing to knowledge specialists...',
            status: 'pending',
            details: 'Selecting relevant AI experts and data sources'
          },
          {
            id: '3',
            step: 'Information Gathering',
            description: 'Collecting relevant information...',
            status: 'pending',
            details: 'Searching knowledge base and external sources'
          },
          {
            id: '4',
            step: 'Response Synthesis',
            description: 'Synthesizing comprehensive answer...',
            status: 'pending',
            details: 'Combining insights from multiple AI models'
          },
          {
            id: '5',
            step: 'Quality Review',
            description: 'Reviewing response quality...',
            status: 'pending',
            details: 'Ensuring accuracy and helpfulness'
          }
        ];
      }

      setSteps(reasoningSteps);
    };

    initializeSteps();
  }, [query, intentType]);

  useEffect(() => {
    if (steps.length === 0) return;

    const processSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        // Update current step to active
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index === i ? 'active' : index < i ? 'completed' : 'pending'
        })));

        setCurrentStep(i);

        // Simulate processing time with realistic delays
        const delays = intentType === 'video' ? [800, 1200, 1000, 1500, 1200, 2000, 800] :
                      intentType === 'image' ? [600, 800, 1000, 1200, 1800] :
                      [500, 800, 1200, 1000, 600];
        
        await new Promise(resolve => setTimeout(resolve, delays[i] || 1000));

        // Mark step as completed
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index <= i ? 'completed' : 'pending'
        })));
      }

      // Mark all completed and trigger parent callback
      setIsCompleted(true);
      setTimeout(() => {
        onComplete();
      }, 500);
    };

    processSteps();
  }, [steps.length, intentType, onComplete]);

  const getStepIcon = (status: ReasoningStep['status']) => {
    switch (status) {
      case 'active':
        return '⚡';
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStepColor = (status: ReasoningStep['status']) => {
    switch (status) {
      case 'active':
        return colors.amber;
      case 'completed':
        return colors.phosphorGreen;
      case 'error':
        return colors.warning;
      default:
        return colors.secondaryText;
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'white', // White background
        border: `1px solid rgba(0, 0, 0, 0.15)`,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        margin: `${spacing.xs} 0`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: spacing.xs,
          paddingBottom: spacing.xs,
          borderBottom: `1px solid rgba(34, 139, 34, 0.2)`,
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '3px',
            backgroundColor: isCompleted ? 'rgba(255, 107, 53, 0.6)' : 'rgba(255, 107, 53, 0.4)',
            marginRight: spacing.xs,
            animation: isCompleted ? 'none' : 'pulse 1.5s infinite',
          }}
        />
        <span
          style={{
            color: 'rgba(0, 0, 0, 0.8)', // Black text
            fontSize: '10px', // Smaller text
            fontFamily: typography.mono,
            fontStyle: 'normal',
            fontWeight: 'normal',
            letterSpacing: '0.5px',
            opacity: 0.8,
          }}
        >
          ai orchestrator
        </span>
      </div>

      {/* Reasoning Steps */}
      <div style={{ marginBottom: spacing.xs }}>
        {steps.map((step, index) => (
          <div
            key={step.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: spacing.xs,
              opacity: step.status === 'pending' ? 0.4 : step.status === 'active' ? 0.9 : 0.6,
              transition: 'opacity 0.3s ease',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                marginRight: spacing.xs,
                minWidth: '14px',
                opacity: 0.7,
              }}
            >
              {getStepIcon(step.status)}
            </div>
            
            <div style={{ flex: 1 }}>
              <div
                style={{
                  color: step.status === 'active' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.6)',
                  fontSize: '9px',
                  fontFamily: typography.mono,
                  fontStyle: 'italic',
                  fontWeight: 'normal',
                  marginBottom: '1px',
                  letterSpacing: '0.3px',
                }}
              >
                {step.step.toLowerCase()}
              </div>
              
              <div
                style={{
                  color: step.status === 'active' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
                  fontSize: '8px',
                  fontFamily: typography.mono,
                  fontStyle: 'italic',
                  marginBottom: '2px',
                  opacity: 0.7,
                }}
              >
                {step.description.toLowerCase()}
              </div>
              
              {step.details && step.status === 'active' && (
                <div
                  style={{
                    color: 'rgba(0, 0, 0, 0.4)',
                    fontSize: '8px',
                    fontFamily: typography.mono,
                    fontStyle: 'italic',
                    opacity: 0.6,
                    lineHeight: 1.2,
                  }}
                >
                  {step.details.toLowerCase()}
                </div>
              )}
              
              {/* Show agent assignment and confidence */}
              {(step.agentAssigned || step.confidence) && step.status === 'active' && (
                <div
                  style={{
                    marginTop: '2px',
                    display: 'flex',
                    gap: '8px',
                    fontSize: '7px',
                    fontFamily: typography.mono,
                  }}
                >
                  {step.agentAssigned && (
                    <span style={{ color: 'rgba(34, 139, 34, 0.6)' }}>
                      agent: {step.agentAssigned.toLowerCase()}
                    </span>
                  )}
                  {step.confidence && (
                    <span style={{ color: 'rgba(255, 193, 7, 0.6)' }}>
                      confidence: {Math.round(step.confidence * 100)}%
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Indicator */}
      <div
        style={{
          marginTop: spacing.xs,
          paddingTop: spacing.xs,
          borderTop: `1px solid rgba(34, 139, 34, 0.1)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '3px',
          }}
        >
          <span
            style={{
              color: 'rgba(0, 0, 0, 0.4)',
              fontSize: '8px',
              fontFamily: typography.mono,
              fontStyle: 'italic',
              letterSpacing: '0.5px',
            }}
          >
            processing
          </span>
          <span
            style={{
              color: 'rgba(34, 139, 34, 0.7)',
              fontSize: '8px',
              fontFamily: typography.mono,
              fontStyle: 'italic',
            }}
          >
            {Math.round(((currentStep + 1) / steps.length) * 100)}%
          </span>
        </div>
        
        <div
          style={{
            width: '100%',
            height: '2px',
            backgroundColor: 'rgba(255, 107, 53, 0.15)',
            borderRadius: '1px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              height: '100%',
              backgroundColor: 'rgba(255, 107, 53, 0.5)',
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </div>

      {/* Completion Message */}
      {isCompleted && (
        <div
          style={{
            marginTop: spacing.xs,
            padding: '4px 6px',
            backgroundColor: 'rgba(34, 139, 34, 0.05)',
            border: `1px solid rgba(34, 139, 34, 0.2)`,
            borderRadius: borderRadius.sm,
            textAlign: 'center',
          }}
        >
          <span
            style={{
              color: 'rgba(34, 139, 34, 0.8)',
              fontSize: '9px',
              fontFamily: typography.mono,
              fontStyle: 'italic',
              letterSpacing: '0.3px',
            }}
          >
            orchestration complete
          </span>
        </div>
      )}

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

export default ReasoningProcess;