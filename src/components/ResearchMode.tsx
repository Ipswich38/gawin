'use client';

import React, { useState } from 'react';
import IntelligentResearchInterface from './IntelligentResearchInterface';
import AnswerThisStyleResearch from './AnswerThisStyleResearch';
import { motion } from 'framer-motion';
import { Brain, Zap, BookOpen, BarChart3 } from 'lucide-react';

interface ResearchModeProps {
  onResearchComplete?: (result: any) => void;
}

const ResearchMode: React.FC<ResearchModeProps> = ({ onResearchComplete }) => {
  const [researchStyle, setResearchStyle] = useState<'classic' | 'academic'>('classic');

  if (researchStyle === 'academic') {
    return <AnswerThisStyleResearch onResearchComplete={onResearchComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Research Style Selector */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Brain className="mr-3 text-blue-600" size={28} />
              Gawin Research
            </h1>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 mr-3">Research Mode:</span>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setResearchStyle('classic')}
                className={`px-4 py-2 rounded-lg flex items-center font-medium transition-colors ${
                  researchStyle === 'classic'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Zap size={16} className="mr-2" />
                Classic Research
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setResearchStyle('academic')}
                className={`px-4 py-2 rounded-lg flex items-center font-medium transition-colors ${
                  researchStyle === 'academic'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <BookOpen size={16} className="mr-2" />
                Academic Research
              </motion.button>
            </div>
          </div>

          <div className="mt-2">
            <p className="text-sm text-gray-600">
              {researchStyle === 'classic'
                ? 'Quick web research with GPT Researcher integration'
                : 'Comprehensive academic literature review with citation management'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Classic Research Interface */}
      <IntelligentResearchInterface onResearchComplete={onResearchComplete} />
    </div>
  );
};

export default ResearchMode;