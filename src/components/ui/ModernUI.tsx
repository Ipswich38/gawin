'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ChevronDown, Check, AlertCircle, Info, X, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

// Modern Color Palette
export const modernColors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  }
};

// Enhanced Button Component with micro-interactions
interface ModernButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button'
}) => {
  const controls = useAnimation();

  const baseClasses = 'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl focus:ring-blue-500 active:scale-[0.98]',
    secondary: 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-900 shadow-sm hover:shadow-md focus:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500',
    outline: 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus:ring-gray-500',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl focus:ring-red-500 active:scale-[0.98]',
    success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl focus:ring-green-500 active:scale-[0.98]'
  };

  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs gap-1',
    sm: 'px-3 py-2 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
    xl: 'px-8 py-4 text-lg gap-3'
  };

  const handleClick = async () => {
    if (loading || disabled) return;

    // Ripple effect animation
    await controls.start({
      scale: [1, 0.95, 1],
      transition: { duration: 0.15 }
    });

    onClick?.();
  };

  return (
    <motion.button
      type={type}
      animate={controls}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {/* Shimmer effect for primary buttons */}
      {(variant === 'primary' || variant === 'success' || variant === 'danger') && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
      )}

      {loading && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}

      {!loading && icon && iconPosition === 'left' && (
        <span>{icon}</span>
      )}

      {!loading && (
        <span>{children}</span>
      )}

      {!loading && icon && iconPosition === 'right' && (
        <span>{icon}</span>
      )}
    </motion.button>
  );
};

// Enhanced Card Component with glass morphism
interface ModernCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  hover = false,
  onClick
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-300';

  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm',
    glass: 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl',
    elevated: 'bg-white shadow-2xl border-0',
    bordered: 'bg-white border-2 border-gray-200'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const hoverClasses = hover ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer' : '';

  return (
    <motion.div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        hoverClasses,
        className
      )}
      onClick={onClick}
      whileHover={hover ? { y: -4 } : {}}
    >
      {children}
    </motion.div>
  );
};

// Enhanced Input Component with floating labels
interface ModernInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  icon?: React.ReactNode;
  error?: string;
  success?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const ModernInput: React.FC<ModernInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  icon,
  error,
  success,
  disabled = false,
  required = false,
  className = ''
}) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  const hasFloatingLabel = label && (focused || hasValue);

  return (
    <div className={clsx('relative', className)}>
      {/* Floating Label */}
      <AnimatePresence>
        {label && (
          <motion.label
            initial={false}
            animate={{
              y: hasFloatingLabel ? -24 : 8,
              scale: hasFloatingLabel ? 0.85 : 1,
              color: error ? '#ef4444' : focused ? '#0ea5e9' : '#6b7280'
            }}
            className="absolute left-3 pointer-events-none font-medium z-10 bg-white px-1"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </motion.label>
        )}
      </AnimatePresence>

      {/* Input Container */}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={hasFloatingLabel ? '' : placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={clsx(
            'w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 outline-none',
            'placeholder:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed',
            icon && 'pl-10',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
              : success
                ? 'border-green-300 focus:border-green-500 focus:ring-4 focus:ring-green-100'
                : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
          )}
        />
      </div>

      {/* Error/Success Message */}
      <AnimatePresence>
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 mt-2 text-sm"
          >
            {error && (
              <>
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-600">{error}</span>
              </>
            )}
            {success && (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-green-600">{success}</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Enhanced Modal Component with backdrop blur
interface ModernModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const ModernModal: React.FC<ModernModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  className = ''
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={clsx(
                'relative w-full bg-white rounded-2xl shadow-2xl',
                sizeClasses[size],
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {(title || subtitle) && (
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      {title && (
                        <h2 className="text-xl font-semibold text-gray-900">
                          {title}
                        </h2>
                      )}
                      {subtitle && (
                        <p className="mt-1 text-sm text-gray-600">
                          {subtitle}
                        </p>
                      )}
                    </div>
                    <ModernButton
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      icon={<X className="w-4 h-4" />}
                    />
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="px-6 py-4">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// Enhanced Badge/Tag Component
interface ModernBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ModernBadge: React.FC<ModernBadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';

  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span className={clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      {children}
    </span>
  );
};

// Enhanced Toast Notification System
interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  const icons = {
    success: <Check className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />
  };

  const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={clsx(
        'max-w-sm w-full bg-white border rounded-xl shadow-lg p-4',
        colors[type]
      )}
    >
      <div className="flex items-start gap-3">
        {icons[type]}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
          {message && (
            <p className="mt-1 text-sm text-gray-600">{message}</p>
          )}
        </div>
        <ModernButton
          variant="ghost"
          size="xs"
          onClick={() => onClose(id)}
          icon={<X className="w-3 h-3" />}
        />
      </div>
    </motion.div>
  );
};