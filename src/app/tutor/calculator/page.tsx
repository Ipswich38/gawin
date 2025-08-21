'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function CalculatorPage() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [memory, setMemory] = useState(0);
  const [isRadians, setIsRadians] = useState(true);
  const [history, setHistory] = useState<Array<{expression: string, result: string}>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mathematical constants
  const constants = {
    pi: Math.PI,
    e: Math.E,
    phi: (1 + Math.sqrt(5)) / 2, // Golden ratio
  };

  // Helper function to evaluate mathematical expressions safely
  const evaluateExpression = (expr: string): number => {
    try {
      // Replace constants
      let processedExpr = expr
        .replace(/π|pi/g, constants.pi.toString())
        .replace(/e(?![0-9])/g, constants.e.toString())
        .replace(/φ|phi/g, constants.phi.toString());

      // Replace mathematical functions
      processedExpr = processedExpr
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/asin\(/g, 'Math.asin(')
        .replace(/acos\(/g, 'Math.acos(')
        .replace(/atan\(/g, 'Math.atan(')
        .replace(/log\(/g, 'Math.log(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/log10\(/g, 'Math.log10(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/exp\(/g, 'Math.exp(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/floor\(/g, 'Math.floor(')
        .replace(/ceil\(/g, 'Math.ceil(')
        .replace(/round\(/g, 'Math.round(')
        .replace(/\^/g, '**'); // Power operator

      // Convert degrees to radians if needed
      if (!isRadians) {
        processedExpr = processedExpr
          .replace(/Math\.sin\(([^)]+)\)/g, 'Math.sin(($1) * Math.PI / 180)')
          .replace(/Math\.cos\(([^)]+)\)/g, 'Math.cos(($1) * Math.PI / 180)')
          .replace(/Math\.tan\(([^)]+)\)/g, 'Math.tan(($1) * Math.PI / 180)');
      }

      // Validate expression contains only safe characters
      if (!/^[0-9+\-*/.()Math\s,a-z]+$/i.test(processedExpr)) {
        throw new Error('Invalid characters in expression');
      }

      // Evaluate safely
      const result = Function(`"use strict"; return (${processedExpr})`)();
      return typeof result === 'number' && !isNaN(result) ? result : NaN;
    } catch (error) {
      console.error('Expression evaluation error:', error);
      return NaN;
    }
  };

  const inputValue = (value: string) => {
    if (waitingForNewValue) {
      setDisplay(value);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? value : display + value);
    }
  };

  const inputFunction = (func: string) => {
    const currentExpression = display === '0' ? '' : display;
    setDisplay(currentExpression + func + '(');
    setWaitingForNewValue(false);
  };

  const inputConstant = (constant: string) => {
    if (waitingForNewValue) {
      setDisplay(constant);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? constant : display + constant);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const result = calculate(currentValue, inputValue, operation);

      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return secondValue !== 0 ? firstValue / secondValue : NaN;
      case '^':
        return Math.pow(firstValue, secondValue);
      case 'mod':
        return firstValue % secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = async () => {
    try {
      let result: number;
      let expression = display;

      if (previousValue !== null && operation) {
        const inputValue = parseFloat(display);
        result = calculate(previousValue, inputValue, operation);
        expression = `${previousValue} ${operation} ${inputValue}`;
      } else {
        // Evaluate complex expression
        result = evaluateExpression(display);
        expression = display;
      }

      if (isNaN(result)) {
        setDisplay('Error');
        return;
      }

      const resultStr = result.toString();
      setDisplay(resultStr);
      
      // Add to history
      setHistory(prev => [{
        expression: expression,
        result: resultStr
      }, ...prev.slice(0, 9)]);

      // Get AI explanation
      await getAIExplanation(expression, resultStr);

      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    } catch (error) {
      setDisplay('Error');
      console.error('Calculation error:', error);
    }
  };

  const getAIExplanation = async (expression: string, result: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Explain this mathematical calculation in a clear, educational way:

Expression: ${expression}
Result: ${result}

Please provide:
1. **What the calculation does** - Explain the mathematical operation in simple terms
2. **Step-by-step breakdown** - Walk through the calculation process
3. **Mathematical concepts** - What mathematical principles are involved
4. **Real-world applications** - Where this type of calculation might be used
5. **Tips and insights** - Any helpful mathematical insights

Keep the explanation concise but educational, suitable for learning.`
          }],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.1,
          max_tokens: 1000
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiExplanation = data.choices?.[0]?.message?.content || 'Unable to generate explanation.';
        setExplanation(aiExplanation);
        setShowExplanation(true);
      }
    } catch (error) {
      console.error('AI explanation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const clearEntry = () => {
    setDisplay('0');
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const toggleSign = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <div className="text-white font-semibold text-lg">Gawin AI Calculator</div>
            </Link>
            <Link href="/" className="text-white/70 hover:text-white transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🧮 Advanced Scientific Calculator</h1>
          <p className="text-white/70 text-lg">High-precision calculations with AI-powered explanations</p>
          <div className="mt-4 flex justify-center space-x-4">
            <button
              onClick={() => setIsRadians(!isRadians)}
              className={`px-4 py-2 rounded-lg transition-all ${
                isRadians 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {isRadians ? 'RAD' : 'DEG'}
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
            >
              History ({history.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calculator Main Panel */}
          <div className="lg:col-span-2">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              {/* Display */}
              <div className="bg-black/60 rounded-xl p-6 mb-6">
                <div className="text-right">
                  <div className="text-white/60 text-sm mb-1 font-mono min-h-[20px]">
                    {operation && previousValue !== null ? `${previousValue} ${operation}` : ''}
                  </div>
                  <div className="text-white text-3xl font-mono break-all min-h-[40px] flex items-center justify-end">
                    {display}
                  </div>
                </div>
              </div>

              {/* Button Grid */}
              <div className="grid grid-cols-6 gap-3">
                {/* Row 1 - Functions and Constants */}
                <button onClick={() => inputConstant('π')} className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-all text-sm font-semibold">π</button>
                <button onClick={() => inputConstant('e')} className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-all text-sm font-semibold">e</button>
                <button onClick={() => inputFunction('sin')} className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-all text-sm font-semibold">sin</button>
                <button onClick={() => inputFunction('cos')} className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-all text-sm font-semibold">cos</button>
                <button onClick={() => inputFunction('tan')} className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-all text-sm font-semibold">tan</button>
                <button onClick={clear} className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition-all font-semibold">C</button>

                {/* Row 2 - More Functions */}
                <button onClick={() => inputFunction('asin')} className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-all text-xs font-semibold">asin</button>
                <button onClick={() => inputFunction('acos')} className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-all text-xs font-semibold">acos</button>
                <button onClick={() => inputFunction('atan')} className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-all text-xs font-semibold">atan</button>
                <button onClick={() => inputFunction('log')} className="bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded-lg transition-all text-sm font-semibold">ln</button>
                <button onClick={() => inputFunction('log10')} className="bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded-lg transition-all text-xs font-semibold">log</button>
                <button onClick={backspace} className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-lg transition-all font-semibold">⌫</button>

                {/* Row 3 - Powers and Roots */}
                <button onClick={() => inputOperation('^')} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-all font-semibold">x^y</button>
                <button onClick={() => inputFunction('sqrt')} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-all font-semibold">√</button>
                <button onClick={() => inputValue('(')} className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg transition-all font-semibold">(</button>
                <button onClick={() => inputValue(')')} className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg transition-all font-semibold">)</button>
                <button onClick={() => inputOperation('mod')} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-all text-sm font-semibold">mod</button>
                <button onClick={() => inputOperation('÷')} className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg transition-all font-semibold text-xl">÷</button>

                {/* Row 4 - Numbers */}
                <button onClick={() => inputValue('7')} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all font-semibold text-xl">7</button>
                <button onClick={() => inputValue('8')} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all font-semibold text-xl">8</button>
                <button onClick={() => inputValue('9')} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all font-semibold text-xl">9</button>
                <button onClick={() => inputOperation('×')} className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg transition-all font-semibold text-xl">×</button>
                <button onClick={() => setDisplay(String(factorial(parseFloat(display))))} className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-all font-semibold">n!</button>
                <button onClick={() => inputFunction('exp')} className="bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded-lg transition-all text-sm font-semibold">e^x</button>

                {/* Row 5 - Numbers */}
                <button onClick={() => inputValue('4')} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all font-semibold text-xl">4</button>
                <button onClick={() => inputValue('5')} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all font-semibold text-xl">5</button>
                <button onClick={() => inputValue('6')} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all font-semibold text-xl">6</button>
                <button onClick={() => inputOperation('-')} className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg transition-all font-semibold text-xl">−</button>
                <button onClick={() => inputFunction('abs')} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-all text-sm font-semibold">|x|</button>
                <button onClick={toggleSign} className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg transition-all font-semibold">±</button>

                {/* Row 6 - Numbers */}
                <button onClick={() => inputValue('1')} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all font-semibold text-xl">1</button>
                <button onClick={() => inputValue('2')} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all font-semibold text-xl">2</button>
                <button onClick={() => inputValue('3')} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all font-semibold text-xl">3</button>
                <button onClick={() => inputOperation('+')} className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg transition-all font-semibold text-xl">+</button>
                <button onClick={() => inputFunction('floor')} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-all text-xs font-semibold">⌊x⌋</button>
                <button onClick={() => inputFunction('ceil')} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-all text-xs font-semibold">⌈x⌉</button>

                {/* Row 7 - Bottom Row */}
                <button onClick={() => inputValue('0')} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all font-semibold text-xl col-span-2">0</button>
                <button onClick={() => inputValue('.')} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all font-semibold text-xl">.</button>
                <button onClick={performCalculation} className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg transition-all font-semibold text-xl col-span-3">=</button>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* History Panel */}
            {showHistory && (
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-semibold text-lg">History</h3>
                  <button
                    onClick={() => setHistory([])}
                    className="text-red-400 hover:text-red-300 transition-colors text-sm"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {history.length === 0 ? (
                    <p className="text-white/50 text-sm">No calculations yet</p>
                  ) : (
                    history.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setDisplay(item.expression);
                          setWaitingForNewValue(false);
                        }}
                        className="bg-white/5 hover:bg-white/10 p-3 rounded-lg cursor-pointer transition-all"
                      >
                        <div className="text-white/70 text-xs font-mono">{item.expression}</div>
                        <div className="text-white font-mono text-sm">= {item.result}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* AI Explanation Panel */}
            {showExplanation && (
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 border-green-500/30">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-green-400 font-semibold text-lg">🤖 AI Explanation</h3>
                  <button
                    onClick={() => setShowExplanation(false)}
                    className="text-white/50 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>
                <div className="text-white/80 text-sm leading-relaxed max-h-80 overflow-y-auto">
                  <div className="whitespace-pre-wrap">{explanation}</div>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
                <div className="text-white/70">🤖 Generating explanation...</div>
              </div>
            )}

            {/* Quick Functions */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-semibold text-lg mb-4">Quick Functions</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <button onClick={() => inputConstant('π')} className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 p-2 rounded transition-all">π (Pi)</button>
                <button onClick={() => inputConstant('e')} className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 p-2 rounded transition-all">e (Euler)</button>
                <button onClick={() => inputFunction('sqrt')} className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 p-2 rounded transition-all">√ (Square Root)</button>
                <button onClick={() => inputFunction('log')} className="bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-300 p-2 rounded transition-all">ln (Natural Log)</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}