'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, TrendingUp, BarChart3, PieChart, Calculator, Brain, History, X, HelpCircle } from 'lucide-react';
import { evaluate, parse, simplify } from 'mathjs';
import { useRouter } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface CalculationHistory {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
  aiAnalysis?: string;
}

interface AIAnalysisResponse {
  explanation: string;
  concepts: string[];
  nextSteps: string[];
  visualization?: 'graph' | 'table' | 'diagram' | null;
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

export default function CalculatorPage() {
  const router = useRouter();
  const [display, setDisplay] = useState('0');
  const [previousOperand, setPreviousOperand] = useState('');
  const [operation, setOperation] = useState('');
  const [waitingForNewOperand, setWaitingForNewOperand] = useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [memory, setMemory] = useState(0);
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Utility function for contrast classes
  const getContrastClass = () => {
    return isDark 
      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
      : 'bg-gray-100 hover:bg-gray-200 text-gray-900';
  };

  // Scientific calculator functions
  const inputDigit = (digit: string) => {
    if (waitingForNewOperand) {
      setDisplay(digit);
      setWaitingForNewOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForNewOperand) {
      setDisplay('0.');
      setWaitingForNewOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousOperand('');
    setOperation('');
    setWaitingForNewOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousOperand === '') {
      setPreviousOperand(String(inputValue));
    } else if (operation) {
      const currentValue = previousOperand || '0';
      const newValue = calculate(currentValue, display, operation);

      setDisplay(String(newValue));
      setPreviousOperand(String(newValue));
      
      // Add to history
      addToHistory(`${currentValue} ${operation} ${display}`, String(newValue));
    }

    setWaitingForNewOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstOperand: string, secondOperand: string, operation: string) => {
    const prev = parseFloat(firstOperand);
    const current = parseFloat(secondOperand);

    switch (operation) {
      case '+':
        return prev + current;
      case '-':
        return prev - current;
      case '×':
        return prev * current;
      case '÷':
        return current !== 0 ? prev / current : 0;
      case '=':
        return current;
      default:
        return current;
    }
  };

  // Scientific functions
  const performScientificOperation = (func: string) => {
    const value = parseFloat(display);
    let result: number;

    try {
      switch (func) {
        case 'sin':
          result = Math.sin(value * Math.PI / 180);
          break;
        case 'cos':
          result = Math.cos(value * Math.PI / 180);
          break;
        case 'tan':
          result = Math.tan(value * Math.PI / 180);
          break;
        case 'ln':
          result = Math.log(value);
          break;
        case 'log':
          result = Math.log10(value);
          break;
        case 'sqrt':
          result = Math.sqrt(value);
          break;
        case 'square':
          result = value * value;
          break;
        case 'cube':
          result = value * value * value;
          break;
        case 'factorial':
          result = factorial(value);
          break;
        case 'inverse':
          result = 1 / value;
          break;
        case 'exp':
          result = Math.exp(value);
          break;
        case 'abs':
          result = Math.abs(value);
          break;
        default:
          result = value;
      }

      const expression = `${func}(${value})`;
      setDisplay(String(result));
      setWaitingForNewOperand(true);
      addToHistory(expression, String(result));
    } catch (error) {
      setDisplay('Error');
      setWaitingForNewOperand(true);
    }
  };

  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
  };

  // Memory functions
  const memoryStore = () => {
    setMemory(parseFloat(display));
  };

  const memoryRecall = () => {
    setDisplay(String(memory));
    setWaitingForNewOperand(true);
  };

  const memoryAdd = () => {
    setMemory(memory + parseFloat(display));
  };

  const memoryClear = () => {
    setMemory(0);
  };

  // History management
  const addToHistory = (expression: string, result: string) => {
    const newEntry: CalculationHistory = {
      id: Date.now().toString(),
      expression,
      result,
      timestamp: new Date()
    };
    setHistory(prev => [newEntry, ...prev.slice(0, 19)]); // Keep last 20 entries
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const useHistoryEntry = (entry: CalculationHistory) => {
    setDisplay(entry.result);
    setWaitingForNewOperand(true);
    setShowHistory(false);
  };

  // AI Analysis
  const analyzeCalculation = async () => {
    if (history.length === 0) return;

    setIsAnalyzing(true);
    
    try {
      const lastCalculation = history[0];
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Analyze this mathematical calculation and provide educational insights:

Calculation: ${lastCalculation.expression} = ${lastCalculation.result}

Please provide:
1. **Explanation**: What this calculation does in simple terms
2. **Key Concepts**: Mathematical concepts involved (3-4 items)
3. **Next Steps**: Learning suggestions (3-4 items)
4. **Difficulty Level**: Rate as basic, intermediate, or advanced

Format your response as JSON with these exact keys: explanation, concepts (array), nextSteps (array), difficulty.`
          }],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.1,
          max_tokens: 800
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content || '';
        
        try {
          // Try to parse as JSON first
          const parsed = JSON.parse(aiResponse);
          setAiAnalysis(parsed);
        } catch {
          // Fallback to text response
          const mockAnalysis: AIAnalysisResponse = {
            explanation: aiResponse || `This calculation involves ${lastCalculation.expression}. The result ${lastCalculation.result} demonstrates the mathematical relationship between the operands.`,
            concepts: ['Mathematical Operations', 'Numerical Calculation', 'Problem Solving'],
            nextSteps: [
              'Try similar calculations with different values',
              'Explore related mathematical concepts',
              'Practice with more complex expressions'
            ],
            difficulty: 'intermediate'
          };
          setAiAnalysis(mockAnalysis);
        }
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      // Fallback analysis
      const lastCalculation = history[0];
      const mockAnalysis: AIAnalysisResponse = {
        explanation: `This calculation involves ${lastCalculation.expression}. The result ${lastCalculation.result} demonstrates the mathematical relationship between the operands.`,
        concepts: ['Mathematical Operations', 'Numerical Calculation', 'Problem Solving'],
        nextSteps: [
          'Try similar calculations with different values',
          'Explore related mathematical concepts',
          'Practice with more complex expressions'
        ],
        difficulty: 'intermediate'
      };
      setAiAnalysis(mockAnalysis);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Advanced expression evaluation
  const evaluateExpression = () => {
    try {
      const result = evaluate(display);
      addToHistory(display, String(result));
      setDisplay(String(result));
      setWaitingForNewOperand(true);
    } catch (error) {
      setDisplay('Error');
      setWaitingForNewOperand(true);
    }
  };

  const inputExpression = (expr: string) => {
    if (waitingForNewOperand) {
      setDisplay(expr);
      setWaitingForNewOperand(false);
    } else {
      setDisplay(display + expr);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${getContrastClass()}`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            AI Scientific Calculator
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHelp(true)}
              className={`p-2 rounded-lg transition-all ${getContrastClass()}`}
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-lg transition-all ${getContrastClass()}`}
            >
              <History className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calculator */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              {/* Display */}
              <div className="mb-4">
                <div className={`p-4 rounded-lg bg-gray-100 dark:bg-gray-700 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <div className="text-right text-3xl font-mono break-all">
                    {display}
                  </div>
                  {operation && (
                    <div className="text-right text-sm opacity-60">
                      {previousOperand} {operation}
                    </div>
                  )}
                </div>
                
                {/* Mode Toggle */}
                <div className="flex justify-between items-center mt-2">
                  <button
                    onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                      isAdvancedMode 
                        ? 'bg-blue-500 text-white' 
                        : getContrastClass()
                    }`}
                  >
                    {isAdvancedMode ? 'Advanced' : 'Basic'} Mode
                  </button>
                  <div className={`text-sm opacity-60 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Memory: {memory}
                  </div>
                </div>
              </div>

              {/* Calculator Buttons */}
              <div className="grid grid-cols-5 gap-2">
                {/* Memory Functions */}
                <button
                  onClick={memoryClear}
                  className={`p-3 rounded-lg transition-all bg-gray-200 dark:bg-gray-600 ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  MC
                </button>
                <button
                  onClick={memoryRecall}
                  className={`p-3 rounded-lg transition-all bg-gray-200 dark:bg-gray-600 ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  MR
                </button>
                <button
                  onClick={memoryAdd}
                  className={`p-3 rounded-lg transition-all bg-gray-200 dark:bg-gray-600 ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  M+
                </button>
                <button
                  onClick={memoryStore}
                  className={`p-3 rounded-lg transition-all bg-gray-200 dark:bg-gray-600 ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  MS
                </button>
                <button
                  onClick={clear}
                  className={`p-3 rounded-lg transition-all bg-red-500 text-white hover:bg-red-600`}
                >
                  C
                </button>

                {/* Scientific Functions (Advanced Mode) */}
                {isAdvancedMode && (
                  <>
                    <button
                      onClick={() => performScientificOperation('sin')}
                      className={`p-3 rounded-lg transition-all bg-blue-200 dark:bg-blue-700 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      sin
                    </button>
                    <button
                      onClick={() => performScientificOperation('cos')}
                      className={`p-3 rounded-lg transition-all bg-blue-200 dark:bg-blue-700 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      cos
                    </button>
                    <button
                      onClick={() => performScientificOperation('tan')}
                      className={`p-3 rounded-lg transition-all bg-blue-200 dark:bg-blue-700 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      tan
                    </button>
                    <button
                      onClick={() => performScientificOperation('ln')}
                      className={`p-3 rounded-lg transition-all bg-blue-200 dark:bg-blue-700 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      ln
                    </button>
                    <button
                      onClick={() => performScientificOperation('log')}
                      className={`p-3 rounded-lg transition-all bg-blue-200 dark:bg-blue-700 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      log
                    </button>

                    <button
                      onClick={() => performScientificOperation('sqrt')}
                      className={`p-3 rounded-lg transition-all bg-green-200 dark:bg-green-700 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      √
                    </button>
                    <button
                      onClick={() => performScientificOperation('square')}
                      className={`p-3 rounded-lg transition-all bg-green-200 dark:bg-green-700 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      x²
                    </button>
                    <button
                      onClick={() => performScientificOperation('cube')}
                      className={`p-3 rounded-lg transition-all bg-green-200 dark:bg-green-700 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      x³
                    </button>
                    <button
                      onClick={() => performScientificOperation('factorial')}
                      className={`p-3 rounded-lg transition-all bg-green-200 dark:bg-green-700 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      x!
                    </button>
                    <button
                      onClick={() => performScientificOperation('inverse')}
                      className={`p-3 rounded-lg transition-all bg-green-200 dark:bg-green-700 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      1/x
                    </button>

                    <button
                      onClick={() => inputExpression('π')}
                      className={`p-3 rounded-lg transition-all bg-purple-200 dark:bg-purple-700 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      π
                    </button>
                    <button
                      onClick={() => inputExpression('e')}
                      className={`p-3 rounded-lg transition-all bg-purple-200 dark:bg-purple-700 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      e
                    </button>
                    <button
                      onClick={() => inputExpression('(')}
                      className={`p-3 rounded-lg transition-all bg-purple-200 dark:bg-purple-700 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      (
                    </button>
                    <button
                      onClick={() => inputExpression(')')}
                      className={`p-3 rounded-lg transition-all bg-purple-200 dark:bg-purple-700 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      )
                    </button>
                    <button
                      onClick={evaluateExpression}
                      className={`p-3 rounded-lg transition-all bg-orange-500 text-white hover:bg-orange-600`}
                    >
                      Eval
                    </button>
                  </>
                )}

                {/* Number Buttons */}
                {[7, 8, 9].map(num => (
                  <button
                    key={num}
                    onClick={() => inputDigit(String(num))}
                    className={`p-3 rounded-lg transition-all ${getContrastClass()}`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => performOperation('÷')}
                  className={`p-3 rounded-lg transition-all bg-orange-500 text-white hover:bg-orange-600`}
                >
                  ÷
                </button>
                <button
                  onClick={() => performOperation('×')}
                  className={`p-3 rounded-lg transition-all bg-orange-500 text-white hover:bg-orange-600`}
                >
                  ×
                </button>

                {[4, 5, 6].map(num => (
                  <button
                    key={num}
                    onClick={() => inputDigit(String(num))}
                    className={`p-3 rounded-lg transition-all ${getContrastClass()}`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => performOperation('-')}
                  className={`p-3 rounded-lg transition-all bg-orange-500 text-white hover:bg-orange-600`}
                >
                  -
                </button>
                <button
                  onClick={() => performOperation('+')}
                  className={`p-3 rounded-lg transition-all bg-orange-500 text-white hover:bg-orange-600`}
                >
                  +
                </button>

                {[1, 2, 3].map(num => (
                  <button
                    key={num}
                    onClick={() => inputDigit(String(num))}
                    className={`p-3 rounded-lg transition-all ${getContrastClass()}`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={inputDecimal}
                  className={`p-3 rounded-lg transition-all ${getContrastClass()}`}
                >
                  .
                </button>
                <button
                  onClick={() => performOperation('=')}
                  className={`p-3 rounded-lg transition-all bg-blue-500 text-white hover:bg-blue-600`}
                >
                  =
                </button>

                <button
                  onClick={() => inputDigit('0')}
                  className={`col-span-2 p-3 rounded-lg transition-all ${getContrastClass()}`}
                >
                  0
                </button>
                <button
                  onClick={() => setDisplay(display.slice(0, -1) || '0')}
                  className={`p-3 rounded-lg transition-all bg-gray-300 dark:bg-gray-600 ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  ⌫
                </button>
                <button
                  onClick={analyzeCalculation}
                  disabled={isAnalyzing || history.length === 0}
                  className={`p-3 rounded-lg transition-all bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* History */}
            {showHistory && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Calculation History
                  </h3>
                  <button
                    onClick={clearHistory}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.map(entry => (
                    <div
                      key={entry.id}
                      onClick={() => useHistoryEntry(entry)}
                      className={`p-2 rounded-lg cursor-pointer transition-all ${getContrastClass()} hover:bg-gray-100 dark:hover:bg-gray-700`}
                    >
                      <div className="text-sm opacity-60">{entry.expression}</div>
                      <div className="font-mono">{entry.result}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Analysis */}
            {aiAnalysis && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  AI Analysis
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Explanation</h4>
                    <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{aiAnalysis.explanation}</p>
                  </div>
                  <div>
                    <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Key Concepts</h4>
                    <div className="flex flex-wrap gap-1">
                      {aiAnalysis.concepts.map((concept, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Next Steps</h4>
                    <ul className={`text-sm space-y-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {aiAnalysis.nextSteps.map((step, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Functions */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Quick Functions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => performScientificOperation('abs')}
                  className={`p-2 rounded-lg transition-all ${getContrastClass()}`}
                >
                  |x|
                </button>
                <button
                  onClick={() => performScientificOperation('exp')}
                  className={`p-2 rounded-lg transition-all ${getContrastClass()}`}
                >
                  eˣ
                </button>
                <button
                  onClick={() => inputExpression('∞')}
                  className={`p-2 rounded-lg transition-all ${getContrastClass()}`}
                >
                  ∞
                </button>
                <button
                  onClick={() => setDisplay(String(Math.random()))}
                  className={`p-2 rounded-lg transition-all ${getContrastClass()}`}
                >
                  Random
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Help Modal */}
        {showHelp && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Calculator Help
                </h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className={`p-2 rounded-lg ${getContrastClass()}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Basic Operations</h4>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Use +, -, ×, ÷ for basic arithmetic operations. The calculator follows standard order of operations.
                  </p>
                </div>
                <div>
                  <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Scientific Functions</h4>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Toggle Advanced Mode to access trigonometric functions, logarithms, powers, and more.
                  </p>
                </div>
                <div>
                  <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Memory Functions</h4>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    MS: Memory Store, MR: Memory Recall, M+: Memory Add, MC: Memory Clear
                  </p>
                </div>
                <div>
                  <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Analysis</h4>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Click the brain icon to get AI-powered explanations of your calculations and learning suggestions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}