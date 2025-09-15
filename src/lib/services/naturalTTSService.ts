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
    voice: 'Josh', // Sexy, athletic, humble voice with smiling warmth
    model: 'eleven_multilingual_v2',
    stability: 0.7, // Higher stability for slower, more relaxed delivery
    similarityBoost: 0.8, // Moderate for humble, not overwhelming presence
    style: 0.25, // Lower style for humble, genuine warmth vs confidence
    useSpeakerBoost: true
  };

  private readonly ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY || 'sk_aa235e252db7c40de8306201fce993e19bd8852d535712ef';
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
   * ElevenLabs - Premium natural TTS with optimized speed and Tagalog support
   */
  private async useElevenLabs(text: string, config: NaturalTTSConfig): Promise<TTSResult> {
    if (!this.ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }

    const startTime = Date.now();
    
    // Get voice ID for the specified voice (cached for speed)
    const voiceId = this.getElevenLabsVoiceId(config.voice);
    
    // Enhanced Tagalog text processing
    const processedText = this.enhanceTagalogText(text);
    
    const requestBody = {
      text: processedText,
      model_id: config.model || 'eleven_multilingual_v2',
      voice_settings: {
        stability: config.stability || 0.7,
        similarity_boost: config.similarityBoost || 0.8,
        style: config.style || 0.25,
        use_speaker_boost: config.useSpeakerBoost || true
      },
      // Add pronunciation dictionary for Tagalog
      pronunciation_dictionary_locators: [{
        pronunciation_dictionary_id: 'tagalog_natural',
        version_id: 'latest'
      }]
    };

    try {
      const response = await Promise.race([
        fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.ELEVENLABS_API_KEY
          },
          body: JSON.stringify(requestBody)
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('ElevenLabs timeout')), 8000)
        )
      ]) as Response;

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
    } catch (error) {
      console.warn('ElevenLabs failed, falling back:', error);
      throw error;
    }
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
   * Get ElevenLabs voice ID for voice name (cached for speed)
   */
  private getElevenLabsVoiceId(voiceName: string): string {
    // Pre-mapped popular voice IDs to avoid API calls and reduce delay
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

    return voiceMap[voiceName] || voiceMap['Josh']; // Default to Josh for optimized masculine voice
  }

  /**
   * Enhanced Tagalog text processing with rich vocabulary integration
   */
  private enhanceTagalogText(text: string): string {
    let enhanced = text;
    
    // Rich Tagalog vocabulary enhancement
    enhanced = this.addRichTagalogVocabulary(enhanced);
    enhanced = this.processOldToModernTagalog(enhanced);
    enhanced = this.addNaturalTagalogFlow(enhanced);
    enhanced = this.optimizeTagalogPronunciation(enhanced);
    
    return enhanced;
  }

  /**
   * Add rich Tagalog vocabulary and expressions
   */
  private addRichTagalogVocabulary(text: string): string {
    return text
      // Rich descriptive words
      .replace(/\bvery good\b/gi, 'napakagaling')
      .replace(/\bawesome\b/gi, 'kahanga-hanga')
      .replace(/\bbeautiful\b/gi, 'maganda, marikit')
      .replace(/\bwonderful\b/gi, 'kahanga-hanga, nakakabilib')
      .replace(/\bexcellent\b/gi, 'napakahusay, pambihira')
      
      // Rich emotional expressions
      .replace(/\bhappy\b/gi, 'masaya, maligaya')
      .replace(/\bsad\b/gi, 'malungkot, nagluluksa')
      .replace(/\bangry\b/gi, 'galit, namumuhi')
      .replace(/\bexcited\b/gi, 'nasasabik, nasisigla')
      
      // Rich action words
      .replace(/\bthink\b/gi, 'iniisip, pinag-iisipan')
      .replace(/\bunderstand\b/gi, 'nauunawaan, nakakaintindi')
      .replace(/\bhelp\b/gi, 'tumutulong, nag-aassist')
      .replace(/\blearn\b/gi, 'natututo, nag-aaral')
      
      // Rich time expressions
      .replace(/\bnow\b/gi, 'ngayon, sa sandaling ito')
      .replace(/\blater\b/gi, 'mamaya, sa hinaharap')
      .replace(/\bbefore\b/gi, 'noon, kanina pa')
      
      // Rich Filipino interjections
      .replace(/\bwow\b/gi, 'Wow! Grabe naman!')
      .replace(/\boh\b/gi, 'Ay! Aba!')
      .replace(/\breally\b/gi, 'Talaga ba? Seryoso?');
  }

  /**
   * Process old to modern Tagalog transitions
   */
  private processOldToModernTagalog(text: string): string {
    return text
      // Old Tagalog formal expressions
      .replace(/\bkumusta ka\b/gi, 'Kumusta ka? Mabuti ka ba?')
      .replace(/\bsalamat\b/gi, 'Salamat, maraming salamat')
      .replace(/\bwalang anuman\b/gi, 'Walang anuman, walang problema')
      
      // Classical Tagalog particles
      .replace(/\bsubalit\b/gi, 'pero, ngunit')
      .replace(/\bsapagkat\b/gi, 'kasi, dahil')
      .replace(/\bdahil sa\b/gi, 'kasi, because of')
      
      // Traditional expressions
      .replace(/\bmabuhay\b/gi, 'Mabuhay! Long live!')
      .replace(/\bmaligayang\b/gi, 'Happy, masayang')
      
      // Old Filipino respect terms
      .replace(/\bpo\b/gi, 'po')
      .replace(/\bopo\b/gi, 'opo, yes po');
  }

  /**
   * Add natural Tagalog flow and rhythm
   */
  private addNaturalTagalogFlow(text: string): string {
    return text
      // Natural Tagalog sentence connectors
      .replace(/\. /g, '. Tapos, ')
      .replace(/\band\b/gi, 'at, tsaka')
      .replace(/\bbut\b/gi, 'pero, kaya lang')
      .replace(/\bso\b/gi, 'kaya, so')
      
      // Natural Filipino emphasis
      .replace(/\bvery\b/gi, 'sobrang, napaka')
      .replace(/\breally\b/gi, 'talaga, totoo')
      .replace(/\bactually\b/gi, 'actually, sa totoo lang')
      
      // Natural conversation starters
      .replace(/\bwell\b/gi, 'Well, eto na')
      .replace(/\bokay\b/gi, 'Okay, sige')
      .replace(/\balright\b/gi, 'Alright, ayos');
  }

  /**
   * Optimize Tagalog pronunciation for ElevenLabs
   */
  private optimizeTagalogPronunciation(text: string): string {
    return text
      // Optimize common Tagalog sounds
      .replace(/ng /gi, 'nang ')
      .replace(/mga /gi, 'manga ')
      .replace(/hindi /gi, 'hindee ')
      .replace(/kami /gi, 'kah-mee ')
      .replace(/kayo /gi, 'kah-yo ')
      
      // Optimize Tagalog diphthongs
      .replace(/ay /gi, 'ahy ')
      .replace(/oy /gi, 'ohy ')
      .replace(/uy /gi, 'ooy ')
      
      // Optimize glottal stops
      .replace(/ba'y /gi, 'bahy ')
      .replace(/di'y /gi, 'deey ')
      
      // Optimize rolled R sounds
      .replace(/rr/gi, 'rr')
      .replace(/^r/gi, 'rr');
  }

  /**
   * Prepare text for natural speech synthesis with Filipino and Gen-Z language understanding
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
      
      // Remove special characters but keep some Gen-Z relevant emojis for context
      .replace(/[📹👁️🖥️🎯⚡💻📝🧠🌌🎨✍️🔍🔬🎵🎤🔇🔊]/g, '')
      .replace(/\|/g, '. ')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      
      // Fix URLs and numbers
      .replace(/\b(https?:\/\/[^\s]+)/g, 'link')
      .replace(/\b\d{4,}/g, (match) => match.split('').join(' '))
      .replace(/([a-z])([A-Z])/g, '$1 $2');

    // Process Filipino-English code-switching and generational slang
    cleaned = this.processFilipinoBilingualText(cleaned);
    cleaned = this.processGenerationalLanguage(cleaned);
    
    // Add natural pauses
    cleaned = cleaned
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
   * Process Filipino-English bilingual text for natural pronunciation with enhanced vocabulary
   */
  private processFilipinoBilingualText(text: string): string {
    // Handle common Filipino particles and expressions with rich vocabulary
    return text
      // Enhanced Filipino expressions with deeper meaning
      .replace(/\bpara sa\b/gi, 'para sa, alang-alang sa')
      .replace(/\bnang\b/gi, 'nang, noong')
      .replace(/\bng\b/gi, 'ng')
      .replace(/\bsa\b/gi, 'sa, doon sa')
      .replace(/\bang\b/gi, 'ang, yung')
      .replace(/\bsi\b/gi, 'si, kay')
      .replace(/\bni\b/gi, 'ni, kay')
      .replace(/\bkay\b/gi, 'kay, para kay')
      
      // Rich code-switching transitions with natural flow
      .replace(/\b(tapos|then)\b/gi, '$1, pagkatapos')
      .replace(/\b(kasi|because)\b/gi, '$1, dahil')
      .replace(/\b(pero|but)\b/gi, '$1, kaya lang')
      .replace(/\b(sige|okay)\b/gi, '$1, ayos')
      
      // Enhanced Filipino time expressions
      .replace(/\bngayon\b/gi, 'ngayon, sa sandaling ito')
      .replace(/\bkanina\b/gi, 'kanina, kaninang umaga')
      .replace(/\bmamaya\b/gi, 'mamaya, sa susunod')
      .replace(/\bbukas\b/gi, 'bukas, sa hinaharap')
      .replace(/\bkahapon\b/gi, 'kahapon, nakaraan')
      
      // Enhanced Taglish patterns with natural masculine flow
      .replace(/\b(yung|yung)\b/gi, 'yung, yung mga')
      .replace(/\b(dun|doon)\b/gi, 'doon, sa lugar na yun')
      .replace(/\b(dito)\b/gi, 'dito, sa lugar na ito')
      .replace(/\b(ganun|ganoon)\b/gi, 'ganoon, ganun nga')
      
      // Enhanced masculine expressions
      .replace(/\bpre\b/gi, 'pre, brad')
      .replace(/\btol\b/gi, 'tol, kaibigan')
      .replace(/\bboss\b/gi, 'boss, chief')
      .replace(/\btropa\b/gi, 'tropa, mga kaibigan');
  }

  /**
   * Process Gen-Z, Gen-Alpha, and Millennial language patterns
   */
  private processGenerationalLanguage(text: string): string {
    return text
      // Gen-Z/Gen-Alpha slang
      .replace(/\bno cap\b/gi, 'no cap')
      .replace(/\bfr\b/gi, 'for real')
      .replace(/\bbet\b/gi, 'bet')
      .replace(/\bslay\b/gi, 'slay')
      .replace(/\bperiod\b/gi, 'period')
      .replace(/\bvibe check\b/gi, 'vibe check')
      .replace(/\bmid\b/gi, 'mid')
      .replace(/\bbussin\b/gi, 'bussin')
      .replace(/\bskibidi\b/gi, 'skibidi')
      .replace(/\bsigma\b/gi, 'sigma')
      .replace(/\brizzler\b/gi, 'rizzler')
      .replace(/\bgyat\b/gi, 'gyat')
      .replace(/\bfanum tax\b/gi, 'fanum tax')
      .replace(/\bohio\b/gi, 'ohio')
      
      // Millennial expressions
      .replace(/\bokay boomer\b/gi, 'okay boomer')
      .replace(/\bthat slaps\b/gi, 'that slaps')
      .replace(/\bI can\'t even\b/gi, 'I can\'t even')
      .replace(/\bbasic\b/gi, 'basic')
      .replace(/\bextra\b/gi, 'extra')
      .replace(/\bsalty\b/gi, 'salty')
      .replace(/\bthirsty\b/gi, 'thirsty')
      .replace(/\bflex\b/gi, 'flex')
      .replace(/\bsimp\b/gi, 'simp')
      
      // Filipino Gen-Z expressions
      .replace(/\bcharot\b/gi, 'charot')
      .replace(/\bchz\b/gi, 'cheese')
      .replace(/\bawit\b/gi, 'awit')
      .replace(/\bbet na bet\b/gi, 'bet na bet')
      .replace(/\bpre\b/gi, 'pre')
      .replace(/\bmars\b/gi, 'mars')
      .replace(/\bbeh\b/gi, 'beh')
      .replace(/\bshems\b/gi, 'shems')
      .replace(/\bgurl\b/gi, 'girl')
      .replace(/\bpano\b/gi, 'paano')
      .replace(/\bano ba\b/gi, 'ano ba')
      .replace(/\bgrabe\b/gi, 'grabe')
      .replace(/\bsayang\b/gi, 'sayang')
      .replace(/\banggas\b/gi, 'anggas')
      .replace(/\bwerpa\b/gi, 'werpa')
      .replace(/\bpetmalu\b/gi, 'petmalu')
      .replace(/\bbeki\b/gi, 'beki')
      .replace(/\bchurvs\b/gi, 'chuchu');
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
   * Get available voices optimized for Filipino mid-20s speakers
   */
  async getAvailableVoices(): Promise<string[]> {
    switch (this.config.provider) {
      case 'elevenlabs':
        return [
          // Prioritized Filipino mid-20s optimized voices
          'Adam', 'Josh', 'Sam', 'Ethan', 'Liam', // Male mid-20s voices
          'Bella', 'Emily', 'Grace', 'Nicole', 'Sarah', // Female mid-20s voices
          'Daniel', 'Ryan', 'Michael', 'Thomas', // Professional male alternatives
          'Rachel', 'Serena', 'Charlotte', 'Freya', // Professional female alternatives
          'Antoni', 'Callum', 'Charlie', 'Clyde', 'Dave', 'Fin', 'Harry', 'James',
          'Jeremy', 'Joseph', 'Matthew', 'Patrick', // Additional male options
          'Domi', 'Elli', 'Gigi', 'Jessie', 'Matilda', 'Mimi' // Additional female options
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

  /**
   * Get Filipino-optimized voice recommendations
   */
  getFilipinoBilingualVoices(): { male: string[], female: string[] } {
    return {
      male: [
        'Josh',    // Sexy, athletic, humble - slower pace, smiling warmth
        'Adam',    // Alternative warm voice - humble backup for Josh
        'Ethan',   // Smooth, relaxed, engaging - ideal for unhurried conversations
        'Liam',    // Casual, humble, warm - perfect for willing-to-talk chats
        'Sam'      // Confident but humble - good for relaxed discussions
      ],
      female: [
        'Bella',   // Warm, professional, approachable - perfect for Filipino mid-20s female
        'Emily',   // Friendly, clear, natural - great for everyday conversation
        'Grace',   // Elegant, sophisticated, modern - good for professional content
        'Nicole',  // Confident, engaging, attractive - ideal for dynamic content
        'Sarah'    // Versatile, natural, relatable - perfect for casual conversation
      ]
    };
  }
}

export const naturalTTSService = new NaturalTTSService();
export default naturalTTSService;