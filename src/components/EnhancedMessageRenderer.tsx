/**
 * Enhanced Message Renderer
 * Unified component that handles both Regular and Agent Mode formatting
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { UnifiedFormatter, UnifiedFormattingOptions, FormattedContent } from '@/lib/formatters/unifiedFormatter';
import { AgentModeIndicator } from './AgentModeToggle';

interface EnhancedMessageRendererProps {
  text: string;
  isAgentMode?: boolean;
  showActions?: boolean;
  onCopy?: () => void;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  thinking?: string;
  metadata?: {
    processingTime?: number;
    researchSources?: number;
    confidenceScore?: number;
    capabilities?: {
      researched: boolean;
      analyzed: boolean;
      structured: boolean;
      enhanced: boolean;
    };
  };
}

export default function EnhancedMessageRenderer({
  text,
  isAgentMode = false,
  showActions = true,
  onCopy,
  onThumbsUp,
  onThumbsDown,
  thinking,
  metadata
}: EnhancedMessageRendererProps) {
  const [copiedCodeBlocks, setCopiedCodeBlocks] = useState<{ [key: number]: boolean }>({});
  const [isFormatted, setIsFormatted] = useState(false);

  // Format content using unified formatter
  const formattedContent: FormattedContent = useMemo(() => {
    const options: UnifiedFormattingOptions = {
      mode: isAgentMode ? 'agent' : 'regular',
      enableMathRendering: true,
      enableAdvancedLayout: isAgentMode,
      preserveStructure: true,
      mobileOptimized: true
    };

    return UnifiedFormatter.format(text, options);
  }, [text, isAgentMode]);

  useEffect(() => {
    setIsFormatted(true);
  }, [formattedContent]);

  const handleCopyCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeBlocks(prev => ({ ...prev, [index]: true }));
      setTimeout(() => {
        setCopiedCodeBlocks(prev => ({ ...prev, [index]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(text);
      onCopy?.();
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  // Custom components for markdown rendering
  const markdownComponents = {
    // Enhanced headings
    h1: ({ children, ...props }: any) => (
      <h1 className={`enhanced-h1 ${isAgentMode ? 'agent-mode' : 'regular-mode'}`} {...props}>
        {isAgentMode && <span className="heading-number">1.</span>}
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 className={`enhanced-h2 ${isAgentMode ? 'agent-mode' : 'regular-mode'}`} {...props}>
        {isAgentMode && <span className="heading-icon">🎯</span>}
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className={`enhanced-h3 ${isAgentMode ? 'agent-mode' : 'regular-mode'}`} {...props}>
        {isAgentMode && <span className="heading-icon">▶️</span>}
        {children}
      </h3>
    ),

    // Enhanced code blocks
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const codeString = String(children).replace(/\n$/, '');

      if (!inline && match) {
        const codeIndex = parseInt(node?.position?.start?.line || '0');

        return (
          <div className={`code-block-container ${isAgentMode ? 'agent-mode' : 'regular-mode'}`}>
            {isAgentMode && (
              <div className="code-header">
                <span className="code-language">{language}</span>
                <button
                  onClick={() => handleCopyCode(codeString, codeIndex)}
                  className="copy-code-btn"
                >
                  {copiedCodeBlocks[codeIndex] ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            )}
            <SyntaxHighlighter
              style={oneDark}
              language={language}
              PreTag="div"
              customStyle={{
                margin: 0,
                borderRadius: isAgentMode ? '0 0 8px 8px' : '8px',
                fontSize: '14px',
                lineHeight: '1.5'
              }}
              {...props}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        );
      }

      return (
        <code className={`inline-code ${isAgentMode ? 'agent-mode' : 'regular-mode'}`} {...props}>
          {children}
        </code>
      );
    },

    // Enhanced lists
    ul: ({ children, ...props }: any) => (
      <ul className={`enhanced-list ${isAgentMode ? 'agent-mode' : 'regular-mode'}`} {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className={`enhanced-ordered-list ${isAgentMode ? 'agent-mode' : 'regular-mode'}`} {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className={`enhanced-list-item ${isAgentMode ? 'agent-mode' : 'regular-mode'}`} {...props}>
        {children}
      </li>
    ),

    // Enhanced blockquotes
    blockquote: ({ children, ...props }: any) => (
      <blockquote className={`enhanced-blockquote ${isAgentMode ? 'agent-mode' : 'regular-mode'}`} {...props}>
        {isAgentMode && <span className="quote-icon">💡</span>}
        {children}
      </blockquote>
    ),

    // Enhanced tables
    table: ({ children, ...props }: any) => (
      <div className={`table-container ${isAgentMode ? 'agent-mode' : 'regular-mode'}`}>
        <table className="enhanced-table" {...props}>
          {children}
        </table>
      </div>
    ),

    // Enhanced paragraphs
    p: ({ children, ...props }: any) => (
      <p className={`enhanced-paragraph ${isAgentMode ? 'agent-mode' : 'regular-mode'}`} {...props}>
        {children}
      </p>
    )
  };

  return (
    <div className={`enhanced-message-renderer ${isAgentMode ? 'agent-mode' : 'regular-mode'}`}>
      {/* Agent Mode Header */}
      {isAgentMode && (
        <div className="agent-mode-header">
          <AgentModeIndicator isEnabled={true} />
          {metadata && (
            <div className="agent-metadata">
              {metadata.processingTime && (
                <span className="metadata-item">
                  ⏱️ {metadata.processingTime}ms
                </span>
              )}
              {metadata.researchSources && (
                <span className="metadata-item">
                  📊 {metadata.researchSources} sources
                </span>
              )}
              {metadata.confidenceScore && (
                <span className="metadata-item">
                  🎯 {Math.round(metadata.confidenceScore * 100)}% confidence
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Thinking Process (Agent Mode) */}
      {thinking && isAgentMode && (
        <div className="thinking-process">
          <div className="thinking-header">
            <span className="thinking-icon">🤔</span>
            <span className="thinking-label">Processing...</span>
          </div>
          <div className="thinking-content">
            {thinking}
          </div>
        </div>
      )}

      {/* Content Analysis (Agent Mode) */}
      {isAgentMode && isFormatted && (
        <div className="content-analysis">
          <div className="analysis-header">Content Analysis</div>
          <div className="analysis-items">
            <div className="analysis-item">
              <span className="analysis-icon">📝</span>
              <span>{formattedContent.contentType}</span>
            </div>
            <div className="analysis-item">
              <span className="analysis-icon">⏱️</span>
              <span>{formattedContent.estimatedReadTime} min read</span>
            </div>
            {formattedContent.hasCodeBlocks && (
              <div className="analysis-item">
                <span className="analysis-icon">💻</span>
                <span>Contains code</span>
              </div>
            )}
            {formattedContent.hasMath && (
              <div className="analysis-item">
                <span className="analysis-icon">🔢</span>
                <span>Mathematical content</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="message-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {text}
        </ReactMarkdown>
      </div>

      {/* Capabilities Indicator (Agent Mode) */}
      {isAgentMode && metadata?.capabilities && (
        <div className="capabilities-indicator">
          <div className="capabilities-header">Enhanced with:</div>
          <div className="capabilities-list">
            {metadata.capabilities.researched && (
              <span className="capability-badge researched">🔍 Research</span>
            )}
            {metadata.capabilities.analyzed && (
              <span className="capability-badge analyzed">📊 Analysis</span>
            )}
            {metadata.capabilities.structured && (
              <span className="capability-badge structured">📋 Structure</span>
            )}
            {metadata.capabilities.enhanced && (
              <span className="capability-badge enhanced">✨ Enhanced</span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div className="message-actions">
          <button
            onClick={handleCopyMessage}
            className="action-btn copy-btn"
            title="Copy message"
          >
            📋
          </button>
          {onThumbsUp && (
            <button
              onClick={onThumbsUp}
              className="action-btn thumbs-up-btn"
              title="Good response"
            >
              👍
            </button>
          )}
          {onThumbsDown && (
            <button
              onClick={onThumbsDown}
              className="action-btn thumbs-down-btn"
              title="Poor response"
            >
              👎
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        .enhanced-message-renderer {
          width: 100%;
          max-width: 100%;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
        }

        .enhanced-message-renderer.agent-mode {
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 153, 204, 0.05) 100%);
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: 16px;
          padding: 20px;
        }

        /* Agent Mode Header */
        .agent-mode-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(0, 212, 255, 0.2);
        }

        .agent-metadata {
          display: flex;
          gap: 12px;
          font-size: 11px;
          opacity: 0.8;
        }

        .metadata-item {
          background: rgba(0, 212, 255, 0.1);
          padding: 4px 8px;
          border-radius: 8px;
          border: 1px solid rgba(0, 212, 255, 0.2);
        }

        /* Thinking Process */
        .thinking-process {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .thinking-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #00d4ff;
        }

        .thinking-content {
          font-size: 13px;
          opacity: 0.9;
          font-style: italic;
        }

        /* Content Analysis */
        .content-analysis {
          background: rgba(0, 212, 255, 0.1);
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 16px;
          border: 1px solid rgba(0, 212, 255, 0.2);
        }

        .analysis-header {
          font-size: 12px;
          font-weight: 600;
          color: #00d4ff;
          margin-bottom: 8px;
        }

        .analysis-items {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .analysis-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          background: rgba(255, 255, 255, 0.1);
          padding: 4px 8px;
          border-radius: 6px;
        }

        /* Enhanced Typography */
        .enhanced-h1.agent-mode {
          font-size: 24px;
          font-weight: 700;
          color: #00d4ff;
          margin: 24px 0 16px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .enhanced-h1.regular-mode {
          font-size: 22px;
          font-weight: 600;
          color: white;
          margin: 20px 0 12px 0;
        }

        .enhanced-h2.agent-mode {
          font-size: 20px;
          font-weight: 600;
          color: #00b8e6;
          margin: 20px 0 12px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .enhanced-h2.regular-mode {
          font-size: 18px;
          font-weight: 600;
          color: white;
          margin: 16px 0 10px 0;
        }

        .enhanced-h3.agent-mode {
          font-size: 16px;
          font-weight: 600;
          color: #009fcc;
          margin: 16px 0 8px 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .enhanced-h3.regular-mode {
          font-size: 16px;
          font-weight: 600;
          color: white;
          margin: 14px 0 8px 0;
        }

        .heading-number {
          background: #00d4ff;
          color: #1a1a1a;
          width: 24px;
          height: 24px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
        }

        .heading-icon {
          font-size: 14px;
          opacity: 0.8;
        }

        /* Enhanced Paragraphs */
        .enhanced-paragraph.agent-mode {
          margin: 12px 0;
          text-align: justify;
          hyphens: auto;
        }

        .enhanced-paragraph.regular-mode {
          margin: 10px 0;
        }

        /* Enhanced Lists */
        .enhanced-list.agent-mode {
          margin: 16px 0;
          padding-left: 24px;
        }

        .enhanced-list.regular-mode {
          margin: 12px 0;
          padding-left: 20px;
        }

        .enhanced-list-item.agent-mode {
          margin: 8px 0;
          position: relative;
        }

        .enhanced-list-item.regular-mode {
          margin: 4px 0;
        }

        .enhanced-ordered-list.agent-mode {
          margin: 16px 0;
          padding-left: 24px;
          counter-reset: agent-counter;
        }

        .enhanced-ordered-list.agent-mode li {
          counter-increment: agent-counter;
          position: relative;
        }

        .enhanced-ordered-list.agent-mode li::before {
          content: counter(agent-counter);
          position: absolute;
          left: -24px;
          top: 0;
          background: #00d4ff;
          color: #1a1a1a;
          width: 18px;
          height: 18px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
        }

        /* Enhanced Code Blocks */
        .code-block-container.agent-mode {
          margin: 16px 0;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(0, 212, 255, 0.3);
        }

        .code-block-container.regular-mode {
          margin: 12px 0;
          border-radius: 8px;
          overflow: hidden;
        }

        .code-header {
          background: rgba(0, 212, 255, 0.1);
          border-bottom: 1px solid rgba(0, 212, 255, 0.3);
          padding: 8px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .code-language {
          font-size: 12px;
          font-weight: 600;
          color: #00d4ff;
          text-transform: uppercase;
        }

        .copy-code-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .copy-code-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .inline-code.agent-mode {
          background: rgba(0, 212, 255, 0.2);
          color: #00d4ff;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 13px;
          border: 1px solid rgba(0, 212, 255, 0.3);
        }

        .inline-code.regular-mode {
          background: rgba(255, 255, 255, 0.1);
          color: #e6e6e6;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 13px;
        }

        /* Enhanced Blockquotes */
        .enhanced-blockquote.agent-mode {
          border-left: 4px solid #00d4ff;
          background: rgba(0, 212, 255, 0.1);
          padding: 16px 20px;
          margin: 16px 0;
          border-radius: 0 8px 8px 0;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .enhanced-blockquote.regular-mode {
          border-left: 3px solid #666;
          background: rgba(255, 255, 255, 0.05);
          padding: 12px 16px;
          margin: 12px 0;
          border-radius: 0 6px 6px 0;
        }

        .quote-icon {
          font-size: 16px;
          margin-top: 2px;
        }

        /* Enhanced Tables */
        .table-container.agent-mode {
          overflow-x: auto;
          margin: 16px 0;
          border-radius: 8px;
          border: 1px solid rgba(0, 212, 255, 0.3);
        }

        .table-container.regular-mode {
          overflow-x: auto;
          margin: 12px 0;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .enhanced-table {
          width: 100%;
          border-collapse: collapse;
          background: rgba(255, 255, 255, 0.02);
        }

        .enhanced-table th {
          background: rgba(0, 212, 255, 0.1);
          color: #00d4ff;
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          border-bottom: 1px solid rgba(0, 212, 255, 0.3);
        }

        .enhanced-table td {
          padding: 10px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Capabilities Indicator */
        .capabilities-indicator {
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid rgba(0, 212, 255, 0.2);
        }

        .capabilities-header {
          font-size: 12px;
          color: #00d4ff;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .capabilities-list {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .capability-badge {
          background: rgba(0, 212, 255, 0.2);
          color: #00d4ff;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          border: 1px solid rgba(0, 212, 255, 0.3);
        }

        .capability-badge.researched {
          background: rgba(76, 175, 80, 0.2);
          color: #4caf50;
          border-color: rgba(76, 175, 80, 0.3);
        }

        .capability-badge.analyzed {
          background: rgba(255, 152, 0, 0.2);
          color: #ff9800;
          border-color: rgba(255, 152, 0, 0.3);
        }

        .capability-badge.structured {
          background: rgba(156, 39, 176, 0.2);
          color: #9c27b0;
          border-color: rgba(156, 39, 176, 0.3);
        }

        .capability-badge.enhanced {
          background: rgba(233, 30, 99, 0.2);
          color: #e91e63;
          border-color: rgba(233, 30, 99, 0.3);
        }

        /* Message Actions */
        .message-actions {
          display: flex;
          gap: 8px;
          margin-top: 16px;
          justify-content: flex-end;
        }

        .action-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .enhanced-message-renderer.agent-mode {
            padding: 16px;
            border-radius: 12px;
          }

          .agent-mode-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .agent-metadata {
            flex-direction: column;
            gap: 6px;
            width: 100%;
          }

          .metadata-item {
            font-size: 10px;
          }

          .analysis-items {
            gap: 6px;
          }

          .analysis-item {
            font-size: 10px;
          }

          .enhanced-h1.agent-mode {
            font-size: 20px;
          }

          .enhanced-h2.agent-mode {
            font-size: 18px;
          }

          .code-header {
            padding: 6px 10px;
          }

          .capabilities-list {
            gap: 6px;
          }

          .capability-badge {
            font-size: 9px;
          }
        }

        /* Disable problematic column layouts only where necessary */
        .enhanced-message-renderer * {
          column-count: unset !important;
          columns: unset !important;
          -webkit-columns: unset !important;
          -moz-columns: unset !important;
        }

        /* Allow appropriate multi-column layouts in agent mode */
        .enhanced-message-renderer.agent-mode .comparison-container,
        .enhanced-message-renderer.agent-mode .multi-column-content {
          column-count: auto !important;
          columns: auto !important;
        }
      `}</style>
    </div>
  );
}