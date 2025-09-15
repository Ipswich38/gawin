/**
 * Hugging Face Test Component
 * Quick test of Pro capabilities
 */

'use client';

import React, { useState } from 'react';
import { huggingFaceService } from '@/lib/services/huggingFaceService';

const HuggingFaceTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const results: any[] = [];

    try {
      // Test 1: Health Check
      results.push({ test: 'Health Check', status: 'running' });
      setTestResults([...results]);
      
      const healthCheck = await huggingFaceService.healthCheck();
      results[results.length - 1] = { 
        test: 'Health Check', 
        status: healthCheck.status === 'healthy' ? 'passed' : 'failed',
        data: healthCheck
      };
      setTestResults([...results]);

      // Test 2: Text Analysis
      results.push({ test: 'Text Analysis', status: 'running' });
      setTestResults([...results]);
      
      const textAnalysis = await huggingFaceService.analyzeText('I am very happy today!', 'sentiment');
      results[results.length - 1] = { 
        test: 'Text Analysis', 
        status: textAnalysis.confidence > 0 ? 'passed' : 'failed',
        data: textAnalysis
      };
      setTestResults([...results]);

      // Test 3: Pro Access Check
      results.push({ test: 'Pro Access', status: 'running' });
      setTestResults([...results]);
      
      const hasProAccess = huggingFaceService.hasProAccess();
      results[results.length - 1] = { 
        test: 'Pro Access', 
        status: hasProAccess ? 'passed' : 'failed',
        data: { hasProAccess }
      };
      setTestResults([...results]);

    } catch (error) {
      results.push({ 
        test: 'Error', 
        status: 'failed',
        data: { error: error.message }
      });
      setTestResults([...results]);
    }

    setIsRunning(false);
  };

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg">
      <h3 className="text-lg font-semibold mb-4">🤖 Hugging Face Pro Test</h3>
      
      <button
        onClick={runTests}
        disabled={isRunning}
        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-50 mb-4"
      >
        {isRunning ? 'Running Tests...' : 'Run Tests'}
      </button>

      <div className="space-y-2">
        {testResults.map((result, index) => (
          <div key={index} className="p-2 bg-gray-800 rounded text-sm">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium">{result.test}:</span>
              <span className={`text-xs px-2 py-1 rounded ${
                result.status === 'passed' ? 'bg-green-600' :
                result.status === 'failed' ? 'bg-red-600' :
                'bg-yellow-600'
              }`}>
                {result.status}
              </span>
            </div>
            <pre className="text-xs text-gray-400 overflow-x-auto">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HuggingFaceTest;