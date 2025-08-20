import React, { useState } from 'react';
import { textFormattingService } from '../lib/services/textFormattingService';
import SafeHTML from './SafeHTML';
import { sanitizationService } from '../lib/services/sanitizationService';

interface TutorSmartTranslatorProps {
  onBack: () => void;
  aiService: (messages: any[], model?: string) => Promise<{ content: string; reasoning: string; responseTime: number; }>;
}

const TutorSmartTranslator: React.FC<TutorSmartTranslatorProps> = ({ onBack, aiService }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [textToTranslate, setTextToTranslate] = useState('');
  const [translationResult, setTranslationResult] = useState('');
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

  const languageTopics = [
    {
      id: 'spanish',
      title: 'Spanish Language Learning',
      icon: '🇪🇸',
      gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
      description: 'Learn Spanish through translation and conversation practice',
      lessons: [
        'Basic Vocabulary and Phrases',
        'Grammar Fundamentals',
        'Conversation Practice',
        'Business Spanish',
        'Travel Expressions',
        'Cultural Context and Idioms'
      ]
    },
    {
      id: 'french',
      title: 'French Language Learning',
      icon: '🇫🇷',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: 'Master French through guided translation exercises',
      lessons: [
        'Essential French Phrases',
        'Verb Conjugations',
        'Pronunciation Practice',
        'Formal vs Informal Speech',
        'French Literature Excerpts',
        'Regional Dialects and Expressions'
      ]
    },
    {
      id: 'german',
      title: 'German Language Learning',
      icon: '🇩🇪',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      description: 'Navigate German language complexities with expert guidance',
      lessons: [
        'German Grammar Basics',
        'Compound Words and Structure',
        'Case System Mastery',
        'Business German',
        'Technical and Academic German',
        'Cultural Expressions'
      ]
    },
    {
      id: 'japanese',
      title: 'Japanese Language Learning',
      icon: '🇯🇵',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      description: 'Learn Japanese writing systems and cultural context',
      lessons: [
        'Hiragana and Katakana',
        'Basic Kanji Characters',
        'Politeness Levels (Keigo)',
        'Everyday Conversations',
        'Business Japanese',
        'Cultural Nuances and Etiquette'
      ]
    },
    {
      id: 'mandarin',
      title: 'Mandarin Chinese Learning',
      icon: '🇨🇳',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      description: 'Master Mandarin tones and character recognition',
      lessons: [
        'Pinyin and Tone Practice',
        'Essential Characters',
        'Grammar Patterns',
        'Business Mandarin',
        'Traditional vs Simplified',
        'Cultural Context and Idioms'
      ]
    },
    {
      id: 'multilingual',
      title: 'Multi-Language Translation',
      icon: '🌍',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      description: 'Compare languages and learn translation strategies',
      lessons: [
        'Translation Techniques',
        'False Friends and Cognates',
        'Cultural Adaptation',
        'Technical Translation',
        'Literary Translation',
        'Language Comparison Studies'
      ]
    }
  ];

  const startLanguageSession = async (language: any, lessonTitle: string) => {
    setIsLoading(true);
    try {
      const response = await aiService([{
        id: 'language-tutor-start',
        role: 'user',
        content: `Act as an expert language tutor starting a lesson on "${lessonTitle}" for ${language.title}.

Create an interactive language learning session that includes:
1. Warm welcome in both English and the target language
2. Explain what we'll learn in this lesson
3. Provide cultural context and background
4. Start with basic examples and build complexity
5. Encourage active participation and questions
6. Use immersive teaching techniques
7. Include pronunciation tips where applicable

Start with: "Welcome to your ${language.title} lesson! Today we're focusing on ${lessonTitle}. Let's start by exploring some key concepts together..."`,
        timestamp: new Date()
      }], 'llama-3.3-70b-versatile');

      setCurrentLesson({
        title: lessonTitle,
        language: language.title,
        languageData: language
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
      console.error('Error starting language session:', error);
      alert('Failed to start language session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const translateWithTutor = async () => {
    if (!textToTranslate.trim()) return;

    setIsLoading(true);
    try {
      const targetLanguage = currentLesson?.language || 'Spanish';
      const response = await aiService([{
        id: 'translation-with-learning',
        role: 'user',
        content: `As a language tutor, help translate this text and provide a comprehensive learning experience:

Text to translate: "${textToTranslate}"
Target language: ${targetLanguage}

Provide:
1. Accurate translation with natural flow
2. Word-by-word breakdown for key terms
3. Grammar explanations for important structures
4. Cultural context if relevant
5. Alternative ways to express the same idea
6. Common mistakes to avoid
7. Practice suggestions for similar sentences

Make it educational and engaging, focusing on helping the student understand WHY the translation works this way.`,
        timestamp: new Date()
      }], 'llama-3.3-70b-versatile');

      // Validate AI response before adding to conversation
      if (!validateAIResponse(response.content)) {
        throw new Error('AI response failed security validation');
      }

      const studentMessage = {
        role: 'student',
        content: `Please translate this text and help me understand it: "${textToTranslate}"`,
        timestamp: new Date()
      };

      const tutorMessage = {
        role: 'tutor',
        content: response.content,
        timestamp: new Date()
      };

      setConversationHistory(prev => [...prev, studentMessage, tutorMessage]);
      setTranslationResult(response.content);
    } catch (error) {
      console.error('Error translating with tutor:', error);
      alert('Failed to translate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const askLanguageTutor = async () => {
    if (!studentQuestion.trim() || !currentLesson) return;

    setIsLoading(true);
    try {
      const conversationContext = conversationHistory.map(msg => 
        `${msg.role === 'tutor' ? 'Tutor' : 'Student'}: ${msg.content}`
      ).join('\n\n');

      const response = await aiService([{
        id: 'language-tutor-response',
        role: 'user',
        content: `You are an encouraging language tutor teaching "${currentLesson.title}" for ${currentLesson.language}. 

Previous conversation:
${conversationContext}

Student's question: "${studentQuestion}"

Respond as a supportive language tutor would:
1. Thank them for the great question
2. Provide clear explanations with examples
3. Include pronunciation guides when helpful
4. Use the target language with translations
5. Give practical usage tips
6. Encourage continued practice
7. Connect to broader language learning goals

Keep it conversational, educational, and encouraging.`,
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
          🌍 Smart Translator & Language Tutor
        </h2>
        <div style={{ fontSize: '16px', opacity: 0.9 }}>
          Learn languages through translation and cultural exchange
        </div>
      </div>

      {!currentLesson ? (
        /* Language Selection */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {languageTopics.map(language => (
            <div key={language.id} style={{
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
                background: language.gradient,
                padding: '24px',
                color: 'white'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '40px', marginRight: '16px' }}>
                    {language.icon}
                  </span>
                  <div>
                    <h3 style={{
                      margin: '0 0 4px 0',
                      fontSize: '22px',
                      fontWeight: '700'
                    }}>
                      {language.title}
                    </h3>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      opacity: 0.9,
                      lineHeight: '1.4'
                    }}>
                      {language.description}
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
                  {language.lessons.map((lesson, index) => (
                    <button
                      key={index}
                      onClick={() => startLanguageSession(language, lesson)}
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
                        background: language.gradient,
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
        /* Language Learning Session */
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
              background: currentLesson.languageData.gradient,
              padding: '20px',
              color: 'white'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '32px', marginRight: '16px' }}>
                  {currentLesson.languageData.icon}
                </span>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>
                    {currentLesson.title}
                  </h3>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>
                    {currentLesson.language} • Language Learning Session
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
              💬 Language Learning Conversation
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
                  {message.role === 'tutor' ? '👩‍🏫 Your Language Tutor' : '🎓 You'}
                </div>
                <SafeHTML 
                  content={formatContent(message.content).html}
                  type="general"
                  style={{
                    fontSize: '15px',
                    lineHeight: '1.6',
                    color: '#333'
                  }}
                  aria-label={`${message.role === 'tutor' ? 'Language tutor' : 'Student'} message`}
                  role={message.role === 'tutor' ? 'region' : 'article'}
                />
              </div>
            ))}
          </div>

          {/* Translation Input */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 16px 0', color: '#FF6B35' }}>
              📝 Text Translation & Learning
            </h4>
            <textarea
              value={textToTranslate}
              onChange={(e) => setTextToTranslate(e.target.value)}
              placeholder="Enter text you'd like to translate and learn about..."
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
              onClick={translateWithTutor}
              disabled={isLoading || !textToTranslate.trim()}
              style={{
                background: isLoading || !textToTranslate.trim() ? '#ccc' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading || !textToTranslate.trim() ? 'not-allowed' : 'pointer',
                marginTop: '12px'
              }}
            >
              {isLoading ? '🔄 Translating...' : '✅ Translate & Learn'}
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
              💭 Ask Your Language Tutor
            </h4>
            <textarea
              value={studentQuestion}
              onChange={(e) => setStudentQuestion(e.target.value)}
              placeholder="Ask about grammar, pronunciation, cultural context, or any language questions..."
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
              onClick={askLanguageTutor}
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
              setTextToTranslate('');
              setTranslationResult('');
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
            ← Back to Languages
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

export default TutorSmartTranslator;