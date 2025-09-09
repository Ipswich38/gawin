'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModernLandingPageProps {
  user: { full_name?: string; email: string } | null;
  onLogin: () => void;
  onStartChat: () => void;
}


export default function ModernLandingPage({ user, onLogin, onStartChat }: ModernLandingPageProps) {
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [showHeaderToggle, setShowHeaderToggle] = useState(false);

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
      {/* Toggle Button */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={() => setShowHeaderToggle(!showHeaderToggle)}
          className="w-12 h-12 bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-full flex items-center justify-center hover:bg-white/80 transition-all duration-300 shadow-lg"
        >
          <div className="flex flex-col space-y-1">
            <div className="w-4 h-0.5 bg-stone-600 rounded"></div>
            <div className="w-4 h-0.5 bg-stone-600 rounded"></div>
            <div className="w-4 h-0.5 bg-stone-600 rounded"></div>
          </div>
        </button>
      </div>

      {/* Toggle Box Content */}
      <AnimatePresence>
        {showHeaderToggle && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-20 right-6 z-40 bg-white/80 backdrop-blur-sm border border-stone-200/50 rounded-2xl shadow-xl p-6 min-w-[300px]"
          >
            {/* Branding Section */}
            <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-stone-200/50">
              <div className="w-8 h-8 bg-gradient-to-br from-stone-900 to-zinc-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">G</span>
              </div>
              <div>
                <h1 className="font-serif text-xl text-stone-900">Gawin</h1>
                <p className="text-xs text-stone-500 uppercase tracking-wider">AI Learning Assistant</p>
              </div>
            </div>

            {/* Time and Greeting */}
            <div className="mb-6">
              <div className="text-center">
                <p className="text-lg font-medium text-stone-800">{currentTime}</p>
                <p className="text-sm text-stone-500 uppercase tracking-wide">{greeting}</p>
              </div>
            </div>

            {/* User Section */}
            {user ? (
              <div className="flex items-center space-x-3 mb-4">
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
                className="w-full py-3 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 transition-colors"
              >
                Sign In
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close toggle when clicking outside */}
      <AnimatePresence>
        {showHeaderToggle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHeaderToggle(false)}
            className="fixed inset-0 z-30 bg-black/10 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

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
                className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-teal-500 hover:bg-teal-600 disabled:bg-stone-600 rounded-full flex items-center justify-center transition-colors"
              >
                <span className="text-white text-xl">
                  →
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