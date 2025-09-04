'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';

interface CodeCell {
  id: string;
  type: 'code' | 'markdown';
  content: string;
  output?: string;
  language: string;
  isRunning?: boolean;
}

interface AICodeEditorProps {
  onClose?: () => void;
}

const AICodeEditor: React.FC<AICodeEditorProps> = ({ onClose }) => {
  const [cells, setCells] = useState<CodeCell[]>([
    {
      id: '1',
      type: 'code',
      content: '# Welcome to Gawin AI Code Editor\n# Ask AI to generate code and it will appear here\n\nprint("Hello, World!")',
      language: 'python'
    }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');

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

  const addNewCell = (type: 'code' | 'markdown' = 'code') => {
    const newCell: CodeCell = {
      id: Date.now().toString(),
      type,
      content: type === 'code' ? '# New code cell\n' : '# New markdown cell\n',
      language: selectedLanguage
    };
    setCells(prev => [...prev, newCell]);
  };

  const updateCell = (id: string, content: string) => {
    setCells(prev => prev.map(cell => 
      cell.id === id ? { ...cell, content } : cell
    ));
  };

  const deleteCell = (id: string) => {
    setCells(prev => prev.filter(cell => cell.id !== id));
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
        const newCell: CodeCell = {
          id: Date.now().toString(),
          type: 'code',
          content: data.data.response,
          language: selectedLanguage
        };
        setCells(prev => [...prev, newCell]);
        setPrompt('');
      }
    } catch (error) {
      console.error('Code generation error:', error);
    }
    setIsGenerating(false);
  };

  const runCell = async (id: string) => {
    // Simulate code execution (in a real implementation, you'd send to a backend)
    setCells(prev => prev.map(cell => 
      cell.id === id ? { ...cell, isRunning: true } : cell
    ));

    setTimeout(() => {
      setCells(prev => prev.map(cell => 
        cell.id === id ? { 
          ...cell, 
          isRunning: false,
          output: `✅ Code executed successfully\n// Output would appear here in a real environment`
        } : cell
      ));
    }, 1500);
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
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">⌨️</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Gawin AI Code Editor</h2>
              <p className="text-xs text-gray-500">Jupyter-inspired coding environment</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {languages.map(lang => (
                <option key={lang.id} value={lang.id}>
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
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateCode()}
                placeholder={`Ask AI to generate ${selectedLanguage} code...`}
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                Press Enter ↵
              </div>
            </div>
            <Button 
              variant="primary" 
              onClick={generateCode}
              disabled={!prompt.trim() || isGenerating}
              isLoading={isGenerating}
            >
              {isGenerating ? 'Generating...' : '🤖 Generate Code'}
            </Button>
          </div>
        </div>

        {/* Code Cells */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {cells.map((cell, index) => (
            <div key={cell.id} className="bg-white rounded-xl border shadow-sm">
              {/* Cell Header */}
              <div className="flex items-center justify-between p-3 bg-gray-50 border-b rounded-t-xl">
                <div className="flex items-center space-x-2">
                  <span 
                    className="px-2 py-1 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: getLanguageColor(cell.language) }}
                  >
                    {cell.language.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">Cell {index + 1}</span>
                  {cell.isRunning && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-orange-600">Running...</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {cell.type === 'code' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => runCell(cell.id)}
                      disabled={cell.isRunning}
                    >
                      ▶️ Run
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => deleteCell(cell.id)}>
                    🗑️
                  </Button>
                </div>
              </div>

              {/* Code Input */}
              <div className="relative">
                <textarea
                  value={cell.content}
                  onChange={(e) => updateCell(cell.id, e.target.value)}
                  className="w-full p-4 font-mono text-sm border-none resize-none focus:outline-none min-h-[120px] bg-gray-900 text-green-400"
                  placeholder={`Enter ${cell.language} code here...`}
                  spellCheck={false}
                  style={{
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                    lineHeight: '1.5',
                    tabSize: 2
                  }}
                />
              </div>

              {/* Output */}
              {cell.output && (
                <div className="border-t bg-gray-100">
                  <pre className="p-4 text-sm font-mono text-gray-700 whitespace-pre-wrap">
                    {cell.output}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t rounded-b-2xl flex justify-between items-center">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => addNewCell('code')}>
              ➕ Code Cell
            </Button>
            <Button variant="outline" size="sm" onClick={() => addNewCell('markdown')}>
              📝 Markdown Cell
            </Button>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>{cells.length} cells</span>
            <span>🤖 AI-Powered</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICodeEditor;