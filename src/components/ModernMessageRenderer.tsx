/**
 * Modern Bible-Verse Inspired Message Renderer
 * Clean, minimalist design for young generation
 * Uses line icons instead of 3D emojis
 */

'use client';

import React, { useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ModernMessageRendererProps {
  text: string;
  showActions?: boolean;
  onCopy?: () => void;
}

export default function ModernMessageRenderer({
  text,
  showActions = true,
  onCopy
}: ModernMessageRendererProps) {

  // Process the text to ensure proper paragraph spacing and numbered sections
  const processedText = useMemo(() => {
    return text
      // Replace 3D emojis with line icons
      .replace(/🎯/g, '─')
      .replace(/✅/g, '•')
      .replace(/🔧/g, '→')
      .replace(/📊/g, '∴')
      .replace(/⚠️/g, '!')
      .replace(/💡/g, '※')
      .replace(/🚀/g, '↗')
      .replace(/📝/g, '◦')
      .replace(/🎉/g, '═')
      .replace(/📚/g, '∎')
      // Clean up excessive formatting
      .replace(/#{1,6}\s*\*\*(.*?)\*\*/g, '**$1**')
      // Preserve important line breaks but normalize excessive ones
      .replace(/\n{4,}/g, '\n\n\n')
      // Ensure section breaks are preserved with proper spacing
      .replace(/(\*\*\d+\.\s*[^*]+\*\*)\s*\n*/g, '$1\n\n')
      // Clean multiple spaces but preserve intentional spacing
      .replace(/[ \t]+/g, ' ')
      // Remove leading/trailing whitespace but preserve structure
      .split('\n').map(line => line.trim()).join('\n')
      .replace(/^\s+|\s+$/g, '');
  }, [text]);

  // Add post-processing to style numbered sections and list items
  const enhanceFormatting = (node: any) => {
    if (!node) return;

    // Look for strong elements that contain numbered sections
    const strongElements = node.querySelectorAll('strong');
    strongElements.forEach((strong: HTMLElement) => {
      const text = strong.textContent || '';
      // Check if it matches pattern: **1. Something** or **2. Something**
      if (/^\*?\*?\d+\.\s/.test(text)) {
        strong.classList.add('numbered-section');
      }
    });

    // Style list items based on their content
    const listItems = node.querySelectorAll('li');
    listItems.forEach((li: HTMLElement) => {
      const text = li.textContent || '';
      if (text.trim().startsWith('→')) {
        li.classList.add('arrow-item');
      } else if (text.trim().startsWith('!')) {
        li.classList.add('important-item');
      } else if (text.trim().startsWith('※')) {
        li.classList.add('note-item');
      } else if (text.trim().startsWith('◦')) {
        li.classList.add('example-item');
      }
    });
  };

  useEffect(() => {
    const container = document.querySelector('.modern-content');
    if (container) {
      enhanceFormatting(container);
    }
  }, [processedText]);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(text);
      onCopy?.();
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  // Custom components for modern markdown rendering
  const markdownComponents = {
    // Modern headings with clean typography
    h1: ({ children, ...props }: any) => (
      <h1 className="modern-h1" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 className="modern-h2" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="modern-h3" {...props}>
        {children}
      </h3>
    ),

    // Clean paragraphs with Bible-verse spacing
    p: ({ children, ...props }: any) => (
      <p className="modern-paragraph" {...props}>
        {children}
      </p>
    ),

    // Minimalist lists
    ul: ({ children, ...props }: any) => (
      <ul className="modern-list" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="modern-ordered-list" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="modern-list-item" {...props}>
        {children}
      </li>
    ),

    // Clean code blocks
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const codeString = String(children).replace(/\n$/, '');

      if (!inline && match) {
        return (
          <div className="modern-code-block">
            <div className="code-header">
              <span className="code-language">{language}</span>
            </div>
            <SyntaxHighlighter
              style={oneDark}
              language={language}
              PreTag="div"
              customStyle={{
                margin: 0,
                borderRadius: '0 0 8px 8px',
                background: '#1a1a1a',
                fontSize: '14px',
                lineHeight: '1.5'
              }}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        );
      }

      return (
        <code className="modern-inline-code" {...props}>
          {children}
        </code>
      );
    },

    // Clean blockquotes
    blockquote: ({ children, ...props }: any) => (
      <blockquote className="modern-blockquote" {...props}>
        <div className="quote-mark">│</div>
        <div className="quote-content">{children}</div>
      </blockquote>
    ),

    // Simple tables
    table: ({ children, ...props }: any) => (
      <div className="modern-table-container">
        <table className="modern-table" {...props}>
          {children}
        </table>
      </div>
    )
  };

  return (
    <div className="modern-message-renderer">
      {/* Main Content */}
      <div className="modern-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {processedText}
        </ReactMarkdown>
      </div>

      {/* Minimal Action Buttons */}
      {showActions && (
        <div className="modern-actions">
          <button
            onClick={handleCopyMessage}
            className="modern-action-btn"
            title="Copy message"
            aria-label="Copy message"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>
      )}

      <style jsx>{`
        .modern-message-renderer {
          width: 100%;
          max-width: 100%;
          color: #e5e7eb;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.7;
          font-size: 16px;
        }

        .modern-content {
          padding: 0;
        }

        /* Force proper spacing for all content */
        .modern-content > * {
          margin-bottom: 20px;
        }

        .modern-content > *:last-child {
          margin-bottom: 0;
        }

        /* Ensure ReactMarkdown respects our spacing */
        .modern-content .markdown-body p {
          margin: 0 0 20px 0 !important;
          line-height: 1.7 !important;
          display: block !important;
        }

        /* Modern Typography - Bible-verse inspired */
        .modern-h1 {
          font-size: 24px;
          font-weight: 600;
          color: #f9fafb;
          margin: 24px 0 16px 0;
          line-height: 1.3;
          letter-spacing: -0.025em;
        }

        .modern-h2 {
          font-size: 20px;
          font-weight: 600;
          color: #f3f4f6;
          margin: 20px 0 12px 0;
          line-height: 1.4;
        }

        .modern-h3 {
          font-size: 18px;
          font-weight: 500;
          color: #e5e7eb;
          margin: 16px 0 8px 0;
          line-height: 1.4;
        }

        /* Numbered sections styling */
        .modern-content strong:has-text("**") {
          display: block;
          margin: 32px 0 12px 0;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Override for numbered sections */
        .modern-content {
          counter-reset: section-counter;
        }

        /* Simple, clean paragraphs with proper spacing */
        .modern-paragraph {
          margin: 0 0 20px 0;
          line-height: 1.7;
          color: #d1d5db;
          text-align: left;
          font-size: 16px;
          max-width: none;
          display: block;
          white-space: pre-wrap;
        }

        /* Ensure paragraph separation is always visible */
        .modern-paragraph:not(:last-child) {
          margin-bottom: 24px;
        }

        .modern-paragraph:empty {
          display: none;
        }

        /* Clean, minimal lists */
        .modern-list {
          margin: 16px 0;
          padding-left: 0;
          list-style: none;
        }

        .modern-ordered-list {
          margin: 16px 0;
          padding-left: 0;
          list-style: none;
          counter-reset: modern-counter;
        }

        .modern-list-item {
          margin: 12px 0;
          position: relative;
          padding-left: 24px;
          line-height: 1.6;
          color: #d1d5db;
        }

        .modern-list .modern-list-item::before {
          content: '•';
          position: absolute;
          left: 8px;
          top: 0;
          color: #9ca3af;
          font-weight: 600;
        }

        .modern-ordered-list .modern-list-item {
          counter-increment: modern-counter;
        }

        .modern-ordered-list .modern-list-item::before {
          content: counter(modern-counter) '.';
          position: absolute;
          left: 0;
          top: 0;
          color: #9ca3af;
          font-weight: 600;
          min-width: 20px;
        }

        /* Minimal code styling */
        .modern-code-block {
          margin: 20px 0;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #374151;
          background: #1f2937;
        }

        .code-header {
          background: #111827;
          padding: 12px 16px;
          border-bottom: 1px solid #374151;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .code-language {
          font-size: 12px;
          font-weight: 500;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .modern-inline-code {
          background: #374151;
          color: #e5e7eb;
          padding: 3px 6px;
          border-radius: 4px;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
          font-size: 14px;
          border: 1px solid #4b5563;
        }

        /* Clean blockquotes */
        .modern-blockquote {
          margin: 20px 0;
          padding: 16px 0;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border-left: none;
          background: none;
        }

        .quote-mark {
          color: #6b7280;
          font-size: 20px;
          font-weight: 300;
          line-height: 1;
          margin-top: 2px;
        }

        .quote-content {
          flex: 1;
          color: #d1d5db;
          font-style: italic;
          line-height: 1.6;
        }

        /* Simple tables */
        .modern-table-container {
          margin: 20px 0;
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid #374151;
        }

        .modern-table {
          width: 100%;
          border-collapse: collapse;
          background: #1f2937;
        }

        .modern-table th {
          background: #111827;
          color: #f9fafb;
          padding: 12px 16px;
          text-align: left;
          font-weight: 500;
          font-size: 14px;
          border-bottom: 1px solid #374151;
        }

        .modern-table td {
          padding: 10px 16px;
          color: #d1d5db;
          font-size: 14px;
          border-bottom: 1px solid #374151;
        }

        .modern-table tbody tr:last-child td {
          border-bottom: none;
        }

        /* Minimal action buttons */
        .modern-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #374151;
        }

        .modern-action-btn {
          background: transparent;
          border: 1px solid #4b5563;
          color: #9ca3af;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modern-action-btn:hover {
          background: #374151;
          color: #e5e7eb;
          border-color: #6b7280;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .modern-message-renderer {
            font-size: 16px;
          }

          .modern-h1 {
            font-size: 22px;
            margin: 20px 0 14px 0;
          }

          .modern-h2 {
            font-size: 18px;
            margin: 16px 0 10px 0;
          }

          .modern-h3 {
            font-size: 16px;
            margin: 14px 0 8px 0;
          }

          .modern-paragraph {
            font-size: 16px;
            margin: 14px 0;
          }

          .modern-list-item {
            margin: 10px 0;
          }

          .code-header {
            padding: 10px 14px;
          }

          .modern-inline-code {
            font-size: 13px;
          }
        }

        /* Ensure clean line breaks and spacing */
        .modern-content > *:first-child {
          margin-top: 0;
        }

        .modern-content > *:last-child {
          margin-bottom: 0;
        }

        /* Remove any unwanted emoji spacing */
        .modern-content {
          line-height: 1.7;
        }

        /* Consistent text color hierarchy */
        .modern-content strong {
          color: #f9fafb;
          font-weight: 600;
        }

        .modern-content em {
          color: #e5e7eb;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}