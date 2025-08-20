'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function GrammarPage() {
  const [text, setText] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = async () => {
    if (!text.trim()) return;
    
    setIsChecking(true);
    // Simulate grammar checking
    setTimeout(() => {
      setResults({
        corrected: text,
        suggestions: [
          { original: 'example', suggestion: 'This is a demo - real grammar checking coming soon!' }
        ]
      });
      setIsChecking(false);
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
            <span className="text-2xl">📝</span>
            <h1 className="text-3xl font-normal" style={{ color: '#051a1c' }}>Grammar Checker</h1>
          </div>
          <p className="text-lg opacity-60" style={{ color: '#051a1c' }}>
            Check and improve your writing with AI-powered grammar assistance
          </p>
        </div>

        {/* Input Area - Apple Style */}
        <div className="max-w-3xl mx-auto w-full">
          <div className="mb-6">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your text here to check grammar and style..."
              className="w-full h-40 px-6 py-5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/30 transition-all resize-none text-base shadow-sm"
              style={{ color: '#051a1c' }}
            />
          </div>
          
          <div className="flex justify-center mb-8">
            <button
              onClick={handleCheck}
              disabled={!text.trim() || isChecking}
              className="text-white px-8 py-4 rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base font-medium shadow-lg"
              style={{ backgroundColor: '#051a1c' }}
            >
              {isChecking ? 'Checking...' : 'Check Grammar'}
            </button>
          </div>

          {/* Results - Apple Style */}
          {results && (
            <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-sm">
              <h3 className="font-medium text-lg mb-4" style={{ color: '#051a1c' }}>Results</h3>
              <p className="text-base opacity-70 mb-4" style={{ color: '#051a1c' }}>{results.suggestions[0].suggestion}</p>
              <div className="text-sm opacity-50" style={{ color: '#051a1c' }}>Grammar checking feature coming soon with full AI integration.</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}