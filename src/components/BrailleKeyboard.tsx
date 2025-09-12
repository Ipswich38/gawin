'use client';

import React, { useState, useEffect, useRef } from 'react';

interface BrailleKeyboardProps {
  isVisible: boolean;
  onInput: (text: string) => void;
  onClose: () => void;
  onVoiceAnnounce?: (text: string) => void;
}

// Braille character mappings
const BRAILLE_MAP: { [key: string]: string } = {
  // Letters
  '100000': 'a', '110000': 'b', '100100': 'c', '100110': 'd', '100010': 'e',
  '110100': 'f', '110110': 'g', '110010': 'h', '010100': 'i', '010110': 'j',
  '101000': 'k', '111000': 'l', '101100': 'm', '101110': 'n', '101010': 'o',
  '111100': 'p', '111110': 'q', '111010': 'r', '011100': 's', '011110': 't',
  '101001': 'u', '111001': 'v', '010111': 'w', '101101': 'x', '101111': 'y',
  '101011': 'z',
  
  // Numbers (prefix with number sign)
  '001111': '#', // number sign
  
  // Common punctuation
  '000000': ' ', // space
  '010000': ',', // comma
  '011000': ';', // semicolon
  '010001': ':', // colon
  '011001': '.', // period
  '001001': '!', // exclamation
  '011010': '(', '011010': ')', // parentheses
  '001010': '?', // question mark
  '001100': '"', // quotation mark
  '000001': "'", // apostrophe
  '001101': '-', // hyphen
  
  // Common contractions and shortcuts
  '000010': 'and',
  '000110': 'for',
  '001000': 'of',
  '000100': 'the',
  '001011': 'with',
};

// Reverse mapping for character to braille
const CHAR_TO_BRAILLE: { [key: string]: string } = {};
Object.entries(BRAILLE_MAP).forEach(([braille, char]) => {
  CHAR_TO_BRAILLE[char] = braille;
});

export default function BrailleKeyboard({ 
  isVisible, 
  onInput, 
  onClose, 
  onVoiceAnnounce 
}: BrailleKeyboardProps) {
  const [currentPattern, setCurrentPattern] = useState('000000');
  const [inputBuffer, setInputBuffer] = useState('');
  const [isNumberMode, setIsNumberMode] = useState(false);
  const keyboardRef = useRef<HTMLDivElement>(null);

  // Focus management
  useEffect(() => {
    if (isVisible && keyboardRef.current) {
      keyboardRef.current.focus();
      announceText('Braille keyboard opened. Use the 6 dots to compose characters.');
    }
  }, [isVisible]);

  const announceText = (text: string) => {
    if (onVoiceAnnounce) {
      onVoiceAnnounce(text);
    }
  };

  const toggleDot = (dotIndex: number) => {
    const newPattern = currentPattern.split('').map((bit, index) => 
      index === dotIndex ? (bit === '0' ? '1' : '0') : bit
    ).join('');
    
    setCurrentPattern(newPattern);
    
    // Announce the current pattern
    const activeDots = newPattern.split('').map((bit, index) => 
      bit === '1' ? `dot ${index + 1}` : null
    ).filter(Boolean);
    
    if (activeDots.length === 0) {
      announceText('No dots selected');
    } else {
      announceText(`Active dots: ${activeDots.join(', ')}`);
    }
  };

  const inputCharacter = () => {
    let character = BRAILLE_MAP[currentPattern];
    
    if (!character) {
      announceText('Unknown braille pattern');
      return;
    }

    // Handle special cases
    if (character === '#') {
      setIsNumberMode(!isNumberMode);
      announceText(isNumberMode ? 'Exiting number mode' : 'Entering number mode');
      setCurrentPattern('000000');
      return;
    }

    // Convert to number if in number mode
    if (isNumberMode && 'abcdefghij'.includes(character)) {
      const numberMap: { [key: string]: string } = {
        'a': '1', 'b': '2', 'c': '3', 'd': '4', 'e': '5',
        'f': '6', 'g': '7', 'h': '8', 'i': '9', 'j': '0'
      };
      character = numberMap[character] || character;
    }

    const newBuffer = inputBuffer + character;
    setInputBuffer(newBuffer);
    setCurrentPattern('000000');
    
    announceText(`Entered: ${character}`);
  };

  const deleteCharacter = () => {
    if (inputBuffer.length > 0) {
      const newBuffer = inputBuffer.slice(0, -1);
      setInputBuffer(newBuffer);
      announceText('Character deleted');
    } else {
      announceText('Buffer is empty');
    }
  };

  const submitText = () => {
    if (inputBuffer.trim()) {
      onInput(inputBuffer);
      setInputBuffer('');
      setCurrentPattern('000000');
      setIsNumberMode(false);
      announceText(`Submitted: ${inputBuffer}`);
    } else {
      announceText('No text to submit');
    }
  };

  const clearAll = () => {
    setInputBuffer('');
    setCurrentPattern('000000');
    setIsNumberMode(false);
    announceText('All cleared');
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Map number keys 1-6 to braille dots
      if (e.key >= '1' && e.key <= '6') {
        e.preventDefault();
        toggleDot(parseInt(e.key) - 1);
      }
      
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          inputCharacter();
          break;
        case 'Backspace':
          e.preventDefault();
          deleteCharacter();
          break;
        case ' ':
          e.preventDefault();
          if (e.ctrlKey) {
            submitText();
          } else {
            // Space character
            setCurrentPattern('000000');
            inputCharacter();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'Delete':
          e.preventDefault();
          clearAll();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, currentPattern, inputBuffer, isNumberMode]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        ref={keyboardRef}
        className="bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-md w-full"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="braille-keyboard-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 id="braille-keyboard-title" className="text-xl font-semibold flex items-center gap-3">
              <span className="text-2xl">⠃</span>
              Braille Keyboard
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close braille keyboard"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          {/* Status indicators */}
          <div className="mt-4 flex gap-2">
            {isNumberMode && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Number Mode
              </span>
            )}
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              Use keys 1-6 for dots
            </span>
          </div>
        </div>

        {/* Current input display */}
        <div className="p-6 border-b border-gray-200">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Input:
            </label>
            <div className="bg-gray-50 rounded-lg p-3 min-h-[3rem] border border-gray-200">
              <span className="text-lg font-mono">
                {inputBuffer || <span className="text-gray-400">Start typing...</span>}
              </span>
            </div>
          </div>

          {/* Current braille pattern display */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Pattern:
            </label>
            <div className="flex justify-center">
              <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg">
                {/* Braille cell layout: 1 4
                                        2 5  
                                        3 6 */}
                <div className="flex flex-col gap-2">
                  {[0, 1, 2].map(dotIndex => (
                    <div
                      key={dotIndex}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        currentPattern[dotIndex] === '1'
                          ? 'bg-teal-600 border-teal-600'
                          : 'bg-white border-gray-300 hover:border-teal-400'
                      }`}
                      role="button"
                      tabIndex={0}
                      aria-label={`Dot ${dotIndex + 1}`}
                      onClick={() => toggleDot(dotIndex)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleDot(dotIndex);
                        }
                      }}
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  {[3, 4, 5].map(dotIndex => (
                    <div
                      key={dotIndex}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        currentPattern[dotIndex] === '1'
                          ? 'bg-teal-600 border-teal-600'
                          : 'bg-white border-gray-300 hover:border-teal-400'
                      }`}
                      role="button"
                      tabIndex={0}
                      aria-label={`Dot ${dotIndex + 1}`}
                      onClick={() => toggleDot(dotIndex)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleDot(dotIndex);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Character preview */}
            <div className="text-center mt-2">
              <span className="text-sm text-gray-600">
                Character: <strong className="text-lg">
                  {BRAILLE_MAP[currentPattern] || '(none)'}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={inputCharacter}
              disabled={!BRAILLE_MAP[currentPattern]}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              aria-label="Input current character"
            >
              Input (Enter)
            </button>
            
            <button
              onClick={deleteCharacter}
              disabled={inputBuffer.length === 0}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              aria-label="Delete last character"
            >
              Delete (⌫)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              aria-label="Clear all input"
            >
              Clear All
            </button>
            
            <button
              onClick={submitText}
              disabled={!inputBuffer.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              aria-label="Submit text"
            >
              Submit (Ctrl+Space)
            </button>
          </div>

          {/* Help text */}
          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <p><strong>Keyboard shortcuts:</strong></p>
            <p>• Keys 1-6: Toggle braille dots</p>
            <p>• Enter: Input character</p>
            <p>• Backspace: Delete character</p>
            <p>• Ctrl+Space: Submit text</p>
            <p>• Escape: Close keyboard</p>
            <p>• Delete: Clear all</p>
          </div>
        </div>
      </div>
    </div>
  );
}