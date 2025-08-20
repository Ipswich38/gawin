import React, { useState, useRef, useEffect } from 'react';
import { AIModel, ChatMessage } from '../lib/types';
// import { groqApi } from '../lib/services/groqApi'; // REMOVED - service no longer exists
// import { colors, typography, spacing, borderRadius } from theme - DISABLED

interface ChatScreenProps {
  selectedModel: AIModel;
  onModelSelect: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ selectedModel, onModelSelect }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // TEMPORARILY DISABLED - groqApi service removed
      const response = { content: "ChatScreen component temporarily disabled", responseTime: 1000 };
      /*
      const response = await groqApi.sendChatMessage(
        [...messages, userMessage],
        selectedModel.id
      );
      */

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content, // Using simplified response structure
        timestamp: new Date(),
        modelUsed: selectedModel.name,
        tokens: 0, // Placeholder since groqApi is disabled
        responseTime: response.responseTime,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      alert('Failed to get AI response. Please try again.');
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    
    return (
      <div
        key={message.id}
        style={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          marginBottom: spacing.md,
        }}
      >
        <div
          style={{
            maxWidth: '80%',
            padding: spacing.sm,
            borderRadius: borderRadius.md,
            backgroundColor: isUser ? colors.amber : colors.terminalGray,
            border: isUser ? 'none' : `1px solid ${colors.phosphorGreen}`,
          }}
        >
          <div
            style={{
              color: isUser ? colors.terminalBlack : colors.primaryText,
              fontSize: typography.md,
              fontFamily: typography.mono,
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
            }}
          >
            {message.content}
          </div>
          {!isUser && (
            <div
              style={{
                marginTop: spacing.xs,
                paddingTop: spacing.xs,
                borderTop: `1px solid ${colors.border}`,
                color: colors.secondaryText,
                fontSize: typography.xs,
                fontFamily: typography.mono,
              }}
            >
              {message.modelUsed} • {message.responseTime}ms
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: colors.terminalBlack,
        color: colors.primaryText,
        fontFamily: typography.mono,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: spacing.md,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <button
          onClick={onModelSelect}
          style={{
            background: 'none',
            border: 'none',
            color: colors.amber,
            fontSize: typography.lg,
            fontFamily: typography.mono,
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {selectedModel.name}
          <div
            style={{
              color: colors.phosphorGreen,
              fontSize: typography.xs,
              letterSpacing: '1px',
            }}
          >
            {selectedModel.type.toUpperCase()}
          </div>
        </button>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '4px',
              backgroundColor: colors.phosphorGreen,
              marginRight: spacing.xs,
            }}
          />
          <span
            style={{
              color: colors.phosphorGreen,
              fontSize: typography.xs,
              fontFamily: typography.mono,
              letterSpacing: '1px',
            }}
          >
            ONLINE
          </span>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: spacing.md,
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                color: colors.amber,
                fontSize: typography.xxxl,
                fontFamily: typography.mono,
                fontWeight: 'bold',
                marginBottom: spacing.sm,
                margin: 0,
              }}
            >
              KreativLoops AI
            </h1>
            <p
              style={{
                color: colors.phosphorGreen,
                fontSize: typography.md,
                fontFamily: typography.mono,
                marginBottom: spacing.lg,
                margin: spacing.sm + ' 0',
              }}
            >
              Lightning-fast AI responses with nostalgic vibes
            </p>
            <p
              style={{
                color: colors.secondaryText,
                fontSize: typography.sm,
                fontFamily: typography.mono,
                margin: 0,
              }}
            >
              Start a conversation with {selectedModel.name}
            </p>
          </div>
        )}
        {messages.map(renderMessage)}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: spacing.md }}>
            <span
              style={{
                color: colors.phosphorGreen,
                fontSize: typography.lg,
                fontFamily: typography.mono,
                letterSpacing: '2px',
              }}
            >
              ● ● ●
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          display: 'flex',
          padding: spacing.md,
          borderTop: `1px solid ${colors.border}`,
          alignItems: 'flex-end',
          gap: spacing.sm,
        }}
      >
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
          style={{
            flex: 1,
            backgroundColor: colors.terminalGray,
            border: `1px solid ${colors.border}`,
            borderRadius: borderRadius.md,
            padding: spacing.sm,
            color: colors.primaryText,
            fontSize: typography.md,
            fontFamily: typography.mono,
            resize: 'vertical',
            minHeight: '40px',
            maxHeight: '120px',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!inputText.trim() || isLoading}
          style={{
            backgroundColor: !inputText.trim() || isLoading ? colors.buttonDisabled : colors.phosphorGreen,
            color: colors.terminalBlack,
            border: 'none',
            borderRadius: borderRadius.md,
            padding: `${spacing.sm} ${spacing.md}`,
            fontSize: typography.sm,
            fontFamily: typography.mono,
            fontWeight: 'bold',
            letterSpacing: '1px',
            cursor: !inputText.trim() || isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          SEND
        </button>
      </div>
    </div>
  );
};

export default ChatScreen;