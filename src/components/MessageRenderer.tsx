'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MessageRendererProps {
  text: string;
  showActions?: boolean;
  onCopy?: () => void;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  thinking?: string; // Gawin's internal thought process
}

export default function MessageRenderer({ text, showActions, onCopy, onThumbsUp, onThumbsDown, thinking }: MessageRendererProps) {
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
  
  // Preprocess text to handle various fraction formats and improve formatting
  const preprocessText = (input: string) => {
    return input
      // Fix numbered lists - convert "1. " patterns to proper sequential numbering
      .replace(/(\n|^)1\.\s+/g, (match, prefix, offset, str) => {
        // Count previous numbered items to determine correct number
        const beforeText = str.slice(0, offset);
        const itemCount = (beforeText.match(/(\n|^)\d+\.\s+/g) || []).length;
        return `${prefix}${itemCount + 1}. `;
      })
      // Convert **bold** to proper HTML bold (keep semantic meaning)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert *italic* to proper HTML italic (keep semantic meaning)
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
      // Convert simple fractions like 1/2 to LaTeX when they appear to be mathematical
      .replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}')
      // Convert fractions with parentheses like (a+b)/(c+d) to LaTeX
      .replace(/\(([^)]+)\)\/\(([^)]+)\)/g, '\\frac{$1}{$2}')
      // Convert complex fractions with variables - but be more specific to avoid matching normal text
      .replace(/\b([a-zA-Z0-9\+\-\*]{1,3})\/([a-zA-Z0-9\+\-\*]{1,3})\b/g, (match, p1, p2) => {
        // Only convert if it looks like a mathematical expression (short terms)
        if (p1.length <= 3 && p2.length <= 3 && /^[a-zA-Z0-9\+\-\*]+$/.test(p1) && /^[a-zA-Z0-9\+\-\*]+$/.test(p2)) {
          return `\\frac{${p1}}{${p2}}`;
        }
        return match;
      })
      // Fix common math symbols
      .replace(/\+\-/g, '\\pm')
      .replace(/\-\+/g, '\\mp')
      .replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')
      // Convert degree symbol
      .replace(/°/g, '^\\circ');
  };

  // Handle code blocks with syntax highlighting
  const renderCodeBlock = (language: string, code: string, key: number) => {
    return (
      <div key={key} className="my-4">
        <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
          {/* Code block header */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            <span className="text-sm text-gray-300 font-medium">
              {language.charAt(0).toUpperCase() + language.slice(1)}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(code);
              }}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded"
              title="Copy code"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
          </div>
          {/* Code content with proper formatting */}
          <pre className="p-4 overflow-x-auto text-sm bg-gray-900">
            <code className={`language-${language} text-gray-100 block whitespace-pre`} style={{
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace',
              lineHeight: '1.5',
              tabSize: 2
            }}>
              {code}
            </code>
          </pre>
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

      // Add the code block
      const language = codeMatch[1] || 'text';
      const code = codeMatch[2].trim();
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
      // Add text before the image (apply preprocessing to non-image text)
      if (imageMatch.index > currentIndex) {
        const beforeText = input.slice(currentIndex, imageMatch.index);
        const processedBeforeText = preprocessText(beforeText);
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

    // Add remaining text (apply preprocessing to remaining non-image text)
    if (currentIndex < input.length) {
      const remainingText = input.slice(currentIndex);
      const processedRemainingText = preprocessText(remainingText);
      parts.push(processDisplayMathAndInline(processedRemainingText, keyOffset + parts.length));
    }

    // If no images were found, process the entire input with preprocessing
    return parts.length > 0 ? parts : [processDisplayMathAndInline(preprocessText(input), keyOffset)];
  };

  // Separate function to handle display math blocks
  const processDisplayMathAndInline = (input: string, keyOffset: number) => {
    const parts = [];
    let currentIndex = 0;
    
    // Find display math blocks ($$...$$)
    const displayMathRegex = /\$\$([^$]+)\$\$/g;
    let match;
    
    while ((match = displayMathRegex.exec(input)) !== null) {
      // Add text before the math
      if (match.index > currentIndex) {
        const beforeText = input.slice(currentIndex, match.index);
        parts.push(processInlineText(beforeText, keyOffset + parts.length));
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
    
    // Add remaining text
    if (currentIndex < input.length) {
      const remainingText = input.slice(currentIndex);
      parts.push(processInlineText(remainingText, keyOffset + parts.length));
    }
    
    return parts.length > 0 ? parts : [processInlineText(input, keyOffset)];
  };

  const processInlineText = (text: string, keyOffset: number) => {
    const parts = [];
    let currentIndex = 0;
    
    // Enhanced regex for various math formats
    const mathRegex = /\\?\[([^\]]+)\\?\]|\\?\(([^)]+)\\?\)|\\frac\{([^}]+)\}\{([^}]+)\}|\$([^$]+)\$/g;
    let match;
    
    while ((match = mathRegex.exec(text)) !== null) {
      // Add text before the math
      if (match.index > currentIndex) {
        const beforeText = text.slice(currentIndex, match.index);
        parts.push(formatText(beforeText, keyOffset + parts.length));
      }
      
      // Determine which type of math was matched and process accordingly
      let mathContent = '';
      if (match[1]) {
        // \[...\] display math
        mathContent = match[1].trim();
      } else if (match[2]) {
        // \(...\) inline math
        mathContent = match[2].trim();
      } else if (match[3] && match[4]) {
        // \frac{numerator}{denominator}
        mathContent = `\\frac{${match[3].trim()}}{${match[4].trim()}}`;
      } else if (match[5]) {
        // $...$ inline math
        mathContent = match[5].trim();
      }
      
      // Add the processed math
      try {
        parts.push(
          <InlineMath key={keyOffset + parts.length} math={mathContent} />
        );
      } catch (error) {
        // Fallback for invalid LaTeX
        parts.push(
          <span key={keyOffset + parts.length} className="bg-red-50 text-red-700 px-1 rounded text-xs">
            Invalid LaTeX: {mathContent}
          </span>
        );
      }
      
      currentIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
      const remainingText = text.slice(currentIndex);
      parts.push(formatText(remainingText, keyOffset + parts.length));
    }
    
    return parts.length > 0 ? parts : [formatText(text, keyOffset)];
  };

  const formatText = (text: string, key: number) => {
    // Enhanced paragraph processing for better readability
    let processedText = text;

    // Identify numbered lists and group them
    const lines = processedText.split('\n').filter(line => line.trim().length > 0);
    const elements: any[] = [];
    let currentList: string[] = [];
    let inList = false;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Check if this line is a numbered list item
      if (/^\d+\.\s+/.test(trimmedLine)) {
        if (!inList) {
          // Start new list
          if (currentList.length > 0) {
            // Finish previous non-list content
            elements.push(
              <div key={`text-${elements.length}`} className="leading-relaxed space-y-2">
                {currentList.map((text, i) => (
                  <div key={i} dangerouslySetInnerHTML={{ __html: text }} />
                ))}
              </div>
            );
            currentList = [];
          }
          inList = true;
        }
        currentList.push(trimmedLine);
      } else {
        if (inList) {
          // End list and add it to elements
          elements.push(
            <ol key={`list-${elements.length}`} className="list-decimal list-inside space-y-2 ml-4 leading-relaxed">
              {currentList.map((item, i) => {
                const content = item.replace(/^\d+\.\s+/, '');
                return (
                  <li key={i} className="pl-2" dangerouslySetInnerHTML={{ __html: content }} />
                );
              })}
            </ol>
          );
          currentList = [];
          inList = false;
        }
        currentList.push(trimmedLine);
      }
    });

    // Add remaining content
    if (currentList.length > 0) {
      if (inList) {
        // Add remaining list items
        elements.push(
          <ol key={`list-${elements.length}`} className="list-decimal list-inside space-y-2 ml-4 leading-relaxed">
            {currentList.map((item, i) => {
              const content = item.replace(/^\d+\.\s+/, '');
              return (
                <li key={i} className="pl-2" dangerouslySetInnerHTML={{ __html: content }} />
              );
            })}
          </ol>
        );
      } else {
        // Add remaining text
        elements.push(
          <div key={`text-${elements.length}`} className="leading-relaxed space-y-2">
            {currentList.map((text, i) => (
              <div key={i} dangerouslySetInnerHTML={{ __html: text }} />
            ))}
          </div>
        );
      }
    }

    if (elements.length === 0) {
      return <div key={key} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: text }} />;
    }

    return (
      <div key={key} className="space-y-4">
        {elements}
      </div>
    );
  };

  const formatInlineElements = (text: string) => {
    // Handle Step headings (Step 1:, Step 2:, etc.)
    if (/^Step \d+:/i.test(text)) {
      const [, stepNum, content] = text.match(/^Step (\d+):\s*(.*)$/i) || [];
      if (stepNum && content) {
        return (
          <div className="mt-6 mb-4">
            <h3 className="text-lg font-bold text-teal-600 mb-2">Step {stepNum}: {content}</h3>
          </div>
        );
      }
    }
    
    // Handle ### Step headings (### Step 1:, etc.)
    if (/^#{1,3}\s*Step \d+:/i.test(text)) {
      const [, stepNum, content] = text.match(/^#{1,3}\s*Step (\d+):\s*(.*)$/i) || [];
      if (stepNum && content) {
        return (
          <div className="mt-6 mb-4">
            <h3 className="text-lg font-bold text-teal-600 mb-2">Step {stepNum}: {content}</h3>
          </div>
        );
      }
    }
    
    // Handle numbered lists
    if (/^\d+\./.test(text)) {
      const [, number, content] = text.match(/^(\d+)\.\s*(.*)$/) || [];
      if (number && content) {
        return (
          <div className="flex items-start space-x-2 mb-2">
            <span className="font-semibold text-teal-600 flex-shrink-0">{number}.</span>
            <span>{content}</span>
          </div>
        );
      }
    }
    
    // Handle bullet points
    if (text.startsWith('•') || text.startsWith('-')) {
      const content = text.replace(/^[•\-]\s*/, '');
      return (
        <div className="flex items-start space-x-2 mb-2">
          <span className="text-teal-600 flex-shrink-0">•</span>
          <span>{content}</span>
        </div>
      );
    }
    
    // Handle "✅ Final Answer" specially
    if (text.includes('✅ Final Answer') || text.includes('Final Answer:')) {
      const delimiter = text.includes('✅ Final Answer') ? '✅ Final Answer' : 'Final Answer:';
      const parts = text.split(delimiter);
      return (
        <div>
          {parts[0] && <span>{parts[0]}</span>}
          <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r shadow-sm">
            <div className="font-bold text-teal-600 mb-2 text-lg">✅ Final Answer</div>
            <div className="text-green-700 font-medium">{parts[1]}</div>
          </div>
        </div>
      );
    }
    
    // Handle "### ✅ Final Answer" specially
    if (text.includes('### ✅ Final Answer')) {
      const parts = text.split('### ✅ Final Answer');
      return (
        <div>
          {parts[0] && <span>{parts[0]}</span>}
          <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r shadow-sm">
            <div className="font-bold text-teal-600 mb-2 text-lg">✅ Final Answer</div>
            <div className="text-green-700 font-medium">{parts[1]}</div>
          </div>
        </div>
      );
    }
    
    // Handle "Solution:" specially
    if (text.includes('Solution:')) {
      const parts = text.split('Solution:');
      return (
        <div>
          {parts[0] && <span>{parts[0]}</span>}
          <div className="mt-3 font-semibold text-teal-600">Solution:</div>
          <div className="text-gray-700">{parts[1]}</div>
        </div>
      );
    }
    
    return <span>{text}</span>;
  };

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