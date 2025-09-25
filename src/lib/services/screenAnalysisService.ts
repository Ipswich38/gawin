/**
 * Screen Analysis Service for Gawin
 * Captures and analyzes screen share content in real-time
 */

export interface ScreenAnalysis {
  timestamp: number;
  description: string;
  confidence: number;
  elements?: string[];
  text?: string;
  activity?: string;
}

export interface ScreenCaptureState {
  isActive: boolean;
  stream: MediaStream | null;
  lastAnalysis: ScreenAnalysis | null;
  analysisHistory: ScreenAnalysis[];
}

class ScreenAnalysisService {
  private state: ScreenCaptureState = {
    isActive: false,
    stream: null,
    lastAnalysis: null,
    analysisHistory: []
  };

  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private video: HTMLVideoElement | null = null;
  private analysisInterval: NodeJS.Timeout | null = null;
  private callbacks: ((state: ScreenCaptureState) => void)[] = [];

  // Subscribe to state changes
  subscribe(callback: (state: ScreenCaptureState) => void) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  private notify() {
    this.callbacks.forEach(callback => callback({ ...this.state }));
  }

  // Start screen capture and analysis
  async startScreenCapture(): Promise<boolean> {
    try {
      console.log('🖥️ Starting screen capture with analysis...');

      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 2 } // Lower frame rate for better performance
        },
        audio: false
      });

      // Setup video element
      this.video = document.createElement('video');
      this.video.srcObject = stream;
      this.video.autoplay = true;
      this.video.muted = true;

      // Setup canvas for frame capture
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');

      // Wait for video to load
      await new Promise((resolve) => {
        if (this.video) {
          this.video.onloadedmetadata = resolve;
        }
      });

      // Set canvas size to match video
      if (this.video) {
        this.canvas!.width = this.video.videoWidth;
        this.canvas!.height = this.video.videoHeight;
      }

      this.state.stream = stream;
      this.state.isActive = true;

      // Handle stream end
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        this.stopScreenCapture();
      });

      // Start analysis loop (every 3 seconds)
      this.startAnalysisLoop();

      console.log('✅ Screen capture and analysis started');
      this.notify();
      return true;

    } catch (error) {
      console.error('❌ Screen capture failed:', error);
      return false;
    }
  }

  // Stop screen capture
  stopScreenCapture() {
    if (this.state.stream) {
      this.state.stream.getTracks().forEach(track => track.stop());
      this.state.stream = null;
    }

    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }

    if (this.video) {
      this.video.remove();
      this.video = null;
    }

    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
    }

    this.context = null;
    this.state.isActive = false;

    console.log('🛑 Screen capture stopped');
    this.notify();
  }

  // Start the analysis loop
  private startAnalysisLoop() {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }

    this.analysisInterval = setInterval(() => {
      this.captureAndAnalyzeFrame();
    }, 3000); // Analyze every 3 seconds

    // Also do an initial analysis
    setTimeout(() => this.captureAndAnalyzeFrame(), 1000);
  }

  // Capture current frame and analyze it
  private async captureAndAnalyzeFrame() {
    if (!this.video || !this.canvas || !this.context || !this.state.isActive) {
      return;
    }

    try {
      // Draw current video frame to canvas
      this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

      // Convert canvas to base64 image
      const imageData = this.canvas.toDataURL('image/jpeg', 0.7);

      // Send for analysis
      const analysis = await this.analyzeScreenContent(imageData);

      if (analysis) {
        this.state.lastAnalysis = analysis;
        this.state.analysisHistory.push(analysis);

        // Keep only last 20 analyses
        if (this.state.analysisHistory.length > 20) {
          this.state.analysisHistory = this.state.analysisHistory.slice(-20);
        }

        console.log('🔍 Screen analysis:', analysis.description);
        this.notify();
      }

    } catch (error) {
      console.error('❌ Frame capture failed:', error);
    }
  }

  // Send screen content to AI for analysis
  private async analyzeScreenContent(imageData: string): Promise<ScreenAnalysis | null> {
    try {
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Please analyze this screen capture image and describe what you see. Focus on:

1. What type of content or application is being shown
2. Any text that's visible and readable
3. What activity or task the user appears to be doing
4. Key UI elements or important information displayed

Provide a concise but detailed description of the screen content.

Image: ${imageData}`
          }],
          model: 'llama-vision-free', // Use vision model for image analysis
          temperature: 0.3
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis request failed');
      }

      const data = await response.json();
      const analysisText = data.choices?.[0]?.message?.content || '';

      return {
        timestamp: Date.now(),
        description: analysisText,
        confidence: 0.8, // Default confidence
        activity: this.extractActivity(analysisText),
        text: this.extractVisibleText(analysisText)
      };

    } catch (error) {
      console.error('❌ Screen analysis failed:', error);
      return null;
    }
  }

  // Extract activity from analysis text
  private extractActivity(text: string): string {
    const activityKeywords = [
      'browsing', 'reading', 'watching', 'coding', 'writing', 'gaming',
      'video call', 'presentation', 'document', 'spreadsheet', 'design'
    ];

    const lowerText = text.toLowerCase();
    for (const keyword of activityKeywords) {
      if (lowerText.includes(keyword)) {
        return keyword;
      }
    }

    return 'general computer use';
  }

  // Extract visible text mentions from analysis
  private extractVisibleText(text: string): string {
    const textMatch = text.match(/text[^.]*?["']([^"']+)["']/i);
    if (textMatch) {
      return textMatch[1];
    }

    const quotedMatch = text.match(/["']([^"']{10,})["']/);
    if (quotedMatch) {
      return quotedMatch[1];
    }

    return '';
  }

  // Get current state
  getState(): ScreenCaptureState {
    return { ...this.state };
  }

  // Get analysis summary for AI context
  getAnalysisSummary(): string {
    if (!this.state.isActive) {
      return "Screen sharing is not currently active.";
    }

    if (!this.state.lastAnalysis) {
      return "Screen sharing is active but no analysis available yet.";
    }

    const recentAnalyses = this.state.analysisHistory.slice(-3);
    const summary = recentAnalyses.map((analysis, index) => {
      const timeAgo = Math.round((Date.now() - analysis.timestamp) / 1000);
      return `${timeAgo}s ago: ${analysis.description}`;
    }).join('\n\n');

    return `SCREEN SHARING ACTIVE - Recent screen content:\n\n${summary}`;
  }

  // Get detailed context for conversation
  getDetailedContext(): string {
    if (!this.state.isActive) {
      return "I cannot see your screen right now. Please start screen sharing if you'd like me to see what you're working on.";
    }

    if (!this.state.lastAnalysis) {
      return "I can see your screen is being shared, but I'm still analyzing the content. Please wait a moment.";
    }

    const current = this.state.lastAnalysis;
    const timeAgo = Math.round((Date.now() - current.timestamp) / 1000);

    let context = `I can see your screen (last analyzed ${timeAgo} seconds ago). `;
    context += `Currently: ${current.description}`;

    if (current.activity && current.activity !== 'general computer use') {
      context += `. You appear to be ${current.activity}`;
    }

    if (current.text) {
      context += `. I can see text including: "${current.text}"`;
    }

    if (this.state.analysisHistory.length > 1) {
      context += `\n\nI've been watching your screen and have seen ${this.state.analysisHistory.length} different screen captures during this session.`;
    }

    return context;
  }

  // Check if supported
  isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  }
}

export const screenAnalysisService = new ScreenAnalysisService();