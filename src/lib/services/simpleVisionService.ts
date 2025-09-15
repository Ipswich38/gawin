/**
 * Simple Vision Service for Gawin
 * Just basic camera access - no complex AI models
 */

export interface SimpleVisionState {
  cameraEnabled: boolean;
  screenEnabled: boolean;
  stream: MediaStream | null;
  screenStream: MediaStream | null;
}

class SimpleVisionService {
  private state: SimpleVisionState = {
    cameraEnabled: false,
    screenEnabled: false,
    stream: null,
    screenStream: null
  };

  private callbacks: ((state: SimpleVisionState) => void)[] = [];

  // Subscribe to vision state changes
  subscribe(callback: (state: SimpleVisionState) => void) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  private notify() {
    this.callbacks.forEach(callback => callback({ ...this.state }));
  }

  // Enable camera
  async enableCamera(): Promise<boolean> {
    try {
      console.log('🎥 Requesting camera access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      this.state.stream = stream;
      this.state.cameraEnabled = true;
      
      console.log('✅ Camera enabled successfully');
      this.notify();
      return true;
    } catch (error) {
      console.error('❌ Camera access failed:', error);
      return false;
    }
  }

  // Disable camera
  disableCamera() {
    if (this.state.stream) {
      this.state.stream.getTracks().forEach(track => track.stop());
      this.state.stream = null;
    }
    this.state.cameraEnabled = false;
    console.log('📷 Camera disabled');
    this.notify();
  }

  // Enable screen capture
  async enableScreen(): Promise<boolean> {
    try {
      console.log('🖥️ Requesting screen capture...');
      
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      this.state.screenStream = stream;
      this.state.screenEnabled = true;
      
      console.log('✅ Screen capture enabled');
      this.notify();
      return true;
    } catch (error) {
      console.error('❌ Screen capture failed:', error);
      return false;
    }
  }

  // Disable screen capture
  disableScreen() {
    if (this.state.screenStream) {
      this.state.screenStream.getTracks().forEach(track => track.stop());
      this.state.screenStream = null;
    }
    this.state.screenEnabled = false;
    console.log('🖥️ Screen capture disabled');
    this.notify();
  }

  // Get current state
  getState(): SimpleVisionState {
    return { ...this.state };
  }

  // Check if camera is supported
  isCameraSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  // Check if screen capture is supported
  isScreenSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  }
}

export const simpleVisionService = new SimpleVisionService();