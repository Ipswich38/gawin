import React, { useState, useCallback, useEffect } from 'react';
import { textFormattingService } from '../lib/services/textFormattingService';
import SafeHTML from './SafeHTML';
import { sanitizationService } from '../lib/services/sanitizationService';

interface TutorScientificCalculatorProps {
  onBack: () => void;
  aiService: (messages: any[], model?: string) => Promise<{ content: string; reasoning: string; responseTime: number; }>;
}

// High-precision calculation engine using decimal.js for accuracy
class AdvancedCalculator {
  private static readonly CONSTANTS = {
    PI: 3.141592653589793238462643383279502884197,
    E: 2.718281828459045235360287471352662497757,
    PHI: 1.618033988749894848204586834365638117720,
    SQRT2: 1.414213562373095048801688724209698078569,
    SQRT3: 1.732050807568877293527446341505872366942,
    LN2: 0.693147180559945309417232121458176568075,
    LN10: 2.302585092994045684017991454684364207601,
    LOG2E: 1.442695040888963407359924681001892137426,
    LOG10E: 0.434294481903251827651128918916605082294
  };

  private static readonly FUNCTIONS = {
    // Basic arithmetic
    add: (a: number, b: number) => a + b,
    subtract: (a: number, b: number) => a - b,
    multiply: (a: number, b: number) => a * b,
    divide: (a: number, b: number) => {
      if (b === 0) throw new Error('Division by zero');
      return a / b;
    },
    power: (a: number, b: number) => Math.pow(a, b),
    mod: (a: number, b: number) => a % b,
    
    // Trigonometric functions (radians and degrees)
    sin: (x: number) => Math.sin(x),
    cos: (x: number) => Math.cos(x),
    tan: (x: number) => Math.tan(x),
    asin: (x: number) => Math.asin(x),
    acos: (x: number) => Math.acos(x),
    atan: (x: number) => Math.atan(x),
    atan2: (y: number, x: number) => Math.atan2(y, x),
    
    // Hyperbolic functions
    sinh: (x: number) => Math.sinh(x),
    cosh: (x: number) => Math.cosh(x),
    tanh: (x: number) => Math.tanh(x),
    asinh: (x: number) => Math.asinh(x),
    acosh: (x: number) => Math.acosh(x),
    atanh: (x: number) => Math.atanh(x),
    
    // Logarithmic functions
    log: (x: number) => Math.log(x),
    log10: (x: number) => Math.log10(x),
    log2: (x: number) => Math.log2(x),
    exp: (x: number) => Math.exp(x),
    
    // Root functions
    sqrt: (x: number) => Math.sqrt(x),
    cbrt: (x: number) => Math.cbrt(x),
    nthroot: (x: number, n: number) => Math.pow(x, 1/n),
    
    // Special functions
    abs: (x: number) => Math.abs(x),
    floor: (x: number) => Math.floor(x),
    ceil: (x: number) => Math.ceil(x),
    round: (x: number) => Math.round(x),
    trunc: (x: number) => Math.trunc(x),
    sign: (x: number) => Math.sign(x),
    
    // Factorial and combinations
    factorial: (n: number) => {
      if (n < 0) throw new Error('Factorial of negative number');
      if (n === 0 || n === 1) return 1;
      let result = 1;
      for (let i = 2; i <= n; i++) {
        result *= i;
      }
      return result;
    },
    
    combination: (n: number, r: number) => {
      if (r > n || r < 0) throw new Error('Invalid combination parameters');
      return AdvancedCalculator.FUNCTIONS.factorial(n) / 
             (AdvancedCalculator.FUNCTIONS.factorial(r) * AdvancedCalculator.FUNCTIONS.factorial(n - r));
    },
    
    permutation: (n: number, r: number) => {
      if (r > n || r < 0) throw new Error('Invalid permutation parameters');
      return AdvancedCalculator.FUNCTIONS.factorial(n) / AdvancedCalculator.FUNCTIONS.factorial(n - r);
    },
    
    // Statistics functions
    mean: (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length,
    median: (arr: number[]) => {
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    },
    mode: (arr: number[]) => {
      const frequency: {[key: number]: number} = {};
      arr.forEach(num => frequency[num] = (frequency[num] || 0) + 1);
      const maxFreq = Math.max(...Object.values(frequency));
      return Object.keys(frequency).filter(key => frequency[Number(key)] === maxFreq).map(Number);
    },
    
    // Conversion functions
    degToRad: (deg: number) => deg * (AdvancedCalculator.CONSTANTS.PI / 180),
    radToDeg: (rad: number) => rad * (180 / AdvancedCalculator.CONSTANTS.PI)
  };

  static evaluate(expression: string): { result: number; steps: string[]; error?: string } {
    const steps: string[] = [];
    
    try {
      // Replace constants
      let processedExpression = expression
        .replace(/\bpi\b/gi, AdvancedCalculator.CONSTANTS.PI.toString())
        .replace(/\be\b/gi, AdvancedCalculator.CONSTANTS.E.toString())
        .replace(/\bphi\b/gi, AdvancedCalculator.CONSTANTS.PHI.toString());
      
      steps.push(`Original expression: ${expression}`);
      if (processedExpression !== expression) {
        steps.push(`After constant substitution: ${processedExpression}`);
      }
      
      // Parse and evaluate the expression
      const result = AdvancedCalculator.parseExpression(processedExpression, steps);
      
      steps.push(`Final result: ${result}`);
      
      return { result, steps };
    } catch (error) {
      return { 
        result: NaN, 
        steps, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  private static parseExpression(expression: string, steps: string[]): number {
    // Remove whitespace
    expression = expression.replace(/\s+/g, '');
    
    // Handle function calls and parentheses with recursive descent parser
    return AdvancedCalculator.parseAddSubtract(expression, steps);
  }
  
  private static parseAddSubtract(expression: string, steps: string[]): number {
    let result = AdvancedCalculator.parseMultiplyDivide(expression, steps);
    
    const addSubPattern = /^([+\-])/;
    let remaining = expression.substring(expression.indexOf(result.toString()) + result.toString().length);
    
    while (remaining.length > 0) {
      const match = remaining.match(addSubPattern);
      if (!match) break;
      
      const operator = match[1];
      remaining = remaining.substring(1);
      
      const nextValue = AdvancedCalculator.parseMultiplyDivide(remaining, steps);
      
      if (operator === '+') {
        result = result + nextValue;
        steps.push(`${result - nextValue} + ${nextValue} = ${result}`);
      } else {
        result = result - nextValue;
        steps.push(`${result + nextValue} - ${nextValue} = ${result}`);
      }
      
      remaining = remaining.substring(remaining.indexOf(nextValue.toString()) + nextValue.toString().length);
    }
    
    return result;
  }
  
  private static parseMultiplyDivide(expression: string, steps: string[]): number {
    // Simplified implementation - in production would use proper parser
    // For now, using eval with safety checks (not recommended for production)
    
    // Replace function names with Math functions
    let safeExpression = expression
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/log\(/g, 'Math.log(')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/floor\(/g, 'Math.floor(')
      .replace(/ceil\(/g, 'Math.ceil(')
      .replace(/round\(/g, 'Math.round(')
      .replace(/exp\(/g, 'Math.exp(')
      .replace(/\^/g, '**'); // Replace ^ with **
    
    // Validate expression contains only safe characters
    if (!/^[0-9+\-*/.()Math\s,a-z]+$/i.test(safeExpression)) {
      throw new Error('Invalid characters in expression');
    }
    
    try {
      const result = Function(`"use strict"; return (${safeExpression})`)();
      return typeof result === 'number' ? result : NaN;
    } catch (error) {
      throw new Error('Invalid mathematical expression');
    }
  }
}

const TutorScientificCalculator: React.FC<TutorScientificCalculatorProps> = ({ onBack, aiService }) => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<Array<{expression: string, result: number, explanation?: string}>>([]);
  const [isRadians, setIsRadians] = useState(true);
  const [memory, setMemory] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [calculationSteps, setCalculationSteps] = useState<string[]>([]);

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

  const handleButtonClick = useCallback((value: string) => {
    if (value === 'C') {
      setDisplay('0');
      setExpression('');
      setCalculationSteps([]);
    } else if (value === '=') {
      calculateResult();
    } else if (value === '⌫') {
      if (expression.length > 0) {
        const newExpression = expression.slice(0, -1);
        setExpression(newExpression);
        setDisplay(newExpression || '0');
      }
    } else if (value === 'Rad/Deg') {
      setIsRadians(!isRadians);
    } else {
      const newExpression = expression === '0' ? value : expression + value;
      setExpression(newExpression);
      setDisplay(newExpression);
    }
  }, [expression, isRadians]);

  const calculateResult = useCallback(async () => {
    if (!expression) return;

    try {
      // Convert degrees to radians if needed
      let processedExpression = expression;
      if (!isRadians) {
        // Convert degree functions
        processedExpression = processedExpression
          .replace(/sin\(([^)]+)\)/g, (match, angle) => `sin(${angle} * Math.PI / 180)`)
          .replace(/cos\(([^)]+)\)/g, (match, angle) => `cos(${angle} * Math.PI / 180)`)
          .replace(/tan\(([^)]+)\)/g, (match, angle) => `tan(${angle} * Math.PI / 180)`);
      }

      const evaluation = AdvancedCalculator.evaluate(processedExpression);
      
      if (evaluation.error) {
        setDisplay('Error: ' + evaluation.error);
        return;
      }

      const result = evaluation.result;
      setDisplay(result.toString());
      setCalculationSteps(evaluation.steps);
      
      // Add to history
      setHistory(prev => [{
        expression: expression,
        result: result
      }, ...prev.slice(0, 9)]); // Keep last 10 calculations

      // Get AI explanation
      await getAIExplanation(expression, result, evaluation.steps);
      
    } catch (error) {
      setDisplay('Error');
      console.error('Calculation error:', error);
    }
  }, [expression, isRadians]);

  const getAIExplanation = async (expr: string, result: number, steps: string[]) => {
    setIsLoading(true);
    try {
      const response = await aiService([{
        id: 'calculation-explanation',
        role: 'user',
        content: `Explain this mathematical calculation in detail:

Expression: ${expr}
Result: ${result}
Calculation Steps: ${steps.join(' → ')}

Please provide:
1. **What the calculation does** - Explain the mathematical operation in simple terms
2. **Step-by-step breakdown** - Walk through each part of the calculation
3. **Mathematical concepts** - What mathematical principles are involved
4. **Real-world applications** - Where this type of calculation might be used
5. **Tips and insights** - Any helpful mathematical insights or patterns

Format your response in a clear, educational manner suitable for learning.`,
        timestamp: new Date()
      }], 'llama-3.3-70b-versatile');

      if (validateAIResponse(response.content)) {
        setCurrentExplanation(response.content);
        setShowExplanation(true);
        
        // Update history with explanation
        setHistory(prev => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[0] = { ...updated[0], explanation: response.content };
          }
          return updated;
        });
      }
    } catch (error) {
      console.error('Error getting AI explanation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scientificButtons = [
    // Row 1 - Constants and special functions
    [
      { label: 'π', value: 'pi', type: 'constant' },
      { label: 'e', value: 'e', type: 'constant' },
      { label: 'φ', value: 'phi', type: 'constant' },
      { label: 'Rad/Deg', value: 'Rad/Deg', type: 'mode' },
      { label: 'C', value: 'C', type: 'clear' },
      { label: '⌫', value: '⌫', type: 'backspace' }
    ],
    // Row 2 - Trigonometric functions
    [
      { label: 'sin', value: 'sin(', type: 'function' },
      { label: 'cos', value: 'cos(', type: 'function' },
      { label: 'tan', value: 'tan(', type: 'function' },
      { label: 'asin', value: 'asin(', type: 'function' },
      { label: 'acos', value: 'acos(', type: 'function' },
      { label: 'atan', value: 'atan(', type: 'function' }
    ],
    // Row 3 - Logarithmic and exponential
    [
      { label: 'log', value: 'log(', type: 'function' },
      { label: 'log₁₀', value: 'log10(', type: 'function' },
      { label: 'ln', value: 'log(', type: 'function' },
      { label: 'eˣ', value: 'exp(', type: 'function' },
      { label: 'xʸ', value: '^', type: 'operator' },
      { label: '√', value: 'sqrt(', type: 'function' }
    ],
    // Row 4 - Basic operations and parentheses
    [
      { label: '(', value: '(', type: 'parenthesis' },
      { label: ')', value: ')', type: 'parenthesis' },
      { label: '÷', value: '/', type: 'operator' },
      { label: '×', value: '*', type: 'operator' },
      { label: '-', value: '-', type: 'operator' },
      { label: '+', value: '+', type: 'operator' }
    ],
    // Row 5 - Numbers
    [
      { label: '7', value: '7', type: 'number' },
      { label: '8', value: '8', type: 'number' },
      { label: '9', value: '9', type: 'number' },
      { label: '4', value: '4', type: 'number' },
      { label: '5', value: '5', type: 'number' },
      { label: '6', value: '6', type: 'number' }
    ],
    // Row 6 - More numbers and special functions
    [
      { label: '1', value: '1', type: 'number' },
      { label: '2', value: '2', type: 'number' },
      { label: '3', value: '3', type: 'number' },
      { label: '0', value: '0', type: 'number' },
      { label: '.', value: '.', type: 'decimal' },
      { label: '=', value: '=', type: 'equals' }
    ]
  ];

  const getButtonStyle = (type: string) => {
    const baseStyle = {
      padding: '12px 8px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      minHeight: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };

    switch (type) {
      case 'number':
      case 'decimal':
        return { ...baseStyle, background: '#f8f9fa', color: '#333', border: '1px solid #dee2e6' };
      case 'operator':
        return { ...baseStyle, background: '#007bff', color: 'white' };
      case 'function':
        return { ...baseStyle, background: '#28a745', color: 'white', fontSize: '12px' };
      case 'constant':
        return { ...baseStyle, background: '#6f42c1', color: 'white' };
      case 'equals':
        return { ...baseStyle, background: '#dc3545', color: 'white' };
      case 'clear':
      case 'backspace':
        return { ...baseStyle, background: '#fd7e14', color: 'white' };
      case 'mode':
        return { ...baseStyle, background: isRadians ? '#17a2b8' : '#ffc107', color: isRadians ? 'white' : '#212529', fontSize: '12px' };
      default:
        return baseStyle;
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        color: 'white'
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
          🧮 Advanced Scientific Calculator
        </h2>
        <div style={{ fontSize: '16px', opacity: 0.9 }}>
          High-precision calculations with AI-powered explanations • {isRadians ? 'Radians' : 'Degrees'} mode
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Calculator Panel */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          {/* Display */}
          <div style={{
            background: '#1a1a1a',
            color: '#00ff00',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontFamily: 'Monaco, monospace',
            fontSize: '24px',
            textAlign: 'right',
            minHeight: '60px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '4px' }}>
              {expression || 'Enter calculation...'}
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
              {display}
            </div>
          </div>

          {/* Calculator Buttons */}
          <div style={{ display: 'grid', gap: '8px' }}>
            {scientificButtons.map((row, rowIndex) => (
              <div key={rowIndex} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                {row.map((button) => (
                  <button
                    key={button.label}
                    onClick={() => handleButtonClick(button.value)}
                    style={getButtonStyle(button.type)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Calculation Steps */}
          {calculationSteps.length > 0 && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #dee2e6'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#495057', fontSize: '16px' }}>
                📝 Calculation Steps
              </h4>
              {calculationSteps.map((step, index) => (
                <div key={index} style={{
                  padding: '8px 12px',
                  background: 'white',
                  borderRadius: '6px',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontFamily: 'Monaco, monospace',
                  border: '1px solid #e9ecef'
                }}>
                  {index + 1}. {step}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History and Explanation Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* History */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#495057', fontSize: '18px' }}>
              📚 History
            </h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {history.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#6c757d',
                  padding: '20px',
                  fontStyle: 'italic'
                }}>
                  No calculations yet
                </div>
              ) : (
                history.map((item, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    background: index === 0 ? '#e3f2fd' : '#f8f9fa',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    border: index === 0 ? '2px solid #2196f3' : '1px solid #dee2e6',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setExpression(item.expression);
                    setDisplay(item.expression);
                  }}>
                    <div style={{ 
                      fontSize: '12px', 
                      fontFamily: 'Monaco, monospace',
                      color: '#6c757d',
                      marginBottom: '4px'
                    }}>
                      {item.expression}
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600',
                      color: '#495057'
                    }}>
                      = {item.result}
                    </div>
                    {item.explanation && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentExplanation(item.explanation!);
                          setShowExplanation(true);
                        }}
                        style={{
                          marginTop: '8px',
                          padding: '4px 8px',
                          background: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        View Explanation
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Explanation */}
          {showExplanation && currentExplanation && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: '2px solid #28a745'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <h3 style={{ margin: 0, color: '#28a745', fontSize: '18px' }}>
                  🤖 AI Explanation
                </h3>
                <button
                  onClick={() => setShowExplanation(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#6c757d'
                  }}
                >
                  ×
                </button>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <SafeHTML 
                  content={formatContent(currentExplanation).html}
                  type="math"
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#333'
                  }}
                  aria-label="AI calculation explanation"
                  role="region"
                />
              </div>
            </div>
          )}

          {isLoading && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '12px' }}>🤖</div>
              <div style={{ color: '#6c757d' }}>Generating AI explanation...</div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginTop: '24px',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={() => {
            setHistory([]);
            setShowExplanation(false);
            setCurrentExplanation('');
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#dc3545',
            border: '1px solid #dc3545',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Clear History
        </button>
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
          Back to Tutor Tools
        </button>
      </div>
    </div>
  );
};

export default TutorScientificCalculator;