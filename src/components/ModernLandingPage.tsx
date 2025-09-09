'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ModernLandingPageProps {
  user: { full_name?: string; email: string } | null;
  onLogin: () => void;
  onStartChat: () => void;
}


export default function ModernLandingPage({ user, onLogin, onStartChat }: ModernLandingPageProps) {
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    const updateTimeAndGreeting = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      setCurrentTime(timeString);

      const hour = now.getHours();
      if (hour < 12) setGreeting('Good morning');
      else if (hour < 17) setGreeting('Good afternoon');
      else setGreeting('Good evening');
    };

    updateTimeAndGreeting();
    const interval = setInterval(updateTimeAndGreeting, 60000);
    return () => clearInterval(interval);
  }, []);




  const handleChatSubmit = () => {
    if (chatInput.trim()) {
      // For now, just start chat - later integrate with actual chat
      onStartChat();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-50">
      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gradient-to-br from-stone-900 to-zinc-700 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">G</span>
          </div>
          <div>
            <h1 className="font-serif text-xl text-stone-900">Gawin</h1>
            <p className="text-xs text-stone-500 uppercase tracking-wider">AI Learning Assistant</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-sm text-stone-600">{currentTime}</p>
            <p className="text-xs text-stone-400 uppercase tracking-wide">{greeting}</p>
          </div>
          
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-stone-600 to-zinc-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.full_name?.[0] || user.email[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-stone-800">{user.full_name || 'User'}</p>
                <p className="text-xs text-stone-500">{user.email}</p>
              </div>
            </div>
          ) : (
            <button 
              onClick={onLogin}
              className="px-6 py-2 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-12">
        {/* Central Chat Section */}
        <div className="min-h-[80vh] flex flex-col justify-center items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-4xl md:text-6xl text-stone-900 mb-4 leading-tight">
              Learn with
              <span className="block font-sans font-light text-stone-600 text-3xl md:text-4xl mt-1">
                Intelligence
              </span>
            </h2>
            <p className="text-stone-600 max-w-xl mx-auto leading-relaxed text-base">
              Your personal AI learning companion for instant help with any subject.
            </p>
          </motion.div>

          {/* Capsule Chat Input */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-2xl mx-auto"
          >
            <div className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your studies..."
                className="w-full px-8 py-6 bg-stone-800 text-white rounded-full text-lg placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-stone-600/30 transition-all duration-300"
              />
              <button
                onClick={handleChatSubmit}
                disabled={!chatInput.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-stone-100 disabled:bg-stone-600 rounded-full flex items-center justify-center transition-colors"
              >
                <span className="text-stone-800 text-xl">
                  {chatInput.trim() ? '→' : '⋯'}
                </span>
              </button>
            </div>
          </motion.div>
        </div>


        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-stone-200">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-stone-500">
            <div className="flex items-center space-x-4">
              <span>© 2024 Gawin AI</span>
              <span>•</span>
              <span>Built for learners, by learners</span>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-6">
              <a href="#" className="hover:text-stone-700 transition-colors">Privacy</a>
              <a href="#" className="hover:text-stone-700 transition-colors">Terms</a>
              <a href="#" className="hover:text-stone-700 transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}