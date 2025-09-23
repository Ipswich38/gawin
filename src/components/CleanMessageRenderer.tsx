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
import { Copy, Play, Download, Maximize2, Minimize2, Check } from 'lucide-react';

interface CleanMessageRendererProps {
  content: string;
  isThinking?: boolean;
  showCodeEditor?: boolean;
  className?: string;
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
  className = ''
}: CleanMessageRendererProps) {
  const [processedContent, setProcessedContent] = useState({ thinking: '', response: content });

  useEffect(() => {
    if (!isThinking) {
      const { thinking, response } = separateThinkingFromResponse(content);
      setProcessedContent({ thinking, response });
    } else {
      setProcessedContent({ thinking: content, response: '' });
    }
  }, [content, isThinking]);

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
            font-size: 1.875rem;
            font-weight: 700;
            color: #ffffff;
            margin: 24px 0 16px 0;
            line-height: 1.3;
            border-bottom: 2px solid rgba(255, 255, 255, 0.2);
            padding-bottom: 8px;
          }
        `}</style>
      </h1>
    ),

    h2: ({ children }: any) => (
      <h2 className="clean-h2">
        {children}
        <style jsx>{`
          .clean-h2 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #ffffff;
            margin: 20px 0 12px 0;
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
            font-size: 1.25rem;
            font-weight: 600;
            color: #ffffff;
            margin: 16px 0 8px 0;
            line-height: 1.4;
          }
        `}</style>
      </h3>
    ),

    p: ({ children }: any) => (
      <p className="clean-paragraph">
        {children}
        <style jsx>{`
          .clean-paragraph {
            margin: 12px 0;
            line-height: 1.6;
            color: #ffffff;
          }
        `}</style>
      </p>
    ),

    ul: ({ children }: any) => (
      <ul className="clean-list">
        {children}
        <style jsx>{`
          .clean-list {
            margin: 16px 0;
            padding-left: 24px;
          }
        `}</style>
      </ul>
    ),

    ol: ({ children }: any) => (
      <ol className="clean-ordered-list">
        {children}
        <style jsx>{`
          .clean-ordered-list {
            margin: 16px 0;
            padding-left: 24px;
          }
        `}</style>
      </ol>
    ),

    li: ({ children }: any) => (
      <li className="clean-list-item">
        {children}
        <style jsx>{`
          .clean-list-item {
            margin: 6px 0;
            line-height: 1.6;
            color: #ffffff;
          }
        `}</style>
      </li>
    ),

    blockquote: ({ children }: any) => (
      <blockquote className="clean-blockquote">
        {children}
        <style jsx>{`
          .clean-blockquote {
            border-left: 4px solid rgba(255, 255, 255, 0.3);
            background: rgba(255, 255, 255, 0.05);
            padding: 16px 20px;
            margin: 16px 0;
            border-radius: 0 8px 8px 0;
            color: rgba(255, 255, 255, 0.9);
            font-style: italic;
          }
        `}</style>
      </blockquote>
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

      <style jsx>{`
        .clean-message-renderer {
          width: 100%;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
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

        @media (max-width: 768px) {
          .thinking-section {
            padding: 12px;
            margin-bottom: 16px;
          }

          .thinking-content {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}