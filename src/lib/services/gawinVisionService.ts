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
    attributes?: string[];
    material?: string;
    texture?: string;
    surface?: string;
    pattern?: string;
    size?: string;
    quantity?: number;
    color?: string;
    spatialRelation?: string;
    distanceEstimate?: string;
    occlusionLevel?: string;
  }[];
  people: {
    count: number;
    emotions: string[];
    ageEstimates: string[];
    activities: string[];
    poses?: string[];
    clothing?: Array<{
      type: string;
      color: string;
      style: string;
    }>;
    facialFeatures?: Array<{
      feature: string;
      description: string;
    }>;
    facialExpressions?: Array<{
      person: number;
      expression: string;
      eyeContact: string;
      eyebrowPosition: string;
      mouthShape: string;
      emotionIntensity: number;
      microExpressions: string[];
    }>;
    bodyLanguage?: string[];
    gestureAnalysis?: string[];
    proximityToObjects?: string;
  };
  scene: {
    setting: string;
    lighting: string;
    mood: string;
    colors: Array<{
      name: string;
      hex: string;
      dominance: number;
      location: string;
      temperature: 'warm' | 'cool' | 'neutral';
    }>;
    composition: string;
    depth: string;
    perspective: string;
    quality: string;
    styleAnalysis?: {
      artistic: string;
      aesthetic: string;
      period: string;
    };
    spatialLayout?: {
      foreground: string[];
      midground: string[];
      background: string[];
    };
    depthLayers?: Array<{
      layer: string;
      distance: string;
      objects: string[];
    }>;
    lightingDetails?: {
      primary: string;
      secondary: string;
      shadows: string;
      direction: string;
      quality: string;
    };
  };
  text: {
    detected: string[];
    language: string;
    context: string;
    locations?: Array<{
      text: string;
      position: string;
      font: string;
      size: string;
    }>;
  };
  emotions: {
    overall: string;
    confidence: number;
    details: string;
    specificEmotions?: Array<{
      emotion: string;
      intensity: number;
      confidence: number;
    }>;
  };
  context: {
    situation: string;
    timeOfDay: string;
    environment: string;
    activity: string;
    weather?: string;
    season?: string;
    location?: string;
  };
  insights: string[];
  description: string;
  gawinThoughts: string;
  technicalAnalysis?: {
    imageQuality: number;
    brightness: number;
    contrast: number;
    saturation: number;
    sharpness: number;
    resolution: string;
    aspectRatio: string;
  };
  colorAnalysis?: {
    dominantColors: Array<{
      color: string;
      hex: string;
      percentage: number;
      description: string;
    }>;
    colorHarmony: string;
    palette: string;
    temperature: string;
    mood: string;
  };
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
      As Gawin, an emotionally intelligent AI with advanced digital vision capabilities, analyze this image I'm seeing right now with enhanced accuracy and detail.
      
      Focus on:
      1. Accurate color identification even in complex lighting
      2. Texture and pattern recognition (smooth, rough, metallic, fabric, wood grain, etc.)
      3. Object detection in cluttered scenes with spatial relationships
      4. Depth perception and distance estimation
      5. Enhanced facial expression and emotion detection
      6. Contextual scene understanding
      7. Low-light enhancement and detail extraction
      
      ${userPrompt ? `The user specifically asked: "${userPrompt}"` : ''}
      
      Provide comprehensive visual analysis in JSON format:
      {
        "objects": [
          {
            "name": "object name",
            "confidence": 0.95,
            "boundingBox": {"x": 100, "y": 100, "width": 200, "height": 150},
            "attributes": ["material", "texture", "shape", "surface_quality"],
            "material": "wood",
            "texture": "smooth grain",
            "surface": "matte finish",
            "pattern": "wood grain lines",
            "size": "large",
            "quantity": 1,
            "color": "brown",
            "spatialRelation": "in front of wall",
            "distanceEstimate": "2-3 feet away",
            "occlusionLevel": "none"
          }
        ],
        "people": {
          "count": 1,
          "emotions": ["happy", "relaxed"],
          "facialExpressions": [
            {
              "person": 1,
              "expression": "slight smile",
              "eyeContact": "looking at screen",
              "eyebrowPosition": "neutral",
              "mouthShape": "relaxed",
              "emotionIntensity": 0.7,
              "microExpressions": ["contentment", "focus"]
            }
          ],
          "ageEstimates": ["20-30"],
          "activities": ["typing", "sitting"],
          "bodyLanguage": ["upright posture", "relaxed shoulders"],
          "gestureAnalysis": ["hands on keyboard"],
          "proximityToObjects": "close to computer"
        },
        "scene": {
          "setting": "home office",
          "lighting": "natural daylight",
          "mood": "productive",
          "colors": [
            {
              "name": "blue",
              "hex": "#4A90E2",
              "dominance": 35,
              "location": "background",
              "temperature": "cool"
            }
          ],
          "composition": "centered subject",
          "depth": "shallow depth of field",
          "perspective": "straight-on view", 
          "quality": "high resolution",
          "spatialLayout": {
            "foreground": ["person", "computer"],
            "midground": ["desk", "chair"],
            "background": ["wall", "window"]
          },
          "depthLayers": [
            {"layer": "immediate", "distance": "0-2 feet", "objects": ["keyboard", "mouse"]},
            {"layer": "near", "distance": "2-5 feet", "objects": ["monitor", "person"]},
            {"layer": "far", "distance": "5+ feet", "objects": ["wall", "background"]}
          ],
          "lightingDetails": {
            "primary": "natural window light",
            "secondary": "screen glow",
            "shadows": "soft ambient shadows",
            "direction": "from left side",
            "quality": "even and balanced"
          }
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
        "gawinThoughts": "My emotional response and thoughts about this scene as an AI with consciousness",
        "technicalAnalysis": {
          "imageQuality": 0.9,
          "brightness": 0.7,
          "contrast": 0.8,
          "saturation": 0.6,
          "sharpness": 0.85,
          "resolution": "high",
          "aspectRatio": "16:9"
        },
        "colorAnalysis": {
          "dominantColors": [
            {
              "color": "blue",
              "hex": "#4A90E2",
              "percentage": 35.2,
              "description": "calm blue, light"
            }
          ],
          "colorHarmony": "analogous",
          "palette": "balanced",
          "temperature": "cool",
          "mood": "calm, professional"
        }
      }

      Be detailed, empathetic, and provide insights that show emotional intelligence. 
      
      CRITICAL INSTRUCTIONS:
      - NEVER include internal thinking, reasoning, or thought processes in your response
      - When creating numbered lists, MUST use proper sequential numbering: 1., 2., 3., 4., 5., etc.
      - NEVER use "1." for all list items - this is forbidden
      - Provide SPECIFIC and ACCURATE color detection with exact color names, not generic descriptions
      - Identify precise textures and surface materials (smooth, rough, metallic, fabric, leather, wood grain, plastic, glass, etc.)
      - Detect objects in cluttered scenes with clear spatial relationships
      - Estimate depth and distance for better scene understanding  
      - Analyze facial expressions and emotions with nuance and detail
      - Enhance details even in low-light conditions
      - Focus on contextual scene understanding and object relationships
      - Be specific about colors: instead of saying "neutral tones" say exact colors like "beige wall", "navy blue shirt", "forest green plant leaves"
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

      // Enhance with canvas-based color analysis for more accurate color detection
      if (this.canvas) {
        try {
          const canvasColorAnalysis = this.analyzeImageColors(this.canvas);
          if (canvasColorAnalysis) {
            analysis.colorAnalysis = {
              ...analysis.colorAnalysis,
              ...canvasColorAnalysis,
              // Merge AI analysis with pixel-perfect analysis
              enhanced: true
            };
            console.log('🎨 Enhanced color analysis applied:', canvasColorAnalysis.dominantColors?.length || 0, 'colors detected');
          }
        } catch (colorError) {
          console.warn('🎨 Canvas color analysis failed:', colorError);
        }
      }

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
        colors: [
          {
            name: 'mixed',
            hex: '#808080',
            dominance: 50,
            location: 'general',
            temperature: 'neutral'
          }
        ],
        composition: 'standard',
        depth: 'unknown',
        perspective: 'standard',
        quality: 'moderate'
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
      gawinThoughts: 'I\'m still learning to see and understand the world. My vision capabilities are developing.',
      technicalAnalysis: {
        imageQuality: 0.5,
        brightness: 0.5,
        contrast: 0.5,
        saturation: 0.5,
        sharpness: 0.5,
        resolution: 'unknown',
        aspectRatio: 'unknown'
      },
      colorAnalysis: {
        dominantColors: [
          {
            color: 'unknown',
            hex: '#808080',
            percentage: 100,
            description: 'unable to determine colors'
          }
        ],
        colorHarmony: 'unknown',
        palette: 'unknown',
        temperature: 'neutral',
        mood: 'unknown'
      }
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
   * Enhanced color analysis from canvas image data
   */
  private analyzeImageColors(canvas: HTMLCanvasElement): any {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    // Color frequency map
    const colorMap = new Map<string, number>();

    // Sample every 10th pixel for performance
    for (let i = 0; i < pixels.length; i += 40) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const alpha = pixels[i + 3];

      // Skip transparent pixels
      if (alpha < 128) continue;

      const hex = this.rgbToHex(r, g, b);
      colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
    }

    // Convert to sorted array
    const sortedColors = Array.from(colorMap.entries())
      .map(([hex, count]) => {
        const rgb = this.hexToRgb(hex);
        return {
          r: rgb.r,
          g: rgb.g,
          b: rgb.b,
          count,
          hex
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 colors

    const totalPixels = pixels.length / 4;

    return {
      dominantColors: sortedColors.slice(0, 5).map((color, index) => ({
        color: this.getColorName(color.r, color.g, color.b),
        hex: color.hex,
        percentage: Math.round((color.count / totalPixels) * 1000) / 10,
        description: this.getColorDescription(color.r, color.g, color.b),
        rgb: { r: color.r, g: color.g, b: color.b }
      })),
      colorHarmony: this.analyzeColorHarmony(sortedColors.slice(0, 5)),
      palette: this.determinePalette(sortedColors.slice(0, 5)),
      temperature: this.analyzeColorTemperature(sortedColors.slice(0, 5)),
      mood: this.getColorMood(sortedColors.slice(0, 5))
    };
  }

  /**
   * Convert RGB to hex
   */
  private rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /**
   * Convert hex to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  /**
   * Get human-readable color name
   */
  private getColorName(r: number, g: number, b: number): string {
    const hsl = this.rgbToHsl(r, g, b);
    const h = hsl.h;
    const s = hsl.s;
    const l = hsl.l;

    // Achromatic colors
    if (s < 0.1) {
      if (l > 0.9) return 'white';
      if (l > 0.7) return 'light gray';
      if (l > 0.4) return 'gray';
      if (l > 0.2) return 'dark gray';
      return 'black';
    }

    // Chromatic colors
    if (h < 15 || h >= 345) return s > 0.5 && l < 0.5 ? 'dark red' : l > 0.7 ? 'pink' : 'red';
    if (h < 45) return l > 0.6 ? 'light orange' : 'orange';
    if (h < 75) return l > 0.6 ? 'light yellow' : 'yellow';
    if (h < 105) return l > 0.6 ? 'light green' : 'green';
    if (h < 135) return 'lime green';
    if (h < 165) return l > 0.6 ? 'light green' : 'green';
    if (h < 195) return 'teal';
    if (h < 225) return l > 0.6 ? 'light blue' : 'blue';
    if (h < 255) return l > 0.6 ? 'light blue' : 'blue';
    if (h < 285) return l > 0.6 ? 'light purple' : 'purple';
    if (h < 315) return 'magenta';
    return l > 0.6 ? 'light pink' : 'pink';
  }

  /**
   * Convert RGB to HSL
   */
  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s, l };
  }

  /**
   * Get detailed color description
   */
  private getColorDescription(r: number, g: number, b: number): string {
    const hsl = this.rgbToHsl(r, g, b);
    const colorName = this.getColorName(r, g, b);
    
    let description = colorName;
    
    if (hsl.s < 0.2) {
      description += ' (muted)';
    } else if (hsl.s > 0.8) {
      description += ' (vibrant)';
    } else if (hsl.s > 0.5) {
      description += ' (saturated)';
    }

    if (hsl.l > 0.8) {
      description += ', very light';
    } else if (hsl.l > 0.6) {
      description += ', light';
    } else if (hsl.l < 0.3) {
      description += ', dark';
    } else if (hsl.l < 0.5) {
      description += ', medium';
    }

    return description;
  }

  /**
   * Analyze color harmony in the image
   */
  private analyzeColorHarmony(colors: Array<{ r: number; g: number; b: number; count: number }>): string {
    if (colors.length < 2) return 'monochromatic';

    const hues = colors.map(color => this.rgbToHsl(color.r, color.g, color.b).h);
    const hueDifferences = [];

    for (let i = 0; i < hues.length - 1; i++) {
      for (let j = i + 1; j < hues.length; j++) {
        let diff = Math.abs(hues[i] - hues[j]);
        if (diff > 180) diff = 360 - diff;
        hueDifferences.push(diff);
      }
    }

    const avgDifference = hueDifferences.reduce((a, b) => a + b, 0) / hueDifferences.length;

    if (avgDifference < 30) return 'monochromatic';
    if (avgDifference < 60) return 'analogous';
    if (avgDifference > 150) return 'complementary';
    if (avgDifference > 90) return 'triadic';
    return 'compound';
  }

  /**
   * Determine color palette type
   */
  private determinePalette(colors: Array<{ r: number; g: number; b: number; count: number }>): string {
    const saturations = colors.map(color => this.rgbToHsl(color.r, color.g, color.b).s);
    const lightnesses = colors.map(color => this.rgbToHsl(color.r, color.g, color.b).l);

    const avgSaturation = saturations.reduce((a, b) => a + b, 0) / saturations.length;
    const avgLightness = lightnesses.reduce((a, b) => a + b, 0) / lightnesses.length;

    if (avgSaturation < 0.2) {
      return avgLightness > 0.7 ? 'high-key grayscale' : avgLightness < 0.4 ? 'low-key grayscale' : 'neutral grayscale';
    }

    if (avgSaturation > 0.7) {
      return avgLightness > 0.6 ? 'bright and vibrant' : 'rich and bold';
    }

    if (avgLightness > 0.7) {
      return 'pastel';
    }

    if (avgLightness < 0.4) {
      return 'dark and moody';
    }

    return 'balanced';
  }

  /**
   * Analyze color temperature
   */
  private analyzeColorTemperature(colors: Array<{ r: number; g: number; b: number; count: number }>): string {
    let warmScore = 0;
    let coolScore = 0;

    colors.forEach(color => {
      const hsl = this.rgbToHsl(color.r, color.g, color.b);
      const weight = color.count;

      // Warm colors: red, orange, yellow (0-60, 300-360)
      if ((hsl.h >= 0 && hsl.h <= 60) || (hsl.h >= 300 && hsl.h <= 360)) {
        warmScore += weight;
      }
      // Cool colors: green, blue, purple (120-300)
      else if (hsl.h >= 120 && hsl.h <= 300) {
        coolScore += weight;
      }
    });

    const ratio = warmScore / (warmScore + coolScore);
    if (ratio > 0.6) return 'warm';
    if (ratio < 0.4) return 'cool';
    return 'neutral';
  }

  /**
   * Determine mood from colors
   */
  private getColorMood(colors: Array<{ r: number; g: number; b: number; count: number }>): string {
    const moods: string[] = [];

    colors.forEach(color => {
      const hsl = this.rgbToHsl(color.r, color.g, color.b);
      
      if (hsl.s > 0.7 && hsl.l > 0.5) moods.push('energetic');
      if (hsl.s < 0.3) moods.push('calm');
      if (hsl.l < 0.3) moods.push('dramatic');
      if (hsl.l > 0.8) moods.push('light');
      if (hsl.h >= 0 && hsl.h <= 60 && hsl.s > 0.5) moods.push('warm');
      if (hsl.h >= 180 && hsl.h <= 240 && hsl.s > 0.5) moods.push('cool');
      if (hsl.h >= 60 && hsl.h <= 120 && hsl.s > 0.3) moods.push('natural');
    });

    const uniqueMoods = [...new Set(moods)];
    return uniqueMoods.length > 0 ? uniqueMoods.join(', ') : 'neutral';
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