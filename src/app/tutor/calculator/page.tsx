'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function CalculatorPage() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const buttons = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=']
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#fffbeb' }}>
      {/* Apple-style Header */}
      <header className="border-b border-white/20 bg-white/20 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm" style={{ backgroundColor: '#051a1c' }}>
                <span className="text-white font-semibold text-sm">G</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-medium leading-tight" style={{ color: '#051a1c' }}>Gawin</span>
                <span className="text-xs opacity-50 leading-tight" style={{ color: '#051a1c' }}>by kreativloops AI</span>
              </div>
            </Link>
            <Link href="/">
              <button className="text-sm opacity-60 hover:opacity-80 transition-opacity" style={{ color: '#051a1c' }}>
                ← Back
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 mb-4">
            <span className="text-2xl">🧮</span>
            <h1 className="text-3xl font-normal" style={{ color: '#051a1c' }}>Calculator</h1>
          </div>
          <p className="text-lg opacity-60" style={{ color: '#051a1c' }}>
            Scientific calculator for your mathematical needs
          </p>
        </div>

        {/* Calculator Interface - Apple Style */}
        <div className="bg-white/50 backdrop-blur-md border border-white/40 rounded-2xl p-6 shadow-lg">
          {/* Display */}
          <div className="mb-6">
            <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 text-right border border-white/20">
              <div className="text-3xl font-mono overflow-hidden" style={{ color: '#051a1c' }}>
                {display}
              </div>
            </div>
          </div>

          {/* Button Grid */}
          <div className="grid grid-cols-4 gap-3">
            {buttons.flat().map((btn, index) => (
              <button
                key={index}
                onClick={() => {
                  if (btn === 'C') {
                    clear();
                  } else if (btn === '=') {
                    performCalculation();
                  } else if (['+', '-', '×', '÷'].includes(btn)) {
                    inputOperation(btn);
                  } else if (btn === '±') {
                    setDisplay(String(parseFloat(display) * -1));
                  } else if (btn === '%') {
                    setDisplay(String(parseFloat(display) / 100));
                  } else {
                    inputNumber(btn);
                  }
                }}
                className={`
                  h-14 rounded-2xl font-medium text-lg transition-all backdrop-blur-sm shadow-sm hover:scale-105
                  ${['C', '±', '%'].includes(btn) 
                    ? 'bg-white/60 border border-white/30 hover:bg-white/80' 
                    : ['+', '-', '×', '÷', '='].includes(btn)
                    ? 'text-white hover:opacity-90'
                    : 'bg-white/40 border border-white/20 hover:bg-white/60'
                  }
                  ${btn === '0' ? 'col-span-2' : ''}
                `}
                style={{
                  color: ['+', '-', '×', '÷', '='].includes(btn) ? 'white' : '#051a1c',
                  backgroundColor: ['+', '-', '×', '÷', '='].includes(btn) ? '#051a1c' : undefined
                }}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Functions */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-sm">
            <h3 className="font-medium mb-2" style={{ color: '#051a1c' }}>Scientific Functions</h3>
            <p className="text-sm opacity-60" style={{ color: '#051a1c' }}>Advanced mathematical operations coming soon.</p>
          </div>
          <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-sm">
            <h3 className="font-medium mb-2" style={{ color: '#051a1c' }}>History</h3>
            <p className="text-sm opacity-60" style={{ color: '#051a1c' }}>Calculation history feature coming soon.</p>
          </div>
        </div>
      </main>
    </div>
  );
}