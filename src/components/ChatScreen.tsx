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
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            maxWidth: '80%',
            padding: "8px",
            borderRadius: "8px",
            backgroundColor: isUser ? "#F59E0B" : "#1f2937",
            border: isUser ? 'none' : "1px solid #00ff00",
          }}
        >
          <div
            style={{
              color: isUser ? "#1a1a1a" : "#ffffff",
              fontSize: "16px",
              fontFamily: "monospace",
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
            }}
          >
            {message.content}
          </div>
          {!isUser && (
            <div
              style={{
                marginTop: "4px",
                paddingTop: "4px",
                borderTop: "1px solid #374151",
                color: "#9ca3af",
                fontSize: "12px",
                fontFamily: "monospace",
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
        backgroundColor: "#1a1a1a",
        color: "#ffffff",
        fontFamily: "monospace",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: "16px",
          borderBottom: "1px solid #374151",
        }}
      >
        <button
          onClick={onModelSelect}
          style={{
            background: 'none',
            border: 'none',
            color: "#F59E0B",
            fontSize: "18px",
            fontFamily: "monospace",
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {selectedModel.name}
          <div
            style={{
              color: "#00ff00",
              fontSize: "12px",
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
              backgroundColor: "#00ff00",
              marginRight: "4px",
            }}
          />
          <span
            style={{
              color: "#00ff00",
              fontSize: "12px",
              fontFamily: "monospace",
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
          padding: "16px",
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
                color: "#F59E0B",
                fontSize: "48px",
                fontFamily: "monospace",
                fontWeight: 'bold',
                marginBottom: "8px",
                margin: 0,
              }}
            >
              KreativLoops AI
            </h1>
            <p
              style={{
                color: "#00ff00",
                fontSize: "16px",
                fontFamily: "monospace",
                marginBottom: "24px",
                margin: "8px" + ' 0',
              }}
            >
              Lightning-fast AI responses with nostalgic vibes
            </p>
            <p
              style={{
                color: "#9ca3af",
                fontSize: "14px",
                fontFamily: "monospace",
                margin: 0,
              }}
            >
              Start a conversation with {selectedModel.name}
            </p>
          </div>
        )}
        {messages.map(renderMessage)}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: "16px" }}>
            <span
              style={{
                color: "#00ff00",
                fontSize: "18px",
                fontFamily: "monospace",
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
          padding: "16px",
          borderTop: `1px solid ${"#374151"}`,
          alignItems: 'flex-end',
          gap: "8px",
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
            backgroundColor: "#1f2937",
            border: `1px solid ${"#374151"}`,
            borderRadius: "8px",
            padding: "8px",
            color: "#ffffff",
            fontSize: "16px",
            fontFamily: "monospace",
            resize: 'vertical',
            minHeight: '40px',
            maxHeight: '120px',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!inputText.trim() || isLoading}
          style={{
            backgroundColor: !inputText.trim() || isLoading ? "#6B7280" : "#00ff00",
            color: "#1a1a1a",
            border: 'none',
            borderRadius: "8px",
            padding: `${"8px"} ${"16px"}`,
            fontSize: "14px",
            fontFamily: "monospace",
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