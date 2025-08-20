import React, { useState } from 'react';
import { textFormattingService } from '../lib/services/textFormattingService';
import SafeHTML from './SafeHTML';
import { sanitizationService } from '../lib/services/sanitizationService';

interface TutorGrammarCheckerProps {
  onBack: () => void;
  aiService: (messages: any[], model?: string) => Promise<{ content: string; reasoning: string; responseTime: number; }>;
}

const TutorGrammarChecker: React.FC<TutorGrammarCheckerProps> = ({ onBack, aiService }) => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [studentText, setStudentText] = useState('');
  const [tutorFeedback, setTutorFeedback] = useState('');
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

  const grammarTopics = [
    {
      id: 'sentence-structure',
      title: 'Sentence Structure',
      icon: '🏗️',
      gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
      description: 'Master the building blocks of clear, effective sentences',
      lessons: [
        'Simple, Compound, and Complex Sentences',
        'Subject-Verb Agreement',
        'Sentence Fragments and Run-ons',
        'Active vs Passive Voice',
        'Parallel Structure',
        'Sentence Variety and Flow'
      ]
    },
    {
      id: 'punctuation',
      title: 'Punctuation Mastery',
      icon: '🔤',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: 'Learn when and how to use punctuation for clarity',
      lessons: [
        'Comma Rules and Usage',
        'Semicolons and Colons',
        'Apostrophes and Contractions',
        'Quotation Marks and Dialogue',
        'Hyphens and Dashes',
        'Advanced Punctuation Patterns'
      ]
    },
    {
      id: 'grammar-basics',
      title: 'Grammar Fundamentals',
      icon: '📚',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      description: 'Essential grammar rules for clear communication',
      lessons: [
        'Parts of Speech Review',
        'Verb Tenses and Consistency',
        'Pronoun-Antecedent Agreement',
        'Adjectives and Adverbs',
        'Prepositions and Phrases',
        'Common Grammar Mistakes'
      ]
    },
    {
      id: 'writing-style',
      title: 'Writing Style & Clarity',
      icon: '✍️',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      description: 'Develop your unique voice and clear expression',
      lessons: [
        'Conciseness and Wordiness',
        'Word Choice and Vocabulary',
        'Tone and Voice',
        'Transitions and Flow',
        'Avoiding Clichés',
        'Style Consistency'
      ]
    },
    {
      id: 'academic-writing',
      title: 'Academic Writing',
      icon: '🎓',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      description: 'Professional and academic writing standards',
      lessons: [
        'Formal vs Informal Language',
        'Citation and References',
        'Thesis Statements',
        'Essay Structure',
        'Research Writing',
        'Avoiding Plagiarism'
      ]
    },
    {
      id: 'creative-writing',
      title: 'Creative Expression',
      icon: '🎨',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      description: 'Express creativity while maintaining good grammar',
      lessons: [
        'Descriptive Writing Techniques',
        'Dialogue and Character Voice',
        'Narrative Structure',
        'Poetry and Rhythm',
        'Creative Grammar Choices',
        'Editing Your Creative Work'
      ]
    }
  ];

  const startTutorSession = async (topic: any, lessonTitle: string) => {
    setIsLoading(true);
    try {
      const response = await aiService([{
        id: 'grammar-tutor-start',
        role: 'user',
        content: `Act as a friendly, encouraging English grammar tutor starting a lesson on "${lessonTitle}" in ${topic.title}.

Create an interactive tutoring session that includes:
1. Warm welcome and explain what we'll learn today
2. Ask about the student's experience with this topic
3. Provide clear explanations with examples
4. Offer practice exercises to work on together
5. Encourage questions and active participation
6. Use supportive, patient language

Start with: "Hello! I'm your grammar tutor, and I'm excited to help you master ${lessonTitle}! This is such an important skill that will make your writing much clearer and more effective. Let's start by talking about what you already know about this topic..."`,
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
      console.error('Error starting grammar session:', error);
      alert('Failed to start tutoring session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkGrammarWithTutor = async () => {
    if (!studentText.trim()) return;

    setIsLoading(true);
    try {
      const response = await aiService([{
        id: 'grammar-check',
        role: 'user',
        content: `As a patient grammar tutor, review this student's text and provide helpful feedback:

"${studentText}"

Provide:
1. Encouraging opening statement
2. Specific grammar corrections with explanations
3. Positive feedback on what they did well
4. Suggestions for improvement
5. Examples of corrected sentences
6. Tips for avoiding similar mistakes

Be supportive and educational, not just corrective. Format as a conversation with the student.`,
        timestamp: new Date()
      }], 'llama-3.3-70b-versatile');

      // Validate AI response before adding to conversation
      if (!validateAIResponse(response.content)) {
        throw new Error('AI response failed security validation');
      }

      const studentMessage = {
        role: 'student',
        content: `Please check my writing: "${studentText}"`,
        timestamp: new Date()
      };

      const tutorMessage = {
        role: 'tutor',
        content: response.content,
        timestamp: new Date()
      };

      setConversationHistory(prev => [...prev, studentMessage, tutorMessage]);
      setTutorFeedback(response.content);
    } catch (error) {
      console.error('Error checking grammar:', error);
      alert('Failed to check grammar. Please try again.');
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
        id: 'grammar-tutor-response',
        role: 'user',
        content: `You are a supportive grammar tutor teaching "${currentLesson.title}". 

Previous conversation:
${conversationContext}

Student's question: "${studentQuestion}"

Respond as an encouraging tutor would:
1. Thank them for the great question
2. Provide clear, helpful explanations
3. Use examples to illustrate points
4. Ask if they need clarification
5. Encourage continued learning
6. Connect to broader writing skills

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
          ✍️ Grammar Tutor & Writing Coach
        </h2>
        <div style={{ fontSize: '16px', opacity: 0.9 }}>
          Improve your writing with personalized grammar guidance and feedback
        </div>
      </div>

      {!currentLesson ? (
        /* Topic Selection */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {grammarTopics.map(topic => (
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
                    {currentLesson.topic} • Writing Coach Session
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
              💬 Learning Conversation
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
                  {message.role === 'tutor' ? '👩‍🏫 Your Writing Coach' : '✍️ You'}
                </div>
                <SafeHTML 
                  content={formatContent(message.content).html}
                  type="general"
                  style={{
                    fontSize: '15px',
                    lineHeight: '1.6',
                    color: '#333'
                  }}
                  aria-label={`${message.role === 'tutor' ? 'Writing coach' : 'Student'} message`}
                  role={message.role === 'tutor' ? 'region' : 'article'}
                />
              </div>
            ))}
          </div>

          {/* Text Input for Grammar Check */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 16px 0', color: '#FF6B35' }}>
              📝 Submit Your Writing for Review
            </h4>
            <textarea
              value={studentText}
              onChange={(e) => setStudentText(e.target.value)}
              placeholder="Paste or type your writing here for grammar and style feedback..."
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '16px',
                border: '2px solid #f0f0f0',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <button
              onClick={checkGrammarWithTutor}
              disabled={isLoading || !studentText.trim()}
              style={{
                background: isLoading || !studentText.trim() ? '#ccc' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading || !studentText.trim() ? 'not-allowed' : 'pointer',
                marginTop: '12px'
              }}
            >
              {isLoading ? '🔄 Reviewing...' : '✅ Get Feedback'}
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
              💭 Ask Your Writing Coach
            </h4>
            <textarea
              value={studentQuestion}
              onChange={(e) => setStudentQuestion(e.target.value)}
              placeholder="Ask about grammar rules, writing techniques, or any questions about this lesson..."
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
              setStudentText('');
              setTutorFeedback('');
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

export default TutorGrammarChecker;