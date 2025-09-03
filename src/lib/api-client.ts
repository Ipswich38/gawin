// API Client for Next.js secure endpoints
// This replaces direct API calls with server-side proxied requests

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Removed GroqResponse interface - now using OpenRouter

export interface ImageGenerationOptions {
  provider?: 'huggingface' | 'pollinations' | 'deepai';
  width?: number;
  height?: number;
  style?: string;
  num_inference_steps?: number;
  guidance_scale?: number;
}

export interface OCRResult {
  text: string;
  language: string;
  confidence: number;
}

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : process.env.NEXT_PUBLIC_API_URL || '';
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/api${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Hugging Face Pro models
  async chatHuggingFace(
    messages: AIMessage[],
    action?: 'chat' | 'code' | 'analysis' | 'writing',
    options: any = {}
  ): Promise<any> {
    return this.request('/huggingface', {
      method: 'POST',
      body: JSON.stringify({
        messages,
        action,
        ...options,
      }),
    });
  }

  // DeepSeek Chat (fallback)
  async chatDeepSeek(
    messages: AIMessage[],
    model: string = 'deepseek-chat',
    options: any = {}
  ): Promise<any> {
    return this.request('/deepseek', {
      method: 'POST',
      body: JSON.stringify({
        messages,
        model,
        ...options,
      }),
    });
  }

  // Perplexity AI with web search
  async chatPerplexity(
    messages: AIMessage[],
    model: string = 'llama-3.1-sonar-large-128k-online',
    options: any = {}
  ): Promise<any> {
    return this.request('/perplexity', {
      method: 'POST',
      body: JSON.stringify({
        messages,
        model,
        ...options,
      }),
    });
  }

  // Image Generation
  async generateImage(
    prompt: string,
    options: ImageGenerationOptions = {}
  ): Promise<any> {
    const { provider = 'huggingface', ...otherOptions } = options;

    if (provider === 'huggingface') {
      // Use Hugging Face FLUX.1-dev via PUT method
      return this.request('/huggingface', {
        method: 'PUT',
        body: JSON.stringify({
          prompt,
          options: otherOptions,
        }),
      });
    } else if (provider === 'pollinations') {
      // For Pollinations, return the image directly
      const response = await fetch(`${this.baseURL}/api/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          provider,
          ...otherOptions,
        }),
      });

      if (!response.ok) {
        throw new Error(`Image generation failed: ${response.statusText}`);
      }

      // Return blob URL for direct image display
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } else {
      // For other providers, return JSON response
      return this.request('/image', {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          provider,
          ...otherOptions,
        }),
      });
    }
  }

  // OCR (Optical Character Recognition)
  async extractText(
    imageFile: File,
    language: string = 'auto'
  ): Promise<OCRResult> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('language', language);

    const response = await fetch(`${this.baseURL}/api/ocr`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `OCR failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Health check for API endpoints
  async healthCheck(): Promise<{ status: string; endpoints: string[] }> {
    try {
      const endpoints = ['/huggingface', '/deepseek', '/perplexity', '/image'];
      const results = await Promise.allSettled(
        endpoints.map(endpoint => 
          fetch(`${this.baseURL}/api${endpoint}`, { method: 'GET' })
        )
      );

      const availableEndpoints = endpoints.filter((_, index) => 
        results[index].status === 'fulfilled'
      );

      return {
        status: availableEndpoints.length > 0 ? 'healthy' : 'unhealthy',
        endpoints: availableEndpoints,
      };
    } catch (error) {
      return {
        status: 'error',
        endpoints: [],
      };
    }
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export for use in components
export default apiClient;