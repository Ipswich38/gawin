'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModernLandingPageProps {
  user: { full_name?: string; email: string } | null;
  onLogin: () => void;
  onStartChat: () => void;
}

const suggestionCards = [
  {
    id: 1,
    title: 'Math',
    icon: '∫',
    gradient: 'from-amber-50 to-orange-50',
    border: 'border-amber-200/30',
    prompt: 'Help me solve this calculus problem'
  },
  {
    id: 2,
    title: 'Science',
    icon: '⚗️',
    gradient: 'from-blue-50 to-cyan-50',
    border: 'border-blue-200/30',
    prompt: 'Explain this physics concept'
  },
  {
    id: 3,
    title: 'Code',
    icon: '</>', 
    gradient: 'from-green-50 to-emerald-50',
    border: 'border-green-200/30',
    prompt: 'Review my code and suggest improvements'
  },
  {
    id: 4,
    title: 'Writing',
    icon: '✒️',
    gradient: 'from-purple-50 to-pink-50', 
    border: 'border-purple-200/30',
    prompt: 'Help me write a better essay'
  },
  {
    id: 5,
    title: 'Study',
    icon: '📚',
    gradient: 'from-rose-50 to-red-50',
    border: 'border-rose-200/30',
    prompt: 'Create a study plan for this topic'
  },
  {
    id: 6,
    title: 'Language',
    icon: '🌍',
    gradient: 'from-indigo-50 to-blue-50',
    border: 'border-indigo-200/30',
    prompt: 'Help me practice this language'
  }
];

const quickPrompts = [
  "Explain this concept simply",
  "Help me solve this problem", 
  "Review my work",
  "Create a study plan",
  "Summarize this topic",
  "Practice questions"
];

const features = [
  {
    icon: '⚡',
    title: 'Instant Help',
    description: 'Get immediate answers to your questions with our advanced AI system'
  },
  {
    icon: '🎯',
    title: 'Personalized',
    description: 'Tailored learning experiences that adapt to your unique style'
  },
  {
    icon: '🛡️',
    title: 'Safe & Secure', 
    description: 'Built with privacy and safety at the core of every interaction'
  }
];

export default function ModernLandingPage({ user, onLogin, onStartChat }: ModernLandingPageProps) {
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

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

  // Typing effect for features
  useEffect(() => {
    const currentFeature = features[currentFeatureIndex];
    const fullText = `${currentFeature.icon} ${currentFeature.title}\n${currentFeature.description}`;
    
    if (isTyping) {
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        setDisplayedText(fullText.substring(0, charIndex));
        charIndex++;
        
        if (charIndex > fullText.length) {
          clearInterval(typeInterval);
          setIsTyping(false);
          
          // Wait 3 seconds then move to next feature
          setTimeout(() => {
            setCurrentFeatureIndex((prev) => (prev + 1) % features.length);
            setDisplayedText('');
            setIsTyping(true);
          }, 3000);
        }
      }, 50);
      
      return () => clearInterval(typeInterval);
    }
  }, [currentFeatureIndex, isTyping]);


  const handleCardClick = (prompt: string) => {
    setChatInput(prompt);
  };

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
        <div className="min-h-[60vh] flex flex-col justify-center items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="font-serif text-4xl md:text-6xl text-stone-900 mb-4 leading-tight">
              Learn with
              <span className="block font-sans font-light text-stone-600 text-3xl md:text-4xl mt-1">
                Intelligence
              </span>
            </h2>
            <p className="text-stone-600 max-w-xl mx-auto leading-relaxed text-base mb-6">
              Your personal AI learning companion for instant help with any subject.
            </p>
            
            {/* Suggestion Chips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-2 mb-8"
            >
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleCardClick(prompt)}
                  className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-full text-sm text-stone-600 hover:bg-white hover:border-stone-300/50 hover:shadow-sm transition-all"
                >
                  {prompt}
                </button>
              ))}
            </motion.div>
          </motion.div>

          {/* Capsule Chat Input */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full max-w-2xl mx-auto mb-12"
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

          {/* Typing Feature Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center min-h-[100px] flex items-center justify-center"
          >
            <div className="max-w-md">
              <div className="text-2xl mb-2">
                {displayedText.split('\n')[0]}
              </div>
              <div className="text-sm text-stone-600 leading-relaxed">
                {displayedText.split('\n')[1]}
                {isTyping && <span className="animate-pulse">|</span>}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Small Square Cards */}
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-16"
          >
            {suggestionCards.map((card, index) => (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                onClick={() => handleCardClick(card.prompt)}
                className={`
                  group relative overflow-hidden rounded-xl bg-gradient-to-br ${card.gradient} 
                  border ${card.border} p-3 aspect-square cursor-pointer
                  hover:shadow-md transition-all duration-300 hover:-translate-y-1
                `}
              >
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-lg mb-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    {card.icon}
                  </div>
                  <span className="font-sans font-medium text-xs text-stone-700 uppercase tracking-wide">
                    {card.title}
                  </span>
                </div>
              </motion.button>
            ))}
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