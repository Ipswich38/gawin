'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function TranslatorPage() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' }
  ];

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    
    setIsTranslating(true);
    // Simulate translation
    setTimeout(() => {
      setTranslatedText(`[Translation from ${sourceLang} to ${targetLang}] - This is a demo translation. Full AI translation coming soon!`);
      setIsTranslating(false);
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
            <span className="text-2xl">🌍</span>
            <h1 className="text-3xl font-normal" style={{ color: '#051a1c' }}>Smart Translator</h1>
          </div>
          <p className="text-lg opacity-60" style={{ color: '#051a1c' }}>
            Translate text between languages with AI-powered accuracy
          </p>
        </div>

        {/* Language Selection */}
        <div className="max-w-3xl mx-auto w-full mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="px-4 py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-base shadow-sm"
              style={{ color: '#051a1c' }}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
            
            <button
              onClick={() => {
                const temp = sourceLang;
                setSourceLang(targetLang);
                setTargetLang(temp);
                setSourceText(translatedText);
                setTranslatedText(sourceText);
              }}
              className="p-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl hover:bg-white/60 transition-all shadow-sm"
            >
              <span className="text-xl">⇄</span>
            </button>

            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="px-4 py-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-base shadow-sm"
              style={{ color: '#051a1c' }}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Translation Area */}
        <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium mb-3 opacity-70" style={{ color: '#051a1c' }}>
              Source Text
            </label>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Enter text to translate..."
              className="w-full h-40 px-6 py-5 bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/30 transition-all resize-none text-base shadow-sm"
              style={{ color: '#051a1c' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 opacity-70" style={{ color: '#051a1c' }}>
              Translation
            </label>
            <div className="w-full h-40 px-6 py-5 bg-white/20 backdrop-blur-sm border border-white/20 rounded-2xl text-base shadow-sm overflow-y-auto">
              {translatedText ? (
                <div style={{ color: '#051a1c' }}>{translatedText}</div>
              ) : (
                <div className="opacity-50" style={{ color: '#051a1c' }}>Translation will appear here...</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={handleTranslate}
            disabled={!sourceText.trim() || isTranslating}
            className="text-white px-8 py-4 rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base font-medium shadow-lg"
            style={{ backgroundColor: '#051a1c' }}
          >
            {isTranslating ? 'Translating...' : 'Translate'}
          </button>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium opacity-70" style={{ color: '#051a1c' }}>
              Translation Features
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/30 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center shadow-sm">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-medium mb-2" style={{ color: '#051a1c' }}>Accurate</div>
              <div className="text-sm opacity-60" style={{ color: '#051a1c' }}>Context-aware translations</div>
            </div>
            <div className="bg-white/30 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center shadow-sm">
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-medium mb-2" style={{ color: '#051a1c' }}>Fast</div>
              <div className="text-sm opacity-60" style={{ color: '#051a1c' }}>Instant translation results</div>
            </div>
            <div className="bg-white/30 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center shadow-sm">
              <div className="text-2xl mb-2">🌟</div>
              <div className="font-medium mb-2" style={{ color: '#051a1c' }}>Smart</div>
              <div className="text-sm opacity-60" style={{ color: '#051a1c' }}>AI-powered language understanding</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}