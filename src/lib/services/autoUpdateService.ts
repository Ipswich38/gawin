/**
 * Auto-Update Service for Gawin
 * Manages automatic updates without manual refresh
 */

class AutoUpdateService {
  private static instance: AutoUpdateService;
  private serviceWorker: ServiceWorker | null = null;
  private updateCallbacks: ((hasUpdate: boolean) => void)[] = [];
  private isChecking = false;
  private lastCheckTime = 0;
  private readonly CHECK_INTERVAL = 30000; // 30 seconds
  private messageChannel: MessageChannel | null = null;

  static getInstance(): AutoUpdateService {
    if (!AutoUpdateService.instance) {
      AutoUpdateService.instance = new AutoUpdateService();
    }
    return AutoUpdateService.instance;
  }

  /**
   * Initialize the auto-update system
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('🔧 Initializing auto-update service...');

      // Check if service workers are supported
      if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ Service workers not supported');
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('✅ Service worker registered successfully');

      // Set up message channel for communication
      this.setupMessageChannel();

      // Listen for service worker updates
      this.setupUpdateListeners(registration);

      // Start update checking
      await this.startUpdateChecking();

      console.log('🚀 Auto-update service initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize auto-update service:', error);
      return false;
    }
  }

  /**
   * Set up message channel for service worker communication
   */
  private setupMessageChannel() {
    this.messageChannel = new MessageChannel();

    // Listen for messages from service worker
    this.messageChannel.port1.onmessage = (event) => {
      const { type, data } = event.data;

      switch (type) {
        case 'UPDATE_CHECK_RESULT':
          this.handleUpdateCheckResult(data.hasUpdate);
          break;
        case 'VERSION_RESPONSE':
          console.log('📋 Current version:', data.version);
          break;
      }
    };

    // Send port to service worker
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(
        { type: 'INIT_CHANNEL' },
        [this.messageChannel.port2]
      );
    }
  }

  /**
   * Set up update event listeners
   */
  private setupUpdateListeners(registration: ServiceWorkerRegistration) {
    // Listen for service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, data } = event.data;

      switch (type) {
        case 'UPDATE_AVAILABLE':
          console.log('🆕 Update available!');
          this.handleUpdateAvailable();
          break;
        case 'FORCE_RELOAD':
          console.log('🔄 Force reload requested');
          this.forceReload();
          break;
      }
    });

    // Listen for new service worker waiting
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        console.log('🔄 New service worker installing...');

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('⏳ New service worker waiting to activate');
            this.handleUpdateAvailable();
          }
        });
      }
    });

    // Check if there's already a waiting service worker
    if (registration.waiting) {
      console.log('⏳ Service worker waiting to activate');
      this.handleUpdateAvailable();
    }
  }

  /**
   * Start periodic update checking
   */
  async startUpdateChecking(): Promise<void> {
    try {
      console.log('🔍 Starting automatic update checking...');

      // Send message to service worker to start checking
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'START_UPDATE_CHECK'
        });
      }

      this.isChecking = true;
      console.log('✅ Update checking started');

    } catch (error) {
      console.error('❌ Failed to start update checking:', error);
    }
  }

  /**
   * Stop update checking
   */
  stopUpdateChecking(): void {
    try {
      console.log('⏹️ Stopping update checking...');

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'STOP_UPDATE_CHECK'
        });
      }

      this.isChecking = false;
      console.log('✅ Update checking stopped');

    } catch (error) {
      console.error('❌ Failed to stop update checking:', error);
    }
  }

  /**
   * Manually check for updates
   */
  async checkForUpdate(): Promise<boolean> {
    try {
      if (!navigator.serviceWorker.controller) {
        console.warn('⚠️ No service worker controller available');
        return false;
      }

      console.log('🔍 Manually checking for updates...');

      // Create promise to wait for response
      return new Promise((resolve) => {
        const channel = new MessageChannel();

        // Set up response handler
        channel.port1.onmessage = (event) => {
          const { type, hasUpdate } = event.data;
          if (type === 'UPDATE_CHECK_RESULT') {
            resolve(hasUpdate);
          }
        };

        // Send check request
        navigator.serviceWorker.controller!.postMessage(
          { type: 'CHECK_UPDATE_NOW' },
          [channel.port2]
        );

        // Timeout after 10 seconds
        setTimeout(() => resolve(false), 10000);
      });

    } catch (error) {
      console.error('❌ Manual update check failed:', error);
      return false;
    }
  }

  /**
   * Handle update check result
   */
  private handleUpdateCheckResult(hasUpdate: boolean) {
    console.log('📋 Update check result:', hasUpdate ? 'Update available' : 'No update');

    if (hasUpdate) {
      this.handleUpdateAvailable();
    }

    // Notify callbacks
    this.updateCallbacks.forEach(callback => {
      try {
        callback(hasUpdate);
      } catch (error) {
        console.warn('Update callback error:', error);
      }
    });
  }

  /**
   * Handle when an update is available
   */
  private handleUpdateAvailable() {
    console.log('🆕 Handling available update...');

    // Show update notification
    this.showUpdateNotification();

    // Optionally auto-apply update after a delay
    setTimeout(() => {
      console.log('⚡ Auto-applying update...');
      this.applyUpdate();
    }, 5000); // Wait 5 seconds before auto-applying
  }

  /**
   * Show update notification to user
   */
  private showUpdateNotification() {
    try {
      // Create update notification element
      const notification = document.createElement('div');
      notification.id = 'gawin-update-notification';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        max-width: 320px;
        animation: slideIn 0.3s ease-out;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
      `;

      notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 24px;">🚀</div>
          <div>
            <div style="font-weight: 600; margin-bottom: 4px;">Update Available!</div>
            <div style="opacity: 0.9; font-size: 12px;">Gawin will refresh automatically in 5 seconds...</div>
          </div>
        </div>
      `;

      // Add animation styles
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);

      // Remove existing notification if any
      const existing = document.getElementById('gawin-update-notification');
      if (existing) {
        existing.remove();
      }

      document.body.appendChild(notification);

      // Auto-remove after 10 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.animation = 'slideIn 0.3s ease-out reverse';
          setTimeout(() => notification.remove(), 300);
        }
      }, 10000);

    } catch (error) {
      console.error('Failed to show update notification:', error);
    }
  }

  /**
   * Apply the available update
   */
  async applyUpdate(): Promise<void> {
    try {
      console.log('⚡ Applying update...');

      // Skip waiting and activate new service worker
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SKIP_WAITING'
        });
      }

      // Reload the page after a short delay
      setTimeout(() => {
        console.log('🔄 Reloading page for update...');
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('❌ Failed to apply update:', error);
    }
  }

  /**
   * Force reload the application
   */
  private forceReload(): void {
    console.log('🔄 Force reloading application...');
    window.location.reload();
  }

  /**
   * Add callback for update events
   */
  onUpdate(callback: (hasUpdate: boolean) => void): () => void {
    this.updateCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current update checking status
   */
  isUpdateCheckingActive(): boolean {
    return this.isChecking;
  }

  /**
   * Get last check time
   */
  getLastCheckTime(): number {
    return this.lastCheckTime;
  }
}

export const autoUpdateService = AutoUpdateService.getInstance();