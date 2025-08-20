/**
 * Theme and Accessibility Service
 * Centralized theme management with accessibility features
 */
export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Secondary colors
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textOnDark: string;
  textOnLight: string;
  
  // State colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Border colors
  border: string;
  borderFocus: string;
  borderError: string;
  
  // Interactive colors
  buttonPrimary: string;
  buttonSecondary: string;
  buttonHover: string;
  buttonDisabled: string;
  
  // Special colors
  focusRing: string;
  overlay: string;
  shadow: string;
}

export interface ThemeTypography {
  fontFamily: {
    primary: string;
    secondary: string;
    monospace: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
  };
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface ThemeBreakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  breakpoints: ThemeBreakpoints;
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}

class ThemeService {
  private static instance: ThemeService;
  private currentTheme!: Theme;
  private darkMode: boolean = false;
  private highContrast: boolean = false;
  private reducedMotion: boolean = false;
  private fontSize: 'small' | 'normal' | 'large' = 'normal';

  private constructor() {
    this.initializeTheme();
    this.detectSystemPreferences();
    this.applyTheme();
  }

  public static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  private initializeTheme(): void {
    this.currentTheme = this.getLightTheme();
  }

  private detectSystemPreferences(): void {
    // Detect dark mode preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.darkMode = true;
      this.currentTheme = this.getDarkTheme();
    }

    // Detect high contrast preference
    if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
      this.highContrast = true;
    }

    // Detect reduced motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.reducedMotion = true;
    }

    // Listen for preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      this.setDarkMode(e.matches);
    });

    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      this.setHighContrast(e.matches);
    });

    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.setReducedMotion(e.matches);
    });
  }

  private getLightTheme(): Theme {
    return {
      name: 'light',
      colors: {
        primary: '#FF6B35',
        primaryLight: '#FF8A5C',
        primaryDark: '#E55A2B',
        
        secondary: '#667eea',
        secondaryLight: '#818CF8',
        secondaryDark: '#4F46E5',
        
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.8))',
        backgroundSecondary: 'rgba(255, 255, 255, 0.95)',
        backgroundTertiary: 'rgba(248, 249, 250, 1)',
        
        textPrimary: '#1F2937',
        textSecondary: '#6B7280',
        textOnDark: '#FFFFFF',
        textOnLight: '#1F2937',
        
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        
        border: 'rgba(0, 0, 0, 0.1)',
        borderFocus: '#FF6B35',
        borderError: '#EF4444',
        
        buttonPrimary: 'linear-gradient(135deg, #FF6B35, #E55A2B)',
        buttonSecondary: 'rgba(255, 255, 255, 0.9)',
        buttonHover: 'linear-gradient(135deg, #FF8A5C, #FF6B35)',
        buttonDisabled: 'rgba(156, 163, 175, 0.5)',
        
        focusRing: 'rgba(255, 107, 53, 0.3)',
        overlay: 'rgba(0, 0, 0, 0.5)',
        shadow: 'rgba(0, 0, 0, 0.1)'
      },
      typography: {
        fontFamily: {
          primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          secondary: 'Georgia, "Times New Roman", Times, serif',
          monospace: '"Monaco", "Consolas", "Courier New", monospace'
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem'
        },
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        },
        lineHeight: {
          tight: 1.25,
          normal: 1.5,
          relaxed: 1.75
        },
        letterSpacing: {
          tight: '-0.025em',
          normal: '0em',
          wide: '0.025em'
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '6rem'
      },
      breakpoints: {
        xs: '320px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      },
      transitions: {
        fast: '150ms ease-in-out',
        normal: '300ms ease-in-out',
        slow: '500ms ease-in-out'
      }
    };
  }

  private getDarkTheme(): Theme {
    const lightTheme = this.getLightTheme();
    return {
      ...lightTheme,
      name: 'dark',
      colors: {
        ...lightTheme.colors,
        background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.95))',
        backgroundSecondary: 'rgba(31, 41, 55, 0.95)',
        backgroundTertiary: 'rgba(17, 24, 39, 1)',
        
        textPrimary: '#F9FAFB',
        textSecondary: '#D1D5DB',
        textOnDark: '#F9FAFB',
        textOnLight: '#1F2937',
        
        border: 'rgba(255, 255, 255, 0.1)',
        shadow: 'rgba(0, 0, 0, 0.3)'
      }
    };
  }

  private getHighContrastTheme(): Theme {
    const baseTheme = this.darkMode ? this.getDarkTheme() : this.getLightTheme();
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: this.darkMode ? '#FFFFFF' : '#000000',
        textPrimary: this.darkMode ? '#FFFFFF' : '#000000',
        border: this.darkMode ? '#FFFFFF' : '#000000',
        borderFocus: '#FFFF00' // High contrast yellow for focus
      }
    };
  }

  private applyTheme(): void {
    const theme = this.highContrast ? this.getHighContrastTheme() : this.currentTheme;
    
    // Apply CSS custom properties
    const root = document.documentElement;
    
    // Colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${this.kebabCase(key)}`, value);
    });

    // Typography
    Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
      const scaledValue = this.getScaledFontSize(value);
      root.style.setProperty(`--font-size-${key}`, scaledValue);
    });

    Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
      root.style.setProperty(`--font-weight-${key}`, value.toString());
    });

    // Spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Border radius
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value);
    });

    // Shadows
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    // Transitions (adjust for reduced motion)
    Object.entries(theme.transitions).forEach(([key, value]) => {
      const transitionValue = this.reducedMotion ? '0ms' : value;
      root.style.setProperty(`--transition-${key}`, transitionValue);
    });

    // Apply theme class to body
    document.body.className = `theme-${theme.name}${this.highContrast ? ' high-contrast' : ''}${this.reducedMotion ? ' reduced-motion' : ''}`;
  }

  private getScaledFontSize(baseSize: string): string {
    const sizeMap = {
      small: 0.875,
      normal: 1,
      large: 1.125
    };

    const scale = sizeMap[this.fontSize];
    const numericValue = parseFloat(baseSize);
    const unit = baseSize.replace(numericValue.toString(), '');
    
    return `${numericValue * scale}${unit}`;
  }

  private kebabCase(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  // Public API
  public setDarkMode(enabled: boolean): void {
    this.darkMode = enabled;
    this.currentTheme = enabled ? this.getDarkTheme() : this.getLightTheme();
    this.applyTheme();
    localStorage.setItem('theme-dark-mode', enabled.toString());
  }

  public setHighContrast(enabled: boolean): void {
    this.highContrast = enabled;
    this.applyTheme();
    localStorage.setItem('theme-high-contrast', enabled.toString());
  }

  public setReducedMotion(enabled: boolean): void {
    this.reducedMotion = enabled;
    this.applyTheme();
    localStorage.setItem('theme-reduced-motion', enabled.toString());
  }

  public setFontSize(size: 'small' | 'normal' | 'large'): void {
    this.fontSize = size;
    this.applyTheme();
    localStorage.setItem('theme-font-size', size);
  }

  public getTheme(): Theme {
    return this.highContrast ? this.getHighContrastTheme() : this.currentTheme;
  }

  public isDarkMode(): boolean {
    return this.darkMode;
  }

  public isHighContrast(): boolean {
    return this.highContrast;
  }

  public isReducedMotion(): boolean {
    return this.reducedMotion;
  }

  public getFontSize(): 'small' | 'normal' | 'large' {
    return this.fontSize;
  }

  // Generate responsive CSS styles
  public getResponsiveStyles(styles: {
    xs?: React.CSSProperties;
    sm?: React.CSSProperties;
    md?: React.CSSProperties;
    lg?: React.CSSProperties;
    xl?: React.CSSProperties;
    '2xl'?: React.CSSProperties;
  }): React.CSSProperties {
    // Return base styles (xs) for now
    // In a real implementation, this would generate media queries
    return styles.xs || {};
  }

  // Accessibility helpers
  public getAccessibleColor(foreground: string, background: string): string {
    // Calculate contrast ratio and return accessible color
    // Simplified implementation - in practice, use a proper contrast calculation
    return foreground;
  }

  public getFocusStyles(): React.CSSProperties {
    return {
      outline: `2px solid var(--color-border-focus)`,
      outlineOffset: '2px',
      borderRadius: 'var(--border-radius-md)'
    };
  }

  public getButtonStyles(variant: 'primary' | 'secondary' | 'outline' = 'primary'): React.CSSProperties {
    const baseStyles: React.CSSProperties = {
      padding: 'var(--spacing-md) var(--spacing-lg)',
      borderRadius: 'var(--border-radius-lg)',
      fontSize: 'var(--font-size-base)',
      fontWeight: 'var(--font-weight-medium)',
      border: 'none',
      cursor: 'pointer',
      transition: 'var(--transition-normal)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--spacing-sm)'
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          background: 'var(--color-button-primary)',
          color: 'var(--color-text-on-dark)'
        };
      case 'secondary':
        return {
          ...baseStyles,
          background: 'var(--color-button-secondary)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)'
        };
      case 'outline':
        return {
          ...baseStyles,
          background: 'transparent',
          color: 'var(--color-primary)',
          border: '1px solid var(--color-primary)'
        };
      default:
        return baseStyles;
    }
  }
}

// Export singleton instance
export const themeService = ThemeService.getInstance();