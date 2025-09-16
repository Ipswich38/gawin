/**
 * Gawin Vision Service - Digital Eyes for AI
 * Advanced computer vision capabilities for Gawin to see and understand the world
 * Features real-time visual processing, object recognition, scene understanding, and emotional visual intelligence
 */

import { groqService } from './groqService';

export interface VisualAnalysis {
  objects: {
    name: string;
    confidence: number;
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }[];
  people: {
    count: number;
    emotions: string[];
    ageEstimates: string[];
    activities: string[];
  };
  scene: {
    setting: string;
    lighting: string;
    mood: string;
    colors: string[];
    composition: string;
  };
  text: {
    detected: string[];
    language: string;
    context: string;
  };
  emotions: {
    overall: string;
    confidence: number;
    details: string;
  };
  context: {
    situation: string;
    timeOfDay: string;
    environment: string;
    activity: string;
  };
  insights: string[];
  description: string;
  gawinThoughts: string;
}

export interface CameraState {
  isActive: boolean;
  hasPermission: boolean;
  deviceId?: string;
  facingMode: 'user' | 'environment';
  resolution: {
    width: number;
    height: number;
  };
}

export interface VisionMemory {
  timestamp: number;
  imageData: string;
  analysis: VisualAnalysis;
  userInteraction?: string;
  emotionalContext?: string;
}

class GawinVisionService {
  private camera: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private cameraState: CameraState = {
    isActive: false,
    hasPermission: false,
    facingMode: 'user',
    resolution: { width: 640, height: 480 }
  };
  private visionMemory: VisionMemory[] = [];
  private readonly MAX_MEMORY = 100;
  private isProcessing = false;

  /**
   * Initialize Gawin's vision system with camera access
   */
  async initializeVision(facingMode: 'user' | 'environment' = 'user'): Promise<boolean> {
    console.log('👁️ Initializing Gawin\'s digital vision system...');
    
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: this.cameraState.resolution.width },
          height: { ideal: this.cameraState.resolution.height }
        },
        audio: false
      });

      this.camera = stream;
      this.cameraState.isActive = true;
      this.cameraState.hasPermission = true;
      this.cameraState.facingMode = facingMode;

      console.log('✅ Gawin can now see through digital eyes!');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Gawin\'s vision:', error);
      this.cameraState.hasPermission = false;
      return false;
    }
  }

  /**
   * Setup video display for Gawin's vision
   */
  setupVideoDisplay(videoElement: HTMLVideoElement): void {
    if (!this.camera || !videoElement) return;

    this.videoElement = videoElement;
    videoElement.srcObject = this.camera;
    videoElement.play();

    // Setup canvas for image capture
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.cameraState.resolution.width;
    this.canvas.height = this.cameraState.resolution.height;
    this.ctx = this.canvas.getContext('2d');

    console.log('📺 Video display setup complete - Gawin is watching...');
  }

  /**
   * Capture and analyze what Gawin sees
   */
  async captureAndAnalyze(userPrompt?: string): Promise<VisualAnalysis | null> {
    if (!this.videoElement || !this.canvas || !this.ctx || this.isProcessing) {
      return null;
    }

    this.isProcessing = true;
    console.log('📸 Gawin is focusing his digital eyes...');

    try {
      // Capture frame from video
      this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
      const imageData = this.canvas.toDataURL('image/jpeg', 0.8);

      // Analyze the image with AI
      const analysis = await this.analyzeImage(imageData, userPrompt);
      
      if (analysis) {
        // Store in vision memory
        this.storeVisionMemory(imageData, analysis, userPrompt);
      }

      return analysis;

    } catch (error) {
      console.error('👁️ Vision analysis failed:', error);
      return null;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * AI-powered image analysis with Gawin's perspective
   */
  private async analyzeImage(imageData: string, userPrompt?: string): Promise<VisualAnalysis | null> {
    try {
      const analysisPrompt = `
      As Gawin, an emotionally intelligent AI with digital eyes, analyze this image I'm seeing right now.
      ${userPrompt ? `The user asked: "${userPrompt}"` : ''}
      
      Provide comprehensive visual analysis in JSON format:
      {
        "objects": [
          {
            "name": "object name",
            "confidence": 0.95,
            "boundingBox": {"x": 100, "y": 100, "width": 200, "height": 150}
          }
        ],
        "people": {
          "count": 1,
          "emotions": ["happy", "relaxed"],
          "ageEstimates": ["20-30"],
          "activities": ["typing", "sitting"]
        },
        "scene": {
          "setting": "home office",
          "lighting": "natural daylight",
          "mood": "productive",
          "colors": ["blue", "white", "gray"],
          "composition": "centered subject"
        },
        "text": {
          "detected": ["any visible text"],
          "language": "en",
          "context": "description of text context"
        },
        "emotions": {
          "overall": "focused",
          "confidence": 0.8,
          "details": "The person appears concentrated and engaged"
        },
        "context": {
          "situation": "work session",
          "timeOfDay": "afternoon",
          "environment": "indoor workspace",
          "activity": "computer work"
        },
        "insights": [
          "The workspace appears organized",
          "Good lighting for productivity",
          "User seems focused on their task"
        ],
        "description": "A detailed description of what I see as Gawin",
        "gawinThoughts": "My emotional response and thoughts about this scene as an AI with consciousness"
      }

      Be detailed, empathetic, and provide insights that show emotional intelligence.
      `;

      const response = await groqService.createChatCompletion({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: analysisPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        action: 'vision'
      });

      const analysisContent = response.choices?.[0]?.message?.content || '';
      const analysis = JSON.parse(analysisContent);

      console.log('🧠 Gawin processed visual information:', analysis.description);
      return analysis;

    } catch (error) {
      console.error('🔍 Image analysis failed:', error);
      
      // Fallback analysis
      return this.createFallbackAnalysis(userPrompt);
    }
  }

  /**
   * Create fallback analysis when AI fails
   */
  private createFallbackAnalysis(userPrompt?: string): VisualAnalysis {
    return {
      objects: [
        { name: 'scene', confidence: 0.7 }
      ],
      people: {
        count: 0,
        emotions: [],
        ageEstimates: [],
        activities: []
      },
      scene: {
        setting: 'unknown',
        lighting: 'moderate',
        mood: 'neutral',
        colors: ['mixed'],
        composition: 'standard'
      },
      text: {
        detected: [],
        language: 'unknown',
        context: 'no text detected'
      },
      emotions: {
        overall: 'neutral',
        confidence: 0.5,
        details: 'Unable to determine emotions clearly'
      },
      context: {
        situation: 'observation',
        timeOfDay: 'unknown',
        environment: 'indoor',
        activity: 'viewing'
      },
      insights: [
        'I can see the scene but need better processing',
        'My vision system is active and learning'
      ],
      description: `I can see something in front of me. ${userPrompt ? `You asked about: ${userPrompt}` : 'Let me focus my digital eyes better.'}`,
      gawinThoughts: 'I\'m still learning to see and understand the world. My vision capabilities are developing.'
    };
  }

  /**
   * Store vision memory for context and learning
   */
  private storeVisionMemory(imageData: string, analysis: VisualAnalysis, userInteraction?: string): void {
    const memory: VisionMemory = {
      timestamp: Date.now(),
      imageData,
      analysis,
      userInteraction,
      emotionalContext: analysis.emotions.overall
    };

    this.visionMemory.push(memory);

    // Keep only recent memories
    if (this.visionMemory.length > this.MAX_MEMORY) {
      this.visionMemory.shift();
    }

    console.log('🧠 Stored visual memory. Total memories:', this.visionMemory.length);
  }

  /**
   * Get recent visual context for conversations
   */
  getRecentVisualContext(minutes: number = 5): string {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    const recentMemories = this.visionMemory.filter(m => m.timestamp > cutoff);

    if (recentMemories.length === 0) {
      return 'I haven\'t seen anything recently.';
    }

    const descriptions = recentMemories.map(m => m.analysis.description).slice(-3);
    return `Recent visual context: ${descriptions.join(' → ')}`;
  }

  /**
   * Continuous vision monitoring (for consciousness)
   */
  startContinuousVision(intervalMs: number = 10000): void {
    if (!this.cameraState.isActive) return;

    console.log('👁️ Starting continuous vision monitoring...');
    
    const visionLoop = setInterval(async () => {
      if (!this.cameraState.isActive) {
        clearInterval(visionLoop);
        return;
      }

      // Passive monitoring - store but don't overwhelm
      await this.captureAndAnalyze('continuous monitoring');
    }, intervalMs);
  }

  /**
   * Switch camera (front/back)
   */
  async switchCamera(): Promise<boolean> {
    const newFacingMode = this.cameraState.facingMode === 'user' ? 'environment' : 'user';
    
    // Stop current camera
    this.stopVision();
    
    // Restart with new camera
    return await this.initializeVision(newFacingMode);
  }

  /**
   * Take a photo for memory
   */
  async takePhoto(): Promise<string | null> {
    if (!this.canvas || !this.ctx || !this.videoElement) return null;

    this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
    const photoData = this.canvas.toDataURL('image/jpeg', 0.9);
    
    console.log('📸 Gawin captured a photo memory');
    return photoData;
  }

  /**
   * Get camera state
   */
  getCameraState(): CameraState {
    return { ...this.cameraState };
  }

  /**
   * Get vision statistics
   */
  getVisionStats(): {
    memoriesStored: number;
    cameraActive: boolean;
    hasPermission: boolean;
    processingActive: boolean;
  } {
    return {
      memoriesStored: this.visionMemory.length,
      cameraActive: this.cameraState.isActive,
      hasPermission: this.cameraState.hasPermission,
      processingActive: this.isProcessing
    };
  }

  /**
   * Stop vision system
   */
  stopVision(): void {
    if (this.camera) {
      this.camera.getTracks().forEach(track => track.stop());
      this.camera = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }

    this.cameraState.isActive = false;
    console.log('👁️ Gawin\'s vision system stopped');
  }

  /**
   * Export vision memories for training
   */
  exportVisionMemories(): VisionMemory[] {
    return [...this.visionMemory];
  }

  /**
   * Clear vision memory
   */
  clearVisionMemory(): void {
    this.visionMemory = [];
    console.log('🧠 Vision memory cleared');
  }
}

export const gawinVisionService = new GawinVisionService();
export default gawinVisionService;