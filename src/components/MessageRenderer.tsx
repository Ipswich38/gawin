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

  // Split text by LaTeX blocks and process each part
  const renderText = (input: string) => {
    // First preprocess the input
    const processedInput = preprocessText(input);
    
    const parts = [];
    let currentIndex = 0;
    
    // Find display math blocks ($$...$$)
    const displayMathRegex = /\$\$([^$]+)\$\$/g;
    let match;
    
    while ((match = displayMathRegex.exec(processedInput)) !== null) {
      // Add text before the math
      if (match.index > currentIndex) {
        const beforeText = processedInput.slice(currentIndex, match.index);
        parts.push(processInlineText(beforeText, parts.length));
      }
      
      // Add the display math
      try {
        parts.push(
          <div key={parts.length} className="my-4">
            <BlockMath math={match[1].trim()} />
          </div>
        );
      } catch (error) {
        // Fallback if LaTeX is invalid
        parts.push(
          <div key={parts.length} className="my-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            Invalid LaTeX: ${match[1].trim()}$
          </div>
        );
      }
      
      currentIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (currentIndex < processedInput.length) {
      const remainingText = processedInput.slice(currentIndex);
      parts.push(processInlineText(remainingText, parts.length));
    }
    
    return parts.length > 0 ? parts : [processInlineText(processedInput, 0)];
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
    
    // Handle "Final Answer:" specially
    if (text.includes('Final Answer:')) {
      const parts = text.split('Final Answer:');
      return (
        <div>
          {parts[0] && <span>{parts[0]}</span>}
          <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-400 rounded-r">
            <div className="font-semibold text-green-800 mb-1">Final Answer:</div>
            <div className="text-green-700">{parts[1]}</div>
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