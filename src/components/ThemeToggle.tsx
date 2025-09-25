'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
  showLabel = false
}) => {
  const { theme, toggleTheme, isDark, isLight } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {showLabel && (
        <span className="theme-text-secondary text-sm font-medium">
          {isDark ? 'Dark' : 'Light'} Mode
        </span>
      )}

      <motion.button
        onClick={toggleTheme}
        className={`${sizeClasses[size]} relative rounded-full theme-bg-secondary theme-border border backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:theme-bg-tertiary flex items-center justify-center`}
        whileTap={{ scale: 0.95 }}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="theme-icon"
            >
              <Moon size={iconSizes[size]} />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="theme-icon"
            >
              <Sun size={iconSizes[size]} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtle glow effect */}
        <div className={`absolute inset-0 rounded-full transition-opacity duration-200 ${
          isDark
            ? 'bg-blue-400/20 opacity-0 hover:opacity-100'
            : 'bg-yellow-400/20 opacity-0 hover:opacity-100'
        }`} />
      </motion.button>
    </div>
  );
};

// Alternative compact toggle for mobile
export const CompactThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`p-2 rounded-lg theme-bg-primary theme-border border backdrop-blur-sm transition-all duration-200 hover:theme-bg-secondary ${className}`}
      whileTap={{ scale: 0.95 }}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun size={16} className="theme-icon" />
      ) : (
        <Moon size={16} className="theme-icon" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;