'use client';

import { useRouter } from 'next/navigation';
import TutorScientificCalculator from '@/components/TutorScientificCalculator';

// Force dynamic rendering to avoid SSR issues with DOMPurify
export const dynamic = 'force-dynamic';

export default function CalculatorPage() {
  const router = useRouter();

  // AI service for the calculator
  const aiService = async (messages: any[], model?: string) => {
    try {
      const startTime = Date.now();
      
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          model: model || 'llama-3.3-70b-versatile',
          temperature: 0.1,
          max_tokens: 2000
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const endTime = Date.now();

      return {
        content: data.choices?.[0]?.message?.content || 'Unable to generate explanation.',
        reasoning: '',
        responseTime: endTime - startTime
      };
    } catch (error) {
      console.error('AI service error:', error);
      return {
        content: 'I apologize, but I\'m having trouble processing your calculation explanation right now. The mathematical result should still be accurate.',
        reasoning: '',
        responseTime: 0
      };
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  return <TutorScientificCalculator onBack={handleBack} aiService={aiService} />;
}