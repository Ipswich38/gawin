import React from 'react';
import { cn } from './utils';

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'code' | 'quote';
  color?: 'primary' | 'secondary' | 'accent' | 'muted' | 'error' | 'success' | 'warning';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
}

const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  color = 'primary',
  weight,
  align = 'left',
  className,
  children,
  as,
  style,
  ...props
}) => {
  // Define variant styles
  const variantStyles = {
    h1: {
      fontSize: '2.5rem',
      fontWeight: '700',
      lineHeight: '1.2',
      marginBottom: '1.5rem',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: '600',
      lineHeight: '1.3',
      marginBottom: '1.25rem',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: '600',
      lineHeight: '1.4',
      marginBottom: '1rem',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: '600',
      lineHeight: '1.4',
      marginBottom: '0.75rem',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: '500',
      lineHeight: '1.4',
      marginBottom: '0.5rem',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: '500',
      lineHeight: '1.4',
      marginBottom: '0.5rem',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: '400',
      lineHeight: '1.6',
      marginBottom: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: '400',
      lineHeight: '1.5',
      marginBottom: '0.75rem',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: '400',
      lineHeight: '1.4',
      marginBottom: '0.5rem',
    },
    code: {
      fontSize: '0.875rem',
      fontWeight: '400',
      lineHeight: '1.4',
      fontFamily: '"Monaco", "Consolas", "Courier New", monospace',
      background: 'rgba(255, 107, 53, 0.1)',
      padding: '2px 6px',
      borderRadius: '4px',
      border: '1px solid rgba(255, 107, 53, 0.2)',
    },
    quote: {
      fontSize: '1.125rem',
      fontWeight: '400',
      lineHeight: '1.6',
      fontStyle: 'italic',
      borderLeft: '4px solid #FF6B35',
      paddingLeft: '1rem',
      marginLeft: '0',
      marginBottom: '1rem',
    }
  };

  // Define color styles
  const colorStyles = {
    primary: { color: '#1F2937' },
    secondary: { color: '#6B7280' },
    accent: { color: '#FF6B35' },
    muted: { color: '#9CA3AF' },
    error: { color: '#EF4444' },
    success: { color: '#10B981' },
    warning: { color: '#F59E0B' },
  };

  // Define weight styles
  const weightStyles = {
    light: { fontWeight: '300' },
    normal: { fontWeight: '400' },
    medium: { fontWeight: '500' },
    semibold: { fontWeight: '600' },
    bold: { fontWeight: '700' },
  };

  // Determine the HTML element to use
  const getElement = (): keyof React.JSX.IntrinsicElements => {
    if (as) return as;
    
    switch (variant) {
      case 'h1': return 'h1';
      case 'h2': return 'h2';
      case 'h3': return 'h3';
      case 'h4': return 'h4';
      case 'h5': return 'h5';
      case 'h6': return 'h6';
      case 'code': return 'code';
      case 'quote': return 'blockquote';
      default: return 'p';
    }
  };

  const Element = getElement();

  const combinedStyles: React.CSSProperties = {
    ...variantStyles[variant],
    ...colorStyles[color],
    ...(weight && weightStyles[weight]),
    textAlign: align,
    margin: 'marginBottom' in variantStyles[variant] ? `0 0 ${(variantStyles[variant] as any).marginBottom} 0` : '0',
    ...style,
  };

  const combinedClassName = cn(
    'typography',
    `typography-${variant}`,
    `typography-color-${color}`,
    weight && `typography-weight-${weight}`,
    `typography-align-${align}`,
    className
  );

  return React.createElement(
    Element,
    {
      className: combinedClassName,
      style: combinedStyles,
      ...props,
    },
    children
  );
};

// Convenience components
export const Heading1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h1" {...props} />
);

export const Heading2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h2" {...props} />
);

export const Heading3: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h3" {...props} />
);

export const Heading4: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h4" {...props} />
);

export const Heading5: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h5" {...props} />
);

export const Heading6: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h6" {...props} />
);

export const Body1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body1" {...props} />
);

export const Body2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body2" {...props} />
);

export const Caption: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="caption" {...props} />
);

export const Code: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="code" {...props} />
);

export const Quote: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="quote" {...props} />
);

// Smart text formatter for AI responses
interface SmartTextProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

export const SmartText: React.FC<SmartTextProps> = ({ content, className, style }) => {
  // Simple text processing to enhance readability
  const processText = (text: string) => {
    // Split by double line breaks for paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return null;

      // Check if it's a heading (starts with # or is ALL CAPS and short)
      if (trimmed.startsWith('#')) {
        const level = (trimmed.match(/^#+/) || [''])[0].length;
        const text = trimmed.replace(/^#+\s*/, '');
        const HeadingComponent = level === 1 ? Heading1 : 
                               level === 2 ? Heading2 :
                               level === 3 ? Heading3 :
                               level === 4 ? Heading4 :
                               level === 5 ? Heading5 : Heading6;
        return <HeadingComponent key={index}>{text}</HeadingComponent>;
      }

      // Check if it's a code block
      if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
        const code = trimmed.slice(3, -3).trim();
        return (
          <div key={index} style={{ marginBottom: '1rem' }}>
            <pre 
              style={{
                background: '#F3F4F6',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                overflow: 'auto',
                fontSize: '0.875rem',
                lineHeight: '1.4',
                fontFamily: '"Monaco", "Consolas", "Courier New", monospace'
              }}
            >
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Check if it's a quote (starts with >)
      if (trimmed.startsWith('>')) {
        const quoteText = trimmed.replace(/^>\s*/, '');
        return <Quote key={index}>{quoteText}</Quote>;
      }

      // Check if it's a list
      if (trimmed.match(/^[-*+]\s/) || trimmed.match(/^\d+\.\s/)) {
        const items = trimmed.split('\n').map((item, itemIndex) => {
          const cleanItem = item.replace(/^[-*+]\s|^\d+\.\s/, '').trim();
          if (!cleanItem) return null;
          return <li key={itemIndex} style={{ marginBottom: '0.25rem' }}>{cleanItem}</li>;
        }).filter(Boolean);

        const isOrdered = trimmed.match(/^\d+\.\s/);
        const ListComponent = isOrdered ? 'ol' : 'ul';

        return (
          <ListComponent 
            key={index} 
            style={{ 
              marginBottom: '1rem',
              paddingLeft: '1.5rem',
              lineHeight: '1.6'
            }}
          >
            {items}
          </ListComponent>
        );
      }

      // Regular paragraph
      return (
        <Body1 key={index} style={{ marginBottom: '1rem' }}>
          {trimmed}
        </Body1>
      );
    }).filter(Boolean);
  };

  return (
    <div className={cn('smart-text', className)} style={style}>
      {processText(content)}
    </div>
  );
};

export default Typography;