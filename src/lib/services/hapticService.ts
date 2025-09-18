/**
 * Haptic Braille Service for Gawin
 * Provides tactile feedback using Braille-inspired vibration patterns
 * for enhanced accessibility and intuitive button recognition
 */

export interface HapticPattern {
  name: string;
  pattern: number[];
  description: string;
  brailleRef: string;
}

class HapticService {
  private static instance: HapticService;
  private isSupported: boolean = false;
  private isEnabled: boolean = true;

  private readonly BRAILLE_PATTERNS: Record<string, HapticPattern> = {
    // Core controls with distinct Braille-inspired patterns
    send: {
      name: 'Send',
      pattern: [50, 30, 50], // Sharp double-tap: ⠎ (S for Send)
      description: 'Sharp double-tap vibration',
      brailleRef: '⠎'
    },
    microphone: {
      name: 'Microphone',
      pattern: [100, 50, 100, 50, 100], // Pulsing rhythm: ⠍ (M for Microphone)
      description: 'Rhythmic pulsing pattern',
      brailleRef: '⠍'
    },
    vision: {
      name: 'Vision',
      pattern: [150, 30, 80, 30, 150], // Wave-like: ⠧ (V for Vision)
      description: 'Smooth wave-like vibration',
      brailleRef: '⠧'
    },
    voice: {
      name: 'Voice',
      pattern: [70, 40, 70, 40, 70, 40, 140], // Triple burst + hold: ⠺ (W for Words/Voice)
      description: 'Three quick bursts followed by longer pulse',
      brailleRef: '⠺'
    },
    screenShare: {
      name: 'Screen Share',
      pattern: [120, 50, 60, 50, 120], // Long-short-long: ⠎⠓ (SH for Share)
      description: 'Long-short-long pattern',
      brailleRef: '⠎⠓'
    },

    // State feedback patterns
    activate: {
      name: 'Activate',
      pattern: [50, 20, 50, 20, 100], // Ascending pattern
      description: 'Activation confirmation',
      brailleRef: '⠕⠝'
    },
    deactivate: {
      name: 'Deactivate',
      pattern: [100, 20, 50, 20, 30], // Descending pattern
      description: 'Deactivation confirmation',
      brailleRef: '⠕⠋⠋'
    },
    error: {
      name: 'Error',
      pattern: [200, 100, 200, 100, 200], // Strong alert pattern
      description: 'Error notification',
      brailleRef: '⠑⠗⠗'
    },
    success: {
      name: 'Success',
      pattern: [80, 40, 80, 40, 160], // Positive confirmation
      description: 'Success confirmation',
      brailleRef: '⠕⠅'
    }
  };

  static getInstance(): HapticService {
    if (!HapticService.instance) {
      HapticService.instance = new HapticService();
    }
    return HapticService.instance;
  }

  constructor() {
    this.initializeHapticSupport();
  }

  /**
   * Initialize haptic support detection
   */
  private initializeHapticSupport(): void {
    // Check if Vibration API is supported
    this.isSupported = 'vibrate' in navigator;

    if (this.isSupported) {
      console.log('🔮 Haptic Braille Service initialized - Ready for tactile feedback');
    } else {
      console.warn('⚠️ Haptic feedback not supported on this device');
    }
  }

  /**
   * Check if haptic feedback is supported
   */
  isHapticSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Enable/disable haptic feedback
   */
  setHapticEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`🔮 Haptic feedback ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get haptic enabled state
   */
  isHapticEnabled(): boolean {
    return this.isEnabled && this.isSupported;
  }

  /**
   * Trigger haptic feedback for a specific control
   */
  triggerHaptic(controlType: keyof typeof this.BRAILLE_PATTERNS): void {
    if (!this.isHapticEnabled()) {
      return;
    }

    const pattern = this.BRAILLE_PATTERNS[controlType];
    if (!pattern) {
      console.warn(`Unknown haptic pattern: ${controlType}`);
      return;
    }

    try {
      navigator.vibrate(pattern.pattern);
      console.log(`🔮 Haptic: ${pattern.name} (${pattern.brailleRef}) - ${pattern.description}`);
    } catch (error) {
      console.error('Haptic vibration failed:', error);
    }
  }

  /**
   * Trigger custom haptic pattern
   */
  triggerCustomPattern(pattern: number[], description?: string): void {
    if (!this.isHapticEnabled()) {
      return;
    }

    try {
      navigator.vibrate(pattern);
      console.log(`🔮 Haptic: Custom pattern - ${description || 'Custom vibration'}`);
    } catch (error) {
      console.error('Custom haptic vibration failed:', error);
    }
  }

  /**
   * Stop all vibrations
   */
  stopHaptic(): void {
    if (this.isSupported) {
      navigator.vibrate(0);
    }
  }

  /**
   * Get pattern information for debugging/accessibility
   */
  getPatternInfo(controlType: keyof typeof this.BRAILLE_PATTERNS): HapticPattern | null {
    return this.BRAILLE_PATTERNS[controlType] || null;
  }

  /**
   * Get all available patterns
   */
  getAllPatterns(): Record<string, HapticPattern> {
    return { ...this.BRAILLE_PATTERNS };
  }

  /**
   * Trigger state change feedback
   */
  triggerStateChange(isActivating: boolean, controlType?: string): void {
    if (isActivating) {
      this.triggerHaptic('activate');
    } else {
      this.triggerHaptic('deactivate');
    }
  }

  /**
   * Trigger success feedback
   */
  triggerSuccess(): void {
    this.triggerHaptic('success');
  }

  /**
   * Trigger error feedback
   */
  triggerError(): void {
    this.triggerHaptic('error');
  }

  /**
   * Demo all haptic patterns (for testing/onboarding)
   */
  async demoAllPatterns(): Promise<void> {
    if (!this.isHapticEnabled()) {
      console.log('Haptic feedback not available for demo');
      return;
    }

    console.log('🔮 Starting Haptic Braille Demo...');

    const controls = ['send', 'microphone', 'vision', 'voice', 'screenShare'] as const;

    for (const control of controls) {
      const pattern = this.BRAILLE_PATTERNS[control];
      console.log(`Demo: ${pattern.name} (${pattern.brailleRef}) - ${pattern.description}`);

      this.triggerHaptic(control);

      // Wait between patterns
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('🔮 Haptic Braille Demo complete');
  }
}

export const hapticService = HapticService.getInstance();