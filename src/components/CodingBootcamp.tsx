import React, { useState } from 'react';
import { textFormattingService } from '../lib/services/textFormattingService';
import SafeHTML from './SafeHTML';
import { sanitizationService } from '../lib/services/sanitizationService';

interface CodingBootcampProps {
  onBack: () => void;
  aiService: (messages: any[], model?: string) => Promise<{ content: string; reasoning: string; responseTime: number; }>;
}

const CodingBootcamp: React.FC<CodingBootcampProps> = ({ onBack, aiService }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const [codeReview, setCodeReview] = useState('');
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

  const programmingLanguages = [
    {
      id: 'python',
      title: 'Python Mastery',
      icon: '🐍',
      gradient: 'linear-gradient(135deg, #3776ab 0%, #4fa2e6 100%)',
      description: 'From basics to advanced Python programming concepts',
      challenges: [
        'Variables and Data Types',
        'Control Flow and Loops',
        'Functions and Modules',
        'Object-Oriented Programming',
        'File Handling and APIs',
        'Web Development with Flask/Django'
      ]
    },
    {
      id: 'javascript',
      title: 'JavaScript Excellence',
      icon: '⚡',
      gradient: 'linear-gradient(135deg, #f7df1e 0%, #ffeb3b 100%)',
      description: 'Master modern JavaScript and web development',
      challenges: [
        'ES6+ Features and Syntax',
        'DOM Manipulation',
        'Async Programming and Promises',
        'React.js Components',
        'Node.js Backend Development',
        'Full-Stack Application Building'
      ]
    },
    {
      id: 'java',
      title: 'Java Programming',
      icon: '☕',
      gradient: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
      description: 'Enterprise-level Java development skills',
      challenges: [
        'Java Fundamentals',
        'Object-Oriented Design',
        'Collections and Generics',
        'Multithreading and Concurrency',
        'Spring Framework',
        'Microservices Architecture'
      ]
    },
    {
      id: 'cpp',
      title: 'C++ Performance',
      icon: '⚙️',
      gradient: 'linear-gradient(135deg, #00599c 0%, #0086d4 100%)',
      description: 'High-performance programming with C++',
      challenges: [
        'Memory Management',
        'STL and Data Structures',
        'Template Programming',
        'Modern C++ Features',
        'Game Development',
        'System Programming'
      ]
    },
    {
      id: 'go',
      title: 'Go Programming',
      icon: '🚀',
      gradient: 'linear-gradient(135deg, #00add8 0%, #00bcd4 100%)',
      description: 'Concurrent and scalable systems with Go',
      challenges: [
        'Goroutines and Channels',
        'Web Services with Gin',
        'Microservices Development',
        'Database Integration',
        'Performance Optimization',
        'Cloud-Native Applications'
      ]
    },
    {
      id: 'rust',
      title: 'Rust Systems',
      icon: '🦀',
      gradient: 'linear-gradient(135deg, #ce422b 0%, #f74c00 100%)',
      description: 'Safe systems programming with Rust',
      challenges: [
        'Ownership and Borrowing',
        'Pattern Matching',
        'Error Handling',
        'Concurrency in Rust',
        'WebAssembly Development',
        'Performance Critical Applications'
      ]
    }
  ];

  const generateChallenge = async (language: any, challengeTitle: string) => {
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
            content: 'You are an expert coding instructor specializing in interactive programming education. Create engaging, practical coding challenges.'
          }, {
            role: 'user',
            content: `Create an interactive coding challenge for "${challengeTitle}" in ${language.title}.

Structure the challenge with:
1. Clear learning objectives
2. Problem statement with examples
3. Step-by-step solution approach
4. Code examples with explanations
5. Progressive difficulty exercises
6. Best practices and common pitfalls
7. Real-world applications
8. Advanced challenges for practice

Make it engaging and educational with hands-on coding exercises.`
          }],
          module: 'coding_academy',
          action: 'generate_code',
          metadata: {
            problem: `${challengeTitle} in ${language.title}`,
            language: language.id,
            difficulty: 'beginner'
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          let content = '';
          
          if (data.data.code && data.data.explanation) {
            // If using the structured code generation response
            content = `
## Learning Objectives
${data.data.explanation}

## Code Example
\`\`\`${language.id}
${data.data.code}
\`\`\`

## Testing
${data.data.tests ? `\`\`\`${language.id}\n${data.data.tests}\n\`\`\`` : 'Practice with the provided code examples.'}
            `;
          } else if (data.data.response) {
            // If using general chat response
            content = data.data.response;
          }

          // Validate AI response before setting challenge content
          if (!validateAIResponse(content)) {
            throw new Error('AI response failed security validation');
          }

          setCurrentChallenge({
            title: challengeTitle,
            language: language.title,
            content: content,
            languageData: language
          });
          setCodeReview('');
        } else {
          throw new Error(data.error || 'Failed to generate challenge');
        }
      } else {
        throw new Error('Failed to communicate with AI service');
      }
    } catch (error) {
      console.error('Error generating challenge:', error);
      alert('Failed to generate challenge. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCodeReview = async (reviewType: string) => {
    if (!currentChallenge) return;
    
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
            content: 'You are a senior software engineer and code reviewer with expertise in best practices, performance optimization, and security.'
          }, {
            role: 'user',
            content: `Provide a comprehensive code review for "${reviewType}" in the context of "${currentChallenge.title}" using ${currentChallenge.language}.

Include:
1. Code quality assessment
2. Performance considerations
3. Best practices recommendations
4. Security considerations
5. Refactoring suggestions
6. Testing strategies
7. Documentation guidelines

Make it educational and actionable for developers.`
          }],
          module: 'coding_academy',
          action: 'chat'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data.response) {
          // Validate AI response before setting code review
          if (!validateAIResponse(data.data.response)) {
            throw new Error('AI response failed security validation');
          }

          setCodeReview(data.data.response);
        } else {
          throw new Error(data.error || 'Failed to get code review');
        }
      } else {
        throw new Error('Failed to communicate with AI service');
      }
    } catch (error) {
      console.error('Error getting code review:', error);
      alert('Failed to get code review. Please try again.');
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
        color: 'white'
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600' }}>
          💻 Coding Bootcamp
        </h2>
        <div style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.4' }}>
          Master programming languages through hands-on challenges
        </div>
      </div>

      {!currentChallenge ? (
        /* Language Selection - Mobile First */
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {programmingLanguages.map(language => (
            <div key={language.id} style={{
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
              {/* Language Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: language.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  marginRight: '12px'
                }}>
                  {language.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    margin: '0 0 4px 0',
                    color: '#667eea',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    {language.title}
                  </h3>
                  <p style={{
                    margin: 0,
                    color: '#666',
                    fontSize: '13px',
                    lineHeight: '1.4'
                  }}>
                    {language.description}
                  </p>
                </div>
              </div>

              {/* Challenges List */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '8px'
              }}>
                {language.challenges.map((challenge, index) => (
                  <button
                    key={index}
                    onClick={() => generateChallenge(language, challenge)}
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
                        e.currentTarget.style.borderColor = '#667eea';
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
                      background: language.gradient,
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: '600',
                      textAlign: 'center',
                      lineHeight: '20px',
                      marginRight: '10px'
                    }}>
                      {index + 1}
                    </span>
                    {isLoading ? '🔄 Loading...' : challenge}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Challenge View - Mobile Optimized */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Challenge Header */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '0',
            overflow: 'hidden'
          }}>
            <div style={{
              background: currentChallenge.languageData.gradient,
              padding: '16px',
              color: 'white'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <span style={{ fontSize: '24px', marginRight: '12px' }}>
                  {currentChallenge.languageData.icon}
                </span>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>
                    {currentChallenge.title}
                  </h3>
                  <div style={{ fontSize: '13px', opacity: 0.9 }}>
                    {currentChallenge.language} • Coding Challenge
                  </div>
                </div>
              </div>
            </div>

            {/* Challenge Content */}
            <div style={{ padding: '16px' }}>
              <SafeHTML 
                content={formatContent(currentChallenge.content).html}
                type="code"
                style={{
                  fontSize: '15px',
                  lineHeight: '1.6',
                  color: '#333'
                }}
                aria-label="Coding challenge content"
                role="region"
              />
            </div>
          </div>

          {/* Code Editor Simulation */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#667eea', fontSize: '16px' }}>
              💻 Live Code Editor
            </h4>
            <div style={{
              background: '#1e1e1e',
              borderRadius: '8px',
              padding: '16px',
              fontFamily: '"Monaco", "Consolas", "Courier New", monospace',
              fontSize: '13px',
              color: '#d4d4d4',
              minHeight: '120px',
              border: '1px solid #333',
              overflowX: 'auto'
            }}>
              <div style={{ color: '#569cd6' }}>
                // {currentChallenge.language} Code Editor
              </div>
              <div style={{ color: '#dcdcaa', marginTop: '8px' }}>
                function sampleCode() {'{'}
              </div>
              <div style={{ color: '#ce9178', marginLeft: '16px', marginTop: '4px' }}>
                &nbsp;&nbsp;// Write your solution here
              </div>
              <div style={{ color: '#c586c0', marginLeft: '16px', marginTop: '4px' }}>
                &nbsp;&nbsp;return "Hello, {currentChallenge.language}!";
              </div>
              <div style={{ color: '#dcdcaa', marginTop: '4px' }}>
                {'}'}
              </div>
            </div>
          </div>

          {/* Code Review Options */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#667eea', fontSize: '16px' }}>
              🔍 AI Code Review
            </h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr',
              gap: '8px'
            }}>
              {[
                'Performance Analysis',
                'Code Quality Review',
                'Security Assessment',
                'Best Practices Check',
                'Refactoring Suggestions',
                'Testing Strategies'
              ].map(reviewType => (
                <button
                  key={reviewType}
                  onClick={() => getCodeReview(reviewType)}
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
                  {isLoading ? '🔄 Analyzing...' : '⚡ ' + reviewType}
                </button>
              ))}
            </div>

            {codeReview && (
              <div style={{
                marginTop: '16px',
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                border: '2px solid #28a745'
              }}>
                <h5 style={{ margin: '0 0 12px 0', color: '#28a745', fontSize: '14px' }}>
                  📝 AI Code Review Results
                </h5>
                <SafeHTML 
                  content={formatContent(codeReview).html}
                  type="code"
                  style={{
                    fontSize: '13px',
                    lineHeight: '1.6',
                    color: '#333'
                  }}
                  aria-label="Code review feedback"
                  role="region"
                />
              </div>
            )}
          </div>

          {/* Learning Path */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#667eea', fontSize: '16px' }}>
              📚 Next Steps
            </h4>
            <div style={{ 
              display: 'grid', 
              gap: '8px'
            }}>
              {[
                '🎯 Complete the current challenge',
                '🔧 Practice with additional exercises',
                '📖 Study advanced concepts',
                '🚀 Build a real-world project',
                '🤝 Collaborate on open source',
                '📈 Track your progress'
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
        {currentChallenge && (
          <button
            onClick={() => {
              setCurrentChallenge(null);
              setCodeReview('');
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
            ← Back to Languages
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

export default CodingBootcamp;