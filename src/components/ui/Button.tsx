import * as React from "react";
import { cn } from "./utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    leftIcon,
    rightIcon,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      borderRadius: '12px',
      fontWeight: '500',
      transition: 'all 0.2s ease-in-out',
      border: 'none',
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      textDecoration: 'none',
      outline: 'none',
      position: 'relative' as const,
    };

    const sizeStyles = {
      sm: {
        padding: '8px 16px',
        fontSize: '14px',
        minHeight: '36px',
      },
      md: {
        padding: '12px 24px',
        fontSize: '16px',
        minHeight: '44px',
      },
      lg: {
        padding: '16px 32px',
        fontSize: '18px',
        minHeight: '52px',
      }
    };

    const variantStyles = {
      primary: {
        background: 'linear-gradient(135deg, #FF6B35, #E55A2B)',
        color: 'white',
        boxShadow: '0 4px 14px rgba(255, 107, 53, 0.25)',
      },
      secondary: {
        background: 'rgba(255, 255, 255, 0.95)',
        color: '#FF6B35',
        border: '1px solid rgba(255, 107, 53, 0.3)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      outline: {
        background: 'transparent',
        color: '#667eea',
        border: '2px solid #667eea',
      },
      ghost: {
        background: 'transparent',
        color: '#667eea',
        border: 'none',
      },
      danger: {
        background: 'linear-gradient(135deg, #EF4444, #DC2626)',
        color: 'white',
        boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)',
      }
    };

    const hoverStyles = {
      primary: {
        background: 'linear-gradient(135deg, #FF8A5C, #FF6B35)',
        transform: 'translateY(-1px)',
        boxShadow: '0 6px 20px rgba(255, 107, 53, 0.3)',
      },
      secondary: {
        borderColor: '#FF6B35',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
      },
      outline: {
        background: '#667eea',
        color: 'white',
        transform: 'translateY(-1px)',
      },
      ghost: {
        background: 'rgba(102, 126, 234, 0.1)',
      },
      danger: {
        background: 'linear-gradient(135deg, #F87171, #EF4444)',
        transform: 'translateY(-1px)',
        boxShadow: '0 6px 20px rgba(239, 68, 68, 0.3)',
      }
    };

    const disabledStyles = {
      background: 'rgba(156, 163, 175, 0.5)',
      color: '#9CA3AF',
      boxShadow: 'none',
      transform: 'none',
    };

    const combinedStyles = {
      ...baseStyles,
      ...sizeStyles[size],
      ...(disabled || isLoading ? disabledStyles : variantStyles[variant]),
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2",
          {
            // Primary variant
            "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:from-orange-600 hover:to-orange-700 hover:shadow-xl hover:-translate-y-0.5": 
              variant === 'primary' && !disabled && !isLoading,
            
            // Secondary variant  
            "bg-white/95 text-orange-600 border border-orange-200 hover:border-orange-300 hover:shadow-lg hover:-translate-y-0.5": 
              variant === 'secondary' && !disabled && !isLoading,
            
            // Outline variant
            "border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white hover:-translate-y-0.5": 
              variant === 'outline' && !disabled && !isLoading,
            
            // Ghost variant
            "text-blue-500 hover:bg-blue-50 hover:text-blue-600": 
              variant === 'ghost' && !disabled && !isLoading,
            
            // Danger variant
            "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:from-red-600 hover:to-red-700 hover:shadow-xl hover:-translate-y-0.5": 
              variant === 'danger' && !disabled && !isLoading,
            
            // Size variants
            "px-4 py-2 text-sm min-h-[36px]": size === 'sm',
            "px-6 py-3 text-base min-h-[44px]": size === 'md',
            "px-8 py-4 text-lg min-h-[52px]": size === 'lg',
            
            // Disabled state
            "opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none": disabled || isLoading,
          },
          className,
        )}
        style={combinedStyles}
        {...props}
      >
        {isLoading && (
          <div 
            className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"
            style={{
              borderColor: 'currentColor',
              borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite',
            }}
          />
        )}
        {!isLoading && leftIcon && (
          <span className="flex items-center justify-center">
            {leftIcon}
          </span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="flex items-center justify-center">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, type ButtonProps };