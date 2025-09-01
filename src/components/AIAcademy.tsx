import React, { useState } from 'react';
import { textFormattingService } from '../lib/services/textFormattingService';
import SafeHTML from './SafeHTML';
import { sanitizationService } from '../lib/services/sanitizationService';

interface AIAcademyProps {
  onBack: () => void;
  aiService: (messages: any[], model?: string) => Promise<{ content: string; reasoning: string; responseTime: number; }>;
}

const AIAcademy: React.FC<AIAcademyProps> = ({ onBack, aiService }) => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [interactiveDemo, setInteractiveDemo] = useState('');

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

  const [isLoading, setIsLoading] = useState(false);

  const aiTopics = [
    {
      id: 'fundamentals',
      title: 'AI Fundamentals',
      icon: '🧠',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: 'Core concepts and foundations of artificial intelligence',
      lessons: [
        'What is Artificial Intelligence?',
        'Machine Learning vs Deep Learning',
        'Types of AI: Narrow, General, Super',
        'AI in Everyday Life',
        'History and Evolution of AI',
        'Ethics in AI Development'
      ]
    },
    {
      id: 'machine-learning',
      title: 'Machine Learning',
      icon: '📊',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      description: 'Learn ML algorithms, training, and practical applications',
      lessons: [
        'Supervised vs Unsupervised Learning',
        'Linear Regression Explained',
        'Classification Algorithms',
        'Decision Trees and Random Forests',
        'Neural Networks Basics',
        'Model Evaluation and Validation'
      ]
    },
    {
      id: 'deep-learning',
      title: 'Deep Learning',
      icon: '🔗',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      description: 'Neural networks, CNNs, RNNs, and modern architectures',
      lessons: [
        'Introduction to Neural Networks',
        'Convolutional Neural Networks (CNNs)',
        'Recurrent Neural Networks (RNNs)',
        'Transformer Architecture',
        'Generative Adversarial Networks (GANs)',
        'Transfer Learning and Fine-tuning'
      ]
    },
    {
      id: 'nlp',
      title: 'Natural Language Processing',
      icon: '💬',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      description: 'Understanding and processing human language with AI',
      lessons: [
        'Text Preprocessing and Tokenization',
        'Word Embeddings and Vectors',
        'Sentiment Analysis',
        'Named Entity Recognition',
        'Language Models and GPT',
        'Building a Chatbot'
      ]
    },
    {
      id: 'computer-vision',
      title: 'Computer Vision',
      icon: '👁️',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      description: 'Teaching machines to see and interpret visual data',
      lessons: [
        'Image Processing Fundamentals',
        'Feature Detection and Extraction',
        'Object Detection and Recognition',
        'Image Classification with CNNs',
        'Facial Recognition Systems',
        'Medical Image Analysis'
      ]
    },
    {
      id: 'ai-tools',
      title: 'AI Tools & Frameworks',
      icon: '🛠️',
      gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      description: 'Hands-on experience with popular AI tools and libraries',
      lessons: [
        'Python for AI Development',
        'TensorFlow and Keras',
        'PyTorch Framework',
        'Scikit-learn for ML',
        'OpenCV for Computer Vision',
        'Hugging Face Transformers'
      ]
    },
    {
      id: 'ai-projects',
      title: 'AI Projects & Applications',
      icon: '🚀',
      gradient: 'linear-gradient(135deg, #96fbc4 0%, #f9f047 100%)',
      description: 'Build real-world AI applications and projects',
      lessons: [
        'Image Classifier Project',
        'Recommendation System',
        'Stock Price Predictor',
        'Voice Recognition App',
        'AI Game Playing Agent',
        'Personal AI Assistant'
      ]
    }
  ];

  const generateLesson = async (topic: any, lessonTitle: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/deepseek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{
            role: 'system',
            content: 'You are an AI education specialist with deep expertise in explaining artificial intelligence, machine learning, and computer science concepts in an accessible and engaging way.'
          }, {
            role: 'user',
            content: `Create an interactive AI lesson about "${lessonTitle}" in the context of "${topic.title}".

Structure the lesson with:
1. Clear learning objectives
2. Core concepts explanation with examples
3. Real-world applications and use cases
4. Interactive examples or demonstrations
5. Practice exercises or thought experiments
6. Key takeaways and next steps
7. Additional resources for deeper learning

Make it engaging, practical, and accessible to learners. Include code examples where appropriate.`
          }],
          module: 'ai_academy',
          action: 'explain_ai',
          metadata: {
            concept: lessonTitle,
            level: 'beginner'
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          let content = '';
          
          if (data.data.explanation && data.data.examples) {
            // If using the structured AI explanation response
            content = `
## Learning Objectives
${data.data.explanation}

## Examples
${data.data.examples.map((example: string, index: number) => `${index + 1}. ${example}`).join('\n')}

## Resources
${data.data.resources ? data.data.resources.map((resource: string, index: number) => `${index + 1}. ${resource}`).join('\n') : 'Practice with the concepts above and explore related topics.'}
            `;
          } else if (data.data.response) {
            // If using general chat response
            content = data.data.response;
          }

          // Validate AI response before setting lesson content
          if (!validateAIResponse(content)) {
            throw new Error('AI response failed security validation');
          }

          setCurrentLesson({
            title: lessonTitle,
            topic: topic.title,
            content: content,
            topicData: topic
          });
          setInteractiveDemo('');
        } else {
          throw new Error(data.error || 'Failed to generate lesson');
        }
      } else {
        throw new Error('Failed to communicate with AI service');
      }
    } catch (error) {
      console.error('Error generating lesson:', error);
      alert('Failed to generate lesson. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateDemo = async (demoType: string) => {
    if (!currentLesson) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/deepseek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{
            role: 'system',
            content: 'You are an AI education specialist creating hands-on demonstrations and interactive examples for AI and machine learning concepts.'
          }, {
            role: 'user',
            content: `Create an interactive demonstration for "${demoType}" related to the lesson "${currentLesson.title}".

Provide:
1. Step-by-step interactive example
2. Code implementation (Python/JavaScript)
3. Expected inputs and outputs
4. Visualization or explanation of results
5. Variations to try
6. Common mistakes and how to fix them

Make it hands-on and educational with clear explanations.`
          }],
          module: 'ai_academy',
          action: 'chat'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data.response) {
          // Validate AI response before setting interactive demo
          if (!validateAIResponse(data.data.response)) {
            throw new Error('AI response failed security validation');
          }

          setInteractiveDemo(data.data.response);
        } else {
          throw new Error(data.error || 'Failed to generate demo');
        }
      } else {
        throw new Error('Failed to communicate with AI service');
      }
    } catch (error) {
      console.error('Error generating demo:', error);
      alert('Failed to generate demo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        color: 'white'
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
          🧠 A.I. Academy
        </h2>
        <div style={{ fontSize: '16px', opacity: 0.9 }}>
          Master artificial intelligence and machine learning concepts
        </div>
      </div>

      {!currentLesson ? (
        /* Topic Selection */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {aiTopics.map(topic => (
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
                      onClick={() => generateLesson(topic, lesson)}
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
                        color: isLoading ? '#999' : '#333',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseOver={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.borderColor = '#667eea';
                          e.currentTarget.style.background = '#f8f9ff';
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
                      {isLoading ? '🔄 Loading...' : lesson}
                    </button>
                  ))}
                </div>
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
                    {currentLesson.topic} • Interactive AI Lesson
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson Content */}
            <div style={{ padding: '16px' }}>
              <SafeHTML 
                content={formatContent(currentLesson.content).html}
                type="general"
                style={{
                  fontSize: '15px',
                  lineHeight: '1.6',
                  color: '#333'
                }}
                aria-label="AI Academy lesson content"
                role="region"
              />
            </div>
          </div>

          {/* Interactive Demonstrations */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#667eea', fontSize: '16px' }}>
              🔬 Interactive Demonstrations
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginBottom: '16px' }}>
              {[
                'Code Example',
                'Algorithm Visualization',
                'Data Analysis Demo',
                'Model Training Simulation',
                'Real-world Application',
                'Performance Comparison'
              ].map(demoType => (
                <button
                  key={demoType}
                  onClick={() => generateDemo(demoType)}
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
                  {isLoading ? '🔄 Generating...' : '⚡ ' + demoType}
                </button>
              ))}
            </div>

            {interactiveDemo && (
              <div style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                border: '2px solid #28a745'
              }}>
                <h5 style={{ margin: '0 0 12px 0', color: '#28a745', fontSize: '14px' }}>
                  🧪 Interactive Demo Results
                </h5>
                <SafeHTML 
                  content={formatContent(interactiveDemo).html}
                  type="code"
                  style={{
                    fontSize: '13px',
                    lineHeight: '1.6',
                    color: '#333',
                    fontFamily: '"Monaco", "Consolas", "Courier New", monospace'
                  }}
                  aria-label="Interactive AI demo"
                  role="region"
                />
              </div>
            )}
          </div>

          {/* AI Learning Path */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#667eea', fontSize: '16px' }}>
              📚 Recommended Learning Path
            </h4>
            <div style={{ display: 'grid', gap: '8px' }}>
              {[
                '🎯 Master the current topic fundamentals',
                '💻 Practice with hands-on coding exercises',
                '📊 Work on a related mini-project',
                '🔍 Explore advanced concepts and variations',
                '🚀 Apply knowledge to real-world problems',
                '🤝 Join AI communities and share your progress'
              ].map((step, index) => (
                <div key={index} style={{
                  background: '#f8f9fa',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  borderLeft: '4px solid #667eea',
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
              setInteractiveDemo('');
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#667eea',
              border: '1px solid #667eea',
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
            color: '#667eea',
            border: '1px solid #667eea',
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

export default AIAcademy;