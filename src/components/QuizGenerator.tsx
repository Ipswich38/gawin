'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/Button';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
}

interface QuizGeneratorProps {
  onMinimize?: () => void;
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ onMinimize }) => {
  const [currentScreen, setCurrentScreen] = useState<'setup' | 'quiz' | 'results'>('setup');
  const [selectedTopic, setSelectedTopic] = useState('mathematics');
  const [selectedQuestions, setSelectedQuestions] = useState(10);
  const [timeLimit, setTimeLimit] = useState(15); // minutes
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [score, setScore] = useState(0);
  const [showExplanations, setShowExplanations] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 400, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [preFullScreenState, setPreFullScreenState] = useState({ position: { x: 0, y: 0 }, size: { width: 400, height: 600 } });
  const containerRef = useRef<HTMLDivElement>(null);

  // Add CSS to hide scrollbars
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize position (center of screen)
  useEffect(() => {
    const updatePosition = () => {
      const padding = 20;
      setPosition({
        x: Math.max(padding, (window.innerWidth - size.width) / 2),
        y: Math.max(padding, (window.innerHeight - size.height) / 2)
      });
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [size.width, size.height]);

  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.resize-handle')) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && !isFullScreen) {
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    }
    
    if (isResizing && !isFullScreen) {
      let newSize = { ...size };
      let newPosition = { ...position };
      
      if (resizeDirection.includes('right')) {
        newSize.width = Math.max(300, Math.min(800, e.clientX - position.x));
      }
      if (resizeDirection.includes('left')) {
        const newWidth = Math.max(300, Math.min(800, position.x + size.width - e.clientX));
        newPosition.x = Math.max(0, e.clientX);
        newSize.width = newWidth;
      }
      if (resizeDirection.includes('bottom')) {
        newSize.height = Math.max(400, Math.min(900, e.clientY - position.y));
      }
      if (resizeDirection.includes('top')) {
        const newHeight = Math.max(400, Math.min(900, position.y + size.height - e.clientY));
        newPosition.y = Math.max(0, e.clientY);
        newSize.height = newHeight;
      }
      
      setSize(newSize);
      setPosition(newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection('');
  };

  const toggleFullScreen = () => {
    if (isFullScreen) {
      // Exit full screen
      setPosition(preFullScreenState.position);
      setSize(preFullScreenState.size);
      setIsFullScreen(false);
    } else {
      // Enter full screen
      setPreFullScreenState({ position, size });
      setPosition({ x: 20, y: 20 });
      setSize({ width: window.innerWidth - 40, height: window.innerHeight - 40 });
      setIsFullScreen(true);
    }
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, size]);

  const topics = [
    { id: 'mathematics', name: 'Mathematics', icon: '📐', description: 'Algebra, Calculus, Geometry, Statistics' },
    { id: 'physics', name: 'Physics', icon: '⚛️', description: 'Mechanics, Thermodynamics, Electromagnetism' },
    { id: 'chemistry', name: 'Chemistry', icon: '🧪', description: 'Organic, Inorganic, Physical Chemistry' },
    { id: 'biology', name: 'Biology', icon: '🧬', description: 'Cell Biology, Genetics, Ecology, Physiology' },
    { id: 'computer_science', name: 'Computer Science', icon: '💻', description: 'Programming, Algorithms, Data Structures' },
    { id: 'engineering', name: 'Engineering', icon: '⚙️', description: 'Mechanical, Electrical, Civil Engineering' }
  ];

  const questionCounts = [5, 10, 15, 20];

  // Timer effect
  useEffect(() => {
    if (currentScreen === 'quiz' && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && currentScreen === 'quiz') {
      // Time's up - finish quiz
      finishQuiz();
    }
  }, [timeRemaining, currentScreen]);

  const generateQuiz = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Generate ${selectedQuestions} multiple-choice questions about ${selectedTopic} for a quiz. 
              
              Requirements:
              - Mix of Easy (40%), Medium (40%), and Hard (20%) difficulty levels
              - Each question should have 4 options (A, B, C, D)
              - Include detailed explanations for correct answers
              - Format as JSON array with this structure:
              {
                "questions": [
                  {
                    "question": "question text",
                    "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
                    "correctAnswer": 0,
                    "explanation": "detailed explanation",
                    "difficulty": "Easy|Medium|Hard",
                    "topic": "${selectedTopic}"
                  }
                ]
              }
              
              Return only the JSON, no additional text.`
            }
          ],
          action: 'analysis'
        }),
      });

      const data = await response.json();
      
      if (data.success && data.data?.response) {
        try {
          // Try to parse the JSON response
          const jsonResponse = JSON.parse(data.data.response);
          const generatedQuestions = jsonResponse.questions.map((q: any, index: number) => ({
            id: `q_${index}`,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            topic: q.topic
          }));
          
          setQuestions(generatedQuestions);
          setUserAnswers(new Array(generatedQuestions.length).fill(-1));
          setTimeRemaining(timeLimit * 60); // Convert minutes to seconds
          setCurrentScreen('quiz');
        } catch (parseError) {
          console.error('Failed to parse quiz questions:', parseError);
          // Fallback to sample questions
          generateSampleQuestions();
        }
      } else {
        generateSampleQuestions();
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      generateSampleQuestions();
    }
    setIsGenerating(false);
  };

  const generateSampleQuestions = () => {
    const sampleQuestions: QuizQuestion[] = [
      {
        id: 'q_1',
        question: 'What is the derivative of f(x) = x² + 3x + 5?',
        options: ['A. 2x + 3', 'B. x² + 3', 'C. 2x + 5', 'D. x + 3'],
        correctAnswer: 0,
        explanation: 'Using the power rule, the derivative of x² is 2x, the derivative of 3x is 3, and the derivative of a constant is 0. Therefore, f\'(x) = 2x + 3.',
        difficulty: 'Easy',
        topic: selectedTopic
      },
      {
        id: 'q_2',
        question: 'In physics, what is the unit of force?',
        options: ['A. Joule', 'B. Newton', 'C. Watt', 'D. Pascal'],
        correctAnswer: 1,
        explanation: 'The Newton (N) is the SI unit of force, defined as the force required to accelerate a mass of one kilogram at a rate of one meter per second squared.',
        difficulty: 'Easy',
        topic: selectedTopic
      }
    ];
    
    setQuestions(sampleQuestions.slice(0, selectedQuestions));
    setUserAnswers(new Array(Math.min(selectedQuestions, sampleQuestions.length)).fill(-1));
    setTimeRemaining(timeLimit * 60);
    setCurrentScreen('quiz');
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const finishQuiz = () => {
    const correctAnswers = userAnswers.filter((answer, index) => 
      answer === questions[index]?.correctAnswer
    ).length;
    setScore(Math.round((correctAnswers / questions.length) * 100));
    setCurrentScreen('results');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const restartQuiz = () => {
    setCurrentScreen('setup');
    setCurrentQuestion(0);
    setUserAnswers([]);
    setScore(0);
    setTimeRemaining(0);
    setShowExplanations(false);
  };

  if (currentScreen === 'setup') {
    return (
      <div 
        className="fixed z-50"
        style={isMobile ? {
          // Mobile: Fixed full screen overlay
          inset: 0,
          width: '100%',
          height: '100%'
        } : {
          // Desktop: Draggable and resizable
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height
        }}
      >
        {isMobile && <div className="fixed inset-0 bg-black/50" />}
        
        <div 
          ref={containerRef}
          className={`w-full h-full flex flex-col bg-white border border-gray-200 overflow-hidden ${isMobile ? '' : 'cursor-move'}`}
          style={{ 
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
          }}
          onMouseDown={isMobile ? undefined : handleMouseDown}
        >
          {/* Compact Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-green-100 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-700">Quiz</span>
                <span className="text-xs text-gray-500">STEM practice</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Full Screen Icon */}
              {!isMobile && (
                <div className="group relative">
                  <button 
                    onClick={toggleFullScreen}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:scale-105 transition-all hover:bg-gray-50"
                    aria-label={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                  >
                    {isFullScreen ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                      </svg>
                    )}
                  </button>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {isFullScreen ? 'Exit' : 'Focus'}
                  </div>
                </div>
              )}
              
              {/* Minimize Icon */}
              {!isMobile && onMinimize && (
                <div className="group relative">
                  <button 
                    onClick={onMinimize}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:scale-105 transition-all hover:bg-gray-50"
                    aria-label="Minimize Panel"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9,11 12,14 15,11"></polyline>
                    </svg>
                  </button>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Hide
                  </div>
                </div>
              )}
              
              {/* Close Icon */}
              <div className="group relative">
                <button 
                  onClick={onMinimize}
                  className="w-8 h-8 rounded-lg bg-white border border-red-200 flex items-center justify-center text-red-500 hover:text-red-700 hover:scale-105 transition-all hover:bg-red-50"
                  aria-label="Close Panel"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white/70 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Close
                </div>
              </div>
            </div>
          </div>

          {/* Setup Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-6 space-y-8">
            {/* Topic Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Your Topic</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topics.map(topic => (
                  <div
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedTopic === topic.id 
                        ? 'border-orange-300 bg-orange-50 shadow-sm' 
                        : 'border-gray-200 hover:border-orange-200 hover:bg-orange-25 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{topic.icon}</span>
                      <div>
                        <div className="font-semibold text-gray-800">{topic.name}</div>
                        <div className="text-xs text-gray-600">{topic.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Number of Questions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {questionCounts.map(count => (
                    <button
                      key={count}
                      onClick={() => setSelectedQuestions(count)}
                      className={`p-3 rounded-lg border transition-all ${
                        selectedQuestions === count
                          ? 'border-green-300 bg-green-50 text-gray-800 shadow-sm'
                          : 'border-gray-200 text-gray-700 hover:border-green-200 hover:bg-green-25 hover:shadow-sm'
                      }`}
                    >
                      {count} Questions
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Time Limit</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[10, 15, 20, 30].map(minutes => (
                    <button
                      key={minutes}
                      onClick={() => setTimeLimit(minutes)}
                      className={`p-3 rounded-lg border transition-all ${
                        timeLimit === minutes
                          ? 'border-orange-300 bg-orange-50 text-gray-800 shadow-sm'
                          : 'border-gray-200 text-gray-700 hover:border-orange-200 hover:bg-orange-25 hover:shadow-sm'
                      }`}
                    >
                      {minutes} min
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Start Button */}
            <div className="flex justify-center pt-4">
              <Button 
                variant="primary"
                onClick={generateQuiz}
                disabled={isGenerating}
                isLoading={isGenerating}
                className="px-8 py-4 text-lg"
              >
                {isGenerating ? 'Generating Quiz...' : '🚀 Start Quiz'}
              </Button>
            </div>
            </div>
          </div>
          
          {/* Resize Handles - Desktop only */}
          {!isMobile && !isFullScreen && (
            <>
              {/* Corner Handles */}
              <div 
                className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('bottom-right');
                }}
                style={{
                  background: 'linear-gradient(-45deg, transparent 30%, rgba(251, 146, 60, 0.3) 30%, rgba(251, 146, 60, 0.3) 70%, transparent 70%)',
                  backgroundSize: '6px 6px'
                }}
              />
              <div 
                className="resize-handle absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('bottom-left');
                }}
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(251, 146, 60, 0.3) 30%, rgba(251, 146, 60, 0.3) 70%, transparent 70%)',
                  backgroundSize: '6px 6px'
                }}
              />
              <div 
                className="resize-handle absolute top-0 right-0 w-4 h-4 cursor-ne-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('top-right');
                }}
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(251, 146, 60, 0.3) 30%, rgba(251, 146, 60, 0.3) 70%, transparent 70%)',
                  backgroundSize: '6px 6px'
                }}
              />
              <div 
                className="resize-handle absolute top-0 left-0 w-4 h-4 cursor-nw-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('top-left');
                }}
                style={{
                  background: 'linear-gradient(-45deg, transparent 30%, rgba(251, 146, 60, 0.3) 30%, rgba(251, 146, 60, 0.3) 70%, transparent 70%)',
                  backgroundSize: '6px 6px'
                }}
              />
              
              {/* Edge Handles */}
              <div 
                className="resize-handle absolute top-0 left-4 right-4 h-2 cursor-n-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('top');
                }}
                style={{
                  background: 'linear-gradient(to bottom, rgba(251, 146, 60, 0.3) 0%, transparent 100%)'
                }}
              />
              <div 
                className="resize-handle absolute bottom-0 left-4 right-4 h-2 cursor-s-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('bottom');
                }}
                style={{
                  background: 'linear-gradient(to top, rgba(251, 146, 60, 0.3) 0%, transparent 100%)'
                }}
              />
              <div 
                className="resize-handle absolute left-0 top-4 bottom-4 w-2 cursor-w-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('left');
                }}
                style={{
                  background: 'linear-gradient(to right, rgba(251, 146, 60, 0.3) 0%, transparent 100%)'
                }}
              />
              <div 
                className="resize-handle absolute right-0 top-4 bottom-4 w-2 cursor-e-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('right');
                }}
                style={{
                  background: 'linear-gradient(to left, rgba(251, 146, 60, 0.3) 0%, transparent 100%)'
                }}
              />
            </>
          )}
        </div>
      </div>
    );
  }

  if (currentScreen === 'quiz') {
    const currentQ = questions[currentQuestion];
    if (!currentQ) return null;

    return (
      <div 
        className="fixed z-50"
        style={isMobile ? {
          // Mobile: Fixed full screen overlay
          inset: 0,
          width: '100%',
          height: '100%'
        } : {
          // Desktop: Draggable and resizable
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height
        }}
      >
        {isMobile && <div className="fixed inset-0 bg-black/50" />}
        
        <div 
          ref={containerRef}
          className={`w-full h-full flex flex-col bg-white border border-gray-200 overflow-hidden ${isMobile ? '' : 'cursor-move'}`}
          style={{ 
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
          }}
          onMouseDown={isMobile ? undefined : handleMouseDown}
        >
          {/* Quiz Header - Mobile First Design */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                <span className="text-white text-sm">🧠</span>
              </div>
              <div className="flex flex-col">
                <div className="text-xs font-bold text-gray-800 leading-tight">
                  Q{currentQuestion + 1}/{questions.length}
                </div>
                <div className="text-xs text-gray-500 leading-tight">{currentQ.difficulty}</div>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-mono ${
                timeRemaining < 120 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-50 text-gray-700 border border-gray-200'
              }`}>
                {formatTime(timeRemaining)}
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Full Screen Icon */}
              {!isMobile && (
                <div className="group relative">
                  <button 
                    onClick={toggleFullScreen}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:scale-105 transition-all hover:bg-gray-50"
                    aria-label={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                  >
                    {isFullScreen ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                      </svg>
                    )}
                  </button>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {isFullScreen ? 'Exit' : 'Focus'}
                  </div>
                </div>
              )}
              
              {/* Minimize Icon */}
              {!isMobile && onMinimize && (
                <div className="group relative">
                  <button 
                    onClick={onMinimize}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:scale-105 transition-all hover:bg-gray-50"
                    aria-label="Minimize Panel"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9,11 12,14 15,11"></polyline>
                    </svg>
                  </button>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Hide
                  </div>
                </div>
              )}
              
              {/* Exit Quiz Icon */}
              <div className="group relative">
                <button 
                  onClick={restartQuiz}
                  className="w-8 h-8 rounded-lg bg-white border border-red-200 flex items-center justify-center text-red-500 hover:text-red-700 hover:scale-105 transition-all hover:bg-red-50"
                  aria-label="Exit Quiz"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16,17 21,12 16,7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </button>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white/70 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Exit
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 h-1">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-400 h-1 transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-6 flex flex-col justify-center">
            <div className="max-w-3xl mx-auto w-full">
              <h2 className="text-xl font-semibold text-gray-800 mb-8 leading-relaxed">
                {currentQ.question}
              </h2>
              
              <div className="space-y-4">
                {currentQ.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 rounded-xl border transition-all text-left ${
                      userAnswers[currentQuestion] === index
                        ? 'border-blue-300 bg-blue-50 text-gray-800 shadow-sm'
                        : 'border-gray-200 text-gray-700 hover:border-blue-200 hover:bg-blue-25 hover:shadow-sm'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
          </div>

          {/* Navigation */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <Button 
              variant="ghost" 
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
            >
              ← Previous
            </Button>
            
            <div className="text-gray-600 text-sm">
              {userAnswers.filter(a => a !== -1).length} of {questions.length} answered
            </div>
            
            {currentQuestion === questions.length - 1 ? (
              <Button 
                variant="primary" 
                onClick={finishQuiz}
                disabled={userAnswers[currentQuestion] === -1}
              >
                Finish Quiz
              </Button>
            ) : (
              <Button 
                variant="primary" 
                onClick={nextQuestion}
                disabled={userAnswers[currentQuestion] === -1}
              >
                Next →
              </Button>
            )}
          </div>
          
          {/* Resize Handles - Desktop only */}
          {!isMobile && !isFullScreen && (
            <>
              {/* Corner Handles */}
              <div 
                className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('bottom-right');
                }}
                style={{
                  background: 'linear-gradient(-45deg, transparent 30%, rgba(251, 146, 60, 0.3) 30%, rgba(251, 146, 60, 0.3) 70%, transparent 70%)',
                  backgroundSize: '6px 6px'
                }}
              />
              <div 
                className="resize-handle absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('bottom-left');
                }}
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(251, 146, 60, 0.3) 30%, rgba(251, 146, 60, 0.3) 70%, transparent 70%)',
                  backgroundSize: '6px 6px'
                }}
              />
              <div 
                className="resize-handle absolute top-0 right-0 w-4 h-4 cursor-ne-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('top-right');
                }}
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(251, 146, 60, 0.3) 30%, rgba(251, 146, 60, 0.3) 70%, transparent 70%)',
                  backgroundSize: '6px 6px'
                }}
              />
              <div 
                className="resize-handle absolute top-0 left-0 w-4 h-4 cursor-nw-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('top-left');
                }}
                style={{
                  background: 'linear-gradient(-45deg, transparent 30%, rgba(251, 146, 60, 0.3) 30%, rgba(251, 146, 60, 0.3) 70%, transparent 70%)',
                  backgroundSize: '6px 6px'
                }}
              />
              
              {/* Edge Handles */}
              <div 
                className="resize-handle absolute top-0 left-4 right-4 h-2 cursor-n-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('top');
                }}
                style={{
                  background: 'linear-gradient(to bottom, rgba(251, 146, 60, 0.3) 0%, transparent 100%)'
                }}
              />
              <div 
                className="resize-handle absolute bottom-0 left-4 right-4 h-2 cursor-s-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('bottom');
                }}
                style={{
                  background: 'linear-gradient(to top, rgba(251, 146, 60, 0.3) 0%, transparent 100%)'
                }}
              />
              <div 
                className="resize-handle absolute left-0 top-4 bottom-4 w-2 cursor-w-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('left');
                }}
                style={{
                  background: 'linear-gradient(to right, rgba(251, 146, 60, 0.3) 0%, transparent 100%)'
                }}
              />
              <div 
                className="resize-handle absolute right-0 top-4 bottom-4 w-2 cursor-e-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('right');
                }}
                style={{
                  background: 'linear-gradient(to left, rgba(251, 146, 60, 0.3) 0%, transparent 100%)'
                }}
              />
            </>
          )}
        </div>
      </div>
    );
  }

  if (currentScreen === 'results') {
    const correctAnswers = userAnswers.filter((answer, index) => 
      answer === questions[index]?.correctAnswer
    ).length;

    return (
      <div 
        className="fixed z-50"
        style={isMobile ? {
          // Mobile: Fixed full screen overlay
          inset: 0,
          width: '100%',
          height: '100%'
        } : {
          // Desktop: Draggable and resizable
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height
        }}
      >
        {isMobile && <div className="fixed inset-0 bg-black/50" />}
        
        <div 
          ref={containerRef}
          className={`w-full h-full flex flex-col bg-white border border-gray-200 overflow-hidden ${isMobile ? '' : 'cursor-move'}`}
          style={{ 
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
          }}
          onMouseDown={isMobile ? undefined : handleMouseDown}
        >
          {/* Results Header - Mobile First Design */}
          <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm">🏆</span>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-sm font-bold text-gray-800 leading-tight">Quiz Complete</h2>
                  <span className="text-xs text-gray-500 leading-tight">Results Ready</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                {/* Full Screen Icon */}
                {!isMobile && (
                  <div className="group relative">
                    <button 
                      onClick={toggleFullScreen}
                      className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:scale-105 transition-all hover:bg-gray-50"
                      aria-label={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                    >
                      {isFullScreen ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/>
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                        </svg>
                      )}
                    </button>
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {isFullScreen ? 'Exit' : 'Focus'}
                    </div>
                  </div>
                )}
                
                {/* Minimize Icon */}
                {!isMobile && onMinimize && (
                  <div className="group relative">
                    <button 
                      onClick={onMinimize}
                      className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:scale-105 transition-all hover:bg-gray-50"
                      aria-label="Minimize Panel"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9,11 12,14 15,11"></polyline>
                      </svg>
                    </button>
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Hide
                    </div>
                  </div>
                )}
                
                {/* Close Icon */}
                <div className="group relative">
                  <button 
                    onClick={onMinimize}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:scale-105 transition-all hover:bg-gray-50"
                    aria-label="Close Panel"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Close
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">
                {score >= 80 ? '🎉' : score >= 60 ? '👍' : '📚'}
              </div>
              <div className="text-3xl font-bold text-green-400 mb-2">{score}%</div>
              <div className="text-gray-600">
                {correctAnswers} out of {questions.length} correct answers
              </div>
            </div>
          </div>

          {/* Performance Analysis */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-gray-600 text-sm">Correct</div>
              </div>
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="text-2xl font-bold text-red-600">{questions.length - correctAnswers}</div>
                <div className="text-gray-600 text-sm">Incorrect</div>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{Math.round((timeLimit * 60 - timeRemaining) / 60)}</div>
                <div className="text-gray-600 text-sm">Minutes Used</div>
              </div>
            </div>
          </div>

          {/* Review Section */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Review Questions</h3>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExplanations(!showExplanations)}
                >
                  {showExplanations ? 'Hide' : 'Show'} Explanations
                </Button>
              </div>

              <div className="space-y-4">
                {questions.map((question, index) => {
                const userAnswer = userAnswers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <div key={question.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {isCorrect ? '✓' : '✗'}
                      </div>
                      <div className="flex-1">
                        <div className="text-gray-800 font-medium mb-2">
                          {index + 1}. {question.question}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Your answer: {userAnswer !== -1 ? question.options[userAnswer] : 'Not answered'}
                        </div>
                        {!isCorrect && (
                          <div className="text-sm text-green-600 mb-2">
                            Correct answer: {question.options[question.correctAnswer]}
                          </div>
                        )}
                        
                        {showExplanations && (
                          <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                            <div className="text-sm font-medium text-blue-600 mb-1">Explanation:</div>
                            <div className="text-sm text-gray-700">{question.explanation}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-center space-x-4">
            <Button variant="outline" onClick={restartQuiz}>
              Take Another Quiz
            </Button>
            <Button variant="primary" onClick={isMobile ? onMinimize : onMinimize}>
              Close
            </Button>
          </div>
          
          {/* Resize Handles - Desktop only */}
          {!isMobile && !isFullScreen && (
            <>
              {/* Corner Handles */}
              <div 
                className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('bottom-right');
                }}
                style={{
                  background: 'linear-gradient(-45deg, transparent 30%, rgba(251, 146, 60, 0.3) 30%, rgba(251, 146, 60, 0.3) 70%, transparent 70%)',
                  backgroundSize: '6px 6px'
                }}
              />
              <div 
                className="resize-handle absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('bottom-left');
                }}
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(251, 146, 60, 0.3) 30%, rgba(251, 146, 60, 0.3) 70%, transparent 70%)',
                  backgroundSize: '6px 6px'
                }}
              />
              <div 
                className="resize-handle absolute top-0 right-0 w-4 h-4 cursor-ne-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('top-right');
                }}
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(251, 146, 60, 0.3) 30%, rgba(251, 146, 60, 0.3) 70%, transparent 70%)',
                  backgroundSize: '6px 6px'
                }}
              />
              <div 
                className="resize-handle absolute top-0 left-0 w-4 h-4 cursor-nw-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('top-left');
                }}
                style={{
                  background: 'linear-gradient(-45deg, transparent 30%, rgba(251, 146, 60, 0.3) 30%, rgba(251, 146, 60, 0.3) 70%, transparent 70%)',
                  backgroundSize: '6px 6px'
                }}
              />
              
              {/* Edge Handles */}
              <div 
                className="resize-handle absolute top-0 left-4 right-4 h-2 cursor-n-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('top');
                }}
                style={{
                  background: 'linear-gradient(to bottom, rgba(251, 146, 60, 0.3) 0%, transparent 100%)'
                }}
              />
              <div 
                className="resize-handle absolute bottom-0 left-4 right-4 h-2 cursor-s-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('bottom');
                }}
                style={{
                  background: 'linear-gradient(to top, rgba(251, 146, 60, 0.3) 0%, transparent 100%)'
                }}
              />
              <div 
                className="resize-handle absolute left-0 top-4 bottom-4 w-2 cursor-w-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('left');
                }}
                style={{
                  background: 'linear-gradient(to right, rgba(251, 146, 60, 0.3) 0%, transparent 100%)'
                }}
              />
              <div 
                className="resize-handle absolute right-0 top-4 bottom-4 w-2 cursor-e-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('right');
                }}
                style={{
                  background: 'linear-gradient(to left, rgba(251, 146, 60, 0.3) 0%, transparent 100%)'
                }}
              />
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default QuizGenerator;