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
  const [size, setSize] = useState({ width: 400, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [preFullScreenState, setPreFullScreenState] = useState({ position: { x: 0, y: 0 }, size: { width: 400, height: 600 } });
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
    if (isDragging && !isFullScreen) {
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    }
    
    if (isResizing && !isFullScreen) {
      let newSize = { ...size };
      let newPosition = { ...position };
      
      if (resizeDirection.includes('right')) {
        newSize.width = Math.max(300, Math.min(800, e.clientX - position.x));
      }
      if (resizeDirection.includes('left')) {
        const newWidth = Math.max(300, Math.min(800, position.x + size.width - e.clientX));
        newPosition.x = Math.max(0, e.clientX);
        newSize.width = newWidth;
      }
      if (resizeDirection.includes('bottom')) {
        newSize.height = Math.max(400, Math.min(900, e.clientY - position.y));
      }
      if (resizeDirection.includes('top')) {
        const newHeight = Math.max(400, Math.min(900, position.y + size.height - e.clientY));
        newPosition.y = Math.max(0, e.clientY);
        newSize.height = newHeight;
      }
      
      setSize(newSize);
      setPosition(newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection('');
  };

  const toggleFullScreen = () => {
    if (isFullScreen) {
      // Exit full screen
      setPosition(preFullScreenState.position);
      setSize(preFullScreenState.size);
      setIsFullScreen(false);
    } else {
      // Enter full screen
      setPreFullScreenState({ position, size });
      setPosition({ x: 20, y: 20 });
      setSize({ width: window.innerWidth - 40, height: window.innerHeight - 40 });
      setIsFullScreen(true);
    }
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
        style={{ backgroundColor: 'rgba(5, 26, 28, 0.95)' }}
        onMouseDown={isMobile ? undefined : handleMouseDown}
      >
        {/* Header - Mobile First Design */}
        <div className="flex items-center justify-between p-3 border-b border-white/10" style={{ backgroundColor: 'rgba(147, 51, 234, 0.15)' }}>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-sm">👨‍💻</span>
            </div>
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-white leading-tight">Coding Mentor</h2>
              <span className="text-xs text-white/60 leading-tight">AI Assistant</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Language Selector - Compact */}
            <div className="group relative">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-8 h-8 rounded-lg text-xs text-white bg-white/10 border border-white/20 focus:ring-1 focus:ring-white/40 focus:outline-none cursor-pointer appearance-none flex items-center justify-center text-center hover:scale-110 transition-transform"
              >
                {languages.map(lang => (
                  <option key={lang.id} value={lang.id} style={{ backgroundColor: 'rgba(147, 51, 234, 0.95)', color: 'white' }}>
                    {lang.icon}
                  </option>
                ))}
              </select>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white/70 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {languages.find(l => l.id === selectedLanguage)?.name}
              </div>
            </div>

            {/* Full Screen Icon */}
            {!isMobile && (
              <div className="group relative">
                <button 
                  onClick={toggleFullScreen}
                  className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:scale-110 transition-all hover:bg-white/20"
                  aria-label={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                >
                  {isFullScreen ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                    </svg>
                  )}
                </button>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white/70 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {isFullScreen ? 'Exit' : 'Focus'}
                </div>
              </div>
            )}

            {/* Minimize Icon */}
            {!isMobile && onMinimize && (
              <div className="group relative">
                <button 
                  onClick={onMinimize}
                  className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:scale-110 transition-all hover:bg-white/20"
                  aria-label="Minimize Panel"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,11 12,14 15,11"></polyline>
                  </svg>
                </button>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white/70 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Hide
                </div>
              </div>
            )}
            
            {/* Close Icon */}
            <div className="group relative">
              <button 
                onClick={onMinimize}
                className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:scale-110 transition-all hover:bg-white/20"
                aria-label="Close Panel"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white/70 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Close
              </div>
            </div>
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
                  backgroundColor: 'rgba(5, 26, 28, 0.95)',
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
        
        {/* Resize Handles - Desktop only */}
        {!isMobile && !isFullScreen && (
          <>
            {/* Corner Handles */}
            <div 
              className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('bottom-right');
              }}
              style={{
                background: 'linear-gradient(-45deg, transparent 30%, rgba(147, 51, 234, 0.3) 30%, rgba(147, 51, 234, 0.3) 70%, transparent 70%)',
                backgroundSize: '6px 6px'
              }}
            />
            <div 
              className="resize-handle absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('bottom-left');
              }}
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(147, 51, 234, 0.3) 30%, rgba(147, 51, 234, 0.3) 70%, transparent 70%)',
                backgroundSize: '6px 6px'
              }}
            />
            <div 
              className="resize-handle absolute top-0 right-0 w-4 h-4 cursor-ne-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('top-right');
              }}
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(147, 51, 234, 0.3) 30%, rgba(147, 51, 234, 0.3) 70%, transparent 70%)',
                backgroundSize: '6px 6px'
              }}
            />
            <div 
              className="resize-handle absolute top-0 left-0 w-4 h-4 cursor-nw-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('top-left');
              }}
              style={{
                background: 'linear-gradient(-45deg, transparent 30%, rgba(147, 51, 234, 0.3) 30%, rgba(147, 51, 234, 0.3) 70%, transparent 70%)',
                backgroundSize: '6px 6px'
              }}
            />
            
            {/* Edge Handles */}
            <div 
              className="resize-handle absolute top-0 left-4 right-4 h-2 cursor-n-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('top');
              }}
              style={{
                background: 'linear-gradient(to bottom, rgba(147, 51, 234, 0.3) 0%, transparent 100%)'
              }}
            />
            <div 
              className="resize-handle absolute bottom-0 left-4 right-4 h-2 cursor-s-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('bottom');
              }}
              style={{
                background: 'linear-gradient(to top, rgba(147, 51, 234, 0.3) 0%, transparent 100%)'
              }}
            />
            <div 
              className="resize-handle absolute left-0 top-4 bottom-4 w-2 cursor-w-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('left');
              }}
              style={{
                background: 'linear-gradient(to right, rgba(147, 51, 234, 0.3) 0%, transparent 100%)'
              }}
            />
            <div 
              className="resize-handle absolute right-0 top-4 bottom-4 w-2 cursor-e-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('right');
              }}
              style={{
                background: 'linear-gradient(to left, rgba(147, 51, 234, 0.3) 0%, transparent 100%)'
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default CodingMentor;