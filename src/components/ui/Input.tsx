import * as React from "react";
import { cn } from "./utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = "text",
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    isLoading,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    const baseStyles: React.CSSProperties = {
      width: '100%',
      padding: leftIcon ? '12px 16px 12px 44px' : (rightIcon ? '12px 44px 12px 16px' : '12px 16px'),
      border: error ? '2px solid #EF4444' : '2px solid rgba(255, 107, 53, 0.2)',
      borderRadius: '12px',
      fontSize: '16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      transition: 'all 0.2s ease-in-out',
      outline: 'none',
      color: '#1F2937',
    };

    const focusStyles: React.CSSProperties = {
      borderColor: error ? '#EF4444' : '#FF6B35',
      boxShadow: error 
        ? '0 0 0 4px rgba(239, 68, 68, 0.1)' 
        : '0 0 0 4px rgba(255, 107, 53, 0.1)',
    };

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium mb-2 text-gray-700",
              error && "text-red-600"
            )}
            style={{
              color: error ? '#EF4444' : '#374151',
              fontWeight: '500',
              marginBottom: '8px',
              fontSize: '14px',
            }}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              style={{
                color: error ? '#EF4444' : '#9CA3AF',
                fontSize: '18px',
              }}
            >
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            id={inputId}
            className={cn(
              "w-full rounded-xl border-2 bg-white/95 backdrop-blur-sm transition-all duration-200 placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-1",
              {
                "border-orange-200 focus:border-orange-400": !error,
                "border-red-300 focus:border-red-400 focus:ring-red-200": error,
                "pl-12": leftIcon,
                "pr-12": rightIcon || isLoading,
                "opacity-50 cursor-not-allowed": props.disabled,
              },
              className,
            )}
            style={{
              ...baseStyles,
              ...(props.disabled && { opacity: 0.6, cursor: 'not-allowed' }),
            }}
            onFocus={(e) => {
              Object.assign(e.target.style, focusStyles);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? '#EF4444' : 'rgba(255, 107, 53, 0.2)';
              e.target.style.boxShadow = 'none';
              props.onBlur?.(e);
            }}
            {...props}
          />
          
          {(rightIcon || isLoading) && (
            <div 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              style={{
                color: error ? '#EF4444' : '#9CA3AF',
                fontSize: '18px',
              }}
            >
              {isLoading ? (
                <div 
                  className="animate-spin rounded-full h-5 w-5 border-2 border-orange-300 border-t-transparent"
                  style={{
                    borderColor: '#FCD34D',
                    borderTopColor: 'transparent',
                    animation: 'spin 1s linear infinite',
                  }}
                />
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div 
            className={cn(
              "mt-2 text-sm",
              error ? "text-red-600" : "text-gray-500"
            )}
            style={{
              color: error ? '#EF4444' : '#6B7280',
              fontSize: '13px',
              marginTop: '6px',
              lineHeight: '1.4',
            }}
          >
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// Textarea component
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    error?: string;
    helperText?: string;
  }
>(({ className, label, error, helperText, id, ...props }, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseStyles: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    border: error ? '2px solid #EF4444' : '2px solid rgba(255, 107, 53, 0.2)',
    borderRadius: '12px',
    fontSize: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    color: '#1F2937',
    minHeight: '120px',
    resize: 'vertical' as const,
  };

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={textareaId}
          className={cn(
            "block text-sm font-medium mb-2 text-gray-700",
            error && "text-red-600"
          )}
          style={{
            color: error ? '#EF4444' : '#374151',
            fontWeight: '500',
            marginBottom: '8px',
            fontSize: '14px',
          }}
        >
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={textareaId}
        className={cn(
          "w-full rounded-xl border-2 bg-white/95 backdrop-blur-sm transition-all duration-200 placeholder:text-gray-400 resize-y",
          "focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-1",
          {
            "border-orange-200 focus:border-orange-400": !error,
            "border-red-300 focus:border-red-400 focus:ring-red-200": error,
            "opacity-50 cursor-not-allowed": props.disabled,
          },
          className,
        )}
        style={baseStyles}
        {...props}
      />
      
      {(error || helperText) && (
        <div 
          className={cn(
            "mt-2 text-sm",
            error ? "text-red-600" : "text-gray-500"
          )}
          style={{
            color: error ? '#EF4444' : '#6B7280',
            fontSize: '13px',
            marginTop: '6px',
            lineHeight: '1.4',
          }}
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
});

Textarea.displayName = "Textarea";

export { Input, Textarea, type InputProps };