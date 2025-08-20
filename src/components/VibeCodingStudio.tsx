import React, { useState } from 'react';
import { textFormattingService } from '../lib/services/textFormattingService';
import SafeHTML from './SafeHTML';
import { sanitizationService } from '../lib/services/sanitizationService';

interface VibeCodingStudioProps {
  onBack: () => void;
  aiService: (messages: any[], model?: string) => Promise<{ content: string; reasoning: string; responseTime: number; }>;
}

const VibeCodingStudio: React.FC<VibeCodingStudioProps> = ({ onBack, aiService }) => {
  const [selectedProject, setSelectedProject] = useState('');
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [codeOutput, setCodeOutput] = useState('');

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

  const creativeProjects = [
    {
      id: 'game-dev',
      title: 'Game Development',
      icon: '🎮',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: 'Create interactive games with modern frameworks',
      projects: [
        'Retro Snake Game (JavaScript)',
        'Platformer Game (Unity/C#)',
        'Mobile Puzzle Game (React Native)',
        '2D Adventure Game (Godot/GDScript)',
        'Web-based RPG (HTML5 Canvas)',
        'Multiplayer Battle Game (Node.js + Socket.io)'
      ]
    },
    {
      id: 'digital-art',
      title: 'Digital Art & Animation',
      icon: '🎨',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      description: 'Code-generated art, animations, and visual effects',
      projects: [
        'Generative Art (p5.js)',
        'Interactive Data Visualization (D3.js)',
        'CSS Animation Masterpiece',
        'Fractal Art Generator (Python)',
        'Music Visualizer (WebGL)',
        'AI Art Generator Interface'
      ]
    },
    {
      id: 'web-experiences',
      title: 'Interactive Web Experiences',
      icon: '🌐',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      description: 'Engaging web apps and interactive experiences',
      projects: [
        'Personal Portfolio Website',
        'Interactive Story Platform',
        'Virtual Museum Tour',
        'Real-time Chat Application',
        'Weather Dashboard with Maps',
        'Social Media Clone'
      ]
    },
    {
      id: 'mobile-apps',
      title: 'Mobile App Development',
      icon: '📱',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      description: 'Creative mobile applications and utilities',
      projects: [
        'Photo Editor App (React Native)',
        'Fitness Tracker (Flutter)',
        'Language Learning App (Swift)',
        'AR Drawing App (ARKit)',
        'Music Creation App (Kotlin)',
        'Social Network App (React Native)'
      ]
    },
    {
      id: 'ai-creative',
      title: 'AI-Powered Creativity',
      icon: '🤖',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      description: 'Combine AI with creative coding',
      projects: [
        'AI Chatbot with Personality',
        'Image Style Transfer App',
        'Music Composition AI',
        'Poetry Generator',
        'Voice Assistant with Custom Skills',
        'AI-Generated Game Content'
      ]
    },
    {
      id: 'iot-creative',
      title: 'IoT & Physical Computing',
      icon: '🔧',
      gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      description: 'Connect the digital and physical worlds',
      projects: [
        'Smart Home Dashboard',
        'LED Art Installation (Arduino)',
        'Weather Station with Web Interface',
        'Motion-Triggered Camera',
        'Voice-Controlled RGB Lighting',
        'Plant Care Monitoring System'
      ]
    }
  ];

  const generateProject = async (category: any, projectTitle: string) => {
    setIsLoading(true);
    try {
      const response = await aiService([{
        id: 'vibe-coding-project',
        role: 'user',
        content: `Create a detailed, creative coding project guide for "${projectTitle}" in the ${category.title} category.

Include:
1. Project overview and creative vision
2. Technologies and tools needed
3. Step-by-step implementation guide
4. Code examples and snippets
5. Creative enhancements and variations
6. Deployment and sharing options
7. Next level improvements

Make it inspiring, practical, and fun! Focus on the creative aspects and unique features that make this project exciting.`,
        timestamp: new Date()
      }], 'llama-3.3-70b-versatile');

      // Validate AI response before setting project content
      if (!validateAIResponse(response.content)) {
        throw new Error('AI response failed security validation');
      }

      setCurrentProject({
        title: projectTitle,
        category: category.title,
        content: response.content,
        categoryData: category
      });
    } catch (error) {
      console.error('Error generating project:', error);
      alert('Failed to generate project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateCodeExample = async (feature: string) => {
    if (!currentProject) return;
    
    setIsLoading(true);
    try {
      const response = await aiService([{
        id: 'vibe-code-example',
        role: 'user',
        content: `Generate a creative code example for "${feature}" in the context of the project "${currentProject.title}".

Provide:
1. Well-commented, creative code
2. Explanation of how it works
3. Visual or interactive elements
4. Customization options
5. Performance considerations
6. Creative variations to try

Make the code inspiring and educational with a focus on creativity and fun!`,
        timestamp: new Date()
      }], 'llama-3.3-70b-versatile');

      // Validate AI response before setting code output
      if (!validateAIResponse(response.content)) {
        throw new Error('AI response failed security validation');
      }

      setCodeOutput(response.content);
    } catch (error) {
      console.error('Error generating code:', error);
      alert('Failed to generate code example. Please try again.');
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
          🎮 Vibe Coding Studio
        </h2>
        <div style={{ fontSize: '16px', opacity: 0.9 }}>
          Creative coding for games, art, and interactive experiences
        </div>
      </div>

      {!currentProject ? (
        /* Project Category Selection */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {creativeProjects.map(category => (
            <div key={category.id} style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '24px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              overflow: 'hidden',
              position: 'relative'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              {/* Gradient Header */}
              <div style={{
                background: category.gradient,
                margin: '-24px -24px 16px -24px',
                padding: '20px 24px',
                color: 'white'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '32px', marginRight: '12px' }}>
                    {category.icon}
                  </span>
                  <h3 style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: '600'
                  }}>
                    {category.title}
                  </h3>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  opacity: 0.9
                }}>
                  {category.description}
                </p>
              </div>

              {/* Projects List */}
              <div style={{
                display: 'grid',
                gap: '8px'
              }}>
                {category.projects.map((project, index) => (
                  <button
                    key={index}
                    onClick={() => generateProject(category, project)}
                    disabled={isLoading}
                    style={{
                      background: isLoading ? '#f5f5f5' : 'white',
                      border: '2px solid transparent',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      backgroundImage: !isLoading ? category.gradient : 'none',
                      backgroundClip: !isLoading ? 'text' : 'initial',
                      WebkitBackgroundClip: !isLoading ? 'text' : 'initial',
                      color: isLoading ? '#999' : 'transparent'
                    }}
                    onMouseOver={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.borderColor = '#667eea';
                        e.currentTarget.style.color = '#667eea';
                        e.currentTarget.style.backgroundImage = 'none';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.backgroundImage = category.gradient;
                        e.currentTarget.style.backgroundClip = 'text';
                        e.currentTarget.style.webkitBackgroundClip = 'text';
                        e.currentTarget.style.color = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    {isLoading ? '🔄 Loading...' : `${index + 1}. ${project}`}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Project View */
        <div>
          {/* Project Description */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '20px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: currentProject.categoryData.gradient,
              margin: '-24px -24px 20px -24px',
              padding: '20px 24px',
              color: 'white'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '32px', marginRight: '12px' }}>
                  {currentProject.categoryData.icon}
                </span>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '22px' }}>
                    {currentProject.title}
                  </h3>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>
                    {currentProject.category} Project
                  </div>
                </div>
              </div>
            </div>
            
            <SafeHTML 
              content={formatContent(currentProject.content).html}
              type="code"
              style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#333'
              }}
              aria-label="Creative project content"
              role="region"
            />
          </div>

          {/* Code Examples */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 16px 0', color: '#667eea' }}>
              💻 Generate Code Examples
            </h4>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {[
                'Core Functionality',
                'User Interface',
                'Interactive Features',
                'Visual Effects',
                'Data Handling',
                'Advanced Features'
              ].map(feature => (
                <button
                  key={feature}
                  onClick={() => generateCodeExample(feature)}
                  disabled={isLoading}
                  style={{
                    background: isLoading ? '#ccc' : currentProject.categoryData.gradient,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? '🔄' : '⚡'} {feature}
                </button>
              ))}
            </div>

            {codeOutput && (
              <div style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                border: '2px solid #667eea'
              }}>
                <h5 style={{ margin: '0 0 12px 0', color: '#667eea' }}>
                  ✨ Generated Code Example
                </h5>
                <SafeHTML 
                  content={formatContent(codeOutput).html}
                  type="code"
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#333',
                    fontFamily: '"Monaco", "Consolas", "Courier New", monospace'
                  }}
                  aria-label="Generated code example"
                  role="region"
                />
              </div>
            )}
          </div>

          {/* Creative Challenges */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 16px 0', color: '#667eea' }}>
              🎯 Creative Challenges
            </h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                '🎨 Add a unique visual twist',
                '⚡ Implement a performance optimization',
                '🔊 Add sound effects or music',
                '📱 Make it mobile-responsive',
                '🌐 Add multiplayer functionality',
                '🤖 Integrate AI features'
              ].map((challenge, index) => (
                <div key={index} style={{
                  background: '#f8f9fa',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  borderLeft: '4px solid #667eea'
                }}>
                  {challenge}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {currentProject && (
          <button
            onClick={() => {
              setCurrentProject(null);
              setCodeOutput('');
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#667eea',
              border: '1px solid #667eea',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ← Back to Projects
          </button>
        )}
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#667eea',
            border: '1px solid #667eea',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Back to I.T Tools
        </button>
      </div>
    </div>
  );
};

export default VibeCodingStudio;