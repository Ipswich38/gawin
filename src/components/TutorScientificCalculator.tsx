import React, { useState } from 'react';
import { textFormattingService } from '../lib/services/textFormattingService';
import SafeHTML from './SafeHTML';
import { sanitizationService } from '../lib/services/sanitizationService';

interface TutorScientificCalculatorProps {
  onBack: () => void;
  aiService: (messages: any[], model?: string) => Promise<{ content: string; reasoning: string; responseTime: number; }>;
}

const TutorScientificCalculator: React.FC<TutorScientificCalculatorProps> = ({ onBack, aiService }) => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [studentQuestion, setStudentQuestion] = useState('');
  const [tutorResponse, setTutorResponse] = useState('');
  const [calculation, setCalculation] = useState('');
  const [calculationResult, setCalculationResult] = useState('');
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
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

  const mathTopics = [
    {
      id: 'basic-operations',
      title: 'Basic Operations',
      icon: '➕',
      gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
      description: 'Master fundamental arithmetic with your personal math tutor',
      lessons: [
        'Addition and Subtraction Strategies',
        'Multiplication Tricks and Tips',
        'Division Methods and Applications',
        'Order of Operations (PEMDAS)',
        'Working with Fractions',
        'Decimal Operations'
      ]
    },
    {
      id: 'algebra',
      title: 'Algebra Fundamentals',
      icon: '🔢',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: 'Solve equations and understand algebraic concepts step-by-step',
      lessons: [
        'Variables and Expressions',
        'Solving Linear Equations',
        'Working with Inequalities',
        'Graphing Linear Functions',
        'Quadratic Equations',
        'Systems of Equations'
      ]
    },
    {
      id: 'geometry',
      title: 'Geometry & Measurement',
      icon: '📐',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      description: 'Explore shapes, angles, and spatial relationships',
      lessons: [
        'Basic Geometric Shapes',
        'Perimeter and Area Calculations',
        'Volume and Surface Area',
        'Angles and Triangles',
        'Circle Geometry',
        'Coordinate Geometry'
      ]
    },
    {
      id: 'trigonometry',
      title: 'Trigonometry',
      icon: '📊',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      description: 'Understanding sine, cosine, and tangent functions',
      lessons: [
        'Introduction to Trigonometry',
        'Sine, Cosine, and Tangent',
        'Trigonometric Identities',
        'Solving Trigonometric Equations',
        'Applications in Real Life',
        'Unit Circle Mastery'
      ]
    },
    {
      id: 'calculus',
      title: 'Calculus Basics',
      icon: '∫',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      description: 'Introduction to limits, derivatives, and integrals',
      lessons: [
        'Understanding Limits',
        'Introduction to Derivatives',
        'Differentiation Rules',
        'Applications of Derivatives',
        'Introduction to Integration',
        'Fundamental Theorem of Calculus'
      ]
    },
    {
      id: 'statistics',
      title: 'Statistics & Probability',
      icon: '📈',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      description: 'Analyze data and understand probability concepts',
      lessons: [
        'Data Collection and Organization',
        'Measures of Central Tendency',
        'Probability Fundamentals',
        'Distributions and Graphs',
        'Correlation and Regression',
        'Statistical Inference'
      ]
    }
  ];

  const startTutorSession = async (topic: any, lessonTitle: string) => {
    setIsLoading(true);
    try {
      const response = await aiService([{
        id: 'tutor-session-start',
        role: 'user',
        content: `Act as an encouraging math tutor starting a lesson on "${lessonTitle}" in ${topic.title}.

Create an interactive tutoring session that includes:
1. Warm welcome and lesson overview
2. Check student's prior knowledge with a question
3. Explain core concepts with examples
4. Provide practice problems to solve together
5. Encourage questions and student participation
6. Use encouraging, patient language

Start with: "Hi! I'm your math tutor, and I'm excited to work with you on ${lessonTitle} today! Let's start by seeing what you already know..."`,
        timestamp: new Date()
      }], 'llama-3.3-70b-versatile');

      setCurrentLesson({
        title: lessonTitle,
        topic: topic.title,
        topicData: topic
      });

      // Validate AI response before adding to conversation
      if (!validateAIResponse(response.content)) {
        throw new Error('AI response failed security validation');
      }

      const initialMessage = {
        role: 'tutor',
        content: response.content,
        timestamp: new Date()
      };

      setConversationHistory([initialMessage]);
      setTutorResponse(response.content);
    } catch (error) {
      console.error('Error starting tutor session:', error);
      alert('Failed to start tutoring session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const askTutor = async () => {
    if (!studentQuestion.trim() || !currentLesson) return;

    setIsLoading(true);
    try {
      const conversationContext = conversationHistory.map(msg => 
        `${msg.role === 'tutor' ? 'Tutor' : 'Student'}: ${msg.content}`
      ).join('\n\n');

      const response = await aiService([{
        id: 'tutor-response',
        role: 'user',
        content: `You are a patient, encouraging math tutor teaching "${currentLesson.title}". 

Previous conversation:
${conversationContext}

Student's new question/response: "${studentQuestion}"

Respond as a caring tutor would:
1. Acknowledge the student's input positively
2. Provide clear explanations with examples
3. Ask follow-up questions to check understanding
4. Offer practice problems if appropriate
5. Use encouraging language
6. Include step-by-step calculations when needed

Keep responses conversational and supportive.`,
        timestamp: new Date()
      }], 'llama-3.3-70b-versatile');

      // Validate AI response before adding to conversation
      if (!validateAIResponse(response.content)) {
        throw new Error('AI response failed security validation');
      }

      const studentMessage = {
        role: 'student',
        content: studentQuestion,
        timestamp: new Date()
      };

      const tutorMessage = {
        role: 'tutor',
        content: response.content,
        timestamp: new Date()
      };

      setConversationHistory(prev => [...prev, studentMessage, tutorMessage]);
      setTutorResponse(response.content);
      setStudentQuestion('');
    } catch (error) {
      console.error('Error getting tutor response:', error);
      alert('Failed to get tutor response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateWithTutor = async () => {
    if (!calculation.trim()) return;

    setIsLoading(true);
    try {
      const response = await aiService([{
        id: 'calculation-help',
        role: 'user',
        content: `As a math tutor, help the student solve this calculation: "${calculation}"

Provide:
1. Step-by-step solution process
2. The final answer
3. Explanation of the method used
4. Tips for similar problems
5. Encouraging feedback

Format as a tutoring conversation.`,
        timestamp: new Date()
      }], 'llama-3.3-70b-versatile');

      // Validate AI response before setting calculation result
      if (!validateAIResponse(response.content)) {
        throw new Error('AI response failed security validation');
      }

      setCalculationResult(response.content);
    } catch (error) {
      console.error('Error with calculation:', error);
      alert('Failed to solve calculation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        color: 'white'
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
          🧮 Math Tutor & Calculator
        </h2>
        <div style={{ fontSize: '16px', opacity: 0.9 }}>
          Learn mathematics through personalized tutoring and guided problem-solving
        </div>
      </div>

      {!currentLesson ? (
        /* Topic Selection */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {mathTopics.map(topic => (
            <div key={topic.id} style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '0',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 15px 45px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              {/* Gradient Header */}
              <div style={{
                background: topic.gradient,
                padding: '24px',
                color: 'white'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '40px', marginRight: '16px' }}>
                    {topic.icon}
                  </span>
                  <div>
                    <h3 style={{
                      margin: '0 0 4px 0',
                      fontSize: '22px',
                      fontWeight: '700'
                    }}>
                      {topic.title}
                    </h3>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      opacity: 0.9,
                      lineHeight: '1.4'
                    }}>
                      {topic.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lessons List */}
              <div style={{ padding: '20px' }}>
                <div style={{
                  display: 'grid',
                  gap: '10px'
                }}>
                  {topic.lessons.map((lesson, index) => (
                    <button
                      key={index}
                      onClick={() => startTutorSession(topic, lesson)}
                      disabled={isLoading}
                      style={{
                        background: isLoading ? '#f5f5f5' : 'white',
                        border: '2px solid #f0f0f0',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'left',
                        color: isLoading ? '#999' : '#333'
                      }}
                      onMouseOver={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.borderColor = '#FF6B35';
                          e.currentTarget.style.background = '#fff5f2';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.borderColor = '#f0f0f0';
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }
                      }}
                    >
                      <span style={{
                        display: 'inline-block',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: topic.gradient,
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '600',
                        textAlign: 'center',
                        lineHeight: '24px',
                        marginRight: '12px'
                      }}>
                        {index + 1}
                      </span>
                      {isLoading ? '🔄 Starting lesson...' : lesson}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Tutoring Session */
        <div>
          {/* Session Header */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '0',
            marginBottom: '20px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: currentLesson.topicData.gradient,
              padding: '20px',
              color: 'white'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '32px', marginRight: '16px' }}>
                  {currentLesson.topicData.icon}
                </span>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>
                    {currentLesson.title}
                  </h3>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>
                    {currentLesson.topic} • Personal Tutoring Session
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conversation Area */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            <h4 style={{ margin: '0 0 16px 0', color: '#FF6B35' }}>
              💬 Tutoring Conversation
            </h4>
            
            {conversationHistory.map((message, index) => (
              <div key={index} style={{
                marginBottom: '16px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: message.role === 'tutor' ? '#f8f9fa' : '#fff5f2',
                border: `2px solid ${message.role === 'tutor' ? '#e9ecef' : '#FF6B35'}20`
              }}>
                <div style={{
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: message.role === 'tutor' ? '#495057' : '#FF6B35',
                  fontSize: '14px'
                }}>
                  {message.role === 'tutor' ? '👩‍🏫 Your Tutor' : '🎓 You'}
                </div>
                <SafeHTML 
                  content={formatContent(message.content).html}
                  type="math"
                  style={{
                    fontSize: '15px',
                    lineHeight: '1.6',
                    color: '#333'
                  }}
                  aria-label={`${message.role === 'tutor' ? 'Math tutor' : 'Student'} message`}
                  role={message.role === 'tutor' ? 'region' : 'article'}
                />
              </div>
            ))}
          </div>

          {/* Student Input */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 16px 0', color: '#FF6B35' }}>
              💭 Ask Your Tutor or Share Your Thoughts
            </h4>
            <textarea
              value={studentQuestion}
              onChange={(e) => setStudentQuestion(e.target.value)}
              placeholder="Ask a question, share your thoughts, or let me know if you need help with something specific..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '16px',
                border: '2px solid #f0f0f0',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <button
              onClick={askTutor}
              disabled={isLoading || !studentQuestion.trim()}
              style={{
                background: isLoading || !studentQuestion.trim() ? '#ccc' : 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading || !studentQuestion.trim() ? 'not-allowed' : 'pointer',
                marginTop: '12px'
              }}
            >
              {isLoading ? '🔄 Getting help...' : '📤 Ask Tutor'}
            </button>
          </div>

          {/* Calculator Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 16px 0', color: '#FF6B35' }}>
              🧮 Calculator with Tutor Help
            </h4>
            <input
              type="text"
              value={calculation}
              onChange={(e) => setCalculation(e.target.value)}
              placeholder="Enter a math problem (e.g., 2+3*4, sin(30), sqrt(16))"
              style={{
                width: '100%',
                padding: '16px',
                border: '2px solid #f0f0f0',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'inherit',
                marginBottom: '12px'
              }}
            />
            <button
              onClick={calculateWithTutor}
              disabled={isLoading || !calculation.trim()}
              style={{
                background: isLoading || !calculation.trim() ? '#ccc' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading || !calculation.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? '🔄 Calculating...' : '⚡ Solve with Tutor'}
            </button>

            {calculationResult && (
              <div style={{
                marginTop: '16px',
                padding: '16px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '2px solid #28a745'
              }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#28a745' }}>
                  📊 Solution with Explanation
                </h5>
                <SafeHTML 
                  content={formatContent(calculationResult).html}
                  type="math"
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#333'
                  }}
                  aria-label="Calculation solution and explanation"
                  role="region"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {currentLesson && (
          <button
            onClick={() => {
              setCurrentLesson(null);
              setConversationHistory([]);
              setTutorResponse('');
              setStudentQuestion('');
              setCalculation('');
              setCalculationResult('');
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#FF6B35',
              border: '1px solid #FF6B35',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ← Back to Topics
          </button>
        )}
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#FF6B35',
            border: '1px solid #FF6B35',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Back to Tutor Tools
        </button>
      </div>
    </div>
  );
};

export default TutorScientificCalculator;