'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, X, Plus, Grip } from 'lucide-react';

// Base Notion-style card component
interface NotionCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'sm' | 'md' | 'lg';
  border?: boolean;
}

export const NotionCard: React.FC<NotionCardProps> = ({
  children,
  className = '',
  hover = true,
  onClick,
  padding = 'md',
  border = true
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      className={`
        bg-white rounded-xl transition-all duration-200 cursor-pointer
        ${border ? 'border border-gray-200 hover:border-gray-300' : ''}
        ${paddingClasses[padding]}
        ${onClick ? 'hover:shadow-lg' : 'shadow-sm'}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

// Notion-style button component
interface NotionButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const NotionButton: React.FC<NotionButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  icon,
  fullWidth = false
}) => {
  const variants = {
    primary: 'bg-gray-900 text-white hover:bg-gray-800 border-gray-900',
    secondary: 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 border-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 border-red-600'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        inline-flex items-center gap-2 border rounded-lg font-medium
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full justify-center' : ''}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
};

// Notion-style input component
interface NotionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
}

export const NotionInput: React.FC<NotionInputProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  icon,
  fullWidth = false,
  multiline = false,
  rows = 3
}) => {
  const baseClasses = `
    border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
    transition-all duration-200 bg-white hover:border-gray-300
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={baseClasses}
      />
    );
  }

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${baseClasses} ${icon ? 'pl-10' : ''}`}
      />
    </div>
  );
};

// Notion-style collapsible section
interface NotionCollapsibleProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export const NotionCollapsible: React.FC<NotionCollapsibleProps> = ({
  title,
  children,
  defaultExpanded = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 py-3 text-left hover:bg-gray-50 transition-colors duration-200"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
        <span className="font-medium text-gray-900">{title}</span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Notion-style tag component
interface NotionTagProps {
  children: React.ReactNode;
  color?: 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export const NotionTag: React.FC<NotionTagProps> = ({
  children,
  color = 'gray',
  removable = false,
  onRemove,
  className = ''
}) => {
  const colors = {
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200'
  };

  return (
    <span className={`
      inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border
      ${colors[color]} ${className}
    `}>
      {children}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

// Notion-style modal/dialog
interface NotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const NotionModal: React.FC<NotionModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full ${sizes[size]} bg-white rounded-xl shadow-2xl`}
          >
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            )}

            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Notion-style draggable item
interface NotionDraggableProps {
  children: React.ReactNode;
  onDrag?: (e: MouseEvent) => void;
  className?: string;
  dragHandle?: boolean;
}

export const NotionDraggable: React.FC<NotionDraggableProps> = ({
  children,
  onDrag,
  className = '',
  dragHandle = true
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={dragRef}
      className={`
        relative group transition-all duration-200
        ${isDragging ? 'opacity-75 scale-105' : ''}
        ${className}
      `}
    >
      {dragHandle && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-8 opacity-0 group-hover:opacity-100 transition-opacity">
          <Grip className="w-4 h-4 text-gray-400 cursor-grab" />
        </div>
      )}
      {children}
    </div>
  );
};

// Notion-style toolbar
interface NotionToolbarProps {
  children: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

export const NotionToolbar: React.FC<NotionToolbarProps> = ({
  children,
  className = '',
  sticky = false
}) => {
  return (
    <div className={`
      flex items-center gap-2 p-3 bg-white border-b border-gray-200
      ${sticky ? 'sticky top-0 z-40' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};