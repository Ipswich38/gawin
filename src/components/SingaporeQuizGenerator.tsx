import React, { useState, useEffect } from 'react';
import { singaporeEducationService, type SingaporeQuestion, type QuestionType, type LearningProfile, type AssessmentResult } from '../lib/services/singaporeEducationService';

interface SingaporeQuizGeneratorProps {
  onBack: () => void;
  aiService: (messages: any[], model?: string) => Promise<{ content: string; reasoning: string; responseTime: number; }>;
}

interface QuizSession {
  questions: SingaporeQuestion[];
  currentQuestionIndex: number;
  responses: Map<string, string | number | string[]>;
  startTime: Date;
  questionStartTime: Date;
  results?: AssessmentResult[];
  completed: boolean;
}

const SingaporeQuizGenerator: React.FC<SingaporeQuizGeneratorProps> = ({ onBack, aiService }) => {
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuestionType['difficulty']>('intermediate');
  const [questionCount, setQuestionCount] = useState(5);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [learningInsights, setLearningInsights] = useState<string[]>([]);

  // Singapore curriculum subjects and topics
  const subjects = {
    'Mathematics': [
      'Algebra', 'Geometry', 'Statistics', 'Probability', 'Calculus', 'Number Theory',
      'Trigonometry', 'Functions', 'Sequences and Series', 'Coordinate Geometry'
    ],
    'Science': [
      'Biology', 'Chemistry', 'Physics', 'Environmental Science', 
      'Human Biology', 'Ecology', 'Genetics', 'Cell Biology'
    ],
    'English': [
      'Grammar', 'Comprehension', 'Essay Writing', 'Literature Analysis',
      'Creative Writing', 'Vocabulary', 'Syntax', 'Critical Reading'
    ],
    'History': [
      'World History', 'Singapore History', 'Southeast Asian History',
      'Historical Analysis', 'Primary Sources', 'Historiography'
    ],
    'Geography': [
      'Physical Geography', 'Human Geography', 'Climate', 'Urban Planning',
      'Environmental Issues', 'Cartography', 'GIS Applications'
    ]
  };

  const difficultyLevels = {
    'foundation': { 
      label: 'Foundation', 
      description: 'Basic concepts and recall',
      color: '#28a745'
    },
    'intermediate': { 
      label: 'Intermediate', 
      description: 'Application and analysis',
      color: '#ffc107'
    },
    'advanced': { 
      label: 'Advanced', 
      description: 'Complex reasoning and synthesis',
      color: '#fd7e14'
    },
    'mastery': { 
      label: 'Mastery', 
      description: 'Expert-level problem solving',
      color: '#dc3545'
    }
  };

  const generateQuiz = async () => {
    if (!selectedTopic) {
      alert('Please select a topic');
      return;
    }

    setIsGenerating(true);
    try {
      const questions: SingaporeQuestion[] = [];
      
      // Generate questions with progressive difficulty
      const difficulties: QuestionType['difficulty'][] = ['foundation', 'intermediate'];
      if (selectedDifficulty === 'advanced' || selectedDifficulty === 'mastery') {
        difficulties.push('advanced');
      }
      if (selectedDifficulty === 'mastery') {
        difficulties.push('mastery');
      }

      const questionsPerLevel = Math.ceil(questionCount / difficulties.length);

      for (const difficulty of difficulties) {
        const levelQuestions = Math.min(questionsPerLevel, questionCount - questions.length);
        
        for (let i = 0; i < levelQuestions; i++) {
          const question = await generateSingaporeQuestion({
            subject: selectedSubject,
            topic: selectedTopic,
            difficulty,
            cognitiveLevel: getCognitiveLevel(difficulty),
            type: getQuestionType(difficulty),
            contextual: true
          });
          
          questions.push(question);
          
          if (questions.length >= questionCount) break;
        }
        
        if (questions.length >= questionCount) break;
      }

      setQuizSession({
        questions,
        currentQuestionIndex: 0,
        responses: new Map(),
        startTime: new Date(),
        questionStartTime: new Date(),
        completed: false
      });

    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSingaporeQuestion = async (params: {
    subject: string;
    topic: string;
    difficulty: QuestionType['difficulty'];
    cognitiveLevel: QuestionType['cognitiveLevel'];
    type: QuestionType['type'];
    contextual: boolean;
  }): Promise<SingaporeQuestion> => {
    const prompt = `Generate a ${params.difficulty}-level ${params.type} question for ${params.subject} - ${params.topic} following Singapore education standards.

REQUIREMENTS:
✅ Real-world application and practical relevance
✅ Progressive difficulty with clear scaffolding
✅ Multi-step reasoning required for higher levels
✅ Detailed marking criteria with partial credit
✅ Comprehensive explanations for learning
✅ Cross-curricular connections where appropriate

Cognitive Level: ${params.cognitiveLevel} (Bloom's Taxonomy)
Question Type: ${params.type}
Include real-world context: ${params.contextual}

Provide response in this exact JSON format:
{
  "question": "Clear, engaging question with real-world context",
  "type": "${params.type}",
  "difficulty": "${params.difficulty}",
  "cognitiveLevel": "${params.cognitiveLevel}",
  ${params.type === 'mcq' ? '"options": ["Option A", "Option B", "Option C", "Option D"],' : ''}
  "correctAnswer": "${params.type === 'mcq' ? 'A' : 'Detailed correct answer'}",
  "explanation": "Step-by-step explanation with learning points",
  "markingScheme": {
    "totalMarks": ${getMarksForDifficulty(params.difficulty)},
    "partialCredit": true,
    "rubric": [
      {
        "criteria": "Understanding of core concept",
        "marks": 2,
        "description": "Clear demonstration of understanding"
      },
      {
        "criteria": "Application of method",
        "marks": 2,
        "description": "Correct application of solution method"
      }
    ],
    "commonMistakes": [
      {
        "mistake": "Common error students make",
        "markDeduction": 1,
        "guidance": "How to avoid this mistake"
      }
    ]
  },
  "realWorldContext": "How this concept applies in everyday life",
  "crossCurricularLinks": ["Related subjects or topics"],
  "prerequisites": ["Required prior knowledge"],
  "learningObjectives": ["What students should learn from this question"],
  "timeAllocation": ${getTimeForDifficulty(params.difficulty)},
  "subject": "${params.subject}",
  "topic": "${params.topic}"
}

Focus on creating questions that develop critical thinking and real-world problem-solving skills, characteristic of Singapore's world-class education system.`;

    try {
      const response = await aiService([{
        id: 'singapore-quiz-gen',
        role: 'user',
        content: prompt,
        timestamp: new Date()
      }], 'llama-3.3-70b-versatile');

      // Extract JSON from response content
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const questionData = JSON.parse(jsonMatch[0]);
      
      return {
        id: `${params.subject}_${params.topic}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...questionData
      };

    } catch (error) {
      console.error('Error generating question:', error);
      // Return fallback question
      return createFallbackQuestion(params);
    }
  };

  const getCognitiveLevel = (difficulty: QuestionType['difficulty']): QuestionType['cognitiveLevel'] => {
    const mapping = {
      'foundation': 'understand' as const,
      'intermediate': 'apply' as const,
      'advanced': 'analyze' as const,
      'mastery': 'evaluate' as const
    };
    return mapping[difficulty];
  };

  const getQuestionType = (difficulty: QuestionType['difficulty']): QuestionType['type'] => {
    const types = {
      'foundation': 'mcq' as const,
      'intermediate': 'structured' as const,
      'advanced': 'application' as const,
      'mastery': 'analysis' as const
    };
    return types[difficulty];
  };

  const getMarksForDifficulty = (difficulty: QuestionType['difficulty']): number => {
    const marks = { 'foundation': 2, 'intermediate': 4, 'advanced': 6, 'mastery': 8 };
    return marks[difficulty];
  };

  const getTimeForDifficulty = (difficulty: QuestionType['difficulty']): number => {
    const time = { 'foundation': 3, 'intermediate': 5, 'advanced': 8, 'mastery': 12 };
    return time[difficulty];
  };

  const createFallbackQuestion = (params: any): SingaporeQuestion => {
    return {
      id: `fallback_${Date.now()}`,
      question: `Solve this ${params.difficulty} level ${params.subject} problem about ${params.topic}.`,
      type: params.type,
      difficulty: params.difficulty,
      cognitiveLevel: params.cognitiveLevel,
      options: params.type === 'mcq' ? ['Option A', 'Option B', 'Option C', 'Option D'] : undefined,
      correctAnswer: params.type === 'mcq' ? 'A' : 'Sample answer',
      explanation: 'This is a fallback explanation. Please try generating again.',
      markingScheme: {
        totalMarks: getMarksForDifficulty(params.difficulty),
        partialCredit: true,
        rubric: [{ criteria: 'Understanding', marks: 2, description: 'Basic understanding' }],
        commonMistakes: [{ mistake: 'Common error', markDeduction: 1, guidance: 'Be careful' }]
      },
      learningObjectives: ['Basic understanding'],
      timeAllocation: getTimeForDifficulty(params.difficulty),
      subject: params.subject,
      topic: params.topic
    };
  };

  const submitAnswer = () => {
    if (!quizSession || !currentAnswer.trim()) return;

    const currentQuestion = quizSession.questions[quizSession.currentQuestionIndex];
    const newResponses = new Map(quizSession.responses);
    newResponses.set(currentQuestion.id, currentAnswer);

    setQuizSession({
      ...quizSession,
      responses: newResponses
    });

    // Move to next question or finish quiz
    if (quizSession.currentQuestionIndex < quizSession.questions.length - 1) {
      setQuizSession({
        ...quizSession,
        currentQuestionIndex: quizSession.currentQuestionIndex + 1,
        responses: newResponses,
        questionStartTime: new Date()
      });
      setCurrentAnswer('');
    } else {
      // Complete quiz and show results
      completeQuiz(newResponses);
    }
  };

  const completeQuiz = async (finalResponses: Map<string, string | number | string[]>) => {
    if (!quizSession) return;

    try {
      console.log('🎯 Completing quiz with', quizSession.questions.length, 'questions');
      
      const results: AssessmentResult[] = quizSession.questions.map((question) => {
        const answer = finalResponses.get(question.id) || '';
        const timeSpent = 5; // Placeholder - would track actual time
        
        console.log('📝 Marking question:', question.id, 'Answer:', answer);
        return singaporeEducationService.markResponse(question, answer, timeSpent);
      });

      console.log('✅ All questions marked, showing results');

      setQuizSession({
        ...quizSession,
        results,
        completed: true
      });

      // Generate learning insights
      await generateDetailedTutoringFeedback(results);
      setShowResults(true);
      
    } catch (error) {
      console.error('❌ Error completing quiz:', error);
      alert('Error processing quiz results. Please try again.');
    }
  };

  const generateDetailedTutoringFeedback = async (results: AssessmentResult[]) => {
    console.log('🧠 Generating detailed tutoring feedback...');
    
    try {
      const wrongAnswers = results.filter(r => (r.marksAwarded / r.totalMarks) < 0.8);
      const correctAnswers = results.filter(r => (r.marksAwarded / r.totalMarks) >= 0.8);
      
      if (wrongAnswers.length > 0) {
        // Generate detailed explanations for wrong answers
        const tutorPrompt = `As an expert Singapore education tutor, provide detailed explanations for these incorrect answers:

${wrongAnswers.map((result, index) => {
  const question = quizSession?.questions.find(q => q.id === result.questionId);
  return `
QUESTION ${index + 1}:
${question?.question}
Student Answer: ${result.studentAnswer}
Correct Answer: ${question?.correctAnswer}
Marks: ${result.marksAwarded}/${result.totalMarks}

Please explain:
1. Why the student's answer is incorrect
2. The correct reasoning and approach
3. Common mistakes students make
4. Learning tips to avoid this error in future
`;
}).join('\n---\n')}

Provide comprehensive tutoring explanations that help the student understand the concepts better.`;

        const tutorResponse = await aiService([{
          id: 'tutor-feedback',
          role: 'user',
          content: tutorPrompt,
          timestamp: new Date()
        }], 'llama-3.3-70b-versatile');

        // Store detailed feedback for wrong answers
        wrongAnswers.forEach((result, index) => {
          result.feedback = `❌ Incorrect: ${result.feedback}\n\n🎓 Tutor Explanation: ${tutorResponse.content}`;
        });
      }
      
      generateLearningInsights(results);
      
    } catch (error) {
      console.error('Error generating tutor feedback:', error);
      generateLearningInsights(results);
    }
  };

  const generateLearningInsights = (results: AssessmentResult[]) => {
    const insights: string[] = [];
    const totalMarks = results.reduce((sum, r) => sum + r.totalMarks, 0);
    const marksAwarded = results.reduce((sum, r) => sum + r.marksAwarded, 0);
    const percentage = (marksAwarded / totalMarks) * 100;

    insights.push(`Overall Performance: ${percentage.toFixed(1)}% (${marksAwarded}/${totalMarks} marks)`);

    if (percentage >= 80) {
      insights.push('🌟 Excellent work! You demonstrate strong mastery of the concepts.');
    } else if (percentage >= 60) {
      insights.push('👍 Good progress! Focus on the areas highlighted for improvement.');
    } else {
      insights.push('📚 Keep practicing! Review the fundamentals and try again.');
    }

    // Identify patterns
    const weakTopics = results
      .filter(r => (r.marksAwarded / r.totalMarks) < 0.6)
      .map(r => r.nextSteps)
      .flat()
      .slice(0, 3);

    if (weakTopics.length > 0) {
      insights.push(`Focus areas: ${weakTopics.join(', ')}`);
    }

    setLearningInsights(insights);
  };

  if (showResults && quizSession?.results) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          color: 'white'
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '24px' }}>
            🎓 Assessment Complete
          </h2>
          <div style={{ fontSize: '16px', opacity: 0.9 }}>
            Singapore Education Standards Assessment
          </div>
        </div>

        {/* Learning Insights */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid rgba(255, 107, 53, 0.2)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#FF6B35' }}>
            📊 Learning Insights
          </h3>
          {learningInsights.map((insight, index) => (
            <div key={index} style={{
              padding: '8px 0',
              borderBottom: index < learningInsights.length - 1 ? '1px solid #eee' : 'none'
            }}>
              {insight}
            </div>
          ))}
        </div>

        {/* Detailed Results */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#FF6B35' }}>
            📋 Detailed Results
          </h3>
          {quizSession.results.map((result, index) => {
            const question = quizSession.questions[index];
            const percentage = (result.marksAwarded / result.totalMarks) * 100;
            
            return (
              <div key={index} style={{
                padding: '16px',
                marginBottom: '16px',
                border: '1px solid #eee',
                borderRadius: '8px',
                borderLeft: `4px solid ${percentage >= 80 ? '#28a745' : percentage >= 60 ? '#ffc107' : '#dc3545'}`
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                  Question {index + 1}: {question.topic} ({question.difficulty})
                </div>
                <div style={{ marginBottom: '8px' }}>
                  Score: {result.marksAwarded}/{result.totalMarks} ({percentage.toFixed(0)}%)
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {result.feedback}
                </div>
                {result.nextSteps.length > 0 && (
                  <div style={{ 
                    marginTop: '8px', 
                    fontSize: '14px', 
                    color: '#FF6B35',
                    fontStyle: 'italic'
                  }}>
                    Next steps: {result.nextSteps.join(', ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => {
              setQuizSession(null);
              setShowResults(false);
              setCurrentAnswer('');
            }}
            style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Take Another Quiz
          </button>
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
            Back to Tools
          </button>
        </div>
      </div>
    );
  }

  if (quizSession && !showResults) {
    const currentQuestion = quizSession.questions[quizSession.currentQuestionIndex];
    const progress = ((quizSession.currentQuestionIndex + 1) / quizSession.questions.length) * 100;

    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Progress Bar */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '14px',
            color: '#666'
          }}>
            <span>Question {quizSession.currentQuestionIndex + 1} of {quizSession.questions.length}</span>
            <span>{currentQuestion.difficulty} • {currentQuestion.timeAllocation} min</span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: '#eee',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Question */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <span style={{
              background: difficultyLevels[currentQuestion.difficulty].color,
              color: 'white',
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {difficultyLevels[currentQuestion.difficulty].label}
            </span>
            <span style={{ color: '#666', fontSize: '14px' }}>
              {currentQuestion.subject} • {currentQuestion.topic}
            </span>
          </div>

          <div style={{
            fontSize: '18px',
            lineHeight: '1.6',
            marginBottom: '20px',
            color: '#2A2B26'
          }}>
            {currentQuestion.question}
          </div>

          {currentQuestion.type === 'mcq' && currentQuestion.options ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentQuestion.options.map((option, index) => (
                <label key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #eee',
                  background: currentAnswer === option ? 'rgba(255, 107, 53, 0.1)' : 'white'
                }}>
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={currentAnswer === option}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    style={{ margin: 0 }}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Enter your detailed answer here..."
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          )}
        </div>

        {/* Learning Context */}
        {currentQuestion.realWorldContext && (
          <div style={{
            background: 'rgba(255, 107, 53, 0.05)',
            border: '1px solid rgba(255, 107, 53, 0.2)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '8px', color: '#FF6B35' }}>
              🌍 Real-World Context
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {currentQuestion.realWorldContext}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={submitAnswer}
            disabled={!currentAnswer.trim()}
            style={{
              background: currentAnswer.trim() ? 
                'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: currentAnswer.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            {quizSession.currentQuestionIndex < quizSession.questions.length - 1 ? 
              'Next Question' : 'Complete Quiz'}
          </button>
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
            Exit Quiz
          </button>
        </div>
      </div>
    );
  }

  // Quiz setup screen
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        color: 'white'
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
          🇸🇬 Singapore Standards Quiz
        </h2>
        <div style={{ fontSize: '16px', opacity: 0.9 }}>
          World-class assessments with detailed feedback and learning pathways
        </div>
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px'
      }}>
        {/* Subject Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSelectedTopic('');
            }}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          >
            {Object.keys(subjects).map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        {/* Topic Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Topic
          </label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          >
            <option value="">Select a topic</option>
            {subjects[selectedSubject as keyof typeof subjects].map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>

        {/* Difficulty Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Difficulty Level
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {Object.entries(difficultyLevels).map(([key, level]) => (
              <label key={key} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #eee',
                background: selectedDifficulty === key ? 'rgba(255, 107, 53, 0.1)' : 'white'
              }}>
                <input
                  type="radio"
                  name="difficulty"
                  value={key}
                  checked={selectedDifficulty === key}
                  onChange={(e) => setSelectedDifficulty(e.target.value as QuestionType['difficulty'])}
                  style={{ margin: 0 }}
                />
                <div>
                  <div style={{ fontWeight: '600', color: level.color }}>
                    {level.label}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {level.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Number of Questions
          </label>
          <select
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          >
            <option value={3}>3 Questions (Quick Practice)</option>
            <option value={5}>5 Questions (Standard)</option>
            <option value={10}>10 Questions (Comprehensive)</option>
            <option value={15}>15 Questions (Full Assessment)</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={generateQuiz}
          disabled={!selectedTopic || isGenerating}
          style={{
            background: (!selectedTopic || isGenerating) ? '#ccc' : 
              'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: (!selectedTopic || isGenerating) ? 'not-allowed' : 'pointer',
            flex: 1
          }}
        >
          {isGenerating ? '🔄 Generating Quiz...' : '🚀 Start Quiz'}
        </button>
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
          Back
        </button>
      </div>
    </div>
  );
};

export default SingaporeQuizGenerator;