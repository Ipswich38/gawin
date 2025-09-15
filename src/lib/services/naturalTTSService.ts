/**
 * Natural TTS Service for Gawin
 * Replaces robotic browser TTS with production-quality natural speech
 * Supports multiple high-quality TTS providers with intelligent fallbacks
 */

export interface NaturalTTSConfig {
  provider: 'elevenlabs' | 'openai' | 'azure' | 'browser';
  voice: string;
  model?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export interface TTSResult {
  success: boolean;
  audioUrl?: string;
  audioBlob?: Blob;
  provider: string;
  error?: string;
  duration?: number;
}

class NaturalTTSService {
  private config: NaturalTTSConfig = {
    provider: 'elevenlabs',
    voice: 'Adam', // Natural male voice
    model: 'eleven_multilingual_v2',
    stability: 0.5,
    similarityBoost: 0.8,
    style: 0.0,
    useSpeakerBoost: true
  };

  private readonly ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY;
  private readonly OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  private readonly AZURE_SPEECH_KEY = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY || process.env.AZURE_SPEECH_KEY;
  private readonly AZURE_SPEECH_REGION = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION || process.env.AZURE_SPEECH_REGION;

  /**
   * Generate natural speech with intelligent provider fallback
   */
  async generateSpeech(text: string, options: Partial<NaturalTTSConfig> = {}): Promise<TTSResult> {
    const config = { ...this.config, ...options };
    
    // Clean and prepare text for natural speech
    const cleanedText = this.prepareTextForSpeech(text);
    
    if (cleanedText.length === 0) {
      return {
        success: false,
        error: 'No text to synthesize',
        provider: 'none'
      };
    }

    // Try providers in order of quality
    const providers = [
      () => this.useElevenLabs(cleanedText, config),
      () => this.useOpenAI(cleanedText, config),
      () => this.useAzure(cleanedText, config),
      () => this.useEnhancedBrowser(cleanedText, config)
    ];

    for (const provider of providers) {
      try {
        const result = await provider();
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.warn('TTS provider failed:', error);
        continue;
      }
    }

    return {
      success: false,
      error: 'All TTS providers failed',
      provider: 'none'
    };
  }

  /**
   * ElevenLabs - Premium natural TTS
   */
  private async useElevenLabs(text: string, config: NaturalTTSConfig): Promise<TTSResult> {
    if (!this.ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }

    const startTime = Date.now();
    
    // Get voice ID for the specified voice
    const voiceId = await this.getElevenLabsVoiceId(config.voice);
    
    const requestBody = {
      text,
      model_id: config.model || 'eleven_multilingual_v2',
      voice_settings: {
        stability: config.stability || 0.5,
        similarity_boost: config.similarityBoost || 0.8,
        style: config.style || 0.0,
        use_speaker_boost: config.useSpeakerBoost || true
      }
    };

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.ELEVENLABS_API_KEY
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    return {
      success: true,
      audioUrl,
      audioBlob,
      provider: 'elevenlabs',
      duration: Date.now() - startTime
    };
  }

  /**
   * OpenAI TTS - High quality alternative
   */
  private async useOpenAI(text: string, config: NaturalTTSConfig): Promise<TTSResult> {
    if (!this.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const startTime = Date.now();
    
    // Map voice names to OpenAI voices
    const voiceMap: Record<string, string> = {
      'Adam': 'alloy',
      'Daniel': 'echo', 
      'Sam': 'fable',
      'Brian': 'onyx',
      'Chris': 'nova',
      'Eric': 'shimmer'
    };

    const openaiVoice = voiceMap[config.voice] || 'alloy';

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1-hd', // High quality model
        input: text,
        voice: openaiVoice,
        response_format: 'mp3',
        speed: 1.0
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI TTS error: ${response.status} ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    return {
      success: true,
      audioUrl,
      audioBlob,
      provider: 'openai',
      duration: Date.now() - startTime
    };
  }

  /**
   * Azure Cognitive Services Speech
   */
  private async useAzure(text: string, config: NaturalTTSConfig): Promise<TTSResult> {
    if (!this.AZURE_SPEECH_KEY || !this.AZURE_SPEECH_REGION) {
      throw new Error('Azure Speech credentials not configured');
    }

    const startTime = Date.now();
    
    // Get access token
    const tokenResponse = await fetch(`https://${this.AZURE_SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.AZURE_SPEECH_KEY
      }
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get Azure access token');
    }

    const accessToken = await tokenResponse.text();

    // Azure neural voices
    const azureVoiceMap: Record<string, string> = {
      'Adam': 'en-US-BrianNeural',
      'Daniel': 'en-US-DavisNeural', 
      'Sam': 'en-US-GuyNeural',
      'Brian': 'en-US-JasonNeural',
      'Chris': 'en-US-TonyNeural',
      'Eric': 'en-US-AIGenerate1Neural'
    };

    const azureVoice = azureVoiceMap[config.voice] || 'en-US-BrianNeural';

    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${azureVoice}">
          <prosody rate="0.9" pitch="+2st">${text}</prosody>
        </voice>
      </speak>
    `;

    const response = await fetch(`https://${this.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'Gawin-TTS'
      },
      body: ssml
    });

    if (!response.ok) {
      throw new Error(`Azure TTS error: ${response.status} ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    return {
      success: true,
      audioUrl,
      audioBlob,
      provider: 'azure',
      duration: Date.now() - startTime
    };
  }

  /**
   * Enhanced browser TTS as final fallback
   */
  private async useEnhancedBrowser(text: string, config: NaturalTTSConfig): Promise<TTSResult> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      if (!('speechSynthesis' in window)) {
        resolve({
          success: false,
          error: 'Browser TTS not supported',
          provider: 'browser'
        });
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const voices = speechSynthesis.getVoices();

      // Select the most natural voice available
      const naturalVoices = [
        'Google UK English Male',
        'Microsoft David - English (United States)',
        'Microsoft Mark - English (United States)',
        'Alex',
        'Samantha',
        'Daniel',
        'Karen'
      ];

      let selectedVoice = null;
      for (const voiceName of naturalVoices) {
        selectedVoice = voices.find(v => v.name.includes(voiceName));
        if (selectedVoice) break;
      }

      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male'));
      }

      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Enhanced natural parameters
      utterance.rate = 0.85;
      utterance.pitch = 1.02;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        console.log('🎤 Enhanced browser TTS started');
        resolve({
          success: true,
          provider: 'browser',
          duration: Date.now() - startTime
        });
      };

      utterance.onerror = (error) => {
        console.error('Browser TTS error:', error);
        resolve({
          success: false,
          error: error.error,
          provider: 'browser'
        });
      };

      speechSynthesis.speak(utterance);
    });
  }

  /**
   * Get ElevenLabs voice ID for voice name
   */
  private async getElevenLabsVoiceId(voiceName: string): Promise<string> {
    // Pre-mapped popular voice IDs to avoid API calls
    const voiceMap: Record<string, string> = {
      'Adam': 'pNInz6obpgDQGcFmaJgB',
      'Antoni': 'ErXwobaYiN019PkySvjV',
      'Arnold': 'VR6AewLTigWG4xSOukaG',
      'Bella': 'EXAVITQu4vr4xnSDxMaL',
      'Callum': 'N2lVS1w4EtoT3dr4eOWO',
      'Charlie': 'IKne3meq5aSn9XLyUdCD',
      'Charlotte': 'XB0fDUnXU5powFXDhCwa',
      'Clyde': '2EiwWnXFnvU5JabPnv8n',
      'Daniel': 'onwK4e9ZLuTAKqWW03F9',
      'Dave': 'CYw3kZ02Hs0563khs1Fj',
      'Domi': 'AZnzlk1XvdvUeBnXmlld',
      'Elli': 'MF3mGyEYCl7XYWbV9V6O',
      'Emily': 'LcfcDJNUP1GQjkzn1xUU',
      'Ethan': 'g5CIjZEefAph4nQFvHAz',
      'Fin': 'D38z5RcWu1voky8WS1ja',
      'Freya': 'jsCqWAovK2LkecY7zXl4',
      'Gigi': 'jBpfuIE2acCO8z3wKNLl',
      'Giovanni': 'zcAOhNBS3c14rBihAFp1',
      'Glinda': 'z9fAnlkpzviPz146aGWa',
      'Grace': 'oWAxZDx7w5VEj9dCyTzz',
      'Harry': 'SOYHLrjzK2X1ezoPC6cr',
      'James': '9BWtsMINqrJLrRacOk9x',
      'Jeremy': 'bVMeCyTHy58xNoL34h3p',
      'Jessie': 't0jbNlBVZ17f02VDIeMI',
      'Joseph': 'Zlb1dXrM653N07WRdFW3',
      'Josh': 'TxGEqnHWrfWFTfGW9XjX',
      'Liam': 'TX3LPaxmHKxFdv7VOQHJ',
      'Matilda': 'XrExE9yKIg1WjnnlVkGX',
      'Matthew': 'Yko7PKHZNXotIFUBG7I9',
      'Michael': 'flq6f7yk4E4fJM5XTYuZ',
      'Mimi': 'zrHiDhphv9ZnVXBqCLjz',
      'Nicole': 'piTKgcLEGmPE4e6mEKli',
      'Patrick': 'ODq5zmih8GrVes37Dizd',
      'Rachel': '21m00Tcm4TlvDq8ikWAM',
      'Ryan': 'wViXBPUzp2ZZixB1xQuM',
      'Sam': 'yoZ06aMxZJJ28mfd3POQ',
      'Sarah': 'EXAVITQu4vr4xnSDxMaL',
      'Serena': 'pMsXgVXv3BLzUgSXRplE',
      'Thomas': 'GBv7mTt0atIp3Br8iCZE'
    };

    return voiceMap[voiceName] || voiceMap['Adam']; // Default to Adam
  }

  /**
   * Prepare text for natural speech synthesis
   */
  private prepareTextForSpeech(text: string): string {
    let cleaned = text
      // Remove markdown
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/#{1,6}\s*/g, '')
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      
      // Remove special characters
      .replace(/[📹👁️🖥️😊🎯⚡💻📝🧠🌌🎨✍️🌟🔍🔬🎵🎤🔇🔊]/g, '')
      .replace(/\|/g, '. ')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      
      // Fix URLs and numbers
      .replace(/\b(https?:\/\/[^\s]+)/g, 'link')
      .replace(/\b\d{4,}/g, (match) => match.split('').join(' '))
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      
      // Add natural pauses
      .replace(/([.!?])\s+([A-Z])/g, '$1 $2')
      .replace(/,\s+/g, ', ')
      .replace(/;\s+/g, '; ')
      
      // Clean up punctuation
      .replace(/[.]{2,}/g, '.')
      .replace(/[!]{2,}/g, '!')
      .replace(/[?]{2,}/g, '?')
      
      .trim();

    // Limit length for practical processing
    if (cleaned.length > 1000) {
      cleaned = cleaned.substring(0, 997) + '...';
    }

    return cleaned;
  }

  /**
   * Set TTS configuration
   */
  setConfig(config: Partial<NaturalTTSConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): NaturalTTSConfig {
    return { ...this.config };
  }

  /**
   * Test TTS with sample text
   */
  async test(): Promise<TTSResult> {
    return this.generateSpeech("Hello! I'm Gawin with natural voice synthesis. How does this sound?");
  }

  /**
   * Stop any playing audio
   */
  stop(): void {
    // Stop browser TTS
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    // Stop other audio elements
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  /**
   * Get available voices for current provider
   */
  async getAvailableVoices(): Promise<string[]> {
    switch (this.config.provider) {
      case 'elevenlabs':
        return [
          'Adam', 'Antoni', 'Arnold', 'Bella', 'Callum', 'Charlie', 'Charlotte',
          'Clyde', 'Daniel', 'Dave', 'Domi', 'Elli', 'Emily', 'Ethan', 'Fin',
          'Freya', 'Gigi', 'Giovanni', 'Glinda', 'Grace', 'Harry', 'James',
          'Jeremy', 'Jessie', 'Joseph', 'Josh', 'Liam', 'Matilda', 'Matthew',
          'Michael', 'Mimi', 'Nicole', 'Patrick', 'Rachel', 'Ryan', 'Sam',
          'Sarah', 'Serena', 'Thomas'
        ];
      case 'openai':
        return ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
      case 'azure':
        return ['Brian', 'Davis', 'Guy', 'Jason', 'Tony', 'AIGenerate1'];
      case 'browser':
        if ('speechSynthesis' in window) {
          return speechSynthesis.getVoices().map(v => v.name);
        }
        return [];
      default:
        return [];
    }
  }
}

export const naturalTTSService = new NaturalTTSService();
export default naturalTTSService;