'use client';

import React, { useState, useRef } from 'react';
import { Button } from './ui/Button';

interface AICodeEditorProps {
  onClose?: () => void;
}

const AICodeEditor: React.FC<AICodeEditorProps> = ({ onClose }) => {
  const [generatedCode, setGeneratedCode] = useState('# Welcome to Gawin AI Code Workspace\n# Ask AI to generate code and it will appear here\n\nprint("Hello, World!")');
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const languages = [
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'javascript', name: 'JavaScript', icon: '🟨' },
    { id: 'typescript', name: 'TypeScript', icon: '🔷' },
    { id: 'java', name: 'Java', icon: '☕' },
    { id: 'cpp', name: 'C++', icon: '⚡' },
    { id: 'html', name: 'HTML', icon: '🌐' },
    { id: 'css', name: 'CSS', icon: '🎨' },
    { id: 'sql', name: 'SQL', icon: '🗃️' }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      // Show a brief success feedback
      const button = document.querySelector('.copy-button');
      if (button) {
        const originalText = button.textContent;
        button.textContent = '✅ Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const clearCode = () => {
    setGeneratedCode('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const generateCode = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { 
              role: 'user', 
              content: `Generate ${selectedLanguage} code for: ${prompt}. Return only the code with brief comments, no explanations.` 
            }
          ],
          action: 'code'
        }),
      });

      const data = await response.json();
      
      if (data.success && data.data?.response) {
        setGeneratedCode(data.data.response);
        setPrompt('');
      }
    } catch (error) {
      console.error('Code generation error:', error);
    }
    setIsGenerating(false);
  };


  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      python: '#3776ab',
      javascript: '#f7df1e',
      typescript: '#3178c6',
      java: '#ed8b00',
      cpp: '#00599c',
      html: '#e34f26',
      css: '#1572b6',
      sql: '#336791'
    };
    return colors[lang] || '#666';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl" style={{ backgroundColor: '#051a1c' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 rounded-t-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">💻</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Gawin AI Code Workspace</h2>
              <p className="text-xs text-white/70">Generate, edit, and copy code</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-1 rounded-lg text-sm text-white focus:ring-2 focus:ring-white/40 focus:outline-none"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              {languages.map(lang => (
                <option key={lang.id} value={lang.id} style={{ backgroundColor: '#051a1c', color: 'white' }}>
                  {lang.icon} {lang.name}
                </option>
              ))}
            </select>
            
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        {/* AI Prompt Bar */}
        <div className="p-4 border-b border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateCode()}
                placeholder={`Ask AI to generate ${selectedLanguage} code...`}
                className="w-full px-6 py-3 text-white placeholder-white/70 transition-all focus:outline-none focus:ring-2 focus:ring-white/40 shadow-lg backdrop-blur-md"
                style={{ 
                  backgroundColor: '#051a1c',
                  borderRadius: '32px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-white/40">
                Press Enter ↵
              </div>
            </div>
            <Button 
              variant="primary" 
              onClick={generateCode}
              disabled={!prompt.trim() || isGenerating}
              isLoading={isGenerating}
            >
              {isGenerating ? 'Generating...' : '🤖 Generate'}
            </Button>
          </div>
        </div>

        {/* Code Editor Area */}
        <div className="flex-1 flex flex-col" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center space-x-2">
              <span 
                className="px-2 py-1 rounded text-xs font-medium text-white"
                style={{ backgroundColor: getLanguageColor(selectedLanguage) }}
              >
                {selectedLanguage.toUpperCase()}
              </span>
              <span className="text-xs text-white/70">Code Workspace</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearCode}
                className="text-white/70 hover:text-white"
              >
                🗑️ Clear
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyToClipboard}
                className="copy-button text-white border-white/20 hover:bg-white/10"
              >
                📋 Copy Code
              </Button>
            </div>
          </div>
          
          {/* Code Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={generatedCode}
              onChange={(e) => setGeneratedCode(e.target.value)}
              className="w-full h-full p-6 font-mono text-sm border-none resize-none focus:outline-none text-green-400"
              placeholder={`Your ${selectedLanguage} code will appear here...\n\nYou can edit it directly and copy when ready.`}
              spellCheck={false}
              style={{
                backgroundColor: '#2d2d2d',
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                lineHeight: '1.6',
                tabSize: 2
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t rounded-b-2xl flex justify-between items-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="text-xs text-white/60">
            Generate code with AI, edit as needed, then copy to your project
          </div>
          <div className="flex items-center space-x-4 text-xs text-white/70">
            <span>🤖 AI-Powered</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICodeEditor;