'use client';

import React, { useState, useEffect } from 'react';
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
  onClose?: () => void;
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ onClose }) => {
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl" style={{ backgroundColor: '#051a1c' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 rounded-t-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">🧠</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Gawin AI Quiz Generator</h2>
                <p className="text-sm text-white/70">Test your knowledge with AI-generated questions</p>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          {/* Setup Content */}
          <div className="p-6 space-y-8">
            {/* Topic Selection */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Choose Your Topic</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topics.map(topic => (
                  <div
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedTopic === topic.id 
                        ? 'border-blue-400 bg-blue-500/20' 
                        : 'border-white/20 hover:border-white/40 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{topic.icon}</span>
                      <div>
                        <div className="font-semibold text-white">{topic.name}</div>
                        <div className="text-xs text-white/70">{topic.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Number of Questions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {questionCounts.map(count => (
                    <button
                      key={count}
                      onClick={() => setSelectedQuestions(count)}
                      className={`p-3 rounded-lg border transition-all ${
                        selectedQuestions === count
                          ? 'border-green-400 bg-green-500/20 text-white'
                          : 'border-white/20 text-white/80 hover:border-white/40 hover:bg-white/10'
                      }`}
                    >
                      {count} Questions
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Time Limit</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[10, 15, 20, 30].map(minutes => (
                    <button
                      key={minutes}
                      onClick={() => setTimeLimit(minutes)}
                      className={`p-3 rounded-lg border transition-all ${
                        timeLimit === minutes
                          ? 'border-orange-400 bg-orange-500/20 text-white'
                          : 'border-white/20 text-white/80 hover:border-white/40 hover:bg-white/10'
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
      </div>
    );
  }

  if (currentScreen === 'quiz') {
    const currentQ = questions[currentQuestion];
    if (!currentQ) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl" style={{ backgroundColor: '#051a1c' }}>
          {/* Quiz Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 rounded-t-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center space-x-4">
              <div className="text-white/70 text-sm">
                Question {currentQuestion + 1} of {questions.length}
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium text-white" 
                   style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                {currentQ.difficulty}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-lg text-sm font-mono ${
                timeRemaining < 120 ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'
              }`}>
                ⏰ {formatTime(timeRemaining)}
              </div>
              <Button variant="ghost" size="sm" onClick={restartQuiz}>
                Exit Quiz
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 h-1">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-400 h-1 transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Content */}
          <div className="flex-1 p-6 flex flex-col justify-center">
            <div className="max-w-3xl mx-auto w-full">
              <h2 className="text-xl font-semibold text-white mb-8 leading-relaxed">
                {currentQ.question}
              </h2>
              
              <div className="space-y-4">
                {currentQ.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 rounded-xl border transition-all text-left ${
                      userAnswers[currentQuestion] === index
                        ? 'border-blue-400 bg-blue-500/20 text-white'
                        : 'border-white/20 text-white/90 hover:border-white/40 hover:bg-white/10'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4 border-t border-white/10 flex justify-between items-center" 
               style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <Button 
              variant="ghost" 
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
            >
              ← Previous
            </Button>
            
            <div className="text-white/60 text-sm">
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
        </div>
      </div>
    );
  }

  if (currentScreen === 'results') {
    const correctAnswers = userAnswers.filter((answer, index) => 
      answer === questions[index]?.correctAnswer
    ).length;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl" style={{ backgroundColor: '#051a1c' }}>
          {/* Results Header */}
          <div className="p-6 border-b border-white/10 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <div className="text-4xl mb-4">
              {score >= 80 ? '🎉' : score >= 60 ? '👍' : '📚'}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h2>
            <div className="text-3xl font-bold text-green-400 mb-2">{score}%</div>
            <div className="text-white/70">
              {correctAnswers} out of {questions.length} correct answers
            </div>
          </div>

          {/* Performance Analysis */}
          <div className="p-6 border-b border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                <div className="text-2xl font-bold text-green-400">{correctAnswers}</div>
                <div className="text-white/70 text-sm">Correct</div>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                <div className="text-2xl font-bold text-red-400">{questions.length - correctAnswers}</div>
                <div className="text-white/70 text-sm">Incorrect</div>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                <div className="text-2xl font-bold text-blue-400">{Math.round((timeLimit * 60 - timeRemaining) / 60)}</div>
                <div className="text-white/70 text-sm">Minutes Used</div>
              </div>
            </div>
          </div>

          {/* Review Section */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white">Review Questions</h3>
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
                  <div key={question.id} className="p-4 rounded-lg border border-white/10" 
                       style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex items-start space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {isCorrect ? '✓' : '✗'}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium mb-2">
                          {index + 1}. {question.question}
                        </div>
                        <div className="text-sm text-white/70 mb-2">
                          Your answer: {userAnswer !== -1 ? question.options[userAnswer] : 'Not answered'}
                        </div>
                        {!isCorrect && (
                          <div className="text-sm text-green-400 mb-2">
                            Correct answer: {question.options[question.correctAnswer]}
                          </div>
                        )}
                        
                        {showExplanations && (
                          <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <div className="text-sm font-medium text-blue-400 mb-1">Explanation:</div>
                            <div className="text-sm text-white/80">{question.explanation}</div>
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
          <div className="p-6 border-t border-white/10 flex justify-center space-x-4">
            <Button variant="outline" onClick={restartQuiz}>
              Take Another Quiz
            </Button>
            <Button variant="primary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default QuizGenerator;