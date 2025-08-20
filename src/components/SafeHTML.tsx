import React from 'react';
import { sanitizationService } from '../lib/services/sanitizationService';

interface SafeHTMLProps {
  content: string;
  type?: 'general' | 'code' | 'math';
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
  role?: string;
}

/**
 * SafeHTML Component
 * Renders sanitized HTML content to prevent XSS attacks
 * 
 * @param content - The HTML content to sanitize and render
 * @param type - The type of content (general, code, math) for appropriate sanitization
 * @param className - CSS class name to apply
 * @param style - Inline styles to apply
 * @param aria-label - Accessibility label
 * @param role - ARIA role for accessibility
 */
const SafeHTML: React.FC<SafeHTMLProps> = ({ 
  content, 
  type = 'general', 
  className,
  style,
  'aria-label': ariaLabel,
  role
}) => {
  // Validate content before processing
  if (!content || typeof content !== 'string') {
    return null;
  }

  // Additional validation for potential XSS
  if (!sanitizationService.validateContent(content)) {
    console.warn('⚠️ Potentially unsafe content detected and blocked:', content.substring(0, 100) + '...');
    return (
      <div 
        className={className}
        style={style}
        aria-label={ariaLabel || "Content blocked for security"}
        role={role || "alert"}
      >
        <span style={{ color: '#ff6b35', fontStyle: 'italic' }}>
          ⚠️ Content blocked for security reasons
        </span>
      </div>
    );
  }

  // Get sanitized HTML
  const safeHTML = sanitizationService.getSafeHTML(content, type);

  return (
    <div
      className={className}
      style={style}
      aria-label={ariaLabel}
      role={role}
      dangerouslySetInnerHTML={safeHTML}
    />
  );
};

export default SafeHTML;