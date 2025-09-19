'use client';

import React, { useState, useRef, useEffect } from 'react';

interface CodingMentorProps {
  onMinimize?: () => void;
  initialCode?: string;
  language?: string;
  isInline?: boolean;
  onCollapse?: () => void;
}

const CodingMentor: React.FC<CodingMentorProps> = ({ onMinimize, initialCode, language, isInline = false, onCollapse }) => {
  const [generatedCode, setGeneratedCode] = useState(initialCode || '# Welcome to Gawin AI Coding Mentor\n# Your AI-powered coding companion and tutor\n\nprint("Hello, World!")');
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(language || 'python');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 400, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
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
      setPosition(preFullScreenState.position);
      setSize(preFullScreenState.size);
      setIsFullScreen(false);
    } else {
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
    { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'java', name: 'Java' },
    { id: 'cpp', name: 'C++' },
    { id: 'html', name: 'HTML' },
    { id: 'css', name: 'CSS' },
    { id: 'sql', name: 'SQL' }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
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

  // For inline mode on mobile, render differently
  if (isInline || isMobile) {
    return (
      <div className="w-full border border-gray-200 rounded-lg overflow-hidden mb-4 bg-gray-800">
        {/* Collapsible Header */}
        <div className="px-4 py-3 bg-gray-700 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">{'</>'}</span>
              </div>
              <div>
                <div className="font-medium text-white text-sm">Code Editor</div>
                <div className="text-gray-300 text-xs">{selectedLanguage}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 text-gray-300 hover:text-white transition-colors"
                title={isCollapsed ? 'Expand' : 'Collapse'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {isCollapsed ? (
                    <path d="M18 15l-6-6-6 6"/>
                  ) : (
                    <path d="M6 9l6 6 6-6"/>
                  )}
                </svg>
              </button>

              {onMinimize && (
                <button
                  onClick={onMinimize}
                  className="p-1 text-gray-300 hover:text-white transition-colors"
                  title="Close"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Content */}
        {!isCollapsed && (
          <div className="space-y-3 p-4">
            {/* Language Selector */}
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-300">Language:</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-1 text-sm bg-gray-600 text-white border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map(lang => (
                  <option key={lang.id} value={lang.id}>{lang.name}</option>
                ))}
              </select>
            </div>

            {/* Prompt Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateCode()}
                placeholder="Ask AI to generate code..."
                className="flex-1 px-3 py-2 text-sm bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              />
              <button
                onClick={generateCode}
                disabled={!prompt.trim() || isGenerating}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md disabled:opacity-50 hover:bg-blue-700 transition-colors"
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-300 hover:text-white transition-colors"
                title="Copy code"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                <span>Copy</span>
              </button>

              <button
                onClick={clearCode}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-300 hover:text-white transition-colors"
                title="Clear code"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
                </svg>
                <span>Clear</span>
              </button>
            </div>

            {/* Code Editor */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={generatedCode}
                onChange={(e) => setGeneratedCode(e.target.value)}
                placeholder="Your code will appear here..."
                className="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-gray-100 border border-gray-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                spellCheck={false}
                style={{
                  lineHeight: '1.5',
                  tabSize: 2
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop popup mode
  return (
    <div
      className="fixed z-50"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height
      }}
    >
      <div
        ref={containerRef}
        className="w-full h-full flex flex-col border border-gray-200 rounded-3xl overflow-hidden cursor-move"
        style={{ backgroundColor: '#435b67' }}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-900 rounded-sm flex items-center justify-center">
                <span className="text-white text-xs">{'</>'}</span>
              </div>
              <div>
                <div className="font-medium text-white text-sm">Coding Mentor</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              {!isMobile && (
                <button
                  onClick={toggleFullScreen}
                  className="w-6 h-6 text-gray-300 hover:text-white"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                  </svg>
                </button>
              )}
              
              <button
                onClick={onMinimize}
                className="w-6 h-6 text-gray-300 hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div className="px-3 py-2 bg-gray-600">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full px-2 py-1 text-sm border-0 bg-transparent text-gray-200 focus:outline-none"
          >
            {languages.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>
        </div>

        {/* Prompt Input */}
        <div className="px-3 py-2">
          <div className="flex space-x-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateCode()}
              placeholder="Ask AI to generate code..."
              className="flex-1 px-3 py-1.5 text-sm border border-gray-400 rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-300"
            />
            <button
              onClick={generateCode}
              disabled={!prompt.trim() || isGenerating}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-2xl disabled:opacity-50 hover:bg-blue-700"
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-3 py-2">
          <div className="flex space-x-2">
            <button
              onClick={copyToClipboard}
              className="px-2 py-1.5 text-gray-300 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
            <button
              onClick={clearCode}
              className="px-2 py-1.5 text-gray-300 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={generatedCode}
            onChange={(e) => setGeneratedCode(e.target.value)}
            placeholder="Your code will appear here..."
            className="w-full h-full p-3 font-mono text-sm resize-none border-0 bg-gray-900 text-gray-100 focus:outline-none"
            spellCheck={false}
          />
        </div>

        {/* Resize Handles */}
        {!isMobile && !isFullScreen && (
          <>
            <div 
              className="resize-handle absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('bottom-right');
              }}
            />
            <div 
              className="resize-handle absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('bottom-left');
              }}
            />
            <div 
              className="resize-handle absolute top-0 right-0 w-3 h-3 cursor-ne-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('top-right');
              }}
            />
            <div 
              className="resize-handle absolute top-0 left-0 w-3 h-3 cursor-nw-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('top-left');
              }}
            />
            <div 
              className="resize-handle absolute top-0 left-3 right-3 h-1 cursor-n-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('top');
              }}
            />
            <div 
              className="resize-handle absolute bottom-0 left-3 right-3 h-1 cursor-s-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('bottom');
              }}
            />
            <div 
              className="resize-handle absolute left-0 top-3 bottom-3 w-1 cursor-w-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('left');
              }}
            />
            <div 
              className="resize-handle absolute right-0 top-3 bottom-3 w-1 cursor-e-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('right');
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default CodingMentor;