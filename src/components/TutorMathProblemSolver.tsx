import React, { useState } from 'react';
import { textFormattingService } from '../services/textFormattingService';
import SafeHTML from './SafeHTML';
import { sanitizationService } from '../services/sanitizationService';

interface TutorMathProblemSolverProps {
  onBack: () => void;
  aiService: (messages: any[], model?: string) => Promise<{ content: string; reasoning: string; responseTime: number; }>;
}

const TutorMathProblemSolver: React.FC<TutorMathProblemSolverProps> = ({ onBack, aiService }) => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [studentProblem, setStudentProblem] = useState('');
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [studentQuestion, setStudentQuestion] = useState('');
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
      id: 'arithmetic',
      title: 'Arithmetic & Number Theory',
      icon: '🔢',
      gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
      description: 'Master fundamental number operations and properties',
      lessons: [
        'Prime Numbers and Factorization',
        'Fractions and Decimal Operations',
        'Percentage and Ratio Problems',
        'Powers and Roots',
        'Number Patterns and Sequences',
        'Word Problems with Multiple Steps'
      ]
    },
    {
      id: 'algebra',
      title: 'Algebraic Problem Solving',
      icon: '📈',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: 'Solve equations and work with algebraic expressions',
      lessons: [
        'Linear Equations and Inequalities',
        'Quadratic Equations and Factoring',
        'Systems of Linear Equations',
        'Polynomial Operations',
        'Rational Expressions',
        'Word Problems with Variables'
      ]
    },
    {
      id: 'geometry',
      title: 'Geometry Problem Solving',
      icon: '📐',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      description: 'Solve problems involving shapes, angles, and measurements',
      lessons: [
        'Area and Perimeter Calculations',
        'Triangle and Circle Problems',
        'Volume and Surface Area',
        'Coordinate Geometry',
        'Angle Relationships',
        'Geometric Proofs and Reasoning'
      ]
    },
    {
      id: 'trigonometry',
      title: 'Trigonometric Problems',
      icon: '📊',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      description: 'Apply trigonometric functions to solve real-world problems',
      lessons: [
        'Right Triangle Trigonometry',
        'Law of Sines and Cosines',
        'Trigonometric Identities',
        'Graphing Trigonometric Functions',
        'Applications in Physics',
        'Navigation and Engineering Problems'
      ]
    },
    {
      id: 'calculus',
      title: 'Calculus Problem Solving',
      icon: '∫',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      description: 'Work through limits, derivatives, and integration problems',
      lessons: [
        'Limit Problems and Continuity',
        'Derivative Applications',
        'Optimization Problems',
        'Related Rates',
        'Integration Techniques',
        'Area and Volume Applications'
      ]
    },
    {
      id: 'statistics',
      title: 'Statistical Problem Solving',
      icon: '📊',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      description: 'Analyze data and solve probability problems',
      lessons: [
        'Descriptive Statistics',
        'Probability Calculations',
        'Normal Distribution Problems',
        'Hypothesis Testing',
        'Regression Analysis',
        'Statistical Inference'
      ]
    }
  ];

  const startTutorSession = async (topic: any, lessonTitle: string) => {
    setIsLoading(true);
    try {
      const response = await aiService([{
        id: 'math-tutor-start',
        role: 'user',
        content: `Act as an expert mathematics tutor starting a problem-solving session on "${lessonTitle}" in ${topic.title}.

Create an interactive tutoring session that includes:
1. Warm welcome and explain what we'll work on today
2. Present a sample problem to demonstrate the approach
3. Break down the problem-solving strategy step-by-step
4. Encourage the student to try similar problems
5. Offer hints and guidance when needed
6. Use encouraging, patient language throughout

Start with: "Hello! I'm your math tutor, and I'm excited to help you master ${lessonTitle}! Let's start with a sample problem so I can show you my approach to solving these types of questions..."`,
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
    } catch (error) {
      console.error('Error starting math tutoring session:', error);
      alert('Failed to start tutoring session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const solveProblemWithTutor = async () => {
    if (!studentProblem.trim()) return;

    setIsLoading(true);
    try {
      const response = await aiService([{
        id: 'math-problem-solve',
        role: 'user',
        content: `As a patient math tutor, help the student solve this problem step-by-step:

"${studentProblem}"

Provide:
1. Encouraging opening statement
2. Clear identification of what type of problem this is
3. Step-by-step solution with explanations for each step
4. Check the answer and verify it makes sense
5. Similar problems they could try for practice
6. Tips for solving similar problems in the future

Be supportive and educational, breaking down complex steps into manageable parts. Format as a tutoring conversation.`,
        timestamp: new Date()
      }], 'llama-3.3-70b-versatile');

      // Validate AI response before adding to conversation
      if (!validateAIResponse(response.content)) {
        throw new Error('AI response failed security validation');
      }

      const studentMessage = {
        role: 'student',
        content: `Please help me solve this problem: "${studentProblem}"`,
        timestamp: new Date()
      };

      const tutorMessage = {
        role: 'tutor',
        content: response.content,
        timestamp: new Date()
      };

      setConversationHistory(prev => [...prev, studentMessage, tutorMessage]);
    } catch (error) {
      console.error('Error solving math problem:', error);
      alert('Failed to solve problem. Please try again.');
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
        id: 'math-tutor-response',
        role: 'user',
        content: `You are an encouraging math tutor teaching "${currentLesson.title}". 

Previous conversation:
${conversationContext}

Student's question: "${studentQuestion}"

Respond as a supportive tutor would:
1. Thank them for the excellent question
2. Provide clear, step-by-step explanations
3. Use examples and visual descriptions when helpful
4. Ask if they need more clarification
5. Encourage continued practice
6. Connect to broader mathematical concepts

Keep it conversational and supportive.`,
        timestamp: new Date()
      }], 'llama-3.3-70b-versatile');

      // Validate AI response before adding to conversation
      if (!validateAIResponse(response.content)) {
        throw new Error('AI response failed security validation');
      }

      const studentMsg = {
        role: 'student',
        content: studentQuestion,
        timestamp: new Date()
      };

      const tutorMsg = {
        role: 'tutor',
        content: response.content,
        timestamp: new Date()
      };

      setConversationHistory(prev => [...prev, studentMsg, tutorMsg]);
      setStudentQuestion('');
    } catch (error) {
      console.error('Error getting tutor response:', error);
      alert('Failed to get tutor response. Please try again.');
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
          🧮 Math Problem Solver & Tutor
        </h2>
        <div style={{ fontSize: '16px', opacity: 0.9 }}>
          Step-by-step problem solving with personalized math tutoring
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
                    {currentLesson.topic} • Problem Solving Session
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
                  {message.role === 'tutor' ? '👩‍🏫 Your Math Tutor' : '🎓 You'}
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

          {/* Problem Input */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 16px 0', color: '#FF6B35' }}>
              📝 Submit a Math Problem to Solve
            </h4>
            <textarea
              value={studentProblem}
              onChange={(e) => setStudentProblem(e.target.value)}
              placeholder="Enter your math problem here (e.g., 'Solve for x: 2x + 5 = 13' or 'Find the area of a triangle with base 8 and height 6')"
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '16px',
                border: '2px solid #f0f0f0',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <button
              onClick={solveProblemWithTutor}
              disabled={isLoading || !studentProblem.trim()}
              style={{
                background: isLoading || !studentProblem.trim() ? '#ccc' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading || !studentProblem.trim() ? 'not-allowed' : 'pointer',
                marginTop: '12px'
              }}
            >
              {isLoading ? '🔄 Solving...' : '✅ Get Step-by-Step Solution'}
            </button>
          </div>

          {/* Question Input */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 16px 0', color: '#FF6B35' }}>
              💭 Ask Your Math Tutor
            </h4>
            <textarea
              value={studentQuestion}
              onChange={(e) => setStudentQuestion(e.target.value)}
              placeholder="Ask about math concepts, problem-solving strategies, or any questions about this lesson..."
              style={{
                width: '100%',
                minHeight: '80px',
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
              {isLoading ? '🔄 Getting help...' : '💬 Ask Question'}
            </button>
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
              setStudentProblem('');
              setStudentQuestion('');
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

export default TutorMathProblemSolver;