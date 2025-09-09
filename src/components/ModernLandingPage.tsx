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
    title: 'MATHEMATICS',
    subtitle: 'Calculus & Algebra',
    icon: '∫',
    gradient: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
    examples: ['Solve derivatives', 'Matrix operations', 'Trigonometry help']
  },
  {
    id: 2,
    title: 'SCIENCE',
    subtitle: 'Physics & Chemistry',
    icon: '⚗️',
    gradient: 'from-blue-50 to-cyan-50',
    border: 'border-blue-200',
    examples: ['Chemical reactions', 'Physics problems', 'Lab analysis']
  },
  {
    id: 3,
    title: 'PROGRAMMING',
    subtitle: 'Code & Algorithms',
    icon: '</>', 
    gradient: 'from-green-50 to-emerald-50',
    border: 'border-green-200',
    examples: ['Debug code', 'Algorithm design', 'Code review']
  },
  {
    id: 4,
    title: 'WRITING',
    subtitle: 'Essays & Analysis',
    icon: '✒️',
    gradient: 'from-purple-50 to-pink-50', 
    border: 'border-purple-200',
    examples: ['Essay structure', 'Grammar check', 'Style improvement']
  },
  {
    id: 5,
    title: 'STUDY HELP',
    subtitle: 'Notes & Research',
    icon: '📚',
    gradient: 'from-rose-50 to-red-50',
    border: 'border-rose-200',
    examples: ['Summarize text', 'Study plans', 'Research guidance']
  },
  {
    id: 6,
    title: 'LANGUAGES',
    subtitle: 'Translation & Practice',
    icon: '🌍',
    gradient: 'from-indigo-50 to-blue-50',
    border: 'border-indigo-200',
    examples: ['Translate text', 'Language practice', 'Grammar rules']
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

export default function ModernLandingPage({ user, onLogin, onStartChat }: ModernLandingPageProps) {
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [showQuickPrompts, setShowQuickPrompts] = useState(false);

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

  const handleCardHover = (id: number) => {
    setSelectedCard(id);
    setShowQuickPrompts(true);
  };

  const handleCardLeave = () => {
    setSelectedCard(null);
    setShowQuickPrompts(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-zinc-50">
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
        {/* Welcome Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-5xl md:text-7xl text-stone-900 mb-6 leading-tight">
              Learn with
              <span className="block font-sans font-light text-stone-600 text-4xl md:text-5xl mt-2">
                Intelligence
              </span>
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
              Your personal AI learning companion. Get instant help with mathematics, science, 
              programming, and more—designed for students who want to excel.
            </p>
          </motion.div>

          {user && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onClick={onStartChat}
              className="mt-8 px-8 py-4 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Start Learning →
            </motion.button>
          )}
        </div>

        {/* Subject Cards */}
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          >
            {suggestionCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                onMouseEnter={() => handleCardHover(card.id)}
                onMouseLeave={handleCardLeave}
                className={`
                  relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} 
                  ${card.border} border-2 p-8 cursor-pointer group
                  hover:shadow-xl transition-all duration-300 hover:-translate-y-1
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-sans font-bold text-sm tracking-wider text-stone-800 mb-1">
                      {card.title}
                    </h3>
                    <p className="font-serif text-stone-600 text-sm">
                      {card.subtitle}
                    </p>
                  </div>
                  <div className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity">
                    {card.icon}
                  </div>
                </div>

                <AnimatePresence>
                  {selectedCard === card.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2"
                    >
                      {card.examples.map((example, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.1 }}
                          className="text-xs text-stone-600 bg-white/50 px-3 py-2 rounded-lg"
                        >
                          {example}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-6 h-6 bg-stone-900 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">→</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Prompts */}
          <AnimatePresence>
            {showQuickPrompts && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-wrap justify-center gap-3 mb-12"
              >
                {quickPrompts.map((prompt, index) => (
                  <motion.button
                    key={prompt}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="px-4 py-2 bg-white border border-stone-200 rounded-full text-sm text-stone-600 hover:border-stone-300 hover:shadow-sm transition-all"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="max-w-4xl mx-auto mt-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-stone-600">⚡</span>
              </div>
              <h3 className="font-serif text-lg text-stone-800 mb-2">Instant Help</h3>
              <p className="text-sm text-stone-600">
                Get immediate answers to your questions with our advanced AI system
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-stone-600">🎯</span>
              </div>
              <h3 className="font-serif text-lg text-stone-800 mb-2">Personalized</h3>
              <p className="text-sm text-stone-600">
                Tailored learning experiences that adapt to your unique style
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-stone-600">🛡️</span>
              </div>
              <h3 className="font-serif text-lg text-stone-800 mb-2">Safe & Secure</h3>
              <p className="text-sm text-stone-600">
                Built with privacy and safety at the core of every interaction
              </p>
            </div>
          </div>
        </motion.div>

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