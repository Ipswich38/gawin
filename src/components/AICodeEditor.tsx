'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';

interface CodingMentorProps {
  onMinimize?: () => void;
}

const CodingMentor: React.FC<CodingMentorProps> = ({ onMinimize }) => {
  const [generatedCode, setGeneratedCode] = useState('# Welcome to Gawin AI Coding Mentor\n# Your AI-powered coding companion and tutor\n\nprint("Hello, World!")');
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 600, height: 700 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize position (center-right)
  useEffect(() => {
    const updatePosition = () => {
      const padding = 20;
      setPosition({
        x: window.innerWidth - size.width - padding,
        y: Math.max(padding, (window.innerHeight - size.height) / 2)
      });
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [size.width, size.height]);

  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.resize-handle')) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    }
    
    if (isResizing) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const newWidth = Math.max(400, Math.min(800, e.clientX - rect.left));
        const newHeight = Math.max(500, Math.min(900, e.clientY - rect.top));
        setSize({ width: newWidth, height: newHeight });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, size]);

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
    <div 
      className="fixed z-50"
      style={isMobile ? {
        // Mobile: Fixed full screen overlay
        inset: 0,
        width: '100%',
        height: '100%'
      } : {
        // Desktop: Draggable and resizable
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height
      }}
    >
      {isMobile && <div className="fixed inset-0 bg-black/50" />}
      
      <div 
        ref={containerRef}
        className={`w-full h-full flex flex-col rounded-2xl shadow-2xl backdrop-blur-xl border border-white/20 overflow-hidden ${isMobile ? '' : 'cursor-move'}`}
        style={{ backgroundColor: '#051a1c' }}
        onMouseDown={isMobile ? undefined : handleMouseDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">👨‍💻</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Gawin AI Coding Mentor</h2>
              <p className="text-sm text-white/70">Your AI-powered coding companion</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isMobile && onMinimize && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onMinimize}
                className="text-white/70 hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,11 12,14 15,11"></polyline>
                </svg>
              </Button>
            )}
            
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
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={isMobile ? onMinimize : onMinimize}
              className="text-white/70 hover:text-white"
            >
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
        <div className="px-4 py-3 border-t flex justify-between items-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="text-xs text-white/60">
            Generate code with AI, edit as needed, then copy to your project
          </div>
          <div className="flex items-center space-x-4 text-xs text-white/70">
            <span>🤖 AI-Powered Coding Mentor</span>
          </div>
        </div>
        
        {/* Resize Handle - Desktop only */}
        {!isMobile && (
          <div 
            className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsResizing(true);
            }}
            style={{
              background: 'linear-gradient(-45deg, transparent 30%, rgba(147, 51, 234, 0.3) 30%, rgba(147, 51, 234, 0.3) 70%, transparent 70%)',
              backgroundSize: '6px 6px'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CodingMentor;