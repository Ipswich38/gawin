/**
 * Code Canvas Component
 * Interactive code editor for displaying and editing code snippets
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Play, Download, Maximize2, Minimize2, RotateCcw } from 'lucide-react';

interface CodeCanvasProps {
  code: string;
  language: string;
  title?: string;
  editable?: boolean;
  runnable?: boolean;
  onCodeChange?: (code: string) => void;
  onRun?: (code: string) => void;
  className?: string;
}

export default function CodeCanvas({
  code,
  language,
  title,
  editable = false,
  runnable = false,
  onCodeChange,
  onRun,
  className = ''
}: CodeCanvasProps) {
  const [currentCode, setCurrentCode] = useState(code);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentCode(code);
  }, [code]);

  useEffect(() => {
    if (editable && textareaRef.current) {
      adjustTextareaHeight();
    }
  }, [currentCode, editable]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCurrentCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleRun = async () => {
    if (!onRun) return;

    setIsRunning(true);
    setOutput('Running...');

    try {
      await onRun(currentCode);
      setOutput('Code executed successfully');
    } catch (error) {
      setOutput(`Error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDownload = () => {
    const fileExtensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      css: 'css',
      html: 'html',
      json: 'json',
      xml: 'xml',
      yaml: 'yml',
      markdown: 'md'
    };

    const extension = fileExtensions[language.toLowerCase()] || 'txt';
    const filename = title ? `${title}.${extension}` : `code.${extension}`;

    const blob = new Blob([currentCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setCurrentCode(code);
    onCodeChange?.(code);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getLanguageIcon = (lang: string) => {
    const icons: Record<string, string> = {
      javascript: '🟨',
      typescript: '🔷',
      python: '🐍',
      java: '☕',
      cpp: '⚡',
      c: '🔧',
      css: '🎨',
      html: '🌐',
      json: '📄',
      xml: '📋',
      yaml: '⚙️',
      markdown: '📝',
      sql: '🗃️',
      bash: '💻',
      shell: '🐚'
    };
    return icons[lang.toLowerCase()] || '📄';
  };

  return (
    <motion.div
      ref={canvasRef}
      className={`code-canvas ${isFullscreen ? 'fullscreen' : ''} ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="code-canvas-header">
        <div className="code-info">
          <span className="language-icon">{getLanguageIcon(language)}</span>
          <span className="language-name">{language}</span>
          {title && <span className="code-title">{title}</span>}
        </div>

        <div className="code-actions">
          {editable && currentCode !== code && (
            <button
              onClick={handleReset}
              className="action-btn reset-btn"
              title="Reset to original"
            >
              <RotateCcw size={16} />
            </button>
          )}

          <button
            onClick={handleCopy}
            className="action-btn copy-btn"
            title="Copy code"
          >
            <Copy size={16} />
            {copied && <span className="copied-indicator">✓</span>}
          </button>

          {runnable && (
            <button
              onClick={handleRun}
              className="action-btn run-btn"
              disabled={isRunning}
              title="Run code"
            >
              <Play size={16} />
              {isRunning && <span className="running-indicator">⏳</span>}
            </button>
          )}

          <button
            onClick={handleDownload}
            className="action-btn download-btn"
            title="Download file"
          >
            <Download size={16} />
          </button>

          <button
            onClick={toggleFullscreen}
            className="action-btn fullscreen-btn"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="code-canvas-content">
        {editable ? (
          <textarea
            ref={textareaRef}
            value={currentCode}
            onChange={handleCodeChange}
            className="code-textarea"
            spellCheck={false}
            placeholder="Enter your code here..."
            style={{
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              fontSize: '14px',
              lineHeight: '1.5',
            }}
          />
        ) : (
          <pre className="code-display">
            <code className={`language-${language}`}>
              {currentCode}
            </code>
          </pre>
        )}
      </div>

      {/* Output Panel */}
      <AnimatePresence>
        {(runnable && output) && (
          <motion.div
            className="code-output"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="output-header">
              <span className="output-label">Output</span>
            </div>
            <div className="output-content">
              <pre>{output}</pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .code-canvas {
          background: rgba(0, 0, 0, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          overflow: hidden;
          margin: 16px 0;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          position: relative;
          transition: all 0.3s ease;
        }

        .code-canvas.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          border-radius: 0;
          margin: 0;
        }

        .code-canvas-header {
          background: rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .code-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #ffffff;
        }

        .language-icon {
          font-size: 16px;
        }

        .language-name {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #00d4ff;
        }

        .code-title {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
          margin-left: 8px;
          font-weight: 500;
        }

        .code-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .action-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 6px 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
        }

        .action-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .run-btn {
          background: rgba(76, 175, 80, 0.2);
          border-color: rgba(76, 175, 80, 0.4);
          color: #4caf50;
        }

        .run-btn:hover:not(:disabled) {
          background: rgba(76, 175, 80, 0.3);
        }

        .copy-btn:hover {
          background: rgba(0, 212, 255, 0.2);
          border-color: rgba(0, 212, 255, 0.4);
          color: #00d4ff;
        }

        .copied-indicator,
        .running-indicator {
          margin-left: 4px;
          font-size: 10px;
        }

        .code-canvas-content {
          position: relative;
          min-height: 120px;
          max-height: 500px;
          overflow: auto;
        }

        .code-canvas.fullscreen .code-canvas-content {
          max-height: calc(100vh - 120px);
        }

        .code-textarea {
          width: 100%;
          min-height: 120px;
          background: transparent;
          border: none;
          outline: none;
          color: #ffffff;
          padding: 16px;
          resize: none;
          font-family: inherit;
          font-size: inherit;
          line-height: inherit;
        }

        .code-display {
          margin: 0;
          padding: 16px;
          background: transparent;
          color: #ffffff;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .code-display code {
          font-family: inherit;
          font-size: 14px;
          line-height: 1.5;
        }

        .code-output {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
        }

        .output-header {
          padding: 8px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
        }

        .output-label {
          font-size: 12px;
          font-weight: 600;
          color: #00d4ff;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .output-content {
          padding: 12px 16px;
          max-height: 200px;
          overflow-y: auto;
        }

        .output-content pre {
          margin: 0;
          color: #ffffff;
          font-size: 13px;
          line-height: 1.4;
          white-space: pre-wrap;
          word-break: break-word;
        }

        /* Scrollbar Styling */
        .code-canvas-content::-webkit-scrollbar,
        .output-content::-webkit-scrollbar {
          width: 6px;
        }

        .code-canvas-content::-webkit-scrollbar-track,
        .output-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .code-canvas-content::-webkit-scrollbar-thumb,
        .output-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .code-canvas-content::-webkit-scrollbar-thumb:hover,
        .output-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .code-canvas-header {
            padding: 10px 12px;
            flex-direction: column;
            gap: 8px;
            align-items: stretch;
          }

          .code-info,
          .code-actions {
            justify-content: center;
          }

          .action-btn {
            flex: 1;
            justify-content: center;
          }

          .code-display {
            padding: 12px;
            font-size: 12px;
          }

          .code-textarea {
            padding: 12px;
            font-size: 14px;
          }
        }
      `}</style>
    </motion.div>
  );
}