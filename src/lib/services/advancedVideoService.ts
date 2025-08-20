// Advanced Open Source Video Generation Service
// Integrates multiple top-tier video generation APIs and models

export interface VideoGenerationResponse {
  videoUrl: string;
  videoFrames?: string[];
  modelUsed: string;
  isVideoGeneration: boolean;
  content: string;
  timestamp: Date;
  responseTime: number;
  quality: 'fast' | 'standard' | 'high';
  resolution: string;
  duration: number;
  status: 'success' | 'error' | 'processing';
  processingId?: string;
}

interface ReplicateVideoModel {
  name: string;
  endpoint: string;
  maxDuration: number;
  resolution: string;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'fast' | 'standard' | 'high';
  description: string;
}

class AdvancedVideoService {
  private readonly REPLICATE_API_KEY = import.meta.env.VITE_REPLICATE_API_KEY;
  private readonly RUNPOD_API_KEY = import.meta.env.VITE_RUNPOD_API_KEY;
  
  // Top-tier open source video models ranked by quality and speed
  private readonly VIDEO_MODELS: ReplicateVideoModel[] = [
    {
      name: 'HunyuanVideo',
      endpoint: 'tencent/hunyuan-video',
      maxDuration: 5,
      resolution: '720p',
      speed: 'medium',
      quality: 'high',
      description: '13B parameter model with cinematic quality and superior motion'
    },
    {
      name: 'Mochi 1',
      endpoint: 'genmoai/mochi-1',
      maxDuration: 5.4,
      resolution: '480p-720p',
      speed: 'medium',
      quality: 'high',
      description: '10B parameter model with strong prompt adherence'
    },
    {
      name: 'Wan Video 2.2',
      endpoint: 'wan-video/wan-2.2-t2v-fast',
      maxDuration: 12,
      resolution: '720p',
      speed: 'fast',
      quality: 'standard',
      description: 'Fast generation with extended duration support'
    },
    {
      name: 'Minimax Video-01',
      endpoint: 'minimax/video-01',
      maxDuration: 6,
      resolution: '720p',
      speed: 'medium',
      quality: 'high',
      description: 'Best for realism and coherency'
    },
    {
      name: 'Luma Ray',
      endpoint: 'lumalabs/ray',
      maxDuration: 5,
      resolution: '720p',
      speed: 'fast',
      quality: 'standard',
      description: 'Faster generation, more creative outputs'
    }
  ];

  constructor() {
    console.log('🎬 AdvancedVideoService initializing...');
    console.log('🔑 API Keys check:', {
      replicate: !!this.REPLICATE_API_KEY,
      runpod: !!this.RUNPOD_API_KEY
    });
  }

  async generateVideo(prompt: string, qualityPreference: 'fast' | 'standard' | 'high' = 'standard'): Promise<VideoGenerationResponse> {
    const startTime = Date.now();
    console.log(`🎬 Advanced Video Generation: "${prompt}" (Quality: ${qualityPreference})`);
    
    // Select best model based on quality preference
    const selectedModel = this.selectOptimalModel(qualityPreference);
    console.log(`🎯 Selected model: ${selectedModel.name} (${selectedModel.endpoint})`);
    
    try {
      // Try Replicate API first (highest quality)
      if (this.REPLICATE_API_KEY) {
        return await this.generateWithReplicate(prompt, selectedModel, startTime);
      }
      
      // Try RunPod API as fallback
      if (this.RUNPOD_API_KEY) {
        return await this.generateWithRunPod(prompt, selectedModel, startTime);
      }
      
      // If no API keys, try alternative approaches
      return await this.generateWithAlternatives(prompt, selectedModel, startTime);
      
    } catch (error) {
      console.error('❌ Advanced video generation failed:', error);
      return this.createErrorResponse(prompt, error.message, startTime);
    }
  }

  private selectOptimalModel(qualityPreference: 'fast' | 'standard' | 'high'): ReplicateVideoModel {
    const fastModels = this.VIDEO_MODELS.filter(m => m.speed === 'fast');
    const highQualityModels = this.VIDEO_MODELS.filter(m => m.quality === 'high');
    
    switch (qualityPreference) {
      case 'fast':
        return fastModels[0] || this.VIDEO_MODELS[0];
      case 'high':
        return highQualityModels[0] || this.VIDEO_MODELS[0];
      default:
        return this.VIDEO_MODELS[0]; // HunyuanVideo as default
    }
  }

  private async generateWithReplicate(
    prompt: string, 
    model: ReplicateVideoModel, 
    startTime: number
  ): Promise<VideoGenerationResponse> {
    console.log(`🔄 Using Replicate API with ${model.name}...`);
    
    const replicateUrl = `https://api.replicate.com/v1/predictions`;
    
    const requestBody = {
      version: this.getModelVersion(model.endpoint),
      input: {
        prompt: prompt,
        num_frames: Math.min(150, model.maxDuration * 30), // 30 FPS
        height: 720,
        width: 1280,
        num_inference_steps: 50,
        guidance_scale: 7.5,
        seed: Math.floor(Math.random() * 1000000)
      }
    };

    const response = await fetch(replicateUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.status} ${response.statusText}`);
    }

    const prediction = await response.json();
    console.log('📤 Replicate prediction created:', prediction.id);
    
    // Poll for completion
    const videoUrl = await this.pollReplicatePrediction(prediction.id);
    
    return {
      videoUrl,
      modelUsed: model.name,
      isVideoGeneration: true,
      content: `Generated video: "${prompt}"`,
      timestamp: new Date(),
      responseTime: Date.now() - startTime,
      quality: model.quality,
      resolution: model.resolution,
      duration: model.maxDuration,
      status: 'success'
    };
  }

  private async generateWithRunPod(
    prompt: string, 
    model: ReplicateVideoModel, 
    startTime: number
  ): Promise<VideoGenerationResponse> {
    console.log(`🔄 Using RunPod API with ${model.name}...`);
    
    // RunPod serverless endpoint for video generation
    const runpodUrl = 'https://api.runpod.ai/v2/serverless/jobs';
    
    const requestBody = {
      input: {
        prompt: prompt,
        model: model.name.toLowerCase().replace(/\s+/g, '-'),
        num_frames: Math.min(150, model.maxDuration * 30),
        width: 1280,
        height: 720,
        steps: 50,
        guidance_scale: 7.5
      }
    };

    const response = await fetch(runpodUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.RUNPOD_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`RunPod API error: ${response.status} ${response.statusText}`);
    }

    const job = await response.json();
    console.log('📤 RunPod job created:', job.id);
    
    // Poll for completion
    const videoUrl = await this.pollRunPodJob(job.id);
    
    return {
      videoUrl,
      modelUsed: `${model.name} (RunPod)`,
      isVideoGeneration: true,
      content: `Generated video: "${prompt}"`,
      timestamp: new Date(),
      responseTime: Date.now() - startTime,
      quality: model.quality,
      resolution: model.resolution,
      duration: model.maxDuration,
      status: 'success'
    };
  }

  private async generateWithAlternatives(
    prompt: string, 
    model: ReplicateVideoModel, 
    startTime: number
  ): Promise<VideoGenerationResponse> {
    console.log('🔄 Using alternative video generation methods...');
    
    // Try free tier APIs or demo endpoints
    const alternatives = [
      {
        name: 'HuggingFace Inference',
        url: 'https://api-inference.huggingface.co/models/damo-vilab/text-to-video-ms-1.7b'
      },
      {
        name: 'Gradio Demo',
        url: 'https://huggingface.co/spaces/damo-vilab/modelscope-text-to-video-synthesis'
      }
    ];

    for (const alt of alternatives) {
      try {
        console.log(`🔄 Trying ${alt.name}...`);
        
        const response = await fetch(alt.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              num_frames: 16,
              height: 256,
              width: 256
            }
          })
        });

        if (response.ok) {
          const blob = await response.blob();
          const videoUrl = URL.createObjectURL(blob);
          
          return {
            videoUrl,
            modelUsed: `${alt.name} (Free Tier)`,
            isVideoGeneration: true,
            content: `Generated video: "${prompt}"`,
            timestamp: new Date(),
            responseTime: Date.now() - startTime,
            quality: 'fast',
            resolution: '256p',
            duration: 2,
            status: 'success'
          };
        }
      } catch (error) {
        console.log(`❌ ${alt.name} failed:`, error.message);
      }
    }

    // Final fallback: Enhanced procedural generation
    return await this.generateProceduralVideo(prompt, model, startTime);
  }

  private async generateProceduralVideo(
    prompt: string, 
    model: ReplicateVideoModel, 
    startTime: number
  ): Promise<VideoGenerationResponse> {
    console.log('🎨 Generating enhanced procedural video...');
    
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d')!;
    
    const frames: string[] = [];
    const numFrames = 60; // 2 seconds at 30 FPS
    
    // Enhanced procedural animation based on prompt analysis
    const animations = this.analyzePromptForAnimation(prompt);
    
    for (let frame = 0; frame < numFrames; frame++) {
      // Clear canvas
      ctx.fillStyle = animations.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Apply animations based on prompt analysis
      this.renderFrame(ctx, frame, numFrames, animations);
      
      // Add text overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(prompt.substring(0, 30) + '...', canvas.width / 2, canvas.height - 30);
      
      frames.push(canvas.toDataURL('image/jpeg', 0.8));
    }
    
    return {
      videoUrl: frames[0], // First frame as thumbnail
      videoFrames: frames,
      modelUsed: `Enhanced Procedural (${model.name} Fallback)`,
      isVideoGeneration: true,
      content: `Generated procedural video: "${prompt}"`,
      timestamp: new Date(),
      responseTime: Date.now() - startTime,
      quality: 'fast',
      resolution: '640x480',
      duration: 2,
      status: 'success'
    };
  }

  private analyzePromptForAnimation(prompt: string) {
    const lower = prompt.toLowerCase();
    
    return {
      backgroundColor: lower.includes('ocean') || lower.includes('water') ? '#1e3a8a' :
                     lower.includes('fire') || lower.includes('sunset') ? '#dc2626' :
                     lower.includes('forest') || lower.includes('nature') ? '#166534' :
                     lower.includes('space') || lower.includes('star') ? '#1e1b4b' : '#1f2937',
      
      primaryColor: lower.includes('gold') ? '#fbbf24' :
                   lower.includes('silver') ? '#e5e7eb' :
                   lower.includes('red') ? '#ef4444' :
                   lower.includes('blue') ? '#3b82f6' :
                   lower.includes('green') ? '#10b981' : '#8b5cf6',
      
      animationType: lower.includes('spiral') || lower.includes('swirl') ? 'spiral' :
                     lower.includes('wave') || lower.includes('ocean') ? 'wave' :
                     lower.includes('pulse') || lower.includes('heartbeat') ? 'pulse' :
                     lower.includes('float') || lower.includes('hover') ? 'float' : 'rotate',
      
      particleCount: lower.includes('many') || lower.includes('multiple') ? 50 :
                    lower.includes('few') || lower.includes('single') ? 5 : 20,
      
      speed: lower.includes('fast') || lower.includes('quick') ? 2 :
            lower.includes('slow') || lower.includes('gentle') ? 0.5 : 1
    };
  }

  private renderFrame(ctx: CanvasRenderingContext2D, frame: number, totalFrames: number, animations: any) {
    const progress = frame / totalFrames;
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    
    // Render particles/elements based on animation type
    for (let i = 0; i < animations.particleCount; i++) {
      const angle = (i / animations.particleCount) * Math.PI * 2;
      const time = progress * animations.speed;
      
      let x = centerX;
      let y = centerY;
      
      switch (animations.animationType) {
        case 'spiral':
          const radius = 50 + time * 100;
          x = centerX + Math.cos(angle + time * 4) * radius;
          y = centerY + Math.sin(angle + time * 4) * radius;
          break;
          
        case 'wave':
          x = (i / animations.particleCount) * ctx.canvas.width;
          y = centerY + Math.sin(angle + time * 6) * 50;
          break;
          
        case 'pulse':
          const pulseRadius = 30 + Math.sin(time * 8) * 20;
          x = centerX + Math.cos(angle) * pulseRadius;
          y = centerY + Math.sin(angle) * pulseRadius;
          break;
          
        case 'float':
          x = centerX + Math.cos(angle) * 80;
          y = centerY + Math.sin(angle) * 80 + Math.sin(time * 3) * 20;
          break;
          
        default: // rotate
          x = centerX + Math.cos(angle + time * 2) * 60;
          y = centerY + Math.sin(angle + time * 2) * 60;
      }
      
      // Draw particle
      ctx.fillStyle = animations.primaryColor;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(x, y, 3 + Math.sin(time * 5 + i) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
  }

  private getModelVersion(endpoint: string): string {
    // Use actual Replicate model versions
    const modelVersions: { [key: string]: string } = {
      'tencent/hunyuan-video': '6c9132aee14409cd6568d030453f1ba50f5f3412b844fe67f78a9eb62d55664f',
      'genmo/mochi-1-preview': '1944af04d098ef69bed7f9d335d102e652203f268ec4aaa2d836f6217217e460',
      'genmoai/mochi-1': '1944af04d098ef69bed7f9d335d102e652203f268ec4aaa2d836f6217217e460'
    };
    
    return modelVersions[endpoint] || endpoint;
  }

  private async pollReplicatePrediction(predictionId: string): Promise<string> {
    const pollUrl = `https://api.replicate.com/v1/predictions/${predictionId}`;
    
    for (let i = 0; i < 60; i++) { // Poll for up to 5 minutes
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const response = await fetch(pollUrl, {
        headers: {
          'Authorization': `Token ${this.REPLICATE_API_KEY}`,
        }
      });
      
      const prediction = await response.json();
      
      if (prediction.status === 'succeeded') {
        return prediction.output;
      } else if (prediction.status === 'failed') {
        throw new Error(`Replicate prediction failed: ${prediction.error}`);
      }
      
      console.log(`🔄 Polling Replicate prediction... (${i + 1}/60)`);
    }
    
    throw new Error('Replicate prediction timed out');
  }

  private async pollRunPodJob(jobId: string): Promise<string> {
    const pollUrl = `https://api.runpod.ai/v2/serverless/jobs/${jobId}`;
    
    for (let i = 0; i < 60; i++) { // Poll for up to 5 minutes
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const response = await fetch(pollUrl, {
        headers: {
          'Authorization': `Bearer ${this.RUNPOD_API_KEY}`,
        }
      });
      
      const job = await response.json();
      
      if (job.status === 'COMPLETED') {
        return job.output.video_url;
      } else if (job.status === 'FAILED') {
        throw new Error(`RunPod job failed: ${job.error}`);
      }
      
      console.log(`🔄 Polling RunPod job... (${i + 1}/60)`);
    }
    
    throw new Error('RunPod job timed out');
  }

  private createErrorResponse(prompt: string, error: string, startTime: number): VideoGenerationResponse {
    return {
      videoUrl: '',
      modelUsed: 'Error',
      isVideoGeneration: true,
      content: `Failed to generate video for "${prompt}". Error: ${error}`,
      timestamp: new Date(),
      responseTime: Date.now() - startTime,
      quality: 'fast',
      resolution: '0x0',
      duration: 0,
      status: 'error'
    };
  }

  isConfigured(): boolean {
    return !!(this.REPLICATE_API_KEY || this.RUNPOD_API_KEY);
  }

  getSupportedModels(): ReplicateVideoModel[] {
    return this.VIDEO_MODELS;
  }
}

export const advancedVideoService = new AdvancedVideoService();