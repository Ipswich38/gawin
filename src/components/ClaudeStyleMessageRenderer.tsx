'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ClaudeStyleMessageRendererProps {
  text: string;
  showActions?: boolean;
  onCopy?: () => void;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  thinking?: string;
}

export default function ClaudeStyleMessageRenderer({
  text,
  showActions,
  onCopy,
  onThumbsUp,
  onThumbsDown,
  thinking
}: ClaudeStyleMessageRendererProps) {
  const [copiedCodeBlocks, setCopiedCodeBlocks] = useState<{ [key: number]: boolean }>({});

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

  // Custom components for rendering
  const components = {
    // Headings with proper styling
    h1: ({ children, ...props }: any) => (
      <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 className="text-xl font-bold text-white mb-3 mt-6 flex items-center gap-2" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="text-lg font-semibold text-white mb-2 mt-4 flex items-center gap-2" {...props}>
        {children}
      </h3>
    ),
    h4: ({ children, ...props }: any) => (
      <h4 className="text-base font-semibold text-white mb-2 mt-3" {...props}>
        {children}
      </h4>
    ),

    // Paragraphs with proper spacing
    p: ({ children, ...props }: any) => (
      <p className="text-gray-200 leading-relaxed mb-4 last:mb-0" {...props}>
        {children}
      </p>
    ),

    // Lists with proper styling
    ul: ({ children, ...props }: any) => (
      <ul className="list-none space-y-2 mb-4 pl-0" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="list-decimal list-inside space-y-2 mb-4 pl-4 text-gray-200" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="text-gray-200 flex items-start gap-2" {...props}>
        <span className="text-teal-400 mt-1.5 text-xs">•</span>
        <span className="flex-1">{children}</span>
      </li>
    ),

    // Strong/bold text
    strong: ({ children, ...props }: any) => (
      <strong className="font-semibold text-white" {...props}>
        {children}
      </strong>
    ),

    // Emphasis/italic text
    em: ({ children, ...props }: any) => (
      <em className="italic text-gray-300" {...props}>
        {children}
      </em>
    ),

    // Inline code
    code: ({ inline, children, ...props }: any) => {
      if (inline) {
        return (
          <code
            className="bg-gray-800 text-teal-300 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-700"
            {...props}
          >
            {children}
          </code>
        );
      }
      return children;
    },

    // Code blocks with syntax highlighting
    pre: ({ children, ...props }: any) => {
      const match = /language-(\w+)/.exec(props.className || '');
      const language = match ? match[1] : '';
      const code = String(children).replace(/\n$/, '');
      const codeBlockIndex = Math.random();

      return (
        <div className="relative group mb-4">
          <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
            {/* Header with language and copy button */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
              <span className="text-gray-400 text-sm font-mono">
                {language || 'text'}
              </span>
              <button
                onClick={() => handleCopyCode(code, codeBlockIndex)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              >
                {copiedCodeBlocks[codeBlockIndex] ? (
                  <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>

            {/* Code content */}
            <SyntaxHighlighter
              style={oneDark}
              language={language}
              PreTag="div"
              className="!bg-gray-900 !p-4 !m-0 text-sm"
              showLineNumbers={code.split('\n').length > 5}
              customStyle={{
                background: 'transparent',
                padding: '1rem',
                margin: 0,
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        </div>
      );
    },

    // Tables
    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border border-gray-700 rounded-lg overflow-hidden" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }: any) => (
      <thead className="bg-gray-800" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }: any) => (
      <tbody className="bg-gray-900" {...props}>
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }: any) => (
      <tr className="border-b border-gray-700" {...props}>
        {children}
      </tr>
    ),
    th: ({ children, ...props }: any) => (
      <th className="px-4 py-2 text-left text-gray-200 font-semibold border-r border-gray-700 last:border-r-0" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }: any) => (
      <td className="px-4 py-2 text-gray-300 border-r border-gray-700 last:border-r-0" {...props}>
        {children}
      </td>
    ),

    // Blockquotes
    blockquote: ({ children, ...props }: any) => (
      <blockquote className="border-l-4 border-teal-500 pl-4 py-2 my-4 bg-gray-800/50 rounded-r-lg" {...props}>
        <div className="text-gray-300 italic">
          {children}
        </div>
      </blockquote>
    ),

    // Horizontal rules
    hr: ({ ...props }: any) => (
      <hr className="border-gray-700 my-6" {...props} />
    ),

    // Links
    a: ({ children, href, ...props }: any) => (
      <a
        href={href}
        className="text-teal-400 hover:text-teal-300 underline underline-offset-2"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    ),
  };

  return (
    <div className="w-full">
      {/* Thinking Process */}
      {thinking && (
        <div className="mb-4 p-3 bg-gray-800/30 border border-gray-700/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-yellow-400 text-sm font-medium">Gawin's Thinking</span>
          </div>
          <p className="text-gray-400 text-sm italic">{thinking}</p>
        </div>
      )}

      {/* Main Message Content */}
      <div className="prose prose-invert max-w-none">
        <div className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={components}
          >
            {text}
          </ReactMarkdown>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-700/50">
          <button
            onClick={onCopy}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>

          <button
            onClick={onThumbsUp}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-400 hover:text-green-400 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            Good
          </button>

          <button
            onClick={onThumbsDown}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2M17 4H19a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
            </svg>
            Poor
          </button>
        </div>
      )}

      <style jsx global>{`
        .markdown-content h2 {
          margin-top: 1.5rem !important;
          margin-bottom: 0.75rem !important;
        }

        .markdown-content h3 {
          margin-top: 1rem !important;
          margin-bottom: 0.5rem !important;
        }

        .markdown-content ul {
          margin-bottom: 1rem !important;
          padding-left: 0 !important;
        }

        .markdown-content li {
          margin-bottom: 0.5rem !important;
        }

        .markdown-content p {
          margin-bottom: 1rem !important;
        }

        .markdown-content table {
          margin-bottom: 1rem !important;
        }

        .markdown-content blockquote {
          margin: 1rem 0 !important;
        }
      `}</style>
    </div>
  );
}