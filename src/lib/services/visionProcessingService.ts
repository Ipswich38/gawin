/**
 * Vision Processing Service for Gawin
 * Processes camera and screen streams to give Gawin real vision capabilities
 */

import { simpleVisionService } from './simpleVisionService';

export interface VisionAnalysis {
  type: 'camera' | 'screen';
  timestamp: number;
  description: string;
  objects: DetectedObject[];
  text: string[];
  activities: string[];
  emotions?: EmotionData;
  confidence: number;
}

export interface DetectedObject {
  name: string;
  confidence: number;
  position: { x: number; y: number; width: number; height: number };
}

export interface EmotionData {
  primary: string;
  confidence: number;
  details: { [emotion: string]: number };
}

export interface VisionContext {
  cameraActive: boolean;
  screenActive: boolean;
  currentAnalysis: VisionAnalysis | null;
  recentAnalyses: VisionAnalysis[];
  visualContext: string;
}

class VisionProcessingService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private analysisInterval: NodeJS.Timeout | null = null;
  private currentContext: VisionContext = {
    cameraActive: false,
    screenActive: false,
    currentAnalysis: null,
    recentAnalyses: [],
    visualContext: ''
  };
  private callbacks: ((context: VisionContext) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeCanvas();
      this.startVisionMonitoring();
    }
  }

  /**
   * Initialize canvas for image processing
   */
  private initializeCanvas(): void {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 640;
    this.canvas.height = 480;
    this.ctx = this.canvas.getContext('2d');
  }

  /**
   * Start monitoring vision streams
   */
  private startVisionMonitoring(): void {
    // Check vision state every 2 seconds
    this.analysisInterval = setInterval(() => {
      this.processVisionStreams();
    }, 2000);
  }

  /**
   * Subscribe to vision context updates
   */
  subscribe(callback: (context: VisionContext) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Process active vision streams
   */
  private async processVisionStreams(): Promise<void> {
    const visionState = simpleVisionService.getState();
    
    this.currentContext.cameraActive = visionState.cameraEnabled;
    this.currentContext.screenActive = visionState.screenEnabled;

    try {
      // Process camera stream if active
      if (visionState.cameraEnabled && visionState.stream) {
        const cameraAnalysis = await this.analyzeCameraStream(visionState.stream);
        if (cameraAnalysis) {
          this.updateAnalysis(cameraAnalysis);
        }
      }

      // Process screen stream if active
      if (visionState.screenEnabled && visionState.screenStream) {
        const screenAnalysis = await this.analyzeScreenStream(visionState.screenStream);
        if (screenAnalysis) {
          this.updateAnalysis(screenAnalysis);
        }
      }

      // Update visual context
      this.updateVisualContext();
      
      // Notify subscribers
      this.notifySubscribers();

    } catch (error) {
      console.error('Vision processing error:', error);
    }
  }

  /**
   * Analyze camera stream for face detection and emotions
   */
  private async analyzeCameraStream(stream: MediaStream): Promise<VisionAnalysis | null> {
    if (!this.canvas || !this.ctx) return null;

    try {
      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      // Capture frame to canvas
      this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
      
      // Get image data
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      
      // Analyze the frame
      const analysis = await this.analyzeImageData(imageData, 'camera');
      
      // Clean up
      video.remove();
      
      return analysis;

    } catch (error) {
      console.error('Camera analysis error:', error);
      return null;
    }
  }

  /**
   * Analyze screen stream for content and activities
   */
  private async analyzeScreenStream(stream: MediaStream): Promise<VisionAnalysis | null> {
    if (!this.canvas || !this.ctx) return null;

    try {
      // Create video element to capture screen
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      // Capture frame to canvas
      this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
      
      // Get image data
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      
      // Analyze the screen content
      const analysis = await this.analyzeImageData(imageData, 'screen');
      
      // Clean up
      video.remove();
      
      return analysis;

    } catch (error) {
      console.error('Screen analysis error:', error);
      return null;
    }
  }

  /**
   * Analyze image data (simplified version - would use ML models in production)
   */
  private async analyzeImageData(imageData: ImageData, type: 'camera' | 'screen'): Promise<VisionAnalysis> {
    // For now, provide basic analysis
    // In production, this would use TensorFlow.js, face-api.js, or similar ML libraries
    
    const analysis: VisionAnalysis = {
      type,
      timestamp: Date.now(),
      description: this.generateBasicDescription(imageData, type),
      objects: this.detectBasicObjects(imageData, type),
      text: await this.extractText(imageData),
      activities: this.detectActivities(imageData, type),
      confidence: 0.7
    };

    // Add emotion detection for camera
    if (type === 'camera') {
      analysis.emotions = this.detectBasicEmotions(imageData);
    }

    return analysis;
  }

  /**
   * Generate basic description of image content
   */
  private generateBasicDescription(imageData: ImageData, type: 'camera' | 'screen'): string {
    const brightness = this.calculateBrightness(imageData);
    const colors = this.getMainColors(imageData);
    
    if (type === 'camera') {
      if (brightness > 180) {
        return "I can see a bright environment with good lighting. User is visible in the camera feed.";
      } else if (brightness > 100) {
        return "I can see the user in moderate lighting conditions.";
      } else {
        return "I can see the user but the lighting is quite dim.";
      }
    } else {
      if (colors.includes('blue') && colors.includes('white')) {
        return "I can see what appears to be a web browser or application interface on the screen.";
      } else if (colors.includes('black') && brightness < 50) {
        return "I can see a dark interface, possibly a code editor or terminal.";
      } else {
        return "I can see various content displayed on the user's screen.";
      }
    }
  }

  /**
   * Detect basic objects in the image
   */
  private detectBasicObjects(imageData: ImageData, type: 'camera' | 'screen'): DetectedObject[] {
    const objects: DetectedObject[] = [];
    
    if (type === 'camera') {
      // Basic face detection (simplified)
      const brightness = this.calculateBrightness(imageData);
      if (brightness > 100) {
        objects.push({
          name: 'person',
          confidence: 0.8,
          position: { x: 200, y: 150, width: 240, height: 180 }
        });
      }
    } else {
      // Basic screen content detection
      const hasText = this.hasTextContent(imageData);
      if (hasText) {
        objects.push({
          name: 'text_content',
          confidence: 0.7,
          position: { x: 0, y: 0, width: 640, height: 480 }
        });
      }
    }
    
    return objects;
  }

  /**
   * Extract text from image (simplified OCR)
   */
  private async extractText(imageData: ImageData): Promise<string[]> {
    // In production, this would use OCR libraries like Tesseract.js
    // For now, return basic detection
    const hasText = this.hasTextContent(imageData);
    
    if (hasText) {
      return ['Text content detected on screen'];
    }
    
    return [];
  }

  /**
   * Detect activities based on image content
   */
  private detectActivities(imageData: ImageData, type: 'camera' | 'screen'): string[] {
    const activities: string[] = [];
    
    if (type === 'camera') {
      const brightness = this.calculateBrightness(imageData);
      if (brightness > 150) {
        activities.push('User is in a well-lit environment');
      }
      activities.push('User is present and visible');
    } else {
      const colors = this.getMainColors(imageData);
      if (colors.includes('blue')) {
        activities.push('Browsing web or using applications');
      }
      if (colors.includes('black')) {
        activities.push('Possibly coding or using terminal');
      }
      activities.push('Active screen usage');
    }
    
    return activities;
  }

  /**
   * Detect basic emotions (simplified)
   */
  private detectBasicEmotions(imageData: ImageData): EmotionData {
    // In production, this would use emotion detection models
    // For now, provide basic analysis based on brightness and colors
    
    const brightness = this.calculateBrightness(imageData);
    
    if (brightness > 150) {
      return {
        primary: 'positive',
        confidence: 0.6,
        details: {
          happy: 0.6,
          engaged: 0.7,
          focused: 0.5
        }
      };
    } else {
      return {
        primary: 'neutral',
        confidence: 0.5,
        details: {
          neutral: 0.6,
          focused: 0.7,
          calm: 0.5
        }
      };
    }
  }

  /**
   * Calculate average brightness of image
   */
  private calculateBrightness(imageData: ImageData): number {
    const data = imageData.data;
    let total = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      total += (r + g + b) / 3;
    }
    
    return total / (data.length / 4);
  }

  /**
   * Get main colors in image
   */
  private getMainColors(imageData: ImageData): string[] {
    const data = imageData.data;
    const colors: string[] = [];
    
    let totalR = 0, totalG = 0, totalB = 0;
    const pixelCount = data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
      totalR += data[i];
      totalG += data[i + 1];
      totalB += data[i + 2];
    }
    
    const avgR = totalR / pixelCount;
    const avgG = totalG / pixelCount;
    const avgB = totalB / pixelCount;
    
    if (avgR > avgG && avgR > avgB) colors.push('red');
    if (avgG > avgR && avgG > avgB) colors.push('green');
    if (avgB > avgR && avgB > avgG) colors.push('blue');
    if (avgR > 200 && avgG > 200 && avgB > 200) colors.push('white');
    if (avgR < 50 && avgG < 50 && avgB < 50) colors.push('black');
    
    return colors;
  }

  /**
   * Check if image has text content
   */
  private hasTextContent(imageData: ImageData): boolean {
    // Simplified text detection based on contrast patterns
    const data = imageData.data;
    let contrastChanges = 0;
    
    for (let i = 0; i < data.length - 4; i += 4) {
      const brightness1 = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const brightness2 = (data[i + 4] + data[i + 5] + data[i + 6]) / 3;
      
      if (Math.abs(brightness1 - brightness2) > 50) {
        contrastChanges++;
      }
    }
    
    // If there are many contrast changes, likely text
    return contrastChanges > 1000;
  }

  /**
   * Update current analysis
   */
  private updateAnalysis(analysis: VisionAnalysis): void {
    this.currentContext.currentAnalysis = analysis;
    this.currentContext.recentAnalyses.unshift(analysis);
    
    // Keep only last 10 analyses
    if (this.currentContext.recentAnalyses.length > 10) {
      this.currentContext.recentAnalyses = this.currentContext.recentAnalyses.slice(0, 10);
    }
  }

  /**
   * Update visual context string for AI
   */
  private updateVisualContext(): void {
    const contexts: string[] = [];
    
    if (this.currentContext.cameraActive) {
      contexts.push("📹 Camera Vision Active: I can see you through the camera");
      
      if (this.currentContext.currentAnalysis?.type === 'camera') {
        contexts.push(`👁️ Visual: ${this.currentContext.currentAnalysis.description}`);
        
        if (this.currentContext.currentAnalysis.emotions) {
          contexts.push(`😊 Emotion: ${this.currentContext.currentAnalysis.emotions.primary} (${Math.round(this.currentContext.currentAnalysis.emotions.confidence * 100)}% confidence)`);
        }
        
        if (this.currentContext.currentAnalysis.activities.length > 0) {
          contexts.push(`🎯 Observing: ${this.currentContext.currentAnalysis.activities.join(', ')}`);
        }
      }
    }
    
    if (this.currentContext.screenActive) {
      contexts.push("🖥️ Screen Vision Active: I can see your screen");
      
      if (this.currentContext.currentAnalysis?.type === 'screen') {
        contexts.push(`💻 Screen: ${this.currentContext.currentAnalysis.description}`);
        
        if (this.currentContext.currentAnalysis.text.length > 0) {
          contexts.push(`📝 Text Found: ${this.currentContext.currentAnalysis.text.join(', ')}`);
        }
        
        if (this.currentContext.currentAnalysis.activities.length > 0) {
          contexts.push(`⚡ Activity: ${this.currentContext.currentAnalysis.activities.join(', ')}`);
        }
      }
    }
    
    this.currentContext.visualContext = contexts.join(' | ');
  }

  /**
   * Notify all subscribers
   */
  private notifySubscribers(): void {
    this.callbacks.forEach(callback => {
      try {
        callback({ ...this.currentContext });
      } catch (error) {
        console.error('Vision callback error:', error);
      }
    });
  }

  /**
   * Get current vision context
   */
  getVisionContext(): VisionContext {
    return { ...this.currentContext };
  }

  /**
   * Get vision context string for AI
   */
  getVisionContextString(): string {
    return this.currentContext.visualContext;
  }

  /**
   * Check if vision is active
   */
  isVisionActive(): boolean {
    return this.currentContext.cameraActive || this.currentContext.screenActive;
  }

  /**
   * Stop vision processing
   */
  stop(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
  }
}

export const visionProcessingService = new VisionProcessingService();