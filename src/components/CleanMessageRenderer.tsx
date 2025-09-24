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

  // Dragging state for speech popup
  const [speechPopupPosition, setSpeechPopupPosition] = useState({ x: 0, y: 0 });
  const [isDraggingSpeechPopup, setIsDraggingSpeechPopup] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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

    // Wait for voices to be loaded
    const speakWithVoice = () => {
      const voices = speechSynthesis.getVoices();
      const utterance = new SpeechSynthesisUtterance(isThinking ? content : processedContent.response);

      // Try to find a natural human-like voice (prefer English voices)
      const preferredVoices = voices.filter(voice =>
        voice.lang.startsWith('en') &&
        (voice.name.toLowerCase().includes('natural') ||
         voice.name.toLowerCase().includes('enhanced') ||
         voice.name.toLowerCase().includes('premium') ||
         voice.name.toLowerCase().includes('neural'))
      );

      // Fallback to any English voice that's not explicitly robotic
      const englishVoices = voices.filter(voice =>
        voice.lang.startsWith('en') &&
        !voice.name.toLowerCase().includes('robot') &&
        !voice.name.toLowerCase().includes('microsoft')
      );

      // Set the voice (prefer human-like, fallback to any English, then default)
      if (preferredVoices.length > 0) {
        utterance.voice = preferredVoices[0];
      } else if (englishVoices.length > 0) {
        utterance.voice = englishVoices[0];
      }

      // Consistent settings for natural speech
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
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
    };

    // Ensure voices are loaded before speaking
    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.addEventListener('voiceschanged', speakWithVoice, { once: true });
    } else {
      speakWithVoice();
    }
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

  // Drag handlers for speech popup
  const handleSpeechPopupMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSpeechPopup(true);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSpeechPopup) {
        setSpeechPopupPosition({
          x: e.clientX - dragOffset.x - window.innerWidth / 2,
          y: e.clientY - dragOffset.y - window.innerHeight / 2
        });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingSpeechPopup(false);
    };

    if (isDraggingSpeechPopup) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Prevent text selection while dragging
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDraggingSpeechPopup, dragOffset]);

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
            font-family: 'Avenir', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 1.25rem;
            font-weight: 400;
            color: #ffffff;
            margin: 28px 0 16px 0;
            line-height: 1.4;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
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
            font-family: 'Avenir', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 1.125rem;
            font-weight: 400;
            color: #ffffff;
            margin: 24px 0 12px 0;
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
            font-family: 'Avenir', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 1rem;
            font-weight: 400;
            color: #ffffff;
            margin: 20px 0 10px 0;
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
            font-family: 'Avenir', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 400;
            font-size: 1rem;
            margin: 0 0 20px 0;
            line-height: 1.7;
            color: #ffffff;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
        `}</style>
      </p>
    ),

    ul: ({ children }: any) => (
      <ul className="clean-list">
        {children}
        <style jsx>{`
          .clean-list {
            font-family: 'Avenir', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 400;
            margin: 24px 0;
            padding-left: 0;
            line-height: 1.8;
            color: #ffffff;
            list-style: none;
          }
        `}</style>
      </ul>
    ),

    ol: ({ children }: any) => (
      <ol className="clean-ordered-list">
        {children}
        <style jsx>{`
          .clean-ordered-list {
            font-family: 'Avenir', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 400;
            margin: 24px 0;
            padding-left: 0;
            line-height: 1.8;
            color: #ffffff;
            counter-reset: item;
            list-style: none;
          }
        `}</style>
      </ol>
    ),

    li: ({ children }: any) => (
      <li className="clean-list-item">
        {children}
        <style jsx>{`
          .clean-list-item {
            margin: 12px 0;
            padding-left: 30px;
            line-height: 1.8;
            color: #ffffff;
            position: relative;
          }

          /* Bullet points for unordered lists */
          ul .clean-list-item::before {
            content: '•';
            color: #14b8a6;
            font-weight: 600;
            font-size: 1.2em;
            position: absolute;
            left: 8px;
            top: 0;
          }

          /* Numbers for ordered lists */
          ol .clean-list-item {
            counter-increment: item;
          }

          ol .clean-list-item::before {
            content: counter(item) '.';
            color: #14b8a6;
            font-weight: 600;
            position: absolute;
            left: 0;
            top: 0;
            min-width: 24px;
          }

          .clean-list-item p {
            margin: 0;
            display: inline;
          }

          .clean-list-item > * {
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
            color: #ffffff;
            font-weight: 400;
          }
        `}</style>
      </strong>
    ),

    em: ({ children }: any) => (
      <em className="clean-em">
        {children}
        <style jsx>{`
          .clean-em {
            color: #ffffff;
            font-style: normal;
            font-weight: 400;
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

    // Handle line breaks properly
    br: () => <br className="line-break" />,
  };

  // Enhanced preprocessing to fix formatting issues while preserving paragraph structure
  const preprocessContent = (text: string): string => {
    console.log('PREPROCESSING INPUT:', text.substring(0, 200) + '...');

    const result = text
      // Step 1: Clean up scattered asterisks that are not part of markdown formatting
      .replace(/\*(?![^\*]*\*)/g, '')
      .replace(/^\*\s*/gm, '')

      // Step 2: Preserve existing double line breaks first
      .replace(/\n\s*\n/g, '§PARAGRAPH_BREAK§')

      // Step 3: Fix numbered lists - ensure proper spacing
      .replace(/^(\d+)\.\s*/gm, '\n\n$1. ')
      .replace(/([.!?])\s*\n\s*(\d+)\.\s*/g, '$1\n\n$2. ')

      // Step 4: Fix bullet points - standardize bullets
      .replace(/^[\*\-•]\s*/gm, '\n• ')
      .replace(/([.!?])\s*\n\s*[\*\-•]\s*/g, '$1\n\n• ')

      // Step 5: Restore paragraph breaks and ensure proper spacing
      .replace(/§PARAGRAPH_BREAK§/g, '\n\n')

      // Step 6: Fix scattered line breaks ONLY in the middle of sentences (not after punctuation)
      .replace(/([a-z,:])\s*\n\s*([a-z])/gi, '$1 $2')

      // Step 7: Ensure sentences ending with punctuation start new paragraphs when appropriate
      .replace(/([.!?])\s*\n\s*([A-Z])/g, '$1\n\n$2')

      // Step 7.5: Force paragraph breaks after specific patterns
      .replace(/(#{1,6}\s+[^\n]+)\n([A-Z])/g, '$1\n\n$2') // After headers
      .replace(/(\*\*[^*]+\*\*)\s*\n\s*([A-Z])/g, '$1\n\n$2') // After bold text
      .replace(/(```[^`]+```)\s*\n\s*([A-Z])/g, '$1\n\n$2') // After code blocks

      // Step 8: Clean up excessive whitespace but preserve paragraph structure
      .replace(/\n{3,}/g, '\n\n')
      .replace(/^\s+/gm, '')

      // Step 9: Ensure proper spacing after colons in lists
      .replace(/(:)\s*\n\s*([^\n])/g, '$1 $2')

      .trim();

    console.log('PREPROCESSING OUTPUT:', result.substring(0, 200) + '...');
    return result;
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
              {preprocessContent(processedContent.thinking)}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Main Response */}
      <div className="response-section">
        {(() => {
          const processedText = preprocessContent(isThinking ? content : processedContent.response);

          // Split by double line breaks and render each part as a separate markdown block
          const paragraphs = processedText.split(/\n\s*\n/).filter(p => p.trim());

          console.log('SPLIT PARAGRAPHS:', paragraphs.length, paragraphs.map(p => p.substring(0, 50) + '...'));

          if (paragraphs.length <= 1) {
            // If no clear paragraphs, render as single block
            return (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
                remarkRehypeOptions={{
                  allowDangerousHtml: false,
                }}
              >
                {processedText}
              </ReactMarkdown>
            );
          }

          // Render each paragraph separately to force breaks
          return paragraphs.map((paragraph, index) => (
            <div key={index} className="paragraph-block">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
                remarkRehypeOptions={{
                  allowDangerousHtml: false,
                }}
              >
                {paragraph.trim()}
              </ReactMarkdown>
            </div>
          ));
        })()}
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

      {/* Speech Control Popup - Standardized & Draggable */}
      {showSpeechControls && (
        <div
          className="speech-controls-popup"
          style={{
            transform: `translate(${speechPopupPosition.x}px, ${speechPopupPosition.y}px)`
          }}
        >
          <div
            className="speech-controls-content"
            onMouseDown={handleSpeechPopupMouseDown}
            style={{ cursor: isDraggingSpeechPopup ? 'grabbing' : 'grab' }}
          >
            <div className="drag-handle">
              <div className="drag-indicator"></div>
            </div>

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
          color: #ffffff !important;
          font-family: 'Avenir', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 400;
          font-size: 1rem;
          line-height: 1.7;
          letter-spacing: 0.01em;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .clean-message-renderer * {
          color: #ffffff !important;
          font-family: 'Avenir', -apple-system, BlinkMacSystemFont, sans-serif !important;
          font-weight: 400;
          line-height: inherit;
        }

        .clean-message-renderer h1,
        .clean-message-renderer h2,
        .clean-message-renderer h3,
        .clean-message-renderer h4,
        .clean-message-renderer h5,
        .clean-message-renderer h6 {
          color: #ffffff !important;
          font-weight: 400;
        }

        .clean-message-renderer strong {
          color: #ffffff !important;
          font-weight: 400;
        }

        .clean-message-renderer em {
          color: #ffffff !important;
          font-weight: 400;
          font-style: normal;
        }

        .clean-message-renderer p,
        .clean-message-renderer li,
        .clean-message-renderer ul,
        .clean-message-renderer ol {
          color: #ffffff !important;
          font-weight: 400;
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

        .paragraph-block {
          margin-bottom: 24px;
        }

        .paragraph-block:last-child {
          margin-bottom: 0;
        }

        .message-actions {
          margin-top: 16px;
          display: flex;
          justify-content: flex-end;
          opacity: 0.8;
          transition: opacity 0.2s;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 12px;
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
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 20px;
          z-index: 1000;
          box-shadow: 0 16px 64px rgba(0, 0, 0, 0.4);
          min-width: 220px;
          transition: all 0.2s ease;
        }

        .speech-controls-popup:hover {
          box-shadow: 0 20px 80px rgba(20, 184, 166, 0.1);
        }

        .speech-controls-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          position: relative;
        }

        .drag-handle {
          width: 100%;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: grab;
          margin: -10px 0 4px 0;
        }

        .drag-handle:active {
          cursor: grabbing;
        }

        .drag-indicator {
          width: 32px;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          transition: all 0.2s ease;
        }

        .drag-handle:hover .drag-indicator {
          background: rgba(20, 184, 166, 0.6);
          width: 40px;
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
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.9);
          padding: 10px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(8px);
        }

        .speech-control-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
          color: #ffffff;
        }

        .pause-btn:hover {
          color: #fbbf24;
          border-color: rgba(251, 191, 36, 0.4);
          background: rgba(251, 191, 36, 0.1);
        }

        .stop-btn:hover {
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.4);
          background: rgba(239, 68, 68, 0.1);
        }
      `}</style>
    </div>
  );
}