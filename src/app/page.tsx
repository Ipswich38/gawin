'use client';

// import { Button } from "@/components/ui/Button"; // Unused import
import { useEffect, useState } from "react";

// ChatInterface Component
function ChatInterface({ user, onLogout }: { user: { full_name?: string; email: string }; onLogout: () => void }) {
  const [input, setInput] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{id: number, role: 'user' | 'assistant', content: string, timestamp: string}>>([]);
  const [chatHistory, setChatHistory] = useState<Array<{id: number, title: string, timestamp: string, preview: string}>>([]);
  const [cognitiveProcess, setCognitiveProcess] = useState<string>('');
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [showCommunity, setShowCommunity] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(12); // Mock online user count

  // Helper function to process AI response and extract cognitive indicators
  const processAIResponse = (rawResponse: string) => {
    // Look for thinking patterns and extract cognitive process hints
    const thinkingPatterns = [
      /thinking about|considering|analyzing|evaluating/gi,
      /let me think|let me consider|I need to/gi,
      /this seems like|this appears to be|this looks like/gi,
      /first|second|third|next|then|finally/gi,
      /math|calculation|compute|solve/gi,
      /code|programming|algorithm|function/gi,
      /creative|story|write|compose/gi,
      /grammar|language|translate/gi
    ];

    let cognitiveHint = '';
    
    // Extract subtle cognitive indicators
    if (thinkingPatterns[0].test(rawResponse)) cognitiveHint = 'analyzing...';
    else if (thinkingPatterns[1].test(rawResponse)) cognitiveHint = 'processing...';
    else if (thinkingPatterns[2].test(rawResponse)) cognitiveHint = 'evaluating...';
    else if (thinkingPatterns[3].test(rawResponse)) cognitiveHint = 'structuring...';
    else if (thinkingPatterns[4].test(rawResponse)) cognitiveHint = 'computing...';
    else if (thinkingPatterns[5].test(rawResponse)) cognitiveHint = 'coding...';
    else if (thinkingPatterns[6].test(rawResponse)) cognitiveHint = 'creating...';
    else if (thinkingPatterns[7].test(rawResponse)) cognitiveHint = 'understanding...';
    else cognitiveHint = 'thinking...';

    // Remove explicit thinking blocks and verbose reasoning
    let cleanResponse = rawResponse
      .replace(/<think>[\s\S]*?<\/think>/gi, '') // Remove <think> tags
      .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '') // Remove <thinking> tags
      .replace(/\*\*Thinking:\*\*[\s\S]*?(?=\n\n|$)/gi, '') // Remove **Thinking:** blocks
      .replace(/Let me think about this[\s\S]*?(?=\n\n|$)/gi, '') // Remove verbose thinking
      .replace(/I need to consider[\s\S]*?(?=\n\n|$)/gi, '') // Remove consideration blocks
      .replace(/First, let me analyze[\s\S]*?(?=\n\n|$)/gi, '') // Remove analysis blocks
      .replace(/I'm DeepSeek-R1/gi, 'I\'m Gawin AI') // Replace DeepSeek identity
      .replace(/DeepSeek-R1/gi, 'Gawin AI') // Replace any DeepSeek references
      // Clean up formatting for better readability
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold asterisks but keep content
      .replace(/\*(.*?)\*/g, '$1') // Remove italic asterisks but keep content
      .replace(/###\s*/g, '') // Remove ### markdown headers
      .replace(/##\s*/g, '') // Remove ## markdown headers
      .replace(/#\s*/g, '') // Remove # markdown headers
      .replace(/^\d+\.\s+\*\*(.*?)\*\*:/gm, '$1:') // Clean numbered bold items
      .replace(/^\s*-\s+\*\*(.*?)\*\*:/gm, '• $1:') // Clean bullet points with bold
      .replace(/^\s*-\s+/gm, '• ') // Convert - to bullets
      .replace(/^\s*\n+/gm, '') // Remove extra newlines
      .trim();

    return { cleanResponse, cognitiveHint };
  };

  const promptSuggestions = [
    "Explain quantum computing in simple terms",
    "Help me debug this Python code",
    "What's the difference between React and Vue?",
    "Solve this calculus problem step by step", 
    "Write a creative story about robots",
    "How do neural networks work?",
    "Create a study plan for machine learning",
    "Translate this text to Spanish",
    "Check my grammar and improve this essay",
    "Generate a business plan for an AI startup"
  ];

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const typePrompt = () => {
      const suggestion = promptSuggestions[Math.floor(Math.random() * promptSuggestions.length)];
      setCurrentPrompt('');
      setIsTyping(true);
      
      let charIndex = 0;
      const typeChar = () => {
        if (charIndex < suggestion.length) {
          setCurrentPrompt(suggestion.slice(0, charIndex + 1));
          charIndex++;
          timeoutId = setTimeout(typeChar, 50 + Math.random() * 30);
        } else {
          setIsTyping(false);
          timeoutId = setTimeout(() => {
            // Clear and start new suggestion after 3 seconds
            setCurrentPrompt('');
            setTimeout(typePrompt, 500);
          }, 3000);
        }
      };
      
      typeChar();
    };

    typePrompt();
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      const userMessage = {
        id: Date.now(),
        role: 'user' as const,
        content: input.trim(),
        timestamp: new Date().toLocaleTimeString()
      };
      
      // Add user message to chat
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      
      const currentInput = input.trim();
      setInput('');
      
      try {
        // Call the AI service
        const response = await fetch('/api/deepseek', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              { role: 'user', content: currentInput }
            ],
            action: 'chat',
            module: 'general'
          }),
        });

        const data = await response.json();
        
        if (data.success && data.data.response) {
          // Process the AI response to extract cognitive indicators and clean content
          const { cleanResponse, cognitiveHint } = processAIResponse(data.data.response);
          
          // Show cognitive process briefly
          setCognitiveProcess(cognitiveHint);
          
          setTimeout(() => {
            const assistantMessage = {
              id: Date.now() + 1,
              role: 'assistant' as const,
              content: cleanResponse,
              timestamp: new Date().toLocaleTimeString()
            };
            
            setMessages(prev => [...prev, assistantMessage]);
            setCognitiveProcess(''); // Clear cognitive indicator
          }, 1000); // Show cognitive process for 1 second
          
          // Add to chat history
          const newChat = {
            id: Date.now(),
            title: currentInput.length > 30 ? currentInput.substring(0, 30) + '...' : currentInput,
            timestamp: 'Just now',
            preview: currentInput
          };
          setChatHistory(prev => [newChat, ...prev]);
        } else {
          // Handle error
          const errorMessage = {
            id: Date.now() + 1,
            role: 'assistant' as const,
            content: `Sorry, I encountered an error: ${data.error || 'Unknown error'}. Please try again.`,
            timestamp: new Date().toLocaleTimeString()
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      } catch (error) {
        console.error('Chat error:', error);
        const errorMessage = {
          id: Date.now() + 1,
          role: 'assistant' as const,
          content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Copy function for AI responses
  const copyToClipboard = async (text: string, messageId: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000); // Clear after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#fffbeb' }}>
      {/* Premium Header with Glassmorphism */}
      <header className="border-b border-white/20 bg-white/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2.5 rounded-2xl hover:bg-white/40 transition-all backdrop-blur-sm shadow-lg"
                style={{ color: '#051a1c' }}
                title={showHistory ? 'Hide chat history' : 'Show chat history'}
              >
                {showHistory ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M3 12h18M3 18h18"/>
                  </svg>
                )}
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm" style={{ backgroundColor: '#051a1c' }}>
                  <span className="text-white font-semibold text-sm">G</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-medium leading-tight" style={{ color: '#051a1c' }}>Gawin</span>
                  <span className="text-xs opacity-50 leading-tight" style={{ color: '#051a1c' }}>Community Learning</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCommunity(!showCommunity)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/30 backdrop-blur-sm rounded-2xl hover:bg-white/40 transition-all shadow-lg"
                style={{ color: '#051a1c' }}
                title="Join Community Chat"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Community</span>
                  <span className="text-xs opacity-60">{onlineUsers} learners online</span>
                </div>
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm opacity-60 px-3 py-1.5 bg-white/30 backdrop-blur-sm rounded-xl" style={{ color: '#051a1c' }}>
                  {user.full_name || user.email}
                </span>
                <button 
                  onClick={onLogout}
                  className="text-sm opacity-60 hover:opacity-80 transition-all px-3 py-1.5 rounded-xl hover:bg-white/30"
                  style={{ color: '#051a1c' }}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Floating History Panel Overlay */}
      {showHistory && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setShowHistory(false)}
          />
          
          {/* Floating History Panel */}
          <aside className="fixed top-0 left-0 h-full w-80 bg-white/30 backdrop-blur-xl border-r border-white/20 z-50 px-4 py-4 shadow-2xl">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium opacity-70" style={{ color: '#051a1c' }}>Chat History</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1.5 rounded-lg hover:bg-white/40 transition-all"
                  style={{ color: '#051a1c' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <button
                className="w-full px-3 py-2.5 rounded-2xl hover:opacity-90 transition-all text-xs font-medium shadow-md backdrop-blur-sm hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#051a1c', color: 'white' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#00FFEF';
                  e.currentTarget.style.color = 'black';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#051a1c';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.backgroundColor = '#00FFEF';
                  e.currentTarget.style.color = 'black';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.backgroundColor = '#00FFEF';
                  e.currentTarget.style.color = 'black';
                }}
              >
                + New Chat
              </button>
            </div>
            
            <div className="space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className="group p-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/60 transition-all cursor-pointer shadow-sm relative"
                >
                  <div className="font-medium text-xs mb-1" style={{ color: '#051a1c' }}>
                    {chat.title}
                  </div>
                  <div className="text-xs opacity-50 mb-1" style={{ color: '#051a1c' }}>
                    {chat.timestamp}
                  </div>
                  <div className="text-xs opacity-40 truncate pr-6" style={{ color: '#051a1c' }}>
                    {chat.preview}
                  </div>
                  
                  {/* Delete button - shows on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatHistory(prev => prev.filter(c => c.id !== chat.id));
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-50 hover:opacity-80 transition-opacity p-1 rounded-md hover:bg-white/40"
                    style={{ color: '#051a1c' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              ))}
              
              {chatHistory.length === 0 && (
                <div className="text-center py-6">
                  <div className="text-2xl mb-2 opacity-50">💬</div>
                  <div className="text-xs opacity-50" style={{ color: '#051a1c' }}>
                    No chat history yet
                  </div>
                  <div className="text-xs opacity-30 mt-1" style={{ color: '#051a1c' }}>
                    Start a conversation to see it here
                  </div>
                </div>
              )}
            </div>
          </aside>
        </>
      )}

      {/* Community Panel */}
      {showCommunity && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setShowCommunity(false)}
          />
          
          {/* Floating Community Panel */}
          <aside className="fixed top-0 right-0 h-full w-96 bg-white/30 backdrop-blur-xl border-l border-white/20 z-50 px-4 py-4 shadow-2xl flex flex-col">
            <div className="mb-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-medium opacity-70" style={{ color: '#051a1c' }}>Gawin Community</h2>
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-100/80 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-700">{onlineUsers} online</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowCommunity(false)}
                  className="p-1.5 rounded-lg hover:bg-white/40 transition-all"
                  style={{ color: '#051a1c' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div className="text-xs opacity-60 mb-4 px-3 py-2 bg-blue-50/80 rounded-xl" style={{ color: '#051a1c' }}>
                🌟 Welcome to the learning community! Ask questions, share knowledge, and learn together with AI assistance.
              </div>
            </div>
            
            {/* Community Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {/* Sample Community Messages */}
              <div className="p-3 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
                  <span className="text-xs font-medium" style={{ color: '#051a1c' }}>Alex_92</span>
                  <span className="text-xs opacity-40" style={{ color: '#051a1c' }}>2 min ago</span>
                </div>
                <p className="text-sm mb-2" style={{ color: '#051a1c' }}>Can someone explain how neural networks actually learn?</p>
                <div className="text-xs opacity-60 italic border-l-2 border-emerald-300 pl-2 bg-emerald-50/50 py-1">
                  Gawin AI: Neural networks learn through backpropagation...
                </div>
              </div>

              <div className="p-3 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">S</div>
                  <span className="text-xs font-medium" style={{ color: '#051a1c' }}>Sarah_learns</span>
                  <span className="text-xs opacity-40" style={{ color: '#051a1c' }}>5 min ago</span>
                </div>
                <p className="text-sm mb-2" style={{ color: '#051a1c' }}>Just solved my first calculus problem! 🎉</p>
                <div className="text-xs opacity-60 italic border-l-2 border-emerald-300 pl-2 bg-emerald-50/50 py-1">
                  Gawin AI: Congratulations! Would you like to try a more challenging derivative problem?
                </div>
              </div>

              <div className="p-3 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">M</div>
                  <span className="text-xs font-medium" style={{ color: '#051a1c' }}>MikeCodes</span>
                  <span className="text-xs opacity-40" style={{ color: '#051a1c' }}>8 min ago</span>
                </div>
                <p className="text-sm mb-2" style={{ color: '#051a1c' }}>Anyone working on React hooks? I'm struggling with useEffect dependencies</p>
                <div className="text-xs opacity-60 italic border-l-2 border-emerald-300 pl-2 bg-emerald-50/50 py-1">
                  Gawin AI: The key is understanding when effects should re-run. Let me explain the dependency array...
                </div>
              </div>
            </div>

            {/* Community Input */}
            <div className="flex-shrink-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask the community..."
                  className="w-full px-4 py-3 pr-12 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 backdrop-blur-md border border-white/30"
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    color: '#051a1c'
                  }}
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m22 2-7 20-4-9-9-4Z"/>
                  </svg>
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6">
        {messages.length === 0 ? (
          /* Welcome Section */
          <div className="flex-1 flex flex-col justify-center py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-normal mb-3" style={{ color: '#051a1c' }}>
              Hello! I'm <span className="font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Gawin AI</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Your intelligent AI companion for learning. Ask me anything, or join our community to learn with fellow students!
            </p>
          </div>

          {/* Tool Chips - Smaller Premium Glassmorphism */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <span className="inline-flex items-center px-3 py-2 text-xs bg-white/50 backdrop-blur-md rounded-2xl hover:bg-white/70 hover:scale-105 transition-all cursor-pointer shadow-md border border-white/40 hover:shadow-lg" style={{ color: '#051a1c' }} onClick={() => setInput("Explain artificial intelligence concepts")}>
              🤖 AI Concepts
            </span>
            <span className="inline-flex items-center px-3 py-2 text-xs bg-white/50 backdrop-blur-md rounded-2xl hover:bg-white/70 hover:scale-105 transition-all cursor-pointer shadow-md border border-white/40 hover:shadow-lg" style={{ color: '#051a1c' }} onClick={() => setInput("Help me with coding problems")}>
              💻 Coding Help
            </span>
            <span className="inline-flex items-center px-3 py-2 text-xs bg-white/50 backdrop-blur-md rounded-2xl hover:bg-white/70 hover:scale-105 transition-all cursor-pointer shadow-md border border-white/40 hover:shadow-lg" style={{ color: '#051a1c' }} onClick={() => setInput("Solve this math problem")}>
              🔢 Math Problems
            </span>
            <span className="inline-flex items-center px-3 py-2 text-xs bg-white/50 backdrop-blur-md rounded-2xl hover:bg-white/70 hover:scale-105 transition-all cursor-pointer shadow-md border border-white/40 hover:shadow-lg" style={{ color: '#051a1c' }} onClick={() => setInput("Help me write creative content")}>
              🎨 Creative Writing
            </span>
            <span className="inline-flex items-center px-3 py-2 text-xs bg-white/50 backdrop-blur-md rounded-2xl hover:bg-white/70 hover:scale-105 transition-all cursor-pointer shadow-md border border-white/40 hover:shadow-lg" style={{ color: '#051a1c' }} onClick={() => setInput("Check my grammar and writing")}>
              📝 Grammar & Writing
            </span>
            <span className="inline-flex items-center px-3 py-2 text-xs bg-white/50 backdrop-blur-md rounded-2xl hover:bg-white/70 hover:scale-105 transition-all cursor-pointer shadow-md border border-white/40 hover:shadow-lg" style={{ color: '#051a1c' }} onClick={() => setInput("Translate text to another language")}>
              🌍 Translation
            </span>
            <span className="inline-flex items-center px-3 py-2 text-xs bg-white/50 backdrop-blur-md rounded-2xl hover:bg-white/70 hover:scale-105 transition-all cursor-pointer shadow-md border border-white/40 hover:shadow-lg" style={{ color: '#051a1c' }} onClick={() => setInput("Explain scientific concepts")}>
              🔬 Science
            </span>
            <span className="inline-flex items-center px-3 py-2 text-xs bg-white/50 backdrop-blur-md rounded-2xl hover:bg-white/70 hover:scale-105 transition-all cursor-pointer shadow-md border border-white/40 hover:shadow-lg" style={{ color: '#051a1c' }} onClick={() => setInput("Help me learn a new topic")}>
              📚 Learning
            </span>
          </div>

          {/* Typing Prompt Display */}
          <div className="text-center mb-8 h-8">
            <p className="text-base opacity-50 italic" style={{ color: '#051a1c' }}>
              {currentPrompt && (
                <>
                  "{currentPrompt}"
                  {isTyping && <span className="animate-pulse">|</span>}
                </>
              )}
            </p>
          </div>
        </div>
        ) : (
          /* Chat Messages */
          <div className="flex-1 flex flex-col py-8">
            <div className="flex-1 overflow-y-auto space-y-4 mb-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl px-6 py-4 rounded-3xl relative ${
                      message.role === 'user'
                        ? 'bg-[#051a1c] text-white shadow-xl'
                        : 'bg-white/60 backdrop-blur-md text-[#051a1c] border border-white/40 shadow-lg'
                    }`}
                  >
                    <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className={`text-xs opacity-60 ${
                        message.role === 'user' ? 'text-white/70' : 'text-[#051a1c]/70'
                      }`}>
                        {message.timestamp}
                      </p>
                      {message.role === 'assistant' && (
                        <button
                          onClick={() => copyToClipboard(message.content, message.id)}
                          className="p-1.5 rounded-lg hover:bg-black/10 transition-colors opacity-60 hover:opacity-100"
                          title="Copy response"
                        >
                          {copiedMessageId === message.id ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 6L9 17l-5-5"/>
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(isLoading || cognitiveProcess) && (
                <div className="flex justify-start">
                  <div className="bg-white/60 backdrop-blur-md text-[#051a1c] border border-white/40 shadow-lg px-6 py-4 rounded-3xl">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-[#051a1c] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-[#051a1c] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-[#051a1c] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm opacity-60 italic">
                        {cognitiveProcess || 'Gawin is thinking...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input Area - Premium Glassmorphism */}
        <div className="pb-8">
          <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message Gawin..."
                className="w-full px-6 py-5 pr-16 text-white placeholder-white/70 transition-all resize-none text-lg focus:outline-none focus:ring-2 focus:ring-white/40 shadow-2xl backdrop-blur-md hover:shadow-3xl"
                style={{ 
                  backgroundColor: '#051a1c',
                  borderRadius: '32px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 backdrop-blur-sm text-black rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition-all shadow-lg"
                style={{
                  backgroundColor: (input.trim() && !isLoading) ? '#00FFEF' : 'rgba(255,255,255,0.9)'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m22 2-7 20-4-9-9-4Z"/>
                  <path d="M22 2 11 13"/>
                </svg>
              </button>
            </div>
          </form>
          </div>
        </main>
    </div>
  );
}


// AccessCodeModal Component
function AccessCodeModal({ onClose }: { onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [accessCode, setAccessCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Check access code
    if (accessCode.trim().toLowerCase() === 'gawinapp2025') {
      setSuccess('Access granted! Welcome to Gawin AI.');
      
      // Create a guest session
      const guestUser = {
        id: 'guest_' + Date.now(),
        email: 'guest@gawin.ai',
        full_name: 'Gawin User',
        subscription_tier: 'free',
        credits_remaining: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_verified: true,
        preferences: {
          theme: 'auto',
          language: 'en',
          notifications_enabled: true,
          ai_model_preference: 'deepseek-r1',
          tutor_mode_default: false
        }
      };

      const guestSession = {
        access_token: 'guest_access_' + Date.now(),
        refresh_token: 'guest_refresh_' + Date.now(),
        expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        user: guestUser
      };

      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(guestUser));
      localStorage.setItem('session', JSON.stringify(guestSession));

      // Close modal and refresh to show authenticated state
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1000);
    } else {
      setError('Invalid access code. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-6">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/40">
          <div className="text-center mb-6">
            <div className="text-3xl mb-4">🔐</div>
            <h3 className="text-xl font-medium mb-2" style={{ color: '#051a1c' }}>
              Access Gawin AI
            </h3>
            <p className="text-sm opacity-70" style={{ color: '#051a1c' }}>
              Enter your access code to continue
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                name="accessCode"
                placeholder="Enter Access Code"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value);
                  setError('');
                }}
                required
                className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#00A3A3] focus:outline-none transition-colors text-center font-mono tracking-wider"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white py-3 rounded-xl transition-all font-medium shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: isLoading ? '#666' : '#00A3A3' }}
              onMouseEnter={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = '#051a1c';
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = '#00A3A3';
              }}
            >
              {isLoading ? 'Verifying...' : 'Access App'}
            </button>
          </form>

          <div className="text-center mt-6">
            <div className="text-xs opacity-50" style={{ color: '#051a1c' }}>
              Need an access code? Contact support
            </div>
          </div>

          <button 
            onClick={onClose}
            className="mt-4 w-full text-xs opacity-50 hover:opacity-70 transition-opacity"
            style={{ color: '#051a1c' }}
          >
            Continue browsing
          </button>
        </div>
      </div>
    </>
  );
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [heroText, setHeroText] = useState('');
  const [isHeroTyping, setIsHeroTyping] = useState(true);

  const fullHeroText = "Your pocket AI companion, tutor and chat buddy... built for learners and dreamers";

  useEffect(() => {
    // Check for authenticated user in localStorage
    const storedUser = localStorage.getItem('user');
    const storedSession = localStorage.getItem('session');
    
    if (storedUser && storedSession) {
      try {
        const userData = JSON.parse(storedUser);
        const sessionData = JSON.parse(storedSession);
        
        // Check if session is still valid
        if (sessionData.expires_at > Date.now()) {
          setUser(userData);
        } else {
          // Session expired, clear localStorage
          localStorage.removeItem('user');
          localStorage.removeItem('session');
        }
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('session');
      }
    }
    
    setLoading(false);
  }, []);

  // Hero text typing effect
  useEffect(() => {
    if (!user) { // Only run for non-authenticated users (landing page)
      let charIndex = 0;
      setHeroText('');
      setIsHeroTyping(true);
      
      const typeChar = () => {
        if (charIndex < fullHeroText.length) {
          setHeroText(fullHeroText.slice(0, charIndex + 1));
          charIndex++;
          setTimeout(typeChar, 40 + Math.random() * 20); // Vary speed slightly
        } else {
          setIsHeroTyping(false);
        }
      };
      
      // Start typing after a short delay
      const startTimeout = setTimeout(typeChar, 800);
      
      return () => {
        clearTimeout(startTimeout);
      };
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('session');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Show dashboard for authenticated users
  if (user) {
    return (
      <ChatInterface user={user} onLogout={handleLogout} />
    );
  }

  // Show landing page for non-authenticated users
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffbeb' }}>
      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          10%, 30% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          40%, 60% { transform: rotate(14deg); }
          50% { transform: rotate(-8deg); }
          70%, 90% { transform: rotate(0deg); }
        }
      `}</style>
      {/* Clean Navigation Header */}
      <header className="border-b border-gray-200/30">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#051a1c' }}>
                <span className="text-white font-semibold text-sm">G</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-base font-medium leading-tight" style={{ color: '#051a1c' }}>
                  Gawin
                </h1>
                <span className="text-xs opacity-50 leading-tight" style={{ color: '#051a1c' }}>by kreativloops AI</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowAuthModal(true)}
                className="text-white text-sm px-5 py-2.5 rounded-2xl hover:opacity-90 transition-all shadow-sm" 
                style={{ backgroundColor: '#00A3A3' }}
              >
                Enter Access Code
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Dynamic Bento Box */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-normal mb-4 tracking-tight" style={{ color: '#051a1c' }}>
            <span 
              className="inline-block" 
              style={{ 
                animation: 'wave 1.5s ease-in-out infinite',
                transformOrigin: '70% 70%'
              }}
            >👋</span> <span className="text-3xl md:text-4xl">I'm</span> <span style={{ color: '#00A3A3' }}>Gawin</span>
          </h1>
          <p className="text-lg opacity-60 max-w-2xl mx-auto leading-relaxed italic" style={{ color: '#051a1c' }}>
            {heroText}
            {isHeroTyping && <span className="animate-pulse">|</span>}
          </p>
        </div>


        {/* Get Started CTA */}
        <div className="text-center mt-12">
          <button 
            onClick={() => setShowAuthModal(true)}
            className="text-white text-lg px-8 py-4 rounded-2xl hover:scale-105 transition-all font-medium shadow-lg mb-6"
            style={{ backgroundColor: '#00A3A3' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#051a1c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#00A3A3';
            }}
          >
            Enter Access Code
          </button>
          
          
          <div className="text-center">
            <div className="text-sm opacity-60" style={{ color: '#051a1c' }}>
              Your AI-powered study companion for learning and creativity
            </div>
          </div>
        </div>
      </main>

      {/* Access Code Modal */}
      {showAuthModal && <AccessCodeModal onClose={() => setShowAuthModal(false)} />}

      {/* Minimal Footer */}
      <footer className="mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-xs opacity-40" style={{ color: '#051a1c' }}>
            © 2024 Gawin by KreativLoops AI
          </p>
        </div>
      </footer>
    </div>
  );
}
