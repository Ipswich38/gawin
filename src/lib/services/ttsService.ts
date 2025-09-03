interface TTSResult {
  success: boolean;
  message: string;
  audioUrl?: string;
  voiceUsed?: string;
  method: 'web-speech' | 'external-api' | 'fallback';
}

class TTSService {
  private readonly HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

  /**
   * Main TTS function that tries multiple methods
   */
  async speak(text: string, voice: string = 'alloy'): Promise<TTSResult> {
    // Method 1: Try Web Speech API (most reliable)
    if ('speechSynthesis' in window) {
      try {
        const result = await this.useWebSpeechAPI(text, voice);
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.warn('Web Speech API failed:', error);
      }
    }

    // Method 2: Try external TTS APIs (if available)
    if (this.HF_API_KEY) {
      try {
        const result = await this.useExternalTTS(text, voice);
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.warn('External TTS failed:', error);
      }
    }

    // Method 3: Fallback message
    return {
      success: false,
      message: `❌ Text-to-speech is not available in this environment. The text was: "${text}"`,
      method: 'fallback'
    };
  }

  /**
   * Use browser's Web Speech API
   */
  private async useWebSpeechAPI(text: string, preferredVoice: string): Promise<TTSResult> {
    return new Promise((resolve) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = speechSynthesis.getVoices();
        
        // Wait for voices to load if needed
        if (voices.length === 0) {
          speechSynthesis.addEventListener('voiceschanged', () => {
            this.selectBestVoice(utterance, preferredVoice);
          }, { once: true });
        } else {
          this.selectBestVoice(utterance, preferredVoice);
        }

        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
          console.log('✅ Web Speech API started speaking');
          resolve({
            success: true,
            message: `🎵 Audio playback started using browser TTS`,
            voiceUsed: utterance.voice?.name || 'System Default',
            method: 'web-speech'
          });
        };

        utterance.onerror = (error) => {
          console.error('Web Speech API error:', error);
          resolve({
            success: false,
            message: `❌ Browser TTS failed: ${error.error}`,
            method: 'web-speech'
          });
        };

        utterance.onend = () => {
          console.log('✅ Web Speech API finished speaking');
        };

        // Start speaking
        speechSynthesis.speak(utterance);

        // Timeout after 1 second if speech doesn't start
        setTimeout(() => {
          if (utterance.text) { // Still pending
            resolve({
              success: false,
              message: `⏰ Browser TTS timeout - may not be supported`,
              method: 'web-speech'
            });
          }
        }, 1000);

      } catch (error) {
        resolve({
          success: false,
          message: `❌ Web Speech API error: ${error}`,
          method: 'web-speech'
        });
      }
    });
  }

  /**
   * Select the best available voice
   */
  private selectBestVoice(utterance: SpeechSynthesisUtterance, preferredVoice: string) {
    const voices = speechSynthesis.getVoices();
    
    // First try to find exact match
    let selectedVoice = voices.find(voice => 
      voice.name.toLowerCase().includes(preferredVoice.toLowerCase())
    );

    // Then try to find high-quality English voices
    if (!selectedVoice) {
      const qualityVoices = voices.filter(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.toLowerCase().includes('natural') ||
         voice.name.toLowerCase().includes('neural') ||
         voice.name.toLowerCase().includes('premium') ||
         voice.name.toLowerCase().includes('enhanced'))
      );
      selectedVoice = qualityVoices[0];
    }

    // Fallback to any English voice
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
    }

    // Final fallback to first available voice
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log(`🎵 Selected voice: ${selectedVoice.name} (${selectedVoice.lang})`);
    }
  }

  /**
   * Try external TTS APIs
   */
  private async useExternalTTS(text: string, voice: string): Promise<TTSResult> {
    // Note: Most external TTS APIs require authentication and have costs
    // For now, this is a placeholder for potential future integration
    
    try {
      // Example: You could integrate with services like:
      // - ElevenLabs API
      // - Azure Cognitive Services Speech
      // - Google Cloud Text-to-Speech
      // - Amazon Polly
      
      console.log('🎵 External TTS APIs not configured');
      return {
        success: false,
        message: `External TTS service not configured`,
        method: 'external-api'
      };
      
    } catch (error) {
      return {
        success: false,
        message: `External TTS failed: ${error}`,
        method: 'external-api'
      };
    }
  }

  /**
   * Stop any current speech
   */
  stopSpeech(): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      console.log('🔇 Speech stopped');
    }
  }

  /**
   * Check if TTS is available
   */
  isAvailable(): boolean {
    return 'speechSynthesis' in window;
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if ('speechSynthesis' in window) {
      return speechSynthesis.getVoices();
    }
    return [];
  }

  /**
   * Test TTS with a short phrase
   */
  async test(): Promise<boolean> {
    try {
      const result = await this.speak('Hello, this is a test.');
      return result.success;
    } catch (error) {
      return false;
    }
  }
}

export const ttsService = new TTSService();