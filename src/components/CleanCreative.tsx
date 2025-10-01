'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  model: string;
  timestamp: string;
  isGenerating: boolean;
  error?: string;
  style?: string;
  aspectRatio?: string;
}

export default function CleanCreative() {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGeneration, setCurrentGeneration] = useState<GeneratedImage | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('1:1');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [images, currentGeneration]);



  // Auto-resize textarea function
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const minHeight = 48; // ~2 lines
      const maxHeight = 144; // ~6 lines
      textarea.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
    }
  };

  // Handle input change with auto-resize
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    adjustTextareaHeight();
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);


  // Copy image URL to clipboard
  const copyImageUrl = async (image: GeneratedImage) => {
    try {
      await navigator.clipboard.writeText(image.imageUrl);
      console.log('Image URL copied to clipboard');
    } catch (err) {
      console.error('Failed to copy image URL:', err);
    }
  };

  // Download image
  const downloadImage = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gawin-generated-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const generateImage = async () => {
    if (!inputValue.trim() || isGenerating) return;

    const prompt = inputValue.trim();
    setInputValue('');
    setIsGenerating(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
    }

    // Create new generation entry
    const newGeneration: GeneratedImage = {
      id: Date.now().toString(),
      prompt,
      imageUrl: '',
      model: 'Together AI FLUX',
      timestamp: new Date().toLocaleTimeString(),
      isGenerating: true,
      style: selectedStyle,
      aspectRatio: selectedAspectRatio
    };

    setCurrentGeneration(newGeneration);

    try {
      const response = await fetch('/api/image-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          style: selectedStyle,
          aspectRatio: selectedAspectRatio
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.imageUrl) {
        const completedGeneration: GeneratedImage = {
          ...newGeneration,
          imageUrl: data.imageUrl,
          isGenerating: false
        };

        setCurrentGeneration(null);
        setImages(prev => [...prev, completedGeneration]);
      } else {
        throw new Error(data.error || 'Image generation failed');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      const errorGeneration: GeneratedImage = {
        ...newGeneration,
        imageUrl: '',
        isGenerating: false,
        error: 'Failed to generate image. Please try again.'
      };

      setCurrentGeneration(null);
      setImages(prev => [...prev, errorGeneration]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateImage();
    }
  };

  const styleOptions = [
    { value: 'realistic', label: 'Realistic', emoji: '📸' },
    { value: 'artistic', label: 'Artistic', emoji: '🎨' },
    { value: 'abstract', label: 'Abstract', emoji: '🌀' }
  ];

  const aspectRatios = [
    { value: '1:1', label: 'Square', emoji: '⬛' },
    { value: '16:9', label: 'Landscape', emoji: '🖼️' },
    { value: '9:16', label: 'Portrait', emoji: '📱' }
  ];

  return (
    <div className="flex flex-col h-full relative" style={{backgroundColor: '#1b1e1e'}}>

      {/* Minimized Controls */}
      <div className="px-4 py-2 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {/* Current Settings Display */}
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-400">Style:</span>
            <span className="text-pink-400">{styleOptions.find(s => s.value === selectedStyle)?.emoji} {styleOptions.find(s => s.value === selectedStyle)?.label}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400">Ratio:</span>
            <span className="text-purple-400">{aspectRatios.find(r => r.value === selectedAspectRatio)?.emoji} {aspectRatios.find(r => r.value === selectedAspectRatio)?.label}</span>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
          >
            <span>{showAdvancedOptions ? 'Hide' : 'Options'}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className={`transition-transform duration-200 ${showAdvancedOptions ? 'rotate-180' : ''}`}
            >
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>
        </div>

        {/* Collapsible Advanced Options */}
        <AnimatePresence>
          {showAdvancedOptions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-3 overflow-hidden"
            >
              {/* Style Selection */}
              <div>
                <label className="text-gray-300 text-xs font-medium mb-2 block">Style</label>
                <div className="flex gap-2">
                  {styleOptions.map((style) => (
                    <button
                      key={style.value}
                      onClick={() => setSelectedStyle(style.value)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
                        selectedStyle === style.value
                          ? 'bg-pink-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <span>{style.emoji}</span>
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio Selection */}
              <div>
                <label className="text-gray-300 text-xs font-medium mb-2 block">Aspect Ratio</label>
                <div className="flex gap-2">
                  {aspectRatios.map((ratio) => (
                    <button
                      key={ratio.value}
                      onClick={() => setSelectedAspectRatio(ratio.value)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
                        selectedAspectRatio === ratio.value
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <span>{ratio.emoji}</span>
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Generated Images Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence>
          {images.length === 0 && !currentGeneration ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-white text-lg font-medium mb-2">
                Welcome to Creative Mode!
              </h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                Generate stunning, watermark-free images using AI. Describe what you want to create,
                choose your style and aspect ratio, and let creativity flow!
              </p>
            </motion.div>
          ) : (
            <>

              {/* Generated Images */}
              {images.map((image) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-6 border border-gray-700 relative"
                  style={{backgroundColor: '#1b1e1e'}}
                >
                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => copyImageUrl(image)}
                      className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors group"
                      title="Copy image URL"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400 group-hover:text-white">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => downloadImage(image)}
                      className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors group"
                      title="Download image"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400 group-hover:text-white">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7,10 12,15 17,10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </button>
                  </div>

                  {/* Image Prompt */}
                  <div className="mb-4 pr-20">
                    <h3 className="text-white font-medium text-lg mb-2">Generated Image</h3>
                    <p className="text-pink-300 bg-pink-900/20 p-3 rounded-lg">{image.prompt}</p>
                  </div>

                  {/* Image Display */}
                  {image.error ? (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
                      <span className="text-red-400 text-sm">{image.error}</span>
                    </div>
                  ) : image.imageUrl ? (
                    <div className="mb-4">
                      <img
                        src={image.imageUrl}
                        alt={image.prompt}
                        className="w-full max-w-lg mx-auto rounded-lg shadow-lg"
                        style={{ aspectRatio: image.aspectRatio }}
                      />
                    </div>
                  ) : null}

                  {/* Image Details */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-4">
                      <span>Style: {image.style}</span>
                      <span>Ratio: {image.aspectRatio}</span>
                      <span>Model: {image.model}</span>
                    </div>
                    <span>Generated at {image.timestamp}</span>
                  </div>
                </motion.div>
              ))}

              {/* Current Generation in Progress */}
              {currentGeneration && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-6 border border-pink-500/30"
                  style={{backgroundColor: '#1b1e1e'}}
                >
                  <div className="mb-4">
                    <h3 className="text-white font-medium text-lg mb-2">Image Generation in Progress</h3>
                    <p className="text-pink-300 bg-pink-900/20 p-3 rounded-lg">{currentGeneration.prompt}</p>
                  </div>

                  <div className="flex items-center gap-3 text-pink-400">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-sm">Creating your image...</span>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Image Generation Input Area */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-end gap-3 rounded-full border border-pink-500/30 p-4 transition-all duration-200 hover:border-pink-500/50 focus-within:border-pink-500/70" style={{backgroundColor: '#1b1e1e'}}>
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Describe the image you want to create..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none outline-none border-none min-h-[48px] leading-6 focus:outline-none focus:ring-0 focus:border-none"
            style={{
              height: '48px',
              border: 'none',
              outline: 'none',
              boxShadow: 'none'
            }}
            disabled={isGenerating}
          />
          <button
            onClick={generateImage}
            disabled={isGenerating || !inputValue.trim()}
            className={`p-3 rounded-full transition-all duration-200 flex-shrink-0 ${
              inputValue.trim() && !isGenerating
                ? 'bg-pink-600 text-white hover:bg-pink-500 shadow-lg shadow-pink-500/25'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span className="text-lg">🎨</span>
          </button>
        </div>
      </div>
    </div>
  );
}