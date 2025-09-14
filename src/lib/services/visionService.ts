import * as faceapi from '@vladmandic/face-api';

// Privacy-first vision service for Gawin
// All processing happens client-side - no data leaves the user's device

export interface EmotionAnalysis {
  dominant: string;
  confidence: number;
  emotions: {
    angry: number;
    disgusted: number;
    fearful: number;
    happy: number;
    neutral: number;
    sad: number;
    surprised: number;
  };
  timestamp: number;
}

export interface GestureAnalysis {
  detected: string[];
  confidence: number;
  timestamp: number;
}

export interface VisionAnalysis {
  emotions: EmotionAnalysis | null;
  gestures: GestureAnalysis | null;
  faceDetected: boolean;
  attentionLevel: 'high' | 'medium' | 'low';
  contextualCues: string[];
}

export class VisionService {
  private isInitialized = false;
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private isAnalyzing = false;
  private analysisInterval: NodeJS.Timeout | null = null;
  private onAnalysisCallback: ((analysis: VisionAnalysis) => void) | null = null;

  // Privacy settings
  private privacySettings = {
    storeAnalysis: false, // Never store facial data
    logEmotions: false,   // Don't log emotional states
    shareData: false,     // Never share data externally
    consentGiven: false   // Explicit user consent required
  };

  async initialize(): Promise<boolean> {
    try {
      console.log('🔬 Initializing Gawin Vision System...');
      
      // Load face-api models (runs client-side only)
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      ]);

      this.isInitialized = true;
      console.log('✅ Vision system initialized - all processing client-side');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize vision system:', error);
      return false;
    }
  }

  async requestCameraAccess(userConsent: boolean): Promise<boolean> {
    if (!userConsent) {
      console.log('🚫 User declined camera access - respecting privacy choice');
      return false;
    }

    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) return false;
    }

    try {
      console.log('📸 Requesting camera permission...');
      
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }, 
        audio: false 
      });

      // Create video element for processing
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = this.stream;
      this.videoElement.autoplay = true;
      this.videoElement.muted = true;
      this.videoElement.style.display = 'none'; // Hidden - only for processing

      this.privacySettings.consentGiven = true;
      console.log('✅ Camera access granted - ready for analysis');
      return true;
    } catch (error) {
      console.error('❌ Camera access denied or failed:', error);
      return false;
    }
  }

  async startAnalysis(callback: (analysis: VisionAnalysis) => void): Promise<void> {
    if (!this.privacySettings.consentGiven || !this.videoElement || this.isAnalyzing) {
      return;
    }

    this.onAnalysisCallback = callback;
    this.isAnalyzing = true;

    console.log('🔍 Starting real-time emotion and gesture analysis...');

    // Analyze every 2 seconds to balance performance and responsiveness
    this.analysisInterval = setInterval(async () => {
      await this.performAnalysis();
    }, 2000);
  }

  private async performAnalysis(): Promise<void> {
    if (!this.videoElement || !this.onAnalysisCallback) return;

    try {
      const detections = await faceapi
        .detectAllFaces(this.videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions()
        .withFaceLandmarks();

      if (detections.length === 0) {
        // No face detected
        this.onAnalysisCallback({
          emotions: null,
          gestures: null,
          faceDetected: false,
          attentionLevel: 'low',
          contextualCues: ['User not visible']
        });
        return;
      }

      const detection = detections[0];
      const expressions = detection.expressions;

      // Find dominant emotion
      const emotionEntries = Object.entries(expressions) as [string, number][];
      const dominant = emotionEntries.reduce((max, current) => 
        current[1] > max[1] ? current : max
      );

      const emotionAnalysis: EmotionAnalysis = {
        dominant: dominant[0],
        confidence: dominant[1],
        emotions: expressions,
        timestamp: Date.now()
      };

      // Analyze attention level based on face position and emotion
      const attentionLevel = this.calculateAttentionLevel(detection, expressions);

      // Generate contextual cues for Gawin's understanding
      const contextualCues = this.generateContextualCues(emotionAnalysis, detection);

      // Simple gesture detection based on face landmarks
      const gestureAnalysis = this.analyzeSimpleGestures(detection.landmarks);

      const visionAnalysis: VisionAnalysis = {
        emotions: emotionAnalysis,
        gestures: gestureAnalysis,
        faceDetected: true,
        attentionLevel,
        contextualCues
      };

      this.onAnalysisCallback(visionAnalysis);

    } catch (error) {
      console.error('Analysis error:', error);
    }
  }

  private calculateAttentionLevel(
    detection: faceapi.WithFaceExpressions<faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>>,
    expressions: faceapi.FaceExpressions
  ): 'high' | 'medium' | 'low' {
    const box = detection.detection.box;
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // Face is centered and expressions show engagement
    const isCentered = centerX > 200 && centerX < 440 && centerY > 120 && centerY < 360;
    const isEngaged = expressions.happy > 0.3 || expressions.surprised > 0.3 || expressions.neutral > 0.5;

    if (isCentered && isEngaged) return 'high';
    if (isCentered || isEngaged) return 'medium';
    return 'low';
  }

  private generateContextualCues(emotion: EmotionAnalysis, detection: any): string[] {
    const cues: string[] = [];

    // Emotion-based cues
    if (emotion.confidence > 0.7) {
      switch (emotion.dominant) {
        case 'happy':
          cues.push('User appears pleased and engaged');
          break;
        case 'sad':
          cues.push('User seems thoughtful or concerned');
          break;
        case 'surprised':
          cues.push('User looks intrigued or surprised');
          break;
        case 'angry':
          cues.push('User appears frustrated or focused');
          break;
        case 'fearful':
          cues.push('User seems uncertain or cautious');
          break;
        case 'neutral':
          cues.push('User is calmly focused');
          break;
      }
    }

    // Face position cues
    const box = detection.detection.box;
    if (box.width > 200) {
      cues.push('User is positioned close to camera');
    } else if (box.width < 100) {
      cues.push('User is positioned far from camera');
    }

    return cues;
  }

  private analyzeSimpleGestures(landmarks: faceapi.FaceLandmarks68): GestureAnalysis {
    // Simple gesture detection based on facial landmarks
    const gestures: string[] = [];
    let totalConfidence = 0;

    // Analyze mouth landmarks for speaking/smiling
    const mouth = landmarks.getMouth();
    const mouthWidth = Math.abs(mouth[6].x - mouth[0].x);
    const mouthHeight = Math.abs(mouth[3].y - mouth[9].y);

    if (mouthHeight / mouthWidth > 0.5) {
      gestures.push('speaking');
      totalConfidence += 0.7;
    }

    // Analyze eyebrow position for expressions
    const leftEyebrow = landmarks.getLeftEyeBrow();
    const rightEyebrow = landmarks.getRightEyeBrow();
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    const leftBrowDistance = leftEyebrow[2].y - leftEye[1].y;
    const rightBrowDistance = rightEyebrow[2].y - rightEye[1].y;

    if (leftBrowDistance < -10 || rightBrowDistance < -10) {
      gestures.push('raised_eyebrows');
      totalConfidence += 0.6;
    }

    return {
      detected: gestures,
      confidence: Math.min(totalConfidence, 1.0),
      timestamp: Date.now()
    };
  }

  stopAnalysis(): void {
    console.log('⏹️ Stopping vision analysis');
    this.isAnalyzing = false;
    
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
  }

  disconnect(): void {
    console.log('🔌 Disconnecting vision system - ensuring privacy');
    
    this.stopAnalysis();
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.remove();
      this.videoElement = null;
    }

    this.privacySettings.consentGiven = false;
    this.onAnalysisCallback = null;
  }

  // Privacy methods
  getPrivacySettings() {
    return { ...this.privacySettings };
  }

  isUserConsentGiven(): boolean {
    return this.privacySettings.consentGiven;
  }

  // Generate context for Gawin's responses
  generateVisionPromptContext(analysis: VisionAnalysis): string {
    if (!analysis.faceDetected) {
      return "I notice you're not currently visible in the camera.";
    }

    const contexts: string[] = [];

    if (analysis.emotions) {
      const emotion = analysis.emotions.dominant;
      const confidence = analysis.emotions.confidence;
      
      if (confidence > 0.6) {
        contexts.push(`You appear to be feeling ${emotion} (${Math.round(confidence * 100)}% confidence)`);
      }
    }

    if (analysis.attentionLevel) {
      const level = analysis.attentionLevel;
      if (level === 'high') {
        contexts.push("You seem fully engaged and attentive");
      } else if (level === 'low') {
        contexts.push("You appear to be distracted or multitasking");
      }
    }

    if (analysis.contextualCues.length > 0) {
      contexts.push(...analysis.contextualCues);
    }

    return contexts.length > 0 
      ? `[Vision Context: ${contexts.join(', ')}]`
      : '';
  }
}

export const visionService = new VisionService();