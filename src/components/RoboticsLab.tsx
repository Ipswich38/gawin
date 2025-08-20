import React, { useState } from 'react';
import { textFormattingService } from '../lib/services/textFormattingService';
import SafeHTML from './SafeHTML';
import { sanitizationService } from '../lib/services/sanitizationService';

interface RoboticsLabProps {
  onBack: () => void;
  aiService: (messages: any[], model?: string) => Promise<{ content: string; reasoning: string; responseTime: number; }>;
}

const RoboticsLab: React.FC<RoboticsLabProps> = ({ onBack, aiService }) => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [simulationResult, setSimulationResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Format content for better readability
  const formatContent = (content: string) => {
    return textFormattingService.formatText(content, {
      maxSentencesPerParagraph: 2,
      tutorMode: true,
      enhanceStructure: true,
      emphasizeHeaders: true
    });
  };

  // Validate AI response content for security
  const validateAIResponse = (content: string): boolean => {
    if (!content || typeof content !== 'string') {
      console.warn('⚠️ Invalid AI response: empty or non-string content');
      return false;
    }

    if (!sanitizationService.validateContent(content)) {
      console.error('🚨 Security alert: Potentially malicious content blocked in AI response', content.substring(0, 100));
      return false;
    }

    return true;
  };

  const roboticsTopics = [
    {
      id: 'arduino-basics',
      title: 'Arduino Fundamentals',
      icon: '⚡',
      gradient: 'linear-gradient(135deg, #0096FF 0%, #007ACC 100%)',
      description: 'Learn microcontroller programming and basic electronics',
      lessons: [
        'Getting Started with Arduino IDE',
        'Digital Input/Output Control',
        'Analog Sensors and Reading',
        'PWM and Motor Control',
        'Serial Communication',
        'Building Your First Robot'
      ]
    },
    {
      id: 'sensors',
      title: 'Sensors & Actuators',
      icon: '📡',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      description: 'Understanding how robots perceive and interact with the world',
      lessons: [
        'Ultrasonic Distance Sensors',
        'Camera and Computer Vision',
        'Gyroscopes and Accelerometers',
        'Temperature and Humidity Sensors',
        'Servo and Stepper Motors',
        'Robotic Arms and Grippers'
      ]
    },
    {
      id: 'programming',
      title: 'Robot Programming',
      icon: '💻',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      description: 'Code intelligent behaviors and autonomous systems',
      lessons: [
        'C++ for Robotics',
        'Python Robot Control',
        'ROS (Robot Operating System)',
        'State Machines and Behavior Trees',
        'Path Planning Algorithms',
        'Real-time Control Systems'
      ]
    },
    {
      id: 'ai-robotics',
      title: 'AI-Powered Robotics',
      icon: '🧠',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      description: 'Integrate artificial intelligence with robotic systems',
      lessons: [
        'Machine Learning for Robots',
        'Computer Vision Applications',
        'Natural Language Processing',
        'Reinforcement Learning',
        'Neural Network Control',
        'Autonomous Navigation'
      ]
    },
    {
      id: 'applications',
      title: 'Real-World Applications',
      icon: '🏭',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      description: 'Explore robotics in industry, healthcare, and daily life',
      lessons: [
        'Industrial Automation',
        'Medical Robotics',
        'Autonomous Vehicles',
        'Drone Technology',
        'Home Assistant Robots',
        'Space and Ocean Exploration'
      ]
    }
  ];

  const generateLesson = async (topic: any, lessonTitle: string) => {
    setIsLoading(true);
    try {
      const response = await aiService([{
        id: 'robotics-lesson',
        role: 'user',
        content: `Create an interactive robotics lesson about "${lessonTitle}" in the context of "${topic.title}".

Structure the lesson with:
1. Learning objectives and prerequisites
2. Core concepts with visual descriptions
3. Hands-on coding examples (Arduino C++/Python)
4. Step-by-step build instructions
5. Troubleshooting common issues
6. Real-world applications and case studies
7. Next steps and advanced challenges

Make it practical and engaging for learners interested in robotics and automation.`,
        timestamp: new Date()
      }], 'llama-3.3-70b-versatile');

      // Validate AI response before setting lesson content
      if (!validateAIResponse(response.content)) {
        throw new Error('AI response failed security validation');
      }

      setCurrentLesson({
        title: lessonTitle,
        topic: topic.title,
        content: response.content,
        topicData: topic
      });
      setSimulationResult('');
    } catch (error) {
      console.error('Error generating lesson:', error);
      alert('Failed to generate lesson. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const runSimulation = async (simulationType: string) => {
    if (!currentLesson) return;
    
    setIsLoading(true);
    try {
      const response = await aiService([{
        id: 'robotics-simulation',
        role: 'user',
        content: `Create a detailed simulation for "${simulationType}" related to the lesson "${currentLesson.title}".

Provide:
1. Simulation setup and parameters
2. Expected sensor readings/outputs
3. Code examples for implementation
4. Analysis of results
5. Optimization suggestions
6. Common errors and debugging tips

Make it interactive and educational with clear explanations of what's happening.`,
        timestamp: new Date()
      }], 'llama-3.3-70b-versatile');

      // Validate AI response before setting simulation result
      if (!validateAIResponse(response.content)) {
        throw new Error('AI response failed security validation');
      }

      setSimulationResult(response.content);
    } catch (error) {
      console.error('Error running simulation:', error);
      alert('Failed to run simulation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '12px', 
      maxWidth: '100%', 
      margin: '0 auto',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0096FF 0%, #007ACC 100%)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
        color: 'white'
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600' }}>
          🤖 Robotics Lab
        </h2>
        <div style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.4' }}>
          Interactive robotics education with hands-on simulations
        </div>
      </div>

      {!currentLesson ? (
        /* Topic Selection - Mobile First */
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {roboticsTopics.map(topic => (
            <div key={topic.id} style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(0,0,0,0.1)'
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              {/* Topic Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: topic.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  marginRight: '12px'
                }}>
                  {topic.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    margin: '0 0 4px 0',
                    color: '#0096FF',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    {topic.title}
                  </h3>
                  <p style={{
                    margin: 0,
                    color: '#666',
                    fontSize: '13px',
                    lineHeight: '1.4'
                  }}>
                    {topic.description}
                  </p>
                </div>
              </div>

              {/* Lessons List */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '8px'
              }}>
                {topic.lessons.map((lesson, index) => (
                  <button
                    key={index}
                    onClick={() => generateLesson(topic, lesson)}
                    disabled={isLoading}
                    style={{
                      background: isLoading ? '#f0f0f0' : 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      color: isLoading ? '#999' : '#333',
                      width: '100%'
                    }}
                    onTouchStart={(e) => {
                      if (!isLoading) e.currentTarget.style.background = '#f8f9fa';
                    }}
                    onTouchEnd={(e) => {
                      if (!isLoading) e.currentTarget.style.background = 'white';
                    }}
                    onMouseOver={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.borderColor = '#0096FF';
                        e.currentTarget.style.background = '#f8f9fa';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.borderColor = '#e0e0e0';
                        e.currentTarget.style.background = 'white';
                      }
                    }}
                  >
                    <span style={{
                      display: 'inline-block',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: topic.gradient,
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: '600',
                      textAlign: 'center',
                      lineHeight: '20px',
                      marginRight: '10px'
                    }}>
                      {index + 1}
                    </span>
                    {isLoading ? '🔄 Loading...' : lesson}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Lesson View - Mobile Optimized */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Lesson Header */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '0',
            overflow: 'hidden'
          }}>
            <div style={{
              background: currentLesson.topicData.gradient,
              padding: '16px',
              color: 'white'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <span style={{ fontSize: '24px', marginRight: '12px' }}>
                  {currentLesson.topicData.icon}
                </span>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>
                    {currentLesson.title}
                  </h3>
                  <div style={{ fontSize: '13px', opacity: 0.9 }}>
                    {currentLesson.topic} • Interactive Lesson
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson Content */}
            <div style={{ padding: '16px' }}>
              <SafeHTML 
                content={formatContent(currentLesson.content).html}
                type="code"
                style={{
                  fontSize: '15px',
                  lineHeight: '1.6',
                  color: '#333'
                }}
                aria-label="Robotics lesson content"
                role="region"
              />
            </div>
          </div>

          {/* Simulation Controls */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#0096FF', fontSize: '16px' }}>
              🔬 Run Simulations
            </h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr',
              gap: '8px'
            }}>
              {[
                'Sensor Reading Simulation',
                'Motor Control Test',
                'Path Planning Algorithm',
                'Obstacle Detection Test'
              ].map(simType => (
                <button
                  key={simType}
                  onClick={() => runSimulation(simType)}
                  disabled={isLoading}
                  style={{
                    background: isLoading ? '#ccc' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    width: '100%',
                    transition: 'all 0.2s ease'
                  }}
                  onTouchStart={(e) => {
                    if (!isLoading) e.currentTarget.style.transform = 'scale(0.98)';
                  }}
                  onTouchEnd={(e) => {
                    if (!isLoading) e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {isLoading ? '🔄 Running...' : '▶️ ' + simType}
                </button>
              ))}
            </div>

            {simulationResult && (
              <div style={{
                marginTop: '16px',
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                border: '2px solid #28a745'
              }}>
                <h5 style={{ margin: '0 0 12px 0', color: '#28a745', fontSize: '14px' }}>
                  📊 Simulation Results
                </h5>
                <SafeHTML 
                  content={formatContent(simulationResult).html}
                  type="code"
                  style={{
                    fontSize: '13px',
                    lineHeight: '1.6',
                    color: '#333',
                    fontFamily: '"Monaco", "Consolas", "Courier New", monospace'
                  }}
                  aria-label="Robotics simulation result"
                  role="region"
                />
              </div>
            )}
          </div>

          {/* Build Guide */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#0096FF', fontSize: '16px' }}>
              🔧 Project Build Guide
            </h4>
            <div style={{ 
              display: 'grid', 
              gap: '8px'
            }}>
              {[
                '📋 Components needed for this project',
                '🔌 Wiring diagram and connections',
                '💻 Complete code implementation',
                '🔍 Testing and debugging steps',
                '⚡ Performance optimization tips',
                '🚀 Advanced modifications to try'
              ].map((step, index) => (
                <div key={index} style={{
                  background: '#f8f9fa',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  borderLeft: '4px solid #0096FF',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Controls - Mobile Optimized */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '8px',
        marginTop: '16px',
        position: 'sticky',
        bottom: '12px'
      }}>
        {currentLesson && (
          <button
            onClick={() => {
              setCurrentLesson(null);
              setSimulationResult('');
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#0096FF',
              border: '1px solid #0096FF',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            ← Back to Topics
          </button>
        )}
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#0096FF',
            border: '1px solid #0096FF',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Back to I.T Tools
        </button>
      </div>
    </div>
  );
};

export default RoboticsLab;