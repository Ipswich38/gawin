import { validationService } from './validationService';

export interface PollinationsRequest {
  prompt: string;
  width?: number;
  height?: number;
  model?: string;
  seed?: number;
}

export interface PollinationsResponse {
  success: boolean;
  data?: {
    image_url: string;
    model_used: string;
    processing_time?: number;
  };
  error?: string;
}

class PollinationsService {
  private static instance: PollinationsService;
  private baseURL: string = 'https://image.pollinations.ai/prompt';

  constructor() {
    console.log('✅ Pollinations AI service initialized');
  }

  static getInstance(): PollinationsService {
    if (!PollinationsService.instance) {
      PollinationsService.instance = new PollinationsService();
    }
    return PollinationsService.instance;
  }

  /**
   * Generate images using Pollinations AI
   */
  async generateImage(request: PollinationsRequest): Promise<PollinationsResponse> {
    const startTime = Date.now();
    
    try {
      // Validate prompt
      const validation = validationService.validateTextInput(request.prompt);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Invalid or inappropriate prompt'
        };
      }

      // Clean and enhance the prompt
      const cleanPrompt = this.enhancePrompt(request.prompt);
      
      // Set default parameters
      const width = request.width || 1024;
      const height = request.height || 1024;
      const seed = request.seed || Math.floor(Math.random() * 1000000);
      
      // Build the URL with parameters
      const url = new URL(this.baseURL);
      url.pathname = `/prompt/${encodeURIComponent(cleanPrompt)}`;
      url.searchParams.set('width', width.toString());
      url.searchParams.set('height', height.toString());
      url.searchParams.set('seed', seed.toString());
      url.searchParams.set('model', request.model || 'flux');
      url.searchParams.set('enhance', 'true');

      console.log('🎨 Generating image with Pollinations AI...');

      // Make the request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(url.toString(), {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Gawin-AI/1.0',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('Pollinations API error:', response.status, response.statusText);
        return {
          success: false,
          error: `Image generation failed: ${response.status}`
        };
      }

      // Check if response is an image
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        return {
          success: false,
          error: 'Invalid response format from image service'
        };
      }

      // Convert response to blob and create object URL
      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);

      const processingTime = Date.now() - startTime;
      
      console.log(`✅ Successfully generated image in ${processingTime}ms`);

      return {
        success: true,
        data: {
          image_url: imageUrl,
          model_used: request.model || 'flux',
          processing_time: processingTime
        }
      };

    } catch (error) {
      console.error('Pollinations service error:', error);
      
      // Handle timeout/abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Image generation timeout - please try again'
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image generation failed'
      };
    }
  }

  /**
   * Enhance the prompt for better results
   */
  private enhancePrompt(prompt: string): string {
    // Clean the prompt
    let enhanced = prompt.trim();
    
    // Add quality enhancers if not present
    const qualityTerms = ['high quality', 'detailed', 'professional', '4k', '8k', 'hd'];
    const hasQualityTerm = qualityTerms.some(term => 
      enhanced.toLowerCase().includes(term)
    );
    
    if (!hasQualityTerm) {
      enhanced += ', high quality, detailed';
    }
    
    // Add artistic style if it's a creative request
    if (enhanced.toLowerCase().includes('art') || 
        enhanced.toLowerCase().includes('paint') || 
        enhanced.toLowerCase().includes('draw')) {
      if (!enhanced.toLowerCase().includes('style')) {
        enhanced += ', professional art style';
      }
    }
    
    return enhanced;
  }

  /**
   * Get available models
   */
  getAvailableModels() {
    return {
      flux: {
        name: 'FLUX',
        description: 'High-quality general purpose image generation',
        recommended: true
      },
      'flux-realism': {
        name: 'FLUX Realism',
        description: 'Photorealistic image generation'
      },
      'flux-anime': {
        name: 'FLUX Anime',
        description: 'Anime and manga style images'
      },
      'flux-3d': {
        name: 'FLUX 3D',
        description: '3D rendered style images'
      }
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'offline'; message: string }> {
    try {
      // Simple test with a minimal request
      const testUrl = `${this.baseURL}/test?width=64&height=64&seed=1`;
      const response = await fetch(testUrl, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout for health check
      });

      if (response.ok) {
        return { status: 'healthy', message: 'Pollinations AI service operational' };
      } else {
        return { status: 'degraded', message: 'Service responding with errors' };
      }
    } catch (error) {
      return { status: 'offline', message: 'Pollinations AI service unavailable' };
    }
  }
}

// Export singleton instance
export const pollinationsService = PollinationsService.getInstance();
export default pollinationsService;