'use client';

import React, { useState } from 'react';
import { X, ExternalLink, CreditCard, Zap, AlertCircle } from 'lucide-react';

interface CreditsGuideProps {
  onClose: () => void;
}

export function CreditsGuide({ onClose }: CreditsGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "🎯 Why Add Credits?",
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Unlock Full AI Power</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Access 100+ AI models including GPT-4, Claude, Gemini</li>
              <li>• 96% cost savings vs direct API access</li>
              <li>• Pay only for what you use</li>
              <li>• No monthly subscriptions</li>
            </ul>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Current Status: Free tier expired</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "💳 How to Add Credits",
      content: (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Step-by-Step Guide</h3>
              <CreditCard className="w-5 h-5 text-blue-500" />
            </div>
            <ol className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
                <span>Visit <strong>openrouter.ai/settings/credits</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
                <span>Sign in with your OpenRouter account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
                <span>Click "Add Credits" button</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">4</span>
                <span>Choose amount and payment method</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</span>
                <span>Credits will be available immediately</span>
              </li>
            </ol>
          </div>
        </div>
      )
    },
    {
      title: "💰 Pricing & Recommendations",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-gray-700">$5</div>
              <div className="text-sm text-gray-600">Starter</div>
              <div className="text-xs text-gray-500 mt-1">~2,500 requests</div>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-blue-700">$20</div>
              <div className="text-sm text-blue-600">Recommended</div>
              <div className="text-xs text-blue-500 mt-1">~10,000 requests</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-purple-700">$50+</div>
              <div className="text-sm text-purple-600">Power User</div>
              <div className="text-xs text-purple-500 mt-1">25,000+ requests</div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <Zap className="w-4 h-4" />
              <span className="font-medium">Pro Tip</span>
            </div>
            <p className="text-sm text-green-600">
              Start with $20 for extensive testing. Gawin's smart model selection 
              automatically chooses the most cost-effective model for each task.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              OpenRouter Credits Guide
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {steps[currentStep].title}
          </h3>
          {steps[currentStep].content}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            {currentStep === 1 && (
              <a
                href="https://openrouter.ai/settings/credits"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Open Credits Page
              </a>
            )}
          </div>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Got it!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}