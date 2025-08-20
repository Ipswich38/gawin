'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function MathPage() {
  const [equation, setEquation] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleSolve = async () => {
    if (!equation.trim()) return;
    
    setIsCalculating(true);
    // Simulate math solving
    setTimeout(() => {
      setResults({
        solution: equation + ' = x',
        steps: [
          'Step 1: Identify the equation type',
          'Step 2: Apply appropriate mathematical operations',
          'Step 3: This is a demo - full math solver coming soon!'
        ]
      });
      setIsCalculating(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#fffbeb' }}>
      {/* Apple-style Header */}
      <header className="border-b border-gray-200/30">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#051a1c' }}>
                <span className="text-white font-semibold text-sm">K</span>
              </div>
              <span className="text-base font-medium" style={{ color: '#051a1c' }}>KreativLoops AI</span>
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
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 mb-4">
            <span className="text-2xl">🔢</span>
            <h1 className="text-3xl font-normal" style={{ color: '#051a1c' }}>Math Problem Solver</h1>
          </div>
          <p className="text-lg opacity-60" style={{ color: '#051a1c' }}>
            Solve mathematical equations with step-by-step explanations
          </p>
        </div>

        {/* Input Area - Apple Style */}
        <div className="max-w-3xl mx-auto w-full">
          <div className="mb-6">
            <input
              type="text"
              value={equation}
              onChange={(e) => setEquation(e.target.value)}
              placeholder="Enter your math equation (e.g., 2x + 5 = 13)"
              className="w-full px-6 py-5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-base shadow-sm"
              style={{ color: '#051a1c' }}
            />
          </div>
          
          <div className="flex justify-center mb-8">
            <button
              onClick={handleSolve}
              disabled={!equation.trim() || isCalculating}
              className="text-white px-8 py-4 rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base font-medium shadow-lg"
              style={{ backgroundColor: '#051a1c' }}
            >
              {isCalculating ? 'Solving...' : 'Solve Equation'}
            </button>
          </div>

          {/* Results - Apple Style */}
          {results && (
            <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="font-medium text-lg mb-4" style={{ color: '#051a1c' }}>Solution</h3>
              <div className="mb-4">
                <div className="text-base font-medium mb-2" style={{ color: '#051a1c' }}>{results.solution}</div>
                <div className="space-y-2">
                  {results.steps.map((step: string, index: number) => (
                    <div key={index} className="text-base opacity-70" style={{ color: '#051a1c' }}>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-sm opacity-50" style={{ color: '#051a1c' }}>Full math solver coming soon with advanced features.</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}