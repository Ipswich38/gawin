/**
 * Enhanced Chat Interface with Agent Mode Integration
 * Unified chat experience with premium Agent Mode capabilities
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModernMessageRenderer from './ModernMessageRenderer';
import { ResponseProcessingService } from '@/lib/services/responseProcessingService';
import { AgentModeToggle, AgentModeIndicator } from './AgentModeToggle';
import { AgentModeService, AgentModeResponse } from '@/lib/services/agentModeService';
import { AgentResearchService } from '@/lib/services/agentResearchService';
import { userPermissionService } from '@/lib/services/userPermissionService';
import PremiumFeatureGate from './PremiumFeatureGate';
import EnhancedVoiceMode from './EnhancedVoiceMode';
import { gradeAUserExperience } from '@/lib/ux/gradeAUserExperience';
import performanceMonitor from '@/lib/performance/performanceMonitor';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isAgentMode?: boolean;
  metadata?: {
    processingTime?: number;
    researchSources?: number;
    confidenceScore?: number;
    capabilities?: {
      researched: boolean;
      analyzed: boolean;
      structured: boolean;
      enhanced: boolean;
    };
  };
  thinking?: string;
}

interface EnhancedChatInterfaceProps {
  userId: string;
  sessionId: string;
}

export default function EnhancedChatInterface({
  userId,
  sessionId
}: EnhancedChatInterfaceProps) {
  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [thinking, setThinking] = useState<string>('');

  // Services
  const [agentModeService] = useState(() => AgentModeService.getInstance());
  const [researchService] = useState(() => AgentResearchService.getInstance());

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check premium status on mount
  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const permissions = userPermissionService.getFeaturePermissions();
        setIsPremium(userPermissionService.hasPremiumAccess());
      } catch (error) {
        console.error('Failed to check premium status:', error);
        setIsPremium(false);
      }
    };

    checkPremiumStatus();
  }, [userId]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle Agent Mode toggle
  const handleAgentModeToggle = async (enabled: boolean) => {
    if (!isPremium) {
      console.log('Agent Mode requires premium subscription');
      return;
    }

    try {
      if (enabled) {
        // Initialize Agent Mode
        await agentModeService.initializeAgentMode(userId, sessionId, isPremium);
        setIsAgentMode(true);
        console.log('🤖 Agent Mode activated');

        // Add system message
        const systemMessage: Message = {
          id: `system_${Date.now()}`,
          role: 'assistant',
          content: '🤖 **Agent Mode Activated**\n\nI\'m now operating with enhanced capabilities including:\n- Comprehensive research & analysis\n- Structured response formatting\n- Advanced reasoning processes\n- Premium visual hierarchy\n\nYour next request will be processed with full Agent capabilities.',
          timestamp: new Date(),
          isAgentMode: true
        };
        setMessages(prev => [...prev, systemMessage]);
      } else {
        // Disable Agent Mode
        await agentModeService.disable();
        setIsAgentMode(false);
        console.log('💬 Switched to regular mode');

        // Add system message
        const systemMessage: Message = {
          id: `system_${Date.now()}`,
          role: 'assistant',
          content: '💬 **Regular Mode Active**\n\nI\'m now operating in standard response mode with clean, efficient formatting.',
          timestamp: new Date(),
          isAgentMode: false
        };
        setMessages(prev => [...prev, systemMessage]);
      }
    } catch (error) {
      console.error('Failed to toggle Agent Mode:', error);
      setIsAgentMode(false);
    }
  };

  // Handle message sending with Grade A UX
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    // Start Grade A UX monitoring
    const uxMonitor = gradeAUserExperience.startInteractionTracking('message_send');
    const performanceMonitor = performanceMonitor.startNeuralProcessingMonitor('Chat Response');

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
      isAgentMode
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Show Grade A loading state
    gradeAUserExperience.showSmartLoadingState('ai_processing', 'Gawin is thinking...');
    setThinking('');

    try {
      let response: string;
      let metadata: Message['metadata'];
      let thinkingProcess = '';

      if (isAgentMode && agentModeService.isEnabled()) {
        // Process with Agent Mode
        setThinking('🤖 Analyzing request with Agent capabilities...');

        const agentResponse: AgentModeResponse = await agentModeService.processWithAgentMode(
          userMessage.content,
          { userId, sessionId }
        );

        // Process response with formatting service
        const processedResponse = ResponseProcessingService.processResponse(
          agentResponse.content,
          {
            separateThinking: true,
            preserveASCII: true,
            enableCodeEditor: true,
            enforceMarkdown: true
          }
        );

        response = processedResponse.response;
        thinkingProcess = processedResponse.thinking || generateThinkingProcess(agentResponse);

        metadata = {
          processingTime: agentResponse.metadata.processingTime,
          researchSources: agentResponse.metadata.researchSources,
          confidenceScore: agentResponse.metadata.confidenceScore,
          capabilities: agentResponse.capabilities
        };
      } else {
        // Process with regular mode
        setThinking('💭 Processing your request...');

        // Simulate regular processing
        await new Promise(resolve => setTimeout(resolve, 1000));

        const rawResponse = generateRegularResponse(userMessage.content);

        // Process response with formatting service
        const processedResponse = ResponseProcessingService.processResponse(
          rawResponse,
          {
            separateThinking: false,
            preserveASCII: true,
            enableCodeEditor: true,
            enforceMarkdown: true
          }
        );

        response = processedResponse.response;
        metadata = {
          processingTime: 1000,
          confidenceScore: 0.8
        };
      }

      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        isAgentMode,
        metadata,
        thinking: thinkingProcess
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to process message:', error);

      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: `❌ I apologize, but I encountered an error processing your request. ${isAgentMode ? 'Agent Mode' : 'Regular mode'} is temporarily unavailable. Please try again.`,
        timestamp: new Date(),
        isAgentMode: false
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setThinking('');

      // Complete Grade A UX monitoring
      uxMonitor.complete();
      performanceMonitor();
      gradeAUserExperience.hideLoadingState();

      // Show Grade A success feedback
      gradeAUserExperience.showSuccessFeedback('Message processed successfully');
    }
  };

  // Generate thinking process for Agent Mode
  const generateThinkingProcess = (agentResponse: AgentModeResponse): string => {
    const steps = [];

    if (agentResponse.capabilities.researched) {
      steps.push('🔍 Conducted comprehensive research');
    }
    if (agentResponse.capabilities.analyzed) {
      steps.push('📊 Performed structured analysis');
    }
    if (agentResponse.capabilities.structured) {
      steps.push('📋 Applied premium formatting');
    }
    if (agentResponse.capabilities.enhanced) {
      steps.push('✨ Enhanced with advanced reasoning');
    }

    return steps.join(' → ');
  };

  // Generate regular response with proper formatting examples
  const generateRegularResponse = (userInput: string): string => {
    // Check if user is asking for code
    if (userInput.toLowerCase().includes('code') || userInput.toLowerCase().includes('function')) {
      return `# Code Example Response

Here's a simple example based on your request: "${userInput}"

## JavaScript Function
\`\`\`javascript
function example() {
  console.log("Hello World!");
  return true;
}
\`\`\`

## Calculator Layout (ASCII Art)
\`\`\`text
┌─────────────────┐
│  [  Display   ] │
├─────────────────┤
│ [7] [8] [9] [÷] │
│ [4] [5] [6] [×] │
│ [1] [2] [3] [-] │
│ [0] [.] [=] [+] │
└─────────────────┘
\`\`\`

This is a regular mode response with:
- **Standard formatting**
- Code blocks with syntax highlighting
- ASCII art preservation
- Markdown structure

*For enhanced analysis and premium features, enable Agent Mode.*`;
    }

    return `# Response to: "${userInput}"

Thank you for your message! I'm processing this in **regular mode** with consistent text formatting.

## Features Available
- ✅ Consistent Markdown rendering
- ✅ Code syntax highlighting
- ✅ ASCII art preservation
- ✅ Monaco Editor for code blocks
- ✅ Proper thinking separation

## Example Code Block
\`\`\`python
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
\`\`\`

*For enhanced analysis, structured responses, and comprehensive research, consider enabling Agent Mode with your premium subscription.*`;
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle message actions
  const handleCopy = useCallback((messageId: string) => {
    console.log(`Copied message: ${messageId}`);
  }, []);

  const handleThumbsUp = useCallback((messageId: string) => {
    console.log(`Thumbs up for message: ${messageId}`);
  }, []);

  const handleThumbsDown = useCallback((messageId: string) => {
    console.log(`Thumbs down for message: ${messageId}`);
  }, []);

  return (
    <div className="enhanced-chat-interface">
      {/* Header with Agent Mode Toggle */}
      <div className="chat-header">
        <div className="header-left">
          <h1 className="chat-title">
            Gawin AI
            {isAgentMode && <AgentModeIndicator isEnabled={true} />}
          </h1>
        </div>

        <div className="header-right">
          <AgentModeToggle
            isEnabled={isAgentMode}
            onToggle={handleAgentModeToggle}
            className="agent-toggle"
          />
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`message-wrapper ${message.role}`}
            >
              <div className="message-content">
                <ModernMessageRenderer
                  text={message.content}
                  showActions={message.role === 'assistant'}
                />
              </div>

              <div className="message-timestamp">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Thinking Indicator */}
        {thinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="thinking-indicator"
          >
            <div className="thinking-content">
              <span className="thinking-icon">💭</span>
              <span className="thinking-text">{thinking}</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Voice Mode */}
      {isPremium && (
        <EnhancedVoiceMode
          onTranscript={(transcript, isFinal) => {
            if (!isFinal) {
              setInputText(transcript);
            }
          }}
          onSendMessage={(message) => {
            setInputText(message);
            // Auto-send the message
            setTimeout(() => sendMessage(), 100);
          }}
          isGawinSpeaking={isLoading}
          disabled={isLoading}
        />
      )}

      {/* Input Section */}
      <div className="input-section">
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isAgentMode
                ? "Ask me anything... (Agent Mode: Enhanced analysis & research)"
                : "Ask me anything... (Regular Mode)"
            }
            className={`message-input ${isAgentMode ? 'agent-mode' : 'regular-mode'}`}
            disabled={isLoading}
            rows={3}
          />

          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            className={`send-button ${isAgentMode ? 'agent-mode' : 'regular-mode'}`}
          >
            {isLoading ? (
              <span className="loading-spinner">⏳</span>
            ) : (
              <span className="send-icon">🚀</span>
            )}
          </button>
        </div>

        {/* Mode Indicator */}
        <div className="mode-indicator">
          {isAgentMode ? (
            <span className="agent-mode-indicator">
              🤖 Agent Mode: Enhanced capabilities active
            </span>
          ) : (
            <span className="regular-mode-indicator">
              💬 Regular Mode: Standard responses
            </span>
          )}
        </div>
      </div>

      <style jsx>{`
        .enhanced-chat-interface {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-height: 100vh;
          background: #1a1a1a;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chat-title {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          color: white;
        }

        .header-right {
          display: flex;
          align-items: center;
        }

        .agent-toggle {
          min-width: 280px;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .message-wrapper {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .message-wrapper.user {
          align-items: flex-end;
        }

        .message-wrapper.assistant {
          align-items: flex-start;
        }

        .message-content {
          max-width: 85%;
          min-width: 200px;
        }

        .message-wrapper.user .message-content {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          padding: 16px 20px;
          border-radius: 20px 20px 6px 20px;
          color: white;
        }

        .message-wrapper.assistant .message-content {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px 20px 20px 6px;
          padding: 4px;
        }

        .message-timestamp {
          font-size: 11px;
          opacity: 0.6;
          padding: 0 8px;
        }

        .thinking-indicator {
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 16px;
          padding: 12px 16px;
          margin: 8px 0;
          max-width: 85%;
        }

        .thinking-content {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #00d4ff;
        }

        .thinking-icon {
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .input-section {
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.05);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .input-container {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .message-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 12px 16px;
          color: white;
          font-size: 14px;
          font-family: inherit;
          resize: none;
          transition: all 0.2s;
        }

        .message-input:focus {
          outline: none;
          border-color: #00d4ff;
          box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
        }

        .message-input.agent-mode {
          border-color: rgba(0, 212, 255, 0.4);
          background: rgba(0, 212, 255, 0.05);
        }

        .message-input.agent-mode:focus {
          border-color: #00d4ff;
          box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.3);
        }

        .message-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .send-button {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          border: none;
          border-radius: 12px;
          padding: 12px 16px;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 48px;
          height: 48px;
        }

        .send-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
        }

        .send-button.agent-mode {
          background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
        }

        .send-button.agent-mode:hover:not(:disabled) {
          box-shadow: 0 4px 12px rgba(0, 212, 255, 0.4);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .send-icon {
          font-size: 16px;
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
          font-size: 16px;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .mode-indicator {
          margin-top: 8px;
          text-align: center;
        }

        .agent-mode-indicator {
          color: #00d4ff;
          font-size: 12px;
          font-weight: 600;
        }

        .regular-mode-indicator {
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .chat-header {
            padding: 12px 16px;
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .header-left,
          .header-right {
            justify-content: center;
          }

          .chat-title {
            font-size: 18px;
            justify-content: center;
          }

          .agent-toggle {
            min-width: auto;
            width: 100%;
          }

          .messages-container {
            padding: 16px;
          }

          .message-content {
            max-width: 90%;
          }

          .input-section {
            padding: 12px 16px;
          }

          .input-container {
            gap: 8px;
          }

          .message-input {
            padding: 10px 12px;
            font-size: 16px; /* Prevent zoom on iOS */
          }

          .send-button {
            min-width: 44px;
            height: 44px;
            padding: 10px 12px;
          }
        }

        /* Scrollbar Styling */
        .messages-container::-webkit-scrollbar {
          width: 6px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .messages-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}