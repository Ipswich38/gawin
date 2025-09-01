'use client';

import Link from "next/link";
// import { Button } from "@/components/ui/Button"; // Unused import
import { useEffect, useState } from "react";
import { databaseService } from '@/lib/services/databaseService';

// ChatInterface Component
function ChatInterface({ user, onLogout }: { user: { full_name?: string; email: string }; onLogout: () => void }) {
  const [input, setInput] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: 'Help with React components', timestamp: '2 hours ago', preview: 'Can you help me understand React hooks...' },
    { id: 2, title: 'Python data analysis', timestamp: 'Yesterday', preview: 'I need help with pandas and matplotlib...' },
    { id: 3, title: 'Math problem solving', timestamp: '2 days ago', preview: 'Solve this calculus problem step by step...' },
    { id: 4, title: 'Creative writing project', timestamp: '3 days ago', preview: 'Help me write a short story about AI...' },
  ]);

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
    let currentIndex = 0;
    
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // Handle the prompt submission here
      console.log('User prompt:', input);
      
      // Add to chat history
      const newChat = {
        id: Date.now(),
        title: input.length > 30 ? input.substring(0, 30) + '...' : input,
        timestamp: 'Just now',
        preview: input
      };
      setChatHistory(prev => [newChat, ...prev]);
      
      setInput('');
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
                  <span className="text-xs opacity-50 leading-tight" style={{ color: '#051a1c' }}>by kreativloops AI</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6">
          {/* Welcome Section */}
          <div className="flex-1 flex flex-col justify-center py-16">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-normal mb-3" style={{ color: '#051a1c' }}>
              Hello, {user.full_name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-lg opacity-60" style={{ color: '#051a1c' }}>
              How can I help you learn today?
            </p>
          </div>

          {/* Tool Chips - Smaller Premium Glassmorphism */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <Link href="/academy">
              <span className="inline-flex items-center px-3 py-2 text-xs bg-white/50 backdrop-blur-md rounded-2xl hover:bg-white/70 hover:scale-105 transition-all cursor-pointer shadow-md border border-white/40 hover:shadow-lg" style={{ color: '#051a1c' }}>
                🎓 AI Academy
              </span>
            </Link>
            <Link href="/bootcamp">
              <span className="inline-flex items-center px-3 py-2 text-xs bg-white/50 backdrop-blur-md rounded-2xl hover:bg-white/70 hover:scale-105 transition-all cursor-pointer shadow-md border border-white/40 hover:shadow-lg" style={{ color: '#051a1c' }}>
                💻 Coding Bootcamp
              </span>
            </Link>
            <Link href="/robotics">
              <span className="inline-flex items-center px-3 py-2 text-xs bg-white/50 backdrop-blur-md rounded-2xl hover:bg-white/70 hover:scale-105 transition-all cursor-pointer shadow-md border border-white/40 hover:shadow-lg" style={{ color: '#051a1c' }}>
                🤖 Robotics Lab
              </span>
            </Link>
            <Link href="/studio">
              <span className="inline-flex items-center px-3 py-2 text-xs bg-white/50 backdrop-blur-md rounded-2xl hover:bg-white/70 hover:scale-105 transition-all cursor-pointer shadow-md border border-white/40 hover:shadow-lg" style={{ color: '#051a1c' }}>
                🎨 Creative Studio
              </span>
            </Link>
            <Link href="/tutor/calculator">
              <span className="inline-flex items-center px-3 py-2 text-xs bg-white/50 backdrop-blur-md rounded-2xl hover:bg-white/70 hover:scale-105 transition-all cursor-pointer shadow-md border border-white/40 hover:shadow-lg" style={{ color: '#051a1c' }}>
                🧮 Calculator
              </span>
            </Link>
            <Link href="/tutor/grammar">
              <span className="inline-flex items-center px-3 py-2 text-xs bg-white/50 backdrop-blur-md rounded-2xl hover:bg-white/70 hover:scale-105 transition-all cursor-pointer shadow-md border border-white/40 hover:shadow-lg" style={{ color: '#051a1c' }}>
                📝 Grammar
              </span>
            </Link>
            <Link href="/tutor/math">
              <span className="inline-flex items-center px-3 py-2 text-xs bg-white/50 backdrop-blur-md rounded-2xl hover:bg-white/70 hover:scale-105 transition-all cursor-pointer shadow-md border border-white/40 hover:shadow-lg" style={{ color: '#051a1c' }}>
                🔢 Math Solver
              </span>
            </Link>
            <Link href="/tutor/translator">
              <span className="inline-flex items-center px-3 py-2 text-xs bg-white/50 backdrop-blur-md rounded-2xl hover:bg-white/70 hover:scale-105 transition-all cursor-pointer shadow-md border border-white/40 hover:shadow-lg" style={{ color: '#051a1c' }}>
                🌍 Translator
              </span>
            </Link>
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
                disabled={!input.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 backdrop-blur-sm text-black rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition-all shadow-lg"
                style={{
                  backgroundColor: input.trim() ? '#00FFEF' : 'rgba(255,255,255,0.9)'
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

// Big 3x3 Tic-Tac-Toe Grid Component with Dynamic Content
function TicTacToeGrid({ onFeatureClick }: { onFeatureClick: () => void }) {
  const [currentSet, setCurrentSet] = useState(0);
  
  const featureSets = [
    [
      { emoji: '🎓', title: 'AI Academy' },
      { emoji: '💻', title: 'Coding' },
      { emoji: '🤖', title: 'Robotics' },
      { emoji: '🎨', title: 'Creative' },
      { emoji: '🧮', title: 'Calculator' },
      { emoji: '📝', title: 'Grammar' },
      { emoji: '🌍', title: 'Translator' },
      { emoji: '🛠️', title: 'AI Tools' },
      { emoji: '⭐', title: 'Premium' },
    ],
    [
      { emoji: '🚀', title: 'Projects' },
      { emoji: '📊', title: 'Analytics' },
      { emoji: '🔬', title: 'Research' },
      { emoji: '💡', title: 'Ideas' },
      { emoji: '🎯', title: 'Goals' },
      { emoji: '📚', title: 'Library' },
      { emoji: '🌟', title: 'Featured' },
      { emoji: '🔮', title: 'Future' },
      { emoji: '💎', title: 'Elite' },
    ],
    [
      { emoji: '🎵', title: 'Audio' },
      { emoji: '🎬', title: 'Video' },
      { emoji: '📸', title: 'Images' },
      { emoji: '✍️', title: 'Writing' },
      { emoji: '🗣️', title: 'Speech' },
      { emoji: '👁️', title: 'Vision' },
      { emoji: '🧠', title: 'Neural' },
      { emoji: '⚡', title: 'Fast' },
      { emoji: '🔒', title: 'Secure' },
    ]
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSet((prev) => (prev + 1) % featureSets.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const features = featureSets[currentSet];

  return (
    <div className="mb-16">
      {/* 3x3 Grid - Manual Layout with Dynamic Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', maxWidth: '360px', margin: '0 auto' }}>
        {features.map((feature, index) => (
          <div
            key={`${currentSet}-${index}`}
            className="bg-white/50 backdrop-blur-md border-2 border-white/40 rounded-2xl p-4 shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center group"
            style={{ 
              width: '100px', 
              height: '100px',
              minWidth: '100px',
              minHeight: '100px',
              animation: 'fadeIn 0.5s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#00FFEF';
              e.currentTarget.style.borderColor = '#00FFEF';
              e.currentTarget.style.transform = 'scale(1.05)';
              const titleElement = e.currentTarget.querySelector('.tile-title') as HTMLElement;
              if (titleElement) {
                titleElement.style.color = 'black';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.5)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
              e.currentTarget.style.transform = 'scale(1)';
              const titleElement = e.currentTarget.querySelector('.tile-title') as HTMLElement;
              if (titleElement) {
                titleElement.style.color = '#051a1c';
              }
            }}
            onClick={onFeatureClick}
          >
            <div className="text-2xl mb-2 transition-all duration-300">{feature.emoji}</div>
            <div className="tile-title text-xs font-medium text-center leading-tight transition-all duration-300" style={{ color: '#051a1c' }}>
              {feature.title}
            </div>
          </div>
        ))}
      </div>
      
      {/* Indicator dots to show current set */}
      <div className="flex justify-center mt-6 space-x-2">
        {featureSets.map((_, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full transition-all duration-300 cursor-pointer"
            style={{ 
              backgroundColor: index === currentSet ? '#051a1c' : 'rgba(5, 26, 28, 0.3)',
              transform: index === currentSet ? 'scale(1.2)' : 'scale(1)'
            }}
            onClick={() => setCurrentSet(index)}
          />
        ))}
      </div>
    </div>
  );
}

// AuthModal Component
function AuthModal({ onClose }: { onClose: () => void }) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Sign up validation
        if (!formData.fullName.trim()) {
          setError('Full name is required');
          setIsLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters long');
          setIsLoading(false);
          return;
        }

        // Sign up with database service
        const result = await databaseService.signUp(formData.email, formData.password, formData.fullName);
        
        if (result.error) {
          setError(result.error);
        } else {
          setSuccess('Account created successfully! You can now sign in.');
          setIsSignUp(false);
          setFormData({ email: formData.email, password: '', fullName: '', confirmPassword: '' });
        }
      } else {
        // Sign in
        const result = await databaseService.signIn(formData.email, formData.password);
        
        if (result.error) {
          setError(result.error);
        } else if (result.user) {
          setSuccess('Sign in successful! Welcome back.');
          // Close modal after success
          setTimeout(() => {
            onClose();
            // Refresh page to show authenticated state
            window.location.reload();
          }, 1000);
        }
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-xl font-medium mb-2" style={{ color: '#051a1c' }}>
              {isSignUp ? 'Join Gawin AI' : 'Welcome Back'}
            </h3>
            <p className="text-sm opacity-70" style={{ color: '#051a1c' }}>
              {isSignUp ? 'Create your account to get started' : 'Sign in to continue your learning'}
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
            {isSignUp && (
              <div>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#00A3A3] focus:outline-none transition-colors"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                />
              </div>
            )}

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#00A3A3] focus:outline-none transition-colors"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#00A3A3] focus:outline-none transition-colors"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
              />
            </div>

            {isSignUp && (
              <div>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#00A3A3] focus:outline-none transition-colors"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                />
              </div>
            )}

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
              {isLoading ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccess('');
                setFormData({ email: '', password: '', fullName: '', confirmPassword: '' });
              }}
              className="text-sm opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: '#00A3A3' }}
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
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
              <Link href="/auth/login">
                <button className="text-sm opacity-60 hover:opacity-80 transition-opacity" style={{ color: '#051a1c' }}>
                  Sign in
                </button>
              </Link>
              <Link href="/auth/signup">
                <button className="text-white text-sm px-5 py-2.5 rounded-2xl hover:opacity-90 transition-all shadow-sm" style={{ backgroundColor: '#00A3A3' }}>
                  Sign up
                </button>
              </Link>
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

        {/* Big 3x3 Tic-Tac-Toe Grid */}
        <TicTacToeGrid onFeatureClick={() => setShowAuthModal(true)} />

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
            Get Started
          </button>
          
          <div className="text-center">
            <Link href="/auth/login">
              <button className="text-sm opacity-60 hover:opacity-80 transition-all" style={{ color: '#051a1c' }}>
                Already have an account? Sign in →
              </button>
            </Link>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

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
