import { validationService } from './validationService';
import { systemGuardianService } from './systemGuardianService';

// Dataset and enhanced AI capabilities interfaces
export interface DatasetRequest {
  dataset: string;
  config?: string;
  split?: string;
  streaming?: boolean;
  features?: string[];
}

export interface AudioAnalysisResult {
  classification: string;
  confidence: number;
  transcription?: string;
  emotion?: string;
  language?: string;
  embeddings?: number[];
  features?: any;
}

export interface VisionAnalysisResult {
  classification: string;
  confidence: number;
  objects?: any[];
  scene?: string;
  emotions?: any[];
  text?: string;
  description?: string;
  features?: any;
}

export interface TextAnalysisResult {
  classification?: string;
  sentiment?: string;
  confidence: number;
  emotions?: string[];
  intent?: string;
  topics?: string[];
  complexity?: number;
  embeddings?: number[];
  features?: any;
}

export interface TTSResult {
  success: boolean;
  audioUrl?: string;
  audioBlob?: Blob;
  error?: string;
  voice?: string;
  language?: string;
}

export interface HuggingFaceMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface HuggingFaceRequest {
  messages: HuggingFaceMessage[];
  action?: 'chat' | 'code' | 'analysis' | 'writing' | 'image';
  module?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface HuggingFaceResponse {
  success: boolean;
  data?: {
    response: string;
    model_used: string;
    task_type: string;
    processing_time?: number;
  };
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Model configurations for different tasks
const MODEL_CONFIG = {
  stem: {
    model: 'microsoft/DeepSeek-R1-Distill-Qwen-32B',
    description: 'STEM subjects and complex analysis',
    max_tokens: 4096,
    temperature: 0.7
  },
  coding: {
    model: 'deepseek-ai/DeepSeek-Coder-V2-Instruct-236B',
    description: 'Programming and code generation',
    max_tokens: 8192,
    temperature: 0.3
  },
  writing: {
    model: 'Qwen/Qwen2.5-72B-Instruct',
    description: 'Language and writing tasks',
    max_tokens: 4096,
    temperature: 0.8
  },
  analysis: {
    model: 'microsoft/DeepSeek-R1-Distill-Qwen-32B',
    description: 'Research and complex analysis',
    max_tokens: 6144,
    temperature: 0.4
  },
  general: {
    model: 'Qwen/Qwen2.5-72B-Instruct',
    description: 'General conversation',
    max_tokens: 2048,
    temperature: 0.7
  }
};

class HuggingFaceService {
  private static instance: HuggingFaceService;
  private apiKey: string;
  private baseURL: string = 'https://api-inference.huggingface.co/models';

  constructor() {
    // Try to get API key from environment variable first, then from browser localStorage
    this.apiKey = process.env.HUGGINGFACE_API_KEY || process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || '';
    
    if (!this.apiKey && typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('huggingface_api_key');
      if (storedKey) {
        this.apiKey = storedKey;
      }
    }
    
    if (!this.apiKey) {
      console.warn('⚠️ Hugging Face API key not found. Service will not work properly.');
    } else {
      console.log('🤖 Hugging Face Pro API key configured successfully');
    }
  }

  static getInstance(): HuggingFaceService {
    if (!HuggingFaceService.instance) {
      HuggingFaceService.instance = new HuggingFaceService();
    }
    return HuggingFaceService.instance;
  }

  /**
   * Determine the best model based on the request content and action
   */
  private determineTaskType(request: HuggingFaceRequest): keyof typeof MODEL_CONFIG {
    const { action, messages } = request;
    
    // Check explicit action first
    if (action) {
      switch (action) {
        case 'code': return 'coding';
        case 'analysis': return 'analysis';
        case 'writing': return 'writing';
        default: break;
      }
    }

    // Analyze message content
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    
    // STEM subjects detection
    if (/math|physics|chemistry|biology|calculus|algebra|equation|formula|scientific|theorem|hypothesis|experiment/.test(lastMessage)) {
      return 'stem';
    }
    
    // Coding detection
    if (/code|program|function|class|variable|debug|algorithm|javascript|python|react|typescript|css|html/.test(lastMessage)) {
      return 'coding';
    }
    
    // Analysis/Research detection
    if (/analyze|research|compare|evaluate|investigate|study|examine|explain.*why|what.*causes|how.*works/.test(lastMessage)) {
      return 'analysis';
    }
    
    // Writing detection
    if (/write|essay|story|letter|email|article|blog|creative|compose|grammar|spelling/.test(lastMessage)) {
      return 'writing';
    }
    
    return 'general';
  }

  /**
   * Main chat completion method
   */
  async createChatCompletion(request: HuggingFaceRequest): Promise<HuggingFaceResponse> {
    const startTime = Date.now();
    
    try {
      // Validation and security checks
      if (!this.apiKey) {
        return {
          success: false,
          error: 'Hugging Face API key not configured'
        };
      }

      // Validate and filter messages
      const validatedMessages = await this.validateMessages(request.messages);
      if (validatedMessages.length === 0) {
        return {
          success: false,
          error: 'No valid messages provided'
        };
      }

      // Determine the best model for this task
      const taskType = this.determineTaskType(request);
      const modelConfig = MODEL_CONFIG[taskType];
      
      console.log(`🤖 Using ${taskType} model: ${modelConfig.model}`);

      // Prepare the request
      const payload = {
        inputs: this.formatMessagesForHF(validatedMessages),
        parameters: {
          max_new_tokens: request.max_tokens || modelConfig.max_tokens,
          temperature: request.temperature || modelConfig.temperature,
          return_full_text: false,
          do_sample: true,
          top_p: 0.95,
          stop: ["<|im_end|>", "<|endoftext|>"]
        }
      };

      // Make API request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${this.baseURL}/${modelConfig.model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Hugging Face API error:', response.status, errorData);
        return {
          success: false,
          error: `API request failed: ${response.status} ${errorData}`
        };
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      // Extract response text
      let responseText = '';
      if (Array.isArray(data) && data[0]?.generated_text) {
        responseText = data[0].generated_text.trim();
      } else if (data.generated_text) {
        responseText = data.generated_text.trim();
      } else {
        return {
          success: false,
          error: 'Unexpected response format from Hugging Face API'
        };
      }

      // Post-process the response
      const cleanResponse = await this.postProcessResponse(responseText, taskType);

      return {
        success: true,
        data: {
          response: cleanResponse,
          model_used: modelConfig.model,
          task_type: taskType,
          processing_time: processingTime
        },
        usage: {
          prompt_tokens: this.estimateTokens(payload.inputs),
          completion_tokens: this.estimateTokens(cleanResponse),
          total_tokens: this.estimateTokens(payload.inputs + cleanResponse)
        }
      };

    } catch (error) {
      console.error('Hugging Face service error:', error);
      
      // Handle timeout/abort errors specifically
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: 'API request timeout - service unavailable'
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Generate images using FLUX.1-dev with fallback options
   */
  async generateImage(prompt: string, options?: {
    width?: number;
    height?: number;
    num_inference_steps?: number;
    guidance_scale?: number;
  }): Promise<{ success: boolean; data?: { image_url: string } | null; error?: string }> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: 'Hugging Face API key not configured'
        };
      }

      // Validate prompt
      const validation = validationService.validateTextInput(prompt);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Invalid or inappropriate prompt'
        };
      }

      // Try multiple models in order of preference
      const modelAttempts = [
        {
          model: 'kandinsky-community/kandinsky-3',
          name: 'Kandinsky 3.0',
          steps: 25,
          timeout: 35000,
          width: options?.width || 1024,
          height: options?.height || 1024
        },
        {
          model: 'kandinsky-community/kandinsky-2-2-decoder',
          name: 'Kandinsky 2.2',
          steps: 50,
          timeout: 30000,
          width: options?.width || 768,
          height: options?.height || 768
        },
        {
          model: 'stabilityai/stable-diffusion-xl-base-1.0',
          name: 'Stable Diffusion XL',
          steps: 20,
          timeout: 25000,
          width: options?.width || 1024,
          height: options?.height || 1024
        },
        {
          model: 'runwayml/stable-diffusion-v1-5',
          name: 'Stable Diffusion v1.5',
          steps: 20,
          timeout: 20000,
          width: options?.width || 512,
          height: options?.height || 512
        }
      ];

      for (const attempt of modelAttempts) {
        try {
          console.log(`🎨 Trying image generation with ${attempt.name}...`);

          // Prepare payload based on model type
          let payload;
          
          if (attempt.model.includes('kandinsky')) {
            // Kandinsky models use different parameter structure
            payload = {
              inputs: prompt,
              parameters: {
                width: attempt.width,
                height: attempt.height,
                num_inference_steps: attempt.steps,
                guidance_scale: options?.guidance_scale || 7.0,
                prior_guidance_scale: 1.0,
                prior_num_inference_steps: 10
              }
            };
          } else {
            // Standard Stable Diffusion models
            payload = {
              inputs: prompt,
              parameters: {
                width: attempt.width,
                height: attempt.height,
                num_inference_steps: attempt.steps,
                guidance_scale: options?.guidance_scale || 7.5
              }
            };
          }

          // Create abort controller for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), attempt.timeout);

          const response = await fetch(`${this.baseURL}/${attempt.model}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            console.warn(`${attempt.name} failed:`, response.status, errorText.slice(0, 200));
            
            // If it's a 504 or 503, try the next model
            if (response.status === 504 || response.status === 503) {
              continue;
            }
            
            // For other errors, return the error
            return {
              success: false,
              error: `Image generation failed with ${attempt.name}: ${response.status}`
            };
          }

          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);

          console.log(`✅ Successfully generated image with ${attempt.name}`);

          return {
            success: true,
            data: { image_url: imageUrl }
          };

        } catch (error) {
          console.warn(`${attempt.name} error:`, error);
          
          // If it's a timeout or network error, try next model
          if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('fetch'))) {
            console.log(`⏰ ${attempt.name} timed out, trying next model...`);
            continue;
          }
          
          // For other errors, continue to next model
          continue;
        }
      }

      // If all models failed, return a helpful error
      return {
        success: false,
        error: 'All image generation models are currently unavailable. The Hugging Face inference API might be overloaded. Please try again in a few moments.'
      };

    } catch (error) {
      console.error('Image generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image generation failed'
      };
    }
  }

  /**
   * Format messages for Hugging Face chat format
   */
  private formatMessagesForHF(messages: HuggingFaceMessage[]): string {
    let formatted = '';
    
    for (const message of messages) {
      if (message.role === 'system') {
        formatted += `<|im_start|>system\n${message.content}<|im_end|>\n`;
      } else if (message.role === 'user') {
        formatted += `<|im_start|>user\n${message.content}<|im_end|>\n`;
      } else if (message.role === 'assistant') {
        formatted += `<|im_start|>assistant\n${message.content}<|im_end|>\n`;
      }
    }
    
    formatted += '<|im_start|>assistant\n';
    return formatted;
  }

  /**
   * Validate and filter messages
   */
  private async validateMessages(messages: HuggingFaceMessage[]): Promise<HuggingFaceMessage[]> {
    const validMessages: HuggingFaceMessage[] = [];
    
    for (const message of messages) {
      try {
        const validation = validationService.validateTextInput(message.content);
        if (validation.isValid) {
          validMessages.push(message);
        } else {
          console.warn('Message filtered out:', validation.errors);
        }
      } catch (error) {
        console.warn('Message validation failed:', error);
      }
    }
    
    return validMessages;
  }

  /**
   * Post-process response based on task type
   */
  private async postProcessResponse(response: string, taskType: keyof typeof MODEL_CONFIG): Promise<string> {
    let cleaned = response;
    
    // Remove common artifacts
    cleaned = cleaned.replace(/<\|im_end\|>[\s\S]*$/, '');
    cleaned = cleaned.replace(/<\|endoftext\|>[\s\S]*$/, '');
    cleaned = cleaned.replace(/^assistant\s*:?\s*/i, '');
    cleaned = cleaned.trim();
    
    // Task-specific processing
    switch (taskType) {
      case 'coding':
        // Ensure code blocks are properly formatted
        if (cleaned.includes('```') && !cleaned.endsWith('```')) {
          cleaned += '\n```';
        }
        break;
      
      case 'stem':
        // Ensure mathematical expressions are clear
        cleaned = cleaned.replace(/\$\$([^$]+)\$\$/g, '$$\n$1\n$$');
        break;
      
      case 'writing':
        // Clean up extra spaces and ensure proper punctuation
        cleaned = cleaned.replace(/\s+/g, ' ');
        cleaned = cleaned.replace(/([.!?])\s*([a-z])/g, '$1 $2');
        break;
    }
    
    // Final validation using text input validation
    const validation = validationService.validateTextInput(cleaned);
    if (!validation.isValid) {
      console.warn('Response validation failed:', validation.errors);
      return 'I apologize, but I cannot provide that response due to content policy restrictions.';
    }
    
    return cleaned;
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Get available models info
   */
  getAvailableModels() {
    return MODEL_CONFIG;
  }

  /**
   * Enhanced audio analysis using Hugging Face models (MInDS-14 dataset approach)
   */
  async analyzeAudio(audioData: Blob | ArrayBuffer, task: 'classification' | 'transcription' | 'emotion' = 'transcription'): Promise<AudioAnalysisResult> {
    try {
      let model: string;
      
      switch (task) {
        case 'transcription':
          model = 'openai/whisper-base';
          break;
        case 'emotion':
          model = 'ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition';
          break;
        case 'classification':
          model = 'facebook/wav2vec2-base-960h';
          break;
        default:
          model = 'openai/whisper-base';
      }
      
      // Convert audio data to base64
      const base64Audio = await this.blobToBase64(audioData);
      
      const result = await this.queryInferenceAPI(`/models/${model}`, {
        inputs: base64Audio,
        options: {
          use_cache: true,
          wait_for_model: true
        }
      });

      if (task === 'transcription') {
        return {
          classification: 'transcription',
          confidence: 0.9,
          transcription: result.text || result.generated_text || '',
          language: 'en'
        };
      } else if (task === 'emotion') {
        return {
          classification: result[0]?.label || 'neutral',
          confidence: result[0]?.score || 0,
          emotion: result[0]?.label || 'neutral'
        };
      } else {
        return {
          classification: result[0]?.label || 'speech',
          confidence: result[0]?.score || 0,
          embeddings: result.embeddings
        };
      }
    } catch (error) {
      console.error('❌ Audio analysis failed:', error);
      return {
        classification: 'error',
        confidence: 0,
        transcription: '',
        emotion: 'neutral'
      };
    }
  }

  /**
   * Enhanced vision analysis using multiple models (Beans dataset approach)
   */
  async analyzeImage(imageData: Blob | string, task: 'classification' | 'object-detection' | 'scene' = 'classification'): Promise<VisionAnalysisResult> {
    try {
      const results = await Promise.allSettled([
        // Object detection
        this.queryInferenceAPI('/models/facebook/detr-resnet-50', {
          inputs: typeof imageData === 'string' ? imageData : await this.blobToBase64(imageData)
        }),
        
        // Scene classification
        this.queryInferenceAPI('/models/microsoft/resnet-50', {
          inputs: typeof imageData === 'string' ? imageData : await this.blobToBase64(imageData)
        }),
        
        // Emotion detection in faces
        this.queryInferenceAPI('/models/dima806/facial_emotions_image_detection', {
          inputs: typeof imageData === 'string' ? imageData : await this.blobToBase64(imageData)
        }),
        
        // Text extraction (OCR)
        this.queryInferenceAPI('/models/microsoft/trocr-base-printed', {
          inputs: typeof imageData === 'string' ? imageData : await this.blobToBase64(imageData)
        })
      ]);

      const objects = results[0].status === 'fulfilled' ? results[0].value : [];
      const sceneResult = results[1].status === 'fulfilled' ? results[1].value : [];
      const emotionResult = results[2].status === 'fulfilled' ? results[2].value : [];
      const textResult = results[3].status === 'fulfilled' ? results[3].value : null;

      const scene = Array.isArray(sceneResult) && sceneResult[0]?.label || 'indoor';
      const emotions = Array.isArray(emotionResult) ? emotionResult : [];
      const text = textResult?.generated_text || '';

      // Generate intelligent description
      const description = this.generateSceneDescription(objects, scene, emotions, text);

      return {
        classification: scene,
        confidence: Array.isArray(sceneResult) && sceneResult[0]?.score || 0.7,
        objects: Array.isArray(objects) ? objects : [],
        scene,
        emotions,
        text,
        description
      };
    } catch (error) {
      console.error('❌ Vision analysis failed:', error);
      return {
        classification: 'error',
        confidence: 0,
        objects: [],
        scene: 'unknown',
        description: 'Unable to analyze image'
      };
    }
  }

  /**
   * Enhanced text understanding using GLUE dataset approach
   */
  async analyzeText(text: string, task: 'sentiment' | 'classification' | 'embeddings' | 'intent' = 'sentiment'): Promise<TextAnalysisResult> {
    try {
      const results = await Promise.allSettled([
        // Sentiment analysis
        this.queryInferenceAPI('/models/cardiffnlp/twitter-roberta-base-sentiment-latest', {
          inputs: text
        }),
        
        // Emotion detection
        this.queryInferenceAPI('/models/j-hartmann/emotion-english-distilroberta-base', {
          inputs: text
        }),
        
        // Intent classification (simplified)
        this.queryInferenceAPI('/models/microsoft/DialoGPT-medium', {
          inputs: text
        }),
        
        // Embeddings for semantic understanding
        this.queryInferenceAPI('/models/sentence-transformers/all-MiniLM-L6-v2', {
          inputs: text
        })
      ]);

      const sentimentResult = results[0].status === 'fulfilled' ? results[0].value : [];
      const emotionResult = results[1].status === 'fulfilled' ? results[1].value : [];
      const embeddingResult = results[3].status === 'fulfilled' ? results[3].value : [];

      const sentiment = Array.isArray(sentimentResult) && sentimentResult[0]?.label || 'neutral';
      const emotions = Array.isArray(emotionResult) ? emotionResult.map((e: any) => e.label) : ['neutral'];
      const embeddings = Array.isArray(embeddingResult) ? embeddingResult : [];

      // Extract topics and calculate complexity
      const topics = this.extractTopics(text);
      const complexity = this.calculateTextComplexity(text);
      const intent = this.detectIntent(text);

      return {
        classification: sentiment,
        sentiment,
        confidence: Array.isArray(sentimentResult) && sentimentResult[0]?.score || 0.7,
        emotions,
        intent,
        topics,
        complexity,
        embeddings
      };
    } catch (error) {
      console.error('❌ Text analysis failed:', error);
      return {
        classification: 'error',
        sentiment: 'neutral',
        confidence: 0,
        emotions: ['neutral'],
        intent: 'conversation',
        topics: [],
        complexity: 0.5
      };
    }
  }

  /**
   * Query Hugging Face Inference API
   */
  private async queryInferenceAPI(endpoint: string, payload: any): Promise<any> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Convert blob to base64 for API transmission
   */
  private async blobToBase64(blob: Blob | ArrayBuffer): Promise<string> {
    if (blob instanceof ArrayBuffer) {
      const uint8Array = new Uint8Array(blob);
      const binaryString = Array.from(uint8Array).map(byte => String.fromCharCode(byte)).join('');
      return btoa(binaryString);
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]); // Remove data URL prefix
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Generate intelligent scene description
   */
  private generateSceneDescription(objects: any[], scene: string, emotions: any[], text: string): string {
    let description = `I can see a ${scene} scene`;
    
    if (Array.isArray(objects) && objects.length > 0) {
      const objectNames = objects.map(obj => obj.label || obj.name).slice(0, 3);
      description += ` with ${objectNames.join(', ')}`;
    }

    if (Array.isArray(emotions) && emotions.length > 0) {
      const dominantEmotion = emotions[0]?.label || 'neutral';
      description += `. The facial expression appears ${dominantEmotion}`;
    }

    if (text && text.trim()) {
      description += `. I can read some text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`;
    }

    return description + '.';
  }

  /**
   * Extract topics from text using keyword analysis
   */
  private extractTopics(text: string): string[] {
    const commonTopics = [
      'technology', 'programming', 'ai', 'machine learning', 'web development',
      'education', 'learning', 'study', 'homework', 'research',
      'work', 'career', 'business', 'project', 'task',
      'health', 'fitness', 'food', 'travel', 'entertainment',
      'family', 'friends', 'relationship', 'personal', 'emotions'
    ];

    const lowerText = text.toLowerCase();
    return commonTopics.filter(topic => lowerText.includes(topic));
  }

  /**
   * Calculate text complexity score
   */
  private calculateTextComplexity(text: string): number {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;
    const longWords = text.split(/\s+/).filter(word => word.length > 6).length;
    
    // Simple complexity score (0-1)
    const complexity = Math.min(1, (avgWordsPerSentence / 20) + (longWords / words));
    return Math.round(complexity * 100) / 100;
  }


  /**
   * Set API key for Pro access
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    console.log('🔑 Hugging Face Pro API key updated');
  }

  /**
   * Check if Pro access is available
   */
  hasProAccess(): boolean {
    return !!this.apiKey && this.apiKey.length > 10;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'offline'; message: string }> {
    try {
      if (!this.apiKey) {
        return { status: 'offline', message: 'API key not configured' };
      }

      // Simple test request
      const testResponse = await this.createChatCompletion({
        messages: [
          { role: 'user', content: 'Hello, respond with just "OK"' }
        ]
      });

      if (testResponse.success) {
        return { status: 'healthy', message: 'All models operational' };
      } else {
        return { status: 'degraded', message: testResponse.error || 'Service issues detected' };
      }
    } catch (error) {
      return { status: 'offline', message: 'Service unavailable' };
    }
  }

  /**
   * Generate natural speech using Hugging Face TTS models
   */
  async generateSpeech(text: string, options: {
    voice?: 'male' | 'female';
    language?: 'en' | 'fil' | 'tl';
    emotion?: 'neutral' | 'friendly' | 'excited' | 'calm';
    speed?: number;
  } = {}): Promise<TTSResult> {
    if (!this.hasProAccess()) {
      return {
        success: false,
        error: 'TTS requires Pro access. Please configure your API key.'
      };
    }

    try {
      const { voice = 'male', language = 'en', emotion = 'neutral', speed = 1.0 } = options;
      
      // Select appropriate TTS model based on language and voice
      const model = this.selectTTSModel(language, voice);
      
      // Prepare text with prosody markers for more natural speech
      const processedText = this.prepareTextForTTS(text, language, emotion);
      
      const response = await this.queryInferenceAPI(`/models/${model}`, {
        inputs: processedText,
        parameters: {
          return_tensors: false,
          sampling_rate: 16000,
          speed: speed,
          emotion: emotion
        }
      });

      if (response && response instanceof ArrayBuffer) {
        const audioBlob = new Blob([response], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        return {
          success: true,
          audioUrl,
          audioBlob,
          voice: `${voice}-${language}`,
          language
        };
      }

      // For now, fail gracefully to allow browser TTS fallback
      return {
        success: false,
        error: 'HuggingFace TTS models currently unavailable - using browser TTS fallback'
      };
      
    } catch (error) {
      console.error('HuggingFace TTS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'TTS generation failed'
      };
    }
  }

  /**
   * Select optimal TTS model based on language and voice preferences
   */
  private selectTTSModel(language: string, voice: string): string {
    const models = {
      'en-male': 'microsoft/speecht5_tts',
      'en-female': 'facebook/mms-tts-eng',
      'fil-male': 'facebook/mms-tts-tgl',
      'fil-female': 'facebook/mms-tts-tgl',
      'tl-male': 'facebook/mms-tts-tgl',
      'tl-female': 'facebook/mms-tts-tgl'
    };

    const key = `${language}-${voice}` as keyof typeof models;
    return models[key] || models['en-male'];
  }

  /**
   * Prepare text for more natural TTS with prosody
   */
  private prepareTextForTTS(text: string, language: string, emotion: string): string {
    let processedText = text;

    // Clean up text for speech
    processedText = processedText
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .replace(/\*(.*?)\*/g, '$1') // Remove markdown italic
      .replace(/`(.*?)`/g, '$1') // Remove code backticks
      .replace(/#{1,6}\s*/g, '') // Remove headers
      .replace(/\n+/g, '. ') // Convert newlines to periods
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    // Add natural pauses and emphasis based on language
    if (language === 'fil' || language === 'tl') {
      // Filipino prosody patterns
      processedText = processedText
        .replace(/\b(kumusta|salamat|pakisuyo|makakakuha)\b/gi, '$& ') // Natural pauses
        .replace(/\b(naman|lang|kasi|talaga)\b/gi, ' $&') // Particle emphasis
        .replace(/\b(po|opo|hindi po)\b/gi, '$& '); // Respectful markers
    }

    // Emotion-based adjustments
    switch (emotion) {
      case 'friendly':
        processedText = `<speak rate="medium" volume="medium">${processedText}</speak>`;
        break;
      case 'excited':
        processedText = `<speak rate="fast" volume="loud">${processedText}</speak>`;
        break;
      case 'calm':
        processedText = `<speak rate="slow" volume="soft">${processedText}</speak>`;
        break;
      default:
        processedText = `<speak rate="medium" volume="medium">${processedText}</speak>`;
    }

    return processedText;
  }

  /**
   * Fallback to Azure TTS for better quality when needed
   */
  private async useAzureTTS(text: string, options: any): Promise<TTSResult> {
    try {
      // This would require Azure Speech Services key
      // For now, return error to fall back to browser TTS
      return {
        success: false,
        error: 'Azure TTS not configured - falling back to browser speech'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Azure TTS fallback failed'
      };
    }
  }

  /**
   * Enhanced voice recognition with Tagalog/Taglish support
   */
  async enhanceVoiceRecognition(audioBlob: Blob): Promise<{
    transcription: string;
    confidence: number;
    language: string;
    emotion?: string;
    intent?: string;
  }> {
    if (!this.hasProAccess()) {
      throw new Error('Enhanced voice recognition requires Pro access');
    }

    try {
      // Use Whisper model for high-quality transcription
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      
      const response = await fetch('https://api-inference.huggingface.co/models/openai/whisper-large-v3', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.status}`);
      }

      const result = await response.json();
      const transcription = result.text || '';

      // Analyze language and emotion
      const languageAnalysis = this.detectLanguageAdvanced(transcription);
      const emotionAnalysis = await this.analyzeEmotionFromText(transcription);

      return {
        transcription,
        confidence: result.confidence || 0.8,
        language: languageAnalysis.primary,
        emotion: emotionAnalysis.primary,
        intent: this.detectIntent(transcription)
      };

    } catch (error) {
      console.error('Enhanced voice recognition error:', error);
      throw error;
    }
  }

  /**
   * Advanced language detection for Filipino/English/Taglish
   */
  private detectLanguageAdvanced(text: string): { primary: string; confidence: number; mixed: boolean } {
    const filipinoWords = [
      'ako', 'ikaw', 'siya', 'kami', 'kayo', 'sila', 'ang', 'ng', 'sa', 'ko', 'mo', 'niya',
      'kumusta', 'salamat', 'oo', 'hindi', 'tara', 'kaya', 'naman', 'lang', 'mga', 'para',
      'gusto', 'ayaw', 'mahal', 'galit', 'tuwa', 'lungkot', 'takot', 'sulit', 'maganda',
      'pangit', 'mabait', 'masama', 'malaki', 'maliit', 'mahaba', 'maikli', 'matanda'
    ];

    const words = text.toLowerCase().split(/\s+/);
    const filipinoCount = words.filter(word => 
      filipinoWords.includes(word.replace(/[^\w]/g, ''))
    ).length;
    
    const totalWords = words.length;
    const filipinoRatio = filipinoCount / totalWords;

    if (filipinoRatio > 0.7) {
      return { primary: 'filipino', confidence: 0.9, mixed: false };
    } else if (filipinoRatio > 0.3) {
      return { primary: 'taglish', confidence: 0.8, mixed: true };
    } else {
      return { primary: 'english', confidence: 0.85, mixed: false };
    }
  }

  /**
   * Detect emotion from text content
   */
  private async analyzeEmotionFromText(text: string): Promise<{ primary: string; confidence: number }> {
    try {
      const response = await this.queryInferenceAPI('/models/j-hartmann/emotion-english-distilroberta-base', {
        inputs: text
      });

      if (response && Array.isArray(response) && response.length > 0) {
        const emotions = response[0];
        const topEmotion = emotions.reduce((max: any, current: any) => 
          current.score > max.score ? current : max
        );

        return {
          primary: topEmotion.label.toLowerCase(),
          confidence: topEmotion.score
        };
      }
    } catch (error) {
      console.error('Emotion analysis error:', error);
    }

    return { primary: 'neutral', confidence: 0.5 };
  }

  /**
   * Detect intent from transcribed text
   */
  private detectIntent(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('search') || lowerText.includes('find') || lowerText.includes('hanap')) {
      return 'search';
    } else if (lowerText.includes('help') || lowerText.includes('tulong')) {
      return 'help';
    } else if (lowerText.includes('create') || lowerText.includes('make') || lowerText.includes('gawa')) {
      return 'create';
    } else if (lowerText.includes('question') || lowerText.includes('ask') || lowerText.includes('tanong')) {
      return 'question';
    } else {
      return 'conversation';
    }
  }
}

// Export singleton instance
export const huggingFaceService = HuggingFaceService.getInstance();
export default huggingFaceService;