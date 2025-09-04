'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MessageRendererProps {
  text: string;
}

export default function MessageRenderer({ text }: MessageRendererProps) {
  // Preprocess text to handle various fraction formats
  const preprocessText = (input: string) => {
    return input
      // Convert simple fractions like 1/2 to LaTeX when they appear to be mathematical
      .replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}')
      // Convert fractions with parentheses like (a+b)/(c+d) to LaTeX
      .replace(/\(([^)]+)\)\/\(([^)]+)\)/g, '\\frac{$1}{$2}')
      // Convert complex fractions with variables
      .replace(/([a-zA-Z0-9\+\-\*]+)\/([a-zA-Z0-9\+\-\*]+)/g, '\\frac{$1}{$2}')
      // Fix common math symbols
      .replace(/\+\-/g, '\\pm')
      .replace(/\-\+/g, '\\mp')
      .replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')
      // Convert degree symbol
      .replace(/°/g, '^\\circ');
  };

  // Split text by LaTeX blocks and images, process each part
  const renderText = (input: string) => {
    const parts = [];
    let currentIndex = 0;
    
    // Find markdown images FIRST (before preprocessing) to avoid LaTeX interference
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let imageMatch;
    
    while ((imageMatch = imageRegex.exec(input)) !== null) {
      // Add text before the image (apply preprocessing to non-image text)
      if (imageMatch.index > currentIndex) {
        const beforeText = input.slice(currentIndex, imageMatch.index);
        const processedBeforeText = preprocessText(beforeText);
        parts.push(processDisplayMathAndInline(processedBeforeText, parts.length));
      }
      
      // Add the image
      const altText = imageMatch[1] || 'Generated Image';
      const imageUrl = imageMatch[2];
      
      parts.push(
        <div key={parts.length} className="my-4 flex justify-center">
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
      parts.push(processDisplayMathAndInline(processedRemainingText, parts.length));
    }
    
    // If no images were found, process the entire input with preprocessing
    return parts.length > 0 ? parts : [processDisplayMathAndInline(preprocessText(input), 0)];
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
    // Split by paragraphs and add proper spacing
    const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
    
    if (paragraphs.length <= 1) {
      return <span key={key}>{text}</span>;
    }
    
    return (
      <div key={key} className="space-y-3">
        {paragraphs.map((paragraph, index) => (
          <div key={index} className="leading-relaxed">
            {formatInlineElements(paragraph.trim())}
          </div>
        ))}
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
            <h3 className="text-lg font-bold text-blue-800 mb-2">Step {stepNum}: {content}</h3>
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
            <h3 className="text-lg font-bold text-blue-800 mb-2">Step {stepNum}: {content}</h3>
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
            <span className="font-semibold text-orange-600 flex-shrink-0">{number}.</span>
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
          <span className="text-orange-600 flex-shrink-0">•</span>
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
            <div className="font-bold text-green-800 mb-2 text-lg">✅ Final Answer</div>
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
            <div className="font-bold text-green-800 mb-2 text-lg">✅ Final Answer</div>
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
          <div className="mt-3 font-semibold text-blue-800">Solution:</div>
          <div className="text-gray-700">{parts[1]}</div>
        </div>
      );
    }
    
    return <span>{text}</span>;
  };

  return (
    <div className="message-content">
      {renderText(text)}
    </div>
  );
}