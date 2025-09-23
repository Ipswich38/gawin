/**
 * Clean Message Renderer - Rebuilt from scratch
 * Implements Mistral's recommendations for consistent text formatting
 * Separates AI thinking process from user-facing output
 * Uses Monaco Editor for code blocks and preserves ASCII art formatting
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Editor from '@monaco-editor/react';
import { Copy, Play, Download, Maximize2, Minimize2, Check, Volume2, ThumbsUp, ThumbsDown, Pause, Square } from 'lucide-react';

interface CleanMessageRendererProps {
  content: string;
  isThinking?: boolean;
  showCodeEditor?: boolean;
  className?: string;
  showActions?: boolean;
  onCopy?: () => void;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  onSpeak?: () => void;
  onDownload?: () => void;
}

interface CodeBlockProps {
  language: string;
  value: string;
  inline?: boolean;
}

// Separate thinking from actual response
function separateThinkingFromResponse(content: string): { thinking: string; response: string } {
  const thinkingPatterns = [
    /^(Let me think about this|I need to consider|First, let me|Let me analyze)/i,
    /\*\*Thinking:\*\*(.+?)(?=\*\*Response:\*\*|\n\n[A-Z])/i,
    /\*thinking\*(.+?)(?=\*response\*|\n\n)/i,
    /^.*?(?=Here's|Now I'll|The answer|To solve)/
  ];

  for (const pattern of thinkingPatterns) {
    const match = content.match(pattern);
    if (match) {
      const thinking = match[0].trim();
      const response = content.replace(pattern, '').trim();
      if (thinking.length > 10 && response.length > 10) {
        return { thinking, response };
      }
    }
  }

  return { thinking: '', response: content };
}

// CodeBlock component with Monaco Editor
function CodeBlock({ language, value, inline }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [code, setCode] = useState(value);
  const editorRef = useRef<any>(null);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }, [code]);

  const handleDownload = useCallback(() => {
    const fileExtensions: Record<string, string> = {
      javascript: 'js', typescript: 'ts', python: 'py', java: 'java',
      cpp: 'cpp', c: 'c', css: 'css', html: 'html', json: 'json',
      xml: 'xml', yaml: 'yml', markdown: 'md', sql: 'sql', bash: 'sh'
    };

    const extension = fileExtensions[language.toLowerCase()] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [code, language]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  if (inline) {
    return (
      <code className="inline-code">
        {value}
      </code>
    );
  }

  return (
    <div className={`code-block-container ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Code Header */}
      <div className="code-header">
        <div className="code-info">
          <span className="language-badge">{language}</span>
          <span className="code-stats">{code.split('\n').length} lines</span>
        </div>

        <div className="code-actions">
          <button
            onClick={() => setIsEditable(!isEditable)}
            className="action-btn edit-btn"
            title={isEditable ? "View mode" : "Edit mode"}
          >
            {isEditable ? "View" : "Edit"}
          </button>

          <button
            onClick={handleCopy}
            className="action-btn copy-btn"
            title="Copy code"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>

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

      {/* Monaco Editor */}
      <div className="code-editor-container">
        <Editor
          height={isFullscreen ? "calc(100vh - 120px)" : "auto"}
          defaultLanguage={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            readOnly: !isEditable,
            minimap: { enabled: isFullscreen },
            scrollBeyondLastLine: false,
            fontSize: 14,
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            lineNumbers: 'on',
            folding: true,
            automaticLayout: true,
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
          }}
        />
      </div>

      <style jsx>{`
        .code-block-container {
          margin: 16px 0;
          border-radius: 8px;
          overflow: hidden;
          background: #1e1e1e;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .code-block-container.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          margin: 0;
          border-radius: 0;
        }

        .code-header {
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
          gap: 12px;
        }

        .language-badge {
          background: #007acc;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .code-stats {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }

        .code-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .edit-btn {
          background: rgba(76, 175, 80, 0.2);
          border-color: rgba(76, 175, 80, 0.4);
        }

        .copy-btn {
          background: rgba(0, 123, 255, 0.2);
          border-color: rgba(0, 123, 255, 0.4);
        }

        .code-editor-container {
          min-height: 200px;
        }

        .inline-code {
          background: rgba(255, 255, 255, 0.1);
          color: #e6e6e6;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: Monaco, Menlo, "Ubuntu Mono", monospace;
          font-size: 0.9em;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

// ASCII Art Renderer with monospace preservation
function ASCIIRenderer({ children }: { children: string }) {
  return (
    <pre className="ascii-art">
      {children}
      <style jsx>{`
        .ascii-art {
          font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
          white-space: pre;
          overflow-x: auto;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
          line-height: 1.2;
          font-size: 13px;
          color: #ffffff;
        }
      `}</style>
    </pre>
  );
}

export default function CleanMessageRenderer({
  content,
  isThinking = false,
  showCodeEditor = true,
  className = '',
  showActions = false,
  onCopy,
  onThumbsUp,
  onThumbsDown,
  onSpeak,
  onDownload
}: CleanMessageRendererProps) {
  const [processedContent, setProcessedContent] = useState({ thinking: '', response: content });
  const [showSpeechControls, setShowSpeechControls] = useState(false);
  const [speechState, setSpeechState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!isThinking) {
      const { thinking, response } = separateThinkingFromResponse(content);
      setProcessedContent({ thinking, response });
    } else {
      setProcessedContent({ thinking: content, response: '' });
    }
  }, [content, isThinking]);

  // Speech control functions
  const handleSpeechStart = useCallback(() => {
    if (currentUtterance) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(isThinking ? content : processedContent.response);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => setSpeechState('playing');
    utterance.onend = () => {
      setSpeechState('idle');
      setShowSpeechControls(false);
    };
    utterance.onerror = () => {
      setSpeechState('idle');
      setShowSpeechControls(false);
    };

    setCurrentUtterance(utterance);
    speechSynthesis.speak(utterance);
    setShowSpeechControls(true);
    setSpeechState('playing');
  }, [content, processedContent, isThinking, currentUtterance]);

  const handleSpeechPause = useCallback(() => {
    if (speechState === 'playing') {
      speechSynthesis.pause();
      setSpeechState('paused');
    } else if (speechState === 'paused') {
      speechSynthesis.resume();
      setSpeechState('playing');
    }
  }, [speechState]);

  const handleSpeechStop = useCallback(() => {
    speechSynthesis.cancel();
    setSpeechState('idle');
    setShowSpeechControls(false);
    setCurrentUtterance(null);
  }, []);

  // Check if content is ASCII art
  const isASCIIArt = (text: string): boolean => {
    const asciiChars = /[│┌┐└┘├┤┬┴┼─═║╔╗╚╝╠╣╦╩╬]/;
    const hasAsciiChars = asciiChars.test(text);
    const hasConsistentSpacing = /^[ \t]*[\w\W]*$/m.test(text);
    return hasAsciiChars || (hasConsistentSpacing && text.includes('\n') && text.length > 50);
  };

  // Custom markdown components
  const markdownComponents = {
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : 'text';
      const codeString = String(children).replace(/\n$/, '');

      if (!inline && match) {
        // Check if it's ASCII art
        if (isASCIIArt(codeString)) {
          return <ASCIIRenderer>{codeString}</ASCIIRenderer>;
        }

        // Use Monaco Editor for code blocks
        return (
          <CodeBlock
            language={language}
            value={codeString}
            inline={false}
          />
        );
      }

      return (
        <CodeBlock
          language="text"
          value={codeString}
          inline={true}
        />
      );
    },

    pre: ({ children }: any) => {
      const codeContent = React.Children.toArray(children)
        .map(child => typeof child === 'string' ? child : '')
        .join('');

      if (isASCIIArt(codeContent)) {
        return <ASCIIRenderer>{codeContent}</ASCIIRenderer>;
      }

      return (
        <pre className="markdown-pre">
          {children}
          <style jsx>{`
            .markdown-pre {
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 8px;
              padding: 16px;
              margin: 16px 0;
              overflow-x: auto;
              font-family: Monaco, Menlo, "Ubuntu Mono", monospace;
              font-size: 14px;
              line-height: 1.5;
              color: #ffffff;
            }
          `}</style>
        </pre>
      );
    },

    h1: ({ children }: any) => (
      <h1 className="clean-h1">
        {children}
        <style jsx>{`
          .clean-h1 {
            font-family: 'Fraunces', serif;
            font-size: 1.25rem;
            font-weight: 600;
            color: #14b8a6;
            margin: 20px 0 12px 0;
            line-height: 1.4;
            border-bottom: 1px solid rgba(20, 184, 166, 0.3);
            padding-bottom: 4px;
          }
        `}</style>
      </h1>
    ),

    h2: ({ children }: any) => (
      <h2 className="clean-h2">
        {children}
        <style jsx>{`
          .clean-h2 {
            font-family: 'Fraunces', serif;
            font-size: 1.125rem;
            font-weight: 600;
            color: #14b8a6;
            margin: 18px 0 10px 0;
            line-height: 1.4;
          }
        `}</style>
      </h2>
    ),

    h3: ({ children }: any) => (
      <h3 className="clean-h3">
        {children}
        <style jsx>{`
          .clean-h3 {
            font-family: 'Fraunces', serif;
            font-size: 1rem;
            font-weight: 600;
            color: #14b8a6;
            margin: 16px 0 8px 0;
            line-height: 1.4;
          }
        `}</style>
      </h3>
    ),

    p: ({ children }: any) => {
      // Function to split text into 2-sentence chunks
      const formatParagraph = (text: any): React.ReactElement[] => {
        if (typeof text !== 'string') {
          return [<span key="0">{text}</span>];
        }

        // Split by sentence endings (. ! ?)
        const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
        const chunks = [];

        for (let i = 0; i < sentences.length; i += 2) {
          const chunk = sentences.slice(i, i + 2).join(' ');
          chunks.push(
            <span key={i} className="sentence-chunk">
              {chunk}
            </span>
          );
        }

        return chunks;
      };

      return (
        <p className="clean-paragraph">
          {typeof children === 'string' ? formatParagraph(children) : children}
          <style jsx>{`
            .clean-paragraph {
              font-family: 'Fraunces', serif;
              font-weight: 200;
              font-size: 0.9rem;
              margin: 12px 0;
              line-height: 1.6;
              color: #ffffff;
            }
            .sentence-chunk {
              display: block;
              margin-bottom: 12px;
            }
            .sentence-chunk:last-child {
              margin-bottom: 0;
            }
          `}</style>
        </p>
      );
    },

    ul: ({ children }: any) => (
      <ul className="clean-list">
        {children}
        <style jsx>{`
          .clean-list {
            font-family: 'Fraunces', serif;
            font-weight: 200;
            margin: 16px 0;
            padding-left: 24px;
            line-height: 1.7;
          }
        `}</style>
      </ul>
    ),

    ol: ({ children }: any) => (
      <ol className="clean-ordered-list">
        {children}
        <style jsx>{`
          .clean-ordered-list {
            font-family: 'Fraunces', serif;
            font-weight: 200;
            margin: 16px 0;
            padding-left: 24px;
            line-height: 1.7;
          }
        `}</style>
      </ol>
    ),

    li: ({ children }: any) => (
      <li className="clean-list-item">
        {children}
        <style jsx>{`
          .clean-list-item {
            margin: 8px 0;
            line-height: 1.7;
            color: #ffffff;
          }
          .clean-list-item::marker {
            color: #14b8a6;
          }
        `}</style>
      </li>
    ),

    blockquote: ({ children }: any) => (
      <blockquote className="clean-blockquote">
        {children}
        <style jsx>{`
          .clean-blockquote {
            font-family: 'Fraunces', serif;
            font-weight: 200;
            border-left: 4px solid rgba(20, 184, 166, 0.5);
            background: rgba(20, 184, 166, 0.1);
            padding: 16px 20px;
            margin: 16px 0;
            border-radius: 0 8px 8px 0;
            color: rgba(255, 255, 255, 0.9);
            font-style: italic;
            line-height: 1.7;
          }
        `}</style>
      </blockquote>
    ),

    strong: ({ children }: any) => (
      <strong className="clean-strong">
        {children}
        <style jsx>{`
          .clean-strong {
            color: #5eead4;
            font-weight: 600;
          }
        `}</style>
      </strong>
    ),

    em: ({ children }: any) => (
      <em className="clean-em">
        {children}
        <style jsx>{`
          .clean-em {
            color: #5eead4;
            font-style: italic;
          }
        `}</style>
      </em>
    ),

    table: ({ children }: any) => (
      <div className="table-wrapper">
        <table className="clean-table">
          {children}
        </table>
        <style jsx>{`
          .table-wrapper {
            overflow-x: auto;
            margin: 16px 0;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .clean-table {
            width: 100%;
            border-collapse: collapse;
            background: rgba(255, 255, 255, 0.02);
          }
          .clean-table th {
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          }
          .clean-table td {
            padding: 10px 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            color: #ffffff;
          }
        `}</style>
      </div>
    ),
  };

  return (
    <div className={`clean-message-renderer ${className}`}>
      {/* Thinking Process - Only show if separated from response */}
      {processedContent.thinking && processedContent.response && (
        <div className="thinking-section">
          <div className="thinking-header">
            <span className="thinking-icon">🤔</span>
            <span>AI Thinking Process</span>
          </div>
          <div className="thinking-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {processedContent.thinking}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Main Response */}
      <div className="response-section">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {isThinking ? content : processedContent.response}
        </ReactMarkdown>
      </div>

      {/* Message Actions */}
      {showActions && (
        <div className="message-actions">
          <div className="action-buttons">
            {onCopy && (
              <button
                onClick={onCopy}
                className="action-btn copy-message"
                title="Copy message"
              >
                <Copy size={16} />
              </button>
            )}

            <button
              onClick={handleSpeechStart}
              className="action-btn speak-btn"
              title="Text to speech"
            >
              <Volume2 size={16} />
            </button>

            {onDownload && (
              <button
                onClick={onDownload}
                className="action-btn download-message"
                title="Download message"
              >
                <Download size={16} />
              </button>
            )}

            {onThumbsUp && (
              <button
                onClick={onThumbsUp}
                className="action-btn thumbs-up"
                title="Like this response"
              >
                <ThumbsUp size={16} />
              </button>
            )}

            {onThumbsDown && (
              <button
                onClick={onThumbsDown}
                className="action-btn thumbs-down"
                title="Dislike this response"
              >
                <ThumbsDown size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Speech Control Popup */}
      {showSpeechControls && (
        <div className="speech-controls-popup">
          <div className="speech-controls-content">
            <span className="speech-status">
              {speechState === 'playing' ? '🎙️ Speaking...' : speechState === 'paused' ? '⏸️ Paused' : '🔊 Ready'}
            </span>

            <div className="speech-buttons">
              <button
                onClick={handleSpeechPause}
                className="speech-control-btn pause-btn"
                title={speechState === 'playing' ? 'Pause' : 'Resume'}
              >
                {speechState === 'playing' ? <Pause size={14} /> : <Play size={14} />}
              </button>

              <button
                onClick={handleSpeechStop}
                className="speech-control-btn stop-btn"
                title="Stop"
              >
                <Square size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .clean-message-renderer {
          width: 100%;
          color: #ffffff;
          font-family: 'Fraunces', serif;
          font-weight: 200;
          line-height: 1.7;
          letter-spacing: 0.01em;
        }

        .thinking-section {
          background: rgba(255, 255, 255, 0.03);
          border: 1px dashed rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
          opacity: 0.8;
        }

        .thinking-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .thinking-icon {
          font-size: 16px;
        }

        .thinking-content {
          font-size: 14px;
          line-height: 1.5;
          font-style: italic;
        }

        .response-section {
          /* Main content area */
        }

        .message-actions {
          margin-top: 12px;
          display: flex;
          justify-content: flex-end;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .message-actions:hover {
          opacity: 1;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .action-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.8);
          padding: 6px 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
          transform: scale(1.05);
        }

        .speak-btn:hover {
          background: rgba(20, 184, 166, 0.3);
          border-color: rgba(20, 184, 166, 0.5);
          color: #14b8a6;
        }

        .copy-message:hover {
          background: rgba(59, 130, 246, 0.3);
          border-color: rgba(59, 130, 246, 0.5);
          color: #3b82f6;
        }

        .download-message:hover {
          background: rgba(168, 85, 247, 0.3);
          border-color: rgba(168, 85, 247, 0.5);
          color: #a855f7;
        }

        .thumbs-up:hover {
          background: rgba(34, 197, 94, 0.3);
          border-color: rgba(34, 197, 94, 0.5);
          color: #22c55e;
        }

        .thumbs-down:hover {
          background: rgba(239, 68, 68, 0.3);
          border-color: rgba(239, 68, 68, 0.5);
          color: #ef4444;
        }

        @media (max-width: 768px) {
          .thinking-section {
            padding: 12px;
            margin-bottom: 16px;
          }

          .thinking-content {
            font-size: 13px;
          }

          .action-buttons {
            gap: 6px;
          }

          .action-btn {
            padding: 5px 6px;
          }
        }

        .speech-controls-popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(20, 184, 166, 0.3);
          border-radius: 12px;
          padding: 16px 20px;
          z-index: 1000;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          min-width: 200px;
        }

        .speech-controls-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .speech-status {
          color: #14b8a6;
          font-size: 14px;
          font-weight: 500;
          text-align: center;
        }

        .speech-buttons {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .speech-control-btn {
          background: rgba(20, 184, 166, 0.2);
          border: 1px solid rgba(20, 184, 166, 0.4);
          color: #14b8a6;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .speech-control-btn:hover {
          background: rgba(20, 184, 166, 0.3);
          border-color: rgba(20, 184, 166, 0.6);
          transform: scale(1.05);
        }

        .pause-btn:hover {
          color: #fbbf24;
          border-color: rgba(251, 191, 36, 0.6);
          background: rgba(251, 191, 36, 0.2);
        }

        .stop-btn:hover {
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.6);
          background: rgba(239, 68, 68, 0.2);
        }
      `}</style>
    </div>
  );
}