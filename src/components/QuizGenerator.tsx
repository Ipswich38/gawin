'use client';

import React, { useState, useEffect, useRef } from 'react';

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
  const [timeLimit, setTimeLimit] = useState(15);
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
      setPosition(preFullScreenState.position);
      setSize(preFullScreenState.size);
      setIsFullScreen(false);
    } else {
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
    { id: 'mathematics', name: 'Mathematics' },
    { id: 'physics', name: 'Physics' },
    { id: 'chemistry', name: 'Chemistry' },
    { id: 'biology', name: 'Biology' },
    { id: 'computer_science', name: 'Computer Science' },
    { id: 'engineering', name: 'Engineering' }
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
          setTimeRemaining(timeLimit * 60);
          setCurrentScreen('quiz');
        } catch (parseError) {
          console.error('Failed to parse quiz questions:', parseError);
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
          inset: 0,
          width: '100%',
          height: '100%'
        } : {
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height
        }}
      >
        {isMobile && <div className="fixed inset-0 bg-black/50" />}
        
        <div 
          ref={containerRef}
          className={`w-full h-full flex flex-col border border-gray-200 rounded-3xl overflow-hidden ${isMobile ? '' : 'cursor-move'}`}
          style={{ backgroundColor: '#435b67' }}
          onMouseDown={isMobile ? undefined : handleMouseDown}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs">?</span>
                </div>
                <div>
                  <div className="font-medium text-white text-sm">Quiz Generator</div>
                  <div className="text-xs text-gray-300">STEM practice tests</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                {!isMobile && (
                  <button
                    onClick={toggleFullScreen}
                    className="w-6 h-6 text-gray-300 hover:text-white"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                    </svg>
                  </button>
                )}
                
                <button
                  onClick={onMinimize}
                  className="w-6 h-6 text-gray-400 hover:text-gray-600"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Setup Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-hide">
            {/* Topic Selection */}
            <div>
              <h3 className="text-sm font-medium text-white mb-2">Choose Your Topic</h3>
              <div className="grid grid-cols-2 gap-2">
                {topics.map(topic => (
                  <div
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`p-2 rounded-2xl border cursor-pointer text-sm ${
                      selectedTopic === topic.id 
                        ? 'border-orange-300 bg-orange-500 text-white' 
                        : 'border-gray-400 hover:border-orange-400 bg-gray-600 text-white'
                    }`}
                  >
                    {topic.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-white mb-2">Questions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {questionCounts.map(count => (
                    <button
                      key={count}
                      onClick={() => setSelectedQuestions(count)}
                      className={`p-2 rounded-2xl border text-sm ${
                        selectedQuestions === count
                          ? 'border-green-300 bg-green-500 text-white'
                          : 'border-gray-400 hover:border-green-400 bg-gray-600 text-white'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white mb-2">Time Limit</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[10, 15, 20, 30].map(minutes => (
                    <button
                      key={minutes}
                      onClick={() => setTimeLimit(minutes)}
                      className={`p-2 rounded-2xl border text-sm ${
                        timeLimit === minutes
                          ? 'border-orange-300 bg-orange-500 text-white'
                          : 'border-gray-400 hover:border-orange-400 bg-gray-600 text-white'
                      }`}
                    >
                      {minutes}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-2">
              <button 
                onClick={generateQuiz}
                disabled={isGenerating}
                className="w-full px-4 py-3 bg-orange-500 text-white rounded-3xl disabled:opacity-50 font-medium"
              >
                {isGenerating ? 'Generating Quiz...' : 'Start Quiz'}
              </button>
            </div>
          </div>
          
          {/* Resize Handles */}
          {!isMobile && !isFullScreen && (
            <>
              <div 
                className="resize-handle absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('bottom-right');
                }}
              />
              <div 
                className="resize-handle absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('bottom-left');
                }}
              />
              <div 
                className="resize-handle absolute top-0 right-0 w-3 h-3 cursor-ne-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('top-right');
                }}
              />
              <div 
                className="resize-handle absolute top-0 left-0 w-3 h-3 cursor-nw-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('top-left');
                }}
              />
              <div 
                className="resize-handle absolute top-0 left-3 right-3 h-1 cursor-n-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('top');
                }}
              />
              <div 
                className="resize-handle absolute bottom-0 left-3 right-3 h-1 cursor-s-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('bottom');
                }}
              />
              <div 
                className="resize-handle absolute left-0 top-3 bottom-3 w-1 cursor-w-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('left');
                }}
              />
              <div 
                className="resize-handle absolute right-0 top-3 bottom-3 w-1 cursor-e-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('right');
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
          inset: 0,
          width: '100%',
          height: '100%'
        } : {
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height
        }}
      >
        {isMobile && <div className="fixed inset-0 bg-black/50" />}
        
        <div 
          ref={containerRef}
          className={`w-full h-full flex flex-col border border-gray-200 rounded-3xl overflow-hidden ${isMobile ? '' : 'cursor-move'}`}
          style={{ backgroundColor: '#435b67' }}
          onMouseDown={isMobile ? undefined : handleMouseDown}
        >
          {/* Quiz Header */}
          <div className="px-3 py-2 border-b border-gray-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs">?</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    Q{currentQuestion + 1}/{questions.length}
                  </div>
                  <div className="text-xs text-gray-500">{formatTime(timeRemaining)}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                {!isMobile && (
                  <button
                    onClick={toggleFullScreen}
                    className="w-6 h-6 text-gray-300 hover:text-white"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                    </svg>
                  </button>
                )}
                
                <button
                  onClick={restartQuiz}
                  className="w-6 h-6 text-gray-400 hover:text-gray-600"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 h-1">
            <div 
              className="bg-orange-500 h-1 transition-all"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Content */}
          <div className="flex-1 overflow-y-auto p-3 scrollbar-hide">
            <div className="mb-4">
              <h2 className="text-sm font-medium text-white mb-3">
                {currentQ.question}
              </h2>
              
              <div className="space-y-2">
                {currentQ.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-3 rounded border text-left text-sm ${
                      userAnswers[currentQuestion] === index
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-3 border-t border-gray-100 flex justify-between items-center">
            <button 
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              className="px-3 py-1 text-sm text-gray-400 disabled:opacity-50"
            >
              ← Previous
            </button>
            
            <div className="text-xs text-gray-500">
              {userAnswers.filter(a => a !== -1).length}/{questions.length}
            </div>
            
            {currentQuestion === questions.length - 1 ? (
              <button 
                onClick={finishQuiz}
                disabled={userAnswers[currentQuestion] === -1}
                className="px-3 py-1 bg-orange-500 text-white text-sm rounded-2xl disabled:opacity-50"
              >
                Finish
              </button>
            ) : (
              <button 
                onClick={nextQuestion}
                disabled={userAnswers[currentQuestion] === -1}
                className="px-3 py-1 bg-orange-500 text-white text-sm rounded-2xl disabled:opacity-50"
              >
                Next →
              </button>
            )}
          </div>
          
          {/* Resize Handles */}
          {!isMobile && !isFullScreen && (
            <>
              <div 
                className="resize-handle absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('bottom-right');
                }}
              />
              <div 
                className="resize-handle absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('bottom-left');
                }}
              />
              <div 
                className="resize-handle absolute top-0 right-0 w-3 h-3 cursor-ne-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('top-right');
                }}
              />
              <div 
                className="resize-handle absolute top-0 left-0 w-3 h-3 cursor-nw-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('top-left');
                }}
              />
              <div 
                className="resize-handle absolute top-0 left-3 right-3 h-1 cursor-n-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('top');
                }}
              />
              <div 
                className="resize-handle absolute bottom-0 left-3 right-3 h-1 cursor-s-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('bottom');
                }}
              />
              <div 
                className="resize-handle absolute left-0 top-3 bottom-3 w-1 cursor-w-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('left');
                }}
              />
              <div 
                className="resize-handle absolute right-0 top-3 bottom-3 w-1 cursor-e-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('right');
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
          inset: 0,
          width: '100%',
          height: '100%'
        } : {
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height
        }}
      >
        {isMobile && <div className="fixed inset-0 bg-black/50" />}
        
        <div 
          ref={containerRef}
          className={`w-full h-full flex flex-col border border-gray-200 rounded-3xl overflow-hidden ${isMobile ? '' : 'cursor-move'}`}
          style={{ backgroundColor: '#435b67' }}
          onMouseDown={isMobile ? undefined : handleMouseDown}
        >
          {/* Results Header */}
          <div className="px-3 py-2 border-b border-gray-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs">🏆</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Quiz Complete</div>
                  <div className="text-xs text-gray-500">Results Ready</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                {!isMobile && (
                  <button
                    onClick={toggleFullScreen}
                    className="w-6 h-6 text-gray-300 hover:text-white"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                    </svg>
                  </button>
                )}
                
                <button
                  onClick={onMinimize}
                  className="w-6 h-6 text-gray-400 hover:text-gray-600"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="text-center mt-3">
              <div className="text-3xl mb-2">
                {score >= 80 ? '🎉' : score >= 60 ? '👍' : '📚'}
              </div>
              <div className="text-2xl font-bold text-green-500 mb-1">{score}%</div>
              <div className="text-sm text-gray-600">
                {correctAnswers} out of {questions.length} correct
              </div>
            </div>
          </div>

          {/* Performance Analysis */}
          <div className="p-3 border-b border-gray-100">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 rounded bg-green-50 border border-green-200">
                <div className="text-lg font-bold text-green-600">{correctAnswers}</div>
                <div className="text-xs text-gray-600">Correct</div>
              </div>
              <div className="p-2 rounded bg-red-50 border border-red-200">
                <div className="text-lg font-bold text-red-600">{questions.length - correctAnswers}</div>
                <div className="text-xs text-gray-600">Wrong</div>
              </div>
              <div className="p-2 rounded bg-blue-50 border border-blue-200">
                <div className="text-lg font-bold text-blue-600">{Math.round((timeLimit * 60 - timeRemaining) / 60)}</div>
                <div className="text-xs text-gray-600">Min Used</div>
              </div>
            </div>
          </div>

          {/* Review Section */}
          <div className="flex-1 overflow-y-auto p-3 scrollbar-hide">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-white">Review</h3>
              <button 
                onClick={() => setShowExplanations(!showExplanations)}
                className="px-2 py-1 text-xs border border-gray-200 rounded"
              >
                {showExplanations ? 'Hide' : 'Show'} Explanations
              </button>
            </div>

            <div className="space-y-3">
              {questions.map((question, index) => {
                const userAnswer = userAnswers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <div key={question.id} className="p-3 rounded border border-gray-200 bg-gray-50">
                    <div className="flex items-start space-x-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {isCorrect ? '✓' : '✗'}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-white font-medium mb-1">
                          {index + 1}. {question.question}
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                          Your answer: {userAnswer !== -1 ? question.options[userAnswer] : 'Not answered'}
                        </div>
                        {!isCorrect && (
                          <div className="text-xs text-green-600 mb-1">
                            Correct: {question.options[question.correctAnswer]}
                          </div>
                        )}
                        
                        {showExplanations && (
                          <div className="mt-2 p-2 rounded bg-blue-50 border border-blue-200">
                            <div className="text-xs text-gray-700">{question.explanation}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="p-3 border-t border-gray-100 flex justify-center space-x-2">
            <button 
              onClick={restartQuiz}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded text-sm"
            >
              New Quiz
            </button>
            <button 
              onClick={onMinimize}
              className="px-4 py-2 bg-orange-500 text-white rounded text-sm"
            >
              Close
            </button>
          </div>
          
          {/* Resize Handles */}
          {!isMobile && !isFullScreen && (
            <>
              <div 
                className="resize-handle absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('bottom-right');
                }}
              />
              <div 
                className="resize-handle absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('bottom-left');
                }}
              />
              <div 
                className="resize-handle absolute top-0 right-0 w-3 h-3 cursor-ne-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('top-right');
                }}
              />
              <div 
                className="resize-handle absolute top-0 left-0 w-3 h-3 cursor-nw-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('top-left');
                }}
              />
              <div 
                className="resize-handle absolute top-0 left-3 right-3 h-1 cursor-n-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('top');
                }}
              />
              <div 
                className="resize-handle absolute bottom-0 left-3 right-3 h-1 cursor-s-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('bottom');
                }}
              />
              <div 
                className="resize-handle absolute left-0 top-3 bottom-3 w-1 cursor-w-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('left');
                }}
              />
              <div 
                className="resize-handle absolute right-0 top-3 bottom-3 w-1 cursor-e-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeDirection('right');
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