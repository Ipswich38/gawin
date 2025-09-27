/**
 * AI Provider Selector Component
 * Allows users to choose between different AI providers (Groq, Gemini, DeepSeek, etc.)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AIProvider {
  id: string;
  name: string;
  displayName: string;
  endpoint: string;
  models: string[];
  defaultModel: string;
  description: string;
  features: string[];
  isActive: boolean;
  requiresApiKey?: boolean;
}

interface AIProviderSelectorProps {
  currentProvider: string;
  onProviderChange: (providerId: string) => void;
  onModelChange: (model: string) => void;
  currentModel: string;
  className?: string;
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'groq',
    name: 'groq',
    displayName: 'Groq ⚡',
    endpoint: '/api/groq',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama3-groq-70b-8192-tool-use-preview'],
    defaultModel: 'llama-3.3-70b-versatile',
    description: 'Ultra-fast inference with Llama models',
    features: ['Super fast responses', 'Great for conversations', 'Tool use support'],
    isActive: true
  },
  {
    id: 'gemini',
    name: 'gemini',
    displayName: 'Gemini 🧠',
    endpoint: '/api/gemini',
    models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'],
    defaultModel: 'gemini-1.5-flash',
    description: 'Google\'s most capable AI model (Disabled)',
    features: ['Excellent reasoning', 'Multimodal support', 'Large context window'],
    isActive: false,
    requiresApiKey: true
  },
  {
    id: 'deepseek',
    name: 'deepseek',
    displayName: 'DeepSeek 🔬',
    endpoint: '/api/deepseek',
    models: ['deepseek-chat', 'deepseek-coder'],
    defaultModel: 'deepseek-chat',
    description: 'Advanced reasoning and coding capabilities',
    features: ['Strong reasoning', 'Code generation', 'Math and logic'],
    isActive: true
  },
  {
    id: 'perplexity',
    name: 'perplexity',
    displayName: 'Perplexity 🔍',
    endpoint: '/api/perplexity',
    models: ['llama-3.1-sonar-small-128k-online', 'llama-3.1-sonar-large-128k-online'],
    defaultModel: 'llama-3.1-sonar-small-128k-online',
    description: 'AI with real-time web search',
    features: ['Web search', 'Current information', 'Cited sources'],
    isActive: true
  }
];

export default function AIProviderSelector({
  currentProvider,
  onProviderChange,
  onModelChange,
  currentModel,
  className = ''
}: AIProviderSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredProvider, setHoveredProvider] = useState<string | null>(null);

  const currentProviderInfo = AI_PROVIDERS.find(p => p.id === currentProvider);
  const availableProviders = AI_PROVIDERS.filter(p => p.isActive);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.ai-provider-selector')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProviderSelect = (provider: AIProvider) => {
    onProviderChange(provider.id);
    onModelChange(provider.defaultModel);
    setIsOpen(false);
  };

  const handleModelSelect = (model: string) => {
    onModelChange(model);
  };

  return (
    <div className={`ai-provider-selector relative ${className}`}>
      {/* Current Provider Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/60 rounded-lg transition-all duration-200 text-sm"
        title={`Current AI: ${currentProviderInfo?.displayName} (${currentModel})`}
      >
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-gray-300 font-medium">
          {currentProviderInfo?.displayName || 'Select AI'}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* Provider Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-80 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-700">
              <h3 className="text-white font-medium text-sm">Choose AI Provider</h3>
              <p className="text-gray-400 text-xs mt-1">Each AI has different strengths</p>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {availableProviders.map((provider) => (
                <div
                  key={provider.id}
                  className={`border-b border-gray-700 last:border-b-0 ${
                    hoveredProvider === provider.id ? 'bg-gray-700/50' : ''
                  }`}
                  onMouseEnter={() => setHoveredProvider(provider.id)}
                  onMouseLeave={() => setHoveredProvider(null)}
                >
                  {/* Provider Header */}
                  <button
                    onClick={() => handleProviderSelect(provider)}
                    className={`w-full p-4 text-left hover:bg-gray-700/50 transition-colors duration-150 ${
                      currentProvider === provider.id ? 'bg-blue-600/20 border-l-2 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          currentProvider === provider.id ? 'bg-blue-500' : 'bg-gray-500'
                        }`}></div>
                        <div>
                          <div className="text-white font-medium text-sm">
                            {provider.displayName}
                            {provider.requiresApiKey && (
                              <span className="ml-2 text-xs text-amber-400">⚠️ API Key Required</span>
                            )}
                          </div>
                          <div className="text-gray-400 text-xs mt-1">
                            {provider.description}
                          </div>
                        </div>
                      </div>
                      {currentProvider === provider.id && (
                        <div className="text-blue-500 text-xs">✓ Active</div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {provider.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-700/70 text-gray-300 text-xs rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </button>

                  {/* Model Selector for Current Provider */}
                  {currentProvider === provider.id && provider.models.length > 1 && (
                    <div className="px-4 pb-3 bg-gray-900/50">
                      <div className="text-xs text-gray-400 mb-2">Model:</div>
                      <div className="flex flex-wrap gap-1">
                        {provider.models.map((model) => (
                          <button
                            key={model}
                            onClick={() => handleModelSelect(model)}
                            className={`px-2 py-1 text-xs rounded transition-colors duration-150 ${
                              currentModel === model
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700/70 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* API Key Warning for Gemini */}
            {currentProviderInfo?.requiresApiKey && (
              <div className="p-3 bg-amber-900/20 border-t border-amber-700/50">
                <div className="text-amber-400 text-xs">
                  <strong>⚠️ Setup Required:</strong> Add your Google AI API key to environment variables as GOOGLE_AI_API_KEY
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { AI_PROVIDERS };