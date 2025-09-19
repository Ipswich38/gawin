'use client';

import React, { useState } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { ComprehensiveFormatter, ContentType } from '@/lib/formatters/comprehensiveFormatter';

interface MessageRendererProps {
  text: string;
  showActions?: boolean;
  onCopy?: () => void;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  thinking?: string; // Gawin's internal thought process
}

export default function MessageRenderer({ text, showActions, onCopy, onThumbsUp, onThumbsDown, thinking }: MessageRendererProps) {
  // Add state for copy functionality at component level
  const [copiedCodeBlocks, setCopiedCodeBlocks] = useState<{ [key: number]: boolean }>({});

  // For OCR-related messages, render as plain text without any processing
  const isOCRMessage = text.includes('uploaded') || text.includes('PDF') || text.includes('images') ||
                      text.includes('OCR') || text.includes('extraction') || text.includes('convert') ||
                      text.includes('PNG') || text.includes('JPG') || text.includes('analyze');

  if (isOCRMessage) {
    return (
      <div className="message-content" style={{
        letterSpacing: 'normal',
        wordSpacing: 'normal',
        whiteSpace: 'pre-wrap'
      }}>
        <span>{text}</span>
      </div>
    );
  }
  
  // New comprehensive formatting system
  const formatContentWithNewSystem = (input: string) => {
    // Detect content type and apply appropriate formatting
    const contentType = ComprehensiveFormatter.detectContentType(input);

    return ComprehensiveFormatter.formatText(input, contentType, {
      enableMathRendering: true,
      enableCodeSyntaxHighlighting: true,
      preserveOriginalFormatting: false
    });
  };

  // Handle code blocks with syntax highlighting - ChatGPT style
  const renderCodeBlock = (language: string, code: string, key: number) => {
    const copied = copiedCodeBlocks[key] || false;

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopiedCodeBlocks(prev => ({ ...prev, [key]: true }));
        setTimeout(() => {
          setCopiedCodeBlocks(prev => ({ ...prev, [key]: false }));
        }, 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
      }
    };

    return (
      <div key={key} className="my-3 group">
        <div className="bg-gray-950 rounded-xl overflow-hidden border border-gray-700/30 shadow-lg">
          {/* Mobile-first code block header - ChatGPT style */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-gray-800/80 border-b border-gray-700/30">
            <span className="text-xs sm:text-sm text-gray-300 font-medium tracking-wide">
              {language ? language.charAt(0).toUpperCase() + language.slice(1) : 'Code'}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-all duration-200 p-1.5 rounded-md hover:bg-gray-700/50 touch-manipulation"
              title={copied ? "Copied!" : "Copy code"}
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-4 sm:h-4">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  <span className="text-xs font-medium text-green-400 hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-4 sm:h-4">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1"/>
                  </svg>
                  <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          </div>
          {/* Mobile-optimized code content */}
          <div className="relative">
            <pre className="p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm lg:text-base bg-gray-950 leading-relaxed">
              <code className={`language-${language} text-gray-100 block whitespace-pre`} style={{
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, "Ubuntu Mono", Consolas, "Courier New", monospace',
                lineHeight: '1.6',
                tabSize: 2,
                fontSize: 'inherit',
                wordBreak: 'normal',
                overflowWrap: 'normal',
                whiteSpace: 'pre',
                textAlign: 'left'
              }}>
                {code}
              </code>
            </pre>
          </div>
        </div>
      </div>
    );
  };

  // Split text by code blocks, LaTeX blocks and images, process each part
  const renderText = (input: string) => {
    const parts = [];
    let currentIndex = 0;

    // Find code blocks FIRST (before images and LaTeX) to avoid interference
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    let codeMatch;

    while ((codeMatch = codeBlockRegex.exec(input)) !== null) {
      // Add text before the code block (process for images and other content)
      if (codeMatch.index > currentIndex) {
        const beforeText = input.slice(currentIndex, codeMatch.index);
        parts.push(...renderNonCodeContent(beforeText, parts.length));
      }

      // Add the code block - preserve original spacing and indentation
      const language = codeMatch[1] || 'text';
      const code = codeMatch[2].replace(/^\n+|\n+$/g, ''); // Remove only leading/trailing newlines
      parts.push(renderCodeBlock(language, code, parts.length));

      currentIndex = codeMatch.index + codeMatch[0].length;
    }

    // Add remaining text (process for images and other content)
    if (currentIndex < input.length) {
      const remainingText = input.slice(currentIndex);
      parts.push(...renderNonCodeContent(remainingText, parts.length));
    }

    // If no code blocks were found, process the entire input for images and other content
    return parts.length > 0 ? parts : renderNonCodeContent(input, 0);
  };

  // Handle non-code content (images, math, text)
  const renderNonCodeContent = (input: string, keyOffset: number = 0) => {
    const parts = [];
    let currentIndex = 0;

    // Find markdown images (after code blocks) to avoid LaTeX interference
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let imageMatch;

    while ((imageMatch = imageRegex.exec(input)) !== null) {
      // Add text before the image (apply new formatting to non-image text)
      if (imageMatch.index > currentIndex) {
        const beforeText = input.slice(currentIndex, imageMatch.index);
        const processedBeforeText = formatContentWithNewSystem(beforeText);
        parts.push(processDisplayMathAndInline(processedBeforeText, keyOffset + parts.length));
      }

      // Add the image
      const altText = imageMatch[1] || 'Generated Image';
      const imageUrl = imageMatch[2];

      parts.push(
        <div key={keyOffset + parts.length} className="my-4 flex justify-center">
          <img
            src={imageUrl}
            alt={altText}
            className="max-w-full h-auto rounded-lg shadow-lg border border-gray-200"
            style={{ maxHeight: '500px' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const errorDiv = document.createElement('div');
              errorDiv.className = 'p-4 bg-red-50 border border-red-200 rounded text-red-700 text-center';
              errorDiv.innerHTML = `
                <div>Failed to load image: ${altText}</div>
                <div class="text-xs mt-1 opacity-75">URL: ${imageUrl}</div>
                <div class="text-xs mt-1">
                  <a href="${imageUrl}" target="_blank" class="text-blue-600 hover:underline">
                    Try opening in new tab
                  </a>
                </div>
              `;
              target.parentNode?.appendChild(errorDiv);
            }}
          />
        </div>
      );

      currentIndex = imageMatch.index + imageMatch[0].length;
    }

    // Add remaining text (apply new formatting to remaining non-image text)
    if (currentIndex < input.length) {
      const remainingText = input.slice(currentIndex);
      const processedRemainingText = formatContentWithNewSystem(remainingText);
      parts.push(processDisplayMathAndInline(processedRemainingText, keyOffset + parts.length));
    }

    // If no images were found, process the entire input with new formatting
    return parts.length > 0 ? parts : [processDisplayMathAndInline(formatContentWithNewSystem(input), keyOffset)];
  };

  // Simplified function to handle display math and render formatted HTML
  const processDisplayMathAndInline = (htmlContent: string, keyOffset: number) => {
    const parts = [];
    let currentIndex = 0;

    // Find display math blocks ($$...$$) in the HTML content
    const displayMathRegex = /\$\$([^$]+)\$\$/g;
    let match;

    while ((match = displayMathRegex.exec(htmlContent)) !== null) {
      // Add HTML content before the math
      if (match.index > currentIndex) {
        const beforeHTML = htmlContent.slice(currentIndex, match.index);
        parts.push(
          <div key={keyOffset + parts.length}
               className="formatted-content"
               dangerouslySetInnerHTML={{ __html: beforeHTML }} />
        );
      }

      // Add the display math
      try {
        parts.push(
          <div key={keyOffset + parts.length} className="my-4">
            <BlockMath math={match[1].trim()} />
          </div>
        );
      } catch (error) {
        // Fallback if LaTeX is invalid
        parts.push(
          <div key={keyOffset + parts.length} className="my-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            Invalid LaTeX: ${match[1].trim()}$
          </div>
        );
      }

      currentIndex = match.index + match[0].length;
    }

    // Add remaining HTML content
    if (currentIndex < htmlContent.length) {
      const remainingHTML = htmlContent.slice(currentIndex);
      parts.push(
        <div key={keyOffset + parts.length}
             className="formatted-content"
             dangerouslySetInnerHTML={{ __html: remainingHTML }} />
      );
    }

    return parts.length > 0 ? parts : [
      <div key={keyOffset}
           className="formatted-content"
           dangerouslySetInnerHTML={{ __html: htmlContent }} />
    ];
  };

  const processInlineText = (htmlContent: string, keyOffset: number) => {
    // Handle inline math in already formatted HTML content
    const mathRegex = /\$([^$]+)\$/g;
    let processedHTML = htmlContent;

    processedHTML = processedHTML.replace(mathRegex, (match, mathContent) => {
      try {
        // For inline math, we'll create a placeholder that gets processed later
        return `<span class="inline-math" data-math="${mathContent.trim()}"></span>`;
      } catch (error) {
        return `<span class="bg-red-50 text-red-700 px-1 rounded text-xs">Invalid LaTeX: ${mathContent}</span>`;
      }
    });

    return [
      <div key={keyOffset}
           className="formatted-content"
           dangerouslySetInnerHTML={{ __html: processedHTML }} />
    ];
  };

  // Simplified formatText - comprehensive formatter handles complex logic
  const formatText = (htmlContent: string, key: number) => {
    return (
      <div key={key} className="formatted-content leading-relaxed"
           dangerouslySetInnerHTML={{ __html: htmlContent }} />
    );
  };

  // Old formatInlineElements removed - comprehensive formatter handles all special formatting

  return (
    <div className="message-content" style={{
      letterSpacing: 'normal',
      wordSpacing: 'normal',
      whiteSpace: 'normal'
    }}>
      {/* Gawin's Thinking Process - Subtle Display */}
      {thinking && (
        <div className="mb-3 text-xs italic text-gray-400 opacity-75 border-l-2 border-gray-600/30 pl-3 py-1">
          <span className="text-gray-500">💭 </span>
          {thinking}
        </div>
      )}
      
      {renderText(text)}
      
      {/* Action buttons for AI responses */}
      {showActions && (
        <div className="flex items-center justify-end space-x-2 mt-3 pt-2 border-t border-gray-600/30">
          <button
            onClick={() => {
              navigator.clipboard.writeText(text);
              onCopy?.();
            }}
            className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-700/30 rounded transition-colors"
            title="Copy response"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          
          <button
            onClick={onThumbsUp}
            className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors"
            title="Good response"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7v13m-5-4v2a2 2 0 002 2h2.5l1-1" />
            </svg>
          </button>
          
          <button
            onClick={onThumbsDown}
            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
            title="Poor response"
          >
            <svg className="w-3.5 h-3.5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7v13m-5-4v2a2 2 0 002 2h2.5l1-1" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}