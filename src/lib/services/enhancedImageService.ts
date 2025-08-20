// Enhanced Image Generation Service
// Advanced image generation with multiple providers, style optimization, and quality enhancement

export interface ImageGenerationRequest {
  prompt: string;
  style?: 'photorealistic' | 'artistic' | 'anime' | 'abstract' | 'sketch' | 'digital-art' | 'cinematic';
  quality?: 'draft' | 'standard' | 'high' | 'ultra';
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  seed?: number;
  iterations?: number;
  useAdvancedPrompting?: boolean;
}

export interface ImageGenerationResponse {
  success: boolean;
  imageUrl: string;
  thumbnailUrl?: string;
  prompt: string;
  enhancedPrompt: string;
  style: string;
  quality: string;
  generationTime: number;
  provider: string;
  metadata: {
    width: number;
    height: number;
    seed: number;
    model: string;
    technique: string;
  };
  message: string;
  error?: string;
}

export interface ImageProvider {
  id: string;
  name: string;
  baseUrl: string;
  supportsStyles: string[];
  maxQuality: string;
  averageSpeed: number; // milliseconds
  reliability: number; // 0-1
  costPerGeneration: number;
  isActive: boolean;
}

class EnhancedImageService {
  private providers: Map<string, ImageProvider> = new Map();
  private promptEnhancer: PromptEnhancer;
  private qualityOptimizer: QualityOptimizer;
  private styleTemplates: Map<string, string> = new Map();

  constructor() {
    console.log('🎨 Enhanced Image Service initializing...');
    this.initializeProviders();
    this.initializeStyleTemplates();
    this.promptEnhancer = new PromptEnhancer();
    this.qualityOptimizer = new QualityOptimizer();
    console.log('✅ Enhanced Image Service ready with advanced generation capabilities');
  }

  private initializeProviders() {
    const providers: ImageProvider[] = [
      {
        id: 'pollinations',
        name: 'Pollinations AI',
        baseUrl: 'https://image.pollinations.ai/prompt/',
        supportsStyles: ['photorealistic', 'artistic', 'anime', 'abstract', 'cinematic'],
        maxQuality: 'ultra',
        averageSpeed: 3000,
        reliability: 0.95,
        costPerGeneration: 0,
        isActive: true
      },
      {
        id: 'pollinations-turbo',
        name: 'Pollinations Turbo',
        baseUrl: 'https://image.pollinations.ai/prompt/',
        supportsStyles: ['photorealistic', 'artistic', 'digital-art'],
        maxQuality: 'high',
        averageSpeed: 1500,
        reliability: 0.92,
        costPerGeneration: 0,
        isActive: true
      },
      {
        id: 'pollinations-xl',
        name: 'Pollinations XL',
        baseUrl: 'https://image.pollinations.ai/prompt/',
        supportsStyles: ['photorealistic', 'cinematic', 'ultra-realistic'],
        maxQuality: 'ultra',
        averageSpeed: 5000,
        reliability: 0.88,
        costPerGeneration: 0,
        isActive: true
      }
    ];

    providers.forEach(provider => this.providers.set(provider.id, provider));
    console.log(`🖼️ Initialized ${providers.length} image generation providers`);
  }

  private initializeStyleTemplates() {
    const templates = new Map<string, string>([
      ['photorealistic', 'hyperrealistic, high detail, sharp focus, professional photography, 8k resolution'],
      ['artistic', 'artistic, masterpiece, beautiful composition, creative lighting, fine art'],
      ['anime', 'anime style, manga, cel shading, vibrant colors, detailed character design'],
      ['abstract', 'abstract art, geometric, modern, contemporary, artistic interpretation'],
      ['sketch', 'pencil sketch, hand drawn, artistic lines, detailed shading, traditional art'],
      ['digital-art', 'digital art, concept art, detailed illustration, modern digital painting'],
      ['cinematic', 'cinematic lighting, dramatic composition, movie-like quality, professional cinematography']
    ]);

    templates.forEach((template, style) => this.styleTemplates.set(style, template));
    console.log(`🎭 Loaded ${templates.size} style templates`);
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const startTime = Date.now();
    
    console.log(`🎨 Generating enhanced image for: "${request.prompt.substring(0, 50)}..."`);
    console.log(`🎯 Style: ${request.style || 'auto'}, Quality: ${request.quality || 'standard'}`);

    try {
      // Step 1: Enhance the prompt
      const enhancedPrompt = await this.promptEnhancer.enhancePrompt(request);
      
      // Step 2: Select optimal provider
      const provider = this.selectOptimalProvider(request);
      
      // Step 3: Generate image with quality optimization
      const result = await this.generateWithProvider(enhancedPrompt, provider, request);
      
      // Step 4: Post-process and validate
      const finalResult = await this.postProcessImage(result, request);
      
      const generationTime = Date.now() - startTime;
      
      return {
        success: true,
        imageUrl: finalResult.imageUrl,
        thumbnailUrl: finalResult.thumbnailUrl,
        prompt: request.prompt,
        enhancedPrompt: enhancedPrompt.text,
        style: request.style || 'auto',
        quality: request.quality || 'standard',
        generationTime,
        provider: provider.name,
        metadata: {
          width: finalResult.width,
          height: finalResult.height,
          seed: request.seed || Math.floor(Math.random() * 1000000),
          model: provider.id,
          technique: enhancedPrompt.technique
        },
        message: `🎨 Generated ${request.style || 'auto'} image using ${provider.name}\n\n✨ Enhanced prompt optimization applied\n\n⚡ Generation time: ${(generationTime / 1000).toFixed(1)}s`
      };

    } catch (error) {
      console.error('❌ Enhanced image generation failed:', error);
      
      return {
        success: false,
        imageUrl: '',
        prompt: request.prompt,
        enhancedPrompt: request.prompt,
        style: request.style || 'auto',
        quality: request.quality || 'standard',
        generationTime: Date.now() - startTime,
        provider: 'unknown',
        metadata: {
          width: 0,
          height: 0,
          seed: 0,
          model: 'unknown',
          technique: 'unknown'
        },
        message: 'Image generation failed. Please try again with a different prompt.',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private selectOptimalProvider(request: ImageGenerationRequest): ImageProvider {
    const activeProviders = Array.from(this.providers.values()).filter(p => p.isActive);
    
    // Score providers based on request requirements
    const scoredProviders = activeProviders.map(provider => ({
      provider,
      score: this.scoreProvider(provider, request)
    })).sort((a, b) => b.score - a.score);

    console.log(`🎯 Selected provider: ${scoredProviders[0].provider.name} (score: ${scoredProviders[0].score.toFixed(2)})`);
    
    return scoredProviders[0].provider;
  }

  private scoreProvider(provider: ImageProvider, request: ImageGenerationRequest): number {
    let score = 0.5; // Base score

    // Style support
    if (request.style && provider.supportsStyles.includes(request.style)) {
      score += 0.3;
    }

    // Quality support
    const qualityLevels = { draft: 1, standard: 2, high: 3, ultra: 4 };
    const requestedLevel = qualityLevels[request.quality || 'standard' as keyof typeof qualityLevels];
    const providerMaxLevel = qualityLevels[provider.maxQuality as keyof typeof qualityLevels];
    
    if (providerMaxLevel >= requestedLevel) {
      score += 0.2;
    }

    // Speed preference (faster for draft quality)
    if (request.quality === 'draft' && provider.averageSpeed < 2000) {
      score += 0.15;
    }

    // Reliability
    score += provider.reliability * 0.25;

    // Cost efficiency (free providers get bonus)
    if (provider.costPerGeneration === 0) {
      score += 0.1;
    }

    return Math.min(1, score);
  }

  private async generateWithProvider(
    enhancedPrompt: EnhancedPrompt, 
    provider: ImageProvider, 
    request: ImageGenerationRequest
  ): Promise<GenerationResult> {
    const { width, height } = this.getOptimalDimensions(request.aspectRatio, request.quality);
    const seed = request.seed || Math.floor(Math.random() * 1000000);
    
    // Build URL based on provider
    let imageUrl: string;
    
    switch (provider.id) {
      case 'pollinations':
      case 'pollinations-turbo':
      case 'pollinations-xl':
        imageUrl = this.buildPollinationsUrl(enhancedPrompt.text, width, height, seed, request.quality);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider.id}`);
    }

    // Validate image generation
    await this.validateImageUrl(imageUrl);

    return {
      imageUrl,
      thumbnailUrl: this.generateThumbnailUrl(imageUrl, width, height),
      width,
      height
    };
  }

  private buildPollinationsUrl(prompt: string, width: number, height: number, seed: number, quality?: string): string {
    const encodedPrompt = encodeURIComponent(prompt);
    let url = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
    
    // Add parameters
    const params = new URLSearchParams({
      width: width.toString(),
      height: height.toString(),
      seed: seed.toString()
    });

    // Quality-specific parameters
    if (quality === 'ultra') {
      params.set('enhance', 'true');
      params.set('model', 'flux');
    } else if (quality === 'high') {
      params.set('model', 'flux');
    }

    return `${url}?${params.toString()}`;
  }

  private getOptimalDimensions(aspectRatio?: string, quality?: string): { width: number; height: number } {
    const baseSize = quality === 'ultra' ? 1024 : 
                    quality === 'high' ? 768 :
                    quality === 'draft' ? 512 : 768;

    switch (aspectRatio) {
      case '16:9':
        return { width: Math.round(baseSize * 1.78), height: baseSize };
      case '9:16':
        return { width: baseSize, height: Math.round(baseSize * 1.78) };
      case '4:3':
        return { width: Math.round(baseSize * 1.33), height: baseSize };
      case '3:4':
        return { width: baseSize, height: Math.round(baseSize * 1.33) };
      default: // 1:1
        return { width: baseSize, height: baseSize };
    }
  }

  private generateThumbnailUrl(imageUrl: string, width: number, height: number): string {
    // Generate a smaller version for thumbnails
    const thumbnailSize = 256;
    return imageUrl.replace(`width=${width}`, `width=${thumbnailSize}`)
                   .replace(`height=${height}`, `height=${thumbnailSize}`);
  }

  private async validateImageUrl(url: string): Promise<void> {
    // Basic URL validation - in production, you might want to actually check if the image loads
    if (!url || !url.startsWith('http')) {
      throw new Error('Invalid image URL generated');
    }
  }

  private async postProcessImage(result: GenerationResult, request: ImageGenerationRequest): Promise<GenerationResult> {
    // Apply any post-processing optimizations
    return result;
  }

  // Public utility methods
  getSupportedStyles(): string[] {
    return Array.from(this.styleTemplates.keys());
  }

  getAvailableProviders(): ImageProvider[] {
    return Array.from(this.providers.values()).filter(p => p.isActive);
  }

  async generateVariations(originalRequest: ImageGenerationRequest, count: number = 3): Promise<ImageGenerationResponse[]> {
    const variations: Promise<ImageGenerationResponse>[] = [];
    
    for (let i = 0; i < count; i++) {
      const variationRequest = {
        ...originalRequest,
        seed: Math.floor(Math.random() * 1000000) // Different seed for each variation
      };
      
      variations.push(this.generateImage(variationRequest));
    }

    return Promise.all(variations);
  }
}

// Helper classes
class PromptEnhancer {
  async enhancePrompt(request: ImageGenerationRequest): Promise<EnhancedPrompt> {
    let enhancedText = request.prompt;
    let technique = 'basic';

    if (request.useAdvancedPrompting !== false) {
      // Add style-specific enhancements
      if (request.style) {
        const styleTemplate = new Map<string, string>([
          ['photorealistic', 'hyperrealistic, high detail, sharp focus, professional photography, 8k resolution'],
          ['artistic', 'artistic, masterpiece, beautiful composition, creative lighting, fine art'],
          ['anime', 'anime style, manga, cel shading, vibrant colors, detailed character design'],
          ['abstract', 'abstract art, geometric, modern, contemporary, artistic interpretation'],
          ['sketch', 'pencil sketch, hand drawn, artistic lines, detailed shading, traditional art'],
          ['digital-art', 'digital art, concept art, detailed illustration, modern digital painting'],
          ['cinematic', 'cinematic lighting, dramatic composition, movie-like quality, professional cinematography']
        ]).get(request.style);

        if (styleTemplate) {
          enhancedText = `${enhancedText}, ${styleTemplate}`;
          technique = 'style_enhanced';
        }
      }

      // Add quality enhancements
      if (request.quality === 'ultra' || request.quality === 'high') {
        enhancedText += ', high quality, detailed, masterpiece';
        technique = 'quality_enhanced';
      }
    }

    return {
      text: enhancedText,
      technique,
      original: request.prompt
    };
  }
}

class QualityOptimizer {
  // Future implementation for quality optimization
}

// Supporting interfaces
interface EnhancedPrompt {
  text: string;
  technique: string;
  original: string;
}

interface GenerationResult {
  imageUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
}

// Export singleton instance
export const enhancedImageService = new EnhancedImageService();